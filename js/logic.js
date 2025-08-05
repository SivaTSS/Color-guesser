export function generatePalette(numColors) {
  const arr = [];
  for (let i = 0; i < numColors; i++) {
    const hue = Math.floor((360 / numColors) * i);
    arr.push(`hsl(${hue}, 70%, 50%)`);
  }
  return arr;
}

export function generateSecret(config) {
  const colors = [...Array(config.numColors).keys()];
  const result = [];
  if (config.allowDuplicates) {
    for (let i = 0; i < config.numPegs; i++) {
      const idx = Math.floor(Math.random() * colors.length);
      result.push(colors[idx]);
    }
  } else {
    const pool = [...colors];
    for (let i = 0; i < config.numPegs; i++) {
      const r = Math.floor(Math.random() * pool.length);
      result.push(pool.splice(r, 1)[0]);
    }
  }
  return result;
}

export function calculateFeedback(guess, secret) {
  let black = 0;
  const secretCounts = {};
  const guessCounts = {};

  for (let i = 0; i < secret.length; i++) {
    if (guess[i] === secret[i]) {
      black++;
    } else {
      secretCounts[secret[i]] = (secretCounts[secret[i]] || 0) + 1;
      guessCounts[guess[i]] = (guessCounts[guess[i]] || 0) + 1;
    }
  }

  let white = 0;
  Object.keys(guessCounts).forEach(color => {
    white += Math.min(guessCounts[color] || 0, secretCounts[color] || 0);
  });

  return { black, white };
}
