export default function Field({ label, hint, children }) {
  return (
    <div>
      <label className="lbl">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-[var(--mut)]">{hint}</p>}
    </div>
  );
}
