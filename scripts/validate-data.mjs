import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const DATA_DIR = path.resolve('public/data');

let hasErrors = false;

function logError(file, message) {
  console.error(`❌ [${file}] ${message}`);
  hasErrors = true;
}

function logSuccess(file, count) {
  console.log(`✅ [${file}] Validated ${count} entries successfully.`);
}

function readJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    logError(filename, `File does not exist at ${filePath}`);
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    logError(filename, `JSON parse error: ${err.message}`);
    return null;
  }
}

// 1. Validate resources.json / resources.sample.json
function validateResources(filename) {
  const data = readJson(filename);
  if (!data) return;
  if (!Array.isArray(data)) {
    return logError(filename, 'Root must be an array.');
  }

  const validCategories = new Set(['slides', 'notes', 'pyq', 'book', 'practical', 'syllabus']);

  data.forEach((item, idx) => {
    const prefix = `Item #${idx} (${item?.id || 'unidentified'})`;
    if (!item.id || typeof item.id !== 'string') logError(filename, `${prefix}: Missing or invalid 'id' string`);
    if (!item.title || typeof item.title !== 'string') logError(filename, `${prefix}: Missing or invalid 'title' string`);
    if (!item.courseCode || typeof item.courseCode !== 'string') logError(filename, `${prefix}: Missing or invalid 'courseCode' string`);
    if (!item.category || !validCategories.has(item.category)) logError(filename, `${prefix}: Invalid 'category': ${item.category}`);
    if (!item.driveUrl || typeof item.driveUrl !== 'string') logError(filename, `${prefix}: Missing or invalid 'driveUrl' string`);
  });

  logSuccess(filename, data.length);
}

// 2. Validate notices.json
function validateNotices() {
  const filename = 'notices.json';
  const data = readJson(filename);
  if (!data) return;
  if (!Array.isArray(data)) return logError(filename, 'Root must be an array.');

  data.forEach((item, idx) => {
    const prefix = `Notice #${idx} (${item?.id || 'unidentified'})`;
    if (!item.id) logError(filename, `${prefix}: Missing 'id'`);
    if (!item.title) logError(filename, `${prefix}: Missing 'title'`);
    if (!item.date) logError(filename, `${prefix}: Missing 'date'`);
    if (!item.body) logError(filename, `${prefix}: Missing 'body'`);
  });

  logSuccess(filename, data.length);
}

// 3. Validate routine.json
function validateRoutine() {
  const filename = 'routine.json';
  const data = readJson(filename);
  if (!data) return;
  if (!Array.isArray(data)) return logError(filename, 'Root must be an array.');

  data.forEach((yr, idx) => {
    const prefix = `Routine #${idx} Year ${yr?.year} Sem ${yr?.semester}`;
    if (!yr.year || typeof yr.year !== 'number') logError(filename, `${prefix}: Missing or invalid 'year' number`);
    if (!yr.semester || typeof yr.semester !== 'number') logError(filename, `${prefix}: Missing or invalid 'semester' number`);
    if (!Array.isArray(yr.schedule)) logError(filename, `${prefix}: Missing or non-array 'schedule'`);
  });

  logSuccess(filename, data.length);
}

// 4. Validate species.json
function validateSpecies() {
  const filename = 'species.json';
  const data = readJson(filename);
  if (!data) return;
  if (!Array.isArray(data)) return logError(filename, 'Root must be an array.');

  data.forEach((sp, idx) => {
    const prefix = `Species #${idx} (${sp?.scientificName || 'unidentified'})`;
    if (!sp.id) logError(filename, `${prefix}: Missing 'id'`);
    if (!sp.scientificName) logError(filename, `${prefix}: Missing 'scientificName'`);
    if (!sp.family) logError(filename, `${prefix}: Missing 'family'`);
    if (!Array.isArray(sp.uses)) logError(filename, `${prefix}: 'uses' must be an array`);
  });

  logSuccess(filename, data.length);
}

// 5. Validate gallery.json
function validateGallery() {
  const filename = 'gallery.json';
  const data = readJson(filename);
  if (!data) return;
  if (!Array.isArray(data)) return logError(filename, 'Root must be an array.');

  data.forEach((g, idx) => {
    const prefix = `Gallery item #${idx} (${g?.title || 'unidentified'})`;
    if (!g.id) logError(filename, `${prefix}: Missing 'id'`);
    if (!g.title) logError(filename, `${prefix}: Missing 'title'`);
    if (!g.category) logError(filename, `${prefix}: Missing 'category'`);
  });

  logSuccess(filename, data.length);
}

// 6. Validate theses.json
function validateTheses() {
  const filename = 'theses.json';
  const data = readJson(filename);
  if (!data) return;
  if (!Array.isArray(data)) return logError(filename, 'Root must be an array.');

  data.forEach((th, idx) => {
    const prefix = `Thesis #${idx} (${th?.title || 'unidentified'})`;
    if (!th.id) logError(filename, `${prefix}: Missing 'id'`);
    if (!th.title) logError(filename, `${prefix}: Missing 'title'`);
    if (!th.author) logError(filename, `${prefix}: Missing 'author'`);
    if (!th.supervisor) logError(filename, `${prefix}: Missing 'supervisor'`);
  });

  logSuccess(filename, data.length);
}

// 7. Validate student_photos.json
function validateStudentPhotos() {
  const filename = 'student_photos.json';
  const data = readJson(filename);
  if (!data) return;
  if (!Array.isArray(data)) return logError(filename, 'Root must be an array.');

  data.forEach((p, idx) => {
    const prefix = `Student Photo #${idx} (${p?.title || 'unidentified'})`;
    if (!p.id) logError(filename, `${prefix}: Missing 'id'`);
    if (!p.studentName) logError(filename, `${prefix}: Missing 'studentName'`);
    if (!p.title) logError(filename, `${prefix}: Missing 'title'`);
    if (!p.imageUrl) logError(filename, `${prefix}: Missing 'imageUrl'`);
  });

  logSuccess(filename, data.length);
}

console.log('--- SUST FES Library Static Data Validation ---');
validateResources('resources.json');
validateResources('resources.sample.json');
validateNotices();
validateRoutine();
validateSpecies();
validateGallery();
validateTheses();
validateStudentPhotos();

if (hasErrors) {
  console.error('\nData validation failed with errors.');
  process.exit(1);
} else {
  console.log('\nAll static JSON archives validated successfully.');
  process.exit(0);
}
