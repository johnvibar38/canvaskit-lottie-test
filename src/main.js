import "./style.css";

let animation = null;
let playing = false;
let lastTime = 0;

// Initialize CanvasKit
const CanvasKitInit = window.CanvasKitInit;
const ckLoaded = CanvasKitInit({
  locateFile: (file) => `/res/${file}`,
});

async function initLottiePlayer() {
  try {
    const CanvasKit = await ckLoaded;
    console.log("CanvasKit loaded successfully");

    const canvas = document.getElementById("canvas");

    // Set canvas size to match container or viewport
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Initialize surface
    const surface = CanvasKit.MakeWebGLCanvasSurface(canvas);
    if (!surface) {
      throw new Error("Could not make surface");
    }
    console.log("Surface created successfully");

    // Load the Lottie JSON
    const response = await fetch("/animation_02.json");
    const jsonData = await response.json();
    console.log("Animation JSON loaded");

    // Create the animation using MakeManagedAnimation
    animation = CanvasKit.MakeManagedAnimation(JSON.stringify(jsonData));
    if (!animation) {
      throw new Error("Could not create animation");
    }
    console.log("Animation created successfully");

    let currentTime = 0;

    // Animation loop
    function frame(now) {
      if (!lastTime) {
        lastTime = now;
      }
      const delta = now - lastTime;
      lastTime = now;

      if (playing) {
        currentTime += delta;
        if (currentTime >= animation.duration() * 1000) {
          currentTime = 0;
        }
        animation.seek(currentTime / 1000);
      }

      // Draw the frame
      const canvas = surface.getCanvas();
      canvas.clear(CanvasKit.WHITE);

      // Calculate scaling to fit the animation properly
      const animationWidth = jsonData.w;
      const animationHeight = jsonData.h;
      const scale = Math.min(
        containerWidth / animationWidth,
        containerHeight / animationHeight
      );

      // Calculate position to center the animation
      const scaledWidth = animationWidth * scale;
      const scaledHeight = animationHeight * scale;
      const x = (containerWidth - scaledWidth) / 2;
      const y = (containerHeight - scaledHeight) / 2;

      // Save the canvas state
      canvas.save();

      // Apply transformations
      canvas.translate(x, y);
      canvas.scale(scale, scale);

      // Render the animation
      animation.render(canvas);

      // Restore the canvas state
      canvas.restore();
      surface.flush();

      window.requestAnimationFrame(frame);
    }

    // Start the animation loop
    window.requestAnimationFrame(frame);

    // Start playing automatically
    playing = true;
    console.log("Animation playback started");
  } catch (error) {
    console.error("Error initializing Lottie player:", error);
  }
}

// Initialize the player when the page loads
initLottiePlayer();

// Add play/pause functionality
const playPauseButton = document.getElementById("playPause");
playPauseButton.addEventListener("click", () => {
  playing = !playing;
  lastTime = 0;
  playPauseButton.textContent = playing ? "Pause" : "Play";
  console.log("Playback state:", playing ? "playing" : "paused");
});
