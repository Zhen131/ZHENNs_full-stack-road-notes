# Week 12 main 第 01 批 R1：旧账 Binance 映射静默写回修复报告

日期：2026-08-10

开发结论：`PASS`（仅代表开发候选）

独立验收：`01R1D = PASS`

源码分支：`zhennn/w12-pnl-fee-accounting`

后续收口：冻结候选已 fast-forward 合入源码 `main`；下文“待独立复验／未 merge、未 push”保留为开发报告生成时的历史边界

冻结 HEAD：`605c7a3c2860b7c4783a8234037882ceca1613c8`

冻结 tree：`565e02969409846d5eb0a3d9b46f4f2fffd89efd`

## 结论

原 `01D` 的唯一 P0 已在开发候选中修复：合法 schema v1 / USD 旧账的 BTC Asset 若原本没有 `binanceMapping` key，恢复、水合、普通保存、锁定重开和备份导出都继续保持 key 缺失；运行期只有在 Binance 消费点才临时读取内置默认值，不再把临时值写回正式 `LedgerData`。

开发侧永久回归、完整质量门和全新虚构文件的真实 Chrome 流程均通过。该结果不能替代独立验收：在全新执行者生成 `01R1D = PASS` 前，原 `01D = FAIL` 仍是最新正式独立结论，`PNL-001` 不得协调为完成。

## 一、原因为何成立

原实现把“为运行期方便补默认映射”和“准备持久化的正式事实”混成同一个 normalize 结果。旧 USD 账的 BTC Asset 即使合法地缺少可选字段，也可能在 hydrate / import 后进入带 `BTCUSDT` 的正式 state，并在之后保存或导出时被静默固化。

R1 改为三态持久化合同：

| 输入事实 | 保存与导出 | 运行期读取 |
| --- | --- | --- |
| key 缺失 | 始终缺失 | 内置币种可临时解析默认值，但不改输入 |
| `binanceMapping: null` | 始终为 null | 明确禁用，不补默认值 |
| 明确对象 | 逐字段保留 | 使用明确对象 |

用户主动删除 absent 或 explicit mapping 时会明确写入 `null`；新建 USDT 账本仍在创建阶段明确保存 BTC / ETH / ADA 的内置 mapping。旧 USD 账即使运行期能解析默认 mapping，也仍不能创建 Binance 价格事实。

## 二、实际生产修复

- `src/policies/ledgerFactPolicy.ts`：用纯读取的 `resolveAssetBinanceMappingForRuntime()` 代替会构造持久化视图的 normalize；resolver 不修改 Asset 或 LedgerData。
- `src/backup/backupContentIdentity.ts`：identity 直接绑定已验证的实际候选，absent、null、explicit 不再被归一成同一内容。
- `src/hooks/usePersistentLedger.ts`：hydrate 与 import 直接采用已验证的正式 LedgerData，不再把运行期补全结果写入 state。
- `src/services/binanceMappingService.ts`：按序列化事实比较三态，absent 经用户删除会成为明确 null；运行期签名只读取 resolver。
- `src/services/binancePriceRefreshService.ts`：USDT 刷新目标使用 resolver；异步 merge 前重新核对当前三态与全部 mapping 字段；旧 USD 不产生新 Binance price。
- `src/components/market-data/MarketDataControls.tsx`：界面可显示运行期 fallback，但只有用户明确操作才写 mapping；删除 absent fallback 会写 null。
- `README.md`：记录三态数据不变量、原 `01D` 失败历史、R1 开发证据和待独立复验边界。

没有修改 schemaVersion、`.lftl` fileFormatVersion、BackupEnvelope 版本、IndexedDB 连接结构、KDF、依赖或 lockfile，也没有修改 `CS2026`。

## 三、永久正式回归

新增或改写的关键证明包括：

- `src/policies/ledgerPolicies.test.ts`：absent / null / explicit 三态和 resolver 不修改输入；
- `src/backup/backupImportPreflight.test.ts`：三态 identity 互不相等；
- `src/hooks/usePersistentLedger.fileImport.test.tsx`：import candidate 的缺失 key 原样进入正式 state；
- `src/hooks/usePersistentLedger.test.tsx`：旧 USD 直接水合不自动 save；无关普通保存后仍缺 key；
- `src/services/binanceMappingService.test.ts`：明确 set / modify、absent 删除写 null、null 稳定和运行期签名；
- `src/services/binancePriceRefreshService.test.ts`：USDT absent 运行期 fallback 不物化、null 禁用、旧 USD absent 不写价格、异步响应防护；
- `src/components/market-data/MarketDataControls.test.tsx`：显示 fallback 与用户删除才写 null；
- `src/repositories/ledgerFileRepository.test.ts`：含 USD 买卖、同币手续费和手工价格的完整旧账，经过 preflight、import、新空 C、保存、authenticated readback、重开和 export 后与输入 `toEqual`，并明确断言 BTC 不具有 `binanceMapping` 自有属性。

定向复跑：

```text
npx vitest run ledgerPolicies backupImportPreflight binanceMappingService binancePriceRefreshService MarketDataControls usePersistentLedger usePersistentLedger.fileImport ledgerFileRepository
退出码：0
Test Files：8 passed / 8
Tests：170 passed / 170
skip：0
```

文件安全扩展组：

```text
npx vitest run backupEnvelope backupImportPreflight ledgerDataValidator builtInAssets ledgerRepository ledgerFileRepository usePersistentLedger usePersistentLedger.fileImport BackupControls DashboardShell.golden
退出码：0
Test Files：10 passed / 10
Tests：242 passed / 242
skip：0
```

## 四、完整质量门

在冻结 HEAD `605c7a3` 上重新执行：

| 命令 | 结果 |
| --- | --- |
| `npm test` | 退出码 0；58 / 58 个文件、730 / 730 个测试通过、0 skip |
| `npm run typecheck` | 退出码 0 |
| `npm run lint` | 退出码 0；0 warning |
| `npm run build` | 退出码 0；Next.js 15.5.22 production build 成功 |
| `git diff --check` | 退出码 0 |

额外扫描未发现 `.only`、`.skip`、`debugger`、意外 `console.log` / `console.debug`、schema v2、文件格式升级、依赖变化或 R1 越界模块修改。

## 五、开发侧真实 Chrome 证据

环境：production build，真实 Google Chrome，`http://127.0.0.1:3012`，专用虚构数据；未选择任何个人 `.lftl`。用户只在 macOS 原生文件选择／保存窗口中协助选择指定虚构文件。

输入备份：`/private/tmp/W12-PNL-R1-DEV-FAKE-LEGACY-USD-ABSENT-2026-08-10.json`

专用 C：`/Users/zhuzhen0131/Downloads/W12-PNL-R1-DEV-FAKE-LEGACY-USD-ABSENT-2026-08-10.lftl`

导出备份：`/Users/zhuzhen0131/Downloads/local-first-trading-ledger-backup-v1-20260810-013021Z.json`

虚构输入事实：

- schemaVersion 1，旧 USD 账；
- BTC Asset 没有 `binanceMapping` key；ETH / ADA 为明确 mapping；
- 买入 0.1 BTC，`totalValue = 6500 USD`，fee `5 USD`；
- 卖出 0.04 BTC，`totalValue = 2800 USD`，fee `3 USD`；
- BTC 手工价格 `70000 USD`。

实际流程与结果：

1. preflight 显示 3 assets、2 trades、1 price、0 fee rules、0 hard error、0 suspicious duplicate group；
2. 恢复到全新空 C 并完成加密写入与认证读回；
3. 页面显示买入总成本 6505 USD、卖出净回款 2797 USD、已实现盈亏 195 USD、剩余成本 3903 USD、未实现盈亏 297 USD；
4. 新增 USD 交易、手工价格和 Binance 刷新均为禁用状态；
5. 锁定后用同一专用虚构密码重新打开，数值与禁用状态不变；
6. 导出明文备份后用 `jq` 比较输入与输出的 `.ledgerData`，结果为 `true`；
7. 额外断言输出 schemaVersion 为 1、BTC quoteCurrency 为 USD、fee 仍为 5 与 3、手工价格 currency 为 USD，且 BTC 仍没有 `binanceMapping` key；
8. 页面宽度 1794px，无横向溢出；Chrome 控制台 error 为 0。

输入完整文件 SHA-256：`35561510bb73d6c6f3097be10461cbe712f296f767fa8940e77439702fe22d2a`。

导出完整文件因 `exportedAt` 等 envelope 元数据不同，SHA-256 为 `f538cbb8636c5dd1825c786f9cf4c6cdad55f71d086db025ee35e7dad0efc927`；通过线使用 `.ledgerData` 深度相等，而不是要求整个 envelope 字节相等。

## 六、源码提交与冻结身份

R1 三个本地源码提交：

1. `85b445f24c4d5b1f57a449fdaca1d750d88527d1` — `fix: preserve legacy asset facts during runtime mapping`
2. `9ad0909b9cc91298477d6626b4a5e19f69cff64e` — `test: lock legacy ledger round-trip identity`
3. `605c7a3c2860b7c4783a8234037882ceca1613c8` — `docs: document runtime-only Binance mapping fallback`

冻结现场：

- branch：`zhennn/w12-pnl-fee-accounting`；
- HEAD：`605c7a3c2860b7c4783a8234037882ceca1613c8`；
- tree：`565e02969409846d5eb0a3d9b46f4f2fffd89efd`；
- `main` 与 `origin/main`：`279af4e3248c68306e857b8d0c8eeeaa03a29d6a`；
- 相对 `origin/main`：behind 0 / ahead 9；
- 完整候选 `origin/main...HEAD` binary diff SHA-256：`92da7ff7761edb5f9e9b68209002fb1aa4f974468f76ff93281f4f1b8aa21106`；
- 本次 R1 `1d8603f...HEAD` binary diff SHA-256：`b7ec4eda197eb058f59b0e6151ff9b0071ec020e1e7cadac6caef4c396828227`；
- 源码工作树和暂存区干净，无 untracked；
- 当前分支无 upstream；
- 未 merge、未 push、未 rebase、未设置 upstream；
- `CS2026` 未修改。

## 七、尚待独立执行者证明

全新独立执行者必须重新阅读实际实现和正式测试，独立重跑专项与完整门，并用不同的新虚构 `.lftl` 完成真实 Chrome 全链。尤其要独立证明：

- absent / null / explicit 三态没有第二条物化路径；
- identity 与 repository 实际保存事实一致；
- file safety、异步响应和原 PNL / M 矩阵没有退化；
- 审查前后 HEAD、tree 和完整 diff hash 一致；
- 真实 Chrome 的新输入与最终导出 LedgerData 逐字段相等。

只有新的 `01R1D = PASS` 才允许总控协调 00B、00D 与当前开发状态。Week 11 `02D = BLOCKED` 不受本轮开发证据影响。
