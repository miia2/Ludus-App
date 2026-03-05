// --- 1. CONFIGURAÇÕES DO JOGO ---
const qtdCategorias = 3; 
const minPalavras = 3; 
const maxPalavras = 5; 
// Aumentei a margem de erro, pois agrupar cartas exige mais movimentos estratégicos
const margemDeErro = 15; 
const numeroDeColunas = 4; 

// --- 2. BANCO DE DADOS ---
const bancoDePalavras = [
    { categoria: "Pólis", palavras: ["Atenas", "Esparta", "Corinto", "Tebas", "Mégara"] },
    { categoria: "Líderes", palavras: ["Péricles", "Alcibíades", "Lisandro", "Nícias", "Brasídas"] },
    { categoria: "Táticas", palavras: ["Hoplita", "Trirreme", "Falange", "Cerco", "Muros"] },
    { categoria: "Ligas", palavras: ["Delos", "Peloponeso", "Nícias"] },
    { categoria: "Geografia", palavras: ["Ática", "Lacônia", "Sicília", "Helesponto"] },
    { categoria: "Eventos", palavras: ["Peste", "Decreto", "Fome"] }
];

// --- 3. VARIÁVEIS GLOBAIS ---
let cartaSendoArrastada = null;
let cartasCorretas = 0; 
let totalCartasDaRodada = 0; 
let movimentosRestantes = 0; 
let montinho = []; 

// --- 4. LÓGICA DE INICIALIZAÇÃO ---
function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function iniciarFase() {
    const slotsContainer = document.getElementById('slots-container');
    const tableauContainer = document.getElementById('tableau-container');
    const wastePile = document.getElementById('waste-pile');
    const montinhoBtn = document.getElementById('montinho-btn');

    slotsContainer.innerHTML = '';
    tableauContainer.innerHTML = '';
    wastePile.innerHTML = '';
    montinhoBtn.classList.remove('empty');

    cartasCorretas = 0; 
    totalCartasDaRodada = 0; 
    montinho = [];

    const categoriasEmbaralhadas = embaralhar([...bancoDePalavras]);
    const categoriasDaRodada = categoriasEmbaralhadas.slice(0, qtdCategorias); 
    
    let todasAsCartas = [];

    categoriasDaRodada.forEach(item => {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'slot';
        slotDiv.setAttribute('data-categoria', item.categoria); 
        slotDiv.innerHTML = `<div class="slot-title">${item.categoria}</div>`;
        
        slotDiv.addEventListener('dragover', aoPassarPorCima);
        slotDiv.addEventListener('dragenter', aoEntrarNoSlot);
        slotDiv.addEventListener('dragleave', aoSairDoSlot);
        slotDiv.addEventListener('drop', aoSoltarNoSlot);

        slotsContainer.appendChild(slotDiv);

        const limiteDaCategoria = item.palavras.length; 
        const maximoPermitido = Math.min(maxPalavras, limiteDaCategoria);
        const numPalavrasSorteado = Math.floor(Math.random() * (maximoPermitido - minPalavras + 1)) + minPalavras;

        totalCartasDaRodada += numPalavrasSorteado;

        const palavrasSelecionadas = embaralhar([...item.palavras]).slice(0, numPalavrasSorteado);
        palavrasSelecionadas.forEach(palavra => {
            todasAsCartas.push({ palavra: palavra, categoriaCorreta: item.categoria });
        });
    });

    todasAsCartas = embaralhar(todasAsCartas);

    const metade = Math.ceil(todasAsCartas.length / 2);
    const cartasParaMesa = todasAsCartas.slice(0, metade);
    montinho = todasAsCartas.slice(metade);

    movimentosRestantes = totalCartasDaRodada + margemDeErro;
    atualizarPlacar();
    atualizarVisorMontinho();

    for(let i=0; i < numeroDeColunas; i++) {
        const col = document.createElement('div');
        col.className = 'tableau-column';
        col.id = `col-${i}`;
        
        // NOVIDADE: Prepara a coluna para receber cartas quando estiver vazia
        col.addEventListener('dragover', aoPassarPorCimaDaColuna);
        col.addEventListener('dragenter', aoEntrarNaColuna);
        col.addEventListener('dragleave', aoSairDaColuna);
        col.addEventListener('drop', aoSoltarNaColuna);

        tableauContainer.appendChild(col);
    }

    cartasParaMesa.forEach((carta, index) => {
        const colIndex = index % numeroDeColunas;
        const col = document.getElementById(`col-${colIndex}`);
        const cardDiv = criarElementoCarta(carta);
        col.appendChild(cardDiv);
    });

    atualizarDraggables(); 
}

function criarElementoCarta(carta) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-categoria', carta.categoriaCorreta); 
    cardDiv.innerHTML = `<span>${carta.palavra}</span>`;
    
    // Eventos de INICIAR o arrasto
    cardDiv.addEventListener('dragstart', iniciarArrasto);
    cardDiv.addEventListener('dragend', finalizarArrasto);
    
    // NOVOS EVENTOS: Permite que a carta RECEBA outras cartas em cima dela
    cardDiv.addEventListener('dragover', aoPassarPorCimaDaCarta);
    cardDiv.addEventListener('dragenter', aoEntrarNaCarta);
    cardDiv.addEventListener('dragleave', aoSairDaCarta);
    cardDiv.addEventListener('drop', aoSoltarNaCarta);
    
    return cardDiv;
}

// --- 5. MECÂNICA DE PACIÊNCIA (SOLITAIRE) ---
function atualizarDraggables() {
    const colunas = document.querySelectorAll('.tableau-column');
    colunas.forEach(coluna => {
        // Agora o jogo puxa apenas a "carta mãe" da coluna, ignorando as aninhadas
        const cartasNaBase = Array.from(coluna.children).filter(el => el.classList.contains('card'));
        
        cartasNaBase.forEach(c => {
            c.setAttribute('draggable', 'false');
            c.classList.add('back'); 
        }); 
        
        if (cartasNaBase.length > 0) {
            const cartaTopo = cartasNaBase[cartasNaBase.length - 1];
            cartaTopo.setAttribute('draggable', 'true'); 
            cartaTopo.classList.remove('back'); 
        }
    });

    const wastePile = document.getElementById('waste-pile');
    const cartasWaste = Array.from(wastePile.children).filter(el => el.classList.contains('card'));
    
    cartasWaste.forEach((c, index) => {
        c.setAttribute('draggable', 'false');
        c.style.zIndex = index; 
    });
    
    if (cartasWaste.length > 0) {
        cartasWaste[cartasWaste.length - 1].setAttribute('draggable', 'true');
    }
}

// --- 6. CONTROLES DE JOGO ---
function comprarCarta() {
    if (montinho.length > 0 && movimentosRestantes > 0) {
        const novaCarta = montinho.pop(); 
        const cardDiv = criarElementoCarta(novaCarta);
        document.getElementById('waste-pile').appendChild(cardDiv);
        
        atualizarVisorMontinho();
        gastarMovimento(); 
        atualizarDraggables(); 
    }
}

function atualizarVisorMontinho() {
    const montinhoBtn = document.getElementById('montinho-btn');
    if (montinho.length === 0) {
        montinhoBtn.classList.add('empty');
    }
}

function atualizarPlacar() {
    const placar = document.getElementById('placar-movimentos');
    const banner = document.querySelector('.moves-banner');
    placar.innerText = movimentosRestantes;
    
    if (movimentosRestantes <= 3) {
        banner.classList.add('danger');
    } else {
        banner.classList.remove('danger');
    }
}

function gastarMovimento() {
    movimentosRestantes--;
    atualizarPlacar();

    if (movimentosRestantes <= 0 && cartasCorretas < totalCartasDaRodada) {
        setTimeout(() => {
            alert("Derrota! Seus movimentos acabaram.");
            iniciarFase(); 
        }, 300);
    }
}

// --- 7. ARRASTAR E SOLTAR (GERAL) ---
function iniciarArrasto(e) {
    if (this.getAttribute('draggable') === 'false') return e.preventDefault();
    cartaSendoArrastada = this;
    setTimeout(() => this.classList.add('dragging'), 0);
}

function finalizarArrasto() {
    this.classList.remove('dragging');
    cartaSendoArrastada = null;
}

// --- 8. MECÂNICA DE SOLTAR NO SLOT DE CATEGORIA ---
function aoPassarPorCima(e) { e.preventDefault(); }
function aoEntrarNoSlot(e) { e.preventDefault(); this.classList.add('hovered'); }
function aoSairDoSlot() { this.classList.remove('hovered'); }

function aoSoltarNoSlot(e) {
    e.stopPropagation(); // Impede interferências
    this.classList.remove('hovered');
    
    const categoriaDaCarta = cartaSendoArrastada.getAttribute('data-categoria');
    const categoriaDoSlot = this.getAttribute('data-categoria');

    if (categoriaDaCarta === categoriaDoSlot) {
        gastarMovimento(); 
        
        this.appendChild(cartaSendoArrastada);
        cartaSendoArrastada.classList.add('correct');
        cartaSendoArrastada.setAttribute('draggable', 'false');
        
        // CONTAGEM INTELIGENTE: Conta a carta principal e TODAS as grudadas nela
        const numCartasNoGrupo = 1 + cartaSendoArrastada.querySelectorAll('.card').length;
        cartasCorretas += numCartasNoGrupo;
        
        atualizarDraggables(); 
        
        if (cartasCorretas === totalCartasDaRodada && movimentosRestantes >= 0) {
            setTimeout(() => {
                alert("Vitória! Estratégia impecável.");
                iniciarFase(); 
            }, 500);
        }
    } else {
        cartaSendoArrastada.classList.add('wrong');
        setTimeout(() => cartaSendoArrastada.classList.remove('wrong'), 500);
    }
}

// --- 9. MECÂNICA DE AGRUPAR CARTAS (NOVIDADE) ---

function aoPassarPorCimaDaCarta(e) { 
    e.preventDefault(); 
    e.stopPropagation(); 
}

function aoEntrarNaCarta(e) { 
    e.preventDefault(); 
    e.stopPropagation();
    // A carta alvo só brilha se estiver virada pra cima e não for ela mesma
    if (!this.classList.contains('back') && cartaSendoArrastada !== this) {
        this.classList.add('hovered-card'); 
    }
}

function aoSairDaCarta(e) { 
    e.stopPropagation();
    // Esta é a função que você NÃO deve apagar! Ela tira o brilho:
    this.classList.remove('hovered-card'); 
}

function aoSoltarNaCarta(e) {
    e.stopPropagation(); 
    this.classList.remove('hovered-card');

    // Ignora se tentou agrupar nela mesma ou numa carta virada de costas
    if (cartaSendoArrastada === this || this.classList.contains('back')) return;

    const categoriaDaCarta = cartaSendoArrastada.getAttribute('data-categoria');
    const categoriaAlvo = this.getAttribute('data-categoria');

    if (categoriaDaCarta === categoriaAlvo) {
        // ACERTOU O AGRUPAMENTO
        gastarMovimento(); 
        
        // CORREÇÃO CRÍTICA: Procura o "fundo" do bolinho de cartas
        // Se a carta alvo já tiver cartas grudadas, ele desce até a última
        let alvoFinal = this;
        while (alvoFinal.querySelector('.nested-card')) {
            alvoFinal = alvoFinal.querySelector('.nested-card');
        }
        
        // Gruda a carta na base do bolinho (fazendo a escadinha para baixo)
        alvoFinal.appendChild(cartaSendoArrastada);
        cartaSendoArrastada.classList.add('nested-card');
        
        // Trava essa carta para que ela só se mova se o jogador arrastar a carta "mãe" do topo
        cartaSendoArrastada.setAttribute('draggable', 'false');
        
        atualizarDraggables(); 
    } else {
        // ERROU O AGRUPAMENTO
        cartaSendoArrastada.classList.add('wrong');
        setTimeout(() => cartaSendoArrastada.classList.remove('wrong'), 500);
    }
}

// --- LÓGICA DE ESPAÇOS VAZIOS NAS COLUNAS ---
function aoPassarPorCimaDaColuna(e) {
    e.preventDefault();
}

function aoEntrarNaColuna(e) {
    e.preventDefault();
    // Só acende o brilho se a coluna estiver totalmente VAZIA
    if (this.querySelectorAll('.card').length === 0) {
        this.classList.add('hovered-column');
    }
}

function aoSairDaColuna(e) {
    this.classList.remove('hovered-column');
}

function aoSoltarNaColuna(e) {
    this.classList.remove('hovered-column');

    // Se a coluna já tiver cartas, cancela! (A carta deve grudar na outra carta, não na coluna)
    if (this.querySelectorAll('.card').length > 0) return;

    gastarMovimento();

    // Adiciona a carta (ou o bolinho todo) no novo espaço vazio
    this.appendChild(cartaSendoArrastada);

    // Atualiza a mesa para revelar a carta que estava embaixo no lugar antigo!
    atualizarDraggables();
}

// --- 10. LÓGICA DO MENU LATERAL ---

// Seleciona os elementos do menu
const btnAbrirMenu = document.getElementById('btn-abrir-menu');
const btnFecharMenu = document.getElementById('btn-fechar-menu');
const menuOverlay = document.getElementById('menu-overlay');

// Eventos de clique para abrir e fechar
btnAbrirMenu.addEventListener('click', abrirMenu);
btnFecharMenu.addEventListener('click', fecharMenu);

// Fecha o menu se o jogador clicar na área escura (fora do painel)
menuOverlay.addEventListener('click', function(e) {
    if (e.target === this) fecharMenu();
});

function abrirMenu() {
    menuOverlay.classList.add('ativo');
}

function fecharMenu() {
    menuOverlay.classList.remove('ativo');
}

// Funções dos botões dentro do menu
function reiniciarPeloMenu() {
    fecharMenu();
    // Um pequeno atraso para a animação do menu fechar antes de reiniciar a tela
    setTimeout(() => {
        iniciarFase();
    }, 300);
}

// --- 11. LÓGICA DO QUADRO DE REGRAS ---
const regrasOverlay = document.getElementById('regras-overlay');
const btnFecharRegras = document.getElementById('btn-fechar-regras');

// Evento do "X" de fechar
btnFecharRegras.addEventListener('click', fecharRegras);

// Fecha o modal se o jogador clicar na área escura (fora da caixa)
regrasOverlay.addEventListener('click', function(e) {
    if (e.target === this) fecharRegras();
});

// A nova função que substitui o alert() feio
function mostrarRegras() {
    fecharMenu(); // Fecha o menu lateral primeiro
    
    // Aguarda o menu lateral sumir para fazer a janela de regras "pular" na tela
    setTimeout(() => {
        regrasOverlay.classList.add('ativo');
    }, 300); 
}

function fecharRegras() {
    regrasOverlay.classList.remove('ativo');
}

// Inicia o jogo!
iniciarFase();