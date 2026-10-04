# Mytravel · Barcelona, Madrid y Toledo (15–21 oct 2026)

Web app del itinerario de Monica y Nando, hecha con el sistema de diseño **M-Design**.

- Itinerario día por día (D1–D7) con horarios, opciones de comida y cena, tips y presupuesto.
- **Mapa real** (OpenStreetMap + CARTO, con Leaflet) en cada día. Las paradas están numeradas y sincronizadas con el itinerario.
- Botón **"Ver ruta en Google Maps"** que abre la ruta completa del día con todas las paradas.
- **Modo "Ahora"**: con la hora de España marca la parada actual y la siguiente, y cuánto falta. Antes del viaje muestra la cuenta regresiva.
- **Funciona como app**: en el celular, "Agregar a pantalla de inicio". Abre sin internet una vez visitada; los mapas offline solo incluyen las zonas que ya se vieron.
- Checklist y tema claro/oscuro guardados en cada dispositivo.

## Publicarla con GitHub Pages

1. Settings → Pages → *Build and deployment* → Source: **Deploy from a branch**.
2. Branch: **main**, carpeta **/ (root)** → Save.
3. En uno o dos minutos queda en `https://dmonica90.github.io/Mytravel/`.

## Cambiar el itinerario

Todo el contenido está en [`js/itinerario.js`](js/itinerario.js):

- `t: '12:30'` es la hora de inicio de la parada, en hora de España. El modo "Ahora" la usa: cada parada dura hasta que empieza la siguiente.
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
sw.js                 modo offline
vendor/               Leaflet 1.9.4, leaflet-gesture-handling, Lucide (licencias incluidas)
```

> El repositorio es público: no incluye la dirección exacta del hotel.
