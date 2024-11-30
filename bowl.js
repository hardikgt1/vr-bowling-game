import * as THREE from './node_modules/three/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.18.0/dist/cannon-es.js';
import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js';

let ball, ballBody;

function loadBall(scene, world) {
    return new Promise((resolve, reject) => {
        const loader = new FBXLoader();
        loader.load('./Bowlingpin/BowlingBall.fbx', function (object) {
            ball = object;
            ball.scale.set(0.1, 0.1, 0.1);
            ball.position.set(0, 0.5, -5); // Set to the previous pin position (adjust as needed)
            scene.add(ball);

            // Create bowling ball physics body
            const ballShape = new CANNON.Sphere(0.5);
            ballBody = new CANNON.Body({ mass: 5 });
            ballBody.addShape(ballShape);
            ballBody.position.set(0, 0.5, -5); // Same position for physics body
            world.addBody(ballBody);

            resolve(ball); // Resolve the promise with the loaded ball
        }, undefined, function (error) {
            console.error('An error occurred while loading the bowling ball:', error);
            reject(error); // Reject the promise on error
        });
    });
}

// Function to get the ball object
function getBallObject() {
    return ball;
}

// Updated to handle VR input for rolling the ball (modify as needed)
function rollBall() {
    if (ballBody) {
        // Set the initial velocity for the bowling ball (speed could vary based on input)
        ballBody.velocity.set(0, 0, -20);  // Roll the ball forward along the Z-axis
    }
}

function syncBall() {
    if (ball) {
        // Synchronize the position and rotation of the 3D model with the physics body
        ball.position.copy(ballBody.position);
        ball.quaternion.copy(ballBody.quaternion);
    }
}

export { loadBall, rollBall, syncBall, getBallObject };
