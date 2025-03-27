// Mobius-Chladni Pattern Vertex Shader
// A customizable shader that combines Chladni patterns with Mobius transformations
// Can be used in Three.js or any WebGL framework with minor adjustments

// Core timing
uniform float uTime;

// Chladni pattern parameters
uniform float uChladniAmplitude; // Controls the height of the Chladni pattern
uniform float uChladniFrequencyX; // X-axis frequency for the Chladni pattern
uniform float uChladniFrequencyY; // Y-axis frequency for the Chladni pattern

// Mobius transformation parameters
uniform bool uUseClassicalMobius; // Toggle between classical and enhanced Mobius
uniform float uMobiusFactor; // Controls the intensity of the Mobius transformation
uniform float uNoiseScale; // Controls the amount of noise influence
uniform float uAnimationSpeed; // Controls animation speed

// Classical Mobius transformation parameters (complex coefficients)
uniform vec2 uA; // Complex number a (real, imag)
uniform vec2 uB; // Complex number b (real, imag)
uniform vec2 uC; // Complex number c (real, imag)
uniform vec2 uD; // Complex number d (real, imag)

// ======== Utility Functions ========

// ---- Simplex Noise Implementation ----
// Credit: Ian McEwan, Ashima Arts (MIT License)

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  // Permutations
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradients: 7x7 points over a square, mapped onto an octahedron
  float n_ = 0.142857142857; // 1.0/7.0
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// 2D simplex noise (uses 3D implementation)
float snoise(vec2 v) {
  return snoise(vec3(v.x, v.y, 0.0));
}

// ---- Complex Number Operations ----

vec2 complex_mul(vec2 a, vec2 b) {
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 complex_div(vec2 a, vec2 b) {
  float denominator = b.x * b.x + b.y * b.y;
  if (denominator < 0.0001) {
    // Return a large but finite value for small denominators
    float magnitude = sqrt(a.x * a.x + a.y * a.y);
    if (magnitude < 0.0001) return vec2(0.0, 0.0);
    float scale = 1000.0 / magnitude;
    return vec2(a.x * scale, a.y * scale);
  }
  return vec2(
    (a.x * b.x + a.y * b.y) / denominator,
    (a.y * b.x - a.x * b.y) / denominator
  );
}

// ======== Transformation Functions ========

// ---- Chladni Pattern Transformation ----
vec3 applyChladniTransform(vec2 pos, float time) {
  // Basic Chladni pattern
  float baseZ = sin(uChladniFrequencyX * pos.x + time) * sin(uChladniFrequencyY * pos.y + time);
  
  // Add noise modulation
  float noise = snoise(vec3(pos.x * 0.1, pos.y * 0.1, time * 0.05));
  
  // Combine base pattern with noise
  float z = uChladniAmplitude * (baseZ + noise * uNoiseScale);
  
  return vec3(pos.x, pos.y, z);
}

// ---- Classical Möbius Transformation ----
vec2 applyClassicalMobius(vec2 pos, float time) {
  // Create time-animated parameters
  float timePhase = time * uAnimationSpeed;
  vec2 a = vec2(
    uA.x * cos(timePhase) - uA.y * sin(timePhase),
    uA.x * sin(timePhase) + uA.y * cos(timePhase)
  );
  vec2 b = uB;
  vec2 c = uC;
  vec2 d = uD;
  
  // z = x + iy (input complex number)
  vec2 z = vec2(pos.x, pos.y);
  
  // Calculate (a*z + b)/(c*z + d)
  vec2 numerator = complex_mul(a, z);
  numerator += b;
  
  vec2 denominator = complex_mul(c, z);
  denominator += d;
  
  return complex_div(numerator, denominator);
}

// ---- Enhanced Möbius-like Transformation ----
vec3 applyEnhancedMobius(vec3 pos, float time) {
  // Calculate distance from origin for radial effects
  float distanceFromOrigin = length(pos.xy);
  
  // Create noise-based twist angle variations
  float noiseFactor = snoise(vec2(pos.x * 0.2, pos.y * 0.2)) * uNoiseScale;
  
  // Base twist calculation (distance-based)
  float twistAngle = uMobiusFactor * distanceFromOrigin;
  
  // Enhance with z-coordinate influence (makes it truly 3D)
  twistAngle *= (1.0 + 0.5 * sin(pos.z * 0.5));
  
  // Add time-based animation and noise variation
  twistAngle += time * 0.1 * (1.0 + noiseFactor);
  
  // Create rotation matrices for Z-axis rotation
  float cosZ = cos(twistAngle);
  float sinZ = sin(twistAngle);
  mat3 rotZ = mat3(
    cosZ, -sinZ, 0.0,
    sinZ, cosZ, 0.0,
    0.0, 0.0, 1.0
  );
  
  // Calculate secondary rotation angle based on position and noise
  float secondaryAngle = uMobiusFactor * 0.5 * (
    sin(distanceFromOrigin) + 
    snoise(vec2(pos.x * 0.1 + time * 0.05, pos.y * 0.1)) * uNoiseScale * 0.5
  );
  
  // Create rotation matrix for Y-axis
  float cosY = cos(secondaryAngle);
  float sinY = sin(secondaryAngle);
  mat3 rotY = mat3(
    cosY, 0.0, sinY,
    0.0, 1.0, 0.0,
    -sinY, 0.0, cosY
  );
  
  // Create rotation around X axis
  float xAngle = uMobiusFactor * 0.3 * snoise(vec2(pos.x * 0.15, time * 0.05)) * uNoiseScale;
  float cosX = cos(xAngle);
  float sinX = sin(xAngle);
  mat3 rotX = mat3(
    1.0, 0.0, 0.0,
    0.0, cosX, -sinX,
    0.0, sinX, cosX
  );
  
  // Apply rotations in sequence
  vec3 rotated = rotX * rotY * rotZ * pos;
  return rotated;
}

// ---- Noise-based Displacement ----
vec3 applyNoiseDisplacement(vec3 pos, float time) {
  float displacementX = snoise(vec3(pos.x * 0.2, pos.y * 0.2, time * 0.1)) * uNoiseScale;
  float displacementY = snoise(vec3(pos.x * 0.2, pos.y * 0.2, time * 0.15 + 100.0)) * uNoiseScale;
  float displacementZ = snoise(vec3(pos.x * 0.2, pos.y * 0.2, time * 0.05 + 200.0)) * uNoiseScale * 0.5;
  
  return pos + vec3(displacementX, displacementY, displacementZ);
}

// ======== Main Shader Function ========
void main() {
  // Start with original vertex position
  vec3 pos = position;
  float time = uTime;

  // Apply transformations in sequence
  
  // 1. Apply noise displacement for organic variety
  pos = applyNoiseDisplacement(pos, time);
  
  // 2. Apply Möbius transformation
  if (uUseClassicalMobius) {
    vec2 mobiusResult = applyClassicalMobius(pos.xy, time);
    pos = vec3(mobiusResult, pos.z);
  } else {
    pos = applyEnhancedMobius(pos, time);
  }
  
  // 3. Apply Chladni pattern
  vec3 chladniPos = applyChladniTransform(pos.xy, time);
  pos.z += chladniPos.z;  // Just add the z component

  // Set the final position
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}