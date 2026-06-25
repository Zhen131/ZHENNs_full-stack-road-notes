# Ledger Context Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立一套可自动发现、按任务加载材料、保存当前开发位置的账本项目上下文系统。

**Architecture:** 根目录 `AGENTS.md` 只承担 Codex 自动发现和固定边界；项目级 Skill 位于 `.agents/skills/ledger-workflow/`，负责写代码、Git、讨论、继续和日志五种模式的上下文路由。动态状态保存在 `01一些进度/日志/00-当前开发状态.md`，长期使用说明继续保存在现有 AI 指南中；设计、计划和管理说明集中放入 `99_tool/`。

**Tech Stack:** Markdown、Codex `AGENTS.md`、Codex Agent Skills、Git、shell 静态验证。

**Status:** 已按计划实施；最终验证与提交记录以 Git 历史为准。

---

## 文件结构

| 路径 | 操作 | 职责 |
| --- | --- | --- |
| `AGENTS.md` | 新建 | Codex 自动加载的项目级固定规则和入口 |
| `.agents/skills/ledger-workflow/SKILL.md` | 新建 | 五种账本任务模式的按需工作流 |
| `01一些进度/日志/00-当前开发状态.md` | 新建 | 当前阶段、下一步和验证结果的动态快照 |
| `00开始前的一些准备文件/00A-全栈之路AI助手使用指南.md` | 修改 | 长期目录语义、口令用法和维护规则 |
| `99_tool/2026-06-25-ledger-context-workflow-design.md` | 保留用户移动 | 已批准的设计依据 |
| `99_tool/2026-06-25-ledger-context-workflow-implementation-plan.md` | 新建 | 本实施计划 |
| `99_tool/账本上下文系统使用说明.md` | 新建 | 集中管理入口和用户速查说明 |

### Task 1: 固化目录整理与实施基线

**Files:**
- Verify: `99_tool/2026-06-25-ledger-context-workflow-design.md`
- Verify: `99_tool/installed-skills-summary.md`
- Create: `99_tool/2026-06-25-ledger-context-workflow-implementation-plan.md`

- [ ] **Step 1: 检查用户移动后的文件**

Run:

```bash
test -f '99_tool/2026-06-25-ledger-context-workflow-design.md'
test -f '99_tool/installed-skills-summary.md'
```

Expected: exit code `0`。

- [ ] **Step 2: 确认设计内容仍包含实施边界和验收标准**

Run:

```bash
rg -n '^## (实施边界|验收标准|用户日常用法)$' \
  '99_tool/2026-06-25-ledger-context-workflow-design.md'
```

Expected: 三个标题均匹配。

### Task 2: 创建自动发现入口

**Files:**
- Create: `AGENTS.md`

- [ ] **Step 1: 写入项目级固定规则**

文件必须包含：

```markdown
# 账本项目协作规则

- 本工作区默认服务于 Local-First Trading Ledger。
- 开始任务时先判断模式，再读取最小必要上下文。
- 动态进度以 `01一些进度/日志/00-当前开发状态.md` 为入口。
- `00frappe-books-typescript/` 是外部参考，不是用户源码。
- 源码仓库与根文档仓库是两个独立 Git 仓库。
- 永不主动读取或提交私人网络环境说明。
- 账本任务按 `.agents/skills/ledger-workflow/SKILL.md` 执行。
```

完整文件还需定义默认读取顺序、仓库边界、验证与状态更新规则。

- [ ] **Step 2: 验证入口不包含动态进度**

Run:

```bash
rg -n '当前里程碑|正在进行|下一步.*未实现盈亏' AGENTS.md
```

Expected: 无匹配，exit code `1`。

- [ ] **Step 3: 验证关键安全规则存在**

Run:

```bash
rg -n '外部参考|两个独立 Git 仓库|永不主动读取|ledger-workflow' AGENTS.md
```

Expected: 四类规则均匹配。

### Task 3: 创建账本工作流 Skill

**Files:**
- Create: `.agents/skills/ledger-workflow/SKILL.md`

- [ ] **Step 1: 写入 Skill 元数据**

```yaml
---
name: ledger-workflow
description: Use for work in the Local-First Trading Ledger workspace, including ledger coding, Git operations, architecture discussion, continuing current work, and writing development logs. Trigger on Chinese phrases such as 账本写代码、账本 Git、账本讨论、账本继续、账本日志, or equivalent direct ledger tasks.
---
```

- [ ] **Step 2: 写入五种任务路由**

Skill 必须明确：

```text
写代码 → 当前状态 + README + 源码 Git + 相关代码/测试
Git → 识别目标仓库 + status/branch/log/diff
讨论 → 当前状态 + 相关需求/设计，必要时再读代码或外部参考
继续 → 当前状态 + 当前周计划 + README + 两仓库状态
日志 → 当前状态 + 当前周计划 + 实际变更和测试结果
```

- [ ] **Step 3: 写入扩展读取和收尾规则**

必须禁止默认全仓扫描，并规定只有在实质进展、里程碑或下一步变化时更新当前状态。

- [ ] **Step 4: 验证 Skill 结构**

Run:

```bash
test -f '.agents/skills/ledger-workflow/SKILL.md'
rg -n '^name: ledger-workflow$|^description:|写代码|Git|讨论|继续|日志|默认禁止|当前开发状态' \
  '.agents/skills/ledger-workflow/SKILL.md'
```

Expected: 文件存在，元数据与五种模式全部匹配。

### Task 4: 初始化当前开发状态

**Files:**
- Create: `01一些进度/日志/00-当前开发状态.md`
- Read: `01一些进度/产出/LocalFirstTradingLedger/README.md`
- Read: `01一些进度/日志/week2_260619/00_W2_每日执行清单.md`

- [ ] **Step 1: 从可验证事实提取状态**

状态必须以源码 README、当前周计划、源码仓库 Git 历史和测试事实为依据，不从聊天记忆猜测。

- [ ] **Step 2: 写入固定结构**

```markdown
# 当前开发状态

更新时间 / 当前阶段 / 当前里程碑

## 已完成
## 正在进行
## 下一步
## 阻塞与风险
## 关键入口文件
## 最近验证结果
## 维护规则
```

- [ ] **Step 3: 验证状态与源码事实一致**

Run:

```bash
rg -n 'Week 2|36 passed|tradeValidator|positionCalculator|未实现盈亏' \
  '01一些进度/日志/00-当前开发状态.md'
```

Expected: 当前阶段、已完成模块、最近测试和下一步均匹配。

### Task 5: 修订 AI 使用指南

**Files:**
- Modify: `00开始前的一些准备文件/00A-全栈之路AI助手使用指南.md`

- [ ] **Step 1: 将固定阅读顺序改成任务路由**

指南应指向：

```text
固定规则 → /AGENTS.md
任务流程 → /.agents/skills/ledger-workflow/SKILL.md
动态进度 → /01一些进度/日志/00-当前开发状态.md
设计与维护 → /99_tool/
```

- [ ] **Step 2: 写入用户口令和直接任务用法**

必须包含：

```text
账本写代码：……
账本 Git：……
账本讨论：……
账本继续
账本日志：……
```

同时说明口令不是强制格式，直接描述任务也可以。

- [ ] **Step 3: 保留长期项目原则与隐私边界**

保留 P0 主线、小步前进、页面/服务/仓储分层和私人资料保护；删除过时的固定文件阅读顺序。

- [ ] **Step 4: 验证指南引用**

Run:

```bash
rg -n 'AGENTS.md|ledger-workflow|00-当前开发状态.md|账本写代码|账本 Git|账本讨论|账本继续|账本日志' \
  '00开始前的一些准备文件/00A-全栈之路AI助手使用指南.md'
```

Expected: 三个系统入口和五种用法全部匹配。

### Task 6: 创建 99 工具目录管理说明

**Files:**
- Create: `99_tool/账本上下文系统使用说明.md`

- [ ] **Step 1: 写入交付物位置与技术边界**

说明必须明确：设计、计划和管理说明集中在 `99_tool/`；`AGENTS.md` 与 Skill 因 Codex 自动发现规则保留在固定技术路径。

- [ ] **Step 2: 写入日常使用速查**

包含五种推荐口令、直接描述任务的例子、何时更新当前状态，以及遇到错误上下文时如何说“重新按账本工作流定位”。

- [ ] **Step 3: 验证管理说明**

Run:

```bash
rg -n '99_tool|AGENTS.md|\\.agents/skills/ledger-workflow|账本写代码|直接描述' \
  '99_tool/账本上下文系统使用说明.md'
```

Expected: 集中管理说明、技术入口和用法全部匹配。

### Task 7: 全量静态验证与场景验收

**Files:**
- Verify: `AGENTS.md`
- Verify: `.agents/skills/ledger-workflow/SKILL.md`
- Verify: `01一些进度/日志/00-当前开发状态.md`
- Verify: `00开始前的一些准备文件/00A-全栈之路AI助手使用指南.md`
- Verify: `99_tool/账本上下文系统使用说明.md`

- [ ] **Step 1: 检查所有入口文件存在**

Run:

```bash
test -f AGENTS.md
test -f '.agents/skills/ledger-workflow/SKILL.md'
test -f '01一些进度/日志/00-当前开发状态.md'
test -f '00开始前的一些准备文件/00A-全栈之路AI助手使用指南.md'
test -f '99_tool/账本上下文系统使用说明.md'
```

Expected: exit code `0`。

- [ ] **Step 2: 检查 Markdown 和 Git 差异**

Run:

```bash
git diff --check
git status --short
```

Expected: `git diff --check` 无输出；状态只包含本次系统文件和用户已移动的两个 `99_tool` 文件。

- [ ] **Step 3: 场景审查**

逐项确认：

```text
账本写代码 → 不读取全部日志或 Frappe Books
账本 Git → 先区分根仓库和源码仓库
账本讨论 → 外部参考按需读取
账本继续 → 能从状态文件恢复位置
账本日志 → 只记录已验证的实际进展
```

- [ ] **Step 4: 提交**

```bash
git add \
  AGENTS.md \
  .agents/skills/ledger-workflow/SKILL.md \
  '01一些进度/日志/00-当前开发状态.md' \
  '00开始前的一些准备文件/00A-全栈之路AI助手使用指南.md' \
  '99_tool/2026-06-25-ledger-context-workflow-design.md' \
  '99_tool/2026-06-25-ledger-context-workflow-implementation-plan.md' \
  '99_tool/installed-skills-summary.md' \
  '99_tool/账本上下文系统使用说明.md'
git commit -m "feat: add ledger context workflow"
```

Expected: 提交成功，工作树干净。
