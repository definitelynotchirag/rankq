.PHONY: build run dev test clean docker-up docker-down docker-build docker-logs docker-seed docker-restart

build:
	go build -o bin/api cmd/api/main.go

run: build
	./bin/api

dev:
	go run cmd/api/main.go

test:
	go test -v ./...

clean:
	rm -rf bin/

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-logs-api:
	docker-compose logs -f api

docker-seed:
	docker-compose --profile seed up seed

docker-restart:
	docker-compose down && docker-compose up -d

docker-clean:
	docker-compose down -v --rmi local

seed:
	go run cmd/seed/main.go
