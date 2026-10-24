// Reproducible download from publisher-controlled sources. No API keys.
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.resolve('dist');
const revision='751bff37182d3f1213fa05d7196b954e230abad9';
const cdn='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/';
const model=`https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/${revision}/`;
const items=[
  ['vendor/transformers.min.js',cdn+'dist/transformers.min.js'],
  ['vendor/ort-wasm-simd-threaded.jsep.mjs',cdn+'dist/ort-wasm-simd-threaded.jsep.mjs'],
  ['vendor/ort-wasm-simd-threaded.jsep.wasm',cdn+'dist/ort-wasm-simd-threaded.jsep.wasm'],
  ['vendor/TRANSFORMERS-LICENSE',cdn+'LICENSE'],
  ['vendor/ONNX-LICENSE','https://raw.githubusercontent.com/microsoft/onnxruntime/v1.22.0/LICENSE'],
  ...['config.json','tokenizer.json','tokenizer_config.json','onnx/model_quantized.onnx'].map(name=>[`models/Xenova/all-MiniLM-L6-v2/${name}`,model+name]),
  ['models/MODEL-LICENSE','https://www.apache.org/licenses/LICENSE-2.0.txt'],
  ['models/MODEL-CARD.md',model+'README.md']
];
const manifest=[];
let expected;try{expected=JSON.parse(await readFile('asset-manifest.json','utf8'));}catch{}
for(const [name,url] of items){
  const target=path.join(root,name);await mkdir(path.dirname(target),{recursive:true});
  const response=await fetch(url);if(!response.ok)throw Error(`${response.status}: ${name}`);
  const data=Buffer.from(await response.arrayBuffer());
  const digest=createHash('sha256').update(data).digest('hex');
  const previous=expected?.files.find(f=>f.file===name);
  if(previous&&previous.sha256!==digest)throw Error(`Integrity mismatch: ${name}`);
  await writeFile(target,data);
  manifest.push({file:name,url,bytes:data.length,sha256:digest});
  console.log(`Prepared ${name}: ${data.length} bytes`);
}
for(const name of ['shelf-hero.png','answer-card.png']){
  const target=path.join(root,'assets',name);
  let data;try{data=await readFile(target);}catch{
    const response=await fetch(`https://replyshelf-local-ai.nununong.chatgpt.site/assets/${name}`);
    if(!response.ok)throw Error('Artwork is unavailable. App functionality does not depend on artwork.');
    data=Buffer.from(await response.arrayBuffer());await mkdir(path.dirname(target),{recursive:true});
  }
  const digest=createHash('sha256').update(data).digest('hex');
  const previous=expected?.files.find(f=>f.file===`assets/${name}`);
  if(previous&&previous.sha256!==digest)throw Error(`Integrity mismatch: ${name}`);
  await writeFile(target,data);
  manifest.push({file:`assets/${name}`,source:'AI-generated project artwork, 2026-10-24',bytes:data.length,sha256:digest});
}
await writeFile('asset-manifest.json',JSON.stringify({modelRevision:revision,files:manifest},null,2)+'\n');
