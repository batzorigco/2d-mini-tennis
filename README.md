# 2D Mini Tennis 🎾

A lightweight 2D top-down tennis game built with React and HTML5 Canvas. Drop it into any React app as a single component.

![npm version](https://img.shields.io/npm/v/2d-mini-tennis)
![license](https://img.shields.io/npm/l/2d-mini-tennis)

## Install

```bash
npm install 2d-mini-tennis
```

## Usage

```tsx
import { TennisGame } from "2d-mini-tennis";

export default function Page() {
  return <TennisGame />;
}
```

That's it. The component renders a full tennis match on a `<canvas>` element with mouse-based controls.

## How to Play

- **Move** your player by moving the mouse
- **Serve** by clicking when the aim cursor is over the service box
- **Hit** the ball when it's near your player — timing and positioning matter
- First to **7 points** wins the set

## Features

- **Full serve system** — toss animation, pendulum aim cursor, first/second serve, faults & double faults
- **Rally physics** — ball arcs with gravity, bounces, and spin-like trajectories
- **Volleys** — intercept the ball before it bounces when it's at a low height
- **Smashes** — overhead slam when the ball is high but reachable, with faster speed and aggressive angle
- **Bot AI** — opponent tracks the ball, predicts trajectories, and returns shots away from the player
- **Swing animation** — racket rotates on hit with ease-out interpolation
- **Scoring** — standard tennis scoring (15, 30, 40, deuce, advantage)

## Hit Types

| Type | Condition | Speed | Behavior |
|------|-----------|-------|----------|
| Ground stroke | After bounce, ball near ground | Normal (4.0) | Standard rally shot |
| Volley | Before bounce, ball low (z ≤ 15) | Softer (3.5) | Placed return |
| Smash | Before bounce, ball high (15 < z ≤ 35) | Fast (5.5) | Aggressive overhead slam |
| Unreachable | Ball too high (z > 35) | — | Ball passes over player |

## Customization

All game constants are exported if you need to reference them:

```tsx
import { CANVAS_WIDTH, CANVAS_HEIGHT, COURT, BALL, PLAYER, PHYSICS } from "2d-mini-tennis";
```

## Requirements

- React 18+
- A modern browser with Canvas support

## License

MIT
