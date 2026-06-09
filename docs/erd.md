# Entity Relationship Diagram (ERD)

## Database Schema

```mermaid
erDiagram
    users {
        id TEXT PK "Primary Key"
        email TEXT UK "Unique"
        last_name TEXT
        first_name TEXT
        middle_initial TEXT
        extension_name TEXT
        password TEXT "bcrypt hash"
        avatar TEXT
        role TEXT "user | counselor | department_head | admin | super_admin"
        email_verified BOOLEAN
        created_at TIMESTAMPTZ
        updated_at TIMESTAMPTZ
    }

    assessments {
        id TEXT PK
        user_id TEXT FK "References users.id"
        strand TEXT
        gwa REAL
        holland_code TEXT
        top_programs TEXT "JSON array of program codes"
        full_data JSONB "Complete assessment snapshot"
        created_at TIMESTAMPTZ
    }

    assessment_progress {
        user_id TEXT PK FK "References users.id"
        step INTEGER
        data JSONB "Partial assessment data"
        updated_at TIMESTAMPTZ
    }

    assessment_questions {
        id TEXT PK
        step TEXT "Strand | Grades | SUAST | Holland | Interest | Skills"
        question_key TEXT
        question_text TEXT
        question_type TEXT "text | select | rating"
        options JSONB
        sort_order INTEGER
        active BOOLEAN
        created_at TIMESTAMPTZ
    }

    counselor_notes {
        id TEXT PK
        assessment_id TEXT FK "References assessments.id"
        counselor_id TEXT FK "References users.id"
        notes TEXT
        status TEXT "pending | reviewed"
        created_at TIMESTAMPTZ
        updated_at TIMESTAMPTZ
    }

    user_favorites {
        id TEXT PK
        user_id TEXT FK "References users.id"
        program_code TEXT
        created_at TIMESTAMPTZ
    }

    notifications {
        id TEXT PK
        user_id TEXT FK "References users.id"
        type TEXT "info | achievement | reminder"
        title TEXT
        body TEXT
        link TEXT
        is_read BOOLEAN
        created_at TIMESTAMPTZ
    }

    achievements {
        id TEXT PK
        key TEXT UK "Unique achievement identifier"
        name TEXT
        description TEXT
        icon TEXT
    }

    user_achievements {
        id TEXT PK
        user_id TEXT FK "References users.id"
        achievement_key TEXT FK "References achievements.key"
        created_at TIMESTAMPTZ
    }

    chat_messages {
        id TEXT PK
        user_id TEXT FK "References users.id"
        role TEXT "user | assistant"
        message TEXT
        created_at TIMESTAMPTZ
    }

    activity_log {
        id TEXT PK
        user_id TEXT FK "References users.id"
        action_type TEXT "login | logout | assessment | admin_action"
        details TEXT
        ip_address TEXT
        created_at TIMESTAMPTZ
    }

    program_settings {
        code TEXT PK "Program code"
        active BOOLEAN "Toggle program visibility"
        updated_at TIMESTAMPTZ
    }

    system_settings {
        key TEXT PK "Setting key"
        value TEXT "Setting value"
        updated_at TIMESTAMPTZ
    }

    password_resets {
        id TEXT PK
        user_id TEXT FK "References users.id"
        token TEXT UK "Reset token"
        expires_at TIMESTAMPTZ
        used BOOLEAN
        created_at TIMESTAMPTZ
    }

    email_verifications {
        id TEXT PK
        user_id TEXT FK "References users.id"
        token TEXT UK "Verification token"
        expires_at TIMESTAMPTZ
        created_at TIMESTAMPTZ
    }

    %% Relationships
    users ||--o{ assessments: "takes"
    users ||--o| assessment_progress: "has"
    users ||--o{ user_favorites: "saves"
    users ||--o{ notifications: "receives"
    users ||--o{ user_achievements: "earns"
    users ||--o{ chat_messages: "sends"
    users ||--o{ activity_log: "generates"
    users ||--o{ counselor_notes: "writes"
    users ||--o{ password_resets: "requests"
    users ||--o{ email_verifications: "verifies"
    assessments ||--o{ counselor_notes: "reviewed in"
    achievements ||--o{ user_achievements: "unlocked by"
```

## Table Descriptions

### users
Stores all user accounts. Roles control feature access:
- **user**: Standard student  can take assessments, view results, browse programs
- **counselor**: Can review student assessments and add notes
- **department_head**: Same as counselor + can manage programs and questions
- **admin**: Full access except cannot modify other admins
- **super_admin**: Complete system access

### assessments
Records each completed assessment. Contains the strand, GWA, Holland Code, top 5 recommended programs, and a full JSON snapshot of all input data for reproducibility.

### assessment_progress
Saves partial assessment state so students can resume if they leave mid-way. One row per user.

### assessment_questions
Customizable questions for each assessment step. Admins can add/edit/delete/reorder questions through the Questions Manager UI.

### program_settings
Controls which programs appear in recommendations. Used by admins to toggle program visibility without modifying the static JSON data.

### system_settings
Weight configuration for the scoring algorithm. Default values:
- `academic_weight`: 0.45
- `suast_weight`: 0.30
- `personal_weight`: 0.25
- `holland_match_weight`: 0.50 (sub-weight within personal fit)
- `interest_match_weight`: 0.30 (sub-weight within personal fit)
- `skills_match_weight`: 0.20 (sub-weight within personal fit)
- `results_count`: 10 (number of recommendations to show)

### activity_log
Audit trail for security and analytics. Logs logins, logouts, assessment completions, and admin actions.



