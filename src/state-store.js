class StateStore {
  constructor() {
    // Metric Space Configuration
    this.config = {

      // Metric Space Parameters
      alpha: 1.0,   // Euclidean distance weight
      beta: 0.5,    // Curvature term weight
      gamma: 0.2,   // Weight term weight
      threshold: 10.0,

      // Extended Metric Space Controls
      minDistance: 0.1,   // Minimum inter-vertex distance
      maxDistance: 10.0,  // Maximum inter-vertex distance
      distortionFactor: 1.0, // New parameter for spatial warping

      // Visualization Parameters
      pointSize: 0.2,
      pointSizeRange: [0.01, 2.0],
      pointColor: 0x00ff00,
      pointOpacity: 0.7,
      pointOpacityRange: [0.1, 1.0],

      lineColor: 0xff0000,
      lineOpacity: 0.5,
      lineOpacityRange: [0.1, 0.9],      

      // Animation/Interaction
      autoRotate: false,
      animationSpeed: 1.0,
      animationSpeedRange: [0, 10],

      // Shader Uniform Parameters
      complexityLevel: 3, // New parameter to control visual complexity
      uChladniAmplitude: 1.0,
      uChladniAmplitudeRange: [0, 10],
      
      uChladniFrequencyX: 1.0,
      uChladniFrequencyY: 1.0,
      uChladniFrequencyRange: [0, 20],
      
      uUseClassicalMobius: true,
      uMobiusFactor: 1.0,
      uMobiusFactorRange: [0, 10],
      
      uNoiseScale: 1.0,
      uNoiseScaleRange: [0, 10],
      
      uAnimationSpeed: 1.0,
      uAnimationSpeedRange: [0, 10]
    };

    // Listeners for configuration changes
    this.listeners = [];
  }

  // Update a specific configuration parameter
  update(key, value) {
    if (this.config.hasOwnProperty(key)) {
      this.config[key] = value;
      this.notifyListeners(key, value);
    }
  }

  // Subscribe to configuration changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of a change
  notifyListeners(key, value) {
    this.listeners.forEach(listener => listener(key, value));
  }

  // Get current configuration
  getConfig() {
    return { ...this.config };
  }
}

export default new StateStore();