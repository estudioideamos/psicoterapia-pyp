/* Progressive motion: content stays visible without JS or animation support. */
(() => {
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 if(preference.matches||!('IntersectionObserver' in window))return;
 const active=new Set();
 const observer=new IntersectionObserver(entries=>{
   entries.forEach(({target,isIntersecting})=>{
     if(!isIntersecting)return;
     target.classList.add('motion-arrived');
     const group=target.matches('.platform-panels,.benefit-grid,.team-facts');
     const children=group?[...target.children]:[target];
     children.forEach((element,index)=>{
       if(element.classList.contains('reveal'))return;
       const animation=element.animate([
         {opacity:.25,transform:'translateY(22px)'},
         {opacity:1,transform:'translateY(0)'}
       ],{duration:720,delay:Math.min(index*65,260),easing:'cubic-bezier(.16,1,.3,1)'});
       active.add(animation);animation.finished.then(()=>active.delete(animation)).catch(()=>active.delete(animation));
     });
     observer.unobserve(target);
   });
 },{threshold:.08,rootMargin:'0px 0px -25px 0px'});
 document.querySelectorAll('.platform-panels,.services-editorial .benefit-item,.team-facts,.editorial-statement,.platform-heading,.reviews-heading').forEach(el=>observer.observe(el));
 preference.addEventListener('change',event=>{
   if(event.matches){observer.disconnect();active.forEach(animation=>animation.cancel());active.clear();}
 });
})();/* Calm, viewport-aware depth and brand details. */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const loops=new Map(),visible=new Set();
 const sync=()=>loops.forEach((animation,el)=>{if(!reduced.matches&&!document.hidden&&visible.has(el))animation.play();else animation.pause();});
 document.querySelectorAll('.intro-media img[src*="-network"]').forEach(img=>{
   img.classList.add('sculpture-image');
   const animation=img.animate([{transform:'scale(1.025) translate3d(-.5%,0,0)'},{transform:'scale(1.075) translate3d(.5%,-.7%,0)'}],{duration:16000,iterations:Infinity,direction:'alternate',easing:'ease-in-out'});
   animation.pause();loops.set(img,animation);
 });
 const depthObserver=new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?visible.add(e.target):visible.delete(e.target));sync();});
 loops.forEach((_,img)=>depthObserver.observe(img));
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',()=>{sync();paint();});
 const phrases=[...document.querySelectorAll('.personal-care-columns')];
 phrases.forEach(el=>{el.classList.add('scroll-ink');el.classList.remove('reveal');});
 let pending=false;
 function paint(){
   pending=false;
   phrases.forEach(el=>{
     const progress=reduced.matches?1:Math.max(0,Math.min(1,(innerHeight*.85-el.getBoundingClientRect().top)/(innerHeight*.55)));
     const from=[117,120,108],to=[76,101,49];
     el.style.setProperty('--scroll-ink','rgb('+from.map((v,i)=>Math.round(v+(to[i]-v)*progress)).join(',')+')');
   });
 }
 addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(paint);}},{passive:true});
 addEventListener('resize',paint);paint();
 const traceObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
   if(!e.isIntersecting)return;
   e.target.classList.add('is-drawn');traceObserver.unobserve(e.target);
 }),{threshold:.6});
 document.querySelectorAll('.brand-trace').forEach(el=>{el.classList.add('trace-ready');traceObserver.observe(el);});
})();
