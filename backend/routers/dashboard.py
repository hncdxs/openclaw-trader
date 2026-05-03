"""
看板路由 — 聚合交易员状态、决策日志、Thinking Logs
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from models.database import get_session, Trader, Decision, ThinkingLog

router = APIRouter()


@router.get("/overview")
async def dashboard_overview(db: AsyncSession = Depends(get_session)):
    # 统计
    total = await db.scalar(select(func.count(Trader.id)))
    running = await db.scalar(
        select(func.count(Trader.id)).where(Trader.status == "running")
    )

    # 最近决策
    result = await db.execute(
        select(Decision).order_by(desc(Decision.created_at)).limit(10)
    )
    decisions = result.scalars().all()

    return {
        "total_traders": total or 0,
        "running_traders": running or 0,
        "recent_decisions": [
            {
                "id": d.id,
                "trader_id": d.trader_id,
                "symbol": d.symbol,
                "signal": d.signal,
                "confidence": d.confidence,
                "price": d.price,
                "time": d.created_at.isoformat() if d.created_at else None,
            }
            for d in decisions
        ],
    }


@router.get("/traders")
async def dashboard_traders(db: AsyncSession = Depends(get_session)):
    """返回所有交易员及最新决策"""
    result = await db.execute(select(Trader).order_by(desc(Trader.created_at)))
    traders = result.scalars().all()

    data = []
    for t in traders:
        # 查最新决策
        dec_result = await db.execute(
            select(Decision)
            .where(Decision.trader_id == t.id)
            .order_by(desc(Decision.created_at))
            .limit(1)
        )
        last_dec = dec_result.scalar_one_or_none()

        data.append({
            "id": t.id,
            "name": t.name,
            "status": t.status,
            "exchange": t.exchange,
            "symbols": t.symbols,
            "last_decision": {
                "signal": last_dec.signal,
                "confidence": last_dec.confidence,
                "price": last_dec.price,
                "time": last_dec.created_at.isoformat() if last_dec and last_dec.created_at else None,
            } if last_dec else None,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        })

    return data


@router.get("/decisions")
async def list_decisions(
    limit: int = 50,
    trader_id: str = None,
    db: AsyncSession = Depends(get_session),
):
    query = select(Decision).order_by(desc(Decision.created_at))
    if trader_id:
        query = query.where(Decision.trader_id == trader_id)
    query = query.limit(limit)

    result = await db.execute(query)
    decisions = result.scalars().all()

    return [
        {
            "id": d.id,
            "trader_id": d.trader_id,
            "symbol": d.symbol,
            "signal": d.signal,
            "confidence": d.confidence,
            "reasoning": d.reasoning,
            "price": d.price,
            "indicators": d.indicators,
            "time": d.created_at.isoformat() if d.created_at else None,
        }
        for d in decisions
    ]


@router.get("/thinking-logs")
async def list_thinking_logs(
    limit: int = 20,
    trader_id: str = None,
    db: AsyncSession = Depends(get_session),
):
    query = select(ThinkingLog).order_by(desc(ThinkingLog.created_at))
    if trader_id:
        query = query.where(ThinkingLog.trader_id == trader_id)
    query = query.limit(limit)

    result = await db.execute(query)
    logs = result.scalars().all()

    return [
        {
            "id": l.id,
            "trader_id": l.trader_id,
            "prompt": (l.prompt or "")[:300],
            "response": (l.response or "")[:300],
            "time": l.created_at.isoformat() if l.created_at else None,
        }
        for l in logs
    ]
