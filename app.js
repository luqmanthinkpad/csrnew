const API_BASE = 'https://bunbunserver.my.id';
const SITE_ORIGIN = window.location.origin;
const GEM_ADS_SRC = 'https://cdn.jsdelivr.net/gh/luqmanthinkpad/csrnew/gem.js';

const appContainer = document.getElementById('app');
const mainNav = document.getElementById('main-nav');

// Read initial site defaults directly from Blogger template.xml DOM
const DEFAULT_SITE_NAME =
  document.getElementById('brand-link')?.textContent.trim() ||
  document.title.trim() ||
  'Technical Knowledge Base';
const DEFAULT_DESC = document.getElementById('meta-desc')?.getAttribute('content') || '';
const DEFAULT_KEYWORDS = document.getElementById('meta-keywords')?.getAttribute('content') || '';

// In-Memory 600x400 SVG Data URI Fallback (Zero Network Requests, Zero Retry Loops)
const FALLBACK_SVG_URI =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">' +
      '<rect width="100%" height="100%" fill="#e2e8f0"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-family="system-ui,sans-serif" font-size="16">Technical Diagram Unavailable</text>' +
    '</svg>'
  );

// Initialize Footer Year & Default Open Graph Image
const footerYearEl = document.getElementById('footer-year');
if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();

const ogImageEl = document.getElementById('og-image');
if (ogImageEl) ogImageEl.setAttribute('content', FALLBACK_SVG_URI);

// One-Shot Capture-Phase Image Error Guard (Mathematically Prevents Infinite Loops)
appContainer.addEventListener(
  'error',
  (event) => {
    const target = event.target;
    if (!target || target.tagName !== 'IMG') return;
    if (target.dataset.fallbackApplied === '1') return;
    target.dataset.fallbackApplied = '1';
    target.removeAttribute('srcset');
    target.src = FALLBACK_SVG_URI;
  },
  true
);

// In-memory cache for navigation categories
let cachedCategories = [];
let activeController = null;

function getSignal() {
  if (activeController) {
    activeController.abort();
  }
  activeController = new AbortController();
  return activeController.signal;
}

function setAppBusy(isBusy) {
  appContainer.setAttribute('aria-busy', isBusy ? 'true' : 'false');
}

function safeImgUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return FALLBACK_SVG_URI;
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:image/')) {
    return trimmed;
  }
  return FALLBACK_SVG_URI;
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toIsoDate(epochSeconds) {
  if (!epochSeconds || Number.isNaN(Number(epochSeconds))) {
    return new Date().toISOString();
  }
  return new Date(Number(epochSeconds) * 1000).toISOString();
}

function formatReadableDate(epochSeconds) {
  if (!epochSeconds || Number.isNaN(Number(epochSeconds))) return '';
  return new Date(Number(epochSeconds) * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function buildCategoryPath(categorySlug) {
  return `/?category=${encodeURIComponent(categorySlug)}`;
}

function buildArticlePath(categorySlug, articleSlug) {
  return `/?category=${encodeURIComponent(categorySlug)}&slug=${encodeURIComponent(articleSlug)}`;
}

function groupSentencesIntoParagraphs(sentences = [], fallbackContent = '', perParagraph = 4) {
  if (Array.isArray(sentences) && sentences.length > 0) {
    const paragraphs = [];
    for (let i = 0; i < sentences.length; i += perParagraph) {
      const chunk = sentences
        .slice(i, i + perParagraph)
        .map((s) => escapeHtml(String(s).trim()))
        .filter(Boolean)
        .join(' ');
      if (chunk) paragraphs.push(`<p>${chunk}</p>`);
    }
    return paragraphs.join('');
  }
  if (fallbackContent) {
    return `<p>${escapeHtml(fallbackContent)}</p>`;
  }
  return '';
}

// ============================================================================
// ISOLATED MODULAR HTML TEMPLATES (Zero Inline Styles)
// ============================================================================
const Templates = {
  navBar(categories = [], activeCategory = '') {
    const homeActive = !activeCategory ? ' is-active' : '';
    const itemsHtml = categories
      .map((cat) => {
        const isActive = cat.category === activeCategory ? ' is-active' : '';
        const href = buildCategoryPath(cat.category);
        return `
          <a class="nav-link${isActive}" href="${href}" data-link>
            <span>${escapeHtml(cat.label || cat.category)}</span>
            ${typeof cat.count === 'number' ? `<span class="nav-count">(${cat.count})</span>` : ''}
          </a>
        `;
      })
      .join('');

    return `<a class="nav-link${homeActive}" href="/" data-link>Home</a>${itemsHtml}`;
  },

  articleCard(card) {
    const articleHref = card.url || buildArticlePath(card.category, card.slug);
    const categoryHref = buildCategoryPath(card.category);
    const imgSrc = safeImgUrl(card.thumbnail || card.image);
    const imgAlt = card.imageAlt || card.title || 'Technical specification diagram';

    return `
      <li class="article-card">
        <a class="card-media" href="${escapeHtml(articleHref)}" data-link>
          <img
            src="${escapeHtml(imgSrc)}"
            alt="${escapeHtml(imgAlt)}"
            width="600"
            height="400"
            loading="lazy"
            decoding="async"
          />
        </a>
        <div class="card-body">
          <a class="card-category" href="${escapeHtml(categoryHref)}" data-link>
            ${escapeHtml(card.categoryLabel || card.category)}
          </a>
          <h2 class="card-title">
            <a href="${escapeHtml(articleHref)}" data-link>${escapeHtml(card.title)}</a>
          </h2>
          <p class="card-excerpt">${escapeHtml(card.excerpt || '')}</p>
        </div>
      </li>
    `;
  },

  listingView({ heading, subheading = '', breadcrumbLabel = '', articles = [] }) {
    const breadcrumbHtml = breadcrumbLabel
      ? `<nav class="breadcrumb" aria-label="Breadcrumb">
           <a href="/" data-link>Home</a> &raquo; <span>${escapeHtml(breadcrumbLabel)}</span>
         </nav>`
      : '';

    const gridHtml =
      articles.length > 0
        ? `<ul class="article-grid">${articles.map((c) => Templates.articleCard(c)).join('')}</ul>`
        : `<p>No technical articles available in this section.</p>`;

    return `
      <section>
        ${breadcrumbHtml}
        <header class="section-header">
          <h1 class="section-title">${escapeHtml(heading)}</h1>
          ${subheading ? `<p class="section-subtitle">${escapeHtml(subheading)}</p>` : ''}
        </header>
        ${gridHtml}
      </section>
    `;
  },

  singleArticle(article) {
    const categoryHref = buildCategoryPath(article.category);
    const images = Array.isArray(article.images) ? article.images : [];
    const heroImg = images.length > 0 ? images[0] : null;
    const readableDate = formatReadableDate(article.updatedAt || article.createdAt);
    const isoDate = toIsoDate(article.updatedAt || article.createdAt);

    // 1. Hero Image (images[0])
    const heroHtml = heroImg
      ? `<figure class="article-hero">
           <img
             src="${escapeHtml(safeImgUrl(heroImg.url))}"
             alt="${escapeHtml(heroImg.alt || article.title)}"
             width="${Number(heroImg.width) || 600}"
             height="${Number(heroImg.height) || 400}"
             fetchpriority="high"
             decoding="async"
           />
           <figcaption>${escapeHtml(heroImg.title || heroImg.alt || article.title)}</figcaption>
         </figure>`
      : '';

    // 2. Article Text Body (sentences[])
    const bodyParagraphsHtml = groupSentencesIntoParagraphs(article.sentences, article.content, 4);

    // 3. Full Technical Diagrams Gallery (All images[] from 0 to images.length - 1)
    const galleryHtml =
      images.length > 0
        ? `<section class="article-gallery" aria-label="Technical Diagrams Gallery">
             <h2 class="gallery-heading">Technical Diagrams &amp; Schematics (${images.length})</h2>
             <div class="gallery-grid">
               ${images
                 .map(
                   (img) => `
                     <figure class="gallery-card">
                       <img
                         src="${escapeHtml(safeImgUrl(img.url))}"
                         alt="${escapeHtml(img.alt || img.title || article.title)}"
                         width="${Number(img.width) || 600}"
                         height="${Number(img.height) || 400}"
                         loading="lazy"
                         decoding="async"
                       />
                       <figcaption>${escapeHtml(img.title || img.alt || article.title)}</figcaption>
                     </figure>
                   `
                 )
                 .join('')}
             </div>
           </section>`
        : '';

    // 4. Bottom Deferred Mount Slots (#related-posts-slot & #cross-domain-slot)
    return `
      <div class="single-article-wrap">
        <article class="single-article">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/" data-link>Home</a> &raquo;
            <a href="${escapeHtml(categoryHref)}" data-link>${escapeHtml(article.categoryLabel || article.category)}</a> &raquo;
            <span>${escapeHtml(article.title)}</span>
          </nav>

          <h1 class="article-title">${escapeHtml(article.title)}</h1>

          <div class="article-meta">
            <span>Category: <a href="${escapeHtml(categoryHref)}" data-link>${escapeHtml(article.categoryLabel || article.category)}</a></span>
            ${readableDate ? `<span>&bull; Updated <time datetime="${escapeHtml(isoDate)}">${escapeHtml(readableDate)}</time></span>` : ''}
            ${article.imageCount ? `<span>&bull; ${Number(article.imageCount)} Diagrams</span>` : ''}
          </div>

          ${heroHtml}

          <div class="article-body">
            ${bodyParagraphsHtml}
          </div>

          ${galleryHtml}
        </article>

        <!-- Phase 2 Low-Priority Bottom Hydration Slots -->
        <section id="related-posts-slot" class="bottom-links-section related-posts" hidden></section>
        <aside id="cross-domain-slot" class="bottom-links-section cross-domain-links" hidden></aside>
      </div>
    `;
  },

  relatedPosts(items = []) {
    return `
      <h2 class="bottom-links-title">Related Technical Guides</h2>
      <ul class="link-list">
        ${items
          .map((item) => {
            const href = item.url || buildArticlePath(item.category, item.slug);
            return `
              <li class="link-list-item">
                <a class="link-item-title" href="${escapeHtml(href)}" data-link>${escapeHtml(item.title)}</a>
                <p class="link-item-meta">
                  <strong>${escapeHtml(item.categoryLabel || item.category)}:</strong>
                  ${escapeHtml(item.excerpt || '')}
                </p>
              </li>
            `;
          })
          .join('')}
      </ul>
    `;
  },

  crossDomainLinks(pairs = []) {
    return `
      <h2 class="bottom-links-title">Recommended Partner Technical Resources</h2>
      <ul class="link-list">
        ${pairs
          .map(
            (pair) => `
              <li class="link-list-item">
                <a class="link-item-title" href="${escapeHtml(pair.fullUrl)}">${escapeHtml(pair.title)}</a>
                <p class="link-item-meta">
                  <span>${escapeHtml(pair.domainHost)}</span> &bull;
                  <span>${escapeHtml(pair.categoryLabel)}</span>
                </p>
              </li>
            `
          )
          .join('')}
      </ul>
    `;
  },

  notFound(message) {
    return `
      <section class="single-article-wrap">
        <div class="single-article">
          <h1 class="article-title">404 - Page Not Found</h1>
          <p>${escapeHtml(message)}</p>
          <p><a href="/" data-link>&larr; Return to Homepage</a></p>
        </div>
      </section>
    `;
  }
};

// ============================================================================
// IN-PLACE SEO, JSON-LD & AD SCRIPT LIFECYCLE MANAGER
// ============================================================================
function cleanupArticleAdsScript() {
  const existingScript = document.getElementById('gem-ads-script');
  if (existingScript) {
    existingScript.remove();
  }
}

function loadArticleAdsScript() {
  cleanupArticleAdsScript();
  const adScript = document.createElement('script');
  adScript.id = 'gem-ads-script';
  adScript.src = GEM_ADS_SRC;
  adScript.defer = true;
  document.body.appendChild(adScript);
}

function syncNavigation(categories, activeCategory = '') {
  if (Array.isArray(categories) && categories.length > 0) {
    cachedCategories = categories;
  }
  if (cachedCategories.length > 0) {
    mainNav.innerHTML = Templates.navBar(cachedCategories, activeCategory);
  }
}

async function ensureCategoriesLoaded(activeCategory = '', signal, priority = 'low') {
  if (cachedCategories.length > 0) {
    syncNavigation(cachedCategories, activeCategory);
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/categories`, { signal, priority });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data.categories)) {
      syncNavigation(data.categories, activeCategory);
    }
  } catch (_) {
    // Non-critical navigation hydration failure ignored
  }
}

function updateSEO({
  title,
  description,
  keywords = DEFAULT_KEYWORDS,
  canonicalPath,
  robots = 'index, follow',
  ogType = 'website',
  ogImage = FALLBACK_SVG_URI,
  schema = null
}) {
  const cleanCanonicalPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  const fullCanonicalUrl = `${SITE_ORIGIN}${cleanCanonicalPath}`;

  document.title = title;
  document.getElementById('meta-desc')?.setAttribute('content', description);
  document.getElementById('meta-keywords')?.setAttribute('content', keywords);
  document.getElementById('meta-robots')?.setAttribute('content', robots);
  document.getElementById('canonical-link')?.setAttribute('href', fullCanonicalUrl);

  document.getElementById('og-type')?.setAttribute('content', ogType);
  document.getElementById('og-title')?.setAttribute('content', title);
  document.getElementById('og-desc')?.setAttribute('content', description);
  document.getElementById('og-url')?.setAttribute('content', fullCanonicalUrl);
  document.getElementById('og-image')?.setAttribute('content', safeImgUrl(ogImage));

  const schemaEl = document.getElementById('schema-jsonld');
  if (schemaEl) {
    schemaEl.textContent = schema ? JSON.stringify(schema) : '';
  }
}

function renderNotFound(message = 'The requested technical resource could not be found.') {
  cleanupArticleAdsScript();
  updateSEO({
    title: `404 - Page Not Found | ${DEFAULT_SITE_NAME}`,
    description: message,
    canonicalPath: `${window.location.pathname}${window.location.search}`,
    robots: 'noindex, nofollow',
    schema: null
  });
  appContainer.innerHTML = Templates.notFound(message);
  setAppBusy(false);
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

// 1. HOMEPAGE ROUTE: /
async function renderHome(signal) {
  cleanupArticleAdsScript();
  try {
    const res = await fetch(`${API_BASE}/api/articles/random?limit=24`, {
      signal,
      priority: 'high'
    });
    if (!res.ok) throw new Error('Failed to load homepage feed');

    const data = await res.json();
    const articles = Array.isArray(data.articles) ? data.articles : [];

    if (Array.isArray(data.categories)) {
      syncNavigation(data.categories, '');
    } else {
      ensureCategoriesLoaded('', signal, 'low');
    }

    const firstValidCard = articles.find((a) => safeImgUrl(a.image || a.thumbnail) !== FALLBACK_SVG_URI);
    const firstImage = firstValidCard
      ? safeImgUrl(firstValidCard.image || firstValidCard.thumbnail)
      : FALLBACK_SVG_URI;

    const homeSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: DEFAULT_SITE_NAME,
          url: `${SITE_ORIGIN}/`,
          description: DEFAULT_DESC
        },
        {
          '@type': 'ItemList',
          itemListElement: articles.map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: `${SITE_ORIGIN}${item.url || buildArticlePath(item.category, item.slug)}`,
            name: item.title
          }))
        }
      ]
    };

    updateSEO({
      title: DEFAULT_SITE_NAME,
      description: DEFAULT_DESC,
      keywords: DEFAULT_KEYWORDS,
      canonicalPath: '/',
      robots: articles.length > 0 ? 'index, follow' : 'noindex, follow',
      ogType: 'website',
      ogImage: firstImage,
      schema: homeSchema
    });

    appContainer.innerHTML = Templates.listingView({
      heading: data.categoryLabel
        ? `Featured Technical Guides: ${data.categoryLabel}`
        : 'Featured Technical Specifications & Guides',
      subheading: 'Explore verified schematics, diagnostic procedures, and component specifications.',
      articles
    });
    setAppBusy(false);
  } catch (err) {
    if (err.name !== 'AbortError') {
      renderNotFound('Unable to load homepage technical listings.');
    }
  }
}

// 2. DYNAMIC CATEGORY ROUTE: /?category=<db>
async function renderCategory(categorySlug, signal) {
  cleanupArticleAdsScript();
  try {
    const res = await fetch(
      `${API_BASE}/api/category/${encodeURIComponent(categorySlug)}?limit=24`,
      { signal, priority: 'high' }
    );
    if (res.status === 404) {
      return renderNotFound(`Category "${categorySlug}" was not found.`);
    }
    if (!res.ok) throw new Error('Category fetch failed');

    const data = await res.json();
    const articles = Array.isArray(data.articles) ? data.articles : [];
    const categoryLabel = data.categoryLabel || data.category || categorySlug;
    const canonicalPath = buildCategoryPath(data.category || categorySlug);
    const categoryDescription = `Browse ${data.totalInCategory || articles.length} technical specifications, diagrams, and troubleshooting articles in ${categoryLabel}.`;

    const firstValidCard = articles.find((a) => safeImgUrl(a.image || a.thumbnail) !== FALLBACK_SVG_URI);
    const firstImage = firstValidCard
      ? safeImgUrl(firstValidCard.image || firstValidCard.thumbnail)
      : FALLBACK_SVG_URI;

    const categorySchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${categoryLabel} | ${DEFAULT_SITE_NAME}`,
      description: categoryDescription,
      url: `${SITE_ORIGIN}${canonicalPath}`
    };

    updateSEO({
      title: `${categoryLabel} Specifications & Diagrams | ${DEFAULT_SITE_NAME}`,
      description: categoryDescription,
      keywords: `${categoryLabel}, ${DEFAULT_KEYWORDS}`,
      canonicalPath,
      robots: articles.length > 0 ? 'index, follow' : 'noindex, follow',
      ogType: 'website',
      ogImage: firstImage,
      schema: categorySchema
    });

    appContainer.innerHTML = Templates.listingView({
      heading: categoryLabel,
      subheading: `${data.totalInCategory || articles.length} indexed technical articles in ${categoryLabel}.`,
      breadcrumbLabel: categoryLabel,
      articles
    });
    setAppBusy(false);

    ensureCategoriesLoaded(data.category || categorySlug, signal, 'low');
  } catch (err) {
    if (err.name !== 'AbortError') {
      renderNotFound('Unable to load category articles.');
    }
  }
}

// 3. SINGLE ARTICLE ROUTE: /?category=<db>&slug=<slug>
// Strict Two-Phase Waterfall to Eliminate Bandwidth Contention
async function renderArticle(categorySlug, articleSlug, signal) {
  try {
    // PHASE 1: Exclusive High-Priority Critical Path (Main Article Only)
    const res = await fetch(
      `${API_BASE}/api/article?category=${encodeURIComponent(categorySlug)}&slug=${encodeURIComponent(articleSlug)}`,
      { signal, priority: 'high' }
    );
    if (res.status === 404 || res.status === 400) {
      return renderNotFound('The requested technical article could not be found.');
    }
    if (!res.ok) throw new Error('Single article fetch failed');

    const article = await res.json();
    const trueCategory = article.category || categorySlug;
    const categoryLabel = article.categoryLabel || trueCategory;
    const canonicalPath = article.canonicalPath || buildArticlePath(trueCategory, article.slug || articleSlug);
    const fullArticleUrl = `${SITE_ORIGIN}${canonicalPath}`;
    const fullCategoryUrl = `${SITE_ORIGIN}${buildCategoryPath(trueCategory)}`;

    const images = Array.isArray(article.images) ? article.images : [];
    const imageUrls = images
      .map((img) => safeImgUrl(img?.url))
      .filter((u) => u !== FALLBACK_SVG_URI);
    const primaryOgImage = imageUrls[0] || FALLBACK_SVG_URI;

    const publishedIso = toIsoDate(article.createdAt);
    const modifiedIso = toIsoDate(article.updatedAt || article.createdAt);
    const metaDesc = article.metaDesc || (article.sentences && article.sentences[0]) || DEFAULT_DESC;
    const metaKeywords = article.metaKeywords || `${article.keyword || ''}, ${categoryLabel}`;

    const articleSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: article.title,
          description: metaDesc,
          keywords: metaKeywords,
          image: imageUrls.length > 0 ? imageUrls : [FALLBACK_SVG_URI],
          datePublished: publishedIso,
          dateModified: modifiedIso,
          author: {
            '@type': 'Organization',
            name: DEFAULT_SITE_NAME,
            url: `${SITE_ORIGIN}/`
          },
          publisher: {
            '@type': 'Organization',
            name: DEFAULT_SITE_NAME,
            url: `${SITE_ORIGIN}/`
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': fullArticleUrl
          }
        },
        {
          '@type': 'BreadcrumbList',
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
              name: categoryLabel,
              item: fullCategoryUrl
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: article.title,
              item: fullArticleUrl
            }
          ]
        }
      ]
    };

    updateSEO({
      title: `${article.title} | ${DEFAULT_SITE_NAME}`,
      description: metaDesc,
      keywords: metaKeywords,
      canonicalPath,
      robots: 'index, follow',
      ogType: 'article',
      ogImage: primaryOgImage,
      schema: articleSchema
    });

    // Paint Primary Article Immediately (Hero + Sentences + All Images Gallery)
    appContainer.innerHTML = Templates.singleArticle(article);
    setAppBusy(false);

    // PHASE 2: Deferred Low-Priority Bottom Hydration & Single-Article Ads (After Main Paint)
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (signal.aborted) return;
        loadArticleAdsScript();
        hydrateArticleBottomSlots(trueCategory, article.slug || articleSlug, signal);
        ensureCategoriesLoaded(trueCategory, signal, 'low');
      }, 0);
    });
  } catch (err) {
    if (err.name !== 'AbortError') {
      renderNotFound('Unable to load the requested technical article.');
    }
  }
}

// PHASE 2 HELPER: Low-Priority Related Posts (limit=5) & Cross-Domain Links (limit=5)
function hydrateArticleBottomSlots(categorySlug, currentArticleSlug, signal) {
  const relatedSlot = document.getElementById('related-posts-slot');
  const crossDomainSlot = document.getElementById('cross-domain-slot');

  // 2A. Same-Domain Related Posts (limit=5, request 6 to filter out current slug)
  if (relatedSlot) {
    fetch(
      `${API_BASE}/api/articles/random?category=${encodeURIComponent(categorySlug)}&limit=6`,
      { signal, priority: 'low' }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || signal.aborted || !Array.isArray(data.articles)) return;
        const relatedItems = data.articles
          .filter((item) => item.slug !== currentArticleSlug)
          .slice(0, 5);

        if (relatedItems.length > 0) {
          relatedSlot.innerHTML = Templates.relatedPosts(relatedItems);
          relatedSlot.hidden = false;
        }
      })
      .catch(() => {
        // Silent failure keeps primary article untouched
      });
  }

  // 2B. Cross-Domain Related Links (limit=5 domains + limit=5 random articles)
  if (crossDomainSlot) {
    Promise.all([
      fetch(`${API_BASE}/api/domains/status?limit=5`, { signal, priority: 'low' }).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${API_BASE}/api/articles/random?limit=5`, { signal, priority: 'low' }).then((r) =>
        r.ok ? r.json() : null
      )
    ])
      .then(([domainData, articleData]) => {
        if (!domainData || !articleData || signal.aborted) return;
        const domains = Array.isArray(domainData.activeDomains) ? domainData.activeDomains : [];
        const articles = Array.isArray(articleData.articles) ? articleData.articles : [];
        const count = Math.min(5, domains.length, articles.length);

        if (count === 0) return;

        const pairs = [];
        for (let i = 0; i < count; i++) {
          const cleanOrigin = String(domains[i]).replace(/\/+$/, '');
          const art = articles[i];
          const path = art.url || buildArticlePath(art.category, art.slug);
          let domainHost = cleanOrigin;
          try {
            domainHost = new URL(cleanOrigin).hostname;
          } catch (_) {}

          pairs.push({
            fullUrl: `${cleanOrigin}${path}`,
            title: art.title,
            domainHost,
            categoryLabel: art.categoryLabel || art.category
          });
        }

        if (pairs.length > 0) {
          crossDomainSlot.innerHTML = Templates.crossDomainLinks(pairs);
          crossDomainSlot.hidden = false;
        }
      })
      .catch(() => {
        // Silent failure keeps primary article untouched
      });
  }
}

// ============================================================================
// BLOGGER-SAFE QUERY-STRING ROUTER & SPA NAVIGATION INTERCEPTOR
// ============================================================================
function router() {
  const signal = getSignal();
  setAppBusy(true);

  const pathname = window.location.pathname;
  if (pathname !== '/' && pathname !== '/index.html') {
    return renderNotFound('Page path does not exist.');
  }

  // Ignore Blogger mobile parameters (?m=1 / ?m=0) automatically
  const params = new URLSearchParams(window.location.search);
  const category = (params.get('category') || '').trim();
  const slug = (params.get('slug') || '').trim();

  if (!category && !slug) {
    return renderHome(signal);
  }
  if (category && !slug) {
    return renderCategory(category, signal);
  }
  if (category && slug) {
    return renderArticle(category, slug, signal);
  }

  return renderNotFound('Invalid query parameters.');
}

// Global Click Interceptor for Internal [data-link] Anchors
document.addEventListener('click', (event) => {
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

  let targetUrl;
  try {
    targetUrl = new URL(anchor.href, window.location.origin);
  } catch (_) {
    return;
  }

  if (targetUrl.origin !== window.location.origin) return;

  event.preventDefault();
  const nextDestination = `${targetUrl.pathname}${targetUrl.search}`;
  const currentDestination = `${window.location.pathname}${window.location.search}`;

  if (nextDestination !== currentDestination) {
    window.history.pushState(null, '', nextDestination);
    router();
    window.scrollTo(0, 0);
  }
});

window.addEventListener('popstate', router);
router();
