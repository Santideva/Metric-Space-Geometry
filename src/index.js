import MetricSpaceVisualization from './visualization';

// Ensure the DOM is fully loaded before initializing
window.addEventListener('load', () => {
    const container = document.getElementById('visualization-container');
    
    // Check if container exists
    if (!container) {
        console.error('Visualization container not found');
        return;
    }

    // Create visualization
    const visualization = new MetricSpaceVisualization(container);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        visualization.dispose();
    });
});