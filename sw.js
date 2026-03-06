// Mudamos para v3 para forçar a atualização
const CACHE_NAME = 'ludus-cache-v3'; 
const arquivosParaSalvar = [
  './index.html',
  './style.css',
  './logica.js',
  './manifest.json'
];

// 1. Instala e guarda os arquivos
self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(arquivosParaSalvar))
  );
});

// 2. O LIXEIRO (NOVO): Apaga as versões velhas do celular
self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys().then(nomesDosCaches => {
      return Promise.all(
        nomesDosCaches.map(nome => {
          if (nome !== CACHE_NAME) {
            console.log('Apagando cache velho:', nome);
            return caches.delete(nome);
          }
        })
      );
    })
  );
});

// 3. Responde usando o cache ou a internet
self.addEventListener('fetch', evento => {
  evento.respondWith(
    caches.match(evento.request)
      .then(resposta => resposta || fetch(evento.request))
  );
});