if(!self.define){let e,s={};const i=(i,t)=>(i=new URL(i+".js",t).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(t,c)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(s[n])return;let a={};const d=e=>i(e,n),r={module:{uri:n},exports:a,require:d};s[n]=Promise.all(t.map((e=>r[e]||d(e)))).then((e=>(c(...e),a)))}}define(["./workbox-00a24876"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"461eb18518be3163f84709b187b6ca0e"},{url:"/_next/static/DJXT2A378Fvx5JWEv0dSD/_buildManifest.js",revision:"b78f2f95f712fdbfd1149569fa52161f"},{url:"/_next/static/DJXT2A378Fvx5JWEv0dSD/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/101-33677fdbd336c9ba.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/165-5074806839f84b2c.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/1de8e0d1-cc598e854b36bf29.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/325-16701a3b1691ec31.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/513f90f4-688d2293bf385b24.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/627-4478d107d4c92c54.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/640-8311425fcdef7911.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/760-9b986fb4c3d3c9c8.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/769-f4e8d18ded5e751e.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/787-3e9427ff512e8f97.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/817-3204e9eb59ab517f.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/846-f2b0e765cea91bb0.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/86-8eea86e6764de97a.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/app/inspections/%5Bid%5D/page-dd5247f56fa1dfe0.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/app/inspections/new/page-4f76c77bea9c8008.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/app/layout-cf8299d82e941ec3.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/app/login/page-3a19069fe64a2f33.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/app/map/page-ce6766b77bad98e4.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/app/notifications/page-2a725bf1b39b6101.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/app/page-1b0791dc84bb5d71.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/app/reports/page-cf89b33ccdb693ae.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/app/settings/page-9448c369d12af4a3.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/bce60fc1-cf632412d86cf19c.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/f71a365d-69e9047d56164416.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/framework-8883d1e9be70c3da.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/main-064da6c39213122f.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/main-app-f934cc800b54a4b9.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/pages/_app-998b8fceeadee23e.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/pages/_error-e8b35f8a0cf92802.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},{url:"/_next/static/chunks/webpack-701af0bf9b730781.js",revision:"DJXT2A378Fvx5JWEv0dSD"},{url:"/_next/static/css/4cd358ba8304893d.css",revision:"4cd358ba8304893d"},{url:"/_next/static/css/bb8606d147418b38.css",revision:"bb8606d147418b38"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/icons-192.png",revision:"08b37651f41e52d40a212f17f9dc67d4"},{url:"/icons-256.png",revision:"4b81d911eac2a66327e5c1d28713e005"},{url:"/icons-512.png",revision:"ad68ecfb8e2dcec72fe223d68267cb8f"},{url:"/manifest.json",revision:"bb46868edcb196abcf9283c7352f5c74"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:i,state:t})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET")}));
