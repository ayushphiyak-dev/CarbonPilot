# CarbonPilot

A beautiful, interactive single-page web application for tracking and reducing your personal carbon footprint.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **Carbon Assessment** — Quick 2-minute survey across transport, diet, energy, shopping, and travel.
- **Dashboard** — Real-time footprint breakdown with interactive charts (Chart.js).
- **Next Best Action** — AI-picked highest-impact, most achievable step to reduce emissions.
- **What-If Simulator** — Live sliders to project savings and see real-world equivalents (trees planted).
- **AI Coach** — Personal carbon advisor with contextual responses based on your profile.
- **Progress Tracking** — Monthly goals, streaks, weekly savings charts, and achievements.
- **Dark Mode** — Full light/dark theme support with CSS custom properties.
- **Responsive** — Mobile-first with bottom navigation and sticky sidebar on desktop.

## Tech Stack

- Pure HTML5, CSS3, JavaScript (no frameworks)
- [Chart.js](https://www.chartjs.org/) for data visualization
- [Inter](https://fonts.google.com/specimen/Inter) font via Google Fonts
- CSS Custom Properties for theming
- Intersection Observer for scroll animations

## Project Structure

```
carbonpilot/
├── index.html          # Main SPA shell
├── css/
│   └── style.css       # Complete design system & component styles
├── js/
│   └── app.js          # Routing, charts, simulator logic, AI coach
├── assets/
│   └── (images, icons) # Static assets
├── README.md
├── LICENSE
└── .gitignore
```

## Quick Start

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/carbonpilot.git
   cd carbonpilot
   ```

2. Serve locally (any static server works):
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js
   npx serve .

   # VS Code Live Server extension
   ```

3. Open `http://localhost:8000`

## Customization

- **Colors**: Edit CSS custom properties in `:root` inside `css/style.css`.
- **Data**: Update the `categories` array and baseline values in `js/app.js`.
- **AI Responses**: Modify the `aiResponses` object in `js/app.js`.

## Browser Support

- Chrome / Edge / Firefox / Safari (latest 2 versions)
- Mobile Safari & Chrome

## License

MIT — see [LICENSE](LICENSE).
