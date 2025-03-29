#ifdef GL_ES
precision mediump float;
#endif

// Line-specific uniform variables
uniform float uLineWidth;           // Width of the lines
uniform float uLineDash;            // For dashed lines (0.0 = solid)
uniform float uLineVariation;       // Controls how much the lines vary in width

// Mobius-Chladni transformation parameters
uniform float uChladniAmplitude;    // Controls the height of the Chladni pattern
uniform float uChladniFrequencyX;   // X-axis frequency for the Chladni pattern
uniform float uChladniFrequencyY;   // Y-axis frequency for the Chladni pattern
uniform float uMobiusFactor;        // Controls the intensity of the Möbius transformation
uniform float uNoiseScale;          // Controls the amount of noise influence
uniform float uAnimationSpeed;      // Controls animation speed

// Original polygon property uniforms - repurposed for line properties
uniform vec3 u_position;            // Base position influence
uniform float u_mass;               // Affects line thickness
uniform float u_charge;             // Electrical charge - color influence
uniform float u_symmetryIndex;      // Stability and interaction encoding
uniform float u_reflectivity;       // Light reflectivity
uniform float u_valency;            // Brightness modulation
uniform float u_volume;             // Volume - overall scale influence
uniform float u_density;            // Density - opacity influence
uniform vec3 u_orientation;         // Rotation or orientation

// Shader input variables
uniform vec2 u_resolution;          // Viewport resolution
uniform float u_time;               // Time for dynamic effects

// Input from vertex shader
varying vec3 vPosition;             // Position passed from vertex shader
varying float vDistanceToCamera;    // Distance to camera for depth effects

// Dynamic color generation based on line properties
vec3 generateDynamicColor() {
    // Calculate positional influence
    float positionInfluence = sin(vPosition.x * 0.1 + vPosition.y * 0.2 + vPosition.z * 0.05);
    
    // Use line properties to influence color with smoother transitions
    vec3 baseColor = vec3(
        0.5 + 0.3 * sin(u_charge * 3.0 + positionInfluence),          // Red component
        0.5 + 0.3 * cos(u_symmetryIndex * 2.0 + u_time * 0.1),        // Green component
        0.5 + 0.3 * sin(u_reflectivity * 1.5 + u_time * 0.2)          // Blue component
    );
    
    // Add subtle Chladni influence to color
    float chladniFactor = sin(uChladniFrequencyX * vPosition.x + u_time) * 
                          sin(uChladniFrequencyY * vPosition.y + u_time);
    
    baseColor += vec3(chladniFactor * 0.1);
    
    // Normalize and clamp color values
    return clamp(baseColor, 0.0, 1.0);
}

// Light interaction simulation with smooth falloff
float calculateLightInteraction() {
    // Simulate light interaction with smoother transitions
    float distanceFactor = smoothstep(10.0, 1.0, vDistanceToCamera);
    
    float lightIntensity = u_reflectivity * (
        0.5 + 0.3 * sin(u_time * 0.5) *           // Smooth time-based pulsing
        abs(cos(u_orientation.x + vPosition.x * 0.1)) *  // Orientation and position influence
        abs(sin(u_orientation.y + vPosition.y * 0.1))
    );
    
    // Make light intensity stronger at closer distances
    lightIntensity *= (1.0 + distanceFactor);
    
    return clamp(lightIntensity, 0.1, 1.0);
}

// Line pattern generation - for creating dash patterns or variations along the line
float calculateLinePattern() {
    // If line dash is enabled
    if (uLineDash > 0.0) {
        float dashPattern = mod(vPosition.x + vPosition.y + vPosition.z + u_time * uAnimationSpeed * 0.5, uLineDash * 2.0);
        return step(uLineDash, dashPattern);
    }
    
    // For solid lines, return a subtle pattern based on position
    float lineVariation = sin(vPosition.x * 5.0 + vPosition.y * 5.0 + u_time * uAnimationSpeed) * 0.5 + 0.5;
    return mix(0.8, 1.0, lineVariation);
}

// Calculate edge glow effect
float calculateEdgeGlow() {
    // Simulate edge glow based on viewing angle
    float edgeFactor = 1.0 - abs(dot(normalize(vPosition), vec3(0.0, 0.0, 1.0)));
    
    // Make it pulse slightly with time
    edgeFactor *= (1.0 + 0.2 * sin(u_time * 0.3));
    
    return pow(edgeFactor, 2.0);
}

void main() {
    // Generate dynamic color for the line
    vec3 dynamicColor = generateDynamicColor();
    
    // Calculate light interaction
    float lightInteraction = calculateLightInteraction();
    
    // Calculate line pattern - for dashes or variations
    float linePattern = calculateLinePattern();
    
    // Calculate edge glow effect
    float edgeGlow = calculateEdgeGlow() * u_valency;
    
    // Discard fragments for dash pattern if needed
    if (linePattern < 0.1 && uLineDash > 0.0) {
        discard;
    }
    
    // Apply mass to influence line brightness
    float massFactor = 1.0 + u_mass * 0.5;
    
    // Final color calculation
    vec3 finalColor = dynamicColor * lightInteraction * massFactor;
    
    // Add edge glow
    finalColor += vec3(1.0, 0.8, 0.5) * edgeGlow * u_reflectivity;
    
    // Calculate alpha based on density and distance
    float alpha = u_density * smoothstep(100.0, 10.0, vDistanceToCamera);
    
    // Apply line pattern to alpha
    alpha *= linePattern;
    
    // Output final fragment color
    gl_FragColor = vec4(finalColor, alpha);
}