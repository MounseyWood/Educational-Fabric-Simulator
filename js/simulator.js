// Add this at the beginning of simulator.js, right after the variable declarations

// Flag to control whether the canvas captures events or passes them to UI
let canvasEventsCaptured = false;

// Override the default p5 orbitControl with a safer version
function orbitControl() {
  if (interactionMode !== "rotate" || !canvasEventsCaptured) return;
  
  // Only allow orbit control when in rotate mode and canvas has focus
  try {
    // Use a more compatible version that doesn't rely on deprecated sensors
    if (mouseIsPressed && mouseButton === LEFT) {
      const rate = 0.1;
      rotateY((mouseX - pmouseX) * rate);
      rotateX((mouseY - pmouseY) * rate);
    }
  } catch (e) {
    console.error("Error in orbit control:", e);
  }
}

// Modified p5.js mouse handling functions 
function mousePressed() {
  // Check if the click is on the canvas or UI
  const canvasRect = document.getElementById('canvasContainer').getBoundingClientRect();
  const isOnCanvas = 
    mouseX >= 0 && mouseX <= width &&
    mouseY >= 0 && mouseY <= height && 
    !(mouseX > canvasRect.width - 320 && mouseY < canvasRect.height); // Avoid UI area
  
  if (isOnCanvas) {
    canvasEventsCaptured = true;
    handleMousePressed();
  } else {
    canvasEventsCaptured = false;
  }
  
  // Don't prevent default to allow UI interaction
  return canvasEventsCaptured ? false : true;
}

function mouseDragged() {
  if (canvasEventsCaptured) {
    handleMouseDragged();
    return false; // Prevent default only for canvas
  }
  return true;
}

function mouseReleased() {
  if (canvasEventsCaptured) {
    handleMouseReleased();
    canvasEventsCaptured = false;
  }
  return true;
}

// Add touch-specific functions for p5
function touchStarted() {
  // Convert touch to mouse equivalent for p5
  if (touches.length > 0) {
    mouseX = touches[0].x;
    mouseY = touches[0].y;
  }
  return mousePressed();
}

function touchMoved() {
  if (touches.length > 0) {
    const prevX = mouseX;
    const prevY = mouseY;
    mouseX = touches[0].x;
    mouseY = touches[0].y;
    pmouseX = prevX;
    pmouseY = prevY;
  }
  return mouseDragged();
}

function touchEnded() {
  return mouseReleased();
}
