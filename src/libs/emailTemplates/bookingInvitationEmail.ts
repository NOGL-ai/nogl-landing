import { format } from 'date-fns';

interface BookingDetails {
  date: string;
  includeRecording: boolean;
  recordingCount: number;
  sessionName: string;
  participants: number;
  totalAmount: number;
  primaryParticipantName?: string;
}

interface BookingInvitationParams {
  url: string;
  email: string;
  name?: string;
  bookingDetails: BookingDetails;
}

export function getBookingInvitationEmail(params: BookingInvitationParams) {
  const { url, email, name, bookingDetails } = params;

  const formattedDate = format(new Date(bookingDetails.date), 'EEEE, MMMM do, yyyy h:mm a');
  const userName = name ? name.trim() : '';
  const inviterName = bookingDetails.primaryParticipantName || 'a colleague';

  return {
    subject: `🎟️ You're Invited: ${bookingDetails.sessionName}`,
    html: `
      <div style="max-width:600px; margin:0 auto; padding:20px; font-family:Arial, sans-serif; color:#333;">
        <h1 style="color:#333; text-align:center;">${userName ? `Hello, ${userName}!` : 'Hello!'}</h1>
        
        <p style="color:#666; font-size:16px; line-height:1.5; margin:20px 0;">
          ${inviterName} has invited you to join the <strong>${bookingDetails.sessionName}</strong>.
          We're excited to have you participate!
        </p>
        
        <h2 style="color:#333;">🔎 Session Details:</h2>
        <ul style="color:#666; font-size:16px; line-height:1.5; list-style:none; padding:0;">
          <li><strong>Date & Time:</strong> ${formattedDate}</li>
          <li><strong>Total Participants:</strong> ${bookingDetails.participants}</li>
          ${
            bookingDetails.includeRecording
              ? `<li><strong>Recordings Available:</strong> Yes (${bookingDetails.recordingCount})</li>`
              : ''
          }
        </ul>
        
        <p style="color:#666; font-size:16px; line-height:1.5;">
          To access the session details and accept the invitation, please click the button below:
        </p>
        
        <div style="text-align:center; margin:30px 0;">
          <a href="${url}"
             style="background-color:#FF5A1F; color:#ffffff; padding:12px 24px;
                    text-decoration:none; border-radius:5px; font-weight:bold; display:inline-block;"
             target="_blank" rel="noopener noreferrer">
            🎫 Accept Invitation
          </a>
        </div>
        
        <p style="color:#666; font-size:14px; margin-top:20px;">
          If you have any questions, please contact our support team.
        </p>
        
        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
        
        <p style="color:#999; font-size:12px; text-align:center; word-break:break-all;">
          If the button doesn't work, copy and paste this link into your browser:<br />
          <a href="${url}" style="color:#FF5A1F;">${url}</a>
        </p>
        
        <p style="color:#999; font-size:12px; text-align:center; margin-top:20px;">
          For any inquiries, please contact <a href="mailto:support@nogl.tech" style="color:#FF5A1F;">support@nogl.tech</a>.
        </p>
        
        <footer style="text-align:center; color:#999; font-size:12px; margin-top:20px;">
          <p style="margin:0;">&copy; ${new Date().getFullYear()} Nogl.ai. All rights reserved.</p>
          <p style="margin:0;">🇩🇪 Made in Germany</p>
        </footer>
      </div>
    `,
    text: `
${userName ? `Hello, ${userName}!` : 'Hello!'}

${inviterName} has invited you to join the ${bookingDetails.sessionName}. We're excited to have you participate!

Session Details:
- Date & Time: ${formattedDate}
- Total Participants: ${bookingDetails.participants}
${
  bookingDetails.includeRecording
    ? `- Recordings Available: Yes (${bookingDetails.recordingCount})`
    : ''
}

To access the session details and accept the invitation, please use the link below:
${url}

If you have any questions, please contact our support team.

Best regards,
The Nogl Team
`,
  };
} 