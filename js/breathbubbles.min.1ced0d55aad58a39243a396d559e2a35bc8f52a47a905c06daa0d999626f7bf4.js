// ========================================
// Language Support System
// ========================================

class LanguageManager {
  constructor() {
    this.currentLang = 'zh'; // Default to Chinese
    this.supportedLangs = ['zh', 'en'];
    this.breathingTexts = {
      zh: ['吸气', '屏息', '呼气', '暂停'],
      en: ['Inhale', 'Hold', 'Exhale', 'Pause']
    };
    
    this.init();
  }
  
  init() {
    // Detect user's preferred language
    this.detectLanguage();
    
    // Set up language switch buttons
    this.setupLanguageSwitcher();
    
    // Apply initial language
    this.applyLanguage(this.currentLang);
  }
  
  detectLanguage() {
    // Check localStorage first
    const savedLang = localStorage.getItem('bb-language');
    if (savedLang && this.supportedLangs.includes(savedLang)) {
      this.currentLang = savedLang;
      return;
    }
    
    // Check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('zh')) {
      this.currentLang = 'zh';
    } else {
      this.currentLang = 'en';
    }
    
    // Check user's region for more specific detection
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // This is a simple example - in reality you'd use a geolocation service
        // For now, we'll use the browser language detection
      }, () => {
        // Geolocation failed, keep browser language detection
      });
    }
  }
  
  setupLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.bb-lang-btn');
    
    langButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const newLang = btn.getAttribute('data-lang');
        this.switchLanguage(newLang);
      });
    });
  }
  
  switchLanguage(lang) {
    if (!this.supportedLangs.includes(lang) || lang === this.currentLang) {
      return;
    }
    
    this.currentLang = lang;
    this.applyLanguage(lang);
    
    // Save to localStorage
    localStorage.setItem('bb-language', lang);
    
    // Update URL if needed (optional)
    this.updateURL(lang);
  }
  
  applyLanguage(lang) {
    // Update document language
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.body.setAttribute('data-lang', lang);
    
    // Update all elements with language data attributes
    const elements = document.querySelectorAll('[data-zh], [data-en]');
    elements.forEach(element => {
      const text = element.getAttribute(`data-${lang}`);
      if (text) {
        if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
          element.textContent = text;
        } else {
          element.innerHTML = text;
        }
      }
    });
    
    // Update language switcher buttons
    document.querySelectorAll('.bb-lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    
    // Update page title and meta description
    this.updatePageMeta(lang);
    
    // Update breathing exercise texts if active
    this.updateBreathingTexts(lang);
  }
  
  updatePageMeta(lang) {
    const titles = {
      zh: '呼吸泡泡 - 一口呼吸，泡走压力',
      en: 'BreathBubbles - One breath, bubble away stress'
    };
    
    const descriptions = {
      zh: '呼吸泡泡：基于HRV的智能压力监测，配合治愈系呼吸训练动画，帮助年轻人减压放松。支持iPhone和Apple Watch。',
      en: 'BreathBubbles: HRV-based intelligent stress monitoring with healing breathing animations to help young people reduce stress and relax. Support iPhone and Apple Watch.'
    };
    
    document.title = titles[lang];
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = descriptions[lang];
    }
  }
  
  updateBreathingTexts(lang) {
    // Update breathing exercise if it's running
    const breathingExercise = window.breathingExerciseInstance;
    if (breathingExercise) {
      breathingExercise.phases = this.breathingTexts[lang];
    }
  }
  
  updateURL(lang) {
    // Optional: Update URL to reflect language choice
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
  }
  
  getCurrentLanguage() {
    return this.currentLang;
  }
  
  getBreathingTexts(lang = this.currentLang) {
    return this.breathingTexts[lang] || this.breathingTexts.zh;
  }
}

// ========================================
// Enhanced BreathingExercise with Language Support
// ========================================

class BreathingExercise {
  constructor() {
    this.isActive = false;
    this.startTime = 0;
    this.phases = ['吸气', '屏息', '呼气', '暂停'];
    this.phaseDurations = [4000, 1000, 4000, 1000]; // 4-1-4-1 breathing pattern
    this.currentPhase = 0;
    this.phaseStartTime = 0;
    
    this.bubble = document.querySelector('.bb-breathing-bubble');
    this.text = document.querySelector('.bb-breathing-text');
    this.timer = document.querySelector('.bb-breathing-timer');
    this.btn = document.getElementById('startBreathing');
    
    // Store reference for language updates
    window.breathingExerciseInstance = this;
    
    this.init();
  }
  
  init() {
    if (this.btn) {
      this.btn.addEventListener('click', () => this.toggle());
    }
    
    // Update phases based on current language
    this.updateLanguage();
  }
  
  updateLanguage() {
    const langManager = window.languageManagerInstance;
    if (langManager) {
      this.phases = langManager.getBreathingTexts();
    }
  }
  
  toggle() {
    if (this.isActive) {
      this.stop();
    } else {
      this.start();
    }
  }
  
  start() {
    this.isActive = true;
    this.startTime = Date.now();
    this.phaseStartTime = Date.now();
    this.currentPhase = 0;
    
    // Update button text based on current language
    const langManager = window.languageManagerInstance;
    const currentLang = langManager ? langManager.getCurrentLanguage() : 'zh';
    const stopTexts = {
      zh: '停止练习',
      en: 'Stop Practice'
    };
    
    this.btn.textContent = stopTexts[currentLang];
    this.btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    
    this.animate();
    this.updateTimer();
  }
  
  stop() {
    this.isActive = false;
    
    // Update button text based on current language
    const langManager = window.languageManagerInstance;
    const currentLang = langManager ? langManager.getCurrentLanguage() : 'zh';
    const startTexts = {
      zh: '开始练习',
      en: 'Start Practice'
    };
    
    this.btn.textContent = startTexts[currentLang];
    this.btn.style.background = '';
    
    // Reset bubble
    if (this.bubble) {
      this.bubble.style.transform = 'scale(1)';
      this.text.textContent = this.phases[0];
    }
  }
  
  animate() {
    if (!this.isActive) return;
    
    const now = Date.now();
    const phaseElapsed = now - this.phaseStartTime;
    const phaseDuration = this.phaseDurations[this.currentPhase];
    
    // Check if we need to move to next phase
    if (phaseElapsed >= phaseDuration) {
      this.currentPhase = (this.currentPhase + 1) % this.phases.length;
      this.phaseStartTime = now;
    }
    
    // Update text
    if (this.text) {
      this.text.textContent = this.phases[this.currentPhase];
    }
    
    // Animate bubble based on phase
    if (this.bubble) {
      const progress = (now - this.phaseStartTime) / this.phaseDurations[this.currentPhase];
      let scale = 1;
      
      if (this.currentPhase === 0) { // 吸气
        scale = 1 + (progress * 0.5);
      } else if (this.currentPhase === 1) { // 屏息
        scale = 1.5;
      } else if (this.currentPhase === 2) { // 呼气
        scale = 1.5 - (progress * 0.5);
      } else { // 暂停
        scale = 1;
      }
      
      this.bubble.style.transform = `scale(${scale})`;
    }
    
    requestAnimationFrame(() => this.animate());
  }
  
  updateTimer() {
    if (!this.isActive) return;
    
    const elapsed = Date.now() - this.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    if (this.timer) {
      this.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    setTimeout(() => this.updateTimer(), 1000);
  }
}

class SmoothScroll {
  constructor() {
    this.init();
  }
  
  init() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          const navHeight = document.querySelector('.bb-nav')?.offsetHeight || 0;
          const targetPosition = target.offsetTop - navHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}

class ParallaxEffects {
  constructor() {
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', () => {
      this.updateParallax();
    });
  }
  
  updateParallax() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    // Parallax effect for hero background
    const hero = document.querySelector('.bb-hero');
    if (hero) {
      hero.style.transform = `translateY(${rate}px)`;
    }
    
    // Parallax effect for floating elements
    document.querySelectorAll('.bb-team-member').forEach((member, index) => {
      const rate = scrolled * -0.1 * (index + 1);
      member.style.transform = `translateY(${rate}px)`;
    });
  }
}

class NavigationController {
  constructor() {
    this.nav = document.querySelector('.bb-nav');
    this.lastScrollTop = 0;
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', () => {
      this.updateNavigation();
    });
    
    // Mobile menu toggle
    const toggle = document.querySelector('.bb-nav-mobile-toggle');
    const links = document.querySelector('.bb-nav-links');
    
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        links.classList.toggle('active');
      });
    }
  }
  
  updateNavigation() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (this.nav) {
      if (scrollTop > 100) {
        this.nav.style.background = 'rgba(255, 255, 255, 0.98)';
        this.nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
      } else {
        this.nav.style.background = 'rgba(255, 255, 255, 0.95)';
        this.nav.style.boxShadow = 'none';
      }
      
      // Hide/show nav on scroll
      if (scrollTop > this.lastScrollTop && scrollTop > 200) {
        this.nav.style.transform = 'translateY(-100%)';
      } else {
        this.nav.style.transform = 'translateY(0)';
      }
    }
    
    this.lastScrollTop = scrollTop;
  }
}

class AnimationObserver {
  constructor() {
    this.init();
  }
  
  init() {
    // Create intersection observer for animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe elements that should animate in
    document.querySelectorAll('.bb-feature-card, .bb-testimonial-card, .bb-phone-mockup, .bb-watch-mockup').forEach(el => {
      observer.observe(el);
    });
  }
}

class BubbleBackground {
  constructor() {
    this.createFloatingBubbles();
  }
  
  createFloatingBubbles() {
    const sections = document.querySelectorAll('.bb-section');
    
    sections.forEach(section => {
      if (Math.random() > 0.5) { // Add bubbles to random sections
        const bubble = document.createElement('div');
        bubble.className = 'floating-bubble';
        bubble.style.cssText = `
          position: absolute;
          width: ${20 + Math.random() * 40}px;
          height: ${20 + Math.random() * 40}px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(139, 92, 246, 0.3));
          border-radius: 50%;
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          animation: floatUpDown ${3 + Math.random() * 4}s ease-in-out infinite;
          animation-delay: ${Math.random() * 2}s;
          pointer-events: none;
          z-index: 0;
        `;
        
        section.style.position = 'relative';
        section.appendChild(bubble);
      }
    });
  }
}

// Custom scroll animations
const style = document.createElement('style');
style.textContent = `
  @keyframes floatUpDown {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-20px) scale(1.1); }
  }
  
  .bb-feature-card,
  .bb-testimonial-card,
  .bb-phone-mockup,
  .bb-watch-mockup {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .bb-feature-card.animate-in,
  .bb-testimonial-card.animate-in,
  .bb-phone-mockup.animate-in,
  .bb-watch-mockup.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    .bb-nav-links {
      position: fixed;
      top: 70px;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      flex-direction: column;
      padding: 2rem;
      transform: translateY(-100%);
      transition: all 0.3s ease;
      z-index: 999;
    }
    
    .bb-nav-links.active {
      transform: translateY(0);
    }
    
    .bb-nav-mobile-toggle.active span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    
    .bb-nav-mobile-toggle.active span:nth-child(2) {
      opacity: 0;
    }
    
    .bb-nav-mobile-toggle.active span:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -6px);
    }
  }
`;
document.head.appendChild(style);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize language manager first
  window.languageManagerInstance = new LanguageManager();
  
  // Then initialize other components
  new BreathingExercise();
  new SmoothScroll();
  new ParallaxEffects();
  new NavigationController();
  new AnimationObserver();
  new BubbleBackground();
  
  // Add some interactive touches
  addInteractiveTouches();
});

function addInteractiveTouches() {
  // Add hover effects to download buttons
  document.querySelectorAll('.bb-download-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-4px) scale(1.02)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
  
  // Add click effect to feature cards
  document.querySelectorAll('.bb-feature-card').forEach(card => {
    card.addEventListener('click', () => {
      card.style.transform = 'translateY(-12px)';
      setTimeout(() => {
        card.style.transform = '';
      }, 200);
    });
  });
  
  // Add testimonial card interactions
  document.querySelectorAll('.bb-testimonial-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.querySelector('.bb-author-avatar').style.transform = 'scale(1.1) rotate(5deg)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.querySelector('.bb-author-avatar').style.transform = '';
    });
  });
  
  // Add loading states for download buttons
  document.querySelectorAll('.bb-download-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const originalText = btn.innerHTML;
      btn.innerHTML = '<div style="display: flex; align-items: center; gap: 8px;"><div style="width: 16px; height: 16px; border: 2px solid #fff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>Loading...</div>';
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        alert('这里会跳转到相应的应用商店！');
      }, 2000);
    });
  });
}

// Add spin animation for loading
const spinStyle = document.createElement('style');
spinStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinStyle);
