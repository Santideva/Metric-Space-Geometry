import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import StateStore from './state-store';
import { MetricVertex, MetricSpaceGeometry } from './core/metric-space-geometry';
import vertexShader from './shaders/customVertexShader.glsl';
import fragmentShader from './shaders/customFragmentShader.glsl';

class MetricSpaceVisualization {
  constructor(mountElement, vertexCount = 5) {
    this.mountElement = mountElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.renderObject = null;
    this.lineSegments = null;
    this.gui = null;
    this.vertexCount = vertexCount;
    this.vertices = [];
    this.renderMode = 'points'; // Default render mode

    this.init();
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.mountElement.appendChild(this.renderer.domElement);

    // Generate vertices
    this.generateVertices(this.vertexCount);
    
    // Create metric space geometry
    this.createMetricGeometry();

    // Camera positioning
    this.camera.position.z = 5;

    // Orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Setup GUI
    this.setupGUI();

    // Subscribe to state changes
    StateStore.subscribe(this.updateVisualization.bind(this));

    // Start animation
    this.animate();

    // Resize handler
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  createShaderMaterial() {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        u_position: { value: new THREE.Vector3(0, 0, 0) },
        u_mass: { value: 1.0 },
        u_charge: { value: 0.5 },
        u_symmetryIndex: { value: 1.0 },
        u_reflectivity: { value: 0.7 },
        u_valency: { value: 1.0 },
        u_volume: { value: 1.0 },
        u_density: { value: 1.0 },
        u_orientation: { value: new THREE.Vector3(0, 0, 0) },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        // Additional uniforms for polygon properties:
        uChladniAmplitude: { value: 1.0 },
        uChladniFrequencyX: { value: 1.0 },
        uChladniFrequencyY: { value: 1.0 },
        uUseClassicalMobius: { value: true },
        uMobiusFactor: { value: 1.0 },
        uNoiseScale: { value: 1.0 },
        uAnimationSpeed: { value: 1.0 },
        uA: { value: new THREE.Vector2(1, 0) },
        uB: { value: new THREE.Vector2(0, 0) },
        uC: { value: new THREE.Vector2(0, 0) },
        uD: { value: new THREE.Vector2(1, 0) }
      },
      transparent: true,
      depthWrite: false
    });
  }

  createMetricGeometry() {
    // Clear previous objects from scene if they exist
    if (this.renderObject) this.scene.remove(this.renderObject);
    if (this.lineSegments) this.scene.remove(this.lineSegments);
    
    // Create metric space geometry
    const metricGeometry = new MetricSpaceGeometry(this.vertices, StateStore.getConfig());

    // Create geometries
    const { pointGeometry, lineGeometry } = metricGeometry.createGeometries(THREE);

    // Create shader material
    const shaderMaterial = this.createShaderMaterial();

    // Create rendering object based on current mode
    if (this.renderMode === 'points') {
      // Points object
      this.renderObject = new THREE.Points(pointGeometry, shaderMaterial);
    } else {
      // Mesh object
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', pointGeometry.getAttribute('position'));
      this.renderObject = new THREE.Mesh(geometry, shaderMaterial);
    }
    this.scene.add(this.renderObject);

    // Connecting lines
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: StateStore.config.lineColor,
      transparent: true,
      opacity: StateStore.config.lineOpacity
    });
    this.lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    this.scene.add(this.lineSegments);
  }

  generateVertices(count) {
    this.vertices = [];
    
    for (let i = 0; i < count; i++) {
      // Generate random positions in a cube
      const x = (Math.random() - 0.5) * 4;
      const y = (Math.random() - 0.5) * 4;
      const z = (Math.random() - 0.5) * 4;
      
      // Generate random weights and curvatures
      const weight = 0.5 + Math.random() * 1.0; // Between 0.5 and 1.5
      const curvature = 0.1 + Math.random() * 0.4; // Between 0.1 and 0.5
      
      this.vertices.push(new MetricVertex(x, y, z, weight, curvature));
    }
    
    return this.vertices;
  }

  regenerateVertices(count) {
    // Update vertex count
    this.vertexCount = count;
    
    // Generate new vertices
    this.generateVertices(count);
    
    // Recreate the geometry
    this.createMetricGeometry();
  }

  setupGUI() {
    this.gui = new dat.GUI();

    // Vertex Generation
    const vertexFolder = this.gui.addFolder('Vertices');
    vertexFolder.add({ vertexCount: this.vertexCount }, 'vertexCount', 3, 500).step(1)
      .onChange(value => this.regenerateVertices(Math.floor(value)));
    vertexFolder.add({ regenerate: () => this.regenerateVertices(this.vertexCount) }, 'regenerate')
      .name('Regenerate Vertices');
    vertexFolder.open();

    // Metric Space Parameters
    const metricFolder = this.gui.addFolder('Metric Space');
    metricFolder.add(StateStore.config, 'alpha', 0, 2).onChange(value => StateStore.update('alpha', value));
    metricFolder.add(StateStore.config, 'beta', 0, 2).onChange(value => StateStore.update('beta', value));
    metricFolder.add(StateStore.config, 'gamma', 0, 2).onChange(value => StateStore.update('gamma', value));
    metricFolder.add(StateStore.config, 'threshold', 1, 10).onChange(value => StateStore.update('threshold', value));

    // Visualization Parameters
    const visualFolder = this.gui.addFolder('Visualization');
    visualFolder.add(StateStore.config, 'pointSize', 0.1, 1).onChange(value => StateStore.update('pointSize', value));
    visualFolder.addColor(StateStore.config, 'pointColor').onChange(value => StateStore.update('pointColor', value));
    visualFolder.add(StateStore.config, 'pointOpacity', 0, 1).onChange(value => StateStore.update('pointOpacity', value));
    visualFolder.addColor(StateStore.config, 'lineColor').onChange(value => StateStore.update('lineColor', value));
    visualFolder.add(StateStore.config, 'lineOpacity', 0, 1).onChange(value => StateStore.update('lineOpacity', value));

    // Render Mode Toggle
    const renderModeController = visualFolder.add(this, 'renderMode', ['points', 'mesh'])
      .name('Render Mode')
      .onChange(() => this.createMetricGeometry());

    // Interaction Parameters
    const interactionFolder = this.gui.addFolder('Interaction');
    interactionFolder.add(StateStore.config, 'autoRotate').onChange(value => StateStore.update('autoRotate', value));
    interactionFolder.add(StateStore.config, 'animationSpeed', 0, 5).onChange(value => StateStore.update('animationSpeed', value));
  }

  updateVisualization(key, value) {
    // Update point material
    if (['pointSize', 'pointColor', 'pointOpacity'].includes(key)) {
      if (this.renderObject && this.renderObject.material) {
        // Always mark material as needing update
        this.renderObject.material.needsUpdate = true;
        
        try {
          // Check if it's a Points object before setting size
          if (this.renderObject instanceof THREE.Points) {
            // Safely set point size
            if (typeof StateStore.config.pointSize === 'number') {
              this.renderObject.material.size = StateStore.config.pointSize;
            }
            
            // Safely set color - convert hex to THREE.Color
            if (typeof StateStore.config.pointColor === 'number') {
              this.renderObject.material.color = new THREE.Color(StateStore.config.pointColor);
            }
            
            // Safely set opacity
            if (typeof StateStore.config.pointOpacity === 'number') {
              this.renderObject.material.opacity = StateStore.config.pointOpacity;
              this.renderObject.material.transparent = true;
            }
          }
        } catch (error) {
          console.error('Error updating point material:', error);
        }
      }
    }
  
    // Update line material
    if (['lineColor', 'lineOpacity'].includes(key)) {
      if (this.lineSegments && this.lineSegments.material) {
        try {
          // Safely set line color
          if (typeof StateStore.config.lineColor === 'number') {
            this.lineSegments.material.color = new THREE.Color(StateStore.config.lineColor);
          }
          
          // Safely set line opacity
          if (typeof StateStore.config.lineOpacity === 'number') {
            this.lineSegments.material.opacity = StateStore.config.lineOpacity;
            this.lineSegments.material.transparent = true;
          }
          
          this.lineSegments.material.needsUpdate = true;
        } catch (error) {
          console.error('Error updating line material:', error);
        }
      }
    }
    
    // Regenerate geometry if metric parameters change
    if (['alpha', 'beta', 'gamma', 'threshold'].includes(key)) {
      this.createMetricGeometry();
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // Update shader time uniform for animation
    if (this.renderObject && this.renderObject.material) {
      this.renderObject.material.uniforms.uTime.value = performance.now() * 0.001;
    }

    // Optional auto-rotation
    if (StateStore.config.autoRotate) {
      const rotationSpeed = 0.001 * StateStore.config.animationSpeed;
      this.scene.rotation.y += rotationSpeed;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Update resolution uniform if shader material exists
    if (this.renderObject && this.renderObject.material) {
      this.renderObject.material.uniforms.u_resolution.value.set(
        window.innerWidth, 
        window.innerHeight
      );
    }
  }

  // Cleanup method
  dispose() {
    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize);
    
    // Dispose Three.js resources
    if (this.renderObject) {
      this.renderObject.geometry.dispose();
      this.renderObject.material.dispose();
      this.scene.remove(this.renderObject);
    }

    if (this.lineSegments) {
      this.lineSegments.geometry.dispose();
      this.lineSegments.material.dispose();
      this.scene.remove(this.lineSegments);
    }

    this.renderer.dispose();
    this.controls.dispose();

    // Remove GUI
    if (this.gui) {
      this.gui.destroy();
    }

    // Remove renderer from DOM
    if (this.mountElement && this.renderer.domElement) {
      this.mountElement.removeChild(this.renderer.domElement);
    }
  }
}

export default MetricSpaceVisualization;