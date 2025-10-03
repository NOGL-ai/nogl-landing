interface MagicLinkParams {
	url: string;
	host: string;
	email: string;
	name?: string;
}

export function getMagicLinkEmail(params: MagicLinkParams) {
	const { url, host, name, email: _email } = params;

	// Sanitize URL without double-encoding
	const escapedUrl = url; // Remove encodeURI since the URL is already encoded
	const escapedHost = host.replace(/\./g, "&#8203;.");
	const userName = name ? name.trim() : "";

	return {
		subject: `🔒 Secure sign-in to Nogl.ai`,
		html: `
      <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;color:#333;">
        <h1 style="color:#333;text-align:center;">Welcome to Nogl.ai${userName ? `, ${userName}` : ""}!</h1>
        
        <p style="color:#666;font-size:16px;line-height:1.5;margin:20px 0;">
          You're receiving this email because we received a sign-in request for your account.
          To securely sign in, click the button below within 24 hours.
        </p>
        
        <div style="text-align:center;margin:30px 0;">
          <a href="${escapedUrl}" 
             style="background-color:#FF5A1F;color:#ffffff;padding:12px 24px;
                    text-decoration:none;border-radius:5px;font-weight:bold;display:inline-block;"
             target="_blank" rel="noopener noreferrer">
            🔑 Sign in to Nogl.ai
          </a>
        </div>
        
        <p style="color:#666;font-size:14px;margin-top:20px;">
          If you did not request this email, no further action is required. You can safely ignore this email.
        </p>
        
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        
        <p style="color:#999;font-size:12px;text-align:center;word-break:break-all;">
          If the button doesn't work, copy and paste this link into your browser:<br />
          <a href="${escapedUrl}" style="color:#FF5A1F;">${escapedUrl}</a>
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
		text: `Sign in to ${escapedHost}\n\nClick this link to sign in to your account:\n${url}\n\nIf you didn't request this email, you can safely ignore it.`,
	};
}
