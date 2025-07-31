# AchieveUp - AI-Powered Skill Tracking System

## 🎯 Vision & Overview

AchieveUp transforms traditional assessment into comprehensive skill tracking. Instead of just seeing grades, instructors get detailed insights into what specific skills each student has mastered and where they need support.

### Core Philosophy
- **Skills Over Scores**: Move beyond simple grades to track specific skill development
- **AI-Enhanced Teaching**: Use artificial intelligence to identify and map skills to assessments
- **Real-Time Insights**: Provide instructors with immediate feedback on student progress
- **Personalized Learning**: Enable targeted interventions based on skill gaps
- **Evidence-Based Education**: Create verifiable skill credentials for students

## 🏗️ Current Architecture

### Frontend (React + TypeScript)
- **Status**: ✅ Production Ready
- **URL**: https://achieveup-frontend.netlify.app
- **Tech Stack**: React 18, TypeScript, Tailwind CSS, React Hook Form, Axios
- **Deployment**: Netlify (automatic from GitHub)

### Backend (Node.js + Express)
- **Status**: ✅ Production Ready
- **URL**: https://gen-ai-prime-3ddeabb35bd7.herokuapp.com
- **Tech Stack**: Node.js, Express, MongoDB, JWT, Canvas API integration
- **Deployment**: Heroku

## 🚀 Current Features

### ✅ Implemented & Working

#### Authentication System
- Instructor-only authentication with Canvas token validation
- Optional Canvas token during signup (can be added later)
- Flexible role validation for users without Canvas tokens
- Secure JWT-based authentication

#### Instructor Dashboard
- Course overview with Canvas integration
- Student count with deterministic calculations
- Skill matrix management
- Recent activity tracking
- Workflow progress indicators

#### Skill Matrix Creation
- AI-powered skill suggestions based on course content
- Manual skill customization and editing
- Course-specific skill matrices
- Template-based skill generation

#### Skill Assignment Interface
- Canvas quiz and question integration
- AI-powered question analysis and skill mapping
- Bulk assignment operations
- Manual skill assignment with drag-and-drop
- Question complexity analysis

#### Student Progress Tracking
- Individual student skill breakdown
- Top 3 skills per student display
- Risk level assessment (low/medium/high)
- Detailed skill analytics with modal views
- Progress visualization and reporting

#### Settings & Configuration
- Canvas API token management
- Profile management
- Connection testing and validation
- Clear guidance for Canvas integration

## 🎯 Student View (Planned)

### Student Dashboard Features Needed
- **Individual Progress View**: Students see their own skill mastery levels
- **Skill Breakdown**: Detailed view of all skills with progress percentages
- **Achievement Badges**: Visual badges for skill milestones
- **Learning Path**: Recommended next steps for skill improvement
- **Assessment History**: Timeline of completed assessments and results

### Student Authentication
- **Canvas Student Integration**: Use Canvas student tokens
- **Student Role Validation**: Separate authentication for students
- **Course Enrollment**: Access only enrolled courses
- **Privacy Controls**: Students see only their own data

### Student Interface Components Needed
```typescript
// Student Dashboard Component
interface StudentDashboard {
  enrolledCourses: Course[];
  skillProgress: SkillProgress[];
  achievements: Badge[];
  learningRecommendations: string[];
}

// Student Progress View
interface StudentProgressView {
  courseId: string;
  skillBreakdown: SkillBreakdown[];
  assessmentHistory: Assessment[];
  improvementSuggestions: string[];
}
```

## 🔧 Backend Requirements for Student View

### New Endpoints Needed
```typescript
// Student Authentication
POST /auth/student/login
POST /auth/student/signup
GET /auth/student/me

// Student Data
GET /achieveup/student/{studentId}/courses
GET /achieveup/student/{studentId}/progress/{courseId}
GET /achieveup/student/{studentId}/achievements
GET /achieveup/student/{studentId}/recommendations

// Canvas Student Integration
GET /canvas/student/courses
GET /canvas/student/assessments/{courseId}
```

### Database Schema Updates
```sql
-- Student users table
CREATE TABLE student_users (
  id UUID PRIMARY KEY,
  canvas_student_id VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  canvas_token VARCHAR ENCRYPTED,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Student progress tracking
CREATE TABLE student_progress (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES student_users(id),
  course_id VARCHAR NOT NULL,
  skill_name VARCHAR NOT NULL,
  mastery_level ENUM('beginner', 'intermediate', 'advanced'),
  score DECIMAL(5,2),
  questions_attempted INTEGER,
  questions_correct INTEGER,
  last_updated TIMESTAMP DEFAULT NOW()
);
```

## 🎨 UI/UX Requirements for Student View

### Student Dashboard Design
- **Clean, Student-Friendly Interface**: Less technical than instructor view
- **Progress Visualization**: Charts and graphs showing skill development
- **Achievement Showcase**: Prominent display of earned badges
- **Mobile Responsive**: Optimized for student device usage
- **Accessibility**: WCAG compliant for all students

### Key Student Pages Needed
1. **Student Dashboard**: Overview of all courses and progress
2. **Course Progress**: Detailed view of skills for specific course
3. **Achievements**: Badge collection and milestone tracking
4. **Learning Path**: Recommended next steps and resources
5. **Assessment History**: Timeline of completed work

## 🔄 Workflow Integration

### Current Instructor Workflow
1. **Create Skill Matrix** → Define skills for course
2. **Assign Skills to Questions** → Map quiz questions to skills
3. **Students Complete Assessments** → Automatic progress tracking
4. **Monitor Progress** → View student skill development

### Planned Student Workflow
1. **Student Login** → Canvas student authentication
2. **View Progress** → See skill mastery levels
3. **Complete Assessments** → Normal Canvas quiz taking
4. **Track Growth** → Monitor skill development over time
5. **Earn Badges** → Achieve skill milestones

## 🧪 Testing Requirements

### Frontend Testing
- **Unit Tests**: All React components and hooks
- **Integration Tests**: Authentication and API integration
- **E2E Tests**: Complete user workflows
- **Accessibility Tests**: WCAG compliance verification

### Backend Testing
- **API Tests**: All endpoints and error handling
- **Canvas Integration Tests**: Token validation and data retrieval
- **AI Service Tests**: Skill suggestion and analysis accuracy
- **Performance Tests**: Load testing for multiple users

## 🚀 Deployment & Infrastructure

### Current Setup
- **Frontend**: Netlify (automatic deployment)
- **Backend**: Heroku (production ready)
- **Database**: MongoDB Atlas
- **CDN**: Netlify CDN for static assets

### Production Checklist
- [x] Frontend deployed and working
- [x] Backend deployed and working
- [x] Canvas integration functional
- [x] Authentication system complete
- [x] Basic instructor features working

### Remaining Infrastructure
- [ ] Student authentication system
- [ ] Student database schema
- [ ] Student API endpoints
- [ ] Student frontend components
- [ ] Mobile optimization
- [ ] Performance monitoring
- [ ] Error tracking and logging

## 📊 Analytics & Reporting

### Current Analytics
- **Instructor Analytics**: Course-wide student performance
- **Individual Student Views**: Detailed skill breakdowns
- **Progress Tracking**: Real-time skill development
- **Risk Assessment**: Student performance indicators

### Planned Analytics
- **Student Self-Analytics**: Individual progress insights
- **Learning Analytics**: Study pattern analysis
- **Predictive Analytics**: Skill mastery predictions
- **Comparative Analytics**: Class performance benchmarks

## 🔐 Security & Privacy

### Current Security
- **JWT Authentication**: Secure token-based auth
- **Canvas Token Encryption**: Encrypted storage of API tokens
- **Role-Based Access**: Instructor-only current access
- **HTTPS**: All communications encrypted

### Security Requirements for Student View
- **Student Data Privacy**: Students see only their own data
- **FERPA Compliance**: Educational data protection
- **Canvas Integration Security**: Secure student token handling
- **Data Encryption**: All sensitive data encrypted at rest

## 🎯 Next Steps & Roadmap

### Phase 1: Student Authentication (Week 1-2)
- [ ] Implement student authentication endpoints
- [ ] Create student user database schema
- [ ] Build student login/signup pages
- [ ] Test Canvas student token integration

### Phase 2: Student Dashboard (Week 3-4)
- [ ] Create student dashboard component
- [ ] Implement course enrollment display
- [ ] Build progress visualization components
- [ ] Add achievement/badge system

### Phase 3: Student Progress Views (Week 5-6)
- [ ] Individual course progress pages
- [ ] Skill breakdown visualizations
- [ ] Assessment history timeline
- [ ] Learning recommendations

### Phase 4: Mobile & Polish (Week 7-8)
- [ ] Mobile-responsive design
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Final testing and deployment

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Git

### Frontend Setup
```bash
git clone https://github.com/nsanchez9009/achieveup-frontend.git
cd achieveup-frontend
npm install
npm start
```

### Environment Variables
```env
REACT_APP_API_URL=https://gen-ai-prime-3ddeabb35bd7.herokuapp.com
REACT_APP_ENVIRONMENT=development
```

### Backend Setup
```bash
git clone https://github.com/AndresQ9/knowgap-backend.git
cd knowgap-backend
npm install
npm start
```

## 📞 Support & Contact

### Repository Links
- **Frontend**: https://github.com/nsanchez9009/achieveup-frontend
- **Backend**: https://github.com/AndresQ9/knowgap-backend
- **Live Demo**: https://achieveup-frontend.netlify.app

### Development Team
- **Frontend Developer**: Nico Sanchez
- **Backend Developer**: Andres Q
- **Project Lead**: UCF Senior Design Team

## 📝 License

This project is part of the UCF Senior Design program. All rights reserved.

---

**AchieveUp** - Transforming Assessment into Skill Tracking 🎯 