// Mastermind game logic
import { generatePalette, generateSecret, calculateFeedback } from './logic.js';

const configSection = document.getElementById('config-section');
const gameSection = document.getElementById('game-section');
const configForm = document.getElementById('configForm');
const paletteDiv = document.getElementById('palette');
const boardDiv = document.getElementById('board');
const messageDiv = document.getElementById('message');
const newGameBtn = document.getElementById('newGame');

let config = {};
let secret = [];
let paletteColors = [];
let currentRow = 0;
let colorPicker = null;

// Handle configuration form submission
configForm.addEventListener('submit', e => {
  e.preventDefault();
  const numPegs = parseInt(document.getElementById('numPegs').value, 10);
  const numColors = parseInt(document.getElementById('numColors').value, 10);
  const allowDuplicates = document.getElementById('allowDuplicates').checked;
  const maxGuesses = parseInt(document.getElementById('maxGuesses').value, 10) || 10;

  if (numPegs < 1 || numPegs > 20 || numColors < 2 || numColors > 20 || maxGuesses < 1) {
    alert('Please enter valid configuration values.');
    return;
  }
  if (!allowDuplicates && numColors < numPegs) {
    alert('Number of colors must be at least number of pegs when duplicates are disallowed.');
    return;
  }

  config = { numPegs, numColors, allowDuplicates, maxGuesses };
  startGame();
});

// Reset to configuration
newGameBtn.addEventListener('click', () => {
  boardDiv.innerHTML = '';
  paletteDiv.innerHTML = '';
  messageDiv.textContent = '';
  gameSection.classList.add('hidden');
  configSection.classList.remove('hidden');
});

// Initialize a new game
function startGame() {
  paletteColors = generatePalette(config.numColors);
  renderPalette(paletteColors);
  secret = generateSecret(config);
  renderBoard();
  currentRow = 0;
  gameSection.classList.remove('hidden');
  configSection.classList.add('hidden');
}

// Generate visual palette
function renderPalette(colors) {
  paletteDiv.innerHTML = '';
  colors.forEach((color, idx) => {
    const sw = document.createElement('div');
    sw.className = 'color';
    sw.style.background = color;
    sw.title = idx;
    paletteDiv.appendChild(sw);
  });
}

// Create the guess board
function renderBoard() {
  boardDiv.innerHTML = '';
  for (let r = 0; r < config.maxGuesses; r++) {
    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.row = r;

    for (let c = 0; c < config.numPegs; c++) {
      const peg = document.createElement('div');
      peg.className = 'peg';
      peg.dataset.index = c;
      peg.addEventListener('click', handlePegClick);
      if (r !== 0) peg.style.pointerEvents = 'none';
      row.appendChild(peg);
    }

    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    row.appendChild(feedback);

    const submit = document.createElement('button');
    submit.textContent = 'Submit Guess';
    submit.disabled = true;
    submit.addEventListener('click', submitGuess);
    if (r !== 0) submit.disabled = true;
    row.appendChild(submit);

    boardDiv.appendChild(row);
  }
}

// Handle peg click to open color picker
function handlePegClick(e) {
  const peg = e.currentTarget;
  const rowIndex = parseInt(peg.parentElement.dataset.row, 10);
  if (rowIndex !== currentRow) return;

  removeColorPicker();
  colorPicker = document.createElement('div');
  colorPicker.className = 'color-picker';
  paletteColors.forEach((color, idx) => {
    const sw = document.createElement('div');
    sw.className = 'color';
    sw.style.background = color;
    sw.dataset.color = idx;
    sw.addEventListener('click', () => {
      peg.style.background = color;
      peg.dataset.color = idx;
      removeColorPicker();
      checkRowFilled(rowIndex);
    });
    colorPicker.appendChild(sw);
  });
  document.body.appendChild(colorPicker);
  const rect = peg.getBoundingClientRect();
  colorPicker.style.left = `${rect.left + window.scrollX}px`;
  colorPicker.style.top = `${rect.bottom + window.scrollY}px`;
}

function removeColorPicker() {
  if (colorPicker) {
    colorPicker.remove();
    colorPicker = null;
  }
}

document.addEventListener('click', e => {
  if (colorPicker && !colorPicker.contains(e.target) && !e.target.classList.contains('peg')) {
    removeColorPicker();
  }
});

// Enable submit when row filled
function checkRowFilled(rowIndex) {
  const row = boardDiv.querySelector(`.row[data-row="${rowIndex}"]`);
  const pegs = Array.from(row.querySelectorAll('.peg'));
  const filled = pegs.every(p => p.dataset.color !== undefined);
  const btn = row.querySelector('button');
  btn.disabled = !filled;
}

// Submit a guess and compute feedback
function submitGuess(e) {
  const row = e.currentTarget.parentElement;
  const rowIndex = parseInt(row.dataset.row, 10);
  const guess = Array.from(row.querySelectorAll('.peg')).map(p => parseInt(p.dataset.color, 10));

  const { black, white } = calculateFeedback(guess, secret);
  const feedback = row.querySelector('.feedback');
  for (let i = 0; i < black; i++) feedback.appendChild(createMark('black'));
  for (let i = 0; i < white; i++) feedback.appendChild(createMark('white'));

  row.querySelectorAll('.peg').forEach(p => (p.style.pointerEvents = 'none'));
  e.currentTarget.disabled = true;

  if (black === config.numPegs) {
    messageDiv.textContent = 'You Win!';
    revealSecret();
    endGame();
    return;
  }

  if (rowIndex + 1 >= config.maxGuesses) {
    messageDiv.textContent = 'Game Over';
    revealSecret();
    endGame();
    return;
  }

  currentRow++;
  enableRow(currentRow);
}

// Enable next row for input
function enableRow(index) {
  const row = boardDiv.querySelector(`.row[data-row="${index}"]`);
  row.querySelectorAll('.peg').forEach(p => (p.style.pointerEvents = 'auto'));
  row.querySelector('button').disabled = true;
}

// Reveal the secret code
function revealSecret() {
  const secretDiv = document.createElement('div');
  secretDiv.className = 'secret';
  secret.forEach(idx => {
    const peg = document.createElement('div');
    peg.className = 'peg';
    peg.style.background = paletteColors[idx];
    secretDiv.appendChild(peg);
  });
  messageDiv.appendChild(secretDiv);
}

// Stop all remaining input
function endGame() {
  boardDiv.querySelectorAll('.row').forEach(r => {
    r.querySelectorAll('.peg').forEach(p => (p.style.pointerEvents = 'none'));
    r.querySelector('button').disabled = true;
  });
  removeColorPicker();
}

// Create feedback mark
function createMark(type) {
  const m = document.createElement('div');
  m.className = `mark ${type}`;
  return m;
}
