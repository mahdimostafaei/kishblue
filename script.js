// ==========================================
// 1. STATE & RECALIBRATED 25-PHASE KISH DATABASE
// ==========================================

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzOSDAHWX-msr-2GV1Jp5bvyjvAeYPEKK49jwcOt6qw8NOEoP5h5gu7O3KpvTdpzlA3/exec';

let allProperties = [];
let currentMode = 'buy';
let activeQuickChip = 'all';
let isUserLoggedIn = false;
let mapDisplayMode = 'radar';
let selectedPropertyId = null;
let activeModalProperty = null;
let isMapExpanded = false;

// Interactive Polygon Calibrator State
let isCalibrationMode = false;
let calibrationPoints = [];

// Default Island View (Centered so full Kish Island fits cleanly)
const KISH_DEFAULT_CENTER = [26.538, 53.978];
const KISH_DEFAULT_ZOOM = 13;

let kishMap = null;
let polygonLayers = {};
let markerLayers = [];

// Recalibrated Macro-District Cluster Pill Centers
const MACRO_CENTERS = {
    "Sadaf": [26.542, 54.008],
    "Mirmohanna": [26.563, 53.956],
    "Nobonyad": [26.557, 53.941],
    "Damoon": [26.558, 53.992],
    "City Center": [26.543, 54.022],
    "Coastal Strip": [26.526, 54.027]
};

// ==========================================
// UPGRADED MULTI-VERTEX CONTOURED POLYGONS (6–10 POINTS PER PHASE)
// Shaped to follow Kish Island's actual boulevards, squares & coastline curves
// ==========================================

const NEIGHBORHOOD_MAP = {
    // --- SHAHRAK-E SADAF (Bounded by Daliran Sq, Tehran Blvd, Danesh Blvd, Amirkabir Blvd & Persian Gulf Hwy) ---
    "N-SADAF-01": {
        name: "Sadaf - Phase 1", persian: "شهرک صدف - فاز ۱", macro: "Sadaf",
        subZones: "Banan St., Basak Center, 200-Vahedi, Near Morvarid Mall", age: "12-20 Yrs", minPrice: 15000000000, maxPrice: 45000000000,
        osmStreets: ["بنان", "بساک", "مروارید"],
        coords: [
            [26.5422, 54.0088], [26.5458, 54.0092], [26.5468, 54.0118],
            [26.5462, 54.0152], [26.5432, 54.0158], [26.5414, 54.0132], [26.5414, 54.0098]
        ]
    },
    "N-SADAF-02": {
        name: "Sadaf - Phase 2", persian: "شهرک صدف - فاز ۲", macro: "Sadaf",
        subZones: "Hirmand, Harirroud, Farrokhi, Golestan Sq.", age: "5-15 Yrs", minPrice: 22000000000, maxPrice: 95000000000,
        osmStreets: ["هیرمند", "هریرود", "فرخی", "گلستان"],
        coords: [
            [26.5466, 54.0032], [26.5502, 54.0038], [26.5516, 54.0068],
            [26.5514, 54.0112], [26.5488, 54.0128], [26.5466, 54.0118], [26.5460, 54.0072]
        ]
    },
    "N-SADAF-03": {
        name: "Sadaf - Phase 3", persian: "شهرک صدف - فاز ۳", macro: "Sadaf",
        subZones: "Zagros St., Danesh Blvd.", age: "8-15 Yrs", minPrice: 16000000000, maxPrice: 50000000000,
        osmStreets: ["زاگرس", "دانش"],
        coords: [
            [26.5428, 54.0016], [26.5462, 54.0014], [26.5472, 54.0036],
            [26.5464, 54.0084], [26.5426, 54.0086], [26.5422, 54.0048]
        ]
    },
    "N-SADAF-04": {
        name: "Sadaf - Phase 4", persian: "شهرک صدف - فاز ۴", macro: "Sadaf",
        subZones: "Damavand, Alvand, Kerman, Khorasan, Azarbayjan, Kouy-e Erfan", age: "6-15 Yrs", minPrice: 16000000000, maxPrice: 55000000000,
        osmStreets: ["دماوند", "الوند", "کرمان", "خراسان", "آذربایجان", "عرفان"],
        coords: [
            [26.5386, 53.9962], [26.5428, 53.9952], [26.5458, 53.9968],
            [26.5460, 54.0012], [26.5424, 54.0015], [26.5388, 54.0012], [26.5382, 53.9985]
        ]
    },
    "N-SADAF-05": {
        name: "Sadaf - Phase 5", persian: "شهرک صدف - فاز ۵", macro: "Sadaf",
        subZones: "Phase 5 Residential Pockets", age: "5-12 Yrs", minPrice: 18000000000, maxPrice: 60000000000,
        osmStreets: ["فاز ۵ صدف", "صدف"],
        coords: [
            [26.5374, 54.0016], [26.5422, 54.0016], [26.5424, 54.0078],
            [26.5382, 54.0078], [26.5372, 54.0048]
        ]
    },
    "N-SADAF-06": {
        name: "Sadaf - Phase 6", persian: "شهرک صدف - فاز ۶", macro: "Sadaf",
        subZones: "Delnavazan St., Central Sadaf Pockets", age: "5-12 Yrs", minPrice: 18000000000, maxPrice: 65000000000,
        osmStreets: ["دلنوازان"],
        coords: [
            [26.5366, 54.0080], [26.5412, 54.0082], [26.5412, 54.0142],
            [26.5372, 54.0146], [26.5362, 54.0112]
        ]
    },
    "N-SADAF-07": {
        name: "Sadaf - Phase 7 (Sadaf-e Sahar)", persian: "شهرک صدف - فاز ۷", macro: "Sadaf",
        subZones: "Zones 1-3, Negin-e Shomali, Amirkabir Blvd., Kametina", age: "New (0-5 Yrs)", minPrice: 25000000000, maxPrice: 90000000000,
        osmStreets: ["امیرکبیر", "نگین شمالی"],
        coords: [
            [26.5318, 54.0092], [26.5362, 54.0094], [26.5364, 54.0155],
            [26.5352, 54.0188], [26.5316, 54.0182], [26.5312, 54.0135]
        ]
    },

    // --- MIRMOHANNA & SAFIN (Curved Northwest Coastal Cape & Phases A, F, G) ---
    "N-MIR-SAFIN": {
        name: "Old Safin & Phases B-E", persian: "سفین قدیم و فازهای B-E", macro: "Mirmohanna",
        subZones: "Arab Bazaar, Mehrab St., Coastal Safin, Phases B, C, D, E", age: "15-25+ Yrs", minPrice: 7000000000, maxPrice: 20000000000,
        osmStreets: ["سفین", "مهراب", "بازار عربها"],
        coords: [
            [26.5668, 53.9475], [26.5705, 53.9488], [26.5722, 53.9535],
            [26.5718, 53.9605], [26.5698, 53.9645], [26.5666, 53.9638], [26.5664, 53.9555]
        ]
    },
    "N-MIR-A1": {
        name: "Mirmohanna - Phase A1", persian: "میرمهنا - فاز A1", macro: "Mirmohanna",
        subZones: "Acacia Complex, Khatam St.", age: "12-18 Yrs", minPrice: 9000000000, maxPrice: 18000000000,
        osmStreets: ["خاتم", "آکاسیا"],
        coords: [
            [26.5616, 53.9586], [26.5662, 53.9588], [26.5664, 53.9658],
            [26.5632, 53.9668], [26.5614, 53.9642]
        ]
    },
    "N-MIR-A2": {
        name: "Mirmohanna - Phase A2", persian: "میرمهنا - فاز A2", macro: "Mirmohanna",
        subZones: "Sarv-e Hashtom Axis", age: "10-16 Yrs", minPrice: 9500000000, maxPrice: 20000000000,
        osmStreets: ["سرو هشتم", "سرو"],
        coords: [
            [26.5616, 53.9512], [26.5662, 53.9514], [26.5662, 53.9584],
            [26.5616, 53.9584], [26.5614, 53.9548]
        ]
    },
    "N-MIR-A3": {
        name: "Mirmohanna - Phase A3", persian: "میرمهنا - فاز A3", macro: "Mirmohanna",
        subZones: "A3 Residential Blocks", age: "8-15 Yrs", minPrice: 10000000000, maxPrice: 22000000000,
        osmStreets: ["میرمهنا"],
        coords: [
            [26.5572, 53.9562], [26.5614, 53.9562], [26.5614, 53.9642],
            [26.5582, 53.9648], [26.5570, 53.9612]
        ]
    },
    "N-MIR-F1": {
        name: "Mirmohanna - Phase F1", persian: "میرمهنا - فاز F1", macro: "Mirmohanna",
        subZones: "Yasaman Streets, F1 Low-Rise Blocks", age: "3-10 Yrs", minPrice: 11000000000, maxPrice: 24000000000,
        osmStreets: ["یاسمن"],
        coords: [
            [26.5612, 53.9446], [26.5658, 53.9452], [26.5660, 53.9510],
            [26.5614, 53.9510], [26.5610, 53.9478]
        ]
    },
    "N-MIR-F2": {
        name: "Mirmohanna - Phase F2", persian: "میرمهنا - فاز F2", macro: "Mirmohanna",
        subZones: "Narges Streets, 200-Sqm Villa Plots", age: "New to 8 Yrs", minPrice: 16000000000, maxPrice: 38000000000,
        osmStreets: ["نرگس"],
        coords: [
            [26.5566, 53.9492], [26.5612, 53.9492], [26.5612, 53.9558],
            [26.5568, 53.9558], [26.5564, 53.9525]
        ]
    },
    "N-MIR-F3": {
        name: "Mirmohanna - Phase F3", persian: "میرمهنا - فاز F3", macro: "Mirmohanna",
        subZones: "Shaghayegh Streets, Large Luxury Villa Plots (350-440m)", age: "New (0-5 Yrs)", minPrice: 35000000000, maxPrice: 85000000000,
        osmStreets: ["شقایق"],
        coords: [
            [26.5524, 53.9486], [26.5564, 53.9488], [26.5564, 53.9558],
            [26.5526, 53.9558], [26.5522, 53.9520]
        ]
    },
    "N-MIR-G": {
        name: "Mirmohanna - Phase G", persian: "میرمهنا - فاز G", macro: "Mirmohanna",
        subZones: "Setareh Streets, Phase G Residential Blocks", age: "2-8 Yrs", minPrice: 8500000000, maxPrice: 20000000000,
        osmStreets: ["ستاره"],
        coords: [
            [26.5524, 53.9560], [26.5568, 53.9560], [26.5568, 53.9634],
            [26.5532, 53.9638], [26.5522, 53.9598]
        ]
    },

    // --- SHAHRAK-E NOBONYAD (Wedge-shaped phases along Niloufar, Chehelard, Bisotun & Kandovan) ---
    "N-NOB-01": {
        name: "Nobonyad - Phase 1", persian: "شهرک نوبنیاد - فاز ۱", macro: "Nobonyad",
        subZones: "Niloufar (1-8), Baharestan, Sedr Streets, Nobonyad Bazaar", age: "6-14 Yrs", minPrice: 10000000000, maxPrice: 26000000000,
        osmStreets: ["نیلوفر", "بهارستان", "سدر"],
        coords: [
            [26.5618,53.9437],[26.5613,53.9413],[26.5613,53.9413],[26.5588,53.9422],
            [26.5583,53.9503],[26.5583,53.9503],[26.5626,53.9496],[26.5626,53.9496]
        ]
    },
    "N-NOB-02": {
        name: "Nobonyad - Phase 2", persian: "شهرک نوبنیاد - فاز ۲", macro: "Nobonyad",
        subZones: "Banafsheh, Ayandeh Saz, University Axis", age: "4-10 Yrs", minPrice: 12000000000, maxPrice: 32000000000,
        osmStreets: ["بنفشه", "نوبنیاد"],
        coords: [
            [26.5518, 53.9372], [26.5562, 53.9374], [26.5564, 53.9462],
            [26.5532, 53.9468], [26.5516, 53.9432], [26.5514, 53.9395]
        ]
    },
    "N-NOB-03": {
        name: "Nobonyad - Phase 3", persian: "شهرک نوبنیاد - فاز ۳", macro: "Nobonyad",
        subZones: "Kandovan (1-5), Chehelard, Bisotun, Meydan-e Arian, Parand", age: "New (0-7 Yrs)", minPrice: 15000000000, maxPrice: 48000000000,
        osmStreets: ["کندوان", "بیستون", "چهل ستون", "آرین", "پرند"],
        coords: [
            [26.5566, 53.9332], [26.5614, 53.9336], [26.5636, 53.9368],
            [26.5632, 53.9418], [26.5566, 53.9420], [26.5562, 53.9375]
        ]
    },

    // --- SHAHRAK-E DAMOON (Curved North-Central Coastline along Vesal Blvd) ---
    "N-DAMOON-01": {
        name: "Damoon Saheli 1 & 2", persian: "شهرک ساحلی دامون", macro: "Damoon",
        subZones: "Damoon Darya, Vesal Shomali, Coastal Villas", age: "New to 10 Yrs", minPrice: 30000000000, maxPrice: 150000000000,
        osmStreets: ["دامون ساحلی", "وصال"],
        coords: [
            [26.5592, 53.9822], [26.5642, 53.9835], [26.5656, 53.9895],
            [26.5645, 53.9968], [26.5594, 53.9978], [26.5588, 53.9905]
        ]
    },
    "N-DAMOON-02": {
        name: "Damoon Kish Air", persian: "دامون کیش‌ایر", macro: "Damoon",
        subZones: "Near Damoon Mall & Vesal Blvd.", age: "5-12 Yrs", minPrice: 20000000000, maxPrice: 65000000000,
        osmStreets: ["دامون", "وصال"],
        coords: [
            [26.5526, 53.9882], [26.5588, 53.9884], [26.5590, 53.9985],
            [26.5552, 54.0012], [26.5524, 53.9975]
        ]
    },

    // --- CITY CENTER & EASTERN/SOUTHEASTERN COASTLINE ---
    "N-CENTER-PARDIS": {
        name: "City Center & Pardis", persian: "مرکز شهر و پردیس", macro: "City Center",
        subZones: "Ferdowsi Blvd, Roudaki, Khaneh Gostar, Setareh Kish, Diplomat", age: "8-18 Yrs", minPrice: 15000000000, maxPrice: 55000000000,
        osmStreets: ["فردوسی", "رودکی", "پردیس", "سیری"],
        coords: [
            [26.5382, 54.0165], [26.5488, 54.0168], [26.5494, 54.0238],
            [26.5448, 54.0274], [26.5380, 54.0265], [26.5376, 54.0210]
        ]
    },
    "N-COAST-AFTAB": {
        name: "Shahr-e Aftab", persian: "شهر آفتاب", macro: "Coastal Strip",
        subZones: "Old & New Seafront Blocks", age: "New to 15 Yrs", minPrice: 18000000000, maxPrice: 90000000000,
        osmStreets: ["شهر آفتاب", "آفتاب"],
        coords: [
            [26.5496, 54.0128], [26.5558, 54.0135], [26.5566, 54.0195],
            [26.5532, 54.0235], [26.5494, 54.0218]
        ]
    },
    "N-COAST-DIDANIHA": {
        name: "Shahrak-e Didaniha", persian: "شهرک دیدنی‌ها", macro: "Coastal Strip",
        subZones: "Beachside Independent Villas", age: "5-15 Yrs", minPrice: 45000000000, maxPrice: 140000000000,
        osmStreets: ["دیدنیها", "دیدنی ها"],
        coords: [
            [26.5292, 54.0206], [26.5364, 54.0208], [26.5366, 54.0285],
            [26.5328, 54.0314], [26.5290, 54.0292]
        ]
    },
    "N-COAST-MARJAN": {
        name: "Marjan Beachfront Towers", persian: "برج‌های ساحلی مرجان", macro: "Coastal Strip",
        subZones: "Karaneh, Twin Towers, Royaye Kish, Roma, Marjan Blvd", age: "New to 12 Yrs", minPrice: 30000000000, maxPrice: 200000000000,
        osmStreets: ["مرجان", "کرانه", "برج های دوقلو"],
        coords: [
            [26.5162, 54.0222], [26.5288, 54.0224], [26.5288, 54.0315],
            [26.5235, 54.0362], [26.5178, 54.0345], [26.5156, 54.0282]
        ]
    },
    "N-COAST-DEHKADEH": {
        name: "Dehkadeh Saheli", persian: "دهکده ساحلی", macro: "Coastal Strip",
        subZones: "Coastal Blocks & Suites", age: "10-18 Yrs", minPrice: 14000000000, maxPrice: 45000000000,
        osmStreets: ["دهکده ساحلی"],
        coords: [
            [26.5064, 54.0042], [26.5146, 54.0046], [26.5152, 54.0155],
            [26.5112, 54.0192], [26.5062, 54.0165], [26.5056, 54.0095]
        ]
    }
};

// Load any custom calibrated polygons saved in browser localStorage
try {
    const savedCustomCoords = localStorage.getItem('kishblue_custom_polygons');
    if (savedCustomCoords) {
        const parsed = JSON.parse(savedCustomCoords);
        Object.keys(parsed).forEach(k => {
            if (NEIGHBORHOOD_MAP[k] && Array.isArray(parsed[k]) && parsed[k].length >= 3) {
                NEIGHBORHOOD_MAP[k].coords = parsed[k];
            }
        });
    }
} catch (e) {
    console.warn("Could not load custom polygons from localStorage:", e);
}

const LEGACY_ID_MAP = { "N-01": "N-SADAF-01" };

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

function normalizeHoodId(rawId) {
    if (!rawId) return "N-SADAF-01";
    const trimmed = String(rawId).trim();
    return LEGACY_ID_MAP[trimmed] || trimmed;
}

function formatCurrency(number) {
    const num = Number(number);
    if (!num || isNaN(num)) return "0";
    return num.toLocaleString();
}

function formatShortBillions(number) {
    const num = Number(number);
    if (!num || isNaN(num)) return "0";
    const billions = num / 1000000000;
    return billions >= 1 ? `${billions.toFixed(billions % 1 === 0 ? 0 : 1)}B` : formatCurrency(num);
}

function getBuildingAgeLabel(constructionYear) {
    const year = parseInt(constructionYear, 10);
    if (!year || isNaN(year)) return "Verified";
    const currentGregorian = new Date().getFullYear();
    const currentSolarHijri = currentGregorian - 621;
    const age = (year >= 1300 && year <= 1450) ? (currentSolarHijri - year) : (currentGregorian - year);
    return age <= 0 ? "Brand New" : `${age} yrs old`;
}

// ==========================================
// 3. INITIALIZE LEAFLET MAP, SCALE & CALIBRATOR
// ==========================================

function initKishMap() {
    const mapContainer = document.getElementById('kish-map');
    if (!mapContainer || typeof L === 'undefined') return;

    kishMap = L.map('kish-map', {
        center: KISH_DEFAULT_CENTER,
        zoom: KISH_DEFAULT_ZOOM,
        minZoom: 12,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false
    });

    // Bottom-right + / - zoom buttons & bottom-left metric scale bar
    L.control.zoom({ position: 'bottomright' }).addTo(kishMap);
    L.control.scale({ position: 'bottomleft', metric: true, imperial: false, maxWidth: 110 }).addTo(kishMap);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(kishMap);

    Object.keys(NEIGHBORHOOD_MAP).forEach(hoodId => {
        const hood = NEIGHBORHOOD_MAP[hoodId];
        const poly = L.polygon(hood.coords, {
            color: '#0284c7',
            weight: 1.4,
            fillColor: '#38bdf8',
            fillOpacity: 0.18
        }).addTo(kishMap);

        poly.on('click', (e) => {
            if (isCalibrationMode) {
                recordCalibrationPoint(e.latlng);
                return;
            }
            selectedPropertyId = null;
            const selectEl = document.getElementById('neighborhood');
            if (selectEl) {
                if (selectEl.value === hoodId) {
                    selectEl.value = "";
                    kishMap.flyTo(KISH_DEFAULT_CENTER, KISH_DEFAULT_ZOOM, { duration: 0.5 });
                } else {
                    selectEl.value = hoodId;
                    kishMap.flyToBounds(poly.getBounds(), { padding: [60, 60], maxZoom: 15, duration: 0.5 });
                }
            }
            handleSearch();
        });

        polygonLayers[hoodId] = poly;
    });

    kishMap.on('click', (e) => {
        if (isCalibrationMode) {
            recordCalibrationPoint(e.latlng);
        }
    });

    kishMap.on('zoomend', () => {
        const selectEl = document.getElementById('neighborhood');
        const budgetEl = document.getElementById('max-budget');
        const selectedLocation = selectEl ? selectEl.value : "";
        const maxBudget = (budgetEl && budgetEl.value) ? parseInt(budgetEl.value, 10) : Infinity;
        const filtered = getFilteredProperties();
        updateMapLayers(filtered, maxBudget, selectedLocation);
    });
}

// ==========================================
// 4. EXPAND MAP, FOOTER LINKS & CALIBRATOR
// ==========================================

function toggleMapExpand() {
    isMapExpanded = !isMapExpanded;
    document.body.classList.toggle('map-expanded', isMapExpanded);

    const expandIcon = document.getElementById('icon-expand');
    const collapseIcon = document.getElementById('icon-collapse');
    if (expandIcon) expandIcon.style.display = isMapExpanded ? 'none' : 'inline';
    if (collapseIcon) collapseIcon.style.display = isMapExpanded ? 'inline' : 'none';

    if (kishMap) {
        setTimeout(() => {
            kishMap.invalidateSize({ animate: true });
        }, 280);
    }
}

function fitFullKishIsland() {
    selectedPropertyId = null;
    if (kishMap) {
        kishMap.flyTo(KISH_DEFAULT_CENTER, KISH_DEFAULT_ZOOM, { duration: 0.6 });
    }
    handleSearch();
}

function showMapInfoPopup(type) {
    if (type === 'shortcuts') {
        alert(
            "Keyboard Shortcuts:\n\n" +
            "• M : Expand / Collapse full-screen map\n" +
            "• Esc : Close modal or reset focused property\n" +
            "• + / - : Zoom map in or out"
        );
    } else if (type === 'terms') {
        alert(
            "KishBlue GIS & Map Terms:\n\n" +
            "• Street tiles © OpenStreetMap contributors.\n" +
            "• Phase polygons represent approximate real estate boundaries across Kish Island."
        );
    } else if (type === 'report') {
        const startCalib = confirm(
            "Want to adjust a neighborhood boundary on the map?\n\n" +
            "Click OK to open the '📐 Map Zone Calibrator' so you can trace the exact streets!"
        );
        if (startCalib && !isCalibrationMode) {
            toggleCalibrationMode();
        }
    }
}

function toggleCalibrationMode() {
    isCalibrationMode = !isCalibrationMode;
    calibrationPoints = [];

    const toolbar = document.getElementById('calibration-toolbar');
    if (toolbar) toolbar.style.display = isCalibrationMode ? 'block' : 'none';

    const summaryEl = document.getElementById('map-budget-summary');
    if (isCalibrationMode && summaryEl) {
        summaryEl.innerHTML = `<strong style="color:#d97706;">📐 Calibrator Active:</strong> Select a phase in the top dropdown, then click its corners on the map!`;
    } else {
        handleSearch();
    }
}

function recordCalibrationPoint(latlng) {
    const selectEl = document.getElementById('neighborhood');
    const activeHoodId = selectEl ? selectEl.value : "";

    if (!activeHoodId || activeHoodId.startsWith("MACRO:")) {
        alert("Please select a specific single phase (e.g., 'Nobonyad - Phase 1') in the top Location dropdown first so the calibrator knows which polygon you are tracing.");
        return;
    }

    const pt = [Number(latlng.lat.toFixed(4)), Number(latlng.lng.toFixed(4))];
    calibrationPoints.push(pt);

    if (NEIGHBORHOOD_MAP[activeHoodId] && polygonLayers[activeHoodId]) {
        NEIGHBORHOOD_MAP[activeHoodId].coords = calibrationPoints;
        polygonLayers[activeHoodId].setLatLngs(calibrationPoints);
        saveCustomPolygonToStorage(activeHoodId, calibrationPoints);
    }

    const summaryEl = document.getElementById('map-budget-summary');
    if (summaryEl) {
        summaryEl.innerHTML = `Tracing <strong>${activeHoodId}</strong>: ${calibrationPoints.length} corner(s) placed and auto-saved!`;
    }
}

function undoCalibrationPoint() {
    const selectEl = document.getElementById('neighborhood');
    const activeHoodId = selectEl ? selectEl.value : "";
    if (!activeHoodId || calibrationPoints.length === 0) return;

    calibrationPoints.pop();
    if (calibrationPoints.length > 0 && polygonLayers[activeHoodId]) {
        NEIGHBORHOOD_MAP[activeHoodId].coords = calibrationPoints;
        polygonLayers[activeHoodId].setLatLngs(calibrationPoints);
        saveCustomPolygonToStorage(activeHoodId, calibrationPoints);
    }
}

function clearCurrentCalibration() {
    calibrationPoints = [];
    const summaryEl = document.getElementById('map-budget-summary');
    if (summaryEl) summaryEl.innerText = "Points cleared. Click on the map to start tracing corners for the selected phase.";
}

function saveCustomPolygonToStorage(hoodId, coords) {
    try {
        const existing = JSON.parse(localStorage.getItem('kishblue_custom_polygons') || '{}');
        existing[hoodId] = coords;
        localStorage.setItem('kishblue_custom_polygons', JSON.stringify(existing));
    } catch (e) {
        console.warn("Could not save to localStorage:", e);
    }
}

function copyCalibratedJSON() {
    const selectEl = document.getElementById('neighborhood');
    const activeHoodId = selectEl ? selectEl.value : "";
    const output = (activeHoodId && NEIGHBORHOOD_MAP[activeHoodId])
        ? JSON.stringify(NEIGHBORHOOD_MAP[activeHoodId].coords)
        : localStorage.getItem('kishblue_custom_polygons') || "[]";

    if (navigator.clipboard) {
        navigator.clipboard.writeText(output);
    }
    alert("Copied polygon coordinates to clipboard:\n\n" + output);
}

window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.key === 'm' || e.key === 'M') {
        toggleMapExpand();
    } else if (e.key === 'Escape') {
        closePropertyModal();
        if (isMapExpanded) toggleMapExpand();
        else if (selectedPropertyId) clearAllFilters();
    }
});

// ==========================================
// 5. CLICK A CARD TO FOCUS OR OPEN FULL MODAL
// ==========================================

function selectPropertyCard(propId, event) {
    if (event && (event.target.closest('.address-tier-box.locked') || event.target.closest('.card-details-btn'))) {
        return;
    }

    if (selectedPropertyId === propId) {
        selectedPropertyId = null;
        if (kishMap) {
            kishMap.flyTo(KISH_DEFAULT_CENTER, KISH_DEFAULT_ZOOM, { duration: 0.5 });
        }
        handleSearch();
        return;
    }

    selectedPropertyId = propId;
    const targetProp = allProperties.find(p => String(p.property_id) === String(propId));

    if (targetProp && kishMap) {
        const normId = normalizeHoodId(targetProp.neighborhood_id);
        const poly = polygonLayers[normId];
        if (poly) {
            kishMap.flyToBounds(poly.getBounds(), {
                padding: [70, 70],
                maxZoom: 15,
                duration: 0.6
            });
        }
    }

    handleSearch();
}

// ==========================================
// 6. PROPERTY DETAIL & LEAD CAPTURE MODAL
// ==========================================

function unlockFromModal(propId) {
    toggleUserLogin();
    openPropertyModal(propId);
}

function openPropertyModal(propId, event) {
    if (event) event.stopPropagation();

    const prop = allProperties.find(p => String(p.property_id) === String(propId));
    if (!prop) return;

    const modalOverlay = document.getElementById('property-modal-overlay');
    const modalContent = document.getElementById('modal-body-content');
    if (!modalOverlay || !modalContent) return;

    activeModalProperty = prop;
    const normId = normalizeHoodId(prop.neighborhood_id);
    const hoodInfo = NEIGHBORHOOD_MAP[normId] || { name: prop.neighborhood_id, persian: "", macro: "Kish" };
    const ageLabel = getBuildingAgeLabel(prop.construction_year);
    const pricePerSqm = prop.area_sqm ? Math.round(Number(prop.price_base) / Number(prop.area_sqm)) : null;

    const addressBoxHTML = isUserLoggedIn
        ? `<div class="address-tier-box unlocked">
             📍 Exact Address: ${prop.street || "Main St"} • ${prop.building_block_name || "Block"} (${prop.building_block_code || "Verified Plot"})
           </div>`
        : `<div class="address-tier-box locked" onclick="unlockFromModal('${prop.property_id}')">
             🔒 Click here to Log In (VIP) and reveal Street Name & Pelak Code
           </div>`;

    modalContent.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
            <span class="mini-tag sea">${prop.property_id}</span>
            <span class="mini-tag">${prop.document_type || "Verified Document"}</span>
            <span class="mini-tag">${ageLabel} (Built ${prop.construction_year || "—"})</span>
        </div>
        <h2 style="font-size:22px; color:#0f172a;">
            ${prop.building_block_name || hoodInfo.name} — ${prop.property_type} (${prop.area_sqm} sqm)
        </h2>
        <p style="color:#64748b; font-size:14px;">
            ${hoodInfo.name} (${hoodInfo.persian}) • ${prop.sub_zone || hoodInfo.macro}
        </p>

        <div class="modal-grid">
            <div>
                <h4 style="font-size:13px; text-transform:uppercase; color:#0284c7; margin-bottom:6px;">
                    Complete Property Specifications
                </h4>
                <div class="modal-specs-table">
                    <div class="spec-item"><strong>Area (Metraj)</strong>${prop.area_sqm} sqm</div>
                    <div class="spec-item"><strong>Property Type</strong>${prop.property_type}</div>
                    <div class="spec-item"><strong>Floor / Total Units</strong>Floor ${prop.floor_number || "—"} of ${prop.total_units || "—"} units</div>
                    <div class="spec-item"><strong>Construction Year</strong>${prop.construction_year || "—"} (${ageLabel})</div>
                    <div class="spec-item"><strong>View Orientation</strong>${prop.view_orientation || "—"}</div>
                    <div class="spec-item"><strong>Sunlight Exposure</strong>${prop.sunlight_exposure || "—"}</div>
                    <div class="spec-item"><strong>Sea View</strong>${prop.sea_view || "No"}</div>
                    <div class="spec-item"><strong>Distance to Beach</strong>${prop.distance_to_sea_m ? prop.distance_to_sea_m + " Meters" : "—"}</div>
                    <div class="spec-item"><strong>Elevator & Parking</strong>Elev: ${prop.elevator || "Yes"} | Park: ${prop.parking || "Yes"}</div>
                    <div class="spec-item"><strong>Official Document</strong>${prop.document_type || "—"}</div>
                </div>

                <div style="margin-bottom:12px; font-size:13px;">
                    <strong>🛍️ Shopping & Proximity:</strong> ${prop.access_to_shopping_centers || "Standard access to neighborhood markets"}
                </div>
                <div style="margin-bottom:14px; font-size:13px;">
                    <strong>✨ Building Amenities:</strong> ${prop.building_amenities || "Standard residential amenities"}
                </div>

                ${addressBoxHTML}
            </div>

            <div class="lead-form-box" id="lead-capture-container">
                <div>
                    <div style="font-size:22px; font-weight:800; color:#0369a1;">
                        ${formatCurrency(prop.price_base)} Toman
                    </div>
                    ${pricePerSqm ? `<div style="font-size:12px; color:#64748b;">~${formatCurrency(pricePerSqm)} Toman per sqm • Partner Ref: ${prop.agent_id || "AG-01"}</div>` : ''}
                </div>
                <hr style="border:0; border-top:1px solid #e2e8f0;">
                <h4 style="font-size:14px; color:#0f172a;">Book a Viewing / Request Agent Callback</h4>
                <input type="text" id="lead-buyer-name" placeholder="Your Full Name *">
                <input type="tel" id="lead-buyer-phone" placeholder="Mobile Number (e.g. 0912...) *">
                <select id="lead-preferred-time">
                    <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 5 PM)">Afternoon (12 PM - 5 PM)</option>
                    <option value="Evening (5 PM - 9 PM)">Evening (5 PM - 9 PM)</option>
                    <option value="As soon as possible">As soon as possible</option>
                </select>
                <textarea id="lead-buyer-notes" rows="2" placeholder="Questions (e.g. cash discount, payment terms, video tour)..."></textarea>
                <button id="lead-submit-btn" class="lead-submit-btn" onclick="submitBuyerLead()">
                    Request Official Property Info
                </button>
            </div>
        </div>
    `;

    modalOverlay.classList.add('open');
}

function closePropertyModal(event) {
    const modalOverlay = document.getElementById('property-modal-overlay');
    if (!modalOverlay) return;
    if (event && event.target !== modalOverlay) return;
    modalOverlay.classList.remove('open');
    activeModalProperty = null;
}

async function submitBuyerLead() {
    if (!activeModalProperty) return;

    const nameEl = document.getElementById('lead-buyer-name');
    const phoneEl = document.getElementById('lead-buyer-phone');
    const timeEl = document.getElementById('lead-preferred-time');
    const notesEl = document.getElementById('lead-buyer-notes');

    const buyerName = nameEl ? nameEl.value.trim() : "";
    const buyerPhone = phoneEl ? phoneEl.value.trim() : "";
    const preferredTime = timeEl ? timeEl.value : "";
    const buyerNotes = notesEl ? notesEl.value.trim() : "";

    if (!buyerName || !buyerPhone) {
        alert("Please enter your name and phone number so our Kish partner agent can contact you.");
        return;
    }

    const btn = document.getElementById('lead-submit-btn');
    if (btn) {
        btn.innerText = "Registering Inquiry...";
        btn.disabled = true;
    }

    const leadPayload = {
        action: "submit_lead",
        property_id: activeModalProperty.property_id,
        agent_id: activeModalProperty.agent_id || "AG-01",
        neighborhood_id: activeModalProperty.neighborhood_id,
        price_base: activeModalProperty.price_base,
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        preferred_time: preferredTime,
        buyer_notes: buyerNotes
    };

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(leadPayload)
        });
        const data = await response.json();

        const container = document.getElementById('lead-capture-container');
        if (container) {
            container.innerHTML = `
                <div style="background:#dcfce7; border:1px solid #22c55e; padding:18px; border-radius:10px; text-align:center; color:#166534;">
                    <h3 style="margin-bottom:6px;">Inquiry Registered!</h3>
                    <p style="font-size:13px; margin-bottom:8px;">
                        Tracking Code: <strong>${data.lead_id || "VERIFIED"}</strong>
                    </p>
                    <p style="font-size:12px;">
                        Our specialist for <strong>${activeModalProperty.property_id}</strong> will contact you at <strong>${buyerPhone}</strong> (${preferredTime}).
                    </p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error submitting lead:", error);
        alert("Network error while sending inquiry. Please try again.");
        if (btn) {
            btn.innerText = "Request Official Property Info";
            btn.disabled = false;
        }
    }
}

// ==========================================
// 7. CLEAR ALL FILTERS BUTTON
// ==========================================

function clearAllFilters() {
    selectedPropertyId = null;
    activeQuickChip = 'all';

    const hoodEl = document.getElementById('neighborhood');
    const typeEl = document.getElementById('property-type');
    const budgetEl = document.getElementById('max-budget');

    if (hoodEl) hoodEl.value = "";
    if (typeEl) typeEl.value = "";
    if (budgetEl) budgetEl.value = "";

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.chip === 'all');
    });

    if (kishMap) {
        kishMap.flyTo(KISH_DEFAULT_CENTER, KISH_DEFAULT_ZOOM, { duration: 0.6 });
    }

    handleSearch();
}

// ==========================================
// 8. UPDATE MAP POLYGONS (SOFT BASE + VIVID HOVER)
// ==========================================

function updateMapLayers(filteredProperties, maxBudget, selectedLocation) {
    if (!kishMap) return;

    markerLayers.forEach(m => kishMap.removeLayer(m));
    markerLayers = [];

    const currentZoom = kishMap.getZoom();
    const focusedProp = selectedPropertyId
        ? allProperties.find(p => String(p.property_id) === String(selectedPropertyId))
        : null;
    const focusedHoodId = focusedProp ? normalizeHoodId(focusedProp.neighborhood_id) : null;

    const propsByHood = {};
    filteredProperties.forEach(p => {
        const normId = normalizeHoodId(p.neighborhood_id);
        if (!propsByHood[normId]) propsByHood[normId] = [];
        propsByHood[normId].push(p);
    });

    let litUpCount = 0;
    const macroSummary = {};

    Object.keys(NEIGHBORHOOD_MAP).forEach(hoodId => {
        const hood = NEIGHBORHOOD_MAP[hoodId];
        const poly = polygonLayers[hoodId];
        if (!poly) return;

        const matchingProps = propsByHood[hoodId] || [];
        const hasLiveUnits = matchingProps.length > 0;

        // CASE 1: Single property card is clicked/locked
        if (focusedProp) {
            if (hoodId === focusedHoodId) {
                litUpCount = 1;
                poly.setStyle({
                    color: '#b45309',
                    weight: 3.5,
                    fillColor: '#f59e0b',
                    fillOpacity: 0.65,
                    dashArray: null
                });

                const center = poly.getBounds().getCenter();
                const pillMarker = L.marker(center, {
                    icon: L.divIcon({
                        className: '',
                        html: `<div class="airbnb-price-pill focused-pill">
                                 <span>🎯 ${formatShortBillions(focusedProp.price_base)}</span>
                                 <span class="pill-extra">• ${focusedProp.building_block_name || focusedProp.property_id}</span>
                               </div>`,
                        iconSize: [0, 0]
                    })
                }).addTo(kishMap);

                pillMarker.on('click', () => openPropertyModal(focusedProp.property_id));
                markerLayers.push(pillMarker);
            } else {
                poly.setStyle({
                    color: '#94a3b8',
                    weight: 1,
                    fillColor: '#cbd5e1',
                    fillOpacity: 0.08,
                    dashArray: '4, 4'
                });
            }
            return;
        }

        // CASE 2: Standard Filter & Budget Radar Logic (Softened Base Opacity for Vivid Hover Contrast)
        let matchesDropdown = true;
        if (selectedLocation && selectedLocation.startsWith("MACRO:")) {
            matchesDropdown = hood.macro === selectedLocation.replace("MACRO:", "");
        } else if (selectedLocation !== "") {
            matchesDropdown = hoodId === selectedLocation;
        }

        const fitsBaselineBudget = hood.minPrice <= maxBudget;
        const isTurnedOn = (mapDisplayMode === 'live')
            ? (hasLiveUnits && matchesDropdown)
            : ((hasLiveUnits || fitsBaselineBudget) && matchesDropdown);

        if (isTurnedOn) {
            litUpCount++;
            // Softened resting base colors so the hover highlight stands out dramatically
            const strokeColor = hasLiveUnits ? '#0284c7' : '#059669';
            const fillColor = hasLiveUnits ? '#38bdf8' : '#34d399';

            poly.setStyle({
                color: strokeColor,
                weight: hasLiveUnits ? 1.6 : 1.2,
                fillColor: fillColor,
                fillOpacity: hasLiveUnits ? 0.22 : 0.14,
                dashArray: null
            });

            const phaseMinPrice = hasLiveUnits
                ? Math.min(...matchingProps.map(p => Number(p.price_base)))
                : hood.minPrice;

            if (!macroSummary[hood.macro]) {
                macroSummary[hood.macro] = { units: 0, minPrice: Infinity, activePhases: 0 };
            }
            macroSummary[hood.macro].units += matchingProps.length;
            macroSummary[hood.macro].activePhases += 1;
            if (phaseMinPrice < macroSummary[hood.macro].minPrice) {
                macroSummary[hood.macro].minPrice = phaseMinPrice;
            }

            if (currentZoom >= 14 || selectedLocation !== "") {
                const center = poly.getBounds().getCenter();
                const shortPrice = formatShortBillions(phaseMinPrice);
                const hoverExtra = hasLiveUnits
                    ? `• ${hood.name} (${matchingProps.length})`
                    : `• ${hood.name}`;

                const pillMarker = L.marker(center, {
                    icon: L.divIcon({
                        className: '',
                        html: `<div class="airbnb-price-pill">
                                 <span>${shortPrice}</span>
                                 <span class="pill-extra">${hoverExtra}</span>
                               </div>`,
                        iconSize: [0, 0]
                    })
                }).addTo(kishMap);

                pillMarker.on('click', () => {
                    selectedPropertyId = null;
                    const selectEl = document.getElementById('neighborhood');
                    if (selectEl) selectEl.value = hoodId;
                    kishMap.flyToBounds(poly.getBounds(), { padding: [60, 60], maxZoom: 15, duration: 0.5 });
                    handleSearch();
                });
                markerLayers.push(pillMarker);
            }
        } else {
            poly.setStyle({
                color: '#94a3b8',
                weight: 1,
                fillColor: '#cbd5e1',
                fillOpacity: 0.08,
                dashArray: '4, 4'
            });
        }

        poly.bindTooltip(`
            <div style="font-size:12px; line-height:1.5;">
                <strong>${hood.name}</strong> (${hood.persian})<br>
                <span style="color:#0284c7; font-weight:600;">Range: ${formatShortBillions(hood.minPrice)} – ${formatShortBillions(hood.maxPrice)} Toman</span><br>
                <span>Sub-zones: ${hood.subZones}</span><br>
                <span>Building Age: ${hood.age} | Live Units: <strong>${matchingProps.length}</strong></span>
            </div>
        `, { sticky: true });
    });

    if (!focusedProp && currentZoom <= 13 && selectedLocation === "") {
        Object.keys(macroSummary).forEach(macroName => {
            const info = macroSummary[macroName];
            const centerCoords = MACRO_CENTERS[macroName];
            if (!centerCoords || info.activePhases === 0) return;

            const subLabel = info.units > 0
                ? `${info.units} unit(s) • From ${formatShortBillions(info.minPrice)}`
                : `From ${formatShortBillions(info.minPrice)}`;

            const clusterMarker = L.marker(centerCoords, {
                icon: L.divIcon({
                    className: '',
                    html: `<div class="macro-cluster-pill" title="Click to zoom into ${macroName} phases">
                             <span class="macro-cluster-title">${macroName}</span>
                             <span class="macro-cluster-sub">${subLabel}</span>
                           </div>`,
                    iconSize: [0, 0]
                })
            }).addTo(kishMap);

            clusterMarker.on('click', () => {
                const selectEl = document.getElementById('neighborhood');
                if (selectEl) selectEl.value = `MACRO:${macroName}`;
                kishMap.flyTo(centerCoords, 14, { duration: 0.5 });
                handleSearch();
            });
            markerLayers.push(clusterMarker);
        });
    }

    if (!isCalibrationMode) {
        const summaryEl = document.getElementById('map-budget-summary');
        if (summaryEl) {
            if (focusedProp) {
                summaryEl.innerHTML = `Focused on <strong>${focusedProp.property_id} (${focusedProp.building_block_name})</strong>. Click pill on map for full specs.`;
            } else if (currentZoom <= 13 && selectedLocation === "") {
                summaryEl.innerText = `${litUpCount} of 25 phases ON (6 districts). Hover any card on the left to light up its exact zone!`;
            } else {
                summaryEl.innerText = `${litUpCount} of 25 phases ON. Hover any price pill to expand phase details.`;
            }
        }
    }
}

// ==========================================
// 9. VIVID CARD-HOVER HIGHLIGHT & UI CONTROLS
// ==========================================

function highlightHoodOnMap(rawHoodId, highlight) {
    if (selectedPropertyId || !kishMap) return;
    const normId = normalizeHoodId(rawHoodId);
    const poly = polygonLayers[normId];
    if (!poly) return;

    if (highlight) {
        // Vivid Amber-Gold highlight on hover so it pops against the soft blue/green base
        poly.bringToFront();
        poly.setStyle({
            color: '#b45309',
            weight: 3.5,
            fillColor: '#f59e0b',
            fillOpacity: 0.70,
            dashArray: null
        });
    } else {
        handleSearch();
    }
}

function setMapMode(mode) {
    mapDisplayMode = mode;
    const radarBtn = document.getElementById('map-mode-radar');
    const liveBtn = document.getElementById('map-mode-live');
    if (radarBtn) radarBtn.classList.toggle('active', mode === 'radar');
    if (liveBtn) liveBtn.classList.toggle('active', mode === 'live');
    handleSearch();
}

function toggleUserLogin() {
    isUserLoggedIn = !isUserLoggedIn;
    const btn = document.getElementById('login-toggle-btn');
    const statusText = document.getElementById('login-status-text');
    if (btn) btn.classList.toggle('logged-in', isUserLoggedIn);
    if (statusText) statusText.innerText = isUserLoggedIn ? "VIP Unlocked" : "Log in";
    handleSearch();
}

function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    const titleEl = document.getElementById('listings-title');
    if (titleEl) {
        titleEl.innerText = mode === 'rent'
            ? "Kish Rental Marketplace (Coming Soon)"
            : "Available Properties for Sale in Kish";
    }
    handleSearch();
}

function setQuickChip(chipKey) {
    selectedPropertyId = null;
    activeQuickChip = chipKey;
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.chip === chipKey);
    });
    handleSearch();
}

// ==========================================
// 10. FETCH, FILTER & RENDER CARDS
// ==========================================

async function fetchProperties() {
    try {
        const response = await fetch(WEB_APP_URL);
        const data = await response.json();
        if (Array.isArray(data)) {
            allProperties = data;
        }
        handleSearch();
    } catch (error) {
        console.error("Error fetching properties:", error);
    }
}

function getFilteredProperties() {
    const hoodEl = document.getElementById('neighborhood');
    const typeEl = document.getElementById('property-type');
    const budgetEl = document.getElementById('max-budget');

    const selectedLocation = hoodEl ? hoodEl.value : "";
    const selectedType = typeEl ? typeEl.value : "";
    const maxBudgetRaw = budgetEl ? budgetEl.value : "";
    const maxBudget = maxBudgetRaw ? parseInt(maxBudgetRaw, 10) : Infinity;

    return allProperties.filter(prop => {
        const normId = normalizeHoodId(prop.neighborhood_id);
        let matchesLocation = true;

        if (selectedLocation.startsWith("MACRO:")) {
            const targetMacro = selectedLocation.replace("MACRO:", "");
            const hoodInfo = NEIGHBORHOOD_MAP[normId];
            matchesLocation = Boolean(hoodInfo && hoodInfo.macro === targetMacro);
        } else if (selectedLocation !== "") {
            matchesLocation = normId === selectedLocation;
        }

        const matchesType = selectedType === "" || prop.property_type === selectedType;
        const matchesBudget = Number(prop.price_base) <= maxBudget;

        let matchesChip = true;
        if (activeQuickChip === 'sea_view') matchesChip = prop.sea_view === "Yes";
        else if (activeQuickChip === 'tak_barg') matchesChip = prop.document_type === "Sanad-e Tak-Barg";
        else if (activeQuickChip === 'roobeh_nama') matchesChip = prop.view_orientation === "Roobeh-nama";
        else if (activeQuickChip === 'luxury_amenities') matchesChip = Boolean(prop.building_amenities && String(prop.building_amenities).trim() !== "");

        return matchesLocation && matchesType && matchesBudget && matchesChip;
    });
}

function renderProperties(propertiesToRender) {
    const grid = document.getElementById('cards-grid') || document.querySelector('.listings-panel');
    const countBadge = document.getElementById('results-count');
    if (!grid) return;

    grid.innerHTML = '';

    if (currentMode === 'rent') {
        if (countBadge) countBadge.innerText = "Rental Module";
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; background: white; padding: 32px; border-radius: 14px; border: 1px solid #e2e8f0; text-align: center;">
                <h3 style="color: #0284c7; margin-bottom: 8px;">Long-Term & Short-Stay Rentals Coming Soon</h3>
                <p style="color: #64748b; font-size: 14px;">Switch back to <strong>Buy Property</strong> to browse live verified listings on the Kish map.</p>
            </div>
        `;
        return;
    }

    if (countBadge) {
        countBadge.innerText = selectedPropertyId
            ? `1 case focused (${propertiesToRender.length} in list)`
            : `${propertiesToRender.length} properties found`;
    }

    if (propertiesToRender.length === 0) {
        grid.innerHTML = '<p style="color: #64748b; grid-column: 1 / -1;">No live properties match your current filter. Click <strong>✕ Clear Filters</strong> to reset!</p>';
        return;
    }

    propertiesToRender.forEach(prop => {
        const normId = normalizeHoodId(prop.neighborhood_id);
        const hoodInfo = NEIGHBORHOOD_MAP[normId] || { name: prop.neighborhood_id, macro: "Kish" };
        const ageLabel = getBuildingAgeLabel(prop.construction_year);
        const pricePerSqm = prop.area_sqm ? Math.round(Number(prop.price_base) / Number(prop.area_sqm)) : null;

        const isSelected = String(selectedPropertyId) === String(prop.property_id);
        const cardStateClass = selectedPropertyId
            ? (isSelected ? 'selected-card' : 'dimmed-card')
            : '';

        const exactAddressHTML = isUserLoggedIn
            ? `<div class="address-tier-box unlocked">
                 📍 ${prop.street || "Main St"} • ${prop.building_block_name || "Block"} (${prop.building_block_code || "Verified Plot"})
               </div>`
            : `<div class="address-tier-box locked" onclick="toggleUserLogin()">
                 🔒 Log in to unlock Street, Building & Pelak
               </div>`;

        const cardHTML = `
            <div class="property-card ${cardStateClass}" data-id="${prop.property_id}"
                 onclick="selectPropertyCard('${prop.property_id}', event)"
                 onmouseenter="highlightHoodOnMap('${prop.neighborhood_id}', true)"
                 onmouseleave="highlightHoodOnMap('${prop.neighborhood_id}', false)">
                ${isSelected ? `<div class="selected-focus-banner">🎯 Focused on Map — Click card again to zoom out</div>` : ''}
                <div class="card-image-box">
                    <div class="card-top-badges">
                        <span class="pill-badge doc-gold">${prop.document_type || "Verified Doc"}</span>
                        <span class="pill-badge age-pill">${ageLabel}</span>
                    </div>
                    <span>${prop.building_block_name || hoodInfo.name}</span>
                </div>
                <div class="card-content">
                    <div class="card-title-row">
                        <h3 class="neighborhood-title">${hoodInfo.name}</h3>
                    </div>
                    <p class="subzone-subtitle">${prop.sub_zone ? prop.sub_zone + " • " : ""}${hoodInfo.macro} District</p>
                    
                    <div class="specs-line">
                        <span>${prop.property_type}</span> • 
                        <span>${prop.area_sqm} sqm</span>
                        ${prop.floor_number ? ` • <span>Floor ${prop.floor_number}</span>` : ''}
                    </div>

                    <div class="badges-row">
                        ${prop.sea_view === "Yes" ? `<span class="mini-tag sea">🌊 Sea View</span>` : ''}
                        ${prop.view_orientation ? `<span class="mini-tag">${prop.view_orientation}</span>` : ''}
                        ${prop.distance_to_sea_m ? `<span class="mini-tag">${prop.distance_to_sea_m}m to Sea</span>` : ''}
                        ${prop.building_amenities ? `<span class="mini-tag">✨ ${prop.building_amenities}</span>` : ''}
                    </div>

                    ${exactAddressHTML}

                    <div class="price-footer">
                        <span class="price-main">${formatCurrency(prop.price_base)} Toman</span>
                        ${pricePerSqm ? `<span class="price-sqm">~${formatCurrency(pricePerSqm)} / sqm</span>` : ''}
                    </div>

                    <button class="card-details-btn" onclick="openPropertyModal('${prop.property_id}', event)">
                        View Full Details & Inquire →
                    </button>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });
}

function handleSearch() {
    const hoodEl = document.getElementById('neighborhood');
    const budgetEl = document.getElementById('max-budget');

    const selectedLocation = hoodEl ? hoodEl.value : "";
    const maxBudgetRaw = budgetEl ? budgetEl.value : "";
    const maxBudget = maxBudgetRaw ? parseInt(maxBudgetRaw, 10) : Infinity;

    const filteredProperties = getFilteredProperties();

    if (selectedPropertyId && !filteredProperties.some(p => String(p.property_id) === String(selectedPropertyId))) {
        selectedPropertyId = null;
    }

    renderProperties(filteredProperties);
    updateMapLayers(filteredProperties, maxBudget, selectedLocation);
}

// ==========================================
// 11. LIVE OPENSTREETMAP STREET-GEOMETRY SNAPPER
// ==========================================

async function syncPolygonsWithOSMStreets() {
    // Only run if user hasn't already manually calibrated custom polygons
    if (localStorage.getItem('kishblue_osm_snapped')) return;

    const overpassQuery = `
        [out:json][timeout:15];
        (
          way["highway"]["name"](26.50,53.91,26.58,54.05);
          way["landuse"="residential"]["name"](26.50,53.91,26.58,54.05);
        );
        out geom;
    `;

    try {
        const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(overpassQuery);
        const res = await fetch(url);
        const data = await res.json();
        if (!data || !Array.isArray(data.elements)) return;

        Object.keys(NEIGHBORHOOD_MAP).forEach(hoodId => {
            const hood = NEIGHBORHOOD_MAP[hoodId];
            if (!hood.osmStreets || hood.osmStreets.length === 0) return;

            // Find all OSM street segments matching this phase's known street names
            const matchedPoints = [];
            data.elements.forEach(el => {
                const name = (el.tags && el.tags.name) ? el.tags.name : "";
                if (hood.osmStreets.some(s => name.includes(s)) && Array.isArray(el.geometry)) {
                    el.geometry.forEach(pt => matchedPoints.push([pt.lat, pt.lon]));
                }
            });

            // If we found enough street points for this phase, recenter the contoured polygon onto those exact streets
            if (matchedPoints.length >= 4) {
                const avgLat = matchedPoints.reduce((s, p) => s + p[0], 0) / matchedPoints.length;
                const avgLon = matchedPoints.reduce((s, p) => s + p[1], 0) / matchedPoints.length;

                const curLat = hood.coords.reduce((s, p) => s + p[0], 0) / hood.coords.length;
                const curLon = hood.coords.reduce((s, p) => s + p[1], 0) / hood.coords.length;

                const dLat = avgLat - curLat;
                const dLon = avgLon - curLon;

                // Only shift if within a reasonable 2.5km radius (prevents false street name matches across the island)
                if (Math.abs(dLat) < 0.022 && Math.abs(dLon) < 0.022) {
                    hood.coords = hood.coords.map(pt => [
                        Number((pt[0] + dLat).toFixed(4)),
                        Number((pt[1] + dLon).toFixed(4))
                    ]);
                    if (polygonLayers[hoodId]) {
                        polygonLayers[hoodId].setLatLngs(hood.coords);
                    }
                }
            }
        });

        localStorage.setItem('kishblue_osm_snapped', 'true');
        handleSearch();
    } catch (err) {
        console.warn("OSM live street snap skipped:", err);
    }
}

// ==========================================
// 12. SAFE INITIALIZATION
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);

    const budgetInput = document.getElementById('max-budget');
    if (budgetInput) budgetInput.addEventListener('input', handleSearch);

    initKishMap();
    fetchProperties();
    setInterval(fetchProperties, 60000);
});
