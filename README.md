# DischargeBridge — Hospital Discharge Coordination Platform

> **Product Vision:** *One patient discharge. Multiple departments. One coordinated workflow.*

[![CI/CD Pipeline](https://github.com/vamsikiran1234/DischargeBridge/actions/workflows/ci.yml/badge.svg)](https://github.com/vamsikiran1234/DischargeBridge/actions/workflows/ci.yml)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)

---

## 1. The Real-World Problem

Imagine a patient admitted to a hospital for three days. The doctor determines that the patient is medically ready for discharge. However:
1. **The doctor** must complete the clinical discharge summary and post-discharge prescription.
2. **The nurse** must conduct vitals verification, discontinue IV lines, and deliver patient instructions.
3. **The pharmacy** must verify dosages and prepare prescribed take-home medications.
4. **The billing team** must audit room/procedure tariffs, settle third-party insurance (TPA) claims, and collect co-pays.
5. **The discharge care coordinator** must verify that all mandatory tasks are done before authorizing release.
6. **The patient and family attendant** wait anxiously, often for 3–5 hours without knowing what is pending or why.

The breakdown isn't that hospital staff aren't doing their jobs. **The problem is that departments lack a shared, synchronized operational view of what is pending, who owns each task, and what is blocking final discharge completion.**

### Why DischargeBridge is Different
**DischargeBridge is not another monolithic Hospital Management System (HMS).** It does not attempt to manage hospital cafeterias or equipment inventories. It solves **one specific high-friction problem**: the delay, confusion, and lost bed-turnover capacity between a clinician's discharge decision and physical patient release.

---

## 2. Key Product Capabilities

### A. Central Discharge Readiness Board
- Replaces disconnected phone calls and paper slips with a real-time departmental coordination board.
- Provides holistic visibility into active discharges across **Doctor Clearance**, **Nursing Handover**, **Pharmacy Preparation**, and **Billing Clearance**.
- Live readiness status engine (`INITIATED` &rarr; `IN_PROGRESS` &rarr; `BLOCKED` &rarr; `READY_FOR_FINAL_HANDOVER` &rarr; `COMPLETED`).

### B. Discharge Blocker Intelligence Hub
Instead of showing an unhelpful progress percentage, DischargeBridge directly answers:
- **What is preventing this discharge from being completed?**
- **Which department owns the pending task?**
- **How long has it been delayed?**
- **Which tasks can be executed in parallel?**
- **What needs to happen before final handover?**

### C. Dependency-Aware Workflow Engine
- **Clinical Governance:** The system never automatically declares a patient medically cleared; clinical authorization is strictly restricted to licensed physicians.
- **Parallel Operational Processing:** Pharmacy dispensing and billing clearances execute concurrently to minimize coordination duration.
- **Enforced Handover Gate:** The care coordinator can trigger final handover **only** when all mandatory department tasks are 100% completed and zero active blockers remain.

### D. Complete Immutable Audit Trail
- Every state transition, blocker creation, resolution note, and authorization is recorded with an immutable actor timestamp for clinical and legal compliance.

---

## 3. Technical Architecture — Modular Monolith

DischargeBridge is architected as a clean, feature-packaged **Spring Boot 3 + React + PostgreSQL** application.

```
dischargebridge/
├── backend/
│   ├── src/main/java/com/dischargebridge/
│   │   ├── config/              # Security, CORS, OpenAPI, and Demo Data Seeder
│   │   ├── auth/                # JWT Authentication & Staff Profile
│   │   ├── user/                # Hospital Personnel & Roles
│   │   ├── department/          # Clinical & Operational Departments
│   │   ├── patient/             # Patient Registry
│   │   ├── admission/           # Inpatient Admissions & Bed Reference
│   │   ├── discharge/           # Core Discharge State Engine & Readiness
│   │   ├── task/                # Department Tasks & Blocker Management
│   │   ├── blocker/             # Roadblock Radar & Resolution
│   │   ├── audit/               # Immutable Activity History
│   │   ├── dashboard/           # Coordinator Analytics & KPI Aggregates
│   │   └── common/              # REST Envelope & Global Exception Handling
│   └── pom.xml
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx                   # Top navigation with 1-click Demo Role Switcher
    │   │   ├── DischargeReadinessBoard.tsx  # Central operational coordination board
    │   │   ├── DischargeDetailModal.tsx     # Deep-dive checklist, blockers & audit timeline
    │   │   ├── DepartmentWorkspace.tsx      # Unit-specific execution workbench
    │   │   ├── BlockerRadar.tsx             # Blocker Intelligence & bottleneck resolution
    │   │   ├── AdmissionsView.tsx           # Inpatient census & synthetic admission creator
    │   │   ├── InitiateDischargeModal.tsx   # Physician discharge initiation
    │   │   └── AdminPanel.tsx               # Staff & governance roster
    │   ├── context/AuthContext.tsx          # Session & 1-click role impersonation
    │   ├── services/api.ts                  # Typed REST API client
    │   └── types/index.ts                   # Domain TypeScript definitions
    ├── package.json
    └── vite.config.ts
```

---

## 4. Pre-configured Demo Accounts & Synthetic Scenarios

DischargeBridge includes a built-in demo seeder (`DataInitializer`) with synthetic data ready for instant evaluation. Use the **1-Click Role Switcher bar** at the top of the application to test any perspective without typing credentials:

| Role | Name & Title | Demo Email | Password | Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **DOCTOR** | Dr. Sarah Mitchell, MD | `doctor@dischargebridge.com` | `password123` | Initiates discharge, records clinical clearance & summary |
| **NURSE** | Elena Rostova, RN | `nurse@dischargebridge.com` | `password123` | Nursing checklist, vitals verification, cannula removal |
| **PHARMACIST** | Marcus Vance, RPh | `pharmacist@dischargebridge.com` | `password123` | Take-home medicine pack, prescription counseling |
| **BILLING_STAFF** | Rachel Adams | `billing@dischargebridge.com` | `password123` | Tariff audit, insurance TPA claim settlement & co-pay |
| **COORDINATOR** | David Miller | `coordinator@dischargebridge.com` | `password123` | Monitors cross-unit readiness, resolves bottlenecks, authorizes final release |
| **ADMIN** | Dr. Arthur Sterling | `admin@dischargebridge.com` | `password123` | Hospital personnel governance, departments & audit explorer |

### Demo Patients Included Out of the Box:
1. **DB-1024 (John Miller — Bed G-12, General Medicine)**:
   - Status: `IN_PROGRESS` (3 / 5 completed: Doctor clearance complete, Discharge summary complete, Nursing handover complete; Pharmacy kit and Billing clearance pending).
2. **DB-1025 (Sarah Jenkins — Bed C-04, Cardiology)**:
   - Status: `BLOCKED` (Active blocker raised by Pharmacy: *"Prescribed specialized anticoagulant dosage out of central stock; requested urgent dispensary transfer"*).
3. **DB-1026 (Robert Chen — Bed O-09, Orthopedics)**:
   - Status: `READY_FOR_FINAL_HANDOVER` (All 4 mandatory tasks cleared; Coordinator can click *"Authorize Final Discharge Handover"*).
4. **DB-1027 (Emily Watson — Bed P-02, Pediatrics)**:
   - Status: `COMPLETED` (Discharged earlier today; bed released; full audit history recorded).
5. **DB-1028 & DB-1029 (Arthur Pendelton & Linda Zhao)**:
   - Status: Active Inpatient Admissions ready to demonstrate initiating a brand-new discharge workflow!

---

## 5. End-to-End Interview Demonstration Scenario

Follow this 5-minute walk-through to present the platform during an interview or live review:

1. **Start as Doctor (`doctor@dischargebridge.com`):**
   - Click **"Initiate Discharge"**, select admitted patient **Arthur Pendelton (DB-1028)**.
   - Enter clinician notes: *"Clinically stable, vital signs normal. Cleared for discharge on oral regimen."*
   - Click **"Initiate Discharge"**. Observe that DischargeBridge instantly creates coordinated tasks for Doctor, Nursing, Pharmacy, and Billing!
2. **Switch to Pharmacist (`pharmacist@dischargebridge.com`):**
   - Navigate to **"Department Tasks"** or inspect **Sarah Jenkins (DB-1025)**.
   - Open **"Blocker Radar"** to inspect the real-time bottleneck. Click **"Resolve Bottleneck"** with note: *"Stock received from satellite dispensary; take-home kit prepared."*
   - Observe the workflow instantly transition from `BLOCKED` back to active status!
3. **Switch to Coordinator (`coordinator@dischargebridge.com`):**
   - Go to **"Readiness Board"**. Locate patient **Robert Chen (DB-1026)**.
   - Observe that all 4 department clearance badges are green and the case is in `READY_FOR_FINAL_HANDOVER`.
   - Click **"Authorize Final Discharge Handover"**.
   - Notice the patient is marked `COMPLETED`, the bed is marked released, and the immutable audit log captures the event with exact timestamps.

---

## 6. REST API Endpoints

### Authentication & Users
- `POST /api/auth/login` — Authenticate hospital staff and issue JWT token
- `POST /api/auth/register` — Onboard staff (Admin only)
- `GET /api/users/me` — Current logged-in staff profile
- `GET /api/users` — Staff directory

### Central Dashboard & Blocker Intelligence
- `GET /api/dashboard/overview` — Holistic KPI summary of active discharges, pending tasks, blockers
- `GET /api/dashboard/blocked` — List of all workflows currently halted by blockers
- `GET /api/dashboard/pending-tasks` — Operational tasks grouped by department

### Discharge Workflow Engine
- `GET /api/discharges` — List recent discharge cases
- `GET /api/discharges/active` — List active in-flight cases
- `GET /api/discharges/{id}` — Get complete details (tasks, blockers, audit trail)
- `GET /api/discharges/{id}/readiness` — Real-time readiness calculation
- `POST /api/discharges` — Initiate discharge workflow
- `POST /api/discharges/{id}/medical-clearance` — Clinician records medical clearance
- `POST /api/discharges/{id}/complete` — Authorized coordinator final handover
- `GET /api/discharges/{id}/history` — Immutable audit history

### Department Tasks & Blockers
- `GET /api/tasks/my-tasks` — Tasks for logged-in user or their unit
- `PATCH /api/tasks/{id}/status` — Update task status (`IN_PROGRESS`, `COMPLETED`)
- `POST /api/tasks/{id}/assign` — Assign task to department personnel
- `POST /api/tasks/{id}/blockers` — Raise operational roadblock
- `PATCH /api/blockers/{id}/resolve` — Resolve blocker and resume workflow

---

## 7. Running Locally

### Prerequisites
- **Java 21+**
- **Node.js 20+** and **npm**
- (Optional) **Docker & Docker Compose**

### Running the Backend (Spring Boot)
```bash
cd backend
# Starts on port 8080 with in-memory H2 PostgreSQL mode and pre-seeded demo data:
./mvnw spring-boot:run
```
- API Docs & Swagger UI: `http://localhost:8080/swagger-ui.html`
- H2 Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:dischargebridge`)

### Running the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:5173` in your browser.

### Running with Docker Compose
```bash
docker-compose up --build
```
- Frontend UI: `http://localhost`
- Backend API: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

---

## 8. License & Authorship
Built with clinical care coordination rigor by **Vamsi Kiran**.
Repository: [github.com/vamsikiran1234/DischargeBridge](https://github.com/vamsikiran1234/DischargeBridge.git)
