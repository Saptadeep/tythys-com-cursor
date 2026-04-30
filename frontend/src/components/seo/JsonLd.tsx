const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tythys.com'

type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>
  id?: string
}

function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function SiteJsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tythys',
    url: SITE_URL,
    description:
      'Tythys turns quantitative reasoning, modeling, scientific thinking, and problem-solving into focused tools, validated against real results.',
    sameAs: [],
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tythys',
    url: SITE_URL,
    inLanguage: 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <JsonLd id="ld-organization" data={organization} />
      <JsonLd id="ld-website" data={website} />
    </>
  )
}

export function BeamCalcJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'EngineerCalc — Beam Calculator',
    applicationCategory: 'EngineeringApplication',
    operatingSystem: 'Web',
    url: `${SITE_URL}/beam-calculator`,
    description:
      'Validated simply-supported beam calculator: deflection, bending moment, shear, reactions for four canonical load cases. Validated against Roark\'s Formulas.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'Tythys',
      url: SITE_URL,
    },
  }
  return <JsonLd id="ld-beam-calc" data={data} />
}
