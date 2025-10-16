# Define variables for docker
DOCKER_COMPOSE_DEV = docker compose -f docker-compose.yml
ENV_FILE_DEV = --env-file .env.dev

#-- Docker compose dev
start-local-build: ## Docker Compose start for dev environment
	$(DOCKER_COMPOSE_DEV) $(ENV_FILE_DEV) up --build -d