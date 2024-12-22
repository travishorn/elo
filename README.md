# Elo

A JavaScript module for calculating Elo ratings in competitive games and sports. This implementation includes configurable K-factors based on games played and rating thresholds, win probability calculations, and rating adjustments after matches.

Features:

- Calculate win probability between two players
- Calculate new ratings after matches
- Configurable K-factor rules based on:
  - Number of games played
  - Rating thresholds
- Configurable scaling factor
- Handles wins, losses, and draws
- Full JSDoc comments and type checking

## Installation

Clone the repository from GitHub:

```bash
git clone https://github.com/travishorn/elo
```

## Usage

Here's a basic example of how to use this module:

```javascript
import { newRating } from "../elo";

const newPlayerRating = newRating({
  player: { rating: 1500, gamesPlayed: 31 },
  opponent: { rating: 1400 },
  score: 1,
});

console.log(newPlayerRating); // 1507
```

In this example, the player's rating is 1500, and they have played 31 games. The opponent has a rating of 1400. The player wins the match, so the score is 1. The new rating is 1507, which is higher than the initial rating because the player won (against a lower-rated opponent).

K-Factor defaults to FIDE Chess rules. You can override this with the `kFactor` option.

```javascript
import { newRating } from "../elo";

const uscfRules = {
  default: 32,
  rules: [
    { value: 24, conditions: { minRating: 2100 } },
    { value: 16, conditions: { minRating: 2400 } },
  ],
};

const newPlayerRating = newRating({
  player: { rating: 2100 },
  opponent: { rating: 2100 },
  score: 1,
  kFactorConfig: uscfRules,
});

console.log(newPlayerRating); // 2112
```

In this example, the player's rating is 2100. The opponent has a rating of 2100. The player wins the match, so the score is 1. The new rating is 2112, which is higher than the initial rating and is affected by the K-Factor of 24 due to their rating being >= 2100.

```javascript
import { winProbability } from "../elo";

const playerWinProbability = winProbability({
  player: { rating: 1500 },
  opponent: { rating: 1400 },
});

console.log(playerWinProbability); // 0.64
```

In this example, the player's rating is 1500 and the opponent's rating is 1400. The win probability is 0.64, which means the player has a 64% chance of winning the match.

## Development

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm run test
```

## Contributing

Contributions are welcome! Before submitting a pull request, please...

1. Add tests if necessary
2. Make sure all tests pass with `npm run test`
3. Format with `npm run format`
4. Lint with `npm run lint`

## License

The MIT License

Copyright 2024 Travis Horn

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the “Software”), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
