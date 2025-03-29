import * as dat from 'dat.gui';
import StateStore from '../state-store.js';

class GuiModule {
  constructor(stateStore, onUpdateCallback) {
    this.stateStore = stateStore;
    this.onUpdateCallback = onUpdateCallback;
    this.gui = null;
    this.renderMode = 'points'; // Match the default in visualization
  }

  init() {
    this.gui = new dat.GUI();
    this.setupVertexFolder();
    this.setupMetricSpaceFolder();
    this.setupVisualizationFolder();
    this.setupInteractionFolder();
    this.setupShaderUniformsFolder();
  }

  setupVertexFolder() {
    const vertexFolder = this.gui.addFolder('Vertices');
    
    // Bind directly to the state object's vertexCount
    vertexFolder.add(this.stateStore.config, 'vertexCount', 3, 500)
      .step(1)
      .onChange(value => {
        // Update state and trigger regeneration
        this.stateStore.update('vertexCount', Math.floor(value));
        this.onUpdateCallback.regenerateVertices(Math.floor(value));
      })
      .name('Vertex Count');
    
    // Regenerate button using the current state value
    vertexFolder.add({ regenerate: () => this.onUpdateCallback.regenerateVertices(this.stateStore.config.vertexCount) }, 'regenerate')
      .name('Regenerate Vertices');
    
    vertexFolder.open();
  }

  setupMetricSpaceFolder() {
    const metricFolder = this.gui.addFolder('Metric Space Parameters');
    
    // Metric space parameters with more comprehensive controls
    metricFolder.add(this.stateStore.config, 'alpha', 0, 5)
      .step(0.1)
      .onChange(value => this.stateStore.update('alpha', value))
      .name('Alpha (Distance Weight)');
    
    metricFolder.add(this.stateStore.config, 'beta', 0, 5)
      .step(0.1)
      .onChange(value => this.stateStore.update('beta', value))
      .name('Beta (Curvature Weight)');
    
    metricFolder.add(this.stateStore.config, 'gamma', 0, 5)
      .step(0.1)
      .onChange(value => this.stateStore.update('gamma', value))
      .name('Gamma (Weight Term)');
    
    metricFolder.add(this.stateStore.config, 'threshold', 1, 20)
      .step(0.5)
      .onChange(value => this.stateStore.update('threshold', value));
    
    // Extended metric space controls
    metricFolder.add(this.stateStore.config, 'minDistance', 0.01, 5)
      .step(0.01)
      .onChange(value => this.stateStore.update('minDistance', value))
      .name('Min Vertex Distance');
    
    metricFolder.add(this.stateStore.config, 'maxDistance', 5, 20)
      .step(0.5)
      .onChange(value => this.stateStore.update('maxDistance', value))
      .name('Max Vertex Distance');
    
    metricFolder.add(this.stateStore.config, 'distortionFactor', 0, 5)
      .step(0.1)
      .onChange(value => this.stateStore.update('distortionFactor', value))
      .name('Spatial Distortion');
    
    metricFolder.add(this.stateStore.config, 'complexityLevel', 1, 5)
      .step(1)
      .onChange(value => this.stateStore.update('complexityLevel', value))
      .name('Visual Complexity');
    
    metricFolder.open();
  }

  setupVisualizationFolder() {
    const visualFolder = this.gui.addFolder('Visualization');
    
    // Point visualization with expanded controls
    const pointSizeController = visualFolder.add(
      this.stateStore.config, 
      'pointSize', 
      this.stateStore.config.pointSizeRange[0], 
      this.stateStore.config.pointSizeRange[1]
    ).onChange(value => {
      this.stateStore.update('pointSize', value);
      this.onUpdateCallback.updateUniform('uPointSize', value);
    });
    
    visualFolder.addColor(this.stateStore.config, 'pointColor')
      .onChange(value => this.stateStore.update('pointColor', value))
      .name('Point Color');
    
    const pointOpacityController = visualFolder.add(
      this.stateStore.config, 
      'pointOpacity', 
      this.stateStore.config.pointOpacityRange[0], 
      this.stateStore.config.pointOpacityRange[1]
    ).onChange(value => this.stateStore.update('pointOpacity', value));
    
    // Line visualization controls
    visualFolder.addColor(this.stateStore.config, 'lineColor')
      .onChange(value => this.stateStore.update('lineColor', value))
      .name('Line Color');
    
    const lineOpacityController = visualFolder.add(
      this.stateStore.config, 
      'lineOpacity', 
      this.stateStore.config.lineOpacityRange[0], 
      this.stateStore.config.lineOpacityRange[1]
    ).onChange(value => this.stateStore.update('lineOpacity', value));
    
    // Render Mode Toggle
    visualFolder.add(this, 'renderMode', ['points', 'mesh'])
      .name('Render Mode')
      .onChange(() => this.onUpdateCallback.changeRenderMode(this.renderMode));
    
    // Optional: Add labels to sliders
    pointSizeController.name('Point Size');
    pointOpacityController.name('Point Opacity');
    lineOpacityController.name('Line Opacity');
  }

  setupInteractionFolder() {
    const interactionFolder = this.gui.addFolder('Interaction');
    
    interactionFolder.add(this.stateStore.config, 'autoRotate')
      .onChange(value => this.stateStore.update('autoRotate', value))
      .name('Auto Rotate');
    
    const animationSpeedController = interactionFolder.add(
      this.stateStore.config, 
      'animationSpeed', 
      this.stateStore.config.animationSpeedRange[0], 
      this.stateStore.config.animationSpeedRange[1]
    ).onChange(value => this.stateStore.update('animationSpeed', value));
    
    animationSpeedController.name('Animation Speed');
  }

  setupShaderUniformsFolder() {
    const shaderFolder = this.gui.addFolder('Shader Uniforms');
    
    // Chladni Pattern Uniforms
    const chladniAmplitudeController = shaderFolder.add(
      this.stateStore.config, 
      'uChladniAmplitude', 
      this.stateStore.config.uChladniAmplitudeRange[0], 
      this.stateStore.config.uChladniAmplitudeRange[1]
    ).step(0.1).onChange(value => this.onUpdateCallback.updateUniform('uChladniAmplitude', value));
    
    const chladniFreqXController = shaderFolder.add(
      this.stateStore.config, 
      'uChladniFrequencyX', 
      this.stateStore.config.uChladniFrequencyRange[0], 
      this.stateStore.config.uChladniFrequencyRange[1]
    ).step(0.1).onChange(value => this.onUpdateCallback.updateUniform('uChladniFrequencyX', value));
    
    const chladniFreqYController = shaderFolder.add(
      this.stateStore.config, 
      'uChladniFrequencyY', 
      this.stateStore.config.uChladniFrequencyRange[0], 
      this.stateStore.config.uChladniFrequencyRange[1]
    ).step(0.1).onChange(value => this.onUpdateCallback.updateUniform('uChladniFrequencyY', value));
    
    // Mobius Transformation Uniforms
    shaderFolder.add(this.stateStore.config, 'uUseClassicalMobius')
      .onChange(value => this.onUpdateCallback.updateUniform('uUseClassicalMobius', value))
      .name('Classic Mobius');
    
    const mobiusFactorController = shaderFolder.add(
      this.stateStore.config, 
      'uMobiusFactor', 
      this.stateStore.config.uMobiusFactorRange[0], 
      this.stateStore.config.uMobiusFactorRange[1]
    ).step(0.1).onChange(value => this.onUpdateCallback.updateUniform('uMobiusFactor', value));
    
    const noiseScaleController = shaderFolder.add(
      this.stateStore.config, 
      'uNoiseScale', 
      this.stateStore.config.uNoiseScaleRange[0], 
      this.stateStore.config.uNoiseScaleRange[1]
    ).step(0.1).onChange(value => this.onUpdateCallback.updateUniform('uNoiseScale', value));
    
    const animationSpeedController = shaderFolder.add(
      this.stateStore.config, 
      'uAnimationSpeed', 
      this.stateStore.config.uAnimationSpeedRange[0], 
      this.stateStore.config.uAnimationSpeedRange[1]
    ).step(0.1).onChange(value => this.onUpdateCallback.updateUniform('uAnimationSpeed', value));
    
    // Adding descriptive names
    chladniAmplitudeController.name('Chladni Amplitude');
    chladniFreqXController.name('Chladni Freq X');
    chladniFreqYController.name('Chladni Freq Y');
    mobiusFactorController.name('Mobius Factor');
    noiseScaleController.name('Noise Scale');
    animationSpeedController.name('Shader Animation Speed');
  }

  // Update method for cases where shader uniforms might change
  updateControls() {
    if (this.gui) {
      // Destroy and recreate the GUI
      this.gui.destroy();
      this.init();
    }
  }

  // Cleanup method
  destroy() {
    if (this.gui) {
      this.gui.destroy();
      this.gui = null;
    }
  }
}

export default GuiModule;
