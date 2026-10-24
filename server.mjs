import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.wasm':'application/wasm','.md':'text/plain; charset=utf-8'};
const headers={};
for(const line of (await readFile(path.join(root,'_headers'),'utf8')).split('\n')){const match=line.match(/^\s+([^:]+):\s*(.+)$/);if(match)headers[match[1]]=match[2].trim();}
// The local QA-only frame needs self embedding; production disallows framing.
headers['Content-Security-Policy']=headers['Content-Security-Policy'].replace("frame-ancestors 'none'","frame-ancestors 'self'");
http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/__mobile') {res.writeHead(200,{'content-type':'text/html; charset=utf-8'}).end('<!doctype html><meta name="viewport" content="width=device-width"><title>ReplyShelf · 390px layout check</title><style>body{margin:0;background:#d8dfd2;display:grid;place-content:center;padding:20px;gap:10px;font:12px system-ui;color:#263e34}iframe{width:390px;height:844px;border:0;box-shadow:0 10px 60px #263e3430;border-radius:12px}</style><p>REPLYSHELF · 390 PX RESPONSIVE LAYOUT</p><iframe src="/" title="ReplyShelf mobile preview"></iframe>');return;}
  const target=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  const content=await readFile(target);
  console.log(`GET ${url.pathname} · ${content.length} bytes · queryPresent=${url.search.length>0}`);
  res.writeHead(200,{...headers,'content-type':types[path.extname(target)]||'application/octet-stream','cache-control':'no-cache'});res.end(content);
}catch{res.writeHead(404).end('Not found');}}).listen(4190,'127.0.0.1',()=>console.log('ReplyShelf: http://127.0.0.1:4190/'));
