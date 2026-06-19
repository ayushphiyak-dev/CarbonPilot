# Contributing to CarbonPilot

Thanks for your interest! This is a vanilla HTML/CSS/JS project — no build tools required.

## Setup

```bash
git clone https://github.com/yourusername/carbonpilot.git
cd carbonpilot
open index.html
```

For live reload during development:

```bash
npx serve .     # or python -m http.server 8000
```

## Guidelines

- **HTML**: Semantic elements, ARIA labels, 2-space indent
- **CSS**: Custom properties for theming, mobile-first, no frameworks
- **JS**: ES6+, small focused functions, comments for complex logic
- Keep the zero-dependency philosophy

## Pull Request Process

1. Update README/screenshots if UI changes
2. Test on Chrome, Firefox, Safari, and mobile
3. Ensure dark mode still works
4. Reference any related issues
