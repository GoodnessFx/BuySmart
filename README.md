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

This site can be deployed on providers such as:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages
- cPanel hosting with PHP support

Run `npm run build` before deployment and publish the generated `dist/` directory.

### Vercel

The project includes a `vercel.json` file so Vercel uses the correct static-site settings:

- `npm install` for dependency installation
- `npm run build` for the production build
- `dist/` as the output directory
- SPA rewrite fallback to `index.html` for non-file requests

If Vercel does not auto-detect the project correctly in the dashboard, set the framework to `Vite`, keep the build command as `npm run build`, and set the output directory to `dist`.

### cPanel

The production build now includes cPanel-friendly files inside `dist/`:

- `.htaccess` for SPA route rewrites
- `newsletter.php` as a newsletter backend fallback when Vercel serverless functions are not available
- `newsletter-data/` storage support for collected subscriber emails

To deploy on cPanel:

1. Run `npm run build`.
2. Upload the full contents of `dist/` into `public_html/` or your chosen web root.
3. Make sure the hosting account has PHP enabled.
4. If your host allows environment variables, set `NEWSLETTER_OWNER_EMAIL` to the inbox that should receive subscriber notifications.

On cPanel, newsletter signups are stored in `newsletter-data/newsletter-subscribers.csv` and a copy is emailed to the owner inbox using the server mail function.

## Newsletter setup

The site now includes two newsletter backends:

- `/api/newsletter` for Vercel deployments
- `/newsletter.php` as an automatic fallback for cPanel-style hosting

### Vercel newsletter setup

To make the Vercel newsletter flow work in production:

1. Copy `.env.example` into your deployment environment variables.
2. Add a Brevo API key.
3. Create or choose a Brevo contact list and set its numeric list ID as `BREVO_NEWSLETTER_LIST_ID`.
4. Set a verified sender email in Brevo as `BREVO_SENDER_EMAIL`.
5. Confirm `NEWSLETTER_OWNER_EMAIL` is the inbox that should receive each new subscriber notification.

When configured on Vercel, each signup is validated, saved into the Brevo list, and forwarded to the owner email.

### cPanel newsletter behavior

On cPanel hosting, if `/api/newsletter` is not available, the frontend automatically falls back to `newsletter.php`.

That PHP fallback:

- validates the email and consent
- stores the email in a CSV file on the server
- emails the owner inbox with the new subscriber details
