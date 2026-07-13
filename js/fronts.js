(async () => {
    const forceRemoveLang = () => {
        document.documentElement.removeAttribute('lang');
        if (document.body) document.body.removeAttribute('lang');
    };
    forceRemoveLang();
    document.addEventListener("DOMContentLoaded", forceRemoveLang);
	
    const CONFIG = {
		API_URL: "https://newsgo.space",
		API_KEY: "berbahagia", 
		DOMAIN: window.location.origin,
		DATABASE_NAME: "automotive",
		SITE_NAME: "Diagram",
		DEFAULT_TITLE: "Wiring",
		DEFAULT_DESCRIPTION: "Wiring, Diagram, Schematic",
		DEFAULT_KEYWORDS: "",
		DEFAULT_IMAGE: "https://cdn.jsdelivr.net/gh/luqmanthinkpad/csrnew/img/n1_ipotnews.png"
	};

    const memoryCache = new Map();
    const pathName = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');

    const pathParts = pathName.split('/').filter(Boolean);
    let detailSlug = urlParams.get('detail');
    let paramType = "news"; 

    if (!detailSlug && pathParts.length > 0) {
        if (pathParts.length >= 2) {
            paramType = pathParts[0];
            detailSlug = pathParts[1];
        } else {
            detailSlug = pathParts[0];
        }
    }

    let isTldMode = (pathName !== '/' && !urlParams.has('detail'));

	const formatUTCDate = (d) => {
        if (!d) return "";
        const dateObj = (!isNaN(d) && d.toString().length <= 10) ? new Date(d * 1000) : new Date(d);
        return dateObj.toISOString();
    };

    const formatSimpleDate = (d) => {
        if (!d) return "";
        const dateObj = (!isNaN(d) && d.toString().length <= 10) ? new Date(d * 1000) : new Date(d);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const toTitleCase = (s) => s ? s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase()) : "";
    const getLink = (slug, prefix = "news") => isTldMode ? `/${prefix}/${slug}` : `/?detail=${slug}`;

	const getSkeletonStyle = () => `
        <style>
            .skeleton { background: #f2f4f5;position: relative; overflow: hidden; border-radius: 2px; }
            .skeleton::after {content: ""; position: absolute; top: 0; right: 0; bottom: 0; left: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);animation: shimmer 1.5s infinite;}
            @keyframes shimmer { 100% { transform: translateX(100%); } }
            .sk-item { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
            .sk-title { height: 18px; width: 85%; margin-top: 5px; margin-bottom: 5px; }
            .sk-text { height: 10px; width: 30%; }
            .sk-h1 { height: 32px; width: 90%; margin-bottom: 10px; }
            .sk-img { height: 350px; width: 100%; margin: 10px 0 20px 0; border-radius: 8px; }
            .sk-body { height: 14px; width: 100%; margin-bottom: 12px; }
        </style>
    `;

    const wrapInLayout = (innerContent) => `
			<div id="navnews" class="navbar-fixed-top">
				<div class="container">
					<div class="table-layout nm">
						<div class="col-xs-4 col-md-3 col-lg-2"></div>
						<div class="col-xs-4 col-md-6 col-lg-8">
							<div class="logo-brand text-center">
								<a href="/" class="mh-auto"><img id="main-logo" src="https://cdn.jsdelivr.net/gh/luqmanthinkpad/csrnew/img/n1_ipotnews.png" class="img-responsive hidden-xs hidden-sm mh-auto" width="200" height="40" alt="Logo"></a>
                                <a href="/" class="mh-auto"><img id="main-logo-mobile" src="https://cdn.jsdelivr.net/gh/luqmanthinkpad/csrnew/img/n1_ipotnews_w.png" class="img-responsive visible-xs visible-sm mh-auto" width="150" height="30" alt="Logo"></a>
							</div>
						</div>
						<div class="col-xs-4 col-md-3 col-lg-2 text-right"></div>
					</div>
				</div>
			</div>
			<div class="container-fluid hidden-xs hidden-sm">
				<div id="navbarIpotnews" class="navbar navbar-default">
					<div class="collapse navbar-collapse" id="ipotnewsMainMenu">
						<ul class="nav navbar-nav navbar-news">
							<div id="top-home-ads" style="display: block; text-align: center; margin: 20px 0px;">
								<div id="ads-728x90" style="display: none; width:728px; height:90px; margin: 0 auto; background:#f9f9f9;"></div>
							</div>
							<div class="clearfix mm-page mm-slideout"></div>
						</ul>
					</div>
				</div>
			</div>
            <div class="clearfix mm-page mm-slideout">
                <section class="startcontent newsonly">
                    <div class="header sub-menu single"><ul class="breadcrumb" role="tablist"></ul></div>
					<div class="clearfix"></div>
                    <section class="section pt10 bgcolor-white">
                        <div class="container" id="divMoreNewsPages">
                            ${innerContent}
                        </div>
                    </section>
                </section>
                <footer class="footer pt20 pb20 bgcolor-gray" style="border-top: 1px solid #eee; margin-top: 30px; padding-bottom: 70px;">
                    <div class="container text-center"><p style="font-size: 12px; color: #777;">&copy; All rights reserved.</p></div>
                </footer>
            </div>
            
            <div id="sticky-bottom-ad" style="position: fixed; bottom: 0; left: 0; width: 100%; z-index: 99999; display: flex; justify-content: center; background: rgba(0,0,0,0.2);">
                <div style="position: relative; background: #fff; box-shadow: 0 -2px 10px rgba(0,0,0,0.1);">
                    <button onclick="document.getElementById('sticky-bottom-ad').style.display='none'" style="position: absolute; top: -22px; right: 0; background: #ff4d4f; color: white; border: none; width: 22px; height: 22px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 4px 4px 0 0;">&times;</button>
                    <div id="ads-sticky" style="width: 320px; height: 50px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; color: #999;"></div>
                </div>
            </div>
    `;

	const injectSchema = (data) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(data);
        document.head.appendChild(script);
    };

	const stripHtml = (value) => String(value || "").replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/\s+/g, " ").trim();
    const limitText = (value, max = 160) => {
        const clean = stripHtml(value);
        if (clean.length <= max) return clean;
        return clean.substring(0, max).replace(/\s+\S*$/, "") + "...";
    };

    const makeAbsoluteUrl = (url) => {
        if (!url) return "";
        try { return new URL(url, CONFIG.DOMAIN).href; } catch (e) { return url; }
    };

    const getFirstImageUrl = (images) => {
        if (!images) return "";
        let list = images;
        if (typeof list === 'string') {
            try { list = JSON.parse(list); } catch (e) { return makeAbsoluteUrl(list); }
        }
        if (!Array.isArray(list)) list = [list];
        const first = list.find(Boolean);
        if (!first) return "";
        return makeAbsoluteUrl(typeof first === 'object' ? (first.url || first.src || first.image || first.thumbnail || "") : first);
    };

    const makeKeywordString = (values) => {
        const output = [];
        const add = (value) => {
            if (!value) return;
            if (Array.isArray(value)) return value.forEach(add);
            if (typeof value === 'object') return Object.values(value).forEach(add);
            String(value).split(',').forEach(item => {
                const clean = stripHtml(item).toLowerCase();
                if (clean && !output.includes(clean)) output.push(clean);
            });
        };
        values.forEach(add);
        return output.slice(0, 25).join(', ');
    };

    const findMetaTag = (attrName, attrValue) => Array.from(document.getElementsByTagName('meta')).find(meta => meta.getAttribute(attrName) === attrValue);
    const setMetaTag = (attrName, attrValue, content) => {
        if (!document.head || !content) return;
        let meta = findMetaTag(attrName, attrValue);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attrName, attrValue);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    };

    const setCanonical = (url) => {
        if (!document.head || !url) return;
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = makeAbsoluteUrl(url);
    };

    const applySeoMeta = ({ title, description, keywords, image, url, type = 'website', createdAt }) => {
        const finalTitle = limitText(title || CONFIG.DEFAULT_TITLE, 65);
        const finalDescription = limitText(description || CONFIG.DEFAULT_DESCRIPTION, 160);
        const finalKeywords = keywords || CONFIG.DEFAULT_KEYWORDS;
        const finalImage = makeAbsoluteUrl(image || CONFIG.DEFAULT_IMAGE);
        const finalUrl = makeAbsoluteUrl(url || `${CONFIG.DOMAIN}/`);

        document.title = finalTitle;
        setMetaTag('name', 'title', finalTitle);
        setMetaTag('name', 'description', finalDescription);
        setMetaTag('name', 'keywords', finalKeywords);
        setMetaTag('name', 'robots', 'index, follow');
        setMetaTag('name', 'googlebot', 'index, follow');
        setMetaTag('name', 'language', 'en-US');
        setMetaTag('property', 'og:locale', 'en-US');
        setMetaTag('property', 'og:type', type);
        setMetaTag('property', 'og:title', finalTitle);
        setMetaTag('property', 'og:description', finalDescription);
        setMetaTag('property', 'og:url', finalUrl);
        setMetaTag('property', 'og:image', finalImage);
        setMetaTag('name', 'twitter:card', 'summary_large_image');
        setMetaTag('name', 'twitter:title', finalTitle);
        setMetaTag('name', 'twitter:description', finalDescription);
        setMetaTag('name', 'twitter:image', finalImage);
    
		if (type === 'article' && createdAt) { 
			setMetaTag('property', 'article:published_time', createdAt);
			setMetaTag('property', 'article:modified_time', createdAt);
		}
		setCanonical(finalUrl);
    };
	
    const fetchAPI = async (endpoint) => {
        if (memoryCache.has(endpoint)) return memoryCache.get(endpoint); 
        
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                headers: { 
                    'x-api-key': CONFIG.API_KEY, 
                    'original-domain': CONFIG.DOMAIN,
                    'target-db': CONFIG.DATABASE_NAME
                }
            });

            if (response.status === 429) {
                const errorData = await response.json();
                renderRateLimitMessage(errorData.error);
                return null;
            }

            if (response.status === 404) {
                return { status: "not_found" };
            }

            if (!response.ok) throw new Error("Server Error");

            const data = await response.json();

            if (data.status === "success") {
                memoryCache.set(endpoint, data);
            }

            return data;
        } catch (e) { 
            console.error("Fetch Error:", e);
            return null; 
        }
    };

    const renderRateLimitMessage = (msg) => {
        document.body.innerHTML = `
            <div style="font-family:sans-serif; text-align:center; padding:50px;">
                <h2 style="color:#ed5466;">Akses Dibatasi</h2>
                <p style="color:#666;">${msg || "Anda telah mencapai batas akses."}</p>
                <button onclick="window.location.reload()" style="padding:10px 20px; cursor:pointer;">Coba Muat Ulang</button>
            </div>`;
    };

    const renderSkeletonHome = () => { 
		if (!document.body) return;
		let items = "";
		for (let i = 0; i < 8; i++) items += `<div class="sk-item"><div class="skeleton sk-text"></div><div class="skeleton sk-title"></div></div>`;
		
		const html = getSkeletonStyle() + wrapInLayout(`<div class="row"><div class="col-md-8 col-md-offset-2"><div class="listMoreLeft">${items}</div></div></div>`);
		document.body.innerHTML = html;
	};
	
    const renderSkeletonDetail = () => {
		const skeletonBody = `<div class="row"><div class="col-sm-8"><div class="skeleton sk-h1"></div><div class="skeleton sk-text" style="margin-bottom:20px;"></div><hr><div class="skeleton sk-img"></div><div class="skeleton sk-body"></div><div class="skeleton sk-body"></div></div><aside class="col-sm-4"><div class="skeleton" style="height:250px; width:300px; margin-bottom:30px;"></div><div class="skeleton sk-title" style="width:50%; height:25px;"></div><div class="skeleton sk-item" style="height:50px;"></div></aside></div>`;
        document.body.innerHTML = getSkeletonStyle() + wrapInLayout(skeletonBody);
	};
	
    const renderNoConnection = async () => { 
		if (!document.body) {
            setTimeout(renderNoConnection, 50);
            return;
        }

        let userIp = "...";
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            userIp = ipData.ip;
        } catch (e) {}

        const errorHtml = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f2f5;">
                <div style="text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 400px; width: 90%;">
                    <div style="background: #fff1f0; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <svg style="width: 40px; height: 40px; color: #ff4d4f;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h2 style="color: #1a1a1a; margin: 0 0 10px; font-size: 22px; font-weight: 700;">SERVER DISCONNECTED</h2>
                    <div style="text-align: left; background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #444; border: 1px solid #e8e8e8;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <strong>Domain:</strong> <span>${window.location.hostname}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <strong>IP:</strong> <span>${userIp}</span>
                        </div>
                    </div>
                    <p style="color: #666; font-size: 13px; margin-bottom: 25px;">Backend server tidak merespon atau akses diblokir.</p>
                    <div style="display: grid; gap: 10px;">
                        <button onclick="window.location.reload()" style="cursor: pointer; padding: 12px; background: #0088cc; color: white; border: none; border-radius: 8px; font-weight: 600;">Coba Muat Ulang</button>
                    </div>
                </div>
            </div>`;
        
        document.body.innerHTML = errorHtml;
	};

	const renderNotFound = () => {
        const notFoundHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f2f5;">
                <div style="text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 400px; width: 90%;">
                    <div style="font-size: 80px; font-weight: 800; color: #e8e8e8; line-height: 1; margin-bottom: 10px;">404</div>
                    <h2 style="color: #1a1a1a; margin: 0 0 10px; font-size: 22px; font-weight: 700;">Halaman Tidak Ditemukan</h2>
                    <p style="color: #666; font-size: 14px; margin-bottom: 25px; line-height: 1.6;">Maaf, artikel yang Anda cari tidak ditemukan, mungkin sudah dihapus, atau ada kesalahan pada URL.</p>
                    <a href="/" style="display: inline-block; cursor: pointer; padding: 12px 24px; background: #0088cc; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: background 0.3s;">Kembali ke Beranda</a>
                </div>
            </div>`;
        
        document.body.innerHTML = notFoundHtml;
        document.title = "404 Not Found - " + CONFIG.SITE_NAME;
    };
	
    const loadHome = async () => {
        const res = await fetchAPI('/api/news');
        if (!res) return renderNoConnection();

        const homeKeywords = makeKeywordString([CONFIG.DEFAULT_KEYWORDS, ...(res.data || []).slice(0, 15).map(item => item.keyword || item.title || item.slug)]);

        applySeoMeta({
			title: CONFIG.SITE_NAME,
			description: CONFIG.DEFAULT_DESCRIPTION,
			keywords: homeKeywords,
			image: CONFIG.DEFAULT_IMAGE,
			url: `${CONFIG.DOMAIN}/`,
			type: 'website' 
		});

        // 3. Menggunakan <h2> untuk listing di Home
		const listHtml = res.data.map(news => `
        <div class="listNews" style="margin-bottom:20px;">
            <small class="text-muted">${formatSimpleDate(news.created_at)}</small>
            <h2 style="font-size: 16px; margin: 3px 0 0 0; line-height: 1.4;">
                <a href="${getLink(news.slug, 'askme')}" style="color:#086cab; font-weight:bold; text-decoration:none;">
                    ${toTitleCase(news.keyword)}
                </a>
            </h2>
        </div>`).join('');
		
        document.body.innerHTML = wrapInLayout(`<div class="row"><div class="col-md-8 col-md-offset-2"><div class="listMoreLeft divColumn" id="news-list">${listHtml}</div></div></div>`);
    };
	
    const loadDetail = async (slug, type = "news") => {
		const detailEndpoint = `/api/news/${type}/${slug}`;
		if (!memoryCache.has(detailEndpoint)) renderSkeletonDetail();
		
		const [resDetail, resBacklinks, resRelated] = await Promise.all([
			fetchAPI(detailEndpoint),
            null, 
			fetchAPI('/api/news/related').catch(() => null)
		]);
		
		if (resDetail && resDetail.status === "not_found") {
			return renderNotFound();
		}

		if (!resDetail || resDetail.status !== "success") {
			return renderNoConnection();
		}

		const news = resDetail.data;
		const pubDateUTC = formatUTCDate(news.created_at || news.updated_at);
        const pubDateSimple = formatSimpleDate(news.created_at || news.updated_at);
		const cleanTitle = toTitleCase(news.keyword || news.title);

		let contentData = news.json_sentences || news.content || []; 
		let imagesData = news.json_images || news.images || [];

		if (typeof contentData === 'string') { try { contentData = JSON.parse(contentData); } catch(e) { contentData = [contentData]; } }
		if (typeof imagesData === 'string') { try { imagesData = JSON.parse(imagesData); } catch(e) { imagesData = []; } }

		const detailDescription = limitText(news.meta_desc || (Array.isArray(contentData) ? contentData.join(' ') : contentData) || cleanTitle, 160);
		const detailKeywords = makeKeywordString([news.meta_keyword, news.keyword, news.title, slug, CONFIG.DEFAULT_KEYWORDS]);
		const detailImage = getFirstImageUrl(imagesData) || CONFIG.DEFAULT_IMAGE;
		const detailUrl = `${CONFIG.DOMAIN}${getLink(slug, type)}`;
		
		const schemaGraph = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": ["Person", "Organization"],
                    "@id": `${CONFIG.DOMAIN}/#person`,
                    "name": "Admin"
                },
                {
                    "@type": "WebSite",
                    "@id": `${CONFIG.DOMAIN}/#website`,
                    "url": `${CONFIG.DOMAIN}/`,
                    "name": CONFIG.SITE_NAME,
                    "publisher": { "@id": `${CONFIG.DOMAIN}/#person` },
                    "inLanguage": "en_US"
                },
                {
                    "@type": "ImageObject",
                    "@id": detailImage,
                    "url": detailImage,
                    "inLanguage": "en_US"
                },
                {
                    "@type": "WebPage",
                    "@id": `${detailUrl}#webpage`,
                    "url": detailUrl,
                    "name": cleanTitle,
                    "datePublished": pubDateUTC,
                    "dateModified": pubDateUTC,
                    "primaryImageOfPage": { "@id": detailImage },
                    "inLanguage": "en_US"
                },
                {
                    "@type": "Person",
                    "@id": `${CONFIG.DOMAIN}/page/contact.html`,
                    "name": "Admin",
                    "url": `${CONFIG.DOMAIN}/page/contact.html`
                
                },
                {
                    "@type": "BlogPosting",
                    "headline": cleanTitle,
                    "keywords": detailKeywords,
                    "datePublished": pubDateUTC,
                    "dateModified": pubDateUTC,
                    "articleSection": type,
                    "author": { "@id": `${CONFIG.DOMAIN}/page/contact.html`, "name": "Admin" },
                    "publisher": { "@id": `${CONFIG.DOMAIN}/#person` },
                    "description": detailDescription,
                    "name": cleanTitle,
                    "@id": `${detailUrl}#richSnippet`,
                    "image": { "@id": detailImage },
                    "inLanguage": "en_US",
                    "mainEntityOfPage": { "@id": `${detailUrl}#webpage` }
                }
            ]
        };

		const schemaBreadcrumb = {
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			"itemListElement": [
				{
					"@type": "ListItem",
					"position": 1,
					"name": "Home",
                    "item": `${CONFIG.DOMAIN}/`
				},
				{
					"@type": "ListItem",
					"position": 2,
					"name": cleanTitle,
                    "item": detailUrl
				}
			]
		};

		injectSchema(schemaGraph);
		injectSchema(schemaBreadcrumb);

        applySeoMeta({
            title: `${cleanTitle} - ${CONFIG.SITE_NAME}`,
            description: detailDescription,
            keywords: detailKeywords,
            image: detailImage,
            url: detailUrl,
            type: 'article',
            createdAt: pubDateUTC
        });

		const bodyHtml = contentData.map((text, i) => {
			const imgUrl = (imagesData && imagesData[i]) ? (imagesData[i].url || imagesData[i]) : "";
			const imgTag = imgUrl ? `<img src="${imgUrl}" alt="${cleanTitle}" style="width:100%; max-width:600px; height:auto; border-radius:8px; margin: 15px 0;" loading="lazy">` : "";
			return `<p>${text}</p>${imgTag}`;
		}).join('');
		
        const backlinksHtml = '';
		//const backlinksHtml = (resBacklinks && resBacklinks.data) ? resBacklinks.data.map(l => `<a href="${l.url}" target="_blank" style="margin-right:10px; color:#0088cc;">${toTitleCase(l.keyword)}</a>`).join('• ') : '';
		
        const relatedHtml = (resRelated && resRelated.data)
            ? resRelated.data.slice(0, 25).map(item => `
                <div class="listNews" style="margin-bottom:15px; padding-bottom:10px; border-bottom: 1px solid #f0f0f0;">
                    <small class="text-muted" style="font-size:11px;">${formatSimpleDate(item.created_at)}</small>
                    <h3 style="font-size:14px; margin: 3px 0 0 0; line-height: 1.4;">
                        <a href="${getLink(item.slug, 'askme')}" style="color:#086cab; text-decoration:none;">${toTitleCase(item.keyword)}</a>
                    </h3>
                </div>`).join('')
            : '';

        const detailHtml = `<div class="row">
                <div class="col-sm-8">
                    <article class="newsContent">
                        <h1 style="font-size: 24px; line-height: 1.3; font-weight:bold; margin-top:0;">${cleanTitle}</h1>
                        <small class="text-muted">${pubDateSimple}</small>
                        <hr>
                        <div>${bodyHtml}</div>
                        
                        ${backlinksHtml ? `
                        <div style="margin-top: 40px; font-size: 16px; padding:5px; background:#fff; border-radius:8px;">
							<h3 class="sidebar-title" style="border-left:4px solid #333; padding-left:10px; font-weight:bold; margin-bottom:15px; font-size:1.2em;">Recommended</h3>
							<div style="line-height:2;">${backlinksHtml}</div>
						</div>` : ''}
                    </article>
                </div>
                <aside class="col-sm-4">
                    <div id="ads-320x50" style="width:320px; height:50px; margin-bottom:30px; background:#f0f0f0; display:flex; align-items:center; justify-content:center; color:#999; border-radius:8px; margin-left:auto; margin-right:auto;"></div>
					
                    ${relatedHtml ? `
                    <h2 class="sidebar-title" style="font-weight:bold; border-bottom:2px solid #333; padding-bottom:10px; margin-bottom:20px; font-size:1.5em;">Related Posts</h2>
					<div>${relatedHtml}</div>
                    ` : ''}
                </aside>
            </div>`;

        document.body.innerHTML = wrapInLayout(detailHtml);
    };

    const renderRawXml = async (type) => {
		try {
            const urlFormat = isTldMode ? 'tld' : 'blogspot';
            
            const currentPage = pageParam || 1;
            
			const targetUrl = `${CONFIG.API_URL}/api/${type}?key=${CONFIG.API_KEY}&domain=${encodeURIComponent(CONFIG.DOMAIN)}&db=${CONFIG.DATABASE_NAME}&format=${urlFormat}&page=${currentPage}`;

			const res = await fetch(targetUrl, {
				method: 'GET',
				headers: {
					'x-api-key': CONFIG.API_KEY,
					'Accept': 'application/xml'
				}
			});

			if (!res.ok) {
				if (res.status === 403) throw new Error('Akses Ditolak (403)');
				throw new Error(`Server merespon dengan status: ${res.status}`);
			}

			const xmlText = await res.text();
			
			document.open("text/xml", "replace");
			document.write(xmlText);
			document.close();

		} catch (e) {
			console.error("XML Render Error:", e);
			document.body.innerHTML = `
				<div style="padding:50px; font-family:sans-serif; text-align:center;">
					<h2 style="color:red;">XML Render Error</h2>
					<p>${e.message}</p>
					<button onclick="window.location.reload()" style="padding:10px 20px; cursor:pointer;">Coba Lagi</button>
				</div>`;
		}
	};
    
    const lowerPath = pathName.toLowerCase();
	if (pageParam === 'sitemap' || lowerPath.endsWith('sitemap.xml') || lowerPath.endsWith('atom.xml')) {
		await renderRawXml('sitemap'); 
	} 
	else if (pageParam === 'rss' || lowerPath.endsWith('rss.xml')) {
		await renderRawXml('rss');
	} 
	else if (detailSlug) {
		await loadDetail(detailSlug, paramType);
		if (typeof fillHomeAds === "function") {
			const topAds = document.getElementById('ads-728x90');
			if (topAds) { topAds.style.display = 'block'; fillHomeAds(); }
		}
		if (typeof fillDetailAds === "function") fillDetailAds();
        if (typeof fillStickyAds === "function") fillStickyAds(); 
	} 
	else {
		await loadHome();
		if (typeof fillHomeAds === "function") {
			const topAds = document.getElementById('ads-728x90');
			if (topAds) { topAds.style.display = 'block'; fillHomeAds(); }
		}
        if (typeof fillStickyAds === "function") fillStickyAds(); 
	}
})();
