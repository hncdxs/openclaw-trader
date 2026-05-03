"""
交易员路由 — 管理交易员的增删改查 + 启动/停止
"""

import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc
from pydantic import BaseModel

from models.database import get_session, Trader, Decision, ThinkingLog
from services.openclaw.client import run_agent, extract_decision

router = APIRouter()


# --- Pydantic 模型 ---

class TraderCreate(BaseModel):
    name: str
    exchange: str = "okx"
    symbols: list[str] = ["BTC-USDT"]
    strategy_prompt: Optional[str] = None


class TraderUpdate(BaseModel):
    name: Optional[str] = None
    symbols: Optional[list[str]] = None
    strategy_prompt: Optional[str] = None


# --- 路由 ---

@router.get("/")
async def list_traders(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Trader).order_by(desc(Trader.created_at)))
    traders = result.scalars().all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "status": t.status,
            "exchange": t.exchange,
            "symbols": t.symbols,
            "strategy_prompt": (t.strategy_prompt or "")[:100],
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None,
        }
        for t in traders
    ]


@router.post("/")
async def create_trader(data: TraderCreate, db: AsyncSession = Depends(get_session)):
    trader_id = str(uuid.uuid4())[:8]
    trader = Trader(
        id=trader_id,
        name=data.name,
        status="stopped",
        exchange=data.exchange,
        symbols=json.dumps(data.symbols) if data.symbols else None,
        strategy_prompt=data.strategy_prompt,
    )
    db.add(trader)
    await db.commit()
    return {"id": trader_id, "name": data.name, "status": "stopped"}


@router.get("/{trader_id}")
async def get_trader(trader_id: str, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Trader).where(Trader.id == trader_id))
    trader = result.scalar_one_or_none()
    if not trader:
        raise HTTPException(404, "交易员不存在")
    return trader


@router.delete("/{trader_id}")
async def delete_trader(trader_id: str, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Trader).where(Trader.id == trader_id))
    trader = result.scalar_one_or_none()
    if not trader:
        raise HTTPException(404, "交易员不存在")
    await db.delete(trader)
    await db.commit()
    return {"status": "deleted"}


@router.post("/{trader_id}/start")
async def start_trader(trader_id: str, db: AsyncSession = Depends(get_session)):
    """启动交易员：调用 OpenClaw agent 进行一次分析"""
    result = await db.execute(select(Trader).where(Trader.id == trader_id))
    trader = result.scalar_one_or_none()
    if not trader:
        raise HTTPException(404, "交易员不存在")

    import json as _json
    try:
        symbols = _json.loads(trader.symbols) if trader.symbols else ["BTC-USDT"]
    except (json.JSONDecodeError, TypeError):
        symbols = ["BTC-USDT"]

    # 构造 prompt：策略 + 市场数据要求
    prompt = f"""
你是一个加密货币交易AI。分析 {symbols[0]} 的行情并给出交易建议。

## 策略
{trader.strategy_prompt or "使用 EMA12/26 和 RSI14 分析趋势，给出 long/short/hold 信号"}

## 要求
1. 通过 MCP 工具 okx_get_klines 获取最近 50 根 5m K 线数据
2. 计算技术指标
3. 输出格式（用 JSON 代码块）：
```json
{{
  "signal": "long/short/hold",
  "confidence": 0.0-1.0,
  "reasoning": "分析理由",
  "price": 当前价格,
  "indicators": {{"ema12": x, "ema26": x, "rsi14": x}}
}}
```
"""
    resp = run_agent(prompt, trader_id)

    # 记录 thinking log
    log = ThinkingLog(
        trader_id=trader_id,
        prompt=prompt[:2000],
        response=resp.get("response", "")[:5000] or resp.get("error", ""),
    )
    db.add(log)

    # 解析决策
    decision_data = extract_decision(resp.get("response", ""))
    if decision_data and decision_data.get("signal") != "hold":
        dec = Decision(
            trader_id=trader_id,
            symbol=symbols[0] if symbols else "BTC-USDT",
            signal=decision_data["signal"],
            confidence=decision_data.get("confidence"),
            reasoning=decision_data.get("reasoning"),
            price=decision_data.get("price"),
            indicators=decision_data.get("indicators"),
        )
        db.add(dec)

    # 更新交易员状态
    trader.status = "running"
    await db.commit()

    return {
        "status": "running",
        "decision": decision_data,
        "error": resp.get("error"),
    }


@router.post("/{trader_id}/stop")
async def stop_trader(trader_id: str, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Trader).where(Trader.id == trader_id))
    trader = result.scalar_one_or_none()
    if not trader:
        raise HTTPException(404, "交易员不存在")
    trader.status = "stopped"
    await db.commit()
    return {"status": "stopped"}


import json as json_module  # 单独导入避免冲突
