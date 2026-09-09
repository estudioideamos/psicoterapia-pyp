(() => {
 const root=document.documentElement;
 let current='light';
 try{current=localStorage.getItem('pyp-theme')==='dark'?'dark':'light';}catch{}
 root.dataset.theme=current;
 const apply=theme=>{
  current=theme;root.dataset.theme=theme;
  document.querySelectorAll('.theme-toggle').forEach(button=>{
   const label=theme==='dark'?'Activar modo claro':'Activar modo oscuro';
   button.setAttribute('aria-label',label);button.title=label;
  });
 };
 document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.theme-toggle').forEach(button=>{
   button.hidden=false;
   button.addEventListener('click',()=>{
    apply(current==='dark'?'light':'dark');
    try{localStorage.setItem('pyp-theme',current);}catch{}
   });
  });apply(current);
 });
 addEventListener('storage',e=>{if(e.key==='pyp-theme')apply(e.newValue==='dark'?'dark':'light');});
})();
