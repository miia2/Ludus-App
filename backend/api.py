from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3

# 1. Inicia o aplicativo
app = FastAPI(title="API Guerra Peloponesa")

# 2. Segurança (CORS) - Isso permite que o seu Front-End converse com o Back-End
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite acesso de qualquer site (Live Server ou GitHub Pages)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Configura o Banco de Dados (Cria um arquivo ranking.db)
conexao = sqlite3.connect("ranking.db", check_same_thread=False)
cursor = conexao.cursor()

# Cria a tabela de jogadores se ela ainda não existir
cursor.execute('''
    CREATE TABLE IF NOT EXISTS jogadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        movimentos INTEGER
    )
''')
conexao.commit()

# 4. Define o formato da informação que o jogo vai enviar
class Pontuacao(BaseModel):
    nome: str
    movimentos: int

# --- AS ROTAS (END-POINTS) ---

# ROTA 1: Salvar a pontuação (Quando o jogador ganha)
@app.post("/salvar")
def salvar_pontuacao(dados: Pontuacao):
    cursor.execute("INSERT INTO jogadores (nome, movimentos) VALUES (?, ?)", (dados.nome, dados.movimentos))
    conexao.commit()
    return {"mensagem": f"A vitória de {dados.nome} foi registrada!"}

# ROTA 2: Pegar o Top 10 (Para mostrar no painel do jogo)
@app.get("/ranking")
def obter_ranking():
    # Busca os 10 jogadores com MENOS movimentos (ordem crescente)
    cursor.execute("SELECT nome, movimentos FROM jogadores ORDER BY movimentos ASC LIMIT 10")
    resultados = cursor.fetchall()
    
    # Transforma o resultado do banco num formato fácil para o JavaScript ler
    ranking = [{"nome": linha[0], "movimentos": linha[1]} for linha in resultados]
    return ranking

# Inicia o servidor automaticamente se for executado direto
if __name__ == "__main__":
    import uvicorn
    import os
    porta = int(os.environ.get("PORT", 8000))
    uvicorn.run("api:app", host="0.0.0.0", port=porta)