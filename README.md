<p align="center">
  <img src="https://raw.githubusercontent.com/yourusername/carbonpilot/main/assets/logo.svg" width="120" alt="CarbonPilot logo">
</p>

<h1 align="center">CarbonPilot</h1>
<p align="center">
  <b>A responsive web app to assess, track, and reduce your carbon footprint.</b><br>
  Built with vanilla HTML/CSS/JS — no build step, no dependencies.
</p>

<p align="center">
  <a href="https://github.com/yourusername/carbonpilot/stargazers"><img src="https://img.shields.io/github/stars/yourusername/carbonpilot?style=flat-square&color=166534" alt="Stars"></a>
  <a href="https://github.com/yourusername/carbonpilot/network/members"><img src="https://img.shields.io/github/forks/yourusername/carbonpilot?style=flat-square&color=166534" alt="Forks"></a>
  <a href="https://github.com/yourusername/carbonpilot/issues"><img src="https://img.shields.io/github/issues/yourusername/carbonpilot?style=flat-square&color=166534" alt="Issues"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/yourusername/carbonpilot?style=flat-square&color=166534" alt="License"></a>
</p>

<p align="center">
  <a href="#-demo">Demo</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-screenshots">Screenshots</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-contributing">Contributing</a>
</p>

---

## 🚀 Demo

**Live preview:** [https://yourusername.github.io/carbonpilot](https://yourusername.github.io/carbonpilot)

Open the `index.html` file in any modern browser — no server required. The app is fully responsive and works offline.

---

## ✨ Features

- **📊 Carbon Assessment** — Step-by-step wizard covering transport, diet, energy, shopping, and travel.
- **📈 Interactive Dashboard** — Live charts (Chart.js), category breakdowns, and monthly trends.
- **⚡ Next Best Action** — AI-picked highest-impact, most achievable carbon-reduction step.
- **🔧 What-If Simulator** — Real-time sliders to model habit changes and see projected CO₂ savings.
- **🤖 AI Coach** — Context-aware chatbot that knows your full footprint profile.
- **🏆 Progress Tracker** — Streaks, achievements, weekly savings bars, and goal tracking.
- **📱 Fully Responsive** — Desktop sidebar + top nav, mobile bottom nav, adaptive grids.
- **🌙 Dark Mode Ready** — Respects `prefers-color-scheme: dark` automatically.
- **♿ Accessible** — ARIA labels, semantic HTML, keyboard-navigable, screen-reader friendly.

---

## 🖥️ Screenshots

<p align="center">
  <img src="assets/screenshot-dashboard.png" width="700" alt="Dashboard view">
</p>
<p align="center"><i>Dashboard — overview of footprint, trends, and breakdown</i></p>

<p align="center">
  <img src="assets/screenshot-simulator.png" width="700" alt="Simulator view">
</p>
<p align="center"><i>What-If Simulator — adjust sliders and see live CO₂ projections</i></p>

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 (semantic, ARIA-enhanced) |
| Styling | Vanilla CSS3 with CSS custom properties (variables) |
| Logic | Vanilla ES6+ JavaScript (no frameworks) |
| Charts | [Chart.js](https://www.chartjs.org/) (loaded via CDN) |
| Icons | [Tabler Icons](https://tabler-icons.io/) (loaded via CDN) |
| Fonts | System font stack (no external font files) |

**Zero build step.** Clone, open `index.html`, and it runs.

---

## ⚡ Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/carbonpilot.git
cd carbonpilot
```

### 2. Open in browser

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

Or simply double-click `index.html` — no server needed.

### 3. (Optional) Serve locally

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# Then visit http://localhost:8000
```

---

## 📁 Project Structure

```
carbonpilot/
├── index.html              # Main application (single-file)
├── assets/
│   ├── logo.svg            # Project logo
│   ├── screenshot-*.png    # README screenshots
│   └── favicon.ico
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── LICENSE
└── README.md
```

> **Note:** The entire app lives in a single `index.html` for maximum portability. All styles and scripts are inline; only Chart.js and Tabler Icons are fetched from CDN.

---

## 🧪 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## 🗺️ Roadmap

- [ ] PWA support (service worker + offline mode)
- [ ] LocalStorage persistence for assessment data
- [ ] Export footprint report as PDF
- [ ] Multi-language support (i18n)
- [ ] Backend integration for real community leaderboards
- [ ] Dark mode toggle (manual override)

See the [open issues](https://github.com/yourusername/carbonpilot/issues) for a full list of proposed features and known bugs.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and development process.

---

## 📝 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

## 🙏 Acknowledgments

- [Chart.js](https://www.chartjs.org/) — beautiful, simple charts
- [Tabler Icons](https://tabler-icons.io/) — crisp, consistent icons
- [Shields.io](https://shields.io/) — README badges
- [GitHub README Template](https://github.com/othneildrew/Best-README-Template) — structure inspiration

---

<p align="center">
  Made with 🌱 by <a href="https://github.com/yourusername">Your Name</a>
</p>
