// ScoreManager.js
import * as THREE from './node_modules/three/build/three.module.js';
import { FontLoader } from './node_modules/three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from './node_modules/three/examples/jsm/geometries/TextGeometry.js';

class ScoreManager {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.scoreMesh = null;
        this.fontLoader = new FontLoader();

        // Initialize the score display
        this.create3DScore();
    }

    create3DScore() {
        this.fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            this.update3DScore(this.score, font); // Pass font to update3DScore
        }, undefined, (error) => {
            console.error('Error loading font:', error);
        });
    }

    update3DScore(newScore, font) {
        this.score = newScore;

        // Remove the previous score mesh if it exists
        if (this.scoreMesh) {
            this.scene.remove(this.scoreMesh);
        }

        // Create new score geometry with the updated score
        const geometry = new TextGeometry(`Score: ${this.score}`, {
            font: font,
            size: 1, // Adjust size for better VR readability
            height: 0.1,
        });

        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.scoreMesh = new THREE.Mesh(geometry, material);

        // Add score to the scene as a 3D object
        this.scene.add(this.scoreMesh);

        // Position score above the player's view
        this.scoreMesh.position.set(0, 15, -3);
    }

    onPinKnockedDown() {
        // Increment score by 10 when a pin is knocked down
        this.update3DScore(this.score + 10, this.fontLoader.font); // Pass current font
    }
}

// Export ScoreManager as the default export
export default ScoreManager;
