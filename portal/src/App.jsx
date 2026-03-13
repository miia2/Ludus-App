import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 1. A Memória do Componente (useState)
  const [herois, setHerois] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // 2. A Ação ao Carregar a Tela (useEffect)
  useEffect(() => {
    // O nosso "garçom" vai lá no Python buscar o Top 10
    fetch('https://ludus-api.onrender.com/ranking')
      .then(resposta => resposta.json())
      .then(dados => {
        setHerois(dados); // Salva os dados na memória do React
        setCarregando(false); // Avisa que terminou de carregar
      })
      .catch(erro => {
        console.error("Erro ao buscar o ranking no Python:", erro);
        setCarregando(false);
      });
  }, []); // Essa lista vazia [] significa: "Faça isso apenas uma vez quando abrir a tela"

  // 3. O Visual (JSX)
  // 3. O Visual (JSX)
  return (
    <div className="portal-container">
      <h1>🏆 Mural dos Heróis</h1>
      <p>O ecossistema do Guerra Peloponesa</p>

      {/* CAIXA DO RANKING (Única) */}
      <div className="ranking-box">
        <h2>Top 10 Estrategistas</h2>

        {carregando ? (
          <p className="loading">Consultando o Oráculo (carregando...)</p>
        ) : herois.length === 0 ? (
          <p>Nenhum estrategista registrado ainda na base de dados.</p>
        ) : (
          <ul className="lista-react">
            {herois.map((heroi, index) => (
              <li key={index} className="item-heroi">
                <span><strong>{index + 1}.</strong> {heroi.nome}</span>
                <span className="destaque">{heroi.movimentos} movs</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* A PONTE DE VOLTA PARA O JOGO */}
      <div className="acoes-portal">
        <a href="https://miia2.github.io/Ludus-App/" className="btn-voltar">
          ⚔️ Voltar para a Batalha
        </a>
      </div>

    </div>
  );
}

export default App;
