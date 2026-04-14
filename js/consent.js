/* Consent, Session & Auth */

var CONSENT_ITEMS = [
  {id:'c1',title:'Health & Symptom Data',desc:'Collection and processing of your menopause symptom data, clinical scores, and health metrics.',required:true,badge:'Sensitive Data'},
  {id:'c2',title:'Wearable Device Data',desc:'Optional integration of wearable device metrics for enhanced clinical insights.',required:true,badge:'Sensitive Data'},
  {id:'c3',title:'Ayurvedic & Lifestyle Profile',desc:'Your Prakriti type, Vikriti, and lifestyle information for personalised recommendations.',required:true,badge:'Required'},
  {id:'c4',title:'AI Processing & Clinical Scoring',desc:'Automated scoring using MenQOL, PHQ-9, GAD-7, ISI, PSS-8, FSFI, and FSDSR instruments.',required:true,badge:'Required'},
  {id:'c5',title:'Sharing with Healthcare Professionals',desc:'Sharing your anonymised or identified data with your consulting clinician.',required:true,badge:'Required'},
  {id:'c6',title:'Anonymised Research Contribution',desc:'Optional contribution to menopause research in India (de-identified data only).',required:false,badge:'Optional'},
  {id:'c8',title:'Your Right to Erasure (DPDP §11)',desc:'You may delete all your data at any time using the Delete My Data button, or email dpo@evaerahealth.in. Data deleted within 30 days.',required:false,badge:'Your Right'},
  {id:'c7',title:'Corporate Wellness Reporting',desc:'If enrolled via employer, aggregate anonymised reporting to HR.',required:false,badge:'Optional'},
];
function saveSession(){try{localStorage.setItem('evr_session_v7',JSON.stringify(S.session));}catch(e){}}
function loadSession(){try{var s=localStorage.getItem('evr_session_v7');if(s){S.session=JSON.parse(s);return true;}}catch(e){}return false;}
function savePatients(){try{localStorage.setItem('evr_patients_v7',JSON.stringify(S.patients));}catch(e){}try{var _p=S.patients.map(function(p){return{id:p.id,name:p.name,age:p.age,city:p.city,stage:p.stage,composite:p.composite||0,band:(p.composite<=5?'Optimal':p.composite<=30?'Mild':p.composite<=55?'Moderate':p.composite<=80?'Severe':'Critical'),scores:p.scores,triage:p.triage,redFlag:p.psychiatricAlert||((p.redFlags||[]).length>0),flags:p.flags,comorbidities:p.comorbidities,ts:new Date(p.timestamp).toLocaleString('en-IN'),submittedAt:new Date(p.timestamp).getTime()};});localStorage.setItem('evh_patients',JSON.stringify(_p));try{var _bc=new BroadcastChannel('evh_v7');_bc.postMessage({t:'new_assess',d:_p[0]});_bc.close();}catch(_e){}}catch(_e2){}}
function loadPatients(){try{var p=localStorage.getItem('evr_patients_v7');if(p)S.patients=JSON.parse(p);}catch(e){}}
function showScreen(id){
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  document.getElementById(id).classList.add('active');
}
function authTab(mode){
  S.authMode=mode;
  document.querySelectorAll('.auth-tab').forEach(function(t,i){t.classList.toggle('active',(i===0&&mode==='login')||(i===1&&mode==='register'));});
  document.getElementById('auth-login').style.display=mode==='login'?'block':'none';
  document.getElementById('auth-register').style.display=mode==='register'?'block':'none';
  document.getElementById('auth-otp').style.display='none';
}
function sendOTP(mode){
  var id=mode==='login'?document.getElementById('login-id').value:document.getElementById('reg-mobile').value;
  if(!id){alert('Please enter your mobile number or email');return;}
  S.authId=id;
  document.getElementById('auth-login').style.display='none';
  document.getElementById('auth-register').style.display='none';
  document.getElementById('auth-otp').style.display='block';
  document.querySelectorAll('#auth-screen .otp-digit')[0].focus();
}
function otpNext(el){
  if(el.value.length===1){var n=el.nextElementSibling;if(n&&n.classList.contains('otp-digit'))n.focus();}
}
function verifyOTP(){
  var digits=Array.from(document.querySelectorAll('#auth-screen .otp-digit')).map(function(i){return i.value;}).join('');
  if(digits==='1234'){
    S.session={id:'user_'+Date.now(),ts:new Date().toISOString(),authId:S.authId};
    saveSession();showConsent();
  }else{alert('Invalid OTP. Demo OTP is 1234');}
}
function startGuest(){
  S.session={id:'guest_'+Date.now(),ts:new Date().toISOString()};
  showConsent();
}
function showConsent(){showScreen('consent-screen');renderConsent();}
function renderConsent(){
  var html='';
  CONSENT_ITEMS.forEach(function(item){
    var checked=S.consentData[item.id]?'checked':'';
    var badgeClass=item.badge==='Sensitive Data'?'sensitive':item.badge==='Required'?'required':'optional';
    html+='<div class="consent-item"><input type="checkbox" id="ci_'+item.id+'" '+(item.required?'required':'')+' '+checked+' onchange="consentChange(\''+item.id+'\',this.checked)">';
    html+='<div class="ci-body"><div class="ci-title">'+item.title+'<span class="ci-badge '+badgeClass+'">'+item.badge+'</span></div>';
    html+='<div class="ci-desc">'+item.desc+'</div></div></div>';
  });
  document.getElementById('consent-items-container').innerHTML=html;
  checkConsentBtn();
}
function consentChange(id,val){
  S.consentData[id]=val;
  checkConsentBtn();
}
function checkConsentBtn(){
  var allRequired=CONSENT_ITEMS.filter(function(i){return i.required;}).every(function(i){return S.consentData[i.id];});
  document.getElementById('btn-consent-proceed').disabled=!allRequired;
}
function quickAcceptConsent(){
  // Accept all consent items (required + optional) for demo speed
  CONSENT_ITEMS.forEach(function(i){S.consentData[i.id]=true;});
  proceedAfterConsent();
}

function proceedAfterConsent(){
  S.consentGiven=true;
  S.consentTimestamp=new Date().toISOString();
  startForm();
}
function startForm(){
  S.currentStep=0;
  S.answers={};
  S.scores={};
  S.triage=[];
  S.redFlagsTriggered=[];
  S.psychiatricAlert=false;
  S.psychiatricHardStop=false;
  S.flags={menqolPsychTriggered:false,menqolSexualTriggered:false,sleepModerate:false,sleepSevere:false,gyneRedFlag:false,mentalHealthCompleted:false,psychosexualCompleted:false,sleepDeepDive:false};
  rebuildSteps();
  showScreen('form-screen');
  renderStepDots();
  renderStep(0);
}
