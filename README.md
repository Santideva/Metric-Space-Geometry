Overview

Metric Space Visualization is an experimental project that reimagines geometry as a dynamic, interactive metric space. Instead of static meshes, vertices are treated as elements of a continuously evolving space—where custom metrics, shader-driven transformations, and non-Euclidean concepts come together to create stunning, organic visuals.

By leveraging three.js, custom shader materials, and an interactive GUI (dat.GUI), this project showcases how mathematics and art merge in the digital domain. The project invites exploration into unusual geometries, dynamic transformations, and planned future sculpting functionalities.

Features
Custom Metric Spaces:

Define vertex connectivity via custom distance functions incorporating weight, curvature, and non-Euclidean metrics.

Generate diverse geometries by altering metric parameters.

Shader-Driven Transformations:

Dynamic vertex transformations using noise displacement, Chladni patterns, and Möbius transformations.

Custom ShaderMaterials for both points and lines.

Real-time GPU processing for smooth, time-based animations.

Interactive GUI:

Adjust metric, visualization, and shader parameters on the fly using dat.GUI.

Single source of truth with a centralized StateStore.

Modular Curve Generation (Planned):

A plug-and-play architecture to switch between different interpolation methods (e.g., quadratic, cubic, Catmull–Rom, and more unusual curve-pairs).

Future Enhancements:

Interactive Sculpting:

Subtractive sculpting using raycasting to select and softly delete vertices (and their associated curves).

Exploration of additive, multiplicative, and divisive sculpting approaches.

Texture Mapping & Physical Properties:

Integrate procedural textures using generated UV coordinates.

Extend vertices with physical properties (mass, density, volume) to drive further transformations.

Concepts Explained
Metric Spaces and Non-Euclidean Geometry
A metric space is a set equipped with a distance function (metric) that defines how far apart any two points are. Unlike our familiar Euclidean geometry, where distance is defined by the straight-line (or "as-the-crow-flies") distance, a metric space can use any function to measure separation. This flexibility allows for the exploration of non-Euclidean geometries—spaces that bend, twist, or warp in ways that challenge our everyday intuition.

Chladni Patterns
Named after Ernst Chladni—who first visualized these patterns by sprinkling sand on vibrating plates—Chladni patterns reveal intricate, symmetric designs as the sand collects along nodal lines (regions of minimal movement). In this project, Chladni-inspired transformations add an organic, rhythmic quality to the geometry.

Möbius Transformations
Möbius transformations are functions from the complex plane to itself that preserve angles while warping distances. They are closely related to the famous Möbius strip—a surface with only one side—and introduce surprising twists and non-linear deformations into the geometry. Their inclusion creates dynamic, non-Euclidean effects that enhance the overall aesthetic.

Shaders
Shaders are small programs that run on the GPU and control the rendering process. They enable real-time transformations, texturing, and lighting effects. In this project, custom vertex and fragment shaders animate the geometry, applying time-driven effects (noise, Chladni, Möbius) and allowing for high levels of creative control.

Installation
Clone the Repository:

bash
Copy
Edit
git clone https://github.com/yourusername/metric-space-visualization.git
cd metric-space-visualization
Install Dependencies:

bash
Copy
Edit
npm install
Start the Development Server:

bash
Copy
Edit
npm start
This will launch the project on a local server with live reloading enabled.

Usage
Adjust Parameters:
Use the integrated dat.GUI interface to modify metric, visualization, and shader parameters in real time.

Explore the Visuals:
Watch the dynamic evolution of the geometry as it responds to time-based shader transformations.

Planned Enhancements:
In future releases, you will be able to interactively sculpt the geometry by deleting, adding, or transforming individual vertices and curves.

Screenshots & Demos
Below are a couple of screen capture videos that demonstrate key aspects of the project:

Video 1: Metric Space Evolution
Placed after the "Metric Spaces and Non-Euclidean Geometry" section in presentations.

Video 2: Shader-Driven Transformations
Placed after the "Shaders" section in presentations.

You can also view interactive demos on Behance and our project page.

Future Directions
Sculpting Functionalities:
Explore interactive subtractive sculpting using raycasting and shader-based soft deletion, as well as additive, multiplicative, and divisive methods for modifying geometry.

Texture Mapping:
Enhance the visual detail by integrating procedural and displacement textures using generated UV coordinates.

Physical Properties:
Extend the model to include vertex-based physical properties (mass, density, volume) and even integrate a physics simulation to further drive the visual evolution.

Contributing
Contributions, ideas, and suggestions are welcome! Please open issues or pull requests on GitHub to help evolve this project further.

License
This project is licensed under the MIT License.
