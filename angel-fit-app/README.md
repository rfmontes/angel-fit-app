# Angel Fit - Sistema de Gestão de Loja

Bem-vindo ao repositório do **Angel Fit**, uma aplicação web moderna e responsiva desenvolvida para gerenciar o estoque e as vendas de uma loja de moda feminina.

![Angel Fit Logo](/public/logo.png)

## 📋 Sobre o Projeto

O Angel Fit é um sistema completo de gestão que permite controlar produtos, realizar vendas (PDV) e visualizar métricas de desempenho em tempo real. A aplicação foi construída com foco em usabilidade, performance e estética, utilizando **React** e **Tailwind CSS**, com **Supabase** como backend.

### Principais Funcionalidades

*   **📊 Dashboard Interativo:**
    *   Visão geral de **Vendas Hoje**, **Total Vendido**, **Custo do Estoque** e **Itens com Estoque Baixo**.
    *   Tabelas de desempenho ordenáveis por **Categoria** e **Cor**, permitindo análise rápida dos produtos mais vendidos ou com maior estoque.
    *   Gráficos e indicadores visuais de progresso.
*   **📦 Gestão de Estoque:**
    *   Cadastro completo de produtos com: Nome, Fornecedor, Categoria, Cor, Tamanho, Preço de Custo, Preço de Venda e Estoque Mínimo.
    *   Interface de tabela com ordenação dinâmica (clique nos cabeçalhos).
    *   Edição e exclusão de produtos.
    *   Indicadores visuais de estoque crítico (vermelho) e normal (verde).
*   **🛍️ Ponto de Venda (PDV):**
    *   Sistema de busca rápida de produtos.
    *   Carrinho de compras intuitivo com ajuste de quantidade.
    *   Registro de venda com nome da cliente, telefone e data (opcional).
    *   **Mobile-First:** Aba de navegação exclusiva para celular alternando entre "Produtos" e "Carrinho".
*   **📱 Design Totalmente Responsivo:**
    *   Layout adaptável para Desktop, Tablet e Mobile.
    *   Menu lateral no desktop e navegação fixa no mobile.
*   **🌙 Modo Escuro (Dark Mode):**
    *   Tema escuro integrado para conforto visual, alternável via botão na interface.

## 🚀 Tecnologias Utilizadas

*   **Frontend:**
    *   [React](https://react.dev/) - Biblioteca JavaScript para construção de interfaces.
    *   [Vite](https://vitejs.dev/) - Build tool rápida e leve.
    *   [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário para estilização.
    *   [React Router](https://reactrouter.com/) - Roteamento da aplicação.
    *   [Zustand](https://github.com/pmndrs/zustand) - Gerenciamento de estado global.
    *   [Lucide React](https://lucide.dev/) - Ícones belos e consistentes.
*   **Backend:**
    *   [Supabase](https://supabase.com/) - Alternativa open source ao Firebase (Postgres Database, Auth, Realtime).

## 🛠️ Instalação e Configuração

Siga os passos abaixo para rodar o projeto localmente:

### Pré-requisitos
*   Node.js (versão 18 ou superior)
*   Conta no Supabase (para o banco de dados)

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd angel-fit-app
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configuração do Ambiente (.env)
Crie um arquivo `.env` na raiz do projeto e adicione suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Configuração do Banco de Dados (Supabase)
Execute o script SQL fornecido (ver `database_schema.sql` nos artefatos do projeto) no painel SQL do Supabase para criar as tabelas `products` e `sales`.

Estrutura básica das tabelas:
*   **products**: `id`, `name`, `category`, `color`, `size`, `price`, `stock`, `supplier`, `cost`, `min_stock`.
*   **sales**: `id`, `items` (JSON), `total`, `date`, `customer_name`, `customer_phone`.

### 5. Execute o projeto
```bash
npm run dev
```
Acesse `http://localhost:5173` no seu navegador.

## 🎨 Personalização

*   **Fonte:** O projeto utiliza a fonte *Great Vibes* para o logo e cabeçalhos, importada via Google Fonts.
*   **Cores:** A paleta de cores principal utiliza tons de `pink-600` (Angel Fit Rose) e escala de cinza neutra, configurada via Tailwind.

## 📄 Licença

Este projeto é de uso privado para Angel Fit.
