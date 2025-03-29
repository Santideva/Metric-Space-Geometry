import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uPointSize: { value: StateStore.config.pointSize }, // Initially set from your state
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
  }
});
