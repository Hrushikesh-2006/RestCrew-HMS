# RestCrew: Modern Hostel Management System 🏨✨

RestCrew is a state-of-the-art, full-stack hostel management platform designed to streamline operations for hostel owners and enhance the living experience for students. Built with a focus on real-time data, premium aesthetics, and seamless usability.

---

## 🚀 Project Overview

Managing a hostel involves complex coordination between room allocations, student records, meal planning, and complaint resolution. RestCrew centralizes all these tasks into a single, beautiful interface. It ensures data persistence using a high-performance PostgreSQL backend and provides instant updates through a modern reactive frontend.

### Key Features

#### 👑 For Hostel Owners
- **Dynamic Dashboard**: Real-time stats on occupancy, student strength, and pending tasks.
- **Room Management**: Easy allocation and tracking of room availability.
- **Student Database**: Comprehensive records of all residents with quick search and filters.
- **Automated Meal Planning**: Schedule meals (Breakfast, Lunch, Dinner) and track student participation.
- **Complaint Tracking**: Efficiently manage and resolve student issues with status updates.
- **Fee Management**: Track payments and pending dues effortlessly.

#### 🎓 For Students
- **Personal Dashboard**: View room details and upcoming hostel events.
- **Real-time Meal RSVP**: See the daily menu and mark attendance to reduce food wastage.
- **Seamless Complaints**: Submit issues directly through the app and track resolution progress.
- **Instant Notifications**: Receive updates from the owner about important hostel news.

---

## 🛠 Tech Stack

RestCrew is built using the most modern web technologies to ensure speed, security, and scalability.

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router) |
| **User Interface** | React 19, Tailwind CSS 4 |
| **Components** | Shadcn UI, Radix UI |
| **Animations** | Framer Motion |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **Authentication** | Firebase Authentication |
| **State Management** | Zustand |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

---

## 📊 System Architecture

The following flowchart illustrates how the RestCrew platform handles data flow and user interactions:

```mermaid
graph TD
    A[User: Owner/Student] --> B{Authentication}
    B -- Firebase Auth --> C[Authorized Access]
    
    C --> D[Next.js App Router]
    D --> E[Client Components - UI]
    D --> F[Server API Routes]
    
    F --> G[Prisma ORM]
    G --> H[(PostgreSQL Database)]
    
    E -- Real-time Updates --> I[Pusher / WebSocket]
    I --> E
    
    subgraph "Owner Workflow"
        O1[Manage Rooms]
        O2[Schedule Meals]
        O3[Resolve Complaints]
    end
    
    subgraph "Student Workflow"
        S1[View Dashboard]
        S2[RSVP Meals]
        S3[Submit Complaints]
    end
    
    C --> O1 & O2 & O3
    C --> S1 & S2 & S3
```

---

## 🎨 Interface Previews

### Owner Dashboard
The central hub for hostel administration, featuring glassmorphism cards and real-time analytics.

![Owner Dashboard Mockup](public/readme/owner_preview.png)

### Student Portal
A mobile-optimized interface allowing students to manage their hostel life on the go.

![Student Dashboard Mockup](public/readme/student_preview.png)

---

## 🏗 How it was Built

The development of RestCrew followed a rigorous engineering process:

1. **Requirement Analysis**: Identifying the pain points of traditional hostel management (manual logs, food wastage, delayed complaints).
2. **Schema Design**: Architecting a robust relational database schema using Prisma to handle complex relationships between owners, students, and hostel activities.
3. **UI/UX Development**: Implementing a premium "Dark Mode" aesthetic using Tailwind CSS 4 and Framer Motion for smooth transitions.
4. **Backend Integration**: Developing dynamic API routes in Next.js that interact with PostgreSQL, ensuring data persistence across sessions.
5. **Real-time Sync**: Integrating Pusher and Zustand to provide an app-like experience where data updates instantly across all connected users.
6. **Persistence Migration**: Moving from transient local storage to a production-grade PostgreSQL instance to ensure zero data loss.

---

## 👥 Built By

RestCrew was passionately developed by:

*   **A. Hrushikesh**
*   **V. Manohar**
*   **G. Giri Charan**

---

© 2026 RestCrew Team. All rights reserved.
