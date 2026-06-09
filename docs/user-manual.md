# User Manual

## Student Guide

### 1. Registration & Login

1. Open the application in your browser.
2. On the login page, click **"Don't have an account?"** to switch to registration.
3. Fill in your first name, last name, email address, and password (at least 8 characters).
4. Click **"Create Account"**.
5. If SMTP is configured, check your email for a verification link.
6. Log in with your email and password.
7. Optionally check **"Remember me"** to stay logged in for 30 days.

### 2. Dashboard

After logging in, you see the student dashboard:

- **Assessments Taken**: Shows how many assessments you've completed and days since your last one.
- **Cooldown Timer**: If you recently took an assessment, a countdown shows when you can retake it (typically 30 days).
- **Top Programs**: Displays the top recommended programs from your latest assessment.
- **Saved Programs**: Quick access to programs you've favorited.
- **Today's Career Tip**: Random career advice displayed each day.
- **Quick Personality Quiz**: A short quiz to get instant personality-based recommendations.
- **Assessment Consistency**: For repeat assessments, shows how your results compare over time.

### 3. Taking the Assessment

Click **"Start Assessment"** on the dashboard or **"Retake Assessment"** if you've already completed one.

The assessment has **7 steps**:

| Step | What You Provide | Purpose |
|------|-----------------|---------|
| 1. Welcome | Your school name (optional) | Identifies your background |
| 2. SHS Strand | Your senior high school strand | Determines strand compatibility |
| 3. Grades | Subject grades + GWA | Calculates academic match |
| 4. SUAST Exam | Exam tier achieved | Evaluates aptitude alignment |
| 5. Personality | Rate 24 activities (1-5) | Determines Holland Code (RIASEC) |
| 6. Interests | Rate career areas | Measures interest alignment |
| 7. Skills | Self-assessed skill levels | Measures skill alignment |

**Navigation tips:**
- Use **Back** and **Next** to move between steps.
- Your progress is **auto-saved** every 30 seconds.
- If you leave mid-assessment, you'll be prompted to **Resume** or **Start Over** next time.
- A progress bar at the top shows your completion percentage.

### 4. Understanding Your Results

After completing all 7 steps, you'll see a ranked list of recommended programs:

- **Overall Match Score** (0–100): Composite score based on all three dimensions.
- **Breakdown**:
  - **Academic**: How well your strand and GWA match program requirements.
  - **SUAST**: How your exam tier aligns with program expectations.
  - **Personal Fit**: Combined Holland Code + interests + skills match.
- **Admission Chance**: Estimated probability of acceptance.

For each program, you can:

- **Compare**: Select multiple programs and view a side-by-side comparison table.
- **Simulate**: Adjust your grades or SUAST tier to see how scores change.
- **Favorite**: Save programs for quick access later.
- **Share**: Copy a summary of your results to share with others.
- **Download PDF**: Generate a printable PDF report of your results.

### 5. Browsing Programs

Use the sidebar to access **Programs** (program browser):

- Browse all programs by college (FCJE, FNAHS, FTED, FALS, FBM)
- Search by program name or code
- View program details including admission requirements

### 6. Career Explorer

The **Careers** page lets you explore career paths associated with each program. See what professions graduates typically pursue.

### 7. History & Profile

- **History**: View all your past assessments and see how your recommendations changed over time.
- **Profile**: Update your name, email, and password. Upload a profile picture.

### 8. AI Career Assistant

Click the chat bubble icon in the bottom-right corner to ask career-related questions. The AI assistant can help clarify program requirements, career paths, and assessment results.

### 9. Language Selection

Click the language selector in the sidebar to switch between **English**, **Tagalog**, and **Cebuano**. The entire interface updates to your chosen language.

### 10. Notifications

The bell icon in the sidebar shows unread notifications for achievements, reminders, and system announcements.

---

## Staff Guide (Admin / Counselor)

### Accessing Admin Features

Staff users see additional navigation items in the sidebar: **Settings**, **Questions**, **Review**, **Admin**.

### 1. Admin Dashboard

The admin analytics dashboard provides:

- **KPI Summary**: Total users, assessments today, new this week, active this month.
- **Date Range Filter**: Filter analytics by month range.
- **User Growth Chart**: Monthly registration trends.
- **Program Popularity**: Which programs are most frequently recommended.
- **Completion Rate**: Percentage of users who complete the assessment.
- **Strand Distribution**: Breakdown of SHS strands among users.
- **Export CSV**: Download chart data for reporting.

### 2. User Management

The **Users** tab lets you:

- Search users by name or email.
- View user details (name, email, role, assessment count).
- **Edit**: Change name, email, and role (user, counselor, department_head, admin, super_admin).
- **Delete**: Permanently remove a user account.
- **Reset Cooldown**: Allow a student to retake the assessment immediately.

### 3. Program Management

The **Programs** page lets you:

- **Add**: Create a new program with code, name, description, college, and requirements.
- **Edit**: Modify any program's details.
- **Delete**: Remove a program.
- **Toggle**: Activate or deactivate programs without deleting them (inactive programs won't appear in recommendations).

### 4. Question Customization

The **Questions** page lets you customize assessment questions:

- Add new questions to any assessment step.
- Edit existing question text and options.
- Reorder questions by sort order.
- Toggle questions on/off.
- Delete questions.

### 5. Review (Counselor)

The **Review** page displays student assessments for counselors to:

- View assessment details and results.
- Add notes and set review status (pending/reviewed).
- Track which students have been counseled.

### 6. Settings

Configure the scoring algorithm weights:

- **Academic Weight**: Importance of grades and strand (default: 0.45).
- **SUAST Weight**: Importance of exam results (default: 0.30).
- **Personal Fit Weight**: Importance of personality + interests + skills (default: 0.25).
- **Sub-weights**: Holland match (0.50), Interest match (0.30), Skills match (0.20).
- **Results Count**: Number of program recommendations to show (default: 10).

---

## Keyboard Navigation

- **Tab**: Move between form fields.
- **Enter**: Submit forms.
- **Escape**: Close modals and popups.
- **Sidebar Toggle**: Hamburger button in the top-left corner (mobile).

---

## Tour (Onboarding)

First-time users see an interactive tour highlighting key features. The tour also re-appears when major updates are released (version check). Staff see a separate tour highlighting admin features.
