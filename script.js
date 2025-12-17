/* --- AYARLAR --- */
const TEST_MODE = true;
const GPS_LIMIT_METERS = 1000;
const REPORT_THRESHOLD = 3; 

/* --- 1. HARİTA --- */
var map = L.map('map', {zoomControl: false}).setView([38.4189, 27.1287], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);
L.control.zoom({position: 'bottomright'}).addTo(map);
var markersLayer = L.layerGroup().addTo(map);

/* --- 2. STATE --- */
let gameState = { isLoggedIn: false, username: "Misafir", xp: 0, level: 1, totalReports: 0, verifiedCount: 0, badges: {firstLogin:false, firstReport:false, verifier:false} };

/* --- 3. İSTASYONLAR (SIRALI) --- */
const metroStations = [
    { name: "Kaymakamlık", coords: [38.3950, 26.9911], status: "active", reportScore: 0, zones: [{ name: "Ana Giriş", offset: [0,0] }] },
    { name: "100. Yıl C. Şehitlik", coords: [38.3958, 27.0003], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Narlıdere (İtfaiye)", coords: [38.3936, 27.0150], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Güzel Sanatlar", coords: [38.3925, 27.0236], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "DEÜ Hastanesi", coords: [38.3944, 27.0386], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Çağdaş", coords: [38.3944, 27.0453], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Balçova", coords: [38.3958, 27.0569], status: "active", reportScore: 0, zones: [{name:"Giriş", offset:[0,0]}] },
    { name: "Fahrettin Altay", coords: [38.3969, 27.0700], status: "active", reportScore: 0, zones: [{name:"AVM", offset:[0.0003,-0.0003]}, {name:"Pazar", offset:[-0.0003,0.0003]}] },
    { name: "Poligon", coords: [38.3933, 27.0850], status: "active", reportScore: 0, zones: [{name:"Park", offset:[0.0002,-0.0002]}] },
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
L.polyline(metroStations.map(s => s.coords), { color: '#e74c3c', weight: 6, opacity: 0.8 }).addTo(map);

/* --- 4. RENDER --- */
function renderStations(searchTerm = "") {
    markersLayer.clearLayers();
    const listDiv = document.getElementById('station-list');
    listDiv.innerHTML = "";
    
    const filtered = metroStations.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    document.getElementById('result-count').innerText = filtered.length;

    filtered.forEach(station => {
        // --- KIRMIZI RENK DÜZELTMESİ BURADA YAPILDI ---
        if (station.reportScore >= REPORT_THRESHOLD) { station.status = 'inactive'; } 
        else if (station.reportScore > 0) { station.status = 'pending'; } 
        else { station.status = 'active'; }

        let color = '#27ae60', icon = '<i class="fas fa-check-circle"></i>', statusText = 'Sorun Yok', statusClass = 'status-ok';
        if (station.status === 'inactive') { 
            color = '#c0392b'; icon = '<i class="fas fa-times-circle"></i>'; statusText = 'Arıza Var'; statusClass = 'status-err';
        } else if (station.status === 'pending') { 
            color = '#f39c12'; icon = '<i class="fas fa-exclamation-circle"></i>'; statusText = `Doğrulama (${station.reportScore}/${REPORT_THRESHOLD})`; statusClass = 'status-pending'; 
        }

        const marker = L.circleMarker(station.coords, {color: 'white', weight: 2, fillColor: color, fillOpacity: 1, radius: 9}).addTo(markersLayer);
        marker.bindTooltip(`<b>${station.name}</b><br>${statusText}`);
        marker.on('click', () => triggerAction(station));

        const card = document.createElement('div');
        card.className = 'station-card';
        card.onclick = () => triggerListClick(station.name);
        
        let btns = `<button class="btn-icon-action btn-report" onclick="event.stopPropagation(); triggerAction('${station.name}', 'report')"><i class="fas fa-bullhorn"></i></button>`;
        if(station.status !== 'active') btns += `<button class="btn-icon-action btn-verify" onclick="event.stopPropagation(); triggerAction('${station.name}', 'verify')"><i class="fas fa-check"></i></button>`;

        card.innerHTML = `<div class="card-info"><div class="card-header"><i class="fas fa-subway station-icon"></i> ${station.name}</div><span class="status-badge ${statusClass}">${icon} ${statusText}</span></div><div class="card-actions">${btns}</div>`;
        listDiv.appendChild(card);
    });
}
renderStations();
document.getElementById('station-search').addEventListener('input', (e) => renderStations(e.target.value));

/* --- 5. AKSİYONLAR --- */
function triggerAction(stationOrName, type) {
    const name = typeof stationOrName === 'string' ? stationOrName : stationOrName.name;
    const s = metroStations.find(st => st.name === name);
    if (!type) type = s.status === 'active' ? 'report' : 'verify';
    if (!gameState.isLoggedIn) { openLoginModal(); return; }
    if (type === 'report') openReportModal(name);
    else openVerifyModal(name);
}

/* --- 6. GİRİŞ (LOGIN - HATA DÜZELTİLDİ) --- */
const loginModal = document.getElementById('loginModal');
const demoNames = ["Ahmet Yılmaz", "Zeynep Kaya", "Mehmet Demir", "Ayşe Çelik", "Can Yıldız"];

function openLoginModal() { loginModal.style.display = 'flex'; }
function closeLoginModal() { loginModal.style.display = 'none'; }

window.performLogin = () => {
    const btn = document.querySelector('.btn-google-login');
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> <span>Bağlanılıyor...</span>';
    btn.disabled = true;

    setTimeout(() => {
        const randomFullName = demoNames[Math.floor(Math.random() * demoNames.length)];
        const parts = randomFullName.split(' ');
        const privacyName = `${parts[0]} ${parts[1][0]}.`; // İsim Kısaltma

        gameState.isLoggedIn = true;
        gameState.username = privacyName;
        gameState.badges.firstLogin = true;

        updateProfileUI();
        closeLoginModal();
        btn.innerHTML = originalHtml;
        btn.disabled = false;
        alert(`🎉 Hoşgeldin, ${parts[0]}!\nOturum başarıyla açıldı.`);
    }, 1500);
};

/* --- 7. UI --- */
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
    const progress = ((gameState.xp % 100) / 100) * 100;
    document.getElementById('modal-level').innerText = gameState.level;
    document.getElementById('stat-points').innerText = gameState.xp;
    document.getElementById('stat-reports').innerText = gameState.totalReports;
    document.getElementById('stat-badges').innerText = Object.values(gameState.badges).filter(b => b).length;
    document.getElementById('current-level-txt').innerText = gameState.level;
    document.getElementById('next-level-txt').innerText = gameState.level + 1;
    document.getElementById('xp-text').innerText = `${gameState.xp}/${nextXp} XP`;
    document.getElementById('xp-bar').style.width = `${progress}%`;
    
    updateBadgeStatus('badge-first-login', gameState.badges.firstLogin);
    updateBadgeStatus('badge-first-report', gameState.badges.firstReport);
    updateBadgeStatus('badge-verifier', gameState.badges.verifier);
}

function updateBadgeStatus(id, unlocked) {
    if (unlocked) {
        const el = document.getElementById(id);
        el.classList.remove('locked');
        el.querySelector('.badge-status').className = 'fas fa-check-circle badge-status active';
    }
}

function calculateLevel() { return Math.floor(gameState.xp/100)+1; }
function getNextLevelXp() { return gameState.level * 100; }
function getAvatarUrl(name) { return `https://ui-avatars.com/api/?name=${name}&background=1e69de&color=fff&rounded=true&bold=true`; }

/* --- 8. MODAL MANTIĞI --- */
const reportModal = document.getElementById('reportModal');
const verifyModal = document.getElementById('verifyModal');
const profileModal = document.getElementById('profileModal');
let currentStationName, selectedZone, hasPhoto, stationToVerify, miniMap;

function openReportModal(name) {
    currentStationName = name;
    document.getElementById('modal-station-name').innerText = name;
    reportModal.style.display = 'flex';
    selectedZone = null; hasPhoto = false;
    document.getElementById('btn-submit-report').disabled = true;
    document.getElementById('selected-zone-info').innerText = "Seçim Yapılmadı";
    document.getElementById('file-label').innerHTML = '<i class="fas fa-camera"></i> Fotoğraf Ekle (+20 Puan)';
    
    const s = metroStations.find(st => st.name === name);
    const altBox = document.getElementById('alternative-route-box');
    if(s.status !== 'active') { altBox.style.display = 'flex'; document.getElementById('suggestion-text').innerText = `En yakın: ${getAlternative(name)}`; }
    else altBox.style.display = 'none';

    setTimeout(() => {
        if(miniMap) miniMap.remove();
        miniMap = L.map('mini-map', {center: s.coords, zoom: 18, zoomControl:false});
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(miniMap);
        const zones = s.zones || [{name:"Genel", offset:[0,0]}];
        zones.forEach(z => {
            const m = L.circleMarker([s.coords[0]+z.offset[0], s.coords[1]+z.offset[1]], {color:'#3498db', radius:10}).addTo(miniMap);
            m.bindTooltip(z.name, {permanent:true, direction:'top', offset:[0,-10]});
            m.on('click', () => {
                selectedZone = z.name;
                document.getElementById('selected-zone-info').innerText = `Seçildi: ${z.name}`;
                document.getElementById('btn-submit-report').disabled = false;
                miniMap.eachLayer(l => { if(l instanceof L.CircleMarker) l.setStyle({color:'#3498db'}); });
                m.setStyle({color:'#e74c3c'});
            });
        });
    }, 200);
}

document.getElementById('reportForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const s = metroStations.find(st => st.name === currentStationName);
    s.reportScore++;
    addXp(50 + (hasPhoto?20:0)); gameState.totalReports++; gameState.badges.firstReport=true;
    updateUI(); renderStations(); closeAllModals(); alert("Bildirim Alındı!");
});

function openVerifyModal(name) {
    stationToVerify = name;
    document.getElementById('verify-station-name').innerText = name;
    verifyModal.style.display = 'flex';
}

window.submitVerification = (fixed) => {
    const s = metroStations.find(st => st.name === stationToVerify);
    if(fixed) { s.status = 'active'; s.reportScore = 0; addXp(30); }
    else { 
        s.reportScore++; // Puan artır
        addXp(15); 
    }
    // RENDERSTATIONS ZATEN RENK KONTROLÜ YAPACAK
    gameState.verifiedCount++; gameState.badges.verifier=true;
    updateUI(); renderStations(); closeAllModals(); alert("Teşekkürler!");
}

function openProfileModal() { profileModal.style.display = 'flex'; updateUI(); }
function closeAllModals() { reportModal.style.display='none'; verifyModal.style.display='none'; loginModal.style.display='none'; profileModal.style.display='none'; }
window.closeReportModal = closeAllModals; window.closeVerifyModal = closeAllModals; window.closeLoginModal = closeAllModals; window.closeProfileModal = closeAllModals;

/* --- 9. EKSTRALAR --- */
function getAlternative(name) {
    const i = metroStations.findIndex(s => s.name === name);
    if(i>0 && metroStations[i-1].status==='active') return metroStations[i-1].name;
    if(i<metroStations.length-1 && metroStations[i+1].status==='active') return metroStations[i+1].name;
    return "Otobüs kullanın";
}
function addXp(amount) { gameState.xp += amount; if(calculateLevel() > gameState.level) { gameState.level++; alert("Seviye Atladın!"); } }
function updateUI() { updateProfileUI(); } // Alias

window.handleProfileClick = () => gameState.isLoggedIn ? openProfileModal() : openLoginModal();
window.triggerListClick = (name) => {
    const s = metroStations.find(st => st.name === name);
    map.flyTo(s.coords, 15);
    setTimeout(() => triggerAction(name), 800);
}
document.getElementById('file-input').addEventListener('change', () => { hasPhoto=true; document.getElementById('file-label').innerText = "Fotoğraf Eklendi"; });
document.getElementById('sidebar-toggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('closed'));
window.onclick = (e) => { if(e.target.classList.contains('modal')) closeAllModals(); };

// Ticker
setInterval(() => {
    const t = document.getElementById('ticker-text');
    const msgs = ["Sistem: Hatay bakımda", "Ali K. Konak doğruladı", "Can B. Üçyol raporladı"];
    t.style.opacity = 0;
    setTimeout(() => { t.innerText = msgs[Math.floor(Math.random()*msgs.length)]; t.style.opacity = 1; }, 500);
}, 4000);
