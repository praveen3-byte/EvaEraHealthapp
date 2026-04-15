## Folder Structure

```
evaerahealth/
├── index.html                    ← Main HTML shell (links all CSS + JS)
│
├── css/
│   ├── variables-base.css        ← CSS variables, reset, body, nav
│   ├── auth-consent.css          ← Auth screen, OTP, consent card
│   ├── form-assessment.css       ← Step cards, progress, all field types
│   ├── results.css               ← Loading screen, results, rings, care cards
│   ├── hcp-portal.css            ← Full HCP portal dark theme
│   └── admin-responsive.css      ← Admin classes + mobile breakpoints
│
├── js/
│   ├── state.js                  ← Global S{} state, STEPS[], GATE_* vars
│   ├── consent.js                ← CONSENT_ITEMS, session/auth, startForm
│   ├── navigation.js             ← renderStep, stepNext/Back, gateChoice
│   ├── field-helpers.js          ← setAns/Likert/Radio, all buildStep* builders
│   ├── hardstop.js               ← Hard stop screens, buildStepSummary
│   ├── scoring.js                ← EVR_RULES, computeScores, runRuleEngine, saveResult
│   ├── demo.js                   ← quickDemoFill and aliases
│   ├── results.js                ← startProcessing, showResults, care cards
│   ├── hcp-portal.js             ← HCP dashboard, patient list/detail, reports
│   ├── wearable.js               ← WEARABLE_CORROBORATION[], calcWearableMod
│   ├── utilities.js              ← exportMyData, deleteMyData, filters
│   ├── integration.js            ← Booking flow, admin portal, cross-tab sync
│   └── supabase.js               ← ★ Supabase integration (saves assessments to DB)
│
├── database/
│   └── schema.sql                ← ★ Run this in Supabase SQL Editor to create the table
│
├── data/
│   ├── metadata.json
│   ├── scoring_rules.json
│   ├── instruments.json
│   ├── clinical_data.json
│   ├── triage_flags.json
│   └── demo_config.json
│
└── README.md
```

---

## Supabase

### Step 1 — Create the table
1. Go to https://supabase.com → your project → SQL Editor
2. Click New Query, paste the entire contents of `database/schema.sql`, click Run

### Step 2 — Get your credentials
1. In Supabase → Settings → API
2. Copy your Project URL (looks like `https://abcxyz.supabase.co`)
3. Copy your anon / public key

### Step 3 — Paste into supabase.js
Open `js/supabase.js` and replace these two lines near the top:
```js
var SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
var SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

That's it. Open `index.html`, complete an assessment — the row appears instantly in your Supabase **Table Editor**.

---

## What gets saved

Every completed assessment saves one row with:

| Group | Columns |
|---|---|
| Demographics | full_name, age, city, marital_status, ethnicity, stage, prakriti, vikriti… |
| MenQOL | mq_v1–mq_v6, mq_p1–mq_p8, mq_ps1–mq_ps7, mq_s1–mq_s3 |
| PHQ-9 | phq_0_anhedonia … phq_8_suicidal_ideation + phq9_total_score |
| GAD-7 | gad_0_anxious … gad_6_afraid + gad7_total_score |
| PSS-8 | pss_0 … pss_7 + pss8_total_score |
| ISI | isi_0_difficulty_falling_asleep … isi_6_daytime_interference + isi_total_score |
| Comorbidities | comor_hypertension, comor_diabetes, comor_hypothyroidism… (13 conditions) |
| Scores | score_composite, score_band, score_vasomotor, score_physical… |
| Flags | flag_psychiatric_alert, flag_red_flags[], flag_triage_actions[] |
| Wearable | wearable_device, wearable_data (JSONB) |

---

## Script Load Order (must not change)

```
state → consent → navigation → field-helpers → hardstop → scoring
→ demo → results → hcp-portal → wearable → utilities → integration → supabase
```

---

## How to Run

Open `index.html` in a browser — no build step required.
