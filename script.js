// --- AYARLAR ---
// Sunumda veya evde denemek için TRUE yap.
// Okula/sahaya gidince FALSE yaparsan GPS zorunlu olur.
const TEST_MODE = true; 

const GPS_LIMIT_METERS = 1000; // 1km mesafe sınırı
const REPORT_THRESHOLD = 3; // Kırmızı olması için gereken puan

// --- 1. HARİTA AYARLARI ---
var map = L.map('map').setView([38.4100, 27.0900], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

var markersLayer = L.layerGroup().addTo(map);

// --- 2. OYUN & STATE ---
let gameState = {
    xp: 0,
    level: 1,
    totalReports: 0,
    verifiedCount: 0,
    badges: { firstLogin: true, firstReport: false, verifier: false }
};

// Level 3+ kullanıcının oyu daha değerli (3 puan)
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
    const currentLevelBaseXp = (gameState.level - 1) * 100;
    const progressPercent = ((gameState.xp - currentLevelBaseXp) / 100) * 100;

    // UI Güncellemeleri
    document.getElementById('mini-level').innerText = gameState.level;
    document.getElementById('modal-level').innerText = gameState.level;
    document.getElementById('stat-points').innerText = gameState.xp;
    document.getElementById('stat-reports').innerText = gameState.totalReports;
    document.getElementById('stat-badges').innerText = Object.values(gameState.badges).filter(b => b).length;
    document.getElementById('xp-bar').style.width = `${progressPercent}%`;
    document.getElementById('xp-text').innerText = `${gameState.xp}/${nextXp}`;
    
    // Rozet Durumları
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

// --- 3. İSTASYON VERİLERİ ---
// reportScore: 0=Temiz, 1-2=Sarı(Pending), 3+=Kırmızı(Inactive)
const metroStations = [
    { name: "Kaymakamlık", coords: [38.3950, 26.9911], status: "active", reportScore: 0 },
    { name: "100. Yıl C. Şehitlik", coords: [38.3958, 27.0003], status: "active", reportScore: 0 },
    { name: "Narlıdere (İtfaiye)", coords: [38.3936, 27.0150], status: "active", reportScore: 0 },
    { name: "Güzel Sanatlar", coords: [38.3925, 27.0236], status: "active", reportScore: 0 },
    { name: "DEÜ Hastanesi", coords: [38.3944, 27.0386], status: "active", reportScore: 0 },
    { name: "Çağdaş", coords: [38.3944, 27.0453], status: "active", reportScore: 0 },
    { name: "Balçova", coords: [38.3958, 27.0569], status: "active", reportScore: 0 },
    { name: "Fahrettin Altay", coords: [38.3969, 27.0700], status: "active", reportScore: 0 },
    { name: "Poligon", coords: [38.3933, 27.0850], status: "active", reportScore: 0 },
    { name: "Göztepe", coords: [38.3961, 27.0944], status: "active", reportScore: 0 },
    { name: "Hatay", coords: [38.4017, 27.1028], status: "active", reportScore: 0 },
    { name: "İzmirspor", coords: [38.4017, 27.1106], status: "active", reportScore: 0 },
    { name: "Üçyol", coords: [38.4058, 27.1211], status: "active", reportScore: 0 },
    { name: "Konak", coords: [38.4169, 27.1281], status: "active", reportScore: 0 },
    { name: "Çankaya", coords: [38.4225, 27.1361], status: "active", reportScore: 0 },
    { name: "Basmane", coords: [38.4228, 27.1447], status: "active", reportScore: 0 },
    { name: "Hilal", coords: [38.4269, 27.1550], status: "active", reportScore: 0 },
    { name: "Halkapınar", coords: [38.4344, 27.1686], status: "active", reportScore: 0 },
    { name: "Stadyum", coords: [38.4425, 27.1806], status: "active", reportScore: 0 },
    { name: "Sanayi", coords: [38.4483, 27.1903], status: "active", reportScore: 0 },
    { name: "Bölge", coords: [38.4547, 27.2011], status: "active", reportScore: 0 },
    { name: "Bornova", coords: [38.4583, 27.2125], status: "active", reportScore: 0 },
    { name: "Ege Üniversitesi", coords: [38.4615, 27.2210], status: "active", reportScore: 0 },
    { name: "Evka-3", coords: [38.4650, 27.2286], status: "active", reportScore: 0 }
];

L.polyline(metroStations.map(s => s.coords), { color: '#e74c3c', weight: 5 }).addTo(map);

// --- 4. RENDER (ÇİZİM) ---
function renderStations() {
    markersLayer.clearLayers();
    const listDiv = document.getElementById('station-list');
    listDiv.innerHTML = "";
    document.getElementById('result-count').innerText = `${metroStations.length} istasyon listelendi`;

    metroStations.forEach(station => {
        let color = '#27ae60'; // Yeşil
        let badgeHtml = '<span class="status-badge status-ok">Sorun Yok</span>';
        
        if (station.status === 'pending') {
            color = '#f39c12'; // Sarı
            badgeHtml = `<span class="status-badge status-pending">Doğrulama Bekliyor (${station.reportScore}/${REPORT_THRESHOLD})</span>`;
        } else if (station.status === 'inactive') {
            color = '#c0392b'; // Kırmızı
            badgeHtml = '<span class="status-badge status-err">Arıza Bildirimi Var</span>';
        }

        // Harita Markeri
        const marker = L.circleMarker(station.coords, { color: color, radius: 8, fillOpacity: 1, fillColor: color }).addTo(markersLayer);
        marker.on('click', () => {
            if (station.status === 'active') openReportModal(station.name);
            else openVerifyModal(station.name);
        });

        // Liste Kartı
        const card = document.createElement('div');
        card.className = 'station-card';
        
        let actionButtons = `
            <button class="btn-report" onclick="triggerListClick('${station.name}')">
                <i class="fas fa-map-pin"></i> Durum Bildir
            </button>
        `;

        if (station.status !== 'active') {
            actionButtons = `
                <div class="btn-group">
                    <button class="btn-report" onclick="triggerListClick('${station.name}')">Bildir</button>
                    <button class="btn-verify" onclick="openVerifyModal('${station.name}')">✅ Doğrula</button>
                </div>
            `;
        }

        card.innerHTML = `<div class="card-title">${station.name}</div>${badgeHtml}${actionButtons}`;
        listDiv.appendChild(card);
    });
}
renderStations();
updateProfileUI(); // İlk yüklemede

// --- 5. GPS YARDIMCILARI ---
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; var dLat = deg2rad(lat2-lat1); var dLon = deg2rad(lon2-lon1); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; return d * 1000;
}
function deg2rad(deg) { return deg * (Math.PI/180); }

// --- 6. RAPORLAMA MANTIĞI ---
document.getElementById('reportForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!selectedZone) { alert("Lütfen görselden bir yer seçin!"); return; }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            processReport(position.coords.latitude, position.coords.longitude);
        }, () => {
            if(TEST_MODE) { console.warn("GPS Hatası (Test Modu)"); processReport(0, 0); }
            else { alert("Konum alınamadı. GPS izni verin."); }
        });
    } else { alert("GPS desteklenmiyor."); }
});

function processReport(userLat, userLng) {
    const station = metroStations.find(s => s.name === currentStationName);
    
    if (!TEST_MODE) {
        const dist = getDistanceFromLatLonInKm(userLat, userLng, station.coords[0], station.coords[1]);
        if (dist > GPS_LIMIT_METERS) {
            alert(`⚠️ UYARI: İstasyondan çok uzaktasınız (${Math.round(dist)}m). İşlem reddedildi.`);
            return;
        }
    }

    const userPower = getUserVotePower();
    station.reportScore += userPower;
    
    // RENK DEĞİŞTİRME MANTIĞI
    if (station.reportScore >= REPORT_THRESHOLD) {
        station.status = 'inactive'; // Kırmızı
    } else {
        station.status = 'pending'; // Sarı
    }

    gameState.xp += 50;
    gameState.totalReports++;
    if (gameState.totalReports >= 1) gameState.badges.firstReport = true;

    alert(`📢 Bildirim Başarılı!\n+50 Puan Kazandınız.`);
    updateProfileUI();
    renderStations();
    closeReportModal();
}

// --- 7. DOĞRULAMA MANTIĞI ---
const verifyModal = document.getElementById('verifyModal');
let stationToVerify = null;

window.openVerifyModal = function(name) {
    stationToVerify = name;
    document.getElementById('verify-station-name').innerText = name;
    verifyModal.style.display = 'flex';
}
window.closeVerifyModal = function() { verifyModal.style.display = 'none'; }

window.submitVerification = function(isFixed) {
    const station = metroStations.find(s => s.name === stationToVerify);
    if (!station) return;

    if (isFixed) {
        // SORUN ÇÖZÜLDÜ
        station.status = 'active';
        station.reportScore = 0;
        gameState.xp += 30;
        alert("👏 Harika! İstasyonun düzeldiğini bildirdin.\n+30 Puan");
    } else {
        // SORUN DEVAM EDİYOR
        // Skor artar, durum Kırmızıya döner/kalır
        station.reportScore += 1;
        if(station.reportScore >= REPORT_THRESHOLD) station.status = 'inactive';
        gameState.xp += 15;
        alert("✅ Bilgi için teşekkürler.\n+15 Puan");
    }

    gameState.verifiedCount++;
    if (gameState.verifiedCount >= 1) gameState.badges.verifier = true;

    updateProfileUI();
    renderStations();
    closeVerifyModal();
}


// --- 8. UI YARDIMCILARI (Modal Aç/Kapa vb) ---
const profileModal = document.getElementById('profileModal');
const reportModal = document.getElementById('reportModal');
let currentStationName = null; 
let selectedZone = null;

window.openProfileModal = () => { profileModal.style.display = 'flex'; updateProfileUI(); }
window.closeProfileModal = () => { profileModal.style.display = 'none'; }

window.openReportModal = (name) => {
    currentStationName = name;
    document.getElementById('modal-station-name').innerText = name;
    reportModal.style.display = 'flex';
    document.getElementById('click-zones').innerHTML = '';
    // Dinamik buton oluştur (Örnek)
    createZoneButton("Ana Giriş", 50, 50);
}
window.closeReportModal = () => { reportModal.style.display = 'none'; }

function createZoneButton(name, t, l) {
    const btn = document.createElement('div');
    btn.className = 'zone-btn';
    btn.innerText = name;
    btn.style.top = t + '%'; btn.style.left = l + '%';
    btn.onclick = () => {
        document.querySelectorAll('.zone-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedZone = name;
        const alertBox = document.getElementById('selected-zone-info');
        alertBox.className = 'selection-alert selected';
        alertBox.innerText = `Seçildi: ${name}`;
    };
    document.getElementById('click-zones').appendChild(btn);
}

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
