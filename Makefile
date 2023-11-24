.PHONY: docker-build
docker-build:
	@docker build -t queue-share-fe:latest .

.PHONY: docker-push
docker-push:
	@docker push queue-share-fe:latest

.PHONY: docker-save
docker-save:
	@docker save queue-share-fe:latest -o qs-fe.tar

.PHONY: docker-clean
docker-clean:
	@docker stop --all

.PHONY: check
check:
	@npm run lint
	@npx tsc