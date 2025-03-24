/**
 * Fabric Simulator - Educational Edition
 * UI handling and interaction
 * 
 * This module handles:
 * - UI events and interactions
 * - Connection between UI controls and simulation parameters
 * - Responsive layout and progressive disclosure
 */

// Track UI state
let uiState = {
  panelCollapsed: false,
  advancedMode: false,
  expandedSections: {},
  activeTooltip: null
};

// DOM elements cache
const elements = {};

/**
 * Initialize UI when document is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements
  cacheElements();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize UI components
  initializeUI();
  
  // Set up tooltip system
  initializeTooltips();
  
  // Initialize simulation mode conditional controls
  updateConditionalControls();
});

/**
 * Cache frequently accessed DOM elements
 */
function cacheElements() {
  // Main UI elements
  elements.uiContainer = document.getElementById('uiContainer');
  elements.controlPanel = document.getElementById('controlPanel');
  elements.togglePanelBtn = document.getElementById('togglePanelBtn');
  elements.basicModeBtn = document.getElementById('basicModeBtn');
  elements.advancedModeBtn = document.getElementById('advancedModeBtn');
  
  // Action bar buttons
  elements.playPauseBtn = document.getElementById('playPauseBtn');
  elements.resetBtn = document.getElementById('resetBtn');
  elements.orientationBtn = document.getElementById('orientationBtn');
  
  // Simulation mode elements
  elements.simulationModeButtons = document.querySelectorAll('[data-option="plane"], [data-option="draped"]');
  elements.formModeButtons = document.querySelectorAll('[data-option="sphere"], [data-option="cylinder"]');
  elements.pinningModeButtons = document.querySelectorAll('[data-option="top"], [data-option="corners"]');
  elements.interactionModeButtons = document.querySelectorAll('[data-option="rotate"], [data-option="drag"]');
  
  // Expandable sections
  elements.expandableSections = document.querySelectorAll('.section-header.expandable');
  
  // Parameter controls
  elements.parameterToggles = document.querySelectorAll('.toggle-input');
  elements.sliders = document.querySelectorAll('input[type="range"]');
  
  // Conditional elements
  elements.conditionalControls = document.querySelectorAll('.conditional-control');
  
  // Visualization mode radios
  elements.visualizationRadios = document.querySelectorAll('input[name="visualization"]');
  
  // Educational elements
  elements.infoButtons = document.querySelectorAll('.info-btn');
  elements.educationalModal = document.getElementById('educationalModal');
  elements.modalCloseBtn = document.querySelector('.close-btn');
  elements.modalBody = document.querySelector('.modal-body');
  
  // Tooltip element
  elements.tooltip = document.getElementById('tooltip');
}

/**
 * Set up all event listeners for UI interactions
 */
function setupEventListeners() {
  // Panel toggle
  elements.togglePanelBtn.addEventListener('click', togglePanel);
  
  // We've removed the mode toggle functionality
  
  // Action bar buttons
  elements.playPauseBtn.addEventListener('click', togglePlayPause);
  elements.resetBtn.addEventListener('click', resetSimulation);
  elements.orientationBtn.addEventListener('click', resetView);
  
  // Simulation mode options
  elements.simulationModeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      setActiveButton(elements.simulationModeButtons, e.target);
      setSimulationMode(e.target.dataset.option);
      updateConditionalControls();
    });
  });
  
  // Form mode options
  elements.formModeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      setActiveButton(elements.formModeButtons, e.target);
      setFormMode(e.target.dataset.option);
    });
  });
  
  // Pinning mode options
  elements.pinningModeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      setActiveButton(elements.pinningModeButtons, e.target);
      setPinningMode(e.target.dataset.option);
    });
  });
  
  // Interaction mode options
  elements.interactionModeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      setActiveButton(elements.interactionModeButtons, e.target);
      setInteractionMode(e.target.dataset.option);
      
      // Apply appropriate cursor style for drag mode
      const canvasContainer = document.getElementById('canvasContainer');
      if (e.target.dataset.option === 'drag') {
        canvasContainer.classList.add('drag-cursor');
        canvasContainer.classList.add('drag-highlight');
      } else {
        canvasContainer.classList.remove('drag-cursor');
        canvasContainer.classList.remove('drag-highlight');
        canvasContainer.classList.remove('dragging');
      }
    });
  });
  
  // Expandable sections
  elements.expandableSections.forEach(header => {
    header.addEventListener('click', () => toggleSection(header));
  });
  
  // Parameter toggle switches
  elements.parameterToggles.forEach(toggle => {
    toggle.addEventListener('change', (e) => {
      const paramId = e.target.id.replace('Toggle', '');
      const slider = document.getElementById(`${paramId}Slider`);
      const container = toggle.closest('.param-header').nextElementSibling;
      
      if (e.target.checked) {
        container.setAttribute('data-active', 'true');
        updateParameter(paramId, slider.value, true);
      } else {
        container.setAttribute('data-active', 'false');
        updateParameter(paramId, slider.value, false);
      }
    });
  });
  
  // Parameter sliders
  elements.sliders.forEach(slider => {
    slider.addEventListener('input', (e) => {
      // Update displayed value
      const valueDisplay = slider.closest('.slider-container, .sub-slider')
        .querySelector('.slider-value');
      valueDisplay.textContent = parseFloat(e.target.value).toFixed(2);
      
      // Update parameter
      const paramId = e.target.id.replace('Slider', '');
      const toggle = document.getElementById(`${paramId}Toggle`);
      updateParameter(paramId, e.target.value, toggle ? toggle.checked : true);
    });
  });
  
  // Visualization mode radios
  elements.visualizationRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        setVisualizationMode(e.target.value);
      }
    });
  });
  
  // Educational info buttons
  elements.infoButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering parent click events (like expandable sections)
      showEducationalContent(btn.dataset.tooltip);
    });
  });
  
  // Modal close button
  if (elements.modalCloseBtn) {
    elements.modalCloseBtn.addEventListener('click', () => {
      elements.educationalModal.classList.remove('visible');
    });
  }
  
  // Close modal when clicking outside content
  elements.educationalModal.addEventListener('click', (e) => {
    if (e.target === elements.educationalModal) {
      elements.educationalModal.classList.remove('visible');
    }
  });
  
  // Connect p5.js mouse event handlers
  window.mousePressed = () => {
    handleMousePressed();
    return false; // Prevent default browser behavior
  };
  
  window.mouseDragged = () => {
    handleMouseDragged();
    return false;
  };
  
  window.mouseReleased = () => {
    handleMouseReleased();
    return false;
  };
}

/**
 * Initialize UI to default state
 */
function initializeUI() {
  // Expand main sections by default
  elements.expandableSections.forEach(header => {
    const sectionName = header.querySelector('h3').textContent;
    const content = header.nextElementSibling;
    
    if (sectionName === 'Fabric Properties') {
      // Keep Fabric Properties expanded by default
      header.classList.add('expanded');
      if (content && content.classList.contains('collapsible')) {
        content.classList.remove('collapsed');
        uiState.expandedSections[sectionName] = true;
      }
    } else {
      // Collapse other sections
      if (content && content.classList.contains('collapsible')) {
        content.classList.add('collapsed');
        uiState.expandedSections[sectionName] = false;
      }
    }
  });
}

/**
 * Initialize tooltip system with improved visibility
 */
function initializeTooltips() {
  // Standard tooltips
  document.querySelectorAll('[data-tooltip]').forEach(element => {
    let tooltipTimeout;
    let isHovered = false;
    
    // Show tooltip on mouseover or touch
    element.addEventListener('mouseover', (e) => {
      isHovered = true;
      clearTimeout(tooltipTimeout);
      
      const tooltip = elements.tooltip;
      tooltip.textContent = e.target.dataset.tooltip;
      
      // Create a fixed position for tooltips that's easy to read
      // Position based on which side of the screen the element is on
      const rect = e.target.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Check if element is in the right panel
      if (rect.right > viewportWidth - 350) {
        // Element is in the right control panel, show tooltip to the left
        tooltip.style.left = 'auto';
        tooltip.style.right = `${viewportWidth - rect.left + 10}px`;
      } else {
        // Element is elsewhere, show tooltip to the right
        tooltip.style.right = 'auto';
        tooltip.style.left = `${rect.right + 10}px`;
      }
      
      // Position vertically centered with the element
      tooltip.style.top = `${rect.top + (rect.height / 2) - 15}px`;
      
      // Make tooltip visible with improved animation using the CSS class
      tooltip.classList.add('visible');
      
      uiState.activeTooltip = tooltip;
    });
    
    // Hide tooltip on mouseout with a delay for better UX
    element.addEventListener('mouseout', () => {
      isHovered = false;
      
      // Delay hiding the tooltip so it doesn't disappear immediately
      // if the user accidentally moves out of the element briefly
      tooltipTimeout = setTimeout(() => {
        if (!isHovered) {
          elements.tooltip.classList.remove('visible');
          uiState.activeTooltip = null;
        }
      }, 300); // 300ms delay before hiding
    });
    
    // For touch devices, add a click event to toggle the tooltip
    element.addEventListener('click', (e) => {
      // Prevent the click from triggering other elements
      e.stopPropagation();
      
      if (uiState.activeTooltip && uiState.activeTooltip === elements.tooltip) {
        // Hide the tooltip if it's already visible
        elements.tooltip.style.opacity = 0;
        elements.tooltip.style.visibility = 'hidden';
        uiState.activeTooltip = null;
      } else {
        // Show the tooltip with the same positioning as mouseover
        const tooltip = elements.tooltip;
        tooltip.textContent = e.target.dataset.tooltip;
        
        const rect = e.target.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        if (rect.right > viewportWidth - 350) {
          tooltip.style.left = 'auto';
          tooltip.style.right = `${viewportWidth - rect.left + 10}px`;
        } else {
          tooltip.style.right = 'auto';
          tooltip.style.left = `${rect.right + 10}px`;
        }
        
        tooltip.style.top = `${rect.top + (rect.height / 2) - 15}px`;
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = 1;
        
        uiState.activeTooltip = tooltip;
      }
    });
  });
  
  // Close tooltip when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (uiState.activeTooltip && !e.target.hasAttribute('data-tooltip')) {
      elements.tooltip.classList.remove('visible');
      uiState.activeTooltip = null;
    }
  });
}

/**
 * Toggle panel expanded/collapsed state
 */
function togglePanel() {
  uiState.panelCollapsed = !uiState.panelCollapsed;
  elements.uiContainer.classList.toggle('collapsed', uiState.panelCollapsed);
  
  // Update toggle button icon
  const icon = elements.togglePanelBtn.querySelector('i');
  if (uiState.panelCollapsed) {
    icon.className = 'fas fa-chevron-right';
  } else {
    icon.className = 'fas fa-bars';
  }
}

/**
 * Set UI mode (basic or advanced)
 */
function setUIMode(mode) {
  uiState.advancedMode = (mode === 'advanced');
  
  // Update button states
  elements.basicModeBtn.classList.toggle('active', !uiState.advancedMode);
  elements.advancedModeBtn.classList.toggle('active', uiState.advancedMode);
  
  // Update body class for CSS rules
  document.body.classList.toggle('advanced-mode', uiState.advancedMode);
  document.body.classList.toggle('basic-mode', !uiState.advancedMode);
}

/**
 * Toggle play/pause state
 */
function togglePlayPause() {
  const isPlaying = toggleSimulation();
  
  // Update button text and icon
  const icon = elements.playPauseBtn.querySelector('i');
  const text = elements.playPauseBtn.querySelector('span');
  
  if (isPlaying) {
    icon.className = 'fas fa-pause';
    text.textContent = 'Pause';
  } else {
    icon.className = 'fas fa-play';
    text.textContent = 'Play';
  }
}

/**
 * Reset the simulation
 */
function resetSimulation() {
  resetCloth();
}

/**
 * Reset the camera view
 */
function resetView() {
  resetOrientation();
}

/**
 * Set active button in a group
 */
function setActiveButton(buttonGroup, activeButton) {
  buttonGroup.forEach(btn => {
    btn.classList.remove('active');
  });
  activeButton.classList.add('active');
}

/**
 * Connect mouse event handling for better drag mode feedback
 */
window.mousePressed = function() {
  const canvasContainer = document.getElementById('canvasContainer');
  if (interactionMode === 'drag') {
    canvasContainer.classList.add('dragging');
  }
  handleMousePressed();
  return false; // Prevent default browser behavior
};

window.mouseReleased = function() {
  const canvasContainer = document.getElementById('canvasContainer');
  canvasContainer.classList.remove('dragging');
  handleMouseReleased();
  return false;
};

/**
 * Toggle expandable section
 */
function toggleSection(header) {
  const content = header.nextElementSibling;
  const sectionId = header.closest('.control-section').id || header.textContent;
  
  header.classList.toggle('expanded');
  content.classList.toggle('collapsed');
  
  // Store section state
  uiState.expandedSections[sectionId] = header.classList.contains('expanded');
  
  // Update expand icon
  const expandIcon = header.querySelector('.fa-chevron-down');
  if (expandIcon) {
    expandIcon.style.transform = uiState.expandedSections[sectionId] 
      ? 'rotate(180deg)' 
      : 'rotate(0deg)';
  }
}

/**
 * Update parameter in the simulation
 */
function updateParameter(paramId, value, enabled) {
  // Convert string to appropriate type
  const numericValue = parseFloat(value);
  return setParameter(paramId, numericValue, enabled);
}

/**
 * Set visualization mode with visual enhancements
 */
function setVisualizationMode(mode) {
  // First remove any existing visualization classes
  const canvasContainer = document.getElementById('canvasContainer');
  canvasContainer.classList.remove(
    'visualization-cloth',
    'visualization-stress',
    'visualization-structure'
  );
  
  // Apply the appropriate visualization class
  if (mode === 'cloth' || mode === 'overlaid') {
    canvasContainer.classList.add('visualization-cloth');
  } else if (mode === 'stress') {
    canvasContainer.classList.add('visualization-stress');
  } else if (mode === 'structure') {
    canvasContainer.classList.add('visualization-structure');
  }
  
  // Update the simulation's rendering mode
  window.setVisualizationMode(mode);
}

/**
 * Update conditional controls based on current modes
 */
function updateConditionalControls() {
  elements.conditionalControls.forEach(control => {
    const condition = control.dataset.condition;
    let visible = false;
    
    if (condition === 'plane' && simulationMode === 'plane') {
      visible = true;
    } else if (condition === 'draped' && simulationMode === 'draped') {
      visible = true;
    }
    
    control.classList.toggle('visible', visible);
  });
}

/**
 * Show educational content in modal
 */
function showEducationalContent(content) {
  // Get related parameter if this is from a parameter info button
  let paramInfo = '';
  const parentHeader = event.target.closest('.param-header');
  
  if (parentHeader) {
    const paramName = parentHeader.querySelector('label').textContent;
    paramInfo = getParameterEducationalContent(paramName);
  } else {
    // For section headers
    const sectionHeader = event.target.closest('.section-header');
    if (sectionHeader) {
      const headerText = sectionHeader.querySelector('h3').textContent;
      paramInfo = getSectionEducationalContent(headerText);
    }
  }
  
  // Combine tooltip content with detailed parameter info
  const fullContent = `
    <p>${content}</p>
    ${paramInfo ? `<div class="detail-section">${paramInfo}</div>` : ''}
  `;
  
  elements.modalBody.innerHTML = fullContent;
  elements.educationalModal.classList.add('visible');
}

/**
 * Get detailed educational content about a parameter
 */
function getParameterEducationalContent(paramName) {
  const educationalContent = {
    'Damping': `
      <h4>Understanding Damping in Fabrics</h4>
      <p>Damping controls how quickly movement energy is dissipated in a fabric.</p>
      <ul>
        <li><strong>High damping values (closer to 1.0)</strong>: The fabric will settle quickly with minimal bouncing or oscillation.</li>
        <li><strong>Low damping values (closer to 0.9)</strong>: The fabric will bounce and oscillate longer before settling.</li>
      </ul>
      <p>In real fabrics, damping is affected by fiber type, weave, and finishing treatments:</p>
      <ul>
        <li><strong>Silk</strong> has natural resilience with moderate damping.</li>
        <li><strong>Cotton</strong> typically has higher damping, settling quickly.</li>
        <li><strong>Synthetic fabrics</strong> can vary widely depending on their composition.</li>
      </ul>
    `,
    'Stretch': `
      <h4>Understanding Stretch in Fabrics</h4>
      <p>The stretch parameter controls how much the fabric resists extension.</p>
      <ul>
        <li><strong>Higher values</strong>: Create a stiffer fabric that resists stretching.</li>
        <li><strong>Lower values</strong>: Create a more elastic fabric that stretches easily.</li>
      </ul>
      <p>In fashion design, fabric stretch properties are crucial:</p>
      <ul>
        <li><strong>Woven fabrics</strong> like cotton, linen, and silk typically have minimal stretch.</li>
        <li><strong>Knit fabrics</strong> like jersey have natural stretch due to their loop structure.</li>
        <li><strong>Stretch wovens</strong> incorporate elastane (spandex) for comfort and movement.</li>
      </ul>
      <p>Stretch is usually measured as a percentage of elongation under standard tension.</p>
    `,
    'Shear': `
      <h4>Understanding Shear in Fabrics</h4>
      <p>Shear resistance controls how much the fabric resists diagonal deformation.</p>
      <ul>
        <li><strong>Higher values</strong>: Create fabric that holds its shape when pulled diagonally.</li>
        <li><strong>Lower values</strong>: Allow fabric to deform more easily along diagonal lines.</li>
      </ul>
      <p>In textile terms, shear relates to the fabric's bias properties:</p>
      <ul>
        <li>Fabric cut on the <strong>bias</strong> (45° to grain) has different shear properties.</li>
        <li><strong>Twill weaves</strong> typically have more shear flexibility than plain weaves.</li>
        <li>Fabrics with <strong>loose weaves</strong> allow more shear movement.</li>
      </ul>
      <p>Designers use bias-cut fabrics to create garments that drape elegantly around the body.</p>
    `,
    'Bending': `
      <h4>Understanding Bending in Fabrics</h4>
      <p>Bending stiffness controls how much the fabric resists folding and creasing.</p>
      <ul>
        <li><strong>Higher values</strong>: Create stiffer fabric that tends to hold a shape.</li>
        <li><strong>Lower values</strong>: Create softer fabric that folds and drapes easily.</li>
      </ul>
      <p>In textiles, bending properties are measured as:</p>
      <ul>
        <li><strong>Drape coefficient</strong>: The ratio of draped to undraped area of fabric.</li>
        <li><strong>Flexural rigidity</strong>: The fabric's resistance to bending under its own weight.</li>
      </ul>
      <p>Examples from fashion:</p>
      <ul>
        <li><strong>Chiffon</strong> has very low bending resistance, creating soft flowing effects.</li>
        <li><strong>Organza</strong> has higher bending resistance, holding structured shapes.</li>
        <li><strong>Denim</strong> has high bending resistance, creating defined folds and shapes.</li>
      </ul>
    `,
    'Weight': `
      <h4>Understanding Weight in Fabrics</h4>
      <p>Weight determines how heavily gravity affects the fabric.</p>
      <ul>
        <li><strong>Higher values</strong>: Simulate heavier fabrics with more pronounced draping.</li>
        <li><strong>Lower values</strong>: Simulate lighter fabrics that hang less dramatically.</li>
      </ul>
      <p>In textile manufacturing, fabric weight is measured in:</p>
      <ul>
        <li><strong>GSM</strong> (grams per square meter) - the standard international measure.</li>
        <li><strong>oz/yd²</strong> (ounces per square yard) - common in the US and UK.</li>
      </ul>
      <p>Example fabric weights:</p>
      <ul>
        <li><strong>Lightweight</strong> (50-150 GSM): Chiffon, georgette, light silk.</li>
        <li><strong>Medium weight</strong> (150-300 GSM): Cotton shirting, linen, medium wool.</li>
        <li><strong>Heavyweight</strong> (300+ GSM): Denim, canvas, heavy wool coating.</li>
      </ul>
    `,
    'Gravity': `
      <h4>Understanding Gravity in Fabric Simulation</h4>
      <p>The gravity parameter controls the strength of downward acceleration on the fabric.</p>
      <ul>
        <li><strong>Higher values</strong>: Create stronger gravitational pull, causing faster falling.</li>
        <li><strong>Lower values</strong>: Create weaker gravity effects, simulating environments like lunar gravity.</li>
        <li><strong>Zero value</strong>: Removes gravity entirely, useful for space simulations or abstract designs.</li>
      </ul>
      <p>While real-world gravity is constant, changing this parameter allows designers to explore how fabrics might behave in different environments or to create artistic effects.</p>
    `,
    'Wind': `
      <h4>Understanding Wind Effects on Fabric</h4>
      <p>Wind parameters control external forces pushing on the fabric from different directions.</p>
      <ul>
        <li><strong>X-axis wind</strong>: Horizontal force from side to side.</li>
        <li><strong>Y-axis wind</strong>: Vertical force (up and down).</li>
        <li><strong>Z-axis wind</strong>: Depth force (front to back).</li>
        <li><strong>Wind Strength</strong>: Overall multiplier for wind effects.</li>
      </ul>
      <p>In fashion design, understanding wind behavior helps with:</p>
      <ul>
        <li>Designing garments for outdoor conditions</li>
        <li>Creating dramatic effects for runway shows</li>
        <li>Predicting how lightweight fabrics will perform in movement</li>
      </ul>
      <p>Fabrics with different weights and stiffness respond uniquely to wind forces.</p>
    `
  };
  
  return educationalContent[paramName] || '';
}

/**
 * Get educational content for section headers
 */
function getSectionEducationalContent(sectionName) {
  const sectionContent = {
    'Simulation Mode': `
      <h4>Simulation Modes Explained</h4>
      <p><strong>Plane mode</strong> creates a square of fabric suspended from pinning points. This is useful for studying:</p>
      <ul>
        <li>How fabric hangs under its own weight</li>
        <li>The effects of different pinning arrangements</li>
        <li>Basic fabric properties in isolation</li>
      </ul>
      <p><strong>Draped mode</strong> places fabric over a 3D form. This helps understand:</p>
      <ul>
        <li>How fabric conforms to body shapes</li>
        <li>Draping techniques used in fashion design</li>
        <li>Interaction between fabric properties and underlying forms</li>
      </ul>
      <p>Fashion designers use draping techniques directly on mannequins to create patterns and understand how fabrics will behave in finished garments.</p>
    `,
    'Interaction': `
      <h4>Interactive Controls for Fabric Exploration</h4>
      <p>These controls let you change how you interact with the fabric simulation:</p>
      <ul>
        <li><strong>Rotate</strong>: Move around the 3D space to view the fabric from different angles, helping you see all aspects of drape and behavior.</li>
        <li><strong>Drag</strong>: Directly manipulate points on the fabric to create different shapes and test how the fabric responds to force. This simulates how fabric might be manipulated during fitting or draping.</li>
      </ul>
      <p>In fashion design studios, designers physically manipulate fabrics in similar ways to understand their properties before cutting and sewing.</p>
    `,
    'Pinning': `
      <h4>Fabric Pinning Methods</h4>
      <p>Different pinning arrangements create different fabric behaviors:</p>
      <ul>
        <li><strong>Top Edge</strong>: Pins the entire top edge of the fabric, similar to hanging fabric from a rod or curtain. This creates even draping with folds running vertically.</li>
        <li><strong>Corners</strong>: Pins only the four corners, allowing more complex folding patterns to emerge. This creates diagonal tension lines and more natural-looking drape.</li>
      </ul>
      <p>In fashion design, different pinning methods are used to achieve various effects:</p>
      <ul>
        <li>Single-point pinning for cowl necklines</li>
        <li>Multi-point pinning for structured shapes</li>
        <li>Edge pinning for gathered effects</li>
      </ul>
    `,
    'Fabric Properties': `
      <h4>Physical Properties of Fabric</h4>
      <p>These parameters control how the fabric behaves physically:</p>
      <ul>
        <li><strong>Damping</strong>: How quickly movement energy dissipates (bouncy vs. still)</li>
        <li><strong>Stretch</strong>: How much the fabric extends under tension</li>
        <li><strong>Shear</strong>: How much the fabric resists diagonal deformation</li>
        <li><strong>Bending</strong>: How stiffly the fabric resists folding</li>
        <li><strong>Weight</strong>: How heavily the fabric is affected by gravity</li>
      </ul>
      <p>These properties combine to create the distinctive behavior of different fabric types:</p>
      <ul>
        <li><strong>Silk</strong>: Low bending resistance, medium stretch, low weight</li>
        <li><strong>Denim</strong>: High bending resistance, low stretch, high weight</li>
        <li><strong>Jersey</strong>: Medium bending, high stretch, medium weight</li>
      </ul>
      <p>Fashion designers must understand these properties to select appropriate fabrics for different garment designs.</p>
    `,
    'Forces': `
      <h4>External Forces Affecting Fabric</h4>
      <p>These controls simulate environmental forces acting on the fabric:</p>
      <ul>
        <li><strong>Gravity</strong>: Downward acceleration (Earth normal = 9.8 m/s²)</li>
        <li><strong>Wind</strong>: Air movement that pushes on the fabric</li>
      </ul>
      <p>In fashion contexts, understanding how fabric responds to forces helps with:</p>
      <ul>
        <li>Designing garments that move well with the body</li>
        <li>Predicting how designs will behave in different environments</li>
        <li>Creating special effects for fashion shows or photoshoots</li>
      </ul>
      <p>Movement is a critical aspect of fashion design - garments are not static but worn on moving bodies in changing environments.</p>
    `,
    'Visualization': `
      <h4>Visualization Methods for Fabric Analysis</h4>
      <p>Different visualization modes help understand different aspects of fabric behavior:</p>
      <ul>
        <li><strong>Normal</strong>: Shows the internal structure with points and lines</li>
        <li><strong>Cloth</strong>: Shows the fabric as a solid surface</li>
        <li><strong>Overlaid</strong>: Combines solid surface with structural elements</li>
        <li><strong>Stress</strong>: Heat map showing areas of tension (red) and compression (blue)</li>
        <li><strong>Structure</strong>: Color-coded constraint types (green=structural, yellow=shear, blue=bending)</li>
      </ul>
      <p>In textile engineering and fashion design, similar visualizations help with:</p>
      <ul>
        <li>Identifying stress points in garment designs</li>
        <li>Predicting where fabrics might fail or deform</li>
        <li>Understanding the internal forces in draped fabrics</li>
      </ul>
      <p>These technical views provide insights that aren't visible when looking at fabric normally.</p>
    `
  };
  
  return sectionContent[sectionName] || '';
}
