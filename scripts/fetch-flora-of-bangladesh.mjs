import fs from 'node:fs';
import path from 'node:path';

async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
      });
      if (res.ok) return await res.text();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return null;
}

async function scrapeFloraOfBangladesh() {
  console.log('Fetching master tree catalog from https://www.floraofbangladesh.com/p/trees.html ...');
  const indexHtml = await fetchWithRetry('https://www.floraofbangladesh.com/p/trees.html');
  if (!indexHtml) {
    console.error('Failed to load trees.html');
    return;
  }

  // Find post body
  const postBodyIdx = indexHtml.indexOf('post-body');
  const catalogSection = postBodyIdx !== -1 ? indexHtml.substring(postBodyIdx) : indexHtml;

  // Extract tree link items
  // Pattern: <a href="http://www.floraofbangladesh.com/YYYY/MM/...html">...</a>
  const linkRegex = /href=["\x27](https?:\/\/www\.floraofbangladesh\.com\/\d{4}\/\d{2}\/[^"\x27]+\.html)["\x27][^>]*>([\s\S]*?)<\/a>/gi;
  const treeMap = new Map();

  let match;
  while ((match = linkRegex.exec(catalogSection)) !== null) {
    const postUrl = match[1];
    const rawLabel = match[2].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

    // Skip pagination or sidebar links
    if (rawLabel.length < 3 || rawLabel.toLowerCase().includes('comment') || rawLabel.toLowerCase().includes('read more')) {
      continue;
    }

    // Try to extract scientific name and common name
    // e.g. "Ashok, Saraca asoca", "Jarul, Lagerstroemia speciosa", "Shonalu, Cassia fistula", "Amra, Hog plum, Spondias pinnata"
    const parts = rawLabel.split(',').map(s => s.trim());
    let scientificName = parts[parts.length - 1];
    // if last part contains "or", e.g. "Flame of forest, Butea monosperma"
    if (scientificName.includes(' or ')) {
      const sub = scientificName.split(' or ');
      scientificName = sub[sub.length - 1].trim();
    }

    treeMap.set(postUrl, {
      postUrl,
      rawLabel,
      scientificName,
      parts
    });
  }

  console.log(`Discovered ${treeMap.size} unique tree species on Flora of Bangladesh!`);

  // Read current species.json
  const speciesPath = path.resolve('public/data/species.json');
  const speciesList = JSON.parse(fs.readFileSync(speciesPath, 'utf8'));

  // Normalize helper
  const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const matchedPosts = [];

  for (const [url, item] of treeMap.entries()) {
    // Check which of our 55 species matches this
    const normSc = normalize(item.scientificName);
    const normRaw = normalize(item.rawLabel);

    for (const sp of speciesList) {
      const normTargetSc = normalize(sp.scientificName);
      const normTargetCommon = normalize(sp.commonName);
      const genusTarget = sp.scientificName.split(' ')[0].toLowerCase();
      const specificEpithetTarget = sp.scientificName.split(' ')[1] ? sp.scientificName.split(' ')[1].toLowerCase() : '';

      const isExactMatch = normRaw.includes(normTargetSc) || normSc.includes(normTargetSc);
      const isSpecificMatch = specificEpithetTarget.length > 3 && normRaw.includes(specificEpithetTarget) && normRaw.includes(genusTarget.substring(0, 4));

      if (isExactMatch || isSpecificMatch) {
        matchedPosts.push({
          speciesId: sp.id,
          speciesName: sp.scientificName,
          postUrl: url,
          title: item.rawLabel
        });
        break;
      }
    }
  }

  console.log(`Found direct matches for ${matchedPosts.length} species!`);

  // Now fetch the primary photo for each matched post
  const results = {};
  for (let i = 0; i < matchedPosts.length; i++) {
    const { speciesId, speciesName, postUrl, title } = matchedPosts[i];
    try {
      console.log(`[${i + 1}/${matchedPosts.length}] Scraping photo for ${speciesName} (${title})...`);
      const pageHtml = await fetchWithRetry(postUrl);
      if (!pageHtml) continue;

      // Extract image inside post-body
      // Look for blogger.googleusercontent.com or bp.blogspot.com
      const postBodyMatch = pageHtml.match(/class=["\x27][^"\x27]*post-body[^"\x27]*["\x27][\s\S]*?<\/div>\s*<\/div>/i);
      const searchScope = postBodyMatch ? postBodyMatch[0] : pageHtml;

      const imgMatches = [...searchScope.matchAll(/src=["\x27](https:\/\/(?:blogger\.googleusercontent\.com|\d+\.bp\.blogspot\.com)[^"\x27]+)["\x27]/gi)];
      
      if (imgMatches.length > 0) {
        // Pick the first large botanical image (filter out small avatars or icons)
        for (const imgM of imgMatches) {
          let imgUrl = imgM[1];
          if (!imgUrl.includes('avatar') && !imgUrl.includes('icon') && !imgUrl.includes('logo') && !imgUrl.includes('rpc_relay')) {
            // Upgrade size to high-resolution /s1600/ or /w1200/
            imgUrl = imgUrl.replace(/\/s\d+\//, '/s1600/').replace(/\/w\d+-h\d+[^/]*\//, '/s1600/');
            results[speciesName] = {
              imageUrl: imgUrl,
              sourceUrl: postUrl,
              sourceName: 'Flora of Bangladesh (floraofbangladesh.com)'
            };
            console.log(`  -> Found photo: ${imgUrl}`);
            break;
          }
        }
      }
      // Brief pause to be respectful to the server
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.warn(`  Failed fetching photo for ${speciesName}: ${err.message}`);
    }
  }

  // Save the scraped database to public/data/flora_bangladesh_photos.json
  const outPath = path.resolve('public/data/flora_bangladesh_photos.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2) + '\n', 'utf8');
  console.log(`Saved ${Object.keys(results).length} Flora of Bangladesh photos to ${outPath}`);

  // Now update species.json with these authentic photos
  let enrichedCount = 0;
  const updatedSpecies = speciesList.map(sp => {
    if (results[sp.scientificName]) {
      enrichedCount++;
      return {
        ...sp,
        imageUrl: results[sp.scientificName].imageUrl,
        photoCredit: 'Flora of Bangladesh (floraofbangladesh.com)',
        floraUrl: results[sp.scientificName].sourceUrl
      };
    }
    return sp;
  });

  fs.writeFileSync(speciesPath, JSON.stringify(updatedSpecies, null, 2) + '\n', 'utf8');
  console.log(`Successfully updated ${enrichedCount} tree species in species.json with Flora of Bangladesh photos!`);
}

scrapeFloraOfBangladesh().catch(console.error);
