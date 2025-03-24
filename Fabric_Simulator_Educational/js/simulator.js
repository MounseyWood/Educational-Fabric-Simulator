/**
 * Fabric Simulator - Educational Edition
 * Core simulation functionality
 * 
 * This module handles the cloth physics simulation, including:
 * - Point and constraint creation
 * - Physics updates and collision handling
 * - Various simulation modes (plane, draped)
 */

/* CLOTH SETTINGS */
let cols = 20, rows = 20, spacing = 20;
let clothPoints = [], clothConstraints = [];
let grid = [], horizontal = [], vertical = [], centers = [];

/* SPHERE for Draped mode */
let sphereCentre = { x: 0, y: 0, z: 0 };
let sphereRadius = 100;

/* CYLINDER parameters for Draped mode */
let cylRadius = 100;
let cylHeight = 300;
let cylinderTopY = -50;
let cylinderBottomY = cylinderTopY + cylHeight; // 250

/* Invisible floor */
let floorY = 150;

/* SIMULATION PARAMETERS (default) */
let damping = 0.98;
let iterations = 5;
let stretchFactor = 1.0;
let shearFactor = 1.0;
let bendingFactor = 1.0;
let weight = 1.0;
let windX = 0.2, windY = 0, windZ = 0.1;
let windBuffer = 1.0;
let gravity = 0.4;

/* BASELINE (Off) values */
const BASE_DAMPING = 1.0;
const BASE_ITERATIONS = 1;
const BASE_STRETCH = 1.0;
const BASE_SHEAR = 1.0;
const BASE_BENDING = 1.0;
const BASE_WEIGHT = 1.0;
const BASE_WINDX = 0.0, BASE_WINDY = 0.0, BASE_WINDZ = 0.0;
const BASE_WINDBUFFER = 1.0;
const BASE_GRAVITY = 0.0;

/* FLAGS for each parameter */
let dampingOn = false;
let iterationsOn = false;
let stretchOn = false;
let shearOn = false;
let bendingOn = false;
let weightOn = false;
let windXOn = false;
let windYOn = false;
let windZOn = false;
let windBufOn = false;
let gravityOn = false;

// Shading modes
let shadingMode = "off"; // "off", "cloth", "overlaid", "stress", "structure"

/* MODES */
let pinningMode = "top";         // Only for Plane mode
let interactionMode = "rotate";  // "rotate" or "drag"
let simulationMode = "plane";    // "plane" or "draped"
let formMode = "sphere";         // For Draped mode: "sphere" or "cylinder"

/* CLOTH POSITIONING */
let clothShiftX = -40;

/* ORIENTATION RESET FLAG */
let doResetOrientation = false;

/* PLAY/PAUSE FLAG */
let simulationRunning = true;

/* 3D DRAGGING VARIABLES */
let dragPointIndex = null;
let dragPlaneZ = 0;
let prevMouseX = 0;
let prevMouseY = 0;
let mouseVelX = 0;
let mouseVelY = 0;
let dragRadius = 40;  // Radius of influence for drag forces
let dragStrength = 0.3;  // Strength of drag force

// For Stress shading, store each cell's rest area
let cellRestArea = [];

// For Structure shading, track constraint type
const STRUCTURAL = "structural";
const SHEAR = "shear";
const BENDING = "bending";

/**
 * Error handling wrapper - prevents browser console errors
 * @param {Function} fn - Function to execute with error handling
 * @param {Array} args - Arguments to pass to the function
 * @returns {*} - The result of the function call, or undefined if an error occurred
 */
function safeExecute(fn, ...args) {
  try {
    return fn(...args);
  } catch (error) {
    console.error(`Error in ${fn.name || 'anonymous function'}:`, error);
    return undefined;
  }
}

/**
 * p5.js setup function - called once at the start
 * Creates the canvas and sets up the cloth
 */
function setup() {
  try {
    // Create canvas inside the container
    let cnv = createCanvas(windowWidth - 320, windowHeight, WEBGL);
    cnv.parent("canvasContainer");
    cnv.style("display", "block");
    
    // Enable WebGL optimizations
    setAttributes('antialias', true);
    
    // Initialize the cloth
    setupCloth();
  } catch (error) {
    console.error("Error in setup:", error);
    // Display a user-friendly error message on the canvas
    let errorDiv = createDiv("An error occurred while initializing the simulator. Please refresh the page.");
    errorDiv.style('color', 'white');
    errorDiv.style('padding', '20px');
    errorDiv.style('text-align', 'center');
    errorDiv.parent("canvasContainer");
  }
}

/**
 * Sets up the cloth based on simulation mode
 * Creates points, constraints, and initializes the cloth structure
 */
function setupCloth() {
  clothPoints = [];
  clothConstraints = [];
  grid = [];
  horizontal = [];
  vertical = [];
  centers = [];
  cellRestArea = [];

  let clothWidth = (cols - 1) * spacing;
  let clothHeight = (rows - 1) * spacing;

  if (simulationMode === "plane") {
    let startX = -clothWidth/2 + clothShiftX;
    let startY = -clothHeight/2;
    createClothPoints_Plane(startX, startY, 0);

  } else {
    // Draped mode
    if (formMode === "sphere") {
      sphereCentre = { x: 0, y: 0, z: 0 };
      sphereRadius = 100;
      let startY = -sphereRadius;
      createClothPoints_Draped(-clothWidth/2, startY, -clothHeight/2);

      // Pin centre cloth point to top of sphere
      let midRow = Math.floor(rows/2);
      let midCol = Math.floor(cols/2);
      let centerIdx = grid[midRow][midCol];
      clothPoints[centerIdx].pinned = true;
      clothPoints[centerIdx].x = sphereCentre.x;
      clothPoints[centerIdx].y = sphereCentre.y - sphereRadius;
      clothPoints[centerIdx].z = sphereCentre.z;
      clothPoints[centerIdx].oldx = sphereCentre.x;
      clothPoints[centerIdx].oldy = sphereCentre.y - sphereRadius;
      clothPoints[centerIdx].oldz = sphereCentre.z;

    } else if (formMode === "cylinder") {
      let startY = cylinderTopY;
      createClothPoints_Draped(-clothWidth/2, startY, -clothHeight/2);

      // Pin centre cloth point at cylinder's top centre
      let midRow = Math.floor(rows/2);
      let midCol = Math.floor(cols/2);
      let centerIdx = grid[midRow][midCol];
      clothPoints[centerIdx].pinned = true;
      clothPoints[centerIdx].x = 0;
      clothPoints[centerIdx].y = cylinderTopY;
      clothPoints[centerIdx].z = 0;
      clothPoints[centerIdx].oldx = 0;
      clothPoints[centerIdx].oldy = cylinderTopY;
      clothPoints[centerIdx].oldz = 0;
    }
  }

  // Override floor if needed
  if (simulationMode === "draped") {
    if (formMode === "sphere") {
      floorY = 150;
    } else if (formMode === "cylinder") {
      floorY = cylinderBottomY;
    }
  } else {
    floorY = 150;
  }

  createSubPointsAndConstraints();
}

/**
 * Creates cloth points for the plane simulation mode
 * @param {number} startX - X coordinate for the top-left point
 * @param {number} startY - Y coordinate for the top-left point
 * @param {number} startZ - Z coordinate for the top-left point
 */
function createClothPoints_Plane(startX, startY, startZ) {
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      let px = startX + x * spacing;
      let py = startY + y * spacing;
      let pz = startZ;
      let pinned = false;
      if (pinningMode === "top") {
        pinned = (y === 0);
      } else if (pinningMode === "corners") {
        pinned = (
          (x === 0 && y === 0) ||
          (x === cols-1 && y === 0) ||
          (x === 0 && y === rows-1) ||
          (x === cols-1 && y === rows-1)
        );
      }
      clothPoints.push({
        x: px, y: py, z: pz,
        oldx: px, oldy: py, oldz: pz,
        pinned: pinned
      });
      grid[y][x] = clothPoints.length - 1;
    }
  }
}

/**
 * Creates cloth points for the draped simulation mode
 * @param {number} startX - X coordinate for the top-left point
 * @param {number} fixedY - Y coordinate for all top points
 * @param {number} startZ - Z coordinate for the top-left point
 */
function createClothPoints_Draped(startX, fixedY, startZ) {
  for (let rz = 0; rz < rows; rz++) {
    grid[rz] = [];
    for (let cx = 0; cx < cols; cx++) {
      let px = startX + cx * spacing;
      let py = fixedY;
      let pz = startZ + rz * spacing;
      clothPoints.push({
        x: px, y: py, z: pz,
        oldx: px, oldy: py, oldz: pz,
        pinned: false
      });
      grid[rz][cx] = clothPoints.length - 1;
    }
  }
}

/**
 * Creates subdivision points and constraints for the cloth
 * This adds intermediate points to improve simulation quality
 */
function createSubPointsAndConstraints() {
  horizontal = [];
  for (let y = 0; y < rows; y++) {
    horizontal[y] = [];
    for (let x = 0; x < cols - 1; x++) {
      let idxA = grid[y][x];
      let idxB = grid[y][x+1];
      let A = clothPoints[idxA];
      let B = clothPoints[idxB];
      let mx = (A.x + B.x) * 0.5;
      let my = (A.y + B.y) * 0.5;
      let mz = (A.z + B.z) * 0.5;
      clothPoints.push({
        x: mx, y: my, z: mz,
        oldx: mx, oldy: my, oldz: mz,
        pinned: false
      });
      horizontal[y][x] = clothPoints.length - 1;
    }
  }
  vertical = [];
  for (let y = 0; y < rows - 1; y++) {
    vertical[y] = [];
    for (let x = 0; x < cols; x++) {
      let idxA = grid[y][x];
      let idxB = grid[y+1][x];
      let A = clothPoints[idxA];
      let B = clothPoints[idxB];
      let mx = (A.x + B.x) * 0.5;
      let my = (A.y + B.y) * 0.5;
      let mz = (A.z + B.z) * 0.5;
      clothPoints.push({
        x: mx, y: my, z: mz,
        oldx: mx, oldy: my, oldz: mz,
        pinned: false
      });
      vertical[y][x] = clothPoints.length - 1;
    }
  }
  centers = [];
  cellRestArea = [];
  for (let y = 0; y < rows - 1; y++) {
    centers[y] = [];
    cellRestArea[y] = [];
    for (let x = 0; x < cols - 1; x++) {
      let idxA = grid[y][x];
      let idxB = grid[y][x+1];
      let idxC = grid[y+1][x];
      let idxD = grid[y+1][x+1];
      let A = clothPoints[idxA];
      let B = clothPoints[idxB];
      let C = clothPoints[idxC];
      let D = clothPoints[idxD];
      let mx = (A.x + B.x + C.x + D.x) * 0.25;
      let my = (A.y + B.y + C.y + D.y) * 0.25;
      let mz = (A.z + B.z + C.z + D.z) * 0.25;
      clothPoints.push({
        x: mx, y: my, z: mz,
        oldx: mx, oldy: my, oldz: mz,
        pinned: false
      });
      centers[y][x] = clothPoints.length - 1;
      let restArea = computeQuadArea(A, B, C, D);
      cellRestArea[y][x] = restArea;
    }
  }
  createConstraints();
}

/**
 * Calculate area of a quadrilateral by splitting into two triangles
 */
function computeQuadArea(A, B, C, D) {
  let area1 = triArea(A, B, C);
  let area2 = triArea(B, C, D);
  return area1 + area2;
}

/**
 * Calculate area of a triangle using vector cross product
 */
function triArea(p1, p2, p3) {
  let ux = p2.x - p1.x;
  let uy = p2.y - p1.y;
  let uz = p2.z - p1.z;
  let vx = p3.x - p1.x;
  let vy = p3.y - p1.y;
  let vz = p3.z - p1.z;
  let cx = uy * vz - uz * vy;
  let cy = uz * vx - ux * vz;
  let cz = ux * vy - uy * vx;
  return 0.5 * sqrt(cx*cx + cy*cy + cz*cz);
}

/**
 * Creates all constraints between cloth points
 * Includes structural, bending, and shear constraints
 */
function createConstraints() {
  // Structural
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let idx = grid[y][x];
      if (x < cols - 1) {
        addConstraint(idx, grid[y][x+1],
          spacing * (stretchOn ? stretchFactor : BASE_STRETCH),
          STRUCTURAL
        );
      }
      if (y < rows - 1) {
        addConstraint(idx, grid[y+1][x],
          spacing * (stretchOn ? stretchFactor : BASE_STRETCH),
          STRUCTURAL
        );
      }
    }
  }
  // Bending
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols - 2; x++) {
      addConstraint(grid[y][x], grid[y][x+2],
        spacing * 2 * (bendingOn ? bendingFactor : BASE_BENDING),
        BENDING
      );
    }
  }
  for (let y = 0; y < rows - 2; y++) {
    for (let x = 0; x < cols; x++) {
      addConstraint(grid[y][x], grid[y+2][x],
        spacing * 2 * (bendingOn ? bendingFactor : BASE_BENDING),
        BENDING
      );
    }
  }
  // Shear
  for (let y = 0; y < rows - 1; y++) {
    for (let x = 0; x < cols - 1; x++) {
      let idxA = grid[y][x];
      let idxB = grid[y][x+1];
      let idxC = grid[y+1][x];
      let idxD = grid[y+1][x+1];
      addConstraint(idxA, idxD,
        sqrt(2) * spacing * (shearOn ? shearFactor : BASE_SHEAR),
        SHEAR
      );
      addConstraint(idxB, idxC,
        sqrt(2) * spacing * (shearOn ? shearFactor : BASE_SHEAR),
        SHEAR
      );
    }
  }
  // Subdivide
  for (let y = 0; y < rows - 1; y++) {
    for (let x = 0; x < cols - 1; x++) {
      let A = grid[y][x];
      let B = grid[y][x+1];
      let C = grid[y+1][x];
      let D = grid[y+1][x+1];
      let E = horizontal[y][x];
      let F = horizontal[y+1][x];
      let G = vertical[y][x];
      let H = vertical[y][x+1];
      let I = centers[y][x];
      addTriConstraints(A, E, I);
      addTriConstraints(A, G, I);
      addTriConstraints(B, E, I);
      addTriConstraints(B, H, I);
      addTriConstraints(C, G, I);
      addTriConstraints(C, F, I);
      addTriConstraints(D, H, I);
      addTriConstraints(D, F, I);
    }
  }
}

/**
 * Add constraints between three points forming a triangle
 */
function addTriConstraints(i1, i2, i3) {
  let dist1 = distBetween(i1, i2);
  let dist2 = distBetween(i2, i3);
  let dist3 = distBetween(i3, i1);
  addConstraint(i1, i2, dist1, STRUCTURAL);
  addConstraint(i2, i3, dist2, STRUCTURAL);
  addConstraint(i3, i1, dist3, STRUCTURAL);
}

/**
 * Add a constraint between two points
 */
function addConstraint(i, j, len, type) {
  let a = min(i, j);
  let b = max(i, j);
  for (let c of clothConstraints) {
    if (c.p1 === a && c.p2 === b) return;
  }
  clothConstraints.push({ p1: a, p2: b, length: len, type });
}

/**
 * Calculate distance between two points by index
 */
function distBetween(i1, i2) {
  let p1 = clothPoints[i1];
  let p2 = clothPoints[i2];
  let dx = p2.x - p1.x;
  let dy = p2.y - p1.y;
  let dz = p2.z - p1.z;
  return sqrt(dx*dx + dy*dy + dz*dz);
}

/**
 * Update cloth position and handle physics
 * Called each frame to simulate cloth movement
 */
function updateCloth() {
  // Only update if simulation is running
  if (!simulationRunning) return;
  
  let freq = 0.01;
  for (let p of clothPoints) {
    if (!p.pinned) {
      let vx = (p.x - p.oldx) * (dampingOn ? damping : BASE_DAMPING);
      let vy = (p.y - p.oldy) * (dampingOn ? damping : BASE_DAMPING);
      let vz = (p.z - p.oldz) * (dampingOn ? damping : BASE_DAMPING);
      p.oldx = p.x;
      p.oldy = p.y;
      p.oldz = p.z;

      let sinVal = sin(frameCount * freq);
      let effectiveWindX = windXOn ? windBuffer * windX * sinVal : BASE_WINDX;
      let effectiveWindY = windYOn ? windBuffer * windY * sinVal : BASE_WINDY;
      let effectiveWindZ = windZOn ? windBuffer * windZ * sinVal : BASE_WINDZ;

      let effGrav = gravityOn ? gravity : BASE_GRAVITY;
      let effWeight = weightOn ? weight : BASE_WEIGHT;

      p.x += vx + effectiveWindX;
      p.y += vy + effGrav * effWeight + effectiveWindY;
      p.z += vz + effectiveWindZ;
    }
  }

  let effIter = iterationsOn ? iterations : BASE_ITERATIONS;
  for (let i = 0; i < effIter; i++) {
    for (let c of clothConstraints) {
      let p1 = clothPoints[c.p1];
      let p2 = clothPoints[c.p2];
      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      let dz = p2.z - p1.z;
      let distVal = sqrt(dx*dx + dy*dy + dz*dz);
      let diff = (distVal - c.length) / distVal;
      let offsetX = dx * 0.5 * diff;
      let offsetY = dy * 0.5 * diff;
      let offsetZ = dz * 0.5 * diff;
      if (!p1.pinned) {
        p1.x += offsetX;
        p1.y += offsetY;
        p1.z += offsetZ;
      }
      if (!p2.pinned) {
        p2.x -= offsetX;
        p2.y -= offsetY;
        p2.z -= offsetZ;
      }
    }
  }

  doSelfCollision();
  
  if (simulationMode === "draped") {
    if (formMode === "sphere") {
      doSphereCollision();
    } else if (formMode === "cylinder") {
      doCylinderCollision();
    }
    doFloorCollision();
  }
}

/**
 * Handle collisions between cloth points
 * Prevents self-intersection
 */
function doSelfCollision() {
  let threshold = spacing * 0.5;
  for (let i = 0; i < clothPoints.length; i++) {
    for (let j = i + 1; j < clothPoints.length; j++) {
      let p1 = clothPoints[i];
      let p2 = clothPoints[j];
      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      let dz = p2.z - p1.z;
      let d = sqrt(dx*dx + dy*dy + dz*dz);
      if (d < threshold && d > 0) {
        let overlap = threshold - d;
        let angle = atan2(dy, dx);
        if (!p1.pinned && !p2.pinned) {
          p1.x -= cos(angle)*overlap*0.5;
          p1.y -= sin(angle)*overlap*0.5;
          p2.x += cos(angle)*overlap*0.5;
          p2.y += sin(angle)*overlap*0.5;
        } else if (!p1.pinned && p2.pinned) {
          p1.x -= cos(angle)*overlap;
          p1.y -= sin(angle)*overlap;
        } else if (p1.pinned && !p2.pinned) {
          p2.x += cos(angle)*overlap;
          p2.y += sin(angle)*overlap;
        }
      }
    }
  }
}

/**
 * Handle collisions with the sphere in draped mode
 */
function doSphereCollision() {
  const collisionFriction = 0.5;
  for (let p of clothPoints) {
    if (!p.pinned) {
      let dx = p.x - sphereCentre.x;
      let dy = p.y - sphereCentre.y;
      let dz = p.z - sphereCentre.z;
      let distVal = sqrt(dx*dx + dy*dy + dz*dz);
      if (distVal < sphereRadius) {
        let overlap = sphereRadius - distVal;
        let nx = dx / distVal;
        let ny = dy / distVal;
        let nz = dz / distVal;
        p.x += nx * overlap;
        p.y += ny * overlap;
        p.z += nz * overlap;
        p.oldx = p.x - collisionFriction * (p.x - p.oldx);
        p.oldy = p.y - collisionFriction * (p.y - p.oldy);
        p.oldz = p.z - collisionFriction * (p.z - p.oldz);
      }
    }
  }
}

/**
 * Handle collisions with the cylinder in draped mode
 */
function doCylinderCollision() {
  const collisionFriction = 0.5;
  for (let p of clothPoints) {
    if (!p.pinned) {
      if (p.y > cylinderTopY && p.y < cylinderBottomY) {
        let r = sqrt(p.x*p.x + p.z*p.z);
        if (r < cylRadius) {
          let overlap = cylRadius - r;
          let nx = p.x / r;
          let nz = p.z / r;
          p.x += nx * overlap;
          p.z += nz * overlap;
          p.oldx = p.x - collisionFriction * (p.x - p.oldx);
          p.oldz = p.z - collisionFriction * (p.z - p.oldz);
        }
      }
    }
  }
}

/**
 * Handle collisions with the floor in draped mode
 */
function doFloorCollision() {
  const collisionFriction = 0.5;
  for (let p of clothPoints) {
    if (!p.pinned && p.y > floorY) {
      p.y = floorY;
      p.oldy = p.y - collisionFriction * (p.y - p.oldy);
    }
  }
}

/**
 * Handle 3D point dragging - called when mouse is pressed
 */
function handleMousePressed() {
  if (interactionMode === "drag") {
    // Track mouse position for velocity calculation
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseVelX = 0;
    mouseVelY = 0;
    
    let closest = null;
    let closestDist = 10;
    for (let i = 0; i < clothPoints.length; i++) {
      let p = clothPoints[i];
      let sx = modelX(p.x, p.y, p.z);
      let sy = modelY(p.x, p.y, p.z);
      let d = dist(mouseX, mouseY, sx, sy);
      if (d < closestDist) {
        closestDist = d;
        closest = i;
      }
    }
    if (closest !== null) {
      dragPointIndex = closest;
      dragPlaneZ = clothPoints[closest].z;
    }
  }
}

/**
 * Convert screen coordinates to 3D world coordinates at given Z plane
 */
function unproject(mx, my, fixedZ) {
  let d = (height/2) / tan(PI*30/180);
  let nx = mx - width/2;
  let ny = my - height/2;
  let factor = (d + fixedZ) / d;
  let wx = nx * factor;
  let wy = ny * factor;
  return createVector(wx, wy, fixedZ);
}

/**
 * Handle 3D point dragging - called when mouse is dragged
 * Enhanced version with direct position manipulation for better responsiveness
 */
function handleMouseDragged() {
  try {
    // Exit early if not in drag mode or no point is selected
    if (interactionMode !== "drag" || dragPointIndex === null) return;
    
    // Calculate mouse velocity for momentum
    mouseVelX = mouseX - prevMouseX;
    mouseVelY = mouseY - prevMouseY;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    
    // Get the dragged point
    let draggedPoint = clothPoints[dragPointIndex];
    if (!draggedPoint) return;
    
    // Get target position based on mouse
    let targetPos = unproject(mouseX, mouseY, dragPlaneZ);
    
    // For more direct and responsive control, use direct position setting
    // This prevents the "jumping" behavior seen with force-based approaches
    if (!draggedPoint.pinned) {
      // Direct position update for the main dragged point
      draggedPoint.x = targetPos.x;
      draggedPoint.y = targetPos.y;
      
      // Set the oldx/oldy for velocity preservation
      draggedPoint.oldx = draggedPoint.x - (mouseVelX * 0.2);
      draggedPoint.oldy = draggedPoint.y - (mouseVelY * 0.2);
    }
  } catch (error) {
    console.error("Error in drag function:", error);
    // Graceful recovery - reset drag state if there's an error
    dragPointIndex = null;
  }
}

/**
 * Handle 3D point dragging - called when mouse is released
 * Enhanced version with momentum preservation
 */
function handleMouseReleased() {
  if (dragPointIndex !== null) {
    // Add a "flick" effect based on mouse velocity
    let p = clothPoints[dragPointIndex];
    if (!p.pinned) {
      // Apply mouse velocity as an impulse force
      let flickFactor = 0.2;
      p.oldx = p.x - (mouseVelX * flickFactor);
      p.oldy = p.y - (mouseVelY * flickFactor);
    }
    
    // Reset drag state
    dragPointIndex = null;
  }
}

/**
 * p5.js draw function - called every frame
 * Renders the cloth and handles updates
 */
function draw() {
  background(30);

  if (doResetOrientation) {
    camera(0, 0, (height/2) / tan(PI*30/180),
           0, 0, 0,
           0, 1, 0);
    doResetOrientation = false;
  }

  if (interactionMode === "rotate") {
    orbitControl();
  }

  // Update cloth physics
  updateCloth();

  // If draped mode, draw the chosen form + invisible floor
  if (simulationMode === "draped") {
    noStroke();
    fill("#222"); // dark grey
    if (formMode === "sphere") {
      push();
      translate(sphereCentre.x, sphereCentre.y, sphereCentre.z);
      sphere(sphereRadius);
      pop();
    } else {
      push();
      let midY = (cylinderTopY + cylinderBottomY)/2;
      translate(0, midY, 0);
      cylinder(cylRadius, cylHeight);
      pop();
    }
    // Draw invisible floor (wireframe)
    push();
    translate(0, floorY, 0);
    noFill();
    plane(1000, 1000);
    pop();
  }

  // Draw the cloth based on shading mode
  drawCloth();
}

/**
 * Draw the cloth based on selected visualization mode
 */
function drawCloth() {
  // For stress shading, remove the overlaid white lines/nodes
  if (shadingMode === "off") {
    stroke(255);
    strokeWeight(2);
    noFill();
    for (let c of clothConstraints) {
      let p1 = clothPoints[c.p1];
      let p2 = clothPoints[c.p2];
      line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
    fill(255);
    noStroke();
    for (let p of clothPoints) {
      push();
      translate(p.x, p.y, p.z);
      sphere(2);
      pop();
    }

  } else if (shadingMode === "cloth" || shadingMode === "overlaid") {
    let minY = Infinity, maxY = -Infinity;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let pt = clothPoints[grid[y][x]];
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      }
    }
    noStroke();
    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols - 1; x++) {
        let A = clothPoints[grid[y][x]];
        let B = clothPoints[grid[y][x+1]];
        let C = clothPoints[grid[y+1][x+1]];
        let D = clothPoints[grid[y+1][x]];
        let avgY = (A.y+B.y+C.y+D.y)*0.25;
        let bright = map(avgY, minY, maxY, 220, 80);
        fill(bright);
        beginShape();
        vertex(A.x, A.y, A.z);
        vertex(B.x, B.y, B.z);
        vertex(C.x, C.y, C.z);
        vertex(D.x, D.y, D.z);
        endShape(CLOSE);
      }
    }
    if (shadingMode === "overlaid") {
      stroke(255);
      strokeWeight(2);
      noFill();
      for (let c of clothConstraints) {
        let p1 = clothPoints[c.p1];
        let p2 = clothPoints[c.p2];
        line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
      fill(255);
      noStroke();
      for (let p of clothPoints) {
        push();
        translate(p.x, p.y, p.z);
        sphere(2);
        pop();
      }
    }

  } else if (shadingMode === "stress") {
    // Heat-map only (no overlay lines/nodes)
    noStroke();
    let sensitivityFactor = 1.0;
    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols - 1; x++) {
        let idxA = grid[y][x];
        let idxB = grid[y][x+1];
        let idxC = grid[y+1][x];
        let idxD = grid[y+1][x+1];
        let A = clothPoints[idxA];
        let B = clothPoints[idxB];
        let C = clothPoints[idxC];
        let D = clothPoints[idxD];
        let currArea = computeQuadArea(A, B, C, D);
        let restArea = cellRestArea[y][x];
        let diff = currArea - restArea;
        let maxDelta = restArea * 1.0 * sensitivityFactor;
        let val = constrain(diff, -maxDelta, maxDelta);
        let ratio = map(val, -maxDelta, maxDelta, 0, 1);
        let rCol = lerp(0, 255, ratio);
        let bCol = lerp(255, 0, ratio);
        fill(rCol, 0, bCol);
        beginShape();
        vertex(A.x, A.y, A.z);
        vertex(B.x, B.y, B.z);
        vertex(C.x, C.y, C.z);
        vertex(D.x, D.y, D.z);
        endShape(CLOSE);
      }
    }

  } else if (shadingMode === "structure") {
    // Colour-coded lines by constraint type
    noFill();
    strokeWeight(2);
    for (let c of clothConstraints) {
      let p1 = clothPoints[c.p1];
      let p2 = clothPoints[c.p2];
      if (c.type === STRUCTURAL) {
        stroke(0, 255, 0);
      } else if (c.type === SHEAR) {
        stroke(255, 255, 0);
      } else if (c.type === BENDING) {
        stroke(0, 0, 255);
      } else {
        stroke(255);
      }
      line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
    // Red nodes
    fill(255, 0, 0);
    noStroke();
    for (let p of clothPoints) {
      push();
      translate(p.x, p.y, p.z);
      sphere(2);
      pop();
    }
  }
}

/**
 * p5.js windowResized function - called when window is resized
 * Updates canvas size to fit the window
 */
function windowResized() {
  resizeCanvas(windowWidth - 320, windowHeight);
}

/**
 * Set simulation mode (plane or draped)
 */
function setSimulationMode(mode) {
  if (mode !== simulationMode) {
    simulationMode = mode;
    setupCloth();
  }
}

/**
 * Set form mode for draped simulation (sphere or cylinder)
 */
function setFormMode(mode) {
  if (mode !== formMode) {
    formMode = mode;
    if (simulationMode === "draped") {
      setupCloth();
    }
  }
}

/**
 * Set pinning mode for plane simulation (top or corners)
 */
function setPinningMode(mode) {
  if (mode !== pinningMode) {
    pinningMode = mode;
    if (simulationMode === "plane") {
      setupCloth();
    }
  }
}

/**
 * Set interaction mode (rotate or drag)
 */
function setInteractionMode(mode) {
  interactionMode = mode;
  dragPointIndex = null;
}

/**
 * Set visualization mode
 */
function setVisualizationMode(mode) {
  shadingMode = mode;
}

/**
 * Toggle simulation pause/play
 */
function toggleSimulation() {
  simulationRunning = !simulationRunning;
  return simulationRunning;
}

/**
 * Reset camera orientation
 */
function resetOrientation() {
  doResetOrientation = true;
}

/**
 * Reset cloth to initial state
 */
function resetCloth() {
  setupCloth();
}

/**
 * Set parameter values and flags
 */
function setParameter(param, value, enabled) {
  switch(param) {
    case 'damping':
      damping = value;
      dampingOn = enabled;
      break;
    case 'iterations':
      iterations = value;
      iterationsOn = enabled;
      break;
    case 'stretch':
      stretchFactor = value;
      stretchOn = enabled;
      break;
    case 'shear':
      shearFactor = value;
      shearOn = enabled;
      break;
    case 'bending':
      bendingFactor = value;
      bendingOn = enabled;
      break;
    case 'weight':
      weight = value;
      weightOn = enabled;
      break;
    case 'gravity':
      gravity = value;
      gravityOn = enabled;
      break;
    case 'windX':
      windX = value;
      windXOn = enabled;
      break;
    case 'windY':
      windY = value;
      windYOn = enabled;
      break;
    case 'windZ':
      windZ = value;
      windZOn = enabled;
      break;
    case 'windBuffer':
      windBuffer = value;
      windBufOn = enabled;
      break;
  }
  
  if (param === 'stretch' || param === 'shear' || param === 'bending') {
    // Recreate constraints with new factors
    createConstraints();
  }
  
  return value;
}
