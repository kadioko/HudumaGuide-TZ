import { ServiceGuide } from "@/types";

const guideDisclaimer =
  "This is general guidance from HudumaGuide TZ. It is not legal/tax advice and not an official government instruction. Confirm final requirements, fees, and procedures through official government channels.";

export const serviceGuides: ServiceGuide[] = [
  {
    id: "svc-nida-application",
    slug: "nida-nin-application",
    categoryId: "identity",
    titleSw: "Maombi ya NIDA/NIN",
    titleEn: "NIDA/NIN Application",
    summarySw: "Mwongozo wa kujiandaa kwa maombi ya NIN na kitambulisho cha taifa.",
    summaryEn: "A preparation guide for applying for a NIN and national ID.",
    whoNeedsItSw: "Raia au mkazi anayehitaji namba ya utambulisho kwa huduma za serikali, benki, simu au ajira.",
    whoNeedsItEn: "Citizens or residents who need identity number support for public services, banks, mobile lines, or work.",
    estimatedTime: "Varies by verification and office workload",
    estimatedCostNote: "Fees may change. Please confirm through the official portal or office.",
    officialUrl: "TO_BE_VERIFIED",
    physicalLocationNote: "Visit the relevant NIDA registration office or authorized registration point where applicable.",
    complexity: "Medium",
    keywords: ["nida", "nin", "kitambulisho", "national id", "utambulisho", "namba ya nida"],
    requiredDocuments: [
      { id: "birth-cert", titleSw: "Cheti cha kuzaliwa au uthibitisho wa kuzaliwa", titleEn: "Birth certificate or birth proof" },
      { id: "parent-id", titleSw: "Taarifa za mzazi/mlezi pale zinapohitajika", titleEn: "Parent/guardian details where required" },
      { id: "residence", titleSw: "Taarifa za makazi", titleEn: "Residence details" }
    ],
    steps: [
      { id: "prepare", titleSw: "Andaa taarifa zako", titleEn: "Prepare your details", descriptionSw: "Kagua majina, tarehe ya kuzaliwa na taarifa za makazi kabla ya kwenda ofisini.", descriptionEn: "Check your names, date of birth, and residence details before visiting the office." },
      { id: "visit", titleSw: "Tembelea kituo husika", titleEn: "Visit the relevant center", descriptionSw: "Fuata maelekezo ya ofisi au tovuti rasmi kuhusu eneo na muda wa kuhudumiwa.", descriptionEn: "Follow official office or portal instructions for location and service hours." },
      { id: "verify", titleSw: "Fanya uhakiki", titleEn: "Complete verification", descriptionSw: "Toa taarifa kwa usahihi na hifadhi namba ya ufuatiliaji kama utapewa.", descriptionEn: "Provide accurate information and keep any tracking number if issued." }
    ],
    commonMistakesSw: ["Majina kutofautiana kwenye nyaraka", "Kutokwenda na uthibitisho wa makazi", "Kutohakiki taarifa kabla ya kuwasilisha"],
    commonMistakesEn: ["Names not matching across documents", "Missing residence proof", "Submitting details without checking them"],
    faqs: [
      { questionSw: "Je, HudumaGuide inaweza kutuma maombi yangu?", questionEn: "Can HudumaGuide submit my application?", answerSw: "Hapana. Tunatoa mwongozo tu na kukupeleka kwenye chanzo rasmi.", answerEn: "No. We only guide you and point you to official sources." }
    ],
    lastVerifiedAt: "2026-05-08",
    disclaimer: guideDisclaimer
  },
  {
    id: "svc-nida-replacement",
    slug: "nida-replacement",
    categoryId: "identity",
    titleSw: "Kubadilisha/Kupata NIDA Iliyopotea",
    titleEn: "NIDA Replacement",
    summarySw: "Mwongozo wa hatua za kufuatilia kitambulisho cha NIDA kilichopotea au kuharibika.",
    summaryEn: "A guide for replacing a lost or damaged NIDA card.",
    whoNeedsItSw: "Mtu aliyepoteza au kuharibu kitambulisho cha taifa.",
    whoNeedsItEn: "Anyone whose national ID card is lost or damaged.",
    estimatedTime: "Varies by verification and replacement queue",
    estimatedCostNote: "Fees may change. Please confirm through the official portal or office.",
    officialUrl: "TO_BE_VERIFIED",
    physicalLocationNote: "Check the relevant NIDA office or official guidance before visiting.",
    complexity: "Easy",
    keywords: ["nida replacement", "nida lost", "kitambulisho kimepotea", "kupoteza nida"],
    requiredDocuments: [
      { id: "loss-report", titleSw: "Taarifa ya kupoteza kama itaombwa", titleEn: "Loss report if requested" },
      { id: "nin", titleSw: "NIN au taarifa zako za utambulisho", titleEn: "NIN or identity details" }
    ],
    steps: [
      { id: "confirm", titleSw: "Hakiki mahitaji", titleEn: "Confirm requirements", descriptionSw: "Angalia chanzo rasmi kujua kama unahitaji taarifa ya kupoteza au malipo.", descriptionEn: "Check official guidance to know whether a loss report or payment is required." },
      { id: "report", titleSw: "Wasilisha taarifa", titleEn: "Submit replacement request", descriptionSw: "Nenda kwenye ofisi au njia rasmi iliyoelekezwa.", descriptionEn: "Use the office or official channel provided." },
      { id: "follow", titleSw: "Fuatilia maombi", titleEn: "Follow up", descriptionSw: "Hifadhi risiti au namba ya ufuatiliaji kama utapewa.", descriptionEn: "Keep any receipt or tracking reference if issued." }
    ],
    commonMistakesSw: ["Kukosa NIN", "Kutotunza risiti au reference", "Kutegemea taarifa zisizo rasmi"],
    commonMistakesEn: ["Missing NIN", "Losing receipts or references", "Relying on unofficial information"],
    faqs: [],
    lastVerifiedAt: "2026-05-08",
    disclaimer: guideDisclaimer
  },
  {
    id: "svc-tin-registration",
    slug: "tin-registration",
    categoryId: "tax",
    titleSw: "Usajili wa TIN",
    titleEn: "TIN Registration",
    summarySw: "Mwongozo wa kujiandaa kupata Taxpayer Identification Number.",
    summaryEn: "A preparation guide for getting a Taxpayer Identification Number.",
    whoNeedsItSw: "Mtu binafsi, mfanyabiashara, freelancer au kampuni inayohitaji kushughulika na kodi au biashara.",
    whoNeedsItEn: "Individuals, entrepreneurs, freelancers, or companies handling tax or business activities.",
    estimatedTime: "Varies by taxpayer type and verification",
    estimatedCostNote: "Fees may change. Please confirm through the official portal or office.",
    officialUrl: "TO_BE_VERIFIED",
    physicalLocationNote: "Use the relevant TRA office or official digital channel where available.",
    complexity: "Medium",
    keywords: ["tin", "tra", "kodi", "tax", "taxpayer", "namba ya mlipa kodi"],
    requiredDocuments: [
      { id: "nida", titleSw: "NIDA/NIN", titleEn: "NIDA/NIN" },
      { id: "contact", titleSw: "Namba ya simu na anuani", titleEn: "Phone number and address" },
      { id: "business-docs", titleSw: "Nyaraka za biashara kama una biashara", titleEn: "Business documents if applicable" }
    ],
    steps: [
      { id: "taxpayer-type", titleSw: "Tambua aina ya mlipa kodi", titleEn: "Identify taxpayer type", descriptionSw: "Chagua kama ni mtu binafsi, biashara, kampuni au aina nyingine.", descriptionEn: "Choose whether you are an individual, business, company, or another type." },
      { id: "prepare-docs", titleSw: "Andaa nyaraka", titleEn: "Prepare documents", descriptionSw: "Hakikisha NIDA/NIN, mawasiliano na taarifa za biashara zipo sawa.", descriptionEn: "Ensure your NIDA/NIN, contact, and business details are accurate." },
      { id: "submit", titleSw: "Fuata njia rasmi", titleEn: "Use official channel", descriptionSw: "Wasilisha kupitia ofisi au mfumo rasmi wa TRA kama unapatikana.", descriptionEn: "Submit through TRA office or official TRA digital channel where available." }
    ],
    commonMistakesSw: ["Kuchanganya TIN ya binafsi na ya biashara", "Kutoweka anuani sahihi", "Kutosasisha taarifa zikibadilika"],
    commonMistakesEn: ["Confusing personal and business TIN use", "Using incorrect address details", "Not updating changed details"],
    faqs: [],
    lastVerifiedAt: "2026-05-08",
    disclaimer: guideDisclaimer
  },
  {
    id: "svc-passport",
    slug: "passport-application",
    categoryId: "travel",
    titleSw: "Maombi ya Pasipoti",
    titleEn: "Passport Application",
    summarySw: "Mwongozo wa kujiandaa kwa maombi ya pasipoti ya Tanzania.",
    summaryEn: "A preparation guide for applying for a Tanzanian passport.",
    whoNeedsItSw: "Mtanzania anayepanga kusafiri nje ya nchi au anayehitaji pasipoti mpya.",
    whoNeedsItEn: "Tanzanians planning international travel or needing a new passport.",
    estimatedTime: "Varies by application type and verification",
    estimatedCostNote: "Fees may change. Please confirm through the official portal or office.",
    officialUrl: "TO_BE_VERIFIED",
    physicalLocationNote: "Confirm appointment and office requirements through official immigration channels.",
    complexity: "Detailed",
    keywords: ["passport", "pasipoti", "immigration", "uhamiaji", "travel document"],
    requiredDocuments: [
      { id: "birth", titleSw: "Cheti cha kuzaliwa", titleEn: "Birth certificate" },
      { id: "nida", titleSw: "NIDA/NIN", titleEn: "NIDA/NIN" },
      { id: "photos", titleSw: "Picha za pasipoti kama zitaombwa", titleEn: "Passport photos if requested" }
    ],
    steps: [
      { id: "check-type", titleSw: "Tambua aina ya pasipoti", titleEn: "Confirm passport type", descriptionSw: "Hakiki aina ya maombi na mahitaji yake kupitia chanzo rasmi.", descriptionEn: "Confirm the application type and requirements through official sources." },
      { id: "prepare", titleSw: "Andaa nyaraka", titleEn: "Prepare documents", descriptionSw: "Kagua majina na tarehe kwenye cheti, NIDA na nyaraka nyingine.", descriptionEn: "Check names and dates across your birth certificate, NIDA, and other documents." },
      { id: "official", titleSw: "Fungua tovuti rasmi", titleEn: "Open official portal", descriptionSw: "Tumia mfumo rasmi au ofisi husika kwa hatua za mwisho.", descriptionEn: "Use the official system or relevant office for final steps." }
    ],
    commonMistakesSw: ["Majina kutofautiana", "Kuchelewa kuhakiki appointment", "Kudhani ada ni ileile bila kuthibitisha"],
    commonMistakesEn: ["Names not matching", "Not confirming appointment details", "Assuming fees without confirmation"],
    faqs: [],
    lastVerifiedAt: "2026-05-08",
    disclaimer: guideDisclaimer
  },
  {
    id: "svc-driving-renewal",
    slug: "driving-licence-renewal",
    categoryId: "transport",
    titleSw: "Renewal ya Leseni ya Udereva",
    titleEn: "Driving Licence Renewal",
    summarySw: "Mwongozo wa kujiandaa kuhuisha leseni ya udereva.",
    summaryEn: "A guide for preparing to renew a driving licence.",
    whoNeedsItSw: "Dereva mwenye leseni inayokaribia kuisha au iliyoisha muda wake.",
    whoNeedsItEn: "Drivers whose licence is expiring or expired.",
    estimatedTime: "Varies by channel and verification",
    estimatedCostNote: "Fees may change. Please confirm through the official portal or office.",
    officialUrl: "TO_BE_VERIFIED",
    physicalLocationNote: "Confirm whether you need TRA, police, or licensing office steps through official guidance.",
    complexity: "Medium",
    keywords: ["driving licence", "leseni", "renewal", "udereva", "traffic"],
    requiredDocuments: [
      { id: "old-licence", titleSw: "Leseni ya zamani", titleEn: "Existing licence" },
      { id: "nida", titleSw: "NIDA/NIN", titleEn: "NIDA/NIN" },
      { id: "tin", titleSw: "TIN kama itaombwa", titleEn: "TIN if requested" }
    ],
    steps: [
      { id: "expiry", titleSw: "Kagua tarehe ya mwisho", titleEn: "Check expiry date", descriptionSw: "Angalia kama renewal inahitajika sasa au unaweza kuweka reminder.", descriptionEn: "Check whether renewal is due now or if you should set a reminder." },
      { id: "requirements", titleSw: "Hakiki mahitaji", titleEn: "Confirm requirements", descriptionSw: "Tumia chanzo rasmi kuthibitisha ada, nyaraka na njia ya malipo.", descriptionEn: "Use official guidance to confirm fees, documents, and payment method." },
      { id: "renew", titleSw: "Fanya renewal", titleEn: "Complete renewal", descriptionSw: "Fuata mfumo au ofisi rasmi kwa hatua za mwisho.", descriptionEn: "Follow the official system or office for final steps." }
    ],
    commonMistakesSw: ["Kusahau tarehe ya mwisho", "Kutokagua madaraja ya leseni", "Kudhani malipo bila uthibitisho"],
    commonMistakesEn: ["Forgetting expiry date", "Not checking licence classes", "Assuming payment details without confirmation"],
    faqs: [],
    lastVerifiedAt: "2026-05-08",
    disclaimer: guideDisclaimer
  },
  {
    id: "svc-birth-certificate",
    slug: "birth-certificate-application",
    categoryId: "civil",
    titleSw: "Maombi ya Cheti cha Kuzaliwa",
    titleEn: "Birth Certificate Application",
    summarySw: "Mwongozo wa kuandaa taarifa za kupata cheti cha kuzaliwa.",
    summaryEn: "A guide for preparing birth certificate application information.",
    whoNeedsItSw: "Mtoto, mzazi/mlezi au mtu mzima anayehitaji cheti kwa shule, pasipoti, NIDA au huduma nyingine.",
    whoNeedsItEn: "A child, parent/guardian, or adult needing a certificate for school, passport, NIDA, or other services.",
    estimatedTime: "Varies by record availability and office workload",
    estimatedCostNote: "Fees may change. Please confirm through the official portal or office.",
    officialUrl: "TO_BE_VERIFIED",
    physicalLocationNote: "Confirm the relevant civil registration office or official channel.",
    complexity: "Medium",
    keywords: ["birth certificate", "cheti cha kuzaliwa", "rita", "kuzaliwa"],
    requiredDocuments: [
      { id: "birth-notification", titleSw: "Taarifa/uthibitisho wa kuzaliwa kama upo", titleEn: "Birth notification or proof if available" },
      { id: "parent-details", titleSw: "Taarifa za wazazi/walezi", titleEn: "Parent/guardian details" },
      { id: "id", titleSw: "Kitambulisho cha mwombaji kama kitaombwa", titleEn: "Applicant ID if requested" }
    ],
    steps: [
      { id: "collect", titleSw: "Kusanya taarifa", titleEn: "Collect details", descriptionSw: "Andaa majina kamili, tarehe na mahali pa kuzaliwa.", descriptionEn: "Prepare full names, date, and place of birth." },
      { id: "verify", titleSw: "Hakiki rekodi", titleEn: "Verify record", descriptionSw: "Fuata njia rasmi ya kuthibitisha au kuanzisha rekodi.", descriptionEn: "Use official steps to verify or create the record." },
      { id: "collect-cert", titleSw: "Pokea cheti", titleEn: "Collect certificate", descriptionSw: "Hifadhi cheti mahali salama na weka reminder kama kina matumizi ya muda maalum.", descriptionEn: "Keep the certificate safely and set reminders if needed for deadlines." }
    ],
    commonMistakesSw: ["Majina ya mzazi kutolingana", "Kukosa tarehe sahihi", "Kuchelewa kufuatilia rekodi"],
    commonMistakesEn: ["Parent names not matching", "Incorrect dates", "Delaying record follow-up"],
    faqs: [],
    lastVerifiedAt: "2026-05-08",
    disclaimer: guideDisclaimer
  },
  {
    id: "svc-business-name",
    slug: "business-name-registration",
    categoryId: "business",
    titleSw: "Usajili wa Jina la Biashara",
    titleEn: "Business Name Registration",
    summarySw: "Mwongozo wa kujiandaa kusajili jina la biashara.",
    summaryEn: "A guide for preparing to register a business name.",
    whoNeedsItSw: "Mjasiriamali au mfanyabiashara anayetaka kutumia jina rasmi la biashara.",
    whoNeedsItEn: "Entrepreneurs who want to trade using a registered business name.",
    estimatedTime: "Varies by name availability and verification",
    estimatedCostNote: "Fees may change. Please confirm through the official portal or office.",
    officialUrl: "TO_BE_VERIFIED",
    physicalLocationNote: "Use the official BRELA channel or authorized office guidance.",
    complexity: "Medium",
    keywords: ["brela", "business name", "jina la biashara", "kusajili biashara"],
    requiredDocuments: [
      { id: "owner-id", titleSw: "NIDA/NIN ya mmiliki", titleEn: "Owner NIDA/NIN" },
      { id: "business-name", titleSw: "Majina mbadala ya biashara", titleEn: "Alternative business names" },
      { id: "address", titleSw: "Anuani ya biashara", titleEn: "Business address" }
    ],
    steps: [
      { id: "choose-name", titleSw: "Chagua jina", titleEn: "Choose a name", descriptionSw: "Andaa majina 2-3 ili kuepuka kuchelewa jina likikataliwa.", descriptionEn: "Prepare 2-3 names in case one is rejected." },
      { id: "search", titleSw: "Fanya name search", titleEn: "Do name search", descriptionSw: "Tumia njia rasmi kuthibitisha upatikanaji wa jina.", descriptionEn: "Use official channels to confirm name availability." },
      { id: "register", titleSw: "Sajili jina", titleEn: "Register the name", descriptionSw: "Kamilisha usajili na hifadhi cheti/reference.", descriptionEn: "Complete registration and keep the certificate/reference." }
    ],
    commonMistakesSw: ["Kuchagua jina linalofanana na lingine", "Kutokuwa na anuani ya biashara", "Kudhani jina ni kampuni"],
    commonMistakesEn: ["Choosing a name too similar to another", "No business address", "Assuming a business name is a company"],
    faqs: [
      { questionSw: "Jina la biashara ni kampuni?", questionEn: "Is a business name a company?", answerSw: "Si lazima. Mara nyingi ni jina la biashara, si limited company.", answerEn: "Not necessarily. It is often a trading name, not a limited company." }
    ],
    lastVerifiedAt: "2026-05-08",
    disclaimer: guideDisclaimer
  },
  {
    id: "svc-company-registration",
    slug: "limited-company-registration",
    categoryId: "business",
    titleSw: "Usajili wa Limited Company",
    titleEn: "Limited Company Registration",
    summarySw: "Mwongozo wa kujiandaa kusajili kampuni yenye wanahisa/wakurugenzi.",
    summaryEn: "A guide for preparing to register a company with shareholders/directors.",
    whoNeedsItSw: "Biashara inayohitaji muundo rasmi zaidi, washirika, mikataba, zabuni au ukuaji.",
    whoNeedsItEn: "Businesses needing a formal structure, partners, contracts, tenders, or growth readiness.",
    estimatedTime: "Varies by document readiness and verification",
    estimatedCostNote: "Fees may change. Please confirm through the official portal or office.",
    officialUrl: "TO_BE_VERIFIED",
    physicalLocationNote: "Use the official BRELA channel or professional guidance where needed.",
    complexity: "Detailed",
    keywords: ["company", "limited company", "kampuni", "brela", "wanahisa", "directors"],
    requiredDocuments: [
      { id: "directors", titleSw: "Taarifa za wakurugenzi", titleEn: "Director details" },
      { id: "shareholders", titleSw: "Taarifa za wanahisa", titleEn: "Shareholder details" },
      { id: "address", titleSw: "Anuani ya kampuni", titleEn: "Company address" }
    ],
    steps: [
      { id: "structure", titleSw: "Chagua muundo", titleEn: "Choose structure", descriptionSw: "Elewana kuhusu wakurugenzi, wanahisa na majukumu.", descriptionEn: "Agree on directors, shareholders, and responsibilities." },
      { id: "name", titleSw: "Name search/reservation", titleEn: "Name search/reservation", descriptionSw: "Hakiki jina kupitia chanzo rasmi.", descriptionEn: "Confirm the name through official channels." },
      { id: "submit", titleSw: "Wasilisha nyaraka", titleEn: "Submit documents", descriptionSw: "Kamilisha fomu na nyaraka kulingana na maelekezo rasmi.", descriptionEn: "Complete forms and documents according to official guidance." },
      { id: "post-reg", titleSw: "Panga compliance", titleEn: "Plan compliance", descriptionSw: "Weka reminders za kodi, returns, leseni na rekodi.", descriptionEn: "Set reminders for tax, returns, licences, and records." }
    ],
    commonMistakesSw: ["Kutokubaliana mapema kuhusu hisa", "Kutotunza rekodi za kampuni", "Kusahau obligations za baada ya usajili"],
    commonMistakesEn: ["Not agreeing on shares early", "Poor company records", "Forgetting post-registration obligations"],
    faqs: [],
    lastVerifiedAt: "2026-05-08",
    disclaimer: guideDisclaimer
  },
  {
    id: "svc-business-licence",
    slug: "business-licence-application",
    categoryId: "business",
    titleSw: "Maombi ya Leseni ya Biashara",
    titleEn: "Business Licence Application",
    summarySw: "Mwongozo wa kujiandaa kuomba leseni ya biashara kulingana na eneo na aina ya shughuli.",
    summaryEn: "A guide for preparing to apply for a business licence based on location and activity.",
    whoNeedsItSw: "Mfanyabiashara anayehitaji ruhusa ya kuendesha biashara katika eneo au sekta fulani.",
    whoNeedsItEn: "Business owners who need permission to operate in a location or sector.",
    estimatedTime: "Varies by local authority, sector, and inspection requirements",
    estimatedCostNote: "Fees may change by location and business type. Confirm with official source.",
    officialUrl: "TO_BE_VERIFIED",
    physicalLocationNote: "Confirm local government or sector regulator requirements before payment.",
    complexity: "Detailed",
    keywords: ["business licence", "leseni ya biashara", "permit", "halmashauri", "municipal"],
    requiredDocuments: [
      { id: "registration", titleSw: "Cheti/reference ya usajili wa biashara", titleEn: "Business registration certificate/reference" },
      { id: "tin", titleSw: "TIN", titleEn: "TIN" },
      { id: "premise", titleSw: "Taarifa za eneo la biashara", titleEn: "Business premises details" }
    ],
    steps: [
      { id: "activity", titleSw: "Tambua aina ya biashara", titleEn: "Identify activity", descriptionSw: "Biashara ya chakula, duka, huduma au usafirishaji inaweza kuwa na mahitaji tofauti.", descriptionEn: "Food, retail, service, or transport businesses can have different requirements." },
      { id: "authority", titleSw: "Tambua mamlaka husika", titleEn: "Identify authority", descriptionSw: "Angalia kama ni halmashauri, wizara, au regulator wa sekta.", descriptionEn: "Check whether it is local government, a ministry, or sector regulator." },
      { id: "apply", titleSw: "Wasilisha maombi", titleEn: "Submit application", descriptionSw: "Fuata fomu, ukaguzi na malipo kupitia njia rasmi.", descriptionEn: "Follow forms, inspections, and payments through official channels." }
    ],
    commonMistakesSw: ["Kuomba leseni isiyolingana na shughuli", "Kusahau renewal", "Kutokagua mahitaji ya eneo"],
    commonMistakesEn: ["Applying for the wrong licence type", "Forgetting renewal", "Not checking location-specific requirements"],
    faqs: [],
    lastVerifiedAt: "2026-05-08",
    disclaimer: guideDisclaimer
  },
  {
    id: "svc-tax-deadlines",
    slug: "tax-deadline-reminders",
    categoryId: "tax",
    titleSw: "Kuweka Reminders za Kodi",
    titleEn: "Tax Deadline Reminder Guide",
    summarySw: "Mwongozo wa kuweka kumbukumbu za tarehe muhimu za kodi na compliance.",
    summaryEn: "A guide for setting reminders for tax and compliance dates.",
    whoNeedsItSw: "Mfanyabiashara, freelancer au kampuni inayotaka kuepuka kusahau deadlines.",
    whoNeedsItEn: "Business owners, freelancers, or companies who want to avoid missed deadlines.",
    estimatedTime: "15-30 minutes to organize reminders",
    estimatedCostNote: "No app fee in MVP. Tax penalties and official fees must be confirmed with official sources.",
    officialUrl: "TO_BE_VERIFIED",
    physicalLocationNote: "Consult TRA or a qualified professional for tax-specific obligations.",
    complexity: "Easy",
    keywords: ["tax reminders", "kodi", "deadline", "tra", "returns", "efd", "vfd"],
    requiredDocuments: [
      { id: "tin", titleSw: "TIN", titleEn: "TIN" },
      { id: "registration", titleSw: "Taarifa za usajili wa biashara", titleEn: "Business registration details" },
      { id: "calendar", titleSw: "Kalenda ya biashara", titleEn: "Business calendar" }
    ],
    steps: [
      { id: "list", titleSw: "Orodhesha obligations", titleEn: "List obligations", descriptionSw: "Andika kodi, returns, leseni na renewal zinazokuhusu.", descriptionEn: "List taxes, returns, licences, and renewals that apply to you." },
      { id: "confirm", titleSw: "Hakiki tarehe rasmi", titleEn: "Confirm official dates", descriptionSw: "Tumia chanzo rasmi au mtaalamu kuthibitisha tarehe.", descriptionEn: "Use official sources or a professional to confirm dates." },
      { id: "reminders", titleSw: "Weka reminders", titleEn: "Set reminders", descriptionSw: "Weka reminder kabla ya deadline na siku ya deadline.", descriptionEn: "Set reminders before the deadline and on the deadline date." }
    ],
    commonMistakesSw: ["Kusubiri siku ya mwisho", "Kutojua obligations zako", "Kuchanganya kodi binafsi na biashara"],
    commonMistakesEn: ["Waiting until the last day", "Not knowing your obligations", "Mixing personal and business tax matters"],
    faqs: [],
    lastVerifiedAt: "2026-05-08",
    disclaimer: guideDisclaimer
  }
];
