---
name: ledger-workflow
description: Use when working on the Local-First Trading Ledger in this repository, including product-track requests such as 账本、继续账本 and thesis-track requests such as 论文、继续论文、论文 Git or CS2026, plus coding, architecture, progress, documentation, and version-control tasks.
---

# Ledger Workflow

## Core rule

Select exactly one source track first, then identify the task mode and load only the context needed for it. Do not scan the full workspace to “understand the project.”

## Three maintenance surfaces

Treat the project as three maintenance surfaces, while preserving the fact that they belong to two Git repositories:

| Maintenance surface | Path | Git boundary |
| --- | --- | --- |
| Development logs and plans | workspace root | documentation repository on `main` |
| Long-term ledger product | `01一些进度/产出/LocalFirstTradingLedger/` | source repository `main` worktree |
| Graduation thesis project | `01一些进度/产出/LocalFirstTradingLedger-CS2026/` | the same source repository's `CS2026` worktree |

Do not describe these as three Git repositories. Select only one source worktree per task. Update the root documentation surface alongside it only when verified progress changes a plan, log, status, evidence boundary, or next step.

## Start every task

1. Read the repository-root `AGENTS.md`.
2. Read `01一些进度/日志/00-当前开发状态.md` when it exists.
3. Select the product or thesis track using the track-routing table.
4. Classify the request using the mode-routing table.
5. Before any write or Git mutation, verify that both the actual worktree path and `git branch --show-current` match the selected track. Stop without modifying files if they do not match.
6. If root documentation will change, separately verify that the workspace-root repository is on `main` and inspect its status and diff.
7. Search for task-specific files with `rg` or `rg --files`; expand context only when evidence requires it.

## Track routing

| User wording | Worktree | Required branch |
| --- | --- | --- |
| Any mention of `论文` or `CS2026`, including `继续论文` and `论文 Git` | `01一些进度/产出/LocalFirstTradingLedger-CS2026/` | `CS2026` |
| `继续账本`, only `账本`, or no thesis wording | `01一些进度/产出/LocalFirstTradingLedger/` | `main` |

Thesis wording always wins when a request contains both generic ledger wording and a thesis reference. If the user explicitly names a different track than the routing table, pause and ask before changing either source worktree.

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
- Treat the two `LocalFirstTradingLedger*` directories as separate worktrees of one independent source repository: the original directory is `main`; the `-CS2026` directory is `CS2026`.
- Keep the root documentation repository private permanently because it contains personal development logs. Never change it to public.
- Treat the source repository as public-facing. Before making it public, inspect official branches and tags, PR and Issue metadata, Actions, artifacts, releases, and secret-like content; require explicit user authorization for the visibility change.
- The 2026-08-22 cleanup uses documented risk acceptance: do not file a GitHub Support purge request, and accept that numeric-only matches in old PR refs may remain visible. This decision does not permit any new real user data in Git.
- Treat `/Users/zhuzhen0131/Downloads/history_OKX/` and everything below it as a local-only private data area outside both Git repositories. Never copy, link, stage, commit, or push its raw inputs, scripts, intermediate tables, reports, or B files; never reuse them in PRs, Issues, tests, fixtures, examples, or development logs.
- Read or write that private area only for an explicitly requested real-data conversion or private acceptance task. Report only non-identifying aggregate evidence outside it.
- After any sensitive-history rewrite, continue normal pushes only from local repositories rebuilt from the clean remote history. Never pull, merge, or push from retained old Git metadata.
- Never combine the root repository with source status, diff, staging, commits, or pushes.
- When root documentation and one source track both change, verify and report them separately. If the user also authorizes staging, committing, or pushing, perform those operations separately. A successful source commit is not evidence that the root documentation repository was updated, or vice versa.
- Never create a merge PR between `main` and `CS2026`.
- Never automatically merge, rebase, cherry-pick, copy a fix, or edit both source tracks in one task.
- When one track reveals something useful to the other, record only `可能值得参考` in the current-week log. Reimplement or copy it only after explicit user approval.

## Schema versioning and migration

The ledger carries four independent version numbers. Never merge them, and never bump one because another changed.

| Version | Governs | Where |
| --- | --- | --- |
| `fileFormatVersion` | C file outer structure and generation layout | plaintext |
| `cryptoVersion` | KDF and cipher parameters | plaintext |
| `ledgerSchemaVersion` | ledger data shape: fact kinds and fields | plaintext |
| `backupFormatVersion` | B file envelope: the canonical top-level keys | plaintext |

- Every version number must stay in the plaintext outer layer. Never move one inside the encrypted payload: a low-version file must be identifiable before decryption, or the user only sees an unexplained failure and a future migration chain loses its entry check.
- Bump only the version that actually changed. A data-shape change does not bump `backupFormatVersion`; a KDF change does not bump `ledgerSchemaVersion`.
- **Whenever any version is bumped, add a golden sample file for that version to the source-repo test fixtures in the same change.** Use fictional data only, name the version in the filename, and never modify a golden sample once committed. Without golden samples a future migration must guess the old shape, and a wrong guess is silent data corruption that no test catches.
- Current stage is Alpha: reject every lower version with a clear message, perform no migration, and never overwrite or delete the user's file. After a rejection the user must still be able to create a new ledger and reach the import flow.
- The switch from rejection to migration happens before Beta and only when the user explicitly announces it. Never decide that switch autonomously.
- After that switch the rule is read-old, write-new: maintain a one-way upgrade chain, never write an old format, never downgrade. Each migration step is a pure function, frozen once released, applied in memory only, saved as a new file after explicit user confirmation, and fails closed on error.

Full rationale: `01一些进度/日志/week15_260826/000_W15-账本版本分层与迁移策略决策记录.md`.

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
- Keep source execution notes in the shared week directory, but put the branch in both filename and title, for example `01A_W12-CS2026-...` or `02A_W12-main-...`.
- Keep new commit titles, module documentation, `AGENTS.md`, and release notes in both source tracks in English. The `main` product root `README.md` and product UI are Chinese-first; the tracked `CS2026` worktree, including its root README, must contain no directly written Chinese characters.

## Finish the task

Update `01一些进度/日志/00-当前开发状态.md` only when completed work changes the milestone, active work, next step, risk, key entry file, or verified result. Do not update it for ordinary discussion or read-only inspection.

Report each affected maintenance surface separately, including the root documentation repository when it changed:

1. Outcome.
2. Exact worktree and actual branch.
3. Status and diff scope.
4. Tests or other verification evidence.
5. Commit and push state.
6. Next step, only when useful.

## Common mistakes

- Reading every log or the whole Frappe Books repository.
- Assuming the root and source repositories share Git state.
- Treating `main` and `CS2026` as merge partners or carrying a fix across them without approval.
- Writing to a source worktree before confirming its actual branch.
- Treating placeholder UI data as ledger truth.
- Updating progress from intention instead of verified work.
- Forcing the user to use an exact command phrase when direct language is clear.
