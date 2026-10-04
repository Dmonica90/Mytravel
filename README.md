# Mytravel · Cancún, Barcelona, Madrid y Toledo (11–21 oct 2026)

Web app del itinerario de Monica y Nando, hecha con el sistema de diseño **M-Design**.

- Itinerario día por día (11 días, del 11 al 21 de octubre) con horarios, opciones de comida y cena, tips y presupuesto.
- **Mapa real** (OpenStreetMap + CARTO, con Leaflet) en cada día. Las paradas están numeradas y sincronizadas con el itinerario.
- Botón **"Ver ruta en Google Maps"** que abre la ruta completa del día con todas las paradas.
- **Modo "Ahora"**: con la hora local de cada día (Cancún o España) marca la parada actual y la siguiente, y cuánto falta. Antes del viaje muestra la cuenta regresiva.
- **Funciona como app**: en el celular, "Agregar a pantalla de inicio". Abre sin internet una vez visitada; los mapas offline solo incluyen las zonas que ya se vieron.
- Checklist y tema claro/oscuro guardados en cada dispositivo.

## Entrar

La app pide **quién eres (Moni o Nando)** y una **contraseña compartida** (no está escrita en el repo; el código solo guarda su huella SHA-256). Según quién entra, los textos le hablan a esa persona ("Hola, Moni", "Tú · Articulate", "Para ti"…). Para cambiar de persona: botón de salida arriba a la derecha.

> Ojo: como el repositorio es público, la contraseña evita miradas casuales, no es seguridad real. Quien lea el código puede ver el itinerario.

## Checklist, fotos y ubicación

- Cada parada tiene **Visitada** y **Tomar foto**. "Tomar foto" abre la cámara del celular; la foto queda guardada en la app y la parada se marca como visitada.
- Las fotos se guardan **solo en ese celular** (y por persona). Toca una miniatura → **Guardar en galería** para pasarla a tus fotos; en el **Álbum del viaje** está "Guardar todas".
- **Usar mi ubicación** (arriba o en la barra "Ahora") muestra tu punto en el mapa, la distancia a cada parada y avisa al llegar a menos de 150 m de una parada pendiente. Solo funciona **con la app abierta** y en la dirección `https://`.

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
js/visitas.js         checklist, cámara y álbum
js/ubicacion.js       "estoy cerca"
js/sesion.js          entrada Moni / Nando
sw.js                 modo offline
vendor/               Leaflet 1.9.4, leaflet-gesture-handling, Lucide (licencias incluidas)
```

> El repositorio es público: no incluye la dirección exacta del hotel.
