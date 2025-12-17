// --- AYARLAR ---
const TEST_MODE = true; 
const GPS_LIMIT_METERS = 1000; 
const REPORT_THRESHOLD = 3; // 3 ve üzeri puanda KIRMIZI olur

// --- 1. HARİTA ---
var map = L.map('map').setView([38.4100, 27.0900], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);
var markersLayer = L.layerGroup().addTo(map);

// --- 2. OYUN STATE ---
let gameState = {
    isLoggedIn: false, username: "Misafir", xp: 0, level: 1, totalReports: 0, verifiedCount: 0,
    badges: { firstLogin: false, firstReport: false, verifier: false }
};

// --- YARDIMCI FONKSİYONLAR ---
function calculateLevel() { return Math.floor(gameState.xp / 100) + 1; }
function getNextLevelXp() { return gameState.level * 100; }
function getAvatarUrl(name) { return `https://ui-avatars.com/api/?name=${name}&background=1e69de&color=fff&rounded=true&bold=true`; }

// --- 3. İSTASYON VERİLERİ (SIRALI) ---
const metroStations = [
    { name: "Kaymakamlık", coords: [38.3950, 26.9911], status: "active", reportScore: 0, zones: [{ name: "Ana Giriş", offset: [0,0] }] },
    { name: "100. Yıl C. Şehitlik", coords: [38.3958, 27.0003], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Narlıdere (İtfaiye)", coords: [38.3936, 27.0150], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Güzel Sanatlar", coords: [38.3925, 27.0236], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "DEÜ Hastanesi", coords: [38.3944, 27.0386], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Çağdaş", coords: [38.3944, 27.0453], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Balçova", coords: [38.3958, 27.0569], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { 
        name: "Fahrettin Altay", coords: [38.3969, 27.0700], status: "active", reportScore: 0,
        zones: [ { name: "AVM Çıkışı (Asansör)", offset: [0.0003, -0.0003] }, { name: "Pazar Yeri Çıkışı", offset: [-0.0003, 0.0003] }, { name: "Aktarma Merkezi", offset: [0, 0] } ]
    },
    { 
        name: "Poligon", coords: [38.3933, 27.0850], status: "active", reportScore: 0,
        zones: [ { name: "Park Çıkışı", offset: [0.0002, -0.0002] }, { name: "Okul Tarafı", offset: [-0.0002, 0.0002] } ]
    },
    { name: "Göztepe", coords: [38.3961, 27.0944], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Hatay", coords: [38.4017, 27.1028], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "İzmirspor", coords: [38.4017, 27.1106], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Üçyol", coords: [38.4058, 27.1211], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Konak", coords: [38.4169, 27.1281], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Çankaya", coords: [38.4225, 27.1361], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Basmane", coords: [38.4228, 27.1447], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Hilal", coords: [38.4269, 27.1550], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Halkapınar", coords: [38.4344, 27.1686], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Stadyum", coords: [38.4425, 27.1806], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Sanayi", coords: [38.4483, 27.1903], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Bölge", coords: [38.4547, 27.2011], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Bornova", coords: [38.4583, 27.2125], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Ege Üniversitesi", coords: [38.4615, 27.2210], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Evka-3", coords: [38.4650, 27.2286], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] }
];

L.polyline(metroStations.map(s => s.coords), { color: '#e74c3c', weight: 5 }).addTo(map);

function renderStations(searchTerm = "") {
    markersLayer.clearLayers();
    const listDiv = document.getElementById('station-list');
    listDiv.innerHTML = "";

    const filtered = metroStations.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    document.getElementById('result-count').innerText = filtered.length;

    filtered.forEach(station => {
        let color = '#27ae60'; let icon = '<i class="fas fa-check-circle"></i>'; let statusText = 'Sorun Yok'; let statusClass = 'status-ok';
        
        // Mantık: Eğer 'inactive' ise KIRMIZI, 'pending' ise SARI
        if (station.status === 'pending') { 
            color = '#f39c12'; icon = '<i class="fas fa-exclamation-circle"></i>'; statusText = `Doğrulama (${station.reportScore}/${REPORT_THRESHOLD})`; statusClass = 'status-pending';
        } else if (station.status === 'inactive') { 
            color = '#c0392b'; icon = '<i class="fas fa-times-circle"></i>'; statusText = 'Arıza Var'; statusClass = 'status-err';
        }

        const marker = L.circleMarker(station.coords, { color: 'white', weight: 2, fillColor: color, fillOpacity: 1, radius: 9 }).addTo(markersLayer);
        marker.bindTooltip(`<b>${station.name}</b><br>${statusText}`);
        marker.on('click', () => triggerAction(station));

        const card = document.createElement('div');
        card.className = 'station-card';
        card.onclick = () => triggerListClick(station.name);
        
        let actionButtons = `
            <button class="btn-icon-action btn-report" onclick="event.stopPropagation(); triggerAction(this.closest('.station-card').dataset.stationName, 'report')" title="Durum Bildir">
                <i class="fas fa-bullhorn"></i>
            </button>`;
        if (station.status !== 'active') {
            actionButtons += `
                <button class="btn-icon-action btn-verify" onclick="event.stopPropagation(); triggerAction(this.closest('.station-card').dataset.stationName, 'verify')" title="Doğrula">
                    <i class="fas fa-check"></i>
                </button>`;
        }
        
        card.dataset.stationName = station.name;
        card.innerHTML = `
            <div class="card-info">
                <div class="card-header"><i class="fas fa-subway station-icon"></i><div class="card-title">${station.name}</div></div>
                <span class="status-badge ${statusClass}">${icon} ${statusText}</span>
            </div>
            <div class="card-actions">${actionButtons}</div>
        `;
        listDiv.appendChild(card);
    });
}
renderStations();

document.getElementById('station-search').addEventListener('input', (e) => { renderStations(e.target.value); });

// --- 5. LOGIN ---
const loginModal = document.getElementById('loginModal');
const demoNames = ["Ahmet Yılmaz", "Zeynep Kaya", "Mehmet Demir", "Ayşe Çelik", "Can Yıldız"];

function checkLogin() {
    if (gameState.isLoggedIn) return true;
    loginModal.style.display = 'flex'; return false;
}
window.closeLoginModal = () => { loginModal.style.display = 'none'; }

window.performLogin = () => {
    const btn = document.querySelector('.btn-google-login');
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> <span>Bağlanılıyor...</span>';
    btn.disabled = true;

    setTimeout(() => {
        const randomFullName = demoNames[Math.floor(Math.random() * demoNames.length)];
        const parts = randomFullName.split(' ');
        const privacyName = `${parts[0]} ${parts[1][0]}.`;

        gameState.isLoggedIn = true;
        gameState.username = privacyName;
        gameState.badges.firstLogin = true;

        updateProfileUI();
        closeLoginModal();
        btn.innerHTML = originalHtml;
        btn.disabled = false;
        alert(`🎉 Hoşgeldin, ${parts[0]}!\nOturum açıldı.`);
    }, 1500);
};

// --- 6. PROFIL UI ---
function updateProfileUI() {
    document.getElementById('top-user-name').innerText = gameState.username;
    document.getElementById('top-user-desc').innerHTML = `<i class="fas fa-star" style="color:#f1c40f;"></i> Seviye ${gameState.level}`;
    const avatarUrl = getAvatarUrl(gameState.username);
    document.getElementById('top-user-img').src = avatarUrl;
    document.getElementById('modal-username').innerText = gameState.username;
    document.getElementById('modal-avatar').src = avatarUrl;
    
    if (calculateLevel() > gameState.level) {
        alert(`🎉 TEBRİKLER! Seviye ${calculateLevel()} oldunuz!`);
        gameState.level = calculateLevel();
    }
    const nextXp = getNextLevelXp();
    const progressPercent = ((gameState.xp - ((gameState.level - 1) * 100)) / 100) * 100;

    document.getElementById('modal-level').innerText = gameState.level;
    document.getElementById('stat-points').innerText = gameState.xp;
    document.getElementById('stat-reports').innerText = gameState.totalReports;
    document.getElementById('stat-badges').innerText = Object.values(gameState.badges).filter(b => b).length;
    document.getElementById('current-level-txt').innerText = gameState.level;
    document.getElementById('next-level-txt').innerText = gameState.level + 1;
    document.getElementById('xp-text').innerText = `${gameState.xp}/${nextXp} XP`;
    document.getElementById('xp-bar').style.width = `${progressPercent}%`;
    
    updateBadgeStatus('badge-first-login', gameState.badges.firstLogin);
    updateBadgeStatus('badge-first-report', gameState.badges.firstReport);
    updateBadgeStatus('badge-verifier', gameState.badges.verifier);
}

function updateBadgeStatus(id, unlocked) {
    if (unlocked) {
        const el = document.getElementById(id);
        el.classList.remove('locked');
        const icon = el.querySelector('.badge-status');
        icon.classList.replace('fa-
