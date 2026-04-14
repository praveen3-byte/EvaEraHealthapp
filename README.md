# EvaEraHealth — Project File Structure

> Adaptive Menopause Assessment Platform v7  
> Patient · HCP · Admin Portals

---

## Folder Structure

```
evaerahealth/
├── index.html                    ← Main HTML shell (links all CSS + JS)
│
├── css/                          ← Stylesheets (load in this order)
│   ├── variables-base.css        ← CSS variables (:root), reset, body, nav
│   ├── auth-consent.css          ← Auth screen, OTP inputs, consent card
│   ├── form-assessment.css       ← Step cards, progress bar, all field types
│   ├── results.css               ← Loading screen, results, rings, care cards
│   ├── hcp-portal.css            ← Full HCP portal (dark premium theme)
│   └── admin-responsive.css      ← Admin portal classes + mobile breakpoints
│
├── js/                           ← Scripts (load in this order — order matters!)
│   ├── state.js                  ← Global S{} state, STEPS[], GATE_* vars, rebuildSteps
│   ├── consent.js                ← CONSENT_ITEMS, session/auth, showConsent, startForm
│   ├── navigation.js             ← renderStep, stepNext/Back, validateStep, gateChoice
│   ├── field-helpers.js          ← setAns/Likert/Radio, buildStep* content, checkRedFlags
│   ├── hardstop.js               ← showGyneHardStop, showPsychiatricHardStop, buildStepSummary
│   ├── scoring.js                ← EVR_RULES, computeScores, runRuleEngine, saveResult
│   ├── demo.js                   ← quickDemoFill and legacy demo aliases
│   ├── results.js                ← startProcessing, showResults, care card builders
│   ├── hcp-portal.js             ← HCP dashboard, patient list, patient detail, reports
│   ├── wearable.js               ← WEARABLE_CORROBORATION, calcWearableMod
│   ├── utilities.js              ← exportMyData, deleteMyData, filters, toggleMed/FamHx
│   └── integration.js            ← Booking flow, admin portal, cross-tab sync, seedDummyData
│
├── data/                         ← Reference data (split from EvaEraHealth_v14_complete.json)
│   ├── metadata.json             ← Platform info and build manifest
│   ├── scoring_rules.json        ← 53 EVR rules, composite formula, severity bands
│   ├── instruments.json          ← Clinical questionnaires (MenQOL, PHQ-9, GAD-7…)
│   ├── clinical_data.json        ← Prakriti/Vikriti, comorbidities, wearable metrics
│   ├── triage_flags.json         ← Critical flags and triage protocols
│   └── demo_config.json          ← Test patient data and expected scores
│
└── README.md
```

---

## Script Load Order (critical)

Each file uses globals defined in earlier files:

```
state.js → consent.js → navigation.js → field-helpers.js → hardstop.js
→ scoring.js → demo.js → results.js → hcp-portal.js → wearable.js
→ utilities.js → integration.js
```

---

## CSS Load Order

```
variables-base.css → auth-consent.css → form-assessment.css
→ results.css → hcp-portal.css → admin-responsive.css
```

---

## How to Run

Open `index.html` directly in a browser — no build step required.
