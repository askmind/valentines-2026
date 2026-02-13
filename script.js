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
  if (!running) return;

  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = "💗";

  const x = Math.random() * 100; // %
  const y = 100 + Math.random() * 10; // start slightly below
  heart.style.left = `${x}%`;
  heart.style.top = `${y}%`;

  const duration = 1800 + Math.random() * 900;

  heart.addEventListener("pointerdown", () => {
    if (!running) return;
    score += 1;
    counter.textContent = `${score} / ${TARGET}`;
    showPopup(messages[(score - 1) % messages.length]);
    heart.remove();

    if (score >= TARGET) endGame();
  });

  playArea.appendChild(heart);

  // Animate upwards
  heart.animate(
    [
      { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
      { transform: "translate(-50%, -140%) scale(1.1)", opacity: 0 },
    ],
    { duration, easing: "linear", fill: "forwards" }
  );

  setTimeout(() => heart.remove(), duration + 50);
}

function startGame() {
  score = 0;
  running = true;
  counter.textContent = `${score} / ${TARGET}`;
  startBtn.classList.add("hidden");
  gameSection.classList.remove("hidden");
  finalSection.classList.add("hidden");

  // Spawn hearts regularly
  spawnTimer = setInterval(spawnHeart, 450);
}

function endGame() {
  running = false;
  clearInterval(spawnTimer);
  playArea.innerHTML = "";
  gameSection.classList.add("hidden");
  finalSection.classList.remove("hidden");
  finalText.textContent = "You collected all my hearts 💖 Will you be my Valentine?";
}

startBtn.addEventListener("click", startGame);
