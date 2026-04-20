export const AdsEventsErrorCodes = {
  SCHEMA_INVALID: "SCHEMA_INVALID",
  SCHEMA_UNSUPPORTED: "SCHEMA_UNSUPPORTED",
  UNKNOWN_PLATFORM: "UNKNOWN_PLATFORM",
  SYNTHETIC_METRIC_DETECTED: "SYNTHETIC_METRIC_DETECTED",
  DUP_IGNORED: "DUP_IGNORED",
  ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  QUEUE_UNAVAILABLE: "QUEUE_UNAVAILABLE",
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
  SHADOW_SAMPLE: "SHADOW_SAMPLE",
} as const;

export type AdsEventsErrorCode =
  (typeof AdsEventsErrorCodes)[keyof typeof AdsEventsErrorCodes];

export class AdsEventsError extends Error {
  constructor(
    public readonly code: AdsEventsErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AdsEventsError";
  }
}
