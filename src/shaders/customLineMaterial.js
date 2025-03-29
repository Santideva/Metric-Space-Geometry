// Create a custom shader material for lines
const lineMaterial = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('vertexShader').textContent,  // Your vertex shader
    fragmentShader: document.getElementById('fragmentShader').textContent,  // Your fragment shader
    uniforms: {
      // Core timing
      uTime: { value: 0.0 },
      
      // Chladni pattern parameters
      uChladniAmplitude: { value: 0.5 },
      uChladniFrequencyX: { value: 0.1 },
      uChladniFrequencyY: { value: 0.1 },
      
      // Möbius transformation parameters
      uUseClassicalMobius: { value: false },
      uMobiusFactor: { value: 0.5 },
      uNoiseScale: { value: 0.2 },
      uAnimationSpeed: { value: 0.5 },
      
      // Classical Möbius transformation parameters
      uA: { value: new THREE.Vector2(1.0, 0.0) },
      uB: { value: new THREE.Vector2(0.0, 0.0) },
      uC: { value: new THREE.Vector2(0.0, 0.0) },
      uD: { value: new THREE.Vector2(1.0, 0.0) },
      
      // Line specific uniforms
      uLineWidth: { value: 2.0 },
      uLineDash: { value: 0.0 },
      uLineVariation: { value: 0.1 },
      
      // Additional uniforms from your first shader
      u_position: { value: new THREE.Vector3(0, 0, 0) },
      u_mass: { value: 1.0 },
      u_charge: { value: 0.5 },
      u_symmetryIndex: { value: 0.0 },
      u_reflectivity: { value: 0.5 },
      u_valency: { value: 1.0 },
      u_volume: { value: 1.0 },
      u_density: { value: 1.0 },
      u_orientation: { value: new THREE.Vector3(0, 0, 0) },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    transparent: true,
    side: THREE.DoubleSide
  });
  
  