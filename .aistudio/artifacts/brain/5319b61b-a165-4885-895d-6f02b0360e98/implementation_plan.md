# Tree Species Photography & Student Photo Management System

A comprehensive botanical visual system adding high-resolution habit/specimen photography to Bangladesh tree species, an interactive student field observation submission pipeline, and full administrative moderation power in the `/manage` console.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The clarifying questions were dismissed without selection. The system adopts the recommended, most robust architecture:
> - **Dual-Exposure Student Lens**: Student photos appear both in a dedicated "Student Field Photography" gallery tab and linked inside corresponding tree species cards in the botanical database.
> - **Curation Pipeline with Utmost Admin Power**: Public students can submit field observations via a lightweight modal (`status: 'pending'`); Administrators in `/manage` have full moderation controls to approve, feature, reject, edit metadata, or create entries directly.
> - **Verified Botanical Visuals**: Enhances all 55 Bangladesh tree species with rich botanical imagery, botanical field photos, and student capture credits.

---

### 1. Overview & Core Concept

- **What It Does**:
  1. **Tree Botanical Imagery**: Enriches the 55 Major Tree Species of Bangladesh with realistic high-resolution botanical photos (bark, leaves, habit, and flowering/fruiting canopy) with fallback error handling.
  2. **Student Field Photography Showcase**: A dedicated public section in the Field Gallery and within individual tree profiles where students of Forestry and Environmental Science (SUST) can showcase their field tour, campus dendrology, and silvicultural captures.
  3. **Student Contribution Flow**: An intuitive "Submit Field Photo" modal on the public portal where students submit their photo URL, student name, session/batch, registration number, location (e.g., Tilagarh Eco Park, Lawachara, Sundarbans, SUST Campus), and linked tree species.
  4. **Utmost Admin Moderation in `/manage`**: A brand new dedicated **"Student Photos"** console tab equipped with pending queue review, one-click approve/reject/feature toggles, edit modal, delete actions, and direct manual entry.

- **Target Audience**:
  - SUST Forestry & Environmental Science undergraduate & postgraduate students documenting dendrology field courses.
  - Faculty and researchers verifying local morphological variations and herbarium captures.
  - System administrators managing content integrity and student credits.

---

### 2. User Experience & Visual Design

#### A. Public Tree Species Database (`/species`)
- **Rich Tree Photo Presentation**: Every species card features crisp visual photography of the tree's habit, leaves, or bark, replacing generic placeholders.
- **Student Observations Counter & Gallery**: Species detail view displays an "Observed by Students" section showing verified field captures submitted by SUST forestry students for that specific taxon.
- **Lightbox Zoom**: High-resolution zoom modal allowing students to examine foliage, venation, and bark texture.

#### B. Public Field Gallery (`/gallery`)
- **"Student Lens" Filter**: Dedicated tab alongside Field Tours, Research, Lab, and Campus.
- **"Submit Field Photo" Action Button**: Floating / prominent action in the gallery toolbar that triggers the clean submission modal.
- **Credit Strip on Cards**: Clean, unboxed metadata showing student name, batch (e.g., `2021-22 Batch`), location, and observation date.

#### C. Admin Management Console (`/manage`)
- **New Tab: "Student Photos"**:
  - **Metrics Header**: Total Submissions, Pending Review (highlighted badge), Approved, and Featured count.
  - **Filter Bar**: All, Pending Approval, Approved, Featured, or search by student name/reg/species.
  - **Review Cards**: Side-by-side photo inspection, student credential verification, and 1-click **Approve**, **Feature**, or **Reject**.
  - **Add / Edit Modal**: Administrator can directly upload or edit any student photo, change linked species, or adjust captions.
- **Tree Species Management Update (`AdminSpeciesPanel.tsx`)**:
  - Direct image URL field with preview and quick selection of verified botanical photo presets.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Moderation Status (`pending` vs. `approved`)**
  - *Chosen Approach*: New submissions default to `pending` status and appear immediately in the Admin Manage console for review, while approved photos display publicly.
  - *Why*: Prevents spam or broken image links from degrading departmental public presentation while encouraging student participation.
  - *Alternatives Considered*: Direct unmoderated publishing (risks inappropriate content or dead URLs).

- **Decision 2: Image Storage & URLs**
  - *Chosen Approach*: URL-based referencing supporting direct HTTPS image URLs, Google Drive direct view links, Imgur, or departmental assets, with local image fallback.
  - *Why*: Keeps client localStorage lightweight and fast while allowing students and admins to link photos from Google Drive or cloud hosts without exceeding in-browser storage limits.

- **Decision 3: Master Library Backup Integration**
  - *Chosen Approach*: Include `studentPhotos` in the `MasterLibraryBackup` JSON export/import and initial sample data seed (`public/data/student_photos.json`).
  - *Why*: Guarantees zero data loss across browser sessions, device migrations, or department site updates.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SUST FES Digital Library                        │
├───────────────────────────────────┬────────────────────────────────────┤
│           Public Views            │        Admin Console (/manage)     │
│  - SpeciesDatabaseView.tsx        │  - AdminSpeciesPanel.tsx           │
│  - FieldGalleryView.tsx           │  - AdminGalleryPanel.tsx           │
│  - SubmitStudentPhotoModal.tsx    │  - AdminStudentPhotosPanel.tsx     │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Reactive Storage Manager                        │
│                           (src/utils/storage.ts)                       │
│  - getStoredStudentPhotos()         - saveStoredStudentPhotos()        │
│  - addStudentPhotoSubmission()      - updateStudentPhotoStatus()       │
│  - Master JSON Backup (Export / Import with Student Photos)            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Persistent Storage & Seeds                        │
│  - localStorage['sust_fes_student_photos']                             │
│  - public/data/student_photos.json (Initial Seed)                      │
│  - public/data/species.json (55 Species with Botanical Photos)         │
└────────────────────────────────────────────────────────────────────────┘
```

#### Data Model (`StudentPhotoItem`)
```typescript
export interface StudentPhotoItem {
  id: string;
  studentName: string;
  studentBatch?: string; // e.g., '2021-22'
  studentRegNo?: string; // e.g., '2021134045'
  title: string;
  caption: string;
  location: string;
  date: string;
  imageUrl: string;
  treeSpeciesId?: string; // Links to 55 Bangladesh tree species
  speciesScientificName?: string;
  status: 'pending' | 'approved' | 'featured';
  submittedAt: string;
}
```

#### Step-by-Step Implementation Sequence
1. **Types**: Extend `src/types/index.ts` with `StudentPhotoItem` and update `MasterLibraryBackup`.
2. **Seed Data**: Create `public/data/student_photos.json` with initial authentic field tour photos and enrich `public/data/species.json` with curated tree photos.
3. **Storage Engine**: Add reactive student photo CRUD, status toggling, and backup integration in `src/utils/storage.ts`.
4. **Admin Console**:
   - Create `src/components/admin/AdminStudentPhotosPanel.tsx` with full curation, review queue, and add/edit modal.
   - Register the new panel in `AdminView.tsx` with a quick badge counter for pending items.
   - Update `AdminSpeciesPanel.tsx` with image URL helper presets.
5. **Public Interface**:
   - Create `SubmitStudentPhotoModal.tsx` for easy student contributions.
   - Update `FieldGalleryView.tsx` with "Student Lens" tab and submit button.
   - Update `SpeciesDatabaseView.tsx` with high-res photos and linked student observation thumbnails.
6. **Verification**: Run `validate-data.mjs`, `compile_applet`, and verify responsive layout.
