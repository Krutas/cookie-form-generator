/**
 * Drawing Tools - Custom Shape Drawing Module
 * Allows users to draw circle, rectangle shapes on canvas
 */

const DrawingTools = {
    mode: 'none',
    isDrawing: false,
    startPoint: null,
    currentShape: null,
    canvas: null,
    ctx: null,
    shapes: [],
    onShapeComplete: null,

    init(canvas, onShapeComplete) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onShapeComplete = onShapeComplete || null;
        this.setupEventListeners();
    },

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.startDraw(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', (e) => this.endDraw(e));
        this.canvas.addEventListener('mouseleave', () => this.cancelDraw());
    },

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    },

    startDraw(e) {
        if (this.mode === 'none') return;

        this.isDrawing = true;
        this.startPoint = this.getMousePos(e);
        this.currentShape = {
            type: this.mode,
            start: this.startPoint,
            end: this.startPoint
        };
    },

    draw(e) {
        if (!this.isDrawing || this.mode === 'none') return;

        this.currentShape.end = this.getMousePos(e);
        this.renderAll();
    },

    endDraw(e) {
        if (!this.isDrawing) return;

        this.isDrawing = false;
        this.currentShape.end = this.getMousePos(e);
        
        // Save completed shape
        if (this.currentShape) {
            this.shapes.push({ ...this.currentShape });
        }
        
        this.currentShape = null;
        this.renderAll();
        
        // Notify app that a shape is complete
        if (this.onShapeComplete) {
            this.onShapeComplete();
        }
    },

    cancelDraw() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.currentShape = null;
            this.renderAll();
        }
    },

    renderAll() {
        this.clearCanvas();

        // Draw saved shapes
        this.shapes.forEach(shape => {
            this.renderShape(shape.start, shape.end, shape.type);
        });

        // Draw current shape being created
        if (this.isDrawing && this.currentShape) {
            this.renderShape(this.currentShape.start, this.currentShape.end, this.currentShape.type);
        }
    },

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    renderShape(startPoint, endPoint, type) {
        this.ctx.strokeStyle = '#4a90d9';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        if (type === 'circle') {
            const radius = Math.sqrt(
                Math.pow(endPoint.x - startPoint.x, 2) +
                Math.pow(endPoint.y - startPoint.y, 2)
            );
            this.ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        } else if (type === 'rectangle') {
            const width = endPoint.x - startPoint.x;
            const height = endPoint.y - startPoint.y;
            this.ctx.rect(startPoint.x, startPoint.y, width, height);
        }

        this.ctx.stroke();
        this.ctx.fillStyle = 'rgba(74, 144, 217, 0.1)';
        this.ctx.fill();
    },

    clearShapes() {
        this.shapes = [];
        this.clearCanvas();
    },

    hasShapes() {
        return this.shapes.length > 0;
    },

    getShapeAsContour() {
        if (this.shapes.length === 0) return [];

        const shape = this.shapes[this.shapes.length - 1];
        const contour = [];

        if (shape.type === 'circle') {
            const radius = Math.sqrt(
                Math.pow(shape.end.x - shape.start.x, 2) +
                Math.pow(shape.end.y - shape.start.y, 2)
            );
            const numPoints = 64;
            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * 2 * Math.PI;
                contour.push({
                    x: shape.start.x + radius * Math.cos(angle),
                    y: shape.start.y + radius * Math.sin(angle)
                });
            }
        } else if (shape.type === 'rectangle') {
            const minX = Math.min(shape.start.x, shape.end.x);
            const maxX = Math.max(shape.start.x, shape.end.x);
            const minY = Math.min(shape.start.y, shape.end.y);
            const maxY = Math.max(shape.start.y, shape.end.y);

            // Create rectangle contour with points along each edge
            const pointsPerSide = 16;
            
            // Top edge
            for (let i = 0; i < pointsPerSide; i++) {
                contour.push({
                    x: minX + (maxX - minX) * (i / pointsPerSide),
                    y: minY
                });
            }
            
            // Right edge
            for (let i = 0; i < pointsPerSide; i++) {
                contour.push({
                    x: maxX,
                    y: minY + (maxY - minY) * (i / pointsPerSide)
                });
            }
            
            // Bottom edge
            for (let i = 0; i < pointsPerSide; i++) {
                contour.push({
                    x: maxX - (maxX - minX) * (i / pointsPerSide),
                    y: maxY
                });
            }
            
            // Left edge
            for (let i = 0; i < pointsPerSide; i++) {
                contour.push({
                    x: minX,
                    y: maxY - (maxY - minY) * (i / pointsPerSide)
                });
            }
        }

        return contour;
    },

    setMode(newMode) {
        this.mode = newMode;
    }
};
