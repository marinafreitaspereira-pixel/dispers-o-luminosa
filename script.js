document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // MOTOR DE ANIMAÇÃO DO SIMULADOR ÓPTICO (CANVAS 2D)
    // ----------------------------------------------------
    const canvas = document.getElementById("canvas-optica");
    const ctx = canvas.getContext("2d");
    
    // Controles da Interface
    const sliderAngulo = document.getElementById("slider-angulo");
    const valAngulo = document.getElementById("val-angulo");
    const selectMeio = document.getElementById("select-meio");
    const btnParticulas = document.getElementById("btn-comprimento");
    const btnReset = document.getElementById("btn-reset-lab");

    // Ajustar resolução interna do Canvas
    function redimensionarCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 400;
    }
    redimensionarCanvas();
    window.addEventListener("resize", redimensionarCanvas);

    // Parâmetros Físicos Iniciais
    let anguloIncidencia = 0;
    let indiceRefracaoBase = 1.52;
    let exibirPartculas = true;
    let tempoAnimacao = 0;

    // Definição Geométrica do Prisma (Triângulo Equilátero Centralizado)
    const prisma = {
        x: 0, y: 0, tamanho: 160,
        atualizar: function() {
            this.x = canvas.width / 2;
            this.y = canvas.height / 2 + 20;
        },
        getVertices: function() {
            return [
                { x: this.x, y: this.y - this.tamanho * 0.6 }, // Topo
                { x: this.x - this.tamanho * 0.7, y: this.y + this.tamanho * 0.5 }, // Esquerda inferior
                { x: this.x + this.tamanho * 0.7, y: this.y + this.tamanho * 0.5 }  // Direita inferior
            ];
        }
    };

    // Cores do Espectro Newtoniano e desvios específicos baseados no comprimento de onda
    const espectroCores = [
        { nome: "Vermelho", cor: "#ff3333", desvioFator: 0.96 },
        { nome: "Laranja",  cor: "#ff9933", desvioFator: 0.975 },
        { nome: "Amarelo",   cor: "#ffff33", desvioFator: 0.99 },
        { nome: "Verde",     cor: "#33cc33", desvioFator: 1.005 },
        { nome: "Azul",      cor: "#3399ff", desvioFator: 1.02 },
        { nome: "Anil",      cor: "#6600ff", desvioFator: 1.035 },
        { nome: "Violeta",   cor: "#9900cc", desvioFator: 1.05 }
    ];

    // Laço Principal de Renderização Gráfica (60 Frames por segundo)
    function renderizarLaboratorio() {
        tempoAnimacao += 0.05;
        prisma.atualizar();
        
        // 1. Limpar Tela com tom preto espacial profundo
        ctx.fillStyle = "#050506";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Desenhar uma grade milimétrica sutil ao fundo (Visual de Laboratório)
        ctx.strokeStyle = "rgba(255,255,255,0.02)";
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 30) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }

        const vertices = prisma.getVertices();

        // 2. Desenhar o Prisma de Vidro/Cristal com efeito de brilho interno
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        ctx.lineTo(vertices[1].x, vertices[1].y);
        ctx.lineTo(vertices[2].x, vertices[2].y);
        ctx.closePath();
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        ctx.fill();
        ctx.strokeStyle = "rgba(212, 175, 55, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 3. Vetores de Cálculo Física da Luz
        // Origem do Laser
        const origemX = 40;
        const origemY = canvas.height / 2 + 30;
        
        // Ponto de Colisão na Face Esquerda do Prisma (Intersecção Estática Simplificada)
        const colisaoX = vertices[1].x + (vertices[0].x - vertices[1].x) * 0.45;
        const colisaoY = vertices[1].y + (vertices[0].y - vertices[1].y) * 0.45;

        // Modificar ponto de colisão dinamicamente baseado no controle angular
        const rad = (anguloIncidencia * Math.PI) / 180;
        const laserEntradaY = origemY + Math.sin(rad) * 120;

        // Desenha o Feixe Principal de Luz Branca (Policromática) de Entrada
        ctx.beginPath();
        ctx.moveTo(origemX, laserEntradaY);
        ctx.lineTo(colisaoX, colisaoY);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#fff";
        ctx.stroke();
        ctx.shadowBlur = 0; // Resetar efeito glow para não borrar o resto

        // Desenhar a Unidade Física Emissora (Caixa do Laser)
        ctx.fillStyle = "#1e1e24";
        ctx.fillRect(origemX - 20, laserEntradaY - 10, 20, 20);
        ctx.strokeStyle = "#d4af37";
        ctx.strokeRect(origemX - 20, laserEntradaY - 10, 20, 20);

        // 4. Renderização do Fenômeno da Dispersão (Múltiplos Raios Refratados)
        const faceSaidaX = vertices[0].x + (vertices[2].x - vertices[0].x) * 0.6;
        const faceSaidaY = vertices[0].y + (vertices[2].y - vertices[0].y) * 0.6;

        espectroCores.forEach((cromatica, index) => {
            // Cálculo do desvio personalizado baseado no material ativo (Lei de Snell Aplicada ao código)
            const n_especifico = indiceRefracaoBase * cromatica.desvioFator;
            const desvioInternoY = (colisaoY + (faceSaidaY - colisaoY) * 0.9) + (index * (indiceRefracaoBase * 1.5));
            
            // Trajeto Interno (Dentro do vidro - O leque começa a se abrir)
            ctx.beginPath();
            ctx.moveTo(colisaoX, colisaoY);
            ctx.lineTo(faceSaidaX, desvioInternoY);
            ctx.strokeStyle = cromatica.cor;
            ctx.lineWidth = 2.5;
            ctx.globalAlpha = 0.4;
            ctx.stroke();

            // Trajeto de Saída para o Meio Externo (Onde a dispersão se torna máxima e evidente)
            const anguloSaidaFator = 0.15 * (index - 3) * (indiceRefracaoBase * 0.8);
            const destinoFinalX = canvas.width;
            const destinoFinalY = desvioInternoY + (canvas.width - faceSaidaX) * (0.1 + anguloSaidaFator + (rad * 0.3));

            ctx.beginPath();
            ctx.moveTo(faceSaidaX, desvioInternoY);
            ctx.lineTo(destinoFinalX, destinoFinalY);
            ctx.globalAlpha = 0.85;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 8;
            ctx.shadowColor = cromatica.cor;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Animação Opcional de Fótons Fluindo (Partículas)
            if (exibirPartculas) {
                let avanco = (tempoAnimacao + (index * 0.4)) % 1;
                let partX = faceSaidaX + (destinoFinalX - faceSaidaX) * avanco;
                let partY = desvioInternoY + (destinoFinalY - desvioInternoY) * avanco;
                
                ctx.beginPath();
                ctx.arc(partX, partY, 4, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff";
                ctx.globalAlpha = 1;
                ctx.fill();
            }
        });

        ctx.globalAlpha = 1.0; // Resetar opacidades padrão
        requestAnimationFrame(renderizarLaboratorio);
    }

    // ----------------------------------------------------
    // ESCUTADORES DE EVENTO INTERATIVOS
    // ----------------------------------------------------
    sliderAngulo.addEventListener("input", (e) => {
        anguloIncidencia = parseInt(e.target.value);
        valAngulo.textContent = `${anguloIncidencia}°`;
    });

    selectMeio.addEventListener("change", (e) => {
        indiceRefracaoBase = parseFloat(e.target.value);
    });

    btnParticulas.addEventListener("click", () => {
        exibirPartculas = !exibirPartculas;
    });

    btnReset.addEventListener("click", () => {
        sliderAngulo.value = 0;
        anguloIncidencia = 0;
        valAngulo.textContent = "0°";
        selectMeio.value = "1.52";
        indiceRefracaoBase = 1.52;
        exibirPartculas = true;
    });

    // Iniciar loop automático
    renderizarLaboratorio();

    // ----------------------------------------------------
    // REVELAÇÃO PROGRESSIVA (REMAINTING SCROLL ANIMATION)
    // ----------------------------------------------------
    const elementosParaAnimar = document.querySelectorAll('.animar-subir');
    const observadorScroll = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('visivel');
            }
        });
    }, { threshold: 0.12 });

    elementosParaAnimar.forEach(el => observadorScroll.observe(el));
});
