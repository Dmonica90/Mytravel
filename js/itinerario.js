/* Itinerario del viaje Barcelona → Madrid → Toledo (15–21 oct 2026).
   Todo el contenido de la web sale de este archivo: para cambiar una hora, un precio
   o una parada, edita el objeto correspondiente. Cada parada con `pin` aparece en el mapa
   (lat/lng reales) y `t` (HH:MM, hora de España) alimenta el modo "Ahora". */
var DAYS = [
 {id:'d1', iso:'2026-10-15', travel:'transit', n:'01', date:'15 oct', city:'Barcelona', tone:'primary', map:'bcn',
  title:['Llegada y ', 'asentamiento.'], sub:'Monica llega a las 19:00 en tren. Descanso y cena cerca del hotel.',
  ov:'Llega Monica 19:00 (tren). Descanso, cena hotel.',
  blocks:[{type:'tl', items:[
    {t:'19:00', icon:'train-front', title:'Tren Madrid → Barcelona', detail:'Llegada a Estación Sants · 19:00–20:00', q:'Estació de Sants Barcelona', pin:{lat:41.3791,lng:2.1400,l:'Sants'}},
    {t:'20:00', icon:'car-taxi-front', title:'Taxi o Metro L4 al hotel', detail:'Hotel en la Barceloneta · 20:00–20:30', cost:'8€', q:'Barceloneta, Barcelona', pin:{lat:41.3797,lng:2.1885,l:'Hotel',hotel:true}},
    {t:'20:30', icon:'bed-double', title:'Check-in y descanso', detail:'Exploración del barrio Barceloneta si tienen energía.'},
    {t:'21:00', icon:'utensils', title:'Cena', detail:'Mercat Barceloneta (casual) o room service.', cost:'8–12€', q:'Mercat de la Barceloneta', pin:{lat:41.3807,lng:2.1893,l:'Mercat Barceloneta'}}
  ]}],
  budget:[['Tren Madrid → Barcelona','~50€ (compra con anticipación)'],['Taxi/Metro estación → hotel','8€'],['Cena','10€']], total:'68€'},

 {id:'d2', iso:'2026-10-16', travel:'walking', n:'02', date:'16 oct', city:'Barcelona', tone:'primary', map:'bcn',
  title:['Monica en Articulate, ', 'Nando explora.'], sub:'Monica está en el evento de 8:00 a 18:30. Nando tiene el día libre para una ruta medieval + anime por el Born y el Gòtic.',
  ov:'Monica: evento Articulate 8:00–18:30. Nando explora solo (medieval + anime).',
  pre:{who:'Monica · Articulate', items:[
    {t:'08:00', icon:'coffee', title:'Desayuno y comienza el evento', detail:'08:00–10:00'},
    {t:'10:00', icon:'briefcase', title:'Evento', detail:'10:00–18:30 · asumir todo ocupado'},
    {t:'18:30', icon:'heart', title:'Disponible', detail:'Evento casi todo el día: Monica se cansará. Mantener cena ligera.'}
  ]},
  blocks:[{type:'tl', label:'Nando · Ruta medieval + anime (8:30–17:30)', items:[
    {t:'08:30', icon:'coffee', title:'Desayuno · Mercat Barceloneta', detail:'El mismo de siempre.', cost:'2,50€', q:'Mercat de la Barceloneta', pin:{lat:41.3807,lng:2.1893,l:'Mercat Barceloneta'}},
    {t:'09:30', icon:'landmark', title:'Carrer de Montcada', why:'Arcos góticos perfectos, ambiente de RPG medieval.', detail:'Palacios góticos medievales · Barrio Gótico (Born) · 45 min · fotos perfectas para “castle vibes”.', cost:'Gratis', q:'Carrer de Montcada Barcelona', pin:{lat:41.3846,lng:2.1812,l:'Montcada'}},
    {t:'10:30', icon:'palette', title:'Museu Picasso', why:'Obras cubistas = geometría visual (anime-like).', detail:'Carrer Montcada, 15–23 · 1,5 horas (pausado).', cost:'14€', tips:['Reservar online.','Audioguía +5€ (recomendada).'], q:'Museu Picasso Barcelona', pin:{lat:41.3852,lng:2.1808,l:'Picasso'}},
    {t:'12:15', icon:'church', title:'Basílica Santa Maria del Mar', why:'Interior gótico sublime = “Cathedral Fantasy”.', detail:'Plaça Santa Maria · 45 min.', cost:'Gratis', tips:['Silencio, luz vertical, acústica perfecta.'], q:'Basílica de Santa Maria del Mar', pin:{lat:41.3838,lng:2.182,l:'Sta. Maria del Mar'}},
    {t:'13:15', icon:'utensils', title:'Comida', detail:'1 hora.', cost:'10€', pin:{lat:41.3794,lng:2.1898,l:'La Cova Fumada'},
     opts:[{n:'La Cova Fumada', c:'8–10€', lines:['Local hardcore.','Llegar antes de las 12:00.'], q:'La Cova Fumada Barcelona'},
           {n:'Mercat Santa Caterina', c:'10–12€', lines:['Más moderno.'], q:'Mercat de Santa Caterina'}]},
    {t:'14:30', icon:'gamepad-2', title:'Videojuegos (opcional)', detail:'Si quiere continuidad “gaming”.',
     opts:[{n:'A · CosmoCaixa', c:'6€ + 4€', lines:['Planetario + museo interactivo.','Avinguda de l’Estadi, 60 (norte de Barcelona, requiere metro).','2 horas (con VR opcional). Aire acondicionado, perfecto si llueve.'], q:'CosmoCaixa Barcelona'},
           {n:'B · Museu del Videojoc', c:'~8€', lines:['Museu del Videojoc i del Ciberespai.','Verificar ubicación: puede estar cerrado en 2026.','1–1,5 horas.']},
           {n:'C · Saltar', lines:['Saltar esto y continuar con arquitectura.']}]},
    {t:'16:00', icon:'castle', title:'Barri Gòtic · paseo libre', detail:'Callejones góticos, Plaça Reial (farolas Gaudí) y Catedral exterior · 1,5 horas.', cost:'Gratis', tips:['+2€ café si quiere.'], q:'Barri Gòtic Barcelona', pin:{lat:41.3826,lng:2.1771,l:'Barri Gòtic'}},
    {t:'17:30', icon:'house', title:'Vuelta al hotel', detail:'Antes de que Monica termine el evento.', q:'Barceloneta, Barcelona', pin:{lat:41.3797,lng:2.1885,l:'Hotel',hotel:true}}
  ]}],
  offmap:'CosmoCaixa queda fuera del mapa, al norte (en metro).',
  post:{title:'Reunión pareja · 18:30', icon:'heart', text:['Cena ligera: Can Culleretes o taberna cercana (6–8€ cada uno).','Descanso, charla sobre el día.']},
  budget:[['Desayuno','2,50€'],['Metro (3–4 viajes)','6€'],['Museu Picasso','14€'],['Comida','10€'],['CosmoCaixa (opcional)','10€'],['Café/misceláneos','3€']], total:'45€', totalNote:'Sin CosmoCaixa: 35€'},

 {id:'d3', iso:'2026-10-17', travel:'walking', n:'03', date:'17 oct', city:'Barcelona', tone:'primary', map:'bcn',
  title:['La ruta compartida, ', 'diez paradas.'], sub:'Día completo juntos: Born, Barrio Gótico, Ciutadella y Puerto. 14 horas, ~25 km a pie, 32–40€.',
  ov:'Ambos libres. Ruta compartida: 10 paradas, 32€.',
  blocks:[{type:'tl', items:[
    {t:'07:30', icon:'coffee', title:'Desayuno · Mercat Barceloneta', detail:'A 5 min del hotel · café con jamón ibérico, pan tumaca, churros · 45 min.', cost:'2,50€', tips:['Llegar temprano, es muy concurrido.'], q:'Mercat de la Barceloneta', pin:{lat:41.3807,lng:2.1893,l:'Mercat Barceloneta'}},
    {t:'08:30', icon:'landmark', title:'Carrer de Montcada', detail:'Palacios medievales, arcos góticos, patios interiores · 30 min (fotos incluidas).', cost:'Gratis', tips:['Mejor luz matutina, sin turistas aún.'], q:'Carrer de Montcada Barcelona', pin:{lat:41.3846,lng:2.1812,l:'Montcada'}},
    {t:'10:00', icon:'church', title:'Basílica Santa Maria del Mar', detail:'Plaça Santa Maria, Born · interior gótico, vitrales, acústica sublime · 45 min.', cost:'Gratis', tips:['Donación voluntaria ~1€.','Silencio interior, meditación posible.'], q:'Basílica de Santa Maria del Mar', pin:{lat:41.3838,lng:2.182,l:'Sta. Maria del Mar'}},
    {t:'12:30', icon:'utensils', title:'Comida', detail:'1 hora (comer + esperar).', cost:'10€', pin:{lat:41.3862,lng:2.1786,l:'Sta. Caterina'},
     opts:[{n:'A · Mercat Santa Caterina', c:'10–12€', lines:['Avinguda de Francesc Cambó, 20 · abierto hasta 20h.','Mercado convertido en restaurante: pulpo, jamón, verduras frescas.'], q:'Mercat de Santa Caterina'},
           {n:'B · La Cova Fumada', c:'8–10€', lines:['Carrer Baluard, 56 (Barceloneta) · 12:00–15:30.','Sin reservas: llegar antes de las 12:00.','Montaditos, croquetas, pa amb tomàquet.'], q:'La Cova Fumada Barcelona'},
           {n:'C · Can Solé', c:'12–15€', lines:['En la Barceloneta, muy cerca del hotel.','Cerrado lunes: verificar.'], q:'Can Solé Barcelona'}]},
    {t:'13:30', icon:'trees', title:'Descanso · Parc de la Ciutadella', detail:'Passeig de Picasso · Cascada Monumental, lago, gente local · 1,5 horas.', cost:'3–5€', tips:['Picar algo ligero si hace falta, no comer de nuevo.'], q:'Parc de la Ciutadella', pin:{lat:41.3897,lng:2.1866,l:'Ciutadella'}},
    {t:'16:00', icon:'palette', title:'Museu Picasso', detail:'Carrer de Montcada, 15–23 · Las Meninas (4 versiones), obras cubistas, azulejos · 1,5 horas.', cost:'0€', tips:['Entrada gratis jueves 16–19h: no reservar online.','Horario: viernes–domingo 10–20h, jueves 10–21h.','Audioguía 5€ (muy recomendada).','Posible fila a las 18h: ir a las 16:00.'], q:'Museu Picasso Barcelona', pin:{lat:41.3852,lng:2.1808,l:'Picasso'}},
    {t:'17:30', icon:'church', title:'Catedral (exterior)', detail:'Plaça de la Seu · fachada frontal, luz de atardecer, gárgolas · 30 min.', cost:'Gratis', tips:['Interior + subida: 16€, menos importante que el exterior.','Mejor foto entre 17:30 y 18:30 con luz naranja.'], q:'Catedral de Barcelona', pin:{lat:41.384,lng:2.1762,l:'Catedral'}},
    {t:'18:00', icon:'camera', title:'Plaça Reial · mejor foto del día', detail:'Arcadas, dos farolas de Gaudí, palmeras, atardecer en azul · 45 min.', cost:'Gratis', tips:['Mejor foto desde la esquina SE.','Esperar la luz azul después del atardecer.','Evitar turistas: ir antes de 18:15.'], q:'Plaça Reial Barcelona', pin:{lat:41.3801,lng:2.1754,l:'Plaça Reial'}},
    {t:'18:30', icon:'wine', title:'Cena', detail:'1,5 horas (comer + esperar).', cost:'8€', pin:{lat:41.3816,lng:2.1745,l:'Can Culleretes'},
     opts:[{n:'A · Can Culleretes', c:'7–10€', lines:['Recomendado. Carrer Quintana, 5 · 13:00–23:00.','Taberna histórica (1786): conejo frito, espinacas, fideuà, postre casero.','Menú del día 7–10€ / carta 12–15€. Reservar no es necesario.'], q:'Can Culleretes Barcelona'},
           {n:'B · Els Quatre Gats', c:'8–12€', lines:['Plaça de Sant Felip Neri, 5 · 08:00–23:00.','Café modernista donde merendaba Picasso: coca de recapte, croquetas Roquefort.'], q:'Els Quatre Gats Barcelona'},
           {n:'C · La Vinya del Senyor', c:'10–14€', lines:['Plaça Santa Maria del Mar, 5 · 12:00–00:00.','Terracita en la plaça: jamón, queso, vino DO Penedès.'], q:'La Vinya del Senyor Barcelona'}]},
    {t:'20:00', icon:'moon', title:'Paseo nocturno · Moll de la Fusta', detail:'Barcos iluminados y agua · última bebida · 1 hora.', cost:'3–5€', tips:['Mejor foto 20:30–21:00 (azul profundo + luces).','Llevar un trapo pequeño por la humedad del puerto.'], q:'Moll de la Fusta Barcelona', pin:{lat:41.3778,lng:2.1805,l:'Moll de la Fusta'}}
  ]}],
  extra:[
    {title:'Fotos clave', icon:'camera', ol:['Montcada: arcos góticos al amanecer.','Santa Maria: vitrales e interiores.','Ciutadella: cascada y lago.','Picasso: Las Meninas.','Catedral: fachada y gárgolas con luz naranja.','Plaça Reial: arcadas y farolas (la mejor del viaje).','Puerto: barcos nocturnos y agua.']},
    {title:'Cosas a evitar', icon:'triangle-alert', ol:['No comer en cadenas turísticas.','No llevar mucho efectivo, pero tampoco ir sin él.','No entrar a la catedral si llueve.','No salir de ruta después de las 21h.','No olvidar el móvil o la cámara en un café.']}
  ],
  budgetCols:['Concepto','Mín.','Máx.','Típico'],
  budget:[['Desayuno (Mercat)','2€','4€','2,50€'],['Metro (3 viajes)','3€','10€','6€'],['Comida (mercado)','8€','12€','10€'],['Café Ciutadella','2€','5€','3€'],['Museu Picasso','0€','5€','0€'],['Catedral exterior','0€','16€','0€'],['Cena','7€','15€','9€'],['Bebida nocturna','2€','5€','3€']],
  totalRow:['Total','24€','72€','32€'], totalNote:'Llevar 40€ en efectivo (margen de error).'},

 {id:'d4', iso:'2026-10-18', travel:'transit', n:'04', date:'18 oct', city:'Barcelona → Madrid', tone:'tertiary', map:'trip',
  title:['Último paseo y ', 'tren a Madrid.'], sub:'Mañana flexible en Barcelona, checkout a las 11:00 y tren de 14:00 a 16:30.',
  ov:'Checkout ~11:00. Tren 14:00–16:30. Tarde en Madrid.',
  blocks:[
   {type:'tl', label:'Mañana en Barcelona', items:[
    {t:'09:00', icon:'coffee', title:'Desayuno relajado'},
    {t:'10:00', icon:'camera', title:'Exploración última', detail:'Barrio Gótico, fotos que faltaron.'},
    {t:'11:00', icon:'luggage', title:'Checkout del hotel'}]},
   {type:'tl', label:'Viaje Barcelona → Madrid', items:[
    {t:'14:00', icon:'train-front', title:'Salida del tren · Estación Sants', detail:'Duración 2,5 horas · compra online.', cost:'~40€', tips:['Compartir tren, ventana, snacks.'], q:'Estació de Sants Barcelona', pin:{lat:41.3791,lng:2.1400,l:'Sants'}},
    {t:'16:30', icon:'map-pin', title:'Llegada · Puerta de Atocha', q:'Estación Puerta de Atocha Madrid', pin:{lat:40.4066,lng:-3.6892,l:'Atocha'}}]},
   {type:'tl', label:'Llegada a Madrid', items:[
    {t:'17:00', icon:'car-taxi-front', title:'Taxi o metro al hotel', detail:'Vallecas o centro.'},
    {t:'17:30', icon:'bed-double', title:'Check-in', detail:'Reserva de antemano.'},
    {t:'18:00', icon:'footprints', title:'Exploración del barrio y descanso'},
    {t:'19:30', icon:'utensils', title:'Cena', detail:'Tapas cerca del hotel.', cost:'10–12€'}]}
  ],
  budget:[['Desayuno Barcelona','5€'],['Tren Barcelona → Madrid (x2)','80€'],['Taxi/Metro Atocha → hotel','8€'],['Hotel Madrid (1 noche)','60–100€'],['Cena','24€']], total:'177€'},

 {id:'d5', iso:'2026-10-19', travel:'walking', n:'05', date:'19 oct', city:'Madrid', tone:'tertiary', map:'mad',
  title:['Madrid completo, ', 'de Goya a Guernica.'], sub:'Itinerario económico de 14 horas: Prado, Retiro, centro histórico y Reina Sofía por la noche.',
  ov:'Ambos libres. Madrid día completo.',
  blocks:[{type:'tl', items:[
    {t:'08:00', icon:'coffee', title:'Desayuno · cafetería local', detail:'Cerca del hotel · 30 min.', cost:'3€'},
    {t:'09:00', icon:'landmark', title:'Museo del Prado', why:'Cuadros góticos, arte oscuro, Goya (temáticas complejas).', whoWhy:true, detail:'Paseo del Prado, s/n · 2 horas (pausado).', cost:'15€', tips:['Gratis en ciertos horarios (noche, domingos).','Enfocarse en Goya (dark vibes) y Las Meninas (Velázquez).'], q:'Museo del Prado', pin:{lat:40.4138,lng:-3.6921,l:'Prado'}},
    {t:'11:30', icon:'trees', title:'Retiro + Palacio Real', why:'Parque histórico, lago, paisaje medieval.', detail:'Parque del Retiro, caminable desde el Prado · 1,5 horas de paseo.', cost:'Gratis', tips:['+2€ café si quieren.'], q:'Parque del Retiro Madrid', pin:{lat:40.4153,lng:-3.6845,l:'Retiro'}},
    {t:'13:00', icon:'utensils', title:'Comida', cost:'12€', pin:{lat:40.4153,lng:-3.7089,l:'San Miguel'},
     opts:[{n:'A · Mercado San Miguel', c:'12–15€', lines:['Plaza San Miguel, s/n (centro).','Fusión moderna, compartir tapas. Turístico pero bueno.'], q:'Mercado de San Miguel Madrid'},
           {n:'B · Taberna La Bola', c:'10–12€', lines:['Calle Bola, 5.','Madrileño tradicional: cocido madrileño. Local, viejo.'], q:'Taberna La Bola Madrid'},
           {n:'C · Restaurante del Prado', c:'12–18€', lines:['Dentro del museo: no pierden tiempo.']}]},
    {t:'14:15', icon:'compass', title:'Exploración libre (elegir 1–2)', pin:{lat:40.4155,lng:-3.7074,l:'Plaza Mayor'},
     opts:[{n:'A · Plaza Mayor', c:'Gratis', lines:['Centro histórico, renacentista-medieval · 1 hora (+ café 2€).'], q:'Plaza Mayor Madrid'},
           {n:'B · Malasaña', c:'5–10€', lines:['Hipster + vintage: tiendas indie, murales, galerías · 1,5–2 horas.'], q:'Malasaña Madrid'},
           {n:'C · Templo de Debod', c:'Gratis', lines:['Templo egipcio con vistas · 1 hora.','Mejor foto de atardecer de Madrid (16:45–17:30).'], q:'Templo de Debod'},
           {n:'D · América Latina + centro', c:'Gratis', lines:['Barrio multicultural (sur): murales, tiendas latinas · 1,5 horas (+ comida 8€).']}]},
    {t:'16:30', icon:'coffee', title:'Café descanso', detail:'Terraza en el centro · 30 min.', cost:'3–4€'},
    {t:'17:15', icon:'palette', title:'Museo Reina Sofía', why:'Guernica de Picasso (oscuro, geopolítico), arte moderno y contemporáneo.', whoWhy:true, detail:'Calle de Santa Isabel, 52 · 1,5 horas.', cost:'12€', tips:['Gratis por la noche jueves–sábado (18:00–21:00): no compren entrada.','Si van a la hora gratis: 19:00–20:30.'], q:'Museo Reina Sofía', pin:{lat:40.4086,lng:-3.6943,l:'Reina Sofía'}},
    {t:'18:45', icon:'sunset', title:'Atardecer', detail:'1 hora.', cost:'Gratis–5€', pin:{lat:40.424,lng:-3.7178,l:'Templo de Debod'},
     opts:[{n:'Templo de Debod', lines:['Vistas 360°, gratis.'], q:'Templo de Debod'},{n:'Paseo Retiro', lines:['Romántico.']},{n:'Terraza', lines:['Casco antiguo.']}]},
    {t:'20:00', icon:'wine', title:'Cena', cost:'15€',
     opts:[{n:'A · El Club Allard', c:'50€+', lines:['Michelin, si el presupuesto lo permite. Reservar con anticipación.']},
           {n:'B · Café Gijón', c:'15–20€', lines:['Paseo de Recoletos, 21. Histórico, literario.'], q:'Café Gijón Madrid'},
           {n:'C · Taberna El Sur', c:'10–15€', lines:['Calle de Barquillo, 26. Andaluza: gazpacho, rabo de toro.']},
           {n:'D · Casa Botín', c:'20–30€', lines:['Calle de los Cuchilleros, 17. El restaurante más antiguo del mundo: cochinillo asado.'], q:'Restaurante Botín Madrid'}]},
    {t:'21:30', icon:'moon', title:'Paseo de noche (opcional)', detail:'Retiro iluminado, Plaza Mayor con bares o Malasaña · 1 hora.', cost:'Gratis–5€'}
  ]}],
  callout:{tone:'accent', icon:'info', title:'Importante', text:'Museo Reina Sofía es gratis jueves–sábado de 18:00 a 21:00: no compren entrada.'},
  budget:[['Desayuno','3€'],['Museo del Prado','15€'],['Retiro','Gratis'],['Comida','12€'],['Café','3€'],['Museo Reina Sofía','0€ (noche gratis) o 12€'],['Cena','15€'],['Metro/transporte','8€']], total:'56€', totalNote:'Sin Reina Sofía.'},

 {id:'d6', iso:'2026-10-20', travel:'walking', n:'06', date:'20 oct', city:'Toledo', tone:'secondary', map:'tol',
  title:['Excursión a Toledo, ', 'ciudad medieval.'], sub:'De 6:00 a 20:00. El Greco, el Alcázar y un casco antiguo intacto, a una hora en tren de Madrid.',
  ov:'Excursión Toledo 6:00–20:00. El Greco + Alcázar.',
  why:['Ciudad medieval: arquitectura medieval que a Nando le encantará.','El Greco: pintor místico, cuadros góticos y oscuros.','Alcázar: fortaleza medieval.','Casco antiguo intacto del siglo XVI, a 1 hora de Madrid.'],
  blocks:[{type:'tl', items:[
    {t:'05:30', icon:'alarm-clock', title:'Despertar y café rápido', detail:'06:00 salida del hotel → Estación Atocha (metro).'},
    {t:'07:00', icon:'train-front', title:'Tren Madrid → Toledo', detail:'AVE o regional · 30–60 min (el regional es más barato) · llegada ~08:00.', cost:'10–18€', q:'Estación de tren de Toledo', pin:{lat:39.8628,lng:-4.0118,l:'Estación'}},
    {t:'08:30', icon:'castle', title:'Alcázar', detail:'Cima de la ciudad · fortaleza imponente, museo militar · 45 min.', cost:'5€', tips:['Gratis si solo ven el exterior.','Foto perfecta desde el puente (vista clásica).'], q:'Alcázar de Toledo', pin:{lat:39.8578,lng:-4.0207,l:'Alcázar'}},
    {t:'09:45', icon:'church', title:'Catedral', detail:'Centro de la ciudad · gótico puro, interior suntuoso · 1 hora.', cost:'12€', tips:['Audioguía recomendada +3€.','Cuadro: “Asunción” de El Greco.'], q:'Catedral Primada de Toledo', pin:{lat:39.8569,lng:-4.0237,l:'Catedral'}},
    {t:'11:15', icon:'palette', title:'Museo El Greco', detail:'Casa museo El Greco · 16 cuadros, ambiente renacentista · 1 hora.', cost:'3€', tips:['Cuadro clave: “Vista de Toledo”.'], q:'Museo del Greco Toledo', pin:{lat:39.8559,lng:-4.0283,l:'El Greco'}},
    {t:'13:00', icon:'utensils', title:'Comida', detail:'13:00–14:15.', cost:'14€', pin:{lat:39.8572,lng:-4.0247,l:'Casa Aurelio'},
     opts:[{n:'Casa Aurelio', c:'12–15€', lines:['Calle Sinagoga, 6. Especialidad: carcamusa (típico de Toledo).'], q:'Restaurante Casa Aurelio Toledo'},
           {n:'Venta del Alma', c:'10–14€', lines:['Terraza con vistas. Rabo de toro, carne.'], q:'Venta del Alma Toledo'}]},
    {t:'14:30', icon:'compass', title:'Exploración libre', detail:'14:30–16:00.', pin:{lat:39.859,lng:-4.0312,l:'S. Juan de los Reyes'},
     opts:[{n:'A · San Juan de los Reyes', c:'4€', lines:['Monasterio gótico.'], q:'Monasterio de San Juan de los Reyes'},
           {n:'B · Callejones', c:'Gratis', lines:['Paseo por callejones medievales sin plan, fotos.']},
           {n:'C · Sinagoga del Tránsito', c:'3€', lines:['Sinagoga + Museo Sefardí.'], q:'Sinagoga del Tránsito Toledo'},
           {n:'D · Mirador del Valle', lines:['Vistas épicas.'], q:'Mirador del Valle Toledo'}]},
    {t:'16:15', icon:'camera', title:'Café mirador y fotos', detail:'Desde el puente: Alcázar + catedral · 1 hora (atardecer).', cost:'4€', q:'Puente de Alcántara Toledo', pin:{lat:39.8593,lng:-4.017,l:'Puente'}},
    {t:'18:00', icon:'train-front', title:'Tren Toledo → Madrid', detail:'Regional 18:00–19:30 · llegada a Madrid ~19:30.', cost:'10–18€'},
    {t:'19:45', icon:'bed-double', title:'Llegada a Madrid y descanso', detail:'Cena ligera (tapas o room service). Dormir temprano: vuelo mañana a las 9:00.', cost:'8€'}
  ]}],
  callout:{tone:'tip', icon:'lightbulb', title:'Tips Toledo', list:['Ir pronto (8:00) = menos turistas.','Llevar botella de agua (subidas).','Cámara preparada (vistas épicas).','2 horas es el mínimo, mejor 3–4.']},
  budget:[['Tren Madrid → Toledo','15€'],['Alcázar (exterior/interior)','5€'],['Catedral','12€'],['Museo El Greco','3€'],['Comida Toledo','14€'],['Café','4€'],['Tren Toledo → Madrid','15€'],['Metro/transporte','4€']], total:'72€'},

 {id:'d7', iso:'2026-10-21', travel:'driving', n:'07', date:'21 oct', city:'Madrid', tone:'tertiary', map:'mad',
  title:['Vuelo y ', 'regreso.'], sub:'Madrugada: salida del hotel a las 7:00 para el vuelo de las 9:00.',
  ov:'Madrugada. Vuelo 9:00 (salida hotel 7:00).',
  blocks:[{type:'tl', items:[
    {t:'06:30', icon:'alarm-clock', title:'Despertar y desayuno rápido', cost:'3€'},
    {t:'07:00', icon:'luggage', title:'Checkout del hotel'},
    {t:'07:30', icon:'car-taxi-front', title:'Taxi al aeropuerto', cost:'15€'},
    {t:'09:00', icon:'plane', title:'Salida del avión', detail:'Destino: por confirmar. Pasaporte listo.', q:'Aeropuerto Adolfo Suárez Madrid-Barajas', pin:{lat:40.4936,lng:-3.5668,l:'Barajas'}}
  ]}],
  budget:[['Desayuno','3€'],['Taxi hotel → aeropuerto','15€']], total:'18€'}
];

var GLOBAL = {
  bcn:{title:'Barcelona · 15–18 oct', tone:'primary', rows:[['D1 · Tren + taxi + cena','68€'],['D2 · Exploración de Nando','45€'],['D2 · Cena Monica + Nando','16€'],['D3 · Ruta compartida','32€'],['D4 · Checkout + tren + hotel + cena','177€']], total:['Subtotal Barcelona','338€']},
  mad:{title:'Madrid · 18–21 oct', tone:'tertiary', rows:[['D5 · Madrid completo','56€'],['D6 · Excursión Toledo','72€'],['D7 · Vuelo + desayuno','18€']], total:['Subtotal Madrid','146€']},
  all:{title:'Total viaje (ambas personas)', tone:'secondary', rows:[['Transporte (trenes, metro, taxi)','200€'],['Hoteles (2 noches BCN + 2 noches MAD)','160€'],['Museos + entradas','60€'],['Comidas + cenas','150€'],['Cafés + descansos','30€'],['Misceláneos','20€']], total:['Total general','~620€'], note:'Por persona: ~310€'}
};
var BUDGET_NOTES = ['Hoteles: buscar Airbnb u hostal para ahorrar (50–80€/noche vs 60–100€).','Museos: muchos son gratis en horarios específicos (Reina Sofía, Prado de noche).','Transporte: T-casual en Barcelona (13€, 10 viajes) en vez de billetes sencillos (2,90€).'];
var APPS = [['Google Maps','Rutas, metros','Gratis'],['Citymapper','Mejor que Google para metro','Gratis'],['TMB','Comprar T-casual en Barcelona','Gratis'],['Renfe.com','Comprar trenes','~15–50€/billete'],['Airbnb / Booking','Hoteles económicos','50–100€/noche'],['Timeout Barcelona/Madrid','Guía de lugares','Gratis'],['Museos.es','Horarios + promos','Gratis']];
var PACK = ['Chaqueta ligera (mañanas frescas).','Zapatillas cómodas (25 km de caminata).','Protector solar y gafas de sol.','Botella reutilizable (fuentes públicas).','Trapo pequeño (humedad del puerto).','Cargador portátil (días largos).','Efectivo: 35–40€ mínimo; tarjeta de débito de respaldo.'];
var CHECKS = [
  {title:'Antes del viaje', items:['Pasaportes vigentes','Seguros de viaje','Reservar trenes (Renfe.com)','Reservar hoteles Barcelona (2 noches) + Madrid (2 noches)','Cambiar dinero a EUR si es necesario','Notificar al banco del viaje']},
  {title:'Barcelona (D1–D4)', items:['Llegar 19:00, taxi al hotel','D2: Nando ruta medieval (Picasso, Montcada, iglesias)','D3: Ruta compartida 10 paradas (7:30–20:00)','D4: Salida 14:00 a Madrid']},
  {title:'Madrid y Toledo (D4–D7)', items:['Check-in ~17:00','D5: Prado + Retiro + Reina Sofía noche (gratis)','D6: Toledo madrugada (6:00–20:00)','D6: Alcázar + Catedral + Museo El Greco','D6: Comida en Toledo','D6: Fotos de atardecer desde el puente','D7: Vuelo 9:00 (salir del hotel 7:00)']},
  {title:'Pendientes por confirmar', items:['Articulate (16 oct): confirmar horario exacto','Park Güell (18 oct): ¿incluir en la mañana antes del tren?','Tren a Madrid (18 oct): verificar hora de salida','Destino del vuelo del 21 oct']}
];
var NOTES = [
  {title:'Para Monica', tone:'primary', items:['D2 agotador (Articulate 8:00–18:30): descanso después, cena ligera.','D3 compartido: ruta ya planificada, 32€, económica.','D5 flexible: Madrid según energía (puede saltarse museos si está cansada).']},
  {title:'Para Nando', tone:'secondary', items:['D2 exploración: medieval + anime (Picasso cubismo, iglesias góticas).','D5 Madrid: Prado (Goya dark) + Reina Sofía (Guernica).','D6 Toledo: épico, arquitectura medieval pura (Alcázar, catedral, callejones).']},
  {title:'Recomendación general', tone:'tertiary', items:['Compren los trenes con anticipación (15–20€ vs 30€+ a último momento).','Airbnb vs hotel: ahorrar 50–80€/noche.','Museos de noche gratis: Reina Sofía jueves–sábado 18–21h.','Toledo vale cada euro.']}
];

var esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
var gm = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
var isFree = c => /^(gratis|0€)/i.test(c||'');

function renderItem(it, dayId, pinIndex){
  const pinAttr = it.pin ? ` data-pin="${pinIndex}" tabindex="0" role="button" aria-label="${esc(it.title)}: ver en el mapa"` : '';
  let h = `<li class="item${it.pin?' has-pin':''}"${pinAttr}>
    <div class="item-time"><span class="time">${esc(it.t)}</span>${it.pin?`<span class="pin-n">${pinIndex+1}</span>`:''}</div>
    <div class="item-body">
      <div class="item-head"><div class="item-title"><i data-lucide="${it.icon||'dot'}"></i><span>${esc(it.title)}</span></div>${it.cost?`<span class="cost${isFree(it.cost)?' free':''}">${esc(it.cost)}</span>`:''}</div>`;
  if (it.why) h += `<p class="why"><b>${it.whoWhy?'¿Por qué Nando?':'¿Por qué?'}</b> ${esc(it.why)}</p>`;
  if (it.detail) h += `<p class="item-detail">${esc(it.detail)}</p>`;
  if (it.opts) {
    const gid = `${dayId}-o${Math.random().toString(36).slice(2,7)}`;
    h += `<div class="opts"><div class="opt-tabs" role="tablist">${it.opts.map((o,i)=>`<button type="button" role="tab" class="opt-tab" id="${gid}-t${i}" aria-controls="${gid}-p${i}" aria-selected="${i===0}">${esc(o.n)}</button>`).join('')}</div>
      ${it.opts.map((o,i)=>`<div class="opt-panel" role="tabpanel" id="${gid}-p${i}" aria-labelledby="${gid}-t${i}"${i?' hidden':''}>
        <div class="opt-name"><span>${esc(o.n.replace(/^[A-D] · /,''))}</span>${o.c?`<span class="cost${isFree(o.c)?' free':''}">${esc(o.c)}</span>`:''}</div>
        <ul class="tips">${o.lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>
        ${o.q?`<a class="gmaps" href="${gm(o.q)}" target="_blank" rel="noopener"><i data-lucide="map-pin"></i>Abrir en Google Maps</a>`:''}
      </div>`).join('')}</div>`;
  }
  if (it.tips) h += `<ul class="tips">${it.tips.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`;
  if (it.q) h += `<a class="gmaps" href="${gm(it.q)}" target="_blank" rel="noopener"><i data-lucide="map-pin"></i>Abrir en Google Maps</a>`;
  return h + `</div></li>`;
}
var HOTEL_BCN = {lat:41.3797, lng:2.1885, l:'Hotel'};
var MAP_TITLES = {bcn:'Barcelona', mad:'Madrid', tol:'Toledo', trip:'Barcelona → Madrid'};
