// --- NAVBAR SCROLL EFEKTİ ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// --- VİDEO OYNATMA MANTIĞI ---
const video = document.getElementById('hero-video');
const playBtnContainer = document.getElementById('play-btn');
const heroContent = document.querySelector('.hero-content');
const heroOverlay = document.querySelector('.hero-overlay');

if (playBtnContainer && video) {
    playBtnContainer.addEventListener('click', function() {
        video.play();
        video.controls = true;
        
        // Video başladığında arayüz kalabalığını gizle
        playBtnContainer.style.opacity = '0';
        heroContent.style.opacity = '0';
        heroOverlay.style.opacity = '0';
        
        setTimeout(() => {
            playBtnContainer.style.display = 'none';
        }, 300);
    });
}

// --- SCROLL ANİMASYONLARI (Intersection Observer) ---
const revealElements = document.querySelectorAll('.reveal');

const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Sadece bir kere çalışsın
        }
    });
}, revealOptions);

revealElements.forEach(el => {
    revealOnScroll.observe(el);
});

// --- AKILLI TEKLİF QUİZİ ---
function nextStep(currentStep) {
    const current = document.getElementById('step-' + currentStep);
    const next = document.getElementById('step-' + (currentStep + 1));
    
    // Geçiş efekti için
    current.style.opacity = '0';
    current.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        current.classList.remove('active');
        next.classList.add('active');
        
        // Tarayıcıya çizim yapması için ufak bir gecikme verip animasyonu tetikliyoruz
        setTimeout(() => {
            next.style.opacity = '1';
            next.style.transform = 'translateY(0)';
        }, 50);
    }, 400);
}

function prevStep(currentStep) {
    const current = document.getElementById('step-' + currentStep);
    const prev = document.getElementById('step-' + (currentStep - 1));
    
    current.style.opacity = '0';
    current.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        current.classList.remove('active');
        prev.classList.add('active');
        
        setTimeout(() => {
            prev.style.opacity = '1';
            prev.style.transform = 'translateY(0)';
        }, 50);
    }, 400);
}

// Form Gönderimi
document.getElementById('quote-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.innerText;
    
    submitBtn.innerText = 'Gönderiliyor...';
    
    // Simüle edilmiş sunucu yanıtı
    setTimeout(() => {
        alert('Talebiniz başarıyla alındı! Vizi Medya ekibi sizinle en kısa sürede iletişime geçecektir.');
        this.reset();
        submitBtn.innerText = originalText;
        
        // İlk adıma dön
        const activeStep = document.querySelector('.quiz-step.active');
        if(activeStep) activeStep.classList.remove('active');
        document.getElementById('step-1').classList.add('active');
    }, 1000);
});
