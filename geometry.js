// BetonKibelPlus — geometria kosza (kibla).
// Objętość liczona numerycznie z przekroju A(y) na wysokości y od dna,
// więc podziałka (ile m³ na jakiej wysokości) jest dokładna dla każdego kształtu.

export const SHAPES = {
  cone: {
    label: 'Okrągły zwężany (ścięty stożek)',
    hint: 'Mierz od środka: średnica przy krawędzi, średnica przy dnie / zasuwie, wysokość wnętrza.',
    fields: [['dTop', 'Średnica u góry (cm)', 110], ['dBottom', 'Średnica na dole (cm)', 55], ['h', 'Wysokość wnętrza (cm)', 100]],
  },
  cylcone: {
    label: 'Okrągły: proste ścianki + stożek na dole',
    hint: 'Część prosta u góry, niżej lejek do wylewu. Wysokości mierz osobno.',
    fields: [['d', 'Średnica części prostej (cm)', 110], ['hCyl', 'Wysokość części prostej (cm)', 55], ['hCone', 'Wysokość lejka (cm)', 45], ['dOut', 'Średnica wylewu (cm)', 30]],
  },
  rect: {
    label: 'Prostokątny / kanciasty',
    hint: 'Wymiary wnętrza u góry i na dole. Dla prostych ścianek wpisz te same wymiary.',
    fields: [['lTop', 'Długość u góry (cm)', 120], ['wTop', 'Szerokość u góry (cm)', 80], ['lBottom', 'Długość na dole (cm)', 80], ['wBottom', 'Szerokość na dole (cm)', 40], ['h', 'Wysokość wnętrza (cm)', 90]],
  },
  cylinder: {
    label: 'Okrągły prosty (walec)',
    hint: 'Średnica wnętrza i wysokość.',
    fields: [['d', 'Średnica (cm)', 90], ['h', 'Wysokość wnętrza (cm)', 90]],
  },
  profile: {
    label: 'Profil ze zdjęcia',
    hint: 'Kształt odczytany ze zdjęcia z boku (góra, ewentualnie początek lejka, wylew).',
    fields: [],
    hidden: true,
  },
  plate: {
    label: 'Bez mierzenia — tylko tabliczka',
    hint: 'Wpisz pojemność z tabliczki. Podziałka będzie orientacyjna (typowy kibel zwężany).',
    fields: [],
  },
};

const num = v => { const n = Number(String(v ?? '').replace(',', '.').trim()); return Number.isFinite(n) ? n : NaN };
const lerp = (a, b, t) => a + (b - a) * t;

export function cleanDims(shape, raw) {
  const def = SHAPES[shape]; if (!def) return null;
  if (shape === 'profile') { const ok = raw && Array.isArray(raw.hs) && Array.isArray(raw.ds) && raw.hs.length === raw.ds.length && raw.hs.length >= 2 && raw.h > 0; return ok ? raw : null }
  const out = {};
  for (const [k] of def.fields) {
    const v = num(raw?.[k]);
    if (!(v > 0 && v < 500)) return null;
    out[k] = v;
  }
  const e = num(raw?.e);
  if (e > 0.3 && e < 3 && Math.abs(e - 1) > 0.01) out.e = e;
  return out;
}

export function totalHeight(shape, d) {
  if (shape === 'cylcone') return d.hCyl + d.hCone;
  return d.h;
}

/** Średnica zastępcza [cm] na wysokości y (do rysunku). */
export function diameterAt(shape, d, y) { return 2 * Math.sqrt(areaAt(shape, d, y) / Math.PI) }

/** Pole przekroju [cm²] na wysokości y [cm] od dna. */
export function areaAt(shape, d, y) {
  const H = totalHeight(shape, d);
  const t = Math.min(1, Math.max(0, y / H));
  const e = d.e > 0 ? d.e : 1; // owalny kosz: głębokość / szerokość (ze zdjęcia z góry)
  switch (shape) {
    case 'cone': { const r = lerp(d.dBottom, d.dTop, t) / 2; return Math.PI * r * r * e }
    case 'cylinder': { const r = d.d / 2; return Math.PI * r * r * e }
    case 'cylcone': {
      if (y >= d.hCone) { const r = d.d / 2; return Math.PI * r * r * e }
      const r = lerp(d.dOut, d.d, Math.max(0, y) / d.hCone) / 2; return Math.PI * r * r * e;
    }
    case 'rect': return lerp(d.lBottom, d.lTop, t) * lerp(d.wBottom, d.wTop, t);
    case 'profile': {
      const at = arr => { if (y <= d.hs[0]) return arr[0]; for (let i = 1; i < d.hs.length; i++) if (y <= d.hs[i]) return lerp(arr[i - 1], arr[i], (y - d.hs[i - 1]) / Math.max(1e-9, d.hs[i] - d.hs[i - 1])); return arr[arr.length - 1] };
      const w = at(d.ds), dp = Array.isArray(d.dd) && d.dd.length === d.ds.length ? at(d.dd) : null;
      if (dp != null) return d.rect ? w * dp : Math.PI / 4 * w * dp;     // dwa widoki: przód × bok
      return d.rect ? w * w * e : Math.PI * (w / 2) ** 2 * e;
    }
    default: return 0;
  }
}

/** Tablica objętości: ys [cm], vs [m³], całkowanie Simpsonem. */
export function volumeTable(shape, d, steps = 400) {
  const H = totalHeight(shape, d);
  const ys = [0], vs = [0];
  const dy = H / steps;
  let acc = 0;
  for (let i = 0; i < steps; i++) {
    const y0 = i * dy, y1 = y0 + dy;
    acc += dy / 6 * (areaAt(shape, d, y0) + 4 * areaAt(shape, d, (y0 + y1) / 2) + areaAt(shape, d, y1));
    ys.push(y1); vs.push(acc / 1e6);
  }
  return { H, ys, vs };
}

/** Objętość [m³] od dna do wysokości y [cm]. */
export function volumeUpTo(shape, d, y) {
  const t = volumeTable(shape, d); const { ys, vs } = t;
  if (y >= t.H) return vs[vs.length - 1]; if (y <= 0) return 0;
  const i = Math.min(ys.length - 2, Math.floor(y / t.H * (ys.length - 1)));
  return lerp(vs[i], vs[i + 1], (y - ys[i]) / (ys[i + 1] - ys[i]));
}

export function geoCapacity(shape, d) {
  if (!d || !SHAPES[shape] || shape === 'plate') return null;
  const t = volumeTable(shape, d);
  return t.vs[t.vs.length - 1];
}

function heightFor(table, v) {
  const { ys, vs } = table;
  if (v <= 0) return 0;
  if (v >= vs[vs.length - 1]) return ys[ys.length - 1];
  let lo = 0, hi = vs.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (vs[m] < v) lo = m; else hi = m }
  const f = (v - vs[lo]) / Math.max(1e-12, vs[hi] - vs[lo]);
  return lerp(ys[lo], ys[hi], f);
}

// Typowy kibel zwężany (proporcje) — dla trybu ręcznego i „tylko tabliczka”.
const TYPICAL = { dTop: 110, dBottom: 55, h: 100 };

/**
 * Model kosza do podziałki.
 * profile: { shape, dims, capacity }  (capacity = pojemność użytkowa z tabliczki lub geometrii)
 * Zwraca: capacity, measured, fullHeightCm, heightCm(v), fraction(v) (0..1 wysokości pełnego poziomu).
 */
export function bucketModel(profile, fallbackCapacity) {
  let shape = profile?.shape, dims = profile?.dims;
  const capacity = Number(profile?.capacity) > 0 ? Number(profile.capacity) : Number(fallbackCapacity) || 0.5;
  let measured = !!(dims && SHAPES[shape] && shape !== 'plate');
  if (!measured) {
    const base = volumeTable('cone', TYPICAL);
    const k = Math.cbrt(capacity / base.vs[base.vs.length - 1]);
    shape = 'cone'; dims = { dTop: TYPICAL.dTop * k, dBottom: TYPICAL.dBottom * k, h: TYPICAL.h * k };
  }
  const table = volumeTable(shape, dims);
  const geo = table.vs[table.vs.length - 1];
  // Tabliczka zwykle podaje pojemność do linii napełnienia — poniżej krawędzi.
  // Jeżeli jest większa niż geometria (błąd pomiaru), skalujemy proporcjonalnie.
  const scale = capacity > geo * 1.0001 ? capacity / geo : 1;
  const heightCm = v => heightFor(table, Math.max(0, Math.min(capacity, v)) / scale);
  const fullHeightCm = heightCm(capacity);
  return {
    capacity, measured, shape, dims, geoCapacity: geo, totalHeightCm: table.H, fullHeightCm,
    heightCm,
    diamAt: y => diameterAt(shape, dims, y),
    fraction: v => fullHeightCm > 0 ? heightCm(v) / fullHeightCm : 0,
    /** odwrotność fraction: ułamek wysokości pełnego poziomu → m³ */
    volumeAtFraction: f => {
      const y = Math.max(0, Math.min(1, f)) * fullHeightCm;
      const { ys, vs } = table;
      let lo = 0, hi = ys.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ys[m] < y) lo = m; else hi = m }
      const t = (y - ys[lo]) / Math.max(1e-12, ys[hi] - ys[lo]);
      return Math.min(capacity, lerp(vs[lo], vs[hi], t) * scale);
    },
    /** ile cm od górnej krawędzi do poziomu betonu */
    belowRimCm: v => table.H - heightCm(v),
  };
}

/** Migracja starych profili (wersja ≤ 3.0). */
export function migrateProfile(p) {
  if (!p || p.dims || p.shape === 'plate') return p;
  const d = p.dimensions;
  if (p.shape === 'cylinder' && d) return { ...p, shape: 'cylinder', dims: { d: d.top, h: d.height } };
  if (d && d.top && d.bottom && d.height) return { ...p, shape: 'cone', dims: { dTop: d.top, dBottom: d.bottom, h: d.height } };
  return { ...p, shape: 'plate', dims: null };
}
