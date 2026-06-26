// هر بار که فایل‌ها را عوض می‌کنی، این عدد نسخه را بالا ببر (مثلاً v2, v3, ...)
// این کار باعث می‌شود گوشی‌های مشتری‌ها مجبور شوند نسخه‌ی جدید را بگیرند
const CACHE_NAME = "dekan-akbari-v2";

// ✅ اصلاح شد: customer-auth.html به‌جای login.html
const assets = [
  "index.html",
  "cart.html",
  "customer-auth.html",
  "orders.html",
  "style.css"
];

// نصب سرویس ورکر و کش کردن فایل‌های اصلی
self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
  // فعال‌سازی فوری نسخه جدید به‌جای منتظر ماندن برای بسته شدن تمام تب‌ها
  self.skipWaiting();
});

// ✅ پاک کردن کش‌های نسخه‌ی قبلی هنگام فعال شدن نسخه‌ی جدید
self.addEventListener("activate", activateEvent => {
  activateEvent.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ✅ استراتژی Network First: همیشه اول از اینترنت بگیر، اگر نبود از کش بده
// این یعنی همیشه آخرین نسخه‌ی روی سرور نشان داده می‌شود، نه نسخه‌ی قدیمی کش‌شده
self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    fetch(fetchEvent.request)
      .then(networkResponse => {
        // نسخه‌ی تازه را در کش هم به‌روزرسانی می‌کنیم برای حالت آفلاین بعدی
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(fetchEvent.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        // اگر اینترنت نبود (آفلاین)، از کش بده
        return caches.match(fetchEvent.request);
      })
  );
});
