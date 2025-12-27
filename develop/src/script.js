// Canvas
const canvas = document.querySelector("canvas.webgl");

// Constants
const sizes = {
  width: window.innerWidth * 1,
  height: window.innerHeight * 1,
};
var deviceType;
if (device.mobile()) {
  deviceType = "mobile";
} else if (device.desktop()) {
  deviceType = "desktop";
} else {
  deviceType = "tablet";
}

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfdfbf7);

// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.001,
  1000000,
);
camera.position.set(0, 0, 0.1);
camera.rotation.set(0.1, 0.1, 0.1);
camera.scale.set(0.01, 0.01, 0.01);
scene.add(camera);

// Controls
const controls = new THREE.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.enableRotate = true;
controls.maxDistance = 1000;

// Load 3D model
const gltf_loader = new THREE.GLTFLoader();
let model;
gltf_loader.load(
  "./static/model/scene.gltf",
  (gltf) => {
    model = gltf.scene;
    model.scale.set(4, 4, 4);
    model.position.set(0, -6, 0);
    //scene.add(model);
    model.rotation.y = Math.PI + 0.5;

    // Make model monochrome (black)
    model.traverse((node) => {
      if (node.isMesh) {
        node.material.color.set(0x000000);
      }
    });
  },
  // Progress callback
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  // Error callback
  (error) => {
    console.error("An error happened loading the model:", error);
  },
);

// Ambient light
const light = new THREE.AmbientLight("#ffffff", 0.5);
scene.add(light);

// Environment cube
const environmentGeometry = new THREE.BoxBufferGeometry(40, 40, 50, 2, 2, 2);
const environmentMaterial = new THREE.MeshBasicMaterial({
  wireframe: true,
  side: THREE.BackSide,
  color: "black",
});
const environmentCube = new THREE.Mesh(
  environmentGeometry,
  environmentMaterial,
);
scene.add(environmentCube);



// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.max(window.devicePixelRatio, 2));

// Render and animate
const clock = new THREE.Clock();
const tick = () => {

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

// Start the animation
tick();

const resize = () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

window.addEventListener("resize", resize);
