# DocuPicks - Curated Documentary Discovery

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.14.18-blue)](https://mui.com/)

DocuPicks is a documentary discovery platform that combines data from TMDB and OMDB to showcase high-quality documentaries from 2015 to present. Features intelligent validation and streaming availability info.

![DocuPicks Screenshot](./public/screenshot.jpg)

## Key Features

- 🎬 Curated selection of documentaries with IMDB ratings ≥7.0
- 🔍 Dual API integration (TMDB + OMDB) for accurate data
- 📅 Focus on recent releases (2015-2025)
- 🛠️ Advanced content validation:
  - Genre verification
  - Minimum 200 votes filter
  - Documentary text analysis
- 📺 Streaming provider information (US region)
- 🌗 Light/Dark theme toggle
- 📱 Responsive grid layout (1-4 columns based on screen size)
- 🛡️ Fallback to hand-picked classics when API fails
- ⚡ Intelligent batching and rate limiting

## Data Sources

- **TMDB API** - Primary movie discovery and streaming providers
- **OMDB API** - Detailed metadata validation
- **The Movie Database** - Provider logos

## Installation

1. Clone the repository:
```bash
git clone https://github.com/shaundawson/docupicks-react.git
cd docupicks-react