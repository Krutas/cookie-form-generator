# Cookie Form Generator - New Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Implement five new features to enhance the cookie cutter generator: multiple contour selection, custom shape drawing, inner cutouts support, additional segmentation models, and preset size templates.

**Architecture:** Features are independent - each adds new UI controls and modifies specific JS modules. Follow existing patterns in js/app.js, js/viewer.js, and js/geometry.js.

**Tech Stack:** Vanilla JavaScript, Three.js for 3D, TensorFlow.js for segmentation, HTML5 Canvas for 2D operations.

---

## Feature A: Multiple Contour Selection

**Description:** Allow users to select and combine multiple detected contours from an image instead of just the largest one.

**Files:**
- Modify: js/contour.js - add multi-contour detection and selection
- Modify: js/app.js - add UI for contour selection list
- Modify: js/viewer.js - render multiple selected contours
- Modify: index.html - add contour list UI section
- Modify: css/styles.css - add contour list styles

### Task A1: Detect Multiple Contours

- [ ] **Step 1: Modify findContours() in js/contour.js**

Change the function to return all valid contours above a minimum area threshold, not just the largest one.

- [ ] **Step 2: Add MIN_CONTOUR_AREA constant**

Set MIN_CONTOUR_AREA = 100 pixels.

- [ ] **Step 3: Verify multiple contours are detected**

Test with an image containing multiple objects and verify multiple contours are returned.

---

### Task A2: Add Contour Selection UI

- [ ] **Step 1: Add HTML section in index.html**

Add a new panel section for contour selection with checkboxes for each detected contour.

- [ ] **Step 2: Add CSS in css/styles.css**

Add styles for .contour-list, .contour-item, and selected state.

- [ ] **Step 3: Render contour list in js/app.js**

Populate the list with detected contours after segmentation completes.

---

### Task A3: Combine Selected Contours into 3D Model

- [ ] **Step 1: Modify js/geometry.js**

Add function to generate geometry from multiple contours.

- [ ] **Step 2: Wire up Combine Selected button in js/app.js**

Handle click events and pass selected contours to viewer.

- [ ] **Step 3: Test multi-contour generation**

Verify 3D preview shows all selected shapes.

---

## Feature B: Custom Shape Drawing

**Description:** Allow users to draw custom shapes (circle, rectangle, freehand) directly on canvas.

**Files:**
- Create: js/drawing.js - drawing tools and shape creation
- Modify: index.html - add drawing mode toggle
- Modify: js/app.js - integrate drawing mode
- Modify: css/styles.css - add drawing tool styles

### Task B1: Create Drawing Module

- [ ] **Step 1: Create js/drawing.js**

Implement DrawingTools object with circle, rectangle, and freehand modes.

- [ ] **Step 2: Add event handlers**

Handle mousedown, mousemove, mouseup for canvas drawing.

- [ ] **Step 3: Convert drawn shapes to contour format**

Add getShapeAsContour() function to export shapes for geometry generation.

---

### Task B2: Add Drawing Mode UI

- [ ] **Step 1: Add tool buttons in index.html**

Add Circle, Rectangle, and Freehand tool buttons.

- [ ] **Step 2: Add styles in css/styles.css**

Style the drawing canvas and tool buttons with active states.

- [ ] **Step 3: Initialize drawing in js/app.js**

Wire up tool buttons and integrate with app flow.

---

## Feature C: Inner Cutouts (Donut Shapes)

**Description:** Support cookie cutters with holes inside by detecting inner contours and subtracting them from the outer shape.

**Files:**
- Modify: js/contour.js - detect inner/outer contours with hierarchy
- Modify: js/geometry.js - subtract inner shapes from outer shape
- Modify: index.html - add checkbox for include inner cutouts
- Modify: js/app.js - wire checkbox to generation

### Task C1: Detect Inner Contours

- [ ] **Step 1: Modify js/contour.js**

Add findContoursWithHierarchy() function that determines if contours are outer or holes.

- [ ] **Step 2: Implement contour hierarchy detection**

Use point-in-contour tests to determine parent-child relationships.

- [ ] **Step 3: Export hierarchy data**

Return structure with contour, parent index, isOuter, isHole flags.

---

### Task C2: Generate Geometry with Holes

- [ ] **Step 1: Modify js/geometry.js**

Update generateContourGeometry to accept holes array and use THREE.Shape with holes.

- [ ] **Step 2: Add Include Inner Cutouts checkbox in index.html**

Add checkbox in the 3D settings panel.

- [ ] **Step 3: Wire checkbox to generation in js/app.js**

Pass hole contours to geometry generator when checkbox is enabled.

---

## Feature D: Additional Segmentation Models

**Description:** Add support for alternative segmentation models beyond BodyPix.

**Files:**
- Create: js/segmentation-models.js - model registry
- Modify: js/segmentation.js - support multiple backends
- Modify: index.html - add model selection dropdown

### Task D1: Create Model Registry

- [ ] **Step 1: Create js/segmentation-models.js**

Define SegmentationModels object with bodypix and deeplab configurations.

- [ ] **Step 2: Implement loadModel() function**

Load and cache models on demand.

- [ ] **Step 3: Export model interface**

Provide uniform segment() method across all models.

---

### Task D2: Add Model Selection UI

- [ ] **Step 1: Add dropdown in index.html**

Add model selection dropdown before segmentation controls.

- [ ] **Step 2: Wire selection to model loading in js/segmentation.js**

Load selected model on change event.

- [ ] **Step 3: Initialize with default model**

Load bodypix by default on startup.

---

## Feature E: Preset Size Templates

**Description:** Add quick-select presets for common sizes: Cookie (50mm), Biscuit (70mm), Large (100mm).

**Files:**
- Modify: index.html - add preset buttons
- Modify: js/app.js - handle preset selection
- Modify: css/styles.css - style preset buttons

### Task E1: Add Preset UI

- [ ] **Step 1: Add preset buttons in index.html**

Add Quick Sizes section with three preset buttons.

- [ ] **Step 2: Add styles in css/styles.css**

Style .preset-sizes and .preset-btn.

- [ ] **Step 3: Handle preset clicks in js/app.js**

Calculate and set scale factor based on selected preset size.

---

## Summary

Each feature is independent and can be implemented in parallel:

- Feature A (Multiple Contours): js/contour.js, js/geometry.js, index.html, css/styles.css
- Feature B (Custom Drawing): js/drawing.js (new), index.html, js/app.js, css/styles.css  
- Feature C (Inner Cutouts): js/contour.js, js/geometry.js, index.html, js/app.js
- Feature D (More Models): js/segmentation-models.js (new), js/segmentation.js, index.html
- Feature E (Size Presets): js/app.js, index.html, css/styles.css

No conflicts between features - each touches different primary modules.
