/**
 * Cookie Cutter Generator - Main Application
 * Ties together all modules and handles user interactions
 */

class App {
    constructor() {
        this.state = {
            currentImage: null,
            currentContours: null,
            currentGeometry: null,
            pixelScale: 1.0 // mm per pixel
        };

        this.modules = {};
        this.elements = {};
        
        this.init();
    }

    async init() {
        this.cacheElements();
        this.initModules();
        this.bindEvents();
        this.updateCalibration();
        
        console.log('Cookie Cutter Generator initialized');
    }

    cacheElements() {
        const ids = [
            'uploadArea', 'imageInput', 'sourceCanvas', 'segmentCanvas',
            'contourCanvas', 'segmentControls', 'contourControls',
            'segmentBtn', 'segmentStatus', 'thresholdSlider', 'smoothSlider',
            'heightInput', 'wallInput', 'scaleInput', 'calibrationPixels',
            'calibrationMm', 'applyCalibration', 'generateBtn', 'exportBtn', 'viewer3d',
            'drawingCanvas', 'useDrawingBtn', 'clearDrawingBtn'
        ];

        ids.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    }

    initModules() {
        this.modules.segmentation = new SegmentationProcessor();
        this.modules.contourExtractor = new ContourExtractor();
        this.modules.geometryGenerator = new GeometryGenerator();
        this.modules.stlExporter = new STLExporter();
        this.modules.viewer3d = new Viewer3D(this.elements.viewer3d);
        
        // Initialize DrawingTools
        if (typeof DrawingTools !== 'undefined') {
            DrawingTools.init(this.elements.drawingCanvas, () => { this.elements.useDrawingBtn.disabled = false; });
        }
    }

    bindEvents() {
        // Image upload - drag and drop
        this.elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.add('dragover');
        });

        this.elements.uploadArea.addEventListener('dragleave', () => {
            this.elements.uploadArea.classList.remove('dragover');
        });

        this.elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                this.handleImageUpload(files[0]);
            } else {
                this.showError('Please drop a valid image file');
            }
        });

        // Image upload - click
        this.elements.uploadArea.addEventListener('click', () => {
            this.elements.imageInput.click();
        });

        this.elements.imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleImageUpload(e.target.files[0]);
            }
        });

        // Segmentation button
        this.elements.segmentBtn.addEventListener('click', () => {
            this.runSegmentation();
        });

        // Generate 3D model button
        this.elements.generateBtn.addEventListener('click', () => {
            this.generate3DModel();
        });

        // Export STL button
        this.elements.exportBtn.addEventListener('click', () => {
            this.exportSTL();
        });

        // Calibration
        this.elements.applyCalibration.addEventListener('click', () => {
            this.updateCalibration();
        });

        // Slider inputs
        this.elements.thresholdSlider.addEventListener('input', () => {
            this.extractContours();
        });

        this.elements.smoothSlider.addEventListener('input', () => {
            this.extractContours();
        });
        
        // Drawing tool buttons
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.target.dataset.tool;
                this.selectDrawingTool(tool);
            });
        });
        
        // Use drawing button
        this.elements.useDrawingBtn.addEventListener('click', () => {
            this.useDrawingShape();
        });
        
        // Clear drawing button
        this.elements.clearDrawingBtn.addEventListener('click', () => {
            DrawingTools.clearShapes();
            this.elements.useDrawingBtn.disabled = true;
            this.deselectAllTools();
        });
    }
    
    selectDrawingTool(tool) {
        // Update UI
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        
        // Set drawing mode
        DrawingTools.setMode(tool);
    }
    
    deselectAllTools() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        DrawingTools.setMode('none');
    }
    
    useDrawingShape() {
        const contour = DrawingTools.getShapeAsContour();
        if (contour.length === 0) {
            this.showError('No shape drawn. Please draw a shape first.');
            return;
        }
        
        // Convert drawing contour to the format expected by the app
        this.state.currentContours = [contour];
        
        // Draw the contour to contour canvas for preview
        const canvas = this.elements.contourCanvas;
        const ctx = canvas.getContext('2d');
        canvas.width = this.elements.drawingCanvas.width;
        canvas.height = this.elements.drawingCanvas.height;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#4a90d9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        if (contour.length > 0) {
            ctx.moveTo(contour[0].x, contour[0].y);
            for (let i = 1; i < contour.length; i++) {
                ctx.lineTo(contour[i].x, contour[i].y);
            }
            ctx.closePath();
            ctx.stroke();
        }
        
        this.elements.contourControls.style.display = 'block';
        this.elements.generateBtn.disabled = false;
        this.setStatus('Drawing shape ready. Click "Generate 3D Model" to preview.', 'success');
    }

    handleImageUpload(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.state.currentImage = img;
                this.drawImageToCanvas(img, this.elements.sourceCanvas);
                this.elements.segmentControls.style.display = 'block';
                this.setStatus('Image loaded. Ready for segmentation.', 'ready');
            };
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }

    drawImageToCanvas(img, canvas) {
        const ctx = canvas.getContext('2d');
        
        // Resize canvas to match image while fitting within max dimensions
        const maxWidth = 600;
        const maxHeight = 500;
        
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
            const scale = Math.min(maxWidth / width, maxHeight / height);
            width *= scale;
            height *= scale;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
    }

    async runSegmentation() {
        if (!this.state.currentImage) {
            this.showError('No image loaded');
            return;
        }

        this.setStatus('Loading segmentation model...', 'loading');
        this.elements.segmentBtn.disabled = true;

        try {
            await this.modules.segmentation.loadModel();
            
            this.setStatus('Running segmentation...', 'loading');
            
            const sourceCanvas = this.elements.sourceCanvas;
            const mask = await this.modules.segmentation.segment(sourceCanvas);
            
            // Draw mask to segment canvas
            this.modules.segmentation.drawMask(mask, this.elements.segmentCanvas);
            
            // Store mask for contour extraction
            this.state.currentMask = mask;
            
            this.elements.contourControls.style.display = 'block';
            this.setStatus('Segmentation complete. Adjust threshold and smoothness, then generate 3D model.', 'success');
            
            // Auto-extract contours
            this.extractContours();
            
        } catch (error) {
            console.error('Segmentation error:', error);
            this.showError('Segmentation failed: ' + error.message);
        } finally {
            this.elements.segmentBtn.disabled = false;
        }
    }

    extractContours() {
        if (!this.state.currentMask) return;

        const threshold = parseInt(this.elements.thresholdSlider.value);
        const smoothness = parseInt(this.elements.smoothSlider.value);

        try {
            const contours = this.modules.contourExtractor.extract(
                this.state.currentMask,
                threshold,
                smoothness
            );

            this.state.currentContours = contours;
            
            // Draw contours
            this.modules.contourExtractor.drawContours(
                contours,
                this.elements.contourCanvas,
                this.elements.sourceCanvas.width,
                this.elements.sourceCanvas.height
            );

            this.setStatus('Found ' + contours.length + ' contour(s). Ready to generate 3D model.', 'success');
        } catch (error) {
            console.error('Contour extraction error:', error);
            this.showError('Contour extraction failed: ' + error.message);
        }
    }

    generate3DModel() {
        if (!this.state.currentContours || this.state.currentContours.length === 0) {
            this.showError('No contours available. Run segmentation or draw a shape first.');
            return;
        }

        const height = parseFloat(this.elements.heightInput.value);
        const wallThickness = parseFloat(this.elements.wallInput.value);
        const scale = parseFloat(this.elements.scaleInput.value) * this.state.pixelScale;

        this.setStatus('Generating 3D model...', 'loading');
        this.elements.generateBtn.disabled = true;

        try {
            const geometry = this.modules.geometryGenerator.generate(
                this.state.currentContours,
                height,
                wallThickness,
                scale
            );

            this.state.currentGeometry = geometry;
            
            // Update 3D viewer
            this.modules.viewer3d.setGeometry(geometry);
            
            this.elements.exportBtn.disabled = false;
            this.setStatus('3D model generated successfully!', 'success');
        } catch (error) {
            console.error('3D generation error:', error);
            this.showError('3D model generation failed: ' + error.message);
        } finally {
            this.elements.generateBtn.disabled = false;
        }
    }

    exportSTL() {
        if (!this.state.currentGeometry) {
            this.showError('No 3D model available. Generate model first.');
            return;
        }

        try {
            const stlData = this.modules.stlExporter.export(this.state.currentGeometry);
            
            // Create download link
            const blob = new Blob([stlData], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'cookie-cutter.stl';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            this.setStatus('STL file exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showError('STL export failed: ' + error.message);
        }
    }

    updateCalibration() {
        const pixels = parseFloat(this.elements.calibrationPixels.value);
        const mm = parseFloat(this.elements.calibrationMm.value);
        
        if (pixels > 0 && mm > 0) {
            this.state.pixelScale = mm / pixels;
            this.setStatus('Calibration updated: 1 pixel = ' + this.state.pixelScale.toFixed(4) + ' mm', 'ready');
        } else {
            this.state.pixelScale = 1.0;
        }
    }

    setStatus(message, type = 'info') {
        this.elements.segmentStatus.textContent = message;
        this.elements.segmentStatus.className = 'status ' + type;
        
        if (type === 'loading') {
            this.elements.segmentStatus.innerHTML = '<span class="spinner"></span><span>' + message + '</span>';
        }
    }

    showError(message) {
        this.setStatus(message, 'error');
        console.error(message);
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
