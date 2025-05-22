# DocuPicks - Curated Documentary Discovery

[![React](https://img.shields.io/badge/React-18.2.0-%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-%233178C6)](https://www.typescriptlang.org/)
[![MUI](https://img.shields.io/badge/MUI-5.14.18-%23007FFF)](https://mui.com/)
[![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?logo=amazon-aws&logoColor=white)](https://aws.amazon.com)

DocuPicks is a focused React/TypeScript platform for discovering essential documentaries about racial justice, police reform, and African American history in America.
It combines intelligent curation with robust API integrations for a reliable, high-quality discovery experience.

![DocuPicks](docupicks.com)

## Frontend

- **React 18** with TypeScript type safety
- **Material-UI** modern component library
- **Vite** for fast development/build

## Backend (AWS Amplify)

- **REST API** (via AWS Lambda & API Gateway) for all data operations
- **Amazon DynamoDB** for fast, scalable NoSQL storage of curated documentary data
- **Amplify Hosting:** S3 + CloudFront CDN
- **CI/CD:** Automated builds and deploys via Amplify Console

## Curated Focus Areas

- 🚨 Police brutality and reform  
- ✊🏿 Black Lives Matter movement  
- ⛓️ Historical slavery and its legacy  
- 🗳️ Voting rights and suppression  
- 📚 Systemic racism in America  

## Key Features

- 🎬 Curated selection of documentaries with IMDB ratings ≥6.0  
- 🔍 Dual API integration (TMDB + OMDB) for accurate data  
- 🛠️ Advanced content validation:  
  - Genre verification  
  - Documentary text analysis  
- 📺 Streaming provider information (US region)  
- 🌗 Light/Dark theme toggle  
- 🛡️ Fallback to hand-picked classics when API fails  
- ⚡ Intelligent batching and rate limiting  

## Data Sources

- **TMDB API** - Primary movie discovery and streaming providers
- **OMDB API** - Detailed metadata validation
- **The Movie Database** - Provider logos

## How the Backend Works

-	When you browse or search, the frontend calls a custom API built with AWS Lambda and API Gateway.
- This API fetches and validates data from DynamoDB, ensuring only curated, high-quality documentaries are shown.
-	Data is regularly refreshed and validated using batch jobs and Lambda triggers.
- All backend infrastructure is managed as code with AWS Amplify, making it easy to evolve and scale.

## Installation

1. Clone the repository:
```bash
git clone https://github.com/shaundawson/docupicks-react.git
cd docupicks-react
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables:
```bash
VITE_TMDB_API_KEY=your_tmdb_key
VITE_OMDB_API_KEY=your_omdb_key
```

4. Start development server
```bash
npm run dev
```