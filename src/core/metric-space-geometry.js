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

    this.vertices = vertices;
    this.edges = [];
    this.computeConnectivity();
  }

  // Custom distance metric function
  customDistance(v1, v2) {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    const dz = v1.z - v2.z;
    
    // Euclidean base distance
    const euclidean = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    // Weight difference term
    const weightTerm = Math.abs(v1.weight - v2.weight);
    
    // Curvature difference term
    const curvatureTerm = Math.abs(v1.curvature - v2.curvature);
    
    // Composite metric
    return Math.sqrt(
      this.alpha * Math.pow(euclidean, 2) +
      this.beta * Math.pow(curvatureTerm, 2) +
      this.gamma * Math.pow(weightTerm, 2)
    );
  }

  // Compute connectivity based on custom metric
  computeConnectivity() {
    this.edges = [];
    for (let i = 0; i < this.vertices.length; i++) {
      for (let j = i + 1; j < this.vertices.length; j++) {
        if (this.customDistance(this.vertices[i], this.vertices[j]) < this.threshold) {
          this.edges.push([i, j]);
        }
      }
    }
  }

  // Generate Three.js geometries
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

    // Edge geometry
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(this.edges.length * 2 * 3);
    this.edges.forEach((edge, index) => {
      const v1 = this.vertices[edge[0]];
      const v2 = this.vertices[edge[1]];
      linePositions.set([v1.x, v1.y, v1.z, v2.x, v2.y, v2.z], index * 6);
    });
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    return { pointGeometry: geometry, lineGeometry };
  }
}

export { MetricVertex, MetricSpaceGeometry };