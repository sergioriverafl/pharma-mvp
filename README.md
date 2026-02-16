# Estructura del Proyecto pharma-mvp
```
pharma-mvp/
├── web/                          # Frontend (Vue 3)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── api/                          # API REST (API Gateway + Lambda)
│   ├── src/
│   │   ├── handlers/
│   │   ├── services/
│   │   └── types/
│   ├── infrastructure/           # CDK para este servicio
│   │   └── lib/
│   │       └── api-stack.ts
│   ├── package.json
│   └── Dockerfile
│
├── scraper-ml/                   # Scraper MercadoLibre (EventBridge + Lambda)
│   ├── src/
│   │   ├── handler.ts
│   │   ├── scraper.ts
│   │   └── services/
│   ├── infrastructure/
│   │   └── lib/
│   │       └── scraper-stack.ts
│   ├── package.json
│   └── Dockerfile
│
├── scraper-amazon/               # Scraper Amazon
│   └── .gitkeep
│
├── scraper-facebook/             # Scraper Facebook
│   └── .gitkeep
│
├── ai-processor/                 # Procesador IA (SQS + Lambda/ECS)
│   ├── src/
│   │   ├── handler.ts
│   │   ├── providers/
│   │   └── services/
│   ├── infrastructure/
│   │   └── lib/
│   │       └── processor-stack.ts
│   ├── package.json
│   └── Dockerfile
│
├── shared/                       # Código compartido entre servicios
│   ├── types/
│   ├── utils/
│   └── package.json
│
├── infrastructure/               # Recursos compartidos (S3, DynamoDB, SQS)
│   └── shared/
│       ├── bin/
│       │   └── app.ts
│       └── lib/
│           ├── storage-stack.ts
│           ├── queues-stack.ts
│           └── network-stack.ts
│
├── docs/
├── scripts/
├── package.json                  # Root workspace
└── turbo.json
```
