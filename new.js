(function () {
  // Breakpoint for mobile vs non-mobile screens (in pixels)
  var MOBILE_MAX_WIDTH = 768;
  var isMobile = (window.innerWidth || document.documentElement.clientWidth) <= MOBILE_MAX_WIDTH;

  var adConfig = isMobile
    ? {
        key: '659b04a20a0861b7619a7103d607c7d3',
        format: 'iframe',
        height: 50,
        width: 320,
        params: {},
        src: 'https://hiibel.com/22/659b04a20a0861b7619a7103d607c7d3'
      }
    : {
        key: 'a215683d2d0ce8fecd54e01b99606d75',
        format: 'iframe',
        height: 250,
        width: 300,
        params: {},
        src: 'https://hiibel.com/22/a215683d2d0ce8fecd54e01b99606d75'
      };

  var styles = [
    '#floating-footer-ad {',
    '  position: fixed;',
    '  bottom: 0;',
    '  left: 0;',
    '  right: 0;',
    '  z-index: 2147483647;',
    '  display: flex;',
    '  justify-content: center;',
    '  align-items: flex-end;',
    '  pointer-events: none;',
    '  padding-bottom: env(safe-area-inset-bottom, 0px);',
    '}',
    '#floating-footer-ad-inner {',
    '  position: relative;',
    '  pointer-events: auto;',
    '  background: #ffffff;',
    '  padding: 4px;',
    '  border-radius: 6px 6px 0 0;',
    '  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);',
    '  line-height: 0;',
    '}',
    '#floating-footer-ad-close {',
    '  position: absolute;',
    '  top: -24px;',
    '  right: 0;',
    '  width: 24px;',
    '  height: 24px;',
    '  background: rgba(0, 0, 0, 0.75);',
    '  color: #ffffff;',
    '  border: none;',
    '  border-radius: 4px 4px 0 0;',
    '  font-family: Arial, sans-serif;',
    '  font-size: 16px;',
    '  line-height: 24px;',
    '  text-align: center;',
    '  cursor: pointer;',
    '  padding: 0;',
    '}',
    '#floating-footer-ad-close:hover {',
    '  background: rgba(0, 0, 0, 0.9);',
    '}',
    '#floating-footer-ad-slot {',
    '  width: ' + adConfig.width + 'px;',
    '  height: ' + adConfig.height + 'px;',
    '  overflow: hidden;',
    '}'
  ].join('\n');

  // Set global atOptions expected by the ad network script
  window.atOptions = {
    'key': adConfig.key,
    'format': adConfig.format,
    'height': adConfig.height,
    'width': adConfig.width,
    'params': adConfig.params
  };

  // When included synchronously before </body>, document.readyState is 'loading',
  // allowing native document.write execution required by atOptions invoke scripts.
  if (document.readyState === 'loading') {
    document.write(
      '<style>' + styles + '</style>' +
      '<div id="floating-footer-ad">' +
        '<div id="floating-footer-ad-inner">' +
          '<button id="floating-footer-ad-close" type="button" aria-label="Close ad" ' +
            'onclick="var el=document.getElementById(\'floating-footer-ad\');if(el)el.style.display=\'none\';">&times;</button>' +
          '<div id="floating-footer-ad-slot">' +
            '<scr' + 'ipt>' +
              'atOptions = {' +
                '\'key\' : \'' + adConfig.key + '\',' +
                '\'format\' : \'' + adConfig.format + '\',' +
                '\'height\' : ' + adConfig.height + ',' +
                '\'width\' : ' + adConfig.width + ',' +
                '\'params\' : {}' +
              '};' +
            '</scr' + 'ipt>' +
            '<scr' + 'ipt src="' + adConfig.src + '"></scr' + 'ipt>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  } else {
    // Fallback if script is loaded with defer/async or after DOMContentLoaded
    var styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    var wrapper = document.createElement('div');
    wrapper.id = 'floating-footer-ad';

    var inner = document.createElement('div');
    inner.id = 'floating-footer-ad-inner';

    var closeBtn = document.createElement('button');
    closeBtn.id = 'floating-footer-ad-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close ad');
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = function () {
      wrapper.style.display = 'none';
    };

    var slot = document.createElement('div');
    slot.id = 'floating-footer-ad-slot';

    var iframe = document.createElement('iframe');
    iframe.width = String(adConfig.width);
    iframe.height = String(adConfig.height);
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    iframe.style.border = '0';
    slot.appendChild(iframe);

    inner.appendChild(closeBtn);
    inner.appendChild(slot);
    wrapper.appendChild(inner);
    document.body.appendChild(wrapper);

    var iframeDoc = iframe.contentWindow ? iframe.contentWindow.document : iframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(
        '<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;overflow:hidden;}</style></head><body>' +
        '<scr' + 'ipt>' +
          'atOptions = {' +
            '\'key\' : \'' + adConfig.key + '\',' +
            '\'format\' : \'' + adConfig.format + '\',' +
            '\'height\' : ' + adConfig.height + ',' +
            '\'width\' : ' + adConfig.width + ',' +
            '\'params\' : {}' +
          '};' +
        '</scr' + 'ipt>' +
        '<scr' + 'ipt src="' + adConfig.src + '"></scr' + 'ipt>' +
        '</body></html>'
      );
      iframeDoc.close();
    }
  }
})();
