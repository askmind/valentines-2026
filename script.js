const startBtn = document.getElementById("startBtn");
const gameSection = document.getElementById("game");
const finalSection = document.getElementById("final");
const playArea = document.getElementById("playArea");
const counter = document.getElementById("counter");
const popup = document.getElementById("popup");
const finalText = document.getElementById("finalText");
const yesBtn = document.getElementById("yesBtn"); // Grab the Yes button element
const noBtn = document.getElementById("noBtn"); // Grab the No button element
const finalButtons = document.getElementById("finalButtons"); // Grab the container (used for positioning bounds)
const yesResult = document.getElementById("yesResult"); // Grab the result text area shown after “Yes”


const TARGET = 1;
let score = 0;
let running = false;
let spawnTimer = null;
let noDodgeTimeout = null; // Stores the timer that starts the No button dodging after 3 seconds
let noDodgeInterval = null; // Stores the repeating timer that keeps moving the No button
let yesGrowInterval = null; // Stores the repeating timer that keeps growing the Yes button
let yesScale = 1; // Current scale factor for the Yes button (1 = normal size)


const messages = [
  "You make my life brighter ✨",
  "I love your laugh so much 😭💖",
  "You’re my favorite person, always.",
  "I still get excited to see you.",
  "You’re cute. Like… unfairly cute.",
  "Thank you for being you.",
  "I’m proud of you 🫶",
  "You feel like home.",
  "You + me = my best days",
  "Happy Valentine’s Day 💘",
];

function showPopup(text) {
  popup.textContent = text;
  popup.classList.remove("hidden");
  clearTimeout(showPopup._t);
  showPopup._t = setTimeout(() => popup.classList.add("hidden"), 1200);
}
function resetFinalButtons() { 
  yesScale = 1; // Reset Yes button size back to normal
  yesBtn.style.transform = "scale(1)"; // Visually reset its scale

  yesResult.classList.add("hidden"); // Hide success message
  yesResult.textContent = ""; // Clear old message text

  // Stop any old timers (important if game restarts)
  clearTimeout(noDodgeTimeout); // Stop delayed dodge
  clearInterval(noDodgeInterval); // Stop dodge loop
  clearInterval(yesGrowInterval); // Stop growth loop

  // Make sure No button is visible again
  noBtn.classList.remove("hidden"); // Ensure it is shown

  // First, place No roughly in the middle (temporary position)
  noBtn.style.left = "50%"; // Center horizontally
  noBtn.style.top = "55%"; // Slightly below center
  noBtn.style.transform = "translate(-50%, -50%)"; // Proper centering transform

  // IMPORTANT:
  // Immediately move it once using our safe-placement logic
  // This guarantees it will not overlap with the Yes button at start
  setTimeout(() => {
    moveNoButtonRandomly(); // Force one safe reposition
  }, 0); 
}


function moveNoButtonRandomly() { 
  // Get container size (this defines our movement area)
  const containerRect = finalButtons.getBoundingClientRect(); 

  // Get current Yes button position and size (we want to avoid this area)
  const yesRect = yesBtn.getBoundingClientRect(); 

  // Get No button size (so we keep it fully inside container)
  const noRect = noBtn.getBoundingClientRect(); 

  const padding = 12; // Small margin from container edges
  const safeBuffer = 20; // Extra buffer space around Yes button to avoid overlap

  // Calculate maximum allowed x/y positions inside container
  const maxX = containerRect.width - noRect.width - padding * 2; 
  const maxY = containerRect.height - noRect.height - padding * 2; 

  // If container is too small (very unlikely), stop movement
  if (maxX <= 0 || maxY <= 0) return;

  let tries = 0; // Count how many attempts we've made
  let foundSafeSpot = false; // Track whether we found a valid position

  while (!foundSafeSpot && tries < 25) { 
    // Try up to 25 random positions before giving up

    const x = padding + Math.random() * maxX; // Random X position
    const y = padding + Math.random() * maxY; // Random Y position

    // Calculate where the No button would be in viewport coordinates
    const proposedLeft = containerRect.left + x; 
    const proposedTop = containerRect.top + y;

    // Check if proposed No position overlaps with Yes button
    const overlaps =
      proposedLeft < yesRect.right + safeBuffer &&
      proposedLeft + noRect.width > yesRect.left - safeBuffer &&
      proposedTop < yesRect.bottom + safeBuffer &&
      proposedTop + noRect.height > yesRect.top - safeBuffer;

    if (!overlaps) {
      // If it does NOT overlap with Yes button, we accept this position
      noBtn.style.left = `${x}px`; // Position horizontally inside container
      noBtn.style.top = `${y}px`; // Position vertically inside container
      noBtn.style.transform = "translate(0, 0)"; // Remove centering transform

      foundSafeSpot = true; // Mark as successful
    }

    tries++; // Increase attempt counter
  }
}

function startFinalButtonChaos() { // Starts the “No dodges + Yes grows” behavior
  resetFinalButtons(); // Ensure we start clean every time

  // After 3 seconds, begin moving the No button repeatedly
  noDodgeTimeout = setTimeout(() => { // Delay before the No button starts dodging
    moveNoButtonRandomly(); // Move once immediately when dodging starts
    noDodgeInterval = setInterval(moveNoButtonRandomly, 650); // Keep moving every ~0.65s
  }, 3000); // 3000ms = 3 seconds

  // Grow the Yes button gradually until clicked
  yesGrowInterval = setInterval(() => { // Run a small growth step repeatedly
    yesScale = Math.min(yesScale + 0.125, 5); // Increase scale but cap it so it doesn’t become ridiculous
    yesBtn.style.transform = `scale(${yesScale})`; // Apply the scale transform to visually grow the button
  }, 500); // Grow every 0.5 seconds (tweak for faster/slower)
}


function spawnHeart() {
  // If the game is not running, do nothing
  if (!running) return;

  // Create a new div element that will become a heart
  const heart = document.createElement("div");
  heart.className = "heart";   // Apply CSS styling
  heart.textContent = "💗";    // The visible heart emoji

  // Get the size of the play area (so we can animate correctly)
  const rect = playArea.getBoundingClientRect();

  // Random horizontal position (leave some margin so it doesn't clip edges)
  const x = 20 + Math.random() * (rect.width - 40);

  // Start slightly BELOW the visible play area
  const startY = rect.height + 40;

  // Position the heart using absolute positioning
  heart.style.left = `${x}px`;
  heart.style.top = `${startY}px`;

  // How long the heart should float upward (random for variation)
  const duration = 2500 + Math.random() * 1200;

  // How far upward the heart should travel
  // We move it the full height of the play area + extra so it fully exits
  const travel = rect.height + 120;

  // When the heart is tapped
  heart.addEventListener("pointerdown", () => {
    if (!running) return;

    // Increase score
    score += 1;

    // Update score display
    counter.textContent = `${score} / ${TARGET}`;

    // Show one of your love messages
    showPopup(messages[(score - 1) % messages.length]);

    // Remove the heart immediately after being tapped
    heart.remove();

    // If enough hearts collected → end game
    if (score >= TARGET) endGame();
  });

  // Add heart to the screen
  playArea.appendChild(heart);

  // Animate the heart floating upward
  const anim = heart.animate(
    [
      // Starting position (fully visible)
      { transform: "translate(-50%, 0)", opacity: 1 },

      // Move upward but stay fully visible until 80% of animation
      { 
        transform: `translate(-50%, -${travel}px)`,
        opacity: 1,
        offset: 0.8  // 80% through animation
      },

      // Final state: same position, but fade out
      { 
        transform: `translate(-50%, -${travel}px)`,
        opacity: 0
      }
    ],
    {
      duration,      // How long animation lasts
      easing: "linear",  // Constant speed
      fill: "forwards"   // Keep final state after animation
    }
  );

  // When animation finishes, remove the heart from the DOM
  anim.onfinish = () => heart.remove();
}

function startGame() {
  score = 0;
  running = true;
  counter.textContent = `${score} / ${TARGET}`;
  startBtn.classList.add("hidden");
  gameSection.classList.remove("hidden");
  finalSection.classList.add("hidden");

  // Spawn hearts regularly
  spawnTimer = setInterval(spawnHeart, 750);
}

function endGame() {
  running = false; // Stop the game loop
  clearInterval(spawnTimer); // Stop spawning hearts
  playArea.innerHTML = ""; // Remove any hearts still on screen

  gameSection.classList.add("hidden"); // Hide the game area
  finalSection.classList.remove("hidden"); // Show the final screen

  finalText.textContent = "You collected all my hearts 💖 Will you be my Valentine?"; // Set the question text

  startFinalButtonChaos(); // Start the No-dodging + Yes-growing behavior
}


startBtn.addEventListener("click", startGame);

yesBtn.addEventListener("click", () => { // When she clicks Yes
  clearTimeout(noDodgeTimeout); // Stop the delayed No-dodge start (if it hasn’t started yet)
  clearInterval(noDodgeInterval); // Stop the No button from moving (if it is moving)
  clearInterval(yesGrowInterval); // Stop the Yes button from growing

  yesBtn.style.transform = "scale(1)"; // Optionally reset scale so it doesn’t stay huge
  yesResult.textContent = "YAYYY 💘 I love you! Happy Valentine’s Day 🫶"; // Show your success message
  yesResult.classList.remove("hidden"); // Make the message visible

  // Optional: hide the No button after she says yes
  noBtn.classList.add("hidden"); // Remove the No button so the screen feels “resolved”
});

noBtn.addEventListener("pointerdown", () => { // If she tries to tap No
  moveNoButtonRandomly(); // Immediately jump away
});
