"""
OpenClaw Trader - FastAPI 后端入口
"""

import os
import sys
import uuid

# 将项目根目录加入 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from models.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化数据库
    await init_db()
    yield


app = FastAPI(title="OpenClaw Trader API", version="0.1.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "engine": "openclaw"}


# 导入路由
from routers import traders, dashboard, exchange, strategies

app.include_router(traders.router, prefix="/api/traders", tags=["traders"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(exchange.router, prefix="/api/exchange", tags=["exchange"])
app.include_router(strategies.router, prefix="/api/strategies", tags=["strategies"])
