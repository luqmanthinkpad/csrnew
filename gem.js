(function () {
  // Prevent duplicate execution
  if (document.getElementById('adsterra-sticky-footer')) return;

  var isLoaded = false;

  function loadStickyFooterAd() {
    if (isLoaded) return;
    isLoaded = true;

    // Clean up event listeners
    window.removeEventListener('scroll', loadStickyFooterAd);
    window.removeEventListener('touchstart', loadStickyFooterAd);
    window.removeEventListener('mousemove', loadStickyFooterAd);

    // 1. Inject required CSS
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = 
      '#adsterra-sticky-footer {' +
        'position: fixed;' +
        'bottom: 0;' +
        'left: 0;' +
        'width: 100%;' +
        'z-index: 999999;' +
        'background: rgba(255, 255, 255, 0.98);' +
        'box-shadow: 0 -3px 12px rgba(0,0,0,0.18);' +
        'text-align: center;' +
        'padding: 6px 0;' +
      '}' +
      '#adsterra-close-btn {' +
        'position: absolute;' +
        'top: -28px;' +
        'right: 12px;' +
        'background: #1e293b;' +
        'color: #ffffff;' +
        'border: none;' +
        'border-radius: 6px 6px 0 0;' +
        'padding: 5px 12px;' +
        'font-size: 12px;' +
        'font-family: sans-serif;' +
        'font-weight: 600;' +
        'cursor: pointer;' +
        'line-height: 1;' +
        'box-shadow: 0 -2px 6px rgba(0,0,0,0.12);' +
      '}' +
      '#adsterra-banner-container {' +
        'display: flex;' +
        'justify-content: center;' +
        'align-items: center;' +
        'overflow: hidden;' +
      '}';
    document.head.appendChild(style);

    // 2. Create markup elements
    var wrapper = document.createElement('div');
    wrapper.id = 'adsterra-sticky-footer';

    

    var container = document.createElement('div');
    container.id = 'adsterra-banner-container';

  
    wrapper.appendChild(container);
    document.body.appendChild(wrapper);

    // 3. Screen width detection (Desktop: 728x90, Mobile: 320x50)
    var isDesktop = window.innerWidth > 768;
    var adConfig = isDesktop ? {
      key: '6bc878b50f4ca4fe0f9f00a24603655f',
      width: 728,
      height: 90
    } : {
      key: '659b04a20a0861b7619a7103d607c7d3',
      width: 320,
      height: 50
    };

    container.style.minHeight = adConfig.height + 'px';

    // 4. Inject Adsterra configurations
    var confScript = document.createElement('script');
    confScript.type = 'text/javascript';
    confScript.text = 'atOptions = ' + JSON.stringify({
      'key': adConfig.key,
      'format': 'iframe',
      'height': adConfig.height,
      'width': adConfig.width,
      'params': {}
    }) + ';';

    // 5. Inject Adsterra invoke.js script
    var invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://anguishgrandpa.com/' + adConfig.key + '/invoke.js';

    container.appendChild(confScript);
    container.appendChild(invokeScript);
  }

  // Interaction triggers for lazy loading
  window.addEventListener('scroll', loadStickyFooterAd, { passive: true, once: true });
  window.addEventListener('touchstart', loadStickyFooterAd, { passive: true, once: true });
  window.addEventListener('mousemove', loadStickyFooterAd, { passive: true, once: true });

  // Fallback after 4 seconds if no user interaction
  setTimeout(loadStickyFooterAd, 4000);
})();
