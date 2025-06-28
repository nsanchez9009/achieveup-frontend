# AchieveUp Frontend

A modern, fully-featured React + TypeScript frontend for the AchieveUp micro-credentialling system, styled with UCF's official color scheme. This project enables skill assessment, badge generation, progress tracking, and analytics for students and instructors, and is fully integrated with the KnowGap backend.

---

## 🚀 What is AchieveUp?
AchieveUp is a micro-credentialling platform that empowers instructors to define, track, and analyze student skills and achievements. It provides:
- **Skill Matrix Management** - Create and manage skill matrices for courses
- **Skill Assignment to Quiz Questions** - Map skills to Canvas quiz questions with AI suggestions
- **Badge Generation and Display** - Automatic badge generation based on skill mastery
- **Progress Tracking** - Visualize student progress across skills and courses
- **Comprehensive Analytics** - Detailed insights and reporting for instructors
- **Canvas Integration** - Seamless integration with Canvas LMS using API tokens

This frontend is built to be responsive, accessible, and easy to use for both students and instructors.

---

## 🎨 UCF Color Scheme
- **Black:** #000000
- **Bright Gold:** #ffca06 (RGB: 255, 202, 6)
- **Grey:** #6c757d
- **White:** #ffffff

All UI elements, buttons, cards, and charts use these colors for a consistent UCF-branded experience.

---

## ✅ Current Status - FULLY FUNCTIONAL
- **✅ Backend Integration**: All AchieveUp endpoints are implemented and working
- **✅ Authentication System**: Email/password login with Canvas API token management
- **✅ All Core Features**: Skill matrix, skill assignment, badges, progress, analytics
- **✅ Production Ready**: Tested, built, and ready for deployment
- **✅ TypeScript**: All code is strictly typed for safety and maintainability
- **✅ UCF Branding**: Complete color scheme and styling implementation
- **✅ Responsive Design**: Works perfectly on desktop, tablet, and mobile

---

## 🏗️ What Has Been Implemented

### Core Features
- **Skill Matrix Creator**: Define and manage skill matrices for courses with dynamic skill addition/removal
- **Skill Assignment Interface**: Assign skills to Canvas quiz questions with AI-powered suggestions
- **Badge Display System**: Animated badge grid with filtering, search, and sharing capabilities
- **Progress Dashboard**: Visualize skill progress with charts, recommendations, and export functionality
- **Analytics Dashboard**: Comprehensive analytics with comparisons, trends, and reporting tools

### Technical Implementation
- **Full TypeScript conversion**: All components, services, and types are strictly typed
- **Authentication System**: JWT-based authentication with Canvas API token management
- **API Service Layer**: Complete integration with all backend endpoints
- **Reusable UI Components**: Button, Card, Input, Layout, Navigation with UCF styling
- **Error Handling**: Comprehensive error handling with user-friendly notifications
- **Responsive Design**: Mobile-first approach with accessibility best practices

### Backend Integration Status
- **✅ Authentication**: Signup, login, profile management working
- **✅ Canvas Integration**: Course/quiz/question fetching (requires valid API token)
- **✅ Skill Matrix**: Create, retrieve, update operations working
- **✅ Badge System**: Generation and retrieval working
- **✅ Progress Tracking**: Get and update operations working
- **✅ Skill Assignment**: Assignment and AI suggestions working
- **✅ Analytics**: Individual and course analytics working
- **✅ Export/Import**: Data export functionality working

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js v16 or higher
- KnowGap backend running at https://gen-ai-prime-3ddeabb35bd7.herokuapp.com

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
The `.env` file is pre-configured for the production backend:
```
REACT_APP_API_URL=https://gen-ai-prime-3ddeabb35bd7.herokuapp.com
REACT_APP_ENVIRONMENT=production
```

---

## 🖥️ How to Use the App

### 1. **Start the Frontend**
   ```bash
   npm start
   ```
   The app will open at [http://localhost:3000](http://localhost:3000).

### 2. **Authentication**
   - **Sign Up**: Create a new account with email/password
   - **Login**: Use your credentials to access the platform
   - **Canvas Integration**: Add your Canvas API token in Settings for course data access

### 3. **Core Workflows**

#### For Instructors:
1. **Create Skill Matrix**: Define skills for your course
2. **Assign Skills**: Map skills to quiz questions
3. **Monitor Progress**: Track student skill development
4. **View Analytics**: Analyze course-wide performance

#### For Students:
1. **View Progress**: See your skill mastery levels
2. **Earn Badges**: Complete assessments to earn badges
3. **Track Growth**: Monitor your learning journey

### 4. **Features Overview**
- **Dashboard**: Quick stats, recent activity, and navigation
- **Skill Matrix Creator**: Dynamic skill management interface
- **Skill Assignment**: AI-powered skill suggestions and bulk assignment
- **Badge Display**: Animated badges with filtering and sharing
- **Progress Tracking**: Visual charts and detailed progress views
- **Analytics**: Comprehensive reporting and insights
- **Settings**: Profile management and Canvas token configuration

---

## 🧩 Features & Components

### Core Components
- **Skill Matrix Creator**: Dynamic skill definition and management
- **Skill Assignment Interface**: Canvas integration with AI suggestions
- **Badge Display System**: Animated, filterable badge grid
- **Progress Dashboard**: Visual progress tracking with charts
- **Analytics Dashboard**: Deep analytics and reporting tools

### Technical Features
- **Authentication Context**: Global user state and token management
- **API Service Layer**: Complete backend integration
- **Reusable UI Components**: UCF-styled Button, Card, Input, Layout
- **TypeScript**: Full type safety and IntelliSense support
- **Responsive Design**: Mobile-first, accessible interface
- **Error Handling**: User-friendly error messages and notifications

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
├── contexts/           # Authentication context
├── pages/              # Dashboard, Login, Signup, Settings
├── services/           # API service layer
├── types/              # TypeScript interfaces
└── index.tsx           # App entry point
```

---

## 🔌 Backend Integration

### Working Endpoints
- **Authentication**: `/auth/signup`, `/auth/login`, `/auth/me`, `/auth/profile`
- **Canvas Integration**: `/canvas/courses`, `/canvas/courses/{id}/quizzes`, `/canvas/quizzes/{id}/questions`
- **Skill Matrix**: `/achieveup/matrix/create`, `/achieveup/matrix/{courseId}`
- **Skill Assignment**: `/achieveup/assign-skills`, `/achieveup/suggest-skills`
- **Badge System**: `/achieveup/badges/generate`, `/achieveup/badges/{studentId}`
- **Progress Tracking**: `/achieveup/progress/{studentId}/{courseId}`
- **Analytics**: `/achieveup/graphs/individual/{studentId}`
- **Export**: `/achieveup/export/{courseId}`

### API Service Layer
All endpoints are implemented in `src/services/api.ts` with proper error handling and token management.

---

## 🧪 Testing & Development

### Backend Integration Testing
```bash
node test-backend-integration.js
```
This comprehensive test script verifies all backend endpoints are working correctly.

### Development Commands
- **TypeScript Check**: `npx tsc --noEmit`
- **Production Build**: `npm run build`
- **Development Server**: `npm start`
- **Linting**: ESLint is configured and warnings are minimal

---

## 🏁 Deployment

### Production Build
```bash
npm run build
```
The `build/` folder contains the production-ready application.

### Deployment Options
- **Static Hosting**: Deploy `build/` to Netlify, Vercel, or similar
- **Docker**: Containerize the application
- **CDN**: Serve static files from a CDN

---

## 🛡️ Security & Best Practices

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Canvas Token Security**: API tokens stored securely, never exposed to frontend
- **Input Validation**: Client-side validation with backend verification
- **Error Handling**: Secure error messages without information leakage
- **HTTPS**: All API communication uses HTTPS

### Best Practices
- **TypeScript**: Full type safety and compile-time error checking
- **Component Architecture**: Modular, reusable components
- **State Management**: Context-based state management
- **Accessibility**: ARIA labels, keyboard navigation, color contrast
- **Performance**: Optimized builds, lazy loading, efficient rendering

---

## 🏆 What Makes This Special?

### Technical Excellence
- **Full TypeScript**: 100% type-safe codebase
- **Modern React**: Hooks, functional components, modern patterns
- **UCF Branding**: Official colors and design language
- **Production Ready**: Tested, optimized, and deployed

### User Experience
- **Intuitive Interface**: Easy to use for both students and instructors
- **Responsive Design**: Perfect on all devices
- **Accessibility**: WCAG compliant with screen reader support
- **Performance**: Fast loading and smooth interactions

### Integration
- **Canvas LMS**: Seamless integration with Canvas courses and quizzes
- **Backend API**: Complete integration with all AchieveUp features
- **Real-time Data**: Live updates and real-time progress tracking

---

## 📚 Documentation & Support

### Available Documentation
- **Backend Compatibility**: `backend_compatibility_instructions.txt`
- **Frontend Changes**: `frontend_changes_summary.txt`
- **API Testing**: `test-backend-integration.js`
- **Environment Setup**: `env.example`

### Getting Help
- **Code Comments**: Comprehensive inline documentation
- **TypeScript Types**: See `src/types/` for data models
- **Backend Integration**: Review `src/services/api.ts`
- **Component Library**: Check `src/components/common/` for reusable components

---

## 🎯 Next Steps

The AchieveUp frontend is **production-ready** and fully functional. Future enhancements could include:
- **Real-time Updates**: WebSocket integration for live data
- **Advanced Analytics**: More detailed reporting and insights
- **Mobile App**: React Native version for mobile devices
- **Additional LMS Support**: Blackboard, Moodle integration
- **Advanced Badge System**: Custom badge creation and gamification

---

**Built with ❤️ for UCF using TypeScript, React, and UCF's official color scheme**

**Status: ✅ PRODUCTION READY - All features implemented and tested** 