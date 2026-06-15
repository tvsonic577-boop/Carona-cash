# 🚗 Manual de Instalação e Implantação na Hostinger — CARONA CASH

Este documento descreve detalhadamente como instalar o sistema completo **Carona Cash** localmente ou hospedá-lo na plataforma de hospedagem da **Hostinger** (utilizando painel VPS ou planos Cloud com suporte à hospedagem de aplicativos em Node.js).

---

## 💻 CONFIGURAÇÕES LOCAIS (DESENVOLVIMENTO)

Para executar o ecossistema Carona Cash em ambiente local de testes rápidas:

### Requisitos Prévios
- **Node.js** v18 ou superior instalado.
- **PostgreSQL** ou **Docker** executando no computador local.

### 1. Banco de Dados com Prisma
Renomeie o arquivo `.env.example` para `.env` e preencha a string de conexão no formato padrão PostgreSQL:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/caronacash?schema=public"
JWT_SECRET="chave_secreta_super_forte_para_tokens_jwt"
```

Instale as dependências de banco de dados e faça persistência da modelagem utilizando as migrations do Prisma:
```bash
# Navegar até o diretório correspondente
cd database

# Instalar Prisma CLI
npm install

# Rodar migrações do banco de dados PostgreSQL
npx prisma migrate dev --name init

# Gerar o Prisma Cliente
npx prisma generate
```

### 2. Rodar o Backend API REST + Socket.IO
```bash
# Navegar ao diretório do backend
cd backend

# Instalar as dependências do servidor Node.js
npm install

# Subir em ambiente de homologação (com nodemon)
npm run dev
```
O servidor por padrão começará a escutar requisições de transporte na porta `3001`!

### 3. Rodar o Frontend (React + Vite)
```bash
# Na raiz do projeto / ou pasta de frontend
npm install

# Subir servidor front dev
npm run dev
```
Abra o navegador no endereço correspondente fornecido pelo terminal (`http://localhost:3000`) para ver e interagir com o protótipo!

---

## ☁️ COMO HOSPEDAR E CONFIGURAR NA HOSTINGER

A Hostinger disponibiliza o painel **hPanel** com suporte a VPS Node.js. Siga os passos sequenciais para rodar o Carona Cash com máxima estabilidade de rede:

### PASSO 1: Configurar Banco de Dados PostgreSQL no hPanel
1. Acesse o seu painel de controle da **Hostinger (hPanel)**.
2. Navegue no menu lateral em **Banco de Dados** -> **Bancos de dados PostgreSQL**.
3. Crie um novo banco preenchendo os campos:
   - **Nome do Banco**: ex: `u547209123_caronacash`
   - **Nome de Usuário**: ex: `u547209123_caronash_user`
   - **Senha Forte**: Defina e salve com cópia de segurança a senha escolhida.
4. Clique em **Criar**! Guarde as credenciais que formam sua `DATABASE_URL`.

### PASSO 2: Configurar o Servidor Node.js
Se você contratou o serviço de hospedagem dedicada em VPS Node.js na Hostinger:
1. No painel de login **VPS**, selecione a sua instância VPS com OS template **Ubuntu 22.04 LTS com Node.js pré-instalado**.
2. Acesse via terminal seguro **SSH** a sua VPS utilizando as credenciais fornecidas pela Hostinger:
   ```bash
   ssh root@seu_ip_da_vps
   ```
3. Crie a pasta do software Carona Cash e configure o código de produção clonando o repositório ou fazendo o upload do pacote `.zip` extraído:
   ```bash
   mkdir -p /home/caronacash
   cd /home/caronacash
   ```

### PASSO 3: Enviando Código e Configurando Variáveis de Ambiente
1. Com os arquivos do aplicativo carregados no servidor por SSH ou SFTP File explorer, crie o arquivo `.env` na raiz do backend:
   ```bash
   nano /home/caronacash/backend/.env
   ```
2. Adicione os seguintes parâmetros ajustados:
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL="postgresql://u547209123_caronash_user:sua_senha_secreta_criada@localhost:5432/u547209123_caronacash?schema=public"
   JWT_SECRET="sua_chave_personalizada_carona_cash_jwt"
   APP_URL="https://seu-dominio-caronacash.com"
   ```

### PASSO 4: Iniciar Serviços com PM2 (Process Manager)
O pacote de VPS Node da Hostinger vem equipado com `pm2` para monitorar processos de forma ininterrupta em background:
```bash
# Entrar no diretório do backend de produção
cd /home/caronacash/backend

# Instalar dependências de produção
npm install --omit=dev

# Sincronizar Prisma diretamente na nuvem Hostinger
npx prisma db push

# Iniciar backend no PM2
pm2 start index.js --name "caronacash-backend"

# Garantir reinicialização automática do processo caso a VPS caia ou sofra reboot
pm2 save
pm2 startup
```

### PASSO 5: Configurando o Servidor Web Nginx como Reverse Proxy
Para responder ao tráfego HTTP seguro nas portas padrão `80` ou `443`, configuramos o Nginx para redirecionar as requisições até o Node.js que escuta na porta `3001`:

1. Instale o Nginx na máquina VPS:
   ```bash
   apt update
   apt install nginx -y
   ```
2. Crie e edite as regras de proxy reverso do Carona Cash:
   ```bash
   nano /etc/nginx/sites-available/caronacash
   ```
3. Cole as configurações baseados no seu domínio principal:
   ```nginx
   server {
       listen 80;
       server_name seu-dominio-caronacash.com www.seu-dominio-caronacash.com;

       location / {
           proxy_pass http://localhost:3000; # Porta onde o Frontend roda
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:3001; # Porta onde o Backend Node.js roda
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /socket.io {
           proxy_pass http://localhost:3001; # Trânsito de localização real-time WebSockets
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "Upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
4. Linkar arquivo e reiniciar servidor Nginx:
   ```bash
   ln -s /etc/nginx/sites-available/caronacash /etc/nginx/sites-enabled/
   systemctl restart nginx
   ```

### PASSO 6: Instalando Certificado Digital SSL gratuito (HTTPS)
Ative a segurança criptografada para proteger transações de cadastros dos cartões e comprovantes:
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d seu-dominio-caronacash.com -d www.seu-dominio-caronacash.com
```
Selecione a opção de redirecionar automaticamente todo o tráfego HTTP para HTTPS!

---

Pronto! Sua plataforma **Carona Cash** está instalada, segura e 100% pronta para escalar nacionalmente, oferecendo mobilidade acessível e renda profissional para seus motoristas! 🚀
