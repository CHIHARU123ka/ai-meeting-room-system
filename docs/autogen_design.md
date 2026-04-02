---
generated: 2026-04-03T01:47:36.011789
requirement: ペットサロン予約管理システム
agents: Claude (設計・判断) × Gemini (検証・反論)
---

**Gemini_Reviewer** さん、非常に鋭い指摘をありがとうございます。特にPlanetScaleとPostgreSQLの互換性問題は重大な見落としでした。この点を含め、最終的な設計を固めたいと思います。

---

# 最終設計決定とインフラ選択

## インフラ選択の最終決定

**PostgreSQLの`EXCLUDE`制約**は予約システムの競合対策において非常に重要な機能であり、これを犠牲にするべきではないと判断します。

**最終選択: Vercel + Supabase**
- **理由**: PostgreSQL完全対応、サーバーレス最適化、Vercel連携、コスト効率
- **Supabase採用メリット**: リアルタイム機能、認証統合、Row Level Security、優れたDX

## 最終DB設計（改善版）

```sql
-- 基本テーブル群
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE booking_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notification_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザー管理
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role_id UUID REFERENCES roles(id) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ペット管理
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  species VARCHAR(30) NOT NULL,
  breed VARCHAR(50),
  age INTEGER CHECK (age >= 0),
  weight DECIMAL(5,2) CHECK (weight > 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- サービス管理
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- スタッフスケジュール管理
CREATE TABLE staff_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  UNIQUE(staff_id, day_of_week)
);

-- スタッフ休暇・非稼働時間管理
CREATE TABLE staff_absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES users(id) ON DELETE CASCADE,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  reason VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_absence_period CHECK (end_datetime > start_datetime)
);

-- 予約管理（競合対策強化版）
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id) NOT NULL,
  pet_id UUID REFERENCES pets(id) NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  staff_id UUID REFERENCES users(id), -- NULL許容（スタッフ未定予約対応）
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  status_id UUID REFERENCES booking_statuses(id) NOT NULL,
  notes TEXT,
  service_price DECIMAL(10,2) NOT NULL, -- 予約時点の料金保持
  total_price DECIMAL(10,2) NOT NULL,
  version INTEGER DEFAULT 1, -- 楽観的ロック
  can_cancel_until TIMESTAMP WITH TIME ZONE, -- キャンセル可能期限
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 制約
  CONSTRAINT valid_datetime CHECK (end_datetime > start_datetime),
  CONSTRAINT valid_prices CHECK (service_price >= 0 AND total_price >= 0),
  
  -- PostgreSQL EXCLUDE制約（競合防止）
  EXCLUDE USING gist (
    staff_id WITH =,
    tstzrange(start_datetime, end_datetime) WITH &&
  ) WHERE (
    staff_id IS NOT NULL AND 
    status_id IN (
      SELECT id FROM booking_statuses 
      WHERE name IN ('confirmed', 'pending')
    )
  )
);

-- 予約明細（将来の拡張対応）
CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  service_name VARCHAR(100) NOT NULL, -- サービス名保持
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- 通知管理
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type_id UUID REFERENCES notification_types(id) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_bookings_staff_datetime ON bookings(staff_id, start_datetime);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
```

## 最終API設計（NestJS + Supabase）

```typescript
// 認証（Supabase Auth統合）
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/signout
GET  /api/auth/user

// 予約管理（競合対策・期限チェック強化）
GET    /api/bookings
POST   /api/bookings              // トランザクション + 競合チェック
GET    /api/bookings/:id
PUT    /api/bookings/:id          // 楽観的ロック + 期限チェック
DELETE /api/bookings/:id          // キャンセル期限チェック
GET    /api/bookings/availability // 空き時間検索（休暇考慮）

// スタッフ管理
GET  /api/staff
GET  /api/staff/:id/schedule
PUT  /api/staff/:id/schedule
GET  /api/staff/:id/absences
POST /api/staff/:id/absences
PUT  /api/staff/absences/:id
DELETE /api/staff/absences/:id

// 通知管理
GET  /api/notifications
PUT  /api/notifications/:id/read
POST /api/notifications/send
```

## セキュリティ設計（最終版）

```typescript
// Supabase Row Level Security
-- 顧客は自分の予約のみ閲覧・操作可能
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (
    auth.uid() = customer_id AND 
    can_cancel_until > NOW()
  );

-- スタッフは全予約閲覧可能、自分の予約は操作可能
CREATE POLICY "Staff can view all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role_id IN (SELECT id FROM roles WHERE name IN ('staff', 'admin'))
    )
  );

// NestJSガード
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('customer')
@Put('bookings/:id')
async updateBooking(
  @Param('id') id: string,
  @Body() updateDto: UpdateBookingDto,
  @User() user: AuthUser
) {
  // 期限チェック
  const booking = await this.bookingService.findOne(id);
  if (booking.can_cancel_until < new Date()) {
    throw new ForbiddenException('変更期限を過ぎています');
  }
  
  // 楽観的ロック
  return this.bookingService.update(id, updateDto, user.id);
}
```

## 予約競合対策（最終実装）

```typescript
@Injectable()
export class BookingService {
  async createBooking(createBookingDto: CreateBookingDto) {
    return await this.supabase.rpc('create_booking_with_conflict_check', {
      p_customer_id: createBookingDto.customer_id,
      p_pet_id: createBookingDto.pet_id,
      p_service_id: createBookingDto.service_id,
      p_staff_id: createBookingDto.staff_id,
      p_start_datetime: createBookingDto.start_datetime,
      p_end_datetime: createBookingDto.end_datetime
    });
  }
}

-- Supabase Function（PostgreSQL）
CREATE OR REPLACE FUNCTION create_booking_with_conflict_check(
  p_customer_id UUID,
  p_pet_id UUID,
  p_service_id UUID,
  p_staff_id UUID,
  p_start_datetime TIMESTAMP WITH TIME ZONE,
  p_end_datetime TIMESTAMP WITH TIME ZONE
) RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_service_price DECIMAL(10,2);
  v_can_cancel_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- サービス料金取得
  SELECT price INTO v_service_price FROM services WHERE id = p_service_id;
  
  -- キャンセル期限設定（24時間前まで）
  v_can_cancel_until := p_start_datetime - INTERVAL '24 hours';
  
  -- 予約作成（EXCLUDE制約により競合は自動的に防がれる）
  INSERT INTO bookings (
    customer_id, pet_id, service_id, staff_id,
    start_datetime, end_datetime, status_id,
    service_price, total_price, can_cancel_until
  ) VALUES (
    p_customer_id, p_pet_id, p_service_id, p_staff_id,
    p_start_datetime, p_end_datetime,
    (SELECT id FROM booking_statuses WHERE name = 'pending'),
    v_service_price, v_service_price, v_can_cancel_until
  ) RETURNING id INTO v_booking_id;
  
  RETURN v_booking_id;
EXCEPTION
  WHEN exclusion_violation THEN
    RAISE EXCEPTION 'この時間帯は既に予約されています';
END;
$$ LANGUAGE plpgsql;
```

## 通知システム（最終版）

```typescript
// Resend統合
@Injectable()
export class NotificationService {
  constructor(private resend: ResendService) {}

  async sendBookingConfirmation(booking: Booking) {
    // メール送信
    await this.resend.emails.send({
      from: 'noreply@petsalon.com',
      to: booking.customer.email,
      subject: '予約確認のお知らせ',
      react: BookingConfirmationEmail({ booking })
    });

    // システム内通知
    await this.createNotification({
      user_id: booking.customer_id,
      type_id: await this.getNotificationTypeId('booking_confirmed'),
      title: '予約が確定しました',
      message: `${booking.service.name}の予約が確定しました。`
    });
  }
}
```

**FINAL_APPROVED**

この設計で、スケーラビリティ、セキュリティ、UX、保守性の全ての要件を満たせると判断します。次に最終設計書を出力いたします。