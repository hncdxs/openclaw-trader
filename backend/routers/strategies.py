"""
策略管理路由 — 管理 OpenClaw Skills/策略
"""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

SKILLS_DIR = "/root/.openclaw/workspace/skills"


class StrategyData(BaseModel):
    name: str
    content: str
    enabled: bool = False


@router.get("/")
async def list_strategies():
    """列出所有 SKILL.md 策略文件"""
    if not os.path.isdir(SKILLS_DIR):
        return []
    strategies = []
    for skill_name in os.listdir(SKILLS_DIR):
        skill_dir = os.path.join(SKILLS_DIR, skill_name)
        if os.path.isdir(skill_dir):
            skill_file = os.path.join(skill_dir, "SKILL.md")
            if os.path.isfile(skill_file):
                with open(skill_file) as f:
                    content = f.read()
                strategies.append({
                    "id": skill_name,
                    "name": skill_name,
                    "content": content,
                    "enabled": True,
                })
    return strategies


@router.post("/")
async def save_strategy(data: StrategyData):
    """创建/更新一个策略 SKILL.md"""
    skill_dir = os.path.join(SKILLS_DIR, data.name)
    os.makedirs(skill_dir, exist_ok=True)
    skill_file = os.path.join(skill_dir, "SKILL.md")
    with open(skill_file, "w") as f:
        f.write(data.content)
    return {"status": "saved", "name": data.name}


@router.delete("/{name}")
async def delete_strategy(name: str):
    import shutil
    skill_dir = os.path.join(SKILLS_DIR, name)
    if os.path.isdir(skill_dir):
        shutil.rmtree(skill_dir)
        return {"status": "deleted"}
    raise HTTPException(404, "策略不存在")
