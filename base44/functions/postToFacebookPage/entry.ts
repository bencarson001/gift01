import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { message, image_url, link, title } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const token = Deno.env.get('FACEBOOK_BUSINESS_TOKEN');
    if (!token) {
      return Response.json({ error: 'Facebook token not configured' }, { status: 500 });
    }

    // Facebook Page ID (you may need to add this as a secret or config)
    // For now, we'll make it configurable via request
    const pageId = Deno.env.get('FACEBOOK_PAGE_ID') || '1234567890'; // Replace with actual page ID

    // Build the post data
    const postData = new URLSearchParams();
    postData.append('message', message);
    if (image_url) {
      postData.append('picture', image_url);
      // Facebook requires a link when posting an image
      postData.append('link', link || 'https://giftmybookuk.com');
    }
    if (link) postData.append('link', link);
    if (title) postData.append('name', title);
    postData.append('access_token', token);

    // Post to Facebook Graph API
    const response = await fetch(
      `https://graph.facebook.com/v25.0/${pageId}/feed`,
      {
        method: 'POST',
        body: postData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: 'Failed to post to Facebook', details: result },
        { status: 400 }
      );
    }

    // Log the successful post
    await base44.asServiceRole.entities.ScheduledPost.create({
      platform: 'facebook',
      post_text: message,
      image_url: image_url || null,
      status: 'posted',
      post_id: result.id,
    });

    return Response.json({
      success: true,
      post_id: result.id,
      message: 'Successfully posted to Facebook Page',
    });
  } catch (error) {
    console.error('Facebook post error:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
});