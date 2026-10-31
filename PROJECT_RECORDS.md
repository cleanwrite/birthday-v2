# 生日祝福网站 — 项目记录与评估

## 1. 项目概述

| 项目 | 说明 |
|------|------|
| **名称** | 生日祝福网站 (birthday-v2) |
| **网址** | https://birthday-v2.ss20211111705.workers.dev |
| **仓库** | https://github.com/cleanwrite/birthday-v2 |
| **技术栈** | 原生 HTML/CSS/JS + GSAP 3 (动画) |
| **后端** | Cloudflare Workers + KV |
| **目标** | 张子悦 (中文内容) |
| **许可** | MIT License (Copyright 2024 faahim) |
| **部署** | GitHub Pages + Cloudflare Worker 双部署 |

## 2. 功能清单

### 已实现 ✅
- [x] GSAP 3 动画时间轴（开场 → 聊天 → 气球 → 粒子 → 许愿）
- [x] 背景音乐播放/暂停（右上角按钮，校验门页面可用）
- [x] 生日校验门（滚轮式月日选择器，仅 11.22 可通过）
- [x] 校验门错误提示"看样子在等的人不是你呢~"
- [x] 校验门页面音乐提示"点击右上角 🔇 打开音乐"
- [x] 动画开始后音乐提示"🎵 点击右上角开启音乐"（3秒后淡出）
- [x] 生日许愿提交（静默存储到 KV，用户无感知）
- [x] 许愿查看（密码保护 `fw2026`）
- [x] 动画重播（完整循环）
- [x] 内容可配置（customize.json 驱动所有文本）
- [x] 移动端响应式（flexbox 场景居中 + 媒体查询）
- [x] 防缓存版本参数（v=20261004f）
- [x] 性能优化（GSAP DOM 查询预缓存 + 滚轮节流）
- [x] 移动端 100vh 修复（--vh JS polyfill）
- [x] 气球 3×6 绝对定位布局（百分比定位，自适应移动端）
- [x] 场景 flexbox 居中（每个场景独立居中对齐）

## 3. 架构

```
用户 → Cloudflare Worker (反代 GitHub Pages)
         ↓ 静态资源 (HTML/CSS/JS/图片/音乐)
       GitHub Pages (cleanwrite.github.io/birthday-v2)
         ↓ API 调用
       Cloudflare Worker
         ↓ 读写
       Cloudflare KV (BIRTHDAY_WISHES namespace)
```

### 关键文件

| 文件 | 说明 |
|------|------|
| `index.html` | 主页面（单页动画 + 校验门，data-node-name 绑定） |
| `style/style.css` | 样式（flexbox, 滚轮组件, 响应式） |
| `script/main.js` | 校验门逻辑 + GSAP 时间轴 + 许愿逻辑 |
| `customize.json` | 可配置文本内容（所有中文文案） |
| `js/gsap.min.js` | GSAP 3 动画库（72KB，本地副本） |
| `img/` | SVG 气球 ×3, SVG 帽子, PNG favicon |
| `music/birthday.mp3` | 背景音乐（生日快乐 + 20261011_155408 合并） |
| `birthday-worker/worker.js` | Worker 代理 + API |
| `birthday-worker/wrangler.toml` | Worker 配置（KV 绑定） |

## 4. 动画时间轴

| 阶段 | 内容 | 时长 |
|------|------|------|
| 0 | 生日校验门（滚轮选择月/日，仅 11.22 通过） | ∞ |
| 1 | 开场问候淡入淡出 | 2s |
| 2 | 生日宣言 | 2s |
| 3 | 聊天泡泡 UI 逐字打出 | 3s |
| 4 | 思考序列（3D 翻转文字行） | 3s |
| 5 | 大字"生日"旋转缩放爆炸入场 | 2s |
| 6 | 18 个 SVG 气球交错上浮（flexbox 布局） | 4s |
| 7 | 弹性字符动画 + 粉色过渡 | 2s |
| 8 | 粒子爆炸（9 个彩色圆缩放消散） | 1s |
| 9 | 许愿弹窗（动画暂停，等待用户输入） | ∞ |
| 10 | 结尾序列 + 重播按钮 | ∞ |

## 5. 生日校验门

| 项目 | 说明 |
|------|------|
| **交互方式** | 鼠标滚轮 + 触摸滑动 + 点击直接选择 |
| **日期范围** | 月份 1-12，日期 1-31 |
| **正确答案** | 11月22日 |
| **错误提示** | "看样子在等的人不是你呢~" |
| **视觉风格** | 滚轮高亮居中，远处项淡出 |
| **技术方案** | transform:translateY + cubic-bezier 缓动 |
| **节流** | 80ms 防抖，滚轮不跳项 |

## 6. API 端点

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/` | 无 | 反代 GitHub Pages 静态站点 |
| GET | `/assets/*` | 无 | 反代静态资源（缓存 60s） |
| POST | `/api/wish` | 无 | 提交许愿（存储到 KV） |
| GET | `/api/wishes` | key=fw2026 | 查看许愿列表 |

## 7. Git 历史

| 提交 | 说明 |
|------|------|
| ec02d52 | 全面移动端审查修复（字体/气球/视口/布局） |
| 5ba37d2 | 移动端布局修复（flexbox 气球/vh polyfill） |
| 9960287 | 替换生日音频为合并文件 |
| 8bcfd98 | 音乐按钮在校验门页面可见 |
| ef340dc | 加快入场 + 动画后音乐提示 |
| fc3ecaf | 修复按钮误触 + 移除 disabled |
| 5afe7ea | 按钮始终可点击，错误时提示 |
| d598b1b | 更新项目报告 |
| 7e0544c | 性能优化 + 恢复校验门音乐提示 |
| a133e20 | 重写滚轮组件（transform 方案） |
| b0f4ff3 | 添加生日校验门 |
| eaa372b | 修复编码 |
| 6c3d01a | UI 重构 |

## 8. 当前状态

- **分支**: main，与 origin/main 同步
- **工作区**: 干净
- **部署**: GitHub Pages + Cloudflare Worker 双部署
- **内容语言**: 中文（目标：张子悦）
- **音频**: 生日快乐（前）+ 20261011_155408（后），合并 5:21
- **校验**: 11月22日

## 9. 技术评估

### 优点
- 动画流畅（GSAP 60fps），用户体验优秀
- 代码简洁，无框架依赖，无构建步骤
- 双部署冗余（GitHub Pages + Worker）
- 内容可配置（customize.json 驱动）
- 移动端适配完善（vh polyfill + flexbox + 媒体查询）
- 校验门交互流畅（滚轮 + 触摸 + 点击）

### 缺点
- 单文件动画时间轴，维护成本高
- GSAP 库内联 72KB（可考虑 CDN）
- 无构建步骤（无法自动压缩/打包）

## 10. 性能

- **静态资源缓存**: 60s（Worker 反代设置）
- **HTML 缓存**: no-cache（每次验证）
- **GSAP 动画**: 60fps（硬件加速 + will-change）
- **滚轮节流**: 80ms（防抖）
- **DOM 缓存**: 17 个元素预查询
- **vh polyfill**: resize 事件驱动

## 11. 安全

- ✅ CORS 配置
- ✅ 许愿查看密码保护
- ✅ KV 存储无敏感信息
- ✅ 无 XSS 风险

## 12. 维护建议

- 修改内容 → 编辑 `customize.json`
- 修改动画 → 调整 `script/main.js` GSAP 时间轴
- 修改校验日期 → 修改 `TARGET_MONTH` / `TARGET_DAY` 常量
- 替换音频 → 覆盖 `music/birthday.mp3`
