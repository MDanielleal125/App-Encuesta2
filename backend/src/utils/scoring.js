function mapScoreToPoints(rawScore) {
  const value = Number(rawScore);

  if (value >= 1 && value <= 2) return 1;
  if (value >= 3 && value <= 4) return 2;
  if (value >= 5 && value <= 6) return 3;
  if (value >= 7 && value <= 8) return 4;
  if (value >= 9 && value <= 10) return 5;

  throw new Error('Puntuación fuera de rango (1-10)');
}

module.exports = {
  mapScoreToPoints,
};

