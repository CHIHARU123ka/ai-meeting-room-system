# AI開発会議室アプリ システム設計書

## 1. 技術スタック選定と理由

### 1.1 フロントエンド技術スタック

#### 選定技術
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript 5.0+
- **状態管理**: Zustand + React Query (TanStack Query)
- **UIライブラリ**: Tailwind CSS + Headless UI
- **コンポーネント**: Radix UI + Lucide React
- **フォーム**: React Hook Form + Zod
- **テスト**: Jest + React Testing Library + Playwright
- **ビルドツール**: Turbopack
- **リンター**: ESLint + Prettier
- **型チェック**: TypeScript strict mode

#### 選定理由
- **Next.js 14**: SSR/SSG対応、優れたパフォーマンス、App Routerによる最新のルーティング機能
- **TypeScript**: 型安全性による開発効率向上、大規模開発での保守性
- **Zustand**: 軽量で直感的な状態管理、Reduxより学習コストが低い
- **React Query**: サーバー状態管理の最適化、キャッシュ機能、楽観的更新
- **Tailwind CSS**: 高速な開発、一貫したデザインシステム、カスタマイズ性
- **Radix UI**: アクセシビリティ対応、ヘッドレスコンポーネント
- **React Hook Form**: 高パフォーマンス、バリデーション統合
- **Playwright**: E2Eテストの安定性、クロスブラウザ対応

### 1.2 バックエンド技術スタック

#### 選定技術
- **ランタイム**: Node.js 20 LTS
- **フレームワーク**: Fastify 4.x
- **言語**: TypeScript 5.0+
- **ORM**: Prisma 5.x
- **データベース**: PostgreSQL 15
- **認証**: Passport.js + JWT
- **バリデーション**: Zod
- **API仕様**: OpenAPI 3.0 + Swagger
- **テスト**: Jest + Supertest
- **ログ**: Winston + Morgan
- **キャッシュ**: Redis 7.x
- **メッセージキュー**: Bull Queue (Redis)
- **ファイルストレージ**: AWS S3
- **監視**: Prometheus + Grafana

#### 選定理由
- **Fastify**: Express.jsより高速、TypeScript対応、プラグインエコシステム
- **Prisma**: 型安全なORM、マイグレーション管理、優れた開発体験
- **PostgreSQL**: ACID準拠、JSON対応、高い拡張性、エンタープライズ対応
- **Passport.js**: 豊富な認証戦略、SSO対応
- **Redis**: 高速キャッシュ、セッション管理、リアルタイム機能
- **Bull Queue**: 信頼性の高いジョブキュー、Redis基盤

### 1.3 AI・機械学習技術スタック

#### 選定技術
- **言語**: Python 3.11
- **フレームワーク**: FastAPI
- **機械学習**: scikit-learn + pandas + numpy
- **深層学習**: TensorFlow 2.x (必要に応じて)
- **データ処理**: Apache Airflow
- **モデル管理**: MLflow
- **推論サーバー**: TensorFlow Serving (必要に応じて)

#### 選定理由
- **Python**: AI/ML分野のデファクトスタンダード、豊富なライブラリ
- **FastAPI**: 高速、自動API文書生成、型ヒント対応
- **scikit-learn**: 豊富なアルゴリズム、安定性、学習コスト低
- **Airflow**: ワークフロー管理、スケジューリング、監視機能
- **MLflow**: 実験管理、モデルバージョニング、デプロイ管理

### 1.4 インフラ・DevOps技術スタック

#### 選定技術
- **クラウド**: AWS
- **コンテナ**: Docker + Docker Compose
- **オーケストレーション**: Amazon ECS Fargate
- **CI/CD**: GitHub Actions
- **IaC**: AWS CDK (TypeScript)
- **監視**: CloudWatch + X-Ray
- **ログ**: CloudWatch Logs + ELK Stack
- **セキュリティ**: AWS WAF + GuardDuty
- **CDN**: CloudFront
- **DNS**: Route 53

#### 選定理由
- **AWS**: 豊富なマネージドサービス、エンタープライズ対応、セキュリティ
- **ECS Fargate**: サーバーレスコンテナ、運用負荷軽減、スケーラビリティ
- **AWS CDK**: TypeScriptでIaC、型安全性、再利用性
- **GitHub Actions**: GitHubとの統合、豊富なアクション、コスト効率

## 2. システム構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet                                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────────┐
│                   CloudFront (CDN)                             │
│                 SSL Termination                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────────┐
│                Application Load Balancer                       │
│                    WAF Protection                              │
└─────────┬───────────────────────────────────┬───────────────────┘
          │                                   │
┌─────────┴─────────┐                ┌───────┴───────────────────┐
│   Frontend        │                │      Backend              │
│   (Next.js)       │                │     (Fastify)             │
│                   │                │                           │
│ ┌───────────────┐ │                │ ┌─────────────────────┐   │
│ │ Static Assets │ │                │ │   API Gateway       │   │
│ │ (S3 + CF)     │ │                │ │   Rate Limiting     │   │
│ └───────────────┘ │                │ └─────────────────────┘   │
│                   │                │                           │
│ ┌───────────────┐ │                │ ┌─────────────────────┐   │
│ │ PWA Service   │ │                │ │ Authentication      │   │
│ │ Worker        │ │                │ │ (Passport.js)       │   │
│ └───────────────┘ │                │ └─────────────────────┘   │
└─────────┬─────────┘                │                           │
          │                          │ ┌─────────────────────┐   │
          │                          │ │ Business Logic      │   │
          │                          │ │ - Reservation Mgmt  │   │
          │                          │ │ - Room Management   │   │
          │                          │ │ - User Management   │   │
          │                          │ └─────────────────────┘   │
          │                          │                           │
          │                          │ ┌─────────────────────┐   │
          │                          │ │ External Integrations│  │
          │                          │ │ - Calendar APIs     │   │
          │                          │ │ - Notification APIs │   │
          │                          │ │ - IoT Sensors       │   │
          │                          │ └─────────────────────┘   │
          │                          └─────────┬─────────────────┘
          │                                    │
          │            ┌───────────────────────┴───────────────────┐
          │            │              AI/ML Service               │
          │            │              (FastAPI)                  │
          │            │                                         │
          │            │ ┌─────────────────────────────────────┐ │
          │            │ │        Recommendation Engine        │ │
          │            │ │        - Room Suggestions           │ │
          │            │ │        - Time Optimization          │ │
          │            │ │        - Usage Pattern Analysis     │ │
          │            │ └─────────────────────────────────────┘ │
          │            │                                         │
          │            │ ┌─────────────────────────────────────┐ │
          │            │ │         Analytics Engine            │ │
          │            │ │         - Usage Statistics          │ │
          │            │ │         - Efficiency Scoring        │ │
          │            │ │         - Predictive Analytics      │ │
          │            │ └─────────────────────────────────────┘ │
          │            └─────────────┬───────────────────────────┘
          │                          │
┌─────────┴──────────────────────────┴───────────────────────────┐
│                    Data Layer                                  │
│                                                                │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│ │ PostgreSQL  │  │   Redis     │  │      Amazon S3          │ │
│ │ (Primary)   │  │  (Cache)    │  │   (File Storage)        │ │
│ │             │  │             │  │                         │ │
│ │ - Users     │  │ - Sessions  │  │ - Profile Images        │ │
│ │ - Rooms     │  │ - Cache     │  │ - Room Images           │ │
│ │ - Bookings  │  │ - Queues    │  │ - Reports               │ │
│ │ - Analytics │  │ - Real-time │  │ - Backups               │ │
│ └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │              Background Services                            │ │
│ │                                                             │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │ │
│ │ │ Notification│ │ Data Sync   │ │    ML Training          │ │ │
│ │ │ Service     │ │ Service     │ │    Pipeline             │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    External Services                           │
│                                                                │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐ │
│ │ Google      │ │ Microsoft   │ │        IoT Sensors          │ │
│ │ Calendar    │ │ Outlook     │ │                             │ │
│ │ API         │ │ API         │ │ - Occupancy Sensors         │ │
│ └─────────────┘ └─────────────┘ │ - Environmental Sensors     │ │
│                                 │ - Access Control Systems    │ │
│ ┌─────────────┐ ┌─────────────┐ └─────────────────────────────┘ │
│ │ Slack API   │ │ Teams API   │                               │
│ └─────────────┘ └─────────────┘                               │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                 Monitoring & Logging                           │
│                                                                │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐ │
│ │ CloudWatch  │ │ X-Ray       │ │        ELK Stack            │ │
│ │ Metrics     │ │ Tracing     │ │                             │ │
│ └─────────────┘ └─────────────┘ │ - Elasticsearch             │ │
│                                 │ - Logstash                  │ │
│ ┌─────────────┐ ┌─────────────┐ │ - Kibana                    │ │
│ │ Prometheus  │ │ Grafana     │ └─────────────────────────────┘ │
│ │ Metrics     │ │ Dashboard   │                               │
│ └─────────────┘ └─────────────┘                               │
└────────────────────────────────────────────────────────────────┘
```

## 3. ディレクトリ構造

### 3.1 フロントエンド構造

```
frontend/
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── .env.local
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── playwright.config.ts
├── jest.config.js
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── public/
│   ├── icons/
│   ├── images/
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── rooms/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── reservations/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (admin)/
│   │   │   ├── admin/
│   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── rooms/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   └── route.ts
│   │       ├── rooms/
│   │       │   └── route.ts
│   │       └── reservations/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── table.tsx
│   │   │   ├── form.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── navigation.tsx
│   │   │   └── breadcrumb.tsx
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── auth-guard.tsx
│   │   │   └── sso-buttons.tsx
│   │   ├── rooms/
│   │   │   ├── room-list.tsx
│   │   │   ├── room-card.tsx
│   │   │   ├── room-detail.tsx
│   │   │   ├── room-form.tsx
│   │   │   ├── room-search.tsx
│   │   │   ├── room-filter.tsx
│   │   │   └── room-map.tsx
│   │   ├── reservations/
│   │   │   ├── reservation-list.tsx
│   │   │   ├── reservation-card.tsx
│   │   │   ├── reservation-form.tsx
│   │   │   ├── reservation-calendar.tsx
│   │   │   ├── time-picker.tsx
│   │   │   └── participant-selector.tsx
│   │   ├── analytics/
│   │   │   ├── dashboard-stats.tsx
│   │   │   ├── usage-chart.tsx
│   │   │   ├── efficiency-chart.tsx
│   │   │   ├── report-generator.tsx
│   │   │   └── ai-insights.tsx
│   │   ├── admin/
│   │   │   ├── user-management.tsx
│   │   │   ├── room-management.tsx
│   │   │   ├── system-settings.tsx
│   │   │   └── audit-logs.tsx
│   │   └── common/
│   │       ├── search-bar.tsx
│   │       ├── pagination.tsx
│   │       ├── notification.tsx
│   │       ├── confirmation-dialog.tsx
│   │       └── data-table.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── rooms.ts
│   │   │   ├── reservations.ts
│   │   │   ├── users.ts
│   │   │   ├── analytics.ts
│   │   │   └── types.ts
│   │   ├── auth/
│   │   │   ├── config.ts
│   │   │   ├── providers.ts
│   │   │   ├── middleware.ts
│   │   │   └── utils.ts
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   ├── date.ts
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── constants.ts
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   ├── use-rooms.ts
│   │   │   ├── use-reservations.ts
│   │   │   ├── use-analytics.ts
│   │   │   ├── use-local-storage.ts
│   │   │   └── use-debounce.ts
│   │   ├── stores/
│   │   │   ├── auth-store.ts
│   │   │   ├── room-store.ts
│   │   │   ├── reservation-store.ts
│   │   │   ├── ui-store.ts
│   │   │   └── index.ts
│   │   ├── schemas/
│   │   │   ├── auth.ts
│   │   │   ├── room.ts
│   │   │   ├── reservation.ts
│   │   │   ├── user.ts
│   │   │   └── common.ts
│   │   └── config/
│   │       ├── database.ts
│   │       ├── env.ts
│   │       ├── constants.ts
│   │       └── features.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── utilities.css
│   └── types/
│       ├── auth.ts
│       ├── room.ts
│       ├── reservation.ts
│       ├── user.ts
│       ├── analytics.ts
│       ├── api.ts
│       └── global.d.ts
├── tests/
│   ├── __mocks__/
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── rooms.spec.ts
│   │   ├── reservations.spec.ts
│   │   └── admin.spec.ts
│   ├── integration/
│   │   ├── api.test.ts
│   │   ├── auth.test.ts
│   │   └── components.test.ts
│   ├── unit/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── stores/
│   └── fixtures/
│       ├── users.json
│       ├── rooms.json
│       └── reservations.json
├── docs/
│   ├── README.md
│   ├── DEPLOYMENT.md
│   ├── CONTRIBUTING.md
│   └── API.md
└── .github/
    └── workflows/
        ├── ci.yml
        ├── cd.yml
        └── security.yml
```

### 3.2 バックエンド構造

```
backend/
├── README.md
├── package.json
├── tsconfig.json
├── .env.example
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── jest.config.js
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seeds/
│   │   ├── users.ts
│   │   ├── rooms.ts
│   │   ├── departments.ts
│   │   └── index.ts
│   └── generated/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── auth.ts
│   │   ├── aws.ts
│   │   ├── logger.ts
│   │   ├── swagger.ts
│   │   └── env.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── rooms.controller.ts
│   │   ├── reservations.controller.ts
│   │   ├── analytics.controller.ts
│   │   ├── admin.controller.ts
│   │   └── health.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── rooms.service.ts
│   │   ├── reservations.service.ts
│   │   ├── analytics.service.ts
│   │   ├── notifications.service.ts
│   │   ├── calendar.service.ts
│   │   ├── ai.service.ts
│   │   ├── iot.service.ts
│   │   └── email.service.ts
│   ├── repositories/
│   │   ├── base.repository.ts
│   │   ├── users.repository.ts
│   │   ├── rooms.repository.ts
│   │   ├── reservations.repository.ts
│   │   ├── departments.repository.ts
│   │   └── analytics.repository.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── rooms.routes.ts
│   │   ├── reservations.routes.ts
│   │   ├── analytics.routes.ts
│   │   ├── admin.routes.ts
│   │   └── health.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   ├── cors.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── logging.middleware.ts
│   │   └── security.middleware.ts
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── users.schema.ts
│   │   ├── rooms.schema.ts
│   │   ├── reservations.schema.ts
│   │   ├── analytics.schema.ts
│   │   └── common.schema.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── users.types.ts
│   │   ├── rooms.types.ts
│   │   ├── reservations.types.ts
│   │   ├── analytics.types.ts
│   │   ├── api.types.ts
│   │   └── global.d.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── crypto.ts
│   │   ├── date.ts
│   │   ├── validation.ts
│   │   ├── pagination.ts
│   │   ├── response.ts
│   │   └── constants.ts
│   ├── jobs/
│   │   ├── queue.ts
│   │   ├── notification.job.ts
│   │   ├── cleanup.job.ts
│   │   ├── analytics.job.ts
│   │   ├── sync.job.ts
│   │   └── ml-training.job.ts
│   └── integrations/
│       ├── google-calendar.ts
│       ├── outlook-calendar.ts
│       ├── slack.ts
│       ├── teams.ts
│       ├── iot-sensors.ts
│       └── ai-service.ts
├── tests/
│   ├── __mocks__/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── users.test.ts
│   │   ├── rooms.test.ts
│   │   └── reservations.test.ts
│   ├── unit/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middleware/
│   │   └── utils/
│   ├── fixtures/
│   │   ├── users.json
│   │   ├── rooms.json
│   │   └── reservations.json
│   └── helpers/
│       ├── database.ts
│       ├── auth.ts
│       └── setup.ts
├── scripts/
│   ├── build.sh
│   ├── deploy.sh
│   ├── migrate.sh
│   ├── seed.sh
│   └── backup.sh
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── DATABASE.md
│   └── CONTRIBUTING.md
└── .github/
    └── workflows/
        ├── ci.yml
        ├── cd.yml
        └── security.yml
```

### 3.3 AI/MLサービス構造

```
ai-service/
├── README.md
├── requirements.txt
├── pyproject.toml
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── src/
│   ├── main.py
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── database.py
│   │   └── logging.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── recommendations.py
│   │   │   ├── analytics.py
│   │   │   ├── predictions.py
│   │   │   └── health.py
│   │   └── dependencies.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── recommendation_model.py
│   │   ├── usage_prediction_model.py
│   │   ├── efficiency_model.py
│   │   └── base_model.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── recommendation_service.py
│   │   ├── analytics_service.py
│   │   ├── prediction_service