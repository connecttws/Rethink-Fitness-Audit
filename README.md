# Rethink Fitness Audit

A diagnostic, scoring, and client-intake platform built for **Rethink Fitness Coaches** to evaluate fitness goals, calculate health biometrics (BMI, target weight gap), run 360° fitness assessments, and generate client performance reports.

---

## 🔗 Repository

- **GitHub Repository**: [https://github.com/connecttws/Rethink-Fitness-Audit](https://github.com/connecttws/Rethink-Fitness-Audit)

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Database & ORM**: [Prisma 6](https://www.prisma.io/) with PostgreSQL / Supabase
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## ✨ Key Features

1. **Prospect Biometrics & Intake**:
   - Collects prospect details, primary fitness goals, target horizon, age, and biological sex.
   - Dynamic height (cm / ft+in) and weight inputs with automatic BMI, BMI category, and optimal target weight gap computation.

2. **360° Diagnostic Questionnaire**:
   - Continuous and stepped multi-pillar audit assessing nutrition, workout consistency, recovery, metabolic baseline, and lifestyle factors.
   - Weighted question scoring with real-time progress tracking.

3. **Executive Client Report (`/report` & `/r/[id]`)**:
   - High-impact diagnostic report with visual breakdown cards, score gauges, prioritized findings, and personalized action plans.
   - Shareable client link routing (`/r/[id]`) with WhatsApp direct-share integration.

4. **Robust Database Storage**:
   - PostgreSQL persistence using Prisma ORM (`Audit` model with JSON metrics and action steps).
   - Local fallback storage support for offline field assessments.

---

## 📁 Directory Structure

```
Rethink-Fitness-Audit/
├── prisma/
│   ├── schema.prisma                       # Prisma schema definition
│   └── create_rethink_fitness_audits.sql   # SQL migration / DDL script
├── public/                                 # Static icons and assets
├── scripts/
│   └── init-db.mjs                         # Database initialization helper
├── src/
│   ├── app/
│   │   ├── api/audits/                     # CRUD API routes for audit submissions
│   │   ├── r/[id]/                         # Shareable public report route
│   │   ├── report/                         # Executive report rendering page
│   │   ├── globals.css                     # Tailwind v4 styles & theme configuration
│   │   ├── layout.tsx                      # Root application layout
│   │   └── page.tsx                        # Main auditor questionnaire & intake wizard
│   ├── components/
│   │   ├── BusinessInfoStep.tsx            # Prospect & biometric intake form
│   │   ├── CategoryStep.tsx                # Goal selection step
│   │   ├── ContinuousQuestionnaire.tsx     # Continuous survey flow
│   │   ├── QuestionStepperStep.tsx         # Pillar stepper flow
│   │   ├── RecentAuditsModal.tsx           # Recent audits browser modal
│   │   └── report/                         # Report presentation components (Cover, Breakdown, Findings, CTA)
│   └── lib/
│       ├── audit-data.ts                   # Questionnaire questions, pillars & scoring logic
│       ├── audit-storage.ts                # Client/server persistence helpers
│       └── prisma.ts                       # Prisma client singleton
├── .env.example                            # Database URL & environment configuration
├── package.json
└── tsconfig.json
```

---

## 🛠️ Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/connecttws/Rethink-Fitness-Audit.git
cd Rethink-Fitness-Audit
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and provide your PostgreSQL / Supabase connection string:
```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

### 3. Setup Database
Generate the Prisma Client and apply migrations:
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start an audit.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📄 License

All rights reserved © Rethink Fitness / TWS. Built for professional fitness coaching diagnostics.
