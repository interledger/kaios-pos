# Interledger POS (split version)

This is the same UI you liked from `interledger-pos.zip`, now split into clean routes/components/layouts.
Includes **all screens**: Splash, Setup (payment pointer), Menu, Sell (+ keypad), Wait for Card, Balance, End of Day, Settings.

## Quick start

```bash
cd interledger-pos-split
pnpm install   # or npm install / yarn
pnpm run dev
```

## Structure

- `components/`: Layout, Header, Keypad, StatCard, ErrorBoundary
- `pages/`: One file per screen
- `routes/`: React Router with lazy-loaded pages
- `state/`: Simple global store for pointer, currency, amount, tx
- `services/`: Stubs for card-present + Open Payments + reporting
- `lib/`: Currency format helpers

Swap out the stubs in `src/services/*` with your real implementations.
