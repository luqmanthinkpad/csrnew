(async () => {
     const CONFIG = {
		API_URL: "https://newsgo.space",
		API_KEY: "berbahagia", 
		DOMAIN: window.location.origin,
		DATABASE_NAME: "database" 
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

    const formatIndoDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + " WIB" : "";
    const toTitleCase = (s) => s ? s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase()) : "";
    const getLink = (slug, prefix = "news") => {
		return isTldMode ? `/${prefix}/${slug}` : `/?detail=${slug}`;
	};

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
                <footer class="footer pt20 pb20 bgcolor-gray" style="border-top: 1px solid #eee; margin-top: 30px;">
                    <div class="container text-center">
                        <p style="font-size: 12px; color: #777;">&copy; All rights reserved.</p>
                    </div>
                </footer>
            </div>
            <div id="popup-ads-container" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:center;">
				<div class="popup-content" style="position:relative; background:#fff; padding:10px; border-radius:8px; width:320px; min-height:270px; display:flex; flex-direction:column; align-items:center;">
					<button onclick="document.getElementById('popup-ads-container').style.display='none'" style="position:absolute; top:-15px; right:-15px; background:#000; color:#fff; border-radius:50%; width:30px; height:30px; border:2px solid #fff; cursor:pointer; font-size:18px; line-height:1;">&times;</button>
					<div id="ads-placeholder" style="width:300px; height:250px; overflow:hidden;"></div>
				</div>
			</div>
    `;

	const injectSchema = (data) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(data);
        document.head.appendChild(script);
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
                <hr style="width:50px; border:1px solid #eee;">
                <button onclick="window.location.reload()" style="padding:10px 20px; cursor:pointer;">Coba Muat Ulang</button>
            </div>
        `;
    };

    const loadHome = async () => {
        if(!memoryCache.has('/api/news')) renderSkeletonHome();
        
        const res = await fetchAPI('/api/news');
        if (!res) return renderNoConnection();

		injectSchema({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": res.data.map((news, index) => ({
                "@type": "ListItem", "position": index + 1, "url": `${CONFIG.DOMAIN}${getLink(news.slug)}`
            }))
        });
		
		const listHtml = res.data.map(news => `
    <dl class="listNews" style="margin-bottom:20px;">
        <small class="text-muted">${formatIndoDate(news.created_at)}</small>
        <dt><a href="${getLink(news.slug, 'askme')}" style="color:#086cab; font-weight:bold;">
            ${toTitleCase(news.keyword)}
        </a></dt>
    </dl>`).join('');
		
        document.body.innerHTML = wrapInLayout(`<div class="row"><div class="col-md-8 col-md-offset-2"><div class="listMoreLeft divColumn" id="news-list">${listHtml}</div></div></div>`);
    };

	
    const loadDetail = async (slug, type = "news") => {
        const detailEndpoint = `/api/news/${type}/${slug}`;
        if(!memoryCache.has(detailEndpoint)) renderSkeletonDetail();
        
        const resDetail = await fetchAPI(detailEndpoint);
        if (!resDetail) return renderNoConnection();

        const news = resDetail.data;
        document.title = toTitleCase(news.keyword);
		
		injectSchema({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": toTitleCase(news.keyword),
            "image": news.json_images || [],
            "datePublished": news.created_at,
            "dateModified": news.created_at,
            "author": {
                "@type": "Organization",
                "name": "X"
            }
        });
		
		let contentData = news.json_sentences || news.content || []; 
		let imagesData = news.json_images || news.images || [];

		if (typeof contentData === 'string') {
			try { contentData = JSON.parse(contentData); } catch(e) { contentData = [contentData]; }
		}
		if (typeof imagesData === 'string') {
			try { imagesData = JSON.parse(imagesData); } catch(e) { imagesData = []; }
		}

		const bodyHtml = contentData.map((text, i) => {
			const imgUrl = (imagesData && imagesData[i]) ? (imagesData[i].url || imagesData[i]) : "";
			const imgTag = imgUrl ? `<img src="${imgUrl}" alt="${news.keyword || news.title}" style="width:50%; border-radius:8px; margin: 10px 0 20px 0;">` : "";
			return `<p>${text}</p>${imgTag}`;
		}).join('');
		
        const detailHtml = `<div class="row">
                <div class="col-sm-8">
                    <article class="newsContent">
                        <h1 style="font-size: 24px; line-height: 1.3; font-weight:bold; margin-top:0;">${toTitleCase(news.keyword)}</h1>
                        <small class="text-muted">${formatIndoDate(news.created_at)}</small>
                        <hr>
                        <div>${bodyHtml}</div>
                        
                        <div style="margin-top: 40px; font-size: 16px; padding:5px; background:#fff; border-radius:8px;">
                            <h4 class="sidebar-title" style="border-left:4px solid #333; padding-left:10px; font-weight:bold; margin-bottom:15px;">Recommended</h4>
                            <div id="backlink-container" style="line-height:2;"><span class="skeleton sk-text"></span></div>
                        </div>
                    </article>
                </div>
                <aside class="col-sm-4">
					<div id="ads-320x50" style="width:300px; height:250px; margin-bottom:30px; background:#f0f0f0; display:flex; align-items:center; justify-content:center; color:#999; border-radius:8px;">ADVERTISEMENT</div>
                    <h4 class="sidebar-title" style="font-weight:bold; border-bottom:2px solid #333; padding-bottom:10px; margin-bottom:20px;">Related Posts</h4>
                    <div id="related-container">
                        <div class="skeleton sk-item" style="height:50px;"></div><div class="skeleton sk-item" style="height:50px;"></div>
                    </div>
                </aside>
            </div>`;

        document.body.innerHTML = wrapInLayout(detailHtml);

        fetchAPI('/api/backlinks').then(b => {
            const container = document.getElementById('backlink-container');
            if(container && b && b.data) {
                container.innerHTML = b.data.map(l => `<a href="${l.url}" target="_blank" style="margin-right:10px; color:#0088cc;">${toTitleCase(l.keyword)}</a>`).join('• ');
            }
        });

        fetchAPI('/api/news/related').then(r => {
            const container = document.getElementById('related-container');
            if(container && r && r.data) {
                container.innerHTML = r.data.slice(0, 25).map(item => `
                    <dl class="listNews" style="margin-bottom:15px; padding-bottom:10px;">
                        <small class="text-muted" style="font-size:11px;">${formatIndoDate(item.created_at)}</small>
                        <dt style="font-size:14px; margin-top:3px;">
                            <a href="${getLink(item.slug, 'askme')}" style="color:#086cab; text-decoration:none;">
                                ${toTitleCase(item.keyword)}
                            </a>
                        </dt>
                    </dl>`).join('');
            }
        });
    };

    const renderRawXml = async (type) => {
		try {
			const targetUrl = `${CONFIG.API_URL}/api/${type}?key=${CONFIG.API_KEY}&domain=${encodeURIComponent(CONFIG.DOMAIN)}`;

			const res = await fetch(targetUrl, {
				method: 'GET',
				headers: {
					'x-api-key': CONFIG.API_KEY,
					'Accept': 'application/xml'
				}
			});

			if (!res.ok) {
				if (res.status === 403) throw new Error('Akses Ditolak (403): Cek API_KEY di .env Backend dan Frontend harus sama.');
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
    const injectMetaLinks = () => {
        if (!document.querySelector('link[rel="sitemap"]')) {
            const s = document.createElement('link'); s.rel = 'sitemap'; s.type = 'application/xml'; s.href = `${CONFIG.DOMAIN}/?page=sitemap`;
            document.head.appendChild(s);
        }
    };

    injectMetaLinks();
    
    if (pageParam === 'sitemap') await renderRawXml('sitemap');
    else if (pageParam === 'rss') await renderRawXml('rss');
    else if (detailSlug) {
        await loadDetail(detailSlug, paramType);
		if (typeof initHistats === "function") initHistats();
		if (typeof direct === "function") direct(); else if (window.direct && typeof window.direct === "function") window.direct();
        if (typeof fillDetailAds === "function") {
            const topAds = document.getElementById('top-home-ads');
            if (topAds) topAds.style.display = 'block'; 
            fillDetailAds();
        }
    } else {
        await loadHome();
		if (typeof initHistats === "function") initHistats();
		if (typeof direct === "function") direct(); else if (window.direct && typeof window.direct === "function") window.direct();
		if (typeof fillHomeAds === "function") {
			const topAds = document.getElementById('ads-728x90');
            if (topAds) topAds.style.display = 'block'; 
            fillHomeAds();
		}
    }
})();
