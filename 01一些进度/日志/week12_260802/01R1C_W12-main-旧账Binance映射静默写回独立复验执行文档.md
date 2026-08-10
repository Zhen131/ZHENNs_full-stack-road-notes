# Week 12 main 第 01 批 R1：旧账 Binance 映射静默写回独立复验执行文档

日期：2026-08-10

状态：已由全新独立执行者执行；`01R1D = PASS`

独立输入：原 `01D`、本文件、冻结后的 R1 源码候选与 `01R1B`

唯一允许新增的正式文件：`01R1D_W12-main-旧账Binance映射静默写回独立复验报告.md`

## 结论：本任务不是替开发者盖章

独立执行者必须重新证明原 `01D` 的唯一 P0 是否真实关闭，不能继承开发者的完成判断，也不能预设 PASS。

最终只能据实选择：

- `PASS`：P0、三态、完整旧账往返、身份与文件安全、既有 PNL / M 矩阵、全部质量门和真实 Chrome 都有新证据，候选前后身份一致；
- `FAIL`：存在强制反证、P0 / P1、正式测试或质量门失败，或测试通过依靠删测、skip、放宽身份合同；
- `BLOCKED`：没有强制失败反证，但无法冻结候选或无法取得不可替代的真实 Chrome / 文件证据。

已有强制失败时，即使另有环境阻塞，结论仍优先 `FAIL`。不得为了满足目标强行写成 PASS。

## 一、独立性与只读边界

执行者开始前必须：

1. 完整读取原 `01D`、本文件、`01A`、`01B`、`01C`、`01R1A`、`01R1B`、00B、00D、当前开发状态和源码 README；
2. 记录源码路径、分支、HEAD、tree、工作树、暂存区、未跟踪文件、upstream 与相对 `origin/main` 的 ahead / behind；
3. 记录总控冻结的完整 diff hash，并独立重算；
4. 确认候选仍是 `zhennn/w12-pnl-fee-accounting`，没有合并到 `main`，没有 push 或 upstream；
5. 确认根文档仓库中原 `01D = FAIL` 仍保留。

独立执行期间：

- 正式源码、正式测试、README、Git index 和既有文档保持只读；
- 不修代码、不改测试、不协调 00B / 00D / 当前开发状态、不提交 Git；
- 只能新增或更新唯一的 `01R1D`；
- 临时 fixture、探针、日志和截图放在临时目录，不进入正式源码仓库；
- 不读取或选择任何个人 `.lftl`；
- 若候选身份或正式文件因审查而变化，先停止并披露，不得自行恢复后假装候选未变。

## 二、必须先回答的原 P0 问题

使用全新虚构合法 v1 / USD LedgerData：

- BTC Asset `quoteCurrency = "USD"`；
- 对象上完全没有 `binanceMapping` key；
- 含合法 USD 交易、同币手续费和手工价格；
- schemaVersion 仍为 1。

独立完成并逐节点记录实际数据：

```text
BackupEnvelope preflight
→ candidate 与 identity
→ 恢复到新空 .lftl
→ 普通保存
→ close / authenticated readback
→ 锁定
→ 重开
→ 导出 BackupEnvelope
```

通过线：最终导出的 `ledgerData` 与原输入逐字段深度相等，且 BTC Asset 仍不具有 `binanceMapping` 自有属性。只比较业务金额或 schema 不足以通过。

任一节点物化 `BTCUSDT`、`null` 或其他新字段，按 P0 判 `FAIL`。

## 三、R1 专项矩阵

`01R1D` 必须逐项写结论、源码证据、正式测试证据和运行证据：

| ID | 场景 | 强制通过线 |
| --- | --- | --- |
| `R1-M01` | absent | 正式 LedgerData、保存、.lftl、重开与导出始终缺 key；运行期可读默认值但不写回 |
| `R1-M02` | explicit null | 全链保持 null；Binance 不刷新；运行期不重新补默认值 |
| `R1-M03` | explicit object | 对象逐字段保持并被使用，不被默认值替换 |
| `R1-M04` | 直接 hydration | load 后缺 key；挂载无自动迁移 save；普通无关保存仍缺 key |
| `R1-M05` | backup import | preflight candidate、确认凭证、写前 candidate、repository readback 与导出完全一致 |
| `R1-M06` | content identity | absent、null、explicit 身份互不等同；identity 精确对应实际保存事实 |
| `R1-M07` | 用户新增 / 修改 | 验证成功后明确 mapping 对象可以保存 |
| `R1-M08` | 用户删除 | explicit 或 absent 经用户删除都写 null；之后不被推导写回 |
| `R1-M09` | 新 USDT 账 | BTC / ETH / ADA 创建时仍有明确正确 mapping；schema 仍为 1 |
| `R1-M10` | Binance 正常刷新 | USDT 正常刷新；absent built-in 仅运行期使用；null 禁用；明确 mapping 原样使用 |
| `R1-M11` | 旧 USD 防新事实 | 旧账继续可读算存，但不创建新 USD Trade、手工价格或 Binance price |
| `R1-M12` | Binance 失败与异步 | 失败保留旧价不写 0；mapping / epoch / session 变化后旧响应不能写入 |
| `R1-M13` | file safety | revision、双代、close-readback、恢复、recovery-blocked 与 session lease 未退化 |
| `R1-M14` | 格式边界 | schema、.lftl fileFormatVersion、BackupEnvelope、IndexedDB connection 均未变化 |
| `R1-M15` | 候选只读 | 审查前后 HEAD、tree、完整 diff hash、tracked / untracked 源文件一致 |

任一 `R1-M01～R1-M06` 或 `R1-M13` 反证至少为 P0 / P1，并强制 `FAIL`。

## 四、必须独立阅读的实现链

不得只看 diff 或 R1B。至少重新阅读实际候选中的：

```text
src/policies/ledgerFactPolicy.ts
src/validators/ledgerDataValidator.ts
src/backup/backupContentIdentity.ts
src/backup/backupImportPreflight.ts
src/hooks/usePersistentLedger.ts
src/data/builtInAssets.ts
src/services/binanceMappingService.ts
src/services/binancePriceRefreshService.ts
src/repositories/ledgerRepository.ts
src/repositories/ledgerFileRepository.ts
src/backup/backupEnvelope.ts（以实际文件名为准）
src/components/market-data/MarketDataControls.tsx
```

重点追踪：

```text
Validator
→ preflight deep-frozen candidate
→ confirmation evidence / candidate identity
→ hook import or hydrate
→ formal state and last persisted snapshot
→ resolver consumers
→ repository canonical payload / write intent
→ revision / previous generation
→ close / readback / decrypt
→ lock / reopen
→ backup export
```

搜索所有旧 `normalizeLedgerDataForRuntime`、mapping fallback、`asset.binanceMapping` 读取与赋值点，确认没有第二条隐蔽物化路径。

## 五、正式测试真实性审查

至少阅读并定向复跑实际存在的相关正式测试：

```text
src/policies/ledgerPolicies.test.ts
src/validators/ledgerDataValidator.test.ts
src/backup/backupImportPreflight.test.ts
src/backup/backupContentIdentity.test.ts（若存在）
src/data/builtInAssets.test.ts
src/services/binanceMappingService.test.ts（若存在）
src/services/binancePriceRefreshService.test.ts
src/components/market-data/MarketDataControls.test.tsx
src/hooks/usePersistentLedger.test.tsx
src/hooks/usePersistentLedger.fileImport.test.tsx
src/repositories/ledgerRepository.test.ts
src/repositories/ledgerFileRepository.test.ts
```

测试质量必须证明：

1. absent 是 key 真正缺失，不是值为 `undefined` 后被 JSON 偶然删除；
2. null 与 absent 分开断言；
3. explicit mapping 的所有字段保持；
4. P0 fixture 包含合法 USD 交易、同币 fee 和手工 price，不是空壳 Asset；
5. 完整测试真的经过 preflight、import、文件写入、readback、lock、reopen 和 export；
6. direct hydration 明确断言无自动 save，并验证一次普通保存；
7. identity 测试断言 absent 与 explicit 不同，而不是把 normalize 后视为同一内容；
8. 用户删除 absent mapping 会主动得到 null；
9. 既有原子导入和异步安全测试没有被删除、skip 或弱化；
10. 新测试不是只修改旧错误期望来迎合生产实现。

缺少关键永久正式回归本身就是 finding；临时探针不能替代。

## 六、PNL 与原 01C 回归

R1 不只要关闭 P0，也不能破坏已经通过的原批次行为。独立执行者必须：

- 把 `PNL-001` 和原 `M11` 由原 `01D` 的 FAIL 重新验到 PASS；
- 重新证明 `PNL-002`、`PNL-003` 仍为 PASS；
- 对原 `M01～M10、M12～M20` 逐项复核无回归；
- 特别复跑固定 6500 / 5、2800 / 3，得到 6505、2602、2797、195、3903；
- 证明新 USDT 写入、旧 USD 只读兼容、异币种 fee 保守降级、缺价、Decimal、派生不保存和三图口径仍成立；
- 保持 Week 11 `02D BLOCKED` 原状，不把本轮证据冒充真实个人数据 Gate。

`01R1D` 可引用原 01C 的矩阵编号，但必须写本次新命令与新证据，不能复制原 01D 的 PASS 段落当作复验。

## 七、定向测试与完整质量门

先根据实际 diff 运行覆盖全部 R1 专项面的定向测试；命令、退出码、文件数、测试数和 skip 数必须写入 R1D。

然后从冻结候选完整运行：

```bash
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

还要扫描：

- `.only`、`.skip`；
- `debugger`；
- 意外 `console.log` / `console.debug`；
- schemaVersion 2、新 fileFormatVersion、新 BackupEnvelope 版本；
- 依赖与 lockfile 变化；
- 本修复无关的代码、UI、FeeRule、平台、NLP、Agent、桌面端或 `CS2026` 变化。

任一正式门非零、测试 skip 或 whitespace 错误强制 `FAIL`。

## 八、真实 Chrome 与全新虚构文件

必须使用 production build、真实 Google Chrome、loopback 地址和全新虚构文件。文件名包含 `W12-PNL-R1-REVIEW-FAKE`；绝对不能选择个人 `.lftl`。

至少完成：

1. 创建一个全新空 C，记录密码、文件名和候选身份；
2. 使用全新 v1 / USD absent-mapping 虚构备份完成 preflight 与恢复；
3. 核对页面仍显示原 USD 事实和同币 fee 计算；新增 USD 交易、手工价格和 Binance 刷新被阻止；
4. 进行一个不会改变 mapping 语义的正常保存，锁定并重开；
5. 导出明文备份并直接检查 JSON：与输入逐字段相等，BTC Asset 没有 mapping key；
6. 用独立新文件核对 null 与 explicit mapping；
7. 用新 USDT 账核对内置 mapping、正常 Binance 行情与用户主动修改 / 删除 mapping；
8. 复核原 PNL 固定买卖、缺价、三图、390×844 和 1280 宽度、控制台 0 error。

若出现 macOS 保存、选择或密码窗口，先告诉用户：当前窗口、要填写什么、要点击什么；完成后等待用户回复“好了”。第一次自动点击失败不等于 BLOCKED。

真实 Chrome 不可用且没有等价关键证据时只能 `BLOCKED`；jsdom、组件测试、内置浏览器或开发者截图不能替代。

## 九、候选身份与报告格式

审查开始和结束都记录：

- 源码 branch、HEAD、tree；
- `git status --short --branch`；
- staged / unstaged / untracked；
- upstream 与相对 `origin/main` ahead / behind；
- 从 `origin/main...HEAD` 计算的完整 diff hash；
- 根文档仓库状态，区分唯一允许新增的 `01R1D`。

`01R1D` 至少包含：

1. 总结论 `PASS` / `FAIL` / `BLOCKED`；
2. 原 P0 复现输入和完整往返逐字段结果；
3. `R1-M01～R1-M15`；
4. `PNL-001～003` 与原 `M01～M20` 回归；
5. 正式测试质量审查；
6. 定向与全量门原始摘要；
7. 真实 Chrome 环境、文件、步骤、JSON 与控制台证据；
8. 候选前后身份；
9. findings（等级、文件 / 行、影响与最小修复建议）；
10. Week 11 `02D BLOCKED` 未改变；
11. 明确说明独立执行者没有改源码、测试、Git index 或协调文档。

只有在全部强制证据成立、没有 P0 / P1 / 关键缺口且候选身份一致时才能写 `PASS`。

## 十、独立执行后的边界

- 独立执行者无论结论为何，都只落档 `01R1D`，不提交 Git。
- 若 `01R1D = PASS`，由总控另行核对并协调 00B、00D 和当前开发状态；00C 无实际变化则不修改。
- 若 `FAIL` 或 `BLOCKED`，不更新完成状态、不进入第 02 批、不自动创建 R2。
- 无论结果如何，不 merge、不 push、不设置 upstream、不修改 `CS2026`。
