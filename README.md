# Mytravel · Cancún, Barcelona, Madrid y Toledo (11–21 oct 2026)

Web app del itinerario de Monica y Nando, hecha con el sistema de diseño **M-Design**.

- Itinerario día por día (11 días, del 11 al 21 de octubre) con horarios, opciones de comida y cena, tips y presupuesto.
- **Mapa real** (OpenStreetMap + CARTO, con Leaflet) en cada día. Las paradas están numeradas y sincronizadas con el itinerario.
- Botón **"Ver ruta en Google Maps"** que abre la ruta completa del día con todas las paradas.
- **Modo "Ahora"**: con la hora local de cada día (Cancún o España) marca la parada actual y la siguiente, y cuánto falta. Antes del viaje muestra la cuenta regresiva.
- **Funciona como app**: en el celular, "Agregar a pantalla de inicio". Abre sin internet una vez visitada; los mapas offline solo incluyen las zonas que ya se vieron.
- **Antes de viajar**: checklist con porcentaje (0–100 %), grupos (documentos, vuelos, trenes y reservas, dinero, celular, maleta), "Ver solo lo que falta" y la opción de agregar cosas propias. Con Supabase lo ven los dos.
- **Vuelos**: tarjetas con horarios, terminales y escalas, y botón "Estado" para ver retrasos o puerta en vivo. Los códigos de reserva no se guardan en el repo (es público).
- Checklist y tema claro/oscuro guardados en cada dispositivo.

## Entrar

La app pide **quién eres (Moni o Nando)** y una **contraseña compartida** (no está escrita en el repo; el código solo guarda su huella SHA-256). Según quién entra, los textos le hablan a esa persona ("Hola, Moni", "Tú · Articulate", "Para ti"…). Para cambiar de persona: **Más → Ajustes → Cerrar sesión**.

> Ojo: como el repositorio es público, la contraseña evita miradas casuales, no es seguridad real. Quien lea el código puede ver el itinerario.

## Pestañas

Abajo (arriba en la computadora) hay cinco pestañas: **Viaje** (días, mapas y modo "Ahora"), **Álbum** (diario del viaje), **Pendientes** ("Antes de viajar" con % y checklist maestro), **Gastos** y **Más** (vuelos, resumen, presupuesto, qué llevar, notas y ajustes). La pestaña queda en la dirección (`#album`, `#pendientes`…), así que el botón "atrás" funciona.

## Instalar en el celular

- **iPhone:** abrir la dirección en Safari → Compartir (cuadrito con flecha) → **Agregar a inicio** → Agregar.
- **Android:** abrir en Chrome → menú ⋮ → **Instalar app** (o "Agregar a la pantalla principal").
- También está el botón **Más → Ajustes → Instalar en el celular**, que abre el instalador o muestra los pasos.

## Gastos

Pestaña **Gastos**: cada quien agrega lo que paga (monto, EUR o MXN, concepto, categoría, quién pagó, para quién y día). Arriba se ve el total por moneda, Europa contra el presupuesto (~771 €), los gastos por categoría y **cuentas claras** (quién le debe a quién: lo de "los dos" se divide a la mitad). Tocar un gasto lo edita o borra. "Descargar CSV" lo abre en Excel o Numbers. Con Supabase se comparte en vivo.

## Calendario y notificaciones

- **Calendario (iPhone):** Más → Ajustes → **Agregar a mi calendario** → Suscribirme. Al suscribirse, **apaga "Quitar alertas"**. Cada quien tiene su calendario (`calendario/viaje-moni.ics`, `calendario/viaje-nando.ics`) con su redacción, alarmas antes de vuelos, trenes y reservas, y el check-in de cada vuelo (aviso 3 días antes y cuando abre).
- **Notificaciones push:** con la app **instalada en la pantalla de inicio** (iOS 16.4+): Más → Ajustes → **Notificaciones** → permitir → **Probar notificación**. Llegan aunque la app esté cerrada: la noche anterior ("Mañana: día 7…"), 30 min antes de cada parada con lugar, check-in y cuando el otro sube una foto o escribe en el diario.
- **Si cambia el itinerario** (`js/itinerario.js`): corre `node tools/calendario.mjs`. Regenera los `.ics` y `supabase/avisos.sql`; vuelve a correr `avisos.sql` en Supabase.

### Configurar las notificaciones en Supabase (una sola vez)

1. **SQL Editor:** corre `supabase/schema.sql` (agrega `gastos`, `push_subs` y `avisos`).
2. **Edge Functions → Deploy a new function → Via Editor**, nombre **`avisos`**: pega el contenido de `supabase/functions/avisos/index.ts` y despliega.
3. **Edge Functions → Secrets** (Manage secrets): agrega `VAPID_PUBLIC_KEY` (la misma de `js/config.js`) y `VAPID_PRIVATE_KEY` (la que te pasé por el chat; no va en el repo).
4. **SQL Editor:** corre `supabase/push.sql` (tarea cada 5 min y avisos de fotos/diario) y luego `supabase/avisos.sql` (los avisos programados del viaje).
5. En cada iPhone: abre la app instalada → Más → Ajustes → Notificaciones → Probar notificación.

## Checklist, fotos y ubicación

- Cada parada tiene **Visitada** y **Tomar foto**. "Tomar foto" abre la cámara del celular; la foto queda guardada en la app y la parada se marca como visitada.
- Las fotos se guardan **solo en ese celular** (y por persona). Toca una miniatura → **Guardar en galería** para pasarla a tus fotos; en la pestaña **Álbum** está "Guardar todas".
- **Álbum = diario:** una página por día con **Nuestro día** (lo que escriban de ese día, cualquiera de los dos) y las fotos en polaroid. Quien tomó la foto le puede poner una **nota**, que también aparece debajo de la actividad.
- **Usar mi ubicación** (arriba o en la barra "Ahora") muestra tu punto en el mapa, la distancia a cada parada y avisa al llegar a menos de 150 m de una parada pendiente. Solo funciona **con la app abierta** y en la dirección `https://`.

## Conectar Supabase (álbum y checks compartidos, avisos en vivo)

Sin esto la app funciona en **modo local**: cada celular guarda sus fotos y checks por separado. Con Supabase, Moni y Nando comparten el álbum, los checks y los cambios de horario, y cuando uno marca una parada o sube una foto, al otro le aparece el aviso al momento (con la app abierta).

1. **Base de datos:** en Supabase → **SQL Editor** → *New query*, pega todo [`supabase/schema.sql`](supabase/schema.sql) y dale **Run**. Crea las tablas, el bucket privado `fotos`, las reglas de seguridad y el tiempo real.
2. **Cerrar registros:** en **Authentication → Sign In / Providers**, desactiva **Allow new users to sign up**. Así nadie más puede crear una cuenta y ver sus fotos.
3. **Usuarios:** en **Authentication → Users → Add user → Create new user**, crea uno para Moni y otro para Nando (correo + contraseña; marca *Auto Confirm User*).
4. **Clave pública:** en **Project Settings → API** copia la clave **anon public** (o *Publishable key*) y pégala en [`js/config.js`](js/config.js) en lugar de `PEGA_AQUI_LA_ANON_KEY`. Esa clave es pública; **nunca** pongas ahí la `service_role` / *secret*.
5. Al entrar, cada uno elige **Moni o Nando** y usa su correo y contraseña. Las fotos y checks que ya tenían en el celular se suben solos la primera vez.

Detalles:
- Sin internet, las fotos quedan como **pendientes** en el celular y se suben solas al volver la conexión.
- **Personalizar el día:** el lápiz de cada parada permite cambiar la hora (entre la parada anterior y la siguiente) y dejar una nota. El otro lo ve con un aviso.
- Cada quien solo puede borrar sus propias fotos.

## Publicarla con GitHub Pages

1. Settings → Pages → *Build and deployment* → Source: **Deploy from a branch**.
2. Branch: **main**, carpeta **/ (root)** → Save.
3. En uno o dos minutos queda en `https://dmonica90.github.io/Mytravel/`.

## Cambiar el itinerario

Todo el contenido está en [`js/itinerario.js`](js/itinerario.js):

- `t: '12:30'` es la hora de inicio de la parada, en la hora local del día (`tz` del día; Cancún usa `America/Cancun`). Una parada puede llevar su propia `tz` (por ejemplo, la salida desde CDMX). El modo "Ahora" la usa: cada parada dura hasta que empieza la siguiente.
- `pin: {lat, lng, l}` pone la parada en el mapa (`l` es la etiqueta).
- `q` es lo que se busca en Google Maps.
- `cost`, `detail`, `tips` y `opts` (opciones en pestañas) son el texto que se ve.

Después de editar y hacer commit en `main`, GitHub Pages se actualiza solo. Si la app instalada no muestra el cambio, ciérrala y vuelve a abrirla.

## Estructura

```
index.html            página
css/m-design.css      tokens y componentes de M-Design
css/app.css           estilos de la app
js/itinerario.js      datos del viaje
js/app.js             render, mapas, modo "Ahora"
js/tabs.js            pestañas e "Instalar en el celular"
js/visitas.js         checklist, cámara, notas de fotos y visor
js/diario.js          pestaña Álbum (diario del viaje)
js/gastos.js          pestaña Gastos
js/avisos.js          calendario y notificaciones (Ajustes)
tools/calendario.mjs  genera los .ics y supabase/avisos.sql
calendario/           calendarios .ics para suscribirse
supabase/functions/   Edge Function "avisos" (push)
js/ubicacion.js       "estoy cerca"
js/sesion.js          entrada Moni / Nando
js/config.js          URL y clave pública de Supabase
js/nube.js            conexión con Supabase
js/editar.js          cambiar hora / nota de una parada
js/previaje.js        checklist "Antes de viajar"
supabase/schema.sql   tablas, bucket y reglas de seguridad
supabase/push.sql     tarea programada y triggers de las notificaciones
supabase/avisos.sql   avisos programados (generado)
sw.js                 modo offline
vendor/               Leaflet 1.9.4, leaflet-gesture-handling, Lucide (licencias incluidas)
```

> El repositorio es público: no incluye la dirección exacta del hotel.
