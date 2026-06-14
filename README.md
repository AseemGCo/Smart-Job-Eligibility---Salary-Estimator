# 🎯 TalentScope — Smart Job Eligibility & Salary Estimator

A professional, production-ready **HR-tech web application** that evaluates job
candidates, estimates their salary range, scores their eligibility, and tracks an
analytics dashboard — built with **100% Vanilla JavaScript**. No React, no Vue,
no jQuery, no Bootstrap, no Tailwind, no external libraries of any kind.

> Built for the **JavaScript Power Challenge** to demonstrate strong JS
> fundamentals **and** real-world product thinking.

---

## 🚀 Live Demo

Deploy in one click on Vercel (see [Vercel Deployment](#-vercel-deployment)).
Once deployed, your URL will look like `https://talentscope.vercel.app`.

---

## 📋 Project Overview

Recruiters enter a candidate's details and instantly receive:

- ✅ **Interview Eligibility** (Eligible / Priority / Not Eligible)
- ⭐ **Priority Candidate Status**
- 💰 **Estimated Salary Range** (with relocation & education bonuses)
- 📊 **Confidence Level** (High / Medium / Low)
- 🏅 **Ranking Score** — `(Skill Score × 0.7) + (Projects × 5)`
- 💡 **Personalized Improvement Suggestions**

Every evaluation can be **saved to a candidate history** (persisted in Local
Storage), searched, sorted, exported, and rolled up into a **live analytics
dashboard**.

---

## ✨ Features

| Category | Highlights |
| --- | --- |
| **Evaluation Engine** | Eligibility rules, salary bands with bonuses, confidence scoring |
| **Ranking** | Composite ranking score + automatic **Top Performer** detection |
| **Dashboard** | Total checked, eligible count, priority count, average skill score |
| **Candidate History** | Persistent table stored in Local Storage |
| **Search & Sort** | Search by name; sort by skill, salary, projects, rank, recency |
| **Reports** | Download a single candidate report **or** export the whole pool as `.txt` |
| **Suggestions** | Context-aware tips to improve eligibility & salary |
| **UI/UX** | Glassmorphism cards, gradients, animated meters, count-up stats, toasts |
| **Theme** | Light / Dark toggle, remembered across sessions |
| **Responsive** | Fully responsive across desktop, tablet, and mobile |
| **Accessibility** | Semantic HTML, ARIA live regions, reduced-motion support |

---

## 🛠️ Technologies Used

- **HTML5** — semantic, accessible markup
- **CSS3** — custom properties, glassmorphism, gradients, flexbox & grid, media queries, keyframe animations
- **Vanilla JavaScript (ES6+)** — modular functions, Local Storage, DOM APIs, Blob downloads

> Zero dependencies. Zero build step. Just open and run.

---

## 🧠 Business Logic

### Eligibility

A candidate is **Eligible** when **all** of the following are true:

- Age ≥ 18
- JavaScript Skill Score ≥ 60
- Projects ≥ 2

A candidate is a **Priority Candidate** when they are eligible **and**:

- Skill Score ≥ 80
- Projects ≥ 3

A candidate is **Not Eligible** when Skill Score < 60 (or they fail the age /
project minimums).

### Salary Estimation

| Skill Score | Base Range |
| --- | --- |
| 60 – 70 | ₹4 – 6 LPA |
| 71 – 85 | ₹6 – 10 LPA |
| 86 – 100 | ₹10 – 18 LPA |

**Bonuses** (each adds **+₹1 LPA** to *both* ends of the range):

- Willing to Relocate = **Yes**
- Education = **Postgraduate**

**Example:** Base `₹6–10 LPA` → relocation `₹7–11 LPA` → postgraduate `₹8–12 LPA`.

### Confidence Level

| Projects | Confidence |
| --- | --- |
| ≥ 4 | High (90%) |
| 2 – 3 | Medium (60%) |
| < 2 | Low (30%) |

### Ranking Score

```
Ranking Score = (Skill Score × 0.7) + (Projects × 5)
```

The candidate with the highest ranking score is highlighted as the **🏆 Top Performer**.

---

## 🧩 Code Structure

```
/
├── index.html        # Markup: dashboard, form, results, history
├── css/
│   └── styles.css    # Glassmorphism theme, layout, animations, responsive
├── js/
│   └── app.js        # All logic, modular & well-commented
├── vercel.json       # Vercel static deployment config
└── README.md         # You are here
```

### Required functions (all implemented in `js/app.js`)

- `checkEligibility()` — applies eligibility & priority rules
- `calculateSalary()` — salary band lookup + bonuses
- `calculateConfidence()` — confidence level from projects
- `generateReport()` — composes the full evaluation object
- `saveCandidate()` — persists a candidate to Local Storage
- `loadCandidateHistory()` — reads the candidate pool from Local Storage

### JavaScript fundamentals demonstrated

Variables · Data Types · Operators · Conditionals · **Loops** (`for`,
`for..of`, `forEach`, `reduce`) · Functions · Arrays · Objects · DOM
Manipulation · Event Handling · Form Validation · Local Storage · Error Handling.

---

## 💻 Installation

No build tools required.

```bash
# 1. Clone or download this repository
git clone https://github.com/<your-username>/talentscope.git
cd talentscope
```

---

## 🚀 Local Development

Because the app is fully static, you can simply open `index.html` in a browser.
For the best experience (and to mirror production), serve it locally:

```bash
# Option A — Python (pre-installed on macOS/Linux)
python3 -m http.server 5173
# then visit http://localhost:5173

# Option B — Node (if installed)
npx serve .

# Option C — VS Code
# Install the "Live Server" extension and click "Go Live"
```

---

## 🌐 GitHub Deployment

```bash
# Initialize and push
git init
git add .
git commit -m "feat: TalentScope — Smart Job Eligibility & Salary Estimator"
git branch -M main
git remote add origin https://github.com/<your-username>/talentscope.git
git push -u origin main
```

### (Optional) GitHub Pages

1. Go to **Settings → Pages**.
2. Under **Source**, choose **Deploy from a branch**.
3. Select branch `main` and folder `/ (root)`, then **Save**.
4. Your site will be live at `https://<your-username>.github.io/talentscope/`.

---

## ▲ Vercel Deployment

This project ships with a ready-to-use `vercel.json` and deploys with **zero
configuration**.

### Option A — Vercel Dashboard

1. Push the project to GitHub (see above).
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** the repository.
3. Framework Preset: **Other** · Build Command: *(none)* · Output Directory: `./`
4. Click **Deploy**. Done. 🎉

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production deployment
```

The included `vercel.json` enables clean URLs, sets sensible security headers,
and applies long-term caching to the `css/` and `js/` assets.

---

## 🧪 How to Use

1. Fill in the candidate's **name, age, education, skill score, projects, and relocation**.
2. Click **⚡ Evaluate Candidate** to see eligibility, salary, confidence, meters, and suggestions.
3. Click **💾 Save to History** to add them to the persistent table and dashboard.
4. Use the **search bar** and **sort dropdown** to explore your candidate pool.
5. **Download** an individual report or **Export All** candidates as a text file.
6. Toggle **🌙 / ☀️ theme** any time — your choice is remembered.

---

## 📄 License

Released under the **MIT License** — free to use, modify, and learn from.

---

<p align="center">Built with ❤️ using <strong>HTML5 · CSS3 · Vanilla JavaScript</strong> — no frameworks, no libraries.</p>
