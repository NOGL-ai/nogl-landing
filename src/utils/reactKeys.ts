export function makeKey(...parts: Array<string | number | undefined | null>) {
  return parts.filter(p => p !== undefined && p !== null).join('__');
}
