class StateStore {
    constructor() {
      // Metric Space Configuration
      this.config = {
        // Metric Space Parameters
        alpha: 1.0,   // Euclidean distance weight
        beta: 0.5,    // Curvature term weight
        gamma: 0.2,   // Weight term weight
        threshold: 5.0,
  
        // Visualization Parameters
        pointSize: 0.2,
        pointColor: 0x00ff00,
        pointOpacity: 0.7,
        lineColor: 0xff0000,
        lineOpacity: 0.5,
  
        // Animation/Interaction
        autoRotate: false,
        animationSpeed: 1.0
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