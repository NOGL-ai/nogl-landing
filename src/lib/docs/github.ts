const GITHUB_REPO = process.env.GITHUB_REPO ?? 'nogl-ai/nogl-landing';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? 'main';

/**
 * Build the GitHub edit URL for a docs page.
 * @param docPath e.g. "en/fractional-cfo/core-features/forecasting"
 */
export function buildEditUrl(docPath: string): string {
  return `https://github.com/${GITHUB_REPO}/edit/${GITHUB_BRANCH}/content/docs/${docPath}.mdx`;
}
