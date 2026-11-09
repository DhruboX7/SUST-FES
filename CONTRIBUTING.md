# Contributing to SUST FES Academic Resource Library

Welcome to the **SUST Forestry and Environmental Science (FES) Academic Resource Library** contributor guide! This platform is maintained by and for students, class representatives (CRs), alumni, and faculty members of the Department of Forestry and Environmental Science at Shahjalal University of Science and Technology (SUST), Sylhet.

We welcome contributions of study notes, lecture slide links, past year exam questions, tree species profiles, fieldwork galleries, and undergraduate / graduate thesis abstracts.

---

## 1. Fast Contribution (No Coding Required)

If you have a Google Drive link, PDF, or note file:
1. Open the [Community Resource Contribution Form](https://forms.google.com) (configured via `src/config.ts`).
2. Provide the course code (e.g. `FES 111` or `FES 08211121`), session year, file type, and public Google Drive link.
3. Make sure the Google Drive link has **General Access** set to:
   > **"Anyone with the link can view"** (Viewer mode).
4. Department moderators will review the link and merge it into `public/data/resources.json`.

---

## 2. Developer & Class Representative (CR) Contributions (Via Pull Request)

If you are comfortable with Git and JSON, you can directly contribute files or features via a GitHub Pull Request.

### Repository Setup

```bash
# Clone the repository
git clone https://github.com/DhruboX7/sust-fes.git
cd sust-fes

# Install dependencies
npm install

# Start local development server (port 3000)
npm run dev
```

### Adding New Resources Directly

Open `public/data/resources.json` and append your resource to the JSON array:

```json
{
  "id": "res-fes111-2024-lecture01",
  "title": "Lecture 01 - Intro to Forest Botany & Angiosperm Morphology",
  "courseCode": "FES 111",
  "courseTitle": "Forest Botany",
  "year": 1,
  "semester": 1,
  "category": "slides",
  "driveUrl": "https://drive.google.com/file/d/YOUR_REAL_DRIVE_FILE_ID/view?usp=sharing",
  "sessionYear": "2023-2024",
  "authorOrTeacher": "Prof. Dr. XYZ",
  "description": "Introductory slides covering angiosperm leaf morphology and stem anatomy.",
  "examTerm": "Midterm",
  "isFeatured": false,
  "createdAt": "2026-11-03"
}
```

*Note: You do **not** need to specify `fileId`, `previewUrl`, or `downloadUrl`. The application derives these at runtime using `parseGoogleDriveUrl()`!*

### Adding Fieldwork Photos, Theses, or Tree Species

- **Notices**: Edit `public/data/notices.json`
- **Class Routine**: Edit `public/data/routine.json`
- **Flora / Tree Species**: Edit `public/data/species.json`
- **Fieldwork & Study Tours**: Edit `public/data/gallery.json`
- **Thesis Archive**: Edit `public/data/theses.json`

---

## 3. Pre-Commit Validation

Before submitting a Pull Request, run the automated validation and typecheck suite:

```bash
# 1. Validate all static JSON records for correct syntax and required fields
npm run validate

# 2. Check TypeScript types
npx tsc --noEmit

# 3. Test production build
npm run build
```

All three commands must exit with code `0`.

---

## 4. Submitting a Pull Request

1. Create a descriptive feature branch:
   ```bash
   git checkout -b add-fes211-silviculture-slides
   ```
2. Commit your changes with a clear commit message:
   ```bash
   git commit -m "feat(data): add 2024 Silviculture lecture slides and midterm pyq"
   ```
3. Push to your fork and submit a Pull Request to `main`.

Thank you for helping keep academic resources accessible for all SUST FES students!
