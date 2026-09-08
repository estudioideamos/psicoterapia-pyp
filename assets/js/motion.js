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
})();