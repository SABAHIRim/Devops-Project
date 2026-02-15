# Makefile (Windows + GitHub Actions friendly)
# - install deps (backend + frontend)
# - init/migrate SQLite DB
# - run tests + coverage
# - build React frontend
# - docker up/down (works even if docker path has spaces)
# - ci target = full pipeline locally (and can be used in GitHub Actions)

SHELL := /bin/sh

.PHONY: install init-db migrate test build-frontend docker-up docker-down ci

# --- Paths ---
API_DIR := api-node
FRONT_DIR := client-react

# --- Docker executable (Windows + Linux) ---
# If docker is in PATH, this will work.
# If make can't find docker on Windows, set DOCKER_EXE to the full path of docker.exe.
DOCKER_EXE ?= docker

install:
	@echo "Installation des dépendances..."
	cd $(API_DIR) && npm install
	cd $(FRONT_DIR) && npm install

init-db:
	@echo "Initialisation de la base de données SQLite..."
	cd $(API_DIR) && node src/database/migrate.js

migrate: init-db

test:
	@echo "Lancement des tests..."
	cd $(API_DIR) && npm test

build-frontend:
	@echo "Build Frontend..."
	cd $(FRONT_DIR) && npm run build

docker-up:
	@echo "Docker up..."
	"$(DOCKER_EXE)" compose up --build -d

docker-down:
	@echo "Docker down..."
	"$(DOCKER_EXE)" compose down -v

# Full local pipeline (same idea as CI)
ci: install init-db test build-frontend
	@echo " CI local terminé avec succès"
