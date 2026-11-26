# Sistema de Avaliação de Desempenho 360°

Trabalho prático da disciplina de **Banco de Dados I**  
**Universidade Estadual de Londrina (UEL)**  
**Docente:** Prof. Dr. Anderson Paulo Avila Santos  

---

## 👥 Integrantes do Grupo
* **Lorenzo:** `<!-- Preencher Nome Completo e RA -->`
* **Thierry:** `<!-- Preencher Nome Completo e RA -->`

---

## 🎯 1. Natureza do Sistema e Particularidade (RF6)

* **Natureza Escolhida:** Avaliação de Desempenho Profissional (Avaliação 360°).
* **Particularidade Implementada:**  
  Em um ciclo de avaliação 360°, um mesmo colaborador pode avaliar e ser avaliado por múltiplas pessoas (gestores, liderados e pares interdepartamentais). Cada avaliador avalia cada avaliado no máximo uma única vez por ciclo (garantido pela restrição `UNIQUE(id_avaliacao, id_avaliador, id_avaliado)` na tabela `DESIGNACAO`).
  
  Além disso, cada critério/competência possui um **peso diferenciado** que varia conforme a avaliação ou ciclo (`coluna peso NUMERIC(5,2)` na tabela `COMPOSICAO`), permitindo que a média final do colaborador seja calculada como uma **média ponderada** pelas competências mais estratégicas do ciclo.

---

## 🏗️ 2. Arquitetura do Sistema

O sistema foi construído estritamente em conformidade com as diretrizes da disciplina:
* **SGBD:** PostgreSQL (SQL puro, DDL com constraints `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `NOT NULL`, `CHECK`).
* **Back-end:** Java 25 + Spring Boot (com `spring-boot-starter-jdbc` e `spring-boot-starter-web`).
* **Acesso ao Banco de Dados:** Padrão **DAO (Data Access Object)** com `JdbcTemplate` (**sem JPA/Hibernate**, conforme exigência).
* **Transações:** `@Transactional` em operações de escrita que afetam múltiplas tabelas (ex.: criação de questões com alternativas, montagem de avaliação com pesos e submissão em lote de respostas).
* **Organização em Camadas:**
  * `model`: Entidades POJO mapeadas do banco.
  * `dao`: Classes de acesso a dados contendo todas as queries SQL via JDBC.
  * `service`: Regras de negócio e controle transacional.
  * `controller`: Endpoints REST retornando JSON estruturado.
  * `dto`: Objetos para tráfego e validação de requisições.
  * `exception`: Tratamento global e padronizado de exceções HTTP (`GlobalExceptionHandler`).

---

## 🚀 3. Como Rodar o Sistema (Passo a Passo)

### Pré-requisitos
* **Java 21 ou 25** instalado (`java -version`)
* **PostgreSQL** instalado e ativo na porta `5432`
* **DBeaver** (ou terminal `psql`)

### Passo 1: Criar o Banco de Dados
No DBeaver ou terminal, crie o banco de dados `sistema-bd`:
```bash
createdb -U postgres sistema-bd
```

### Passo 2: Executar o Schema e a Carga de Testes
No **DBeaver** (conectado ao banco `sistema-bd`):
1. Abra o arquivo [database/schema.sql](database/schema.sql) e execute o script inteiro com **`Alt + X`**.
2. Abra o arquivo [database/carga.sql](database/carga.sql) e execute o script inteiro com **`Alt + X`**.

> **Ou via terminal:**
> ```bash
> psql -U postgres -d sistema-bd -f database/schema.sql
> psql -U postgres -d sistema-bd -f database/carga.sql
> ```

### Passo 3: Configurar as Credenciais
Se o seu PostgreSQL utilizar senha, edite o arquivo [src/main/resources/application.properties](src/main/resources/application.properties):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sistema-bd
spring.datasource.username=postgres
spring.datasource.password=sua_senha
spring.datasource.driver-class-name=org.postgresql.Driver
```

### Passo 4: Executar o Back-end
Na raiz do projeto:
```bash
./mvnw spring-boot:run
```
A API estará disponível e respondendo em: `http://localhost:8080`.

### Passo 5: Executar o Front-end
Com Node.js e npm instalados, mantenha o back-end rodando e abra outro terminal na raiz do projeto:
```bash
cd frontend
npm ci
npm run dev
```
Abra `http://localhost:3000` para acessar as telas (ou o endereço indicado pelo Vite no terminal).
O frontend encaminha as chamadas `/api` para o back-end na porta `8080`.
A porta `8080` serve a API; a rota `/` nela não possui uma página inicial.

### Passo 6: Entrar no Sistema
A tela inicial pede apenas o **email** do colaborador (login simples, sem senha, conforme o enunciado: basta identificar quem responde). A sessão fica salva no navegador até clicar em **Sair**.

Emails de teste (da carga `carga.sql`):

| Email | Colaborador |
|---|---|
| `carlos.silva@empresa.com` | Carlos Eduardo Silva — Gerente de Engenharia |
| `ana.souza@empresa.com` | Ana Paula Souza — Tech Lead |
| `lucas.ferreira@empresa.com` | Lucas Ferreira — Desenvolvedor Pleno |
| `gabriel.monteiro@empresa.com` | Gabriel Monteiro — Desenvolvedor Senior |
| `juliana.rocha@empresa.com` | Juliana Rocha — Desenvolvedora Junior |

---

## 📊 4. Cobertura dos Recursos SQL Obrigatórios (Seção 5)

Todos os recursos SQL exigidos pela disciplina foram distribuídos estrategicamente entre os relatórios:

| Recurso SQL Exigido | Onde é Utilizado no Sistema |
|---|---|
| **Junção Interna (`JOIN`)** | Utilizado em todos os relatórios (ligando `RESPOSTA`, `DESIGNACAO`, `COMPOSICAO`, `QUESTAO`, `AVALIACAO` e `USUARIO`). |
| **Junção Externa (`LEFT JOIN`)** | **Relatório 4 (Pendências)**: cruza designações com respostas; com `GROUP BY` + `HAVING COUNT(r.id_resposta) = 0`, sobram só as designações sem nenhuma resposta (o `COUNT` de coluna ignora os `NULL` gerados pelo `LEFT JOIN`). |
| **Agregação e Agrupamento (`COUNT`, `AVG`, `SUM`, `GROUP BY`, `HAVING`)** | **Relatório 1, 2, 3, 4 e 5**: cálculo de médias ponderadas via `SUM()`, contagem de avaliadores via `COUNT(DISTINCT)`, médias via `AVG()` e filtros pós-agrupamento via `HAVING`. |
| **Subconsulta** | **Relatório 2 (Radar de Competências)**: subconsulta correlacionada no `SELECT` calculando a média global de todos os participantes para a mesma questão, permitindo comparativo. |
| **Ordenação e Ranking (`ORDER BY`, `RANK()`, `FETCH FIRST`)** | **Relatório 5 (Ranking)**: função analítica de janela `RANK() OVER (ORDER BY media DESC)` e limitação com `FETCH FIRST :limite ROWS ONLY`. |
| **Filtros Diversos (`WHERE` com datas, faixas, `IN`, `LIKE`)** | **Relatório 3**: faixas de datas no `WHERE` (`data_inicio >= ? AND data_fim <= ?`).<br>**Relatório 4**: filtro `IN` pelos departamentos do avaliador marcados na tela (`u_avaliador.departamento IN (?, ?, ...)`).<br>**Relatório 5**: busca textual com operador `LIKE`/`ILIKE` por departamento (`u.departamento ILIKE ?`). |

O arquivo com todas as queries comentadas está disponível em: [database/relatorios.sql](database/relatorios.sql).

---

## 📈 5. Detalhamento dos 5 Relatórios (RF7)

### Relatório 1: Resultado Consolidado por Avaliado
* **Rota:** `GET /api/relatorios/consolidado?idAvaliacao=3&minAvaliadores=2`
* **Objetivo:** Exibir a média ponderada final de cada colaborador avaliado no ciclo, aplicando o peso das competências (`COMPOSICAO.peso`). Permite filtrar por volume mínimo de avaliadores (`HAVING COUNT(DISTINCT d.id_avaliador) >= :minAvaliadores`).
* **Visualização no Frontend:** Tabela consolidada + Gráfico de Barras Horizontais ordenado da maior para a menor média.
* **SQL:** [Relatório 1 em `database/relatorios.sql`](database/relatorios.sql#L15).

### Relatório 2: Radar de Competências com Comparativo Geral da Empresa
* **Rota:** `GET /api/relatorios/competencias?idAvaliacao=3&idAvaliado=2`
* **Objetivo:** Comparar o desempenho individual de um colaborador específico em cada questão/competência contra a média geral de todos os colaboradores avaliados na mesma avaliação (obtida via subconsulta).
* **Visualização no Frontend:** Tabela comparativa + Gráfico tipo **Radar (Teia)** com duas séries de dados: *Média do Avaliado* vs *Média Geral da Empresa*.
* **SQL:** [Relatório 2 em `database/relatorios.sql`](database/relatorios.sql#L51).

### Relatório 3: Evolução Histórica entre Ciclos (com Filtro Temporal)
* **Rota:** `GET /api/relatorios/evolucao?idAvaliado=2&dataInicio=2025-01-01&dataFim=2026-12-31`
* **Objetivo:** Acompanhar a evolução das médias de um colaborador ao longo de múltiplos ciclos de avaliação semestrais (2025.1 até 2026.2).
* **Visualização no Frontend:** Tabela cronológica + Gráfico de **Linha Temporal** mostrando a progressão de notas.
* **SQL:** [Relatório 3 em `database/relatorios.sql`](database/relatorios.sql#L90).

### Relatório 4: Pendências de Resposta (Quem Ainda Não Avaliou)
* **Rota:** `GET /api/relatorios/pendencias?idAvaliacao=3&departamentos=Tecnologia&departamentos=Produto`
* **Objetivo:** Identificar quem são os avaliadores que possuem designações atribuídas mas ainda não preencheram o questionário, permitindo que o RH faça cobranças pontuais. Pode ser filtrado por um ou mais departamentos do avaliador (`IN`).
* **Recursos SQL:** `LEFT JOIN`, `JOIN`, `IN`, `GROUP BY`, `HAVING COUNT(r.id_resposta) = 0`, `ORDER BY`.
* **Visualização no Frontend:** Tabela de pendências com badge de alerta + Gráfico de **Rosca/Pizza** mostrando proporção de Avaliações Concluídas vs Pendentes.
* **SQL:** [Relatório 4 em `database/relatorios.sql`](database/relatorios.sql#L125).

### Relatório 5: Ranking de Desempenho com Função de Janela
* **Rota:** `GET /api/relatorios/ranking?idAvaliacao=3&departamento=Tecnologia&limite=10`
* **Objetivo:** Classificar formalmente os profissionais mais bem avaliados (Top Performers) usando a função de janela `RANK() OVER`, com filtro textual flexível por departamento (`ILIKE`) e limite configurável (`FETCH FIRST :limite ROWS ONLY`).
* **Visualização no Frontend:** Tabela de classificação com pódio + Gráfico de Barras Verticais.
* **SQL:** [Relatório 5 em `database/relatorios.sql`](database/relatorios.sql#L173).

---

## 📡 6. Resumo dos Endpoints da API

### Autenticação / Identificação do Usuário
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/auth/login` | Identifica o usuário via email para navegação personalizada no sistema |

### Usuários
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/usuarios` | Lista todos os usuários cadastrados |
| `GET` | `/api/usuarios/{id}` | Busca usuário por ID |
| `POST` | `/api/usuarios` | Cadastra novo usuário |
| `PUT` | `/api/usuarios/{id}` | Atualiza usuário existente |
| `DELETE` | `/api/usuarios/{id}` | Remove usuário |

### RF1 — Questões e Alternativas
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/questoes` | Lista todas as questões |
| `GET` | `/api/questoes/{id}` | Busca questão por ID |
| `GET` | `/api/questoes/{id}/alternativas` | Lista alternativas de uma questão de múltipla escolha |
| `POST` | `/api/questoes` | Cadastra questão (com alternativas em lote para múltipla escolha) |
| `PUT` | `/api/questoes/{id}` | Atualiza enunciado, tipo e alternativas |
| `DELETE` | `/api/questoes/{id}` | Remove questão |

### RF2 e RF3 — Avaliações e Montagem de Composição
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/avaliacoes` | Lista todas as avaliações/ciclos |
| `GET` | `/api/avaliacoes/{id}` | Busca avaliação por ID |
| `POST` | `/api/avaliacoes` | Cadastra nova avaliação (RF2) |
| `PUT` | `/api/avaliacoes/{id}` | Atualiza dados descritivos |
| `DELETE` | `/api/avaliacoes/{id}` | Remove avaliação |
| `GET` | `/api/avaliacoes/{id}/questoes` | Lista questões associadas e seus respectivos pesos (RF3 + RF6) |
| `PUT` | `/api/avaliacoes/{id}/questoes` | Monta ou atualiza a composição da avaliação com pesos (RF3 + RF6) |
| `DELETE` | `/api/avaliacoes/{id}/questoes/{idQuestao}` | Remove uma questão da avaliação |

### RF4 e RF5 — Designações e Registro de Respostas
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/designacoes` | Lista todas as designações |
| `GET` | `/api/designacoes?idAvaliacao={id}` | Filtra designações por avaliação |
| `GET` | `/api/designacoes?idAvaliador={id}` | Lista avaliações que o usuário deve responder |
| `GET` | `/api/designacoes?idAvaliado={id}` | Lista avaliações recebidas pelo usuário |
| `POST` | `/api/designacoes` | Designa avaliador para avaliar um avaliado em um ciclo (RF4) |
| `DELETE` | `/api/designacoes/{id}` | Remove designação |
| `GET` | `/api/designacoes/{id}/respostas` | Consulta respostas registradas em uma designação |
| `POST` | `/api/designacoes/{id}/respostas` | Registra pacote de respostas em transação atômica (RF5) |

### RF7 — Relatórios Analíticos
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/relatorios/consolidado` | Resultado consolidado e média ponderada (parâmetros: `idAvaliacao`, `minAvaliadores`) |
| `GET` | `/api/relatorios/competencias` | Radar de competências individual vs média da empresa (parâmetros: `idAvaliacao`, `idAvaliado`) |
| `GET` | `/api/relatorios/evolucao` | Evolução histórica entre ciclos (parâmetros: `idAvaliado`, `dataInicio`, `dataFim`) |
| `GET` | `/api/relatorios/pendencias` | Pendências de resposta por avaliação (parâmetros: `idAvaliacao`, `departamentos` opcional e repetível) |
| `GET` | `/api/relatorios/ranking` | Ranking ordenado via `RANK()` (parâmetros: `idAvaliacao`, `departamento`, `limite`) |

---

## 📐 7. Modelagem do Banco e Normalização (3FN)

* **Diagrama Conceitual (DER):** Arquivo vetorial de alta definição disponível em [docs/der.svg](docs/der.svg).
* **Esquema Relacional e Justificativa da 3FN:** Arquivo textual completo disponível em [docs/esquema.txt](docs/esquema.txt).
