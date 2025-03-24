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
  
  // Add a media query check for mobile devices - initialize collapsed panel on mobile
  handleResponsiveLayout();
  window.addEventListener('resize', handleResponsiveLayout);
});

/**
 * Handle responsive layout changes
 */
function handleResponsiveLayout() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  if (isMobile) {
    // On mobile, make sure we start with the panel collapsed
    if (!uiState.panelCollapsed) {
      togglePanel();
    }
    // Additionally, add an overlay click handler to close panel
    document.getElementById('canvasContainer').addEventListener('click', () => {
      if (!uiState.panelCollapsed) {
        togglePanel();
      }
    });
  } else {
    // On desktop, make sure panel is visible
    if (uiState.panelCollapsed) {
      togglePanel();
    }
  }
  
  // Ensure proper appearance based on device
  document.body.classList.toggle('mobile-device', isMobile);
}

/**
 * Cache frequently accessed DOM elements
 */
function cacheElements() {
  try {
    // Main UI elements
    elements.uiContainer = document.getElementById('uiContainer');
    elements.controlPanel = document.getElementById('controlPanel');
    elements.togglePanelBtn = document.getElementById('togglePanelBtn');
    
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
    
    console.log('UI elements successfully cached');
  } catch (error) {
    console.error('Error caching elements:', error);
  }
}

/**
 * Set up all event listeners for UI interactions
 */
function setupEventListeners() {
  try {
    // Panel toggle - Make sure this binding works
    if (elements.togglePanelBtn) {
      elements.togglePanelBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        togglePanel();
      });
      console.log('Toggle panel button listener attached');
    } else {
      console.error('Toggle panel button not found');
    }
    
    // Action bar buttons
    if (elements.playPauseBtn) {
      elements.playPauseBtn.addEventListener('click', togglePlayPause);
    }
    if (elements.resetBtn) {
      elements.resetBtn.addEventListener('click', resetSimulation);
    }
    if (elements.orientationBtn) {
      elements.orientationBtn.addEventListener('click', resetView);
    }
    
    // Simulation mode options
    elements.simulationModeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        setActiveButton(elements.simulationModeButtons, e.target);
        if (typeof setSimulationMode === 'function') {
          setSimulationMode(e.target.dataset.option);
        } else {
          console.error('setSimulationMode function not available');
        }
        updateConditionalControls();
      });
    });
    
    // Form mode options
    elements.formModeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        setActiveButton(elements.formModeButtons, e.target);
        if (typeof setFormMode === 'function') {
          setFormMode(e.target.dataset.option);
        } else {
          console.error('setFormMode function not available');
        }
      });
    });
    
    // Pinning mode options
    elements.pinningModeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        setActiveButton(elements.pinningModeButtons, e.target);
        if (typeof setPinningMode === 'function') {
          setPinningMode(e.target.dataset.option);
        } else {
          console.error('setPinningMode function not available');
        }
      });
    });
    
    // Interaction mode options
    elements.interactionModeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        setActiveButton(elements.interactionModeButtons, e.target);
        if (typeof setInteractionMode === 'function') {
          setInteractionMode(e.target.dataset.option);
        } else {
          console.error('setInteractionMode function not available');
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
          if (typeof updateParameter === 'function') {
            updateParameter(paramId, slider.value, true);
          } else {
            console.error('updateParameter function not available');
          }
        } else {
          container.setAttribute('data-active', 'false');
          if (typeof updateParameter === 'function') {
            updateParameter(paramId, slider.value, false);
          } else {
            console.error('updateParameter function not available');
          }
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
        if (typeof updateParameter === 'function') {
          updateParameter(paramId, e.target.value, toggle ? toggle.checked : true);
        } else {
          console.error('updateParameter function not available');
        }
      });
    });
    
    // Visualization mode radios
    elements.visualizationRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          if (typeof setVisualizationMode === 'function') {
            setVisualizationMode(e.target.value);
          } else {
            console.error('setVisualizationMode function not available');
          }
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
    if (elements.educationalModal) {
      elements.educationalModal.addEventListener('click', (e) => {
        if (e.target === elements.educationalModal) {
          elements.educationalModal.classList.remove('visible');
        }
      });
    }
    
    console.log('Event listeners setup completed');
  } catch (error) {
    console.error('Error setting up event listeners:', error);
  }
}

/**
 * Initialize UI to default state
 */
function initializeUI() {
  try {
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
    
    console.log('UI initialized successfully');
  } catch (error) {
    console.error('Error initializing UI:', error);
  }
}

/**
 * Initialize tooltip system
 */
function initializeTooltips() {
  // Standard tooltips implementation remains the same
  // ...
}

/**
 * Toggle panel expanded/collapsed state
 * This is a key function that needs to work correctly
 */
function togglePanel() {
  try {
    console.log('Toggling panel, current state:', uiState.panelCollapsed);
    
    uiState.panelCollapsed = !uiState.panelCollapsed;
    
    if (elements.uiContainer) {
      elements.uiContainer.classList.toggle('collapsed', uiState.panelCollapsed);
      
      // Update toggle button icon
      const icon = elements.togglePanelBtn.querySelector('i');
      if (icon) {
        if (uiState.panelCollapsed) {
          icon.className = 'fas fa-chevron-right';
        } else {
          icon.className = 'fas fa-bars';
        }
      }
      
      console.log('Panel toggled, new state:', uiState.panelCollapsed);
    } else {
      console.error('UI Container element not found');
    }
  } catch (error) {
    console.error('Error toggling panel:', error);
  }
}

/**
 * Toggle play/pause state
 */
function togglePlayPause() {
  try {
    let isPlaying = false;
    if (typeof toggleSimulation === 'function') {
      isPlaying = toggleSimulation();
    } else {
      console.error('toggleSimulation function not available');
      // Fallback behavior - just toggle the UI
      isPlaying = !elements.playPauseBtn.classList.contains('playing');
    }
    
    // Update button text and icon
    const icon = elements.playPauseBtn.querySelector('i');
    const text = elements.playPauseBtn.querySelector('span');
    
    if (isPlaying) {
      icon.className = 'fas fa-pause';
      text.textContent = 'Pause';
      elements.playPauseBtn.classList.add('playing');
    } else {
      icon.className = 'fas fa-play';
      text.textContent = 'Play';
      elements.playPauseBtn.classList.remove('playing');
    }
  } catch (error) {
    console.error('Error toggling play/pause:', error);
  }
}

/**
 * Reset the simulation
 */
function resetSimulation() {
  try {
    if (typeof resetCloth === 'function') {
      resetCloth();
    } else {
      console.error('resetCloth function not available');
    }
  } catch (error) {
    console.error('Error resetting simulation:', error);
  }
}

/**
 * Reset the camera view
 */
function resetView() {
  try {
    if (typeof resetOrientation === 'function') {
      resetOrientation();
    } else {
      console.error('resetOrientation function not available');
    }
  } catch (error) {
    console.error('Error resetting view:', error);
  }
}

/**
 * Set active button in a group
 */
function setActiveButton(buttonGroup, activeButton) {
  try {
    buttonGroup.forEach(btn => {
      btn.classList.remove('active');
    });
    activeButton.classList.add('active');
  } catch (error) {
    console.error('Error setting active button:', error);
  }
}

/**
 * Toggle expandable section
 */
function toggleSection(header) {
  try {
    const content = header.nextElementSibling;
    const sectionId = header.closest('.control-section').id || header.textContent;
    
    header.classList.toggle('expanded');
    if (content) {
      content.classList.toggle('collapsed');
    }
    
    // Store section state
    uiState.expandedSections[sectionId] = header.classList.contains('expanded');
    
    // Update expand icon
    const expandIcon = header.querySelector('.fa-chevron-down');
    if (expandIcon) {
      expandIcon.style.transform = uiState.expandedSections[sectionId] 
        ? 'rotate(180deg)' 
        : 'rotate(0deg)';
    }
  } catch (error) {
    console.error('Error toggling section:', error);
  }
}

/**
 * Update parameter in the simulation
 */
function updateParameter(paramId, value, enabled) {
  try {
    // Convert string to appropriate type
    const numericValue = parseFloat(value);
    if (typeof setParameter === 'function') {
      return setParameter(paramId, numericValue, enabled);
    } else {
      console.error('setParameter function not available');
      return numericValue;
    }
  } catch (error) {
    console.error('Error updating parameter:', error);
    return value;
  }
}

/**
 * Update conditional controls based on current modes
 */
function updateConditionalControls() {
  try {
    if (!elements.conditionalControls) {
      console.error('Conditional controls not found');
      return;
    }
    
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
  } catch (error) {
    console.error('Error updating conditional controls:', error);
  }
}

/**
 * Show educational content in modal
 */
function showEducationalContent(content) {
  try {
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
    
    if (elements.modalBody && elements.educationalModal) {
      elements.modalBody.innerHTML = fullContent;
      elements.educationalModal.classList.add('visible');
    } else {
      console.error('Modal elements not found');
    }
  } catch (error) {
    console.error('Error showing educational content:', error);
  }
}

// Fallback function definitions in case simulator.js isn't loaded properly
// These will be overridden when simulator.js loads correctly
if (typeof setSimulationMode !== 'function') {
  window.setSimulationMode = function(mode) {
    console.warn('Using fallback setSimulationMode function');
    window.simulationMode = mode;
  };
}

if (typeof setFormMode !== 'function') {
  window.setFormMode = function(mode) {
    console.warn('Using fallback setFormMode function');
    window.formMode = mode;
  };
}

if (typeof setPinningMode !== 'function') {
  window.setPinningMode = function(mode) {
    console.warn('Using fallback setPinningMode function');
    window.pinningMode = mode;
  };
}

if (typeof setInteractionMode !== 'function') {
  window.setInteractionMode = function(mode) {
    console.warn('Using fallback setInteractionMode function');
    window.interactionMode = mode;
  };
}

if (typeof setVisualizationMode !== 'function') {
  window.setVisualizationMode = function(mode) {
    console.warn('Using fallback setVisualizationMode function');
    window.shadingMode = mode;
  };
}

// Expose common variables to window if they don't exist
window.simulationMode = window.simulationMode || 'plane';
window.formMode = window.formMode || 'sphere';
window.pinningMode = window.pinningMode || 'top';
window.interactionMode = window.interactionMode || 'rotate';

// Add this to help with mobile functionality
// Create a stylesheet for dynamic CSS
function addCssOverrides() {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    /* Force proper mobile layout */
    @media (max-width: 768px) {
      #uiContainer.collapsed {
        transform: translateY(calc(100% - var(--header-height))) !important;
      }
      
      body.mobile-device #uiContainer {
        height: 70% !important; 
        bottom: 0 !important;
        top: auto !important;
        width: 100% !important;
        box-shadow: 0 -5px 15px var(--shadow-dark) !important;
      }
      
      /* Fix for initial render */
      body.mobile-device #uiContainer.collapsed #togglePanelBtn {
        position: absolute !important;
        left: 5px !important;
        top: 10px !important;
        width: 40px !important;
        height: 40px !important;
        background-color: var(--bg-surface) !important;
        border-radius: 50% !important;
        box-shadow: 2px 2px 5px var(--shadow-dark) !important;
        visibility: visible !important;
        z-index: 200 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Run this at start to fix CSS
document.addEventListener('DOMContentLoaded', addCssOverrides);

// Export parameter educational content functions
window.getParameterEducationalContent = getParameterEducationalContent;
window.getSectionEducationalContent = getSectionEducationalContent;
