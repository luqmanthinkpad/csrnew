(async () => {
    const CONFIG = {
        API_URL: "https://newsgo.space",
        API_KEY: "berbahagia",
        DOMAIN: window.location.origin
    };

	let isTldMode = false; // true: /slug | false: /?detail=slug
	
    const pathName = window.location.pathname;
	const urlParams = new URLSearchParams(window.location.search);
	
	const pageParam = urlParams.get('page');
	const detailSlug = isTldMode ? (pathName === '/' ? null : pathName.substring(1)) : urlParams.get('detail');

    const formatIndoDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + " WIB" : "";
    const toTitleCase = (s) => s ? s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase()) : "";

	const getLink = (slug) => {
        return isTldMode ? `/${slug}` : `/?detail=${slug}`;
    };
	
	const renderNoConnection = async () => {
        let userIp = "Loading...";
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            userIp = ipData.ip;
        } catch (e) {
            userIp = "Unable to fetch IP";
        }

        document.body.innerHTML = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f2f5;">
                <div style="text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 400px; width: 90%;">
                    <div style="background: #fff1f0; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <svg style="width: 40px; height: 40px; color: #ff4d4f;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h2 style="color: #1a1a1a; margin: 0 0 10px; font-size: 22px; font-weight: 700;">NOT CONNECTED TO SERVER</h2>
                    <div style="text-align: left; background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #444; border: 1px solid #e8e8e8;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <strong>Your Domain:</strong> <span>${window.location.hostname}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <strong>Your IP:</strong> <span>${userIp}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <strong>Status:</strong> <span style="color: #ff4d4f; font-weight: bold;">DISCONNECTED</span>
                        </div>
                    </div>
                    <p style="color: #666; font-size: 13px; margin-bottom: 25px;">Akses ditolak atau server backend tidak merespon.</p>
                    <div style="display: grid; gap: 10px;">
                        <a href="https://t.me/" target="_blank" style="text-decoration: none; padding: 12px; background: #0088cc; color: white; border-radius: 8px; font-weight: 600;">Hubungi Administrator</a>
                        <button onclick="window.location.reload()" style="cursor: pointer; padding: 12px; background: white; color: #555; border: 1px solid #ddd; border-radius: 8px;">Coba Muat Ulang</button>
                    </div>
                </div>
            </div>`;
    };
	
    const injectSchema = (data) => {
        const schemaId = 'newsgo-schema';
        let script = document.getElementById(schemaId);
        if (!script) {
            script = document.createElement('script');
            script.id = schemaId;
            script.type = 'application/ld+json';
            document.head.appendChild(script);
        }
        script.text = JSON.stringify(data);
    };

    const renderPage = (innerContent, showTitle = true) => {
		
		const displayDomain = window.location.origin.replace(/^https?:\/\//, '');
		
        document.body.innerHTML = `
			<div id="navnews" class="navbar-fixed-top">
				<div class="container">
					<div class="table-layout nm">
						<div class="col-xs-4 col-md-3 col-lg-2"></div>
						<div class="col-xs-4 col-md-6 col-lg-8">
							<div class="logo-brand text-center">
								<a href="/" class="mh-auto">
									<img id="main-logo" src="https://cdn.jsdelivr.net/gh/luqmanthinkpad/csrnew/img/n1_ipotnews.png" class="img-responsive hidden-xs hidden-sm mh-auto">
								</a>

								<a href="/" class="mh-auto">
									<img id="main-logo-mobile" src="https://cdn.jsdelivr.net/gh/luqmanthinkpad/csrnew/img/n1_ipotnews_w.png" class="img-responsive visible-xs visible-sm mh-auto">
								</a>
							</div>
						</div>
						<div class="col-xs-4 col-md-3 col-lg-2 text-right"></div>
					</div>
				</div>
			</div>
			<div class="container-fluid hidden-xs hidden-sm"><div id="navbarIpotnews" class="navbar navbar-default"><div class="collapse navbar-collapse" id="ipotnewsMainMenu">
				<ul class="nav navbar-nav navbar-news">
				
				<div id="top-home-ads" style="display:none; text-align:center; margin: 20px 0;">
					<div id="ads-728x90" style="width:728px; height:90px; margin: 0 auto; background:#f9f9f9;"></div>
				</div>
				<div class="clearfix mm-page mm-slideout">
				
				</ul>
			</div></div></div>
			
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
                <footer class="footer pt20 pb20 bgcolor-gray" style="border-top: 1px solid #eee; margin-top: 30px;">
                    <div class="container text-center">
                        <p style="font-size: 12px; color: #777;">&copy; 2026. All rights reserved.</p>
                    </div>
                </footer>
            </div>
			
			<div id="popup-ads-container" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:center;">
				<div class="popup-content" style="position:relative; background:#fff; padding:10px; border-radius:8px; width:320px; min-height:270px; display:flex; flex-direction:column; align-items:center;">
					<button onclick="document.getElementById('popup-ads-container').style.display='none'" 
							style="position:absolute; top:-15px; right:-15px; background:#000; color:#fff; border-radius:50%; width:30px; height:30px; border:2px solid #fff; cursor:pointer; font-size:18px; line-height:1;">
						&times;
					</button>
					<div id="ads-placeholder" style="width:300px; height:250px; overflow:hidden;">
						</div>
				</div>
			</div>`;
    };

    const loadHome = async () => {
        try {
			const res = await fetch(`${CONFIG.API_URL}/api/news?key=${CONFIG.API_KEY}`, {
				headers: { 
					'x-api-key': CONFIG.API_KEY, 
					'original-domain': CONFIG.DOMAIN 
				}
			});

			if (!res.ok) {
				throw new Error(`HTTP Error: ${res.status}`); 
			}

			const result = await res.json();
			
			if (pathName !== '/' && !urlParams.has('detail')) {
				isTldMode = true;
			}
			
            if (result.status === "success") {
                const listHtml = result.data.map(news => `
                    <dl class="listNews" style="margin-bottom:20px;">
                        <small>${formatIndoDate(news.created_at)}</small>
                        <dt><a href="${getLink(news.slug)}">${toTitleCase(news.keyword)}</a></dt>
                    </dl>`).join('');
                
                renderPage(`<div class="listMoreLeft divColumn" id="news-list">${listHtml}</div>`, true);

				const topAds = document.getElementById('top-home-ads');
				if (topAds) topAds.style.display = 'block';
				
				if (typeof fillHomeAds === "function") fillHomeAds();
				
                injectSchema({
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "itemListElement": result.data.map((news, index) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "url": `${CONFIG.DOMAIN}/${news.slug}`
                    }))
                });
            }
        } catch (e) {
			renderNoConnection();
		}
    };

    const loadDetail = async (slug) => {
        try {
            const [resDetail, resRelated, resBacklinks] = await Promise.all([
                fetch(`${CONFIG.API_URL}/api/news/detail/${slug}?key=${CONFIG.API_KEY}`, { headers: {'x-api-key': CONFIG.API_KEY, 'original-domain': CONFIG.DOMAIN} }),
                fetch(`${CONFIG.API_URL}/api/news?limit=6&key=${CONFIG.API_KEY}`, { headers: {'x-api-key': CONFIG.API_KEY, 'original-domain': CONFIG.DOMAIN} }),
                fetch(`${CONFIG.API_URL}/api/backlinks?key=${CONFIG.API_KEY}`, { headers: {'x-api-key': CONFIG.API_KEY, 'original-domain': CONFIG.DOMAIN} })
            ]);

			if (!resDetail.ok) throw new Error("Detail fetch failed");
			
            const d = await resDetail.json();
            const r = await resRelated.json();
            const b = await resBacklinks.json();

			isTldMode = !window.location.search.includes('detail=');
			
            if (d.status === "success") {
                const news = d.data;
                const title = toTitleCase(news.keyword);
                document.title = title;

                let bodyHtml = (news.json_sentences || []).map((text, i) => {
                    let img = news.json_images?.[i] ? `<img src="${news.json_images[i].url}" alt="${title}" style="width:50%; border-radius:8px; margin: 10px 0 20px 0;" loading="lazy">` : "";
                    return `<p style="margin-bottom:15px; font-size:16px; line-height:1.7;">${text}</p>${img}`;
                }).join('');

                injectSchema({
                    "@context": "https://schema.org",
                    "@type": "NewsArticle",
                    "headline": title,
                    "image": news.json_images?.[0]?.url || "",
                    "datePublished": news.created_at,
                    "author": { "@type": "Organization", "name": "X" }
                });

                const content = `
                    <div class="row">
                        <div class="col-sm-8">
                            <article class="newsContent">
                                <h1 style="font-size: 24px; line-height: 1.3; font-weight:bold;">${title}</h1>
                                <small class="text-muted">${formatIndoDate(news.created_at)}</small>
                                <hr>
                                <div>${bodyHtml}</div>
                                <div style="margin-top: 40px; font-size: 16px; padding:5px; background:#fff; border-radius:8px;">
                                    <h4 class="sidebar-title">Recommended</h4>
                                    ${b.data ? b.data.map(l => `<a href="${l.url}" target="_blank" style="margin-right:10px;">${toTitleCase(l.keyword)}</a>`).join(' <br> ') : ""}
                                </div>
                            </article>
                        </div>
                        <aside class="col-sm-4">
							<div id="ads-320x50" style="width:300px; height:250px; margin-bottom:15px; background:#f9f9f9;"></div>
                            <h4 class="sidebar-title">Related Posts</h4>
                            ${r.data ? r.data.map(item => `
                                <dl class="listNews" style="margin-bottom:15px;">
                                    <small class="text-muted" style="font-size:11px;">${formatIndoDate(item.created_at)}</small>
                                    <dt style="font-size:14px;"><a href="${getLink(item.slug)}">${toTitleCase(item.keyword)}</a></dt>
                                </dl>`).join('') : ""}
                        </aside>
                    </div>`;

                renderPage(content, false);
				if (typeof fillDetailAds === "function") fillDetailAds();
            }
        } catch (e) {
			renderNoConnection();
		}
    };

	// Sitemap
	const renderRawXml = async (endpoint) => {
		try {
			const res = await fetch(`${CONFIG.API_URL}/api/${endpoint}?key=${CONFIG.API_KEY}`, {
				headers: { 
					'x-api-key': CONFIG.API_KEY, 
					'original-domain': CONFIG.DOMAIN 
				}
			});
			const xmlText = await res.text();
			
			document.open("application/xml", "replace");
			document.write(xmlText);
			document.close();

			if (document.children.length > 0) {
				document.children[0].style.display = "block";
			}
		} catch (e) {
			console.error("Gagal memuat XML:", e);
			renderNoConnection(); //
		}
	};

    const injectMetaLinks = () => {
        const head = document.head;

        let sitemapLink = document.querySelector('link[rel="sitemap"]');
        if (!sitemapLink) {
            sitemapLink = document.createElement('link');
            sitemapLink.rel = 'sitemap';
            sitemapLink.type = 'application/xml';
            sitemapLink.title = 'Sitemap';
            head.appendChild(sitemapLink);
        }
        sitemapLink.href = `${CONFIG.DOMAIN}/?page=sitemap`;

        let rssLink = document.querySelector('link[rel="alternate"][type="application/rss+xml"]');
        if (!rssLink) {
            rssLink = document.createElement('link');
            rssLink.rel = 'alternate';
            rssLink.type = 'application/rss+xml';
            rssLink.title = 'RSS Feed';
            head.appendChild(rssLink);
        }
        rssLink.href = `${CONFIG.DOMAIN}/?page=rss`;
    };
	
	if (pageParam === 'sitemap') {
        return await renderRawXml('sitemap');
    }
    if (pageParam === 'rss') {
        return await renderRawXml('rss');
    }
	
	if (detailSlug) {
        await loadDetail(detailSlug);
		if (typeof initHistats === "function") initHistats(); 
		
		if (typeof showMyAds === "function") showMyAds();
		if (typeof fillDetailAds === "function") fillDetailAds();
    } else {
        await loadHome();
		if (typeof initHistats === "function") initHistats();
		
		if (typeof showMyAds === "function") showMyAds();
		if (typeof fillHomeAds === "function") fillHomeAds();
    }
	
})();
