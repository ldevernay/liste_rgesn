var CACHE_NAME = "rgesn-liste-v3";

// Pas de pré-cache d'une liste de fichiers : les noms de fichiers generes par
// Parcel changent a chaque build (hash de contenu). A la place, chaque
// ressource GET est mise en cache au fil de l'eau, des qu'elle est demandee
// par la page, puis resservie depuis le cache en cas de coupure reseau.

self.addEventListener("install", function(event){
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(key){ return key !== CACHE_NAME; })
            .map(function(key){ return caches.delete(key); })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function(event){
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(function(cached){
      var network = fetch(event.request).then(function(response){
        if (response && response.ok){
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache){
            cache.put(event.request, copy);
          });
        }
        return response;
      }).catch(function(){
        return cached;
      });
      return cached || network;
    })
  );
});
