/**
 * app.js — دکان آنلاین اکبری
 * فایل کمکی مشترک بین همه صفحات
 * سازگار با: cart_items، Supabase، Toast، style.css
 */

// ===== تنظیمات Supabase =====
const SUPABASE_URL     = "https://affstedmdsqeobtzrkyp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-6pETy_IFfTgZqN-ePvKeg_CIil3GUK";

// ایجاد یک نمونه واحد از supabase برای استفاده در همه صفحات
function getSupabase() {
  if (window._supabaseClient) return window._supabaseClient;
  window._supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return window._supabaseClient;
}

// ============================================================
// ===== مدیریت سبد خرید (cart_items) =====
// ============================================================

/**
 * خواندن سبد از localStorage
 * @returns {Array}
 */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart_items")) || [];
  } catch (e) {
    return [];
  }
}

/**
 * ذخیره سبد در localStorage
 * @param {Array} cart
 */
function saveCart(cart) {
  localStorage.setItem("cart_items", JSON.stringify(cart));
}

/**
 * افزودن یک کالا به سبد خرید
 * @param {number} productId
 * @param {string} productTitle
 * @param {string} unitName
 * @param {number} price
 * @param {number} qty
 * @returns {number} تعداد کل سبد
 */
function addToCart(productId, productTitle, unitName, price, qty = 1) {
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === productId && i.unitName === unitName);

  if (idx > -1) {
    cart[idx].qty += qty;
  } else {
    cart.push({
      id:       productId,
      title:    productTitle,
      unitName: unitName,
      price:    price,
      qty:      qty
    });
  }

  saveCart(cart);
  updateCartBadge();
  return cart.reduce((s, i) => s + i.qty, 0);
}

/**
 * حذف یک آیتم از سبد
 * @param {number} productId
 * @param {string} unitName
 */
function removeFromCart(productId, unitName) {
  const cart = getCart().filter(i => !(i.id === productId && i.unitName === unitName));
  saveCart(cart);
  updateCartBadge();
}

/**
 * تغییر تعداد یک آیتم — اگر به صفر رسید حذف می‌شود
 * @param {number} productId
 * @param {string} unitName
 * @param {number} delta  (مثبت یا منفی)
 * @returns {boolean} آیا آیتم هنوز موجود است؟
 */
function changeCartQty(productId, unitName, delta) {
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === productId && i.unitName === unitName);
  if (idx < 0) return false;

  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
    saveCart(cart);
    updateCartBadge();
    return false;
  }

  saveCart(cart);
  updateCartBadge();
  return true;
}

/**
 * خالی کردن کل سبد
 */
function clearCart() {
  localStorage.removeItem("cart_items");
  updateCartBadge();
}

/**
 * محاسبه جمع کل سبد
 * @returns {number}
 */
function getCartTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

/**
 * تعداد کل اقلام سبد
 * @returns {number}
 */
function getCartCount() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}

// ============================================================
// ===== بج سبد خرید (نشانگر قرمز) =====
// ============================================================

/**
 * آپدیت بج قرمز روی آیکون سبد
 */
function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  const count = getCartCount();
  badge.innerText = count;
  badge.style.display = count > 0 ? "block" : "none";
}

// ============================================================
// ===== نمایش Toast =====
// ============================================================

let _toastTimer = null;

/**
 * نمایش پیام Toast در پایین صفحه
 * @param {string} msg
 * @param {number} duration میلی‌ثانیه
 */
function showToast(msg, duration = 2500) {
  let t = document.getElementById("toast");

  // اگر toast در صفحه نبود، بسازش
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    document.body.appendChild(t);
  }

  t.innerText = msg;
  t.classList.add("show");

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove("show"), duration);
}

// ============================================================
// ===== فرمت اعداد =====
// ============================================================

/**
 * نمایش عدد با کاما (فارسی)
 * @param {number} n
 * @returns {string}
 */
function fmtPrice(n) {
  return Number(n).toLocaleString("fa-AF");
}

/**
 * نمایش عدد با کاما (لاتین)
 * @param {number} n
 * @returns {string}
 */
function fmtPriceLatin(n) {
  return Number(n).toLocaleString("en-US");
}

// ============================================================
// ===== مدیریت کاربر =====
// ============================================================

/**
 * بررسی وضعیت لاگین و آپدیت UI
 */
function checkUserSession() {
  const loggedIn = localStorage.getItem("customer_logged_in") === "true";
  const name     = localStorage.getItem("customer_name");

  const welcome = document.getElementById("user-welcome");
  const icon    = document.getElementById("user-avatar-icon");

  if (!welcome) return;

  if (loggedIn) {
    welcome.innerText    = name ? name.substring(0, 8) : "خروج";
    welcome.style.color  = "#ef4056";
    if (icon) icon.innerText = "🚪";
  } else {
    welcome.innerText   = "ورود";
    welcome.style.color = "";
    if (icon) icon.innerText = "👤";
  }
}

/**
 * ورود / خروج از حساب کاربری
 */
function handleAuthAction() {
  const loggedIn = localStorage.getItem("customer_logged_in") === "true";
  if (loggedIn) {
    if (confirm("آیا می‌خواهید از حساب خارج شوید؟")) {
      // فقط اطلاعات کاربری پاک می‌شود، سبد حفظ می‌شود
      const cartBackup = localStorage.getItem("cart_items");
      localStorage.clear();
      if (cartBackup) localStorage.setItem("cart_items", cartBackup);
      window.location.reload();
    }
  } else {
    window.location.href = "login.html";
  }
}

/**
 * خروج کامل (سبد هم پاک می‌شود)
 */
function fullLogout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// ============================================================
// ===== ناوبری به صفحه محصول =====
// ============================================================

/**
 * رفتن به صفحه جزئیات محصول
 * @param {number} productId
 */
function openProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
}

// ============================================================
// ===== اعتبارسنجی =====
// ============================================================

/**
 * چک کردن شماره تلفن افغانستان (07XXXXXXXX)
 * @param {string} phone
 * @returns {boolean}
 */
function isValidAfghanPhone(phone) {
  return /^07\d{8}$/.test(phone.replace(/\s/g, ""));
}

/**
 * نمایش یا پنهان کردن خطای یک فیلد
 * @param {string} inputId
 * @param {string} errorId
 * @param {boolean} hasError
 */
function setFieldError(inputId, errorId, hasError) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errorId);
  if (!input || !err) return;

  if (hasError) {
    input.classList.add("error");
    err.classList.add("show");
  } else {
    input.classList.remove("error");
    err.classList.remove("show");
  }
}

// ============================================================
// ===== بارگذاری خودکار هنگام لود صفحه =====
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // آپدیت همیشگی badge
  updateCartBadge();

  // بررسی لاگین
  checkUserSession();
});
