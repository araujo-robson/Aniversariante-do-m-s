
# Plano: Adaptar grid ao corpo da pagina + Fundo de Fevereiro

## O que sera feito

### 1. Grid adaptativo ao corpo da pagina
O corpo da pagina (area do grid de fotos) tera dimensoes fixas de **18cm x 20cm**, posicionado a **14mm do eixo X** e **62mm do eixo Y** dentro da pagina A4.

O grid de fotos sera calculado dinamicamente para preencher o maximo desse espaco:
- Com base no numero de pessoas, o sistema calcula automaticamente quantas colunas e linhas cabem na area de 18x20cm
- As dimensoes de cada PhotoCard (largura e altura) sao calculadas dividindo o espaco disponivel pelo numero de colunas/linhas, com gaps incluidos
- As fotos se expandem para ocupar o maximo da area disponivel

### 2. Imagem de fundo para Fevereiro
A imagem enviada (`Fevereiro.png`) sera copiada para `src/assets/fevereiro-bg.png` e usada como plano de fundo da pagina A4 quando o mes selecionado for Fevereiro. A imagem cobrira toda a pagina, e o grid de fotos ficara sobreposto na area definida.

---

## Detalhes tecnicos

### Alteracoes em `src/components/DocumentPreview.tsx`
- Definir a area do corpo com posicao absoluta: `left: 14mm`, `top: 62mm`, `width: 18cm`, `height: 20cm`
- Calcular colunas e linhas ideais com base no numero de pessoas para maximizar o uso do espaco
- Passar `cardWidth` e `cardHeight` calculados para cada `PhotoCard`
- Para o mes 2 (Fevereiro), usar a imagem importada como `backgroundImage` da pagina A4 em vez do `bgGradient`
- Remover emojis decorativos quando houver imagem de fundo

### Alteracoes em `src/components/PhotoCard.tsx`
- Aceitar props opcionais `cardWidth` e `cardHeight` para definir dimensoes explicitas em vez de usar `width: 100%` e `aspectRatio`

### Alteracoes em `src/lib/monthThemes.ts`
- Adicionar campo opcional `bgImage?: string` na interface `MonthTheme`
- Definir `bgImage` para o mes de Fevereiro apontando para o asset importado

### Novo arquivo
- Copiar `user-uploads://Fevereiro.png` para `src/assets/fevereiro-bg.png`

### Logica de calculo do grid
```text
Area disponivel: 180mm x 200mm
Gap entre cards: ~2mm

Para N pessoas:
- Testar combinacoes de colunas (3 a 10) e linhas
- Escolher a combinacao que maximiza a area de cada card
- cardWidth = (180 - gaps) / colunas
- cardHeight = (200 - gaps) / linhas
```
