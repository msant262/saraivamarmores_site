// Navegação mobile
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav__toggle');
if (toggle) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Ano no rodapé
const anoEl = document.getElementById('ano');
if (anoEl) {
  anoEl.textContent = new Date().getFullYear();
}

// Validação simples do formulário (client-side apenas visual)
const form = document.querySelector('.form');
if (form) {
  form.addEventListener('submit', () => {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    inputs.forEach((el) => {
      if (!el.value.trim()) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    // Aqui poderíamos integrar com um backend, FormSubmit, etc.
  });
}

// Carousel básico
(() => {
  const track = document.querySelector('.carousel__track');
  if (!track) return;
  const slides = Array.from(track.children);
  const prevBtn = document.querySelector('.carousel__control.prev');
  const nextBtn = document.querySelector('.carousel__control.next');
  const dotsContainer = document.querySelector('.carousel__dots');
  let index = 0;

  // Dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel__dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.setAttribute('aria-selected', String(i === index)));
  }
  function goTo(i) { index = (i + slides.length) % slides.length; update(); }

  prevBtn?.addEventListener('click', () => goTo(index - 1));
  nextBtn?.addEventListener('click', () => goTo(index + 1));

  // Auto play
  let timer = setInterval(() => goTo(index + 1), 6000);
  [prevBtn, nextBtn, track, dotsContainer].forEach(el => {
    el?.addEventListener('mouseenter', () => clearInterval(timer));
    el?.addEventListener('mouseleave', () => timer = setInterval(() => goTo(index + 1), 6000));
  });

  update();
})();

// Partículas simples na hero (canvas)
(() => {
  const canvas = document.querySelector('.hero__particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, particles;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    particles = Array.from({ length: Math.round((width * height) / 18000) + 50 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(153,102,204,0.9)';
    ctx.strokeStyle = 'rgba(153,102,204,0.35)';
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    // linhas próximas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 12000) {
          ctx.globalAlpha = Math.max(0.05, 1 - d2 / 12000);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  resize();
  step();
})();

// FAQ acordeão
document.querySelectorAll('.faq__item').forEach((item) => {
  const btn = item.querySelector('.faq__question');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });
});

// Bottom navigation (Material 3)
document.querySelectorAll('.bottom-bar__action').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-target');
    if (!target) return;
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Estado ativo da navegação ao rolar
const sections = document.querySelectorAll('main section[id]');
const bottomActions = document.querySelectorAll('.bottom-bar__action');
const navLinks = document.querySelectorAll('.nav__list a');
const navIndicator = document.querySelector('.nav__indicator');

function updateNavIndicator(activeLink) {
  if (!navIndicator || !activeLink) return;
  const listRect = activeLink.closest('.nav__list').getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();
  const left = linkRect.left - listRect.left + 6; // pequeno padding
  const width = linkRect.width - 12;
  navIndicator.style.transform = `translateX(${left}px)`;
  navIndicator.style.width = `${Math.max(24, width)}px`;
  navIndicator.style.opacity = '1';
}

const setActive = (id) => {
  bottomActions.forEach((b) => b.removeAttribute('aria-current'));
  document.querySelector(`.bottom-bar__action[data-target="#${id}"]`)?.setAttribute('aria-current', 'page');
  navLinks.forEach((a) => {
    const isActive = a.getAttribute('href') === `#${id}`;
    a.classList.toggle('active', isActive);
    if (isActive) updateNavIndicator(a);
  });
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      if (id) setActive(id);
    }
  });
}, { rootMargin: '0px 0px -60% 0px', threshold: 0.2 });

sections.forEach((s) => observer.observe(s));

// Ajusta o indicador no load/resize/open menu
window.addEventListener('load', () => {
  const current = document.querySelector('.nav__list a.active') || document.querySelector('.nav__list a[href="#sobre"]');
  if (current) updateNavIndicator(current);
});
window.addEventListener('resize', () => {
  const current = document.querySelector('.nav__list a.active');
  if (current) updateNavIndicator(current);
});
toggle?.addEventListener('click', () => {
  setTimeout(() => {
    const current = document.querySelector('.nav__list a.active');
    if (current) updateNavIndicator(current);
  }, 50);
});

// Posiciona itens na timeline ondulada ao longo do path (SVG) com escala responsiva
(() => {
  const svg = document.querySelector('.tw-svg');
  const path = document.getElementById('tw-path');
  if (!svg || !path) return;
  const items = document.querySelectorAll('.tw-item');

  const positionItems = () => {
    const vb = svg.viewBox.baseVal || { width: svg.clientWidth, height: svg.clientHeight };
    const scaleX = svg.clientWidth / vb.width;
    const scaleY = svg.clientHeight / vb.height;
    const length = path.getTotalLength();
    const offsetY = parseFloat(getComputedStyle(svg).top || '0');
    items.forEach((el) => {
      const p = parseFloat(el.getAttribute('data-p') || '0');
      const pt = path.getPointAtLength(length * p);
      const x = pt.x * scaleX;
      const y = pt.y * scaleY + (isNaN(offsetY) ? 0 : offsetY);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    });
  };

  const resizeObserver = new ResizeObserver(positionItems);
  resizeObserver.observe(svg);
  window.addEventListener('resize', positionItems);
  positionItems();
})();

// Posiciona itens do processo ao longo do path (SVG) - suporta vertical e escala responsiva
(() => {
  const svg = document.querySelector('.pf-svg');
  const path = document.getElementById('pf-path');
  if (!svg || !path) return;
  const items = document.querySelectorAll('.pf-item');

  const positionItems = () => {
    const vb = svg.viewBox.baseVal || { width: svg.clientWidth, height: svg.clientHeight };
    const scaleX = svg.clientWidth / vb.width;
    const scaleY = svg.clientHeight / vb.height;
    const length = path.getTotalLength();
    items.forEach((el) => {
      const p = parseFloat(el.getAttribute('data-p') || '0');
      const pt = path.getPointAtLength(length * p);
      // Converte coordenadas do SVG para pixels do container
      const x = pt.x * scaleX;
      const y = pt.y * scaleY;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      const card = el.querySelector('.pf-card');
      if (card) {
        card.style.top = '0px';
        card.style.transform = 'translateY(-50%)';
        if (el.classList.contains('side-right')) {
          card.style.left = '48px'; card.style.right = 'auto';
        } else { card.style.right = '48px'; card.style.left = 'auto'; }
      }
    });
  };

  const resizeObserver = new ResizeObserver(positionItems);
  resizeObserver.observe(svg);
  window.addEventListener('resize', positionItems);
  positionItems();
})();

// Troca de imagem 01 -> 02 nas tiles ao passar o mouse (hover) e volta ao sair
(() => {
  const imgs = document.querySelectorAll('.tile img');
  if (!imgs.length) return;
  imgs.forEach((img) => {
    const src01 = img.getAttribute('src');
    const has01 = /_01(\.[a-zA-Z0-9]+)$/i.test(src01);
    const src02 = has01 ? src01.replace(/_01(\.[a-zA-Z0-9]+)$/i, '_02$1') : src01;
    img.dataset.src01 = src01;
    img.dataset.src02 = src02;
    if (has01) {
      const preload = new Image();
      preload.onload = () => { /* ok, mantém */ };
      preload.onerror = () => { img.dataset.src02 = img.dataset.src01; };
      preload.src = src02;
    }

    const to02 = () => {
      if (has01 && img.dataset.src02 !== img.dataset.src01) img.src = img.dataset.src02;
    };
    const to01 = () => { img.src = img.dataset.src01; };

    img.closest('.tile')?.addEventListener('mouseenter', to02);
    img.closest('.tile')?.addEventListener('mouseleave', to01);
    img.closest('.tile')?.addEventListener('focusin', to02);
    img.closest('.tile')?.addEventListener('focusout', to01);
    img.closest('.tile')?.setAttribute('tabindex', '0');
  });
})();

// Modal de soluções (detalhes) — rico com imagem
const solutionDetails = {
  pias: {
    title: 'Pias',
    image: './assets/img/pia_01.jpg',
    html: '<p>Pias em mármore ou granito com acabamentos variados para cozinhas, banheiros e áreas de apoio.</p><ul><li>Opções de bordas e espessuras</li><li>Tratamentos de impermeabilização</li><li>Indicação conforme uso do ambiente</li></ul>'
  },
  balcoes: {
    title: 'Balcões',
    image: './assets/img/balcao_01.jpg',
    html: '<p>Balcões sob medida que unem resistência e elegância, ideais para cozinhas, áreas gourmet e espaços comerciais.</p><ul><li>Planejamento de recortes e apoios</li><li>Acabamentos polido/escovado</li><li>Integração com cuba e equipamentos</li></ul>'
  },
  cubas: {
    title: 'Cubas esculpidas',
    image: './assets/img/cuba_01.jpg',
    html: '<p>Execução artesanal com quedas d’água precisas, ralo oculto e encaixes perfeitos. Destaque para lavabos e banheiros.</p><ul><li>Acabamentos: polido, escovado, levigado</li><li>Materiais: mármore, quartzito, granito</li><li>Prazo médio: 7–12 dias úteis</li></ul>'
  },
  escadas: {
    title: 'Escadas',
    image: './assets/img/escada_01.jpg',
    html: '<p>Escadas em pedra com alta durabilidade e estética atemporal, em estilos vazados, com espelho ou flutuantes.</p><ul><li>Execução com gabarito e antiderrapantes</li><li>Detalhes de borda e iluminação</li><li>Instalação técnica especializada</li></ul>'
  },
  lavatorios: {
    title: 'Lavatórios',
    image: './assets/img/lavatorio_01.jpg',
    html: '<p>Lavatórios personalizados, soluções para lavabos compactos ou banheiros master, com cubas de apoio ou esculpidas.</p><ul><li>Otimização de espaço</li><li>Opções de frontão e saia</li><li>Acabamentos de alto padrão</li></ul>'
  },
  mesa: {
    title: 'Mesa',
    image: './assets/img/mesa_01.jpg',
    html: '<p>Mesas em pedra para cozinhas, salas e áreas externas: resistência, facilidade de manutenção e sofisticação.</p><ul><li>Diversas espessuras e bordas</li><li>Opção de pé em pedra ou metal</li><li>Proteção para uso diário</li></ul>'
  },
  gourmet: { 
    title: 'Área Gourmet', 
    image: './assets/img/gourmet_01.jpg', 
    html: `
      <p>Projetamos bancadas e painéis para suportar <strong>calor, gordura e uso intenso</strong>, sem abrir mão da estética.</p>
      <ul>
        <li><strong>Materiais indicados:</strong> granitos escuros, quartzito de alta resistência</li>
        <li><strong>Detalhes recomendados:</strong> frontão alto, protetor térmico próximo à churrasqueira, quedas d’água, rodabanca</li>
        <li><strong>Extras:</strong> recortes para grelhas/queimadores, nichos e apoio para utensílios</li>
      </ul>` 
  },
  banheiro: { 
    title: 'Banheiro', 
    image: './assets/img/banheiro_01.jpg', 
    html: `
      <p>Soluções que unem <strong>praticidade de limpeza</strong> e sofisticação. Ideal para tampos, nichos e cubas esculpidas.</p>
      <ul>
        <li><strong>Materiais indicados:</strong> mármore com impermeabilização, quartzito</li>
        <li><strong>Opções:</strong> cuba esculpida com ralo oculto, saias finas (slim) ou robustas, rodabanca integrado</li>
        <li><strong>Cuidados:</strong> evitar produtos ácidos; limpeza com detergente neutro</li>
      </ul>` 
  },
  cozinha: { 
    title: 'Cozinha', 
    image: './assets/img/cozinha_01.jpg', 
    html: `
      <p>Bancadas pensadas para <strong>alto desempenho diário</strong>, com resistência a manchas e riscos.</p>
      <ul>
        <li><strong>Materiais indicados:</strong> granitos (alto desempenho térmico/químico)</li>
        <li><strong>Detalhes:</strong> área molhada rebaixada, escorredor usinado, cantos arredondados para segurança</li>
        <li><strong>Integrações:</strong> cooktop, cuba e lixeira embutida, tomadas e acessórios</li>
      </ul>` 
  },
  lavanderia: { 
    title: 'Lavanderia', 
    image: './assets/img/lavanderia_01.jpg', 
    html: `
      <p>Funcionalidade e durabilidade para um ambiente exposto a <strong>água e produtos químicos</strong>.</p>
      <ul>
        <li><strong>Materiais indicados:</strong> granitos claros/escovados</li>
        <li><strong>Soluções:</strong> tanque em pedra, área de esfregar usinada, bordas de contenção</li>
        <li><strong>Cuidados:</strong> manutenção simples com detergente neutro; evitar solventes agressivos</li>
      </ul>` 
  },
  externa: { 
    title: 'Área Externa', 
    image: './assets/img/externa_01.jpg', 
    html: `
      <p>Projetos para sol e chuva, com <strong>acabamentos antiderrapantes</strong> e alta resistência mecânica.</p>
      <ul>
        <li><strong>Materiais indicados:</strong> quartzito, granitos flameados/escovados</li>
        <li><strong>Aplicações:</strong> bancadas, decks, revestimentos e bordas de piscina</li>
        <li><strong>Drenagem:</strong> caimento e rodabanca para evitar acúmulo de água</li>
      </ul>` 
  },
  sala: { 
    title: 'Sala de Estar', 
    image: './assets/img/estar_01.jpg', 
    html: `
      <p>Elementos em pedra que trazem <strong>sofisticação e permanência</strong> ao espaço social.</p>
      <ul>
        <li><strong>Peças:</strong> mesas, aparadores, painéis e lareiras em pedra natural ou tecnológica</li>
        <li><strong>Composição:</strong> veios contínuos, peças únicas (bookmatch) e iluminação de destaque</li>
        <li><strong>Acabamentos:</strong> polido para brilho marcante ou escovado para toque acetinado</li>
      </ul>` 
  }
};

const solutionModal = document.getElementById('modal-solution');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalImage = document.getElementById('modal-image');

document.querySelectorAll('[data-solution]').forEach((card) => {
  card.addEventListener('click', () => {
    const key = card.getAttribute('data-solution');
    const data = solutionDetails[key];
    if (!data) return;
    modalTitle.textContent = data.title;
    modalBody.innerHTML = data.html;
    if (data.image) { modalImage.src = data.image; modalImage.alt = data.title; } else { modalImage.removeAttribute('src'); }
    solutionModal.showModal();
  });
});

// Abre modal ao clicar nas tiles de soluções/ambientes (quando mapeadas)
document.querySelectorAll('.tile[data-solution]').forEach((tile) => {
  tile.addEventListener('click', () => {
    const key = tile.getAttribute('data-solution');
    const d = solutionDetails[key];
    if (!d) return;
    modalTitle.textContent = d.title;
    modalBody.innerHTML = d.html;
    if (d.image) { modalImage.src = d.image; modalImage.alt = d.title; } else { modalImage.removeAttribute('src'); }
    solutionModal.showModal();
  });
});

// Abre modal para itens da Parte 2 (Ambientes)
document.querySelectorAll('.tile[data-ambient]').forEach((tile) => {
  tile.addEventListener('click', () => {
    const key = tile.getAttribute('data-ambient');
    const d = solutionDetails[key];
    if (!d) return;
    modalTitle.textContent = d.title;
    modalBody.innerHTML = d.html;
    if (d.image) { modalImage.src = d.image; modalImage.alt = d.title; } else { modalImage.removeAttribute('src'); }
    solutionModal.showModal();
  });
});

// Carrossel de materiais (4 por vez)
(() => {
  const track = document.querySelector('.materials__track');
  if (!track) return;
  const prev = document.querySelector('.materials__control.prev');
  const next = document.querySelector('.materials__control.next');
  let index = 0;

  function update() {
    track.style.transform = `translateX(-${index * 25}%)`;
  }
  function countSlides() { return track.children.length; }
  function maxIndex() { return Math.max(0, countSlides() - 4); }

  prev?.addEventListener('click', () => { index = Math.max(0, index - 1); update(); });
  next?.addEventListener('click', () => { index = Math.min(maxIndex(), index + 1); update(); });

  // Lightbox para materiais
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-image');
  const lbTitle = document.getElementById('lightbox-title');
  const lbContent = document.getElementById('lightbox-content');

  const materialInfo = {
    marmores: { title: 'Mármores', text: '<p>Pedra natural com veios e variações únicas, muito valorizada em lavabos, tampos e revestimentos internos.</p><p>Cuidados: evitar produtos ácidos; manutenção com detergente neutro.</p>' },
    granito: { title: 'Granito', text: '<p>Alta resistência a riscos e calor. Excelente opção para cozinhas e áreas de alto tráfego.</p>' },
    quartzito: { title: 'Quartzito', text: '<p>Combina beleza do mármore com resistência superior. Ótimo para bancadas e áreas gourmet.</p>' },
    ultracompactas: { title: 'Ultracompactas', text: '<p>Tecnologia de alta densidade, pouca porosidade e grande estabilidade de cor. Ideal para áreas externas e cozinhas.</p>' },
    onyx: { title: 'Onyx', text: '<p>Translúcido e sofisticado, excelente para painéis iluminados e detalhes de destaque.</p>' }
  };

  document.querySelectorAll('#materiais .tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      const key = tile.getAttribute('data-material');
      const img = tile.querySelector('img');
      const info = materialInfo[key];
      if (!img || !info) return; // se não mapear, não quebra
      lbImg.src = img.dataset.src01 || img.src; // garante exibir *_01 no modal
      lbImg.alt = img.alt;
      lbTitle.textContent = info.title;
      lbContent.innerHTML = info.text || '';
      lightbox.showModal();
    });
  });

  update();
})();

// Lightbox para projetos (reutiliza mesmo lightbox)
document.querySelectorAll('.carousel__slide .carousel__image').forEach((el) => {
  el.addEventListener('click', () => {
    const imgStyle = getComputedStyle(el).backgroundImage;
    const urlMatch = imgStyle.match(/url\("?(.*?)"?\)/);
    const url = urlMatch ? urlMatch[1] : '';
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-image');
    const lbTitle = document.getElementById('lightbox-title');
    const lbContent = document.getElementById('lightbox-content');
    lbImg.src = url;
    lbImg.alt = 'Projeto';
    lbTitle.textContent = 'Projeto';
    lbContent.innerHTML = '<p>Detalhes do projeto: materiais, ambientes e acabamentos utilizados.</p>';
    lightbox.showModal();
  });
});


// Materiais (modo tiles) – usando o mesmo modal de Soluções
(() => {
  const tiles = document.querySelectorAll('#materiais .tile');
  if (!tiles.length) return;

  const materialDetails = {
    marmores: {
      title: 'Mármores',
      text: `
        <p>Clássico e atemporal. Os mármores trazem veios marcantes e uma elegância natural, perfeitos para lavabos, painéis e áreas sociais internas.</p>
        <ul>
          <li><strong>Ideal para:</strong> lavabos, tampos, painéis e revestimentos internos</li>
          <li><strong>Destaques:</strong> variedade de veios e cores, sensação de sofisticação</li>
          <li><strong>Cuidados:</strong> evitar produtos ácidos; limpeza com detergente neutro</li>
        </ul>`
    },
    granito: {
      title: 'Granito',
      text: `
        <p>Resistência e praticidade. O granito suporta alto tráfego, riscos e calor, sendo excelente para cozinhas e áreas de serviço.</p>
        <ul>
          <li><strong>Ideal para:</strong> bancadas de cozinha e áreas externas</li>
          <li><strong>Destaques:</strong> durabilidade, manutenção simples</li>
          <li><strong>Acabamentos:</strong> polido, escovado ou flameado</li>
        </ul>`
    },
    quartzito: {
      title: 'Quartzito',
      text: `
        <p>A beleza do mármore com resistência superior. O quartzito une veios sofisticados e excelente performance.</p>
        <ul>
          <li><strong>Ideal para:</strong> bancadas gourmet, ilhas e tampos de banheiro</li>
          <li><strong>Destaques:</strong> baixa porosidade, alta resistência mecânica</li>
          <li><strong>Indicação:</strong> ambientes internos e externos cobertos</li>
        </ul>`
    },
    ultracompactas: {
      title: 'Ultracompactas',
      text: `
        <p>Superfícies tecnológicas de alta densidade, baixa porosidade e grande estabilidade de cor.</p>
        <ul>
          <li><strong>Ideal para:</strong> áreas externas, cozinhas e fachadas</li>
          <li><strong>Destaques:</strong> resistente a UV, calor e manchas</li>
          <li><strong>Manutenção:</strong> limpeza fácil, alta durabilidade</li>
        </ul>`
    },
    onyx: {
      title: 'Onyx',
      text: `
        <p>Protagonista absoluto. O onyx possui translucidez que permite iluminação traseira e resultados cênicos.</p>
        <ul>
          <li><strong>Ideal para:</strong> painéis iluminados, tampos e detalhes decorativos</li>
          <li><strong>Destaques:</strong> efeito translúcido, desenho único</li>
          <li><strong>Indicação:</strong> áreas internas com menor tráfego</li>
        </ul>`
    }
  };

  tiles.forEach((tile) => {
    tile.addEventListener('click', () => {
      const key = tile.getAttribute('data-material');
      const info = materialDetails[key];
      const img = tile.querySelector('img');
      if (!info || !img) return;
      // Usa o mesmo modal de Soluções
      const solutionModal = document.getElementById('modal-solution');
      const modalTitle = document.getElementById('modal-title');
      const modalBody = document.getElementById('modal-body');
      const modalImage = document.getElementById('modal-image');

      modalTitle.textContent = info.title;
      modalBody.innerHTML = info.text || '';
      if (modalImage) { modalImage.src = img.src; modalImage.alt = img.alt || info.title; }
      solutionModal.showModal();
    });
  });
})();



