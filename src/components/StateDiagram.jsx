import { useMemo } from 'react';
import { layout, NR, W, H, ease } from '../diagram';

export default function StateDiagram({ machine, activeState, step, moving, p }) {
  const { pos, edges, start } = useMemo(() => layout(machine), [machine]);
  const ak = step ? step.from + '>' + step.to : null,
    ae = ak && edges.find((e) => e.key === ak);
  const tp = moving && ae && step.ok ? ae.at(ease(p)) : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Mealy machine state diagram"
    >
      <defs>
        {['a', 'b'].map((k) => (
          <marker
            key={k}
            id={`ar-${k}`}
            viewBox="0 0 10 10"
            refX={9}
            refY={5}
            markerWidth={11}
            markerHeight={11}
            markerUnits="userSpaceOnUse"
            orient="auto"
          >
            <path
              d="M0,0L10,5L0,10z"
              style={{ fill: k === 'a' ? 'var(--ac)' : 'var(--edge)' }}
            />
          </marker>
        ))}
      </defs>

      {/* Start arrow */}
      <line
        x1={start.a.x}
        y1={start.a.y}
        x2={start.b.x}
        y2={start.b.y}
        markerEnd="url(#ar-b)"
        style={{ stroke: 'var(--edge)', strokeWidth: 2.5 }}
      />
      <text
        x={start.a.x}
        y={start.a.y + (start.a.y > pos[machine.initial].y ? 16 : -8)}
        textAnchor="middle"
        style={{
          fontSize: 11,
          fontWeight: 700,
          fill: 'var(--mut)',
          letterSpacing: 1,
        }}
      >
        START
      </text>

      {/* Edges */}
      {edges.map((e) => {
        const on = e.key === ak;
        return (
          <g key={e.key}>
            <path
              d={e.path}
              fill="none"
              markerEnd={`url(#ar-${on ? 'a' : 'b'})`}
              style={{
                stroke: on ? 'var(--ac)' : 'var(--edge)',
                strokeWidth: on ? 3.5 : 2,
                transition: 'stroke .3s,stroke-width .3s',
              }}
            />
            <text
              x={e.lp.x}
              y={e.lp.y - (e.items.length - 1) * 7 + 4}
              textAnchor="middle"
              style={{
                fontSize: 13,
                fontWeight: 600,
                fill: 'var(--fg)',
                paintOrder: 'stroke',
                stroke: 'var(--card)',
                strokeWidth: 4,
              }}
            >
              {e.items.map((t, i) => {
                const hot = on && t.input === step.input;
                return (
                  <tspan
                    key={i}
                    x={e.lp.x}
                    dy={i ? 14 : 0}
                    style={{
                      fill: hot ? 'var(--ac)' : 'var(--fg)',
                      fontWeight: hot ? 800 : 600,
                    }}
                  >
                    {t.input}/{t.output}
                  </tspan>
                );
              })}
            </text>
          </g>
        );
      })}

      {/* State circles */}
      {machine.states.map((s) => {
        const P = pos[s],
          on = s === activeState,
          init = s === machine.initial;
        return (
          <g key={s}>
            {on && (
              <circle
                cx={P.x}
                cy={P.y}
                r={NR + 8}
                className="ring-pulse"
                style={{ fill: 'none', stroke: 'var(--ac)', strokeWidth: 3 }}
              />
            )}
            <circle
              cx={P.x}
              cy={P.y}
              r={NR}
              style={{
                fill: on ? 'var(--ac)' : 'var(--card)',
                stroke: init || on ? 'var(--ac)' : 'var(--edge)',
                strokeWidth: init ? 4 : 2.5,
                transition: 'fill .35s,stroke .35s',
              }}
            />
            <text
              x={P.x}
              y={P.y + 5}
              textAnchor="middle"
              style={{
                fontSize: s.length > 8 ? 11 : 14,
                fontWeight: 700,
                fill: on ? '#fff' : 'var(--fg)',
                transition: 'fill .35s',
              }}
            >
              {s}
            </text>
          </g>
        );
      })}

      {/* Moving token */}
      {tp && (
        <g>
          <circle
            cx={tp.x}
            cy={tp.y}
            r={15}
            style={{ fill: 'var(--ac)', opacity: 0.25 }}
          />
          <circle
            cx={tp.x}
            cy={tp.y}
            r={11}
            style={{ fill: 'var(--ac)', stroke: '#fff', strokeWidth: 2 }}
          />
          <text
            x={tp.x}
            y={tp.y + 4}
            textAnchor="middle"
            style={{ fontSize: 11, fontWeight: 800, fill: '#fff' }}
          >
            {step.input}
          </text>
        </g>
      )}
    </svg>
  );
}
