(() => {
 const input=document.getElementById('f-telefono');
 if(!input) return;
 const form=input.form;
 let instance=null;
 let loading=null;
 const load=()=>{
   if(instance) return Promise.resolve(instance);
   if(loading) return loading;
   loading=new Promise((resolve,reject)=>{
     const script=document.createElement('script');
     script.src='assets/vendor/intl-tel-input/js/intlTelInputWithUtils.min.js';
     script.onload=()=>{
       const i18n={searchPlaceholder:'Buscar país o código',zeroSearchResults:'No se encontraron países',countryListAriaLabel:'Países',selectedCountryAriaLabel:'País seleccionado',noCountrySelected:'Seleccioná un país'};
       instance=window.intlTelInput(input,{initialCountry:'ar',countryOrder:['ar','uy','cl','es','us'],separateDialCode:true,countrySearch:true,showFlags:true,countryNameLocale:'es',uiTranslations:i18n,allowedNumberTypes:null,dropdownParent:document.body});
       resolve(instance);
     };
     script.onerror=()=>{loading=null;reject(new Error('No se pudo cargar el selector de países'));};
     document.head.appendChild(script);
   });
   return loading;
 };
 const full=document.createElement('input');full.type='hidden';full.name='Teléfono internacional';form.append(full);
 const country=document.createElement('input');country.type='hidden';country.name='País';form.append(country);
 const error=document.createElement('p');error.className='phone-error';error.id='phone-error';error.hidden=true;error.textContent='Revisá el número y el código del país.';input.closest('.field').append(error);
 input.setAttribute('aria-describedby','phone-error');
 const clear=()=>{input.setCustomValidity('');error.hidden=true;};
 input.addEventListener('input',clear);
 input.addEventListener('countrychange',clear);
 input.addEventListener('focus',()=>load().catch(()=>{}));
 if('IntersectionObserver' in window){
   const observer=new IntersectionObserver(entries=>{
     if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();load().catch(()=>{});}
   },{rootMargin:'400px'});
   observer.observe(input);
 }else load().catch(()=>{});

 form.addEventListener('submit',event=>{
   if(!input.value.trim()){full.value='';country.value='';return;}
   if(!instance){
     event.preventDefault();
     load().then(()=>form.requestSubmit()).catch(()=>{error.hidden=false;error.textContent='No pudimos cargar el selector. Recargá la página o escribinos por WhatsApp.';});
     return;
   }
   if(input.value.trim() && !instance.isValidNumber()){
     event.preventDefault();error.hidden=false;input.setCustomValidity(error.textContent);input.reportValidity();return;
   }
   full.value=input.value.trim()?instance.getNumber():'';
   const selected=instance.getSelectedCountry();country.value=selected.name;
 });
})();