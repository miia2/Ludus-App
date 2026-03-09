// ui.js

// Atualiza o placar recebendo o número atual de movimentos
export function atualizarPlacar(movimentosRestantes) {
    const placar = document.getElementById('placar-movimentos');
    const banner = document.querySelector('.moves-banner');
    placar.innerText = movimentosRestantes;
    
    if (movimentosRestantes <= 3) {
        banner.classList.add('danger');
    } else {
        banner.classList.remove('danger');
    }
}

// Atualiza o ícone do montinho recebendo o tamanho do array
export function atualizarVisorMontinho(tamanhoMontinho) {
    const montinhoBtn = document.getElementById('montinho-btn');
    if (tamanhoMontinho === 0) {
        montinhoBtn.classList.add('empty');
    } else {
        montinhoBtn.classList.remove('empty');
    }
}

// Funções do Menu Lateral
export function abrirMenu() {
    document.getElementById('menu-overlay').classList.add('ativo');
}

export function fecharMenu() {
    document.getElementById('menu-overlay').classList.remove('ativo');
}

// Funções das Regras
export function mostrarRegras() {
    fecharMenu(); 
    setTimeout(() => {
        document.getElementById('regras-overlay').classList.add('ativo');
    }, 300); 
}

export function fecharRegras() {
    document.getElementById('regras-overlay').classList.remove('ativo');
}

// Funções do Ranking
export function abrirRanking() {
    fecharMenu(); 
    setTimeout(() => {
        document.getElementById('ranking-overlay').classList.add('ativo');
    }, 300); 
}

export function fecharRanking() {
    document.getElementById('ranking-overlay').classList.remove('ativo');
}

export function renderizarRanking(dadosDoServidor) {
    const lista = document.getElementById('lista-ranking');
    lista.innerHTML = ''; // Limpa o texto de "Consultando..."

    if (dadosDoServidor.length === 0) {
        lista.innerHTML = '<li>Nenhum herói registrado ainda. Seja o primeiro!</li>';
        return;
    }

    // Pega cada jogador que veio do Python e cria uma linha na lista
    dadosDoServidor.forEach((jogador, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${index + 1}. ${jogador.nome}</span> <span class="movimentos-destaque">${jogador.movimentos} movs</span>`;
        lista.appendChild(li);
    });
}