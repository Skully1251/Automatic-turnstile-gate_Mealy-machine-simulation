import { useState, useEffect, useRef } from 'react';
import { buildMachine } from './machine';
import ConfigPanel from './components/ConfigPanel';
import StateDiagram from './components/StateDiagram';
import SimulationPanel from './components/SimulationPanel';

const DEFAULT = {
  states: 'Locked, Unlocked',
  inputs: 'Card, Push',
  outputs: 'Allow, Deny',
  initial: 'Locked',
  transitions: [
    ['Locked', 'Card', 'Unlocked', 'Allow'],
    ['Locked', 'Push', 'Locked', 'Deny'],
    ['Unlocked', 'Card', 'Unlocked', 'Allow'],
    ['Unlocked', 'Push', 'Locked', 'Allow'],
  ].map(([from, input, to, output], i) => ({
    id: i + 1,
    from,
    input,
    to,
    output,
  })),
};

export default function App() {
  const [cfg, setCfg] = useState(DEFAULT),
    [machine, setMachine] = useState(() => buildMachine(DEFAULT)),
    [errors, setErrors] = useState([]);
  const [showSim, setShowSim] = useState(false),
    [ver, setVer] = useState(0),
    [view, setView] = useState({
      shown: null,
      step: null,
      moving: false,
      p: 0,
    });
  const simRef = useRef(null);

  const create = (c) => {
    const m = buildMachine(c);
    if (m.errors) {
      setErrors(m.errors);
      return;
    }
    setErrors([]);
    setMachine(m);
    setShowSim(false);
    setVer((v) => v + 1);
    setView({ shown: null, step: null, moving: false, p: 0 });
  };

  useEffect(() => {
    if (showSim && simRef.current)
      simRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  }, [showSim]);

  const sym = (l) => l.map((x) => x.sym + ' = ' + x.label).join('  ·  ');

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold sm:text-4xl">
          Automatic Turnstile Gate – Mealy Machine Simulator
        </h1>
        <p className="mt-2 max-w-3xl text-[var(--mut)]">
          A Mealy machine produces an output on every transition: δ(state,
          input) → (next state, output).
        </p>
        <p className="mt-2 max-w-3xl text-[var(--mut)]">
          Edit the configuration, create the
          machine, then run any input sequence through it.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ConfigPanel
            cfg={cfg}
            setCfg={setCfg}
            errors={errors}
            onCreate={() => create(cfg)}
            onDefault={() => {
              setCfg(DEFAULT);
              create(DEFAULT);
            }}
          />
        </div>

        <section className="card lg:col-span-3">
          <h2 className="mb-1 text-lg font-bold">
            State-transition diagram
          </h2>
          {/* <p className="mb-2 text-xs text-[var(--mut)]">
            {'Inputs: ' +
              sym(machine.inputs) +
              '   |   Outputs: ' +
              sym(machine.outputs)}
          </p> */}
          <StateDiagram
            machine={machine}
            activeState={showSim ? view.shown : null}
            step={showSim ? view.step : null}
            moving={showSim && view.moving}
            p={view.p}
          />
          {machine.warnings.length > 0 && (
            <details className="mt-2 text-sm text-[var(--mut)]">
              <summary className="cursor-pointer">
                {'Incomplete machine (' +
                  machine.warnings.length +
                  ' undefined transition' +
                  (machine.warnings.length > 1 ? 's' : '') +
                  ')'}
              </summary>
              <ul className="mt-1 list-disc pl-5">
                {machine.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </details>
          )}
          <div className="mt-3 flex justify-end">
            <button
              className="btn btn-p"
              onClick={() => setShowSim(true)}
            >
              {showSim ? 'Machine ready ✓' : 'Test Machine'}
            </button>
          </div>
        </section>
      </div>

      {showSim && (
        <div ref={simRef} className="mt-6">
          <SimulationPanel
            key={ver}
            machine={machine}
            onView={(v) => {
              if (
                v.shown !== view.shown ||
                v.step !== view.step ||
                v.moving !== view.moving ||
                v.p !== view.p
              )
                setView(v);
            }}
          />
        </div>
      )}

      <footer className="mt-8 text-center text-xs text-[var(--mut)]">
        Mealy output depends on the current state and the current input – not
        on the state alone (that would be a Moore machine).
      </footer>
    </div>
  );
}
