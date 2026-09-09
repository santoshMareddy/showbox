/**
 * The Android app runs this same web build inside a WebView and exposes a small bridge on
 * `window.AndroidHost`. In a browser the bridge is absent and every call here is a no-op, so the
 * app behaves exactly as before.
 */
type Bridge = {
  platform(): string;
  appVersion(): string;
  setSecure(on: boolean): void;
  setKeepAwake(on: boolean): void;
  vibrate(ms: number): void;
};

const bridge: Bridge | undefined =
  typeof window === 'undefined' ? undefined : (window as unknown as { AndroidHost?: Bridge }).AndroidHost;

export const isNative = !!bridge;

export function nativeVersion(): string {
  try { return bridge?.appVersion() ?? ''; } catch { return ''; }
}

/** FLAG_SECURE: the OS itself refuses screenshots and screen recording while this is on. */
export function setSecure(on: boolean): void {
  try { bridge?.setSecure(on); } catch { /* browser */ }
}

/** Keeps the screen awake while an episode is playing. */
export function setKeepAwake(on: boolean): void {
  try { bridge?.setKeepAwake(on); } catch { /* browser */ }
}

export function nativeVibrate(ms: number): void {
  try { bridge?.vibrate(ms); } catch { /* browser */ }
}
