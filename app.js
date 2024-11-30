import * as THREE from './node_modules/three/build/three.module.js';
import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.18.0/dist/cannon-es.js';
import { setupCamera, updateControls, getCamera } from './camera.js';
import { loadBall, rollBall, syncBall, getBallObject } from './bowl.js';
import { loadPins, syncPins, destroyPin, pins } from './bowlingpin.js';
import { loadHDRBackground } from './backgroundLoader.js';
import { VRButton } from './node_modules/three/examples/jsm/webxr/VRButton.js';

let scene, renderer, world, floor, controllerRight, ballAttached = false;

export function init() {
    // Create physics world
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);

    // Create scene
    scene = new THREE.Scene();

    // Create renderer with WebXR enabled
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Add XR button to enter VR mode
    document.body.appendChild(VRButton.createButton(renderer));

    // Load HDR background
    loadHDRBackground(scene, renderer);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5).normalize();
    scene.add(directionalLight);

    // Create floor
    const loader = new FBXLoader();
    loader.load('./Bowlingpin/Bowlingfloor.fbx', function (object) {
        floor = object;
        floor.scale.set(0.1, 0.1, 0.1);
        floor.position.set(-1, -1, -1);
        scene.add(floor);

        const floorShape = new CANNON.Plane();
        const floorBody = new CANNON.Body({ mass: 0 });
        floorBody.addShape(floorShape);
        floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        world.addBody(floorBody);
    });

    // Add background planes (3 walls: back, left, right)
    addBackgroundPlanes();

    // Camera, ball, and pins setup
    loadBall(scene, world);
    loadPins(scene, world);
    setupCamera(scene, renderer);

    // Setup VR controllers
    setupVRControllers();

    // Start the WebXR animation loop
    renderer.setAnimationLoop(animate);
}

function addBackgroundPlanes() {
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x00008B, side: THREE.DoubleSide });

    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(20, 10);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 1, -80);
    scene.add(backWall);

    // Left wall
    const leftWallGeometry = new THREE.PlaneGeometry(120, 5);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-11, 1, -40);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);

    // Right wall
    const rightWallGeometry = new THREE.PlaneGeometry(120, 5);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.set(9, 1, -40);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);
}

function setupVRControllers() {
    // Create right-hand controller
    controllerRight = renderer.xr.getController(0);
    scene.add(controllerRight);

    // Attach ball when right controller is connected
    controllerRight.addEventListener('selectstart', () => {
        attachBallToController();
    });

    // Detach and roll the ball when squeezing
    controllerRight.addEventListener('squeezestart', () => {
        if (ballAttached) {
            rollBallFromController();
        }
    });
}

function attachBallToController() {
    const ball = getBallObject();
    if (ball && !ballAttached) {
        controllerRight.add(ball);
        ball.position.set(0, 0, -0.2); // Offset from the controller
        ballAttached = true;
    }
}

function rollBallFromController() {
    const ball = getBallObject();
    if (ball && ballAttached) {
        // Detach the ball from the controller
        controllerRight.remove(ball);
        scene.add(ball);

        // Calculate velocity towards the pins
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(controllerRight.quaternion);
        const velocity = direction.multiplyScalar(10); // Adjust the speed as necessary

        // Roll the ball
        rollBall(velocity);

        ballAttached = false;
    }
}

function animate() {
    // Update physics and render the scene in XR mode
    world.step(1 / 60);

    syncBall();
    syncPins();
    updateControls();

    renderer.render(scene, getCamera());
}

// Ensure init is available globally
window.init = init;
