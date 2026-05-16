import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="text-white mt-auto py-5" style={{ background: "#1a1a1a" }}>
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <div className="mb-3">
              <img
                src={logo}
                alt="ArrendaHouse"
                style={{ height: 48, borderRadius: 8, objectFit: "contain" }}
              />
            </div>
            <p className="text-muted small mb-0">
              A plataforma portuguesa de arrendamento imobiliário. Simples, rápida e de confiança.
            </p>
          </div>
          <div className="col-6 col-md-2">
            <p className="fw-semibold small text-uppercase text-muted mb-2">Plataforma</p>
            <ul className="list-unstyled small">
              <li><a href="/imoveis" className="text-muted text-decoration-none">Ver Imóveis</a></li>
              <li><a href="/login" className="text-muted text-decoration-none">Publicar Imóvel</a></li>
              <li><a href="/login" className="text-muted text-decoration-none">Entrar</a></li>
            </ul>
          </div>
          <div className="col-6 col-md-2">
            <p className="fw-semibold small text-uppercase text-muted mb-2">Suporte</p>
            <ul className="list-unstyled small">
              <li><a href="#" className="text-muted text-decoration-none">Como funciona</a></li>
              <li><a href="#" className="text-muted text-decoration-none">Contacto</a></li>
              <li><a href="#" className="text-muted text-decoration-none">FAQ</a></li>
            </ul>
          </div>
          <div className="col-12 col-md-4">
            <p className="fw-semibold small text-uppercase text-muted mb-2">Disponível em todo o país</p>
            <p className="text-muted small">Lisboa · Porto · Braga · Coimbra · Faro · Cascais · e mais...</p>
          </div>
        </div>
        <hr style={{ borderColor: "rgba(255,255,255,0.1)" }} />
        <p className="mb-0 text-muted small text-center">
          © {new Date().getFullYear()} ArrendaHouse · Plataforma de Arrendamento Imobiliário
        </p>
      </div>
    </footer>
  );
}
