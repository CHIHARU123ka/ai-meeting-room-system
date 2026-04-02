#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════
# crew_config.py — AIチーム司令塔 (Anthropic SDK直接版)
# 使用: python crew_config.py "作りたいものを一言で"
# ═══════════════════════════════════════════════════════════

import os
import sys
import json
from datetime import datetime
from pathlib import Path

# ── 依存関係 ─────────────────────────────────────────────
import anthropic
from dotenv import load_dotenv

load_dotenv()

# ── APIキー取得 ──────────────────────────────────────────
ANTHROPIC_API_KEY = (
    os.environ.get("ANTHROPIC_API_KEY_CREWAI")
    or os.environ.get("ANTHROPIC_API_KEY")
    or ""
)
NTFY_TOPIC = os.environ.get("NTFY_TOPIC", "breeder-dev-nana-2026")
LOG_DIR = Path("./logs")
LOG_DIR.mkdir(exist_ok=True)
DOCS_DIR = Path("./docs")
DOCS_DIR.mkdir(exist_ok=True)

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
MODEL = "claude-sonnet-4-20250514"

# ── 通知 ─────────────────────────────────────────────────
def notify(title: str, body: str, priority: str = "default"):
    if not NTFY_TOPIC:
        return
    try:
        import urllib.request
        req = urllib.request.Request(
            f"https://ntfy.sh/{NTFY_TOPIC}",
            data=body.encode("utf-8"),
            method="POST"
        )
        req.add_header("Title", title)
        req.add_header("Priority", priority)
        req.add_header("Content-Type", "text/plain; charset=utf-8")
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        print(f"[通知エラー] {e}")

# ── ファイル保存 ─────────────────────────────────────────
def save_file(filename: str, content: str):
    Path(filename).parent.mkdir(parents=True, exist_ok=True)
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  [保存] {filename}")

# ── LLM呼び出し ─────────────────────────────────────────
def call_llm(role: str, task: str, context: str = "") -> str:
    system_prompt = f"あなたは{role}です。日本語で回答してください。省略禁止・完全版のみ出力してください。"
    messages = []
    if context:
        messages.append({"role": "user", "content": f"【前工程の成果物】\n{context}"})
        messages.append({"role": "assistant", "content": "承知しました。前工程の成果物を踏まえて作業します。"})
    messages.append({"role": "user", "content": task})

    print(f"  [{role}] LLM呼び出し中...")
    response = client.messages.create(
        model=MODEL,
        max_tokens=8096,
        temperature=0.1,
        system=system_prompt,
        messages=messages,
    )
    result = response.content[0].text
    print(f"  [{role}] 完了 ({len(result)} chars)")
    return result

# ── エージェントタスク定義 ────────────────────────────────
def run_pm(requirement: str) -> str:
    task = f"""以下の要件を受け取り、完全な仕様書を作成せよ:
要件: {requirement}

出力物:
1. プロダクト概要（目的・ターゲット・価値提案）
2. 機能一覧（必須機能・優先度付き）
3. 画面一覧（各画面の役割）
4. データモデル案
5. 開発タスクリスト（フロント・バック・DB別）
6. 完了条件

Markdown形式で出力せよ。省略禁止・完全版のみ。"""
    result = call_llm("プロダクトマネージャー（PM歴10年）", task)
    save_file("docs/specification.md", result)
    return result


def run_architect(spec: str) -> str:
    task = """仕様書を読み込み、最適なシステム設計を作成せよ。

出力物:
1. 技術スタック選定と理由
2. システム構成図（テキストで表現）
3. ディレクトリ構造
4. API設計（エンドポイント一覧）
5. DB設計（テーブル・カラム・リレーション）
6. セキュリティ設計
7. デプロイ構成

Markdown形式で出力せよ。省略禁止・完全版のみ。"""
    result = call_llm("システムアーキテクト", task, context=spec)
    save_file("docs/architecture.md", result)
    return result


def run_frontend(arch: str) -> str:
    task = """設計書に基づき、フロントエンドを完全実装せよ。

デザイン要件（必須）:
- ガラス質感（backdrop-filter: blur）
- ダークモード対応
- 余白・配置・バランス重視
- ラグジュアリー・高級感
- アニメーション（framer-motion）
- レスポンシブ（PC崩壊禁止）

実装要件:
- Next.js 15 + TypeScript
- Tailwind CSS + shadcn/ui
- 全コンポーネントの完全実装（省略禁止）

各ファイルを === ファイル名 === の形式で区切って出力せよ。
省略禁止・完全版のみ。"""
    result = call_llm("フロントエンドエンジニア（UI/UX専門家）", task, context=arch)
    save_file("docs/frontend_implementation.md", result)
    # ファイル分割保存
    extract_and_save_files(result, "frontend")
    return result


def run_backend(arch: str) -> str:
    task = """設計書に基づき、バックエンドAPIを完全実装せよ。

実装要件:
- FastAPI または Next.js API Routes
- 認証・認可（JWT）
- バリデーション（完全）
- エラーハンドリング（全ケース）
- APIドキュメント自動生成
- .env.example完備

各ファイルを === ファイル名 === の形式で区切って出力せよ。
省略禁止・完全版のみ。"""
    result = call_llm("バックエンドエンジニア（セキュリティ重視）", task, context=arch)
    save_file("docs/backend_implementation.md", result)
    extract_and_save_files(result, "backend")
    return result


def run_qa(frontend: str, backend: str) -> str:
    combined = f"【フロントエンド】\n{frontend[:3000]}\n\n【バックエンド】\n{backend[:3000]}"
    task = """実装された全コードのテスト計画を作成し、品質を保証せよ。

実施内容:
1. テスト計画
2. テストケース一覧
3. カバレッジ目標
4. バグレポート（発見した問題点）
5. 修正提案
6. セキュリティチェック

Markdown形式で出力せよ。省略禁止・完全版のみ。"""
    result = call_llm("QAエンジニア（品質保証専門家）", task, context=combined)
    save_file("docs/qa_report.md", result)
    return result


def run_ip_audit(frontend: str, backend: str) -> str:
    combined = f"【フロントエンド概要】\n{frontend[:2000]}\n\n【バックエンド概要】\n{backend[:2000]}"
    task = """実装された全成果物の知財監査を実施せよ。

監査対象:
1. プロダクト名・サービス名の商標リスク
2. 使用ライブラリのライセンス確認
3. コードの著作権リスク確認
4. リスクがある場合は代替案を提示

Markdown形式で出力せよ。省略禁止・完全版のみ。"""
    result = call_llm("知財監査エージェント", task, context=combined)
    save_file("docs/ip_audit.md", result)
    return result


# ── ファイル抽出ヘルパー ─────────────────────────────────
def extract_and_save_files(content: str, prefix: str):
    """=== ファイル名 === パターンでファイルを分割保存"""
    import re
    parts = re.split(r'===\s*(.+?)\s*===', content)
    saved = 0
    for i in range(1, len(parts), 2):
        filename = parts[i].strip().strip('`').strip()
        if i + 1 < len(parts):
            file_content = parts[i + 1].strip()
            code_match = re.search(r'```[\w]*\n(.*?)```', file_content, re.DOTALL)
            if code_match:
                file_content = code_match.group(1)
            # ファイル名バリデーション: パス区切り以外の不正文字を排除
            if not filename or not file_content:
                continue
            if any(c in filename for c in ['|', '<', '>', '"', '?', '*', "'"]) or len(filename) > 200:
                continue
            if not re.match(r'^[\w\-./\\]+\.[\w]+$', filename):
                continue
            save_path = f"output/{prefix}/{filename}"
            try:
                save_file(save_path, file_content)
                saved += 1
            except OSError as e:
                print(f"  [スキップ] {filename}: {e}")
    print(f"  [{prefix}] {saved} ファイル抽出・保存")


# ── メイン実行 ────────────────────────────────────────────
def main():
    if len(sys.argv) < 2:
        print('使用方法: python crew_config.py "作りたいものを一言で"')
        print('例: python crew_config.py "ブリーダー向け犬の販売管理アプリ"')
        sys.exit(1)

    requirement = " ".join(sys.argv[1:])

    print(f"\n{'='*50}")
    print(f"  AIチーム開発開始")
    print(f"  要件: {requirement}")
    print(f"  開始: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  モデル: {MODEL}")
    print(f"{'='*50}\n")

    notify("AIチーム始動", f"開発開始: {requirement}", "default")

    # ── Phase 1: PM → 仕様書 ──
    print("[Phase 1/6] プロダクトマネージャー: 仕様書作成")
    spec = run_pm(requirement)

    # ── Phase 2: アーキテクト → 設計書 ──
    print("\n[Phase 2/6] システムアーキテクト: 設計書作成")
    arch = run_architect(spec)

    # ── Phase 3: フロントエンド実装 ──
    print("\n[Phase 3/6] フロントエンドエンジニア: UI実装")
    frontend = run_frontend(arch)

    # ── Phase 4: バックエンド実装 ──
    print("\n[Phase 4/6] バックエンドエンジニア: API実装")
    backend = run_backend(arch)

    # ── Phase 5: QA ──
    print("\n[Phase 5/6] QAエンジニア: テスト・品質保証")
    qa = run_qa(frontend, backend)

    # ── Phase 6: 知財監査 ──
    print("\n[Phase 6/6] 知財監査: ライセンス・商標チェック")
    ip = run_ip_audit(frontend, backend)

    # ── ログ保存 ──
    log_path = LOG_DIR / f"crew_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(log_path, "w", encoding="utf-8") as f:
        json.dump({
            "requirement": requirement,
            "phases": ["spec", "arch", "frontend", "backend", "qa", "ip_audit"],
            "completed_at": datetime.now().isoformat(),
        }, f, ensure_ascii=False, indent=2)

    notify("開発完了", f"全タスク完了！\n要件: {requirement}", "high")

    print(f"\n{'='*50}")
    print(f"  全Phase完了！")
    print(f"  ログ: {log_path}")
    print(f"  成果物: docs/ および output/")
    print(f"  完了: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
