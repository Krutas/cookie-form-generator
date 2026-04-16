# Performance Architecture Design - Cookie Form Generator

**Date:** 2026-04-16  
**Priority:** Performance optimizations for segmentation, caching, and offline support

## Overview

Transform the cookie cutter generator from a synchronous, blocking UI into a performant, responsive application using Web Workers for heavy computation, IndexedDB for persistent caching, and Service Worker for offline capability.

## Goals

1. **Non-blocking UI** - Segmentation runs in Web Worker, UI remains responsive
2. **Intelligent Caching** - Cache segmentation results in IndexedDB keyed by image hash
3. **Offline Support** - Service Worker enables app use without internet after first load
4. **Progressive Loading** - Show skeleton screens, progress indicators
5. **Memory Management** - Proper cleanup of large tensors and geometries

## Architecture

### Worker Thread Architecture

```
Main Thread                    Worker Thread
────────────────────────────────────────────────
UI Components                  SegmentationProcessor
Event Handlers                 TensorFlow.js Model
State Manager                  Image Processing
IndexedDB API                  → Returns mask data
```

**Communication Protocol:**
- `MessageType: SEGMENT_START` - { imageBitmap, threshold, modelConfig }
- `MessageType: SEGMENT_PROGRESS` - { percent: 0-100 }
- `MessageType: SEGMENT_COMPLETE` - { mask: Uint8Array, width, height }
- `MessageType: SEGMENT_ERROR` - { error: string }

### Caching Strategy

**IndexedDB Schema:**
```javascript
{
  version: 1,
  stores: {
    segmentations: {
      keyPath: 'imageHash', // SHA-256 of image data
      indexes: ['timestamp']
    },
    contours: {
      keyPath: 'contourId',
      indexes: ['imageHash']
    }
  }
}
```

**Cache Hit Flow:**
1. User uploads image
2. Compute image hash (SHA-256 of file content)
3. Check IndexedDB for existing segmentation
4. If found: Load from cache, skip TensorFlow inference
5. If not found: Run segmentation, store result

### Service Worker Strategy

**Cache-First Strategy for static assets:**
- `/` (index.html)
- `/css/styles.css`
- `/js/*.js`
- CDN resources (Three.js, TensorFlow.js) - store locally

**Runtime caching for:**
- Segmentation model files (large, slow to download)

## Components

### 1. SegmentationWorker (`js/workers/segmentation.worker.js`)

Runs BodyPix in isolated thread:
- Loads TensorFlow.js and model once
- Processes images via MessageChannel
- Returns serialized mask data

### 2. CacheManager (`js/cache/CacheManager.js`)

Abstracts IndexedDB operations:
- `getSegmentation(imageHash): Promise<SegmentationResult|null>`
- `setSegmentation(imageHash, result): Promise<void>`
- `clearOldCache(maxAge: number): Promise<void>`
- `getCacheSize(): Promise<number>`

### 3. ImageHasher (`js/utils/ImageHasher.js`)

Computes SHA-256 hash for cache keys:
- `hashFile(file): Promise<string>`
- `hashImageData(imageData): Promise<string>`

### 4. ProgressManager (`js/ui/ProgressManager.js`)

UI feedback for long operations:
- `show(message, cancellable: boolean)`
- `update(percent: number)`
- `hide()`
- `setCancelCallback(callback)`

### 5. Service Worker (`service-worker.js`)

Enables offline capability:
- Precache essential resources on install
- Network-first for API calls
- Cache-first for static assets
- Background sync for pending exports

## Performance Optimizations

### TensorFlow.js Optimizations
- Use `tf.env().set('WEBGL_FORCE_F16_TEXTURES', true)` for smaller GPU memory
- Dispose tensors immediately after use
- Use `tf.tidy()` for automatic cleanup
- Load model once, reuse for multiple images

### Memory Management
- Dispose BodyPix segmentation mask after converting to contours
- Clear large canvas buffers when not needed
- Limit concurrent operations to 1
- Monitor memory with `performance.memory` (Chrome)

### UI Responsiveness
- Debounce slider inputs (300ms)
- Request Animation Frame for heavy canvas operations
- Virtual scrolling for large contour lists
- Lazy load 3D viewer initialization

## Implementation Phases

### Phase 1: Web Worker Foundation
- Create SegmentationWorker
- Implement message protocol
- Update UI to show progress

### Phase 2: Caching Layer
- Implement CacheManager with IndexedDB
- Add ImageHasher utility
- Integrate cache checks into flow

### Phase 3: Service Worker
- Create service-worker.js
- Add manifest.json for PWA support
- Test offline functionality

### Phase 4: Polish & Monitoring
- Add performance metrics
- Memory leak testing
- Cache size limits
- Error boundaries

## Testing Strategy

1. **Performance Benchmarks**
   - Time segmentation with/without cache
   - Memory usage during batch processing
   - FPS during 3D manipulation

2. **Offline Testing**
   - Disable network, verify app loads
   - Test cached model functionality
   - Verify export still works

3. **Load Testing**
   - Large images (4K+)
   - Rapid successive uploads
   - Concurrent operations

## Success Criteria

- [ ] Segmentation doesn't block UI (remains 60fps)
- [ ] Repeat image loads <100ms from cache
- [ ] App works offline after first visit
- [ ] Memory usage stays <500MB for typical images
- [ ] Cache auto-clears old entries (30 day limit)
