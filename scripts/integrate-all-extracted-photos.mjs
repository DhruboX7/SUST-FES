import fs from 'node:fs';
import path from 'node:path';

const speciesPath = path.resolve('public/data/species.json');
const galleryPath = path.resolve('public/data/gallery.json');

const speciesList = JSON.parse(fs.readFileSync(speciesPath, 'utf8'));
const galleryList = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));

// 1. Ensure Mangifera indica (Mango / আম) exists
const mangoIndex = speciesList.findIndex(s => s.scientificName.toLowerCase() === 'mangifera indica');
const mangoItem = {
  id: mangoIndex >= 0 ? speciesList[mangoIndex].id : 'spec-56',
  scientificName: 'Mangifera indica',
  commonName: 'Aam (Mango)',
  banglaName: 'আম',
  family: 'Anacardiaceae',
  uses: [
    'Fruit Production (National Fruit Tree)',
    'Timber & Furniture',
    'Ayurvedic & Folk Medicine',
    'Agroforestry & Shade'
  ],
  habitat: 'Homestead agroforests, alluvial plains, commercial orchards across Rajshahi, Chapainawabganj, and all districts of Bangladesh',
  conservationStatus: 'Least Concern (Cultivated)',
  distribution: 'Cultivated extensively across all 64 districts of Bangladesh',
  silviculturalNotes: 'Large evergreen tree growing up to 25–30 m with dense dome-shaped canopy. Pinkish-bronze tender leaves mature into dark leathery foliage. Massive panicles of fragrant blossoms in February–March; fleshy edible drupe ripening during May–July.',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Mango_tree_in_full_bloom_At_Southern_Agrabad_%2801%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
  photoCredit: 'Wikimedia Commons (Moheen Reeyad, CC BY-SA 4.0)',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mango_tree_in_full_bloom_At_Southern_Agrabad_(01).jpg',
  forestEcosystem: 'Plains, Alluvial Basin & Homestead Forestry',
  morePhotos: [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Mango_tree_in_full_bloom_At_Southern_Agrabad_%2801%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
      tag: 'habit',
      caption: 'Mango (আম) - Tree in full bloom in Chittagong, Bangladesh · CC BY-SA 4.0',
      credit: 'Wikimedia Commons (Moheen Reeyad)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mango_tree_in_full_bloom_At_Southern_Agrabad_(01).jpg'
    },
    {
      url: 'https://bfis.bforest.gov.bd/TreeInfo/public/uploads/Mangifera_indica.jpg',
      tag: 'habit',
      caption: 'Mango (আম) - Official Bangladesh Forest Department Tree Record',
      credit: 'Bangladesh Forest Department (BFIS TreeInfo)',
      sourceUrl: 'https://bfis.bforest.gov.bd/TreeInfo/public/'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Mango_tree_in_full_bloom_at_Agrabad_Deba_%2801%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
      tag: 'flower',
      caption: 'Mango (আম) - Dense floral panicle clusters · CC BY-SA 4.0',
      credit: 'Wikimedia Commons (Moheen Reeyad)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mango_tree_in_full_bloom_at_Agrabad_Deba_(01).jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Tender_leaves_of_Mango_%28Mangifera_india%29_from_India_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
      tag: 'leaf',
      caption: 'Mango (আম) - Reddish-bronze new leaf flush · CC BY-SA 4.0',
      credit: 'Wikimedia Commons (Biswarup Ganguly)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tender_leaves_of_Mango_(Mangifera_india)_from_India_02.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Mangoes_%28Magnifera_indica%29_from_India.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
      tag: 'fruit',
      caption: 'Mango (আম) - Mature commercial drupes on branch · CC BY-SA 3.0',
      credit: 'Wikimedia Commons (Pratheepps)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mangoes_(Magnifera_indica)_from_India.jpg'
    }
  ]
};

if (mangoIndex >= 0) {
  speciesList[mangoIndex] = mangoItem;
} else {
  speciesList.push(mangoItem);
}

// 2. Ensure Heritiera fomes (Sundari) has optimal verified habit cover & plates
const sundari = speciesList.find(s => s.scientificName === 'Heritiera fomes');
if (sundari) {
  sundari.imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Sundari_%28Heritiera_fomes%29_mangrove_forest_tree.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original';
  sundari.photoCredit = 'Wikimedia Commons (Carries mum, CC BY-SA 4.0)';
  sundari.sourceUrl = 'https://commons.wikimedia.org/wiki/File:Sundari_(Heritiera_fomes)_mangrove_forest_tree.jpg';
  sundari.forestEcosystem = 'Sundarbans Mangrove Tidal Forest';
}

// 3. Ensure Shorea robusta (Sal) has Shorea_robusta_flowers.jpg and habit cover
const sal = speciesList.find(s => s.scientificName === 'Shorea robusta');
if (sal) {
  sal.imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Shorea_robusta.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original';
  sal.photoCredit = 'Wikimedia Commons (CC BY-SA 4.0)';
  sal.sourceUrl = 'https://commons.wikimedia.org/wiki/File:Shorea_robusta.jpg';
  sal.forestEcosystem = 'Madhupur & Barind Moist Deciduous Sal Forest';
  
  // Ensure the user's specific flower photo is in morePhotos
  const flowerUrl = 'https://upload.wikimedia.org/wikipedia/commons/8/84/Shorea_robusta_flowers.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original';
  if (!sal.morePhotos.some(p => p.url.includes('Shorea_robusta_flowers.jpg'))) {
    sal.morePhotos.unshift({
      url: flowerUrl,
      tag: 'flower',
      caption: 'Sal (শাল) - Blooming flower cluster in deciduous canopy · CC BY-SA 4.0',
      credit: 'Wikimedia Commons (Delonix, CC BY-SA 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Shorea_robusta_flowers.jpg'
    });
  }
}

// 4. Ensure Golpata (Nypa fruticans) has Bangladeshi_Nipa_Palm_in_the_Sundarbans.jpg
const golpata = speciesList.find(s => s.scientificName === 'Nypa fruticans');
if (golpata) {
  golpata.imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/3/32/Bangladeshi_Nipa_Palm_in_the_Sundarbans.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original';
  golpata.photoCredit = 'Wikimedia Commons (Kmonsoor, CC BY-SA 3.0)';
  golpata.sourceUrl = 'https://commons.wikimedia.org/wiki/File:Bangladeshi_Nipa_Palm_in_the_Sundarbans.jpg';
  golpata.forestEcosystem = 'Sundarbans Mangrove Tidal Forest';
}

// 5. Ensure Jackfruit (Artocarpus heterophyllus) has Artocarpus_heterophyllus_Bangladesh.jpg
const jackfruit = speciesList.find(s => s.scientificName === 'Artocarpus heterophyllus');
if (jackfruit) {
  jackfruit.imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Artocarpus_heterophyllus_Bangladesh.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original';
  jackfruit.photoCredit = 'Wikimedia Commons (Nafiur14, CC BY-SA 4.0)';
  jackfruit.sourceUrl = 'https://commons.wikimedia.org/wiki/File:Artocarpus_heterophyllus_Bangladesh.jpg';
  jackfruit.forestEcosystem = 'Plains, Alluvial Basin & Homestead Forestry';
}

// Save updated species.json
fs.writeFileSync(speciesPath, JSON.stringify(speciesList, null, 2) + '\n', 'utf8');
console.log(`Saved ${speciesList.length} species with verified cover and multi-organ plates.`);

// 6. Enrich Field Gallery with Forest Ecosystems (Sundarbans, Madhupur, Ratargul)
const newGalleryItems = [
  {
    id: 'eco-sundarbans-1',
    title: 'Sundarbans Mangrove Biosphere Reserve',
    caption: 'Tidal waterway flanked by dense Sundari (Heritiera fomes) and Gewa canopy in the world’s largest mangrove forest.',
    category: 'Field Tour',
    location: 'Sundarbans Mangrove Forest, Bagerhat / Khulna',
    year: '2024',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/A_View_of_the_Largest_Mangrove_Forest_in_the_World.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
    photographer: 'Wikimedia Commons (Faisal Akram Ether, CC BY-SA)'
  },
  {
    id: 'eco-sundarbans-2',
    title: 'Nipa Palm (Golpata) Tidal Fringe',
    caption: 'Thick natural stand of Golpata (Nypa fruticans) flourishing along brackish canal banks with stilt roots and mangrove adaptations.',
    category: 'Field Tour',
    location: 'Kotka Sanctuary, Sundarbans East Zone',
    year: '2024',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Bangladeshi_Nipa_Palm_in_the_Sundarbans.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
    photographer: 'Wikimedia Commons (Kmonsoor, CC BY-SA 3.0)'
  },
  {
    id: 'eco-madhupur-1',
    title: 'Madhupur National Park Moist Deciduous Sal Forest',
    caption: 'Vast upper canopy coverage of Shorea robusta (Sal) showing straight clear boles and seasonal leaf shedding in the central terrace tract.',
    category: 'Field Tour',
    location: 'Madhupur National Park, Tangail',
    year: '2024',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/A_vast_canopy_coverage_on_the_Madhupr_National_Forest.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
    photographer: 'Wikimedia Commons (Sal Forest Expedition, CC BY-SA)'
  },
  {
    id: 'eco-madhupur-2',
    title: 'Madhupur Sal Forest Trails & Understory',
    caption: 'Silvicultural ground flora and coppice regeneration beneath mature Shorea robusta stands.',
    category: 'Research',
    location: 'Doklaho Range, Madhupur Tract',
    year: '2024',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Madhupur_forest.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
    photographer: 'Wikimedia Commons (Taufiqur Rahman, CC BY-SA)'
  },
  {
    id: 'eco-ratargul-1',
    title: 'Ratargul Freshwater Swamp Forest',
    caption: 'Submerged Koroch (Pongamia pinnata) and Barun (Crataeva nurvala) canopy during monsoon inundation in the Gowain river basin.',
    category: 'Field Tour',
    location: 'Ratargul Swamp Forest, Gowainghat, Sylhet',
    year: '2024',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Beautiful_ratargul_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
    photographer: 'Wikimedia Commons (Sylhet Forestry Division, CC BY-SA)'
  }
];

// Deduplicate gallery items
const existingGalleryUrls = new Set(galleryList.map(g => g.imageUrl));
let addedGallery = 0;
for (const item of newGalleryItems) {
  if (!existingGalleryUrls.has(item.imageUrl)) {
    galleryList.unshift(item);
    existingGalleryUrls.add(item.imageUrl);
    addedGallery++;
  }
}

fs.writeFileSync(galleryPath, JSON.stringify(galleryList, null, 2) + '\n', 'utf8');
console.log(`Added ${addedGallery} new forest ecosystem photos to the Field Gallery.`);
