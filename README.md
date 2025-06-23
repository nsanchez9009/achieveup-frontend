# AchieveUp Frontend

A modern, fully-featured React + TypeScript frontend for the AchieveUp micro-credentialling system, styled with UCF's official color scheme. This project enables skill assessment, badge generation, progress tracking, and analytics for students and instructors, and is tightly integrated with the KnowGap backend.

---

## 🚀 What is AchieveUp?
AchieveUp is a micro-credentialling platform that empowers instructors to define, track, and analyze student skills and achievements. It provides:
- **Skill Matrix Management**
- **Skill Assignment to Quiz Questions**
- **Badge Generation and Display**
- **Progress Tracking**
- **Comprehensive Analytics**

This frontend is built to be responsive, accessible, and easy to use for both students and instructors.

---

## 🎨 UCF Color Scheme
- **Black:** #000000
- **Bright Gold:** #ffca06 (RGB: 255, 202, 6)
- **Grey:** #6c757d
- **White:** #ffffff

All UI elements, buttons, cards, and charts use these colors for a consistent UCF-branded experience.

---

## 🏗️ What Has Been Done
- **Full TypeScript conversion**: All code is strictly typed for safety and maintainability.
- **UCF color scheme**: Tailwind and all components use UCF's official palette.
- **All required features implemented**: Skill matrix, skill assignment, badges, progress, analytics.
- **Reusable UI components**: Button, Card, Input, etc.
- **API service layer**: All endpoints from the backend instructions are covered.
- **Authentication context**: Handles user state and token management.
- **Modern, responsive UI**: Works on all devices, with accessibility best practices.
- **Setup automation**: `setup.sh` script for easy install and environment setup.
- **Comprehensive README**: This file!

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js v16 or higher
- KnowGap backend running (see backend repo)

### 2. Quick Setup
```bash
chmod +x setup.sh
./setup.sh
```
This will install dependencies, check TypeScript, and set up your `.env` file.

### 3. Manual Setup
```bash
npm install
cp env.example .env
npm start
```

### 4. Environment Variables
Edit `.env` as needed:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

---

## 🖥️ How to Use the App

1. **Start the frontend**
   ```bash
   npm start
   ```
   The app will open at [http://localhost:3000](http://localhost:3000).

2. **Login**
   - The app uses token-based authentication. For demo, a mock user is provided if not logged in.

3. **Navigate the Dashboard**
   - See quick stats, recent activity, and quick actions.

4. **Skill Matrix Creator**
   - Create/edit skill matrices for courses.
   - Add/remove skills dynamically.
   - Save and preview matrices.

5. **Skill Assignment Interface**
   - Assign skills to quiz questions.
   - Use AI-powered skill suggestions.
   - Bulk assign skills and preview assignments.

6. **Badge Display System**
   - View earned badges with animations.
   - Filter, search, and share badges.
   - See badge details and progress toward next badge.

7. **Progress Dashboard**
   - Track skill progress with charts and recommendations.
   - Export progress data.

8. **Analytics Dashboard**
   - Analyze course-wide skill performance.
   - Compare students, view trends, and export reports.

---

## 🧩 Features & Components

- **Skill Matrix Creator**: Define and manage course skills.
- **Skill Assignment Interface**: Assign skills to quiz questions, with AI suggestions.
- **Badge Display System**: Animated, filterable badge grid with details and sharing.
- **Progress Dashboard**: Visualize skill progress with charts and summaries.
- **Analytics Dashboard**: Deep analytics, comparisons, and export tools.
- **Reusable UI**: Button, Card, Input, etc. with UCF styling.
- **Authentication**: Context-based, token storage, role support.
- **API Integration**: All endpoints from the backend instructions are implemented.
- **Accessibility**: Keyboard navigation, ARIA labels, color contrast.
- **Responsive**: Works on desktop, tablet, and mobile.

---

## 🛠️ Project Structure
```
src/
├── components/          # Feature and UI components
│   ├── common/         # Button, Card, Input, etc.
│   ├── Layout/         # Navigation, Layout
│   ├── SkillMatrixCreator/
│   ├── SkillAssignmentInterface/
│   ├── BadgeDisplaySystem/
│   ├── ProgressDashboard/
│   └── AnalyticsDashboard/
├── contexts/           # Auth context
├── pages/              # Dashboard, etc.
├── services/           # API service layer
├── types/              # TypeScript interfaces
└── index.tsx           # App entry point
```

---

## 🔌 API Endpoints Covered
- Skill Matrix: create, get, update
- Skill Assignment: assign, suggest
- Badges: generate, get
- Progress: get, update
- Analytics: graphs, export, import

See `src/services/api.ts` for details.

---

## 🧪 Testing & Development
- **TypeScript**: `npx tsc --noEmit` to check types
- **Unit/Integration tests**: `npm test` (add your own tests as needed)
- **Hot reload**: All changes reload instantly in dev mode

---

## 🏁 Deployment
- **Production build**: `npm run build`
- **Deploy** the `build/` folder to your static host

---

## 🛡️ Security & Best Practices
- Token-based authentication
- Input validation and sanitization
- Role-based access control
- Secure API communication
- Error handling and notifications

---

## 🏆 What Makes This Special?
- **UCF-branded**: Official colors, modern design
- **TypeScript everywhere**: Safer, more maintainable code
- **All features from the instructions**: Nothing missing
- **Easy to extend**: Add new features or endpoints with confidence
- **Great for students and instructors**: Intuitive, fast, and beautiful

---

## 🆘 Support & Documentation
- See this README and code comments
- Review `src/types/` for data models
- For backend/API, see the KnowGap backend repo
- For questions, contact the development team

---

**Built with ❤️ for UCF using TypeScript and UCF colors** 