# AchieveUp Frontend

A modern React/TypeScript frontend for the AchieveUp micro-credentialing system, featuring skill-based learning, badge generation, and comprehensive analytics. This frontend has been enhanced with all functionality from the original AchieveUp AI repository.

## 🚀 Features

### **Core Functionality**
- **Skill Matrix Management**: Create and manage comprehensive skill matrices with templates
- **Badge System**: Generate and track skill-based badges with progress indicators
- **Skill Assignment**: Assign skills to quiz questions with AI-powered suggestions
- **Progress Tracking**: Monitor student progress across skills and courses
- **Analytics Dashboard**: Comprehensive analytics and visualization
- **Canvas Integration**: Seamless integration with Canvas LMS

### **Enhanced Features (Ported from Original AchieveUp AI)**
- **Advanced Badge Display**: Earned/unearned status, progress tracking, filtering, export/import
- **Skill Matrix Templates**: Pre-built templates for Web Development, Data Science, Software Engineering
- **Question Analysis**: AI-powered complexity assessment and skill suggestions
- **Bulk Operations**: Mass skill assignment and auto-assignment features
- **Advanced Filtering**: Search, filter, and organize data efficiently
- **Import/Export**: Full data portability with JSON export/import

### **Instructor Features**
- **Instructor Token Support**: Differentiated student vs instructor Canvas tokens
- **Course Management**: Full course and quiz management capabilities
- **Advanced Analytics**: Detailed analytics for instructor courses
- **Bulk Operations**: Efficient management of large datasets

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with UCF branding
- **State Management**: React Context API
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Build Tool**: Vite
- **Deployment**: Netlify

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/nsanchez9009/achieveup-frontend.git
cd achieveup-frontend

# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Start development server
npm start
```

### Environment Variables
Create a `.env` file with the following variables:
```env
REACT_APP_API_URL=https://gen-ai-prime-3ddeabb35bd7.herokuapp.com
REACT_APP_CANVAS_URL=https://canvas.instructure.com
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── AnalyticsDashboard/     # Analytics and visualization
│   ├── BadgeDisplaySystem/     # Badge management and display
│   ├── common/                 # Reusable UI components
│   ├── Layout/                 # Navigation and layout
│   ├── ProgressDashboard/      # Progress tracking
│   ├── SkillAssignmentInterface/ # Skill assignment to questions
│   └── SkillMatrixCreator/     # Skill matrix creation
├── contexts/
│   └── AuthContext.tsx         # Authentication state management
├── pages/
│   ├── Dashboard.tsx           # Main dashboard
│   ├── Login.tsx               # Login page
│   ├── Settings.tsx            # User settings and Canvas token
│   └── Signup.tsx              # Registration page
├── services/
│   └── api.ts                  # API service functions
└── types/
    └── index.ts                # TypeScript type definitions
```

## 🎯 Key Components

### **Badge Display System**
Enhanced badge management with features from the original `Make_badges.py`:
- **Badge Generation**: Create badges based on skill levels
- **Progress Tracking**: Visual progress indicators for unearned badges
- **Filtering**: Filter by skill, level, and earned status
- **Export/Import**: JSON export and import functionality
- **Statistics**: Completion rates and earned badge counts

### **Skill Matrix Creator**
Advanced matrix creation with features from `MatrixMakerGUI_*.py`:
- **Templates**: Pre-built templates for common skill sets
- **Categorization**: Organize skills by category (Frontend, Backend, etc.)
- **Weighting**: Assign importance levels to skills
- **Import/Export**: Matrix template management
- **Advanced Properties**: Skill dependencies and descriptions

### **Skill Assignment Interface**
Comprehensive skill assignment with features from `SkillAssignerGUI.py`:
- **Question Analysis**: Automatic complexity assessment
- **Bulk Operations**: Assign skills to multiple questions
- **AI Suggestions**: Context-aware skill recommendations
- **Advanced Filtering**: Search and filter questions
- **Statistics**: Assignment metrics and progress tracking

### **Analytics Dashboard**
Data visualization and analytics from `individual_graphs.py`:
- **Progress Visualization**: Skill progress over time
- **Performance Tracking**: Individual vs cohort comparisons
- **Badge Analytics**: Badge earning patterns
- **Completion Statistics**: Course and skill completion metrics

## 🔐 Authentication & Canvas Integration

### **User Authentication**
- JWT-based authentication
- Secure token storage
- Automatic token refresh
- Role-based access control

### **Canvas Integration**
- **Student Tokens**: Access to enrolled courses
- **Instructor Tokens**: Full course management capabilities
- **Token Validation**: Secure token validation with Canvas API
- **Course Data**: Real-time course and quiz data

### **Token Management**
- **Token Type Selection**: Choose between student and instructor tokens
- **Secure Storage**: Encrypted token storage
- **Token Validation**: Real-time validation with Canvas
- **Token Status**: Visual indicators for token status

## 🎨 UI/UX Features

### **Design System**
- **UCF Branding**: Black, bright gold, grey, and white color scheme
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: WCAG compliant design
- **Modern UI**: Clean, professional interface

### **User Experience**
- **Loading States**: Professional loading indicators
- **Error Handling**: Graceful error handling with user feedback
- **Real-time Updates**: Live progress and status updates
- **Keyboard Navigation**: Full keyboard accessibility

## 📊 Data Management

### **Import/Export Features**
- **JSON Export**: Export all data types (badges, matrices, assignments)
- **JSON Import**: Import data from external sources
- **Data Validation**: Automatic data validation on import
- **Backup/Restore**: Complete data backup and restore functionality

### **Bulk Operations**
- **Mass Assignment**: Assign skills to multiple questions
- **Template Loading**: Load pre-built skill matrices
- **Auto-Assignment**: Automatically assign suggested skills
- **Batch Processing**: Efficient handling of large datasets

## 🔧 Development

### **Available Scripts**
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run type-check
```

### **Code Quality**
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit validation

## 🚀 Deployment

### **Netlify Deployment**
The project is configured for automatic deployment on Netlify:
- **Build Command**: `npm run build`
- **Publish Directory**: `build`
- **Environment Variables**: Configured in Netlify dashboard

### **Environment Configuration**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🔗 Backend Integration

### **API Endpoints**
The frontend integrates with the AchieveUp backend API:
- **Authentication**: JWT-based auth with Canvas integration
- **Canvas API**: Course and quiz data retrieval
- **AchieveUp API**: Skill matrices, badges, and progress tracking
- **Analytics API**: Data visualization and reporting

### **Backend Requirements**
See `backend_compatibility_instructions.txt` for detailed backend requirements and implementation guide.

## 📈 Performance

### **Optimizations**
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Optimized build output
- **Caching**: Efficient data caching strategies
- **Image Optimization**: Optimized image loading

### **Monitoring**
- **Error Tracking**: Comprehensive error monitoring
- **Performance Metrics**: Real-time performance tracking
- **User Analytics**: Usage analytics and insights

## 🤝 Contributing

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### **Code Standards**
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent code formatting
- Add proper error handling
- Include TypeScript types

## 📝 Testing

### **Test Coverage**
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API integration testing
- **E2E Tests**: End-to-end user flow testing
- **Accessibility Tests**: WCAG compliance testing

### **Running Tests**
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🐛 Troubleshooting

### **Common Issues**
- **Canvas Token Issues**: Ensure valid Canvas API token
- **Build Errors**: Check Node.js version and dependencies
- **API Errors**: Verify backend URL and connectivity
- **Styling Issues**: Clear browser cache and restart dev server

### **Debug Mode**
Enable debug mode by setting `REACT_APP_DEBUG=true` in your `.env` file.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Original AchieveUp AI**: Features ported from the [original AchieveUp AI repository](https://github.com/AwesomePaul100/AchieveUp/tree/AchieveUp-AI)
- **KnowGap Backend**: Integration with [KnowGap backend](https://github.com/AndresQ9/knowgap-backend) for Canvas data
- **UCF Branding**: University of Central Florida color scheme and branding
- **React Community**: Open source React ecosystem and tools

## 📞 Support

For support and questions:
- **Issues**: Create an issue on GitHub
- **Documentation**: Check the backend compatibility instructions
- **Backend Integration**: See `backend_compatibility_instructions.txt`

---

**Status**: ✅ Production Ready - All original AchieveUp AI features implemented and enhanced
**Last Updated**: December 2024 