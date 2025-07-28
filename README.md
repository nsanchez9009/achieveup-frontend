# AchieveUp Instructor Portal

A modern React TypeScript frontend for the AchieveUp skill tracking system, designed specifically for instructors to manage courses, track student progress, and assign skills to assessment questions.

## 🎯 Features

### **Core Functionality**
- **Course Selection**: Integrated with Canvas LMS for seamless course management
- **AI-Powered Skill Matrix Creation**: Get intelligent skill suggestions based on course content
- **Zero-Shot Classification**: Automatically assign skills to quiz questions using AI
- **Student Progress Tracking**: Monitor individual student skill development
- **Analytics Dashboard**: Comprehensive instructor analytics and visualizations

### **AI-Driven Workflow**
1. **Select Course** → Choose from Canvas instructor courses
2. **AI Skill Suggestions** → Get relevant skills suggested by AI based on course content
3. **Skill Customization** → Edit, add, or remove skills as needed
4. **Question Analysis** → AI analyzes quiz questions for complexity and skill mapping
5. **Zero-Shot Classification** → Automatically assign skills to questions
6. **Progress Tracking** → Track student mastery of assigned skills

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with UCF branding
- **State Management**: React Context API
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Deployment**: Netlify

## 🏗️ Project Structure

```
src/
├── components/
│   ├── AnalyticsDashboard/     # Instructor analytics
│   ├── Layout/                 # Navigation and layout
│   ├── SkillAssignmentInterface/ # AI skill assignment
│   ├── SkillMatrixCreator/     # AI-powered skill matrix creation
│   └── common/                 # Reusable UI components
├── contexts/
│   └── AuthContext.tsx         # Authentication (instructor-only)
├── pages/
│   ├── Dashboard.tsx           # Instructor dashboard
│   ├── Login.tsx               # Instructor login
│   ├── Settings.tsx            # Canvas token management
│   └── Signup.tsx              # Instructor registration
├── services/
│   └── api.ts                  # Backend API integration
└── types/
    └── index.ts                # TypeScript definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16 or higher
- Canvas LMS instructor account
- Canvas API token

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd achieveup-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file:
   ```env
   REACT_APP_API_URL=https://your-backend-url.herokuapp.com
   REACT_APP_ENVIRONMENT=development
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔐 Authentication

This application is **instructor-only**. Users must:
- Have a Canvas LMS instructor account
- Provide a valid Canvas instructor API token
- Be authenticated as an instructor role

## 🎨 UI/UX Features

- **UCF Branding**: Black, gold, grey, and white color scheme
- **Responsive Design**: Works on all screen sizes
- **Modern Interface**: Clean, professional instructor-focused design
- **Real-time Feedback**: Loading states and toast notifications
- **Accessibility**: WCAG compliant design

## 📊 AI Integration

All AI functionality is handled by the backend:

- **Skill Suggestions**: `/achieveup/ai/suggest-skills`
- **Question Analysis**: `/achieveup/ai/analyze-questions`
- **Bulk Assignment**: `/achieveup/ai/bulk-assign`

The frontend provides the interface while the backend handles:
- NLP/ML processing
- Zero-shot classification
- Question complexity analysis
- Skill mapping algorithms

## 🚀 Deployment

### Netlify Configuration
The project includes automatic Netlify deployment:

```toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  REACT_APP_API_URL = "https://your-backend-url.herokuapp.com"
  REACT_APP_ENVIRONMENT = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_ENVIRONMENT`: Environment (development/production)

## 🔗 Backend Integration

This frontend requires a compatible backend that provides:

1. **Authentication Endpoints**
   - JWT-based instructor authentication
   - Canvas token validation

2. **Canvas Integration**
   - Course data retrieval
   - Quiz and question management

3. **AI Services**
   - Skill suggestion algorithms
   - Question analysis and classification
   - Bulk assignment operations

4. **Data Management**
   - Skill matrix storage
   - Progress tracking
   - Analytics data

See `backend-requirements.txt` for detailed implementation requirements.

## 📈 Performance

- **Optimized Build**: Code splitting and bundle optimization
- **Efficient Rendering**: React optimization patterns
- **Caching**: Strategic API response caching
- **Loading States**: Professional loading indicators

## 🧪 Development

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Consistent component patterns

### Architecture
- Component-based architecture
- Context for state management
- Custom hooks for logic reuse
- Service layer for API calls

## 📞 Support

For questions about:
- **Frontend Issues**: Check component documentation
- **Backend Integration**: See backend requirements
- **Canvas Setup**: Refer to Canvas API documentation

---

**AchieveUp Instructor Portal** - AI-Powered Skill Tracking for Educators 