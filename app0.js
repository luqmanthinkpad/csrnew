/**
 * Technical Knowledge Base & Specifications — CSR Engine (app.js)
 * Target CDN: https://cdn.jsdelivr.net/gh/luqmanthinkpad/csrnew/app.js
 * Optimized for Googlebot Web Rendering Service (WRS) & Core Web Vitals
 */

const API_BASE = 'https://bunbunserver.my.id';
const SITE_ORIGIN = window.location.origin;
const SITE_NAME = 'Technical Knowledge Base & Specifications';
const DEFAULT_DESC = 'Technical Knowledge Base & Specifications — Engineering reference, system architecture, and technical documentation.';
const GEM_ADS_SRC = 'https://cdn.jsdelivr.net/gh/luqmanthinkpad/csrnew/gem.js';

const FALLBACK_SVG_URI =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f1f5f9'/%3E%3Crect x='180' y='130' width='240' height='140' rx='8' fill='%23e2e8f0' stroke='%23cbd5e1' stroke-width='2'/%3E%3Ctext x='300' y='205' font-family='system-ui,sans-serif' font-size='15' font-weight='600' fill='%2364748b' text-anchor='middle'%3ETechnical Diagram%3C/text%3E%3C/svg%3E";

/**
 * Escapes HTML special characters to prevent XSS and malformed markup.
 */
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validates image URLs (strictly http:// or https://), returning FALLBACK_SVG_URI otherwise.
 */
function safeImgUrl(url) {
  if (typeof url !== 'string') return FALLBACK_SVG_URI;
  const trimmed = url.trim();
  if (/^https?:\/\/.+/i.test(trimmed)) {
    return trimmed;
  }
  return FALLBACK_SVG_URI;
}

/**
 * Normalizes internal article paths to root query-string routing (/?category=...&slug=...).
 */
function normalizeInternalUrl(rawUrl, fallbackCategory, fallbackSlug) {
  if (typeof rawUrl === 'string' && rawUrl.trim().startsWith('/?')) {
    return rawUrl.trim();
  }
  if (typeof rawUrl === 'string' && /^https?:\/\//i.test(rawUrl.trim())) {
    try {
      const parsed = new URL(rawUrl.trim());
      if (parsed.search) return `/${parsed.search}`;
    } catch (_) {
      // Fall through to constructed query string
    }
  }
  if (fallbackCategory && fallbackSlug) {
    return `/?category=${encodeURIComponent(fallbackCategory)}&slug=${encodeURIComponent(fallbackSlug)}`;
  }
  if (fallbackCategory) {
    return `/?category=${encodeURIComponent(fallbackCategory)}`;
  }
  return '/';
}

/**
 * Converts Unix epoch seconds (or milliseconds/ISO) to an ISO-8601 string.
 */
function toIsoDate(timestamp) {
  if (!timestamp) return new Date(0).toISOString();
  if (typeof timestamp === 'string' && /^\d+$/.test(timestamp)) {
    timestamp = Number(timestamp);
  }
  if (typeof timestamp === 'number') {
    const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
    const d = new Date(ms);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

/**
 * Formats an ISO-8601 string into a concise human-readable technical date.
 */
function formatReadableDate(isoString) {
  try {
    const date = new Date(isoString);
    return date.toISOString().slice(0, 10);
  } catch (_) {
    return '';
  }
}

/**
 * Isolated HTML Template Builders (Zero inline style="..." attributes)
 */
const Templates = {
  navBar(categories = [], activeCategory = '') {
    const homeActiveClass = !activeCategory ? 'nav-pill is-active' : 'nav-pill';
    const pills = [
      `<a class="${homeActiveClass}" href="/" data-link>All Specifications</a>`
    ];

    for (const item of categories) {
      if (!item || !item.category) continue;
      const catSlug = String(item.category);
      const label = escapeHtml(item.label || catSlug);
      const count = typeof item.count === 'number' ? item.count : '';
      const isActive = activeCategory === catSlug;
      const pillClass = isActive ? 'nav-pill is-active' : 'nav-pill';
      const href = `/?category=${encodeURIComponent(catSlug)}`;
      const countBadge = count !== '' ? `<span class="nav-pill-count">(${count})</span>` : '';
      pills.push(
        `<a class="${pillClass}" href="${escapeHtml(href)}" data-link>${label}${countBadge}</a>`
      );
    }

    return pills.join('');
  },

  articleCard(article = {}) {
    const title = escapeHtml(article.title || 'Untitled Specification');
    const href = escapeHtml(
      normalizeInternalUrl(article.url, article.category, article.slug)
    );
    const categoryLabel = escapeHtml(
      article.categoryLabel || article.category || 'Specification'
    );
    const excerpt = escapeHtml(article.excerpt || '');
    const rawImg = article.thumbnail || article.image || '';
    const imgSrc = escapeHtml(safeImgUrl(rawImg));
    const imgAlt = escapeHtml(article.imageAlt || article.title || 'Technical specification diagram');

    return `
      <article class="article-card">
        <a class="card-thumb-link" href="${href}" data-link>
          <img class="card-thumb" src="${imgSrc}" alt="${imgAlt}" width="600" height="400" loading="lazy" decoding="async" />
        </a>
        <div class="card-body">
          <span class="card-category">${categoryLabel}</span>
          <h2 class="card-title">
            <a href="${href}" data-link>${title}</a>
          </h2>
          <p class="card-excerpt">${excerpt}</p>
        </div>
      </article>
    `;
  },

  listingView({ heading, subtitle, articles = [] }) {
    const cardsHtml = articles.slice(0, 24).map((art) => Templates.articleCard(art)).join('');
    return `
      <section class="listing-section">
        <header class="listing-header">
          <h1 class="listing-title">${escapeHtml(heading)}</h1>
          <p class="listing-subtitle">${escapeHtml(subtitle)}</p>
        </header>
        <div class="article-grid">
          ${cardsHtml}
        </div>
      </section>
    `;
  },

  singleArticle(article = {}) {
    const title = escapeHtml(article.title || 'Technical Specification');
    const categorySlug = String(article.category || '');
    const categoryLabel = escapeHtml(article.categoryLabel || categorySlug || 'Category');
    const categoryHref = escapeHtml(`/?category=${encodeURIComponent(categorySlug)}`);

    const createdIso = toIsoDate(article.createdAt);
    const updatedIso = toIsoDate(article.updatedAt || article.createdAt);
    const displayDate = escapeHtml(formatReadableDate(updatedIso));

    const images = Array.isArray(article.images) ? article.images : [];
    const heroItem = images.length > 0 && images[0] ? images[0] : null;
    const heroUrl = escapeHtml(
      safeImgUrl(heroItem ? heroItem.url || heroItem.src || heroItem : article.image || article.thumbnail)
    );
    const heroAlt = escapeHtml(
      (heroItem && (heroItem.alt || heroItem.caption)) || article.imageAlt || article.title || 'Primary technical specification figure'
    );
    const heroWidth = Number((heroItem && heroItem.width) || 600) || 600;
    const heroHeight = Number((heroItem && heroItem.height) || 400) || 400;
    const heroCaption = escapeHtml(
      (heroItem && (heroItem.caption || heroItem.alt)) || article.title || 'Figure 1: Primary Overview'
    );

    // Group sentences[] into clean <p> paragraphs (3-4 sentences per paragraph)
    const sentences = Array.isArray(article.sentences) ? article.sentences : [];
    const paragraphs = [];
    const groupSize = 4;
    for (let i = 0; i < sentences.length; i += groupSize) {
      const chunk = sentences
        .slice(i, i + groupSize)
        .map((s) => String(s || '').trim())
        .filter(Boolean)
        .join(' ');
      if (chunk) {
        paragraphs.push(`<p>${escapeHtml(chunk)}</p>`);
      }
    }
    if (paragraphs.length === 0 && article.excerpt) {
      paragraphs.push(`<p>${escapeHtml(article.excerpt)}</p>`);
    }

    // Full Technical Diagrams Gallery: EVERY item in images[] (index 0 to images.length - 1)
    const galleryFigures = images.map((imgObj, idx) => {
      const rawUrl = typeof imgObj === 'string' ? imgObj : imgObj && (imgObj.url || imgObj.src);
      const figUrl = escapeHtml(safeImgUrl(rawUrl));
      const figAlt = escapeHtml(
        (imgObj && (imgObj.alt || imgObj.caption)) || `${article.title || 'Specification'} - Diagram ${idx + 1}`
      );
      const figWidth = Number((imgObj && imgObj.width) || 600) || 600;
      const figHeight = Number((imgObj && imgObj.height) || 400) || 400;
      const figCaption = escapeHtml(
        (imgObj && (imgObj.caption || imgObj.alt)) || `Diagram ${idx + 1}: ${article.title || 'Technical Specification'}`
      );

      return `
        <figure class="gallery-item">
          <img src="${figUrl}" alt="${figAlt}" width="${figWidth}" height="${figHeight}" loading="lazy" decoding="async" />
          <figcaption>${figCaption}</figcaption>
        </figure>
      `;
    });

    const gallerySection =
      galleryFigures.length > 0
        ? `
          <section class="article-gallery" aria-label="Technical Diagrams Gallery">
            <h2 class="gallery-heading">Technical Diagrams &amp; Reference Figures (${galleryFigures.length})</h2>
            <div class="gallery-grid">
              ${galleryFigures.join('')}
            </div>
          </section>
        `
        : '';

    return `
      <div class="single-article-wrap">
        <article class="single-article">
          <nav class="breadcrumb-nav" aria-label="Breadcrumb">
            <ol class="breadcrumb-list">
              <li><a href="/" data-link>Home</a></li>
              <li class="breadcrumb-separator" aria-hidden="true">/</li>
              <li><a href="${categoryHref}" data-link>${categoryLabel}</a></li>
              <li class="breadcrumb-separator" aria-hidden="true">/</li>
              <li aria-current="page">${title}</li>
            </ol>
          </nav>

          <h1 class="article-title">${title}</h1>

          <div class="article-meta">
            <a class="meta-category-badge" href="${categoryHref}" data-link>${categoryLabel}</a>
            <time datetime="${escapeHtml(updatedIso)}">Updated ${displayDate}</time>
            <time datetime="${escapeHtml(createdIso)}" hidden>Published ${escapeHtml(formatReadableDate(createdIso))}</time>
          </div>

          <figure class="article-hero">
            <img src="${heroUrl}" alt="${heroAlt}" width="${heroWidth}" height="${heroHeight}" fetchpriority="high" decoding="async" />
            <figcaption>${heroCaption}</figcaption>
          </figure>

          <div class="article-body">
            ${paragraphs.join('')}
          </div>

          ${gallerySection}
        </article>

        <section id="related-posts-slot" class="supplementary-slot" hidden></section>
        <aside id="cross-domain-slot" class="supplementary-slot" hidden></aside>
      </div>
    `;
  },

  relatedPosts(items = []) {
    if (!Array.isArray(items) || items.length === 0) return '';
    const listItems = items.slice(0, 5).map((item) => {
      const href = escapeHtml(
        normalizeInternalUrl(item.url, item.category, item.slug)
      );
      const title = escapeHtml(item.title || 'Related Technical Specification');
      return `<li><a href="${href}" data-link>${title}</a></li>`;
    });

    return `
      <h2 class="slot-heading">Related Specifications in This Category</h2>
      <ul class="link-list">
        ${listItems.join('')}
      </ul>
    `;
  },

  crossDomainLinks(pairs = []) {
    if (!Array.isArray(pairs) || pairs.length === 0) return '';
    const listItems = pairs.slice(0, 5).map((pair) => {
      const href = escapeHtml(pair.href);
      const title = escapeHtml(pair.title || 'External Technical Reference');
      const domainHost = escapeHtml(pair.domainLabel || '');
      const suffix = domainHost ? ` — ${domainHost}` : '';
      return `<li><a href="${href}" rel="noopener">${title}${suffix}</a></li>`;
    });

    return `
      <h2 class="slot-heading">Distributed Knowledge Network References</h2>
      <ul class="link-list">
        ${listItems.join('')}
      </ul>
    `;
  },

  notFound(message = 'The requested specification or category could not be found.') {
    return `
      <section class="not-found-box" role="alert">
        <h1 class="not-found-title">404 — Specification Not Found</h1>
        <p class="not-found-desc">${escapeHtml(message)}</p>
        <a class="btn-home" href="/" data-link>Return to Knowledge Base</a>
      </section>
    `;
  }
};

/* ==========================================================================
   State, Metadata Mutation & Ad Script Lifecycle
   ========================================================================== */

let cachedCategories = null;
let currentAbortController = null;

const appEl = document.getElementById('app');
const navEl = document.getElementById('main-nav');

/**
 * Mutates <head> SEO & Open Graph tags in-place without creating duplicate tags.
 */
function updateHeadMetadata({
  title = SITE_NAME,
  description = DEFAULT_DESC,
  keywords = 'technical knowledge base, specifications, engineering documentation',
  robots = 'index, follow',
  canonicalUrl = `${SITE_ORIGIN}/`,
  ogType = 'website',
  ogImage = '',
  jsonLd = null
}) {
  document.title = title;
  const metaTitle = document.getElementById('meta-title');
  if (metaTitle) metaTitle.textContent = title;

  const setAttr = (id, attr, val) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute(attr, val);
  };

  setAttr('meta-desc', 'content', description);
  setAttr('meta-keywords', 'content', keywords);
  setAttr('meta-robots', 'content', robots);
  setAttr('canonical-link', 'href', canonicalUrl);

  setAttr('og-type', 'content', ogType);
  setAttr('og-title', 'content', title);
  setAttr('og-desc', 'content', description);
  setAttr('og-url', 'content', canonicalUrl);
  setAttr('og-image', 'content', ogImage);

  const schemaEl = document.getElementById('schema-jsonld');
  if (schemaEl) {
    schemaEl.textContent = jsonLd ? JSON.stringify(jsonLd) : '{}';
  }
}

/**
 * Removes #gem-ads-script on non-article routes (Homepage, Category, 404).
 */
function removeGemAdsScript() {
  const existing = document.getElementById('gem-ads-script');
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }
}

/**
 * Injects #gem-ads-script ONLY on Single Article views during Phase 2.
 */
function injectGemAdsScript() {
  if (document.getElementById('gem-ads-script')) return;
  const script = document.createElement('script');
  script.id = 'gem-ads-script';
  script.defer = true;
  script.src = GEM_ADS_SRC;
  document.body.appendChild(script);
}

/**
 * Renders theSoft 404 state and sets #meta-robots to "noindex, nofollow".
 */
function renderSoft404(reasonMessage) {
  removeGemAdsScript();
  updateHeadMetadata({
    title: `404 Not Found | ${SITE_NAME}`,
    description: reasonMessage || 'The requested resource does not exist.',
    robots: 'noindex, nofollow',
    canonicalUrl: `${SITE_ORIGIN}${window.location.pathname}`,
    ogType: 'website',
    ogImage: '',
    jsonLd: null
  });
  if (appEl) {
    appEl.innerHTML = Templates.notFound(reasonMessage);
  }
}

/**
 * Updates #main-nav and caches category items in memory.
 */
function renderNavigation(categories, activeCategory = '') {
  if (Array.isArray(categories) && categories.length > 0) {
    cachedCategories = categories;
  }
  if (navEl && Array.isArray(cachedCategories)) {
    navEl.innerHTML = Templates.navBar(cachedCategories, activeCategory);
  }
}

/**
 * Fetches /api/categories at low priority if #main-nav is not yet cached.
 */
async function ensureCategoriesLoaded(activeCategory = '', signal) {
  if (Array.isArray(cachedCategories) && cachedCategories.length > 0) {
    renderNavigation(cachedCategories, activeCategory);
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/categories`, {
      priority: 'low',
      signal
    });
    if (!res.ok) return;
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.categories || [];
    renderNavigation(list, activeCategory);
  } catch (_) {
    // Non-critical navigation hydration failure ignored
  }
}

/* ==========================================================================
   Route Controllers (Homepage, Category, Single Article Two-Phase Waterfall)
   ========================================================================== */

/**
 * 1. Homepage Route (/)
 */
async function handleHomepageRoute(signal) {
  removeGemAdsScript();

  const res = await fetch(`${API_BASE}/api/articles/random?limit=24`, {
    priority: 'high',
    signal
  });

  if (!res.ok) {
    renderSoft404('Unable to load specifications from the backend repository.');
    return;
  }

  const data = await res.json();
  const articles = Array.isArray(data.articles)
    ? data.articles
    : Array.isArray(data)
    ? data
    : [];

  if (Array.isArray(data.categories) && data.categories.length > 0) {
    renderNavigation(data.categories, '');
  } else {
    ensureCategoriesLoaded('', signal);
  }

  if (articles.length === 0) {
    renderSoft404('No specifications are currently available.');
    return;
  }

  const canonicalUrl = `${SITE_ORIGIN}/`;
  const firstImg = safeImgUrl(articles[0]?.thumbnail || articles[0]?.image || '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        url: canonicalUrl,
        name: SITE_NAME,
        description: DEFAULT_DESC
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE_ORIGIN}/#itemlist`,
        name: `${SITE_NAME} — Featured Specifications`,
        numberOfItems: Math.min(articles.length, 24),
        itemListElement: articles.slice(0, 24).map((art, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: art.title || 'Technical Specification',
          url: `${SITE_ORIGIN}${normalizeInternalUrl(art.url, art.category, art.slug)}`
        }))
      }
    ]
  };

  updateHeadMetadata({
    title: SITE_NAME,
    description: DEFAULT_DESC,
    robots: 'index, follow',
    canonicalUrl,
    ogType: 'website',
    ogImage: firstImg !== FALLBACK_SVG_URI ? firstImg : '',
    jsonLd
  });

  if (appEl) {
    appEl.innerHTML = Templates.listingView({
      heading: SITE_NAME,
      subtitle: 'Comprehensive engineering specifications, systems architecture, and technical reference guides.',
      articles
    });
  }
}

/**
 * 2. Category Route (/?category=<db>)
 */
async function handleCategoryRoute(category, signal) {
  removeGemAdsScript();

  const encodedCat = encodeURIComponent(category);
  const categoryFetchPromise = fetch(
    `${API_BASE}/api/category/${encodedCat}?limit=24`,
    {
      priority: 'high',
      signal
    }
  );

  if (!Array.isArray(cachedCategories) || cachedCategories.length === 0) {
    ensureCategoriesLoaded(category, signal);
  } else {
    renderNavigation(cachedCategories, category);
  }

  const res = await categoryFetchPromise;
  if (!res.ok) {
    renderSoft404(`Category "${category}" was not found.`);
    return;
  }

  const data = await res.json();
  const articles = Array.isArray(data.articles)
    ? data.articles
    : Array.isArray(data)
    ? data
    : [];

  if (articles.length === 0) {
    renderSoft404(`Category "${category}" contains 0 specifications.`);
    return;
  }

  if (Array.isArray(data.categories) && data.categories.length > 0) {
    renderNavigation(data.categories, category);
  }

  const categoryLabel =
    data.categoryLabel ||
    data.label ||
    articles[0]?.categoryLabel ||
    category;

  const canonicalUrl = `${SITE_ORIGIN}/?category=${encodedCat}`;
  const pageTitle = `${categoryLabel} Specifications | ${SITE_NAME}`;
  const pageDesc =
    data.description ||
    `Browse ${articles.length} technical specifications and reference architectures in ${categoryLabel}.`;
  const firstImg = safeImgUrl(articles[0]?.thumbnail || articles[0]?.image || '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${canonicalUrl}#collection`,
    url: canonicalUrl,
    name: pageTitle,
    description: pageDesc,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      name: SITE_NAME,
      url: `${SITE_ORIGIN}/`
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: Math.min(articles.length, 24),
      itemListElement: articles.slice(0, 24).map((art, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: art.title || 'Technical Specification',
        url: `${SITE_ORIGIN}${normalizeInternalUrl(art.url, art.category || category, art.slug)}`
      }))
    }
  };

  updateHeadMetadata({
    title: pageTitle,
    description: pageDesc,
    keywords: `${categoryLabel}, technical specifications, engineering documentation`,
    robots: 'index, follow',
    canonicalUrl,
    ogType: 'website',
    ogImage: firstImg !== FALLBACK_SVG_URI ? firstImg : '',
    jsonLd
  });

  if (appEl) {
    appEl.innerHTML = Templates.listingView({
      heading: `${categoryLabel} Specifications`,
      subtitle: pageDesc,
      articles
    });
  }
}

/**
 * 3. Single Article Route (/?category=<db>&slug=<slug>)
 * Strict Two-Phase Waterfall:
 * - Phase 1: Exclusive Critical Path (ONLY GET /api/article at priority: 'high')
 * - Phase 2: Deferred Low-Priority Hydration & Single-Article Ads via rAF + setTimeout
 */
async function handleSingleArticleRoute(category, slug, signal) {
  const encodedCat = encodeURIComponent(category);
  const encodedSlug = encodeURIComponent(slug);

  // PHASE 1: Exclusive Critical Path
  const res = await fetch(
    `${API_BASE}/api/article?category=${encodedCat}&slug=${encodedSlug}`,
    {
      priority: 'high',
      signal
    }
  );

  if (!res.ok) {
    renderSoft404(`Specification "${slug}" in "${category}" was not found.`);
    return;
  }

  const data = await res.json();
  const article = data.article || data;

  if (!article || (!article.title && !Array.isArray(article.sentences))) {
    renderSoft404(`Specification "${slug}" returned invalid or empty content.`);
    return;
  }

  article.category = article.category || category;
  article.slug = article.slug || slug;

  const canonicalPath =
    typeof article.canonicalPath === 'string' && article.canonicalPath.startsWith('/')
      ? article.canonicalPath
      : `/?category=${encodedCat}&slug=${encodedSlug}`;
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`;

  const createdIso = toIsoDate(article.createdAt);
  const updatedIso = toIsoDate(article.updatedAt || article.createdAt);

  const rawImages = Array.isArray(article.images) ? article.images : [];
  const validImageUrls = rawImages
    .map((img) => (typeof img === 'string' ? img : img && (img.url || img.src)))
    .filter((u) => typeof u === 'string' && /^https?:\/\/.+/i.test(u.trim()))
    .map((u) => u.trim());

  if (validImageUrls.length === 0) {
    const fallbackHero = article.image || article.thumbnail;
    if (typeof fallbackHero === 'string' && /^https?:\/\/.+/i.test(fallbackHero.trim())) {
      validImageUrls.push(fallbackHero.trim());
    }
  }

  const metaTitle = `${article.title} | ${SITE_NAME}`;
  const metaDesc =
    article.metaDesc ||
    article.excerpt ||
    (Array.isArray(article.sentences) ? article.sentences.slice(0, 2).join(' ') : DEFAULT_DESC);
  const metaKeywords =
    article.metaKeywords ||
    `${article.categoryLabel || category}, ${article.title}, technical specification`;

  const categoryUrl = `${SITE_ORIGIN}/?category=${encodeURIComponent(article.category)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${canonicalUrl}#article`,
        headline: article.title,
        description: metaDesc,
        image: validImageUrls,
        datePublished: createdIso,
        dateModified: updatedIso,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl
        },
        author: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: `${SITE_ORIGIN}/`
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: `${SITE_ORIGIN}/`
        }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_ORIGIN}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: article.categoryLabel || article.category,
            item: categoryUrl
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: article.title,
            item: canonicalUrl
          }
        ]
      }
    ]
  };

  updateHeadMetadata({
    title: metaTitle,
    description: metaDesc,
    keywords: metaKeywords,
    robots: 'index, follow',
    canonicalUrl,
    ogType: 'article',
    ogImage: validImageUrls[0] || '',
    jsonLd
  });

  // Paint Phase 1 DOM immediately
  if (appEl) {
    appEl.innerHTML = Templates.singleArticle(article);
  }

  // PHASE 2: Deferred Low-Priority Hydration & Single-Article Ads
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (signal.aborted) return;

      // 1. Dynamic Ad Script (gem.js) ONLY on Single Article views
      injectGemAdsScript();

      // Ensure category nav bar is hydrated if user landed directly on an article
      ensureCategoriesLoaded(article.category, signal);

      // 2. Same-Domain Related Posts (limit=5)
      hydrateSameDomainRelated(article.category, article.slug, signal);

      // 3. Cross-Domain Related Links (limit=5)
      hydrateCrossDomainLinks(signal);
    }, 0);
  });
}

/**
 * Phase 2 Helper: Same-Domain Related Posts (limit=5, text-only links)
 */
async function hydrateSameDomainRelated(category, currentSlug, signal) {
  try {
    const encodedCat = encodeURIComponent(category);
    const res = await fetch(
      `${API_BASE}/api/articles/random?category=${encodedCat}&limit=6`,
      {
        priority: 'low',
        signal
      }
    );
    if (!res.ok || signal.aborted) return;

    const data = await res.json();
    const list = Array.isArray(data.articles)
      ? data.articles
      : Array.isArray(data)
      ? data
      : [];

    const filtered = list
      .filter((item) => {
        if (!item) return false;
        if (item.slug && item.slug === currentSlug) return false;
        if (typeof item.url === 'string' && item.url.includes(`slug=${encodeURIComponent(currentSlug)}`)) {
          return false;
        }
        return true;
      })
      .slice(0, 5);

    if (filtered.length === 0 || signal.aborted) return;

    const slotEl = document.getElementById('related-posts-slot');
    if (slotEl) {
      slotEl.innerHTML = Templates.relatedPosts(filtered);
      slotEl.hidden = false;
    }
  } catch (_) {
    // Silent catch for low-priority supplementary hydration
  }
}

/**
 * Phase 2 Helper: Cross-Domain Related Links (limit=5, text-only external links)
 */
async function hydrateCrossDomainLinks(signal) {
  try {
    const [domainsRes, articlesRes] = await Promise.all([
      fetch(`${API_BASE}/api/domains/status?limit=5`, {
        priority: 'low',
        signal
      }),
      fetch(`${API_BASE}/api/articles/random?limit=5`, {
        priority: 'low',
        signal
      })
    ]);

    if (!domainsRes.ok || !articlesRes.ok || signal.aborted) return;

    const [domainsData, articlesData] = await Promise.all([
      domainsRes.json(),
      articlesRes.json()
    ]);

    const activeDomains = Array.isArray(domainsData.activeDomains)
      ? domainsData.activeDomains
      : Array.isArray(domainsData)
      ? domainsData
      : [];

    const articles = Array.isArray(articlesData.articles)
      ? articlesData.articles
      : Array.isArray(articlesData)
      ? articlesData
      : [];

    const pairCount = Math.min(activeDomains.length, articles.length, 5);
    if (pairCount === 0 || signal.aborted) return;

    const pairs = [];
    for (let i = 0; i < pairCount; i++) {
      const rawDomain = activeDomains[i];
      const domainOrigin =
        typeof rawDomain === 'string'
          ? rawDomain.trim()
          : rawDomain && (rawDomain.origin || rawDomain.domain || rawDomain.url || '');
      const article = articles[i];
      if (!domainOrigin || !article) continue;

      const normalizedOrigin = /^https?:\/\//i.test(domainOrigin)
        ? domainOrigin.replace(/\/+$/, '')
        : `https://${domainOrigin.replace(/\/+$/, '')}`;

      const articlePath = normalizeInternalUrl(
        article.url,
        article.category,
        article.slug
      );

      let domainLabel = '';
      try {
        domainLabel = new URL(normalizedOrigin).hostname;
      } catch (_) {
        domainLabel = normalizedOrigin;
      }

      pairs.push({
        href: `${normalizedOrigin}${articlePath}`,
        title: article.title || 'Technical Specification',
        domainLabel
      });
    }

    if (pairs.length === 0 || signal.aborted) return;

    const crossSlot = document.getElementById('cross-domain-slot');
    if (crossSlot) {
      crossSlot.innerHTML = Templates.crossDomainLinks(pairs);
      crossSlot.hidden = false;
    }
  } catch (_) {
    // Silent catch for low-priority cross-domain hydration
  }
}

/* ==========================================================================
   Router, Event Delegation & Resilience Setup
   ========================================================================== */

/**
 * Primary Query-String Router (Blogger ?m=1 / ?m=0 tolerant)
 */
async function router() {
  if (currentAbortController) {
    currentAbortController.abort();
  }
  currentAbortController = new AbortController();
  const { signal } = currentAbortController;

  if (appEl) {
    appEl.setAttribute('aria-busy', 'true');
  }

  try {
    const pathname = window.location.pathname || '/';
    if (pathname !== '/' && pathname !== '/index.html') {
      renderSoft404(`Path "${pathname}" is not a valid knowledge base route.`);
      return;
    }

    const rawParams = new URLSearchParams(window.location.search);
    // Ignore Blogger's mobile query parameter (?m=1 or ?m=0)
    rawParams.delete('m');

    const allowedKeys = new Set(['category', 'slug']);
    for (const key of rawParams.keys()) {
      if (!allowedKeys.has(key)) {
        renderSoft404(`Invalid query parameter "${key}".`);
        return;
      }
    }

    const category = (rawParams.get('category') || '').trim();
    const slug = (rawParams.get('slug') || '').trim();

    // Reject slug without category or empty parameter keys
    if (rawParams.has('slug') && (!category || !slug)) {
      renderSoft404('Both "category" and "slug" parameters are required for an article.');
      return;
    }

    if (rawParams.has('category') && !category) {
      renderSoft404('Category parameter cannot be empty.');
      return;
    }

    if (category && slug) {
      await handleSingleArticleRoute(category, slug, signal);
    } else if (category) {
      await handleCategoryRoute(category, signal);
    } else {
      await handleHomepageRoute(signal);
    }
  } catch (err) {
    if (err && err.name === 'AbortError') {
      return;
    }
    renderSoft404('An unexpected error occurred while loading the specification.');
  } finally {
    if (!signal.aborted && appEl) {
      appEl.setAttribute('aria-busy', 'false');
    }
  }
}

/**
 * Capture-phase error listener on main#app for zero-network SVG image fallback.
 */
if (appEl) {
  appEl.addEventListener(
    'error',
    (event) => {
      const target = event.target;
      if (!target || target.tagName !== 'IMG') return;
      if (target.dataset.fallbackApplied === '1') return;
      target.dataset.fallbackApplied = '1';
      target.src = FALLBACK_SVG_URI;
    },
    true
  );
}

/**
 * Intercept clicks on internal a[data-link] anchors for History API navigation.
 */
document.addEventListener('click', (event) => {
  // Ignore modified clicks (Ctrl, Cmd, Shift, Alt) or non-primary mouse buttons
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const anchor = event.target.closest('a[data-link]');
  if (!anchor) return;

  const href = anchor.getAttribute('href');
  if (!href) return;

  let targetUrl;
  try {
    targetUrl = new URL(href, window.location.origin);
  } catch (_) {
    return;
  }

  if (targetUrl.origin !== window.location.origin) return;

  event.preventDefault();

  // Immediately abort any in-flight requests
  if (currentAbortController) {
    currentAbortController.abort();
  }

  const nextFullUrl = `${targetUrl.pathname}${targetUrl.search}`;
  const currentFullUrl = `${window.location.pathname}${window.location.search}`;

  if (nextFullUrl !== currentFullUrl) {
    window.history.pushState(null, '', nextFullUrl);
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
  router();
});

window.addEventListener('popstate', () => {
  router();
});

// Boot CSR Engine
router();
