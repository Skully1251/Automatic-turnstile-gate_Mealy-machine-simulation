import { parseStates, parseSyms } from '../machine';
import Select from './Select';
import Field from './Field';

let uid = 100;

export default function ConfigPanel({ cfg, setCfg, onCreate, onDefault, errors }) {
  const S = parseStates(cfg.states),
    I = parseSyms(cfg.inputs).map((x) => x.sym),
    O = parseSyms(cfg.outputs).map((x) => x.sym);
  const set = (k, v) => setCfg({ ...cfg, [k]: v });
  const setT = (id, k, v) =>
    set(
      'transitions',
      cfg.transitions.map((t) => (t.id === id ? { ...t, [k]: v } : t))
    );

  return (
    <section className="card space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Machine configuration</h2>
      </div>

      <Field label="States" hint="Comma separated e.g. Locked, Unlocked">
        <input
          className="inp"
          value={cfg.states}
          onChange={(e) => set('states', e.target.value)}
        />
      </Field>

      <Field label="Input symbols" hint="Comma separated e.g. Card, Push">
        <input
          className="inp"
          value={cfg.inputs}
          onChange={(e) => set('inputs', e.target.value)}
        />
      </Field>

      <Field label="Output symbols" hint="Comma separated, e.g. Allow, Deny">
        <input
          className="inp"
          value={cfg.outputs}
          onChange={(e) => set('outputs', e.target.value)}
        />
      </Field>

      <Field label="Initial state">
        <Select
          value={cfg.initial}
          options={S}
          onChange={(v) => set('initial', v)}
        />
      </Field>

      <div>
        <label className="lbl">
          Transitions δ(state, input) → (next state, output)
        </label>
        <div className="mb-1 grid grid-cols-[1fr_.6fr_1fr_.6fr_auto] gap-1.5 text-[10px] font-semibold uppercase text-[var(--mut)]">
          {['From', 'Input', 'To', 'Output', ''].map((x, i) => (
            <span key={i}>{x}</span>
          ))}
        </div>
        <div className="space-y-1.5">
          {cfg.transitions.map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-[1fr_.6fr_1fr_.6fr_auto] gap-1.5"
            >
              <Select
                value={t.from}
                options={S}
                onChange={(v) => setT(t.id, 'from', v)}
              />
              <Select
                value={t.input}
                options={I}
                onChange={(v) => setT(t.id, 'input', v)}
              />
              <Select
                value={t.to}
                options={S}
                onChange={(v) => setT(t.id, 'to', v)}
              />
              <Select
                value={t.output}
                options={O}
                onChange={(v) => setT(t.id, 'output', v)}
              />
              <button
                className="btn !px-2"
                title="Remove transition"
                aria-label="Remove transition"
                onClick={() =>
                  set(
                    'transitions',
                    cfg.transitions.filter((x) => x.id !== t.id)
                  )
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          className="btn mt-2 text-xs"
          onClick={() =>
            set('transitions', [
              ...cfg.transitions,
              {
                id: ++uid,
                from: S[0] || '',
                input: I[0] || '',
                to: S[0] || '',
                output: O[0] || '',
              },
            ])
          }
        >
          + Add transition
        </button>
      </div>

      {errors.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-[var(--bad)] p-3 text-sm text-[var(--bad)]">
          {errors.map((e, i) => (
            <li key={i}>• {e}</li>
          ))}
        </ul>
      )}

      <button className="btn btn-p w-full" onClick={onCreate}>
        Create Machine
      </button>
    </section>
  );
}
