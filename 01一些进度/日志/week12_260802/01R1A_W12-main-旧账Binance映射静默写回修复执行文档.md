# Week 12 main 第 01 批 R1：旧账 Binance 映射静默写回修复执行文档

日期：2026-08-10

状态：已执行；01R1B 开发侧 `PASS`，01R1D 独立 `PASS`，修复已合入源码 `main`

源码轨道：`01一些进度/产出/LocalFirstTradingLedger/`

源码分支：`zhennn/w12-pnl-fee-accounting`

阻塞来源：`01D_W12-main-手续费进入成本与净盈亏独立审查报告.md` 的唯一 P0

固定开发报告：`01R1B_W12-main-旧账Binance映射静默写回修复报告.md`

固定独立复验输入：`01R1C_W12-main-旧账Binance映射静默写回独立复验执行文档.md`

## 结论与唯一目标

本轮只修复一个已复现的事实改写问题：合法版本 1 / USD 旧账中，BTC Asset 的可选 `binanceMapping` 字段原本缺失，经过恢复、加载和保存后却被静默补成 `BTCUSDT`。

采用已经确定的方案：

```text
持久化 LedgerData 保留原始三态
→ 只有真正需要 Binance 映射的运行期读取点可临时推导默认值
→ 临时值不进入 state、reducer、备份、.lftl 或 IndexedDB
```

本轮不拒绝旧账、不弹升级确认、不改 schema，也不建设迁移系统。通过线是旧账保存前后的 LedgerData 逐字段深度相等，并且新 USDT 账本和 Binance 行情不退化。

## 一、冻结现场与 Git 边界

执行文档建立前的只读现场：

- 根文档仓库：`main`；原始 `01D = FAIL` 已单独提交为 `088109f`；相对 `origin/main` 为 ahead 2；
- 源码仓库：`zhennn/w12-pnl-fee-accounting`；HEAD `1d8603f8747f64a5aff5fd94cefb8f96c01290e9`；tree `575ef0775f4fabf52be6431101beae4bc5812e19`；相对 `origin/main` 为 `0/6`；无 upstream；工作树干净；
- 源码 `main` 与 `origin/main` 均为 `279af4e3248c68306e857b8d0c8eeeaa03a29d6a`；
- `LocalFirstTradingLedger-CS2026/` 不在本轮范围内。

执行时以实时现场为准。出现无法解释的源码漂移、重叠用户改动或分支错误时停止，不覆盖、不清理、不回退。

已授权的 Git 操作仅限：

- 根文档仓库按中文标题小批次本地提交；
- 源码分支按英文标题小批次本地提交；
- 不 merge、不 push、不 rebase、不 cherry-pick、不 amend、不 squash、不设置 upstream、不删除分支；
- 根文档与源码不得混入同一提交；
- 不修改 `CS2026`。

## 二、持久化事实的三态合同

| 输入状态 | 正式 LedgerData / 保存 / 导出 | 运行期行为 |
| --- | --- | --- |
| 字段缺失 | 始终保持缺失 | 仅在真正需要映射时可读取内置默认值；不得写回 |
| `binanceMapping: null` | 始终保持 `null` | 表示用户明确禁用；不得重新推导默认值 |
| 明确 mapping 对象 | 对象逐字段原样保留 | 使用该明确对象；不得替换成默认值 |

额外要求：

1. 新建 USDT 账本的 BTC / ETH / ADA 继续在创建时明确写入内置 mapping；这属于新账事实，不是旧账运行期迁移。
2. 用户主动新增或修改 mapping 时写入明确对象。
3. 用户主动删除 mapping 时必须明确写入 `null`；即使删除前字段缺失，也不能因“缺失与 null 都没有对象”而错误 no-op。
4. 旧 USD 账仍可打开、读取、计算、保存、锁定和重开；仍禁止新增 USD 交易、手工价格和 Binance 价格事实。
5. 不建立第二份可写 LedgerData，也不在 UI 或 Hook 中缓存一个会被保存的“runtime normalized ledger”。

## 三、必须核对和修复的完整数据链

```text
旧备份或旧 .lftl
→ validateLedgerData
→ backup preflight / candidate
→ import 或 hydrate
→ 正式 React state
→ 运行期 Binance resolver
→ content identity
→ repository 写入与 revision
→ close / readback / 双代
→ lock / reopen
→ 备份导出
```

逐节点要求：

1. Validator 只验证并保留输入事实，不能补 mapping。
2. Preflight candidate 保持原始合法 LedgerData；确认凭证绑定这个精确 candidate。
3. Hydrate 直接把已验证的已保存 LedgerData 作为正式 state，不得用补全结果替换。
4. Import 序列化、identity 比较和 repository 写入都使用同一精确 candidate。
5. `createLedgerDataContentIdentity()` 必须表示实际准备保存的事实；字段缺失、`null` 和明确对象应是不同身份。
6. Runtime resolver 只能返回只读使用值，不能修改 Asset 或 LedgerData。
7. Binance 刷新仍只允许 `quoteCurrency === "USDT"`；旧 USD 资产即使可临时解析默认 mapping，也不能产生新价格事实。
8. Merge 时再次核对当前有效 mapping，保持异步响应防护；用户在请求期间删除或修改 mapping 后，旧响应不能写入。
9. Repository 的 import authorization、写前复核、revision、双代、close-readback、恢复和 session lease 合同不得弱化。
10. 导出使用正式 LedgerData，而不是运行期推导视图。

可以删除或替换 `normalizeLedgerDataForRuntime()`；若引入 resolver，名称必须明确表达“读取期临时解析”，不能保留一个会改写持久化事实的模糊 normalize 接口。

## 四、生产代码允许范围

优先只修改与本 P0 直接相关的最小职责面：

- `src/policies/ledgerFactPolicy.ts`
- `src/backup/backupContentIdentity.ts`
- `src/hooks/usePersistentLedger.ts`
- `src/services/binancePriceRefreshService.ts`
- `src/services/binanceMappingService.ts`
- 上述文件的正式测试
- 为完整文件往返证据所需的既有 backup / repository / hook 测试
- 源码 `README.md`

除非正式证据表明确有必要，不修改模型、schema、file format、BackupEnvelope 版本、加密、KDF、连接记录、整体 UI 或依赖。

## 五、永久正式回归测试

### 5.1 核心 P0 完整往返

构造合法 v1 / USD LedgerData：

- BTC Asset 的 `quoteCurrency = "USD"`；
- 对象上完全不存在 `binanceMapping` key；
- 包含合法 USD 买卖、同币种手续费和手工价格；
- 不借用真实个人文件。

正式测试完成：

```text
BackupEnvelope preflight
→ candidate authorization
→ 导入新空 C
→ 保存
→ close / authenticated readback
→ lock
→ reopen
→ export BackupEnvelope
```

最终 `exported.ledgerData` 与最初输入 `toEqual`，并使用 `Object.hasOwn(..., "binanceMapping")` 明确证明 key 仍缺失。

### 5.2 直接水合与普通保存

- Repository.load 返回缺 mapping 的合法旧账；Hook ready 后正式 LedgerData 仍缺字段；
- 页面挂载没有自动 save；
- 执行一个与 mapping 无关的合法普通修改并保存后，保存参数中的旧 Asset 仍缺字段；
- 重挂载或重开后仍缺字段。

### 5.3 三态、身份和显式操作

- resolver 对 absent 返回运行期默认，但输入对象 key 仍缺失；
- resolver 对 null 返回无映射；
- resolver 对 explicit 返回原对象语义；
- identity 对 absent、null、explicit 三者互不等同；
- preflight identity 与 repository 实际 candidate identity 一致；
- 用户 set / modify mapping 保存明确对象；
- 用户 delete 对 explicit 与 absent 都写 `null`；之后 resolver 不补回。

### 5.4 新账与 Binance 回归

- 新建 USDT BTC / ETH / ADA 仍带正确明确 mapping；
- USDT absent built-in 可在运行期刷新但不物化 Asset 字段；
- null 禁用刷新；explicit 自定义 mapping 按原样使用；
- 旧 USD absent 不调用 Binance、不合并 API 快照；
- 请求过程中 mapping 三态或内容变化时旧响应不写入；
- Binance 失败保留已有价格，不写 `0`。

### 5.5 文件安全与异步回归

重跑并保留既有正式测试对下列行为的证明：

- import confirmation 与 candidate identity；
- 非空 C 拒绝、hard error / 可疑重复确认门；
- revision 与双代；
- write / close / readback 失败后的精确恢复；
- 无法证明恢复时进入 recovery-blocked；
- session quiesce、旧 Promise 和旧文件选择结果不能重新获得写入机会。

旧的“自动补写 mapping 是正确行为”测试必须改成三态、精确 identity 与完整往返断言，不能只删除旧断言。

## 六、开发验证与质量门

先运行受影响定向测试，至少覆盖：

```text
ledgerFactPolicy / ledgerPolicies
backupContentIdentity / backupImportPreflight
binanceMappingService / binancePriceRefreshService
usePersistentLedger hydration / file import
ledgerRepository / ledgerFileRepository import and recovery
builtInAssets / ledgerDataValidator
MarketDataControls mapping operations and async response guards
```

随后必须完整运行：

```bash
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

并扫描 `.only`、`.skip`、`debugger`、意外 `console.log` / `console.debug`、schema / 文件格式越界、依赖变化和无关修改。测试数字以实际输出为准。

开发侧还要在 production build + 真实 Google Chrome 中，用全新专用虚构 v1 / USD 文件复现原路径。若 macOS 文件选择器或密码窗口需要用户操作，先说明当前窗口、填写内容和按钮，并等待用户回复“好了”。不得选择任何个人 `.lftl`。

## 七、开发报告与源码提交

源码按真实关键节点使用英文标题本地提交，建议：

1. `fix: preserve legacy asset facts during runtime mapping`
2. `test: lock legacy ledger round-trip identity`
3. `docs: document runtime-only Binance mapping fallback`

提交前逐个核对暂存文件，不能夹带无关变化。完成后生成 `01R1B`，至少记录：

- 原因与实际修法；
- 生产代码和测试文件；
- 定向与全量门的命令、退出码、文件数、测试数；
- 开发侧 Chrome 的全新虚构文件、步骤和原始 JSON 证据；
- 源码提交列表、最终 HEAD / tree / 完整 diff hash；
- 工作树是否干净、无 upstream、未 merge / push；
- 尚待全新独立执行者证明的风险。

`01R1B` 只代表开发候选，不得写成最终独立 PASS。

## 八、停止线

以下任一情况必须据实停止或在 R1B 披露：

- 合法旧账仍被拒绝或任一字段被静默改写；
- absent / null / explicit 三态被合并；
- identity 与实际保存内容不一致；
- import、revision、close-readback、恢复或异步安全测试退化；
- 完整质量门非零；
- 候选漂移、分支不符或出现无法解释的用户改动；
- 真实 Chrome 关键证据无法取得。

开发完成后必须冻结候选，再由全新独立执行者只按 `01R1C` 生成 `01R1D`。只有 `01R1D = PASS`，总控才可协调更新 00B、00D 与当前开发状态。
