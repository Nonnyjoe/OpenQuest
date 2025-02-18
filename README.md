<br>
<p align="center">
    <img src="https://github.com/Mugen-Builders/.github/assets/153661799/7ed08d4c-89f4-4bde-a635-0b332affbd5d" align="center" width="20%">
</p>
<br>
<div align="center">
    <i>OpenQuest Protocol</i>
</div>
<div align="center">
<b>Experiment week #3 (Cartesi X EigenLayer) </b>
</div>
<br>
<p align="center">
	<img src="https://img.shields.io/github/license/Nonnyjoe/OpenQuest?style=default&logo=opensourceinitiative&logoColor=white&color=79F7FA" alt="license">
	<img src="https://img.shields.io/github/last-commit/Nonnyjoe/OpenQuest?style=default&logo=git&logoColor=white&color=868380" alt="last-commit">
</p>

# OpenQuest

OpenQuest is a platform that helps blockchain projects track, engage, and grow their communities through fun and interactive Quests.

## 🚀 The Problem OpenQuest Solves

Tokens are often misallocated to airdrop hunters, while projects struggle to drive genuine participation and sustainable growth in their ecosystems. Many projects also lack reliable ways to track contributor engagement, making it difficult to host provable and efficiently gated events like hackathons or grants.

OpenQuest solves this by enabling projects to:

- **Engage their communities**
- **Foster growth**
- **Reward meaningful contributions** through verifiable Quests.

With a leaderboard system, projects gain solid, verifiable metrics on contributors, helping protocols identify engagement trends and take action when contributors lose interest.

---

## Architecture

![OpenQuest Architecture](img/flow.png)

---

## 🛠️ How OpenQuest Works

- **Personalized Account/Contracts:** Protocols register on OpenQuest, deploying dedicated smart contracts for seamless Quest management.
- **Permissionless & No-Code Deployment:** Launch customizable, verifiable Quests without approvals or coding.
- **Trustless Verification & Fair Scoring:** Powered by Cartesi’s Coprocessor for deterministic grading.
- **Automated Rewards & Incentive Pools:** Distribute rewards automatically based on participation and leaderboard rankings.
- **Leaderboard & Onchain Reputation:** Track developer contributions and community engagement, with NFTs as proof of participation.

---

## 🔮 Future Implementations

- AI integration for meme and technical writing contests.
- Hackathon support with improved interface and flow.
- Social scanner integration for content creator rewards.

---

## 🧰 Technologies Used

Cartesi, EigenLayer, Next.js, Rust, Actix-web, Solidity

---

## 🔗 Links

- **Website:** [OpenQuest](https://open-quest-xi.vercel.app/)
- **GitHub:** [OpenQuest Repository](https://github.com/Nonnyjoe/OpenQuest)
- **Solidity Contracts:**
  - [Contract 1](https://holesky.etherscan.io/address/0x78f7ddbb09d77f08b8e6a3df94e79fe606966d82)
  - [Contract 2](https://holesky.etherscan.io/address/0x4f26fc61dA4Ac6B8030F4178A9800ee40f9eDE38)

---

## Running Locally:

### Starting the Backend:

- CD into server directory, create a .env file with the necessary values mentioned in the .env.example file.
- CD out and into the contracts directory, create another .env file with the details found in the .env.example file of the contracts dir.
- CD into the Coprocessor Directory, using the cartesi-coprocessor cli, run the start devnet command then publish the program to devnet:

  ```bash
  cartesi-coprocessor start-devnet
  ```

  ```bash
  cartesi-coprocessor pubish --network devnet
  ```

- Copy the machine hash gotten after publishing the coprocessor program, cd into the contracts directory and modify the .env file with the machine hash.
- While in the contracts folder run the command below to Deploy the Protocol Factory contract:

  ```bash
    forge script script/DeployFactory.s.sol --rpc-url http://localhost:8545 --broadcast --private-key <Private key to deploy the factory>
  ```

  **Note:** The private key passed in the command above should be the same passed in the .env files to avoid reverts due to contract ownership.

- Copy the address of the protocol factory gotten from the previous command then navigate to the server directory and modify the env with the new protocol factory address (OPENQUEST_FACTORY)
- Start your server by running the following command:
  ```bash
  cargo run
  ```
  **Note:** If you experience permission issue running the `cargo run` command, you can run this instead to fix that: `sudo cargo run`.

### Starting the Frontend:

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

### Made with ❤️ by the OpenQuest Team.
