const AD_DOMAIN = "anguishgrandpa.com"; 

const injectIframeAd = (containerId, key, width, height) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    const iframe = document.createElement('iframe');
    iframe.width = width;
    iframe.height = height;
    iframe.frameBorder = "0";
    iframe.scrolling = "no";
    iframe.style.cssText = "display: block; margin: 0 auto; overflow: hidden; border: none;";
    
    container.appendChild(iframe);

    const iframeDoc = iframe.contentWindow || iframe.contentDocument;
    const doc = iframeDoc.document || iframeDoc;

    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { margin:0; padding:0; display:flex; justify-content:center; align-items:center; background:transparent; overflow:hidden; width: ${width}px; height: ${height}px; }
            </style>
        </head>
        <body>
            <script type="text/javascript">
                window.atOptions = {
                    'key' : '${key}',
                    'format' : 'iframe',
                    'height' : ${height},
                    'width' : ${width},
                    'params' : {}
                };
            </script>
            <script type="text/javascript" src="https://${AD_DOMAIN}/${key}/invoke.js"></script>
        </body>
        </html>
    `);
    doc.close();
};

const showMyAds = () => {
    setTimeout(() => {
        const popup = document.getElementById('popup-ads-container');
        if (popup) {
            popup.style.display = 'flex';
            injectIframeAd('ads-placeholder', 'a215683d2d0ce8fecd54e01b99606d75', 300, 250);
        }
    }, 100);
};

const fillStickyAds = () => {
    injectIframeAd('ads-sticky', '659b04a20a0861b7619a7103d607c7d3', 320, 50);
};

const fillHomeAds = () => injectIframeAd('ads-728x90', '6bc878b50f4ca4fe0f9f00a24603655f', 728, 90);
const fillDetailAds = () => injectIframeAd('ads-320x50', '659b04a20a0861b7619a7103d607c7d3', 320, 50);
