import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import StateStore from './state-store';
import { MetricVertex, MetricSpaceGeometry } from './metric-space-geometry';

class MetricSpaceVisualization {
  constructor(mountElement) {
    this.mountElement = mountElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.points = null;
    this.lines = null;
    this.gui = null;

    this.init();
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.mountElement.appendChild(this.renderer.domElement);

    // Create vertices with varying weights and curvatures
    const vertices = [
      new MetricVertex(0, 0, 0, 1.0, 0.2),
      new MetricVertex(2, 1, 0, 0.8, 0.3),
      new MetricVertex(1, 2, 1, 1.2, 0.1),
      new MetricVertex(3, 0, 2, 0.5, 0.4),
      new MetricVertex(-1, 1, -1, 0.9, 0.2),
    ];

    // Create metric space geometry
    const metricGeometry = new MetricSpaceGeometry(vertices, StateStore.getConfig());

    // Create and add geometries to scene
    const { pointGeometry, lineGeometry } = metricGeometry.createGeometries(THREE);

    // Points
    const pointMaterial = new THREE.PointsMaterial({ 
      size: StateStore.config.pointSize, 
      color: StateStore.config.pointColor,
      transparent: true,
      opacity: StateStore.config.pointOpacity
    });
    this.points = new THREE.Points(pointGeometry, pointMaterial);
    this.scene.add(this.points);

    // Connecting lines
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: StateStore.config.lineColor,
      transparent: true,
      opacity: StateStore.config.lineOpacity
    });
    this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    this.scene.add(this.lines);

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

  setupGUI() {
    this.gui = new dat.GUI();

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

    // Interaction Parameters
    const interactionFolder = this.gui.addFolder('Interaction');
    interactionFolder.add(StateStore.config, 'autoRotate').onChange(value => StateStore.update('autoRotate', value));
    interactionFolder.add(StateStore.config, 'animationSpeed', 0, 5).onChange(value => StateStore.update('animationSpeed', value));
  }

  updateVisualization(key, value) {
    // Update point material
    if (['pointSize', 'pointColor', 'pointOpacity'].includes(key)) {
      this.points.material.needsUpdate = true;
      this.points.material.size = StateStore.config.pointSize;
      this.points.material.color.setHex(StateStore.config.pointColor);
      this.points.material.opacity = StateStore.config.pointOpacity;
    }

    // Update line material
    if (['lineColor', 'lineOpacity'].includes(key)) {
      this.lines.material.needsUpdate = true;
      this.lines.material.color.setHex(StateStore.config.lineColor);
      this.lines.material.opacity = StateStore.config.lineOpacity;
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
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
  }

  // Cleanup method
  dispose() {
    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize);
    
    // Dispose Three.js resources
    this.points.geometry.dispose();
    this.points.material.dispose();
    this.lines.geometry.dispose();
    this.lines.material.dispose();
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