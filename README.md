# Bitcoin Chart with Vue.js and D3

This project converts the original HTML Bitcoin chart to a modern Vue.js application that uses data from `prices.json`.

## Features

- **Vue.js 3** with Composition API
- **D3.js** for data visualization
- **d3-annotation** library for interactive annotations
- **Real-time data** from `prices.json`
- **Responsive design** with modern styling
- **Interactive annotations** that are draggable and deletable

## Project Structure

```
cypher-task/
├── index.html          # Vue.js entry point
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── prices.json         # Bitcoin price data
├── src/
│   ├── main.js         # Vue app initialization
│   └── App.vue         # Main chart component
└── README.md           # This file
```

## Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Build for production:**

   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Key Changes from Original

- **Framework**: Converted from vanilla HTML/JS to Vue.js 3
- **Data Source**: Now uses `prices.json` instead of hardcoded data
- **Build System**: Uses Vite for fast development and building
- **Component Structure**: Organized into reusable Vue components
- **Modern JavaScript**: Uses ES6+ features and Vue Composition API
- **CDN Libraries**: Uses D3.js and d3-annotation from CDN for simplicity

## Data Source

The chart now reads from `prices.json` which contains:

- Daily Bitcoin prices from July 2017 to March 2018
- 1002 data points with date and value
- Much more granular data than the original 22 points

## Annotations

The chart includes interactive annotations for key Bitcoin events:

- Bitcoin Cash split (August 2017)
- China crypto exchange shutdown (September 2017)
- Segwit2X delay (November 2017)
- First $10k milestone (November 2017)
- First $20k milestone (December 2017)
- Segwit2X hard fork (December 2017)
- Market volatility analysis (January-February 2018)

## Interactive Features

- **Draggable annotations**: Click and drag to reposition
- **Deletable annotations**: Ctrl+Click (or Cmd+Click on Mac) to remove
- **Responsive chart**: Adapts to different screen sizes
- **Debug information**: Real-time status updates

## Technologies Used

- **Vue.js 3.3.4** - Progressive JavaScript framework
- **D3.js v4** - Data visualization library (via CDN)
- **d3-annotation 2.5.1** - Annotation library for D3 (via CDN)
- **Vite 4.4.5** - Fast build tool and dev server

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers supported

## Development

The project uses Vite for fast development:

- Hot Module Replacement (HMR)
- Fast refresh
- Optimized builds
- TypeScript support (if needed)

## License

This project is part of a Front-End Software Engineer test project.
