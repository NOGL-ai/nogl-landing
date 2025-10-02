export function absoluteUrl(path: string) {
	  return `${process.env.SITE_URL || "http://nogl.ai:3000"}${path}`;
}
