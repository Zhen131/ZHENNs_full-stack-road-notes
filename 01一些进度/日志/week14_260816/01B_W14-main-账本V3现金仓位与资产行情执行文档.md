# 01B_W14-main｜账本 V3 现金仓位与资产行情执行文档

- 日期：2026-08-19
- 源码轨道：长期账本产品 `main`
- 调查基线：`main@0d0cb555e5d2fac1660ac51e7b577bcb9710582d`
- 文档状态：`READY`（已纳入 B-02 改良版方案 C；源码实施合同，不是执行报告）
- 未来功能分支：`zhennn/w14-v3-cash-assets-market-data`
- 权威产品定义：`01A_W14-main-账本V3现金仓位与资产行情产品定义.md`

## 结论

本批采用一个不可拆开的 V3 合同：`LedgerData.schemaVersion = 3`，新增独立 `CashEvent[]`，现金余额只由交易、实际手续费与现金事件确定性重放；本地资产不再依赖固定白名单，`Asset.binanceMapping` 改为显式的对象或 `null`；明文 B 升级为 `BackupEnvelopeV3`。C 继续使用现有 `fileFormatVersion = 2`、PBKDF2/AES-GCM、current/previous 双代、revision、close/readback、补偿和 fail-closed 外壳，只把每代内部 `ledgerSchemaVersion` 与解密载荷升级为 3。

旧 V2 B 和内部承载 V2 账本的旧 C 均只识别并明确拒绝，不迁移、不解密旧 C、不写回。Binance symbol 验证若因浏览器隔离而拿不到可读响应，固定返回 `BINANCE_VALIDATION_UNAVAILABLE`，不猜测为无交易对，也不误报为单纯网络不可用。实施必须按本文八个阶段顺序完成；开发侧自动化与真实 Chrome 全绿后，仍需新的独立执行者复审，才能进行第一次真实 B 导入。

## 一、证据层与执行边界

| 层次 | 本文固定的事实 | 不得误报 |
| --- | --- | --- |
| 当前源码事实 | 当前为 LedgerData V2、BackupEnvelopeV2、C 外层 V2；BTC/ETH/ADA 有内置资产和运行期 mapping fallback；行情组件解锁后会自动刷新一次 | 不得把当前 73 files / 797 tests 写成本批已通过 |
| 01A 产品决定 | 一个 USDT 现金池；本地资产、Binance mapping、历史事实分离；V2 只拒绝；联网必须由用户触发 | 01B 不新增多币种现金、账户、归档、轮询或迁移 |
| 01B 技术决定 | 本文以下类型、字段、顺序、错误行为、阶段、测试和 Git 合同 | 实施者不得临场改名、换符号规则或弱化安全链 |
| 未来验证要求 | 定向、全量、typecheck、lint、build、diff-check、真实 Chrome、再独立复审 | 本文没有运行任何测试或真实浏览器验收 |

本批未来实施只能修改长期产品源码 worktree；不得修改 `LocalFirstTradingLedger-CS2026/`、`02_NLP/`、私人投资原文、自然语言账本或根文档仓库无关文件。本批也不新增累计净投入、整体资金收益率、多现金币种／账户，且不伪造早期缺失买卖。本文不授权创建分支、写代码、运行测试、合并或推送；这些动作只在用户以后明确批准实施时发生。

## 二、当前源码落点

| 责任 | 当前入口 | V3 处理 |
| --- | --- | --- |
| 公共事实类型 | `src/core/models/types.ts` | 增加 CashEvent；收紧 V3 USDT 与显式 mapping 合同 |
| 初始账本／reducer | `src/core/state/initialLedgerData.ts`、`ledgerReducer.ts` | schema 3、`cashEvents: []`、资产与现金 action |
| 完整信任边界 | `src/core/validation/ledgerDataValidator.ts`、`resourcePolicy.ts` | 精确 V3 字段、现金校验、全局 ID、引用和资源上限 |
| 持仓／现金计算 | `src/core/calculations/positionReplay.ts`、`tradeCashImpact.ts` | 分离 P&L 手续费口径与 USDT 现金增量；新增 `cashReplay.ts` |
| 业务功能 | `src/features/trades`、`portfolio`、`charts`、`market-data` | 新增 `cash`、`assets`、`activity`，所有页面消费统一服务 |
| 页面组合 | `DashboardShell.tsx` 与五个 workspace | 记账切换、统一流水、现金汇总、资产与行情设置 |
| B | `src/features/backup/*` | BackupEnvelopeV3、现金预检、中文报告、缺 mapping 提示 |
| C | `src/platform/files/*`、`src/platform/persistence/*` | 外壳版本不变，内部 schema/payload 升 3，保留原子导入链 |
| 异步会话 | `usePersistentLedger.ts`、`useLedgerWorkspaceSession.ts` | 继续使用 epoch/generation/token/AbortSignal 防旧结果写回 |

当前自动行情的 `MarketDataControls.tsx` mount `useEffect -> refresh()` 与 01A 冲突，V3 必须删除；不得改名后保留自动触发。当前 `DEFAULT_BINANCE_MAPPINGS` 仅是 V2 兼容 fallback，V3 显式 mapping 后必须删除，不能继续扩充 SOL、DOGE 等常量。

## 三、V3 数据合同

### 3.1 正式 TypeScript 形状

```ts
export type CashEventType =
  | "deposit"
  | "withdrawal"
  | "external-expense"
  | "balance-adjustment";

export type CashEventBase = {
  id: string;
  occurredAt: ISODateString | ISODateTimeString;
  timePrecision: TimePrecision;
  currency: "USDT";
  note?: string;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
};

export type CashFlowEvent = CashEventBase & {
  type: "deposit" | "withdrawal" | "external-expense";
  amount: DecimalString;
};

export type CashBalanceAdjustmentEvent = CashEventBase & {
  type: "balance-adjustment";
  balanceBefore: DecimalString;
  targetBalance: DecimalString;
  adjustmentAmount: DecimalString;
};

export type CashEvent = CashFlowEvent | CashBalanceAdjustmentEvent;

export type Asset = {
  id: string;
  symbol: string;
  name: string;
  quoteCurrency: "USDT";
  decimals?: number;
  binanceMapping: BinanceMarketMapping | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
};

export type LedgerData = {
  schemaVersion: 3;
  assets: Asset[];
  trades: Trade[];
  cashEvents: CashEvent[];
  priceSnapshots: PriceSnapshot[];
  feeRules: FeeRule[];
};
```

V3 同时把 `Asset.quoteCurrency`、`Trade.currency`、`PriceSnapshot.currency` 收紧为字面量 `"USDT"`。`fee = "0"` 时 `Trade.feeCurrency` 必须为 `USDT`；fee 非零时只能是 `USDT` 或当前本地资产代码。表单 service 先规范化，B/C validator 对不合规旧值直接拒绝。`FeeRule.currency` 继续只能是 `USDT`，`USDT` 不得出现在 `assets` 中。

`BinanceMarketMapping` 保持精确四字段 `{ provider: "binance", symbol, baseAsset, quoteAsset: "USDT" }`，不增加显示名或网络状态；`symbol` 是已验证完整交易对，`baseAsset` 必须等于所属 Asset.symbol。CashEvent 不含 assetSymbol、platform、rawText 或 mapping 字段。

`LedgerData` 的标准 JSON 字段顺序固定为 `schemaVersion → assets → trades → cashEvents → priceSnapshots → feeRules`。对象键顺序不参与语义校验，但导出、内容 identity 和 C 载荷必须使用验证器重建后的标准对象序列化，禁止把未知字段带入或静默丢弃。

### 3.2 四类现金事实

| `type` | 用户输入 | 持久化金额规则 | 对 USDT 现金的增量 |
| --- | --- | --- | --- |
| `deposit` | 入金金额 | `amount > 0`，只能存无符号正数 | `+amount` |
| `withdrawal` | 出金金额 | `amount > 0`，只能存无符号正数 | `-amount` |
| `external-expense` | 外部支出金额 | `amount > 0`，只能存无符号正数 | `-amount` |
| `balance-adjustment` | 目标余额 | 存 `balanceBefore`、`targetBalance`、`adjustmentAmount = targetBalance - balanceBefore`；三者都可为负或零 | `+adjustmentAmount` |

校准创建时，service 必须在同一次操作中从最新账本重放得到 `balanceBefore`，再按 decimal.js 计算差额；页面上的预览不能直接成为持久化事实。重放时使用已经固定的 `adjustmentAmount`，不把余额强行设成 `targetBalance`。因此以后删除更早的交易或现金事件时，所有余额会从剩余事实重新计算，旧校准的三字段仍保留当时观察与纠偏证据，不被重写。

完整账本校验必须验证 `balanceBefore + adjustmentAmount === targetBalance`。它不要求旧校准的 `balanceBefore` 永远等于当前删改后重新重放到该点的余额；后者可能因用户合法删除早期事实而变化，不属于导入矛盾。

### 3.3 交易与手续费的现金影响

| 交易事实 | USDT 现金增量 | 说明 |
| --- | --- | --- |
| 买入，手续费为 USDT | `-(totalValue + fee)` | `totalValue` 本来不含手续费；手续费只扣一次 |
| 买入，非零手续费为其他本地资产 | `-totalValue` | 非 USDT 手续费不扣 USDT，也不生成现金事件 |
| 卖出，手续费为 USDT | `+(totalValue - fee)` | 手续费可使本笔净流入为负，负现金仍合法 |
| 卖出，非零手续费为其他本地资产 | `+totalValue` | 非 USDT 手续费不增加或减少 USDT |
| `fee = "0"` | 只按 `totalValue` | service 把 `feeCurrency` 标准化为 `USDT` |

FeeRule 只是表单建议，不是现金事实；只有最终保存进 `Trade.fee / feeCurrency` 的实际手续费参加重放。交易不得再生成一条镜像 CashEvent，页面也不得要求用户补一笔反向现金记录。

现有 `calculateTradeCashImpact(...)` 同时服务 P&L 和“现金影响预览”，V3 必须拆开：

- `calculateTradeUsdtCashDelta(...)` 永远按上表返回 USDT 增量。
- P&L／成本继续使用独立的 fee-aware value helper；非 USDT 手续费仍产生 `UNSUPPORTED_FEE_CURRENCY` 可靠性问题，不得误当成零。
- 本批不把 BNB 等手续费折算为 USDT，也不自动扣除另一个资产持仓。

### 3.4 确定性现金重放

新增 `src/core/calculations/cashReplay.ts`，公开纯函数 `replayUsdtCash(ledgerData, options?)`，输出至少包含 `balance` 和按顺序的 effect 明细。禁止读取页面 state、网络、Repository、Date.now 或浏览器 API。

1. 初始余额固定为 `0`。
2. 把有效 `Trade` 与 `CashEvent` 投影为 `{ id, kind, occurredAt, createdAt, delta }`，不把派生 effect 写回账本。
3. 先用现有日期语义比较 `occurredAt`：不同日期按日期；两边都有时间时按真实时间；同日无法再区分时按 `createdAt`；仍相同则 `trade` 先于 `cash-event`，最后按 `id` 的英文序稳定排序。
4. 依次相加 delta；校准也只加 `adjustmentAmount`。
5. `asOf` 历史重放只纳入该日及以前事实；当前余额只纳入今天及以前事实。V3 新建和导入本来就拒绝未来事实，隔离逻辑仍须覆盖恶意或异常运行期输入。
6. 删除交易或现金事件只删除原事实；reducer 不保存“修正后余额”，所有首页、确认框、趋势和交易详情立即从剩余事实重放。

以下值绝不能持久化：现金当前余额、某笔交易的现金 delta、负余额缺口、现金持仓行、统一活动行、资产总值、分配比例、平均购价、已实现／未实现盈亏、图表点和 mapping 配对状态。

### 3.5 Decimal、日期、ID 与资源规则

DecimalString 的唯一语法正则为 `^-?(?:0|[1-9]\d*)(?:\.\d+)?$`。

| 项目 | V3 规则 | 失败行为 |
| --- | --- | --- |
| Decimal 语法 | 字符串且必须通过上述唯一正则；禁止指数、`+`、前导零、`-0`、NaN、Infinity | 结构错误，B 无候选、C 不写 |
| 精度 | 最多 40 位有效数字、最多 18 位小数；计算走 decimal.js，不做隐式舍入 | 超限拒绝，不截断 |
| 流量金额 | deposit / withdrawal / external-expense 必须 `> 0` | `0` 或负数拒绝 |
| 校准金额 | 三字段允许正、负、零，且必须精确满足加法关系 | 关系不一致拒绝 |
| 现金余额 | 允许为 `0` 或负数 | 负数不是导入错误；交互保存前二次确认 |
| 日期 | `occurredAt` 用现有严格 ISO 日期／时区 datetime；新事实不得晚于本地 todayKey | 未来事实拒绝 |
| 技术时间 | `createdAt / updatedAt` 必须为带时区 datetime，且 `updatedAt >= createdAt` | 拒绝 |
| ID | 非空、无首尾空白、最多 128 字符；新事实用 `crypto.randomUUID()`，最多尝试 3 次 | 三次碰撞返回 service 错误，零 mutation |
| 唯一性 | assets、trades、cashEvents、priceSnapshots、feeRules 的 ID 全局唯一；资产 symbol 规范化后唯一 | 精确路径硬错误 |
| 引用 | Trade.assetSymbol、PriceSnapshot.assetSymbol、FeeRule.assetSymbol、非 USDT 非零 feeCurrency 必须引用本地资产；feeRuleId 必须存在且匹配事实 | 拒绝，不猜测 |
| 集合上限 | assets 500、trades 25,000、cashEvents 25,000、priceSnapshots 5,000、feeRules 500 | 超限拒绝新写／B 导入 |
| 字符串上限 | 延续 ID 128、symbol/currency 32、name/platform 128、decimal 256、note 4,096、rawText 16,384、B/C 明文 8 MiB | 报告 path、limit、actual |

完整 V3 validator 必须对 LedgerData 根对象、B 外层、C 解密 payload 与各实体使用允许键集合；出现未知键即拒绝，不能像 V2 某些路径那样重建后静默忽略。普通表单 service 可以 trim／uppercase 后再创建事实；B/C validator 只能检查，不得修复输入。

### 3.6 新账本默认值

```ts
{
  schemaVersion: 3,
  assets: createBuiltInAssets(), // BTC / ETH / ADA，仅初始便利项
  trades: [],
  cashEvents: [],
  priceSnapshots: [],
  feeRules: [],
}
```

现金默认重放为 `0 USDT`，不保存初始现金事实。BTC、ETH、ADA 保留当前名称和显式 Binance mapping，理由是减少新建账本首次使用成本；它们与后来离线新增的资产使用同一 Asset 类型、同一删除规则，不是白名单，也不得作为 validator 的合法 symbol 集合。reset 产生新的数组／对象，仍不复用引用。

## 四、本地资产生命周期

### 4.1 新 feature 与标准化

新增平级 feature `src/features/assets/`：逻辑从 `index.ts` 导出，UI 从 `ui.ts` 导出，测试与实现同目录。正式函数与规则如下：

| 函数 | 唯一行为 |
| --- | --- |
| `normalizeAssetSymbol(input)` | `trim()` 后 `toUpperCase()`；必须匹配 `^[A-Z0-9]{1,32}$`；禁止保留字 `USDT` |
| `createLocalAsset(input, ledger, deps)` | 完全离线；规范化后检查重复；ID 最多 3 次；只读一次时钟；`name = symbol`、`quoteCurrency = "USDT"`、`binanceMapping = null`、不写 decimals |
| `inspectAssetDependencies(symbol, ledger)` | 返回所有阻塞路径，不只返回第一项 |
| `removeLocalAsset(symbol, ledger)` | 只有依赖列表为空才返回新 LedgerData；否则结构化拒绝 |

仅输入代码时，显示名固定等于规范化代码；本批不增加名称搜索、名称编辑、归档或停用。B 导入已有 `name` 时按 B 的合法值保留；页面新增不得访问 Binance、fetch、图片、元数据服务或其他网络。

稳定错误码至少固定为：`ASSET_INVALID_SYMBOL`、`ASSET_RESERVED_SYMBOL`、`ASSET_DUPLICATE_SYMBOL`、`ASSET_NOT_FOUND`、`ASSET_DEPENDENCY_EXISTS`、`ASSET_ID_GENERATION_EXHAUSTED`、`ASSET_DEPENDENCY_FAILURE`。UI 只按 code 分支，不解析英文 message。

### 4.2 删除前的完整依赖扫描

| 依赖 | 阻止删除的条件 |
| --- | --- |
| 交易主体 | 任一 `trades[*].assetSymbol === symbol` |
| 非 USDT 手续费 | 任一非零 `trades[*].feeCurrency === symbol` |
| 价格 | 任一 `priceSnapshots[*].assetSymbol === symbol`，无论 manual/api |
| 手续费规则 | 任一 active/inactive `feeRules[*].assetSymbol === symbol` |

`Asset.binanceMapping` 属于该资产配置，不是删除阻塞项；删除空资产时随资产一起消失。CashEvent 不引用本地资产。依赖错误必须列出 collection、数量和前若干精确 path，页面文案说明应先删除哪些事实；不得级联删除。

删除 mapping 与删除资产是两个事务：

- 删除 mapping：把该 Asset 的 `binanceMapping` 设为 `null` 并更新 `updatedAt`，资产、交易、价格、FeeRule 全保留。
- 删除资产：先完整扫描依赖；任一依赖存在即零 mutation；完全为空才删除 Asset。

### 4.3 B 与手动价格

B 的 `assets` 是完整本地清单，合法导入后原样进入记账、价格和设置入口；应用不自动混入 BTC/ETH/ADA。无 mapping 的本地资产继续通过 `PriceForm -> createValidatedPriceSnapshot -> priceSelectionService -> positionService` 使用手动 USDT 价格参与持仓估值、资产分配和趋势。用户可为今天或过去的不同日期保存不同手动价格；每个趋势日期只使用当时最新可得的 as-of 手动价格，同日修正沿用既有稳定选择规则，未来日期继续拒绝。手动录价全过程 fetch 必须为 0，B/C 往返后多日快照保持；本批不新增单币价格图。不得用成交价、零、成本、其他资产价格或未来价格替代缺失手动价。

## 五、Binance 显式联网合同

### 5.1 搜索输入与验证

`normalizeBinanceSymbolCandidate(localSymbol, input)` 固定执行：

1. 对输入 `trim().toUpperCase()`，只接受 1～64 位 ASCII 字母数字；空值或非法字符零联网拒绝。
2. 若输入恰好等于本地 symbol，例如 `SOL`，候选为 `SOLUSDT`。
3. 其他合法输入按原值作为候选；因此 `SOLUSDT` 保持不变，`ETHUSDT`／`SOLUSDC` 可由 Binance 响应明确暴露 base／quote 不匹配。
4. 对候选调用公共 `GET /api/v3/exchangeInfo?symbol=...`；必须恰好一项、返回 symbol 与候选相同、`status = TRADING`、`baseAsset = localSymbol`、`quoteAsset = USDT`、Spot 允许。

不支持中文名、完整英文名、模糊搜索或列表联想；不要调用全量 exchangeInfo 后在本地猜测。继续使用 `https://data-api.binance.vision`，不带 API key、cookie 或私有请求头。每次验证只发上述单项 exchangeInfo；不得新增同源代理、中间服务器、失败后二次 ticker／状态探测、OKX、多行情提供方或自动 retry。

### 5.2 单资产“验证并保存”的准确顺序

1. 用户点击按钮后才创建 operation id、AbortController，并冻结 `ledgerEpoch + session generation + asset id/symbol + 当前 mapping signature`。
2. 正规化输入；本地错误零网络。
3. 请求 exchangeInfo 并完成 Spot/base/USDT 验证；若页面拿不到可读 Response 且不是明确 timeout／external abort，立即返回 `BINANCE_VALIDATION_UNAVAILABLE` 并结束本 operation。
4. 响应回来后先检查 signal、operation id、ledger/session generation、资产仍存在且 symbol 未变；任一不符直接丢弃，不更新提示或账本。
5. 通过 `setAssetBinanceMapping` 生成候选，用现有认证 mutation/save 队列保存 mapping；必须等该 mutation 的 `persistedVersion` 被确认，才显示“映射已保存”。此时把本 operation 的 expected mapping signature 从旧值原子切换为刚落盘的新值。
6. mapping 已持久化、operation 已绑定新 signature 且仍与响应完全相同时，发起一次该 symbol 的 ticker/price 请求。
7. ticker 成功后再次检查全部 token 与 mapping signature，再通过价格 service 创建/合并当天 API PriceSnapshot 并等待保存。
8. 首次取价失败只报告失败并保留已保存 mapping 和旧价格；不得回滚 mapping、写零或重试。

不能把 mapping 与首次价格合并成“网络都成功才一次落盘”：mapping 是独立配置事实，价格是之后取得的行情事实。

### 5.3 用户主动刷新与导入后配对

- 设置页每个已 mapping 资产提供“刷新该资产”；首页／记账页可保留“刷新非零持仓”，但只能由按钮点击触发。
- 删除当前 mount 自动 refresh 的 effect、`autoAttemptedRef` 和相关 session 状态；切页、解锁、hydrate、导入成功均不得隐式联网。
- B 导入成功后，纯函数列出 `binanceMapping === null` 的 symbol。提示只展示清单与“联网自动配对”按钮，不自动执行。
- 用户点击“联网自动配对”后，以当时缺失清单为冻结输入，按 symbol 排序逐项验证 `${symbol}USDT`，无重试；收集完后只把仍存在、仍无 mapping 的成功项作为一次认证 mutation 保存。mapping 持久化后，可用一次批量 ticker 请求取得首次价格并作为第二次认证 mutation 保存。
- 某项失败或返回 `BINANCE_VALIDATION_UNAVAILABLE` 时，不删除资产、不回滚 B、不回滚其他成功 mapping；该项保持 `binanceMapping = null`，页面给出每项 code 与中文说明。只有成功项进入 mapping mutation，锁定／切账本／卸载中断全部后续写回。

### 5.4 失败与旧请求行为

| 场景 | 必须结果 |
| --- | --- |
| symbol 验证拿不到可读 Response，且非明确 timeout／external abort | `BINANCE_VALIDATION_UNAVAILABLE`；不猜 missing／network，不发 ticker，不追加探测；本地事实、mapping、旧价格不变 |
| ticker／价格刷新中的断网、DNS 或 fetch 抛错 | 继续返回 `BINANCE_NETWORK_ERROR`；旧 mapping、旧价格不变 |
| 8 秒超时 | `BINANCE_TIMEOUT`；abort 一次，无重试 |
| external abort | `BINANCE_ABORTED`；作为已取消操作处理，无写回 |
| HTTP 418／429 | `BINANCE_RATE_LIMITED`，保留 status；无退避循环 |
| 其他 4xx／5xx | `BINANCE_HTTP_ERROR`；不解析成成功 |
| 非 JSON／字段缺失／重复 symbol | `BINANCE_MALFORMED_RESPONSE` 或既有精确 code |
| 无交易对／不在交易 | `BINANCE_SYMBOL_MISSING`／`BINANCE_SYMBOL_NOT_TRADING` |
| base／quote／Spot 错误 | 对应 `BINANCE_BASE_ASSET_MISMATCH`、`BINANCE_QUOTE_ASSET_MISMATCH`、`BINANCE_SPOT_NOT_ALLOWED` |
| 价格非正有限 DecimalString | `BINANCE_INVALID_PRICE`，不写 `0` |
| 重复搜索 | 新操作先使旧 operation id 失效并 abort；旧 Promise 即使忽略 signal 晚到也零写回 |
| 删除 mapping | 先使该资产请求失效；晚到 validation/ticker 都不得复活 mapping 或写价格 |
| 切账本、锁定、卸载 | 同时递增 generation、abort、清 UI operation；晚到 Promise 不得 setState／mutation |

`BINANCE_VALIDATION_UNAVAILABLE` 只适用于 `validateSpotSymbol` 的 exchangeInfo 请求无法取得可读 Response；不得机械覆盖 ticker 的普通网络错误。UI 固定表达：“当前无法验证该 Binance 交易对。该交易对可能不存在，也可能是 Binance 的错误响应无法被浏览器读取，或当前网络／服务暂时不可用。本地资产、历史交易和手动价格均未改变，可以继续使用手动价格或稍后重试。”

允许联网的动作只有：用户点击单资产验证、单资产刷新、全局刷新、导入后的联网自动配对。离线新增／删除资产、删除 mapping、手动价格、B 读取／预检／导入、C 新建／保存／重开／锁定、页面导航、图表计算必须有零网络测试。

## 六、页面与统一数据流

### 6.1 责任分层

| 层 | 唯一责任 | 禁止事项 |
| --- | --- | --- |
| 页面组件 | 收集输入、显示 service 结果、管理焦点／展开／确认框 | 自行算现金、改 LedgerData、读写文件、直接 fetch |
| `features/cash` | 创建／删除 CashEvent、现金预览、负余额风险判断 | 保存余额快照、生成镜像交易 |
| `features/assets` | 本地资产新增／删除／mapping 配置及依赖报告 | 把 Binance 当资产真相、级联删除 |
| `features/activity` | 把 Trade 与 CashEvent 投影成统一只读行并排序／筛选 | 复制 reducer、保存 activity 行 |
| trades／portfolio／charts | 消费统一 replay、position、valuation 结果 | 各自重新实现手续费或现金公式 |
| reducer 与认证 mutation | 对已验证事实做不可变状态转换，进入同一持久化队列 | 接受页面拼出的 unknown、绕过 service |
| Repository | C 的 revision、加密、写入、close/readback、补偿 | 理解页面文案、发 Binance 请求 |
| File System Access API | 选择／创建／读写用户指定文件句柄 | 保存业务派生值、绕开 Repository |

所有跨页面视图都消费 `buildLedgerProjection(ledgerData, asOf)` 的同一结果。该纯 service 组合现金重放、持仓重放、价格选择与估值，至少返回 `cash`、`positions`、`valuation`、`issues`；首页、确认框、趋势和导入摘要不得各写一套公式。

### 6.2 记账页

记账页的 session state 使用判别联合，而不是把 USDT 塞进 Asset：

```ts
type RecordTarget =
  | { kind: "trade"; assetSymbol: string }
  | { kind: "cash"; currency: "USDT" };
```

资产选择器第一项固定显示“现金 USDT”，之后显示当前本地资产。`RecordTarget` 只存在于页面 session，不进入 LedgerData、B 或 C。切换 kind 时卸载另一张表单并清理其 validation／confirmation state，不能把旧表单字段带入新事实。

现金表单字段固定如下：

| 类型 | 字段 | 提交前摘要 |
| --- | --- | --- |
| 入金 | 日期／时间、正数金额、可选备注 | “USDT 现金将增加 X；预计余额 Y” |
| 出金 | 日期／时间、正数金额、可选备注 | “USDT 现金将减少 X；预计余额 Y” |
| 外部支出 | 日期／时间、正数金额、可选备注 | “记录外部支出 X；预计余额 Y” |
| 余额校准 | 日期／时间、目标余额、可选备注 | “校准前 A，目标 B，本次差额 C；旧历史不会被改写” |

表单先做字段校验；用户确认时，service 必须针对最新 `persistedVersion` 重新计算当前余额和 projected balance。若结果 `< 0`，显示独立第二层确认：“保存后 USDT 现金为 -X，缺口 X。账本允许负现金，但不会自动补齐。”确认令牌绑定 ledger epoch、persistedVersion、operation type 和输入 identity；其间任一变化令牌失效并回到预览。取消、过期、保存失败均零 mutation。

普通买卖表单同样显示唯一的 `calculateTradeUsdtCashDelta` 预览，并在最终现金为负时走同一二次确认。手续费规则只预填表单，确认摘要必须使用用户最终保存的 fee／feeCurrency。

### 6.3 统一交易流水

新增 `src/features/activity/`，以纯函数把两类事实投影为 `LedgerActivityItem`：

```ts
type LedgerActivityItem =
  | { kind: "trade"; id: string; occurredAt: string; trade: Trade }
  | { kind: "cash-event"; id: string; occurredAt: string; cashEvent: CashEvent };
```

- 默认按现金 replay 的同一比较器倒序展示；同键结果必须稳定，翻页／重渲染不能跳序。
- 类型筛选为：全部、买入、卖出、入金、出金、外部支出、余额校准。
- 资产筛选列出本地资产与“现金 USDT”。选择某资产只匹配 Trade.assetSymbol；选择“现金 USDT”只匹配 CashEvent，不把所有以 USDT 计价的买卖混进来。
- 日期筛选继续使用严格的 occurredAt 日期语义；所有筛选条件做交集。
- 交易详情继续展示数量、成交金额、实际手续费、现金影响和可靠性；现金详情展示四类事件的持久化字段，校准额外显示 before／target／adjustment。
- 删除 Trade 或 CashEvent 都先显示具体事实摘要和现有安全倒计时；倒计时结束后仍要对最新状态重算。若删除后的现金为负，再进入绑定最新版本的缺口确认；成功只删除该事实并统一重放。
- activity 行是派生视图，不增加 activity collection、冗余 label 或缓存字段。

热力图继续只读取 Trade；点击热力图进入记账页时显式设置 `{ kind: "trade", assetSymbol }`。现金事件永不进入交易热力图。

### 6.4 首页、持仓和图表

| 输出 | V3 唯一口径 |
| --- | --- |
| 总资产 | 所有“有可用当前价格”的资产市值之和，加 signed USDT cash；缺价格资产继续产生 incomplete issue，不能按零伪装完整 |
| 持仓明细 | 始终显示“现金 USDT”行，即使为 0 或负数；数量／价值都显示余额，平均购价、成本、已实现／未实现盈亏显示 `—` |
| 资产分配 | 正现金作为普通正扇区；负现金不绘制负角度或绝对值扇区，单独显示“现金缺口”图例／提示；净总资产仍使用 signed cash |
| 趋势 | 每个日期点重放当日及以前现金，并与当日可得价格估值相加；不得把今天现金回填到历史点 |
| P&L | 继续只由 Trade、position replay 与价格决定；CashEvent 不进入平均购价、成本或未实现盈亏 |
| 热力图 | 继续只统计 Trade，不读取 CashEvent |

分配图的几何规则固定：`cash >= 0` 时分母为已定价资产正市值加现金；`cash < 0` 时扇区只用已定价资产正市值归一化，现金以零几何的 deficit legend 展示。净总资产和缺口金额放在图旁，禁止用 `abs(cash)` 画出看似正资产的扇区。分母为零时显示空态，不制造 100% 项。

趋势 service 把 CashEvent 日期加入时间轴候选，并在每个点调用统一 replay；沿用现有 future partition 与价格选择规则。分配和趋势可以消费 cash projection，allocation／history 之外的 trade heatmap 不改输入。

### 6.5 设置页、状态与可访问性

- 设置页增加“本地资产与行情”区：离线新增代码；查看 mapping／最新价格来源；验证并保存 mapping；删除 mapping；刷新单项；删除无依赖资产。
- 每个异步操作显示资产级 `idle / validating / saving-mapping / fetching-price / saved / error`；全局刷新与导入后配对另有 batch progress，不能用一个 boolean 混淆并发项。
- 错误区保留稳定 code、中文摘要和重试按钮；重试仍必须由用户点击。离线时本地新增、记账、手动价格、B/C 均可继续。
- 390px 下表格改为单列卡片，主操作与危险删除不重叠，金额／错误不横向溢出；桌面保持信息列和详情展开。
- 所有 input 有可见 label，按钮有唯一 accessible name，错误通过 `aria-describedby` 关联，异步结果使用非打断式 live region；确认框锁定焦点、Escape 取消、关闭后焦点回触发按钮。
- 资产／现金切换、类型和筛选支持键盘；不能仅靠颜色区分买卖、现金、负数或联网状态。对 reduced-motion 不强制倒计时动画，但安全等待时长不缩短。

## 七、V3 B/C 与原子导入合同

### 7.1 明文 B 精确合同

```ts
export type BackupEnvelopeV3 = {
  backupFormatVersion: 3;
  appVersion: string;
  exportedAt: ISODateTimeString;
  ledgerSchemaVersion: 3;
  ledgerData: LedgerData;
};
```

允许键恰为以上五个，标准顺序也固定为该顺序；`ledgerData` 内部使用第三节顺序。常量固定为 `BACKUP_FORMAT_VERSION = 3`；导出时 `appVersion` 取 package version，import 要求非空无首尾空白且不超过 128 字符，`exportedAt` 为带时区 datetime。导出先完整 validate、资源检查和 import-policy 等价检查，再生成 envelope；`JSON.stringify(envelope, null, 2) + "\n"`。导出时钟固定生成 UTC `toISOString()`，文件名固定为 `local-first-trading-ledger-backup-v3-YYYYMMDD-HHmmssZ.json`。导出本地资产、mapping、历史价格、FeeRule、Trade 与 CashEvent，不导出连接句柄、passphrase、现金派生值、异步状态或 pairing 提示。

解析在看到顶层对象后先读取版本：`backupFormatVersion === 2` 时立即返回 `BACKUP_UNSUPPORTED_FORMAT_VERSION` 和中文“这是 V2 备份；V3 不提供迁移”，不得继续构造候选、证据或报告成成功。格式 3 还必须满足 `ledgerSchemaVersion === ledgerData.schemaVersion === 3`、精确键、8 MiB 和全部 V3 语义；未知键不准静默清理。

负现金本身合法。以下现金问题才阻止 B：非法枚举；流量 amount 非正；校准三字段算术不一致；不合规 decimal／日期／技术时间；未来事实；重复或跨集合冲突 ID；超限；未知资产／FeeRule 引用。报告只能陈述“重放结果为负”和缺口，不把它列为 error。

### 7.2 B 预检、报告与确认

预检继续保持当前分层并补入 V3：

1. `read`：读取 exact rawText，先做字节上限；不得联网。
2. `parse`：JSON 与 B 版本短路；V2 到此停止。
3. `structure`：外层、LedgerData 和实体精确键／类型／资源上限。
4. `semantics`：日期、引用、全局 ID、校准算术、position、cash replay、import policy；负现金只进 warning 摘要。
5. `candidate`：只从完整通过的 canonical LedgerData 冻结 import candidate；保留原始 `rawText` 的 SHA-256 identity 和 canonical candidate identity。
6. `report`：由结构化结果生成可复制中文文本，包含来源文件名、版本、导出时间、五类 collection 数量、现金余额／缺口、缺 mapping 清单、warning 和逐 path error；沿用当前明细截断上限并明确“另有 N 项”，禁止拼接未转义原文。
7. `confirm`：确认令牌绑定 candidate identity、rawText identity、目标 fileId、目标 current revision、ledger epoch 与 session generation。用户看过报告后再点导入；文件或目标变化即必须重新预检。

页面不得只保存 parsed object 后丢弃 rawText；不得在确认时重新解析另一个文件，也不得把 warning 当成用户已授权写入。预检失败、复制报告和取消都保持 C 与页面状态零变化。

### 7.3 导入 C 的不可拆顺序

V3 B 只能导入已经打开且满足当前“空 C”判定的目标文件；空值定义延续现有 Repository 合同，不因 V3 擅自放宽。导入从确认开始固定执行：

1. 再核对 frozen token、目标 fileId、session generation、当前 revision 和“仍为空”；不匹配即 `STALE_IMPORT_CANDIDATE`，零写入。
2. 把 canonical V3 LedgerData 交给 Repository；页面不能先 dispatch，也不能直接调用 FileSystemWritableFileStream。
3. Repository 在现有 lineage 上生成唯一新 revision，parent 指向读取到的 current；previous 保留旧 current，使用原文件 KDF／密钥体系和新的 12-byte IV 加密 exact `{ savedAt, ledgerData }` payload。
4. 先在内存构造完整下一版文件字节，再对同一 handle 执行既有 write／truncate／close；close 抛错按失败处理，不能假定落盘。
5. close 后重新读取同一 handle，验证外层、fileId、current/previous 邻接、预期 revision 和 ciphertext；再用当前会话密钥解密 current，验证 AAD、exact payload、LedgerData V3、资源和 import policy。
6. readback 的 canonical LedgerData 与 frozen candidate identity 完全相同才返回 verified ledger；否则进入现有补偿流程恢复导入前完整字节并再次 readback 验证。
7. 补偿成功也返回导入失败且页面保留旧 ledger；补偿写入、close 或 readback 任一步失败则 fail closed：锁定／断开会话、清密钥和 pending mutation，禁止继续编辑该文件。
8. 只有 Repository 返回 verified ledger 后，session 才一次发布到 reducer／页面并更新 persistedVersion。此前不得出现“导入成功”或短暂展示候选。

整个 1～8 步 fetch 调用数必须为零。成功发布后，纯函数生成缺 mapping 清单；提示与 C 提交事务已经结束。用户后来点击联网配对产生新的 mapping mutation 和随后独立的价格 mutation；任一配对失败不回滚已经验证落盘的 C，也不删除导入资产。

### 7.4 C 的外层不变、内部升级

本批保留 `fileFormatVersion = 2` 与 `cryptoVersion = 1`，因为它们描述现有 C 文件容器和加密协议，不等同于账本 schema。实现时固定拆为只含容器／加密值的 `LEDGER_FILE_OUTER_V2_CONSTANTS` 和独立的 `SUPPORTED_LEDGER_SCHEMA_VERSION = 3`，禁止继续用一个 `LEDGER_FILE_V2_CONSTANTS.ledgerSchemaVersion` 混合两层含义。外层类型与 parser 继续叫 `LedgerFileV2`／`validateLedgerFileV2`；generation、解密载荷和 canonical payload 分别改名为 `EncryptedLedgerGenerationV3`、`DecryptedLedgerPayloadV3`、`CanonicalLedgerPayloadV3`：

| 层 | V3 后值 | 处理 |
| --- | --- | --- |
| C 外层 `fileFormatVersion` | 2 | 精确外层键、32 MiB 外文件上限、fileId、current/previous 不变 |
| crypto `cryptoVersion` | 1 | PBKDF2-SHA-256 600,000、16-byte salt、AES-GCM-256、12-byte IV、128-bit tag 不变 |
| generation `ledgerSchemaVersion` | 3 | current 和非空 previous 都必须为 3；该值继续进入 AAD |
| decrypted payload | exact `{ savedAt, ledgerData }` | ledgerData 必须 schema 3 且含 cashEvents；8 MiB 明文上限 |
| connection record | version 1、handle、expectedFileId | 不增加业务数据，不改格式 |

解析旧 C 时，在 passphrase 对话框、PBKDF2 和 AES-GCM 之前完成外层及 generation metadata 检查。任一 generation 声明 `ledgerSchemaVersion = 2` 时返回稳定的 `LEDGER_FILE_UNSUPPORTED_LEDGER_SCHEMA`，中文说明“该文件承载 V2 账本；当前 V3 不提供迁移”；零解密、零写入、零 connection publish。外层版本未知则继续使用 `LEDGER_FILE_UNSUPPORTED_VERSION`。不得把旧 schema 错报为密码错误。

新建 C 的第一个 current 直接承载 V3 初始账本；previous 为 null、parentRevisionId 为 null。以后保存保持 current/previous 相邻独立密文、revision lineage、每代独立 IV、AAD 绑定 fileId／crypto／generation metadata、外部 revision 冲突拒绝、锁定清密钥、重开先读后解密、恢复 previous 后再形成新 current 等既有安全合同。

### 7.5 明确失败结果

| 失败 | UI／Repository 结果 | 文件与会话结果 |
| --- | --- | --- |
| V2 B | 版本阶段明确拒绝；不给导入确认 | C 零写入、零网络 |
| V2 C | passphrase 前按内部 schema 拒绝 | 零 KDF／解密／写入，不连接 |
| 错密 | 统一认证失败，不泄露明文或猜测 | C 零写入，密钥不保留 |
| 外层／密文／payload 损坏 | 对应结构、encoding、revision、auth 或 payload 错误 | 不回退成空账本，不覆盖文件 |
| 权限丢失／close 失败 | 导入／保存失败，执行补偿或 fail closed | 页面不能发布未验证候选 |
| 外部 revision 改变 | stale/external-change 冲突，要求重新打开／预检 | 不覆盖外部版本 |
| readback 不一致 | 失败并补偿 | 补偿验证前不得继续 |
| 补偿失败 | 明确严重错误 | 锁定／断开、清密钥，禁止后续写 |
| B 缺 mapping | 合法导入并提示清单 | C 已完成，不联网 |
| 后续配对失败 | 显示单项错误，可由用户再次点击 | 不回滚 C、资产或其他成功 mapping |

实现 V3 不得降低任何现有 close/readback、双代恢复、空 C、lineage、revision、补偿或 fail-closed 测试；只允许把内部 LedgerData 与相应精确版本检查升级为 3。

## 八、未来实施阶段与 Git 合同

### 8.1 启动条件与严格顺序

只有用户以后明确批准“实施 01B”后，才在长期产品源码仓库从已核对的 `main` 新建：

```text
zhennn/w14-v3-cash-assets-market-data
```

开始时记录但不改写 `main` 的 branch、HEAD、status、`origin/main...HEAD`，并重跑现有基线测试。若现场不干净、分支／worktree 不符或基线失败，停止，不吸收也不清理用户改动。阶段依赖固定为 `1 → 2 → 3 → 4 → 5 → 6 → 7 → 8`；不得并行，尤其不得让 schema、B/C import contract 和 UI 各自落在互不兼容的状态。

每阶段只有在允许范围、完成条件和阶段测试同时满足后才建立一个独立本地提交。提交后记录 hash，下一阶段从该 hash 开始。若阶段测试暴露旧阶段缺陷，建立额外、范围明确的英文 `fix:` 提交并重跑受影响门，不准 amend／squash 伪造原提交。

### 8.2 八阶段合同

| 阶段 | 允许修改的子系统 | 必须完成 | 阶段测试 | 独立回滚提交 |
| --- | --- | --- | --- | --- |
| 1. 基线与分支 | Git metadata；不得改业务文件 | 核对长期产品 worktree、main 基线、clean、远端差异；新建唯一功能分支；记录初始测试真实结果 | 当前完整 `npm test`、typecheck、lint、build；任一失败停止 | 空 checkpoint：`chore: mark Week 14 V3 baseline` |
| 2. V3 核心合同 | `core/models`、`core/validation`、`core/policies`、`core/state`、`core/calculations`；仅为保持可编译而触及 B/C 的内部 schema 常量与 exact payload seam | schema 3、CashEvent、Asset 显式 mapping、全局 ID／资源规则、cash replay 和交易现金 delta；新账本可由 Repository 做 V3 roundtrip；旧 B/C import UI 暂不宣告可用 | validator、resource、cash replay、trade cash、initial state、reducer、最小 C V3 payload 定向测试；typecheck | `feat: define V3 cash ledger contract` |
| 3. 现金业务闭环 | `features/cash`、`features/trades`、Record workspace、必要 reducer action | 四类创建／删除、校准三字段、普通交易现金预览、最新版本重算、负现金二次确认；尚未改首页图表 | cash service／form、交易四种手续费方向、删除重放、stale confirm、键盘与表单无障碍定向测试 | `feat: complete cash event workflow` |
| 4. 本地资产 | `features/assets`、Settings workspace、资产 validator／reducer action、手动价格入口 | 任意合法代码离线新增；完整依赖扫描；mapping 删除与资产删除分离；无 mapping 手动价照常估值 | SOL/DOGE/BNB/OKB/KNIGHT、非法／重复／碰撞、所有删除阻塞、零 fetch、手动价格定向测试 | `feat: add local asset lifecycle` |
| 5. 显式 Binance | `features/market-data`、Binance client／mapping／refresh、Settings 与显式刷新入口、session async guard | 删除 mount 自动刷新和 fallback mapping；搜索验证→保存 mapping→首次价；所有 operation／epoch／abort 防旧写回；只保留用户点击联网 | 输入候选、base/quote/Spot、超时/418/429/500/断网/畸形、ignored signal、切账本/锁定/卸载/重复搜索/删 mapping、零意外 fetch | `feat: make Binance mapping explicitly user driven` |
| 6. V3 B/C | `features/backup`、`platform/files`、`platform/persistence`、`usePersistentLedger`、测试 fixtures | BackupEnvelopeV3、中文预检报告、V2 短路拒绝、空 C 原子导入、V3 C 内部 schema、close/readback/补偿/fail-closed、导入后缺 mapping 提示；移除阶段 2 的临时禁用门 | B V3 往返／V2／畸形／零写／零网络；C 新建保存重开／双代／V2／错密／损坏／权限／外部 revision／补偿；现有文件安全全集 | `feat: upgrade backup and ledger file payloads to V3` |
| 7. 跨页收口 | `features/activity`、`portfolio`、`charts`、Home／Transactions／Dashboard composition、共享样式 | 统一流水；总资产、现金行、分配、趋势接入统一 projection；P&L 与热力图排除现金；390px、桌面、键盘、无障碍完成 | activity 排序／筛选／删除；首页与图表数值；负现金图例；响应式与 a11y 组件测试 | `feat: integrate cash into portfolio views` |
| 8. 总验证与交接 | 只补缺失的集成／回归测试、虚构 fixtures、测试工具；缺陷回归到对应模块的额外 fix commit | 第九节矩阵全覆盖；全量质量门与真实 Chrome 完成；整理给独立执行者的证据，不生成独立复审结论 | 第十节全部命令、真实 Chrome 第十一节；工作区／diff／意外网络扫描 | `test: complete Week 14 V3 regression coverage` |

阶段 2 的“最小 B/C seam”只用于保证 V3 LedgerData 进入应用后类型、Repository 新建／保存不失配；B 导入按钮必须保持不可用，直到阶段 6 的完整预检、原子导入和安全回归一起通过。阶段 3 不复制首页计算；阶段 7 只接入阶段 2 已冻结的统一 projection。阶段 5 完成前不制作带 mapping 的 B fixtures；阶段 6 完成前不得跑第一次真实 B 导入。

### 8.3 未来 Git 禁令与收尾权限

- 只在 `LocalFirstTradingLedger/` 的上述功能分支工作；不得触碰 `LocalFirstTradingLedger-CS2026/`、`02_NLP/`、私人原文、外部参考项目或根文档仓库无关文件。
- 源码 commit 标题、模块说明、AGENTS 和 Release Notes 使用英文；长期产品 README 与产品界面保持中文。
- 每次提交前先检查源码仓库 status、diff、cached diff 和 `git diff --check`，只暂存本阶段路径；测试 fixture 只能使用虚构数据，不提交真实 B/C。
- 不建 Git tag，不 merge、rebase、cherry-pick、squash、amend、reset，不开 PR，不自动 push，不设置 upstream，不删除分支。
- 完成八阶段只代表本地开发候选；是否推送、合并、删除分支、更新 `00-当前开发状态.md` 或其他根日志，全部等待用户另行授权。任何自动测试或开发者 Chrome 绿灯都不能改变该边界。

## 九、带失败等级的自动测试矩阵

失败等级定义：`P0` 为数据正确性、文件安全、版本／联网边界失败，任一项失败立即停止；`P1` 为核心产品流程或关键防误操作失败，同样阻止开发候选通过；`P2` 为响应式、可访问性或呈现合同失败，修复前也不得交接。所有时间、UUID、fetch、FileSystemHandle 和加密随机数使用可控依赖；自动测试不得访问真实 Binance 或个人文件。

### 9.1 现金、交易与 V3 核心

| 编号 | 输入／动作 | 唯一预期结果 | 等级 |
| --- | --- | --- | --- |
| CORE-01 | 从 0 依次入金 `1000`、出金 `125.5`、外部支出 `24.5` | 三条正 amount 事实；delta 分别 `+1000/-125.5/-24.5`；余额 `850` | P0 |
| CORE-02 | 余额 `850` 时校准目标 `800` | 保存 before `850`、target `800`、adjustment `-50`；余额 `800`；不改前三条事实 | P0 |
| CORE-03 | 删除校准前的一条入金，再重放原校准 | 原三字段不重写；只应用固定 adjustment；结果由剩余事实确定 | P0 |
| CORE-04 | 买入 total `100`、fee `2 USDT`；卖出 total `60`、fee `1 USDT` | 现金 delta `-102/+59`，手续费各扣一次 | P0 |
| CORE-05 | 相同买卖使用非零 `BNB` 手续费 | USDT delta `-100/+60`；不造 CashEvent、不扣 BNB position；P&L issue 为 unsupported fee | P0 |
| CORE-06 | 买 10 SOL 后部分卖 4、再全部卖清余量 | position replay 数量依次正确；每笔现金独立按 total/fee 计算，卖清不触发现金特例 | P0 |
| CORE-07 | 删除中间 Trade，再删除 CashEvent | 只删目标事实；余额、持仓、趋势从剩余事实重放；无派生余额残留 | P0 |
| CORE-08 | 同日同 occurredAt 的 trade/cash，createdAt 相同且不同 id；输入数组打乱重复执行 | 排序固定为 occurredAt→createdAt→trade before cash→id；每次 effects 与余额字节等价 | P0 |
| CORE-09 | 零现金、支出后负现金、再入金回零 | `0` 与负值都合法；projection 精确；service 标记 deficit，不修零 | P0 |
| CORE-10 | 会导致负余额的交易／现金／删除；确认后在保存前插入另一事实 | 首次给缺口；旧确认 token 失效；基于最新 persistedVersion 重算，未二次确认零 mutation | P1 |
| CORE-11 | 40 位有效数字／18 位小数边界及大额加减 | decimal.js 精确、无 Number 转换；合法边界通过，超 40／18 位拒绝且不截断 | P0 |
| CORE-12 | amount 为 `0`、`-1`、`01`、`1e3`、`+1`、`-0` | 流量零／负和非规范 DecimalString 逐 path 拒绝；校准合法零差额通过 | P0 |
| CORE-13 | 未来 Trade／CashEvent／PriceSnapshot 与 today 事实 | 新建和 import policy 拒绝未来项；today 项通过；运行期 asOf 不纳入未来异常值 | P0 |
| CORE-14 | CashEvent 与 Trade 共用 id；各集合内部重复；空白／超长 id | validator 报精确冲突 path；全局 ID 规则生效，零候选 | P0 |
| CORE-15 | Trade／Price／FeeRule／外币 fee 引用不存在资产或错误 feeRule | 全部精确拒绝；不猜 symbol、不自动建资产 | P0 |
| CORE-16 | 非法 CashEvent type、字段缺失、联合类型多余字段、LedgerData 根未知键 | exact shape 拒绝并报告 path；不静默清理 | P0 |
| CORE-17 | cashEvents 25,000 与 25,001；note 4,096 与 4,097；8 MiB 前后 | 边界值通过，超限返回 limit/actual，零 mutation | P0 |
| CORE-18 | 新建／reset V3 账本 | schema 3、BTC/ETH/ADA 各有显式 mapping、cashEvents 空、现金 0、无 USDT Asset、对象引用全新 | P0 |

### 9.2 本地资产与 Binance

| 编号 | 输入／动作 | 唯一预期结果 | 等级 |
| --- | --- | --- | --- |
| ASSET-01 | 离线依次新增 ` sol `、DOGE、BNB、OKB | 规范化为四个大写本地资产，name=symbol、mapping=null；fetch 调用 0 | P0 |
| ASSET-02 | 离线新增 Binance 无交易对的 `KNIGHT` | 本地资产成功，可记账／手动价格；不探测 Binance | P0 |
| ASSET-03 | 输入空、USDT、`SOL-USDT`、中文、33 字符；再输入 sol 与已有 SOL | 对应 invalid/reserved/duplicate code；全部零 mutation／零 fetch | P0 |
| ASSET-04 | UUID 前两次与全局事实碰撞、第三次唯一；另测三次碰撞 | 前者只保存第三个 ID 且 createdAt=updatedAt=单次 clock；后者 exhausted、零 mutation | P0 |
| ASSET-05 | 资产分别被主体交易、非零 feeCurrency、price、active/inactive FeeRule 引用 | 每类均阻止删除；一次报告全部 collection/count/path；无级联 | P0 |
| ASSET-06 | 无任何依赖但有 mapping 的资产 | 删除资产成功且 mapping 随 Asset 消失；其他事实不变 | P1 |
| ASSET-07 | 有全部依赖的资产仅删除 mapping | Asset 变 null 并更新时间；Trade／Price／FeeRule／Asset 均保留；晚到请求零写回 | P0 |
| ASSET-08 | mapping=null 的虚构资产持有非零仓位，并为连续多个日期保存不同 manual USDT price | 每次录价 fetch=0；各日按当时最新可得手动价 as-of 估值，总资产趋势随日期变化；未来价拒绝、缺价不以成交价／成本／零替代；不新增单币价格图 | P0 |
| NET-01 | 对 SOL 分别输入 `SOL`、` solusdt ` | 候选均为 SOLUSDT；各只请求指定 exchangeInfo；合法 Spot 响应保存同一 mapping | P0 |
| NET-02 | SOL 输入 ETHUSDT；响应 base=ETH | base mismatch，mapping／价格不变，不发 ticker | P0 |
| NET-03 | 可读响应分别为 quote=USDC、status 非 TRADING、Spot=false、symbols 空 | 分别返回 quote/trading/spot/missing 稳定 code；零写入 | P0 |
| NET-04 | symbol 验证 fetch 因 CORS／不可读响应抛异常；另测 timeout、external abort、可读 HTTP 418、429、500；ticker fetch 抛错 | 前者为 `BINANCE_VALIDATION_UNAVAILABLE`，timeout/aborted/rate-limited/http 保持精确，ticker 仍为 network；全部无重试、旧价格保留 | P0 |
| NET-05 | 非 JSON、重复 symbol、字段缺失、ticker 为 0/负/NaN 文本 | malformed/invalid-price；不保存错误 mapping 或价格 | P0 |
| NET-06 | exchangeInfo 成功，mapping readback 成功，首次 ticker 失败 | mapping 保留且 UI 明确“映射已保存、首次价格失败”；不回滚 | P0 |
| NET-07 | 重复搜索，旧 fetch 忽略 AbortSignal 后晚到 | operation id 已失效；旧结果不 setState、不 mutation、不覆盖新结果 | P0 |
| NET-08 | 请求中删除 mapping／资产、切账本、锁定、卸载 | generation/epoch/signature 拦截 validation 与 ticker；无复活、无卸载更新 | P0 |
| NET-09 | 解锁、hydrate、切页、B 预检／导入、离线新增／手动价 | 严格 fetch spy 调用数 0；不存在 mount 自动 refresh | P0 |
| NET-10 | 用户点击刷新一个已 mapping 资产与“刷新非零持仓” | 只请求点击范围；零持仓跳过；成功价格经认证 mutation 持久化 | P1 |
| NET-11 | 导入后缺 SOL/KNIGHT mapping；用户点击自动配对，SOL 成功、KNIGHT 验证响应不可读 | B 已落盘；成功 mapping 一次 mutation、价格第二次 mutation；KNIGHT 返回 validation-unavailable 并保留 null；不发 KNIGHT ticker、不重试，不回滚 C、现金、交易、资产或手动价格 | P0 |

### 9.3 B、C 与导入安全

| 编号 | 输入／动作 | 唯一预期结果 | 等级 |
| --- | --- | --- | --- |
| B-01 | 含负现金、五类 collection、null／有效 mapping 与多日手动价格的合法 V3 | 导出 exact BackupEnvelopeV3、2 空格、末尾换行；再解析得到 canonical LedgerData identity 相同，多日手动价格及来源保持 | P0 |
| B-02 | backupFormatVersion 2 的合法旧 B | 版本阶段明确拒绝；candidate/report-success/confirm 不产生；C write 与 fetch 均 0 | P0 |
| B-03 | V3 外层未知键、schema 不一致、LedgerData 未知键 | exact shape/schema mismatch；不静默重建成候选 | P0 |
| B-04 | 负余额合法 B；另测非法枚举、负流量 amount、校准算术矛盾 | 前者仅 warning 并可导入；后三者按 path 阻止 | P0 |
| B-05 | 跨集合重复 ID、未知资产、未来事实、25,001 cashEvents、超 8 MiB | 语义／资源阶段拒绝；报告含 limit/actual；零写 | P0 |
| B-06 | 预检后 rawText 改一字、目标 revision 改变或切换账本 | source/candidate/token stale；必须重新预检，零写入 | P0 |
| B-07 | 合法候选导入当前合同定义的空 C | 严格按 write→truncate→close→readback→decrypt→validate→identity→publish；发布一次 | P0 |
| B-08 | 同一候选导入非空 C | 空 C 检查拒绝；current/previous 和页面 ledger 不变 | P0 |
| B-09 | 导入全过程安装会抛错的 fetch spy | 导入成功且 fetch 调用 0；成功后只生成纯缺 mapping 清单 | P0 |
| B-10 | 导入后主动配对全部失败 | C 中 V3 ledger 保持；资产与现金不回滚；只有后续配对错误状态 | P0 |
| C-01 | 新建 V3 C | 外层 v2/crypto v1，current schema 3、previous null、parent null；解密 payload exact V3 | P0 |
| C-02 | 连续保存两次不同事实，其中包含 mapping=null 资产的多日手动价格 | 每次新 IV/revision；current/previous 相邻且独立密文；parent 正确，旧 previous 丢弃；多日价格完整进入 current | P0 |
| C-03 | 保存多日手动价格后锁定、重开正确密码 | 锁定清密钥和 pending state；重开验证 fileId/current 后解密，页面只发布 verified current；多日价格、来源和 mapping=null 保持 | P0 |
| C-04 | current 认证失败但 previous 完整，执行现有恢复入口 | 明确恢复 previous，并以其为依据形成新 current；不把损坏 current 当空账本 | P0 |
| C-05 | 外层 v2、generation schema 2 的旧 C | passphrase/KDF/decrypt/write/connection publish 调用 0；返回 unsupported ledger schema | P0 |
| C-06 | 错密、篡改 AAD、ciphertext、payload 多余键或非法 cash | 分别 auth/payload/contract 失败；文件零写、页面不发布、密钥不保留 | P0 |
| C-07 | 写前权限丢失，或 write/truncate/close 任一步失败 | 返回 I/O 失败；执行现有补偿；候选不发布 | P0 |
| C-08 | 预检后外部进程改变 current revision／fileId | stale/external revision 拒绝；不覆盖外部内容，要求重新打开／预检 | P0 |
| C-09 | close 成功但 readback revision／candidate identity 不符 | 判失败并恢复导入前字节；补偿验证成功后仍保持旧页面 ledger | P0 |
| C-10 | 补偿 write、close 或 readback 失败 | fail closed，清密钥、锁定／断开、禁写；不得继续显示已连接可编辑 | P0 |
| C-11 | current/previous IV 相同、parent 不邻接、Base64URL 非规范、超文件上限 | 文件合同阶段拒绝，不尝试“修复”或写回 | P0 |
| C-12 | 连接记录 expectedFileId 与所选 C 不同 | 重连拒绝，不解密错误文件、不替换 connection record | P0 |

### 9.4 页面、汇总与可访问性

| 编号 | 输入／动作 | 唯一预期结果 | 等级 |
| --- | --- | --- | --- |
| UI-01 | 资产市值 900、cash 100；再设 cash -100 | 总资产分别 1000／800；现金行始终显示；负值不修零 | P0 |
| UI-02 | 正 cash、负 cash、净值为零、资产无价格 | 正现金有扇区；负现金只显示 deficit legend 且无 abs 扇区；零分母空态；缺价标 incomplete | P1 |
| UI-03 | 跨三日 Trade/CashEvent/Price；mapping=null 的非零虚构持仓具有多日不同手动价格 | 趋势逐日 asOf 重放并反映各日当时最新手动价，不把今天现金或未来价格回填历史；计算零 fetch | P0 |
| UI-04 | 只有 CashEvent 改变 | 平均购价、成本、已实现／未实现 P&L 与热力图完全不变；现金字段为 `—` | P0 |
| UI-05 | 全部 activity，逐类型、SOL 与 USDT 筛选 | 稳定倒序；类型交集正确；SOL 仅主体交易，USDT 仅 CashEvent | P1 |
| UI-06 | 展开四类现金与买卖详情 | 字段、现金 delta、校准三字段、手续费可靠性完整且无派生字段伪装持久化 | P1 |
| UI-07 | 删除 Trade/CashEvent 造成负现金，等待期间 ledger 改变 | 安全倒计时+最新缺口二次确认；旧令牌失效；确认后只删目标 | P0 |
| UI-08 | 记账页在现金与 SOL 间来回切换 | session 判别联合切换；旧字段／错误／confirm 清空；USDT 不出现在 Asset collection | P1 |
| UI-09 | 390px 与桌面宽度完成新增、记账、筛选、展开、危险确认 | 移动端无横溢／遮挡，桌面列完整，主／危险操作不误触 | P2 |
| UI-10 | 仅键盘执行同一流程，读 accessible tree 与 live status | label/name/description 唯一，焦点进入／返回正确，非颜色信息完整，异步状态可读 | P1 |

新测试固定与实现同目录：`core/calculations/cashReplay.test.ts`、`features/cash/cashEventService.test.ts`、`features/cash/CashEventForm.test.tsx`、`features/assets/assetService.test.ts`、`features/assets/AssetControls.test.tsx`、`features/activity/activityService.test.ts`。其余矩阵扩充现有 ledgerData/resource、TradeForm、MarketDataControls、Binance client/mapping/refresh、backup envelope/preflight/report/controls、ledgerFile contract/crypto/repository、usePersistentLedger、Home/Transactions/Settings、portfolio/charts 测试。测试中默认 fetch stub 必须对未声明请求直接抛错，而不是返回空成功。

## 十、未来开发质量门

八阶段实现完成后，在源码功能分支根目录按以下顺序运行；任何一步非零退出都停止，修复并从该步重新开始：

1. **本批定向测试**：运行第九节涉及的全部新增文件和被改现有文件，不能只挑 happy path。至少包含 core validation/calculation、cash/assets/activity、TradeForm、MarketDataControls 与 Binance 三层、backup 四层、ledgerFile contract/crypto/repository、usePersistentLedger、三个 workspace、portfolio/charts。
2. **完整测试**：`npm test`。保存本次命令、退出码、完整 file/test 计数与失败详情；不得引用实施前或状态文档中的 73 files / 797 tests。
3. **类型**：`npm run typecheck`，零错误。
4. **静态规则**：`npm run lint`，零 warning、零 error。
5. **生产构建**：`npm run build`，确认 production bundle 完成；开发服务器页面可见不替代该门。
6. **差异卫生**：`git diff --check`，再检查 status、完整 diff、diff stat 和 staged diff；无空白错误、意外二进制、真实 B/C 或越界文件。
7. **版本残留扫描**：定点扫描 `schemaVersion: 2`、`ledgerSchemaVersion: 2`、BackupEnvelopeV2、`DEFAULT_BINANCE_MAPPINGS`、`autoAttemptedRef` 与 mount refresh。允许的旧值只剩明确的 V2 拒绝 fixtures／断言及 C 外层 `fileFormatVersion = 2`；生产账本、B 和 generation 不得残留 V2。
8. **联网边界扫描**：枚举全部 `fetch(`、Binance client 与 refresh 调用点；逐项证明只有四类用户点击入口可达。严格零 fetch 测试覆盖解锁、hydrate、切页、导入、本地资产、手动价格和 C 文件操作；无 API key、代理／中间服务器、失败后二次诊断、全量 exchangeInfo、OKX／多行情提供方、retry loop、timer polling 或 WebSocket。

定向测试的实际文件清单以源码 diff 中“本批新增或修改且属于第九节”的测试为闭集，不允许因命令过长漏掉某个 stage；完整 `npm test` 再负责全仓回归。质量门结果只能证明开发候选，不得写成独立验收。

## 十一、真实 Google Chrome 文件闭环

### 11.1 环境与虚构文件

自动门全绿后再执行。使用生产构建和 `npm run start -- --port 3414`，只在真实 Google Chrome 打开 `http://127.0.0.1:3414`。必须通过 macOS 系统原生文件选择器创建／选择文件；jsdom、组件测试、开发服务器随手查看、截图或应用内嵌浏览器都不能替代。

在专用临时目录只使用以下虚构文件，不复制个人 B/C、自然语言账本或真实投资数据：

```text
w14-v3-fictional-primary.lftl
w14-v3-fictional-import-target.lftl
w14-v3-fictional-valid-v3.json
w14-v3-fictional-invalid-cash-v3.json
w14-v3-fictional-v2.json
```

启用 Chrome DevTools 的 Console 与 Network “Preserve log”，开始前清空记录。localhost 页面资源属于预期；Binance 请求只能紧跟明确点击，其他时刻不得出现。所有密码、资产、金额和备注均为一次性虚构值。

### 11.2 必跑链与逐步预期

| 步骤 | 真人操作 | 必须观察到 |
| --- | --- | --- |
| CH-01 | 原生选择器新建 primary C，输入虚构密码 | C 为 V3 初始账本；BTC/ETH/ADA 可见、现金 0；未点击行情前 Binance 请求 0 |
| CH-02 | 入金 1000、出金 100、外部支出 50、校准目标 800 | 四条可见现金事实；校准显示 before 850、target 800、adjustment -50；余额 800 |
| CH-03 | 新增 SOL，买入 total 900、fee 5 USDT | 保存前明确缺口 105 的第二确认；取消零变化，再确认后现金 -105；只生成一条 Trade |
| CH-04 | 卖出部分 SOL total 200、fee 2 USDT；展开并删除一条现金事实 | 现金变 93 后按删除结果重新重放；流水详情与缺口确认符合最新状态 |
| CH-05 | 完全离线新增 KNIGHT，建立非零虚构持仓，并为不同日期保存手动 USDT 价格 | 本地资产、记账和估值可用；mapping=null；手动价格保存与重开保留；全过程 Network 无 Binance 请求 |
| CH-06 | 恢复网络，SOL 输入 `SOL` 后点击“验证并保存”，再明确点击刷新 | exchangeInfo→mapping 持久化→ticker 顺序成立；没有后台第二轮；SOLUSDT 也能得到同一候选 |
| CH-07 | KNIGHT 点击验证并触发 CORS／不可读响应；再切 Offline 后导航、记账、手动价、锁定／重开 | 只发一次指定 exchangeInfo；显示“当前无法验证”，不显示确定无对或单纯网络不可用；KNIGHT 保留、mapping=null、手动价保留；无 ticker、探测或 retry，本地功能继续 |
| CH-08 | Online 后从 primary 导出合法 V3 B；检查文件名，再锁定 | B 是虚构 V3；锁定后页面不保留明文或可编辑状态 |
| CH-09 | 新建空 import-target C，经原生选择器导入合法 B，全程观察 Network | close/readback 完成后页面一次切换；现金／资产／交易一致；导入期间 Binance 请求 0；缺 mapping 只提示 |
| CH-10 | 点击导入后联网配对；SOL 成功，KNIGHT 返回 validation-unavailable | SOL 等成功项独立持久化；KNIGHT 仍为 null 且无 ticker／retry；已导入 C、现金、交易、资产和手动价格不回滚 |
| CH-11 | 对空的专用目标分别导入 invalid-cash V3 与 V2 B | 前者报告精确 cash path，后者明确 V2 不迁移；目标 revision／页面均不变，Network 0 |
| CH-12 | 在 primary 连续完成两次保存，锁定并重开；再用只损坏 current 的虚构副本走现有 previous 恢复入口 | 正常重开取 current；双代相邻；损坏 current 不变空账本，previous 恢复后数据与对应 revision 一致 |
| CH-13 | 桌面宽度与 390px 各完成现金／资产切换、筛选、详情、危险确认；再只用键盘重复关键路径 | 无溢出遮挡；焦点、label、live status、Escape 与返回焦点正确；非颜色信息完整 |
| CH-14 | 检查首页总资产、现金行、分配、趋势、P&L 与热力图，并审阅全程 Console／Network | signed cash 数值一致；多日手动价按 as-of 进入现有总资产趋势；缺价不修零且无单币价格图；负现金无伪正扇区；P&L/热力图排除现金；零未解释 error/warning，零意外 Binance 请求 |

每一步记录 Chrome 版本、源码 branch/HEAD、目标 C 文件名、预期与实际、Console error/warning 数和 Binance 请求触发点。记录中不得粘贴密码、密钥、完整 ciphertext 或任何个人账本。CH-01～14 任一失败，开发结果为 `FAIL`，不能用自动测试、截图或另一次不同路径的成功抵消。

## 十二、通过线与独立复审边界

### 12.1 本文状态

本文为 `READY`：当前 `main@0d0cb555e5d2fac1660ac51e7b577bcb9710582d` 的模型、验证、页面、Binance、B 和 C 结构能够在不改变 01A 产品行为、不削弱 C 安全外壳的前提下落地上述唯一方案。`READY` 只表示源码实施合同已收口，不表示任何 V3 代码、测试、真实 Chrome 或 B 已完成。

### 12.2 未来开发候选通过线

只有同时满足以下条件，开发执行者才能报告“本地开发候选 `PASS`”：

- 八阶段及必要 fix 提交均在指定功能分支，提交 hash 可核对，源码工作区干净，diff 不越界；
- 第九节所有 P0/P1/P2 与现有回归均通过，第十节各命令有本次新鲜完整结果；
- CH-01～14 在真实 Google Chrome、原生文件选择器和专用虚构 V3 文件中逐项通过；
- V2 B/C 明确拒绝，B import 零网络，C close/readback、双代、revision、补偿与 fail-closed 证据完整；
- 没有生成或导入个人真实 B，没有 push／merge／tag，也没有擅自更新根状态文档。

缺少任一项只能报告 `FAIL` 或具体 `BLOCKED`，不得沿用旧测试数量、把“build 成功”扩写成“文件安全通过”，也不得让负现金 warning 掩盖现金事实错误。

### 12.3 第一次真实 B 之前

开发执行者的绿灯不能自我升级为最终验收。第一次真实 B 导入前，必须换由新鲜、独立的执行者重新检查冻结的 branch/HEAD 候选、完整自动测试结果、真实 Chrome 原生文件闭环和 C 文件安全链；独立执行者必须能从证据重现结论，不能只引用开发者的 `PASS`。

独立复审未明确通过时，真实 B 导入继续禁止；若复审发现问题，回到功能分支修复并重新完成受影响的全链。独立复审文件名称、具体组织方式、是否提交以及之后是否推送／合并，全部等待用户下一步决定；本文不创建也不冒充该复审。
