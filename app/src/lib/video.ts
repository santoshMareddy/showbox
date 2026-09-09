export const clipUrl = (id: number) => `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`;
export const thumbUrl = (id: number) => `https://assets.mixkit.co/videos/${id}/${id}-thumb-720-0.jpg`;

const warmed = new Set<string>();
/** Warm the browser cache for the next clip without attaching it to the DOM. */
export function warmClip(url: string) {
  if (warmed.has(url)) return;
  warmed.add(url);
  try {
    const v = document.createElement('video');
    v.preload = 'auto';
    v.muted = true;
    v.src = url;
    v.load();
    setTimeout(() => {
      v.removeAttribute('src');
      v.load();
    }, 15000);
  } catch {
    /* ignore */
  }
}
