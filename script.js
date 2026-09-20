/* ARMOPA — comportamiento de la página: idioma ES/EN, menú, carrusel, Área de Clientes y formulario (demostración). */
const T = {
  es: {
    menu: 'Menú', nInicio: 'Inicio', nNosotros: 'Nosotros', nPropiedades: 'Propiedades', nServicios: 'Servicios', nProyectos: 'Proyectos', nContacto: 'Contacto',
    client: 'Área de Clientes', close: 'Cerrar',
    heroAlt: 'Desarrollo residencial con vista a volcanes y lago en Guatemala',
    tag: 'Inversiones * desarrollo * administración * servicios * lealtad', lede: 'Soluciones inmobiliarias seguras, modernas, personalizadas y ajustadas a tus necesidades para proteger tu inversión, así como hacer crecer tu patrimonio.', heroL1: 'Tu patrimonio', heroL2: 'en las mejores manos', btnProps: 'Ver propiedades', btnServ: 'Nuestros servicios',
    t1: 'Seguridad', t1s: 'en cada proceso', t2: 'Rentabilidad', t2s: 'orientada a resultados',
    t3: 'Confianza', t3s: 'atención personalizada', t4: 'Cobertura', t4s: 'en Guatemala',
    aboutT1: "En ARMOPA transformamos la búsqueda de propiedades en una experiencia estratégica y personalizada. Somos una firma de consultoría inmobiliaria y de Servicios Profesionales Integrados dedicada a conectar a nuestros clientes con espacios excepcionales que elevan su estilo de vida y aseguran su patrimonio. Nuestro compromiso se fundamenta en la Lealtad, transparencia, integridad usando la innovación de mercado y una profunda experiencia sectorial, garantizando decisiones de inversión sólidas, transparentes y de alto valor a largo plazo.", aboutT2: "Te orientamos para encontrar el espacio ideal, de forma inteligente, el punto donde la tecnología inmobiliaria y el trato humano se encuentran. Nos especializamos en simplificar el proceso de compra, venta y alquiler de propiedades mediante un ecosistema digital avanzado y un equipo de expertos siempre a tu disposición. Nos apasiona optimizar tu tiempo y maximizar tus oportunidades de inversión, ofreciendo un servicio ágil, transparente y diseñado a la medida de las demandas del mercado actual.", aboutT3: "Entendemos que una propiedad es mucho más que cuatro paredes: es el escenario de tus próximos grandes recuerdos y el pilar de tu estabilidad familiar. Con años de trayectoria en el sector, nos enorgullece ser los aliados de confianza de cientos de familias en la búsqueda de su hogar ideal. Nos distingue un servicio de asesoría honesto, empático y profesional, diseñado para acompañarte con absoluta seguridad en cada paso del camino.", aboutH1: 'Administración inmobiliaria con visión profesional e inteligente,', aboutH2: 'en forma segura, leal, responsable e íntegra,', aboutH3: 'haciendo que tu inversión crezca a niveles inimaginables.',
    invH: 'Tu Inversión:', invSub: 'Inversión Garantizada:', invItems: ['Compra y venta', 'Alquileres Diversos', 'Integramos administración', 'Remodelación', 'Construcción / Remodelación', 'Desarrollo de proyectos con gestión practica de rentabilidad'], aboutP: 'Integramos administración, compra y venta, alquileres, remodelación, construcción y desarrollo de proyectos para ofrecer una gestión práctica y ordenada de cada propiedad.',
    svH: 'Tus Servicios:', svA: 'Servicios Profesionales coordinados', svItems: ['Alquiler de maquinaria pesada', 'Renta de Camiones para extracción', 'Renta de apartamentos y Edificio', 'Mantenimiento de Edificios', 'Plomería y electricidad', 'Asesoría Jurídica', 'Prestamos con CHN', 'Movimiento de Tierra'],
    propH: 'Propiedades exclusivas en Guatemala', catalog: 'Solicitar catálogo', prev: 'Propiedad anterior', next: 'Siguiente propiedad',
    places: ['Ciudad de Guatemala', 'Lago de Atitlán', 'Antigua Guatemala', 'Petén', 'Zona 10'],
    alts: ['Propiedad de lujo en Ciudad de Guatemala', 'Propiedad de lujo en Lago de Atitlán', 'Propiedad de lujo en Antigua Guatemala', 'Propiedad de lujo en Petén', 'Propiedad premium en Zona 10'],
    goTo: 'Ir a la posición ',
    openProp: 'Ver ubicaciones de ', noLocs: 'Sin ubicaciones todavía', oneLoc: '1 ubicación', locsWord: 'ubicaciones',
    addLoc: 'Agregar ubicación', locDefault: 'Ubicación', emptyH: 'Aún no hay ubicaciones', emptyP: 'Agrega la primera para subir sus imágenes y su dirección.',
    nameL: 'Nombre de la ubicación', zoom: 'Ver foto del vendedor en tamaño original', zoomToggle: 'Alternar entre ajustar a la pantalla y tamaño real', opL: 'Tipo de operación', opRent: 'Renta', opSale: 'Venta', opBoth: 'Renta o venta', rentL: 'Valor de renta', saleL: 'Valor de la propiedad (venta)', rentPh: 'Ej. Q 4,500 al mes', salePh: 'Ej. Q 850,000', opHint: 'Elige el tipo de operación para indicar los valores.', viewOpRent: 'En renta', viewOpSale: 'En venta', viewOpBoth: 'En renta o venta', rentView: 'Renta', saleView: 'Precio de venta', sellerH: 'Vendedor', sellerUp: 'Subir foto del vendedor', sellerRm: 'Quitar foto', sellerName: 'Nombre del vendedor', sellerWa: 'WhatsApp del vendedor', waHint: 'Incluye el código de país, por ejemplo +502. Si escribes 8 dígitos se agrega el 502 automáticamente.', sellerLabel: 'Contacto del vendedor', waBtn: 'Contactar por WhatsApp', waMsg: 'Hola, me interesa la propiedad: ', descL: 'Descripción de la propiedad', descPh: 'Características, habitaciones, amenidades, precio y cualquier detalle importante…', descH: 'Descripción', addrL: 'Dirección o enlace de Google Maps', photo: 'Imagen ', photosH: 'Imágenes de la ubicación', upload: 'Subir imágenes',
    uploadHint: 'Puedes seleccionar varias imágenes (JPG o PNG).', remove: 'Quitar imagen', uploaded: 'Imágenes agregadas.', saved: 'Cambios guardados.',
    del: 'Eliminar ubicación', delSure: '¿Confirmar eliminación?', view: 'Visualizar', edit: 'Volver a editar', mapOpen: 'Ver en Google Maps',
    prevImg: 'Imagen anterior', nextImg: 'Imagen siguiente', noImgs: 'Esta ubicación aún no tiene imágenes.',
    storeNote: 'Los cambios se guardan automáticamente en este navegador. Para mostrarlos a todos los visitantes, la página debe conectarse a un servidor o base de datos.',
    storeErr: 'No se pudo guardar: el navegador no tiene espacio. Quita algunas imágenes e inténtalo de nuevo.',
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
    aboutT1: "At ARMOPA we turn the search for properties into a strategic, personalized experience. We are a real estate consulting firm and an Integrated Professional Services firm dedicated to connecting our clients with exceptional spaces that elevate their lifestyle and secure their wealth. Our commitment is grounded in Loyalty, transparency and integrity, using market innovation and deep industry expertise, ensuring sound, transparent, high long-term value investment decisions.", aboutT2: "We guide you to find the ideal space, intelligently: the point where real estate technology and the human touch meet. We specialize in simplifying the process of buying, selling and renting properties through an advanced digital ecosystem and a team of experts always at your disposal. We are passionate about optimizing your time and maximizing your investment opportunities, offering an agile, transparent service tailored to the demands of today's market.", aboutT3: "We understand that a property is much more than four walls: it is the stage for your next great memories and the pillar of your family's stability. With years of experience in the sector, we are proud to be the trusted allies of hundreds of families in their search for the ideal home. We stand out for honest, empathetic and professional advice, designed to accompany you with absolute security every step of the way.", aboutH1: 'Real estate management with a professional and intelligent vision,', aboutH2: 'in a secure, loyal, responsible and honest way,', aboutH3: 'making your investment grow to unimaginable levels.',
    invH: 'Your Investment:', invSub: 'Guaranteed Investment:', invItems: ['Buying and selling', 'Diverse rentals', 'We integrate management', 'Remodeling', 'Construction / Remodeling', 'Project development with practical profitability management'], aboutP: 'We integrate management, buying and selling, rentals, remodeling, construction and project development to provide practical and organized management for every property.',
    svH: 'Your Services:', svA: 'Coordinated professional services', svItems: ['Heavy machinery rental', 'Dump truck rental for hauling', 'Apartment and building rentals', 'Building maintenance', 'Plumbing and electrical', 'Legal advisory', 'CHN loans', 'Earthmoving'],
    propH: 'Exclusive properties in Guatemala', catalog: 'Request catalog', prev: 'Previous property', next: 'Next property',
    places: ['Guatemala City', 'Lake Atitlán', 'Antigua Guatemala', 'Petén', 'Zone 10'],
    alts: ['Luxury property in Guatemala City', 'Luxury property at Lake Atitlán', 'Luxury property in Antigua Guatemala', 'Luxury property in Petén', 'Premium property in Zone 10'],
    goTo: 'Go to position ',
    openProp: 'View locations in ', noLocs: 'No locations yet', oneLoc: '1 location', locsWord: 'locations',
    addLoc: 'Add location', locDefault: 'Location', emptyH: 'No locations yet', emptyP: 'Add the first one to upload its images and address.',
    nameL: 'Location name', zoom: 'View seller photo at original size', zoomToggle: 'Toggle between fit to screen and actual size', opL: 'Type of listing', opRent: 'Rent', opSale: 'Sale', opBoth: 'Rent or sale', rentL: 'Rent value', saleL: 'Property value (sale)', rentPh: 'e.g. Q 4,500 per month', salePh: 'e.g. Q 850,000', opHint: 'Choose the listing type to enter the values.', viewOpRent: 'For rent', viewOpSale: 'For sale', viewOpBoth: 'For rent or sale', rentView: 'Rent', saleView: 'Sale price', sellerH: 'Seller', sellerUp: 'Upload seller photo', sellerRm: 'Remove photo', sellerName: 'Seller name', sellerWa: 'Seller WhatsApp', waHint: 'Include the country code, for example +502. If you type 8 digits, 502 is added automatically.', sellerLabel: 'Seller contact', waBtn: 'Contact on WhatsApp', waMsg: 'Hello, I am interested in the property: ', descL: 'Property description', descPh: 'Features, rooms, amenities, price and any important details…', descH: 'Description', addrL: 'Address or Google Maps link', photo: 'Image ', photosH: 'Location images', upload: 'Upload images',
    uploadHint: 'You can select several images (JPG or PNG).', remove: 'Remove image', uploaded: 'Images added.', saved: 'Changes saved.',
    del: 'Delete location', delSure: 'Confirm deletion?', view: 'Preview', edit: 'Back to editing', mapOpen: 'View on Google Maps',
    prevImg: 'Previous image', nextImg: 'Next image', noImgs: 'This location has no images yet.',
    storeNote: 'Changes are saved automatically in this browser. To show them to every visitor, the site must be connected to a server or database.',
    storeErr: 'Could not save: the browser is out of space. Remove some images and try again.',
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
  $$('[data-i18n-ph]').forEach((el) => el.setAttribute('placeholder', t[el.dataset.i18nPh]));
  $$('.pc').forEach((card, i) => {
    card.querySelector('img').alt = t.alts[i];
    card.querySelector('.pn span').textContent = t.places[i];
    card.querySelector('.pc-img').setAttribute('aria-label', t.openProp + t.places[i]);
  });
  $$('[data-ext]').forEach((el) => { el.textContent = t.ext[+el.dataset.ext]; });
  $$('[data-sv]').forEach((el) => { el.textContent = t.svItems[+el.dataset.sv]; });
  $$('[data-inv]').forEach((el) => { el.textContent = t.invItems[+el.dataset.inv]; });
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

/* Propiedades: ubicaciones, imágenes y vista (se guardan en este navegador) */
const STORE = 'armopaProps_v2';
const BASE = [1, 2, 3, 4, 5].map((n) => 'assets/propiedad-' + n + '.jpg');
let data = {};
try { data = (JSON.parse(localStorage.getItem(STORE) || 'null') || {}).data || {}; } catch (e) {}
let cur = -1, mode = 'edit', sel = -1, vi = 0, confirmDel = false;
const pModal = $('#propModal');

const list = () => (data[cur] = data[cur] || []);
function persist() {
  try { localStorage.setItem(STORE, JSON.stringify({ data })); return true; } catch (e) { return false; }
}
function note(msg) {
  const el = $('#pMsg');
  el.textContent = msg || '';
  el.hidden = !msg;
}
function mapUrl(c) {
  const q = (c.addr || '').trim() || [c.name, T[lang].places[cur], 'Guatemala'].join(', ');
  return /^https?:\/\//i.test(q) ? q : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
}
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
function pickLoc(i) { sel = i; vi = 0; confirmDel = false; note(''); render(); }

function renderList() {
  const t = T[lang];
  const box = $('#pList');
  box.innerHTML = '';
  list().forEach((l, i) => {
    const b = el('button', 'li' + (i === sel ? ' on' : ''));
    b.type = 'button';
    b.append(el('span', '', l.name || t.locDefault), el('small', '', String(l.imgs.length)));
    b.addEventListener('click', () => pickLoc(i));
    box.appendChild(b);
  });
  const add = el('button', 'btn btn-dark', t.addLoc);
  add.type = 'button';
  add.addEventListener('click', () => {
    const l = list();
    l.push({ id: Date.now(), name: t.locDefault + ' ' + (l.length + 1), addr: '', desc: '', op: 'renta', pRent: '', pSale: '', imgs: [], sPhoto: '', sName: '', sWa: '' });
    sel = l.length - 1; vi = 0; confirmDel = false;
    note(persist() ? '' : t.storeErr);
    render();
  });
  box.appendChild(add);
}

function renderEdit() {
  const t = T[lang];
  const l = list();
  const c = l[sel];
  renderList();
  $('#pEmpty').hidden = !!c;
  $('#pForm').hidden = !c;
  if (!c) return;
  $('#p-name').value = c.name;
  $('#p-addr').value = c.addr;
  $('#p-desc').value = c.desc || '';
  const op = c.op || '';
  $$('#pOps .seg').forEach((b) => {
    b.classList.toggle('on', b.dataset.op === op);
    b.setAttribute('aria-pressed', b.dataset.op === op);
  });
  $('#opHint').hidden = !!op;
  $('#pPrices').hidden = !op;
  $('#fRent').hidden = !(op === 'renta' || op === 'ambos');
  $('#fSale').hidden = !(op === 'venta' || op === 'ambos');
  $('#p-rent').value = c.pRent || '';
  $('#p-sale').value = c.pSale || '';
  $('#p-sname').value = c.sName || '';
  $('#p-swa').value = c.sWa || '';
  $('#sAvBtn').hidden = !c.sPhoto;
  $('#sAvatarPh').hidden = !!c.sPhoto;
  $('#sRm').hidden = !c.sPhoto;
  if (c.sPhoto) $('#sAvatar').src = c.sPhoto;
  $('#pMap').href = mapUrl(c);
  const del = $('#pDel');
  del.textContent = confirmDel ? t.delSure : t.del;
  del.classList.toggle('on', confirmDel);
  const grid = $('#pGrid');
  grid.innerHTML = '';
  c.imgs.forEach((src, i) => {
    const wrap = el('div', 'th');
    const b = el('button', 'th-b');
    b.type = 'button';
    b.setAttribute('aria-label', t.photo + (i + 1));
    const img = el('img');
    img.src = src; img.alt = '';
    b.appendChild(img);
    b.addEventListener('click', () => { mode = 'view'; vi = i; render(); });
    const x = el('button', 'th-x', '×');
    x.type = 'button';
    x.setAttribute('aria-label', t.remove);
    x.addEventListener('click', () => {
      c.imgs.splice(i, 1);
      note(persist() ? t.saved : t.storeErr);
      renderEdit();
    });
    wrap.append(b, x);
    grid.appendChild(wrap);
  });
}

function renderView() {
  const t = T[lang];
  const l = list();
  const c = l[sel];
  const imgs = c ? c.imgs : [];
  vi = imgs.length ? Math.min(vi, imgs.length - 1) : 0;
  $('#vImg').src = imgs.length ? imgs[vi] : BASE[cur];
  $('#vImg').alt = c ? c.name : '';
  $('#vPrev').hidden = $('#vNext').hidden = $('#vCount').hidden = imgs.length < 2;
  $('#vCount').textContent = (vi + 1) + ' / ' + imgs.length;
  $('#vNoImg').hidden = imgs.length > 0;
  const th = $('#vThumbs');
  th.innerHTML = '';
  imgs.forEach((src, i) => {
    const b = el('button', 'vt' + (i === vi ? ' on' : ''));
    b.type = 'button';
    b.setAttribute('aria-label', t.photo + (i + 1));
    const img = el('img');
    img.src = src; img.alt = '';
    b.appendChild(img);
    b.addEventListener('click', () => { vi = i; renderView(); });
    th.appendChild(b);
  });
  $('#vName').textContent = c ? c.name : '';
  const vop = c ? (c.op || '') : '';
  const showR = !!(c && (vop === 'renta' || vop === 'ambos') && (c.pRent || '').trim());
  const showS = !!(c && (vop === 'venta' || vop === 'ambos') && (c.pSale || '').trim());
  $('#vOp').hidden = !vop;
  $('#vOp').textContent = vop === 'renta' ? t.viewOpRent : vop === 'venta' ? t.viewOpSale : vop === 'ambos' ? t.viewOpBoth : '';
  $('#vRentBox').hidden = !showR;
  $('#vRent').textContent = showR ? c.pRent.trim() : '';
  $('#vSaleBox').hidden = !showS;
  $('#vSale').textContent = showS ? c.pSale.trim() : '';
  $('#vPrices').hidden = !(showR || showS);
  const sd = c ? (c.sWa || '').replace(/\D/g, '') : '';
  const has = !!(c && (c.sPhoto || (c.sName || '').trim() || sd));
  $('#vSeller').hidden = !has;
  $('#vsBtn').hidden = !(c && c.sPhoto);
  if (c && c.sPhoto) $('#vsImg').src = c.sPhoto;
  $('#vsName').textContent = c ? (c.sName || '').trim() : '';
  $('#vsNum').textContent = c ? (c.sWa || '').trim() : '';
  $('#vsWa').hidden = !sd;
  if (sd) $('#vsWa').href = 'https://wa.me/' + (sd.length === 8 ? '502' + sd : sd) + '?text=' + encodeURIComponent(t.waMsg + c.name);
  const d = c ? (c.desc || '').trim() : '';
  $('#vDesc').textContent = d;
  $('#vDescBox').hidden = !d;
  const a = c && (c.addr || '').trim();
  $('#vAddr').textContent = a && !/^https?:\/\//i.test(a) ? a : t.places[cur] + ', Guatemala';
  if (c) $('#vMap').href = mapUrl(c);
  const chips = $('#vChips');
  chips.innerHTML = '';
  l.forEach((x, i) => {
    const b = el('button', 'chip' + (i === sel ? ' on' : ''), x.name || t.locDefault);
    b.type = 'button';
    b.addEventListener('click', () => pickLoc(i));
    chips.appendChild(b);
  });
}

function render() {
  const t = T[lang];
  const l = list();
  if (sel >= l.length) sel = l.length - 1;
  $('#pTitle').textContent = t.places[cur];
  $('#pSub').textContent = l.length === 0 ? t.noLocs : l.length === 1 ? t.oneLoc : l.length + ' ' + t.locsWord;
  $('#pCard').classList.toggle('vw', mode === 'view');
  $('#pEdit').hidden = mode !== 'edit';
  $('#pViewBox').hidden = mode !== 'view';
  if (mode === 'edit') renderEdit(); else renderView();
}
function openProp(i) {
  cur = i; mode = 'edit'; confirmDel = false;
  sel = list().length ? 0 : -1; vi = 0;
  note('');
  render();
  pModal.hidden = false;
}
function closeProp() { pModal.hidden = true; $('#lbModal').hidden = true; cur = -1; }
function shrink(file, max) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const r = Math.min(1, (max || 1200) / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * r);
        c.height = Math.round(img.height * r);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

$$('.pc-img').forEach((b) => b.addEventListener('click', () => openProp(+b.dataset.open)));
$('#pClose').addEventListener('click', closeProp);
$('#pScrim').addEventListener('click', closeProp);
$('#p-name').addEventListener('input', () => {
  const c = list()[sel]; if (!c) return;
  c.name = $('#p-name').value;
  note(persist() ? '' : T[lang].storeErr);
  renderList();
});
$('#p-addr').addEventListener('input', () => {
  const c = list()[sel]; if (!c) return;
  c.addr = $('#p-addr').value;
  note(persist() ? '' : T[lang].storeErr);
  $('#pMap').href = mapUrl(c);
});
$('#p-desc').addEventListener('input', () => {
  const c = list()[sel]; if (!c) return;
  c.desc = $('#p-desc').value;
  note(persist() ? '' : T[lang].storeErr);
});
$('#p-sname').addEventListener('input', () => {
  const c = list()[sel]; if (!c) return;
  c.sName = $('#p-sname').value;
  note(persist() ? '' : T[lang].storeErr);
});
$('#p-swa').addEventListener('input', () => {
  const c = list()[sel]; if (!c) return;
  c.sWa = $('#p-swa').value;
  note(persist() ? '' : T[lang].storeErr);
});
$('#p-sphoto').addEventListener('change', async (e) => {
  const f = (e.target.files || [])[0];
  e.target.value = '';
  const c = list()[sel]; if (!c || !f) return;
  try { c.sPhoto = await shrink(f, 1600); } catch (err) { return; }
  note(persist() ? T[lang].saved : T[lang].storeErr);
  renderEdit();
});
$('#sRm').addEventListener('click', () => {
  const c = list()[sel]; if (!c) return;
  c.sPhoto = '';
  note(persist() ? T[lang].saved : T[lang].storeErr);
  renderEdit();
});
$$('#pOps .seg').forEach((b) => b.addEventListener('click', () => {
  const c = list()[sel]; if (!c) return;
  c.op = b.dataset.op;
  note(persist() ? '' : T[lang].storeErr);
  renderEdit();
}));
$('#p-rent').addEventListener('input', () => {
  const c = list()[sel]; if (!c) return;
  c.pRent = $('#p-rent').value;
  note(persist() ? '' : T[lang].storeErr);
});
$('#p-sale').addEventListener('input', () => {
  const c = list()[sel]; if (!c) return;
  c.pSale = $('#p-sale').value;
  note(persist() ? '' : T[lang].storeErr);
});
$('#p-files').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files || []);
  e.target.value = '';
  const c = list()[sel]; if (!c) return;
  const urls = [];
  for (const f of files) {
    try { urls.push(await shrink(f)); } catch (err) {}
  }
  if (!urls.length) return;
  c.imgs = c.imgs.concat(urls);
  note(persist() ? T[lang].uploaded : T[lang].storeErr);
  renderEdit();
});
$('#pView').addEventListener('click', () => { mode = 'view'; vi = 0; note(''); render(); });
$('#vEdit').addEventListener('click', () => { mode = 'edit'; render(); });
$('#pDel').addEventListener('click', () => {
  if (!confirmDel) { confirmDel = true; renderEdit(); return; }
  list().splice(sel, 1);
  sel = Math.max(0, sel - 1); confirmDel = false; vi = 0;
  note(persist() ? T[lang].saved : T[lang].storeErr);
  render();
});
$('#vPrev').addEventListener('click', () => { const n = list()[sel].imgs.length; vi = vi <= 0 ? n - 1 : vi - 1; renderView(); });
$('#vNext').addEventListener('click', () => { const n = list()[sel].imgs.length; vi = vi >= n - 1 ? 0 : vi + 1; renderView(); });
/* Foto del vendedor en tamaño original */
const lbModal = $('#lbModal');
function openZoom(src) {
  $('#lbImg').src = src;
  $('#lb').classList.remove('full');
  lbModal.hidden = false;
}
$('#sAvBtn').addEventListener('click', () => { const c = list()[sel]; if (c && c.sPhoto) openZoom(c.sPhoto); });
$('#vsBtn').addEventListener('click', () => { const c = list()[sel]; if (c && c.sPhoto) openZoom(c.sPhoto); });
$('#lbBtn').addEventListener('click', () => $('#lb').classList.toggle('full'));
$('#lbClose').addEventListener('click', () => { lbModal.hidden = true; });
$('#lbScrim').addEventListener('click', () => { lbModal.hidden = true; });
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!lbModal.hidden) lbModal.hidden = true; else closeProp();
});

setLang(lang);
update();
