/* ARMOPA — comportamiento de la página: idioma ES/EN, menú, carrusel, Área de Clientes y formulario (demostración). */
/* Presupuesto estimado: precios de referencia de mercado en Guatemala (2026), en quetzales y sin IVA (12%). Son rangos orientativos. */
function estimate(i, d, lang) {
  const en = lang === 'en';
  const L = (es, e) => (en ? e : es);
  const Qf = (n) => 'Q ' + Math.round(n).toLocaleString('en-US');
  const rng = (a, b) => Qf(a) + ' – ' + Qf(b);
  const rnd = (n) => (n < 1000 ? Math.round(n / 10) * 10 : Math.round(n / 50) * 50);
  const WORDS = { un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, doce: 12, quince: 15, veinte: 20, treinta: 30, media: 0.5, medio: 0.5, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, half: 0.5 };
  const numOf = (s) => { s = String(s); return /^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s) ? parseFloat(s.replace(/,/g, '')) : parseFloat(s.replace(',', '.')); };
  const toNum = (s) => { s = String(s).toLowerCase(); return WORDS[s] !== undefined ? WORDS[s] : numOf(s); };
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const nk = norm(d.need);
  const tk = norm(d.time);
  const has = (re) => re.test(nk);

  /* --- tiempo estimado --- */
  const mDur = tk.match(/(\d+(?:[.,]\d+)?|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|doce|quince|veinte|treinta|media|medio|one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|twenty|thirty|half)\s*(horas?|hrs?|hours?|dias?|days?|semanas?|weeks?|meses|mes|months?|anos?|years?)/);
  let hours = null, days = null, months = null, durTxt = '', years = null;
  if (mDur) {
    const n = toNum(mDur[1]);
    const u = mDur[2];
    if (/^(hora|hrs?|hour)/.test(u)) { hours = n; days = n / 8; months = n / 176; durTxt = n + L(n === 1 ? ' hora' : ' horas', n === 1 ? ' hour' : ' hours'); }
    else if (/^(dia|day)/.test(u)) { days = n; hours = n * 8; months = n / 22; durTxt = n + L(n === 1 ? ' día' : ' días', n === 1 ? ' day' : ' days'); }
    else if (/^(semana|week)/.test(u)) { days = n * 5; hours = days * 8; months = n / 4.3; durTxt = n + L(n === 1 ? ' semana' : ' semanas', n === 1 ? ' week' : ' weeks'); }
    else if (/^(mes|month)/.test(u)) { months = n; days = n * 22; hours = days * 8; durTxt = n + L(n === 1 ? ' mes' : ' meses', n === 1 ? ' month' : ' months'); }
    else { years = n; months = n * 12; days = months * 22; hours = days * 8; durTxt = n + L(n === 1 ? ' año' : ' años', n === 1 ? ' year' : ' years'); }
  }

  /* --- datos de la descripción --- */
  const g = (re) => { const m = nk.match(re); return m ? numOf(m[1]) : null; };
  const m3 = g(/(\d[\d.,]*)\s*(?:m3|m³|metros?\s*cubicos?|cubic\s*met)/);
  const m2 = g(/(\d[\d.,]*)\s*(?:m2|m²|mts?2|metros?\s*cuadrados?|sq\s*m)/);
  const depth = g(/(?:profundidad|espesor|depth)\s*(?:de|of)?\s*(\d[\d.,]*)\s*(?:m\b|mt|mts|metros?)/) || g(/(\d[\d.,]*)\s*(?:m\b|mt|mts|metros?)\s*de\s*(?:profundidad|espesor|depth)/);
  const trips = g(/(\d+)\s*(?:viajes?|trips?)/);
  const points = g(/(\d+)\s*(?:puntos?|tomacorrientes?|tomas?|lamparas?|luminarias?|interruptores?|breakers?|outlets?)/);
  const bedrooms = g(/(\d+)\s*(?:habitaci|dormitorio|cuarto|bedroom)/);
  const mAmt = nk.match(/(?:\bq|gtq)\s?(\d[\d.,]*)|(\d[\d.,]*)\s*(?:quetzales|gtq)/);
  const amt = mAmt ? numOf(mAmt[1] || mAmt[2]) : null;

  const lines = [];
  const assumed = [];
  let lo = 0, hi = 0;
  const add = (a, b) => { lo += a; hi += b; };
  const note = (es, e) => assumed.push(L(es, e));

  /* --- máquinas --- */
  const MACH = [
    [/retroexcavadora|backhoe/, 350, 550, L('Retroexcavadora', 'Backhoe loader')],
    [/excavadora|excavator/, 390, 650, L('Excavadora', 'Excavator')],
    [/motoniveladora|niveladora|grader/, 500, 850, L('Motoniveladora', 'Motor grader')],
    [/compactadora|rodillo|vibrocompactador|roller/, 300, 550, L('Compactadora / rodillo', 'Compactor / roller')],
    [/minicargador|bobcat|skid/, 300, 500, L('Minicargador', 'Skid steer')],
    [/grua|montacarga|crane|forklift/, 400, 800, L('Grúa / montacargas', 'Crane / forklift')]
  ];
  const mach = MACH.find((m) => m[0].test(nk));
  const mLo = mach ? mach[1] : 350, mHi = mach ? mach[2] : 650;
  const machineCost = (h) => [mLo * h + 800, mHi * h + 2500];
  const machineLines = (h, forced) => {
    lines.push([mach ? L('Equipo detectado', 'Detected equipment') : L('Tarifa referencial', 'Reference rate'), (mach ? mach[3] + ' · ' : '') + rng(mLo, mHi) + L(' por hora', ' per hour')]);
    lines.push([L('Horas consideradas', 'Hours considered'), h + ' h' + (forced ? L(' (mínimo)', ' (minimum)') : '')]);
    lines.push([L('Movilización de la máquina', 'Machine mobilization'), rng(800, 2500)]);
  };
  const avg = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

  switch (i) {
    case 0: {
      let h = hours;
      if (h == null && m3 != null) { h = Math.max(4, Math.ceil(m3 / 30)); note('Horas estimadas según el volumen (unos 30 m³ por hora).', 'Hours estimated from the volume (about 30 m³ per hour).'); }
      else if (h == null && m2 != null && has(/nivel/)) { h = Math.max(4, Math.ceil(m2 / 400)); note('Horas estimadas según el área (unos 400 m² por hora de nivelación).', 'Hours estimated from the area (about 400 m² per hour of leveling).'); }
      else if (h == null) { h = 8; note('Tiempo no indicado: se asumió 1 día de trabajo (8 horas).', 'Time not given: 1 working day (8 hours) assumed.'); }
      const hh = Math.max(h, 4);
      const c = machineCost(hh);
      add(c[0], c[1]);
      machineLines(hh, h < 4);
      break;
    }
    case 1: {
      const interior = has(/interior|departamento|fuera de|xela|quetzaltenango|coban|peten|escuintla|antigua|chimaltenango|huehue|km\b|kilometro/);
      const tLo = interior ? 800 : 300, tHi = interior ? 3000 : 900;
      let t = trips;
      let why = '';
      if (t == null && m3 != null) { t = Math.max(1, Math.ceil(m3 / 7)); why = L('según el volumen (camión de 7 m³)', 'from the volume (7 m³ truck)'); }
      if (t == null && days != null) { t = Math.max(1, Math.ceil(days * 4)); why = L('según el tiempo (unos 4 viajes por día)', 'from the time (about 4 trips per day)'); }
      if (t == null) { t = 4; note('Cantidad no indicada: se asumieron 4 viajes. Indica viajes o m³ (por ejemplo "20 m³").', 'Quantity not given: 4 trips assumed. Enter trips or m³ (e.g. "20 m³").'); }
      add(tLo * t, tHi * t);
      lines.push([interior ? L('Tarifa por viaje (interior del país)', 'Rate per trip (outside the city)') : L('Tarifa por viaje (área metropolitana)', 'Rate per trip (metro area)'), rng(tLo, tHi)]);
      lines.push([L('Viajes considerados', 'Trips considered'), t + (why ? ' · ' + why : '')]);
      if (has(/escombro|desalojo|demolicion/)) lines.push([L('Material', 'Material'), L('escombro: puede requerir permiso de descarga', 'debris: may require a dumping permit')]);
      break;
    }
    case 2: {
      let rl = 2500, rh = 9000, zoneTxt = '';
      const z = nk.match(/zona\s*(\d{1,2})/);
      if (z) {
        const n = +z[1];
        if ([10, 14, 15, 16].includes(n)) { rl = 6000; rh = 15000; }
        else if ([1, 4, 5, 11, 12, 13].includes(n)) { rl = 3000; rh = 7500; }
        else { rl = 2500; rh = 6500; }
        zoneTxt = L('Zona ', 'Zone ') + n;
      } else if (has(/cayala/)) { rl = 7000; rh = 15000; zoneTxt = 'Cayalá'; }
      else if (has(/mixco|villa nueva|carretera a el salvador|san jose pinula|santa catarina|fraijanes/)) { rl = 2500; rh = 7000; zoneTxt = L('Área metropolitana', 'Metro area'); }
      if (bedrooms != null) { const f = bedrooms <= 1 ? 0.8 : bedrooms === 2 ? 1 : bedrooms === 3 ? 1.4 : 1.9; rl *= f; rh *= f; }
      if (has(/amueblad|furnish/)) { rl *= 1.1; rh *= 1.1; }
      const mo = months != null ? Math.max(1, Math.round(months * 10) / 10) : 1;
      if (months == null) note('Tiempo no indicado: se asumió 1 mes de renta.', 'Time not given: 1 month of rent assumed.');
      add(rl * mo, rh * mo);
      lines.push([L('Renta mensual', 'Monthly rent') + (zoneTxt ? ' · ' + zoneTxt : '') + (bedrooms != null ? ' · ' + bedrooms + L(' hab.', ' bd.') : ''), rng(rl, rh)]);
      lines.push([L('Meses considerados', 'Months considered'), String(mo)]);
      lines.push([L('Depósito habitual', 'Usual deposit'), L('1 a 2 meses de renta', '1 to 2 months of rent')]);
      if (bedrooms == null && !zoneTxt) note('Indica la zona y las habitaciones (por ejemplo "zona 14, 2 habitaciones") para afinar la renta.', 'Enter the zone and bedrooms (e.g. "zone 14, 2 bedrooms") to refine the rent.');
      if (has(/edificio|building/)) note('Un edificio completo requiere cotización a la medida; el rango es por apartamento.', 'A whole building needs a custom quote; the range is per apartment.');
      break;
    }
    case 3: {
      const JOBS = [
        [/impermeabiliz|waterproof/, 40, 90, L('Impermeabilización (mano de obra)', 'Waterproofing (labor)')],
        [/pintur|pintar|paint/, 25, 60, L('Pintura (mano de obra)', 'Painting (labor)')],
        [/repello|plaster/, 60, 120, L('Repello', 'Plastering')],
        [/piso|ceramic|azulejo|tile/, 90, 200, L('Piso o azulejo (colocación)', 'Flooring or tile (installation)')]
      ];
      const job = m2 != null ? JOBS.find((j) => j[0].test(nk)) : null;
      const dd = days != null ? Math.max(1, days) : null;
      const byCrew = dd != null ? [450 * dd, 1200 * dd] : null;
      let byArea = null;
      if (job) { byArea = [job[1] * m2, job[2] * m2]; lines.push([job[3], rng(job[1], job[2]) + L(' por m²', ' per m²')]); lines.push([L('Área considerada', 'Area considered'), m2 + ' m²']); }
      if (byArea && byCrew) { const c = avg(byArea, byCrew); add(c[0], c[1]); lines.push([L('Cuadrilla por tiempo', 'Crew by time'), rng(byCrew[0], byCrew[1]) + ' · ' + durTxt]); }
      else if (byArea) add(byArea[0], byArea[1]);
      else {
        const d2 = dd != null ? dd : 1;
        if (dd == null) note('Tiempo no indicado: se asumió 1 día de trabajo.', 'Time not given: 1 working day assumed.');
        add(450 * d2, 1200 * d2);
        lines.push([L('Cuadrilla por día (maestro + ayudantes)', 'Crew per day (foreman + helpers)'), rng(450, 1200)]);
        lines.push([L('Días considerados', 'Days considered'), String(Math.round(d2 * 10) / 10)]);
        if (m2 != null || !job) note('Indica el trabajo y los m² (por ejemplo "pintar 120 m²") para estimar por área.', 'Enter the job and the m² (e.g. "paint 120 m²") to estimate by area.');
      }
      lines.push([L('Materiales', 'Materials'), L('aparte (10%–30% de margen si los compra el contratista)', 'not included (10%–30% markup if the contractor buys them)')]);
      break;
    }
    case 4: {
      const pts = points != null ? points : 1;
      const JOBS = [
        [/tablero|panel|breaker principal/, 1500, 4000, L('Tablero eléctrico', 'Electrical panel'), 1],
        [/cableado completo|instalacion electrica completa|rewir/, m2 != null ? 150 * m2 : 15000, m2 != null ? 270 * m2 : 40000, L('Cableado completo', 'Full rewiring'), 1],
        [/tomacorriente|toma\b|outlet|interruptor|switch|lampara|luminaria|punto/, 100, 300, L('Puntos eléctricos', 'Electrical points'), pts],
        [/ventilador|fan/, 200, 600, L('Ventilador de techo', 'Ceiling fan'), 1],
        [/fuga.*pared|pared.*fuga|leak.*wall/, 1000, 3000, L('Fuga en pared (rompe y repara)', 'Wall leak (break and repair)'), 1],
        [/fuga|gotea|leak/, 200, 600, L('Reparación de fuga sencilla', 'Simple leak repair'), 1],
        [/drenaje principal|maquina|colector/, 400, 1200, L('Destape de drenaje con máquina', 'Drain cleaning with machine'), 1],
        [/destap|obstru|clog|drain/, 150, 400, L('Destape', 'Drain unclogging'), 1],
        [/tinaco|tanque|cisterna|tank/, 800, 2500, L('Instalación de tinaco / tanque', 'Water tank installation'), 1],
        [/calentador|heater/, 400, 1000, L('Instalación de calentador', 'Water heater installation'), 1]
      ];
      const seen = new Set();
      let hit = 0;
      JOBS.forEach((j) => {
        if (!j[0].test(nk)) return;
        if (j[3] === JOBS[4][3] && seen.has('fuga')) return;
        if (/fuga|leak/i.test(j[3])) { if (seen.has('fuga')) return; seen.add('fuga'); }
        hit++;
        const q = j[4];
        add(j[1] * q, j[2] * q);
        lines.push([j[3] + (q > 1 ? ' × ' + q : ''), rng(j[1] * q, j[2] * q)]);
      });
      if (!hit) {
        const dd = days != null ? Math.max(0.5, days) : 1;
        if (days == null) note('Tiempo no indicado: se asumió 1 día de trabajo.', 'Time not given: 1 working day assumed.');
        add(Math.max(150, 300 * dd), 800 * dd);
        lines.push([L('Mano de obra por día', 'Labor per day'), rng(300, 800)]);
        lines.push([L('Días considerados', 'Days considered'), String(Math.round(dd * 10) / 10)]);
        lines.push([L('Visita de diagnóstico', 'Diagnostic visit'), rng(100, 300)]);
        note('Describe el trabajo (por ejemplo "fuga en pared" o "tablero eléctrico") para estimar por servicio.', 'Describe the job (e.g. "wall leak" or "electrical panel") to estimate per service.');
      } else if (durTxt) {
        lines.push([L('Tiempo indicado', 'Time entered'), durTxt + L(' (los trabajos por servicio no dependen del tiempo)', ' (per-service jobs do not depend on time)')]);
      }
      lines.push([L('Visita de diagnóstico', 'Diagnostic visit'), rng(100, 300) + L(' (suele descontarse al contratar)', ' (usually deducted when hired)')]);
      break;
    }
    case 5: {
      const JOBS = [
        [/divorcio.*mutuo|mutuo.*divorcio|divorce.*mutual/, 3500, 10000, L('Divorcio por mutuo acuerdo', 'Uncontested divorce')],
        [/divorcio.*contencios|contencios.*divorcio|contested/, 15000, 50000, L('Divorcio contencioso', 'Contested divorce')],
        [/divorcio|divorce/, 3500, 15000, L('Divorcio (mutuo Q 3,500–10,000 · contencioso Q 15,000–50,000)', 'Divorce (uncontested Q 3,500–10,000 · contested Q 15,000–50,000)')],
        [/constitucion|sociedad|srl|s\.a\b|empresa nueva|company/, 3500, 15000, L('Constitución de sociedad', 'Company formation')],
        [/laboral|despido|labor claim/, 3000, 15000, L('Demanda laboral (más cuota litis 30%–40% si se gana)', 'Labor claim (plus 30%–40% contingency fee if won)')],
        [/penal|criminal/, 5000, 15000, L('Caso penal sencillo', 'Simple criminal case')],
        [/contrato|arrendamiento|dictamen|opinion|contract|lease/, 800, 3000, L('Contrato o dictamen escrito', 'Contract or written opinion')]
      ];
      let hit = 0;
      JOBS.forEach((j) => { if (j[0].test(nk) && !(hit && /^divorcio \(|divorce \(/i.test(j[3]))) { hit++; add(j[1], j[2]); lines.push([j[3], rng(j[1], j[2])]); } });
      if (has(/compraventa|escritura|traspaso|inmueble|purchase|deed/)) {
        hit++;
        if (amt != null) { add(amt * 0.01, amt * 0.025); lines.push([L('Compraventa de inmueble (1% – 2.5% del valor)', 'Property purchase (1% – 2.5% of value)'), rng(amt * 0.01, amt * 0.025)]); lines.push([L('Valor indicado', 'Value entered'), Qf(amt)]); }
        else { add(3000, 15000); lines.push([L('Compraventa de inmueble (1% – 2.5% del valor)', 'Property purchase (1% – 2.5% of value)'), rng(3000, 15000)]); note('Indica el valor del inmueble (por ejemplo "Q 500,000") para afinar los honorarios.', 'Enter the property value (e.g. "Q 500,000") to refine the fees.'); }
      }
      if (!hit) {
        const h = hours != null ? Math.max(1, hours) : 2;
        if (hours == null) note('Tiempo no indicado: se asumieron 2 horas de asesoría.', 'Time not given: 2 hours of advice assumed.');
        add(400 * h, 1000 * h);
        lines.push([L('Honorarios por hora de asesoría', 'Fees per hour of advice'), rng(400, 1000)]);
        lines.push([L('Horas consideradas', 'Hours considered'), String(Math.round(h * 10) / 10)]);
        lines.push([L('Referencias', 'References'), L('consulta inicial Q 200–1,000 · dictamen escrito Q 800–3,000', 'initial consultation Q 200–1,000 · written opinion Q 800–3,000')]);
        note('Describe el asunto (por ejemplo "divorcio", "contrato de arrendamiento" o "compraventa") para estimar por trámite.', 'Describe the matter (e.g. "divorce", "lease contract" or "purchase") to estimate per procedure.');
      } else if (durTxt) lines.push([L('Tiempo indicado', 'Time entered'), durTxt]);
      break;
    }
    case 6: {
      add(0, 500);
      lines.push([L('Orientación y acompañamiento', 'Guidance and support'), rng(0, 500)]);
      lines.push([L('Tasa hipotecaria de referencia', 'Reference mortgage rate'), L('≈ 7% – 9% anual (varía por programa y banco)', '≈ 7% – 9% per year (varies by program and bank)')]);
      if (has(/primera casa|fha|vivienda social/)) lines.push([L('Programa', 'Program'), L('Mi Primera Casa / FHA (tasa preferencial)', 'Mi Primera Casa / FHA (preferential rate)')]);
      if (amt != null) {
        add(amt * 0.02, amt * 0.05);
        lines.push([L('Monto del crédito', 'Loan amount'), Qf(amt)]);
        lines.push([L('Gastos de gestión (seguro FHA, avalúo, escrituración)', 'Processing costs (FHA insurance, appraisal, deed)'), L('2% – 5% del monto', '2% – 5% of the amount')]);
        const yrs = years != null ? years : (months != null && months >= 60 ? months / 12 : null);
        if (yrs) {
          const pm = (r) => { const m = r / 12, n = Math.round(yrs * 12); return (amt * m) / (1 - Math.pow(1 + m, -n)); };
          lines.push([L('Cuota mensual aproximada (' + yrs + ' años, 7%–9%)', 'Approx. monthly payment (' + yrs + ' years, 7%–9%)'), rng(pm(0.07), pm(0.09))]);
        } else note('Indica el plazo (por ejemplo "20 años") para calcular la cuota mensual aproximada.', 'Enter the term (e.g. "20 years") to calculate the approximate monthly payment.');
      } else note('Indica el monto del crédito (por ejemplo "Q 400,000") para estimar los gastos y la cuota.', 'Enter the loan amount (e.g. "Q 400,000") to estimate costs and payment.');
      break;
    }
    default: {
      let byVol = null, byTime = null;
      let vol = m3;
      if (vol == null && m2 != null && !has(/nivel/)) { vol = m2 * (depth != null ? depth : 0.3); note('Volumen calculado con el área' + (depth != null ? ' y la profundidad indicadas' : ' y una profundidad de 0.30 m') + '.', 'Volume calculated from the area' + (depth != null ? ' and depth entered' : ' and a depth of 0.30 m') + '.'); }
      else if (vol == null && m2 != null && depth != null) vol = m2 * depth;
      const rock = has(/roca|piedra|rock/);
      const vLo = rock ? 200 : 90, vHi = rock ? 450 : 250;
      if (vol != null) {
        byVol = [vLo * vol + 800, vHi * vol + 2500];
        lines.push([rock ? L('Excavación en roca por m³', 'Rock excavation per m³') : L('Excavación, carga y relleno por m³', 'Excavation, loading and fill per m³'), rng(vLo, vHi)]);
        lines.push([L('Volumen considerado', 'Volume considered'), Math.round(vol * 10) / 10 + ' m³']);
      } else if (m2 != null && has(/nivel/)) {
        byVol = [15 * m2 + 800, 45 * m2 + 2500];
        lines.push([L('Nivelación de terreno por m²', 'Land leveling per m²'), rng(15, 45)]);
        lines.push([L('Área considerada', 'Area considered'), m2 + ' m²']);
      }
      if (hours != null) {
        const hh = Math.max(hours, 4);
        byTime = machineCost(hh);
        lines.push([mach ? mach[3] : L('Máquina por tiempo', 'Machine by time'), rng(mLo, mHi) + L(' por hora', ' per hour') + ' · ' + hh + ' h']);
      }
      if (byVol && byTime) { add(Math.max(byVol[0], byTime[0]), Math.max(byVol[1], byTime[1])); lines.push([L('Movilización de la máquina', 'Machine mobilization'), rng(800, 2500)]); }
      else if (byVol) { add(byVol[0], byVol[1]); lines.push([L('Movilización de la máquina', 'Machine mobilization'), rng(800, 2500)]); }
      else if (byTime) { add(byTime[0], byTime[1]); lines.push([L('Movilización de la máquina', 'Machine mobilization'), rng(800, 2500)]); note('Indica los m³ o los m² (por ejemplo "200 m³" o "500 m² de nivelación") para estimar por volumen.', 'Enter the m³ or m² (e.g. "200 m³" or "500 m² leveling") to estimate by volume.'); }
      else { const c = machineCost(8); add(c[0], c[1]); machineLines(8, false); note('Indica los m³ o el tiempo para afinar el cálculo. Se asumió 1 día de máquina.', 'Enter the m³ or time to refine the estimate. 1 machine day assumed.'); }
    }
  }
  const f = { alta: [1.1, 1.25], baja: [0.95, 1] }[d.prio] || [1, 1];
  lo *= f[0]; hi *= f[1];
  if (d.prio === 'alta') lines.push([L('Recargo por urgencia (prioridad alta)', 'Urgency surcharge (high priority)'), '+10% – +25%']);
  else if (d.prio === 'baja') lines.push([L('Programación flexible (prioridad baja)', 'Flexible scheduling (low priority)'), L('hasta −5%', 'up to −5%')]);
  else if (!d.prio) note('Prioridad no indicada: se asumió media.', 'Priority not given: medium assumed.');
  lo = rnd(lo); hi = rnd(hi);
  if (hi < lo) hi = lo;
  return {
    range: rng(lo, hi),
    lines: lines.map(([k, v]) => ({ k, v })),
    assumed: assumed.join(' '),
    notes: L('Estimación referencial con precios de mercado en Guatemala (2026), en quetzales y sin IVA (12%). No incluye materiales, combustible extra ni permisos. El monto final se confirma con una visita técnica.',
             'Reference estimate using Guatemala market prices (2026), in quetzals and before VAT (12%). It does not include materials, extra fuel or permits. The final amount is confirmed after a site visit.')
  };
}

const T = {
  es: {
    menu: 'Menú', nInicio: 'Inicio', nNosotros: 'Nosotros', nPropiedades: 'Propiedades', nServicios: 'Servicios', nProyectos: 'Proyectos', nContacto: 'Contacto',
    client: 'Área de Clientes', close: 'Cerrar',
    heroAlt: 'Desarrollo residencial con vista a volcanes y lago en Guatemala',
    tag: 'Inversiones * desarrollo * administración * servicios * lealtad', lede: 'Soluciones inmobiliarias seguras, modernas, personalizadas y ajustadas a tus necesidades para proteger tu inversión, así como hacer crecer tu patrimonio.', heroL1: 'Tu patrimonio', heroL2: 'en las mejores manos', btnProps: 'Ver propiedades', btnServ: 'Nuestros servicios',
    t1: 'Seguridad', t1s: 'en cada proceso', t2: 'Rentabilidad', t2s: 'orientada a resultados',
    t3: 'Confianza', t3s: 'atención personalizada', t4: 'Cobertura', t4s: 'en Guatemala',
    aboutT1: "En ARMOPA transformamos la búsqueda de propiedades en una experiencia estratégica y personalizada. Somos una firma de consultoría inmobiliaria y de Servicios Profesionales Integrados dedicada a conectar a nuestros clientes con espacios excepcionales que elevan su estilo de vida y aseguran su patrimonio. Nuestro compromiso se fundamenta en la Lealtad, transparencia, integridad usando la innovación de mercado y una profunda experiencia sectorial, garantizando decisiones de inversión sólidas, transparentes y de alto valor a largo plazo.", aboutT2: "Te orientamos para encontrar el espacio ideal, de forma inteligente, el punto donde la tecnología inmobiliaria y el trato humano se encuentran. Nos especializamos en simplificar el proceso de compra, venta y alquiler de propiedades mediante un ecosistema digital avanzado y un equipo de expertos siempre a tu disposición. Nos apasiona optimizar tu tiempo y maximizar tus oportunidades de inversión, ofreciendo un servicio ágil, transparente y diseñado a la medida de las demandas del mercado actual.", aboutT3: "Entendemos que una propiedad es mucho más que cuatro paredes: es el escenario de tus próximos grandes recuerdos y el pilar de tu estabilidad familiar. Con años de trayectoria en el sector, nos enorgullece ser los aliados de confianza de cientos de familias en la búsqueda de su hogar ideal. Nos distingue un servicio de asesoría honesto, empático y profesional, diseñado para acompañarte con absoluta seguridad en cada paso del camino.", quoteH: "Solicitar cotización", quoteSub: "Completa tus datos y elige cómo enviarlos: por WhatsApp o por correo. Se abrirá con la información lista para enviarnos.", qName: "Nombre del contacto / cliente", qNamePh: "Nombre completo", qPhone: "Teléfono de contacto", qPhonePh: "+502 0000 0000", qAddr: "Dirección del servicio", qAddrPh: "Zona, colonia, calle o referencia", qDate: "Fecha estimada del servicio", qBtn: "Solicitar cotización", qErr: "Completa todos los campos para solicitar la cotización.", qMsgH: "Hola, deseo solicitar una cotización.", qMsgName: "Nombre: ", qMsgPhone: "Teléfono: ", qMsgAddr: "Dirección del servicio: ", qMsgDate: "Fecha estimada del servicio: ", xNeed: "Describe tu necesidad", xNeedPh: "Cuéntanos qué necesitas: medidas, materiales, urgencia u otros detalles…", xTime: "Tiempo estimado", xTimePh: "Ej. 2 semanas, 1 mes o una fecha aproximada", xImgs: "Subir y visualizar imágenes", xHint: "Puedes seleccionar varias imágenes (JPG o PNG). Se guardan en este navegador; adjúntalas en WhatsApp al enviar la cotización.", qMsgSvc: "Servicios solicitados:", qMsgTime: "Tiempo estimado: ", qMsgImgs: "Imágenes: {n} (las adjunto en este chat)", qEmail: "Correo electrónico", qEmailPh: "nombre@correo.com", qMsgEmail: "Correo: ", qBtnMail: "Enviar por correo", qErrEmail: "Escribe un correo electrónico válido.", qMailSubj: "Solicitud de cotización", xStart: "Fecha estimada de inicio", qMsgStart: "Fecha estimada de inicio: ", xPrio: "Prioridad", xPrioAlta: "Alta", xPrioMedia: "Media", xPrioBaja: "Baja", qMsgPrio: "Prioridad: ", xEstBtn: "Calcular Presupuesto Estimado", xEstHide: "Ocultar presupuesto", xEstTitle: "Presupuesto estimado (referencial, Guatemala)", qMsgEst: "Presupuesto estimado: ", ctImgAlt: "ARMOPA: compra y venta de propiedades en todo el país. Nosotros somos la solución.", aiAlt: "Inteligencia artificial y tecnología inmobiliaria", homeAlt: "Hogar ideal: una casa en manos protectoras", xEstStale: "Calculado con la descripción de la necesidad y el tiempo estimado que ingresaste. Si cambias algo, presiona \"Calcular Presupuesto Estimado\" otra vez.", mkBtn: "Costos alrededor", mkTitle: "Valores de propiedades similares en la zona (referencial)", mkHide: "Ocultar", mkSimilar: "Propiedades similares (referencia)", mkAround: "Zonas alrededor (referencia)", mkUse: "Usar estos valores en los campos de valor", salonAlt: "Rentamos o vendemos: una mano sostiene casas con símbolos de dólar", budgetAlt: "Presupuesto e inversión inmobiliaria: monedas apiladas y una casa", buyAlt: "Compra de propiedad: unas llaves y una casa en las manos", remodelAlt: "Hogar inteligente: tecnología y remodelación de una propiedad", landAlt: "Construcción en tu terreno: un hombre frente a un campo con el plano de su futura casa dibujado", projAlt: "Desarrollo de tu proyecto: vista aérea de un desarrollo urbano con plaza, edificios y áreas verdes", aboutH1: 'Administración inmobiliaria con visión profesional e inteligente,', aboutH2: 'Segura, Transparente, Íntegra, Responsable, Leal a la Vanguardia con Honradez', aboutH3: 'haciendo que tu inversión crezca a niveles inimaginables.',
    invH: 'Tu Inversión:', invSub: 'Inversión Garantizada:', invItems: ['Compra y venta', 'Alquileres Diversos', 'Integramos administración', 'Remodelación', 'Construcción / Remodelación', 'Desarrollo de proyectos con gestión practica de rentabilidad'], aboutP: 'Integramos administración, compra y venta, alquileres, remodelación, construcción y desarrollo de proyectos para ofrecer una gestión práctica y ordenada de cada propiedad.',
    svH: 'Tus Servicios:', svA: 'Servicios Profesionales coordinados', svItems: ['Alquiler de maquinaria pesada', 'Renta de Camiones para extracción', 'Renta de apartamentos y Edificio', 'Mantenimiento de Edificios', 'Plomería y electricidad', 'Asesoría Jurídica', 'Prestamos con CHN', 'Movimiento de Tierra'],
    propH: 'Propiedades exclusivas en Guatemala', catalog: 'Buscar Propiedades', prev: 'Propiedad anterior', next: 'Siguiente propiedad',
    places: ['Ciudad de Guatemala', 'Lago de Atitlán', 'Antigua Guatemala', 'Petén', 'Zona 10'],
    alts: ['Propiedad de lujo en Ciudad de Guatemala', 'Propiedad de lujo en Lago de Atitlán', 'Propiedad de lujo en Antigua Guatemala', 'Propiedad de lujo en Petén', 'Propiedad premium en Zona 10'],
    goTo: 'Ir a la posición ',
    openProp: 'Ver ubicaciones de ', noLocs: 'Sin ubicaciones todavía', oneLoc: '1 ubicación', locsWord: 'ubicaciones',
    addLoc: 'Agregar ubicación', locDefault: 'Ubicación', emptyH: 'Aún no hay ubicaciones', emptyP: 'Agrega la primera para subir sus imágenes y su dirección.',
    nameL: 'Nombre de la ubicación', zoom: 'Ver foto del vendedor en tamaño original', zoomToggle: 'Alternar entre ajustar a la pantalla y tamaño real', opL: 'Tipo de operación', opRent: 'Renta', opSale: 'Venta', opBoth: 'Renta o venta', rentL: 'Valor de renta', saleL: 'Valor de la propiedad (venta)', rentPh: 'Ej. Q 4,500 al mes', salePh: 'Ej. Q 850,000', opHint: 'Elige el tipo de operación para indicar los valores.', viewOpRent: 'En renta', viewOpSale: 'En venta', viewOpBoth: 'En renta o venta', rentView: 'Renta', saleView: 'Precio de venta', sellerH: 'Vendedor', sellerUp: 'Subir foto del vendedor', sellerRm: 'Quitar foto', sellerName: 'Nombre del vendedor', sellerWa: 'WhatsApp del vendedor', waHint: 'Incluye el código de país, por ejemplo +502. Si escribes 8 dígitos se agrega el 502 automáticamente.', sellerLabel: 'Contacto del vendedor', waBtn: 'Contactar por WhatsApp', waMsg: 'Hola, me interesa la propiedad: ', descL: 'Descripción de la propiedad', descPh: 'Características, habitaciones, amenidades, precio y cualquier detalle importante…', descH: 'Descripción', addrL: 'Dirección o enlace de Google Maps', photo: 'Imagen ', photosH: 'Imágenes de la ubicación', upload: 'Subir imágenes',
    uploadHint: 'Puedes seleccionar varias imágenes (JPG o PNG).', remove: 'Quitar imagen', uploaded: 'Imágenes agregadas.', saved: 'Cambios guardados.',
    del: 'Eliminar ubicación', delSure: '¿Confirmar eliminación?', view: 'Ver fotografías', edit: 'Volver a editar', mapOpen: 'Ver en Google Maps',
    prevImg: 'Imagen anterior', nextImg: 'Imagen siguiente', noImgs: 'Esta ubicación aún no tiene imágenes.',
    storeNote: 'Los cambios se guardan automáticamente en este navegador. Para mostrarlos a todos los visitantes, la página debe conectarse a un servidor o base de datos.',
    storeErr: 'No se pudo guardar: el navegador no tiene espacio. Quita algunas imágenes e inténtalo de nuevo.',
    servH1: 'Todo lo que necesitas para tu propiedad', servH2: 'ajustada a tu presupuesto y necesidades',
    s1: 'Rentamos o vendemos', s1d: 'Bienes inmuebles en todo el país con desarrollo inmobiliario.',
    s2: 'Adaptamos tu presupuesto', s2d: 'Diseñamos alternativas de acuerdo con tus necesidades y objetivos.',
    s3: 'Compramos tu propiedad', s3d: 'Evaluación y acompañamiento durante el proceso de compra.',
    s4: 'Remodelamos tu propiedad', s4d: 'Planificación, coordinación y supervisión de remodelaciones.',
    s5: 'Construimos en tu terreno', s5d: 'Desde el diseño y presupuesto hasta la ejecución.',
    s6: 'Desarrollamos tu proyecto', s6d: 'Evaluación, planificación, construcción y supervisión integral.',
    extH: 'Especialistas para cada necesidad', extSub: 'Servicios externos coordinados por ARMOPA.',
    ext: ['Alquiler de maquinaria pesada', 'Renta de camiones para extracción', 'Renta de apartamentos y edificios', 'Mantenimiento de edificios', 'Plomería y electricidad', 'Asesoría jurídica', 'Orientación para préstamos con CHN', 'Movimiento de tierra'],
    ctaH: '¿Tienes una propiedad o un proyecto?', ctaP: 'Conversemos sobre la mejor forma de administrarlo, desarrollarlo o hacerlo crecer.', ctaBtn: 'Contáctanos',
    ctH: 'Hablemos de tu próximo proyecto', ctP: 'Atención personalizada para propietarios, compradores, inversionistas e inquilinos o clientes especiales. Contáctanos y te responderemos lo antes posible.',
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
    aboutT1: "At ARMOPA we turn the search for properties into a strategic, personalized experience. We are a real estate consulting firm and an Integrated Professional Services firm dedicated to connecting our clients with exceptional spaces that elevate their lifestyle and secure their wealth. Our commitment is grounded in Loyalty, transparency and integrity, using market innovation and deep industry expertise, ensuring sound, transparent, high long-term value investment decisions.", aboutT2: "We guide you to find the ideal space, intelligently: the point where real estate technology and the human touch meet. We specialize in simplifying the process of buying, selling and renting properties through an advanced digital ecosystem and a team of experts always at your disposal. We are passionate about optimizing your time and maximizing your investment opportunities, offering an agile, transparent service tailored to the demands of today's market.", aboutT3: "We understand that a property is much more than four walls: it is the stage for your next great memories and the pillar of your family's stability. With years of experience in the sector, we are proud to be the trusted allies of hundreds of families in their search for the ideal home. We stand out for honest, empathetic and professional advice, designed to accompany you with absolute security every step of the way.", quoteH: "Request a quote", quoteSub: "Fill in your details and choose how to send them: by WhatsApp or by email. It will open with your information ready to send to us.", qName: "Contact / client name", qNamePh: "Full name", qPhone: "Contact phone", qPhonePh: "+502 0000 0000", qAddr: "Service address", qAddrPh: "Zone, neighborhood, street or landmark", qDate: "Estimated service date", qBtn: "Request a quote", qErr: "Please complete all fields to request the quote.", qMsgH: "Hello, I would like to request a quote.", qMsgName: "Name: ", qMsgPhone: "Phone: ", qMsgAddr: "Service address: ", qMsgDate: "Estimated service date: ", xNeed: "Describe your need", xNeedPh: "Tell us what you need: measurements, materials, urgency or other details…", xTime: "Estimated time", xTimePh: "E.g. 2 weeks, 1 month or an approximate date", xImgs: "Upload and view images", xHint: "You can select several images (JPG or PNG). They are saved in this browser; attach them in WhatsApp when you send the quote.", qMsgSvc: "Requested services:", qMsgTime: "Estimated time: ", qMsgImgs: "Images: {n} (I will attach them in this chat)", qEmail: "Email address", qEmailPh: "name@email.com", qMsgEmail: "Email: ", qBtnMail: "Send by email", qErrEmail: "Please enter a valid email address.", qMailSubj: "Quote request", xStart: "Estimated start date", qMsgStart: "Estimated start date: ", xPrio: "Priority", xPrioAlta: "High", xPrioMedia: "Medium", xPrioBaja: "Low", qMsgPrio: "Priority: ", xEstBtn: "Calculate Estimated Budget", xEstHide: "Hide estimate", xEstTitle: "Estimated budget (reference, Guatemala)", qMsgEst: "Estimated budget: ", ctImgAlt: "ARMOPA: buying and selling properties nationwide. We are the solution.", aiAlt: "Artificial intelligence and real estate technology", homeAlt: "Ideal home: a house in protective hands", xEstStale: "Calculated from the need description and estimated time you entered. If you change anything, press \"Calculate Estimated Budget\" again.", mkBtn: "Nearby costs", mkTitle: "Values of similar properties in the area (reference)", mkHide: "Hide", mkSimilar: "Similar properties (reference)", mkAround: "Nearby areas (reference)", mkUse: "Use these values in the value fields", salonAlt: "We rent or sell: a hand holding houses with dollar symbols", budgetAlt: "Budget and real estate investment: stacked coins and a house", buyAlt: "Property purchase: keys and a house in hand", remodelAlt: "Smart home: technology and property remodeling", landAlt: "Building on your land: a man in a field looking at the outline of his future house", projAlt: "Your project development: aerial view of an urban development with a plaza, buildings and green areas", aboutH1: 'Real estate management with a professional and intelligent vision,', aboutH2: 'Secure, Transparent, Upright, Responsible, Loyal, at the Forefront with Honesty', aboutH3: 'making your investment grow to unimaginable levels.',
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
    servH1: 'Everything you need for your property,', servH2: 'tailored to your budget and needs',
    s1: 'We rent or sell', s1d: 'Real estate nationwide with property development.',
    s2: 'We adapt to your budget', s2d: 'We design alternatives according to your needs and goals.',
    s3: 'We buy your property', s3d: 'Evaluation and support throughout the purchase process.',
    s4: 'We remodel your property', s4d: 'Planning, coordination and supervision of remodeling.',
    s5: 'We build on your land', s5d: 'From design and budgeting to execution.',
    s6: 'We develop your project', s6d: 'Evaluation, planning, construction and comprehensive supervision.',
    extH: 'Specialists for every need', extSub: 'External services coordinated by ARMOPA.',
    ext: ['Heavy machinery rental', 'Dump truck rental for hauling', 'Apartment and building rentals', 'Building maintenance', 'Plumbing and electrical', 'Legal advisory', 'Guidance for CHN loans', 'Earthmoving'],
    ctaH: 'Do you have a property or project?', ctaP: "Let's discuss the best way to manage, develop or grow it.", ctaBtn: 'Contact us',
    ctH: "Let's talk about your next project", ctP: 'Personalized service for owners, buyers, investors and tenants or special clients. Contact us and we will reply as soon as possible.',
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
  $$('[data-i18n-alt]').forEach((el) => el.setAttribute('alt', t[el.dataset.i18nAlt]));
  $$('[data-i18n-ph]').forEach((el) => el.setAttribute('placeholder', t[el.dataset.i18nPh]));
  $$('[data-ext]').forEach((el) => { el.textContent = t.ext[+el.dataset.ext]; });
  $$('[data-sv]').forEach((el) => { el.textContent = t.svItems[+el.dataset.sv]; });
  $$('[data-inv]').forEach((el) => { el.textContent = t.invItems[+el.dataset.inv]; });
  $$('.lg').forEach((b) => b.classList.toggle('on', b.dataset.lang === l));
  try { localStorage.setItem('armopaLang', l); } catch (e) {}
  buildDots();
  if (typeof xo !== 'undefined' && xo >= 0) xRender(xo);
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
let total = 0;
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
let cityCovers = {};
function openCity(name) {
  cur = name; panelView = 'locs'; mode = 'edit'; confirmDel = false; mk = null;
  sel = (data[name] || []).length ? 0 : -1; vi = 0; showThumbs = false;
  note('');
  render();
  pModal.hidden = false;
}
function openLocationDirect(name, locIndex) {
  cur = name; panelView = 'locs'; mode = 'edit'; confirmDel = false; mk = null;
  sel = locIndex; vi = 0; showThumbs = false;
  note('');
  render();
  pModal.hidden = false;
}
function buildCityCards() {
  const track = $('#carTrack');
  track.innerHTML = '';
  const names = cityNames();
  names.forEach((name) => {
    const article = el('article', 'pc');
    const btn = el('button', 'pc-img');
    btn.type = 'button';
    btn.setAttribute('aria-label', name);
    const img = el('img');
    img.src = cityCovers[name] || 'assets/propiedad-1.jpg';
    img.alt = name;
    btn.appendChild(img);
    btn.addEventListener('click', () => openCity(name));
    const pn = el('div', 'pn');
    pn.append(el('span', '', name));
    article.append(btn, pn);
    track.appendChild(article);
  });
  total = names.length;
  idx = Math.min(idx, maxIdx());
  buildDots();
  update();
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
$('#sendBtn').addEventListener('click', async () => {
  const nombre = $('#f-nombre')?.value.trim();
  const correo = $('#f-correo')?.value.trim();
  const telefono = $('#f-tel')?.value.trim();
  const motivo = $('#f-motivo')?.value.trim();
  const mensaje = $('#f-msg')?.value.trim();

  if (!nombre || !mensaje) {
    alert('Por favor escribe tu nombre y cuéntanos qué necesitas.');
    return;
  }

  const { error } = await supabaseClient
    .from('contactos')
    .insert({
      nombre,
      telefono: telefono || null,
      correo: correo || null,
      mensaje: motivo ? `[${motivo}] ${mensaje}` : mensaje
    });

  if (error) {
    console.error('Error al guardar contacto:', error);
    alert('No pudimos enviar tu solicitud. Intenta de nuevo.');
    return;
  }

  $('#sentNote').hidden = false;
});

/* Propiedades: ubicaciones, imágenes y vista (se guardan en este navegador) */
/* Costos alrededor: valores de referencia de renta y venta de propiedades similares en Guatemala (2026). Son precios pedidos publicados en portales inmobiliarios, no precios de cierre. */
const MK_FX = 7.7;
const MKZ = {
  1: ['Zona 1', [300, 550], [1200, 1900], 'media'],
  4: ['Zona 4', [500, 800], [1800, 2600], 'media'],
  5: ['Zona 5', [400, 800], [1300, 2000], 'baja'],
  9: ['Zona 9', [700, 1300], [1800, 2600], 'baja'],
  10: ['Zona 10', [750, 1500], [2200, 3000], 'alta'],
  11: ['Zona 11', [500, 900], [1300, 2000], 'baja'],
  13: ['Zona 13', [700, 1300], [1700, 2500], 'baja'],
  14: ['Zona 14', [900, 1700], [2300, 3200], 'alta'],
  15: ['Zona 15', [900, 1600], [2100, 3000], 'media'],
  16: ['Zona 16 / Cayalá', [1100, 1800], [2200, 3100], 'media'],
  21: ['Zona 21', [400, 800], [1300, 2000], 'baja']
};
const MKADJ = { 1: [4, 5], 4: [1, 9, 10], 5: [1, 4, 11], 9: [4, 10, 13], 10: [14, 9, 15, 4], 11: [5, 13], 13: [9, 10, 14], 14: [10, 15, 16, 13], 15: [10, 14, 16], 16: [14, 15], 21: [13, 5] };
const MKR = [
  [/antigua|sacatepequez|ciudad vieja|jocotenango|san pedro las huertas/, ['Antigua Guatemala', [700, 1500], [1700, 2300], 'media']],
  [/atitlan|panajachel|santiago atitlan|san pedro la laguna|san marcos|santa catarina palopo|solola/, ['Lago de Atitlán', [350, 1000], [1100, 2200], 'baja']],
  [/peten|flores|el remate|santa elena|tikal/, ['Petén / Flores', [250, 700], [700, 1400], 'baja']],
  [/mixco|villa nueva|santa catarina pinula|carretera a el salvador|san jose pinula|fraijanes|san cristobal|villa canales|muxbal/, ['Área metropolitana', [500, 1300], [1200, 2000], 'media']]
];
const MKD = ['Ciudad de Guatemala (referencia general)', [850, 1600], [1500, 2700], 'baja'];
const MKREG = [null, MKR[1][1], MKR[0][1], MKR[2][1], null];

function marketEstimate(reg, inp, lang) {
  const en = lang === 'en';
  const L = (es, e) => (en ? e : es);
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const nk = norm([inp.name, inp.addr, inp.desc].join(' '));
  const op = inp.op || '';
  const wantRent = op === 'renta' || op === 'ambos' || !op;
  const wantSale = op === 'venta' || op === 'ambos' || !op;
  const Qf = (n) => 'Q ' + Math.round(n).toLocaleString('en-US');
  const Uf = (n) => 'US$ ' + Math.round(n).toLocaleString('en-US');
  const rnd = (n) => (n < 10000 ? Math.round(n / 50) * 50 : n < 1000000 ? Math.round(n / 500) * 500 : Math.round(n / 5000) * 5000);
  const rq = (a, b) => Qf(rnd(a * MK_FX)) + ' – ' + Qf(rnd(b * MK_FX));
  const ru = (a, b) => Uf(rnd(a)) + ' – ' + Uf(rnd(b));

  /* --- zona o región de referencia --- */
  let ref = null, zoneNo = null;
  const z = nk.match(/zona\s*(\d{1,2})/);
  if (z && MKZ[+z[1]]) { zoneNo = +z[1]; const m = MKZ[zoneNo]; ref = { name: m[0], rent: m[1], sqm: m[2], conf: m[3] }; }
  if (!ref) { const r = MKR.find((x) => x[0].test(nk)); if (r) ref = { name: r[1][0], rent: r[1][1], sqm: r[1][2], conf: r[1][3] }; }
  if (!ref && reg === 4) { zoneNo = 10; const m = MKZ[10]; ref = { name: m[0], rent: m[1], sqm: m[2], conf: m[3] }; }
  if (!ref && MKREG[reg]) { const m = MKREG[reg]; ref = { name: m[0], rent: m[1], sqm: m[2], conf: m[3] }; }
  if (!ref) ref = { name: MKD[0], rent: MKD[1], sqm: MKD[2], conf: MKD[3] };

  /* --- datos de la descripción --- */
  const isHouse = /\b(casa|house|residencia|chalet|villa)\b/.test(nk);
  const isLand = /\b(terreno|lote|land)\b/.test(nk);
  const brM = nk.match(/(\d+)\s*(?:habitaci|dormitorio|cuarto|bedroom)/);
  const br = brM ? Math.min(6, Math.max(1, parseInt(brM[1], 10))) : 2;
  const m2M = nk.match(/(\d[\d.,]*)\s*(?:m2|m²|mts?2|metros?\s*cuadrados?)/);
  const defM2 = (b) => (isHouse ? [150, 200, 260, 320][Math.min(b, 4) - 1] : [55, 85, 125, 170][Math.min(b, 4) - 1]);
  const area = m2M ? parseFloat(m2M[1].replace(/,/g, '')) : defM2(br);
  const brF = (b) => ({ 1: 0.8, 2: 1, 3: 1.4 }[b] || 1.9);
  let af = 1;
  const amen = (nk.match(/piscina|pool|gimnasio|gym|amenidades|seguridad 24|concierge|salon social/g) || []).length;
  af += Math.min(0.1, amen * 0.05);
  if (/lujo|premium|nuevo|estrenar|remodelad|luxury/.test(nk)) af += 0.08;
  if (/penthouse/.test(nk)) af += 0.2;
  if (/vista|volcan|view/.test(nk)) af += 0.05;
  af = Math.min(1.3, af);
  const furn = /amueblad|furnish/.test(nk) ? 1.1 : 1;
  const typeF = isHouse ? 1.3 : 1;
  const rentOf = (r, b) => [r.rent[0] * brF(b) * typeF * af * furn, r.rent[1] * brF(b) * typeF * af * furn];
  const saleOf = (r, ar) => [r.sqm[0] * ar * (isHouse ? 0.55 : 1) * af, r.sqm[1] * ar * (isHouse ? 0.55 : 1) * af];

  const blocks = [], lines = [], similar = [], around = [];
  const fill = { rent: '', sale: '' };
  const rr = rentOf(ref, br), ss = saleOf(ref, area);
  if (isLand) lines.push([L('Tipo de propiedad', 'Property type'), L('Terreno: el valor depende de la ubicación exacta, el área y los servicios; la mediana publicada ronda US$ 335,000 con dispersión enorme. Se recomienda valuación.', 'Land: value depends on the exact location, size and utilities; the published median is around US$ 335,000 with huge dispersion. A valuation is recommended.')]);
  if (wantRent && !isLand) {
    blocks.push({ label: L('Renta mensual estimada', 'Estimated monthly rent'), range: rq(rr[0], rr[1]), usd: ru(rr[0], rr[1]) });
    fill.rent = Qf(rnd(((rr[0] + rr[1]) / 2) * MK_FX)) + L(' al mes', ' per month');
  }
  if (wantSale && !isLand) {
    blocks.push({ label: L('Valor de venta estimado', 'Estimated sale value'), range: rq(ss[0], ss[1]), usd: ru(ss[0], ss[1]) });
    fill.sale = Qf(rnd(((ss[0] + ss[1]) / 2) * MK_FX));
  }
  lines.push([L('Zona de referencia', 'Reference area'), ref.name]);
  if (!isLand) lines.push([L('Propiedad considerada', 'Property considered'), (isHouse ? L('Casa', 'House') : L('Apartamento', 'Apartment')) + ' · ' + br + L(' hab.', ' bd.') + ' · ' + Math.round(area) + ' m²' + (m2M ? '' : L(' (típico)', ' (typical)'))]);
  if (wantSale && !isLand) lines.push([L('Precio por m² de referencia', 'Reference price per m²'), rq(ref.sqm[0] * (isHouse ? 0.55 : 1) * af, ref.sqm[1] * (isHouse ? 0.55 : 1) * af)]);
  if (wantRent && wantSale && !isLand) {
    const ym = (((rr[0] + rr[1]) / 2) * 12) / ((ss[0] + ss[1]) / 2) * 100;
    lines.push([L('Rentabilidad bruta anual aprox.', 'Approx. gross annual yield'), (Math.round(ym * 0.85 * 10) / 10) + '% – ' + (Math.round(ym * 1.15 * 10) / 10) + '%']);
  }
  if (af > 1.001 || furn > 1) lines.push([L('Ajustes por la descripción', 'Adjustments from the description'), '+' + Math.round((af * furn - 1) * 100) + '% ' + L('(amenidades, acabados, vista o amueblado)', '(amenities, finishes, view or furnished)')]);

  /* --- propiedades similares --- */
  if (!isLand) {
    (isHouse ? [2, 3, 4] : [1, 2, 3]).forEach((b) => {
      const ar = defM2(b);
      const a = rentOf(ref, b), s = saleOf(ref, ar);
      const parts = [];
      if (wantRent) parts.push(L('renta ', 'rent ') + rq(a[0], a[1]));
      if (wantSale) parts.push(L('venta ', 'sale ') + rq(s[0], s[1]));
      similar.push([b + L(' hab. · ~', ' bd. · ~') + ar + ' m²', parts.join(' · ')]);
    });
    /* --- alrededor --- */
    let near = zoneNo && MKADJ[zoneNo] ? MKADJ[zoneNo].slice(0, 3).map((n) => ({ name: MKZ[n][0], rent: MKZ[n][1], sqm: MKZ[n][2] })) : [];
    if (!near.length) near = [{ name: MKZ[10][0], rent: MKZ[10][1], sqm: MKZ[10][2] }, { name: MKZ[14][0], rent: MKZ[14][1], sqm: MKZ[14][2] }, { name: MKR[3][1][0], rent: MKR[3][1][1], sqm: MKR[3][1][2] }].filter((x) => x.name !== ref.name);
    near.forEach((r) => {
      const a = rentOf(r, br), s = saleOf(r, area);
      const parts = [];
      if (wantRent) parts.push(L('renta ', 'rent ') + rq(a[0], a[1]));
      if (wantSale) parts.push(L('venta ', 'sale ') + rq(s[0], s[1]));
      around.push([r.name, parts.join(' · ')]);
    });
  }
  const confTxt = { alta: L('alta', 'high'), media: L('media', 'medium'), baja: L('baja', 'low') }[ref.conf];
  return {
    blocks,
    lines: lines.map(([k, v]) => ({ k, v })),
    similar: similar.map(([k, v]) => ({ k, v })),
    around: around.map(([k, v]) => ({ k, v })),
    conf: L('Confianza de la referencia: ', 'Reference confidence: ') + confTxt + L(' (según los datos publicados para esa zona).', ' (based on the data published for that area).'),
    hasFill: !!(fill.rent || fill.sale),
    hasBlocks: blocks.length > 0,
    hasSimilar: similar.length > 0,
    hasAround: around.length > 0,
    fill,
    notes: L('Referencia basada en precios pedidos publicados en portales inmobiliarios de Guatemala (2026), convertidos a quetzales (US$ 1 ≈ Q 7.70). No son precios de cierre: en Guatemala lo que se paga suele ser 5% a 15% menor. No usa anuncios en vivo ni sustituye un avalúo profesional.',
             'Reference based on asking prices published on Guatemalan real estate portals (2026), converted to quetzals (US$ 1 ≈ Q 7.70). These are not closing prices: in Guatemala the price paid is usually 5% to 15% lower. It does not use live listings and does not replace a professional appraisal.')
  };
}

const STORE = 'armopaProps_v3';
const BASE = [1, 2, 3, 4, 5].map((n) => 'assets/propiedad-' + n + '.jpg');
let data = {};
try { data = (JSON.parse(localStorage.getItem(STORE) || 'null') || {}).data || {}; } catch (e) {}
let cur = null;           // nombre de la ciudad activa (texto), o null si no hay ninguna elegida
let panelView = 'cities'; // 'cities' = viendo ciudades | 'locs' = viendo ubicaciones de una ciudad
let mode = 'edit', sel = -1, vi = 0, confirmDel = false;
let citySearch = '';      // texto de búsqueda de ciudad en el modal
let showThumbs = false;   // si se muestra la cuadrícula de miniaturas en el formulario de edición
const pModal = $('#propModal');

const cityNames = () => Object.keys(data).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
const list = () => { if (cur === null) return []; data[cur] = data[cur] || []; return data[cur]; };
function persistLocalOnly() {
  try { localStorage.setItem(STORE, JSON.stringify({ data })); return true; } catch (e) { return false; }
}
function persist() {
  syncLoc();
  return persistLocalOnly();
}
function note(msg) {
  const el = $('#pMsg');
  el.textContent = msg || '';
  el.hidden = !msg;
}
function mapUrl(c) {
  const q = (c.addr || '').trim() || [c.name, cur, 'Guatemala'].join(', ');
  return /^https?:\/\//i.test(q) ? q : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
}
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
function pickLoc(i) { sel = i; vi = 0; confirmDel = false; mk = null; showThumbs = false; note(''); render(); }
function openCityFromList(name) {
  cur = name; panelView = 'locs'; sel = list().length ? 0 : -1; vi = 0; confirmDel = false;
  note(''); render();
}

function renderList() {
  const t = T[lang];
  const box = $('#pList');
  const wasSearchFocused = document.activeElement && document.activeElement.id === 'citySearchInput';
  const prevSelStart = wasSearchFocused ? document.activeElement.selectionStart : null;
  const prevSelEnd = wasSearchFocused ? document.activeElement.selectionEnd : null;
  box.innerHTML = '';

  if (panelView === 'cities') {
    const searchWrap = el('div', 'city-search-wrap');
    searchWrap.style.marginBottom = '10px';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'citySearchInput';
    searchInput.placeholder = 'Buscar ciudad...';
    searchInput.autocomplete = 'off';
    searchInput.value = citySearch;
    searchInput.style.width = '100%';
    searchInput.style.boxSizing = 'border-box';
    searchInput.style.padding = '10px 12px';
    searchInput.style.border = '1px solid var(--line)';
    searchInput.style.borderRadius = '10px';
    searchInput.style.fontSize = '14px';
    searchInput.addEventListener('input', () => {
      citySearch = searchInput.value;
      renderList();
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const q = citySearch.trim().toLowerCase();
      if (!q) return;
      const matches = cityNames().filter((n) => n.toLowerCase().includes(q));
      if (matches.length) openCityFromList(matches[0]);
    });
    searchWrap.appendChild(searchInput);
    box.appendChild(searchWrap);

    if (wasSearchFocused) {
      requestAnimationFrame(() => {
        searchInput.focus();
        if (prevSelStart != null) searchInput.setSelectionRange(prevSelStart, prevSelEnd);
      });
    }

    const q = citySearch.trim().toLowerCase();
    const namesToShow = q ? cityNames().filter((n) => n.toLowerCase().includes(q)) : cityNames();

    if (q && !namesToShow.length) {
      const noRes = el('p', '', 'No se encontraron ciudades.');
      noRes.style.color = 'var(--muted)';
      noRes.style.fontSize = '13px';
      noRes.style.margin = '4px 0 10px';
      box.appendChild(noRes);
    }

    namesToShow.forEach((name) => {
      const b = el('button', 'li' + (name === cur ? ' on' : ''));
      b.type = 'button';
      b.append(el('span', '', name), el('small', '', String((data[name] || []).length)));
      b.addEventListener('click', () => openCityFromList(name));
      box.appendChild(b);
      const cam = el('button', 'btn btn-line-dark btn-sm', '📷');
      cam.type = 'button';
      cam.addEventListener('click', (e) => {
        e.stopPropagation();
        const input = document.createElement('input');
        input.type = 'file'; input.accept = 'image/*';
        input.addEventListener('change', async () => {
          const f = input.files && input.files[0];
          if (!f) return;
          try {
            const url = await uploadPropFile(f, 1200);
            cityCovers[name] = url;
            const { error } = await supabaseClient.from('ciudades_portada').upsert({ ciudad: name, foto: url });
            if (error) console.error('Error al guardar portada:', error);
            buildCityCards();
            renderList();
          } catch (err) { console.error('Error al subir portada:', err); }
        });
        input.click();
      });
      cam.title = 'Foto de portada';
      cam.setAttribute('aria-label', 'Foto de portada');

      const btnUpdate = el('button', 'btn btn-line-dark btn-sm', '✏️');
      btnUpdate.type = 'button';
      btnUpdate.title = 'Actualizar';
      btnUpdate.setAttribute('aria-label', 'Actualizar');
      btnUpdate.addEventListener('click', async (e) => {
        e.stopPropagation();
        const newName = (prompt('Nuevo nombre para la ciudad:', name) || '').trim();
        if (!newName || newName === name) return;
        try {
          const { error } = await supabaseClient.from('ciudades_portada').update({ ciudad: newName }).eq('ciudad', name);
          if (error) { note('Error al actualizar la ciudad: ' + error.message); return; }
          data[newName] = data[name] || [];
          delete data[name];
          cityCovers[newName] = cityCovers[name];
          delete cityCovers[name];
          if (cur === name) cur = newName;
          persistLocalOnly();
          note('Ciudad actualizada con éxito.');
          buildCityCards();
          renderList();
        } catch (err) { note('Error al actualizar la ciudad.'); }
      });

      const btnDelete = el('button', 'btn btn-line-dark btn-sm', '🗑️');
      btnDelete.type = 'button';
      btnDelete.title = 'Eliminar';
      btnDelete.setAttribute('aria-label', 'Eliminar');
      btnDelete.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('¿Eliminar la ciudad "' + name + '"? Esta acción no se puede deshacer.')) return;
        try {
          const { error } = await supabaseClient.from('ciudades_portada').delete().eq('ciudad', name);
          if (error) { note('Error al eliminar la ciudad: ' + error.message); return; }
          delete data[name];
          delete cityCovers[name];
          if (cur === name) { cur = null; panelView = 'cities'; }
          persistLocalOnly();
          note('Ciudad eliminada con éxito.');
          buildCityCards();
          renderList();
        } catch (err) { note('Error al eliminar la ciudad.'); }
      });

      const rowActions = el('div', 'city-row-actions');
      rowActions.style.display = 'flex';
      rowActions.style.gap = '6px';
      rowActions.style.flexWrap = 'nowrap';
      rowActions.style.width = '100%';
      [cam, btnUpdate, btnDelete].forEach((btn) => {
        btn.style.flex = '1 1 0';
        btn.style.minWidth = '0';
        btn.style.padding = '0 6px';
        btn.style.fontSize = '13px';
        btn.style.minHeight = '36px';
      });
      rowActions.appendChild(cam);
      rowActions.appendChild(btnUpdate);
      rowActions.appendChild(btnDelete);
      box.appendChild(rowActions);
    });
   const add = el('button', 'btn btn-dark', '+ Nueva ciudad');
add.type = 'button';
add.addEventListener('click', () => openNewCityDialog());
box.appendChild(add);
return;
  }

  const back = el('button', 'btn btn-line-dark', '← Ciudades');
  back.type = 'button';
  back.addEventListener('click', () => { panelView = 'cities'; cur = null; sel = -1; note(''); render(); });
  box.appendChild(back);

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
    sel = l.length - 1; vi = 0; confirmDel = false; showThumbs = false;
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
  grid.hidden = !showThumbs;
  const viewBtn = $('#pView');
  viewBtn.textContent = showThumbs ? 'Ocultar fotografías' : ('Ver fotografías (' + c.imgs.length + ')');
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
  $('#vAddr').textContent = a && !/^https?:\/\//i.test(a) ? a : cur + ', Guatemala';
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
  if (panelView === 'cities') {
    $('#pTitle').textContent = 'Ciudades';
    $('#pSub').textContent = cityNames().length ? cityNames().length + ' ciudad(es)' : 'Agrega tu primera ciudad';
    $('#pEdit').hidden = false;
    $('#pForm').hidden = true;
    $('#pEmpty').hidden = true;
    $('#pCard').classList.remove('vw');
    $('#pViewBox').hidden = true;
    renderList();
    renderMk();
    return;
  }
  const l = list();
  if (sel >= l.length) sel = l.length - 1;
  $('#pTitle').textContent = cur;
  $('#pSub').textContent = l.length === 0 ? t.noLocs : l.length === 1 ? t.oneLoc : l.length + ' ' + t.locsWord;
  $('#pCard').classList.toggle('vw', mode === 'view');
  $('#pEdit').hidden = mode !== 'edit';
  $('#pViewBox').hidden = mode !== 'view';
  if (mode === 'edit') renderEdit(); else renderView();
  renderMk();
}
function openProp() {
  panelView = 'cities'; cur = null; mode = 'edit'; confirmDel = false; mk = null; sel = -1; vi = 0;
  citySearch = '';
  note('');
  render();
  pModal.hidden = false;
}
function closeProp() { pModal.hidden = true; $('#lbModal').hidden = true; }
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

$('#addCityBtn').addEventListener('click', () => openProp());

/* Menú rápido: buscar propiedades por Ciudad, Zona y Área */
const catalogBtn = $('#catalogBtn');
const cityQuickMenu = $('#cityQuickMenu');
function closeCityQuickMenu() { cityQuickMenu.hidden = true; }
function openNewCityDialog() {
  const overlay = el('div', 'ncw-overlay');
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(3,12,22,.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '200', padding: '20px'
  });

  const card = el('div', 'ncw-card');
  Object.assign(card.style, {
    background: '#fff', borderRadius: '16px', padding: '26px', width: 'min(420px, 100%)',
    boxShadow: '0 24px 70px rgba(0,0,0,.4)', display: 'flex', flexDirection: 'column', gap: '14px'
  });

  const title = el('h3', '', 'Nueva ciudad');
  title.style.margin = '0';
  card.appendChild(title);

  const nameLabel = el('label', 'cq-label', 'Nombre de la ciudad');
  card.appendChild(nameLabel);
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'cq-input';
  nameInput.placeholder = 'Ej. Cobán';
  card.appendChild(nameInput);

  const photoLabel = el('label', 'cq-label', 'Foto de portada (opcional)');
  card.appendChild(photoLabel);
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.id = 'ncw-file-' + Date.now();
  fileInput.style.display = 'none';
  const photoBtnLabel = document.createElement('label');
  photoBtnLabel.setAttribute('for', fileInput.id);
  photoBtnLabel.className = 'btn btn-line-dark btn-sm';
  photoBtnLabel.style.cursor = 'pointer';
  photoBtnLabel.style.display = 'inline-block';
  photoBtnLabel.textContent = '📷 Elegir foto';
  const fileNameNote = el('span', '', '');
  fileNameNote.style.cssText = 'display:block;margin-top:6px;font-size:13px;color:var(--muted)';
  fileInput.addEventListener('change', () => {
    const f = fileInput.files && fileInput.files[0];
    fileNameNote.textContent = f ? f.name : '';
  });
  card.appendChild(fileInput);
  card.appendChild(photoBtnLabel);
  card.appendChild(fileNameNote);

  const errMsg = el('p', '', '');
  errMsg.style.cssText = 'color:#b3261e;font-size:13px;margin:0;min-height:1em';
  card.appendChild(errMsg);

  const btnRow = el('div', '');
  btnRow.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;margin-top:4px';
  const cancelBtn = el('button', 'btn btn-line-dark', 'Cancelar');
  cancelBtn.type = 'button';
  const saveBtn = el('button', 'btn btn-dark', 'Guardar');
  saveBtn.type = 'button';
  btnRow.append(cancelBtn, saveBtn);
  card.appendChild(btnRow);

  overlay.appendChild(card);
  document.body.appendChild(overlay);
  nameInput.focus();

  function closeDialog() { overlay.remove(); }
  cancelBtn.addEventListener('click', closeDialog);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDialog(); });

  saveBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    if (!name) { errMsg.textContent = 'Escribe el nombre de la ciudad.'; nameInput.focus(); return; }
    saveBtn.disabled = true;
    saveBtn.textContent = 'Guardando…';
    if (!data[name]) data[name] = [];
    const file = fileInput.files && fileInput.files[0];
    let photoUrl = '';
    try {
      if (file) {
        photoUrl = await uploadPropFile(file, 1200);
        cityCovers[name] = photoUrl;
      }
      const { error } = await supabaseClient.from('ciudades_portada').upsert({ ciudad: name, foto: photoUrl || null });
      if (error) { errMsg.textContent = 'Error al guardar: ' + error.message; saveBtn.disabled = false; saveBtn.textContent = 'Guardar'; return; }
      note(file ? 'Ciudad y foto guardadas con éxito.' : 'Ciudad agregada con éxito.');
    } catch (err) {
      errMsg.textContent = 'Error al guardar la ciudad.';
      saveBtn.disabled = false;
      saveBtn.textContent = 'Guardar';
      return;
    }
    cur = name; panelView = 'locs'; sel = list().length ? 0 : -1; vi = 0; confirmDel = false;
    persistLocalOnly();
    buildCityCards();
    closeDialog();
    render();
  });
}
function extractNumber(str) {
  if (!str) return null;
  const cleaned = String(str).replace(/[^\d.,]/g, '').replace(/,/g, '');
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}
function buildSearchMenu() {
  cityQuickMenu.innerHTML = '';
  const names = cityNames();
  const form = el('div', 'cq-form');

  form.appendChild(el('label', 'cq-label', 'Ciudad'));
  const citySelect = document.createElement('select');
  citySelect.className = 'cq-select';
  if (!names.length) {
    const opt = document.createElement('option');
    opt.textContent = 'No hay ciudades cargadas';
    opt.disabled = true; opt.selected = true;
    citySelect.appendChild(opt);
    citySelect.disabled = true;
  } else {
    names.forEach((name) => {
      const opt = document.createElement('option');
      opt.value = name; opt.textContent = name;
      citySelect.appendChild(opt);
    });
  }
  form.appendChild(citySelect);

  form.appendChild(el('label', 'cq-label', 'Zona'));
  const zonaInput = document.createElement('input');
  zonaInput.type = 'text';
  zonaInput.className = 'cq-input';
  zonaInput.placeholder = 'Ej. Zona 10, Antigua...';
  form.appendChild(zonaInput);

  form.appendChild(el('label', 'cq-label', 'Sector'));
  const sectorInput = document.createElement('input');
  sectorInput.type = 'text';
  sectorInput.className = 'cq-input';
  sectorInput.placeholder = 'Ej. Cayalá, Vista Hermosa...';
  form.appendChild(sectorInput);

  form.appendChild(el('label', 'cq-label', 'Especificaciones de propiedad'));
  const specsInput = document.createElement('input');
  specsInput.type = 'text';
  specsInput.className = 'cq-input';
  specsInput.placeholder = 'Ej. 150 m², 3 habitaciones, piscina...';
  form.appendChild(specsInput);

  form.appendChild(el('label', 'cq-label', 'Presupuesto estimado (Q)'));
  const budgetInput = document.createElement('input');
  budgetInput.type = 'text';
  budgetInput.className = 'cq-input';
  budgetInput.placeholder = 'Ej. 500,000';
  budgetInput.inputMode = 'decimal';
  form.appendChild(budgetInput);

  const searchBtn = el('button', 'btn btn-dark cq-search-btn', 'Buscar');
  searchBtn.type = 'button';
  form.appendChild(searchBtn);

  const results = el('div', 'cq-results');
  form.appendChild(results);

  searchBtn.addEventListener('click', () => {
    results.innerHTML = '';
    const city = citySelect.value;
    if (!city) return;
    const zonaQ = zonaInput.value.trim().toLowerCase();
    const sectorQ = sectorInput.value.trim().toLowerCase();
    const specsQ = specsInput.value.trim().toLowerCase();
    const budgetNum = extractNumber(budgetInput.value);
    const matches = (data[city] || [])
      .map((l, i) => ({ l, i }))
      .filter(({ l }) => {
        const addrTxt = (l.addr || '').toLowerCase();
        const okZona = !zonaQ || addrTxt.includes(zonaQ);
        const okSector = !sectorQ || addrTxt.includes(sectorQ);
        const okSpecs = !specsQ || (l.desc || '').toLowerCase().includes(specsQ);
        let okBudget = true;
        if (budgetNum != null) {
          const prices = [];
          if (l.op === 'renta' || l.op === 'ambos' || !l.op) { const r = extractNumber(l.pRent); if (r != null) prices.push(r); }
          if (l.op === 'venta' || l.op === 'ambos' || !l.op) { const s = extractNumber(l.pSale); if (s != null) prices.push(s); }
          okBudget = prices.length > 0 && prices.some((p) => p <= budgetNum);
        }
        return okZona && okSector && okSpecs && okBudget;
      });
    if (!matches.length) {
      results.appendChild(el('div', 'cq-empty', 'No se encontraron ubicaciones con esos criterios.'));
      return;
    }
    matches.forEach(({ l, i }) => {
      const r = el('button', '', l.name || 'Ubicación ' + (i + 1));
      r.type = 'button';
      r.append(el('small', '', l.addr || ''));
      r.addEventListener('click', () => {
        closeCityQuickMenu();
        openLocationDirect(city, i);
      });
      results.appendChild(r);
    });
  });

  cityQuickMenu.appendChild(form);
}
if (catalogBtn && cityQuickMenu) {
  catalogBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const willOpen = cityQuickMenu.hidden;
    if (willOpen) buildSearchMenu();
    cityQuickMenu.hidden = !willOpen;
  });
  document.addEventListener('click', (e) => {
    if (!cityQuickMenu.hidden && !cityQuickMenu.contains(e.target) && e.target !== catalogBtn) {
      closeCityQuickMenu();
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCityQuickMenu(); });
}

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
  try { c.sPhoto = await uploadPropFile(f, 1600); } catch (err) { return; }
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
    try { urls.push(await uploadPropFile(f, 1600)); } catch (err) {}
  }
  if (!urls.length) return;
  c.imgs = c.imgs.concat(urls);
  note(persist() ? T[lang].uploaded : T[lang].storeErr);
  renderEdit();
});

/* Costos alrededor: valores de propiedades similares (referencia) */
let mk = null;
function mkList(id, items) {
  const ul = $(id);
  ul.innerHTML = '';
  items.forEach((x) => { const li = el('li'); li.append(el('span', '', x.k), el('strong', '', x.v)); ul.appendChild(li); });
}
function renderMk() {
  const box = $('#pMk');
  const c = cur >= 0 ? list()[sel] : null;
  if (!mk || !c || mk.key !== cur + '-' + sel || mode !== 'edit') { box.hidden = true; return; }
  const e = marketEstimate(cur, mk.in, lang);
  box.hidden = false;
  const bl = $('#pMkBlocks');
  bl.innerHTML = '';
  e.blocks.forEach((b) => {
    const row = el('div', 'mk-b');
    row.append(el('span', 'mk-l', b.label), el('span', 'amt', b.range), el('span', 'mk-u', b.usd));
    bl.appendChild(row);
  });
  mkList('#pMkLines', e.lines);
  mkList('#pMkSim', e.similar);
  mkList('#pMkAro', e.around);
  $('#pMkSimH').hidden = $('#pMkSim').hidden = !e.hasSimilar;
  $('#pMkAroH').hidden = $('#pMkAro').hidden = !e.hasAround;
  $('#pMkConf').textContent = e.conf;
  $('#pMkUseRow').hidden = !e.hasFill;
  $('#pMkNotes').textContent = e.notes;
}
$('#pMkBtn').addEventListener('click', () => {
  const c = list()[sel]; if (!c) return;
  mk = { key: cur + '-' + sel, in: { op: c.op || '', name: c.name || '', addr: c.addr || '', desc: c.desc || '' } };
  renderMk();
});
$('#pMkHide').addEventListener('click', () => { mk = null; renderMk(); });
$('#pMkUse').addEventListener('click', () => {
  const c = list()[sel]; if (!c || !mk) return;
  const e = marketEstimate(cur, mk.in, lang);
  if (e.fill.rent) c.pRent = e.fill.rent;
  if (e.fill.sale) c.pSale = e.fill.sale;
  note(persist() ? T[lang].saved : T[lang].storeErr);
  renderEdit();
  renderMk();
});
$('#pView').addEventListener('click', () => { showThumbs = !showThumbs; render(); });
$('#vEdit').addEventListener('click', () => { mode = 'edit'; render(); });
$('#pDel').addEventListener('click', () => {
  if (!confirmDel) { confirmDel = true; renderEdit(); return; }
  const removed = list()[sel];
  const cityAtDelete = cur;
  list().splice(sel, 1);
  sel = Math.max(0, sel - 1); confirmDel = false; vi = 0;
  note(persist() ? T[lang].saved : T[lang].storeErr);
  render();
  if (removed && cityAtDelete) {
    supabaseClient.from('propiedades').delete().eq('ciudad', cityAtDelete).eq('local_id', removed.id)
      .then(({ error }) => { if (error) console.error('Error al borrar en Supabase:', error); });
  }
});
$('#pSaveTop').addEventListener('click', () => saveLocNow('Ubicación guardada con éxito.'));
$('#pUpdateTop').addEventListener('click', () => saveLocNow('Ubicación actualizada con éxito.'));
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

/* Especialistas: datos por servicio (se guardan en este navegador) */
const XKEY = 'armopaSvc_v1';
let xd = {};
try { xd = JSON.parse(localStorage.getItem(XKEY) || 'null') || {}; } catch (e) {}
let xo = -1;
const xget = (i) => (xd[i] = xd[i] || { need: '', time: '', start: '', prio: '', imgs: [], main: 0 });
const fmtDate = (iso) => { if (!iso) return ''; const [y, m, dd] = iso.split('-').map(Number); return new Date(y, m - 1, dd).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-GT', { day: 'numeric', month: 'long', year: 'numeric' }); };
(() => { const dn = new Date(); const min = dn.getFullYear() + '-' + String(dn.getMonth() + 1).padStart(2, '0') + '-' + String(dn.getDate()).padStart(2, '0'); $$('.xs').forEach((x) => { x.min = min; }); })();
const xsave = () => { try { localStorage.setItem(XKEY, JSON.stringify(xd, (k, v) => (k === 'estIn' || k === 'est' ? undefined : v))); return true; } catch (e) { return false; } };
const xfilled = (i) => { const d = xd[i]; return !!(d && ((d.need || '').trim() || (d.time || '').trim() || d.start || d.prio || (d.imgs || []).length)); };
function xImgs(i) {
  const c = $$('.ex-c')[i];
  const d = xget(i);
  const prev = c.querySelector('.x-prev');
  prev.hidden = !d.imgs.length;
  const box = c.querySelector('.x-thumbs');
  box.innerHTML = '';
  if (!d.imgs.length) return;
  d.main = Math.min(d.main || 0, d.imgs.length - 1);
  c.querySelector('.x-main').src = d.imgs[d.main];
  d.imgs.forEach((src, k) => {
    const wrap = el('div', 'th');
    const b = el('button', 'th-b' + (k === d.main ? ' on' : ''));
    b.type = 'button';
    b.setAttribute('aria-label', T[lang].photo + (k + 1));
    const img = el('img'); img.src = src; img.alt = '';
    b.appendChild(img);
    b.addEventListener('click', () => { d.main = k; xsave(); xImgs(i); });
    const x = el('button', 'th-x', '×');
    x.type = 'button';
    x.setAttribute('aria-label', T[lang].remove);
    x.addEventListener('click', () => { d.imgs.splice(k, 1); d.main = 0; xsave(); xImgs(i); c.querySelector('.ex-dot').hidden = !xfilled(i); });
    wrap.append(b, x);
    box.appendChild(wrap);
  });
}
function xEst(i) {
  const c = $$('.ex-c')[i];
  const d = xget(i);
  const t = T[lang];
  c.querySelector('.x-estbtn span').textContent = t.xEstBtn;
  const box = c.querySelector('.x-est');
  box.hidden = !d.estIn;
  if (!d.estIn) return;
  const e = estimate(i, d.estIn, lang);
  box.querySelector('.amt').textContent = e.range;
  const ul = box.querySelector('.x-est-l');
  ul.innerHTML = '';
  e.lines.forEach((ln) => {
    const li = el('li');
    li.append(el('span', '', ln.k), el('strong', '', ln.v));
    ul.appendChild(li);
  });
  const as = box.querySelector('.assum');
  as.textContent = e.assumed;
  as.hidden = !e.assumed;
  box.querySelector('.x-estnote').textContent = e.notes;
}
function xRender(i) {
  const c = $$('.ex-c')[i];
  const open = xo === i;
  const btn = c.querySelector('.ex-i');
  btn.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', open);
  c.querySelector('.ex-p').hidden = !open;
  c.querySelector('.ex-dot').hidden = !xfilled(i);
  if (open) {
    const d = xget(i);
    c.querySelector('textarea').value = d.need || '';
    c.querySelector('input[type=text]').value = d.time || '';
    c.querySelector('.xs').value = d.start || '';
    c.querySelectorAll('.seg').forEach((b) => { const on = (d.prio || '') === b.dataset.prio; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    xImgs(i);
    xEst(i);
  }
}
$$('.ex-c').forEach((c, i) => {
  c.querySelector('.ex-i').addEventListener('click', () => {
    const prev = xo;
    xo = xo === i ? -1 : i;
    if (prev >= 0) xRender(prev);
    xRender(i);
  });
  c.querySelector('textarea').addEventListener('input', (e) => { xget(i).need = e.target.value; xsave(); c.querySelector('.ex-dot').hidden = !xfilled(i); });
  c.querySelector('input[type=text]').addEventListener('input', (e) => { xget(i).time = e.target.value; xsave(); c.querySelector('.ex-dot').hidden = !xfilled(i); });
  c.querySelectorAll('.seg').forEach((b) => b.addEventListener('click', () => {
    const d = xget(i);
    d.prio = d.prio === b.dataset.prio ? '' : b.dataset.prio;
    xsave();
    xRender(i);
  }));
  c.querySelector('.x-estbtn').addEventListener('click', () => { const d = xget(i); d.estIn = { need: d.need || '', time: d.time || '', prio: d.prio || '' }; xEst(i); });
  c.querySelector('.x-est-x').addEventListener('click', () => { xget(i).estIn = null; xEst(i); });
  c.querySelector('.xs').addEventListener('input', (e) => { xget(i).start = e.target.value; xsave(); c.querySelector('.ex-dot').hidden = !xfilled(i); });
  c.querySelector('input[type=file]').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    const urls = [];
    for (const f of files) { try { urls.push(await shrink(f, 1200)); } catch (err) {} }
    if (!urls.length) return;
    const d = xget(i);
    d.imgs = d.imgs.concat(urls);
    d.main = d.imgs.length - 1;
    xsave();
    xImgs(i);
    c.querySelector('.ex-dot').hidden = false;
  });
});
function xLines(t) {
  const lines = [];
  t.ext.forEach((name, i) => {
    const d = xd[i] || {};
    const need = (d.need || '').trim(), time = (d.time || '').trim(), start = d.start || '', prio = d.prio || '', n = (d.imgs || []).length;
    if (!need && !time && !start && !prio && !n && !d.estIn) return;
    const parts = [];
    if (need) parts.push(need);
    if (prio) parts.push(t.qMsgPrio + { alta: t.xPrioAlta, media: t.xPrioMedia, baja: t.xPrioBaja }[prio]);
    if (time) parts.push(t.qMsgTime + time);
    if (start) parts.push(t.qMsgStart + fmtDate(start));
    if (d.estIn) parts.push(t.qMsgEst + estimate(i, d.estIn, lang).range);
    if (n) parts.push(t.qMsgImgs.replace('{n}', n));
    lines.push('- ' + name + ': ' + parts.join(' | '));
  });
  return lines.length ? '\n\n' + t.qMsgSvc + '\n' + lines.join('\n') : '';
}

/* Solicitar cotización por WhatsApp */
const WA_NUMBER = '50249183411'; // número de WhatsApp de la página (código de país + número, solo dígitos)
(function () {
  const d = new Date();
  $('#q-date').min = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const MAIL_TO = 'servicios@armopa.com'; // correo de la página
  const btn = $('#qBtn'), mail = $('#qMail');
  function build(e) {
    const t = T[lang];
    const name = $('#q-name').value.trim(), phone = $('#q-phone').value.trim(), email = $('#q-email').value.trim(), addr = $('#q-addr').value.trim(), date = $('#q-date').value;
    const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !phone || !addr || !date || !emailOk) {
      e.preventDefault();
      const er = $('#qErr');
      er.textContent = email && !emailOk ? t.qErrEmail : t.qErr;
      er.hidden = false;
      return null;
    }
    $('#qErr').hidden = true;
    const [y, m, dd] = date.split('-').map(Number);
    const dateTxt = new Date(y, m - 1, dd).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-GT', { day: 'numeric', month: 'long', year: 'numeric' });
    return [t.qMsgH, t.qMsgName + name, t.qMsgPhone + phone].concat(email ? [t.qMsgEmail + email] : [], [t.qMsgAddr + addr, t.qMsgDate + dateTxt]).join('\n') + xLines(t);
  }
  btn.addEventListener('click', (e) => {
    const msg = build(e);
    if (msg) btn.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  });
  mail.addEventListener('click', (e) => {
    const msg = build(e);
    if (msg) mail.href = 'mailto:' + MAIL_TO + '?subject=' + encodeURIComponent(T[lang].qMailSubj) + '&body=' + encodeURIComponent(msg);
  });
  ['#q-name', '#q-phone', '#q-email', '#q-addr', '#q-date'].forEach((s) => $(s).addEventListener('input', () => { $('#qErr').hidden = true; }));
})();

setLang(lang);
update();
// ============================================
// PRUEBA DE CONEXIÓN CON SUPABASE
// ============================================

async function probarSupabase() {
    console.log("Probando conexión con Supabase...");

    const { data, error } = await supabaseClient
        .from("servicios")
        .select("*");

    if (error) {
        console.error("Error de Supabase:", error);
        alert("ERROR DE SUPABASE:\n" + error.message);
        return;
    }

    console.log("Conexión correcta.");
    console.log("Servicios encontrados:", data);

    alert(
        "CONEXIÓN CORRECTA\n\n" +
        "ARMOPA encontró " + data.length + " servicios en Supabase."
    );
}
// ===== Servicios desde Supabase =====
function escaparTexto(texto) {
  const d = document.createElement('div');
  d.textContent = texto ?? '';
  return d.innerHTML;
}

async function cargarServiciosArmopa() {
  const contenedor = document.getElementById('servicios-contenedor');
  if (!contenedor) return;

  const { data, error } = await supabaseClient
    .from('servicios')
    .select('id, nombre, descripcion, categoria')
    .eq('activo', true)
    .order('categoria', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    console.error('Error cargando servicios:', error);
    contenedor.innerHTML = '<p class="servicios-estado">No pudimos cargar los servicios en este momento.</p>';
    return;
  }

  if (!data.length) {
    contenedor.innerHTML = '<p class="servicios-estado">Próximamente.</p>';
    return;
  }

  // Agrupar por categoría
  const grupos = {};
  data.forEach(s => {
    const cat = s.categoria || 'Otros servicios';
    (grupos[cat] = grupos[cat] || []).push(s);
  });

  contenedor.innerHTML = Object.entries(grupos).map(([cat, items]) => `
    <div class="servicios-grupo">
      <h3 class="servicios-categoria">${escaparTexto(cat)}</h3>
      <div class="servicios-grid">
        ${items.map(s => `
          <article class="servicio-card">
            <h4>${escaparTexto(s.nombre)}</h4>
            <p>${escaparTexto(s.descripcion)}</p>
          </article>
        `).join('')}
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', cargarServiciosArmopa);
window.cargarServiciosArmopa = cargarServiciosArmopa;
// ===== Propiedades: sincronización con Supabase =====
const PROPS_BUCKET = 'propiedades';

function uploadPropFile(file, max) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const r = Math.min(1, (max || 1600) / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * r);
        c.height = Math.round(img.height * r);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(async (blob) => {
          try {
            const path = Date.now() + '-' + Math.random().toString(36).slice(2) + '.jpg';
            const { error } = await supabaseClient.storage.from(PROPS_BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
            if (error) { reject(error); return; }
            const pub = supabaseClient.storage.from(PROPS_BUCKET).getPublicUrl(path);
            resolve(pub.data.publicUrl);
          } catch (err) { reject(err); }
        }, 'image/jpeg', 0.82);
      };
      img.onerror = reject;
      img.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function toSupaRow(cityName, l) {
  return {
    local_id: l.id,
    ciudad: cityName,
    nombre: l.name || '',
    descripcion: l.desc || '',
    direccion: l.addr || '',
    tipo_operacion: l.op || 'renta',
    valor_renta: l.pRent || '',
    valor_venta: l.pSale || '',
    fotos: l.imgs || [],
    vendedor_nombre: l.sName || '',
    vendedor_whatsapp: l.sWa || '',
    vendedor_foto: l.sPhoto || '',
    activo: true
  };
}

let syncTimer = null;
function syncLoc() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    if (cur === null || sel < 0) return;
    const l = list()[sel];
    if (!l) return;
    const row = toSupaRow(cur, l);
    const { error } = await supabaseClient.from('propiedades').upsert(row, { onConflict: 'ciudad,local_id' });
    if (error) console.error('Error al sincronizar propiedad:', error);
  }, 600);
}
async function saveLocNow(successMsg) {
  if (cur === null || sel < 0 || !list()[sel]) { note('Selecciona o agrega una ubicación primero.'); return; }
  clearTimeout(syncTimer);
  persistLocalOnly();
  const row = toSupaRow(cur, list()[sel]);
  try {
    const { error } = await supabaseClient.from('propiedades').upsert(row, { onConflict: 'ciudad,local_id' });
    if (error) { note('Error al guardar: ' + error.message); return; }
    note(successMsg);
  } catch (err) {
    note('Error al guardar la ubicación.');
  }
}

async function cargarPropiedadesArmopa() {
  try {
    const { data: rows, error } = await supabaseClient
      .from('propiedades')
      .select('*')
      .eq('activo', true)
      .order('ciudad', { ascending: true })
      .order('creado_en', { ascending: true });
    if (error) { console.error('Error cargando propiedades:', error); return; }
    const nuevo = {};
    (rows || []).forEach((row) => {
      if (!nuevo[row.ciudad]) nuevo[row.ciudad] = [];
      nuevo[row.ciudad].push({
        id: row.local_id,
        name: row.nombre || '',
        addr: row.direccion || '',
        desc: row.descripcion || '',
        op: row.tipo_operacion || 'renta',
        pRent: row.valor_renta || '',
        pSale: row.valor_venta || '',
        imgs: row.fotos || [],
        sPhoto: row.vendedor_foto || '',
        sName: row.vendedor_nombre || '',
        sWa: row.vendedor_whatsapp || ''
      });
    });
    data = nuevo;
  persistLocalOnly();
const { data: covers } = await supabaseClient.from('ciudades_portada').select('*');
cityCovers = {};
(covers || []).forEach(c => {
  cityCovers[c.ciudad] = c.foto;
  if (!data[c.ciudad]) data[c.ciudad] = [];
});
buildCityCards();
    if (!pModal.hidden) render();
  } catch (err) {
    console.error('Error cargando propiedades:', err);
  }
}
document.addEventListener('DOMContentLoaded', cargarPropiedadesArmopa);
window.cargarPropiedadesArmopa = cargarPropiedadesArmopa;