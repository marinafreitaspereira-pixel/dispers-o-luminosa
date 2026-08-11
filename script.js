document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================
  // 1. EFEITO DE ROLAGEM NA NAVBAR (HEADER)
  // ==========================================
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      navbar.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.08)";
      navbar.style.padding = "10px 0";
    } else {
      navbar.style.boxShadow = "none";
      navbar.style.padding = "14px 0";
    }
  });

  // ==========================================
  // 2. ANIMAÇÃO DE SURGIMENTO AO ROLAR (SCROLL REVEAL)
  // ==========================================
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-active");
        observer.unobserve(entry.target); // Anima apenas uma vez
      }
    });
  }, observerOptions);

  // Mapeamento atualizado para incluir os novos elementos e as novas seções
  const animatableElements = document.querySelectorAll(
    ".card-section, .hero-content, .info-box, .data-table, .reference-item"
  );

  animatableElements.forEach(el => {
    el.classList.add("reveal-init");
    revealObserver.observe(el);
  });

  // ==========================================
  // 3. EFEITO INTERATIVO TILT 3D NOS CARDS
  // ==========================================
  const cards = document.querySelectorAll(".info-box, .card-section");

  cards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4; // grau de inclinação X
      const rotateY = ((x - centerX) / centerX) * 4;  // grau de inclinação Y

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      card.style.transition = "transform 0.1s ease-out";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
      card.style.transition = "transform 0.5s ease-out";
    });
  });

  // ==========================================
  // 4. SIMULADOR DO PRISMA COM PARTICULAS DE LUZ
  // ==========================================
  const canvas = document.getElementById("prismCanvas");
  const ctx = canvas.getContext("2d");
  const slider = document.getElementById("angleSlider");
  const angleVal = document.getElementById("angleVal");

  let animationFrameId;
  let pulse = 0; // Variável para pulsar a luz suavemente

  // Partículas para o efeito da luz
  const particles = Array.from({ length: 25 }, () => ({
    x: Math.random() * 200,
    progress: Math.random(),
    speed: 0.005 + Math.random() * 0.01,
    colorIndex: Math.floor(Math.random() * 6)
  }));

  function render() {
    const angle = parseInt(slider.value);
    angleVal.textContent = `${angle}°`;

    pulse += 0.03;
    const glow = Math.sin(pulse) * 3 + 8; // Efeito de brilho pulsante

    // Limpar o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Configurações do Prisma (Triângulo Central)
    const centerX = 360;
    const centerY = 210;
    const prismSize = 130;

    const p1 = { x: centerX, y: centerY - prismSize };
    const p2 = { x: centerX - prismSize, y: centerY + prismSize / 1.5 };
    const p3 = { x: centerX + prismSize, y: centerY + prismSize / 1.5 };

    // 1. Feixe de Luz Incidente (Luz Branca)
    const startX = 60;
    const startY = 320 - (angle * 2.6);
    const hitX = centerX - 45;
    const hitY = centerY + 10;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(hitX, hitY);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;
    ctx.shadowBlur = glow + 4;
    ctx.shadowColor = "#FFFFFF";
    ctx.stroke();

    // 2. Desenhar o Prisma de Vidro com Vidro Refratativo
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(pulse) * 0.1})`;
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // 3. Trajeto da luz dentro do Prisma
    const exitX = centerX + 40;
    const exitY = centerY - 5;

    ctx.beginPath();
    ctx.moveTo(hitX, hitY);
    ctx.lineTo(exitX, exitY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 4. Decomposição das Cores (Espectro)
    const colors = [
      { hex: "#FF4D4D", offset: 38 }, // Vermelho
      { hex: "#FFA64D", offset: 26 }, // Laranja
      { hex: "#FFFF4D", offset: 14 }, // Amarelo
      { hex: "#4DFF4D", offset: 2 },  // Verde
      { hex: "#4D80FF", offset: -10 },// Azul
      { hex: "#B34DFF", offset: -22 } // Violeta
    ];

    colors.forEach((color, index) => {
      const endX = canvas.width - 40;
      const endY = exitY + color.offset + (angle - 45) * 0.7;

      ctx.beginPath();
      ctx.moveTo(exitX, exitY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = color.hex;
      ctx.lineWidth = 3;
      ctx.shadowBlur = glow;
      ctx.shadowColor = color.hex;
      ctx.stroke();

      // Partículas viajando ao longo dos feixes refratados
      particles.forEach(p => {
        if (p.colorIndex === index) {
          p.progress += p.speed;
          if (p.progress > 1) p.progress = 0;

          const px = exitX + (endX - exitX) * p.progress;
          const py = exitY + (endY - exitY) * p.progress;

          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowBlur = 10;
          ctx.shadowColor = color.hex;
          ctx.fill();
        }
      });
    });

    ctx.shadowBlur = 0;

    // Loop contínuo de animação
    animationFrameId = requestAnimationFrame(render);
  }

  // Listener do Slider
  slider.addEventListener("input", () => {
    angleVal.textContent = `${slider.value}°`;
  });

  // Iniciar Animação do Canvas
  render();
});

