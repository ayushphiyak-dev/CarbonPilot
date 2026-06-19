# Contributing to CarbonPilot

First off, thanks for taking the time to contribute! 🌱

## Code of Conduct

This project and everyone participating in it is governed by our commitment to kindness and respect. Harassment or toxic behavior of any kind will not be tolerated.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check the [existing issues](https://github.com/yourusername/carbonpilot/issues) to see if the problem has already been reported. If it has and the issue is still open, add a comment to the existing issue instead of opening a new one.

When creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Describe the behavior you observed and why it's a problem**
- **Include screenshots or GIFs** if applicable
- **Specify your environment:** browser, OS, screen size

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some other applications where this enhancement exists, if applicable**

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've changed the UI, update the screenshots in `assets/`.
3. If you've added features that need explanation, update the README.
4. Ensure your code follows the existing style.
5. Issue the pull request!

## Style Guidelines

### HTML
- Use semantic elements (`<nav>`, `<main>`, `<section>`, etc.)
- Include ARIA labels for accessibility
- Keep indentation at 2 spaces

### CSS
- Use CSS custom properties (variables) for colors and spacing
- Follow BEM-like naming for classes when possible
- Mobile-first responsive design

### JavaScript
- Use ES6+ features (const/let, arrow functions, template literals)
- Keep functions small and focused
- Add comments for complex logic

## Development Setup

Since this is a vanilla HTML/CSS/JS project, no build step is required:

```bash
git clone https://github.com/yourusername/carbonpilot.git
cd carbonpilot
open index.html
```

For live reload during development:

```bash
npx serve .     # or python -m http.server 8000
```

## Questions?

Feel free to [open an issue](https://github.com/yourusername/carbonpilot/issues) with your question or reach out in discussions.
