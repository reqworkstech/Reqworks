# Reqworks Deployment & Hosting Guide

This guide provides step-by-step instructions for deploying the Reqworks web application (React frontend & Node.js backend) and hosting it at **`www.reqworks.in`** using GoDaddy.

---

## 🏗️ Architecture Overview

- **Frontend**: React + Vite (static files, proxied in dev, routed via Nginx in production).
- **Backend**: Node.js + Express API server running on port `5000` (or `PORT` env variable).
- **Database**: MongoDB (Local or MongoDB Atlas cloud database).
- **Domain & Hosting**: GoDaddy for domain DNS and VPS (recommended for MERN stack) or cPanel.

---

## 🔒 1. Environment Configurations

Create `.env` files for both components. These files are listed in `.gitignore` and **must never be committed to Git**.

### Backend Environment Configuration
Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database (Replace with your actual MongoDB connection string)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/reqworks?retryWrites=true&w=majority

# JWT Token Secret (Change to a long random secret key)
JWT_SECRET=your_super_secret_key_at_least_32_characters_long
JWT_EXPIRE=7d

# Nodemailer / Resend SMTP Setup
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=465
EMAIL_USER=resend
EMAIL_PASS=re_your_api_key
EMAIL_FROM=noreply@reqworks.in
EMAIL_FROM_NAME="Reqworks Support"

# Admin Setup (To seed initial credentials)
ADMIN_EMAIL=admin@reqworks.in
ADMIN_PASSWORD=SuperSecureAdminPass123!

# Frontend Client URL (For CORS and reset links)
CLIENT_URL=https://www.reqworks.in
```

### Frontend Environment Configuration
The frontend application uses relative paths `/api/...` for backend communication. 
- In **development**, Vite proxies `/api` requests to `http://localhost:5000` (configured in [vite.config.js](file:///c:/Users/Moksh/Desktop/Queue/frontend/vite.config.js)).
- In **production**, Nginx routes `/api` directly to the Express backend. Therefore, no hardcoded base URL is needed in the frontend code.

---

## ⚙️ 2. Step-by-Step Setup

### Step A: Backend Setup
1. SSH into your GoDaddy Linux VPS (Ubuntu server recommended).
2. Install Node.js (v18+) and Git:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   ```
3. Clone the repository into `/var/www/reqworks`:
   ```bash
   sudo git clone https://github.com/reqworkstech/Reqworks.git /var/www/reqworks
   cd /var/www/reqworks/backend
   ```
4. Install backend dependencies:
   ```bash
   npm install --production
   ```
5. Configure the `.env` file inside `backend/` (as described in section 1 above).
6. (Optional) Run the database seeding scripts:
   ```bash
   # Run this to seed the initial Admin credentials
   node scripts/seedAdmin.js
   
   # Or run this to completely clean and seed the database with admin setup
   node scripts/seedData.js
   ```
7. Start the backend using **PM2** (Process Manager for Node.js) to keep it running in the background:
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name "reqworks-backend"
   pm2 save
   pm2 startup
   ```

### Step B: Frontend Build & Setup
1. Navigate to the frontend directory:
   ```bash
   cd /var/www/reqworks/frontend
   ```
2. Install dependencies and compile the production build:
   ```bash
   npm install
   npm run build
   ```
3. This creates a `dist/` directory inside `frontend/` containing highly optimized static HTML, CSS, and JS assets.

---

## 🌐 3. Nginx Server & Reverse Proxy Configuration

Install Nginx to act as the web server for the React app and reverse proxy for the Node.js API:
```bash
sudo apt-get install -y nginx
```

Create a new configuration block for Reqworks:
```bash
sudo nano /etc/nginx/sites-available/reqworks
```

Add the following Nginx server block configuration:
```nginx
server {
    listen 80;
    server_name reqworks.in www.reqworks.in;

    # React Frontend Static Build Assets
    location / {
        root /var/www/reqworks/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Reverse Proxy for Express Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/reqworks /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default config if present
sudo nginx -t                             # Test configuration
sudo systemctl restart nginx
```

---

## 🌐 4. Pointing Your GoDaddy Domain

To route your GoDaddy domain (`www.reqworks.in`) to the VPS:

1. Log in to your **GoDaddy Control Panel**.
2. Navigate to **My Products** -> **Domains** -> Select **reqworks.in** -> Click **Manage DNS**.
3. Under the **DNS Records** table, add or edit the following records:
   - **Type A**:
     - **Name**: `@`
     - **Value**: `YOUR_VPS_PUBLIC_IP_ADDRESS` (e.g., `192.0.2.1`)
     - **TTL**: `1 Hour` (or Default)
   - **CNAME**:
     - **Name**: `www`
     - **Value**: `@`
     - **TTL**: `1 Hour` (or Default)
4. Save DNS records. *Note: DNS propagation can take anywhere from a few minutes up to 48 hours to complete globally.*

---

## 🔒 5. Installing Free SSL (HTTPS)

Secure the connection for `reqworks.in` and `www.reqworks.in` using Let's Encrypt Certbot:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d reqworks.in -d www.reqworks.in
```
Follow the interactive prompts to generate the SSL certificates. Certbot will automatically configure Nginx to use SSL and redirect all HTTP traffic to HTTPS.
