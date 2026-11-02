import React from 'react';
import { TreePine, MapPin, Mail, Globe, Users, Award, BookOpen, ShieldCheck } from 'lucide-react';

interface AboutViewProps {
  onOpenAdmin: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onOpenAdmin }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Hero Overview */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <TreePine className="w-4 h-4 text-emerald-600" />
          <span>Shahjalal University of Science and Technology</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mb-4">
          Department of Forestry and Environmental Science (FES)
        </h2>
        <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed mb-4">
          Established in 1998 (initially as the Department of Forestry and renamed in 2001 to encompass Environmental Science), the Department of Forestry and Environmental Science at SUST is one of the premier academic hubs in South Asia pioneering sustainable natural resource management, climate resilience, and applied biodiversity research.
        </p>
        <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
          This digital resource directory was founded to ensure unrestricted, seamless access to syllabus guidelines, past semester examinations, faculty lecture presentations, and field tour manuals for all undergraduate and postgraduate scholars.
        </p>
      </div>

      {/* Facilities & Focus Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Specialized Laboratories
          </h3>
          <ul className="text-xs text-stone-600 dark:text-stone-400 space-y-2 list-disc list-inside">
            <li>Remote Sensing & GIS Spatial Analysis Laboratory</li>
            <li>Plant Genetics, Tissue Culture & Biotechnology Lab</li>
            <li>Forest Soil, Eco-physiology & Analytical Chemistry Lab</li>
            <li>Wood Anatomy, Seasoning & Physical Testing Lab</li>
            <li>Departmental Botanical Nursery & Medicinal Arboreta</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Student & CR Contribution
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Class Representatives (CRs) and students can upload notes, practical files, and previous semester question papers to your batch Google Drive folder.
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Admins simply paste the Google Drive share link into the built-in management panel to organize it automatically for the entire department!
          </p>
          <button
            onClick={onOpenAdmin}
            className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 flex items-center gap-1.5 pt-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Open Resource Manager</span>
          </button>
        </div>

      </div>

      {/* Campus Location & Info */}
      <div className="bg-stone-100 dark:bg-stone-800/60 rounded-2xl p-6 border border-stone-200 dark:border-stone-700/60 text-xs text-stone-600 dark:text-stone-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-stone-900 dark:text-stone-100">
              Department of Forestry & Environmental Science
            </div>
            <div>Academic Building 'E', SUST, Kumargaon, Sylhet 3114, Bangladesh</div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://www.sust.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 font-semibold hover:border-emerald-600 transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>SUST Portal</span>
          </a>
        </div>
      </div>

    </div>
  );
};
