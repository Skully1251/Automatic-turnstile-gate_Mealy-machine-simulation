// Pure Mealy machine logic — nothing turnstile-specific

const K = (s, i) => s + '|' + i;

export const parseStates = (t) => [
  ...new Set(
    t
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  ),
];

export const parseSyms = (t) =>
  t
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const i = s.indexOf('=');
      return i < 0
        ? { sym: s, label: s }
        : { sym: s.slice(0, i).trim(), label: s.slice(i + 1).trim() };
    })
    .filter((x) => x.sym);

export function buildMachine(cfg) {
  const states = parseStates(cfg.states),
    inputs = parseSyms(cfg.inputs),
    outputs = parseSyms(cfg.outputs),
    errors = [],
    delta = {},
    trans = [];
  if (!states.length) errors.push('Define at least one state.');
  if (!inputs.length) errors.push('Define at least one input symbol.');
  if (!outputs.length) errors.push('Define at least one output symbol.');
  if (!states.includes(cfg.initial))
    errors.push('The initial state must be one of the states.');
  cfg.transitions.forEach((t, i) => {
    const n = 'Transition ' + (i + 1) + ': ';
    if (!states.includes(t.from) || !states.includes(t.to))
      return errors.push(n + 'choose valid states.');
    if (!inputs.some((x) => x.sym === t.input))
      return errors.push(n + 'choose a valid input.');
    if (!outputs.some((x) => x.sym === t.output))
      return errors.push(n + 'choose a valid output.');
    if (delta[K(t.from, t.input)])
      return errors.push(
        n +
          '(' +
          t.from +
          ', ' +
          t.input +
          ') is defined twice – a Mealy machine is deterministic.'
      );
    delta[K(t.from, t.input)] = { to: t.to, out: t.output };
    trans.push(t);
  });
  if (errors.length) return { errors };
  const warnings = [];
  states.forEach((s) =>
    inputs.forEach((i) => {
      if (!delta[K(s, i.sym)])
        warnings.push(
          'No transition for (' +
            s +
            ', ' +
            i.sym +
            ') – the machine halts there.'
        );
    })
  );
  return {
    states,
    inputs,
    outputs,
    initial: cfg.initial,
    delta,
    trans,
    warnings,
  };
}

export function tokenize(text, inputs) {
  const syms = inputs.map((i) => i.sym),
    out = [];
  const words = text.includes(',')
    ? text
        .split(',')
        .map((w) => w.trim())
        .filter(Boolean)
    : text.split(/\s+/).filter(Boolean);
  for (const w of words) {
    if (syms.includes(w)) out.push(w);
    else if (!text.includes(',') && [...w].every((c) => syms.includes(c)))
      out.push(...w);
    else out.push(w);
  }
  return out;
}

export function runMachine(m, toks) {
  let s = m.initial;
  const tr = [];
  for (const x of toks) {
    const d = m.delta[K(s, x)];
    if (!d) {
      tr.push({ from: s, input: x, to: s, out: null, ok: false });
      break;
    }
    tr.push({ from: s, input: x, to: d.to, out: d.out, ok: true });
    s = d.to;
  }
  return tr;
}
