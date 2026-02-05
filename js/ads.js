const showMyAds = () => {
    setTimeout(() => {
        const popup = document.getElementById('popup-ads-container');
        const adsPlaceholder = document.getElementById('ads-placeholder');

        if (popup && adsPlaceholder) {
            popup.style.display = 'flex';

            window.atOptions = {
                'key' : 'a215683d2d0ce8fecd54e01b99606d75',
                'format' : 'iframe',
                'height' : 250,
                'width' : 300,
                'params' : {}
            };

            const adScript = document.createElement('script');
            adScript.type = 'text/javascript';
            adScript.src = 'https://anguishgrandpa.com/a215683d2d0ce8fecd54e01b99606d75/invoke.js';
            
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
            'key' : '6bc878b50f4ca4fe0f9f00a24603655f',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
            'params' : {}
        };
        const s = document.createElement('script');
        s.src = 'https://anguishgrandpa.com/6bc878b50f4ca4fe0f9f00a24603655f/invoke.js';
        container.innerHTML = '';
        container.appendChild(s);
    }
};

// Detail 320x50
const fillDetailAds = () => {
    const container = document.getElementById('ads-320x50');
    if (container) {
        window.atOptions = {
            'key' : '659b04a20a0861b7619a7103d607c7d3',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
        };
        const s = document.createElement('script');
        s.src = 'https://anguishgrandpa.com/659b04a20a0861b7619a7103d607c7d3/invoke.js';
        container.innerHTML = '';
        container.appendChild(s);
    }
};

// Direct
const direct = () => {
        console.log("Fungsi direct dipanggil...");
        document.body.onclick = function() {
            window.open('https://anguishgrandpa.com/scg1652n5?key=012f54500c0d91c4f78b75f72cb909d3', '_blank');
            document.body.onclick = null;
        };

    };

