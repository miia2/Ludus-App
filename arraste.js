// arraste.js

import { gastarMovimento, atualizarDraggables, registrarAcerto } from './main.js';

// A carta que está voando pela tela vive apenas aqui agora
let cartaSendoArrastada = null;

// --- 7. ARRASTAR E SOLTAR (GERAL) ---
export function iniciarArrasto(e) {
    if (this.getAttribute('draggable') === 'false') return e.preventDefault();
    cartaSendoArrastada = this;
    setTimeout(() => this.classList.add('dragging'), 0);
}

export function finalizarArrasto() {
    this.classList.remove('dragging');
    cartaSendoArrastada = null;
}

// --- 8. MECÂNICA DE SOLTAR NO SLOT DE CATEGORIA ---
export function aoPassarPorCima(e) { e.preventDefault(); }
export function aoEntrarNoSlot(e) { e.preventDefault(); this.classList.add('hovered'); }
export function aoSairDoSlot() { this.classList.remove('hovered'); }

export function aoSoltarNoSlot(e) {
    e.stopPropagation(); 
    this.classList.remove('hovered');
    
    const categoriaDaCarta = cartaSendoArrastada.getAttribute('data-categoria');
    const categoriaDoSlot = this.getAttribute('data-categoria');

    if (categoriaDaCarta === categoriaDoSlot) {
        gastarMovimento(); 
        this.appendChild(cartaSendoArrastada);
        cartaSendoArrastada.classList.add('correct');
        cartaSendoArrastada.setAttribute('draggable', 'false');
        
        // CONTAGEM INTELIGENTE
        const numCartasNoGrupo = 1 + cartaSendoArrastada.querySelectorAll('.card').length;
        
        // Avisa o main.js que marcamos pontos!
        registrarAcerto(numCartasNoGrupo);
        
        atualizarDraggables(); 
    } else {
        cartaSendoArrastada.classList.add('wrong');
        setTimeout(() => cartaSendoArrastada.classList.remove('wrong'), 500);
    }
}

// --- 9. MECÂNICA DE AGRUPAR CARTAS ---
export function aoPassarPorCimaDaCarta(e) { e.preventDefault(); e.stopPropagation(); }

export function aoEntrarNaCarta(e) { 
    e.preventDefault(); e.stopPropagation();
    if (!this.classList.contains('back') && cartaSendoArrastada !== this) {
        this.classList.add('hovered-card'); 
    }
}

export function aoSairDaCarta(e) { e.stopPropagation(); this.classList.remove('hovered-card'); }

export function aoSoltarNaCarta(e) {
    e.stopPropagation(); 
    this.classList.remove('hovered-card');

    if (cartaSendoArrastada === this || this.classList.contains('back')) return;

    const categoriaDaCarta = cartaSendoArrastada.getAttribute('data-categoria');
    const categoriaAlvo = this.getAttribute('data-categoria');

    if (categoriaDaCarta === categoriaAlvo) {
        gastarMovimento(); 
        
        let alvoFinal = this;
        while (alvoFinal.querySelector('.nested-card')) {
            alvoFinal = alvoFinal.querySelector('.nested-card');
        }
        
        alvoFinal.appendChild(cartaSendoArrastada);
        cartaSendoArrastada.classList.add('nested-card');
        cartaSendoArrastada.setAttribute('draggable', 'false');
        atualizarDraggables(); 
    } else {
        cartaSendoArrastada.classList.add('wrong');
        setTimeout(() => cartaSendoArrastada.classList.remove('wrong'), 500);
    }
}

// --- LÓGICA DE ESPAÇOS VAZIOS NAS COLUNAS ---
export function aoPassarPorCimaDaColuna(e) { e.preventDefault(); }

export function aoEntrarNaColuna(e) {
    e.preventDefault();
    if (this.querySelectorAll('.card').length === 0) {
        this.classList.add('hovered-column');
    }
}

export function aoSairDaColuna(e) { this.classList.remove('hovered-column'); }

export function aoSoltarNaColuna(e) {
    this.classList.remove('hovered-column');
    if (this.querySelectorAll('.card').length > 0) return;
    gastarMovimento();
    this.appendChild(cartaSendoArrastada);
    atualizarDraggables();
}