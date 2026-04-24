# RestCrew: Modern Hostel Management System 🏨✨

RestCrew is a state-of-the-art, full-stack hostel management platform designed to streamline operations for hostel owners and enhance the living experience for students. Built with a focus on real-time data, premium aesthetics, and seamless usability.

---

## 👥 Meet the Team

RestCrew was passionately developed and maintained by:

| Name | Role |
| :--- | :--- |
| **A. Hrushikesh** | 👑 **Team Leader** |
| **V. Manohar** | 🛠 **Team Member** |
| **G. Giri Charan** | 🛠 **Team Member** |

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

RestCrew is built using the most modern web technologies for maximum performance and reliability.

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) |
| **User Interface** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) |
| **Database & ORM** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat-square&logo=Prisma&logoColor=white) |
| **Authentication** | ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black) |
| **Animations** | ![Framer](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) |
| **Deployment** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) |

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

![Owner Dashboard Actual](public/readme/owner_dashboard.png)

### Hosteler Portal
A mobile-optimized interface allowing students to manage their hostel life on the go.

![Hosteler Dashboard Preview](public/readme/student_preview.png)

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

© 2026 RestCrew Team. All rights reserved.
