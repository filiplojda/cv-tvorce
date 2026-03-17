// ===== STATE =====
const state = {
  name:'',surname:'',jobtitle:'',email:'',phone:'',city:'',linkedin:'',
  summary:'',skills:'',photo:null,skillLevels:{},
  experiences:[],education:[],languages:[],certifications:[],
  template:1,fontSize:'medium',headingStyle:'serif',density:'normal',accentColor:'#C8402A',
  letter:{recipient:'',company:'',position:'',intro:'',body:'',closing:''}
};
let expCount=0,eduCount=0,langCount=0,certCount=0;

const TEMPLATES = [
  {id:1, name:'Klasická',        class:'t1', desc:'Nadpisy + červená linka',    accent:'#C8402A'},
  {id:2, name:'Banner hlavička', class:'t2', desc:'Barevný pruh nahoře',        accent:'#C8402A'},
  {id:3, name:'Sidebar vlevo',   class:'t3', desc:'Barevný postranní panel',    accent:'#C8402A'},
  {id:4, name:'Asymetrická',     class:'t4', desc:'Jméno vlevo, kontakt vpravo',accent:'#C8402A'},
  {id:5, name:'Timeline',        class:'t5', desc:'Časová osa zkušeností',      accent:'#C8402A'},
  {id:6, name:'Infografika',     class:'t6', desc:'Progress bary dovedností',   accent:'#C8402A'},
  {id:7, name:'Dvě sloupce',     class:'t7', desc:'Obsah 50/50',               accent:'#C8402A'},
  {id:8, name:'Tmavá elegantní', class:'t8', desc:'Tmavé pozadí, zlatý akcent', accent:'#E8956A'},
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderTemplateGrid();
  renderPreview();
  renderLetter();
  loadFromStorage();
  if(localStorage.getItem('theme')==='dark') document.body.classList.add('dark');
});

function toggleTheme(){
  document.body.classList.toggle('dark');
  localStorage.setItem('theme',document.body.classList.contains('dark')?'dark':'light');
}

// ===== STORAGE =====
function saveToStorage(){
  try{ localStorage.setItem('cvbuilder_state',JSON.stringify({...state,photo:null})); }catch(e){}
}
function loadFromStorage(){
  try{
    const saved=localStorage.getItem('cvbuilder_state');
    if(!saved) return;
    const data=JSON.parse(saved);
    Object.assign(state,data);
    ['name','surname','jobtitle','email','phone','city','linkedin','summary','skills'].forEach(k=>{
      const el=document.getElementById('f-'+k); if(el) el.value=state[k]||'';
    });
    if(state.letter){
      ['recipient','company','position','intro','body','closing'].forEach(k=>{
        const el=document.getElementById('l-'+k); if(el) el.value=state.letter[k]||'';
      });
    }
    expCount=state.experiences.length;
    eduCount=state.education.length;
    langCount=state.languages.length;
    certCount=state.certifications.length;
    renderAllLists();
    renderTemplateGrid();
    applyDesignSettings();
    renderPreview();
    renderLetter();
  }catch(e){}
}

// ===== UTILS =====
function val(id){const el=document.getElementById(id);return el?el.value:'';}
function esc(s){if(!s)return '';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function spinner(id,on){const el=document.getElementById(id);if(el)el.classList.toggle('active',on);}
function showMsg(id,text,type){
  const el=document.getElementById(id);if(!el)return;
  el.textContent=text;el.className='ai-msg '+type;
  if(type!=='error') setTimeout(()=>{if(el)el.className='ai-msg';},6000);
}
function setBtnText(spId,loading){
  const sp=document.getElementById(spId);if(!sp)return;
  const btn=sp.closest('button');if(!btn)return;
  const t=btn.querySelector('.ai-btn-text');if(!t)return;
  const originals={
    'sp-summary':'✦ AI vylepší shrnutí','sp-skills':'✦ AI doplní dovednosti',
    'sp-all':'✦ AI vylepší celé CV najednou','sp-paste':'✦ AI zpracuje a vylepší CV',
    'sp-letter':'✦ AI napíše dopis za mě'
  };
  t.textContent=loading?'AI pracuje...':(originals[spId]||'✦ AI vylepší popis');
}
function scrollToApp(){const el=document.getElementById('app');if(el)el.scrollIntoView({behavior:'smooth'});}

// ===== TABS =====
function switchEditorTab(tab,btn){
  ['form','upload','templates','design'].forEach(t=>{
    const el=document.getElementById('etab-'+t);if(el)el.classList.toggle('hidden',t!==tab);
  });
  document.querySelectorAll('.etab').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
}

// ===== MODE SWITCH =====
function switchMode(mode){
  ['cv','letter'].forEach(m=>{
    const btn=document.getElementById('mode-'+m);
    if(btn)btn.classList.toggle('active',m===mode);
    const panel=document.getElementById(m+'-mode');
    if(panel)panel.style.display=m===mode?'flex':'none';
  });
  if(mode==='letter'){
    document.getElementById('letter-mode').style.display='block';
    switchPreview('letter');
  } else {
    switchPreview('cv');
  }
}

function switchPreview(which){
  document.getElementById('preview-cv-wrap').style.display=which==='cv'?'block':'none';
  document.getElementById('preview-letter-wrap').style.display=which==='letter'?'block':'none';
  document.querySelectorAll('.prev-tab').forEach(b=>b.classList.remove('active'));
  const tab=document.getElementById('prev-'+which+'-tab');
  if(tab)tab.classList.add('active');
}

// ===== LIVE UPDATE =====
function liveUpdate(){
  state.name=val('f-name');state.surname=val('f-surname');state.jobtitle=val('f-jobtitle');
  state.email=val('f-email');state.phone=val('f-phone');state.city=val('f-city');
  state.linkedin=val('f-linkedin');state.summary=val('f-summary');state.skills=val('f-skills');
  renderPreview();renderLetter();saveToStorage();
  // Update skill levels UI if infographic template
  if(state.template===6) renderSkillLevelsUI();
}

// ===== LETTER =====
function renderLetter(){
  state.letter={
    recipient:val('l-recipient'),company:val('l-company'),position:val('l-position'),
    intro:val('l-intro'),body:val('l-body'),closing:val('l-closing')
  };
  const preview=document.getElementById('letter-preview');
  if(!preview)return;
  const fullName=`${state.name||'Jan'} ${state.surname||'Novák'}`.trim();
  const today=new Date().toLocaleDateString('cs-CZ',{day:'numeric',month:'long',year:'numeric'});
  const contact=[state.email,state.phone,state.city].filter(Boolean).join(' · ');
  const recipient=state.letter.recipient||'Vážená personální oddělení';
  const company=state.letter.company||'[Název firmy]';
  const position=state.letter.position||state.jobtitle||'[Název pozice]';
  const intro=state.letter.intro||'Reaguji na váš inzerát a rád bych se ucházel o nabízenou pozici.';
  const body=state.letter.body||'Mám relevantní zkušenosti a dovednosti, které by byly přínosem pro váš tým.';
  const closing=state.letter.closing||'Rád bych se s vámi setkal na pohovoru a dozvěděl se více o této příležitosti. Děkuji za Vaši odpověď.';
  preview.innerHTML=`
    <div class="letter-date">V ${state.city||'Praze'}, ${today}</div>
    <div class="letter-sender">
      <div class="letter-sender-name">${esc(fullName)}</div>
      <div class="letter-sender-info">${esc(contact)}</div>
    </div>
    <div class="letter-divider" style="background:var(--cv-accent)"></div>
    <div class="letter-recipient">
      <div>${esc(recipient)}</div>
      <div><strong>${esc(company)}</strong></div>
    </div>
    <div class="letter-subject">Věc: Ucházím se o pozici <span>${esc(position)}</span></div>
    <div class="letter-body">Dobrý den,

${esc(intro)}

${esc(body)}

${esc(closing)}

S pozdravem,</div>
    <div class="letter-sign">
      <div class="letter-sign-name">${esc(fullName)}</div>
      <div style="font-size:11px;color:#888;margin-top:3px">${esc(contact)}</div>
    </div>`;
}

// ===== PHOTO =====
function handlePhoto(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    state.photo=e.target.result;
    const img=document.getElementById('photo-img');
    const ph=document.getElementById('photo-placeholder');
    const rm=document.getElementById('photo-remove');
    if(img){img.src=state.photo;img.style.display='block';}
    if(ph)ph.style.display='none';
    if(rm)rm.classList.remove('hidden');
    renderPreview();
  };
  reader.readAsDataURL(file);
}
function removePhoto(){
  state.photo=null;
  const img=document.getElementById('photo-img');
  const ph=document.getElementById('photo-placeholder');
  const rm=document.getElementById('photo-remove');
  if(img){img.src='';img.style.display='none';}
  if(ph)ph.style.display='flex';
  if(rm)rm.classList.add('hidden');
  const inp=document.getElementById('photo-input');
  if(inp)inp.value='';
  renderPreview();
}

// ===== DESIGN =====
function setFontSize(s){
  state.fontSize=s;
  ['small','medium','large'].forEach(x=>{const b=document.getElementById('fs-'+x);if(b)b.classList.toggle('active',x===s);});
  applyDesignSettings();saveToStorage();
}
function setHeadingStyle(s){
  state.headingStyle=s;
  ['serif','sans','caps'].forEach(x=>{const b=document.getElementById('hs-'+x);if(b)b.classList.toggle('active',x===s);});
  renderPreview();saveToStorage();
}
function setDensity(d){
  state.density=d;
  ['compact','normal','spacious'].forEach(x=>{const b=document.getElementById('den-'+x);if(b)b.classList.toggle('active',x===d);});
  applyDesignSettings();saveToStorage();
}
function setAccentColor(color,id){
  state.accentColor=color;
  document.querySelectorAll('.color-btn').forEach(b=>b.classList.remove('active'));
  const btn=document.getElementById('col-'+id);if(btn)btn.classList.add('active');
  document.documentElement.style.setProperty('--cv-accent',color);
  renderPreview();saveToStorage();
}
function applyDesignSettings(){
  const sheet=document.getElementById('cv-preview');if(!sheet)return;
  sheet.classList.remove('fs-small','fs-medium','fs-large','den-compact','den-normal','den-spacious');
  sheet.classList.add('fs-'+state.fontSize,'den-'+state.density);
  document.documentElement.style.setProperty('--cv-accent',state.accentColor||'#C8402A');
}

// ===== SKILL LEVELS UI =====
function renderSkillLevelsUI(){
  const sec=document.getElementById('skill-levels-section');
  const list=document.getElementById('skill-levels-list');
  if(!sec||!list)return;
  const pills=state.skills.split(',').map(s=>s.trim()).filter(Boolean);
  if(state.template===6&&pills.length>0){
    sec.style.display='block';
    list.innerHTML=pills.map(skill=>{
      const level=state.skillLevels[skill]||80;
      return `<div class="field" style="margin-bottom:8px">
        <label style="display:flex;justify-content:space-between"><span>${esc(skill)}</span><span style="color:var(--text3)">${level}%</span></label>
        <input type="range" min="20" max="100" step="5" value="${level}"
          oninput="state.skillLevels['${esc(skill)}']=parseInt(this.value);this.previousElementSibling.querySelector('span:last-child').textContent=this.value+'%';renderPreview()">
      </div>`;
    }).join('');
  } else {
    sec.style.display='none';
  }
}

// ===== TEMPLATES =====
function renderTemplateGrid(){
  const grid=document.getElementById('tmpl-grid');if(!grid)return;
  grid.innerHTML=TEMPLATES.map(t=>`
    <div class="tmpl-card ${state.template===t.id?'selected':''}" onclick="selectTemplate(${t.id},this)" id="tmpl-card-${t.id}">
      <div class="tmpl-thumb">${tmplThumb(t)}</div>
      <div class="tmpl-name">${t.name}</div>
    </div>`).join('');
}
function tmplThumb(t){
  const acc=t.id===8?'#E8956A':state.accentColor||'#C8402A';
  const bg=t.id===8?'#1A1814':'#fff';
  const tc=t.id===8?'#F0EDE6':'#1A1814';
  const lc=t.id===8?'rgba(255,255,255,0.08)':'#f0f0f0';
  if(t.id===1||t.id===5||t.id===6||t.id===8){
    return `<div style="background:${bg};padding:8px;height:88px">
      <div style="font-family:'Playfair Display',serif;font-size:11px;font-weight:700;color:${tc}">Jan Novák</div>
      <div style="width:24px;height:2px;background:${acc};margin:4px 0 6px"></div>
      <div style="height:3px;width:85%;background:${lc};border-radius:2px;margin-bottom:3px"></div>
      <div style="height:3px;width:65%;background:${lc};border-radius:2px;margin-bottom:3px"></div>
      ${t.id===5?`<div style="display:flex;gap:4px;margin-top:5px"><div style="width:6px;height:6px;border-radius:50%;background:${acc}"></div><div style="height:3px;width:60%;background:${lc};border-radius:2px;margin-top:2px"></div></div>`:''}
      ${t.id===6?`<div style="margin-top:4px"><div style="height:3px;width:80%;background:${acc};border-radius:2px;opacity:0.7"></div></div>`:''}
    </div>`;
  }
  if(t.id===2){
    return `<div style="height:88px">
      <div style="background:${acc};padding:8px 8px 6px"><div style="font-family:'Playfair Display',serif;font-size:10px;font-weight:700;color:#fff">Jan Novák</div><div style="font-size:8px;color:rgba(255,255,255,0.7)">Marketér</div></div>
      <div style="padding:6px 8px"><div style="height:3px;width:80%;background:#f0f0f0;border-radius:2px;margin-bottom:3px"></div><div style="height:3px;width:60%;background:#f0f0f0;border-radius:2px"></div></div>
    </div>`;
  }
  if(t.id===3){
    return `<div style="display:grid;grid-template-columns:36px 1fr;height:88px">
      <div style="background:${acc};padding:6px 5px"><div style="font-size:7px;color:rgba(255,255,255,0.7);line-height:1.8">Jan<br>Novák</div></div>
      <div style="padding:6px 6px"><div style="height:3px;width:90%;background:#f0f0f0;border-radius:2px;margin-bottom:3px"></div><div style="height:3px;width:70%;background:#f0f0f0;border-radius:2px;margin-bottom:3px"></div><div style="height:3px;width:80%;background:#f0f0f0;border-radius:2px"></div></div>
    </div>`;
  }
  if(t.id===4){
    return `<div style="background:#fff;padding:8px;height:88px">
      <div style="display:flex;justify-content:space-between;border-bottom:2px solid ${acc};padding-bottom:5px;margin-bottom:5px">
        <div style="font-family:'Playfair Display',serif;font-size:10px;font-weight:700">Jan Novák</div>
        <div style="text-align:right;font-size:7px;color:#888;line-height:1.8">email<br>telefon</div>
      </div>
      <div style="height:3px;width:80%;background:#f0f0f0;border-radius:2px;margin-bottom:3px"></div>
      <div style="height:3px;width:60%;background:#f0f0f0;border-radius:2px"></div>
    </div>`;
  }
  if(t.id===7){
    return `<div style="height:88px;background:#fff">
      <div style="padding:6px 8px;border-bottom:2px solid ${acc}"><div style="font-family:'Playfair Display',serif;font-size:10px;font-weight:700">Jan Novák</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;padding:5px 0">
        <div style="padding:0 6px;border-right:1px solid #eee"><div style="height:3px;width:90%;background:#f0f0f0;border-radius:2px;margin-bottom:3px"></div><div style="height:3px;width:70%;background:#f0f0f0;border-radius:2px"></div></div>
        <div style="padding:0 6px"><div style="height:3px;width:80%;background:#f0f0f0;border-radius:2px;margin-bottom:3px"></div><div style="height:3px;width:60%;background:#f0f0f0;border-radius:2px"></div></div>
      </div>
    </div>`;
  }
  return `<div style="background:#f9f9f9;height:88px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999">${t.name}</div>`;
}

function selectTemplate(id,el){
  state.template=id;
  document.querySelectorAll('.tmpl-card').forEach(c=>c.classList.remove('selected'));
  if(el)el.classList.add('selected');
  renderPreview();
  if(state.template===6) renderSkillLevelsUI();
  else { const sec=document.getElementById('skill-levels-section'); if(sec)sec.style.display='none'; }
  saveToStorage();
}

// ===== LISTS =====
function addExp(){const id=++expCount;state.experiences.push({id,title:'',company:'',from:'',to:'',desc:''});renderExpList();}
function removeExp(id){state.experiences=state.experiences.filter(e=>e.id!==id);renderExpList();renderPreview();saveToStorage();}
function renderExpList(){
  const el=document.getElementById('exp-list');if(!el)return;
  el.innerHTML=state.experiences.map(e=>`
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
      <button class="ai-pill" onclick="aiImproveExpItem(${e.id})">
        <span class="ai-spinner" id="sp-exp-${e.id}"></span>
        <span class="ai-btn-text">✦ AI vylepší popis</span>
      </button>
    </div>`).join('');
}

function addEdu(){const id=++eduCount;state.education.push({id,degree:'',school:'',year:''});renderEduList();}
function removeEdu(id){state.education=state.education.filter(e=>e.id!==id);renderEduList();renderPreview();saveToStorage();}
function renderEduList(){
  const el=document.getElementById('edu-list');if(!el)return;
  el.innerHTML=state.education.map(e=>`
    <div class="item-card">
      <button class="item-remove" onclick="removeEdu(${e.id})">×</button>
      <div class="field"><label>Titul / obor</label><input value="${esc(e.degree)}" placeholder="Bc. Marketing" oninput="state.education.find(x=>x.id==${e.id}).degree=this.value;renderPreview();saveToStorage()"></div>
      <div class="field-row">
        <div class="field"><label>Škola</label><input value="${esc(e.school)}" placeholder="VŠE Praha" oninput="state.education.find(x=>x.id==${e.id}).school=this.value;renderPreview();saveToStorage()"></div>
        <div class="field"><label>Rok</label><input value="${esc(e.year)}" placeholder="2019" oninput="state.education.find(x=>x.id==${e.id}).year=this.value;renderPreview();saveToStorage()"></div>
      </div>
    </div>`).join('');
}

function addLang(){const id=++langCount;state.languages.push({id,lang:'',level:'Pokročilý'});renderLangList();}
function removeLang(id){state.languages=state.languages.filter(e=>e.id!==id);renderLangList();renderPreview();saveToStorage();}
function renderLangList(){
  const el=document.getElementById('lang-list');if(!el)return;
  const levels=['Začátečník','Mírně pokročilý','Pokročilý','Velmi pokročilý','Rodilý mluvčí'];
  el.innerHTML=state.languages.map(e=>`
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
    </div>`).join('');
}

function addCert(){const id=++certCount;state.certifications.push({id,name:'',org:'',year:''});renderCertList();}
function removeCert(id){state.certifications=state.certifications.filter(e=>e.id!==id);renderCertList();renderPreview();saveToStorage();}
function renderCertList(){
  const el=document.getElementById('cert-list');if(!el)return;
  el.innerHTML=state.certifications.map(e=>`
    <div class="item-card">
      <button class="item-remove" onclick="removeCert(${e.id})">×</button>
      <div class="field"><label>Název certifikátu</label><input value="${esc(e.name)}" placeholder="Google Analytics Certification" oninput="state.certifications.find(x=>x.id==${e.id}).name=this.value;renderPreview();saveToStorage()"></div>
      <div class="field-row">
        <div class="field"><label>Vydavatel</label><input value="${esc(e.org)}" placeholder="Google" oninput="state.certifications.find(x=>x.id==${e.id}).org=this.value;renderPreview();saveToStorage()"></div>
        <div class="field"><label>Rok</label><input value="${esc(e.year)}" placeholder="2024" oninput="state.certifications.find(x=>x.id==${e.id}).year=this.value;renderPreview();saveToStorage()"></div>
      </div>
    </div>`).join('');
}
function renderAllLists(){renderExpList();renderEduList();renderLangList();renderCertList();}

// ===== PREVIEW RENDER =====
function renderPreview(){
  const preview=document.getElementById('cv-preview');if(!preview)return;
  const t=TEMPLATES.find(x=>x.id===state.template)||TEMPLATES[0];
  preview.className=`cv-sheet ${t.class} fs-${state.fontSize} den-${state.density}`;
  document.documentElement.style.setProperty('--cv-accent',state.accentColor||t.accent);
  const fullName=`${state.name||'Jan'} ${state.surname||'Novák'}`.trim();
  const contact=[state.email,state.phone,state.city,state.linkedin].filter(Boolean);
  const renderers={1:renderT1,2:renderT2,3:renderT3,4:renderT4,5:renderT5,6:renderT6,7:renderT7,8:renderT8};
  const fn=renderers[state.template]||renderT1;
  preview.innerHTML=fn(fullName,contact);
}

function photoTag(cls,style){
  return state.photo?`<img src="${state.photo}" class="${cls||'cv-photo'}" ${style?`style="${style}"`:''} alt="foto">`:'';
}

function expItems(timeline){
  return state.experiences.map(e=>{
    if(timeline){
      return `<div class="cv-tl-item">
        <div class="cv-tl-dot"></div>
        <div class="cv-exp-row"><div class="cv-exp-title">${esc(e.title||'Pozice')}</div><div class="cv-exp-date">${esc(e.from)}${e.to?' – '+esc(e.to):''}</div></div>
        <div class="cv-exp-company cv-accent">${esc(e.company||'Firma')}</div>
        ${e.desc?`<div class="cv-exp-desc">${esc(e.desc)}</div>`:''}
      </div>`;
    }
    return `<div class="cv-exp-item">
      <div class="cv-exp-row"><div class="cv-exp-title">${esc(e.title||'Pozice')}</div><div class="cv-exp-date">${esc(e.from)}${e.to?' – '+esc(e.to):''}</div></div>
      <div class="cv-exp-company cv-accent">${esc(e.company||'Firma')}</div>
      ${e.desc?`<div class="cv-exp-desc">${esc(e.desc)}</div>`:''}
    </div>`;
  }).join('');
}

function eduItems(){
  return state.education.map(e=>`
    <div class="cv-edu-item">
      <div class="cv-edu-degree">${esc(e.degree||'Obor')}</div>
      <div class="cv-edu-school cv-accent">${esc(e.school||'Škola')}</div>
      ${e.year?`<div class="cv-edu-year">${esc(e.year)}</div>`:''}
    </div>`).join('');
}

function skillPills(){
  if(!state.skills)return '<span class="cv-empty">Zadejte dovednosti</span>';
  return `<div class="cv-skills-wrap">${state.skills.split(',').map(s=>s.trim()).filter(Boolean).map(s=>`<span class="cv-skill-pill">${esc(s)}</span>`).join('')}</div>`;
}

function skillBars(){
  if(!state.skills)return '<span class="cv-empty">Zadejte dovednosti</span>';
  return state.skills.split(',').map(s=>s.trim()).filter(Boolean).map(s=>{
    const pct=state.skillLevels[s]||80;
    return `<div class="cv-skill-bar-row">
      <div class="cv-skill-bar-label">${esc(s)}</div>
      <div class="cv-skill-bar-track"><div class="cv-skill-bar-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}

function langItems(){
  return state.languages.map(l=>`
    <div class="cv-lang-item"><span class="cv-lang-name">${esc(l.lang||'Jazyk')}</span><span class="cv-lang-level">${esc(l.level)}</span></div>`).join('');
}
function certItems(){
  return state.certifications.map(c=>`
    <div class="cv-cert-item"><div class="cv-cert-name">${esc(c.name||'Certifikát')}</div><div class="cv-cert-org">${esc(c.org||'')}${c.year?' · '+esc(c.year):''}</div></div>`).join('');
}

function secIf(condition,title,content){
  if(!condition)return '';
  return `<div class="cv-section"><div class="cv-sec-title">${title}</div>${content}</div>`;
}

// ===== TEMPLATE RENDERERS =====
function renderT1(name,contact){
  const ph=photoTag('cv-photo');
  return `<div class="cv-header">
    <div class="cv-name-row">
      <div><div class="cv-name">${esc(name)}</div><div class="cv-job-title cv-accent">${esc(state.jobtitle||'Váš profesní titul')}</div>
      <div class="cv-contact">${contact.map(c=>`<span class="cv-contact-item">${esc(c)}</span>`).join('')}</div></div>
      ${ph}
    </div>
    <div class="cv-divider-line" style="background:var(--cv-accent)"></div>
  </div>
  ${secIf(state.summary,'Profesní shrnutí',`<div class="cv-summary-text">${esc(state.summary)}</div>`)}
  ${secIf(state.experiences.length,'Pracovní zkušenosti',expItems())}
  ${secIf(state.education.length,'Vzdělání',eduItems())}
  ${secIf(state.skills,'Dovednosti',skillPills())}
  ${secIf(state.languages.length,'Jazyky',`<div class="cv-langs">${langItems()}</div>`)}
  ${secIf(state.certifications.length,'Certifikáty & kurzy',certItems())}`;
}

function renderT2(name,contact){
  const ph=state.photo?`<img src="${state.photo}" class="cv-banner-photo" alt="foto">`:'';
  return `<div class="cv-banner">
    ${ph}
    <div class="cv-name">${esc(name)}</div>
    <div class="cv-job-title">${esc(state.jobtitle||'Váš profesní titul')}</div>
    <div class="cv-contact-banner">${contact.map(c=>`<span>${esc(c)}</span>`).join('')}</div>
  </div>
  <div class="cv-body">
    ${secIf(state.summary,'Profesní shrnutí',`<div class="cv-summary-text">${esc(state.summary)}</div>`)}
    ${secIf(state.experiences.length,'Pracovní zkušenosti',expItems())}
    ${secIf(state.education.length,'Vzdělání',eduItems())}
    ${secIf(state.skills,'Dovednosti',skillPills())}
    ${secIf(state.languages.length,'Jazyky',`<div class="cv-langs">${langItems()}</div>`)}
    ${secIf(state.certifications.length,'Certifikáty & kurzy',certItems())}
  </div>`;
}

function renderT3(name,contact){
  const ph=state.photo
    ?`<img src="${state.photo}" class="cv-sidebar-photo" alt="foto">`
    :`<div class="cv-sidebar-photo-placeholder">👤</div>`;
  const skillsSide=state.skills?state.skills.split(',').map(s=>s.trim()).filter(Boolean).map(s=>`<span class="cv-skill-side">${esc(s)}</span>`).join(''):'';
  const langsSide=state.languages.map(l=>`<div class="cv-lang-side"><span>${esc(l.lang)}</span><span>${esc(l.level)}</span></div>`).join('');
  return `<div class="cv-sidebar">
    ${ph}
    <div class="cv-name">${esc(name)}</div>
    <div class="cv-title-side">${esc(state.jobtitle||'')}</div>
    <div class="cv-sec-title-side">Kontakt</div>
    <div class="cv-contact-side">${contact.map(c=>`<div>${esc(c)}</div>`).join('')}</div>
    ${state.skills?`<div class="cv-sec-title-side">Dovednosti</div>${skillsSide}`:''}
    ${state.languages.length?`<div class="cv-sec-title-side">Jazyky</div>${langsSide}`:''}
    ${state.certifications.length?`<div class="cv-sec-title-side">Certifikáty</div>${state.certifications.map(c=>`<div class="cv-skill-side">${esc(c.name)}</div>`).join('')}`:''}
  </div>
  <div class="cv-main">
    ${secIf(state.summary,'Profesní shrnutí',`<div class="cv-summary-text">${esc(state.summary)}</div>`)}
    ${secIf(state.experiences.length,'Pracovní zkušenosti',expItems())}
    ${secIf(state.education.length,'Vzdělání',eduItems())}
  </div>`;
}

function renderT4(name,contact){
  const ph=photoTag('cv-photo');
  return `<div class="cv-asym-header">
    <div>
      <div class="cv-name">${esc(name)}</div>
      <div class="cv-job-title-asym cv-accent">${esc(state.jobtitle||'Váš profesní titul')}</div>
    </div>
    <div style="display:flex;align-items:flex-end;gap:12px">
      <div class="cv-contact-right">${contact.map(c=>`<span>${esc(c)}</span>`).join('')}</div>
      ${ph}
    </div>
  </div>
  ${secIf(state.summary,'Profesní shrnutí',`<div class="cv-summary-text">${esc(state.summary)}</div>`)}
  ${secIf(state.experiences.length,'Pracovní zkušenosti',expItems())}
  ${secIf(state.education.length,'Vzdělání',eduItems())}
  ${secIf(state.skills,'Dovednosti',skillPills())}
  ${secIf(state.languages.length,'Jazyky',`<div class="cv-langs">${langItems()}</div>`)}
  ${secIf(state.certifications.length,'Certifikáty & kurzy',certItems())}`;
}

function renderT5(name,contact){
  const ph=photoTag('cv-photo');
  return `<div class="cv-header">
    <div class="cv-name-row">
      <div><div class="cv-name">${esc(name)}</div><div class="cv-job-title cv-accent">${esc(state.jobtitle||'Váš profesní titul')}</div>
      <div class="cv-contact">${contact.map(c=>`<span class="cv-contact-item">${esc(c)}</span>`).join('')}</div></div>
      ${ph}
    </div>
    <div class="cv-divider-line" style="background:var(--cv-accent)"></div>
  </div>
  ${secIf(state.summary,'Profesní shrnutí',`<div class="cv-summary-text">${esc(state.summary)}</div>`)}
  ${secIf(state.experiences.length,'Pracovní zkušenosti',`<div class="cv-timeline">${expItems(true)}</div>`)}
  ${secIf(state.education.length,'Vzdělání',eduItems())}
  ${secIf(state.skills,'Dovednosti',skillPills())}
  ${secIf(state.languages.length,'Jazyky',`<div class="cv-langs">${langItems()}</div>`)}
  ${secIf(state.certifications.length,'Certifikáty & kurzy',certItems())}`;
}

function renderT6(name,contact){
  const ph=photoTag('cv-photo');
  return `<div class="cv-header">
    <div class="cv-name-row">
      <div><div class="cv-name">${esc(name)}</div><div class="cv-job-title cv-accent">${esc(state.jobtitle||'Váš profesní titul')}</div>
      <div class="cv-contact">${contact.map(c=>`<span class="cv-contact-item">${esc(c)}</span>`).join('')}</div></div>
      ${ph}
    </div>
    <div class="cv-divider-line" style="background:var(--cv-accent)"></div>
  </div>
  ${secIf(state.summary,'Profesní shrnutí',`<div class="cv-summary-text">${esc(state.summary)}</div>`)}
  ${secIf(state.experiences.length,'Pracovní zkušenosti',expItems())}
  ${secIf(state.education.length,'Vzdělání',eduItems())}
  ${secIf(state.skills,'Dovednosti',skillBars())}
  ${secIf(state.languages.length,'Jazyky',`<div class="cv-langs">${langItems()}</div>`)}
  ${secIf(state.certifications.length,'Certifikáty & kurzy',certItems())}`;
}

function renderT7(name,contact){
  const ph=photoTag('cv-photo');
  return `<div class="cv-top-bar">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div><div class="cv-name">${esc(name)}</div><div class="cv-job-title cv-accent">${esc(state.jobtitle||'Váš profesní titul')}</div></div>
      ${ph}
    </div>
    <div class="cv-contact-row">${contact.map(c=>`<span>${esc(c)}</span>`).join('')}</div>
  </div>
  <div class="cv-cols">
    <div class="cv-col-left">
      ${secIf(state.summary,'Profesní shrnutí',`<div class="cv-summary-text">${esc(state.summary)}</div>`)}
      ${secIf(state.experiences.length,'Pracovní zkušenosti',expItems())}
    </div>
    <div class="cv-col-right">
      ${secIf(state.education.length,'Vzdělání',eduItems())}
      ${secIf(state.skills,'Dovednosti',skillPills())}
      ${secIf(state.languages.length,'Jazyky',`<div class="cv-langs">${langItems()}</div>`)}
      ${secIf(state.certifications.length,'Certifikáty & kurzy',certItems())}
    </div>
  </div>`;
}

function renderT8(name,contact){
  const ph=photoTag('cv-photo');
  return `<div class="cv-header">
    <div class="cv-name-row">
      <div><div class="cv-name">${esc(name)}</div><div class="cv-job-title">${esc(state.jobtitle||'Váš profesní titul')}</div>
      <div class="cv-contact">${contact.map(c=>`<span class="cv-contact-item">${esc(c)}</span>`).join('')}</div></div>
      ${ph}
    </div>
    <div class="cv-divider-line"></div>
  </div>
  ${secIf(state.summary,'Profesní shrnutí',`<div class="cv-summary-text">${esc(state.summary)}</div>`)}
  ${secIf(state.experiences.length,'Pracovní zkušenosti',expItems())}
  ${secIf(state.education.length,'Vzdělání',eduItems())}
  ${secIf(state.skills,'Dovednosti',skillPills())}
  ${secIf(state.languages.length,'Jazyky',`<div class="cv-langs">${langItems()}</div>`)}
  ${secIf(state.certifications.length,'Certifikáty & kurzy',certItems())}`;
}

// ===== AI (demo mode) =====
async function aiImprove(field){
  const spId='sp-'+field;
  spinner(spId,true);setBtnText(spId,true);
  await new Promise(r=>setTimeout(r,1200));
  spinner(spId,false);setBtnText(spId,false);
  showMsg('ai-msg','✓ Sekce zkontrolována. Plné AI vylepšení bude aktivní po připojení API klíče.','info');
}
async function aiImproveExpItem(id){
  spinner('sp-exp-'+id,true);
  const btn=document.getElementById('sp-exp-'+id);
  if(btn){const t=btn.closest('button')?.querySelector('.ai-btn-text');if(t)t.textContent='AI pracuje...';}
  await new Promise(r=>setTimeout(r,1000));
  spinner('sp-exp-'+id,false);
  if(btn){const t=btn.closest('button')?.querySelector('.ai-btn-text');if(t)t.textContent='✦ AI vylepší popis';}
  showMsg('ai-msg','✓ Popis zkontrolován. Po aktivaci API klíče dostanete plné přepsání.','info');
}
async function aiPolishAll(){
  ['sp-all','sp-toolbar'].forEach(id=>spinner(id,true));
  const btn=document.getElementById('sp-all');
  if(btn){const t=btn.querySelector('.ai-btn-text');if(t)t.textContent='AI prochází CV...';}
  showMsg('ai-msg','⏳ AI prochází celé CV...','info');
  await new Promise(r=>setTimeout(r,1800));
  ['sp-all','sp-toolbar'].forEach(id=>spinner(id,false));
  setBtnText('sp-all',false);
  showMsg('ai-msg','✓ CV zkontrolováno. Plné AI vylepšení bude aktivní po připojení API klíče.','info');
}
async function aiGenerateLetter(){
  spinner('sp-letter',true);setBtnText('sp-letter',true);
  showMsg('letter-msg','⏳ AI píše dopis...','info');
  await new Promise(r=>setTimeout(r,1500));
  spinner('sp-letter',false);setBtnText('sp-letter',false);
  showMsg('letter-msg','✓ Dopis připraven jako šablona. Po aktivaci API klíče AI napíše personalizovaný dopis na míru.','info');
}

// ===== UPLOAD =====
function handleDrop(event){
  event.preventDefault();
  document.getElementById('upload-zone').classList.remove('drag-over');
  const file=event.dataTransfer.files[0];if(file)processFile(file);
}
function handleFileUpload(input){const file=input.files[0];if(file)processFile(file);}
function processFile(file){
  const name=file.name.toLowerCase();
  if(name.endsWith('.txt')||name.endsWith('.rtf')){
    const reader=new FileReader();
    reader.onload=e=>{
      document.getElementById('paste-cv').value=e.target.result;
      showMsg('upload-msg','✓ Soubor načten. Klikněte na AI zpracování nebo upravte text ručně.','success');
    };
    reader.readAsText(file,'UTF-8');
  } else if(name.endsWith('.pdf')||name.endsWith('.docx')||name.endsWith('.doc')){
    showMsg('upload-msg','📄 PDF a DOCX: otevřete soubor, vyberte veškerý text (Ctrl+A), zkopírujte (Ctrl+C) a vložte do textového pole níže.','info');
    document.getElementById('paste-cv').focus();
  } else {
    showMsg('upload-msg','⚠ Nepodporovaný formát. Zkuste TXT nebo vložte text ručně.','error');
  }
}
async function aiParsePaste(){
  const text=document.getElementById('paste-cv').value.trim();
  if(!text){showMsg('upload-msg','⚠ Vložte nejprve text CV.','error');return;}
  spinner('sp-paste',true);setBtnText('sp-paste',true);
  showMsg('upload-msg','⏳ Zpracovávám CV...','info');
  await new Promise(r=>setTimeout(r,1500));
  spinner('sp-paste',false);setBtnText('sp-paste',false);
  const emailMatch=text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if(emailMatch){state.email=emailMatch[0];const el=document.getElementById('f-email');if(el)el.value=state.email;}
  const phoneMatch=text.match(/(\+?[\d\s\-()]{9,})/);
  if(phoneMatch){const c=phoneMatch[0].trim();if(c.length>=9){state.phone=c;const el=document.getElementById('f-phone');if(el)el.value=state.phone;}}
  document.getElementById('paste-cv').value='';
  showMsg('upload-msg','✓ Základní info extrahováno. Po aktivaci API klíče AI vyplní vše automaticky (jméno, zkušenosti, vzdělání...).','success');
}

// ===== MODAL =====
function handlePdfDownload(){document.getElementById('paywall-modal').classList.remove('hidden');}
function closeModal(){document.getElementById('paywall-modal').classList.add('hidden');}
function mockPayment(){closeModal();alert('Platební brána bude brzy aktivována.\nPo napojení Stripe bude PDF stažení okamžité.');}
function generatePDF(){
  const el=document.getElementById('cv-preview');
  const fullName=(state.name+' '+state.surname).trim()||'CV';
  const opt={margin:[10,10,10,10],filename:`${fullName.replace(/\s+/g,'_')}_CV.pdf`,image:{type:'jpeg',quality:0.98},html2canvas:{scale:2,useCORS:true},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}};
  html2pdf().set(opt).from(el).save();
}
document.addEventListener('DOMContentLoaded',()=>{
  const modal=document.getElementById('paywall-modal');
  if(modal)modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
});
