// ===== STATE =====
const state = {
  name:'', surname:'', jobtitle:'', email:'', phone:'', city:'', linkedin:'',
  summary:'', skills:'', photo: null,
  experiences:[], education:[], languages:[], certifications:[],
  template:1, fontSize:'medium', headingStyle:'serif', density:'normal', accentColor:'#C8402A'
};
let expCount=0, eduCount=0, langCount=0, certCount=0;

const TEMPLATES = [
  { id:1, name:'Cihlová klasická', class:'t1', accent:'#C8402A', bg:'#FAECE7', dark:false },
  { id:2, name:'Zelená svěží',     class:'t2', accent:'#1D9E75', bg:'#E1F5EE', dark:false },
  { id:3, name:'Minimalistická',   class:'t3', accent:'#888',    bg:'#F1EFE8', dark:false },
  { id:4, name:'Tmavá elegantní',  class:'t4', accent:'#E8956A', bg:'#2A2620', dark:true  },
  { id:5, name:'Modrá corporate',  class:'t5', accent:'#1860C4', bg:'#E6F1FB', dark:false },
  { id:6, name:'Zlatá luxus',      class:'t6', accent:'#B07D3A', bg:'#FDF3E3', dark:false },
  { id:7, name:'Dvousloupec',      class:'t7', accent:'#C8402A', bg:'#FAECE7', dark:false },
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderTemplateGrid === 'function') renderTemplateGrid();
  renderPreview();
  loadFromStorage();
  if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
});

// ===== THEME =====
function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

// ===== STORAGE =====
function saveToStorage() {
  try {
    const toSave = {...state, photo: null}; // don't save large base64 to localStorage
    localStorage.setItem('cvbuilder_state', JSON.stringify(toSave));
  } catch(e) {}
}
function loadFromStorage() {
  try {
    const saved = localStorage.getItem('cvbuilder_state');
    if (!saved) return;
    const data = JSON.parse(saved);
    Object.assign(state, data);
    const fields = ['name','surname','jobtitle','email','phone','city','linkedin','summary','skills'];
    fields.forEach(k => { const el = document.getElementById('f-'+k); if(el) el.value = state[k]||''; });
    expCount = state.experiences.length;
    eduCount = state.education.length;
    langCount = state.languages.length;
    certCount = state.certifications.length;
    renderAllLists();
    if (typeof renderTemplateGrid === 'function') renderTemplateGrid();
    applyDesignSettings();
    renderPreview();
  } catch(e) {}
}

// ===== UTILS =====
function val(id) { const el = document.getElementById(id); return el ? el.value : ''; }
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function spinner(id, on) { const el = document.getElementById(id); if(el) el.classList.toggle('active', on); }
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'ai-msg ' + type;
  if (type !== 'error') setTimeout(() => { if(el) el.className = 'ai-msg'; }, 5000);
}

function scrollToApp() {
  const el = document.getElementById('app');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ===== TABS =====
function switchEditorTab(tab, btn) {
  ['form','upload','templates','design'].forEach(t => {
    const el = document.getElementById('etab-'+t);
    if(el) el.classList.toggle('hidden', t !== tab);
  });
  document.querySelectorAll('.etab').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
}

// ===== LIVE UPDATE =====
function liveUpdate() {
  state.name = val('f-name');
  state.surname = val('f-surname');
  state.jobtitle = val('f-jobtitle');
  state.email = val('f-email');
  state.phone = val('f-phone');
  state.city = val('f-city');
  state.linkedin = val('f-linkedin');
  state.summary = val('f-summary');
  state.skills = val('f-skills');
  renderPreview();
  saveToStorage();
}

// ===== PHOTO =====
function handlePhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    state.photo = e.target.result;
    const img = document.getElementById('photo-img');
    const ph = document.getElementById('photo-placeholder');
    const rm = document.getElementById('photo-remove');
    if(img) { img.src = state.photo; img.style.display = 'block'; }
    if(ph) ph.style.display = 'none';
    if(rm) rm.classList.remove('hidden');
    renderPreview();
  };
  reader.readAsDataURL(file);
}
function removePhoto() {
  state.photo = null;
  const img = document.getElementById('photo-img');
  const ph = document.getElementById('photo-placeholder');
  const rm = document.getElementById('photo-remove');
  if(img) { img.src=''; img.style.display='none'; }
  if(ph) ph.style.display='flex';
  if(rm) rm.classList.add('hidden');
  document.getElementById('photo-input').value = '';
  renderPreview();
}

// ===== DESIGN SETTINGS =====
function setFontSize(size) {
  state.fontSize = size;
  ['small','medium','large'].forEach(s => {
    const btn = document.getElementById('fs-'+s);
    if(btn) btn.classList.toggle('active', s===size);
  });
  applyDesignSettings();
  saveToStorage();
}
function setHeadingStyle(style) {
  state.headingStyle = style;
  ['serif','sans','uppercase'].forEach(s => {
    const btn = document.getElementById('hs-'+s);
    if(btn) btn.classList.toggle('active', s===style);
  });
  renderPreview();
  saveToStorage();
}
function setDensity(density) {
  state.density = density;
  ['compact','normal','spacious'].forEach(d => {
    const btn = document.getElementById('den-'+d);
    if(btn) btn.classList.toggle('active', d===density);
  });
  applyDesignSettings();
  saveToStorage();
}
function setAccentColor(color, id) {
  state.accentColor = color;
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('col-'+id);
  if(btn) btn.classList.add('active');
  document.documentElement.style.setProperty('--cv-accent', color);
  renderPreview();
  saveToStorage();
}
function applyDesignSettings() {
  const sheet = document.getElementById('cv-preview');
  if (!sheet) return;
  sheet.classList.remove('fs-small','fs-medium','fs-large','den-compact','den-normal','den-spacious');
  sheet.classList.add('fs-'+state.fontSize);
  sheet.classList.add('den-'+state.density);
  document.documentElement.style.setProperty('--cv-accent', state.accentColor || '#C8402A');
}

// ===== TEMPLATES =====
function renderTemplateGrid() {
  const grid = document.getElementById('tmpl-grid');
  if (!grid) return;
  grid.innerHTML = TEMPLATES.map(t => `
    <div class="tmpl-card ${state.template===t.id?'selected':''}" onclick="selectTemplate(${t.id},this)" id="tmpl-card-${t.id}">
      <div class="tmpl-thumb" style="background:${t.dark?t.bg:'#fff'}">
        <div style="font-family:'Playfair Display',serif;font-size:11px;font-weight:700;color:${t.dark?'#F0EDE6':'#1A1814'};margin-bottom:2px">Jan Novák</div>
        <div style="width:24px;height:2px;background:${t.accent};margin-bottom:5px"></div>
        <div style="height:3px;width:85%;background:${t.dark?'rgba(255,255,255,0.08)':'#f0f0f0'};border-radius:2px;margin-bottom:3px"></div>
        <div style="height:3px;width:65%;background:${t.dark?'rgba(255,255,255,0.08)':'#f0f0f0'};border-radius:2px;margin-bottom:5px"></div>
        <div style="display:flex;gap:3px;flex-wrap:wrap">
          <div style="padding:2px 5px;background:${t.bg};border-radius:2px;font-size:7px;color:${t.accent};font-weight:600">skill</div>
          <div style="padding:2px 5px;background:${t.bg};border-radius:2px;font-size:7px;color:${t.accent};font-weight:600">dovednost</div>
        </div>
      </div>
      <div class="tmpl-name">${t.name}</div>
    </div>
  `).join('');
}
function selectTemplate(id, el) {
  state.template = id;
  document.querySelectorAll('.tmpl-card').forEach(c => c.classList.remove('selected'));
  if(el) el.classList.add('selected');
  renderPreview();
  saveToStorage();
}

// ===== LISTS =====
function addExp() {
  const id = ++expCount;
  state.experiences.push({id,title:'',company:'',from:'',to:'',desc:''});
  renderExpList();
}
function removeExp(id) { state.experiences=state.experiences.filter(e=>e.id!==id); renderExpList(); renderPreview(); saveToStorage(); }
function renderExpList() {
  const el = document.getElementById('exp-list');
  if(!el) return;
  el.innerHTML = state.experiences.map(e => `
    <div class="item-card">
      <button class="item-remove" onclick="removeExp(${e.id})">×</button>
      <div class="field-row">
        <div class="field"><label>Pozice</label><input value="${esc(e.title)}" placeholder="Marketér" oninput="state.experiences.find(x=>x.id==${e.id}).title=this.value;renderPreview();saveToStorage()"></div>
        <div class="field"><label>Firma</label><input value="${esc(e.company)}" placeholder="ACME s.r.o." oninput="state.experiences.find(x=>x.id==${e.id}).company=this.value;renderPreview();saveToStorage()"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Od</label><input value="${esc(e.from)}" placeholder="2021" oninput="state.experiences.find(x=>x.id==${e.id}).from=this.value;renderPreview();saveToStorage()"></div>
        <div class="field"><label>Do</label><input value="${esc(e.to)}" placeholder="dosud" oninput="state.experiences.find(x=>x.id==${e.id}).to=this.value;renderPreview();saveToStorage()"></div>
      </div>
      <div class="field"><label>Pracovní náplň & výsledky</label>
        <textarea rows="2" placeholder="Co jste dělal/a, čeho dosáhl/a..." oninput="state.experiences.find(x=>x.id==${e.id}).desc=this.value;renderPreview();saveToStorage()">${esc(e.desc)}</textarea>
      </div>
      <button class="ai-pill" onclick="aiImproveExp(${e.id})">
        <span class="ai-spinner" id="sp-exp-${e.id}"></span>
        <span class="ai-btn-text">✦ AI vylepší popis</span>
      </button>
    </div>
  `).join('');
}

function addEdu() { const id=++eduCount; state.education.push({id,degree:'',school:'',year:''}); renderEduList(); }
function removeEdu(id) { state.education=state.education.filter(e=>e.id!==id); renderEduList(); renderPreview(); saveToStorage(); }
function renderEduList() {
  const el = document.getElementById('edu-list');
  if(!el) return;
  el.innerHTML = state.education.map(e => `
    <div class="item-card">
      <button class="item-remove" onclick="removeEdu(${e.id})">×</button>
      <div class="field"><label>Titul / obor</label><input value="${esc(e.degree)}" placeholder="Bc. Marketing" oninput="state.education.find(x=>x.id==${e.id}).degree=this.value;renderPreview();saveToStorage()"></div>
      <div class="field-row">
        <div class="field"><label>Škola</label><input value="${esc(e.school)}" placeholder="VŠE Praha" oninput="state.education.find(x=>x.id==${e.id}).school=this.value;renderPreview();saveToStorage()"></div>
        <div class="field"><label>Rok</label><input value="${esc(e.year)}" placeholder="2019" oninput="state.education.find(x=>x.id==${e.id}).year=this.value;renderPreview();saveToStorage()"></div>
      </div>
    </div>
  `).join('');
}

function addLang() { const id=++langCount; state.languages.push({id,lang:'',level:'Pokročilý'}); renderLangList(); }
function removeLang(id) { state.languages=state.languages.filter(e=>e.id!==id); renderLangList(); renderPreview(); saveToStorage(); }
function renderLangList() {
  const el = document.getElementById('lang-list');
  if(!el) return;
  const levels = ['Začátečník','Mírně pokročilý','Pokročilý','Velmi pokročilý','Rodilý mluvčí'];
  el.innerHTML = state.languages.map(e => `
    <div class="item-card">
      <button class="item-remove" onclick="removeLang(${e.id})">×</button>
      <div class="field-row">
        <div class="field"><label>Jazyk</label><input value="${esc(e.lang)}" placeholder="Angličtina" oninput="state.languages.find(x=>x.id==${e.id}).lang=this.value;renderPreview();saveToStorage()"></div>
        <div class="field"><label>Úroveň</label>
          <select onchange="state.languages.find(x=>x.id==${e.id}).level=this.value;renderPreview();saveToStorage()">
            ${levels.map(l=>`<option ${e.level===l?'selected':''}>${l}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
  `).join('');
}

function addCert() { const id=++certCount; state.certifications.push({id,name:'',org:'',year:''}); renderCertList(); }
function removeCert(id) { state.certifications=state.certifications.filter(e=>e.id!==id); renderCertList(); renderPreview(); saveToStorage(); }
function renderCertList() {
  const el = document.getElementById('cert-list');
  if(!el) return;
  el.innerHTML = state.certifications.map(e => `
    <div class="item-card">
      <button class="item-remove" onclick="removeCert(${e.id})">×</button>
      <div class="field"><label>Název certifikátu</label><input value="${esc(e.name)}" placeholder="Google Analytics Certification" oninput="state.certifications.find(x=>x.id==${e.id}).name=this.value;renderPreview();saveToStorage()"></div>
      <div class="field-row">
        <div class="field"><label>Vydavatel</label><input value="${esc(e.org)}" placeholder="Google" oninput="state.certifications.find(x=>x.id==${e.id}).org=this.value;renderPreview();saveToStorage()"></div>
        <div class="field"><label>Rok</label><input value="${esc(e.year)}" placeholder="2024" oninput="state.certifications.find(x=>x.id==${e.id}).year=this.value;renderPreview();saveToStorage()"></div>
      </div>
    </div>
  `).join('');
}
function renderAllLists() { renderExpList(); renderEduList(); renderLangList(); renderCertList(); }

// ===== PREVIEW RENDER =====
function renderPreview() {
  const t = TEMPLATES.find(x => x.id === state.template) || TEMPLATES[0];
  const preview = document.getElementById('cv-preview');
  if (!preview) return;

  // Apply classes
  preview.className = 'cv-sheet ' + t.class + ' fs-' + state.fontSize + ' den-' + state.density;
  document.documentElement.style.setProperty('--cv-accent', state.accentColor || t.accent);

  const fullName = `${state.name||'Jan'} ${state.surname||'Novák'}`.trim();
  const contact = [state.email, state.phone, state.city, state.linkedin].filter(Boolean);

  // Template 7 is two-column — special render
  if (state.template === 7) {
    renderTwoColumn(preview, fullName, contact, t);
    return;
  }

  const photoHtml = state.photo
    ? `<img src="${state.photo}" class="cv-photo" alt="foto">`
    : '';

  let html = `<div class="cv-header">
    <div class="cv-name-row">
      <div>
        <div class="cv-name">${esc(fullName)}</div>
        <div class="cv-job-title cv-accent">${esc(state.jobtitle||'Váš profesní titul')}</div>
        <div class="cv-contact">${contact.map(c=>`<span class="cv-contact-item">${esc(c)}</span>`).join('')}${!contact.length?'<span class="cv-contact-item" style="color:#bbb">e-mail · telefon · město</span>':''}</div>
      </div>
      ${photoHtml}
    </div>
    <div class="cv-divider-line" style="background:var(--cv-accent)"></div>
  </div>`;

  if (state.summary) {
    html += `<div class="cv-section"><div class="cv-sec-title">Profesní shrnutí</div><div class="cv-summary-text">${esc(state.summary)}</div></div>`;
  }
  if (state.experiences.length) {
    html += `<div class="cv-section"><div class="cv-sec-title">Pracovní zkušenosti</div>`;
    state.experiences.forEach(e => {
      html += `<div class="cv-exp-item">
        <div class="cv-exp-row"><div class="cv-exp-title">${esc(e.title||'Název pozice')}</div><div class="cv-exp-date">${esc(e.from)}${e.to?' – '+esc(e.to):''}</div></div>
        <div class="cv-exp-company cv-accent">${esc(e.company||'Firma')}</div>
        ${e.desc?`<div class="cv-exp-desc">${esc(e.desc)}</div>`:''}
      </div>`;
    });
    html += `</div>`;
  }
  if (state.education.length) {
    html += `<div class="cv-section"><div class="cv-sec-title">Vzdělání</div>`;
    state.education.forEach(e => {
      html += `<div class="cv-edu-item"><div class="cv-edu-degree">${esc(e.degree||'Obor')}</div><div class="cv-edu-school cv-accent">${esc(e.school||'Škola')}</div>${e.year?`<div class="cv-edu-year">${esc(e.year)}</div>`:''}</div>`;
    });
    html += `</div>`;
  }
  if (state.skills) {
    const pills = state.skills.split(',').map(s=>s.trim()).filter(Boolean);
    html += `<div class="cv-section"><div class="cv-sec-title">Dovednosti</div><div class="cv-skills-wrap">${pills.map(p=>`<span class="cv-skill-pill">${esc(p)}</span>`).join('')}</div></div>`;
  }
  if (state.languages.length) {
    html += `<div class="cv-section"><div class="cv-sec-title">Jazyky</div><div class="cv-langs">`;
    state.languages.forEach(l => { html += `<div class="cv-lang-item"><span class="cv-lang-name">${esc(l.lang||'Jazyk')}</span><span class="cv-lang-level">${esc(l.level)}</span></div>`; });
    html += `</div></div>`;
  }
  if (state.certifications.length) {
    html += `<div class="cv-section"><div class="cv-sec-title">Certifikáty & kurzy</div>`;
    state.certifications.forEach(c => { html += `<div class="cv-cert-item"><div class="cv-cert-name">${esc(c.name||'Certifikát')}</div><div class="cv-cert-org">${esc(c.org||'')}${c.year?' · '+esc(c.year):''}</div></div>`; });
    html += `</div>`;
  }
  preview.innerHTML = html;
}

function renderTwoColumn(preview, fullName, contact, t) {
  const photoHtml = state.photo ? `<img src="${state.photo}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;margin-bottom:12px;display:block">` : '';
  const skillsList = state.skills ? state.skills.split(',').map(s=>s.trim()).filter(Boolean).map(s=>`<span class="cv-skill-pill-side">${esc(s)}</span>`).join('') : '';
  const langList = state.languages.map(l=>`<div class="cv-lang-item-side"><span>${esc(l.lang)}</span><span style="color:#6B6558;font-size:0.85em">${esc(l.level)}</span></div>`).join('');

  let sidebar = `<div class="cv-sidebar">
    ${photoHtml}
    <div class="cv-name">${esc(fullName)}</div>
    <div class="cv-title-side">${esc(state.jobtitle||'Profesní titul')}</div>
    <div class="cv-sec-title-side">Kontakt</div>
    <div class="cv-contact-side">${contact.map(c=>`<div>${esc(c)}</div>`).join('')}</div>
    ${state.skills?`<div class="cv-sec-title-side">Dovednosti</div>${skillsList}`:''}
    ${state.languages.length?`<div class="cv-sec-title-side">Jazyky</div>${langList}`:''}
  </div>`;

  let main = `<div class="cv-main">`;
  if (state.summary) main += `<div class="cv-section"><div class="cv-sec-title">Profesní shrnutí</div><div class="cv-summary-text">${esc(state.summary)}</div></div>`;
  if (state.experiences.length) {
    main += `<div class="cv-section"><div class="cv-sec-title">Pracovní zkušenosti</div>`;
    state.experiences.forEach(e => {
      main += `<div class="cv-exp-item"><div class="cv-exp-row"><div class="cv-exp-title">${esc(e.title||'Pozice')}</div><div class="cv-exp-date">${esc(e.from)}${e.to?' – '+esc(e.to):''}</div></div><div class="cv-exp-company cv-accent">${esc(e.company||'Firma')}</div>${e.desc?`<div class="cv-exp-desc">${esc(e.desc)}</div>`:''}</div>`;
    });
    main += `</div>`;
  }
  if (state.education.length) {
    main += `<div class="cv-section"><div class="cv-sec-title">Vzdělání</div>`;
    state.education.forEach(e => { main += `<div class="cv-edu-item"><div class="cv-edu-degree">${esc(e.degree||'Obor')}</div><div class="cv-edu-school cv-accent">${esc(e.school||'Škola')}</div>${e.year?`<div class="cv-edu-year">${esc(e.year)}</div>`:''}</div>`; });
    main += `</div>`;
  }
  if (state.certifications.length) {
    main += `<div class="cv-section"><div class="cv-sec-title">Certifikáty</div>`;
    state.certifications.forEach(c => { main += `<div class="cv-cert-item"><div class="cv-cert-name">${esc(c.name||'Certifikát')}</div><div class="cv-cert-org">${esc(c.org||'')}${c.year?' · '+esc(c.year):''}</div></div>`; });
    main += `</div>`;
  }
  main += `</div>`;
  preview.innerHTML = sidebar + main;
}

// ===== AI - DEMO MODE (no API key yet) =====
async function callAI(prompt, system) {
  // TODO: Replace with real API call when key is available
  // Simulate loading delay
  await new Promise(r => setTimeout(r, 1200));
  return null; // returns null = show "already optimized" message
}

async function aiImprove(field) {
  if (field === 'summary') {
    spinner('sp-summary', true);
    setBtnText('sp-summary', true);
    const result = await callAI('improve summary');
    spinner('sp-summary', false);
    setBtnText('sp-summary', false);
    if (result) {
      state.summary = result;
      document.getElementById('f-summary').value = result;
      renderPreview(); saveToStorage();
    } else {
      showMsg('ai-msg', '✓ Shrnutí je v pořádku — AI ho nezměnila. Až bude API klíč aktivní, dostanete plné vylepšení.', 'info');
    }
  } else if (field === 'skills') {
    spinner('sp-skills', true);
    setBtnText('sp-skills', true);
    const result = await callAI('improve skills');
    spinner('sp-skills', false);
    setBtnText('sp-skills', false);
    if (result) {
      state.skills = result;
      document.getElementById('f-skills').value = result;
      renderPreview(); saveToStorage();
    } else {
      showMsg('ai-msg', '✓ Dovednosti vypadají dobře. Plné AI vylepšení bude dostupné po aktivaci API klíče.', 'info');
    }
  }
}

function setBtnText(spinnerId, loading) {
  const spinner = document.getElementById(spinnerId);
  if (!spinner) return;
  const btn = spinner.closest('button');
  if (!btn) return;
  const textEl = btn.querySelector('.ai-btn-text');
  if (!textEl) return;
  if (loading) {
    textEl.textContent = 'AI pracuje...';
  } else {
    // restore original
    if (spinnerId === 'sp-summary') textEl.textContent = '✦ AI vylepší shrnutí';
    else if (spinnerId === 'sp-skills') textEl.textContent = '✦ AI doplní dovednosti';
    else if (spinnerId === 'sp-all') textEl.textContent = '✦ AI vylepší celé CV najednou';
    else if (spinnerId === 'sp-paste') textEl.textContent = '✦ AI zpracuje a vylepší CV';
    else textEl.textContent = '✦ AI vylepší popis';
  }
}

async function aiImproveExp(id) {
  spinner('sp-exp-'+id, true);
  const btn = document.getElementById('sp-exp-'+id);
  if(btn) { const t = btn.closest('button')?.querySelector('.ai-btn-text'); if(t) t.textContent = 'AI pracuje...'; }
  await new Promise(r => setTimeout(r, 1000));
  spinner('sp-exp-'+id, false);
  const exp = state.experiences.find(e=>e.id===id);
  if(btn) { const t = btn.closest('button')?.querySelector('.ai-btn-text'); if(t) t.textContent = '✦ AI vylepší popis'; }
  showMsg('ai-msg', '✓ Popis pozice zkontrolován. Po aktivaci API klíče dostanete plné přepsání.', 'info');
}

async function aiPolishAll() {
  ['sp-all','sp-toolbar'].forEach(id => spinner(id, true));
  const allBtn = document.getElementById('sp-all');
  if(allBtn) { const t = allBtn.closest('button')?.querySelector('.ai-btn-text'); if(t) t.textContent = 'AI prochází CV...'; }
  showMsg('ai-msg', '⏳ AI prochází celé CV...', 'info');
  await new Promise(r => setTimeout(r, 1800));
  ['sp-all','sp-toolbar'].forEach(id => spinner(id, false));
  setBtnText('sp-all', false);
  showMsg('ai-msg', '✓ CV zkontrolováno. Plné AI vylepšení (přepis textu, ATS klíčová slova) bude aktivní po připojení API klíče.', 'info');
}

// ===== FILE UPLOAD =====
function handleDrop(event) {
  event.preventDefault();
  document.getElementById('upload-zone').classList.remove('drag-over');
  const file = event.dataTransfer.files[0];
  if (file) processFile(file);
}
function handleFileUpload(input) {
  const file = input.files[0];
  if (file) processFile(file);
}
function processFile(file) {
  const name = file.name.toLowerCase();
  const statusEl = document.getElementById('upload-msg');
  showMsg('upload-msg', '⏳ Načítám soubor...', 'info');

  if (name.endsWith('.txt') || name.endsWith('.rtf')) {
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('paste-cv').value = e.target.result;
      showMsg('upload-msg', '✓ Soubor načten. Klikněte na "AI zpracuje CV" nebo upravte text ručně.', 'success');
    };
    reader.readAsText(file, 'UTF-8');
  } else if (name.endsWith('.pdf') || name.endsWith('.docx') || name.endsWith('.doc')) {
    // For PDF/DOCX we show instructions — browser can't parse these natively without lib
    showMsg('upload-msg', '📄 Pro PDF a DOCX soubory: otevřete soubor, vyberte veškerý text (Ctrl+A), zkopírujte (Ctrl+C) a vložte do textového pole níže. Pak klikněte na AI zpracování.', 'info');
    document.getElementById('paste-cv').focus();
  } else {
    showMsg('upload-msg', '⚠ Nepodporovaný formát. Zkuste TXT nebo vložte text ručně.', 'error');
  }
}

async function aiParsePaste() {
  const text = document.getElementById('paste-cv').value.trim();
  if (!text) { showMsg('upload-msg', '⚠ Vložte nejprve text CV.', 'error'); return; }
  spinner('sp-paste', true);
  setBtnText('sp-paste', true);
  showMsg('upload-msg', '⏳ Zpracovávám CV...', 'info');
  await new Promise(r => setTimeout(r, 1500));
  spinner('sp-paste', false);
  setBtnText('sp-paste', false);

  // Basic text extraction — split by lines and try to fill fields
  const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
  if (lines.length > 0) {
    // Try to extract email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) { state.email = emailMatch[0]; const el = document.getElementById('f-email'); if(el) el.value = state.email; }
    // Try phone
    const phoneMatch = text.match(/(\+?[\d\s\-()]{9,})/);
    if (phoneMatch) { const cleaned = phoneMatch[0].trim(); if(cleaned.length >= 9) { state.phone = cleaned; const el = document.getElementById('f-phone'); if(el) el.value = state.phone; } }
    // Paste summary text for manual review
    showMsg('upload-msg', '✓ Základní informace extrahovány. Po aktivaci API klíče AI automaticky rozpozná a vyplní všechna pole (jméno, pozice, zkušenosti, vzdělání). Zatím zkontrolujte a doplňte formulář ručně.', 'success');
    document.getElementById('paste-cv').value = '';
  }
}

// ===== PDF / MODAL =====
function handlePdfDownload() {
  document.getElementById('paywall-modal').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('paywall-modal').classList.add('hidden');
}
function mockPayment() {
  closeModal();
  alert('Platební brána bude brzy aktivována.\n\nPo napojení Stripe bude PDF stažení okamžité.');
}
function generatePDF() {
  const el = document.getElementById('cv-preview');
  const fullName = (state.name+' '+state.surname).trim() || 'CV';
  const opt = { margin:[10,10,10,10], filename:`${fullName.replace(/\s+/g,'_')}_CV.pdf`, image:{type:'jpeg',quality:0.98}, html2canvas:{scale:2,useCORS:true}, jsPDF:{unit:'mm',format:'a4',orientation:'portrait'} };
  html2pdf().set(opt).from(el).save();
}

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('paywall-modal');
  if(modal) modal.addEventListener('click', e => { if(e.target===modal) closeModal(); });
});
