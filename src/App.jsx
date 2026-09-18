import React,{useState}from'react';
import'./App.css';

const rules=[
['utilize','use'],['approximately','about'],['demonstrates','shows'],['facilitates','helps'],
['commence','start'],['subsequently','later'],['numerous','many'],['obtain','get'],
['individuals','people'],['prior to','before'],['in order to','to'],['a significant number of','many'],
['due to the fact that','because'],['at this point in time','now']
];

function normalize(t){return t.trim().replace(/\s+/g,' ')}
function cleanWords(t){
 let x=normalize(t);
 rules.forEach(([a,b])=>x=x.replace(new RegExp('\\b'+a+'\\b','gi'),b));
 return x
  .replace(/it is important to note that\s*/gi,'')
  .replace(/it should be noted that\s*/gi,'')
  .replace(/plays a crucial role in/gi,'helps')
  .replace(/plays a significant role in/gi,'helps')
  .replace(/in today['’]s digital age/gi,'today');
}
function sentences(t){return normalize(t).match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]}
function naturalize(t){
 let ss=sentences(cleanWords(t)).map(s=>s.trim()).filter(Boolean);
 return ss.map((s,i)=>{
   if(i>0 && /^at the same time[, ]/i.test(s)) s=s.replace(/^at the same time[, ]*/i,'');
   if(i>0 && /^in addition[, ]/i.test(s)) s=s.replace(/^in addition[, ]*/i,'Also, ');
   return s;
 }).join(' ');
}
function studentize(t){
 let x=naturalize(t);
 x=x.replace(/individuals/gi,'people').replace(/purchase decisions/gi,'buying decisions')
   .replace(/consumers/gi,'customers').replace(/therefore,/gi,'so,')
   .replace(/however,/gi,'but ');
 return x;
}
function makeWriteup(t,mode){
 const x=mode==='Student style'?studentize(t):mode==='Natural draft'?naturalize(t):cleanWords(t);
 const ss=sentences(x);
 if(ss.length<2)return x;
 const mid=Math.ceil(ss.length/2);
 return ss.slice(0,mid).join(' ')+'\n\n'+ss.slice(mid).join(' ');
}
function wordCount(t){return t.trim()?t.trim().split(/\s+/).length:0}

export default function App(){
 const[s,setS]=useState(''),[r,setR]=useState(''),[mode,setMode]=useState('Student style'),[status,setStatus]=useState('Ready');
 const wc=wordCount(r);
 function run(){
   if(!s.trim()){setStatus('Paste a draft first.');return}
   setR(makeWriteup(s,mode));setStatus('One-page draft ready.');
 }
 async function copy(){
   if(!r)return;
   await navigator.clipboard.writeText(r);setStatus('Copied.');
 }
 return <div className="app">
  <header><div><b>DocFlow<span> Write</span></b><small>One-page write-up workspace</small></div>
   <div>● {status}<button onClick={()=>{setS('');setR('');setStatus('Ready')}}>Clear</button></div>
  </header>
  <main>
   <div className="eyebrow">ONE-PAGE WRITE-UP</div>
   <h1>Turn your material into a clear one-page draft.</h1>
   <p className="lead">Rewrite your material with a simple structure, natural wording, and a target length of about 450–600 words.</p>
   <section className="card controls">
    <div><label>Writing mode</label><div className="modes">
     {['Original draft','Natural draft','Student style'].map(x=><button key={x} className={mode===x?'sel':''} onClick={()=>setMode(x)}>{x}</button>)}
    </div></div>
    <div className="note"><b>{mode}</b><p>{mode==='Student style'?'Simple, clear language suitable for a student write-up.':mode==='Natural draft'?'Less formal wording with more natural sentence flow.':'Keeps your structure while cleaning generic wording.'}</p></div>
   </section>
   <section className="edit">
    <div className="card"><div className="titleRow"><h2>Your material</h2><span>{wordCount(s)} words</span></div>
     <textarea value={s} onChange={e=>setS(e.target.value)} placeholder="Paste your notes, source material, or rough draft here…"/>
     <button className="primary" onClick={run}>Create one-page draft</button>
    </div>
    <div className="card"><div className="titleRow"><h2>One-page draft</h2><span>{wc} words</span></div>
     <textarea value={r} onChange={e=>setR(e.target.value)} placeholder="Your rewritten draft will appear here."/>
     <button onClick={copy}>Copy</button>
    </div>
   </section>
   <div className="length"><b>Target length:</b> 450–600 words (about one academic page). The tool will not invent facts to fill missing material, so add your own examples, evidence, and references when your source is short.</div>
   <div className="notice"><b>Originality-focused editing</b><br/><small>Use the output as an editing aid, fact-check it, and add your own examples and interpretation.</small></div>
  </main>
 </div>
}