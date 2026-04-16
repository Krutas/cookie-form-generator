# Repository Guidelines

## Project Structure & Module Organization

This is a client-side web application that transforms images into 3D-printable cookie cutters.

```
cookie-form-generator/
├── index.html              # Main application entry point
├── AGENTS.md               # This contributor guide
├── css/
│   └── styles.css          # Application styles and layout
├── js/
│   ├── app.js              # Main application logic
│   ├── segmentation.js     # TensorFlow.js BodyPix integration
│   ├── segmentation-models.js  # Model registry
│   ├── contour.js          # Contour extraction algorithms
│   ├── geometry.js         # 3D geometry generation
│   ├── drawing.js          # Custom shape drawing tools
│   ├── stl-exporter.js     # Binary STL file export
│   └── viewer.js           # Three.js 3D viewer
└── docs/
    └── screenshot.png        # Documentation assets
```

**Module Responsibilities**:
- \`app.js\` - UI event handling, application state management
- \`viewer.js\` - Three.js 3D rendering
- \`geometry.js\` - 3D mesh generation
- \`contour.js\` - Image processing, contour detection
- \`drawing.js\` - Canvas-based shape drawing
- \`segmentation.js\` & \`segmentation-models.js\` - AI model loading
- \`stl-exporter.js\` - Binary STL file generation

## Development Commands

This project requires no build step. Run locally using any static file server:

\`\`\`bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx serve .

# PHP
php -S localhost:8000
\`\`\`

Then open \`http://localhost:8000\` in a browser.

## Coding Style & Naming Conventions

- **Indentation**: 4 spaces (no tabs)
- **Quotes**: Prefer single quotes for strings
- **Naming**: \`camelCase\` for variables and functions, \`PascalCase\` for classes
- **Constants**: \`UPPER_SNAKE_CASE\` for true constants
- **Semicolons**: Use semicolons to terminate statements

## Testing Guidelines

Manual testing checklist:
1. Image upload - JPG, PNG, WebP via drag-drop
2. Segmentation - Threshold adjustment
3. Multiple contour selection
4. 3D preview and STL export
5. Drawing tools - circles and rectangles
6. Inner cutouts (donut shapes)
7. Size presets - Cookie, Biscuit, Large buttons

## Commit & Pull Request Guidelines

**Commit Messages**: Use clear, descriptive messages:

\`\`\`
feat: add multiple contour selection
fix: resolve contour smoothing
docs: update README with new features
\`\`\`

## Agent-Specific Instructions

- **No build tools**: Do not add npm, webpack, or build pipelines
- **CDN dependencies**: Libraries loaded via CDN, do not install via npm
- **Browser APIs**: Use widely-supported APIs, avoid experimental features
- **ES6 modules**: New files can use \`import/export\` if needed

## Feature Implementation Status

| Feature | Status |
|---------|--------|
| Image Upload & Segmentation | ✅ Complete |
| Single Contour Extraction | ✅ Complete |
| 3D Preview & Export | ✅ Complete |
| Multiple Contour Selection | ✅ Complete |
| Custom Shape Drawing | ✅ Complete |
| Inner Cutouts (Donuts) | ✅ Complete |
| Additional Segmentation Models | ✅ Complete |
| Preset Size Templates | ✅ Complete |
