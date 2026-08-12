# Week 13 main 源码目录重构主干发布记录

日期：2026-08-12

状态：`主干发布完成；本地与远端源码 main 已同步`

## 结论

用户明确授权后，`zhennn/w13-main-source-layout` 已从源码 `main@7481e78` 纯 fast-forward 合入；原五个搬家提交和两个 R1 提交完整保留，没有 amend、squash、rebase 或额外 merge commit。合并后的质量门全部通过，英文源码 README 已收口，源码 `main` 已推送到 `origin/main@1a7ecb8`。

本次发布不改写 01A—01D 的历史结论。`01D` 仍代表 R1 开发执行 `PASS`，并不伪造一份合并后的独立复审结果。

## 发布提交链

| 类型 | 提交 |
| --- | --- |
| 合并前源码 main | `7481e781dffcd4f444e151d6baaf8778e5b9d170` |
| 原搬家 1 | `92d65fd3580fb2f08605e0e958e707fc1e18cfa5 refactor: establish core source boundaries` |
| 原搬家 2 | `2c6d6b917139339f3de40178501b1f1a5fd9e206 refactor: group storage and integrations under platform` |
| 原搬家 3 | `ad790b2e3d5b3a0c19a67b0971fc2f6822083fd7 refactor: organize product features` |
| 原搬家 4 | `c8a171e8093a1ee160c3cf592cfb5893e388bfdf refactor: align application shell and shared UI` |
| 原搬家 5 | `5d064eb66fb4c9e7c1f3d79c00e7854b088398df chore: enforce and document source layout` |
| R1 结构修复 | `176e9fa365b4cf812394fe5e8c33ee28115697d0 refactor: enforce acyclic source boundaries` |
| R1 picker 修复 | `beef4c897f29b55d4d111c97c765d439cf4f1fe3 fix: allow macOS ledger file selection fallback` |
| README 发布收口 | `1a7ecb8 docs: record Week 13 source layout release` |

## 合并后验证

| 检查 | 结果 |
| --- | --- |
| `npm test` | `59 files / 737 tests PASS` |
| `npm run lint` | `PASS`，0 warning / 0 error |
| `npm run build` | `PASS`，Next.js 15.5.22，`/` 303 kB，First Load JS 406 kB |
| `npm run typecheck` | `PASS` |
| `git diff --check` | `PASS` |
| 源码分支 | `main` |
| 源码远端 | `origin/main@1a7ecb8` |

真实 Chrome 与原生 macOS picker 的 R1 证据见 `01D_W13-main-源码目录重构R1修复报告.md`：虚构 V2 `.lftl` 创建、FeeRule、含费 BTC 买入、手动价格、锁定重开、`All Files` 无 Finder 搜索回退、非 `.lftl` 拒绝、1280 / 390 无整页溢出、console error 0 均通过。

## 文档同步

- 源码仓库 `README.md` 已更新六区结构、59 / 737 基线、picker 回退和独立证据边界。
- 根文档仓库 `01一些进度/日志/00-当前开发状态.md` 已更新当前源码提交、最近验证、下一步和风险。
- 根仓库没有项目级总 README，因此没有制造重复入口；源码英文 README 与当前开发状态继续作为两个主要现行入口。
- `.obsidian/app.json` 是用户已有未提交设置，本次保持原样、不暂存、不提交。

## 边界与下一步

- 本次只发布长期产品 `main`；未进入或修改 `CS2026`、NLP、外部参考项目和个人真实账本。
- 合并与推送不改变 Week 11 `02D / 03B`、Week 12 延期 02C 或 Week 13 独立复审尚未完成的历史事实。
- 下一步优先进行 Week 13 R1 合并后独立复审；复审完成前不把开发执行 `PASS` 扩大为独立 `PASS`。
