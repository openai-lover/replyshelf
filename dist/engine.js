import {MODEL,VERSION,rank,verdict,lexicalRank,seed,benchmarkCases,unrelatedCases} from './core.js';
let extractor, loading;
const vectors=new Map();
async function ready() {
  if(extractor) return;
  if(!loading) loading=(async()=>{
    postMessage({type:'status',message:'Downloading the open model… first use needs internet.'});
    const {pipeline,env}=await import(`https://cdn.jsdelivr.net/npm/@huggingface/transformers@${VERSION}`);
    env.allowLocalModels=false;
    env.backends.onnx.wasm.numThreads=1;
    extractor=await pipeline('feature-extraction',MODEL,{dtype:'q8',device:'wasm',progress_callback:p=>{
      if(p.status==='progress'&&p.file?.includes('onnx')) postMessage({type:'status',message:`Downloading AI model · ${Math.round(p.progress||0)}%`});
    }});
  })().catch(e=>{loading=null;throw e;});
  await loading;
}
async function embed(text) {
  if(!vectors.has(text)) {
    const output=await extractor(text,{pooling:'mean',normalize:true});
    vectors.set(text,output.tolist()[0]);
    if(vectors.size>300) vectors.delete(vectors.keys().next().value);
  }
  return vectors.get(text);
}
async function search(query,entries) {
  const items=[];
  for(const e of entries) items.push(await embed(e.question));
  return rank(await embed(query),items,entries);
}
async function handle({data}) {
  try {
    await ready();
    const started=performance.now();
    if(data.type==='search') {
      const results=await search(data.query,data.entries);
      postMessage({type:'result',results,elapsed:Math.round(performance.now()-started),request:data.request});
    } else if(data.type==='benchmark') {
      const rows=[];
      for(const [query,expected] of benchmarkCases) {
        const results=await search(query,seed);
        rows.push({query,expected,semantic:results[0].id,lexical:lexicalRank(query,seed)[0].id,score:+results[0].score.toFixed(3),verdict:verdict(results)});
      }
      const unknown=[];
      for(const query of unrelatedCases) {const results=await search(query,seed); unknown.push({query,score:+results[0].score.toFixed(3),verdict:verdict(results)});}
      postMessage({type:'benchmark',rows,unknown,elapsed:Math.round(performance.now()-started),model:MODEL,runtime:VERSION});
    }
  } catch(e) {postMessage({type:'error',message:String(e.message||e)});}
}
let queue=Promise.resolve();
onmessage=event=>{queue=queue.then(()=>handle(event));};
