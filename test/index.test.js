import { describe, it, expect } from "vitest";
import { winProbability, newRating } from "../src/index.js";

describe("winProbability", () => {
  it("should calculate a probable win", () => {
    expect(
      winProbability({ player: { rating: 1500 }, opponent: { rating: 1400 } }),
    ).toBeCloseTo(0.64, 2);
  });

  it("should calculate probable loss", () => {
    expect(
      winProbability({ player: { rating: 1500 }, opponent: { rating: 1600 } }),
    ).toBeCloseTo(0.36, 2);
  });

  it("should calculate probable draw", () => {
    expect(
      winProbability({ player: { rating: 1500 }, opponent: { rating: 1500 } }),
    ).toBe(0.5);
  });
});

describe("newRating", () => {
  describe("defaults", () => {
    it("should calculate new rating for a win", () => {
      expect(
        newRating({
          score: 1,
        }),
      ).toBe(1020);
    });

    it("should calculate new rating for a loss", () => {
      expect(
        newRating({
          score: 0,
        }),
      ).toBe(980);
    });

    it("should calculate new rating for a draw", () => {
      expect(
        newRating({
          score: 0.5,
        }),
      ).toBe(1000);
    });
  });

  describe("custom player and opponent", () => {
    it("should calculate new rating for a win", () => {
      expect(
        newRating({
          player: { rating: 1500, gamesPlayed: 31 },
          opponent: { rating: 1500 },
          score: 1,
        }),
      ).toBe(1510); // Winning against equal rating gains 10 points
    });

    it("should calculate new rating for a loss", () => {
      expect(
        newRating({
          player: { rating: 1500, gamesPlayed: 31 },
          opponent: { rating: 1500 },
          score: 0,
        }),
      ).toBe(1490); // Losing against equal rating loses 10 points
    });

    it("should calculate new rating for a draw", () => {
      expect(
        newRating({
          player: { rating: 1500, gamesPlayed: 31 },
          opponent: { rating: 1500 },
          score: 0.5,
        }),
      ).toBe(1500); // Drawing against equal rating maintains rating
    });

    it("should use provisional K-factor for new players", () => {
      expect(
        newRating({
          player: { rating: 1500, gamesPlayed: 15 },
          opponent: { rating: 1500 },
          score: 1,
        }),
      ).toBe(1520); // Under 30 games, winning against equal rating gains 20 points
    });

    it("should use lower K-factor for high-rated players", () => {
      expect(
        newRating({
          player: { rating: 2400, gamesPlayed: 31 },
          opponent: { rating: 2400 },
          score: 1,
        }),
      ).toBe(2405); // At 2400 or above, winning against equal rating gains 5 points
    });

    it("should handle rating differences correctly", () => {
      expect(
        newRating({
          player: { rating: 1200, gamesPlayed: 31 },
          opponent: { rating: 1600 },
          score: 1,
        }),
      ).toBe(1218); // Winning against much stronger opponent gains more points
    });
  });

  describe("custom kFactorConfig", () => {
    const customKFactorConfig = {
      default: 32,
      rules: [
        { value: 24, conditions: { minRating: 2100 } },
        { value: 16, conditions: { minRating: 2400 } },
      ],
    };

    it("should calculate new rating for a win", () => {
      expect(
        newRating({
          player: { rating: 1500 },
          opponent: { rating: 1500 },
          score: 1,
          kFactorConfig: customKFactorConfig,
        }),
      ).toBe(1516);
    });

    it("should calculate new rating for a loss", () => {
      expect(
        newRating({
          player: { rating: 1500 },
          opponent: { rating: 1500 },
          score: 0,
          kFactorConfig: customKFactorConfig,
        }),
      ).toBe(1484);
    });

    it("should calculate new rating for a draw", () => {
      expect(
        newRating({
          player: { rating: 1500 },
          opponent: { rating: 1500 },
          score: 0.5,
          kFactorConfig: customKFactorConfig,
        }),
      ).toBe(1500);
    });

    it("should not be affected by games played", () => {
      expect(
        newRating({
          player: { rating: 1500, gamesPlayed: 15 },
          opponent: { rating: 1500 },
          score: 1,
          kFactorConfig: customKFactorConfig,
        }),
      ).toBe(1516);
    });

    it("should use lower K-factor for mid-rated players", () => {
      expect(
        newRating({
          player: { rating: 2100 },
          opponent: { rating: 2100 },
          score: 1,
          kFactorConfig: customKFactorConfig,
        }),
      ).toBe(2112);
    });

    it("should use even lower K-factor for high-rated players", () => {
      expect(
        newRating({
          player: { rating: 2400 },
          opponent: { rating: 2400 },
          score: 1,
          kFactorConfig: customKFactorConfig,
        }),
      ).toBe(2412);
    });

    it("should handle rating differences correctly", () => {
      expect(
        newRating({
          player: { rating: 1200 },
          opponent: { rating: 1600 },
          score: 1,
          kFactorConfig: customKFactorConfig,
        }),
      ).toBe(1229);
    });

    it("should handle minimum number of games", () => {
      expect(
        newRating({
          player: { rating: 1500, gamesPlayed: 29 },
          opponent: { rating: 1500 },
          score: 1,
          kFactorConfig: {
            default: 32,
            rules: [{ value: 24, conditions: { minGames: 30 } }],
          },
        }),
      ).toBe(1516);
    });

    it("should handle maximum rating", () => {
      expect(
        newRating({
          player: { rating: 1500 },
          opponent: { rating: 1500 },
          score: 1,
          kFactorConfig: {
            default: 32,
            rules: [{ value: 24, conditions: { maxRating: 1400 } }],
          },
        }),
      ).toBe(1516);
    });

    it("matches on a rule with no conditions", () => {
      expect(
        newRating({
          player: { rating: 1500 },
          opponent: { rating: 1500 },
          score: 1,
          kFactorConfig: {
            default: 32,
            rules: [{ value: 24 }],
          },
        }),
      ).toBe(1512);
    });
  });

  describe("custom scalingFactor", () => {
    it("should use a custom scaling factor", () => {
      expect(
        newRating({
          player: { rating: 1200, gamesPlayed: 31 },
          opponent: { rating: 1600 },
          score: 1,
          scalingFactor: 200,
        }),
      ).toBe(1220);
    });
  });
});
