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
    aboutT1: "En ARMOPA transformamos la búsqueda de propiedades en una experiencia estratégica y personalizada. Somos una firma de consultoría inmobiliaria y de Servicios Profesionales Integrados dedicada a conectar a nuestros clientes con espacios excepcionales que elevan su estilo de vida y aseguran su patrimonio. Nuestro compromiso se fundamenta en la Lealtad, transparencia, integridad usando la innovación de mercado y una profunda experiencia sectorial, garantizando decisiones de inversión sólidas, transparentes y de alto valor a largo plazo.", aboutT2: "Te orientamos para encontrar el espacio ideal, de forma inteligente, el punto donde la tecnología inmobiliaria y el trato humano se encuentran. Nos especializamos en simplificar el proceso de compra, venta y alquiler de propiedades mediante un ecosistema digital avanzado y un equipo de expertos siempre a tu disposición. Nos apasiona optimizar tu tiempo y maximizar tus oportunidades de inversión, ofreciendo un servicio ágil, transparente y diseñado a la medida de las demandas del mercado actual.", aboutT3: "Entendemos que una propiedad es mucho más que cuatro paredes: es el escenario de tus próximos grandes recuerdos y el pilar de tu estabilidad familiar. Con años de trayectoria en el sector, nos enorgullece ser los aliados de confianza de cientos de familias en la búsqueda de su hogar ideal. Nos distingue un servicio de asesoría honesto, empático y profesional, diseñado para acompañarte con absoluta seguridad en cada paso del camino.", quoteH: "Solicitar cotización", quoteSub: "Completa tus datos y elige cómo enviarlos: por WhatsApp o por correo. Se abrirá con la información lista para enviarnos.", qName: "Nombre del contacto / cliente", qNamePh: "Nombre completo", qPhone: "Teléfono de contacto", qPhonePh: "+502 0000 0000", qAddr: "Dirección del servicio", qAddrPh: "Zona, colonia, calle o referencia", qBudget: "Presupuesto asignado", qBudgetPh: "Ej. Q 500,000", qMsgBudget: "Presupuesto asignado: ", qPromotor: "Promotor de negocio", qPromotorPh: "Selecciona un promotor", qMsgPromotor: "Promotor de negocio: ", qDate: "Fecha estimada del servicio", qBtn: "Solicitar cotización", qErr: "Completa todos los campos para solicitar la cotización.", qSvcType: "Tipo de servicio: ", qNum: "No. de cotización: ", qQuoteDate: "Fecha de cotización: ", qNoSvc: "Aún no has seleccionado ningún servicio", qMsgH: "Hola, deseo solicitar una cotización.", qMsgName: "Nombre: ", qMsgPhone: "Teléfono: ", qMsgAddr: "Dirección del servicio: ", qMsgDate: "Fecha estimada del servicio: ", xNeed: "Describe tu requerimiento", xNeedPh: "Cuéntanos qué necesitas: medidas, materiales, urgencia u otros detalles…", xAddr: "Dirección del lugar", xAddrPh: "Zona, colonia, calle o referencia", xQuote: "Adjuntar cotización (PDF)", xQuoteBtn: "📎 Subir PDF", xQuoteBtnLbl: "Subir cotización PDF", xQuoteNone: "Sin adjuntar", xQuoteDate: "Fecha de la cotización", xQuoteGoto: "Ir a Solicitar cotización", xQuoteGotoLbl: "Solicitar cotización", xTime: "Tiempo estimado", xTimePh: "Ej. 2 semanas, 1 mes o una fecha aproximada", xImgs: "Subir y visualizar imágenes", xHint: "Puedes seleccionar varias imágenes (JPG o PNG). Se guardan en este navegador; adjúntalas en WhatsApp al enviar la cotización.", qMsgSvc: "Servicios solicitados:", qMsgTime: "Tiempo estimado: ", qMsgAddrSvc: "Dirección: ", qMsgQuote: "Cotización adjunta: ", qMsgImgs: "Imágenes: {n} (las adjunto en este chat)", qEmail: "Correo electrónico", qEmailPh: "nombre@correo.com", qMsgEmail: "Correo: ", qBtnMail: "Enviar por correo", qErrEmail: "Escribe un correo electrónico válido.", qMailSubj: "Solicitud de cotización", xStart: "Fecha estimada de inicio", qMsgStart: "Fecha estimada de inicio: ", xPrio: "Prioridad", xPrioAlta: "Alta", xPrioMedia: "Media", xPrioBaja: "Baja", qMsgPrio: "Prioridad: ", xEstBtn: "Calcular Presupuesto Estimado", xEstHide: "Ocultar presupuesto", xEstTitle: "Presupuesto estimado (referencial, Guatemala)", qMsgEst: "Presupuesto estimado: ", ctImgAlt: "ARMOPA: compra y venta de propiedades en todo el país. Nosotros somos la solución.", aiAlt: "Inteligencia artificial y tecnología inmobiliaria", homeAlt: "Hogar ideal: una casa en manos protectoras", xEstStale: "Calculado con la descripción de la necesidad y el tiempo estimado que ingresaste. Si cambias algo, presiona \"Calcular Presupuesto Estimado\" otra vez.", mkBtn: "Costos alrededor", mkTitle: "Valores de propiedades similares en la zona (referencial)", mkHide: "Ocultar", mkSimilar: "Propiedades similares (referencia)", mkAround: "Zonas alrededor (referencia)", mkUse: "Usar estos valores en los campos de valor", salonAlt: "Rentamos o vendemos: una mano sostiene casas con símbolos de dólar", budgetAlt: "Presupuesto e inversión inmobiliaria: monedas apiladas y una casa", buyAlt: "Compra de propiedad: unas llaves y una casa en las manos", remodelAlt: "Hogar inteligente: tecnología y remodelación de una propiedad", landAlt: "Construcción en tu terreno: un hombre frente a un campo con el plano de su futura casa dibujado", projAlt: "Desarrollo de tu proyecto: vista aérea de un desarrollo urbano con plaza, edificios y áreas verdes", aboutH1: 'Administración inmobiliaria con visión profesional e inteligente,', aboutH2: 'Segura, Transparente, Íntegra, Responsable, Leal a la Vanguardia con Honradez', aboutH3: 'haciendo que tu inversión crezca a niveles inimaginables.',
    invH: 'Tu Inversión:', invSub: 'Inversión Garantizada:', invItems: ['Compra y venta', 'Alquileres Diversos', 'Integramos administración', 'Remodelación', 'Construcción / Remodelación', 'Desarrollo de proyectos con gestión practica de rentabilidad'], aboutP: 'Integramos administración, compra y venta, alquileres, remodelación, construcción y desarrollo de proyectos para ofrecer una gestión práctica y ordenada de cada propiedad.',
    svH: 'Tus Servicios:', svA: 'Servicios Profesionales coordinados', svItems: ['Alquiler de maquinaria pesada', 'Renta de Camiones para extracción', 'Renta de apartamentos y Edificio', 'Mantenimiento de Edificios', 'Plomería y electricidad', 'Asesoría Jurídica', 'Gestión de Préstamos Bancarios', 'Movimiento de Tierra'],
    propH: 'Propiedades exclusivas en Guatemala', catalog: 'Buscar Propiedades', prev: 'Propiedad anterior', next: 'Siguiente propiedad',
    places: ['Ciudad de Guatemala', 'Lago de Atitlán', 'Antigua Guatemala', 'Petén', 'Zona 10'],
    alts: ['Propiedad de lujo en Ciudad de Guatemala', 'Propiedad de lujo en Lago de Atitlán', 'Propiedad de lujo en Antigua Guatemala', 'Propiedad de lujo en Petén', 'Propiedad premium en Zona 10'],
    goTo: 'Ir a la posición ',
    openProp: 'Ver ubicaciones de ', noLocs: 'Sin ubicaciones todavía', oneLoc: '1 ubicación', locsWord: 'ubicaciones',
    addLoc: 'Agregar ubicación', locDefault: 'Ubicación', emptyH: 'Aún no hay ubicaciones', emptyP: 'Agrega la primera para subir sus imágenes y su dirección.',
    nameL: 'Nombre de la ubicación', zoom: 'Ver foto del vendedor en tamaño original', zoomToggle: 'Alternar entre ajustar a la pantalla y tamaño real', opL: 'Tipo de operación', opRent: 'Renta', opSale: 'Venta', opBoth: 'Renta o venta', rentL: 'Valor de renta', saleL: 'Valor de la propiedad (venta)', rentPh: 'Ej. Q 4,500 al mes', salePh: 'Ej. Q 850,000', opHint: 'Elige el tipo de operación para indicar los valores.', viewOpRent: 'En renta', viewOpSale: 'En venta', viewOpBoth: 'En renta o venta', rentView: 'Renta', saleView: 'Precio de venta', sellerH: 'Vendedor', sellerFotoHint: 'La fotografía se completa automáticamente al elegir el vendedor de la lista.', sellerSuperAdminHint: 'Solo el super administrador puede modificar el vendedor de esta ubicación.', sellerName: 'Nombre del vendedor', sellerWa: 'WhatsApp del vendedor', waHint: 'Incluye el código de país, por ejemplo +502. Si escribes 8 dígitos se agrega el 502 automáticamente.', sellerLabel: 'Contacto del vendedor', waBtn: 'Contactar por WhatsApp', waMsg: 'Hola, me interesa la propiedad: ', descL: 'Descripción de la propiedad', descPh: 'Características, habitaciones, amenidades, precio y cualquier detalle importante…', descH: 'Descripción', addrL: 'Dirección o enlace de Google Maps', photo: 'Imagen ', photosH: 'Imágenes de la ubicación', upload: 'Subir imágenes',
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
    ext: ['Alquiler de maquinaria pesada', 'Renta de camiones para extracción', 'Renta de apartamentos y edificios', 'Mantenimiento de edificios', 'Plomería y electricidad', 'Asesoría jurídica', 'Gestión de Préstamos Bancarios', 'Movimiento de tierra', 'Administración de Bienes Inmuebles'],
    ctaH: '¿Tienes una propiedad o un proyecto?', ctaP: 'Conversemos sobre la mejor forma de administrarlo, desarrollarlo o hacerlo crecer.', ctaBtn: 'Contáctanos',
    ctH: 'Hablemos de tu próximo proyecto', ctP: 'Atención personalizada para propietarios, compradores, inversionistas e inquilinos o clientes especiales. Contáctanos y te responderemos lo antes posible.',
    phoneL: 'Teléfono', mailL: 'Correo',
    fName: 'Nombre completo', fMail: 'Correo electrónico', fPhone: 'Teléfono', fReason: 'Motivo de contacto', fMsg: 'Cuéntanos qué necesitas',
    r1: 'Comprar / vender', r2: 'Administrar propiedad', r3: 'Desarrollo de proyecto', r4: 'Servicios externos',
    send: 'Enviar solicitud', sentMsg: 'Modo demostración: conecta este formulario a tu correo o CRM para recibir solicitudes.',
    fAtt: 'Atención', fFollow: 'Síguenos', rights: 'Todos los derechos reservados.',
    cUser: 'Usuario', cPass: 'Clave', cCode: 'Código / Propiedad', cGo: 'Ingresar',
    cMsg: 'Acceso de demostración: conecta este formulario a tu sistema de usuarios.',
    adminUsersBtn: 'Administrar usuarios', logoutBtn: 'Salir', connectBtn: 'Conectarse',
    adminMenuBtn: 'Administración', adminMenuProp: 'Propiedades', adminMenuProy: 'Proyectos', adminMenuServ: 'Servicios', adminMenuVend: 'Vendedores',
    adminGrpCatalogos: 'Catálogos', adminGrpNegocios: 'Negocios', adminGrpComisiones: 'Comisiones', adminGrpReportes: 'Reportes',
    adminMenuIngresoCiudades: 'Ingreso de Ciudades', adminMenuIngresoPropiedades: 'Ingreso de Propiedades', adminMenuClientes: 'Clientes', adminMenuCitas: 'Citas', adminMenuAgendaCitas: 'Agenda de citas', adminMenuTiposComision: 'Tipos de comisión', adminMenuRotVisual: 'Rotación Visual',
    adminMenuComisionesVentas: 'Comisiones Ventas', adminMenuComisionesGeneradas: 'Comisiones Generadas', adminMenuComisionesPagadas: 'Comisiones Pagadas',
    adminMenuRepProp: 'Listado de Propiedades', adminMenuRepServ: 'Estado de Servicios', adminMenuRepClientes: 'Seguimiento Clientes',
    carHint: 'Presione la imagen para ver las propiedades de la ciudad.', btnBuscarServ: 'Buscar servicios',
    catalogHtml: '🔍 Buscar propiedades', btnBuscarServHtml: '🔧 Buscar servicios',
    rotVisualTitle: 'Rotación Visual', rotVisualHint: 'Presione la propiedad para ver las fotos y detalles', rotVisualVolver: '← Volver a todas las propiedades', rotVisualVolverCiudades: '← Volver a las ciudades', rotVisualEmpty: 'No hay propiedades con fotografías para mostrar.', rotVisualLoadErr: 'No se pudo cargar la rotación visual.',
    rotVisualCiudad: 'Ciudad', rotVisualTipo: 'Tipo de Propiedad', rotVisualTodas: 'Todas',
    rotVisualRenta: 'Renta', rotVisualPrecioVenta: 'Precio de venta', rotVisualDescripcion: 'Descripción', rotVisualContactoVendedor: 'Contacto del vendedor', rotVisualWa: 'Contactar por WhatsApp',
    visionTitle: 'Nuestra Visión',
    visionLead: 'Ser un grupo inmobiliario de referencia, reconocido por la integridad, transparencia y excelencia en la gestión de bienes inmuebles, ofreciendo soluciones integrales que protejan y fortalezcan el patrimonio de nuestros clientes.',
    visionBody: 'Desde 2001, construimos relaciones de confianza mediante servicios de compra, venta, renta, administración, asesoría legal, construcción y remodelación, extendiendo nuestra experiencia a nuestros paisanos en el extranjero para facilitar la gestión y el crecimiento de su patrimonio en Guatemala.',
    missionTitle: 'Nuestra Misión',
    missionLead: 'Brindar soluciones inmobiliarias integrales con excelencia, transparencia e integridad, acompañando a nuestros clientes en cada etapa de sus proyectos.',
    missionBody: 'Protegemos, transformamos y hacemos crecer su patrimonio, con presencia en Guatemala y proyección internacional.',
    txHead1: 'Decisiones inteligentes.<br>Patrimonios que trascienden.',
    txList1: ['Consultoría estratégica', 'Inversión inmobiliaria', 'Protección del patrimonio', 'Visión de largo plazo', 'Profesionalismo y confianza'],
    txHead2: 'Tecnología que conecta.<br>Personas que te orientan.',
    txList2: ['Simplificamos tu camino inmobiliario.', 'Encuentra mejor. Decide inteligente.', 'Tu espacio ideal, de forma inteligente.', 'Conectamos oportunidades con tus necesidades.', 'Inteligencia inmobiliaria a tu alcance.'],
    txHead3: 'Hogares que inspiran.<br>Confianza que perdura.',
    txList3: ['Mucho más que paredes, tu próximo hogar.', 'Espacios para tus mejores recuerdos.', 'Construyendo el escenario de tu vida.', 'Tu aliado de confianza en cada paso.', 'Asesoría honesta para tu hogar ideal.'],
    /* ===== Footer / tagline ===== */
    ftrTagline: 'Administración Inmobiliaria',
    /* ===== Widget "Cotizar" (guardar/modificar/eliminar) ===== */
    qSaveBtnHtml: '💾 Guardar', qModifyBtnHtml: '🔄 Modificar', qDeleteBtnHtml: '🗑️ Eliminar',
    /* ===== Carga / error / vacío: servicios y listados ===== */
    cargandoServicios: 'Cargando servicios...', cargando: 'Cargando…', proximamente: 'Próximamente.',
    errCargarServicios: 'No pudimos cargar los servicios en este momento.', noHayServiciosDisponibles: 'No hay servicios disponibles',
    seleccionaServicio: 'Selecciona un servicio…', eligeServicioLista: 'Elige un servicio de la lista.',
    nuestrosServicios: 'Nuestros servicios', btnBuscar: 'Buscar',
    /* ===== Precalificación bancaria (préstamo) ===== */
    pqBtnLabel: 'Datos para precalificar un préstamo',
    pqTitle: 'Requisitos generales para precalificación bancaria en Guatemala',
    pqOcultar: 'Ocultar',
    pqIntro: 'Elige el tipo de solicitante, completa los datos, adjunta los documentos en PDF que ya tengas y guarda tu expediente. Puedes volver después a actualizarlo o completar los documentos que falten.',
    pqTipoSolicitante: 'Tipo de solicitante',
    pqPersonaIndividual: 'Persona Individual', pqPersonaJuridica: 'Persona Jurídica (Empresa)',
    pqTusDatos: 'Tus datos', pqDatosEmpresa: 'Datos de la empresa',
    pqBanco: 'Banco de preferencia', pqSelecciona: 'Selecciona…',
    pqBancoOtro: 'Otro',
    pqMontoSolicitado: 'Monto solicitado (Q)', pqMontoPh: 'Ej. 250,000', pqMontoPhJ: 'Ej. 500,000',
    pqDestinoCredito: 'Destino del crédito',
    pqDestVivienda: 'Vivienda', pqDestVehiculo: 'Vehículo', pqDestConsumo: 'Consumo Personal',
    pqDestCapitalTrabajo: 'Capital de trabajo', pqDestCompraEquipo: 'Compra de equipo', pqDestExpansion: 'Expansión del negocio',
    pqTipoPerfil: 'Tipo de perfil', pqPerfilAsalariado: 'Asalariado', pqPerfilIndependiente: 'Independiente',
    pqDpi: 'DPI (13 dígitos)', pqNit: 'NIT', pqNitPh: 'Ej. 1234567-8',
    pqTelefono: 'Teléfono celular', pqCorreo: 'Correo electrónico', pqCorreoPhEmpresa: 'nombre@empresa.com',
    pqEscolaridad: 'Grado de escolaridad',
    pqEscSin: 'Sin estudios', pqEscPrimaria: 'Primaria', pqEscBasicos: 'Básicos', pqEscDiversificado: 'Diversificado',
    pqEscTecnico: 'Técnico', pqEscUniversitario: 'Universitario', pqEscPostgrado: 'Postgrado (Maestría / Doctorado)', pqEscOtro: 'Otro',
    pqProfesion: 'Profesión / Ocupación', pqProfesionPh: 'Ej. Maestro, comerciante, ingeniero…',
    pqIdentidad: 'Identidad', pqIngresos: 'Ingresos', pqEstabilidadLaboral: 'Estabilidad laboral',
    pqDocLegalesEmpresa: 'Documentos legales de la empresa', pqRepLegalFinanzas: 'Representante legal y finanzas',
    pqRazonSocial: 'Razón social / Nombre de la empresa', pqRazonSocialPh: 'Ej. Inversiones ABC, S.A.',
    pqNitEmpresa: 'NIT de la empresa',
    pqRepNombre: 'Nombre del representante legal', pqNombreCompletoPh: 'Nombre completo',
    pqRepDpi: 'DPI del representante legal (13 dígitos)',
    pqSubirPdfHtml: '📎 Subir PDF', pqSinGuardar: 'Sin guardar aún',
    pqDocDpi: 'DPI (Documento Personal de Identificación) vigente', pqDocNit: 'Número de NIT',
    pqDocBoletas: 'Si eres asalariado: boletas o constancia de salario de los últimos 3 meses',
    pqDocEstadosCuenta: 'Estados de cuenta bancarios recientes (usualmente los últimos 3 a 6 meses)',
    pqDocPatenteIsr: 'Si eres independiente: patente de comercio y declaraciones de ISR',
    pqDocCartaTrabajo: 'Carta de trabajo que indique el tiempo laborado en la empresa',
    pqDocAntiguedad: 'Antigüedad laboral (muchos bancos piden al menos 1 año en el empleo actual)',
    pqDocHistorial: 'Historial crediticio favorable (consulta en buró de crédito)',
    pqDocPatenteComercioEmpresa: 'Patente de Comercio de Empresa',
    pqDocPatenteSociedad: 'Patente de Comercio de Sociedad (si aplica)',
    pqDocEscrituraConstitucion: 'Escritura de Constitución de la Sociedad',
    pqDocRtu: 'RTU (Registro Tributario Unificado) de la empresa',
    pqDocDpiRepresentante: 'DPI del Representante Legal vigente',
    pqDocNombramientoRepresentante: 'Nombramiento del Representante Legal (vigente)',
    pqDocPatenteComercioSociedadRep: 'Patente de Comercio y Sociedad',
    pqDocEstadosFinancieros: 'Estados Financieros de la empresa (último periodo)',
    pqAviso: 'Esta información es de carácter general y orientativo; no sustituye la evaluación oficial de cada banco. Con gusto te ayudamos a reunir y organizar estos documentos.',
    pqGuardarHtml: '💾 Guardar', pqActualizarHtml: '🔄 Actualizar', pqEliminarHtml: '🗑️ Eliminar',
    pqDescargarPdf: 'Descargar documentos en PDF',
    pqMsgGuardando: 'Guardando…',
    pqMsgErrorActualizar: 'Error al actualizar: ',
    pqMsgActualizadoExito: 'Expediente actualizado con éxito.',
    pqMsgErrorGuardar: 'Error al guardar: ',
    pqMsgGuardadoExito: 'Expediente guardado con éxito. Ya puedes subir tus documentos en PDF.',
    pqMsgErrorGuardarExpediente: 'Error al guardar el expediente.',
    pqMsgNoHayExpediente: 'No hay ningún expediente guardado todavía.',
    pqConfirmEliminar: '¿Eliminar este expediente y todos sus documentos adjuntos? Esta acción no se puede deshacer.',
    pqMsgErrorEliminar: 'Error al eliminar: ',
    pqMsgEliminadoExito: 'Expediente eliminado con éxito.',
    pqMsgErrorEliminarExpediente: 'Error al eliminar el expediente.',
    pqMsgCompletaEmpresa: 'Completa todos los campos de "Datos de la empresa" antes de guardar.',
    pqMsgDpiRepresentante13: 'El DPI del representante legal debe tener 13 dígitos.',
    pqMsgCompletaTusDatos: 'Completa todos los campos de "Tus datos" antes de guardar.',
    pqMsgDpi13: 'El DPI debe tener 13 dígitos.',
    pqMsgSubido: '✅ Subido', pqMsgSubiendoEllipsis: 'Subiendo…', pqMsgSubidoNombre: '✅ Subido: ',
    pqMsgPrimeroGuarda: 'Primero guarda tus datos (botón "Guardar") antes de subir documentos.',
    pqMsgSoloPdf: 'Solo se permiten archivos PDF.',
    pqMsgErrorGuardarDoc: 'Error al guardar el documento: ',
    pqMsgErrorGuardarCorto: 'Error al guardar',
    pqMsgDocumentoSubidoExito: 'Documento subido con éxito.',
    pqMsgErrorSubir: 'Error al subir',
    pqMsgErrorSubirPdf: 'Error al subir el PDF.',
    pqMsgNoSePudoPdf: 'No se pudo generar el PDF. Recarga la página e inténtalo de nuevo.',
    pqPdfTituloJuridica: 'Requisitos para precalificación bancaria — Persona Jurídica (Empresa)',
    pqPdfTituloIndividual: 'Requisitos para precalificación bancaria — Persona Individual',
    pqPdfFooter: 'Generado el ', pqPdfFooter2: ' — Este listado es de carácter general y orientativo.',
    pqPdfSubtitle: 'ARMOPA — Administración Inmobiliaria',
    pqBancoLista: ['Crédito Hipotecario Nacional de Guatemala (CHN)', 'Banco de los Trabajadores (Bantrab)', 'Banco Cuscatlán Guatemala', 'Banco Industrial', 'Banco de Desarrollo Rural (Banrural)', 'Banco Internacional', 'Citibank, N.A. Sucursal Guatemala', 'Vivibanco', 'Banco Ficohsa Guatemala', 'Banco Promerica', 'Banco de Antigua', 'Banco de América Central (BAC)', 'Banco Agromercantil de Guatemala (BAM)', 'Banco G&T Continental', 'Banco Azteca de Guatemala', 'Banco INV', 'Banco Credicorp', 'Banco Nexa', 'Banco Multimoney'],
    /* ===== Admin: acciones genéricas compartidas ===== */
    btnModificar: 'Modificar', btnGuardar: 'Guardar', btnEliminar: 'Eliminar', btnCancelar: 'Cancelar', btnBuscarAdmin: 'Buscar', btnMostrar: 'Mostrar', btnActualizarHtml: '🔄 Actualizar',
    adminSinNombre: 'Sin nombre', adminCargandoPuntos: 'Cargando…', adminSelecciona: 'Selecciona…',
    adminConfirmEliminarGenerico: '¿Eliminar este registro? Esta acción no se puede deshacer.',
    adminErrorGuardarCambio: 'No se pudo guardar el cambio.',
    /* ===== Admin: Propiedades / Proyectos / Servicios (listados) ===== */
    admEstado: 'Estado', admFechaCambio: 'Fecha de cambio', admUsuarioCambia: 'Usuario que cambia', admVendedorAsignado: 'Vendedor asignado', admPctComision: '% Comisión', admValorComision: 'Valor de comisión',
    admEstadoUbicacion: 'Estado de ubicación', admPlaceholderVendedorAsignado: 'Vendedor asignado',
    admConfirmEliminarUbicacion: '¿Eliminar esta ubicación? Esta acción no se puede deshacer.', admErrorEliminarUbicacion: 'No se pudo eliminar la ubicación.',
    admNoHayUbicaciones: 'No hay ubicaciones que coincidan con la búsqueda.',
    admTodasLasCiudades: 'Todas las ciudades', admTodasLasUbicaciones: 'Todas las ubicaciones', admTodosLosEstados: 'Todos los estados', admTodosLosVendedores: 'Todos los vendedores', admTodosLosPromotores: 'Todos los promotores de negocio',
    admCliente: 'Cliente', admDescripcionRealizar: 'Descripción a realizar', admValor: 'Valor', admPrioridad: 'Prioridad', admNumSolicitud: 'No. de solicitud', admPromotorNegocios: 'Promotor de Negocios',
    admFechaCambioEstado: 'Fecha de cambio de estado', admSinDefinir: 'Sin definir', admPrioridadAlta: 'Alta', admPrioridadMedia: 'Media', admPrioridadBaja: 'Baja',
    admConfirmEliminarSolicitud: '¿Eliminar esta solicitud de servicio? Esta acción no se puede deshacer.', admErrorEliminarSolicitud: 'No se pudo eliminar la solicitud.',
    admNoHayProyectos: 'No hay proyectos que coincidan con la búsqueda.', admTodosLosProyectos: 'Todos los proyectos',
    admSeleccionaPromotor: 'Selecciona un promotor', admNoEstaEnVendedores: ' (no está en Vendedores)',
    admNoNumSolicitud: 'No. de solicitud', admNombreCliente: 'Nombre del cliente', admFechaSolicitud: 'Fecha de solicitud', admUsuarioModifica: 'Usuario Modifica', admValorDelServicio: 'Valor del servicio',
    admTodosLosServicios: 'Todos los servicios', admSinSolicitudesRegistradas: 'Sin solicitudes registradas', admErrorAlCargar: 'Error al cargar', admNoSePudoCargarLista: 'No se pudo cargar la lista.',
    admTodosLosRegistros: 'Todos los registros (', admSolicitudEncontrada: ' solicitud encontrada', admSolicitudesEncontradas: ' solicitudes encontradas',
    admEligeRegistroLista: 'Elige un registro de la lista para ver su información.', admNoHaySolicitudesCoinciden: 'No hay solicitudes que coincidan con la búsqueda.',
    admNoSePudoCargarSolicitudes: 'No se pudo cargar la información de las solicitudes.', admNoSeEncontroSolicitud: 'No se encontró la solicitud.', admNoSePudoCargarSolicitud: 'No se pudo cargar la información de la solicitud.',
    admServicioSinEspecificar: 'Servicio sin especificar', admSinPropiedadAsignada: 'Sin propiedad asignada',
    /* ===== Admin: Vendedores ===== */
    admFoto: 'Foto', admCodigoVendedor: 'Código de vendedor', admNombre: 'Nombre', admTelefono: 'Teléfono', admDireccion: 'Dirección', admFechaInicio: 'Fecha inicio', admFechaGrabacion: 'Fecha de grabación', admUsuario: 'Usuario',
    admBancoDePago: 'Banco de pago', admNumeroCuentaBancaria: 'Número de cuenta bancaria', admTipoCuenta: 'Tipo de cuenta', admPctComisionVentas: '% Comisión por ventas',
    admVendedorSinNombre: 'Vendedor sin nombre', admCodigoSeAsigna: 'Se asigna al guardar', admCodigoSeAsignaAutomatico: 'Se asigna automáticamente al guardar',
    admSeAsignaAutomaticoFecha: 'Se asigna automáticamente al guardar (', admUsuarioActualFallback: 'usuario actual', admSeGrabaAutomaticamente: 'Se graba automáticamente (',
    admSubirFoto: 'Subir foto', admSubiendoFoto: 'Subiendo…', admQuitarFoto: 'Quitar foto', admPlaceholderNombreVendedor: 'Nombre del vendedor', admPlaceholderDireccion: 'Dirección',
    admConfirmEliminarVendedor: '¿Eliminar este vendedor? Esta acción no se puede deshacer.', admErrorEliminarVendedor: 'No se pudo eliminar el vendedor.', admErrorSubirFoto: 'No se pudo subir la foto.',
    admEscribeNombreVendedor: 'Escribe el nombre del vendedor.', admErrorGuardarVendedor: 'No se pudo guardar el vendedor.',
    admNoHayVendedores: 'No hay vendedores que coincidan con la búsqueda.', admBuscarPorNombrePh: 'Buscar por nombre', admAgregarVendedor: '+ Agregar vendedor',
    admMonetaria: 'Monetaria', admAhorros: 'Ahorros', admTransferencia: 'Transferencia', admCheque: 'Cheque', admEfectivo: 'Efectivo',
    /* ===== Admin: Tipos de comisión ===== */
    admNegocio: 'Negocio', admTipoSinNombre: 'Tipo sin nombre', admPctComisionDefecto: '% Comisión por defecto', admPlaceholderNombreTipoComision: 'Ej. Venta directa, Remodelación…',
    admConfirmEliminarTipoComision: '¿Eliminar este tipo de comisión? Esta acción no se puede deshacer.', admErrorEliminarTipoComision: 'No se pudo eliminar el tipo de comisión.',
    admEscribeNombreTipoComision: 'Escribe el nombre del tipo de comisión.', admSeleccionaNegocio: 'Selecciona el negocio.', admErrorGuardarTipoComision: 'No se pudo guardar el tipo de comisión.',
    admNoHayTiposComision: 'No hay tipos de comisión que coincidan con la búsqueda.', admAgregarTipoComision: '+ Agregar tipo de comisión', admTodosLosNegocios: 'Todos los negocios',
    admNegocioPropiedades: 'Propiedades', admNegocioProyectos: 'Proyectos', admNegocioServicios: 'Servicios',
    /* ===== Admin: Ingreso de Ciudades / Propiedades ===== */
    admNuevaCiudad: '+ Nueva ciudad', admBuscarCiudadPh: 'Buscar ciudad...', admNoSeEncontraronCiudades: 'No se encontraron ciudades.',
    admNombreCiudadLbl: 'Nombre de la ciudad', admNombreCiudadPh: 'Ej. Cobán', admFotoPortadaOpcional: 'Foto de portada (opcional)', admElegirFotoHtml: '📷 Elegir foto',
    admEscribeNombreCiudad: 'Escribe el nombre de la ciudad.', admGuardandoEllipsis: 'Guardando…', admErrorGuardarGenerico: 'Error al guardar: ', admErrorGuardarCiudad: 'Error al guardar la ciudad.',
    admCiudadYFotoGuardadas: 'Ciudad y foto guardadas con éxito.', admCiudadAgregada: 'Ciudad agregada con éxito.',
    admIngresoPropiedadesTitulo: 'Ingreso de Propiedades', admEnQueCiudadPropiedades: '¿En qué ciudad vas a ingresar propiedades?',
    admCiudades: 'Ciudades', admAgregaPrimeraCiudad: 'Agrega tu primera ciudad', admCiudadesSufijo: 'ciudad(es)',
    admFotoPortada: 'Foto de portada', admActualizar: 'Actualizar', admNuevoNombreCiudad: 'Nuevo nombre para la ciudad:', admCiudadActualizada: 'Ciudad actualizada con éxito.', admErrorActualizarCiudad: 'Error al actualizar la ciudad: ', admErrorActualizarCiudadGenerico: 'Error al actualizar la ciudad.',
    admConfirmEliminarCiudad: '¿Eliminar la ciudad "', admConfirmEliminarCiudad2: '"? Esta acción no se puede deshacer.', admCiudadEliminada: 'Ciudad eliminada con éxito.', admErrorEliminarCiudad: 'Error al eliminar la ciudad: ', admErrorEliminarCiudadGenerico: 'Error al eliminar la ciudad.',
    admVolverCiudades: '← Ciudades', admBuscarUbicacionPh: 'Buscar ubicación por nombre, sector o zona...',
    admResultadosBusqueda: 'Resultados de tu búsqueda (', admVerTodasUbicaciones: 'Ver todas las ubicaciones', admNoSeEncontraronUbicaciones: 'No se encontraron ubicaciones para "',
    admSeleccionaOAgregaUbicacion: 'Selecciona o agrega una ubicación primero.', admUbicacionGuardadaExito: 'Ubicación guardada con éxito.', admUbicacionActualizadaExito: 'Ubicación actualizada con éxito.', admErrorGuardarUbicacion: 'Error al guardar la ubicación.',
    admGestionInterna: 'Gestión interna', admFechaCambioEstadoLbl: 'Fecha cambio de estado: ', admUsuarioCambiaEstadoLbl: 'Usuario que cambia el estado: ',
    admClienteAsignado: 'Cliente', admSinClienteAsignado: 'Sin cliente asignado',
    admLocSeccionAsignacion: 'Estado y asignación', admLocSeccionComision: 'Comisión',
    admTipoPropiedadLbl: 'Tipo de propiedad', admSectorLbl: 'Sector', admZonaLbl: 'Zona', admValorComisionLbl: 'Valor de comisión',
    ubicEstLabels: { activa: 'Activa', arrendada: 'Arrendada', vendida: 'Vendida', suspendida: 'Suspendida', baja: 'Baja' },
    solEstLabels: { solicitado: 'Solicitado', presupuesto_enviado: 'Enviado presupuesto', aprobado: 'Aprobado', en_proceso: 'En proceso', ejecutado: 'Ejecutado', anulado: 'Anulado' },
    ubicEstActiva: 'Activa', ubicEstArrendada: 'Arrendada', ubicEstVendida: 'Vendida', ubicEstSuspendida: 'Suspendida', ubicEstBaja: 'Baja',
    pTipoPh: 'Ej. Casa, Local comercial, Finca cafetalera…', pSectorPh: 'Ej. Cayalá, Vista Hermosa…', pZonaPh: 'Ej. Zona 10, Zona 4…',
    admPropTituloModal: 'Propiedades — Listado general', admPropSubtituloModal: 'Estado, seguimiento y comisión de cada ubicación registrada.',
    admProyTituloModal: 'Proyectos — Listado general', admProySubtituloModal: 'Seguimiento, vendedor y comisión de cada proyecto registrado.',
    admServTituloModal: 'Servicios — Listado general', admServSubtituloModal: 'Estado, vendedor y comisión de cada solicitud de servicio.',
    admVendTituloModal: 'Vendedores — Listado general', admVendSubtituloModal: 'Código, contacto y fotografía de cada vendedor registrado.',
    admCliTituloModal: 'Clientes — Listado general', admCliSubtituloModal: 'Código, contacto y datos de cada cliente registrado.',
    admCliVendedorAsignado: 'Vendedor asignado', admCliSinVendedor: 'Sin vendedor asignado',
    admCliSeccionContacto: 'Contacto', admCliSeccionUbicacion: 'Ubicación', admCliSeccionAdmin: 'Administrativo',
    btnSeguimientos: 'Seguimientos', btnVerActividades: 'Ver actividades',
    segTituloModal: 'Seguimientos', segSubtituloModal: 'Historial de llamadas y gestiones de',
    segFechaLlamada: 'Fecha de llamada', segVendedor: 'Vendedor', segAccion: 'Acción', segResultado: 'Resultado', segDescripcion: 'Descripción',
    segAccLlamada: 'Llamada', segAccVisita: 'Visita de propiedad', segAccServicio: 'Seguimiento de servicio',
    segResInteresado: 'Interesado', segResNoInteresado: 'No interesado', segResConfirmado: 'Confirmado', segResIndeciso: 'Indeciso',
    segPlaceholderDescripcion: 'Detalle de la llamada o gestión realizada', segSinVendedor: 'Sin vendedor',
    segAgregar: '+ Agregar seguimiento', segSinRegistros: 'Aún no hay seguimientos registrados para este cliente.',
    segConfirmEliminar: '¿Eliminar este seguimiento?', segErrorEliminar: 'No se pudo eliminar el seguimiento.', segErrorGuardar: 'No se pudo guardar el seguimiento.', segErrorCargar: 'No se pudieron cargar los seguimientos.',
    actTituloModal: 'Actividades del cliente', actSubtituloModal: 'Todo lo registrado en el sistema para',
    actSeccionCitas: 'Agendas de citas', actSeccionPropiedades: 'Propiedades en las que aparece', actSeccionServicios: 'Servicios en los que aparece', actSeccionSeguimientos: 'Seguimientos',
    actSinCitas: 'Sin citas registradas.', actSinPropiedades: 'Sin propiedades asignadas.', actSinServicios: 'Sin solicitudes de servicio registradas.', actSinSeguimientos: 'Sin seguimientos registrados.',
    actErrorCargar: 'No se pudieron cargar las actividades del cliente.',
    admAgregarCliente: '+ Agregar cliente', admCodigoCliente: 'Código de cliente', admDpi: 'DPI', admDepartamento: 'Departamento', admMunicipio: 'Municipio',
    admDetalleDireccion: 'Detalle dirección', admEstadoCliente: 'Estado', admEstCliActivo: 'Activo', admEstCliInactivo: 'Inactivo', admEstCliBaja: 'Baja', admEstCliInquilino: 'Inquilino', admEstCliPropietario: 'Propietario',
    admProfesion: 'Profesión',
    admClienteSinNombre: 'Cliente sin nombre', admPlaceholderNombreCliente: 'Nombre del cliente', admPlaceholderDpi: 'Número de DPI',
    admPlaceholderDetalleDireccion: 'Ej. Residenciales Las Flores, lote 12', admEscribeNombreCliente: 'Escribe el nombre del cliente.',
    admErrorGuardarCliente: 'No se pudo guardar el cliente.', admErrorEliminarCliente: 'No se pudo eliminar el cliente.',
    admConfirmEliminarCliente: '¿Eliminar este cliente? Esta acción no se puede deshacer.', admNoHayClientes: 'No hay clientes que coincidan con la búsqueda.',
    admAgeTituloModal: 'Agenda de citas', admAgeSubtituloModal: 'Consulta las citas agendadas por día, semana o mes.',
    admAgeVistaDia: 'Día', admAgeVistaSemana: 'Semana', admAgeVistaMes: 'Mes', admAgeHoy: 'Hoy',
    admAgeDetalleTitulo: 'Detalle de la cita', admAgeNoHayCitasDia: 'No hay citas agendadas para este día.',
    admAgeMasCitas: '+{n} más',
    admCitTituloModal: 'Citas — Consulta', admCitSubtituloModal: 'Consulta las citas realizadas con los filtros a continuación.',
    admCitTodosLosClientes: 'Todos los clientes', admCitTodosLosDepartamentos: 'Todos los departamentos', admCitTodosLosMunicipios: 'Todos los municipios',
    admCitFechaInicial: 'Fecha inicial', admCitFechaFinal: 'Fecha final', admCitNoHayCitas: 'No hay citas que coincidan con la búsqueda.',
    admCitErrorEliminar: 'No se pudo eliminar la cita.', admCitConfirmEliminar: '¿Eliminar esta cita? Esta acción no se puede deshacer.',
    admCitErrorGuardar: 'No se pudo guardar la cita.',
    admTipoComTituloModal: 'Tipos de comisión — Catálogo', admTipoComSubtituloModal: 'Tipos de comisión según el negocio: Propiedades, Proyectos o Servicios.',
    admFechaInicioServicioLabel: 'Fecha inicial del servicio', admFechaFinServicioLabel: 'Fecha final del servicio', admListaRegistrosLabel: 'Lista de registros',
    admSinFotosUbicacion: 'Todavía no hay fotos de esta ubicación.', admDescripcionPropiedad: 'Descripción Propiedad',
    admSeleccionaVendedor: 'Selecciona un vendedor',
    /* ===== Solicitud de Remodelación (fr-) ===== */
    frTitulo: 'Solicitud de Remodelación', frSubtitulo: 'Cuéntanos qué quieres remodelar y adjunta fotografías para que podamos ayudarte a planificar, coordinar y supervisar el proyecto.',
    frNombreCliente: 'Nombre Cliente', frDetalles: 'Detalles que se desean de la remodelación', frDetallesPh: 'Ej. Remodelar cocina y sala, cambiar piso, ampliar un cuarto…',
    frFotosActuales: 'Adjuntar fotografías (estado actual)', frFotosReferencia: 'Adjuntar fotografías (referencia / inspiración)', xSubirFotosHtml: '📷 Subir fotografías',
    frTiempoEstimado: 'Tiempo estimado de remodelación', frSelecciona: 'Selecciona…', frT12sem: '1 a 2 semanas', frT34sem: '3 a 4 semanas', frT12mes: '1 a 2 meses', frT36mes: '3 a 6 meses', frTMas6mes: 'Más de 6 meses', frTNoSeguro: 'No estoy seguro',
    frPresupuestoEstimado: 'Presupuesto estimado de remodelación (Q)', frEnviadaOk: 'Solicitud enviada correctamente. Gracias.',
    /* ===== Adaptamos tu presupuesto (pp-) ===== */
    ppSubtitulo: 'Cuéntanos qué deseas realizar y diseñaremos alternativas de acuerdo con tus necesidades y objetivos.', ppPresupuestoH: 'Presupuesto',
    ppValorPresupuesto: 'Valor del presupuesto (Q)', ppNombreCliente: 'Nombre del cliente', ppFecha: 'Fecha',
    ppQueDeseasRealizar: '¿Qué deseas realizar con una propiedad?', ppOpComprar: 'Comprar', ppOpRentar: 'Rentar', ppOpRemodelar: 'Remodelar', ppOpServiciosEspeciales: 'Servicios especiales', ppOpEmprendimiento: 'Emprendimiento financiero',
    ppDescribeRealizar: 'Describe lo que deseas realizar', ppDescribeRealizarPh: 'Cuéntanos con el mayor detalle posible qué necesitas…', ppAdjuntarPdf: 'Adjuntar PDF (opcional)',
    ppSeleccionaQueDeseas: 'Por favor selecciona qué deseas realizar con una propiedad.',
    /* ===== Mensajes compartidos: formularios de solicitud (fr/pp/cs) ===== */
    escribeNombreCliente: 'Por favor escribe el nombre del cliente.', errorEnviarSolicitud: 'No pudimos enviar tu solicitud. Intenta de nuevo.',
    soloArchivosPdf: 'Solo se permiten archivos PDF.', subiendoEllipsis: 'Subiendo…', errorSubirArchivo: 'Error al subir', subidoPrefix: 'Subido: ',
    /* ===== Construimos en tu terreno (cs-) ===== */
    csSubtitulo: 'Cuéntanos los datos generales de tu proyecto; con gusto te ayudamos con el diseño, el presupuesto y la ejecución.',
    csValorPresupuesto: 'Valor Presupuesto (Q)', csNombreCompleto: 'Nombre completo', csFechaInicioEstimada: 'Fecha de Inicio estimada',
    csQueDeseasHacer: 'Describe qué deseas hacer en la construcción', csQueDeseasHacerPh: 'Ej. Construir mi casa de habitación en un terreno propio de 300 mts2…',
    csMetrosCuadrados: 'Metros cuadrados', csDescribeConstruir: 'Describe lo que deseas construir', csDescribeConstruirPh: 'Ej. Casa moderna de un nivel, fachada blanca con detalles de madera, techo plano, ventanales grandes, 3 habitaciones…',
    csVistaIaAlt: 'Vista exterior generada con IA', csFotosTerreno: 'Fotografías del terreno (imágenes o PDF)', csSubirFotosPdfHtml: '📎 Subir fotografías / PDF',
    csReqBtnHtml: '📋 Requisitos para construir', csGenerarDisenoHtml: '🎨 Generar diseño con IA',
    csPasosTitulo: 'Pasos para construir una propiedad en Guatemala', csPasosSubtitulo: 'Esta guía fue generada con IA a partir del proceso habitual ante municipalidades, colegios profesionales y entidades de servicios en Guatemala. Es informativa y puede variar según el municipio y el tipo de proyecto.',
    csPaso1: '<b>Verificar el uso de suelo y el Plan de Ordenamiento Territorial (POT)</b><br><small>Confirma en la municipalidad que el terreno permite el tipo de construcción que deseas.</small>',
    csPaso2: '<b>Reunir la documentación legal del terreno</b><br><small>Escritura registrada, certificación del RGP y solvencia del IUSI al día.</small>',
    csPaso3: '<b>Contratar a un profesional colegiado (arquitecto o ingeniero civil)</b><br><small>Debe estar activo en el CIG (Colegio de Ingenieros) o CAG (Colegio de Arquitectos).</small>',
    csPaso4: '<b>Elaborar el anteproyecto y los planos</b><br><small>Diseño arquitectónico, planos estructurales, eléctricos e hidrosanitarios.</small>',
    csPaso5: '<b>Realizar un estudio de suelos</b><br><small>Recomendado para definir el tipo de cimentación adecuado.</small>',
    csPaso6: '<b>Gestionar la licencia municipal de construcción</b><br><small>Presentar planos, boleta de pago de arbitrios y demás requisitos ante la municipalidad correspondiente.</small>',
    csPaso7: '<b>Confirmar factibilidad de servicios</b><br><small>Agua, drenajes y energía eléctrica (EEGSA u otra distribuidora local).</small>',
    csPaso8: '<b>Iniciar la obra con bitácora y supervisión</b><br><small>Llevar bitácora de obra y supervisión periódica del profesional responsable.</small>',
    csPaso9: '<b>Solicitar la recepción de obra / permiso de habitabilidad</b><br><small>Trámite final ante la municipalidad al concluir la construcción.</small>',
    csPaso10: '<b>Registrar las mejoras en el Registro General de la Propiedad</b><br><small>Actualiza el valor y la descripción del inmueble ya construido.</small>',
    csPasosHint: 'Para tu caso particular, te recomendamos confirmar los pasos exactos con un profesional colegiado o con nuestro equipo.',
    csDescribePrimero: 'Por favor describe primero lo que deseas construir.', csEscribeNombreCompleto: 'Por favor escribe el nombre completo.',
    csGenerandoVista: 'Generando vista exterior con IA… esto puede tardar unos segundos.', csVistaGenerada: 'Vista exterior generada con IA (referencial):', csErrorGenerarVista: 'No pudimos generar la vista exterior en este momento. Intenta de nuevo más tarde.',
    /* ===== Admin: Comisiones Ventas / Generadas / Pagadas ===== */
    comVentasTituloModal: 'Comisiones Ventas — Listado general', comVentasSubtituloModal: 'Comisiones por vendedor, a partir de una fecha y por tipo.',
    comGenTituloModal: 'Comisiones Generadas — Listado general', comGenSubtituloModal: 'Comisiones ya generadas, su estado de pago y los datos de la operación bancaria.',
    comPagTituloModal: 'Comisiones Pagadas', comPagSubtituloModal: 'Historial de comisiones por vendedor, fecha y estado.',
    comTipoTodas: 'Todas', comTipoPropiedades: 'Propiedades', comTipoProyectos: 'Proyectos', comTipoServicios: 'Servicios',
    comLblVendedor: 'Vendedor', comLblFechaInicial: 'Fecha inicial', comLblFechaFinal: 'Fecha final', comLblTipoComision: 'Tipo de comisión', comLblEstado: 'Estado',
    comThDetalle: 'Detalle', comThFecha: 'Fecha', comThVendedor: 'Vendedor', comThPctComision: '% Comisión', comThValorComision: 'Valor de comisión', comThEstado: 'Estado', comThPagarComision: 'Pagar comisión',
    comSubtotalPrefix: 'Subtotal ', comGrupoPropiedades: 'Propiedades', comGrupoProyectos: 'Proyectos', comGrupoServicios: 'Servicios', comGrupoProyectosServicios: 'Proyectos y Servicios', comSinVendedor: '(Sin vendedor)',
    comTotalGenerado: 'Total de comisiones generadas', comTotalAPagar: 'Total de comisiones a pagar', comBtnGenerar: 'Generar Comisiones',
    comNoHayMarcadas: 'No hay comisiones marcadas para pagar.', comConfirmGenerar: '¿Confirmas generar {n} comisión(es) por un total de {v}?', comGenerando: 'Generando comisiones…',
    comGeneradasOk: 'Se generaron {n} comisión(es). Da seguimiento al pago en Comisiones Generadas.', comErrorGenerar: 'No se pudo generar la comisión. Intenta de nuevo.',
    comNoHayComisionesBusqueda: 'No hay comisiones que coincidan con la búsqueda.', comErrorCargarComisiones: 'No se pudo cargar la información de comisiones.',
    comEstPendiente: 'Pendiente de pago', comEstPagado: 'Pagado', comEstSuspendido: 'Suspendido', comEstAnulado: 'Anulado',
    comNoHayGeneradasBusqueda: 'No hay comisiones generadas que coincidan con la búsqueda.', comErrorCargarGeneradas: 'No se pudo cargar la información de comisiones generadas.',
    comLblBanco: 'Banco', comLblCuentaBancaria: 'Cuenta bancaria', comLblNumeroCheque: 'Número de cheque', comLblFechaPago: 'Fecha de pago', comLblFechaOperacion: 'Fecha operación', comLblUsuarioPaga: 'Usuario que paga', comLblFechaGenerada: 'Fecha generada',
    comResumenPagoPorVendedor: 'Resumen de pago por vendedor', comLblTotalPendiente: 'Total pendiente', comLblFormaPago: 'Forma de pago', comPlaceholderNumeroCuenta: 'Número de cuenta', comPlaceholderNumeroCheque: 'Número de cheque',
    comBtnPagar: 'Pagar', comConfirmPagar: '¿Confirmas el pago de {n} comisión(es) a {v} por un total de {t}?', comProcesando: 'Procesando…', comPagoRegistrado: 'Pago registrado.', comErrorPagoVendedor: 'No se pudo registrar el pago.', comErrorGuardarPct: 'No se pudo guardar el % de comisión.',
    comNoHayPagadasBusqueda: 'No hay comisiones que coincidan con la búsqueda.', comErrorCargarPagadas: 'No se pudo cargar la información de comisiones pagadas.',
    /* ===== Admin: Reportes ===== */
    repPropTituloModal: 'Reporte — Listado de Propiedades', repPropSubtituloModal: 'Inventario completo de propiedades y su estado.',
    repServTituloModal: 'Reporte — Estado de Servicios', repServSubtituloModal: 'Solicitudes de servicio y su estado actual.',
    repCliTituloModal: 'Reporte — Seguimiento Clientes', repCliSubtituloModal: 'Clientes registrados y el estado de sus citas agendadas.',
    repCliTodosLosClientes: 'Todos los clientes', repCliConCitas: 'Con citas', repCliSinCitas: 'Sin citas', repCliConProximaCita: 'Con próxima cita',
    repCliProximaCita: 'Próxima cita', repCliSinProximaCita: 'Sin próxima cita agendada', repCliTotalCitas: 'Total de citas',
    repCliUltimaCita: 'Última cita', repCliHistorialCitas: 'Historial de citas', repCliVerHistorial: 'Ver historial', repCliOcultarHistorial: 'Ocultar historial',
    repCliSinCitasTexto: 'Este cliente aún no tiene citas agendadas.',
    repLblCiudad: 'Ciudad', repLblTipoOperacion: 'Tipo de operación', repLblEstado: 'Estado', repLblPrioridad: 'Prioridad', repLblFechaInicial: 'Fecha inicial', repLblFechaFinal: 'Fecha final',
    repTodasLasCiudades: 'Todas las ciudades', repTodasLasOperaciones: 'Todas las operaciones', repTodosLosEstados: 'Todos los estados', repTodasLasPrioridades: 'Todas las prioridades',
    repOpRenta: 'Renta', repOpVenta: 'Venta', repOpAmbos: 'Renta y venta', repPrioAlta: 'Alta', repPrioMedia: 'Media', repPrioBaja: 'Baja',
    repBtnImprimirHtml: '🖨️ Imprimir', repBtnBuscarCliente: 'Buscar cliente', repBuscarClientePh: 'Buscar por nombre o usuario',
    repNoDataImprimir: 'No hay datos para imprimir. Primero presiona "Mostrar".', repVentanaBloqueada: 'El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para este sitio e inténtalo de nuevo.',
    repUsuarioLbl: 'Usuario: ',
    repNoHayPropiedadesBusqueda: 'No hay propiedades que coincidan con la búsqueda.', repErrorCargarPropiedades: 'No se pudo cargar el listado de propiedades.',
    repThNo: 'No.', repThNombreUbicacion: 'Nombre de ubicación', repThVendedor: 'Vendedor', repThTipoOperacion: 'Tipo de operación', repThValor: 'Valor', repThEstado: 'Estado', repThFechaCreacion: 'Fecha de creación', repThFotos: 'Fotos',
    repTituloReportePropiedades: 'Reporte — Listado de Propiedades',
    repNoHaySolicitudesServicioBusqueda: 'No hay solicitudes de servicio que coincidan con la búsqueda.', repErrorCargarServicios: 'No se pudo cargar el estado de servicios.',
    repSinTipoServicio: '(Sin tipo de servicio)', repTituloReporteServicios: 'Reporte — Estado de Servicios',
    repThCliente: 'Cliente', repThTelefono: 'Teléfono', repThNumSolicitud: 'N.° de solicitud', repThPrioridad: 'Prioridad', repThValor2: 'Valor', repThInicio: 'Inicio', repThFechaSolicitud: 'Fecha de solicitud',
    repCliNombreFallback: 'Cliente', repThCodigo: 'Código', repThRegistrado: 'Registrado', repThSolicitudesServicio: 'Solicitudes de servicio', repThCotizaciones: 'Cotizaciones', repThUltimaActividad: 'Última actividad',
    repNoHayClientesBusqueda: 'No hay clientes que coincidan con la búsqueda.', repErrorCargarClientes: 'No se pudo cargar el seguimiento de clientes.',
    buscarServSub: 'Elige uno de los servicios que ofrecemos para ir directamente a su información.',
    authTitle: 'Formulario de Autorización de Promoción y Venta', authSub: 'Como propietario del inmueble que se describe a continuación, autorizo a Armopa Group a promocionar en Alquiler y/o Venta mi inmueble por los medios que este considere pertinentes.',
    fpDatosPropietario: 'Datos del Propietario', fpNombreCompleto: 'Nombre completo', fpFechaNacimiento: 'Fecha de Nacimiento', fpDpi: 'DPI/CUI o Pasaporte', fpRepLegal: 'Representante Legal', fpRazonSocial: 'Razón Social', fpNit: 'NIT', fpTelMovil: 'Teléfono móvil', fpCorreo: 'Correo Electrónico', fpDomicilio: 'Dirección domicilio actual',
    fpDescripcionProp: 'Descripción Propiedad', fpTipo: 'Tipo', fpTipoPh: 'Ej. Casa, Apartamento, Terreno…', fpDireccion: 'Dirección', fpNumero: 'Número', fpFinca: 'Finca', fpFolio: 'Folio', fpLibro: 'Libro', fpGravamen: 'Gravamen', fpInstitucion: 'Institución', fpMonto: 'Monto',
    fpMFrente: 'Mts. Frente', fpMFondo: 'Mts. Fondo', fpMConst: 'Mts. Construcción', fpTerrenoVrs2: 'Terreno Vrs2', fpMts2: 'Mts2', fpNiveles: 'Niveles', fpEstacionamientos: 'Estacionamientos', fpHabitaciones: 'Habitaciones', fpBanos: 'Baños',
    fpLavanderia: 'Lavandería', fpLineaBlanca: 'Línea Blanca', fpHabServicio: 'Habitación Servicio', fpBodega: 'Bodega', fpAmueblado: 'Amueblado', fpBalcon: 'Balcón y/o Terraza / Jardín', fpMascota: 'Mascota',
    fpAmenidades: 'Amenidades del Edificio / Condominio', fpAmMotorLobby: 'Motor Lobby', fpAmPiscina: 'Piscina', fpAmSauna: 'Sauna', fpAmJuegos: 'Juegos de Niños', fpAmAreaVerde: 'Área Verde', fpAmSalon: 'Salón Usos Múltiples', fpAmGimnasio: 'Gimnasio', fpAmBusiness: 'Business Center', fpAmCanchas: 'Canchas Deportivas', fpAmCisterna: 'Cisterna y/o Pozo', fpAmParqueos: 'Número de parqueos de visita',
    fpPrecioVenta: 'Precio de Venta', fpValorRegistro: 'Valor del Registro', fpIusi: 'IUSI Trimestral',
    fpPrecioAlquiler: 'Precio de Alquiler', fpMantenimiento: 'Mantenimiento', fpIncluyeMant: 'Qué incluye el mantenimiento', fpObservaciones: 'Observaciones',
    fpSaveBtnHtml: '💾 Guardar autorización', fpNoteSaved: 'Autorización guardada correctamente. Gracias.',
    buscarPropTitulo: 'Buscar propiedades', buscarPropSub: 'Filtra por ciudad, sector, tipo, zona, especificaciones y presupuesto para encontrar la ubicación que buscas.',
    solNumeroPreview: 'Se genera automáticamente al guardar.',
    reqTitle: 'Requisitos para vender tu propiedad en Guatemala', reqSub: 'Esta guía fue generada con IA a partir de los requisitos habituales que piden bancos, notarios y el Registro General de la Propiedad en Guatemala. Sube el PDF de cada documento que ya tengas listo; puedes completar los demás después.',
    reqSinSubir: 'Sin subir', reqSubirPdfHtml: '📎 Subir PDF',
    reqDpiTitulo: 'DPI del propietario', reqDpiDesc: 'Documento Personal de Identificación vigente.',
    reqNitTitulo: 'NIT del propietario', reqNitDesc: 'Número de Identificación Tributaria.',
    reqEscrituraTitulo: 'Escritura pública de propiedad', reqEscrituraDesc: 'Título de propiedad o escritura traslativa de dominio, debidamente registrada.',
    reqRgpTitulo: 'Certificación del Registro General de la Propiedad (RGP)', reqRgpDesc: 'Con vigencia no mayor a 30 días; confirma quién es el propietario actual.',
    reqGravamenesTitulo: 'Certificación de gravámenes', reqGravamenesDesc: 'Descarta hipotecas, embargos o anotaciones sobre el inmueble.',
    reqIusiTitulo: 'Solvencia y recibo de pago del IUSI', reqIusiDesc: 'Impuesto Único Sobre Inmuebles al día.',
    reqSolvMunTitulo: 'Solvencia municipal', reqSolvMunDesc: 'Boleto de ornato y arbitrios municipales al día.',
    reqCatastroTitulo: 'Certificación catastral', reqCatastroDesc: 'Cuando el municipio donde está ubicado el inmueble cuenta con catastro.',
    reqPlanosTitulo: 'Planos registrados de la propiedad', reqPlanosDesc: 'Si existen planos de construcción o de finca registrados.',
    reqEmpresaTitulo: 'Escritura de constitución y patente de comercio', reqEmpresaDesc: 'Solo si el propietario es una sociedad o empresa.',
    reqPoderTitulo: 'Poder legal notarial', reqPoderDesc: 'Solo si actúa un representante o apoderado en lugar del propietario.',
    reqAvaluoTitulo: 'Avalúo comercial del inmueble', reqAvaluoDesc: 'Recomendado, no obligatorio: ayuda a definir un precio de venta realista.',
    reqNota: 'Esta guía es informativa y puede variar según el municipio, si el inmueble está en régimen de propiedad horizontal o si intervienen bancos. Para tu caso particular, consulta con un notario o con nuestro equipo.',
    fpErrNombre: 'Por favor escribe el nombre completo del propietario.', fpErrGuardar: 'No pudimos guardar la autorización. Intenta de nuevo.',
    citaBtnHtml: '📅 Agendar Cita', citaTitle: 'Agendar Cita', citaSub: 'Completa los datos para agendar una cita. Te confirmaremos los detalles por WhatsApp.',
    citaNombreCliente: 'Nombre de cliente', citaTelefono: 'Teléfono', citaFecha: 'Fecha de cita', citaHora: 'Hora de cita', citaCiudad: 'Ciudad', citaCiudadPh: 'Ej. Ciudad de Guatemala',
    citaEtiqueta: 'Etiqueta', citaEtqCliente: 'Cliente', citaEtqMuyInteresado: 'Muy interesado', citaEtqInteresado: 'Interesado', citaEtqPocoInteresado: 'Poco interesado',
    citaUbicacion: 'Nombre de la ubicación', citaUbicacionPh: 'Ej. Apartamento en Edificio Leben, Zona 15',
    citaAsesor: 'Asesor de Ventas', citaSinVendedor: 'Sin vendedor asignado',
    citaAccion: 'Acción', citaAccionPh: 'Describe el motivo o detalles de la cita…',
    citaEstado: 'Estado', citaEstAgendado: 'Agendado', citaEstEfectuado: 'Efectuado', citaEstReagendado: 'Reagendado', citaEstNoAsistio: 'No asistió',
    citaSaveBtnHtml: '💾 Guardar cita', citaWaBtn: 'Enviar por WhatsApp',
    citaErrNombre: 'Por favor escribe el nombre del cliente.', citaErrGuardar: 'No pudimos guardar la cita. Intenta de nuevo.', citaGuardadaOk: 'Cita guardada correctamente.',
    citaWaMsgIntro: 'Hola, se agendó una cita con los siguientes datos:', citaWaMsgCliente: 'Cliente: ', citaWaMsgTelefono: 'Teléfono: ', citaWaMsgFecha: 'Fecha de cita: ', citaWaMsgHora: 'Hora de cita: ', citaWaMsgUbicacion: 'Ubicación: ', citaWaMsgCiudad: 'Ciudad: ', citaWaMsgAccion: 'Acción: ', citaWaMsgEstado: 'Estado: ',
    citaVisitante: 'Visitante'
  },
  en: {
    menu: 'Menu', nInicio: 'Home', nNosotros: 'About', nPropiedades: 'Properties', nServicios: 'Services', nProyectos: 'Projects', nContacto: 'Contact',
    client: 'Client Area', close: 'Close',
    heroAlt: 'Residential development with views of volcanoes and a lake in Guatemala',
    tag: 'Investments * development * management * services * loyalty', lede: 'Secure, modern, personalized real estate solutions tailored to your needs to protect your investment as well as grow your wealth.', heroL1: 'Your wealth', heroL2: 'in the best hands', btnProps: 'View properties', btnServ: 'Our services',
    t1: 'Security', t1s: 'in every process', t2: 'Profitability', t2s: 'results oriented',
    t3: 'Trust', t3s: 'personalized service', t4: 'Coverage', t4s: 'across Guatemala',
    aboutT1: "At ARMOPA we turn the search for properties into a strategic, personalized experience. We are a real estate consulting firm and an Integrated Professional Services firm dedicated to connecting our clients with exceptional spaces that elevate their lifestyle and secure their wealth. Our commitment is grounded in Loyalty, transparency and integrity, using market innovation and deep industry expertise, ensuring sound, transparent, high long-term value investment decisions.", aboutT2: "We guide you to find the ideal space, intelligently: the point where real estate technology and the human touch meet. We specialize in simplifying the process of buying, selling and renting properties through an advanced digital ecosystem and a team of experts always at your disposal. We are passionate about optimizing your time and maximizing your investment opportunities, offering an agile, transparent service tailored to the demands of today's market.", aboutT3: "We understand that a property is much more than four walls: it is the stage for your next great memories and the pillar of your family's stability. With years of experience in the sector, we are proud to be the trusted allies of hundreds of families in their search for the ideal home. We stand out for honest, empathetic and professional advice, designed to accompany you with absolute security every step of the way.", quoteH: "Request a quote", quoteSub: "Fill in your details and choose how to send them: by WhatsApp or by email. It will open with your information ready to send to us.", qName: "Contact / client name", qNamePh: "Full name", qPhone: "Contact phone", qPhonePh: "+502 0000 0000", qAddr: "Service address", qAddrPh: "Zone, neighborhood, street or landmark", qBudget: "Assigned budget", qBudgetPh: "e.g. Q 500,000", qMsgBudget: "Assigned budget: ", qPromotor: "Business referrer", qPromotorPh: "Choose a referrer", qMsgPromotor: "Business referrer: ", qDate: "Estimated service date", qBtn: "Request a quote", qErr: "Please complete all fields to request the quote.", qSvcType: "Service type: ", qNum: "Quote No.: ", qQuoteDate: "Quote date: ", qNoSvc: "You haven't selected a service yet", qMsgH: "Hello, I would like to request a quote.", qMsgName: "Name: ", qMsgPhone: "Phone: ", qMsgAddr: "Service address: ", qMsgDate: "Estimated service date: ", xNeed: "Describe your need", xNeedPh: "Tell us what you need: measurements, materials, urgency or other details…", xAddr: "Location address", xAddrPh: "Zone, neighborhood, street or landmark", xQuote: "Attach quote (PDF)", xQuoteBtn: "📎 Upload PDF", xQuoteBtnLbl: "Upload quote PDF", xQuoteNone: "Not attached", xQuoteDate: "Quote date", xQuoteGoto: "Go to Request a quote", xQuoteGotoLbl: "Request a quote", xTime: "Estimated time", xTimePh: "E.g. 2 weeks, 1 month or an approximate date", xImgs: "Upload and view images", xHint: "You can select several images (JPG or PNG). They are saved in this browser; attach them in WhatsApp when you send the quote.", qMsgSvc: "Requested services:", qMsgTime: "Estimated time: ", qMsgAddrSvc: "Address: ", qMsgQuote: "Attached quote: ", qMsgImgs: "Images: {n} (I will attach them in this chat)", qEmail: "Email address", qEmailPh: "name@email.com", qMsgEmail: "Email: ", qBtnMail: "Send by email", qErrEmail: "Please enter a valid email address.", qMailSubj: "Quote request", xStart: "Estimated start date", qMsgStart: "Estimated start date: ", xPrio: "Priority", xPrioAlta: "High", xPrioMedia: "Medium", xPrioBaja: "Low", qMsgPrio: "Priority: ", xEstBtn: "Calculate Estimated Budget", xEstHide: "Hide estimate", xEstTitle: "Estimated budget (reference, Guatemala)", qMsgEst: "Estimated budget: ", ctImgAlt: "ARMOPA: buying and selling properties nationwide. We are the solution.", aiAlt: "Artificial intelligence and real estate technology", homeAlt: "Ideal home: a house in protective hands", xEstStale: "Calculated from the need description and estimated time you entered. If you change anything, press \"Calculate Estimated Budget\" again.", mkBtn: "Nearby costs", mkTitle: "Values of similar properties in the area (reference)", mkHide: "Hide", mkSimilar: "Similar properties (reference)", mkAround: "Nearby areas (reference)", mkUse: "Use these values in the value fields", salonAlt: "We rent or sell: a hand holding houses with dollar symbols", budgetAlt: "Budget and real estate investment: stacked coins and a house", buyAlt: "Property purchase: keys and a house in hand", remodelAlt: "Smart home: technology and property remodeling", landAlt: "Building on your land: a man in a field looking at the outline of his future house", projAlt: "Your project development: aerial view of an urban development with a plaza, buildings and green areas", aboutH1: 'Real estate management with a professional and intelligent vision,', aboutH2: 'Secure, Transparent, Upright, Responsible, Loyal, at the Forefront with Honesty', aboutH3: 'making your investment grow to unimaginable levels.',
    invH: 'Your Investment:', invSub: 'Guaranteed Investment:', invItems: ['Buying and selling', 'Diverse rentals', 'We integrate management', 'Remodeling', 'Construction / Remodeling', 'Project development with practical profitability management'], aboutP: 'We integrate management, buying and selling, rentals, remodeling, construction and project development to provide practical and organized management for every property.',
    svH: 'Your Services:', svA: 'Coordinated professional services', svItems: ['Heavy machinery rental', 'Dump truck rental for hauling', 'Apartment and building rentals', 'Building maintenance', 'Plumbing and electrical', 'Legal advisory', 'Bank Loan Management', 'Earthmoving'],
    propH: 'Exclusive properties in Guatemala', catalog: 'Request catalog', prev: 'Previous property', next: 'Next property',
    places: ['Guatemala City', 'Lake Atitlán', 'Antigua Guatemala', 'Petén', 'Zone 10'],
    alts: ['Luxury property in Guatemala City', 'Luxury property at Lake Atitlán', 'Luxury property in Antigua Guatemala', 'Luxury property in Petén', 'Premium property in Zone 10'],
    goTo: 'Go to position ',
    openProp: 'View locations in ', noLocs: 'No locations yet', oneLoc: '1 location', locsWord: 'locations',
    addLoc: 'Add location', locDefault: 'Location', emptyH: 'No locations yet', emptyP: 'Add the first one to upload its images and address.',
    nameL: 'Location name', zoom: 'View seller photo at original size', zoomToggle: 'Toggle between fit to screen and actual size', opL: 'Type of listing', opRent: 'Rent', opSale: 'Sale', opBoth: 'Rent or sale', rentL: 'Rent value', saleL: 'Property value (sale)', rentPh: 'e.g. Q 4,500 per month', salePh: 'e.g. Q 850,000', opHint: 'Choose the listing type to enter the values.', viewOpRent: 'For rent', viewOpSale: 'For sale', viewOpBoth: 'For rent or sale', rentView: 'Rent', saleView: 'Sale price', sellerH: 'Seller', sellerFotoHint: 'The photo is filled in automatically when you choose the seller from the list.', sellerSuperAdminHint: 'Only the super administrator can change the seller for this location.', sellerName: 'Seller name', sellerWa: 'Seller WhatsApp', waHint: 'Include the country code, for example +502. If you type 8 digits, 502 is added automatically.', sellerLabel: 'Seller contact', waBtn: 'Contact on WhatsApp', waMsg: 'Hello, I am interested in the property: ', descL: 'Property description', descPh: 'Features, rooms, amenities, price and any important details…', descH: 'Description', addrL: 'Address or Google Maps link', photo: 'Image ', photosH: 'Location images', upload: 'Upload images',
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
    ext: ['Heavy machinery rental', 'Dump truck rental for hauling', 'Apartment and building rentals', 'Building maintenance', 'Plumbing and electrical', 'Legal advisory', 'Bank Loan Management', 'Earthmoving', 'Real Estate Property Management'],
    ctaH: 'Do you have a property or project?', ctaP: "Let's discuss the best way to manage, develop or grow it.", ctaBtn: 'Contact us',
    ctH: "Let's talk about your next project", ctP: 'Personalized service for owners, buyers, investors and tenants or special clients. Contact us and we will reply as soon as possible.',
    phoneL: 'Phone', mailL: 'Email',
    fName: 'Full name', fMail: 'Email address', fPhone: 'Phone', fReason: 'Reason for contact', fMsg: 'Tell us what you need',
    r1: 'Buy / sell', r2: 'Property management', r3: 'Project development', r4: 'External services',
    send: 'Send request', sentMsg: 'Demo mode: connect this form to your email or CRM to receive requests.',
    fAtt: 'Contact', fFollow: 'Follow us', rights: 'All rights reserved.',
    cUser: 'Username', cPass: 'Password', cCode: 'Property code', cGo: 'Sign in',
    cMsg: 'Demo access: connect this form to your user system.',
    adminUsersBtn: 'Manage users', logoutBtn: 'Log out', connectBtn: 'Log in',
    adminMenuBtn: 'Admin', adminMenuProp: 'Properties', adminMenuProy: 'Projects', adminMenuServ: 'Services', adminMenuVend: 'Vendors',
    adminGrpCatalogos: 'Catalogs', adminGrpNegocios: 'Business', adminGrpComisiones: 'Commissions', adminGrpReportes: 'Reports',
    adminMenuIngresoCiudades: 'Add Cities', adminMenuIngresoPropiedades: 'Add Properties', adminMenuClientes: 'Clients', adminMenuCitas: 'Appointments', adminMenuAgendaCitas: 'Appointment schedule', adminMenuTiposComision: 'Commission Types', adminMenuRotVisual: 'Visual Rotation',
    adminMenuComisionesVentas: 'Sales Commissions', adminMenuComisionesGeneradas: 'Generated Commissions', adminMenuComisionesPagadas: 'Paid Commissions',
    adminMenuRepProp: 'Property Listing', adminMenuRepServ: 'Service Status', adminMenuRepClientes: 'Client Follow-up',
    carHint: 'Click the image to see the city’s properties.', btnBuscarServ: 'Browse services',
    catalogHtml: '🔍 Browse properties', btnBuscarServHtml: '🔧 Browse services',
    rotVisualTitle: 'Visual Rotation', rotVisualHint: 'Click a property to see its photos and details', rotVisualVolver: '← Back to all properties', rotVisualVolverCiudades: '← Back to cities', rotVisualEmpty: 'No properties with photos to show.', rotVisualLoadErr: 'Could not load the visual rotation.',
    rotVisualCiudad: 'City', rotVisualTipo: 'Property Type', rotVisualTodas: 'All',
    rotVisualRenta: 'Rent', rotVisualPrecioVenta: 'Sale price', rotVisualDescripcion: 'Description', rotVisualContactoVendedor: 'Seller contact', rotVisualWa: 'Contact on WhatsApp',
    visionTitle: 'Our Vision',
    visionLead: 'To be a leading real estate group, recognized for integrity, transparency and excellence in property management, offering comprehensive solutions that protect and strengthen our clients\' wealth.',
    visionBody: 'Since 2001, we have built relationships of trust through buying, selling, renting, management, legal advisory, construction and remodeling services, extending our expertise to our fellow citizens abroad to help manage and grow their wealth in Guatemala.',
    missionTitle: 'Our Mission',
    missionLead: 'To provide comprehensive real estate solutions with excellence, transparency and integrity, supporting our clients through every stage of their projects.',
    missionBody: 'We protect, transform and grow your wealth, with a presence in Guatemala and an international outlook.',
    txHead1: 'Smart decisions.<br>Legacies that endure.',
    txList1: ['Strategic consulting', 'Real estate investment', 'Wealth protection', 'Long-term vision', 'Professionalism and trust'],
    txHead2: 'Technology that connects.<br>People who guide you.',
    txList2: ['We simplify your real estate journey.', 'Find better. Decide smart.', 'Your ideal space, the smart way.', 'We connect opportunities with your needs.', 'Real estate intelligence within reach.'],
    txHead3: 'Homes that inspire.<br>Trust that lasts.',
    txList3: ['Much more than walls, your next home.', 'Spaces for your best memories.', 'Building the setting for your life.', 'Your trusted ally every step of the way.', 'Honest advice for your ideal home.'],
    /* ===== Footer / tagline ===== */
    ftrTagline: 'Real Estate Management',
    /* ===== "Request quote" widget (save/modify/delete) ===== */
    qSaveBtnHtml: '💾 Save', qModifyBtnHtml: '🔄 Modify', qDeleteBtnHtml: '🗑️ Delete',
    /* ===== Loading / error / empty: services and lists ===== */
    cargandoServicios: 'Loading services...', cargando: 'Loading…', proximamente: 'Coming soon.',
    errCargarServicios: 'We could not load the services right now.', noHayServiciosDisponibles: 'No services available',
    seleccionaServicio: 'Select a service…', eligeServicioLista: 'Choose a service from the list.',
    nuestrosServicios: 'Our services', btnBuscar: 'Search',
    /* ===== Bank loan prequalification ===== */
    pqBtnLabel: 'Loan prequalification details',
    pqTitle: 'General requirements for bank prequalification in Guatemala',
    pqOcultar: 'Hide',
    pqIntro: 'Choose the applicant type, fill in the details, attach any PDF documents you already have, and save your file. You can come back later to update it or complete any missing documents.',
    pqTipoSolicitante: 'Applicant type',
    pqPersonaIndividual: 'Individual', pqPersonaJuridica: 'Legal Entity (Company)',
    pqTusDatos: 'Your details', pqDatosEmpresa: 'Company details',
    pqBanco: 'Preferred bank', pqSelecciona: 'Select…',
    pqBancoOtro: 'Other',
    pqMontoSolicitado: 'Amount requested (Q)', pqMontoPh: 'E.g. 250,000', pqMontoPhJ: 'E.g. 500,000',
    pqDestinoCredito: 'Loan purpose',
    pqDestVivienda: 'Housing', pqDestVehiculo: 'Vehicle', pqDestConsumo: 'Personal Use',
    pqDestCapitalTrabajo: 'Working capital', pqDestCompraEquipo: 'Equipment purchase', pqDestExpansion: 'Business expansion',
    pqTipoPerfil: 'Profile type', pqPerfilAsalariado: 'Salaried', pqPerfilIndependiente: 'Self-employed',
    pqDpi: 'ID number (13 digits)', pqNit: 'Tax ID (NIT)', pqNitPh: 'E.g. 1234567-8',
    pqTelefono: 'Mobile phone', pqCorreo: 'Email address', pqCorreoPhEmpresa: 'name@company.com',
    pqEscolaridad: 'Education level',
    pqEscSin: 'No schooling', pqEscPrimaria: 'Elementary', pqEscBasicos: 'Middle school', pqEscDiversificado: 'High school',
    pqEscTecnico: 'Technical', pqEscUniversitario: 'University', pqEscPostgrado: 'Postgraduate (Master\'s / Doctorate)', pqEscOtro: 'Other',
    pqProfesion: 'Profession / Occupation', pqProfesionPh: 'E.g. Teacher, merchant, engineer…',
    pqIdentidad: 'Identity', pqIngresos: 'Income', pqEstabilidadLaboral: 'Job stability',
    pqDocLegalesEmpresa: 'Company legal documents', pqRepLegalFinanzas: 'Legal representative and finances',
    pqRazonSocial: 'Company name', pqRazonSocialPh: 'E.g. Inversiones ABC, S.A.',
    pqNitEmpresa: 'Company Tax ID (NIT)',
    pqRepNombre: 'Legal representative name', pqNombreCompletoPh: 'Full name',
    pqRepDpi: 'Legal representative ID number (13 digits)',
    pqSubirPdfHtml: '📎 Upload PDF', pqSinGuardar: 'Not saved yet',
    pqDocDpi: 'Valid national ID (DPI)', pqDocNit: 'Tax ID (NIT) number',
    pqDocBoletas: 'If salaried: pay stubs or salary certificate for the last 3 months',
    pqDocEstadosCuenta: 'Recent bank statements (usually the last 3 to 6 months)',
    pqDocPatenteIsr: 'If self-employed: business license and income tax (ISR) filings',
    pqDocCartaTrabajo: 'Work letter stating time employed at the company',
    pqDocAntiguedad: 'Job tenure (many banks require at least 1 year at the current job)',
    pqDocHistorial: 'Favorable credit history (credit bureau check)',
    pqDocPatenteComercioEmpresa: 'Company Business License',
    pqDocPatenteSociedad: 'Corporate Business License (if applicable)',
    pqDocEscrituraConstitucion: 'Articles of Incorporation',
    pqDocRtu: 'Company Unified Tax Registry (RTU)',
    pqDocDpiRepresentante: 'Valid ID (DPI) of the Legal Representative',
    pqDocNombramientoRepresentante: 'Legal Representative Appointment (current)',
    pqDocPatenteComercioSociedadRep: 'Business and Corporate License',
    pqDocEstadosFinancieros: 'Company Financial Statements (latest period)',
    pqAviso: 'This information is general and for guidance only; it does not replace each bank\'s official evaluation. We are happy to help you gather and organize these documents.',
    pqGuardarHtml: '💾 Save', pqActualizarHtml: '🔄 Update', pqEliminarHtml: '🗑️ Delete',
    pqDescargarPdf: 'Download documents as PDF',
    pqMsgGuardando: 'Saving…',
    pqMsgErrorActualizar: 'Error updating: ',
    pqMsgActualizadoExito: 'File updated successfully.',
    pqMsgErrorGuardar: 'Error saving: ',
    pqMsgGuardadoExito: 'File saved successfully. You can now upload your PDF documents.',
    pqMsgErrorGuardarExpediente: 'Error saving the file.',
    pqMsgNoHayExpediente: 'There is no saved file yet.',
    pqConfirmEliminar: 'Delete this file and all its attached documents? This action cannot be undone.',
    pqMsgErrorEliminar: 'Error deleting: ',
    pqMsgEliminadoExito: 'File deleted successfully.',
    pqMsgErrorEliminarExpediente: 'Error deleting the file.',
    pqMsgCompletaEmpresa: 'Complete all fields in "Company details" before saving.',
    pqMsgDpiRepresentante13: 'The legal representative\'s ID must have 13 digits.',
    pqMsgCompletaTusDatos: 'Complete all fields in "Your details" before saving.',
    pqMsgDpi13: 'The ID number must have 13 digits.',
    pqMsgSubido: '✅ Uploaded', pqMsgSubiendoEllipsis: 'Uploading…', pqMsgSubidoNombre: '✅ Uploaded: ',
    pqMsgPrimeroGuarda: 'First save your details ("Save" button) before uploading documents.',
    pqMsgSoloPdf: 'Only PDF files are allowed.',
    pqMsgErrorGuardarDoc: 'Error saving the document: ',
    pqMsgErrorGuardarCorto: 'Error saving',
    pqMsgDocumentoSubidoExito: 'Document uploaded successfully.',
    pqMsgErrorSubir: 'Error uploading',
    pqMsgErrorSubirPdf: 'Error uploading the PDF.',
    pqMsgNoSePudoPdf: 'Could not generate the PDF. Reload the page and try again.',
    pqPdfTituloJuridica: 'Bank prequalification requirements — Legal Entity (Company)',
    pqPdfTituloIndividual: 'Bank prequalification requirements — Individual',
    pqPdfFooter: 'Generated on ', pqPdfFooter2: ' — This list is general and for guidance only.',
    pqPdfSubtitle: 'ARMOPA — Real Estate Management',
    pqBancoLista: ['Crédito Hipotecario Nacional de Guatemala (CHN)', 'Banco de los Trabajadores (Bantrab)', 'Banco Cuscatlán Guatemala', 'Banco Industrial', 'Banco de Desarrollo Rural (Banrural)', 'Banco Internacional', 'Citibank, N.A. Sucursal Guatemala', 'Vivibanco', 'Banco Ficohsa Guatemala', 'Banco Promerica', 'Banco de Antigua', 'Banco de América Central (BAC)', 'Banco Agromercantil de Guatemala (BAM)', 'Banco G&T Continental', 'Banco Azteca de Guatemala', 'Banco INV', 'Banco Credicorp', 'Banco Nexa', 'Banco Multimoney'],
    /* ===== Admin: shared generic actions ===== */
    btnModificar: 'Modify', btnGuardar: 'Save', btnEliminar: 'Delete', btnCancelar: 'Cancel', btnBuscarAdmin: 'Search', btnMostrar: 'Show', btnActualizarHtml: '🔄 Update',
    adminSinNombre: 'No name', adminCargandoPuntos: 'Loading…', adminSelecciona: 'Select…',
    adminConfirmEliminarGenerico: 'Delete this record? This action cannot be undone.',
    adminErrorGuardarCambio: 'Could not save the change.',
    /* ===== Admin: Properties / Projects / Services (lists) ===== */
    admEstado: 'Status', admFechaCambio: 'Change date', admUsuarioCambia: 'User who changed it', admVendedorAsignado: 'Assigned seller', admPctComision: '% Commission', admValorComision: 'Commission value',
    admEstadoUbicacion: 'Location status', admPlaceholderVendedorAsignado: 'Assigned seller',
    admConfirmEliminarUbicacion: 'Delete this location? This action cannot be undone.', admErrorEliminarUbicacion: 'Could not delete the location.',
    admNoHayUbicaciones: 'No locations match your search.',
    admTodasLasCiudades: 'All cities', admTodasLasUbicaciones: 'All locations', admTodosLosEstados: 'All statuses', admTodosLosVendedores: 'All sellers', admTodosLosPromotores: 'All business referrers',
    admCliente: 'Client', admDescripcionRealizar: 'Description of work', admValor: 'Value', admPrioridad: 'Priority', admNumSolicitud: 'Request No.', admPromotorNegocios: 'Business Referrer',
    admFechaCambioEstado: 'Status change date', admSinDefinir: 'Not set', admPrioridadAlta: 'High', admPrioridadMedia: 'Medium', admPrioridadBaja: 'Low',
    admConfirmEliminarSolicitud: 'Delete this service request? This action cannot be undone.', admErrorEliminarSolicitud: 'Could not delete the request.',
    admNoHayProyectos: 'No projects match your search.', admTodosLosProyectos: 'All projects',
    admSeleccionaPromotor: 'Select a referrer', admNoEstaEnVendedores: ' (not in Vendors)',
    admNoNumSolicitud: 'Request No.', admNombreCliente: 'Client name', admFechaSolicitud: 'Request date', admUsuarioModifica: 'Modified by', admValorDelServicio: 'Service value',
    admTodosLosServicios: 'All services', admSinSolicitudesRegistradas: 'No requests registered', admErrorAlCargar: 'Error loading', admNoSePudoCargarLista: 'Could not load the list.',
    admTodosLosRegistros: 'All records (', admSolicitudEncontrada: ' request found', admSolicitudesEncontradas: ' requests found',
    admEligeRegistroLista: 'Choose a record from the list to view its information.', admNoHaySolicitudesCoinciden: 'No requests match your search.',
    admNoSePudoCargarSolicitudes: 'Could not load the requests information.', admNoSeEncontroSolicitud: 'The request was not found.', admNoSePudoCargarSolicitud: 'Could not load the request information.',
    admServicioSinEspecificar: 'Unspecified service', admSinPropiedadAsignada: 'No property assigned',
    /* ===== Admin: Vendors ===== */
    admFoto: 'Photo', admCodigoVendedor: 'Seller code', admNombre: 'Name', admTelefono: 'Phone', admDireccion: 'Address', admFechaInicio: 'Start date', admFechaGrabacion: 'Record date', admUsuario: 'User',
    admBancoDePago: 'Payment bank', admNumeroCuentaBancaria: 'Bank account number', admTipoCuenta: 'Account type', admPctComisionVentas: '% Sales commission',
    admVendedorSinNombre: 'Seller with no name', admCodigoSeAsigna: 'Assigned on save', admCodigoSeAsignaAutomatico: 'Assigned automatically on save',
    admSeAsignaAutomaticoFecha: 'Assigned automatically on save (', admUsuarioActualFallback: 'current user', admSeGrabaAutomaticamente: 'Recorded automatically (',
    admSubirFoto: 'Upload photo', admSubiendoFoto: 'Uploading…', admQuitarFoto: 'Remove photo', admPlaceholderNombreVendedor: 'Seller name', admPlaceholderDireccion: 'Address',
    admConfirmEliminarVendedor: 'Delete this seller? This action cannot be undone.', admErrorEliminarVendedor: 'Could not delete the seller.', admErrorSubirFoto: 'Could not upload the photo.',
    admEscribeNombreVendedor: 'Enter the seller name.', admErrorGuardarVendedor: 'Could not save the seller.',
    admNoHayVendedores: 'No sellers match your search.', admBuscarPorNombrePh: 'Search by name', admAgregarVendedor: '+ Add seller',
    admMonetaria: 'Checking', admAhorros: 'Savings', admTransferencia: 'Transfer', admCheque: 'Check', admEfectivo: 'Cash',
    /* ===== Admin: Commission Types ===== */
    admNegocio: 'Business', admTipoSinNombre: 'Unnamed type', admPctComisionDefecto: '% Default commission', admPlaceholderNombreTipoComision: 'E.g. Direct sale, Remodeling…',
    admConfirmEliminarTipoComision: 'Delete this commission type? This action cannot be undone.', admErrorEliminarTipoComision: 'Could not delete the commission type.',
    admEscribeNombreTipoComision: 'Enter the commission type name.', admSeleccionaNegocio: 'Select the business.', admErrorGuardarTipoComision: 'Could not save the commission type.',
    admNoHayTiposComision: 'No commission types match your search.', admAgregarTipoComision: '+ Add commission type', admTodosLosNegocios: 'All businesses',
    admNegocioPropiedades: 'Properties', admNegocioProyectos: 'Projects', admNegocioServicios: 'Services',
    /* ===== Admin: Add Cities / Add Properties ===== */
    admNuevaCiudad: '+ New city', admBuscarCiudadPh: 'Search city...', admNoSeEncontraronCiudades: 'No cities found.',
    admNombreCiudadLbl: 'City name', admNombreCiudadPh: 'E.g. Cobán', admFotoPortadaOpcional: 'Cover photo (optional)', admElegirFotoHtml: '📷 Choose photo',
    admEscribeNombreCiudad: 'Enter the city name.', admGuardandoEllipsis: 'Saving…', admErrorGuardarGenerico: 'Error saving: ', admErrorGuardarCiudad: 'Error saving the city.',
    admCiudadYFotoGuardadas: 'City and photo saved successfully.', admCiudadAgregada: 'City added successfully.',
    admIngresoPropiedadesTitulo: 'Add Properties', admEnQueCiudadPropiedades: 'Which city will you add properties in?',
    admCiudades: 'Cities', admAgregaPrimeraCiudad: 'Add your first city', admCiudadesSufijo: 'city(ies)',
    admFotoPortada: 'Cover photo', admActualizar: 'Update', admNuevoNombreCiudad: 'New name for the city:', admCiudadActualizada: 'City updated successfully.', admErrorActualizarCiudad: 'Error updating the city: ', admErrorActualizarCiudadGenerico: 'Error updating the city.',
    admConfirmEliminarCiudad: 'Delete the city "', admConfirmEliminarCiudad2: '"? This action cannot be undone.', admCiudadEliminada: 'City deleted successfully.', admErrorEliminarCiudad: 'Error deleting the city: ', admErrorEliminarCiudadGenerico: 'Error deleting the city.',
    admVolverCiudades: '← Cities', admBuscarUbicacionPh: 'Search location by name, sector or zone...',
    admResultadosBusqueda: 'Your search results (', admVerTodasUbicaciones: 'View all locations', admNoSeEncontraronUbicaciones: 'No locations found for "',
    admSeleccionaOAgregaUbicacion: 'Select or add a location first.', admUbicacionGuardadaExito: 'Location saved successfully.', admUbicacionActualizadaExito: 'Location updated successfully.', admErrorGuardarUbicacion: 'Error saving the location.',
    admGestionInterna: 'Internal management', admFechaCambioEstadoLbl: 'Status change date: ', admUsuarioCambiaEstadoLbl: 'User who changed the status: ',
    admClienteAsignado: 'Client', admSinClienteAsignado: 'No client assigned',
    admLocSeccionAsignacion: 'Status & assignment', admLocSeccionComision: 'Commission',
    admTipoPropiedadLbl: 'Property type', admSectorLbl: 'Sector', admZonaLbl: 'Zone', admValorComisionLbl: 'Commission value',
    ubicEstLabels: { activa: 'Active', arrendada: 'Leased', vendida: 'Sold', suspendida: 'Suspended', baja: 'Deactivated' },
    solEstLabels: { solicitado: 'Requested', presupuesto_enviado: 'Quote sent', aprobado: 'Approved', en_proceso: 'In progress', ejecutado: 'Completed', anulado: 'Canceled' },
    ubicEstActiva: 'Active', ubicEstArrendada: 'Leased', ubicEstVendida: 'Sold', ubicEstSuspendida: 'Suspended', ubicEstBaja: 'Deactivated',
    pTipoPh: 'E.g. House, Retail space, Coffee farm…', pSectorPh: 'E.g. Cayalá, Vista Hermosa…', pZonaPh: 'E.g. Zone 10, Zone 4…',
    admPropTituloModal: 'Properties — General listing', admPropSubtituloModal: 'Status, tracking and commission for each registered location.',
    admProyTituloModal: 'Projects — General listing', admProySubtituloModal: 'Tracking, seller and commission for each registered project.',
    admServTituloModal: 'Services — General listing', admServSubtituloModal: 'Status, seller and commission for each service request.',
    admVendTituloModal: 'Vendors — General listing', admVendSubtituloModal: 'Code, contact and photo for each registered seller.',
    admCliTituloModal: 'Clients — General listing', admCliSubtituloModal: 'Code, contact and details for each registered client.',
    admCliVendedorAsignado: 'Assigned seller', admCliSinVendedor: 'No seller assigned',
    btnSeguimientos: 'Follow-ups', btnVerActividades: 'View activities',
    segTituloModal: 'Follow-ups', segSubtituloModal: 'Call and management history for',
    segFechaLlamada: 'Call date', segVendedor: 'Seller', segAccion: 'Action', segResultado: 'Result', segDescripcion: 'Description',
    segAccLlamada: 'Call', segAccVisita: 'Property visit', segAccServicio: 'Service follow-up',
    segResInteresado: 'Interested', segResNoInteresado: 'Not interested', segResConfirmado: 'Confirmed', segResIndeciso: 'Undecided',
    segPlaceholderDescripcion: 'Detail of the call or management performed', segSinVendedor: 'No seller',
    segAgregar: '+ Add follow-up', segSinRegistros: 'No follow-ups have been recorded for this client yet.',
    segConfirmEliminar: 'Delete this follow-up?', segErrorEliminar: 'Could not delete the follow-up.', segErrorGuardar: 'Could not save the follow-up.', segErrorCargar: 'Could not load the follow-ups.',
    actTituloModal: 'Client activities', actSubtituloModal: 'Everything recorded in the system for',
    actSeccionCitas: 'Scheduled appointments', actSeccionPropiedades: 'Properties where they appear', actSeccionServicios: 'Services where they appear', actSeccionSeguimientos: 'Follow-ups',
    actSinCitas: 'No appointments recorded.', actSinPropiedades: 'No properties assigned.', actSinServicios: 'No service requests recorded.', actSinSeguimientos: 'No follow-ups recorded.',
    actErrorCargar: 'Could not load the client activities.',
    admCliSeccionContacto: 'Contact', admCliSeccionUbicacion: 'Location', admCliSeccionAdmin: 'Administrative',
    admAgregarCliente: '+ Add client', admCodigoCliente: 'Client code', admDpi: 'National ID (DPI)', admDepartamento: 'Department', admMunicipio: 'Municipality',
    admDetalleDireccion: 'Address details', admEstadoCliente: 'Status', admEstCliActivo: 'Active', admEstCliInactivo: 'Inactive', admEstCliBaja: 'Discharged', admEstCliInquilino: 'Tenant', admEstCliPropietario: 'Owner',
    admProfesion: 'Profession',
    admClienteSinNombre: 'Client with no name', admPlaceholderNombreCliente: 'Client name', admPlaceholderDpi: 'National ID number',
    admPlaceholderDetalleDireccion: 'E.g. Las Flores Residences, lot 12', admEscribeNombreCliente: 'Enter the client name.',
    admErrorGuardarCliente: 'Could not save the client.', admErrorEliminarCliente: 'Could not delete the client.',
    admConfirmEliminarCliente: 'Delete this client? This action cannot be undone.', admNoHayClientes: 'No clients match your search.',
    admAgeTituloModal: 'Appointment schedule', admAgeSubtituloModal: 'Browse scheduled appointments by day, week, or month.',
    admAgeVistaDia: 'Day', admAgeVistaSemana: 'Week', admAgeVistaMes: 'Month', admAgeHoy: 'Today',
    admAgeDetalleTitulo: 'Appointment detail', admAgeNoHayCitasDia: 'No appointments scheduled for this day.',
    admAgeMasCitas: '+{n} more',
    admCitTituloModal: 'Appointments — Search', admCitSubtituloModal: 'Browse appointments made, using the filters below.',
    admCitTodosLosClientes: 'All clients', admCitTodosLosDepartamentos: 'All departments', admCitTodosLosMunicipios: 'All municipalities',
    admCitFechaInicial: 'Start date', admCitFechaFinal: 'End date', admCitNoHayCitas: 'No appointments match the search.',
    admCitErrorEliminar: 'Could not delete the appointment.', admCitConfirmEliminar: 'Delete this appointment? This action cannot be undone.',
    admCitErrorGuardar: 'Could not save the appointment.',
    admTipoComTituloModal: 'Commission Types — Catalog', admTipoComSubtituloModal: 'Commission types by business: Properties, Projects or Services.',
    admFechaInicioServicioLabel: 'Service start date', admFechaFinServicioLabel: 'Service end date', admListaRegistrosLabel: 'Record list',
    admSinFotosUbicacion: 'This location has no photos yet.', admDescripcionPropiedad: 'Property Description',
    admSeleccionaVendedor: 'Select a seller',
    /* ===== Remodeling Request (fr-) ===== */
    frTitulo: 'Remodeling Request', frSubtitulo: 'Tell us what you want to remodel and attach photos so we can help you plan, coordinate and supervise the project.',
    frNombreCliente: 'Client Name', frDetalles: 'Details you want for the remodeling', frDetallesPh: 'E.g. Remodel kitchen and living room, change flooring, expand a room…',
    frFotosActuales: 'Attach photos (current condition)', frFotosReferencia: 'Attach photos (reference / inspiration)', xSubirFotosHtml: '📷 Upload photos',
    frTiempoEstimado: 'Estimated remodeling time', frSelecciona: 'Select…', frT12sem: '1 to 2 weeks', frT34sem: '3 to 4 weeks', frT12mes: '1 to 2 months', frT36mes: '3 to 6 months', frTMas6mes: 'More than 6 months', frTNoSeguro: "I'm not sure",
    frPresupuestoEstimado: 'Estimated remodeling budget (Q)', frEnviadaOk: 'Request sent successfully. Thank you.',
    /* ===== We adjust your budget (pp-) ===== */
    ppSubtitulo: 'Tell us what you want to do and we will design alternatives based on your needs and goals.', ppPresupuestoH: 'Budget',
    ppValorPresupuesto: 'Budget value (Q)', ppNombreCliente: "Client's name", ppFecha: 'Date',
    ppQueDeseasRealizar: 'What do you want to do with a property?', ppOpComprar: 'Buy', ppOpRentar: 'Rent', ppOpRemodelar: 'Remodel', ppOpServiciosEspeciales: 'Special services', ppOpEmprendimiento: 'Financial venture',
    ppDescribeRealizar: 'Describe what you want to do', ppDescribeRealizarPh: 'Tell us in as much detail as possible what you need…', ppAdjuntarPdf: 'Attach PDF (optional)',
    ppSeleccionaQueDeseas: 'Please select what you want to do with a property.',
    /* ===== Shared messages: request forms (fr/pp/cs) ===== */
    escribeNombreCliente: 'Please enter the client name.', errorEnviarSolicitud: 'We could not send your request. Please try again.',
    soloArchivosPdf: 'Only PDF files are allowed.', subiendoEllipsis: 'Uploading…', errorSubirArchivo: 'Upload error', subidoPrefix: 'Uploaded: ',
    /* ===== We build on your land (cs-) ===== */
    csSubtitulo: 'Tell us the general details of your project; we are happy to help you with the design, budget and execution.',
    csValorPresupuesto: 'Budget Value (Q)', csNombreCompleto: 'Full name', csFechaInicioEstimada: 'Estimated start date',
    csQueDeseasHacer: 'Describe what you want to do with the construction', csQueDeseasHacerPh: 'E.g. Build my house on my own 300 sq m lot…',
    csMetrosCuadrados: 'Square meters', csDescribeConstruir: 'Describe what you want to build', csDescribeConstruirPh: 'E.g. Modern one-level house, white facade with wood details, flat roof, large windows, 3 bedrooms…',
    csVistaIaAlt: 'AI-generated exterior view', csFotosTerreno: 'Photos of the land (images or PDF)', csSubirFotosPdfHtml: '📎 Upload photos / PDF',
    csReqBtnHtml: '📋 Requirements to build', csGenerarDisenoHtml: '🎨 Generate design with AI',
    csPasosTitulo: 'Steps to build a property in Guatemala', csPasosSubtitulo: 'This guide was generated with AI based on the usual process before municipalities, professional associations and service providers in Guatemala. It is informative and may vary by municipality and project type.',
    csPaso1: '<b>Check the land use and the Territorial Zoning Plan (POT)</b><br><small>Confirm with the municipality that the lot allows the type of construction you want.</small>',
    csPaso2: '<b>Gather the legal documentation of the lot</b><br><small>Registered deed, RGP certification and up-to-date IUSI payment status.</small>',
    csPaso3: '<b>Hire a licensed professional (architect or civil engineer)</b><br><small>Must be active in the CIG (Engineers Association) or CAG (Architects Association).</small>',
    csPaso4: '<b>Prepare the preliminary design and blueprints</b><br><small>Architectural design, structural, electrical and plumbing plans.</small>',
    csPaso5: '<b>Carry out a soil study</b><br><small>Recommended to define the appropriate type of foundation.</small>',
    csPaso6: '<b>Apply for the municipal construction permit</b><br><small>Submit plans, tax payment receipt and other requirements to the corresponding municipality.</small>',
    csPaso7: '<b>Confirm service availability</b><br><small>Water, drainage and electricity (EEGSA or another local utility).</small>',
    csPaso8: '<b>Start construction with a logbook and supervision</b><br><small>Keep a construction logbook and periodic supervision by the responsible professional.</small>',
    csPaso9: '<b>Request the final inspection / occupancy permit</b><br><small>Final step with the municipality once construction is complete.</small>',
    csPaso10: '<b>Register the improvements with the Property Registry</b><br><small>Update the value and description of the now-built property.</small>',
    csPasosHint: 'For your particular case, we recommend confirming the exact steps with a licensed professional or with our team.',
    csDescribePrimero: 'Please describe first what you want to build.', csEscribeNombreCompleto: 'Please enter the full name.',
    csGenerandoVista: 'Generating exterior view with AI… this may take a few seconds.', csVistaGenerada: 'AI-generated exterior view (for reference):', csErrorGenerarVista: 'We could not generate the exterior view right now. Try again later.',
    /* ===== Admin: Sales / Generated / Paid Commissions ===== */
    comVentasTituloModal: 'Sales Commissions — General listing', comVentasSubtituloModal: 'Commissions by seller, from a date and by type.',
    comGenTituloModal: 'Generated Commissions — General listing', comGenSubtituloModal: 'Already generated commissions, their payment status and bank transaction details.',
    comPagTituloModal: 'Paid Commissions', comPagSubtituloModal: 'Commission history by seller, date and status.',
    comTipoTodas: 'All', comTipoPropiedades: 'Properties', comTipoProyectos: 'Projects', comTipoServicios: 'Services',
    comLblVendedor: 'Seller', comLblFechaInicial: 'Start date', comLblFechaFinal: 'End date', comLblTipoComision: 'Commission type', comLblEstado: 'Status',
    comThDetalle: 'Detail', comThFecha: 'Date', comThVendedor: 'Seller', comThPctComision: '% Commission', comThValorComision: 'Commission value', comThEstado: 'Status', comThPagarComision: 'Pay commission',
    comSubtotalPrefix: 'Subtotal ', comGrupoPropiedades: 'Properties', comGrupoProyectos: 'Projects', comGrupoServicios: 'Services', comGrupoProyectosServicios: 'Projects and Services', comSinVendedor: '(No seller)',
    comTotalGenerado: 'Total generated commissions', comTotalAPagar: 'Total commissions to pay', comBtnGenerar: 'Generate Commissions',
    comNoHayMarcadas: 'No commissions marked for payment.', comConfirmGenerar: 'Confirm generating {n} commission(s) for a total of {v}?', comGenerando: 'Generating commissions…',
    comGeneradasOk: '{n} commission(s) generated. Follow up on payment in Generated Commissions.', comErrorGenerar: 'Could not generate the commission. Try again.',
    comNoHayComisionesBusqueda: 'No commissions match your search.', comErrorCargarComisiones: 'Could not load the commission information.',
    comEstPendiente: 'Pending payment', comEstPagado: 'Paid', comEstSuspendido: 'Suspended', comEstAnulado: 'Canceled',
    comNoHayGeneradasBusqueda: 'No generated commissions match your search.', comErrorCargarGeneradas: 'Could not load the generated commissions information.',
    comLblBanco: 'Bank', comLblCuentaBancaria: 'Bank account', comLblNumeroCheque: 'Check number', comLblFechaPago: 'Payment date', comLblFechaOperacion: 'Transaction date', comLblUsuarioPaga: 'User who paid', comLblFechaGenerada: 'Generated date',
    comResumenPagoPorVendedor: 'Payment summary by seller', comLblTotalPendiente: 'Total pending', comLblFormaPago: 'Payment method', comPlaceholderNumeroCuenta: 'Account number', comPlaceholderNumeroCheque: 'Check number',
    comBtnPagar: 'Pay', comConfirmPagar: 'Confirm payment of {n} commission(s) to {v} for a total of {t}?', comProcesando: 'Processing…', comPagoRegistrado: 'Payment recorded.', comErrorPagoVendedor: 'Could not record the payment.', comErrorGuardarPct: 'Could not save the commission %.',
    comNoHayPagadasBusqueda: 'No commissions match your search.', comErrorCargarPagadas: 'Could not load the paid commissions information.',
    /* ===== Admin: Reports ===== */
    repPropTituloModal: 'Report — Property Listing', repPropSubtituloModal: 'Complete inventory of properties and their status.',
    repServTituloModal: 'Report — Service Status', repServSubtituloModal: 'Service requests and their current status.',
    repCliTituloModal: 'Report — Client Follow-up', repCliSubtituloModal: 'Registered clients and the status of their scheduled appointments.',
    repCliTodosLosClientes: 'All clients', repCliConCitas: 'With appointments', repCliSinCitas: 'Without appointments', repCliConProximaCita: 'With upcoming appointment',
    repCliProximaCita: 'Upcoming appointment', repCliSinProximaCita: 'No upcoming appointment scheduled', repCliTotalCitas: 'Total appointments',
    repCliUltimaCita: 'Last appointment', repCliHistorialCitas: 'Appointment history', repCliVerHistorial: 'View history', repCliOcultarHistorial: 'Hide history',
    repCliSinCitasTexto: 'This client has no scheduled appointments yet.',
    repLblCiudad: 'City', repLblTipoOperacion: 'Operation type', repLblEstado: 'Status', repLblPrioridad: 'Priority', repLblFechaInicial: 'Start date', repLblFechaFinal: 'End date',
    repTodasLasCiudades: 'All cities', repTodasLasOperaciones: 'All operations', repTodosLosEstados: 'All statuses', repTodasLasPrioridades: 'All priorities',
    repOpRenta: 'Rent', repOpVenta: 'Sale', repOpAmbos: 'Rent and sale', repPrioAlta: 'High', repPrioMedia: 'Medium', repPrioBaja: 'Low',
    repBtnImprimirHtml: '🖨️ Print', repBtnBuscarCliente: 'Search client', repBuscarClientePh: 'Search by name or username',
    repNoDataImprimir: 'There is no data to print. First press "Show".', repVentanaBloqueada: 'Your browser blocked the print window. Allow pop-ups for this site and try again.',
    repUsuarioLbl: 'User: ',
    repNoHayPropiedadesBusqueda: 'No properties match your search.', repErrorCargarPropiedades: 'Could not load the property listing.',
    repThNo: 'No.', repThNombreUbicacion: 'Location name', repThVendedor: 'Seller', repThTipoOperacion: 'Operation type', repThValor: 'Value', repThEstado: 'Status', repThFechaCreacion: 'Creation date', repThFotos: 'Photos',
    repTituloReportePropiedades: 'Report — Property Listing',
    repNoHaySolicitudesServicioBusqueda: 'No service requests match your search.', repErrorCargarServicios: 'Could not load the service status.',
    repSinTipoServicio: '(No service type)', repTituloReporteServicios: 'Report — Service Status',
    repThCliente: 'Client', repThTelefono: 'Phone', repThNumSolicitud: 'Request No.', repThPrioridad: 'Priority', repThValor2: 'Value', repThInicio: 'Start', repThFechaSolicitud: 'Request date',
    repCliNombreFallback: 'Client', repThCodigo: 'Code', repThRegistrado: 'Registered', repThSolicitudesServicio: 'Service requests', repThCotizaciones: 'Quotes', repThUltimaActividad: 'Last activity',
    repNoHayClientesBusqueda: 'No clients match your search.', repErrorCargarClientes: 'Could not load the client follow-up.',
    buscarServSub: 'Choose one of the services we offer to go directly to its information.',
    authTitle: 'Property Promotion and Sale Authorization Form', authSub: 'As the owner of the property described below, I authorize Armopa Group to promote it for Rent and/or Sale through whatever means it considers appropriate.',
    fpDatosPropietario: "Owner's Information", fpNombreCompleto: 'Full name', fpFechaNacimiento: 'Date of Birth', fpDpi: 'ID/CUI or Passport', fpRepLegal: 'Legal Representative', fpRazonSocial: 'Business Name', fpNit: 'Tax ID (NIT)', fpTelMovil: 'Mobile phone', fpCorreo: 'Email address', fpDomicilio: 'Current home address',
    fpDescripcionProp: 'Property Description', fpTipo: 'Type', fpTipoPh: 'E.g. House, Apartment, Land…', fpDireccion: 'Address', fpNumero: 'Number', fpFinca: 'Property record (Finca)', fpFolio: 'Folio', fpLibro: 'Book', fpGravamen: 'Lien', fpInstitucion: 'Institution', fpMonto: 'Amount',
    fpMFrente: 'Front (m)', fpMFondo: 'Depth (m)', fpMConst: 'Built area (m²)', fpTerrenoVrs2: 'Lot (Vrs²)', fpMts2: 'm²', fpNiveles: 'Levels', fpEstacionamientos: 'Parking spaces', fpHabitaciones: 'Bedrooms', fpBanos: 'Bathrooms',
    fpLavanderia: 'Laundry room', fpLineaBlanca: 'Appliances', fpHabServicio: 'Maid’s room', fpBodega: 'Storage room', fpAmueblado: 'Furnished', fpBalcon: 'Balcony and/or Terrace / Garden', fpMascota: 'Pet',
    fpAmenidades: 'Building / Condominium Amenities', fpAmMotorLobby: 'Motor lobby', fpAmPiscina: 'Pool', fpAmSauna: 'Sauna', fpAmJuegos: "Children's play area", fpAmAreaVerde: 'Green area', fpAmSalon: 'Multi-purpose room', fpAmGimnasio: 'Gym', fpAmBusiness: 'Business Center', fpAmCanchas: 'Sports courts', fpAmCisterna: 'Cistern and/or Well', fpAmParqueos: 'Number of visitor parking spaces',
    fpPrecioVenta: 'Sale Price', fpValorRegistro: 'Registry value', fpIusi: 'Quarterly IUSI (property tax)',
    fpPrecioAlquiler: 'Rental Price', fpMantenimiento: 'Maintenance fee', fpIncluyeMant: 'What the maintenance fee includes', fpObservaciones: 'Remarks',
    fpSaveBtnHtml: '💾 Save authorization', fpNoteSaved: 'Authorization saved successfully. Thank you.',
    buscarPropTitulo: 'Browse properties', buscarPropSub: 'Filter by city, sector, type, zone, specifications and budget to find the location you are looking for.',
    solNumeroPreview: 'Generated automatically when saved.',
    reqTitle: 'Requirements to sell your property in Guatemala', reqSub: 'This guide was generated with AI based on the typical requirements requested by banks, notaries and the General Property Registry in Guatemala. Upload the PDF of each document you already have ready; you can complete the rest later.',
    reqSinSubir: 'Not uploaded', reqSubirPdfHtml: '📎 Upload PDF',
    reqDpiTitulo: "Owner's ID", reqDpiDesc: 'Valid personal identification document (DPI).',
    reqNitTitulo: "Owner's Tax ID (NIT)", reqNitDesc: 'Tax Identification Number.',
    reqEscrituraTitulo: 'Public property deed', reqEscrituraDesc: 'Title deed or deed of transfer, duly registered.',
    reqRgpTitulo: 'General Property Registry (RGP) certification', reqRgpDesc: 'Valid for no more than 30 days; confirms who the current owner is.',
    reqGravamenesTitulo: 'Lien certification', reqGravamenesDesc: 'Rules out mortgages, liens or encumbrances on the property.',
    reqIusiTitulo: 'IUSI (property tax) clearance and payment receipt', reqIusiDesc: 'Property tax (IUSI) up to date.',
    reqSolvMunTitulo: 'Municipal clearance', reqSolvMunDesc: 'Municipal "boleto de ornato" fee and taxes up to date.',
    reqCatastroTitulo: 'Cadastral certification', reqCatastroDesc: "When the property's municipality has a cadastre.",
    reqPlanosTitulo: 'Registered property plans', reqPlanosDesc: 'If registered construction or lot plans exist.',
    reqEmpresaTitulo: 'Articles of incorporation and business license', reqEmpresaDesc: 'Only if the owner is a company or corporation.',
    reqPoderTitulo: 'Notarized power of attorney', reqPoderDesc: 'Only if a representative or attorney-in-fact acts on behalf of the owner.',
    reqAvaluoTitulo: 'Commercial property appraisal', reqAvaluoDesc: 'Recommended, not mandatory: helps set a realistic sale price.',
    reqNota: 'This guide is for informational purposes and may vary depending on the municipality, whether the property is under a condominium regime, or whether banks are involved. For your specific case, consult a notary or our team.',
    fpErrNombre: "Please enter the owner's full name.", fpErrGuardar: 'We could not save the authorization. Please try again.',
    citaBtnHtml: '📅 Schedule Visit', citaTitle: 'Schedule Visit', citaSub: 'Fill in your details to schedule a visit. We will confirm the details with you by WhatsApp.',
    citaNombreCliente: 'Client name', citaTelefono: 'Phone', citaFecha: 'Visit date', citaHora: 'Visit time', citaCiudad: 'City', citaCiudadPh: 'E.g. Guatemala City',
    citaEtiqueta: 'Tag', citaEtqCliente: 'Client', citaEtqMuyInteresado: 'Very interested', citaEtqInteresado: 'Interested', citaEtqPocoInteresado: 'Slightly interested',
    citaUbicacion: 'Location name', citaUbicacionPh: 'E.g. Apartment at Leben Building, Zone 15',
    citaAsesor: 'Sales Advisor', citaSinVendedor: 'No advisor assigned',
    citaAccion: 'Notes', citaAccionPh: 'Describe the reason or details for the visit…',
    citaEstado: 'Status', citaEstAgendado: 'Scheduled', citaEstEfectuado: 'Completed', citaEstReagendado: 'Rescheduled', citaEstNoAsistio: 'Did not attend',
    citaSaveBtnHtml: '💾 Save visit', citaWaBtn: 'Send by WhatsApp',
    citaErrNombre: "Please enter the client's name.", citaErrGuardar: 'We could not save the visit. Please try again.', citaGuardadaOk: 'Visit saved successfully.',
    citaWaMsgIntro: 'Hello, a visit was scheduled with the following details:', citaWaMsgCliente: 'Client: ', citaWaMsgTelefono: 'Phone: ', citaWaMsgFecha: 'Visit date: ', citaWaMsgHora: 'Visit time: ', citaWaMsgUbicacion: 'Location: ', citaWaMsgCiudad: 'City: ', citaWaMsgAccion: 'Notes: ', citaWaMsgEstado: 'Status: ',
    citaVisitante: 'Visitor'
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
  $$('[data-i18n-html]').forEach((el) => { el.innerHTML = t[el.dataset.i18nHtml]; });
  $$('[data-i18n-label]').forEach((el) => el.setAttribute('aria-label', t[el.dataset.i18nLabel]));
  $$('[data-i18n-alt]').forEach((el) => el.setAttribute('alt', t[el.dataset.i18nAlt]));
  $$('[data-i18n-ph]').forEach((el) => el.setAttribute('placeholder', t[el.dataset.i18nPh]));
  $$('[data-ext]').forEach((el) => { el.textContent = t.ext[+el.dataset.ext]; });
  $$('[data-sv]').forEach((el) => { el.textContent = t.svItems[+el.dataset.sv]; });
  $$('[data-inv]').forEach((el) => { el.textContent = t.invItems[+el.dataset.inv]; });
  $$('[data-tx1]').forEach((el) => { el.textContent = t.txList1[+el.dataset.tx1]; });
  $$('[data-tx2]').forEach((el) => { el.textContent = t.txList2[+el.dataset.tx2]; });
  $$('[data-tx3]').forEach((el) => { el.textContent = t.txList3[+el.dataset.tx3]; });
  $$('.lg').forEach((b) => b.classList.toggle('on', b.dataset.lang === l));
  try { localStorage.setItem('armopaLang', l); } catch (e) {}
  buildDots();
  if (typeof xo !== 'undefined' && xo >= 0) xRender(xo);
  if (typeof refreshQuoteSummary === 'function') refreshQuoteSummary();
  if (typeof cargarServiciosArmopa === 'function') cargarServiciosArmopa();
}
$$('.lg').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

/* Menú móvil */
const navwrap = $('#navwrap'), burger = $('#burger');
burger.addEventListener('click', () => {
  const open = navwrap.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
$$('.links a').forEach((a) => a.addEventListener('click', () => navwrap.classList.remove('open')));

/* Menú "Administración" (solo Super administrador): Administrar Propiedades /
   Administrar Proyectos / Administrar servicios, cada uno salta a su sección.
   (cerrarNavAdminMenu() consulta el DOM directamente, sin depender de
   variables const declaradas más abajo, porque pintarEstadoUsuario() --que
   la llama-- se ejecuta ya desde la carga inicial de la página, antes de
   llegar a esta sección del archivo.) */
function cerrarNavAdminMenu() {
  const drop = $('#navAdminDrop');
  const menu = $('#navAdminMenu');
  const btn = $('#navAdminBtn');
  if (drop) drop.classList.remove('open');
  if (menu) menu.hidden = true;
  if (btn) btn.setAttribute('aria-expanded', 'false');
  // Colapsa los 3 grupos (Catálogos / Negocios / Comisiones) para que el
  // menú vuelva a abrir "cerrado" la próxima vez.
  document.querySelectorAll('.nav-admin-group-items').forEach((it) => { it.hidden = true; });
  document.querySelectorAll('.nav-admin-group-h').forEach((h) => h.setAttribute('aria-expanded', 'false'));
}
const navAdminDrop = $('#navAdminDrop');
const navAdminBtn = $('#navAdminBtn');
const navAdminMenu = $('#navAdminMenu');
navAdminBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  const abrir = navAdminMenu.hidden;
  if (abrir) {
    navAdminDrop.classList.add('open');
    navAdminMenu.hidden = false;
    navAdminBtn.setAttribute('aria-expanded', 'true');
  } else {
    cerrarNavAdminMenu();
  }
});
document.addEventListener('click', (e) => {
  if (navAdminDrop && !navAdminDrop.hidden && !navAdminDrop.contains(e.target)) cerrarNavAdminMenu();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarNavAdminMenu(); });
$$('.nav-admin-menu a').forEach((a) => a.addEventListener('click', () => { cerrarNavAdminMenu(); navwrap.classList.remove('open'); }));

/* Los 3 grupos del menú Administración (Catálogos / Negocios / Comisiones)
   se abren como acordeón: al presionar uno se muestran sus elementos y
   se cierran los demás grupos, para no mostrar todo de una vez. */
$$('.nav-admin-group-h').forEach((h) => {
  h.addEventListener('click', (e) => {
    e.stopPropagation();
    const grupo = h.closest('.nav-admin-group');
    const items = grupo?.querySelector('.nav-admin-group-items');
    if (!items) return;
    const abrir = items.hidden;
    $$('.nav-admin-group').forEach((g) => {
      if (g !== grupo) {
        const otrosItems = g.querySelector('.nav-admin-group-items');
        const otroH = g.querySelector('.nav-admin-group-h');
        if (otrosItems) otrosItems.hidden = true;
        if (otroH) otroH.setAttribute('aria-expanded', 'false');
      }
    });
    items.hidden = !abrir;
    h.setAttribute('aria-expanded', String(abrir));
  });
});

/* "Propiedades" dentro del menú Administración: en vez de saltar a una
   sección, abre un listado vertical con todas las propiedades (de todas las
   ciudades), su estado, fecha/usuario del último cambio, vendedor asignado
   y su comisión (% y valor calculado). Lee directamente de la variable
   "data" ya cargada desde Supabase para las propiedades, y permite
   Modificar/Guardar/Eliminar cada una sin salir del listado. */
function proyEstadoBadge(c) {
  const info = ubicEstadoInfo(c.estado);
  const badge = el('span', 'sol-badge', info.l);
  badge.style.background = info.bg;
  badge.style.color = info.fg;
  return badge;
}

function proyCardHead(city, c) {
  const info = ubicEstadoInfo(c.estado);
  const badge = el('span', 'sol-badge', info.l);
  badge.style.background = info.bg;
  badge.style.color = info.fg;
  const head = el('div', 'proy-card-h');
  const nameWrap = el('div', 'proy-name-wrap');
  const nameEl = el('div', 'proy-name', c.name || T[lang].adminSinNombre);
  nameEl.title = c.name || '';
  nameWrap.append(nameEl, el('div', 'proy-city', city));
  head.append(nameWrap, badge);
  return head;
}

function proyRenderView(card, city, c) {
  const t = T[lang];
  card.innerHTML = '';
  card.classList.remove('proy-card-edit');
  const actions = el('div', 'proy-actions');
  const modBtn = el('button', 'btn btn-line-dark btn-sm', t.btnModificar); modBtn.type = 'button';
  const delBtn = el('button', 'btn btn-line-dark btn-sm sol-del', t.btnEliminar); delBtn.type = 'button';
  actions.append(modBtn, delBtn);
  card.append(
    proyCardHead(city, c),
    el('div', 'proy-grid') // placeholder reemplazado abajo
  );
  const grid = card.querySelector('.proy-grid');
  grid.append(
    labeledCell(t.admEstado, proyEstadoBadge(c)),
    labeledCell(t.admFechaCambio, el('span', '', c.estadoFecha ? formatQBuscarRegFecha(c.estadoFecha) : '—')),
    labeledCell(t.admUsuarioCambia, el('span', '', c.estadoUsuario || '—')),
    labeledCell(t.admVendedorAsignado, el('span', '', c.vendedorAsignado || '—')),
    labeledCell(t.admPctComision, el('span', '', c.comisionPorcentaje ? (c.comisionPorcentaje + '%') : '—')),
    labeledCell(t.admValorComision, el('strong', 'proy-valor', formatQ(comisionValorCalc(c))))
  );
  card.appendChild(actions);

  modBtn.addEventListener('click', () => proyRenderEdit(card, city, c));
  delBtn.addEventListener('click', async () => {
    if (!confirm(t.admConfirmEliminarUbicacion)) return;
    delBtn.disabled = true;
    try {
      await eliminarUbicacionDesdeListado(city, c);
      card.remove();
      if (!$('#adminProyectosList').children.length) pintarAdminProyectosList();
    } catch (e) {
      console.error('Error eliminando la ubicación:', e);
      alert(t.admErrorEliminarUbicacion);
      delBtn.disabled = false;
    }
  });
}

function proyRenderEdit(card, city, c) {
  const t = T[lang];
  card.innerHTML = '';
  card.classList.add('proy-card-edit');

  const estadoSel = document.createElement('select');
  UBIC_ESTADOS.forEach((e) => {
    const opt = document.createElement('option');
    opt.value = e.v; opt.textContent = e.l;
    if (e.v === c.estado) opt.selected = true;
    estadoSel.appendChild(opt);
  });

  const vendedorInput = document.createElement('input');
  vendedorInput.type = 'text';
  vendedorInput.value = c.vendedorAsignado || '';
  vendedorInput.placeholder = t.admPlaceholderVendedorAsignado;
  const vendedorList = document.createElement('datalist');
  vendedorList.id = 'proyVendedorList-' + c.id;
  fillDatalist(vendedorList, vendedoresConocidos());
  vendedorInput.setAttribute('list', vendedorList.id);

  const comisionInput = document.createElement('input');
  comisionInput.type = 'number';
  comisionInput.min = '0'; comisionInput.max = '100'; comisionInput.step = '0.1';
  comisionInput.value = c.comisionPorcentaje || '';
  comisionInput.placeholder = '%';

  const valorPreview = el('strong', 'proy-valor', formatQ(comisionValorCalc(c)));
  comisionInput.addEventListener('input', () => {
    valorPreview.textContent = formatQ(comisionValorCalc({ ...c, comisionPorcentaje: comisionInput.value }));
  });

  const actions = el('div', 'proy-actions');
  const saveBtn = el('button', 'btn btn-dark btn-sm', t.btnGuardar); saveBtn.type = 'button';
  const cancelBtn = el('button', 'btn btn-line-dark btn-sm', t.btnCancelar); cancelBtn.type = 'button';
  actions.append(saveBtn, cancelBtn);

  card.append(proyCardHead(city, c));
  const grid = el('div', 'proy-grid');
  grid.append(
    labeledCell(t.admEstadoUbicacion, estadoSel),
    labeledCell(t.admVendedorAsignado, vendedorInput),
    labeledCell(t.admPctComision, comisionInput),
    labeledCell(t.admValorComision, valorPreview)
  );
  card.append(grid, vendedorList, actions);

  cancelBtn.addEventListener('click', () => proyRenderView(card, city, c));
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    try {
      await guardarUbicacionDesdeListado(city, c, estadoSel.value, vendedorInput.value.trim(), comisionInput.value);
      proyRenderView(card, city, c);
    } catch (e) {
      console.error('Error guardando la ubicación:', e);
      alert(t.adminErrorGuardarCambio);
      saveBtn.disabled = false;
    }
  });
}

async function guardarUbicacionDesdeListado(city, c, nuevoEstado, nuevoVendedor, nuevaComision) {
  c.estado = nuevoEstado;
  c.vendedorAsignado = nuevoVendedor;
  c.comisionPorcentaje = nuevaComision;
  c.estadoFecha = new Date().toISOString();
  c.estadoUsuario = localStorage.getItem(LOGIN_STORE) || '';
  persistLocalOnly();
  const row = toSupaRow(city, c);
  const { error } = await supabaseClient.from('propiedades').upsert(row, { onConflict: 'ciudad,local_id' });
  if (error) throw error;
}

async function eliminarUbicacionDesdeListado(city, c) {
  const arr = data[city];
  if (arr) {
    const idx = arr.findIndex((x) => x.id === c.id);
    if (idx !== -1) arr.splice(idx, 1);
  }
  persistLocalOnly();
  const { error } = await supabaseClient.from('propiedades').delete().eq('ciudad', city).eq('local_id', c.id);
  if (error) throw error;
}

function proyCiudadesOrdenadas() {
  return Object.keys(data).sort((a, b) => a.localeCompare(b, 'es'));
}

/* Lista de ubicaciones de todas las ciudades (o solo de una, si se indica),
   cada una con su ciudad, para poblar el selector de ubicación. */
function proyUbicacionesPlano(cityFiltro) {
  const out = [];
  const ciudades = cityFiltro ? [cityFiltro] : proyCiudadesOrdenadas();
  ciudades.forEach((city) => {
    (data[city] || []).forEach((c) => out.push({ city, c }));
  });
  return out;
}

function poblarAdminPropCiudadSel() {
  const sel = $('#adminPropCiudadSel');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '';
  const optTodas = document.createElement('option');
  optTodas.value = ''; optTodas.textContent = T[lang].admTodasLasCiudades;
  sel.appendChild(optTodas);
  proyCiudadesOrdenadas().forEach((city) => {
    const opt = document.createElement('option');
    opt.value = city; opt.textContent = city;
    sel.appendChild(opt);
  });
  if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

function poblarAdminPropUbicacionSel() {
  const sel = $('#adminPropUbicacionSel');
  const ciudadSel = $('#adminPropCiudadSel');
  if (!sel) return;
  const ciudadFiltro = ciudadSel ? ciudadSel.value : '';
  sel.innerHTML = '';
  const optTodas = document.createElement('option');
  optTodas.value = ''; optTodas.textContent = T[lang].admTodasLasUbicaciones;
  sel.appendChild(optTodas);
  proyUbicacionesPlano(ciudadFiltro || null).forEach(({ city, c }) => {
    const opt = document.createElement('option');
    opt.value = city + '::' + c.id;
    opt.textContent = (c.name || T[lang].adminSinNombre) + (ciudadFiltro ? '' : (' · ' + city));
    sel.appendChild(opt);
  });
}

$('#adminPropCiudadSel')?.addEventListener('change', () => poblarAdminPropUbicacionSel());

function poblarAdminPropEstadoSel() {
  const sel = $('#adminPropEstadoSel');
  if (!sel || sel.options.length) return;
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = T[lang].admTodosLosEstados;
  sel.appendChild(optTodos);
  UBIC_ESTADOS.forEach((e) => {
    const opt = document.createElement('option');
    opt.value = e.v; opt.textContent = e.l;
    opt.style.color = e.fg; opt.style.backgroundColor = e.bg;
    sel.appendChild(opt);
  });
}

/* La lista de vendedores de este filtro viene del catálogo de
   Administración > Vendedores (no de texto libre harvesteado de las
   propiedades), para que solo aparezcan los vendedores realmente
   registrados. */
function poblarAdminPropVendedorSel() {
  const sel = $('#adminPropVendedorSel');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '';
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = T[lang].admTodosLosVendedores;
  sel.appendChild(optTodos);
  vendedoresCatalogo.forEach((v) => {
    const nombre = (v.nombre || '').trim();
    if (!nombre) return;
    const opt = document.createElement('option');
    opt.value = nombre; opt.textContent = nombre;
    sel.appendChild(opt);
  });
  if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

function pintarAdminProyectosList(cityFiltro, ubicacionFiltro, estadoFiltro, vendedorFiltro) {
  const list = $('#adminProyectosList');
  if (!list) return;
  list.innerHTML = '';
  let total = 0;
  proyUbicacionesPlano(cityFiltro || null).forEach(({ city, c }) => {
    if (ubicacionFiltro && (city + '::' + c.id) !== ubicacionFiltro) return;
    if (estadoFiltro && c.estado !== estadoFiltro) return;
    if (vendedorFiltro) {
      const nombreVendedorAsignado = (c.vendedorAsignado || '').trim();
      const nombreVendedorLoc = (c.sName || '').trim();
      if (nombreVendedorAsignado !== vendedorFiltro && nombreVendedorLoc !== vendedorFiltro) return;
    }
    const card = el('div', 'proy-card');
    proyRenderView(card, city, c);
    list.appendChild(card);
    total++;
  });
  if (!total) list.innerHTML = '<p class="proy-empty">' + T[lang].admNoHayUbicaciones + '</p>';
}

$('#adminPropMostrarBtn')?.addEventListener('click', () => {
  const ciudadFiltro = $('#adminPropCiudadSel')?.value || '';
  const ubicacionFiltro = $('#adminPropUbicacionSel')?.value || '';
  const estadoFiltro = $('#adminPropEstadoSel')?.value || '';
  const vendedorFiltro = $('#adminPropVendedorSel')?.value || '';
  pintarAdminProyectosList(ciudadFiltro, ubicacionFiltro, estadoFiltro, vendedorFiltro);
});

const adminProyectosModal = $('#adminProyectosModal');
function abrirAdminProyectosModal() {
  if (!adminProyectosModal) return;
  if (!vendedoresCatalogoCargado) { vendedoresCatalogoCargado = true; cargarVendedoresCatalogo(); }
  poblarAdminPropCiudadSel();
  poblarAdminPropUbicacionSel();
  poblarAdminPropEstadoSel();
  poblarAdminPropVendedorSel();
  if ($('#adminPropCiudadSel')) $('#adminPropCiudadSel').value = '';
  if ($('#adminPropUbicacionSel')) $('#adminPropUbicacionSel').value = '';
  if ($('#adminPropEstadoSel')) $('#adminPropEstadoSel').value = '';
  if ($('#adminPropVendedorSel')) $('#adminPropVendedorSel').value = '';
  pintarAdminProyectosList();
  adminProyectosModal.hidden = false;
}
function cerrarAdminProyectosModal() { if (adminProyectosModal) adminProyectosModal.hidden = true; }
$('#navAdminPropiedadesBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  abrirAdminProyectosModal();
});
$('#adminProyectosClose')?.addEventListener('click', cerrarAdminProyectosModal);
$('#adminProyectosScrim')?.addEventListener('click', cerrarAdminProyectosModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && adminProyectosModal && !adminProyectosModal.hidden) cerrarAdminProyectosModal(); });

/* "Proyectos" dentro del menú Administración: mismo concepto que
   "Propiedades" (listado vertical, filtros y Modificar/Guardar/Eliminar sin
   salir del listado), aplicado a las solicitudes de servicio (tabla
   solicitudes_servicio). A diferencia de las propiedades, estas no están
   precargadas en el cliente, así que se consultan a Supabase cada vez que se
   abre el modal. Los filtros son por proyecto (cada solicitud individual) y
   por estado (SOL_ESTADOS). El valor de comisión se calcula con el
   porcentaje guardado en la solicitud sobre el presupuesto asignado de la
   cotización relacionada (tabla "cotizaciones", columna
   "presupuesto_asignado"), igual que en Propiedades pero usando ese
   presupuesto en vez del precio de venta/renta. */
let adminSolData = [];

function solPresupuestoBase(r) {
  return extractNumber(r.presupuestoCotizacion);
}
function solComisionValorCalc(r) {
  const pct = extractNumber(r.comision_porcentaje);
  const precio = solPresupuestoBase(r);
  if (pct == null || precio == null) return null;
  return (pct / 100) * precio;
}

function solEstadoBadge(r) {
  const info = solEstadoInfo(r.estado);
  const badge = el('span', 'sol-badge', info.l);
  badge.style.background = info.bg;
  badge.style.color = info.fg;
  return badge;
}

function solCardHead(r) {
  const info = solEstadoInfo(r.estado);
  const badge = el('span', 'sol-badge', info.l);
  badge.style.background = info.bg;
  badge.style.color = info.fg;
  const head = el('div', 'proy-card-h');
  const nameWrap = el('div', 'proy-name-wrap');
  const nameEl = el('div', 'proy-name', r.servicio || T[lang].admServicioSinEspecificar);
  nameEl.title = r.servicio || '';
  nameWrap.append(nameEl, el('div', 'proy-city', r.direccion || T[lang].admSinPropiedadAsignada));
  head.append(nameWrap, badge);
  return head;
}

function solRenderView(card, r) {
  const t = T[lang];
  card.innerHTML = '';
  card.classList.remove('proy-card-edit');
  const actions = el('div', 'proy-actions');
  const modBtn = el('button', 'btn btn-line-dark btn-sm', t.btnModificar); modBtn.type = 'button';
  const delBtn = el('button', 'btn btn-line-dark btn-sm sol-del', t.btnEliminar); delBtn.type = 'button';
  actions.append(modBtn, delBtn);
  card.append(
    solCardHead(r),
    el('div', 'proy-grid') // placeholder reemplazado abajo
  );
  const grid = card.querySelector('.proy-grid');
  grid.append(
    labeledCell(t.admCliente, el('span', '', r.nombre_cliente || (r.cliente_codigo ? ('#' + r.cliente_codigo) : '—'))),
    labeledCell(t.admDescripcionRealizar, el('span', '', r.necesidad || '—')),
    labeledCell(t.admValor, el('strong', '', formatQ(solPresupuestoBase(r)))),
    labeledCell(t.admEstado, solEstadoBadge(r)),
    labeledCell(t.admPrioridad, el('span', '', r.prioridad ? (r.prioridad.charAt(0).toUpperCase() + r.prioridad.slice(1)) : '—')),
    labeledCell(t.admNumSolicitud, el('strong', 'sol-num', r.numero_solicitud || '—')),
    labeledCell(t.admVendedorAsignado, el('span', '', r.vendedor_asignado || '—')),
    labeledCell(t.admPctComision, el('span', '', r.comision_porcentaje ? (r.comision_porcentaje + '%') : '—')),
    labeledCell(t.admValorComision, el('strong', 'proy-valor', formatQ(solComisionValorCalc(r)))),
    labeledCell(t.admFechaCambioEstado, el('span', '', r.estado_fecha ? formatQBuscarRegFecha(r.estado_fecha) : '—'))
  );
  // El Promotor de Negocios (del catálogo de Vendedores) solo lo ve y
  // administra el Administrador o el Super Administrador.
  if (esAdminOSuperAdmin()) {
    grid.appendChild(labeledCell(t.admPromotorNegocios, el('span', '', r.promotor_negocio || '—')));
  }
  card.appendChild(actions);

  modBtn.addEventListener('click', () => solRenderEdit(card, r));
  delBtn.addEventListener('click', async () => {
    if (!confirm(t.admConfirmEliminarSolicitud)) return;
    delBtn.disabled = true;
    try {
      await eliminarSolicitudDesdeListado(r);
      card.remove();
      if (!$('#adminSolicitudesList').children.length) pintarAdminSolicitudesList();
    } catch (e) {
      console.error('Error eliminando la solicitud de servicio:', e);
      alert(t.admErrorEliminarSolicitud);
      delBtn.disabled = false;
    }
  });
}

function solRenderEdit(card, r) {
  const t = T[lang];
  card.innerHTML = '';
  card.classList.add('proy-card-edit');

  const estadoSel = document.createElement('select');
  SOL_ESTADOS.forEach((e) => {
    const opt = document.createElement('option');
    opt.value = e.v; opt.textContent = e.l;
    if (e.v === r.estado) opt.selected = true;
    estadoSel.appendChild(opt);
  });

  const prioridadSel = document.createElement('select');
  [{ v: '', l: t.admSinDefinir }, { v: 'alta', l: t.admPrioridadAlta }, { v: 'media', l: t.admPrioridadMedia }, { v: 'baja', l: t.admPrioridadBaja }].forEach((p) => {
    const opt = document.createElement('option');
    opt.value = p.v; opt.textContent = p.l;
    if (p.v === (r.prioridad || '')) opt.selected = true;
    prioridadSel.appendChild(opt);
  });

  const vendedorInput = document.createElement('input');
  vendedorInput.type = 'text';
  vendedorInput.value = r.vendedor_asignado || '';
  vendedorInput.placeholder = t.admPlaceholderVendedorAsignado;
  const vendedorList = document.createElement('datalist');
  vendedorList.id = 'solVendedorList-' + r.id;
  fillDatalist(vendedorList, vendedoresConocidos());
  vendedorInput.setAttribute('list', vendedorList.id);

  const comisionInput = document.createElement('input');
  comisionInput.type = 'number';
  comisionInput.min = '0'; comisionInput.max = '100'; comisionInput.step = '0.1';
  comisionInput.value = r.comision_porcentaje || '';
  comisionInput.placeholder = '%';

  const valorPreview = el('strong', 'proy-valor', formatQ(solComisionValorCalc(r)));
  comisionInput.addEventListener('input', () => {
    valorPreview.textContent = formatQ(solComisionValorCalc({ ...r, comision_porcentaje: comisionInput.value }));
  });

  // El Promotor de Negocios (del catálogo de Vendedores) solo lo ve y
  // administra el Administrador o el Super Administrador.
  const puedeEditarPromotor = esAdminOSuperAdmin();
  let promotorSel = null;
  if (puedeEditarPromotor) {
    promotorSel = document.createElement('select');
    const optVacio = document.createElement('option');
    optVacio.value = ''; optVacio.textContent = t.admSeleccionaPromotor;
    promotorSel.appendChild(optVacio);
    vendedoresCatalogo.forEach((v) => {
      const nombre = (v.nombre || '').trim();
      if (!nombre) return;
      const opt = document.createElement('option');
      opt.value = nombre; opt.textContent = nombre;
      promotorSel.appendChild(opt);
    });
    const actual = (r.promotor_negocio || '').trim();
    if (actual && ![...promotorSel.options].some((o) => o.value === actual)) {
      const opt = document.createElement('option');
      opt.value = actual; opt.textContent = actual + t.admNoEstaEnVendedores;
      promotorSel.appendChild(opt);
    }
    promotorSel.value = actual;
  }

  const actions = el('div', 'proy-actions');
  const saveBtn = el('button', 'btn btn-dark btn-sm', t.btnGuardar); saveBtn.type = 'button';
  const cancelBtn = el('button', 'btn btn-line-dark btn-sm', t.btnCancelar); cancelBtn.type = 'button';
  actions.append(saveBtn, cancelBtn);

  card.append(solCardHead(r));
  const grid = el('div', 'proy-grid');
  grid.append(
    labeledCell(t.admCliente, el('span', '', r.nombre_cliente || (r.cliente_codigo ? ('#' + r.cliente_codigo) : '—'))),
    labeledCell(t.admDescripcionRealizar, el('span', '', r.necesidad || '—')),
    labeledCell(t.admValor, el('strong', '', formatQ(solPresupuestoBase(r)))),
    labeledCell(t.admEstado, estadoSel),
    labeledCell(t.admPrioridad, prioridadSel),
    labeledCell(t.admNumSolicitud, el('strong', 'sol-num', r.numero_solicitud || '—')),
    labeledCell(t.admVendedorAsignado, vendedorInput),
    labeledCell(t.admPctComision, comisionInput),
    labeledCell(t.admValorComision, valorPreview)
  );
  if (promotorSel) grid.appendChild(labeledCell(t.admPromotorNegocios, promotorSel));
  card.append(grid, vendedorList, actions);

  cancelBtn.addEventListener('click', () => solRenderView(card, r));
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    try {
      await guardarSolicitudDesdeListado(r, estadoSel.value, prioridadSel.value, vendedorInput.value.trim(), comisionInput.value, promotorSel ? promotorSel.value : r.promotor_negocio);
      solRenderView(card, r);
    } catch (e) {
      console.error('Error guardando la solicitud de servicio:', e);
      alert(t.adminErrorGuardarCambio);
      saveBtn.disabled = false;
    }
  });
}

async function guardarSolicitudDesdeListado(r, nuevoEstado, nuevaPrioridad, nuevoVendedor, nuevaComision, nuevoPromotor) {
  const payload = {
    estado: nuevoEstado,
    prioridad: nuevaPrioridad || null,
    vendedor_asignado: nuevoVendedor || null,
    comision_porcentaje: nuevaComision || null,
    promotor_negocio: nuevoPromotor || null,
    estado_fecha: new Date().toISOString()
  };
  const { error } = await supabaseClient.from('solicitudes_servicio').update(payload).eq('id', r.id);
  if (error) throw error;
  r.estado = payload.estado;
  r.prioridad = payload.prioridad;
  r.vendedor_asignado = payload.vendedor_asignado;
  r.comision_porcentaje = payload.comision_porcentaje;
  r.promotor_negocio = payload.promotor_negocio;
  r.estado_fecha = payload.estado_fecha;
}

async function eliminarSolicitudDesdeListado(r) {
  const { error } = await supabaseClient.from('solicitudes_servicio').delete().eq('id', r.id);
  if (error) throw error;
  const idx = adminSolData.findIndex((x) => x.id === r.id);
  if (idx !== -1) adminSolData.splice(idx, 1);
}

function solEtiquetaProyecto(r) {
  const num = r.numero_solicitud ? (r.numero_solicitud + ' — ') : '';
  const dir = r.direccion ? (' · ' + r.direccion) : '';
  return num + (r.servicio || 'Servicio sin especificar') + dir;
}

function poblarAdminSolProyectoSel() {
  const sel = $('#adminSolProyectoSel');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '';
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = T[lang].admTodosLosProyectos;
  sel.appendChild(optTodos);
  adminSolData.forEach((r) => {
    const opt = document.createElement('option');
    opt.value = String(r.id); opt.textContent = solEtiquetaProyecto(r);
    sel.appendChild(opt);
  });
  if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

function poblarAdminSolEstadoSel() {
  const sel = $('#adminSolEstadoSel');
  if (!sel || sel.options.length) return;
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = T[lang].admTodosLosEstados;
  sel.appendChild(optTodos);
  SOL_ESTADOS.forEach((e) => {
    const opt = document.createElement('option');
    opt.value = e.v; opt.textContent = e.l;
    sel.appendChild(opt);
  });
}

/* La lista de vendedores/promotores de negocio de este filtro viene del
   catálogo de Administración > Vendedores, igual que en el filtro de
   Propiedades. */
function poblarAdminSolVendedorSel() {
  const sel = $('#adminSolVendedorSel');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '';
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = T[lang].admTodosLosVendedores;
  sel.appendChild(optTodos);
  vendedoresCatalogo.forEach((v) => {
    const nombre = (v.nombre || '').trim();
    if (!nombre) return;
    const opt = document.createElement('option');
    opt.value = nombre; opt.textContent = nombre;
    sel.appendChild(opt);
  });
  if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

function pintarAdminSolicitudesList(proyectoFiltro, estadoFiltro, vendedorFiltro) {
  const list = $('#adminSolicitudesList');
  if (!list) return;
  list.innerHTML = '';
  let total = 0;
  adminSolData.forEach((r) => {
    if (proyectoFiltro && String(r.id) !== proyectoFiltro) return;
    if (estadoFiltro && r.estado !== estadoFiltro) return;
    if (vendedorFiltro && (r.vendedor_asignado || '').trim() !== vendedorFiltro) return;
    const card = el('div', 'proy-card');
    solRenderView(card, r);
    list.appendChild(card);
    total++;
  });
  if (!total) list.innerHTML = '<p class="proy-empty">' + T[lang].admNoHayProyectos + '</p>';
}

$('#adminSolMostrarBtn')?.addEventListener('click', () => {
  const proyectoFiltro = $('#adminSolProyectoSel')?.value || '';
  const estadoFiltro = $('#adminSolEstadoSel')?.value || '';
  const vendedorFiltro = $('#adminSolVendedorSel')?.value || '';
  pintarAdminSolicitudesList(proyectoFiltro, estadoFiltro, vendedorFiltro);
});

async function cargarAdminSolData() {
  const list = $('#adminSolicitudesList');
  if (list) list.innerHTML = '<p class="proy-empty">' + T[lang].adminCargandoPuntos + '</p>';
  try {
    const { data: rows, error } = await supabaseClient
      .from('solicitudes_servicio')
      .select('id, servicio, direccion, nombre_cliente, telefono_cliente, prioridad, tiempo_estimado, fecha_inicio, estado, numero_solicitud, cliente_codigo, fecha_cotizacion, necesidad, cotizacion_id, vendedor_asignado, comision_porcentaje, promotor_negocio, estado_fecha')
      .order('id', { ascending: false });
    if (error) throw error;
    adminSolData = rows || [];
    // Presupuesto de cada cotización relacionada, para calcular el valor de
    // comisión (% comisión de la solicitud × presupuesto de su cotización).
    const cotIds = [...new Set(adminSolData.map((r) => r.cotizacion_id).filter((id) => id != null))];
    if (cotIds.length) {
      const { data: cots, error: cotErr } = await supabaseClient
        .from('cotizaciones')
        .select('id, presupuesto_asignado')
        .in('id', cotIds);
      if (cotErr) throw cotErr;
      const presupuestoPorCotizacion = {};
      (cots || []).forEach((c) => { presupuestoPorCotizacion[c.id] = c.presupuesto_asignado; });
      adminSolData.forEach((r) => {
        r.presupuestoCotizacion = r.cotizacion_id != null ? presupuestoPorCotizacion[r.cotizacion_id] : null;
      });
    }
  } catch (e) {
    console.error('Error cargando las solicitudes de servicio:', e);
    adminSolData = [];
  }
  poblarAdminSolProyectoSel();
  poblarAdminSolVendedorSel();
  if ($('#adminSolProyectoSel')) $('#adminSolProyectoSel').value = '';
  if ($('#adminSolEstadoSel')) $('#adminSolEstadoSel').value = '';
  if ($('#adminSolVendedorSel')) $('#adminSolVendedorSel').value = '';
  pintarAdminSolicitudesList();
}

const adminSolicitudesModal = $('#adminSolicitudesModal');
function abrirAdminSolicitudesModal() {
  if (!adminSolicitudesModal) return;
  if (!vendedoresCatalogoCargado) { vendedoresCatalogoCargado = true; cargarVendedoresCatalogo(); }
  poblarAdminSolEstadoSel();
  adminSolicitudesModal.hidden = false;
  cargarAdminSolData();
}
function cerrarAdminSolicitudesModal() { if (adminSolicitudesModal) adminSolicitudesModal.hidden = true; }
$('#navAdminProyectosBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  abrirAdminSolicitudesModal();
});
$('#adminSolicitudesClose')?.addEventListener('click', cerrarAdminSolicitudesModal);
$('#adminSolicitudesScrim')?.addEventListener('click', cerrarAdminSolicitudesModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && adminSolicitudesModal && !adminSolicitudesModal.hidden) cerrarAdminSolicitudesModal(); });

/* "Servicios" dentro del menú Administración: mismo concepto que
   "Propiedades"/"Proyectos", pero en formato de tabla (igual estilo que el
   panel "Buscar Servicio" ya existente dentro de "Solicitar cotización"),
   con filtros de tipo de servicio, estado y lista de registros, y
   agregando a cada fila cuatro elementos: Valor del servicio (presupuesto
   de la cotización relacionada), Vendedor asignado, % Comisión y Valor de
   comisión (calculado igual que en Proyectos). Usa sus propios
   identificadores (prefijo adminSrv) para no interferir con el panel
   "Buscar Servicio" original. */
function poblarAdminSrvTipoSel() {
  const sel = $('#adminSrvTipoSel');
  if (!sel || sel.options.length) return;
  const t = T[lang] || T.es;
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = t.admTodosLosServicios;
  sel.appendChild(optTodos);
  t.ext.forEach((name, i) => {
    const opt = document.createElement('option');
    opt.value = String(i); opt.textContent = name;
    sel.appendChild(opt);
  });
}

function poblarAdminSrvEstadoSel() {
  const sel = $('#adminSrvEstadoSel');
  if (!sel || sel.options.length) return;
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = T[lang].admTodosLosEstados;
  sel.appendChild(optTodos);
  SOL_ESTADOS.forEach((e) => {
    const opt = document.createElement('option');
    opt.value = e.v; opt.textContent = e.l;
    opt.style.color = e.fg; opt.style.backgroundColor = e.bg;
    sel.appendChild(opt);
  });
}

/* Lista dinámica de "Promotor de negocio" para el filtro de Servicios,
   armada a partir del catálogo de Vendedores (igual que en Propiedades y
   Proyectos). */
function poblarAdminSrvPromotorSel() {
  const sel = $('#adminSrvPromotorSel');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '';
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = T[lang].admTodosLosPromotores;
  sel.appendChild(optTodos);
  vendedoresCatalogo.forEach((v) => {
    const nombre = (v.nombre || '').trim();
    if (!nombre) return;
    const opt = document.createElement('option');
    opt.value = nombre; opt.textContent = nombre;
    sel.appendChild(opt);
  });
  if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

async function cargarAdminSrvLista() {
  const listaSel = $('#adminSrvListaSel');
  const hint = $('#adminSrvHint');
  if (!listaSel) return;
  listaSel.innerHTML = '';
  if (hint) hint.textContent = T[lang].adminCargandoPuntos;
  const tipoSel = $('#adminSrvTipoSel');
  const estadoSel = $('#adminSrvEstadoSel');
  const promotorSel = $('#adminSrvPromotorSel');
  const fechaDesdeVal = $('#adminSrvFechaDesde')?.value || null;
  const fechaHastaVal = $('#adminSrvFechaHasta')?.value || null;
  const t = T[lang] || T.es;
  const tipoIdx = tipoSel && tipoSel.value !== '' ? Number(tipoSel.value) : null;
  const estadoVal = estadoSel && estadoSel.value !== '' ? estadoSel.value : null;
  const promotorVal = promotorSel && promotorSel.value !== '' ? promotorSel.value : null;
  try {
    let query = supabaseClient
      .from('solicitudes_servicio')
      .select('id, numero_solicitud, nombre_cliente, cotizacion_id, created_at, estado')
      .order('id', { ascending: false })
      .limit(200);
    if (tipoIdx !== null) query = query.eq('servicio', t.ext[tipoIdx]);
    if (estadoVal !== null) query = query.eq('estado', estadoVal);
    if (promotorVal !== null) query = query.eq('promotor_negocio', promotorVal);
    if (fechaDesdeVal) query = query.gte('created_at', fechaDesdeVal + 'T00:00:00');
    if (fechaHastaVal) query = query.lte('created_at', fechaHastaVal + 'T23:59:59');
    const { data, error } = await query;
    if (error) throw error;
    const filas = data || [];
    const idsCotizacion = [...new Set(filas.map((r) => r.cotizacion_id).filter((v) => v != null))];
    let presupuestos = {};
    if (idsCotizacion.length) {
      const { data: cots, error: errCot } = await supabaseClient
        .from('cotizaciones')
        .select('id, presupuesto_asignado')
        .in('id', idsCotizacion);
      if (!errCot && cots) cots.forEach((c) => { presupuestos[c.id] = c.presupuesto_asignado; });
    }
    if (!filas.length) {
      const opt = document.createElement('option');
      opt.value = ''; opt.textContent = t.admSinSolicitudesRegistradas;
      listaSel.appendChild(opt);
      if (hint) hint.textContent = '';
      return;
    }
    const optTodosReg = document.createElement('option');
    optTodosReg.value = QBUSCARREG_TODOS;
    optTodosReg.textContent = t.admTodosLosRegistros + filas.length + ')';
    listaSel.appendChild(optTodosReg);
    filas.forEach((r) => {
      const opt = document.createElement('option');
      opt.value = String(r.id);
      const presupuesto = formatQBuscarRegPresupuesto(presupuestos[r.cotizacion_id]);
      const fecha = formatQBuscarRegFecha(r.created_at);
      opt.textContent = (r.numero_solicitud || ('#' + r.id)) + ' · ' + (r.nombre_cliente || t.adminSinNombre) + ' · ' + fecha + ' · ' + presupuesto;
      listaSel.appendChild(opt);
    });
    if (hint) hint.textContent = filas.length + (filas.length === 1 ? t.admSolicitudEncontrada : t.admSolicitudesEncontradas);
  } catch (e) {
    console.error('Error cargando la lista de servicios:', e);
    const opt = document.createElement('option');
    opt.value = ''; opt.textContent = t.admErrorAlCargar;
    listaSel.appendChild(opt);
    if (hint) hint.textContent = t.admNoSePudoCargarLista;
  }
}

function adminSrvComisionValorCalc(sol, presupuesto) {
  const pct = extractNumber(sol.comision_porcentaje);
  const precio = extractNumber(presupuesto);
  if (pct == null || precio == null) return null;
  return (pct / 100) * precio;
}

function adminSrvBuildRow(sol, presupuesto) {
  const row = el('div', 'sol-row srv-row-id');
  adminSrvRenderRowView(row, sol, presupuesto);
  return row;
}

function adminSrvRenderRowView(row, sol, presupuesto) {
  const t = T[lang];
  row.innerHTML = '';
  const info = solEstadoInfo(sol.estado);
  const estBadge = el('span', 'sol-badge', info.l);
  estBadge.style.background = info.bg;
  estBadge.style.color = info.fg;
  const actions = el('div', 'sol-actions');
  const modBtn = el('button', 'btn btn-line-dark btn-sm', t.btnModificar); modBtn.type = 'button';
  const delBtn = el('button', 'btn btn-line-dark btn-sm sol-del', t.btnEliminar); delBtn.type = 'button';
  actions.append(modBtn, delBtn);
  row.append(
    labeledCell(t.admNoNumSolicitud, el('strong', 'sol-num', sol.numero_solicitud || ('#' + sol.id))),
    labeledCell(t.admNombreCliente, el('span', 'sol-cli', sol.nombre_cliente || '—')),
    labeledCell(t.admFechaSolicitud, el('span', 'sol-cli', formatQBuscarRegFecha(sol.created_at))),
    labeledCell(t.admEstado, estBadge),
    labeledCell(t.admFechaCambioEstado, el('span', 'sol-cli', sol.estado_actualizado_en ? formatQBuscarRegFecha(sol.estado_actualizado_en) : '—')),
    labeledCell(t.admUsuarioModifica, el('span', 'sol-cli', sol.estado_actualizado_por || '—')),
    labeledCell(t.admValorDelServicio, el('strong', 'sol-cli', formatQBuscarRegPresupuesto(presupuesto))),
    labeledCell(t.admVendedorAsignado, el('span', 'sol-cli', sol.vendedor_asignado || '—')),
    labeledCell(t.admPctComision, el('span', 'sol-cli', sol.comision_porcentaje ? (sol.comision_porcentaje + '%') : '—')),
    labeledCell(t.admValorComision, el('strong', 'proy-valor', formatQ(adminSrvComisionValorCalc(sol, presupuesto)))),
    actions
  );
  modBtn.addEventListener('click', () => adminSrvRenderRowEdit(row, sol, presupuesto));
  delBtn.addEventListener('click', async () => {
    if (!confirm(t.admConfirmEliminarSolicitud)) return;
    delBtn.disabled = true;
    try {
      const { error } = await supabaseClient.from('solicitudes_servicio').delete().eq('id', sol.id);
      if (error) throw error;
      await cargarAdminSrvLista();
      mostrarAdminSrvDetalle();
    } catch (e) {
      console.error('Error eliminando la solicitud:', e);
      alert(t.admErrorEliminarSolicitud);
      delBtn.disabled = false;
    }
  });
}

function adminSrvRenderRowEdit(row, sol, presupuesto) {
  const t = T[lang];
  row.innerHTML = '';
  const estadoSel = document.createElement('select');
  SOL_ESTADOS.forEach((e) => {
    const opt = document.createElement('option');
    opt.value = e.v; opt.textContent = e.l;
    if (e.v === sol.estado) opt.selected = true;
    estadoSel.appendChild(opt);
  });

  const vendedorInput = document.createElement('input');
  vendedorInput.type = 'text';
  vendedorInput.value = sol.vendedor_asignado || '';
  vendedorInput.placeholder = t.admPlaceholderVendedorAsignado;
  const vendedorList = document.createElement('datalist');
  vendedorList.id = 'srvVendedorList-' + sol.id;
  fillDatalist(vendedorList, vendedoresConocidos());
  vendedorInput.setAttribute('list', vendedorList.id);

  const comisionInput = document.createElement('input');
  comisionInput.type = 'number';
  comisionInput.min = '0'; comisionInput.max = '100'; comisionInput.step = '0.1';
  comisionInput.value = sol.comision_porcentaje || '';
  comisionInput.placeholder = '%';

  const valorPreview = el('strong', 'proy-valor', formatQ(adminSrvComisionValorCalc(sol, presupuesto)));
  comisionInput.addEventListener('input', () => {
    valorPreview.textContent = formatQ(adminSrvComisionValorCalc({ ...sol, comision_porcentaje: comisionInput.value }, presupuesto));
  });

  const actions = el('div', 'sol-actions');
  const saveBtn = el('button', 'btn btn-dark btn-sm', t.btnGuardar); saveBtn.type = 'button';
  const cancelBtn = el('button', 'btn btn-line-dark btn-sm', t.btnCancelar); cancelBtn.type = 'button';
  actions.append(saveBtn, cancelBtn);
  row.append(
    labeledCell(t.admNoNumSolicitud, el('strong', 'sol-num', sol.numero_solicitud || ('#' + sol.id))),
    labeledCell(t.admNombreCliente, el('span', 'sol-cli', sol.nombre_cliente || '—')),
    labeledCell(t.admFechaSolicitud, el('span', 'sol-cli', formatQBuscarRegFecha(sol.created_at))),
    labeledCell(t.admEstado, estadoSel),
    labeledCell(t.admFechaCambioEstado, el('span', 'sol-cli', sol.estado_actualizado_en ? formatQBuscarRegFecha(sol.estado_actualizado_en) : '—')),
    labeledCell(t.admUsuarioModifica, el('span', 'sol-cli', sol.estado_actualizado_por || '—')),
    labeledCell(t.admValorDelServicio, el('strong', 'sol-cli', formatQBuscarRegPresupuesto(presupuesto))),
    labeledCell(t.admVendedorAsignado, vendedorInput),
    labeledCell(t.admPctComision, comisionInput),
    labeledCell(t.admValorComision, valorPreview),
    actions
  );
  row.appendChild(vendedorList);
  cancelBtn.addEventListener('click', () => adminSrvRenderRowView(row, sol, presupuesto));
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    try {
      const miUsuario = localStorage.getItem(LOGIN_STORE) || null;
      const payload = {
        estado: estadoSel.value,
        estado_actualizado_en: new Date().toISOString(),
        estado_actualizado_por: miUsuario,
        vendedor_asignado: vendedorInput.value.trim() || null,
        comision_porcentaje: comisionInput.value || null
      };
      const { error } = await supabaseClient.from('solicitudes_servicio').update(payload).eq('id', sol.id);
      if (error) throw error;
      Object.assign(sol, payload);
      adminSrvRenderRowView(row, sol, presupuesto);
    } catch (e) {
      console.error('Error actualizando la solicitud:', e);
      alert(t.adminErrorGuardarCambio);
      saveBtn.disabled = false;
    }
  });
}

async function mostrarAdminSrvDetalle() {
  const result = $('#adminServiciosResult');
  const listaSel = $('#adminSrvListaSel');
  if (!result || !listaSel) return;
  const id = listaSel.value;
  const t = T[lang] || T.es;
  if (!id) {
    result.innerHTML = '<p class="qbr-empty">' + t.admEligeRegistroLista + '</p>';
    return;
  }
  if (id === QBUSCARREG_TODOS) {
    result.innerHTML = '<p class="qbr-empty">' + t.adminCargandoPuntos + '</p>';
    try {
      const tipoSel = $('#adminSrvTipoSel');
      const estadoSel = $('#adminSrvEstadoSel');
      const promotorSel = $('#adminSrvPromotorSel');
      const fechaDesdeVal = $('#adminSrvFechaDesde')?.value || null;
      const fechaHastaVal = $('#adminSrvFechaHasta')?.value || null;
      const tipoIdx = tipoSel && tipoSel.value !== '' ? Number(tipoSel.value) : null;
      const estadoVal = estadoSel && estadoSel.value !== '' ? estadoSel.value : null;
      const promotorVal = promotorSel && promotorSel.value !== '' ? promotorSel.value : null;
      let query = supabaseClient.from('solicitudes_servicio').select('*').order('id', { ascending: false }).limit(200);
      if (tipoIdx !== null) query = query.eq('servicio', t.ext[tipoIdx]);
      if (estadoVal !== null) query = query.eq('estado', estadoVal);
      if (promotorVal !== null) query = query.eq('promotor_negocio', promotorVal);
      if (fechaDesdeVal) query = query.gte('created_at', fechaDesdeVal + 'T00:00:00');
      if (fechaHastaVal) query = query.lte('created_at', fechaHastaVal + 'T23:59:59');
      const { data, error } = await query;
      if (error) throw error;
      const filas = data || [];
      if (!filas.length) {
        result.innerHTML = '<p class="qbr-empty">' + t.admNoHaySolicitudesCoinciden + '</p>';
        return;
      }
      const idsCotizacion = [...new Set(filas.map((r) => r.cotizacion_id).filter((v) => v != null))];
      let presupuestos = {};
      if (idsCotizacion.length) {
        const { data: cots } = await supabaseClient.from('cotizaciones').select('id, presupuesto_asignado').in('id', idsCotizacion);
        if (cots) cots.forEach((c) => { presupuestos[c.id] = c.presupuesto_asignado; });
      }
      result.innerHTML = '';
      const table = el('div', 'sol-table');
      filas.forEach((sol) => table.appendChild(adminSrvBuildRow(sol, presupuestos[sol.cotizacion_id])));
      result.appendChild(table);
    } catch (e) {
      console.error('Error cargando todas las solicitudes de servicio:', e);
      result.innerHTML = '<p class="qbr-empty">' + t.admNoSePudoCargarSolicitudes + '</p>';
    }
    return;
  }
  result.innerHTML = '<p class="qbr-empty">' + t.adminCargandoPuntos + '</p>';
  try {
    const { data: sol, error } = await supabaseClient.from('solicitudes_servicio').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!sol) {
      result.innerHTML = '<p class="qbr-empty">' + t.admNoSeEncontroSolicitud + '</p>';
      return;
    }
    let presupuesto = null;
    if (sol.cotizacion_id != null) {
      const { data: cot } = await supabaseClient.from('cotizaciones').select('presupuesto_asignado').eq('id', sol.cotizacion_id).maybeSingle();
      if (cot) presupuesto = cot.presupuesto_asignado;
    }
    result.innerHTML = '';
    const table = el('div', 'sol-table');
    table.appendChild(adminSrvBuildRow(sol, presupuesto));
    result.appendChild(table);
  } catch (e) {
    console.error('Error cargando el detalle de la solicitud:', e);
    result.innerHTML = '<p class="qbr-empty">' + t.admNoSePudoCargarSolicitud + '</p>';
  }
}

$('#adminSrvMostrarBtn')?.addEventListener('click', () => mostrarAdminSrvDetalle());
$('#adminSrvTipoSel')?.addEventListener('change', () => { cargarAdminSrvLista(); });
$('#adminSrvEstadoSel')?.addEventListener('change', () => { cargarAdminSrvLista(); });
$('#adminSrvPromotorSel')?.addEventListener('change', () => { cargarAdminSrvLista(); });
$('#adminSrvFechaDesde')?.addEventListener('change', () => { cargarAdminSrvLista(); });
$('#adminSrvFechaHasta')?.addEventListener('change', () => { cargarAdminSrvLista(); });

const adminServiciosModal = $('#adminServiciosModal');
async function abrirAdminServiciosModal() {
  if (!adminServiciosModal) return;
  if (!vendedoresCatalogoCargado) { vendedoresCatalogoCargado = true; cargarVendedoresCatalogo(); }
  adminServiciosModal.hidden = false;
  poblarAdminSrvTipoSel();
  poblarAdminSrvEstadoSel();
  poblarAdminSrvPromotorSel();
  if ($('#adminSrvTipoSel')) $('#adminSrvTipoSel').value = '';
  if ($('#adminSrvEstadoSel')) $('#adminSrvEstadoSel').value = '';
  if ($('#adminSrvPromotorSel')) $('#adminSrvPromotorSel').value = '';
  if ($('#adminSrvFechaDesde')) $('#adminSrvFechaDesde').value = '';
  if ($('#adminSrvFechaHasta')) $('#adminSrvFechaHasta').value = '';
  await cargarAdminSrvLista();
  const listaSel = $('#adminSrvListaSel');
  if (listaSel && [...listaSel.options].some((o) => o.value === QBUSCARREG_TODOS)) {
    listaSel.value = QBUSCARREG_TODOS;
  }
  mostrarAdminSrvDetalle();
}
function cerrarAdminServiciosModal() { if (adminServiciosModal) adminServiciosModal.hidden = true; }
$('#navAdminServiciosBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  abrirAdminServiciosModal();
});
$('#adminServiciosClose')?.addEventListener('click', cerrarAdminServiciosModal);
$('#adminServiciosScrim')?.addEventListener('click', cerrarAdminServiciosModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && adminServiciosModal && !adminServiciosModal.hidden) cerrarAdminServiciosModal(); });

/* "Rotación Visual" (Negocios): carrusel 3D con la imagen inicial (primera
   fotografía) de cada propiedad activa, girando automáticamente sola -una
   tarjeta central de frente y las demás distribuidas en círculo alrededor,
   en perspectiva-, igual al estilo de referencia de tarjetas inclinadas. */
let rotVisualItems = [];
let rotVisualIdx = 0;
let rotVisualTimer = null;
let rotVisualAllRows = [];
let rotVisualCiudadSel = '';
let rotVisualTipoSel = '';

function rotVisualLayout() {
  const track = $('#rotVisualTrack');
  if (!track) return;
  const n = rotVisualItems.length;
  if (!n) return;
  const cards = [...track.children];
  const visibleSpan = Math.min(n, 7);
  cards.forEach((card, i) => {
    let offset = i - rotVisualIdx;
    offset = ((offset % n) + n) % n;
    if (offset > n / 2) offset -= n;
    const abs = Math.abs(offset);
    if (abs > 3) {
      card.style.opacity = '0';
      card.style.pointerEvents = 'none';
      card.style.transform = 'translate3d(0,0,-600px)';
      return;
    }
    const spacing = 150;
    const rotateY = offset * -22;
    const translateX = offset * spacing;
    const translateZ = -abs * 110;
    const scale = abs === 0 ? 1 : 0.82;
    card.style.opacity = abs === 0 ? '1' : String(Math.max(0.35, 0.85 - abs * 0.2));
    card.style.pointerEvents = abs === 0 ? 'auto' : 'none';
    card.style.zIndex = String(100 - abs);
    card.style.filter = abs === 0 ? 'none' : 'brightness(.72)';
    card.style.transform = 'translate3d(' + translateX + 'px,0,' + translateZ + 'px) rotateY(' + rotateY + 'deg) scale(' + scale + ')';
  });
}

function rotVisualNext() {
  if (!rotVisualItems.length) return;
  rotVisualIdx = (rotVisualIdx + 1) % rotVisualItems.length;
  rotVisualLayout();
  rotVisualPintarDetalle();
}

function rotVisualStart() {
  rotVisualStop();
  if (rotVisualItems.length > 1) rotVisualTimer = setInterval(rotVisualNext, 2600);
}
function rotVisualStop() {
  if (rotVisualTimer) { clearInterval(rotVisualTimer); rotVisualTimer = null; }
}

function rotVisualBuildTab(container, label, value, selectedGetter, onSelect) {
  const tab = el('button', 'loc-tab' + (selectedGetter() === value ? ' on' : ''), label);
  tab.type = 'button';
  tab.addEventListener('click', () => onSelect(value));
  container.appendChild(tab);
}

function rotVisualPoblarFiltros() {
  const ciudadWrap = $('#rotVisualCiudadTabs');
  const tipoWrap = $('#rotVisualTipoTabs');
  if (!ciudadWrap || !tipoWrap) return;
  const ciudades = [...new Set(rotVisualAllRows.map((r) => r.ciudad).filter(Boolean))].sort();
  const tipos = [...new Set(rotVisualAllRows.map((r) => r.tipo_propiedad).filter(Boolean))].sort();

  const todasLbl = T[lang].rotVisualTodas;
  ciudadWrap.innerHTML = '';
  rotVisualBuildTab(ciudadWrap, todasLbl, '', () => rotVisualCiudadSel, (v) => { rotVisualCiudadSel = v; rotVisualAplicarFiltro(); });
  ciudades.forEach((c) => rotVisualBuildTab(ciudadWrap, c, c, () => rotVisualCiudadSel, (v) => { rotVisualCiudadSel = v; rotVisualAplicarFiltro(); }));

  tipoWrap.innerHTML = '';
  rotVisualBuildTab(tipoWrap, todasLbl, '', () => rotVisualTipoSel, (v) => { rotVisualTipoSel = v; rotVisualAplicarFiltro(); });
  tipos.forEach((t) => rotVisualBuildTab(tipoWrap, t, t, () => rotVisualTipoSel, (v) => { rotVisualTipoSel = v; rotVisualAplicarFiltro(); }));
}

/* Texto del valor de una propiedad para mostrarlo junto al nombre en la
   Rotación Visual, tal como el admin lo escribió (con su propio símbolo de
   moneda, Q o $): usa el valor de venta si la operación es venta, el de
   renta si es renta, y si es "ambos" prioriza venta y si no hay, renta. */
function rotVisualValorTexto(r) {
  const op = r.tipo_operacion || '';
  const renta = (r.valor_renta || '').toString().trim();
  const venta = (r.valor_venta || '').toString().trim();
  let v = '';
  if (op === 'venta') v = venta;
  else if (op === 'renta') v = renta;
  else v = venta || renta;
  return v;
}

/* Enlace de Google Maps para el detalle de Rotación Visual: usa la dirección
   guardada si existe (o el enlace, si eso fue lo que se guardó); si no hay
   dirección, cae de regreso a "nombre de la propiedad, ciudad, Guatemala". */
function rotVisualMapUrlDet(r) {
  const dir = ((r && r.direccion) || '').trim();
  const q = dir || [(r && r.nombre) || '', (r && r.ciudad) || '', 'Guatemala'].filter(Boolean).join(', ');
  return /^https?:\/\//i.test(q) ? q : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
}

function rotVisualOcultarDetalle() {
  const det = $('#rotVisualDetalle');
  if (det) det.hidden = true;
  const p = $('#rotVisualDetPrices');
  if (p) p.hidden = true;
  const d = $('#rotVisualDetDescBox');
  if (d) d.hidden = true;
  const s = $('#rotVisualDetSeller');
  if (s) s.hidden = true;
  const c = $('#rotVisualAgendarCitaBtn');
  if (c) c.hidden = true;
}

/* Pinta, debajo de las fotografías de Rotación Visual, el detalle completo
   de la propiedad actualmente al frente: nombre, dirección y enlace a
   Google Maps, precio de renta/venta, descripción y contacto del vendedor
   (foto, nombre, número y botón de WhatsApp) -igual que en la ficha pública
   de una ubicación-. */
function rotVisualPintarDetalle() {
  const det = $('#rotVisualDetalle');
  if (!det) return;
  const it = rotVisualItems[rotVisualIdx];
  const r = it && it.row;
  if (!it || !r) { rotVisualOcultarDetalle(); return; }
  det.hidden = false;

  const t = T[lang];
  const op = r.tipo_operacion || '';
  const opEl = $('#rotVisualDetOp');
  opEl.hidden = !op;
  opEl.textContent = op === 'renta' ? t.viewOpRent : op === 'venta' ? t.viewOpSale : op === 'ambos' ? t.viewOpBoth : '';

  $('#rotVisualDetName').textContent = it.nombre || r.nombre || '';
  const dir = (r.direccion || '').trim();
  $('#rotVisualDetAddr').textContent = dir && !/^https?:\/\//i.test(dir) ? dir : ((r.ciudad || '') + ', Guatemala');
  $('#rotVisualDetMap').href = rotVisualMapUrlDet(r);

  const renta = (r.valor_renta || '').toString().trim();
  const venta = (r.valor_venta || '').toString().trim();
  const showR = (op === 'renta' || op === 'ambos') && !!renta;
  const showS = (op === 'venta' || op === 'ambos') && !!venta;
  $('#rotVisualDetRentBox').hidden = !showR;
  $('#rotVisualDetRent').textContent = showR ? renta : '';
  $('#rotVisualDetSaleBox').hidden = !showS;
  $('#rotVisualDetSale').textContent = showS ? venta : '';
  $('#rotVisualDetPrices').hidden = !(showR || showS);

  const desc = (r.descripcion || '').trim();
  $('#rotVisualDetDesc').textContent = desc;
  $('#rotVisualDetDescBox').hidden = !desc;

  const sName = (r.vendedor_nombre || '').trim();
  const sFoto = r.vendedor_foto || '';
  const sWaDigits = (r.vendedor_whatsapp || '').replace(/\D/g, '');
  const hasSeller = !!(sName || sFoto || sWaDigits);
  $('#rotVisualDetSeller').hidden = !hasSeller;
  const sBtn = $('#rotVisualDetSBtn');
  sBtn.hidden = !sFoto;
  if (sFoto) $('#rotVisualDetSImg').src = sFoto;
  $('#rotVisualDetSName').textContent = sName;
  $('#rotVisualDetSNum').textContent = (r.vendedor_whatsapp || '').trim();
  const sWa = $('#rotVisualDetSWa');
  sWa.hidden = !sWaDigits;
  if (sWaDigits) sWa.href = 'https://wa.me/' + (sWaDigits.length === 8 ? '502' + sWaDigits : sWaDigits) + '?text=' + encodeURIComponent(t.waMsg + (it.nombre || r.nombre || ''));

  const citaBtn = $('#rotVisualAgendarCitaBtn');
  if (citaBtn) citaBtn.hidden = false;
}

function rotVisualAplicarFiltro() {
  const track = $('#rotVisualTrack');
  const empty = $('#rotVisualEmpty');
  if (!track) return;
  rotVisualStop();
  track.innerHTML = '';

  // Reconstruir las pestañas refleja la selección activa (clase "on") sin
  // tener que recalcular por índice qué botón corresponde a qué valor.
  rotVisualPoblarFiltros();

  const filtradas = rotVisualAllRows.filter((r) => {
    if (rotVisualCiudadSel && r.ciudad !== rotVisualCiudadSel) return false;
    if (rotVisualTipoSel && r.tipo_propiedad !== rotVisualTipoSel) return false;
    return true;
  });
  rotVisualItems = filtradas.filter((r) => Array.isArray(r.fotos) && r.fotos.length > 0).map((r) => ({ nombre: r.nombre || 'Propiedad', foto: r.fotos[0], fotos: r.fotos, ciudad: r.ciudad || '', valor: rotVisualValorTexto(r), row: r }));

  if (!rotVisualItems.length) {
    if (empty) { empty.hidden = false; empty.textContent = T[lang].rotVisualEmpty; }
    rotVisualOcultarDetalle();
    return;
  }
  if (empty) empty.hidden = true;
  const backBtn = $('#rotVisualVolverBtn');
  if (backBtn) backBtn.hidden = true;
  rotVisualItems.forEach((it, i) => {
    const card = el('div', 'rotv-item');
    const img = document.createElement('img');
    img.src = it.foto;
    img.alt = it.nombre;
    img.loading = 'lazy';
    const etiqueta = it.valor ? (it.nombre + ' — ' + it.valor) : it.nombre;
    card.append(img, el('div', 'rotv-name', etiqueta));
    card.addEventListener('click', () => {
      // Al presionar cualquier propiedad (esté centrada o no), se abre
      // de inmediato la rotación con todas sus fotografías.
      rotVisualMostrarFotos(it);
    });
    track.appendChild(card);
  });
  rotVisualIdx = 0;
  rotVisualLayout();
  rotVisualStart();
  rotVisualPintarDetalle();
}

/* Al presionar una propiedad, se reemplaza el carrusel general por uno con
   TODAS las fotografías de esa propiedad (mismo efecto de rotación 3D),
   con un botón para volver al listado general de propiedades. */
function rotVisualMostrarFotos(item) {
  const track = $('#rotVisualTrack');
  const empty = $('#rotVisualEmpty');
  const backBtn = $('#rotVisualVolverBtn');
  if (!track || !item) return;
  const fotos = Array.isArray(item.fotos) && item.fotos.length ? item.fotos : [item.foto];
  rotVisualStop();
  track.innerHTML = '';
  if (empty) empty.hidden = true;
  if (backBtn) backBtn.hidden = false;

  const totalFotos = fotos.length;
  const nombreConValor = item.valor ? (item.nombre + ' — ' + item.valor) : item.nombre;
  rotVisualItems = fotos.map((f) => ({ nombre: item.nombre, foto: f, row: item.row }));
  rotVisualItems.forEach((it, i) => {
    const card = el('div', 'rotv-item');
    const img = document.createElement('img');
    img.src = it.foto;
    img.alt = it.nombre + ' — foto ' + (i + 1);
    img.loading = 'lazy';
    const etiqueta = totalFotos > 1 ? (nombreConValor + ' · Foto ' + (i + 1) + ' de ' + totalFotos) : nombreConValor;
    card.append(img, el('div', 'rotv-name', etiqueta));
    card.addEventListener('click', () => {
      if (i !== rotVisualIdx) {
        rotVisualIdx = i;
        rotVisualLayout();
        rotVisualStart();
        rotVisualPintarDetalle();
      }
    });
    track.appendChild(card);
  });
  rotVisualIdx = 0;
  rotVisualLayout();
  rotVisualStart();
  rotVisualPintarDetalle();
}

async function abrirRotVisualModal(ciudadInicial) {
  const modal = $('#rotVisualModal');
  const track = $('#rotVisualTrack');
  const empty = $('#rotVisualEmpty');
  if (!modal || !track) return;
  modal.hidden = false;
  track.innerHTML = '';
  if (empty) empty.hidden = true;
  rotVisualStop();
  rotVisualCiudadSel = '';
  rotVisualTipoSel = '';
  try {
    const { data: rows, error } = await supabaseClient.from('propiedades').select('local_id,nombre,fotos,ciudad,tipo_propiedad,tipo_operacion,valor_renta,valor_venta,direccion,descripcion,vendedor_nombre,vendedor_whatsapp,vendedor_foto').eq('activo', true).order('ciudad', { ascending: true }).order('nombre', { ascending: true });
    if (error) throw error;
    rotVisualAllRows = rows || [];
    if (ciudadInicial && rotVisualAllRows.some((r) => r.ciudad === ciudadInicial)) rotVisualCiudadSel = ciudadInicial;
    rotVisualAplicarFiltro();
  } catch (e) {
    console.error('Error cargando la rotación visual de propiedades:', e);
    if (empty) { empty.hidden = false; empty.textContent = T[lang].rotVisualLoadErr; }
  }
}
function cerrarRotVisualModal() {
  const modal = $('#rotVisualModal');
  if (modal) modal.hidden = true;
  rotVisualStop();
}
$('#navAdminRotacionVisualBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  abrirRotVisualModal();
});
$('#rotVisualClose')?.addEventListener('click', cerrarRotVisualModal);
$('#rotVisualScrim')?.addEventListener('click', cerrarRotVisualModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#rotVisualModal') && !$('#rotVisualModal').hidden) cerrarRotVisualModal(); });
$('#rotVisualVolverBtn')?.addEventListener('click', () => rotVisualAplicarFiltro());
$('#rotVisualVolverCiudadesBtn')?.addEventListener('click', () => {
  cerrarRotVisualModal();
  $('#propiedades')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* "Vendedores" dentro del menú Administración: catálogo centralizado de
   vendedores (tabla propia en Supabase, independiente de "vendedor
   asignado" en Propiedades/Proyectos/Servicios, que sigue siendo texto
   libre). Cada vendedor tiene un código correlativo automático (su id),
   nombre, teléfono, dirección, fecha de inicio, usuario y fotografía.
   El listado reutiliza el mismo estilo de tarjeta vertical (.proy-card)
   que Propiedades y Proyectos, con un botón "+ Agregar vendedor" que abre
   una tarjeta nueva en modo edición. */
let adminVendData = [];

function vendCodigo(v) {
  return v && v.id != null ? ('V-' + String(v.id).padStart(4, '0')) : T[lang].admCodigoSeAsigna;
}

/* Departamentos y municipios de Guatemala, para el catálogo de Clientes
   (campos "Departamento" y "Municipio" dependientes). */
const DEPARTAMENTOS_GT = {
  'Alta Verapaz': ['Cobán', 'Santa Cruz Verapaz', 'San Cristóbal Verapaz', 'Tactic', 'Tamahú', 'Tucurú', 'Panzós', 'Senahú', 'San Pedro Carchá', 'San Juan Chamelco', 'Lanquín', 'Santa María Cahabón', 'Chisec', 'Chahal', 'Fray Bartolomé de las Casas', 'Santa Catalina La Tinta', 'Raxruhá'],
  'Baja Verapaz': ['Salamá', 'San Miguel Chicaj', 'Rabinal', 'Cubulco', 'Granados', 'El Chol', 'San Jerónimo', 'Purulhá'],
  'Chimaltenango': ['Chimaltenango', 'San José Poaquil', 'San Martín Jilotepeque', 'Comalapa', 'Santa Apolonia', 'Tecpán Guatemala', 'Patzún', 'Pochuta', 'Patzicía', 'Santa Cruz Balanyá', 'Acatenango', 'Yepocapa', 'San Andrés Itzapa', 'Parramos', 'Zaragoza', 'El Tejar'],
  'Chiquimula': ['Chiquimula', 'San José La Arada', 'San Juan Ermita', 'Jocotán', 'Camotán', 'Olopa', 'Esquipulas', 'Concepción Las Minas', 'Quezaltepeque', 'San Jacinto', 'Ipala'],
  'El Progreso': ['Guastatoya', 'Morazán', 'San Agustín Acasaguastlán', 'San Cristóbal Acasaguastlán', 'El Jícaro', 'Sansare', 'Sanarate', 'San Antonio La Paz'],
  'Escuintla': ['Escuintla', 'Santa Lucía Cotzumalguapa', 'La Democracia', 'Siquinalá', 'Masagua', 'Tiquisate', 'La Gomera', 'Guanagazapa', 'San José', 'Iztapa', 'Palín', 'San Vicente Pacaya', 'Nueva Concepción'],
  'Guatemala': ['Guatemala', 'Santa Catarina Pinula', 'San José Pinula', 'San José del Golfo', 'Palencia', 'Chinautla', 'San Pedro Ayampuc', 'Mixco', 'San Pedro Sacatepéquez', 'San Juan Sacatepéquez', 'San Raymundo', 'Chuarrancho', 'Fraijanes', 'Amatitlán', 'Villa Nueva', 'Villa Canales', 'San Miguel Petapa'],
  'Huehuetenango': ['Huehuetenango', 'Chiantla', 'Malacatancito', 'Cuilco', 'Nentón', 'San Pedro Necta', 'Jacaltenango', 'Soloma', 'Ixtahuacán', 'Santa Bárbara', 'La Libertad', 'La Democracia', 'San Miguel Acatán', 'San Rafael La Independencia', 'Todos Santos Cuchumatán', 'San Juan Atitán', 'Santa Eulalia', 'San Mateo Ixtatán', 'Colotenango', 'San Sebastián Huehuetenango', 'Tectitán', 'Concepción Huista', 'San Juan Ixcoy', 'San Antonio Huista', 'San Sebastián Coatán', 'Barillas', 'Aguacatán', 'San Rafael Petzal', 'San Gaspar Ixchil', 'Santiago Chimaltenango', 'Santa Ana Huista', 'Unión Cantinil'],
  'Izabal': ['Puerto Barrios', 'Livingston', 'El Estor', 'Morales', 'Los Amates'],
  'Jalapa': ['Jalapa', 'San Pedro Pinula', 'San Luis Jilotepeque', 'San Manuel Chaparrón', 'San Carlos Alzatate', 'Monjas', 'Mataquescuintla'],
  'Jutiapa': ['Jutiapa', 'El Progreso', 'Santa Catarina Mita', 'Agua Blanca', 'Asunción Mita', 'Yupiltepeque', 'Atescatempa', 'Jerez', 'El Adelanto', 'Zapotitlán', 'Comapa', 'Jalpatagua', 'Conguaco', 'Moyuta', 'Pasaco', 'San José Acatempa', 'Quesada'],
  'Petén': ['Flores', 'San José', 'San Benito', 'San Andrés', 'La Libertad', 'San Francisco', 'Santa Ana', 'Dolores', 'San Luis', 'Sayaxché', 'Melchor de Mencos', 'Poptún'],
  'Quetzaltenango': ['Quetzaltenango', 'Salcajá', 'Olintepeque', 'San Carlos Sija', 'Sibilia', 'Cabricán', 'Cajolá', 'San Miguel Sigüilá', 'Ostuncalco', 'San Mateo', 'Concepción Chiquirichapa', 'San Martín Sacatepéquez', 'Almolonga', 'Cantel', 'Huitán', 'Zunil', 'Colomba', 'San Francisco La Unión', 'El Palmar', 'Coatepeque', 'Génova', 'Flores Costa Cuca', 'La Esperanza', 'Palestina de Los Altos'],
  'Quiché': ['Santa Cruz del Quiché', 'Chiché', 'Chinique', 'Zacualpa', 'Chajul', 'Chichicastenango', 'Patzité', 'San Antonio Ilotenango', 'San Pedro Jocopilas', 'Cunén', 'San Juan Cotzal', 'Joyabaj', 'Nebaj', 'San Andrés Sajcabajá', 'Uspantán', 'Sacapulas', 'San Bartolomé Jocotenango', 'Canillá', 'Chicamán', 'Ixcán', 'Pachalum'],
  'Retalhuleu': ['Retalhuleu', 'San Sebastián', 'Santa Cruz Muluá', 'San Martín Zapotitlán', 'San Felipe', 'San Andrés Villa Seca', 'Champerico', 'Nuevo San Carlos', 'El Asintal'],
  'Sacatepéquez': ['Antigua Guatemala', 'Jocotenango', 'Pastores', 'Sumpango', 'Santo Domingo Xenacoj', 'Santiago Sacatepéquez', 'San Bartolomé Milpas Altas', 'San Lucas Sacatepéquez', 'Santa Lucía Milpas Altas', 'Magdalena Milpas Altas', 'Santa María de Jesús', 'Ciudad Vieja', 'San Miguel Dueñas', 'Alotenango', 'San Antonio Aguas Calientes', 'Santa Catarina Barahona'],
  'San Marcos': ['San Marcos', 'San Pedro Sacatepéquez', 'San Antonio Sacatepéquez', 'Comitancillo', 'San Miguel Ixtahuacán', 'Concepción Tutuapa', 'Tacaná', 'Sibinal', 'Tajumulco', 'Tejutla', 'San Rafael Pie de la Cuesta', 'Nuevo Progreso', 'El Tumbador', 'San José El Rodeo', 'Malacatán', 'Catarina', 'Ayutla', 'Ocós', 'San Pablo', 'El Quetzal', 'La Reforma', 'Pajapita', 'Ixchiguán', 'San José Ojetenam', 'San Cristóbal Cucho', 'Sipacapa', 'Esquipulas Palo Gordo', 'Río Blanco', 'San Lorenzo', 'La Blanca'],
  'Santa Rosa': ['Cuilapa', 'Barberena', 'Santa Rosa de Lima', 'Casillas', 'San Rafael Las Flores', 'Oratorio', 'San Juan Tecuaco', 'Chiquimulilla', 'Taxisco', 'Santa María Ixhuatán', 'Guazacapán', 'Santa Cruz Naranjo', 'Pueblo Nuevo Viñas', 'Nueva Santa Rosa'],
  'Sololá': ['Sololá', 'San José Chacayá', 'Santa María Visitación', 'Santa Lucía Utatlán', 'Nahualá', 'Santa Catarina Ixtahuacán', 'Santa Clara La Laguna', 'Concepción', 'San Andrés Semetabaj', 'Panajachel', 'Santa Catarina Palopó', 'San Antonio Palopó', 'San Lucas Tolimán', 'Santa Cruz La Laguna', 'San Pablo La Laguna', 'San Marcos La Laguna', 'San Juan La Laguna', 'San Pedro La Laguna', 'Santiago Atitlán'],
  'Suchitepéquez': ['Mazatenango', 'Cuyotenango', 'San Francisco Zapotitlán', 'San Bernardino', 'San José El Ídolo', 'Santo Domingo Suchitepéquez', 'San Lorenzo', 'Samayac', 'San Pablo Jocopilas', 'San Antonio Suchitepéquez', 'San Miguel Panán', 'San Gabriel', 'Chicacao', 'Patulul', 'Santa Bárbara', 'San Juan Bautista', 'Santo Tomás La Unión', 'Zunilito', 'Pueblo Nuevo', 'Río Bravo'],
  'Totonicapán': ['Totonicapán', 'San Cristóbal Totonicapán', 'San Francisco El Alto', 'San Andrés Xecul', 'Momostenango', 'Santa María Chiquimula', 'Santa Lucía La Reforma', 'San Bartolo'],
  'Zacapa': ['Zacapa', 'Estanzuela', 'Río Hondo', 'Gualán', 'Teculután', 'Usumatlán', 'Cabañas', 'San Diego', 'La Unión', 'Huité']
};

/* Lista de profesiones/ocupaciones comunes en Guatemala, para el campo
   "Profesión" del catálogo de Clientes (select con lista dinámica). */
const PROFESIONES_GT = [
  'Abogado/a y notario/a', 'Administrador/a de empresas', 'Agente de seguros', 'Agricultor/a', 'Agrónomo/a',
  'Ama de casa', 'Arquitecto/a', 'Artista', 'Auditor/a', 'Chef / Gastronómico', 'Comerciante', 'Conductor/a',
  'Contador/a', 'Diseñador/a gráfico', 'Docente / Maestro/a', 'Economista', 'Electricista', 'Empresario/a',
  'Enfermero/a', 'Estudiante', 'Fontanero/a', 'Ingeniero/a civil', 'Ingeniero/a industrial', 'Ingeniero/a en sistemas',
  'Médico/a', 'Militar', 'Músico/a', 'Odontólogo/a', 'Oficial de policía', 'Operador/a de maquinaria',
  'Periodista', 'Piloto', 'Piloto automovilístico (transporte)', 'Psicólogo/a', 'Publicista', 'Químico/a farmacéutico',
  'Sastre / Modista', 'Técnico/a en electrónica', 'Trabajador/a de la construcción', 'Trabajador/a independiente',
  'Veterinario/a', 'Vendedor/a', 'Jubilado/a', 'Otro'
];

/* Lista de bancos de Guatemala, igual a la usada en "Datos para
   precalificar un préstamo" (#pq-banco / #pqj-banco), para que el banco
   de pago del vendedor se elija de la misma lista estándar. */
const BANCOS_GT = [
  'Crédito Hipotecario Nacional de Guatemala (CHN)',
  'Banco de los Trabajadores (Bantrab)',
  'Banco Cuscatlán Guatemala',
  'Banco Industrial',
  'Banco de Desarrollo Rural (Banrural)',
  'Banco Internacional',
  'Citibank, N.A. Sucursal Guatemala',
  'Vivibanco',
  'Banco Ficohsa Guatemala',
  'Banco Promerica',
  'Banco de Antigua',
  'Banco de América Central (BAC)',
  'Banco Agromercantil de Guatemala (BAM)',
  'Banco G&T Continental',
  'Banco Azteca de Guatemala',
  'Banco INV',
  'Banco Credicorp',
  'Banco Nexa',
  'Banco Multimoney',
  'Otro'
];

/* Tipo de cuenta bancaria del vendedor, para el depósito de sus
   comisiones. Las etiquetas ("l") se traducen en vivo según el idioma
   activo, igual que UBIC_ESTADOS/SOL_ESTADOS. */
function getTiposCuentaBancaria() {
  const t = T[lang] || T.es;
  return [
    { v: 'monetaria', l: t.admMonetaria },
    { v: 'ahorros', l: t.admAhorros }
  ];
}
Object.defineProperty(window, 'TIPOS_CUENTA_BANCARIA', { get: getTiposCuentaBancaria });
const tipoCuentaLabel = (v) => (getTiposCuentaBancaria().find((t) => t.v === v) || {}).l || '—';

/* Forma de pago de una comisión generada, usada en el resumen de pago por
   vendedor de Comisiones Generadas. */
function getFormasPago() {
  const t = T[lang] || T.es;
  return [
    { v: 'transferencia', l: t.admTransferencia },
    { v: 'cheque', l: t.admCheque },
    { v: 'efectivo', l: t.admEfectivo }
  ];
}
Object.defineProperty(window, 'FORMAS_PAGO', { get: getFormasPago });

function vendAvatarEl(v) {
  const wrap = el('div', 'srow');
  const img = document.createElement('img');
  img.className = 'avatar'; img.alt = v.nombre || '';
  const ph = el('div', 'avatar ph');
  ph.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"></circle><path d="M5 20c.6-3.6 3.5-5.6 7-5.6s6.4 2 7 5.6"></path></svg>';
  img.hidden = !v.foto_url;
  ph.hidden = !!v.foto_url;
  if (v.foto_url) img.src = v.foto_url;
  wrap.append(img, ph);
  return wrap;
}

function vendCardHead(v) {
  const head = el('div', 'proy-card-h');
  const nameWrap = el('div', 'proy-name-wrap');
  const nameEl = el('div', 'proy-name', v.nombre || T[lang].admVendedorSinNombre);
  nameWrap.append(nameEl, el('div', 'proy-city', vendCodigo(v)));
  head.append(nameWrap);
  return head;
}

function vendRenderView(card, v) {
  const t = T[lang];
  card.innerHTML = '';
  card.classList.remove('proy-card-edit');
  const actions = el('div', 'proy-actions');
  const modBtn = el('button', 'btn btn-line-dark btn-sm', t.btnModificar); modBtn.type = 'button';
  const delBtn = el('button', 'btn btn-line-dark btn-sm sol-del', t.btnEliminar); delBtn.type = 'button';
  actions.append(modBtn, delBtn);

  card.append(vendCardHead(v));
  const grid = el('div', 'proy-grid');
  grid.append(
    labeledCell(t.admFoto, vendAvatarEl(v)),
    labeledCell(t.admCodigoVendedor, el('strong', '', vendCodigo(v))),
    labeledCell(t.admNombre, el('span', '', v.nombre || '—')),
    labeledCell(t.admTelefono, el('span', '', v.telefono || '—')),
    labeledCell(t.admDireccion, el('span', '', v.direccion || '—')),
    labeledCell(t.admFechaInicio, el('span', '', v.fecha_inicio ? formatQBuscarRegFecha(v.fecha_inicio) : '—')),
    labeledCell(t.admFechaGrabacion, el('span', '', v.created_at ? formatQBuscarRegFecha(v.created_at) : '—')),
    labeledCell(t.admUsuario, el('span', '', v.usuario || '—')),
    labeledCell(t.admBancoDePago, el('span', '', v.banco_pago || '—')),
    labeledCell(t.admNumeroCuentaBancaria, el('span', '', v.numero_cuenta_bancaria || '—')),
    labeledCell(t.admTipoCuenta, el('span', '', tipoCuentaLabel(v.tipo_cuenta_bancaria)))
  );
  // El % de comisión por ventas solo lo ve y administra el Super
  // Administrador (el resto de la modal ya está detrás de ese mismo
  // candado, pero se repite aquí por si ese candado cambia más adelante).
  if (esSuperAdmin()) {
    grid.appendChild(labeledCell(t.admPctComisionVentas, el('span', '', v.comision_porcentaje != null && v.comision_porcentaje !== '' ? (v.comision_porcentaje + '%') : '—')));
  }
  card.append(grid, actions);

  modBtn.addEventListener('click', () => vendRenderEdit(card, v, false));
  delBtn.addEventListener('click', async () => {
    if (!confirm(t.admConfirmEliminarVendedor)) return;
    delBtn.disabled = true;
    try {
      await eliminarVendedorDesdeListado(v);
      adminVendData = adminVendData.filter((x) => x.id !== v.id);
      card.remove();
      if (!$('#adminVendedoresList').children.length) pintarAdminVendedoresList();
    } catch (e) {
      console.error('Error eliminando el vendedor:', e);
      alert(t.admErrorEliminarVendedor);
      delBtn.disabled = false;
    }
  });
}

function vendRenderEdit(card, v, isNew) {
  const t = T[lang];
  card.innerHTML = '';
  card.classList.add('proy-card-edit');

  let fotoUrl = v.foto_url || '';
  const avImg = document.createElement('img');
  avImg.className = 'avatar'; avImg.alt = '';
  const avPh = el('div', 'avatar ph');
  avPh.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"></circle><path d="M5 20c.6-3.6 3.5-5.6 7-5.6s6.4 2 7 5.6"></path></svg>';
  const fileInput = document.createElement('input');
  fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.className = 'sr';
  fileInput.id = 'vendFoto-' + (v.id || 'nuevo') + '-' + Date.now();
  const fileLabel = document.createElement('label');
  fileLabel.className = 'btn btn-gold btn-sm'; fileLabel.htmlFor = fileInput.id; fileLabel.textContent = t.admSubirFoto;
  const rmBtn = el('button', 'btn btn-danger btn-sm', t.admQuitarFoto); rmBtn.type = 'button';
  const actsPhoto = el('div', 'acts');
  actsPhoto.append(fileInput, fileLabel, rmBtn);
  const avWrap = el('div', 'srow');
  avWrap.append(avImg, avPh, actsPhoto);

  function refreshAvatar() {
    avImg.hidden = !fotoUrl;
    avPh.hidden = !!fotoUrl;
    rmBtn.hidden = !fotoUrl;
    if (fotoUrl) avImg.src = fotoUrl;
  }
  refreshAvatar();

  fileInput.addEventListener('change', async () => {
    const f = fileInput.files && fileInput.files[0];
    if (!f) return;
    const prevLabel = fileLabel.textContent;
    fileLabel.textContent = t.admSubiendoFoto;
    try {
      fotoUrl = await uploadPropFile(f, 600);
      refreshAvatar();
    } catch (e) {
      console.error('Error subiendo la foto del vendedor:', e);
      alert(t.admErrorSubirFoto);
    } finally {
      fileLabel.textContent = prevLabel;
      fileInput.value = '';
    }
  });
  rmBtn.addEventListener('click', () => { fotoUrl = ''; refreshAvatar(); });

  const nombreInput = document.createElement('input');
  nombreInput.type = 'text'; nombreInput.value = v.nombre || ''; nombreInput.placeholder = t.admPlaceholderNombreVendedor;

  const telInput = document.createElement('input');
  telInput.type = 'tel'; telInput.value = v.telefono || ''; telInput.placeholder = '+502 0000 0000';

  const dirInput = document.createElement('input');
  dirInput.type = 'text'; dirInput.value = v.direccion || ''; dirInput.placeholder = t.admPlaceholderDireccion;

  const bancoSel = document.createElement('select');
  const bancoOptVacio = document.createElement('option');
  bancoOptVacio.value = ''; bancoOptVacio.textContent = t.adminSelecciona;
  bancoSel.appendChild(bancoOptVacio);
  BANCOS_GT.forEach((nombreBanco) => {
    const opt = document.createElement('option');
    opt.value = nombreBanco; opt.textContent = nombreBanco;
    bancoSel.appendChild(opt);
  });
  bancoSel.value = v.banco_pago || '';

  const cuentaInput = document.createElement('input');
  cuentaInput.type = 'text'; cuentaInput.value = v.numero_cuenta_bancaria || ''; cuentaInput.placeholder = t.admNumeroCuentaBancaria;

  const tipoCuentaSel = document.createElement('select');
  const tipoCuentaOptVacio = document.createElement('option');
  tipoCuentaOptVacio.value = ''; tipoCuentaOptVacio.textContent = t.adminSelecciona;
  tipoCuentaSel.appendChild(tipoCuentaOptVacio);
  TIPOS_CUENTA_BANCARIA.forEach((tc) => {
    const opt = document.createElement('option');
    opt.value = tc.v; opt.textContent = tc.l;
    tipoCuentaSel.appendChild(opt);
  });
  tipoCuentaSel.value = v.tipo_cuenta_bancaria || '';

  // "Fecha inicio" se graba sola con la fecha de hoy al registrar un
  // vendedor nuevo; ya no se escribe a mano (ver más abajo, junto con
  // "Usuario" y "Fecha de grabación").
  // Se arma a partir de la hora LOCAL del navegador (no con toISOString(),
  // que usa UTC y en Guatemala —varias horas detrás— puede mostrar/guardar
  // el día anterior durante la madrugada).
  const hoyDate = new Date();
  const hoyISO = hoyDate.getFullYear() + '-' + String(hoyDate.getMonth() + 1).padStart(2, '0') + '-' + String(hoyDate.getDate()).padStart(2, '0');
  const hoyDisplay = hoyDate.toLocaleDateString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit' });

  // El % de comisión por ventas lo escribe el Super Administrador (único
  // que llega a ver este formulario); "Usuario" y "Fecha de grabación" ya
  // no se escriben a mano, se graban solos al guardar (ver más abajo).
  const comisionInput = document.createElement('input');
  comisionInput.type = 'number'; comisionInput.min = '0'; comisionInput.max = '100'; comisionInput.step = '0.1';
  comisionInput.value = v.comision_porcentaje != null ? v.comision_porcentaje : ''; comisionInput.placeholder = '%';

  const actions = el('div', 'proy-actions');
  const saveBtn = el('button', 'btn btn-dark btn-sm', t.btnGuardar); saveBtn.type = 'button';
  const cancelBtn = el('button', 'btn btn-line-dark btn-sm', t.btnCancelar); cancelBtn.type = 'button';
  actions.append(saveBtn, cancelBtn);

  card.append(vendCardHead(v));
  const grid = el('div', 'proy-grid');
  grid.append(
    labeledCell(t.admFoto, avWrap),
    labeledCell(t.admCodigoVendedor, el('strong', '', isNew ? t.admCodigoSeAsignaAutomatico : vendCodigo(v))),
    labeledCell(t.admNombre, nombreInput),
    labeledCell(t.admTelefono, telInput),
    labeledCell(t.admDireccion, dirInput),
    labeledCell(t.admFechaInicio, el('span', '', isNew ? t.admSeAsignaAutomaticoFecha + hoyDisplay + ')' : (v.fecha_inicio ? formatQBuscarRegFecha(v.fecha_inicio) : '—'))),
    labeledCell(t.admFechaGrabacion, el('span', '', isNew ? t.admCodigoSeAsignaAutomatico : (v.created_at ? formatQBuscarRegFecha(v.created_at) : '—'))),
    labeledCell(t.admUsuario, el('span', '', t.admSeGrabaAutomaticamente + (localStorage.getItem(LOGIN_STORE) || t.admUsuarioActualFallback) + ')')),
    labeledCell(t.admBancoDePago, bancoSel),
    labeledCell(t.admNumeroCuentaBancaria, cuentaInput),
    labeledCell(t.admTipoCuenta, tipoCuentaSel)
  );
  if (esSuperAdmin()) {
    grid.appendChild(labeledCell(t.admPctComisionVentas, comisionInput));
  }
  card.append(grid, actions);

  cancelBtn.addEventListener('click', () => {
    if (isNew) {
      card.remove();
      if (!$('#adminVendedoresList').children.length) pintarAdminVendedoresList();
    } else {
      vendRenderView(card, v);
    }
  });
  saveBtn.addEventListener('click', async () => {
    const nombre = nombreInput.value.trim();
    if (!nombre) { alert(t.admEscribeNombreVendedor); return; }
    saveBtn.disabled = true;
    const payload = {
      nombre,
      telefono: telInput.value.trim() || null,
      direccion: dirInput.value.trim() || null,
      // Se graban solos, nunca se escriben a mano. "Fecha inicio" solo se
      // fija la primera vez (al crear); si ya existía, se conserva.
      fecha_inicio: isNew ? hoyISO : (v.fecha_inicio || null),
      usuario: localStorage.getItem(LOGIN_STORE) || null,
      foto_url: fotoUrl || null,
      banco_pago: bancoSel.value || null,
      numero_cuenta_bancaria: cuentaInput.value.trim() || null,
      tipo_cuenta_bancaria: tipoCuentaSel.value || null
    };
    if (esSuperAdmin()) {
      payload.comision_porcentaje = comisionInput.value !== '' ? comisionInput.value : null;
    }
    try {
      if (isNew) {
        const nuevo = await crearVendedor(payload);
        adminVendData.unshift(nuevo);
        vendRenderView(card, nuevo);
      } else {
        await guardarVendedorDesdeListado(v, payload);
        vendRenderView(card, v);
      }
      vendedoresCatalogoCargado = false; // el catálogo del formulario de propiedades se refresca en su próximo uso
    } catch (e) {
      console.error('Error guardando el vendedor:', e);
      alert(t.admErrorGuardarVendedor);
      saveBtn.disabled = false;
    }
  });
}

/* ===== Clientes (catálogo) =====
   Mismo patrón de tarjetas que Vendedores: código autogenerado
   (AÑO-correlativo, reiniciando el correlativo cada año), foto opcional,
   Departamento/Municipio dependientes de DEPARTAMENTOS_GT, y Estado
   (Activo/Inactivo/Baja) con "Activo" por defecto. */
function getEstadosCliente() {
  const t = T[lang] || T.es;
  return [
    { v: 'activo', l: t.admEstCliActivo },
    { v: 'inactivo', l: t.admEstCliInactivo },
    { v: 'baja', l: t.admEstCliBaja },
    { v: 'inquilino', l: t.admEstCliInquilino },
    { v: 'propietario', l: t.admEstCliPropietario }
  ];
}
Object.defineProperty(window, 'ESTADOS_CLIENTE', { get: getEstadosCliente });
const estadoClienteLabel = (v) => (getEstadosCliente().find((e) => e.v === v) || {}).l || '—';

let adminCliData = [];

function cliCodigo(c) {
  return c && c.codigo ? c.codigo : T[lang].admCodigoSeAsigna;
}

/* Calcula el próximo correlativo para el año actual, consultando el mayor
   correlativo ya usado ese año (el correlativo se reinicia cada año). */
async function cliSiguienteCorrelativo(anio) {
  const { data, error } = await supabaseClient.from('clientes').select('correlativo').eq('anio', anio).order('correlativo', { ascending: false }).limit(1);
  if (error) throw error;
  const max = data && data.length ? data[0].correlativo : 0;
  return max + 1;
}

function cliAvatarEl(c) {
  const wrap = el('div');
  const img = document.createElement('img');
  img.className = 'avatar'; img.alt = c.nombre || '';
  const ph = el('div', 'avatar ph');
  ph.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"></circle><path d="M5 20c.6-3.6 3.5-5.6 7-5.6s6.4 2 7 5.6"></path></svg>';
  img.hidden = !c.foto_url;
  ph.hidden = !!c.foto_url;
  if (c.foto_url) img.src = c.foto_url;
  wrap.append(img, ph);
  return wrap;
}

/* Cabecera de la ficha: foto + nombre + código + una pastilla de color
   según el Estado (verde Activo, gris Inactivo, rojo Baja). */
function cliCardHead(c) {
  const t = T[lang];
  const head = el('div', 'cli-head');
  head.append(cliAvatarEl(c));
  const info = el('div', 'cli-head-info');
  info.append(el('div', 'cli-head-name', c.nombre || t.admClienteSinNombre));
  info.append(el('div', 'cli-head-code', cliCodigo(c)));
  const estadoCls = { activo: 'cli-badge-activo', inactivo: 'cli-badge-inactivo', baja: 'cli-badge-baja', inquilino: 'cli-badge-inquilino', propietario: 'cli-badge-propietario' }[c.estado] || 'cli-badge-activo';
  if (c.estado || c.id != null) info.append(el('span', 'cli-head-badge ' + estadoCls, estadoClienteLabel(c.estado || 'activo')));
  head.append(info);
  return head;
}

function cliRenderView(card, c) {
  const t = T[lang];
  card.innerHTML = '';
  card.classList.remove('proy-card-edit');
  card.classList.add('cli-card');
  const actions = el('div', 'proy-actions');
  const segBtn = el('button', 'btn btn-line-dark btn-sm', t.btnSeguimientos); segBtn.type = 'button';
  const actBtn = el('button', 'btn btn-line-dark btn-sm', t.btnVerActividades); actBtn.type = 'button';
  const modBtn = el('button', 'btn btn-line-dark btn-sm', t.btnModificar); modBtn.type = 'button';
  const delBtn = el('button', 'btn btn-line-dark btn-sm sol-del', t.btnEliminar); delBtn.type = 'button';
  actions.append(segBtn, actBtn, modBtn, delBtn);
  segBtn.addEventListener('click', () => abrirSegModal(c));
  actBtn.addEventListener('click', () => abrirActModal(c));

  card.append(cliCardHead(c));

  const secContacto = el('div', 'cli-sec');
  secContacto.append(el('div', 'cli-sec-h', t.admCliSeccionContacto));
  const gridContacto = el('div', 'cli-grid');
  gridContacto.append(
    labeledCell(t.admTelefono, el('span', '', c.telefono || '—')),
    labeledCell(t.admDpi, el('span', '', c.dpi || '—')),
    labeledCell(t.admCliVendedorAsignado, el('span', '', c.vendedor_asignado || t.admCliSinVendedor))
  );
  secContacto.append(gridContacto);

  const secUbicacion = el('div', 'cli-sec');
  secUbicacion.append(el('div', 'cli-sec-h', t.admCliSeccionUbicacion));
  const gridUbicacion = el('div', 'cli-grid');
  gridUbicacion.append(
    labeledCell(t.admDepartamento, el('span', '', c.departamento || '—')),
    labeledCell(t.admMunicipio, el('span', '', c.municipio || '—')),
    labeledCell(t.admDetalleDireccion, el('span', '', c.direccion || '—'))
  );
  secUbicacion.append(gridUbicacion);

  const secAdmin = el('div', 'cli-sec');
  secAdmin.append(el('div', 'cli-sec-h', t.admCliSeccionAdmin));
  const gridAdmin = el('div', 'cli-grid');
  gridAdmin.append(
    labeledCell(t.admEstadoCliente, el('span', '', estadoClienteLabel(c.estado))),
    labeledCell(t.admProfesion, el('span', '', c.profesion || '—')),
    labeledCell(t.admUsuario, el('span', '', c.usuario || '—')),
    labeledCell(t.admFechaGrabacion, el('span', '', c.created_at ? formatQBuscarRegFecha(c.created_at) : '—'))
  );
  secAdmin.append(gridAdmin);

  card.append(secContacto, secUbicacion, secAdmin, actions);

  modBtn.addEventListener('click', () => cliRenderEdit(card, c, false));
  delBtn.addEventListener('click', async () => {
    if (!confirm(t.admConfirmEliminarCliente)) return;
    delBtn.disabled = true;
    try {
      const { error } = await supabaseClient.from('clientes').delete().eq('id', c.id);
      if (error) throw error;
      adminCliData = adminCliData.filter((x) => x.id !== c.id);
      card.remove();
      if (!$('#adminClientesList').children.length) pintarAdminClientesList();
    } catch (e) {
      console.error('Error eliminando el cliente:', e);
      alert(t.admErrorEliminarCliente);
      delBtn.disabled = false;
    }
  });
}

/* Select de "Vendedor asignado" para el formulario de Clientes, con "Sin
   vendedor asignado" como primera opción y por defecto. */
function cliPoblarVendedorSelect(sel, actual) {
  sel.innerHTML = '';
  const optVacio = document.createElement('option');
  optVacio.value = ''; optVacio.textContent = T[lang].admCliSinVendedor;
  sel.appendChild(optVacio);
  vendedoresCatalogo.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v.nombre; opt.textContent = v.nombre;
    sel.appendChild(opt);
  });
  sel.value = actual || '';
}

function cliRenderEdit(card, c, isNew) {
  const t = T[lang];
  card.innerHTML = '';
  card.classList.add('proy-card-edit', 'cli-card');

  let fotoUrl = c.foto_url || '';
  const avImg = document.createElement('img');
  avImg.className = 'avatar'; avImg.alt = '';
  const avPh = el('div', 'avatar ph');
  avPh.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"></circle><path d="M5 20c.6-3.6 3.5-5.6 7-5.6s6.4 2 7 5.6"></path></svg>';
  const fileInput = document.createElement('input');
  fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.className = 'sr';
  fileInput.id = 'cliFoto-' + (c.id || 'nuevo') + '-' + Date.now();
  const fileLabel = document.createElement('label');
  fileLabel.className = 'btn btn-gold btn-sm'; fileLabel.htmlFor = fileInput.id; fileLabel.textContent = t.admSubirFoto;
  const rmBtn = el('button', 'btn btn-danger btn-sm', t.admQuitarFoto); rmBtn.type = 'button';
  const photoCol = el('div', 'cli-photo-col');
  const actsPhoto = el('div', 'acts');
  actsPhoto.append(fileInput, fileLabel, rmBtn);
  photoCol.append(avImg, avPh, actsPhoto);

  function refreshAvatar() {
    avImg.hidden = !fotoUrl;
    avPh.hidden = !!fotoUrl;
    rmBtn.hidden = !fotoUrl;
    if (fotoUrl) avImg.src = fotoUrl;
  }
  refreshAvatar();

  fileInput.addEventListener('change', async () => {
    const f = fileInput.files && fileInput.files[0];
    if (!f) return;
    const prevLabel = fileLabel.textContent;
    fileLabel.textContent = t.admSubiendoFoto;
    try {
      fotoUrl = await uploadPropFile(f, 600);
      refreshAvatar();
    } catch (e) {
      console.error('Error subiendo la foto del cliente:', e);
      alert(t.admErrorSubirFoto);
    } finally {
      fileLabel.textContent = prevLabel;
      fileInput.value = '';
    }
  });
  rmBtn.addEventListener('click', () => { fotoUrl = ''; refreshAvatar(); });

  const nombreInput = document.createElement('input');
  nombreInput.type = 'text'; nombreInput.value = c.nombre || ''; nombreInput.placeholder = t.admPlaceholderNombreCliente;

  const telInput = document.createElement('input');
  telInput.type = 'tel'; telInput.value = c.telefono || ''; telInput.placeholder = '+502 0000 0000';

  const dpiInput = document.createElement('input');
  dpiInput.type = 'text'; dpiInput.maxLength = 15; dpiInput.value = c.dpi || ''; dpiInput.placeholder = t.admPlaceholderDpi;

  const vendSel = document.createElement('select');
  cliPoblarVendedorSelect(vendSel, c.vendedor_asignado || '');
  if (!vendedoresCatalogoCargado) cargarVendedoresCatalogo().then(() => cliPoblarVendedorSelect(vendSel, c.vendedor_asignado || ''));

  const depSel = document.createElement('select');
  const depOptVacio = document.createElement('option');
  depOptVacio.value = ''; depOptVacio.textContent = t.adminSelecciona;
  depSel.appendChild(depOptVacio);
  Object.keys(DEPARTAMENTOS_GT).sort().forEach((dep) => {
    const opt = document.createElement('option');
    opt.value = dep; opt.textContent = dep;
    depSel.appendChild(opt);
  });

  const munSel = document.createElement('select');
  function poblarMunicipios(depSeleccionado, munActual) {
    munSel.innerHTML = '';
    const optVacio = document.createElement('option');
    optVacio.value = ''; optVacio.textContent = t.adminSelecciona;
    munSel.appendChild(optVacio);
    (DEPARTAMENTOS_GT[depSeleccionado] || []).forEach((mun) => {
      const opt = document.createElement('option');
      opt.value = mun; opt.textContent = mun;
      munSel.appendChild(opt);
    });
    munSel.value = munActual && (DEPARTAMENTOS_GT[depSeleccionado] || []).includes(munActual) ? munActual : '';
  }
  const depDefault = isNew ? 'Guatemala' : (c.departamento || '');
  const munDefault = isNew ? 'Guatemala' : (c.municipio || '');
  depSel.value = depDefault;
  poblarMunicipios(depDefault, munDefault);
  depSel.addEventListener('change', () => poblarMunicipios(depSel.value, ''));

  const dirInput = document.createElement('input');
  dirInput.type = 'text'; dirInput.value = c.direccion || ''; dirInput.placeholder = t.admPlaceholderDetalleDireccion;

  const estadoSel = document.createElement('select');
  ESTADOS_CLIENTE.forEach((es) => {
    const opt = document.createElement('option');
    opt.value = es.v; opt.textContent = es.l;
    estadoSel.appendChild(opt);
  });
  estadoSel.value = c.estado || 'activo';

  const profesionSel = document.createElement('select');
  const profOptVacio = document.createElement('option');
  profOptVacio.value = ''; profOptVacio.textContent = t.adminSelecciona;
  profesionSel.appendChild(profOptVacio);
  PROFESIONES_GT.forEach((prof) => {
    const opt = document.createElement('option');
    opt.value = prof; opt.textContent = prof;
    profesionSel.appendChild(opt);
  });
  if (c.profesion && !PROFESIONES_GT.includes(c.profesion)) {
    const opt = document.createElement('option');
    opt.value = c.profesion; opt.textContent = c.profesion;
    profesionSel.appendChild(opt);
  }
  profesionSel.value = c.profesion || '';

  const hoyDate = new Date();
  const hoyDisplay = hoyDate.toLocaleDateString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const actions = el('div', 'proy-actions');
  const saveBtn = el('button', 'btn btn-dark btn-sm', t.btnGuardar); saveBtn.type = 'button';
  const cancelBtn = el('button', 'btn btn-line-dark btn-sm', t.btnCancelar); cancelBtn.type = 'button';
  actions.append(saveBtn, cancelBtn);

  const editLayout = el('div', 'cli-edit-layout');
  const rightCol = el('div');

  const secIdent = el('div', 'cli-sec');
  const identHead = el('div', 'cli-sec-h');
  identHead.textContent = t.admCodigoCliente + ' — ' + (isNew ? t.admCodigoSeAsignaAutomatico : cliCodigo(c));
  secIdent.append(identHead);
  const gridIdent = el('div', 'cli-grid');
  gridIdent.append(
    labeledCell(t.admNombre, nombreInput),
    labeledCell(t.admEstadoCliente, estadoSel),
    labeledCell(t.admProfesion, profesionSel)
  );
  secIdent.append(gridIdent);

  const secContacto = el('div', 'cli-sec');
  secContacto.append(el('div', 'cli-sec-h', t.admCliSeccionContacto));
  const gridContacto = el('div', 'cli-grid');
  gridContacto.append(
    labeledCell(t.admTelefono, telInput),
    labeledCell(t.admDpi, dpiInput),
    labeledCell(t.admCliVendedorAsignado, vendSel)
  );
  secContacto.append(gridContacto);

  const secUbicacion = el('div', 'cli-sec');
  secUbicacion.append(el('div', 'cli-sec-h', t.admCliSeccionUbicacion));
  const gridUbicacion = el('div', 'cli-grid');
  gridUbicacion.append(
    labeledCell(t.admDepartamento, depSel),
    labeledCell(t.admMunicipio, munSel),
    labeledCell(t.admDetalleDireccion, dirInput)
  );
  secUbicacion.append(gridUbicacion);

  const secAdmin = el('div', 'cli-sec');
  secAdmin.append(el('div', 'cli-sec-h', t.admCliSeccionAdmin));
  const gridAdmin = el('div', 'cli-grid');
  gridAdmin.append(
    labeledCell(t.admUsuario, el('span', '', t.admSeGrabaAutomaticamente + (localStorage.getItem(LOGIN_STORE) || t.admUsuarioActualFallback) + ')')),
    labeledCell(t.admFechaGrabacion, el('span', '', isNew ? t.admSeAsignaAutomaticoFecha + hoyDisplay + ')' : (c.created_at ? formatQBuscarRegFecha(c.created_at) : '—')))
  );
  secAdmin.append(gridAdmin);

  rightCol.append(secIdent, secContacto, secUbicacion, secAdmin);
  editLayout.append(photoCol, rightCol);
  card.append(editLayout, actions);

  cancelBtn.addEventListener('click', () => {
    if (isNew) {
      card.remove();
      if (!$('#adminClientesList').children.length) pintarAdminClientesList();
    } else {
      cliRenderView(card, c);
    }
  });
  saveBtn.addEventListener('click', async () => {
    const nombre = nombreInput.value.trim();
    if (!nombre) { alert(t.admEscribeNombreCliente); return; }
    saveBtn.disabled = true;
    const payload = {
      nombre,
      telefono: telInput.value.trim() || null,
      dpi: dpiInput.value.trim() || null,
      vendedor_asignado: vendSel.value || null,
      departamento: depSel.value || null,
      municipio: munSel.value || null,
      direccion: dirInput.value.trim() || null,
      estado: estadoSel.value || 'activo',
      profesion: profesionSel.value || null,
      foto_url: fotoUrl || null,
      usuario: localStorage.getItem(LOGIN_STORE) || null
    };
    try {
      if (isNew) {
        const anio = new Date().getFullYear();
        const correlativo = await cliSiguienteCorrelativo(anio);
        const nuevo = await crearCliente({ ...payload, anio, correlativo });
        adminCliData.unshift(nuevo);
        cliRenderView(card, nuevo);
      } else {
        await guardarClienteDesdeListado(c, payload);
        cliRenderView(card, c);
      }
    } catch (e) {
      console.error('Error guardando el cliente:', e);
      alert(t.admErrorGuardarCliente);
      saveBtn.disabled = false;
    }
  });
}

async function crearCliente(payload) {
  const { data: row, error } = await supabaseClient.from('clientes').insert(payload).select().single();
  if (error) throw error;
  return row;
}

async function guardarClienteDesdeListado(c, payload) {
  const { error } = await supabaseClient.from('clientes').update(payload).eq('id', c.id);
  if (error) throw error;
  Object.assign(c, payload);
}

function pintarAdminClientesList() {
  const list = $('#adminClientesList');
  if (!list) return;
  list.innerHTML = '';
  if (!adminCliData.length) { list.innerHTML = '<p class="proy-empty">' + T[lang].admNoHayClientes + '</p>'; return; }
  adminCliData.forEach((c) => {
    const card = el('div', 'proy-card');
    cliRenderView(card, c);
    list.appendChild(card);
  });
}

async function cargarAdminCliData(filtroNombre) {
  const list = $('#adminClientesList');
  if (list) list.innerHTML = '<p class="proy-empty">' + T[lang].adminCargandoPuntos + '</p>';
  try {
    let query = supabaseClient.from('clientes').select('*').order('id', { ascending: false });
    if (filtroNombre) query = query.ilike('nombre', '%' + filtroNombre + '%');
    const { data: rows, error } = await query;
    if (error) throw error;
    adminCliData = rows || [];
  } catch (e) {
    console.error('Error cargando los clientes:', e);
    adminCliData = [];
  }
  pintarAdminClientesList();
}

$('#adminCliMostrarBtn')?.addEventListener('click', () => {
  cargarAdminCliData(($('#adminCliBuscarInput')?.value || '').trim());
});
$('#adminCliBuscarInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); $('#adminCliMostrarBtn')?.click(); }
});
$('#adminCliNuevoBtn')?.addEventListener('click', () => {
  const list = $('#adminClientesList');
  if (!list) return;
  if (list.querySelector('.proy-card-edit')) return;
  const emptyMsg = list.querySelector('.proy-empty');
  if (emptyMsg) emptyMsg.remove();
  const card = el('div', 'proy-card');
  list.prepend(card);
  cliRenderEdit(card, {}, true);
});

const adminClientesModal = $('#adminClientesModal');
function abrirAdminClientesModal() {
  if (!adminClientesModal) return;
  if ($('#adminCliBuscarInput')) $('#adminCliBuscarInput').value = '';
  adminClientesModal.hidden = false;
  if (!vendedoresCatalogoCargado) { vendedoresCatalogoCargado = true; cargarVendedoresCatalogo(); }
  cargarAdminCliData();
}
function cerrarAdminClientesModal() { if (adminClientesModal) adminClientesModal.hidden = true; }
$('#navAdminClientesBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  abrirAdminClientesModal();
});
$('#adminClientesClose')?.addEventListener('click', cerrarAdminClientesModal);
$('#adminClientesScrim')?.addEventListener('click', cerrarAdminClientesModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && adminClientesModal && !adminClientesModal.hidden) cerrarAdminClientesModal(); });

/* ===== Citas (catálogo: consulta general) =====
   Panel de consulta de "citas_propiedades" con filtros por Cliente,
   Departamento, Municipio (resueltos vía el catálogo de Clientes, ya que
   la cita solo guarda el nombre del cliente como texto) y rango de
   fechas, con Modificar (reutiliza el modal de Agendar Cita) y Eliminar
   por cada resultado. */
function citPrimerDiaMesIso() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-01';
}
function citUltimoDiaMesIso() {
  const d = new Date();
  const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return ultimo.getFullYear() + '-' + String(ultimo.getMonth() + 1).padStart(2, '0') + '-' + String(ultimo.getDate()).padStart(2, '0');
}

function citClientePorNombre(nombre) {
  if (!nombre) return null;
  return clientesCatalogoFull.find((c) => (c.nombre || '').trim().toLowerCase() === nombre.trim().toLowerCase()) || null;
}

/* El catálogo liviano (clientesCatalogo, usado en el select de Propiedades)
   solo trae id+nombre; aquí necesitamos también departamento/municipio,
   así que se carga un catálogo completo aparte, también perezoso. */
let clientesCatalogoFull = [];
let clientesCatalogoFullCargado = false;
async function cargarClientesCatalogoFull() {
  try {
    const { data: rows, error } = await supabaseClient.from('clientes').select('id, nombre, departamento, municipio').order('nombre', { ascending: true });
    if (error) throw error;
    clientesCatalogoFull = rows || [];
  } catch (e) {
    console.error('Error cargando el catálogo de clientes (completo):', e);
    clientesCatalogoFull = [];
  }
  clientesCatalogoFullCargado = true;
}

function poblarCitFiltroClienteSel() {
  const sel = $('#adminCitClienteSel');
  if (!sel) return;
  const actual = sel.value;
  sel.innerHTML = '';
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = T[lang].admCitTodosLosClientes;
  sel.appendChild(optTodos);
  clientesCatalogoFull.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.nombre; opt.textContent = c.nombre;
    sel.appendChild(opt);
  });
  sel.value = actual && Array.from(sel.options).some((o) => o.value === actual) ? actual : '';
}

function poblarCitFiltroDeptoSel() {
  const sel = $('#adminCitDeptoSel');
  if (!sel) return;
  const actual = sel.value;
  sel.innerHTML = '';
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = T[lang].admCitTodosLosDepartamentos;
  sel.appendChild(optTodos);
  Object.keys(DEPARTAMENTOS_GT).sort().forEach((dep) => {
    const opt = document.createElement('option');
    opt.value = dep; opt.textContent = dep;
    sel.appendChild(opt);
  });
  sel.value = actual && Array.from(sel.options).some((o) => o.value === actual) ? actual : '';
}

function poblarCitFiltroMunSel(depSeleccionado, munActual) {
  const sel = $('#adminCitMunSel');
  if (!sel) return;
  sel.innerHTML = '';
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = T[lang].admCitTodosLosMunicipios;
  sel.appendChild(optTodos);
  (DEPARTAMENTOS_GT[depSeleccionado] || []).forEach((mun) => {
    const opt = document.createElement('option');
    opt.value = mun; opt.textContent = mun;
    sel.appendChild(opt);
  });
  sel.value = munActual && (DEPARTAMENTOS_GT[depSeleccionado] || []).includes(munActual) ? munActual : '';
}
$('#adminCitDeptoSel')?.addEventListener('change', () => poblarCitFiltroMunSel($('#adminCitDeptoSel').value, ''));

function citEtqLabel(etiqueta) {
  const t = T[lang];
  const map = { cliente: 'citaEtqCliente', muy_interesado: 'citaEtqMuyInteresado', interesado: 'citaEtqInteresado', poco_interesado: 'citaEtqPocoInteresado' };
  return t[map[etiqueta]] || etiqueta || '—';
}
function citEstLabel(estado) {
  const t = T[lang];
  const map = { agendado: 'citaEstAgendado', efectuado: 'citaEstEfectuado', reagendado: 'citaEstReagendado', no_asistio: 'citaEstNoAsistio' };
  return t[map[estado]] || estado || '—';
}

function citCrearTarjeta(row) {
  const t = T[lang];
  const card = el('div', 'proy-card cli-card');
  const head = el('div', 'cli-head');
  const ph = el('div', 'avatar ph');
  ph.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"></circle><path d="M5 20c.6-3.6 3.5-5.6 7-5.6s6.4 2 7 5.6"></path></svg>';
  head.appendChild(ph);
  const info = el('div', 'cli-head-info');
  info.append(el('div', 'cli-head-name', row.nombre_cliente || '—'));
  info.append(el('div', 'cli-head-code', (row.fecha_cita_texto || row.fecha_cita || '—') + (row.hora_cita ? ' · ' + row.hora_cita : '')));
  const etqCls = { cliente: 'cli-badge-activo', muy_interesado: 'cli-badge-activo', interesado: 'cli-badge-inactivo', poco_interesado: 'cli-badge-baja' }[row.etiqueta] || 'cli-badge-activo';
  info.append(el('span', 'cli-head-badge ' + etqCls, citEtqLabel(row.etiqueta)));
  head.append(info);
  card.append(head);

  const sec = el('div', 'cli-sec');
  const grid = el('div', 'cli-grid');
  grid.append(
    labeledCell(t.citaTelefono, el('span', '', row.telefono_cliente || '—')),
    labeledCell(t.citaCiudad, el('span', '', row.ciudad || '—')),
    labeledCell(t.citaAsesor, el('span', '', row.vendedor_asignado || '—')),
    labeledCell(t.citaEstado, el('span', '', citEstLabel(row.estado))),
    labeledCell(t.citaUbicacion, el('span', '', row.ubicacion || '—'))
  );
  sec.append(grid);
  card.append(sec);
  if (row.accion) {
    const accSec = el('div', 'cli-sec');
    accSec.append(el('div', 'cli-sec-h', t.citaAccion));
    accSec.append(el('p', '', row.accion));
    card.append(accSec);
  }

  const actions = el('div', 'proy-actions');
  const modBtn = el('button', 'btn btn-line-dark btn-sm', t.btnModificar); modBtn.type = 'button';
  const delBtn = el('button', 'btn btn-line-dark btn-sm sol-del', t.btnEliminar); delBtn.type = 'button';
  actions.append(modBtn, delBtn);
  card.append(actions);

  modBtn.addEventListener('click', () => {
    cerrarAdminCitasModal();
    openCitaModal({ ciudad: row.ciudad, ubicacion: row.ubicacion, vendedor: row.vendedor_asignado });
    citaGuardadaId = row.id;
    $('#cita-nombre').value = row.nombre_cliente || '';
    $('#cita-tel').value = row.telefono_cliente || '';
    $('#cita-fecha').value = row.fecha_cita || '';
    actualizarCitaFechaDia();
    poblarCitaHoraSelect();
    $('#cita-hora').value = row.hora_cita || '07:00';
    $('#cita-ciudad').value = row.ciudad || '';
    $('#cita-ubicacion').value = row.ubicacion || '';
    $('#cita-accion').value = row.accion || '';
    $('#cita-estado').value = row.estado || 'agendado';
    $('#cita-etiqueta').value = row.etiqueta || 'cliente';
    actualizarCitaEtiquetaColor();
    $('#citaModBtn').hidden = false;
    $('#citaSaveBtn').hidden = true;
    const applyVendedor = () => { if (row.vendedor_asignado) $('#cita-vendedor').value = row.vendedor_asignado; };
    if (vendedoresCatalogoCargado) applyVendedor(); else cargarVendedoresCatalogo().then(applyVendedor);
  });
  delBtn.addEventListener('click', async () => {
    if (!confirm(t.admCitConfirmEliminar)) return;
    delBtn.disabled = true;
    try {
      const { error } = await supabaseClient.from('citas_propiedades').delete().eq('id', row.id);
      if (error) throw error;
      card.remove();
      if (!$('#adminCitasList').children.length) pintarCitCardsVacio();
    } catch (e) {
      console.error('Error eliminando la cita:', e);
      alert(t.admCitErrorEliminar);
      delBtn.disabled = false;
    }
  });

  return card;
}

function pintarCitCardsVacio() {
  const list = $('#adminCitasList');
  if (!list) return;
  list.innerHTML = '';
  list.appendChild(el('p', 'proy-empty', T[lang].admCitNoHayCitas));
}

async function buscarCitas() {
  const list = $('#adminCitasList');
  if (!list) return;
  list.innerHTML = '<p class="proy-empty">' + T[lang].cargando + '</p>';
  const clienteVal = $('#adminCitClienteSel')?.value || '';
  const deptoVal = $('#adminCitDeptoSel')?.value || '';
  const munVal = $('#adminCitMunSel')?.value || '';
  const desdeVal = $('#adminCitFechaDesde')?.value || citPrimerDiaMesIso();
  const hastaVal = $('#adminCitFechaHasta')?.value || citUltimoDiaMesIso();
  try {
    let q = supabaseClient.from('citas_propiedades').select('*').order('fecha_cita', { ascending: true }).order('hora_cita', { ascending: true });
    if (desdeVal) q = q.gte('fecha_cita', desdeVal);
    if (hastaVal) q = q.lte('fecha_cita', hastaVal);
    if (clienteVal) q = q.eq('nombre_cliente', clienteVal);
    const { data: rows, error } = await q;
    if (error) throw error;
    let filtrados = rows || [];
    if (deptoVal || munVal) {
      filtrados = filtrados.filter((row) => {
        const cli = citClientePorNombre(row.nombre_cliente);
        if (!cli) return false;
        if (deptoVal && (cli.departamento || '') !== deptoVal) return false;
        if (munVal && (cli.municipio || '') !== munVal) return false;
        return true;
      });
    }
    list.innerHTML = '';
    if (!filtrados.length) { pintarCitCardsVacio(); return; }
    filtrados.forEach((row) => list.appendChild(citCrearTarjeta(row)));
  } catch (e) {
    console.error('Error buscando citas:', e);
    list.innerHTML = '<p class="proy-empty">' + T[lang].admCitErrorGuardar + '</p>';
  }
}
$('#adminCitBuscarBtn')?.addEventListener('click', buscarCitas);

const adminCitasModal = $('#adminCitasModal');
async function abrirAdminCitasModal() {
  if (!adminCitasModal) return;
  adminCitasModal.hidden = false;
  $('#adminCitFechaDesde').value = citPrimerDiaMesIso();
  $('#adminCitFechaHasta').value = citUltimoDiaMesIso();
  $('#adminCitDeptoSel').value = '';
  poblarCitFiltroDeptoSel();
  poblarCitFiltroMunSel('', '');
  if (!clientesCatalogoFullCargado) { clientesCatalogoFullCargado = true; await cargarClientesCatalogoFull(); }
  poblarCitFiltroClienteSel();
  buscarCitas();
}
function cerrarAdminCitasModal() { if (adminCitasModal) adminCitasModal.hidden = true; }
$('#navAdminCitasBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  abrirAdminCitasModal();
});
$('#adminCitasClose')?.addEventListener('click', cerrarAdminCitasModal);
$('#adminCitasScrim')?.addEventListener('click', cerrarAdminCitasModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && adminCitasModal && !adminCitasModal.hidden) cerrarAdminCitasModal(); });

/* ===== Seguimientos de cliente =====
   Botón "Seguimientos" de cada ficha de cliente: historial de llamadas y
   gestiones (fecha, vendedor, acción, resultado, descripción) guardado en
   seguimientos_clientes, filtrado por el código del cliente. */
function getAccionesSeguimiento() {
  const t = T[lang] || T.es;
  return [
    { v: 'llamada', l: t.segAccLlamada },
    { v: 'visita_propiedad', l: t.segAccVisita },
    { v: 'seguimiento_servicio', l: t.segAccServicio }
  ];
}
function getResultadosSeguimiento() {
  const t = T[lang] || T.es;
  return [
    { v: 'interesado', l: t.segResInteresado },
    { v: 'no_interesado', l: t.segResNoInteresado },
    { v: 'confirmado', l: t.segResConfirmado },
    { v: 'indeciso', l: t.segResIndeciso }
  ];
}
const segAccionLabel = (v) => (getAccionesSeguimiento().find((o) => o.v === v) || {}).l || v || '—';
const segResultadoLabel = (v) => (getResultadosSeguimiento().find((o) => o.v === v) || {}).l || v || '—';

let segClienteActual = null;

function segPoblarVendedorSelect(sel, actual) {
  sel.innerHTML = '';
  const optVacio = document.createElement('option');
  optVacio.value = ''; optVacio.textContent = T[lang].segSinVendedor;
  sel.appendChild(optVacio);
  vendedoresCatalogo.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v.nombre; opt.textContent = v.nombre;
    sel.appendChild(opt);
  });
  sel.value = actual || '';
}

function segCrearTarjetaEdit(row, isNew) {
  const t = T[lang];
  const card = el('div', 'proy-card proy-card-edit cli-card');

  const fechaInput = document.createElement('input');
  fechaInput.type = 'date'; fechaInput.value = row.fecha_llamada || ageFechaIso(new Date());

  const vendSel = document.createElement('select');
  segPoblarVendedorSelect(vendSel, row.vendedor || '');
  if (!vendedoresCatalogoCargado) cargarVendedoresCatalogo().then(() => segPoblarVendedorSelect(vendSel, row.vendedor || ''));

  const accSel = document.createElement('select');
  getAccionesSeguimiento().forEach((o) => { const opt = document.createElement('option'); opt.value = o.v; opt.textContent = o.l; accSel.appendChild(opt); });
  accSel.value = row.accion || 'llamada';

  const resSel = document.createElement('select');
  getResultadosSeguimiento().forEach((o) => { const opt = document.createElement('option'); opt.value = o.v; opt.textContent = o.l; resSel.appendChild(opt); });
  resSel.value = row.resultado || 'interesado';

  const descInput = document.createElement('textarea');
  descInput.rows = 3; descInput.placeholder = t.segPlaceholderDescripcion; descInput.value = row.descripcion || '';

  const grid = el('div', 'cli-grid');
  grid.append(
    labeledCell(t.segFechaLlamada, fechaInput),
    labeledCell(t.segVendedor, vendSel),
    labeledCell(t.segAccion, accSel),
    labeledCell(t.segResultado, resSel)
  );
  card.append(grid);
  card.append(labeledCell(t.segDescripcion, descInput));

  const actions = el('div', 'proy-actions');
  const saveBtn = el('button', 'btn btn-dark btn-sm', t.btnGuardar); saveBtn.type = 'button';
  const cancelBtn = el('button', 'btn btn-line-dark btn-sm', t.btnCancelar); cancelBtn.type = 'button';
  actions.append(saveBtn, cancelBtn);
  card.append(actions);

  cancelBtn.addEventListener('click', () => {
    if (isNew) card.remove();
    else segRenderView(card, row);
  });
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    try {
      const payload = {
        cliente_codigo: segClienteActual.codigo || '',
        cliente_nombre: segClienteActual.nombre || '',
        fecha_llamada: fechaInput.value || ageFechaIso(new Date()),
        vendedor: vendSel.value || null,
        accion: accSel.value || 'llamada',
        resultado: resSel.value || 'interesado',
        descripcion: descInput.value.trim() || null,
        usuario: localStorage.getItem(LOGIN_STORE) || null
      };
      if (isNew) {
        const { data, error } = await supabaseClient.from('seguimientos_clientes').insert(payload).select().single();
        if (error) throw error;
        Object.assign(row, data);
      } else {
        const { error } = await supabaseClient.from('seguimientos_clientes').update(payload).eq('id', row.id);
        if (error) throw error;
        Object.assign(row, payload);
      }
      segRenderView(card, row);
    } catch (e) {
      console.error('Error guardando el seguimiento:', e);
      alert(t.segErrorGuardar);
    } finally {
      saveBtn.disabled = false;
    }
  });

  return card;
}

function segRenderView(card, row) {
  const t = T[lang];
  card.innerHTML = '';
  card.className = 'proy-card cli-card';
  const grid = el('div', 'cli-grid');
  grid.append(
    labeledCell(t.segFechaLlamada, el('span', '', row.fecha_llamada ? formatQBuscarRegFecha(row.fecha_llamada) : '—')),
    labeledCell(t.segVendedor, el('span', '', row.vendedor || t.segSinVendedor)),
    labeledCell(t.segAccion, el('span', '', segAccionLabel(row.accion))),
    labeledCell(t.segResultado, el('span', '', segResultadoLabel(row.resultado)))
  );
  card.append(grid);
  if (row.descripcion) {
    const sec = el('div', 'cli-sec');
    sec.append(el('div', 'cli-sec-h', t.segDescripcion));
    sec.append(el('p', '', row.descripcion));
    card.append(sec);
  }
  const actions = el('div', 'proy-actions');
  const modBtn = el('button', 'btn btn-line-dark btn-sm', t.btnModificar); modBtn.type = 'button';
  const delBtn = el('button', 'btn btn-line-dark btn-sm sol-del', t.btnEliminar); delBtn.type = 'button';
  actions.append(modBtn, delBtn);
  card.append(actions);
  modBtn.addEventListener('click', () => {
    const edit = segCrearTarjetaEdit(row, false);
    card.replaceWith(edit);
  });
  delBtn.addEventListener('click', async () => {
    if (!confirm(t.segConfirmEliminar)) return;
    delBtn.disabled = true;
    try {
      const { error } = await supabaseClient.from('seguimientos_clientes').delete().eq('id', row.id);
      if (error) throw error;
      card.remove();
      if (!$('#segList').children.length) segPintarVacio();
    } catch (e) {
      console.error('Error eliminando el seguimiento:', e);
      alert(t.segErrorEliminar);
      delBtn.disabled = false;
    }
  });
}

function segPintarVacio() {
  const list = $('#segList');
  if (!list) return;
  list.innerHTML = '';
  list.appendChild(el('p', 'proy-empty', T[lang].segSinRegistros));
}

async function segCargarYPintar() {
  const list = $('#segList');
  if (!list || !segClienteActual) return;
  list.innerHTML = '<p class="proy-empty">' + T[lang].cargando + '</p>';
  try {
    const { data: rows, error } = await supabaseClient.from('seguimientos_clientes').select('*').eq('cliente_codigo', segClienteActual.codigo || '').order('fecha_llamada', { ascending: false }).order('created_at', { ascending: false });
    if (error) throw error;
    list.innerHTML = '';
    if (!rows || !rows.length) { segPintarVacio(); return; }
    rows.forEach((row) => { const card = el('div'); list.appendChild(card); segRenderView(card, row); });
  } catch (e) {
    console.error('Error cargando los seguimientos:', e);
    list.innerHTML = '<p class="proy-empty">' + T[lang].segErrorCargar + '</p>';
  }
}

const segModal = $('#segModal');
function abrirSegModal(cliente) {
  if (!segModal) return;
  segClienteActual = cliente;
  $('#segSub').textContent = T[lang].segSubtituloModal + ' ' + (cliente.nombre || '');
  segModal.hidden = false;
  if (!vendedoresCatalogoCargado) { vendedoresCatalogoCargado = true; cargarVendedoresCatalogo(); }
  segCargarYPintar();
}
function cerrarSegModal() { if (segModal) segModal.hidden = true; }
$('#segClose')?.addEventListener('click', cerrarSegModal);
$('#segScrim')?.addEventListener('click', cerrarSegModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && segModal && !segModal.hidden) cerrarSegModal(); });
$('#segNuevoBtn')?.addEventListener('click', () => {
  const list = $('#segList');
  if (!list || !segClienteActual) return;
  if (list.querySelector('.proy-empty')) list.innerHTML = '';
  const nuevoRow = { fecha_llamada: ageFechaIso(new Date()), accion: 'llamada', resultado: 'interesado' };
  const card = segCrearTarjetaEdit(nuevoRow, true);
  list.prepend(card);
});

/* ===== Ver actividades (resumen cruzado por cliente) =====
   Botón "Ver actividades" de cada ficha de cliente: agrega, en un solo
   panel de solo lectura, todo lo que existe para ese cliente en Citas,
   Propiedades, Servicios y Seguimientos — cruzando por nombre (Citas,
   Propiedades) o por código de cliente (Servicios, Seguimientos), igual
   que el resto de la app ya lo hace entre estos mismos catálogos. */
function actSeccion(titulo, filas, vacioTexto, filaBuilder) {
  const sec = el('div', 'cli-sec');
  sec.append(el('div', 'cli-sec-h', titulo));
  if (!filas || !filas.length) {
    sec.append(el('p', 'proy-empty', vacioTexto));
    return sec;
  }
  const list = el('div', 'proy-list');
  filas.forEach((f) => list.appendChild(filaBuilder(f)));
  sec.append(list);
  return sec;
}
function actFilaSimple(grid) {
  const card = el('div', 'proy-card cli-card');
  const g = el('div', 'cli-grid');
  g.append(...grid);
  card.append(g);
  return card;
}

async function actCargarYPintar(cliente) {
  const t = T[lang];
  const body = $('#actBody');
  if (!body) return;
  body.innerHTML = '<p class="proy-empty">' + t.cargando + '</p>';
  try {
    const nombre = cliente.nombre || '';
    const [citasRes, propsRes, servRes, segRes] = await Promise.all([
      supabaseClient.from('citas_propiedades').select('*').eq('nombre_cliente', nombre).order('fecha_cita', { ascending: false }),
      supabaseClient.from('propiedades').select('*').eq('cliente_asignado', nombre),
      supabaseClient.from('solicitudes_servicio').select('*').eq('cliente_codigo', cliente.codigo || ''),
      supabaseClient.from('seguimientos_clientes').select('*').eq('cliente_codigo', cliente.codigo || '').order('fecha_llamada', { ascending: false })
    ]);
    if (citasRes.error) throw citasRes.error;
    if (propsRes.error) throw propsRes.error;
    if (servRes.error) throw servRes.error;
    if (segRes.error) throw segRes.error;

    body.innerHTML = '';
    body.append(actSeccion(t.actSeccionCitas, citasRes.data, t.actSinCitas, (row) => actFilaSimple([
      labeledCell(t.citaFecha, el('span', '', (row.fecha_cita_texto || row.fecha_cita || '—') + (row.hora_cita ? ' · ' + row.hora_cita : ''))),
      labeledCell(t.citaCiudad, el('span', '', row.ciudad || '—')),
      labeledCell(t.citaAsesor, el('span', '', row.vendedor_asignado || '—')),
      labeledCell(t.citaEstado, el('span', '', citEstLabel(row.estado)))
    ])));
    body.append(actSeccion(t.actSeccionPropiedades, propsRes.data, t.actSinPropiedades, (row) => actFilaSimple([
      labeledCell(t.admPropNombre || 'Propiedad', el('span', '', row.nombre || '—')),
      labeledCell(t.admCiudad || 'Ciudad', el('span', '', row.ciudad || '—')),
      labeledCell(t.admEstadoUbicacion || 'Estado', el('span', '', ubicEstadoInfo(row.estado_ubicacion || row.estado || 'activa').l))
    ])));
    body.append(actSeccion(t.actSeccionServicios, servRes.data, t.actSinServicios, (row) => actFilaSimple([
      labeledCell(t.admServicio || 'Servicio', el('span', '', row.servicio || '—')),
      labeledCell(t.admEstado || 'Estado', el('span', '', row.estado || '—')),
      labeledCell(t.admFechaGrabacion, el('span', '', row.fecha_creacion ? formatQBuscarRegFecha(row.fecha_creacion) : '—'))
    ])));
    body.append(actSeccion(t.actSeccionSeguimientos, segRes.data, t.actSinSeguimientos, (row) => actFilaSimple([
      labeledCell(t.segFechaLlamada, el('span', '', row.fecha_llamada ? formatQBuscarRegFecha(row.fecha_llamada) : '—')),
      labeledCell(t.segAccion, el('span', '', segAccionLabel(row.accion))),
      labeledCell(t.segResultado, el('span', '', segResultadoLabel(row.resultado)))
    ])));
  } catch (e) {
    console.error('Error cargando actividades del cliente:', e);
    body.innerHTML = '<p class="proy-empty">' + t.actErrorCargar + '</p>';
  }
}

const actModal = $('#actModal');
function abrirActModal(cliente) {
  if (!actModal) return;
  $('#actSub').textContent = T[lang].actSubtituloModal + ' ' + (cliente.nombre || '');
  actModal.hidden = false;
  actCargarYPintar(cliente);
}
function cerrarActModal() { if (actModal) actModal.hidden = true; }
$('#actClose')?.addEventListener('click', cerrarActModal);
$('#actScrim')?.addEventListener('click', cerrarActModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && actModal && !actModal.hidden) cerrarActModal(); });

/* ===== Agenda de citas (catálogo) =====
   Calendario de solo lectura sobre "citas_propiedades" con tres vistas
   (Día, Semana, Mes). Las citas se agrupan por fecha_cita en memoria tras
   cargar todos los registros; al hacer clic en una cita se abre un modal
   de detalle (#ageDetalleModal). */
let ageCitasData = [];
let ageCitasCargadas = false;
let ageVistaActual = 'mes';
let ageFechaRef = new Date(); // fecha de referencia para la vista actual

async function cargarAgeCitasData() {
  try {
    const { data, error } = await supabaseClient.from('citas_propiedades').select('*').order('fecha_cita', { ascending: true });
    if (error) throw error;
    ageCitasData = data || [];
  } catch (e) {
    console.error('Error cargando las citas de la agenda:', e);
    ageCitasData = [];
  }
  ageCitasCargadas = true;
}

function ageCitasDeFecha(fechaIso) {
  return ageCitasData
    .filter((c) => c.fecha_cita === fechaIso)
    .sort((a, b) => (a.hora_cita || '').localeCompare(b.hora_cita || ''));
}

function ageEtiquetaChipClase(etiqueta) {
  return 'age-chip ' + ('age-chip-' + (CITA_ETQ_CLASES[etiqueta] || 'cliente').replace('etq-', ''));
}

function ageFechaIso(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}
function ageEsHoy(d) { return ageFechaIso(d) === ageFechaIso(new Date()); }
function ageInicioSemana(d) {
  const r = new Date(d);
  const dow = r.getDay(); // 0=domingo
  r.setDate(r.getDate() - dow);
  r.setHours(0, 0, 0, 0);
  return r;
}

function ageFormatearPeriodoLabel() {
  const t = T[lang];
  const localeStr = lang === 'en' ? 'en-US' : 'es-GT';
  if (ageVistaActual === 'dia') {
    return ageFechaRef.toLocaleDateString(localeStr, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }
  if (ageVistaActual === 'semana') {
    const inicio = ageInicioSemana(ageFechaRef);
    const fin = new Date(inicio); fin.setDate(fin.getDate() + 6);
    const fmt = (d) => d.toLocaleDateString(localeStr, { day: '2-digit', month: 'short' });
    return fmt(inicio) + ' – ' + fmt(fin) + ', ' + fin.getFullYear();
  }
  return ageFechaRef.toLocaleDateString(localeStr, { month: 'long', year: 'numeric' });
}

function agePintarVistaDia() {
  const t = T[lang];
  const body = $('#ageBody');
  const citas = ageCitasDeFecha(ageFechaIso(ageFechaRef));
  if (!citas.length) {
    body.innerHTML = '';
    body.appendChild(el('div', 'age-empty', t.admAgeNoHayCitasDia));
    return;
  }
  const list = el('div', 'age-dia-list');
  citas.forEach((c) => {
    const item = el('button', 'age-dia-item'); item.type = 'button';
    const hora = el('span', 'age-dia-hora', c.hora_cita || '—');
    const info = el('div', 'age-dia-info');
    info.append(el('div', 'age-dia-nombre', c.nombre_cliente || '—'));
    const subPartes = [c.ciudad, c.vendedor_asignado].filter(Boolean);
    info.append(el('div', 'age-dia-sub', subPartes.join(' · ')));
    item.append(hora, info);
    item.addEventListener('click', () => ageAbrirDetalle(c));
    list.appendChild(item);
  });
  body.innerHTML = '';
  body.appendChild(list);
}

function ageCrearChip(c) {
  const chip = el('button', ageEtiquetaChipClase(c.etiqueta));
  chip.type = 'button';
  chip.textContent = (c.hora_cita ? c.hora_cita + ' ' : '') + (c.nombre_cliente || '—');
  chip.addEventListener('click', (ev) => { ev.stopPropagation(); ageAbrirDetalle(c); });
  return chip;
}

function agePintarVistaSemana() {
  const t = T[lang];
  const body = $('#ageBody');
  const inicio = ageInicioSemana(ageFechaRef);
  const localeStr = lang === 'en' ? 'en-US' : 'es-GT';
  const grid = el('div', 'age-semana-grid');
  for (let i = 0; i < 7; i++) {
    const d = new Date(inicio); d.setDate(d.getDate() + i);
    const col = el('div', 'age-semana-col' + (ageEsHoy(d) ? ' hoy' : ''));
    const head = el('div', 'age-semana-col-h');
    head.innerHTML = '';
    const dowSpan = document.createElement('span'); dowSpan.textContent = d.toLocaleDateString(localeStr, { weekday: 'short' });
    const numStrong = document.createElement('strong'); numStrong.textContent = String(d.getDate());
    head.append(dowSpan, numStrong);
    col.append(head);
    ageCitasDeFecha(ageFechaIso(d)).forEach((c) => col.appendChild(ageCrearChip(c)));
    grid.appendChild(col);
  }
  body.innerHTML = '';
  body.appendChild(grid);
}

function agePintarVistaMes() {
  const t = T[lang];
  const body = $('#ageBody');
  const localeStr = lang === 'en' ? 'en-US' : 'es-GT';
  const anio = ageFechaRef.getFullYear(), mes = ageFechaRef.getMonth();
  const primerDiaMes = new Date(anio, mes, 1);
  const inicioGrid = ageInicioSemana(primerDiaMes);

  const dowRow = el('div', 'age-mes-dow');
  const dowBase = new Date(2026, 0, 4); // un domingo de referencia
  for (let i = 0; i < 7; i++) {
    const d = new Date(dowBase); d.setDate(d.getDate() + i);
    const span = document.createElement('span'); span.textContent = d.toLocaleDateString(localeStr, { weekday: 'short' });
    dowRow.appendChild(span);
  }

  const grid = el('div', 'age-mes-grid');
  const MAX_CHIPS = 3;
  for (let i = 0; i < 42; i++) {
    const d = new Date(inicioGrid); d.setDate(d.getDate() + i);
    const fueraDeMes = d.getMonth() !== mes;
    const cell = el('div', 'age-mes-cell' + (fueraDeMes ? ' fuera-mes' : '') + (ageEsHoy(d) ? ' hoy' : ''));
    cell.appendChild(el('div', 'age-mes-num', String(d.getDate())));
    const citasDia = ageCitasDeFecha(ageFechaIso(d));
    citasDia.slice(0, MAX_CHIPS).forEach((c) => cell.appendChild(ageCrearChip(c)));
    if (citasDia.length > MAX_CHIPS) {
      cell.appendChild(el('span', 'age-chip-mas', t.admAgeMasCitas.replace('{n}', String(citasDia.length - MAX_CHIPS))));
    }
    grid.appendChild(cell);
    if (i >= 34 && d.getMonth() !== mes && d.getDay() === 6) break; // no agregar una 6ª fila completamente fuera del mes si no hace falta
  }

  body.innerHTML = '';
  body.appendChild(dowRow);
  body.appendChild(grid);
}

function agePintarVistaActual() {
  $('#agePeriodoLabel').textContent = ageFormatearPeriodoLabel();
  $$('.age-view-tab').forEach((b) => b.classList.toggle('active', b.dataset.view === ageVistaActual));
  if (ageVistaActual === 'dia') agePintarVistaDia();
  else if (ageVistaActual === 'semana') agePintarVistaSemana();
  else agePintarVistaMes();
}

function ageAbrirDetalle(c) {
  const t = T[lang];
  $('#ageDetNombre').textContent = c.nombre_cliente || '—';
  $('#ageDetTelefono').textContent = c.telefono_cliente || '—';
  $('#ageDetFecha').textContent = c.fecha_cita_texto || c.fecha_cita || '—';
  $('#ageDetHora').textContent = c.hora_cita || '—';
  $('#ageDetCiudad').textContent = c.ciudad || '—';
  $('#ageDetVendedor').textContent = c.vendedor_asignado || '—';
  const etqKeyMap = { cliente: 'citaEtqCliente', muy_interesado: 'citaEtqMuyInteresado', interesado: 'citaEtqInteresado', poco_interesado: 'citaEtqPocoInteresado' };
  $('#ageDetEtiqueta').textContent = t[etqKeyMap[c.etiqueta]] || c.etiqueta || '—';
  const estKeyMap = { agendado: 'citaEstAgendado', efectuado: 'citaEstEfectuado', reagendado: 'citaEstReagendado', no_asistio: 'citaEstNoAsistio' };
  $('#ageDetEstado').textContent = t[estKeyMap[c.estado]] || c.estado || '—';
  $('#ageDetUbicacion').textContent = c.ubicacion || '—';
  $('#ageDetAccion').textContent = c.accion || '—';
  $('#ageDetalleModal').hidden = false;
}
function ageCerrarDetalle() { $('#ageDetalleModal').hidden = true; }
$('#ageDetalleClose')?.addEventListener('click', ageCerrarDetalle);
$('#ageDetalleScrim')?.addEventListener('click', ageCerrarDetalle);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#ageDetalleModal') && !$('#ageDetalleModal').hidden) ageCerrarDetalle(); });

$$('.age-view-tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    ageVistaActual = btn.dataset.view;
    agePintarVistaActual();
  });
});
$('#agePrevBtn')?.addEventListener('click', () => {
  if (ageVistaActual === 'dia') ageFechaRef.setDate(ageFechaRef.getDate() - 1);
  else if (ageVistaActual === 'semana') ageFechaRef.setDate(ageFechaRef.getDate() - 7);
  else ageFechaRef.setMonth(ageFechaRef.getMonth() - 1);
  agePintarVistaActual();
});
$('#ageNextBtn')?.addEventListener('click', () => {
  if (ageVistaActual === 'dia') ageFechaRef.setDate(ageFechaRef.getDate() + 1);
  else if (ageVistaActual === 'semana') ageFechaRef.setDate(ageFechaRef.getDate() + 7);
  else ageFechaRef.setMonth(ageFechaRef.getMonth() + 1);
  agePintarVistaActual();
});
$('#ageHoyBtn')?.addEventListener('click', () => { ageFechaRef = new Date(); agePintarVistaActual(); });

const adminAgendaModal = $('#adminAgendaModal');
async function abrirAdminAgendaModal() {
  if (!adminAgendaModal) return;
  adminAgendaModal.hidden = false;
  ageFechaRef = new Date();
  ageVistaActual = 'mes';
  await cargarAgeCitasData();
  agePintarVistaActual();
}
function cerrarAdminAgendaModal() { if (adminAgendaModal) adminAgendaModal.hidden = true; }
$('#navAdminAgendaCitasBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  abrirAdminAgendaModal();
});
$('#adminAgendaClose')?.addEventListener('click', cerrarAdminAgendaModal);
$('#adminAgendaScrim')?.addEventListener('click', cerrarAdminAgendaModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && adminAgendaModal && !adminAgendaModal.hidden) cerrarAdminAgendaModal(); });

/* ===== Tipos de comisión (catálogo) =====
   Catálogo simple de tipos de comisión agrupados por negocio (Propiedades,
   Proyectos o Servicios), con un % de comisión por defecto de referencia.
   Mismo patrón de tarjetas que el catálogo de Vendedores. */
/* Las etiquetas ("l") se traducen en vivo según el idioma activo. */
function getNegociosTipo() {
  const t = T[lang] || T.es;
  return [
    { v: 'propiedades', l: t.admNegocioPropiedades },
    { v: 'proyectos', l: t.admNegocioProyectos },
    { v: 'servicios', l: t.admNegocioServicios }
  ];
}
Object.defineProperty(window, 'NEGOCIOS_TIPO', { get: getNegociosTipo });
const negocioLabel = (v) => (getNegociosTipo().find((n) => n.v === v) || {}).l || v || '—';

let adminTipoComData = [];

function tipoComCardHead(tc) {
  const head = el('div', 'proy-card-h');
  head.append(el('div', 'proy-name', tc.nombre || T[lang].admTipoSinNombre));
  return head;
}

function tipoComRenderView(card, tc) {
  const t = T[lang];
  card.innerHTML = '';
  card.classList.remove('proy-card-edit');
  const actions = el('div', 'proy-actions');
  const modBtn = el('button', 'btn btn-line-dark btn-sm', t.btnModificar); modBtn.type = 'button';
  const delBtn = el('button', 'btn btn-line-dark btn-sm sol-del', t.btnEliminar); delBtn.type = 'button';
  actions.append(modBtn, delBtn);

  card.append(tipoComCardHead(tc));
  const grid = el('div', 'proy-grid');
  grid.append(
    labeledCell(t.admNegocio, el('span', '', negocioLabel(tc.negocio))),
    labeledCell(t.admNombre, el('span', '', tc.nombre || '—')),
    labeledCell(t.admPctComisionDefecto, el('span', '', tc.porcentaje_default != null && tc.porcentaje_default !== '' ? (tc.porcentaje_default + '%') : '—'))
  );
  card.append(grid, actions);

  modBtn.addEventListener('click', () => tipoComRenderEdit(card, tc, false));
  delBtn.addEventListener('click', async () => {
    if (!confirm(t.admConfirmEliminarTipoComision)) return;
    delBtn.disabled = true;
    try {
      const { error } = await supabaseClient.from('tipos_comision').delete().eq('id', tc.id);
      if (error) throw error;
      adminTipoComData = adminTipoComData.filter((x) => x.id !== tc.id);
      card.remove();
      if (!$('#adminTiposComisionList').children.length) pintarAdminTiposComisionList();
    } catch (e) {
      console.error('Error eliminando el tipo de comisión:', e);
      alert(t.admErrorEliminarTipoComision);
      delBtn.disabled = false;
    }
  });
}

function tipoComRenderEdit(card, tc, isNew) {
  const t = T[lang];
  card.innerHTML = '';
  card.classList.add('proy-card-edit');

  const negocioSel = document.createElement('select');
  const optVacio = document.createElement('option'); optVacio.value = ''; optVacio.textContent = t.adminSelecciona;
  negocioSel.appendChild(optVacio);
  NEGOCIOS_TIPO.forEach((n) => {
    const opt = document.createElement('option'); opt.value = n.v; opt.textContent = n.l;
    negocioSel.appendChild(opt);
  });
  negocioSel.value = tc.negocio || '';

  const nombreInput = document.createElement('input');
  nombreInput.type = 'text'; nombreInput.value = tc.nombre || ''; nombreInput.placeholder = t.admPlaceholderNombreTipoComision;

  const pctInput = document.createElement('input');
  pctInput.type = 'number'; pctInput.min = '0'; pctInput.max = '100'; pctInput.step = '0.1';
  pctInput.value = tc.porcentaje_default != null ? tc.porcentaje_default : ''; pctInput.placeholder = '%';

  const actions = el('div', 'proy-actions');
  const saveBtn = el('button', 'btn btn-dark btn-sm', t.btnGuardar); saveBtn.type = 'button';
  const cancelBtn = el('button', 'btn btn-line-dark btn-sm', t.btnCancelar); cancelBtn.type = 'button';
  actions.append(saveBtn, cancelBtn);

  card.append(tipoComCardHead(tc));
  const grid = el('div', 'proy-grid');
  grid.append(
    labeledCell(t.admNegocio, negocioSel),
    labeledCell(t.admNombre, nombreInput),
    labeledCell(t.admPctComisionDefecto, pctInput)
  );
  card.append(grid, actions);

  cancelBtn.addEventListener('click', () => {
    if (isNew) {
      card.remove();
      if (!$('#adminTiposComisionList').children.length) pintarAdminTiposComisionList();
    } else {
      tipoComRenderView(card, tc);
    }
  });
  saveBtn.addEventListener('click', async () => {
    const nombre = nombreInput.value.trim();
    if (!nombre) { alert(t.admEscribeNombreTipoComision); return; }
    if (!negocioSel.value) { alert(t.admSeleccionaNegocio); return; }
    saveBtn.disabled = true;
    const payload = {
      nombre,
      negocio: negocioSel.value,
      porcentaje_default: pctInput.value !== '' ? pctInput.value : null,
      usuario: localStorage.getItem(LOGIN_STORE) || null
    };
    try {
      if (isNew) {
        const { data: row, error } = await supabaseClient.from('tipos_comision').insert(payload).select().single();
        if (error) throw error;
        adminTipoComData.unshift(row);
        tipoComRenderView(card, row);
      } else {
        const { error } = await supabaseClient.from('tipos_comision').update(payload).eq('id', tc.id);
        if (error) throw error;
        Object.assign(tc, payload);
        tipoComRenderView(card, tc);
      }
    } catch (e) {
      console.error('Error guardando el tipo de comisión:', e);
      alert(t.admErrorGuardarTipoComision);
      saveBtn.disabled = false;
    }
  });
}

function pintarAdminTiposComisionList() {
  const list = $('#adminTiposComisionList');
  if (!list) return;
  list.innerHTML = '';
  if (!adminTipoComData.length) { list.innerHTML = '<p class="proy-empty">' + T[lang].admNoHayTiposComision + '</p>'; return; }
  adminTipoComData.forEach((tc) => {
    const card = el('div', 'proy-card');
    tipoComRenderView(card, tc);
    list.appendChild(card);
  });
}

async function cargarAdminTipoComData(filtroNegocio) {
  const list = $('#adminTiposComisionList');
  if (list) list.innerHTML = '<p class="proy-empty">' + T[lang].adminCargandoPuntos + '</p>';
  try {
    let q = supabaseClient.from('tipos_comision').select('*').order('negocio', { ascending: true }).order('nombre', { ascending: true });
    if (filtroNegocio) q = q.eq('negocio', filtroNegocio);
    const { data, error } = await q;
    if (error) throw error;
    adminTipoComData = data || [];
  } catch (e) {
    console.error('Error cargando los tipos de comisión:', e);
    adminTipoComData = [];
  }
  pintarAdminTiposComisionList();
}

$('#adminTipoComMostrarBtn')?.addEventListener('click', () => {
  cargarAdminTipoComData($('#adminTipoComNegocioSel')?.value || '');
});
$('#adminTipoComNuevoBtn')?.addEventListener('click', () => {
  const list = $('#adminTiposComisionList');
  if (!list) return;
  if (list.querySelector('.proy-card-edit')) return;
  const emptyMsg = list.querySelector('.proy-empty');
  if (emptyMsg) emptyMsg.remove();
  const card = el('div', 'proy-card');
  list.prepend(card);
  tipoComRenderEdit(card, {}, true);
});

const adminTiposComisionModal = $('#adminTiposComisionModal');
function abrirAdminTiposComisionModal() {
  if (!adminTiposComisionModal) return;
  if ($('#adminTipoComNegocioSel')) $('#adminTipoComNegocioSel').value = '';
  adminTiposComisionModal.hidden = false;
  cargarAdminTipoComData();
}
function cerrarAdminTiposComisionModal() { if (adminTiposComisionModal) adminTiposComisionModal.hidden = true; }
$('#navAdminTiposComisionBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  abrirAdminTiposComisionModal();
});
$('#adminTiposComisionClose')?.addEventListener('click', cerrarAdminTiposComisionModal);
$('#adminTiposComisionScrim')?.addEventListener('click', cerrarAdminTiposComisionModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && adminTiposComisionModal && !adminTiposComisionModal.hidden) cerrarAdminTiposComisionModal(); });

async function crearVendedor(payload) {
  const { data: row, error } = await supabaseClient.from('vendedores').insert(payload).select().single();
  if (error) throw error;
  return row;
}

async function guardarVendedorDesdeListado(v, payload) {
  const { error } = await supabaseClient.from('vendedores').update(payload).eq('id', v.id);
  if (error) throw error;
  Object.assign(v, payload);
}

async function eliminarVendedorDesdeListado(v) {
  const { error } = await supabaseClient.from('vendedores').delete().eq('id', v.id);
  if (error) throw error;
}

function pintarAdminVendedoresList() {
  const list = $('#adminVendedoresList');
  if (!list) return;
  list.innerHTML = '';
  if (!adminVendData.length) { list.innerHTML = '<p class="proy-empty">' + T[lang].admNoHayVendedores + '</p>'; return; }
  adminVendData.forEach((v) => {
    const card = el('div', 'proy-card');
    vendRenderView(card, v);
    list.appendChild(card);
  });
}

async function cargarAdminVendData(filtroNombre) {
  const list = $('#adminVendedoresList');
  if (list) list.innerHTML = '<p class="proy-empty">' + T[lang].adminCargandoPuntos + '</p>';
  try {
    let query = supabaseClient.from('vendedores').select('*').order('id', { ascending: true });
    if (filtroNombre) query = query.ilike('nombre', '%' + filtroNombre + '%');
    const { data: rows, error } = await query;
    if (error) throw error;
    adminVendData = rows || [];
  } catch (e) {
    console.error('Error cargando los vendedores:', e);
    adminVendData = [];
  }
  pintarAdminVendedoresList();
}

$('#adminVendMostrarBtn')?.addEventListener('click', () => {
  cargarAdminVendData(($('#adminVendBuscarInput')?.value || '').trim());
});
$('#adminVendBuscarInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); $('#adminVendMostrarBtn')?.click(); }
});
$('#adminVendNuevoBtn')?.addEventListener('click', () => {
  const list = $('#adminVendedoresList');
  if (!list) return;
  if (list.querySelector('.proy-card-edit')) return;
  const emptyMsg = list.querySelector('.proy-empty');
  if (emptyMsg) emptyMsg.remove();
  const card = el('div', 'proy-card');
  list.prepend(card);
  vendRenderEdit(card, {}, true);
});

const adminVendedoresModal = $('#adminVendedoresModal');
function abrirAdminVendedoresModal() {
  if (!adminVendedoresModal) return;
  if ($('#adminVendBuscarInput')) $('#adminVendBuscarInput').value = '';
  adminVendedoresModal.hidden = false;
  cargarAdminVendData();
}
function cerrarAdminVendedoresModal() { if (adminVendedoresModal) adminVendedoresModal.hidden = true; }
$('#navAdminVendedoresBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  abrirAdminVendedoresModal();
});
$('#adminVendedoresClose')?.addEventListener('click', cerrarAdminVendedoresModal);
$('#adminVendedoresScrim')?.addEventListener('click', cerrarAdminVendedoresModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && adminVendedoresModal && !adminVendedoresModal.hidden) cerrarAdminVendedoresModal(); });

/* "Comisiones Ventas" dentro del menú Administración: resumen de
   comisiones por vendedor, a partir de una fecha inicial, y por tipo
   (Propiedades, Proyectos, Servicios o Todas). "Proyectos" y "Servicios"
   ya se presentan en Administración como dos listados distintos de la
   MISMA tabla solicitudes_servicio, así que aquí comparten el mismo
   origen de datos (para no duplicar comisiones al elegir "Todas"), y
   solo cambia el título con el que se agrupa el resultado. */
function poblarAdminComVendedorSel() {
  const sel = $('#adminComVendedorSel');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '';
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = T[lang].admTodosLosVendedores;
  sel.appendChild(optTodos);
  vendedoresCatalogo.forEach((v) => {
    const nombre = (v.nombre || '').trim();
    if (!nombre) return;
    const opt = document.createElement('option');
    opt.value = nombre; opt.textContent = nombre;
    sel.appendChild(opt);
  });
  if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

function adminComPrecioBase(op, valorVenta, valorRenta) {
  if (op === 'venta') return extractNumber(valorVenta);
  if (op === 'renta') return extractNumber(valorRenta);
  const v = extractNumber(valorVenta);
  return v != null ? v : extractNumber(valorRenta);
}

function adminComValorCalc(pct, precio) {
  const p = extractNumber(pct);
  if (p == null || precio == null) return null;
  return (p / 100) * precio;
}

/* Estados de pago de una comisión, con colores propios (igual criterio que
   SOL_ESTADOS). "pendiente" es el que queda por defecto. Las etiquetas (campo
   "l") se traducen en vivo leyendo T[lang] según el idioma activo, igual que
   UBIC_ESTADOS/SOL_ESTADOS. */
const COM_ESTADOS_BASE = [
  { v: 'pendiente', bg: '#e6eef5', fg: '#2b4a66' },
  { v: 'pagado', bg: '#dcefe0', fg: '#1f7a43' },
  { v: 'suspendido', bg: '#fbe9c8', fg: '#8b641d' },
  { v: 'anulado', bg: '#fbdede', fg: '#b42318' }
];
function getComEstados() {
  const t = T[lang] || T.es;
  const labels = { pendiente: t.comEstPendiente, pagado: t.comEstPagado, suspendido: t.comEstSuspendido, anulado: t.comEstAnulado };
  return COM_ESTADOS_BASE.map((e) => ({ ...e, l: labels[e.v] || e.v }));
}
Object.defineProperty(window, 'COM_ESTADOS', { get: getComEstados });
const comEstadoInfo = (v) => getComEstados().find((e) => e.v === v) || getComEstados()[0];
function adminComEstadoBadge(valor) {
  const info = comEstadoInfo(valor);
  const span = el('span', 'sol-badge', info.l);
  span.style.background = info.bg;
  span.style.color = info.fg;
  return span;
}

/* Lleva el registro de las filas de comisión actualmente dibujadas, para
   poder recalcular el subtotal de su grupo, el total general y el total
   "a pagar" cada vez que el super administrador cambia un % de comisión,
   un estado, o marca/desmarca el check "Pagar comisión", sin tener que
   volver a consultar Supabase. */
let comFilasActivas = [];

function adminComRecalcularTotales() {
  const porGrupo = {};
  let totalGenerado = 0;
  let totalAPagar = 0;
  comFilasActivas.forEach((f) => {
    const valor = f.getValor() || 0;
    porGrupo[f.grupo] = (porGrupo[f.grupo] || 0) + valor;
    totalGenerado += valor;
    if (f.isChecked() && f.getEstado() !== 'pagado') totalAPagar += valor;
  });
  comFilasActivas.forEach((f) => {
    if (f.subtotalEl) f.subtotalEl.textContent = formatQ(porGrupo[f.grupo] || 0);
  });
  const totalEl = $('#adminComTotalValor');
  if (totalEl) totalEl.textContent = formatQ(totalGenerado);
  const totalPagarEl = $('#adminComTotalPagarValor');
  if (totalPagarEl) totalPagarEl.textContent = formatQ(totalAPagar);
  const pagarBtn = $('#adminComPagarBtn');
  if (pagarBtn) pagarBtn.disabled = totalAPagar <= 0;
}

/* Construye una fila <tr> de la tabla de comisiones a partir de un
   descriptor d con: detalleNode, detalleTexto, fechaTxt, fechaIso,
   vendedorTxt, pctInicial, precioBase, estadoInicial, pagarInicial,
   origen, referencia, guardarPct/guardarEstado/guardarPagar/
   guardarPagoCompleto (funciones que persisten cada campo en Supabase;
   solo se usan y se muestran como editables cuando es super
   administrador). */
function adminComBuildFila(d) {
  const tr = document.createElement('tr');
  const tdDetalle = el('td'); tdDetalle.appendChild(d.detalleNode);
  const tdFecha = el('td', '', d.fechaTxt);
  const tdVendedor = el('td', '', d.vendedorTxt || '—');
  const tdPct = el('td', 'num');
  const tdValor = el('td', 'num com-valor');
  const tdEstado = el('td');
  const tdPagar = el('td', 'com-pagar-cell');

  let pctActual = d.pctInicial;
  let estadoActual = d.estadoInicial || 'pendiente';

  function pintarValor() {
    tdValor.textContent = formatQ(adminComValorCalc(pctActual, d.precioBase));
  }

  // % Comisión
  if (esSuperAdmin() && typeof d.guardarPct === 'function') {
    const input = document.createElement('input');
    input.type = 'number'; input.min = '0'; input.max = '100'; input.step = '0.1';
    input.className = 'com-pct-input';
    input.value = d.pctInicial != null && d.pctInicial !== '' ? d.pctInicial : '';
    input.addEventListener('input', () => { pctActual = input.value; pintarValor(); adminComRecalcularTotales(); });
    input.addEventListener('change', async () => {
      input.disabled = true;
      try {
        const { error } = await d.guardarPct(input.value || null);
        if (error) throw error;
      } catch (e) {
        console.error('Error guardando el % de comisión:', e);
        alert(T[lang].comErrorGuardarPct);
      } finally {
        input.disabled = false;
      }
    });
    tdPct.append(input, document.createTextNode(' %'));
  } else {
    tdPct.textContent = d.pctInicial ? (d.pctInicial + '%') : '—';
  }

  // Estado (lista con colores propios; editable solo para super admin)
  function repintarEstado() {
    tdEstado.innerHTML = '';
    if (esSuperAdmin() && typeof d.guardarEstado === 'function') {
      const sel = document.createElement('select');
      sel.className = 'com-estado-sel';
      COM_ESTADOS.forEach((e) => {
        const opt = document.createElement('option');
        opt.value = e.v; opt.textContent = e.l;
        if (e.v === estadoActual) opt.selected = true;
        sel.appendChild(opt);
      });
      const colorear = () => {
        const info = comEstadoInfo(sel.value);
        sel.style.background = info.bg; sel.style.color = info.fg;
      };
      colorear();
      sel.addEventListener('change', async () => {
        const anterior = estadoActual;
        sel.disabled = true;
        try {
          const { error } = await d.guardarEstado(sel.value);
          if (error) throw error;
          estadoActual = sel.value;
          colorear();
          adminComRecalcularTotales();
        } catch (e) {
          console.error('Error guardando el estado de la comisión:', e);
          alert(T[lang].adminErrorGuardarCambio);
          sel.value = anterior;
          colorear();
        } finally {
          sel.disabled = false;
        }
      });
      tdEstado.appendChild(sel);
    } else {
      tdEstado.appendChild(adminComEstadoBadge(estadoActual));
    }
  }
  repintarEstado();

  // Pagar comisión (check): marca la fila para incluirla en el total "a
  // pagar" y, al presionar el botón Pagar, en el historial de pagadas.
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'com-pagar-check';
  checkbox.checked = !!d.pagarInicial;
  checkbox.disabled = !esSuperAdmin();
  checkbox.addEventListener('change', async () => {
    adminComRecalcularTotales();
    if (esSuperAdmin() && typeof d.guardarPagar === 'function') {
      try {
        const { error } = await d.guardarPagar(checkbox.checked);
        if (error) throw error;
      } catch (e) {
        console.error('Error guardando "Pagar comisión":', e);
      }
    }
  });
  tdPagar.appendChild(checkbox);

  pintarValor();

  tr.append(tdDetalle, tdFecha, tdVendedor, tdPct, tdValor, tdEstado, tdPagar);

  return {
    tr,
    getValor: () => adminComValorCalc(pctActual, d.precioBase),
    getPct: () => pctActual,
    getEstado: () => estadoActual,
    isChecked: () => checkbox.checked,
    marcarPagada: () => { estadoActual = 'pagado'; repintarEstado(); checkbox.disabled = true; },
    origen: d.origen,
    referencia: d.referencia,
    detalleTexto: d.detalleTexto,
    fechaIso: d.fechaIso,
    vendedorTxt: d.vendedorTxt,
    guardarPagoCompleto: d.guardarPagoCompleto
  };
}

function adminComBuildGrupo(titulo, filasDescriptor) {
  const wrap = el('div', 'com-group');
  const h = el('h3', 'com-group-title');
  h.append(document.createTextNode(titulo), el('span', 'com-count', '(' + filasDescriptor.length + ')'));
  const table = document.createElement('table');
  table.className = 'com-table';
  const thead = document.createElement('thead');
  const t = T[lang];
  thead.innerHTML = '<tr><th>' + t.comThDetalle + '</th><th>' + t.comThFecha + '</th><th>' + t.comThVendedor + '</th><th class="num">' + t.comThPctComision + '</th><th class="num">' + t.comThValorComision + '</th><th>' + t.comThEstado + '</th><th>' + t.comThPagarComision + '</th></tr>';
  const tbody = document.createElement('tbody');
  const tfoot = document.createElement('tfoot');
  const subtotalTd = el('td', 'num', '');
  const subtotalRow = el('tr', 'com-subtotal');
  const labelTd = el('td', '', t.comSubtotalPrefix + titulo);
  labelTd.colSpan = 4;
  const colaTd = el('td', '', '');
  colaTd.colSpan = 2;
  subtotalRow.append(labelTd, subtotalTd, colaTd);
  tfoot.appendChild(subtotalRow);
  table.append(thead, tbody, tfoot);
  wrap.append(h, table);

  const grupoKey = titulo;
  filasDescriptor.forEach((d) => {
    const fila = adminComBuildFila(d);
    tbody.appendChild(fila.tr);
    comFilasActivas.push({ ...fila, grupo: grupoKey, subtotalEl: subtotalTd });
  });
  subtotalTd.textContent = formatQ(filasDescriptor.reduce((a, d) => a + (adminComValorCalc(d.pctInicial, d.precioBase) || 0), 0));

  return wrap;
}

/* Botón "Pagar": toma únicamente las filas marcadas con el check "Pagar
   comisión" (y que aún no estén en estado "Pagado"), las registra en el
   historial comisiones_pagadas —incluyendo tanto sus propios datos como
   los parámetros de búsqueda (vendedor, fecha inicial, fecha final, tipo)
   usados en ese momento— y actualiza su estado a "Pagado" en la tabla de
   origen (Propiedades o Proyectos/Servicios). */
async function adminComProcesarPago(filtros) {
  const status = $('#adminComPagarStatus');
  const seleccionadas = comFilasActivas.filter((f) => f.isChecked() && f.getEstado() !== 'pagado');
  if (!seleccionadas.length) {
    if (status) status.textContent = T[lang].comNoHayMarcadas;
    return;
  }
  const totalPagar = seleccionadas.reduce((a, f) => a + (f.getValor() || 0), 0);
  if (!confirm(T[lang].comConfirmGenerar.replace('{n}', seleccionadas.length).replace('{v}', formatQ(totalPagar)))) return;

  const btn = $('#adminComPagarBtn');
  if (btn) btn.disabled = true;
  if (status) status.textContent = T[lang].comGenerando;
  const usuario = localStorage.getItem(LOGIN_STORE) || null;
  const ahora = new Date().toISOString();
  try {
    const filas = seleccionadas.map((f) => ({
      origen: f.origen,
      referencia: f.referencia,
      detalle: f.detalleTexto,
      fecha_comision: f.fechaIso || null,
      vendedor: f.vendedorTxt || null,
      porcentaje_comision: f.getPct() || null,
      valor_comision: f.getValor(),
      // Queda "Pendiente de pago": generar la comisión ya no significa que
      // se pagó -- el pago bancario se gestiona después en la pantalla
      // "Comisiones Generadas".
      estado: 'pendiente',
      vendedor_filtro: filtros.vendedorVal || null,
      fecha_desde_filtro: filtros.fechaDesdeVal || null,
      fecha_hasta_filtro: filtros.fechaHastaVal || null,
      tipo_filtro: filtros.tipoVal || null,
      fecha_pago: ahora,
      usuario_pago: usuario
    }));
    const { error: insertError } = await supabaseClient.from('comisiones_pagadas').insert(filas);
    if (insertError) throw insertError;

    for (const f of seleccionadas) {
      if (typeof f.guardarPagoCompleto === 'function') {
        const { error } = await f.guardarPagoCompleto();
        if (error) console.error('Error actualizando el estado de la comisión pagada:', error);
      }
      f.marcarPagada();
    }
    adminComRecalcularTotales();
    if (status) status.textContent = T[lang].comGeneradasOk.replace('{n}', seleccionadas.length);
  } catch (e) {
    console.error('Error generando comisiones:', e);
    if (status) status.textContent = T[lang].comErrorGenerar;
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function mostrarAdminComisiones() {
  const result = $('#adminComisionesResult');
  if (!result) return;
  const vendedorVal = $('#adminComVendedorSel')?.value || '';
  const fechaDesdeVal = $('#adminComFechaDesde')?.value || '';
  const fechaHastaVal = $('#adminComFechaHasta')?.value || '';
  const tipoVal = $('#adminComTipoSel')?.value || '';
  result.innerHTML = '<p class="qbr-empty">' + T[lang].cargando + '</p>';
  comFilasActivas = [];
  try {
    const grupos = [];

    if (tipoVal === '' || tipoVal === 'propiedades') {
      let q = supabaseClient
        .from('propiedades')
        .select('ciudad, local_id, nombre, tipo_operacion, valor_renta, valor_venta, vendedor_asignado, comision_porcentaje, creado_en, comision_pagar, comision_estado')
        .eq('activo', true)
        // Esta pantalla es para GENERAR comisiones: solo se listan las que
        // aún están Pendientes de pago (las ya generadas/pagadas,
        // suspendidas o anuladas no vuelven a aparecer aquí).
        .or('comision_estado.eq.pendiente,comision_estado.is.null');
      if (vendedorVal) q = q.eq('vendedor_asignado', vendedorVal);
      if (fechaDesdeVal) q = q.gte('creado_en', fechaDesdeVal + 'T00:00:00');
      if (fechaHastaVal) q = q.lte('creado_en', fechaHastaVal + 'T23:59:59');
      const { data: propRows, error: propErr } = await q;
      if (propErr) throw propErr;
      const filasDescriptor = (propRows || []).map((r) => {
        const detalleTexto = (r.ciudad || '') + (r.nombre ? ' · ' + r.nombre : '');
        return {
          detalleNode: el('span', '', detalleTexto),
          detalleTexto,
          fechaTxt: r.creado_en ? formatQBuscarRegFecha(r.creado_en) : '—',
          fechaIso: r.creado_en || null,
          vendedorTxt: r.vendedor_asignado,
          pctInicial: r.comision_porcentaje,
          precioBase: adminComPrecioBase(r.tipo_operacion, r.valor_venta, r.valor_renta),
          estadoInicial: r.comision_estado || 'pendiente',
          pagarInicial: !!r.comision_pagar,
          origen: 'propiedades',
          referencia: r.ciudad + '|' + r.local_id,
          guardarPct: (nuevoPct) => supabaseClient.from('propiedades').update({ comision_porcentaje: nuevoPct }).eq('ciudad', r.ciudad).eq('local_id', r.local_id),
          guardarEstado: (nuevoEstado) => supabaseClient.from('propiedades').update({ comision_estado: nuevoEstado }).eq('ciudad', r.ciudad).eq('local_id', r.local_id),
          guardarPagar: (nuevoPagar) => supabaseClient.from('propiedades').update({ comision_pagar: nuevoPagar }).eq('ciudad', r.ciudad).eq('local_id', r.local_id),
          guardarPagoCompleto: () => supabaseClient.from('propiedades').update({ comision_pagar: true, comision_estado: 'pagado' }).eq('ciudad', r.ciudad).eq('local_id', r.local_id)
        };
      });
      grupos.push({ titulo: T[lang].comGrupoPropiedades, filasDescriptor });
    }

    if (tipoVal === '' || tipoVal === 'proyectos' || tipoVal === 'servicios') {
      let q = supabaseClient
        .from('solicitudes_servicio')
        .select('id, numero_solicitud, servicio, created_at, vendedor_asignado, comision_porcentaje, cotizacion_id, comision_pagar, comision_estado')
        // Igual que en Propiedades: solo las Pendientes de pago.
        .or('comision_estado.eq.pendiente,comision_estado.is.null');
      if (vendedorVal) q = q.eq('vendedor_asignado', vendedorVal);
      if (fechaDesdeVal) q = q.gte('created_at', fechaDesdeVal + 'T00:00:00');
      if (fechaHastaVal) q = q.lte('created_at', fechaHastaVal + 'T23:59:59');
      const { data: srvRows, error: srvErr } = await q;
      if (srvErr) throw srvErr;
      const filas = srvRows || [];
      const idsCot = [...new Set(filas.map((r) => r.cotizacion_id).filter((v) => v != null))];
      let presupuestos = {};
      if (idsCot.length) {
        const { data: cots } = await supabaseClient.from('cotizaciones').select('id, presupuesto_asignado').in('id', idsCot);
        if (cots) cots.forEach((c) => { presupuestos[c.id] = c.presupuesto_asignado; });
      }
      const titulo = tipoVal === 'proyectos' ? T[lang].comGrupoProyectos : tipoVal === 'servicios' ? T[lang].comGrupoServicios : T[lang].comGrupoProyectosServicios;
      const filasDescriptor = filas.map((r) => {
        const detalleTexto = (r.numero_solicitud || ('#' + r.id)) + ' · ' + (r.servicio || '—');
        return {
          detalleNode: el('span', '', detalleTexto),
          detalleTexto,
          fechaTxt: formatQBuscarRegFecha(r.created_at),
          fechaIso: r.created_at || null,
          vendedorTxt: r.vendedor_asignado,
          pctInicial: r.comision_porcentaje,
          precioBase: extractNumber(presupuestos[r.cotizacion_id]),
          estadoInicial: r.comision_estado || 'pendiente',
          pagarInicial: !!r.comision_pagar,
          origen: 'proyectos_servicios',
          referencia: String(r.id),
          guardarPct: (nuevoPct) => supabaseClient.from('solicitudes_servicio').update({ comision_porcentaje: nuevoPct }).eq('id', r.id),
          guardarEstado: (nuevoEstado) => supabaseClient.from('solicitudes_servicio').update({ comision_estado: nuevoEstado }).eq('id', r.id),
          guardarPagar: (nuevoPagar) => supabaseClient.from('solicitudes_servicio').update({ comision_pagar: nuevoPagar }).eq('id', r.id),
          guardarPagoCompleto: () => supabaseClient.from('solicitudes_servicio').update({ comision_pagar: true, comision_estado: 'pagado' }).eq('id', r.id)
        };
      });
      grupos.push({ titulo, filasDescriptor });
    }

    result.innerHTML = '';
    let totalFilas = 0;
    grupos.forEach((g) => {
      totalFilas += g.filasDescriptor.length;
      if (!g.filasDescriptor.length) return;
      result.appendChild(adminComBuildGrupo(g.titulo, g.filasDescriptor));
    });
    if (!totalFilas) {
      result.innerHTML = '<p class="qbr-empty">' + T[lang].comNoHayComisionesBusqueda + '</p>';
      return;
    }

    const totalBar = el('div', 'com-total-bar');
    totalBar.append(
      el('span', 'com-total-label', T[lang].comTotalGenerado),
      (() => { const v = el('strong', 'com-total-value'); v.id = 'adminComTotalValor'; return v; })()
    );
    result.appendChild(totalBar);

    const pagarBar = el('div', 'com-total-bar com-pagar-bar');
    pagarBar.append(
      el('span', 'com-total-label', T[lang].comTotalAPagar),
      (() => { const v = el('strong', 'com-total-value'); v.id = 'adminComTotalPagarValor'; return v; })()
    );
    result.appendChild(pagarBar);

    const pagarWrap = el('div', 'com-pagar-btn-wrap');
    const pagarBtn = document.createElement('button');
    pagarBtn.type = 'button'; pagarBtn.id = 'adminComPagarBtn'; pagarBtn.className = 'btn btn-gold btn-sm';
    pagarBtn.textContent = T[lang].comBtnGenerar;
    pagarBtn.addEventListener('click', () => adminComProcesarPago({ vendedorVal, fechaDesdeVal, fechaHastaVal, tipoVal }));
    const pagarStatus = el('p', 'hint', ''); pagarStatus.id = 'adminComPagarStatus';
    pagarWrap.append(pagarBtn, pagarStatus);
    result.appendChild(pagarWrap);

    adminComRecalcularTotales();
  } catch (e) {
    console.error('Error cargando las comisiones de ventas:', e);
    result.innerHTML = '<p class="qbr-empty">' + T[lang].comErrorCargarComisiones + '</p>';
  }
}

$('#adminComMostrarBtn')?.addEventListener('click', () => mostrarAdminComisiones());

const adminComisionesModal = $('#adminComisionesModal');
function abrirAdminComisionesModal() {
  if (!adminComisionesModal) return;
  if (!vendedoresCatalogoCargado) { vendedoresCatalogoCargado = true; cargarVendedoresCatalogo(); }
  adminComisionesModal.hidden = false;
  poblarAdminComVendedorSel();
  if ($('#adminComVendedorSel')) $('#adminComVendedorSel').value = '';
  if ($('#adminComFechaDesde')) $('#adminComFechaDesde').value = '';
  if ($('#adminComFechaHasta')) $('#adminComFechaHasta').value = '';
  if ($('#adminComTipoSel')) $('#adminComTipoSel').value = '';
  const result = $('#adminComisionesResult');
  if (result) result.innerHTML = '<p class="qbr-empty">Elige los parámetros y presiona Mostrar.</p>';
}
function cerrarAdminComisionesModal() { if (adminComisionesModal) adminComisionesModal.hidden = true; }
$('#navAdminComisionesBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  abrirAdminComisionesModal();
});
$('#adminComisionesClose')?.addEventListener('click', cerrarAdminComisionesModal);
$('#adminComisionesScrim')?.addEventListener('click', cerrarAdminComisionesModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && adminComisionesModal && !adminComisionesModal.hidden) cerrarAdminComisionesModal(); });

/* ===== Comisiones Generadas =====
   Listado de las comisiones ya generadas (tabla comisiones_pagadas),
   filtrable por vendedor y por fecha (inicial/final) de generación, con
   el estado de pago y los datos de la operación bancaria con la que se
   liquidó cada una. El % y el valor de la comisión quedan fijos (son el
   histórico de lo generado); lo editable aquí -solo para super
   administrador- es el estado y los datos del pago bancario. */
function poblarAdminComGenVendedorSel() {
  const sel = $('#adminComGenVendedorSel');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '';
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = T[lang].admTodosLosVendedores;
  sel.appendChild(optTodos);
  vendedoresCatalogo.forEach((v) => {
    const nombre = (v.nombre || '').trim();
    if (!nombre) return;
    const opt = document.createElement('option');
    opt.value = nombre; opt.textContent = nombre;
    sel.appendChild(opt);
  });
  if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

function adminComGenGuardarCampo(id, campo, valor) {
  return supabaseClient.from('comisiones_pagadas').update({ [campo]: valor }).eq('id', id);
}

function adminComGenCampoFecha(td, id, campo, valorIso) {
  if (esSuperAdmin()) {
    const input = document.createElement('input');
    input.type = 'date';
    input.className = 'com-date-input';
    input.value = valorIso ? String(valorIso).substring(0, 10) : '';
    input.addEventListener('change', async () => {
      input.disabled = true;
      try {
        const { error } = await adminComGenGuardarCampo(id, campo, input.value || null);
        if (error) throw error;
      } catch (e) {
        console.error('Error guardando ' + campo + ':', e);
        alert(T[lang].adminErrorGuardarCambio);
      } finally {
        input.disabled = false;
      }
    });
    td.appendChild(input);
  } else {
    td.textContent = valorIso ? formatQBuscarRegFecha(valorIso) : '—';
  }
}

function adminComGenCampoTexto(td, id, campo, valorTxt) {
  if (esSuperAdmin()) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'com-text-input';
    input.value = valorTxt || '';
    input.addEventListener('change', async () => {
      input.disabled = true;
      try {
        const { error } = await adminComGenGuardarCampo(id, campo, input.value || null);
        if (error) throw error;
      } catch (e) {
        console.error('Error guardando ' + campo + ':', e);
        alert(T[lang].adminErrorGuardarCambio);
      } finally {
        input.disabled = false;
      }
    });
    td.appendChild(input);
  } else {
    td.textContent = valorTxt || '—';
  }
}

/* Campo "Forma de pago" de una comisión individual: select editable (solo
   super admin) que al cambiar guarda de inmediato y además muestra u
   oculta los campos relacionados (Banco, Cuenta bancaria, Número de
   cheque) según corresponda — mismo criterio que el resumen de pago por
   vendedor. */
function adminComGenCampoFormaPago(td, r, camposRelacionados) {
  if (esSuperAdmin()) {
    const sel = document.createElement('select');
    sel.className = 'com-text-input';
    FORMAS_PAGO.forEach((f) => {
      const opt = document.createElement('option');
      opt.value = f.v; opt.textContent = f.l;
      if (f.v === (r.forma_pago || 'transferencia')) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', async () => {
      const anterior = r.forma_pago;
      camposRelacionados(sel.value);
      sel.disabled = true;
      try {
        const { error } = await adminComGenGuardarCampo(r.id, 'forma_pago', sel.value);
        if (error) throw error;
        r.forma_pago = sel.value;
      } catch (e) {
        console.error('Error guardando forma_pago:', e);
        alert(T[lang].adminErrorGuardarCambio);
        sel.value = anterior || 'transferencia';
        camposRelacionados(sel.value);
      } finally {
        sel.disabled = false;
      }
    });
    td.appendChild(sel);
    camposRelacionados(sel.value);
  } else {
    const info = FORMAS_PAGO.find((f) => f.v === r.forma_pago) || FORMAS_PAGO[0];
    td.textContent = info.l;
  }
}

/* Tarjeta de una comisión generada (mismo lenguaje visual que Vendedores /
   Tipos de comisión: .proy-card + .proy-grid), para que la información se
   lea completa sin necesitar scroll horizontal en ningún ancho de
   pantalla. */
function adminComGenBuildFila(r) {
  const card = el('div', 'proy-card');
  const head = el('div', 'proy-card-h');
  const nameWrap = el('div', 'proy-name-wrap');
  nameWrap.append(el('div', 'proy-name', r.detalle || T[lang].comThDetalle));
  head.append(nameWrap);
  const estadoWrap = el('div');
  head.append(estadoWrap);
  card.append(head);

  if (esSuperAdmin()) {
    const sel = document.createElement('select');
    sel.className = 'com-estado-sel';
    COM_ESTADOS.forEach((e) => {
      const opt = document.createElement('option');
      opt.value = e.v; opt.textContent = e.l;
      if (e.v === (r.estado || 'pendiente')) opt.selected = true;
      sel.appendChild(opt);
    });
    const colorear = () => { const info = comEstadoInfo(sel.value); sel.style.background = info.bg; sel.style.color = info.fg; };
    colorear();
    sel.addEventListener('change', async () => {
      const anterior = r.estado;
      sel.disabled = true;
      try {
        const { error } = await adminComGenGuardarCampo(r.id, 'estado', sel.value);
        if (error) throw error;
        r.estado = sel.value;
        colorear();
      } catch (e) {
        console.error('Error guardando el estado:', e);
        alert(T[lang].adminErrorGuardarCambio);
        sel.value = anterior;
        colorear();
      } finally {
        sel.disabled = false;
      }
    });
    estadoWrap.appendChild(sel);
  } else {
    estadoWrap.appendChild(adminComEstadoBadge(r.estado || 'pendiente'));
  }

  const campoFechaWrap = (campo, valorIso) => { const w = el('div'); adminComGenCampoFecha(w, r.id, campo, valorIso); return w; };
  const campoTextoWrap = (campo, valorTxt) => { const w = el('div'); adminComGenCampoTexto(w, r.id, campo, valorTxt); return w; };

  const grid = el('div', 'proy-grid');
  const formaPagoWrap = el('div');
  const bancoWrap = el('div'); adminComGenCampoTexto(bancoWrap, r.id, 'banco', r.banco);
  const cuentaWrap = el('div'); adminComGenCampoTexto(cuentaWrap, r.id, 'cuenta_bancaria', r.cuenta_bancaria);
  const chequeWrap = el('div'); adminComGenCampoTexto(chequeWrap, r.id, 'numero_cheque', r.numero_cheque);
  const bancoCell = labeledCell(T[lang].comLblBanco, bancoWrap);
  const cuentaCell = labeledCell(T[lang].comLblCuentaBancaria, cuentaWrap);
  const chequeCell = labeledCell(T[lang].comLblNumeroCheque, chequeWrap);

  grid.append(
    labeledCell(T[lang].comThVendedor, el('span', '', r.vendedor || '—')),
    labeledCell(T[lang].comLblFechaGenerada, el('span', '', r.fecha_comision ? formatQBuscarRegFecha(r.fecha_comision) : '—')),
    labeledCell(T[lang].admPctComision, el('span', '', r.porcentaje_comision != null && r.porcentaje_comision !== '' ? (r.porcentaje_comision + '%') : '—')),
    labeledCell(T[lang].admValorComision, el('strong', 'com-valor', formatQ(r.valor_comision))),
    labeledCell(T[lang].comLblFormaPago, formaPagoWrap),
    labeledCell(T[lang].comLblFechaPago, campoFechaWrap('fecha_pago', r.fecha_pago)),
    bancoCell,
    cuentaCell,
    chequeCell,
    labeledCell(T[lang].comLblFechaOperacion, campoFechaWrap('fecha_operacion', r.fecha_operacion)),
    labeledCell(T[lang].comLblUsuarioPaga, campoTextoWrap('usuario_banco', r.usuario_banco))
  );
  card.append(grid);

  adminComGenCampoFormaPago(formaPagoWrap, r, (forma) => {
    bancoCell.hidden = forma === 'efectivo';
    cuentaCell.hidden = forma !== 'transferencia';
    chequeCell.hidden = forma !== 'cheque';
  });

  return card;
}

function fechaHoyIso() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/* Al final del listado: un resumen con el total pendiente de pago de cada
   vendedor, con su banco y cuenta bancaria tomados automáticamente de su
   ficha en Vendedores (editables aquí por si hay que usar otros datos para
   este pago en particular). Al presionar "Pagar" se actualizan de una vez
   todas las comisiones pendientes de ese vendedor dentro del resultado
   actual: quedan en estado Pagado con la fecha, banco, cuenta y usuario
   indicados. Solo lo ve y lo usa el super administrador. */
function construirResumenPagoPorVendedor(data) {
  if (!esSuperAdmin()) return null;
  const pendientes = data.filter((r) => (r.estado || 'pendiente') === 'pendiente');
  if (!pendientes.length) return null;

  const porVendedor = {};
  pendientes.forEach((r) => {
    const key = r.vendedor || T[lang].comSinVendedor;
    if (!porVendedor[key]) porVendedor[key] = { total: 0, ids: [] };
    porVendedor[key].total += (r.valor_comision || 0);
    porVendedor[key].ids.push(r.id);
  });

  const wrap = el('div', 'com-group com-pay-summary');
  wrap.append(el('h3', 'com-group-title', T[lang].comResumenPagoPorVendedor));
  const list = el('div', 'proy-list');

  Object.keys(porVendedor).sort().forEach((vendedorNombre) => {
    const { total, ids } = porVendedor[vendedorNombre];
    const catalogo = vendedoresCatalogo.find((v) => (v.nombre || '').trim() === vendedorNombre) || {};

    const card = el('div', 'proy-card com-pay-card');
    const head = el('div', 'proy-card-h');
    head.append(el('div', 'proy-name', vendedorNombre));
    card.append(head);

    const grid = el('div', 'proy-grid');
    grid.append(labeledCell(T[lang].comLblTotalPendiente, el('strong', 'com-valor', formatQ(total))));

    // Forma de pago: según la que se elija, se muestran solo los campos que
    // correspondan (Transferencia → Banco + Cuenta bancaria; Cheque →
    // Banco + Número de cheque; Efectivo → ninguno).
    const formaPagoSel = document.createElement('select');
    FORMAS_PAGO.forEach((f) => {
      const opt = document.createElement('option');
      opt.value = f.v; opt.textContent = f.l;
      formaPagoSel.appendChild(opt);
    });
    formaPagoSel.value = 'transferencia';
    grid.append(labeledCell(T[lang].comLblFormaPago, formaPagoSel));

    const hoyIso = fechaHoyIso();
    const fechaPagoInput = document.createElement('input'); fechaPagoInput.type = 'date'; fechaPagoInput.value = hoyIso;
    grid.append(labeledCell(T[lang].comLblFechaPago, fechaPagoInput));

    const fechaOpInput = document.createElement('input'); fechaOpInput.type = 'date'; fechaOpInput.value = hoyIso;
    grid.append(labeledCell(T[lang].comLblFechaOperacion, fechaOpInput));

    // Usuario que procesa el pago: se toma solo de la sesión actual, no se
    // escribe a mano (igual criterio que "Usuario" en Vendedores).
    const usuarioActual = localStorage.getItem(LOGIN_STORE) || T[lang].admUsuarioActualFallback;
    grid.append(labeledCell(T[lang].comLblUsuarioPaga, el('span', '', usuarioActual)));

    card.append(grid);

    // Campos según la forma de pago. El banco se autocompleta del catálogo
    // de Vendedores, pero queda editable por si este pago en particular usa
    // otro banco.
    const camposPago = el('div', 'proy-grid com-pay-campos');
    const bancoSel = document.createElement('select');
    const optVacio = document.createElement('option'); optVacio.value = ''; optVacio.textContent = T[lang].adminSelecciona;
    bancoSel.appendChild(optVacio);
    BANCOS_GT.forEach((b) => { const o = document.createElement('option'); o.value = b; o.textContent = b; bancoSel.appendChild(o); });
    bancoSel.value = catalogo.banco_pago || '';
    const bancoCell = labeledCell(T[lang].comLblBanco, bancoSel);

    const cuentaInput = document.createElement('input');
    cuentaInput.type = 'text'; cuentaInput.value = catalogo.numero_cuenta_bancaria || ''; cuentaInput.placeholder = T[lang].comPlaceholderNumeroCuenta;
    const cuentaCell = labeledCell(T[lang].comLblCuentaBancaria, cuentaInput);

    const chequeInput = document.createElement('input');
    chequeInput.type = 'text'; chequeInput.placeholder = T[lang].comPlaceholderNumeroCheque;
    const chequeCell = labeledCell(T[lang].comLblNumeroCheque, chequeInput);

    camposPago.append(bancoCell, cuentaCell, chequeCell);
    card.append(camposPago);

    function actualizarCamposPago() {
      const forma = formaPagoSel.value;
      bancoCell.hidden = forma === 'efectivo';
      cuentaCell.hidden = forma !== 'transferencia';
      chequeCell.hidden = forma !== 'cheque';
    }
    formaPagoSel.addEventListener('change', actualizarCamposPago);
    actualizarCamposPago();

    const actions = el('div', 'proy-actions');
    const status = el('p', 'hint', ''); status.style.margin = '0'; status.style.marginRight = 'auto';
    const pagarBtn = el('button', 'btn btn-gold btn-sm', T[lang].comBtnPagar); pagarBtn.type = 'button';
    actions.append(status, pagarBtn);
    card.append(actions);

    pagarBtn.addEventListener('click', async () => {
      const confirmMsg = T[lang].comConfirmPagar.replace('{n}', ids.length).replace('{v}', vendedorNombre).replace('{t}', formatQ(total));
      if (!confirm(confirmMsg)) return;
      pagarBtn.disabled = true;
      status.textContent = T[lang].comProcesando;
      try {
        const usuario = localStorage.getItem(LOGIN_STORE) || null;
        const forma = formaPagoSel.value;
        const { error } = await supabaseClient.from('comisiones_pagadas').update({
          estado: 'pagado',
          forma_pago: forma,
          fecha_pago: fechaPagoInput.value || hoyIso,
          banco: forma === 'efectivo' ? null : (bancoSel.value || null),
          cuenta_bancaria: forma === 'transferencia' ? (cuentaInput.value.trim() || null) : null,
          numero_cheque: forma === 'cheque' ? (chequeInput.value.trim() || null) : null,
          fecha_operacion: fechaOpInput.value || hoyIso,
          usuario_banco: usuario
        }).in('id', ids);
        if (error) throw error;
        status.textContent = T[lang].comPagoRegistrado;
        mostrarComisionesGeneradas();
      } catch (e) {
        console.error('Error registrando el pago por vendedor:', e);
        status.textContent = T[lang].comErrorPagoVendedor;
        pagarBtn.disabled = false;
      }
    });

    list.appendChild(card);
  });

  wrap.appendChild(list);
  return wrap;
}

async function mostrarComisionesGeneradas() {
  const result = $('#adminComisionesGeneradasResult');
  if (!result) return;
  const vendedorVal = $('#adminComGenVendedorSel')?.value || '';
  const fechaDesdeVal = $('#adminComGenFechaDesde')?.value || '';
  const fechaHastaVal = $('#adminComGenFechaHasta')?.value || '';
  result.innerHTML = '<p class="qbr-empty">' + T[lang].cargando + '</p>';
  try {
    let q = supabaseClient.from('comisiones_pagadas').select('*').order('vendedor', { ascending: true }).order('fecha_pago', { ascending: false });
    if (vendedorVal) q = q.eq('vendedor', vendedorVal);
    if (fechaDesdeVal) q = q.gte('fecha_pago', fechaDesdeVal + 'T00:00:00');
    if (fechaHastaVal) q = q.lte('fecha_pago', fechaHastaVal + 'T23:59:59');
    const { data, error } = await q;
    if (error) throw error;
    result.innerHTML = '';
    if (!data || !data.length) {
      result.innerHTML = '<p class="qbr-empty">' + T[lang].comNoHayGeneradasBusqueda + '</p>';
      return;
    }

    // Agrupadas por vendedor, para una lectura ordenada (igual criterio que
    // Comisiones Ventas).
    const porVendedor = {};
    data.forEach((r) => {
      const key = r.vendedor || T[lang].comSinVendedor;
      if (!porVendedor[key]) porVendedor[key] = [];
      porVendedor[key].push(r);
    });
    Object.keys(porVendedor).sort().forEach((vendedorNombre) => {
      const filas = porVendedor[vendedorNombre];
      const wrap = el('div', 'com-group');
      const h = el('h3', 'com-group-title');
      h.append(document.createTextNode(vendedorNombre), el('span', 'com-count', '(' + filas.length + ')'));
      wrap.append(h);
      const list = el('div', 'proy-list');
      filas.forEach((r) => list.appendChild(adminComGenBuildFila(r)));
      wrap.append(list);
      result.appendChild(wrap);
    });

    const resumen = construirResumenPagoPorVendedor(data);
    if (resumen) result.appendChild(resumen);
  } catch (e) {
    console.error('Error cargando comisiones generadas:', e);
    result.innerHTML = '<p class="qbr-empty">' + T[lang].comErrorCargarGeneradas + '</p>';
  }
}

$('#adminComGenMostrarBtn')?.addEventListener('click', () => mostrarComisionesGeneradas());

const adminComisionesGeneradasModal = $('#adminComisionesGeneradasModal');
function abrirAdminComisionesGeneradasModal() {
  if (!adminComisionesGeneradasModal) return;
  if (!vendedoresCatalogoCargado) { vendedoresCatalogoCargado = true; cargarVendedoresCatalogo(); }
  adminComisionesGeneradasModal.hidden = false;
  poblarAdminComGenVendedorSel();
  if ($('#adminComGenVendedorSel')) $('#adminComGenVendedorSel').value = '';
  // Por defecto: del primero al último día del mes actual.
  const hoy = new Date();
  const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  const aIso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  if ($('#adminComGenFechaDesde')) $('#adminComGenFechaDesde').value = aIso(primerDia);
  if ($('#adminComGenFechaHasta')) $('#adminComGenFechaHasta').value = aIso(ultimoDia);
  mostrarComisionesGeneradas();
}
function cerrarAdminComisionesGeneradasModal() { if (adminComisionesGeneradasModal) adminComisionesGeneradasModal.hidden = true; }
$('#navAdminComisionesGeneradasBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  abrirAdminComisionesGeneradasModal();
});
$('#adminComisionesGeneradasClose')?.addEventListener('click', cerrarAdminComisionesGeneradasModal);
$('#adminComisionesGeneradasScrim')?.addEventListener('click', cerrarAdminComisionesGeneradasModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && adminComisionesGeneradasModal && !adminComisionesGeneradasModal.hidden) cerrarAdminComisionesGeneradasModal(); });

/* ===== Comisiones Pagadas =====
   Historial de comisiones (misma tabla comisiones_pagadas), filtrable por
   vendedor, por fecha (inicial/final) y por estado -incluyendo "Todas"
   para cada filtro-. Reutiliza la misma tarjeta (adminComGenBuildFila) que
   Comisiones Generadas. */
function poblarAdminComPagVendedorSel() {
  const sel = $('#adminComPagVendedorSel');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '';
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = T[lang].admTodosLosVendedores;
  sel.appendChild(optTodos);
  vendedoresCatalogo.forEach((v) => {
    const nombre = (v.nombre || '').trim();
    if (!nombre) return;
    const opt = document.createElement('option');
    opt.value = nombre; opt.textContent = nombre;
    sel.appendChild(opt);
  });
  if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

function poblarAdminComPagEstadoSel() {
  const sel = $('#adminComPagEstadoSel');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '';
  const optTodas = document.createElement('option');
  optTodas.value = ''; optTodas.textContent = T[lang].admTodosLosEstados;
  sel.appendChild(optTodas);
  COM_ESTADOS.forEach((e) => {
    const opt = document.createElement('option');
    opt.value = e.v; opt.textContent = e.l;
    sel.appendChild(opt);
  });
  if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

async function mostrarComisionesPagadas() {
  const result = $('#adminComisionesPagadasResult');
  if (!result) return;
  const vendedorVal = $('#adminComPagVendedorSel')?.value || '';
  const fechaDesdeVal = $('#adminComPagFechaDesde')?.value || '';
  const fechaHastaVal = $('#adminComPagFechaHasta')?.value || '';
  const estadoVal = $('#adminComPagEstadoSel')?.value || '';
  result.innerHTML = '<p class="qbr-empty">' + T[lang].cargando + '</p>';
  try {
    let q = supabaseClient.from('comisiones_pagadas').select('*').order('vendedor', { ascending: true }).order('fecha_pago', { ascending: false });
    if (vendedorVal) q = q.eq('vendedor', vendedorVal);
    if (fechaDesdeVal) q = q.gte('fecha_pago', fechaDesdeVal + 'T00:00:00');
    if (fechaHastaVal) q = q.lte('fecha_pago', fechaHastaVal + 'T23:59:59');
    if (estadoVal) q = q.eq('estado', estadoVal);
    const { data, error } = await q;
    if (error) throw error;
    result.innerHTML = '';
    if (!data || !data.length) {
      result.innerHTML = '<p class="qbr-empty">' + T[lang].comNoHayPagadasBusqueda + '</p>';
      return;
    }

    const porVendedor = {};
    data.forEach((r) => {
      const key = r.vendedor || T[lang].comSinVendedor;
      if (!porVendedor[key]) porVendedor[key] = [];
      porVendedor[key].push(r);
    });
    Object.keys(porVendedor).sort().forEach((vendedorNombre) => {
      const filas = porVendedor[vendedorNombre];
      const wrap = el('div', 'com-group');
      const h = el('h3', 'com-group-title');
      h.append(document.createTextNode(vendedorNombre), el('span', 'com-count', '(' + filas.length + ')'));
      wrap.append(h);
      const list = el('div', 'proy-list');
      filas.forEach((r) => list.appendChild(adminComGenBuildFila(r)));
      wrap.append(list);
      result.appendChild(wrap);
    });
  } catch (e) {
    console.error('Error cargando comisiones pagadas:', e);
    result.innerHTML = '<p class="qbr-empty">' + T[lang].comErrorCargarPagadas + '</p>';
  }
}

$('#adminComPagMostrarBtn')?.addEventListener('click', () => mostrarComisionesPagadas());

const adminComisionesPagadasModal = $('#adminComisionesPagadasModal');
function abrirAdminComisionesPagadasModal() {
  if (!adminComisionesPagadasModal) return;
  if (!vendedoresCatalogoCargado) { vendedoresCatalogoCargado = true; cargarVendedoresCatalogo(); }
  adminComisionesPagadasModal.hidden = false;
  poblarAdminComPagVendedorSel();
  poblarAdminComPagEstadoSel();
  if ($('#adminComPagVendedorSel')) $('#adminComPagVendedorSel').value = '';
  if ($('#adminComPagEstadoSel')) $('#adminComPagEstadoSel').value = '';
  if ($('#adminComPagFechaDesde')) $('#adminComPagFechaDesde').value = '';
  if ($('#adminComPagFechaHasta')) $('#adminComPagFechaHasta').value = '';
  mostrarComisionesPagadas();
}
function cerrarAdminComisionesPagadasModal() { if (adminComisionesPagadasModal) adminComisionesPagadasModal.hidden = true; }
$('#navAdminComisionesPagadasBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  abrirAdminComisionesPagadasModal();
});
$('#adminComisionesPagadasClose')?.addEventListener('click', cerrarAdminComisionesPagadasModal);
$('#adminComisionesPagadasScrim')?.addEventListener('click', cerrarAdminComisionesPagadasModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && adminComisionesPagadasModal && !adminComisionesPagadasModal.hidden) cerrarAdminComisionesPagadasModal(); });

/* ===== Reportes: Listado de Propiedades =====
   Inventario completo de "propiedades", filtrable por ciudad, tipo de
   operación y estado de la ubicación. Mismo lenguaje visual que el resto
   de Administración (.proy-card/.proy-grid), para que la información se
   lea completa sin scroll horizontal. */
const REP_PROP_OPERACION_BASE = [{ v: 'renta' }, { v: 'venta' }, { v: 'ambos' }];
function getRepPropOperacion() {
  const t = T[lang] || T.es;
  const labels = { renta: t.repOpRenta, venta: t.repOpVenta, ambos: t.repOpAmbos };
  return REP_PROP_OPERACION_BASE.map((e) => ({ ...e, l: labels[e.v] || e.v }));
}
Object.defineProperty(window, 'REP_PROP_OPERACION', { get: getRepPropOperacion });

const REP_PROP_ESTADOS_BASE = [
  { v: 'activa', bg: '#dcefe0', fg: '#1f7a43' },
  { v: 'arrendada', bg: '#dde8fb', fg: '#1d4ed8' },
  { v: 'vendida', bg: '#c9eed2', fg: '#0f5132' },
  { v: 'suspendida', bg: '#fbe9c8', fg: '#8b641d' },
  { v: 'baja', bg: '#fbdede', fg: '#b42318' }
];
function getRepPropEstados() {
  const labels = (T[lang] || T.es).ubicEstLabels || {};
  return REP_PROP_ESTADOS_BASE.map((e) => ({ ...e, l: labels[e.v] || e.v }));
}
Object.defineProperty(window, 'REP_PROP_ESTADOS', { get: getRepPropEstados });
const repPropEstadoInfo = (v) => getRepPropEstados().find((e) => e.v === v) || getRepPropEstados()[0];
function repPropEstadoBadge(v) {
  const info = repPropEstadoInfo(v);
  const b = el('span', '', info.l);
  b.style.cssText = 'display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background:' + info.bg + ';color:' + info.fg;
  return b;
}

function poblarRepPropFiltros(ciudades) {
  const ciudadSel = $('#repPropCiudadSel');
  if (ciudadSel) {
    const prev = ciudadSel.value;
    ciudadSel.innerHTML = '';
    const optTodas = document.createElement('option'); optTodas.value = ''; optTodas.textContent = T[lang].repTodasLasCiudades;
    ciudadSel.appendChild(optTodas);
    ciudades.forEach((c) => { const o = document.createElement('option'); o.value = c; o.textContent = c; ciudadSel.appendChild(o); });
    if (prev && [...ciudadSel.options].some((o) => o.value === prev)) ciudadSel.value = prev;
  }
  const opSel = $('#repPropOperacionSel');
  if (opSel && !opSel.options.length) {
    const optTodas = document.createElement('option'); optTodas.value = ''; optTodas.textContent = T[lang].repTodasLasOperaciones;
    opSel.appendChild(optTodas);
    REP_PROP_OPERACION.forEach((o) => { const opt = document.createElement('option'); opt.value = o.v; opt.textContent = o.l; opSel.appendChild(opt); });
  }
  const estSel = $('#repPropEstadoSel');
  if (estSel && !estSel.options.length) {
    const optTodas = document.createElement('option'); optTodas.value = ''; optTodas.textContent = T[lang].repTodosLosEstados;
    estSel.appendChild(optTodas);
    REP_PROP_ESTADOS.forEach((e) => { const opt = document.createElement('option'); opt.value = e.v; opt.textContent = e.l; estSel.appendChild(opt); });
  }
}

function repPropBuildFila(r, correlativo) {
  const row = el('div', 'rep-row');

  const operacionInfo = REP_PROP_OPERACION.find((o) => o.v === r.tipo_operacion);
  const valor = r.tipo_operacion === 'venta' ? r.valor_venta : (r.tipo_operacion === 'renta' ? r.valor_renta : [r.valor_venta, r.valor_renta].filter(Boolean).join(' / '));

  const cantFotos = Array.isArray(r.fotos) ? r.fotos.length : 0;

  row.append(
    el('span', 'rep-row-no', String(correlativo)),
    el('span', 'rep-row-nombre', r.nombre || '—'),
    el('span', 'rep-row-vendedor', r.vendedor_nombre || r.vendedor_asignado || '—'),
    el('span', 'rep-row-operacion', operacionInfo ? operacionInfo.l : '—'),
    el('strong', 'rep-row-valor', valor || '—'),
    repPropEstadoBadge(r.estado_ubicacion || 'activa'),
    el('span', 'rep-row-fecha', r.creado_en ? formatQBuscarRegFecha(r.creado_en) : '—'),
    el('span', 'rep-row-fotos', String(cantFotos))
  );
  return row;
}

async function mostrarRepPropiedades() {
  const result = $('#repPropiedadesResult');
  if (!result) return;
  const ciudadVal = $('#repPropCiudadSel')?.value || '';
  const operacionVal = $('#repPropOperacionSel')?.value || '';
  const estadoVal = $('#repPropEstadoSel')?.value || '';
  result.innerHTML = '<p class="qbr-empty">' + T[lang].cargando + '</p>';
  try {
    let q = supabaseClient.from('propiedades').select('*').eq('activo', true).order('creado_en', { ascending: true });
    if (ciudadVal) q = q.eq('ciudad', ciudadVal);
    if (operacionVal) q = q.eq('tipo_operacion', operacionVal);
    if (estadoVal) q = q.eq('estado_ubicacion', estadoVal);
    const { data: rows, error } = await q;
    if (error) throw error;
    result.innerHTML = '';
    if (!rows || !rows.length) {
      result.innerHTML = '<p class="qbr-empty">' + T[lang].repNoHayPropiedadesBusqueda + '</p>';
      return;
    }
    const wrap = el('div', 'rep-list');
    const head = el('div', 'rep-row rep-row-head');
    const t = T[lang];
    head.append(
      el('span', '', t.repThNo),
      el('span', '', t.repThNombreUbicacion),
      el('span', '', t.repThVendedor),
      el('span', '', t.repThTipoOperacion),
      el('span', '', t.repThValor),
      el('span', '', t.repThEstado),
      el('span', '', t.repThFechaCreacion),
      el('span', '', t.repThFotos)
    );
    wrap.append(head);
    rows.forEach((r, idx) => wrap.appendChild(repPropBuildFila(r, idx + 1)));
    result.appendChild(wrap);
  } catch (e) {
    console.error('Error cargando reporte de propiedades:', e);
    result.innerHTML = '<p class="qbr-empty">' + T[lang].repErrorCargarPropiedades + '</p>';
  }
}

/* Imprime el contenido actualmente mostrado de un reporte (el div de
   resultados ya renderizado) en una ventana aparte, con un encabezado
   propio: logo a la izquierda, fecha/hora exacta y usuario conectado a
   la derecha -ni los filtros ni el resto del sitio se imprimen-. */
function imprimirReporte(tituloReporte, resultSelector) {
  const result = $(resultSelector);
  if (!result || !result.innerHTML.trim()) { alert(T[lang].repNoDataImprimir); return; }
  const usuario = localStorage.getItem(LOGIN_STORE) || '—';
  const ahora = new Date();
  const fechaTxt = ahora.toLocaleDateString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const horaTxt = ahora.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const win = window.open('', '_blank');
  if (!win) { alert(T[lang].repVentanaBloqueada); return; }
  const logoUrl = new URL('assets/logo.webp', document.baseURI).href;
  win.document.write(
    '<!doctype html><html lang="' + lang + '"><head><meta charset="utf-8">' +
    '<title>' + tituloReporte + '</title>' +
    '<style>' +
    "body{font-family:'Figtree',system-ui,sans-serif;color:#10243c;margin:24px}" +
    '.rep-print-head{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #c9962d;padding-bottom:12px;margin-bottom:18px}' +
    '.rep-print-head img{height:56px}' +
    '.rep-print-meta{text-align:right;font-size:13px;color:#56667a;line-height:1.5}' +
    'h1{font-size:19px;margin:0 0 18px}' +
    '.com-group-title{font-size:15px;margin:18px 0 8px;border-bottom:1px solid #d5dbe4;padding-bottom:4px}' +
    '.com-count{color:#56667a;font-weight:400;margin-left:6px}' +
    '.proy-list{display:flex;flex-direction:column;gap:10px}' +
    '.proy-card{border:1px solid #d5dbe4;border-radius:10px;padding:12px 14px;break-inside:avoid}' +
    '.proy-card-h{display:flex;justify-content:space-between;gap:10px;margin-bottom:8px}' +
    '.proy-name{font-weight:700;font-size:14px}' +
    '.proy-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}' +
    '.lbl{display:block;font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;color:#56667a;margin-bottom:2px}' +
    '.com-valor{color:#8b641d}' +
    '.rep-list{display:flex;flex-direction:column;border:1px solid #d5dbe4;border-radius:8px;overflow:hidden}' +
    '.rep-row{display:grid;grid-template-columns:40px 2fr 1.2fr .9fr .85fr .85fr .9fr 50px;gap:8px;align-items:center;padding:7px 10px;border-bottom:1px solid #e3e8ef;font-size:11.5px}' +
    '.rep-row:last-child{border-bottom:none}' +
    '.rep-row-head{background:#f4f6f9;font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:#56667a;font-weight:700;break-inside:avoid}' +
    '.rep-row-no{color:#8b641d;font-weight:700}' +
    '.rep-row-valor{color:#8b641d}' +
    '.rep-row-fotos{text-align:center;font-weight:700}' +
    '.rep-row-serv{grid-template-columns:26px 1.15fr .8fr .9fr .6fr .8fr .85fr .75fr .8fr .9fr;font-size:9.5px}' +
    '.rep-row-serv>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '@media print{ @page{margin:14mm} .rep-row{break-inside:avoid} }' +
    '</style></head><body>' +
    '<div class="rep-print-head">' +
    '<img src="' + logoUrl + '" alt="ARMOPA">' +
    '<div class="rep-print-meta"><div>' + fechaTxt + ' · ' + horaTxt + '</div><div>' + T[lang].repUsuarioLbl + usuario + '</div></div>' +
    '</div>' +
    '<h1>' + tituloReporte + '</h1>' +
    result.innerHTML +
    '</body></html>'
  );
  win.document.close();
  win.focus();
  win.addEventListener('load', () => { win.print(); });
}

$('#repPropMostrarBtn')?.addEventListener('click', () => mostrarRepPropiedades());
$('#repPropImprimirBtn')?.addEventListener('click', () => imprimirReporte(T[lang].repTituloReportePropiedades, '#repPropiedadesResult'));

const repPropiedadesModal = $('#repPropiedadesModal');
async function abrirRepPropiedadesModal() {
  if (!repPropiedadesModal) return;
  repPropiedadesModal.hidden = false;
  try {
    const { data: rows, error } = await supabaseClient.from('propiedades').select('ciudad').eq('activo', true);
    if (error) throw error;
    const ciudades = [...new Set((rows || []).map((r) => r.ciudad).filter(Boolean))].sort();
    poblarRepPropFiltros(ciudades);
  } catch (e) {
    console.error('Error cargando ciudades para el reporte:', e);
    poblarRepPropFiltros([]);
  }
  if ($('#repPropCiudadSel')) $('#repPropCiudadSel').value = '';
  if ($('#repPropOperacionSel')) $('#repPropOperacionSel').value = '';
  if ($('#repPropEstadoSel')) $('#repPropEstadoSel').value = '';
  mostrarRepPropiedades();
}
function cerrarRepPropiedadesModal() { if (repPropiedadesModal) repPropiedadesModal.hidden = true; }
$('#navAdminRepPropiedadesBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  abrirRepPropiedadesModal();
});
$('#repPropiedadesClose')?.addEventListener('click', cerrarRepPropiedadesModal);
$('#repPropiedadesScrim')?.addEventListener('click', cerrarRepPropiedadesModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && repPropiedadesModal && !repPropiedadesModal.hidden) cerrarRepPropiedadesModal(); });

/* ===== Reportes: Estado de Servicios =====
   Listado de "solicitudes_servicio", filtrable por estado, prioridad y
   rango de fechas de creación. Reutiliza SOL_ESTADOS/solEstadoInfo ya
   definidos para Solicitudes de servicio. */
const REP_SERV_PRIORIDAD_BASE = [{ v: 'alta' }, { v: 'media' }, { v: 'baja' }];
function getRepServPrioridad() {
  const t = T[lang] || T.es;
  const labels = { alta: t.repPrioAlta, media: t.repPrioMedia, baja: t.repPrioBaja };
  return REP_SERV_PRIORIDAD_BASE.map((e) => ({ ...e, l: labels[e.v] || e.v }));
}
Object.defineProperty(window, 'REP_SERV_PRIORIDAD', { get: getRepServPrioridad });

function poblarRepServFiltros() {
  const estSel = $('#repServEstadoSel');
  if (estSel && !estSel.options.length) {
    const optTodas = document.createElement('option'); optTodas.value = ''; optTodas.textContent = T[lang].repTodosLosEstados;
    estSel.appendChild(optTodas);
    SOL_ESTADOS.forEach((e) => { const opt = document.createElement('option'); opt.value = e.v; opt.textContent = e.l; estSel.appendChild(opt); });
  }
  const prioSel = $('#repServPrioridadSel');
  if (prioSel && !prioSel.options.length) {
    const optTodas = document.createElement('option'); optTodas.value = ''; optTodas.textContent = T[lang].repTodasLasPrioridades;
    prioSel.appendChild(optTodas);
    REP_SERV_PRIORIDAD.forEach((p) => { const opt = document.createElement('option'); opt.value = p.v; opt.textContent = p.l; prioSel.appendChild(opt); });
  }
}

function repServEstadoBadge(estadoVal) {
  const info = solEstadoInfo(estadoVal);
  const b = el('span', '', info.l);
  b.style.cssText = 'display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background:' + info.bg + ';color:' + info.fg;
  return b;
}

function repServBuildFila(r, correlativo, valor) {
  const row = el('div', 'rep-row rep-row-serv');
  const prioInfo = REP_SERV_PRIORIDAD.find((p) => p.v === r.prioridad);
  const valorTxt = (valor !== null && valor !== undefined && valor !== '') ? formatQBuscarRegPresupuesto(valor) : '—';

  row.append(
    el('span', 'rep-row-no', String(correlativo)),
    el('span', '', r.nombre_cliente || '—'),
    el('span', '', r.telefono_cliente || '—'),
    el('span', '', r.numero_solicitud || '—'),
    el('span', '', prioInfo ? prioInfo.l : '—'),
    repServEstadoBadge(r.estado),
    el('strong', 'rep-row-valor', valorTxt),
    el('span', '', r.fecha_inicio ? formatQBuscarRegFecha(r.fecha_inicio) : '—'),
    el('span', '', r.fecha_creacion ? formatQBuscarRegFecha(r.fecha_creacion) : '—'),
    el('span', '', r.vendedor_asignado || '—')
  );
  return row;
}

async function mostrarRepServicios() {
  const result = $('#repServiciosResult');
  if (!result) return;
  const estadoVal = $('#repServEstadoSel')?.value || '';
  const prioridadVal = $('#repServPrioridadSel')?.value || '';
  const fechaDesdeVal = $('#repServFechaDesde')?.value || '';
  const fechaHastaVal = $('#repServFechaHasta')?.value || '';
  result.innerHTML = '<p class="qbr-empty">' + T[lang].cargando + '</p>';
  try {
    let q = supabaseClient.from('solicitudes_servicio').select('*').order('fecha_creacion', { ascending: true });
    if (estadoVal) q = q.eq('estado', estadoVal);
    if (prioridadVal) q = q.eq('prioridad', prioridadVal);
    if (fechaDesdeVal) q = q.gte('fecha_creacion', fechaDesdeVal + 'T00:00:00');
    if (fechaHastaVal) q = q.lte('fecha_creacion', fechaHastaVal + 'T23:59:59');
    const { data: rows, error } = await q;
    if (error) throw error;
    result.innerHTML = '';
    if (!rows || !rows.length) {
      result.innerHTML = '<p class="qbr-empty">' + T[lang].repNoHaySolicitudesServicioBusqueda + '</p>';
      return;
    }
    const cotizacionIds = [...new Set(rows.map((r) => r.cotizacion_id).filter((v) => v !== null && v !== undefined))];
    const valorPorCotizacion = {};
    if (cotizacionIds.length) {
      const { data: cotRows, error: cotError } = await supabaseClient.from('cotizaciones').select('id,presupuesto_asignado').in('id', cotizacionIds);
      if (cotError) {
        console.error('Error cargando el valor (presupuesto_asignado) de las cotizaciones:', cotError);
      }
      (cotRows || []).forEach((c) => { valorPorCotizacion[c.id] = c.presupuesto_asignado; });
    }
    const porServicio = {};
    rows.forEach((r) => {
      const key = r.servicio || T[lang].repSinTipoServicio;
      if (!porServicio[key]) porServicio[key] = [];
      porServicio[key].push(r);
    });
    const t = T[lang];
    Object.keys(porServicio).sort().forEach((servicioNombre) => {
      const filas = porServicio[servicioNombre];
      const groupWrap = el('div', 'com-group');
      const h = el('h3', 'com-group-title');
      h.append(document.createTextNode(servicioNombre), el('span', 'com-count', '(' + filas.length + ')'));
      groupWrap.append(h);

      const list = el('div', 'rep-list');
      const head = el('div', 'rep-row rep-row-serv rep-row-head');
      head.append(
        el('span', '', t.repThNo),
        el('span', '', t.repThCliente),
        el('span', '', t.repThTelefono),
        el('span', '', t.repThNumSolicitud),
        el('span', '', t.repThPrioridad),
        el('span', '', t.repThEstado),
        el('span', '', t.repThValor2),
        el('span', '', t.repThInicio),
        el('span', '', t.repThFechaSolicitud),
        el('span', '', t.repThVendedor)
      );
      list.append(head);
      filas.forEach((r, idx) => list.appendChild(repServBuildFila(r, idx + 1, valorPorCotizacion[r.cotizacion_id])));
      groupWrap.append(list);
      result.appendChild(groupWrap);
    });
  } catch (e) {
    console.error('Error cargando reporte de servicios:', e);
    result.innerHTML = '<p class="qbr-empty">' + T[lang].repErrorCargarServicios + '</p>';
  }
}

$('#repServMostrarBtn')?.addEventListener('click', () => mostrarRepServicios());
$('#repServImprimirBtn')?.addEventListener('click', () => imprimirReporte(T[lang].repTituloReporteServicios, '#repServiciosResult'));

const repServiciosModal = $('#repServiciosModal');
function abrirRepServiciosModal() {
  if (!repServiciosModal) return;
  repServiciosModal.hidden = false;
  poblarRepServFiltros();
  if ($('#repServEstadoSel')) $('#repServEstadoSel').value = '';
  if ($('#repServPrioridadSel')) $('#repServPrioridadSel').value = '';
  if ($('#repServFechaDesde')) $('#repServFechaDesde').value = '';
  if ($('#repServFechaHasta')) $('#repServFechaHasta').value = '';
  mostrarRepServicios();
}
function cerrarRepServiciosModal() { if (repServiciosModal) repServiciosModal.hidden = true; }
$('#navAdminRepServiciosBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  abrirRepServiciosModal();
});
$('#repServiciosClose')?.addEventListener('click', cerrarRepServiciosModal);
$('#repServiciosScrim')?.addEventListener('click', cerrarRepServiciosModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && repServiciosModal && !repServiciosModal.hidden) cerrarRepServiciosModal(); });

/* ===== Reportes: Seguimiento Clientes =====
   Clientes (tabla "usuarios", tipo_usuario = 'usuario_general') con su
   actividad: cantidad de solicitudes de servicio y de cotizaciones
   generadas, y la fecha de la más reciente. Filtrable por nombre o
   usuario. */
/* Tarjeta de seguimiento de un cliente: cabecera (foto, nombre, código,
   estado), la próxima cita agendada destacada arriba (o el aviso de que
   no tiene), un resumen de cuántas citas tiene en total/realizadas, y un
   historial completo de citas que se despliega bajo demanda para no
   saturar la vista por defecto. */
function repCliBuildFila(c) {
  const t = T[lang];
  const card = el('div', 'proy-card cli-card');

  const head = el('div', 'cli-head');
  const avImg = document.createElement('img');
  avImg.className = 'avatar'; avImg.alt = c.nombre || '';
  const avPh = el('div', 'avatar ph');
  avPh.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"></circle><path d="M5 20c.6-3.6 3.5-5.6 7-5.6s6.4 2 7 5.6"></path></svg>';
  avImg.hidden = !c.foto_url; avPh.hidden = !!c.foto_url;
  if (c.foto_url) avImg.src = c.foto_url;
  head.append(avImg, avPh);
  const info = el('div', 'cli-head-info');
  info.append(el('div', 'cli-head-name', c.nombre || T[lang].repCliNombreFallback));
  info.append(el('div', 'cli-head-code', c.codigo || '—'));
  const estadoCls = { activo: 'cli-badge-activo', inactivo: 'cli-badge-inactivo', baja: 'cli-badge-baja', inquilino: 'cli-badge-inquilino', propietario: 'cli-badge-propietario' }[c.estado] || 'cli-badge-activo';
  info.append(el('span', 'cli-head-badge ' + estadoCls, estadoClienteLabel(c.estado || 'activo')));
  head.append(info);
  card.append(head);

  const citas = (c.citas || []).slice().sort((a, b) => (a.fecha_cita || '').localeCompare(b.fecha_cita || '') || (a.hora_cita || '').localeCompare(b.hora_cita || ''));
  const hoyIso = ageFechaIso(new Date());
  const proxima = citas.find((ci) => (ci.fecha_cita || '') >= hoyIso);
  const ultima = citas.length ? citas[citas.length - 1] : null;

  const secProx = el('div', 'cli-sec rep-cli-proxima');
  secProx.append(el('div', 'cli-sec-h', t.repCliProximaCita));
  if (proxima) {
    const chip = el('div', ageEtiquetaChipClase(proxima.etiqueta) + ' rep-cli-chip-grande');
    chip.textContent = (proxima.fecha_cita_texto || proxima.fecha_cita || '') + (proxima.hora_cita ? ' · ' + proxima.hora_cita : '');
    secProx.append(chip);
    const sub = [proxima.ubicacion, proxima.vendedor_asignado].filter(Boolean).join(' · ');
    if (sub) secProx.append(el('p', 'hint', sub));
  } else {
    secProx.append(el('p', 'hint', t.repCliSinProximaCita));
  }
  card.append(secProx);

  const gridResumen = el('div', 'cli-grid');
  gridResumen.append(
    labeledCell(t.repCliTotalCitas, el('strong', 'com-valor', String(citas.length))),
    labeledCell(t.repCliUltimaCita, el('span', '', ultima ? (ultima.fecha_cita_texto || ultima.fecha_cita) : '—')),
    labeledCell(t.repThRegistrado, el('span', '', c.created_at ? formatQBuscarRegFecha(c.created_at) : '—'))
  );
  const secResumen = el('div', 'cli-sec');
  secResumen.append(gridResumen);
  card.append(secResumen);

  if (citas.length) {
    const toggleBtn = el('button', 'btn btn-line-dark btn-sm', t.repCliVerHistorial); toggleBtn.type = 'button';
    const histWrap = el('div', 'age-dia-list rep-cli-historial'); histWrap.hidden = true;
    citas.slice().reverse().forEach((ci) => {
      const item = el('div', 'age-dia-item rep-cli-hist-item');
      item.append(el('span', 'age-dia-hora', ci.hora_cita || '—'));
      const itInfo = el('div', 'age-dia-info');
      itInfo.append(el('div', 'age-dia-nombre', ci.fecha_cita_texto || ci.fecha_cita || '—'));
      const subPartes = [citEtqLabel(ci.etiqueta), citEstLabel(ci.estado), ci.ubicacion].filter(Boolean);
      itInfo.append(el('div', 'age-dia-sub', subPartes.join(' · ')));
      item.append(itInfo);
      histWrap.appendChild(item);
    });
    toggleBtn.addEventListener('click', () => {
      histWrap.hidden = !histWrap.hidden;
      toggleBtn.textContent = histWrap.hidden ? t.repCliVerHistorial : t.repCliOcultarHistorial;
    });
    const secHist = el('div', 'cli-sec');
    secHist.append(el('div', 'cli-sec-h', t.repCliHistorialCitas), toggleBtn, histWrap);
    card.append(secHist);
  } else {
    const secHist = el('div', 'cli-sec');
    secHist.append(el('p', 'hint', t.repCliSinCitasTexto));
    card.append(secHist);
  }

  return card;
}

async function mostrarRepClientes() {
  const result = $('#repClientesResult');
  if (!result) return;
  const buscarVal = ($('#repCliBuscar')?.value || '').trim().toLowerCase();
  const estadoCitaVal = $('#repCliEstadoCitaSel')?.value || '';
  result.innerHTML = '<p class="qbr-empty">' + T[lang].cargando + '</p>';
  try {
    const { data: clientesRows, error: errCli } = await supabaseClient
      .from('clientes').select('*').order('nombre', { ascending: true });
    if (errCli) throw errCli;

    const { data: citasRows, error: errCit } = await supabaseClient
      .from('citas_propiedades').select('*');
    if (errCit) throw errCit;

    const hoyIso = ageFechaIso(new Date());
    let filas = (clientesRows || []).map((c) => {
      const citasCliente = (citasRows || []).filter((ci) => (ci.nombre_cliente || '').trim().toLowerCase() === (c.nombre || '').trim().toLowerCase());
      return { ...c, citas: citasCliente };
    });

    if (buscarVal) {
      filas = filas.filter((f) => (f.nombre || '').toLowerCase().includes(buscarVal) || (f.codigo || '').toLowerCase().includes(buscarVal));
    }
    if (estadoCitaVal === 'con_citas') filas = filas.filter((f) => f.citas.length > 0);
    else if (estadoCitaVal === 'sin_citas') filas = filas.filter((f) => f.citas.length === 0);
    else if (estadoCitaVal === 'proxima_cita') filas = filas.filter((f) => f.citas.some((ci) => (ci.fecha_cita || '') >= hoyIso));

    result.innerHTML = '';
    if (!filas.length) {
      result.innerHTML = '<p class="qbr-empty">' + T[lang].repNoHayClientesBusqueda + '</p>';
      return;
    }
    const list = el('div', 'proy-list');
    filas.forEach((f) => list.appendChild(repCliBuildFila(f)));
    result.appendChild(list);
  } catch (e) {
    console.error('Error cargando seguimiento de clientes:', e);
    result.innerHTML = '<p class="qbr-empty">' + T[lang].repErrorCargarClientes + '</p>';
  }
}

$('#repCliMostrarBtn')?.addEventListener('click', () => mostrarRepClientes());
$('#repCliEstadoCitaSel')?.addEventListener('change', () => mostrarRepClientes());

const repClientesModal = $('#repClientesModal');
function abrirRepClientesModal() {
  if (!repClientesModal) return;
  repClientesModal.hidden = false;
  if ($('#repCliBuscar')) $('#repCliBuscar').value = '';
  mostrarRepClientes();
}
function cerrarRepClientesModal() { if (repClientesModal) repClientesModal.hidden = true; }
$('#navAdminRepClientesBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  abrirRepClientesModal();
});
$('#repClientesClose')?.addEventListener('click', cerrarRepClientesModal);
$('#repClientesScrim')?.addEventListener('click', cerrarRepClientesModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && repClientesModal && !repClientesModal.hidden) cerrarRepClientesModal(); });

/* Catálogo de vendedores (tabla "vendedores") para que el campo "Nombre
   del vendedor" de cada ubicación (sección "Vendedor" del formulario de
   edición de propiedad) sea una lista real de los vendedores ya
   registrados en Administración > Vendedores, en vez de texto libre, y
   para autocompletar su WhatsApp y foto al elegir uno. Se carga de forma
   perezosa, la primera vez que se abre una ubicación en modo edición. */
let vendedoresCatalogo = [];
let vendedoresCatalogoCargado = false;
async function cargarVendedoresCatalogo() {
  try {
    const { data: rows, error } = await supabaseClient.from('vendedores').select('id, nombre, telefono, foto_url, banco_pago, numero_cuenta_bancaria').order('nombre', { ascending: true });
    if (error) throw error;
    vendedoresCatalogo = rows || [];
  } catch (e) {
    console.error('Error cargando el catálogo de vendedores:', e);
    vendedoresCatalogo = [];
  }
  vendedoresCatalogoCargado = true;
  if (typeof render === 'function' && pModal && !pModal.hidden) render();
  if (typeof poblarQPromotorSelect === 'function') poblarQPromotorSelect();
  if (adminProyectosModal && !adminProyectosModal.hidden) {
    poblarAdminPropVendedorSel();
    pintarAdminProyectosList(
      $('#adminPropCiudadSel')?.value || '',
      $('#adminPropUbicacionSel')?.value || '',
      $('#adminPropEstadoSel')?.value || '',
      $('#adminPropVendedorSel')?.value || ''
    );
  }
  if (typeof adminSolicitudesModal !== 'undefined' && adminSolicitudesModal && !adminSolicitudesModal.hidden) {
    poblarAdminSolVendedorSel();
    pintarAdminSolicitudesList(
      $('#adminSolProyectoSel')?.value || '',
      $('#adminSolEstadoSel')?.value || '',
      $('#adminSolVendedorSel')?.value || ''
    );
  }
  if (typeof actualizarVisibilidadPromotoresServicio === 'function') actualizarVisibilidadPromotoresServicio();
  if (typeof adminServiciosModal !== 'undefined' && adminServiciosModal && !adminServiciosModal.hidden) {
    poblarAdminSrvPromotorSel();
    cargarAdminSrvLista();
  }
  if (typeof adminComisionesModal !== 'undefined' && adminComisionesModal && !adminComisionesModal.hidden) {
    poblarAdminComVendedorSel();
  }
  if (typeof adminComisionesGeneradasModal !== 'undefined' && adminComisionesGeneradasModal && !adminComisionesGeneradasModal.hidden) {
    poblarAdminComGenVendedorSel();
  }
}

/* Catálogo de clientes (tabla "clientes") para que el campo "Cliente" de
   cada ubicación (sección "Gestión interna" del formulario de edición de
   propiedad) sea una lista real de los clientes ya registrados en
   Administración > Clientes, en vez de texto libre. Se carga de forma
   perezosa, la primera vez que se abre una ubicación en modo edición. */
let clientesCatalogo = [];
let clientesCatalogoCargado = false;
async function cargarClientesCatalogo() {
  try {
    const { data: rows, error } = await supabaseClient.from('clientes').select('id, nombre').order('nombre', { ascending: true });
    if (error) throw error;
    clientesCatalogo = rows || [];
  } catch (e) {
    console.error('Error cargando el catálogo de clientes:', e);
    clientesCatalogo = [];
  }
  clientesCatalogoCargado = true;
  if (typeof render === 'function' && pModal && !pModal.hidden) render();
}

/* Arma la lista desplegable "Cliente" (select) a partir del catálogo de
   Clientes, con "Sin cliente asignado" como primera opción y por
   defecto. Si el nombre actual no está en el catálogo (texto libre
   previo, o un cliente ya eliminado), se agrega como una opción aparte
   para no perderlo. */
function poblarPClienteSelect(nombreActual) {
  const sel = $('#p-cliente-asignado');
  if (!sel) return;
  const t = T[lang];
  sel.innerHTML = '';
  const optVacio = document.createElement('option');
  optVacio.value = ''; optVacio.textContent = t.admSinClienteAsignado;
  sel.appendChild(optVacio);
  clientesCatalogo.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.nombre; opt.textContent = c.nombre;
    sel.appendChild(opt);
  });
  if (nombreActual && !clientesCatalogo.some((c) => (c.nombre || '').trim() === nombreActual.trim())) {
    const opt = document.createElement('option');
    opt.value = nombreActual; opt.textContent = nombreActual;
    sel.appendChild(opt);
  }
  sel.value = nombreActual || '';
}

/* Arma la lista desplegable de "Nombre del vendedor" a partir del
   catálogo de Vendedores y selecciona el nombre actual de la ubicación.
   Si ese nombre no está en el catálogo (texto libre que se haya escrito
   antes de este cambio), se agrega como una opción aparte para no
   perderlo, marcada como que no está en el catálogo. */
function poblarPSnameSelect(nombreActual) {
  const sel = $('#p-sname');
  if (!sel) return;
  sel.innerHTML = '';
  const optVacio = document.createElement('option');
  optVacio.value = ''; optVacio.textContent = T[lang].admSeleccionaVendedor;
  sel.appendChild(optVacio);
  vendedoresCatalogo.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v.nombre; opt.textContent = v.nombre;
    sel.appendChild(opt);
  });
  const nombre = (nombreActual || '').trim();
  if (nombre && !vendedoresCatalogo.some((v) => (v.nombre || '').trim() === nombre)) {
    const opt = document.createElement('option');
    opt.value = nombre; opt.textContent = nombre + T[lang].admNoEstaEnVendedores;
    sel.appendChild(opt);
  }
  sel.value = nombre;
}

/* Carrusel de propiedades: rotación visual 3D por ciudad (solo ciudades
   con propiedades); al presionar una ciudad se abre su listado. */
const car = $('#car');
let idx = 0;
let total = 0;
let carTimer = null;
function buildDots() {
  const box = $('#dots');
  box.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot' + (i === idx ? ' on' : '');
    b.setAttribute('aria-label', T[lang].goTo + (i + 1));
    b.addEventListener('click', () => { idx = i; update(); carStart(); });
    box.appendChild(b);
  }
}
function update() {
  if (!total) return;
  idx = ((idx % total) + total) % total;
  const cards = [...$('#carTrack').children];
  cards.forEach((card, i) => {
    let offset = i - idx;
    offset = ((offset % total) + total) % total;
    if (offset > total / 2) offset -= total;
    const abs = Math.abs(offset);
    if (abs > 3) {
      card.style.opacity = '0';
      card.style.pointerEvents = 'none';
      card.style.transform = 'translate3d(0,0,-600px)';
      return;
    }
    const spacing = 220;
    const rotateY = offset * -22;
    const translateX = offset * spacing;
    const translateZ = -abs * 150;
    const scale = abs === 0 ? 1 : 0.82;
    card.style.opacity = abs === 0 ? '1' : String(Math.max(0.35, 0.85 - abs * 0.2));
    card.style.pointerEvents = abs === 0 ? 'auto' : 'none';
    card.style.zIndex = String(100 - abs);
    card.style.filter = abs === 0 ? 'none' : 'brightness(.72)';
    card.style.transform = 'translate3d(' + translateX + 'px,0,' + translateZ + 'px) rotateY(' + rotateY + 'deg) scale(' + scale + ')';
  });
  $$('.dot').forEach((d, i) => d.classList.toggle('on', i === idx));
}
function carNext() { if (total) { idx = (idx + 1) % total; update(); } }
function carStart() { carStop(); if (total > 1) carTimer = setInterval(carNext, 3200); }
function carStop() { if (carTimer) { clearInterval(carTimer); carTimer = null; } }
let cityCovers = {};
function openCity(name) {
  cur = name; panelView = 'locs'; mode = estaConectado() ? 'edit' : 'view'; confirmDel = false; mk = null; descOpen = true;
  sel = (data[name] || []).length ? 0 : -1; vi = 0; heroIdx = 0; gridOpen = false; locFilterIdx = null; locQuickSearch = '';
  note('');
  render();
  pModal.hidden = false;
}
function openLocationDirect(name, locIndex) {
  cur = name; panelView = 'locs'; mode = estaConectado() ? 'edit' : 'view'; confirmDel = false; mk = null; descOpen = true;
  sel = locIndex; vi = 0; heroIdx = 0; gridOpen = false; locQuickSearch = '';
  note('');
  render();
  pModal.hidden = false;
}
/* Orden del carrusel de ciudades: "Ciudad de Guatemala" siempre primero
   (si existe), luego el resto en orden alfabético. */
function rotCityOrder(names) {
  const capital = names.find((n) => n.trim().toLowerCase() === 'ciudad de guatemala');
  const resto = names.filter((n) => n !== capital).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  return capital ? [capital, ...resto] : resto;
}
function buildCityCards() {
  const track = $('#carTrack');
  track.innerHTML = '';
  carStop();
  const names = rotCityOrder(cityNames());
  names.forEach((name, i) => {
    const article = el('article', 'pc');
    const btn = el('button', 'pc-img');
    btn.type = 'button';
    btn.setAttribute('aria-label', name);
    const img = el('img');
    img.src = cityCovers[name] || 'assets/propiedad-1.jpg';
    img.alt = name;
    btn.appendChild(img);
    btn.addEventListener('click', () => abrirRotVisualModal(name));
    const pn = el('div', 'pn');
    pn.append(el('span', '', name));
    article.append(btn, pn);
    track.appendChild(article);
  });
  total = names.length;
  idx = 0;
  buildDots();
  update();
  carStart();
  if (typeof buildSearchMenu === 'function') buildSearchMenu();
}
$('#prev').addEventListener('click', () => { idx = idx <= 0 ? total - 1 : idx - 1; update(); carStart(); });
$('#next').addEventListener('click', () => { idx = idx >= total - 1 ? 0 : idx + 1; update(); carStart(); });
window.addEventListener('resize', update);

/* Área de Clientes (demostración) */
const modal = $('#clientModal');
$('#openClient').addEventListener('click', () => { modal.hidden = false; $('#clientNote').hidden = true; navwrap.classList.remove('open'); });
const closeClient = () => { modal.hidden = true; };
$('#closeClient').addEventListener('click', closeClient);
$('#scrim').addEventListener('click', closeClient);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeClient(); });
$('#clientGo').addEventListener('click', () => { $('#clientNote').hidden = false; });

/* Conectarse: usuario y clave propios de ARMOPA (no es el sistema de Auth de Supabase).
   La clave nunca se guarda ni se compara en texto plano: se cifra (SHA-256) en el navegador
   y la comparación real ocurre dentro de una función de la base de datos (conectar_usuario),
   que es la única que puede leer el hash guardado. */
const LOGIN_STORE = 'armopaUsuario';
const LOGIN_TIPO_STORE = 'armopaUsuarioTipo';
const LOGIN_CODIGO_STORE = 'armopaUsuarioCodigo';
const TIPOS_USUARIO_LABEL = { super_administrador: 'Super administrador', administrador: 'Administrador', usuario_general: 'Usuario general' };

function estaConectado() {
  return !!localStorage.getItem(LOGIN_STORE);
}

/* Solicitudes de servicio: clave ya confirmada en esta sesión (Administrador o
   Super administrador). Declarada aquí arriba porque pintarEstadoUsuario() la usa. */
let solHashConfirmado = null;

/* Valor especial para la opción "Todos los registros" en la lista de
   solicitudes (usado por el listado de Administración > Servicios). */
const QBUSCARREG_TODOS = '__todos__';
function esAdminOSuperAdmin() {
  const tipo = localStorage.getItem(LOGIN_TIPO_STORE);
  return estaConectado() && (tipo === 'administrador' || tipo === 'super_administrador');
}

function esSuperAdmin() {
  return estaConectado() && localStorage.getItem(LOGIN_TIPO_STORE) === 'super_administrador';
}

async function csHashClave(texto) {
  const enc = new TextEncoder().encode(texto);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function pintarEstadoUsuario() {
  const usuario = localStorage.getItem(LOGIN_STORE);
  const tipo = localStorage.getItem(LOGIN_TIPO_STORE);
  const codigo = localStorage.getItem(LOGIN_CODIGO_STORE);
  const badge = $('#userBadge');
  const loginBtn = $('#openLoginBtn');
  const adminBtn = $('#adminUsuariosBtn');
  const serviciosSec = $('#serviciosDinamicos');
  const aboutRBlock = $('#aboutRBlock');
  const navAdmin = $('#navAdminDrop');
  const openClientBtn = $('#openClient');
  if (usuario) {
    const extra = tipo ? ' · ' + (TIPOS_USUARIO_LABEL[tipo] || tipo) + (codigo ? ' #' + codigo : '') : '';
    $('#userBadgeName').textContent = 'Hola, ' + usuario + extra;
    badge.hidden = false;
    loginBtn.hidden = true;
    if (adminBtn) adminBtn.hidden = tipo !== 'super_administrador';
    if (serviciosSec) serviciosSec.hidden = tipo !== 'super_administrador';
    if (aboutRBlock) aboutRBlock.hidden = false;
    if (navAdmin) navAdmin.hidden = tipo !== 'super_administrador';
    if (navAdmin && navAdmin.hidden) cerrarNavAdminMenu();
    if (openClientBtn) openClientBtn.hidden = tipo !== 'super_administrador';
    actualizarVisibilidadSolicitudes();
    actualizarVisibilidadSolServicio();
    actualizarVisibilidadAccionesCotizacion();
  } else {
    badge.hidden = true;
    loginBtn.hidden = false;
    if (adminBtn) adminBtn.hidden = true;
    if (serviciosSec) serviciosSec.hidden = true;
    if (aboutRBlock) aboutRBlock.hidden = true;
    if (navAdmin) navAdmin.hidden = true;
    if (openClientBtn) openClientBtn.hidden = true;
    cerrarNavAdminMenu();
    solHashConfirmado = null;
    actualizarVisibilidadSolicitudes();
    actualizarVisibilidadSolServicio();
    actualizarVisibilidadAccionesCotizacion();
  }
}

/* Sello de agua "ARMOPA, S.A." visible sobre todas las fotos del sitio,
   se esté conectado o no (ver CSS .wm-wrap / .hero en styles.css: un
   solo sello centrado abajo, blanco, tamaño medio). En vez de tocar cada
   lugar del código que crea un <img> (son muchos: propiedades,
   proyectos, servicios, vendedores, galería, lightbox, etc.), se
   envuelve automáticamente cualquier <img> que todavía no tenga su
   envoltorio, y se reaplica cada vez que se agrega contenido nuevo al
   DOM (tarjetas, carruseles, modales). El bloque de portada (.hero) no
   se envuelve -ya tiene su propio tamaño y fondo- así que el CSS apunta
   a .hero directamente. */
function selloAguaDebeOmitir(img) {
  // Logo de la marca y los íconos/insignias decorativos del sitio (no son
  // fotos del negocio) quedan fuera del sello de agua.
  if ((img.getAttribute('src') || '').includes('logo.webp')) return true;
  if (img.closest('.brand, .ic-h, .sv-ic')) return true;
  return false;
}

function aplicarSelloAguaFotos(raiz) {
  const base = raiz || document;
  base.querySelectorAll('img').forEach((img) => {
    if (img.closest('.wm-wrap')) return;
    if (selloAguaDebeOmitir(img)) return;
    const wrap = document.createElement('span');
    wrap.className = 'wm-wrap';
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);
  });
}

const wmObserver = new MutationObserver((mutaciones) => {
  for (const m of mutaciones) {
    if (m.addedNodes && m.addedNodes.length) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        if (n.tagName === 'IMG') aplicarSelloAguaFotos(n.parentNode || document);
        else if (n.querySelector && n.querySelector('img')) aplicarSelloAguaFotos(n);
      });
    }
  }
});
wmObserver.observe(document.body, { childList: true, subtree: true });
aplicarSelloAguaFotos();

pintarEstadoUsuario();

const loginModal = $('#loginModal');
const LOGIN_MAX_INTENTOS = 3;
let loginMode = 'conectar'; // 'conectar' = iniciar sesión en cuenta existente | 'crear' = registrar cuenta nueva
let loginIntentosFallidos = 0;

const EYE_OPEN = '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle>';
const EYE_OFF = '<path d="M3 3l18 18"></path><path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a16.6 16.6 0 0 1-3.3 4.3M6.5 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7c1.4 0 2.6-.3 3.7-.8"></path><path d="M9.5 10a3 3 0 0 0 4.2 4.2"></path>';
function activarOjoClave(inputId, btnId) {
  const input = $(inputId), btn = $(btnId);
  if (!input || !btn) return;
  btn.addEventListener('click', () => {
    const mostrar = input.type === 'password';
    input.type = mostrar ? 'text' : 'password';
    btn.setAttribute('aria-pressed', String(mostrar));
    btn.querySelector('svg').innerHTML = mostrar ? EYE_OFF : EYE_OPEN;
  });
}
activarOjoClave('#login-clave', '#loginClaveEye');
activarOjoClave('#login-clave2', '#loginClave2Eye');
activarOjoClave('#admin-clave-propia', '#adminClavePropiaEye');
activarOjoClave('#admin-clave-nueva', '#adminClaveNuevaEye');
activarOjoClave('#admin-clave-nueva2', '#adminClaveNueva2Eye');

function esSuperAdministrador() {
  return estaConectado() && localStorage.getItem(LOGIN_TIPO_STORE) === 'super_administrador';
}
let adminHashConfirmado = null;
let adminUsuarioEncontrado = null;

function aplicarModoLogin() {
  const esAdmin = loginMode === 'admin';
  const esCrear = loginMode === 'crear';
  const puedeElegirTipo = esCrear && esSuperAdministrador();

  $('#loginModeSeg').hidden = esAdmin;
  $('#login-usuario').closest('.fld').hidden = esAdmin;
  $('#loginSubmitWrap').hidden = esAdmin;
  $('#adminPanel').hidden = !esAdmin;

  if (esAdmin) {
    $('#loginTitle').textContent = 'Administrar usuarios';
    $('#loginSub').textContent = 'Consulta el código de un usuario o actualiza su clave (solo Super Administrador).';
    $('#loginConfirmWrap').hidden = true;
    $('#loginTipoWrap').hidden = true;
    $('#login-clave').closest('.fld').hidden = true;
  } else {
    $('#login-clave').closest('.fld').hidden = false;
    $('#loginModeConectar').classList.toggle('on', !esCrear);
    $('#loginModeCrear').classList.toggle('on', esCrear);
    $('#loginTitle').textContent = esCrear ? 'Crear usuario' : 'Conectarse';
    $('#loginSub').textContent = esCrear
      ? 'Crea tu cuenta: elige un usuario y una clave.'
      : 'Escribe tu usuario y clave para conectarte.';
    $('#loginConfirmWrap').hidden = !esCrear;
    $('#loginTipoWrap').hidden = !puedeElegirTipo;
    if (!puedeElegirTipo && $('#login-tipo')) $('#login-tipo').value = 'usuario_general';
    $('#loginSubmitBtn').textContent = esCrear ? 'Crear cuenta' : 'Conectar';
  }
  $('#loginError').hidden = true;
  $('#loginNote').hidden = true;
}
$('#loginModeConectar')?.addEventListener('click', () => { loginMode = 'conectar'; aplicarModoLogin(); });
$('#loginModeCrear')?.addEventListener('click', () => { loginMode = 'crear'; aplicarModoLogin(); });

function reiniciarCampoClave(inputId, eyeBtnId) {
  const input = $(inputId);
  if (!input) return;
  input.value = '';
  input.type = 'password';
  const eye = $(eyeBtnId);
  if (eye) {
    eye.setAttribute('aria-pressed', 'false');
    eye.querySelector('svg').innerHTML = EYE_OPEN;
  }
}

function reiniciarPanelAdmin() {
  adminHashConfirmado = null;
  reiniciarCampoClave('#admin-clave-propia', '#adminClavePropiaEye');
  reiniciarCampoClave('#admin-clave-nueva', '#adminClaveNuevaEye');
  reiniciarCampoClave('#admin-clave-nueva2', '#adminClaveNueva2Eye');
  if ($('#admin-usuario-obj')) $('#admin-usuario-obj').value = '';
  adminUsuarioEncontrado = null;
  $('#adminInfoBox').hidden = true;
  $('#adminTipoWrap').hidden = true;
  $('#adminConfirmBox').hidden = false;
  $('#adminTools').hidden = true;
}

const openLoginModal = () => {
  loginModal.hidden = false;
  $('#login-usuario').value = '';
  reiniciarCampoClave('#login-clave', '#loginClaveEye');
  reiniciarCampoClave('#login-clave2', '#loginClave2Eye');
  if ($('#login-tipo')) $('#login-tipo').value = 'usuario_general';
  reiniciarPanelAdmin();
  loginMode = 'conectar';
  loginIntentosFallidos = 0;
  aplicarModoLogin();
  navwrap.classList.remove('open');
};
const openAdminPanel = () => {
  if (!esSuperAdministrador()) return;
  loginModal.hidden = false;
  reiniciarPanelAdmin();
  loginMode = 'admin';
  aplicarModoLogin();
  navwrap.classList.remove('open');
};
const closeLoginModal = () => { loginModal.hidden = true; adminHashConfirmado = null; };
$('#openLoginBtn')?.addEventListener('click', openLoginModal);
$('#adminUsuariosBtn')?.addEventListener('click', openAdminPanel);
$('#loginClose')?.addEventListener('click', closeLoginModal);
$('#loginScrim')?.addEventListener('click', closeLoginModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && loginModal && !loginModal.hidden) closeLoginModal(); });

$('#adminConfirmarBtn')?.addEventListener('click', async () => {
  const errorEl = $('#loginError');
  const noteEl = $('#loginNote');
  errorEl.hidden = true;
  noteEl.hidden = true;
  const miUsuario = localStorage.getItem(LOGIN_STORE);
  const clave = $('#admin-clave-propia')?.value;
  if (!miUsuario || !clave) {
    errorEl.textContent = 'Escribe tu clave para confirmar.';
    errorEl.hidden = false;
    return;
  }
  const btn = $('#adminConfirmarBtn');
  btn.disabled = true;
  try {
    const hash = await csHashClave(clave);
    const { data, error } = await supabaseClient.rpc('conectar_usuario', { p_usuario: miUsuario, p_hash: hash, p_crear: false });
    if (error) throw error;
    if (data && data.status === 'ok' && data.tipo_usuario === 'super_administrador') {
      adminHashConfirmado = hash;
      $('#adminConfirmBox').hidden = true;
      $('#adminTools').hidden = false;
      noteEl.textContent = 'Identidad confirmada.';
      noteEl.hidden = false;
    } else {
      errorEl.textContent = 'Clave incorrecta. No se pudo confirmar tu identidad.';
      errorEl.hidden = false;
    }
  } catch (err) {
    console.error('Error al confirmar:', err);
    errorEl.textContent = 'No pudimos confirmar en este momento. Intenta de nuevo.';
    errorEl.hidden = false;
  } finally {
    btn.disabled = false;
  }
});

$('#adminBuscarBtn')?.addEventListener('click', async () => {
  const errorEl = $('#loginError');
  const noteEl = $('#loginNote');
  const infoBox = $('#adminInfoBox');
  errorEl.hidden = true;
  noteEl.hidden = true;
  infoBox.hidden = true;
  const miUsuario = localStorage.getItem(LOGIN_STORE);
  const objetivo = $('#admin-usuario-obj')?.value.trim();
  if (!adminHashConfirmado) { errorEl.textContent = 'Primero confirma tu clave.'; errorEl.hidden = false; return; }
  if (!objetivo) { errorEl.textContent = 'Escribe el usuario a buscar.'; errorEl.hidden = false; return; }

  const btn = $('#adminBuscarBtn');
  btn.disabled = true;
  try {
    const { data, error } = await supabaseClient.rpc('admin_buscar_usuario', { p_admin_usuario: miUsuario, p_admin_hash: adminHashConfirmado, p_usuario_buscar: objetivo });
    if (error) throw error;
    const status = data && data.status;
    if (status === 'ok') {
      const etiquetaTipo = TIPOS_USUARIO_LABEL[data.tipo_usuario] || data.tipo_usuario;
      infoBox.textContent = 'Usuario: ' + data.usuario + ' · ' + etiquetaTipo + ' · Código #' + data.codigo_usuario;
      infoBox.hidden = false;
      adminUsuarioEncontrado = data.usuario;
      $('#admin-tipo-obj').value = data.tipo_usuario;
      $('#adminTipoWrap').hidden = false;
    } else if (status === 'no_autorizado') {
      errorEl.textContent = 'Tu sesión de Super Administrador no pudo validarse. Vuelve a confirmar tu clave.';
      errorEl.hidden = false;
      adminHashConfirmado = null;
      adminUsuarioEncontrado = null;
      $('#adminTipoWrap').hidden = true;
      $('#adminConfirmBox').hidden = false;
      $('#adminTools').hidden = true;
    } else {
      errorEl.textContent = 'No se encontró ningún usuario con ese nombre.';
      errorEl.hidden = false;
      adminUsuarioEncontrado = null;
      $('#adminTipoWrap').hidden = true;
    }
  } catch (err) {
    console.error('Error al buscar usuario:', err);
    errorEl.textContent = 'No pudimos buscar el usuario en este momento.';
    errorEl.hidden = false;
  } finally {
    btn.disabled = false;
  }
});

$('#adminActualizarTipoBtn')?.addEventListener('click', async () => {
  const errorEl = $('#loginError');
  const noteEl = $('#loginNote');
  const infoBox = $('#adminInfoBox');
  errorEl.hidden = true;
  noteEl.hidden = true;
  const miUsuario = localStorage.getItem(LOGIN_STORE);
  const nuevoTipo = $('#admin-tipo-obj')?.value;

  if (!adminHashConfirmado) { errorEl.textContent = 'Primero confirma tu clave.'; errorEl.hidden = false; return; }
  if (!adminUsuarioEncontrado) { errorEl.textContent = 'Primero busca un usuario.'; errorEl.hidden = false; return; }

  const btn = $('#adminActualizarTipoBtn');
  btn.disabled = true;
  try {
    const { data, error } = await supabaseClient.rpc('admin_actualizar_tipo', { p_admin_usuario: miUsuario, p_admin_hash: adminHashConfirmado, p_usuario_objetivo: adminUsuarioEncontrado, p_nuevo_tipo: nuevoTipo });
    if (error) throw error;
    const status = data && data.status;
    if (status === 'ok') {
      const etiquetaTipo = TIPOS_USUARIO_LABEL[nuevoTipo] || nuevoTipo;
      noteEl.textContent = 'Tipo de usuario de "' + adminUsuarioEncontrado + '" actualizado a ' + etiquetaTipo + '.';
      noteEl.hidden = false;
      if (!infoBox.hidden) infoBox.textContent = infoBox.textContent.replace(/·.*·/, '· ' + etiquetaTipo + ' ·');
      if (adminUsuarioEncontrado === miUsuario) {
        localStorage.setItem(LOGIN_TIPO_STORE, nuevoTipo);
        pintarEstadoUsuario();
      }
    } else if (status === 'no_autorizado') {
      errorEl.textContent = 'Tu sesión de Super Administrador no pudo validarse. Vuelve a confirmar tu clave.';
      errorEl.hidden = false;
      adminHashConfirmado = null;
      $('#adminConfirmBox').hidden = false;
      $('#adminTools').hidden = true;
    } else {
      errorEl.textContent = 'No se encontró ningún usuario con ese nombre.';
      errorEl.hidden = false;
    }
  } catch (err) {
    console.error('Error al actualizar el tipo de usuario:', err);
    errorEl.textContent = 'No pudimos actualizar el tipo de usuario en este momento.';
    errorEl.hidden = false;
  } finally {
    btn.disabled = false;
  }
});

$('#adminActualizarBtn')?.addEventListener('click', async () => {
  const errorEl = $('#loginError');
  const noteEl = $('#loginNote');
  errorEl.hidden = true;
  noteEl.hidden = true;
  const miUsuario = localStorage.getItem(LOGIN_STORE);
  const objetivo = $('#admin-usuario-obj')?.value.trim();
  const nueva = $('#admin-clave-nueva')?.value;
  const nueva2 = $('#admin-clave-nueva2')?.value;

  if (!adminHashConfirmado) { errorEl.textContent = 'Primero confirma tu clave.'; errorEl.hidden = false; return; }
  if (!objetivo) { errorEl.textContent = 'Escribe el usuario al que vas a actualizar la clave.'; errorEl.hidden = false; return; }
  if (!nueva) { errorEl.textContent = 'Escribe la nueva clave.'; errorEl.hidden = false; return; }
  if (nueva !== nueva2) { errorEl.textContent = 'Las claves no coinciden.'; errorEl.hidden = false; return; }

  const btn = $('#adminActualizarBtn');
  btn.disabled = true;
  try {
    const nuevoHash = await csHashClave(nueva);
    const { data, error } = await supabaseClient.rpc('admin_actualizar_clave', { p_admin_usuario: miUsuario, p_admin_hash: adminHashConfirmado, p_usuario_objetivo: objetivo, p_nuevo_hash: nuevoHash });
    if (error) throw error;
    const status = data && data.status;
    if (status === 'ok') {
      noteEl.textContent = 'Clave de "' + objetivo + '" actualizada correctamente.';
      noteEl.hidden = false;
      reiniciarCampoClave('#admin-clave-nueva', '#adminClaveNuevaEye');
      reiniciarCampoClave('#admin-clave-nueva2', '#adminClaveNueva2Eye');
    } else if (status === 'no_autorizado') {
      errorEl.textContent = 'Tu sesión de Super Administrador no pudo validarse. Vuelve a confirmar tu clave.';
      errorEl.hidden = false;
      adminHashConfirmado = null;
      $('#adminConfirmBox').hidden = false;
      $('#adminTools').hidden = true;
    } else {
      errorEl.textContent = 'No se encontró ningún usuario con ese nombre.';
      errorEl.hidden = false;
    }
  } catch (err) {
    console.error('Error al actualizar la clave:', err);
    errorEl.textContent = 'No pudimos actualizar la clave en este momento.';
    errorEl.hidden = false;
  } finally {
    btn.disabled = false;
  }
});

$('#logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem(LOGIN_STORE);
  localStorage.removeItem(LOGIN_TIPO_STORE);
  localStorage.removeItem(LOGIN_CODIGO_STORE);
  pintarEstadoUsuario();
});

$('#loginSubmitBtn')?.addEventListener('click', async () => {
  const usuario = $('#login-usuario')?.value.trim();
  const clave = $('#login-clave')?.value;
  const clave2 = $('#login-clave2')?.value;
  const tipoUsuario = (loginMode === 'crear' && esSuperAdministrador()) ? ($('#login-tipo')?.value || 'usuario_general') : 'usuario_general';
  const errorEl = $('#loginError');
  const noteEl = $('#loginNote');
  errorEl.hidden = true;
  noteEl.hidden = true;

  if (!usuario || !clave) {
    errorEl.textContent = 'Escribe tu usuario y tu clave.';
    errorEl.hidden = false;
    return;
  }
  if (loginMode === 'crear' && clave !== clave2) {
    errorEl.textContent = 'Las claves no coinciden. Verifica el campo "Confirmar clave".';
    errorEl.hidden = false;
    return;
  }

  const btn = $('#loginSubmitBtn');
  btn.disabled = true;
  try {
    const hash = await csHashClave(clave);
    const { data, error } = await supabaseClient.rpc('conectar_usuario', {
      p_usuario: usuario,
      p_hash: hash,
      p_tipo_usuario: tipoUsuario,
      p_crear: loginMode === 'crear',
    });
    if (error) throw error;

    const status = data && data.status;
    const tipoResuelto = data && data.tipo_usuario;
    const codigoResuelto = data && data.codigo_usuario;

    if (status === 'creado') {
      loginIntentosFallidos = 0;
      localStorage.setItem(LOGIN_STORE, usuario);
      if (tipoResuelto) localStorage.setItem(LOGIN_TIPO_STORE, tipoResuelto);
      if (codigoResuelto != null) localStorage.setItem(LOGIN_CODIGO_STORE, String(codigoResuelto));
      pintarEstadoUsuario();
      const etiquetaTipo = TIPOS_USUARIO_LABEL[tipoResuelto] || tipoResuelto || '';
      noteEl.textContent = 'Cuenta creada como ' + etiquetaTipo + ' (código #' + codigoResuelto + '). ¡Bienvenido, ' + usuario + '!';
      noteEl.hidden = false;
      setTimeout(closeLoginModal, 1800);
    } else if (status === 'ok') {
      loginIntentosFallidos = 0;
      localStorage.setItem(LOGIN_STORE, usuario);
      if (tipoResuelto) localStorage.setItem(LOGIN_TIPO_STORE, tipoResuelto);
      if (codigoResuelto != null) localStorage.setItem(LOGIN_CODIGO_STORE, String(codigoResuelto));
      pintarEstadoUsuario();
      if (loginMode === 'crear') {
        errorEl.textContent = 'Ese usuario ya existe. Usa "Conectarse" para iniciar sesión.';
        errorEl.hidden = false;
        localStorage.removeItem(LOGIN_STORE);
        localStorage.removeItem(LOGIN_TIPO_STORE);
        localStorage.removeItem(LOGIN_CODIGO_STORE);
        pintarEstadoUsuario();
      } else {
        noteEl.textContent = 'Conectado correctamente.';
        noteEl.hidden = false;
        setTimeout(closeLoginModal, 900);
      }
    } else if (status === 'no_existe') {
      errorEl.textContent = 'Ese usuario no existe todavía. Usa "Crear usuario" para registrarte.';
      errorEl.hidden = false;
    } else {
      // Clave incorrecta para un usuario que sí existe.
      loginIntentosFallidos++;
      if (loginIntentosFallidos >= LOGIN_MAX_INTENTOS) {
        errorEl.textContent = 'Clave incorrecta. Alcanzaste el máximo de ' + LOGIN_MAX_INTENTOS + ' intentos; vuelve a intentarlo.';
        errorEl.hidden = false;
        setTimeout(closeLoginModal, 1600);
      } else {
        const restantes = LOGIN_MAX_INTENTOS - loginIntentosFallidos;
        errorEl.textContent = 'Clave incorrecta. Te queda' + (restantes === 1 ? '' : 'n') + ' ' + restantes + ' intento' + (restantes === 1 ? '' : 's') + '.';
        errorEl.hidden = false;
      }
    }
  } catch (err) {
    console.error('Error al conectar:', err);
    errorEl.textContent = 'No pudimos conectar en este momento. Intenta de nuevo.';
    errorEl.hidden = false;
  } finally {
    btn.disabled = false;
  }
});

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

/* Formulario de Autorización de Promoción y Venta */
const authModal = $('#authModal');
const openAuthModal = () => { authModal.hidden = false; $('#fpNote').hidden = true; };
const closeAuthModal = () => { authModal.hidden = true; };
const svRentBtn = $('#svRentBtn');
if (svRentBtn) {
  svRentBtn.addEventListener('click', openAuthModal);
  svRentBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAuthModal(); } });
}
$('#authClose')?.addEventListener('click', closeAuthModal);
$('#authScrim')?.addEventListener('click', closeAuthModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && authModal && !authModal.hidden) closeAuthModal(); });

$('#fpSave')?.addEventListener('click', async () => {
  const v = (id) => $(id)?.value.trim() || null;
  const n = (id) => { const x = $(id)?.value; return x === '' || x == null ? null : Number(x); };
  const c = (id) => !!$(id)?.checked;

  const nombre = v('#fp-nombre');
  if (!nombre) {
    alert(T[lang].fpErrNombre);
    return;
  }

  const row = {
    nombre_completo: nombre,
    fecha_nacimiento: v('#fp-nacimiento'),
    dpi_pasaporte: v('#fp-dpi'),
    representante_legal: v('#fp-repleg'),
    razon_social: v('#fp-razon'),
    nit: v('#fp-nit'),
    telefono_movil: v('#fp-tel'),
    correo_electronico: v('#fp-correo'),
    direccion_domicilio: v('#fp-domicilio'),

    tipo_propiedad: v('#fp-tipo'),
    direccion_propiedad: v('#fp-dirprop'),
    numero: v('#fp-numero'),
    finca: v('#fp-finca'),
    folio: v('#fp-folio'),
    libro: v('#fp-libro'),
    gravamen: v('#fp-gravamen'),
    institucion: v('#fp-institucion'),
    monto: v('#fp-monto'),
    mts_frente: v('#fp-mfrente'),
    mts_fondo: v('#fp-mfondo'),
    mts_construccion: v('#fp-mconst'),
    terreno_vrs2: v('#fp-terreno'),
    mts2: v('#fp-mts2'),
    niveles: v('#fp-niveles'),
    estacionamientos: v('#fp-estac'),
    habitaciones: v('#fp-habitaciones'),
    banos: v('#fp-banos'),

    lavanderia: c('#fp-lavanderia'),
    linea_blanca: c('#fp-linea-blanca'),
    habitacion_servicio: c('#fp-hab-servicio'),
    bodega: c('#fp-bodega'),
    amueblado: c('#fp-amueblado'),
    balcon_terraza_jardin: c('#fp-balcon'),
    mascota: c('#fp-mascota'),

    amenidad_motor_lobby: c('#fp-am-motorlobby'),
    amenidad_piscina: c('#fp-am-piscina'),
    amenidad_sauna: c('#fp-am-sauna'),
    amenidad_juegos_ninos: c('#fp-am-juegos'),
    amenidad_area_verde: c('#fp-am-areaverde'),
    amenidad_salon_usos_multiples: c('#fp-am-salon'),
    amenidad_gimnasio: c('#fp-am-gimnasio'),
    amenidad_business_center: c('#fp-am-business'),
    amenidad_canchas_deportivas: c('#fp-am-canchas'),
    amenidad_cisterna_pozo: c('#fp-am-cisterna'),
    num_parqueos_visita: n('#fp-am-parqueos'),

    precio_venta: v('#fp-precio-venta'),
    valor_registro: v('#fp-valor-registro'),
    iusi_trimestral: v('#fp-iusi'),

    precio_alquiler: v('#fp-precio-alquiler'),
    mantenimiento: v('#fp-mantenimiento'),
    incluye_mantenimiento: v('#fp-incluye-mant'),

    observaciones: v('#fp-obs')
  };

  const { error } = await supabaseClient.from('autorizaciones_promocion').insert(row);

  if (error) {
    console.error('Error al guardar autorización:', error);
    alert(T[lang].fpErrGuardar);
    return;
  }

  $('#fpNote').hidden = false;
});

/* Reporte imprimible del Formulario de Autorización de Promoción y Venta */
function fpEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function fpBox(checked) {
  return '<span class="fp-chk">' + (checked ? '☑' : '☐') + '</span>';
}
function buildAuthReportHTML() {
  const v = (id) => fpEsc($(id)?.value.trim() || '');
  const c = (id) => !!$(id)?.checked;
  const logoUrl = new URL('assets/logo-reporte.png', window.location.href).href;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Formulario de Autorización de Promoción y Venta</title>
<style>
  @page { size: letter; margin: 10mm 14mm; }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #111; margin: 0; }
  .fp-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 3px solid #071a2f; padding-bottom: 8px; margin: 0 0 12px; }
  .fp-head img { height: 58px; }
  .fp-head h1 { flex: 1; text-align: center; font-size: 19px; margin: 0; color: #10243c; }
  .fp-contact { border: 1px solid #333; padding: 6px 12px; font-size: 11px; text-align: center; line-height: 1.4; white-space: nowrap; }
  .fp-sec-h { background: #071a2f; color: #fff; font-weight: bold; font-size: 12.5px; padding: 5px 10px; margin: 16px 0 0; }
  table.fp-tab { width: 100%; border-collapse: collapse; margin-bottom: 0; }
  table.fp-tab td { border: 1px solid #999; background: #f2f2f2; padding: 6px 12px; font-size: 11.5px; vertical-align: top; line-height: 1.5; }
  table.fp-tab td b { font-weight: bold; }
  .fp-note { font-size: 10.5px; line-height: 1.55; color: #222; margin: 10px 0 0; text-align: justify; }
  .fp-chk { display: inline-block; margin-right: 3px; }
  .fp-terms { font-size: 10px; line-height: 1.55; text-align: justify; margin-top: 18px; }
  .fp-terms p { margin: 8px 0; }
  .fp-terms ul { margin: 6px 0; padding-left: 20px; }
  .fp-terms li { margin-bottom: 4px; }
  .fp-sign { display: flex; justify-content: space-around; margin-top: 58px; page-break-inside: avoid; }
  .fp-sign div { width: 42%; text-align: center; border-top: 1px solid #111; padding-top: 6px; font-size: 11px; }
  .fp-cert { font-size: 10.5px; line-height: 1.55; text-align: justify; margin-top: 20px; }
  @media print {
    .fp-noprint { display: none; }
    html, body { width: 100%; height: 100%; }
  }
</style>
</head>
<body>
  <div class="fp-head">
    <img src="${logoUrl}" alt="ARMOPA">
    <h1>Formulario de Autorización de Promoción y Venta</h1>
    <div class="fp-contact">Información y Ventas<br>(502) 4918 3411<br>(502) 5801 0723</div>
  </div>

  <div class="fp-sec-h">Datos del Propietario</div>
  <table class="fp-tab">
    <tr><td colspan="3"><b>Nombre completo:</b> ${v('#fp-nombre')}</td></tr>
    <tr><td><b>DPI/CUI o Pasaporte:</b> ${v('#fp-dpi')}</td><td colspan="2"><b>Fecha de Nacimiento:</b> ${v('#fp-nacimiento')}</td></tr>
    <tr><td><b>Representante Legal:</b> ${v('#fp-repleg')}</td><td><b>Razón Social:</b> ${v('#fp-razon')}</td><td><b>NIT:</b> ${v('#fp-nit')}</td></tr>
    <tr><td colspan="2"><b>Teléfono móvil:</b> ${v('#fp-tel')}</td><td><b>Correo Electrónico:</b> ${v('#fp-correo')}</td></tr>
  </table>

  <div class="fp-sec-h">Dirección domicilio actual:</div>
  <table class="fp-tab"><tr><td>${v('#fp-domicilio')}</td></tr></table>

  <p class="fp-note">Como propietario del inmueble que se describe a continuación, autorizo a <b>Armopa group</b>, a promocionar en Alquiler y/o Venta mi inmueble por los medios que este considere pertinentes, derivado de lo anterior y por el cumplimiento del decreto # 55-2010 adjunto mi documento de identificación (<b>DPI/CUI o Pasaporte</b>), así como uno de estos documentos: (1.- Recibo de IUSI reciente; ó 2.- Consulta electrónica del Registro de la Propiedad; ó 3.- Avalúo Reciente; ó 4.- Escritura Pública).</p>

  <div class="fp-sec-h">Descripción Propiedad</div>
  <table class="fp-tab">
    <tr><td colspan="3"><b>Tipo:</b> ${v('#fp-tipo')}</td></tr>
    <tr><td colspan="3"><b>Dirección:</b> ${v('#fp-dirprop')}</td></tr>
    <tr><td colspan="3"><b>Número:</b> ${v('#fp-numero')}</td></tr>
    <tr><td><b>Finca:</b> ${v('#fp-finca')}</td><td><b>Folio:</b> ${v('#fp-folio')}</td><td><b>Libro:</b> ${v('#fp-libro')}</td></tr>
    <tr><td><b>Gravamen:</b> ${v('#fp-gravamen')}</td><td><b>Institución:</b> ${v('#fp-institucion')}</td><td><b>Monto:</b> ${v('#fp-monto')}</td></tr>
    <tr><td><b>Mts. Frente:</b> ${v('#fp-mfrente')}</td><td><b>Mts. Fondo:</b> ${v('#fp-mfondo')}</td><td><b>Mts. Construcción:</b> ${v('#fp-mconst')}</td></tr>
    <tr><td><b>Terreno Vrs2:</b> ${v('#fp-terreno')}</td><td><b>Mts2:</b> ${v('#fp-mts2')}</td><td><b>Niveles:</b> ${v('#fp-niveles')}</td></tr>
    <tr><td><b>Estacionamientos:</b> ${v('#fp-estac')}</td><td><b>Habitaciones:</b> ${v('#fp-habitaciones')}</td><td><b>Baños:</b> ${v('#fp-banos')}</td></tr>
    <tr>
      <td colspan="3">
        ${fpBox(c('#fp-lavanderia'))}<b>Lavandería</b>&nbsp;&nbsp;&nbsp;
        ${fpBox(c('#fp-linea-blanca'))}<b>Línea Blanca</b>&nbsp;&nbsp;&nbsp;
        ${fpBox(c('#fp-hab-servicio'))}<b>Habitación Servicio</b>&nbsp;&nbsp;&nbsp;
        ${fpBox(c('#fp-bodega'))}<b>Bodega</b>&nbsp;&nbsp;&nbsp;
        ${fpBox(c('#fp-amueblado'))}<b>Amueblado</b>
      </td>
    </tr>
    <tr>
      <td colspan="3">
        ${fpBox(c('#fp-balcon'))}<b>Balcón y/o Terraza / Jardín</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        ${fpBox(c('#fp-mascota'))}<b>Mascota</b>
      </td>
    </tr>
  </table>

  <div class="fp-sec-h">Amenidades del Edificio / Condominio</div>
  <table class="fp-tab">
    <tr>
      <td colspan="3">
        ${fpBox(c('#fp-am-motorlobby'))}<b>Motor Lobby</b>&nbsp;&nbsp;
        ${fpBox(c('#fp-am-piscina'))}<b>Piscina</b>&nbsp;&nbsp;
        ${fpBox(c('#fp-am-sauna'))}<b>Sauna</b>&nbsp;&nbsp;
        ${fpBox(c('#fp-am-juegos'))}<b>Juegos de Niños</b>&nbsp;&nbsp;
        ${fpBox(c('#fp-am-areaverde'))}<b>Área Verde</b>&nbsp;&nbsp;
        ${fpBox(c('#fp-am-salon'))}<b>Salón Usos Múltiples</b>&nbsp;&nbsp;
        ${fpBox(c('#fp-am-gimnasio'))}<b>Gimnasio</b>&nbsp;&nbsp;
        ${fpBox(c('#fp-am-business'))}<b>Bussines Center</b>
      </td>
    </tr>
    <tr>
      <td colspan="3">
        ${fpBox(c('#fp-am-canchas'))}<b>Canchas Deportivas</b>&nbsp;&nbsp;
        ${fpBox(c('#fp-am-cisterna'))}<b>Cisterna y/o Pozo</b>&nbsp;&nbsp;
        <b>Número de parqueos de visita:</b> ${v('#fp-am-parqueos')}
      </td>
    </tr>
  </table>

  <table class="fp-tab" style="margin-top:10px">
    <tr><td colspan="3"><b>Precio de Venta:</b> ${v('#fp-precio-venta')}</td></tr>
    <tr><td colspan="2"><b>Valor del Registro:</b> ${v('#fp-valor-registro')}</td><td><b>IUSI Trimestral:</b> ${v('#fp-iusi')}</td></tr>
    <tr><td colspan="3"><b>Precio Alquiler:</b> ${v('#fp-precio-alquiler')}</td></tr>
    <tr><td colspan="3"><b>Mantenimiento:</b> ${v('#fp-mantenimiento')}</td></tr>
    <tr><td colspan="3"><b>Qué incluye el mantenimiento:</b> ${v('#fp-incluye-mant')}</td></tr>
    <tr><td colspan="3"><b>Observaciones:</b> ${v('#fp-obs')}</td></tr>
  </table>

  <div class="fp-terms">
    <p>En caso de que la negociación se realice con un cliente de <b>Armopa group</b> (proporcionado o referido por cualquiera de sus Ejecutivos Asociados) me comprometo a cancelar los honorarios en concepto de Servicios Profesionales de Bienes Raíces correspondientes por:</p>
    <ul>
      <li>Alquileres: 112% (Incluye IVA) de la primera mensualidad de Alquiler en contrato de 1 año.</li>
      <li>Alquileres a largo Plazo: 112% (Incluye IVA) x múltiplos o fracción de cada 3 años de contrato.</li>
      <li>Venta: 5.6% (Incluye IVA) del valor final de venta de la negociación.</li>
    </ul>
    <p>En caso de que se firme una promesa de compraventa y que no se concrete la compraventa se dividirán las Arras pactadas en dos partes, el 50% para <b>Armopa group</b> por concepto de honorarios y otro 50% para <b>EL PROPIETARIO</b>. Los honorarios se cancelarán en el momento de la firma de promesa de compra-venta o en el contrato de arrendamiento. Autorizo voluntariamente que la información recopilada y/o proporcionada por entidades públicas o privadas y le generación de relaciones contractuales, crediticias o comerciales, sea reportada a centrales de riesgo o burós de crédito para ser tratada, almacenada o transferida y autorizo expresamente a las entidades que presten servicios de información, centrales de riesgo o burós de crédito, el recopilar, difundir o comercializar reportes o estudios que contengan información sobre mi persona. Autorizo a que el comprador o arrendatario emita cheque de pago de honorarios a nombre de <b>Armopa group</b>, al momento de formalizar la negociación.</p>
  </div>

  <div class="fp-sign">
    <div>Firma Propietario</div>
    <div>Firma Armopa group</div>
  </div>

  <p class="fp-cert">En la ciudad de Guatemala, el _______ de ___________ de _______, DOY FÉ que las firmas que anteceden son AUTÉNTICAS por haber sido puestas en mi presencia por _____________ y _____________, personas de mi conocimiento. Estas firmas calzan un documento denominado FORMULARIO DE AUTORIZACIÓN DE PROMOCIÓN Y VENTA, contenido en una página impresa la cual firmo y sello.</p>

  <div class="fp-sign">
    <div>Firma Propietario</div>
    <div>Firma Armopa group</div>
  </div>
</body>
</html>`;
}

$('#fpPrint')?.addEventListener('click', () => {
  const w = window.open('', '_blank');
  if (!w) {
    alert('Tu navegador bloqueó la ventana de impresión. Permite ventanas emergentes para este sitio e intenta de nuevo.');
    return;
  }
  w.document.open();
  w.document.write(buildAuthReportHTML());
  w.document.close();
  w.onload = () => { w.focus(); w.print(); };
});

/* Requisitos para vender una propiedad (guía generada con IA) + subida de PDF por requisito */
const REQ_DOCS_BUCKET = 'requisitos-venta'; // bucket de Supabase Storage — debe crearse como PRIVADO
const REQ_DOC_TYPES = ['dpi', 'nit', 'escritura', 'certificacion-rgp', 'gravamenes', 'iusi', 'solvencia-municipal', 'catastro', 'planos', 'empresa', 'poder', 'avaluo'];
let reqVentaId = null;

const reqModal = $('#reqModal');
const openReqModal = () => {
  reqModal.hidden = false;
  reqVentaId = null;
  REQ_DOC_TYPES.forEach((doc) => { const st = $('#reqs-' + doc); if (st) st.textContent = T[lang].reqSinSubir; });
};
const closeReqModal = () => { reqModal.hidden = true; };
const svComprarBtn = $('#svComprarBtn');
if (svComprarBtn) {
  svComprarBtn.addEventListener('click', openReqModal);
  svComprarBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReqModal(); } });
}
$('#reqClose')?.addEventListener('click', closeReqModal);
$('#reqScrim')?.addEventListener('click', closeReqModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && reqModal && !reqModal.hidden) closeReqModal(); });

async function reqEnsureVentaId() {
  if (reqVentaId) return reqVentaId;
  const { data, error } = await supabaseClient.from('ventas_requisitos').insert({}).select('id').single();
  if (error) throw error;
  reqVentaId = data.id;
  return reqVentaId;
}

REQ_DOC_TYPES.forEach((doc) => {
  const input = $('#reqf-' + doc);
  if (!input) return;
  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert(T[lang].soloArchivosPdf);
      input.value = '';
      return;
    }
    const st = $('#reqs-' + doc);
    if (st) st.textContent = T[lang].subiendoEllipsis;
    try {
      const ventaId = await reqEnsureVentaId();
      const path = ventaId + '/' + doc + '-' + Date.now() + '.pdf';
      const { error: upErr } = await supabaseClient.storage.from(REQ_DOCS_BUCKET).upload(path, file, { contentType: 'application/pdf', upsert: true });
      if (upErr) { if (st) st.textContent = T[lang].errorSubirArchivo; return; }
      const { error: dbErr } = await supabaseClient.from('documentos_venta_propiedad').upsert({
        venta_id: ventaId,
        tipo_documento: doc,
        ruta_archivo_pdf: path,
        tamano_bytes: file.size
      }, { onConflict: 'venta_id,tipo_documento' });
      if (dbErr) { if (st) st.textContent = T[lang].pqMsgErrorGuardarCorto; return; }
      if (st) st.textContent = '✅ ' + T[lang].subidoPrefix + file.name;
    } catch (err) {
      console.error('Error al subir requisito:', err);
      if (st) st.textContent = T[lang].errorSubirArchivo;
    }
  });
});

/* ===== Agendar Cita: formulario público junto al botón de "Buscar
   propiedades", guarda en citas_propiedades y permite enviar un resumen
   por WhatsApp al asesor asignado (o al primer vendedor del catálogo si
   no se asignó ninguno). ===== */
const citaModal = $('#citaModal');
let citaGuardadaId = null;

function poblarCitaVendedorSelect() {
  const sel = $('#cita-vendedor');
  if (!sel) return;
  const actual = sel.value;
  sel.innerHTML = '';
  const optVacio = document.createElement('option');
  optVacio.value = ''; optVacio.textContent = T[lang].citaSinVendedor;
  sel.appendChild(optVacio);
  vendedoresCatalogo.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v.nombre; opt.textContent = v.nombre;
    sel.appendChild(opt);
  });
  sel.value = actual || '';
}

/* Lista de horas de 7:00 a.m. a 6:00 p.m. cada 30 minutos, en formato
   24h (valor) y 12h con a.m./p.m. (texto visible). */
function poblarCitaHoraSelect() {
  const sel = $('#cita-hora');
  if (!sel) return;
  const actual = sel.value;
  sel.innerHTML = '';
  const optVacio = document.createElement('option');
  optVacio.value = ''; optVacio.textContent = '';
  sel.appendChild(optVacio);
  for (let mins = 7 * 60; mins <= 18 * 60; mins += 30) {
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const value = String(h24).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    const h12 = (h24 % 12) === 0 ? 12 : (h24 % 12);
    const ampm = h24 < 12 ? 'a.m.' : 'p.m.';
    const label = h12 + ':' + String(m).padStart(2, '0') + ' ' + ampm;
    const opt = document.createElement('option');
    opt.value = value; opt.textContent = label;
    sel.appendChild(opt);
  }
  sel.value = actual || '';
}

function poblarCitaCiudadList() {
  const list = $('#citaCiudadList');
  if (!list) return;
  list.innerHTML = '';
  Object.keys(cityCovers || {}).sort().forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c;
    list.appendChild(opt);
  });
}

/* Debajo del campo de fecha, muestra "Nombre del día" al elegir una fecha. */
function actualizarCitaFechaDia() {
  const el = $('#citaFechaDia');
  if (!el) return;
  const valor = $('#cita-fecha').value;
  el.textContent = valor ? citaFechaConNombreDia(valor) : '';
}
$('#cita-fecha')?.addEventListener('change', actualizarCitaFechaDia);

/* Colorea el <select> de Etiqueta según el valor elegido (cliente, muy
   interesado, interesado, poco interesado), mostrando el texto en
   mayúsculas con un color distinto por cada opción. */
const CITA_ETQ_CLASES = { cliente: 'etq-cliente', muy_interesado: 'etq-muy', interesado: 'etq-interesado', poco_interesado: 'etq-poco' };
function actualizarCitaEtiquetaColor() {
  const sel = $('#cita-etiqueta');
  if (!sel) return;
  Object.values(CITA_ETQ_CLASES).forEach((cls) => sel.classList.remove(cls));
  const cls = CITA_ETQ_CLASES[sel.value];
  if (cls) sel.classList.add(cls);
}
$('#cita-etiqueta')?.addEventListener('change', actualizarCitaEtiquetaColor);

/* prefill: datos opcionales de una propiedad ya seleccionada (desde
   Rotación Visual) para precargar ubicación/ciudad/asesor al agendar. */
const openCitaModal = (prefill) => {
  citaModal.hidden = false;
  citaGuardadaId = null;
  $('#cita-nombre').value = '';
  $('#cita-tel').value = '';
  $('#cita-fecha').value = '';
  actualizarCitaFechaDia();
  poblarCitaHoraSelect();
  $('#cita-hora').value = '07:00';
  $('#cita-ciudad').value = (prefill && prefill.ciudad) || '';
  $('#cita-ubicacion').value = (prefill && prefill.ubicacion) || '';
  $('#cita-accion').value = '';
  $('#cita-estado').value = 'agendado';
  $('#cita-etiqueta').value = 'cliente';
  actualizarCitaEtiquetaColor();
  $('#citaMsg').textContent = '';
  $('#citaMsg').style.color = '';
  $('#citaWaBtn').hidden = true;
  $('#citaModBtn').hidden = true;
  $('#citaSaveBtn').hidden = false;
  poblarCitaVendedorSelect();
  poblarCitaCiudadList();
  if (prefill && prefill.vendedor) $('#cita-vendedor').value = prefill.vendedor;
  if (!vendedoresCatalogoCargado) cargarVendedoresCatalogo().then(() => {
    poblarCitaVendedorSelect();
    if (prefill && prefill.vendedor) $('#cita-vendedor').value = prefill.vendedor;
  });
};
const closeCitaModal = () => { citaModal.hidden = true; };
$('#citaClose')?.addEventListener('click', closeCitaModal);
$('#citaScrim')?.addEventListener('click', closeCitaModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && citaModal && !citaModal.hidden) closeCitaModal(); });

/* Botón "Agendar Cita" dentro de Rotación Visual: precarga la ubicación,
   ciudad y asesor de la propiedad actualmente mostrada. Se cierra primero
   Rotación Visual (mismo z-index que el modal de cita) para que el
   formulario quede al frente y sea posible completarlo. */
$('#rotVisualAgendarCitaBtn')?.addEventListener('click', () => {
  const it = rotVisualItems[rotVisualIdx];
  const r = it && it.row;
  const prefill = {
    ciudad: (r && r.ciudad) || '',
    ubicacion: (it && it.nombre) || (r && r.nombre) || '',
    vendedor: (r && r.vendedor_nombre) || ''
  };
  cerrarRotVisualModal();
  openCitaModal(prefill);
});

/* Convierte el valor de un <input type="date"> (AAAA-MM-DD) al formato
   "Nombre del día DD-MM-AAAA" para guardarlo tal como se mostrará al
   usuario (por ejemplo "Jueves 15-11-2026"), usando el idioma activo. */
function citaFechaConNombreDia(valorIso) {
  if (!valorIso) return '';
  const [y, m, d] = valorIso.split('-').map(Number);
  if (!y || !m || !d) return '';
  const fecha = new Date(Date.UTC(y, m - 1, d));
  const diasEs = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diasEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const nombreDia = (lang === 'en' ? diasEn : diasEs)[fecha.getUTCDay()];
  const dd = String(d).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return nombreDia + ' ' + dd + '-' + mm + '-' + y;
}

/* Texto visible de la hora elegida (ej. "9:30 a.m."), leído de la etiqueta
   del <option> seleccionado en #cita-hora. */
function citaHoraTexto() {
  const sel = $('#cita-hora');
  if (!sel || !sel.value) return '';
  const opt = sel.options[sel.selectedIndex];
  return opt ? opt.textContent : '';
}

function citaWaNumero(nombreVendedor) {
  const v = vendedoresCatalogo.find((x) => (x.nombre || '').trim() === (nombreVendedor || '').trim());
  const tel = (v ? v.telefono : '') || (vendedoresCatalogo[0] ? vendedoresCatalogo[0].telefono : '') || '';
  return tel.replace(/\D/g, '');
}

function citaConstruirMensajeWa(row) {
  const t = T[lang];
  const partes = [t.citaWaMsgIntro];
  partes.push(t.citaWaMsgCliente + (row.nombre_cliente || ''));
  if (row.telefono_cliente) partes.push(t.citaWaMsgTelefono + row.telefono_cliente);
  if (row.fecha_cita_texto) partes.push(t.citaWaMsgFecha + row.fecha_cita_texto);
  if (row.hora_cita) partes.push(t.citaWaMsgHora + citaHoraTexto());
  if (row.ubicacion) partes.push(t.citaWaMsgUbicacion + row.ubicacion);
  if (row.ciudad) partes.push(t.citaWaMsgCiudad + row.ciudad);
  if (row.accion) partes.push(t.citaWaMsgAccion + row.accion);
  partes.push(t.citaWaMsgEstado + (T[lang]['citaEst' + { agendado: 'Agendado', efectuado: 'Efectuado', reagendado: 'Reagendado', no_asistio: 'NoAsistio' }[row.estado]] || row.estado));
  return partes.join('\n');
}

function citaLeerRowFormulario() {
  const nombre = $('#cita-nombre').value.trim();
  const vendedor = $('#cita-vendedor').value || null;
  const fechaIso = $('#cita-fecha').value || null;
  return {
    nombre_cliente: nombre,
    telefono_cliente: $('#cita-tel').value.trim() || null,
    fecha_cita: fechaIso,
    fecha_cita_texto: fechaIso ? citaFechaConNombreDia(fechaIso) : null,
    hora_cita: $('#cita-hora').value || null,
    ciudad: $('#cita-ciudad').value.trim() || null,
    ubicacion: $('#cita-ubicacion').value.trim() || null,
    vendedor_asignado: vendedor,
    accion: $('#cita-accion').value.trim() || null,
    estado: $('#cita-estado').value || 'agendado',
    etiqueta: $('#cita-etiqueta').value || 'cliente'
  };
}

function citaActualizarBotonWa(row, vendedor) {
  const waBtn = $('#citaWaBtn');
  const numero = citaWaNumero(vendedor);
  if (numero) {
    const texto = citaConstruirMensajeWa(row);
    waBtn.href = 'https://wa.me/' + (numero.length === 8 ? '502' + numero : numero) + '?text=' + encodeURIComponent(texto);
    waBtn.hidden = false;
  }
}

$('#citaSaveBtn')?.addEventListener('click', async () => {
  const msg = $('#citaMsg');
  const base = citaLeerRowFormulario();
  if (!base.nombre_cliente) {
    msg.style.color = '#b3261e';
    msg.textContent = T[lang].citaErrNombre;
    return;
  }
  const usuario = estaConectado() ? localStorage.getItem(LOGIN_STORE) : T[lang].citaVisitante;
  const row = { ...base, usuario, estado_fecha: new Date().toISOString() };
  msg.style.color = '';
  msg.textContent = T[lang].cargando;
  try {
    const { data, error } = await supabaseClient.from('citas_propiedades').insert(row).select('id').single();
    if (error) throw error;
    citaGuardadaId = data.id;
    msg.style.color = '';
    msg.textContent = T[lang].citaGuardadaOk;
    citaActualizarBotonWa(row, base.vendedor_asignado);
    $('#citaModBtn').hidden = false;
  } catch (err) {
    console.error('Error al guardar cita:', err);
    msg.style.color = '#b3261e';
    msg.textContent = T[lang].citaErrGuardar;
  }
});

/* Modifica la cita ya guardada en esta misma sesión del formulario (UPDATE
   sobre citaGuardadaId), en vez de crear un registro nuevo. */
$('#citaModBtn')?.addEventListener('click', async () => {
  const msg = $('#citaMsg');
  if (!citaGuardadaId) return;
  const base = citaLeerRowFormulario();
  if (!base.nombre_cliente) {
    msg.style.color = '#b3261e';
    msg.textContent = T[lang].citaErrNombre;
    return;
  }
  const row = { ...base, estado_fecha: new Date().toISOString() };
  msg.style.color = '';
  msg.textContent = T[lang].cargando;
  try {
    const { error } = await supabaseClient.from('citas_propiedades').update(row).eq('id', citaGuardadaId);
    if (error) throw error;
    msg.style.color = '';
    msg.textContent = T[lang].citaGuardadaOk;
    citaActualizarBotonWa(row, base.vendedor_asignado);
  } catch (err) {
    console.error('Error al modificar cita:', err);
    msg.style.color = '#b3261e';
    msg.textContent = T[lang].citaErrGuardar;
  }
});

/* Solicitud de Remodelación: datos del cliente + fotografías */
const REMODEL_BUCKET = 'remodelaciones';
let frImgs1 = [];
let frImgs2 = [];

function uploadImageToBucket(file, bucket, max) {
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
            const { error } = await supabaseClient.storage.from(bucket).upload(path, blob, { contentType: 'image/jpeg' });
            if (error) { reject(error); return; }
            const pub = supabaseClient.storage.from(bucket).getPublicUrl(path);
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

function frRenderGrid(gridId, arr) {
  const grid = $(gridId);
  if (!grid) return;
  grid.innerHTML = '';
  arr.forEach((src, i) => {
    const wrap = el('div', 'th');
    const img = el('img'); img.src = src; img.alt = '';
    wrap.appendChild(img);
    const x = el('button', 'th-x', '×');
    x.type = 'button';
    x.setAttribute('aria-label', T[lang].remove);
    x.addEventListener('click', () => { arr.splice(i, 1); frRenderGrid(gridId, arr); });
    wrap.appendChild(x);
    grid.appendChild(wrap);
  });
}

$('#fr-files1')?.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files || []);
  e.target.value = '';
  for (const f of files) {
    try { frImgs1.push(await uploadImageToBucket(f, REMODEL_BUCKET, 1600)); } catch (err) { console.error(err); }
  }
  frRenderGrid('#frGrid1', frImgs1);
});
$('#fr-files2')?.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files || []);
  e.target.value = '';
  for (const f of files) {
    try { frImgs2.push(await uploadImageToBucket(f, REMODEL_BUCKET, 1600)); } catch (err) { console.error(err); }
  }
  frRenderGrid('#frGrid2', frImgs2);
});

const remodelModal = $('#remodelModal');
const openRemodelModal = () => {
  remodelModal.hidden = false;
  $('#frNote').hidden = true;
  frImgs1 = [];
  frImgs2 = [];
  frRenderGrid('#frGrid1', frImgs1);
  frRenderGrid('#frGrid2', frImgs2);
  $('#fr-nombre').value = '';
  $('#fr-detalles').value = '';
  $('#fr-tiempo').value = '';
  $('#fr-presupuesto').value = '';
  if (!vendedoresCatalogoCargado) { vendedoresCatalogoCargado = true; cargarVendedoresCatalogo(); }
  actualizarVisibilidadPromotoresServicio();
};
const closeRemodelModal = () => { remodelModal.hidden = true; };
const svRemodelBtn = $('#svRemodelBtn');
if (svRemodelBtn) {
  svRemodelBtn.addEventListener('click', openRemodelModal);
  svRemodelBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRemodelModal(); } });
}
$('#remodelClose')?.addEventListener('click', closeRemodelModal);
$('#remodelScrim')?.addEventListener('click', closeRemodelModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && remodelModal && !remodelModal.hidden) closeRemodelModal(); });

$('#frSend')?.addEventListener('click', async () => {
  const nombre = $('#fr-nombre')?.value.trim();
  if (!nombre) {
    alert(T[lang].escribeNombreCliente);
    return;
  }
  const row = {
    nombre_cliente: nombre,
    detalles: $('#fr-detalles')?.value.trim() || null,
    fotos_actuales: frImgs1,
    fotos_referencia: frImgs2,
    tiempo_estimado: $('#fr-tiempo')?.value || null,
    presupuesto_estimado: $('#fr-presupuesto')?.value.trim() || null,
    promotor_negocio: $('#fr-promotor')?.value || null
  };

  const { error } = await supabaseClient.from('solicitudes_remodelacion').insert(row);

  if (error) {
    console.error('Error al guardar solicitud de remodelación:', error);
    alert(T[lang].errorEnviarSolicitud);
    return;
  }

  $('#frNote').hidden = false;
});

/* Adaptamos tu presupuesto: solicitud del cliente + PDF opcional */
const PRESUP_BUCKET = 'solicitudes-presupuesto'; // bucket de Supabase Storage — debe crearse como PRIVADO
let ppOpcion = '';
let ppFileUrl = '';

function ppFormatFecha() {
  const d = new Date();
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return d.getDate() + ' de ' + meses[d.getMonth()] + ' de ' + d.getFullYear();
}

const presupuestoModal = $('#presupuestoModal');
const openPresupuestoModal = () => {
  presupuestoModal.hidden = false;
  $('#ppNote').hidden = true;
  $('#pp-nombre').value = '';
  $('#pp-telefono').value = '';
  $('#pp-fecha').value = ppFormatFecha();
  $('#pp-valor').value = '';
  $('#pp-descripcion').value = '';
  $('#pp-file').value = '';
  $('#pp-file-status').textContent = T[lang].xQuoteNone;
  ppOpcion = '';
  ppFileUrl = '';
  $$('#ppOpciones .seg').forEach((b) => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); });
  if (!vendedoresCatalogoCargado) { vendedoresCatalogoCargado = true; cargarVendedoresCatalogo(); }
  actualizarVisibilidadPromotoresServicio();
};
const closePresupuestoModal = () => { presupuestoModal.hidden = true; };
const svPresupuestoBtn = $('#svPresupuestoBtn');
if (svPresupuestoBtn) {
  svPresupuestoBtn.addEventListener('click', openPresupuestoModal);
  svPresupuestoBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPresupuestoModal(); } });
}
$('#presupuestoClose')?.addEventListener('click', closePresupuestoModal);
$('#presupuestoScrim')?.addEventListener('click', closePresupuestoModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && presupuestoModal && !presupuestoModal.hidden) closePresupuestoModal(); });

$$('#ppOpciones .seg').forEach((b) => b.addEventListener('click', () => {
  if (b.dataset.op === 'servicios-especiales') {
    closePresupuestoModal();
    const dest = document.getElementById('servicios');
    if (dest) dest.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  ppOpcion = b.dataset.op;
  $$('#ppOpciones .seg').forEach((x) => {
    x.classList.toggle('on', x === b);
    x.setAttribute('aria-pressed', String(x === b));
  });
}));

$('#pp-file')?.addEventListener('change', async () => {
  const input = $('#pp-file');
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.type !== 'application/pdf') {
    alert(T[lang].soloArchivosPdf);
    input.value = '';
    return;
  }
  const st = $('#pp-file-status');
  st.textContent = T[lang].subiendoEllipsis;
  try {
    const path = Date.now() + '-' + Math.random().toString(36).slice(2) + '.pdf';
    const { error } = await supabaseClient.storage.from(PRESUP_BUCKET).upload(path, file, { contentType: 'application/pdf' });
    if (error) { st.textContent = T[lang].errorSubirArchivo; return; }
    ppFileUrl = path;
    st.textContent = '✅ ' + T[lang].subidoPrefix + file.name;
  } catch (err) {
    console.error('Error al subir PDF de presupuesto:', err);
    st.textContent = T[lang].errorSubirArchivo;
  }
});

$('#ppSend')?.addEventListener('click', async () => {
  const nombre = $('#pp-nombre')?.value.trim();
  if (!nombre) {
    alert(T[lang].escribeNombreCliente);
    return;
  }
  if (!ppOpcion) {
    alert(T[lang].ppSeleccionaQueDeseas);
    return;
  }
  const row = {
    nombre_cliente: nombre,
    telefono_cliente: $('#pp-telefono')?.value.trim() || null,
    fecha_solicitud: new Date().toISOString().slice(0, 10),
    valor_presupuesto: $('#pp-valor')?.value.trim() || null,
    opcion: ppOpcion,
    descripcion: $('#pp-descripcion')?.value.trim() || null,
    ruta_archivo_pdf: ppFileUrl || null,
    promotor_negocio: $('#pp-promotor')?.value || null
  };

  const { error } = await supabaseClient.from('solicitudes_presupuesto').insert(row);

  if (error) {
    console.error('Error al guardar solicitud de presupuesto:', error);
    alert(T[lang].errorEnviarSolicitud);
    return;
  }

  $('#ppNote').hidden = false;
});

/* Construimos en tu terreno: datos del proyecto + guía de requisitos generada con IA */
const CS_BUCKET = 'terreno-construccion'; // bucket de Supabase Storage — debe crearse como PÚBLICO
let csFiles = []; // { url, name, isPdf }
let csDisenoUrl = '';

function uploadPlainFileToBucket(file, bucket) {
  return new Promise(async (resolve, reject) => {
    try {
      const path = Date.now() + '-' + Math.random().toString(36).slice(2) + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const { error } = await supabaseClient.storage.from(bucket).upload(path, file, { contentType: file.type || 'application/octet-stream' });
      if (error) { reject(error); return; }
      const pub = supabaseClient.storage.from(bucket).getPublicUrl(path);
      resolve(pub.data.publicUrl);
    } catch (err) { reject(err); }
  });
}

function csRenderGrid() {
  const grid = $('#csGrid');
  if (!grid) return;
  grid.innerHTML = '';
  csFiles.forEach((f, i) => {
    const wrap = el('div', 'th');
    if (f.isPdf) {
      const box = el('div');
      box.style.cssText = 'width:100%;height:100%;border-radius:8px;background:#f2f4f7;border:1px solid var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:11px;color:var(--muted);text-align:center;padding:4px;box-sizing:border-box;overflow:hidden';
      box.innerHTML = '📄<br>' + (f.name || 'PDF');
      wrap.appendChild(box);
    } else {
      const img = el('img'); img.src = f.url; img.alt = '';
      wrap.appendChild(img);
    }
    const x = el('button', 'th-x', '×');
    x.type = 'button';
    x.setAttribute('aria-label', T[lang].remove);
    x.addEventListener('click', () => { csFiles.splice(i, 1); csRenderGrid(); });
    wrap.appendChild(x);
    grid.appendChild(wrap);
  });
}

$('#cs-files')?.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files || []);
  e.target.value = '';
  for (const f of files) {
    try {
      if (f.type === 'application/pdf') {
        const url = await uploadPlainFileToBucket(f, CS_BUCKET);
        csFiles.push({ url, name: f.name, isPdf: true });
      } else if (f.type.startsWith('image/')) {
        const url = await uploadImageToBucket(f, CS_BUCKET, 1600);
        csFiles.push({ url, name: f.name, isPdf: false });
      }
    } catch (err) { console.error('Error al subir archivo del terreno:', err); }
  }
  csRenderGrid();
});

const construirModal = $('#construirModal');
const openConstruirModal = () => {
  construirModal.hidden = false;
  $('#csNote').hidden = true;
  $('#cs-valor').value = '';
  $('#cs-nombre').value = '';
  $('#cs-fecha-inicio').value = '';
  $('#cs-que-hacer').value = '';
  $('#cs-m2').value = '';
  $('#cs-descripcion-diseno').value = '';
  $('#cs-files').value = '';
  csFiles = [];
  csRenderGrid();
  csDisenoUrl = '';
  $('#csDisenoStatus').textContent = '';
  $('#csDisenoImg').hidden = true;
  $('#csDisenoImg').src = '';
  $('#csPlanoBox').hidden = true;
  $('#csPlanoBox').innerHTML = '';
  $('#csReqBlock').hidden = true;
  $('#csReqBtn')?.setAttribute('aria-expanded', 'false');
  if (!vendedoresCatalogoCargado) { vendedoresCatalogoCargado = true; cargarVendedoresCatalogo(); }
  actualizarVisibilidadPromotoresServicio();
};
const closeConstruirModal = () => { construirModal.hidden = true; };
const svConstruirBtn = $('#svConstruirBtn');
if (svConstruirBtn) {
  svConstruirBtn.addEventListener('click', openConstruirModal);
  svConstruirBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openConstruirModal(); } });
}
$('#construirClose')?.addEventListener('click', closeConstruirModal);
$('#construirScrim')?.addEventListener('click', closeConstruirModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && construirModal && !construirModal.hidden) closeConstruirModal(); });

$('#csReqBtn')?.addEventListener('click', () => {
  const block = $('#csReqBlock');
  const show = block.hidden;
  block.hidden = !show;
  $('#csReqBtn').setAttribute('aria-expanded', String(show));
  if (show) block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

/* Lee del texto lo que la persona describió (dormitorios, baños, parqueos, niveles, cuarto
   de servicio) para armar un plano esquemático confiable (sin depender de que la IA
   "escriba" texto correcto dentro de una imagen). */
function csParseHabitaciones(text) {
  const t = (text || '').toLowerCase();
  const find = (re) => {
    const m = t.match(re);
    return m ? parseFloat(m[1]) : null;
  };
  const dormitorios = find(/(\d+)\s*(?:dormitorios?|habitaciones?|cuartos?|recamaras?)/) ?? 3;
  const banos = find(/(\d+(?:\.\d+)?)\s*ba[ñn]os?/) ?? 2;
  const parqueos = find(/(\d+)\s*(?:parqueos?|parqueaderos?|garaj(?:e|es))/) ?? 1;
  let niveles = find(/(\d+)\s*(?:niveles?|pisos?|plantas?)/);
  if (niveles === null) niveles = /\bdos\s+(?:niveles?|pisos?|plantas?)\b/.test(t) ? 2 : 1;
  const cuartoServicio = /cuarto de servicio|cuarto de empleada|habitaci[oó]n de servicio/.test(t);
  return {
    dormitorios: Math.max(1, Math.round(dormitorios)),
    banos: Math.max(1, banos),
    parqueos: Math.max(0, Math.round(parqueos)),
    niveles: Math.max(1, Math.min(3, Math.round(niveles))),
    cuartoServicio
  };
}

/* Color por tipo de ambiente, para que el esquema se lea como una planta real. */
function csRoomColor(label) {
  const l = label.toLowerCase();
  if (l.includes('dormitorio')) return '#dbe6f5';
  if (l.includes('baño')) return '#d9f0ec';
  if (l.includes('cocina')) return '#fde8cf';
  if (l.includes('comedor') || l.includes('sala')) return '#f4ead9';
  if (l.includes('servicio')) return '#e3f0da';
  if (l.includes('ingreso')) return '#eef1f4';
  if (l.includes('parqueo')) return '#e7e9ec';
  return '#f2f4f7';
}

/* Parte el texto de una habitación en hasta 2 líneas para que quepa dentro de su celda SVG. */
function csWrapLabel(label) {
  if (label.length <= 12) return [label];
  const words = label.split(' ');
  if (words.length === 1) return [label];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

/* Dibuja un plano esquemático en SVG: celdas con paredes y color por ambiente,
   en vez de simples cajas de texto. */
function csDrawPlanoSVG(rooms) {
  const cols = rooms.length <= 4 ? 2 : 3;
  const cellW = 130;
  const cellH = 92;
  const rows = Math.ceil(rooms.length / cols);
  const w = cols * cellW;
  const hgt = rows * cellH;
  let svg = '<svg viewBox="0 0 ' + w + ' ' + hgt + '" width="100%" style="display:block;background:#fff" xmlns="http://www.w3.org/2000/svg">';
  rooms.forEach((label, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * cellW;
    const y = row * cellH;
    svg += '<rect x="' + x + '" y="' + y + '" width="' + cellW + '" height="' + cellH + '" fill="' + csRoomColor(label) + '" stroke="#071a2f" stroke-width="3"/>';
    const lines = csWrapLabel(label);
    const cy = y + cellH / 2 - (lines.length - 1) * 7;
    lines.forEach((ln, li) => {
      svg += '<text x="' + (x + cellW / 2) + '" y="' + (cy + li * 14) + '" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="600" fill="#10243c" font-family="Figtree, sans-serif">' + ln + '</text>';
    });
  });
  svg += '</svg>';
  return svg;
}

function csRenderPlano(text, m2) {
  const h = csParseHabitaciones(text);
  const banosEnteros = Math.max(1, Math.round(h.banos));

  let nivel1 = ['Sala', 'Comedor', 'Cocina'];
  if (h.cuartoServicio) nivel1.push('Cuarto de servicio');
  nivel1.push('Baño 1');
  nivel1.push('Ingreso');
  for (let i = 1; i <= h.parqueos; i++) nivel1.push('Parqueo ' + i);
  let nivel2 = [];

  if (h.niveles >= 2) {
    for (let i = 1; i <= h.dormitorios; i++) nivel2.push('Dormitorio ' + i);
    for (let i = 2; i <= banosEnteros; i++) nivel2.push('Baño ' + i);
    if (!nivel2.length) nivel2.push('Dormitorio 1');
  } else {
    for (let i = 1; i <= h.dormitorios; i++) nivel1.push('Dormitorio ' + i);
    for (let i = 2; i <= banosEnteros; i++) nivel1.push('Baño ' + i);
  }

  const panel = (titulo, rooms) => {
    let p = '<div style="flex:1 1 240px;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#f7f8fa">';
    p += '<div style="background:#071a2f;color:#e6bd61;text-align:center;font-weight:700;font-size:11.5px;letter-spacing:.04em;padding:8px">' + titulo + '</div>';
    p += csDrawPlanoSVG(rooms);
    p += '</div>';
    return p;
  };

  const sidebar = '<div style="flex:1 1 170px;max-width:220px;background:#071a2f;color:#fff;border-radius:10px;padding:16px;display:flex;flex-direction:column;gap:10px">' +
    '<div style="text-align:center">' +
      '<div style="font-family:Marcellus,Georgia,serif;font-size:19px;color:#e6bd61;letter-spacing:.04em">ARMOPA</div>' +
      '<div style="font-size:8.5px;color:#b9c3d1;letter-spacing:.05em;margin-top:2px">ADMINISTRACIÓN INMOBILIARIA</div>' +
    '</div>' +
    '<div style="font-size:12px;font-weight:700;text-align:center;border-top:1px solid #23344c;border-bottom:1px solid #23344c;padding:8px 0">CONSTRUCCIÓN DE PROPIEDAD</div>' +
    '<div style="display:grid;gap:7px;font-size:12px">' +
      '<div>📐 Área: <b>' + (m2 ? m2 + ' m²' : '—') + '</b></div>' +
      '<div>🏠 Niveles: <b>' + h.niveles + '</b></div>' +
      '<div>🛏️ Habitaciones: <b>' + h.dormitorios + '</b></div>' +
      '<div>🚿 Baños: <b>' + banosEnteros + '</b></div>' +
      '<div>🚗 Parqueos: <b>' + h.parqueos + '</b></div>' +
      '<div>🍳 Cocina: <b>1</b></div>' +
      (h.cuartoServicio ? '<div>🧺 Cuarto de servicio: <b>1</b></div>' : '') +
    '</div>' +
  '</div>';

  let html = '<div style="display:flex;flex-wrap:wrap;gap:12px">';
  html += panel(h.niveles >= 2 ? 'PRIMER NIVEL' : 'DISTRIBUCIÓN', nivel1);
  if (h.niveles >= 2) html += panel('SEGUNDO NIVEL', nivel2);
  html += sidebar;
  html += '</div>';

  html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;text-align:center">' +
    '<div style="flex:1 1 130px;font-size:11px;color:var(--muted)">🛡️<br>Diseño funcional<br>y moderno</div>' +
    '<div style="flex:1 1 130px;font-size:11px;color:var(--muted)">💎<br>Materiales de<br>alta calidad</div>' +
    '<div style="flex:1 1 130px;font-size:11px;color:var(--muted)">🌿<br>Espacios amplios<br>y confortables</div>' +
    '<div style="flex:1 1 130px;font-size:11px;color:var(--muted)">📈<br>Más valor<br>a tu patrimonio</div>' +
  '</div>';

  html += '<p style="font-size:11px;color:#56667a;margin:12px 0 0;line-height:1.5">Plano esquemático generado automáticamente a partir de tu descripción. No es un plano arquitectónico oficial; es una referencia inicial para conversar con nuestro equipo de diseño.</p>';

  const box = $('#csPlanoBox');
  box.innerHTML = html;
  box.hidden = false;
}

/* Genera el plano esquemático (confiable, local) y una vista exterior de referencia con IA
   a través del servicio gratuito Pollinations.ai (no requiere API key ni backend propio). */
$('#csGenerarDisenoBtn')?.addEventListener('click', () => {
  const descripcion = $('#cs-descripcion-diseno')?.value.trim();
  if (!descripcion) {
    alert(T[lang].csDescribePrimero);
    return;
  }
  const queHacer = $('#cs-que-hacer')?.value.trim() || '';
  const m2 = $('#cs-m2')?.value ? Number($('#cs-m2').value) : null;

  csRenderPlano(queHacer + ' ' + descripcion, m2);

  const btn = $('#csGenerarDisenoBtn');
  const status = $('#csDisenoStatus');
  const img = $('#csDisenoImg');
  const prompt = 'Render arquitectónico fotorrealista, vista exterior de día, de la siguiente construcción en Guatemala: ' + descripcion + '. Estilo limpio y realista, sin texto ni marcas de agua.';
  const seed = Math.floor(Math.random() * 1000000);
  const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) + '?width=1024&height=768&nologo=true&seed=' + seed;

  btn.disabled = true;
  status.textContent = T[lang].csGenerandoVista;
  img.hidden = true;

  img.onload = () => {
    status.textContent = T[lang].csVistaGenerada;
    img.hidden = false;
    btn.disabled = false;
  };
  img.onerror = () => {
    status.textContent = T[lang].csErrorGenerarVista;
    btn.disabled = false;
  };

  csDisenoUrl = url;
  img.src = url;
});

$('#csSend')?.addEventListener('click', async () => {
  const nombre = $('#cs-nombre')?.value.trim();
  if (!nombre) {
    alert(T[lang].csEscribeNombreCompleto);
    return;
  }
  const row = {
    nombre_completo: nombre,
    fecha_solicitud: new Date().toISOString().slice(0, 10),
    valor_presupuesto: $('#cs-valor')?.value.trim() || null,
    fecha_inicio_estimada: $('#cs-fecha-inicio')?.value || null,
    descripcion_construccion: $('#cs-que-hacer')?.value.trim() || null,
    metros_cuadrados: $('#cs-m2')?.value ? Number($('#cs-m2').value) : null,
    descripcion_diseno: $('#cs-descripcion-diseno')?.value.trim() || null,
    imagen_diseno_url: csDisenoUrl || null,
    fotos_terreno: csFiles.map((f) => f.url),
    promotor_negocio: $('#cs-promotor')?.value || null
  };

  const { error } = await supabaseClient.from('solicitudes_construccion').insert(row);

  if (error) {
    console.error('Error al guardar solicitud de construcción:', error);
    alert(T[lang].errorEnviarSolicitud);
    return;
  }

  $('#csNote').hidden = false;
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
let heroIdx = 0;         // índice de la foto grande mostrada en el panel de ubicación
let gridOpen = false;    // si la galería de miniaturas (con opción de eliminar) está desplegada
let citySearch = '';      // texto de búsqueda de ciudad en el modal
let descOpen = true;      // si el segmento "Descripción Propiedad" está expandido
let locFilterIdx = null;  // índices (dentro de la ciudad activa) que coinciden con la última búsqueda, o null = mostrar todas
let locQuickSearch = '';  // texto para filtrar rápidamente las ubicaciones dentro de la ciudad activa
const pModal = $('#propModal');

const cityNames = () => Object.keys(data).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
const list = () => { if (cur === null) return []; data[cur] = data[cur] || []; return data[cur]; };
function persistLocalOnly() {
  try { localStorage.setItem(STORE, JSON.stringify({ data })); return true; } catch (e) { return false; }
}
function persist() {
  const c = list()[sel];
  if (c && esAdminOSuperAdmin()) {
    c.estadoFecha = new Date().toISOString();
    c.estadoUsuario = localStorage.getItem(LOGIN_STORE) || '';
    const fechaEl = $('#pEstadoFecha');
    const userEl = $('#pEstadoUsuario');
    if (fechaEl) fechaEl.textContent = formatQBuscarRegFecha(c.estadoFecha);
    if (userEl) userEl.textContent = c.estadoUsuario || '—';
  }
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
function pickLoc(i) { sel = i; vi = 0; heroIdx = 0; gridOpen = false; confirmDel = false; mk = null; descOpen = true; note(''); render(); }
function openCityFromList(name) {
  cur = name; panelView = 'locs'; sel = list().length ? 0 : -1; vi = 0; heroIdx = 0; gridOpen = false; locFilterIdx = null; locQuickSearch = ''; confirmDel = false; descOpen = true;
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
    searchInput.placeholder = t.admBuscarCiudadPh;
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

    const add = el('button', 'btn btn-dark', t.admNuevaCiudad);
    add.type = 'button';
    add.style.width = '100%';
    add.style.marginBottom = '12px';
    add.addEventListener('click', () => openNewCityDialog());
    box.appendChild(add);

    const q = citySearch.trim().toLowerCase();
    const namesToShow = q ? cityNames().filter((n) => n.toLowerCase().includes(q)) : cityNames();

    if (q && !namesToShow.length) {
      const noRes = el('p', '', t.admNoSeEncontraronCiudades);
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
      cam.title = t.admFotoPortada;
      cam.setAttribute('aria-label', t.admFotoPortada);

      const btnUpdate = el('button', 'btn btn-line-dark btn-sm', '✏️');
      btnUpdate.type = 'button';
      btnUpdate.title = t.admActualizar;
      btnUpdate.setAttribute('aria-label', t.admActualizar);
      btnUpdate.addEventListener('click', async (e) => {
        e.stopPropagation();
        const newName = (prompt(t.admNuevoNombreCiudad, name) || '').trim();
        if (!newName || newName === name) return;
        try {
          const { error } = await supabaseClient.from('ciudades_portada').update({ ciudad: newName }).eq('ciudad', name);
          if (error) { note(t.admErrorActualizarCiudad + error.message); return; }
          data[newName] = data[name] || [];
          delete data[name];
          cityCovers[newName] = cityCovers[name];
          delete cityCovers[name];
          if (cur === name) cur = newName;
          persistLocalOnly();
          note(t.admCiudadActualizada);
          buildCityCards();
          renderList();
        } catch (err) { note(t.admErrorActualizarCiudadGenerico); }
      });

      const btnDelete = el('button', 'btn btn-line-dark btn-sm', '🗑️');
      btnDelete.type = 'button';
      btnDelete.title = t.btnEliminar;
      btnDelete.setAttribute('aria-label', t.btnEliminar);
      btnDelete.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm(t.admConfirmEliminarCiudad + name + t.admConfirmEliminarCiudad2)) return;
        try {
          const { error } = await supabaseClient.from('ciudades_portada').delete().eq('ciudad', name);
          if (error) { note(t.admErrorEliminarCiudad + error.message); return; }
          delete data[name];
          delete cityCovers[name];
          if (cur === name) { cur = null; panelView = 'cities'; }
          persistLocalOnly();
          note(t.admCiudadEliminada);
          buildCityCards();
          renderList();
        } catch (err) { note(t.admErrorEliminarCiudadGenerico); }
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
    return;
  }
}

/* Panel con todas las ubicaciones de la ciudad activa: encabezado (volver + contador + buscador) y cuadrícula de pestañas */
function renderLocTabs() {
  const t = T[lang];
  const box = $('#pLocTabs');
  box.innerHTML = '';

  const todas = list();
  const wasLocSearchFocused = document.activeElement && document.activeElement.id === 'locSearchInput';
  const prevSelStart = wasLocSearchFocused ? document.activeElement.selectionStart : null;
  const prevSelEnd = wasLocSearchFocused ? document.activeElement.selectionEnd : null;

  const head = el('div', 'loc-tabs-head');

  const headLeft = el('div', 'loc-tabs-head-l');
  if (estaConectado()) {
    const back = el('button', 'btn btn-line-dark btn-sm loc-back', t.admVolverCiudades);
    back.type = 'button';
    back.addEventListener('click', () => { if (!estaConectado()) return; panelView = 'cities'; cur = null; sel = -1; locFilterIdx = null; locQuickSearch = ''; note(''); render(); });
    headLeft.appendChild(back);
  }
  const count = el('span', 'loc-count', todas.length === 1 ? t.oneLoc : todas.length + ' ' + t.locsWord);
  headLeft.appendChild(count);
  head.appendChild(headLeft);

  if (todas.length > 6) {
    const searchWrap = el('div', 'loc-search-wrap');
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'locSearchInput';
    searchInput.className = 'loc-search-input';
    searchInput.placeholder = t.admBuscarUbicacionPh;
    searchInput.autocomplete = 'off';
    searchInput.value = locQuickSearch;
    searchInput.addEventListener('input', () => {
      locQuickSearch = searchInput.value;
      renderLocTabs();
    });
    searchWrap.appendChild(searchInput);
    head.appendChild(searchWrap);

    if (wasLocSearchFocused) {
      requestAnimationFrame(() => {
        const fresh = $('#locSearchInput');
        if (fresh) {
          fresh.focus();
          if (prevSelStart != null) fresh.setSelectionRange(prevSelStart, prevSelEnd);
        }
      });
    }
  }

  box.appendChild(head);

  const filterBar = $('#pLocFilterBar');
  if (filterBar) {
    filterBar.innerHTML = '';
    if (locFilterIdx) {
      filterBar.hidden = false;
      filterBar.append(el('span', '', t.admResultadosBusqueda + locFilterIdx.length + ')'));
      const clearBtn = el('button', 'loc-filter-clear', t.admVerTodasUbicaciones);
      clearBtn.type = 'button';
      clearBtn.addEventListener('click', () => { locFilterIdx = null; render(); });
      filterBar.appendChild(clearBtn);
    } else {
      filterBar.hidden = true;
    }
  }

  const q = locQuickSearch.trim().toLowerCase();
  const grid = el('div', 'loc-tabs-grid');
  let shown = 0;
  todas.forEach((l, i) => {
    if (locFilterIdx && !locFilterIdx.includes(i)) return;
    if (q) {
      const hay = ((l.name || '') + ' ' + (l.sector || '') + ' ' + (l.zona || '') + ' ' + (l.addr || '')).toLowerCase();
      if (!hay.includes(q)) return;
    }
    shown++;
    const b = el('button', 'loc-tab' + (i === sel ? ' on' : ''));
    b.type = 'button';
    b.append(el('span', '', l.name || t.locDefault), el('small', '', String(l.imgs.length)));
    b.addEventListener('click', () => pickLoc(i));
    grid.appendChild(b);
  });
  if (q && !shown) {
    const noRes = el('p', 'loc-no-res', t.admNoSeEncontraronUbicaciones + locQuickSearch.trim() + '".');
    grid.appendChild(noRes);
  }
  box.appendChild(grid);

  if (!estaConectado()) return;
  const add = el('button', 'btn btn-dark btn-sm loc-add', '+ ' + t.addLoc);
  add.type = 'button';
  add.addEventListener('click', () => {
    if (!estaConectado()) return;
    const l = list();
    l.push({ id: Date.now(), name: t.locDefault + ' ' + (l.length + 1), addr: '', sector: '', zona: '', tipo: '', desc: '', op: 'renta', pRent: '', pSale: '', imgs: [], sPhoto: '', sName: '', sWa: '', estado: 'activa', estadoFecha: '', estadoUsuario: '', vendedorAsignado: '', comisionPorcentaje: '' });
    sel = l.length - 1; vi = 0; heroIdx = 0; gridOpen = false; confirmDel = false; descOpen = true;
    note(persist() ? '' : t.storeErr);
    render();
  });
  box.appendChild(add);
}

function renderEdit() {
  const t = T[lang];
  const l = list();
  const c = l[sel];
  renderLocTabs();
  $('#pLocPanel').hidden = false;
  $('#pEmpty').hidden = !!c;
  $('#pPhotosTop').hidden = !c;
  $('#pDescToggle').hidden = !c;
  $('#pDescToggle').setAttribute('aria-expanded', String(descOpen));
  $('#pForm').hidden = !c || !descOpen;
  if (!c) return;
  const dOp = c.op || '';
  const dShowR = (dOp === 'renta' || dOp === 'ambos') && (c.pRent || '').trim();
  const dShowS = (dOp === 'venta' || dOp === 'ambos') && (c.pSale || '').trim();
  const dParts = [];
  if (dShowR) dParts.push((dOp === 'ambos' ? t.rentView + ' ' : '') + c.pRent.trim());
  if (dShowS) dParts.push((dOp === 'ambos' ? t.saleView + ' ' : '') + c.pSale.trim());
  const dValueEl = $('#pDescValue');
  dValueEl.textContent = dParts.join(' · ');
  dValueEl.hidden = !dParts.length;
  const dSummaryEl = $('#pDescSummary');
  const dText = (c.desc || '').trim();
  dSummaryEl.textContent = dText;
  dSummaryEl.hidden = !dText;
  $('#p-name').value = c.name;
  $('#p-addr').value = c.addr;
  $('#p-sector').value = c.sector || '';
  $('#p-zona').value = c.zona || '';
  $('#p-tipo').value = c.tipo || '';
  fillDatalist($('#pSectorList'), citySuggestions(cur, 'sector', CITY_SECTOR_SEED));
  fillDatalist($('#pZonaList'), citySuggestions(cur, 'zona', CITY_ZONA_SEED));
  fillDatalist($('#pTipoList'), typeSuggestions());
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
  if (!vendedoresCatalogoCargado) { vendedoresCatalogoCargado = true; cargarVendedoresCatalogo(); }
  const locAdminBlock = $('#pLocAdminBlock');
  if (locAdminBlock) {
    locAdminBlock.hidden = !esAdminOSuperAdmin();
    if (!locAdminBlock.hidden) {
      const estadoV = c.estado || 'activa';
      $('#p-estado').value = estadoV;
      const info = ubicEstadoInfo(estadoV);
      const badge = $('#pEstadoBadge');
      badge.textContent = info.l;
      badge.style.background = info.bg;
      badge.style.color = info.fg;
      poblarPSnameSelect(c.sName || c.vendedorAsignado || '');
      $('#p-swa').value = c.sWa || '';
      const puedeEditarVendedorLoc = esSuperAdmin();
      $('#p-sname').disabled = !puedeEditarVendedorLoc;
      $('#p-swa').disabled = !puedeEditarVendedorLoc;
      const sellerSuperAdminHint = $('#sellerSuperAdminHint');
      if (sellerSuperAdminHint) sellerSuperAdminHint.hidden = puedeEditarVendedorLoc;
      if (!clientesCatalogoCargado) { clientesCatalogoCargado = true; cargarClientesCatalogo(); }
      poblarPClienteSelect(c.clienteAsignado || '');
      $('#p-comision').value = c.comisionPorcentaje || '';
      $('#pComisionValor').textContent = formatQ(comisionValorCalc(c));
      $('#pEstadoFecha').textContent = c.estadoFecha ? formatQBuscarRegFecha(c.estadoFecha) : '—';
      $('#pEstadoUsuario').textContent = c.estadoUsuario || '—';
    }
  }
  $('#sAvBtn').hidden = !c.sPhoto;
  $('#sAvatarPh').hidden = !!c.sPhoto;
  if (c.sPhoto) $('#sAvatar').src = c.sPhoto;
  $('#pMap').href = mapUrl(c);
  const del = $('#pDel');
  del.textContent = confirmDel ? t.delSure : t.del;
  del.classList.toggle('on', confirmDel);
  const hasImgs = c.imgs.length > 0;
  $('#pHeroWrap').hidden = !hasImgs;
  $('#pHeroEmpty').hidden = hasImgs;
  if (hasImgs) {
    heroIdx = ((heroIdx % c.imgs.length) + c.imgs.length) % c.imgs.length;
    $('#pHeroImg').src = c.imgs[heroIdx];
    $('#pHeroImg').alt = c.name || '';
    $('#pHeroCount').textContent = c.imgs.length > 1 ? (heroIdx + 1) + ' / ' + c.imgs.length : '';
    const multi = c.imgs.length > 1;
    $('#pHeroPrev').hidden = !multi;
    $('#pHeroNext').hidden = !multi;
  }
  const gridToggle = $('#pGridToggle');
  const hasGridImgs = c.imgs.length > 0;
  gridToggle.hidden = !hasGridImgs;
  gridToggle.setAttribute('aria-expanded', String(gridOpen));
  $('#pGridToggleLabel').textContent = (gridOpen ? 'Ocultar fotos subidas' : 'Ver fotos subidas') + (hasGridImgs ? ' (' + c.imgs.length + ')' : '');
  const grid = $('#pGrid');
  grid.hidden = !hasGridImgs || !gridOpen;
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
  $('#vEdit').hidden = !estaConectado();
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
  let activeChip = null;
  l.forEach((x, i) => {
    const b = el('button', 'chip' + (i === sel ? ' on' : ''), x.name || t.locDefault);
    b.type = 'button';
    b.addEventListener('click', () => pickLoc(i));
    if (i === sel) activeChip = b;
    chips.appendChild(b);
  });
  if (activeChip) activeChip.scrollIntoView({ block: 'nearest', inline: 'center' });
}
$('#vChipsPrev')?.addEventListener('click', () => { $('#vChips').scrollBy({ left: -220, behavior: 'smooth' }); });
$('#vChipsNext')?.addEventListener('click', () => { $('#vChips').scrollBy({ left: 220, behavior: 'smooth' }); });

function render() {
  const t = T[lang];
  if (panelView === 'cities' && !estaConectado()) {
    if (cur) { panelView = 'locs'; mode = 'view'; }
    else { closeProp(); return; }
  }
  if (panelView === 'cities') {
    $('#pTitle').textContent = t.admCiudades;
    $('#pSub').textContent = cityNames().length ? cityNames().length + ' ' + t.admCiudadesSufijo : t.admAgregaPrimeraCiudad;
    $('#pEdit').hidden = false;
    $('#pEdit').classList.remove('locs-mode');
    $('#pLocPanel').hidden = true;
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
  $('#pEdit').classList.toggle('locs-mode', mode === 'edit');
  $('#pViewBox').hidden = mode !== 'view';
  if (mode === 'edit') renderEdit(); else renderView();
  renderMk();
}
function openProp() {
  if (!estaConectado()) { if (typeof openLoginModal === 'function') openLoginModal(); return; }
  panelView = 'cities'; cur = null; mode = 'edit'; confirmDel = false; mk = null; sel = -1; vi = 0; heroIdx = 0; gridOpen = false; locFilterIdx = null;
  citySearch = ''; descOpen = true;
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

/* "Ingreso de Ciudades" en el menú de Administración > Catálogos: abre el
   panel de administración de ciudades/ubicaciones (openProp), empezando en
   la pantalla de ciudades (crear, buscar, editar o eliminar ciudades). */
$('#navAdminIngresoCiudadesBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  openProp();
});

/* "Ingreso de Propiedades": primero solicita elegir una ciudad (diálogo
   propio con buscador), y al elegirla entra directo al panel de
   ubicaciones/propiedades de esa ciudad (openCity), sin pasar por la
   pantalla general de ciudades. */
function openSelectCityForPropsDialog() {
  if (!estaConectado()) { if (typeof openLoginModal === 'function') openLoginModal(); return; }
  const t = T[lang];
  const overlay = el('div', 'ncw-overlay');
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(3,12,22,.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '200', padding: '20px'
  });

  const card = el('div', 'ncw-card');
  Object.assign(card.style, {
    background: '#fff', borderRadius: '16px', padding: '26px', width: 'min(420px, 100%)',
    maxHeight: '80vh', boxShadow: '0 24px 70px rgba(0,0,0,.4)', display: 'flex', flexDirection: 'column', gap: '14px'
  });

  const title = el('h3', '', t.admIngresoPropiedadesTitulo);
  title.style.margin = '0';
  card.appendChild(title);

  const sub = el('p', '', t.admEnQueCiudadPropiedades);
  sub.style.cssText = 'margin:0;color:var(--muted);font-size:13.5px';
  card.appendChild(sub);

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'cq-input';
  searchInput.placeholder = t.admBuscarCiudadPh;
  searchInput.autocomplete = 'off';
  card.appendChild(searchInput);

  const listWrap = el('div', '');
  listWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;overflow:auto;max-height:260px';
  card.appendChild(listWrap);

  function closeDialog() { overlay.remove(); }

  function renderCities() {
    const q = searchInput.value.trim().toLowerCase();
    const names = cityNames().filter((n) => !q || n.toLowerCase().includes(q));
    listWrap.innerHTML = '';
    if (!names.length) {
      const noRes = el('p', '', t.admNoSeEncontraronCiudades);
      noRes.style.cssText = 'color:var(--muted);font-size:13px;margin:4px 0';
      listWrap.appendChild(noRes);
      return;
    }
    names.forEach((name) => {
      const b = el('button', 'li', '');
      b.type = 'button';
      b.append(el('span', '', name), el('small', '', String((data[name] || []).length)));
      b.addEventListener('click', () => {
        closeDialog();
        openCity(name);
      });
      listWrap.appendChild(b);
    });
  }
  searchInput.addEventListener('input', renderCities);
  renderCities();

  const btnRow = el('div', '');
  btnRow.style.cssText = 'display:flex;gap:10px;justify-content:space-between;align-items:center;margin-top:4px';
  const newCityBtn = el('button', 'btn btn-line-dark btn-sm', t.admNuevaCiudad);
  newCityBtn.type = 'button';
  newCityBtn.addEventListener('click', () => { closeDialog(); openNewCityDialog(); });
  const cancelBtn = el('button', 'btn btn-line-dark', t.btnCancelar);
  cancelBtn.type = 'button';
  cancelBtn.addEventListener('click', closeDialog);
  btnRow.append(newCityBtn, cancelBtn);
  card.appendChild(btnRow);

  overlay.appendChild(card);
  document.body.appendChild(overlay);
  searchInput.focus();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDialog(); });
}
$('#navAdminIngresoPropiedadesBtn')?.addEventListener('click', () => {
  cerrarNavAdminMenu();
  navwrap.classList.remove('open');
  openSelectCityForPropsDialog();
});

/* Datos para precalificar un préstamo (Gestión de Préstamos Bancarios) */
(function () {
  const btn = $('#preqBtn'), box = $('#preqBox'), hide = $('#preqHide');
  if (!btn || !box || !hide) return;
  btn.addEventListener('click', () => { box.hidden = !box.hidden; });
  hide.addEventListener('click', () => { box.hidden = true; });
})();

/* Barra de búsqueda: buscar propiedades por Ciudad, Sector y Zona */
const cityQuickMenu = $('#cityQuickMenu');

/* Listas base de sectores y zonas conocidas por ciudad (semilla), combinadas
   dinámicamente con los sectores/zonas que ya se han usado en las ubicaciones
   guardadas de cada ciudad, para armar una sugerencia inteligente por ciudad. */
const CITY_ZONA_SEED = {
  'Ciudad de Guatemala': ['Zona 1', 'Zona 2', 'Zona 4', 'Zona 9', 'Zona 10', 'Zona 11', 'Zona 13', 'Zona 14', 'Zona 15', 'Zona 16'],
  'Antigua Guatemala': ['Centro Histórico', 'San Pedro El Panorama', 'Santa Ana', 'Santa Lucía Milpas Altas', 'San Bartolomé Becerra'],
  'Lago de Atitlán': ['Panajachel', 'San Pedro La Laguna', 'Santiago Atitlán', 'San Marcos La Laguna'],
  'Petén': ['Flores', 'Santa Elena', 'San Benito', 'San Andrés']
};
const CITY_SECTOR_SEED = {
  'Ciudad de Guatemala': ['Cayalá', 'Vista Hermosa', 'Oakland', 'Las Charcas', 'San Isidro', 'Lourdes'],
  'Antigua Guatemala': ['Cayalá', 'Panorama', 'San Cristóbal El Bajo', 'San Cristóbal El Alto'],
  'Lago de Atitlán': ['Centro', 'Jaibalito', 'Tzununá'],
  'Petén': ['Centro', 'Malecón']
};
function citySuggestions(city, field, seed) {
  const fromData = new Set((data[city] || []).map((l) => (l[field] || '').trim()).filter(Boolean));
  (seed[city] || []).forEach((v) => fromData.add(v));
  return Array.from(fromData).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

/* Tipos de propiedad: una sola lista combinada con residencial, comercial y
   los tipos de finca típicos de Guatemala. No depende de la ciudad. */
const TIPO_PROPIEDAD_SEED = [
  // Residencial
  'Casa', 'Apartamento', 'Condominio', 'Casa en condominio', 'Townhouse', 'Dúplex', 'Penthouse', 'Estudio / Loft', 'Casa de campo', 'Cabaña',
  // Comercial
  'Local comercial', 'Oficina', 'Edificio comercial', 'Bodega / Nave industrial', 'Terreno comercial', 'Centro comercial / Plaza comercial', 'Hotel', 'Restaurante / Local gastronómico', 'Gasolinera', 'Parqueo / Estacionamiento',
  // Terrenos
  'Terreno urbano', 'Terreno rústico',
  // Fincas (Guatemala)
  'Finca agrícola', 'Finca cafetalera', 'Finca cañera', 'Finca ganadera', 'Finca de recreo', 'Finca hortícola / frutícola', 'Finca forestal', 'Finca cardamomera', 'Finca hulera', 'Finca bananera', 'Finca avícola'
];
function typeSuggestions() {
  const extra = new Set();
  Object.keys(data).forEach((city) => {
    (data[city] || []).forEach((l) => {
      const v = (l.tipo || '').trim();
      if (v && !TIPO_PROPIEDAD_SEED.includes(v)) extra.add(v);
    });
  });
  return TIPO_PROPIEDAD_SEED.concat(Array.from(extra).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })));
}
/* Vendedores ya existentes en la base de datos: se arman a partir de los
   nombres de vendedor ya guardados (contacto público y vendedor asignado)
   en cualquier ubicación de cualquier ciudad, para poder elegirlos en vez
   de volver a escribirlos. */
function vendedoresConocidos() {
  const set = new Set();
  Object.keys(data).forEach((city) => {
    (data[city] || []).forEach((l) => {
      const v1 = (l.sName || '').trim();
      if (v1) set.add(v1);
      const v2 = (l.vendedorAsignado || '').trim();
      if (v2) set.add(v2);
    });
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}
function fillDatalist(listEl, values) {
  listEl.innerHTML = '';
  values.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v;
    listEl.appendChild(opt);
  });
}
function openNewCityDialog() {
  const t = T[lang];
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

  const title = el('h3', '', t.admNuevaCiudad.replace(/^\+\s*/, ''));
  title.style.margin = '0';
  card.appendChild(title);

  const nameLabel = el('label', 'cq-label', t.admNombreCiudadLbl);
  card.appendChild(nameLabel);
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'cq-input';
  nameInput.placeholder = t.admNombreCiudadPh;
  card.appendChild(nameInput);

  const photoLabel = el('label', 'cq-label', t.admFotoPortadaOpcional);
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
  photoBtnLabel.textContent = t.admElegirFotoHtml;
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
  const cancelBtn = el('button', 'btn btn-line-dark', t.btnCancelar);
  cancelBtn.type = 'button';
  const saveBtn = el('button', 'btn btn-dark', t.btnGuardar);
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
    if (!name) { errMsg.textContent = t.admEscribeNombreCiudad; nameInput.focus(); return; }
    saveBtn.disabled = true;
    saveBtn.textContent = t.admGuardandoEllipsis;
    if (!data[name]) data[name] = [];
    const file = fileInput.files && fileInput.files[0];
    let photoUrl = '';
    try {
      if (file) {
        photoUrl = await uploadPropFile(file, 1200);
        cityCovers[name] = photoUrl;
      }
      const { error } = await supabaseClient.from('ciudades_portada').upsert({ ciudad: name, foto: photoUrl || null });
      if (error) { errMsg.textContent = t.admErrorGuardarGenerico + error.message; saveBtn.disabled = false; saveBtn.textContent = t.btnGuardar; return; }
      note(file ? t.admCiudadYFotoGuardadas : t.admCiudadAgregada);
    } catch (err) {
      errMsg.textContent = t.admErrorGuardarCiudad;
      saveBtn.disabled = false;
      saveBtn.textContent = t.btnGuardar;
      return;
    }
    cur = name; panelView = 'locs'; sel = list().length ? 0 : -1; vi = 0; heroIdx = 0; gridOpen = false; confirmDel = false;
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

/* Precio base de una ubicación para calcular su comisión: el de venta si se
   vende (o si aplica ambos y hay precio de venta), si no el de alquiler. */
function precioBaseComision(c) {
  const op = c.op || 'renta';
  if (op === 'venta') return extractNumber(c.pSale);
  if (op === 'renta') return extractNumber(c.pRent);
  // 'ambos': prioriza el precio de venta si existe
  return extractNumber(c.pSale) ?? extractNumber(c.pRent);
}

/* Valor de comisión = % de comisión × precio base de la ubicación. Se
   calcula siempre al vuelo (no se guarda), a partir del % que sí se guarda. */
function comisionValorCalc(c) {
  const pct = extractNumber(c.comisionPorcentaje);
  const precio = precioBaseComision(c);
  if (pct == null || precio == null) return null;
  return (pct / 100) * precio;
}

function formatQ(n) {
  if (n == null || !Number.isFinite(n)) return '—';
  return 'Q ' + n.toLocaleString('es-GT', { maximumFractionDigits: 2 });
}
function buildSearchMenu() {
  if (!cityQuickMenu) return;
  const prevCity = cityQuickMenu.querySelector('.cq-select') ? cityQuickMenu.querySelector('.cq-select').value : '';
  cityQuickMenu.innerHTML = '';
  const names = cityNames();
  const row = el('div', 'cq-row');

  const cityField = el('div', 'cq-field cq-field-city');
  cityField.appendChild(el('label', 'cq-label', 'Ciudad'));
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
    if (prevCity && names.includes(prevCity)) citySelect.value = prevCity;
  }
  cityField.appendChild(citySelect);
  row.appendChild(cityField);

  const sectorList = document.createElement('datalist');
  sectorList.id = 'cqSectorList';
  const zonaList = document.createElement('datalist');
  zonaList.id = 'cqZonaList';

  const sectorField = el('div', 'cq-field');
  sectorField.appendChild(el('label', 'cq-label', 'Sector'));
  const sectorInput = document.createElement('input');
  sectorInput.type = 'text';
  sectorInput.className = 'cq-input cq-input-list';
  sectorInput.placeholder = 'Ej. Cayalá, Vista Hermosa...';
  sectorInput.setAttribute('list', 'cqSectorList');
  sectorField.appendChild(sectorInput);
  sectorField.appendChild(sectorList);
  row.appendChild(sectorField);

  const tipoList = document.createElement('datalist');
  tipoList.id = 'cqTipoList';
  fillDatalist(tipoList, typeSuggestions());

  const tipoField = el('div', 'cq-field');
  tipoField.appendChild(el('label', 'cq-label', 'Tipo de propiedad'));
  const tipoInput = document.createElement('input');
  tipoInput.type = 'text';
  tipoInput.className = 'cq-input cq-input-list';
  tipoInput.placeholder = 'Ej. Casa, Local comercial, Finca cafetalera...';
  tipoInput.setAttribute('list', 'cqTipoList');
  tipoField.appendChild(tipoInput);
  tipoField.appendChild(tipoList);
  row.appendChild(tipoField);

  const zonaField = el('div', 'cq-field');
  zonaField.appendChild(el('label', 'cq-label', 'Zona'));
  const zonaInput = document.createElement('input');
  zonaInput.type = 'text';
  zonaInput.className = 'cq-input cq-input-list';
  zonaInput.placeholder = 'Ej. Zona 10, Antigua...';
  zonaInput.setAttribute('list', 'cqZonaList');
  zonaField.appendChild(zonaInput);
  zonaField.appendChild(zonaList);
  row.appendChild(zonaField);

  function refreshCqLists() {
    const city = citySelect.value;
    fillDatalist(sectorList, citySuggestions(city, 'sector', CITY_SECTOR_SEED));
    fillDatalist(zonaList, citySuggestions(city, 'zona', CITY_ZONA_SEED));
  }
  citySelect.addEventListener('change', refreshCqLists);
  refreshCqLists();

  const specsField = el('div', 'cq-field cq-field-specs');
  specsField.appendChild(el('label', 'cq-label', 'Especificaciones de propiedad'));
  const specsInput = document.createElement('input');
  specsInput.type = 'text';
  specsInput.className = 'cq-input';
  specsInput.placeholder = 'Ej. 150 m², 3 habitaciones, piscina...';
  specsField.appendChild(specsInput);
  row.appendChild(specsField);

  const budgetField = el('div', 'cq-field');
  budgetField.appendChild(el('label', 'cq-label', 'Presupuesto estimado (Q)'));
  const budgetInput = document.createElement('input');
  budgetInput.type = 'text';
  budgetInput.className = 'cq-input';
  budgetInput.placeholder = 'Ej. 500,000';
  budgetInput.inputMode = 'decimal';
  budgetField.appendChild(budgetInput);
  row.appendChild(budgetField);

  const searchBtn = el('button', 'btn btn-dark cq-search-btn', 'Buscar');
  searchBtn.type = 'button';
  row.appendChild(searchBtn);

  cityQuickMenu.appendChild(row);

  const results = el('div', 'cq-results');
  cityQuickMenu.appendChild(results);

  searchBtn.addEventListener('click', () => {
    results.innerHTML = '';
    const city = citySelect.value;
    if (!city) return;
    const zonaQ = zonaInput.value.trim().toLowerCase();
    const sectorQ = sectorInput.value.trim().toLowerCase();
    const tipoQ = tipoInput.value.trim().toLowerCase();
    const specsQ = specsInput.value.trim().toLowerCase();
    const budgetNum = extractNumber(budgetInput.value);
    const matches = (data[city] || [])
      .map((l, i) => ({ l, i }))
      .filter(({ l }) => {
        const addrTxt = (l.addr || '').toLowerCase();
        const zonaTxt = ((l.zona || '') + ' ' + addrTxt).toLowerCase();
        const sectorTxt = ((l.sector || '') + ' ' + addrTxt).toLowerCase();
        const tipoTxt = ((l.tipo || '') + ' ' + (l.desc || '')).toLowerCase();
        const okZona = !zonaQ || zonaTxt.includes(zonaQ);
        const okSector = !sectorQ || sectorTxt.includes(sectorQ);
        const okTipo = !tipoQ || tipoTxt.includes(tipoQ);
        const okSpecs = !specsQ || (l.desc || '').toLowerCase().includes(specsQ);
        let okBudget = true;
        if (budgetNum != null) {
          const prices = [];
          if (l.op === 'renta' || l.op === 'ambos' || !l.op) { const r = extractNumber(l.pRent); if (r != null) prices.push(r); }
          if (l.op === 'venta' || l.op === 'ambos' || !l.op) { const s = extractNumber(l.pSale); if (s != null) prices.push(s); }
          okBudget = prices.length > 0 && prices.some((p) => p <= budgetNum);
        }
        return okZona && okSector && okTipo && okSpecs && okBudget;
      });
    if (!matches.length) {
      results.appendChild(el('div', 'cq-empty', 'No se encontraron ubicaciones con esos criterios.'));
      return;
    }
    locFilterIdx = matches.map(({ i }) => i);
    closeBuscarPropModal();
    openLocationDirect(city, matches[0].i);
  });
}
buildSearchMenu();

/* Modal "Buscar propiedades": al inicio solo se ve el botón; al presionarlo
   se abre este modal con el formulario completo de búsqueda. */
const buscarPropModal = $('#buscarPropModal');
const openBuscarPropModal = () => { if (buscarPropModal) buscarPropModal.hidden = false; };
const closeBuscarPropModal = () => { if (buscarPropModal) buscarPropModal.hidden = true; };
$('#abrirBuscarPropBtn')?.addEventListener('click', openBuscarPropModal);
$('#buscarPropClose')?.addEventListener('click', closeBuscarPropModal);
$('#buscarPropScrim')?.addEventListener('click', closeBuscarPropModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && buscarPropModal && !buscarPropModal.hidden) closeBuscarPropModal(); });

$('#pClose').addEventListener('click', closeProp);
$('#pScrim').addEventListener('click', closeProp);
$('#p-name').addEventListener('input', () => {
  const c = list()[sel]; if (!c) return;
  c.name = $('#p-name').value;
  note(persist() ? '' : T[lang].storeErr);
  renderLocTabs();
});
$('#pDescToggle').addEventListener('click', () => {
  descOpen = !descOpen;
  renderEdit();
});
$('#pGridToggle').addEventListener('click', () => {
  gridOpen = !gridOpen;
  renderEdit();
});
$('#p-addr').addEventListener('input', () => {
  const c = list()[sel]; if (!c) return;
  c.addr = $('#p-addr').value;
  note(persist() ? '' : T[lang].storeErr);
  $('#pMap').href = mapUrl(c);
});
$('#p-sector').addEventListener('input', () => {
  const c = list()[sel]; if (!c) return;
  c.sector = $('#p-sector').value;
  note(persist() ? '' : T[lang].storeErr);
});
$('#p-zona').addEventListener('input', () => {
  const c = list()[sel]; if (!c) return;
  c.zona = $('#p-zona').value;
  note(persist() ? '' : T[lang].storeErr);
});
$('#p-tipo').addEventListener('input', () => {
  const c = list()[sel]; if (!c) return;
  c.tipo = $('#p-tipo').value;
  note(persist() ? '' : T[lang].storeErr);
});
$('#p-desc').addEventListener('input', () => {
  const c = list()[sel]; if (!c) return;
  c.desc = $('#p-desc').value;
  note(persist() ? '' : T[lang].storeErr);
});
/* "Nombre del vendedor" es ahora una lista de los vendedores de
   Administración > Vendedores (ya no texto libre), así que cada selección
   siempre corresponde con uno de ellos: se guarda su nombre y, de una
   vez, se insertan su WhatsApp y su foto automáticamente (pisando lo que
   hubiera antes en esta ubicación, porque es justo lo que se acaba de
   elegir). */
$('#p-sname').addEventListener('change', () => {
  const c = list()[sel]; if (!c || !esSuperAdmin()) return;
  c.sName = $('#p-sname').value;
  c.vendedorAsignado = c.sName;
  const nombre = c.sName.trim();
  const match = nombre ? vendedoresCatalogo.find((v) => (v.nombre || '').trim() === nombre) : null;
  if (match) {
    c.sWa = match.telefono || '';
    c.sPhoto = match.foto_url || '';
  }
  note(persist() ? T[lang].saved : T[lang].storeErr);
  renderEdit();
});
$('#p-swa').addEventListener('input', () => {
  const c = list()[sel]; if (!c || !esSuperAdmin()) return;
  c.sWa = $('#p-swa').value;
  note(persist() ? '' : T[lang].storeErr);
});
$('#p-estado')?.addEventListener('change', () => {
  const c = list()[sel]; if (!c) return;
  c.estado = $('#p-estado').value;
  c.estadoFecha = new Date().toISOString();
  c.estadoUsuario = localStorage.getItem(LOGIN_STORE) || '';
  note(persist() ? '' : T[lang].storeErr);
  renderEdit();
});
$('#p-cliente-asignado')?.addEventListener('change', () => {
  const c = list()[sel]; if (!c) return;
  c.clienteAsignado = $('#p-cliente-asignado').value;
  note(persist() ? '' : T[lang].storeErr);
});
$('#p-comision')?.addEventListener('input', () => {
  const c = list()[sel]; if (!c) return;
  c.comisionPorcentaje = $('#p-comision').value;
  const valorEl = $('#pComisionValor');
  if (valorEl) valorEl.textContent = formatQ(comisionValorCalc(c));
  note(persist() ? '' : T[lang].storeErr);
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
function paintMkCard(ids, e) {
  $(ids.box).hidden = false;
  const bl = $(ids.blocks);
  bl.innerHTML = '';
  e.blocks.forEach((b) => {
    const row = el('div', 'mk-b');
    row.append(el('span', 'mk-l', b.label), el('span', 'amt', b.range), el('span', 'mk-u', b.usd));
    bl.appendChild(row);
  });
  mkList(ids.lines, e.lines);
  mkList(ids.sim, e.similar);
  mkList(ids.aro, e.around);
  $(ids.simH).hidden = $(ids.sim).hidden = !e.hasSimilar;
  $(ids.aroH).hidden = $(ids.aro).hidden = !e.hasAround;
  $(ids.conf).textContent = e.conf;
  if (ids.useRow) $(ids.useRow).hidden = !e.hasFill;
  $(ids.notes).textContent = e.notes;
}
const MK_IDS_EDIT = { box: '#pMk', blocks: '#pMkBlocks', lines: '#pMkLines', simH: '#pMkSimH', sim: '#pMkSim', aroH: '#pMkAroH', aro: '#pMkAro', conf: '#pMkConf', notes: '#pMkNotes', useRow: '#pMkUseRow' };
const MK_IDS_VIEW = { box: '#vMk', blocks: '#vMkBlocks', lines: '#vMkLines', simH: '#vMkSimH', sim: '#vMkSim', aroH: '#vMkAroH', aro: '#vMkAro', conf: '#vMkConf', notes: '#vMkNotes' };
function renderMk() {
  const c = cur !== null ? list()[sel] : null;
  const active = !!(mk && c && mk.key === cur + '-' + sel);
  if (active && mode === 'edit') paintMkCard(MK_IDS_EDIT, marketEstimate(cur, mk.in, lang));
  else $('#pMk').hidden = true;
  if (active && mode === 'view') paintMkCard(MK_IDS_VIEW, marketEstimate(cur, mk.in, lang));
  else $('#vMk').hidden = true;
}
function abrirCostosAlrededor() {
  const c = list()[sel]; if (!c) return;
  mk = { key: cur + '-' + sel, in: { op: c.op || '', name: c.name || '', addr: c.addr || '', desc: c.desc || '' } };
  renderMk();
}
$('#pMkBtn').addEventListener('click', abrirCostosAlrededor);
$('#vMkBtn').addEventListener('click', abrirCostosAlrededor);
$('#pMkHide').addEventListener('click', () => { mk = null; renderMk(); });
$('#vMkHide').addEventListener('click', () => { mk = null; renderMk(); });
$('#pMkUse').addEventListener('click', () => {
  const c = list()[sel]; if (!c || !mk) return;
  const e = marketEstimate(cur, mk.in, lang);
  if (e.fill.rent) c.pRent = e.fill.rent;
  if (e.fill.sale) c.pSale = e.fill.sale;
  note(persist() ? T[lang].saved : T[lang].storeErr);
  renderEdit();
  renderMk();
});
$('#pView').addEventListener('click', () => { mode = 'view'; vi = 0; note(''); render(); });
$('#pHeroBtn').addEventListener('click', () => { mode = 'view'; vi = heroIdx; note(''); render(); });
$('#pHeroPrev').addEventListener('click', (e) => {
  e.stopPropagation();
  const c = list()[sel];
  if (!c || !c.imgs.length) return;
  heroIdx = (heroIdx - 1 + c.imgs.length) % c.imgs.length;
  renderEdit();
});
$('#pHeroNext').addEventListener('click', (e) => {
  e.stopPropagation();
  const c = list()[sel];
  if (!c || !c.imgs.length) return;
  heroIdx = (heroIdx + 1) % c.imgs.length;
  renderEdit();
});
$('#vEdit').addEventListener('click', () => { if (!estaConectado()) return; mode = 'edit'; render(); });
$('#pDel').addEventListener('click', () => {
  if (!confirmDel) { confirmDel = true; renderEdit(); return; }
  const removed = list()[sel];
  const cityAtDelete = cur;
  list().splice(sel, 1);
  sel = Math.max(0, sel - 1); confirmDel = false; vi = 0; heroIdx = 0; gridOpen = false;
  note(persist() ? T[lang].saved : T[lang].storeErr);
  render();
  if (removed && cityAtDelete) {
    supabaseClient.from('propiedades').delete().eq('ciudad', cityAtDelete).eq('local_id', removed.id)
      .then(({ error }) => { if (error) console.error('Error al borrar en Supabase:', error); });
  }
});
$('#pSaveTop').addEventListener('click', () => saveLocNow('Ubicación guardada con éxito.'));
$('#pUpdateTop').addEventListener('click', () => saveLocNow('Ubicación actualizada con éxito.'));
$('#pLocAdminUpdate')?.addEventListener('click', () => saveLocNow('Ubicación actualizada con éxito.'));
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
const QUOTES_BUCKET = 'cotizaciones'; // bucket de Supabase Storage — debe crearse como PRIVADO
let xd = {};
try { xd = JSON.parse(localStorage.getItem(XKEY) || 'null') || {}; } catch (e) {}
let xo = -1;
const xget = (i) => (xd[i] = xd[i] || { need: '', addr: '', time: '', start: '', prio: '', imgs: [], main: 0, cotPdf: '', cotName: '', cotDate: '' });
const fmtDate = (iso) => { if (!iso) return ''; const [y, m, dd] = iso.split('-').map(Number); return new Date(y, m - 1, dd).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-GT', { day: 'numeric', month: 'long', year: 'numeric' }); };
(() => { const dn = new Date(); const min = dn.getFullYear() + '-' + String(dn.getMonth() + 1).padStart(2, '0') + '-' + String(dn.getDate()).padStart(2, '0'); $$('.xs').forEach((x) => { x.min = min; }); })();
const xsave = () => { try { localStorage.setItem(XKEY, JSON.stringify(xd, (k, v) => (k === 'estIn' || k === 'est' ? undefined : v))); return true; } catch (e) { return false; } };
const xfilled = (i) => { const d = xd[i]; return !!(d && ((d.need || '').trim() || (d.addr || '').trim() || (d.time || '').trim() || d.start || d.prio || (d.imgs || []).length || d.cotPdf || d.cotDate)); };

/* Resumen de cotización: tipo de servicio, número correlativo y fecha */
let currentCotizacionId = null;
const currentCotizacionDate = new Date();
/* Registro de la cotización como solicitud(es) de servicio formales (Administrador /
   Super administrador): un registro por cada servicio marcado en la cotización,
   indexado por idx de servicio (0..8). Se reinicia con cada cotización nueva. */
let qSolRegistros = {};
let qSolClienteSel = null; // { usuario, codigo }
function refreshQuoteSummary() {
  const t = T[lang];
  const el = $('#qSvcTypeVal');
  if (!el) return;
  const names = t.ext.filter((name, i) => xfilled(i));
  el.textContent = names.length ? names.join(', ') : t.qNoSvc;
  const dateEl = $('#qQuoteDateVal');
  if (dateEl) dateEl.textContent = currentCotizacionDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-GT', { day: 'numeric', month: 'long', year: 'numeric' });
}
async function initCotizacionNumber() {
  try {
    const { data, error } = await supabaseClient.from('cotizaciones').insert({}).select('id').single();
    if (error || !data) return;
    currentCotizacionId = data.id;
    qSolRegistros = {};
    qSolClienteSel = null;
    const numEl = $('#qNumVal');
    if (numEl) numEl.textContent = 'COT-' + String(data.id).padStart(6, '0');
    const qSolInfoEl = $('#qSolClienteInfo');
    if (qSolInfoEl) { qSolInfoEl.hidden = true; qSolInfoEl.textContent = ''; }
    const qSolClienteInput = $('#qSol-cliente-usuario');
    if (qSolClienteInput) qSolClienteInput.value = '';
    const qSolListEl = $('#qSolList');
    if (qSolListEl) { qSolListEl.innerHTML = ''; qSolListEl.hidden = true; }
  } catch (e) { /* silencioso: si falla, el número simplemente queda en "—" */ }
}
initCotizacionNumber();
refreshQuoteSummary();
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
    x.addEventListener('click', () => { d.imgs.splice(k, 1); d.main = 0; xsave(); xImgs(i); c.querySelector('.ex-dot').hidden = !xfilled(i); refreshQuoteSummary(); });
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
    $('#xa-' + i).value = d.addr || '';
    $('#xn-' + i).value = d.need || '';
    $('#xt-' + i).value = d.time || '';
    $('#xs-' + i).value = d.start || '';
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
  $('#xa-' + i).addEventListener('input', (e) => { xget(i).addr = e.target.value; xsave(); c.querySelector('.ex-dot').hidden = !xfilled(i); refreshQuoteSummary(); });
  $('#xn-' + i).addEventListener('input', (e) => { xget(i).need = e.target.value; xsave(); c.querySelector('.ex-dot').hidden = !xfilled(i); refreshQuoteSummary(); });
  $('#xt-' + i).addEventListener('input', (e) => { xget(i).time = e.target.value; xsave(); c.querySelector('.ex-dot').hidden = !xfilled(i); refreshQuoteSummary(); });
  c.querySelectorAll('.seg').forEach((b) => b.addEventListener('click', () => {
    const d = xget(i);
    d.prio = d.prio === b.dataset.prio ? '' : b.dataset.prio;
    xsave();
    xRender(i);
    refreshQuoteSummary();
  }));
  c.querySelector('.x-estbtn').addEventListener('click', () => { const d = xget(i); d.estIn = { need: d.need || '', time: d.time || '', prio: d.prio || '' }; xEst(i); });
  c.querySelector('.x-est-x').addEventListener('click', () => { xget(i).estIn = null; xEst(i); });
  $('#xs-' + i).addEventListener('input', (e) => { xget(i).start = e.target.value; xsave(); c.querySelector('.ex-dot').hidden = !xfilled(i); refreshQuoteSummary(); });
  $('#xqGoto-' + i).addEventListener('click', () => {
    const dest = document.getElementById('quote');
    if (dest) dest.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  c.querySelector('#xf-' + i).addEventListener('change', async (e) => {
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
    const need = (d.need || '').trim(), addr = (d.addr || '').trim(), time = (d.time || '').trim(), start = d.start || '', prio = d.prio || '', n = (d.imgs || []).length, cot = d.cotPdf || '', cotDate = d.cotDate || '';
    if (!need && !addr && !time && !start && !prio && !n && !d.estIn && !cot && !cotDate) return;
    const parts = [];
    if (addr) parts.push(t.qMsgAddrSvc + addr);
    if (need) parts.push(need);
    if (prio) parts.push(t.qMsgPrio + { alta: t.xPrioAlta, media: t.xPrioMedia, baja: t.xPrioBaja }[prio]);
    if (time) parts.push(t.qMsgTime + time);
    if (start) parts.push(t.qMsgStart + fmtDate(start));
    if (d.estIn) parts.push(t.qMsgEst + estimate(i, d.estIn, lang).range);
    if (n) parts.push(t.qMsgImgs.replace('{n}', n));
    if (cot) parts.push(t.qMsgQuote + (d.cotName || 'PDF') + (cotDate ? ' (' + t.xQuoteDate + ': ' + fmtDate(cotDate) + ')' : ''));
    lines.push('- ' + name + ': ' + parts.join(' | '));
  });
  return lines.length ? '\n\n' + t.qMsgSvc + '\n' + lines.join('\n') : '';
}

/* Arma la lista desplegable de "Promotor de negocio" del formulario de
   "Solicitar cotización" a partir del catálogo de Administración >
   Vendedores, igual que en el bloque de Vendedor de Propiedades. */
function poblarQPromotorSelect(nombreActual) {
  const sel = $('#q-promotor');
  if (!sel) return;
  const prev = nombreActual != null ? nombreActual : sel.value;
  sel.innerHTML = '';
  const optVacio = document.createElement('option');
  optVacio.value = ''; optVacio.textContent = T[lang].qPromotorPh;
  sel.appendChild(optVacio);
  vendedoresCatalogo.forEach((v) => {
    const nombre = (v.nombre || '').trim();
    if (!nombre) return;
    const opt = document.createElement('option');
    opt.value = nombre; opt.textContent = nombre;
    sel.appendChild(opt);
  });
  if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
}

/* Arma un <select> de "Promotor de Negocios" a partir del catálogo de
   Vendedores. Se reutiliza en las pantallas de "Adaptamos tu presupuesto",
   "Remodelamos tu propiedad" y "Construimos en tu terreno". */
function poblarSelectPromotorNegocios(selectEl) {
  if (!selectEl) return;
  const prev = selectEl.value;
  selectEl.innerHTML = '';
  const optVacio = document.createElement('option');
  optVacio.value = ''; optVacio.textContent = 'Selecciona un promotor';
  selectEl.appendChild(optVacio);
  vendedoresCatalogo.forEach((v) => {
    const nombre = (v.nombre || '').trim();
    if (!nombre) return;
    const opt = document.createElement('option');
    opt.value = nombre; opt.textContent = nombre;
    selectEl.appendChild(opt);
  });
  if (prev && [...selectEl.options].some((o) => o.value === prev)) selectEl.value = prev;
}

/* El "Promotor de Negocios" de estas tres pantallas de Servicios solo lo ve
   y administra el Administrador o el Super Administrador; para el público
   general estos campos quedan ocultos. */
function actualizarVisibilidadPromotoresServicio() {
  const puede = esAdminOSuperAdmin();
  [
    ['#frPromotorField', '#fr-promotor'],
    ['#ppPromotorField', '#pp-promotor'],
    ['#csPromotorField', '#cs-promotor']
  ].forEach(([campoId, selectId]) => {
    const campo = $(campoId);
    if (!campo) return;
    campo.hidden = !puede;
    if (puede) poblarSelectPromotorNegocios($(selectId));
  });
}

/* Solicitar cotización por WhatsApp */
const WA_NUMBER = '50249183411'; // número de WhatsApp de la página (código de país + número, solo dígitos)
(function () {
  const d = new Date();
  $('#q-date').min = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  poblarQPromotorSelect();
  if (!vendedoresCatalogoCargado) { vendedoresCatalogoCargado = true; cargarVendedoresCatalogo(); }
  const MAIL_TO = 'servicios@armopa.com'; // correo de la página
  const btn = $('#qBtn'), mail = $('#qMail');
  let qCotPdfPath = '';
  const qCotFileEl = $('#qCotFile'), qCotStatusEl = $('#qCotStatus');
  if (qCotFileEl) {
    qCotFileEl.addEventListener('change', async () => {
      const file = qCotFileEl.files && qCotFileEl.files[0];
      qCotFileEl.value = '';
      if (!file) return;
      if (file.type !== 'application/pdf') { if (qCotStatusEl) qCotStatusEl.textContent = 'Solo se permiten archivos PDF.'; return; }
      if (qCotStatusEl) qCotStatusEl.textContent = 'Subiendo…';
      try {
        const path = 'general/' + Date.now() + '.pdf';
        const { error } = await supabaseClient.storage.from(QUOTES_BUCKET).upload(path, file, { contentType: 'application/pdf', upsert: true });
        if (error) { if (qCotStatusEl) qCotStatusEl.textContent = 'Error al subir el PDF'; return; }
        qCotPdfPath = path;
        if (qCotStatusEl) qCotStatusEl.textContent = '✅ ' + file.name;
      } catch (err) {
        if (qCotStatusEl) qCotStatusEl.textContent = 'Error al subir el PDF';
      }
    });
  }
  async function saveServiceRequestsSupabase(t, contact) {
    const idxs = [];
    t.ext.forEach((name, i) => {
      const d = xd[i] || {};
      const need = (d.need || '').trim(), addrSvc = (d.addr || '').trim(), time = (d.time || '').trim(), start = d.start || '', prio = d.prio || '', cot = d.cotPdf || '', cotDate = d.cotDate || '';
      if (!need && !addrSvc && !time && !start && !prio && !cot && !cotDate) return;
      idxs.push(i);
    });
    if (!idxs.length) return;
    // Evita que cada Guardar/Modificar acumule filas duplicadas: se borran las
    // solicitudes anteriores de esta misma cotización antes de insertar las
    // que corresponden al estado actual del formulario.
    if (currentCotizacionId) {
      const { error: delError } = await supabaseClient.from('solicitudes_servicio').delete().eq('cotizacion_id', currentCotizacionId);
      if (delError) console.error('Error limpiando solicitudes anteriores de esta cotización:', delError);
    }
    const clienteCodigo = localStorage.getItem(LOGIN_CODIGO_STORE) || null;
    const rows = [];
    for (const i of idxs) {
      const name = t.ext[i];
      const d = xd[i] || {};
      const addrSvc = (d.addr || '').trim(), need = (d.need || '').trim(), time = (d.time || '').trim(), start = d.start || '', prio = d.prio || '', cot = d.cotPdf || '', cotDate = d.cotDate || '';
      let numeroSolicitud = null;
      try {
        const { data, error } = await supabaseClient.rpc('generar_numero_solicitud_servicio', { p_codigo: SOL_TIPOS_CODIGO[i] });
        if (error) throw error;
        numeroSolicitud = data || null;
      } catch (e) {
        console.error('Error generando el número de solicitud:', e);
      }
      rows.push({
        nombre_cliente: contact.name,
        telefono_cliente: contact.phone,
        correo_cliente: contact.email || null,
        servicio: name,
        direccion: addrSvc || null,
        necesidad: need || null,
        tiempo_estimado: time || null,
        fecha_inicio: start || null,
        prioridad: prio || null,
        cotizacion_pdf: cot || null,
        fecha_cotizacion: cotDate || null,
        cotizacion_id: currentCotizacionId,
        cliente_codigo: clienteCodigo,
        estado: 'solicitado',
        numero_solicitud: numeroSolicitud
      });
    }
    const { error } = await supabaseClient.from('solicitudes_servicio').insert(rows);
    if (error) console.error('Error al guardar la solicitud en Supabase:', error);
  }
  function saveCotizacionMaster(t, contact, addr, date, budget, promotor) {
    const names = t.ext.filter((name, i) => xfilled(i));
    const payload = {
      nombre_cliente: contact.name,
      telefono_cliente: contact.phone,
      correo_cliente: contact.email || null,
      fecha_servicio: date || null,
      direccion_general: addr || null,
      presupuesto_asignado: budget || null,
      promotor_negocio: promotor || null,
      tipo_servicio_resumen: names.length ? names.join(', ') : null,
      fecha_cotizacion_general: ($('#qCotDate') && $('#qCotDate').value) || null,
      cotizacion_pdf_general: qCotPdfPath || null,
      enviada: true
    };
    if (currentCotizacionId) {
      supabaseClient.from('cotizaciones').update(payload).eq('id', currentCotizacionId).then(({ error }) => {
        if (error) console.error('Error al guardar la cotización en Supabase:', error);
      });
    } else {
      supabaseClient.from('cotizaciones').insert(payload).then(({ error }) => {
        if (error) console.error('Error al guardar la cotización en Supabase:', error);
      });
    }
  }
  function readQuoteFields() {
    return {
      name: $('#q-name').value.trim(),
      phone: $('#q-phone').value.trim(),
      email: $('#q-email').value.trim(),
      addr: $('#q-addr').value.trim(),
      date: $('#q-date').value,
      budget: $('#q-budget').value.trim(),
      promotor: $('#q-promotor') ? $('#q-promotor').value.trim() : ''
    };
  }
  function validateQuoteFields(f, t) {
    const emailOk = !f.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email);
    if (!f.name || !f.phone || !f.addr || !f.date || !emailOk) {
      const er = $('#qErr');
      er.textContent = f.email && !emailOk ? t.qErrEmail : t.qErr;
      er.hidden = false;
      return false;
    }
    $('#qErr').hidden = true;
    return true;
  }
  function build(e) {
    const t = T[lang];
    const f = readQuoteFields();
    if (!validateQuoteFields(f, t)) { e.preventDefault(); return null; }
    const [y, m, dd] = f.date.split('-').map(Number);
    const dateTxt = new Date(y, m - 1, dd).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-GT', { day: 'numeric', month: 'long', year: 'numeric' });
    return [t.qMsgH, t.qMsgName + f.name, t.qMsgPhone + f.phone].concat(f.email ? [t.qMsgEmail + f.email] : [], [t.qMsgAddr + f.addr, t.qMsgDate + dateTxt], f.budget ? [t.qMsgBudget + f.budget] : [], f.promotor ? [t.qMsgPromotor + f.promotor] : []).join('\n') + xLines(t);
  }
  btn.addEventListener('click', (e) => {
    const msg = build(e);
    if (msg) btn.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  });
  mail.addEventListener('click', (e) => {
    const msg = build(e);
    if (msg) mail.href = 'mailto:' + MAIL_TO + '?subject=' + encodeURIComponent(T[lang].qMailSubj) + '&body=' + encodeURIComponent(msg);
  });
  ['#q-name', '#q-phone', '#q-email', '#q-addr', '#q-date', '#q-budget'].forEach((s) => $(s).addEventListener('input', () => { $('#qErr').hidden = true; }));
  $('#q-promotor')?.addEventListener('change', () => { $('#qErr').hidden = true; });

  /* Guardar / Modificar / Eliminar: única forma en que esto se guarda en Supabase */
  function qMsg(text, isError) {
    const el = $('#qSaveMsg');
    if (!el) return;
    el.textContent = text || '';
    el.style.color = isError ? '#b3261e' : '';
  }

  /* Registro de la cotización como solicitud(es) de servicio formales
     (Administrador / Super administrador): reusa el mismo gate de clave y las
     mismas funciones RPC que el panel "Solicitudes de servicio". */
  $('#qSolGateBtn')?.addEventListener('click', () => confirmarSolAdmin($('#qSolGateClave'), $('#qSolGateErr')));
  $('#qSolGateClave')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); confirmarSolAdmin($('#qSolGateClave'), $('#qSolGateErr')); } });

  $('#qSolBuscarClienteBtn')?.addEventListener('click', async () => {
    const infoEl = $('#qSolClienteInfo');
    const objetivo = $('#qSol-cliente-usuario')?.value.trim();
    if (!objetivo) { qMsg('Escribe el nombre de usuario del cliente.', true); return; }
    if (!solHashConfirmado) { qMsg('Primero confirma tu clave de administrador.', true); return; }
    const miUsuario = localStorage.getItem(LOGIN_STORE);
    try {
      const { data, error } = await supabaseClient.rpc('buscar_cliente_solicitud', { p_usuario: miUsuario, p_hash: solHashConfirmado, p_cliente_usuario: objetivo });
      if (error) throw error;
      if (data && data.status === 'ok') {
        qSolClienteSel = { usuario: data.usuario, codigo: data.codigo_usuario };
        infoEl.textContent = data.usuario + ' · Código de cliente: #' + data.codigo_usuario;
        infoEl.hidden = false;
        qMsg('');
      } else if (data && data.status === 'no_encontrado') {
        qSolClienteSel = null;
        infoEl.hidden = true;
        qMsg('No existe ningún usuario registrado con ese nombre.', true);
      } else {
        qSolClienteSel = null;
        qMsg('No se pudo confirmar el cliente.', true);
      }
    } catch (e) {
      console.error('Error buscando cliente para la cotización:', e);
      qMsg('No se pudo buscar el cliente en este momento.', true);
    }
  });

  function renderQSolList() {
    const listEl = $('#qSolList');
    if (!listEl) return;
    const idxs = Object.keys(qSolRegistros);
    if (!idxs.length) { listEl.hidden = true; listEl.innerHTML = ''; return; }
    listEl.hidden = false;
    listEl.innerHTML = '';
    const table = el('div', 'sol-table');
    idxs.forEach((k) => {
      const r = qSolRegistros[k];
      const info = solEstadoInfo(r.estado);
      const row = el('div', 'sol-row');
      const num = el('div', 'sol-num', r.numero_solicitud || '—');
      const cli = el('div', 'sol-cli', (T[lang].ext[+k] || '') + ' · ' + r.cliente_usuario + ' · #' + r.cliente_codigo);
      const estadoWrap = el('div');
      const badge = el('span', 'sol-badge', info.l);
      badge.style.background = info.bg;
      badge.style.color = info.fg;
      estadoWrap.appendChild(badge);
      row.append(num, cli, estadoWrap);
      table.appendChild(row);
    });
    listEl.appendChild(table);
  }

  async function guardarRegistrosGestion() {
    if (!esAdminOSuperAdmin() || !solHashConfirmado) return; // bloque oculto para quien no sea admin
    if (!currentCotizacionId) return;
    const clienteEscrito = $('#qSol-cliente-usuario')?.value.trim();
    if (!clienteEscrito) return; // el registro formal es opcional: si no se buscó cliente, no se crea
    if (!qSolClienteSel || qSolClienteSel.usuario !== clienteEscrito) {
      qMsg('Busca y confirma el cliente antes de guardar la solicitud.', true);
      return;
    }
    // El estado solo se puede elegir al Modificar: toda solicitud nace en
    // "Solicitado" sin importar lo que tenga seleccionado el combo todavía.
    const estadoSeleccionado = $('#qSol-estado')?.value || 'solicitado';
    const miUsuario = localStorage.getItem(LOGIN_STORE);
    const t = T[lang];
    const idxs = [];
    t.ext.forEach((name, i) => { if (xfilled(i)) idxs.push(i); });
    for (const i of idxs) {
      const codigo = SOL_TIPOS_CODIGO[i];
      const esNueva = !qSolRegistros[i];
      const estado = esNueva ? 'solicitado' : estadoSeleccionado;
      try {
        let resp;
        if (!esNueva) {
          resp = await supabaseClient.rpc('actualizar_solicitud_servicio', {
            p_usuario: miUsuario, p_hash: solHashConfirmado, p_id: qSolRegistros[i].id,
            p_cliente_usuario: qSolClienteSel.usuario, p_estado: estado,
          });
        } else {
          resp = await supabaseClient.rpc('crear_solicitud_servicio', {
            p_usuario: miUsuario, p_hash: solHashConfirmado,
            p_tipo_servicio_idx: i, p_tipo_servicio_codigo: codigo,
            p_cliente_usuario: qSolClienteSel.usuario, p_estado: 'solicitado',
            p_cotizacion_id: currentCotizacionId,
          });
        }
        const { data, error } = resp;
        if (error) throw error;
        if (data && data.status === 'ok') {
          qSolRegistros[i] = {
            id: data.id || (qSolRegistros[i] && qSolRegistros[i].id),
            numero_solicitud: data.numero_solicitud || (qSolRegistros[i] && qSolRegistros[i].numero_solicitud),
            cliente_usuario: qSolClienteSel.usuario,
            cliente_codigo: qSolClienteSel.codigo,
            estado,
          };
        } else if (data && data.status === 'no_autorizado') {
          solHashConfirmado = null;
          actualizarVisibilidadSolicitudes();
          qMsg('Tu sesión de administrador expiró. Vuelve a confirmar tu clave.', true);
          return;
        }
      } catch (e) {
        console.error('Error guardando la solicitud de servicio de la cotización:', e);
      }
    }
    renderQSolList();
  }

  async function qSaveOrModify(successText) {
    const t = T[lang];
    const f = readQuoteFields();
    if (!validateQuoteFields(f, t)) { qMsg(t.qErr, true); return; }
    qMsg('Guardando…');
    try {
      saveCotizacionMaster(t, { name: f.name, phone: f.phone, email: f.email }, f.addr, f.date, f.budget, f.promotor);
      await saveServiceRequestsSupabase(t, { name: f.name, phone: f.phone, email: f.email });
      await guardarRegistrosGestion();
      qMsg(successText);
      if (esAdminOSuperAdmin() && solHashConfirmado) cargarSolicitudesServicioActual();
    } catch (err) {
      qMsg('Error al guardar la cotización.', true);
    }
  }
  $('#qSaveBtn').addEventListener('click', () => qSaveOrModify('Cotización guardada con éxito.'));
  $('#qModifyBtn').addEventListener('click', () => qSaveOrModify('Cotización actualizada con éxito.'));
  $('#qDeleteBtn').addEventListener('click', async () => {
    if (!currentCotizacionId) { qMsg('No hay ninguna cotización guardada todavía.', true); return; }
    if (!confirm('¿Eliminar esta cotización y todo lo que tenga guardado? Esta acción no se puede deshacer.')) return;
    qMsg('Eliminando…');
    try {
      await supabaseClient.from('solicitudes_servicio').delete().eq('cotizacion_id', currentCotizacionId);
      if (esAdminOSuperAdmin() && solHashConfirmado) {
        const miUsuario = localStorage.getItem(LOGIN_STORE);
        try {
          await supabaseClient.rpc('eliminar_solicitudes_gestion_por_cotizacion', { p_usuario: miUsuario, p_hash: solHashConfirmado, p_cotizacion_id: currentCotizacionId });
        } catch (e) { console.error('Error eliminando solicitudes de gestión de la cotización:', e); }
      }
      const { error } = await supabaseClient.from('cotizaciones').delete().eq('id', currentCotizacionId);
      if (error) { qMsg('Error al eliminar: ' + error.message, true); return; }
      currentCotizacionId = null;
      qSolRegistros = {};
      qSolClienteSel = null;
      qMsg('Cotización eliminada con éxito.');
      initCotizacionNumber();
    } catch (err) {
      qMsg('Error al eliminar la cotización.', true);
    }
  });
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
    contenedor.innerHTML = '<p class="servicios-estado">' + escaparTexto(T[lang].errCargarServicios) + '</p>';
    return;
  }

  if (!data.length) {
    contenedor.innerHTML = '<p class="servicios-estado">' + escaparTexto(T[lang].proximamente) + '</p>';
    poblarServSelect([]);
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
          <article class="servicio-card" data-servicio-id="${escaparTexto(s.id)}">
            <h4>${escaparTexto(s.nombre)}</h4>
            <p>${escaparTexto(s.descripcion)}</p>
          </article>
        `).join('')}
      </div>
    </div>
  `).join('');

  poblarServSelect(data, grupos);
}

/* Llena el selector del modal "Buscar servicios" de forma dinámica, agrupado
   por categoría igual que la lista visible en la sección de servicios. */
function poblarServSelect(data, grupos) {
  const sel = $('#servSelect');
  if (!sel) return;
  if (!data || !data.length) {
    sel.innerHTML = '<option value="">' + escaparTexto(T[lang].noHayServiciosDisponibles) + '</option>';
    return;
  }
  const g = grupos || data.reduce((acc, s) => {
    const cat = s.categoria || 'Otros servicios';
    (acc[cat] = acc[cat] || []).push(s);
    return acc;
  }, {});
  sel.innerHTML = '<option value="">' + escaparTexto(T[lang].seleccionaServicio) + '</option>' +
    Object.entries(g).map(([cat, items]) => `
      <optgroup label="${escaparTexto(cat)}">
        ${items.map(s => `<option value="${escaparTexto(s.id)}">${escaparTexto(s.nombre)}</option>`).join('')}
      </optgroup>
    `).join('');
}

document.addEventListener('DOMContentLoaded', cargarServiciosArmopa);
window.cargarServiciosArmopa = cargarServiciosArmopa;

/* Modal "Buscar servicios": al inicio solo se ve el botón; al presionarlo se
   abre este modal con la lista dinámica de servicios y su botón de buscar. */
const buscarServModal = $('#buscarServModal');
const openBuscarServModal = () => { if (buscarServModal) buscarServModal.hidden = false; };
const closeBuscarServModal = () => { if (buscarServModal) buscarServModal.hidden = true; };
$('#abrirBuscarServBtn')?.addEventListener('click', openBuscarServModal);
$('#buscarServClose')?.addEventListener('click', closeBuscarServModal);
$('#buscarServScrim')?.addEventListener('click', closeBuscarServModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && buscarServModal && !buscarServModal.hidden) closeBuscarServModal(); });

$('#servSearchBtn')?.addEventListener('click', () => {
  const sel = $('#servSelect');
  const msg = $('#servSearchMsg');
  const id = sel ? sel.value : '';
  if (!id) {
    if (msg) msg.innerHTML = '<div class="cq-empty">' + escaparTexto(T[lang].eligeServicioLista) + '</div>';
    return;
  }
  if (msg) msg.innerHTML = '';
  closeBuscarServModal();
  const ir = () => {
    const card = document.querySelector(`.servicio-card[data-servicio-id="${CSS.escape(id)}"]`);
    const seccion = document.getElementById('serviciosDinamicos');
    if (!card) { if (seccion) seccion.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('servicio-destacado');
    setTimeout(() => card.classList.remove('servicio-destacado'), 2400);
  };
  // Si los servicios aún no terminaron de cargar en el DOM, se espera un
  // momento antes de buscar la tarjeta correspondiente.
  if (document.querySelector(`.servicio-card[data-servicio-id="${CSS.escape(id)}"]`)) ir();
  else setTimeout(ir, 300);
});
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

/* ===== Precalificación bancaria: expediente + documentos PDF ===== */
const DOCS_BUCKET = 'expedientes'; // bucket de Supabase Storage — debe crearse como PRIVADO
let pqExpedienteId = null;
let pqTipo = 'individual'; // 'individual' | 'juridica'

const PQ_DOC_TYPES_INDIVIDUAL = ['req-dpi', 'req-nit', 'req-boletas', 'req-estados-cuenta', 'req-patente-isr', 'req-carta-trabajo', 'req-antiguedad', 'req-historial'];
const PQ_DOC_TYPES_JURIDICA = ['req-patente-comercio-empresa', 'req-patente-sociedad', 'req-escritura-constitucion', 'req-rtu', 'req-dpi-representante', 'req-nombramiento-representante', 'req-patente-comercio-sociedad-rep', 'req-estados-financieros'];
const PQ_DOC_TYPES_ALL = PQ_DOC_TYPES_INDIVIDUAL.concat(PQ_DOC_TYPES_JURIDICA);

function pqMsg(text, isError) {
  const el = $('#pqMsg');
  if (!el) return;
  el.textContent = text || '';
  el.style.color = isError ? '#b3261e' : '';
}
function pqCurrentDocTypes() {
  return pqTipo === 'juridica' ? PQ_DOC_TYPES_JURIDICA : PQ_DOC_TYPES_INDIVIDUAL;
}
function pqResetStatuses(types) {
  types.forEach((doc) => {
    const st = $('#pqs-' + doc);
    if (st) st.textContent = T[lang].pqSinGuardar;
  });
}
function pqSwitchTipo(tipo) {
  pqTipo = tipo;
  $$('#pqTipoSeg .seg').forEach((b) => b.classList.toggle('on', b.dataset.tipo === tipo));
  $('#pq-block-individual').hidden = tipo !== 'individual';
  $('#pq-block-juridica').hidden = tipo !== 'juridica';
  pqExpedienteId = null;
  pqMsg('');
  pqResetStatuses(PQ_DOC_TYPES_ALL);
}
$$('#pqTipoSeg .seg').forEach((b) => b.addEventListener('click', () => pqSwitchTipo(b.dataset.tipo)));

function pqCollectFields() {
  if (pqTipo === 'juridica') {
    return {
      tipo_solicitante: 'juridica',
      banco_preferencia: $('#pqj-banco').value.trim(),
      monto_solicitado: $('#pqj-monto').value.trim(),
      destino_credito: $('#pqj-destino').value,
      razon_social: $('#pqj-razon').value.trim(),
      nit_empresa: $('#pqj-nit').value.trim(),
      rep_legal_nombre: $('#pqj-rep-nombre').value.trim(),
      rep_legal_dpi: $('#pqj-rep-dpi').value.trim(),
      telefono_celular: $('#pqj-tel').value.trim(),
      correo_electronico: $('#pqj-correo').value.trim()
    };
  }
  return {
    tipo_solicitante: 'individual',
    banco_preferencia: $('#pq-banco').value.trim(),
    monto_solicitado: $('#pq-monto').value.trim(),
    destino_credito: $('#pq-destino').value,
    cui_dpi: $('#pq-dpi').value.trim(),
    nit_sat: $('#pq-nit').value.trim(),
    telefono_celular: $('#pq-tel').value.trim(),
    correo_electronico: $('#pq-correo').value.trim(),
    tipo_perfil: $('#pq-perfil').value,
    grado_escolaridad: $('#pq-escolaridad').value,
    profesion: $('#pq-profesion').value.trim()
  };
}
function pqValidate(f) {
  if (f.tipo_solicitante === 'juridica') {
    if (!f.banco_preferencia || !f.monto_solicitado || !f.destino_credito || !f.razon_social || !f.nit_empresa || !f.rep_legal_nombre || !f.rep_legal_dpi || !f.telefono_celular || !f.correo_electronico) {
      return T[lang].pqMsgCompletaEmpresa;
    }
    if (f.rep_legal_dpi.length !== 13) return T[lang].pqMsgDpiRepresentante13;
    return null;
  }
  if (!f.banco_preferencia || !f.monto_solicitado || !f.destino_credito || !f.cui_dpi || !f.nit_sat || !f.telefono_celular || !f.correo_electronico || !f.tipo_perfil || !f.grado_escolaridad || !f.profesion) {
    return T[lang].pqMsgCompletaTusDatos;
  }
  if (f.cui_dpi.length !== 13) return T[lang].pqMsgDpi13;
  return null;
}
async function pqSaveOrUpdate(isUpdate) {
  const fields = pqCollectFields();
  const err = pqValidate(fields);
  if (err) { pqMsg(err, true); return; }
  pqMsg(T[lang].pqMsgGuardando);
  try {
    if (isUpdate && pqExpedienteId) {
      const { error } = await supabaseClient.from('expedientes_precalificacion').update(fields).eq('id_expediente', pqExpedienteId);
      if (error) { pqMsg(T[lang].pqMsgErrorActualizar + error.message, true); return; }
      pqMsg(T[lang].pqMsgActualizadoExito);
    } else {
      const { data, error } = await supabaseClient.from('expedientes_precalificacion').insert(fields).select('id_expediente').single();
      if (error) { pqMsg(T[lang].pqMsgErrorGuardar + error.message, true); return; }
      pqExpedienteId = data.id_expediente;
      pqMsg(T[lang].pqMsgGuardadoExito);
      pqRefreshDocStatuses();
    }
  } catch (e) {
    pqMsg(T[lang].pqMsgErrorGuardarExpediente, true);
  }
}
async function pqDeleteExpediente() {
  if (!pqExpedienteId) { pqMsg(T[lang].pqMsgNoHayExpediente, true); return; }
  if (!confirm(T[lang].pqConfirmEliminar)) return;
  try {
    const { error } = await supabaseClient.from('expedientes_precalificacion').delete().eq('id_expediente', pqExpedienteId);
    if (error) { pqMsg(T[lang].pqMsgErrorEliminar + error.message, true); return; }
    pqExpedienteId = null;
    pqMsg(T[lang].pqMsgEliminadoExito);
    pqResetStatuses(pqCurrentDocTypes());
  } catch (e) {
    pqMsg(T[lang].pqMsgErrorEliminarExpediente, true);
  }
}
function uploadPdfFile(file, idExpediente, tipoDocumento) {
  return new Promise(async (resolve, reject) => {
    try {
      const path = idExpediente + '/' + tipoDocumento + '-' + Date.now() + '.pdf';
      const { error } = await supabaseClient.storage.from(DOCS_BUCKET).upload(path, file, { contentType: 'application/pdf', upsert: true });
      if (error) { reject(error); return; }
      resolve(path);
    } catch (err) { reject(err); }
  });
}
async function pqRefreshDocStatuses() {
  if (!pqExpedienteId) return;
  try {
    const { data, error } = await supabaseClient.from('documentos_expediente').select('tipo_documento, ruta_archivo_pdf').eq('id_expediente', pqExpedienteId);
    if (error || !data) return;
    data.forEach((row) => {
      const st = $('#pqs-' + row.tipo_documento);
      if (st) st.textContent = T[lang].pqMsgSubido;
    });
  } catch (e) {}
}
PQ_DOC_TYPES_ALL.forEach((doc) => {
  const input = $('#pqf-' + doc);
  if (!input) return;
  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    if (!pqExpedienteId) {
      pqMsg(T[lang].pqMsgPrimeroGuarda, true);
      input.value = '';
      return;
    }
    if (file.type !== 'application/pdf') {
      pqMsg(T[lang].pqMsgSoloPdf, true);
      input.value = '';
      return;
    }
    const st = $('#pqs-' + doc);
    if (st) st.textContent = T[lang].pqMsgSubiendoEllipsis;
    try {
      const path = await uploadPdfFile(file, pqExpedienteId, doc);
      const { error } = await supabaseClient.from('documentos_expediente').upsert({
        id_expediente: pqExpedienteId,
        tipo_documento: doc,
        ruta_archivo_pdf: path,
        tamano_bytes: file.size
      }, { onConflict: 'id_expediente,tipo_documento' });
      if (error) { if (st) st.textContent = T[lang].pqMsgErrorGuardarCorto; pqMsg(T[lang].pqMsgErrorGuardarDoc + error.message, true); return; }
      if (st) st.textContent = T[lang].pqMsgSubidoNombre + file.name;
      pqMsg(T[lang].pqMsgDocumentoSubidoExito);
    } catch (err) {
      if (st) st.textContent = T[lang].pqMsgErrorSubir;
      pqMsg(T[lang].pqMsgErrorSubirPdf, true);
    }
  });
});
function pqBuildRequirementsSections() {
  const blockId = pqTipo === 'juridica' ? '#pq-block-juridica' : '#pq-block-individual';
  const block = $(blockId);
  const sections = [];
  let current = null;
  Array.from(block.children).forEach((child) => {
    if (child.classList && child.classList.contains('x-est-h')) {
      current = { title: child.textContent.trim(), items: [] };
      sections.push(current);
    } else if (child.tagName === 'UL' && current) {
      Array.from(child.querySelectorAll('.pq-item > span:first-child')).forEach((span) => {
        current.items.push(span.textContent.trim());
      });
    }
  });
  return sections.filter((s) => s.items.length > 0);
}
function pqDownloadRequirementsPdf() {
  if (!window.jspdf) { pqMsg(T[lang].pqMsgNoSePudoPdf, true); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const marginX = 15;
  let y = 20;
  const titulo = pqTipo === 'juridica'
    ? T[lang].pqPdfTituloJuridica
    : T[lang].pqPdfTituloIndividual;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  const tituloLines = doc.splitTextToSize(titulo, 180);
  doc.text(tituloLines, marginX, y);
  y += tituloLines.length * 7 + 3;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(T[lang].pqPdfSubtitle, marginX, y);
  y += 10;

  pqBuildRequirementsSections().forEach((sec) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(sec.title, marginX, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    sec.items.forEach((item) => {
      if (y > 275) { doc.addPage(); y = 20; }
      const lines = doc.splitTextToSize('☐  ' + item, 175);
      doc.text(lines, marginX, y);
      y += lines.length * 6 + 2;
    });
    y += 4;
  });

  if (y > 280) { doc.addPage(); y = 20; }
  const fecha = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'es-GT', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(T[lang].pqPdfFooter + fecha + T[lang].pqPdfFooter2, marginX, Math.max(y, 285));

  const nombreArchivo = pqTipo === 'juridica' ? 'requisitos-precalificacion-empresa.pdf' : 'requisitos-precalificacion-individual.pdf';
  doc.save(nombreArchivo);
}
const pqSaveBtn = $('#pqSave'), pqUpdateBtn = $('#pqUpdate'), pqDeleteBtn = $('#pqDelete'), pqDownloadBtn = $('#pqDownloadPdf');
if (pqSaveBtn) pqSaveBtn.addEventListener('click', () => pqSaveOrUpdate(false));
if (pqUpdateBtn) pqUpdateBtn.addEventListener('click', () => pqSaveOrUpdate(true));
if (pqDeleteBtn) pqDeleteBtn.addEventListener('click', pqDeleteExpediente);
if (pqDownloadBtn) pqDownloadBtn.addEventListener('click', pqDownloadRequirementsPdf);


function toSupaRow(cityName, l) {
  return {
    local_id: l.id,
    ciudad: cityName,
    nombre: l.name || '',
    descripcion: l.desc || '',
    direccion: l.addr || '',
    sector: l.sector || '',
    zona: l.zona || '',
    tipo_propiedad: l.tipo || '',
    tipo_operacion: l.op || 'renta',
    valor_renta: l.pRent || '',
    valor_venta: l.pSale || '',
    fotos: l.imgs || [],
    vendedor_nombre: l.sName || '',
    vendedor_whatsapp: l.sWa || '',
    vendedor_foto: l.sPhoto || '',
    estado_ubicacion: l.estado || 'activa',
    estado_ubicacion_fecha: l.estadoFecha || null,
    estado_ubicacion_usuario: l.estadoUsuario || null,
    vendedor_asignado: l.vendedorAsignado || null,
    cliente_asignado: l.clienteAsignado || null,
    comision_porcentaje: l.comisionPorcentaje || null,
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
        sector: row.sector || '',
        zona: row.zona || '',
        tipo: row.tipo_propiedad || '',
        desc: row.descripcion || '',
        op: row.tipo_operacion || 'renta',
        pRent: row.valor_renta || '',
        pSale: row.valor_venta || '',
        imgs: row.fotos || [],
        sPhoto: row.vendedor_foto || '',
        sName: row.vendedor_nombre || '',
        sWa: row.vendedor_whatsapp || '',
        estado: row.estado_ubicacion || 'activa',
        estadoFecha: row.estado_ubicacion_fecha || '',
        estadoUsuario: row.estado_ubicacion_usuario || '',
        vendedorAsignado: row.vendedor_asignado || '',
        clienteAsignado: row.cliente_asignado || '',
        comisionPorcentaje: row.comision_porcentaje != null ? String(row.comision_porcentaje) : ''
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
/* ===== Solicitudes de servicio (Administrador / Super administrador) =====
   Panel único al final de "Solicitar cotización" (#solPanel), con un
   selector para elegir a cuál de los 9 servicios pertenece cada solicitud.
   Oculto para cualquiera que no tenga sesión de Administrador o Super
   administrador. La clave se vuelve a confirmar una vez por sesión
   (solHashConfirmado, declarado arriba) y se reenvía a cada función de
   Supabase, que la vuelve a verificar del lado del servidor. */
const SOL_TIPOS_CODIGO = ['ALQ', 'CAM', 'REN', 'MTO', 'PLE', 'JUR', 'PRE', 'MOV', 'ADM'];
/* Estado interno de cada ubicación (solo visible para Administrador o Super
   administrador). "Fecha cambio de estado" y "Usuario que cambia el
   estado" se actualizan automáticamente cada vez que se cambia este
   selector. */
/* Las etiquetas (campo "l") se traducen en vivo leyendo T[lang].ubicEstLabels
   / T[lang].solEstLabels según el idioma activo; "v"/"bg"/"fg" no cambian. */
const UBIC_ESTADOS_BASE = [
  { v: 'activa', bg: '#dcefe0', fg: '#1f7a43' },
  { v: 'arrendada', bg: '#dde8fb', fg: '#1d4ed8' },
  { v: 'vendida', bg: '#fbe9c8', fg: '#8b641d' },
  { v: 'suspendida', bg: '#fde8d0', fg: '#b45309' },
  { v: 'baja', bg: '#fbdede', fg: '#b42318' }
];
function getUbicEstados() {
  const labels = (T[lang] || T.es).ubicEstLabels || {};
  return UBIC_ESTADOS_BASE.map((e) => ({ ...e, l: labels[e.v] || e.v }));
}
Object.defineProperty(window, 'UBIC_ESTADOS', { get: getUbicEstados });
const ubicEstadoInfo = (v) => getUbicEstados().find((e) => e.v === v) || getUbicEstados()[0];

const SOL_ESTADOS_BASE = [
  { v: 'solicitado', bg: '#e6eef5', fg: '#2b4a66' },
  { v: 'presupuesto_enviado', bg: '#fbe9c8', fg: '#8b641d' },
  { v: 'aprobado', bg: '#dcefe0', fg: '#1f7a43' },
  { v: 'en_proceso', bg: '#dde8fb', fg: '#1d4ed8' },
  { v: 'ejecutado', bg: '#c9eed2', fg: '#0f5132' },
  { v: 'anulado', bg: '#fbdede', fg: '#b42318' },
];
function getSolEstados() {
  const labels = (T[lang] || T.es).solEstLabels || {};
  return SOL_ESTADOS_BASE.map((e) => ({ ...e, l: labels[e.v] || e.v }));
}
Object.defineProperty(window, 'SOL_ESTADOS', { get: getSolEstados });
const solEstadoInfo = (v) => getSolEstados().find((e) => e.v === v) || getSolEstados()[0];

function solServicioActual() {
  const sel = $('#sol-servicio-sel');
  const v = sel ? parseInt(sel.value, 10) : 0;
  return Number.isFinite(v) ? v : 0;
}

function actualizarVisibilidadSolicitudes() {
  // Ocultos por ahora a pedido del cliente (ambos bloques: "Solicitud de
  // servicio" dentro de Solicitar cotización, y el panel "Solicitudes de
  // servicio"), aunque quien esté conectado sea Administrador o Super
  // administrador. El resto de la lógica queda intacta por si se reactivan.
  const mostrar = false; // antes: esAdminOSuperAdmin();
  const panel = $('#solPanel');
  const qBlock = $('#qSolBlock');
  if (panel) panel.hidden = !mostrar;
  if (qBlock) qBlock.hidden = !mostrar;
  if (!mostrar) return;
  // La sesión cambió (por ejemplo otro usuario inició sesión): hay que
  // volver a confirmar la clave antes de ver o gestionar solicitudes.
  const gate = $('#solGate');
  const list = $('#solList');
  if (gate) gate.hidden = !!solHashConfirmado;
  if (list) list.hidden = !solHashConfirmado;
  if (solHashConfirmado) cargarSolicitudes(solServicioActual());
  if (!solHashConfirmado) {
    const seguimiento = $('#solSeguimientoPanel');
    if (seguimiento) seguimiento.hidden = true;
  }

  const qGate = $('#qSolGate');
  const qFields = $('#qSolFields');
  if (qGate) qGate.hidden = !!solHashConfirmado;
  if (qFields) qFields.hidden = !solHashConfirmado;
}

async function confirmarSolAdmin(inputEl, errEl) {
  const miUsuario = localStorage.getItem(LOGIN_STORE);
  const clave = inputEl.value;
  errEl.hidden = true;
  if (!miUsuario || !clave) { errEl.textContent = 'Escribe tu clave.'; errEl.hidden = false; return; }
  try {
    const hash = await csHashClave(clave);
    const { data, error } = await supabaseClient.rpc('conectar_usuario', { p_usuario: miUsuario, p_hash: hash, p_crear: false });
    if (error) throw error;
    if (data && data.status === 'ok' && (data.tipo_usuario === 'administrador' || data.tipo_usuario === 'super_administrador')) {
      solHashConfirmado = hash;
      inputEl.value = '';
      actualizarVisibilidadSolicitudes();
      actualizarVisibilidadSolServicio();
    } else {
      errEl.textContent = 'Clave incorrecta.';
      errEl.hidden = false;
    }
  } catch (e) {
    console.error('Error confirmando clave para solicitudes:', e);
    errEl.textContent = 'No se pudo confirmar en este momento. Intenta de nuevo.';
    errEl.hidden = false;
  }
}

async function cargarSolicitudes(i) {
  const listEl = $('#solList');
  if (!listEl || !solHashConfirmado) return;
  const miUsuario = localStorage.getItem(LOGIN_STORE);
  listEl.innerHTML = '<p class="hint">Cargando…</p>';
  try {
    const { data, error } = await supabaseClient.rpc('listar_solicitudes_servicio', { p_usuario: miUsuario, p_hash: solHashConfirmado, p_tipo_servicio_idx: i });
    if (error) throw error;
    renderSolicitudes(i, data || []);
  } catch (e) {
    console.error('Error cargando solicitudes:', e);
    listEl.innerHTML = '<p class="hint">No se pudieron cargar las solicitudes.</p>';
  }
}

function renderSolicitudes(i, rows) {
  const listEl = $('#solList');
  if (!listEl) return;
  if (!rows.length) {
    listEl.innerHTML = '<p class="hint">Todavía no hay solicitudes para este servicio.</p>';
    return;
  }
  listEl.innerHTML = '';
  const table = el('div', 'sol-table');
  rows.forEach((r) => {
    const info = solEstadoInfo(r.estado);
    const row = el('div', 'sol-row');

    const num = el('div', 'sol-num', r.numero_solicitud);
    const cli = el('div', 'sol-cli', r.cliente_usuario + ' · #' + r.cliente_codigo);
    const estadoWrap = el('div');
    const badge = el('span', 'sol-badge', info.l);
    badge.style.background = info.bg;
    badge.style.color = info.fg;
    estadoWrap.appendChild(badge);

    const actions = el('div', 'sol-actions');
    const editBtn = el('button', 'btn btn-line-dark btn-sm', 'Modificar');
    editBtn.type = 'button';
    editBtn.addEventListener('click', () => openSolModal(i, r));
    const delBtn = el('button', 'btn btn-line-dark btn-sm sol-del', 'Eliminar');
    delBtn.type = 'button';
    delBtn.addEventListener('click', () => eliminarSolicitud(i, r.id, r.numero_solicitud));
    actions.append(editBtn, delBtn);

    row.append(num, cli, estadoWrap, actions);
    table.appendChild(row);
  });
  listEl.appendChild(table);
}

async function eliminarSolicitud(i, id, numero) {
  if (!solHashConfirmado) return;
  if (!confirm('¿Eliminar la solicitud ' + numero + '? Esta acción no se puede deshacer.')) return;
  const miUsuario = localStorage.getItem(LOGIN_STORE);
  try {
    const { data, error } = await supabaseClient.rpc('eliminar_solicitud_servicio', { p_usuario: miUsuario, p_hash: solHashConfirmado, p_id: id });
    if (error) throw error;
    if (data && data.status === 'ok') cargarSolicitudes(i);
    else cargarSolicitudes(i);
  } catch (e) {
    console.error('Error eliminando solicitud:', e);
  }
}

/* Modal compartido: Agregar / Modificar solicitud */
const solModal = $('#solModal');
let solItemIndex = null;
let solEditId = null;
let solClienteSel = null; // { usuario, codigo }

function openSolModal(i, row) {
  solItemIndex = i;
  solEditId = row ? row.id : null;
  solClienteSel = row ? { usuario: row.cliente_usuario, codigo: row.cliente_codigo } : null;
  $('#solTitle').textContent = row ? 'Modificar solicitud' : 'Nueva solicitud de servicio';
  $('#solServicioNombre').textContent = (T[lang].ext && T[lang].ext[i]) || '';
  $('#solNumeroPreview').textContent = row ? row.numero_solicitud : 'Se genera automáticamente al guardar.';
  $('#sol-cliente-usuario').value = row ? row.cliente_usuario : '';
  const infoEl = $('#solClienteInfo');
  if (row) {
    infoEl.textContent = 'Código de cliente: #' + row.cliente_codigo;
    infoEl.hidden = false;
  } else {
    infoEl.hidden = true;
    infoEl.textContent = '';
  }
  $('#sol-estado').value = row ? row.estado : 'solicitado';
  $('#solError').hidden = true;
  $('#solNote').hidden = true;
  if (solModal) solModal.hidden = false;
}
const closeSolModal = () => { if (solModal) solModal.hidden = true; };
$('#solClose')?.addEventListener('click', closeSolModal);
$('#solScrim')?.addEventListener('click', closeSolModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && solModal && !solModal.hidden) closeSolModal(); });

$('#solBuscarClienteBtn')?.addEventListener('click', async () => {
  const errEl = $('#solError');
  errEl.hidden = true;
  const infoEl = $('#solClienteInfo');
  const objetivo = $('#sol-cliente-usuario')?.value.trim();
  if (!objetivo) { errEl.textContent = 'Escribe el nombre de usuario del cliente.'; errEl.hidden = false; return; }
  if (!solHashConfirmado) { errEl.textContent = 'Primero confirma tu clave de administrador.'; errEl.hidden = false; return; }
  const miUsuario = localStorage.getItem(LOGIN_STORE);
  try {
    const { data, error } = await supabaseClient.rpc('buscar_cliente_solicitud', { p_usuario: miUsuario, p_hash: solHashConfirmado, p_cliente_usuario: objetivo });
    if (error) throw error;
    if (data && data.status === 'ok') {
      solClienteSel = { usuario: data.usuario, codigo: data.codigo_usuario };
      infoEl.textContent = data.usuario + ' · Código de cliente: #' + data.codigo_usuario;
      infoEl.hidden = false;
    } else if (data && data.status === 'no_encontrado') {
      solClienteSel = null;
      infoEl.hidden = true;
      errEl.textContent = 'No existe ningún usuario registrado con ese nombre.';
      errEl.hidden = false;
    } else {
      solClienteSel = null;
      errEl.textContent = 'No se pudo confirmar el cliente.';
      errEl.hidden = false;
    }
  } catch (e) {
    console.error('Error buscando cliente:', e);
    errEl.textContent = 'No se pudo buscar el cliente en este momento.';
    errEl.hidden = false;
  }
});

$('#solGuardarBtn')?.addEventListener('click', async () => {
  const errEl = $('#solError');
  const noteEl = $('#solNote');
  errEl.hidden = true;
  noteEl.hidden = true;
  if (!solHashConfirmado) { errEl.textContent = 'Primero confirma tu clave de administrador.'; errEl.hidden = false; return; }
  if (solItemIndex === null) return;
  const clienteUsuarioEscrito = $('#sol-cliente-usuario')?.value.trim();
  if (!solClienteSel || solClienteSel.usuario !== clienteUsuarioEscrito) {
    errEl.textContent = 'Busca y confirma el cliente antes de guardar.';
    errEl.hidden = false;
    return;
  }
  const estado = $('#sol-estado')?.value || 'solicitado';
  const miUsuario = localStorage.getItem(LOGIN_STORE);
  const codigo = SOL_TIPOS_CODIGO[solItemIndex];
  const btn = $('#solGuardarBtn');
  btn.disabled = true;
  try {
    let resp;
    if (solEditId) {
      resp = await supabaseClient.rpc('actualizar_solicitud_servicio', {
        p_usuario: miUsuario, p_hash: solHashConfirmado, p_id: solEditId,
        p_cliente_usuario: solClienteSel.usuario, p_estado: estado,
      });
    } else {
      resp = await supabaseClient.rpc('crear_solicitud_servicio', {
        p_usuario: miUsuario, p_hash: solHashConfirmado,
        p_tipo_servicio_idx: solItemIndex, p_tipo_servicio_codigo: codigo,
        p_cliente_usuario: solClienteSel.usuario, p_estado: estado,
      });
    }
    const { data, error } = resp;
    if (error) throw error;
    const status = data && data.status;
    if (status === 'ok') {
      cargarSolicitudes(solItemIndex);
      closeSolModal();
    } else if (status === 'cliente_no_existe') {
      errEl.textContent = 'Ese usuario ya no existe. Búscalo de nuevo.';
      errEl.hidden = false;
    } else if (status === 'no_autorizado') {
      errEl.textContent = 'Tu sesión de administrador expiró. Cierra este formulario y vuelve a confirmar tu clave.';
      errEl.hidden = false;
      solHashConfirmado = null;
      actualizarVisibilidadSolicitudes();
    } else {
      errEl.textContent = 'No se pudo guardar la solicitud.';
      errEl.hidden = false;
    }
  } catch (e) {
    console.error('Error guardando solicitud:', e);
    errEl.textContent = 'No se pudo guardar la solicitud en este momento.';
    errEl.hidden = false;
  } finally {
    btn.disabled = false;
  }
});

/* Seguimiento de cotización: para el servicio seleccionado, muestra por cada
   solicitud tres datos: el código de cliente, el estado de la cotización (el
   mismo estado de la solicitud, mostrado aquí con ese nombre) y el código de
   la cotización que la originó (en vez de un número de solicitud aparte). Es
   un segmento aparte, de solo lectura, que se abre/actualiza con su propio
   botón. */
async function cargarSeguimiento(i) {
  const listEl = $('#solSeguimientoList');
  if (!listEl || !solHashConfirmado) return;
  const miUsuario = localStorage.getItem(LOGIN_STORE);
  listEl.innerHTML = '<p class="hint">Cargando…</p>';
  try {
    const { data, error } = await supabaseClient.rpc('listar_seguimiento_cotizacion', { p_usuario: miUsuario, p_hash: solHashConfirmado, p_tipo_servicio_idx: i });
    if (error) throw error;
    renderSeguimiento(data || []);
  } catch (e) {
    console.error('Error cargando el seguimiento de cotización:', e);
    listEl.innerHTML = '<p class="hint">No se pudo cargar el seguimiento de cotización.</p>';
  }
}

function labeledCell(label, valueEl) {
  const cell = el('div');
  cell.append(el('span', 'lbl', label), valueEl);
  return cell;
}

function renderSeguimiento(rows) {
  const listEl = $('#solSeguimientoList');
  if (!listEl) return;
  if (!rows.length) {
    listEl.innerHTML = '<p class="hint">Todavía no hay cotizaciones con solicitudes para este servicio.</p>';
    return;
  }
  listEl.innerHTML = '';
  const table = el('div', 'seg-table');
  rows.forEach((r) => {
    const info = solEstadoInfo(r.estado_solicitud);
    const row = el('div', 'seg-row');

    const estBadge = el('span', 'sol-badge', info.l);
    estBadge.style.background = info.bg;
    estBadge.style.color = info.fg;

    const codigoCotizacion = r.cotizacion_id ? 'COT-' + String(r.cotizacion_id).padStart(6, '0') : '—';

    row.append(
      labeledCell('Código de cliente', el('strong', '', '#' + r.cliente_codigo)),
      labeledCell('Estado de la cotización', estBadge),
      labeledCell('Código de la cotización', el('strong', 'sol-num', codigoCotizacion)),
    );
    table.appendChild(row);
  });
  listEl.appendChild(table);
}

/* Panel único de solicitudes de servicio: clave, selector y seguimiento */
$('#solGateBtn')?.addEventListener('click', () => confirmarSolAdmin($('#solGateClave'), $('#solGateErr')));
$('#solGateClave')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); confirmarSolAdmin($('#solGateClave'), $('#solGateErr')); } });
$('#solSeguimientoBtn')?.addEventListener('click', () => {
  const panel = $('#solSeguimientoPanel');
  if (!panel) return;
  const mostrar = panel.hidden;
  panel.hidden = !mostrar;
  if (mostrar) cargarSeguimiento(solServicioActual());
});
$('#solSeguimientoActualizarBtn')?.addEventListener('click', () => cargarSeguimiento(solServicioActual()));
$('#sol-servicio-sel')?.addEventListener('change', () => {
  if (!solHashConfirmado) return;
  cargarSolicitudes(solServicioActual());
  const panel = $('#solSeguimientoPanel');
  if (panel && !panel.hidden) cargarSeguimiento(solServicioActual());
});

actualizarVisibilidadSolicitudes();

/* Solicitudes de servicio de esta cotización: ocultas por ahora, porque
   solo se mostraban mientras el panel "Buscar Servicio" (ya retirado, su
   búsqueda y listado se movieron a Administración > Servicios) estaba
   abierto. El resto de la lógica queda intacta por si se reactivan con otro
   disparador. */
function actualizarVisibilidadSolServicio() {
  const bloque = $('#qSolServicioBlock');
  const visible = false;
  if (bloque) bloque.hidden = !visible;
  if (!visible) return;
  const gate = $('#qSolServicioGate');
  const datos = $('#qSolServicioDatos');
  if (gate) gate.hidden = !!solHashConfirmado;
  if (datos) datos.hidden = !solHashConfirmado;
  if (solHashConfirmado) cargarSolicitudesServicioActual();
}

async function cargarSolicitudesServicioActual() {
  const listEl = $('#qSolServicioList');
  if (!listEl || !solHashConfirmado) return;
  if (!currentCotizacionId) {
    listEl.innerHTML = '<p class="hint">Todavía no hay una cotización guardada.</p>';
    return;
  }
  listEl.innerHTML = '<p class="hint">Cargando…</p>';
  try {
    const { data, error } = await supabaseClient
      .from('solicitudes_servicio')
      .select('id, servicio, cliente_codigo, estado, numero_solicitud')
      .eq('cotizacion_id', currentCotizacionId)
      .order('id', { ascending: false });
    if (error) throw error;
    renderSolicitudesServicioActual(data || []);
  } catch (e) {
    console.error('Error cargando las solicitudes de esta cotización:', e);
    listEl.innerHTML = '<p class="hint">No se pudieron cargar las solicitudes.</p>';
  }
}

function renderSolicitudesServicioActual(rows) {
  const listEl = $('#qSolServicioList');
  if (!listEl) return;
  if (!rows.length) {
    listEl.innerHTML = '<p class="hint">Esta cotización todavía no tiene solicitudes de servicio registradas.</p>';
    return;
  }
  listEl.innerHTML = '';
  const table = el('div', 'sol-table');
  rows.forEach((r) => table.appendChild(buildSolServicioRow(r)));
  listEl.appendChild(table);
}

function buildSolServicioRow(r) {
  const row = el('div', 'sol-row sol-row-id');
  renderSolServicioRowView(row, r);
  return row;
}

function renderSolServicioRowView(row, r) {
  row.innerHTML = '';
  const info = solEstadoInfo(r.estado);
  const estBadge = el('span', 'sol-badge', info.l);
  estBadge.style.background = info.bg;
  estBadge.style.color = info.fg;
  const actions = el('div', 'sol-actions');
  const modBtn = el('button', 'btn btn-line-dark btn-sm', 'Modificar');
  modBtn.type = 'button';
  const delBtn = el('button', 'btn btn-line-dark btn-sm sol-del', 'Eliminar');
  delBtn.type = 'button';
  actions.append(modBtn, delBtn);
  row.append(
    labeledCell('ID', el('strong', '', r.id != null ? String(r.id) : '—')),
    labeledCell('No. de solicitud', el('strong', 'sol-num', r.numero_solicitud || '—')),
    labeledCell('Código de cliente', el('span', 'sol-cli', r.cliente_codigo ? ('#' + r.cliente_codigo) : '—')),
    labeledCell('Estado', estBadge),
    actions
  );
  modBtn.addEventListener('click', () => renderSolServicioRowEdit(row, r));
  delBtn.addEventListener('click', async () => {
    if (!confirm('¿Eliminar esta solicitud de servicio? Esta acción no se puede deshacer.')) return;
    delBtn.disabled = true;
    try {
      const { error } = await supabaseClient.from('solicitudes_servicio').delete().eq('id', r.id);
      if (error) throw error;
      cargarSolicitudesServicioActual();
    } catch (e) {
      console.error('Error eliminando la solicitud:', e);
      alert('No se pudo eliminar la solicitud.');
      delBtn.disabled = false;
    }
  });
}

function renderSolServicioRowEdit(row, r) {
  row.innerHTML = '';
  const clienteInput = document.createElement('input');
  clienteInput.type = 'text';
  clienteInput.value = r.cliente_codigo || '';
  clienteInput.placeholder = 'Código de cliente';
  const estadoSel = document.createElement('select');
  SOL_ESTADOS.forEach((e) => {
    const opt = document.createElement('option');
    opt.value = e.v;
    opt.textContent = e.l;
    if (e.v === r.estado) opt.selected = true;
    estadoSel.appendChild(opt);
  });
  const actions = el('div', 'sol-actions');
  const saveBtn = el('button', 'btn btn-dark btn-sm', 'Guardar');
  saveBtn.type = 'button';
  const cancelBtn = el('button', 'btn btn-line-dark btn-sm', 'Cancelar');
  cancelBtn.type = 'button';
  actions.append(saveBtn, cancelBtn);
  row.append(
    labeledCell('ID', el('strong', '', r.id != null ? String(r.id) : '—')),
    labeledCell('No. de solicitud', el('strong', 'sol-num', r.numero_solicitud || '—')),
    labeledCell('Código de cliente', clienteInput),
    labeledCell('Estado', estadoSel),
    actions
  );
  cancelBtn.addEventListener('click', () => renderSolServicioRowView(row, r));
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    try {
      const payload = { cliente_codigo: clienteInput.value.trim() || null, estado: estadoSel.value };
      const { error } = await supabaseClient.from('solicitudes_servicio').update(payload).eq('id', r.id);
      if (error) throw error;
      r.cliente_codigo = payload.cliente_codigo;
      r.estado = payload.estado;
      renderSolServicioRowView(row, r);
    } catch (e) {
      console.error('Error actualizando la solicitud:', e);
      alert('No se pudo guardar el cambio.');
      saveBtn.disabled = false;
    }
  });
}

$('#qSolServicioGateBtn')?.addEventListener('click', async () => {
  await confirmarSolAdmin($('#qSolServicioClave'), $('#qSolServicioGateErr'));
  actualizarVisibilidadSolServicio();
});
$('#qSolServicioClave')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('#qSolServicioGateBtn')?.click(); } });

/* Los botones "Solicitar cotización"/"Enviar por correo" y "Adjuntar
   cotización (PDF)" solo se muestran si hay sesión iniciada como
   Administrador o Super administrador — no están disponibles para un
   visitante sin identificarse. */
function actualizarVisibilidadAccionesCotizacion() {
  const bloque = $('#qAccionesAdminBlock');
  if (bloque) bloque.hidden = !esAdminOSuperAdmin();
  /* El "Promotor de negocio" solo lo ve y elige el Administrador o el
     Super Administrador; el público general no lo necesita. */
  const campoPromotor = $('#qPromotorField');
  if (campoPromotor) campoPromotor.hidden = !esAdminOSuperAdmin();
  actualizarVisibilidadPromotoresServicio();
}

actualizarVisibilidadSolServicio();
actualizarVisibilidadAccionesCotizacion();

/* El botón "Buscar Servicio" y su panel de búsqueda/listado (tipo de
   servicio, estado, lista de registros y "Mostrar") se retiraron de aquí:
   esa búsqueda y listado ahora viven en Administración > Servicios. Estos
   dos formateadores se conservan porque los sigue usando ese nuevo listado
   (y el de Proyectos). */
function formatQBuscarRegPresupuesto(v) {
  if (v === null || v === undefined || v === '') return 'Sin presupuesto';
  const n = Number(v);
  return Number.isFinite(n) ? ('Q ' + n.toLocaleString('es-GT')) : String(v);
}

function formatQBuscarRegFecha(v) {
  if (!v) return 'Sin fecha';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
