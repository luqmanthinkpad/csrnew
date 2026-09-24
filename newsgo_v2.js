  <script>
  //<![CDATA[
  (function(){
    "use strict";
    var root=document.getElementById("newsgo-app"),apiOrigin=(root&&root.getAttribute("data-newsgo-api-origin")||"").replace(/\/$/,"");
    function safeKey(value){return typeof value==="string"&&/^[a-zA-Z0-9_-]+$/.test(value)?value:"";}
    function renderSlot(node,ad){var key=safeKey(ad&&ad.key);if(!key||!node||node.getAttribute("data-newsgo-ad-loaded"))return;var width=Math.min(Math.max(Number(ad.width)||320,1),728),height=Math.min(Math.max(Number(ad.height)||50,1),600),iframe=document.createElement("iframe");iframe.width=String(width);iframe.height=String(height);iframe.title="Advertisement";iframe.loading="lazy";iframe.referrerPolicy="no-referrer";iframe.style.cssText="display:block;margin:0 auto;max-width:100%;border:0;overflow:hidden";node.appendChild(iframe);var adHtml="<!doctype html><html><head><meta charset='utf-8'><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body><script>window.atOptions={key:'"+key+"',format:'iframe',height:"+height+",width:"+width+",params:{}};<\/script><script src='https://anguishgrandpa.com/"+key+"/invoke.js'><\/script></body></html>";iframe.srcdoc=adHtml;node.setAttribute("data-newsgo-ad-loaded","true");}
    if(apiOrigin){fetch(apiOrigin+"/v1/advertisert?limit=5",{credentials:"omit",headers:{Accept:"application/json"}}).then(function(response){if(!response.ok)throw Error("ads");return response.json();}).then(function(payload){var ads=Array.isArray(payload.ads)?payload.ads:[];["header","sidebar"].forEach(function(placement){var exact=ads.filter(function(ad){return ad&&ad.placement===placement;});root.querySelectorAll('[data-newsgo-ad-slot="'+placement+'"]').forEach(function(node){renderSlot(node,exact[0]||ads[0]||null);});});}).catch(function(){});}
    if(document.getElementById("adsterra-sticky-footer"))return;
    var isLoaded=false;
    function loadStickyFooterAd(){
      if(isLoaded)return;
      isLoaded=true;
      window.removeEventListener("scroll",loadStickyFooterAd);
      window.removeEventListener("touchstart",loadStickyFooterAd);
      window.removeEventListener("mousemove",loadStickyFooterAd);
      var style=document.createElement("style");
      style.textContent="#adsterra-sticky-footer{position:fixed;bottom:0;left:0;width:100%;z-index:999999;background:rgba(255,255,255,.98);box-shadow:0 -3px 12px rgba(0,0,0,.18);text-align:center;padding:6px 0}#adsterra-close-btn{position:absolute;top:-28px;right:12px;background:#1e293b;color:#fff;border:0;border-radius:6px 6px 0 0;padding:5px 12px;font:600 12px sans-serif;cursor:pointer;box-shadow:0 -2px 6px rgba(0,0,0,.12)}#adsterra-banner-container{display:flex;justify-content:center;align-items:center;overflow:hidden}";
      document.head.appendChild(style);
      var wrapper=document.createElement("div");wrapper.id="adsterra-sticky-footer";
      var closeBtn=document.createElement("button");closeBtn.id="adsterra-close-btn";closeBtn.type="button";closeBtn.title="Close Ad";closeBtn.textContent="Close";
      var container=document.createElement("div");container.id="adsterra-banner-container";
      closeBtn.onclick=function(){wrapper.remove();style.remove();};wrapper.appendChild(closeBtn);wrapper.appendChild(container);document.body.appendChild(wrapper);
      var isDesktop=window.innerWidth>768,adConfig=isDesktop?{key:"6bc878b50f4ca4fe0f9f00a24603655f",width:720,height:90}:{key:"659b04a20a0861b7619a7103d607c7d3",width:320,height:50};
      container.style.minHeight=adConfig.height+"px";
      var confScript=document.createElement("script");confScript.type="text/javascript";confScript.text="atOptions="+JSON.stringify({key:adConfig.key,format:"iframe",height:adConfig.height,width:adConfig.width,params:{}})+";";
      var invokeScript=document.createElement("script");invokeScript.type="text/javascript";invokeScript.src="https://anguishgrandpa.com/"+adConfig.key+"/invoke.js";
      container.appendChild(confScript);container.appendChild(invokeScript);
    }
    window.addEventListener("scroll",loadStickyFooterAd,{passive:true,once:true});
    window.addEventListener("touchstart",loadStickyFooterAd,{passive:true,once:true});
    window.addEventListener("mousemove",loadStickyFooterAd,{passive:true,once:true});
    setTimeout(loadStickyFooterAd,4000);
  }());
  //]]>
  </script>
