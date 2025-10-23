class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener(
      "keyup",
      (evt) => evt.code === "Escape" && this.close()
    );
    this.querySelector("#CartDrawer-Overlay").addEventListener(
      "click",
      this.close.bind(this)
    );
    this.setHeaderCartIconAccessibility();
  }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector("#cart-icon-bubble");
    if (!cartLink) return;

    cartLink.setAttribute("role", "button");
    cartLink.setAttribute("aria-haspopup", "dialog");
    cartLink.addEventListener("click", (event) => {
      event.preventDefault();
      this.open(cartLink);
    });
    cartLink.addEventListener("keydown", (event) => {
      if (event.code.toUpperCase() === "SPACE") {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute("role"))
      this.setSummaryAccessibility(cartDrawerNote);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add("animate", "active");
    });

    this.addEventListener(
      "transitionend",
      () => {
        const containerToTrapFocusOn = this.classList.contains("is-empty")
          ? this.querySelector(".drawer__inner-empty")
          : document.getElementById("CartDrawer");
        const focusElement =
          this.querySelector(".drawer__inner") ||
          this.querySelector(".drawer__close");
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );

    document.body.classList.add("overflow-hidden");
  }

  close() {
    this.classList.remove("active");
    removeTrapFocus(this.activeElement);
    document.body.classList.remove("overflow-hidden");
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute("role", "button");
    cartDrawerNote.setAttribute("aria-expanded", "false");

    if (cartDrawerNote.nextElementSibling.getAttribute("id")) {
      cartDrawerNote.setAttribute(
        "aria-controls",
        cartDrawerNote.nextElementSibling.id
      );
    }

    cartDrawerNote.addEventListener("click", (event) => {
      event.currentTarget.setAttribute(
        "aria-expanded",
        !event.currentTarget.closest("details").hasAttribute("open")
      );
    });

    cartDrawerNote.parentElement.addEventListener("keyup", onKeyUpEscape);
  }

  renderContents(parsedState) {
    this.querySelector(".drawer__inner").classList.contains("is-empty") &&
      this.querySelector(".drawer__inner").classList.remove("is-empty");
    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);

      if (!sectionElement) return;
      sectionElement.innerHTML = this.getSectionInnerHTML(
        parsedState.sections[section.id],
        section.selector
      );
    });

    setTimeout(() => {
      this.querySelector("#CartDrawer-Overlay").addEventListener(
        "click",
        this.close.bind(this)
      );
      this.open();
      initCartPromotionSwiperIfExists;
    }, 50);
  }

  getSectionInnerHTML(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: "cart-drawer",
        selector: "#CartDrawer",
      },
      {
        id: "cart-icon-bubble",
      },
    ];
  }

  getSectionDOM(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector);
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

function initCartPromotionSwiperIfExists() {
  const swiperContainers = document.querySelectorAll(".card-off-carrousel");

  swiperContainers.forEach((el) => {
    if (el.swiper) return;

    const swiperWrapper = el.querySelector(".swiper-wrapper");
    if (!swiperWrapper || swiperWrapper.children.length === 0) return;

    new Swiper(el, {
      slidesPerView: "auto",
      centeredSlides: true,
      centerInsufficientSlides: true,
      spaceBetween: 20,
      navigation: {
        nextEl: el.querySelector(".swiper-button-next"),
        prevEl: el.querySelector(".swiper-button-prev"),
      },
      autoplay: {
        delay: 5000,
        disableOnInteraction: true,
      },
      loop: false,
      resistanceRatio: 0,
      preventClicks: true,
      breakpoints: {
        480: { slidesPerView: "auto", spaceBetween: 10 },
        768: { slidesPerView: "auto", spaceBetween: 15 },
        1024: { slidesPerView: "auto", spaceBetween: 20 },
      },
    });

    console.log("[✅ Swiper inicializado com sucesso]");
  });
}

// 👇 MutationObserver para monitorar quando a seção do drawer muda
const drawerContent = document.querySelector("#CartDrawer");

if (drawerContent) {
  const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        const swiperExists = drawerContent.querySelector(".card-off-carrousel");
        if (swiperExists) {
          console.log("[👀 Swiper apareceu no DOM]");
          initCartPromotionSwiperIfExists();
        }
      }
    }
  });

  observer.observe(drawerContent, {
    childList: true,
    subtree: true,
  });

  console.log("[🛠️ MutationObserver ligado no #CartDrawer]");
}

customElements.define("cart-drawer", CartDrawer);

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: "CartDrawer",
        section: "cart-drawer",
        selector: ".drawer__inner",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
        selector: ".shopify-section",
      },
    ];
  }
}

function initCartPromotionSwiperIfExists() {
  document.querySelectorAll(".card-off-carrousel").forEach((el) => {
    if (el.swiper) return;

    const swiperWrapper = el.querySelector(".swiper-wrapper");
    if (!swiperWrapper || swiperWrapper.children.length === 0) return;

    new Swiper(el, {
      slidesPerView: "auto",
      centeredSlides: true,
      centerInsufficientSlides: true,
      spaceBetween: 20,
      navigation: {
        nextEl: el.querySelector(".swiper-button-next"),
        prevEl: el.querySelector(".swiper-button-prev"),
      },
      autoplay: {
        delay: 5000,
        disableOnInteraction: true,
      },
      loop: false,
      resistanceRatio: 0,
      preventClicks: true,
      breakpoints: {
        480: { slidesPerView: "auto", spaceBetween: 10 },
        768: { slidesPerView: "auto", spaceBetween: 15 },
        1024: { slidesPerView: "auto", spaceBetween: 20 },
      },
    });

    console.log("[✅ Swiper inicializado com sucesso]");
  });
}

customElements.define("cart-drawer-items", CartDrawerItems);
