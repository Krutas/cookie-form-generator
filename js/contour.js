/**
 * Contour extraction module
 */

class ContourExtractor {
    constructor() {
        this.simplifyEpsilon = 1.0;
    }

    extractContours(maskCanvas) {
        const ctx = maskCanvas.getContext('2d');
        const width = maskCanvas.width;
        const height = maskCanvas.height;
        
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Convert to binary mask
        const mask = new Uint8Array(width * height);
        for (let i = 0; i < width * height; i++) {
            mask[i] = data[i * 4] > 128 ? 1 : 0;
        }
        
        const contours = [];
        const visited = new Uint8Array(width * height);
        
        // Find outer contours using marching squares
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                
                // Look for edge pixels (background to foreground transition)
                if (mask[idx] === 1 && mask[idx - 1] === 0 && visited[idx] === 0) {
                    const contour = this.traceContour(mask, width, height, x, y, visited);
                    if (contour.length >= 10 && this.calculateArea(contour) >= 100) {
                        contours.push(contour);
                    }
                }
            }
        }
        
        // Sort by area (largest first)
        contours.sort((a, b) => this.calculateArea(b) - this.calculateArea(a));
        
        return contours;
    }

    /**
     * Find contours with hierarchy information for inner cutout detection
     * @param {ImageData} maskData - Image data from canvas
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @returns {Array} Array of contour objects: {contour, parent, isOuter, isHole}
     */
    findContoursWithHierarchy(maskData, width, height) {
        // Extract all contours first
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(maskData, 0, 0);
        
        const allContours = this.extractAllContours(canvas);
        
        // Build hierarchy
        const hierarchy = [];
        for (let i = 0; i < allContours.length; i++) {
            const contour = allContours[i];
            const isClockwise = this.isClockwise(contour);
            const isOuter = !isClockwise; // Outer contours are counter-clockwise
            
            hierarchy.push({
                contour: contour,
                parent: -1,
                isOuter: isOuter,
                isHole: !isOuter
            });
        }
        
        // Find parent-child relationships
        for (let i = 0; i < hierarchy.length; i++) {
            if (hierarchy[i].isHole) {
                const parentIndex = this.findParent(hierarchy, i);
                hierarchy[i].parent = parentIndex;
            }
        }
        
        return hierarchy;
    }

    /**
     * Extract all contours (both outer and inner)
     * @param {HTMLCanvasElement} maskCanvas - Canvas containing binary mask
     * @returns {Array} Array of contours
     */
    extractAllContours(maskCanvas) {
        const ctx = maskCanvas.getContext('2d');
        const width = maskCanvas.width;
        const height = maskCanvas.height;
        
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Convert to binary mask (1 = foreground, 0 = background)
        const mask = new Uint8Array(width * height);
        for (let i = 0; i < width * height; i++) {
            mask[i] = data[i * 4] > 128 ? 1 : 0;
        }
        
        const contours = [];
        const visited = new Uint8Array(width * height);
        
        // Find all contours by looking for transitions
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                
                // Outer boundary: foreground to background (going right)
                if (mask[idx] === 1 && mask[idx - 1] === 0 && visited[idx] === 0) {
                    const contour = this.traceContourFull(mask, width, height, x, y, visited, true);
                    if (contour.length >= 10 && this.calculateArea(contour) >= 100) {
                        contours.push(contour);
                    }
                }
                // Inner boundary: background to foreground (going right) - hole
                else if (mask[idx] === 0 && mask[idx - 1] === 1 && visited[idx] === 0) {
                    const contour = this.traceContourFull(mask, width, height, x, y, visited, false);
                    if (contour.length >= 10 && this.calculateArea(contour) >= 100) {
                        contours.push(contour);
                    }
                }
            }
        }
        
        return contours;
    }

    /**
     * Trace a contour from a starting point
     * @param {Uint8Array} mask - Binary mask
     * @param {number} width - Mask width
     * @param {number} height - Mask height
     * @param {number} startX - Starting X coordinate
     * @param {number} startY - Starting Y coordinate
     * @param {Uint8Array} visited - Visited pixel tracker
     * @param {boolean} isOuter - Whether tracing outer or inner boundary
     * @returns {Array} Array of {x, y} points
     */
    traceContourFull(mask, width, height, startX, startY, visited, isOuter) {
        const contour = [];
        const directions = [
            [1, 0], [1, 1], [0, 1], [-1, 1],
            [-1, 0], [-1, -1], [0, -1], [1, -1]
        ];
        
        // For outer contours, look for foreground pixels
        // For inner contours, look for background pixels
        const targetValue = isOuter ? 1 : 0;
        
        let x = startX;
        let y = startY;
        let dir = 0;
        let iterations = 0;
        const maxIterations = width * height;
        
        do {
            contour.push({ x, y });
            visited[y * width + x] = 1;
            
            // Find next pixel
            let found = false;
            for (let i = 0; i < 8; i++) {
                const newDir = (dir + i) % 8;
                const nx = x + directions[newDir][0];
                const ny = y + directions[newDir][1];
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const nidx = ny * width + nx;
                    
                    if (mask[nidx] === targetValue) {
                        const checkX = nx + directions[(newDir + 4) % 8][0];
                        const checkY = ny + directions[(newDir + 4) % 8][1];
                        
                        if (checkX >= 0 && checkX < width && 
                            checkY >= 0 && checkY < height) {
                            const checkIdx = checkY * width + checkX;
                            // Check transition based on contour type
                            if (isOuter) {
                                if (mask[checkIdx] === 0 || visited[nidx] === 0) {
                                    x = nx;
                                    y = ny;
                                    dir = (newDir + 6) % 8;
                                    found = true;
                                    break;
                                }
                            } else {
                                if (mask[checkIdx] === 1) {
                                    x = nx;
                                    y = ny;
                                    dir = (newDir + 6) % 8;
                                    found = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            
            if (!found) break;
            iterations++;
            
        } while ((x !== startX || y !== startY) && iterations < maxIterations);
        
        return this.simplifyContour(contour);
    }

    /**
     * Determine if a contour is clockwise (hole) or counter-clockwise (outer)
     * @param {Array} contour - Array of {x, y} points
     * @returns {boolean} True if clockwise
     */
    isClockwise(contour) {
        let area = 0;
        for (let i = 0; i < contour.length - 1; i++) {
            area += (contour[i + 1].x - contour[i].x) * 
                    (contour[i + 1].y + contour[i].y);
        }
        return area > 0;
    }

    /**
     * Check if a point is inside a contour using ray casting algorithm
     * @param {Object} point - {x, y} coordinates
     * @param {Array} contour - Array of {x, y} points
     * @returns {boolean} True if point is inside contour
     */
    isPointInContour(point, contour) {
        let inside = false;
        let j = contour.length - 1;
        
        for (let i = 0; i < contour.length; i++) {
            const xi = contour[i].x, yi = contour[i].y;
            const xj = contour[j].x, yj = contour[j].y;
            
            const intersect = ((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            
            if (intersect) {
                inside = !inside;
            }
            j = i;
        }
        
        return inside;
    }

    /**
     * Find the parent contour that contains the given contour
     * @param {Array} hierarchy - Array of contour objects with contour property
     * @param {number} index - Index of contour to find parent for
     * @returns {number} Index of parent contour, or -1 if none found
     */
    findParent(hierarchy, index) {
        const childContour = hierarchy[index].contour;
        
        // Find a point inside the child contour (use centroid)
        let centroidX = 0, centroidY = 0;
        for (const point of childContour) {
            centroidX += point.x;
            centroidY += point.y;
        }
        centroidX /= childContour.length;
        centroidY /= childContour.length;
        
        const testPoint = { x: centroidX, y: centroidY };
        
        // Find the smallest outer contour that contains this point
        let bestParent = -1;
        let bestArea = Infinity;
        
        for (let i = 0; i < hierarchy.length; i++) {
            if (i === index) continue;
            if (!hierarchy[i].isOuter) continue;
            
            if (this.isPointInContour(testPoint, hierarchy[i].contour)) {
                const area = this.calculateArea(hierarchy[i].contour);
                if (area < bestArea) {
                    bestArea = area;
                    bestParent = i;
                }
            }
        }
        
        return bestParent;
    }

    traceContour(mask, width, height, startX, startY, visited) {
        const contour = [];
        const directions = [
            [1, 0], [1, 1], [0, 1], [-1, 1],
            [-1, 0], [-1, -1], [0, -1], [1, -1]
        ];
        
        let x = startX;
        let y = startY;
        let dir = 0;
        let iterations = 0;
        const maxIterations = width * height;
        
        do {
            contour.push({ x, y });
            visited[y * width + x] = 1;
            
            // Find next edge pixel
            let found = false;
            for (let i = 0; i < 8; i++) {
                const newDir = (dir + i) % 8;
                const nx = x + directions[newDir][0];
                const ny = y + directions[newDir][1];
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const nidx = ny * width + nx;
                    // Edge: foreground with background neighbor
                    if (mask[nidx] === 1) {
                        const checkX = nx + directions[(newDir + 4) % 8][0];
                        const checkY = ny + directions[(newDir + 4) % 8][1];
                        
                        if (checkX >= 0 && checkX < width && 
                            checkY >= 0 && checkY < height) {
                            const checkIdx = checkY * width + checkX;
                            if (mask[checkIdx] === 0 || visited[nidx] === 0) {
                                x = nx;
                                y = ny;
                                dir = (newDir + 6) % 8;
                                found = true;
                                break;
                            }
                        }
                    }
                }
            }
            
            if (!found) break;
            iterations++;
            
        } while ((x !== startX || y !== startY) && iterations < maxIterations);
        
        return this.simplifyContour(contour);
    }

    simplifyContour(contour) {
        if (contour.length <= 2) return contour;
        
        const simplified = [contour[0]];
        
        for (let i = 1; i < contour.length - 1; i++) {
            const prev = simplified[simplified.length - 1];
            const curr = contour[i];
            const next = contour[i + 1];
            
            // Check if point is on a straight line
            const area = Math.abs(
                (curr.x - prev.x) * (next.y - prev.y) - 
                (curr.y - prev.y) * (next.x - prev.x)
            );
            
            if (area > this.simplifyEpsilon) {
                simplified.push(curr);
            }
        }
        
        simplified.push(contour[contour.length - 1]);
        
        // Close the contour if needed
        const first = simplified[0];
        const last = simplified[simplified.length - 1];
        if (first.x !== last.x || first.y !== last.y) {
            simplified.push({ ...first });
        }
        
        return simplified;
    }

    calculateArea(contour) {
        let area = 0;
        for (let i = 0; i < contour.length - 1; i++) {
            area += contour[i].x * contour[i + 1].y - contour[i + 1].x * contour[i].y;
        }
        return Math.abs(area) / 2;
    }

    drawContours(canvas, contours, color = '#4a90d9') {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        contours.forEach(contour => {
            if (contour.length < 2) return;
            
            ctx.beginPath();
            ctx.moveTo(contour[0].x, contour[0].y);
            
            for (let i = 1; i < contour.length; i++) {
                ctx.lineTo(contour[i].x, contour[i].y);
            }
            
            ctx.closePath();
            ctx.stroke();
        });
    }

    /**
     * Draw contours with different colors for outer vs hole contours
     * @param {HTMLCanvasElement} canvas - Target canvas
     * @param {Array} hierarchy - Array of contour objects from findContoursWithHierarchy
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    drawContoursWithHierarchy(canvas, hierarchy, width, height) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        
        hierarchy.forEach(item => {
            const contour = item.contour;
            if (contour.length < 2) return;
            
            // Outer contours in blue, holes in red
            ctx.strokeStyle = item.isOuter ? '#4a90d9' : '#e74c3c';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.moveTo(contour[0].x, contour[0].y);
            
            for (let i = 1; i < contour.length; i++) {
                ctx.lineTo(contour[i].x, contour[i].y);
            }
            
            ctx.closePath();
            ctx.stroke();
        });
    }
}

window.ContourExtractor = ContourExtractor;
