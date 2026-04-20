import { EventEmitter } from "events";

// In-process pub/sub for real-time alert delivery.
// Single-node only — sufficient for dev and small deployments.
// Replace with Redis pub/sub (ioredis) when horizontal scaling is needed.

const bus = new EventEmitter();
bus.setMaxListeners(200);

export function publishAlert(channel: string, payload: string): void {
  bus.emit(channel, payload);
}

export function subscribeAlert(
  channel: string,
  listener: (payload: string) => void,
): () => void {
  bus.on(channel, listener);
  return () => bus.off(channel, listener);
}

export function alertChannel(companyId: string, audience: string): string {
  return `alerts:${companyId}:${audience}`;
}
