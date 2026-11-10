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
      const saved = localStorage.getItem('sust_fes_lang');
      if (saved === 'bn' || saved === 'en') return saved;
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('sust_fes_lang', lang);
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
