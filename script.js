document.addEventListener("DOMContentLoaded", () => {

  // =========================================================
  // 1. EFEITO DINÂMICO NA NAVBAR AO ROLAR A PÁGINA
  // =========================================================
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      navbar.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.05)";
      navbar.style.padding = "8px 0";
    } else {
      navbar.style.boxShadow = "none";
      navbar.style.padding = "14px 0";
    }
  });

  // =========================================================
  // 2. ANIMAÇÃO SCROLL REVEAL (SURGIMENTO GRADUAL DOS CARDS)
  // =========================================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-active");
        observer.unobserve(entry.target); // Anima apenas uma vez ao rolar
      }
    });
  }, observerOptions);

  const animatableElements = document.querySelectorAll(
    ".card-section, .info-box, .data-table, .reference-item"
  );
  
  animatableElements.forEach(el => {
    el.classList.add("reveal-init");
    revealObserver.observe(el);
  });

  // =========================================================
  // 3. EFEITO INTERATIVO TILT 3D NOS ELEMENTOS VISUAIS
  // =========================================================
  const cards = document.querySelectorAll(".info-box, .card-section:not(#simulacao)");
  
  cards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      card.style.transition = "transform 0.05s ease-out";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
      card.style.transition = "transform 0.4s ease-out";
    });
  });

  // =========================================================
  // 4. MECANISMO FÍSICO DO SIMULADOR DO PRISMA (CANVAS)
  // =========================================================
  const canvas = document.getElementById("prismCanvas");
  const ctx = canvas.getContext("2d");
  const slider = document.getElementById("angleSlider");
  const angleVal = document.getElementById("angleVal");

  let animationFrameId;
  let pulse = 0;

  // Geração de partículas de luz fluidas
  const particles = Array.from({ length: 30 }, () => ({
    progress: Math.random(),
    speed: 0.004 + Math.random() * 0.008,
    colorIndex: Math.floor(Math.random() * 6)
  }));

  function renderSimulation() {
    const angle = parseInt(slider.value);
    angleVal.textContent = `${angle}°`;

    pulse += 0.04;
    const glow = Math.sin(pulse) * 2 + 6; // Brilho pulsante suave

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Geometria e Coordenadas do Prisma Central
    const centerX = 360;
    const centerY = 190;
    const prismSize = 120;

    const p1 = { x: centerX, y: centerY - prismSize };
    const p2 = { x: centerX - prismSize, y: centerY + prismSize / 1.5 };
    const p3 = { x: centerX + prismSize, y: centerY + prismSize / 1.5 };

    // Cálculo dos pontos dinâmicos do feixe incidente com base no slider
    const startX = 40;
    const startY = 300 - (angle * 2.4);
    const hitX = centerX - 42;
    const hitY = centerY + 12;

    // Renderização do Feixe Incidente de Luz Branca
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(hitX, hitY);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;
    ctx.shadowBlur = glow + 2;
    ctx.shadowColor = "#FFFFFF";
    ctx.stroke();

    // Renderização do Prisma de Vidro Semi-Transparente
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 + Math.sin(pulse) * 0.05})`;
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Trajeto da luz interna refratada dentro do vidro
    const exitX = centerX + 38;
    const exitY = centerY - 6;

    ctx.beginPath();
    ctx.moveTo(hitX, hitY);
    ctx.lineTo(exitX, exitY);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Configuração Matemática e Física das Cores do Espectro Refratado
    const colors = [
      { hex: "#FF4D4D", offset: 35 }, // Vermelho (Menor desvio)
      { hex: "#FFA64D", offset: 23 }, // Laranja
      { hex: "#FFFF4D", offset: 11 }, // Amarelo
      { hex: "#4DFF4D", offset: -1 }, // Verde
      { hex: "#4D80FF", offset: -13 },// Azul
      { hex: "#B34DFF", offset: -25 } // Violeta (Maior desvio)
    ];

    colors.forEach((color, index) => {
      const endX = canvas.width - 40;
      const endY = exitY + color.offset + (angle - 45) * 0.8;

      // Renderização de cada raio espectral individual separado por frequência
      ctx.beginPath();
      ctx.moveTo(exitX, exitY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = color.hex;
      ctx.lineWidth = 3.5;
      ctx.shadowBlur = glow;
      ctx.shadowColor = color.hex;
      ctx.stroke();

      // Renderização e cálculo das partículas dinâmicas no espectro
      particles.forEach(p => {
        if (p.colorIndex === index) {
          p.progress += p.speed;
          if (p.progress > 1) p.progress = 0;

          const px = exitX + (endX - exitX) * p.progress;
          const py = exitY + (endY - exitY) * p.progress;

          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowBlur = 6;
          ctx.shadowColor = color.hex;
          ctx.fill();
        }
      });
    });

    ctx.shadowBlur = 0;
    animationFrameId = requestAnimationFrame(renderSimulation);
  }

  // Listener para o Controle Deslizante
  slider.addEventListener("input", () => {
    angleVal.textContent = `${slider.value}°`;
  });

  // Inicializa o laço gráfico da simulação
  renderSimulation();
});
