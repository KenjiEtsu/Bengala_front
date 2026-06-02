export type DestinationNode = {
  id: string;
  name: string;
  children?: DestinationNode[];
};

export const DESTINATIONS: DestinationNode[] = [
  {
    id: "es",
    name: "España",
    children: [
      {
        id: "es-an",
        name: "Andalucía",
        children: [
          { id: "es-an-al", name: "Almería" },
          { id: "es-an-ca", name: "Cádiz" },
          { id: "es-an-co", name: "Córdoba" },
          { id: "es-an-gr", name: "Granada" },
          { id: "es-an-hu", name: "Huelva" },
          { id: "es-an-ja", name: "Jaén" },
          { id: "es-an-ma", name: "Málaga" },
          { id: "es-an-se", name: "Sevilla" }
        ]
      },
      {
        id: "es-ar",
        name: "Aragón",
        children: [
          { id: "es-ar-hu", name: "Huesca" },
          { id: "es-ar-te", name: "Teruel" },
          { id: "es-ar-z", name: "Zaragoza" }
        ]
      },
      {
        id: "es-as",
        name: "Principado de Asturias",
        children: [{ id: "es-as-as", name: "Asturias" }]
      },
      {
        id: "es-ib",
        name: "Illes Balears",
        children: [{ id: "es-ib-ib", name: "Illes Balears" }]
      },
      {
        id: "es-cn",
        name: "Canarias",
        children: [
          { id: "es-cn-gc", name: "Las Palmas" },
          { id: "es-cn-tf", name: "Santa Cruz de Tenerife" }
        ]
      },
      {
        id: "es-cb",
        name: "Cantabria",
        children: [{ id: "es-cb-cb", name: "Cantabria" }]
      },
      {
        id: "es-clm",
        name: "Castilla-La Mancha",
        children: [
          { id: "es-clm-ab", name: "Albacete" },
          { id: "es-clm-cr", name: "Ciudad Real" },
          { id: "es-clm-cu", name: "Cuenca" },
          { id: "es-clm-gu", name: "Guadalajara" },
          { id: "es-clm-to", name: "Toledo" }
        ]
      },
      {
        id: "es-cyl",
        name: "Castilla y León",
        children: [
          { id: "es-cyl-av", name: "Ávila" },
          { id: "es-cyl-bu", name: "Burgos" },
          { id: "es-cyl-le", name: "León" },
          { id: "es-cyl-p", name: "Palencia" },
          { id: "es-cyl-sa", name: "Salamanca" },
          { id: "es-cyl-sg", name: "Segovia" },
          { id: "es-cyl-so", name: "Soria" },
          { id: "es-cyl-va", name: "Valladolid" },
          { id: "es-cyl-za", name: "Zamora" }
        ]
      },
      {
        id: "es-ca",
        name: "Cataluña",
        children: [
          { id: "es-ca-b", name: "Barcelona" },
          { id: "es-ca-gi", name: "Girona" },
          { id: "es-ca-l", name: "Lleida" },
          { id: "es-ca-t", name: "Tarragona" }
        ]
      },
      {
        id: "es-ce",
        name: "Ceuta",
        children: [{ id: "es-ce-ce", name: "Ceuta" }]
      },
      {
        id: "es-md",
        name: "Comunidad de Madrid",
        children: [{ id: "es-md-m", name: "Madrid" }]
      },
      {
        id: "es-cv",
        name: "Comunitat Valenciana",
        children: [
          { id: "es-cv-a", name: "Alicante" },
          { id: "es-cv-cs", name: "Castellón" },
          { id: "es-cv-v", name: "Valencia" }
        ]
      },
      {
        id: "es-ex",
        name: "Extremadura",
        children: [
          { id: "es-ex-ba", name: "Badajoz" },
          { id: "es-ex-cc", name: "Cáceres" }
        ]
      },
      {
        id: "es-ga",
        name: "Galicia",
        children: [
          { id: "es-ga-c", name: "A Coruña" },
          { id: "es-ga-lu", name: "Lugo" },
          { id: "es-ga-or", name: "Ourense" },
          { id: "es-ga-po", name: "Pontevedra" }
        ]
      },
      {
        id: "es-ri",
        name: "La Rioja",
        children: [{ id: "es-ri-ri", name: "La Rioja" }]
      },
      {
        id: "es-mu",
        name: "Región de Murcia",
        children: [{ id: "es-mu-mu", name: "Murcia" }]
      },
      {
        id: "es-mel",
        name: "Melilla",
        children: [{ id: "es-mel-me", name: "Melilla" }]
      },
      {
        id: "es-na",
        name: "Comunidad Foral de Navarra",
        children: [{ id: "es-na-na", name: "Navarra" }]
      },
      {
        id: "es-pv",
        name: "País Vasco",
        children: [
          { id: "es-pv-vi", name: "Álava" },
          { id: "es-pv-bi", name: "Bizkaia" },
          { id: "es-pv-ss", name: "Gipuzkoa" }
        ]
      }
    ]
  }
];

export const DESTINATION_SECTION_KEYS = [
  "languages",
  "requirements",
  "services",
  "rights",
  "official_costs",
  "useful_contacts",
  "transport"
] as const;

export type DestinationSectionKey = (typeof DESTINATION_SECTION_KEYS)[number];

export const DESTINATION_SECTIONS_ES: Record<DestinationSectionKey, string> = {
  languages: "Lenguas oficiales",
  requirements:
    "Requisitos para regularizar la situación (empadronamiento, documento de vulnerabilidad, antecedentes, etc.)",
  services:
    "Servicios disponibles (albergues, alojamiento, empadronamiento, atención social, asesoría jurídica, etc.)",
  rights:
    "Situación y derechos en irregularidad (sanidad, educación, acogida, ayudas, protección, etc.)",
  official_costs:
    "Costes oficiales y documentación necesaria (para evitar desinformación, abusos o mafias)",
  useful_contacts: "Contactos útiles y recursos de emergencia",
  transport: "Transporte y movilidad entre territorios (actualizado)"
};

export const DESTINATION_SECTIONS_EN: Record<DestinationSectionKey, string> = {
  languages: "Official languages",
  requirements:
    "Requirements to regularize status (registration, vulnerability document, background checks, etc.)",
  services:
    "Available services (shelters, housing, registration, social services, legal aid, etc.)",
  rights:
    "Rights and situation when undocumented (healthcare, education, reception, aid, protection, etc.)",
  official_costs:
    "Official costs and required documents (to avoid misinformation, abuse or mafia)",
  useful_contacts: "Useful contacts and emergency resources",
  transport: "Transport and mobility between territories (up-to-date)"
};

