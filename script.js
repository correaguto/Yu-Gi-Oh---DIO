// LP
let lpPlayer = 4000;
let lpCpu = 4000;

// Fases
const PHASES = ["DRAW", "MAIN", "BATTLE", "END"];
let currentPhaseIndex = 0;
let playerTurn = true;

const playerField = document.getElementById("player-field");
const cpuField = document.getElementById("cpu-field");
const hand = document.getElementById("hand");
const log = document.getElementById("log");
const nextBtn = document.getElementById("next-phase-btn");

nextBtn.onclick = nextPhase;

function logMsg(msg) {
  log.innerHTML += msg + "<br>";
  log.scrollTop = log.scrollHeight;
}

// Deck com cartas oficiais
const deck = [
  { name: "Dark Magician", atk: 2500, def: 2100, img: "assets/cartas/dark-magician.jpg" },
  { name: "Blue-Eyes White Dragon", atk: 3000, def: 2500, img: "assets/cartas/blue-eyes.jpg" },
  { name: "Kuriboh", atk: 300, def: 200, img: "assets/cartas/kuriboh.jpg" },
  { name: "Summoned Skull", atk: 2500, def: 1200, img: "assets/cartas/summoned-skull.jpg" },
  { name: "Celtic Guardian", atk: 1400, def: 1200, img: "assets/cartas/celtic-guardian.jpg" }
];

// Dar cartas iniciais
function drawCard(target = "player") {
  const card = deck[Math.floor(Math.random() * deck.length)];
  if (target === "player") {
    const cardEl = document.createElement("img");
    cardEl.src = card.img;
    cardEl.classList.add("card");
    cardEl.onclick = () => summon(card, cardEl);
    hand.appendChild(cardEl);
  }
}

// Invocação do jogador
function summon(card, cardEl) {
  if (playerField.children.length >= 5) { logMsg("Campo cheio!"); return; }
  const slot = document.createElement("div");
  slot.classList.add("slot");
  slot.dataset.atk = card.atk;
  slot.dataset.def = card.def;
  const img = document.createElement("img");
  img.src = card.img;
  img.style.width = "80px";
  img.style.height = "120px";
  slot.appendChild(img);
  slot.onclick = () => playerAttack(slot);
  playerField.appendChild(slot);

  hand.removeChild(cardEl);
  logMsg("Você invocou " + card.name + " (" + card.atk + " ATK)");
}

// Ataque do jogador
function playerAttack(attackerSlot) {
  if (!playerTurn || PHASES[currentPhaseIndex] !== "BATTLE") return;
  const cpuSlots = Array.from(cpuField.children);
  if (cpuSlots.length === 0) {
    const atk = parseInt(attackerSlot.dataset.atk);
    lpCpu -= atk;
    logMsg(`Ataque direto! CPU perde ${atk} LP.`);
    updateLP();
    checkWin();
    return;
  }

  const target = cpuSlots[0]; // escolhe primeiro
  animateAttack(attackerSlot, target);
}

// Animação de ataque
function animateAttack(attacker, target) {
  target.classList.add("attack-highlight");
  setTimeout(() => {
    const atk = parseInt(attacker.dataset.atk);
    const def = parseInt(target.dataset.atk);
    if (atk > def) {
      cpuField.removeChild(target);
      lpCpu -= atk - def;
      logMsg(`Você destruiu ${target.querySelector("img").src.split("/").pop()}! CPU perde ${atk - def} LP.`);
    } else if (atk < def) {
      playerField.removeChild(attacker);
      lpPlayer -= def - atk;
      logMsg(`Seu monstro foi destruído! Você perde ${def - atk} LP.`);
    } else {
      playerField.removeChild(attacker);
      cpuField.removeChild(target);
      logMsg("Empate! Ambos os monstros destruídos.");
    }
    target.classList.remove("attack-highlight");
    updateLP();
    checkWin();
  }, 500);
}

// LP
function updateLP() {
  document.getElementById("lp-player").textContent = lpPlayer;
  document.getElementById("lp-cpu").textContent = lpCpu;
  document.getElementById("lp-player-bar").style.width = Math.max((lpPlayer / 4000) * 100, 0) + "%";
  document.getElementById("lp-cpu-bar").style.width = Math.max((lpCpu / 4000) * 100, 0) + "%";
}

// Próxima fase
function nextPhase() {
  currentPhaseIndex++;
  if (currentPhaseIndex >= PHASES.length) { endTurn(); return; }
  logMsg("Fase: " + PHASES[currentPhaseIndex]);
  if (!playerTurn) cpuPlay();
}

// Fim do turno
function endTurn() {
  playerTurn = !playerTurn;
  currentPhaseIndex = 0;
  logMsg(playerTurn ? "Seu turno!" : "Turno da CPU!");
  if (!playerTurn) cpuPlay();
}

// CPU
function cpuPlay() {
  if (PHASES[currentPhaseIndex] === "DRAW") { logMsg("CPU comprou carta."); }
  if (PHASES[currentPhaseIndex] === "MAIN") { cpuSummon(); }
  if (PHASES[currentPhaseIndex] === "BATTLE") { cpuAttack(); }
  nextPhase();
}

function cpuSummon() {
  if (cpuField.children.length >= 5) return;
  const card = deck[Math.floor(Math.random() * deck.length)];
  const slot = document.createElement("div");
  slot.classList.add("slot");
  slot.dataset.atk = card.atk;
  slot.dataset.def = card.def;
  const img = document.createElement("img");
  img.src = card.img;
  img.style.width = "80px";
  img.style.height = "120px";
  slot.appendChild(img);
  cpuField.appendChild(slot);
  logMsg("CPU invocou " + card.name);
}

function cpuAttack() {
  const cpuSlots = Array.from(cpuField.children);
  const playerSlots = Array.from(playerField.children);
  cpuSlots.forEach((cpuSlot) => {
    if (playerSlots.length > 0) {
      const playerSlot = playerSlots[0];
      animateAttack(cpuSlot, playerSlot);
    } else {
      lpPlayer -= parseInt(cpuSlot.dataset.atk);
      logMsg(`CPU atacou direto! Você perde ${cpuSlot.dataset.atk} LP.`);
      updateLP();
      checkWin();
    }
  });
}

// Checa vitória/derrota
function checkWin() {
  if (lpPlayer <= 0) { alert("Você perdeu!"); resetGame(); }
  else if (lpCpu <= 0) { alert("Você venceu!"); resetGame(); }
}

// Reset
function resetGame() {
  playerField.innerHTML = "";
  cpuField.innerHTML = "";
  hand.innerHTML = "";
  lpPlayer = 4000;
  lpCpu = 4000;
  currentPhaseIndex = 0;
  playerTurn = true;
  log.innerHTML = "";
  for (let i = 0; i < 5; i++) drawCard();
  updateLP();
}

// Início
for (let i = 0; i < 5; i++) drawCard();
updateLP();
logMsg("Turno inicial! Fase DRAW.");
// Sons
const summonSound = new Audio("assets/sounds/summon.mp3");
const attackSound = new Audio("assets/sounds/attack.mp3");

// Atualiza função summon para tocar som e borda
function summon(card, cardEl) {
  if (playerField.children.length >= 5) { logMsg("Campo cheio!"); return; }
  const slot = document.createElement("div");
  slot.classList.add("slot");
  slot.dataset.atk = card.atk;
  slot.dataset.def = card.def;
  slot.classList.add("attack"); // padrão ataque
  const img = document.createElement("img");
  img.src = card.img;
  img.style.width = "80px";
  img.style.height = "120px";
  slot.appendChild(img);
  slot.onclick = () => chooseTarget(slot); // novo
  playerField.appendChild(slot);

  hand.removeChild(cardEl);
  logMsg("Você invocou " + card.name + " (" + card.atk + " ATK)");
  summonSound.play();
}

// Escolher alvo CPU
let selectedAttacker = null;
function chooseTarget(slot) {
  if (!playerTurn || PHASES[currentPhaseIndex] !== "BATTLE") return;
  if (!selectedAttacker) {
    selectedAttacker = slot;
    slot.style.boxShadow = "0 0 10px yellow";
    logMsg("Selecione o monstro CPU para atacar.");
  } else {
    attackWithAnimation(selectedAttacker, slot);
    selectedAttacker.style.boxShadow = "";
    selectedAttacker = null;
  }
}

// Função de ataque com animação de linha e som
function attackWithAnimation(attacker, target) {
  attackSound.play();

  // Linha animada
  const rect1 = attacker.getBoundingClientRect();
  const rect2 = target.getBoundingClientRect();
  const line = document.createElement("div");
  line.classList.add("attack-line");
  line.style.left = rect1.left + rect1.width / 2 + "px";
  line.style.top = rect1.top + rect1.height / 2 + "px";
  const dx = rect2.left + rect2.width/2 - (rect1.left + rect1.width/2);
  const dy = rect2.top + rect2.height/2 - (rect1.top + rect1.height/2);
  const length = Math.sqrt(dx*dx + dy*dy);
  line.style.height = length + "px";
  line.style.transformOrigin = "top left";
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  line.style.transform = `rotate(${angle}deg)`;
  document.body.appendChild(line);
  setTimeout(() => { document.body.removeChild(line); }, 300);

  // Aplica efeito de flash no alvo
  target.classList.add("attack-highlight");
  setTimeout(() => {
    const atk = parseInt(attacker.dataset.atk);
    const def = parseInt(target.dataset.atk);
    if (atk > def) {
      cpuField.removeChild(target);
      lpCpu -= atk - def;
      logMsg(`Você destruiu ${target.querySelector("img").src.split("/").pop()}! CPU perde ${atk - def} LP.`);
    } else if (atk < def) {
      playerField.removeChild(attacker);
      lpPlayer -= def - atk;
      logMsg(`Seu monstro foi destruído! Você perde ${def - atk} LP.`);
    } else {
      playerField.removeChild(attacker);
      cpuField.removeChild(target);
      logMsg("Empate! Ambos os monstros destruídos.");
    }
    target.classList.remove("attack-highlight");
    updateLP();
    checkWin();
  }, 500);
}
