# Mealy Machine Simulator

**Group ID:** Team DDOS

## Overview

Mealy Machine Simulator is a browser-based React application for defining and
executing deterministic Mealy machines. A Mealy machine produces an output for
each `(current state, input)` pair:

```text
delta(state, input) -> (next state, output)
```

The default example models an automatic turnstile gate. Users can replace the
states, input symbols, output symbols, initial state, and transitions, then
run an input sequence while watching the state diagram and execution trace.

## Supported features

- Define states, input symbols, and output symbols.
- Assign optional display labels with `Symbol=Label` syntax.
- Select the initial state.
- Add, edit, and remove transitions.
- Validate missing machine data, invalid references, and duplicate transitions.
- Display warnings for undefined state/input transitions.
- Render the machine as an SVG state-transition diagram.
- Highlight the active state and animate the current transition.
- Tokenize input sequences separated by spaces or commas.
- Tokenize character-by-character when single-character input symbols are used.
- Play, pause, step through, and reset a simulation.
- Adjust playback speed from `0.25x` to `3x`.
- Display the current state, progress, processed input, output sequence, and
  transition table.
- Halt clearly when an input has no defined transition.
- Report unknown input symbols before simulation starts.

## Technology stack and dependencies

- JavaScript with ES modules
- React `19.3.1`
- React DOM `19.3.1`
- Vite `8.3.6`
- Tailwind CSS `4.3.5`
- `@tailwindcss/vite` `4.3.5`
- Oxlint `1.90.0`
- `@vitejs/plugin-react` `6.1.2`

Dependency versions are declared in [package.json](./package.json) and
resolved in [package-lock.json](./package-lock.json).

## Prerequisites

- Node.js `20.19+` or `22.12+`
- npm
- A modern browser with JavaScript enabled

## Installation

1. Clone or download this project.
2. Open a terminal in the project directory.
3. Install dependencies:

   ```bash
   npm install
   ```

## How to run

Start the Vite development server:

```bash
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173/`. The
application entry point is [src/main.jsx](./src/main.jsx), which renders
[src/App.jsx](./src/App.jsx).

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

To run the configured linter:

```bash
npm run lint
```

## Example

The default machine is an automatic turnstile:

```text
States:        Locked, Unlocked
Inputs:        Card, Push
Outputs:       Allow, Deny
Initial state: Locked

Transitions:
Locked   + Card -> Unlocked, Allow
Locked   + Push -> Locked,   Deny
Unlocked + Card -> Unlocked, Allow
Unlocked + Push -> Locked,   Allow
```

Enter this input sequence in the **Input sequence** field:

```text
Card Push Card
```

Expected output:

```text
Allow Allow Allow
```

The state path is:

```text
Locked -> Unlocked -> Locked -> Unlocked
```

The same sequence can be entered as comma-separated tokens:

```text
Card, Push, Card
```

## Project structure

```text
.
├── index.html                 # HTML shell and document title
├── package.json               # Scripts and dependency manifest
├── src/
│   ├── main.jsx               # React application bootstrap
│   ├── App.jsx                # Page composition and machine lifecycle
│   ├── machine.js             # Parsing, validation, tokenization, execution
│   ├── diagram.js             # SVG layout and transition geometry
│   ├── index.css              # Global styles and Tailwind layers
│   └── components/
│       ├── ConfigPanel.jsx    # Machine definition form
│       ├── Field.jsx          # Reusable form field wrapper
│       ├── Select.jsx         # Reusable select control
│       ├── SimulationPanel.jsx # Playback controls and execution results
│       ├── StateDiagram.jsx   # Animated SVG diagram
│       └── Stat.jsx            # Simulation statistic display
├── public/                    # Static assets
└── dist/                      # Generated production output
```

## Testing

No automated test runner is currently configured. Use the following checks:

```bash
npm run lint
npm run build
```

For a manual smoke test:

1. Run `npm run dev`.
2. Load the application in a browser.
3. Confirm the default turnstile diagram renders.
4. Click **Test Machine** and run `Card Push Card`.
5. Confirm the output is `Allow Allow Allow`.
6. Remove a transition and confirm the simulator reports an incomplete
   machine and halts when that pair is reached.
7. Enter an unknown symbol and confirm it is rejected before playback.

## Known limitations and troubleshooting

- The application is client-side only; configurations are not persisted or
  exported.
- There is no backend, authentication, database, or file import support.
- Only deterministic Mealy machines are accepted. Duplicate `(state, input)`
  transitions are rejected.
- Undefined transitions are allowed during configuration but halt execution
  when encountered.
- The diagram layout is automatic and intended for small machines; large
  machines may become crowded.
- Input symbols containing spaces are not practical because input sequences are
  tokenized by spaces or commas.
- If `npm run dev` fails, verify the Node.js version and run `npm install`
  again.
- If the browser shows stale assets after a build, stop the preview server,
  rebuild with `npm run build`, and start `npm run preview` again.

## Team contributions and acknowledgements

This project was developed by the **TCS_Mockvita** group as an educational
simulator for Mealy machine concepts. Contributions include the machine
definition and validation workflow, the interactive simulation controls, the
SVG state diagram, and the responsive React interface.

