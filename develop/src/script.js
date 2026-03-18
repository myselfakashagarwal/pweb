// Canvas
const canvas = document.querySelector("canvas.webgl");

// Constants
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Check device type (with safe fallback)
var deviceType = "desktop";
if (typeof device !== 'undefined') {
  if (device.mobile()) {
    deviceType = "mobile";
  } else if (device.tablet()) {
    deviceType = "tablet";
  }
} else {
  // Fallback if device library isn't ready
  if (window.innerWidth <= 768) {
    deviceType = "mobile";
  }
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
    // Adjust model scale and position based on device type
    if (deviceType === "mobile") {
      model.scale.set(2.5, 2.5, 2.5);
      model.position.set(0, -4, 0);
    } else if (deviceType === "tablet") {
      model.scale.set(3, 3, 3);
      model.position.set(0, -5, 0);
    } else {
      model.scale.set(4, 4, 4);
      model.position.set(0, -6, 0);
    }

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
const light = new THREE.AmbientLight("#2596be", 0.5);
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
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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

// Update active navigation link based on current section
function updateActiveNavLink() {
  const sections = document.querySelectorAll('.content-section');
  const navLinks = document.querySelectorAll('.nav-link');
  const scrollY = window.scrollY;

  // If we're at the top (home section), remove all active states
  if (scrollY < window.innerHeight * 0.5) {
    navLinks.forEach(link => link.classList.remove('active'));
    return;
  }

  let currentSection = null;

  // Find which section is currently most visible
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionBottom = rect.bottom;
    const sectionMiddle = sectionTop + rect.height / 2;

    // Check if section middle is in the viewport middle area
    if (sectionMiddle > 0 && sectionMiddle < window.innerHeight) {
      currentSection = section;
    }
  });

  // Update active state on nav links
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (currentSection) {
      const href = link.getAttribute('href');
      const sectionId = currentSection.getAttribute('id');
      if (href === `#${sectionId}`) {
        link.classList.add('active');
      }
    }
  });
}

// Fade effect for sections and centered text on scroll
function handleScrollFade() {
  const scrollY = window.scrollY;
  const centerText = document.querySelector('.centered-text');
  const sections = document.querySelectorAll('.content-section');

  // Fade out centered text after scrolling starts
  if (scrollY > 100) {
    centerText.classList.add('fade-out');
  } else {
    centerText.classList.remove('fade-out');
  }

  // Fade in sections as they come into view
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const sectionMiddle = rect.top + rect.height / 2;
    const windowMiddle = window.innerHeight / 2;

    // Section is visible when its middle is near the viewport middle
    if (Math.abs(sectionMiddle - windowMiddle) < window.innerHeight / 2) {
      section.classList.add('visible');
    } else {
      section.classList.remove('visible');
    }

    // Update nav link underline based on section scroll progress
    updateNavLinkProgress(section);
  });

  // Update active nav link
  updateActiveNavLink();
}

// Update nav link underline width based on section visibility progress
function updateNavLinkProgress(section) {
  const sectionId = section.getAttribute('id');
  if (!sectionId) return;

  // Find the corresponding nav link
  const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
  if (!navLink) return;

  const rect = section.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  // Calculate how much of the section is visible
  let visiblePercent = 0;

  if (rect.top < windowHeight && rect.bottom > 0) {
    // Section is at least partially visible
    const sectionHeight = rect.height;
    const visibleTop = Math.max(0, -rect.top);
    const visibleBottom = Math.min(sectionHeight, windowHeight - rect.top);
    const visibleHeight = visibleBottom - visibleTop;

    visiblePercent = Math.max(0, Math.min(100, (visibleHeight / windowHeight) * 100));
  }

  // Set the underline width as a CSS custom property on the nav link
  navLink.style.setProperty('--progress', `${visiblePercent}%`);
}

// Add scroll listener
window.addEventListener('scroll', handleScrollFade);
// Initial check
handleScrollFade();
