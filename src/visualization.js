import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import StateStore from './state-store';
import GuiModule from './ui/GuiModule.js';
import Logger from './logger'; // Import the logger
import { MetricVertex, MetricSpaceGeometry } from './core/metric-space-geometry';
import vertexShader from './shaders/customVertexShader.glsl';
import fragmentShader from './shaders/customFragmentShader.glsl';

class MetricSpaceVisualization {
  constructor(mountElement, vertexCount = 5) {
    Logger.info('Initializing MetricSpaceVisualization', {
      mountElement: mountElement,
      vertexCount: vertexCount
    });

    this.mountElement = mountElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.renderObject = null;
    this.lineSegments = null;
    this.vertexCount = vertexCount;
    this.vertices = [];
    this.renderMode = 'points'; // Default render mode

    // Create GUI module with callback methods
    this.guiModule = new GuiModule(StateStore, {
      vertexCount: this.vertexCount,
      regenerateVertices: this.regenerateVertices.bind(this),
      changeRenderMode: this.changeRenderMode.bind(this),
      updateUniform: this.updateUniform.bind(this)
    });

    try {
      this.init();
    } catch (error) {
      Logger.error('Failed to initialize MetricSpaceVisualization', {
        error: error.message,
        stack: error.stack
      });
    }
  }

  init() {
    Logger.debug('Starting initialization of MetricSpaceVisualization');

    // Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.mountElement.appendChild(this.renderer.domElement);

      Logger.info('Renderer created and mounted', {
        rendererType: this.renderer.constructor.name,
        canvasSize: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    } catch (error) {
      Logger.error('Failed to create WebGL renderer', {
        error: error.message,
        mountElement: this.mountElement
      });
      throw error;
    }

    // Generate vertices
    try {
      this.generateVertices(this.vertexCount);
      Logger.debug('Vertices generated', {
        vertexCount: this.vertices.length,
        vertices: this.vertices.map(v => ({x: v.x, y: v.y, z: v.z}))
      });
    } catch (error) {
      Logger.error('Failed to generate vertices', {
        error: error.message,
        vertexCount: this.vertexCount
      });
      throw error;
    }
    
    // Create metric space geometry
    try {
      this.createMetricGeometry();
      Logger.info('Metric geometry created successfully');
    } catch (error) {
      Logger.error('Failed to create metric geometry', {
        error: error.message
      });
      throw error;
    }

    // Camera positioning
    this.camera.position.z = 5;
    Logger.debug('Camera positioned', { 
      position: this.camera.position.toArray() 
    });

    // Orbit controls
    try {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      Logger.info('Orbit controls initialized');
    } catch (error) {
      Logger.error('Failed to create orbit controls', {
        error: error.message
      });
      throw error;
    }

    // Setup GUI
    try {
      this.guiModule.init();
      Logger.info('GUI module initialized');
    } catch (error) {
      Logger.error('Failed to initialize GUI module', {
        error: error.message
      });
    }

    // Subscribe to state changes
    StateStore.subscribe(this.updateVisualization.bind(this));

    // Start animation
    this.animate();

    // Resize handler
    window.addEventListener('resize', this.onWindowResize.bind(this));

    Logger.info('MetricSpaceVisualization initialization complete');
  }

  createShaderMaterial() {
    try {
      const material = new THREE.ShaderMaterial({
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

      Logger.debug('Shader material created', {
        uniformKeys: Object.keys(material.uniforms)
      });

      return material;
    } catch (error) {
      Logger.error('Failed to create shader material', {
        error: error.message
      });
      throw error;
    }
  }

  createMetricGeometry() {
    Logger.debug('Creating metric geometry', {
      renderMode: this.renderMode,
      vertexCount: this.vertices.length
    });

    // Clear previous objects from scene if they exist
    if (this.renderObject) {
      this.scene.remove(this.renderObject);
      Logger.debug('Removed previous render object');
    }
    if (this.lineSegments) {
      this.scene.remove(this.lineSegments);
      Logger.debug('Removed previous line segments');
    }
    
    // Create metric space geometry
    const metricGeometry = new MetricSpaceGeometry(this.vertices, StateStore.getConfig());

    // Create geometries
    const { pointGeometry, lineGeometry } = metricGeometry.createGeometries(THREE);

    // Create shader material
    const shaderMaterial = this.createShaderMaterial();

    try {
      // Create rendering object based on current mode
      if (this.renderMode === 'points') {
        // Points object
        this.renderObject = new THREE.Points(pointGeometry, shaderMaterial);
        Logger.info('Created Points object');
      } else {
        // Mesh object
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', pointGeometry.getAttribute('position'));
        this.renderObject = new THREE.Mesh(geometry, shaderMaterial);
        Logger.info('Created Mesh object');
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

      Logger.debug('Metric geometry creation complete', {
        renderObjectType: this.renderObject.constructor.name,
        lineSegmentsExists: !!this.lineSegments
      });
    } catch (error) {
      Logger.error('Failed to create render objects', {
        error: error.message,
        renderMode: this.renderMode
      });
      throw error;
    }
  }

  generateVertices(count) {
    Logger.debug('Generating vertices', { count });
    
    this.vertices = [];
    
    // Use controlled randomization that preserves metric properties
    for (let i = 0; i < count; i++) {
      // Linear space generation, but with controlled variance
      const x = (Math.random() - 0.5) * 4 * (1 + Math.sin(i) * 0.2);
      const y = (Math.random() - 0.5) * 4 * (1 + Math.cos(i) * 0.2);
      const z = (Math.random() - 0.5) * 4 * (1 + Math.tan(i * 0.5) * 0.1);
      
      // Weight and curvature generation with controlled distribution
      const weight = 1.0 + Math.pow(Math.random(), 3) * 2.0; // Skewed towards 1
      const curvature = Math.PI/4 * Math.random(); // Constrained curvature
      
      const vertex = new MetricVertex(x, y, z, weight, curvature);
      this.vertices.push(vertex);
    }
    
    Logger.info('Metric-preserving vertices generated', {
      totalVertices: this.vertices.length,
      spatialDistribution: 'Controlled Linear',
      weightDistribution: 'Constrained',
      curvatureRange: 'Limited'
    });
    
    return this.vertices;
  }
  
  // Complementary metric distance method
  customDistance(v1, v2) {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    const dz = v1.z - v2.z;
    
    // Euclidean base with weighted complexity
    const baseDistance = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    // Weighted terms with controlled influence
    const weightDifference = Math.abs(v1.weight - v2.weight);
    const curvatureDifference = Math.abs(v1.curvature - v2.curvature);
    
    // Composite metric preserving triangular inequality
    return Math.sqrt(
      Math.pow(baseDistance, 2) + 
      this.alpha * Math.pow(weightDifference, 2) + 
      this.beta * Math.pow(curvatureDifference, 2)
    );
  }
  

  regenerateVertices(count) {
    // Update vertex count
    this.vertexCount = count;
    
    // Generate new vertices
    this.generateVertices(count);
    
    // Recreate the geometry
    this.createMetricGeometry();
  }

  // Method to change render mode dynamically
  changeRenderMode(mode) {
    this.renderMode = mode;
    this.createMetricGeometry();
  }

  // Method to update shader uniforms dynamically
  updateUniform(uniformName, value) {
    if (this.renderObject && this.renderObject.material) {
      // Update the uniform in the shader material
      if (this.renderObject.material.uniforms[uniformName]) {
        this.renderObject.material.uniforms[uniformName].value = value;
        this.renderObject.material.needsUpdate = true;
      }
    }
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
    Logger.info('Disposing MetricSpaceVisualization resources');

    try {
      // Remove event listeners
      window.removeEventListener('resize', this.onWindowResize);
      Logger.debug('Resize event listener removed');
      
      // Dispose Three.js resources
      if (this.renderObject) {
        this.renderObject.geometry.dispose();
        this.renderObject.material.dispose();
        this.scene.remove(this.renderObject);
        Logger.debug('Render object resources disposed');
      }

      if (this.lineSegments) {
        this.lineSegments.geometry.dispose();
        this.lineSegments.material.dispose();
        this.scene.remove(this.lineSegments);
        Logger.debug('Line segments resources disposed');
      }

      this.renderer.dispose();
      this.controls.dispose();
      Logger.debug('Renderer and controls disposed');

      // Destroy GUI module
      this.guiModule.destroy();
      Logger.debug('GUI module destroyed');

      // Remove renderer from DOM
      if (this.mountElement && this.renderer.domElement) {
        this.mountElement.removeChild(this.renderer.domElement);
        Logger.info('Renderer DOM element removed');
      }
    } catch (error) {
      Logger.error('Error during resource disposal', {
        error: error.message,
        stack: error.stack
      });
    }
  }
}

export default MetricSpaceVisualization;

// Add this at the end of the file
if (module.hot) {
  module.hot.accept();
}