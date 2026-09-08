(() => {
 const section=document.querySelector('.reviews-premium');
 if(!section)return;
 const cards=section.querySelector('.reviews-cards');

 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const controls=section.querySelector('.reviews-controls');
 const counter=section.querySelector('.reviews-page');
 cards.setAttribute('role','region');
 cards.setAttribute('aria-roledescription','carrusel');
 cards.tabIndex=0;
 const stars=element=>{
   if(element.querySelector('span'))return;
   const value=Math.round(parseFloat(element.getAttribute('aria-label'))||5);
   element.replaceChildren(...Array.from({length:5},(_,i)=>{
     const star=document.createElement('span');
     star.className=i<value?'review-star':'review-star is-empty';
     star.textContent=i<value?'★':'☆';
     star.setAttribute('aria-hidden','true');
     star.style.setProperty('--star-delay',i*90+'ms');
     return star;
   }));
 };
 let observer;
 const update=()=>{
   const items=[...cards.children];
   const index=items.reduce((best,el,i)=>Math.abs(el.offsetLeft-cards.offsetLeft-cards.scrollLeft)<Math.abs(items[best].offsetLeft-cards.offsetLeft-cards.scrollLeft)?i:best,0);
   counter.textContent=String(Number(items[index].dataset.reviewIndex||index)+1).padStart(2,'0')+' / '+String(items.length).padStart(2,'0');
   controls.hidden=items.length<2;
   section.querySelector('.reviews-prev').disabled=false;
   section.querySelector('.reviews-next').disabled=false;
 };
 const setup=()=>{
   observer?.disconnect();
   observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
     if(entry.isIntersecting){entry.target.classList.add('stars-arrived');observer.unobserve(entry.target);}
   }),{threshold:.25});
   section.querySelectorAll('.review-stars').forEach(el=>{stars(el);observer.observe(el);});
   [...cards.children].forEach((card,i)=>{
     card.dataset.reviewIndex=i;card.setAttribute('aria-label','Reseña '+(i+1)+' de '+cards.children.length);
     const text=card.querySelector('.review-text');
     text.removeAttribute('tabindex');
     text.classList.add('review-text-collapsed');
     if(!card.querySelector('.review-more')){
       const more=document.createElement('button');
       more.type='button';more.className='review-more';more.textContent='Leer completa';
       more.setAttribute('aria-expanded','false');
       more.addEventListener('click',()=>{
         const expanded=more.getAttribute('aria-expanded')!=='true';
         more.setAttribute('aria-expanded',String(expanded));
         more.textContent=expanded?'Ver menos':'Leer completa';
         text.classList.toggle('review-text-collapsed',!expanded);
       });
       text.after(more);
     }
   });
   requestAnimationFrame(update);
 };
 const move=direction=>{
   if(cards.scrollWidth<=cards.clientWidth+3){
     if(direction>0)cards.append(cards.firstElementChild);else cards.prepend(cards.lastElementChild);
     if(!reduce.matches)cards.animate([{opacity:.5,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:550});
     update();return;
   }
   const end=cards.scrollWidth-cards.clientWidth;
   if(direction>0&&cards.scrollLeft>=end-3)cards.scrollTo({left:0,behavior:reduce.matches?'instant':'smooth'});
   else if(direction<0&&cards.scrollLeft<3)cards.scrollTo({left:end,behavior:reduce.matches?'instant':'smooth'});
   else cards.scrollBy({left:direction*(cards.firstElementChild.getBoundingClientRect().width+24),behavior:reduce.matches?'instant':'smooth'});
 };
 section.querySelector('.reviews-prev').addEventListener('click',()=>move(-1));
 section.querySelector('.reviews-next').addEventListener('click',()=>move(1));
 cards.addEventListener('keydown',event=>{
   if(event.target!==cards)return;
   if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}
 });
 cards.addEventListener('scroll',update,{passive:true});
 new ResizeObserver(update).observe(cards);
 setup();
 let inView=false,hovered=false,paused=false;
 const pause=document.createElement('button');
 pause.type='button';pause.className='reviews-pause';pause.textContent='Ⅱ';
 pause.setAttribute('aria-label','Pausar carrusel');pause.setAttribute('aria-pressed','false');
 controls.append(pause);
 pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Reanudar carrusel':'Pausar carrusel');});
 cards.addEventListener('pointerenter',()=>{hovered=true;});
 cards.addEventListener('pointerleave',()=>{hovered=false;});
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;},{threshold:.3}).observe(cards);
 setInterval(()=>{
   if(!inView||document.hidden||reduce.matches||paused||hovered||section.contains(document.activeElement)||cards.querySelector('[aria-expanded="true"]'))return;
   move(1);
 },15000);
 const key=window.PYP_GOOGLE_MAPS_KEY;
 if(!key)return;
 const load=async()=>{
   if(!window.google?.maps?.importLibrary) await new Promise((resolve,reject)=>{
     const timer=setTimeout(()=>reject(new Error('Google timeout')),15000);
     window.pypGoogleReady=()=>{clearTimeout(timer);resolve();};
     const script=document.createElement('script');
     script.async=true;
     script.src='https://maps.googleapis.com/maps/api/js?'+new URLSearchParams({key,loading:'async',callback:'pypGoogleReady',v:'weekly',language:'es'});
     script.onerror=()=>{clearTimeout(timer);reject(new Error('Google unavailable'));};
     document.head.append(script);
   });
   const {Place}=await google.maps.importLibrary('places');
   const place=new Place({id:'ChIJC1DeTevLvJURP7AiY8YlzF8'});
   await place.fetchFields({fields:['rating','userRatingCount','reviews']});
   return {rating:place.rating,total:place.userRatingCount,reviews:(place.reviews||[]).map(r=>({
    author:r.authorAttribution?.displayName||'Usuario de Google',
    authorUrl:r.authorAttribution?.uri||'https://maps.google.com/',
    avatar:r.authorAttribution?.photoURI||'',
    text:r.text||'',rating:r.rating,publishedAt:r.publishTime?new Date(r.publishTime).getTime()/1000:0,
    reviewUrl:r.googleMapsURI||''
   }))};
 };
 const nearSection=new Promise(resolve=>{
   if(!('IntersectionObserver' in window)){resolve();return;}
   const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();resolve();}},{rootMargin:'300px'});
   observer.observe(section);
 });
 nearSection.then(load).then(data=>{
   const reviews=data.reviews.filter(r=>typeof r.text==='string'&&typeof r.author==='string'&&typeof r.authorUrl==='string'&&r.authorUrl.startsWith('https://www.google.com/maps/contrib/')&&r.rating>=1&&r.rating<=5);
   if(!reviews.length)return;
   if(Number.isFinite(data.rating)&&Number.isFinite(data.total)){
    section.querySelector('.reviews-score').textContent=data.rating.toFixed(1).replace('.',',');
    section.querySelector('.reviews-count').textContent=data.total+' reseñas';
    section.querySelector('.reviews-rating .review-stars').setAttribute('aria-label',data.rating+' de 5 estrellas');
   }
   const node=(tag,cls,value)=>{const el=document.createElement(tag);el.className=cls;if(value)el.textContent=value;return el;};

   const render=()=>{
     cards.replaceChildren(...reviews.map(r=>{
       const card=node('article','review-card');
       const stars=node('div','review-stars','★'.repeat(Math.round(r.rating))+'☆'.repeat(5-Math.round(r.rating)));
       stars.setAttribute('aria-label',r.rating+' de 5 estrellas');
       const body=node('p','review-text',r.text);
       body.tabIndex=0;
       const author=node('a','review-author',r.author);
       author.href=r.authorUrl;author.target='_blank';author.rel='noopener';
       const date=new Date(r.publishedAt*1000);
       const source=node('span','review-source','Google · '+date.toLocaleDateString('es-AR',{month:'short',year:'numeric'}));
       if(typeof r.avatar==='string' && r.avatar.startsWith('https://')) {const avatar=node('img','review-avatar');avatar.src=r.avatar;avatar.alt='';avatar.width=36;avatar.height=36;avatar.loading='lazy';author.prepend(avatar);}
       card.append(stars,body,author,source);if(r.reviewUrl && r.reviewUrl.startsWith('https://')){const link=node('a','review-source','Ver reseña en Google Maps ↗');link.href=r.reviewUrl;link.target='_blank';link.rel='noopener';card.append(link);}return card;
     }));
     setup();
   };
   section.querySelector('.reviews-bottom>p').textContent='Reseñas de Google Maps · Ordenadas por relevancia';
   render();
 }).catch(()=>{/* Keep the readable, server-rendered review selection. */});
})();
