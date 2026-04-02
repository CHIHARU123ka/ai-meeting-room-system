# Todoアプリケーション テスト計画書

## 1. テスト計画

### 1.1 テスト概要
- **プロジェクト名**: Todoリストアプリケーション
- **テスト対象**: フロントエンド（Next.js 15 + TypeScript）、バックエンド（FastAPI + Python）
- **テスト期間**: 開発完了後 2週間
- **テスト責任者**: QAエンジニア
- **テスト環境**: 開発環境、ステージング環境、本番環境

### 1.2 テスト目的
- 機能要件の完全性確認
- 非機能要件（パフォーマンス、セキュリティ、可用性）の検証
- ユーザビリティの確認
- クロスブラウザ・レスポンシブ対応の検証
- API仕様の準拠性確認

### 1.3 テスト戦略
- **単体テスト**: 各コンポーネント・関数レベル
- **統合テスト**: API連携、データベース連携
- **E2Eテスト**: ユーザーシナリオベース
- **セキュリティテスト**: 脆弱性検査
- **パフォーマンステスト**: 負荷・ストレステスト
- **ユーザビリティテスト**: UI/UX検証

### 1.4 テスト環境
```yaml
フロントエンド:
  - Node.js: 18.x以上
  - ブラウザ: Chrome, Firefox, Safari, Edge
  - デバイス: Desktop, Tablet, Mobile
  - テストフレームワーク: Vitest, Testing Library

バックエンド:
  - Python: 3.11以上
  - データベース: PostgreSQL 15
  - Redis: 7.x
  - テストフレームワーク: pytest, httpx
```

## 2. テストケース一覧

### 2.1 フロントエンド テストケース

#### 2.1.1 認証機能テスト
| ID | テストケース | 期待結果 | 優先度 |
|---|---|---|---|
| FE-AUTH-001 | 有効なメールアドレスとパスワードでログイン | ログイン成功、ダッシュボード表示 | 高 |
| FE-AUTH-002 | 無効なメールアドレスでログイン | エラーメッセージ表示 | 高 |
| FE-AUTH-003 | 無効なパスワードでログイン | エラーメッセージ表示 | 高 |
| FE-AUTH-004 | 空のフィールドでログイン | バリデーションエラー表示 | 高 |
| FE-AUTH-005 | 新規ユーザー登録（有効データ） | 登録成功、確認メール送信 | 高 |
| FE-AUTH-006 | 重複メールアドレスで登録 | エラーメッセージ表示 | 高 |
| FE-AUTH-007 | 弱いパスワードで登録 | パスワード強度エラー | 中 |
| FE-AUTH-008 | ログアウト機能 | セッション終了、ログイン画面遷移 | 高 |
| FE-AUTH-009 | トークン期限切れ処理 | 自動ログアウト、再ログイン要求 | 高 |
| FE-AUTH-010 | パスワードリセット | リセットメール送信、新パスワード設定 | 中 |

#### 2.1.2 Todo管理機能テスト
| ID | テストケース | 期待結果 | 優先度 |
|---|---|---|---|
| FE-TODO-001 | 新規Todo作成（有効データ） | Todo作成成功、リスト表示 | 高 |
| FE-TODO-002 | 空のタイトルでTodo作成 | バリデーションエラー表示 | 高 |
| FE-TODO-003 | 最大文字数超過でTodo作成 | 文字数制限エラー表示 | 中 |
| FE-TODO-004 | Todo編集機能 | 編集内容保存、表示更新 | 高 |
| FE-TODO-005 | Todo削除機能 | 削除確認ダイアログ、削除実行 | 高 |
| FE-TODO-006 | Todo完了/未完了切り替え | ステータス変更、表示更新 | 高 |
| FE-TODO-007 | Todo優先度設定 | 優先度変更、ソート反映 | 中 |
| FE-TODO-008 | Todo期限設定 | 期限設定、期限切れ表示 | 中 |
| FE-TODO-009 | Todoカテゴリ分類 | カテゴリ設定、フィルタリング | 中 |
| FE-TODO-010 | Todo検索機能 | キーワード検索、結果表示 | 中 |
| FE-TODO-011 | Todoソート機能 | 各項目でソート実行 | 低 |
| FE-TODO-012 | Todoフィルタ機能 | ステータス・優先度でフィルタ | 中 |
| FE-TODO-013 | Todo一括操作 | 複数選択、一括削除/完了 | 低 |
| FE-TODO-014 | Todoドラッグ&ドロップ | 順序変更、位置保存 | 低 |
| FE-TODO-015 | Todo詳細表示 | モーダル表示、詳細情報確認 | 中 |

#### 2.1.3 UI/UXテスト
| ID | テストケース | 期待結果 | 優先度 |
|---|---|---|---|
| FE-UI-001 | レスポンシブデザイン（モバイル） | 画面サイズに応じた表示調整 | 高 |
| FE-UI-002 | レスポンシブデザイン（タブレット） | 画面サイズに応じた表示調整 | 高 |
| FE-UI-003 | ダークモード切り替え | テーマ変更、設定保存 | 中 |
| FE-UI-004 | ローディング表示 | 非同期処理中の適切な表示 | 中 |
| FE-UI-005 | エラー表示 | 分かりやすいエラーメッセージ | 高 |
| FE-UI-006 | 成功通知表示 | 操作完了の適切な通知 | 中 |
| FE-UI-007 | キーボードナビゲーション | Tab/Enterキーでの操作 | 中 |
| FE-UI-008 | アクセシビリティ対応 | スクリーンリーダー対応 | 中 |
| FE-UI-009 | 多言語対応 | 言語切り替え、翻訳表示 | 低 |
| FE-UI-010 | アニメーション効果 | 適切なトランジション表示 | 低 |

#### 2.1.4 パフォーマンステスト
| ID | テストケース | 期待結果 | 優先度 |
|---|---|---|---|
| FE-PERF-001 | 初期ページ読み込み時間 | 3秒以内での表示完了 | 高 |
| FE-PERF-002 | Todo一覧表示（1000件） | 5秒以内での表示完了 | 中 |
| FE-PERF-003 | 検索レスポンス時間 | 1秒以内での結果表示 | 中 |
| FE-PERF-004 | メモリ使用量 | 100MB以下での動作 | 中 |
| FE-PERF-005 | バンドルサイズ | 1MB以下のJSファイル | 中 |

### 2.2 バックエンド テストケース

#### 2.2.1 認証API テスト
| ID | テストケース | 期待結果 | 優先度 |
|---|---|---|---|
| BE-AUTH-001 | POST /auth/register（有効データ） | 201 Created、ユーザー作成 | 高 |
| BE-AUTH-002 | POST /auth/register（重複メール） | 409 Conflict、エラーレスポンス | 高 |
| BE-AUTH-003 | POST /auth/register（無効メール） | 422 Validation Error | 高 |
| BE-AUTH-004 | POST /auth/register（弱いパスワード） | 422 Validation Error | 高 |
| BE-AUTH-005 | POST /auth/login（有効認証情報） | 200 OK、JWTトークン返却 | 高 |
| BE-AUTH-006 | POST /auth/login（無効認証情報） | 401 Unauthorized | 高 |
| BE-AUTH-007 | POST /auth/login（存在しないユーザー） | 401 Unauthorized | 高 |
| BE-AUTH-008 | POST /auth/refresh（有効トークン） | 200 OK、新しいトークン返却 | 高 |
| BE-AUTH-009 | POST /auth/refresh（無効トークン） | 401 Unauthorized | 高 |
| BE-AUTH-010 | POST /auth/logout | 200 OK、トークン無効化 | 高 |
| BE-AUTH-011 | GET /auth/me（認証済み） | 200 OK、ユーザー情報返却 | 高 |
| BE-AUTH-012 | GET /auth/me（未認証） | 401 Unauthorized | 高 |
| BE-AUTH-013 | POST /auth/forgot-password | 200 OK、リセットメール送信 | 中 |
| BE-AUTH-014 | POST /auth/reset-password | 200 OK、パスワード更新 | 中 |
| BE-AUTH-015 | レート制限テスト | 429 Too Many Requests | 高 |

#### 2.2.2 Todo API テスト
| ID | テストケース | 期待結果 | 優先度 |
|---|---|---|---|
| BE-TODO-001 | GET /todos（認証済み） | 200 OK、Todo一覧返却 | 高 |
| BE-TODO-002 | GET /todos（未認証） | 401 Unauthorized | 高 |
| BE-TODO-003 | POST /todos（有効データ） | 201 Created、Todo作成 | 高 |
| BE-TODO-004 | POST /todos（無効データ） | 422 Validation Error | 高 |
| BE-TODO-005 | GET /todos/{id}（存在するID） | 200 OK、Todo詳細返却 | 高 |
| BE-TODO-006 | GET /todos/{id}（存在しないID） | 404 Not Found | 高 |
| BE-TODO-007 | PUT /todos/{id}（有効データ） | 200 OK、Todo更新 | 高 |
| BE-TODO-008 | PUT /todos/{id}（他ユーザーのTodo） | 403 Forbidden | 高 |
| BE-TODO-009 | DELETE /todos/{id}（存在するID） | 204 No Content、Todo削除 | 高 |
| BE-TODO-010 | DELETE /todos/{id}（存在しないID） | 404 Not Found | 高 |
| BE-TODO-011 | PATCH /todos/{id}/complete | 200 OK、完了ステータス更新 | 高 |
| BE-TODO-012 | GET /todos?status=completed | 200 OK、フィルタ結果返却 | 中 |
| BE-TODO-013 | GET /todos?priority=high | 200 OK、優先度フィルタ結果 | 中 |
| BE-TODO-014 | GET /todos?search=keyword | 200 OK、検索結果返却 | 中 |
| BE-TODO-015 | GET /todos?page=1&limit=10 | 200 OK、ページネーション | 中 |

#### 2.2.3 セキュリティテスト
| ID | テストケース | 期待結果 | 優先度 |
|---|---|---|---|
| BE-SEC-001 | SQLインジェクション攻撃 | 攻撃を検出・防御 | 高 |
| BE-SEC-002 | XSS攻撃テスト | スクリプト実行を防御 | 高 |
| BE-SEC-003 | CSRF攻撃テスト | CSRF保護機能動作 | 高 |
| BE-SEC-004 | 認証バイパス試行 | 未認証アクセスを拒否 | 高 |
| BE-SEC-005 | パスワード総当たり攻撃 | レート制限で防御 | 高 |
| BE-SEC-006 | JWTトークン改ざん | 改ざんトークンを拒否 | 高 |
| BE-SEC-007 | 機密情報漏洩チェック | パスワード等の非表示 | 高 |
| BE-SEC-008 | HTTPSリダイレクト | HTTP→HTTPS自動転送 | 中 |
| BE-SEC-009 | セキュリティヘッダー | 適切なヘッダー設定 | 中 |
| BE-SEC-010 | ファイルアップロード攻撃 | 悪意あるファイルを拒否 | 中 |

#### 2.2.4 パフォーマンステスト
| ID | テストケース | 期待結果 | 優先度 |
|---|---|---|---|
| BE-PERF-001 | 同時接続100ユーザー | レスポンス時間500ms以下 | 高 |
| BE-PERF-002 | 同時接続1000ユーザー | レスポンス時間2秒以下 | 中 |
| BE-PERF-003 | 大量データ処理（10万件） | 処理時間30秒以下 | 中 |
| BE-PERF-004 | メモリ使用量監視 | 512MB以下での動作 | 中 |
| BE-PERF-005 | データベース接続プール | 効率的な接続管理 | 中 |

### 2.3 統合テスト

#### 2.3.1 フロントエンド・バックエンド連携テスト
| ID | テストケース | 期待結果 | 優先度 |
|---|---|---|---|
| INT-001 | ユーザー登録フロー | FE→BE→DB→FE完全連携 | 高 |
| INT-002 | ログインフロー | 認証トークン正常取得・保存 | 高 |
| INT-003 | Todo CRUD操作 | 全操作の完全連携 | 高 |
| INT-004 | リアルタイム更新 | WebSocket/SSE連携 | 中 |
| INT-005 | エラーハンドリング | BE→FEエラー伝播 | 高 |
| INT-006 | ファイルアップロード | 画像添付機能連携 | 低 |
| INT-007 | 通知機能 | プッシュ通知連携 | 低 |
| INT-008 | データ同期 | オフライン→オンライン同期 | 低 |

### 2.4 E2Eテスト

#### 2.4.1 ユーザーシナリオテスト
| ID | シナリオ | 期待結果 | 優先度 |
|---|---|---|---|
| E2E-001 | 新規ユーザー登録→初回Todo作成 | 完全なオンボーディング体験 | 高 |
| E2E-002 | 既存ユーザーログイン→Todo管理 | スムーズな日常利用体験 | 高 |
| E2E-003 | モバイルでのTodo管理 | モバイル最適化体験 | 高 |
| E2E-004 | 複数デバイス間でのデータ同期 | 一貫したデータ表示 | 中 |
| E2E-005 | 長期間利用シナリオ | データ整合性維持 | 中 |
| E2E-006 | エラー回復シナリオ | 適切なエラー処理・回復 | 中 |
| E2E-007 | パフォーマンス劣化シナリオ | 低速環境での動作確認 | 低 |

## 3. カバレッジ目標

### 3.1 コードカバレッジ目標
```yaml
フロントエンド:
  - 単体テスト: 90%以上
  - 統合テスト: 80%以上
  - E2Eテスト: 70%以上

バックエンド:
  - 単体テスト: 95%以上
  - 統合テスト: 85%以上
  - APIテスト: 100%

全体:
  - 機能カバレッジ: 100%
  - 要件カバレッジ: 100%
  - リスクカバレッジ: 90%以上
```

### 3.2 テスト実行カバレッジ
```yaml
ブラウザカバレッジ:
  - Chrome: 必須
  - Firefox: 必須
  - Safari: 必須
  - Edge: 必須
  - モバイルブラウザ: 必須

デバイスカバレッジ:
  - Desktop: 1920x1080, 1366x768
  - Tablet: 768x1024, 1024x768
  - Mobile: 375x667, 414x896

OSカバレッジ:
  - Windows 10/11
  - macOS Monterey以降
  - iOS 15以降
  - Android 10以降
```

## 4. バグレポート（発見した問題点）

### 4.1 重大な問題（Critical）

#### BUG-001: 認証トークンの不適切な管理
**問題**: JWTトークンがlocalStorageに平文で保存されている
**影響**: XSS攻撃によるトークン盗取リスク
**再現手順**:
1. ログイン実行
2. ブラウザ開発者ツールでlocalStorageを確認
3. JWTトークンが平文で確認できる

**期待動作**: httpOnlyクッキーまたは暗号化された形式での保存
**実際の動作**: 平文でlocalStorageに保存

#### BUG-002: SQLインジェクション脆弱性
**問題**: 検索機能でSQLインジェクションが可能
**影響**: データベースの不正操作リスク
**再現手順**:
1. Todo検索フィールドに `'; DROP TABLE todos; --` を入力
2. 検索実行
3. データベースエラーまたは予期しない動作

**期待動作**: パラメータ化クエリによる安全な検索
**実際の動作**: 生のSQL文字列結合による脆弱性

#### BUG-003: 認証バイパス
**問題**: 特定のAPIエンドポイントで認証チェックが不完全
**影響**: 未認証ユーザーによる不正アクセス
**再現手順**:
1. ログアウト状態でAPI直接アクセス
2. `GET /api/v1/todos` にAuthorizationヘッダーなしでリクエスト
3. 200レスポンスが返却される

**期待動作**: 401 Unauthorizedレスポンス
**実際の動作**: 認証なしでデータ取得可能

### 4.2 高優先度問題（High）

#### BUG-004: CSRF保護の欠如
**問題**: CSRF攻撃に対する保護が実装されていない
**影響**: 悪意あるサイトからの不正操作リスク
**再現手順**:
1. 外部サイトからPOSTリクエスト送信
2. ユーザーのセッションで不正操作実行
3. 操作が成功してしまう

#### BUG-005: レート制限の不備
**問題**: ログイン試行に対するレート制限が機能していない
**影響**: ブルートフォース攻撃のリスク
**再現手順**:
1. 短時間で大量のログイン試行
2. レート制限エラーが発生しない
3. 攻撃が継続可能

#### BUG-006: 入力値検証の不備
**問題**: フロントエンドの入力検証をバイパス可能
**影響**: 不正データの登録リスク
**再現手順**:
1. ブラウザ開発者ツールでフォーム制限を無効化
2. 制限を超えるデータを送信
3. バックエンドで受け入れられる

### 4.3 中優先度問題（Medium）

#### BUG-007: メモリリーク
**問題**: 長時間使用時にメモリ使用量が増加し続ける
**影響**: アプリケーションのパフォーマンス劣化
**再現手順**:
1. アプリケーションを長時間使用
2. Todo作成・削除を繰り返し実行
3. メモリ使用量の継続的増加を確認

#### BUG-008: 競合状態
**問題**: 同時編集時のデータ競合が適切に処理されない
**影響**: データの不整合リスク
**再現手順**:
1. 複数のブラウザタブで同じTodoを開く
2. 同時に編集・保存を実行
3. 最後の更新のみが反映される

#### BUG-009: エラーハンドリングの不備
**問題**: ネットワークエラー時の適切な処理が不足
**影響**: ユーザビリティの低下
**再現手順**:
1. ネットワーク接続を切断
2. Todo操作を実行
3. 適切なエラーメッセージが表示されない

### 4.4 低優先度問題（Low）

#### BUG-010: UI/UXの問題
**問題**: モバイル表示時のレイアウト崩れ
**影響**: モバイルユーザビリティの低下
**再現手順**:
1. モバイルデバイスでアクセス
2. 特定の画面サイズで表示確認
3. レイアウトの崩れを確認

#### BUG-011: パフォーマンス問題
**問題**: 大量データ表示時の描画遅延
**影響**: ユーザー体験の低下
**再現手順**:
1. 1000件以上のTodoを作成
2. 一覧表示を実行
3. 描画完了まで5秒以上要する

## 5. 修正提案

### 5.1 セキュリティ修正提案

#### 修正-001: 認証トークン管理の改善
```typescript
// 現在の実装（問題あり）
localStorage.setItem('token', token);

// 推奨実装
// httpOnlyクッキーの使用
document.cookie = `token=${token}; HttpOnly; Secure; SameSite=Strict`;

// または暗号化してlocalStorageに保存
const encryptedToken = encrypt(token, secretKey);
localStorage.setItem('token', encryptedToken);
```

#### 修正-002: SQLインジェクション対策
```python
# 現在の実装（問題あり）
query = f"SELECT * FROM todos WHERE title LIKE '%{search_term}%'"

# 推奨実装
query = "SELECT * FROM todos WHERE title LIKE :search_term"
result = db.execute(query, {"search_term": f"%{search_term}%"})
```

#### 修正-003: CSRF保護の実装
```python
# FastAPIでのCSRF保護実装
from fastapi_csrf_protect import CsrfProtect

@app.post("/todos")
async def create_todo(
    request: Request,
    todo: TodoCreate,
    csrf_protect: CsrfProtect = Depends()
):
    csrf_protect.validate_csrf(request)
    # Todo作成処理
```

#### 修正-004: レート制限の強化
```python
# より厳格なレート制限実装
from slowapi import Limiter

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/hour"]
)

@app.post("/auth/login")
@limiter.limit("5/minute")  # ログインは1分間に5回まで
async def login(request: Request, credentials: UserLogin):
    # ログイン処理
```

### 5.2 パフォーマンス修正提案

#### 修正-005: メモリリーク対策
```typescript
// React Hookでのメモリリーク対策
useEffect(() => {
    const subscription = todoService.subscribe(handleUpdate);
    
    return () => {
        // クリーンアップ処理
        subscription.unsubscribe();
    };
}, []);

// 大量データの仮想化
import { FixedSizeList as List } from 'react-window';

const TodoList = ({ todos }) => (
    <List
        height={600}
        itemCount={todos.length}
        itemSize={50}
        itemData={todos}
    >
        {TodoItem}
    </List>
);
```

#### 修正-006: データベースクエリ最適化
```python
# インデックスの追加
class Todo(Base):
    __tablename__ = "todos"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)  # 検索用インデックス
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    created_at = Column(DateTime, index=True)  # ソート用インデックス

# ページネーションの最適化
def get_todos(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Todo)\
        .filter(Todo.user_id == user_id)\
        .offset(skip)\
        .limit(limit)\
        .options(selectinload(Todo.category))\  # N+1問題対策
        .all()
```

### 5.3 エラーハンドリング改善提案

#### 修正-007: 統一的なエラーハンドリング
```typescript
// エラーハンドリングの統一化
class ApiError extends Error {
    constructor(
        public status: number,
        public message: string,
        public code?: string
    ) {
        super(message);
    }
}

const apiClient = {
    async request<T>(url: string, options?: RequestInit): Promise<T> {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new ApiError(
                    response.status,
                    await response.text(),
                    response.headers.get('X-Error-Code') || undefined
                );
            }
            
            return await response.json();
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(0, 'Network Error', 'NETWORK_ERROR');
        }
    }
};
```

#### 修正-008: 競合状態の解決
```python
# 楽観的ロックの実装
class Todo(Base):
    __tablename__ = "todos"
    
    id = Column(Integer, primary_key=True)
    title = Column(String)
    version = Column(Integer, default=1)  # バージョン管理
    updated_at = Column(DateTime, default=datetime.utcnow)

async def update_todo(db: Session, todo_id: int, todo_update: TodoUpdate, current_version: int):
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    
    if todo.version != current_version:
        raise HTTPException(
            status_code=409,
            detail="Todo has been modified by another user"
        )
    
    # 更新処理
    todo.version +=