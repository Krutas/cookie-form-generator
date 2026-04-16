# 🍪 Cookie Form Generator

A web-based tool that transforms images into 3D-printable cookie cutters. Built with Three.js and TensorFlow.js, running entirely in your browser.

![Cookie Form Generator](docs/screenshot.png)

## ✨ Features

### Core Features
- **Image Upload** - Drag & drop or click to upload JPG, PNG, or WebP images
- **AI Segmentation** - Uses TensorFlow.js BodyPix to automatically extract shapes from images
- **Contour Detection** - Traces the outline of detected objects with marching squares algorithm
- **3D Preview** - Real-time Three.js visualization of the cookie cutter
- **Scale Calibration** - Calibrate real-world measurements for accurate sizing
- **STL Export** - Download ready-to-print 3D files

### New Features
- **Multiple Contour Selection** - Select and combine multiple shapes from a single image
- **Custom Shape Drawing** - Draw circles and rectangles directly on canvas (no image upload needed)
- **Inner Cutouts (Donut Shapes)** - Create cookie cutters with holes inside (like letter O or ring shapes)
- **Segmentation Model Selection** - Choose between different AI models for object detection
- **Quick Size Presets** - One-click sizing: Cookie (50mm), Biscuit (70mm), Large (100mm)

## 🚀 Quick Start

1. Open `index.html` in a modern web browser
2. Upload an image or draw a custom shape
3. Adjust the segmentation threshold to isolate your object
4. Configure wall thickness, extrusion height, and enable inner cutouts if needed
5. Use Quick Size presets or manual calibration for accurate sizing
6. Click **Generate 3D Model**, then **Download STL** for 3D printing

## 🏗️ Architecture

### Technologies
- **Three.js** - 3D rendering and geometry generation
- **TensorFlow.js + BodyPix** - AI-powered image segmentation
- **HTML5 Canvas** - Image processing and contour extraction

### File Structure
```
cookie-form-generator/
├── index.html                  # Main application UI
├── AGENTS.md                   # Contributor guidelines
├── css/
│   └── styles.css              # Application styles
├── js/
│   ├── app.js                  # Main application logic
│   ├── segmentation.js         # TensorFlow.js BodyPix integration
│   ├── segmentation-models.js  # Multi-model segmentation support
│   ├── contour.js              # Contour extraction (marching squares)
│   ├── geometry.js             # 3D geometry generation with holes
│   ├── drawing.js              # Canvas drawing tools
│   ├── stl-exporter.js         # STL file export
│   └── viewer.js               # Three.js 3D viewer
└── docs/
    └── screenshot.png            # Documentation assets
```

## 📖 Usage Guide

### 1. Import Image or Draw Shape

**Option A: Upload Image**
Click or drag an image onto the upload area. Supports JPG, PNG, and WebP formats.

**Option B: Draw Custom Shape**
Use the drawing tools to create circles or rectangles directly on canvas—no image required!

### 2. Segmentation

Select your segmentation model from the dropdown, then adjust the **Threshold** slider:
- Lower values = more inclusive (may include background)
- Higher values = more strict (may cut off parts of object)

Use the **Smoothing** control to clean up jagged edges.

### 3. Contour Selection

After segmentation:
- **Single Contour**: The largest detected shape is used automatically
- **Multiple Contours**: Select multiple shapes from the contour list to combine them

### 4. 3D Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Extrusion Height | How tall the cutter walls are (mm) | 10mm |
| Wall Thickness | Thickness of the cutter walls (mm) | 2mm |
| Scale | Overall size scaling percentage | 100% |
| Inner Cutouts | Enable holes inside shapes (donut mode) | ✅ On |

### 5. Quick Size Presets

Click a preset button for instant sizing:
- 🍪 **Cookie (50mm)** - Standard cookie size
- 🥠 **Biscuit (70mm)** - Larger biscuit cutter
- 🍥 **Large (100mm)** - Extra large shapes

### 6. Scale Calibration

For precise real-world sizing:
1. Click two points on the image to measure pixel distance
2. Enter the real-world distance in millimeters
3. Click "Apply" to scale the model

### 7. Generate & Download

Click **Generate 3D Model** to create the preview, then **Download STL** to get your printable file.

## 🛠️ Development

### Prerequisites
- Modern browser with WebGL support
- No server required—runs entirely client-side

### Local Development
Simply open `index.html` in your browser:

```bash
# Using Python's simple server (optional)
python -m http.server 8000

# Or using Node.js
npx serve .
```

### Project Conventions

See [AGENTS.md](AGENTS.md) for detailed contributor guidelines including:
- Project structure and module organization
- Coding style (4-space indentation, camelCase naming)
- Testing guidelines
- Commit message conventions

## 🔧 Technical Details

### Segmentation Pipeline
1. **Model Selection** - Choose between available segmentation models
2. **BodyPix** - MobileNetV1 architecture for fast client-side inference
3. **Person/Object Detection** - Isolates subjects from background
4. **Mask Smoothing** - Applies iterative smoothing to reduce noise

### Contour Extraction
- **Marching Squares** algorithm traces object boundaries
- **Ramer-Douglas-Peucker** simplification reduces point count
- **Contour Hierarchy** - Detects inner/outer relationships for donut shapes
- Edge detection with 8-connectivity neighborhood

### 3D Geometry Generation
- **Extrusion** creates walls from the 2D contour
- **Outer + Inner** walls create the cutting edge
- **Holes Array** - THREE.Shape.holes for inner cutouts
- **Base** connects the walls for structural integrity

### STL Export
- Binary STL format for smaller file sizes
- Right-hand rule triangle winding
- Millimeter units (standard for 3D printing)

## 📝 License

MIT License - See [LICENSE](LICENSE) file

## 🤝 Contributing

Contributions welcome! Check [AGENTS.md](AGENTS.md) for guidelines.

### Implemented Features
- ✅ Multiple contour selection
- ✅ Custom shape drawing
- ✅ Support for inner cutouts (donut shapes)
- ✅ Additional segmentation models
- ✅ Preset size templates (cookie, biscuit, etc.)

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) - 3D library
- [TensorFlow.js](https://www.tensorflow.org/js) - ML framework
- [BodyPix](https://github.com/tensorflow/tfjs-models/tree/master/body-pix) - Segmentation model
