# SUST FES Academic Resource Library

[![CI Quality & Validation](https://github.com/DhruboX7/sust-fes/actions/workflows/ci.yml/badge.svg)](https://github.com/DhruboX7/sust-fes/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![React 19](https://img.shields.io/badge/React-19.0.1-blue.svg)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4.3.3-teal.svg)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple.svg)](https://web.dev/progressive-web-apps/)

Digital academic repository, previous year exam bank, botanical identifier, and curriculum tracker for the **Department of Forestry and Environmental Science (FES)** at **Shahjalal University of Science and Technology (SUST)**, Sylhet, Bangladesh.

---

## 🌲 Features

- **Resource Catalog (`/`)**: Browse lecture slides, study notes, reference books, lab manuals, and syllabus copies. Filter by academic year (1st–4th Year & MS), semester, and material category. Real-time search by title, course code, course title, session, or instructor.
- **Previous Year Exam Bank (`/pyq`)**: Filterable past questions tagged by year, semester, and term (Midterm / Term Final).
- **Interactive Syllabus Explorer (`/syllabus`)**: Course-by-course curriculum breakdown with course credits, categories, chapter contents, and syllabus progress checkboxes stored locally per-student.
- **Dedicated Course Hubs (`/courses/:code`)**: Individual page per course (e.g. `/courses/FES-111`) displaying syllabus units, learning outcomes, credit values, and all attached materials categorized with one-click copy links.
- **SUST 4.0 CGPA & GPA Calculator (`/tools/cgpa`)**: Official SUST 4.0 grading scale ($A+ \ge 80\% = 4.00$) with semester GPA calculator, curriculum course pre-fill, target cumulative CGPA planner, and local storage retention.
- **Campus Tree Species Database (`/species`)**: Botanical database with Bengali names, scientific binominals, families, indigenous status, distribution, and forestry / medicinal uses.
- **Field Tour & Research Gallery (`/gallery`)**: Photographic documentation and reports of departmental fieldwork (Lawachara, Rema-Kalenga, Sundarbans, Sylhet tea estates).
- **Graduate Thesis & Project Archive (`/theses`)**: Undergraduate monographs and MS thesis abstracts categorized by specialization (Ecology, Agroforestry, Remote Sensing, Silviculture) with research methodology and faculty supervisor metadata.
- **Notices & Class Routine (`/notices`)**: Departmental notices with pinned announcements and weekly lecture schedules per semester.
- **Bookmarks (`/bookmarks`)**: Save frequently accessed slides and documents to local device storage with one-click offline access.
- **PWA & Offline Support**: Progressive Web App with service worker caching and installable app icon for mobile devices and desktops.
- **Bilingual Interface**: Quick English / Bengali (`EN | বাং`) toggle for interface terminology and course labels.
- **Direct Google Drive Integration**: Derives file preview and download links seamlessly without third-party proxy dependencies.
- **Accessibility & Theme**: Full dark/light mode toggle with WCAG AA compliance, semantic dialogs, and keyboard navigation.

---

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) (strict mode)
- **Bundler & Tooling**: [Vite 8](https://vitejs.dev)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) + modern CSS theme variables
- **Routing**: [React Router 7](https://reactrouter.com) (configured with `HashRouter` for zero-configuration hosting on GitHub Pages)
- **Icons & Motion**: [Lucide React](https://lucide.dev) & [Motion](https://motion.dev)
- **PWA**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app) with service worker precaching

---

## 🚀 Quick Start

### Prerequisites
- Node.js `20.x` or higher
- npm `10.x` or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/DhruboX7/sust-fes.git
cd sust-fes

# 2. Install dependencies exactly as pinned in package-lock.json
npm ci

# 3. Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📁 Project Architecture & Data Storage

All academic data is stored statically as clean, portable JSON files under `public/data/`, eliminating the need for expensive database infrastructure:

```
public/
├── data/
│   ├── resources.json         # Active academic resources (empty by default for community input)
│   ├── resources.sample.json  # Seed template with 14 representative course materials
│   ├── notices.json           # Departmental announcements & notices
│   ├── routine.json           # Class schedule tables by year and semester
│   ├── species.json           # Botanical & campus tree species archive
│   ├── gallery.json           # Study tours, nursery practice, and fieldwork photos
│   ├── theses.json            # Undergraduate and MS thesis research abstracts
│   └── student_photos.json    # Student-submitted photo entries
├── favicon.svg                # Departmental tree SVG favicon
├── pwa-192x192.png            # PWA application icons
├── pwa-512x512.png
└── robots.txt                 # Search engine crawler instructions
```

### Static Data Integrity Validation

To ensure no malformed JSON or missing fields are committed to production, run:

```bash
npm run validate
```

### Quality Checks

```bash
npm run lint   # TypeScript typecheck (strict mode)
npm test       # Unit tests (CGPA grading + routine parser)
npm run build  # Production build into dist/
npm start      # Serve the built dist/ with the bundled Node server
```

CI (`.github/workflows/ci.yml`) runs validate, tests, typecheck and build on every push and pull request using `npm ci`, so commit `package-lock.json` whenever you change dependencies.

---

## 🔗 Configuring Google Form Pre-filled Links

The application connects to Google Forms for **Resource Contributions** and **Broken Link Reports** (`src/config.ts`).

### How to configure Pre-filled URL parameters:
1. Create a Google Form with fields:
   - Resource ID (Short answer)
   - Resource Title (Short answer)
   - Problem Description (Paragraph)
2. In Google Forms editor, click the three-dot menu `⋮` $\rightarrow$ **Get pre-filled link**.
3. Fill sample values: `ID_TEST` in Resource ID, `TITLE_TEST` in Resource Title. Click **Get link** and copy it.
4. Note the entry IDs from the generated link:
   `https://docs.google.com/forms/d/e/.../viewform?entry.123456789=ID_TEST&entry.987654321=TITLE_TEST`
5. In `src/config.ts`:
   - Set `REPORT_FORM_URL` with your base form URL.
   - The Report button will append `&entry.123456789=${encodeURIComponent(id)}&entry.987654321=${encodeURIComponent(title)}`.

---

## 🚢 Deployment

### Deploy to GitHub Pages (Automated via GitHub Actions)
1. Fork or push this repository to GitHub.
2. Go to **Settings** $\rightarrow$ **Pages** $\rightarrow$ **Source**: set to **GitHub Actions**.
3. Pushes to `main` (or `master`) will trigger `.github/workflows/deploy.yml` which builds and publishes the site automatically.

### Deploy to Vercel / Netlify
Run `npm run build`. The production output is located in `dist/`. Deploy as a standard Vite single-page application.

---

## 📜 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

Maintained with 💚 for the students and faculty of **Department of Forestry and Environmental Science, SUST**.
