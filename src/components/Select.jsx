export default function Select({ value, options, onChange }) {
  const opts =
    !value || options.includes(value) ? options : [value, ...options];
  return (
    <select
      className="inp"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {opts.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
