# InvestPro — Gerenciador de Investimentos

## Pré-requisito

Instale o Node.js (versão 18 ou superior):
- Acesse https://nodejs.org e baixe a versão LTS
- Ou pelo Homebrew: `brew install node`

## Como rodar

Abra o Terminal no Mac e execute:

```bash
# 1. Entre na pasta do projeto
cd investpro

# 2. Instale as dependências (só na primeira vez)
npm install

# 3. Rode o app
npm run dev
```

O navegador vai abrir automaticamente em http://localhost:3000

## Funcionalidades

- **Dashboard** — Visão geral do patrimônio, alocação por categoria, resumo mensal
- **Renda Fixa** — CDB, LCI, LCA, CRA, Tesouro Direto etc.
- **Ações** — Carteira com preço médio, preço atual e cálculo de L/P
- **ETFs** — Exchange Traded Funds com taxa de administração
- **FIIs** — Fundos Imobiliários com dividendos e DY
- **Cripto** — Criptomoedas com exchange e wallet
- **Aportes** — Controle de todos os aportes mensais por categoria
- **Orçamento** — Controle de receitas e despesas com filtro por mês
- **Índices** — SELIC, IPCA, CDI, Dólar, IGPM, INCC etc. com atualização automática via API do Banco Central

## Dados

Todos os dados ficam salvos no localStorage do navegador.
Enquanto você não limpar os dados do navegador, eles persistem entre sessões.
