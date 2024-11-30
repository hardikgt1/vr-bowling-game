import * as THREE from './node_modules/three/build/three.module.js';
import { RGBELoader } from './node_modules/three/examples/jsm/loaders/RGBELoader.js';

function loadHDRBackground(scene, renderer) {
    const rgbeLoader = new RGBELoader();

    // Path to your HDR background file
    const hdrPath = './Bowlingpin/background.hdr';

    rgbeLoader.load(hdrPath, (texture) => {
        // Use PMREMGenerator for better reflections and lighting
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();

        texture.mapping = THREE.EquirectangularReflectionMapping;

        // Generate environment map
        const hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);

        // Set the HDR as both the background and environment for lighting
        scene.background = hdrCubeRenderTarget.texture;
        scene.environment = hdrCubeRenderTarget.texture;

        // Ensure better performance in VR
        texture.dispose();  // Dispose of the texture after using it to free up memory
        pmremGenerator.dispose();  // Dispose of the PMREMGenerator

        console.log("HDR background loaded successfully");
    }, undefined, (error) => {
        console.error("Error loading HDR background:", error);
    });
}

export { loadHDRBackground };
