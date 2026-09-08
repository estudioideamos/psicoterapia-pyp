(() => {
 const section=document.querySelector('.reviews-premium');
 if(!section)return;
 const cards=section.querySelector('.reviews-cards');
 let page=0;
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
   const pages=Math.ceil(reviews.length/3);
   const render=()=>{
     cards.replaceChildren(...reviews.slice(page*3,page*3+3).map(r=>{
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
     section.querySelector('.reviews-page').textContent=(page+1)+' / '+pages;
     if(!matchMedia('(prefers-reduced-motion:reduce)').matches)
       cards.animate([{opacity:.4,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:300});
   };
   section.querySelector('.reviews-controls').hidden=pages<2;
   section.querySelector('.reviews-prev').addEventListener('click',()=>{page=(page-1+pages)%pages;render();});
   section.querySelector('.reviews-next').addEventListener('click',()=>{page=(page+1)%pages;render();});
   section.querySelector('.reviews-bottom>p').textContent='Reseñas de Google Maps · Ordenadas por relevancia';
   render();
 }).catch(()=>{/* Keep the readable, server-rendered review selection. */});
})();
