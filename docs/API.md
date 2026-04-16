# API Documentation

## JavaScript Modules

### SegmentationProcessor

Handles AI-powered image segmentation using TensorFlow.js BodyPix.

#### Constructor
```javascript
const processor = new SegmentationProcessor();
```

#### Methods

##### `loadModel()`
Loads the BodyPix model. Returns a Promise.
```javascript
await processor.loadModel();
```

##### `segmentImage(imageElement, threshold)`
Segments an image to isolate the foreground subject.

**Parameters:**
- `imageElement` (HTMLImageElement) - Source image
- `threshold` (number, optional) - Segmentation threshold (0-1), default 0.5

**Returns:** `Promise<Segmentation>`

```javascript
const segmentation = await processor.segmentImage(img, 0.5);
```

##### `createMaskCanvas(segmentation, width, height)`
Creates a canvas with the binary mask.

**Returns:** `HTMLCanvasElement`

##### `smoothMask(mask, width, height, iterations)`
Applies smoothing to reduce noise in the mask.

**Parameters:**
- `mask` (Uint8Array) - Binary mask data
- `width` (number) - Mask width
- `height` (number) - Mask height
- `iterations` (number) - Smoothing iterations

**Returns:** `Uint8Array` - Smoothed mask

---

### ContourExtractor

Extracts vector contours from binary masks.

#### Constructor
```javascript
const extractor = new ContourExtractor();
```

#### Methods

##### `extractContours(maskCanvas)`
Extracts all contours from a binary mask.

**Parameters:**
- `maskCanvas` (HTMLCanvasElement) - Binary mask canvas

**Returns:** `Array<Array<{x: number, y: number}>>` - Array of contours

```javascript
const contours = extractor.extractContours(maskCanvas);
```

##### `simplifyContour(contour)`
Simplifies a contour using the Ramer-Douglas-Peucker algorithm.

**Parameters:**
- `contour` (Array<{x, y}>) - Input contour

**Returns:** `Array<{x: number, y: number}>` - Simplified contour

##### `calculateArea(contour)`
Calculates the area of a contour using the shoelace formula.

**Parameters:**
- `contour` (Array<{x, y}>) - Closed contour

**Returns:** `number` - Area in square pixels

##### `drawContours(canvas, contours, color)`
Renders contours to a canvas for visualization.

**Parameters:**
- `canvas` (HTMLCanvasElement) - Target canvas
- `contours` (Array) - Contours to draw
- `color` (string, optional) - Stroke color, default '#4a90d9'

---

### GeometryGenerator

Generates 3D geometry from 2D contours.

#### Constructor
```javascript
const generator = new GeometryGenerator();
```

#### Methods

##### `createExtrudedGeometry(contour, height, wallThickness)`
Creates an extruded 3D shape from a 2D contour.

**Parameters:**
- `contour` (Array<{x, y}>) - Outer contour in mm
- `height` (number) - Extrusion height in mm
- `wallThickness` (number) - Wall thickness in mm

**Returns:** `THREE.BufferGeometry` - Extruded geometry

```javascript
const geometry = generator.createExtrudedGeometry(contour, 10, 2);
```

##### `createCookieCutter(outerContour, height, wallThickness)`
Creates a complete cookie cutter geometry with inner and outer walls.

**Parameters:**
- `outerContour` (Array<{x, y}>) - Outer shape contour
- `height` (number) - Cutter height in mm
- `wallThickness` (number) - Wall thickness in mm

**Returns:** `THREE.BufferGeometry` - Complete cookie cutter

##### `scaleContour(contour, scale)`
Scales a contour uniformly.

**Parameters:**
- `contour` (Array<{x, y}>) - Original contour
- `scale` (number) - Scale factor

**Returns:** `Array<{x: number, y: number}>` - Scaled contour

---

### STLExporter

Exports Three.js geometry to STL format.

#### Constructor
```javascript
const exporter = new STLExporter();
```

#### Methods

##### `exportBinary(geometry, filename)`
Exports geometry as binary STL and triggers download.

**Parameters:**
- `geometry` (THREE.BufferGeometry) - Geometry to export
- `filename` (string, optional) - Download filename

```javascript
exporter.exportBinary(geometry, 'cookie-cutter.stl');
```

##### `generateBinarySTL(geometry)`
Generates binary STL data without downloading.

**Parameters:**
- `geometry` (THREE.BufferGeometry) - Source geometry

**Returns:** `ArrayBuffer` - Binary STL data

---

### Viewer3D

Manages the Three.js 3D viewer.

#### Constructor
```javascript
const viewer = new Viewer3D(containerElement);
```

**Parameters:**
- `containerElement` (HTMLElement) - Container for the 3D view

#### Methods

##### `initialize()`
Sets up the Three.js scene, camera, and renderer.
```javascript
viewer.initialize();
```

##### `setGeometry(geometry)`
Displays geometry in the viewer.

**Parameters:**
- `geometry` (THREE.BufferGeometry) - Geometry to display

##### `resetView()`
Resets camera to default position.

##### `dispose()`
Cleans up resources and removes the renderer.

---

## Events

The application uses a simple event system for component communication.

### Available Events

| Event | Description | Payload |
|-------|-------------|---------|
| `image:loaded` | Image uploaded | `{ image: HTMLImageElement }` |
| `segmentation:complete` | Segmentation done | `{ mask: HTMLCanvasElement }` |
| `contour:extracted` | Contours extracted | `{ contours: Array }` |
| `geometry:generated` | 3D geometry created | `{ geometry: THREE.BufferGeometry }` |
| `scale:changed` | Scale calibrated | `{ scale: number }` |

### Event Usage
```javascript
// Listen
document.addEventListener('segmentation:complete', (e) => {
    console.log('Mask ready:', e.detail.mask);
});

// Emit
const event = new CustomEvent('geometry:generated', {
    detail: { geometry: myGeometry }
});
document.dispatchEvent(event);
```
