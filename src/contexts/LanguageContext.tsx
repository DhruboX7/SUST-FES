import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & App Bar
    catalog: 'Study Catalog',
    pyq: 'Exam Bank',
    academics: 'Academics',
    explore: 'Explore',
    syllabus: 'Curriculum & Syllabus',
    progress: 'Progress Tracker',
    notices: 'Notices & Routine',
    cgpa: 'CGPA Tool',
    bookmarks: 'Saved',
    species: 'Tree Species',
    gallery: 'Field Gallery',
    theses: 'Thesis Archive',
    faculty: 'Faculty',
    about: 'About FES',
    manage: 'Manage',
    contribute: 'Contribute',
    adminEntry: 'Admin Entry',
    navGroupAcademics: 'Academics',
    navGroupTools: 'Student Tools',
    navGroupForestry: 'Forestry & Research',
    navGroupDepartment: 'Department',
    navMenu: 'Menu',
    closeMenu: 'Close Menu',

    // Brand & University
    deptTitle: 'Department of Forestry & Environmental Science',
    uniTitle: 'Shahjalal University of Science and Technology',
    sustSylhet: 'SUST, Sylhet',
    academicArchiveFooter: 'Academic Knowledge Archive · Non-Commercial Educational Directory',

    // Hero Section
    heroSubtitle: 'Official academic archive for lecture slides, class handouts, previous year exam questions, and field practical manuals.',
    searchPlaceholder: 'Search by course code (e.g. FES 08211121, Silviculture), topic, or teacher...',
    clearSearch: 'Clear Search',
    scanKeywords: 'Scan Keywords:',
    filterLabel: 'Filter:',
    examBankPyqs: 'Exam Bank (PYQs)',
    lectureSlides: 'Lecture Slides',
    classNotes: 'Class Notes',
    labFieldManuals: 'Lab & Field Manuals',
    archivedResources: 'Archived Resources',
    examQuestionPapers: 'Exam Question Papers',
    bscMscCourses: 'B.Sc. & M.Sc. Courses',
    contributeResource: 'Contribute Resource',

    // Routine & Calendar Section
    routineCalendarHeading: 'Class Routine Calendar',
    routineCalendarSubtitle: 'Live departmental schedule with day-by-day classes, venues, and timings',
    fullTimetable: 'Full Timetable',
    yearLabel: 'Year:',
    semLabel: 'Sem:',
    today: 'Today',
    happeningNow: 'Happening Now',
    upcomingToday: 'Upcoming Today',
    completed: 'Completed',
    classesScheduled: 'Classes Scheduled',
    classScheduledSingular: 'Class Scheduled',
    noClassesScheduled: 'No Classes Scheduled',
    noClassesScheduledDesc: 'There are no departmental lecture slots listed for this day. Use this time for reading, assignments, or field preparation.',
    selectedDaySchedule: 'Selected Day Schedule',

    // Semester Filter Toolbar
    academicYearTier: 'Academic Year:',
    allYears: 'All Years',
    firstYear: '1st Year',
    secondYear: '2nd Year',
    thirdYear: '3rd Year',
    fourthYear: '4th Year',
    mscYear: 'M.Sc. / Thesis',
    bothSemesters: 'Both Semesters',
    semesterOne: 'Semester I',
    semesterTwo: 'Semester II',
    courseLabel: 'Course:',
    allCoursesInSelection: 'All Courses in this Selection',
    allTypes: 'All Types',
    refBooks: 'Reference Books',
    syllabusGuides: 'Syllabus & Guides',
    showingResources: 'Showing',
    resourceWord: 'resource',
    resourcesWord: 'resources',
    resetAllFilters: 'Reset All Filters',

    // Resource Cards
    redirectDrive: 'Redirect to Drive',
    readInApp: 'Read in App',
    copyLink: 'Copy Link',
    download: 'Download',
    report: 'Report',
    linkCopied: 'Link copied to clipboard!',
    noMaterialsYet: 'No materials yet. Be the first to contribute!',
    noMaterialsDesc: 'The SUST FES Academic Resource Archive is open for student and faculty submissions. Have course slides, lecture notes, or past questions? Share them with the department.',
    noResourcesMatch: 'No Resources Found Matching Filters',
    noResourcesMatchDesc: 'No materials match this specific filter combination. You can reset filters or submit materials for this course.',
    manageArchive: 'Manage Archive',
    searchResultsFor: 'Search results for',

    // Bookmarks View
    savedVault: 'Personal Revision Vault',
    savedTitle: 'Saved Resources & Revision List',
    savedDesc: 'Study materials you have pinned for quick revision in your browser.',
    backToCatalog: 'Back to Catalog',
    noBookmarksYet: 'No Bookmarked Resources Yet',
    noBookmarksDesc: 'Click the star or bookmark icon on any lecture slide, past exam paper, or note to save it here for fast revision during exam season.',
    exploreCatalog: 'Explore Catalog',

    // Exam Bank View
    examArchiveSub: 'FES SUST Examination Archive',
    examBankTitle: 'Previous Year Questions (PYQs) & Papers',
    examBankDesc: 'Essential question papers from past semesters (Midterms & Semester Finals) to help students prepare for upcoming departmental exams.',
    searchPyqPlaceholder: 'Search past exam questions (e.g. Dendrology 2023, FES 08211121, Silviculture)...',
    allTerms: 'All Terms',
    finalExam: 'Semester Finals',
    midtermExam: 'Midterms',
    noPyqFound: 'No Question Papers Found Matching Filters',

    // About Page
    aboutFesTitle: 'Department of Forestry and Environmental Science (FES)',
    specializedLabs: 'Specialized Laboratories',
    studentCrContribution: 'Student & CR Contribution',
    campusLocation: 'Academic Building "E", SUST, Kumargaon, Sylhet 3114, Bangladesh',
    sustPortal: 'SUST Portal',
    adminAccess: 'Admin Access',

    // Species Database & Herbarium
    speciesDbTitle: 'Tree Species Database & Field Photos',
    speciesDbSubtitle: 'Silvicultural database of indigenous and plantation tree species of Bangladesh with taxonomy, botanical photography, student observations, and wood utilization profiles.',
    herbariumSubtitle: 'FES SUST Dendrology & Botanical Herbarium',
    searchSpeciesPlaceholder: 'Search species by scientific, common or bangla name...',
    allEcosystems: 'All Ecosystems',
    allFamilies: 'All Families',
    allUses: 'All Uses',
    distributionLabel: 'Distribution:',
    habitatLabel: 'Habitat:',
    familyLabel: 'Family:',
    silviculturalNotesLabel: 'Silvicultural & Dendrological Characteristics',
    economicUsesLabel: 'Economic & Ecological Utilization',
    viewAllPhotos: 'View All Photos',
    photosWord: 'Photos',
    details: 'Details',
    addPhoto: 'Add Photo',
    studentLens: 'Student Lens',
    botanicalPlates: 'Botanical Plates',
    studentFieldObservations: 'Student Field Observations',
    noSpeciesFound: 'No Species Found',
    noSpeciesFoundDesc: 'Try a different botanical name or clear your filters to view the complete catalog.',
    reset: 'Reset',
    closeForm: 'Close Form',
    addMorePhotos: 'Add More Photos',
    studentFieldLens: 'Student Field Lens',
    savePhotoToSpecies: 'Save Photo to Species',
    cancel: 'Cancel',
    geographicDistribution: 'Geographic Distribution in Bangladesh',
    ecologicalHabitat: 'Ecological Habitat',
    readFullBotanicalFlora: 'Read Full Botanical Profile on Flora of Bangladesh',
    mangroves: 'Mangroves',
    salDeciduous: 'Sal / Deciduous',
    hillSemiEvergreen: 'Hill Semi-Evergreen',
    plainsHomestead: 'Plains & Homestead',

    // Common
    credits: 'Credits',
    newBadge: 'New',
  },
  bn: {
    // Navigation & App Bar
    catalog: 'স্টাডি ক্যাটালগ',
    pyq: 'প্রশ্নব্যাংক',
    academics: 'একাডেমিক',
    explore: 'অন্বেষণ',
    syllabus: 'সিলেবাস ও কারিকুলাম',
    progress: 'অগ্রগতি ট্র্যাকার',
    notices: 'নোটিশ ও রুটিন',
    cgpa: 'সিজিপিএ ক্যালকুলেটর',
    bookmarks: 'সংরক্ষিত',
    species: 'গাছের প্রজাতি',
    gallery: 'ফিল্ড গ্যালারি',
    theses: 'থিসিস আর্কাইভ',
    faculty: 'শিক্ষকমণ্ডলী',
    about: 'বিভাগ পরিচিতি',
    manage: 'ব্যবস্থাপনা',
    contribute: 'যুক্ত করুন',
    adminEntry: 'অ্যাডমিন প্রবেশ',
    navGroupAcademics: 'একাডেমিক',
    navGroupTools: 'শিক্ষার্থী সরঞ্জাম',
    navGroupForestry: 'ফরেস্ট্রি ও গবেষণা',
    navGroupDepartment: 'বিভাগীয় তথ্য',
    navMenu: 'মেনু',
    closeMenu: 'মেনু বন্ধ',

    // Brand & University
    deptTitle: 'ফরেস্ট্রি অ্যান্ড এনভায়রনমেন্টাল সায়েন্স বিভাগ',
    uniTitle: 'শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়',
    sustSylhet: 'শাবিপ্রবি, সিলেট',
    academicArchiveFooter: 'একাডেমিক রিসোর্স আর্কাইভ · অ-বাণিজ্যিক শিক্ষামূলক ডিরেক্টরি',

    // Hero Section
    heroSubtitle: 'লেকচার স্লাইড, ক্লাসনোট, বিগত বছরের পরীক্ষার প্রশ্ন ও ফিল্ড প্র্যাকটিক্যাল ম্যানুয়ালের অফিসিয়াল ডিজিটাল আর্কাইভ।',
    searchPlaceholder: 'কোর্স কোড (যেমন: FES 08211121, Silviculture), বিষয় বা শিক্ষকের নাম দিয়ে অনুসন্ধান করুন...',
    clearSearch: 'অনুসন্ধান মুছুন',
    scanKeywords: 'দ্রুত কিওয়ার্ড:',
    filterLabel: 'ফিল্টার:',
    examBankPyqs: 'প্রশ্নব্যাংক (PYQs)',
    lectureSlides: 'লেকচার স্লাইড',
    classNotes: 'ক্লাস নোট',
    labFieldManuals: 'ল্যাব ও ফিল্ড ম্যানুয়াল',
    archivedResources: 'সংরক্ষিত উপকরণ',
    examQuestionPapers: 'বিগত পরীক্ষার প্রশ্ন',
    bscMscCourses: 'বি.এসসি ও এম.এসসি কোর্স',
    contributeResource: 'রিসোর্স জমা দিন',

    // Routine & Calendar Section
    routineCalendarHeading: 'ক্লাস রুটিন ক্যালেন্ডার',
    routineCalendarSubtitle: 'প্রতিদিনের ক্লাস, কক্ষ ও সময়সূচীর লাইভ বিভাগীয় ক্যালেন্ডার',
    fullTimetable: 'সম্পূর্ণ রুটিন',
    yearLabel: 'বর্ষ:',
    semLabel: 'সেমিস্টার:',
    today: 'আজ',
    happeningNow: 'এখন চলছে',
    upcomingToday: 'আজকের আসন্ন',
    completed: 'সমাপ্ত',
    classesScheduled: 'টি ক্লাস নির্ধারিত',
    classScheduledSingular: 'টি ক্লাস নির্ধারিত',
    noClassesScheduled: 'এই দিনে কোনো ক্লাস নেই',
    noClassesScheduledDesc: 'এই দিনে কোনো নির্ধারিত লেকচার নেই। সময়টি পড়াশোনা, অ্যাসাইনমেন্ট বা ফিল্ড প্রস্তুতির জন্য ব্যবহার করুন।',
    selectedDaySchedule: 'নির্বাচিত দিনের সময়সূচী',

    // Semester Filter Toolbar
    academicYearTier: 'শিক্ষাবর্ষ:',
    allYears: 'সকল শিক্ষাবর্ষ',
    firstYear: '১ম বর্ষ',
    secondYear: '২য় বর্ষ',
    thirdYear: '৩য় বর্ষ',
    fourthYear: '৪র্থ বর্ষ',
    mscYear: 'এম.এসসি / থিসিস',
    bothSemesters: 'উভয় সেমিস্টার',
    semesterOne: '১ম সেমিস্টার',
    semesterTwo: '২য় সেমিস্টার',
    courseLabel: 'কোর্স:',
    allCoursesInSelection: 'এই নির্বাচনের সকল কোর্স',
    allTypes: 'সকল ধরণ',
    refBooks: 'সহায়ক রেফারেন্স বই',
    syllabusGuides: 'সিলেবাস ও গাইড',
    showingResources: 'প্রদর্শিত হচ্ছে',
    resourceWord: 'টি রিসোর্স',
    resourcesWord: 'টি রিসোর্স',
    resetAllFilters: 'সকল ফিল্টার মুছুন',

    // Resource Cards
    redirectDrive: 'গুগল ড্রাইভে খুলুন',
    readInApp: 'অ্যাপে পড়ুন',
    copyLink: 'লিংক কপি',
    download: 'ডাউনলোড',
    report: 'রিপোর্ট',
    linkCopied: 'লিংক কপি করা হয়েছে!',
    noMaterialsYet: 'এখনও কোনো উপকরণ যুক্ত করা হয়নি। প্রথম অবদানকারী হোন!',
    noMaterialsDesc: 'শাবিপ্রবি ফরেস্ট্রি ডিজিটাল আর্কাইভ শিক্ষার্থী ও শিক্ষকদের জমাদানের জন্য উন্মুক্ত। আপনার কাছে কি স্লাইড বা প্রশ্ন আছে? বিভাগের সাথে শেয়ার করুন।',
    noResourcesMatch: 'ফিল্টারের সাথে কোনো রিসোর্স মেলেনি',
    noResourcesMatchDesc: 'নির্বাচিত ফিল্টারের সাথে কোনো উপকরণ মেলেনি। ফিল্টার রিসেট করতে পারেন অথবা এই কোর্সের উপকরণ যুক্ত করতে পারেন।',
    manageArchive: 'আর্কাইভ পরিচালনা',
    searchResultsFor: 'অনুসন্ধানের ফলাফল',

    // Bookmarks View
    savedVault: 'ব্যক্তিগত পড়ার ভল্ট',
    savedTitle: 'সংরক্ষিত উপকরণ ও রিভিশন তালিকা',
    savedDesc: 'পরীক্ষার দ্রুত প্রস্তুতির জন্য ব্রাউজারে সংরক্ষিত একাডেমিক উপকরণ।',
    backToCatalog: 'ক্যাটালগে ফিরুন',
    noBookmarksYet: 'এখনও কোনো উপকরণ সংরক্ষিত নেই',
    noBookmarksDesc: 'যেকোনো লেকচার স্লাইড, বিগত পরীক্ষার প্রশ্ন বা নোটের বুকমার্ক আইকনে ক্লিক করে এখানে দ্রুত রিভিশনের জন্য সংরক্ষণ করুন।',
    exploreCatalog: 'ক্যাটালগ অন্বেষণ করুন',

    // Exam Bank View
    examArchiveSub: 'শাবিপ্রবি ফরেস্ট্রি পরীক্ষা আর্কাইভ',
    examBankTitle: 'বিগত বছরের পরীক্ষার প্রশ্নব্যাংক (PYQs)',
    examBankDesc: 'আসন্ন সেমিস্টার ফাইনাল ও মিডটার্ম পরীক্ষার প্রস্তুতির জন্য বিগত বছরের অফিশিয়াল প্রশ্নপত্র।',
    searchPyqPlaceholder: 'বিগত প্রশ্ন খুঁজুন (যেমন: Dendrology 2023, FES 08211121, Silviculture)...',
    allTerms: 'সকল পরীক্ষা',
    finalExam: 'সেমিস্টার ফাইনাল',
    midtermExam: 'মিডটার্ম',
    noPyqFound: 'ফিল্টারের সাথে কোনো প্রশ্নপত্র মেলেনি',

    // About Page
    aboutFesTitle: 'ফরেস্ট্রি অ্যান্ড এনভায়রনমেন্টাল সায়েন্স বিভাগ (FES)',
    specializedLabs: 'বিশেষায়িত গবেষণাগার',
    studentCrContribution: 'শিক্ষার্থী ও সিআরদের অবদান',
    campusLocation: 'একাডেমিক ভবন "ই", শাবিপ্রবি, কুমারগাঁও, সিলেট ৩১১৪, বাংলাদেশ',
    sustPortal: 'শাবিপ্রবি পোর্টাল',
    adminAccess: 'অ্যাডমিন প্রবেশাধিকার',

    // Species Database & Herbarium
    speciesDbTitle: 'গাছের প্রজাতি ডাটাবেজ ও ফিল্ড আলোকচিত্র',
    speciesDbSubtitle: 'বাংলাদেশের দেশীয় ও বাগান বৃক্ষ প্রজাতির সিলভিকালচারাল ডাটাবেজ — ট্যাক্সোনমি, উদ্ভিদের আলোকচিত্র, শিক্ষার্থীদের পর্যবেক্ষণ ও কাঠের ব্যবহারিক পরিচিতি।',
    herbariumSubtitle: 'শাবিপ্রবি ফরেস্ট্রি ডেনড্রোলজি ও হার্বেরিয়াম',
    searchSpeciesPlaceholder: 'বৈজ্ঞানিক, সাধারণ বা বাংলা নাম দিয়ে খুঁজুন...',
    allEcosystems: 'সকল বাস্তুতন্ত্র',
    allFamilies: 'সকল গোত্র',
    allUses: 'সকল ব্যবহার',
    distributionLabel: 'বিস্তার:',
    habitatLabel: 'আবাসস্থল:',
    familyLabel: 'গোত্র:',
    silviculturalNotesLabel: 'বনবিদ্যা ও ডেনড্রোলজিক্যাল বৈশিষ্ট্য',
    economicUsesLabel: 'অর্থনৈতিক ও পরিবেশগত ব্যবহার',
    viewAllPhotos: 'সকল ছবি দেখুন',
    photosWord: 'টি ছবি',
    details: 'বিস্তারিত',
    addPhoto: 'ছবি যোগ করুন',
    studentLens: 'শিক্ষার্থী লেন্স',
    botanicalPlates: 'বোটানিক্যাল প্লেট',
    studentFieldObservations: 'শিক্ষার্থীদের ফিল্ড পর্যবেক্ষণ',
    noSpeciesFound: 'কোনো প্রজাতি পাওয়া যায়নি',
    noSpeciesFoundDesc: 'ভিন্ন কোনো নাম খুঁজুন বা সম্পূর্ণ ক্যাটালগ দেখতে ফিল্টার রিসেট করুন।',
    reset: 'রিসেট',
    closeForm: 'ফর্ম বন্ধ করুন',
    addMorePhotos: 'আরও ছবি যুক্ত করুন',
    studentFieldLens: 'শিক্ষার্থী ফিল্ড লেন্স',
    savePhotoToSpecies: 'প্রজাতিতে ছবি সংরক্ষণ করুন',
    cancel: 'বাতিল',
    geographicDistribution: 'বাংলাদেশে ভৌগোলিক বিস্তার',
    ecologicalHabitat: 'বাস্তুতান্ত্রিক আবাসস্থল',
    readFullBotanicalFlora: 'ফ্লোরা অব বাংলাদেশে পূর্ণ বিবরণ পড়ুন',
    mangroves: 'ম্যানগ্রোভ',
    salDeciduous: 'শাল / পর্ণমোচী',
    hillSemiEvergreen: 'পাহাড়ী আধা-চিরসবুজ',
    plainsHomestead: 'সমতল ও বসতবাড়ি',

    // Common
    credits: 'ক্রেডিট',
    newBadge: 'নতুন',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sust_fes_lang');
        if (saved === 'bn' || saved === 'en') return saved;
      } catch {
        // Ignore storage errors
      }
    }
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem('sust_fes_lang', lang);
    } catch {
      // Ignore storage errors
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'bn' : 'en'));
  };

  const t = (key: string): string => {
    return translations[lang][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
}
