# QRenu API Docker Kurulumu

Bu dokümantasyon QRenu API projesinin Docker ile nasıl çalıştırılacağını açıklar.

## Gereksinimler

- Docker (v20.10+)
- Docker Compose (v2.0+)
- Make (opsiyonel, kolaylık için)

## Hızlı Başlangıç

### Development Ortamı

1. **Environment dosyasını oluşturun:**
   ```bash
   cp env.example .env
   ```

2. **Development ortamını başlatın:**
   ```bash
   make dev
   # veya
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Uygulama erişim bilgileri:**
   - API: http://localhost:3003
   - Swagger UI: http://localhost:3003/api
   - PostgreSQL: localhost:5433
   - Redis: localhost:6380

### Production Ortamı

1. **Environment dosyasını düzenleyin:**
   ```bash
   cp env.example .env
   # .env dosyasını production değerleri ile düzenleyin
   ```

2. **Production ortamını başlatın:**
   ```bash
   make prod
   # veya
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Docker Compose Dosyaları

### Development (`docker-compose.dev.yml`)
- Hot reload desteği
- Volume mounting
- Development database
- Debug modu

### Production (`docker-compose.prod.yml`)
- Optimized build
- Nginx reverse proxy
- Health checks
- Production database
- SSL desteği

## Komutlar

### Make Komutları

```bash
# Development
make dev          # Development ortamını başlat
make dev-build    # Development image'larını build et
make dev-down     # Development ortamını durdur
make dev-logs     # Development loglarını göster

# Production
make prod         # Production ortamını başlat
make prod-build   # Production image'larını build et
make prod-down    # Production ortamını durdur
make prod-logs    # Production loglarını göster

# Utility
make build        # Tüm image'ları build et
make clean        # Container'ları ve volume'ları temizle
make migrate      # Database migration'larını çalıştır
```

### Docker Compose Komutları

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml logs -f

# Production
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml logs -f
```

## Servisler

### QRenu API (`app`)
- **Port:** 3003
- **Environment:** Development/Production
- **Dependencies:** PostgreSQL, Redis

### PostgreSQL (`postgres`)
- **Port:** 5433
- **Database:** qrenuapi
- **User:** postgres
- **Password:** postgres123 (dev) / ${DB_PASSWORD} (prod)

### Redis (`redis`)
- **Port:** 6380
- **Purpose:** Cache ve session storage

### Nginx (`nginx`) - Sadece Production
- **Port:** 80, 443
- **Purpose:** Reverse proxy, SSL termination, static file serving

## Environment Variables

### Gerekli Değişkenler

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=qrenuapi

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Email
MAILERSEND_API_KEY=your-api-key
MAILERSEND_FROM_EMAIL=noreply@qrenu.com
MAILERSEND_FROM_NAME=QRenu
```

## Database Migration

```bash
# Migration oluştur
make migrate-create

# Migration'ları çalıştır
make migrate

# Migration'ları geri al
make migrate-down
```

## Loglar

```bash
# Tüm servislerin logları
make logs

# Sadece app logları
docker-compose logs -f app

# Sadece database logları
docker-compose logs -f postgres
```

## Troubleshooting

### Port Çakışması
Eğer portlar kullanımda ise, docker-compose dosyalarında port numaralarını değiştirin.

### Permission Hatası
```bash
sudo chown -R $USER:$USER .
```

### Volume Temizleme
```bash
make clean
```

### Database Reset
```bash
docker-compose down -v
docker volume prune
make dev
```

## Production Deployment

### SSL Sertifikası
1. SSL sertifikalarınızı `ssl/` klasörüne koyun
2. `nginx.conf` dosyasında HTTPS server bloğunu aktif edin
3. Domain adresinizi güncelleyin

### Environment Security
- Production'da güçlü şifreler kullanın
- JWT secret'ı güvenli tutun
- Database şifrelerini güvenli saklayın

### Monitoring
- Health check endpoint'leri mevcuttur
- Log dosyaları `logs/` klasöründe saklanır
- Nginx access/error logları takip edilebilir

## Geliştirme Notları

- Development modunda hot reload aktif
- Volume mounting ile kod değişiklikleri anında yansır
- Production build optimized ve minified
- Health checks tüm servislerde mevcut
- Rate limiting Nginx seviyesinde uygulanır
