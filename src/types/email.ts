export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface MagicLinkEmailParams {
  url: string;
  host: string;
  email: string;
} 