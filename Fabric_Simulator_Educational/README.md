# Educational Fabric Simulator

An interactive 3D fabric simulation tool designed for fashion students to explore and understand fabric physical properties in an intuitive way.

## Overview

This educational tool provides a visual and interactive approach to understanding how different fabrics behave based on their physical properties. Using a mass-spring system for cloth simulation, it demonstrates how parameters like stretch, bend, shear, and weight affect fabric draping and movement.

![Fabric Simulator Screenshot](screenshot.png)

## Features

### Interactive 3D Simulation
- **Plane Mode**: Suspended fabric for studying basic hanging behavior
- **Draped Mode**: Fabric draped over 3D forms (sphere or cylinder)
- **Interactive Controls**: Rotate the view or directly manipulate the fabric

### Physical Property Controls
- **Damping**: Controls how quickly movement energy dissipates
- **Stretch**: Resistance to extension along the fabric grain
- **Shear**: Resistance to diagonal deformation
- **Bending**: Stiffness when folding
- **Weight**: How heavily gravity affects the fabric

### Educational Elements
- **Progressive Disclosure**: Basic mode for beginners, Advanced mode for detailed control
- **Visual Feedback**: Multiple visualization modes to understand fabric structure
- **Informational Tooltips**: Detailed explanations of fabric physics
- **Fabric Type Presets**: Simulate common fabrics like cotton, silk, and denim

### Visualization Modes
- **Normal**: Shows the internal structure with points and lines
- **Cloth**: Shows the fabric as a solid surface
- **Overlaid**: Combines solid surface with structural elements
- **Stress**: Heat map showing areas of tension (red) and compression (blue)
- **Structure**: Color-coded constraint types (green=structural, yellow=shear, blue=bending)

## User Interface

The interface features a dark neumorphic design with soft shadows and rounded elements:

- **Right Panel**: Controls for simulation parameters
- **Main View**: 3D canvas showing the fabric simulation
- **Bottom Action Bar**: Quick actions like reset, play/pause
- **Educational Content**: Modal dialogs with teaching information

## Technical Details

The simulation uses a mass-spring system with:

- Points (particles) to represent the fabric mesh
- Constraints between points to maintain structure
- External forces like gravity and wind
- Verlet integration for stable physics simulation

### Physics Model

- **Structural Constraints**: Maintain the basic grid structure (prevent stretching)
- **Shear Constraints**: Resist diagonal deformation
- **Bending Constraints**: Resist folding between non-adjacent points
- **Collision Detection**: Self-collisions and collisions with 3D objects

## Learning Applications

This tool is designed to help fashion students:

1. Understand how physical properties affect fabric behavior
2. Visualize how different fabrics drape over forms
3. Experiment with fabric parameters in real-time
4. Learn the physics behind fabric movement and draping
5. Compare behavior of different fabric types

## Usage

1. Select a simulation mode (Plane or Draped)
2. Toggle parameters like Stretch, Bend, or Weight
3. Adjust parameter values using sliders
4. Use Rotate mode to view the fabric from different angles
5. Switch to Drag mode to pull on points of the fabric
6. Try different visualization modes to understand fabric structure

## Getting Started

Simply open the `index.html` file in a modern web browser to launch the application. No installation or additional software is required.

## Technology Stack

- **HTML5/CSS3**: For structure and styling
- **JavaScript**: For application logic
- **p5.js**: For canvas rendering and 3D graphics
- **CSS Variables**: For theme consistency
- **Font Awesome**: For UI icons

## Acknowledgments

This educational project is based on work from existing cloth simulation research and adapted specifically for fashion education purposes. The simulation technique uses a position-based dynamics approach for stable, interactive fabric simulation.

## Future Enhancements

- Fabric preset selector to quickly switch between common fabric types
- Multiple fabric layers for comparison
- Ability to export and share simulation settings
- Additional 3D forms like mannequins for more realistic garment draping
- Recording feature to capture fabric motion for analysis
