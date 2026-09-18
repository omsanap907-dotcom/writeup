import React,{useState}from'react';
import'./App.css';

const replacements=[
['utilize','use'],['approximately','about'],['demonstrates','shows'],['facilitates','helps'],
['commence','start'],['subsequently','later'],['numerous','many'],['obtain','get'],
['individuals','people'],['prior to','before'],['in order to','to'],
['due to the fact that','because'],['at this point in time','now']
];

function normalize(t){return t.trim().replace(/\s+/g,' ')}
function words(t){return t.trim()?t.trim().split(/\s+/):[]}
function count(t){return words(t).length}
function clean(t){
 let x=normalize(t);
 replacements.forEach(([a,b])=>x=x.replace(new RegExp('\\b'+a+'\\b','gi'),b));
 return x.replace(/it is important to note that\s*/gi,'')
  .replace(/it should be noted that\s*/gi,'')
  .replace(/plays a crucial role in/gi,'is important for')
  .replace(/plays a significant role in/gi,'is important for')
  .replace(/in today['’]s digital age/gi,'today');
}
function splitSentences(t){return normalize(t).match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]}
function pickSentences(t){
 const ss=splitSentences(t).map(x=>x.trim()).filter(x=>x.length>20);
 return ss.filter((x,i)=>i===0||x.toLowerCase()!==ss[i-1].toLowerCase());
}
function vary(s,mode,i){
 let x=s.trim();
 x=x.replace(/\bthis platform\b/gi,'the platform');
 if(mode==='Student style'){
  x=x.replace(/which allows/gi,'so people can');
  x=x.replace(/which helps/gi,'and this helps');
  x=x.replace(/in order to/gi,'to');
  x=x.replace(/consumers/gi,'customers');
  x=x.replace(/purchase decisions/gi,'buying decisions');
 } else if(mode==='Natural draft'){
  x=x.replace(/^Furthermore,\s*/i,'Also, ');
  x=x.replace(/^Moreover,\s*/i,'Another point is that ');
  x=x.replace(/^However,\s*/i,'But ');
 }
 if(i%4===1 && /^The /i.test(x)) x=x.replace(/^The /i,'This ');
 return x;
}
function buildWriteup(topic,source,own,mode){
 const src=pickSentences(clean(source));
 const personal=pickSentences(clean(own));
 const title=topic.trim()||'The Topic';
 if(!src.length&&!personal.length)return '';
 const intro=personal.length
  ? `The topic of ${title} can be understood by looking at the main ideas in the material and connecting them with practical observations. ${vary(personal[0],mode,0)}`
  : `${title} is a topic that can be understood by looking at its main features, uses, and practical importance.`;
 const body=src.slice(0,6).map((s,i)=>vary(s,mode,i));
 const extra=personal.slice(1,3).map((s,i)=>vary(s,mode,i+2));
 const conclusion=personal.length
  ? `Overall, the material shows why ${title} matters in practice. ${vary(personal[personal.length-1],mode,0)}`
  : `Overall, ${title} has several practical aspects that can be discussed further using examples, evidence, and the writer's own observations.`;
 const parts=[intro,...body,...extra,conclusion].filter(Boolean);
 if(parts.length>5){
  const mid=Math.ceil((parts.length-2)/2);
  return parts.slice(0,mid+1).join(' ')+'\\n\\n'+parts.slice(mid+1).join(' ');
 }
 return parts.join(' ');
}

export default function App(){
 const[topic,setTopic]=useState('');
 const[source,setSource]=useState('');
 const[own,setOwn]=useState('');
 const[result,setResult]=useState('');
 const[mode,setMode]=useState('Student style');
 const[status,setStatus]=useState('Ready');

 function create(){
  if(!topic.trim()&&!source.trim()&&!own.trim()){setStatus('Add a topic or material first.');return}
  const out=buildWriteup(topic,source,own,mode);
  setResult(out);setStatus('Draft created.');
 }
 async function copy(){
  if(!result)return;
  await navigator.clipboard.writeText(result);setStatus('Copied.');
 }
 function clear(){
  setTopic('');setSource('');setOwn('');setResult('');setStatus('Ready');
 }
 return <div className="app">
  <header>
   <div><b>DocFlow<span> Write</span></b><small>One-page write-up workspace</small></div>
   <div>● {status}<button onClick={clear}>Clear</button></div>
  </header>
  <main>
   <div className="eyebrow">FROM MATERIAL TO WRITE-UP</div>
   <h1>Build a one-page write-up from your ideas.</h1>
   <p className="lead">Give the tool a topic, source material, and your own points. It organizes the material into an introduction, main discussion, and conclusion instead of simply replacing words.</p>

   <section className="card setup">
    <div className="field"><label>Topic</label><input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Example: Impact of YouTube on Students"/></div>
    <div className="field"><label>Your own points or observations <span>(recommended)</span></label><textarea className="smallBox" value={own} onChange={e=>setOwn(e.target.value)} placeholder="Add your own experience, examples, opinions, observations, or class notes…"/></div>
    <div className="field full"><label>Source material / rough notes</label><textarea className="sourceBox" value={source} onChange={e=>setSource(e.target.value)} placeholder="Paste your notes, textbook points, research material, or rough draft here…"/></div>
   </section>

   <section className="card controls">
    <div><label>Writing mode</label><div className="modes">
     {['Original draft','Natural draft','Student style'].map(x=><button key={x} className={mode===x?'sel':''} onClick={()=>setMode(x)}>{x}</button>)}
    </div></div>
    <div className="note"><b>{mode}</b><p>{mode==='Student style'?'Clear language and a straightforward student-friendly structure.':mode==='Natural draft'?'Natural flow with less formal transitions.':'Keeps the material close to its original organization.'}</p></div>
   </section>

   <button className="primary create" onClick={create}>Create one-page write-up</button>

   <section className="card output">
    <div className="titleRow"><h2>One-page draft</h2><span>{count(result)} words</span></div>
    <textarea value={result} onChange={e=>setResult(e.target.value)} placeholder="Your structured write-up will appear here."/>
    <button onClick={copy}>Copy</button>
   </section>

   <div className="length"><b>Typical target:</b> 450–600 words. The tool does not invent evidence or citations to fill space. Add your own examples and verify facts before submitting.</div>
   <div className="notice"><b>Write from your material</b><br/><small>The goal is to organize and improve your writing. Your own examples, observations, interpretation, and sources should remain part of the final work.</small></div>
  </main>
 </div>
}