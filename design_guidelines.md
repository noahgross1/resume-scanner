# Design Guidelines: AI Job Matching App

## Core Architecture

### Authentication (Supabase)
- Email/password (primary), Apple Sign-In (iOS), Google Sign-In
- Flow: Onboarding → Login/Signup → Password Reset
- Session persistence via Supabase mobile SDK
- Include privacy policy & terms links on signup

### Navigation Structure
**Tab Navigator (4 tabs) + FAB:**
```
Root
├── Search Stack → Search Screen → Job Results → Job Detail (modal)
├── Jobs Stack → My Jobs → Job Detail (modal)
├── Profile Stack → Profile → Resume Management / Settings
└── Upload Resume Modal (triggered by FAB)
```

## Screen Layouts

### 1. Onboarding (First Launch Only)
- Swipeable carousel (3-4 slides), progress dots
- Skip (top-right), Next/Get Started (bottom)
- Safe area: bottom insets + 24px

### 2. Login/Signup
**Login:**
- Logo, Email, Password (show/hide toggle), Login button (full-width)
- Forgot password link, social buttons (Apple, Google)
- "Don't have account? Sign up" link
- Safe area: top/bottom insets + 24px

**Signup:** Same layout + Confirm Password, Terms/Privacy checkboxes

### 3. Search Screen (Tab 1)
- Transparent header "Find Jobs"
- Upload Resume button OR Paste LinkedIn URL input (tabs/segmented)
- Job title (autocomplete), Location (map icon, location services)
- Primary Search button (full-width)
- Recent searches (max 5 cards)
- Safe area: top headerHeight + 24px, bottom tabBar + 24px

### 4. Job Results
- Header: back button, filter icon (right), search query summary bar
- FlatList of job cards (optimized):
  - Company logo (48×48 circle), Job title (bold, 2 lines), Company, Location (pin icon)
  - Match % (color-coded: 80%+ green #10B981, 60-79% orange #F59E0B, <60% red #EF4444)
  - Chevron right
- Empty state: illustration + "No jobs found"

### 5. Job Detail (Modal)
- Full screen modal, custom header: Close (X, left), Save (heart, right)
- Scrollable sections: Title/Company/Location/Date, Match score (circular progress), Matched Skills (green chips), Missing Qualifications (orange chips), How to Improve (expandable), Description (collapsible)
- Sticky footer: "Apply Now" button (external link, shadow)
- Header: transparent → opaque on scroll

### 6. My Jobs (Tab 2)
- Transparent header "My Jobs"
- Segmented control: Saved | Applied
- Job cards (same as Results), empty states per tab

### 7. Profile (Tab 3)
- Transparent header "Profile"
- Avatar (80×80 circle, editable), Name (editable), Email (secondary)
- Menu: My Resumes, Settings, Help & Support, Log Out (red, confirmation alert)

### 8. Resume Management
- Header: "My Resumes" + back, add icon (right)
- Resume cards: filename, date, size, delete (swipe action)
- Add resume button (full-width, bottom)

### 9. Upload Resume Modal
- Centered (80% width/height), blur background
- Header: "Add Profile" + close
- Two options (cards): Upload Resume (PDF icon, DocumentPicker), Paste LinkedIn URL (text input)
- Cancel button

## Design System

### Colors
**Primary:** #2563EB (actions), #1D4ED8 (pressed)  
**Semantic:** Success #10B981, Warning #F59E0B, Error #EF4444  
**Neutrals:** Background #FFFFFF, Surface #F9FAFB, Border #E5E7EB, Text #111827/#6B7280/#9CA3AF  
**Overlay:** rgba(0,0,0,0.5)

### Typography (System: SF/Roboto)
- Title Large: 28px Bold | Title: 22px Semibold | Headline: 18px Semibold
- Body: 16px Regular | Body Small: 14px | Caption: 12px

### Spacing
xs:4px, sm:8px, md:12px, lg:16px, xl:24px, 2xl:32px

### Border Radius
Small:8px (inputs/tags), Medium:12px (cards), Large:16px (modals), Full:999px (avatars/FAB)

### Components

**Job Card:** White bg, 1px Border, Medium radius, lg padding, Press → Surface bg

**Match Score Badge:** Circular progress (120×120), Title Bold, color-coded bg

**Skill Chip:** Small radius, sm/md padding, Matched (light green bg/dark green text), Missing (light orange/dark orange)

**FAB (56×56):** Primary bg, white upload icon (24×24), bottom-right 16px  
**Shadow (REQUIRED):** shadowOffset {width:0,height:2}, shadowOpacity:0.10, shadowRadius:2, elevation:4, Press → scale 0.95

**Primary Button:** 48px height, Medium radius, Primary bg, white Semibold text, Press → Primary Dark

**Input:** 48px height, 1px Border, Small radius, md padding, Focus → 2px Primary border

### Icons
Feather icons: 24×24 (toolbar), 20×20 (inline), Text Secondary (default), Primary (active)

### Accessibility
- 44×44pt min touch targets
- 4.5:1 text contrast ratio
- Screen reader labels for all interactive elements
- Form labels + error states
- Keyboard focus indicators
- Haptic feedback (resume upload, job save, FAB press)

## Assets & Interactions

**Assets Needed:**
- 3 preset avatars (geometric, professional)
- Empty state illustrations (no jobs/saved jobs/resumes)
- App icon, splash screen
- Company logo fallback (colored circle with first letter)
- PDF icon

**Interactions:**
- Pull-to-refresh on job lists
- Swipe-to-delete on resume cards
- Skeleton loaders (3-5 cards) during AI matching
- Progress indicator (resume upload)
- Success toasts (save/apply)
- Confirmation alerts (delete, logout)
- Native stack transitions
- Haptic feedback on critical actions

## Implementation Notes
- All safe areas account for device insets + specified spacing
- Transparent headers become opaque on scroll where noted
- FlatList optimization for job lists (windowSize, removeClippedSubviews)
- Color-coded match scores use exact hex values
- FAB positioned absolute, z-index above tab bar
- Modals use blur backdrop with 0.5 opacity