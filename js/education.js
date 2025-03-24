/**
 * Fabric Simulator - Educational Edition
 * Educational content and features
 * 
 * This module provides:
 * - Educational tooltips and explanations
 * - Fabric type presets
 * - Interactive guides and tutorials
 */

// Fabric type presets for educational demonstrations
const fabricPresets = {
  // Common fabric types with their physical properties
  cotton: {
    name: "Cotton",
    description: "Medium-weight natural fiber with moderate drape and minimal stretch.",
    properties: {
      damping: 0.98,     // Settles quickly
      stretch: 1.1,      // Slightly resistant to stretching
      shear: 1.0,        // Standard diagonal resistance
      bending: 1.05,     // Moderate resistance to folding
      weight: 1.0,       // Medium weight
      gravity: 0.4       // Standard gravity effect
    }
  },
  silk: {
    name: "Silk",
    description: "Light, smooth natural fiber with excellent drape and fluid movement.",
    properties: {
      damping: 0.96,     // Smooth movement with some flow
      stretch: 1.0,      // Standard stretch resistance
      shear: 0.9,        // Easier diagonal movement for better drape
      bending: 0.85,     // Low bending resistance for fluid draping
      weight: 0.7,       // Lighter weight
      gravity: 0.4       // Standard gravity effect
    }
  },
  denim: {
    name: "Denim",
    description: "Heavy, sturdy cotton twill with minimal drape and structured folds.",
    properties: {
      damping: 0.99,     // Little oscillation
      stretch: 1.15,     // High resistance to stretching
      shear: 1.1,        // Rigid in diagonal directions
      bending: 1.15,     // Stiff with defined folds
      weight: 1.6,       // Heavy
      gravity: 0.4       // Standard gravity effect
    }
  },
  jersey: {
    name: "Jersey Knit",
    description: "Stretchy, comfortable knit fabric with moderate drape and recovery.",
    properties: {
      damping: 0.97,     // Good recovery
      stretch: 0.85,     // High stretchability
      shear: 0.9,        // Flexible in diagonal directions
      bending: 0.95,     // Moderate fold resistance
      weight: 0.9,       // Medium-light weight
      gravity: 0.4       // Standard gravity effect
    }
  },
  chiffon: {
    name: "Chiffon",
    description: "Very lightweight, sheer fabric with excellent drape and movement.",
    properties: {
      damping: 0.95,     // Flowy with continued movement
      stretch: 1.0,      // Standard stretch
      shear: 0.85,       // Easy diagonal deformation for fluid drape
      bending: 0.8,      // Very low bending resistance
      weight: 0.5,       // Very light
      gravity: 0.4       // Standard gravity effect
    }
  },
  canvas: {
    name: "Canvas",
    description: "Very heavy, sturdy fabric with minimal drape and high structure.",
    properties: {
      damping: 0.99,     // Minimal movement
      stretch: 1.2,      // Very resistant to stretching
      shear: 1.15,       // Very rigid diagonally
      bending: 1.2,      // Very stiff
      weight: 1.8,       // Very heavy
      gravity: 0.4       // Standard gravity effect
    }
  }
};

// Educational modal templates
const educationalTemplates = {
  welcome: `
    <h3>Welcome to the Fabric Simulator</h3>
    <p>This educational tool helps you understand how different fabrics behave based on their physical properties.</p>
    
    <h4>Key Features:</h4>
    <ul>
      <li><strong>Interactive Simulation:</strong> Manipulate fabric in 3D space to see how it behaves</li>
      <li><strong>Physical Properties:</strong> Adjust parameters like stretch, bending, and weight</li>
      <li><strong>Visualization Modes:</strong> View the fabric in different ways to understand its structure</li>
      <li><strong>Progressive Learning:</strong> Start with basic controls and advance to expert features</li>
    </ul>
    
    <h4>Tips for Getting Started:</h4>
    <ul>
      <li>Use <strong>Rotate</strong> mode to view the fabric from different angles</li>
      <li>Switch to <strong>Drag</strong> mode to pull on points of the fabric</li>
      <li>Try the <strong>Plane</strong> and <strong>Draped</strong> simulation modes to see different behaviors</li>
      <li>Click the <i class="fas fa-info-circle"></i> icons for detailed explanations</li>
    </ul>
    
    <p>Click anywhere outside this window to begin exploring!</p>
  `,
  
  fabricTypes: `
    <h3>Understanding Fabric Types</h3>
    <p>Different fabrics have unique physical properties that affect how they drape, fold, and move.</p>
    
    <div class="fabric-grid">
      <div class="fabric-card">
        <h4>Cotton</h4>
        <p>Medium-weight natural fiber with moderate drape and minimal stretch.</p>
        <ul>
          <li>Medium weight</li>
          <li>Moderate bending resistance</li>
          <li>Minimal stretch</li>
        </ul>
      </div>
      
      <div class="fabric-card">
        <h4>Silk</h4>
        <p>Light, smooth natural fiber with excellent drape and fluid movement.</p>
        <ul>
          <li>Light weight</li>
          <li>Low bending resistance</li>
          <li>Fluid drape</li>
        </ul>
      </div>
      
      <div class="fabric-card">
        <h4>Denim</h4>
        <p>Heavy, sturdy cotton twill with minimal drape and structured folds.</p>
        <ul>
          <li>Heavy weight</li>
          <li>High bending resistance</li>
          <li>Structured folds</li>
        </ul>
      </div>
      
      <div class="fabric-card">
        <h4>Jersey Knit</h4>
        <p>Stretchy, comfortable knit fabric with moderate drape and recovery.</p>
        <ul>
          <li>Medium weight</li>
          <li>High stretch</li>
          <li>Good recovery</li>
        </ul>
      </div>
    </div>
    
    <p>In fashion design, understanding these properties is essential for selecting the right fabric for a garment.</p>
  `,
  
  physicsExplanation: `
    <h3>The Physics of Fabric</h3>
    <p>Fabric simulation uses a mass-spring system with physical constraints to create realistic behavior.</p>
    
    <h4>Key Physical Components:</h4>
    <ul>
      <li><strong>Points (Particles):</strong> Represent intersections in the fabric mesh</li>
      <li><strong>Constraints:</strong> Connections between points that maintain structure</li>
      <li><strong>Forces:</strong> External influences like gravity and wind</li>
    </ul>
    
    <h4>Types of Constraints:</h4>
    <ul>
      <li><strong>Structural (Green):</strong> Maintain the basic grid structure and prevent stretching</li>
      <li><strong>Shear (Yellow):</strong> Resist diagonal deformation</li>
      <li><strong>Bending (Blue):</strong> Resist folding between non-adjacent points</li>
    </ul>
    
    <p>Try using the <strong>Structure</strong> visualization mode to see these different constraint types in action.</p>
    
    <div class="note">
      <p>Real fabrics have much more complex structures with thousands of fibers, but this simplified model effectively demonstrates the key physical behaviors.</p>
    </div>
  `
};

/**
 * Initialize educational features
 * Set up event listeners and prepare educational content
 */
document.addEventListener('DOMContentLoaded', () => {
  // Add fabric preset selector if/when we implement it
  // setupFabricPresets();
  
  // Show welcome modal for first-time users (can be enhanced with localStorage)
  // setTimeout(showWelcomeModal, 1000);
});

/**
 * Show welcome modal for first-time users
 */
function showWelcomeModal() {
  const modal = document.getElementById('educationalModal');
  const modalBody = modal.querySelector('.modal-body');
  const modalHeader = modal.querySelector('.modal-header h3');
  
  modalHeader.textContent = 'Welcome to the Fabric Simulator';
  modalBody.innerHTML = educationalTemplates.welcome;
  
  modal.classList.add('visible');
}

/**
 * Apply fabric preset to simulation
 * @param {string} fabricType - Key name of the fabric in fabricPresets
 */
function applyFabricPreset(fabricType) {
  if (!fabricPresets[fabricType]) {
    console.error(`Fabric preset not found: ${fabricType}`);
    return;
  }
  
  const preset = fabricPresets[fabricType];
  const props = preset.properties;
  
  // Apply each property
  for (const [param, value] of Object.entries(props)) {
    // Set UI toggle to ON
    const toggle = document.getElementById(`${param}Toggle`);
    if (toggle) {
      toggle.checked = true;
      
      // Update slider value
      const slider = document.getElementById(`${param}Slider`);
      if (slider) {
        slider.value = value;
        
        // Update displayed value
        const valueDisplay = slider.closest('.slider-container, .sub-slider')
          .querySelector('.slider-value');
        if (valueDisplay) {
          valueDisplay.textContent = value.toFixed(2);
        }
        
        // Show slider container
        const container = toggle.closest('.param-header').nextElementSibling;
        if (container) {
          container.setAttribute('data-active', 'true');
        }
      }
    }
    
    // Update simulation parameter
    updateParameter(param, value, true);
  }
  
  // Show notification
  showNotification(`Applied ${preset.name} fabric preset`);
}

/**
 * Show temporary notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, duration = 3000) {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
    
    // Style it
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'rgba(30, 30, 30, 0.9)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    notification.style.transition = 'opacity 0.3s';
    notification.style.opacity = '0';
  }
  
  // Set message and show
  notification.textContent = message;
  notification.style.opacity = '1';
  
  // Hide after duration
  setTimeout(() => {
    notification.style.opacity = '0';
  }, duration);
}

/**
 * Show guided tour tooltip at a specific element
 * @param {HTMLElement} element - Target element for the tooltip
 * @param {string} message - Message to display
 * @param {function} onNext - Callback for when user clicks "Next"
 */
function showGuidedTourStep(element, message, onNext) {
  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'guided-tour-tooltip';
  document.body.appendChild(tooltip);
  
  // Position tooltip near element
  const rect = element.getBoundingClientRect();
  tooltip.style.position = 'absolute';
  tooltip.style.left = `${rect.left}px`;
  tooltip.style.top = `${rect.bottom + 10}px`;
  tooltip.style.zIndex = '1000';
  tooltip.style.backgroundColor = 'rgba(30, 30, 30, 0.9)';
  tooltip.style.color = 'white';
  tooltip.style.padding = '15px';
  tooltip.style.borderRadius = '5px';
  tooltip.style.maxWidth = '300px';
  
  // Add content
  tooltip.innerHTML = `
    <p>${message}</p>
    <div style="text-align: right; margin-top: 10px;">
      <button class="tour-next-btn">Next</button>
    </div>
  `;
  
  // Style button
  const button = tooltip.querySelector('.tour-next-btn');
  button.style.backgroundColor = '#1e90ff';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.padding = '5px 15px';
  button.style.borderRadius = '3px';
  button.style.cursor = 'pointer';
  
  // Add next button event
  button.addEventListener('click', () => {
    tooltip.remove();
    if (onNext) onNext();
  });
  
  // Highlight target element
  const originalOutline = element.style.outline;
  const originalZIndex = element.style.zIndex;
  element.style.outline = '2px solid #1e90ff';
  element.style.zIndex = '999';
  
  // Clean up on next
  return function cleanup() {
    tooltip.remove();
    element.style.outline = originalOutline;
    element.style.zIndex = originalZIndex;
  };
}

/**
 * Start a guided tour of the application
 */
function startGuidedTour() {
  const steps = [
    {
      elementId: 'basicModeBtn',
      message: 'Start in Basic Mode to learn the fundamental controls.'
    },
    {
      elementId: 'simulationModeButtons',
      message: 'Choose between Plane mode (suspended fabric) and Draped mode (fabric over an object).'
    },
    {
      elementId: 'dampingToggle',
      message: 'Try toggling parameters ON to see how they affect the fabric behavior.'
    },
    {
      elementId: 'playPauseBtn',
      message: 'Use this button to pause the simulation if you want to examine a specific moment.'
    }
  ];
  
  let currentStep = 0;
  
  function showNextStep() {
    if (currentStep >= steps.length) {
      showNotification('Tour complete! Explore on your own now.');
      return;
    }
    
    const step = steps[currentStep];
    const element = document.getElementById(step.elementId);
    
    if (element) {
      showGuidedTourStep(element, step.message, () => {
        currentStep++;
        showNextStep();
      });
    } else {
      // Skip missing elements
      currentStep++;
      showNextStep();
    }
  }
  
  // Start the tour
  showNextStep();
}

// Export functions for external use
window.educationTools = {
  showWelcomeModal,
  applyFabricPreset, 
  showPhysicsExplanation: () => {
    const modal = document.getElementById('educationalModal');
    const modalBody = modal.querySelector('.modal-body');
    const modalHeader = modal.querySelector('.modal-header h3');
    
    modalHeader.textContent = 'The Physics of Fabric';
    modalBody.innerHTML = educationalTemplates.physicsExplanation;
    
    modal.classList.add('visible');
  },
  startGuidedTour
};

// Apply custom styles for educational components
const style = document.createElement('style');
style.textContent = `
  .fabric-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin: 20px 0;
  }
  
  .fabric-card {
    background-color: #2a2a2a;
    border-radius: 8px;
    padding: 15px;
  }
  
  .fabric-card h4 {
    margin-top: 0;
    color: #1e90ff;
  }
  
  .fabric-card ul {
    padding-left: 20px;
    margin-bottom: 0;
  }
  
  .detail-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #333;
  }
  
  .note {
    background-color: #2a2a2a;
    padding: 10px 15px;
    border-left: 3px solid #1e90ff;
    margin: 15px 0;
  }
`;

document.head.appendChild(style);
