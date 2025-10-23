/**
 * Counter Animation - Animação de contador para números
 * Faz os números subirem até o valor definido quando a seção entrar na tela
 */

class CounterAnimation {
  constructor(options = {}) {
    this.options = {
      duration: options.duration || 2000,
      delay: options.delay || 300,
      threshold: options.threshold || 0.3,
      rootMargin: options.rootMargin || '0px 0px -50px 0px',
      ...options
    };
    
    this.observers = new Map();
    this.init();
  }
  
  init() {
    // Aguardar o DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupObservers());
    } else {
      this.setupObservers();
    }
    
    // Suporte para Shopify Design Mode
    if (window.Shopify && window.Shopify.designMode) {
      document.addEventListener('shopify:section:load', (event) => {
        this.setupObservers(event.target);
      });
    }
  }
  
  setupObservers(rootElement = document) {
    const counterSections = rootElement.querySelectorAll('[data-counter-section]');
    
    counterSections.forEach(section => {
      if (this.observers.has(section)) return;
      
      const observer = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        {
          threshold: this.options.threshold,
          rootMargin: this.options.rootMargin
        }
      );
      
      observer.observe(section);
      this.observers.set(section, observer);
    });
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.startCounterAnimation(entry.target);
        
        // Parar de observar após iniciar a animação
        const observer = this.observers.get(entry.target);
        if (observer) {
          observer.unobserve(entry.target);
          this.observers.delete(entry.target);
        }
      }
    });
  }
  
  startCounterAnimation(section) {
    const counterElements = section.querySelectorAll('[data-counter-target]');
    
    // Adicionar classe de animação na seção
    section.classList.add('counter-animation-active');
    
    // Animar cada contador com delay escalonado
    counterElements.forEach((element, index) => {
      const target = this.parseTarget(element.getAttribute('data-counter-target'));
      const delay = index * this.options.delay;
      
      setTimeout(() => {
        this.animateCounter(element, target);
      }, delay);
    });
  }
  
  parseTarget(target) {
    // Suporta diferentes formatos: "85", "85%", "1000+", etc.
    if (typeof target === 'string') {
      // Remover símbolos de porcentagem e outros caracteres
      const cleanTarget = target.replace(/[^\d.-]/g, '');
      return parseFloat(cleanTarget) || 0;
    }
    return parseFloat(target) || 0;
  }
  
  animateCounter(element, target) {
    const start = 0;
    const increment = target / (this.options.duration / 16); // 60fps
    let current = start;
    
    // Adicionar classe de contagem ativa
    element.classList.add('counter-counting');
    
    const timer = setInterval(() => {
      current += increment;
      
      if (current >= target) {
        current = target;
        clearInterval(timer);
        element.classList.remove('counter-counting');
        element.classList.add('counter-complete');
      }
      
      // Formatar o número baseado no tipo
      this.updateElementText(element, current, target);
    }, 16);
  }
  
  updateElementText(element, current, target) {
    const isPercentage = element.hasAttribute('data-counter-percentage');
    const hasSuffix = element.getAttribute('data-counter-suffix');
    const hasPrefix = element.getAttribute('data-counter-prefix');
    
    let displayValue = Math.floor(current);
    
    // Adicionar prefixo se especificado
    if (hasPrefix) {
      displayValue = hasPrefix + displayValue;
    }
    
    // Adicionar sufixo se especificado
    if (hasSuffix) {
      displayValue = displayValue + hasSuffix;
    } else if (isPercentage) {
      displayValue = displayValue + '%';
    }
    
    element.textContent = displayValue;
  }
  
  // Método para animar contadores manualmente
  static animate(element, target, options = {}) {
    const instance = new CounterAnimation(options);
    instance.animateCounter(element, target);
  }
  
  // Método para destruir todas as instâncias
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Inicializar automaticamente quando o script for carregado
const counterAnimation = new CounterAnimation();

// Exportar para uso global
window.CounterAnimation = CounterAnimation;
window.counterAnimation = counterAnimation;
