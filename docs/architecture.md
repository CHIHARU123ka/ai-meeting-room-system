# Todoリストアプリ システム設計書

## 1. 技術スタック選定と理由

### 1.1 フロントエンド技術スタック

#### 1.1.1 コア技術
- **React 18.2+**
  - 理由: コンポーネントベース開発による保守性向上、豊富なエコシステム
  - 仮想DOM による高いパフォーマンス
  - Hooks による状態管理の簡素化

- **TypeScript 5.0+**
  - 理由: 型安全性による開発効率向上とバグ削減
  - IDE支援による開発体験向上
  - 大規模開発時の保守性確保

- **Vite 4.0+**
  - 理由: 高速な開発サーバー起動とHMR
  - ES Modules ベースによる最適化されたビルド
  - プラグインエコシステムの充実

#### 1.1.2 状態管理
- **Zustand 4.0+**
  - 理由: 軽量でシンプルなAPI
  - TypeScript との親和性が高い
  - Redux より学習コストが低い
  - 小〜中規模アプリに最適

#### 1.1.3 スタイリング
- **Styled-components 6.0+**
  - 理由: CSS-in-JS による動的スタイリング
  - TypeScript との統合
  - テーマ機能による一貫したデザインシステム
  - コンポーネントレベルでのスタイル管理

#### 1.1.4 UI/UXライブラリ
- **Framer Motion 10.0+**
  - 理由: 宣言的なアニメーション記述
  - React との深い統合
  - パフォーマンスに最適化されたアニメーション

- **React Hook Form 7.0+**
  - 理由: 高パフォーマンスなフォーム管理
  - バリデーション機能の充実
  - 非制御コンポーネントによる最適化

#### 1.1.5 ユーティリティ
- **UUID 9.0+**
  - 理由: 一意識別子生成の標準ライブラリ
  - セキュアな ID 生成

- **Date-fns 2.0+**
  - 理由: 軽量な日付操作ライブラリ
  - Tree-shaking 対応
  - TypeScript サポート

### 1.2 バックエンド技術スタック（将来拡張用）

#### 1.2.1 ランタイム・フレームワーク
- **Node.js 18.0+ LTS**
  - 理由: JavaScript/TypeScript 統一による開発効率
  - 豊富なパッケージエコシステム
  - 非同期処理に最適化

- **Express.js 4.18+**
  - 理由: 軽量で柔軟なWebフレームワーク
  - ミドルウェアエコシステムの充実
  - REST API 開発に最適

#### 1.2.2 データベース
- **PostgreSQL 15.0+**
  - 理由: ACID準拠の高い信頼性
  - JSON型サポートによる柔軟なデータ構造
  - 豊富な拡張機能

- **Prisma 5.0+**
  - 理由: 型安全なORM
  - マイグレーション管理の自動化
  - GraphQL風のクエリ記述

#### 1.2.3 認証・セキュリティ
- **JWT (jsonwebtoken 9.0+)**
  - 理由: ステートレスな認証機能
  - クロスドメイン対応
  - 標準的な認証方式

- **bcrypt 5.0+**
  - 理由: 安全なパスワードハッシュ化
  - ソルト機能による辞書攻撃対策

### 1.3 開発・運用ツール

#### 1.3.1 コード品質
- **ESLint 8.0+**
  - 理由: コード品質の統一
  - TypeScript ルールセット
  - React 専用ルール

- **Prettier 3.0+**
  - 理由: コードフォーマットの自動化
  - チーム開発での一貫性確保

- **Husky 8.0+**
  - 理由: Git hooks による品質ゲート
  - コミット前の自動チェック

#### 1.3.2 テスト
- **Vitest 0.34+**
  - 理由: Vite との統合による高速テスト実行
  - Jest 互換API
  - TypeScript ネイティブサポート

- **React Testing Library 13.0+**
  - 理由: ユーザー中心のテスト記述
  - アクセシビリティを考慮したテスト

- **Playwright 1.37+**
  - 理由: クロスブラウザE2Eテスト
  - 高速で安定したテスト実行
  - 豊富なデバッグ機能

#### 1.3.3 監視・分析
- **Sentry**
  - 理由: リアルタイムエラー監視
  - パフォーマンス監視
  - React との深い統合

### 1.4 デプロイ・インフラ

#### 1.4.1 ホスティング
- **Vercel**
  - 理由: React/Next.js に最適化
  - 自動デプロイとプレビュー機能
  - エッジネットワークによる高速配信
  - 無料枠での十分な機能

#### 1.4.2 データベース（将来拡張用）
- **Supabase**
  - 理由: PostgreSQL ベースのBaaS
  - リアルタイム機能
  - 認証機能の統合
  - 無料枠での開発可能

## 2. システム構成図（テキスト表現）

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Desktop   │  │   Tablet    │  │   Mobile    │         │
│  │  (Chrome,   │  │  (Safari,   │  │  (Chrome,   │         │
│  │  Firefox,   │  │   Chrome)   │  │  Safari)    │         │
│  │   Safari,   │  │             │  │             │         │
│  │    Edge)    │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         CDN Layer                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 Vercel Edge Network                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │ │
│  │  │   Tokyo     │  │   Seoul     │  │  Singapore  │     │ │
│  │  │    Edge     │  │    Edge     │  │    Edge     │     │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Static Files
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                React SPA Application                    │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │ │
│  │  │    UI       │  │   State     │  │   Storage   │     │ │
│  │  │ Components  │  │ Management  │  │   Layer     │     │ │
│  │  │             │  │  (Zustand)  │  │(LocalStorage│     │ │
│  │  │ - Header    │  │             │  │  + IndexedDB│     │ │
│  │  │ - TodoInput │  │ - TodoStore │  │   Fallback) │     │ │
│  │  │ - TodoList  │  │ - UIStore   │  │             │     │ │
│  │  │ - TodoItem  │  │ - AppStore  │  │             │     │ │
│  │  │ - Filter    │  │             │  │             │     │ │
│  │  │ - Dialog    │  │             │  │             │     │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Future API Calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (Future)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   Express.js Server                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │ │
│  │  │   Routes    │  │ Middleware  │  │ Controllers │     │ │
│  │  │             │  │             │  │             │     │ │
│  │  │ - /api/todos│  │ - CORS      │  │ - TodoCtrl  │     │ │
│  │  │ - /api/auth │  │ - Auth      │  │ - AuthCtrl  │     │ │
│  │  │ - /api/user │  │ - Validate  │  │ - UserCtrl  │     │ │
│  │  │             │  │ - RateLimit │  │             │     │ │
│  │  │             │  │ - Helmet    │  │             │     │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Database Queries
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer (Future)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  Supabase PostgreSQL                    │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │ │
│  │  │   Tables    │  │   Indexes   │  │  Functions  │     │ │
│  │  │             │  │             │  │             │     │ │
│  │  │ - users     │  │ - todos_idx │  │ - cleanup   │     │ │
│  │  │ - todos     │  │ - user_idx  │  │ - validate  │     │ │
│  │  │ - sessions  │  │ - created_  │  │             │     │ │
│  │  │             │  │   at_idx    │  │             │     │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Backup & Monitoring
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Layer                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Sentry    │  │   Vercel    │  │  Supabase   │         │
│  │   Error     │  │ Analytics   │  │ Monitoring  │         │
│  │ Monitoring  │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 データフロー図

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │───▶│   Browser   │───▶│ LocalStorage│
│ Interaction │    │   Events    │    │   Persist   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ React Event │───▶│   Zustand   │───▶│   React     │
│  Handlers   │    │    Store    │    │ Re-render   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ State Update│───▶│ UI Update   │───▶│   User      │
│  & Persist  │    │ Animation   │    │  Feedback   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 3. ディレクトリ構造

```
todo-app/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── .env.example
├── .env.local
├── index.html
│
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   └── icons/
│       ├── icon-192x192.png
│       ├── icon-512x512.png
│       └── apple-touch-icon.png
│
├── src/
│   ├── main.tsx                    # アプリケーションエントリーポイント
│   ├── App.tsx                     # ルートコンポーネント
│   ├── vite-env.d.ts              # Vite型定義
│   │
│   ├── components/                 # 再利用可能コンポーネント
│   │   ├── ui/                    # 基本UIコンポーネント
│   │   │   ├── Button/
│   │   │   │   ├── index.ts
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.styles.ts
│   │   │   │   └── Button.test.tsx
│   │   │   ├── Input/
│   │   │   │   ├── index.ts
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Input.styles.ts
│   │   │   │   └── Input.test.tsx
│   │   │   ├── Checkbox/
│   │   │   │   ├── index.ts
│   │   │   │   ├── Checkbox.tsx
│   │   │   │   ├── Checkbox.styles.ts
│   │   │   │   └── Checkbox.test.tsx
│   │   │   ├── Modal/
│   │   │   │   ├── index.ts
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Modal.styles.ts
│   │   │   │   └── Modal.test.tsx
│   │   │   └── index.ts           # UI コンポーネント統合エクスポート
│   │   │
│   │   ├── layout/                # レイアウトコンポーネント
│   │   │   ├── Header/
│   │   │   │   ├── index.ts
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Header.styles.ts
│   │   │   │   └── Header.test.tsx
│   │   │   ├── Footer/
│   │   │   │   ├── index.ts
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Footer.styles.ts
│   │   │   │   └── Footer.test.tsx
│   │   │   ├── Container/
│   │   │   │   ├── index.ts
│   │   │   │   ├── Container.tsx
│   │   │   │   ├── Container.styles.ts
│   │   │   │   └── Container.test.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── features/              # 機能別コンポーネント
│   │   │   ├── todo/
│   │   │   │   ├── TodoInput/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── TodoInput.tsx
│   │   │   │   │   ├── TodoInput.styles.ts
│   │   │   │   │   └── TodoInput.test.tsx
│   │   │   │   ├── TodoList/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── TodoList.tsx
│   │   │   │   │   ├── TodoList.styles.ts
│   │   │   │   │   └── TodoList.test.tsx
│   │   │   │   ├── TodoItem/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── TodoItem.tsx
│   │   │   │   │   ├── TodoItem.styles.ts
│   │   │   │   │   └── TodoItem.test.tsx
│   │   │   │   ├── TodoFilter/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── TodoFilter.tsx
│   │   │   │   │   ├── TodoFilter.styles.ts
│   │   │   │   │   └── TodoFilter.test.tsx
│   │   │   │   ├── TodoStats/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── TodoStats.tsx
│   │   │   │   │   ├── TodoStats.styles.ts
│   │   │   │   │   └── TodoStats.test.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── common/                # 共通コンポーネント
│   │   │   ├── ErrorBoundary/
│   │   │   │   ├── index.ts
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   └── ErrorBoundary.test.tsx
│   │   │   ├── LoadingSpinner/
│   │   │   │   ├── index.ts
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── LoadingSpinner.styles.ts
│   │   │   │   └── LoadingSpinner.test.tsx
│   │   │   ├── ConfirmDialog/
│   │   │   │   ├── index.ts
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   ├── ConfirmDialog.styles.ts
│   │   │   │   └── ConfirmDialog.test.tsx
│   │   │   ├── Toast/
│   │   │   │   ├── index.ts
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Toast.styles.ts
│   │   │   │   └── Toast.test.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts               # 全コンポーネント統合エクスポート
│   │
│   ├── hooks/                     # カスタムフック
│   │   ├── useTodos.ts           # Todo操作ロジック
│   │   ├── useTodos.test.ts
│   │   ├── useLocalStorage.ts    # ローカルストレージ操作
│   │   ├── useLocalStorage.test.ts
│   │   ├── useDebounce.ts        # デバウンス処理
│   │   ├── useDebounce.test.ts
│   │   ├── useKeyboard.ts        # キーボードイベント処理
│   │   ├── useKeyboard.test.ts
│   │   ├── useMediaQuery.ts      # レスポンシブ対応
│   │   ├── useMediaQuery.test.ts
│   │   └── index.ts
│   │
│   ├── store/                     # 状態管理
│   │   ├── todoStore.ts          # Todo状態管理
│   │   ├── todoStore.test.ts
│   │   ├── uiStore.ts            # UI状態管理
│   │   ├── uiStore.test.ts
│   │   ├── appStore.ts           # アプリケーション全体状態
│   │   ├── appStore.test.ts
│   │   └── index.ts
│   │
│   ├── types/                     # 型定義
│   │   ├── todo.ts               # Todo関連型
│   │   ├── ui.ts                 # UI関連型
│   │   ├── api.ts                # API関連型（将来用）
│   │   ├── common.ts             # 共通型
│   │   └── index.ts
│   │
│   ├── utils/                     # ユーティリティ関数
│   │   ├── storage.ts            # ストレージ操作
│   │   ├── storage.test.ts
│   │   ├── validation.ts         # バリデーション
│   │   ├── validation.test.ts
│   │   ├── date.ts               # 日付操作
│   │   ├── date.test.ts
│   │   ├── constants.ts          # 定数定義
│   │   ├── helpers.ts            # ヘルパー関数
│   │   ├── helpers.test.ts
│   │   └── index.ts
│   │
│   ├── styles/                    # スタイル関連
│   │   ├── theme.ts              # テーマ定義
│   │   ├── globalStyles.ts       # グローバルスタイル
│   │   ├── breakpoints.ts        # ブレークポイント定義
│   │   ├── animations.ts         # アニメーション定義
│   │   └── index.ts
│   │
│   ├── pages/                     # ページコンポーネント
│   │   ├── TodoPage/
│   │   │   ├── index.ts
│   │   │   ├── TodoPage.tsx
│   │   │   ├── TodoPage.styles.ts
│   │   │   └── TodoPage.test.tsx
│   │   └── index.ts
│   │
│   ├── services/                  # 外部サービス連携（将来用）
│   │   ├── api/
│   │   │   ├── todoApi.ts
│   │   │   ├── todoApi.test.ts
│   │   │   ├── authApi.ts
│   │   │   ├── authApi.test.ts
│   │   │   └── index.ts
│   │   ├── storage/
│   │   │   ├── localStorage.ts
│   │   │   ├── localStorage.test.ts
│   │   │   ├── indexedDB.ts
│   │   │   ├── indexedDB.test.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── __tests__/                 # テスト関連
│       ├── setup.ts              # テストセットアップ
│       ├── mocks/                # モック定義
│       │   ├── localStorage.ts
│       │   ├── intersectionObserver.ts
│       │   └── index.ts
│       ├── fixtures/             # テストデータ
│       │   ├── todos.ts
│       │   └── index.ts
│       └── utils/                # テストユーティリティ
│           ├── renderWithProviders.tsx
│           ├── testUtils.ts
│           └── index.ts
│
├── tests/                         # E2Eテスト
│   ├── e2e/
│   │   ├── todo.spec.ts
│   │   ├── responsive.spec.ts
│   │   └── accessibility.spec.ts
│   ├── fixtures/
│   │   └── test-data.json
│   └── playwright.config.ts
│
├── docs/                          # ドキュメント
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── CONTRIBUTING.md
│   └── API.md
│
├── scripts/                       # ビルド・デプロイスクリプト
│   ├── build.sh
│   ├── deploy.sh
│   ├── test.sh
│   └── setup.sh
│
└── .github/                       # GitHub Actions
    └── workflows/
        ├── ci.yml
        ├── cd.yml
        └── lighthouse.yml
```

## 4. API設計（エンドポイント一覧）

### 4.1 現在の実装（ローカルストレージベース）

現在はローカルストレージベースのため、API エンドポイントは存在しません。
以下は将来のバックエンド実装時の設計です。

### 4.2 将来のAPI設計

#### 4.2.1 ベースURL
```
Production: https://api.todoapp.com/v1
Development: http://localhost:3001/api/v1
```

#### 4.2.2 認証エンドポイント

```http
POST /auth/register
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-string"
  }
}
```

```http
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token-string"
  }
}
```

```http
POST /auth/logout
Authorization: Bearer jwt-token-string

Response: 200 OK
{
  "success": true,
  "message": "Successfully logged out"
}
```

```http
GET /auth/me
Authorization: Bearer jwt-token-string

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 4.2.3 Todoエンドポイント

```http
GET /todos
Authorization: Bearer jwt-token-string
Query Parameters:
  - filter: all|active|completed (default: all)
  - page: number (default: 1)
  - limit: number (default: 50,