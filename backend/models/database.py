"""
OpenClaw Trader - 数据库模型
基于上一个项目的数据库结构，精简适配 OpenClaw
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Text, Float, Integer, DateTime, Boolean, JSON, func
import enum
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://trader:trader_pass@postgres:5432/crypto_trader")

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class TraderStatus(str, enum.Enum):
    STOPPED = "stopped"
    RUNNING = "running"
    ERROR = "error"


class Trader(Base):
    __tablename__ = "traders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default=TraderStatus.STOPPED.value)
    exchange: Mapped[str] = mapped_column(String(50), nullable=True)
    symbols: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array
    strategy_prompt: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Decision(Base):
    __tablename__ = "decisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    trader_id: Mapped[str] = mapped_column(String(36), nullable=False)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    signal: Mapped[str] = mapped_column(String(10), nullable=False)  # long/short/hold
    confidence: Mapped[float] = mapped_column(Float, nullable=True)
    reasoning: Mapped[str] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=True)
    indicators: Mapped[dict] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ThinkingLog(Base):
    __tablename__ = "thinking_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    trader_id: Mapped[str] = mapped_column(String(36), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=True)
    response: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class LLMConfig(Base):
    __tablename__ = "llm_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    api_key: Mapped[str] = mapped_column(Text, nullable=True)
    api_url: Mapped[str] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session():
    async with async_session() as session:
        yield session
