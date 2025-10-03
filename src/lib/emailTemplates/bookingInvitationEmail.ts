interface InvitationDetails {
	sessionName: string;
	date: string;
	inviterName: string;
	inviterEmail: string;
	participants: number;
	sessionDescription?: string;
	meetingLink?: string;
}

interface BookingInvitationParams {
	url: string;
	email: string;
	invitationDetails: InvitationDetails;
	name?: string;
}

export function getBookingInvitationEmail(params: BookingInvitationParams) {
	const { url, invitationDetails, name, email: _email } = params;

	// Sanitize URL
	const escapedUrl = url;
	const userName = name ? name.trim() : "";
	const invitationDate = new Date(invitationDetails.date).toLocaleDateString(
		"en-US",
		{
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}
	);

	return {
		subject: `🎯 You're Invited to Join: ${invitationDetails.sessionName}`,
		html: `
      <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;color:#333;">
        <h1 style="color:#333;text-align:center;">You're Invited${userName ? `, ${userName}` : ""}! 🎯</h1>
        
        <p style="color:#666;font-size:16px;line-height:1.5;margin:20px 0;">
          <strong>${invitationDetails.inviterName}</strong> has invited you to join an upcoming session on Nogl.ai.
        </p>
        
        <div style="background-color:#f0f8ff;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #007bff;">
          <h2 style="color:#007bff;margin-top:0;">📅 Session Details</h2>
          <p style="margin:5px 0;"><strong>Session:</strong> ${invitationDetails.sessionName}</p>
          <p style="margin:5px 0;"><strong>Date & Time:</strong> ${invitationDate}</p>
          <p style="margin:5px 0;"><strong>Invited by:</strong> ${invitationDetails.inviterName} (${invitationDetails.inviterEmail})</p>
          <p style="margin:5px 0;"><strong>Participants:</strong> ${invitationDetails.participants}</p>
          ${invitationDetails.sessionDescription ? `<p style="margin:5px 0;"><strong>Description:</strong> ${invitationDetails.sessionDescription}</p>` : ""}
        </div>
        
        <div style="text-align:center;margin:30px 0;">
          <a href="${escapedUrl}" 
             style="background-color:#007bff;color:#ffffff;padding:12px 24px;
                    text-decoration:none;border-radius:5px;font-weight:bold;display:inline-block;"
             target="_blank" rel="noopener noreferrer">
            🚀 Accept Invitation & Join Session
          </a>
        </div>
        
        <div style="background-color:#fff3cd;padding:15px;border-radius:5px;border-left:4px solid #ffc107;margin:20px 0;">
          <h3 style="color:#856404;margin-top:0;">💡 What to Expect</h3>
          <ul style="color:#666;margin:0;padding-left:20px;">
            <li>Click the button above to accept the invitation</li>
            <li>You'll be redirected to create an account or sign in</li>
            <li>Once confirmed, you'll receive a booking confirmation email</li>
            <li>Join the session at the scheduled time using the meeting link</li>
          </ul>
        </div>
        
        <p style="color:#666;font-size:14px;margin-top:20px;">
          If you're unable to attend or have any questions, please contact ${invitationDetails.inviterName} directly or reach out to our support team.
        </p>
        
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        
        <p style="color:#999;font-size:12px;text-align:center;word-break:break-all;">
          If the button doesn't work, copy and paste this link into your browser:<br />
          <a href="${escapedUrl}" style="color:#007bff;">${escapedUrl}</a>
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
		text: `You're Invited to Join: ${invitationDetails.sessionName}

${invitationDetails.inviterName} has invited you to join an upcoming session on Nogl.ai.

Session Details:
- Session: ${invitationDetails.sessionName}
- Date & Time: ${invitationDate}
- Invited by: ${invitationDetails.inviterName} (${invitationDetails.inviterEmail})
- Participants: ${invitationDetails.participants}
${invitationDetails.sessionDescription ? `- Description: ${invitationDetails.sessionDescription}` : ""}

Accept invitation and join: ${url}

What to Expect:
- Click the link above to accept the invitation
- You'll be redirected to create an account or sign in
- Once confirmed, you'll receive a booking confirmation email
- Join the session at the scheduled time using the meeting link

If you're unable to attend or have any questions, please contact ${invitationDetails.inviterName} directly or reach out to our support team at info@nogl.tech.

© ${new Date().getFullYear()} Nogl.ai . All rights reserved.
🇩🇪 Made in Germany`,
	};
}
