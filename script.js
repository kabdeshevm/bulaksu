const products = {
  "glass-03": { name: "Bulak Su 0,3 л", detail: "стеклянная тара" },
  "glass-05": { name: "Bulak Su 0,5 л", detail: "стеклянная тара" },
  "glass-07": { name: "Bulak Su 0,7 л", detail: "стеклянная тара" },
  "bottle-189": { name: "Бутыль 18,9 / 19 л", detail: "доставка домой и в офис" },
  "pet-line": { name: "Пластиковые бутылки", detail: "для спорта, дороги и мероприятий" },
  packaging: { name: "Пластиковая упаковка", detail: "12, 9 или 6 штук" },
};

const qualityPanels = {
  source: {
    title: "Родник “Ақбұлақ”",
    body:
      "Вода Bulak Su связана с родником “Ақбұлақ” в Таскалинском районе Западно-Казахстанской области. Источник ценят за чистоту, мягкий вкус и природное происхождение.",
  },
  composition: {
    title: "Минеральный состав",
    body:
      "В составе воды присутствуют природные минералы: железо, марганец и хлориды. Общая жесткость указана по данным анализа воды.",
  },
  eco: {
    title: "Тара под разные задачи",
    body:
      "Стеклянная тара подходит для сервировки и HoReCa, ПЭТ-бутылки удобны в дороге, а 18,9 л выбирают для кулеров и регулярной доставки.",
  },
};

const personaPanels = {
  office: {
    label: "Для офиса",
    title: "Регулярная поставка 18,9 л",
    body:
      "Бутыли для кулеров, резервный запас, регулярная доставка и согласованный график поставок.",
  },
  retail: {
    label: "Для магазинов",
    title: "Стекло, ПЭТ и упаковки",
    body:
      "Для торговых точек доступны стеклянные бутылки, ПЭТ-форматы и упаковки по 12, 9 или 6 штук.",
  },
  events: {
    label: "Для мероприятий",
    title: "Вода для спорта и событий",
    body:
      "Форматы 0,3, 0,5 л и ПЭТ-бутылки удобно выдавать участникам, гостям и командам во время мероприятий.",
  },
};

const cart = new Map();

function createIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function updateCartCount() {
  const total = [...cart.values()].reduce((sum, count) => sum + count, 0);
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = total;
  });
}

function renderDrawer() {
  const list = document.querySelector("[data-drawer-items]");
  if (!list) return;

  if (!cart.size) {
    list.innerHTML = '<p class="drawer-empty">Заявка пока пустая. Добавьте нужные позиции из каталога.</p>';
    updateCartCount();
    return;
  }

  list.innerHTML = [...cart.entries()]
    .map(([id, qty]) => {
      const product = products[id];
      return `
        <article class="drawer-item">
          <div>
            <strong>${product.name}</strong>
            <small>${product.detail}</small>
          </div>
          <div class="qty-controls" aria-label="Количество ${product.name}">
            <button type="button" data-qty-minus="${id}" aria-label="Уменьшить">-</button>
            <span>${qty}</span>
            <button type="button" data-qty-plus="${id}" aria-label="Увеличить">+</button>
          </div>
        </article>
      `;
    })
    .join("");
  updateCartCount();
}

function openDrawer() {
  const drawer = document.querySelector("[data-order-drawer]");
  if (!drawer) return;

  renderDrawer();
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}

function closeDrawer() {
  const drawer = document.querySelector("[data-order-drawer]");
  if (!drawer) return;

  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

function addToCart(id) {
  cart.set(id, (cart.get(id) || 0) + 1);
  renderDrawer();
  openDrawer();
}

function setupNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  toggle?.addEventListener("click", () => {
    nav?.classList.toggle("is-open");
  });

  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      nav.classList.remove("is-open");
    }
  });
}

function setupCatalog() {
  const filters = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-category]");

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filters.forEach((item) => {
        item.classList.toggle("is-active", item === button);
        item.setAttribute("aria-selected", String(item === button));
      });

      cards.forEach((card) => {
        const categories = card.dataset.category.split(" ");
        card.classList.toggle("is-hidden", filter !== "all" && !categories.includes(filter));
      });
    });
  });

  document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.addToCart));
  });
}

function setupDrawer() {
  document.querySelectorAll("[data-open-order]").forEach((button) => {
    button.addEventListener("click", openDrawer);
  });

  document.querySelectorAll("[data-close-order]").forEach((button) => {
    button.addEventListener("click", closeDrawer);
  });

  document.querySelector("[data-drawer-items]")?.addEventListener("click", (event) => {
    const plus = event.target.closest("[data-qty-plus]");
    const minus = event.target.closest("[data-qty-minus]");
    const id = plus?.dataset.qtyPlus || minus?.dataset.qtyMinus;
    if (!id) return;

    const next = (cart.get(id) || 0) + (plus ? 1 : -1);
    if (next <= 0) {
      cart.delete(id);
    } else {
      cart.set(id, next);
    }
    renderDrawer();
  });
}

function setupCalculator() {
  const form = document.querySelector("[data-calculator]");
  if (!form) return;

  const people = form.querySelector("[data-calc-people]");
  const days = form.querySelector("[data-calc-days]");
  const liters = form.querySelector("[data-calc-liters]");
  const peopleOutput = form.querySelector("[data-people-output]");
  const daysOutput = form.querySelector("[data-days-output]");
  const litersOutput = form.querySelector("[data-liters-output]");
  const totalOutput = form.querySelector("[data-calc-total]");
  const recommendation = form.querySelector("[data-calc-recommendation]");

  const update = () => {
    const total = Number(people.value) * Number(days.value) * Number(liters.value);
    const bigBottles = Math.ceil(total / 18.9);
    const smallBottles = Math.ceil(total / 0.7);
    peopleOutput.textContent = people.value;
    daysOutput.textContent = days.value;
    litersOutput.textContent = liters.value;
    totalOutput.textContent = `${Number.isInteger(total) ? total : total.toFixed(1)} л`;
    recommendation.textContent = `${bigBottles} бут. 18,9 л или ${smallBottles} бутылок 0,7 л`;
  };

  [people, days, liters].forEach((input) => input.addEventListener("input", update));
  update();
}

function setupQualityTabs() {
  const buttons = document.querySelectorAll("[data-quality-tab]");
  const panel = document.querySelector("[data-quality-panel]");
  if (!panel) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const data = qualityPanels[button.dataset.qualityTab];
      buttons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
        item.setAttribute("aria-selected", String(item === button));
      });
      panel.innerHTML = `<h3>${data.title}</h3><p>${data.body}</p>`;
    });
  });
}

function setupPersonaTabs() {
  const buttons = document.querySelectorAll("[data-persona]");
  const panel = document.querySelector("[data-persona-panel]");
  if (!panel) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const data = personaPanels[button.dataset.persona];
      buttons.forEach((item) => item.classList.toggle("is-active", item === button));
      panel.innerHTML = `<span>${data.label}</span><h3>${data.title}</h3><p>${data.body}</p>`;
    });
  });
}

function setupForms() {
  const leadForm = document.querySelector("[data-lead-form]");
  const orderForm = document.querySelector("[data-order-form]");

  leadForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    leadForm.querySelector("[data-form-status]").textContent =
      "Спасибо! Менеджер Bulak Su свяжется с вами для уточнения заказа.";
    leadForm.reset();
  });

  orderForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    orderForm.querySelector("[data-order-status]").textContent =
      "Спасибо! Заявка принята, менеджер уточнит детали доставки.";
  });
}

function setupScreenshotState() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get("shot");

  if (shot === "catalog") {
    document.querySelector("[data-filter='office']")?.click();
    setTimeout(() => document.querySelector("#products")?.scrollIntoView(), 80);
  }

  if (shot === "pet") {
    setTimeout(() => document.querySelector("[data-product-id='bottle-189']")?.scrollIntoView({ block: "center" }), 80);
  }

  if (shot === "order") {
    cart.set("bottle-189", 2);
    cart.set("pet-line", 1);
    setTimeout(openDrawer, 80);
  }

  if (shot === "mobile") {
    setTimeout(() => document.querySelector("#products")?.scrollIntoView(), 80);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupCatalog();
  setupDrawer();
  setupCalculator();
  setupQualityTabs();
  setupPersonaTabs();
  setupForms();
  renderDrawer();
  setupScreenshotState();
  createIcons();
});
