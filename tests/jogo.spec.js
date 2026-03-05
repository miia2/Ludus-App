const { test, expect } = require('@playwright/test');

// --- Função Auxiliar Mágica (Atualizada) ---
// Agora ela recebe os "Locators" do Playwright em vez de textos
async function dragAndDropHtml5(sourceLocator, targetLocator) {
  // Pega os elementos reais na tela
  const sourceElement = await sourceLocator.elementHandle();
  const targetElement = await targetLocator.elementHandle();
  
  if (sourceElement && targetElement) {
    // Injeta os eventos de Drag and Drop diretamente nos elementos
    await sourceElement.evaluate((sourceNode, targetNode) => {
      const dataTransfer = new DataTransfer();
      sourceNode.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer }));
      targetNode.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer }));
      targetNode.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer }));
      targetNode.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }));
      sourceNode.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer }));
    }, targetElement);
  }
}

test.describe('Testes do Jogo Guerra Peloponesa', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('file:///C:/Users/T-Gamer/Desktop/M%C3%ADrian/T.I/Jogo/index.html');
    await page.getByTestId('btn-entendi-regras').click({ force: true });
    await page.waitForTimeout(300); 
  });

  // TESTE 1
  test('Deve iniciar o jogo com movimentos válidos', async ({ page }) => {
    const placar = page.getByTestId('placar-movimentos');
    const texto = await placar.textContent();
    expect(parseInt(texto, 10)).toBeGreaterThan(0);
  });

  // TESTE 2
  test('Deve descontar 1 movimento ao comprar carta', async ({ page }) => {
    const placar = page.getByTestId('placar-movimentos');
    const movimentosAntes = parseInt(await placar.textContent(), 10);
    
    await page.getByTestId('btn-comprar-carta').click({ force: true });
    
    const movimentosDepois = parseInt(await placar.textContent(), 10);
    expect(movimentosDepois).toBe(movimentosAntes - 1);
  });

  // TESTE 3
  test('Deve agrupar duas cartas da mesma categoria', async ({ page }) => {
    
    // 1. Tenta comprar até 5 cartas, checando se o montinho está vazio
    for (let i = 0; i < 5; i++) {
      const btnMontinho = page.getByTestId('btn-comprar-carta');
      const classesMontinho = await btnMontinho.getAttribute('class');
      
      if (!classesMontinho.includes('empty')) {
        await btnMontinho.click({ force: true });
        await page.waitForTimeout(150); 
      }
    }

    // 2. Procura na mesa e no descarte um par correspondente
    const jogadaPossivel = await page.evaluate(() => {
      const cartaOrigem = document.querySelector('#waste-pile .card[draggable="true"]');
      if (!cartaOrigem) return null;
      
      const categoriaOrigem = cartaOrigem.getAttribute('data-categoria');

      const cartasMesa = Array.from(document.querySelectorAll('#tableau-container .card:not(.back)'));
      const alvoValido = cartasMesa.find(c => c.getAttribute('data-categoria') === categoriaOrigem);

      if (alvoValido) {
        const textoOrigem = cartaOrigem.querySelector('span').innerText;
        const textoAlvo = alvoValido.querySelector('span').innerText;
        return { textoOrigem, textoAlvo };
      }
      return null;
    });

    test.skip(!jogadaPossivel, 'Nenhum par compatível foi gerado pelo jogo aleatório nesta rodada.');

    // 3. Executa o agrupamento
    const placar = page.getByTestId('placar-movimentos');
    const movimentosAntes = parseInt(await placar.textContent(), 10);

    // CORREÇÃO: Usamos o filtro do próprio Playwright para achar as cartas
    const locatorOrigem = page.locator('#waste-pile .card').filter({ hasText: jogadaPossivel.textoOrigem });
    // Pegamos apenas a primeira (.first()) caso tenha cartas repetidas
    const locatorAlvo = page.locator('#tableau-container .card').filter({ hasText: jogadaPossivel.textoAlvo }).first();

    // Chama a nossa função mágica passando os locators
    await dragAndDropHtml5(locatorOrigem, locatorAlvo);

    // 4. Valida se a carta agrupou
    const movimentosDepois = parseInt(await placar.textContent(), 10);
    expect(movimentosDepois).toBe(movimentosAntes - 1);

    // Cria uma regra para buscar EXATAMENTE o texto da carta, ignorando as cartas pai
    const regexTextoExato = new RegExp('^' + jogadaPossivel.textoOrigem + '$', 'i');
    
    const cartaGrudada = page.locator('#tableau-container .card').filter({ hasText: regexTextoExato });
    await expect(cartaGrudada).toHaveClass(/nested-card/);
  });

  // TESTE 4
  test('Deve enviar uma carta da mesa para o Slot de conquista correspondente', async ({ page }) => {
    
    // 1. O robô vasculha a mesa procurando a primeira carta que ele pode arrastar 
    // (cartas com draggable="true" e sem a classe .back)
    const jogadaSlot = await page.evaluate(() => {
      const cartasLivres = Array.from(document.querySelectorAll('#tableau-container .card[draggable="true"]'));
      
      if (cartasLivres.length > 0) {
        // Pega a primeira carta disponível
        const carta = cartasLivres[0];
        const categoria = carta.getAttribute('data-categoria');
        const texto = carta.querySelector('span').innerText;
        return { texto, categoria };
      }
      return null;
    });

    // Se por um grande azar do sorteio inicial o jogo não gerar nenhuma carta livre 
    // (quase impossível pelas suas regras, mas é uma boa prática de segurança), o teste pula.
    test.skip(!jogadaSlot, 'Nenhuma carta livre encontrada na mesa para enviar ao slot.');

    // 2. Anota o placar atual
    const placar = page.getByTestId('placar-movimentos');
    const movimentosAntes = parseInt(await placar.textContent(), 10);

    // 3. Monta os alvos exatos usando a nossa regra de Texto Exato (Regex) e a Categoria
    const regexTextoExato = new RegExp('^' + jogadaSlot.texto + '$', 'i');
    
    // A Origem é a carta na mesa
    const locatorOrigem = page.locator('#tableau-container .card').filter({ hasText: regexTextoExato });
    
    // O Destino é o slot lá em cima que tem o mesmo data-categoria da carta
    const locatorSlot = page.locator(`#slots-container .slot[data-categoria="${jogadaSlot.categoria}"]`);

    // 4. Executa o Drag and Drop Mágico para o Slot
    await dragAndDropHtml5(locatorOrigem, locatorSlot);

    // 5. O Grande Julgamento (Validações)
    
    // Verifica se o movimento foi cobrado
    const movimentosDepois = parseInt(await placar.textContent(), 10);
    expect(movimentosDepois).toBe(movimentosAntes - 1);

    // Verifica se a carta realmente foi parar dentro do HTML do slot
    // E se ela recebeu a classe .correct (conforme a sua logica.js)
    const cartaNoSlot = locatorSlot.locator('.card').filter({ hasText: regexTextoExato });
    await expect(cartaNoSlot).toHaveClass(/correct/);
  });

});

