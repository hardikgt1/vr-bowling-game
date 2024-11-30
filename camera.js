import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';

let camera, controls;

function setupCamera(scene, renderer, bowlingBall) {
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Set the camera's initial position
    camera.position.set(0, 5, 10);

    // Only look at the bowling ball's position if it's defined
    if (bowlingBall) {
        camera.lookAt(bowlingBall.position);
    }

    // Orbit controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2;

    // Event listener to update aspect ratio on window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function updateControls(bowlingBall) {
    // Smoothly track the bowling ball's position if it's defined
    if (bowlingBall) {
        const targetPosition = new THREE.Vector3().copy(bowlingBall.position);

        // You can adjust the lookAt transition speed
        camera.position.lerp(new THREE.Vector3(targetPosition.x, camera.position.y, camera.position.z), 0.1);

        camera.lookAt(targetPosition);
    }
    controls.update();
}

function getCamera() {
    return camera;
}

export { setupCamera, updateControls, getCamera };
