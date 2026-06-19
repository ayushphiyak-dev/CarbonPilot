<p align="center">
  <img src="assets/logo.svg" width="100" alt="CarbonPilot">
</p>

<h1 align="center">CarbonPilot</h1>
<p align="center">
  <b>Assess, track, and reduce your carbon footprint.</b><br>
  A responsive web app built with vanilla HTML, CSS, and JavaScript.
</p>

<p align="center">
  <a href="https://github.com/yourusername/carbonpilot/stargazers"><img src="https://img.shields.io/github/stars/yourusername/carbonpilot?style=flat-square&color=1a5f4a" alt="Stars"></a>
  <a href="https://github.com/yourusername/carbonpilot/network/members"><img src="https://img.shields.io/github/forks/yourusername/carbonpilot?style=flat-square&color=1a5f4a" alt="Forks"></a>
  <a href="https://github.com/yourusername/carbonpilot/issues"><img src="https://img.shields.io/github/issues/yourusername/carbonpilot?style=flat-square&color=1a5f4a" alt="Issues"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/yourusername/carbonpilot?style=flat-square&color=1a5f4a" alt="License"></a>
</p>

<p align="center">
  <a href="#demo">Demo</a> ·
  <a href="#features">Features</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#contributing">Contributing</a>
</p>

---

## Demo

**Live site:** [https://yourusername.github.io/carbonpilot](https://yourusername.github.io/carbonpilot)

No build step. No dependencies to install. Just open `index.html` in a browser.

---

## Features

- **Carbon Assessment** — Step-by-step wizard (transport, diet, energy, shopping, travel)
- **Interactive Dashboard** — Live charts, category breakdowns, monthly trends
- **Next Best Action** — AI-picked highest-impact carbon reduction step
- **What-If Simulator** — Real-time sliders modeling habit changes with live CO₂ projections
- **AI Coach** — Context-aware chatbot that knows your full footprint profile
- **Progress Tracker** — Streaks, achievements, weekly savings, goal tracking
- **Fully Responsive** — Desktop sidebar + mobile bottom navigation
- **Dark Mode** — Automatic via `prefers-color-scheme`
- **Accessible** — ARIA labels, semantic HTML, keyboard navigation

---

## Quick Start

```bash
git clone https://github.com/yourusername/carbonpilot.git
cd carbonpilot
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

Or serve locally:

```bash
python -m http.server 8000
# Visit http://localhost:8000
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 (semantic, ARIA) |
| Styling | Vanilla CSS3 (custom properties, no framework) |
| Logic | Vanilla ES6+ JavaScript |
| Charts | [Chart.js](https://www.chartjs.org/) (CDN) |
| Icons | Inline SVG sprite |
| Fonts | [Inter](https://rsms.me/inter/) (Google Fonts) |

**Zero build step.** No bundler, no npm, no framework.

---

## Project Structure

```
carbonpilot/
├── index.html                 # Main app shell
├── css/
│   ├── design-system.css      # Variables, reset, base
│   ├── layout.css             # Grid, sidebar, topbar, nav
│   └── components.css         # Cards, buttons, forms, etc.
├── js/
│   └── app.js                 # All app logic, charts, sim, coach
├── assets/
│   ├── logo.svg               # Brand logo
│   └── favicon.svg            # Favicon
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## Roadmap

- [ ] PWA support (service worker + offline)
- [ ] LocalStorage persistence
- [ ] PDF export for reports
- [ ] Multi-language support
- [ ] Backend + real leaderboards
- [ ] Manual dark mode toggle

---

## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## License

MIT. See [LICENSE](LICENSE).

---

<p align="center">
  Built with care by <a href="https://github.com/yourusername">Your Name</a>
</p>
