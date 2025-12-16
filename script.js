// --- 1. HARİTA AYARLARI ---
// İzmir merkezli haritayı başlat
var map = L.map('map').setView([38.4237, 27.1428], 12);

// OpenStreetMap katmanını ekle
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// --- 2. İSTASYON VERİ TABANI ---
// (Burada senin için 'subLocations' yani çıkış noktalarını ekledim)
const metroStations = [
    { 
        name: "Fahrettin Altay", 
        coords: [38.3971, 27.0700], 
        status: "active", 
        desc: "İstinyePark & Otobüs Aktarma",
        subLocations: ["AVM Çıkışı", "Otobüs Aktarma Tarafı", "Mithatpaşa Cd.", "Asansör 1 (Meydan)"] 
    },
    { 
        name: "Poligon", 
        coords: [38.3950, 27.0780], 
        status: "active", 
        desc: "Denizmen Parkı",
        subLocations: ["Park Çıkışı", "Cadde Tarafı Asansör"] 
    },
    { 
        name: "Göztepe", 
        coords: [38.3960, 27.0850], 
        status: "active", 
        desc: "Sahil Bağlantısı",
        subLocations: ["Sahil Yönü", "Cadde Yönü"] 
    },
    { 
        name: "Hatay", 
        coords: [38.3980, 27.0950], 
        status: "active", 
        desc: "Renkli Durağı",
        subLocations: ["Renkli Çıkışı", "Pazar Yeri"] 
    },
    { 
        name: "İzmirspor", 
        coords: [38.4000, 27.1050], 
        status: "active", 
        desc: "Devlet Hastanesi Yakını",
        subLocations: ["Hastane Yönü", "Spor Salonu Yönü"] 
    },
    { 
        name: "Üçyol", 
        coords: [38.4050, 27.1150], 
        status: "active", 
        desc: "Betonyol & Karabağlar Bağlantısı",
        subLocations: ["Betonyol Çıkışı", "Meydan Çıkışı", "Yürüyen Merdivenler"] 
    },
    { 
        name: "Konak", 
        coords: [38.4169, 27.1280], 
        status: "active", 
        desc: "Valilik, Saat Kulesi & Vapur",
        subLocations: ["Valilik Çıkışı", "Vapur İskelesi Tarafı", "Kemeraltı Girişi"]
    },
    { 
        name: "Çankaya", 
        coords: [38.4224, 27.1360], 
        status: "inactive", // Örnek arızalı
        desc: "Bit Pazarı & Oteller",
        subLocations: ["Fevzipaşa Bulvarı", "Mezarlıkbaşı"]
    },
    { 
        name: "Basmane", 
        coords: [38.4240, 27.1450], 
        status: "active", 
        desc: "Gar & Fuar Girişi",
        subLocations: ["Gar Meydanı", "Fuar 9 Eylül Kapısı"]
    },
    { 
        name: "Hilal", 
        coords: [38.4280, 27.1550], 
        status: "active", 
        desc: "İZBAN Aktarma",
        subLocations: ["İZBAN Platformu", "Kemer Yönü"]
    },
    { 
        name: "Halkapınar", 
        coords: [38.4344, 27.1686], 
        status: "active", 
        desc: "Ana Aktarma Merkezi",
        subLocations: ["İZBAN Aktarma", "Tramvay Durağı", "Otobüs Durakları"]
    },
    { 
        name: "Stadyum", 
        coords: [38.4420, 27.1800], 
        status: "active", 
        desc: "Atatürk Stadı",
        subLocations: ["Stadyum Girişi", "Sanayi Tarafı"]
    },
    { 
        name: "Sanayi", 
        coords: [38.4490, 27.1890], 
        status: "active", 
        desc: "2. Sanayi Sitesi",
        subLocations: ["Sanayi Girişi"]
    },
    { 
        name: "Bölge", 
        coords: [38.4547, 27.2011], 
        status: "active", 
        desc: "Yaşar Üni. & Adliye",
        subLocations: ["Üniversite Kapısı", "Ağaçlı Yol"]
    },
    { 
        name: "Bornova", 
        coords: [38.4590, 27.2130], 
        status: "active", 
        desc: "Meydan & Hastane",
        subLocations: ["Hastane Tarafı", "Küçük Park Çıkışı", "Kampüs Girişi"]
    },
    { 
        name: "Ege Üniversitesi", 
        coords: [38.4615, 27.2210], 
        status: "active", 
        desc: "Kampüs İçi",
        subLocations: ["Kampüs Ana Giriş"]
    },
    { 
        name: "Evka-3", 
        coords: [38.4650, 27.2286], 
        status: "active", 
        desc: "Son Durak",
        subLocations: ["Otobüs Aktarma", "Semt Garajı"]
    }
];

// --- 3. METRO HATTINI ÇİZME ---
var lineCoords = metroStations.map(station => station.coords);
var polyline = L.polyline(lineCoords, {
    color: '#e74c3c', // Kırmızı renk
    weight: 6,        // Kalınlık
    opacity: 0.8,
    lineCap: 'round'
}).addTo(map);

// Haritayı çizgiye sığdır
map.fitBounds(polyline.getBounds());

// --- 4. ARAYÜZ OLUŞTURMA (LİSTE & MARKERLAR) ---
const listContainer = document.getElementById('station-list');
const countLabel = document.getElementById('result-count');

function initApp() {
    // Sayacı güncelle
    countLabel.innerText = `${metroStations.length} istasyon listelendi`;
    listContainer.innerHTML = ""; // Listeyi temizle

    metroStations.forEach(station => {
        // A. Haritaya Nokta Ekle
        const markerColor = station.status === 'active' ? '#2ecc71' : '#e74c3c';
        
        L.circleMarker(station.coords, {
            color: markerColor,
            radius: 8,
            fillOpacity: 1
        }).bindPopup(`<b>${station.name}</b><br>${station.desc}`).addTo(map);

        // B. Sol Panele Kart Ekle
        const card = document.createElement('div');
        card.className = 'station-card';
        
        const statusClass = station.status === 'active' ? 'dot-green' : 'dot-red';
        const statusText = station.status === 'active' ? 'Çalışıyor' : 'Arıza/Bakım Var';

        card.innerHTML = `
            <div class="card-header">
                <i class="fas fa-subway card-icon"></i>
                <span class="status-dot ${statusClass}"></span>
                <span style="font-size:0.85rem; color:#7f8c8d;">${statusText}</span>
            </div>
            <div class="card-title">${station.name} İstasyonu</div>
            <div class="card-info">
                ${station.desc}
            </div>
            <div style="margin-top:10px; font-size:0.8rem; color:#3498db; text-align:right;">
                <i class="fas fa-arrow-right"></i> Bildirim Yap
            </div>
        `;

        // Karta tıklama olayı
        card.addEventListener('click', () => {
            // 1. Haritada oraya git
            map.flyTo(station.coords, 16, { duration: 1.5 });
            
            // 2. Modalı aç (biraz gecikmeli ki kullanıcı haritayı görsün)
            setTimeout(() => {
                openReportModal(station.name);
            }, 800);
        });

        listContainer.appendChild(card);
    });
}

// Uygulamayı Başlat
initApp();


// --- 5. MODAL (POP-UP) İŞLEMLERİ ---
const modal = document.getElementById('reportModal');

function openReportModal(stationName) {
    const station = metroStations.find(s => s.name === stationName);
    if (!station) return;

    // Başlık ve Verileri Doldur
    document.getElementById('modal-station-name').innerText = station.name + " İstasyonu";
    
    // Select (Dropdown) Doldurma
    const select = document.getElementById('sub-location-select');
    select.innerHTML = ""; // Temizle

    if (station.subLocations && station.subLocations.length > 0) {
        station.subLocations.forEach(loc => {
            const opt = document.createElement('option');
            opt.value = loc;
            opt.innerText = loc;
            select.appendChild(opt);
        });
    } else {
        const opt = document.createElement('option');
        opt.innerText = "Genel Alan";
        select.appendChild(opt);
    }

    modal.style.display = 'flex';
}

function closeReportModal() {
    modal.style.display = 'none';
}

// Modal dışına tıklayınca kapatma
window.onclick = function(event) {
    if (event.target == modal) {
        closeReportModal();
    }
}

// Sorun Tipi Butonları (Görsel Seçim)
function selectIssue(btn, type) {
    document.querySelectorAll('.issue-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

// Form Gönderimi (Demo)
document.getElementById('reportForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert("Bildiriminiz başarıyla iletildi! Teşekkürler.");
    closeReportModal();
});
