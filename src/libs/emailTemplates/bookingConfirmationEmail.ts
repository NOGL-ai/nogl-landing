import { format } from 'date-fns';

interface BookingDetails {
  date: string;
  includeRecording: boolean;
  recordingCount: number;
  sessionName: string;
  participants: number;
  totalAmount: number;
}

interface BookingConfirmationParams {
  url: string;
  email: string;
  name?: string;
  bookingDetails: BookingDetails;
}

export function getBookingConfirmationEmail(params: BookingConfirmationParams) {
  const { url, email, name, bookingDetails } = params;

  const formattedDate = format(new Date(bookingDetails.date), 'EEEE, MMMM do, yyyy h:mm a');
  const userName = name ? name.trim() : '';

  return {
    subject: `📅 Your Booking Confirmation for ${bookingDetails.sessionName}`,
    html: `
      <div style="max-width:600px; margin:0 auto; padding:20px; font-family:Arial, sans-serif; color:#333;">
        <h1 style="color:#333; text-align:center;">${userName ? `Hello, ${userName}!` : 'Hello!'}</h1>
        
        <p style="color:#666; font-size:16px; line-height:1.5; margin:20px 0;">
          Thank you for booking <strong>${bookingDetails.sessionName}</strong> with us.
          We're excited to have you join!
        </p>
        
        <h2 style="color:#333;">🔎 Booking Details:</h2>
        <ul style="color:#666; font-size:16px; line-height:1.5; list-style:none; padding:0;">
          <li><strong>Date & Time:</strong> ${formattedDate}</li>
          <li><strong>Participants:</strong> ${bookingDetails.participants}</li>
          ${
            bookingDetails.includeRecording
              ? `<li><strong>Recordings:</strong> ${bookingDetails.recordingCount}</li>`
              : ''
          }
          <li><strong>Total Amount:</strong> €${bookingDetails.totalAmount.toFixed(2)}</li>
        </ul>
        
        <p style="color:#666; font-size:16px; line-height:1.5;">
          To access your booking details and manage your session, please click the button below:
        </p>
        
        <div style="text-align:center; margin:30px 0;">
          <a href="${url}"
             style="background-color:#FF5A1F; color:#ffffff; padding:12px 24px;
                    text-decoration:none; border-radius:5px; font-weight:bold; display:inline-block;"
             target="_blank" rel="noopener noreferrer">
            📄 View Your Booking
          </a>
        </div>
        
        <p style="color:#666; font-size:14px; margin-top:20px;">
          If you have any questions or need to make changes to your booking, please contact our support team.
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

Thank you for booking ${bookingDetails.sessionName} with us. We're excited to have you join!

Booking Details:
- Date & Time: ${formattedDate}
- Participants: ${bookingDetails.participants}
${
  bookingDetails.includeRecording
    ? `- Recordings: ${bookingDetails.recordingCount}`
    : ''
}
- Total Amount: €${bookingDetails.totalAmount.toFixed(2)}

To access your booking details and manage your session, please use the link below:
${url}

If you have any questions or need to make changes to your booking, please contact our support team.

Best regards,
The Nogl Team
`,
  };
} 