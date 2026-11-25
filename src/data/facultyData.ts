export interface FacultyEducation {
  degree: string;
  institute: string;
  duration?: string;
}

export interface FacultyExternalLink {
  label: string;
  url: string;
}

export interface FacultyPublication {
  title: string;
  year?: number;
  url?: string;
}

export interface FacultyAward {
  title: string;
  year?: number;
}

export interface OfficialFaculty {
  id: string;
  name: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer';
  isHead?: boolean;
  onLeave?: boolean;
  availabilityLabel?: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  office?: string;
  profileUrl?: string;
  cvUrl?: string;
  researchAreas?: string[];
  researchSummary?: string;
  bio?: string;
  education?: FacultyEducation[];
  teaching?: string[];
  links?: FacultyExternalLink[];
  publicationsCount?: number;
  selectedPublications?: FacultyPublication[];
  awards?: FacultyAward[];
}

export const FES_DEPARTMENT_OFFICE = {
  officeName: 'Department of Forestry and Environmental Science',
  school: 'School of Agriculture & Mineral Sciences',
  address: 'Academic Building E, Ground Floor (Room 117), SUST, Sylhet-3114, Bangladesh',
  phone: '+88-0821-713491 (Ext. 273)',
  email: 'fes@sust.edu',
  directoryUrl: 'https://alpha.sust.edu/dept/fes/faculty',
};

export const SUST_FES_FACULTY: OfficialFaculty[] = [
  {
    "id": "fac-1",
    "name": "Dr. Narayan Saha",
    "designation": "Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-1.webp",
    "email": "nsaha12010-fes@sust.edu",
    "phone": "+8801716072440",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/nsaha12010-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/nsaha12010-fes@sust.edu/cv",
    "researchAreas": [
      "Sustainable Forest Management",
      "Sustainable Ecotourism Development",
      "Ethnic Community",
      "Sustainable Utilization of Non-Timber Forest Products",
      "Participatory Forestry",
      "Climate Change Mitigation",
      "Fuelwood and Timber Markets"
    ],
    "bio": "Dr Narayan Saha serves as Professor in the Department of Forestry & Environmental Science at Shahjalal University of Science and Technology, Sylhet. They are actively engaged in teaching, research and supervision of undergraduate and graduate students in the department.",
    "education": [
      {
        "degree": "Ph.D",
        "institute": "in Forest Economics and Policies, Ehime University, Japan",
        "duration": "1998"
      },
      {
        "degree": "M.Sc.",
        "institute": "in Forest Management, Kochi University, Japan",
        "duration": "1995"
      },
      {
        "degree": "B.Sc. (Hons)",
        "institute": "in Forestry, University of Chittagong, Bangladesh",
        "duration": "1986"
      }
    ],
    "teaching": [
      "Forest and Environmental Economics (Under Graduate Level Course)",
      "Forest Development Planning (Under Graduate Level Course)",
      "Land Use Planning and Management (Under Graduate Level Course)",
      "Natural Resource Economics (Graduate Level Course)"
    ],
    "publicationsCount": 53,
    "selectedPublications": [
      {
        "title": "Farhana Bintay Hye , Narayan Saha, Montasir Shamim and Orchisman Dutta (2025) Assessing Suitable Tree Species for Biochar Production and Their Performance in Enriching Soil Quality and Plant Growth of Oryza sativa L. and Acacia auriculiformis A. Cunn. Ex Benth. Asian Journal of Research in Agriculture and Forestry Volume 11, Issue 2, Page 32-52, 2025; Article no.AJRAF.132898 ISSN: 2581-7418.",
        "year": 2025,
        "url": "https://doi.org/10.9734/ajraf/2025/v11i2384"
      },
      {
        "title": "Saha, Krithika, Safayet Ahamed, Mohammed Abu Sayed Arfin Khan, and Narayan Saha. 2024. “Multiple Drivers Influencing Residents’ Perception of Ecotourism in a Biodiversity Rich Forest Protected Area of Bangladesh”. Asian Journal of Environment & Ecology 23 (11):84-95.",
        "year": 2024,
        "url": "https://doi.org/10.9734/ajee/2024/v23i11624"
      },
      {
        "title": "Saha, K., Ahamed, S., Khan, M. A. S. A., & Saha, N. (2024). Multiple Drivers Influencing Residents’ Perception of Ecotourism in a Biodiversity Rich Forest Protected Area of Bangladesh.",
        "year": 2024,
        "url": "https://doi.org/10.21203/rs.3.rs-3859760/v1"
      },
      {
        "title": "Islam, R., Ahmed, R., Dey, B., Haque, Md. S., Aktar, S., Bhuiyan, M. S., Arif, M. S., Habib Ador, Md. A., Ul Haque, M. M., & Saha, N. (2023). Salinity hazard drives the alteration of occupation, land use and ecosystem service in the coastal areas: Evidence from the south-western coastal region of Bangladesh. Heliyon, 9(8), e18512.",
        "year": 2023,
        "url": "https://doi.org/10.1016/j.heliyon.2023.e18512"
      },
      {
        "title": "Saha, N., & Mukul, S. A. (2021). Visitor’s Willingness to Pay for Cultural Ecosystem Services in Bangladesh: An Assessment for Lawachara National Park, a Biodiversity Hotspot. Small-Scale Forestry, 21(2), 185–201.",
        "year": 2022,
        "url": "https://doi.org/10.1007/s11842-021-09494-5"
      },
      {
        "title": "Saha, N., & Mukul, S. A. (2021). Visitor’s willingness to pay for cultural ecosystem services in Bangladesh: an assessment for Lawachara National Park, a biodiversity hotspot.",
        "year": 2021,
        "url": "https://doi.org/10.21203/rs.3.rs-269549/v1"
      }
    ],
    "awards": [
      {
        "title": "Post-doctoral Fellowship of Japanese Student Service Organization (JSSO), Japan (October 15, 2005 to January 12, 2006).",
        "year": 2006
      },
      {
        "title": "Scholarship of Japanese Ministry of Education, Science, Sports and Culture (Monboshu), Japan (January, 1993 to March 1998).",
        "year": 1998
      },
      {
        "title": "Secondary and Higher Secondary Education Board Stipend, Comilla (1982-1985).",
        "year": 1985
      },
      {
        "title": "Received Silver Medal in 1995 from Kochi University, Japan for M.Sc degree awarded in Forest Management",
        "year": 1995
      },
      {
        "title": "Received Gold Medal in 1998 from Ehime University, Japan for Ph.D. degree awarded in Forest Economics and Policies",
        "year": 1998
      }
    ]
  },
  {
    "id": "fac-2",
    "name": "Dr. A. Z. M. Manzoor Rashid",
    "designation": "Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-2.webp",
    "email": "rashid-fes@sust.edu",
    "phone": "+8801711302555",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/rashid-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/rashid-fes@sust.edu/cv",
    "researchAreas": [
      "Sustainable Natural Resource Management",
      "Legal",
      "institutional and policy issues of forestry and environment",
      "Non-wood forest resources for community development",
      "Sustainability of protected areas",
      "Community based adaptation to climate change",
      "Participatory",
      "indigenous and sustainable forestry practices"
    ],
    "bio": "Born and brought up in the milieu of a forestry research institute, I have been widely inspired and motivated by nature and experienced its vibrant role and influence in environmental conservation and development from my early childhood. Having education and training in various aspects of forestry and environment science, I started my professional journey as a development practitioner dealing community and their active engagement in natural resource management (NRM). This particular journey widely influenced and shaped my career and research background. As an academic, I am now actively engaged in teaching, research and policy related activities which have provided me with an enhanced capacity and leadership on broader aspects of natural resources management (NRM). Furthermore my multidisciplinary education, research and professional engagement has enriched my practical knowledge and experiences through diversified learning approaches. I am confident to take on any academic, administrative and research position dealing with broader aspects of forestry and environment locally, regionally and internationally.",
    "education": [
      {
        "degree": "Ph.D. in Environmental Law (Governance) University of Western Sydney",
        "institute": "Sydney, Australia"
      },
      {
        "degree": "M.Sc. in Environmental Science (Biodiversity Management) Swedish University of Agricultural Sciences",
        "institute": "Uppsala, Sweden"
      },
      {
        "degree": "Post Graduate Diploma in Environment & Development Imperial College",
        "institute": "University of London, United Kingdom"
      },
      {
        "degree": "M.Sc. in Forestry Institute of Forestry & Environmental Science University of Chittagong",
        "institute": "Bangladesh"
      },
      {
        "degree": "B.Sc. (Honors) in Forestry Institute of Forestry & Environmental Sciences University of Chittagong",
        "institute": "Bangladesh"
      }
    ],
    "teaching": [
      "Community based natural resources management (CBNRM)",
      "Protected area and wildlife management",
      "Non-wood forest products",
      "Introduction to forestry and environmental science",
      "Environmental Impact assessment",
      "Social forestry and forestry extension",
      "Forest and environmental policy, law & administration",
      "Biodiversity conservation",
      "Principles and practices of silviculture",
      "Environmental Governance and Diplomacy"
    ],
    "publicationsCount": 31,
    "selectedPublications": [
      {
        "title": "Siddique, M. R. H., Hossain, M., & Rashid, A. Z. M. M. (2023). The dilemma of prioritizing conservation over livelihoods: Assessing the impact of fishing restriction to the fishermen of the Sundarbans. Trees, Forests and People, 11, 100366.",
        "year": 2023,
        "url": "https://doi.org/10.1016/j.tfp.2022.100366"
      },
      {
        "title": "Khan, N. A., Choudhury, J. K., Rashid, A. Z. M. M., Siddique, M. R. H., & Sinha, K. (2022). Co-Management Practices by Non-Government Organizations (NGOs) in Selected Coastal Forest Zones of Bangladesh: A Focus on Sustainability. Sustainability, 14(22), 14885.",
        "year": 2022,
        "url": "https://doi.org/10.3390/su142214885"
      },
      {
        "title": "Subroto, S., Davidsen, C., Rashid, A. Z. M. M., & Cuadra, M. (2021). Dual Governance and the Shadow of State Authority: Co-Management Realities in Rema-Kalenga Protected Area of Bangladesh. Journal of Sustainable Forestry, 41(3-5), 319–346.",
        "year": 2021,
        "url": "https://doi.org/10.1080/10549811.2021.1941121"
      },
      {
        "title": "Sultana, R., Aktar, S., Al Mamun, Md. A., Ashaduzzaman, Md., Chowdhury, Md. Q., & Rashid, A. Z. M. M. (2021). Durability of three tropical timber species growing in Bangladesh to white-rot fungi. Journal of the Indian Academy of Wood Science, 18(1), 66–74.",
        "year": 2021,
        "url": "https://doi.org/10.1007/s13196-021-00281-5"
      },
      {
        "title": "Henry M.; ……………….A. Z. M. Manzoor Rashid et al., 2021. A multi-purpose national forest inventory in Bangladesh: design, operationalisation and key results, Forest Ecosystems, 8:12. https://doi.org/10.1186/s40663-021-00284-1",
        "year": 2021
      },
      {
        "title": "A. Z. M. Manzoor Rashid. (2020). Biomass and Carbon Estimation of the Four Major Tree Species in Ratargul Swamp Forest, Bangladesh. SUST Journal of Science and Technology (SUST JST), 30(1).",
        "year": 2020,
        "url": "https://doi.org/10.63512/sustjst.2020.48"
      }
    ],
    "awards": [
      {
        "title": "UWS IPRS Scholarship for PhD study at the University of Western Sydney, Australia."
      },
      {
        "title": "UWS International Award for PhD study at the University of Western Sydney, Australia."
      },
      {
        "title": "SIDA Scholarship for M.Sc. study at the Swedish University of Agricultural Sciences Uppsala, Sweden."
      },
      {
        "title": "Commonwealth Environment Scholarship for Post Graduate Diploma study at the Imperial College, London University."
      },
      {
        "title": "Rufford Small Grant for Nature Conservation, UK. (1st grant, amount £5, 800)."
      },
      {
        "title": "Rufford Small Grant for Nature Conservation, UK (2nd grant, amount £ 6, 000)."
      },
      {
        "title": "UNDP, SEMP Grant for studying folk medicinal plants of Bangladesh (amount $ 9, 500)."
      }
    ]
  },
  {
    "id": "fac-3",
    "name": "Dr. Md. Qumruzzaman Chowdhury",
    "designation": "Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-3.webp",
    "email": "qumrul-for@sust.edu",
    "phone": "+8801734161326",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/qumrul-for@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/qumrul-for@sust.edu/cv",
    "researchAreas": [
      "Dendrochronology & Tree Biology",
      "Wood Anatomy & Quality",
      "Mangrove Ecophysiology",
      "Climate & Salinity Stress",
      "Tropical Forest Management"
    ],
    "researchSummary": "My current research focuses on how growth conditions (e.g., climate, drought and salinity) and management regimes affect tree (cambial) growth, wood structure and (eco-physiological) functions in tropical species including mangroves. This approach helps to understand tree biology but also important for wood quality assessment (providing information on wood properties), forest management (e.g., fixing rotation, thinning intensity, biomass estimation, and selecting site-specific and climate resilient tree species), and tree breeding programs (e.g., identifying growth and wood traits for plus tree selection).",
    "bio": "Dr Md Qumruzzaman Chowdhury serves as Professor in the Department of Forestry & Environmental Science at Shahjalal University of Science and Technology, Sylhet. They are actively engaged in teaching, research and supervision of undergraduate and graduate students in the department.",
    "education": [
      {
        "degree": "Postdoc in Wood Biology",
        "institute": "Royal Museum for Central Africa, Tervuren, Belgium"
      },
      {
        "degree": "PhD in Forest and Wood Science",
        "institute": "Tokyo University of Agriculture and Technology, Japan"
      },
      {
        "degree": "MSc in Forest and Nature Conservation",
        "institute": "Wageningen University, The Netherlands"
      },
      {
        "degree": "BSc (Honours) in Forestry",
        "institute": "Khulna University, Bangladesh"
      }
    ],
    "publicationsCount": 40,
    "selectedPublications": [
      {
        "title": "Chowdhury, M.Q., Sarker, S.K., Ali, M.A., Imran, M. I. H., Bhuiyan, K.H., Sultana, R., Saimun, M.S.R., Datta, A. 2026. Water use in mangroves: Understanding how wood day capacitance varies under salinity in the Sundarbans. Environmental and Experimental Botany",
        "year": 2026,
        "url": "https://doi.org/10.1016/j.envexpbot.2025.106303"
      },
      {
        "title": "Gupta, A.D., Chowdhury, M.Q., Imran, M.I.H., Hossain, S., Bhuiyan, K.H., Mehedi, M.M.H., Datta., A. 2025. Tree growth sensitivity to climate varies in moist and dry tropical forests in Bangladesh. Global Ecology and Conservation",
        "year": 2025,
        "url": "https://doi.org/10.1016/j.gecco.2025.e03903"
      },
      {
        "title": "Chowdhury, M.Q., Sarker, S.K., Ali, M.A., Imran, M. I. H., Datta, A., Leban, J-M. 2025. Accounting intra-tree radial wood density variation estimates more accurate above ground mangrove biomass in the Sundarbans. European Journal of Forest Research.",
        "year": 2025,
        "url": "https://doi.org/10.1007/s10342-025-01784-3"
      },
      {
        "title": "Chowdhury, M.Q., Sarker, S.K., Imran, M. I. H., Datta, A., Akhter, S.K., Ahmed, Z., Beeckman, H. 2025. Divergence of vessel diameter explains interspecific variation in hydraulic safety to salinity in the Sundarbans mangrove ecosystem. Functional Ecology",
        "year": 2025,
        "url": "https://doi.org/10.1111/1365-2435.14751"
      },
      {
        "title": "Chowdhury MQ, Sarker SK, Hossain S, Imran MIH, Datta A (2024) Salinity regulates radial growth of Cynometra ramiflora L. in the Sundarbans mangrove ecosystem. Dendrochronologia. 88, 126270.",
        "year": 2024,
        "url": "https://doi.org/10.1016/j.dendro.2024.126270"
      },
      {
        "title": "Chowdhury MQ, Sarker SK, Marma M, Rahman M S, Datta A (2024) Climate and salinity together control above ground carbon accumulation in the Sundarbans mangrove ecosystem. Ocean & Coastal Management 255, 107242",
        "year": 2024,
        "url": "https://doi.org/10.1016/j.ocecoaman.2024.107242"
      }
    ],
    "awards": [
      {
        "title": "Khulna University Merit Scholarship (1996-2000)",
        "year": 2000
      },
      {
        "title": "Netherlands Government Fellowship (NFP-AP) (2004-2006)",
        "year": 2006
      },
      {
        "title": "EU Synthesys grant 2006",
        "year": 2006
      },
      {
        "title": "Japanese Government (Monku-ghakgushu) Scholarship (2006-2009)",
        "year": 2009
      },
      {
        "title": "Postdoctoral fellowship from Belgian Federal Science Policy Office co-funded by the Marie Curie Actions from the European Commission (2013-2015)",
        "year": 2015
      }
    ]
  },
  {
    "id": "fac-4",
    "name": "Dr. Mohammad Belal Uddin",
    "designation": "Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-4.webp",
    "email": "belal-for@sust.edu",
    "phone": "+8801727767431",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/belal-for@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/belal-for@sust.edu/cv",
    "researchAreas": [
      "Landscape Patterns of Biodiversity and it's Conservation",
      "Dynamics of Ecosystems and it's Functioning",
      "Ecological Economics of Forest Management Institutions",
      "Ecosystem Services and Climate Change",
      "Landscape Patterns of Biodiversity and Ecosystem Functioning",
      "Dynamics of Ecosystems and Biodiversity Conservation",
      "Ecological Economics of Forest Management Institutions and Ecosystem Services",
      "Climate Change"
    ],
    "bio": "I'm pursuing an academic and research career in the field of Natural Sciences: Forest Ecology and Natural Resource Management (Biodiversity Conservation and Management) in the face of global climate change! I completed my Bachelor and Masters Degree in Forestry from Institute of Forestry and Environmental Sciences, University of Chittagong, Bangladesh. I finished my doctorate degree “Doctor of Natural Sciences (Dr. rer. nat.)” from Department of Biogeography, University of Bayreuth, Germany. My specialization focuses on landscape ecology, biodiversity conservation, biological invasions. ecological economics, and climate change. I am devoted to understanding and analyzing the most important and consequential concerns of Natural Sciences to meet the SDGs: Biodiversity Conservation and Landscape Ecology of the 21st century at different tropical and sub-tropical forest ecosystems in Bangladesh. During the last few years, I have developed an increasingly intensive publication activity and was very engaged to work out conceptual approach based on recent scientific progress and integrating novel approaches in natural sciences.",
    "education": [
      {
        "degree": "Doctor of Natural Sciences (Dr. rer. nat.) specialized on Landscape Ecology",
        "institute": "Department of Biogeography, University of Bayreuth, 95440 Bayreuth, Germany",
        "duration": "2011"
      },
      {
        "degree": "M. Sc. in Forestry (First Class with Second Position)",
        "institute": "Institute of Forestry Environmental Sciences, University of Chittagong, Chittagong-4331, Bangladesh",
        "duration": "2003"
      },
      {
        "degree": "B.Sc. (Honors) in Forestry (First Class with Third Position)",
        "institute": "Institute of Forestry Environmental Sciences, University of Chittagong, Chittagong-4331, Bangladesh",
        "duration": "2002"
      },
      {
        "degree": "B2 in German Language Completed",
        "institute": "Germany"
      }
    ],
    "teaching": [
      "Forest Ecology",
      "Biodiversity Conservation",
      "Research Methodology",
      "Part-Time Instructor",
      "German Language",
      "Institute of Modern Languages (IML)",
      "SUST"
    ],
    "links": [
      {
        "label": "Google Scholar",
        "url": "https://scholar.google.com/citations?user=93GYUrwAAAAJ&hl=en&oi=ao"
      },
      {
        "label": "ResearchGate",
        "url": "https://www.researchgate.net/profile/Mohammad-Uddin-34?ev=hdr_xprf"
      }
    ],
    "publicationsCount": 76,
    "selectedPublications": [
      {
        "title": "Dey, Biplob; Ador, Md. Ahosan Habib; Haque, Mohammed; Ferdous, Jannatul; Halim, Md Abdul; Uddin, Mohammad Belal & Ahmed, Romel. (2024). Strategic insights for sustainable growth of mushroom farming industry in Bangladesh: A comprehensive evaluation using SWOT- AHP and TOPSIS frameworks. Heliyon, 10(17). DOI: 10.1016/j.heliyon.2024.e36956",
        "year": 2024,
        "url": "https://doi.org/10.1016/j.heliyon.2024.e36956"
      },
      {
        "title": "Mohammad Belal Uddin, 2024. Assessing the Socio-Ecological Effectiveness of Forest Management Institutions in Bangladesh- A Case Study from a North Eastern Forest Ecosystem. Abstract Volume, XXVI IUFRO World Congress 2024 will be held on 23-29 June, 2015 in Stockholm, Sweden. (Abstract Volume: Presenting author: ID: 60205, Session: T3.28 Opportunities to promote biodiversity recovery and protection through innovative forest management approaches, Presentation type: Oral)",
        "year": 2024
      },
      {
        "title": "Miah, Md. R., Hasan, M. M., Parisha, J. T., Huda, M. B., Sher-E-Alam, M., Kiew Sayok, A., Rahman, M. S., Sharif, Md. A., Uddin, M. B., Chowdhury, S. H., & Bhuiyan, M. A. (2023). MISUSE OF ADVANCED SATELLITE TECHNOLOGY TO ACCELERATE MAN-MADE FLASH FLOODS. International Journal of Research -GRANTHAALAYAH, 11(3).",
        "year": 2023,
        "url": "https://doi.org/10.29121/granthaalayah.v11.i3.2023.5058"
      },
      {
        "title": "Md Rahimullah Miah, Md Mehedi Hasan, Jorin Tasnim Parisha, Alexander Kiew Sayok, Ahi Sarok, Mohammad Belal Uddin, Md Sher-E-Alam ,Md Shoaibur Rahman, Md Main Uddin Miah, Md. Amir Sharif, Md Aktar Hossain. Biodiversity Information Systems in Geospatial Applications for Protected Area Management. American Journal of Geographic Information System 2023, 12(1): 1-27",
        "year": 2023
      },
      {
        "title": "Sajal Saha, Mohammad Belal Uddin, Hasan Ahmed. Detection of Forest Cover Change and Spatial Prediction of Growing Stock in Satchari National Park, Bangladesh. Young Researchers Meeting on Conservation and Sustainable Use of Forest Systems held in January 26-27, 2022 at Palencia, Spain.",
        "year": 2023,
        "url": "https://www.researchgate.net/publication/368397007_Detection_of_Forest_Cover_Change_and_Spatial_Prediction_of_Growing_Stock_in_Satchari_National_Park_Bangladesh"
      },
      {
        "title": "Md Rahimullah Miah, Md Mehedi Hasan, Jorin Tasnim Parisha, Md Sher-E-Alam, Alexander Kiew Sayok, Md Shoaibur Rahman, Md. Amir Sharif, Mohammad Belal Uddin, Shahriar Hussain Chowdhury. Impact of Processed Wireless Sensor Networks on Biodiversity Conservation. International Journal of Biological Engineering 2022, 7(1):1-13",
        "year": 2022,
        "url": "https://www.researchgate.net/publication/366715000_Impact_of_Processed_Wireless_Sensor_Networks_on_Biodiversity_Conservation#fullTextFileContent"
      }
    ],
    "awards": [
      {
        "title": "German Academic Exchange Service (DAAD) Ph.D. Fellowship"
      },
      {
        "title": "Returning Expert Fellowship from Center for International Migration and Development (CIM), Germany"
      },
      {
        "title": "Foreign Scholar Travel Award (FSTA) from US-IALE"
      },
      {
        "title": "East-West Center Nishorgo Support Project Applied Research Fellowship"
      },
      {
        "title": "British Ecological Society Training and Travel Grant"
      },
      {
        "title": "South Asian Network for Development and Environmental Economics (SANDEE) Research Grant"
      },
      {
        "title": "SANDEE Study and Travel Grant"
      },
      {
        "title": "IDEA WILD Equipment Supplies Grant from USA"
      },
      {
        "title": "International Foundation for Science (IFS) Research Grant from Sweden"
      },
      {
        "title": "IFS Travel Grant"
      },
      {
        "title": "The Swedish International Development Cooperation Agency (Sida) Travel Scholarship"
      },
      {
        "title": "Rufford Small Grants for Nature Conservation (First and Second Grant) from UK"
      },
      {
        "title": "Parkyn Legacy Award from British Ecological Society (BES)"
      },
      {
        "title": "Young Scientist Award from International Association of Landscape Ecology (IALE)"
      },
      {
        "title": "University Merit Scholarship, Chittagong University, Bangladesh"
      },
      {
        "title": "Swiss Travel Grant (Switzerland)"
      },
      {
        "title": "Visiting Researcher (Research Group: Biodiversity Conservation) at Graduate School of Science, Kyoto University, Kyoto, Japan"
      },
      {
        "title": "Visiting Postdoctoral Research Fellow (June-August, 2018), Department of Disturbance Ecology, University of Bayreuth, 95440 Bayreuth, Germany",
        "year": 2018
      },
      {
        "title": "IUFRO Congress Grant 2024",
        "year": 2024
      }
    ]
  },
  {
    "id": "fac-5",
    "name": "Dr. Romel Ahmed",
    "designation": "Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-5.webp",
    "email": "romel-fes@sust.edu",
    "phone": "+8801874934514",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/romel-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/romel-fes@sust.edu/cv",
    "researchAreas": [
      "Genetics and plant Breeding",
      "Biofertilizer and Soil properties",
      "Plant diseases"
    ],
    "bio": "Dr. Romel Ahmed serves as Professor in the Department of Forestry & Environmental Science at Shahjalal University of Science and Technology, Sylhet. They are actively engaged in teaching, research and supervision of undergraduate and graduate students in the department.",
    "education": [
      {
        "degree": "PhD in the field of biochemistry and biotechnology Completed in September 2015",
        "institute": "nutrient sensing lab (headed by Professor Steffen Abel) at the Leibniz Institute of Plant Biocemistry (IPB), Martin Luther University, Halle, Germany. Title of PhD thesis: Molecular Identification and Characterization of the phosphate deficiency response",
        "duration": "2015"
      },
      {
        "degree": "Research Fellow at the Maxplanck Institute for Plant breeding research",
        "institute": "Cologne, Germany. Working title: Finding novel genes involved in repair of DNA cross-links using Arabidopsis thaliana natural variation"
      },
      {
        "degree": "Masters in Horticulture graduated in 2010 securing First Position with highest possible grade 1",
        "institute": "",
        "duration": "2010"
      },
      {
        "degree": "M. Sc. in Forestry (First Class with first position) Institute of Forestry & Environmental Sciences",
        "institute": "University of Chittagong, Bangladesh. Title of Master Thesis: Allelopathic efect of Eucalyptus camaldulensis and Tectona grandis on some forest and agricultural crops submitted to Institute of Forestry and Environmental Sciences, Chittagong University, Ba",
        "duration": "2003"
      },
      {
        "degree": "B.Sc. (Honors) in Forestry (First Class with first position ) Institute of Forestry & Environmental Sciences",
        "institute": "University of Chittagong, Bangladesh"
      }
    ],
    "teaching": [
      "Genetics and Plant breeding, Plant physiology"
    ],
    "publicationsCount": 51,
    "selectedPublications": [
      {
        "title": "Haque, M. M. U., Rahman, M. A., Ador, M. A. H., & Ahmed, R. (2023). First Report of Rhizopus stolonifer Causing Premature Soft Rot of Jackfruit in Bangladesh. Plant Disease, 107(9), 2843.",
        "year": 2023,
        "url": "https://doi.org/10.1094/PDIS-01-23-0056-PDN"
      },
      {
        "title": "Dey, B., Ahmed, R., Ferdous, J., Haque, M. M. U., Khatun, R., Hasan, F. E., & Uddin, S. N. (2023). Automated plant species identification from the stomata images using deep neural network: A study of selected mangrove and freshwater swamp forest tree species of Bangladesh. Ecological Informatics, 75, 102128.",
        "year": 2023,
        "url": "https://doi.org/10.1016/j.ecoinf.2023.102128"
      },
      {
        "title": "Das, A. C., Shahriar, S. A., Chowdhury, M. A., Hossain, M. L., Mahmud, S., Tusar, M. K., Ahmed, R., & Salam, M. A. (2023). Assessment of remote sensing-based indices for drought monitoring in the north-western region of Bangladesh. Heliyon, 9(2), e13016.",
        "year": 2023,
        "url": "https://doi.org/10.1016/j.heliyon.2023.e13016"
      },
      {
        "title": "Haque, M. M. U., Rahman, M. A., Ador, M. A. H., & Ahmed, R. (2023). First Report of Rhizopus stolonifer Causing Premature Soft Rot of Jackfruit in Bangladesh. Plant Disease, 107(9), 2843.",
        "year": 2023,
        "url": "https://doi.org/10.1094/PDIS-01-23-0056-PDN"
      },
      {
        "title": "Ador, Md. A. H., Ahmed, R., Khatun, R., Rahman, Md. A., & Haque, M. M. U. (2023). Identification, diversity and host specificity of the wood‐decay fungi in major sawmill depots of north‐eastern Bangladesh. Forest Pathology, 53(1). Portico.",
        "year": 2023,
        "url": "https://doi.org/10.1111/efp.12792"
      },
      {
        "title": "Haque, M. M. U., Rahman, M. A., Ador, M. A. H., & Ahmed, R. (2023). First Report of Rhizopus stolonifer Causing Premature Soft Rot of Jackfruit in Bangladesh. Plant Disease, 107(9), 2843.",
        "year": 2023,
        "url": "https://doi.org/10.1094/PDIS-01-23-0056-PDN"
      }
    ],
    "awards": [
      {
        "title": "DAAD Scholarship (German Govt. Scholarship) for PhD"
      },
      {
        "title": "Erasmus Mundus Scholarship 2008 (Scholarship awarded by European Commission) for International master in Horticulture",
        "year": 2008
      },
      {
        "title": "DAAD partial scholarship for doing research at the plant physiology laboratory of Prof. G. Scherer at the University of Hannover, Germany."
      },
      {
        "title": "Gold Medal for outstanding result in both undergraduate and Masters awarded by Chittagong University, Bangladesh (2005)",
        "year": 2005
      },
      {
        "title": "University Grants Commission (UGC) Scholarship for placing first position in undergraduate study in Science faculty of Chittagong University (2002).",
        "year": 2002
      },
      {
        "title": "Research grant of Village and Farm Forestry Project – Inter Co-operation (VFFP- IC), Swiss Development Corporation (SDC), Bangladesh for Conducting M. Sc Thesis. (2003)",
        "year": 2003
      }
    ]
  },
  {
    "id": "fac-6",
    "name": "Dr. Mohammad Redowan",
    "designation": "Professor",
    "isHead": true,
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-6.webp",
    "email": "redowan-for@sust.edu",
    "phone": "+8801818465634",
    "office": "Head's Office, Academic Building E (Ground Floor), SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/redowan-for@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/redowan-for@sust.edu/cv",
    "researchAreas": [
      "Remote Sensing & GIS",
      "Satellite Image Processing",
      "REDD+ & Forest Carbon",
      "Species Distribution Modeling",
      "LULC Change Analysis",
      "Spatial Forest Planning"
    ],
    "researchSummary": "Broadly: applying remote sensing (RS) and GIS technologies to address various forestry and environmental issues; In particular: satellite image processing using RSGIS software including ArcGIS, Erdas Imagine, eCognition, Bilko, Global Mapper, MapInfo, DIVA-GIS, Geomatica, ENVI, LCM and TerrSet-IDRISI; spatial analysis; REDD+ activity data (AD) preparation and emission factor (EF) estimation; REDD+ project design; species distribution modelling; distributed environmental modelling; forest and landuse change analysis, deforestation and forest degradation analysis; forest sampling and inventory planning; forest spatial planning; forest biomass and carbon estimation; biophysical remote sensing;",
    "bio": "Dr. Mohammad Redowan is a faculty member in the Department of Forestry and Environmental Science (FES) at Shahjalal University of Science and Technology (SUST), Sylhet, Bangladesh. With 20+ years of teaching and research experience in forestry, he specializes in geoinformation science and earth observation, with a focus on spatial analysis and distributed modelling. He holds a PhD from The University of Queensland, Australia, and has a good publication record on the application of remote sensing and GIS technologies to forestry and environmental issues. His work advances the understanding of climate-resilient ecosystems and supports information-based forest management and conservation. He is also dedicated to mentoring students and fostering interdisciplinary collaborations for sustainable forestry and environmental solutions.",
    "education": [
      {
        "degree": "Post-Doc (Geospatial Analysis",
        "institute": "2020-2023), Central Queensland University, Australia (https://staff-profiles.cqu.edu.au/home/view/25183), and Deakin University, Australia (https://www.deakin.edu.au/)",
        "duration": "2020–2023"
      },
      {
        "degree": "PhD in Remote Sensing and Geospatial Analysis",
        "institute": "School of Earth and Environmental Science, The University of Queensland, Australia (https://sees.uq.edu.au/profile/4602/mohammad-redowan)",
        "duration": "2013–2018"
      },
      {
        "degree": "MSc in Geoinformation Science and Earth Observation for Environmental Modelling and Management (GEM)",
        "institute": "University of Southampton, England; Lund University, Sweden; University of Warsaw, Poland; and ITC, University of Twente, The Netherlands",
        "duration": "2008–2010"
      },
      {
        "degree": "MSc in Forestry",
        "institute": "Institute of Forestry and Environmental Sciences (IFES), University of Chittagong, Bangladesh",
        "duration": "2005"
      },
      {
        "degree": "BSc (Hons) in Forestry",
        "institute": "Institute of Forestry and Environmental Sciences (IFES), University of Chittagong, Bangladesh",
        "duration": "2004"
      },
      {
        "degree": "Dip/Cert. in Computer Application",
        "institute": "Networking and Hardware , TTC, Chittagong, Bangladesh",
        "duration": "2004"
      },
      {
        "degree": "Dip/Cert. in Arabic Language",
        "institute": "Sibawayh Institute, Dhaka, Bangladesh",
        "duration": "2023"
      },
      {
        "degree": "Dip/Cert. in German Language",
        "institute": "University of Chittagong, Bangladesh",
        "duration": "2004"
      }
    ],
    "teaching": [
      "Remote Sensing and Geographic Information System (RSGIS)",
      "Remote Sensing and GIS in Natural Resource Management (RSGIS in NRM)",
      "Advanced Research Methodology",
      "Geology and Soil Science"
    ],
    "links": [
      {
        "label": "Mohammad Redowan",
        "url": "https://www.facebook.com/redowansust"
      }
    ],
    "publicationsCount": 26,
    "selectedPublications": [
      {
        "title": "Climate-induced shifts in the spatial distribution of the invasive weed Sungrass (Imperata cylindrica) in the Asia-Pacific. Geomatica, 77(2): 100068. ScienceDirect Elsevier.",
        "year": 2025,
        "url": "https://www.sciencedirect.com/science/article/pii/S1195103625000242"
      },
      {
        "title": "Abir, K. A. M., Dey, B., Redowan, M., Ahmed, R. 2025. Predicting suitable habitats for Asian elephant (Elephas maximus) in Tropical Asia under climatic scenarios. Geography and Sustainability. ScienceDirect Elsevier",
        "year": 2025,
        "url": "https://www.sciencedirect.com/science/article/pii/S2666683925000185"
      },
      {
        "title": "Parvej, M., Masum, K. M., Fahim, Md. S. I., & Redowan, M. (2023). Three Decades of River Bank Erosion and Accretion Appraisal Along Bank Line Shifting Trend in A Transboundary River, Teesta Floodplain of BangladeshThree Decades of River Bank Erosion and Accretion Appraisal along Bank Line Shifting Trend in a Transbounda. Geoplanning: Journal of Geomatics and Planning, 11(1), 1–16.",
        "year": 2024,
        "url": "https://ejournal.undip.ac.id/index.php/geoplanning/article/view/53956"
      },
      {
        "title": "Dey, B., Abir, K. A. M., Ahmed, R., Salam, M. A., Redowan, M., Miah, Md. D., & Iqbal, M. A. (2023). Monitoring groundwater potential dynamics of north-eastern Bengal Basin in Bangladesh using AHP-Machine learning approaches. Ecological Indicators, 154, 110886.",
        "year": 2023,
        "url": "https://www.sciencedirect.com/science/article/pii/S1470160X23010282#ab005"
      },
      {
        "title": "Redowan, M., Phinn, S., Roelfsema, C., & Aziz, A. A. (2022). Modeling forest cover dynamics in Bangladesh using multilayer perceptron neural network with Markov chain. Journal of Applied Remote Sensing, 16(03).",
        "year": 2022,
        "url": "https://doi.org/10.1117/1.JRS.16.034502"
      },
      {
        "title": "Mahmud, S., Redowan, M., Ahmed, R., Khan, A. A., & Rahman, Md. M. (2022). Phenology-based classification of Sentinel-2 data to detect coastal mangroves. Geocarto International, 37(26), 14335–14354.",
        "year": 2022,
        "url": "https://www.tandfonline.com/doi/abs/10.1080/10106049.2022.2087754"
      }
    ],
    "awards": [
      {
        "title": "Dr. A. B Temu Award 2002 (Money and Certificate), University of Chittagong, for securing highest marks in 'Aerial Photogrammetry and Remote Sensing'",
        "year": 2002
      },
      {
        "title": "Travel and living allowance award 2007 from VC, SUST, to attend the month-long ‘Advanced Certificate Course in Geographic Information System (GIS) held at Jahangirnagar University, Bangladesh",
        "year": 2007
      },
      {
        "title": "Chittagong University Merit Scholarship (Science Faculty) in 2004",
        "year": 2004
      },
      {
        "title": "Habiganj Zilla Parishad (District Council) Government Merit Scholarship in 1997 and 1999",
        "year": 1999
      },
      {
        "title": "European Commission's/Union's Erasmus Mundus Scholarship in 2008",
        "year": 2008
      },
      {
        "title": "The Dutch government ‘Netherlands Fellowship Program (NFP)’ in 2008 under Nuffic- the Dutch organization for internationalization of education",
        "year": 2008
      },
      {
        "title": "The Australian Government 'International Post-graduate Research Scholarship- IPRS' in 2014",
        "year": 2014
      },
      {
        "title": "The University of Queensland (UQ) Centennial Scholarship (UQCent) in 2014",
        "year": 2014
      },
      {
        "title": "Team Leader/Sub-Project Manager (SPM) of a two-year duration (July 2025-July 2027) project entitled 'Development of Remote Sensing, GIS, and Climate Change Study Lab' at the Department of Forestry and Environmental Science, Shahjalal University of Science",
        "year": 2027
      }
    ]
  },
  {
    "id": "fac-7",
    "name": "Dr. Mizanur Rahman",
    "designation": "Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-7.webp",
    "email": "mizan-for@sust.edu",
    "phone": "+8801711153231",
    "office": "Room 120 (Dean's Office), Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/mizan-for@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/mizan-for@sust.edu/cv",
    "researchAreas": [
      "Global Change Ecology",
      "Dendroclimatology",
      "Tree Physiology",
      "Forest Ecology and Management",
      "Stable isotopes in plant ecology",
      "Wood anatomy",
      "Functional Traits"
    ],
    "bio": "Mizanur Rahman is a tropical plant ecologist, broadly interested in understanding plant response and adaptation to global environmental changes. He performed postdoc research at Pacific Northwest National Laboratory, USA in collaboration with NASA in the US Department of Energy (DOE) funded project \"Next Generation Ecosystem Experiment, Tropics\" spanned over the Rain forests of Brazilian Amazon, Panama, Malaysia and Australia. He has a PhD in Global Change Ecology from Friedrich-Alexander University, Germany and a MSc in dendroecology from Wageningen University Netherlands. He used to apply a combination of modelling and Experimental (MODEX) approach and use several research tools including but not limited to tree-ring analysis, wood and leaf anatomy, stable isotope analysis, and modelling to investigate the ecological and physiological mechanisms associated with the functioning of tropical forests in a global change context. He is also interested in understanding the role of tropical forests in the global carbon and hydrological cycles.",
    "education": [
      {
        "degree": "Postdoc at Pacific Northwest National Laboratory",
        "institute": "US Department of Energy, Washington, USA"
      },
      {
        "degree": "PhD in Global Change Ecology",
        "institute": "Friedrich-Alexander University Erlangen-Nuremberg, Germany"
      },
      {
        "degree": "MSc in Forest and Nature Conservation (Specialization in Ecology)",
        "institute": "Wageningen University, Netherlands"
      },
      {
        "degree": "MSc in Forestry",
        "institute": "Institute of Forestry and Environmental Science, University of Chattogram"
      },
      {
        "degree": "BSc (Honours) in Forestry",
        "institute": "Shahjalal University of Science and Technology, Sylhet, Bangladesh"
      }
    ],
    "publicationsCount": 43,
    "selectedPublications": [
      {
        "title": "Rahman M, Zambrano A, Rogers A, Serbin SP, Ely KS, Davidson KJ, Domec JC, Lamour J, Michaletz ST, Wolfe BT, Pivovaroff AL, Wright SJ, Chambers JQ, McDowell NG (2026) Regulation of transpiration and whole-tree crown conductance in tropical forests. Plant, Cell & Environment, 2026; 1– 4 (Impact Factor: 6.9)",
        "year": 2026,
        "url": "https://doi.org/10.1111/pce.70719"
      },
      {
        "title": "Shavi MSI, Islam M, Rahman M (2026) TreeScopeAI: A lightweight YOLOv11-based system for high-accuracy and real time tropical wood species identification. Information Processing in Agriculture (Impact factor: 8.9)",
        "year": 2026,
        "url": "https://doi.org/10.1016/j.inpa.2026.06.007"
      },
      {
        "title": "Islam M, Bhattacharjee K, Bräuning A, Gebrekirstos A, Arfin-Khan M. A. S, Sultana F, … Rahman, M. (2026). Integrating dendrochronology and satellite NDVI to assess climate sensitivity and canopy resilience along a disturbance gradient in tropical moist forests. Science of The Total Environment, 1029, 181739.",
        "year": 2026,
        "url": "https://doi.org/10.1016/j.scitotenv.2026.181739"
      },
      {
        "title": "Regier P….Rahman M et al. (2025) Short-term experimental flooding impacts soil biogeochemistry but not aboveground vegetation in a coastal forest. Proc Natl Acad Sci USA (PNAS). 122 (41) e2511756122. (Impact Factor: 9.1)",
        "year": 2025,
        "url": "https://doi.org/10.1073/pnas.2511756122"
      },
      {
        "title": "Islam M, Afia FA, Borsa A Das, Tipu MTK, Chowdhury T, Rahman M (2025) The earlywood, latewood and xylem vessel chronologies of Teak tree (Tectona grandis) provide important insight into xylem hydraulic adjustment to past climate variability. Agric For Meteorol 375:110863. (Impact Factor: 5.7)",
        "year": 2025,
        "url": "https://doi.org/10.1016/j.agrformet.2025.110863"
      },
      {
        "title": "Zuidema PA, Groenendijk P, Rahman M, Trouet V, Babst F et al. (2025) Pantropical tree growth resilience to drought. Science 389,532-538. (Impact Factor: 45.8)",
        "year": 2025,
        "url": "https://doi.org/10.1126/science.adq6607"
      }
    ],
    "awards": [
      {
        "title": "NFP fellowship (Netherland Fellowship Program) for doing MSc in Netherlands. (2011-2013)",
        "year": 2013
      },
      {
        "title": "DAAD (German Academic Exchange Service) scholarship for PhD degree in Germany. (2015-2019)",
        "year": 2019
      }
    ]
  },
  {
    "id": "fac-8",
    "name": "Dr. Swapan Kumar Sarker",
    "designation": "Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-8.webp",
    "email": "swapan-fes@sust.edu",
    "phone": "+8801791069892",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/swapan-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/swapan-fes@sust.edu/cv",
    "researchAreas": [
      "Tropical Ecology",
      "Mangrove Ecology",
      "Forest Management",
      "Ecological Modeling",
      "Conservation Biology",
      "Spatial Ecology",
      "Functional Biogeography",
      "Natural Resource Management"
    ],
    "bio": "Normal\n 0\n \n \n \n \n false\n false\n false\n \n EN-US\n X-NONE\n X-NONE\n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n\n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n\n /* Style Definitions */\n table.MsoNormalTable\n {mso-style-name:\"Table Normal\";\n mso-tstyle-rowband-size:0;\n mso-tstyle-colband-size:0;\n mso-style-noshow:yes;\n mso-style-priority:99;\n mso-style-parent:\"\";\n mso-padding-alt:0in 5.4pt 0in 5.4pt;\n mso-para-margin-top:0in;\n mso-para-margin-right:0in;\n mso-para-margin-bottom:10.0pt;\n mso-para-margin-left:0in;\n line-height:115%;\n mso-pagination:widow-orphan;\n font-size:11.0pt;\n font-family:\"Calibri\",sans-serif;\n mso-ascii-font-family:Calibri;\n mso-ascii-theme-font:minor-latin;\n mso-hansi-font-family:Calibri;\n mso-hansi-theme-font:minor-latin;\n mso-bidi-font-family:\"Times New Roman\";\n mso-bidi-theme-font:minor-bidi;\n mso-font-kerning:1.0pt;\n mso-ligatures:standardcontextual;}\n\nDr.\nSwapan Kumar Sarker is a Professor of Forestry in the Shahjalal University of\nScience & Technology (SUST). He received academic trainings from SUST\n(B.Sc. in Forestry), Monash University, Australia (M.Sc. in Environment &\nSustainability), and University of Glasgow, UK (Ph.D. in Environmental &\nEvolutionary Biology). Swapan Sarker’s research focuses on four domains of\nsustainability at landscape to global scales: Domain 1- collection and\ndevelopment of baseline ecological database and methodological framework to\nreinforce robust ecological studies and science-based management decision\nmaking in data-poor vulnerable ecosystems of the world, especially Mangroves;\nDomain 2- use of multiple ecological approaches (population, community, spatial\nand trait-based ecological approaches) to study mangrove ecosystem health and\naffects from disturbance (climate, land use, human pressures, invasive species,\ntoxins and noise); Domain 3- development of ecological models to predict\nchanges in habitat conditions, species distribution, biodiversity and ecosystem\nproductivity under increasing human pressures and changing climatic and local\nenvironmental conditions; and Domain 4- development of natural resource\nmanagement and conservation plans by integrating ecological, social and\ninstitutional analysis. He collects forest data and builds ecological models to\nsupport informed decision making in Forestry. He has vast experience of\nresearch collaboration with tropical forest scientists’ network, Bangladesh\nForest Department, World Bank, United States Agency for International\nDevelopment (USAID), Department for International Development (DFID, UK),\nNational Aeronautics and Space Administration (NASA), Natural Environment\nResearch Council, UK (NERC), and Australian Centre for International\nAgricultural Research (ACIAR), etc. His current research focuses on building\nbaseline ecological information for Mangrove, Hill and Deciduous forests in\nBangladesh and other tropical countries to reinforce science-based forest\nmanagement and conservation across the world.",
    "education": [
      {
        "degree": "PhD in Environmental & Evolutionary Biology",
        "institute": "University of Glasgow, UK [Topic: Spatial & temporal patterns of mangrove abundance, diversity & functions in the Sundarbans]"
      },
      {
        "degree": "Master of Environment and Sustainability",
        "institute": "Monash University, Melbourne, Australia"
      },
      {
        "degree": "B.Sc. Honors in Forestry",
        "institute": "Shahjalal University of Science and Technology, Bangladesh"
      }
    ],
    "teaching": [
      "BSc. level: Forest Management",
      "Biostatistics",
      "Mangrove Forestry",
      "Forest Ecology",
      "Research Methodology",
      "MSc level: Forest Resource Management, Sustainable Development"
    ],
    "publicationsCount": 40,
    "selectedPublications": [
      {
        "title": "Ahmed, S., Sarker, S.K., Kamruzzaman, M. et al. (2025). Soil nutrients and leaf area index interact with species and structural diversity to buffer mangrove productivity against salinity. Soil Ecology Letter. 7, 250299 (2025). https://doi.org/10.1007/s42832-025-0299-x [Publisher: Springer, Impact Factor: 4.5].",
        "year": 2025,
        "url": "https://doi.org/10.1007/s42832-025-0299-x"
      },
      {
        "title": "Chowdhury, M.Q., Sarker, S.K., Imam, I.M., Datta, A., Syeda, A., Zubayer, A., and Beeckman, H., (2025). Divergence of vessel diameters explains inter-specific variation in hydraulic safety to salinity in the Sundarbans mangrove ecosystem. Functional Ecology. 00:1–21. https://doi.org/10.1111/1365-2435.14751 [IF: 5.7, Publisher: British Ecological Society, Wiley]",
        "year": 2025,
        "url": "https://doi.org/10.1111/1365-2435.14751"
      },
      {
        "title": "Sarker S.K. (2025). Forestry Handbook: Raghunandan Hill Reserve and Satchari National Park ‒ Baseline ecological information for guiding forest management, biodiversity conservation and restoration. Bangladesh Forest Department. Dhaka. Bangladesh.",
        "year": 2025
      },
      {
        "title": "Sarker S.K. (2025). Forestry Handbook: Tarap Hill Reserve and Rema-Kalenga Wildlife Sanctuary ‒ Baseline ecological information for guiding forest management, biodiversity conservation and restoration. Bangladesh Forest Department. Dhaka. Bangladesh.",
        "year": 2025
      },
      {
        "title": "Pijanowski, B.C., Fuenzalida, F.R., Banerjee, S., Sarker, S.K...et. al., (2024). Soundscape Analytics: A New Frontier of Knowledge Discovery in Soundscape Data. Current Landscape Ecology Reports 9, 88–107. https://doi.org/10.1007/s40823-024-00101-9 [IF: 1.6, Publisher: Springer].",
        "year": 2024,
        "url": "https://doi.org/10.1007/s40823-024-00101-9"
      },
      {
        "title": "Chowdhury, M.Q., Sarker, S.K., Hossain, S., Imran, M.I.H., Datta, A., (2024). Salinity regulates radial growth of Cynometra ramiflora L. in the Sundarbans mangrove ecosystem. Dendrochronologia 88:126270. [IF: 2.7, Publisher: Elsevier].",
        "year": 2024,
        "url": "https://doi.org/10.1016/j.dendro.2024.126270"
      }
    ],
    "awards": [
      {
        "title": "Commonwealth Doctoral Scholarship funded by Commonwealth Scholarship Commission, United Kingdom (2013 - 2017)",
        "year": 2017
      },
      {
        "title": "Prime Minister (Bangladesh) Gold Medal Award (2006)",
        "year": 2006
      },
      {
        "title": "Chancellors (President) Award (2006)",
        "year": 2006
      },
      {
        "title": "Vice Chancellors Award (2006)",
        "year": 2006
      }
    ]
  },
  {
    "id": "fac-9",
    "name": "Dr. Mohammed Abu Sayed Arfin Khan",
    "designation": "Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-9.webp",
    "email": "khan-for@sust.edu",
    "phone": "+8801917174537",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/khan-for@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/khan-for@sust.edu/cv",
    "researchAreas": [
      "Forest Ecology and Management",
      "Ecosystem Function and Services",
      "Experimental Plant Ecology",
      "Extreme Climatic Events",
      "Technology-Driven Forest and Wildlife Monitoring",
      "Ecosystem Conservation and Valuation",
      "Climate Change Impact and Adaptation"
    ],
    "bio": "Dr Arfin Khan is a professor of Forestry and Environmental Science at Shahjalal University of Science and Technology, Bangladesh. Previously, he did his Bachelor and Masters Degree in Forestry from the same department. Dr Arfin Khan finished his doctoral degree “Doctor of Natural Sciences” and also completed his postdoctoral research in Climate Change & Ecosystem Functioning from the Department of Disturbance Ecology, University of Bayreuth, Germany. Dr Arfin Khan’s research interest and specializations are (a) assessing the impacts of climate change and extreme climatic events on plants and ecosystem functioning, (b) applying technology-based forest and wildlife monitoring for ecosystem conservation, ecological and economical valuation, and sustainable forest management, (c) evaluating livelihood vulnerability and exploring adaptation strategies in the face of climate change, and (d) understanding the role of natural and anthropogenic disturbance on biodiversity and forest ecosystem services. He is currently participating in several worldwide coordinated research projects such as sPlot, DarkDivNet, Soil DarkDivNet, and Drought-Net. He previously worked in climate change manipulation experiments in Europe and supervised several research projects regarding multiple drivers of forest ecosystem functioning in Bangladesh. Jointly with his colleagues and with students, Dr Arfin Khan has published 50+ manuscripts in international peer-reviewed journals, i.e. Nature Communications, Nature Ecology and Evolution, Global Change Biology, Ecosystems, Journal of Environmental Management, Ecological Indicators, Global Ecology and Biogeography, Plant and Soil, Journal of Vegetation Science, Mitigation and Adaptation Strategies for Global Change, Acta Oecologica etc.",
    "education": [
      {
        "degree": "Posdoctoral Research on Ecological Impacts of Climate Change",
        "institute": "University of Bayreuth, Germany",
        "duration": "2018"
      },
      {
        "degree": "Doctor of Natural Sciences (Dr. rer. nat.) specialized on Climate Change and Ecosystem Functioning",
        "institute": "University of Bayreuth, Germany",
        "duration": "2016"
      },
      {
        "degree": "M.Sc. in Forestry (Second position with distinction",
        "institute": "CGPA 3.93 out of 4), Department of Forestry and Environmental Science, Shahjalal University of Science and Technology Sylhet-3114 Bangladesh",
        "duration": "2009"
      },
      {
        "degree": "B.Sc (Hons) in Forestry (First position with distinction",
        "institute": "CGPA 3.88 out of 4), Department of Forestry and Environmental Science, Shahjalal University of Science and Technology Sylhet-3114, Bangladesh",
        "duration": "2007"
      }
    ],
    "teaching": [
      "Forestry and Climate Change",
      "Forest Management Plan",
      "Environmental Impact Assessment",
      "Forest Mensuration and Inventory",
      "Protected Areas and Wildlife Management",
      "Environmental Pollution and Climate Change",
      "Biodiversity Conservation",
      "Forest Ecology and Management",
      "Data Analysis and Visualization in R",
      "Research Methodology"
    ],
    "links": [
      {
        "label": "Google Scholar",
        "url": "https://scholar.google.com/citations?user=L69hTlwAAAAJ&hl=en"
      },
      {
        "label": "ResearchGate",
        "url": "https://www.researchgate.net/profile/Mohammed_Abu_Sayed_Arfin_Khan"
      },
      {
        "label": "ORCID",
        "url": "https://orcid.org/0000-0001-6275-7023"
      },
      {
        "label": "LinkedIn",
        "url": "https://www.linkedin.com/in/mohammed-abu-sayed-arfin-khan"
      },
      {
        "label": "Scopus",
        "url": "https://www.scopus.com/authid/detail.uri?authorId=56032894000"
      },
      {
        "label": "Google Sites",
        "url": "https://sites.google.com/sust.edu/arfin-khan"
      }
    ],
    "publicationsCount": 69,
    "selectedPublications": [
      {
        "title": "Mahmuda Islam, Kanta Bhattacharjee, Achim Bräuning, Aster Gebrekirstos, Mohammed A.S. Arfin-Khan, Fahmida Sultana, Hasibul Hasan, Md Bayzid Hassan, Mizanur Rahman (2026) Integrating dendrochronology and satellite NDVI to assess climate sensitivity and canopy resilience along a disturbance gradient in tropical moist forests. Volume 1029, 10 May 2026, 181739.",
        "year": 2026,
        "url": "https://doi.org/10.1016/j.scitotenv.2026.181739"
      },
      {
        "title": "Md Shamim Reza Saimun, Md Rezaul Karim, Mohammed A.S. Arfin-Khan, Sharif A. Mukul (2026) Spatial insights on edge-driven degradation in protected tropical forests of Bangladesh. Environmental and Sustainability Indicators, Volume 32, December 2026, 101483",
        "year": 2026,
        "url": "https://doi.org/10.1016/j.indic.2026.101483"
      },
      {
        "title": "Ahammed, S., Fahim, M.S.I., Amin, M.S. ……, Arfin-Khan, M. A.S. et al. Disturbance Effects on Plant Functional Traits, Beta Diversity, and Soil Properties in a Tropical Forest of Bangladesh. Small-scale Forestry 25, 161–182 (2026)",
        "year": 2026,
        "url": "https://doi.org/10.1007/s11842-026-09619-8"
      },
      {
        "title": "Md Rezaul Karim, Nabanita Karmaker, Shekhar R. Biswas, Md. Shamim Reza Saimun, Sharif A. Mukul, Tanjena Khatun, Fahmida Sultana, Sanjeev K. Srivastava, Mohammed A. S. Arfin-Khan (2026) Trait-based evidence of salinity-induced functional diversity loss in mangroves: Implications for ecosystem resilience. Ecological Applications. Volume 36, Issue 1, January 2026, e70191",
        "year": 2026,
        "url": "https://doi.org/10.1002/eap.70191"
      },
      {
        "title": "Sanjeev Kumar Srivastava, Prashant K. Srivastava, Harikesh Singh, Sharif A. Mukul, Mohammed A. S. Arfin-Khan, Mukunda Dev Behera & Dhananjay Barman (2026). Use of Archived Data and Geospatial Methods for Characterising Sundarbans. In: Srivastava, S.K., Srivastava, P.K., Biswas, T.K., Behera, M.D., Mukul, S.A. (eds) Earth Observation for Monitoring Mangrove Ecosystems. Springer, Cham.",
        "year": 2026,
        "url": "https://doi.org/10.1007/978-3-032-16668-5_6"
      },
      {
        "title": "Dhananjay Barman, Sanjeev Kumar Srivastava, Gouranga Kar, Saon Banerjee, Debangana Banik, Bulu Basak, Mohammed A. S. Arfin-Khan, Sharif A. Mukul, Mochamad Candra Wirawan Arief & Reginawanti Hindersah (2026). Remote Sensing-Based Assessment of Mangrove Ecosystem with Special Reference to the Sundarbans of India. In: Srivastava, S.K., Srivastava, P.K., Biswas, T.K., Behera, M.D., Mukul, S.A. (eds) Earth Observation for Monitoring Mangrove Ecosystems. Springer, Cham.",
        "year": 2026,
        "url": "https://doi.org/10.1007/978-3-032-16668-5_5"
      }
    ],
    "awards": [
      {
        "title": "Junior fellowship awards 2016 from the University of Bayreuth, Germany",
        "year": 2016
      },
      {
        "title": "DAAD PhD research fellow (October 2011 – June 2015)",
        "year": 2015
      },
      {
        "title": "Got the award “DAAD-Preis 2012” form the University of Bayreuth, Germany",
        "year": 2012
      },
      {
        "title": "Research fellow of East-West Center, Hawaii, U. S. A/ Nishorgo Support Project (January 2006 - August 2006).",
        "year": 2006
      },
      {
        "title": "FoCaS exchange program fellowship at the University of New Hampshire, USA (June 2023 - July 2023)",
        "year": 2023
      },
      {
        "title": "VC Award 2024: Received the best research award 2024, SUST.",
        "year": 2024
      },
      {
        "title": "Post Doctoral fellow 2017 at the Disturbance Ecology, University of Bayreuth, Germany",
        "year": 2017
      }
    ]
  },
  {
    "id": "fac-10",
    "name": "Dr. Kazi Mohammad Masum",
    "designation": "Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-10.webp",
    "email": "kmmasum-for@sust.edu",
    "phone": "+8801816052842",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/kmmasum-for@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/kmmasum-for@sust.edu/cv",
    "researchAreas": [
      "Tropical Forest Ecology",
      "Biodiversity Conservation",
      "Habitat Quality Modeling",
      "Remote Sensing & Avifauna",
      "Natural Regeneration"
    ],
    "researchSummary": "I am working with ecological data (species abundance, biodiversity measures, biophysical vegetation and avifauna attributes) and remotely sensed data (satellite-derived) to characterize habitat quality on spatiotemporal scale in tropical human-modified landscapes and to predict biodiversity responses to changes in habitat quality caused by deforestation and fragmentation processes.",
    "bio": "Career started as an Assistant Conservator of Forests in the Forest Department and served there from 2005 to 2009. Posting includes the most magnificent hill forest areas (Chunati Wildlife Sanctuary, Bangabandhu Sheikh Mujib Safari Park-CoxsBazar & Banskhali Ecopark) of Bangladesh. Then in June 2009, joined as faculty in this prestigious department and tried level best for contributing to biodiversity conservation",
    "education": [
      {
        "degree": "PhD in Biodiversity Conservation (Awarded in 2017",
        "institute": "UNESCO TWAS Fellowship, Universiti Sains Malaysia)",
        "duration": "2017"
      }
    ],
    "teaching": [
      "Community based Natural Resource Management",
      "Biodiversity Conservation",
      "Protected Area and Wildlife Management",
      "Remote Sensing and GIS"
    ],
    "publicationsCount": 34,
    "selectedPublications": [
      {
        "title": "Arman, A. H., Khatun, R., & Masum, K. M. 2024. Transformation of jhum (shifting cultivation) to forest plantation: Effect on soil properties in the hill tracts of Bangladesh. Forestist, Published online August 26, 2024.",
        "year": 2024,
        "url": "http://doi.org/10.5152/forestist.2024.23079"
      },
      {
        "title": "M. Parvej, K. M. Masum, M. S. I. Fahim, and M. Redowan, 2024. \"Three Decades of River Bank Erosion and Accretion Appraisal Along Bank Line Shifting Trend in A Transboundary River, Teesta Floodplain of Bangladesh,\" Geoplanning: Journal of Geomatics and Planning, vol. 11, no. 1, pp. 1-16,",
        "year": 2024,
        "url": "https://doi.org/10.14710/geoplanning.11.1.1-16"
      },
      {
        "title": "Masum, K.M., Islam, M.S., Fahim, M.S.I., Parvej, M., Majeed, M., Hasan, M.M. & Mansor, A. 2023. Temporal comparison of land-use changes and biodiversity in differential IUCN protected-area categories of Bangladesh in the context of co-management, Geology, Ecology, and Landscapes.",
        "year": 2023,
        "url": "https://doi.org/10.1080/24749508.2023.2202442"
      },
      {
        "title": "Samad, M.A., Raihan, F., Masum, K.M., 2022. Urban growth assessment in the Northeastern region of Bangladesh for sustainable landscape management and conservation. Geology, Ecology and Landscapes.",
        "year": 2022,
        "url": "https://doi.org/10.1080/24749508.2021.2022831"
      },
      {
        "title": "Rozali, F.Z., Masum, K.M., Mansor, M.S., Mansor, A. 2021. Rattan composition and diversity assessment in tropical rainforests of Peninsular Malaysia for conservation. Biodiversity and conservation. 30: 2907-2928.",
        "year": 2021,
        "url": "https://doi.org/10.5152/forestist.2020.20023"
      },
      {
        "title": "Abdullah-Al-Mamun, M.M., Shimu, S.A., Sarker, A.H.M.R., Masum, K.M. 2021. Ecosystem services assessment of mangrove forest in a coastal Island of Bangladesh. Journal of Forests, 8(1): 88-98.",
        "year": 2021,
        "url": "https://doi.org/10.18488/journal.101.2021.81.88.98"
      }
    ],
    "awards": [
      {
        "title": "Excellent Achievement in Journal Publication Award 2018, MAJLIS PERSADA KENCANA",
        "year": 2018
      }
    ]
  },
  {
    "id": "fac-11",
    "name": "Dr. Farzana Raihan",
    "designation": "Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-11.webp",
    "email": "fraihan-for@sust.edu",
    "phone": "+8801712207882",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/fraihan-for@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/fraihan-for@sust.edu/cv",
    "researchAreas": [
      "Hydrology & Watershed Management",
      "Climate Change Adaptation",
      "Environmental Impact Assessment",
      "Wetland & Swamp Ecosystems",
      "Remote Sensing & GIS"
    ],
    "researchSummary": "My research activities are mainly focused on climate change impact on hydrology, climate induced adaptation and migration, water resources management, Environmental and Social Impact Assessment, Remote sensing and GIS.",
    "bio": "I am Dr. Farzana Raihan serving as an Professor at the Department of Forestry and Environmental Sciences, Shahjalal University of Science and Technology, Sylhet, Bangladesh. I had completed B.Sc. (honours) and M.Sc. in Environmental Sciences from Jahangirnagar University, Bangladesh. I had completed PhD in Biological Sciences from Macquarie University Australia. I have been involved in multi-disciplinary environmental research since 2007. I have been doing research on assessment of ground water quality, climate change impacts on hydrology using regional climate model, SWAT model and LCM model, vulnerability and impact assessment of climate change.",
    "education": [
      {
        "degree": "PhD in Biological Sciences",
        "institute": "Macquarie University, NSW, Australia"
      },
      {
        "degree": "M.Sc. in Environmental Sciences",
        "institute": "Jahangirnagar University, Bangladesh"
      },
      {
        "degree": "B.Sc. in Environmental Sciences",
        "institute": "Jahangirnagar University, Bangladesh"
      }
    ],
    "teaching": [
      "Introduction to Forestry and Environmental Science",
      "Watershed, Water Resources and Wetland Management",
      "Environmental Pollution Control and Climate change",
      "Environmental Impact Assessment and Auditing"
    ],
    "publicationsCount": 21,
    "selectedPublications": [
      {
        "title": "Linkages among biodiversity, ecotourism and livelihood of wetland communities: a case study of Ratargul Swamp Forest, Bangladesh.",
        "year": 2024,
        "url": "https://doi.org/10.1007/s10668-024-04577-7"
      },
      {
        "title": "Impact of Michelia champaca and Tectona grandis mono-species and their mixed plantation on chemical soil properties in a tropical semi-evergreen forest",
        "year": 2024,
        "url": "https://doi.org/10.15287/afr.2024.3071"
      },
      {
        "title": "Coping with climate change: A livelihood vulnerability and adaptation analysis in Gaibandha, Rangpur, Bangladesh",
        "year": 2024,
        "url": "https://doi.org/10.1111/jfr3.13036"
      },
      {
        "title": "Economic Feasibility of Hydroponics Production System under Polyhouse: A Case Study in Gazipur, Bangladesh. SUST Journal of Science and Technology, Vol 32(1), 14 – 23.",
        "year": 2022
      },
      {
        "title": "Salt Stress in Plants and Mitigation Approaches. Plants, 11(6), 717.",
        "year": 2022,
        "url": "https://doi.org/10.3390/plants11060717"
      },
      {
        "title": "Urban growth assessment in the Northeastern region of Bangladesh for sustainable landscape management and conservation. Geology, Ecology, and Landscapes, 1-10.",
        "year": 2022,
        "url": "https://doi.org/10.1080/24749508.2021.2022831"
      }
    ],
    "awards": [
      {
        "title": "International Research Excellence Scholarship from Macquarie University for PhD"
      },
      {
        "title": "Bangladesh Government Scholarship in HSC level for SSC level result"
      },
      {
        "title": "Bangladesh Government stipend in Primary and Junior Section"
      }
    ]
  },
  {
    "id": "fac-12",
    "name": "Dr. Mahmuda Islam",
    "designation": "Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-12.webp",
    "email": "mahmuda-fes@sust.edu",
    "phone": "+8801712172658",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/mahmuda-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/mahmuda-fes@sust.edu/cv",
    "researchAreas": [
      "Dendrochronology",
      "Wood anatomical time series",
      "Hydraulic conductivity",
      "Extreme climatic events analysis",
      "Drought analysis",
      "Tree-ring study"
    ],
    "bio": "I am a denroclimatologist. My main research goal is to understand the underlying causes of forest tree growth and the wood anatomy of the tree species in relation to climate and extreme climatic events (drought, flood) and provide solutions that help mitigate the effects of climate change on forests. To fulfill this purpose, I use and combine different disciplines and techniques such as dendrochronology, and wood anatomy, isotopes with a geographical perspective. I am interested in how tree-rings wood anatomy can be used to improve forest management actions.",
    "education": [
      {
        "degree": "Postdoc at the School of Biological Sciences of the Washington State University",
        "institute": "USA"
      },
      {
        "degree": "PhD in Natural Science",
        "institute": "Friedrich-Alexander University Erlangen-Nuremberg, Germany"
      },
      {
        "degree": "MSc in Forestry",
        "institute": "Dept. of Forestry and Env. Science, SUST, Sylhet, Bangladesh"
      },
      {
        "degree": "BSc in Forestry",
        "institute": "Dept. of Forestry and Env. Science, SUST, Sylhet, Bangladesh"
      }
    ],
    "publicationsCount": 34,
    "selectedPublications": [
      {
        "title": "Islam M, Bhattacharjee K, Bräuning A, Gebrekirstos A, Arfin-Khan M. A. S, Sultana F, … Rahman, M. (2026). Integrating dendrochronology and satellite NDVI to assess climate sensitivity and canopy resilience along a disturbance gradient in tropical moist forests. Science of The Total Environment, 1029, 181739.",
        "year": 2026,
        "url": "https://doi.org/10.1016/j.scitotenv.2026.181739"
      },
      {
        "title": "The earlywood, latewood and xylem vessel chronologies of Teak tree (Tectona grandis) provide important insight into xylem hydraulic adjustment to past climate variability. Agric For Meteorol 375:110863.",
        "year": 2025,
        "url": "https://doi.org/10.1016/j.agrformet.2025.110863"
      },
      {
        "title": "Ecuadendro 2025: The 1st Ecuadorian Dendrochronology Conference, TREE-RING RESEARCH, Vol. 81(2), 2025, pp. 91–95",
        "year": 2025,
        "url": "https://doi.org/10.3959/TRR2025-2"
      },
      {
        "title": "Pantropical tree growth resilience to drought. Science 389,532-538.",
        "year": 2025,
        "url": "https://doi.org/10.1126/science.adq6607"
      },
      {
        "title": "Impact of local climate and large-scale climate drivers on the growth of Gmelina arborea Roxb. in a moist tropical forest of Bangladesh. Trees: Structure and Function. 39:41",
        "year": 2025,
        "url": "https://doi.org/10.1007/s00468-025-02618-w"
      },
      {
        "title": "The importance of tropical tree-ring chronologies for global change research. Quaternary Science Reviews. 355: 109233.",
        "year": 2025,
        "url": "https://doi.org/10.1016/j.quascirev.2025.109233"
      }
    ]
  },
  {
    "id": "fac-13",
    "name": "Dr. Mahmuda Sharmin",
    "designation": "Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-13.webp",
    "email": "sharmin-fes@sust.edu",
    "phone": "+8801671635120",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/sharmin-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/sharmin-fes@sust.edu/cv",
    "researchAreas": [
      "Urban Forestry",
      "Environmental Justice",
      "Ecosystem services",
      "Tree growth"
    ],
    "bio": "Prof. Dr. Mahmuda Sharmin's r esearch is dedicated to advancing our understanding of how urban greenspaces can deliver multiple ecosystem services simultaneously. Her work explores the role of urban vegetation in mitigating heat stress, supporting biodiversity and enhancing the ecological resilience of cities. Her research and professional experience reflect her commitment, notably through her involvement with \"Which Plant Where\" project, an Australian industry Hort innovation funded project (https://www.whichplantwhere.com.au/). She completed her PhD in Urban Ecology, titled \"Urban vegetation: towards cooler, biodiverse cities of the future\". She designed, led and executed multiple independent projects in Sydney, NSW, Australia and continues to do so in Bangladesh. This entailed working closely with city councils, Forest department, experts and researchers to make cities inclusive, safe, resilient and sustainable, aligning with SDG 11 and SDG 3. She is currently leading several projects investigating the effects of climate and environmental conditions on tree growth in tropical regions.",
    "education": [
      {
        "degree": "Ph.D. specialized on Urban Ecology",
        "institute": "Hawkesbury Institute for Environment (HIE), Western Sydney University, NSW, Australia",
        "duration": "2023"
      },
      {
        "degree": "M.Sc. in Applied Ecology",
        "institute": "Christian-Albrecht University of Kiel, Kiel, Germany",
        "duration": "2018"
      },
      {
        "degree": "M.Sc. in Forestry",
        "institute": "Dept of Forestry and Environmental Science, Shahjalal University of Science and Technology, Sylhet, Bangladesh",
        "duration": "2011"
      },
      {
        "degree": "B. Sc. in Forestry",
        "institute": "Dept of Forestry and Environmental Science, Shahjalal University of Science and Technology, Sylhet, Bangladesh",
        "duration": "2009"
      }
    ],
    "teaching": [
      "Restoration Ecology (MSc. Course)",
      "Forest Soil Management (MSc. Course)",
      "Forest Ecology",
      "Tree Physiology",
      "Social Forestry and Forest Extension",
      "Forest Botany",
      "Forest Surveying"
    ],
    "links": [
      {
        "label": "Google Scholar",
        "url": "https://scholar.google.com/citations?user=dBlNUu4AAAAJ&hl=en"
      },
      {
        "label": "ResearchGate",
        "url": "https://www.researchgate.net/profile/Mahmuda-Sharmin-2?ev=hdr_xprf"
      },
      {
        "label": "ORCID",
        "url": "https://orcid.org/0000-0003-2958-4081"
      },
      {
        "label": "LinkedIn",
        "url": "https://www.linkedin.com/in/mahmuda-sharmin-phd-21341a152/"
      },
      {
        "label": "Google Sites",
        "url": "https://www.sites.google.com/view/ms-urban-forestry-lab"
      }
    ],
    "publicationsCount": 19,
    "selectedPublications": [
      {
        "title": "Climate variability and air pollution threaten urban tree growth in a tropical city",
        "year": 2026,
        "url": "https://doi.org/10.1007/s11252-026-02086-1"
      },
      {
        "title": "Rethinking urban forests as essential infrastructure for resilience, equity, and biodiversity in the current climate emergency",
        "year": 2026,
        "url": "https://doi.org/10.1371/journal.pclm.0000953"
      },
      {
        "title": "Spatial associations of Aboriginal and Torres Strait Islander populations with climate exposure, green cover, and socioeconomic advantage in New South Wales, Australia",
        "year": 2026,
        "url": "https://doi.org/10.1007/s10113-026-02619-6"
      },
      {
        "title": "Urban forests as essential infrastructure for climate resilience and biodiversity: A call to policymakers",
        "year": 2026,
        "url": "https://doi.org/10.1002/ppp3.70125Digital"
      },
      {
        "title": "Climate and socio-economic drivers of urban tree abundance, richness and composition in Australian cities",
        "year": 2026,
        "url": "https://doi.org/10.1016/j.cities.2025.106532"
      },
      {
        "title": "A nation-wide urban trial network of tree and shrub climate resilience",
        "year": 2025
      }
    ],
    "awards": [
      {
        "title": "Prime Minister Gold Medal Award"
      },
      {
        "title": "Erasmus Mundus Masters scholarship for The International Master in Applied Ecology"
      },
      {
        "title": "Hort Inovation Scholarship for Doctor of Philosophy"
      }
    ]
  },
  {
    "id": "fac-14",
    "name": "Dr. Mohammad Golam Kibria",
    "designation": "Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-14.webp",
    "email": "kibria-fes@sust.edu",
    "phone": "+8801716627144",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/kibria-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/kibria-fes@sust.edu/cv",
    "researchAreas": [
      "Forest ecology",
      "Ecophysiology",
      "Tree physiology",
      "Functional traits",
      "Climate change",
      "Urban forests"
    ],
    "bio": "Dr. Mohammad Golam Kibria serves as Associate Professor in the Department of Forestry & Environmental Science at Shahjalal University of Science and Technology, Sylhet. They are actively engaged in teaching, research and supervision of undergraduate and graduate students in the department.",
    "education": [
      {
        "degree": "PhD",
        "institute": "Hawkesbury Institute for the Environment, Western Sydney University, Richmond, NSW, Australia"
      },
      {
        "degree": "MSc in Forest and Nature Conservation",
        "institute": "Wageningen University, Netherlands"
      },
      {
        "degree": "MSc in Forestry",
        "institute": "Department of Forestry and Environmental Science Shahjalal University of Science and Technology, Sylhet, Bangladesh"
      },
      {
        "degree": "BSc (Hon’s) in Forestry",
        "institute": "Department of Forestry and Environmental Science Shahjalal University of Science and Technology, Sylhet, Bangladesh"
      }
    ],
    "teaching": [
      "Forest Management",
      "Mangrove Forestry",
      "Forest Tree Physiology",
      "Geology and Forest soils"
    ],
    "publicationsCount": 15,
    "selectedPublications": [
      {
        "title": "M. G. Kibria, Mark G. Tjoelker, Manuel Esperón-Rodríguez, Renée M. Marchin, Stefan K. Arndt, Stephen J. Livesley, Paul D. Rymer (2026). Functional traits are better than climate niche approach at predicting the vital growth and mortality rates of urban tree species",
        "year": 2026,
        "url": "https://doi.org/10.1016/j.ufug.2026.129450"
      },
      {
        "title": "M. G. Kibria (2025). Testing urban tree performance under drier and hotter climates of the future. Western Sydney University Library.",
        "year": 2025
      },
      {
        "title": "M. G. Kibria, Mark G. Tjoelker, Renée M. Marchin, Stefan K. Arndt, Paul D. Rymer (2024). Can species climate niche predict canopy growth, functional traits and phenotypic plasticity in urban trees? Urban Forestry & Urban Greening.",
        "year": 2024,
        "url": "https://doi.org/10.1016/j.ufug.2024.128417"
      },
      {
        "title": "Khan, A., Karim, M. R., Mohammed, M., Kibria, M. G., Sinha, K., Sultana, F., ... & Arfin-Khan, M. A (2023). Anthropogenic disturbance modifies tree functional traits in the only remnant swamp forest of Bangladesh. Frontiers in Ecology and Evolution, 11, 1062764.",
        "year": 2023,
        "url": "https://doi.org/10.3389/fevo.2023.1062764"
      },
      {
        "title": "B Sinha, MM Islam, FH Bhuiyan, MN Hasan, M.G. Kibria, R Sultana, SH Prodhan and H Hoque (2022). Determination of genetic diversity among local Mandarine oranges (Citrus reticulata) using mature seed calli through RAPD markers. SUST J Sci Tech, 32(1), 43-53.",
        "year": 2022,
        "url": "https://journals.sust.edu/index.php/sustjst/article/view/21"
      },
      {
        "title": "Abdullah Al-Nur Shanto Rahman, Mizanur Rahman, Mehedi Hasan Shimanto, M. G. Kibria and Mahmuda Islam (2022). Stomatal size and density trade-off varies with leaf phenology and species shade tolerance in a South Asian moist tropical forest. Functional Plant Biology 49(3), 307–318.",
        "year": 2022,
        "url": "https://doi.org/10.1071/FP21159"
      }
    ],
    "awards": [
      {
        "title": "Western Sydney University Postgraduate Research Scholarship 2019",
        "year": 2019
      },
      {
        "title": "Netherlands Fellowship Programme 2015 (Nuffic)",
        "year": 2015
      },
      {
        "title": "University Grants Commission (UGC) of Bangladesh Merit Scholarship"
      },
      {
        "title": "University Merit Scholarship, Shahjalal University of Science & Technology, Sylhet, Bangladesh"
      }
    ]
  },
  {
    "id": "fac-15",
    "name": "Ms. Fahmida Sultana",
    "designation": "Associate Professor",
    "onLeave": true,
    "availabilityLabel": "On Leave",
    "photoUrl": "assets/faculty/fac-15.webp",
    "email": "fahmida-fes@sust.edu",
    "phone": "+8801911720167",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/fahmida-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/fahmida-fes@sust.edu/cv",
    "researchAreas": [
      "Climate Change Impact and Ecosystem Responses",
      "Plant Functional traits",
      "Sustainable Forest Resources Management",
      "Biodiversity Conservation",
      "Environmental Science",
      "Experimental Plant Ecology"
    ],
    "bio": "Working as a faculty member at the Department of Forestry & Environmental Science, Shahjalal University of Science and Technology, Sylhet-3114, Bangladesh, from 22nd December 2013 to date.",
    "education": [
      {
        "degree": "2019: MSc in Mediterranean Forestry and Natural Resources Management (MEDfOR); University of Lleida",
        "institute": "Spain; University of Tuscia, Italy",
        "duration": "2017–2019"
      },
      {
        "degree": "2009: Master of Science in Forestry (MSc)",
        "institute": "Shahjalal University of Science and Technology (SUST), Bangladesh",
        "duration": "2008–2009"
      },
      {
        "degree": "2007: Bachelor of Science in Forestry (BSc)",
        "institute": "Shahjalal University of Science and Technology (SUST), Bangladesh",
        "duration": "2004–2007"
      }
    ],
    "teaching": [
      "Dendrology",
      "Protected Area and wildlife Management",
      "Geology and Forest Soil",
      "Species Silviculture",
      "Forest Development Planning",
      "Forest Botany"
    ],
    "publicationsCount": 12,
    "selectedPublications": [
      {
        "title": "Khan, Karim, Mohammed, Kibria, Sinha, Sultana, Mukul and Arfin-Khan, 2023. Anthropogenic disturbance modifies tree functional traits in the only remnant swamp forest of Bangladesh. Front. Ecol. Evol. doi: 10.3389/fevo.2023.1062764",
        "year": 2023,
        "url": "https://www.frontiersin.org/articles/10.3389/fevo.2023.1062764/abstract"
      },
      {
        "title": "Sultana et al. 2023. Rainfall Modifies the Disturbance Effects on Regulating Ecosystem Services in Tropical Forests of Bangladesh. Forests 2023, 14(2), 272;",
        "year": 2023,
        "url": "https://www.mdpi.com/1999-4907/14/2/272"
      },
      {
        "title": "Sultana F, Sarker SK (2022) Sacred places and spiritual beliefs can enhance biodiversity conservation: A case study from the north-eastern Bangladesh. SUST J Sci Tech, 32(1): 24 – 42",
        "year": 2022,
        "url": "https://www.researchgate.net/publication/364122351_Sacred_places_and_spiritual_beliefs_can_enhance_biodiversity_conservation_A_case_study_from_the_north-eastern_Bangladesh#:~:text=We"
      },
      {
        "title": "Sabatini FM, Lenoir J, Hattab T, Arnst EA, Chytrý M, Dengler J, Ruffray PD, Hennekens SM, Jandt U, Jansen F, Jiménez-Alfaro B, Kattge J, Levesley A, Pillar VD, Purschke O, Sandel B, Sultana F, et al. (2021) sPlotOpen – An environmentally balanced, open-access, global dataset of vegetation plots. Global Ecology and Biogeography, 30(9): 1740-1764.",
        "year": 2021,
        "url": "https://onlinelibrary.wiley.com/doi/10.1111/geb.13346"
      },
      {
        "title": "Karim, R., Sultana, F., Reza, S., Mukul, S.A., Arfin-khan, M.A.S., 2020. Plant diversity and local rainfall regime mediate soil ecosystem functions in tropical forests of north-east Bangladesh. Environ. Adv. 2, 100022.",
        "year": 2020,
        "url": "https://www.sciencedirect.com/science/article/pii/S2666765720300223?via%3Dihub"
      },
      {
        "title": "Fahmida Sultana (2018) Effects of inorganic fertilization and seed weight on seedlings: Examples from Bangladesh. Paper presented on XII Young Researchers Meeting on Conservation and Sustainable Use of Forest Systems 2018. Valsain, Spain.",
        "year": 2018
      }
    ],
    "awards": [
      {
        "title": "2010 Youth Activity Fund Award,The Explorers Club, USA. Grant amount: US $ 1150",
        "year": 2010
      },
      {
        "title": "Erasmus Mundus Scholarship 2017-2019, for the completion of MSc in Mediterranean Forestry and Natural Resources Management (MEDfOR).",
        "year": 2019
      },
      {
        "title": "University Grand Commission of Bangladesh, Merit Scholarship 2009",
        "year": 2009
      },
      {
        "title": "Shahjalal University of Science & Technology. Merit Scholarship, 2005-2008",
        "year": 2008
      }
    ]
  },
  {
    "id": "fac-16",
    "name": "Dr. Mohammed Masum Ul Haque",
    "designation": "Associate Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-16.webp",
    "email": "masum-fes@sust.edu",
    "phone": "+8801748714848",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/masum-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/masum-fes@sust.edu/cv",
    "researchAreas": [
      "Forest Pathology & Mycology",
      "Molecular Pathogen Diagnostics",
      "Invasive Forest Pathogens",
      "Tree Disease Management",
      "Silviculture & Biocontrol"
    ],
    "researchSummary": "Molecular and conventional methods for isolation and identification of plant pathogens from tissues, soil and water · Role of introduced and endemic pathogens species in declining process of forest ecosystems · Introduction and dissemination of alien species · Pathways, survival strategies, host specificity and aggressiveness of plant pathogen species · Management and control of diseases in trees, forest and riparian ecosystems",
    "bio": "Dr. Haque is working as an Associate Professor at the Department of Forestry and Environmental Science, Shahjalal University of Science and Technology (SUST), Sylhet, Bangladesh. He obtained his PhD in Forest Pathology from the University of Valladolid, Valladolid, Spain. Earlier, he completed an MSc (Thesis) in European Forestry at the University of Eastern Finland (former University of Joensuu), Joensuu, Finland, and an MSc (Thesis) in Forestry at the University of Chittagong, Chittagong, Bangladesh. Dr. Haque completed a BSc (Hons.) in Forestry at the same university in Bangladesh.",
    "education": [
      {
        "degree": "PhD in Forest Pathology. University of Valladolid",
        "institute": "Valladolid, Spain"
      },
      {
        "degree": "MSc (Thesis) in European Forestry. University of Eastern Finland",
        "institute": "Joensuu, Finland and University of Lleida, Lleida, Spain"
      },
      {
        "degree": "Diploma in Business Management. Australian Institute of Commerce and Language (AICL)",
        "institute": "Sydney, Australia"
      },
      {
        "degree": "MSc (Thesis) in Forestry. Institute of Forestry and Environmental Sciences",
        "institute": "University of Chittagong, Chittagong, Bangladesh"
      },
      {
        "degree": "BSc (Hons.) in Forestry. Institute of Forestry and Environmental Sciences",
        "institute": "University of Chittagong, Chittagong, Bangladesh"
      }
    ],
    "teaching": [
      "Mycology, Forest Pathology and Forest Protection",
      "Forest Entomology",
      "Forest Botany"
    ],
    "links": [
      {
        "label": "Google Scholar",
        "url": "https://scholar.google.com/citations?user=SbllhhMAAAAJ&hl=en"
      },
      {
        "label": "ResearchGate",
        "url": "https://www.researchgate.net/profile/Mohammed-Haque-12"
      },
      {
        "label": "ORCID",
        "url": "https://orcid.org/0000-0002-0697-9657"
      },
      {
        "label": "Scopus",
        "url": "https://www.scopus.com/authid/detail.uri?authorId=55321592100"
      }
    ],
    "publicationsCount": 45,
    "selectedPublications": [
      {
        "title": "Ador MAH, Halim MA, Sivarajah S, Haque MMH, Ahmed R. 2026. Acacia Biochar Reduces Arsenic Uptake and Enhances Growth of Lettuce (Lactuca sativa) in a Contaminated Hydroponic System. Agronomy 16(14), 1337.",
        "year": 2026,
        "url": "https://doi.org/10.3390/agronomy16141337"
      },
      {
        "title": "Jui LA, Chowdhury T, Ador MAH, Khatun R, Haque MMU, Dey B, Ahmed R. 2026. Terminalia arjuna Switches from Adaptive to Survival Strategy Under Severe Water Stress. Plants 15(6), 888.",
        "year": 2026,
        "url": "https://doi.org/10.3390/plants15060888"
      },
      {
        "title": "Sazzad MSH, Islam SM, Nayon SI, Ayon SS, Ahmed R, Haque MMU. 2026. First report of Colletotrichum siamense causing leaf blight on teak (Tectona grandis) in Bangladesh. Australasian Plant Pathology 55.",
        "year": 2026,
        "url": "https://doi.org/10.1007/s13313-026-01120-2"
      },
      {
        "title": "Sazzad MSH, Haque MMU, Ayon SS, Nayon SI, Islam SM, Ahmed R. 2026. First report of Diaporthe tulliensis causing leaf blight of Tectona grandis in Bangladesh. New Disease Reports 53(1), e70100.",
        "year": 2026,
        "url": "https://doi.org/10.1002/ndr2.70100"
      },
      {
        "title": "Chowdhury T, Ador MAH, Jui LA, Goon A, Haque MMU, Sazzad MSH, Dey B, Ahmed R. 2025. Mild and moderate drought stress enhances resilience in Syzygium cumini seedlings by modulating physio-biochemical attributes. Discover Plants 2, 1-17.",
        "year": 2025,
        "url": "https://doi.org/10.1007/s44372-025-00441-8"
      },
      {
        "title": "Rahman MA, Ador MAH, Ahmed R, Haque MAU. 2025. First report of Trichoderma asperellum causing leaf spot on Artocarpus heterophyllus in Bangladesh. Journal of Plant Pathology 107, 1271.",
        "year": 2025,
        "url": "https://doi.org/10.1007/s42161-025-01840-2"
      }
    ],
    "awards": [
      {
        "title": "Scholarship to conduct PhD at University of Valladolid, Spain"
      },
      {
        "title": "Erasmus Mundus scholarship to pursue MSc in European Forestry jointly at University of Eastern Finland, Finland and University of Lleida, Spain"
      }
    ]
  },
  {
    "id": "fac-17",
    "name": "Ms. Nusrat Islam",
    "designation": "Associate Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-17.webp",
    "email": "nusrat-fes@sust.edu",
    "phone": "+8801717113566",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/nusrat-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/nusrat-fes@sust.edu/cv",
    "researchAreas": [
      "Plant Ecology",
      "Butterfly Diversity",
      "Ecology"
    ],
    "bio": "Nusrat Islam serves as Associate Professor in the Department of Forestry & Environmental Science at Shahjalal University of Science and Technology, Sylhet. They are actively engaged in teaching, research and supervision of undergraduate and graduate students in the department.",
    "education": [
      {
        "degree": "M.Sc.(Thesis) in Forestry",
        "institute": "SUST"
      },
      {
        "degree": "B.Sc. (Hons) in Forestry",
        "institute": "SUST"
      }
    ],
    "teaching": [
      "Forest Tree Physiology",
      "Non Wood Forest Products",
      "Watershed, Water Resources and Wetland Management",
      "Forest Development Planning",
      "Plantation Silviculture",
      "Principles and Practices of Silviculture"
    ],
    "publicationsCount": 3,
    "selectedPublications": [
      {
        "title": "Analyzing Livelihood Sustainability of Climate Vulnerable Fishers: Insight from Bangladesh",
        "year": 2020
      },
      {
        "title": "Gupta K.K., Das S, Sonet S.S., Deb S.K., Islam N., Sarker S.K. Determining Tree-habitat Associations at the Raghunandan Hill Reserve Forest in Bangladesh. SUST Journal of Science & Technology 29(1):47-57 (2019)",
        "year": 2019
      },
      {
        "title": "Analysis of forest cover change at Khadimnagar National Park, Sylhet, Bangladesh, using Landsat TM and GIS data",
        "year": 2014
      }
    ],
    "awards": [
      {
        "title": "University Grand Commission of Bangladesh, Merit Scholarship"
      },
      {
        "title": "Shahjalal University of Science & Technology. Merit Scholarship"
      }
    ]
  },
  {
    "id": "fac-18",
    "name": "Mr. Anup Datta",
    "designation": "Assistant Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-18.webp",
    "email": "dattaanup-fes@sust.edu",
    "phone": "+8801786010404",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/dattaanup-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/dattaanup-fes@sust.edu/cv",
    "researchAreas": [
      "Functional Ecology",
      "Anthropogenic disturbance on forest",
      "Mangrove Ecology",
      "Wood Anatomy"
    ],
    "bio": "Anup Datta serves as Assistant Professor in the Department of Forestry & Environmental Science at Shahjalal University of Science and Technology, Sylhet. They are actively engaged in teaching, research and supervision of undergraduate and graduate students in the department.",
    "education": [
      {
        "degree": "M.Sc.( Thesis) in Forestry",
        "institute": "Department of Forestry & Environmental Science, Shahjalal University of Science and Technology, Sylhet",
        "duration": "2014"
      },
      {
        "degree": "B.Sc. (Honors) in Forestry",
        "institute": "Department of Forestry & Environmental Science, Shahjalal University of Science and Technology, Sylhet",
        "duration": "2012"
      }
    ],
    "teaching": [
      "Surveying and Drawing",
      "Forest Botany",
      "Botany (Minor course for Biochemistry and Molecular Biology Department.)",
      "Wood Seasoning and Preservation",
      "Principle and Practices of Silviculture",
      "Non-wood Forest products",
      "Forest Mensuration and Inventory"
    ],
    "publicationsCount": 10,
    "selectedPublications": [
      {
        "title": "Water use in mangroves: Understanding how wood day capacitance varies under salinity in the Sundarbans.",
        "year": 2026,
        "url": "https://doi.org/10.1016/j.envexpbot.2025.106303"
      },
      {
        "title": "Tree growth sensitivity to climate varies in moist and dry tropical forests in Bangladesh",
        "year": 2025,
        "url": "https://doi.org/10.1016/j.gecco.2025.e03903"
      },
      {
        "title": "Accounting intra-tree radial wood density variation estimates more accurate above ground mangrove biomass in the Sundarbans",
        "year": 2025,
        "url": "https://doi.org/10.1007/s10342-025-01784-3"
      },
      {
        "title": "Divergence of vessel diameter explains interspecific variation in hydraulic safety to salinity in the Sundarbans mangrove ecosystem",
        "year": 2025,
        "url": "https://doi.org/10.1111/1365-2435.14751"
      },
      {
        "title": "Towards data-driven tropical forest restoration: Uncovering spatial variation, interactions and historical management effects on nutrients along soil depth gradients",
        "year": 2024,
        "url": "https://doi.org/10.1016/j.scitotenv.2024.176756"
      },
      {
        "title": "Salinity regulates radial growth of Cynometra ramiflora L. in the Sundarbans mangrove ecosystem",
        "year": 2024,
        "url": "https://doi.org/10.1016/j.dendro.2024.126270"
      }
    ]
  },
  {
    "id": "fac-19",
    "name": "Mr. Md. Saifuzzaman Bhuiyan",
    "designation": "Assistant Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-19.webp",
    "email": "bhuiyan09-fes@sust.edu",
    "phone": "+8801628598829",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/bhuiyan09-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/bhuiyan09-fes@sust.edu/cv",
    "researchAreas": [
      "Remote Sensing and GIS",
      "Climate Change and Ecosystem functions",
      "Forest Management dynamics",
      "Plant Physiology",
      "Co-management"
    ],
    "bio": "Working as a faculty at Department of Forestry and Environmental Science, SUST. I used to dream working on the complex ecosystem functions and strategic biodiversity conservation from the very beginning of my graduation life. As an academic, now I have engaged myself in teaching and research for developing my understanding on contemporary nature and environmental issues.",
    "education": [
      {
        "degree": "M.Sc. (Thesis) in Forestry",
        "institute": "Department of Forestry & Environmental Science, Shahjalal University of Science and Technology, Sylhet",
        "duration": "2015"
      },
      {
        "degree": "B.Sc. (Honors) in Forestry",
        "institute": "Department of Forestry & Environmental Science, Shahjalal University of Science and Technology, Sylhet",
        "duration": "2013"
      }
    ],
    "teaching": [
      "Botany",
      "Forest Zoology",
      "Geology and Forest Soil",
      "Species Silviculture",
      "Agroforestry and Upland Farming System",
      "Forest Engineering",
      "Environmental Impact Assessment (EIA) and Auditing"
    ],
    "links": [
      {
        "label": "Google Scholar",
        "url": "https://scholar.google.com/citations?user=hIkLCk8AAAAJ&hl=en"
      },
      {
        "label": "ResearchGate",
        "url": "https://www.researchgate.net/profile/Md-Bhuiyan-15?ev=hdr_xprf"
      },
      {
        "label": "ORCID",
        "url": "https://orcid.org/0000-0001-7003-954X"
      },
      {
        "label": "LinkedIn",
        "url": "https://www.linkedin.com/in/md-saifuzzaman-bhuiyan-a26961387/"
      },
      {
        "label": "Scopus",
        "url": "https://www.scopus.com/authid/detail.uri?authorId=57222615486"
      }
    ],
    "publicationsCount": 8,
    "selectedPublications": [
      {
        "title": "Disturbance Effects on Plant Functional Traits, Beta Diversity, and Soil Properties in a Tropical Forest of Bangladesh. Small-scale Forestry.",
        "year": 2026,
        "url": "https://doi.org/10.1007/s11842-026-09619-8"
      },
      {
        "title": "Environmental drivers shaping plant functional trait diversity in tropical forests of Bangladesh. European Journal of Forest Research.",
        "year": 2025,
        "url": "https://doi.org/10.1007/s10342-025-01805-1"
      },
      {
        "title": "Regeneration potential and response to disturbance of native and exotic species: An analysis of diversity indices and spatial pattern. Ecological Frontiers.",
        "year": 2025,
        "url": "https://doi.org/10.1016/j.ecofro.2025.05.012"
      },
      {
        "title": "Patterns and Socioeconomic Drivers of Fuelwood Dependency in Households Adjacent to Rema-Kalenga Wildlife Sanctuary, Habiganj, Bangladesh. INECPAC, Turkiye.",
        "year": 2025,
        "url": "https://f0b47925-b258-4468-8ac3-68a0e42cc408.filesusr.com/ugd/614b1f_958011d4ed3540e490b522418afc3b21.pdf"
      },
      {
        "title": "Assessing vulnerability to cyclone hazards in the world’s largest mangrove forest, The Sundarbans: A geospatial analysis. Forests.",
        "year": 2024,
        "url": "https://doi.org/10.3390/f15101722"
      },
      {
        "title": "Salinity hazard drives the alteration of occupation, land use and ecosystem service in the coastal areas: Evidence from the south-western coastal region of Bangladesh. Heliyon.",
        "year": 2023,
        "url": "https://doi.org/10.1016/j.heliyon.2023.e18512"
      }
    ]
  },
  {
    "id": "fac-20",
    "name": "Mr. Abdur Rakib Bhuiyan",
    "designation": "Assistant Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-20.webp",
    "email": "a.uzzal88-fes@sust.edu",
    "phone": "+8801916937563",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/a.uzzal88-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/a.uzzal88-fes@sust.edu/cv",
    "researchAreas": [
      "Biodiversity conservation",
      "Ecology",
      "Community based biodiversity conservation",
      "Forest management",
      "Wildlife Ecology"
    ],
    "bio": "Abdur Rakib Bhuiyan serves as Assistant Professor in the Department of Forestry & Environmental Science at Shahjalal University of Science and Technology, Sylhet. They are actively engaged in teaching, research and supervision of undergraduate and graduate students in the department.",
    "education": [
      {
        "degree": "M.Sc.( Thesis) in Forestry",
        "institute": "Department of Forestry & Environmental Science, Shahjalal University of Science and Technology, Sylhet",
        "duration": "2015"
      },
      {
        "degree": "B.Sc. (Honors) in Forestry",
        "institute": "Department of Forestry & Environmental Science, Shahjalal University of Science and Technology, Sylhet",
        "duration": "2014"
      }
    ],
    "teaching": [
      "Tea, Coffee and Rubber",
      "Forest Development Planning"
    ],
    "publicationsCount": 1,
    "selectedPublications": [
      {
        "title": "Effect of transportation infrastructure on forest plant diversity and soil properties in Lawachara National Park, Bangladesh",
        "year": 2021
      }
    ]
  },
  {
    "id": "fac-21",
    "name": "Ms. Rabeya Sultana",
    "designation": "Assistant Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-21.webp",
    "email": "rabeya02-fes@sust.edu",
    "phone": "+8801672229303",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/rabeya02-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/rabeya02-fes@sust.edu/cv",
    "researchAreas": [
      "Ecosystem Ecology",
      "Biogeochemistry",
      "Climate Change"
    ],
    "bio": "plant physiology can\nundergo a significant reconfiguration due to interactions\nwith other members of their ecological community. Beneficial creatures may\nbenefit from this reconfiguration while opponents like infections or herbivores\nmay be discouraged. Understanding how such\necological interactions are influenced by environmental change and how we could\navoid harmful effects will become crucial in the future. The key\nfactors affecting the forest structure and dynamics, the relation between environmental\ngradients and plant distribution instigate my dedication and curiosity\nto raise new questions about biotic-abiotic interaction. As an ecologist, my research mostly focuses on understanding how this system works and how it reacts to climate change.",
    "education": [
      {
        "degree": "M. Sc in Forestry",
        "institute": ""
      },
      {
        "degree": "B. Sc. in Forestry",
        "institute": ""
      }
    ],
    "teaching": [
      "Forest Ecology",
      "Biodiversity Conservation",
      "Forest Harvesting",
      "Zoology"
    ],
    "publicationsCount": 4,
    "selectedPublications": [
      {
        "title": "Chowdhury, M. Q., S. K. Sarker, R. Sultana, A. Datta, M. S. R. Saimun and A. M. Rashid (2023). \"Synergistic effects of climate and salinity on radial growth of Excoecaria agallocha L. in the Sundarbans world heritage mangrove ecosystem.\" Estuarine, Coastal and Shelf Science 280: 108181.",
        "year": 2023,
        "url": "https://www.sciencedirect.com/science/article/abs/pii/S0272771422004395?dgcid=coauthor&fbclid=IwAR0SVTA8kGc8yt4aJOKvXNqedIAGr2SKU5JKqoAu9aT9IMqk0kbhTB8wow4"
      },
      {
        "title": "Sinha, B., Islam, M. M., Bhuiyan, F. H., Hasan, M. N., Kibria, M. G., Sultana, R., Prodhan, S. H., Hoque, H. (2022). Determination of Genetic Diversity among Local Mandarin Oranges (Citrus reticulata) Using Mature Seed Derived Calli through RAPD Markers. SUST Journal of Science and Technology, 32 (1), 43-53.",
        "year": 2022,
        "url": "https://journals.sust.edu/sustjst/archive/details/124"
      },
      {
        "title": "Natural Regeneration and Diversity of the Tree Species at Satchari National Park in Bangladesh",
        "year": 2021,
        "url": "https://journals.sus"
      },
      {
        "title": "Durability of three tropical timber species growing in Bangladesh to white-rot fungi",
        "year": 2021,
        "url": "http://links.springernature.com/f/a/eBs_aMSgrwqGpuEsvE5M5A~~/AABE5gA~/RgRivDiwP0QwaHR0cDovL3d3dy5zcHJpbmdlci5jb20vLS8yL0FYcFhqRUdCRjJmd1B0OVNYWFhkVwNzcGNCCmDVMAXbYDzxwJ1SFXJhYmV5YTAyLWZlc0BzdXN0LmVkdVgEAAAG5w~~"
      }
    ],
    "awards": [
      {
        "title": "Best Poster Presentation Award in International Conference on Advanced Agricultural Research, Sylhet Agricultural University, Bangladesh (2024).",
        "year": 2024
      }
    ]
  },
  {
    "id": "fac-22",
    "name": "Ms. Rahela Khatun",
    "designation": "Assistant Professor",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-22.webp",
    "email": "rahela-fes@sust.edu",
    "phone": "+8801794738298",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/rahela-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/rahela-fes@sust.edu/cv",
    "researchAreas": [
      "Watershed management",
      "Plant Diseases",
      "Soil Properties",
      "Genetic and Plant Breeding"
    ],
    "bio": "Rahela Khatun serves as Assistant Professor in the Department of Forestry & Environmental Science at Shahjalal University of Science and Technology, Sylhet. They are actively engaged in teaching, research and supervision of undergraduate and graduate students in the department.",
    "education": [
      {
        "degree": "M.Sc.( Thesis) in Forestry",
        "institute": "Department of Forestry & Environmental Science, Shahjalal University of Science and Technology, Sylhet"
      },
      {
        "degree": "B.Sc. (Honors) in Forestry",
        "institute": "Department of Forestry & Environmental Science, Shahjalal University of Science and Technology, Sylhet"
      }
    ],
    "teaching": [
      "Watershed, Water Resources and Wetland Management",
      "Forest Engineering",
      "Non-Timber Forest Products",
      "Forest Zoology"
    ],
    "publicationsCount": 6,
    "selectedPublications": [
      {
        "title": "Automated plant species identification from the stomata images using deep neural network: A study of selected mangrove and freshwater swamp forest tree species of Bangladesh.",
        "year": 2023,
        "url": "https://doi.org/10.1016/j.ecoinf.2023.102128"
      },
      {
        "title": "Identification, diversity and host specificity of the wood-decay fungi in major sawmill depots of north-eastern Bangladesh",
        "year": 2023,
        "url": "https://onlinelibrary.wiley.com/doi/10.1111/efp.12792"
      },
      {
        "title": "Comparative performance of four CNN-based deep learning variants in detecting Hispa pest, two fungal diseases, and NPK deficiency symptoms of rice (Oryza sativa)",
        "year": 2022,
        "url": "https://www.sciencedirect.com/science/article/abs/pii/S0168169922006494?via=ihub"
      },
      {
        "title": "Agar (Aquilaria agallocha Roxb.) based small-scale enterprises in Bangladesh: Management, production, marketing and role in socio-economic development.",
        "year": 2021,
        "url": "https://www.sciencedirect.com/science/article/pii/S2666719321000807"
      },
      {
        "title": "Characterisation and lethal dose determination of EMS induced mutation in Gallong jhum rice (Oryza sativa L.).",
        "year": 2021,
        "url": "https://journals.sust.edu/sustjst/archive/details/117"
      },
      {
        "title": "Evaluation of phenotypic and genotypic variation of local pumpkin germplasm for improved breeding purposes",
        "year": 2021,
        "url": "https://journals.sust.edu/sustjst/archive/details/111"
      }
    ],
    "awards": [
      {
        "title": "Prime Minister Gold Medal Award 2017",
        "year": 2017
      }
    ]
  },
  {
    "id": "fac-23",
    "name": "Mr. Md. Shamim Reza Saimun",
    "designation": "Lecturer",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-23.webp",
    "email": "saimun-fes@sust.edu",
    "phone": "+8801521236118",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/saimun-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/saimun-fes@sust.edu/cv",
    "researchAreas": [
      "Remote Sensing & GIS",
      "Forest Ecology",
      "Biodiversity",
      "Climate Change",
      "Mangrove Ecology"
    ],
    "bio": "I am a Lecturer at Shahjalal University of Science and Technology, specializing in Forestry, Remote Sensing, and Geographic Information Systems (GIS). Prior to my current role, I served as a Scientific Officer at the Bangladesh Space Research and Remote Sensing Organization (SPARRSO), where I honed my skills in GIS applications, remote sensing technologies, and data-driven decision-making for environmental and resource management. My passion lies in leveraging cutting-edge Remote Sensing and GIS technologies to address pressing ecological challenges. Currently, my research focuses on applying these tools to study ecosystem dynamics, biodiversity conservation, and sustainable land-use planning. Through my work, I aim to contribute to the advancement of ecological science while continuously expanding my technical and analytical capabilities.",
    "education": [
      {
        "degree": "M.Sc (Thesis) in Forestry",
        "institute": "Shahjalal University of Science and Technology, Bangladesh"
      },
      {
        "degree": "B.Sc (Hons) in Forestry",
        "institute": "Shahjalal University of Science and Technology, Bangladesh"
      }
    ],
    "teaching": [
      "Dendrology and Species Silviculture",
      "Forest Harvesting",
      "Remote Sensing and Geographic Information System"
    ],
    "links": [
      {
        "label": "Google Scholar",
        "url": "https://scholar.google.com/citations?user=OHS4llcAAAAJ&hl=en"
      },
      {
        "label": "ResearchGate",
        "url": "https://www.researchgate.net/profile/Md-Shamim-Saimun?ev=hdr_xprf"
      },
      {
        "label": "ORCID",
        "url": "https://orcid.org/0000-0001-7729-9205"
      },
      {
        "label": "LinkedIn",
        "url": "https://www.linkedin.com/in/srsaimun/"
      },
      {
        "label": "Scopus",
        "url": "https://www.scopus.com/authid/detail.uri?authorId=57224566399"
      }
    ],
    "publicationsCount": 20,
    "selectedPublications": [
      {
        "title": "Spatial insights on edge-driven degradation in protected tropical forests of Bangladesh",
        "year": 2026,
        "url": "https://doi.org/10.1016/j.indic.2026.101483"
      },
      {
        "title": "Detection of Kankra (Bruguiera gymnorhiza) tree expansion in the northern Sundarbans",
        "year": 2026,
        "url": "https://doi.org/10.1038/s41598-026-65011-8"
      },
      {
        "title": "Trait-based evidence of salinity-induced functional diversity loss in mangroves: Implications for ecosystem resilience",
        "year": 2026,
        "url": "https://doi.org/10.1002/eap.70191"
      },
      {
        "title": "Water use in mangroves: Understanding how wood day capacitance varies under salinity in the Sundarbans",
        "year": 2026,
        "url": "https://doi.org/10.1016/j.envexpbot.2025.106303"
      },
      {
        "title": "Different Roles of Mangrove Ecosystems and Their Significance",
        "year": 2026,
        "url": "https://doi.org/10.1007/978-3-032-16668-5_2"
      },
      {
        "title": "The role of climate in shaping vegetation dynamics and carbon dioxide fluxes in global protected forest landscapes",
        "year": 2025,
        "url": "https://doi.org/10.1016/j.jenvman.2025.127916"
      }
    ],
    "awards": [
      {
        "title": "Chirag Roy Memorial Scholarship (2016) awarded by Creative Conservation Alliance",
        "year": 2016
      },
      {
        "title": "Prime Minister Gold Medal (2018) awarded by UGC",
        "year": 2018
      },
      {
        "title": "NST Fellowship (2019) awarded by Ministry of Science and Technology",
        "year": 2019
      }
    ]
  },
  {
    "id": "fac-24",
    "name": "Ms. Farhana Bintay Hye",
    "designation": "Lecturer",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-24.webp",
    "email": "farhana-fes@sust.edu",
    "phone": "+8801949824158",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/farhana-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/farhana-fes@sust.edu/cv",
    "researchAreas": [
      "Climate-Resilient Agriculture",
      "Sustainable Agroforestry",
      "GIS & Conservation Planning",
      "Ecological Restoration",
      "Biochar & Soil Remediation",
      "Community Resource Governance"
    ],
    "researchSummary": "Climate-Resilient Agriculture and Natural Resource Management: Exploring adaptive agricultural practices and forestry-based interventions to combat climate change and promote community resilience. Sustainable Forestry and Agroforestry Systems: Focused on the integration of forestry practices that support ecological balance, biodiversity, and sustainable land use. Geospatial Technologies and Data Analysis for Conservation Planning: Utilizing GIS and remote sensing in environmental research and policy development, with a focus on mapping and decision-support systems. Ecological Restoration and Biodiversity Conservation: Engaged in species conservation efforts, particularly of endangered species like the Black Soft-Shell Turtle, and habitat restoration initiatives. Biochar Applications in Soil Health and Environmental Remediation: Investigating the efficacy of biochar in enhancing soil fertility, crop productivity, and mitigating arsenic contamination in tropical soils. Community-based Natural Resource Governance and Livelihoods: Assessing participatory models for resource management that integrate socio-economic empowerment and environmental stewardship.",
    "bio": "Farhana Bintay Hye is a dedicated academic and emerging environmental researcher currently serving as a Lecturer in the Department of Forestry and Environmental Science at Shahjalal University of Science and Technology (SUST), Sylhet, Bangladesh. She earned both her B.Sc. (2015) and M.Sc. (2017) degrees in Forestry from SUST, graduating with distinction (CGPAs of 3.70 and 3.97, respectively), and receiving multiple academic awards, including UGC Merit and University Merit Scholarships.Her research interests converge on sustainable land use, soil restoration, and climate-resilient agriculture, with a particular focus on the application of biochar technologies to improve soil fertility, mitigate arsenic contamination, and enhance crop performance in tropical agroecosystems. Ms. Hye has led and contributed to numerous research projects as Principal and Co-Investigator, including collaborations with international faculty such as Dr. Nigel Gale from the University of Guelph. Her published works include peer-reviewed articles on the impact of biochar on Oryza sativa and soil nutrient dynamics, and a conservation-focused study on the endangered Black Soft-Shell Turtle (Nilssonia nigricans).In parallel to her academic pursuits, she has accrued over four years of field and technical experience in Monitoring, Evaluation, Accountability, and Learning (MEAL), data systems, and program quality assurance across interdisciplinary development sectors—ranging from public health and nutrition to climate resilience and community livelihoods. Her tenure with Save the Children International and Friends in Village Development Bangladesh (FIVDB) highlights her proficiency in managing MIS platforms, conducting data quality assessments, designing digital survey tools (ODK/KoboCollect), and facilitating capacity-building initiatives for grassroots stakeholders.Farhana is also a strong advocate for interdisciplinary knowledge exchange. She has actively participated in regional conferences and workshops addressing ICT in development, species conservation, and geospatial technologies. Her academic engagements are complemented by her experience as a research assistant at the SUST Research Centre and her field internship with the Bangladesh Forest Department, where she gained hands-on exposure to forest management and afforestation programs.Equipped with robust analytical skills, proficiency in GIS and statistical tools (R, SPSS, XLSTAT), and a demonstrated ability to integrate research with development practice, Farhana Bintay Hye stands out as a promising scholar committed to addressing ecological challenges and contributing to evidence-based policy and practice in environmental science.",
    "education": [
      {
        "degree": "M.Sc. (Thesis) in Forestry",
        "institute": "Shahjalal University of Science and Technology, Sylhet, Bangladesh"
      },
      {
        "degree": "B.Sc. in Forestry",
        "institute": "Shahjalal University of Science and Technology, Sylhet, Bangladesh"
      }
    ],
    "teaching": [
      "Forest Based Industries and Community Development",
      "Forest Engineering",
      "Land Use Planning and Management"
    ],
    "links": [
      {
        "label": "Google Scholar",
        "url": "https://scholar.google.com/citations?authuser=1&user=6TjPBP8AAAAJ"
      },
      {
        "label": "ResearchGate",
        "url": "https://www.researchgate.net/profile/Farhana-Bintayhye"
      },
      {
        "label": "ORCID",
        "url": "https://orcid.org/0000-0002-7816-1686"
      },
      {
        "label": "LinkedIn",
        "url": "https://www.linkedin.com/in/farhanabintayhye/"
      }
    ],
    "publicationsCount": 4,
    "selectedPublications": [
      {
        "title": "Biochar Mitigates Arsenic Phytotoxicity and Improves Crop Performance in Iron-Rich Tropical Soils",
        "year": 2026,
        "url": "https://onlinelibrary.wiley.com/doi/10.1002/pei3.70139"
      },
      {
        "title": "Assessing Suitable Tree Species for Biochar Production and Their Performance in Enriching Soil Quality and Plant Growth of Oryza sativa L. and Acacia auriculiformis A. Cunn. Ex Benth.",
        "year": 2025,
        "url": "https://doi.org/10.9734/ajraf/2025/v11i2384"
      },
      {
        "title": "Effect of biochar on seed germination, early growth of Oryza sativa L. and soil nutrients.",
        "year": 2018,
        "url": "https://doi.org/10.22271/tpr.2018.v5.i3.042"
      },
      {
        "title": "Conservation Status of Black Soft-Shell Turtle (Nilssonia nigricans) in Bangladesh. 2018, Journal of Wildlife Research 6(2): 12-16",
        "year": 2018,
        "url": "https://www.researchgate.net/publication/327120478_Conservation_Status_of_Black_Soft_Shell_Turtle_Nilssonia_nigricans_in_Bangladesh"
      }
    ],
    "awards": [
      {
        "title": "Research Grant, (2018), SUST Research Centre, Shahjalal University of Science and Technology",
        "year": 2018
      },
      {
        "title": "Independent Research Grant, (2016), Nigel Gale, Director of Cultivation, Green Relief Inc. Special Graduate",
        "year": 2016
      },
      {
        "title": "Best Research Proposal Award, (2016), Department of Forestry and Environmental Science, SUST",
        "year": 2016
      },
      {
        "title": "UGC Merit Scholarship (2012-2015)",
        "year": 2015
      },
      {
        "title": "University Merit Scholarship (Total 9) during BSc (Hons.) (2012-2015)",
        "year": 2015
      },
      {
        "title": "Mokbul Trust Merit Scholarship during BSc (Hons.) (2012-2015)",
        "year": 2015
      },
      {
        "title": "Government of Bangladesh Merit Scholarship for Secondary School Certificate Examination (2010-2015)",
        "year": 2015
      },
      {
        "title": "Technical Seminar on Cost of the Diet study at Pan Pacific Sonargaon, Dhaka, at Suchana programme, Save the Children Internatrional."
      }
    ]
  },
  {
    "id": "fac-25",
    "name": "Ms. Nilima Ferdous",
    "designation": "Lecturer",
    "availabilityLabel": "On Duty",
    "photoUrl": "assets/faculty/fac-25.webp",
    "email": "nilima-fes@sust.edu",
    "phone": "+8801680254406",
    "office": "Academic Building E, SUST, Sylhet-3114",
    "profileUrl": "https://alpha.sust.edu/dept/fes/nilima-fes@sust.edu",
    "cvUrl": "https://alpha.sust.edu/dept/fes/nilima-fes@sust.edu/cv",
    "researchAreas": [
      "Remote sensing and GIS",
      "Biodiversity Conservation",
      "Climate Change"
    ],
    "bio": "I have completed my graduation project research on Butterfly community structure along environmental gradients in a tropical forest in Bangladesh (Satchari National Park). My MSc thesis was on Estimating the Land Use Changes of Ratargul Fresh Water Swamp Forest, Sylhet, Bangladesh.",
    "education": [
      {
        "degree": "M.Sc.( Thesis) in Forestry",
        "institute": "Department of Forestry & Environmental Science, Shahjalal University of Science and Technology, Sylhet"
      },
      {
        "degree": "B.Sc. (Honors) in Forestry",
        "institute": "Department of Forestry & Environmental Science, Shahjalal University of Science and Technology, Sylhet"
      }
    ],
    "teaching": [
      "Forest Zoology",
      "Watershed",
      "Water Resource",
      "and Wetland Management"
    ],
    "publicationsCount": 0,
    "awards": [
      {
        "title": "University Merit Scholarship (2011-2014)",
        "year": 2014
      }
    ]
  }
];
