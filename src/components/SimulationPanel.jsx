import { useState, useEffect, useRef, useMemo } from 'react';
import { tokenize, runMachine } from '../machine';
import Stat from './Stat';

export default function SimulationPanel({ machine, onView }) {
  const [seq, setSeq] = useState(machine.inputs.map((i) => i.sym).join(' ') + ' ' + machine.inputs.map((i) => i.sym).join(' ')),
    [pos, setPos] = useState(0),
    [ai, setAi] = useState(-1),
    [p, setP] = useState(0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(1);
  const sp = useRef(1);
  sp.current = speed;

  const toks = useMemo(
    () => tokenize(seq, machine.inputs),
    [seq, machine]
  );
  const trace = useMemo(() => runMachine(machine, toks), [machine, toks]);
  const bad = toks.filter(
    (t) => !machine.inputs.some((i) => i.sym === t)
  );

  const reset = () => {
    setPos(0);
    setAi(-1);
    setP(0);
    setPlaying(false);
  };

  const start = (i) => {
    if (!trace[i].ok) {
      setPos(i + 1);
      return;
    }
    setP(0);
    setAi(i);
  };

  useEffect(() => {
    if (ai < 0) return;
    let raf,
      t0 = null;
    const f = (ts) => {
      if (t0 === null) t0 = ts;
      const q = Math.min(1, ((ts - t0) * sp.current) / 1100);
      setP(q);
      if (q >= 1) {
        setPos(ai + 1);
        setAi(-1);
      } else raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [ai]);

  useEffect(() => {
    if (!playing || ai >= 0) return;
    if (pos >= trace.length) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => start(pos), 250 / sp.current);
    return () => clearTimeout(t);
  }, [playing, pos, ai, trace]);

  const done = trace.slice(0, pos),
    moving = ai >= 0,
    cur = done.length ? done[done.length - 1].to : machine.initial;
  const step = moving
    ? trace[ai]
    : done.length
      ? done[done.length - 1]
      : null;
  const shown = moving ? (p < 0.9 ? step.from : step.to) : cur;
  const outs = done.filter((t) => t.ok).map((t) => t.out),
    halted = done.length && !done[done.length - 1].ok,
    finished = !halted && pos >= toks.length && toks.length > 0;

  useEffect(() => {
    onView({ shown, step, moving, p });
  });

  const idle = ai < 0,
    atEnd = pos >= trace.length;
  const lab = (list, s) =>
    (list.find((x) => x.sym === s) || {}).label || s;

  return (
    <section className="card space-y-4">
      <h2 className="text-lg font-bold">Simulation</h2>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="lbl">Input sequence</label>
          <input
            className="inp font-mono"
            value={seq}
            placeholder={'e.g. ' + machine.inputs.map((i) => i.sym).join(' ') + ' ' + machine.inputs.map((i) => i.sym).join(' ')}
            onChange={(e) => {
              setSeq(e.target.value);
              reset();
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-p"
            disabled={!toks.length || bad.length > 0}
            onClick={() => {
              if (playing) return;
              if (atEnd) reset();
              setPlaying(true);
            }}
          >
            {playing ? '▶ Playing…' : '▶ Play'}
          </button>
          <button
            className="btn"
            disabled={!playing}
            onClick={() => setPlaying(false)}
          >
            ⏸ Pause
          </button>
          <button
            className="btn"
            disabled={!toks.length || bad.length > 0 || !idle || atEnd}
            onClick={() => {
              setPlaying(false);
              start(pos);
            }}
          >
            ⏭ Step
          </button>
          <button className="btn" onClick={reset}>
            ↺ Reset
          </button>
        </div>
      </div>

      {bad.length > 0 && (
        <p className="text-sm text-[var(--bad)]">
          {'Unknown input symbol(s): ' +
            [...new Set(bad)].join(', ') +
            '. Valid: ' +
            machine.inputs.map((i) => i.sym).join(', ')}
        </p>
      )}

      <label className="flex items-center gap-3 text-sm text-[var(--mut)]">
        Speed
        <input
          type="range"
          min={0.25}
          max={3}
          step={0.25}
          value={speed}
          onChange={(e) => setSpeed(+e.target.value)}
          className="w-40 accent-[var(--ac)]"
        />
        {speed}×
      </label>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Current state">{shown}</Stat>
        <Stat label="Step">{pos + ' / ' + toks.length}</Stat>
        <Stat label="Processed input">
          {done.map((t) => t.input).join(' ') || '–'}
        </Stat>
        <Stat label="Output sequence">{outs.join(' ') || '–'}</Stat>
      </div>

      <div>
        <label className="lbl">Tape (input above, output below)</label>
        <div className="flex flex-wrap gap-2">
          {toks.length ? (
            toks.map((x, i) => {
              const d = i < pos,
                act = i === ai,
                fail = d && !trace[i].ok;
              return (
                <div
                  key={i}
                  title={lab(machine.inputs, x)}
                  className="w-fit min-w-12 max-w-full break-words rounded-lg border-2 px-2 py-1 text-center font-mono transition-all duration-300"
                  style={{
                    borderColor: fail
                      ? 'var(--bad)'
                      : act
                        ? 'var(--ac)'
                        : 'var(--bd)',
                    background: act ? 'var(--acs)' : 'var(--bg)',
                    opacity: d || act ? 1 : 0.55,
                    transform: act ? 'translateY(-3px)' : 'none',
                  }}
                >
                  <div className="font-bold">{x}</div>
                  <div
                    className="h-5 text-sm font-bold text-[var(--ok)]"
                    title={
                      d && trace[i].ok
                        ? lab(machine.outputs, trace[i].out)
                        : ''
                    }
                  >
                    {d ? (trace[i].ok ? trace[i].out : '✕') : ''}
                  </div>
                </div>
              );
            })
          ) : (
            <span className="text-sm text-[var(--mut)]">
              Enter an input sequence above.
            </span>
          )}
        </div>
      </div>

      {halted && (
        <p className="rounded-lg border border-[var(--bad)] p-3 text-sm text-[var(--bad)]">
          {'Halted: no transition is defined for (' +
            done[done.length - 1].from +
            ', ' +
            done[done.length - 1].input +
            ').'}
        </p>
      )}

      {finished && (
        <p className="rounded-lg border border-[var(--ok)] p-3 text-sm text-[var(--ok)]">
          {'Done. Input ' +
            toks.join(' ') +
            ' produced output ' +
            outs.join(' ') +
            '.'}
        </p>
      )}

      {done.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-[var(--mut)]">
                {['#', 'State', 'Input', 'Next state', 'Output'].map((c) => (
                  <th key={c} className="py-1 pr-3">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {done.map((t, i) => (
                <tr key={i} className="border-t border-[var(--bd)]">
                  <td className="py-1 pr-3">{i + 1}</td>
                  <td className="pr-3">{t.from}</td>
                  <td className="pr-3 font-mono">{t.input}</td>
                  <td className="pr-3">{t.ok ? t.to : '–'}</td>
                  <td className="font-mono font-bold">
                    {t.ok
                      ? t.out + ' (' + lab(machine.outputs, t.out) + ')'
                      : 'undefined'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
