// Genera amigos/index.html (versión para amigos, desde la 01:00) a partir de index.html.
// Uso: node build-amigos.js   (volver a correrlo después de cada cambio en index.html)
const fs = require("fs");
const path = require("path");

const WHATSAPP = "5491135634102";
const MENSAJE = "¡Hola! Confirmo mi asistencia a los XV de Jimena 🎉";
const FECHA_EVENTO = "2027-01-09T01:00:00-03:00"; // la noche del 8 de enero, a la 01:00

let html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

function replaceOnce(from, to) {
  if (!html.includes(from)) throw new Error("No se encontró: " + from.slice(0, 80));
  html = html.replace(from, to);
}

// 1. Rutas relativas (la página vive en /amigos/)
html = html
  .replace(/(src|href)="(assets\/|styles\.css|effects\.css|script\.js|effects\.js)/g, '$1="../$2');

// 2. Fecha del evento para la cuenta regresiva
replaceOnce('<body class="intro-open">', `<body class="intro-open" data-event-date="${FECHA_EVENTO}">`);

// 3. Sin sección de invitados (confirman por WhatsApp, sin tokens)
html = html.replace(/\s*<!-- 2\. Invitados -->[\s\S]*?(?=\s*<!-- 3\. Cuenta regresiva -->)/, "");
if (html.includes('id="nombres-invitados"')) throw new Error("No se pudo quitar la sección de invitados");

// 4. Imagen de fecha y hora de amigos
replaceOnce('src="../assets/04-fecha-hora.png" alt="8 de enero de 2027, de 21:30 a 05:30"',
            'src="../assets/04-fecha-hora-amigos.png" alt="8 de enero de 2027, de 01:00 a 05:30"');
html = html.replace(/El 8 de enero de 2027 cumplo mis XV y te espero para celebrar juntos\./g,
                    "El 8 de enero de 2027 cumplo mis XV y te espero desde la 01:00 para celebrar juntos.");

// 5. Confirmación por WhatsApp
html = html.replace(/<a id="boton-confirmar"[^>]*>/,
  `<a id="boton-confirmar" class="hotspot hotspot--rsvp" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAJE)}" target="_blank" rel="noopener noreferrer" aria-label="Confirmar asistencia por WhatsApp">`);

// 6. Sin personalización por token
html = html.replace(/\s*<script src="invitation-personalization\.js"><\/script>/, "");

fs.mkdirSync(path.join(__dirname, "amigos"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "amigos", "index.html"), html);
console.log("amigos/index.html generado");
