# Repository Guidelines

## Project Structure & Module Organization

This is a client-side web application that transforms images into 3D-printable cookie cutters.

```
cookie-form-generator/
├── index.html          # Main application entry point
├── css/
│   └── styles.css      # Application styles and layout
├── js/
│   ├── app.js          # Main application logic and event handling
│   ├── segmentation.js # TensorFlow.js BodyPix integration for AI segmentation
│   ├── contour.js      # Contour extraction algorithms (marching squares)
│   ├── geometry.js     # 3D geometry generation from 2D contours
│   ├── stl-exporter.js # Binary STL file export functionality
│   └── viewer.js       # Three.js 3D viewer and rendering
└── docs/
    └── screenshot.png    # Documentation assets
```

**Module Responsibilities**: Each JavaScript file has a single, well-defined responsibility. Keep logic separated—UI in `app.js`, 3D rendering in `viewer.js`, and geometry operations in `geometry.js`.

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

**Example**:
```javascript
const DEFAULT_HEIGHT = 10;

function extractContours(maskData, width, height) {
    const contours = [];
    // ...
    return contours;
}
```

## Testing Guidelines

This project currently has no automated test suite. Manual testing checklist:

1. Image upload (JPG, PNG, WebP) via drag-drop and file picker
2. Segmentation threshold adjustment (0.0–1.0 range)
3. Contour extraction and preview rendering
4. 3D model generation with varying height/thickness/scale
5. STL export produces valid binary files

Test across Chrome, Firefox, and Safari. WebGL support is required.

## Commit & Pull Request Guidelines

**Commit Messages**: Use clear, descriptive messages in present tense:

```
Add scale calibration feature
Fix contour smoothing for small images
Update README with architecture diagram
```

**Pull Requests**: 
- Include a concise description of changes
- Reference any related issues
- Verify the application loads without console errors
- Test image upload → segmentation → STL export flow end-to-end

## Agent-Specific Instructions

When modifying code:

- **No build tools**: Do not add npm, webpack, or build pipelines. The app must run directly by opening `index.html`.
- **CDN dependencies**: External libraries (Three.js, TensorFlow.js) are loaded via CDN in `index.html`. Do not install via npm.
- **Browser APIs**: Use modern but widely-supported APIs. Avoid experimental features.
- **Canvas operations**: Be mindful of memory leaks when working with `ImageData` and Canvas contexts—always dereference large buffers when done.

