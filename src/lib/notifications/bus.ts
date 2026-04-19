import { EventEmitter } from "events";

declare global {
  // eslint-disable-next-line no-var
  var __notificationBus: EventEmitter | undefined;
}

const bus: EventEmitter =
  globalThis.__notificationBus ??
  (() => {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(1000);
    return emitter;
  })();

if (process.env.NODE_ENV !== "production") {
  globalThis.__notificationBus = bus;
}

export type NotificationBusEvent = {
  channel: string;
  payload: unknown;
};

export function channelForUser(userId: string) {
  return `notifications:${userId}`;
}

export function publish(channel: string, payload: unknown) {
  bus.emit(channel, payload);
}

export function subscribe(
  channel: string,
  listener: (payload: unknown) => void,
) {
  bus.on(channel, listener);
  return () => bus.off(channel, listener);
}
