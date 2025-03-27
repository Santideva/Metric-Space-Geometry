#ifdef GL_ES
precision mediump float;
#endif

// Uniform variables for polygon properties
uniform vec3 u_position;         // Polygon position
uniform float u_mass;             // Mass of the polygon
uniform float u_charge;           // Electrical charge
uniform float u_symmetryIndex;    // Stability and interaction encoding
uniform float u_reflectivity;     // Light reflectivity
uniform float u_valency;          // Bonding or splitting behavior
uniform float u_volume;           // Volume of the polygon
uniform float u_density;          // Density of the polygon
uniform vec3 u_orientation;       // Rotation or orientation

// Shader input variables
uniform vec2 u_resolution;        // Viewport resolution
uniform float u_time;             // Time for dynamic effects

// Input from vertex shader
varying vec2 v_texCoord;

// Smooth polygon interpolation function
float smoothPolygon(vec2 p, vec2 center, float radius, int sides) {
    float angle = atan(p.y - center.y, p.x - center.x);
    float segment = 2.0 * 3.14159 / float(sides);
    
    // Smooth interpolation using cosine
    float interpolatedRadius = radius * (1.0 + 0.2 * cos(u_time * 0.5));
    
    // Smooth falloff calculation
    float distanceToCenter = length(p - center);
    float smoothness = 0.05 * interpolatedRadius;
    
    // Advanced smooth polygon calculation
    float polyDist = abs(distanceToCenter - interpolatedRadius);
    float smoothEdge = smoothstep(0.0, smoothness, polyDist);
    
    return 1.0 - smoothEdge;
}

// Dynamic color generation based on polygon properties
vec3 generateDynamicColor() {
    // Use polygon properties to influence color with smoother transitions
    vec3 baseColor = vec3(
        0.5 + 0.5 * sin(u_charge * 3.0),          // Smoother red component
        0.5 + 0.5 * cos(u_symmetryIndex * 2.0),   // Smoother green component
        0.5 + 0.5 * tan(u_reflectivity)           // Blue component
    );
    
    // Normalize and clamp color values
    return clamp(baseColor, 0.0, 1.0);
}

// Light interaction simulation with smooth falloff
float calculateLightInteraction() {
    // Simulate light interaction with smoother transitions
    float lightIntensity = u_reflectivity * (
        0.5 + 0.5 * sin(u_time * 0.5) *           // Smooth time-based pulsing
        abs(cos(u_orientation.x)) *                // Orientation influence
        abs(sin(u_orientation.y))
    );
    
    return clamp(lightIntensity, 0.0, 1.0);
}

void main() {
    // Normalize pixel coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Center of the viewport
    vec2 center = vec2(0.5, 0.5);
    
    // Dynamic polygon parameters
    int sides = 5;  // Pentagon, but can be dynamically adjusted
    float baseRadius = u_volume * 0.2;
    
    // Calculate smooth polygon mask
    float polygonMask = smoothPolygon(uv, center, baseRadius, sides);
    
    // Generate dynamic color
    vec3 dynamicColor = generateDynamicColor();
    
    // Calculate light interaction
    float lightInteraction = calculateLightInteraction();
    
    // Final color with smooth interpolation
    vec3 backgroundColor = vec3(0.1, 0.1, 0.1);
    vec3 finalColor = mix(
        backgroundColor,     // Soft background
        dynamicColor,        // Dynamic polygon color
        polygonMask          // Smooth polygon mask
    );
    
    // Apply light interaction with smooth falloff
    finalColor *= (1.0 - lightInteraction * 0.5);
    
    // Output final fragment color with alpha blending
    gl_FragColor = vec4(finalColor, polygonMask);
}