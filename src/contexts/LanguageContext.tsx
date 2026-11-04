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
    // Navigation
    catalog: 'Study Catalog',
    pyq: 'Exam Bank',
    academics: 'Academics',
    explore: 'Explore',
    syllabus: 'Syllabus',
    progress: 'Progress Tracker',
    notices: 'Notices & Routine',
    cgpa: 'CGPA Tool',
    bookmarks: 'Saved',
    species: 'Tree Species',
    gallery: 'Gallery',
    theses: 'Theses',
    faculty: 'Faculty',
    about: 'About FES',
    manage: 'Manage',
    contribute: 'Contribute',

    // Hero
    deptTitle: 'Department of Forestry & Environmental Science',
    uniTitle: 'Shahjalal University of Science and Technology',
    heroSubtitle: 'Official academic archive for lecture slides, class handouts, previous year exam questions, and field practical manuals.',
    searchPlaceholder: 'Search by course code (e.g. FES 08211121, Silviculture), topic, or teacher...',
    clearSearch: 'Clear Search',

    // Filters
    allYears: 'All Years',
    allSemesters: 'All Semesters',
    allCategories: 'All Categories',
    allCourses: 'All Courses',
    resetFilters: 'Reset All Filters',

    // Common
    openInDrive: 'Redirect to Drive',
    readInApp: 'Read in App',
    copyLink: 'Copy Link',
    download: 'Download',
    report: 'Report',
    credits: 'Credits',
    newBadge: 'New',
  },
  bn: {
    // Navigation
    catalog: 'স্টাডি ক্যাটালগ',
    pyq: 'প্রশ্নব্যাংক',
    academics: 'একাডেমিক',
    explore: 'অন্বেষণ',
    syllabus: 'সিলেবাস',
    progress: 'অগ্রগতি ট্র্যাকার',
    notices: 'নোটিশ ও রুটিন',
    cgpa: 'সিজিপিএ হিসাব',
    bookmarks: 'সংরক্ষিত',
    species: 'গাছের প্রজাতি',
    gallery: 'গ্যালারি',
    theses: 'থিসিস আর্কাইভ',
    faculty: 'শিক্ষকমণ্ডলী',
    about: 'বিভাগ পরিচিতি',
    manage: 'ব্যবস্থাপনা',
    contribute: 'যুক্ত করুন',

    // Hero
    deptTitle: 'ফরেস্ট্রি অ্যান্ড এনভায়রনমেন্টাল সায়েন্স বিভাগ',
    uniTitle: 'শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়',
    heroSubtitle: 'লেকচার স্লাইড, ক্লাসনোট, বিগত বছরের পরীক্ষার প্রশ্ন ও ফিল্ড প্র্যাকটিক্যাল ম্যানুয়ালের অফিসিয়াল ডিজিটাল আর্কাইভ।',
    searchPlaceholder: 'কোর্স কোড (যেমন: FES 08211121), বিষয় বা শিক্ষকের নাম দিয়ে অনুসন্ধান করুন...',
    clearSearch: 'অনুসন্ধান মুছুন',

    // Filters
    allYears: 'সকল শিক্ষাবর্ষ',
    allSemesters: 'উভয় সেমিস্টার',
    allCategories: 'সকল ক্যাটাগরি',
    allCourses: 'সকল কোর্স',
    resetFilters: 'সকল ফিল্টার মুছুন',

    // Common
    openInDrive: 'গুগল ড্রাইভে খুলুন',
    readInApp: 'অ্যাপে পড়ুন',
    copyLink: 'লিংক কপি',
    download: 'ডাউনলোড',
    report: 'রিপোর্ট',
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
