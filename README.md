# 🦞 OpenClaw Crypto Trader

基于 **OpenClaw** AI 引擎 + **OKX AI Trade Kit** 的加密货币自动交易系统。

## 架构

```
┌──────────────────────────────────────────┐
│  Web UI (React) — 看板 / 策略管理         │
└────────────────┬─────────────────────────┘
                 │ HTTP
┌────────────────▼─────────────────────────┐
│  Backend API (FastAPI)                    │
│  - 交易员 CRUD / 启动停止                  │
│  - OpenClaw RPC 调用                      │
│  - 看板数据聚合                            │
└──┬──────────────────────┬────────────────┘
   │ agent --message       │ SQL
┌──▼────────────────┐  ┌──▼────────────────┐
│  🦞 OpenClaw      │  │  PostgreSQL       │
│  (TypeScript)     │  │  traders/decisions │
│  + OKX MCP Server │  │  thinking_logs    │
└───────────────────┘  └───────────────────┘
```

## 快速启动

```bash
# 1. 复制 .env 并填写 API Key
cp .env.example .env

# 2. 启动
docker compose up -d --build

# 3. 访问
open http://localhost:8080  # Web UI
open http://localhost:8000/docs  # API 文档
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `MINIMAX_API_KEY` | MiniMax 模型 API Key |
| `OKX_API_KEY` | OKX API Key |
| `OKX_SECRET_KEY` | OKX Secret Key |
| `OKX_PASSPHRASE` | OKX Passphrase |

## 交易策略

策略通过 Web UI 中的"策略管理"页面编辑，以 Markdown 格式写入 OpenClaw Skills。
