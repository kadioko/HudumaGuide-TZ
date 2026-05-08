import { BusinessStructure } from "@/types";

export type BusinessStructureInfo = {
  id: BusinessStructure;
  titleSw: string;
  titleEn: string;
  bestForSw: string;
  bestForEn: string;
  prosSw: string[];
  prosEn: string[];
  consSw: string[];
  consEn: string[];
  documentsSw: string[];
  documentsEn: string[];
  complexity: "Rahisi" | "Wastani" | "Kina";
  obligationsSw: string[];
  obligationsEn: string[];
  mistakesSw: string[];
  mistakesEn: string[];
};

export const businessStructures: BusinessStructureInfo[] = [
  {
    id: "freelancer",
    titleSw: "Freelancer / Kujiajiri",
    titleEn: "Freelancer / Self-employed",
    bestForSw: "Mtoa huduma anayefanya kazi peke yake na wateja wachache.",
    bestForEn: "A service provider working alone with a small client base.",
    prosSw: ["Rahisi kuanza", "Gharama za uendeshaji huwa ndogo"],
    prosEn: ["Easy to start", "Lower operating overhead"],
    consSw: ["Inaweza kuchanganya fedha binafsi na biashara", "Mipaka ya ukuaji inaweza kuonekana mapema"],
    consEn: ["Personal and business money can mix", "Growth limits can appear early"],
    documentsSw: ["NIDA/NIN", "TIN kama inahitajika", "Mikataba/rekodi za mapato"],
    documentsEn: ["NIDA/NIN", "TIN if required", "Contracts/income records"],
    complexity: "Rahisi",
    obligationsSw: ["Kutunza rekodi", "Kuhakiki obligations za kodi"],
    obligationsEn: ["Keep records", "Confirm tax obligations"],
    mistakesSw: ["Kutoweka bei na mikataba wazi", "Kutotunza risiti"],
    mistakesEn: ["Unclear pricing/contracts", "Not keeping receipts"]
  },
  {
    id: "business_name",
    titleSw: "Jina la Biashara",
    titleEn: "Business Name",
    bestForSw: "Mtu au biashara ndogo inayotaka kutumia jina rasmi bila muundo wa kampuni.",
    bestForEn: "An individual or small business that wants a formal trading name without a company structure.",
    prosSw: ["Jina linatambulika", "Rahisi kuliko kampuni"],
    prosEn: ["Recognized trading name", "Simpler than a company"],
    consSw: ["Si limited company", "Mmiliki anaweza kubeba majukumu binafsi"],
    consEn: ["Not a limited company", "Owner may remain personally responsible"],
    documentsSw: ["NIDA/NIN", "Anuani", "Majina mbadala ya biashara"],
    documentsEn: ["NIDA/NIN", "Address", "Alternative business names"],
    complexity: "Wastani",
    obligationsSw: ["Renewal kama ipo", "Leseni/kodi kulingana na biashara"],
    obligationsEn: ["Renewals if applicable", "Licences/tax based on activity"],
    mistakesSw: ["Kudhani jina ni kampuni", "Kusajili jina lisilolingana na shughuli"],
    mistakesEn: ["Assuming it is a company", "Registering a name that does not match activity"]
  },
  {
    id: "limited_company",
    titleSw: "Limited Company",
    titleEn: "Limited Company",
    bestForSw: "Biashara yenye washirika, wafanyakazi, mikataba mikubwa au mpango wa kukua.",
    bestForEn: "A business with partners, employees, bigger contracts, or growth plans.",
    prosSw: ["Muundo rasmi", "Unafaa kwa zabuni na wawekezaji"],
    prosEn: ["Formal structure", "Better for tenders and investors"],
    consSw: ["Compliance zaidi", "Rekodi na maamuzi yanahitaji nidhamu"],
    consEn: ["More compliance", "Records and decisions require discipline"],
    documentsSw: ["Taarifa za wakurugenzi", "Taarifa za wanahisa", "Anuani ya kampuni"],
    documentsEn: ["Director details", "Shareholder details", "Company address"],
    complexity: "Kina",
    obligationsSw: ["Returns", "Rekodi za kampuni", "Kodi na leseni"],
    obligationsEn: ["Returns", "Company records", "Tax and licences"],
    mistakesSw: ["Kutokubaliana hisa mapema", "Kusahau obligations baada ya usajili"],
    mistakesEn: ["Not agreeing shares early", "Forgetting post-registration obligations"]
  },
  {
    id: "partnership",
    titleSw: "Partnership",
    titleEn: "Partnership",
    bestForSw: "Watu wawili au zaidi wanaoshirikiana kibiashara bila kuunda limited company.",
    bestForEn: "Two or more people running a business together without forming a limited company.",
    prosSw: ["Rahisi kugawana kazi", "Inaweza kuwa nyepesi kuliko kampuni"],
    prosEn: ["Easy to share work", "Can be lighter than a company"],
    consSw: ["Migogoro hutokea bila makubaliano", "Majukumu yanaweza kushirikiwa binafsi"],
    consEn: ["Disputes happen without agreements", "Responsibilities may be personal/shared"],
    documentsSw: ["Taarifa za washirika", "Makubaliano ya partnership", "Anuani"],
    documentsEn: ["Partner details", "Partnership agreement", "Address"],
    complexity: "Wastani",
    obligationsSw: ["Makubaliano ya ndani", "Rekodi za mapato na matumizi"],
    obligationsEn: ["Internal agreements", "Income and expense records"],
    mistakesSw: ["Kutokuwa na maandishi ya makubaliano", "Kutoelewana kuhusu faida na hasara"],
    mistakesEn: ["No written agreement", "Unclear profit and loss sharing"]
  },
  {
    id: "ngo",
    titleSw: "NGO / Non-profit",
    titleEn: "NGO / Non-profit",
    bestForSw: "Shughuli za kijamii zisizolenga faida kama biashara ya kawaida.",
    bestForEn: "Social-impact activities that are not profit-first businesses.",
    prosSw: ["Inafaa kwa miradi ya kijamii", "Inaweza kuvutia wafadhili"],
    prosEn: ["Good for social projects", "Can attract funders"],
    consSw: ["Mahitaji ya usimamizi ni makubwa", "Si njia rahisi ya kuendesha biashara ya faida"],
    consEn: ["Governance requirements are higher", "Not a shortcut for profit businesses"],
    documentsSw: ["Katiba/kanuni", "Taarifa za waanzilishi", "Anuani na madhumuni"],
    documentsEn: ["Constitution/rules", "Founder details", "Address and objectives"],
    complexity: "Kina",
    obligationsSw: ["Governance", "Ripoti", "Kufuata masharti ya sekta"],
    obligationsEn: ["Governance", "Reports", "Sector requirements"],
    mistakesSw: ["Kuchanganya NGO na biashara", "Kutokuwa na governance nzuri"],
    mistakesEn: ["Mixing NGO and business purposes", "Weak governance"]
  },
  {
    id: "sole_trader",
    titleSw: "Sole Trader / Biashara Binafsi",
    titleEn: "Sole Trader / Individual Business",
    bestForSw: "Mmiliki mmoja anayeanza biashara ndogo kwa hatua za msingi.",
    bestForEn: "A single owner starting a small business with basic structure.",
    prosSw: ["Rahisi kuelewa", "Maamuzi ni ya haraka"],
    prosEn: ["Easy to understand", "Fast decisions"],
    consSw: ["Mmiliki hubeba hatari nyingi binafsi", "Inaweza kuwa ngumu kupanua"],
    consEn: ["Owner carries more personal risk", "Can be harder to scale"],
    documentsSw: ["NIDA/NIN", "TIN kama inahitajika", "Anuani"],
    documentsEn: ["NIDA/NIN", "TIN if required", "Address"],
    complexity: "Rahisi",
    obligationsSw: ["Rekodi", "Leseni/kodi kulingana na shughuli"],
    obligationsEn: ["Records", "Licences/tax based on activity"],
    mistakesSw: ["Kutenganisha vibaya fedha za biashara na binafsi", "Kusahau renewal"],
    mistakesEn: ["Mixing personal and business money", "Forgetting renewals"]
  }
];
