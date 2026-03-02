// Qaim Zehra Portfolio JS
// - sticky navbar blur on scroll
// - reveal on scroll
// - project rendering (home/work)
// - filtering (work)
// - basic page transition on internal links

(function () {
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 6);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Set current year in footer
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Reveal on scroll
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-in");
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));

  // Smooth page transition (internal links)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    // Same-origin navigation only
    e.preventDefault();
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 220ms ease";
    setTimeout(() => (window.location.href = href), 180);
  });

  // Render projects if containers exist
  function projectCard(p) {
    const tags = (p.tags || []).map(t => `<span class="tag">${t}</span>`).join("");
    const tools = (p.tools || []).slice(0, 2).join(" · ");
    return `
      <a class="card" href="project.html?id=${encodeURIComponent(p.id)}" aria-label="Open ${p.title}">
        <div class="card-media"></div>
        <div class="card-body">
          <div class="card-title">${p.title}</div>
          <div class="tagrow">${tags}</div>
          <p style="margin:0 0 12px">${p.excerpt || ""}</p>
          <div class="card-meta">
            <span>${p.year || ""} · ${tools}</span>
            <span class="arrow">View <span style="display:inline-block">→</span></span>
          </div>
        </div>
      </a>
    `;
  }

  const homeGrid = document.querySelector("[data-projects='home']");
  const workGrid = document.querySelector("[data-projects='work']");
  const filterWrap = document.querySelector("[data-filters]");
  const searchInput = document.querySelector("[data-search]");

  const projects = window.PROJECTS || [];

  if (homeGrid) {
    homeGrid.innerHTML = projects.slice(0, 6).map(projectCard).join("");
  }

  let activeTag = "All";
  let query = "";

  function applyFilter() {
    if (!workGrid) return;
    const q = query.trim().toLowerCase();
    const filtered = projects.filter((p) => {
      const matchesTag =
        activeTag === "All" ||
        (p.tags || []).some((t) => t.toLowerCase() === activeTag.toLowerCase());
      const blob = `${p.title} ${(p.tags || []).join(" ")} ${p.excerpt || ""}`.toLowerCase();
      const matchesQuery = !q || blob.includes(q);
      return matchesTag && matchesQuery;
    });
    workGrid.innerHTML = filtered.map(projectCard).join("");
  }

  if (filterWrap) {
    filterWrap.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      activeTag = chip.dataset.tag || "All";
      filterWrap.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      applyFilter();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      query = e.target.value || "";
      applyFilter();
    });
  }

  if (workGrid) applyFilter();

  // Generic Netlify Form Handling
  document.querySelectorAll('form[data-netlify="true"]').forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;

      const originalBtnHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Sending...';

      const formData = new FormData(form);
      const isFileUpload = form.querySelector('input[type="file"]');
      const hasFile = isFileUpload && isFileUpload.files.length > 0;

      const fetchOptions = {
        method: "POST",
        body: hasFile ? formData : new URLSearchParams(formData).toString()
      };

      if (!hasFile) {
        fetchOptions.headers = { "Content-Type": "application/x-www-form-urlencoded" };
      }

      fetch("/", fetchOptions)
        .then(() => {
          if (form.name === 'newsletter') {
            form.innerHTML = '<div style="color:var(--teal); font-size:12px; padding:10px 0;">Subscribed! ✨</div>';
          } else {
            const actionArea = document.getElementById("form-action-area");
            if (actionArea) {
              actionArea.innerHTML = '<div style="color:var(--teal); font-weight:600; padding:10px 0;">Message sent successfully! ✨</div>';
            }
            form.reset();
          }
        })
        .catch(error => {
          alert('Error: ' + error);
          btn.disabled = false;
          btn.innerHTML = originalBtnHTML;
        });
    });
  });

  // Project detail render
  const detail = document.querySelector("[data-project-detail]");
  if (detail) {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const p = projects.find((x) => x.id === id) || projects[0];

    const tagHTML = (p.tags || []).map(t => `<span class="tag">${t}</span>`).join("");
    const toolHTML = (p.tools || []).map(t => `<span class="tag">${t}</span>`).join("");

    detail.innerHTML = `
      <div class="reveal">
        <div class="card" style="border-radius:24px">
          <div class="card-media" style="height:520px"></div>
          <div style="position:absolute; left:22px; bottom:22px; right:22px; display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap;">
            <div class="card" style="padding:18px; border-radius:16px; background:rgba(11,18,32,0.60); backdrop-filter: blur(10px)">
              <div style="font-family:'Space Grotesk'; font-size:34px; margin-bottom:8px">${p.title}</div>
              <div class="tagrow">${tagHTML}</div>
              <div class="small">Role: Lead Designer · Year: ${p.year || ""}</div>
            </div>
            <div class="card" style="padding:16px; border-radius:16px; background:rgba(11,18,32,0.60); backdrop-filter: blur(10px)">
              <div class="kicker" style="margin:0 0 8px">Tools</div>
              <div class="tagrow" style="margin:0">${toolHTML}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-tight reveal">
        <div class="split">
          <div class="card" style="padding:26px">
            <div class="kicker">Overview</div>
            <h3 style="margin:0 0 10px">Brief</h3>
            <p>${p.excerpt || "A premium design project focused on clarity, consistency, and modern appeal."}</p>
            <div class="hr"></div>
            <h3 style="margin:0 0 10px">Deliverables</h3>
            <p>Logo system, visual language, social templates, and campaign-ready assets.</p>
          </div>
          <div class="card" style="padding:26px">
            <div class="kicker">Project Info</div>
            <p><b style="color:var(--text)">Role:</b> Lead Designer</p>
            <p><b style="color:var(--text)">Timeline:</b> 1–3 weeks</p>
            <p><b style="color:var(--text)">Focus:</b> Clean modern brand system</p>
            <div class="hr"></div>
            <p class="small">Tip: replace placeholder images with your real mockups for maximum impact.</p>
          </div>
        </div>
      </div>

      <div class="section-tight reveal">
        <div class="kicker">Process</div>
        <h2 style="font-size:44px; line-height:1.15; margin-bottom:18px">From direction to refined system</h2>
        <div class="grid">
          ${["Research & Direction", "Concepts", "Refinement"].map((t) => `
            <div class="card">
              <div class="card-media"></div>
              <div class="card-body">
                <div class="card-title">${t}</div>
                <p style="margin:0">Key decisions, typography, and layout rules that support the brand.</p>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="section-tight reveal">
        <div class="kicker">Visual System</div>
        <div class="card" style="padding:26px">
          <div class="split">
            <div>
              <h3 style="margin:0 0 10px">Palette</h3>
              <div class="row" style="gap:10px">
                ${["#0B1220", "#0F1B2D", "#13233A", "#EAF0FF", "#A9B6D3", "#22D3EE"].map(c => `
                  <div style="width:46px; height:46px; border-radius:14px; background:${c}; border:1px solid rgba(255,255,255,0.10)"></div>
                `).join("")}
              </div>
              <div class="hr"></div>
              <h3 style="margin:0 0 10px">Typography</h3>
              <p style="margin:0"><b style="color:var(--text)">Space Grotesk</b> for headings, <b style="color:var(--text)">Inter</b> for body/UI.</p>
            </div>
            <div>
              <h3 style="margin:0 0 10px">Logo usage</h3>
              <div class="card-media" style="height:240px; border-radius:16px"></div>
              <p class="small" style="margin-top:10px">Place your logo grid / clear-space here.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="section-tight reveal">
        <div class="kicker">Applications</div>
        <h2 style="font-size:44px; line-height:1.15; margin-bottom:18px">Mockups & layouts</h2>
        <div class="split">
          <div class="card"><div class="card-media" style="height:520px"></div></div>
          <div style="display:grid; gap:24px">
            <div class="card"><div class="card-media" style="height:248px"></div></div>
            <div class="card"><div class="card-media" style="height:248px"></div></div>
          </div>
        </div>
      </div>

      <div class="section-tight reveal">
        <div class="card" style="padding:26px">
          <div class="kicker">Outcome</div>
          <h3 style="margin:0 0 10px">What this delivered</h3>
          <p style="margin:0">A cohesive, modern system with reusable templates and consistent brand rules across touchpoints.</p>
        </div>
      </div>
    `;
    // trigger reveal observer
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-in"));
  }
})();
