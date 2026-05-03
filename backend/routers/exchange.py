"""
交易所管理路由 — 管理 OKX 交易所账户配置
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from typing import Optional

from models.database import get_session, LLMConfig

router = APIRouter()


class ExchangeAccountData(BaseModel):
    name: str
    exchange: str = "okx"
    api_key: str
    secret_key: str
    passphrase: str
    is_active: bool = False


@router.get("/accounts")
async def list_accounts(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(LLMConfig))
    accounts = result.scalars().all()
    return [
        {
            "id": a.id,
            "provider": a.provider,
            "model": a.model,
            "api_url": a.api_url,
            "is_active": a.is_active,
        }
        for a in accounts
    ]


@router.post("/accounts")
async def save_account(data: ExchangeAccountData, db: AsyncSession = Depends(get_session)):
    """保存交易所账户（OKX API Key）"""
    # 如果标记为活跃，先将其他设为非活跃
    if data.is_active:
        await db.execute(
            delete(LLMConfig).where(LLMConfig.is_active == True)
        )

    account = LLMConfig(
        provider=data.exchange,
        model=f"{data.exchange}_{data.name}",
        api_key=data.api_key,
        api_url=data.secret_key,  # secret_key 存 api_url 字段
        is_active=data.is_active,
    )
    db.add(account)
    await db.commit()

    return {"status": "saved", "id": account.id}
