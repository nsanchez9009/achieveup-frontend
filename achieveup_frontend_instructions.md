# AchieveUp Frontend Development Instructions

## Overview

This document provides detailed instructions for developing the frontend components for the AchieveUp micro-credentialling system. The AchieveUp functionality has been integrated into the KnowGap backend and provides skill assessment, badge generation, and progress tracking capabilities.

## Backend API Endpoints

### 1. Skill Matrix Management

#### Create Skill Matrix
- **Endpoint**: `POST /achieveup/matrix/create`
- **Purpose**: Create a new skill matrix for a course
- **Request Body**:
```json
{
  "course_id": "string",
  "matrix_name": "string",
  "skills": ["skill1", "skill2", "skill3"]
}
```
- **Response**: Created matrix data with ID

#### Get Skill Matrix
- **Endpoint**: `GET /achieveup/matrix/{matrix_id}`
- **Purpose**: Retrieve a specific skill matrix
- **Response**: Matrix data including skills and metadata

#### Update Skill Matrix
- **Endpoint**: `PUT /achieveup/matrix/{matrix_id}`
- **Purpose**: Update skills in an existing matrix
- **Request Body**:
```json
{
  "skills": ["updated_skill1", "updated_skill2"]
}
```

### 2. Skill Assignment

#### Assign Skills to Questions
- **Endpoint**: `POST /achieveup/skills/assign`
- **Purpose**: Assign skills to quiz questions
- **Request Body**:
```json
{
  "course_id": "string",
  "question_skills": {
    "question_id_1": ["skill1", "skill2"],
    "question_id_2": ["skill3"]
  }
}
```

#### Get Skill Suggestions
- **Endpoint**: `POST /achieveup/skills/suggest`
- **Purpose**: Get AI-powered skill suggestions for questions
- **Request Body**:
```json
{
  "question_text": "string",
  "course_context": "string (optional)"
}
```
- **Response**: Array of suggested skills

### 3. Badge Management

#### Generate Badges
- **Endpoint**: `POST /achieveup/badges/generate`
- **Purpose**: Generate badges for student achievements
- **Request Body**:
```json
{
  "student_id": "string",
  "course_id": "string",
  "skill_levels": {
    "skill_name": "beginner|intermediate|advanced"
  }
}
```

#### Get Student Badges
- **Endpoint**: `GET /achieveup/badges/{student_id}`
- **Purpose**: Retrieve all badges for a student
- **Response**: Array of badge objects

### 4. Progress Tracking

#### Get Skill Progress
- **Endpoint**: `GET /achieveup/progress/{student_id}/{course_id}`
- **Purpose**: Get current skill progress for a student
- **Response**: Skill progress data with scores and levels

#### Update Skill Progress
- **Endpoint**: `POST /achieveup/progress/update`
- **Purpose**: Update skill assessment for a student
- **Request Body**:
```json
{
  "student_id": "string",
  "course_id": "string",
  "skill_updates": {
    "skill_name": {
      "score": 85,
      "notes": "string (optional)"
    }
  }
}
```

### 5. Analytics and Visualization

#### Get Individual Graphs
- **Endpoint**: `GET /achieveup/graphs/individual/{student_id}`
- **Purpose**: Generate individual skill graphs for a student
- **Response**: Graph data for all courses

#### Export Course Data
- **Endpoint**: `GET /achieveup/export/{course_id}`
- **Purpose**: Export all AchieveUp data for a course
- **Response**: Complete course data including matrices, badges, and progress

#### Import Course Data
- **Endpoint**: `POST /achieveup/import`
- **Purpose**: Import AchieveUp data for a course
- **Request Body**:
```json
{
  "course_id": "string",
  "data": {
    "skill_matrices": [...],
    "badges": [...],
    "skill_progress": [...]
  }
}
```

## Frontend Components to Develop

### 1. Skill Matrix Creator

**Purpose**: Allow instructors to create and manage skill matrices for their courses.

**Features**:
- Form to input course ID and matrix name
- Dynamic skill input with add/remove functionality
- Preview of the skill matrix
- Save and edit existing matrices
- Validation for required fields

**UI Elements**:
- Course selection dropdown
- Matrix name input field
- Skill list with add/remove buttons
- Save/Cancel buttons
- Success/error notifications

**Component Structure**:
```javascript
// SkillMatrixCreator.js
- CourseSelector
- MatrixNameInput
- SkillList (with SkillItem components)
- SaveButton
- NotificationSystem
```

### 2. Skill Assignment Interface

**Purpose**: Allow instructors to assign skills to quiz questions.

**Features**:
- Display all questions for a selected course
- Skill suggestion system using AI
- Manual skill assignment
- Bulk assignment options
- Preview of assignments

**UI Elements**:
- Course and quiz selection dropdowns
- Question list with skill assignment interface
- AI suggestion panel
- Bulk assignment controls
- Assignment preview

**Component Structure**:
```javascript
// SkillAssignmentInterface.js
- CourseQuizSelector
- QuestionList (with QuestionItem components)
- SkillSuggestionPanel
- BulkAssignmentControls
- AssignmentPreview
```

### 3. Badge Display System

**Purpose**: Show earned badges to students and instructors.

**Features**:
- Visual badge display with animations
- Badge details and criteria
- Progress towards next badge
- Badge history and timeline
- Share badges functionality

**UI Elements**:
- Badge grid or list view
- Badge detail modal
- Progress indicators
- Timeline view
- Share buttons

**Component Structure**:
```javascript
// BadgeDisplaySystem.js
- BadgeGrid (with BadgeCard components)
- BadgeDetailModal
- ProgressIndicator
- BadgeTimeline
- ShareButtons
```

### 4. Progress Dashboard

**Purpose**: Show skill progress and analytics for students and instructors.

**Features**:
- Individual student progress view
- Course-wide progress analytics
- Skill level indicators
- Progress charts and graphs
- Comparison tools

**UI Elements**:
- Progress charts (bar, line, radar)
- Skill level indicators
- Progress summary cards
- Filter and search options
- Export functionality

**Component Structure**:
```javascript
// ProgressDashboard.js
- ProgressCharts (with Chart components)
- SkillLevelIndicators
- ProgressSummaryCards
- FilterControls
- ExportButton
```

### 5. Analytics Dashboard

**Purpose**: Provide comprehensive analytics for instructors and administrators.

**Features**:
- Course-wide skill performance
- Student comparison tools
- Trend analysis
- Performance predictions
- Custom report generation

**UI Elements**:
- Analytics charts and graphs
- Comparison tables
- Trend indicators
- Report generator
- Data export options

**Component Structure**:
```javascript
// AnalyticsDashboard.js
- AnalyticsCharts (with various chart types)
- ComparisonTables
- TrendIndicators
- ReportGenerator
- ExportControls
```

## Data Models

### Skill Matrix
```javascript
{
  _id: "string",
  course_id: "string",
  matrix_name: "string",
  skills: ["skill1", "skill2", "skill3"],
  created_at: "datetime",
  updated_at: "datetime"
}
```

### Badge
```javascript
{
  _id: "string",
  student_id: "string",
  course_id: "string",
  skill: "string",
  badge_type: "skill_master|consistent_learner|quick_learner|persistent",
  description: "string",
  earned_at: "datetime",
  level: "beginner|intermediate|advanced"
}
```

### Skill Progress
```javascript
{
  student_id: "string",
  course_id: "string",
  skill_progress: {
    "skill_name": {
      score: "number",
      level: "beginner|intermediate|advanced",
      total_questions: "number",
      correct_answers: "number"
    }
  },
  last_updated: "datetime"
}
```

## UI/UX Guidelines

### Color Scheme
- **Primary**: Use existing KnowGap color scheme
- **Success**: Green (#28a745) for achievements and progress
- **Warning**: Orange (#ffc107) for intermediate levels
- **Info**: Blue (#17a2b8) for information and suggestions
- **Danger**: Red (#dc3545) for areas needing attention

### Badge Design
- Use SVG icons for scalability
- Implement hover effects and animations
- Show progress towards next badge level
- Include tooltips with badge criteria

### Progress Visualization
- Use consistent chart types across the application
- Implement responsive design for mobile devices
- Provide interactive elements for detailed views
- Include accessibility features (ARIA labels, keyboard navigation)

### Responsive Design
- Ensure all components work on desktop, tablet, and mobile
- Use flexbox or grid for layouts
- Implement touch-friendly interactions
- Test on various screen sizes

## Integration Points

### 1. Canvas Integration
- Use existing Canvas API integration
- Sync course and student data
- Maintain consistency with Canvas UI patterns

### 2. Existing KnowGap Features
- Integrate with video recommendation system
- Connect with risk prediction features
- Maintain consistent user experience

### 3. Authentication
- Use existing token-based authentication
- Implement role-based access control
- Ensure secure data transmission

## Testing Requirements

### Unit Testing
- Test all API calls and error handling
- Validate data transformations
- Test component rendering and interactions

### Integration Testing
- Test end-to-end workflows
- Validate data consistency
- Test error scenarios

### User Testing
- Conduct usability testing with instructors and students
- Gather feedback on interface design
- Test accessibility compliance

## Performance Considerations

### Data Loading
- Implement lazy loading for large datasets
- Use pagination for lists
- Cache frequently accessed data

### Real-time Updates
- Consider WebSocket implementation for live updates
- Implement optimistic UI updates
- Handle offline scenarios gracefully

### Optimization
- Minimize API calls through batching
- Implement efficient data structures
- Use memoization for expensive calculations

## Security Considerations

### Data Protection
- Validate all user inputs
- Sanitize data before display
- Implement proper error handling

### Access Control
- Verify user permissions for each action
- Implement proper session management
- Log security-relevant events

## Deployment Checklist

### Frontend
- [ ] Build and optimize for production
- [ ] Test all API integrations
- [ ] Validate responsive design
- [ ] Check accessibility compliance
- [ ] Update documentation

### Backend Integration
- [ ] Verify all endpoints are working
- [ ] Test error handling
- [ ] Validate data consistency
- [ ] Check performance under load

### User Experience
- [ ] Conduct user acceptance testing
- [ ] Gather feedback from stakeholders
- [ ] Implement final adjustments
- [ ] Prepare user documentation

## Support and Maintenance

### Monitoring
- Implement error tracking and logging
- Monitor API performance
- Track user engagement metrics

### Updates
- Plan for feature updates and improvements
- Maintain backward compatibility
- Provide migration paths for data changes

### Documentation
- Keep API documentation updated
- Maintain user guides and tutorials
- Document known issues and workarounds 