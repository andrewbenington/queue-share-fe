GIT_VERSION:=$(shell git describe --tags --dirty --match 'v*' 2> /dev/null || echo dev-$(shell date -u +"%Y%m%d%H%M%S"))

.PHONY: start
start:
	@npx vite dev --mode development

.PHONY: docker-build
docker-build:
	@npm run build
	@docker build -t andrewb57/queue-share-fe:latest .
	@docker build -t andrewb57/queue-share-fe:${GIT_VERSION} .

.PHONY: docker-push
docker-push:
	@docker push andrewb57/queue-share-fe:latest
	@docker push andrewb57/queue-share-fe:${GIT_VERSION}

.PHONY: docker-save
docker-save:
	@docker save andrewb57/queue-share-fe:latest -o qs-fe.tar

.PHONY: docker-clean
docker-clean:
	@docker stop --all

.PHONY: check
check:
	@npm run lint
	@npm run format
