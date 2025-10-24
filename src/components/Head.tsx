import React from "react";
import { Helmet } from "react-helmet-async";

interface HeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  structuredData?: object | null;
}

export default function Head({ title, description, image, url, structuredData }: HeadProps) {
  const defaultTitle = "Amine Eyewear";
  const defaultDescription = "Qualité haut de gamme et livraison gratuite";
  const defaultImage = "https://storage.googleapis.com/gpt-engineer-file-uploads/VAyqMKnZzcgouaWTSv55C0XBzHg2/social-images/social-1760809228346-Capture d’écran 2025-10-18 184018.png";

  return (
    <Helmet>
      <title>{title ? `${title} — ${defaultTitle}` : defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      {url && <meta property="og:url" content={url} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />

      {/* Canonical */}
      {url && <link rel="canonical" href={url} />}

      {/* Structured data */}
      {structuredData && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}
    </Helmet>
  );
}
