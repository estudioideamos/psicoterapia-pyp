(() => {
 const input=document.getElementById('f-telefono');
 if(!input || !window.intlTelInput) return;
 const form=input.form;
 const i18n={searchPlaceholder:'Buscar país o código',zeroSearchResults:'No se encontraron países',countryListAriaLabel:'Países',selectedCountryAriaLabel:'País seleccionado',noCountrySelected:'Seleccioná un país'};
 const phone=window.intlTelInput(input,{initialCountry:'ar',countryOrder:['ar','uy','cl','es','us'],separateDialCode:true,countrySearch:true,showFlags:true,countryNameLocale:'es',uiTranslations:i18n,allowedNumberTypes:null,dropdownParent:document.body});
 const full=document.createElement('input');full.type='hidden';full.name='Teléfono internacional';form.append(full);
 const country=document.createElement('input');country.type='hidden';country.name='País';form.append(country);
 const error=document.createElement('p');error.className='phone-error';error.id='phone-error';error.hidden=true;error.textContent='Revisá el número y el código del país.';input.closest('.field').append(error);
 input.setAttribute('aria-describedby','phone-error');
 input.addEventListener('input',()=>{input.setCustomValidity('');error.hidden=true;});
 input.addEventListener('countrychange',()=>{input.setCustomValidity('');error.hidden=true;});
 form.addEventListener('submit',e=>{
   if(input.value.trim() && !phone.isValidNumber()){
     e.preventDefault();error.hidden=false;input.setCustomValidity(error.textContent);input.reportValidity();return;
   }
   full.value=input.value.trim()?phone.getNumber():'';
   const selected=phone.getSelectedCountry();country.value=selected.name;
 });
})();