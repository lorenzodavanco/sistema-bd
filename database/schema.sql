CREATE TABLE USUARIO (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    cargo VARCHAR(50) NOT NULL,
    departamento VARCHAR(50) NOT NULL
);

CREATE TABLE AVALIACAO (
    id_avaliacao SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    CHECK (data_fim >= data_inicio)
);

CREATE TABLE QUESTAO (
    id_questao SERIAL PRIMARY KEY,
    enunciado TEXT NOT NULL,
    tipo_questao VARCHAR(20) NOT NULL,
    CHECK (tipo_questao IN ('MULTIPLA_ESCOLHA', 'TEXTO_LIVRE'))
);

CREATE TABLE ALTERNATIVA (
    id_questao INT NOT NULL,
    id_alternativa INT NOT NULL,
    texto VARCHAR(255) NOT NULL,
    PRIMARY KEY (id_questao, id_alternativa),
    FOREIGN KEY (id_questao) REFERENCES QUESTAO (id_questao) ON DELETE CASCADE
);

CREATE TABLE COMPOSICAO (
    id_avaliacao INT NOT NULL,
    id_questao INT NOT NULL,
    peso NUMERIC(5,2) NOT NULL DEFAULT 1.00 CHECK (peso > 0),
    PRIMARY KEY (id_avaliacao, id_questao),
    FOREIGN KEY (id_avaliacao) REFERENCES AVALIACAO (id_avaliacao) ON DELETE CASCADE,
    FOREIGN KEY (id_questao) REFERENCES QUESTAO (id_questao) ON DELETE CASCADE
);

CREATE TABLE DESIGNACAO (
    id_designacao SERIAL PRIMARY KEY,
    id_avaliacao INT NOT NULL,
    id_avaliador INT NOT NULL,
    id_avaliado INT NOT NULL,
    UNIQUE (id_avaliacao, id_avaliador, id_avaliado),
    FOREIGN KEY (id_avaliacao) REFERENCES AVALIACAO (id_avaliacao) ON DELETE CASCADE,
    FOREIGN KEY (id_avaliador) REFERENCES USUARIO (id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_avaliado) REFERENCES USUARIO (id_usuario) ON DELETE CASCADE
);

CREATE TABLE RESPOSTA (
    id_resposta SERIAL PRIMARY KEY,
    id_designacao INT NOT NULL,
    id_questao INT NOT NULL,
    valor_resposta TEXT NOT NULL,
    UNIQUE (id_designacao, id_questao),
    FOREIGN KEY (id_designacao) REFERENCES DESIGNACAO (id_designacao) ON DELETE CASCADE,
    FOREIGN KEY (id_questao) REFERENCES QUESTAO (id_questao) ON DELETE CASCADE
);
