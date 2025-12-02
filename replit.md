# JobMatch - AI-Powered Job Matching App

## Overview
JobMatch is a mobile-first AI-powered job matching application built with React Native (Expo). It helps users find their perfect job by analyzing their resume or LinkedIn profile and providing personalized job recommendations with match scores.

## Current State
- **Phase**: Frontend Prototype (Design Phase Complete)
- **Status**: Functional mobile app with mock data
- **Platform**: Expo (React Native) for iOS, Android, and Web

## Features Implemented

### Core Functionality
- Resume upload via Document Picker (PDF support)
- LinkedIn profile URL input as alternative
- Job search with title and location
- AI-powered job matching with match percentages
- Skill analysis (matched and missing skills)
- How to improve suggestions

### Navigation Structure
```
Root (Tab Navigator)
├── Search Tab
│   ├── Search Screen (Home)
│   ├── Job Results Screen
│   └── Job Detail Screen (Modal)
├── My Jobs Tab
│   ├── My Jobs Screen (Saved/Applied tabs)
│   └── Job Detail Screen (Modal)
└── Profile Tab
    ├── Profile Screen
    ├── Resumes Screen
    └── Settings Screen
```

### UI Components
- JobCard - Displays job listing with match score
- MatchScoreBadge - Animated circular progress indicator
- SkillChip - Colored chips for matched/missing skills
- Button - Animated primary action button
- Themed components for consistent design

## Project Architecture

### File Structure
```
├── App.tsx                 # Root component with navigation
├── navigation/             # Navigation configuration
│   ├── MainTabNavigator.tsx
│   ├── SearchStackNavigator.tsx
│   ├── MyJobsStackNavigator.tsx
│   └── ProfileStackNavigator.tsx
├── screens/                # Screen components
│   ├── SearchScreen.tsx
│   ├── JobResultsScreen.tsx
│   ├── JobDetailScreen.tsx
│   ├── MyJobsScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── ResumesScreen.tsx
│   └── SettingsScreen.tsx
├── components/             # Reusable components
│   ├── JobCard.tsx
│   ├── MatchScoreBadge.tsx
│   ├── SkillChip.tsx
│   ├── Button.tsx
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   └── ...
├── constants/
│   └── theme.ts           # Design tokens
├── types/
│   └── job.ts             # TypeScript interfaces
├── data/
│   └── mockData.ts        # Mock data for prototype
└── hooks/                 # Custom hooks
```

## Design System

### Colors
- Primary: #2563EB (Blue)
- Success: #10B981 (Green) - 80%+ match
- Warning: #F59E0B (Orange) - 60-79% match
- Error: #EF4444 (Red) - <60% match

### Typography
- H1: 28px Bold
- H2: 22px Semibold
- H3: 18px Semibold
- Body: 16px Regular
- Small: 14px Regular
- Caption: 12px Regular

## Next Phase: Backend Development
The following backend features are planned:
1. Supabase authentication (email/password)
2. FastAPI backend for job matching
3. OpenAI integration for AI-powered analysis
4. Resume parsing with PyPDF
5. Real job data integration

## User Preferences
- Mobile-first design approach
- iOS 26 liquid glass interface design
- Clean, professional UI
- Haptic feedback on actions
- Swipe gestures for delete actions

## Recent Changes
- Initial frontend prototype completed
- All screens and navigation implemented
- Mock data for demonstration
- Animated components and interactions
