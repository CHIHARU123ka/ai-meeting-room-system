# AI開発会議室

Claude と Gemini が設計を議論し、承認後にフルオート実装するAI開発会議室。

## 技術スタック

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS v4 + Framer Motion
- **AI**: Anthropic Claude API + Google Gemini API
- **DB**: Supabase (会話履歴保存)
- **通知**: ntfy.sh

## セットアップ

```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.local を編集してAPIキーを設定

# 開発サーバー起動
npm run dev
```

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `ANTHROPIC_API_KEY` | Anthropic API キー |
| `GOOGLE_AI_STUDIO_API_KEY` | Google AI Studio APIキー |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key |
| `NTFY_TOPIC` | ntfy.sh 通知トピック |

## 会議フロー

1. 要件を入力
2. Claude が設計案を提示
3. Gemini がレビュー・反論・改善提案
4. 追加要件・修正を入力して議論を深める
5. 「設計を承認」ボタンで実装フェーズへ
6. 6エージェントがフルオート実装 (PM → Architect → Frontend → Backend → QA → IP Audit)
7. エラー時は3回自動リトライ + 設計見直し
8. 完了時にスマホ通知

## テスト

```bash
npm run test:run
```
