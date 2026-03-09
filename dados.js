// --- 1. CONFIGURAÇÕES DO JOGO ---
export const qtdCategorias = 3; 
export const minPalavras = 3; 
export const maxPalavras = 5; 
// Aumentei a margem de erro, pois agrupar cartas exige mais movimentos estratégicos
export const margemDeErro = 15; 
export const numeroDeColunas = 4; 

// --- 2. BANCO DE DADOS ---
export const bancoDePalavras = [
    { categoria: "Pólis", palavras: ["Atenas", "Esparta", "Corinto", "Tebas", "Mégara"] },
    { categoria: "Líderes", palavras: ["Péricles", "Alcibíades", "Lisandro", "Nícias", "Brasídas"] },
    { categoria: "Táticas", palavras: ["Hoplita", "Trirreme", "Falange", "Cerco", "Muros"] },
    { categoria: "Ligas", palavras: ["Delos", "Peloponeso", "Nícias"] },
    { categoria: "Geografia", palavras: ["Ática", "Lacônia", "Sicília", "Helesponto"] },
    { categoria: "Eventos", palavras: ["Peste", "Decreto", "Fome"] }
];