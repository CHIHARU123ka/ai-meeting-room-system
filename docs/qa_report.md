# AI会議室管理システム テスト計画書

## 1. テスト計画

### 1.1 テスト目的
- システムの機能要件が正しく実装されていることを確認
- 非機能要件（パフォーマンス、セキュリティ、可用性）の検証
- ユーザビリティの確保
- 品質基準の達成

### 1.2 テスト範囲
- フロントエンド（Next.js）
- バックエンドAPI（Fastify）
- データベース（PostgreSQL + Prisma）
- 認証・認可システム
- リアルタイム通信
- セキュリティ機能

### 1.3 テスト環境
```yaml
開発環境:
  - Node.js: 20.x
  - PostgreSQL: 15.x
  - Redis: 7.x
  - Docker: 24.x

テスト環境:
  - 本番環境と同等の構成
  - テストデータベース
  - モックサービス
```

### 1.4 テスト戦略
- **単体テスト**: 各コンポーネント・関数の個別テスト
- **統合テスト**: API間の連携テスト
- **E2Eテスト**: ユーザーシナリオベースのテスト
- **セキュリティテスト**: 脆弱性検査
- **パフォーマンステスト**: 負荷・ストレステスト

## 2. テストケース一覧

### 2.1 フロントエンド テストケース

#### 2.1.1 認証機能
```typescript
// テストケース: AUTH-001
describe('認証機能', () => {
  test('正常ログイン', async () => {
    // 有効な認証情報でログイン成功
    expect(loginResult.success).toBe(true);
  });

  test('無効な認証情報', async () => {
    // 無効な認証情報でログイン失敗
    expect(loginResult.error).toBeDefined();
  });

  test('セッション管理', async () => {
    // セッション有効期限の確認
    expect(sessionValid).toBe(true);
  });
});
```

#### 2.1.2 会議室予約機能
```typescript
// テストケース: BOOKING-001
describe('会議室予約機能', () => {
  test('予約作成', async () => {
    const booking = {
      roomId: 1,
      startTime: '2024-01-01T10:00:00Z',
      endTime: '2024-01-01T11:00:00Z',
      title: 'テスト会議'
    };
    expect(createBooking(booking)).resolves.toBeDefined();
  });

  test('重複予約チェック', async () => {
    // 同じ時間帯の予約は拒否される
    expect(createBooking(duplicateBooking)).rejects.toThrow();
  });

  test('予約変更', async () => {
    const updatedBooking = { ...booking, title: '変更後会議' };
    expect(updateBooking(updatedBooking)).resolves.toBeDefined();
  });

  test('予約キャンセル', async () => {
    expect(cancelBooking(bookingId)).resolves.toBe(true);
  });
});
```

#### 2.1.3 UI コンポーネント
```typescript
// テストケース: UI-001
describe('UIコンポーネント', () => {
  test('カレンダー表示', () => {
    render(<Calendar />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  test('会議室一覧表示', () => {
    render(<RoomList rooms={mockRooms} />);
    expect(screen.getAllByTestId('room-card')).toHaveLength(mockRooms.length);
  });

  test('フォームバリデーション', async () => {
    const user = userEvent.setup();
    render(<BookingForm />);
    
    await user.click(screen.getByRole('button', { name: '予約' }));
    expect(screen.getByText('必須項目です')).toBeInTheDocument();
  });
});
```

### 2.2 バックエンド テストケース

#### 2.2.1 API エンドポイント
```typescript
// テストケース: API-001
describe('認証API', () => {
  test('POST /api/auth/login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test('POST /api/auth/register', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'new@example.com',
        password: 'password123',
        name: 'Test User'
      });
    
    expect(response.status).toBe(201);
  });
});

// テストケース: API-002
describe('会議室API', () => {
  test('GET /api/rooms', async () => {
    const response = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/bookings', async () => {
    const booking = {
      roomId: 1,
      startTime: '2024-01-01T10:00:00Z',
      endTime: '2024-01-01T11:00:00Z',
      title: 'テスト会議'
    };

    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(booking);
    
    expect(response.status).toBe(201);
  });
});
```

#### 2.2.2 データベース操作
```typescript
// テストケース: DB-001
describe('データベース操作', () => {
  beforeEach(async () => {
    await prisma.booking.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();
  });

  test('ユーザー作成', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword'
      }
    });
    
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  test('予約作成と関連データ', async () => {
    const booking = await prisma.booking.create({
      data: {
        title: 'テスト会議',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        userId: user.id,
        roomId: room.id
      },
      include: {
        user: true,
        room: true
      }
    });
    
    expect(booking.user.email).toBe('test@example.com');
    expect(booking.room.name).toBeDefined();
  });
});
```

### 2.3 統合テストケース

#### 2.3.1 認証フロー
```typescript
// テストケース: INTEGRATION-001
describe('認証統合テスト', () => {
  test('ログイン→API呼び出し→ログアウト', async () => {
    // 1. ログイン
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    const token = loginResponse.body.token;
    
    // 2. 認証が必要なAPI呼び出し
    const roomsResponse = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${token}`);
    
    expect(roomsResponse.status).toBe(200);
    
    // 3. ログアウト
    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);
    
    expect(logoutResponse.status).toBe(200);
  });
});
```

#### 2.3.2 予約フロー
```typescript
// テストケース: INTEGRATION-002
describe('予約統合テスト', () => {
  test('会議室検索→予約作成→確認', async () => {
    // 1. 利用可能な会議室を検索
    const searchResponse = await request(app)
      .get('/api/rooms/available')
      .query({
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z'
      })
      .set('Authorization', `Bearer ${token}`);
    
    expect(searchResponse.body.length).toBeGreaterThan(0);
    
    // 2. 予約作成
    const booking = {
      roomId: searchResponse.body[0].id,
      startTime: '2024-01-01T10:00:00Z',
      endTime: '2024-01-01T11:00:00Z',
      title: 'テスト会議'
    };
    
    const bookingResponse = await request(app)
      .post('/api/bookings')
      .send(booking)
      .set('Authorization', `Bearer ${token}`);
    
    expect(bookingResponse.status).toBe(201);
    
    // 3. 予約確認
    const confirmResponse = await request(app)
      .get(`/api/bookings/${bookingResponse.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(confirmResponse.body.title).toBe('テスト会議');
  });
});
```

### 2.4 E2Eテストケース

#### 2.4.1 ユーザーシナリオ
```typescript
// テストケース: E2E-001
import { test, expect } from '@playwright/test';

test('会議室予約の完全フロー', async ({ page }) => {
  // 1. ログインページにアクセス
  await page.goto('/login');
  
  // 2. ログイン
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  // 3. ダッシュボードに遷移
  await expect(page).toHaveURL('/dashboard');
  
  // 4. 会議室予約ページに移動
  await page.click('[data-testid="booking-nav"]');
  await expect(page).toHaveURL('/bookings');
  
  // 5. 新規予約作成
  await page.click('[data-testid="new-booking-button"]');
  await page.fill('[data-testid="title"]', 'E2Eテスト会議');
  await page.selectOption('[data-testid="room-select"]', '1');
  await page.fill('[data-testid="start-time"]', '2024-01-01T10:00');
  await page.fill('[data-testid="end-time"]', '2024-01-01T11:00');
  await page.click('[data-testid="submit-booking"]');
  
  // 6. 予約完了確認
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  
  // 7. 予約一覧で確認
  await page.goto('/bookings');
  await expect(page.locator('text=E2Eテスト会議')).toBeVisible();
});

test('レスポンシブデザイン確認', async ({ page }) => {
  // モバイルサイズでテスト
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/dashboard');
  
  // ハンバーガーメニューが表示されることを確認
  await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
  
  // デスクトップサイズでテスト
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.reload();
  
  // サイドバーが表示されることを確認
  await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
});
```

### 2.5 パフォーマンステスト

#### 2.5.1 負荷テスト
```typescript
// テストケース: PERFORMANCE-001
describe('パフォーマンステスト', () => {
  test('API応答時間', async () => {
    const startTime = Date.now();
    
    const response = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${token}`);
    
    const responseTime = Date.now() - startTime;
    
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(500); // 500ms以内
  });

  test('同時接続テスト', async () => {
    const promises = Array.from({ length: 100 }, () =>
      request(app)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${token}`)
    );
    
    const responses = await Promise.all(promises);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});
```

## 3. カバレッジ目標

### 3.1 コードカバレッジ目標
```yaml
全体目標: 85%以上

詳細目標:
  フロントエンド:
    - コンポーネント: 90%以上
    - ユーティリティ関数: 95%以上
    - カスタムフック: 90%以上
  
  バックエンド:
    - コントローラー: 90%以上
    - サービス層: 95%以上
    - ミドルウェア: 85%以上
    - ユーティリティ: 95%以上

  統合テスト:
    - APIエンドポイント: 100%
    - 主要ユーザーフロー: 100%
```

### 3.2 機能カバレッジ目標
```yaml
機能カバレッジ: 100%

対象機能:
  - ユーザー認証・認可
  - 会議室管理
  - 予約管理
  - 通知機能
  - レポート機能
  - 管理者機能
```

## 4. バグレポート（発見した問題点）

### 4.1 重要度：高

#### BUG-001: セキュリティ脆弱性
```yaml
タイトル: JWT秘密鍵がハードコードされている
重要度: 高
影響範囲: 認証システム全体
詳細: |
  .env.exampleファイルでJWT_SECRETのデフォルト値が設定されているが、
  本番環境で変更されない可能性がある
再現手順: |
  1. .env.exampleを確認
  2. JWT_SECRETの値を確認
期待結果: 環境変数での動的設定
実際結果: 固定値が設定されている
```

#### BUG-002: SQLインジェクション脆弱性
```yaml
タイトル: 動的クエリでのSQLインジェクション可能性
重要度: 高
影響範囲: データベース操作
詳細: |
  検索機能で直接的なSQL文字列結合が使用されている可能性
再現手順: |
  1. 検索APIに悪意のあるクエリを送信
  2. データベースログを確認
期待結果: パラメータ化クエリの使用
実際結果: 文字列結合によるクエリ構築
```

### 4.2 重要度：中

#### BUG-003: パフォーマンス問題
```yaml
タイトル: N+1クエリ問題
重要度: 中
影響範囲: 予約一覧表示
詳細: |
  予約一覧取得時に関連データを個別に取得している
再現手順: |
  1. 予約一覧APIを呼び出し
  2. データベースクエリログを確認
期待結果: JOINまたはincludeを使用した効率的なクエリ
実際結果: 複数の個別クエリが実行される
```

#### BUG-004: エラーハンドリング不備
```yaml
タイトル: 詳細なエラー情報の漏洩
重要度: 中
影響範囲: API全体
詳細: |
  本番環境でスタックトレースが返される
再現手順: |
  1. 無効なデータでAPI呼び出し
  2. レスポンスを確認
期待結果: 一般的なエラーメッセージ
実際結果: 詳細なスタックトレース
```

### 4.3 重要度：低

#### BUG-005: UI/UX問題
```yaml
タイトル: モバイル表示での要素重複
重要度: 低
影響範囲: モバイルUI
詳細: |
  小さな画面サイズでボタンが重複表示される
再現手順: |
  1. モバイルサイズでページを表示
  2. 予約フォームを確認
期待結果: 適切なレスポンシブ表示
実際結果: 要素の重複
```

## 5. 修正提案

### 5.1 セキュリティ修正

#### 修正-001: JWT秘密鍵の動的生成
```typescript
// 修正前
const JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production";

// 修正後
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return crypto.randomBytes(64).toString('hex');
})();
```

#### 修正-002: SQLインジェクション対策
```typescript
// 修正前
const query = `SELECT * FROM rooms WHERE name LIKE '%${searchTerm}%'`;

// 修正後
const rooms = await prisma.room.findMany({
  where: {
    name: {
      contains: searchTerm,
      mode: 'insensitive'
    }
  }
});
```

### 5.2 パフォーマンス修正

#### 修正-003: N+1クエリ解決
```typescript
// 修正前
const bookings = await prisma.booking.findMany();
for (const booking of bookings) {
  booking.user = await prisma.user.findUnique({ where: { id: booking.userId } });
  booking.room = await prisma.room.findUnique({ where: { id: booking.roomId } });
}

// 修正後
const bookings = await prisma.booking.findMany({
  include: {
    user: {
      select: { id: true, name: true, email: true }
    },
    room: {
      select: { id: true, name: true, capacity: true }
    }
  }
});
```

### 5.3 エラーハンドリング修正

#### 修正-004: 統一エラーハンドラー
```typescript
// エラーハンドリングミドルウェア
export const errorHandler = (error: Error, request: FastifyRequest, reply: FastifyReply) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  logger.error({
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method
  });

  if (error instanceof ValidationError) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: error.message,
      ...(isDevelopment && { details: error.details })
    });
  }

  if (error instanceof AuthenticationError) {
    return reply.status(401).send({
      error: 'Authentication Error',
      message: 'Invalid credentials'
    });
  }

  // 本番環境では詳細なエラー情報を隠す
  return reply.status(500).send({
    error: 'Internal Server Error',
    message: isDevelopment ? error.message : 'Something went wrong',
    ...(isDevelopment && { stack: error.stack })
  });
};
```

### 5.4 UI/UX修正

#### 修正-005: レスポンシブデザイン改善
```css
/* 修正前 */
.booking-form {
  display: flex;
  gap: 1rem;
}

/* 修正後 */
.booking-form {
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

@media (min-width: 768px) {
  .booking-form {
    flex-direction: row;
  }
}
```

## 6. セキュリティチェック

### 6.1 認証・認可

#### チェック項目
```yaml
✅ JWT実装の確認:
  - 秘密鍵の安全な管理
  - トークン有効期限の設定
  - リフレッシュトークンの実装

✅ パスワードセキュリティ:
  - bcryptによるハッシュ化
  - 適切なソルトラウンド数
  - パスワード強度チェック

✅ セッション管理:
  - セッション固定攻撃対策
  - セッションハイジャック対策
  - 適切なログアウト処理
```

### 6.2 入力検証

#### チェック項目
```yaml
✅ バリデーション:
  - Zodスキーマによる型安全性
  - SQLインジェクション対策
  - XSS対策

✅ ファイルアップロード:
  - ファイル形式制限
  - ファイルサイズ制限
  - ウイルススキャン（推奨）
```

### 6.3 通信セキュリティ

#### チェック項目
```yaml
✅ HTTPS強制:
  - SSL/TLS証明書の設定
  - HTTPからHTTPSへのリダイレクト
  - セキュリティヘッダーの設定

✅ CORS設定:
  - 適切なオリジン制限
  - 認証情報の取り扱い
  - プリフライトリクエスト対応
```

### 6.4 データ保護

#### チェック項目
```yaml
✅ 個人情報保護:
  - データ暗号化
  - アクセスログ記録
  - データ保持期間の設定

✅ データベースセキュリティ:
  - 接続文字列の暗号化
  - 最小権限の原則
  - バックアップの暗号化
```

### 6.5 セキュリティテストケース

```typescript
// セキュリティテスト例
describe('セキュリティテスト', () => {
  test('SQLインジェクション対策', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .get('/api/rooms/search')
      .query({ name: maliciousInput })
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    // データベースが正常に動作することを確認
    const users = await prisma.user.findMany();
    expect(users.length).toBeGreaterThan(0);
  });

  test('XSS対策', async () => {
    const xssPayload = '<script>alert("XSS")</script>';
    
    const response = await request(app)
      .post('/api/bookings')
      .send({
        title: xssPayload,
        roomId: 1,
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z'
      })
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.body.title).not.toContain('<script>');
  });

  test('認証バイパス試行', async () => {
    const response = await request(app)
      .get('/api/admin/users');
    
    expect(response.status).toBe(401);
  });
});
```

## 7. テスト実行計画

### 7.1 テスト実行スケジュール
```yaml
Phase 1 - 単体テスト (1週間):
  - フロントエンドコンポーネントテスト
  - バックエンドユニットテスト
  - カバレッジ測定

Phase 2 - 統合テスト (1週間):
  - API統合テスト
  - データベース統合テスト
  - 外部サービス連携テスト

Phase 3 - E2Eテスト (1週間):
  - ユーザーシナリオテスト
  - ブラウザ互換性テスト
  - レスポンシブテスト

Phase 4 - 非機能テスト (1週間):
  - パフォーマンステスト
  - セキュリティテスト
  - 可用性テスト
```

### 7.2 品質ゲート
```yaml
リリース判定基準:
  - 単体テストカバレッジ: 85%以上
  - 統合テストカバレッジ: 100%
  - E2Eテスト成功率: 100%
  - セキュリティテスト: 全項目クリア
  - パフォーマンス: 応答時間500ms以内
  - 重要度高のバグ: 0件
  - 重要度中のバグ: 5件以下
```

この包括的なテスト計画により、AI会議室管理システムの品質を確保し、安全で信頼性の高いシステムの提供を保証します。