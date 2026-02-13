const startBtn = document.getElementById("startBtn");
const gameSection = document.getElementById("game");
const finalSection = document.getElementById("final");
const playArea = document.getElementById("playArea");
const counter = document.getElementById("counter");
const popup = document.getElementById("popup");
const finalText = document.getElementById("finalText");

const TARGET = 10;
let score = 0;
let running = false;
let spawnTimer = null;

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
  running = false;
  clearInterval(spawnTimer);
  playArea.innerHTML = "";
  gameSection.classList.add("hidden");
  finalSection.classList.remove("hidden");
  finalText.textContent = "You took all my hearts 💖 Be my Valentine?";
}

startBtn.addEventListener("click", startGame);
