# Variables
NODE_DIR=api-node
REACT_DIR=client-react

.PHONY: install test build docker-up clean help

init-db:
	@echo "Initialisation de la base de données SQLite..."
	cd api-node && node src/database/migrate.js

install:
	@echo "Installation des dépendances..."
	cd $(NODE_DIR) && npm install
	cd $(REACT_DIR) && npm install
	$(MAKE) init-db

test:
	@echo "Lancement des tests..."
	cd $(NODE_DIR) && npm test

build:
	@echo "Compilation du projet..."
	cd $(REACT_DIR) && npm run build
	@echo "Build terminé avec succès."

docker-up:
	docker-compose up --build

clean:
	@echo "Nettoyage..."
	rm -rf $(REACT_DIR)/dist
	docker-compose down