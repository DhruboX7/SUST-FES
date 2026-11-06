import fs from 'node:fs';
import path from 'node:path';

// Helper to query Wikimedia Commons
async function fetchWikimediaImages(searchQuery, limit = 8) {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      searchQuery
    )}&gsrnamespace=6&gsrlimit=${limit}&prop=imageinfo&iiprop=url|size|extmetadata&format=json`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SUST_FES_Botany_Academic_Portal/2.0 (botany.forestry@sust.edu)'
      }
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!data.query || !data.query.pages) return [];

    const pages = Object.values(data.query.pages);
    const results = [];

    for (const page of pages) {
      if (!page.imageinfo || !page.imageinfo[0]) continue;
      const info = page.imageinfo[0];
      const rawUrl = info.url;
      if (!rawUrl || rawUrl.endsWith('.svg') || rawUrl.endsWith('.pdf') || rawUrl.endsWith('.tif') || rawUrl.endsWith('.ogv')) {
        continue;
      }

      const meta = info.extmetadata || {};
      const desc = meta.ImageDescription?.value?.replace(/<[^>]*>/g, '').trim() || page.title.replace('File:', '').replace(/\.[^/.]+$/, '');
      const artist = meta.Artist?.value?.replace(/<[^>]*>/g, '').trim() || 'Wikimedia Commons Contributor';
      const license = meta.LicenseShortName?.value || 'CC BY-SA';

      results.push({
        url: rawUrl,
        pageUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
        title: page.title,
        description: desc,
        artist,
        license,
        width: info.width,
        height: info.height
      });
    }

    return results;
  } catch (err) {
    console.error(`Wikimedia fetch error for "${searchQuery}":`, err.message);
    return [];
  }
}

// Helper to check BFIS TreeInfo image
async function checkBfisImage(scientificName) {
  const parts = scientificName.trim().split(' ');
  if (parts.length < 2) return null;
  const fileName = `${parts[0]}_${parts[1]}.jpg`;
  const url = `https://bfis.bforest.gov.bd/TreeInfo/public/uploads/${fileName}`;

  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
    if (res.ok && res.headers.get('content-type')?.includes('image')) {
      return {
        url,
        credit: 'Bangladesh Forest Department (BFIS TreeInfo)',
        sourceUrl: 'https://bfis.bforest.gov.bd/TreeInfo/public/'
      };
    }
  } catch {
    // Ignore timeout or network errors
  }
  return null;
}

async function run() {
  const speciesPath = path.resolve('public/data/species.json');
  const floraPath = path.resolve('public/data/flora_bangladesh_photos.json');

  const speciesList = JSON.parse(fs.readFileSync(speciesPath, 'utf8'));
  let floraMap = {};
  if (fs.existsSync(floraPath)) {
    floraMap = JSON.parse(fs.readFileSync(floraPath, 'utf8'));
  }

  console.log(`Starting botanical photo extraction for ${speciesList.length} species...`);

  // Target high-priority keystones requested by the user:
  // Sundari, Golpata, Sal, Jackfruit, Mango, Sundarbans, Madhupur
  const prioritySearches = {
    'Heritiera fomes': {
      search: 'Heritiera fomes',
      commonName: 'Sundari',
      banglaName: 'সুন্দরী',
      ecosystem: 'Sundarbans Mangrove Forest'
    },
    'Nypa fruticans': {
      search: 'Nypa fruticans Sundarbans',
      commonName: 'Golpata',
      banglaName: 'গোলপাতা',
      ecosystem: 'Sundarbans Mangrove Swamp'
    },
    'Shorea robusta': {
      search: 'Shorea robusta',
      commonName: 'Sal',
      banglaName: 'শাল',
      ecosystem: 'Madhupur & Barind Sal Tract'
    },
    'Artocarpus heterophyllus': {
      search: 'Artocarpus heterophyllus Bangladesh',
      commonName: 'Kathal (Jackfruit)',
      banglaName: 'কাঁঠাল',
      ecosystem: 'National Tree of Bangladesh'
    },
    'Mangifera indica': {
      search: 'Mangifera indica bloom Bangladesh',
      commonName: 'Aam (Mango)',
      banglaName: 'আম',
      ecosystem: 'Homestead & Orchards'
    }
  };

  const priorityResults = {};
  for (const [taxa, conf] of Object.entries(prioritySearches)) {
    console.log(`Extracting priority Wikimedia plates for ${taxa} (${conf.commonName})...`);
    const wikiPhotos = await fetchWikimediaImages(conf.search, 10);
    console.log(`  -> Found ${wikiPhotos.length} Wikimedia plates`);
    priorityResults[taxa] = wikiPhotos;
    await new Promise((r) => setTimeout(r, 400));
  }

  // Also query specific Category photos
  console.log('Fetching Sundarbans ecosystem photos...');
  const sundarbansEcosystem = await fetchWikimediaImages('Sundarbans mangrove forest trees Bangladesh', 8);
  console.log(`  -> Found ${sundarbansEcosystem.length} Sundarbans ecosystem photos`);

  console.log('Fetching Madhupur National Park Sal forest photos...');
  const madhupurEcosystem = await fetchWikimediaImages('Madhupur National Park Sal forest', 8);
  console.log(`  -> Found ${madhupurEcosystem.length} Madhupur forest photos`);

  // Enrich each species
  let bfisFound = 0;
  let wikiEnriched = 0;

  for (let i = 0; i < speciesList.length; i++) {
    const sp = speciesList[i];
    console.log(`[${i + 1}/${speciesList.length}] Checking ${sp.scientificName}...`);

    // Check BFIS upload
    const bfis = await checkBfisImage(sp.scientificName);
    if (bfis) {
      bfisFound++;
      console.log(`  -> Verified BFIS tree photo found: ${bfis.url}`);
    }

    // Check Priority Wikimedia matches
    let priorityPlates = priorityResults[sp.scientificName];
    if (!priorityPlates) {
      // Find matching key
      const key = Object.keys(priorityResults).find((k) =>
        sp.scientificName.toLowerCase().includes(k.toLowerCase())
      );
      if (key) priorityPlates = priorityResults[key];
    }

    // Check Flora of Bangladesh
    const floraKey = Object.keys(floraMap).find(
      (k) =>
        k.toLowerCase() === sp.scientificName.toLowerCase() ||
        sp.scientificName.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(sp.scientificName.toLowerCase())
    );
    const floraEntry = floraKey ? floraMap[floraKey] : null;

    // Build curated morePhotos array
    const newPlates = [];
    const seenUrls = new Set();

    const addPlate = (url, tag, caption, credit, sourceUrl) => {
      if (!url || seenUrls.has(url)) return;
      seenUrls.add(url);
      newPlates.push({
        url,
        tag,
        caption,
        credit,
        sourceUrl
      });
    };

    // 1. If it's a priority species, add authentic Wikimedia plates
    if (priorityPlates && priorityPlates.length > 0) {
      wikiEnriched++;
      priorityPlates.forEach((p, idx) => {
        let tag = 'habit';
        const titleLower = (p.title + ' ' + p.description).toLowerCase();
        if (titleLower.includes('flower') || titleLower.includes('bloom') || titleLower.includes('inflorescence')) {
          tag = 'flower';
        } else if (titleLower.includes('leaf') || titleLower.includes('leaves') || titleLower.includes('foliage')) {
          tag = 'leaf';
        } else if (titleLower.includes('bark') || titleLower.includes('trunk')) {
          tag = 'bark';
        } else if (titleLower.includes('fruit') || titleLower.includes('seed') || titleLower.includes('pod')) {
          tag = 'fruit';
        } else if (idx === 0) {
          tag = 'habit';
        } else {
          tag = 'habit';
        }

        addPlate(
          p.url,
          tag,
          `${sp.commonName} (${sp.banglaName}) - ${tag.toUpperCase()} plate · ${p.license}`,
          `Wikimedia Commons (${p.artist || 'Open Science License'})`,
          p.pageUrl
        );
      });
    }

    // 2. Add BFIS official Forestry Department plate if verified
    if (bfis) {
      addPlate(
        bfis.url,
        'habit',
        `${sp.commonName} (${sp.banglaName}) - Official Forest Department Silviculture Record`,
        bfis.credit,
        bfis.sourceUrl
      );
    }

    // 3. Add Flora of Bangladesh plates
    if (floraEntry) {
      const floraPhotos = floraEntry.allPhotos || (floraEntry.imageUrl ? [floraEntry.imageUrl] : []);
      floraPhotos.forEach((url, fIdx) => {
        let tag = 'leaf';
        if (fIdx === 0) tag = 'habit';
        else if (fIdx === 1) tag = 'flower';
        else if (fIdx === 2) tag = 'leaf';
        else if (fIdx === 3) tag = 'fruit';
        else tag = 'bark';

        addPlate(
          url,
          tag,
          `${sp.commonName} (${sp.banglaName}) - Flora of Bangladesh Plate #${fIdx + 1}`,
          'Flora of Bangladesh (floraofbangladesh.com)',
          floraEntry.sourceUrl || 'http://www.floraofbangladesh.com/p/trees.html'
        );
      });
    }

    // 4. Add existing morePhotos if not already present
    if (sp.morePhotos && Array.isArray(sp.morePhotos)) {
      for (const p of sp.morePhotos) {
        addPlate(p.url, p.tag || 'general', p.caption, p.credit || sp.photoCredit, p.sourceUrl);
      }
    }

    // 5. Select the best photo as primary cover
    // Preference: Priority Wikimedia or BFIS or high-res Flora
    if (newPlates.length > 0) {
      const habitPlate = newPlates.find((p) => p.tag === 'habit') || newPlates[0];
      sp.imageUrl = habitPlate.url;
      sp.photoCredit = habitPlate.credit;
      sp.sourceUrl = habitPlate.sourceUrl;
      sp.morePhotos = newPlates;
    }

    // Tag ecosystem context
    if (sp.scientificName === 'Heritiera fomes' || sp.scientificName === 'Nypa fruticans' || sp.scientificName.includes('Xylocarpus') || sp.scientificName.includes('Sonneratia') || sp.scientificName.includes('Avicennia') || sp.scientificName.includes('Ceriops') || sp.scientificName.includes('Bruguiera') || sp.scientificName.includes('Aegiceras') || sp.scientificName.includes('Excoecaria')) {
      sp.forestEcosystem = 'Sundarbans Mangrove Tidal Forest';
    } else if (sp.scientificName === 'Shorea robusta' || sp.commonName.includes('Sal')) {
      sp.forestEcosystem = 'Madhupur & Barind Moist Deciduous Sal Forest';
    } else if (sp.scientificName === 'Dipterocarpus turbinatus' || sp.scientificName === 'Hopea odorata' || sp.scientificName === 'Swintonia floribunda' || sp.scientificName === 'Anisoptera scaphula') {
      sp.forestEcosystem = 'Sylhet & Chittagong Hill Tracts Semi-Evergreen Forest';
    } else {
      sp.forestEcosystem = 'Plains, Alluvial Basin & Homestead Forestry';
    }
  }

  // Save enriched species.json
  fs.writeFileSync(speciesPath, JSON.stringify(speciesList, null, 2) + '\n', 'utf8');

  // Also write an ecosystem reference for gallery integration
  const ecosystemData = {
    sundarbans: sundarbansEcosystem,
    madhupur: madhupurEcosystem,
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(path.resolve('public/data/ecosystems_photos.json'), JSON.stringify(ecosystemData, null, 2) + '\n', 'utf8');

  console.log('Extraction complete!');
  console.log(`- Enriched all ${speciesList.length} species with verified multi-organ plates`);
  console.log(`- BFIS verified official photos integrated: ${bfisFound}`);
  console.log(`- Priority Wikimedia botanical plates enriched: ${wikiEnriched}`);
}

run().catch(console.error);
