"""
OpenClaw RPC 客户端 — 通过 agent --mode rpc 或 agent --message 与 OpenClaw 通信
"""

import subprocess
import json
import os
import uuid
from datetime import datetime
from typing import Optional

OPENCLAW_BIN = "/usr/local/bin/openclaw"
OPENCLAW_CONFIG = "/root/.openclaw/openclaw.json"


def run_agent(message: str, trader_id: str = "default") -> dict:
    """
    调用 OpenClaw agent 执行一次分析/交易任务。
    返回 { "response": str, "error": str | None }
    """
    try:
        result = subprocess.run(
            [OPENCLAW_BIN, "agent", "--message", message, "--json"],
            capture_output=True,
            text=True,
            timeout=120,
            env={
                **os.environ,
                "OPENCLAW_CONFIG": OPENCLAW_CONFIG,
            }
        )

        output = result.stdout.strip() or result.stderr.strip()

        # 尝试解析 JSON
        try:
            data = json.loads(output)
            return {"response": data.get("response", output), "error": None}
        except json.JSONDecodeError:
            return {"response": output, "error": None}

    except subprocess.TimeoutExpired:
        return {"response": "", "error": "OpenClaw agent 执行超时(120s)"}
    except FileNotFoundError:
        return {"response": "", "error": f"找不到 openclaw 命令: {OPENCLAW_BIN}"}
    except Exception as e:
        return {"response": "", "error": f"OpenClaw 调用异常: {str(e)}"}


def extract_decision(text: str) -> Optional[dict]:
    """
    从 OpenClaw 回复中提取结构化决策数据。
    支持 JSON 块解析和自然语言关键词提取。
    """
    import re

    # 1. 找 JSON 代码块
    json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if json_match:
        try:
            data = json.loads(json_match.group(1))
            return data
        except json.JSONDecodeError:
            pass

    # 2. 找行内 JSON
    json_match = re.search(r'(\{.*?"signal".*?\})', text, re.DOTALL)
    if json_match:
        try:
            data = json.loads(json_match.group(1))
            return data
        except json.JSONDecodeError:
            pass

    # 3. 自然语言提取关键词
    signal = None
    confidence = None
    reasoning = text[:500]

    for keyword in ["long", "做多", "买入", "buy"]:
        if keyword in text.lower():
            signal = "long"
            break
    for keyword in ["short", "做空", "卖出", "sell"]:
        if keyword in text.lower():
            signal = "short"
            break
    if not signal:
        signal = "hold"

    # 提取置信度
    conf_match = re.search(r'(?:置信度|confidence|可信度)[：:\s]*(\d+(?:\.\d+)?)%?', text)
    if conf_match:
        confidence = float(conf_match.group(1))
        if confidence > 1:
            confidence = confidence / 100

    return {
        "signal": signal,
        "confidence": confidence or 0.5,
        "reasoning": reasoning[:500],
        "price": None,
        "indicators": None,
    }
