import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Only callable by system/admin
  const user = await base44.auth.me().catch(() => null);
  if (user && user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

  // Get all reminders with alerts enabled and not yet sent
  const reminders = await base44.asServiceRole.entities.OccasionReminder.filter({ email_alert_enabled: true });

  let sent = 0;
  for (const reminder of reminders) {
    if (!reminder.date || !reminder.user_email) continue;
    
    const occasionDate = new Date(reminder.date);
    const daysUntil = Math.ceil((occasionDate - today) / (1000 * 60 * 60 * 24));
    const alertDays = reminder.alert_days_before || 7;

    // Check if today is the day to send the reminder
    if (daysUntil !== alertDays) continue;
    // Don't double-send
    if (reminder.reminder_sent && reminder.reminder_sent_date) {
      const sentDate = new Date(reminder.reminder_sent_date).toISOString().split('T')[0];
      if (sentDate === todayStr) continue;
    }

    const occasionFormatted = occasionDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: reminder.user_email,
      subject: `🔔 Reminder: ${reminder.name} is in ${alertDays} days!`,
      body: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fdf2f8;">
          <div style="background: white; border-radius: 24px; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎁</div>
            <h1 style="color: #2D1B4E; font-size: 24px; margin: 0 0 12px;">Don't forget!</h1>
            <p style="color: #374151; font-size: 16px; line-height: 1.7; margin-bottom: 8px;">
              <strong>${reminder.name}</strong> for <strong>${reminder.recipient_name}</strong> is on
            </p>
            <p style="color: #4A2D7A; font-size: 20px; font-weight: bold; margin-bottom: 24px;">${occasionFormatted}</p>
            <p style="color: #6B7280; font-size: 14px; margin-bottom: 32px;">
              That's only <strong>${alertDays} days away</strong> — create a personalised book now and make it truly special!
            </p>
            <a href="${Deno.env.get('VITE_APP_URL') || 'https://app.giftmybookuk.com'}/CreateBook" 
               style="background: linear-gradient(135deg, #D4A853, #F0D88A); color: #1a1a1a; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-size: 16px; font-weight: bold; display: inline-block;">
              Create Their Book ✨
            </a>
            <p style="color: #9CA3AF; font-size: 12px; margin-top: 32px;">GiftMyBookUK · Made with ❤️ in the UK 🇬🇧</p>
          </div>
        </div>
      `,
    });

    await base44.asServiceRole.entities.OccasionReminder.update(reminder.id, {
      reminder_sent: true,
      reminder_sent_date: new Date().toISOString(),
    });
    sent++;
  }

  return Response.json({ sent, checked: reminders.length });
});