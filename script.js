// --- VİDEO OYNATMA MANTIĞI ---
const video = document.getElementById('hero-video');
const playOverlay = document.getElementById('play-btn');

if (playOverlay && video) {
    playOverlay.addEventListener('click', function() {
        video.play();
        video.controls = true; // Oynatmaya başladıktan sonra kontrolleri göster
        playOverlay.style.display = 'none'; // Turuncu oynat butonunu gizle
    });
}

// --- AKILLI TEKLİF QUİZİ MANTIĞI ---
function nextStep(currentStep) {
    // Mevcut adımı gizle
    document.getElementById('step-' + currentStep).classList.remove('active');
    // Bir sonraki adımı göster
    document.getElementById('step-' + (currentStep + 1)).classList.add('active');
}

function prevStep(currentStep) {
    // Mevcut adımı gizle
    document.getElementById('step-' + currentStep).classList.remove('active');
    // Bir önceki adımı göster
    document.getElementById('step-' + (currentStep - 1)).classList.add('active');
}

// Form gönderimini engelleme (Şimdilik test amaçlı)
document.getElementById('quote-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Talebiniz başarıyla alındı! Vizi Medya sizinle en kısa sürede iletişime geçecektir.');
    // Formu sıfırla ve ilk adıma dön
    this.reset();
    document.querySelector('.quiz-step.active').classList.remove('active');
    document.getElementById('step-1').classList.add('active');
});
