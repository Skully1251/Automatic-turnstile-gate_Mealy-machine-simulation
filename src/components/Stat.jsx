export default function Stat({ label, children }) {
  return (
    <div className="stat">
      <div className="lbl !mb-0.5">{label}</div>
      <div className="min-h-[1.5rem] break-words font-mono text-base font-bold">
        {children}
      </div>
    </div>
  );
}
