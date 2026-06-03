(function() {
  // Interactive 3D Robot Integration using Three.js
  // Renders a high-fidelity glowing red robot logo in real 3D
  // Supports fallbacks if WebGL is unavailable

  // Check if WebGL is supported
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (!isWebGLAvailable() || typeof THREE === 'undefined') {
    console.warn("WebGL or Three.js is not available. Falling back to static SVG logo.");
    return;
  }

  // Global mouse coordinates (-1 to 1)
  const mouse = { x: 0, y: 0 };
  document.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // -------------------------------------------------------------------------
  // Helper to generate a mathematically rounded box geometry
  // -------------------------------------------------------------------------
  function createRoundedBoxGeometry(width, height, depth, radius, segments) {
    const geometry = new THREE.BoxGeometry(width, height, depth, segments, segments, segments);
    const position = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    const w2 = width / 2 - radius;
    const h2 = height / 2 - radius;
    const d2 = depth / 2 - radius;
    
    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);
      
      let x = vertex.x;
      let y = vertex.y;
      let z = vertex.z;
      
      let cx = Math.sign(x) * w2;
      let cy = Math.sign(y) * h2;
      let cz = Math.sign(z) * d2;
      
      let dx = x - cx;
      let dy = y - cy;
      let dz = z - cz;
      
      let len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (len > 0) {
        vertex.x = cx + (dx / len) * radius;
        vertex.y = cy + (dy / len) * radius;
        vertex.z = cz + (dz / len) * radius;
      }
      
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }

  // -------------------------------------------------------------------------
  // Helper to build the Robot 3D Group
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // Helper to generate a mathematically rounded box geometry
  // -------------------------------------------------------------------------
  function createRoundedBoxGeometry(width, height, depth, radius, segments) {
    const geometry = new THREE.BoxGeometry(width, height, depth, segments, segments, segments);
    const position = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    const w2 = width / 2 - radius;
    const h2 = height / 2 - radius;
    const d2 = depth / 2 - radius;
    
    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);
      
      let x = vertex.x;
      let y = vertex.y;
      let z = vertex.z;
      
      let cx = Math.sign(x) * w2;
      let cy = Math.sign(y) * h2;
      let cz = Math.sign(z) * d2;
      
      let dx = x - cx;
      let dy = y - cy;
      let dz = z - cz;
      
      let len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (len > 0) {
        vertex.x = cx + (dx / len) * radius;
        vertex.y = cy + (dy / len) * radius;
        vertex.z = cz + (dz / len) * radius;
      }
      
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }

  // -------------------------------------------------------------------------
  // Helper to build the Robot 3D Group
  // -------------------------------------------------------------------------
  function createRobotModel() {
    const robotGroup = new THREE.Group();

    // Materials Configuration
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f7, // Glossy white ceramic body
      metalness: 0.1,
      roughness: 0.12
    });

    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x111126, // Indigo screen faceplate (matching image)
      metalness: 0.0, // Fully dielectric to eliminate specular reflection "nose" dot
      roughness: 0.95 // Maximum matte to prevent any glare/reflection
    });

    const glowRedMat = new THREE.MeshBasicMaterial({
      color: 0xff2266 // Glowing red/pink (matching image lightning)
    });

    const glowCyanMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff // Glowing cyan (matching image eyes)
    });

    const metalDarkMat = new THREE.MeshStandardMaterial({
      color: 0x222230, // Dark grey antenna base and neck joints
      metalness: 0.8,
      roughness: 0.2
    });

    // 1. Head Assembly (Robot Helmet)
    const headGroup = new THREE.Group();
    headGroup.name = "headGroup";
    
    // Main helmet: smooth horizontal oval helmet (Sphere scaled)
    const helmetGeo = new THREE.SphereGeometry(0.65, 32, 32);
    const helmet = new THREE.Mesh(helmetGeo, bodyMat);
    helmet.scale.set(1.45, 1.0, 1.15);
    headGroup.add(helmet);

    // Visor Shield (Smooth recessed screen faceplate)
    const visorGeo = new THREE.SphereGeometry(0.63, 32, 32);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.scale.set(1.36, 0.92, 1.06);
    visor.position.set(0, -0.02, 0.12); // Pop out slightly forward
    headGroup.add(visor);

    // Eyes: happy curved cyan arches (using TorusGeometry segments, matching uploaded image)
    const eyeGeo = new THREE.TorusGeometry(0.11, 0.026, 8, 24, Math.PI * 0.9);
    
    // Center the torus segment symmetrically
    eyeGeo.rotateZ((Math.PI - Math.PI * 0.9) / 2);

    const leftEye = new THREE.Mesh(eyeGeo, glowCyanMat);
    leftEye.position.set(-0.25, 0.03, 0.77); // Positioned on visor
    leftEye.rotation.z = -0.2; // Tilted outward (clockwise)
    leftEye.name = "leftEye";

    const rightEye = new THREE.Mesh(eyeGeo, glowCyanMat);
    rightEye.position.set(0.25, 0.03, 0.77);
    rightEye.rotation.z = 0.2; // Tilted outward (counter-clockwise)
    rightEye.name = "rightEye";

    headGroup.add(leftEye);
    headGroup.add(rightEye);



    // Extruded Lightning Bolt Antenna on Head
    const boltShape = new THREE.Shape();
    boltShape.moveTo(0, -0.12); // bottom tip
    boltShape.lineTo(0.05, 0.0);
    boltShape.lineTo(0.01, 0.02);
    boltShape.lineTo(0.07, 0.18); // top tip
    boltShape.lineTo(-0.05, 0.04);
    boltShape.lineTo(-0.01, 0.03);
    boltShape.closePath();

    const boltExtrude = {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.008,
      bevelThickness: 0.008
    };

    const boltGeo = new THREE.ExtrudeGeometry(boltShape, boltExtrude);
    boltGeo.center();

    const bolt = new THREE.Mesh(boltGeo, glowRedMat);
    bolt.position.set(0, 0.68, 0); // Position on top of head

    // Small metal base for antenna
    const boltBase = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.08, 8), metalDarkMat);
    boltBase.position.set(0, 0.51, 0);
    headGroup.add(boltBase);
    headGroup.add(bolt);

    // Position head on body
    headGroup.position.set(0, 0.55, 0);
    robotGroup.add(headGroup);

    // 2. Neck Joint
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.12, 16), metalDarkMat);
    neck.position.set(0, 0.06, 0);
    robotGroup.add(neck);

    // 3. Torso (Belly / Egg Body)
    const torsoGroup = new THREE.Group();
    torsoGroup.name = "torsoGroup";

    // Smooth egg-like capsule torso
    const torsoGeo = new THREE.SphereGeometry(0.44, 32, 32);
    const torso = new THREE.Mesh(torsoGeo, bodyMat);
    torso.scale.set(1.0, 1.25, 1.0); // stretch vertically to make egg shape
    torsoGroup.add(torso);



    torsoGroup.position.set(0, -0.36, 0);
    robotGroup.add(torsoGroup);

    // 4. Left Wing Arm (Thicker, bionic shoulder-connected)
    const leftArm = new THREE.Group();
    leftArm.name = "leftArm";
    leftArm.position.set(-0.42, -0.32, 0); // Pivot at shoulder

    const lJoint = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), metalDarkMat);
    leftArm.add(lJoint);

    const lWingGeo = new THREE.SphereGeometry(0.14, 32, 32);
    lWingGeo.scale(1.2, 0.55, 0.55); // fatter and shorter
    const lWing = new THREE.Mesh(lWingGeo, bodyMat);
    lWing.position.set(-0.16, -0.05, 0); // pivot offset
    lWing.rotation.z = -0.2; // default angle down
    leftArm.add(lWing);
    robotGroup.add(leftArm);

    // 5. Right Wing Arm (Thicker, bionic shoulder-connected)
    const rightArm = new THREE.Group();
    rightArm.name = "rightArm";
    rightArm.position.set(0.42, -0.32, 0); // Pivot at shoulder

    const rJoint = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), metalDarkMat);
    rightArm.add(rJoint);

    const rWingGeo = new THREE.SphereGeometry(0.14, 32, 32);
    rWingGeo.scale(1.2, 0.55, 0.55);
    const rWing = new THREE.Mesh(rWingGeo, bodyMat);
    rWing.position.set(0.16, -0.05, 0);
    rWing.rotation.z = 0.2;
    rightArm.add(rWing);
    robotGroup.add(rightArm);

    return robotGroup;
  }

  // -------------------------------------------------------------------------
  // Instance 1: Large Splash Screen Robot
  // -------------------------------------------------------------------------
  function initSplash3D() {
    const container = document.getElementById('splash-robot-3d');
    const fallbackSvg = document.getElementById('splash-logo-svg');
    if (!container || !fallbackSvg) return;

    const width = container.clientWidth || 220;
    const height = container.clientHeight || 220;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    // Neon Red glow lights
    const redGlow1 = new THREE.PointLight(0xff2233, 2.5, 6);
    redGlow1.position.set(0, -0.3, 1.2); // Shifted down near chest to avoid specular reflections on face visor
    scene.add(redGlow1);

    const blueBackLight = new THREE.PointLight(0x00aaff, 1.8, 5);
    blueBackLight.position.set(-1.5, -0.5, -1.5);
    scene.add(blueBackLight);

    // Build model
    const robot = createRobotModel();
    robot.position.y = -0.15; // align center
    scene.add(robot);

    // Extract animated bones
    const head = robot.getObjectByName("headGroup");
    const rightArm = robot.getObjectByName("rightArm");
    const leftArm = robot.getObjectByName("leftArm");

    // Smooth entry scaling
    robot.scale.set(0.01, 0.01, 0.01);
    let revealProgress = 0;

    // Animation Loop
    const clock = new THREE.Clock();
    let animFrameId;

    function animate() {
      animFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Entrance animation
      if (revealProgress < 1.0) {
        revealProgress += 0.018;
        const scaleVal = THREE.MathUtils.lerp(0.01, 1.0, revealProgress);
        robot.scale.set(scaleVal, scaleVal, scaleVal);
      }

      // 1. Slow breathing / floating
      robot.position.y = -0.15 + Math.sin(time * 1.5) * 0.07;
      
      // 2. Mouse tracking for head and upper body
      if (head) {
        // Target rotation values based on mouse position
        const targetRotX = mouse.y * 0.28;
        const targetRotY = mouse.x * 0.35;
        // Smooth interpolation (slerp)
        head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, targetRotX, 0.08);
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, targetRotY, 0.08);
      }

      // 3. Right arm subtle breathing swing
      if (rightArm) {
        rightArm.rotation.z = 0.2 - Math.sin(time * 1.5) * 0.08;
      }

      // Left arm subtle breathing swing
      if (leftArm) {
        leftArm.rotation.z = Math.sin(time * 1.5) * 0.08;
      }

      // Slow torso twist with mouse
      const torso = robot.getObjectByName("torsoGroup");
      if (torso) {
        torso.rotation.y = THREE.MathUtils.lerp(torso.rotation.y, mouse.x * 0.15, 0.06);
      }

      renderer.render(scene, camera);
    }

    animate();

    // Fade UI reveal
    setTimeout(() => {
      container.style.opacity = '1';
      fallbackSvg.style.opacity = '0';
    }, 400);

    // Clean up when element is hidden / destroyed (e.g. splash screen ends)
    const checkSplashObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.style.display === 'none') {
          cancelAnimationFrame(animFrameId);
          renderer.dispose();
          checkSplashObserver.disconnect();
        }
      });
    });
    
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
      checkSplashObserver.observe(splashScreen, { attributes: true, attributeFilter: ['style'] });
    }
  }

  // -------------------------------------------------------------------------
  // Instance 2: Small Sidebar Logo
  // -------------------------------------------------------------------------
  function initSidebar3D() {
    const container = document.getElementById('sidebar-robot-3d');
    const fallbackSvg = document.getElementById('sidebar-logo-svg');
    if (!container || !fallbackSvg) return;

    const width = container.clientWidth || 44;
    const height = container.clientHeight || 44;

    // Scene
    const scene = new THREE.Scene();

    // Camera (Focused tightly on robot head)
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    camera.position.set(0, 0.15, 4.0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(1, 3, 2);
    scene.add(dirLight);

    const redGlow = new THREE.PointLight(0xff2233, 2.0, 4);
    redGlow.position.set(0, -0.2, 0.8); // Shifted down near chest to avoid specular reflections on face visor
    scene.add(redGlow);

    // Build head model (extract headGroup only, no body/arms)
    const fullModel = createRobotModel();
    const head = fullModel.getObjectByName("headGroup");
    head.position.set(0, -0.15, 0); // Center the head in the sidebar frame
    
    const robot = new THREE.Group();
    robot.add(head);
    scene.add(robot);

    // Animation Loop
    const clock = new THREE.Clock();
    let animFrameId;

    function animate() {
      animFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // 1. Slow hover breathing
      robot.position.y = Math.sin(time * 1.2) * 0.03;

      // 2. Slow base rotation
      robot.rotation.y = time * 0.25;

      // 3. Mouse looking offset combined with rotation
      if (head) {
        const targetRotX = mouse.y * 0.2;
        const targetRotY = mouse.x * 0.2;
        head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, targetRotX, 0.08);
        head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, -targetRotY * 0.4, 0.08);
      }

      renderer.render(scene, camera);
    }

    animate();

    // Fade reveal
    setTimeout(() => {
      container.style.opacity = '1';
      fallbackSvg.style.opacity = '0';
    }, 600);
  }

  // -------------------------------------------------------------------------
  // Instance 3: Home Page Mascot Robot
  // -------------------------------------------------------------------------
  function initHome3D() {
    const container = document.getElementById('home-robot-3d');
    const fallbackSvg = document.getElementById('home-logo-svg');
    if (!container || !fallbackSvg) return;

    const width = container.clientWidth || 160;
    const height = container.clientHeight || 160;

    // Scene
    const scene = new THREE.Scene();

    // Camera (Focused tightly on robot head chatbot icon)
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 4.0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    // Neon Red glow lights
    const redGlow1 = new THREE.PointLight(0xff2233, 2.5, 6);
    redGlow1.position.set(0, -0.3, 1.2); // Shifted down near chest to avoid specular reflections on face visor
    scene.add(redGlow1);

    const blueBackLight = new THREE.PointLight(0x00aaff, 1.8, 5);
    blueBackLight.position.set(-1.5, -0.5, -1.5);
    scene.add(blueBackLight);

    // Build head model (extract headGroup only, no body/arms for clean chatbot icon look)
    const fullModel = createRobotModel();
    const head = fullModel.getObjectByName("headGroup");
    head.position.set(0, -0.15, 0); // Center the head in the frame
    
    const robot = new THREE.Group();
    robot.add(head);
    scene.add(robot);

    // Extract animated bones
    const head = robot.getObjectByName("headGroup");
    const rightArm = robot.getObjectByName("rightArm");
    const leftArm = robot.getObjectByName("leftArm");
    const leftEye = robot.getObjectByName("leftEye");
    const rightEye = robot.getObjectByName("rightEye");

    // Breathing phase and multiplier state for "Think" animation
    let breathingPhase = 0;
    let breathingSpeedMultiplier = 1.0;
    let targetBreathingSpeedMultiplier = 1.0;

    // Eye scale state for "Blink" animation
    let eyeScaleY = 1.0;
    let targetEyeScaleY = 1.0;

    // Expose cute animated expressions on window
    let blinkTimeout = null;
    window.triggerHomeRobotBlink = function() {
      targetEyeScaleY = 0.1;
      if (blinkTimeout) clearTimeout(blinkTimeout);
      blinkTimeout = setTimeout(() => {
        targetEyeScaleY = 1.0;
        blinkTimeout = null;
      }, 150);
    };

    let thinkTimeout = null;
    window.triggerHomeRobotThink = function() {
      targetBreathingSpeedMultiplier = 4.0;
      if (thinkTimeout) clearTimeout(thinkTimeout);
      thinkTimeout = setTimeout(() => {
        targetBreathingSpeedMultiplier = 1.0;
        thinkTimeout = null;
      }, 800);
    };

    // Smooth entry scaling
    robot.scale.set(0.01, 0.01, 0.01);
    let revealProgress = 0;

    // Animation Loop
    const clock = new THREE.Clock();
    let animFrameId;

    function animate() {
      animFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);

      // Interpolate breathing speed multiplier (thinking frequency state transition)
      breathingSpeedMultiplier = THREE.MathUtils.lerp(breathingSpeedMultiplier, targetBreathingSpeedMultiplier, 0.1);
      breathingPhase += delta * 1.5 * breathingSpeedMultiplier;

      // Smooth blink interpolation
      eyeScaleY = THREE.MathUtils.lerp(eyeScaleY, targetEyeScaleY, 0.25);
      if (leftEye) leftEye.scale.y = eyeScaleY;
      if (rightEye) rightEye.scale.y = eyeScaleY;

      // Entrance animation
      if (revealProgress < 1.0) {
        revealProgress += 0.018;
        const scaleVal = THREE.MathUtils.lerp(0.01, 1.0, revealProgress);
        robot.scale.set(scaleVal, scaleVal, scaleVal);
      }

      // 1. Slow breathing / floating
      robot.position.y = -0.15 + Math.sin(breathingPhase) * 0.07;
      
      // 2. Mouse tracking for head and upper body
      if (head) {
        // Target rotation values based on mouse position
        const targetRotX = mouse.y * 0.28;
        const targetRotY = mouse.x * 0.35;
        // Smooth interpolation (slerp)
        head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, targetRotX, 0.08);
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, targetRotY, 0.08);
      }

      // 3. Right arm subtle breathing swing
      if (rightArm) {
        rightArm.rotation.z = 0.2 - Math.sin(breathingPhase) * 0.08;
      }

      // Left arm subtle breathing swing
      if (leftArm) {
        leftArm.rotation.z = Math.sin(breathingPhase) * 0.08;
      }

      // Slow torso twist with mouse
      const torso = robot.getObjectByName("torsoGroup");
      if (torso) {
        torso.rotation.y = THREE.MathUtils.lerp(torso.rotation.y, mouse.x * 0.15, 0.06);
      }

      renderer.render(scene, camera);
    }

    animate();

    // Fade UI reveal
    setTimeout(() => {
      container.style.opacity = '1';
      fallbackSvg.style.opacity = '0';
    }, 400);
  }

  // Run initialization after DOMContentLoaded or immediately if already loaded
  function start3D() {
    initSplash3D();
    initSidebar3D();
    initHome3D();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    start3D();
  } else {
    window.addEventListener('DOMContentLoaded', start3D);
  }
})();
