# QRenu API Docker Management Makefile

.PHONY: help dev prod build dev-build prod-build dev-up dev-down prod-up prod-down logs clean

# Default target
help:
	@echo "QRenu API Docker Management Commands:"
	@echo ""
	@echo "Development Commands:"
	@echo "  dev          - Start development environment"
	@echo "  dev-build    - Build development images"
	@echo "  dev-down     - Stop development environment"
	@echo "  dev-logs     - Show development logs"
	@echo ""
	@echo "Production Commands:"
	@echo "  prod         - Start production environment"
	@echo "  prod-build   - Build production images"
	@echo "  prod-down    - Stop production environment"
	@echo "  prod-logs    - Show production logs"
	@echo ""
	@echo "Utility Commands:"
	@echo "  build        - Build all images"
	@echo "  logs         - Show logs for all services"
	@echo "  clean        - Clean up containers and volumes"
	@echo "  migrate      - Run database migrations"
	@echo "  seed         - Run database seeders"

# Development commands
dev: dev-build
	docker-compose -f docker-compose.dev.yml up -d

dev-build:
	docker-compose -f docker-compose.dev.yml build

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Production commands
prod: prod-build
	docker-compose -f docker-compose.prod.yml up -d

prod-build:
	docker-compose -f docker-compose.prod.yml build

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

# Utility commands
build: dev-build prod-build

logs:
	docker-compose logs -f

clean:
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.prod.yml down -v
	docker system prune -f

# Database commands
migrate:
	docker-compose -f docker-compose.dev.yml exec app npm run migration:up

migrate-create:
	docker-compose -f docker-compose.dev.yml exec app npm run migration:create

migrate-down:
	docker-compose -f docker-compose.dev.yml exec app npm run migration:down

# Development with hot reload
dev-watch:
	docker-compose -f docker-compose.dev.yml up

# Production with nginx
prod-full:
	docker-compose -f docker-compose.prod.yml up -d

# Quick development setup
quick-dev:
	@echo "Setting up development environment..."
	cp env.example .env
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment is ready!"
	@echo "API: http://localhost:3001"
	@echo "Swagger: http://localhost:3001/api"


