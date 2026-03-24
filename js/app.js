const ARTIS_DATA = window.ARTIS_DATA;

let currentLang = localStorage.getItem('artiLang') || 'mr';

const elements = {
  container: document.getElementById('main-content'),
  currentTime: document.getElementById('current-time-text'),
  langToggle: document.getElementById('lang-toggle')
};

const UI_TEXT = {
  en: {
    subtitle: "ISKCON Daily Arti Manager",
    checking: "Checking time...",
    currentTime: "Current Time",
    liveSession: "Current Session",
    browseAll: "Browse All Artis",
    noLive: "No live session currently active. Browse our daily schedule:",
    backHome: "Back to Clock",
    dailyArtis: "Daily Artis",
    bhajans: "Bhajans & Artis"
  },
  mr: {
    subtitle: "इस्कॉन दैनिक आरती",
    checking: "वेळ तपासत आहे...",
    currentTime: "सध्याची वेळ",
    liveSession: "सध्याचे सत्र",
    browseAll: "सर्व आरत्या पहा",
    noLive: "सध्या कोणतेही लाइव्ह सत्र सुरू नाही. वेळापत्रक पहा:",
    backHome: "मुख्य पृष्ठ",
    dailyArtis: "दैनिक आरत्या",
    bhajans: "भजन आणि आरत्या"
  }
};

function updateLanguageUI() {
  document.querySelectorAll('[data-lang-key]').forEach(el => {
    const key = el.getAttribute('data-lang-key');
    el.textContent = UI_TEXT[currentLang][key];
  });
  if (elements.langToggle) {
    elements.langToggle.textContent = currentLang === 'en' ? 'मराठी' : 'English';
  }
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'mr' : 'en';
  localStorage.setItem('artiLang', currentLang);
  updateLanguageUI();
  checkCurrentArti(); // Re-render content
}

function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const label = UI_TEXT[currentLang].currentTime;
  elements.currentTime.textContent = `${label}: ${timeStr}`;
  
  if (now.getSeconds() === 0) {
    checkCurrentArti();
  }
}

function checkCurrentArti() {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeVal = currentHours * 60 + currentMinutes;

  const currentArti = ARTIS_DATA.find(arti => {
    return arti.times.some(time => {
      const [startH, startM] = time.start.split(':').map(Number);
      const [endH, endM] = time.end.split(':').map(Number);
      const startVal = startH * 60 + startM;
      const endVal = endH * 60 + endM;
      return currentTimeVal >= startVal && currentTimeVal < endVal;
    });
  });

  if (currentArti) {
    renderArti(currentArti);
  } else {
    renderNoArti();
  }
}

function renderArti(arti) {
  const timeSlot = arti.times.map(t => `${t.start} - ${t.end}`).join(', ');
  const title = arti.title[currentLang];
  
  elements.container.innerHTML = `
    <article class="arti-card">
      <div class="card-time">🕭 ${UI_TEXT[currentLang].liveSession}: ${timeSlot}</div>
      <h2 class="card-title">${title}</h2>
      ${arti.lyrics.map(lyric => `
        <div class="verse-block">
          <p class="lyrics">${lyric['verse_' + currentLang].replace(/\n/g, '<br>')}</p>
          <p class="meaning">${lyric['meaning_' + currentLang]}</p>
        </div>
      `).join('')}
    </article>
    <div class="nav-buttons">
      <button id="browse-all" class="btn btn-outline">${UI_TEXT[currentLang].browseAll}</button>
    </div>
  `;

  document.getElementById('browse-all')?.addEventListener('click', renderAllArtis);
}

function renderNoArti() {
  elements.container.innerHTML = `
    <div class="no-arti-state">
      <h2 style="font-family: 'Playfair Display', serif; font-size: 2.2rem; margin-bottom: 2rem;">${UI_TEXT[currentLang].bhajans}</h2>
      <p style="margin-bottom: 3rem; color: #ddd; font-weight: 300;">${UI_TEXT[currentLang].noLive}</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; text-align: left;">
        ${ARTIS_DATA.map(arti => `
          <a href="${arti.id}.html" class="arti-card" style="padding: 1.5rem; cursor: pointer; text-decoration: none; display: block; background: rgba(255,255,255,0.08);">
            <h3 style="font-family: 'Playfair Display', serif; margin-bottom: 0.5rem; color: #ffd700; font-size: 1.5rem;">${arti.title[currentLang]}</h3>
            <p style="font-size: 0.9rem; color: #ccc;">Time: ${arti.times.map(t => t.start + '-' + t.end).join(', ')}</p>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

function renderAllArtis() {
  elements.container.innerHTML = `
    <h2 style="font-family: 'Playfair Display', serif; font-size: 2.5rem; text-align: center; margin-bottom: 2rem;">${UI_TEXT[currentLang].dailyArtis}</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
      ${ARTIS_DATA.map(arti => `
        <a href="${arti.id}.html" class="arti-card" style="padding: 1.5rem; cursor: pointer; text-decoration: none; display: block;">
          <h3 style="font-family: 'Playfair Display', serif; margin-bottom: 0.5rem; color: #ffd700;">${arti.title[currentLang]}</h3>
          <p style="font-size: 0.9rem; color: #ccc;">Time: ${arti.times.map(t => t.start + '-' + t.end).join(', ')}</p>
        </a>
      `).join('')}
    </div>
    <div class="nav-buttons">
      <button id="back-home" class="btn btn-outline">${UI_TEXT[currentLang].backHome}</button>
    </div>
  `;

  document.getElementById('back-home')?.addEventListener('click', checkCurrentArti);
}

document.addEventListener('DOMContentLoaded', () => {
  if (elements.langToggle) {
    elements.langToggle.addEventListener('click', toggleLanguage);
  }
  updateLanguageUI();
  setInterval(updateClock, 1000);
  updateClock();
  checkCurrentArti();
});
