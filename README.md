# 🍽️ QRenu API

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green.svg" alt="Node.js Version" />
  <img src="https://img.shields.io/badge/NestJS-10+-red.svg" alt="NestJS Version" />
  <img src="https://img.shields.io/badge/TypeScript-5+-blue.svg" alt="TypeScript Version" />
  <img src="https://img.shields.io/badge/PostgreSQL-15+-blue.svg" alt="PostgreSQL Version" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" />
</p>

<p align="center">
  <strong>QR Menü Sistemi için RESTful API</strong><br>
  Restoranlar için QR kod tabanlı dijital menü yönetim sistemi
</p>

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Kurulum](#-kurulum)
- [Konfigürasyon](#-konfigürasyon)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Kimlik Doğrulama](#-kimlik-doğrulama)
- [Endpoint'ler](#-endpointler)
- [Rate Limiting](#-rate-limiting)
- [Cache Sistemi](#-cache-sistemi)
- [Logging](#-logging)
- [Health Check](#-health-check)
- [Geliştirme](#-geliştirme)
- [Test](#-test)
- [Deployment](#-deployment)

## 🚀 Özellikler

### 🔐 Kimlik Doğrulama & Güvenlik
- **JWT Token** tabanlı kimlik doğrulama
- **Email doğrulama** sistemi
- **Şifre sıfırlama** akışı
- **Rate limiting** koruması
- **CORS** desteği

### 🏪 Restoran Yönetimi
- **Restoran oluşturma** ve yönetimi
- **Subdomain** sistemi (örn: `lezzet-duragi.qrenu.com`)
- **Kategori** yönetimi
- **Ürün** yönetimi
- **Paket bazlı** limitler (Free, Basic, Premium)

### 📊 Analitik Sistemi
- **QR kod tarama** istatistikleri
- **Favori ürün** analizi
- **Oturum** takibi
- **Gerçek zamanlı** metrikler
- **Detaylı raporlama**

### 💬 Geri Bildirim Sistemi
- **Yıldız değerlendirme** (1-5 yıldız)
- **Geri bildirim türleri** (Olumlu, Olumsuz, Öneri)
- **İsteğe bağlı mesaj** ve email
- **İstatistik** ve analiz

### ⚡ Performans & Monitoring
- **Redis Cache** sistemi
- **Winston Logging** sistemi
- **Health Check** endpoints
- **Otomatik log** rotasyonu
- **Error tracking**

## 🛠 Teknoloji Stack

- **Framework**: NestJS 10+
- **Language**: TypeScript 5+
- **Database**: PostgreSQL 15+
- **ORM**: MikroORM
- **Cache**: Redis / Memory Cache
- **Authentication**: JWT
- **Email**: MailerSend API
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Validation**: class-validator

## 🔧 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 15+
- Redis (opsiyonel)

### 1. Repository'yi klonlayın
```bash
git clone <repository-url>
cd qrenuapi
```

### 2. Bağımlılıkları yükleyin
```bash
npm install
```

### 3. Environment dosyasını oluşturun
```bash
cp .env.example .env
```

### 4. Veritabanını kurun
```bash
# PostgreSQL veritabanı oluşturun
createdb qrenu_api

# Migration'ları çalıştırın
npm run migration:run
```

### 5. Uygulamayı başlatın
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## ⚙️ Konfigürasyon

### Environment Variables (.env)

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qrenu_api
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Email (MailerSend)
SMTP_TOKEN=your_mailersend_token
SMTP_FROM_EMAIL=noreply@qrenu.com
SMTP_FROM_NAME=QRenu

# Base URL
BASE_URL=qrenu.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5
AUTH_RATE_LIMIT_WINDOW_MS=900000
FEEDBACK_RATE_LIMIT_MAX_REQUESTS=10
FEEDBACK_RATE_LIMIT_WINDOW_MS=86400000
ANALYTICS_RATE_LIMIT_MAX_REQUESTS=100
ANALYTICS_RATE_LIMIT_WINDOW_MS=3600000

# Redis Cache (Opsiyonel)
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
CACHE_MAX_ITEMS=1000

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

## 📚 API Dokümantasyonu

### Swagger UI
Uygulama çalıştıktan sonra Swagger UI'ya erişin:
```
http://localhost:3001/api
```

### Base URL
```
http://localhost:3001
```

## 🔐 Kimlik Doğrulama

### JWT Token
Tüm korumalı endpoint'ler için `Authorization` header'ında JWT token gereklidir:

```bash
Authorization: Bearer <your_jwt_token>
```

### Token Süresi
- **Süre**: 24 saat
- **Format**: JWT
- **Payload**: `{ userId: number, email: string }`

## 📡 Endpoint'ler

### 🔐 Authentication (`/auth`)
```bash
POST   /auth/register          # Kullanıcı kaydı
POST   /auth/login             # Kullanıcı girişi
GET    /auth/profile           # Profil bilgileri
PUT    /auth/profile           # Profil güncelleme
DELETE /auth/account            # Hesap silme
POST   /auth/logout            # Çıkış yapma
```

### 📧 Email Verification (`/email-verification`)
```bash
POST   /email-verification/send     # Doğrulama emaili gönder
POST   /email-verification/verify   # Email doğrula
```

### 🔑 Password Reset (`/password-reset`)
```bash
POST   /password-reset/send     # Sıfırlama emaili gönder
POST   /password-reset/reset    # Şifre sıfırla
```

### 🏪 Restaurants (`/restaurants`)
```bash
GET    /restaurants                    # Kullanıcının restoranları
POST   /restaurants                    # Yeni restoran oluştur
GET    /restaurants/:id                # Restoran detayı (Public)
PUT    /restaurants/:id                # Restoran güncelle
DELETE /restaurants/:id                # Restoran sil
GET    /restaurants/check-subdomain/:subdomain  # Subdomain kontrolü
```

### 📂 Categories (`/restaurants/:restaurantId/categories`)
```bash
GET    /restaurants/:restaurantId/categories           # Kategorileri listele
POST   /restaurants/:restaurantId/categories           # Yeni kategori oluştur
GET    /restaurants/:restaurantId/categories/:id       # Kategori detayı (Public)
PUT    /restaurants/:restaurantId/categories/:id       # Kategori güncelle
DELETE /restaurants/:restaurantId/categories/:id       # Kategori sil
```

### 🍕 Products (`/restaurants/:restaurantId/categories/:categoryId/products`)
```bash
GET    /restaurants/:restaurantId/categories/:categoryId/products           # Ürünleri listele
POST   /restaurants/:restaurantId/categories/:categoryId/products           # Yeni ürün oluştur
GET    /restaurants/:restaurantId/categories/:categoryId/products/:id        # Ürün detayı (Public)
PUT    /restaurants/:restaurantId/categories/:categoryId/products/:id        # Ürün güncelle
DELETE /restaurants/:restaurantId/categories/:categoryId/products/:id        # Ürün sil
```

### 💳 Subscription (`/subscription`)
```bash
GET    /subscription/packages    # Paketleri listele (Public)
GET    /subscription/current     # Mevcut paket (Owner only)
POST   /subscription/upgrade     # Paket yükselt (Owner only)
```

### 📊 Analytics (`/analytics`)
```bash
POST   /analytics/restaurants/:restaurantId/qr-scan     # QR tarama kaydı (Public)
POST   /analytics/restaurants/:restaurantId/favorite     # Favori kaydı (Public)
POST   /analytics/restaurants/:restaurantId/session     # Oturum kaydı (Public)
GET    /analytics/restaurants/:restaurantId              # İstatistikler (Owner only)
```

### 💬 Feedback (`/feedback`)
```bash
POST   /feedback                                    # Geri bildirim oluştur (Public)
GET    /feedback/restaurants/:restaurantId          # Geri bildirimleri listele (Owner only)
GET    /feedback/restaurants/:restaurantId/stats    # Geri bildirim istatistikleri (Owner only)
```

### 🏥 Health Check (`/health`)
```bash
GET    /health              # Sistem sağlık durumu
GET    /health/database     # Veritabanı bağlantı durumu
```

## 🚦 Rate Limiting

### Global Rate Limiting
- **Limit**: 100 istek / 15 dakika
- **Uygulama**: Tüm endpoint'ler

### Endpoint-Specific Rate Limiting
- **Auth endpoints**: 5 istek / 15 dakika
- **Feedback endpoints**: 10 istek / 24 saat
- **Analytics endpoints**: 100 istek / 1 saat

### Rate Limit Response
```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "Too Many Requests"
}
```

## 💾 Cache Sistemi

### Cache Stratejisi
- **Redis**: Primary cache (production)
- **Memory**: Fallback cache (development)
- **TTL**: 1 saat (varsayılan)

### Cache'lenen Endpoint'ler
- Restoran detayları
- Subdomain kontrolü
- Analitik verileri
- Health check sonuçları

### Cache Key Formatları
```
restaurant::id
subdomain:check::subdomain
analytics::restaurantId::period
health:check
health:database
```

## 📝 Logging

### Log Dosyaları
- `logs/error.log` - Hata logları
- `logs/combined.log` - Tüm loglar
- `logs/exceptions.log` - Exception logları
- `logs/rejections.log` - Rejection logları

### Log Seviyeleri
- **error**: Hatalar
- **warn**: Uyarılar
- **info**: Bilgi mesajları
- **debug**: Debug mesajları
- **verbose**: Detaylı mesajlar

### Log Rotation
- **Max Size**: 5MB
- **Max Files**: 5
- **Otomatik**: Evet

## 🏥 Health Check

### Sistem Sağlık Durumu
```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-09-21T09:23:49.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "development",
  "memory": { ... },
  "pid": 420280,
  "platform": "win32",
  "nodeVersion": "v18.17.0"
}
```

### Veritabanı Sağlık Durumu
```bash
GET /health/database
```

Response:
```json
{
  "status": "ok",
  "database": "connected",
  "responseTime": "5ms",
  "activeConnections": 5,
  "driver": "postgresql",
  "timestamp": "2025-09-21T09:23:49.000Z"
}
```

## 🚀 Geliştirme

### Development Mode
```bash
npm run start:dev
```

### Build
```bash
npm run build
```

### Migration'lar
```bash
# Migration oluştur
npm run migration:create

# Migration çalıştır
npm run migration:run

# Migration geri al
npm run migration:revert
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## 🧪 Test

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Environment Variables
Production için gerekli environment variables:
- Database connection
- JWT secret
- Email service credentials
- Redis connection (opsiyonel)

### Docker (Gelecek)
```bash
# Dockerfile mevcut değil, gelecek sürümde eklenecek
```

## 📋 Paket Sistemi

### Free Package
- **Restoran**: 1
- **Kategori**: 5
- **Ürün**: 20
- **Süre**: Sınırsız
- **Analitik**: ❌

### Basic Package
- **Restoran**: 1
- **Kategori**: Sınırsız
- **Ürün**: Sınırsız
- **Süre**: 1 yıl
- **Fiyat**: 1200 TL
- **Analitik**: ✅

### Premium Package
- **Restoran**: Sınırsız
- **Kategori**: Sınırsız
- **Ürün**: Sınırsız
- **Süre**: 1 yıl
- **Fiyat**: 4000 TL
- **Analitik**: ✅

## 🔒 Güvenlik

### Email Doğrulama
- Yeni kullanıcılar email doğrulaması yapmalı
- Doğrulanmamış kullanıcılar restoran oluşturamaz
- Doğrulanmamış kullanıcılar paket yükseltemez

### Rate Limiting
- IP bazlı rate limiting
- Endpoint-specific limits
- Otomatik reset

### CORS
- Güvenli cross-origin requests
- Configurable origins

## 📞 Destek

### API Dokümantasyonu
- Swagger UI: `http://localhost:3001/api`
- OpenAPI spec: `http://localhost:3001/api-json`

### Log Dosyaları
- Hata durumunda log dosyalarını kontrol edin
- `logs/` klasöründe detaylı loglar

### Health Check
- Sistem durumu: `GET /health`
- Veritabanı durumu: `GET /health/database`

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**QRenu API** - QR Menü Sistemi için RESTful API 🍽️