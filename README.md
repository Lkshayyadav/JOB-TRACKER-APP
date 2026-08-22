# 🚀 JobTrack Mobile Companion Application

A high-performance **React Native (Expo)** mobile application for **JobTrack**, featuring an **Electric Lime & OLED Matte Dark UI**, full web feature parity, and direct connection to the deployed Render backend.

---

## 📱 Features
* 📊 **Executive Dashboard**: Real-time KPI metrics, stage distribution progress bar, and recent applications feed.
* 📋 **Applications Pipeline**: Horizontal stage capsule switcher (`Wishlist`, `Applied`, `OA`, `Technical Round`, `HR Round`, `Offer`, `Rejected`), live search, priority filters (`High`, `Medium`, `Low`), and pinned application sorting.
* 📅 **Interview & Follow-up Timeline**: Grouped schedule (*Today, This Week, Upcoming, Overdue*) with 1-tap detail views.
* 🔖 **Saved Job Bookmarks**: Save open vacancies and convert them to active applications with 1 tap (`Move to Applied`).
* 📈 **Platform Analytics**: Response rates and interview conversions across job boards (LinkedIn, Wellfound, Indeed, Referrals).
* 🔒 **JWT Auth Gate**: Persistent login with AsyncStorage and auto-login session restoration.

---

## 🛠️ Tech Stack
* **Framework**: React Native 0.86 with Expo SDK 57
* **Router**: Expo Router (File-based navigation)
* **Language**: TypeScript (Strict Mode)
* **State Management**: Zustand
* **API Client**: Axios with Bearer token interceptor
* **Icons**: Lucide React Native
* **Theme**: OLED Dark Canvas (`#0B0C0E`) + Electric Lime (`#CCFF00`)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Expo Development Server
```bash
npm run start
```

### 3. Run on Mobile Device
* Install **Expo Go** from App Store / Google Play.
* Scan the QR code in the terminal.

---

## 📚 Phase Documentation
* [Phase 1: Electric Lime & OLED Dark Theme](file:///home/lakshay-yadav/JOB-TRACKER-APP/Phases/PHASE_1.md)
* [Phase 2: TypeScript Data Contracts & Axios](file:///home/lakshay-yadav/JOB-TRACKER-APP/Phases/PHASE_2.md)
* [Phase 3: Authentication & Session Gate](file:///home/lakshay-yadav/JOB-TRACKER-APP/Phases/PHASE_3.md)
* [Phase 4: Executive Dashboard & Metrics](file:///home/lakshay-yadav/JOB-TRACKER-APP/Phases/PHASE_4.md)
* [Phase 5: Applications Pipeline & Stage Switcher](file:///home/lakshay-yadav/JOB-TRACKER-APP/Phases/PHASE_5.md)
* [Phase 6: Application Details & Modal Editors](file:///home/lakshay-yadav/JOB-TRACKER-APP/Phases/PHASE_6.md)
* [Phase 7: Interview & Follow-up Timeline](file:///home/lakshay-yadav/JOB-TRACKER-APP/Phases/PHASE_7.md)
* [Phase 8: Saved Jobs & 1-Tap Convert](file:///home/lakshay-yadav/JOB-TRACKER-APP/Phases/PHASE_8.md)
* [Phase 9: Platform Conversion Analytics](file:///home/lakshay-yadav/JOB-TRACKER-APP/Phases/PHASE_9.md)
* [Phase 10: Production Hardening & Deployment](file:///home/lakshay-yadav/JOB-TRACKER-APP/Phases/PHASE_10.md)
* [Senior Mobile Interview Defense Guide](file:///home/lakshay-yadav/JOB-TRACKER-APP/Phases/INTERVIEW_PREP.md)
