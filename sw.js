const CACHE_NAME = "dekan-akbari-v1";
const assets = ["index.html", "cart.html", "login.html", "style.css"];

// نصب سرویس ورکر
self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(assets);
    })
  );
});

// خواندن اطلاعات
self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request);
    })
  );
});
