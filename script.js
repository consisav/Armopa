/* ARMOPA — comportamiento de la página: idioma ES/EN, menú, carrusel, Área de Clientes y formulario (demostración). */
const T = {
  es: {
    menu: 'Menú', nInicio: 'Inicio', nNosotros: 'Nosotros', nPropiedades: 'Propiedades', nServicios: 'Servicios', nProyectos: 'Proyectos', nContacto: 'Contacto',
    client: 'Área de Clientes', close: 'Cerrar',
    heroAlt: 'Desarrollo residencial con vista a volcanes y lago en Guatemala',
    tag: 'Inversiones * desarrollo * administración * servicios * lealtad', lede: 'Soluciones inmobiliarias seguras, modernas, personalizadas y ajustadas a tus necesidades para proteger tu inversión, así como hacer crecer tu patrimonio.', heroL1: 'Tu patrimonio', heroL2: 'en las mejores manos', btnProps: 'Ver propiedades', btnServ: 'Nuestros servicios',
    t1: 'Seguridad', t1s: 'en cada proceso', t2: 'Rentabilidad', t2s: 'orientada a resultados',
    t3: 'Confianza', t3s: 'atención personalizada', t4: 'Cobertura', t4s: 'en Guatemala',
    aboutH: 'Administración inmobiliaria con visión integral',
    aboutP: 'Integramos administración, compra y venta, alquileres, remodelación, construcción y desarrollo de proyectos para ofrecer una gestión práctica y ordenada de cada propiedad.',
    propH: 'Propiedades exclusivas en Guatemala', catalog: 'Solicitar catálogo', prev: 'Propiedad anterior', next: 'Siguiente propiedad',
    places: ['Ciudad de Guatemala', 'Lago de Atitlán', 'Antigua Guatemala', 'Petén', 'Zona 10'],
    alts: ['Propiedad de lujo en Ciudad de Guatemala', 'Propiedad de lujo en Lago de Atitlán', 'Propiedad de lujo en Antigua Guatemala', 'Propiedad de lujo en Petén', 'Propiedad premium en Zona 10'],
    goTo: 'Ir a la posición ',
    servH: 'Todo lo que necesitas para tu propiedad',
    s1: 'Compra y venta', s1d: 'Bienes inmuebles en todo el país con desarrollo inmobiliario.',
    s2: 'Adaptamos tu presupuesto', s2d: 'Diseñamos alternativas de acuerdo con tus necesidades y objetivos.',
    s3: 'Compramos tu propiedad', s3d: 'Evaluación y acompañamiento durante el proceso de compra.',
    s4: 'Remodelamos tu propiedad', s4d: 'Planificación, coordinación y supervisión de remodelaciones.',
    s5: 'Construimos en tu terreno', s5d: 'Desde el diseño y presupuesto hasta la ejecución.',
    s6: 'Desarrollamos tu proyecto', s6d: 'Evaluación, planificación, construcción y supervisión integral.',
    extH: 'Especialistas para cada necesidad', extSub: 'Servicios externos coordinados por ARMOPA.',
    ext: ['Alquiler de maquinaria pesada', 'Renta de camiones para extracción', 'Renta de apartamentos y edificios', 'Mantenimiento de edificios', 'Plomería y electricidad', 'Asesoría jurídica', 'Orientación para préstamos con CHN', 'Movimiento de tierra'],
    ctaH: '¿Tienes una propiedad o un proyecto?', ctaP: 'Conversemos sobre la mejor forma de administrarlo, desarrollarlo o hacerlo crecer.', ctaBtn: 'Contáctanos',
    ctH: 'Hablemos de tu próximo proyecto', ctP: 'Atención personalizada para propietarios, compradores, inversionistas e inquilinos.',
    phoneL: 'Teléfono', mailL: 'Correo',
    fName: 'Nombre completo', fMail: 'Correo electrónico', fPhone: 'Teléfono', fReason: 'Motivo de contacto', fMsg: 'Cuéntanos qué necesitas',
    r1: 'Comprar / vender', r2: 'Administrar propiedad', r3: 'Desarrollo de proyecto', r4: 'Servicios externos',
    send: 'Enviar solicitud', sentMsg: 'Modo demostración: conecta este formulario a tu correo o CRM para recibir solicitudes.',
    fAtt: 'Atención', fFollow: 'Síguenos', rights: 'Todos los derechos reservados.',
    cUser: 'Usuario', cPass: 'Clave', cCode: 'Código / Propiedad', cGo: 'Ingresar',
    cMsg: 'Acceso de demostración: conecta este formulario a tu sistema de usuarios.'
  },
  en: {
    menu: 'Menu', nInicio: 'Home', nNosotros: 'About', nPropiedades: 'Properties', nServicios: 'Services', nProyectos: 'Projects', nContacto: 'Contact',
    client: 'Client Area', close: 'Close',
    heroAlt: 'Residential development with views of volcanoes and a lake in Guatemala',
    tag: 'Investments * development * management * services * loyalty', lede: 'Secure, modern, personalized real estate solutions tailored to your needs to protect your investment as well as grow your wealth.', heroL1: 'Your wealth', heroL2: 'in the best hands', btnProps: 'View properties', btnServ: 'Our services',
    t1: 'Security', t1s: 'in every process', t2: 'Profitability', t2s: 'results oriented',
    t3: 'Trust', t3s: 'personalized service', t4: 'Coverage', t4s: 'across Guatemala',
    aboutH: 'Real estate management with an integrated vision',
    aboutP: 'We integrate management, buying and selling, rentals, remodeling, construction and project development to provide practical and organized management for every property.',
    propH: 'Exclusive properties in Guatemala', catalog: 'Request catalog', prev: 'Previous property', next: 'Next property',
    places: ['Guatemala City', 'Lake Atitlán', 'Antigua Guatemala', 'Petén', 'Zone 10'],
    alts: ['Luxury property in Guatemala City', 'Luxury property at Lake Atitlán', 'Luxury property in Antigua Guatemala', 'Luxury property in Petén', 'Premium property in Zone 10'],
    goTo: 'Go to position ',
    servH: 'Everything you need for your property',
    s1: 'Buying & selling', s1d: 'Real estate nationwide with property development.',
    s2: 'We adapt to your budget', s2d: 'We design alternatives according to your needs and goals.',
    s3: 'We buy your property', s3d: 'Evaluation and support throughout the purchase process.',
    s4: 'We remodel your property', s4d: 'Planning, coordination and supervision of remodeling.',
    s5: 'We build on your land', s5d: 'From design and budgeting to execution.',
    s6: 'We develop your project', s6d: 'Evaluation, planning, construction and comprehensive supervision.',
    extH: 'Specialists for every need', extSub: 'External services coordinated by ARMOPA.',
    ext: ['Heavy machinery rental', 'Dump truck rental for hauling', 'Apartment and building rentals', 'Building maintenance', 'Plumbing and electrical', 'Legal advisory', 'Guidance for CHN loans', 'Earthmoving'],
    ctaH: 'Do you have a property or project?', ctaP: "Let's discuss the best way to manage, develop or grow it.", ctaBtn: 'Contact us',
    ctH: "Let's talk about your next project", ctP: 'Personalized service for owners, buyers, investors and tenants.',
    phoneL: 'Phone', mailL: 'Email',
    fName: 'Full name', fMail: 'Email address', fPhone: 'Phone', fReason: 'Reason for contact', fMsg: 'Tell us what you need',
    r1: 'Buy / sell', r2: 'Property management', r3: 'Project development', r4: 'External services',
    send: 'Send request', sentMsg: 'Demo mode: connect this form to your email or CRM to receive requests.',
    fAtt: 'Contact', fFollow: 'Follow us', rights: 'All rights reserved.',
    cUser: 'Username', cPass: 'Password', cCode: 'Property code', cGo: 'Sign in',
    cMsg: 'Demo access: connect this form to your user system.'
  }
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
let lang = 'es';
try { lang = localStorage.getItem('armopaLang') || 'es'; } catch (e) {}

function setLang(l) {
  lang = l;
  const t = T[l];
  document.documentElement.lang = l;
  $$('[data-i18n]').forEach((el) => { el.textContent = t[el.dataset.i18n]; });
  $$('[data-i18n-label]').forEach((el) => el.setAttribute('aria-label', t[el.dataset.i18nLabel]));
  $$('.pc').forEach((card, i) => {
    card.querySelector('img').alt = t.alts[i];
    card.querySelector('.pn').textContent = t.places[i];
  });
  $$('[data-ext]').forEach((el) => { el.textContent = t.ext[+el.dataset.ext]; });
  $$('.lg').forEach((b) => b.classList.toggle('on', b.dataset.lang === l));
  try { localStorage.setItem('armopaLang', l); } catch (e) {}
  buildDots();
}
$$('.lg').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

/* Menú móvil */
const navwrap = $('#navwrap'), burger = $('#burger');
burger.addEventListener('click', () => {
  const open = navwrap.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
$$('.links a').forEach((a) => a.addEventListener('click', () => navwrap.classList.remove('open')));

/* Carrusel de propiedades */
const car = $('#car');
let idx = 0;
const total = 5;
const visible = () => (window.innerWidth <= 640 ? 1 : window.innerWidth <= 1000 ? 2 : 3);
const maxIdx = () => total - visible();
function buildDots() {
  const box = $('#dots');
  box.innerHTML = '';
  for (let i = 0; i <= maxIdx(); i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot' + (i === idx ? ' on' : '');
    b.setAttribute('aria-label', T[lang].goTo + (i + 1));
    b.addEventListener('click', () => { idx = i; update(); });
    box.appendChild(b);
  }
}
function update() {
  idx = Math.max(0, Math.min(idx, maxIdx()));
  car.style.setProperty('--i', idx);
  $$('.dot').forEach((d, i) => d.classList.toggle('on', i === idx));
}
$('#prev').addEventListener('click', () => { idx = idx <= 0 ? maxIdx() : idx - 1; update(); });
$('#next').addEventListener('click', () => { idx = idx >= maxIdx() ? 0 : idx + 1; update(); });
window.addEventListener('resize', () => { buildDots(); update(); });

/* Área de Clientes (demostración) */
const modal = $('#clientModal');
$('#openClient').addEventListener('click', () => { modal.hidden = false; $('#clientNote').hidden = true; navwrap.classList.remove('open'); });
const closeClient = () => { modal.hidden = true; };
$('#closeClient').addEventListener('click', closeClient);
$('#scrim').addEventListener('click', closeClient);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeClient(); });
$('#clientGo').addEventListener('click', () => { $('#clientNote').hidden = false; });

/* Formulario de contacto (demostración) */
$('#sendBtn').addEventListener('click', () => { $('#sentNote').hidden = false; });

setLang(lang);
update();
