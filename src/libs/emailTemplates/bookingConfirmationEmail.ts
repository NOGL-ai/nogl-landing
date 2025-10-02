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
  bookingDetails: BookingDetails;
  name?: string;
}

export function getBookingConfirmationEmail(params: BookingConfirmationParams) {
  const { url, email, bookingDetails, name } = params;

  // Sanitize URL
  const escapedUrl = url;
  const userName = name ? name.trim() : "";
  const bookingDate = new Date(bookingDetails.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    subject: `🎉 Booking Confirmation - Your Session is Confirmed!`,
    html: `
      <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;color:#333;">
        <h1 style="color:#333;text-align:center;">Booking Confirmed${userName ? `, ${userName}` : ""}! 🎉</h1>
        
        <p style="color:#666;font-size:16px;line-height:1.5;margin:20px 0;">
          Great news! Your booking has been successfully confirmed. We're excited to have you join us.
        </p>
        
        <div style="background-color:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
          <h2 style="color:#333;margin-top:0;">📅 Booking Details</h2>
          <p style="margin:5px 0;"><strong>Session:</strong> ${bookingDetails.sessionName}</p>
          <p style="margin:5px 0;"><strong>Date & Time:</strong> ${bookingDate}</p>
          <p style="margin:5px 0;"><strong>Participants:</strong> ${bookingDetails.participants}</p>
          ${bookingDetails.includeRecording ? `<p style="margin:5px 0;"><strong>Recording:</strong> Included (${bookingDetails.recordingCount} recording${bookingDetails.recordingCount !== 1 ? 's' : ''})</p>` : ''}
          ${bookingDetails.totalAmount > 0 ? `<p style="margin:5px 0;"><strong>Total Amount:</strong> $${bookingDetails.totalAmount.toFixed(2)}</p>` : ''}
        </div>
        
        <div style="text-align:center;margin:30px 0;">
          <a href="${escapedUrl}" 
             style="background-color:#28a745;color:#ffffff;padding:12px 24px;
                    text-decoration:none;border-radius:5px;font-weight:bold;display:inline-block;"
             target="_blank" rel="noopener noreferrer">
            🚀 Access Your Session
          </a>
        </div>
        
        <div style="background-color:#e7f3ff;padding:15px;border-radius:5px;border-left:4px solid #007bff;margin:20px 0;">
          <h3 style="color:#007bff;margin-top:0;">📝 What's Next?</h3>
          <ul style="color:#666;margin:0;padding-left:20px;">
            <li>You'll receive a reminder email 24 hours before your session</li>
            <li>Make sure to test your camera and microphone beforehand</li>
            <li>Join the session using the link above at the scheduled time</li>
            ${bookingDetails.includeRecording ? '<li>Your session recording will be available after completion</li>' : ''}
          </ul>
        </div>
        
        <p style="color:#666;font-size:14px;margin-top:20px;">
          If you need to reschedule or have any questions, please don't hesitate to contact us.
        </p>
        
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        
        <p style="color:#999;font-size:12px;text-align:center;word-break:break-all;">
          If the button doesn't work, copy and paste this link into your browser:<br />
          <a href="${escapedUrl}" style="color:#28a745;">${escapedUrl}</a>
        </p>
        
        <p style="color:#999;font-size:12px;text-align:center;margin-top:20px;">
          For any questions, please contact <a href="mailto:info@nogl.tech" style="color:#FF5A1F;">info@nogl.tech</a>.
        </p>
        
        <footer style="text-align:center;color:#999;font-size:12px;margin-top:20px;">
          <p style="margin:0;">&copy; ${new Date().getFullYear()} Nogl.ai . All rights reserved.</p>
          <p style="margin:0;">🇩🇪 Made in Germany</p>
        </footer>
      </div>
    `,
    text: `Booking Confirmation - Your Session is Confirmed!

Session: ${bookingDetails.sessionName}
Date & Time: ${bookingDate}
Participants: ${bookingDetails.participants}
${bookingDetails.includeRecording ? `Recording: Included (${bookingDetails.recordingCount} recording${bookingDetails.recordingCount !== 1 ? 's' : ''})` : ''}
${bookingDetails.totalAmount > 0 ? `Total Amount: $${bookingDetails.totalAmount.toFixed(2)}` : ''}

Access your session: ${url}

What's Next?
- You'll receive a reminder email 24 hours before your session
- Make sure to test your camera and microphone beforehand
- Join the session using the link above at the scheduled time
${bookingDetails.includeRecording ? '- Your session recording will be available after completion' : ''}

If you need to reschedule or have any questions, please contact us at info@nogl.tech.

© ${new Date().getFullYear()} Nogl.ai . All rights reserved.
🇩🇪 Made in Germany`,
  };
}
