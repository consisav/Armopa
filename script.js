const modal = document.getElementById("clientModal");
const menu = document.querySelector(".menu");

document.querySelector(".menu-toggle").addEventListener("click", () => menu.classList.toggle("open"));
document.querySelectorAll(".menu a").forEach(a => a.addEventListener("click", () => menu.classList.remove("open")));

function openClient(){ modal.classList.add("show"); modal.setAttribute("aria-hidden","false"); }
function closeClient(){ modal.classList.remove("show"); modal.setAttribute("aria-hidden","true"); }
modal.addEventListener("click", e => { if(e.target === modal) closeClient(); });

function setLanguage(lang){
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-es][data-en]").forEach(el => {
    el.textContent = el.dataset[lang];
  });
  document.querySelectorAll("[data-placeholder-es]").forEach(el => {
    el.placeholder = el.dataset["placeholder-"+lang];
  });
  document.querySelectorAll(".lang").forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
  localStorage.setItem("armopaLang", lang);
}
document.querySelectorAll(".lang").forEach(b => b.addEventListener("click", () => setLanguage(b.dataset.lang)));
setLanguage(localStorage.getItem("armopaLang") || "es");

function sendForm(e){
  e.preventDefault();
  alert(document.documentElement.lang === "en"
    ? "Demo form submitted. Connect it to your email, CRM or database for production."
    : "Solicitud enviada en modo demostración. Conecta este formulario a tu correo, CRM o base de datos para producción.");
  e.target.reset();
}

/* ARMOPA FINAL CAROUSEL */
(()=>{const t=document.querySelector(".property-track"),v=document.querySelector(".property-viewport"),p=document.querySelector(".property-arrow.prev"),n=document.querySelector(".property-arrow.next"),d=document.querySelector(".carousel-dots");if(!t||!v||!p||!n||!d)return;const c=[...t.querySelectorAll(".property-card")];let i=0;const count=()=>innerWidth<=780?1:innerWidth<=1050?2:3;const max=()=>Math.max(0,c.length-count());function dots(){d.innerHTML="";for(let x=0;x<=max();x++){let b=document.createElement("button");b.className="carousel-dot"+(x===i?" active":"");b.setAttribute("aria-label","Ir a la posición "+(x+1));b.onclick=()=>{i=x;up()};d.appendChild(b)}}function up(){i=Math.max(0,Math.min(i,max()));let gap=parseFloat(getComputedStyle(t).gap)||0,w=c[0].getBoundingClientRect().width;t.style.transform=`translateX(-${i*(w+gap)}px)`;p.disabled=i===0;n.disabled=i===max();p.style.opacity=p.disabled?".42":"1";n.style.opacity=n.disabled?".42":"1";[...d.children].forEach((b,x)=>b.classList.toggle("active",x===i))}p.onclick=()=>{i--;up()};n.onclick=()=>{i++;up()};addEventListener("resize",()=>{dots();up()});dots();up()})();
