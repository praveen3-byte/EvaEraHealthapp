/* HCP Portal — Dashboard, Patient List & Detail */

function hcpSendOTP() {
  var id = document.getElementById('hcp-login-id').value;
  if(!id) { alert('Please enter your provider email or ID.'); return; }
  document.getElementById('hcp-otp-section').style.display = 'block';
  setTimeout(function(){ var d=document.querySelectorAll('.hcp-otp-digit'); if(d[0]) d[0].focus(); },150);
}
function hcpOtpNext(el) {
  if(el.value.length===1) {
    var all=Array.from(document.querySelectorAll('.hcp-otp-digit'));
    var idx=all.indexOf(el);
    if(idx<all.length-1) all[idx+1].focus();
    else document.getElementById('btn-hcp-verify').click();
  }
}
function hcpOtpNav(el, idx) { if(el.value && idx < 3) document.querySelectorAll('.hcp-otp-digit')[idx+1].focus(); }
function hcpVerifyOTP() {
  var digits = document.querySelectorAll('.hcp-otp-digit');
  var otp = Array.from(digits).map(function(d){return d.value;}).join('');
  if(otp.length < 4) { alert('Please enter all 4 OTP digits.'); return; }
  var loginId = (document.getElementById('hcp-login-id').value||'').trim();
  var creds = iLd('evh_hcp_creds', {});
  var valid = (otp === '1234');
  if(!valid && creds[loginId]){
    var pw = creds[loginId];
    valid = (otp === pw.slice(0,4)) || (otp === pw.replace(/[^0-9]/g,'').slice(0,4));
  }
  if(valid){
    var cons = iLd(IK.cn, []);
    S.hcpConsultant = cons.find(function(c){ return c.hcpEmail === loginId; }) || null;
    showHCPDashboard();
  } else {
    alert('Invalid OTP. Please check your credentials.');
    Array.from(digits).forEach(function(d){d.value='';});
    digits[0].focus();
  }
}
function showHCPDashboard(){
  showScreen('hcp-portal-screen');
  loadPatients();
  if(S.patients.length===0) addDemoPatients();
  var hc=document.getElementById('hcp-content');
  if(!hc) return;
  hc.innerHTML='<div style="display:grid;grid-template-columns:300px 1fr;height:calc(100vh - 64px)">'
    +'<div id="patient-list" style="overflow-y:auto;border-right:1px solid rgba(255,255,255,0.06)"></div>'
    +'<div id="patient-detail" style="overflow-y:auto">'
    +'<div style="text-align:center;padding:80px 40px">'
    +'<div style="font-size:64px;margin-bottom:20px;opacity:0.2">🩺</div>'
    +'<div style="font-size:18px;font-weight:700;color:rgba(255,255,255,0.4);margin-bottom:10px;font-family:Cormorant Garamond,serif">Select a Patient</div>'
    +'<div style="font-size:13px;color:rgba(255,255,255,0.2)">Choose from the list to view the full assessment report</div>'
    +'</div></div></div>';
  renderPatientList();
}
function addDemoPatients() {
  var demos = [
    {
      id:'P_GYNE', name:'Meena Iyer', age:54, city:'Chennai', stage:'Post-Menopause', prakriti:'Pitta', vikriti:'Pitta_excess',
      scores:{composite:50,composite_band:'Moderate',MENQOL_vasomotor:15,MENQOL_physical:12,MENQOL_psychosocial:8,MENQOL_sexual:8,PHQ9:8,PHQ9_band:'Mild',GAD7:7,GAD7_band:'Mild',PSS8:16,PSS8_band:'Moderate',ISI:7,ISI_band:'None',FSFI:null,FSDSR:null,FSFI_band:'Not assessed',FSDSR_band:'Not assessed',MCSS:0,rf1:'Yes',rf2:'No',rf3:'Yes',comorbidityMod:13},
      triage:[{action:'gynecology_referral',sev:'severe',rules:['RED_FLAG']},{action:'recommend_menopause_program',sev:'moderate',rules:['EVR_VM']},{action:'stress_management_program',sev:'moderate',rules:['EVR_PS']}],
      redFlags:['Unusual vaginal bleeding','Breast changes'],
      flags:{gyneRedFlag:true,menqolPsychTriggered:false,menqolSexualTriggered:false,sleepModerate:false,sleepSevere:false,mentalHealthCompleted:false,psychosexualCompleted:false},
      psychiatricAlert:false,
      comorbidities:{Hypertension:'Controlled',Hyperlipidemia:'Controlled'},
      wearable:{device:'Garmin Venu 2',period:'Last 30 days',avg_rhr:78,avg_hrv:29,avg_spo2:96,avg_sleep:5.8,night_sweats_per_night:3,avg_steps:4820,avg_stress:52,correlations:['Night sweats 3/night — significant vasomotor activity','HRV 29ms (low) — autonomic stress pattern']},
      timestamp:new Date().toISOString(), sessionId:'demo'
    },
    {
      id:'P_PSYCH', name:'Kavitha Nair', age:47, city:'Kochi', stage:'Perimenopause', prakriti:'Vata', vikriti:'Vata_excess',
      scores:{composite:100,composite_band:'Critical',MENQOL_vasomotor:18,MENQOL_physical:15,MENQOL_psychosocial:18,MENQOL_sexual:5,PHQ9:26,PHQ9_band:'Severe',PHQ9_item9:2,GAD7:21,GAD7_band:'Severe',PSS8:32,PSS8_band:'High',ISI:28,ISI_band:'Severe',FSFI:null,FSDSR:null,FSFI_band:'Not assessed',FSDSR_band:'Not assessed',MCSS:0,rf1:'No',rf2:'No',rf3:'No',comorbidityMod:14},
      triage:[{action:'psychiatric_alert',sev:'severe',rules:['R1']},{action:'psychologist_referral',sev:'severe',rules:['EVR_PHQ9']},{action:'sleep_recovery_program',sev:'severe',rules:['EVR_ISI']},{action:'gurugram_clinic',sev:'severe',rules:['COMP_HIGH']},{action:'stress_management_program',sev:'moderate',rules:['EVR_GAD7','EVR_PSS8','EVR_PS']}],
      redFlags:[],
      flags:{gyneRedFlag:false,menqolPsychTriggered:true,menqolSexualTriggered:false,sleepModerate:true,sleepSevere:true,mentalHealthCompleted:true,psychosexualCompleted:false},
      psychiatricAlert:true,
      comorbidities:{Hypothyroidism:'Controlled',Anaemia:'Uncontrolled'},
      wearable:{device:'Apple Watch Series 9',period:'Last 30 days',avg_rhr:88,avg_hrv:19,avg_spo2:95,avg_sleep:4.9,night_sweats_per_night:4,avg_steps:3210,avg_stress:74,correlations:['HRV 19ms (critically low) — severe autonomic dysregulation','Sleep 4.9h — severe deprivation compounding depression']},
      timestamp:new Date().toISOString(), sessionId:'demo'
    },
    {
      id:'P_NORMAL', name:'Anita Sharma', age:48, city:'Pune', stage:'Perimenopause', prakriti:'Tridosha', vikriti:'Balanced',
      scores:{composite:15,composite_band:'Mild',MENQOL_vasomotor:5,MENQOL_physical:5,MENQOL_psychosocial:5,MENQOL_sexual:5,PHQ9:0,PHQ9_band:'Minimal',GAD7:0,GAD7_band:'Minimal',PSS8:8,PSS8_band:'Low',ISI:0,ISI_band:'None',FSFI:null,FSDSR:null,FSFI_band:'Not assessed',FSDSR_band:'Not assessed',MCSS:0,rf1:'No',rf2:'No',rf3:'No',comorbidityMod:0},
      triage:[{action:'recommend_menopause_program',sev:'mild',rules:['COMP_LOW']}],
      redFlags:[],
      flags:{gyneRedFlag:false,menqolPsychTriggered:false,menqolSexualTriggered:false,sleepModerate:false,sleepSevere:false,mentalHealthCompleted:false,psychosexualCompleted:false},
      psychiatricAlert:false,
      comorbidities:{},
      wearable:null,
      timestamp:new Date().toISOString(), sessionId:'demo'
    },
    {
      id:'P_PSYCHOSEXUAL', name:'Rekha Pillai', age:51, city:'Bengaluru', stage:'Menopause (<1yr)', prakriti:'Kapha', vikriti:'Kapha_excess',
      scores:{composite:59,composite_band:'Moderate',MENQOL_vasomotor:12,MENQOL_physical:12,MENQOL_psychosocial:10,MENQOL_sexual:18,PHQ9:16,PHQ9_band:'Moderately Severe',GAD7:14,GAD7_band:'Moderate',PSS8:17,PSS8_band:'Moderate',ISI:14,ISI_band:'Subthreshold',FSFI:7.2,FSFI_band:'Sexual Dysfunction',FSDSR:39,FSDSR_band:'Clinically Significant Distress',MCSS:5,rf1:'No',rf2:'No',rf3:'No',comorbidityMod:20},
      triage:[{action:'sexual_therapy_pathway',sev:'severe',rules:['R2']},{action:'psychologist_referral',sev:'severe',rules:['EVR_PHQ9']},{action:'activate_psychosexual_module',sev:'moderate',rules:['R3']},{action:'sleep_recovery_program',sev:'moderate',rules:['EVR_ISI']},{action:'stress_management_program',sev:'moderate',rules:['EVR_GAD7']}],
      redFlags:[],
      flags:{gyneRedFlag:false,menqolPsychTriggered:true,menqolSexualTriggered:true,sleepModerate:true,sleepSevere:false,mentalHealthCompleted:true,psychosexualCompleted:true},
      psychiatricAlert:false,
      comorbidities:{Diabetes:'Controlled',PCOD:'Controlled'},
      wearable:{device:'Fitbit Sense 2',period:'Last 30 days',avg_rhr:82,avg_hrv:24,avg_spo2:94,avg_sleep:5.4,night_sweats_per_night:2,avg_steps:5640,avg_stress:63,correlations:['FSDSR 39/52 — extreme sexual distress','SpO2 94% — borderline, monitor']},
      timestamp:new Date().toISOString(), sessionId:'demo'
    },
    {
      id:'P_HIGHMQ', name:'Priya Mehta', age:45, city:'Delhi', stage:'Perimenopause', prakriti:'Vata-Pitta', vikriti:'Vata_Pitta_excess',
      scores:{composite:78,composite_band:'Severe',MENQOL_vasomotor:18,MENQOL_physical:18,MENQOL_psychosocial:18,MENQOL_sexual:15,PHQ9:16,PHQ9_band:'Moderately Severe',GAD7:14,GAD7_band:'Moderate',PSS8:26,PSS8_band:'High',ISI:21,ISI_band:'Moderate',FSFI:14.4,FSFI_band:'Sexual Dysfunction',FSDSR:26,FSDSR_band:'Clinically Significant Distress',MCSS:10,rf1:'No',rf2:'Occasionally',rf3:'No',comorbidityMod:12},
      triage:[{action:'sexual_therapy_pathway',sev:'severe',rules:['R2']},{action:'psychologist_referral',sev:'severe',rules:['EVR_PHQ9']},{action:'sleep_recovery_program',sev:'severe',rules:['EVR_ISI']},{action:'gurugram_clinic',sev:'severe',rules:['COMP_HIGH']},{action:'stress_management_program',sev:'moderate',rules:['EVR_GAD7','EVR_PSS8']},{action:'recommend_menopause_program',sev:'moderate',rules:['EVR_VM']},{action:'exercise_program',sev:'mild',rules:['EVR_PH']}],
      redFlags:[],
      flags:{gyneRedFlag:false,menqolPsychTriggered:true,menqolSexualTriggered:true,sleepModerate:true,sleepSevere:false,mentalHealthCompleted:true,psychosexualCompleted:true},
      psychiatricAlert:false,
      comorbidities:{Hypertension:'Controlled',Anaemia:'Controlled'},
      wearable:{device:'Samsung Galaxy Watch 6',period:'Last 30 days',avg_rhr:84,avg_hrv:22,avg_spo2:96,avg_sleep:5.1,night_sweats_per_night:4,avg_steps:6200,avg_stress:68,correlations:['Night sweats 4/night — severe vasomotor activity','ISI 21 — moderate-severe insomnia compounding all domains']},
      timestamp:new Date().toISOString(), sessionId:'demo'
    },
  ];
  var existing = S.patients.map(function(p){return p.id;});
  demos.forEach(function(d){
    if(!existing.includes(d.id)) S.patients.push(d);
  });
  savePatients();
}
function renderPatientList(){
  var total=S.patients.length,severe=S.patients.filter(function(p){return(p.scores||{}).composite>=56;}).length,alerts=S.patients.filter(function(p){return p.psychiatricAlert||(p.redFlags&&p.redFlags.length);}).length;
  var html='<div style="background:linear-gradient(135deg,#0D1B2A,#1B2B3A);padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.07)">';
  html+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center;margin-bottom:10px">';
  html+='<div><div style="font-size:24px;font-weight:900;color:#fff">'+total+'</div><div style="font-size:9px;color:rgba(255,255,255,0.35);font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Total</div></div>';
  html+='<div><div style="font-size:24px;font-weight:900;color:#FFCC80">'+severe+'</div><div style="font-size:9px;color:rgba(255,255,255,0.35);font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Moderate+</div></div>';
  html+='<div><div style="font-size:24px;font-weight:900;color:#EF9A9A">'+alerts+'</div><div style="font-size:9px;color:rgba(255,255,255,0.35);font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Alerts</div></div>';
  html+='</div><input class="pl-search" type="text" placeholder="Search patients..." oninput="filterPatients(this.value)"></div>';
  var _sf=S._severityFilter;
  var showPts=_sf?S.patients.filter(function(p){var cp=(p.scores||{}).composite||p.composite||0;if(_sf==='critical')return cp>=81;if(_sf==='severe')return cp>=56;if(_sf==='alerts')return p.psychiatricAlert||(p.redFlags&&p.redFlags.length>0);return true;}):S.patients;
  showPts.forEach(function(p){
    var sc=p.scores||{},comp=sc.composite||p.composite||0;
    var band=comp>=81?'critical':comp>=56?'severe':comp>=31?'moderate':comp>=6?'mild':'optimal';
    var bCol=comp>=81?'#EF9A9A':comp>=56?'#FFCC80':comp>=31?'#FFE082':comp>=6?'#A5D6A7':'#00695C';
    var isA=S.selectedPatient&&S.selectedPatient.id===p.id;
    var nm=p.name||'?',ini=nm.split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2).toUpperCase();
    var hasAlert=p.psychiatricAlert||(p.redFlags&&p.redFlags.length>0);
    html+='<div class="patient-item'+(isA?' active':'')+'" onclick="selectPatient(\''+p.id+'\')">';
    html+='<span class="pi-flag '+(p.psychiatricAlert?'red':hasAlert?'orange':'green')+'"></span>';
    html+='<div class="pi-avatar">'+ini+'</div>';
    html+='<div class="pi-info"><div class="pi-name"><span>'+p.name+'</span><span class="pi-score '+band+'">'+comp+'</span></div>';
    html+='<div class="pi-meta">'+p.age+'y &middot; '+p.city+'</div><div class="pi-meta">'+p.stage+'</div>';
    html+='<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px">';
    if(p.psychiatricAlert) html+='<span style="font-size:9px;background:rgba(183,28,28,0.25);color:#EF9A9A;padding:1px 5px;border-radius:8px;font-weight:700">🚨 Crisis</span>';
    if(p.redFlags&&p.redFlags.length) html+='<span style="font-size:9px;background:rgba(255,152,0,0.2);color:#FFCC80;padding:1px 5px;border-radius:8px;font-weight:700">⚠ Red Flag</span>';
    html+='<span style="font-size:9px;background:rgba(255,255,255,0.06);color:'+bCol+';padding:1px 5px;border-radius:8px;font-weight:700">'+band.charAt(0).toUpperCase()+band.slice(1)+'</span>';
    html+='</div></div></div>';
  });
  if(!S.patients.length) html+='<div style="padding:40px 16px;text-align:center;color:rgba(255,255,255,0.22)"><div style="font-size:28px;margin-bottom:8px">📋</div><div style="font-size:12px">No patients yet.<br>Complete an assessment to see records here.</div></div>';
  var el=document.getElementById('patient-list');if(el)el.innerHTML=html;
}
function filterPatients(q) {
  var items = document.querySelectorAll('.patient-item');
  items.forEach(function(item) {
    var text = item.textContent.toLowerCase();
    item.style.display = text.includes(q.toLowerCase()) ? '' : 'none';
  });
}
function selectPatient(id) {
  S.selectedPatient = S.patients.find(function(p){return p.id===id;});
  if(!S.selectedPatient) return;
  renderPatientList();
  renderPatientDetail(S.selectedPatient);
}
function renderPatientDetail(p,_openTab){
  var sc=p.scores||{},composite=sc.composite||0;
  var bandTag=composite>=81?'tag-rose':composite>=56?'tag-rose':composite>=31?'tag-gold':'tag-teal';
  var bandLabel=composite>=81?'Critical':composite>=56?'Severe':composite>=31?'Moderate':composite>=6?'Mild':'Optimal';
  var gaugeCol=composite>=81?'#B71C1C':composite>=56?'#EF5350':composite>=31?'#FF9800':composite>=6?'#4CAF50':'#00695C';
  var html='';
  // HEADER
  html+='<div class="pd-header"><div>';
  html+='<h2>'+p.name+(p.psychiatricAlert?' <span style="color:#EF5350;font-size:13px">🚨</span>':'')+'</h2>';
  html+='<div class="pd-meta">'+p.age+' yrs &nbsp;&middot;&nbsp; '+p.city+'&nbsp;&middot;&nbsp;'+p.stage;
  html+='<br>Prakriti: '+p.prakriti+(p.vikriti?' &middot; Vikriti: '+p.vikriti.replace(/_/g,' '):'')+'</div></div>';
  html+='<div class="pd-header-right"><span class="tag '+bandTag+'">'+composite+'/100 &mdash; '+bandLabel+'</span>';
  html+='<div style="font-size:11px;color:rgba(255,255,255,0.25)">'+new Date(p.timestamp).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+'</div></div></div>';
  // ALERTS
  if(p.psychiatricAlert) html+='<div class="hcp-alert-banner"><div class="hab-icon">🚨</div><div class="hab-body"><strong>PSYCHIATRIC ALERT</strong> &mdash; PHQ-9 Item 9 positive. Immediate clinical follow-up required. iCall: 9152987821 &middot; Vandrevala: 1860-2662-345</div></div>';
  if(p.redFlags&&p.redFlags.length) html+='<div class="hcp-alert-banner" style="border-color:rgba(255,152,0,0.4);background:rgba(255,152,0,0.09)"><div class="hab-icon">⚠️</div><div class="hab-body" style="color:#FFCC80"><strong>Red Flags: </strong>'+p.redFlags.join(' &middot; ')+'</div></div>';
  // TABS
  html+='<div class="pd-tabs">';
  ['Overview','Clinical Summary','Scores','Triage','Care Plan','Data'].forEach(function(t,i){html+='<div class="pd-tab'+(i===0?' active':'')+'" onclick="switchPDTab(this,'+i+')">'+t+'</div>';});
  html+='</div><div class="pd-body">';
  // TAB 0: OVERVIEW
  html+='<div class="pd-tab-content" id="tab0">';
  html+='<div class="section-hcp" style="text-align:center;padding:18px">';
  html+='<div style="font-size:54px;font-weight:900;color:'+gaugeCol+';line-height:1">'+composite+'<span style="font-size:18px;color:rgba(255,255,255,0.22)">/100</span></div>';
  html+='<div style="font-size:13px;font-weight:700;color:#fff;margin:6px 0 2px">Modified MenQOL Composite Score</div>';
  html+='<div style="font-size:11px;color:rgba(255,255,255,0.35)">'+bandLabel+' Symptom Burden</div>';
  html+='<div class="mc-bar" style="max-width:220px;margin:10px auto 0"><div class="mc-bar-fill" style="width:'+composite+'%;background:'+gaugeCol+'"></div></div></div>';
  // Domain metric cards
  html+='<div class="metrics-grid">';
  [{k:'MENQOL_vasomotor',l:'Vasomotor',e:'🌡',m:20},{k:'MENQOL_physical',l:'Physical',e:'💪',m:20},{k:'MENQOL_psychosocial',l:'Emotional',e:'🧠',m:20},{k:'MENQOL_sexual',l:'Intimate',e:'💙',m:20}].forEach(function(d){
    var v=sc[d.k]||0,col=v>=14?'#EF5350':v>=7?'#FF9800':'#4CAF50';
    html+='<div class="metric-card"><div class="mc-label">'+d.e+' '+d.l+'</div><div class="mc-value" style="color:'+col+'">'+v+'</div><div class="mc-sub">/'+d.m+'</div><div class="mc-bar"><div class="mc-bar-fill" style="width:'+Math.round(v/d.m*100)+'%;background:'+col+'"></div></div></div>';
  });
  var isiV=sc.ISI||0,isiC=isiV>=15?'#EF5350':isiV>=8?'#FF9800':'#4CAF50';
  html+='<div class="metric-card"><div class="mc-label">😴 Sleep (ISI)</div><div class="mc-value" style="color:'+isiC+'">'+isiV+'</div><div class="mc-sub">/28 &middot; '+(sc.ISI_band||'—')+'</div><div class="mc-bar"><div class="mc-bar-fill" style="width:'+Math.round(isiV/28*100)+'%;background:'+isiC+'"></div></div></div>';
  if(sc.PHQ9!==null&&sc.PHQ9!==undefined){var phqC=(sc.PHQ9||0)>=15?'#EF5350':(sc.PHQ9||0)>=10?'#FF9800':(sc.PHQ9||0)>=5?'#FFE082':'#4CAF50';html+='<div class="metric-card"><div class="mc-label">🧠 PHQ-9</div><div class="mc-value" style="color:'+phqC+'">'+(sc.PHQ9||0)+'</div><div class="mc-sub">/27 &middot; '+(sc.PHQ9_band||'')+'</div><div class="mc-bar"><div class="mc-bar-fill" style="width:'+Math.round((sc.PHQ9||0)/27*100)+'%;background:'+phqC+'"></div></div></div>';}
  if(sc.FSFI!==null&&sc.FSFI!==undefined){var fsfiC=sc.FSFI<=10?'#EF5350':sc.FSFI<=26.55?'#FF9800':'#4CAF50';html+='<div class="metric-card"><div class="mc-label">💙 FSFI</div><div class="mc-value" style="color:'+fsfiC+'">'+sc.FSFI+'</div><div class="mc-sub">/36</div><div class="mc-bar"><div class="mc-bar-fill" style="width:'+Math.round(sc.FSFI/36*100)+'%;background:'+fsfiC+'"></div></div></div>';}
  html+='</div>';
  // Patient profile — full demographics from answers
  var pa2=p.answers||{};
  var bmi2=(pa2.height_cm&&pa2.weight_kg)?(pa2.weight_kg/Math.pow(pa2.height_cm/100,2)).toFixed(1):null;
  html+='<div class="section-hcp"><h4>Patient Profile</h4>';
  // Helper: row with optional abnormal highlight
  function hRow(label,val,abnormal,note){
    if(val===undefined||val===null||val===''||val==='—'||val==='Prefer not to say')return;
    var col=abnormal?'#EF9A9A':'rgba(255,255,255,0.85)';
    html+='<div class="score-row"><span class="score-label">'+label+'</span><span class="score-val" style="color:'+col+'">'
      +val+(note?'<span style="font-size:10px;color:#FF9800;margin-left:4px">'+note+'</span>':'')+'</span></div>';
  }
  hRow('Name',p.name,false);
  hRow('Age',p.age+' yrs', p.age<45, p.age<45?'Early menopause':'');
  hRow('City',p.city,false);
  hRow('Country',pa2.country,false);
  hRow('Stage',p.stage,false);
  hRow('Ethnicity',pa2.ethnicity,false);
  hRow('Menstrual Pattern',p.menstrual_pattern,false);
  hRow('Prakriti',p.prakriti,false);
  hRow('Vikriti',p.vikriti,p.vikriti&&p.vikriti!=='—');
  hRow('Marital',pa2.marital||p.marital,false);
  hRow('Parity',pa2.parity,false);
  hRow('Occupation',pa2.occupation||p.occupation,false);
  hRow('Education',pa2.education||p.education,false);
  hRow('Sexual Activity',p.sexual_activity_status,false);
  if(pa2.height_cm) hRow('Height',pa2.height_cm+' cm',false);
  if(pa2.weight_kg) hRow('Weight',pa2.weight_kg+' kg',false);
  if(bmi2){
    var bmiN=parseFloat(bmi2);
    hRow('BMI',bmi2+' kg/m²', bmiN<18.5||bmiN>27.5, bmiN>30?'Obese':bmiN>27.5?'Overweight':bmiN<18.5?'Underweight':'');
  }
  hRow('Assessed',new Date(p.timestamp).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}),false);
  html+='</div>';
  // Lifestyle risks
  var lifeRows=[];
  var smk=pa2.smoking_history||'';var alc=pa2.alcohol_use||'';var hrt=pa2.hrt_history||'';
  if(smk&&smk!=='Never smoked'&&smk!=='Prefer not to say') lifeRows.push(['Smoking',smk,true,'⚠ CV/cancer risk']);
  if(alc&&alc!=='Non-drinker'&&alc!=='Prefer not to say') lifeRows.push(['Alcohol',alc,alc.indexOf('Heavy')>=0||alc.indexOf('Moderate')>=0,alc.indexOf('Heavy')>=0?'⚠ High risk':'']);
  if(hrt&&hrt!=='Never used HRT'&&hrt!=='Not Sure / Prefer not to say') lifeRows.push(['HRT History',hrt,hrt==='Currently using HRT','Review indication']);
  if(lifeRows.length){
    html+='<div class="section-hcp"><h4>⚠️ Lifestyle Risk Factors</h4>';
    lifeRows.forEach(function(r){ hRow(r[0],r[1],r[2],r[3]); });
    html+='</div>';
  }
  // Family history — only positive
  var famKeys=['fam_breast_cancer','fam_ovarian_cancer','fam_osteoporosis','fam_cvd','fam_diabetes','fam_depression','fam_early_menopause'];
  var famLabels={'fam_breast_cancer':'Breast Cancer','fam_ovarian_cancer':'Ovarian Cancer','fam_osteoporosis':'Osteoporosis','fam_cvd':'Heart Disease/Stroke','fam_diabetes':'Type 2 Diabetes','fam_depression':'Depression/Anxiety','fam_early_menopause':'Early Menopause <45y'};
  var famPos=famKeys.filter(function(k){return pa2[k];});
  if(famPos.length){
    html+='<div class="section-hcp"><h4>🧬 Family History (First-degree)</h4>';
    famPos.forEach(function(k){
      var isHighRisk=(k==='fam_breast_cancer'||k==='fam_ovarian_cancer'||k==='fam_cvd');
      html+='<div class="score-row"><span class="score-label">'+famLabels[k]+'</span><span class="score-val" style="color:'+(isHighRisk?'#EF9A9A':'#FFCC80')+'">Positive'+(isHighRisk?' ⚠️':'')+'</span></div>';
    });
    html+='</div>';
  }
  // Medications
  var medMap={'med_ssri':'Antidepressants (SSRIs/SNRIs)','med_hrt':'HRT/Hormone Therapy','med_betablocker':'Beta-blockers','med_statin':'Statins (Cholesterol)','med_thyroid':'Thyroid medication','med_insulin':'Insulin/Diabetes','med_antihyp':'Antihypertensives','med_sleep':'Sleep medication/Sedatives','med_nsaid':'NSAIDs (Regular pain relief)'};
  var activeMeds=Object.keys(medMap).filter(function(k){return pa2[k];});
  if(activeMeds.length){
    html+='<div class="section-hcp"><h4>💊 Current Medications</h4>';
    activeMeds.forEach(function(k){
      var isRelevant=(k==='med_ssri'||k==='med_antihyp'||k==='med_hrt');
      html+='<div class="score-row"><span class="score-label">'+medMap[k]+'</span><span class="score-val" style="color:'+(isRelevant?'#FFCC80':'rgba(255,255,255,0.7)')+'">Confirmed'+(isRelevant?' — affects scoring':'')+'</span></div>';
    });
    html+='</div>';
  }
  if(p.wearable&&p.wearable!=='None / No wearable'&&p.wearable_data&&Object.keys(p.wearable_data).length){
    var wd5=p.wearable_data||{};var sc5=p.scores||{};
    html+='<div class="section-hcp"><h4>⌚ Wearable — '+p.wearable+'</h4>';
    // Normal ranges + clinical correlation per metric
    var wNorms={
      avg_rhr:{lo:40,hi:80,unit:'bpm',label:'Resting HR',correlation:function(v,s){
        if(v>80){var note='Elevated RHR';if(s.MENQOL_vasomotor>=10)note+=' — correlates with vasomotor '+s.MENQOL_vasomotor+'/20';return{flag:true,note:note};}
        return{flag:false,note:'Normal range'};
      }},
      avg_hrv:{lo:20,hi:60,unit:'ms',label:'HRV',correlation:function(v,s){
        if(v<20)return{flag:true,note:'Severely low — autonomic stress. PSS-8: '+(s.PSS8||'—')+'/32, GAD-7: '+(s.GAD7||'—')+'/21'};
        if(v<30)return{flag:true,note:'Low HRV — stress burden present. ISI sleep: '+(s.ISI||'—')+'/28'};
        return{flag:false,note:'Adequate autonomic resilience'};
      }},
      avg_spo2:{lo:95,hi:100,unit:'%',label:'SpO₂',correlation:function(v){
        if(v<90)return{flag:true,note:'⚠️ URGENT — below 90%, refer immediately'};
        if(v<95)return{flag:true,note:'Below normal — possible sleep apnoea'};
        return{flag:false,note:'Normal'};
      }},
      avg_sleep:{lo:7,hi:9,unit:'hrs',label:'Avg Sleep',correlation:function(v,s){
        if(v<5)return{flag:true,note:'Severe deprivation. ISI: '+(s.ISI||'—')+'/28 ('+(s.ISI_band||'—')+'). Night sweats: '+(wd5.night_sweats_per_night||0)+'/night'};
        if(v<6.5)return{flag:true,note:'Below target (7-9h). ISI: '+(s.ISI||'—')+'/28 ('+( s.ISI_band||'—')+')'};
        return{flag:false,note:'Within target range'};
      }},
      avg_steps:{lo:7500,hi:15000,unit:'/day',label:'Steps',correlation:function(v,s){
        if(v<3000)return{flag:true,note:'Very sedentary — Physical MenQOL: '+(s.MENQOL_physical||'—')+'/20'};
        if(v<5000)return{flag:true,note:'Low activity — target ≥7,500/day'};
        return{flag:false,note:'Good activity level'};
      }},
      avg_stress:{lo:0,hi:30,unit:'/100',label:'Stress Score',correlation:function(v,s){
        if(v>70)return{flag:true,note:'Very high — PSS-8: '+(s.PSS8||'—')+'/32, GAD-7: '+(s.GAD7||'—')+'/21'};
        if(v>50)return{flag:true,note:'Elevated — correlates with psychosocial: '+(s.MENQOL_psychosocial||'—')+'/20'};
        return{flag:false,note:'Within normal'};
      }},
      night_sweats_per_night:{lo:0,hi:1,unit:'/night',label:'Night Sweats',correlation:function(v,s){
        if(v>=4)return{flag:true,note:'Severe vasomotor — MenQOL Vasomotor: '+(s.MENQOL_vasomotor||'—')+'/20'};
        if(v>=2)return{flag:true,note:'Significant — correlates with vasomotor domain'};
        return{flag:false,note:'Mild/absent'};
      }}
    };
    var wAbnormal=[];
    Object.keys(wNorms).forEach(function(key){
      var val=wd5[key];if(val===undefined||val===null||val==='')return;
      var def=wNorms[key];var res=def.correlation(val,sc5);
      var flagCol=res.flag?'#EF9A9A':'rgba(255,255,255,0.75)';
      html+='<div class="score-row"><span class="score-label">'+def.label+'</span>'
        +'<span class="score-val" style="color:'+flagCol+'">'+val+' <span style="font-size:10px;color:rgba(255,255,255,0.3)">'+def.unit+'</span>'
        +(res.flag?' <span style="font-size:10px;color:#FF9800;margin-left:4px">⚠ '+res.note+'</span>':'')
        +'</span></div>';
      if(res.flag) wAbnormal.push(def.label+': '+val+def.unit+' — '+res.note);
    });
    if(wd5.avg_skin_temp){
      var stFlag=wd5.avg_skin_temp>37.5||wd5.avg_skin_temp<35;
      html+='<div class="score-row"><span class="score-label">Skin Temp</span>'
        +'<span class="score-val" style="color:'+(stFlag?'#EF9A9A':'rgba(255,255,255,0.75)')+'">'+wd5.avg_skin_temp+'°C'
        +(stFlag?' <span style="font-size:10px;color:#FF9800"> ⚠ '+(wd5.avg_skin_temp>37.5?'Elevated — correlates with vasomotor':'Low')+'</span>':'')
        +'</span></div>';
      if(stFlag) wAbnormal.push('Skin Temp: '+wd5.avg_skin_temp+'°C — abnormal');
    }
    if(wd5.avg_distance_km){
      html+='<div class="score-row"><span class="score-label">Avg Distance</span>'
        +'<span class="score-val">'+wd5.avg_distance_km+' <span style="font-size:10px;color:rgba(255,255,255,0.3)">km/day</span></span></div>';
    }
    if(wAbnormal.length){
      html+='<div style="background:rgba(239,83,80,0.12);border:1px solid rgba(239,83,80,0.3);border-radius:8px;padding:10px;margin-top:8px">'
        +'<div style="font-size:11px;font-weight:800;color:#EF5350;margin-bottom:5px">⚠️ WEARABLE ALERTS ('+wAbnormal.length+')</div>';
      wAbnormal.forEach(function(a){html+='<div style="font-size:11px;color:#FFCDD2;padding:2px 0">• '+a+'</div>';});
      html+='</div>';
    }
    html+='</div>';
  }
  if(p.comorbidities&&Object.keys(p.comorbidities).length){
    html+='<div class="section-hcp"><h4>Comorbidities</h4>';
    Object.entries(p.comorbidities).forEach(function(e){var col=e[1]==='Uncontrolled'?'#EF9A9A':e[1]==='Not Sure'?'#90CAF9':'#A5D6A7';html+='<div class="score-row"><span class="score-label">'+e[0]+'</span><span class="score-val" style="color:'+col+'">'+e[1]+'</span></div>';});
    html+='</div>';
  }
  html+='</div>';
  // TAB 1: CLINICAL SUMMARY
  html+='<div class="pd-tab-content" id="tab1" style="display:none"><div style="padding:14px">';
  // Red Flags
  if(p.redFlags&&p.redFlags.length){
    html+='<div style="background:rgba(211,47,47,0.12);border:1px solid rgba(211,47,47,0.35);border-radius:10px;padding:12px;margin-bottom:10px">'
      +'<div style="font-size:11px;font-weight:800;color:#EF5350;margin-bottom:5px">&#x1F6A8; RED FLAGS</div>';
    p.redFlags.forEach(function(rf){html+='<div style="font-size:12px;color:#FFCDD2;padding:2px 0">&#x26A0; '+rf+'</div>';});
    html+='</div>';
  }
  // Comorbidities
  var cm2=p.comorbidities||{};var ck2=Object.keys(cm2).filter(function(k){return cm2[k]&&cm2[k]!=='no';});
  if(ck2.length){
    html+='<div style="background:rgba(230,81,0,0.1);border:1px solid rgba(230,81,0,0.25);border-radius:10px;padding:12px;margin-bottom:10px">'
      +'<div style="font-size:11px;font-weight:800;color:#FF9800;margin-bottom:5px">&#x1F3E5; COMORBIDITIES</div>';
    ck2.forEach(function(k){html+='<div style="font-size:12px;color:#FFD0A0;padding:2px 0">&#x2022; '+k.replace(/_/g,' ')+': <strong>'+cm2[k]+'</strong></div>';});
    html+='</div>';
  }
  // High scores
  var sc3=p.scores||{};var hd=[];
  if((sc3.MENQOL_vasomotor||0)>=10)hd.push('Vasomotor '+sc3.MENQOL_vasomotor+'/20');
  if((sc3.MENQOL_physical||0)>=10)hd.push('Physical '+sc3.MENQOL_physical+'/20');
  if((sc3.MENQOL_psychosocial||0)>=10)hd.push('Psychosocial '+sc3.MENQOL_psychosocial+'/20');
  if((sc3.MENQOL_sexual||0)>=8)hd.push('Sexual '+sc3.MENQOL_sexual+'/20');
  if((sc3.PHQ9||0)>=10)hd.push('PHQ-9 '+sc3.PHQ9+'/27 ('+sc3.PHQ9_band+')');
  if((sc3.GAD7||0)>=8)hd.push('GAD-7 '+sc3.GAD7+'/21 ('+sc3.GAD7_band+')');
  if((sc3.PSS8||0)>=18)hd.push('PSS-8 Stress '+sc3.PSS8+'/32');
  if((sc3.ISI||0)>=8)hd.push('ISI Sleep '+sc3.ISI+'/28 ('+sc3.ISI_band+')');
  if(hd.length){
    html+='<div style="background:rgba(196,122,10,0.1);border:1px solid rgba(196,122,10,0.25);border-radius:10px;padding:12px;margin-bottom:10px">'
      +'<div style="font-size:11px;font-weight:800;color:#F59E0B;margin-bottom:5px">&#x1F4CA; HIGH-SCORING DOMAINS</div>';
    hd.forEach(function(d){html+='<div style="font-size:12px;color:#FDE68A;padding:2px 0">&#x2022; '+d+'</div>';});
    html+='</div>';
  }
  // Lifestyle
  var pa=p.answers||{};var ls=[];
  if(pa.smoking&&pa.smoking!=='Non-smoker')ls.push('&#x1F6AC; Smoking: '+pa.smoking);
  if(pa.alcohol&&pa.alcohol!=='Never')ls.push('&#x1F377; Alcohol: '+pa.alcohol);
  if(pa.hrt&&pa.hrt!=='No')ls.push('&#x1F48A; HRT: '+pa.hrt);
  if(pa.parity)ls.push('&#x1F476; Parity: '+pa.parity);
  if(pa.marital)ls.push('&#x1F48D; Marital: '+pa.marital);
  if(pa.wearable&&pa.wearable!=='None / No wearable')ls.push('&#x231A; Wearable: '+pa.wearable);
  if(ls.length){
    html+='<div style="background:rgba(11,123,116,0.1);border:1px solid rgba(11,123,116,0.25);border-radius:10px;padding:12px;margin-bottom:10px">'
      +'<div style="font-size:11px;font-weight:800;color:#26A69A;margin-bottom:5px">&#x1F33F; LIFESTYLE &amp; HISTORY</div>';
    ls.forEach(function(l){html+='<div style="font-size:12px;color:#B2DFDB;padding:2px 0">'+l+'</div>';});
    html+='</div>';
  }
  // Wearable
  var wd3=pa.wearable_data||{};
  if(wd3.avg_rhr||wd3.avg_steps||wd3.avg_sleep){
    html+='<div style="background:rgba(92,45,145,0.1);border:1px solid rgba(92,45,145,0.25);border-radius:10px;padding:12px;margin-bottom:10px">'
      +'<div style="font-size:11px;font-weight:800;color:#CE93D8;margin-bottom:5px">&#x231A; WEARABLE DATA</div>';
    if(wd3.avg_rhr)html+='<div style="font-size:12px;color:#E1BEE7;padding:2px 0">&#x2022; Resting HR: '+wd3.avg_rhr+'bpm'+(wd3.avg_rhr>80?' &#x26A0; Elevated':'')+'</div>';
    if(wd3.avg_hrv)html+='<div style="font-size:12px;color:#E1BEE7;padding:2px 0">&#x2022; HRV: '+wd3.avg_hrv+'ms'+(wd3.avg_hrv<30?' &#x26A0; Low':'')+'</div>';
    if(wd3.avg_sleep)html+='<div style="font-size:12px;color:#E1BEE7;padding:2px 0">&#x2022; Sleep: '+wd3.avg_sleep+'h'+(wd3.avg_sleep<6?' &#x26A0; Below 6h':'')+'</div>';
    if(wd3.avg_steps)html+='<div style="font-size:12px;color:#E1BEE7;padding:2px 0">&#x2022; Steps: '+wd3.avg_steps.toLocaleString()+(wd3.avg_steps<5000?' &#x26A0; Low activity':'')+'</div>';
    if(wd3.night_sweats_per_night)html+='<div style="font-size:12px;color:#E1BEE7;padding:2px 0">&#x2022; Night sweats: '+wd3.night_sweats_per_night+'/night</div>';
    html+='</div>';
  }
  var sn2=iLd('hcp_note_'+(p.id||''),'');
  if(sn2){
    html+='<div style="background:rgba(0,188,212,0.08);border:1px solid rgba(0,188,212,0.2);border-radius:10px;padding:12px">'
      +'<div style="font-size:11px;font-weight:800;color:#00BCD4;margin-bottom:5px">&#x1F4DD; LAST CLINICAL NOTE</div>'
      +'<div style="font-size:12px;color:rgba(255,255,255,0.6);white-space:pre-wrap;line-height:1.5">'+sn2+'</div>'
      +'</div>';
  }
  html+='</div></div>';
  // TAB 1: SCORES TABLE
  html+='<div class="pd-tab-content" id="tab2" style="display:none">';
  html+='<table class="instrument-table"><thead><tr><th>Instrument</th><th>Score</th><th>Bar</th><th>Band</th></tr></thead><tbody>';
  var rows=[
    {l:'MenQOL Vasomotor',v:sc.MENQOL_vasomotor||0,m:20,b:sc.MENQOL_vasomotor>=14?'High':sc.MENQOL_vasomotor>=7?'Moderate':'Low',c:sc.MENQOL_vasomotor>=14?'#EF9A9A':sc.MENQOL_vasomotor>=7?'#FFCC80':'#A5D6A7'},
    {l:'MenQOL Physical',v:sc.MENQOL_physical||0,m:20,b:sc.MENQOL_physical>=14?'High':sc.MENQOL_physical>=7?'Moderate':'Low',c:sc.MENQOL_physical>=14?'#EF9A9A':sc.MENQOL_physical>=7?'#FFCC80':'#A5D6A7'},
    {l:'MenQOL Psychosocial',v:sc.MENQOL_psychosocial||0,m:20,b:sc.MENQOL_psychosocial>=14?'High':sc.MENQOL_psychosocial>=7?'Moderate':'Low',c:sc.MENQOL_psychosocial>=14?'#EF9A9A':sc.MENQOL_psychosocial>=7?'#FFCC80':'#A5D6A7'},
    {l:'MenQOL Sexual',v:sc.MENQOL_sexual||0,m:20,b:sc.MENQOL_sexual>=14?'High':sc.MENQOL_sexual>=7?'Moderate':'Low',c:sc.MENQOL_sexual>=14?'#EF9A9A':sc.MENQOL_sexual>=7?'#FFCC80':'#A5D6A7'},
    {l:'ISI Sleep',v:sc.ISI||0,m:28,b:sc.ISI_band||'',c:(sc.ISI||0)>=15?'#EF9A9A':(sc.ISI||0)>=8?'#FFCC80':'#A5D6A7'},
  ];
  if(sc.PHQ9!==null&&sc.PHQ9!==undefined){rows=rows.concat([{l:'PHQ-9 Depression',v:sc.PHQ9||0,m:27,b:sc.PHQ9_band||'',c:(sc.PHQ9||0)>=15?'#EF9A9A':(sc.PHQ9||0)>=10?'#FFCC80':'#A5D6A7'},{l:'GAD-7 Anxiety',v:sc.GAD7||0,m:21,b:sc.GAD7_band||'',c:(sc.GAD7||0)>=15?'#EF9A9A':(sc.GAD7||0)>=10?'#FFCC80':'#A5D6A7'},{l:'PSS-8 Stress',v:sc.PSS8||0,m:32,b:sc.PSS8_band||'',c:(sc.PSS8||0)>=21?'#EF9A9A':(sc.PSS8||0)>=11?'#FFCC80':'#A5D6A7'}]);}
  if(sc.FSFI!==null&&sc.FSFI!==undefined){rows=rows.concat([{l:'FSFI Sexual Function',v:sc.FSFI,m:36,b:sc.FSFI_band||'',c:sc.FSFI<=10?'#EF9A9A':sc.FSFI<=26.55?'#FFCC80':'#A5D6A7'},{l:'FSDSR Sexual Distress',v:sc.FSDSR||0,m:52,b:sc.FSDSR_band||'',c:(sc.FSDSR||0)>=26?'#EF9A9A':(sc.FSDSR||0)>=11?'#FFCC80':'#A5D6A7'}]);}
  rows.push({l:'Comorbidity Modifier',v:'+'+(sc.comorbidityMod||0),m:null,b:'Additive',c:'rgba(255,255,255,0.38)'});
  rows.forEach(function(r){
    var pct=r.m?Math.round(Math.min((parseFloat(r.v)||0)/r.m,1)*100):0;
    html+='<tr><td>'+r.l+'</td><td><span style="color:'+r.c+';font-weight:800;font-size:15px">'+r.v+'</span>'+(r.m?'<span style="color:rgba(255,255,255,0.2);font-size:11px"> /'+r.m+'</span>':'')+'</td>';
    html+='<td>'+(r.m?'<div style="width:80px;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+r.c+';border-radius:2px"></div></div>':'—')+'</td>';
    html+='<td style="color:'+r.c+';font-size:11px;font-weight:700">'+r.b+'</td></tr>';
  });
  html+='</tbody></table></div>';
  // TAB 2: TRIAGE
  html+='<div class="pd-tab-content" id="tab3" style="display:none">';
  var icons={psychiatric_alert:'🚨',gynecology_referral:'👩‍⚕️',psychologist_referral:'🧠',sexual_therapy_pathway:'💙',sleep_recovery_program:'😴',stress_management_program:'🌿',recommend_menopause_program:'🌸',gurugram_clinic:'🏥',exercise_program:'🏃',nutrition_guidance:'🥗',sexual_wellbeing_program:'💜',activate_psychosexual_module:'💙',relationship_counselling:'🤝'};
  html+='<div style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">'+((p.triage||[]).length)+' Actions Triggered</div><div class="triage-list">';
  (p.triage||[]).forEach(function(t){
    var cls=t.sev==='severe'?'sev':t.sev==='moderate'?'mod':'norm';
    var lbl=t.sev==='severe'?'Urgent':t.sev==='moderate'?'Recommended':'Advisory';
    html+='<div class="triage-item '+cls+'"><div class="ti-icon">'+(icons[t.action]||'✦')+'</div>';
    html+='<div class="ti-body"><div class="ti-action">'+t.action.replace(/_/g,' ')+'</div><div class="ti-rules">'+t.rules.slice(0,4).join(', ')+'</div></div>';
    html+='<div class="ti-sev">'+lbl+'</div></div>';
  });
  if(!(p.triage||[]).length) html+='<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.22);font-size:13px">No triage actions — wellness baseline</div>';
  html+='</div></div>';
  // TAB 3: CARE PLAN
  html+='<div class="pd-tab-content" id="tab4" style="display:none">';
  var cDesc={psychiatric_alert:'Immediate mental health intervention — do not delay',psychologist_referral:'Clinical psychology & evidence-based therapy (CBT/DBT)',gynecology_referral:'Gynaecologist review — EvaEraHealth Clinic Gurugram',sexual_therapy_pathway:'Integrated psychosexual therapy with qualified therapist',sexual_wellbeing_program:'Sexual wellness education and personalised support',sleep_recovery_program:'CBT-I and structured sleep hygiene programme',stress_management_program:'Mindfulness, yoga and structured stress reduction',recommend_menopause_program:'EvaEraHealth personalised menopause programme',exercise_program:'Targeted movement prescription with physiotherapist',nutrition_guidance:'Hormonal nutrition plan with certified nutritionist',relationship_counselling:'Couples or individual relationship counselling',activate_psychosexual_module:'Psychosexual wellbeing module activation',gurugram_clinic:'In-person consultation — Gurugram Flagship Centre'};
  html+='<div style="display:flex;flex-direction:column;gap:8px">';
  (p.triage||[]).forEach(function(t){
    var col=t.sev==='severe'?'rgba(183,28,28,0.14)':t.sev==='moderate'?'rgba(255,152,0,0.1)':'rgba(76,175,80,0.08)';
    var brd=t.sev==='severe'?'rgba(183,28,28,0.35)':t.sev==='moderate'?'rgba(255,152,0,0.3)':'rgba(76,175,80,0.2)';
    var tcol=t.sev==='severe'?'#EF9A9A':t.sev==='moderate'?'#FFCC80':'#A5D6A7';
    html+='<div style="background:'+col+';border:1px solid '+brd+';border-radius:12px;padding:14px 16px">';
    html+='<div style="font-size:13px;font-weight:800;color:#fff;text-transform:capitalize;margin-bottom:3px">'+t.action.replace(/_/g,' ')+'</div>';
    html+='<div style="font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:8px">'+(cDesc[t.action]||'')+'</div>';
    html+='<span style="background:'+brd+';color:'+tcol+';padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700">'+t.sev+'</span></div>';
  });
  if(!(p.triage||[]).length) html+='<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.22);font-size:13px">No care actions — wellness maintenance recommended</div>';
  html+='</div>';
  html+='<div style="margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px"><a href="tel:+918069050000" style="background:var(--rose-deep);color:#fff;text-align:center;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;font-size:13px">&#x1F4DE; +91 80690 50000</a><a href="mailto:clinic@evaerahealth.in" style="background:rgba(0,188,212,0.13);color:#00BCD4;text-align:center;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;border:1px solid rgba(0,188,212,0.3);font-size:13px">&#x2709; Email Clinic</a></div>';
  // Clinical notes section
  var savedNote=iLd('hcp_note_'+(p.id||''),'');
  html+='<div style="margin-top:14px">';
  html+='<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.35);margin-bottom:6px">Post-Consultation Clinical Notes</div>';
  html+='<textarea id="hcp-note-area" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:10px 12px;color:rgba(255,255,255,0.8);font-size:12px;resize:vertical;min-height:90px;outline:none;font-family:inherit;line-height:1.5" placeholder="Enter clinical observations, follow-up plan, prescriptions...">'+savedNote+'</textarea>';
  html+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">';
  html+='<button onclick="saveHCPNote()" style="padding:7px 16px;background:rgba(0,188,212,0.15);border:1px solid rgba(0,188,212,0.3);color:#00BCD4;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">&#x1F4BE; Save Note</button>';
  var patAppts=iLd(IK.ap,[]).filter(function(a){return a.patientId===p.id||a.patientName===p.name;});
  if(patAppts.length){
    var la=patAppts[0];
    var pCol=la.status==='completed'?'#166534':la.status==='confirmed'?'#1E40AF':'#64748B';
    var pBg=la.status==='completed'?'rgba(22,101,52,0.12)':'rgba(30,64,175,0.12)';
    html+='<span style="padding:7px 12px;background:'+pBg+';border:1px solid '+pCol+';color:'+pCol+';border-radius:8px;font-size:11px;font-weight:700">&#x1F4B3; Rs '+(la.fee||0)+' &middot; '+la.status+'</span>';
    if(la.status==='confirmed'){
      html+='<button onclick="hcpCompleteConsult(&quot;'+la.id+'&quot;)" style="padding:7px 14px;background:rgba(22,101,52,0.15);border:1px solid rgba(22,101,52,0.4);color:#16A34A;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">&#x2705; Mark Consultation Complete</button>';
    }
  }
  html+='</div>';
  html+='</div>';
  html+='</div>';
  // TAB 4: RAW DATA
  html+='<div class="pd-tab-content" id="tab5" style="display:none">';
  html+='<div class="download-bar"><button class="btn-download" onclick="downloadHCPReport()">&#x2B07; Download Report</button><button class="btn-download" onclick="downloadHCPJSON()">{ } Export JSON</button><button onclick="hcpBookOnBehalf()" style="background:linear-gradient(135deg,#C0305A,#9C1B43);color:#fff;border:none;border-radius:10px;padding:9px 16px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px">&#x1F4C5; Book Appointment for Patient</button></div>';
  var raw={name:p.name,age:p.age,stage:p.stage,prakriti:p.prakriti,scores:p.scores,triage:p.triage,redFlags:p.redFlags,comorbidities:p.comorbidities};
  html+='<pre style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px;font-size:11px;color:rgba(255,255,255,0.5);overflow:auto;max-height:400px;line-height:1.5">'+JSON.stringify(raw,null,2)+'</pre>';
  html+='</div>';
  html+='</div>';// pd-body
  var el=document.getElementById('patient-detail')||document.getElementById('hcp-content');
  if(el) el.innerHTML='<div class="pd-panel">'+html+'</div>';
  if(typeof _openTab!=='undefined'&&_openTab>=0){
    setTimeout(function(){var tabs=document.querySelectorAll('.pd-tab');if(tabs[_openTab])switchPDTab(tabs[_openTab],_openTab);},50);
  }
}
// HCP: Save clinical note for patient
function saveHCPNote(){
  var p=S.selectedPatient; if(!p)return;
  var ta=document.getElementById('hcp-note-area'); if(!ta)return;
  iSv('hcp_note_'+(p.id||''),ta.value);
  iSv('evh_pat_note_'+(p.id||''),JSON.stringify({
    note: ta.value,
    consultant: (S.hcpConsultant&&S.hcpConsultant.name)||'Your Consultant',
    savedAt: new Date().toLocaleString('en-IN')
  }));
  iLogA('ok','Clinical note saved for '+p.name,'','HCP');
  intToast('success','Note Saved — returning to patient record','Saved for '+p.name,'HCP');
  setTimeout(function(){
    renderPatientDetail(p, 3); // 3 = Triage tab where clinical notes live
  }, 700);
}

// HCP: Mark consultation complete
function hcpCompleteConsult(apId){
  if(!confirm('Mark this consultation as complete? This will update the Admin portal.')) return;
  var aps=iLd(IK.ap,[]);var ap=aps.find(function(a){return a.id===apId;});if(!ap)return;
  ap.status='completed';ap.completedAt=new Date().toLocaleString('en-IN');
  iSv(IK.ap,aps);
  iLogA('ok','Consultation completed',ap.patientName,'HCP');
  iBcast('appt_complete',ap);
  intToast('success','Consultation Complete','Admin portal updated','HCP');
  if(S.selectedPatient) setTimeout(function(){renderPatientDetail(S.selectedPatient,3);},400);
}
// HCP: Book appointment on behalf of patient
function hcpBookOnBehalf(){
  var p=S.selectedPatient;
  if(!p){alert('No patient selected');return;}
  // Pre-seed this patient into integration store so booking captures name correctly
  var pts=iLd(IK.pt,[]);
  if(!pts.find(function(x){return x.id===p.id;})){pts.unshift(p);iSv(IK.pt,pts);}
  intShowBooking();
  intToast('info','Booking on behalf of '+p.name,'Select consultant, slot and payment','HCP');
}

function switchPDTab(el, idx) {
  document.querySelectorAll('.pd-tab').forEach(function(t){t.classList.remove('active');});
  el.classList.add('active');
  document.querySelectorAll('.pd-tab-content').forEach(function(t){t.style.display='none';});
  document.getElementById('tab'+idx).style.display='block';
}
function downloadHCPReport() {
  var p = S.selectedPatient;
  if(!p) return;
  var sc = p.scores||{};
  var lines = ['EvaEraHealth Clinical Report','Generated: '+new Date().toLocaleString(),'',
    'Patient: '+p.name+' | Age: '+p.age+' | '+p.stage+' | Prakriti: '+(p.prakriti||'-'),' Vikriti: '+(p.vikriti||'-'),
    '','COMPOSITE: '+(sc.composite||0)+'/100 ['+(sc.composite_band||'-')+']',
    'MenQOL: VM='+(sc.MENQOL_vasomotor||0)+' Ph='+(sc.MENQOL_physical||0)+' PS='+(sc.MENQOL_psychosocial||0)+' Sx='+(sc.MENQOL_sexual||0),
    'PHQ9='+(sc.PHQ9||0)+'('+sc.PHQ9_band+') GAD7='+(sc.GAD7||0)+'('+sc.GAD7_band+') PSS8='+(sc.PSS8||0)+'('+sc.PSS8_band+')',
    'ISI='+(sc.ISI||0)+'('+sc.ISI_band+')'+((sc.FSFI!==null&&sc.FSFI!==undefined)?' FSFI='+sc.FSFI+' FSDSR='+sc.FSDSR:''),
    '','TRIAGE:'
  ];
  (p.triage||[]).forEach(function(t){lines.push('  • '+t.action+' ['+t.sev+']');});
  lines.push('','Red Flags: '+(p.redFlags&&p.redFlags.length?p.redFlags.join(', '):'None'));
  lines.push('','EvaEraHealth Clinic, Gurugram | +91 80690 50000 | clinic@evaerahealth.in');
  lines.push('AI-generated clinical summary — for qualified HCP use only');
  var blob = new Blob([lines.join('\n')],{type:'text/plain'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'EvaEraHealth_'+p.name.replace(/\s/g,'_')+'.txt';
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(a.href);
}
async function downloadUserReport(){
  var a=S.answers||{};
  if(!a.name||!a.stage||!a.mq_v1){alert('Please complete the wellness assessment first.');return;}
  var sc=S.scores||{},name=a.name||'Patient',triage=S.triage||[];
  var today=new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
  var band=sc.composite<=5?'Optimal Health':sc.composite<=30?'Mild Burden':sc.composite<=55?'Moderate Burden':sc.composite<=80?'Significant Burden':'High Burden';
  var bandCol=sc.composite<=5?'#00695C':sc.composite<=30?'#2E7D32':sc.composite<=55?'#E65100':sc.composite<=80?'#C62828':'#880E4F';
  var aiBody='';
  try{
    var specs=[];
    if((sc.MENQOL_psychosocial||0)>=8||(sc.PHQ9||0)>=10) specs.push('Clinical Psychologist');
    if((sc.MENQOL_physical||0)>=10||(sc.ISI||0)>=8) specs.push('Yoga Trainer');
    if((sc.MENQOL_physical||0)>=10) specs.push('Physiotherapist');
    if((sc.composite||0)>=35){specs.push('Nutrition Counsellor');specs.push('Lifestyle Coach');}
    if((sc.MENQOL_physical||0)>=10) specs.push('Aerobics Trainer');
    if((sc.PSS8||0)>=21) specs.push('Nature and Harmony Expert');
    if(S.flags&&S.flags.psychosexualCompleted&&S.flags.sexuallyActive&&(sc.FSFI||36)<=26.55) specs.push('Sexual Wellness Counsellor');
    var mhN=S.flags&&S.flags.mentalHealthCompleted?'Mental health assessed: PHQ-9 '+sc.PHQ9+'/27 ('+sc.PHQ9_band+'), GAD-7 '+sc.GAD7+'/21 ('+sc.GAD7_band+'), PSS-8 '+sc.PSS8+'/32':'Mental health not assessed this visit. Do NOT mention or grade psychological status.';
    var sxN=S.flags&&S.flags.psychosexualCompleted&&sc.FSFI!==null?(S.flags.sexuallyActive?'Sexual wellbeing assessed: FSFI '+sc.FSFI+'/36 ('+sc.FSFI_band+'), FSDSR '+sc.FSDSR+'/52':'Sexual questionnaire done; patient not currently sexually active. Mention gently only.'):'Sexual wellbeing not assessed this visit. Do NOT mention or grade sexual health.';
    var prmpt=(function(){
    var wdStr='No wearable data.';
    var wd4=a.wearable_data||{};
    if(a.wearable&&a.wearable!=='None / No wearable'){
      var wp=[];
      if(wd4.avg_steps)wp.push('Steps: '+wd4.avg_steps+(wd4.avg_steps<5000?' (low)':''));
      if(wd4.avg_sleep)wp.push('Sleep: '+wd4.avg_sleep+'h'+(wd4.avg_sleep<6?' (poor)':''));
      if(wd4.avg_rhr)wp.push('RHR: '+wd4.avg_rhr+'bpm');
      if(wd4.avg_hrv)wp.push('HRV: '+wd4.avg_hrv+'ms'+(wd4.avg_hrv<30?' (low-stress)':''));
      if(wd4.avg_stress)wp.push('Stress: '+wd4.avg_stress+'/100');
      if(wd4.night_sweats_per_night)wp.push('Night sweats: '+wd4.night_sweats_per_night+'/night');
      if(wp.length)wdStr='Wearable ('+a.wearable+'): '+wp.join('; ')+'.';
    }
    var ayurStr=(a.prakriti?'Prakriti: '+a.prakriti+'. ':'')+(a.vikriti?'Vikriti: '+a.vikriti.replace(/_/g,' ')+'. ':'');
    // ── CORRECT KEY NAMES (form stores smoking_history not smoking) ──
    var smk=a.smoking_history||'';var alc=a.alcohol_use||'';var hrtH=a.hrt_history||'';
    var lifeStr='';
    if(smk&&smk!=='Never smoked'&&smk!=='Prefer not to say') lifeStr+='SMOKING: '+smk+'. ';
    if(alc&&alc!=='Non-drinker'&&alc!=='Prefer not to say') lifeStr+='ALCOHOL: '+alc+'. ';
    if(hrtH&&hrtH!=='Never used HRT'&&hrtH!=='Not Sure / Prefer not to say') lifeStr+='HRT: '+hrtH+'. ';
    var bmi2=(a.height_cm&&a.weight_kg)?(a.weight_kg/Math.pow(a.height_cm/100,2)).toFixed(1):null;
    if(bmi2){var bmiN=parseFloat(bmi2);lifeStr+='BMI: '+bmi2+(bmiN>27.5?' (overweight)':bmiN<18.5?' (underweight)':' (normal)')+'. ';}
    // Family history positives
    var famHxStr='';
    var famDefs={'fam_breast_cancer':'breast cancer','fam_ovarian_cancer':'ovarian cancer','fam_osteoporosis':'osteoporosis','fam_cvd':'heart disease/stroke','fam_diabetes':'type 2 diabetes','fam_depression':'depression/anxiety','fam_early_menopause':'early menopause <45y'};
    Object.keys(famDefs).forEach(function(k){if(a[k])famHxStr+=famDefs[k]+', ';});
    if(famHxStr) famHxStr='Family history positive for: '+famHxStr.slice(0,-2)+'. ';
    // Medications
    var medStr='';
    var medDefs={'med_ssri':'SSRIs/SNRIs (antidepressants)','med_antihyp':'antihypertensives','med_betablocker':'beta-blockers','med_statin':'statins','med_thyroid':'thyroid medication','med_insulin':'insulin/diabetes medication','med_sleep':'sleep medication','med_nsaid':'regular NSAIDs'};
    Object.keys(medDefs).forEach(function(k){if(a[k])medStr+=medDefs[k]+', ';});
    if(medStr) medStr='Current medications: '+medStr.slice(0,-2)+'. ';
    // Comorbidities
    var cm3=a.comorbidities||{};var ck3=Object.keys(cm3).filter(function(k){return cm3[k]&&cm3[k]!=='no';});
    var comStr=ck3.length?ck3.map(function(k){return k.replace(/_/g,' ')+'('+cm3[k]+')';}).join(', '):'None';
    // ── WEARABLE CLINICAL CORRELATIONS ──
    var wCorrStr='';
    if(wd4&&Object.keys(wd4).length){
      var wc=[];
      if(wd4.avg_rhr>80) wc.push('RHR '+wd4.avg_rhr+'bpm (elevated >80) — correlates with vasomotor score '+sc.MENQOL_vasomotor+'/20; autonomic arousal pattern');
      if(wd4.avg_hrv&&wd4.avg_hrv<30) wc.push('HRV '+wd4.avg_hrv+'ms (low <30ms) — matches PSS-8 stress '+(sc.PSS8||'—')+'/32, GAD-7 '+(sc.GAD7||'—')+'/21; autonomic stress corroborated');
      if(wd4.avg_sleep&&wd4.avg_sleep<6.5) wc.push('Sleep '+wd4.avg_sleep+'h (below 7h) — directly corroborates ISI '+(sc.ISI||'—')+'/28 ('+(sc.ISI_band||'—')+'); night sweats '+( wd4.night_sweats_per_night||0)+'/night likely driver');
      if(wd4.avg_steps&&wd4.avg_steps<5000) wc.push('Steps '+wd4.avg_steps+'/day (very low <5000) — matches physical MenQOL '+(sc.MENQOL_physical||'—')+'/20; sedentary pattern accelerates bone loss');
      if(wd4.avg_stress&&wd4.avg_stress>50) wc.push('Stress '+wd4.avg_stress+'/100 (elevated) — aligns with psychosocial MenQOL '+(sc.MENQOL_psychosocial||'—')+'/20; autonomic burden confirmed');
      if(wd4.night_sweats_per_night&&wd4.night_sweats_per_night>=2) wc.push('Night sweats '+wd4.night_sweats_per_night+'/night — directly corroborates vasomotor MenQOL '+(sc.MENQOL_vasomotor||'—')+'/20; wearable-confirmed vasomotor activity');
      if(wd4.avg_spo2&&wd4.avg_spo2<95) wc.push('SpO₂ '+wd4.avg_spo2+'% (low <95%) — possible sleep-disordered breathing; ISI '+(sc.ISI||'—')+'/28');
      if(wd4.avg_skin_temp&&wd4.avg_skin_temp>37.5) wc.push('Skin temp '+wd4.avg_skin_temp+'°C (elevated) — thermal dysregulation, vasomotor corroboration');
      wCorrStr=wc.length?'WEARABLE-TOOL CORRELATIONS: '+wc.join(' | ')+'. ':'';
    }
    return 'You are a senior integrative menopause specialist at EvaEraHealth with expertise in Ayurveda, lifestyle medicine, and modern gynaecology. Write a DEEP PERSONALISED wellness report for '+name+' ('+a.age+'yrs, '+a.stage+', '+a.city+', Prakriti: '+(a.prakriti||'Tridosha')+', Ethnicity: '+(a.ethnicity||'not specified')+').\n\nCLINICAL SCORES:\nComposite: '+sc.composite+'/100 ('+band+'). Vasomotor MenQOL: '+sc.MENQOL_vasomotor+'/20. Physical MenQOL: '+sc.MENQOL_physical+'/20. Psychosocial MenQOL: '+sc.MENQOL_psychosocial+'/20. Sexual MenQOL: '+sc.MENQOL_sexual+'/20. ISI Sleep: '+(sc.ISI||0)+'/28 ('+(sc.ISI_band||'')+').\n'+mhN+'.\n'+sxN+'.\n\nAYURVEDA: '+(ayurStr||'Prakriti not specified.')+'\nWEARABLE DATA: '+wdStr+'\n'+wCorrStr+'\nLIFESTYLE RISK FACTORS: '+(lifeStr||'None reported.')+'\n'+(famHxStr||'')+'\n'+(medStr||'')+'\nCOMORBIDITIES: '+comStr+'.\nSPECIALISTS RECOMMENDED: '+(specs.length?specs.join(', '):'general wellness maintenance')+'\n\nIMPORTANT INSTRUCTIONS:\n1. DEEP ANALYSIS: Do NOT give generic menopause advice. Every bullet must reference her SPECIFIC scores, wearable data, or risk factors above.\n2. RISK FACTORS: For each positive finding (smoking, alcohol, family history, medications, BMI, wearable alerts) — provide a specific integrative/Ayurvedic remedy or mitigation strategy. Do not just flag it.\n3. WEARABLE CORRELATION: Where wearable data corroborates tool scores, name both in your recommendation (e.g. "Your wearable shows X which matches your Y score of Z").\n4. INTEGRATIVE REMEDIES: For each major symptom, provide BOTH a conventional evidence-based option AND an Ayurvedic/natural alternative. Name specific herbs (Shatavari, Ashwagandha, Brahmi, Triphala, etc.), yoga asanas by Sanskrit name, pranayama by name.\n5. TONE: Warm, like a caring senior doctor-aunt (didi/maasi). Bullet points throughout. Compassionate but clinical.\n\nStructure EXACTLY (headings on own line, ALL sections mandatory):\n\nDEAR '+name.toUpperCase()+',\n[2 sentences — acknowledge her specific stage and highest symptom, mention her name]\n\nYOUR HEALTH PICTURE TODAY\n• Composite score interpretation specific to her (not generic)\n• Two highest symptom domains with actual scores\n• Wearable insight if available (cite specific metric and what it means)\n• Key risk factor from her data that needs attention\n\nWHAT YOUR BODY IS TELLING YOU\n• Physical/vasomotor: specific interpretation of her MenQOL scores\n• Sleep: ISI score + wearable sleep data correlation if available\n• Mental/emotional: PHQ-9/GAD-7/PSS-8 interpretation if assessed; otherwise skip\n• Ayurveda: her Prakriti and Vikriti — what specific symptoms this causes for HER\n\nYOUR RISK FACTORS & NATURAL REMEDIES\n[For EACH positive risk factor in her data — smoking/alcohol/family history/medications/BMI/wearable alerts — one bullet with: the risk + specific Ayurvedic/natural mitigation e.g.]\n• Smoking (if present): Triphala + Neem to reduce oxidative damage; pranayama Kapalabhati 5min daily to clear respiratory toxins\n• Alcohol (if present): Liver support with Kutki + Turmeric; reduce Pitta-aggravating foods\n• Family Hx CVD (if present): Arjuna bark tea, omega-3, Mediterranean diet; monitor BP\n• Antihypertensives (if present): Sarpagandha/Brahmi as complementary support; avoid adding potassium-rich herbs without medical advice\n• High BMI (if applicable): Trikatu + Guggul for metabolism; intermittent light fasting per Ayurvedic Langhana principle\n• Low HRV/High stress (if wearable flags): Ashwagandha KSM-66 300mg + Nadi Shodhana pranayama 10min daily\n• Low sleep/night sweats (if wearable flags): Brahmi ghee at bedtime + Jatamansi; avoid screens 1hr before bed\n[Only include bullets for factors that ARE present in her data. Skip absent factors.]\n\nYOUR PERSONALISED ACTIVITY PLAN\n• Physical activity: cite her wearable steps and give specific daily target + activity type for her Prakriti\n• Yoga: 2 specific asanas by Sanskrit name suited to her dominant symptom\n• Pranayama: 1 specific technique by name for her primary concern\n• Avoid: what to avoid based on her Prakriti (e.g. hot Bikram yoga for Pitta)\n\nYOUR PERSONALISED DIET & NUTRITION\n• Morning ritual: specific Ayurvedic dinacharya recommendation for her Prakriti\n• Include: 3 specific foods with Ayurvedic rationale for her symptoms\n• Avoid: 2-3 specific foods that aggravate her constitution\n• Supplement: 2 evidence-based + 1 Ayurvedic herb with dosage guidance\n\nMIND & EMOTIONAL WELLBEING\n• Score-based insight (cite actual PHQ-9/GAD-7/PSS-8 if available)\n• Specific named technique (Yoga Nidra, Trataka, EFT tapping, CBT journalling etc)\n• Sleep protocol based on her ISI score and wearable data\n\nYOUR SPECIALIST CARE TEAM\n[For each specialist: emoji, role, one specific sentence citing her actual scores]\n\nYOUR 3 ACTIONS THIS WEEK\n1. Most urgent action based on her highest score or wearable alert\n2. Integrative/Ayurvedic action tailored to her Prakriti\n3. Lifestyle action addressing a specific risk factor in her data\n\nA PERSONAL NOTE FROM YOUR EVAERAHEALTH TEAM\n[2 warm sentences — mention her name, acknowledge her courage in taking this step]\n\n680 words max. Every bullet MUST cite her data. Zero generic statements.';
  })()
    // DEF-01: SECURITY — In production, this fetch MUST go to your backend proxy endpoint
  // NEVER expose the Anthropic API key in client-side code. 
  // Replace this URL with: '/api/ai/message' (your Express/FastAPI proxy)
  // The proxy reads process.env.ANTHROPIC_API_KEY and forwards the request.
  var resp=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:prmpt}]})});
    var data=await resp.json();
    aiBody=data.content&&data.content[0]?data.content[0].text:'';
  }catch(e){aiBody='';}
  if(!aiBody) aiBody='Dear '+name+',\n\nThank you for completing your EvaEraHealth wellness assessment.\n\nYOUR WELLNESS PICTURE\nYour assessment shows '+band.toLowerCase()+'. With the right support and lifestyle adjustments, your journey through menopause can be significantly more comfortable.\n\nYOUR 3 STEPS THIS WEEK\n1. Begin a gentle 15-minute morning walk daily\n2. Establish a consistent sleep schedule and cool sleeping environment\n3. Book a consultation at EvaEraHealth Clinic — +91 80690 50000\n\nA GENTLE REMINDER\nYou are not alone in this journey — EvaEraHealth is with you every step of the way.';
  function fmtAI(txt){var lines=txt.split('\n'),html='',inP=false;lines.forEach(function(line){var t=line.trim();if(!t){if(inP){html+='</p>';inP=false;}return;}var isH=/^[A-Z][A-Z\s,]+:?$/.test(t)&&t.length<60;var isDear=t.toUpperCase().startsWith('DEAR ');if(isH||isDear){if(inP){html+='</p>';inP=false;}html+='<h3 style="font-family:Georgia,serif;font-size:16px;font-weight:700;color:#880E4F;margin:18px 0 6px;border-bottom:1.5px solid #FCE4EC;padding-bottom:4px">'+t+'</h3>';}else{if(!inP){html+='<p style="margin:0 0 10px;color:#374151;font-size:14px;line-height:1.7">';inP=true;}html+=t+' ';}});if(inP)html+='</p>';return html;}
  function sBar(v,max,col){var p=Math.round(Math.min((v||0)/max,1)*100);return '<div style="height:5px;background:#E5E7EB;border-radius:3px;margin-top:4px;overflow:hidden"><div style="height:100%;width:'+p+'%;background:'+col+'"></div></div>';}
  function sBand(v,t){if(v>=t[2])return{l:'High',c:'#C62828'};if(v>=t[1])return{l:'Moderate',c:'#E65100'};if(v>=t[0])return{l:'Mild',c:'#F59E0B'};return{l:'Low',c:'#2E7D32'};}
  var tiIcons={psychiatric_alert:'🚨',gynecology_referral:'👩‍⚕️',psychologist_referral:'🧠',sexual_therapy_pathway:'💙',sleep_recovery_program:'😴',stress_management_program:'🌿',recommend_menopause_program:'🌸',gurugram_clinic:'🏥',exercise_program:'🏃',nutrition_guidance:'🥗',sexual_wellbeing_program:'💜',relationship_counselling:'🤝'};
  var tiDesc={psychiatric_alert:'Immediate mental health support',psychologist_referral:'Clinical psychology and therapy',gynecology_referral:'Gynaecologist review',sexual_therapy_pathway:'Psychosexual therapy',sexual_wellbeing_program:'Sexual wellness support',sleep_recovery_program:'Sleep recovery (CBT-I)',stress_management_program:'Mindfulness and stress reduction',recommend_menopause_program:'EvaEraHealth Menopause Programme',exercise_program:'Movement prescription',nutrition_guidance:'Hormonal nutrition plan',relationship_counselling:'Relationship counselling',gurugram_clinic:'In-person consultation Gurugram'};
  var triH='';
  triage.forEach(function(t){var sC=t.sev==='severe'?'#C62828':t.sev==='moderate'?'#E65100':'#2E7D32';var sBg=t.sev==='severe'?'#FFF1F2':t.sev==='moderate'?'#FFF7ED':'#F0FDF4';var sBd=t.sev==='severe'?'#FECDD3':t.sev==='moderate'?'#FED7AA':'#BBF7D0';triH+='<div style="display:flex;align-items:flex-start;gap:10px;background:'+sBg+';border:1px solid '+sBd+';border-left:4px solid '+sC+';border-radius:10px;padding:11px 12px;margin-bottom:8px"><span style="font-size:18px;flex-shrink:0">'+(tiIcons[t.action]||'✦')+'</span><div style="flex:1"><div style="font-size:13px;font-weight:700;color:#111827;text-transform:capitalize">'+t.action.replace(/_/g,' ')+'</div><div style="font-size:12px;color:#6B7280;margin-top:2px">'+(tiDesc[t.action]||'')+'</div></div><span style="font-size:10px;font-weight:800;color:'+sC+';background:white;padding:2px 8px;border-radius:10px;border:1px solid '+sBd+';flex-shrink:0">'+t.sev.toUpperCase()+'</span></div>';});
  var dCards='<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:20px">';
  [{l:'Vasomotor',v:sc.MENQOL_vasomotor||0,m:20,t:[7,10,14],e:'🌡'},{l:'Physical',v:sc.MENQOL_physical||0,m:20,t:[7,10,14],e:'💪'},{l:'Emotional',v:sc.MENQOL_psychosocial||0,m:20,t:[7,10,14],e:'🧠'},{l:'Intimate',v:sc.MENQOL_sexual||0,m:20,t:[7,10,14],e:'💙'},{l:'Sleep',v:sc.ISI||0,m:28,t:[8,15,22],e:'😴'}].forEach(function(d){var b=sBand(d.v,d.t);dCards+='<div style="background:#F9FAFB;border:1.5px solid #E5E7EB;border-radius:10px;padding:10px;text-align:center"><div style="font-size:16px">'+d.e+'</div><div style="font-size:10px;color:#6B7280;font-weight:600;margin:3px 0">'+d.l+'</div><div style="font-size:20px;font-weight:900;font-family:Georgia,serif;color:'+b.c+'">'+d.v+'<span style="font-size:10px;color:#9CA3AF">/'+d.m+'</span></div>'+sBar(d.v,d.m,b.c)+'<div style="font-size:9px;font-weight:700;color:'+b.c+';margin-top:3px">'+b.l+'</div></div>';});
  dCards+='</div>';
  var H='<!DOCTYPE html><html lang=en><head><meta charset=UTF-8><meta name=viewport content="width=device-width,initial-scale=1"><title>EvaEraHealth Wellness Report</title><style>*{box-sizing:border-box}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#F8F9FA;-webkit-print-color-adjust:exact;print-color-adjust:exact}@media print{.noprint{display:none}body{background:white}}.page{max-width:800px;margin:0 auto;background:white;box-shadow:0 4px 40px rgba(0,0,0,.12)}</style></head><body><div class=page>';
  H+='<div style="background:linear-gradient(135deg,#880E4F,#C2185B,#AD1457);padding:24px 32px;color:white">';
  H+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">';
  H+='<div style="display:flex;align-items:center;gap:12px"><div style="width:44px;height:44px;background:rgba(255,255,255,.2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px">🌸</div>';
  H+='<div><div style="font-family:Georgia,serif;font-size:22px;font-weight:700">EvaEraHealth</div><div style="font-size:11px;opacity:.7;margin-top:1px">Adaptive Menopause Wellness Platform</div></div></div>';
  H+='<span style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:16px;padding:5px 12px;font-size:11px;font-weight:600">Personal Wellness Report</span></div>';
  H+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;background:rgba(0,0,0,.15);border-radius:10px;padding:12px 16px">';
  ['Patient|'+name,'Age|'+(a.age||'—')+' yrs','Stage|'+(a.stage||'—'),'Date|'+today].forEach(function(item){var p=item.split('|');H+='<div style="text-align:center"><div style="font-size:10px;opacity:.6;font-weight:600;text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px">'+p[0]+'</div><div style="font-size:13px;font-weight:700">'+p[1]+'</div></div>';});
  H+='</div></div>';
  H+='<div style="background:#FFF3E0;border-bottom:3px solid #FF9800;padding:10px 32px;display:flex;gap:8px;align-items:center"><span>🤖</span><span style="font-size:12px;color:#E65100;font-weight:600">AI-Generated Wellness Report — For informational purposes only. Must be reviewed by a qualified clinician before any clinical decision.</span></div>';
  H+='<div style="padding:24px 32px">';
  var drIcon=band.indexOf('Optimal')>=0?'🌟':band.indexOf('Mild')>=0?'🌿':band.indexOf('Moderate')>=0?'🌀':band.indexOf('Significant')>=0?'⚠️':'🆘';
  H+='<div style="text-align:center;padding:20px;background:linear-gradient(135deg,#FFF0F5,#F0F9FF);border-radius:14px;margin-bottom:20px">';
  H+='<div style="font-size:52px;margin-bottom:8px">'+drIcon+'</div>';
  H+='<div style="font-size:26px;font-weight:800;font-family:Georgia,serif;color:'+bandCol+';margin-bottom:6px">'+band+'</div>';
  H+='<div style="font-size:12px;color:#6B7280">Your EvaEraHealth Wellness Level</div></div>';
  H+='<div style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1E3A5F;margin:0 0 10px;padding-bottom:5px;border-bottom:2px solid #FCE4EC">Domain Scores</div>';
  H+=dCards;
  if(S.flags&&S.flags.mentalHealthCompleted){H+='<table style="width:100%;border-collapse:collapse;margin-bottom:16px"><thead><tr><th style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;padding:7px 8px;border-bottom:2px solid #F3F4F6;text-align:left">Instrument</th><th style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;padding:7px 8px;border-bottom:2px solid #F3F4F6">Score</th><th style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;padding:7px 8px;border-bottom:2px solid #F3F4F6">Scale</th><th style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;padding:7px 8px;border-bottom:2px solid #F3F4F6">Band</th></tr></thead><tbody>';var mhRows=[["PHQ-9",sc.PHQ9,27,sc.PHQ9_band],["GAD-7",sc.GAD7,21,sc.GAD7_band],["PSS-8",sc.PSS8,32,sc.PSS8_band]];mhRows.forEach(function(r){var col=r[3]==='Severe'||r[3]==='High'?'#C62828':r[3]==='Moderate'||r[3]==='Mod-Severe'?'#E65100':r[3]==='Mild'?'#F59E0B':'#2E7D32';H+='<tr><td style="padding:7px 8px;border-bottom:1px solid #F9FAFB;font-weight:600;font-size:13px">'+r[0]+'</td><td style="padding:7px 8px;border-bottom:1px solid #F9FAFB;font-size:18px;font-weight:900;font-family:Georgia,serif;color:'+col+';text-align:center">'+r[1]+'</td><td style="padding:7px 8px;border-bottom:1px solid #F9FAFB"><div style="width:90px;height:5px;background:#F3F4F6;border-radius:3px;overflow:hidden"><div style="height:100%;width:'+Math.round(r[1]/r[2]*100)+'%;background:'+col+'"></div></div></td><td style="padding:7px 8px;border-bottom:1px solid #F9FAFB;color:'+col+';font-weight:700;font-size:12px">'+r[3]+'</td></tr>';});H+='</tbody></table>';}
  H+='<div style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1E3A5F;margin:20px 0 10px;padding-bottom:5px;border-bottom:2px solid #FCE4EC">Your Personal Wellness Report</div>';
  H+='<div style="background:#FFFBF5;border:1px solid #FCE4EC;border-radius:12px;padding:20px">'+fmtAI(aiBody)+'</div>';
  if(triage.length){H+='<div style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1E3A5F;margin:20px 0 10px;padding-bottom:5px;border-bottom:2px solid #FCE4EC">Personalised Care Recommendations</div>';H+=triH;}
  H+='<div style="background:linear-gradient(135deg,#FFF8E7,#FFF3E0);border:1.5px solid #FFB300;border-radius:12px;padding:16px;margin-top:20px"><div style="font-size:14px;font-weight:800;color:#E65100;margin-bottom:8px">⚕️ Medical Disclaimer</div><div style="font-size:12px;color:#795548;line-height:1.7">This report is generated by <strong>EvaEraHealth AI (Claude, Anthropic)</strong> and is for <strong>informational and wellness awareness purposes only</strong>. It does not constitute a medical diagnosis, prescription, or clinical advice. All recommendations must be reviewed and verified by a qualified clinician before any action. Scores are self-reported. For emergencies call 112.</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><span style="background:white;border:1px solid #FFB300;border-radius:10px;padding:2px 8px;font-size:10px;font-weight:700;color:#E65100">🤖 AI Generated</span><span style="background:white;border:1px solid #66BB6A;border-radius:10px;padding:2px 8px;font-size:10px;font-weight:700;color:#2E7D32">🔒 DPDP 2023</span><span style="background:white;border:1px solid #42A5F5;border-radius:10px;padding:2px 8px;font-size:10px;font-weight:700;color:#1565C0">👩‍⚕️ Clinician Review Required</span></div></div>';
  H+='</div>';
  H+='<div style="background:#1E3A5F;color:rgba(255,255,255,.65);padding:14px 32px;display:flex;justify-content:space-between;align-items:center;font-size:11px"><div><span style="color:white;font-weight:700">EvaEraHealth Clinic</span><br>Gurugram Flagship Center</div><div style="text-align:center">Report ID: EVR-'+Date.now().toString(36).toUpperCase()+'<br>'+today+'</div><div style="text-align:right">📞 +91 80690 50000<br>clinic@evaerahealth.in</div></div>';
  H+='<div class=noprint style="padding:14px 32px;background:#F3F4F6;text-align:center"><button onclick="window.print()" style="background:#880E4F;color:white;border:none;padding:11px 24px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;margin-right:8px">🖨️ Print / Save as PDF</button><button onclick="window.close()" style="background:#E5E7EB;color:#374151;border:none;padding:11px 24px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">✕ Close</button></div>';
  H+='</div></body></html>';
  var blob=new Blob([H],{type:'text/html;charset=utf-8'});
  var a2=document.createElement('a');a2.href=URL.createObjectURL(blob);
  a2.download='EvaEraHealth_Report_'+name.replace(/\s+/g,'_')+'_'+today.replace(/[\s,]/g,'')+'.html'; // DEF-15: HTML with embedded print-to-PDF instructions
  document.body.appendChild(a2);a2.click();document.body.removeChild(a2);URL.revokeObjectURL(a2.href);
}

