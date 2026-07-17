# Tafara Chikuku — Portfolio

Personal portfolio website of **Tafara Chikuku**, Electrical Engineer (Harare, Zimbabwe).

**How it works:** all content lives in the [`vault/`](vault/) folder — an **Obsidian vault** of Markdown notes that doubles as the site's database. The website (`index.html` + `js/main.js`) reads those notes and renders them. Only the owner of this GitHub account can change content; visitors get a read-only published site.

```
tafara-portfolio/
├── index.html            ← the website
├── css/style.css         ← styling
├── js/main.js            ← reads the vault and renders the page
├── vault/                ← ★ THE CONTENT DATABASE (open this folder in Obsidian)
│   ├── profile.md        ← name, title, about me, social links, photo
│   ├── skills.md         ← skills section
│   ├── achievements.md   ← achievements section
│   ├── education.md      ← education & certifications
│   ├── career/           ← one note per job (timeline)
│   ├── projects/         ← one note per project (cards)
│   ├── assets/images/    ← your photos and project pictures
│   └── manifest.json     ← auto-generated list of notes (don't edit by hand)
├── scripts/build-manifest.mjs   ← regenerates manifest.json
└── .github/workflows/deploy.yml ← auto-deploys to GitHub Pages on every push
```

## ✏️ Editing your site (the owner workflow)

1. Open the `vault/` folder in **Obsidian** (Open folder as vault) — or edit the `.md` files directly on GitHub.
2. Change any note: your bio in `profile.md`, bullet points in a job, a new achievement, etc.
3. Commit & push (or click "Commit changes" on GitHub). GitHub Actions rebuilds and republishes the site automatically in ~1 minute.

### Add a new project
Create a new note in `vault/projects/`, e.g. `my-new-project.md`:

```markdown
---
title: My New Project
period: 2026
tags: Automation, PLC
image: vault/assets/images/my-new-project.jpg
order: 4
---

One-paragraph summary of the project.

- Key contribution 1
- Key contribution 2
```

Drop the picture into `vault/assets/images/`, push, done — the deploy workflow rebuilds `manifest.json` automatically so the new note appears.

### Add a new job to the career timeline
Same idea: add a note to `vault/career/` with `company`, `role`, `period`, `location`, and `order` in the frontmatter.

### Update social links / photo
Edit the frontmatter at the top of `vault/profile.md` (`linkedin:`, `facebook:`, `whatsapp:`, `photo:`).

## 🖥️ Preview locally

Browsers block `fetch()` on pages opened from disk, so run a tiny server:

```bash
npx serve .
# then open http://localhost:3000
```

## 🚀 Publishing (one-time setup)

1. Create a repository on GitHub (e.g. `tafara-portfolio`).
2. Push this folder to it (branch `main`).
3. On GitHub: **Settings → Pages → Source: GitHub Actions**.
4. Your site goes live at `https://<username>.github.io/tafara-portfolio/`.
