import { Helmet } from "react-helmet-async";

/**
 * Componente SEO reutilizável para meta tags por página.
 *
 * Props:
 *  - titulo       : título da página (sem sufixo — o sufixo é adicionado aqui)
 *  - descricao    : descrição da página (até ~160 caracteres)
 *  - imagem       : URL absoluta para og:image (opcional)
 *  - url          : URL canónica da página (opcional)
 *  - tipo         : og:type ("website" | "article" | "product") — default "website"
 *  - noIndex      : true para páginas privadas (perfil, candidaturas, etc.)
 *  - jsonLd       : objeto JSON-LD para dados estruturados (opcional)
 */
export default function SEO({
  titulo,
  descricao,
  imagem = "https://arrendahouse.pt/og-image.png",
  url,
  tipo = "website",
  noIndex = false,
  jsonLd,
}) {
  const tituloCompleto = titulo
    ? `${titulo} | ArrendaHouse`
    : "ArrendaHouse — Arrendamento de Imóveis na Europa";

  const descricaoPadrao =
    "Encontra apartamentos e casas para arrendar em toda a Europa. Candidata-te facilmente e fala diretamente com senhorios.";

  const desc = descricao || descricaoPadrao;

  return (
    <Helmet>
      <title>{tituloCompleto}</title>
      <meta name="description" content={desc} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph */}
      <meta property="og:title" content={tituloCompleto} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={tipo} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={imagem} />

      {/* Twitter Card */}
      <meta name="twitter:title" content={tituloCompleto} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={imagem} />

      {/* JSON-LD estruturado */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
