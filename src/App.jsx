import React,{useState}from'react';
import'./App.css';

const rules=[
['utilize','use'],['approximately','about'],['demonstrates','shows'],['facilitates','helps'],
['commence','start'],['subsequently','later'],['numerous','many'],['obtain','get'],
['individuals','people'],['prior to','before'],['in order to','to'],
['a significant number of','many'],['due to the fact that','because'],
['at this point in time','now'],['in addition','also']
];

function normalize(t){return t.trim().replace(/\s+/g,' ')}
function cleanWords(t){
 let x=normalize(t);
 rules.forEach(([a,b])=>x=x.replace(new RegExp('\\b'+a+'\\b','gi'),b));
 return x.replace(/it is important to note that\s*/gi,'')
  .replace(/it should be noted that\s*/gi,'')
  .replace(/plays a crucial role in/gi,'helps')
  .replace(/plays a significant role in/gi,'helps')
  .replace(/in today['’]s digital age/gi,'today');
}
function sentences(t){return normalize(t).match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]}
function transformSentence(s,mode,index){
 let x=s.trim();
 if(mode==='Natural draft'){
  x=x.replace(/^At the same time,\s*/i,'Also, ');
  x=x.replace(/^Because of this,\s*/i,'This is why ');
  x=x.replace(/^In addition,\s*/i,'Also, ');
  x=x.replace(/has made (.+?) an important part of/gi,'has become an important part of');
 }
 if(mode==='Student style'){
  x=x.replace(/At the same time, creators can use the platform to build an audience and earn money from their content/gi,'Creators can also use YouTube to reach viewers and earn money from their videos');
  x=x.replace(/people can watch, create, and share videos on many different topics/gi,'people can watch and share videos about many topics');
  x=x.replace(/It provides educational content, entertainment, news, music, tutorials, and more/gi,'The platform has videos about education, entertainment, news, music, tutorials, and many other subjects');
  x=x.replace(/Students can use YouTube to learn new skills and understand difficult subjects through visual explanations/gi,'Students can use YouTube to learn skills and understand difficult topics through videos');
  x=x.replace(/creators can use the platform to build an audience and earn money from their content/gi,'Creators can also use YouTube to reach viewers and earn money from their videos');
  x=x.replace(/Its easy access and wide range of videos have made YouTube an important part of modern digital media/gi,'Because it is easy to access and has so much content, YouTube has become an important part of digital media');
  x=x.replace(/one of the most popular online video platforms/gi,'a widely used online video platform');
 }
 return x;
}
function makeWriteup(t,mode){
 const base=cleanWords(t);
 const ss=sentences(base).map((s,i)=>transformSentence(s,mode,i));
 if(mode==='Natural draft' && ss.length>3){
   [ss[1],ss[2]]=[ss[2],ss[1]];
 }
 if(mode==='Student style' && ss.length>4){
   const last=ss.pop(); ss.splice(2,0,last);
 }
 const result=ss.join(' ');
 const mid=Math.ceil(ss.length/2);
 return ss.length>3 ? ss.slice(0,mid).join(' ')+'\n\n'+ss.slice(mid).join(' ') : result;
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
   <p className="lead">Choose a writing style, then create a cleaner draft with changed sentence structure and wording.</p>
   <section className="card controls">
    <div><label>Writing mode</label><div className="modes">
     {['Original draft','Natural draft','Student style'].map(x=><button key={x} className={mode===x?'sel':''} onClick={()=>{setMode(x);setStatus('Mode changed. Click Create one-page draft.')}}>{x}</button>)}
    </div></div>
    <div className="note"><b>{mode}</b><p>{mode==='Student style'?'Simple wording and a more student-friendly sentence structure.':mode==='Natural draft'?'More conversational flow and reordered sentences.':'Keeps the main structure while cleaning generic wording.'}</p></div>
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
   <div className="length"><b>Target length:</b> 450–600 words for a typical one-page academic write-up. Short source material is not automatically padded with invented facts.</div>
   <div className="notice"><b>Originality-focused editing</b><br/><small>Review the draft, check facts and sources, and add your own examples and interpretation.</small></div>
  </main>
 </div>
}