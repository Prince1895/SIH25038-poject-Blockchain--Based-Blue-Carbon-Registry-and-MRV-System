# Blue Carbon Registry & MRV System 🌊
### Blockchain-Based Monitoring, Reporting & Verification for Blue Carbon Ecosystems

> Built for Smart India Hackathon 2025 (SIH25038)

India's blue carbon ecosystems — mangroves, seagrasses, saltmarshes — absorb carbon at rates far higher than terrestrial forests. But there's no decentralized, verifiable system to track that sequestration, issue credits, and prevent double-counting. This project proposes and implements one.

---

## The Problem

Carbon credit markets rely on trust. Without a transparent, tamper-proof ledger:
- MRV data can be manipulated or faked
- Credits can be double-issued across registries
- Verifiers have no on-chain proof of what they approved

Traditional centralized registries don't solve this — they just shift the trust problem to a single authority.

---

## What We Built

A full-stack decentralized MRV platform where:

1. **Project owners** register blue carbon sites and submit sequestration data
2. **Verifiers** review submissions and approve or reject them
3. **Smart contracts** mint carbon credits on-chain only after verified approval — no manual override possible
4. **Anyone** can audit the full credit history on Ethereum — who issued what, when, and based on which MRV data
5. **ML model** assists with biomass estimation from satellite/sensor data to reduce manual reporting burden

---

## System Architecture

```
Project Owner / Verifier (Browser)
          │
          ▼
    React Frontend
          │  REST API calls
          ▼
    Node.js + Express Backend
          ├── OTP Auth (secure onboarding)
          ├── Prisma ORM
          ├── PostgreSQL (Neon DB)
          │     ├── users, projects, submissions, verifications
          │
          ├── ML Model Integration
          │     └── Biomass estimation from input parameters
          │
          └── Ethereum Smart Contracts (via ethers.js)
                ├── CarbonCreditToken.sol  → ERC-20 token for credits
                ├── MRVRegistry.sol        → Stores verified MRV records on-chain
                └── Verifier.sol           → Controls who can approve submissions
```

**Key design decisions:**
- **Credits minted on-chain only after verification** — the backend calls the smart contract after a verifier approves, not before. This prevents pre-minting or manipulation.
- **OTP-based onboarding** — no OAuth dependency; users verify via email OTP, keeping the system self-contained and auditable.
- **Prisma + PostgreSQL for off-chain data** — raw MRV submissions, site metadata, and user records stay in a relational DB. Only the verified output (credit issuance) goes on-chain.
- **ML model for biomass estimation** — reduces reliance on self-reported data by giving verifiers a model-generated baseline to compare against submissions.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Next.js, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Neon DB), Prisma ORM |
| Auth | OTP-based email verification, JWT |
| Blockchain | Solidity, Ethereum (Sepolia testnet), ethers.js |
| ML | Python (biomass estimation model) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
.
├── backend/
│   ├── routes/         # Auth, projects, submissions, verifications
│   ├── controllers/
│   ├── middleware/      # JWT verification, role checks
│   ├── prisma/
│   │   └── schema.prisma
│   └── index.js
│
├── contracts/
│   ├── CarbonCreditToken.sol   # ERC-20 carbon credit token
│   ├── MRVRegistry.sol         # On-chain MRV record storage
│   └── Verifier.sol            # Verifier role management
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard/      # Project owner view
│       │   ├── Verifier/       # Verifier review panel
│       │   └── Registry/       # Public audit view
│       └── components/
│
├── ml-model/
│   └── biomass_estimator.py    # Carbon sequestration estimation model
│
└── docs/
    └── research-paper.pdf      # Proposed MRV framework
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- Python 3.9+ (for ML model)
- PostgreSQL or [Neon](https://neon.tech) free tier
- [MetaMask](https://metamask.io) wallet (for contract interaction)
- Ethereum Sepolia testnet ETH (free from [Sepolia faucet](https://sepoliafaucet.com))

### 1. Clone the repo

```bash
git clone https://github.com/Prince1895/SIH25038-poject-Blockchain--Based-Blue-Carbon-Registry-and-MRV-System.git
cd SIH25038-poject-Blockchain--Based-Blue-Carbon-Registry-and-MRV-System
git checkout develop
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
# Database
DATABASE_URL=your_postgres_connection_string

# Auth
JWT_SECRET=your_jwt_secret

# Email (for OTP)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_email_password

# Blockchain
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
DEPLOYER_PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=deployed_contract_address
```

Run migrations and start:

```bash
npx prisma migrate dev
npm run dev
```

### 3. Smart contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the deployed contract addresses into your backend `.env`.

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### 5. ML model

```bash
cd ml-model
pip install -r requirements.txt
python biomass_estimator.py
```

---

## How It Works (User Flow)

```
1. Project owner registers → OTP verification → JWT issued
2. Owner submits MRV data (site location, biomass readings, sensor data)
3. ML model generates biomass estimate as a baseline
4. Assigned verifier reviews submission + ML estimate
5. Verifier approves → Backend calls smart contract
6. Smart contract mints ERC-20 carbon credits to owner's wallet
7. MRV record written on-chain → publicly auditable forever
```

---

## Smart Contracts (Sepolia Testnet)

| Contract | Address |
|---|---|
| CarbonCreditToken | `0x...` (update after deployment) |
| MRVRegistry | `0x...` (update after deployment) |
| Verifier | `0x...` (update after deployment) |

View on [Sepolia Etherscan](https://sepolia.etherscan.io)

---

## Research

This project is accompanied by a research paper proposing a decentralized blockchain-based MRV framework for blue carbon ecosystems in India's coastal regions. See `docs/research-paper.pdf`.

---

## Team

Built as part of **Smart India Hackathon 2025** — Problem Statement SIH25038.

- **Prince Kumar** — Backend development, smart contract integration, REST APIs
- Team members — Frontend, ML model, contracts

---

## License

MIT License — see [LICENSE](./LICENSE) for details.
