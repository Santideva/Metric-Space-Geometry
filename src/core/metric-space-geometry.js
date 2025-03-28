class MetricVertex {
  constructor(x, y, z, weight = 1.0, curvature = 0.0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.weight = weight;
    this.curvature = curvature;
  }
}

class MetricSpaceGeometry {
  constructor(vertices, params = {}) {
    // Metric parameters with defaults
    this.alpha = params.alpha || 1.0;
    this.beta = params.beta || 0.5;
    this.gamma = params.gamma || 0.2;
    this.threshold = params.threshold || 5.0;
    
    // New parameters for curve generation
    this.minCurvatureRadius = params.minCurvatureRadius || 0.5;
    this.maxCurvatureRadius = params.maxCurvatureRadius || 2.0;
    this.complexityFactor = params.complexityFactor || 1.0;

    this.vertices = vertices;
    this.edges = [];
    this.edgeTypes = []; // Will store connection type for each edge
    this.computeConnectivity();
  }

  // Enhanced custom distance metric function
  customDistance(v1, v2) {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    const dz = v1.z - v2.z;
    
    // Euclidean base distance
    const euclidean = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    // Weight difference term (normalized)
    const weightTerm = Math.abs(v1.weight - v2.weight) / Math.max(v1.weight, v2.weight);
    
    // Curvature difference term
    const curvatureTerm = Math.abs(v1.curvature - v2.curvature);
    
    // Composite metric with additional complexity
    return Math.sqrt(
      this.alpha * Math.pow(euclidean, 2) +
      this.beta * Math.pow(curvatureTerm, 2) +
      this.gamma * Math.pow(weightTerm, 2)
    );
  }

  // Generate curve points for different connection types
  generateCurvePoints(v1, v2, type, numPoints = 20) {
    const points = [];
    
    // Quadratic interpolation for close vertices
    if (type === 'quadratic') {
      const midpoint = {
        x: (v1.x + v2.x) / 2,
        y: (v1.y + v2.y) / 2,
        z: (v1.z + v2.z) / 2
      };
      
      // Add slight elevation based on curvature
      const elevationFactor = Math.min(
        this.minCurvatureRadius + 
        Math.abs(v1.curvature + v2.curvature) * this.complexityFactor, 
        this.maxCurvatureRadius
      );
      
      midpoint.y += elevationFactor * Math.sin(v1.curvature * v2.curvature);
      
      for (let t = 0; t <= 1; t += 1/(numPoints-1)) {
        const x = (1-t)*v1.x + t*v2.x;
        const y = (1-t)*v1.y + t*v2.y + 
                  elevationFactor * 4 * t * (1-t);
        const z = (1-t)*v1.z + t*v2.z;
        points.push({x, y, z});
      }
    } 
    // Mobius-like transformation for distant vertices
    else if (type === 'mobius') {
      const distance = this.customDistance(v1, v2);
      const mobiusFactor = Math.min(distance / this.threshold, 2.0);
      
      for (let t = 0; t <= 1; t += 1/(numPoints-1)) {
        // Complex mapping that warps the connection
        const warpX = Math.sin(t * Math.PI * mobiusFactor);
        const warpY = Math.cos(t * Math.PI * mobiusFactor);
        
        const x = (1-t)*v1.x + t*v2.x + warpX * this.complexityFactor;
        const y = (1-t)*v1.y + t*v2.y + warpY * this.complexityFactor;
        const z = (1-t)*v1.z + t*v2.z;
        
        points.push({x, y, z});
      }
    }
    
    return points;
  }

  // Compute connectivity based on custom metric
  computeConnectivity() {
    this.edges = [];
    this.edgeTypes = [];
    
    for (let i = 0; i < this.vertices.length; i++) {
      for (let j = i + 1; j < this.vertices.length; j++) {
        const distance = this.customDistance(this.vertices[i], this.vertices[j]);
        
        if (distance < this.threshold) {
          // Quadratic interpolation for closer vertices
          if (distance < this.threshold / 2) {
            this.edges.push([i, j]);
            this.edgeTypes.push('quadratic');
          } 
          // Mobius-like transformation for intermediate distances
          else {
            this.edges.push([i, j]);
            this.edgeTypes.push('mobius');
          }
        }
      }
    }
  }

  // Generate Three.js geometries with curved connections
  createGeometries(THREE) {
    // Vertex positions geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.vertices.length * 3);
    this.vertices.forEach((v, i) => {
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Curved edge geometry
    const lineGeometry = new THREE.BufferGeometry();
    const curvedPositions = [];

    this.edges.forEach((edge, index) => {
      const v1 = this.vertices[edge[0]];
      const v2 = this.vertices[edge[1]];
      const type = this.edgeTypes[index];
      
      // Generate curve points
      const curvePoints = this.generateCurvePoints(v1, v2, type);
      
      // Flatten curve points into single array for geometry
      curvePoints.forEach(point => {
        curvedPositions.push(point.x, point.y, point.z);
      });
    });

    const linePositions = new Float32Array(curvedPositions);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    return { 
      pointGeometry: geometry, 
      lineGeometry: lineGeometry,
      edgeTypes: this.edgeTypes 
    };
  }
}

export { MetricVertex, MetricSpaceGeometry };