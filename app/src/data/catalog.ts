import { clipUrl, thumbUrl } from '../lib/video';

/** Genres are plain strings. */
export type Genre = string;

export type Series = {
  id: string;
  title: string;
  genre: Genre;
  tags: string[];
  episodes: number;
  rating: number;
  likes: number;
  status: 'Ongoing' | 'Completed';
  freeUpTo: number;
  synopsis: string;
  cast: string[];
  kids: boolean;
  year: number;
  cover?: number;
  clips?: number[];
  glow: string;
  art: string;
  people?: { a: string; b: string };
};

export const GENRES: Genre[] = ['Romance', 'Revenge', 'CEO', 'Fantasy', 'Family', 'Suspense', 'Comedy', 'Historical'];

const TINTS = ['#3b1f6b', '#5a1235', '#0f3b4a', '#4a2a0a', '#1f2a5a', '#3a0f2a', '#173a2a', '#3a2a10'];
export const GENRE_TINT: Record<string, string> = {
  Romance: '#3a1e2a',
  Revenge: '#2e1a24',
  CEO: '#17283a',
  Fantasy: '#2a2236',
  Family: '#3a3218',
  Suspense: '#1c3328',
  Comedy: '#2f2a12',
  Historical: '#3a1f1a',
};

const ART = {
  heir: 'radial-gradient(ellipse at 50% 32%, rgba(255,176,150,.45) 0%, rgba(255,176,150,0) 52%), radial-gradient(ellipse at 15% 100%, #7a2e52 0%, rgba(122,46,82,0) 60%), linear-gradient(180deg, #4a1f3a 0%, #12060f 100%)',
  bride: 'radial-gradient(circle at 50% 34%, #ffe9df 0%, #ffe9df 15%, rgba(255,233,223,0) 16%), linear-gradient(180deg, #c9788a 0%, #3a1a2a 100%)',
  revenge: 'linear-gradient(160deg, rgba(255,40,60,.55) 0%, rgba(255,40,60,0) 50%), repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0 2px, rgba(255,255,255,0) 2px 10px), linear-gradient(180deg, #2a0a10 0%, #0a0305 100%)',
  ceo: 'repeating-linear-gradient(90deg, rgba(0,0,0,.45) 0 5px, rgba(0,0,0,0) 5px 18px), radial-gradient(ellipse at 50% 100%, #f2b441 0%, rgba(242,180,65,0) 60%), linear-gradient(180deg, #101a3a 0%, #05070f 100%)',
  moonlit: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0) 27%, rgba(255,255,255,.75) 27.8%, rgba(255,255,255,0) 29%), radial-gradient(circle at 50% 30%, #7c86ff 0%, rgba(124,134,255,0) 36%), linear-gradient(180deg, #161d52 0%, #05060f 100%)',
  heiress: 'radial-gradient(circle at 50% 42%, #f2c14e 0%, #f2c14e 14%, rgba(242,193,78,0) 15%), linear-gradient(180deg, #3a1b5c 0%, #0b0716 100%)',
  runaway: 'radial-gradient(ellipse at 25% 90%, #ff6a3d 0%, rgba(255,106,61,0) 55%), linear-gradient(200deg, #4a1410 0%, #120505 100%)',
  night: 'linear-gradient(180deg, rgba(255,255,255,0) 58%, rgba(255,255,255,.22) 58.5%, rgba(255,255,255,0) 60%), linear-gradient(180deg, #0f5b66 0%, #031a1e 100%)',
  paper: 'radial-gradient(circle at 70% 30%, #fff4e5 0%, #fff4e5 18%, rgba(255,244,229,0) 19%), radial-gradient(circle at 30% 65%, #e9a27f 0%, #e9a27f 12%, rgba(233,162,127,0) 13%), linear-gradient(180deg, #f1d7bd 0%, #c98a6a 100%)',
  dragon: 'radial-gradient(circle at 75% 20%, #e6ff5c 0%, rgba(230,255,92,0) 40%), linear-gradient(160deg, #365a1e 0%, #0c160a 100%)',
  signal: 'radial-gradient(circle at 50% 50%, #ff3b3b 0%, #ff3b3b 6%, rgba(255,59,59,0) 7%), repeating-linear-gradient(0deg, #1c1c1c 0 1px, #2b2b2b 1px 3px)',
  ironwood: 'repeating-linear-gradient(90deg, rgba(0,0,0,.5) 0 5px, rgba(0,0,0,0) 5px 22px), linear-gradient(180deg, #2c4a2a 0%, #0a0f09 100%)',
  midnight: 'linear-gradient(115deg, rgba(255,255,255,0) 48%, rgba(255,255,255,.35) 49%, rgba(255,255,255,0) 51%), linear-gradient(135deg, #10305c 0%, #050a14 100%)',
  lumen: 'radial-gradient(circle at 50% 60%, #dffbff 0%, rgba(223,251,255,0) 45%), linear-gradient(180deg, #2a7c8c 0%, #071e24 100%)',
  dust: 'radial-gradient(circle at 50% 48%, #ffe08a 0%, #ffe08a 16%, rgba(255,224,138,0) 17%), linear-gradient(180deg, #f0a64a 0%, #f0a64a 55%, #7a3e1b 55%, #4a2410 100%)',
  saltwater: 'repeating-linear-gradient(90deg, rgba(0,0,0,.45) 0 5px, rgba(0,0,0,0) 5px 18px), radial-gradient(ellipse at 50% 100%, #ff3da6 0%, rgba(255,61,166,0) 60%), linear-gradient(180deg, #23103f 0%, #070312 100%)',
};

/** The placeholder catalogue: fictional titles, CSS poster art, free Mixkit clips as the episodes. */
export const SERIES: Series[] = [
  { id: 'heir', title: 'Married to the Heir', genre: 'Romance', tags: ['Contract marriage', 'Billionaire', 'Slow burn'], episodes: 80, rating: 8.4, likes: 12400, status: 'Ongoing', freeUpTo: 10, synopsis: 'Elena signs a marriage contract to save her family\'s company, then discovers her new husband wrote a second one that she never saw.', cast: ['Amara Okafor', 'Jonas Lindqvist', 'Priya Raman'], kids: false, year: 2026, cover: 1168, clips: [1168, 1186, 1181, 1187, 1173], glow: 'rgba(255,120,140,.55)', art: ART.heir, people: { a: 'Elena', b: 'Adrian' } },
  { id: 'bride', title: 'The Substitute Bride', genre: 'Romance', tags: ['Secret identity', 'Wedding', 'Twins'], episodes: 60, rating: 7.9, likes: 9800, status: 'Completed', freeUpTo: 8, synopsis: 'Mara takes her sister\'s place at the altar for one night. The groom already knows, and he has plans of his own.', cast: ['Leila Haddad', 'Theo Marchetti'], kids: false, year: 2025, cover: 1187, clips: [1187, 1181, 1168, 1170], glow: 'rgba(255,200,210,.5)', art: ART.bride, people: { a: 'Mara', b: 'Julian' } },
  { id: 'revenge', title: 'Her Silent Revenge', genre: 'Revenge', tags: ['Comeback', 'Betrayal', 'Corporate'], episodes: 90, rating: 8.1, likes: 15600, status: 'Ongoing', freeUpTo: 10, synopsis: 'Thrown out of the family she built, Isla returns five years later with a new name, a new company and a list.', cast: ['Nadia Petrov', 'Malik Osei', 'Hana Sato'], kids: false, year: 2026, cover: 1232, clips: [1232, 1968, 1197, 1178], glow: 'rgba(255,60,90,.5)', art: ART.revenge, people: { a: 'Isla', b: 'Victor' } },
  { id: 'ceo', title: 'Second Chance CEO', genre: 'CEO', tags: ['Ex-lovers', 'Office', 'Reunion'], episodes: 60, rating: 8.0, likes: 8700, status: 'Completed', freeUpTo: 10, synopsis: 'The intern who was fired on her first day comes back as the new CEO. The man who fired her is now her assistant.', cast: ['Sofia Reyes', 'Daniel Achebe'], kids: false, year: 2025, cover: 1197, clips: [1197, 1166, 1164, 51500], glow: 'rgba(242,180,65,.5)', art: ART.ceo, people: { a: 'Sofia', b: 'Daniel' } },
  { id: 'moonlit', title: 'Moonlit Contract', genre: 'Romance', tags: ['Fake dating', 'Heir', 'Coastal'], episodes: 72, rating: 8.2, likes: 11200, status: 'Ongoing', freeUpTo: 10, synopsis: 'A struggling lighthouse keeper agrees to pose as a tycoon\'s fiancee for one summer. The tide has other ideas.', cast: ['June Park', 'Elias Brandt'], kids: false, year: 2026, cover: 1164, clips: [1164, 51500, 1214, 1197], glow: 'rgba(124,134,255,.6)', art: ART.moonlit, people: { a: 'June', b: 'Elias' } },
  { id: 'heiress', title: 'The Forgotten Heiress', genre: 'Revenge', tags: ['Amnesia', 'Inheritance', 'Family secrets'], episodes: 90, rating: 7.8, likes: 7400, status: 'Ongoing', freeUpTo: 8, synopsis: 'She woke up with no memory and a stranger\'s name. The family that buried her fortune is about to remember her.', cast: ['Rhea Mehta', 'Caspian Vale'], kids: false, year: 2026, cover: 1191, clips: [1191, 1170, 1968, 1173], glow: 'rgba(242,193,78,.5)', art: ART.heiress, people: { a: 'Vera', b: 'Rowan' } },
  { id: 'runaway', title: 'Runaway Heart', genre: 'Romance', tags: ['Road trip', 'Runaway bride', 'Summer'], episodes: 64, rating: 8.3, likes: 10100, status: 'Completed', freeUpTo: 10, synopsis: 'Nell leaves her own wedding with a stranger\'s motorcycle and a map to a town that no longer exists.', cast: ['Nell Ambrose', 'Kit Farrow'], kids: false, year: 2025, cover: 1214, clips: [1214, 1170, 1191, 1166], glow: 'rgba(255,106,61,.55)', art: ART.runaway, people: { a: 'Nell', b: 'Kit' } },
  { id: 'night', title: 'The Night Shift', genre: 'Suspense', tags: ['Hospital', 'Mystery', 'Ticking clock'], episodes: 48, rating: 7.7, likes: 6200, status: 'Completed', freeUpTo: 6, synopsis: 'Every patient admitted after midnight remembers the same corridor. The new nurse starts counting the doors.', cast: ['Ada Lin', 'Marcus Bell'], kids: false, year: 2025, cover: 1968, clips: [1968, 1232, 1178, 1197], glow: 'rgba(120,200,220,.45)', art: ART.night, people: { a: 'Ada', b: 'Marcus' } },
  { id: 'paper', title: 'Paper Moons', genre: 'Family', tags: ['Sisters', 'Small town', 'Feel-good'], episodes: 40, rating: 8.6, likes: 13900, status: 'Completed', freeUpTo: 40, synopsis: 'Two sisters reopen their grandmother\'s paper-lantern shop and find a letter tucked into every lantern.', cast: ['Mina Okoro', 'Lucia Ferrante'], kids: true, year: 2024, cover: 1170, clips: [1170, 1191, 1186, 1181], glow: 'rgba(255,205,150,.55)', art: ART.paper, people: { a: 'Mina', b: 'Lucia' } },
  { id: 'dragon', title: 'Dragon\'s Bride', genre: 'Fantasy', tags: ['Kingdom', 'Prophecy', 'Enemies to lovers'], episodes: 70, rating: 8.0, likes: 9100, status: 'Ongoing', freeUpTo: 10, synopsis: 'To end a war, a healer is married to the mountain\'s guardian. He is not the monster the songs describe.', cast: ['Wren Calloway', 'Oren Vasquez'], kids: true, year: 2026, cover: 51501, clips: [51501, 1173, 1178, 51500], glow: 'rgba(160,230,90,.5)', art: ART.dragon, people: { a: 'Wren', b: 'Oren' } },
  { id: 'signal', title: 'Signal Lost', genre: 'Suspense', tags: ['Thriller', 'Radio', 'Isolated'], episodes: 50, rating: 7.5, likes: 5400, status: 'Completed', freeUpTo: 6, synopsis: 'A late-night radio host receives calls from a listener who describes tomorrow\'s news.', cast: ['Ivy Chen', 'Robert Kane'], kids: false, year: 2024, cover: 1178, clips: [1178, 1968, 1232, 1164], glow: 'rgba(255,80,80,.45)', art: ART.signal, people: { a: 'Ivy', b: 'Robert' } },
  { id: 'ironwood', title: 'Ironwood', genre: 'Suspense', tags: ['Forest', 'Inheritance', 'Secrets'], episodes: 56, rating: 7.6, likes: 4800, status: 'Completed', freeUpTo: 6, synopsis: 'A forester inherits a cabin, a rifle and a locked room. The town insists the room has always been empty.', cast: ['Bram Holt', 'Selene Aird'], kids: false, year: 2024, cover: 1173, clips: [1173, 51501, 1178, 1187], glow: 'rgba(120,220,120,.4)', art: ART.ironwood, people: { a: 'Bram', b: 'Selene' } },
  { id: 'midnight', title: 'Midnight Run', genre: 'Suspense', tags: ['Chase', 'City', 'One night'], episodes: 44, rating: 7.9, likes: 6900, status: 'Completed', freeUpTo: 6, synopsis: 'A courier has until sunrise to deliver a package she was told never to open. She opened it.', cast: ['Zara Quinn', 'Leo Marsh'], kids: false, year: 2025, cover: 1166, clips: [1166, 1164, 1232, 1197], glow: 'rgba(90,140,255,.5)', art: ART.midnight, people: { a: 'Zara', b: 'Leo' } },
  { id: 'lumen', title: 'Lumen', genre: 'Fantasy', tags: ['Sea', 'Magic', 'Coming of age'], episodes: 36, rating: 8.1, likes: 7100, status: 'Completed', freeUpTo: 36, synopsis: 'Every full moon, the water off Lumen glows, and one girl can hear what it is saying.', cast: ['Nia Solano', 'Pax Whitlock'], kids: true, year: 2024, cover: 51500, clips: [51500, 1164, 1214, 1166], glow: 'rgba(120,240,255,.5)', art: ART.lumen, people: { a: 'Nia', b: 'Pax' } },
  { id: 'dust', title: 'Dust Devils', genre: 'Comedy', tags: ['Desert', 'Siblings', 'Road trip'], episodes: 30, rating: 7.4, likes: 3900, status: 'Completed', freeUpTo: 30, synopsis: 'Three siblings, one broken van, and a wedding at the other end of the desert.', cast: ['Tomas Reyes', 'Bea Reyes', 'Cal Reyes'], kids: true, year: 2023, cover: 1186, clips: [1186, 1170, 1191, 1181], glow: 'rgba(255,190,90,.55)', art: ART.dust, people: { a: 'Bea', b: 'Tomas' } },
  { id: 'saltwater', title: 'Saltwater', genre: 'Historical', tags: ['1920s', 'Harbor', 'Forbidden love'], episodes: 52, rating: 7.8, likes: 6100, status: 'Completed', freeUpTo: 8, synopsis: 'In a 1920s harbor town, a lighthouse heiress falls for the smuggler her father is paid to catch.', cast: ['Odette Larue', 'Silas Crane'], kids: false, year: 2025, cover: 1181, clips: [1181, 1214, 1164, 1197], glow: 'rgba(255,61,166,.45)', art: ART.saltwater, people: { a: 'Odette', b: 'Silas' } },
];

export const TOP_SEARCHES = ['Married to the Heir', 'Her Silent Revenge', 'Dragon\'s Bride', 'Moonlit Contract', 'Second Chance CEO'];
export const genreTint = (g: string) => GENRE_TINT[g] || TINTS[[...g].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 0) % TINTS.length | 0] || TINTS[0];
export const byId = (id: string) => SERIES.find((s) => s.id === id);

export const posterUrl = (s: Series) => (s.cover ? thumbUrl(s.cover) : '');
export const backdropUrl = posterUrl;

export type EpisodeSource = { src: string; poster: string; start: number; end?: number; seekable: boolean; loop: boolean };
/** Where episode `ep` of a title plays from: one of its placeholder clips, looping. */
export function episodeSource(s: Series, ep: number): EpisodeSource {
  const clip = clipFor(s, ep);
  return { src: clipUrl(clip), poster: thumbUrl(clip), start: 0, seekable: true, loop: true };
}

const EP_TITLES = ['The Second Contract', 'Parallax', 'What the Tide Knows', 'A Door Left Open', 'The Long Silence', 'Ash and Honey', 'Borrowed Name', 'Midnight Signature', 'Paper Promises', 'Nine Years Later', 'The Other Sister', 'Glass Houses', 'Salt in the Wound', 'Lanterns', 'Every Locked Room', 'First Light', 'The Price of Quiet', 'Counting Doors', 'Unsigned', 'Someone Else\'s Wedding', 'The Last Call', 'Blue Hour', 'A Kinder Lie', 'The Empty Chair'];

const CAPTIONS = [
  '{a} finds the second contract, and it has her signature on it.',
  '{b} makes a call nobody can take back.',
  'A second letter arrives. Same handwriting, different year.',
  '{a} learns who really paid for the wedding.',
  'The board meets at midnight. {b} is not invited.',
  '{a} says yes, but only for one night.',
  'Someone has been living in the locked room.',
  '{b} finally tells the truth. {a} already knew.',
  'The photograph in the drawer is dated tomorrow.',
  '{a} chooses the road nobody takes.',
  'The rain stops. The argument does not.',
  '{b} keeps the promise. It costs him everything.',
];

export function epTitle(s: Series, ep: number) {
  return EP_TITLES[(ep + s.title.length) % EP_TITLES.length];
}
export function epCaption(s: Series, ep: number) {
  const who = s.people || { a: 'She', b: 'He' };
  return CAPTIONS[(ep * 7 + s.id.length) % CAPTIONS.length].replace('{a}', who.a).replace('{b}', who.b);
}
export function clipFor(s: Series, ep: number) {
  const clips = s.clips && s.clips.length ? s.clips : [1232];
  return clips[(ep - 1) % clips.length];
}


export function searchSeries(q: string, kids: boolean) {
  const t = q.trim().toLowerCase();
  const pool = SERIES.filter((s) => !kids || s.kids);
  if (!t) return [];
  return pool
    .map((s) => {
      let score = 0;
      if (s.title.toLowerCase().includes(t)) score += 10;
      if (s.title.toLowerCase().startsWith(t)) score += 5;
      if (s.genre.toLowerCase().includes(t)) score += 4;
      if (s.tags.some((x) => x.toLowerCase().includes(t))) score += 3;
      if (s.cast.some((x) => x.toLowerCase().includes(t))) score += 3;
      if (s.synopsis.toLowerCase().includes(t)) score += 1;
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.s.rating - a.s.rating)
    .map((x) => x.s);
}

export const NOTIFICATIONS = [
  { id: 'n1', icon: 'film', title: 'New episodes of Married to the Heir', body: 'EP 79 and EP 80 are out now.', at: Date.now() - 2 * 3600_000 },
  { id: 'n2', icon: 'coin', title: '80 bonus coins expire in 3 days', body: 'Use them on any locked episode before they are gone.', at: Date.now() - 8 * 3600_000 },
  { id: 'n3', icon: 'gift', title: 'Your check-in streak is waiting', body: 'Day 3 pays 15 coins. Do not break the streak.', at: Date.now() - 26 * 3600_000 },
  { id: 'n4', icon: 'crown', title: 'VIP: 7 days free', body: 'Every episode unlocked, no ads. Try it free this week.', at: Date.now() - 3 * 86_400_000 },
  { id: 'n5', icon: 'film', title: 'Dragon\'s Bride just got a new season', body: 'Episodes 61 to 70 are live.', at: Date.now() - 5 * 86_400_000 },
] as const;
