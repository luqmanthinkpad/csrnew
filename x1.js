// app.js — v1.5-stateless-wrs (Stateless Googlebot WRS + Single-Article ImageObject Schema + Global Top Ad Only + Self-Cleaning Teardown)

const API_BASE = 'https://bunbunserver.my.id';
const SITE_ORIGIN = window.location.origin;

const DEFAULT_SITE_NAME =
  document.getElementById('brand-link')?.textContent?.trim() || 'Technical Knowledge Base';
const DEFAULT_DESC =
  document.getElementById('meta-desc')?.getAttribute('content')?.trim() ||
  'Comprehensive technical specifications, wiring diagrams, and diagnostic troubleshooting guides.';
const DEFAULT_KEYWORDS =
  document.getElementById('meta-keywords')?.getAttribute('content')?.trim() ||
  'technical specifications, diagnostic guides, troubleshooting, system diagrams';

const IS_SEARCH_BOT =
  /googlebot|adsbot-google|mediapartners-google|bingbot|slurp|duckduckbot|baiduspider|yandexbot/i.test(
    navigator.userAgent || ''
  );

let AD_UNITS = {
  desktopTop: {
    key: '6bc878b50f4ca4fe0f9f00a24603655f',
    width: 728,
    height: 90,
  },
  mobileTop: {
    key: '659b04a20a0861b7619a7103d607c7d3',
    width: 320,
    height: 50,
  },
};

const FALLBACK_SVG_URI =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">' +
      '<rect width="600" height="400" fill="#e2e8f0"/>' +
      '<rect x="20" y="20" width="560" height="360" rx="8" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="8 6"/>' +
      '<text x="300" y="195" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="600" fill="#475569">Technical Diagram Unavailable</text>' +
      '<text x="300" y="222" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="#64748b">Reference specification archived</text>' +
    '</svg>'
  );

const cleanupController = new AbortController();
const cleanupSignal = cleanupController.signal;
let phase2Done = false;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isHttpUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url.trim());
}

function getSafeImageUrl(url) {
  return isHttpUrl(url) ? url.trim() : FALLBACK_SVG_URI;
}

function setBodyRoute(route, category = '', slug = '') {
  document.body.setAttribute('data-route', route);
  if (category) {
    document.body.setAttribute('data-category', category);
  } else {
    document.body.removeAttribute('data-category');
  }
  if (slug) {
    document.body.setAttribute('data-slug', slug);
  } else {
    document.body.removeAttribute('data-slug');
  }
}

function getRouteState() {
  const pathname = window.location.pathname || '/';
  if (pathname !== '/' && pathname !== '/index.html') {
    return { route: 'not-found' };
  }

  const params = new URLSearchParams(window.location.search);
  params.delete('m');

  const category = (params.get('category') || '').trim();
  const slug = (params.get('slug') || '').trim();

  if (!category && !slug) {
    return { route: 'home' };
  }
  if (category && !slug) {
    return { route: 'category', category };
  }
  if (category && slug) {
    return { route: 'article', category, slug };
  }
  return { route: 'not-found' };
}

function updateMeta({
  title,
  description = DEFAULT_DESC,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl = `${SITE_ORIGIN}/`,
  ogType = 'website',
  ogImage = '',
  robots = 'index, follow',
}) {
  const fullTitle = title || DEFAULT_SITE_NAME;
  document.title = fullTitle;

  const titleEl = document.getElementById('meta-title');
  if (titleEl) titleEl.textContent = fullTitle;

  const descEl = document.getElementById('meta-desc');
  if (descEl) descEl.setAttribute('content', description);

  const kwEl = document.getElementById('meta-keywords');
  if (kwEl) kwEl.setAttribute('content', keywords);

  const robotsEl = document.getElementById('meta-robots');
  if (robotsEl) robotsEl.setAttribute('content', robots);

  const canonicalEl = document.getElementById('canonical-link');
  if (canonicalEl) canonicalEl.setAttribute('href', canonicalUrl);

  const ogTypeEl = document.getElementById('og-type');
  if (ogTypeEl) ogTypeEl.setAttribute('content', ogType);

  const ogTitleEl = document.getElementById('og-title');
  if (ogTitleEl) ogTitleEl.setAttribute('content', fullTitle);

  const ogDescEl = document.getElementById('og-desc');
  if (ogDescEl) ogDescEl.setAttribute('content', description);

  const ogUrlEl = document.getElementById('og-url');
  if (ogUrlEl) ogUrlEl.setAttribute('content', canonicalUrl);

  const ogImageEl = document.getElementById('og-image');
  if (ogImageEl) ogImageEl.setAttribute('content', ogImage);
}

function setJsonLd(graph) {
  const scriptEl = document.getElementById('schema-jsonld');
  if (!scriptEl) return;
  if (!Array.isArray(graph) || graph.length === 0) {
    scriptEl.textContent = '';
    return;
  }
  scriptEl.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  });
}

function createAdIframe(unit) {
  const iframe = document.createElement('iframe');
  iframe.className = 'ad-iframe';
  iframe.width = String(unit.width);
  iframe.height = String(unit.height);
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('title', 'Advertisement');
  iframe.srcdoc =
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    `<base href="${SITE_ORIGIN}/">` +
    '<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent;display:flex;justify-content:center;align-items:center;}</style>' +
    '</head><body>' +
    `<script>atOptions={'key':'${unit.key}','format':'iframe','height':${unit.height},'width':${unit.width},'params':{}};<\/script>` +
    `<script src="https://hiibel.com/${unit.key}/invoke.js"><\/script>` +
    '</body></html>';
  return iframe;
}

function mountGlobalTopAd(route) {
  const slot = document.getElementById('ad-top-slot');
  if (!slot) return;

  if (IS_SEARCH_BOT || route === 'not-found' || !AD_UNITS) {
    slot.hidden = true;
    slot.innerHTML = '';
    return;
  }

  const unit = window.innerWidth < 768 ? AD_UNITS.mobileTop : AD_UNITS.desktopTop;
  if (!unit) return;

  slot.hidden = false;
  slot.innerHTML = '';
  slot.appendChild(createAdIframe(unit));
}

function removeScriptTag() {
  const scriptEl =
    document.getElementById('csr-app-script') ||
    document.querySelector('script[src*="app.js"]');
  if (scriptEl && scriptEl.parentNode) {
    scriptEl.parentNode.removeChild(scriptEl);
  }
}

function tryFinalTeardown() {
  if (!phase2Done) return;

  const appEl = document.getElementById('app');
  const images = appEl ? Array.from(appEl.querySelectorAll('img')) : [];
  const pending = images.filter((img) => !img.complete);

  if (pending.length > 0) {
    let remaining = pending.length;
    const onDone = () => {
      remaining -= 1;
      if (remaining <= 0) {
        cleanupController.abort();
        Templates = null;
        AD_UNITS = null;
      }
    };
    pending.forEach((img) => {
      img.addEventListener('load', onDone, { once: true, signal: cleanupSignal });
      img.addEventListener('error', onDone, { once: true, signal: cleanupSignal });
    });
    return;
  }

  cleanupController.abort();
  Templates = null;
  AD_UNITS = null;
}

function setupImageFallbackHandler() {
  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.addEventListener(
    'error',
    (event) => {
      const target = event.target;
      if (target && target.tagName === 'IMG' && !target.dataset.fallbackApplied) {
        target.dataset.fallbackApplied = 'true';
        target.src = FALLBACK_SVG_URI;
      }
    },
    { capture: true, signal: cleanupSignal }
  );
}

let Templates = {
  articleCard(item) {
    const categoryDb = item.category_db || item.category || '';
    const categoryLabel = item.category_label || item.category_name || categoryDb;
    const slug = item.slug || '';
    const title = item.title || 'Technical Specification';
    const excerpt = item.excerpt || item.description || '';
    const code = item.code || item.doc_code || '';
    const articleUrl = `/?category=${encodeURIComponent(categoryDb)}&slug=${encodeURIComponent(slug)}`;
    const categoryUrl = `/?category=${encodeURIComponent(categoryDb)}`;
    const thumbUrl = getSafeImageUrl(item.thumbnail || item.image || item.images?.[0]?.url || item.images?.[0]);

    return `
      <li class="article-card">
        <a class="card-media" href="${articleUrl}">
          <img src="${escapeHtml(thumbUrl)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async" />
        </a>
        <div class="card-body">
          <div class="card-top-meta">
            <a class="card-category" href="${categoryUrl}">${escapeHtml(categoryLabel)}</a>
            ${code ? `<span class="card-code">${escapeHtml(code)}</span>` : ''}
          </div>
          <h2 class="card-title"><a href="${articleUrl}">${escapeHtml(title)}</a></h2>
          ${excerpt ? `<p class="card-excerpt">${escapeHtml(excerpt)}</p>` : ''}
        </div>
      </li>
    `;
  },

  homeCategoriesBox(categories) {
    if (!Array.isArray(categories) || categories.length === 0) return '';
    const itemsHtml = categories
      .map((cat) => {
        const db = cat.db || cat.category_db || cat.slug || '';
        const label = cat.label || cat.name || db;
        const count = typeof cat.count === 'number' ? cat.count : null;
        if (!db) return '';
        return `
          <li>
            <a class="nav-link" href="/?category=${encodeURIComponent(db)}">
              <span>${escapeHtml(label)}</span>
              ${count !== null ? `<span class="nav-count">(${count})</span>` : ''}
            </a>
          </li>
        `;
      })
      .join('');

    if (!itemsHtml) return '';

    return `
      <div class="home-categories-header">
        <h2 class="home-categories-title">Browse Technical Categories</h2>
        <span class="card-code">${categories.length} Categories</span>
      </div>
      <ul class="home-categories-list">
        ${itemsHtml}
      </ul>
    `;
  },

  singleArticle(article, categoryDb, categoryLabel) {
    const title = article.title || 'Technical Specification';
    const categoryUrl = `/?category=${encodeURIComponent(categoryDb)}`;
    const paragraphs = Array.isArray(article.paragraphs)
      ? article.paragraphs
      : String(article.content || article.body || '')
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter(Boolean);

    const rawImages = Array.isArray(article.images) ? article.images : [];
    const normalizedImages = rawImages.map((img, idx) => {
      if (typeof img === 'string') {
        return {
          url: getSafeImageUrl(img),
          caption: `${title} — Diagram ${idx + 1}`,
          alt: `${title} diagram ${idx + 1}`,
        };
      }
      const url = getSafeImageUrl(img?.url || img?.src);
      const caption = img?.caption || img?.title || `${title} — Diagram ${idx + 1}`;
      const alt = img?.alt || caption;
      return { url, caption, alt };
    });

    const hero = normalizedImages[0] || null;
    const gallery = normalizedImages.slice(1);

    const heroHtml = hero
      ? `
        <figure class="article-hero">
          <img src="${escapeHtml(hero.url)}" alt="${escapeHtml(hero.alt)}" fetchpriority="high" decoding="async" />
          <figcaption>Fig. 1 — ${escapeHtml(hero.caption)}</figcaption>
        </figure>
      `
      : '';

    const bodyHtml = paragraphs
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join('');

    const galleryHtml =
      gallery.length > 0
        ? `
          <section class="article-gallery" aria-label="Technical Diagrams Gallery">
            <h2 class="gallery-heading">Additional Reference Diagrams (${gallery.length})</h2>
            <div class="gallery-grid">
              ${gallery
                .map(
                  (img, i) => `
                    <figure class="gallery-card">
                      <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt)}" loading="lazy" decoding="async" />
                      <figcaption>Fig. ${i + 2} — ${escapeHtml(img.caption)}</figcaption>
                    </figure>
                  `
                )
                .join('')}
            </div>
          </section>
        `
        : '';

    return `
      <div class="single-article-wrap">
        <article class="single-article">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a> / <a href="${categoryUrl}">${escapeHtml(categoryLabel)}</a> / <span>${escapeHtml(title)}</span>
          </nav>
          <h1 class="article-title">${escapeHtml(title)}</h1>
          <div class="article-meta">
            <span>Category: <strong>${escapeHtml(categoryLabel)}</strong></span>
            ${article.updated_at || article.created_at ? `<span>Updated: ${escapeHtml(article.updated_at || article.created_at)}</span>` : ''}
            ${normalizedImages.length > 0 ? `<span>Figures: ${normalizedImages.length}</span>` : ''}
          </div>
          ${heroHtml}
          <div class="article-body">
            ${bodyHtml}
          </div>
          ${galleryHtml}
        </article>

        <section id="related-posts-slot" class="bottom-links-section" aria-label="Related Articles" hidden></section>
        <section id="cross-domain-slot" class="bottom-links-section" aria-label="Partner Network Resources" hidden></section>
      </div>
    `;
  },
};

function renderNotFound() {
  const appEl = document.getElementById('app');
  setBodyRoute('not-found');
  mountGlobalTopAd('not-found');

  updateMeta({
    title: `404 Not Found — ${DEFAULT_SITE_NAME}`,
    description: 'The requested technical specification or category could not be found.',
    canonicalUrl: `${SITE_ORIGIN}/`,
    robots: 'noindex, nofollow',
  });
  setJsonLd([]);

  if (appEl) {
    appEl.innerHTML = `
      <section class="single-article-wrap">
        <div class="single-article">
          <h1 class="article-title">Specification Not Found (404)</h1>
          <p>The requested technical document or category does not exist or has been archived.</p>
          <p><a class="nav-link is-active" href="/">Return to Homepage</a></p>
        </div>
      </section>
    `;
    appEl.setAttribute('aria-busy', 'false');
  }

  phase2Done = true;
  removeScriptTag();
  tryFinalTeardown();
}

async function hydrateHomeCategoriesIfMissing(inlineCategories) {
  const slot = document.getElementById('home-categories-slot');
  try {
    let categories = Array.isArray(inlineCategories) ? inlineCategories : [];
    if (categories.length === 0) {
      const res = await fetch(`${API_BASE}/api/categories`, {
        priority: 'low',
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        categories = Array.isArray(json) ? json : json.categories || [];
      }
    }

    if (slot && categories.length > 0 && Templates) {
      slot.innerHTML = Templates.homeCategoriesBox(categories);
      slot.hidden = false;
    }
  } catch (_) {
    // Non-blocking category enhancement
  } finally {
    phase2Done = true;
    removeScriptTag();
    tryFinalTeardown();
  }
}

async function renderHome() {
  const appEl = document.getElementById('app');
  setBodyRoute('home');

  try {
    const res = await fetch(`${API_BASE}/api/articles/random?limit=24`, {
      priority: 'high',
      cache: 'no-store',
    });
    if (!res.ok) {
      renderNotFound();
      return;
    }

    const data = await res.json();
    const articles = Array.isArray(data) ? data : data.articles || [];
    if (articles.length === 0) {
      renderNotFound();
      return;
    }

    const cardsHtml = articles.map((item) => Templates.articleCard(item)).join('');
    appEl.innerHTML = `
      <section class="section-header">
        <h1 class="section-title">${escapeHtml(DEFAULT_SITE_NAME)}</h1>
        <p class="section-subtitle">${escapeHtml(DEFAULT_DESC)}</p>
      </section>
      <ul class="article-grid">
        ${cardsHtml}
      </ul>
      <section id="home-categories-slot" class="home-categories" aria-label="Browse Categories" hidden></section>
    `;
    appEl.setAttribute('aria-busy', 'false');

    const canonicalUrl = `${SITE_ORIGIN}/`;
    const firstThumb = articles[0]?.thumbnail || articles[0]?.image || '';
    updateMeta({
      title: DEFAULT_SITE_NAME,
      description: DEFAULT_DESC,
      keywords: DEFAULT_KEYWORDS,
      canonicalUrl,
      ogType: 'website',
      ogImage: isHttpUrl(firstThumb) ? firstThumb : '',
      robots: 'index, follow',
    });

    setJsonLd([
      {
        '@type': 'WebSite',
        '@id': `${canonicalUrl}#website`,
        url: canonicalUrl,
        name: DEFAULT_SITE_NAME,
        description: DEFAULT_DESC,
      },
      {
        '@type': 'ItemList',
        '@id': `${canonicalUrl}#featured-list`,
        numberOfItems: articles.length,
        itemListElement: articles.map((item, idx) => {
          const cat = item.category_db || item.category || '';
          const slug = item.slug || '';
          return {
            '@type': 'ListItem',
            position: idx + 1,
            url: `${SITE_ORIGIN}/?category=${encodeURIComponent(cat)}&slug=${encodeURIComponent(slug)}`,
            name: item.title || `Article ${idx + 1}`,
          };
        }),
      },
    ]);

    hydrateHomeCategoriesIfMissing(data.categories);
  } catch (_) {
    renderNotFound();
  }
}

async function renderCategory(categoryDb) {
  const appEl = document.getElementById('app');
  setBodyRoute('category', categoryDb);

  try {
    const res = await fetch(
      `${API_BASE}/api/category/${encodeURIComponent(categoryDb)}?limit=24`,
      {
        priority: 'high',
        cache: 'no-store',
      }
    );
    if (!res.ok) {
      renderNotFound();
      return;
    }

    const data = await res.json();
    const articles = Array.isArray(data) ? data : data.articles || [];
    if (articles.length === 0) {
      renderNotFound();
      return;
    }

    const categoryLabel =
      data.category_label ||
      data.category_name ||
      articles[0]?.category_label ||
      categoryDb;

    const cardsHtml = articles.map((item) => Templates.articleCard(item)).join('');
    appEl.innerHTML = `
      <section class="section-header">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a> / <span>${escapeHtml(categoryLabel)}</span>
        </nav>
        <h1 class="section-title">${escapeHtml(categoryLabel)}</h1>
        <p class="section-subtitle">Technical specifications, reference schematics, and diagnostic guides in ${escapeHtml(categoryLabel)}.</p>
      </section>
      <ul class="article-grid">
        ${cardsHtml}
      </ul>
    `;
    appEl.setAttribute('aria-busy', 'false');

    const canonicalUrl = `${SITE_ORIGIN}/?category=${encodeURIComponent(categoryDb)}`;
    const desc = `Browse ${articles.length} technical specifications and system diagrams for ${categoryLabel}.`;
    const firstThumb = articles[0]?.thumbnail || articles[0]?.image || '';

    updateMeta({
      title: `${categoryLabel} — ${DEFAULT_SITE_NAME}`,
      description: desc,
      keywords: `${categoryLabel}, ${DEFAULT_KEYWORDS}`,
      canonicalUrl,
      ogType: 'website',
      ogImage: isHttpUrl(firstThumb) ? firstThumb : '',
      robots: 'index, follow',
    });

    setJsonLd([
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `${categoryLabel} — ${DEFAULT_SITE_NAME}`,
        description: desc,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_ORIGIN}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: categoryLabel,
            item: canonicalUrl,
          },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${canonicalUrl}#category-list`,
        numberOfItems: articles.length,
        itemListElement: articles.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${SITE_ORIGIN}/?category=${encodeURIComponent(categoryDb)}&slug=${encodeURIComponent(item.slug || '')}`,
          name: item.title || `Article ${idx + 1}`,
        })),
      },
    ]);

    phase2Done = true;
    removeScriptTag();
    tryFinalTeardown();
  } catch (_) {
    renderNotFound();
  }
}

async function hydrateArticleBottomSlots(categoryDb, currentSlug) {
  const relatedSlot = document.getElementById('related-posts-slot');
  const crossDomainSlot = document.getElementById('cross-domain-slot');

  try {
    const [relatedRes, domainsRes, randomRes] = await Promise.allSettled([
      fetch(
        `${API_BASE}/api/articles/random?category=${encodeURIComponent(categoryDb)}&limit=6`,
        { priority: 'low', cache: 'no-store' }
      ),
      fetch(`${API_BASE}/api/domains/status?limit=5`, {
        priority: 'low',
        cache: 'no-store',
      }),
      fetch(`${API_BASE}/api/articles/random?limit=5`, {
        priority: 'low',
        cache: 'no-store',
      }),
    ]);

    if (
      relatedSlot &&
      relatedRes.status === 'fulfilled' &&
      relatedRes.value.ok
    ) {
      const relJson = await relatedRes.value.json();
      const relList = (Array.isArray(relJson) ? relJson : relJson.articles || [])
        .filter((item) => item.slug && item.slug !== currentSlug)
        .slice(0, 5);

      if (relList.length > 0) {
        relatedSlot.innerHTML = `
          <h2 class="bottom-links-title">Related Technical Specifications</h2>
          <ul class="link-list">
            ${relList
              .map((item) => {
                const url = `/?category=${encodeURIComponent(categoryDb)}&slug=${encodeURIComponent(item.slug)}`;
                const excerpt = item.excerpt || item.description || '';
                return `
                  <li class="link-list-item">
                    <a class="link-item-title" href="${url}">${escapeHtml(item.title || item.slug)}</a>
                    ${excerpt ? `<p class="link-item-meta">${escapeHtml(excerpt)}</p>` : ''}
                  </li>
                `;
              })
              .join('')}
          </ul>
        `;
        relatedSlot.hidden = false;
      }
    }

    if (
      crossDomainSlot &&
      domainsRes.status === 'fulfilled' &&
      domainsRes.value.ok &&
      randomRes.status === 'fulfilled' &&
      randomRes.value.ok
    ) {
      const domJson = await domainsRes.value.json();
      const randJson = await randomRes.value.json();

      const currentHost = window.location.hostname.toLowerCase();
      const domains = (Array.isArray(domJson) ? domJson : domJson.domains || [])
        .map((d) => (typeof d === 'string' ? d : d?.domain || d?.host || ''))
        .map((d) => d.replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase())
        .filter((d) => d && d !== currentHost);

      const randArticles = Array.isArray(randJson)
        ? randJson
        : randJson.articles || [];

      const count = Math.min(domains.length, randArticles.length, 5);
      if (count > 0) {
        const items = [];
        for (let i = 0; i < count; i += 1) {
          const host = domains[i];
          const art = randArticles[i];
          const cat = art.category_db || art.category || '';
          const slug = art.slug || '';
          if (!cat || !slug) continue;
          const extUrl = `https://${host}/?category=${encodeURIComponent(cat)}&slug=${encodeURIComponent(slug)}`;
          items.push(`
            <li class="link-list-item">
              <a class="link-item-title" href="${extUrl}">${escapeHtml(art.title || slug)}</a>
              <p class="link-item-meta">Reference archive on ${escapeHtml(host)}</p>
            </li>
          `);
        }

        if (items.length > 0) {
          crossDomainSlot.innerHTML = `
            <h2 class="bottom-links-title">External Reference Network</h2>
            <ul class="link-list">
              ${items.join('')}
            </ul>
          `;
          crossDomainSlot.hidden = false;
        }
      }
    }
  } catch (_) {
    // Non-blocking Phase 2 links
  } finally {
    phase2Done = true;
    removeScriptTag();
    tryFinalTeardown();
  }
}

async function renderArticle(categoryDb, slug) {
  const appEl = document.getElementById('app');
  setBodyRoute('article', categoryDb, slug);

  try {
    const res = await fetch(
      `${API_BASE}/api/article?category=${encodeURIComponent(categoryDb)}&slug=${encodeURIComponent(slug)}`,
      {
        priority: 'high',
        cache: 'no-store',
      }
    );
    if (!res.ok) {
      renderNotFound();
      return;
    }

    const data = await res.json();
    const article = data.article || data;
    if (!article || !article.title) {
      renderNotFound();
      return;
    }

    const categoryLabel =
      article.category_label ||
      data.category_label ||
      categoryDb;

    appEl.innerHTML = Templates.singleArticle(article, categoryDb, categoryLabel);
    appEl.setAttribute('aria-busy', 'false');

    const fullArticleUrl = `${SITE_ORIGIN}/?category=${encodeURIComponent(categoryDb)}&slug=${encodeURIComponent(slug)}`;
    const categoryUrl = `${SITE_ORIGIN}/?category=${encodeURIComponent(categoryDb)}`;
    const description =
      article.excerpt ||
      article.description ||
      (Array.isArray(article.paragraphs) ? article.paragraphs[0] : '') ||
      DEFAULT_DESC;

    const rawImages = Array.isArray(article.images) ? article.images : [];
    const imageObjects = rawImages
      .map((img, idx) => {
        const rawUrl = typeof img === 'string' ? img : img?.url || img?.src;
        if (!isHttpUrl(rawUrl)) return null;
        const cleanUrl = rawUrl.trim();
        const rawCaption =
          (typeof img === 'object' && (img?.caption || img?.title)) ||
          `${article.title} — Diagram ${idx + 1}`;
        const rawDesc =
          (typeof img === 'object' && (img?.description || img?.alt)) ||
          rawCaption;

        const obj = {
          '@type': 'ImageObject',
          '@id': `${fullArticleUrl}#image-${idx + 1}`,
          url: cleanUrl,
          contentUrl: cleanUrl,
          name: `${article.title} (Figure ${idx + 1})`,
          caption: `Fig. ${idx + 1} — ${rawCaption}`,
          description: rawDesc,
          representativeOfPage: idx === 0,
        };

        if (typeof img === 'object' && img?.width) obj.width = Number(img.width);
        if (typeof img === 'object' && img?.height) obj.height = Number(img.height);
        return obj;
      })
      .filter(Boolean);

    const primaryImageUrl = imageObjects[0]?.url || '';

    updateMeta({
      title: `${article.title} — ${DEFAULT_SITE_NAME}`,
      description: String(description).slice(0, 160),
      keywords: article.keywords || `${article.title}, ${categoryLabel}, ${DEFAULT_KEYWORDS}`,
      canonicalUrl: fullArticleUrl,
      ogType: 'article',
      ogImage: primaryImageUrl,
      robots: 'index, follow',
    });

    const articleSchema = {
      '@type': 'Article',
      '@id': `${fullArticleUrl}#article`,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': fullArticleUrl,
      },
      headline: article.title,
      description: String(description).slice(0, 200),
      articleSection: categoryLabel,
      author: {
        '@type': 'Organization',
        name: DEFAULT_SITE_NAME,
        url: `${SITE_ORIGIN}/`,
      },
      publisher: {
        '@type': 'Organization',
        name: DEFAULT_SITE_NAME,
        url: `${SITE_ORIGIN}/`,
      },
    };

    if (article.created_at) articleSchema.datePublished = article.created_at;
    if (article.updated_at) articleSchema.dateModified = article.updated_at;
    if (imageObjects.length > 0) {
      articleSchema.image = imageObjects;
      articleSchema.primaryImageOfPage = { '@id': `${fullArticleUrl}#image-1` };
    }

    setJsonLd([
      articleSchema,
      {
        '@type': 'BreadcrumbList',
        '@id': `${fullArticleUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_ORIGIN}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: categoryLabel,
            item: categoryUrl,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: article.title,
            item: fullArticleUrl,
          },
        ],
      },
    ]);

    // Continuous Network Queue (Zero rAF Idle Gap)
    hydrateArticleBottomSlots(categoryDb, slug);
  } catch (_) {
    renderNotFound();
  }
}

function initPage() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  setupImageFallbackHandler();

  const state = getRouteState();
  mountGlobalTopAd(state.route);

  if (state.route === 'home') {
    renderHome();
  } else if (state.route === 'category') {
    renderCategory(state.category);
  } else if (state.route === 'article') {
    renderArticle(state.category, state.slug);
  } else {
    renderNotFound();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage, { once: true });
} else {
  initPage();
}
