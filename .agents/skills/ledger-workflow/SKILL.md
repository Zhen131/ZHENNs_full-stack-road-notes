---
name: ledger-workflow
description: Use when working on the Local-First Trading Ledger in this repository, including Chinese requests such as 账本写代码、账本 Git、账本讨论、账本继续、账本日志, or equivalent direct tasks involving ledger code, architecture, progress, documentation, or version control.
---

# Ledger Workflow

## Core rule

Identify the task mode first, then load only the context needed for that mode. Do not scan the full workspace to “understand the project.”

## Start every task

1. Read the repository-root `AGENTS.md`.
2. Read `01一些进度/日志/00-当前开发状态.md` when it exists.
3. Classify the request using the routing table.
4. Confirm which Git repository is in scope before any Git mutation.
5. Search for task-specific files with `rg` or `rg --files`; expand context only when evidence requires it.

## Mode routing

| Mode | Triggers | Default context |
| --- | --- | --- |
| Coding | 写代码、实现、修复、测试、页面、计算 | Current status; source `README.md`; source-repo status; related implementation and tests |
| Git | Git、提交、分支、版本、合并、推送 | Target repo; `status`; branch; recent log; relevant diff |
| Discussion | 讨论、设计、选型、架构、是否应该 | Current status; relevant requirement/design; related code only when it affects the answer |
| Continue | 继续、接着做、下一步、今天做什么 | Current status; current-week plan; source `README.md`; both repo statuses |
| Log | 日志、周报、复盘、记录进度 | Current status; current-week plan; verified Git changes; actual test results; document standard |

If a request mixes modes, use the user’s concrete outcome as the primary mode and add only the secondary context required. Ask a question only when different interpretations would change the write scope or repository.

## Repository boundaries

- Treat the workspace root as the documentation and planning repository.
- Treat `01一些进度/产出/LocalFirstTradingLedger/` as the independent source repository.
- Never combine their status, branch, diff, staging, commits, or pushes.

## Context expansion

Read these only when relevant:

- `00frappe-books-typescript/`: external reference for targeted architecture comparison.
- `02_NLP/`: future ledger integration; use only for NLP tasks.
- `*.canvas`: architecture or data-flow work.
- Historical Week logs: comparison, audit, or missing-current-state recovery.

Never proactively read `00开始前的一些准备文件/99-私人网络环境说明.md`.

## Execution rules

- For coding, inspect tests before editing and run proportionate tests, lint, or build afterward.
- For discussion, remain read-only unless implementation is explicitly requested.
- For Git, show the scoped changes and verify the target repository before staging or committing.
- For logs, record only facts supported by files, Git, or command output.

## Finish the task

Update `01一些进度/日志/00-当前开发状态.md` only when completed work changes the milestone, active work, next step, risk, key entry file, or verified result. Do not update it for ordinary discussion or read-only inspection.

Report:

1. Outcome.
2. Files or repository affected.
3. Verification evidence.
4. Next step, only when useful.

## Common mistakes

- Reading every log or the whole Frappe Books repository.
- Assuming the root and source repositories share Git state.
- Treating placeholder UI data as ledger truth.
- Updating progress from intention instead of verified work.
- Forcing the user to use an exact command phrase when direct language is clear.
