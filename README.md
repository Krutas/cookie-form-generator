# 🍪 Cookie Form Generator

A web-based tool that transforms images into 3D-printable cookie cutters. Built with Three.js and TensorFlow.js, running entirely in your browser.

![Cookie Form Generator](docs/screenshot.png)

## ✨ Features

- **Image Upload** - Drag & drop or click to upload JPG, PNG, or WebP images
- **AI Segmentation** - Uses TensorFlow.js BodyPix to automatically extract shapes from images
- **Contour Detection** - Traces the outline of detected objects
- **3D Preview** - Real-time Three.js visualization of the cookie cutter
- **Scale Calibration** - Calibrate real-world measurements for accurate sizing
- **STL Export** - Download ready-to-print 3D files

## 🚀 Quick Start

1. Open `index.html` in a modern web browser
2. Upload an image containing the shape you want to cut
3. Adjust the segmentation threshold to isolate your object
4. Configure wall thickness and extrusion height
5. Download the STL file for 3D printing

## 🏗️ Architecture

### Technologies
- **Three.js** - 3D rendering and geometry generation
- **TensorFlow.js + BodyPix** - AI-powered image segmentation
- **HTML5 Canvas** - Image processing and contour extraction

### File Structure
```
cookie-form-generator/
├── index.html          # Main application UI
├── css/
│   └── styles.css      # Application styles
├── js/
│   ├── app.js          # Main application logic
│   ├── segmentation.js # TensorFlow.js BodyPix integration
│   ├── contour.js      # Contour extraction algorithms
│   ├── geometry.js     # 3D geometry generation
│   ├── stl-exporter.js # STL file export
│   └── viewer.js       # Three.js 3D viewer
└── README.md           # This file
```

## 📖 Usage Guide

### 1. Import Image
Click or drag an image onto the upload area. The tool supports JPG, PNG, and WebP formats.

### 2. Segmentation
The AI automatically detects the main subject in your image. Adjust the **Threshold** slider to fine-tune the detection:
- Lower values = more inclusive (may include background)
- Higher values = more strict (may cut off parts of object)

Use the **Smoothing** control to clean up jagged edges.

### 3. Contour Preview
After segmentation, the extracted outline is displayed as a preview. This shows the exact shape that will be used for the cookie cutter.

### 4. 3D Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Extrusion Height | How tall the cutter walls are (mm) | 10mm |
| Wall Thickness | Thickness of the cutter walls (mm) | 2mm |
| Scale | Overall size scaling percentage | 100% |

### 5. Scale Calibration
For accurate real-world sizing:
1. Click two points on the image to measure pixel distance
2. Enter the real-world distance in millimeters
3. Click "Apply" to scale the model

### 6. Generate & Download
Click **Generate 3D Model** to create the preview, then **Download STL** to get your printable file.

## 🛠️ Development

### Prerequisites
- Modern browser with WebGL support
- No server required - runs entirely client-side

### Local Development
Simply open `index.html` in your browser:
```bash
# Using Python's simple server (optional)
python -m http.server 8000

# Or using Node.js
npx serve .
```

## 🔧 Technical Details

### Segmentation Pipeline
1. **BodyPix Model** - MobileNetV1 architecture for fast client-side inference
2. **Person Detection** - Isolates the primary subject from background
3. **Mask Smoothing** - Applies iterative smoothing to reduce noise

### Contour Extraction
- **Marching Squares** algorithm traces object boundaries
- **Ramer-Douglas-Peucker** simplification reduces point count
- Edge detection with 8-connectivity neighborhood

### 3D Geometry Generation
- **Extrusion** creates walls from the 2D contour
- **Outer + Inner** walls create the cutting edge
- **Base** connects the walls for structural integrity

### STL Export
- Binary STL format for smaller file sizes
- Right-hand rule triangle winding
- Millimeter units (standard for 3D printing)

## 📝 License

MIT License - See [LICENSE](LICENSE) file

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- [ ] Multiple contour selection
- [ ] Custom shape drawing
- [ ] Support for inner cutouts (donut shapes)
- [ ] Additional segmentation models
- [ ] Preset size templates (cookie, biscuit, etc.)

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) - 3D library
- [TensorFlow.js](https://www.tensorflow.org/js) - ML framework
- [BodyPix](https://github.com/tensorflow/tfjs-models/tree/master/body-pix) - Segmentation model
