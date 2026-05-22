export default function TopBar({ title, children }) {
  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      {children && (
        <div className="d-flex align-items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
