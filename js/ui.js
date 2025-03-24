/**
 * Setup touch-specific event handlers for better mobile experience
 */
function setupTouchEventHandlers() {
  // Simplify touch event handling to avoid conflicts with UI
  elements.togglePanelBtn.addEventListener('touchstart', function(e) {
    // Don't prevent default here to avoid UI becoming unresponsive
    togglePanel();
  });
  
  // Make all buttons respond to touch without preventing default behavior
  document.querySelectorAll('.option-btn, .action-btn, .toggle-label, .info-btn, .expand-btn').forEach(el => {
    el.addEventListener('touchstart', function(e) {
      // Use setTimeout to avoid UI freezing
      setTimeout(() => {
        el.click();
      }, 10);
    });
  });
  
  // For sliders, use direct touch handling
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('touchstart', function(e) {
      // Allow default touch behavior for sliders
    });
  });
}

/**
 * Detect iOS device - more reliable method
 */
function isiOSDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /iPad|iPhone|iPod/.test(userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Apply iOS-specific fixes for better compatibility
 */
function applyiOSFixes() {
  // Fix viewport height issues on iOS
  function updateIOSViewport() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  window.addEventListener('resize', updateIOSViewport);
  window.addEventListener('orientationchange', updateIOSViewport);
  updateIOSViewport();
  
  // Make panels more responsive on iOS
  elements.uiContainer.style.webkitBackfaceVisibility = 'hidden';
  elements.uiContainer.style.backfaceVisibility = 'hidden';
  
  // Fix for "rubber-banding" effect
  document.body.addEventListener('touchmove', function(e) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Ensure UI controls are responsive
  document.querySelectorAll('.toggle-label, .option-btn, .action-btn').forEach(el => {
    el.style.cursor = 'pointer';
    el.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
  });
}

/**
 * Toggle panel expanded/collapsed state - simplified version
 */
function togglePanel() {
  uiState.panelCollapsed = !uiState.panelCollapsed;
  
  // Use simple DOM manipulation to ensure performance
  if (uiState.panelCollapsed) {
    elements.uiContainer.classList.add('collapsed');
    const icon = elements.togglePanelBtn.querySelector('i');
    if (icon) icon.className = 'fas fa-chevron-right';
  } else {
    elements.uiContainer.classList.remove('collapsed');
    const icon = elements.togglePanelBtn.querySelector('i');
    if (icon) icon.className = 'fas fa-bars';
  }
}
