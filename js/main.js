/* Portfolio engine: reads Markdown notes from the Obsidian vault (vault/) and renders the site.
   Content is the database — edit the .md files, not this script. */

const MANIFEST_URL = "vault/manifest.json";

/* ---------- Tiny frontmatter + markdown parser ---------- */
function parseNote(raw) {
  const meta = {};
  let body = raw;
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (m) {
    body = raw.slice(m[0].length);
    for (const line of m[1].split(/\r?\n/)) {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return { meta, body: body.trim() };
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineMd(s) {
  return esc(s)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" onerror="this.remove()">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  let html = "", inList = false, para = [];
  const flushPara = () => {
    if (para.length) { html += `<p>${inlineMd(para.join(" "))}</p>`; para = []; }
  };
  const closeList = () => { if (inList) { html += "</ul>"; inList = false; } };
  for (const line of lines) {
    const t = line.trim();
    if (!t) { flushPara(); closeList(); continue; }
    const h = t.match(/^(#{1,4})\s+(.*)/);
    if (h) {
      flushPara(); closeList();
      const lvl = Math.min(h[1].length + 1, 5); // demote: # -> h2
      html += `<h${lvl}>${inlineMd(h[2])}</h${lvl}>`;
      continue;
    }
    if (/^[-*]\s+/.test(t)) {
      flushPara();
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${inlineMd(t.replace(/^[-*]\s+/, ""))}</li>`;
      continue;
    }
    closeList();
    para.push(t);
  }
  flushPara(); closeList();
  return html;
}

/* ---------- Fetch helpers ---------- */
async function fetchNote(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return parseNote(await res.text());
}

/* ---------- Renderers ---------- */
const ICONS = {
  linkedin: '<svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-5c0-2.76-2.24-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.27c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.76-1.75 1.76zm13.5 12.27h-3v-5.6c0-3.37-4-3.11-4 0v5.6h-3v-11h3v1.77c1.4-2.59 7-2.78 7 2.47v6.76z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24"><path d="M24 12.07c0-6.63-5.37-12-12-12s-12 5.37-12 12c0 5.99 4.39 10.95 10.13 11.85v-8.38h-3.05v-3.47h3.05v-2.64c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.23 2.69.23v2.95h-1.51c-1.49 0-1.96.93-1.96 1.88v2.25h3.33l-.53 3.47h-2.8v8.38c5.74-.9 10.13-5.86 10.13-11.85z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.79h-.01a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.77 9.77 0 0 1-1.5-5.22c0-5.4 4.4-9.8 9.82-9.8a9.75 9.75 0 0 1 9.8 9.81c0 5.4-4.4 9.8-9.81 9.8zm8.35-18.16a11.72 11.72 0 0 0-8.35-3.46c-6.5 0-11.8 5.29-11.8 11.8 0 2.08.54 4.11 1.58 5.9l-1.68 6.13 6.28-1.65a11.78 11.78 0 0 0 5.61 1.43h.01c6.5 0 11.8-5.3 11.8-11.8 0-3.15-1.23-6.12-3.45-8.35z"/></svg>',
  email: '<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>'
};

function socialButton(kind, label, href) {
  if (!href || href.includes("YOUR_")) return "";
  return `<a class="social-btn" href="${esc(href)}" target="_blank" rel="noopener">${ICONS[kind] || ""}${esc(label)}</a>`;
}

async function renderProfile(path) {
  const { meta, body } = await fetchNote(path);
  const set = (id, v) => { const el = document.getElementById(id); if (el && v) el.textContent = v; };
  set("hero-name", meta.name); set("nav-name", meta.name); set("footer-name", meta.name);
  set("hero-title", meta.title); set("hero-tagline", meta.tagline);
  if (meta.location) set("hero-location", "📍 " + meta.location);
  document.getElementById("about-body").innerHTML = mdToHtml(body);
  document.title = `${meta.name} — ${meta.title}`;

  if (meta.photo) {
    const img = document.getElementById("profile-photo");
    img.src = meta.photo;
    img.onload = () => { img.hidden = false; document.getElementById("profile-fallback").style.display = "none"; };
  }
  if (meta.name) {
    document.getElementById("profile-fallback").textContent =
      meta.name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }

  const socials =
    socialButton("linkedin", "LinkedIn", meta.linkedin) +
    socialButton("facebook", "Facebook", meta.facebook) +
    socialButton("whatsapp", "WhatsApp", meta.whatsapp);
  document.getElementById("social-row").innerHTML = socials;
  document.getElementById("contact-links").innerHTML =
    socials +
    socialButton("email", meta.email || "", meta.email ? "mailto:" + meta.email : "") +
    socialButton("phone", meta.phone || "", meta.phone ? "tel:" + meta.phone.replace(/\s+/g, "") : "");
}

async function renderCareer(paths) {
  const notes = await Promise.all(paths.map(fetchNote));
  notes.sort((a, b) => (+a.meta.order || 99) - (+b.meta.order || 99));
  document.getElementById("career-timeline").innerHTML = notes.map(({ meta, body }) => `
    <div class="tl-item">
      ${meta.logo ? `<img class="tl-logo" src="${esc(meta.logo)}" alt="${esc(meta.company || "")} logo" onerror="this.remove()">` : ""}
      <h3>${esc(meta.role || "")} · ${esc(meta.company || "")}</h3>
      <div class="tl-meta">${esc(meta.period || "")}</div>
      <div class="tl-loc">${esc(meta.location || "")}</div>
      <div class="tl-body">${mdToHtml(body)}</div>
    </div>`).join("");
}

async function renderProjects(paths) {
  const notes = await Promise.all(paths.map(fetchNote));
  notes.sort((a, b) => (+a.meta.order || 99) - (+b.meta.order || 99));
  document.getElementById("project-cards").innerHTML = notes.map(({ meta, body }) => {
    const tags = (meta.tags || "").split(",").map(t => t.trim()).filter(Boolean)
      .map(t => `<span class="tag">${esc(t)}</span>`).join("");
    const img = meta.image
      ? `<img src="${esc(meta.image)}" alt="${esc(meta.title || "Project image")}" onerror="this.remove()">`
      : "";
    return `
      <article class="card">
        <div class="card-img">${img}<div class="img-fallback">⚡</div></div>
        <div class="card-body">
          <h3>${esc(meta.title || "Untitled project")}</h3>
          <div class="card-period">${esc(meta.period || "")}</div>
          <div class="card-tags">${tags}</div>
          <div class="card-text">${mdToHtml(body)}</div>
        </div>
      </article>`;
  }).join("");

  // Lightbox for project images (cover image + any images inside the note body)
  const lb = document.getElementById("lightbox");
  document.querySelectorAll(".card img").forEach(img => {
    img.addEventListener("click", () => {
      lb.querySelector("img").src = img.src;
      lb.hidden = false;
    });
  });
  lb.addEventListener("click", () => { lb.hidden = true; });
}

async function renderSection(path, elId) {
  const { body } = await fetchNote(path);
  document.getElementById(elId).innerHTML = mdToHtml(body);
}

/* ---------- Boot ---------- */
(async function init() {
  document.getElementById("year").textContent = new Date().getFullYear();
  try {
    const manifest = await (await fetch(MANIFEST_URL)).json();
    await Promise.all([
      renderProfile(manifest.profile),
      renderCareer(manifest.career || []),
      renderProjects(manifest.projects || []),
      renderSection(manifest.skills, "skills-body"),
      renderSection(manifest.achievements, "achievements-body"),
      renderSection(manifest.education, "education-body")
    ]);
  } catch (err) {
    console.error(err);
    document.getElementById("about-body").innerHTML =
      "<p><em>Could not load content. If you opened index.html directly from disk, run a local server instead (e.g. <code>npx serve</code>) — browsers block fetch() on file:// pages.</em></p>";
  }
})();
