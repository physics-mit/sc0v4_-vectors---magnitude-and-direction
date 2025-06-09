/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Import GoogleGenAI if needed for other functionalities, not used in this specific simulator logic.
// import { GoogleGenAI } from "@google/genai";

// DOM Elements
const forceMagnitudeInput = document.getElementById('force-magnitude') as HTMLInputElement;
const forceMagnitudeSlider = document.getElementById('force-magnitude-slider') as HTMLInputElement;
const forceDirectionInput = document.getElementById('force-direction') as HTMLInputElement;
const forceDirectionSlider = document.getElementById('force-direction-slider') as HTMLInputElement;

const velocityMagnitudeInput = document.getElementById('velocity-magnitude') as HTMLInputElement;
const velocityMagnitudeSlider = document.getElementById('velocity-magnitude-slider') as HTMLInputElement;
const velocityDirectionInput = document.getElementById('velocity-direction') as HTMLInputElement;
const velocityDirectionSlider = document.getElementById('velocity-direction-slider') as HTMLInputElement;

const canvas = document.getElementById('vectorCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const textExplanationDiv = document.getElementById('textExplanation') as HTMLDivElement;
const exampleCasesDiv = document.getElementById('exampleCases') as HTMLDivElement;

// Constants for drawing
const CANVAS_CENTER_X = canvas.width / 2;
const CANVAS_CENTER_Y = canvas.height / 2;
const AXIS_COLOR = '#7f8c8d';
const FORCE_COLOR = '#3498db'; // Blue
const VELOCITY_COLOR = '#2ecc71'; // Green
const VECTOR_SCALE_FACTOR = 1.2; // Scales vector length for visibility

/**
 * Converts degrees to radians.
 * @param degrees Angle in degrees.
 * @returns Angle in radians.
 */
function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Draws an arrowhead at the end of a vector.
 * @param context Canvas rendering context.
 * @param fromX Starting x-coordinate of the vector line.
 * @param fromY Starting y-coordinate of the vector line.
 * @param toX Ending x-coordinate of the vector line.
 * @param toY Ending y-coordinate of the vector line.
 * @param color Color of the arrowhead.
 * @param radius Size of the arrowhead.
 */
function drawArrowhead(
    context: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    radius: number = 5
): void {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    context.save();
    context.beginPath();
    context.translate(toX, toY);
    context.rotate(angle);
    context.moveTo(0, 0);
    context.lineTo(-radius * 2, -radius);
    context.lineTo(-radius * 2, radius);
    context.closePath();
    context.fillStyle = color;
    context.fill();
    context.restore();
}

/**
 * Draws a vector on the canvas.
 * @param magnitude Magnitude of the vector.
 * @param directionDegrees Direction of the vector in degrees (0 is right, increases counter-clockwise).
 * @param color Color of the vector.
 * @param label Label for the vector (e.g., "F" or "V").
 */
function drawVector(
    magnitude: number,
    directionDegrees: number,
    color: string,
    label: string
): void {
    if (magnitude === 0) return; // Don't draw zero-magnitude vectors
    if (!ctx) return; // Ensure ctx is available

    const angleRadians = degreesToRadians(directionDegrees);
    
    // Calculate end points. Note: y is inverted for canvas (positive y is down)
    // So, for standard math angles (0 right, 90 up), sin(angle) needs to be subtracted.
    const endX = CANVAS_CENTER_X + magnitude * VECTOR_SCALE_FACTOR * Math.cos(angleRadians);
    const endY = CANVAS_CENTER_Y - magnitude * VECTOR_SCALE_FACTOR * Math.sin(angleRadians); // Subtract for upward Y

    // Draw vector line
    ctx.beginPath();
    ctx.moveTo(CANVAS_CENTER_X, CANVAS_CENTER_Y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();

    // Draw arrowhead
    drawArrowhead(ctx, CANVAS_CENTER_X, CANVAS_CENTER_Y, endX, endY, color, 5);

    // Draw label
    ctx.fillStyle = color;
    ctx.font = 'bold 14px Arial';
    // Position label near the arrowhead
    const labelOffsetX = Math.cos(angleRadians) > 0 ? 10 : -20 - (label.length > 1 ? 5 * (label.length - 1) : 0);
    const labelOffsetY = Math.sin(angleRadians) < 0 ? -10 : 20; // Adjust based on y direction
    ctx.fillText(label, endX + labelOffsetX, endY + labelOffsetY);
}

/**
 * Draws the coordinate axes on the canvas.
 */
function drawAxes(): void {
    if (!ctx) return; // Ensure ctx is available

    ctx.strokeStyle = AXIS_COLOR;
    ctx.lineWidth = 1;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_CENTER_Y);
    ctx.lineTo(canvas.width, CANVAS_CENTER_Y);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(CANVAS_CENTER_X, 0);
    ctx.lineTo(CANVAS_CENTER_X, canvas.height);
    ctx.stroke();

    // Origin circle
    ctx.beginPath();
    ctx.arc(CANVAS_CENTER_X, CANVAS_CENTER_Y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = AXIS_COLOR;
    ctx.fill();

    // Labels for axes
    ctx.fillStyle = AXIS_COLOR;
    ctx.font = '12px Arial';
    ctx.fillText('+X', canvas.width - 20, CANVAS_CENTER_Y - 5);
    ctx.fillText('+Y', CANVAS_CENTER_X + 5, 15);
}

/**
 * Main simulation update function. Clears canvas and redraws vectors based on input values.
 */
function updateSimulation(): void {
    if (!ctx) return; // Ensure ctx is available
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw axes
    drawAxes();

    // Get values from inputs
    const forceMag = parseFloat(forceMagnitudeInput.value);
    const forceDir = parseFloat(forceDirectionInput.value);
    const velMag = parseFloat(velocityMagnitudeInput.value);
    const velDir = parseFloat(velocityDirectionInput.value);

    // Draw vectors
    drawVector(forceMag, forceDir, FORCE_COLOR, 'F');
    drawVector(velMag, velDir, VELOCITY_COLOR, 'V');
}

/**
 * Populates the explanation sections with content.
 */
function populateExplanations(): void {
    // Explanation from the provided text
    const explanationPoints = [
        "Vectors (like force and velocity) are quantities that have both magnitude (size/length) and direction.",
        "A force vector's magnitude represents the strength of the force, and its direction indicates how the force is applied.",
        "A velocity vector's magnitude represents the speed of an object, and its direction indicates the direction of its motion.",
        "The direction of a vector is often described by an angle relative to a reference axis (e.g., the positive x-axis).",
        "Importantly, force and velocity are distinct. An object can experience a force in one direction while moving (having velocity) in a completely different direction. This is common in physics, such as a ball thrown upwards (velocity upwards, gravity force downwards)."
    ];
    const explanationList = document.createElement('ul');
    explanationPoints.forEach(point => {
        const listItem = document.createElement('li');
        listItem.textContent = point;
        explanationList.appendChild(listItem);
    });
    if (textExplanationDiv) {
        textExplanationDiv.innerHTML = ''; // Clear previous content if any
        textExplanationDiv.appendChild(explanationList);
    }


    // Example cases to explore
    const examplePoints = [
        "<strong>Aligned Vectors:</strong> Set force and velocity to have the same direction (e.g., Force: 50 at 45°, Velocity: 30 at 45°). Observe both vectors pointing the same way. This might represent an object accelerating in its direction of motion.",
        "<strong>Opposed Vectors:</strong> Set force and velocity to have opposite directions (e.g., Force: 50 at 0°, Velocity: 30 at 180°). This could represent a braking force or air resistance opposing motion.",
        "<strong>Perpendicular Vectors:</strong> Set force and velocity at 90° to each other (e.g., Force: 50 at 0°, Velocity: 30 at 90°). This is characteristic of circular motion where the force is centripetal.",
        "<strong>Zero Magnitude:</strong> Set the magnitude of one vector to 0 (e.g., Force magnitude: 0). Observe that vector disappears or becomes a dot at the origin. This means no force is applied, or the object is at rest (if velocity is also zero)."
    ];
    const exampleList = document.createElement('ul');
    examplePoints.forEach(pointHTML => {
        const listItem = document.createElement('li');
        listItem.innerHTML = pointHTML; // Use innerHTML for <strong> tag
        exampleList.appendChild(listItem);
    });
    if (exampleCasesDiv) {
        exampleCasesDiv.innerHTML = ''; // Clear previous content if any
        exampleCasesDiv.appendChild(exampleList);
    }
}

/**
 * Synchronizes number input with its corresponding slider.
 * @param numberInput The number input element.
 * @param sliderInput The range slider input element.
 */
function syncInputs(numberInput: HTMLInputElement, sliderInput: HTMLInputElement): void {
    numberInput.addEventListener('input', () => {
        sliderInput.value = numberInput.value;
        updateSimulation();
    });
    sliderInput.addEventListener('input', () => {
        numberInput.value = sliderInput.value;
        updateSimulation();
    });
}


/**
 * Initialization function. Sets up event listeners and initial drawing.
 */
function init(): void {
    if (!ctx) {
        console.error("Failed to get 2D rendering context for canvas.");
        return;
    }
    // Sync input fields with sliders
    syncInputs(forceMagnitudeInput, forceMagnitudeSlider);
    syncInputs(forceDirectionInput, forceDirectionSlider);
    syncInputs(velocityMagnitudeInput, velocityMagnitudeSlider);
    syncInputs(velocityDirectionInput, velocityDirectionSlider);

    // Populate text content
    populateExplanations();

    // Initial draw
    updateSimulation();
}

// Run the simulation
init();
