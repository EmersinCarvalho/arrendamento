import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-1 fw-bold text-warning">404</h1>
      <h2 className="fw-bold mb-3">Página não encontrada</h2>
      <p className="text-muted mb-4">A página que procura não existe ou foi removida.</p>
      <Link to="/" className="btn btn-dark px-5">
        Voltar ao início
      </Link>
    </div>
  );
}
