/**
 * STLExporter - Exports Three.js geometry to binary STL format
 */
class STLExporter {
  /**
   * Export geometry to binary STL and trigger download
   * @param {THREE.BufferGeometry} geometry - The geometry to export
   * @param {string} filename - The filename for the download
   */
  exportBinary(geometry, filename) {
    const buffer = this.generateBinarySTL(geometry);
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Generate binary STL data from geometry
   * @param {THREE.BufferGeometry} geometry - The geometry to export
   * @returns {ArrayBuffer} - The binary STL data
   */
  generateBinarySTL(geometry) {
    // Ensure geometry is indexed and has position attribute
    const positionAttribute = geometry.attributes.position;
    const indexAttribute = geometry.index;
    
    if (!positionAttribute) {
      throw new Error('Geometry has no position attribute');
    }
    
    // Calculate triangle count
    let triangleCount;
    if (indexAttribute) {
      triangleCount = indexAttribute.count / 3;
    } else {
      triangleCount = positionAttribute.count / 3;
    }
    
    // Binary STL: 80 byte header + 4 byte triangle count + triangles * 50 bytes
    const bufferSize = 80 + 4 + triangleCount * 50;
    const buffer = new ArrayBuffer(bufferSize);
    
    // Write header
    this.writeSTLHeader(buffer, triangleCount);
    
    // Write triangles
    const dataView = new DataView(buffer);
    let offset = 80 + 4; // Skip header and triangle count
    
    if (indexAttribute) {
      // Indexed geometry
      for (let i = 0; i < indexAttribute.count; i += 3) {
        const i1 = indexAttribute.getX(i);
        const i2 = indexAttribute.getX(i + 1);
        const i3 = indexAttribute.getX(i + 2);
        
        const v1 = this.getVertex(positionAttribute, i1);
        const v2 = this.getVertex(positionAttribute, i2);
        const v3 = this.getVertex(positionAttribute, i3);
        
        const normal = this.calculateNormal(v1, v2, v3);
        offset = this.writeTriangle(dataView, offset, v1, v2, v3, normal);
      }
    } else {
      // Non-indexed geometry
      for (let i = 0; i < positionAttribute.count; i += 3) {
        const v1 = this.getVertex(positionAttribute, i);
        const v2 = this.getVertex(positionAttribute, i + 1);
        const v3 = this.getVertex(positionAttribute, i + 2);
        
        const normal = this.calculateNormal(v1, v2, v3);
        offset = this.writeTriangle(dataView, offset, v1, v2, v3, normal);
      }
    }
    
    return buffer;
  }

  /**
   * Get vertex from position attribute
   * @param {THREE.BufferAttribute} positionAttribute 
   * @param {number} index 
   * @returns {{x: number, y: number, z: number}}
   */
  getVertex(positionAttribute, index) {
    return {
      x: positionAttribute.getX(index),
      y: positionAttribute.getY(index),
      z: positionAttribute.getZ(index)
    };
  }

  /**
   * Calculate face normal using right-hand rule
   * @param {Object} v1 - First vertex {x, y, z}
   * @param {Object} v2 - Second vertex {x, y, z}
   * @param {Object} v3 - Third vertex {x, y, z}
   * @returns {Object} - Normal vector {x, y, z}
   */
  calculateNormal(v1, v2, v3) {
    // Edge vectors
    const edge1 = {
      x: v2.x - v1.x,
      y: v2.y - v1.y,
      z: v2.z - v1.z
    };
    
    const edge2 = {
      x: v3.x - v1.x,
      y: v3.y - v1.y,
      z: v3.z - v1.z
    };
    
    // Cross product (right-hand rule)
    let normal = {
      x: edge1.y * edge2.z - edge1.z * edge2.y,
      y: edge1.z * edge2.x - edge1.x * edge2.z,
      z: edge1.x * edge2.y - edge1.y * edge2.x
    };
    
    // Normalize
    const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
    if (length > 0) {
      normal.x /= length;
      normal.y /= length;
      normal.z /= length;
    }
    
    return normal;
  }

  /**
   * Write 80-byte header to buffer
   * @param {ArrayBuffer} buffer - The buffer to write to
   * @param {number} triangleCount - Number of triangles
   */
  writeSTLHeader(buffer, triangleCount) {
    const headerText = 'Exported from Cookie Cutter Generator';
    const headerBytes = new Uint8Array(buffer, 0, 80);
    
    // Write header text (padded with spaces)
    for (let i = 0; i < 80; i++) {
      if (i < headerText.length) {
        headerBytes[i] = headerText.charCodeAt(i);
      } else {
        headerBytes[i] = 0;
      }
    }
    
    // Write triangle count (little-endian)
    const dataView = new DataView(buffer);
    dataView.setUint32(80, triangleCount, true);
  }

  /**
   * Write a triangle to the buffer
   * @param {DataView} dataView - The DataView to write to
   * @param {number} offset - Byte offset to start writing
   * @param {Object} v1 - First vertex {x, y, z}
   * @param {Object} v2 - Second vertex {x, y, z}
   * @param {Object} v3 - Third vertex {x, y, z}
   * @param {Object} normal - Normal vector {x, y, z}
   * @returns {number} - New offset after writing
   */
  writeTriangle(dataView, offset, v1, v2, v3, normal) {
    // Normal vector (12 bytes)
    dataView.setFloat32(offset, normal.x, true);
    dataView.setFloat32(offset + 4, normal.y, true);
    dataView.setFloat32(offset + 8, normal.z, true);
    
    // Vertex 1 (12 bytes)
    dataView.setFloat32(offset + 12, v1.x, true);
    dataView.setFloat32(offset + 16, v1.y, true);
    dataView.setFloat32(offset + 20, v1.z, true);
    
    // Vertex 2 (12 bytes)
    dataView.setFloat32(offset + 24, v2.x, true);
    dataView.setFloat32(offset + 28, v2.y, true);
    dataView.setFloat32(offset + 32, v2.z, true);
    
    // Vertex 3 (12 bytes)
    dataView.setFloat32(offset + 36, v3.x, true);
    dataView.setFloat32(offset + 40, v3.y, true);
    dataView.setFloat32(offset + 44, v3.z, true);
    
    // Attribute byte count (2 bytes) - always 0
    dataView.setUint16(offset + 48, 0, true);
    
    return offset + 50;
  }
}

// Export to global scope
window.STLExporter = STLExporter;
