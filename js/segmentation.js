/**
 * Segmentation module using TensorFlow.js
 * Now supports multiple models via the segmentation registry
 */

import { SegmentationModels, loadModel, getCurrentModel, getCurrentModelConfig } from './segmentation-models.js';

class SegmentationProcessor {
    constructor() {
        this.model = null;
        this.isModelLoading = false;
    }

    async loadModel(modelName = 'bodypix') {
        if (this.model) return this.model;
        if (this.isModelLoading) {
            while (this.isModelLoading) {
                await new Promise(r => setTimeout(r, 100));
            }
            return this.model;
        }

        this.isModelLoading = true;
        try {
            this.model = await loadModel(modelName);
            return this.model;
        } finally {
            this.isModelLoading = false;
        }
    }

    async segmentImage(imageElement, threshold = 0.5) {
        const model = await this.loadModel(SegmentationModels.current || 'bodypix');
        const modelConfig = getCurrentModelConfig();
        
        const segmentation = await modelConfig.segment(model, imageElement);
        
        // Apply custom threshold if provided
        if (threshold !== 0.5 && segmentation.data) {
            // Note: BodyPix already applies threshold during segmentation
            // but we could adjust here if needed
        }
        
        return segmentation;
    }

    async switchModel(modelName) {
        this.model = null;
        SegmentationModels.loadedModel = null;
        return this.loadModel(modelName);
    }

    createMaskCanvas(segmentation, width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        const mask = segmentation.data;

        for (let i = 0; i < mask.length; i++) {
            const pixelIndex = i * 4;
            const isPerson = mask[i] === 1;
            
            data[pixelIndex] = isPerson ? 255 : 0;     // R
            data[pixelIndex + 1] = isPerson ? 255 : 0; // G
            data[pixelIndex + 2] = isPerson ? 255 : 0; // B
            data[pixelIndex + 3] = 255;                   // Alpha
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    smoothMask(mask, width, height, iterations = 2) {
        let currentMask = new Uint8Array(mask);
        
        for (let iter = 0; iter < iterations; iter++) {
            const newMask = new Uint8Array(currentMask.length);
            
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = y * width + x;
                    let sum = currentMask[idx];
                    let count = 1;
                    
                    // Check 8 neighbors
                    const neighbors = [
                        idx - width - 1, idx - width, idx - width + 1,
                        idx - 1,                    idx + 1,
                        idx + width - 1, idx + width, idx + width + 1
                    ];
                    
                    for (const n of neighbors) {
                        if (n >= 0 && n < currentMask.length) {
                            sum += currentMask[n];
                            count++;
                        }
                    }
                    
                    newMask[idx] = sum / count > 0.5 ? 1 : 0;
                }
            }
            
            currentMask = newMask;
        }
        
        return currentMask;
    }
}

// Export for use in other modules
export { SegmentationProcessor, SegmentationModels, loadModel };
