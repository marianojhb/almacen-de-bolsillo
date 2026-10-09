export type JourneyColor = { hue: number; saturation: number; brightness: number };
export const clampColor = (value: number) => Math.max(0, Math.min(1, value));

export function journeyColorToHex({ hue, saturation, brightness }: JourneyColor) {
  const h = ((hue % 360) + 360) % 360 / 60;
  const s = clampColor(saturation);
  const v = clampColor(brightness);
  const c = v * s;
  const x = c * (1 - Math.abs(h % 2 - 1));
  const m = v - c;
  const sectors = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]];
  return "#" + sectors[Math.floor(h)].map((channel) => Math.round((channel + m) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function hexToJourneyColor(hex: string): JourneyColor {
  const safe = /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : "2563EB";
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(safe.slice(index, index + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const sector = delta === 0 ? 0 : max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return { hue: ((sector * 60) + 360) % 360, saturation: max === 0 ? 0 : delta / max, brightness: max };
}
