export const XP_THRESHOLDS = [0, 200, 500, 900, 1400, 2000];

export const getLevelFromXp = (xp = 0) => {
  const safeXp = Math.max(0, Number(xp) || 0);
  const lastThreshold = XP_THRESHOLDS[XP_THRESHOLDS.length - 1];

  if (safeXp < lastThreshold) {
    for (let i = XP_THRESHOLDS.length - 1; i >= 0; i -= 1) {
      if (safeXp >= XP_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  const extra = safeXp - lastThreshold;
  return 6 + Math.floor(extra / 700);
};

export const getLevelStartXp = (level = 1) => {
  const safeLevel = Math.max(1, Number(level) || 1);

  if (safeLevel <= 6) {
    return XP_THRESHOLDS[safeLevel - 1] ?? 0;
  }

  return XP_THRESHOLDS[XP_THRESHOLDS.length - 1] + 700 * (safeLevel - 6);
};

export const getNextLevelXp = (level = 1) => {
  const safeLevel = Math.max(1, Number(level) || 1);

  if (safeLevel < 6) {
    return XP_THRESHOLDS[safeLevel] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  }

  return XP_THRESHOLDS[XP_THRESHOLDS.length - 1] + 700 * (safeLevel - 5);
};
