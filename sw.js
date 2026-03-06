const CACHE_NAME = 'ludus-cache-v2';
const arquivosParaSalvar = [
  './index.html',
  './style.css',
  './logica.js',
  './manifest.json'
];

// Quando o PWA é instalado, ele guarda os arquivos do jogo
self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(arquivosParaSalvar))
  );
});

// Quando o jogador abre o app, ele busca da memória (mesmo offline)
self.addEventListener('fetch', evento => {
  evento.respondWith(
    caches.match(evento.request)
      .then(resposta => resposta || fetch(evento.request))
  );
});