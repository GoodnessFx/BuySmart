# BuySmart Procurement Limited

BuySmart is a single-page marketing website for a Lagos-based procurement business that helps customers source and ship goods from China and Vietnam. The project focuses on strong mobile responsiveness, a premium dark-and-gold visual system, and a WhatsApp-first quote flow for fast lead conversion.

## Features

- Sticky header with a collapsible mobile navigation menu
- Responsive hero section with logistics-focused imagery and primary CTAs
- Clear business sections for services, target audience, process, trust, and contact
- Quote request form that opens a pre-filled WhatsApp message
- Google Maps business location embed and local trust signals
- Responsive spacing, wrapped contact details, and overflow-safe layout behavior across mobile, tablet, and desktop breakpoints

## Tech stack

- `Vite`
- `React`
- `TypeScript`
- `Tailwind CSS v4`
- `Lucide React`

## Project structure

```text
src/
  app/
    App.tsx
    components/
  imports/
    pasted_text/
      buysmart-website-prompt.md
  styles/
    fonts.css
    globals.css
    index.css
    tailwind.css
    theme.css
  main.tsx
index.html
```

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Build for production:

   ```bash
   npm run build
   ```

4. Preview the production build locally:

   ```bash
   npm run preview
   ```

## Scripts

- `npm run dev` starts the local development server
- `npm run build` creates the production build in `dist/`
- `npm run preview` serves the built output for a final pre-deployment check

## Responsive implementation

The landing page is designed to adapt cleanly across phone, tablet, laptop, and desktop screens. The current implementation includes:

- Mobile navigation with scroll locking and safe dismissal behavior
- Full-width mobile CTAs that collapse into inline buttons on larger screens
- Overflow-safe contact blocks for long email and address content
- Flexible grids for hero, audience, service, trust, and contact sections
- Anchor offset handling for fixed-header navigation
- Global image, iframe, and media sizing rules to prevent horizontal overflow

## Brand and content

The website content is tailored to BuySmart Procurement Limited and emphasizes:

- Factory-price sourcing from China and Vietnam
- Transparent pricing and shipping communication
- Lagos delivery and local business trust
- Fast WhatsApp-based lead capture

Primary brand and copy notes are stored in `src/imports/pasted_text/buysmart-website-prompt.md`.

## Deployment

This is a static frontend and can be deployed on providers such as:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

Run `npm run build` before deployment and publish the generated `dist/` directory.

### Vercel

The project includes a `vercel.json` file so Vercel uses the correct static-site settings:

- `npm install` for dependency installation
- `npm run build` for the production build
- `dist/` as the output directory
- SPA rewrite fallback to `index.html` for non-file requests

If Vercel does not auto-detect the project correctly in the dashboard, set the framework to `Vite`, keep the build command as `npm run build`, and set the output directory to `dist`.
