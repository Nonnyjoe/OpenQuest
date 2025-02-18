# OpenQuest

### Repository for OpenQuest project built for the Cartesi X Eigen layer Experiment week

## Overview

OpenQuest is an interactive learning platform that enables protocols to create quizzes and hackathons with reward distribution capabilities. Built during the Cartesi X Eigen layer Experiment week.

## Features

- Protocol Management
  - Create and manage multiple protocols
  - View protocol details and statistics
  - Admin dashboard for protocol management
- Quiz System
  - Attempt quizzes with timer
  - Multiple choice questions
  - Blockchain-based answer submission
  - View quiz results
- Wallet Integration
  - Connect MetaMask wallet
  - Link wallet to profile
- User Profile
  - View and edit profile details
  - Manage wallet connections

## Prerequisites

- Node.js (v18 or higher)
- MetaMask wallet extension
- Access to OpenQuest backend server
- Git

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Nonnyjoe/OpenQuest.git
   cd OpenQuest
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory and set the API URL:

   ```bash
   NEXT_PUBLIC_API_URL=https://localhost:3000
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to access the application.

## Getting Started

1. **Connect Your Wallet**

   - Install MetaMask if you haven't already
   - Connect to Holesky testnet
   - Click "Connect Wallet" in the navigation bar

2. **Link Your Wallet**

   - Navigate to Profile page
   - Click "Link Wallet"
   - Sign the transaction in MetaMask
   - _Note: Linking wallet is required before attempting quizzes_

3. **Create a Protocol** (Admin)

   - Go to Admin Dashboard
   - Click "Create Protocol"
   - Fill in protocol details
   - Submit the form

4. **Attempt a Quiz**
   - Browse available quizzes
   - Click on a quiz to view details
   - Ensure wallet is connected and linked
   - Click "Start Quiz"
   - Answer questions within the time limit
   - Submit answers

## Known Limitations

- Hackathon features are under development
- Quiz creation functionality needs backend integration

## Development Status

### Working Features

- Protocol creation and management
- Quiz listing and attempt quiz from frontend
- Wallet connection and linking
- User authentication
- Protocol listing
- Quiz creation from backend
- Quiz attempt from frontend

### In Progress

- Hackathon implementation
- Quiz creation functionality from frontend

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Wagmi/Viem for Web3
- Shadcn UI Components
- MetaMask Integration
