# Krystal Cloud Demo

A demo application for [cloud.krystal.app](https://cloud.krystal.app) that showcases the Krystal Cloud API integration.

## Features

- **Header Bar**:
  - Header link to cloud.krystal.app
  - API key input with localStorage persistence
  - Link to generate API key if none present

- **Pools Section**:
  - List of pools with filtering by name
  - Split-pane detail view (like Gmail)
  - Real-time data from Krystal Cloud API

- **Positions Section**:
  - List of positions with filtering by ID or pool name
  - Split-pane detail view
  - Real-time data from Krystal Cloud API

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: Chakra UI v3.22.0
- **Language**: TypeScript
- **Node Version**: 24+

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run the development server**:

   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Enter your API key** in the navigation bar
2. **Browse Pools** - View and filter pools, click to see details
3. **Browse Positions** - View and filter positions, click to see details

## API Integration

The app integrates with the [Krystal Cloud API](https://cloud-api.krystal.app/swagger/index.html#/) to fetch:

- Pools: `/api/v1/pools`
- Positions: `/api/v1/positions`

API key is stored in localStorage for convenience.

## Project Structure

```
src/app/
├── layout.tsx          # Root layout with ChakraProvider
├── page.tsx            # Main page with tabs
├── NavBar.tsx          # Navigation with API key input
├── Providers.tsx       # Chakra UI providers
├── PoolsSection.tsx    # Pools list and details
└── PositionsSection.tsx # Positions list and details
```

## Notes

- Built with Next.js App Router and Chakra UI v3
- Responsive design with mobile-first approach
- Error handling and loading states included
- API key management with localStorage persistence
