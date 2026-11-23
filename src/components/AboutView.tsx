import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe, Users, Award, ShieldCheck, PlusCircle, Camera } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { SustLogo } from './SustLogo';
import heroImg from '../assets/images/hero_forestry_sust.webp';

export const AboutView: React.FC = () => {
  usePageMeta({
    title: 'About FES Department',
    description: 'Learn about the Department of Forestry and Environmental Science at Shahjalal University of Science and Technology (SUST), Sylhet.',
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">

      {/* Hero Overview with Editorial Photographic Plate */}
      <article className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2.5 text-[#42684D] dark:text-[#8A9C74] text-xs font-semibold uppercase tracking-wider mb-3">
              <SustLogo size="sm" />
              <span>Shahjalal University of Science and Technology</span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#19382B] dark:text-[#F3F1E8] tracking-tight mb-3">
              Department of Forestry and Environmental Science (FES)
            </h1>
            <p className="font-scientific text-lg text-[#987453] dark:text-[#BBC4A6] mb-4">
              Explore. Understand. Preserve.
            </p>
            <p className="text-[#42684D] dark:text-[#BBC4A6] text-sm sm:text-base leading-relaxed mb-4">
              Established in 1998 (initially as the Department of Forestry and renamed in 2001 to encompass Environmental Science), the Department of Forestry and Environmental Science at SUST is one of the premier academic hubs in South Asia pioneering sustainable natural resource management, climate resilience, and applied biodiversity research.
            </p>
            <p className="text-[#42684D] dark:text-[#BBC4A6] text-sm leading-relaxed">
              This digital resource directory was founded to ensure unrestricted, seamless access to syllabus guidelines, past semester examinations, faculty lecture presentations, and field tour manuals for all undergraduate and postgraduate scholars.
            </p>
          </div>

          <figure className="md:col-span-5 flex flex-col border-t md:border-t-0 md:border-l border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15 bg-[#EAE7DA] dark:bg-[#142D22]">
            <div className="aspect-[4/3] md:aspect-auto md:flex-1 overflow-hidden bg-[#19382B]">
              <img
                src={heroImg}
                alt="Sylhet forest canopy and lush woodland research landscape surrounding Shahjalal University of Science and Technology"
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            <figcaption className="px-4 py-3 text-[11px] text-[#42684D] dark:text-[#BBC4A6] leading-snug flex items-start gap-2">
              <Camera className="w-3.5 h-3.5 text-[#987453] dark:text-[#8A9C74] shrink-0 mt-0.5" />
              <span>
                <span className="font-scientific text-xs text-[#19382B] dark:text-[#F3F1E8]">
                  Fig. 1 · SUST Arboretum &amp; Tropical Woodland Reserve
                </span>
                <span className="block text-[10px] text-[#987453] dark:text-[#8A9C74] mt-0.5">
                  Photograph · Department of Forestry &amp; Environmental Science, SUST
                </span>
              </span>
            </figcaption>
          </figure>
        </div>
      </article>

      {/* Facilities & Focus Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 text-[#42684D] dark:text-[#8A9C74] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="font-editorial text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8]">
            Specialized Laboratories
          </h2>
          <ul className="text-xs text-[#42684D] dark:text-[#BBC4A6] space-y-2 list-disc list-inside leading-relaxed">
            <li>Remote Sensing & GIS Spatial Analysis Laboratory</li>
            <li>Plant Genetics, Tissue Culture & Biotechnology Lab</li>
            <li>Forest Soil, Eco-physiology & Analytical Chemistry Lab</li>
            <li>Wood Anatomy, Seasoning & Physical Testing Lab</li>
            <li>Departmental Botanical Nursery & Medicinal Arboreta</li>
          </ul>
        </div>

        <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-6 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 text-[#42684D] dark:text-[#8A9C74] flex items-center justify-center font-bold mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="font-editorial text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-2">
              Student & CR Contribution
            </h2>
            <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] leading-relaxed mb-2">
              Class Representatives (CRs) and students can upload notes, practical files, and previous semester question papers to your batch Google Drive folder.
            </p>
            <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] leading-relaxed">
              Have lecture materials to submit? Use the community contribution form to share files with your peers.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15">
            <Link
              to="/contribute"
              className="text-xs font-semibold text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:underline flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#987453] dark:text-[#8A9C74]" />
              <span>Submit Resource</span>
            </Link>
            <span className="text-[#8A9C74]" aria-hidden="true">·</span>
            <Link
              to="/manage"
              className="text-xs font-semibold text-[#42684D] dark:text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Access</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Campus Location & Info */}
      <div className="bg-[#EAE7DA] dark:bg-[#142D22] rounded-lg p-6 border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 text-xs text-[#42684D] dark:text-[#BBC4A6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#987453] dark:text-[#8A9C74] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[#19382B] dark:text-[#F3F1E8]">
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
            className="px-3.5 py-2 bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 rounded-md text-[#19382B] dark:text-[#F3F1E8] font-semibold hover:border-[#42684D] transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
            <span>SUST Portal</span>
          </a>
        </div>
      </div>

    </div>
  );
};
