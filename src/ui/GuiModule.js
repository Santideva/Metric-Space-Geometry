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
    
    vertexFolder.add({ vertexCount: this.onUpdateCallback.vertexCount }, 'vertexCount', 3, 500)
      .step(1)
      .onChange(value => this.onUpdateCallback.regenerateVertices(Math.floor(value)))
      .name('Vertex Count');
    
    vertexFolder.add({ regenerate: () => this.onUpdateCallback.regenerateVertices(this.onUpdateCallback.vertexCount) }, 'regenerate')
      .name('Regenerate Vertices');
    
    vertexFolder.open();
  }

  setupMetricSpaceFolder() {
    const metricFolder = this.gui.addFolder('Metric Space');
    
    metricFolder.add(this.stateStore.config, 'alpha', 0, 2)
      .onChange(value => this.stateStore.update('alpha', value));
    
    metricFolder.add(this.stateStore.config, 'beta', 0, 2)
      .onChange(value => this.stateStore.update('beta', value));
    
    metricFolder.add(this.stateStore.config, 'gamma', 0, 2)
      .onChange(value => this.stateStore.update('gamma', value));
    
    metricFolder.add(this.stateStore.config, 'threshold', 1, 10)
      .onChange(value => this.stateStore.update('threshold', value));
  }

  setupVisualizationFolder() {
    const visualFolder = this.gui.addFolder('Visualization');
    
    visualFolder.add(this.stateStore.config, 'pointSize', 0.1, 1)
      .onChange(value => this.stateStore.update('pointSize', value));
    
    visualFolder.addColor(this.stateStore.config, 'pointColor')
      .onChange(value => this.stateStore.update('pointColor', value));
    
    visualFolder.add(this.stateStore.config, 'pointOpacity', 0, 1)
      .onChange(value => this.stateStore.update('pointOpacity', value));
    
    visualFolder.addColor(this.stateStore.config, 'lineColor')
      .onChange(value => this.stateStore.update('lineColor', value));
    
    visualFolder.add(this.stateStore.config, 'lineOpacity', 0, 1)
      .onChange(value => this.stateStore.update('lineOpacity', value));
    
    // Render Mode Toggle
    visualFolder.add(this, 'renderMode', ['points', 'mesh'])
      .name('Render Mode')
      .onChange(() => this.onUpdateCallback.changeRenderMode(this.renderMode));
  }

  setupInteractionFolder() {
    const interactionFolder = this.gui.addFolder('Interaction');
    
    interactionFolder.add(this.stateStore.config, 'autoRotate')
      .onChange(value => this.stateStore.update('autoRotate', value));
    
    interactionFolder.add(this.stateStore.config, 'animationSpeed', 0, 5)
      .onChange(value => this.stateStore.update('animationSpeed', value));
  }

  setupShaderUniformsFolder() {
    const shaderFolder = this.gui.addFolder('Shader Uniforms');
    
    // Chladni Pattern Uniforms
    shaderFolder.add(this.stateStore.config, 'uChladniAmplitude', 0, 5)
      .step(0.1)
      .onChange(value => this.onUpdateCallback.updateUniform('uChladniAmplitude', value));
    
    shaderFolder.add(this.stateStore.config, 'uChladniFrequencyX', 0, 10)
      .step(0.1)
      .onChange(value => this.onUpdateCallback.updateUniform('uChladniFrequencyX', value));
    
    shaderFolder.add(this.stateStore.config, 'uChladniFrequencyY', 0, 10)
      .step(0.1)
      .onChange(value => this.onUpdateCallback.updateUniform('uChladniFrequencyY', value));
    
    // Mobius Transformation Uniforms
    shaderFolder.add(this.stateStore.config, 'uUseClassicalMobius')
      .onChange(value => this.onUpdateCallback.updateUniform('uUseClassicalMobius', value));
    
    shaderFolder.add(this.stateStore.config, 'uMobiusFactor', 0, 5)
      .step(0.1)
      .onChange(value => this.onUpdateCallback.updateUniform('uMobiusFactor', value));
    
    shaderFolder.add(this.stateStore.config, 'uNoiseScale', 0, 5)
      .step(0.1)
      .onChange(value => this.onUpdateCallback.updateUniform('uNoiseScale', value));
    
    shaderFolder.add(this.stateStore.config, 'uAnimationSpeed', 0, 5)
      .step(0.1)
      .onChange(value => this.onUpdateCallback.updateUniform('uAnimationSpeed', value));
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