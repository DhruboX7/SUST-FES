import { TreeSpecies } from '../types';
import { Language } from '../contexts/LanguageContext';

export interface SpeciesBnData {
  distributionBn?: string;
  habitatBn?: string;
  silviculturalNotesBn?: string;
}

export const SPECIES_BN_DICTIONARY: Record<string, SpeciesBnData> = {
  'spec-1': {
    distributionBn: 'বাংলাদেশের সকল জেলায় ব্যাপকভাবে রোপিত ও বিস্তৃত',
    habitatBn: 'পলল প্লাবনভূমি, রাস্তার ধার, উন্মুক্ত পার্ক ও গ্রামীণ বসতবাড়ি',
    silviculturalNotesBn: 'বিশাল ছাতার মতো বিস্তারকারী চাঁদোয়া। মেঘলা বা বৃষ্টির আবহাওয়ায় এবং রাতে এর পাতা সংকুচিত হয়। দ্রুত বর্ধনশীল ও নাইট্রোজেন সংবন্ধনকারী।',
  },
  'Albizia saman': {
    distributionBn: 'বাংলাদেশের সকল জেলায় ব্যাপকভাবে রোপিত ও বিস্তৃত',
    habitatBn: 'পলল প্লাবনভূমি, রাস্তার ধার, উন্মুক্ত পার্ক ও গ্রামীণ বসতবাড়ি',
    silviculturalNotesBn: 'বিশাল ছাতার মতো বিস্তারকারী চাঁদোয়া। মেঘলা বা বৃষ্টির আবহাওয়ায় এবং রাতে এর পাতা সংকুচিত হয়। দ্রুত বর্ধনশীল ও নাইট্রোজেন সংবন্ধনকারী।',
  },
  'spec-2': {
    distributionBn: 'সারা দেশজুড়ে; সিলেট, গাজীপুর ও মধুপুরের বিস্তৃত বাণিজ্যিক কৃষি-বনাঞ্চলে প্রাচুর্যপূর্ণ',
    habitatBn: 'সুনিষ্কাশিত উঁচু লাল মাটির টিলা, চত্বর ও গ্রামীণ বসতবাড়ি',
    silviculturalNotesBn: 'চিরসবুজ বৃক্ষ, কাণ্ডের গায়ে সরাসরি বড় ফল ধরে। এর কাঠ সোনালী-হলুদ বর্ণের এবং উইপোকা ও ছত্রাক প্রতিরোধী উৎকৃষ্ট আসবাবের কাঠ।',
  },
  'Artocarpus heterophyllus': {
    distributionBn: 'সারা দেশজুড়ে; সিলেট, গাজীপুর ও মধুপুরের বিস্তৃত বাণিজ্যিক কৃষি-বনাঞ্চলে প্রাচুর্যপূর্ণ',
    habitatBn: 'সুনিষ্কাশিত উঁচু লাল মাটির টিলা, চত্বর ও গ্রামীণ বসতবাড়ি',
    silviculturalNotesBn: 'চিরসবুজ বৃক্ষ, কাণ্ডের গায়ে সরাসরি বড় ফল ধরে। এর কাঠ সোনালী-হলুদ বর্ণের এবং উইপোকা ও ছত্রাক প্রতিরোধী উৎকৃষ্ট আসবাবের কাঠ।',
  },
  'spec-3': {
    distributionBn: 'সিলেট, চট্টগ্রাম এবং সমগ্র বাংলাদেশের বসতবাড়ির বাগানে বিস্তৃত',
    habitatBn: 'আর্দ্র আধা-চিরসবুজ ও চিরসবুজ মিশ্র বনভূমি এবং বসতবাড়ির বাগান',
    silviculturalNotesBn: 'মাঝারি আকারের চিরসবুজ বৃক্ষ। এপ্রিল-মে মাসে সুগন্ধি সাদা থোকায় ফুল ফোটে এবং শরৎ ও শীতের শুরুতে ফল পাকে।',
  },
  'Elaeocarpus robustus': {
    distributionBn: 'সিলেট, চট্টগ্রাম এবং সমগ্র বাংলাদেশের বসতবাড়ির বাগানে বিস্তৃত',
    habitatBn: 'আর্দ্র আধা-চিরসবুজ ও চিরসবুজ মিশ্র বনভূমি এবং বসতবাড়ির বাগান',
    silviculturalNotesBn: 'মাঝারি আকারের চিরসবুজ বৃক্ষ। এপ্রিল-মে মাসে সুগন্ধি সাদা থোকায় ফুল ফোটে এবং শরৎ ও শীতের শুরুতে ফল পাকে।',
  },
  'spec-4': {
    distributionBn: 'মহাসড়ক, প্রাতিষ্ঠানিক ক্যাম্পাস ও সিলেটের চা বাগানের পাশে ব্যাপকভাবে রোপিত',
    habitatBn: 'আর্দ্র উর্বর মাটির সড়ক, বোটানিক্যাল গার্ডেন এবং ক্যাম্পাসের সীমানা',
    silviculturalNotesBn: '৩৫-৪০ মিটার উঁচু সুদৃশ্য দীর্ঘ বৃক্ষ, যার মসৃণ সাদাটে-ধূসর সোজা কাণ্ড এবং চমৎকার সূক্ষ্ম যৌগিক পাতা রয়েছে।',
  },
  'Albizia richardiana': {
    distributionBn: 'মহাসড়ক, প্রাতিষ্ঠানিক ক্যাম্পাস ও সিলেটের চা বাগানের পাশে ব্যাপকভাবে রোপিত',
    habitatBn: 'আর্দ্র উর্বর মাটির সড়ক, বোটানিক্যাল গার্ডেন এবং ক্যাম্পাসের সীমানা',
    silviculturalNotesBn: '৩৫-৪০ মিটার উঁচু সুদৃশ্য দীর্ঘ বৃক্ষ, যার মসৃণ সাদাটে-ধূসর সোজা কাণ্ড এবং চমৎকার সূক্ষ্ম যৌগিক পাতা রয়েছে।',
  },
  'spec-5': {
    distributionBn: 'বাংলাদেশের প্রতিটি ইউনিয়ন ও গ্রামে প্রাকৃতিকভাবে বিদ্যমান',
    habitatBn: 'নিচু সমতলভূমি, রাস্তার পাশ, গ্রামীণ হাট ও প্রাচীন ঐতিহ্যবাহী স্থান',
    silviculturalNotesBn: 'স্তম্ভমূল বা ঝুড়িমূল বিশিষ্ট বিশাল বিস্তারকারী বৃক্ষ। পাখি, বাদুড় ও অন্যান্য প্রাণীর জন্য অত্যন্ত গুরুত্বপূর্ণ খাদ্যের উৎস।',
  },
  'Ficus benghalensis': {
    distributionBn: 'বাংলাদেশের প্রতিটি ইউনিয়ন ও গ্রামে প্রাকৃতিকভাবে বিদ্যমান',
    habitatBn: 'নিচু সমতলভূমি, রাস্তার পাশ, গ্রামীণ হাট ও প্রাচীন ঐতিহ্যবাহী স্থান',
    silviculturalNotesBn: 'স্তম্ভমূল বা ঝুড়িমূল বিশিষ্ট বিশাল বিস্তারকারী বৃক্ষ। পাখি, বাদুড় ও অন্যান্য প্রাণীর জন্য অত্যন্ত গুরুত্বপূর্ণ খাদ্যের উৎস।',
  },
  'spec-6': {
    distributionBn: 'সমগ্র বাংলাদেশ জুড়ে প্রচুর পরিমাণে পাওয়া যায়; শাবিপ্রবি ক্যাম্পাসের টিলা ও লেকের পাড়ে বিশেষভাবে সুপরিচিত',
    habitatBn: 'আর্দ্র পললভূমি, নদী ও খালের তীরবর্তী অঞ্চল এবং জলাভূমির সীমানা',
    silviculturalNotesBn: 'দ্রুত বর্ধনশীল অগ্রগামী বৃক্ষ। বর্ষাকালে এর আকর্ষণীয় গোল কমলা রঙের সুগন্ধি ফুল ফোটে। সমর্থক নাম: Anthocephalus indicus / Anthocephalus chinensis।',
  },
  'Neolamarckia cadamba': {
    distributionBn: 'সমগ্র বাংলাদেশ জুড়ে প্রচুর পরিমাণে পাওয়া যায়; শাবিপ্রবি ক্যাম্পাসের টিলা ও লেকের পাড়ে বিশেষভাবে সুপরিচিত',
    habitatBn: 'আর্দ্র পললভূমি, নদী ও খালের তীরবর্তী অঞ্চল এবং জলাভূমির সীমানা',
    silviculturalNotesBn: 'দ্রুত বর্ধনশীল অগ্রগামী বৃক্ষ। বর্ষাকালে এর আকর্ষণীয় গোল কমলা রঙের সুগন্ধি ফুল ফোটে। সমর্থক নাম: Anthocephalus indicus / Anthocephalus chinensis।',
  },
  'Shorea robusta': {
    distributionBn: 'ঢাকা, ময়মনসিংহ, টাঙ্গাইল ও দিনাজপুর-রংপুর শাল বনভূমি',
    habitatBn: 'শুষ্ক ও আর্দ্র পত্রঝরা শাল বন এবং লাল মাটির সোপান অঞ্চল',
    silviculturalNotesBn: 'বাংলাদেশের অন্যতম প্রধান শক্ত কাঠের প্রজাতি। সোজা ও লম্বা কাণ্ড বিশিষ্ট বৃহৎ পত্রঝরা বৃক্ষ।',
  },
  'Tectona grandis': {
    distributionBn: 'চট্টগ্রাম, পার্বত্য চট্টগ্রাম ও সিলেটের পাহাড়ি বনভূমি এবং বাগান',
    habitatBn: 'সুনিষ্কাশিত গভীর পাহাড়ি মাটি ও আর্দ্র ক্রান্তীয় বনভূমি',
    silviculturalNotesBn: 'বিশ্বখ্যাত মূল্যবান সেগুন কাঠ। অত্যন্ত দীর্ঘস্থায়ী, উইপোকা প্রতিরোধী এবং সোনালী বাদামী টেক্সচারযুক্ত।',
  },
  'Heritiera fomes': {
    distributionBn: 'সুন্দরবন ম্যানগ্রোভ উপকূলীয় বনাঞ্চল',
    habitatBn: 'জোয়ার-ভাটা প্লাবিত কাদা ও লোনা পানির ম্যানগ্রোভ বন',
    silviculturalNotesBn: 'সুন্দরবনের প্রধান সুন্দরী গাছ, যার শ্বাসমূল (Pneumatophores) রয়েছে। লবণাক্ততা সহনশীল শক্ত কাঠের বৃক্ষ।',
  },
  'Swietenia macrophylla': {
    distributionBn: 'সমগ্র বাংলাদেশের সামাজিক বনায়ন ও ব্যক্তিগত কাঠের বাগান',
    habitatBn: 'সুনিষ্কাশিত উর্বর সমতল ভূমি ও বসতবাড়ির সংলগ্ন এলাকা',
    silviculturalNotesBn: 'দ্রুত বর্ধনশীল মেহগনি গাছ। লালচে-বাদামী টেক্সচারের মূল্যবান আসবাব কাঠ হিসেবে সমাদৃত।',
  },
  'Dipterocarpus turbinatus': {
    distributionBn: 'চট্টগ্রাম, পার্বত্য চট্টগ্রাম ও সিলেটের ক্রান্তীয় চিরসবুজ ও আধা-চিরসবুজ পাহাড়ি বনভূমি',
    habitatBn: 'উঁচু পাহাড়ি ঢাল ও আর্দ্র উপত্যকা',
    silviculturalNotesBn: 'বাংলাদেশের সবচেয়ে উঁচু স্থানীয় গর্জন বৃক্ষ (৪০-৫০ মিটার)। দীর্ঘ সোজা কাণ্ড ও রেজিন উৎপাদক।',
  },
  'Azadirachta indica': {
    distributionBn: 'বাংলাদেশের উত্তর ও পশ্চিমাঞ্চল সহ প্রায় সর্বত্র',
    habitatBn: 'শুষ্ক ও আধা-শুষ্ক সমতল ভূমি, বসতবাড়ি ও রাস্তার পাশ',
    silviculturalNotesBn: 'বহুবিধ ঔষধি গুণসম্পন্ন নিম গাছ। এর পাতা, বাকল ও বীজ প্রাকৃতিক কীটনাশক ও জীবাণুনাশক।',
  },
};

/**
 * Ecosystem translations
 */
export const ECOSYSTEM_BN_MAP: Record<string, string> = {
  'Sundarbans Mangrove Tidal Forest': 'সুন্দরবন ম্যানগ্রোভ জোয়ার-ভাটা বনভূমি',
  'Madhupur & Barind Moist Deciduous Sal Forest': 'মধুপুর ও বরেন্দ্র আর্দ্র পর্ণমোচী শাল বনভূমি',
  'Sylhet & Chittagong Hill Tracts Semi-Evergreen Forest': 'সিলেট ও পার্বত্য চট্টগ্রাম পাহাড়ি আধা-চিরসবুজ বনভূমি',
  'Plains, Alluvial Basin & Homestead Forestry': 'সমতল প্লাবনভূমি ও বসতবাড়ির সামাজিক বনায়ন',
};

/**
 * Conservation status translations
 */
export const CONSERVATION_STATUS_BN_MAP: Record<string, string> = {
  'Least Concern (Introduced)': 'কম ঝুঁকিপূর্ণ (বিদেশী)',
  'Least Concern (IUCN)': 'কম ঝুঁকিপূর্ণ (IUCN)',
  'Least Concern (Cultivated)': 'কম ঝুঁকিপূর্ণ (রোপিত)',
  'Least Concern': 'কম ঝুঁকিপূর্ণ',
  'Vulnerable (IUCN)': 'ঝুঁকিপূর্ণ / সংবেদনশীল (IUCN)',
  'Vulnerable': 'ঝুঁকিপূর্ণ / সংবেদনশীল',
  'Critically Endangered (IUCN)': 'মহাবিপন্ন (IUCN)',
  'Critically Endangered': 'মহাবিপন্ন',
  'Endangered (IUCN)': 'বিপন্ন (IUCN)',
  'Endangered': 'বিপন্ন',
  'Near Threatened (IUCN)': 'প্রায় সংকটাপন্ন (IUCN)',
  'Near Threatened': 'প্রায় সংকটাপন্ন',
};

/**
 * Common Uses translations
 */
export const USES_BN_MAP: Record<string, string> = {
  'Shade Tree': 'ছায়াদানকারী বৃক্ষ',
  'Timber': 'কাঠ',
  'Fuelwood': 'জ্বালানি কাঠ',
  'Avenue Plantation': 'সড়ক বনায়ন',
  'Fodder': 'পশুখাদ্য',
  'National Fruit of Bangladesh': 'জাতীয় ফল',
  'High-Grade Furniture Timber': 'উন্নত আসবাবপত্র কাঠ',
  'Musical Instruments': 'বাদ্যযন্ত্র তৈরি',
  'Livestock Fodder': 'গবাদিপশুর খাদ্য',
  'Edible Sour Fruit & Pickles': 'ভোজ্য টক ফল ও আচার',
  'Light Construction Wood': 'হালকা নির্মাণ কাঠ',
  'Medicinal': 'ভেষজ ও ঔষধি ব্যবহার',
  'Avenue Shade': 'সড়কের ছায়াদান',
  'Light Timber': 'হালকা কাঠ',
  'Packing Boxes': 'প্যাকিং বাক্স তৈরি',
  'Windbreak': 'বায়ুপ্রতিরোধক',
  'Ecological Keystone Species': 'বাস্তুতান্ত্রিক প্রধান প্রজাতি',
  'Avian Food Resource': 'পাখির খাদ্যের উৎস',
  'Dense Shade': 'নিবিড় ছায়া',
  'Medicinal Aerial Roots': 'ঔষধি ঝুড়িমূল',
  'Match Manufacture': 'দিয়াশলাই তৈরি',
  'Paper Pulp': 'কাগজের মণ্ড',
  'Fragrant Monsoon Blooms': 'সুগন্ধি বর্ষার ফুল',
  'Light Boxes': 'হালকা বাক্স তৈরি',
  'Heavy Construction': 'ভারী নির্মাণ কাজ',
  'Railway Sleepers': 'রেলওয়ে স্লিপার',
  'Shipbuilding': 'নৌযান ও জাহাজ নির্মাণ',
  'House Posts': 'ঘরের খুঁটি',
  'Plywood': 'প্লাইউড',
  'Veneer': 'ভিনিয়ার',
  'Resin / Oleoresin': 'রেজিন / ধূপ',
  'Boat Building': 'নৌকা তৈরি',
};

/**
 * Helper to get localized species field with fallback hierarchy:
 * 1. sp[field + 'Bn']
 * 2. SPECIES_BN_DICTIONARY[sp.scientificName] / [sp.id]
 * 3. Original English text
 */
export function getLocalizedSpeciesField(
  sp: TreeSpecies,
  field: 'distribution' | 'habitat' | 'silviculturalNotes',
  lang: Language
): string {
  if (lang !== 'bn') {
    return sp[field] || '';
  }

  // 1. Direct model field
  const directBnField = `${field}Bn` as keyof TreeSpecies;
  if (sp[directBnField] && typeof sp[directBnField] === 'string') {
    return sp[directBnField] as string;
  }

  // 2. Dictionary lookup by ID or scientific name
  const dictEntry = SPECIES_BN_DICTIONARY[sp.id] || SPECIES_BN_DICTIONARY[sp.scientificName];
  if (dictEntry) {
    const dictBn = dictEntry[`${field}Bn` as keyof SpeciesBnData];
    if (dictBn) return dictBn;
  }

  return sp[field] || '';
}

export function getLocalizedEcosystem(eco: string | undefined, lang: Language): string {
  if (!eco) return '';
  if (lang === 'bn') {
    return ECOSYSTEM_BN_MAP[eco] || eco;
  }
  return eco;
}

export function getLocalizedConservationStatus(status: string, lang: Language): string {
  if (lang === 'bn') {
    return CONSERVATION_STATUS_BN_MAP[status] || status;
  }
  return status;
}

export function getLocalizedUse(use: string, lang: Language): string {
  if (lang === 'bn') {
    return USES_BN_MAP[use] || use;
  }
  return use;
}
