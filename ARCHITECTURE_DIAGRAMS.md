# Architecture Diagrams

This document contains Mermaid diagrams for the Citizen Issue Prioritization and Management System.

## System Architecture

```mermaid
flowchart TB
    subgraph Users["Users"]
        Citizen["Citizen"]
        Officer["Officer"]
        Admin["Admin"]
    end

    subgraph Frontend["React / Vite Frontend"]
        AuthUI["Auth Pages"]
        CitizenUI["Citizen Dashboard\nReport Form\nMap View\nMy Reports"]
        OfficerUI["Officer Dashboard"]
        AdminUI["Admin Dashboard\nReports\nAnalytics"]
        SharedUI["Shared Components\nNavbar, Cards, Badges,\nAI Analysis Card"]
    end

    subgraph Backend["FastAPI Backend"]
        AuthAPI["Auth Router\nJWT + Google OAuth"]
        UploadAPI["Upload Router"]
        ReportsAPI["Reports Router"]
        VotesAPI["Votes Router"]
        AnalyticsAPI["Analytics Router"]
        NotificationsAPI["Notifications Router"]
        UserAPI["User Router"]
        ModelingAPI["Modeling Router"]
        AIScoring["AI Severity Pipeline"]
    end

    subgraph Database["PostgreSQL + PostGIS"]
        UsersTable[("users")]
        ReportsTable[("reports")]
        VotesTable[("votes")]
        NotificationsTable[("notifications")]
        ImagesTable[("stored_images")]
        DepartmentsTable[("departments")]
        TeamsTable[("field_teams")]
    end

    subgraph External["External / Optional Services"]
        Google["Google OAuth"]
        Groq["Groq Vision API\noptional"]
        Overpass["OpenStreetMap Overpass API"]
        LocalYOLO["Local YOLO Detector\noptional weights"]
        MapTiles["OpenStreetMap Tiles\nNominatim Reverse Geocoding"]
    end

    Citizen --> AuthUI
    Citizen --> CitizenUI
    Officer --> OfficerUI
    Admin --> AdminUI

    AuthUI --> AuthAPI
    CitizenUI --> ReportsAPI
    CitizenUI --> UploadAPI
    CitizenUI --> VotesAPI
    CitizenUI --> NotificationsAPI
    CitizenUI --> MapTiles
    OfficerUI --> ReportsAPI
    AdminUI --> AnalyticsAPI
    AdminUI --> ReportsAPI
    AdminUI --> ModelingAPI
    SharedUI --> ReportsAPI

    AuthAPI --> UsersTable
    AuthAPI --> Google
    UserAPI --> UsersTable
    UploadAPI --> ImagesTable
    ReportsAPI --> ReportsTable
    ReportsAPI --> ImagesTable
    ReportsAPI --> NotificationsTable
    ReportsAPI --> AIScoring
    VotesAPI --> VotesTable
    VotesAPI --> ReportsTable
    AnalyticsAPI --> ReportsTable
    AnalyticsAPI --> UsersTable
    AnalyticsAPI --> NotificationsTable
    NotificationsAPI --> NotificationsTable
    ModelingAPI --> LocalYOLO

    AIScoring --> Groq
    AIScoring --> Overpass
    AIScoring --> LocalYOLO
    AIScoring --> ReportsTable
```

## Database Relationships

```mermaid
erDiagram
    USERS {
        int id PK
        string name
        string email UK
        string hashed_password
        enum role
        datetime created_at
    }

    REPORTS {
        int id PK
        string title
        text description
        string category
        enum status
        enum severity
        enum priority
        string image_url
        string resolution_image_url
        text citizen_feedback
        geometry location
        float pothole_spread_score
        float emotion_score
        float location_score
        float upvote_score
        float ai_severity_score
        string ai_severity_level
        string location_meta
        string sentiment_meta
        int upvotes
        datetime created_at
        datetime updated_at
        int user_id FK
        int department_id FK
        int assigned_team_id FK
    }

    VOTES {
        int user_id PK,FK
        int report_id PK,FK
        int value
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        int report_id FK
        string message
        int is_read
        datetime created_at
    }

    STORED_IMAGES {
        string id PK
        string filename
        string content_type
        binary data
        datetime created_at
    }

    DEPARTMENTS {
        int id PK
        string name UK
        string slug UK
    }

    FIELD_TEAMS {
        int id PK
        string name
        string status
        float current_lat
        float current_lon
        int department_id FK
    }

    USERS ||--o{ REPORTS : submits
    USERS ||--o{ VOTES : casts
    USERS ||--o{ NOTIFICATIONS : receives
    REPORTS ||--o{ VOTES : receives
    REPORTS ||--o{ NOTIFICATIONS : triggers
    DEPARTMENTS ||--o{ REPORTS : owns
    DEPARTMENTS ||--o{ FIELD_TEAMS : manages
    FIELD_TEAMS ||--o{ REPORTS : assigned_to
    STORED_IMAGES ||..o{ REPORTS : referenced_by_image_url
```

## User Workflow

```mermaid
flowchart TD
    Start["Citizen opens app"] --> HasAccount{"Has account?"}
    HasAccount -- "No" --> Signup["Sign up as citizen"]
    HasAccount -- "Yes" --> Login["Log in"]
    Signup --> Dashboard["Citizen dashboard"]
    Login --> Dashboard

    Dashboard --> Browse["Browse community reports"]
    Dashboard --> Map["View reports on map"]
    Dashboard --> NewReport["Create new road issue report"]
    Dashboard --> MyReports["View my reports"]

    NewReport --> PickLocation["Choose location\nGPS or map picker"]
    PickLocation --> AddDetails["Add title and description"]
    AddDetails --> UploadPhoto["Upload optional photo"]
    UploadPhoto --> Submit["Submit report"]

    Submit --> ImageStore["Backend stores image"]
    ImageStore --> AI["Backend runs AI/geospatial scoring"]
    AI --> Created["Report created with priority"]
    Created --> Detail["Citizen views report detail"]

    Browse --> Detail
    Map --> Detail
    MyReports --> Detail

    Detail --> Upvote["Upvote report"]
    Detail --> Track["Track status"]
    Detail --> DeleteOwn["Delete own open report"]

    Track --> Resolved{"Marked resolved?"}
    Resolved -- "No" --> Wait["Wait for updates"]
    Resolved -- "Yes" --> Verify{"Issue actually fixed?"}
    Verify -- "Yes" --> Close["Verify and close report"]
    Verify -- "No" --> Reopen["Dispute and reopen report"]
```

## Admin Workflow

```mermaid
flowchart TD
    Start["Admin logs in"] --> AdminDashboard["Open admin dashboard"]

    AdminDashboard --> Summary["Review total reports,\nactive users, resolved reports,\nresolution rate"]
    AdminDashboard --> SeverityChart["Review severity distribution"]
    AdminDashboard --> Trends["Review monthly trends"]

    AdminDashboard --> ReportsPage["Open report management"]
    ReportsPage --> FilterSort["Filter by status\nSort by severity, date,\nupvotes, or priority"]
    FilterSort --> SelectReport["Select report"]

    SelectReport --> ReviewAI["Review AI score and metadata"]
    SelectReport --> ChangeStatus["Update report status"]
    SelectReport --> Reanalyze["Rerun AI analysis"]
    SelectReport --> Delete["Delete invalid report"]

    AdminDashboard --> Analytics["Open analytics dashboard"]
    Analytics --> StatusDist["Status distribution"]
    Analytics --> PriorityDist["Priority distribution"]
    Analytics --> ResolutionStats["Resolution time stats"]
    Analytics --> Heatmap["Geographic hotspot table"]
    Analytics --> Predictive["Predictive maintenance hotspots"]

    ChangeStatus --> NotifyCitizen{"Status resolved?"}
    NotifyCitizen -- "Yes" --> Notification["Create citizen notification"]
    NotifyCitizen -- "No" --> Persist["Save update"]
    Reanalyze --> Persist
    Delete --> Persist
```

## Complaint Lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending: Citizen submits report

    pending --> in_progress: Officer starts work
    pending --> resolved: Officer/Admin resolves directly
    pending --> rejected: Admin rejects invalid report
    pending --> [*]: Owner/Admin deletes report

    in_progress --> resolved: Officer marks resolved
    in_progress --> rejected: Admin rejects report
    in_progress --> [*]: Owner/Admin deletes report

    resolved --> closed: Citizen verifies fix
    resolved --> reopened: Citizen disputes fix

    reopened --> in_progress: Officer investigates again
    reopened --> resolved: Officer/Admin resolves again
    reopened --> [*]: Owner/Admin deletes report

    closed --> reopened: Citizen reopens if needed
    closed --> [*]: Lifecycle complete

    rejected --> [*]: Lifecycle complete
```

## AI Severity Scoring Flow

```mermaid
flowchart TD
    Report["Report submitted"] --> LoadImage["Load uploaded image bytes"]
    LoadImage --> LocationCheck{"Coordinates available?"}

    LocationCheck -- "Yes" --> POI["Query nearby POIs\nschools, hospitals, transit,\nemergency services"]
    LocationCheck -- "Yes" --> Traffic["Query nearby road type\nfor traffic proxy"]
    LocationCheck -- "No" --> NeutralLocation["Use neutral location defaults"]

    POI --> LocationScore["Compute location risk score"]
    Traffic --> TrafficScore["Compute traffic score"]
    NeutralLocation --> LocationScore
    NeutralLocation --> TrafficScore

    LocationScore --> GroqCheck{"GROK_API_KEY set?"}
    TrafficScore --> GroqCheck
    LoadImage --> GroqCheck

    GroqCheck -- "Yes" --> Vision["Groq vision + AHP prompt"]
    Vision --> Parse["Parse strict JSON response"]
    Parse --> Success{"Valid response?"}

    Success -- "Yes" --> StoreScores["Store AI scores and metadata"]
    Success -- "No" --> Fallback["Heuristic AHP fallback"]
    GroqCheck -- "No" --> Fallback

    Fallback --> LocalModel{"Local detector weights available?"}
    LocalModel -- "Yes" --> YOLO["Run YOLO detector"]
    LocalModel -- "No" --> TextHeuristic["Use text/location/upvote heuristics"]
    YOLO --> HeuristicScore["Combine visual, location,\nsentiment, and social scores"]
    TextHeuristic --> HeuristicScore
    HeuristicScore --> StoreScores

    StoreScores --> Priority["Map final score to\nseverity and priority"]
    Priority --> Save["Save report"]
```
