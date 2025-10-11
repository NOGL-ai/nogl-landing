export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters/patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
}

export function validateInput(input: string): boolean {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
  ];
  
  return !suspiciousPatterns.some((pattern) => pattern.test(input));
}

