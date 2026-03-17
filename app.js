// ===== STATE =====
const state = {
  name: '', surname: '', jobtitle: '', email: '', phone: '', city: '', linkedin: '',
  summary: '',
  experiences: [],
  education: [],
  languages: [],
  certifications: [],
  skills: '',
  template: 1
};
let expCount = 0, eduCount = 0, langCount = 0, certCount = 0;

const TEMPLATES = [
  { id: 1, name: 'Modrá klasická', class: 't1', accent: '#2D5BE3', bg: '#EEF2FD' },
  { id: 2, name: 'Zelená svěží', class: 't2', accent: '#1D9E75', bg: '#E1F5EE' },
  { id: 3, name: 'Minimalistická', class: 't3', accent: '#888', bg: '#F1EFE8' },
  { id: 4, name: 'Tmavá elegantní', class: 't4', accent: '#8AABFF', bg: '#1A1916', dark: true },
  { id: 5, name: 'Koralová kreativní', class: 't5', accent: '#D85A30', bg: '#FAECE7' }
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderTemplateGrid();
  renderPreview();
  loadFromStorage();
});

// ===== THEME =====
function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

// ===== STORAGE =====
function saveToStorage() {
  try {
    localStorage.setItem('cvbuilder_state', JSON.stringify(state));
    // sync form fields from state
  } catch(e) {}
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('cvbuilder_state');
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') document.body.classList.add('dark');
    if (!saved) return;
    const data = JSON.parse(saved);
    Object.assign(state, data);
    // Fill inputs
    const fields = ['name','surname','jobtitle','email','phone','city','linkedin','summary','skills'];
    fields.forEach(k => {
      const el = document.getElementById('f-' + k);
      if (el) el.value = state[k] || '';
    });
    expCount = state.experiences.length;
    eduCount = state.education.length;
    langCount = state.languages.length;
    certCount = state.certifications.length;
    renderAllLists();
    renderPreview();
    // Set active template
    selectTemplate(state.template || 1, false);
  } catch(e) {}
}

// ===== NAVIGATION =====
function scrollToApp() {
  document.getElementById('app').scrollIntoView({ behavior: 'smooth' });
}

function switchEditorTab(tab, btn) {
  ['form', 'upload', 'templates'].forEach(t => {
    document.getElementById('etab-' + t).classList.toggle('hidden', t !== tab);
  });
  document.querySelectorAll('.etab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
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

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

// ===== LISTS: EXPERIENCES =====
function addExp() {
  const id = ++expCount;
  state.experiences.push({ id, title: '', company: '', from: '', to: '', desc: '' });
  renderExpList();
}
function removeExp(id) {
  state.experiences = state.experiences.filter(e => e.id !== id);
  renderExpList();
  renderPreview();
  saveToStorage();
}
function renderExpList() {
  const el = document.getElementById('exp-list');
  el.innerHTML = state.experiences.map(e => `
    <div class="item-card">
      <button class="item-remove" onclick="removeExp(${e.id})">×</button>
      <div class="field-row">
        <div class="field"><label>Pozice</label>
          <input value="${esc(e.title)}" placeholder="Marketér" oninput="state.experiences.find(x=>x.id==${e.id}).title=this.value;renderPreview();saveToStorage()">
        </div>
        <div class="field"><label>Firma</label>
          <input value="${esc(e.company)}" placeholder="ACME s.r.o." oninput="state.experiences.find(x=>x.id==${e.id}).company=this.value;renderPreview();saveToStorage()">
        </div>
      </div>
      <div class="field-row">
        <div class="field"><label>Od</label>
          <input value="${esc(e.from)}" placeholder="2021" oninput="state.experiences.find(x=>x.id==${e.id}).from=this.value;renderPreview();saveToStorage()">
        </div>
        <div class="field"><label>Do</label>
          <input value="${esc(e.to)}" placeholder="dosud" oninput="state.experiences.find(x=>x.id==${e.id}).to=this.value;renderPreview();saveToStorage()">
        </div>
      </div>
      <div class="field"><label>Pracovní náplň & výsledky</label>
        <textarea rows="2" placeholder="Co jste dělal/a, čeho dosáhl/a..." oninput="state.experiences.find(x=>x.id==${e.id}).desc=this.value;renderPreview();saveToStorage()">${esc(e.desc)}</textarea>
      </div>
      <button class="ai-pill" onclick="aiImproveExp(${e.id})">
        <span class="ai-spinner" id="sp-exp-${e.id}"></span>
        <span>✦ AI vylepší popis</span>
      </button>
    </div>
  `).join('');
}

// ===== LISTS: EDUCATION =====
function addEdu() {
  const id = ++eduCount;
  state.education.push({ id, degree: '', school: '', year: '' });
  renderEduList();
}
function removeEdu(id) {
  state.education = state.education.filter(e => e.id !== id);
  renderEduList(); renderPreview(); saveToStorage();
}
function renderEduList() {
  const el = document.getElementById('edu-list');
  el.innerHTML = state.education.map(e => `
    <div class="item-card">
      <button class="item-remove" onclick="removeEdu(${e.id})">×</button>
      <div class="field"><label>Titul / obor</label>
        <input value="${esc(e.degree)}" placeholder="Bc. Marketing, VŠE" oninput="state.education.find(x=>x.id==${e.id}).degree=this.value;renderPreview();saveToStorage()">
      </div>
      <div class="field-row">
        <div class="field"><label>Škola</label>
          <input value="${esc(e.school)}" placeholder="VŠE Praha" oninput="state.education.find(x=>x.id==${e.id}).school=this.value;renderPreview();saveToStorage()">
        </div>
        <div class="field"><label>Rok</label>
          <input value="${esc(e.year)}" placeholder="2019" oninput="state.education.find(x=>x.id==${e.id}).year=this.value;renderPreview();saveToStorage()">
        </div>
      </div>
    </div>
  `).join('');
}

// ===== LISTS: LANGUAGES =====
function addLang() {
  const id = ++langCount;
  state.languages.push({ id, lang: '', level: 'Pokročilý' });
  renderLangList();
}
function removeLang(id) {
  state.languages = state.languages.filter(e => e.id !== id);
  renderLangList(); renderPreview(); saveToStorage();
}
function renderLangList() {
  const el = document.getElementById('lang-list');
  const levels = ['Začátečník','Mírně pokročilý','Pokročilý','Velmi pokročilý','Rodilý mluvčí'];
  el.innerHTML = state.languages.map(e => `
    <div class="item-card">
      <button class="item-remove" onclick="removeLang(${e.id})">×</button>
      <div class="field-row">
        <div class="field"><label>Jazyk</label>
          <input value="${esc(e.lang)}" placeholder="Angličtina" oninput="state.languages.find(x=>x.id==${e.id}).lang=this.value;renderPreview();saveToStorage()">
        </div>
        <div class="field"><label>Úroveň</label>
          <select onchange="state.languages.find(x=>x.id==${e.id}).level=this.value;renderPreview();saveToStorage()">
            ${levels.map(l => `<option ${e.level===l?'selected':''}>${l}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== LISTS: CERTIFICATIONS =====
function addCert() {
  const id = ++certCount;
  state.certifications.push({ id, name: '', org: '', year: '' });
  renderCertList();
}
function removeCert(id) {
  state.certifications = state.certifications.filter(e => e.id !== id);
  renderCertList(); renderPreview(); saveToStorage();
}
function renderCertList() {
  const el = document.getElementById('cert-list');
  el.innerHTML = state.certifications.map(e => `
    <div class="item-card">
      <button class="item-remove" onclick="removeCert(${e.id})">×</button>
      <div class="field"><label>Název certifikátu</label>
        <input value="${esc(e.name)}" placeholder="Google Analytics Certification" oninput="state.certifications.find(x=>x.id==${e.id}).name=this.value;renderPreview();saveToStorage()">
      </div>
      <div class="field-row">
        <div class="field"><label>Vydavatel</label>
          <input value="${esc(e.org)}" placeholder="Google" oninput="state.certifications.find(x=>x.id==${e.id}).org=this.value;renderPreview();saveToStorage()">
        </div>
        <div class="field"><label>Rok</label>
          <input value="${esc(e.year)}" placeholder="2024" oninput="state.certifications.find(x=>x.id==${e.id}).year=this.value;renderPreview();saveToStorage()">
        </div>
      </div>
    </div>
  `).join('');
}

function renderAllLists() {
  renderExpList(); renderEduList(); renderLangList(); renderCertList();
}

// ===== TEMPLATES =====
function renderTemplateGrid() {
  const grid = document.getElementById('tmpl-grid');
  grid.innerHTML = TEMPLATES.map(t => `
    <div class="tmpl-card ${state.template === t.id ? 'selected' : ''}" onclick="selectTemplate(${t.id}, true)" id="tmpl-card-${t.id}">
      <div class="tmpl-thumb" style="background: ${t.dark ? '#1A1916' : '#fff'}">
        <div style="font-family:'DM Serif Display',serif;font-size:12px;font-weight:400;color:${t.dark?'#F0EEE8':'#1A1916'};margin-bottom:3px">Jan Novák</div>
        <div style="width:28px;height:2px;background:${t.accent};margin-bottom:5px"></div>
        <div style="height:3px;width:80%;background:${t.dark?'rgba(255,255,255,0.07)':'#f0f0f0'};border-radius:2px;margin-bottom:3px"></div>
        <div style="height:3px;width:65%;background:${t.dark?'rgba(255,255,255,0.07)':'#f0f0f0'};border-radius:2px;margin-bottom:3px"></div>
        <div style="height:3px;width:72%;background:${t.dark?'rgba(255,255,255,0.07)':'#f0f0f0'};border-radius:2px;margin-bottom:6px"></div>
        <div style="display:flex;gap:3px">
          <div style="padding:2px 5px;background:${t.bg};border-radius:2px;font-size:7px;color:${t.accent};font-weight:500">dovednost</div>
          <div style="padding:2px 5px;background:${t.bg};border-radius:2px;font-size:7px;color:${t.accent};font-weight:500">skill</div>
        </div>
      </div>
      <div class="tmpl-name">${t.name}</div>
    </div>
  `).join('');
}

function selectTemplate(id, save) {
  state.template = id;
  document.querySelectorAll('.tmpl-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById('tmpl-card-' + id);
  if (card) card.classList.add('selected');
  renderPreview();
  if (save) saveToStorage();
}

// ===== PREVIEW RENDER =====
function renderPreview() {
  const t = TEMPLATES.find(x => x.id === state.template) || TEMPLATES[0];
  const preview = document.getElementById('cv-preview');
  preview.className = 'cv-sheet ' + t.class;

  const fullName = `${state.name || 'Jan'} ${state.surname || 'Novák'}`.trim();
  const contact = [state.email, state.phone, state.city, state.linkedin].filter(Boolean);

  let html = `
    <div class="cv-header">
      <div class="cv-name">${esc(fullName)}</div>
      <div class="cv-job-title cv-accent">${esc(state.jobtitle || 'Váš profesní titul')}</div>
      <div class="cv-contact">
        ${contact.map(c => `<span class="cv-contact-item">${esc(c)}</span>`).join('')}
        ${!contact.length ? '<span class="cv-contact-item" style="color:#bbb">e-mail · telefon · město</span>' : ''}
      </div>
      <div class="cv-divider-line cv-accent" style="background:${t.accent}"></div>
    </div>
  `;

  // Summary
  if (state.summary) {
    html += `<div class="cv-section">
      <div class="cv-sec-title cv-accent">Profesní shrnutí</div>
      <div class="cv-summary-text">${esc(state.summary)}</div>
    </div>`;
  }

  // Experiences
  if (state.experiences.length) {
    html += `<div class="cv-section"><div class="cv-sec-title cv-accent">Pracovní zkušenosti</div>`;
    state.experiences.forEach(e => {
      html += `<div class="cv-exp-item">
        <div class="cv-exp-row">
          <div class="cv-exp-title">${esc(e.title || 'Název pozice')}</div>
          <div class="cv-exp-date">${esc(e.from)}${e.to ? ' – ' + esc(e.to) : ''}</div>
        </div>
        <div class="cv-exp-company cv-accent">${esc(e.company || 'Firma')}</div>
        ${e.desc ? `<div class="cv-exp-desc">${esc(e.desc)}</div>` : ''}
      </div>`;
    });
    html += `</div>`;
  }

  // Education
  if (state.education.length) {
    html += `<div class="cv-section"><div class="cv-sec-title cv-accent">Vzdělání</div>`;
    state.education.forEach(e => {
      html += `<div class="cv-edu-item">
        <div class="cv-edu-degree">${esc(e.degree || 'Obor')}</div>
        <div class="cv-edu-school cv-accent">${esc(e.school || 'Škola')}</div>
        ${e.year ? `<div class="cv-edu-year">${esc(e.year)}</div>` : ''}
      </div>`;
    });
    html += `</div>`;
  }

  // Skills
  if (state.skills) {
    const pills = state.skills.split(',').map(s => s.trim()).filter(Boolean);
    html += `<div class="cv-section"><div class="cv-sec-title cv-accent">Dovednosti</div>
      <div class="cv-skills-wrap">${pills.map(p => `<span class="cv-skill-pill">${esc(p)}</span>`).join('')}</div>
    </div>`;
  }

  // Languages
  if (state.languages.length) {
    html += `<div class="cv-section"><div class="cv-sec-title cv-accent">Jazyky</div><div class="cv-langs">`;
    state.languages.forEach(l => {
      html += `<div class="cv-lang-item">
        <span class="cv-lang-name">${esc(l.lang || 'Jazyk')}</span>
        <span class="cv-lang-level">${esc(l.level)}</span>
      </div>`;
    });
    html += `</div></div>`;
  }

  // Certifications
  if (state.certifications.length) {
    html += `<div class="cv-section"><div class="cv-sec-title cv-accent">Certifikáty & kurzy</div>`;
    state.certifications.forEach(c => {
      html += `<div class="cv-cert-item">
        <div class="cv-cert-name">${esc(c.name || 'Certifikát')}</div>
        <div class="cv-cert-org">${esc(c.org || '')}${c.year ? ' · ' + esc(c.year) : ''}</div>
      </div>`;
    });
    html += `</div>`;
  }

  preview.innerHTML = html;
}

// ===== UTILS =====
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function spinner(id, on) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('active', on);
}

function showMsg(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'ai-msg ' + type;
  if (type === 'success') setTimeout(() => { el.className = 'ai-msg'; }, 4000);
}

// ===== AI API =====
async function callAI(prompt, system) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: system || 'Jsi expert na psaní profesionálních životopisů pro český trh. Piš stručně, konkrétně, s důrazem na výsledky. Vrať POUZE výsledný text, bez uvozovek nebo preamble.',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content.map(b => b.text || '').join('').trim();
}

async function callAIJson(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      system: 'Jsi expert na životopisy. Vrať VŽDY pouze čistý validní JSON, bez markdown backticks, bez preamble, bez komentářů.',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.content.map(b => b.text || '').join('').trim().replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}

// ===== AI ACTIONS =====
async function aiImprove(field) {
  if (field === 'summary') {
    spinner('sp-summary', true);
    try {
      const result = await callAI(
        `Vylepši nebo napiš profesní shrnutí pro životopis.
Pozice: ${state.jobtitle || 'nespecifikována'}
Aktuální text: ${state.summary || '(prázdné)'}
Instrukce: 2-3 silné věty. Konkrétní, výsledky, ATS-friendly. Zaujmout HR za 10 sekund.`
      );
      state.summary = result;
      document.getElementById('f-summary').value = result;
      renderPreview(); saveToStorage();
    } catch(e) { showMsg('ai-msg', '⚠ Chyba AI. Zkus znovu.', 'error'); }
    finally { spinner('sp-summary', false); }

  } else if (field === 'skills') {
    spinner('sp-skills', true);
    try {
      const result = await callAI(
        `Doplň dovednosti pro životopis.
Pozice: ${state.jobtitle || 'nespecifikována'}
Stávající: ${state.skills || '(prázdné)'}
Instrukce: 8-12 dovedností oddělených čárkou. Mix technických i soft skills. Vrať pouze čárkami oddělený seznam.`
      );
      state.skills = result;
      document.getElementById('f-skills').value = result;
      renderPreview(); saveToStorage();
    } catch(e) { showMsg('ai-msg', '⚠ Chyba AI. Zkus znovu.', 'error'); }
    finally { spinner('sp-skills', false); }
  }
}

async function aiImproveExp(id) {
  const exp = state.experiences.find(e => e.id === id);
  if (!exp) return;
  spinner('sp-exp-' + id, true);
  try {
    const result = await callAI(
      `Vylepši popis pracovní pozice v životopisu.
Pozice: ${exp.title}, Firma: ${exp.company}
Aktuální popis: ${exp.desc || '(prázdné)'}
Instrukce: 2-3 věty nebo odrážky s •. Začni silným slovesem. Konkrétní výsledky a čísla pokud možné.`
    );
    exp.desc = result;
    renderExpList(); renderPreview(); saveToStorage();
  } catch(e) {}
  finally { spinner('sp-exp-' + id, false); }
}

async function aiPolishAll() {
  spinner('sp-all', true);
  showMsg('ai-msg', '✦ AI prochází celé CV...', 'success');
  try {
    const expTexts = state.experiences.map(e => `${e.title}@${e.company}: ${e.desc}`).join(' | ');
    const parsed = await callAIJson(
      `Vylepši celé CV. Vrať JSON s klíči:
- summary: string (2-3 věty, silné)
- skills: string (dovednosti oddělené čárkou)
- experiences: pole {id: number, desc: string} (vylepšené popisy)

Data:
Pozice: ${state.jobtitle}
Shrnutí: ${state.summary}
Zkušenosti: ${expTexts}
Dovednosti: ${state.skills}

Pravidla: stručné, silné formulace, začínaj slovesem, konkrétní výsledky.`
    );
    if (parsed.summary) { state.summary = parsed.summary; document.getElementById('f-summary').value = parsed.summary; }
    if (parsed.skills) { state.skills = parsed.skills; document.getElementById('f-skills').value = parsed.skills; }
    if (parsed.experiences) {
      parsed.experiences.forEach(ex => {
        const found = state.experiences.find(e => e.id === ex.id);
        if (found && ex.desc) found.desc = ex.desc;
      });
      renderExpList();
    }
    renderPreview(); saveToStorage();
    showMsg('ai-msg', '✓ CV bylo úspěšně vylepšeno!', 'success');
  } catch(e) {
    showMsg('ai-msg', '⚠ Nepodařilo se zpracovat. Zkus znovu.', 'error');
  }
  finally { spinner('sp-all', false); }
}

async function aiParsePaste() {
  const text = document.getElementById('paste-cv').value.trim();
  if (!text) return;
  spinner('sp-paste', true);
  showMsg('upload-msg', '✦ AI analyzuje CV...', 'success');
  try {
    const parsed = await callAIJson(
      `Extrahuj a vylepši informace z tohoto CV. Vrať JSON:
{
  "name": string, "surname": string, "jobtitle": string,
  "email": string, "phone": string, "city": string, "linkedin": string,
  "summary": string (2-3 vylepšené věty),
  "skills": string (dovednosti oddělené čárkou),
  "experiences": [{title, company, from, to, desc}],
  "education": [{degree, school, year}],
  "languages": [{lang, level}],
  "certifications": [{name, org, year}]
}
Pravidla: stručné formulace, silné popisy pozic.

CV:
${text}`
    );
    // Fill state
    const fields = ['name','surname','jobtitle','email','phone','city','linkedin','summary','skills'];
    fields.forEach(k => {
      if (parsed[k]) {
        state[k] = parsed[k];
        const el = document.getElementById('f-' + k);
        if (el) el.value = parsed[k];
      }
    });
    if (parsed.experiences) {
      state.experiences = []; expCount = 0;
      parsed.experiences.forEach(e => { const id = ++expCount; state.experiences.push({id, ...e}); });
    }
    if (parsed.education) {
      state.education = []; eduCount = 0;
      parsed.education.forEach(e => { const id = ++eduCount; state.education.push({id, ...e}); });
    }
    if (parsed.languages) {
      state.languages = []; langCount = 0;
      parsed.languages.forEach(e => { const id = ++langCount; state.languages.push({id, ...e}); });
    }
    if (parsed.certifications) {
      state.certifications = []; certCount = 0;
      parsed.certifications.forEach(e => { const id = ++certCount; state.certifications.push({id, ...e}); });
    }
    renderAllLists(); renderPreview(); saveToStorage();
    showMsg('upload-msg', '✓ CV zpracováno a vylepšeno! Přejdi na záložku Formulář.', 'success');
  } catch(e) {
    showMsg('upload-msg', '⚠ Nepodařilo se zpracovat. Zkus znovu nebo uprav text.', 'error');
  }
  finally { spinner('sp-paste', false); }
}

function handleFileUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('paste-cv').value = e.target.result;
    aiParsePaste();
  };
  reader.readAsText(file, 'UTF-8');
}

// ===== PDF / PAYWALL =====
function handlePdfDownload() {
  document.getElementById('paywall-modal').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('paywall-modal').classList.add('hidden');
}
function mockPayment() {
  closeModal();
  // TODO: Replace with Stripe integration
  // For now: show coming soon
  alert('Platební brána bude brzy aktivována.\n\nPro testování: export PDF bude dostupný po napojení Stripe.');
  // When Stripe is ready, call: generatePDF();
}

function generatePDF() {
  const el = document.getElementById('cv-preview');
  const fullName = (state.name + ' ' + state.surname).trim() || 'CV';
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `${fullName.replace(/\s+/g, '_')}_CV.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(el).save();
}

// Close modal on overlay click
document.getElementById('paywall-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
