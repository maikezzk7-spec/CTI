# CTI Insights

**Sistema de Upload, Tratamento, Validação e Visualização de Dados de Clientes**

Projeto desenvolvido na disciplina de **Desenvolvimento Front-end**, do SENAI Roberto Mange, como parte das atividades do projeto CTI Insights.

## 1. Objetivo

O CTI Insights é uma aplicação web desenvolvida com Vue 3 que permite importar planilhas de clientes, tratar e padronizar informações, identificar inconsistências e visualizar os resultados por meio de relatórios e gráficos interativos.

Nesta etapa, o processamento dos dados é realizado no próprio navegador, utilizando Pinia para gerenciamento do estado da aplicação e SheetJS para leitura das planilhas.

## 2. Tecnologias utilizadas

- **Vue 3:** construção da interface.
- **Vite:** ambiente de desenvolvimento e compilação.
- **Pinia:** gerenciamento do estado global.
- **SheetJS (XLSX):** leitura de planilhas Excel e CSV.
- **Vue Router:** navegação entre as páginas.
- **Tailwind CSS:** estilização e responsividade.
- **Chart.js:** construção dos gráficos interativos.
- **Font Awesome:** ícones da interface.

## 3. Funcionalidades

### Upload de planilhas

A tela de Upload permite:

- Selecionar ou arrastar arquivos `.xlsx`, `.xls` e `.csv`.
- Ler os dados da planilha.
- Converter os registros em objetos JavaScript.
- Realizar tratamento e validação.
- Exibir indicadores e uma prévia dos registros.

### Tratamento e validação dos dados

O sistema realiza:

- Remoção de espaços desnecessários nas extremidades dos textos.
- Padronização de segmentos, como Indústria, Comércio e Serviços.
- Normalização dos níveis de clientes para A, B ou C.
- Verificação de campos obrigatórios.
- Identificação de códigos de clientes duplicados.
- Validação de faturamento numérico e não negativo.
- Verificação de datas no formato DD/MM/AAAA.
- Verificação do formato da UF.

Os registros são classificados como válidos ou inválidos de acordo com as inconsistências encontradas.

### Relatórios

A tela de Relatórios apresenta:

- Nome do arquivo analisado.
- Total de registros processados.
- Quantidade de registros válidos e inválidos.
- Total de erros identificados.
- Percentual de registros válidos.
- Quantidade de erros por categoria.
- Detalhamento dos erros por linha, campo e descrição.
- Relação dos registros com inconsistências.

### Gráficos

A tela de Gráficos apresenta visualizações interativas de:

- Clientes por segmento.
- Clientes por nível A, B e C.
- Evolução mensal das contratações.
- Registros válidos e inválidos.
- Erros por categoria.

## 4. Organização do projeto

Os principais arquivos são:

- `src/main.js` — inicialização da aplicação e ativação do Pinia.
- `src/App.vue` — componente principal.
- `src/stores/uploadStore.js` — gerenciamento dos dados, tratamento e validações.
- `src/views/UploadView.vue` — interface de importação.
- `src/views/RelatoriosView.vue` — relatórios de validação.
- `src/views/GraficosView.vue` — gráficos e indicadores.
- `src/style.css` — estilos globais.

## 5. Gerenciamento de estado com Pinia

O arquivo `uploadStore.js` utiliza os três conceitos principais do Pinia.

**State:** armazena o arquivo selecionado, os dados originais, tratados, válidos e inválidos, os erros encontrados e o estado do processamento.

**Getters:** calculam informações como total de clientes, quantidade de erros, clientes de nível A, total de registros válidos e inválidos e percentual de validação.

**Actions:** executam operações como seleção do arquivo, verificação do formato, leitura da planilha, tratamento dos campos e validação dos registros.

Essa organização permite que diferentes telas compartilhem os mesmos dados.

## 6. Como executar o projeto

É necessário ter o Node.js e o npm instalados.

Clone o repositório:

```bash
git clone https://github.com/maikezzk7-spec/CTI.git
```

Entre na pasta do projeto:

```bash
cd CTI
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra no navegador o endereço local informado pelo Vite.

## 7. Fluxo de funcionamento

**Planilha → Upload Vue → Pinia → Tratamento → Validação → Relatórios e Gráficos**

O usuário seleciona uma planilha, a aplicação realiza a leitura com SheetJS e armazena os dados no Pinia. Em seguida, os registros são tratados e validados, disponibilizando os resultados nas telas.

## 8. Integração futura com backend

**Nesta etapa, o CTI Insights funciona no front-end, sem integração com API ou banco de dados.**

Em etapas futuras, está prevista a integração com:

- **Axios:** comunicação HTTP com o backend.
- **Spring Boot:** desenvolvimento da API e implementação das regras de negócio no servidor.
- **PostgreSQL:** persistência dos dados.
- **Microsoft Azure:** infraestrutura e serviços em nuvem.

Fluxo previsto:

**Vue 3 → Pinia → Axios → Spring Boot → PostgreSQL / Azure**

A implementação dessas integrações será realizada em aulas posteriores.

## 9. Repositório

Código-fonte disponível em:

https://github.com/maikezzk7-spec/CTI

---

**Projeto CTI Insights — Desenvolvimento Front-end | SENAI Roberto Mange — 2026.**