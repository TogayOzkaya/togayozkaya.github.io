document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. HARİTA VE İSTASYON VERİLERİ KURULUMU
    // ==========================================
    
    // İzmir Metro İstasyonları Örnek Veri Seti
    const stations = [
        { id: 1, name: "Kaymakamlık", lat: 38.3861, lng: 26.9854, status: "ok" },
        { id: 2, name: "100. Yıl Cumhuriyet Şehitlik", lat: 38.3875, lng: 27.0012, status: "pending" },
        { id: 3, name: "Narlıdere İtfaiye", lat: 38.3890, lng: 27.0150, status: "ok" },
        { id: 4, name: "Güzel Sanatlar", lat: 38.3905, lng: 27.0300, status: "ok" },
        { id: 5, name: "Dokuz Eylül Üniversitesi", lat: 38.3920, lng: 27.0450, status: "error" },
        { id: 6, name: "Çağdaş", lat: 38.3910, lng: 27.0550, status: "ok" },
        { id: 7, name: "Balçova", lat: 38.3895, lng: 27.0620, status: "ok" },
        { id: 8, name: "Fahrettin Altay", lat: 38.3885, lng: 27.0699, status: "ok" },
        { id: 9, name: "Poligon", lat: 38.3942, lng: 27.0805, status: "ok" },
        { id: 10, name: "Göztepe", lat: 38.3995, lng: 27.0880, status: "ok" },
        { id: 11, name: "Hatay", lat: 38.4050, lng: 27.0985, status: "error" },
        { id: 12, name: "İzmirspor", lat: 38.4105, lng: 27.1080, status: "ok" },
        { id: 13, name: "Üçyol", lat: 38.4150, lng: 27.1185, status: "ok" },
        { id: 14, name: "Konak", lat: 38.4189, lng: 27.1287, status: "pending" },
        { id: 15, name: "Çankaya", lat: 38.4230, lng: 27.1350, status: "ok" },
        { id: 16, name: "Basmane", lat: 38.4255, lng: 27.1405, status: "ok" },
        { id: 17, name: "Hilal", lat: 38.4265, lng: 27.1490, status: "ok" },
        { id: 18, name: "Halkapınar", lat: 38.4325, lng: 27.1550, status: "ok" },
        { id: 19, name: "Stadyum", lat: 38.4385, lng: 27.1650, status: "error" },
        { id: 20, name: "Sanayi", lat: 38.4440, lng: 27.1750, status: "ok" },
        { id: 21, name: "Bölge", lat: 38.4505, lng: 27.1850, status: "ok" },
        { id: 22, name: "Bornova", lat: 38.4598, lng: 27.2212, status: "ok" },
        { id: 23, name: "Ege Üniversitesi", lat: 38.4635, lng: 27.2300, status: "ok" },
        { id: 24, name: "Evka 3", lat: 38.4670, lng: 27.2400, status: "ok" }
    ];

    // Haritayı Başlat (İzmir merkeze odaklı)
    const map = L.map('map', { zoomControl: false }).setView([38.4237, 27.1428], 12);
    
    // Açık Kaynaklı Harita Görünümü (OSM)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap - Visi',
        maxZoom: 18
    }).addTo(map);

    // Zoom Butonlarını Sağ Alta Al
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Metro Hattını (Kırmızı Çizgi) Haritaya Çiz
    const lineCoords = stations.map(s => [s.lat, s.lng]);
    L.polyline(lineCoords, { color: '#e74c3c', weight: 4, opacity: 0.7 }).addTo(map);

    // ==========================================
    // 2. İSTASYONLARI HARİTAYA VE LİSTEYE EKLEME
    // ==========================================
    
    const stationListElement = document.getElementById('station-list');
    document.getElementById('result-count').innerText = stations.length;

    // Özel İşaretçi (Marker) Stili Oluşturucu
    const getIcon = (status) => {
        let color = status === 'ok' ? '#27ae60' : (status === 'error' ? '#c0392b' : '#f39c12');
        return L.divIcon({
            className: 'custom-station-icon',
            html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
        });
    };

    stations.forEach(station => {
        // 1. Haritaya İşaretçi Ekle
        const marker = L.marker([station.lat, station.lng], { icon: getIcon(station.status) }).addTo(map);
        
        // İşaretçiye Tıklanınca Çıkacak Küçük Baloncuk (Popup)
        marker.bindPopup(`
            <div style="text-align:center; padding: 5px;">
                <h4 style="margin:0 0 10px 0; color:#2c3e50;">${station.name}</h4>
                <button onclick="openReportModal('${station.name}')" style="background:#1e69de; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; width:100%; font-weight:bold;">
                    Durum Bildir
                </button>
            </div>
        `);

        // 2. Sol Panele (Sidebar) Liste Elemanı Ekle
        let statusBadge = '';
        if(station.status === 'ok') {
            statusBadge = '<span class="status-badge status-ok"><i class="fas fa-check-circle"></i> Sorun Yok</span>';
        } else if(station.status === 'error') {
            statusBadge = '<span class="status-badge status-err"><i class="fas fa-exclamation-circle"></i> Arıza Bildirildi</span>';
        } else {
            statusBadge = '<span class="status-badge status-pending"><i class="fas fa-clock"></i> Doğrulanıyor</span>';
        }

        stationListElement.innerHTML += `
            <div class="station-card" onclick="focusStation(${station.lat}, ${station.lng})">
                <div class="card-info">
                    <div class="card-header">
                        <i class="fas fa-subway" style="color:var(--primary-color)"></i> ${station.name}
                    </div>
                    ${statusBadge}
                </div>
                <div class="card-actions">
                    <button class="btn-icon-action btn-report" title="Arıza Bildir" onclick="event.stopPropagation(); openReportModal('${station.name}')">
                        <i class="fas fa-bullhorn"></i>
                    </button>
                </div>
            </div>
        `;
    });

    // Listeden bir istasyona tıklanınca haritayı oraya kaydırır
    window.focusStation = function(lat, lng) {
        map.setView([lat, lng], 16, { animate: true, duration: 1 });
        
        if(window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.add('closed');
        }
    };

    // ==========================================
    // 3. MODAL (PENCERE) KONTROLLERİ VE KULLANICI GİRİŞİ
    // ==========================================
    
    let isUserLoggedIn = false; // Sisteme giriş yapılıp yapılmadığını tutar

    // Sol üstteki Profil kutusuna tıklayınca çalışır
    window.handleProfileClick = function() {
        if (isUserLoggedIn) {
            document.getElementById('profileModal').style.display = 'flex';
        } else {
            document.getElementById('loginModal').style.display = 'flex';
        }
    };

    // Modalları Kapatma Fonksiyonları
    window.closeLoginModal = function() { document.getElementById('loginModal').style.display = 'none'; }
    window.closeProfileModal = function() { document.getElementById('profileModal').style.display = 'none'; }
    window.closeReportModal = function() { document.getElementById('reportModal').style.display = 'none'; }
    
    // Bildirim yapma penceresini açar
    window.openReportModal = function(stationName) { 
        document.getElementById('modal-station-name').innerText = stationName;
        document.getElementById('reportModal').style.display = 'flex'; 
    };

    // Kullanıcı Giriş/Kayıt Çıkış ve Sıfırlama İşlemi
    window.resetData = function() {
        isUserLoggedIn = false;
        document.getElementById('sidebar-user-name').innerText = "Misafir";
        document.getElementById('sidebar-user-desc').innerText = "Giriş Yap";
        document.getElementById('sidebar-user-img').src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
        closeProfileModal();
        alert("Hesabınızdan başarıyla çıkış yapıldı.");
    };

    // Giriş / Kayıt İşlemini Simüle Et (Arayüzde değişikliği gösterir)
    // Not: harita.html içindeki inline kodların bu ana fonksiyona erişebilmesi için window'a ekledik.
    window.handleUserAuth = function() {
        isUserLoggedIn = true;
        document.getElementById('sidebar-user-name').innerText = "Togay Özkay";
        document.getElementById('sidebar-user-desc').innerText = "Seviye 1";
        document.getElementById('sidebar-user-img').src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; // Şık bir avatar
        
        closeLoginModal();
    };

    // Arama Kutusu Filtreleme Sistemi
    const searchInput = document.getElementById('station-search');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.station-card');
            let visibleCount = 0;

            cards.forEach(card => {
                const name = card.querySelector('.card-header').innerText.toLowerCase();
                if(name.includes(term)) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            document.getElementById('result-count').innerText = visibleCount;
        });
    }
});
