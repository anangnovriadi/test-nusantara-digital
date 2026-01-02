# Deployment Guide - Ubuntu Server (Port 4001 & 4002)

Panduan deploy Employee Management System ke Ubuntu server dengan custom ports.

**Port Configuration:**
- Backend API: **4001**
- Frontend: **4002**
- Akses via IP: **http://YOUR_SERVER_IP**

## Prerequisites di Server

- ✅ Ubuntu Server (18.04+ / 20.04+ / 22.04+)
- ✅ MySQL 8.x
- ✅ Node.js 18.x+
- ❌ Redis (akan diinstall)
- ❌ PM2 (akan diinstall)
- ❌ Nginx (opsional, untuk reverse proxy)

## 1. Persiapan Server

### A. Install Redis

```bash
sudo apt update
sudo apt install redis-server -y

# Configure Redis untuk auto-start
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Verify
redis-cli ping
# Response: PONG
```

### B. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Setup PM2 untuk auto-start saat reboot
pm2 startup
# Jalankan command yang diminta PM2
```

## 2. Setup Database

```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE db_employee;

# Buat user khusus (optional, lebih aman)
CREATE USER 'employee_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON db_employee.* TO 'employee_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 3. Upload Project ke Server

```bash
# Clone repository
cd /var/www
sudo git clone <your-repository-url> employee-management
cd employee-management

# Set ownership
sudo chown -R $USER:$USER /var/www/employee-management
```

## 4. Deploy Backend (Port 4001)

```bash
cd /var/www/employee-management/employee-api

# Install dependencies
npm install --production

# Setup environment
cp .env.example .env
nano .env
```

**Edit `.env` untuk production:**

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=employee_user  # atau root
DB_PASSWORD=your_strong_password
DB_NAME=db_employee

# JWT
JWT_SECRET=your_very_secure_random_string_here_change_this
JWT_EXPIRES_IN=1d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Node Environment
NODE_ENV=production
```

**Run seeder:**

```bash
npx ts-node src/database/seeds/user.seed.ts
```

**Build backend:**

```bash
npm run build
```

**Start dengan PM2 di port 4001:**

```bash
pm2 start dist/main.js --name employee-api

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs employee-api
```

## 5. Deploy Frontend (Port 4002)

```bash
cd /var/www/employee-management/employee-fe

# Install dependencies
npm install --production

# Setup environment
cp .env.example .env
nano .env
```

**Edit `.env` (ganti YOUR_SERVER_IP dengan IP server Anda):**

```env
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:4001/api
```

**Contoh (jika IP server 103.23.45.67):**
```env
NEXT_PUBLIC_API_URL=http://103.23.45.67:4001/api
```

**Build frontend:**

```bash
npm run build
```

**Start dengan PM2 di port 4002:**

```bash
pm2 start npm --name employee-fe -- start

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs employee-fe
```

## 6. Firewall Configuration

```bash
# Allow port 4001 (Backend)
sudo ufw allow 4001/tcp

# Allow port 4002 (Frontend)
sudo ufw allow 4002/tcp

# Allow SSH (jika belum)
sudo ufw allow OpenSSH

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## 7. Verification & Testing

### A. Check Services

```bash
# PM2 processes
pm2 status

# Backend logs
pm2 logs employee-api --lines 50

# Frontend logs
pm2 logs employee-fe --lines 50

# Redis
redis-cli ping

# MySQL
mysql -u root -p -e "SHOW DATABASES;"
```

### B. Test API

```bash
# Test dari server
curl http://localhost:4001/api

# Test dari luar (ganti dengan IP server Anda)
curl http://YOUR_SERVER_IP:4001/api
```

### C. Access Application

**Dari browser:**
```
Frontend: http://YOUR_SERVER_IP:4002
Backend:  http://YOUR_SERVER_IP:4001/api
Swagger:  http://YOUR_SERVER_IP:4001/api/docs
```

## 8. Optional: Setup Nginx (Reverse Proxy)

Jika Anda ingin akses tanpa port (http://YOUR_SERVER_IP saja):

### A. Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### B. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/employee-management
```

**Paste konfigurasi ini:**

```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;  # Ganti dengan IP server Anda

    # API Routes
    location /api {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket untuk Socket.IO
    location /socket.io {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:4002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase upload size for CSV files
    client_max_body_size 50M;
}
```

### C. Enable Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/employee-management /etc/nginx/sites-enabled/

# Remove default config
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Allow Nginx di firewall
sudo ufw allow 'Nginx Full'
```

**Setelah setup Nginx, akses:**
```
http://YOUR_SERVER_IP  (tanpa port!)
```

## 9. Update Application

```bash
# Pull terbaru
cd /var/www/employee-management
git pull

# Update Backend
cd employee-api
npm install --production
npm run build
pm2 restart employee-api

# Update Frontend
cd ../employee-fe
npm install --production
npm run build
pm2 restart employee-fe
```

## 10. Monitoring

```bash
# Real-time monitoring
pm2 monit

# Logs semua service
pm2 logs

# Logs specific service
pm2 logs employee-api
pm2 logs employee-fe

# Restart services
pm2 restart all

# Restart specific service
pm2 restart employee-api
pm2 restart employee-fe
```

## 11. Troubleshooting

### Port sudah digunakan

```bash
# Check apa yang menggunakan port 4001
sudo lsof -i :4001

# Check apa yang menggunakan port 4002
sudo lsof -i :4002

# Kill process jika perlu
sudo kill -9 <PID>
```

### Backend tidak bisa diakses

```bash
# Check backend running
pm2 logs employee-api

# Check port 4001 listening
sudo netstat -tulpn | grep 4001

# Restart
pm2 restart employee-api
```

### Frontend tidak bisa diakses

```bash
# Check frontend running
pm2 logs employee-fe

# Check port 4002 listening
sudo netstat -tulpn | grep 4002

# Restart
pm2 restart employee-fe
```

### WebSocket tidak connect

```bash
# Check .env frontend
cat /var/www/employee-management/employee-fe/.env

# Pastikan pointing ke IP yang benar
# NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:4001/api

# Rebuild frontend
cd /var/www/employee-management/employee-fe
npm run build
pm2 restart employee-fe
```

## 12. Deployment Checklist

- [ ] Redis installed dan running
- [ ] PM2 installed
- [ ] Database created
- [ ] User seeded
- [ ] Backend .env configured dengan credentials DB
- [ ] Backend running di port 4001
- [ ] Frontend .env configured dengan IP server
- [ ] Frontend running di port 4002
- [ ] Firewall configured (port 4001, 4002, 22)
- [ ] PM2 saved dan startup configured
- [ ] Application diakses dari browser
- [ ] CSV import tested
- [ ] WebSocket connection tested

## 13. Quick Reference

### Ports
```
Backend:  4001
Frontend: 4002
MySQL:    3306
Redis:    6379
```

### URLs (ganti YOUR_SERVER_IP dengan IP server Anda)
```
Frontend:     http://YOUR_SERVER_IP:4002
API:          http://YOUR_SERVER_IP:4001/api
Swagger:      http://YOUR_SERVER_IP:4001/api/docs
With Nginx:   http://YOUR_SERVER_IP (port 80)
```

### PM2 Commands
```bash
pm2 status              # Status semua process
pm2 logs                # Logs semua process
pm2 logs employee-api   # Logs backend
pm2 logs employee-fe    # Logs frontend
pm2 restart all         # Restart semua
pm2 stop all            # Stop semua
pm2 delete all          # Delete semua
pm2 save                # Save current state
```

### Environment Files

**Backend (.env):**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=employee_user
DB_PASSWORD=strong_password
DB_NAME=db_employee
JWT_SECRET=very_secure_random_string
JWT_EXPIRES_IN=1d
REDIS_HOST=localhost
REDIS_PORT=6379
NODE_ENV=production
```

**Frontend (.env):**
```env
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:4001/api
```

---

**Tips:**
1. Ganti `YOUR_SERVER_IP` dengan IP server sebenarnya
2. Gunakan password yang kuat untuk database dan JWT
3. Setup backup otomatis untuk database
4. Monitor logs secara berkala
5. Update dependencies secara rutin

**Deployment Date:** _____________  
**Server IP:** _____________  
**Notes:** _____________
