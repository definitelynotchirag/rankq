FROM golang:1.24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /api ./cmd/api/main.go
RUN CGO_ENABLED=0 GOOS=linux go build -o /seed ./cmd/seed/main.go

FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /api /app/api
COPY --from=builder /seed /app/seed

EXPOSE 8080

CMD ["/app/api"]
