GIT_VERSION:=$(shell git describe --tags --dirty --match 'v*' 2> /dev/null || echo dev-$(shell date -u +"%Y%m%d%H%M%S"))

.PHONY: help
help: ## display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

.PHONY: start
start: ## run locally using production backend
	@npx vite dev --mode development

.PHONY: start-local
start-local: ## run locally using local backend
	@npx vite dev --mode loc

.PHONY: docker-build
docker-build: ## compile with NPM and build docker images
	@npm run build
	@docker build -t andrewb57/queue-share-fe:latest .
	@docker build -t andrewb57/queue-share-fe:${GIT_VERSION} .

.PHONY: docker-push
docker-push: ## push image with :latest tag to repository
	@docker push andrewb57/queue-share-fe:latest
	# @docker push andrewb57/queue-share-fe:${GIT_VERSION}

.PHONY: docker-save
docker-save: ## save image with :latest tag to compressed file
	@docker save andrewb57/queue-share-fe:latest -o qs-fe.tar

.PHONY: docker-clean
docker-clean: ## stop running container and prune containers/images
	@docker stop queue-share-fe
	@docker image prune -y
	@docker container prune -y

.PHONY: check
check:
	@npm run lint
	@npm run format
