# SisProfi API

API desenvolvida para organização de atendimentos relacionados ao PROUNI e FIES.

## Tecnologias

- Python
- Django
- Django REST Framework
- PostgreSQL
- JWT
- Postman

## Funcionalidades

- Cadastro e gerenciamento de alunos
- Cadastro de programas PROUNI/FIES
- Gerenciamento de agendamentos
- Registro de atendimentos
- Registro e acompanhamento de pendências
- Gerenciamento de funcionários
- Autenticação JWT
- CRUD via API REST

## Estrutura da API

Base:

```text
/api/v1/
```

## Principais endpoints

```text
/api/v1/alunos/
/api/v1/programas/
/api/v1/agendamentos/
/api/v1/atendimentos/
/api/v1/funcionarios/
/api/v1/pendencias/
```

## Autenticação

Obter token:

```text
POST /api/v1/token/
```

Renovar token:

```text
POST /api/v1/token/refresh/
```

## Instalação

### 1. Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
```

### 2. Entre na pasta do projeto

```bash
cd sisprofi
```

### 3. Crie o ambiente virtual

```bash
python -m venv venv
```

### 4. Ative o ambiente virtual

No Windows:

```bash
venv\Scripts\activate
```

### 5. Instale as dependências

```bash
pip install -r requirements.txt
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
SECRET_KEY=sua_secret_key

DB_NAME=nome_do_banco
DB_USER=usuario_postgresql
DB_PASSWORD=senha_postgresql
DB_HOST=localhost
DB_PORT=5432
```

O arquivo `.env` não deve ser enviado para o GitHub.

## Banco de dados

O projeto utiliza PostgreSQL.

Após configurar o banco de dados, execute:

```bash
python manage.py makemigrations
python manage.py migrate
```

## Criar usuário administrador

Para criar um usuário administrador:

```bash
python manage.py createsuperuser
```

## Executar o projeto

```bash
python manage.py runserver
```

A API ficará disponível em:

```text
http://127.0.0.1:8000/api/v1/
```

## Testes da API

Os endpoints podem ser testados utilizando o Postman.

Principais operações disponíveis:

```text
GET     - Consultar
POST    - Cadastrar
PUT     - Atualizar
PATCH   - Atualizar parcialmente
DELETE  - Excluir
```

## Estrutura do projeto

```text
sisprofi/
│
├── core/
│   ├── settings.py
│   ├── urls.py
│   └── ...
│
├── myapp/
│   ├── api/
│   │   └── v1/
│   │       ├── serializers.py
│   │       ├── viewsets.py
│   │       └── router.py
│   │
│   ├── migrations/
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   └── views.py
│
├── .env
├── .gitignore
├── manage.py
├── README.md
└── requirements.txt
```

## Principais entidades

O sistema possui as seguintes entidades:

```text
Aluno
Programa
Agendamento
Atendimento
Funcionário
Pendência
```

O relacionamento entre Aluno e Programa é do tipo muitos-para-muitos.

O fluxo principal do sistema segue:

```text
Aluno
↓
Agendamento
↓
Atendimento
↓
Pendência
```

## Segurança

Algumas medidas adotadas no projeto:

- Autenticação JWT
- Senhas gerenciadas pelo sistema de autenticação do Django
- Variáveis sensíveis armazenadas em `.env`
- `SECRET_KEY` não armazenada diretamente no código
- Credenciais do PostgreSQL protegidas por variáveis de ambiente
- `.env` ignorado pelo Git através do `.gitignore`

## Status do projeto

O projeto encontra-se em desenvolvimento.

Atualmente estão implementados:

- Modelagem do banco de dados
- Integração com PostgreSQL
- API REST
- CRUD das principais entidades
- Versionamento da API
- Testes utilizando Postman
- Autenticação JWT
- Integração com GitHub

Próximas etapas previstas:

- Implementação das regras de negócio
- Controle de permissões entre alunos e funcionários
- Proteção das rotas de acordo com o tipo de usuário
- Evolução da interface da aplicação
