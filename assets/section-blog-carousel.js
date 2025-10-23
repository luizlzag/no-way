class BlogCarousel extends HTMLElement {
  constructor() {
    super();
    this.swiperContainer = this.querySelector('.swiper');
    if (!this.swiperContainer) return;

    this.prevButton = this.querySelector('.slider-button--prev');
    this.nextButton = this.querySelector('.slider-button--next');

    // Opções de configuração do Swiper
    const swiperOptions = {
      slidesPerView: 'auto',
      spaceBetween: 15,
      enabled: false, // Inicia desabilitado por padrão (mobile-first)
      navigation: {
        nextEl: this.nextButton,
        prevEl: this.prevButton,
      },
      a11y: {
        enabled: true,
        prevSlideMessage: 'Slide anterior',
        nextSlideMessage: 'Próximo slide',
      },
      breakpoints: {
        990: {
          enabled: true, // Habilita o Swiper apenas em telas maiores que 990px
          spaceBetween: 30,
        },
      },
      on: {
        // Recalcula o swiper quando o breakpoint é atingido
        breakpoint: (swiper) => {
          swiper.update();
        },
      },
    };

    // Inicializa o Swiper
    this.swiper = new Swiper(this.swiperContainer, swiperOptions);
  }

  // Limpa a instância do Swiper quando o elemento é removido do DOM
  disconnectedCallback() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }
  }
}

// Define o custom element
customElements.define('blog-carousel-component', BlogCarousel);