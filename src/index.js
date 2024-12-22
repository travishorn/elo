/**
 * @typedef {Object} KFactorRule
 * @property {number} value - K-factor value for this rule
 * @property {Object} [conditions] - Optional conditions that must be met
 * @property {number} [conditions.maxGames] - Maximum games played threshold
 * @property {number} [conditions.minGames] - Minimum games played threshold
 * @property {number} [conditions.maxRating] - Maximum rating threshold
 * @property {number} [conditions.minRating] - Minimum rating threshold
 */

/**
 * @typedef {Object} KFactorConfig
 * @property {number} default - Default K-factor value when no rules match
 * @property {KFactorRule[]} rules - Array of rules to determine K-factor
 */

/** @type {KFactorConfig} */
const defaultKFactorConfig = {
  default: 20,
  rules: [
    {
      value: 40,
      conditions: {
        maxGames: 30,
      },
    },
    {
      value: 10,
      conditions: {
        minRating: 2400,
      },
    },
  ],
};

/**
 * @typedef {Object} Player
 * @property {number} [rating=1000] - Current rating of the player
 * @property {number} [gamesPlayed=0] - Number of games played by the player
 */

/**
 * Calculates the expected probability of winning for a player against an opponent
 * @param {Object} config - Configuration object
 * @param {Player} [config.player] - Player object containing rating
 * @param {Player} [config.opponent] - Opponent object containing rating
 * @param {number} [config.scalingFactor=400] - Scaling factor for the rating difference
 * @returns {number} Expected probability of winning (between 0 and 1)
 */
export function winProbability({
  player = {},
  opponent = {},
  scalingFactor = 400,
}) {
  const playerRating = player.rating ?? 1000;
  const opponentRating = opponent.rating ?? 1000;

  return (
    1 / (1 + Math.pow(10, (opponentRating - playerRating) / scalingFactor))
  );
}

/**
 * @typedef {Object} RatingCalculationConfig
 * @property {Player} [player] - Current rating of the player
 * @property {Player} [opponent] - Current rating of the opponent
 * @property {number} score - Actual score (1 for win, 0.5 for draw, 0 for loss)
 * @property {KFactorConfig} [kFactorConfig=defaultKFactorConfig] - Configuration object for K-factor calculations
 * @property {number} [scalingFactor=400] - Scaling factor for the rating difference
 */

/**
 * Calculates new Elo ratings for two players after a match
 * @param {RatingCalculationConfig} config - Configuration object for rating calculations
 * @returns {number} New rating for the player
 */
export function newRating(config) {
  const {
    kFactorConfig = defaultKFactorConfig,
    player = {},
    opponent = {},
  } = config;
  const playerRating = player.rating ?? 1000;
  const gamesPlayed = player.gamesPlayed ?? 0;

  // Find the first matching rule, or use default if none match
  const matchingRule = kFactorConfig.rules.find(
    (/** @type {KFactorRule} */ rule) => {
      if (!rule.conditions) return true;

      const { maxGames, minGames, maxRating, minRating } = rule.conditions;

      if (maxGames !== undefined && gamesPlayed >= maxGames) return false;
      if (minGames !== undefined && gamesPlayed < minGames) return false;
      if (maxRating !== undefined && playerRating >= maxRating) return false;
      if (minRating !== undefined && playerRating < minRating) return false;

      return true;
    },
  );

  const kFactor = matchingRule ? matchingRule.value : kFactorConfig.default;

  const expectedScore = winProbability({
    player,
    opponent,
    scalingFactor: config.scalingFactor,
  });

  const newRating = playerRating + kFactor * (config.score - expectedScore);
  return Math.round(newRating);
}
