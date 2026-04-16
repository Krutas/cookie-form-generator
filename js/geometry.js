/**
 * GeometryGenerator - 3D geometry generation for cookie cutters
 * Uses Three.js to create extruded shapes from 2D contours
 */
class GeometryGenerator {
  /**
   * Convert contour array to Three.js Vector2 array
   * @param {Array} contour - Array of {x, y} points
   * @returns {Array<THREE.Vector2>}
   */
  convertContourToThreePath(contour) {
    return contour.map(point => new THREE.Vector2(point.x, point.y));
  }

  /**
   * Scale a contour uniformly around its center
   * @param {Array} contour - Array of {x, y} points
   * @param {number} scale - Scale factor
   * @returns {Array<{x, y}>}
   */
  scaleContour(contour, scale) {
    // Calculate center
    let centerX = 0;
    let centerY = 0;
    for (const point of contour) {
      centerX += point.x;
      centerY += point.y;
    }
    centerX /= contour.length;
    centerY /= contour.length;

    // Scale points around center
    return contour.map(point => ({
      x: centerX + (point.x - centerX) * scale,
      y: centerY + (point.y - centerY) * scale
    }));
  }

  /**
   * Create extruded geometry from a 2D contour
   * @param {Array} contour - Array of {x, y} points
   * @param {number} height - Extrusion height
   * @param {number} wallThickness - Wall thickness for bevel
   * @returns {THREE.ExtrudeGeometry}
   */
  createExtrudedGeometry(contour, height, wallThickness) {
    const threePath = this.convertContourToThreePath(contour);
    
    // Create shape from path
    const shape = new THREE.Shape(threePath);
    
    // Extrude settings
    const extrudeSettings = {
      depth: height,
      bevelEnabled: true,
      bevelThickness: wallThickness * 0.1,
      bevelSize: wallThickness * 0.1,
      bevelSegments: 2,
      curveSegments: 12
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Center the geometry
    geometry.center();
    
    return geometry;
  }

  /**
   * Generate geometry from contour hierarchy with support for inner cutouts
   * @param {Array} hierarchy - Array of {contour, isOuter, isHole, parent} objects
   * @param {number} height - Cutter height
   * @param {number} wallThickness - Wall thickness
   * @param {number} scale - Scale factor
   * @param {boolean} includeHoles - Whether to include inner cutouts
   * @returns {THREE.Group}
   */
  generateFromHierarchy(hierarchy, height, wallThickness, scale, includeHoles) {
    const group = new THREE.Group();
    
    if (!hierarchy || hierarchy.length === 0) {
      return group;
    }
    
    // Find the outermost contour (largest outer contour)
    let outerContour = null;
    let maxArea = 0;
    
    for (const item of hierarchy) {
      if (item.isOuter) {
        const area = this.calculateArea(item.contour);
        if (area > maxArea) {
          maxArea = area;
          outerContour = item.contour;
        }
      }
    }
    
    if (!outerContour) {
      return group;
    }
    
    // Get holes if enabled
    const holes = [];
    if (includeHoles) {
      // Find holes that are direct children of the outer contour
      for (let i = 0; i < hierarchy.length; i++) {
        const item = hierarchy[i];
        if (item.isHole) {
          // Check if this hole's parent is our outer contour
          const parentIndex = item.parent;
          if (parentIndex >= 0 && hierarchy[parentIndex].contour === outerContour) {
            holes.push(item.contour);
          }
        }
      }
    }
    
    // Create the cookie cutter with optional holes
    const geometry = this.createCookieCutterWithHoles(
      outerContour, 
      holes, 
      height, 
      wallThickness, 
      scale
    );
    
    // Create mesh
    const material = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.3,
      roughness: 0.4
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    group.add(mesh);
    
    // Store dimensions for reference
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox;
    
    group.userData = {
      width: boundingBox.max.x - boundingBox.min.x,
      height: height,
      depth: boundingBox.max.z - boundingBox.min.z,
      wallThickness: wallThickness,
      hasHoles: holes.length > 0
    };
    
    return group;
  }

  /**
   * Calculate area of a contour
   * @param {Array} contour - Array of {x, y} points
   * @returns {number} Area
   */
  calculateArea(contour) {
    let area = 0;
    for (let i = 0; i < contour.length - 1; i++) {
      area += contour[i].x * contour[i + 1].y - contour[i + 1].x * contour[i].y;
    }
    return Math.abs(area) / 2;
  }

  /**
   * Create a complete cookie cutter with inner and outer walls, with optional holes
   * @param {Array} outerContour - Array of {x, y} points defining outer shape
   * @param {Array} holes - Array of hole contours (each an array of {x, y} points)
   * @param {number} height - Cutter height
   * @param {number} wallThickness - Thickness of the cutter walls
   * @param {number} scale - Scale factor to apply
   * @returns {THREE.BufferGeometry}
   */
  createCookieCutterWithHoles(outerContour, holes, height, wallThickness, scale) {
    // Scale the outer contour
    const scaledOuter = this.scaleContour(outerContour, scale);
    
    // Scale down to create inner contour (for wall thickness)
    const scaleFactor = 1.0 - (wallThickness / 50); // Approximate scaling
    const innerOuter = this.scaleContour(scaledOuter, scaleFactor);
    
    // Create outer path
    const outerPath = this.convertContourToThreePath(scaledOuter);
    const shape = new THREE.Shape(outerPath);
    
    // Add holes to the shape
    if (holes && holes.length > 0) {
      for (const holeContour of holes) {
        // Scale the hole contour
        const scaledHole = this.scaleContour(holeContour, scale);
        const holePath = this.convertContourToThreePath(scaledHole);
        shape.holes.push(new THREE.Path(holePath));
      }
    }
    
    // Create inner hole (for creating hollow walls)
    const innerPath = this.convertContourToThreePath(innerOuter);
    const innerHole = new THREE.Path(innerPath);
    shape.holes.push(innerHole);
    
    // Extrude settings
    const extrudeSettings = {
      depth: height,
      bevelEnabled: true,
      bevelThickness: wallThickness * 0.1,
      bevelSize: wallThickness * 0.1,
      bevelSegments: 2,
      curveSegments: 12
    };
    
    // Create geometry with holes
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Rotate so it sits flat (Y is up in Three.js, Z is depth)
    geometry.rotateX(-Math.PI / 2);
    
    // Center horizontally
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox;
    const centerX = (boundingBox.max.x + boundingBox.min.x) / 2;
    const centerZ = (boundingBox.max.z + boundingBox.min.z) / 2;
    
    geometry.translate(-centerX, 0, -centerZ);
    
    return geometry;
  }

  /**
   * Create a complete cookie cutter with inner and outer walls (legacy, no holes)
   * @param {Array} outerContour - Array of {x, y} points defining outer shape
   * @param {number} height - Cutter height
   * @param {number} wallThickness - Thickness of the cutter walls
   * @returns {THREE.Group}
   */
  createCookieCutter(outerContour, height, wallThickness) {
    const group = new THREE.Group();
    
    // Scale down to create inner contour
    const scaleFactor = 1.0 - (wallThickness / 50); // Approximate scaling
    const innerContour = this.scaleContour(outerContour, scaleFactor);
    
    // Create outer path
    const outerPath = this.convertContourToThreePath(outerContour);
    const outerShape = new THREE.Shape(outerPath);
    
    // Create inner hole
    const innerPath = this.convertContourToThreePath(innerContour);
    const innerHole = new THREE.Path(innerPath);
    outerShape.holes.push(innerHole);
    
    // Extrude settings
    const extrudeSettings = {
      depth: height,
      bevelEnabled: true,
      bevelThickness: wallThickness * 0.1,
      bevelSize: wallThickness * 0.1,
      bevelSegments: 2,
      curveSegments: 12
    };
    
    // Create geometry with hole
    const geometry = new THREE.ExtrudeGeometry(outerShape, extrudeSettings);
    
    // Rotate so it sits flat (Y is up in Three.js, Z is depth)
    geometry.rotateX(-Math.PI / 2);
    
    // Center horizontally
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox;
    const centerX = (boundingBox.max.x + boundingBox.min.x) / 2;
    const centerZ = (boundingBox.max.z + boundingBox.min.z) / 2;
    
    geometry.translate(-centerX, 0, -centerZ);
    
    // Create mesh
    const material = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.3,
      roughness: 0.4
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    group.add(mesh);
    
    // Store dimensions for reference
    group.userData = {
      width: boundingBox.max.x - boundingBox.min.x,
      height: height,
      depth: boundingBox.max.z - boundingBox.min.z,
      wallThickness: wallThickness
    };
    
    return group;
  }

  /**
   * Legacy generate method for backward compatibility
   * @param {Array} contours - Array of contour arrays
   * @param {number} height - Cutter height
   * @param {number} wallThickness - Wall thickness
   * @param {number} scale - Scale factor
   * @returns {THREE.Group}
   */
  generate(contours, height, wallThickness, scale) {
    if (!contours || contours.length === 0) {
      return new THREE.Group();
    }
    
    // Use the largest contour
    const mainContour = contours[0];
    
    // Scale the contour
    const scaledContour = this.scaleContour(mainContour, scale);
    
    return this.createCookieCutter(scaledContour, height, wallThickness);
  }
}

// Export to global scope
window.GeometryGenerator = GeometryGenerator;
