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
