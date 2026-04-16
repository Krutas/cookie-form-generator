/**
 * Viewer3D - Three.js 3D Viewer Manager for Cookie Cutter Generator
 */
class Viewer3D {
    /**
     * @param {HTMLElement} containerElement - The container element for the viewer
     */
    constructor(containerElement) {
        this.container = containerElement;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentMesh = null;
        this.wireframeMesh = null;
        this.animationId = null;
        
        // Default camera position
        this.defaultCameraPosition = { x: 0, y: 0, z: 100 };
    }

    /**
     * Initialize the Three.js scene, camera, renderer, lights, and controls
     */
    initialize() {
        // Get container dimensions
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#e8e8e8');

        // Create camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(
            this.defaultCameraPosition.x,
            this.defaultCameraPosition.y,
            this.defaultCameraPosition.z
        );

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Create lights
        this.setupLights();

        // Create controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Bind resize handler
        this.boundOnWindowResize = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.boundOnWindowResize);

        // Start animation loop
        this.animate();
    }

    /**
     * Set up ambient and directional lights
     */
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Additional directional light from opposite side
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-50, -50, -50);
        this.scene.add(directionalLight2);
    }

    /**
     * Set and display geometry with wireframe overlay
     * @param {THREE.BufferGeometry} geometry - The geometry to display
     */
    setGeometry(geometry) {
        // Remove existing meshes
        this.clearGeometry();

        // Center the geometry
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        // Create material for the main mesh
        const material = new THREE.MeshPhongMaterial({
            color: 0x3b82f6,
            shininess: 100,
            side: THREE.DoubleSide
        });

        // Create main mesh
        this.currentMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.currentMesh);

        // Create wireframe overlay
        const wireframeGeometry = new THREE.WireframeGeometry(geometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({
            color: 0x1e40af,
            linewidth: 1
        });
        this.wireframeMesh = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        this.scene.add(this.wireframeMesh);

        // Adjust camera to fit the geometry
        this.fitCameraToGeometry(geometry);
    }

    /**
     * Adjust camera to fit the geometry
     * @param {THREE.BufferGeometry} geometry - The geometry to fit
     */
    fitCameraToGeometry(geometry) {
        geometry.computeBoundingBox();
        const size = new THREE.Vector3();
        geometry.boundingBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        
        const fov = this.camera.fov * (Math.PI / 180);
        const cameraZ = Math.abs(maxDim / Math.sin(fov / 2)) * 1.5;
        
        this.camera.position.z = cameraZ;
        this.defaultCameraPosition.z = cameraZ;
        
        this.camera.updateProjectionMatrix();
        this.controls.update();
    }

    /**
     * Clear current geometry from the scene
     */
    clearGeometry() {
        if (this.currentMesh) {
            this.scene.remove(this.currentMesh);
            this.currentMesh.geometry.dispose();
            this.currentMesh.material.dispose();
            this.currentMesh = null;
        }
        
        if (this.wireframeMesh) {
            this.scene.remove(this.wireframeMesh);
            this.wireframeMesh.geometry.dispose();
            this.wireframeMesh.material.dispose();
            this.wireframeMesh = null;
        }
    }

    /**
     * Reset camera to default position
     */
    resetView() {
        this.camera.position.set(
            this.defaultCameraPosition.x,
            this.defaultCameraPosition.y,
            this.defaultCameraPosition.z
        );
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
        this.controls.update();
    }

    /**
     * Animation loop
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        if (!this.container || !this.camera || !this.renderer) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /**
     * Dispose all resources
     */
    dispose() {
        // Stop animation loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Remove event listener
        window.removeEventListener('resize', this.boundOnWindowResize);

        // Clear geometry
        this.clearGeometry();

        // Dispose controls
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }

        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
            this.renderer = null;
        }

        // Clear references
        this.scene = null;
        this.camera = null;
        this.container = null;
    }
}

// Export to window
window.Viewer3D = Viewer3D;
