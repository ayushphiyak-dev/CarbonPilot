'use strict';

/* STATE */
const DS = {
  page:'dash', assessStep:1,
  assess:{ car_days:5, car_type:'petrol', bus_days:0, diet:'flexitarian', meatfree_days:2, food_waste:'some', household:2, electricity:50, heating:'gas', clothing:1, secondhand:'sometimes', flights_short:2, flights_long:1 },
  sim:{ tr:1, ca:5, mf:1, fw:10, el:0, fl:2 },
  tracked:['bus', 'meatfree', 'standby', 'showers'],
  actions:{ bus:true, meatfree:true, standby:false, showers:false, green_energy:false, cycling:false }
};
const ALL_ACTIONS = [
  { id:'bus',          label:'Take bus/train 3 days/week',   kg:396  },
  { id:'meatfree',     label:'2 meat-free days per week',    kg:264  },
  { id:'standby',      label:'Switch off standby devices',   kg:52   },
  { id:'showers',      label:'2-minute shorter showers',     kg:36   },
  { id:'green_energy', label:'Switch to green energy tariff',kg:210  },
  { id:'cycling',      label:'Cycle instead of driving 1x/wk',kg:94  }
];

function loadState(){
  try{
    const s=JSON.parse(localStorage.getItem('cp-state'));
    if(!s) return JSON.parse(JSON.stringify(DS));
    return { page:s.page||DS.page, assessStep:s.assessStep||1,
      assess:Object.assign({},DS.assess,s.assess),
      sim:Object.assign({},DS.sim,s.sim),
      tracked:s.tracked||DS.tracked,
      actions:Object.assign({},DS.actions,s.actions) };
  }catch(_){ return JSON.parse(JSON.stringify(DS)); }
}
let S=loadState();
function save(){ try{localStorage.setItem('cp-state',JSON.stringify(S));}catch(_){} }

/* CALC */
let cats=[], fp=6200;
const CAR_FACTOR={petrol:1,diesel:1.15,electric:0.25,none:0};
const DIET_BASE={heavy_meat:2800,omnivore:2100,flexitarian:1488,vegetarian:1050,vegan:700};
const WASTE_MULT={none:0.85,some:1.0,lots:1.2};
const HEAT_KG={gas:1000,heatpump:200,solar:50,oil:1500};
const SH_FACTOR={yes:0.15,sometimes:0.5,no:1.0};

function recalc(){
  const a=S.assess;
  const tKg=Math.round(Math.max(0,a.car_days*52*9.8*CAR_FACTOR[a.car_type||'petrol'])-a.bus_days*52*0.8);
  const fKg=Math.round(Math.max(500,(DIET_BASE[a.diet||'flexitarian']-(a.meatfree_days||0)*22)*WASTE_MULT[a.food_waste||'some']));
  const hKg=Math.round(a.electricity*13.6+(HEAT_KG[a.heating||'gas']||1000)/Math.max(1,a.household||2));
  const sKg=Math.round((500+(a.clothing||1)*80)*SH_FACTOR[a.secondhand||'sometimes']);
  const wKg=Math.round((a.flights_short||0)*180+(a.flights_long||0)*1500+200);
  fp=tKg+fKg+hKg+sKg+wKg;
  
  const isDark=document.documentElement.getAttribute('data-theme')==='dark';
  const cTr=isDark?'#FFFFFF':'#1C1C1E';
  const cFo=isDark?'#FF7B6B':'#E85D4E';
  const cHo=isDark?'#3395FF':'#007AFF';
  const cSh=isDark?'#FFB340':'#FF9500';
  const cTrv=isDark?'#A1A1A6':'#8E8E93';

  cats=[
    {label:'Transport',color:cTr,kg:tKg,pct:Math.round(tKg/fp*100)},
    {label:'Food',     color:cFo,kg:fKg,pct:Math.round(fKg/fp*100)},
    {label:'Home',     color:cHo,kg:hKg,pct:Math.round(hKg/fp*100)},
    {label:'Shopping', color:cSh,kg:sKg,pct:Math.round(sKg/fp*100)},
    {label:'Travel',   color:cTrv,kg:wKg,pct:Math.round(wKg/fp*100)}
  ];
}

/* THEME */
function initTheme(){
  const t=localStorage.getItem('cp-theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
  applyTheme(t);
}
function applyTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  localStorage.setItem('cp-theme',t);
  const sun=document.getElementById('theme-icon-sun'),moon=document.getElementById('theme-icon-moon');
  if(sun) sun.style.display=t==='dark'?'block':'none';
  if(moon) moon.style.display=t==='dark'?'none':'block';
  recalc();
  updateChartColors();
  renderDash();
  updateSim();
}
function toggleTheme(){ applyTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark'); }

/* ROUTING */
function go(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const t=document.getElementById('page-'+id);
  if(t) t.classList.add('active');
  document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===id));
  S.page=id; save();
  const m=document.querySelector('.main');
  if(m) m.scrollTop=0;
  window.scrollTo(0,0);
  setTimeout(observeReveals,60);
}

function observeReveals(){
  const els=document.querySelectorAll('.page.active .reveal');
  els.forEach(e=>e.classList.remove('visible'));
  const obs=new IntersectionObserver(en=>en.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); }),{threshold:0.1,rootMargin:'0px 0px -50px 0px'});
  els.forEach(e=>obs.observe(e));
}

/* UI */
function pickChip(el){ const g=el.closest('.chip-group'); if(!g) return; g.querySelectorAll('.chip').forEach(c=>c.classList.remove('active')); el.classList.add('active'); }

function escapeHtml(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
function $t(id,v){ const e=document.getElementById(id); if(e) e.textContent=v; }
function $h(id,v){ const e=document.getElementById(id); if(e) e.innerHTML=v; }
function chipVal(groupId, fallback){ const a=document.querySelector('#'+groupId+' .chip.active'); return a?a.dataset.val:fallback; }

/* ASSESS STEPS */
function showStep(n){
  for(let i=1;i<=5;i++){
    const s=document.getElementById('assess-step-'+i);
    if(s) s.style.display=i===n?'block':'none';
  }
  document.querySelectorAll('#assess-stepper .stepper-step').forEach((el,i)=>{
    el.classList.remove('done','current');
    if(i+1<n) el.classList.add('done');
    if(i+1===n) el.classList.add('current');
  });
  S.assessStep=n; save();
  window.scrollTo(0,0);
}

function readStep(n){
  const a=S.assess;
  if(n===1){ a.car_days=+chipVal('car-days-group','5'); a.car_type=chipVal('car-type-group','petrol'); a.bus_days=+chipVal('bus-days-group','0'); }
  if(n===2){ a.diet=chipVal('diet-group','flexitarian'); a.meatfree_days=+chipVal('meatfree-days-group','2'); a.food_waste=chipVal('food-waste-group','some'); }
  if(n===3){ const hh=document.getElementById('assess-household'),el=document.getElementById('assess-electricity'),ch=document.querySelector('#assess-heating .chip.active'); if(hh) a.household=+hh.value; if(el) a.electricity=+el.value; if(ch) a.heating=ch.dataset.val; }
  if(n===4){ a.clothing=+chipVal('clothing-group','1'); a.secondhand=chipVal('secondhand-group','sometimes'); }
  if(n===5){ a.flights_short=+chipVal('flights-short-group','2'); a.flights_long=+chipVal('flights-long-group','1'); }
  save();
}

function assessNext(current){ readStep(current); showStep(current+1); }
function assessBack(current){ showStep(current-1); }

function restoreAssessForm(){
  const a=S.assess;
  function setChip(gid,val){ const c=document.querySelector(`#${gid} .chip[data-val="${val}"]`); if(c){ document.querySelectorAll(`#${gid} .chip`).forEach(x=>x.classList.remove('active')); c.classList.add('active'); } }
  setChip('car-days-group',String(a.car_days)); setChip('car-type-group',a.car_type); setChip('bus-days-group',String(a.bus_days));
  setChip('diet-group',a.diet); setChip('meatfree-days-group',String(a.meatfree_days)); setChip('food-waste-group',a.food_waste);
  const hh=document.getElementById('assess-household'); if(hh) hh.value=a.household;
  const el=document.getElementById('assess-electricity'); if(el) el.value=a.electricity;
  setChip('assess-heating',a.heating);
  setChip('clothing-group',String(a.clothing)); setChip('secondhand-group',a.secondhand);
  setChip('flights-short-group',String(a.flights_short)); setChip('flights-long-group',String(a.flights_long));
  showStep(S.assessStep||1);
}

function saveAssessment(){ readStep(S.assessStep); recalc(); renderAll(); go('dash'); }

/* CHARTS */
const CH={};
function cc(){
  const d=document.documentElement.getAttribute('data-theme')==='dark';
  return { text:d?'#A1A1A6':'#6E6E73', grid:d?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', bg:d?'#1C1C1E':'#FFFFFF', ttBg:d?'#2C2C2E':'#FFFFFF', ttTi:d?'#FFFFFF':'#1C1C1E', ttBo:d?'#A1A1A6':'#6E6E73', ttBr:d?'#38383A':'#E8E8ED' };
}
function tt(c){ return {backgroundColor:c.ttBg,titleColor:c.ttTi,bodyColor:c.ttBo,borderColor:c.ttBr,borderWidth:1,padding:14,cornerRadius:14}; }

function updateChartColors(){
  if(typeof Chart==='undefined') return;
  const c=cc(); Chart.defaults.color=c.text; Chart.defaults.borderColor=c.grid;
  const d=document.documentElement.getAttribute('data-theme')==='dark';
  const cAcc=d?'#FF7B6B':'#E85D4E';
  const cAccLight=d?'rgba(255,123,107,0.1)':'rgba(232,93,78,0.06)';
  
  Object.values(CH).forEach(ch=>{ 
    if(!ch) return; 
    try{ 
      if(ch.options.scales?.x) ch.options.scales.x.grid.color=c.grid; 
      if(ch.options.scales?.y) ch.options.scales.y.grid.color=c.grid; 
      if(ch.options.plugins?.tooltip) Object.assign(ch.options.plugins.tooltip,tt(c)); 
      
      if(ch.config.type==='line') {
        ch.data.datasets[0].borderColor=cAcc;
        ch.data.datasets[0].backgroundColor=cAccLight;
        ch.data.datasets[0].pointBackgroundColor=cAcc;
        ch.data.datasets[0].pointBorderColor=c.bg;
      }
      if(ch.config.type==='bar') {
        ch.data.datasets[0].backgroundColor=cAcc;
      }
      if(ch.config.type==='doughnut') {
        ch.data.datasets[0].borderColor=c.bg;
      }
      ch.update(); 
    }catch(_){} 
  });
}

function initCharts(){
  if(typeof Chart==='undefined') return;
  Chart.defaults.font.family="'Inter',sans-serif";
  const c=cc();
  const d=document.documentElement.getAttribute('data-theme')==='dark';
  const cAcc=d?'#FF7B6B':'#E85D4E';
  const cAccLight=d?'rgba(255,123,107,0.1)':'rgba(232,93,78,0.06)';

  const dc=document.getElementById('chartDonut');
  if(dc&&!CH.donut) CH.donut=new Chart(dc,{type:'doughnut',data:{labels:cats.map(x=>x.label),datasets:[{data:cats.map(x=>x.pct),backgroundColor:cats.map(x=>x.color),borderWidth:2,borderColor:c.bg,hoverOffset:10}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{display:false},tooltip:{...tt(c),displayColors:true,callbacks:{label:ctx=>' '+ctx.label+': '+ctx.raw+'%'}}}}});
  
  const tc=document.getElementById('chartTrend');
  if(tc&&!CH.trend) CH.trend=new Chart(tc,{type:'line',data:{labels:['Jan','Feb','Mar','Apr','May','Jun'],datasets:[{label:'kg CO₂',data:[580,560,545,530,517,517],borderColor:cAcc,backgroundColor:cAccLight,tension:0.4,fill:true,pointBackgroundColor:cAcc,pointBorderColor:c.bg,pointBorderWidth:2,pointRadius:5,pointHoverRadius:7}]},options:{responsive:true,maintainAspectRatio:false,scales:{x:{ticks:{font:{size:12}},grid:{display:false}},y:{ticks:{font:{size:12},callback:v=>v+' kg'},grid:{color:c.grid}}},plugins:{legend:{display:false},tooltip:tt(c)}}});
  
  const wc=document.getElementById('chartWeekly');
  if(wc&&!CH.weekly) CH.weekly=new Chart(wc,{type:'bar',data:{labels:['Wk 1','Wk 2','Wk 3','Wk 4'],datasets:[{data:[12,9,22,28],backgroundColor:cAcc,borderRadius:8,barThickness:32}]},options:{responsive:true,maintainAspectRatio:false,scales:{x:{ticks:{font:{size:12}},grid:{display:false}},y:{ticks:{font:{size:12},callback:v=>v+' kg'},grid:{color:c.grid}}},plugins:{legend:{display:false},tooltip:tt(c)}}});
}

/* RENDER DASHBOARD */
function renderDash(){
  const eco=Math.max(0,Math.min(100,Math.round(68+((6200-fp)/6200)*60)));
  $t('sidebar-eco-score',eco);
  $h('dash-eco-score',`${eco}<span style="font-size:22px;font-weight:500;color:var(--text-3);margin-left:6px">/ 100</span>`);
  const vs=document.querySelectorAll('#page-dash .stat-value');
  const maxC=cats.reduce((a,b)=>b.kg>a.kg?b:a,cats[0]||{label:'—',pct:0,kg:0});
  if(vs[1]) vs[1].textContent=(fp/1000).toFixed(1)+' t';
  if(vs[2]) vs[2].textContent=Math.round(fp/12)+' kg';
  if(vs[3]) vs[3].textContent=maxC.label;
  const ds=document.querySelectorAll('#page-dash .stat-delta');
  if(ds[3]) ds[3].textContent=maxC.pct+'% of total';
  const sub=document.querySelector('#page-dash .page-subtitle');
  if(sub) sub.innerHTML=`Your complete carbon footprint overview. June 2026 &middot; Household of ${S.assess.household}.`;
  const bars=document.getElementById('catBars');
  if(bars){ bars.innerHTML=''; cats.forEach(c=>{ const d=document.createElement('div'); d.style.marginBottom='18px'; d.innerHTML=`<div class="flex justify-between" style="margin-bottom:8px;font-size:14px"><span style="font-weight:600;color:var(--text)">${c.label}</span><span style="font-weight:700;color:${c.color}">${c.pct}% &middot; ${c.kg} kg</span></div><div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100,c.pct*2)}%;background:${c.color}"></div></div>`; bars.appendChild(d); }); }
  if(CH.donut){ CH.donut.data.labels=cats.map(c=>c.label); CH.donut.data.datasets[0].data=cats.map(c=>c.pct); CH.donut.data.datasets[0].backgroundColor=cats.map(c=>c.color); CH.donut.update(); }
  const leg=document.getElementById('donutLegend');
  if(leg){ leg.innerHTML=''; cats.forEach(c=>{ const s=document.createElement('span'); s.style.cssText='display:flex;align-items:center;gap:8px'; s.innerHTML=`<span style="width:12px;height:12px;border-radius:4px;background:${c.color};display:inline-block"></span>${c.label} ${c.pct}%`; leg.appendChild(s); }); }
}

/* RENDER PROGRESS */
const ACT_KG={bus:396,meatfree:264,standby:52,showers:36,green_energy:210,cycling:94};
function renderProgress(){
  const done=Object.keys(S.actions).filter(k=>S.actions[k]);
  const saved=done.reduce((s,k)=>s+(ACT_KG[k]||0),0);
  const monthly=Math.round(fp/12); const target=450;
  const gpct=Math.min(100,Math.max(0,Math.round(100-((monthly-target)/target)*100)));
  $t('track-co2-saved',saved+' kg'); $t('track-actions-done',done.length+' / '+Object.keys(S.actions).length);
  $t('track-goal-pct',gpct+'%'); $t('track-monthly-now',monthly+' kg now');
  const fill=document.getElementById('track-goal-fill'); if(fill) fill.style.width=gpct+'%';
  const note=document.getElementById('track-goal-note'); if(note) note.textContent=monthly>target?`${monthly-target} kg to go — keep going!`:'🎉 Monthly target reached!';
  $t('track-trees-num',(saved/21.8).toFixed(1));
  const banner=document.getElementById('track-tree-banner'); if(banner){ const h=banner.querySelector('div'); if(h) h.textContent=`Your ${saved} kg saved equals`; }
  renderActions();
}

function renderActions(){
  const list=document.getElementById('active-actions-list');
  if(!list) return;
  list.innerHTML='';
  if(S.tracked.length===0){
    list.innerHTML='<div style="color:var(--text-3);font-size:14px;padding:16px 0">No active actions. Click below to add some!</div>';
    return;
  }
  S.tracked.forEach(tid=>{
    const a=ALL_ACTIONS.find(x=>x.id===tid);
    if(!a) return;
    const done=S.actions[a.id]||false;
    const div=document.createElement('div');
    div.className='action-item';
    div.innerHTML=`<div class="action-check ${done?'done':''}" data-id="${a.id}" onclick="toggleAction(this, '${a.id}')">${done?'<svg width="14" height="14"><use href="#i-check"/></svg>':''}</div><div class="action-content"><div class="action-title">${a.label}</div><div class="action-meta">${done?'Completed!':'Not started'}</div></div><span class="action-badge">−${a.kg} kg/yr</span>`;
    list.appendChild(div);
  });
}

function toggleAction(el,id){
  const isDone=!el.classList.contains('done');
  S.actions[id]=isDone; save(); renderProgress();
}

/* ADD ACTION MODAL */
function openAddActionModal(){
  const modal=document.getElementById('modal-add-action');
  if(!modal) return;
  const list=document.getElementById('modal-action-list');
  if(list){
    list.innerHTML='';
    ALL_ACTIONS.forEach(a=>{
      const div=document.createElement('div');
      div.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--surface);border-radius:16px;border:1px solid var(--border);cursor:pointer;gap:12px';
      const isTracked=S.tracked.includes(a.id);
      div.innerHTML=`<div style="flex:1"><div style="font-weight:600;font-size:15px;color:var(--text)">${a.label}</div><div style="font-size:13px;color:var(--text-3);margin-top:2px">−${a.kg} kg/yr</div></div><div style="width:28px;height:28px;border-radius:50%;background:${isTracked?'var(--accent)':'var(--border)'};display:flex;align-items:center;justify-content:center;flex-shrink:0">${isTracked?'<svg width="14" height="14" style="color:#fff"><use href="#i-check"/></svg>':''}</div>`;
      div.onclick=()=>{
        if(isTracked){ S.tracked=S.tracked.filter(x=>x!==a.id); }
        else{ S.tracked.push(a.id); }
        save(); renderProgress(); openAddActionModal();
      };
      list.appendChild(div);
    });
  }
  modal.style.display='flex';
}
function closeAddActionModal(){ const m=document.getElementById('modal-add-action'); if(m) m.style.display='none'; }

/* RENDER COACH */
function renderCoach(){
  const hl={gas:'gas boiler',heatpump:'heat pump',solar:'solar',oil:'oil/other'};
  $t('coach-profile',`${S.assess.household} people · ${hl[S.assess.heating]||'gas'} heating`);
  $t('coach-footprint',`${(fp/1000).toFixed(1)} t CO₂/year`);
}

/* SIMULATOR */
let simChart=null;
const SC=['#1C1C1E','#E85D4E','#007AFF','#FF9500','#8E8E93'];
const SL=['Transport','Food','Home','Shopping','Travel'];

function updateSim(){
  const ids=['sim-tr','sim-ca','sim-mf','sim-fw','sim-el','sim-fl'];
  const els=ids.map(id=>document.getElementById(id));
  if(!els[0]||!cats.length) return;
  const [tr,ca,mf,fw,el,fl]=els.map(e=>+e.value);
  S.sim={tr,ca,mf,fw,el,fl}; save();
  ['val-tr','val-ca','val-mf','val-fw','val-el','val-fl'].forEach((id,i)=>{ const e=document.getElementById(id); if(e) e.textContent=[tr,ca,mf,fw+'%',el+'%',fl][i]; });
  const tSv=Math.round((5-ca)*132+(tr-1)*66);
  const fSv=Math.round(mf*132+(fw/100)*cats[1].kg*0.3);
  const hSv=Math.round((el/100)*cats[2].kg);
  const flSv=Math.round((2-fl)*200);
  const nT=Math.max(0,cats[0].kg-tSv),nF=Math.max(0,cats[1].kg-fSv),nH=Math.max(0,cats[2].kg-hSv),nFl=Math.max(0,400-flSv);
  const newTot=nT+nF+nH+cats[3].kg+cats[4].kg+nFl;
  const saved=fp-newTot, pct=Math.round(saved/fp*100);
  $t('sim-score',Math.min(100,Math.round(68+pct*0.6)));
  $t('sim-total',(newTot/1000).toFixed(1)+' t');
  $t('sim-delta',(saved>0?'−':'+')+Math.abs(Math.round(saved))+' kg CO₂/yr');
  $t('sim-pct',saved>0?pct+'% reduction':'Move sliders to see impact');
  $t('sim-trees',Math.max(0,Math.round(saved/21.8)));
  const treesLabel=document.getElementById('sim-trees-label'); if(treesLabel) treesLabel.textContent=Math.round(saved/21.8)===1?'tree planted for a year':'trees planted for a year';
  const dd=[nT,nF,nH,cats[3].kg,cats[4].kg];
  
  const d=document.documentElement.getAttribute('data-theme')==='dark';
  const simColors=[
    d?'#FFFFFF':'#1C1C1E',
    d?'#FF7B6B':'#E85D4E',
    d?'#3395FF':'#007AFF',
    d?'#FFB340':'#FF9500',
    d?'#A1A1A6':'#8E8E93'
  ];

  const leg=document.getElementById('simLegend');
  if(leg) leg.innerHTML=SL.map((l,i)=>`<span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:3px;background:${simColors[i]};display:inline-block"></span>${l}</span>`).join('');
  const c=cc();
  if(simChart){ 
    simChart.data.datasets[0].data=dd; 
    simChart.data.datasets[0].backgroundColor=simColors;
    simChart.data.datasets[0].borderColor=c.bg;
    simChart.update('none'); 
  } else { 
    const ctx=document.getElementById('chartSimDonut'); 
    if(ctx&&typeof Chart!=='undefined'){ 
      simChart=new Chart(ctx,{type:'doughnut',data:{labels:SL,datasets:[{data:dd,backgroundColor:simColors,borderWidth:2,borderColor:c.bg}]},options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{display:false},tooltip:tt(c)}}}); 
    } 
  }
}

function resetSim(){ [1,5,1,10,0,2].forEach((v,i)=>{ const el=document.getElementById(['sim-tr','sim-ca','sim-mf','sim-fw','sim-el','sim-fl'][i]); if(el) el.value=v; }); updateSim(); }

function restoreSim(){ const s=S.sim; ['sim-tr','sim-ca','sim-mf','sim-fw','sim-el','sim-fl'].forEach((id,i)=>{ const el=document.getElementById(id); if(el) el.value=[s.tr,s.ca,s.mf,s.fw,s.el,s.fl][i]; }); updateSim(); }

/* AI COACH */
const AI={
  transport:"Your commute is the biggest driver. Driving solo = ~1.8 kg CO₂/trip vs 0.05 kg by train — 36× difference. Swapping 3 days/week saves 396 kg/year.",
  target:"To hit 450 kg/month: bus 3 days/week saves 33 kg/month. Add 2 meat-free days = 22 kg more. Two changes, nearly there.",
  vegan:"Going flexitarian → vegan saves ~580 kg/yr. But two extra meat-free days/week = 45% of full vegan benefit with far less commitment.",
  paris:"Flight to Paris emits ~180 kg CO₂. Eurostar emits ~6 kg return — 30× less. Under 800 km, train wins every time.",
  home:"Switching to a heat pump cuts home emissions by ~80%. Green energy tariff = −210 kg/yr instantly, one-time change.",
  food:"Food is ~24% of your footprint. Beef produces 60× more emissions than vegetables per gram of protein.",
  default:"Transport is your highest leverage point. Ask me: 'Why is my transport footprint so high?' or 'How do I hit my monthly target?'"
};
function getAI(q){ q=q.toLowerCase(); if(/transport|car|commut|bus|tube/.test(q)) return AI.transport; if(/target|goal|hit|450/.test(q)) return AI.target; if(/vegan|meat|flexitarian/.test(q)) return AI.vegan; if(/paris|train|fly/.test(q)) return AI.paris; if(/home|energy|electric|heating/.test(q)) return AI.home; if(/food|diet|eat/.test(q)) return AI.food; return AI.default; }
function sendChat(){ const inp=document.getElementById('chatInput'); if(!inp) return; const q=inp.value.trim(); if(!q) return; const box=document.getElementById('chatBox'); if(!box) return; box.innerHTML+=`<div class="chat-bubble user">${escapeHtml(q)}</div>`; inp.value=''; box.scrollTop=box.scrollHeight; setTimeout(()=>{ box.innerHTML+=`<div class="chat-bubble ai">${getAI(q)}</div>`; box.scrollTop=box.scrollHeight; },700); }
function quickChat(q){ const inp=document.getElementById('chatInput'); if(inp){ inp.value=q; sendChat(); } }

/* MASTER RENDER */
function renderAll(){ recalc(); renderDash(); renderCoach(); renderProgress(); updateSim(); }

/* BOOT */
window.addEventListener('load',()=>{
  initTheme();
  recalc();
  initCharts();
  restoreAssessForm();
  renderAll();
  restoreSim();
  go(S.page||'dash');
  observeReveals();
});
