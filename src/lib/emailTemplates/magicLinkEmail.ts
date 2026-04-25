interface MagicLinkParams {
	url: string;
	host: string;
	email: string;
	name?: string;
}

const PASSWORD_SIGNIN_URL =
	process.env.NEXTAUTH_URL?.replace(/\/$/, "")
		? `${process.env.NEXTAUTH_URL.replace(/\/$/, "")}/en/auth/signin`
		: "https://app.nogl.tech/en/auth/signin";

export function getMagicLinkEmail(params: MagicLinkParams) {
	const { url, name, email: _email } = params;

	// URL is already signed by NextAuth — render verbatim.
	const escapedUrl = url;
	const userName = name ? name.trim() : "";

	return {
		subject: `Your nogl signin link`,
		html: `
      <div style="max-width:600px;margin:0 auto;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#181d27;background:#ffffff;">
        <h1 style="font-size:22px;font-weight:600;color:#181d27;margin:0 0 12px;">
          Hi${userName ? ` ${userName}` : ""},
        </h1>

        <p style="color:#414651;font-size:15px;line-height:1.55;margin:0 0 20px;">
          Click the button below to sign in to nogl. This link expires in 15 minutes.
        </p>

        <div style="text-align:center;margin:28px 0;">
          <a href="${escapedUrl}"
             style="background-color:#6941c6;color:#ffffff;padding:12px 24px;
                    text-decoration:none;border-radius:8px;font-weight:600;
                    font-size:15px;display:inline-block;"
             target="_blank" rel="noopener noreferrer">
            Sign in to nogl
          </a>
        </div>

        <p style="color:#535862;font-size:14px;line-height:1.55;margin:24px 0 8px;">
          Prefer to use your password? You can also sign in at
          <a href="${PASSWORD_SIGNIN_URL}" style="color:#6941c6;text-decoration:none;font-weight:500;">${PASSWORD_SIGNIN_URL}</a>.
        </p>

        <p style="color:#717680;font-size:13px;line-height:1.5;margin:16px 0 0;">
          If you did not request this email, you can safely ignore it.
        </p>

        <hr style="border:none;border-top:1px solid #e9eaeb;margin:24px 0;" />

        <p style="color:#717680;font-size:12px;line-height:1.5;word-break:break-all;margin:0 0 8px;">
          If the button doesn't work, copy and paste this link into your browser:<br />
          <a href="${escapedUrl}" style="color:#6941c6;">${escapedUrl}</a>
        </p>

        <footer style="text-align:center;color:#a4a7ae;font-size:12px;margin-top:24px;">
          <p style="margin:0;">&mdash; nogl team</p>
          <p style="margin:4px 0 0;">&copy; ${new Date().getFullYear()} Nogl.ai &middot; Made in Germany</p>
        </footer>
      </div>
    `,
		text: `Hi${userName ? ` ${userName}` : ""},

Click this link to sign in to nogl:
${url}

Or sign in with your password at: ${PASSWORD_SIGNIN_URL}

This link expires in 15 minutes.

If you did not request this email, you can safely ignore it.

— nogl team`,
	};
}
