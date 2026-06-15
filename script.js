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

// --- WHATSAPP ENTEGRELİ FORM GÖNDERİMİ ---
document.getElementById('quote-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 1. WhatsApp Numaran (Ülke kodu ile, + ve boşluk olmadan)
    const viziWhatsAppNumber = "905336817651"; 
    
    // 2. Form Verilerini Topla
    
    // Adım 1: Odak Noktası
    const projectTypeEl = document.querySelector('input[name="project_type"]:checked');
    const projectType = projectTypeEl ? projectTypeEl.nextElementSibling.innerText.trim() : "Belirtilmedi";
    
    // Adım 2: Teknik Beklentiler (Çoklu Seçim)
    const techNeedsEls = document.querySelectorAll('input[name="tech_needs"]:checked');
    let techNeedsArray = [];
    techNeedsEls.forEach(function(el) {
        techNeedsArray.push(el.nextElementSibling.innerText.trim());
    });
    const techNeeds = techNeedsArray.length > 0 ? techNeedsArray.join(', ') : "Belirtilmedi";
    
    // Adım 3: Çalışma Modeli
    const modelEl = document.querySelector('input[name="model"]:checked');
    const modelText = modelEl ? modelEl.nextElementSibling.innerText.replace('\n', ' ').trim() : "Belirtilmedi";
    
    // Adım 4: İletişim Bilgileri
    const inputs = document.querySelectorAll('#step-4 input');
    const customerName = inputs.length > 0 && inputs[0].value ? inputs[0].value.trim() : "Belirtilmedi";
    const customerEmail = inputs.length > 1 && inputs[1].value ? inputs[1].value.trim() : "Belirtilmedi";
    const customerPhone = inputs.length > 2 && inputs[2].value ? inputs[2].value.trim() : "Belirtilmedi";

    // 3. Profesyonel WhatsApp Mesaj Taslağını Oluştur
    const whatsappMessage = 
`Merhaba Vizi Medya! Web siteniz üzerinden yeni bir proje talebi oluşturdum. Detaylar aşağıdadır:

👤 *Kişisel Bilgiler*
İsim: ${customerName}
E-posta: ${customerEmail}
Telefon: ${customerPhone}

🎬 *Proje Detayları*
Odak Noktası: ${projectType}
Teknik Beklentiler: ${techNeeds}
Çalışma Modeli: ${modelText}

Bu talebimle ilgili fiyat teklifinizi ve geri dönüşünüzü bekliyorum. İyi çalışmalar!`;

    // 4. WhatsApp API Linkini Oluştur ve Yönlendir
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${viziWhatsAppNumber}?text=${encodedMessage}`;
    
    // Kullanıcıyı WhatsApp'a yönlendir (Yeni sekmede açar)
    window.open(whatsappUrl, '_blank');
    
    // 5. Yönlendirme sonrası formu sıfırla ve ilk adıma dön
    this.reset();
    const activeStep = document.querySelector('.quiz-step.active');
    if(activeStep) activeStep.classList.remove('active');
    
    const firstStep = document.getElementById('step-1');
    if(firstStep) {
        firstStep.classList.add('active');
        firstStep.style.opacity = '1';
        firstStep.style.transform = 'translateY(0)';
    }
});
