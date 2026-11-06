# Bangladesh Forest Flora & Tree Species Photo Curation System

Enriches the SUST Forestry tree species catalog with verified, high-resolution botanical photography extracted from the Bangladesh Forest Department (BFIS), Bangladesh National Herbarium (BNH), Flora of Bangladesh, and Wikimedia Commons, providing authentic morphological plates and ecosystem context.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during interactive clarification and form the architectural baseline for this release:
> - **Primary & Multi-Plate Integration**: Primary cover photos will be updated with the highest-resolution authentic habit/canopy captures, and additional extracted photos will be cataloged as structured morphological plates (Habit, Foliage/Leaves, Bark, Flower, Fruit/Seed).
> - **Catalog Coverage**: Enriches all 55 native and plantation species in the SUST FES catalog while creating comprehensive botanical plates for national and regional forest keystones: Sundari (*Heritiera fomes*), Golpata (*Nypa fruticans*), Sal (*Shorea robusta*), National Tree Jackfruit (*Artocarpus heterophyllus*), Mango (*Mangifera indica*), as well as Sundarbans and Madhupur National Park ecosystems.
> - **Official Attribution & Source Badges**: Every photo will carry transparent attribution and direct links to its respective source authority (BFIS Forest Dept, BNH Herbarium, Wikimedia Commons CC BY-SA, or Flora of Bangladesh), displayed elegantly in species cards, detail views, and lightboxes without visual clutter.

---

### 1. Overview & Core Concept

- **What It Does**:
  1. **Automated Multi-Source Extraction**: Ingests and normalizes authentic plant specimen photographs from four authoritative institutional repositories:
     - **Bangladesh Forest Department (BFIS TreeInfo)**: Official forestry plantation, silvicultural habit, and wood anatomy imagery.
     - **Bangladesh National Herbarium (BNH e-Flora)**: Certified taxonomic specimen sheets and diagnostic morphological plates.
     - **Flora of Bangladesh**: High-resolution field photography spanning trees of Bangladesh.
     - **Wikimedia Commons**: High-definition, open-licensed (CC BY-SA 4.0/3.0) botanical plates for Sundari, Golpata, Sal flowers, Jackfruit, and Mango, plus habitat captures of Sundarbans and Madhupur Sal tract.
  2. **Morphological Plate Taxonomy**: Categorizes photos into standardized botanical organs: `habit` (growth form & crown), `leaf` (venation & arrangement), `bark` (trunk texture & lenticels), `flower` (inflorescence details), `fruit` (pods, drupes, seeds), and `ecosystem` (natural stand habitat).
  3. **High-Fidelity Visual Catalog**: Updates `species.json` with pristine, verified images replacing unverified links, while ensuring zero broken images with graceful CSS fallback cards.
  4. **Admin Curation Controls**: Allows administrators in `/manage` to preview, switch primary covers, re-order plates, and perform 1-click batch syncs with new extracted sources.

- **Target Audience & Persona**:
  - **Forestry Undergraduates & Faculty**: Reviewing diagnostic traits for dendrology courses, practical herbarium exams, and field tours.
  - **Dendrology & Silviculture Researchers**: Verifying regional phenotypes across mangrove, moist deciduous, and evergreen forest tracts.
  - **Department Administrators**: Maintaining the official botanical archive with verified citations.

- **Key Value**:
  Replaces unverified placeholder graphics with accredited, scientifically grounded field photography directly tied to Bangladesh's national forestry institutions and open scientific commons.

---

### 2. User Experience & Visual Design

Following the *Frontend Design Constitution* and the *Science & Biotech Precision Guidelines*:

- **Key User Flows**:
  1. **Catalog Exploration (`/species`)**:
     - The user browses the 55 tree species grid. Each card presents a crisp, verified habit cover photo with an unboxed scientific kicker (`Family · Binomial Name · Bangla Name`).
     - A subtle source badge (e.g., `BFIS`, `BNH`, `Wikimedia`, or `Flora BD`) indicates the accredited authority with external link support.
     - Multi-plate indicator shows available morphological perspectives (e.g., `4 Botanical Plates`).
  2. **Botanical Lightbox & Morphology Viewer**:
     - Clicking any species opens the deep-inspection modal.
     - Features an interactive thumbnail strip alternating between Habit, Foliage, Bark, Inflorescence, and Fruits.
     - High-resolution pan/zoom viewport displays fine venation and bark fissures without compression artifacts.
     - Displays full provenance metadata: photographer/artist, license (`CC BY-SA`), source organization, and direct URL to the national database record.
  3. **Habitat & Ecosystem Portals (`/gallery` & `/species`)**:
     - Dedicated ecosystem tags highlighting Sundarbans mangrove association (Sundari, Golpata, Gorjan) and Madhupur moist deciduous tract (Sal, Haldu, Koroi).
  4. **Management Console Integration (`/manage` -> Tree Species)**:
     - Admin can test-fetch photos from any of the four portals directly within the Species Editor modal or launch batch sync.

- **Visual Identity & Theme**:
  - **Palette**: Monochromatic forestry canvas (crisp white `#FFFFFF` / dark obsidian `#0C0E12`), deep forest structural borders (`#1B382B` accents in dark mode, `#E2E8F0` in light mode), and calibrated botanical green (`#047857` / `#10B981`) for active states.
  - **Typography**: Clean neo-grotesque interface type (`Plus Jakarta Sans` / `Outfit`) paired with italicized Latin binomial nomenclature (`font-serif italic` for species names) and tabular numerals (`font-mono tabular-nums`) for plate counts and dimensions.
  - **Zero-Pill Discipline**: Metadata displayed as unboxed typographic lines with bullet separators (`Fabaceae · Albizia saman · রেইনট্রি · 6 Plates`).
  - **Resilient Fallback**: Strict `referrerPolicy="no-referrer"` with graceful inline SVG silhouette fallbacks for network-restricted environments.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct CDN & Wikimedia Image URL Resolution**
  - *Chosen Approach*: Resolve direct, high-speed Wikimedia upload URLs (`upload.wikimedia.org/...`) and official BFIS/BNH web assets with strict HTTPS, storing dimensions and metadata locally in `species.json`.
  - *Why*: Eliminates CORS redirects and prevents runtime API rate-limiting during exam season or classroom use.
  - *Alternatives Considered*: Dynamic runtime API calls on every card render (risks Wikimedia 429 throttling and network latency).

- **Decision 2: Comprehensive Multi-Organ Plate Model**
  - *Chosen Approach*: Store up to 6 curated morphological plates per species inside `morePhotos: TreePhoto[]`, tagged by botanical organ (`habit`, `leaf`, `bark`, `flower`, `fruit`).
  - *Why*: Dendrology taxonomy requires cross-examination of bark and leaf venation, not just a distant tree silhouette.
  - *Alternatives Considered*: Single cover photo only (fails to support academic practical learning).

- **Decision 3: Offline-Resilient Static Seed + Authoritative Local Storage**
  - *Chosen Approach*: Write enriched records directly into `public/data/species.json` and synchronize with `src/utils/storage.ts` so custom additions made by admins remain preserved without loss.
  - *Why*: Ensures immediate loading for new visitors while honoring admin edits.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Institutional Data Sources                      │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ BFIS TreeInfo      │ BNH e-Flora        │ Wikimedia Commons            │
│ (bforest.gov.bd)   │ (bnh.gov.bd)       │ (CC BY-SA high-res media)    │
│ Silviculture Dept  │ Certified Herbarium│ Sundari, Sal, Golpata, Mango │
└─────────┬──────────┴─────────┬──────────┴──────────────┬───────────────┘
          │                    │                         │
          ▼                    ▼                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Data Extraction & Normalization Script                   │
│                    (scripts/extract-tree-photos.mjs)                   │
│  - Fetches Wikimedia MediaSearch API & ImageInfo                       │
│  - Queries BFIS & BNH verified botanical plate catalogs                │
│  - Organizes photos by botanical organ tag (habit/leaf/bark/flower)    │
│  - Normalizes licenses, attributions, and direct CDN endpoints         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   SUST FES Digital Botanical Engine                    │
│                                                                        │
│   public/data/species.json               src/utils/storage.ts          │
│   (55 Enriched Taxa)           ◄──────► (Reactive Local Storage)       │
│                                                   │                    │
│         ┌─────────────────────────────────────────┴─────────┐          │
│         ▼                                                   ▼          │
│   SpeciesDatabaseView.tsx                         AdminSpeciesPanel.tsx│
│   - Verified Botanical Habit Covers               - 1-Click Multi-Sync │
│   - Multi-Plate Morphological Viewer              - Plate Editor       │
│   - Institutional Provenance Badges               - Cover Selector     │
└────────────────────────────────────────────────────────────────────────┘
```

#### Step-by-Step Implementation Sequence

1. **Extraction & Ingestion Script (`scripts/extract-tree-photos.mjs`)**:
   - Query Wikimedia API for high-resolution images of *Heritiera fomes* (Sundari), *Nypa fruticans* (Golpata), *Shorea robusta* (Sal), *Artocarpus heterophyllus* (Jackfruit), and *Mangifera indica* (Mango).
   - Resolve habitat captures for Sundarbans mangrove forest and Madhupur National Park Sal tract.
   - Cross-reference with BFIS and BNH e-Flora indices for campus and native species.
   - Output structured JSON mappings with organ tags, captions, and attribution.

2. **Botanical Database Enrichment (`public/data/species.json`)**:
   - Update primary `imageUrl` and comprehensive `morePhotos` arrays for all 55 catalog species.
   - Assign appropriate tags (`habit`, `leaf`, `bark`, `flower`, `fruit`) and institutional credit.

3. **Public Botanical Interface Updates (`src/components/SpeciesDatabaseView.tsx`)**:
   - Render multi-plate gallery tabs in the species modal with smooth keyboard arrow navigation.
   - Display quiet, authoritative source badges with direct external links.
   - Add filter toggle for "Multi-Plate Verified Species" and "Forest Ecosystems".

4. **Admin Management Updates (`src/components/admin/AdminSpeciesPanel.tsx` & `AdminSpeciesPhotosModal.tsx`)**:
   - Add multi-source sync presets allowing admins to pull newly available photos from BFIS, BNH, and Wikimedia.
   - Enable quick primary photo replacement with any extracted plate.

5. **Validation & Verification**:
   - Run `node scripts/validate-data.mjs` to ensure 100% schema compliance.
   - Execute `compile_applet` and `lint_applet` to confirm zero build errors.
   - Verify HTTP 200 health and visual presentation.
