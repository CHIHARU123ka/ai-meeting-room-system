#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════
# voice_agent.py — 日本語音声AI（ElevenLabs + Whisper）
# 使用: python3 voice_agent.py
# ═══════════════════════════════════════════════════════════

import os
import sys
import json
import tempfile
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime

# ── 環境変数 ─────────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv()

ELEVENLABS_API_KEY   = os.environ.get("ELEVENLABS_API_KEY", "")
ANTHROPIC_API_KEY    = os.environ.get("ANTHROPIC_API_KEY_MAIN", "")
VOICE_ID             = os.environ.get("ELEVENLABS_VOICE_ID", "")
NTFY_TOPIC           = os.environ.get("NTFY_TOPIC", "breeder-dev-nana-2026")

# ── ElevenLabs 日本語音声生成 ────────────────────────────
def text_to_speech(text: str, output_path: str = None) -> str:
    """
    テキストを自然な日本語音声に変換する
    ElevenLabs APIを使用
    """
    if not ELEVENLABS_API_KEY:
        print("[VOICE] ELEVENLABS_API_KEY 未設定")
        return ""

    if not VOICE_ID:
        # デフォルト: ElevenLabs の日本語対応音声ID
        # Mizuki（日本語自然音声）
        voice_id = "pFZP5JQG7iQjIQuC4Bku"
    else:
        voice_id = VOICE_ID

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    payload = json.dumps({
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8,
            "style": 0.3,
            "use_speaker_boost": True,
        },
        "language_code": "ja",
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("xi-api-key", ELEVENLABS_API_KEY)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "audio/mpeg")

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            audio_data = resp.read()

        if output_path is None:
            output_path = tempfile.mktemp(suffix=".mp3")

        with open(output_path, "wb") as f:
            f.write(audio_data)

        print(f"[VOICE] 音声生成完了: {output_path}")
        return output_path

    except Exception as e:
        print(f"[VOICE] エラー: {e}")
        return ""


def play_audio(file_path: str):
    """音声ファイルを再生する（Windows対応）"""
    if not file_path or not Path(file_path).exists():
        return

    try:
        if sys.platform == "win32":
            os.startfile(file_path)
        elif sys.platform == "darwin":
            os.system(f"afplay '{file_path}'")
        else:
            os.system(f"mpg123 '{file_path}' 2>/dev/null || ffplay -nodisp -autoexit '{file_path}'")
    except Exception as e:
        print(f"[VOICE] 再生エラー: {e}")


# ── Claude APIで賢い日本語文章を生成 ─────────────────────
def generate_smart_response(prompt: str, context: str = "") -> str:
    """
    Claude APIで調べて・考えて・自然な日本語文章を生成する
    """
    if not ANTHROPIC_API_KEY:
        return prompt

    system_prompt = """
あなたは知識豊富で親しみやすいAIアシスタントです。
以下のルールで回答してください:

1. 必ず正確な情報を提供する（不明な場合は正直に伝える）
2. 自然な日本語で話す（機械的な表現NG）
3. 感情を込めた話し方をする
4. 簡潔で聞き取りやすい文章にする（音声読み上げ前提）
5. 数字・記号・英語は自然な日本語読みにする
6. 句読点を適切に使い、間が自然になるようにする
"""

    payload = json.dumps({
        "model": "claude-opus-4-6",
        "max_tokens": 1000,
        "system": system_prompt,
        "messages": [
            {
                "role": "user",
                "content": f"{context}\n\n{prompt}" if context else prompt
            }
        ]
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=payload,
        method="POST"
    )
    req.add_header("x-api-key", ANTHROPIC_API_KEY)
    req.add_header("anthropic-version", "2023-06-01")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())
            return result["content"][0]["text"]
    except Exception as e:
        print(f"[VOICE] Claude API エラー: {e}")
        return prompt


# ── 音声通知（開発完了・エラー報告） ─────────────────────
def speak_notification(event_type: str, details: str = ""):
    """
    開発イベントを自然な日本語音声で通知する
    """
    messages = {
        "start": f"開発を開始します。{details}",
        "complete": f"開発が完了しました！{details}プルリクエストをご確認ください。",
        "error": f"エラーが発生しました。{details}ログをご確認ください。",
        "pr_created": f"プルリクエストを作成しました。{details}ご確認をお願いします。",
        "trademark_risk": f"知財リスクを検出しました。{details}至急ご確認ください。",
        "test_fail": f"テストが失敗しました。{details}自動修復を試みます。",
        "test_pass": f"全テストが通過しました。カバレッジも基準を満たしています。",
    }

    raw_message = messages.get(event_type, details)

    # Claudeで自然な文章に変換
    smart_message = generate_smart_response(
        f"以下のシステム通知を、自然で親しみやすい日本語に変換してください。50文字以内で。\n通知: {raw_message}"
    )

    print(f"[VOICE] 読み上げ: {smart_message}")

    # 音声生成・再生
    audio_path = text_to_speech(smart_message)
    if audio_path:
        play_audio(audio_path)

    return smart_message


# ── 音声リスト取得 ────────────────────────────────────────
def list_voices():
    """利用可能な日本語音声の一覧を取得"""
    if not ELEVENLABS_API_KEY:
        print("ELEVENLABS_API_KEY が未設定です")
        return []

    req = urllib.request.Request("https://api.elevenlabs.io/v1/voices")
    req.add_header("xi-api-key", ELEVENLABS_API_KEY)

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())

        voices = data.get("voices", [])
        print("\n利用可能な音声一覧:")
        for v in voices:
            labels = v.get("labels", {})
            lang = labels.get("language", "")
            if "ja" in lang.lower() or "japanese" in lang.lower() or not lang:
                print(f"  ID: {v['voice_id']} | 名前: {v['name']} | 言語: {lang}")

        return voices

    except Exception as e:
        print(f"[VOICE] 音声一覧取得エラー: {e}")
        return []


# ── CLIエントリーポイント ─────────────────────────────────
def main():
    import argparse

    parser = argparse.ArgumentParser(description="voice_agent.py — 日本語音声AI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # speak コマンド
    p_speak = subparsers.add_parser("speak", help="テキストを音声で読み上げる")
    p_speak.add_argument("text", help="読み上げるテキスト")
    p_speak.add_argument("--smart", action="store_true", help="Claudeで文章を最適化してから読み上げ")

    # notify コマンド
    p_notify = subparsers.add_parser("notify", help="開発イベントを音声通知")
    p_notify.add_argument("event", choices=["start", "complete", "error", "pr_created",
                                             "trademark_risk", "test_fail", "test_pass"])
    p_notify.add_argument("--details", default="", help="詳細情報")

    # voices コマンド
    subparsers.add_parser("voices", help="利用可能な音声一覧を表示")

    # test コマンド
    subparsers.add_parser("test", help="音声テスト")

    args = parser.parse_args()

    if args.command == "speak":
        text = args.text
        if args.smart:
            text = generate_smart_response(text)
            print(f"[最適化後] {text}")
        audio = text_to_speech(text)
        if audio:
            play_audio(audio)

    elif args.command == "notify":
        speak_notification(args.event, args.details)

    elif args.command == "voices":
        list_voices()

    elif args.command == "test":
        print("=== 音声テスト ===")
        print(f"ELEVENLABS_API_KEY: {'設定済み ✅' if ELEVENLABS_API_KEY else '未設定 ❌'}")
        print(f"ANTHROPIC_API_KEY: {'設定済み ✅' if ANTHROPIC_API_KEY else '未設定 ❌'}")

        if ELEVENLABS_API_KEY:
            print("\nテスト音声を生成中...")
            speak_notification("complete", "システムテスト")
        else:
            print("\nELEVENLABS_API_KEYを.envに設定してください")
            print("取得先: https://elevenlabs.io/")


if __name__ == "__main__":
    main()
