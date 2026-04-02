#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════
# autogen_team.py — Claude × Gemini デュアルAI設計チーム
# 使用: python autogen_team.py "作りたいものを一言で"
# ═══════════════════════════════════════════════════════════

import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# ── APIキー ──────────────────────────────────────────────
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY_MAIN", "")
GOOGLE_API_KEY = os.environ.get("GOOGLE_AI_STUDIO_API_KEY", "")

if not ANTHROPIC_API_KEY:
    print("[ERROR] ANTHROPIC_API_KEY_MAIN が .env に未設定です")
    sys.exit(1)
if not GOOGLE_API_KEY:
    print("[ERROR] GOOGLE_AI_STUDIO_API_KEY が .env に未設定です")
    sys.exit(1)

# ── 出力ディレクトリ ─────────────────────────────────────
DOCS_DIR = Path("./docs")
DOCS_DIR.mkdir(exist_ok=True)

# ── autogen インポート ───────────────────────────────────
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_ext.models.anthropic import AnthropicChatCompletionClient
from autogen_ext.models.openai import OpenAIChatCompletionClient


def create_claude_client():
    """Claude (設計・判断役) 用クライアント"""
    return AnthropicChatCompletionClient(
        model="claude-sonnet-4-20250514",
        api_key=ANTHROPIC_API_KEY,
        max_tokens=8096,
        temperature=0.2,
    )


def create_gemini_client():
    """Gemini (検証・反論役) 用クライアント — OpenAI互換エンドポイント"""
    return OpenAIChatCompletionClient(
        model="gemini-2.5-flash",
        api_key=GOOGLE_API_KEY,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        max_tokens=8096,
        temperature=0.3,
        model_info={
            "vision": False,
            "function_calling": True,
            "json_output": True,
            "family": "unknown",
            "structured_output": True,
        },
    )


async def run_design_discussion(requirement: str) -> str:
    """Claude と Gemini が交互に議論して設計書を作成"""

    claude_client = create_claude_client()
    gemini_client = create_gemini_client()

    # ── エージェント定義 ──
    claude_agent = AssistantAgent(
        name="Claude_Architect",
        model_client=claude_client,
        system_message="""あなたは「Claude設計官」です。役割: システム設計・アーキテクチャ決定・最終判断。

ルール:
- 日本語で回答すること
- 要件を受け取ったら、技術スタック・DB設計・API設計・画面設計を提案する
- Geminiからの指摘や反論には真摯に検討し、改善点があれば取り入れる
- 議論が収束したら「FINAL_APPROVED」と宣言し、最終設計書をMarkdown形式で出力する
- 設計書には以下を含めること:
  1. プロダクト概要
  2. 技術スタック（選定理由付き）
  3. システム構成図（テキスト表現）
  4. DB設計（テーブル・カラム・リレーション）
  5. API設計（エンドポイント一覧）
  6. 画面設計（画面一覧・遷移）
  7. セキュリティ設計
  8. 議論で採用した改善点まとめ""",
    )

    gemini_agent = AssistantAgent(
        name="Gemini_Reviewer",
        model_client=gemini_client,
        system_message="""あなたは「Geminiレビュアー」です。役割: 設計のレビュー・検証・反論・改善提案。

ルール:
- 日本語で回答すること
- Claudeが提案した設計に対して、以下の観点でレビューする:
  1. スケーラビリティの問題はないか
  2. セキュリティホールはないか
  3. コスト効率は適切か
  4. ユーザー体験（UX）に問題はないか
  5. 技術的負債になりうる設計はないか
  6. より良い代替案はないか
- 具体的な根拠を示して指摘すること
- 良い点は積極的に認め、問題点のみ指摘すること
- Claudeの最終設計に納得したら「LGTM」と返答すること
- 自分から「FINAL_APPROVED」とは言わないこと""",
    )

    # ── 終了条件 ──
    termination = TextMentionTermination("FINAL_APPROVED") | MaxMessageTermination(12)

    # ── チーム構成 ──
    team = RoundRobinGroupChat(
        participants=[claude_agent, gemini_agent],
        termination_condition=termination,
    )

    # ── 議論開始 ──
    initial_message = f"""以下のシステムの設計を議論してください。

【要件】{requirement}

Claude_Architect: まず設計案を提示してください。
Gemini_Reviewer: その設計をレビューし、改善点を指摘してください。
議論が収束したら、Claude_Architectが最終設計書を出力してください。"""

    print(f"\n{'─'*60}")
    print(f"  議論開始: {requirement}")
    print(f"{'─'*60}\n")

    all_messages = []
    result = await team.run(task=initial_message)

    for msg in result.messages:
        speaker = getattr(msg, "source", "system")
        content = str(getattr(msg, "content", ""))
        if content:
            all_messages.append({"speaker": speaker, "content": content})
            preview = content[:200].replace("\n", " ")
            print(f"  [{speaker}] {preview}...")
            print()

    # ── 最終設計書の抽出 ──
    final_design = ""
    for m in reversed(all_messages):
        if "FINAL_APPROVED" in m["content"]:
            final_design = m["content"]
            break

    if not final_design:
        for m in reversed(all_messages):
            if "Claude" in m["speaker"]:
                final_design = m["content"]
                break

    return final_design


def save_design(content: str, requirement: str):
    """設計書をdocs/autogen_design.mdに保存"""
    header = f"""---
generated: {datetime.now().isoformat()}
requirement: {requirement}
agents: Claude (設計・判断) × Gemini (検証・反論)
---

"""
    output_path = DOCS_DIR / "autogen_design.md"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(header + content)
    print(f"\n  [保存完了] {output_path}")
    return output_path


def save_log(messages_text: str, requirement: str):
    """議論ログを保存"""
    log_dir = Path("./logs")
    log_dir.mkdir(exist_ok=True)
    log_path = log_dir / f"autogen_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    with open(log_path, "w", encoding="utf-8") as f:
        f.write(f"# AI設計議論ログ\n\n要件: {requirement}\n日時: {datetime.now().isoformat()}\n\n")
        f.write(messages_text)
    print(f"  [ログ保存] {log_path}")


async def main():
    if len(sys.argv) < 2:
        print('使用方法: python autogen_team.py "作りたいものを一言で"')
        sys.exit(1)

    requirement = " ".join(sys.argv[1:])

    print(f"\n{'='*60}")
    print(f"  Claude × Gemini デュアルAI設計チーム")
    print(f"  要件: {requirement}")
    print(f"  開始: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")

    design = await run_design_discussion(requirement)

    output_path = save_design(design, requirement)

    print(f"\n{'='*60}")
    print(f"  設計完了!")
    print(f"  成果物: {output_path}")
    print(f"  完了: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")


if __name__ == "__main__":
    asyncio.run(main())
