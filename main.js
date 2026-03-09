// main.js

import { 
    qtdCategorias, minPalavras, maxPalavras, 
    margemDeErro, numeroDeColunas, bancoDePalavras 
} from './dados.js';

import { 
    atualizarPlacar, atualizarVisorMontinho, 
    abrirMenu, fecharMenu, mostrarRegras, fecharRegras,
    abrirRanking, fecharRanking, renderizarRanking // AS TRÊS NOVAS AQUI
} from './ui.js';

import { 
    iniciarArrasto, finalizarArrasto,
    aoPassarPorCima, aoEntrarNoSlot, aoSairDoSlot, aoSoltarNoSlot,
    aoPassarPorCimaDaCarta, aoEntrarNaCarta, aoSairDaCarta, aoSoltarNaCarta,
    aoPassarPorCimaDaColuna, aoEntrarNaColuna, aoSairDaColuna, aoSoltarNaColuna 
} from './arraste.js';

// --- 3. VARIÁVEIS GLOBAIS ---
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
    atualizarPlacar(movimentosRestantes);
    atualizarVisorMontinho(montinho.length);

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
export function atualizarDraggables() {
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
export function comprarCarta() {
    if (montinho.length > 0 && movimentosRestantes > 0) {
        const novaCarta = montinho.pop(); 
        const cardDiv = criarElementoCarta(novaCarta);
        document.getElementById('waste-pile').appendChild(cardDiv);
        
        // CORREÇÃO: Passando o tamanho do montinho!
        atualizarVisorMontinho(montinho.length); 
        
        gastarMovimento(); 
        atualizarDraggables(); 
    }
}

export function gastarMovimento() {
    movimentosRestantes--;
    
    // CORREÇÃO: Passando a variável para a interface!
    atualizarPlacar(movimentosRestantes);

    if (movimentosRestantes <= 0 && cartasCorretas < totalCartasDaRodada) {
        setTimeout(() => {
            alert("Derrota! Seus movimentos acabaram.");
            iniciarFase(); 
        }, 300);
    }
}

export function registrarAcerto(numCartasNoGrupo) {
    cartasCorretas += numCartasNoGrupo;
    
    if (cartasCorretas === totalCartasDaRodada && movimentosRestantes >= 0) {
        setTimeout(async () => {
            // 1. Pergunta o nome do estrategista
            const nomeJogador = prompt("Vitória! Estratégia impecável. Digite seu nome para o Ranking:") || "Espartano Anônimo";
            
            // 2. Calcula quantos movimentos foram gastos (quanto menos, melhor no ranking!)
            const movimentosGastos = (totalCartasDaRodada + margemDeErro) - movimentosRestantes;
            
            try {
                // 3. O Garçom (Fetch) enviando o pedido para o Python
                await fetch("http://127.0.0.1:8000/salvar", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nome: nomeJogador,
                        movimentos: movimentosGastos
                    })
                });
                
                alert("Sua pontuação foi salva no mural dos heróis!");
            } catch (erro) {
                console.error("Erro ao salvar no servidor:", erro);
                alert("Você venceu, mas o servidor está offline no momento.");
            }

            iniciarFase(); 
        }, 500);
    }
}

// O Garçom buscando o Top 10
async function buscarEmostrarRanking() {
    abrirRanking(); // Abre a tela imediatamente
    
    try {
        const resposta = await fetch("http://127.0.0.1:8000/ranking");
        const dados = await resposta.json(); // Transforma a resposta do Python em JavaScript
        
        renderizarRanking(dados); // Manda o ui.js desenhar a tela
    } catch (erro) {
        console.error("Erro ao buscar ranking:", erro);
        document.getElementById('lista-ranking').innerHTML = '<li>O Oráculo está offline. Tente novamente mais tarde.</li>';
    }
}

// --- LIGANDO OS BOTÕES DA INTERFACE ---

// Montinho (Comprar Carta)
document.getElementById('montinho-btn').addEventListener('click', comprarCarta);

// Menu Lateral
document.getElementById('btn-abrir-menu').addEventListener('click', abrirMenu);
document.getElementById('btn-fechar-menu').addEventListener('click', fecharMenu);
document.getElementById('menu-overlay').addEventListener('click', function(e) {
    if (e.target === this) fecharMenu();
});

// Quadro de Regras
document.getElementById('btn-fechar-regras').addEventListener('click', fecharRegras);
document.getElementById('btn-entendi-regras').addEventListener('click', fecharRegras);
document.getElementById('regras-overlay').addEventListener('click', function(e) {
    if (e.target === this) fecharRegras();
});

// Botões de dentro do Menu 
document.getElementById('btn-reiniciar').addEventListener('click', () => {
    fecharMenu();
    setTimeout(() => iniciarFase(), 300);
});
document.getElementById('btn-regras').addEventListener('click', mostrarRegras);

// OS FIOS NOVOS DO RANKING QUE FALTAVAM
document.getElementById('btn-ranking').addEventListener('click', buscarEmostrarRanking);
document.getElementById('btn-fechar-ranking').addEventListener('click', fecharRanking);
document.getElementById('ranking-overlay').addEventListener('click', function(e) {
    if (e.target === this) fecharRanking();
});

// Inicia o jogo!
iniciarFase();