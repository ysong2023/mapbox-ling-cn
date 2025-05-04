# Chinese Dialect Map Web Application

This is a Next.js application that visualizes Chinese dialect data from Guizhou province using Mapbox GL.

## Features

- Interactive map showing county-level dialect data
- Color-coding based on dialect regions (方言区), groups (方言片), or subgroups (方言小片)
- Interactive popups with detailed information when clicking on counties
- Dynamic legend that updates based on the selected categorization
- Responsive design that works on mobile and desktop

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Create a `.env.local` file in the project root with your Mapbox token:
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Structure

The application uses two main data sources:
- GeoJSON data with county boundaries for Guizhou province
- Linguistic data with dialect information for each county

The data is joined using the county-level codes (县级码).

## Technologies Used

- Next.js - React framework
- React Map GL / Mapbox GL - Map rendering and interaction
- TypeScript - Type safety
- TailwindCSS - Styling

## Project Structure

```
src/
├── components/        # Reusable components
│   └── CountyPopup.tsx  # Popup component for county details
├── pages/             # Next.js pages
│   ├── _app.tsx         # App component with global styles
│   ├── index.tsx        # Main page with map
│   └── api/             # API routes
│       ├── geojson.ts     # API to serve GeoJSON data
│       └── lingdata.ts    # API to serve linguistic data
├── styles/            # CSS styles
│   └── globals.css      # Global styles with Tailwind
├── public/            # Static assets
└── .env.local         # Environment variables (create this file)
``` 