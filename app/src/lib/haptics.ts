import { isNative, nativeVibrate } from './native';

export function tap(ms = 8) {
  try {
    if (isNative) { nativeVibrate(ms); return; }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(ms);
  } catch {
    /* no haptics on this device */
  }
}

export function success() {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([10, 40, 14]);
  } catch {
    /* ignore */
  }
}
