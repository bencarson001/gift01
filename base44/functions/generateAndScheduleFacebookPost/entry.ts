import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FB_PAGE_ACCESS_TOKEN = Deno.env.get("FB_PAGE_ACCESS_TOKEN");
const FB_PAGE_ID = Deno.env.get("FB_PAGE_ID");

const OCCASIONS = [
  "birthday", "anniversary", "baby", "wedding", "roast", "graduation",
  "mothers_day", "fathers_day", "christmas", "valentines", "retirement", "new_home"
];

const OCCASION_LABELS = {
  birthday: "Birthday Books", anniversary: "Anniversary Books", baby: "New Baby Books",
  wedding: "Wedding Books", roast: "Roast Books", graduation: "Graduation Books",
  mothers_day: "Mother's Day Books", fathers_day: "Father's Day Books",
  christmas: "Christmas Books", valentines: "Valentine's Books",
  retirement: "Retirement Books", new_home: "New Home Books"
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both scheduled automation (no auth) and manual admin trigger
    let isAdmin = false;
    try {
      const user = await base44.auth.me();
      isAdmin = user?.role === 'admin';
    } catch {
      // Called from automation — allow
      isAdmin = true;
    }

    if (!isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const manualOccasion = body.occasion;
    const publishNow = body.publish_now === true;

    // Pick a random occasion (or use provided)
    const occasion = manualOccasion || OCCASIONS[Math.floor(Math.random() * OCCASIONS.length)];
    const occasionLabel = OCCASION_LABELS[occasion] || occasion;

    // Get site URL
    const siteUrl = "https://giftmybookuk.com";

    // Generate post text with AI
    const postResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a social media manager for GiftMyBookUK — a UK website that creates AI-powered personalised gift books for any occasion.

Write a compelling Facebook post to promote our ${occasionLabel}.

Rules:
- Write in British English
- 2-3 short paragraphs max
- Include 3-5 relevant emojis naturally placed
- End with a clear CTA linking to: ${siteUrl}
- Mention personalised, AI-generated, unique gift
- Tone: warm, exciting, genuine — NOT salesy
- Include 3-5 relevant hashtags at the end
- Keep it under 200 words total

Occasion focus: ${occasionLabel}
Current month context: ${new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' })}`,
      response_json_schema: {
        type: "object",
        properties: {
          post_text: { type: "string" },
          image_prompt: { type: "string", description: "Detailed prompt for generating a Facebook post image in watercolour style" }
        }
      }
    });

    const postText = postResult.post_text;
    const imagePrompt = postResult.image_prompt || `Beautiful watercolour illustration for a personalised ${occasionLabel} gift book, warm colours, magical UK style, no text`;

    // Generate post image
    let imageUrl = null;
    try {
      const imgResult = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: imagePrompt
      });
      imageUrl = imgResult.url;
    } catch (imgErr) {
      console.log("Image generation failed, continuing without image:", imgErr.message);
    }

    // Determine schedule time
    let scheduledFor;
    if (publishNow) {
      scheduledFor = new Date().toISOString();
    } else {
      // Schedule 3 days from now at 10am
      const d = new Date();
      d.setDate(d.getDate() + 3);
      d.setHours(10, 0, 0, 0);
      scheduledFor = d.toISOString();
    }

    // Save to database
    const post = await base44.asServiceRole.entities.ScheduledPost.create({
      platform: "facebook",
      post_text: postText,
      image_url: imageUrl,
      scheduled_for: scheduledFor,
      status: publishNow ? "scheduled" : "scheduled",
      occasion_theme: occasion,
      ai_generated: true
    });

    // If publish_now, also post to Facebook if credentials exist
    let fbResult = null;
    if (publishNow && FB_PAGE_ACCESS_TOKEN && FB_PAGE_ID) {
      try {
        const fbBody = new FormData();
        fbBody.append("message", postText);
        if (imageUrl) fbBody.append("url", imageUrl);
        fbBody.append("access_token", FB_PAGE_ACCESS_TOKEN);

        const endpoint = imageUrl
          ? `https://graph.facebook.com/v18.0/${FB_PAGE_ID}/photos`
          : `https://graph.facebook.com/v18.0/${FB_PAGE_ID}/feed`;

        const fbRes = await fetch(endpoint, { method: "POST", body: fbBody });
        fbResult = await fbRes.json();

        if (fbResult.id) {
          await base44.asServiceRole.entities.ScheduledPost.update(post.id, {
            status: "posted",
            post_id: fbResult.id
          });
        } else {
          await base44.asServiceRole.entities.ScheduledPost.update(post.id, {
            status: "failed",
            error_message: JSON.stringify(fbResult.error || fbResult)
          });
        }
      } catch (fbErr) {
        await base44.asServiceRole.entities.ScheduledPost.update(post.id, {
          status: "failed",
          error_message: fbErr.message
        });
      }
    }

    return Response.json({
      success: true,
      post_id: post.id,
      occasion,
      post_text: postText,
      image_url: imageUrl,
      scheduled_for: scheduledFor,
      facebook_result: fbResult
    });

  } catch (error) {
    console.error("Error in generateAndScheduleFacebookPost:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});