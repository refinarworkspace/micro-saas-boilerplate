# Static Boilerplate

A **pure HTML / CSS / JavaScript** micro-SaaS template — no build step, no
Node.js, no framework. It mirrors the design and tooling of the Next.js
boilerplate in the repository root, but runs by simply opening the files.

## How to use

### Option 1 — Just open it

Double-click **`index.html`** (or open it in your browser). That's it. Every
page, tool, the dark-mode toggle and the language switcher work offline.

> The only thing that needs an internet connection is the CDN for Tailwind CSS
> and marked.js. For a fully offline build, download those libraries and update
> the `<script>` / `<link>` tags to point at local copies.

### Option 2 — Serve the folder (recommended)

Some browsers restrict a few features on the `file://` protocol. Serving over
HTTP avoids any quirks:

```bash
# Python (built-in)
python3 -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000>.

## What's included

| Page | File | Description |
| ---- | ---- | ----------- |
| Landing | `index.html` | Hero, features, tools, pricing, FAQ accordion, CTA |
| Pricing | `pricing.html` | Three pricing tiers |
| Login | `login.html` | Login form UI (no backend) |
| Image Compressor | `tools/image-compressor.html` | Canvas-based JPG/PNG compression with a quality slider |
| Markdown Preview | `tools/markdown-preview.html` | Live preview via marked.js with "Copy HTML" |
| Color Converter | `tools/color-converter.html` | Real-time HEX ⇆ RGB ⇆ HSL with a live swatch |

## Structure

```
static-boilerplate/
├── index.html
├── pricing.html
├── login.html
├── favicon.svg
├── tools/
│   ├── image-compressor.html
│   ├── markdown-preview.html
│   └── color-converter.html
├── css/
│   └── style.css          # theme tokens (light/dark) + components
└── js/
    ├── theme.js           # dark mode toggle, persisted to localStorage
    ├── i18n.js            # en/zh/es dictionary + language switcher
    └── utils.js           # debounce, clipboard, byte formatting + UI helpers
```

## Features

- **Tailwind via CDN** — utility classes loaded from `cdn.tailwindcss.com`, with
  a small inline config that maps color names to the CSS variables in
  `css/style.css`.
- **Dark mode** — `js/theme.js` toggles a `.dark` class on `<html>` and saves
  the choice to `localStorage`. An inline script in each page applies the saved
  theme before paint to avoid a flash.
- **Internationalization** — `js/i18n.js` holds an `en` / `zh` / `es` dictionary.
  Any element with `data-i18n="some.key"` is translated; use
  `data-i18n-placeholder` and `data-i18n-aria` for attributes. The language
  switcher in the header persists the choice.
- **Client-side tools** — the image compressor uses the Canvas API, the markdown
  preview uses marked.js, and the color converter is plain JavaScript. Nothing
  is ever uploaded.
- **Responsive & accessible** — semantic HTML5, keyboard-friendly controls and a
  mobile menu.

## Customizing

- **Colors / theme:** edit the CSS variables at the top of `css/style.css`
  (`:root` for light, `.dark` for dark).
- **Copy / translations:** edit the `DICT` object in `js/i18n.js`. Add a new
  language by adding a key and appending it to the `SUPPORTED` array.
- **Add a tool:** copy any file in `tools/`, adjust the markup and inline script,
  then link it from `index.html`.

No build, no dependencies to install — edit and refresh.
