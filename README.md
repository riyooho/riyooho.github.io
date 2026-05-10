# Personal Landing Page

> A fast, minimalist personal portfolio and blog built with **Astro** + **Tailwind CSS**, deployed on **GitHub Pages**.

[![Deploy](https://github.com/yourusername/personal-landing/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/personal-landing/actions/workflows/deploy.yml)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-98-brightgreen)](https://pagespeed.web.dev/)

---

## ✦ Features

- **Zero runtime JS** — Astro ships no JS to the client by default
- **Lighthouse 98+** — optimised for Core Web Vitals
- **SEO-ready** — Meta tags, Open Graph, JSON-LD schema, sitemap
- **Blog** — MDX-powered articles with reading time + syntax highlighting
- **Portfolio** — Case study format with category filtering
- **Contact form** — Formspree integration, no server required
- **GitHub Pages** — Free hosting with automated CI/CD

---

## 🗂 Directory Structure

```
personal-landing/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD — auto deploy on push to main
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/                 # Static images (og-default.jpg, avatar.jpg)
├── src/
│   ├── components/
│   │   ├── Navbar.astro
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── Portfolio.astro
│   │   ├── Blog.astro
│   │   ├── Contact.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── BaseLayout.astro    # Head, meta tags, SEO
│   ├── pages/
│   │   ├── index.astro         # Homepage
│   │   ├── blog/
│   │   │   ├── index.astro     # Blog listing
│   │   │   └── [slug].astro    # Article detail
│   │   └── projects/
│   │       └── [slug].astro    # Case study detail
│   ├── content/
│   │   ├── blog/               # Markdown articles
│   │   └── projects/           # Markdown project data
│   └── styles/
│       └── global.css          # Tailwind + custom design tokens
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/personal-landing.git
cd personal-landing

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
# → http://localhost:4321
```

### Build for Production

```bash
npm run build      # outputs to ./dist
npm run preview    # preview the built site locally
```

---

## ✏️ Personalisation Checklist

### 1. Identity
- [ ] `src/layouts/BaseLayout.astro` — Update `siteName`, `siteURL`, Twitter handle
- [ ] `astro.config.mjs` — Set `site` to your GitHub Pages URL
- [ ] `src/components/Navbar.astro` — Change the `YN` initials logo
- [ ] `src/components/Footer.astro` — Update initials and name

### 2. Hero & About
- [ ] `src/components/Hero.astro` — Name, headline, description, availability status
- [ ] `src/components/About.astro` — Bio paragraphs, skills, experience entries
- [ ] `public/images/avatar.jpg` — Add your photo (uncomment `<img>` in About.astro)

### 3. Portfolio
- [ ] `src/components/Portfolio.astro` — Replace `projects` array with your work
- [ ] `src/pages/projects/[slug].astro` — Add `getStaticPaths()` from content collection

### 4. Blog
- [ ] `src/content/blog/` — Add your `.md` or `.mdx` articles
- [ ] `src/components/Blog.astro` — Hook up to `getCollection('blog')`
- [ ] `src/pages/blog/[slug].astro` — Add `getStaticPaths()` + render `<Content />`

### 5. Contact
- [ ] `src/components/Contact.astro` — Replace `YOUR_FORM_ID` with your [Formspree](https://formspree.io) ID
- [ ] Update email address and social links

### 6. SEO
- [ ] `public/images/og-default.jpg` — Add 1200×630 Open Graph image
- [ ] `public/robots.txt` — Update sitemap URL

---

## 🌐 Deployment — GitHub Pages

### Automatic (Recommended)

1. Push your code to the `main` branch of your GitHub repo.
2. Go to **Settings → Pages → Source** and select **GitHub Actions**.
3. Every push to `main` triggers a build + deploy automatically via `.github/workflows/deploy.yml`.

### Manual

```bash
npm run build
# Upload ./dist to your hosting provider
```

---

## 🎨 Design System

| Token       | Value      | Usage                          |
|-------------|------------|-------------------------------|
| `ink`       | `#111010`  | Primary text, backgrounds     |
| `paper`     | `#F5F2EC`  | Light backgrounds, text on dark |
| `accent`    | `#C8552A`  | Highlight, CTAs, links        |
| `muted`     | `#8A8580`  | Secondary text                |
| `subtle`    | `#E8E4DC`  | Borders, dividers             |
| `surface`   | `#FEFCF8`  | Page background               |

**Fonts:** Syne (display/headings) + Lora (body) + JetBrains Mono (code)

---

## 📄 License

MIT — use freely, attribution appreciated.
