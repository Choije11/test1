/**
 * 크롤링 연습용 정적 상점 — 위시리스트 / 장바구니 (localStorage)
 */

const STORAGE_WISH = "crawlShopWishlist";
const STORAGE_CART = "crawlShopCart";

const PRODUCTS = [
  {
    id: "p1",
    sku: "SFG16-71-77FT",
    title: "에이서 스위프트 GO 16 OLED, 스틸 그레이, 코어i7, 512GB, 16GB, WIN11 Home, SFG16-71-77FT",
    price: 1419000,
    oldPrice: null,
    category: "노트북",
    brand: "ASUS",
    reviews: 16,
    hot: true,
    salePct: null,
  },
  {
    id: "p2",
    sku: "NT550XDA-K24AT",
    title: "삼성전자 노트북 플러스2 15.6, 퓨어 화이트, NT550XDA-K24AT, 펜티엄, 256GB, 8GB, WIN11 Pro",
    price: 549000,
    oldPrice: null,
    category: "노트북",
    brand: "SAMSUNG",
    reviews: 405,
    hot: true,
    salePct: null,
  },
  {
    id: "p3",
    sku: "82VG002EKR",
    title: "레노버 아이디어패드 슬림 1 15AMN7 15.6, 256GB, Free DOS, 82VG002EKR, 라이젠3, Cloud Grey, 8GB",
    price: 529000,
    oldPrice: null,
    category: "노트북",
    brand: "LENOVO",
    reviews: 903,
    hot: false,
    salePct: null,
  },
  {
    id: "p4",
    sku: "82YU0009KR",
    title: "레노버 V15 G4 AMN 15.6, Arctic Grey, 라이젠3, 256GB, 8GB, WIN11 Home, 82YU0009KR",
    price: 624000,
    oldPrice: 649000,
    category: "노트북",
    brand: "LENOVO",
    reviews: 1,
    hot: true,
    salePct: 3,
  },
  {
    id: "p5",
    sku: "16U70R-GA56K",
    title: "LG 울트라PC 엣지 16, 차콜 그레이, 라이젠5, 256GB, 16GB, WIN11 Home, 16U70R-GA56K",
    price: 1135000,
    oldPrice: null,
    category: "노트북",
    brand: "LG",
    reviews: 155,
    hot: true,
    salePct: null,
  },
  {
    id: "p6",
    sku: "BB1422SS",
    title: "베이직스 베이직북 14 3세대, BB1422SS, 256GB, White, WIN11 Pro, 셀러론, 8GB",
    price: 398000,
    oldPrice: null,
    category: "노트북",
    brand: "ASUS",
    reviews: 1541,
    hot: true,
    salePct: null,
  },
  {
    id: "p7",
    sku: "82XD002XKR",
    title: "레노버 아이디어패드 슬림 5i 14IRL 14, Cloud Grey, 코어i5, 512GB, 16GB, Free DOS, 82XD002XKR",
    price: 899000,
    oldPrice: 1099000,
    category: "노트북",
    brand: "LENOVO",
    reviews: 106,
    hot: false,
    salePct: 18,
  },
  {
    id: "p8",
    sku: "82XF001RKR",
    title: "레노버 아이디어패드 슬림 5 16IRL 16, Cloud Grey, 512GB, 16GB, Free DOS, 82XF001RKR",
    price: 929000,
    oldPrice: null,
    category: "노트북",
    brand: "LENOVO",
    reviews: 118,
    hot: false,
    salePct: null,
  },
  {
    id: "p9",
    sku: "SFG16-71-51BY",
    title: "에이서 스위프트 GO 16 OLED, 스틸 그레이, 코어i5, 512GB, 16GB, Free DOS, SFG16-71-51BY",
    price: 1008000,
    oldPrice: null,
    category: "노트북",
    brand: "ASUS",
    reviews: 16,
    hot: false,
    salePct: null,
  },
  {
    id: "p10",
    sku: "NT550XED-K78AS",
    title: "삼성전자 갤럭시북 2 15.6, 500GB, 실버, NT550XED-K78AS, 코어i7, 16GB, WIN11 Home",
    price: 1149000,
    oldPrice: null,
    category: "노트북",
    brand: "SAMSUNG",
    reviews: 687,
    hot: true,
    salePct: null,
  },
];

function formatWon(n) {
  return n.toLocaleString("ko-KR");
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let wishlistIds = new Set(loadJson(STORAGE_WISH, []));
let cartMap = new Map(loadJson(STORAGE_CART, []).map((e) => [e.id, e.qty]));

let filterCategory = null;
let filterBrand = null;

const grid = document.getElementById("product-grid");
const sortSelect = document.getElementById("sort-select");
const pagerInfo = document.getElementById("pager-info");
const filterReset = document.getElementById("filter-reset");

function persist() {
  saveJson(STORAGE_WISH, [...wishlistIds]);
  saveJson(
    STORAGE_CART,
    [...cartMap.entries()].map(([id, qty]) => ({ id, qty }))
  );
}

function productById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function cartItemCount() {
  let n = 0;
  cartMap.forEach((q) => {
    n += q;
  });
  return n;
}

function cartTotal() {
  let sum = 0;
  cartMap.forEach((qty, id) => {
    const p = productById(id);
    if (p) sum += p.price * qty;
  });
  return sum;
}

function updateCounts() {
  const w = document.getElementById("wishlist-count");
  const c = document.getElementById("cart-count");
  if (w) w.textContent = String(wishlistIds.size);
  if (c) c.textContent = String(cartItemCount());
}

function renderBagPanels() {
  const wishUl = document.querySelector('[data-list="wishlist"]');
  const cartUl = document.querySelector('[data-list="cart"]');
  const emptyWish = document.querySelector("[data-empty-wishlist]");
  const emptyCart = document.querySelector("[data-empty-cart]");
  const totalWrap = document.querySelector("[data-cart-total-wrap]");
  const totalEl = document.getElementById("cart-total-price");

  const wishItems = [...wishlistIds].map(productById).filter(Boolean);
  if (wishUl) {
    wishUl.innerHTML = wishItems
      .map(
        (p) => `<li data-line-wish="${p.id}">
          <span class="name">${escapeHtml(p.title)}</span>
          <button type="button" data-remove-wish="${p.id}">삭제</button>
        </li>`
      )
      .join("");
  }
  if (emptyWish) emptyWish.hidden = wishItems.length > 0;

  const cartLines = [...cartMap.entries()]
    .map(([id, qty]) => ({ p: productById(id), qty }))
    .filter((x) => x.p);
  if (cartUl) {
    cartUl.innerHTML = cartLines
      .map(
        ({ p, qty }) => `<li data-line-cart="${p.id}">
          <span class="name">${escapeHtml(p.title)}</span>
          <span class="meta">${qty}×</span>
          <button type="button" data-remove-cart="${p.id}">삭제</button>
        </li>`
      )
      .join("");
  }
  if (emptyCart) emptyCart.hidden = cartLines.length > 0;

  const total = cartTotal();
  if (totalWrap && totalEl) {
    totalWrap.hidden = cartLines.length === 0;
    totalEl.textContent = formatWon(total);
  }

  document.querySelectorAll(".btn-wishlist").forEach((btn) => {
    const id = btn.getAttribute("data-add-wishlist");
    if (id && wishlistIds.has(id)) btn.classList.add("is-in-wishlist");
    else btn.classList.remove("is-in-wishlist");
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function filteredProducts() {
  return PRODUCTS.filter((p) => {
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterBrand && p.brand !== filterBrand) return false;
    return true;
  });
}

function sortedProducts(list) {
  const mode = sortSelect ? sortSelect.value : "popular";
  const copy = [...list];
  if (mode === "price-asc") copy.sort((a, b) => a.price - b.price);
  else if (mode === "price-desc") copy.sort((a, b) => b.price - a.price);
  else copy.sort((a, b) => b.reviews - a.reviews);
  return copy;
}

function renderGrid() {
  const list = sortedProducts(filteredProducts());
  if (list.length === 0) {
    grid.innerHTML =
      '<p class="empty-grid" role="status">조건에 맞는 상품이 없습니다. 필터를 초기화해 보세요.</p>';
    if (pagerInfo) pagerInfo.textContent = "Showing 0 items";
    return;
  }

  grid.innerHTML = list
    .map((p) => {
      const badges = [];
      if (p.salePct) badges.push(`<span class="badge badge--sale">-${p.salePct}%</span>`);
      if (p.hot) badges.push(`<span class="badge badge--hot">HOT</span>`);
      const old =
        p.oldPrice != null
          ? `<span class="old">${formatWon(p.oldPrice)}원</span>`
          : "";
      const inWish = wishlistIds.has(p.id);
      return `<article class="product-card" data-product-id="${p.id}" data-sku="${escapeHtml(
        p.sku
      )}" data-category="${escapeHtml(p.category)}" data-brand="${escapeHtml(p.brand)}" data-price="${
        p.price
      }">
        <div class="product-card__thumb" data-role="thumb-placeholder">
          ${badges.length ? `<div class="product-card__badges">${badges.join("")}</div>` : ""}
          IMAGE
        </div>
        <div class="product-card__body">
          <p class="product-card__cat">${escapeHtml(p.category)}</p>
          <h3 class="product-card__title">
            <a href="#product-${p.id}" id="product-${p.id}">${escapeHtml(p.title)}</a>
          </h3>
          <p class="product-card__price">${formatWon(p.price)}원 ${old}</p>
          <p class="product-card__reviews">(${p.reviews})</p>
          <div class="product-card__actions">
            <button type="button" class="btn-wishlist${inWish ? " is-in-wishlist" : ""}" data-add-wishlist="${
        p.id
      }">add to wishlist</button>
            <a href="#" data-quick-view="${p.id}">quick view</a>
            <button type="button" data-add-cart="${p.id}">add to cart</button>
          </div>
        </div>
      </article>`;
    })
    .join("");

  if (pagerInfo) {
    pagerInfo.textContent = `Showing 1 page · ${list.length} items`;
  }
  renderBagPanels();
}

function toggleWishlist(id) {
  if (wishlistIds.has(id)) wishlistIds.delete(id);
  else wishlistIds.add(id);
  persist();
  updateCounts();
  renderGrid();
}

function addToCart(id) {
  const prev = cartMap.get(id) || 0;
  cartMap.set(id, prev + 1);
  persist();
  updateCounts();
  renderBagPanels();
}

function removeWish(id) {
  wishlistIds.delete(id);
  persist();
  updateCounts();
  renderGrid();
}

function removeCartLine(id) {
  cartMap.delete(id);
  persist();
  updateCounts();
  renderGrid();
}

function setFilterLinkActive() {
  document.querySelectorAll("[data-filter-cat]").forEach((a) => {
    const v = a.getAttribute("data-filter-cat");
    a.classList.toggle("is-active", filterCategory === v);
  });
  document.querySelectorAll("[data-filter-brand]").forEach((a) => {
    const v = a.getAttribute("data-filter-brand");
    a.classList.toggle("is-active", filterBrand === v);
  });
}

document.addEventListener("click", (e) => {
  const wishBtn = e.target.closest("[data-add-wishlist]");
  if (wishBtn) {
    e.preventDefault();
    toggleWishlist(wishBtn.getAttribute("data-add-wishlist"));
    return;
  }
  const cartBtn = e.target.closest("[data-add-cart]");
  if (cartBtn) {
    e.preventDefault();
    addToCart(cartBtn.getAttribute("data-add-cart"));
    return;
  }
  const rmWish = e.target.closest("[data-remove-wish]");
  if (rmWish) {
    e.preventDefault();
    removeWish(rmWish.getAttribute("data-remove-wish"));
    return;
  }
  const rmCart = e.target.closest("[data-remove-cart]");
  if (rmCart) {
    e.preventDefault();
    removeCartLine(rmCart.getAttribute("data-remove-cart"));
    return;
  }
  const qv = e.target.closest("[data-quick-view]");
  if (qv) {
    e.preventDefault();
    const id = qv.getAttribute("data-quick-view");
    const p = productById(id);
    if (p) window.alert(`[quick view]\n${p.title}\n${formatWon(p.price)}원`);
    return;
  }

  const toggle = e.target.closest("[data-bag-toggle]");
  if (toggle) {
    const which = toggle.getAttribute("data-bag-toggle");
    const panel = document.querySelector(`[data-bag-panel="${which}"]`);
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    document.querySelectorAll("[data-bag-toggle]").forEach((t) => {
      const w = t.getAttribute("data-bag-toggle");
      const p = document.querySelector(`[data-bag-panel="${w}"]`);
      t.setAttribute("aria-expanded", "false");
      if (p) p.hidden = true;
    });
    if (!expanded && panel) {
      toggle.setAttribute("aria-expanded", "true");
      panel.hidden = false;
    }
    return;
  }

  if (!e.target.closest(".bag")) {
    document.querySelectorAll("[data-bag-toggle]").forEach((t) => {
      const w = t.getAttribute("data-bag-toggle");
      const p = document.querySelector(`[data-bag-panel="${w}"]`);
      t.setAttribute("aria-expanded", "false");
      if (p) p.hidden = true;
    });
  }
});

document.querySelectorAll("[data-filter-cat]").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const v = a.getAttribute("data-filter-cat");
    filterCategory = filterCategory === v ? null : v;
    setFilterLinkActive();
    renderGrid();
  });
});

document.querySelectorAll("[data-filter-brand]").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const v = a.getAttribute("data-filter-brand");
    filterBrand = filterBrand === v ? null : v;
    setFilterLinkActive();
    renderGrid();
  });
});

if (filterReset) {
  filterReset.addEventListener("click", () => {
    filterCategory = null;
    filterBrand = null;
    setFilterLinkActive();
    renderGrid();
  });
}

if (sortSelect) {
  sortSelect.addEventListener("change", () => renderGrid());
}

updateCounts();
setFilterLinkActive();
renderGrid();
