import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

const DEFAULT_DESCRIPTION = 'Plataforma de associação para criadores digitais com lojas de afiliados, benefícios exclusivos e comunidade.';

export default function SEO({ title, description, url, image }: SEOProps) {
  const fullTitle = title ? `${title} | DigitaisBR` : 'DigitaisBR — Associação de Criadores Digitais';
  const desc = description || DEFAULT_DESCRIPTION;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {url && <link rel="canonical" href={url} />}
    </Helmet>
  );
}
