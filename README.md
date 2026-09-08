# retinix: teaching a resnet to catch diabetic retinopathy before vision loss becomes irreversible.

> an explainable tele-triage system for diabetic retinopathy, built for frontline healthcare workers, community camps, and the ophthalmologists who back them up.

---

### the news

we built retinix because diabetic retinopathy is quietly robbing millions of people of their sight, and almost all of it is preventable if someone just looks at the back of the eye before the capillaries give up.

this is a complete, two-sided clinical platform:
- a tablet-first field app for community healthcare workers running mobile screening camps.
- a root doctor portal with access control, clinic permissions, and a specialist review queue.
- an in-memory pytorch resnet-152 model paired with grad-cam explainability overlays.
- a live mongodb atlas clinical ledger that strictly refuses to hoard retinal images.

---

### the scene, and some numbers

the math is brutal.

there are seventy-seven million people living with diabetes in india. there is approximately one ophthalmologist for every seventy thousand citizens in cities, and out in rural districts that number thins out until it basically hits zero. if you live in a village outside tenkasi, a comprehensive dilated eye exam means taking a day off daily wage labor, three connecting state-transport buses, and twelve hours of waiting on a wooden bench.

so people don't go. they wait. they wait until the blurry patch in the center of their vision turns into dark spiderwebs. by then, it's proliferative retinopathy. the microvessels have burst, fibrous tissue is pulling on the retina, and surgery is the only thing left.

now imagine a primary health camp on a humid tuesday morning in tirunelveli. temperature is forty-one celsius. an old bajaj ceiling fan is ticking overhead. forty elders are seated on plastic chairs. priya, an accredited frontline health worker, holds a handheld fundus camera, lines up the macula, and taps capture.

thirteen seconds later:
- the resnet inspects five distinct clinical grades (stage 0 to 4).
- grad-cam generates an activation heatmap showing exactly where it spotted microaneurysms or cotton-wool exudates.
- the case is triaged (routine, urgent, or high-priority referral).
- dr. arjun rao, sitting sixty kilometers away at the district hospital, receives the referral on his dashboard with priority flags already sorted.

---

### the denial list (what this is not)

let's be very clear about what we built and what we didn't build:

- **it is not an autonomous doctor.** it does not prescribe drops, it does not make unilateral diagnoses, and it will never replace a trained specialist. every referred case is queued for human ophthalmologist verification.
- **it is not an image hoarder.** we do not dump high-resolution retinal fundus scans into a cloud bucket. patient photos stay ephemeral in browser memory during analysis; only clinical tokens, classifications, probability vectors, and grad-cam coordinates are persisted. zero image storage.
- **it is not a black-box oracle.** models that just output `0.94 probability of disease` are useless to a field worker. retinix renders visual heatmaps so the health worker and the patient can look at the screen together and see why the referral is being made.
- **it is not a fake prototype with hardcoded mock arrays.** the workers, permissions, patients, screenings, and referrals are wired into real database collections with transactional updates and offline fallback.

---

### how it works

```
[ handheld fundus camera / image upload ]
                     │
                     ▼
       ┌───────────────────────────┐
       │   fastapi backend (:8000) │
       │  in-memory preprocessor   │
       └─────────────┬─────────────┘
                     │
                     ▼
       ┌───────────────────────────┐
       │     resnet-152 (pytorch)  │
       │    5-stage dr classifier  │
       └─────────────┬─────────────┘
                     │
                     ├──────────────────────────┐
                     ▼                          ▼
       ┌───────────────────────────┐ ┌───────────────────────────┐
       │   grad-cam explainability │ │   clinical triage engine  │
       │   activation heatmap      │ │   risk, stage, confidence │
       └─────────────┬─────────────┘ └──────────┬────────────────┘
                     │                          │
                     └─────────────┬────────────┘
                                   │
                     ┌─────────────▼─────────────┐
                     │   zero-image persistence  │
                     │  mongodb atlas / sqlite   │
                     └─────────────┬─────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   ┌───────────────────────┐               ┌────────────────────────┐
   │ health worker portal  │               │  root doctor portal    │
   │ (/health-worker)      │               │  (/doctor)             │
   │ - instant screening   │               │  - specialist review   │
   │ - patient registry    │               │  - triage queue        │
   │ - referral tracking   │               │  - worker permissions  │
   └───────────────────────┘               └────────────────────────┘
```

---

### core capabilities

#### 1. frontline screening with grad-cam
- runs inference in seconds on raw 224x224 fundus crops.
- outputs five dr stages: no dr, mild npdr, moderate npdr, severe npdr, and proliferative dr.
- draws transparent clinical heatmaps over suspicious lesions so the findings are instantly understandable.

#### 2. root doctor administration & permissions manager
- district ophthalmologists hold root administrative oversight over their screening network.
- granular permission switches for every single health worker:
  - `can_screen`: permission to trigger ai inference.
  - `can_refer`: permission to escalate cases to specialists.
  - `can_register_patients`: permission to onboard new patient clinical profiles.
  - `allowed_locations`: restricts worker operations to designated sub-centers (e.g., tirunelveli, tenkasi, alangulam).
  - `can_override_priority`: lets experienced workers elevate triage urgency.

#### 3. zero-image storage architecture
- patient fundus images never touch disk, s3, or cloud storage.
- inference and heatmap overlays are computed in ephemeral memory buffers.
- only clinical tokens, numerical metrics, timestamps, and findings are stored in the database.

#### 4. resilient clinical ledger
- primary storage runs on mongodb atlas (`retinix` database).
- automatic fallback to local sqlite if rural connectivity drops completely.
- real-time `/api/db-status` health monitoring displayed directly on the doctor dashboard.

---

### project structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py              # fastapi application routes & cors
│   │   ├── model_service.py     # resnet-152 inference & grad-cam engine
│   │   └── db.py                # mongodb atlas + sqlite fallback persistence
│   ├── ml/
│   │   ├── classifier.pt        # trained resnet-152 model weights
│   │   └── dr_detection.ipynb   # training & validation notebook
│   ├── requirements.txt         # python dependencies
│   └── .env.example             # environment template
│
├── frontend/
│   ├── app/                     # next.js 16 app router
│   │   ├── doctor/              # root doctor portal & case review pages
│   │   │   ├── cases/[id]/      # dynamic case review with ai overlay
│   │   │   ├── workers/         # healthcare worker permissions manager
│   │   │   ├── patients/        # patient cohort management
│   │   │   ├── history/         # audit log of past screenings
│   │   │   └── analytics/       # screening volume & risk distribution
│   │   ├── health-worker/       # frontline worker portal
│   │   │   ├── screening/new/   # image upload & live ai inference
│   │   │   ├── referrals/       # tele-triage escalation tracker
│   │   │   └── patients/        # patient directory & registration
│   │   ├── themes/              # light theme design system explorer
│   │   ├── layout.tsx           # root layout & font definitions
│   │   └── page.tsx             # landing page & workflow walkthrough
│   ├── components/              # modular ui components
│   ├── lib/
│   │   ├── store.ts             # client state, api synchronization, types
│   │   └── navigation.ts        # next.js navigation helpers
│   └── package.json             # frontend dependencies
│
├── run.sh                       # posix unified launcher (macos / linux)
├── run.bat                      # windows batch launcher
└── run.ps1                      # windows powershell launcher
```

---

### getting started

#### 1. clone and configure
```bash
git clone https://github.com/Boeing777-X9/IIC26.git
cd IIC26
```

set up your backend environment in `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
*(optional: fill in your `mongodb_uri` if using a remote atlas cluster, or leave default for local fallback)*

#### 2. start with one command

on macos or linux:
```bash
chmod +x run.sh
./run.sh
```

on windows:
```powershell
.\run.ps1
```

or start the services manually:

**backend:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate    # or .venv\Scripts\activate on windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**frontend:**
```bash
cd frontend
npm install
npm run dev
```

open your browser:
- frontend: [http://localhost:3000](http://localhost:3000)
- backend docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- health check: [http://localhost:8000/up](http://localhost:8000/up)

---

### api surface

| method | endpoint | description |
| :--- | :--- | :--- |
| `get` | `/up` | lightweight service liveness probe |
| `get` | `/api/db-status` | active database engine, cluster host, and connection state |
| `post` | `/api/screen` | upload fundus scan, returns grade, confidence, findings, & grad-cam |
| `get` | `/api/workers` | list all registered healthcare workers and their permission sets |
| `post` | `/api/workers` | root doctor registers a new healthcare worker with granular rights |
| `put` | `/api/workers/{id}` | update permissions, status, or assigned clinic locations |
| `delete` | `/api/workers/{id}` | remove worker access |
| `get` | `/api/patients` | list registered screening cohort |
| `post` | `/api/patients` | register new patient with clinical history |
| `get` | `/api/screenings` | get historical screening ledger (metrics only) |
| `post` | `/api/screenings` | record screening inference result |
| `get` | `/api/referrals` | get specialist triage referrals |
| `post` | `/api/referrals` | escalate high-risk case to ophthalmologist |
| `put` | `/api/referrals/{id}` | specialist updates review status and clinical notes |

---

### the rally cry

blindness from diabetic retinopathy doesn't happen because we lack the technology to cure it. it happens because nobody caught it when the patient could still read the calendar on their kitchen wall.

retinix puts deep learning where the dirt roads end, wraps it in human explainability so people actually trust it, and connects the clinic tent to the district hospital in thirteen seconds flat.

see earlier. explain better. refer smarter.
