export type OfficialSource = {
  id: string;
  name: string;
  url: string;
  covers: string[];
};

export const officialSources: OfficialSource[] = [
  {
    id: "nida-services",
    name: "NIDA Online Services",
    url: "https://services.nida.go.tz/",
    covers: ["NIDA/NIN application", "NIDA replacement and NIN lookup"]
  },
  {
    id: "tra-taxpayer-portal",
    name: "Tanzania Revenue Authority Taxpayer Portal",
    url: "https://taxpayerportal.tra.go.tz/",
    covers: ["TIN registration", "tax account services", "tax deadline checks"]
  },
  {
    id: "immigration-passport",
    name: "Tanzania Immigration e-Services Passport Portal",
    url: "https://eservices.immigration.go.tz/online/web/passport",
    covers: ["Tanzania passport application"]
  },
  {
    id: "erita",
    name: "eRITA Portal",
    url: "https://erita.rita.go.tz/",
    covers: ["birth certificate applications", "civil registration services"]
  },
  {
    id: "brela-ors",
    name: "BRELA Online Registration System",
    url: "https://ors.brela.go.tz/",
    covers: ["business name registration", "company registration"]
  },
  {
    id: "tnbp-business-licence",
    name: "Tanzania National Business Portal",
    url: "https://business.go.tz/obtain-a-business-license",
    covers: ["business licence guidance"]
  }
];

export function getOfficialSourceByUrl(url?: string) {
  if (!url) {
    return undefined;
  }

  return officialSources.find((source) => normalizeUrl(source.url) === normalizeUrl(url));
}

export function getOfficialSourceLabel(url?: string) {
  const source = getOfficialSourceByUrl(url);
  return source ? source.name : "Official source";
}

function normalizeUrl(url: string) {
  return url.replace(/\/$/, "");
}
