// --- AYARLAR ---
const TEST_MODE = true; 
const GPS_LIMIT_METERS = 1000; 
const REPORT_THRESHOLD = 3; 

// --- 1. ANA HARİTA ---
var map = L.map('map').setView([38.4100, 27.0900], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

var markersLayer = L.layerGroup().addTo(map);

// --- 2. OYUN STATE ---
let gameState = {
    xp: 0, level: 1, totalReports: 0, verifiedCount: 0,
    badges: { firstLogin: true, firstReport: false, verifier: false }
};

function getUserVotePower() { return gameState.level >= 3 ? 3 : 1; }
function calculateLevel() { return Math.floor(gameState.xp / 100) + 1; }
function getNextLevelXp() { return gameState.level * 100; }

function updateProfileUI() {
    const newLevel = calculateLevel();
    if (newLevel > gameState.level) {
        alert(`🎉 TEBRİKLER! Seviye ${newLevel} oldunuz!`);
        gameState.level = newLevel;
    }
    const nextXp = getNextLevelXp();
    const progressPercent = ((gameState.xp - ((gameState.level - 1) * 100)) / 100) * 100;

    document.getElementById('mini-level').innerText = gameState.level;
    document.getElementById('modal-level').innerText = gameState.level;
    document.getElementById('stat-points').innerText = gameState.xp;
    document.getElementById('stat-reports').innerText = gameState.totalReports;
    document.getElementById('stat-badges').innerText = Object.values(gameState.badges).filter(b => b).length;
    document.getElementById('xp-bar').style.width = `${progressPercent}%`;
    document.getElementById('xp-text').innerText = `${gameState.xp}/${nextXp}`;
    
    updateBadgeStatus('badge-first-report', gameState.badges.firstReport);
    updateBadgeStatus('badge-verifier', gameState.badges.verifier);
}
function updateBadgeStatus(id, unlocked) {
    if(unlocked) {
        const el = document.getElementById(id);
        el.classList.remove('locked');
        el.querySelector('.badge-check').classList.replace('fa-lock', 'fa-check-circle');
        el.querySelector('.badge-check').classList.add('active');
    }
}

// --- 3. İSTASYON VERİLERİ (KESİN SIRALI LİSTE) ---
// DİKKAT: Buradaki sıralama haritadaki çizgi sırasıdır. Karıştırmayalım.
// Sıra: Kaymakamlık (En Batı) -> ... -> Fahrettin Altay -> ... -> Evka 3 (En Doğu)
const metroStations = [
    // 1. Kaymakamlık
    { 
        name: "Kaymakamlık", 
        coords: [38.3950, 26.9911], 
        status: "active", reportScore: 0, 
        zones: [{ name: "Ana Giriş", offset: [0,0] }] 
    },
    // 2. 100. Yıl
    { 
        name: "100. Yıl C. Şehitlik", 
        coords: [38.3958, 27.0003], 
        status: "active", reportScore: 0, 
        zones: [{name:"Giriş", offset:[0,0]}] 
    },
    // 3. Narlıdere İtfaiye
    { 
        name: "Narlıdere (İtfaiye)", 
        coords: [38.3936, 27.0150], 
        status: "active", reportScore: 0, 
        zones: [{name:"Giriş", offset:[0,0]}] 
    },
    // 4. Güzel Sanatlar
    { 
        name: "Güzel Sanatlar", 
        coords: [38.3925, 27.0236], 
        status: "active", reportScore: 0, 
        zones: [{name:"Giriş", offset:[0,0]}] 
    },
    // 5. DEÜ Hastanesi
    { 
        name: "DEÜ Hastanesi", 
        coords: [38.3944, 27.0386], 
        status: "active", reportScore: 0, 
        zones: [{name:"Giriş", offset:[0,0]}] 
    },
    // 6. Çağdaş
    { 
        name: "Çağdaş", 
        coords: [38.3944, 27.0453], 
        status: "active", reportScore: 0, 
        zones: [{name:"Giriş", offset:[0,0]}] 
    },
    // 7. Balçova
    { 
        name: "Balçova", 
        coords: [38.3958, 27.0569], 
        status: "active", reportScore: 0, 
        zones: [{name:"Giriş", offset:[0,0]}] 
    },
    // 8. Fahrettin Altay
    { 
        name: "Fahrettin Altay", 
        coords: [38.3969, 27.0700], 
        status: "active", reportScore: 0,
        zones: [
            { name: "AVM Çıkışı (Asansör)", offset: [0.0003, -0.0003] },
            { name: "Pazar Yeri Çıkışı", offset: [-0.0003, 0.0003] },
            { name: "Aktarma Merkezi", offset: [0, 0] }
        ]
    },
    // 9. Poligon
    { 
        name: "Poligon", 
        coords: [38.3933, 27.0850], 
        status: "active", reportScore: 0,
        zones: [
            { name: "Park Çıkışı", offset: [0.0002, -0.0002] },
            { name: "Okul Tarafı", offset: [-0.0002, 0.0002] }
        ]
    },
    // 10. Göztepe
    { name: "Göztepe", coords: [38.3961, 27.0944], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    // 11. Hatay
    { name: "Hatay", coords: [38.4017, 27.1028], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    // 12. İzmirspor
    { name: "İzmirspor", coords: [38.4017, 27.1106], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    // 13. Üçyol
    { name: "Üçyol", coords: [38.4058, 27.1211], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    // 14. Konak
    { name: "Konak", coords: [38.4169, 27.1281], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    // 15. Çankaya
    { name: "Çankaya", coords: [38.4225, 27.1361], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    // 16. Basmane
    { name: "Basmane", coords: [38.4228, 27.1447], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    // 17. Hilal
    { name: "Hilal", coords: [38.4269, 27.1550], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    // 18. Halkapınar
    { name: "Halkapınar", coords: [38.4344, 27.1686], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    // 19. Stadyum
    { name: "Stadyum", coords: [38.4425, 27.1806], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    // 20. Sanayi
    { name: "Sanayi", coords: [38.4483, 27.1903], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    // 21. Bölge
    { name: "Bölge", coords: [38.4547, 27.2011], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    // 22. Bornova
    { name: "Bornova", coords: [38.4583, 27.2125], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    // 23. Ege Üniversitesi
    { name: "Ege Üniversitesi", coords: [38.4615, 27.2210], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    // 24. Evka-3
    { name: "Evka-3", coords: [38.4650, 27.2286], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] }
];

// Hattı Çiz (Liste sıralı olduğu için artık düzgün çizecek)
L.polyline(metroStations.map(s => s.coords), { color: '#e74c3c', weight: 5 }).addTo(map);

function renderStations() {
    markersLayer.clearLayers();
    const listDiv = document.getElementById('station-list');
    listDiv.innerHTML = "";
    document.getElementById('result-count').innerText = `${metroStations.length} istasyon listelendi`;

    metroStations.forEach(station => {
        let color = '#27ae60'; 
        let badgeHtml = '<span class="status-badge status-ok">Sorun Yok</span>';
        
        if (station.status === 'pending') {
            color = '#f39c12'; badgeHtml = `<span class="status-badge status-pending">Doğrulama Bekliyor (${station.reportScore}/${REPORT_THRESHOLD})</span>`;
        } else if (station.status === 'inactive') {
            color = '#c0392b'; badgeHtml = '<span class="status-badge status-err">Arıza Bildirimi Var</span>';
        }

        const marker = L.circleMarker(station.coords, { color: color, radius: 8, fillOpacity: 1, fillColor: color }).addTo(markersLayer);
        marker.on('click', () => {
            if (station.status === 'active') openReportModal(station.name);
            else openVerifyModal(station.name);
        });

        const card = document.createElement('div');
        card.className = 'station-card';
        let actionButtons = `<button class="btn-report" onclick="triggerListClick('${station.name}')"><i class="fas fa-map-pin"></i> Durum Bildir</button>`;
        if (station.status !== 'active') {
            actionButtons = `<div class="btn-group"><button class="btn-report" onclick="triggerListClick('${station.name}')">Bildir</button><button class="btn-verify" onclick="openVerifyModal('${station.name}')">✅ Doğrula</button></div>`;
        }

        card.innerHTML = `<div class="card-title">${station.name}</div>${badgeHtml}${actionButtons}`;
        listDiv.appendChild(card);
    });
}
renderStations();
updateProfileUI(); 

// --- 4. MODAL & MİNİ HARİTA MANTIĞI ---
let miniMap = null; 
let selectedZone = null;
let currentStationName = null;
const reportModal = document.getElementById('reportModal');
const alertBox = document.getElementById('selected-zone-info');

window.openReportModal = (name) => {
    currentStationName = name;
    document.getElementById('modal-station-name').innerText = name;
    reportModal.style.display = 'flex';
    selectedZone = null;
    alertBox.className = "selection-alert";
    alertBox.innerText = "Lütfen haritadan seçim yapın";

    const station = metroStations.find(s => s.name === name);
    
    // Modal açıldıktan hemen sonra haritayı oluştur ki boyutu doğru olsun
    setTimeout(() => {
        if (miniMap) miniMap.remove();
        
        miniMap = L.map('mini-map', {
            center: station.coords, 
            zoom: 18, 
            zoomControl: false, 
            dragging: false, 
            scrollWheelZoom: false
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(miniMap);

        const zones = station.zones || [{name: "Genel Alan", offset: [0,0]}];
        zones.forEach(zone => {
            const zoneLat = station.coords[0] + zone.offset[0];
            const zoneLng = station.coords[1] + zone.offset[1];
            
            const zoneMarker = L.circleMarker([zoneLat, zoneLng], {
                color: '#3498db', fillColor: '#3498db', fillOpacity: 0.8, radius: 12
            }).addTo(miniMap);

            zoneMarker.bindTooltip(zone.name, {permanent: true, direction: 'top', offset: [0, -10]});

            zoneMarker.on('click', () => {
                selectedZone = zone.name;
                alertBox.className = "selection-alert selected";
                alertBox.innerText = `Seçildi: ${zone.name}`;
                miniMap.eachLayer((layer) => { 
                    if(layer instanceof L.CircleMarker) layer.setStyle({color: '#3498db', fillColor: '#3498db'}); 
                });
                zoneMarker.setStyle({color: '#e74c3c', fillColor: '#e74c3c'}); 
            });
        });
    }, 200); // Küçük bir gecikme haritanın gri kalmasını önler
}

window.closeReportModal = () => { reportModal.style.display = 'none'; }

document.getElementById('reportForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!selectedZone) { alert("Lütfen haritadan bir nokta seçin!"); return; }
    
    const station = metroStations.find(s => s.name === currentStationName);
    station.reportScore += 1;
    if(station.reportScore >= REPORT_THRESHOLD) station.status = 'inactive';
    else station.status = 'pending';

    gameState.xp += 50;
    gameState.totalReports++;
    if(gameState.totalReports >= 1) gameState.badges.firstReport = true;
    alert("Bildiriminiz Haritaya İşlendi!\n+50 Puan");
    updateProfileUI(); renderStations(); closeReportModal();
});

// --- 5. DİĞER MODALLAR ---
const verifyModal = document.getElementById('verifyModal');
let stationToVerify = null;

window.openVerifyModal = (name) => {
    stationToVerify = name;
    document.getElementById('verify-station-name').innerText = name;
    verifyModal.style.display = 'flex';
}
window.closeVerifyModal = () => { verifyModal.style.display = 'none'; }

window.submitVerification = (isFixed) => {
    const station = metroStations.find(s => s.name === stationToVerify);
    if(isFixed) {
        station.status = 'active'; station.reportScore = 0; gameState.xp += 30;
        alert("Düzeldi olarak işaretlediniz.\n+30 Puan");
    } else {
        station.reportScore++; gameState.xp += 15;
        alert("Sorun devam ediyor.\n+15 Puan");
    }
    gameState.verifiedCount++;
    if(gameState.verifiedCount >= 1) gameState.badges.verifier = true;
    updateProfileUI(); renderStations(); closeVerifyModal();
}

const profileModal = document.getElementById('profileModal');
window.openProfileModal = () => { profileModal.style.display = 'flex'; updateProfileUI(); }
window.closeProfileModal = () => { profileModal.style.display = 'none'; }

window.triggerListClick = (name) => {
    const s = metroStations.find(st => st.name === name);
    map.flyTo(s.coords, 15);
    setTimeout(() => {
        if(s.status === 'active') openReportModal(name);
        else openVerifyModal(name);
    }, 800);
}

document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('closed');
    setTimeout(() => map.invalidateSize(), 400);
});

window.onclick = (e) => {
    if(e.target == profileModal) closeProfileModal();
    if(e.target == reportModal) closeReportModal();
    if(e.target == verifyModal) closeVerifyModal();
}
