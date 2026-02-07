(async () => {
    const CONFIG = {
        API_URL: "https://newsgo.space",
        API_KEY: "berbahagia",
        DOMAIN: window.location.origin
    };

    const pathName = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);

    const pageParam = urlParams.get('page');
    const detailSlug = urlParams.get('detail') || (pathName !== '/' ? pathName.substring(1) : null);
    let isTldMode = (pathName !== '/' && !urlParams.has('detail'));

    const formatIndoDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + " WIB" : "";
    const toTitleCase = (s) => s ? s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase()) : "";

    const getLink = (slug) => {
        return isTldMode ? `/${slug}` : `/?detail=${slug}`;
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
								<a href="/" class="mh-auto"><img id="main-logo" src="https://cdn.jsdelivr.net/gh/luqmanthinkpad/csrnew/img/n1_ipotnews.png" class="img-responsive hidden-xs hidden-sm mh-auto"></a><a href="/" class="mh-auto"><img id="main-logo-mobile" src="https://cdn.jsdelivr.net/gh/luqmanthinkpad/csrnew/img/n1_ipotnews_w.png" class="img-responsive visible-xs visible-sm mh-auto"></a>
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
                        <p style="font-size: 12px; color: #777;">&copy; 2026 All rights reserved.</p>
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
			</div>
    `;

	
	const injectSchema = (data) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(data);
        document.head.appendChild(script);
    };
	
    const renderSkeletonHome = () => {
        let items = "";
        for (let i = 0; i < 8; i++) {
            items += `
                <div class="sk-item">
                    <div class="skeleton sk-text"></div>
                    <div class="skeleton sk-title"></div>
                </div>`;
        }
        document.body.innerHTML = getSkeletonStyle() + wrapInLayout(`<div class="row"><div class="col-md-8 col-md-offset-2"><div class="listMoreLeft">${items}</div></div></div>`);
    };

    const renderSkeletonDetail = () => {
        const skeletonBody = `
            <div class="row">
                <div class="col-sm-8">
                    <div class="skeleton sk-h1"></div>
                    <div class="skeleton sk-text" style="margin-bottom:20px;"></div>
                    <hr>
                    <div class="skeleton sk-img"></div>
                    <div class="skeleton sk-body"></div>
                    <div class="skeleton sk-body"></div>
                    <div class="skeleton sk-body" style="width:75%;"></div>
                </div>
                <aside class="col-sm-4">
                    <div class="skeleton" style="height:250px; width:300px; margin-bottom:30px;"></div>
                    <div class="skeleton sk-title" style="width:50%; height:25px;"></div>
                    <div class="skeleton sk-item" style="height:50px;"></div>
                    <div class="skeleton sk-item" style="height:50px;"></div>
                </aside>
            </div>
        `;
        document.body.innerHTML = getSkeletonStyle() + wrapInLayout(skeletonBody);
    };

    const renderNoConnection = async () => {
        let userIp = "Mendeteksi...";
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            userIp = ipData.ip;
        } catch (e) {}

        document.body.innerHTML = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f2f5;">
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

    const fetchAPI = async (endpoint) => {
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                headers: {
                    'x-api-key': CONFIG.API_KEY,
                    'original-domain': CONFIG.DOMAIN
                }
            });
            if (!response.ok) throw new Error("Server Error");
            return await response.json();
        } catch (e) {
            return null;
        }
    };

    const loadHome = async () => {
        renderSkeletonHome();
        const res = await fetchAPI('/api/news');
        if (!res || res.status !== "success") return renderNoConnection();

		injectSchema({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": res.data.map((news, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `${CONFIG.DOMAIN}${getLink(news.slug)}`
            }))
        });
		
        const listHtml = res.data.map(news => `<dl class="listNews" style="margin-bottom:20px; margin-top:0px; "><small class="text-muted">${formatIndoDate(news.created_at)}</small><dt><a href="${getLink(news.slug)}" style="color:#086cab; text-decoration:none; font-weight:bold;">${toTitleCase(news.keyword)}</a></dt></dl>`).join('');

        document.body.innerHTML = wrapInLayout(`<div class="listMoreLeft divColumn" id="news-list">${listHtml}</div>`);
    };

    const loadDetail = async (slug) => {
        renderSkeletonDetail();
        
        const [resDetail, resBacklinks, resRelated] = await Promise.all([
            fetchAPI(`/api/news/detail/${slug}`),
            fetchAPI('/api/backlinks'),
            fetchAPI('/api/news') 
        ]);

        if (!resDetail || resDetail.status !== "success") return renderNoConnection();

        const news = resDetail.data;
        const b = resBacklinks || { data: [] };
        const r = resRelated || { data: [] };
        
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
		
        const bodyHtml = news.json_sentences.map((text, i) => {
            const img = (news.json_images && news.json_images[i]) ? `<img src="${news.json_images[i].url}" alt="${news.keyword}" style="width:50%; border-radius:8px; margin: 10px 0 20px 0;" loading="lazy">` : "";
            return `<p style="margin-bottom:15px; font-size:16px; line-height:1.7;">${text}</p>${img}`;
					
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
                            <div style="line-height:2;">
                                ${b.data ? b.data.map(l => `<a href="${l.url}" target="_blank" style="margin-right:10px; color:#0088cc;">${toTitleCase(l.keyword)}</a>`).join('• ') : ""}
                            </div>
                        </div>
                    </article>
                </div>
                <aside class="col-sm-4">
					<div id="ads-320x50" style="width:300px; height:250px; margin-bottom:30px; background:#f0f0f0; display:flex; align-items:center; justify-content:center; color:#999; border-radius:8px;">ADVERTISEMENT</div>
                    <h4 class="sidebar-title" style="font-weight:bold; border-bottom:2px solid #333; padding-bottom:10px; margin-bottom:20px;">Related Posts</h4>
                    ${r.data ? r.data.slice(0, 25).map(item => `<dl class="listNews" style="margin-bottom:15px; padding-bottom:10px;"><small class="text-muted" style="font-size:11px;">${formatIndoDate(item.created_at)}</small><dt style="font-size:14px; margin-top:3px;"><a href="${getLink(item.slug)}" style="color:#086cab; text-decoration:none;">${toTitleCase(item.keyword)}</a></dt></dl>`).join('') : ""}
                </aside>
            </div>`;

        document.body.innerHTML = wrapInLayout(detailHtml);
    };

    const renderRawXml = async (type) => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/api/${type}`, {
                headers: { 'x-api-key': CONFIG.API_KEY, 'original-domain': CONFIG.DOMAIN }
            });
            const xmlText = await res.text();
            document.open("text/xml", "replace");
            document.write(xmlText);
            document.close();
        } catch (e) {
            renderNoConnection();
        }
    };

    const injectMetaLinks = () => {
        const head = document.head;
        if (!document.querySelector('link[rel="sitemap"]')) {
            const s = document.createElement('link');
            s.rel = 'sitemap'; 
            s.type = 'application/xml';
            s.href = `${CONFIG.DOMAIN}/?page=sitemap`;
            head.appendChild(s);
        }
    };

    // --- ROUTER ---
    injectMetaLinks();
    
    if (pageParam === 'sitemap') {
        await renderRawXml('sitemap');
    } else if (pageParam === 'rss') {
        await renderRawXml('rss');
    } else if (detailSlug) {
        await loadDetail(detailSlug);
		if (typeof direct === "function") direct();
            else if (window.direct && typeof window.direct === "function") window.direct();
		
		//if (typeof fillHomeAds === "function") fillHomeAds();
        if (typeof fillDetailAds === "function") {
            const topAds = document.getElementById('top-home-ads');
            if (topAds) topAds.style.display = 'block'; 
            fillDetailAds();
        }
    } else {
        await loadHome();
		if (typeof direct === "function") direct();
            else if (window.direct && typeof window.direct === "function") window.direct();
		
		//if (typeof showMyAds === "function") showMyAds();
		if (typeof fillHomeAds === "function") {
			const topAds = document.getElementById('ads-728x90');
            if (topAds) topAds.style.display = 'block'; 
            fillHomeAds();
		}
    }
})();
