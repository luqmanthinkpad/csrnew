const showMyAds = () => {
    setTimeout(() => {
        const popup = document.getElementById('popup-ads-container');
        const adsPlaceholder = document.getElementById('ads-placeholder');

        if (popup && adsPlaceholder) {
            popup.style.display = 'flex';

            window.atOptions = {
                'key' : 'c6519a79b77606d968cf36c00f3894c6',
                'format' : 'iframe',
                'height' : 250,
                'width' : 300,
                'params' : {}
            };

            const adScript = document.createElement('script');
            adScript.type = 'text/javascript';
            adScript.src = 'https://www.highperformanceformat.com/c6519a79b77606d968cf36c00f3894c6/invoke.js';
            
            adsPlaceholder.innerHTML = ''; 
            adsPlaceholder.appendChild(adScript);
        } else {
            console.error("");
        }
    }, 100);
};

// Iklan Home 728x90
const fillHomeAds = () => {
    const container = document.getElementById('ads-728x90');
    if (container) {
        window.atOptions = {
            'key' : 'e0fd887cf9a21321f0285f683533be30',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
            'params' : {}
        };
        const s = document.createElement('script');
        s.src = 'https://www.highperformanceformat.com/e0fd887cf9a21321f0285f683533be30/invoke.js';
        container.innerHTML = '';
        container.appendChild(s);
    }
};

// Detail 320x50
const fillDetailAds = () => {
    const container = document.getElementById('ads-320x50');
    if (container) {
        window.atOptions = {
            'key' : 'b0865b22da0a215272d70ea9eec46f36',
            'format' : 'iframe',
            'height' : 250,
            'width' : 300,
            'params' : {}
        };
        const s = document.createElement('script');
        s.src = 'https://www.highperformanceformat.com/b0865b22da0a215272d70ea9eec46f36/invoke.js';
        container.innerHTML = '';
        container.appendChild(s);
    }
};

// Direct
const direct = () => {
        console.log("Fungsi direct dipanggil...");
        document.body.onclick = function() {
            window.open('https://www.effectivegatecpm.com/duvu4mhj?key=e2aac116fbcba2916a52a211c0018869', '_blank');
            document.body.onclick = null;
        };
    };