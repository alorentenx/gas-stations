# ⛽ Gasolineras

Mapa interactivo de gasolineras de España con **precios oficiales en tiempo real** del Ministerio para la Transición Ecológica. Muestra las 3 más baratas de tu zona, calcula si **de verdad te compensa** desplazarte a una gasolinera más barata, enseña la **tendencia de precios** de las últimas dos semanas y funciona como **app instalable** con soporte sin conexión.

Es una aplicación web estática: HTML, CSS y JavaScript sin frameworks, sin paso de compilación y sin servidor propio.

**🔗 Demo en vivo: [gas-stations.aloal.workers.dev](https://gas-stations.aloal.workers.dev/)**

Ejemplos de enlaces directos:
- [Diésel en toda la provincia de Madrid](https://gas-stations.aloal.workers.dev/#prov=28&fuel=diesel&zona=prov)
- [Gasolina 95 low-cost abiertas ahora en Sevilla](https://gas-stations.aloal.workers.dev/#prov=41&fuel=g95&abiertas=1&marca=lowcost)

---

## Índice

- [Funcionalidades](#funcionalidades)
- [Uso rápido](#uso-rápido)
- [Stack técnico](#stack-técnico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Puesta en marcha](#puesta-en-marcha)
- [Despliegue](#despliegue)
- [Fuentes de datos](#fuentes-de-datos)
- [Arquitectura](#arquitectura)
- [Almacenamiento local](#almacenamiento-local)
- [Enlaces compartibles (URL)](#enlaces-compartibles-url)
- [Accesibilidad y diseño](#accesibilidad-y-diseño)
- [Seguridad](#seguridad)
- [Limitaciones conocidas](#limitaciones-conocidas)
- [Personalización](#personalización)
- [Créditos y licencias](#créditos-y-licencias)

---

## Funcionalidades

### 🗺️ Mapa y ranking
- **Mapa interactivo** (Leaflet) con todas las gasolineras de la zona coloreadas en una escala de verde (barata) a rojo (cara).
- **Top 3 más baratas** destacadas con medallas de oro, plata y bronce, siempre visibles por encima del resto.
- **Marcadores adaptativos:** con zoom lejano las estaciones se muestran como puntos de color, con el precio en un tooltip. A partir del zoom 14 se convierten en etiquetas con el precio.
- **Resumen:** precio mínimo, precio medio y número de estaciones.
- **Ahorro por depósito** de cada estación del podio frente a la media de la zona.
- **Empates** señalados explícitamente. A igual precio desempata la cercanía (si hay ubicación) y luego el nombre.
- **Popup por estación** con precio, diferencia frente a la media, variación desde ayer, horario, estado abierta/cerrada, coste real y botón **«Cómo llegar»** (Google Maps).

### 🇪🇸 Toda España
- **Selector de las 52 provincias.** Cada una usa su propio endpoint de la API.
- **Ciudad / Provincia:** alterna entre la capital y toda la provincia.
- **Detección automática:** al usar tu ubicación, si estás a más de 25 km de cualquier estación cargada, la app cambia a la provincia de la capital más cercana.
- Se recuerda la última provincia consultada.

### ⛽ Carburantes y filtros
- Hasta **10 carburantes**: Gasolina 95 E5, Diésel, Gasolina 98 E5, Diésel Premium, 95 E5 Premium, 95 E10, Diésel renovable (HVO), GLP, GNC (€/kg) e Hidrógeno (€/kg).
- **Solo se muestran los carburantes que existen** en la provincia seleccionada.
- **Filtro por marca**, con el número de estaciones de cada una, y opción **«Solo low-cost»**, que excluye las grandes petroleras.
- **«Abiertas ahora»:** oculta las estaciones cerradas en este momento.
- **«Solo top 3»:** deja en el mapa únicamente el podio.
- **Buscador** por marca, calle, localidad o código postal. No distingue tildes ni mayúsculas.
- **Venta restringida excluida:** se ocultan las estaciones que solo venden a socios (cooperativas), marcadas como `Tipo Venta = R` en la API.

### 🚗 «¿Te compensa ir?» — coste real
Una gasolinera 3 céntimos más barata a 10 km puede salir más cara. Con tu ubicación, la app calcula el **coste real** de cada estación:

```
coste real = precio × (litros a repostar + 2 × distancia × 1,3 × consumo / 100)
```

- `2 ×`: ida y vuelta.
- `1,3`: factor que convierte la distancia en línea recta en una aproximación a la distancia por carretera.
- Litros y consumo se configuran en **«Tu coche»** (por defecto 50 L y 6,5 L/100 km) y se guardan en el navegador.

La tarjeta de recomendación indica:
- la **mejor opción real** y cuánto pagarías en total;
- cuánto **ahorras frente a la más cercana**;
- si la **más barata por litro no compensa** por el desplazamiento.

La lista se puede ordenar por **Precio**, **Cerca** (distancia) o **Real** (coste real).

### 🕐 Horarios
- Interpreta los horarios del Ministerio: `L-D: 24H`, `L-V: 06:00-22:00; S-D: 07:00-15:00`, tramos partidos, horarios que cruzan la medianoche, etc.
- Indica si la estación está **abierta o cerrada ahora**, a qué hora **cierra** o cuándo **vuelve a abrir** («abre mañana a las 07:00»).
- Los horarios ambiguos, como `L: 24H` (un único día), se consideran no fiables. No se marcan como cerradas.
- El estado se recalcula cada 5 minutos.

### 📈 Tendencia de precios
- **Gráfica de los últimos 14 días más hoy** con el precio medio de la zona para el carburante elegido.
- Variación **frente a ayer** y **en 7 días**, y mínimo y máximo del periodo.
- Tooltip interactivo al pasar el ratón o tocar la gráfica.
- **Flechas ▲/▼ por estación** en la lista y en el popup: cuánto ha subido o bajado cada gasolinera desde ayer.
- El histórico se descarga en segundo plano (3 peticiones en paralelo) y se guarda. Solo se piden los días que falten.

### ⭐ Favoritas
- Guarda estaciones desde su popup.
- La tarjeta **«Tus gasolineras»** muestra sus precios actuales, la variación desde ayer, si están abiertas y la distancia.
- Se conservan entre sesiones y provincias.

### 🔗 Compartir
- Botón **Compartir** en cada estación. Usa la hoja de compartir nativa del móvil o, si no existe, copia el enlace al portapapeles.
- La URL refleja siempre el estado actual (provincia, carburante, filtros, estación abierta), así que cualquier vista se puede enviar tal cual. Ver [Enlaces compartibles](#enlaces-compartibles-url).

### 📱 App instalable (PWA) y modo sin conexión
- **Instalable** en móvil y escritorio (manifest e iconos).
- **Service worker** que guarda la página, las librerías y las teselas del mapa visitadas.
- **Caché de precios:** la última respuesta de cada provincia se guarda y se muestra al instante al abrir la app. Si tiene menos de 30 minutos, no se vuelve a pedir a la API.
- **Sin conexión:** se muestran los últimos precios guardados, con aviso de su antigüedad.
- **Modo ejemplo:** si la API no responde y no hay nada guardado (solo en Sevilla), se muestran 8 estaciones reales de ejemplo.

---

## Uso rápido

| Acción | Resultado |
|---|---|
| Abrir la app | Precios de la última provincia consultada (Sevilla por defecto) |
| Pulsar 📍 en el mapa | Centra el mapa en tu posición y ordena la lista por cercanía |
| Pulsar «¿Te compensa ir a la más barata?» | Calcula el coste real y recomienda la mejor opción |
| Pulsar una estación de la lista | El mapa vuela hasta ella y abre su ficha |
| Pulsar ⭐ en la ficha | La añade a «Tus gasolineras» |
| Pulsar ↻ | Fuerza la descarga de precios nuevos |

---

## Stack técnico

| Pieza | Tecnología |
|---|---|
| Interfaz | HTML5 + CSS3 (custom properties, grid, `backdrop-filter`) + JavaScript ES2020 sin frameworks |
| Mapa | [Leaflet 1.9.4](https://leafletjs.com/), cargado desde CDN con SRI y dos CDN de reserva |
| Teselas | Esri World Street Map, con reserva en `tile.openstreetmap.de` |
| Datos | API REST de carburantes del Ministerio (`energia.serviciosmin.gob.es`) |
| Gráfica | SVG generado a mano, sin librerías |
| Persistencia | `localStorage` + Cache Storage (service worker) |
| Iconos | Sprite SVG en línea |

Sin dependencias de npm, sin bundler y sin backend.

---

## Estructura del proyecto

```
gas-stations/
├── index.html            # La aplicación completa (HTML + CSS + JS)
├── sw.js                 # Service worker: caché de la app, CDN y teselas
├── manifest.webmanifest  # Manifiesto PWA (nombre, colores, iconos)
├── icon.svg              # Icono vectorial
├── icon-192.png          # Icono PWA 192×192 (también apple-touch-icon)
├── icon-512.png          # Icono PWA 512×512 (any + maskable)
└── README.md
```

---

## Puesta en marcha

No hay que instalar nada.

**Opción rápida:** abre `index.html` con doble clic. Funciona todo salvo la PWA (instalación y service worker), porque los navegadores solo la activan en `http(s)://`.

**Con servidor local** (recomendado para probar la PWA):

```bash
# Python
python -m http.server 8080

# o Node
npx serve .
```

Después abre <http://localhost:8080>. `localhost` cuenta como origen seguro, así que el service worker y la instalación funcionan.

---

## Despliegue

Es un sitio 100 % estático: la carpeta se sirve tal cual, sin compilar.

**Producción:** [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) (archivos estáticos) en <https://gas-stations.aloal.workers.dev/>, conectado a este repositorio de GitHub. Cada push a `main` genera un despliegue nuevo.

Funciona igual en cualquier otro hosting estático (Cloudflare Pages, GitHub Pages, Netlify, Vercel…): no hay comando de build y el directorio de salida es la raíz del repositorio.

Requisitos:
- **HTTPS**, obligatorio para el service worker y la instalación. `workers.dev` lo proporciona.
- **Subir todos los archivos** de la tabla anterior, no solo `index.html`. Sin ellos la app funciona igual, pero no se puede instalar ni abrir sin conexión.
- Todas las rutas son relativas, así que funciona en la raíz del dominio o en una subcarpeta.

Tras cada despliegue, los usuarios reciben la versión nueva automáticamente: los archivos propios se sirven con la estrategia *red primero*.

---

## Fuentes de datos

**API de precios de carburantes** — Ministerio para la Transición Ecológica y el Reto Demográfico (datos abiertos, Geoportal de gasolineras).

| Uso | Endpoint |
|---|---|
| Precios actuales | `…/PreciosCarburantes/EstacionesTerrestres/FiltroProvincia/{idProvincia}` |
| Histórico diario | `…/PreciosCarburantes/EstacionesTerrestresHist/FiltroProvincia/{dd-mm-aaaa}/{idProvincia}` |

Base: `https://energia.serviciosmin.gob.es/ServiciosRestCarburantes/`

- Los precios se actualizan aproximadamente cada 30 minutos.
- Los identificadores de provincia son los códigos INE (`01` Álava … `52` Melilla).
- **Tolerancia a fallos:** cada petición tiene un tiempo límite (8 s para precios, 15 s para histórico). Si falla, se reintenta a través de dos proxies CORS públicos (`corsproxy.io`, `allorigins.win`). La app recuerda la última fuente que funcionó para no perder tiempo en las siguientes peticiones.

---

## Arquitectura

Todo el código vive en `index.html`, organizado en bloques:

```
Carga ─► caché local (gs.data.<prov>) ─► ¿fresca (< 30 min)? ── sí ──► render
                  │                                   │
                  │ no hay / caducada                 no
                  ▼                                   ▼
        API directa ─► proxy 1 ─► proxy 2 ─► normalizar ─► guardar ─► render
                                     │
                                     └─ todo falla ─► copia guardada / modo ejemplo

render ─► current() ─► podio + recomendación + marcadores + lista + favoritas + tendencia
                         (filtra por zona, carburante, marca, abiertas; calcula distancia y coste real)

en segundo plano ─► loadHistory() ─► 14 días (solo los que falten) ─► gráfica y flechas ▲▼
```

| Bloque | Funciones principales |
|---|---|
| Datos y red | `fetchJSON`, `fetchWithFallback`, `normalizeApiRow`, `load`, `applyData` |
| Horarios | `parseHours`, `openInfo` |
| Coste real | `km` (haversine), `realCost`, `renderAdvice` |
| Histórico | `loadHistory`, `aggregate`, `trendSeries`, `renderTrend`, `drawTrend` |
| Mapa | `addTiles`, `iconFor`, `refreshIcons`, `popupFor`, `focusStation` |
| Estado y URL | `state`, `syncUI`, `hashFor`, `readHash`, `writeHash` |
| Render | `render`, `renderList`, `renderFavs` |

**Decisiones destacables**
- Los iconos del mapa solo se regeneran al cruzar el umbral de zoom, no en cada zoom.
- El mapa solo se reencuadra al cargar, al cambiar de zona o con «Solo top 3». Cambiar de carburante respeta la vista.
- Los horarios se analizan una sola vez por texto distinto (caché en memoria).
- Del histórico solo se guardan agregados por día (suma y número de precios por carburante y zona) y los precios por estación de ayer. Así ocupa pocos KB por provincia.

---

## Almacenamiento local

Todo se guarda en el navegador del usuario. No hay cuentas ni servidor.

| Clave `localStorage` | Contenido |
|---|---|
| `gs.prov` | Última provincia consultada |
| `gs.prefs` | Litros a repostar y consumo del coche |
| `gs.favs` | IDs de las gasolineras favoritas |
| `gs.data.<prov>` | Última respuesta de precios (normalizada) y su hora |
| `gs.hist.<prov>` | Agregados diarios de 14 días y precios de ayer por estación |

Si el espacio se agota, se liberan automáticamente las cachés de otras provincias. Si `localStorage` no está disponible (modo privado estricto), la app funciona igual, sin persistencia.

**Cache Storage (service worker):** la página e iconos (red primero), las librerías de CDN (caché primero) y hasta 600 teselas del mapa (caché primero). La API **no** pasa por el service worker; sus datos los gestiona la propia app.

---

## Enlaces compartibles (URL)

El estado se refleja en el *hash* de la URL, sin recargar la página:

```
https://gas-stations.aloal.workers.dev/#prov=41&fuel=diesel&zona=prov&abiertas=1&marca=lowcost&e=12345
```

| Parámetro | Valores | Significado |
|---|---|---|
| `prov` | `01`–`52` | Provincia (código INE) |
| `fuel` | `g95`, `diesel`, `g98`, `dieselp`, `g95p`, `g95e10`, `hvo`, `glp`, `gnc`, `h2` | Carburante |
| `zona` | `prov` | Toda la provincia (si no aparece: solo la capital) |
| `top` | `1` | Solo top 3 |
| `abiertas` | `1` | Solo abiertas ahora |
| `marca` | `lowcost` o nombre de marca | Filtro de marca |
| `e` | ID de estación (`IDEESS`) | Abre esa estación al cargar |

Si un enlace apunta a una estación oculta por los filtros actuales, los filtros se relajan para poder mostrarla.

---

## Accesibilidad y diseño

- **Modo claro y oscuro** automáticos según el sistema. El mapa usa siempre el estilo de calles claro por legibilidad.
- Diseño **responsive**: una columna en móvil y barra lateral con mapa fijo en escritorio (≥ 1024 px). En móvil los filtros se desplazan en horizontal y en escritorio pasan a varias líneas.
- Soporte de **safe areas** (notch) y altura dinámica del viewport.
- Controles con `aria-pressed`, etiquetas para lectores de pantalla, `role="status"` en los avisos y foco visible con teclado.
- La gráfica incluye una **descripción textual** (`aria-label`) con el resumen de los datos.
- El estado abierta/cerrada y las variaciones de precio llevan **texto y símbolo** (▲▼), no solo color.
- Respeta **`prefers-reduced-motion`**.
- Los campos numéricos usan 16 px para evitar el zoom automático de iOS.

---

## Seguridad

- **Subresource Integrity (SRI)** en Leaflet (JS y CSS), con el mismo hash verificado en los tres CDN.
- Todo el texto que viene de la API se **escapa** antes de insertarse en el HTML.
- Sin cookies, sin analítica, sin datos personales fuera del navegador. La ubicación se usa solo en el dispositivo para calcular distancias y **nunca se envía** a ningún servidor.
- Si la API directa falla, los proxies CORS públicos de reserva reciben la URL de la API. No reciben datos del usuario.

---

## Limitaciones conocidas

- **Distancia aproximada:** el coste real usa la distancia en línea recta ×1,3, no una ruta por carretera.
- **Detección de provincia:** se basa en la capital más cercana, así que cerca del límite entre provincias puede elegir la vecina. Se corrige a mano con el selector.
- **Horarios:** dependen de lo que declara cada estación al Ministerio. Algunos están incompletos o mal escritos.
- **Histórico:** la primera vez en cada provincia descarga 14 días (unas decenas de segundos en segundo plano). Después solo el día nuevo.
- **Proxies públicos:** son de terceros y pueden fallar o limitar peticiones.
- **Low-cost:** es una clasificación propia (todo lo que no es una gran petrolera), no oficial.

---

## Personalización

Parámetros principales en `index.html`:

| Constante | Valor | Qué controla |
|---|---|---|
| `FRESH_MS` | 30 min | Antigüedad máxima de la caché de precios antes de volver a pedirlos |
| `HIST_DAYS` | 14 | Días de histórico en la gráfica |
| `ROAD` | 1.3 | Factor de línea recta a carretera |
| `PIN_ZOOM` | 14 | Zoom a partir del cual se ven etiquetas con precio en lugar de puntos |
| `BIG_RE` | Repsol, Cepsa, Moeve, BP, Shell, Galp… | Marcas que no cuentan como low-cost |
| `FUELS` | 10 carburantes | Carburantes disponibles y su campo en la API |
| `prefs` | 50 L · 6,5 L/100 km | Valores por defecto de «Tu coche» |

En `sw.js`, `VERSION` fuerza la renovación de las cachés del service worker y `MAX_TILES` limita las teselas guardadas.

---

## Créditos y licencias

- **Datos:** Ministerio para la Transición Ecológica y el Reto Demográfico — Geoportal de gasolineras (datos abiertos).
- **Mapa:** [Leaflet](https://leafletjs.com/) (BSD-2-Clause) · Teselas © Esri — Esri, HERE, Garmin · © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
- Los precios son informativos. El precio válido es el que marque el surtidor.
