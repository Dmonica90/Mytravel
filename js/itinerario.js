/* Itinerario del viaje Barcelona → Madrid → Toledo (15–21 oct 2026).
   Todo el contenido de la web sale de este archivo: para cambiar una hora, un precio
   o una parada, edita el objeto correspondiente. Cada parada con `pin` aparece en el mapa
   (lat/lng reales) y `t` (HH:MM, hora de España) alimenta el modo "Ahora". */
var DAYS = [
 {id:'c1', iso:'2026-10-11', tz:'America/Cancun', travel:'flight', n:'01', date:'11 oct', city:'Cancún', tone:'secondary', map:'mxcun',
  title:['Rumbo a Cancún, ', 'con Emilio y Didi.'], sub:'Vuelo Viva Aerobus VB 1380 de CDMX a Cancún, comida con Emilio y Didi, playa y cena.',
  ov:'Vuelo CDMX → Cancún 8:25–11:45. Playa y cena con Emilio y Didi.',
  blocks:[{type:'tl', items:[
    {t:'06:30', tz:'America/Mexico_City', icon:'car-taxi-front', title:'Salida al aeropuerto', detail:'AICM · Terminal 1 (hora de CDMX).', tips:['Lleguen con al menos 1,5 h de anticipación.'], q:'Aeropuerto Internacional de la Ciudad de México Terminal 1'},
    {t:'08:25', tz:'America/Mexico_City', icon:'plane', title:'Vuelo VB 1380 · CDMX → Cancún', detail:'Viva Aerobus · AICM Terminal 1 → Cancún · 2 h 20 min (hora de CDMX).', q:'Aeropuerto Internacional de la Ciudad de México Terminal 1', pin:{lat:19.4361,lng:-99.0719,l:'AICM T1'}},
    {t:'11:45', icon:'plane-landing', title:'Llegada a Cancún', detail:'Aeropuerto Internacional de Cancún (hora de Cancún).', tips:['Cancún va una hora adelante de CDMX: ajusten el reloj.'], q:'Aeropuerto Internacional de Cancún', pin:{lat:21.0365,lng:-86.8770,l:'CUN'}},
    {t:'13:30', icon:'utensils', title:'Comida con Emilio y Didi', detail:'Bienvenida y a ponerse al día.'},
    {t:'16:00', icon:'sun', title:'Tarde de playa', detail:'La playa que recomienden Emilio y Didi.'},
    {t:'20:00', icon:'wine', title:'Cena con Emilio y Didi', detail:'Primera noche juntos en Cancún.'}
  ]}],
  callout:{tone:'muted', icon:'info', title:'Plan tentativo', text:'Solo el vuelo VB 1380 está confirmado. Ajusten el resto con Emilio y Didi.'},
  budget:[['Vuelo CDMX → Cancún (VB 1380)','Ya comprado'],['Comidas y salidas','Por definir']], total:'Por definir'},

 {id:'c2', iso:'2026-10-12', tz:'America/Cancun', travel:'driving', n:'02', date:'12 oct', city:'Cancún', tone:'secondary', map:'cun',
  title:['Día de playa ', 'sin reloj.'], sub:'Desayuno con calma, playa, comida, caminata al atardecer y cena con Emilio y Didi.',
  ov:'Playa, caminata y cena con Emilio y Didi.',
  blocks:[{type:'tl', items:[
    {t:'09:30', icon:'coffee', title:'Desayuno con calma', detail:'Con Emilio y Didi, sin prisa.'},
    {t:'11:00', icon:'sun', title:'Día de playa', detail:'Toallas, bloqueador y agua.', pin:{lat:21.0606,lng:-86.7799,l:'Playa Delfines'},
     opts:[{n:'A · Playa Delfines', lines:['Zona Hotelera, mirador con el letrero de Cancún.'], q:'Playa Delfines Cancún'},
           {n:'B · Playa Gaviota Azul', lines:['Zona Hotelera, agua tranquila.'], q:'Playa Gaviota Azul Cancún'},
           {n:'C · La de Emilio y Didi', lines:['La que ellos prefieran.']}]},
    {t:'15:00', icon:'utensils', title:'Comida', detail:'Algo fresco cerca de la playa.'},
    {t:'18:00', icon:'footprints', title:'Caminata al atardecer', detail:'Paseo tranquilo con Emilio y Didi.'},
    {t:'20:30', icon:'wine', title:'Cena con Emilio y Didi', detail:'Cena en casa o salir, lo que prefieran.'}
  ]}],
  callout:{tone:'muted', icon:'info', title:'Plan tentativo', text:'Es una propuesta: cámbienla con Emilio y Didi.'},
  budget:[['Hospedaje','Con Emilio y Didi'],['Comidas y salidas','Por definir']], total:'Por definir'},

 {id:'c3', iso:'2026-10-13', tz:'America/Cancun', travel:'transit', n:'03', date:'13 oct', city:'Cancún', tone:'secondary', map:'cun',
  title:['Paseo, caminata y ', 'cena de despedida.'], sub:'Paseo opcional (Isla Mujeres, Playa del Carmen o más playa), caminata y cena de despedida con Emilio y Didi.',
  ov:'Paseo opcional y cena de despedida con Emilio y Didi.',
  blocks:[{type:'tl', items:[
    {t:'09:00', icon:'coffee', title:'Desayuno'},
    {t:'10:00', icon:'compass', title:'Paseo opcional', pin:{lat:21.1827,lng:-86.8053,l:'Puerto Juárez'},
     opts:[{n:'A · Isla Mujeres', lines:['Ferry desde Puerto Juárez, unos 20 min.','Playa Norte y paseo por la isla.'], q:'Puerto Juárez ferry Isla Mujeres'},
           {n:'B · Playa del Carmen', lines:['Alrededor de 1 h en auto.','Quinta Avenida y playa.'], q:'Playa del Carmen'},
           {n:'C · Más playa', lines:['Quedarse en Cancún y descansar.']}]},
    {t:'14:00', icon:'utensils', title:'Comida'},
    {t:'17:30', icon:'footprints', title:'Caminata', detail:'Último paseo con calma.'},
    {t:'20:00', icon:'wine', title:'Cena de despedida con Emilio y Didi', detail:'Para agradecerles la hospitalidad.'}
  ]}],
  callout:{tone:'muted', icon:'info', title:'Plan tentativo', text:'Es una propuesta: cámbienla con Emilio y Didi.'},
  budget:[['Hospedaje','Con Emilio y Didi'],['Paseo y comidas','Por definir']], total:'Por definir'},

 {id:'c4', iso:'2026-10-14', tz:'America/Cancun', travel:'flight', n:'04', date:'14 oct', city:'Cancún → Madrid', tone:'secondary', map:'cun',
  title:['Despedida y ', 'vuelo a Madrid.'], sub:'Desayuno de despedida con Emilio y Didi y vuelo Aeroméxico AM 527 + AM 1 a Madrid a las 12:40, con escala en CDMX.',
  ov:'Despedida y vuelo a Madrid a las 12:40.',
  blocks:[{type:'tl', items:[
    {t:'08:00', icon:'coffee', title:'Desayuno de despedida', detail:'Con Emilio y Didi.'},
    {t:'09:30', icon:'luggage', title:'Salida al aeropuerto', detail:'Aeropuerto de Cancún · Terminal 4. Vuelo internacional: lleguen unas 3 h antes.', q:'Aeropuerto Internacional de Cancún Terminal 4'},
    {t:'12:40', icon:'plane', title:'Vuelo AM 527 + AM 1 · Cancún → Madrid', detail:'Aeroméxico · CUN T4 → escala en CDMX → Madrid T2 · 16 h 55 min. Llegan el jueves 15 a las 12:35 (hora de Madrid).', q:'Aeropuerto Internacional de Cancún Terminal 4', pin:{lat:21.0410,lng:-86.8740,l:'CUN T4'}}
  ]}],
  callout:{tone:'info', icon:'plane', title:'Vuelos confirmados', text:'Viaje redondo Aeroméxico (Main + Básica). Los detalles y el estado en vivo están en la sección Vuelos.'},
  budget:[['Vuelo Cancún → Madrid (redondo Aeroméxico)','Ya comprado'],['Comidas','Por definir']], total:'Por definir'},
 {id:'d1', iso:'2026-10-15', travel:'transit', n:'05', date:'15 oct', city:'Madrid → Barcelona', tone:'primary', map:'madbcn',
  title:['Llegada y ', 'asentamiento.'], sub:'Monica llega a las 19:00 en tren. Descanso y cena cerca del hotel.',
  ov:'Llega Monica 19:00 (tren). Descanso, cena hotel.',
  blocks:[{type:'tl', items:[
    {t:'12:35', icon:'plane-landing', title:'Llegada a Madrid · Terminal 2', detail:'Aterrizan del vuelo AM 1 desde CDMX. Después, traslado a la estación para el tren a Barcelona.', q:'Aeropuerto Adolfo Suárez Madrid-Barajas Terminal 2', pin:{lat:40.4697,lng:-3.5700,l:'MAD T2'}},
    {t:'19:00', icon:'train-front', title:'Tren Madrid → Barcelona', detail:'Llegada a Estación Sants · 19:00–20:00', q:'Estació de Sants Barcelona', pin:{lat:41.3791,lng:2.1400,l:'Sants'}},
    {t:'20:00', icon:'car-taxi-front', title:'Taxi o Metro L4 al hotel', detail:'Hotel en la Barceloneta · 20:00–20:30', cost:'8€', q:'Barceloneta, Barcelona', pin:{lat:41.3797,lng:2.1885,l:'Hotel',hotel:true}},
    {t:'20:30', icon:'bed-double', title:'Check-in y descanso', detail:'Exploración del barrio Barceloneta si tienen energía.'},
    {t:'21:00', icon:'utensils', title:'Cena', detail:'Mercat Barceloneta (casual) o room service.', cost:'8–12€', q:'Mercat de la Barceloneta', pin:{lat:41.3807,lng:2.1893,l:'Mercat Barceloneta'}}
  ]}],
  budget:[['Tren Madrid → Barcelona','~50€ (compra con anticipación)'],['Taxi/Metro estación → hotel','8€'],['Cena','10€']], total:'68€'},

 {id:'d2', iso:'2026-10-16', travel:'walking', n:'06', date:'16 oct', city:'Barcelona', tone:'primary', map:'bcn',
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

 {id:'d3', iso:'2026-10-17', travel:'walking', n:'07', date:'17 oct', city:'Barcelona', tone:'primary', map:'bcn',
  title:['La ruta compartida, ', 'diez paradas.'], sub:'Día completo juntos: Born, Barrio Gótico, Ciutadella y Puerto. 14 horas, ~25 km a pie, unos 46€ con la entrada al Museu Picasso.',
  ov:'Ambos libres. Ruta compartida: 10 paradas, ~46€.',
  blocks:[{type:'tl', items:[
    {t:'07:30', icon:'coffee', title:'Desayuno · Mercat Barceloneta', detail:'A 5 min del hotel · café con jamón ibérico, pan tumaca, churros · 45 min.', cost:'2,50€', tips:['Llegar temprano, es muy concurrido.'], q:'Mercat de la Barceloneta', pin:{lat:41.3807,lng:2.1893,l:'Mercat Barceloneta'}},
    {t:'08:30', icon:'landmark', title:'Carrer de Montcada', detail:'Palacios medievales, arcos góticos, patios interiores · 30 min (fotos incluidas).', cost:'Gratis', tips:['Mejor luz matutina, sin turistas aún.'], q:'Carrer de Montcada Barcelona', pin:{lat:41.3846,lng:2.1812,l:'Montcada'}},
    {t:'10:00', icon:'church', title:'Basílica Santa Maria del Mar', detail:'Plaça Santa Maria, Born · interior gótico, vitrales, acústica sublime · 45 min.', cost:'Gratis', tips:['Donación voluntaria ~1€.','Silencio interior, meditación posible.'], q:'Basílica de Santa Maria del Mar', pin:{lat:41.3838,lng:2.182,l:'Sta. Maria del Mar'}},
    {t:'12:30', icon:'utensils', title:'Comida', detail:'1 hora (comer + esperar).', cost:'10€', pin:{lat:41.3862,lng:2.1786,l:'Sta. Caterina'},
     opts:[{n:'A · Mercat Santa Caterina', c:'10–12€', lines:['Avinguda de Francesc Cambó, 20 · abierto hasta 20h.','Mercado convertido en restaurante: pulpo, jamón, verduras frescas.'], q:'Mercat de Santa Caterina'},
           {n:'B · La Cova Fumada', c:'8–10€', lines:['Carrer Baluard, 56 (Barceloneta) · 12:00–15:30.','Sin reservas: llegar antes de las 12:00.','Montaditos, croquetas, pa amb tomàquet.'], q:'La Cova Fumada Barcelona'},
           {n:'C · Can Solé', c:'12–15€', lines:['En la Barceloneta, muy cerca del hotel.','Cerrado lunes: verificar.'], q:'Can Solé Barcelona'}]},
    {t:'13:30', icon:'trees', title:'Descanso · Parc de la Ciutadella', detail:'Passeig de Picasso · Cascada Monumental, lago, gente local · 1,5 horas.', cost:'3–5€', tips:['Picar algo ligero si hace falta, no comer de nuevo.'], q:'Parc de la Ciutadella', pin:{lat:41.3897,lng:2.1866,l:'Ciutadella'}},
    {t:'16:00', icon:'palette', title:'Museu Picasso', detail:'Carrer de Montcada, 15–23 · Las Meninas (4 versiones), obras cubistas, azulejos · 1,5 horas.', cost:'14€', tips:['Sábado: entrada normal 14€, mejor reservar online. La entrada gratis es solo los jueves por la tarde.','Horario: viernes–domingo 10–20h, jueves 10–21h.','Audioguía 5€ (muy recomendada).','Posible fila a las 18h: ir a las 16:00.'], q:'Museu Picasso Barcelona', pin:{lat:41.3852,lng:2.1808,l:'Picasso'}},
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
  budget:[['Desayuno (Mercat)','2€','4€','2,50€'],['Metro (3 viajes)','3€','10€','6€'],['Comida (mercado)','8€','12€','10€'],['Café Ciutadella','2€','5€','3€'],['Museu Picasso','14€','19€','14€'],['Catedral exterior','0€','16€','0€'],['Cena','7€','15€','9€'],['Bebida nocturna','2€','5€','3€']],
  totalRow:['Total','38€','86€','46€'], totalNote:'Llevar 40€ en efectivo; la entrada de Picasso se paga online con tarjeta.'},

 {id:'d4', iso:'2026-10-18', travel:'transit', n:'08', date:'18 oct', city:'Barcelona → Madrid', tone:'tertiary', map:'trip',
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

 {id:'d5', iso:'2026-10-19', travel:'walking', n:'09', date:'19 oct', city:'Madrid', tone:'tertiary', map:'mad',
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

 {id:'d6', iso:'2026-10-20', travel:'walking', n:'10', date:'20 oct', city:'Toledo', tone:'secondary', map:'tol',
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

 {id:'d7', iso:'2026-10-21', travel:'flight', n:'11', date:'21 oct', city:'Madrid → Cancún', tone:'tertiary', map:'madcun',
  title:['Vuelo de regreso ', 'a Cancún.'], sub:'Salida del hotel a las 7:00 y vuelo Aeroméxico AM 20 + AM 536 a las 9:00 desde Madrid T1; llegan a Cancún a las 18:48.',
  ov:'Vuelo 9:00 (salida del hotel 7:00); llegan a Cancún 18:48.',
  blocks:[{type:'tl', items:[
    {t:'06:30', icon:'alarm-clock', title:'Despertar y desayuno rápido', cost:'3€'},
    {t:'07:00', icon:'luggage', title:'Checkout del hotel'},
    {t:'07:30', icon:'car-taxi-front', title:'Taxi al aeropuerto · Terminal 1', cost:'15€', q:'Aeropuerto Adolfo Suárez Madrid-Barajas Terminal 1'},
    {t:'09:00', icon:'plane', title:'Vuelo AM 20 + AM 536 · Madrid → Cancún', detail:'Aeroméxico · MAD T1 → escala en CDMX → Cancún T2 · 16 h 48 min. Pasaporte listo.', q:'Aeropuerto Adolfo Suárez Madrid-Barajas Terminal 1', pin:{lat:40.4697,lng:-3.5700,l:'MAD T1'}},
    {t:'18:48', tz:'America/Cancun', icon:'plane-landing', title:'Llegada a Cancún · Terminal 2', detail:'Hora de Cancún. Fin del viaje.', q:'Aeropuerto Internacional de Cancún Terminal 2', pin:{lat:21.0365,lng:-86.8770,l:'CUN T2'}}
  ]}],
  budget:[['Desayuno','3€'],['Taxi hotel → aeropuerto','15€']], total:'18€'}
];

var GLOBAL = {
  cun:{title:'Cancún · 11–14 oct', tone:'secondary', rows:[['Hospedaje','Con Emilio y Didi'],['Vuelo CDMX → Cancún (VB 1380)','Ya comprado'],['Vuelos Cancún ↔ Madrid (redondo Aeroméxico)','Ya comprado'],['Comidas y paseos','Por definir']], total:['Subtotal Cancún','Por definir']},
  bcn:{title:'Barcelona · 15–18 oct', tone:'primary', rows:[['15 oct · Tren + taxi + cena','68€'],['16 oct · Exploración de Nando','45€'],['16 oct · Cena Monica + Nando','16€'],['17 oct · Ruta compartida','46€'],['18 oct · Checkout + tren + hotel + cena','177€']], total:['Subtotal Barcelona','352€']},
  mad:{title:'Madrid · 18–21 oct', tone:'tertiary', rows:[['19 oct · Madrid completo','56€'],['20 oct · Excursión Toledo','72€'],['21 oct · Vuelo + desayuno','18€']], total:['Subtotal Madrid','146€']},
  all:{title:'Total viaje (ambas personas)', tone:'secondary', rows:[['Transporte (trenes, metro, taxi)','200€'],['Hoteles (2 noches BCN + 2 noches MAD)','160€'],['Museos + entradas','74€'],['Comidas + cenas','150€'],['Cafés + descansos','30€'],['Misceláneos','20€']], total:['Total general','~634€'], note:'Por persona: ~317€'}
};
var BUDGET_NOTES = ['Hoteles: buscar Airbnb u hostal para ahorrar (50–80€/noche vs 60–100€).','Museos: muchos son gratis en horarios específicos (Reina Sofía, Prado de noche).','Transporte: T-casual en Barcelona (13€, 10 viajes) en vez de billetes sencillos (2,90€).'];
var APPS = [['Google Maps','Rutas, metros','Gratis'],['Citymapper','Mejor que Google para metro','Gratis'],['TMB','Comprar T-casual en Barcelona','Gratis'],['Renfe.com','Comprar trenes','~15–50€/billete'],['Airbnb / Booking','Hoteles económicos','50–100€/noche'],['Timeout Barcelona/Madrid','Guía de lugares','Gratis'],['Museos.es','Horarios + promos','Gratis']];
var PACK = ['Chaqueta ligera (mañanas frescas).','Zapatillas cómodas (25 km de caminata).','Protector solar y gafas de sol.','Botella reutilizable (fuentes públicas).','Trapo pequeño (humedad del puerto).','Cargador portátil (días largos).','Efectivo: 35–40€ mínimo; tarjeta de débito de respaldo.'];
var CHECKS = [
  {title:'Antes del viaje', moved:true, items:['Check-in Viva Aerobus VB 1380 (11 oct, AICM T1)','Check-in Aeroméxico AM 527 (14 oct, CUN T4)','Check-in Aeroméxico AM 20 (21 oct, MAD T1)','Pasaportes vigentes','Seguros de viaje','Reservar trenes (Renfe.com)','Reservar hoteles Barcelona (2 noches) + Madrid (2 noches)','Cambiar dinero a EUR si es necesario','Notificar al banco del viaje']},
  {title:'Barcelona (15–18 oct)', items:['Llegar 19:00, taxi al hotel','16 oct: Nando ruta medieval (Picasso, Montcada, iglesias)','17 oct: Ruta compartida 10 paradas (7:30–20:00)','18 oct: Salida 14:00 a Madrid']},
  {title:'Madrid y Toledo (18–21 oct)', items:['Check-in ~17:00','19 oct: Prado + Retiro + Reina Sofía noche (gratis)','20 oct: Toledo madrugada (6:00–20:00)','20 oct: Alcázar + Catedral + Museo El Greco','20 oct: Comida en Toledo','20 oct: Fotos de atardecer desde el puente','21 oct: Vuelo 9:00 (salir del hotel 7:00)']},
  {title:'Pendientes por confirmar', items:['Articulate (16 oct): confirmar horario exacto','Park Güell (18 oct): ¿incluir en la mañana antes del tren?','Tren a Madrid (18 oct): verificar hora de salida','Destino del vuelo del 21 oct']}
];
var NOTES = [
  {title:'Para Monica', tone:'primary', items:['16 oct: agotador (Articulate 8:00–18:30): descanso después, cena ligera.','17 oct: compartido: ruta ya planificada, ~46€ con Picasso.','19 oct: flexible: Madrid según energía (puede saltarse museos si está cansada).']},
  {title:'Para Nando', tone:'secondary', items:['16 oct: exploración: medieval + anime (Picasso cubismo, iglesias góticas).','19 oct: Madrid: Prado (Goya dark) + Reina Sofía (Guernica).','20 oct: Toledo: épico, arquitectura medieval pura (Alcázar, catedral, callejones).']},
  {title:'Recomendación general', tone:'tertiary', items:['Compren los trenes con anticipación (15–20€ vs 30€+ a último momento).','Airbnb vs hotel: ahorrar 50–80€/noche.','Museos de noche gratis: Reina Sofía jueves–sábado 18–21h.','Toledo vale cada euro.']}
];

var HOTEL_BCN = {lat:41.3797, lng:2.1885, l:'Hotel'};
var MAP_TITLES = {mxcun:'CDMX → Cancún', madbcn:'Madrid → Barcelona', madcun:'Madrid → Cancún', cun:'Cancún', bcn:'Barcelona', mad:'Madrid', tol:'Toledo', trip:'Barcelona → Madrid'};

/* ---------- Redacción personal ----------
   Textos que le hablan a quien inició sesión. Marcadores: {yo} = quien entra,
   {otro} = la otra persona, {hora} = hora de la parada, {hasta} = hora de la
   siguiente parada, {dur} = tiempo disponible hasta la siguiente.
   Un texto puede ser común o {moni:'…', nando:'…'} cuando cambia por persona. */
var INTRO = {
  c1:'{yo}, aquí empieza su viaje: a las 8:25 despega su vuelo VB 1380 desde el AICM y a las 11:45 ya están en Cancún. Comida con Emilio y Didi, una tarde de playa y la primera cena juntos.',
  c2:'{yo}, hoy no hay prisa: desayuno con calma, playa todo el día con {otro}, Emilio y Didi, una caminata al atardecer y cena juntos.',
  c3:'{yo}, último día completo en Cancún: si se les antoja, un paseo a Isla Mujeres o Playa del Carmen, una caminata y la cena de despedida con Emilio y Didi.',
  c4:'{yo}, último desayuno con Emilio y Didi y a las 9:30 al aeropuerto. A las 12:40 despega su vuelo a Madrid con escala en CDMX: mañana a mediodía ya están en España.',
  d1:{moni:'{yo}, a las 12:35 aterrizan en Madrid y por la tarde toman el tren: a las 19:00 llegan a Sants. Taxi o L4 al hotel en la Barceloneta, una cena tranquila en el Mercat y a descansar juntitos: mañana Articulate empieza temprano.',
      nando:'{yo}, a las 12:35 aterrizan en Madrid y por la tarde toman el tren: a las 19:00 llegan a Sants. Para las 20:30 ya estarán en el hotel de la Barceloneta, con una cena tranquila en el Mercat para estrenar Barcelona.'},
  d2:{moni:'{yo}, hoy es tu gran día en Articulate, de 8:00 a 18:30. Nando te espera explorando el Born y el Gòtic; a las 18:30 se reencuentran para una cena ligera y a consentirte un poco.',
      nando:'{yo}, hoy Barcelona es toda tuya: ruta medieval + anime de 8:30 a 17:30 por el Born y el Gòtic. Disfruta tu día; a las 18:30 Moni sale de Articulate y por fin se reencuentran.'},
  d3:'{yo}, hoy es su día juntos de principio a fin: 10 paradas por el Born, el Gòtic, la Ciutadella y el puerto. Salen a las 7:30, caminan unos 25 km de la mano y el día sale en unos 46€ con el Picasso.',
  d4:'{yo}, último paseo por Barcelona con {otro}: desayuno sin prisa, las fotos que faltaron y checkout a las 11:00. A las 14:00 sale su tren y a las 16:30 ya están juntos en Madrid.',
  d5:'{yo}, hoy Madrid es de ustedes dos: Goya en el Prado por la mañana, un paseo por el Retiro y el centro a mediodía, y el Guernica en el Reina Sofía por la tarde.',
  d6:'{yo}, hoy toca madrugar, pero vale la pena: a las 6:00 salen a Atocha y a las 8:30 ya están juntos frente al Alcázar. Toledo medieval, El Greco y regreso a Madrid a las 19:30.',
  d7:'{yo}, último día de este viaje con {otro}: a las 7:00 dejan el hotel, a las 9:00 despega su vuelo y a las 18:48 ya están de vuelta en Cancún. Pasaporte a la mano y el corazón lleno.'
};
var OV = {
  c1:'Vuelo a Cancún a las 8:25; playa y cena con Emilio y Didi.',
  c2:'Día de playa y cena con Emilio y Didi.',
  c3:'Paseo opcional y cena de despedida.',
  c4:'Despedida y vuelo a Madrid a las 12:40.',
  d1:'Aterrizan en Madrid a las 12:35; tren y llegada a Barcelona a las 19:00.',
  d2:{moni:'Tu día de Articulate (8:00–18:30); Nando te espera para cenar.', nando:'Tu día libre: ruta medieval + anime. Cenas con Moni a las 18:30.'},
  d3:'Su día juntos: 10 paradas, ~46€.',
  d4:'Checkout a las 11:00 y tren juntos a Madrid (14:00–16:30).',
  d5:'Madrid para los dos: Prado, Retiro y Reina Sofía.',
  d6:'Escapada juntos a Toledo, de 6:00 a 20:00.',
  d7:'Vuelo a las 9:00; de vuelta en Cancún a las 18:48.'
};
/* Clave: 'día|hora' para el itinerario principal y 'pre:día|hora' para el bloque de Monica del D2. */
var VOZ = {
  'c1|06:30':'{yo}, a las {hora} (hora de CDMX) salen juntos al AICM, Terminal 1. Revisen boletos e identificaciones antes de cerrar la puerta.',
  'c1|08:25':'A las {hora} despega su vuelo VB 1380 a Cancún: {dur} de vuelo para empezar el viaje juntos.',
  'c1|11:45':'{yo}, a las {hora} aterrizan en Cancún. Ajusten el reloj una hora: aquí empieza la playa.',
  'c1|13:30':'Comida con Emilio y Didi a las {hora}: abrazos, ponerse al día y planear los próximos días.',
  'c1|16:00':'{yo}, a las {hora} primera tarde de playa con {otro}: tienen {dur} para no hacer nada.',
  'c1|20:00':'Cena con Emilio y Didi a las {hora}. Disfruten la primera noche juntos en Cancún.',
  'c2|09:30':'{yo}, desayuno a las {hora} sin despertador: hoy el día es lento.',
  'c2|11:00':'A las {hora} a la playa con {otro}: {dur} de sol, mar y pies en la arena.',
  'c2|15:00':'Comida a las {hora}, algo fresco y rico cerca del mar.',
  'c2|18:00':'{yo}, a las {hora} caminata al atardecer con {otro}, Emilio y Didi.',
  'c2|20:30':'Cena con Emilio y Didi a las {hora}. Una noche tranquila para platicar.',
  'c3|09:00':'{yo}, desayuno a las {hora} y deciden juntos el paseo del día.',
  'c3|10:00':'A las {hora}, paseo opcional: Isla Mujeres en ferry, Playa del Carmen o más playa. Tienen {dur} antes de comer.',
  'c3|14:00':'Comida a las {hora} donde los encuentre el paseo.',
  'c3|17:30':'{yo}, a las {hora} una última caminata con calma con {otro}.',
  'c3|20:00':'Cena de despedida a las {hora}: denles las gracias a Emilio y Didi por recibirlos.',
  'c4|08:00':'{yo}, último desayuno con Emilio y Didi a las {hora}. Tómense una foto todos juntos y denles un abrazo largo.',
  'c4|09:30':'A las {hora} salen a la Terminal 4. Revisen pasaportes y que no se quede nada en casa de Emilio y Didi.',
  'c4|12:40':'{yo}, a las {hora} despega su vuelo AM 527 a CDMX y de ahí el AM 1 a Madrid. Duerman lo que puedan en el avión: mañana empieza Europa.',
  'd1|12:35':'{yo}, a las {hora} aterrizan en Madrid, Terminal 2. Tómense un café, estiren las piernas y al tren: Barcelona los espera.',
  'd1|19:00':'{yo}, a las {hora} llegan a Sants en el tren desde Madrid. Ya están en Barcelona.',
  'd1|20:00':'En unos 30 minutos están en la Barceloneta; a las {hasta} ya es el check-in.',
  'd1|20:30':'Dejen las maletas y, si les queda energía, den una vuelta corta juntos por la Barceloneta.',
  'd1|21:00':{moni:'{yo}, cena tranquila con Nando en el Mercat Barceloneta y a dormir temprano: mañana Articulate empieza a las 8:00.', nando:'Cena tranquila con Moni en el Mercat Barceloneta y a dormir temprano, que mañana Moni madruga. Tú tienes el día libre para explorar.'},

  'pre:d2|08:00':{moni:'{yo}, desayuna rico: de {hora} a {hasta} es el arranque de Articulate.', nando:'Moni desayuna y entra a Articulate a las {hora}. Mándale buena vibra.'},
  'pre:d2|10:00':{moni:'De {hora} a 18:30 estás en el evento. Será largo: cuídate y guarda energía para la noche con Nando.', nando:'Moni está en el evento hasta las 18:30. Un mensajito a mediodía le va a caer bien.'},
  'pre:d2|18:30':{moni:'{yo}, a las {hora} sales y por fin te reencuentras con Nando. Cena ligera y a consentirte: hoy te lo ganaste.', nando:'A las {hora} Moni sale del evento: cena ligera juntos, que fue un día largo.'},
  'd2|08:30':{nando:'{yo}, arrancas a las {hora} con el desayuno de siempre en el Mercat; tienes {dur} antes de ir a Montcada.', moni:'Nando desayuna a las {hora} en el Mercat Barceloneta.'},
  'd2|09:30':{nando:'A las {hora} llegas a Carrer de Montcada: palacios góticos y arcos con ambiente de RPG medieval. Guarda las fotos con “castle vibes” para enseñárselas a Moni.', moni:'Nando recorre Carrer de Montcada a las {hora}.'},
  'd2|10:30':{nando:'{yo}, a las {hora} entras al Museu Picasso. Tienes {dur} para el cubismo, sin prisa; la audioguía vale la pena.', moni:'Nando entra al Museu Picasso a las {hora}.'},
  'd2|12:15':{nando:'A las {hora} llegas a Santa Maria del Mar: entra en silencio y disfruta la luz vertical.', moni:'Nando visita Santa Maria del Mar a las {hora}.'},
  'd2|13:15':{nando:'Hora de comer: a las {hora}, La Cova Fumada o el Mercat Santa Caterina. Tienes {dur}; date un gusto.', moni:'Nando come a las {hora}.'},
  'd2|14:30':{nando:'{yo}, si se te antoja seguir con el tema gaming, a las {hora} puedes ir a CosmoCaixa; si no, sigue con la arquitectura. Es tu día.', moni:'Si se le antoja, Nando va a CosmoCaixa a las {hora}.'},
  'd2|16:00':{nando:'A las {hora}, paseo libre por el Barri Gòtic: Plaça Reial y la Catedral por fuera. Tienes {dur} antes de volver.', moni:'Nando pasea por el Barri Gòtic a las {hora}.'},
  'd2|17:30':{nando:'{yo}, a las {hora} regresas al hotel para recibir a Moni cuando salga de Articulate.', moni:'A las {hora} Nando vuelve al hotel y te espera.'},

  'd3|07:30':'{yo}, empiezan juntos a las {hora} en el Mercat Barceloneta, a 5 minutos del hotel: café, jamón y pan tumaca. Tienen {dur} antes de Montcada.',
  'd3|08:30':'A las {hora} llegan a Montcada con la mejor luz y casi sin turistas. Aprovechen para sus primeras fotos del día.',
  'd3|10:00':'Santa Maria del Mar a las {hora}. Después tienen tiempo libre para pasear de la mano por el Born hasta la comida de las {hasta}.',
  'd3|12:30':'Comida a las {hora}: Mercat Santa Caterina, La Cova Fumada o Can Solé. A las {hasta} siguen a la Ciutadella.',
  'd3|13:30':'{yo}, de {hora} a {hasta} descansan en la Ciutadella: una banca, un café y piernas arriba con {otro}. Es el respiro largo del día.',
  'd3|16:00':'{yo}, a las {hora} entran juntos al Museu Picasso. Tienen {dur} para perderse en Las Meninas antes de la Catedral. Hoy es sábado: la entrada cuesta 14€.',
  'd3|17:30':'A las {hora} llegan a la Catedral con luz naranja: la mejor foto juntos es entre 17:30 y 18:30.',
  'd3|18:00':'{yo}, a las {hora} llegan a la Plaça Reial: tómense la foto del viaje desde la esquina SE, antes de las 18:15.',
  'd3|18:30':'Cena a las {hora}. Can Culleretes está a unos pasos de la plaza; tienen {dur} para cenar sin prisa.',
  'd3|20:00':'Cierran su día a las {hora} en Moll de la Fusta: barcos iluminados y una última copa con {otro}.',

  'd4|09:00':'{yo}, desayuno sin prisa a las {hora}: hoy la mañana es para ustedes.',
  'd4|10:00':'A las {hora}, última vuelta juntos por el Gòtic para las fotos que faltaron. Tienen {dur} antes del checkout.',
  'd4|11:00':'Checkout a las {hora}. Tienen hasta las {hasta} para comer algo rico y llegar a Sants.',
  'd4|14:00':'{yo}, su tren sale de Sants a las {hora}. Pidan ventana y lleven snacks: son 2,5 horas para platicar.',
  'd4|16:30':'A las {hora} llegan a Atocha: ya están juntos en Madrid.',
  'd4|17:00':'Taxi o metro al hotel; a las {hasta} hacen check-in.',
  'd4|17:30':'Check-in a las {hora} y un rato para acomodarse.',
  'd4|18:00':'A las {hora}, vuelta por el barrio y un descanso antes de cenar.',
  'd4|19:30':'Cena de tapas cerca del hotel a las {hora}. Mañana Madrid es todo suyo.',

  'd5|08:00':'{yo}, desayuno a las {hora} cerca del hotel; a las {hasta} ya están en el Prado.',
  'd5|09:00':{nando:'{yo}, a las {hora} entran al Prado y tienen {dur}. Goya, con su lado más oscuro, es para ti; y Las Meninas, para verlas juntos.', moni:'{yo}, a las {hora} entran al Prado y tienen {dur}. Deja que Nando te lleve a su Goya; Las Meninas, para verlas juntos.'},
  'd5|11:30':'A las {hora} cruzan al Retiro caminando desde el Prado: lago y paseo de {dur} para los dos.',
  'd5|13:00':'Comida a las {hora}: Mercado San Miguel, Taberna La Bola o el restaurante del Prado.',
  'd5|14:15':'{yo}, de {hora} a {hasta} eligen juntos: Plaza Mayor, Malasaña, Templo de Debod o el barrio de América Latina.',
  'd5|16:30':'Café a las {hora} en una terraza del centro: {dur} para recargar y platicar.',
  'd5|17:15':{nando:'{yo}, a las {hora} llegas al Reina Sofía y al Guernica. Si quieren la hora gratis, entren a las 19:00.', moni:'{yo}, a las {hora} van al Reina Sofía; el Guernica es la ilusión de Nando. Si quieren la hora gratis, entren a las 19:00.'},
  'd5|18:45':'Atardecer a las {hora}: el Templo de Debod para la vista de 360°, o el Retiro si se les antoja algo romántico.',
  'd5|20:00':'Cena a las {hora}: Café Gijón, Taberna El Sur, Casa Botín o, si se quieren consentir, El Club Allard.',
  'd5|21:30':'Si les queda energía, a las {hora} un paseo de noche por el Retiro, la Plaza Mayor o Malasaña.',

  'd6|05:30':'{yo}, despertador a las {hora}: café rápido, un abrazo y a las 6:00 salen hacia Atocha.',
  'd6|07:00':'A las {hora} sale su tren a Toledo; llegan como a las 8:00.',
  'd6|08:30':'{yo}, a las {hora} empiezan por lo alto: {dur} en el Alcázar antes de bajar a la Catedral.',
  'd6|09:45':'A las {hora} entran a la Catedral: gótico puro y la “Asunción” de El Greco. Tienen {dur}.',
  'd6|11:15':{nando:'{yo}, a las {hora} llegas al Museo El Greco: busca la “Vista de Toledo”. Es justo tu tipo de pintura.', moni:'A las {hora}, Museo El Greco: busquen juntos la “Vista de Toledo”, la favorita de Nando.'},
  'd6|13:00':'Comida a las {hora}: carcamusa en Casa Aurelio o una terraza con vistas en Venta del Alma.',
  'd6|14:30':'De {hora} a {hasta}, Toledo es suyo: San Juan de los Reyes, los callejones, la Sinagoga del Tránsito o el mirador.',
  'd6|16:15':'{yo}, a las {hora} café en el mirador del puente: su foto con el Alcázar y la Catedral al atardecer.',
  'd6|18:00':'A las {hora} sale el tren de regreso; a las 19:30 ya están en Madrid.',
  'd6|19:45':'Cena ligera y a dormir temprano, {yo}: mañana el vuelo es a las 9:00.',

  'd7|06:30':'{yo}, despertador a las {hora} y desayuno rápido juntos.',
  'd7|07:00':'Checkout a las {hora}. Revisa que el pasaporte vaya a la mano.',
  'd7|07:30':'A las {hora} sale el taxi a Barajas, Terminal 1.',
  'd7|09:00':'{yo}, su vuelo AM 20 sale a las {hora}, con escala en CDMX. Gracias por este viaje juntos.',
  'd7|18:48':'A las {hora} (hora de Cancún) aterrizan en casa de nuevo. Buen regreso, {yo}.'
};

/* Vuelos del viaje (sin códigos de reserva: el repositorio es público). */
var VUELOS = [
  {airline:'Viva Aerobus', legs:['VB1380'], code:'VB 1380', date:'Domingo 11 oct', from:'Ciudad de México', fromAp:'MEX · AICM T1', dep:'8:25', to:'Cancún', toAp:'CUN', arr:'11:45', dur:'2 h 20 min', stops:'Directo', day:'c1'},
  {airline:'Aeroméxico', legs:['AM527','AM1'], code:'AM 527 + AM 1', date:'Miércoles 14 oct → jueves 15 oct', from:'Cancún', fromAp:'CUN T4', dep:'12:40', to:'Madrid', toAp:'MAD T2', arr:'12:35', arrNote:'+1 día', dur:'16 h 55 min', stops:'1 escala · CDMX', day:'c4'},
  {airline:'Aeroméxico', legs:['AM20','AM536'], code:'AM 20 + AM 536', date:'Miércoles 21 oct', from:'Madrid', fromAp:'MAD T1', dep:'9:00', to:'Cancún', toAp:'CUN T2', arr:'18:48', dur:'16 h 48 min', stops:'1 escala · CDMX', day:'d7'}
];

/* Checklist "Antes de viajar": lo que deben tener listo antes de salir.
   Cada cosa tiene un id fijo (no lo cambies: así se guarda lo marcado). */
var PREVIAJE = [
  {g:'Documentos', items:[
    {id:'pas-moni', t:'Pasaporte de Moni vigente'},
    {id:'pas-nando', t:'Pasaporte de Nando vigente'},
    {id:'ine', t:'INE o identificación para el vuelo nacional (11 oct)'},
    {id:'seguro', t:'Seguro de viaje'},
    {id:'copias', t:'Copias digitales de los pasaportes'}]},
  {g:'Vuelos', items:[
    {id:'ci-vb1380', t:'Check-in Viva Aerobus VB 1380 (11 oct)'},
    {id:'ci-am527', t:'Check-in Aeroméxico AM 527 + AM 1 (14 oct)'},
    {id:'ci-am20', t:'Check-in Aeroméxico AM 20 + AM 536 (21 oct)'},
    {id:'asientos', t:'Asientos juntos elegidos'}]},
  {g:'Trenes y reservas', items:[
    {id:'tren-madbcn', t:'Tren Madrid → Barcelona (15 oct, tarde)'},
    {id:'tren-bcnmad', t:'Tren Barcelona → Madrid (18 oct, 14:00)'},
    {id:'tren-toledo', t:'Trenes Madrid ↔ Toledo (20 oct)'},
    {id:'hotel-bcn', t:'Hotel en Barcelona (15–18 oct)'},
    {id:'hotel-mad', t:'Hotel en Madrid (18–21 oct)'},
    {id:'picasso', t:'Entrada al Museu Picasso (17 oct, 14 € online)'}]},
  {g:'Dinero', items:[
    {id:'banco', t:'Avisar al banco del viaje'},
    {id:'tarjeta', t:'Tarjeta sin comisión en el extranjero'}]},
  {g:'Celular', items:[
    {id:'datos', t:'Plan de datos o eSIM para Europa'},
    {id:'app', t:'App del viaje instalada en la pantalla de inicio'}]},
  {g:'Maleta', items: PACK.map((t,i)=>({id:'maleta-'+i, t:t.replace(/\.$/,'')}))}
];

