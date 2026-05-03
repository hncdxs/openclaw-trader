-- 初始化数据库脚本
-- 创建 OpenClaw Trader 表结构

CREATE TABLE IF NOT EXISTS traders (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'stopped',
    exchange VARCHAR(50),
    symbols TEXT,
    strategy_prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decisions (
    id SERIAL PRIMARY KEY,
    trader_id VARCHAR(36) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    signal VARCHAR(10) NOT NULL,
    confidence FLOAT,
    reasoning TEXT,
    price FLOAT,
    indicators JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decisions_trader ON decisions(trader_id);
CREATE INDEX IF NOT EXISTS idx_decisions_time ON decisions(created_at DESC);

CREATE TABLE IF NOT EXISTS thinking_logs (
    id SERIAL PRIMARY KEY,
    trader_id VARCHAR(36) NOT NULL,
    prompt TEXT,
    response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_thinking_trader ON thinking_logs(trader_id);
CREATE INDEX IF NOT EXISTS idx_thinking_time ON thinking_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS llm_config (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    api_key TEXT,
    api_url VARCHAR(500),
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO traders (id, name, status, exchange, symbols, strategy_prompt)
VALUES ('demo001', 'BTC 短线交易员', 'stopped', 'okx', '["BTC-USDT"]', '使用EMA12/26和RSI14进行趋势分析，短线交易')
ON CONFLICT (id) DO NOTHING;
