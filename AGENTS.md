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
│   ├── app.js              # Main application logic and event handling
│   ├── segmentation.js     # TensorFlow.js BodyPix integration
│   ├── segmentation-models.js  # Model registry for multiple segmentation backends
│   ├── contour.js          # Contour extraction algorithms (marching squares)
│   ├── geometry.js         # 3D geometry generation from 2D contours
│   ├── drawing.js          # Custom shape drawing tools (circles, rectangles)
│   ├── stl-exporter.js     # Binary STL file export functionality
│   └── viewer.js           # Three.js 3D viewer and rendering
└── docs/
    ├── screenshot.png        # Documentation assets
    └── superpowers/
        └── plans/            # Implementation plans
```

**Module Responsibilities**:
- `app.js` - UI event handling, application state management
- `viewer.js` - Three.js 3D rendering and scene management
- `geometry.js` - 3D mesh generation and extrusion operations
- `contour.js` - Image processing, contour detection and hierarchy analysis
- `drawing.js` - Canvas-based shape drawing (circles, rectangles, freehand)
- `segmentation.js` & `segmentation-models.js` - AI model loading and image segmentation
- `stl-exporter.js` - Binary STL file generation for 3D printing

Keep logic separated by responsibility. Each file should have one clear purpose.

## Development Commands

This project requires no build step. Run locally using any static file server:

```bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx serve .

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in a browser.

## Coding Style & Naming Conventions

- **Indentation**: 4 spaces (no tabs)
- **Quotes**: Prefer single quotes for strings
- **Naming**: `camelCase` for variables and functions, `PascalCase` for classes
- **Constants**: `UPPER_SNAKE_CASE` for true constants (e.g., `DEFAULT_HEIGHT = 10`)
- **Semicolons**: Use semicolons to terminate statements
- **Line length**: Aim for ~100 characters, but don't obsessively break lines

**Example**:
```javascript
const MIN_CONTOUR_AREA = 100;

function extractContours(maskData, width, height) {
    const contours = [];
    // ... logic here ...
    return contours.filter(c => calculateArea(c) > MIN_CONTOUR_AREA);
}
```

## Testing Guidelines

This project currently has no automated test suite. Manual testing checklist:

### Core Features
1. **Image upload** - JPG, PNG, WebP via drag-drop and file picker
2. **Segmentation** - Threshold adjustment (0.0–1.0 range) with model selection
3. **Contour extraction** - Single and multiple contour detection
4. **3D preview** - Height, thickness, and scale adjustments
5. **STL export** - Downloaded files load correctly in 3D slicers

### New Features (Test Each)
- **Multiple contours** - Select multiple shapes from one image
- **Drawing tools** - Draw circles and rectangles on canvas
- **Size presets** - Cookie (50mm), Biscuit (70mm), Large (100mm) buttons
- **Inner cutouts** - Donut/hole shapes (when enabled)

**Browser Support**: Chrome, Firefox, Safari with WebGL enabled.

## Commit & Pull Request Guidelines

**Commit Messages**: Use clear, descriptive messages in present tense:

```
feat: add multiple contour selection
fix: resolve contour smoothing for small images  
docs: update README with new features
refactor: extract segmentation models to separate module
```

**Pull Requests**: 
- Include a concise description of changes
- Reference related issues with `Fixes #123`
- Verify the app loads without console errors
- Test full workflow: upload → segment → generate → export

## Agent-Specific Instructions

When modifying code:

- **No build tools**: Do not add npm, webpack, or build pipelines. The app must run directly by opening `index.html`.
- **CDN dependencies**: External libraries (Three.js, TensorFlow.js) are loaded via CDN in `index.html`. Do not install via npm.
- **Browser APIs**: Use modern but widely-supported APIs. Avoid experimental features.
- **Canvas operations**: Be mindful of memory leaks when working with `ImageData` and Canvas contexts—always dereference large buffers when done.
- **ES6 modules**: New files can use `import/export` if needed; add `type="module"` to script tags.

## Feature Implementation Status

| Feature | Status | Files Modified |
|---------|--------|----------------|
| Image Upload & Segmentation | ✅ Complete | `js/segmentation.js`, `index.html` |
| Single Contour Extraction | ✅ Complete | `js/contour.js` |
| 3D Preview & Export | ✅ Complete | `js/viewer.js`, `js/geometry.js`, `js/stl-exporter.js` |
| Multiple Contour Selection | 🔄 In Progress | `js/contour.js`, `js/app.js`, `js/viewer.js` |
| Custom Shape Drawing | 🔄 In Progress | `js/drawing.js` (new), `index.html` |
| Inner Cutouts (Donuts) | 🔄 In Progress | `js/contour.js`, `js/geometry.js` |
| Additional Segmentation Models | 🔄 In Progress | `js/segmentation-models.js` (new) |
| Preset Size Templates | ✅ Complete | `js/app.js`, `index.html`, `css/styles.css` |
