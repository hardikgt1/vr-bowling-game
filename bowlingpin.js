import * as THREE from './node_modules/three/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.18.0/dist/cannon-es.js';
import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js';

let pins = [], pinBodies = [];

// Define the bowling pin arrangement (relative coordinates)
const pinPositions = [
    [0, 0, 0],          // First pin (center)
    [-0.6, 0, -1.2],    // Second row (left)
    [0.6, 0, -1.2],     // Second row (right)
    // Remove the remaining positions to reduce the number of pins
];

function loadPins(scene, world, ballBody, debugRenderer) {
    const loader = new FBXLoader();
    loader.load('./Bowlingpin/Multiplepins.fbx', function (object) {
        pinPositions.forEach((position, index) => {
            let pin = object.clone();
            pin.scale.set(0.1, 0.1, 0.1);

            // Set the pin to its designated position based on the bowling arrangement
            pin.position.set(position[0], 1, -50 + position[2]);  // Adjust depth (-50)
            scene.add(pin);
            pins.push(pin);

            // Create physics bodies for each pin
            const pinShape = new CANNON.Cylinder(0.3, 0.3, 1.5, 12);
            const pinBody = new CANNON.Body({ mass: 1 });
            pinBody.addShape(pinShape);
            pinBody.position.set(position[0], 1, -50 + position[2]); // Same position for physics body
            pinBody.quaternion.setFromEuler(0, Math.random() * Math.PI * 2, 0);  // Random rotation
            world.addBody(pinBody);
            pinBodies.push(pinBody);

            // Optionally, add debug shape for each pin (useful for development, but can impact performance)
            if (debugRenderer) {
                debugRenderer.add(pinBody, {
                    color: 0xff0000,  // Red color for debug
                    opacity: 0.5,     // Semi-transparent
                });
            }

            // Collision detection for pin destruction
            pinBody.addEventListener('collide', function(event) {
                // If the ball collides with the pin, destroy the pin
                if (event.body === ballBody) {
                    setTimeout(() => destroyPin(index), 0); // Delay destruction to avoid conflict
                }
            });
        });
    });
}


// Sync pins' physics bodies with their 3D models
function syncPins() {
    pins.forEach((pin, index) => {
        if (pinBodies[index]) {
            pin.position.copy(pinBodies[index].position);
            pin.quaternion.copy(pinBodies[index].quaternion);
        }
    });
}

// Function to destroy a pin
function destroyPin(index) {
    if (pins[index] && pinBodies[index]) {
        // Remove the pin from the scene and the physics world
        scene.remove(pins[index]);
        world.removeBody(pinBodies[index]);

        // Optionally, remove the debug shape if using debugRenderer
        if (debugRenderer) {
            debugRenderer.remove(pinBodies[index]);
        }

        // Remove from arrays
        pins.splice(index, 1);
        pinBodies.splice(index, 1);
    }
}

// Export functions and pins array for external access
export { loadPins, syncPins, destroyPin, pins };
