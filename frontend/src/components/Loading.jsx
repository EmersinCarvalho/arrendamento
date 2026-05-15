export default function Loading() {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-warning" role="status" style={{ width: "3rem", height: "3rem" }}>
        <span className="visually-hidden">A carregar...</span>
      </div>
    </div>
  );
}
