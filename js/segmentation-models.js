/**
 * Segmentation Models Registry
 * Provides a pluggable architecture for different segmentation models
 */

const SegmentationModels = {
    current: null,
    loadedModel: null,

    bodypix: {
        name: 'BodyPix',
        description: 'Detects people and their outlines',
        
        async load() {
            const model = await bodyPix.load({
                architecture: 'MobileNetV1',
                outputStride: 16,
                multiplier: 0.75,
                quantBytes: 2
            });
            return model;
        },
        
        async segment(model, imageElement) {
            const segmentation = await model.segmentPerson(imageElement, {
                internalResolution: 'medium',
                segmentationThreshold: 0.5,
                maxDetections: 1
            });
            return segmentation;
        }
    }
};

/**
 * Load a segmentation model by name
 * @param {string} modelName - The name of the model to load
 * @returns {Promise<Object>} The loaded model
 */
async function loadModel(modelName) {
    const modelConfig = SegmentationModels[modelName];
    if (!modelConfig) {
        throw new Error(`Unknown model: ${modelName}`);
    }
    
    SegmentationModels.current = modelName;
    SegmentationModels.loadedModel = await modelConfig.load();
    console.log(`${modelConfig.name} model loaded`);
    
    return SegmentationModels.loadedModel;
}

/**
 * Get the currently loaded model
 * @returns {Object|null} The loaded model or null
 */
function getCurrentModel() {
    return SegmentationModels.loadedModel;
}

/**
 * Get the current model configuration
 * @returns {Object|null} The current model config or null
 */
function getCurrentModelConfig() {
    if (!SegmentationModels.current) return null;
    return SegmentationModels[SegmentationModels.current];
}

export { SegmentationModels, loadModel, getCurrentModel, getCurrentModelConfig };
