# Modhini Student Profile

A React + TypeScript student profile built for frontend/UI recruitment evaluation.

## Required photo files

Place the **exact, untouched** original photos in `public/` using these names:

- `public/modhini-main.jpg` — white-dress mirror selfie
- `public/modhini-red.jpg` — red-shirt portrait used inside the circular text

The app only crops them using CSS. It does not edit or regenerate either source image.

## Run

```bash
npm install
npm run dev
```

## Build check

```bash
npm run build
```

## Included

- Responsive editorial hero
- React Bits-style OGL Plasma background
- Motion-based CircularText with static center portrait
- Grouped skills
- GitHub / LinkedIn / Email rows
- Right-side Edit Profile drawer
- Local photo preview via `URL.createObjectURL`
- Add/remove skills
- Inline validation
- Save + Cancel behavior
- Accessible labels, focus states, semantic controls
- `prefers-reduced-motion` handling
