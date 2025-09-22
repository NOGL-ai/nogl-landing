export function slugifyUsername(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphen
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens
}

export async function generateUniqueUsername(
  baseUsername: string,
  checkUnique: (username: string) => Promise<boolean>
): Promise<string> {
  let username = slugifyUsername(baseUsername);
  let counter = 1;
  let isUnique = await checkUnique(username);

  while (!isUnique) {
    username = `${slugifyUsername(baseUsername)}-${counter}`;
    isUnique = await checkUnique(username);
    counter++;
  }

  return username;
} 