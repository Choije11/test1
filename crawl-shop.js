/**
 * Electro basic practice
 * - Keeps template classes, no external JS deps
 * - Wishlist / Cart stored in localStorage
 */

const LS_WISHLIST = "electroBasicWishlist";
const LS_CART = "electroBasicCart";

function loadJson(key, fallback) {
	try {
		const v = localStorage.getItem(key);
		if (!v) return fallback;
		return JSON.parse(v);
	} catch {
		return fallback;
	}
}

function saveJson(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
}

function formatWon(n) {
	return Number(n).toLocaleString("ko-KR");
}

function escapeHtml(str) {
	const div = document.createElement("div");
	div.textContent = String(str ?? "");
	return div.innerHTML;
}

function getProductElFromTarget(target) {
	return target?.closest?.(".product") ?? null;
}

function getProductData(productEl) {
	const id = productEl.getAttribute("data-product-id") || "";
	const sku = productEl.getAttribute("data-sku") || "";
	const category = productEl.getAttribute("data-category") || "";
	const brand = productEl.getAttribute("data-brand") || "";
	const price = Number(productEl.getAttribute("data-price") || 0);
	const oldPrice = productEl.getAttribute("data-old-price");
	const img = productEl.querySelector(".product-img img")?.getAttribute("src") || "";
	const name = productEl.querySelector(".product-name a")?.textContent?.trim() || "";
	return {
		id,
		sku,
		category,
		brand,
		price,
		oldPrice: oldPrice == null ? null : Number(oldPrice),
		img,
		name,
	};
}

let wishlist = new Set(loadJson(LS_WISHLIST, []));
let cart = new Map(loadJson(LS_CART, []).map((x) => [x.id, x.qty]));

function persist() {
	saveJson(LS_WISHLIST, [...wishlist]);
	saveJson(
		LS_CART,
		[...cart.entries()].map(([id, qty]) => ({ id, qty }))
	);
}

function cartCount() {
	let sum = 0;
	for (const qty of cart.values()) sum += qty;
	return sum;
}

function cartTotal() {
	let total = 0;
	document.querySelectorAll(".product[data-product-id]").forEach((pEl) => {
		const id = pEl.getAttribute("data-product-id");
		if (!id) return;
		const qty = cart.get(id);
		if (!qty) return;
		const price = Number(pEl.getAttribute("data-price") || 0);
		total += price * qty;
	});
	return total;
}

function updateHeaderQty() {
	const wQty = document.querySelector("[data-wishlist-qty]");
	const cQty = document.querySelector("[data-cart-qty]");
	if (wQty) wQty.textContent = String(wishlist.size);
	if (cQty) cQty.textContent = String(cartCount());
}

function renderPanels() {
	const wishlistList = document.querySelector("[data-wishlist-list]");
	const cartList = document.querySelector("[data-cart-list]");
	const wishEmpty = document.querySelector("[data-wishlist-empty]");
	const cartEmpty = document.querySelector("[data-cart-empty]");
	const cartTotalEl = document.querySelector("[data-cart-total]");

	const productById = new Map();
	document.querySelectorAll(".product[data-product-id]").forEach((pEl) => {
		const d = getProductData(pEl);
		productById.set(d.id, d);
	});

	if (wishlistList) {
		const items = [...wishlist].map((id) => productById.get(id)).filter(Boolean);
		wishlistList.innerHTML = items
			.map(
				(p) => `<div class="cart-item" data-wish-line="${escapeHtml(p.id)}">
					<img src="${escapeHtml(p.img)}" alt="">
					<div>
						<div class="name">${escapeHtml(p.name)}</div>
						<div class="meta">${escapeHtml(p.sku)}</div>
					</div>
					<button class="remove" type="button" data-remove-wish="${escapeHtml(p.id)}">삭제</button>
				</div>`
			)
			.join("");
		if (wishEmpty) wishEmpty.hidden = items.length > 0;
	}

	if (cartList) {
		const lines = [...cart.entries()]
			.map(([id, qty]) => {
				const p = productById.get(id);
				if (!p) return null;
				return { p, qty };
			})
			.filter(Boolean);
		cartList.innerHTML = lines
			.map(
				({ p, qty }) => `<div class="cart-item" data-cart-line="${escapeHtml(p.id)}">
					<img src="${escapeHtml(p.img)}" alt="">
					<div>
						<div class="name">${escapeHtml(p.name)}</div>
						<div class="meta">${qty}× · ${formatWon(p.price)}원</div>
					</div>
					<button class="remove" type="button" data-remove-cart="${escapeHtml(p.id)}">삭제</button>
				</div>`
			)
			.join("");
		if (cartEmpty) cartEmpty.hidden = lines.length > 0;
	}

	if (cartTotalEl) cartTotalEl.textContent = formatWon(cartTotal());

	// reflect wishlist button state
	document.querySelectorAll(".add-to-wishlist").forEach((btn) => {
		const pEl = getProductElFromTarget(btn);
		if (!pEl) return;
		const id = pEl.getAttribute("data-product-id");
		btn.classList.toggle("is-active", !!id && wishlist.has(id));
	});
}

function closeAllPanels() {
	document.querySelectorAll(".dropdown-menu[data-panel]").forEach((el) => {
		el.hidden = true;
	});
	document.querySelectorAll("[data-panel-toggle]").forEach((a) => {
		a.setAttribute("aria-expanded", "false");
	});
}

function togglePanel(which) {
	const panel = document.querySelector(`.dropdown-menu[data-panel="${which}"]`);
	const toggle = document.querySelector(`[data-panel-toggle="${which}"]`);
	if (!panel || !toggle) return;

	const isOpen = !panel.hidden;
	closeAllPanels();
	if (!isOpen) {
		panel.hidden = false;
		toggle.setAttribute("aria-expanded", "true");
	}
}

document.addEventListener("click", (e) => {
	const toggle = e.target.closest("[data-panel-toggle]");
	if (toggle) {
		e.preventDefault();
		togglePanel(toggle.getAttribute("data-panel-toggle"));
		return;
	}

	const removeWish = e.target.closest("[data-remove-wish]");
	if (removeWish) {
		e.preventDefault();
		const id = removeWish.getAttribute("data-remove-wish");
		if (id) wishlist.delete(id);
		persist();
		updateHeaderQty();
		renderPanels();
		return;
	}

	const removeCart = e.target.closest("[data-remove-cart]");
	if (removeCart) {
		e.preventDefault();
		const id = removeCart.getAttribute("data-remove-cart");
		if (id) cart.delete(id);
		persist();
		updateHeaderQty();
		renderPanels();
		return;
	}

	const wishBtn = e.target.closest(".add-to-wishlist");
	if (wishBtn) {
		e.preventDefault();
		const pEl = getProductElFromTarget(wishBtn);
		if (!pEl) return;
		const id = pEl.getAttribute("data-product-id");
		if (!id) return;
		if (wishlist.has(id)) wishlist.delete(id);
		else wishlist.add(id);
		persist();
		updateHeaderQty();
		renderPanels();
		return;
	}

	const cartBtn = e.target.closest(".add-to-cart-btn");
	if (cartBtn) {
		e.preventDefault();
		const pEl = getProductElFromTarget(cartBtn);
		if (!pEl) return;
		const id = pEl.getAttribute("data-product-id");
		if (!id) return;
		cart.set(id, (cart.get(id) || 0) + 1);
		persist();
		updateHeaderQty();
		renderPanels();
		return;
	}

	const quickView = e.target.closest(".quick-view");
	if (quickView) {
		e.preventDefault();
		const pEl = getProductElFromTarget(quickView);
		if (!pEl) return;
		const d = getProductData(pEl);
		window.alert(`[quick view]\n${d.name}\n${formatWon(d.price)}원\nSKU: ${d.sku}`);
		return;
	}

	// click outside dropdown closes panels
	if (!e.target.closest(".dropdown")) {
		closeAllPanels();
	}
});

document.getElementById("sortBy")?.addEventListener("change", (e) => {
	const mode = e.target.value;
	const container = document.getElementById("product-container");
	if (!container) return;
	const cards = [...container.querySelectorAll(":scope > .col-md-4")];
	const getPrice = (col) => Number(col.querySelector(".product")?.getAttribute("data-price") || 0);
	const getPopular = (col) => {
		const txt = col.querySelector(".sub_cnt")?.textContent || "";
		const m = txt.match(/\((\d+)\)/);
		return m ? Number(m[1]) : 0;
	};

	if (mode === "price-asc") cards.sort((a, b) => getPrice(a) - getPrice(b));
	else if (mode === "price-desc") cards.sort((a, b) => getPrice(b) - getPrice(a));
	else cards.sort((a, b) => getPopular(b) - getPopular(a));

	cards.forEach((c) => container.appendChild(c));
});

updateHeaderQty();
renderPanels();

