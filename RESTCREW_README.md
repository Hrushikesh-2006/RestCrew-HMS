# RestCrew - Modern Hostel Management System

A beautiful, modern hostel management system with AI-powered analytics and separate portals for owners and students.

## Features

### Owner Portal
- **Dashboard** - Real-time statistics with colorful charts
- **Room Management** - Add rooms with 3/4/5 sharing capacity
- **Student Records** - Manage student information and room assignments
- **Meal Planning** - Create weekly meal plans
- **Complaints** - Track and resolve student complaints
- **Fee Management** - Track payments and send reminders
- **Business Analytics** - AI-powered profit/loss analysis with Gemini

### Student Portal
- **Dashboard** - Personal information and status
- **Meals** - View menu and select participation
- **Complaints** - Submit and track complaints
- **Fees** - View payment status

## Getting Started

### Prerequisites
- Node.js 18+ 
- Bun (recommended) or npm

### Installation

1. **Extract the project** (if downloaded as ZIP)

2. **Open in VS Code**
   ```bash
   cd restcrew
   code .
   ```

3. **Install dependencies**
   ```bash
   bun install
   ```
   Or with npm:
   ```bash
   npm install
   ```

4. **Run the development server**
   ```bash
   bun run dev
   ```
   Or with npm:
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## Usage Flow

### For Owners:
1. Register with your hostel details
2. Add rooms (set capacity 3/4/5 sharing)
3. Add students and assign rooms
4. Create meal plans
5. Track fees and complaints
6. View AI-powered financial insights

### For Students:
1. Register with your details
2. Wait for owner to assign a room
3. View meals and select participation
4. Submit complaints if needed
5. Track fee payments

## AI Features

The analytics page uses **Google Gemini AI** to provide:
- Financial health summary
- Profit/loss insights
- Cost optimization recommendations
- Warning alerts for financial issues

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with glassmorphism
- **UI Components**: shadcn/ui
- **State Management**: Zustand with localStorage
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI**: Google Gemini API

## Color Theme

- **Purple/Pink** - Owner portal
- **Orange/Amber** - Student portal
- **Cyan/Blue** - Information
- **Green** - Success states
- **Red** - Alerts/warnings

## Notes

- All data is stored locally in browser storage
- No backend server required
- Perfect for demo and small-scale usage
- Can be extended with a real backend

## License

MIT License
