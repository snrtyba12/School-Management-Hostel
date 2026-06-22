const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// While testing without a verified domain, Resend only delivers
// to the email address you signed up with. Once you verify a
// domain, change this to something like 'Yabatech Hostel <noreply@yourdomain.ng>'
const FROM_ADDRESS = 'Yabatech Hostel <onboarding@resend.dev>';

async function sendReplyEmail({ to, subject, replyBody, originalMessage }) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c9952a;">Yabatech Student Hostel</h2>
          <p>${replyBody.replace(/\n/g, '<br/>')}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #888; font-size: 13px;">
            <strong>Your original message:</strong><br/>
            ${originalMessage}
          </p>
        </div>
      `,
    });
    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Email send failed:', err);
    return { success: false, error: err };
  }
}

async function sendApplicationStatusEmail({ to, firstName, status, roomType, session }) {
  const isApproved = status === 'approved';
  const subject = isApproved
    ? 'Your Hostel Application Has Been Approved! 🎉'
    : 'Update on Your Hostel Application';

  const html = isApproved
    ? `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c9952a;">Application Approved 🎉</h2>
        <p>Hi ${firstName},</p>
        <p>Good news! Your application for a <strong>${roomType}</strong> room
        (${session} session) has been <strong>approved</strong>.</p>
        <p>Please log in to your student dashboard to view your room assignment details.</p>
        <p>We look forward to having you with us.</p>
        <p>— Yabatech Student Hostel Team</p>
      </div>
    `
    : `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c9952a;">Application Update</h2>
        <p>Hi ${firstName},</p>
        <p>We're writing to inform you that your application for a
        <strong>${roomType}</strong> room (${session} session) was not
        successful at this time.</p>
        <p>If you have any questions, please contact the hostel office.</p>
        <p>— Yabatech Student Hostel Team</p>
      </div>
    `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('Email send failed:', err);
    return { success: false, error: err };
  }
}

module.exports = { sendReplyEmail, sendApplicationStatusEmail };