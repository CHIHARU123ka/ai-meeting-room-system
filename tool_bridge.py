#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════
# tool_bridge.py — 商標・特許チェック + スマホ通知 統合ブリッジ
# 使用: python3 tool_bridge.py <command> [options]
# ═══════════════════════════════════════════════════════════

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime
from pathlib import Path

# ── 設定読み込み ────────────────────────────────────────
NTFY_TOPIC    = os.environ.get("NTFY_TOPIC", "")
PUSHOVER_TOKEN = os.environ.get("PUSHOVER_TOKEN", "")
PUSHOVER_USER  = os.environ.get("PUSHOVER_USER", "")
AUDIT_LOG      = Path(os.environ.get("AUDIT_LOG", "./audit_log.json"))
USPTO_API_BASE = "https://developer.uspto.gov/ds-api/trademarks/casefile/records"
JPLATPAT_NOTE  = "J-PlatPatは認証が必要なため、公開検索URLへ誘導します"


# ════════════════════════════════════════════════════════════
# § 通知モジュール
# ════════════════════════════════════════════════════════════

def send_ntfy(title: str, body: str, priority: str = "default", tags: str = "robot") -> bool:
    if not NTFY_TOPIC:
        print("[NTFY] NTFY_TOPIC 未設定 — スキップ", file=sys.stderr)
        return False
    try:
        url = f"https://ntfy.sh/{NTFY_TOPIC}"
        data = body.encode("utf-8")
        req = urllib.request.Request(url, data=data, method="POST")
        req.add_header("Title", title)
        req.add_header("Priority", priority)
        req.add_header("Tags", tags)
        req.add_header("Content-Type", "text/plain; charset=utf-8")
        with urllib.request.urlopen(req, timeout=10) as resp:
            ok = resp.status == 200
            print(f"[NTFY] 送信{'成功' if ok else '失敗'}: {title}")
            return ok
    except Exception as e:
        print(f"[NTFY] エラー: {e}", file=sys.stderr)
        return False


def send_pushover(title: str, body: str, priority: int = 0, url: str = "", url_title: str = "") -> bool:
    if not PUSHOVER_TOKEN or not PUSHOVER_USER:
        print("[PUSHOVER] 認証情報未設定 — スキップ", file=sys.stderr)
        return False
    try:
        payload = {
            "token":   PUSHOVER_TOKEN,
            "user":    PUSHOVER_USER,
            "title":   title,
            "message": body,
            "priority": str(priority),
        }
        if url:
            payload["url"] = url
            payload["url_title"] = url_title or "詳細を確認"

        data = urllib.parse.urlencode(payload).encode("utf-8")
        req = urllib.request.Request(
            "https://api.pushover.net/1/messages.json",
            data=data,
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            ok = result.get("status") == 1
            print(f"[PUSHOVER] 送信{'成功' if ok else '失敗'}: {title}")
            return ok
    except Exception as e:
        print(f"[PUSHOVER] エラー: {e}", file=sys.stderr)
        return False


def notify(title: str, body: str, priority: str = "default",
           pushover_priority: int = 0, url: str = "", url_title: str = "") -> dict:
    """ntfy.sh と Pushover に同時送信"""
    ntfy_ok = send_ntfy(title, body, priority)
    po_ok   = send_pushover(title, body, pushover_priority, url, url_title)
    return {"ntfy": ntfy_ok, "pushover": po_ok}


# ════════════════════════════════════════════════════════════
# § 商標チェックモジュール
# ════════════════════════════════════════════════════════════

def check_trademark_uspto(query: str) -> dict:
    """USPTO公開APIで商標を検索する（認証不要）"""
    try:
        params = urllib.parse.urlencode({
            "q": f'markVerbalElementText:"{query}"',
            "f": "markVerbalElementText,registrationNumber,statusCode,ownerName",
            "rows": 5,
            "start": 0,
        })
        url = f"{USPTO_API_BASE}?{params}"
        req = urllib.request.Request(url)
        req.add_header("Accept", "application/json")

        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())

        hits = data.get("response", {}).get("numFound", 0)
        docs = data.get("response", {}).get("docs", [])

        # アクティブな商標のみフィルタ
        active = [d for d in docs if d.get("statusCode", "") in ("LIVE", "REGISTERED", "6")]

        risk_level = "LOW"
        if active:
            risk_level = "HIGH" if len(active) >= 2 else "MEDIUM"

        return {
            "source": "USPTO",
            "query": query,
            "total_hits": hits,
            "active_hits": len(active),
            "risk_level": risk_level,
            "matches": [
                {
                    "mark": d.get("markVerbalElementText", ""),
                    "owner": d.get("ownerName", ""),
                    "reg_number": d.get("registrationNumber", ""),
                    "status": d.get("statusCode", ""),
                }
                for d in active[:3]
            ],
            "searched_at": datetime.utcnow().isoformat(),
        }

    except urllib.error.HTTPError as e:
        return {
            "source": "USPTO",
            "query": query,
            "error": f"HTTP {e.code}: {e.reason}",
            "risk_level": "UNKNOWN",
        }
    except Exception as e:
        return {
            "source": "USPTO",
            "query": query,
            "error": str(e),
            "risk_level": "UNKNOWN",
        }


def check_trademark_jplatpat(query: str) -> dict:
    """J-PlatPat検索URL生成（API認証が必要なため直接検索URLを返す）"""
    encoded = urllib.parse.quote(query)
    search_url = (
        f"https://www.j-platpat.inpit.go.jp/s0100"
        f"#/jpp/JP/TRADEMARK/texts?query={encoded}"
    )
    return {
        "source": "J-PlatPat",
        "query": query,
        "note": JPLATPAT_NOTE,
        "manual_check_url": search_url,
        "risk_level": "MANUAL_CHECK_REQUIRED",
        "searched_at": datetime.utcnow().isoformat(),
    }


def run_trademark_check(query: str, save_log: bool = True) -> dict:
    """商標チェックを実行してログに保存"""
    print(f"[TRADEMARK] 商標チェック開始: '{query}'")

    uspto_result = check_trademark_uspto(query)
    jplatpat_result = check_trademark_jplatpat(query)

    # 総合リスク判定
    risk_map = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1, "UNKNOWN": 0, "MANUAL_CHECK_REQUIRED": 0}
    max_risk_val = max(
        risk_map.get(uspto_result.get("risk_level", "UNKNOWN"), 0),
        risk_map.get(jplatpat_result.get("risk_level", "UNKNOWN"), 0),
    )
    risk_reverse = {v: k for k, v in risk_map.items()}
    overall_risk = risk_reverse.get(max_risk_val, "UNKNOWN")

    result = {
        "query": query,
        "overall_risk": overall_risk,
        "recommendation": _get_recommendation(overall_risk),
        "uspto": uspto_result,
        "jplatpat": jplatpat_result,
        "checked_at": datetime.utcnow().isoformat(),
    }

    if save_log:
        _append_audit_log("trademark", result)

    # 高リスク時は通知
    if overall_risk in ("HIGH", "CRITICAL"):
        notify(
            title=f"⚠️ 商標リスク検出: {query}",
            body=f"リスクレベル: {overall_risk}\n{result['recommendation']}",
            priority="high",
            pushover_priority=1,
        )

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result


def _get_recommendation(risk_level: str) -> str:
    mapping = {
        "LOW":    "✅ 使用可能と判断されます（最終確認は弁理士推奨）",
        "MEDIUM": "⚠️ 類似商標が存在します。名称変更を検討してください",
        "HIGH":   "❌ 競合商標が存在します。名称を変更してください",
        "CRITICAL": "🚨 完全一致の登録商標が存在します。即時使用停止",
        "UNKNOWN": "🔍 チェック失敗。手動で確認してください",
        "MANUAL_CHECK_REQUIRED": "🔍 手動確認が必要です",
    }
    return mapping.get(risk_level, "不明")


# ════════════════════════════════════════════════════════════
# § 監査ログモジュール
# ════════════════════════════════════════════════════════════

def _append_audit_log(check_type: str, result: dict):
    """audit_log.jsonに結果を追記"""
    try:
        if AUDIT_LOG.exists():
            with open(AUDIT_LOG) as f:
                log_data = json.load(f)
        else:
            log_data = {"entries": []}

        log_data["entries"].append({
            "type": check_type,
            "timestamp": datetime.utcnow().isoformat(),
            **result,
        })
        log_data["last_updated"] = datetime.utcnow().isoformat()
        log_data["total_checks"] = len(log_data["entries"])

        with open(AUDIT_LOG, "w") as f:
            json.dump(log_data, f, ensure_ascii=False, indent=2)

        print(f"[AUDIT_LOG] 記録完了: {AUDIT_LOG}")

    except Exception as e:
        print(f"[AUDIT_LOG] 書き込みエラー: {e}", file=sys.stderr)


def show_audit_summary():
    """監査ログのサマリーを表示"""
    if not AUDIT_LOG.exists():
        print("audit_log.json が存在しません")
        return

    with open(AUDIT_LOG) as f:
        log_data = json.load(f)

    entries = log_data.get("entries", [])
    print(f"\n═══ 監査ログサマリー ═══")
    print(f"総チェック数: {len(entries)}")
    print(f"最終更新: {log_data.get('last_updated', 'N/A')}")

    risk_counts = {}
    for e in entries:
        r = e.get("overall_risk", e.get("risk_level", "UNKNOWN"))
        risk_counts[r] = risk_counts.get(r, 0) + 1

    print("\nリスク別集計:")
    for risk, count in sorted(risk_counts.items()):
        print(f"  {risk}: {count}件")


# ════════════════════════════════════════════════════════════
# § CLIエントリーポイント
# ════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="tool_bridge.py — 商標チェック・通知・監査ログ統合ツール"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # notify コマンド
    p_notify = subparsers.add_parser("notify", help="スマホ通知を送信")
    p_notify.add_argument("--title",    required=True)
    p_notify.add_argument("--body",     required=True)
    p_notify.add_argument("--priority", default="default",
                          choices=["min", "low", "default", "high", "urgent"])
    p_notify.add_argument("--url",      default="")
    p_notify.add_argument("--url-title", default="")

    # trademark コマンド
    p_tm = subparsers.add_parser("trademark", help="商標チェックを実行")
    p_tm.add_argument("query", help="チェックする商標・名称")
    p_tm.add_argument("--no-save", action="store_true", help="ログを保存しない")

    # audit コマンド
    subparsers.add_parser("audit", help="監査ログのサマリーを表示")

    # test コマンド
    subparsers.add_parser("test", help="接続テスト（通知・API疎通確認）")

    args = parser.parse_args()

    if args.command == "notify":
        priority_map = {"min": -2, "low": -1, "default": 0, "high": 1, "urgent": 2}
        result = notify(
            title=args.title,
            body=args.body,
            priority=args.priority,
            pushover_priority=priority_map.get(args.priority, 0),
            url=args.url,
            url_title=args.url_title,
        )
        sys.exit(0 if any(result.values()) else 1)

    elif args.command == "trademark":
        result = run_trademark_check(args.query, save_log=not args.no_save)
        risk = result.get("overall_risk", "UNKNOWN")
        sys.exit(0 if risk in ("LOW", "MANUAL_CHECK_REQUIRED") else 1)

    elif args.command == "audit":
        show_audit_summary()

    elif args.command == "test":
        print("=== 接続テスト ===")
        print(f"NTFY_TOPIC: {'設定済み ✅' if NTFY_TOPIC else '未設定 ❌'}")
        print(f"PUSHOVER_TOKEN: {'設定済み ✅' if PUSHOVER_TOKEN else '未設定 ❌'}")

        print("\n[USPTO] テスト検索: 'TestBrand'")
        r = check_trademark_uspto("TestBrand")
        print(f"  → ステータス: {'成功 ✅' if 'error' not in r else '失敗 ❌'}")

        if NTFY_TOPIC or (PUSHOVER_TOKEN and PUSHOVER_USER):
            print("\n[通知] テスト送信中...")
            notify("🧪 tool_bridge テスト", "接続確認用テスト通知です")
        else:
            print("\n[通知] 認証情報未設定のためスキップ")

        print("\nテスト完了")


if __name__ == "__main__":
    main()
