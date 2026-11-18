// SVG diagram layout geometry

export const NR = 36;
export const W = 760;
export const H = 540;

export const ease = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export function layout(m) {
  const n = m.states.length,
    cx = W / 2,
    cy = H / 2,
    pos = {};
  if (n === 1) pos[m.states[0]] = { x: cx, y: cy };
  else if (n === 2)
    m.states.forEach(
      (s, i) => (pos[s] = { x: cx + (i ? 210 : -210), y: cy })
    );
  else
    m.states.forEach((s, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      pos[s] = { x: cx + 200 * Math.cos(a), y: cy + 150 * Math.sin(a) };
    });
  const th = (P) =>
    Math.hypot(P.x - cx, P.y - cy) < 1
      ? -Math.PI / 2
      : Math.atan2(P.y - cy, P.x - cx);
  const dr = (a) => ({ x: Math.cos(a), y: Math.sin(a) }),
    add = (P, d, r) => ({ x: P.x + d.x * r, y: P.y + d.y * r });
  const nrm = (A, B) => {
    const l = Math.hypot(B.x - A.x, B.y - A.y) || 1;
    return { x: (B.x - A.x) / l, y: (B.y - A.y) / l };
  };
  const groups = {};
  m.trans.forEach((t) => {
    const k = t.from + '>' + t.to;
    (groups[k] = groups[k] || {
      from: t.from,
      to: t.to,
      items: [],
    }).items.push(t);
  });
  const edges = Object.values(groups).map((g) => {
    const P = pos[g.from],
      Q = pos[g.to],
      c = g.items.length,
      key = g.from + '>' + g.to;
    if (g.from === g.to) {
      const t = th(P),
        o = dr(t),
        s = add(P, dr(t - 0.5), NR),
        e = add(P, dr(t + 0.5), NR + 4),
        c1 = add(P, dr(t - 0.75), NR + 95),
        c2 = add(P, dr(t + 0.75), NR + 95);
      const at = (u) => {
        const k = 1 - u;
        return {
          x:
            k * k * k * s.x +
            3 * k * k * u * c1.x +
            3 * k * u * u * c2.x +
            u * u * u * e.x,
          y:
            k * k * k * s.y +
            3 * k * k * u * c1.y +
            3 * k * u * u * c2.y +
            u * u * u * e.y,
        };
      };
      return {
        ...g,
        key,
        at,
        path: `M${s.x},${s.y}C${c1.x},${c1.y} ${c2.x},${c2.y} ${e.x},${e.y}`,
        lp: add(at(0.5), o, 10 + c * 7),
      };
    }
    const hh = groups[g.to + '>' + g.from] ? 42 : 0,
      dx = Q.x - P.x,
      dy = Q.y - P.y,
      L = Math.hypot(dx, dy) || 1,
      v = { x: -dy / L, y: dx / L };
    const C = {
        x: (P.x + Q.x) / 2 + v.x * 2 * hh,
        y: (P.y + Q.y) / 2 + v.y * 2 * hh,
      },
      s = add(P, nrm(P, C), NR),
      e = add(Q, nrm(Q, C), NR + 4);
    const at = (u) => {
      const k = 1 - u;
      return {
        x: k * k * s.x + 2 * k * u * C.x + u * u * e.x,
        y: k * k * s.y + 2 * k * u * C.y + u * u * e.y,
      };
    };
    return {
      ...g,
      key,
      at,
      path: `M${s.x},${s.y}Q${C.x},${C.y} ${e.x},${e.y}`,
      lp: add(at(0.5), v, 12 + c * 7),
    };
  });
  const sd = dr(th(pos[m.initial]) + 1.6),
    sp = pos[m.initial];
  return {
    pos,
    edges,
    start: { a: add(sp, sd, NR + 58), b: add(sp, sd, NR + 4) },
  };
}
