(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const s of t)if(s.type==="childList")for(const d of s.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&r(d)}).observe(document,{childList:!0,subtree:!0});function o(t){const s={};return t.integrity&&(s.integrity=t.integrity),t.referrerPolicy&&(s.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?s.credentials="include":t.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(t){if(t.ep)return;t.ep=!0;const s=o(t);fetch(t.href,s)}})();const k="https://api-testnet.qore.host",m="https://explore.qore.network",w="qorechain-diana",q=document.querySelector("#app");if(!q)throw new Error("missing #app");q.innerHTML=`
  <div class="wrap">
    <header>
      <img src="./logo.png" alt="QoreStamp logo" />
      <div>
        <h1>QoreStamp</h1>
        <p>Post-quantum receipts on the QoreChain testnet. Hash a memo, stamp it, then verify both signatures on chain.</p>
      </div>
    </header>
    <div class="grid">
      <section class="card">
        <h2>1. Compose a receipt</h2>
        <p class="hint">The chain stores only the SHA-256 digest. Keep the exact memo — anyone with the text can re-hash it and check the stamp.</p>
        <label for="memo">Memo</label>
        <textarea id="memo" maxlength="500">Received 20 SGD from Alex for lunch, 24 Nov 2026, Maxwell Food Centre.</textarea>
        <div class="digest" id="digest">sha256: …</div>
        <div class="row">
          <button class="ghost" id="connect" type="button">Connect QoreX</button>
          <button class="ghost" id="copy-digest" type="button">Copy digest</button>
        </div>
        <p class="status" id="wallet">QoreX is optional here. The hybrid-signed transaction that opens the EVM window (and the later stamp call) is sent with the official Hardhat kit after you claim free test QOR.</p>
      </section>
      <section class="card">
        <h2>2. Verify a testnet transaction</h2>
        <p class="hint">Paste a <code>qorechain-diana</code> transaction hash. We look for a successful code, a <code>PQCHybridSignature</code>, and a <code>pqc_hybrid_verify</code> event with status <code>verified</code>.</p>
        <label for="hash">Transaction hash</label>
        <input id="hash" type="text" placeholder="64-character hex hash" spellcheck="false" />
        <div class="row">
          <button class="primary" id="verify" type="button">Verify on testnet</button>
        </div>
        <p class="status" id="verify-status">Nothing checked yet.</p>
        <div class="kv" id="result" hidden></div>
      </section>
    </div>
    <footer>
      Built for Build Before Q-Day, Quantum Pass track. Testnet only — test QOR has no value.
      Explorer: <a href="${m}" target="_blank" rel="noreferrer">${m}</a>
      (switch the network selector to Testnet).
    </footer>
  </div>
`;const g=document.querySelector("#memo"),E=document.querySelector("#digest"),a=document.querySelector("#wallet"),C=document.querySelector("#hash"),y=document.querySelector("#result"),i=document.querySelector("#verify-status");async function S(e){const n=new TextEncoder().encode(e),o=await crypto.subtle.digest("SHA-256",n);return[...new Uint8Array(o)].map(r=>r.toString(16).padStart(2,"0")).join("")}async function $(){const e=await S(g.value);E.textContent=`sha256: 0x${e}`}$();g.addEventListener("input",()=>void $());document.querySelector("#copy-digest").addEventListener("click",async()=>{const e=await S(g.value);await navigator.clipboard.writeText(`0x${e}`),a.textContent="Digest copied.",a.className="status ok"});document.querySelector("#connect").addEventListener("click",async()=>{var n;const e=(n=window.qorex)==null?void 0:n.native;if(!e){a.textContent="QoreX was not found in this browser. Install the QoreX extension or open this page in the QoreX app browser, switched to Testnet.",a.className="status bad";return}try{await e.enable(w);const o=await e.getKey(w);a.textContent=`Connected ${o.bech32Address}${o.name?` (${o.name})`:""}. Still testnet only.`,a.className="status ok"}catch(o){a.textContent=o instanceof Error?o.message:"QoreX request was rejected.",a.className="status bad"}});function b(e,n){if(e==null)return;if(Array.isArray(e)){for(const t of e){const s=b(t,n);if(s!==void 0)return s}return}if(typeof e!="object")return;const o=e,r=String(o["@type"]??o.typeUrl??o.type_url??o.type??"");if(n.some(t=>r.includes(t)))return o;for(const t of Object.values(o)){const s=b(t,n);if(s!==void 0)return s}}function _(e){if(!(typeof e!="string"||!e))try{return atob(e).length}catch{return e.startsWith("0x")?(e.length-2)/2:void 0}}function L(e){let n,o;for(const[r,t]of Object.entries(e)){const s=_(t);s&&(s>1e3&&(n=s),s===64&&(o=s))}return{mldsa:n,secp:o}}document.querySelector("#verify").addEventListener("click",async()=>{var n,o,r,t,s,d;const e=C.value.trim().replace(/^0x/,"");if(!/^[0-9a-fA-F]{64}$/.test(e)){i.textContent="Paste a 64-character hex transaction hash.",i.className="status bad",y.hidden=!0;return}i.textContent="Reading the public testnet API…",i.className="status",y.hidden=!0;try{const c=await fetch(`${k}/cosmos/tx/v1beta1/txs/${e}`);if(!c.ok)throw new Error(`Testnet API returned HTTP ${c.status}. Check the hash and that it is on qorechain-diana.`);const l=await c.json(),v=((n=l.tx_response)==null?void 0:n.code)??-1,u=(r=(((o=l.tx_response)==null?void 0:o.events)??[]).filter(h=>h.type==="pqc_hybrid_verify").flatMap(h=>h.attributes??[]).find(h=>h.key==="status"))==null?void 0:r.value,f=b(l,["PQCHybridSignature","pqc_hybrid","PqcHybrid"]),p=f?L(f):{},x=v===0&&!!f&&u==="verified";i.innerHTML=x?'Verified on chain. <span class="badge ok">pqc_hybrid_verify = verified</span>':`Not a verified hybrid transaction. <span class="badge no">${u??"no pqc_hybrid_verify"}</span>`,i.className=x?"status ok":"status bad",y.hidden=!1,y.innerHTML=`
      <div><dt>tx</dt><dd>${((t=l.tx_response)==null?void 0:t.txhash)??e}</dd></div>
      <div><dt>code</dt><dd>${v}${v===0?" (success)":""}</dd></div>
      <div><dt>memo</dt><dd>${((d=(s=l.tx)==null?void 0:s.body)==null?void 0:d.memo)||"—"}</dd></div>
      <div><dt>hybrid ext.</dt><dd>${f?"PQCHybridSignature present":"not found"}</dd></div>
      <div><dt>ML-DSA-87</dt><dd>${p.mldsa?`${p.mldsa} bytes`:"—"}</dd></div>
      <div><dt>secp256k1</dt><dd>${p.secp?`${p.secp} bytes`:"—"}</dd></div>
      <div><dt>event</dt><dd>${u?`pqc_hybrid_verify status=${u}`:"not found"}</dd></div>
      <div><dt>explorer</dt><dd><a href="${m}" target="_blank" rel="noreferrer">explore.qore.network</a> — switch to Testnet, then search the hash</dd></div>
    `}catch(c){i.textContent=c instanceof Error?c.message:"Lookup failed.",i.className="status bad"}});
