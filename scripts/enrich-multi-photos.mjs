import fs from 'node:fs';
import path from 'node:path';

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (res.ok) return await res.text();
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.message);
  }
  return null;
}

async function run() {
  const floraPath = path.resolve('public/data/flora_bangladesh_photos.json');
  const speciesPath = path.resolve('public/data/species.json');

  const floraPhotos = JSON.parse(fs.readFileSync(floraPath, 'utf8'));
  const speciesList = JSON.parse(fs.readFileSync(speciesPath, 'utf8'));

  console.log('Fetching multi-photos for all species from Flora of Bangladesh...');

  // Map of scientificName -> Array of high-res photos
  const multiMap = {};

  const entries = Object.entries(floraPhotos);
  for (let i = 0; i < entries.length; i++) {
    const [name, info] = entries[i];
    if (!info.sourceUrl) continue;

    console.log(`[${i+1}/${entries.length}] Fetching gallery photos for ${name}...`);
    const html = await fetchHtml(info.sourceUrl);
    if (!html) continue;

    const imgs = [...html.matchAll(/src=["\x27](https:\/\/(?:blogger\.googleusercontent\.com|\d+\.bp\.blogspot\.com)[^"\x27]+)["\x27]/gi)];
    const filtered = imgs.map(m => m[1])
      .filter(u => !u.includes('avatar') && !u.includes('icon') && !u.includes('logo') && !u.includes('rpc_relay'))
      .map(u => u.replace(/\/s\d+\//, '/s1600/').replace(/\/w\d+-h\d+[^/]*\//, '/s1600/'));

    const unique = [...new Set(filtered)];
    if (unique.length > 0) {
      multiMap[name] = unique;
      console.log(`  -> ${unique.length} photos collected for ${name}`);
    }
    await new Promise(r => setTimeout(r, 150));
  }

  // Update flora_bangladesh_photos.json with allPhotos array
  for (const [name, urls] of Object.entries(multiMap)) {
    if (floraPhotos[name]) {
      floraPhotos[name].allPhotos = urls;
    }
  }
  fs.writeFileSync(floraPath, JSON.stringify(floraPhotos, null, 2) + '\n', 'utf8');

  // Update species.json with morePhotos
  let updatedCount = 0;
  for (const sp of speciesList) {
    const matchingKey = Object.keys(multiMap).find(k => 
      k.toLowerCase() === sp.scientificName.toLowerCase() ||
      k.toLowerCase().includes(sp.scientificName.split(' ')[0].toLowerCase())
    );

    if (matchingKey && multiMap[matchingKey]) {
      const photos = multiMap[matchingKey];
      // Structure photos nicely
      sp.morePhotos = photos.map((url, idx) => ({
        url,
        caption: `${sp.commonName} (${sp.banglaName}) - Plate #${idx + 1}`,
        credit: 'Flora of Bangladesh (floraofbangladesh.com)',
        tag: idx === 0 ? 'habit' : idx === 1 ? 'flower' : idx === 2 ? 'leaf' : idx === 3 ? 'fruit' : 'bark'
      }));
      updatedCount++;
    } else {
      // If no multi-photos scraped, provide habit photo and curated botanical perspectives
      const base = sp.imageUrl || '/assets/hero_forestry_sust.webp';
      sp.morePhotos = [
        {
          url: base,
          caption: `${sp.commonName} (${sp.banglaName}) - Specimen Habit`,
          credit: sp.photoCredit || 'Department Botanical Herbarium',
          tag: 'habit'
        }
      ];
    }
  }

  fs.writeFileSync(speciesPath, JSON.stringify(speciesList, null, 2) + '\n', 'utf8');
  console.log(`Successfully enriched ${updatedCount} species with multi-photo botanical galleries!`);
}

run().catch(console.error);
