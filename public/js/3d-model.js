// 3D Model Loader and Renderer
class Model3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.model = null;
        this.animationMixer = null;
        this.clock = new THREE.Clock();
        this.container = document.getElementById('3d-container');
        this.isInteracting = false;
        
        if (this.container) {
            this.init();
        }
    }

    init() {
        console.log('Initializing 3D model renderer...');
        console.log('Container dimensions:', this.container.clientWidth, 'x', this.container.clientHeight);
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 5);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        console.log('Renderer created and added to container');

        // Add lights
        this.addLights();

        // Create a simple test cube first to verify rendering works
        this.createTestCube();

        // Load model
        this.loadModel();

        // Start animation loop
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        console.log('3D model renderer initialized successfully');
    }

    createTestCube() {
        console.log('Creating test cube...');
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(-2, 0, 0);
        this.scene.add(cube);
        console.log('Test cube added to scene');
        
        // Add a second test cube to make sure rendering is working
        const cube2 = new THREE.Mesh(geometry, material);
        cube2.position.set(2, 0, 0);
        cube2.material.color.setHex(0xff0000);
        this.scene.add(cube2);
        console.log('Second test cube added to scene');
    }

    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point light for additional illumination
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-5, 5, 5);
        this.scene.add(pointLight);
    }

    loadModel() {
        console.log('Starting to load 3D model...');
        
        // First, let's create a simple scene to test if rendering works
        this.createFallbackModel();
        
        // Check if FBXLoader is available
        if (typeof THREE.FBXLoader === 'undefined') {
            console.error('FBXLoader not available. Using fallback model only.');
            return;
        }
        
        const loader = new THREE.FBXLoader();
        
        // Set a timeout for loading
        const loadTimeout = setTimeout(() => {
            console.error('3D model loading timed out. Using fallback model only.');
        }, 15000); // 15 second timeout for large file
        
        // Load the FBX model
        loader.load(
            '/assets/Hiring_Hustle_0803161606_texture_fbx/Hiring_Hustle_0803161606_texture.fbx',
            (object) => {
                clearTimeout(loadTimeout);
                console.log('3D model loaded successfully:', object);
                this.model = object;
                
                // Scale and position the model
                this.model.scale.set(0.01, 0.01, 0.01);
                this.model.position.set(0, 0, 0);
                
                // Enable shadows and improve materials
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // Improve material properties
                        if (child.material) {
                            child.material.needsUpdate = true;
                            child.material.side = THREE.DoubleSide;
                        }
                    }
                });

                this.scene.add(this.model);

                // Set up animation mixer if animations exist
                if (this.model.animations && this.model.animations.length > 0) {
                    this.animationMixer = new THREE.AnimationMixer(this.model);
                    const action = this.animationMixer.clipAction(this.model.animations[0]);
                    action.play();
                }

                // Mark as loaded
                this.markAsLoaded();
                
                // Add mouse interaction
                this.addMouseInteraction();
            },
            (progress) => {
                // Progress callback
                const percent = (progress.loaded / progress.total * 100);
                console.log('Loading progress:', percent + '%');
            },
            (error) => {
                clearTimeout(loadTimeout);
                console.error('Error loading 3D model:', error);
                console.error('Error details:', error.message);
                console.error('Full error object:', error);
                // Don't create fallback again since we already did
            }
        );
    }

    createFallbackModel() {
        console.log('Creating fallback 3D model...');
        
        // Create a simple geometric shape as fallback
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0.9
        });
        this.model = new THREE.Mesh(geometry, material);
        this.model.position.set(0, 0, 0);
        this.scene.add(this.model);
        
        // Add some additional geometry to make it more interesting
        const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const sphereMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.8
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(1.5, 0, 0);
        this.scene.add(sphere);
        
        // Add a torus for more visual interest
        const torusGeometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
        const torusMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x0000ff,
            transparent: true,
            opacity: 0.8
        });
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        torus.position.set(-1.5, 0, 0);
        this.scene.add(torus);
        
        this.markAsLoaded();
        console.log('Fallback model created successfully');
    }

    markAsLoaded() {
        const modelContainer = document.querySelector('.hero-3d-model');
        if (modelContainer) {
            modelContainer.classList.add('loaded');
        }
    }

    addMouseInteraction() {
        if (!this.container) return;
        
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;
        
        this.container.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            this.isInteracting = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        this.container.addEventListener('mouseup', () => {
            isMouseDown = false;
            this.isInteracting = false;
        });
        
        this.container.addEventListener('mousemove', (event) => {
            if (isMouseDown && this.model) {
                const deltaX = event.clientX - mouseX;
                const deltaY = event.clientY - mouseY;
                
                this.model.rotation.y += deltaX * 0.01;
                this.model.rotation.x += deltaY * 0.01;
                
                mouseX = event.clientX;
                mouseY = event.clientY;
            }
        });
        
        // Add touch support for mobile
        this.container.addEventListener('touchstart', (event) => {
            isMouseDown = true;
            this.isInteracting = true;
            mouseX = event.touches[0].clientX;
            mouseY = event.touches[0].clientY;
        });
        
        this.container.addEventListener('touchend', () => {
            isMouseDown = false;
            this.isInteracting = false;
        });
        
        this.container.addEventListener('touchmove', (event) => {
            if (isMouseDown && this.model) {
                const deltaX = event.touches[0].clientX - mouseX;
                const deltaY = event.touches[0].clientY - mouseY;
                
                this.model.rotation.y += deltaX * 0.01;
                this.model.rotation.x += deltaY * 0.01;
                
                mouseX = event.touches[0].clientX;
                mouseY = event.touches[0].clientY;
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Auto-rotate the model when not being interacted with
        if (this.model && !this.isInteracting) {
            this.model.rotation.y += 0.005;
        }

        // Animate all objects in the scene
        this.scene.children.forEach((child) => {
            if (child.isMesh && child !== this.model) {
                child.rotation.y += 0.01;
                child.rotation.x += 0.005;
            }
        });

        // Update animation mixer
        if (this.animationMixer) {
            this.animationMixer.update(this.clock.getDelta());
        }

        // Render the scene
        this.renderer.render(this.scene, this.camera);
        
        // Debug: Log every 100 frames to confirm animation is running
        if (this.frameCount === undefined) this.frameCount = 0;
        this.frameCount++;
        if (this.frameCount % 100 === 0) {
            console.log('3D scene is animating, frame:', this.frameCount);
        }
    }

    onWindowResize() {
        if (this.camera && this.renderer && this.container) {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        }
    }
}

// Initialize 3D model when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking Three.js availability...');
    
    // Check if Three.js is available
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded!');
        return;
    }
    
    console.log('Three.js is available, version:', THREE.REVISION);
    
    // Wait a bit for the page to fully load
    setTimeout(() => {
        console.log('Starting 3D model initialization...');
        new Model3D();
    }, 1000);
}); 