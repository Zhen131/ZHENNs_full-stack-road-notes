# 01C_W10：三图与 Binance 行情执行计划

状态：待执行
编制日期：2026-07-25
执行对象：后续 Codex 目标模式中的开发 AI
源码仓库：`01一些进度/产出/LocalFirstTradingLedger/`

## 结论

本计划是 Week 10 的正式执行入口。执行 AI 必须以 `01A_W10-可视化商讨结论记录.md` 和 `01B_W10-可视化与Binance行情确定事实.md` 为产品事实，完成：

```text
页面减法
-> 日期、未来事实和 USD/USDT 边界
-> Binance 最新价格与交易对映射
-> 全局估值价格模式
-> 共享持仓重放与日级派生
-> 当前持仓市值饼图
-> 持仓总市值 / 持仓成本阶梯曲线
-> 最近 365 天交易活跃热力图及日期筛选
-> 回归、生产验收和文档收口
```

执行顺序只按 Gate，不按固定日期。一个 Gate 未通过时不得进入依赖它的后续 Gate；不得用伪值、跳过测试、缩小需求或把失败项改写成通过来推进进度。

## 一、执行规则

### 1. 事实优先级

1. `01B` 是对 `01A` 的增补和修正；冲突时以 `01B` 为准。
2. `01A` 中未被 `01B` 修改的页面减法、三图范围、ECharts、缺价不伪造、纯派生服务、共享重放、无动画等规则继续有效。
3. 旧 `00-Week10每日执行清单.md` 和 `00-Week10-Checklist.md` 只作为历史任务索引；其中“两图、Recharts 候选、不接行情、不做第三图、硬离线阻塞、固定日期”等旧内容不得覆盖 `01A/01B/01C`。
4. 若源码事实与本计划列出的现状不同，先记录差异，再做最小等价调整；不得静默改变产品合同。
5. 本计划中的风险收口条款，是对 `01A/01B` 已确认目标的可执行化说明；若早期措辞与本计划中的精确数据合同冲突，以本计划为准。
6. “情景价格 / 假设 BTC 达到某价格 / 未来价格模拟”已明确取消，不属于 Week 10；不得以来源切换、手动价格或测试数据为名重新引入。

### 2. 仓库与 Git 边界

- 源码修改只发生在独立源码仓库 `01一些进度/产出/LocalFirstTradingLedger/`。
- Week 10 日志、Checklist、当前开发状态属于外层文档仓库。
- 两个仓库的 `status`、diff、提交和分支不得混用。
- 执行阶段保留用户已有修改；不使用破坏性 Git 命令。
- Week 10 源码必须在专用功能分支 `zhennn/week10-charts-binance` 上开发；若执行开始时已经位于用户创建的等价 Week 10 功能分支，可核对后继续使用，不得覆盖或重建已有分支。
- 本计划已授权执行 AI 创建本地 Git commit。每个关键 Gate 通过并取得定向测试证据后，必须先检查 staged diff，再创建范围单一、备注为中文的本地 commit；不得把整周实现压成一个超大提交。
- 源码仓库至少按 Gate 1、Gate 2、Gate 3、Gate 4、Gate 5、Gate 6 的完成边界分别提交；Gate 内若包含可独立验证的模型、网络、派生、UI 或修复里程碑，可以继续拆成更多小提交。
- 外层文档仓库的 Gate 0 范围纠偏与 Gate 7 最终回填分别提交，不得与源码提交混用。
- 本轮只授权创建本地分支和本地 commit；禁止推送任何远端、禁止把功能分支合并或 rebase 到 `main`，除非用户之后明确要求。

### 3. 工作方式

- 开始时读取最小上下文：本计划、`01A`、`01B`、当前开发状态、源码 `README.md`、相关实现与测试。
- 每个 Gate 先补纯逻辑和测试，再接 UI；业务规则不得写进 ECharts option。
- 所有日期、ID、网络和当前时刻依赖必须可注入，测试不得依赖真实当天或真实 Binance 可用性。
- 每完成一个 Gate，运行该 Gate 的定向测试、检查 diff 和 staged scope，并按上述 Git 边界创建本地中文 commit；最后统一运行全量 Gate。
- 实质进度、阻塞、测试证据和产品偏差写入新的 Week 10 执行验收记录；不要把计划文档改写成完成记录。

## 二、不可违反的产品合同

### 1. 日期与排序

- 日级归属由事实字段开头的 `YYYY-MM-DD` 决定。`2026-07-25T19:00:00+08:00` 永远属于 `2026-07-25`，不得先转 UTC 或设备时区再取日期。
- 本地日历“今天”由可注入本地 clock 提供；不得调用外部时间 API。
- 排序先比较事实字段开头的日期 key；日期不同时按日期先后排序。
- 同一日期且两条记录都有完整 datetime 时，才按真实时间点比较先后。
- 同一日期只要任一记录是 date-only，就保持原账本数组顺序；完整时间不得越过 date-only 记录。
- 两条记录的完整时间相同，也保持原账本数组顺序。原数组下标是最终 tie-breaker，禁止不稳定排序。
- 新建 `Trade`、手动 `PriceSnapshot`、Binance `PriceSnapshot` 均不得晚于今天。
- 新导入账本含未来交易或未来价格时拒绝导入，并返回包含集合下标、字段和错误原因的结构化错误。
- 旧加密账本中的未来事实允许解锁、查看原始记录和完整救援导出，但必须进入“未来事实纠正模式”：
  - 未来交易和未来价格不进入持仓汇总、三图、交易日统计或价格选择；
  - 暂停新增普通事实、删除正常历史事实和自动 Binance 刷新；
  - 只允许删除无效的未来 `Trade / PriceSnapshot`、完整救援导出、用合法备份整账替换或清空；
  - 所有未来事实被删除后立即恢复正常可写状态。
- 未来订单不以未来 `Trade` 表示；本轮不新增 `PendingOrder`。

### 2. 币种

- Week 10 估值域固定为 USD 与 USDT，按 `1 USDT ≈ 1 USD` 生成“USD 等值”结果。
- 页面图表区常驻披露上述近似；Binance USDT 报价不得静默标成严格美元现货。
- 不提供基准币种选择器。
- 新建资产的 `quoteCurrency`、交易的估值币种和价格的 `currency` 只允许 USD/USDT；新导入账本的这些估值字段含其他币种时拒绝，并显示“当前仅支持 USD/USDT 估值”及具体路径。
- 手续费币种及手续费规则可以保留任意合法币种（例如 BNB），因为 Week 10 成本明确暂不计手续费；导入、加密保存和备份不得丢失手续费事实。
- 旧加密账本中的 EUR、CNY 等记录允许查看和救援导出，不进入 USD 等值饼图和曲线，并显示排除警告。
- USD 成交事实、USDT 成交事实以及 Binance 的 USDT 行情在图表层均按 1:1 汇总为 USD 等值；不得对手续费币种执行该换算。
- 已清仓资产及其历史事实不得被删除；当前饼图可为空，历史曲线仍保留过去区间。

### 3. 价格事实

- 合法市场价格只来自手动 `PriceSnapshot` 或 Binance 公共市场数据生成的 API `PriceSnapshot`。
- 手动价格是用户确认的真实历史/当前价格事实，不是情景模拟；可以填写今天或任意过去日期，未来日期必须拒绝。
- Binance 成功响应生成的快照使用 `Asset.quoteCurrency` 作为 `PriceSnapshot.currency`；BTC/ETH/ADA 的 USDT 报价因此以 USD 等值写入，而 `binanceProvenance.sourceQuoteCurrency` 必须保留原始 `USDT` 语义。
- Binance `recordedAt` 使用响应成功到达时的本地日期，`fetchedAt` 使用响应成功到达时的完整 ISO 时间。若请求在午夜前发出、响应在午夜后到达，记录属于响应日。
- 同一 Binance provider、资产 symbol 和 `recordedAt` 日期构成日级唯一键。当天刷新更新同一记录并保留 `id / createdAt`，只更新价格、`fetchedAt / updatedAt`；跨日成功才新增记录。
- 禁止用交易成交价、平均成本、剩余成本、未来价格或 `0` 补市场价格。
- 所有历史时间点只能读取该日及之前的价格事实；最后已知价格可以向未来日期延用，不得向过去倒灌。
- 当前采用“每天打开/手动刷新后逐日积累真实快照”的策略：未打开、未刷新或刷新失败的日期没有新行情事实；延用旧价时必须显示真实来源和 as-of，不得伪装成当天观察。
- Binance 历史 Kline 只保留为未来可能的历史行情来源，本周不得调用或回填。
- 某日任一 USD/USDT 非零持仓缺合法价格时，该日总市值为缺失值；成本线继续存在，市值线断开。
- 价格来源选择算法必须只有一个共享入口，并同时服务持仓表、饼图和曲线。

### 4. 三张图

- 饼图：当前非零持仓的 USD 等值市值分配。
- 曲线：两条日级阶梯线，分别为“持仓总市值”和“持仓成本”；不是账户净值，不包含现金、充值或提现，成本暂不计手续费。
- 热力图：今天及之前 364 天，共 365 个自然日；统计买入和卖出交易笔数。
- 三图均从当前 `LedgerData` 实时派生，不进入 reducer state、IndexedDB 或备份。
- Decimal 字符串和 `decimal.js` 承担业务精度；只在图表渲染边界转为有限 JavaScript number。

## 三、目标架构与接口合同

以下文件名允许在保持职责等价时小幅调整，但边界不得合并回 Dashboard。

### 1. 模型扩展

修改：

- `src/models/types.ts`
- `src/models/index.ts`
- `src/data/builtInAssets.ts`
- `src/validators/ledgerDataValidator.ts`
- `src/validators/resourcePolicy.ts`
- 对应测试与备份 golden

新增或等价定义：

```ts
type BinanceMarketMapping = {
  provider: "binance";
  symbol: string;
  baseAsset: string;
  quoteAsset: "USDT";
};

type BinancePriceProvenance = {
  provider: "binance";
  symbol: string;
  sourceQuoteCurrency: "USDT";
  fetchedAt: ISODateTimeString;
};

type ValuationPriceMode = "auto" | "manual";

type Asset = {
  // existing fields...
  binanceMapping?: BinanceMarketMapping | null;
};

type PriceSnapshot = {
  // existing fields...
  binanceProvenance?: BinancePriceProvenance;
};
```

模型合同：

- 保持 `LedgerData.schemaVersion: 1`，只做向后兼容可选字段扩展；不得为本轮引入 v2 迁移、升级提示或解锁时自动重写密文。
- `Asset.binanceMapping` 的三态语义固定：`undefined` 表示旧数据尚无字段，`null` 表示用户明确删除，对象表示已配置；用户删除后不得被默认值自动恢复。
- 新账本及旧账本运行时归一化时，BTC、ETH、ADA 的 `undefined` 映射分别补为 `BTCUSDT`、`ETHUSDT`、`ADAUSDT`；归一化只存在内存中，等到下一次正常账本修改/保存时才持久化，不能仅因解锁自动改写加密记录。
- `PriceSnapshot` 的 Binance 来源必须保存 provider、交易对、原始 USDT 计价和真实获取时间；普通手动快照不伪造 provenance。
- 本轮新生成的 `source: "api"` 快照必须带合法 Binance provenance。旧持久化账本中缺 provenance 的 `source: "api"` 允许救援读取并警告，但不得参加 Binance 估值；新导入账本遇到该情况必须按具体路径拒绝。
- 旧持久化账本若同资产同日存在多条 Binance 快照，允许救援读取并警告；临时按较晚 `fetchedAt` 选择，仍相同则由数组中后出现者生效。下一次同日刷新以该生效记录为 canonical，保留其 `id / createdAt`、更新价格与时间并删除其他同日重复项。新导入账本存在日级重复时直接拒绝。
- 运行时 validator 必须重建并保留新字段，不能像当前实现一样把未知映射或 provenance 静默丢弃。
- resource policy 必须覆盖新增字符串字段和集合边界。
- 映射修改后通过现有整账加密保存；完整明文备份导出、导入后仍保持映射、手动/API 快照和 provenance。
- `Position`、饼图 slice、曲线点、热力等级和估值模式均为派生或会话状态，不得写入 `LedgerData`。

### 2. 日期、兼容与写入策略

建议新增：

- `src/utils/ledgerDate.ts`
- `src/policies/ledgerFactPolicy.ts`
- `src/policies/ledgerImportPolicy.ts`

对外合同：

```ts
type LedgerClock = {
  now(): Date;
  todayKey(): string;
};

function getLedgerDateKey(value: string): string;

function partitionLedgerFactsForToday(
  ledgerData: LedgerData,
  todayKey: string,
): {
  activeTrades: Trade[];
  activePriceSnapshots: PriceSnapshot[];
  futureTrades: Trade[];
  futurePriceSnapshots: PriceSnapshot[];
  unsupportedCurrencyAssets: Asset[];
};
```

边界：

- `validateLedgerData` 继续负责结构和引用安全，允许旧持久化数据中的未来事实及旧币种通过，以保证解锁和救援。
- 新增/编辑 service 负责阻止未来事实和不支持币种进入新状态。
- 备份导入在结构校验后再执行严格 import policy；未来事实或非 USD/USDT 数据拒绝整次导入，不做部分导入。
- hydration 只产生兼容警告，不因旧未来事实、旧币种、旧缺 provenance API 价或旧重复日级 Binance 价进入读取失败。
- 发现旧未来事实时进入纠正模式。普通交易/价格新增、正常历史删除和自动行情刷新必须禁用；只开放删除未来事实、完整救援导出、合法整账导入替换和清空。
- `usePersistentLedger.replaceLedgerFromBackup` 和 `BackupControls` 返回并展示具体 policy errors；不能只显示笼统“备份无效”。
- `usePersistentLedger` 暴露 `ledgerEpoch`（或等价 replacement version），只在 hydration、import、clear、repository switch 时递增；普通交易、价格、映射修改不得递增。
- `ledgerEpoch` 变化时重置热力图日期筛选和本次行情刷新结果；同一已解锁会话中的估值价格模式保持不变，下一次重新解锁才重置为“自动行情”。

### 3. 共享重放与价格选择

建议新增：

- `src/calculators/positionReplay.ts`
- `src/services/chartDataService.ts`
- `src/services/priceSelectionService.ts`（必须在 Gate 2 完成，供 Gate 2 行情 UI 与 Gate 3 派生服务共同复用）

改造：

- `src/calculators/positionCalculator.ts`
- `src/services/positionService.ts`
- 交易校验中依赖持仓时间线的部分

价格选择合同：

```ts
type SelectedPrice = {
  snapshot: PriceSnapshot;
  effectiveCurrency: "USD";
  actualSource: "manual" | "binance";
  asOf: string;
};

function selectPriceAsOf(
  snapshots: readonly PriceSnapshot[],
  asset: Asset,
  dateKey: string,
  mode: ValuationPriceMode,
): SelectedPrice | undefined;
```

- 先排除未来事实、旧缺 provenance API 价和不支持估值币种，再限制为 `dateKey` 当日及以前。
- “自动行情”模式：分别取 Binance 与真实手动价格的最新记录日期，日期较新者生效；两者最新日期相同则 Binance 生效。当天 Binance 刷新失败而当天已有手动价格时，手动价格自然因日期较新而生效。
- “手动价格”模式：选择目标日及以前最新的真实手动价格；若不存在手动价格，则回退“自动行情”算法。
- 同一来源同一记录日按本计划的日期排序合同选择；完整时间相同或 date-only 混排时保持账本数组稳定顺序，后出现的等价更正记录生效。
- 选择结果始终保留实际来源和 as-of；切换模式不删除任何快照。
- 全局模式只提供“自动行情 / 手动价格”，每次解锁默认“自动行情”。它同时控制持仓汇总、饼图和曲线，禁止每处自行选择。
- 持仓表、饼图和曲线必须复用这一入口，不得分别实现“最新价格”。

共享重放合同：

- 从现有 `positionCalculator` 抽取买入、部分卖出、清仓、加权平均成本、剩余成本和已实现盈亏的纯逻辑。
- 当前持仓和历史曲线必须复用同一套规则；不得复制 DCA 公式。
- 原有 golden 结果必须保持不变。
- 日级曲线先稳定排序一次事实，再单向扫描并按日聚合；禁止每生成一个日期点就全量扫描交易。
- 业务中间值保持 Decimal；不得在 service 中先转 number 再求和。

## 四、Gate 0：基线、旧文档纠偏与执行记录

### 要做

1. 分别确认外层文档仓库和嵌套源码仓库的 `status`、分支、最近提交；记录用户已有修改。
2. 源码仓库若不在已核对的等价 Week 10 功能分支，则从当前干净 `main` 创建并切换到 `zhennn/week10-charts-binance`；不得在源码 `main` 直接开发。
3. 在源码仓库运行：

```bash
npm test
npm run lint
npm run build
git diff --check
```

4. 记录当前测试文件数、测试数和失败项，不沿用旧状态数字冒充本轮基线。
5. 新建 Week 10 执行验收记录，例如：

```text
01一些进度/日志/week10_260814/02A_W10-三图与Binance行情执行验收记录.md
```

6. 将旧 Week 10 两份 `00` 文档的标题、范围和任务文字纠正为与 `01A/01B/01C` 一致的三图、Binance、五档算法和 Gate 制清单；Gate 0 只做范围纠偏，所有执行任务仍保持“未开始”，不得提前勾选。
7. 明确记载 Week 9 整机硬离线为“已取消、未验证、不再阻塞”，不得勾成通过。
8. Gate 0 文档纠偏验证后，在外层文档仓库创建独立中文 commit；不得包含源码仓库内容。

### Gate 0 通过线

- 基线命令结果有真实证据。
- 旧清单不再与本计划冲突。
- 未改源码业务逻辑。
- 两个仓库的已有修改均被保留。
- 源码已位于专用 Week 10 功能分支；Gate 0 文档改动已在外层仓库独立提交。

## 五、Gate 1：日期、未来事实、币种和模型兼容

### 要做

1. 实现不可变 `YYYY-MM-DD` 日级归属和可注入 clock。
2. 在交易创建、手动价格创建、Binance 快照创建处拒绝未来日期。
3. 实现结构校验、hydration 兼容 policy、严格 import policy 三层边界。
4. 旧未来事实加载后：
   - 原始交易/价格列表允许查看并标示“无效未来事实”。
   - 持仓、三图、统计和价格选择全部排除。
   - 进入纠正模式，只开放删除未来事实、完整救援导出、合法整账替换和清空。
   - 最后一条未来事实删除后恢复正常写入。
5. 旧非 USD/USDT 数据加载后：
   - 原始数据可查看、可救援导出。
   - USD 等值图表排除并显示警告。
6. 新导入未来事实或非 USD/USDT 时整次拒绝，显示精确路径。
7. 扩展 Asset 三态映射和 PriceSnapshot provenance 的模型、validator、resource policy、初始化和完整备份闭环，保持 schema v1。
8. 实现旧 API 缺 provenance、旧同日重复 Binance 快照的救援兼容，以及新导入对应数据的严格拒绝。
9. 实现 `ledgerEpoch`，只在 hydration、import、clear、repository switch 时变化。

### 必测

- date-only 与带 offset datetime 在不同时区环境仍落入原始日期 key。
- 同一天 datetime 按真实先后排序；同时间稳定。
- clock 固定在午夜边界、月末、年末时无漂移。
- 新交易、新手动价、新 API 价分别拒绝明天。
- 旧未来交易/价格 hydrate 成功但不影响当前持仓或三图输入；纠正模式禁止正常写入和自动刷新，删除完无效事实后恢复。
- 导入未来交易、未来价格、EUR/CNY 逐项拒绝且旧账本不被覆盖。
- BNB 等手续费币种允许保留并完成备份往返，但不计入 Week 10 成本。
- BTC/ETH/ADA 默认映射存在；删除映射后刷新不恢复。
- `undefined` 旧映射只在内存归一化，解锁不自动重写密文，下一次正常保存才持久化；`null` 不归一化。
- 新 API 价缺 provenance、新导入同日重复 Binance 价被精确拒绝；旧数据可救援、警告且不制造估值。
- 映射、手动/API 快照与 provenance 通过 validator、加密 repository 重挂载、完整明文导出和导入。
- `ledgerEpoch` 普通 mutation 不变，四类整账替换递增。

### Gate 1 通过线

- 不存在未来事实进入当前派生结果的路径。
- 不存在跨时区移动历史日期格子的路径。
- 旧账本可救援，新脏数据不可进入。
- 新字段不会被 validator 或备份流程丢弃。

## 六、Gate 2：Binance 最新价格与批量持久化

### 文件职责

建议新增：

- `src/marketData/binanceMarketDataClient.ts`
- `src/marketData/binanceMarketDataTypes.ts`
- `src/services/binanceMappingService.ts`
- `src/services/binancePriceRefreshService.ts`
- `src/services/priceSelectionService.ts`
- `src/components/market-data/MarketDataControls.tsx`
- 对应测试

### API 合同

- 只调用 Binance Spot 公共 REST 市场数据，不添加 API key，不调用账户、余额、订单或私有 endpoint。
- 浏览器直接请求 Binance；Week 10 不新增 Next.js/API route、服务端代理或自建中转。
- base URL 固定集中配置为 `https://data-api.binance.vision`。
- 交易对验证使用 `GET /api/v3/exchangeInfo?symbol=...`，运行时确认：
  - symbol 精确匹配；
  - `status === "TRADING"`；
  - `baseAsset` 与账本资产 symbol 匹配；
  - `quoteAsset === "USDT"`；
  - Spot 可交易。
- 最新价格使用 `GET /api/v3/ticker/price?symbols=[...]` 或语义等价的批量请求，只请求已配置且本轮需要刷新的 symbols；不得无参数下载全市场。
- fetch、clock 和 ID factory 可注入；每次网络请求超时固定为 8 秒。
- 不做自动重试。超时、断网、限流或服务错误后只显示失败，等待用户手动重试或下一次解锁刷新。
- 对 HTTP 非 2xx、429/418、超时、断网、畸形 JSON、缺 symbol、重复 symbol、非正数或非有限价格生成结构化逐资产失败，不写入假快照。

### 映射合同

- 用户手动输入交易对，统一 trim 和大写后再验证。
- BTC/ETH/ADA 的 `BTCUSDT / ETHUSDT / ADAUSDT` 是随应用提供的可信默认配置，离线也能显示、编辑或删除，但在实际取价前仍必须通过在线 exchangeInfo 校验；校验失败时保留配置、显示错误且不生成价格。
- 除内置默认外，新增或修改映射必须在线验证成功后才能保存。
- 映射配置只覆盖 `LedgerData.assets` 中已经存在的资产；可以为已有自定义资产配置映射，但 Week 10 不新增资产 CRUD。
- 删除映射只停止以后刷新，历史 API 快照保留。
- 删除映射后，旧 API 快照仍是有效历史事实，可以按 as-of 规则用于当前和历史估值。
- 映射操作遵守 Dashboard `isWritable`、resource policy 和现有串行保存门禁。
- 映射配置区列出账本内全部资产；实际价格来源/as-of 摘要只列出当前非零持仓资产。
- 浏览器请求会把所查询的交易对 symbol 发送给 Binance，UI 隐私说明不得暗示完全不出网；交易、数量、成本和账本内容不得发送。

### 刷新合同

- Dashboard 解锁并达到 `hydrationStatus === "ready"`、可写、无 import/clear/repository switch 时，自动刷新一次。
- 每次重新解锁可再自动刷新一次；同一挂载周期的 rerender 不得重复请求。
- 提供“刷新 Binance 价格”按钮；不做轮询、WebSocket、后台刷新或自动重试循环。
- 刷新进行中禁用重复刷新按钮。
- 每次请求捕获 request ID、当前 `ledgerEpoch` 和映射签名；映射修改/删除、import、clear、repository switch 或组件卸载必须 abort 或使旧请求失效。
- 只有最新 request ID、未变化的 `ledgerEpoch` 且资产映射仍与请求时完全一致，响应才可写入。
- 多资产允许部分成功：成功项生成快照，失败项显示逐资产原因并保留旧 API 快照及手动回退。
- 同一资产同一记录日期最多一条 Binance API 快照：
  - 首次成功新增；
  - 同日再次成功保留原记录 `id / createdAt`，更新价格、`fetchedAt / updatedAt`，不追加第二条；
  - 不删除手动快照。
- 一次多资产刷新把所有成功项交给一个 reducer batch；reducer 必须基于“响应到达时最新的 LedgerData”合并，禁止用请求开始时的旧账本整体覆盖。整批只 dispatch 一次、只增加一次 mutation version、只触发一次整账保存。
- 只读、loading、importing、clearing、dirty repository switch 阶段不得自动写入。
- 未来事实纠正模式不得自动或手动刷新。

### 价格选择前置合同

- Gate 2 必须完成第三章定义的 `priceSelectionService.selectPriceAsOf(...)`，不得把统一价格选择推迟到 Gate 3。
- selector 必须完整实现“自动行情 / 手动价格”、最新记录日期比较、同日 Binance 胜出、手动模式无手动事实时回退自动、未来/不支持币种/旧缺 provenance API 价排除，以及实际来源和 as-of 返回。
- Gate 2 的行情状态、持仓当前价与模式开关只调用这一 selector；不得在组件、刷新 service 或临时 helper 中复制另一套优先规则。
- Gate 3 只负责复用已经通过 Gate 2 的 selector 构建当前持仓、饼图和历史曲线，不得重新定义价格选择算法。

### UI 合同

图表总览区顶部提供：

- 全局“估值价格模式”开关：“自动行情 / 手动价格”；
- 每次解锁默认“自动行情”，仅会话状态，不写入 `LedgerData`；同一解锁会话内发生 import/clear 时保持用户当前选择；
- 手动刷新按钮和 loading 状态；
- 最近一次刷新摘要；
- 映射配置入口；
- 当前非零持仓资产的实际采用来源、价格 as-of、失败原因；
- 常驻 `1 USDT ≈ 1 USD` 近似说明。

### 必测

- exchangeInfo 四项验证及所有拒绝分支。
- 批量 ticker 正常、部分缺失、重复、畸形、负数、零值。
- timeout、network error、429/418、500 均降级且不破坏本地账本。
- 请求固定走 `data-api.binance.vision`；不携带 API key；无服务端代理和自动重试。
- 请求跨午夜时以响应日写入；首次新增、同日保留 ID upsert、跨日新增、部分成功一次 batch mutation。
- 自动刷新只在一次可写解锁后执行一次。
- 自动/手动模式切换即时改变派生结果但不改变账本；手动模式无手动价时回退自动。
- 删除映射后不请求该资产，旧 API 快照仍可作为历史事实。
- 请求中发生普通交易/价格修改，成功结果合并进响应时最新账本且不覆盖修改。
- 请求中发生映射变更、整账替换或卸载，过期响应被丢弃；重复点击不会产生并发刷新。
- selector 单元测试覆盖自动/手动模式、日期新旧、同日 Binance 胜出、手动缺失回退、未来/非法候选排除和稳定 tie-break。

### Gate 2 通过线

- Binance 完全不可用时，本地交易、手动价格、离线查看、加密保存、备份和清空仍可用。
- 任一失败都不清空旧价、不写 `0`、不阻塞本地账本。
- 映射和成功快照真实持久化，批量刷新没有多次整账写入。
- 统一 price selector 已完成并通过测试；Gate 2 的模式开关不依赖尚未执行的 Gate 3 逻辑。

## 七、Gate 3：共享派生服务

### 1. 当前持仓接线

1. 用 `todayKey` 隔离未到期未来事实。
2. 对 USD/USDT 资产复用 Gate 2 已通过的全局 price selector，不新增或复制价格优先规则。
3. 持仓表继续显示数量、平均成本、剩余成本、已实现盈亏。
4. USD/USDT 行显示实际价格来源、as-of、市值和未实现盈亏。
5. 旧其他币种行可以保留原币种事实展示，但明确“不进入 USD 等值图表”。
6. 无合法价格时保持 `undefined / -- / 未输入价格`，不得制造零值。

### 2. 饼图数据合同

建议入口：

```ts
function buildHoldingAllocation(
  ledgerData: LedgerData,
  options: { todayKey: string; mode: ValuationPriceMode },
): {
  slices: Array<{
    assetSymbol: string;
    marketValue: DecimalString;
    ratio: DecimalString;
    source: "manual" | "binance";
    asOf: string;
  }>;
  totalMarketValue?: DecimalString;
  missingPriceAssets: string[];
  excludedCurrencyAssets: string[];
};
```

- 只统计当前非零持仓。
- 单一可估值资产占比 100%。
- 部分缺价：只对可估值资产计算占比，并单列缺价资产。
- 全部缺价：无 slices、显示缺价状态。
- 零仓位不进饼图；稳定排序，建议按市值降序、symbol 升序 tie-break。
- 总额必须与持仓表同一选择器下的市值之和一致。

### 3. 曲线数据合同

建议入口：

```ts
type ChartRange = "1d" | "7d" | "30d" | "365d" | "all";

type HoldingHistoryPoint = {
  date: string;
  totalCostBasis: DecimalString;
  totalMarketValue?: DecimalString;
  missingPriceAssets: string[];
};
```

- `7d / 30d / 365d`：包含今天的连续自然日，每天一个点。
- 每个范围开始前先重放更早事实，得到正确期初持仓、成本和可沿用价格。
- `all`：从第一笔相关交易日期到今天，每天一个点；当前已清仓资产的过去点仍保留。
- 无新交易或价格时沿用最后已知事实，阶梯线水平。
- Binance 快照只从真实 fetched 所属记录日开始影响曲线；不补历史 Kline。
- `1d` 使用相同日级结果渲染两个“显示边界点”（当天开始/当天结束），两点数值完全相同并形成水平阶梯；它们不是两条真实日内行情事实。
- `1d` 区域必须常驻说明“无可靠日内变化，边界点仅用于显示”。当天无市场价格时仍画水平成本线，市值线保持缺失。
- 任一非零持仓缺价时 `totalMarketValue` 为 `undefined`，同时给出缺价 symbol；ECharts 使用断点，不把缺口两侧相连。
- 曲线标题可用“资产增长曲线”，图例必须准确写“持仓总市值”“持仓成本”，并显示“不含现金、非账户净值、成本暂不计手续费”。

### 4. 热力数据合同

建议入口：

```ts
type TradeHeatmapDay = {
  date: string;
  total: number;
  buys: number;
  sells: number;
  level: 0 | 1 | 2 | 3 | 4;
};
```

- 范围固定为今天及之前 364 天。
- 买入、卖出都计数；旧未来交易不计数。
- `maxCount = max(365 天每日 total)`。
- `count === 0`：level 0。
- `maxCount > 0` 时 `ratio = count / maxCount`：
  - `0 < ratio <= 0.25`：level 1；
  - `0.25 < ratio <= 0.50`：level 2；
  - `0.50 < ratio <= 0.75`：level 3；
  - `0.75 < ratio <= 1`：level 4。
- 单一非零日为 level 4；`1,1,1,30` 为 `1,1,1,4`；全零为 365 个 level 0。
- 新增、删除交易后重算 365 天等级；等级不持久化。

### 必测

- 现有 golden 当前持仓结果不变。
- 自动/手动两种估值模式、日期新旧比较、同日 Binance 胜出、手动缺失回退、未来快照、缺价、多资产和清仓。
- 1/7/30/365/all 的日期数量、期初重放、无事件水平线。
- `1d` 恰好两个等值显示边界点；缺市场价格时只有水平成本线；UI 明确说明不是日内行情。
- 任一缺价市值断点但成本连续。
- 365 天边界、闰日、跨年、offset 日期、不同时区。
- 热力阈值等号边界、单非零、极端倾斜、全零、范围外和未来交易。
- 输入不可变；派生结果不写入 LedgerData。

### Gate 3 通过线

- 持仓表、饼图、曲线对同一资产/日期/估值模式选择同一价格。
- 当前持仓和历史曲线的 DCA、卖出成本规则同源。
- 没有逐日期全量扫描。
- 缺价、未来事实和旧币种不会进入虚假合计。

## 八、Gate 4：ECharts 适配层、页面减法与总览骨架

### 依赖与适配

1. 通过 npm 安装并锁定 Apache ECharts，更新 `package.json` 和 lockfile；不安装 Recharts。
2. 从 `echarts/core` 按需注册：
   - CanvasRenderer；
   - PieChart；
   - LineChart；
   - HeatmapChart；
   - Tooltip、Legend、Grid、Calendar 等必要组件。
3. 新建唯一 React 生命周期适配层，例如 `src/components/charts/EChart.tsx`：
   - client component；
   - mount 时 init；
   - option 变化时使用 `setOption(option, { notMerge: true })`（或更新前显式 `clear()`）做完整替换，旧 series/calendar/legend 不得残留；
   - 注册事件前先对同名事件 `off`，再 `on` 当前 handler；
   - ResizeObserver 或等价机制 resize；
   - unmount 时断开 ResizeObserver、移除所有事件并 dispose；
   - 避免重复 init、悬空 listener 和实例泄漏；
   - `animation: false`。
4. option builder 只接受已派生 view model；不得读取 LedgerData、调用 calculator、选价格或计算热力等级。
5. SSR/jsdom 环境安全；组件测试可 mock ECharts 实例生命周期。
6. 生命周期测试必须覆盖“有数据 -> 空数据”“365 日 -> 1 日”和多次 rerender，证明旧图形、旧点击 handler 和 observer 不残留。

### 页面减法

修改 `DashboardShell.tsx` 及必要子组件：

- 删除空侧栏、假导航、帮助/快捷键/切换账本假入口。
- 删除顶部 `Today / This Month / All` 假按钮。
- 删除“未来净值曲线和 K 线”占位图。
- 删除 `Future chart area`、`Calculated later`、`Manual source`、`Trade draft`、`LedgerData source`、`Local data`、`Browser-only MVP shell` 等开发阶段英文标签。
- 不删除 hydration、只读、保存失败、retry、repository switch、加密访问门禁、导入导出、清空二次确认等真实安全功能。

### 页面顺序

```text
账本状态 / 警告
-> 图表总览控制（估值价格模式、刷新、映射、行情状态、1:1 披露）
-> 三张图
-> 持仓汇总与手动价格输入
-> 新增交易
-> 交易列表
-> 数据管理
```

### Gate 4 通过线

- 假入口和占位内容清零，真实功能完整。
- ECharts 只有一个生命周期适配层，使用 Canvas、无动画。
- Dashboard 只编排 view model 和事件，不承载图表业务算法。
- loading/error/read-only/dirty/import/clear 原有门禁回归通过。

## 九、Gate 5：三张图 UI 与交互

### 1. 当前持仓市值饼图

- 标题表达“当前 USD 等值持仓分配”。
- slice/tooltip 显示 symbol、市值、占比、实际价格来源和 as-of。
- 部分缺价时仍画可估值部分，同时显著列出未估值资产。
- 全部缺价时显示专属缺价状态，不画误导性空饼。
- 无非零持仓时显示空持仓状态。
- 单资产为完整圆并显示 100%。
- 交易、手动价格、Binance 刷新、估值模式切换、导入和清空后即时重派生。

### 2. 持仓总市值 / 持仓成本曲线

- 提供 `1日 / 7日 / 30日 / 365日 / 全部` 真正可用的范围选择。
- 两条线都使用 step，不使用 smooth，不用斜线暗示不存在的连续波动。
- `1日` 显示两个数值相同的日内边界点，并明确写“无可靠日内变化，边界点仅用于显示”。
- 缺市值点使用断点；成本线继续。
- tooltip 显示精确日期、成本、市值或缺价资产，不从采样后的点反推业务值。
- 空账本、单点、只有成本、完全缺价、清仓后当前为零均不崩。
- 不增加 dataZoom、K 线、交易标记、指标或历史 Binance 回填。

### 3. 最近 365 天交易活跃热力图

- 使用 ECharts calendar heatmap，始终渲染 365 个自然日格子。
- 布局采用 GitHub 风格：一周一列、星期为行，从左到右推进时间；显示必要的星期提示和月份标签，月份标签必须与日期格真实位置一致。
- 五档颜色含 level 0 无亮度和 level 1-4 四档亮度。
- 提供从 level 0 到 level 4 的可读图例，除颜色外还要用文字说明“无交易 / 低 / 较低 / 较高 / 最高”等级含义。
- tooltip 显示日期、总笔数、买入数、卖出数。
- 点击格子将交易列表过滤为该记录日期；标题显示日期。
- 再点同一天取消；提供明确“清除日期筛选”按钮。
- 新增/删除所选日交易时，格子、tooltip 数据和列表同步。
- import、clear、repository replace 后重置筛选。
- 日期筛选和估值价格模式均为会话 UI state，不进入 reducer 或备份。

### 可访问性与测试

- 所有按钮有明确中文名称和 disabled 状态。
- 图表提供可读标题、说明和非 Canvas 文本摘要/空状态，不能只依赖颜色传达缺价或失败。
- 组件测试 mock ECharts，验证传入 option、生命周期和交互；业务数值主要由纯 service 测试覆盖。
- Dashboard interaction/golden 测试覆盖真实表单写入后持仓、三图摘要和交易筛选联动。

### Gate 5 通过线

- 三图都来自真实账本派生并会随事实变化更新。
- 估值模式切换后三处市值一致。
- 热力点击过滤与清除完整闭环。
- 无任何伪造市场值、未来价格泄漏或错误连线。

## 十、Gate 6：持久化、安全与恢复回归

### 必测链路

1. 首次设密/解锁后自动行情刷新只发生一次。
2. Binance 批量成功后进入现有加密 V2 envelope，原始 IndexedDB record 无账本明文。
3. 刷新页面并解锁，映射、provenance 和 API 快照恢复。
4. 完整明文备份导出包含 assets、trades、手动/API `PriceSnapshot`、Binance 映射、provenance 和手续费规则；它保存原始事实，不保存 Position、饼图 slice、曲线点、热力等级或估值模式。
5. 清空后不残留图表筛选、映射 UI state 或旧 ECharts 实例。
6. 无刷新导入备份后恢复映射和历史价格事实并重新派生图表；重置热力筛选和刷新结果，但同一解锁会话内保留估值模式。
7. 损坏/未来/非 USD-USDT 备份拒绝时，当前页面账本与加密 record 不变。
8. 保存失败、retry、dirty、repository switch blocked、只读超限和 hydration error 语义不退化。
9. Binance 请求尚未完成时修改/删除映射、卸载、切换 repository、清空或导入，不得让过期响应写入新账本；使用 request ID、`ledgerEpoch`、映射签名和 AbortController 或等价保护。
10. Binance 请求尚未完成时新增正常交易或手动价格，返回的成功快照必须合并进响应时最新账本，不能恢复请求开始时的旧副本。
11. 旧未来事实纠正模式下，完整救援备份不丢事实，普通写入与行情刷新被拦截；清理完未来事实后正常主链恢复。

### Gate 6 通过线

- Binance 接入没有绕过 `usePersistentLedger`、resource policy 或加密 repository。
- 任何异步旧响应都不能污染新的账本 generation。
- 原有交易、价格、导入导出、清空、保存失败恢复和加密主链无回归。

## 十一、Gate 7：最终验证、生产证据与文档收口

### 自动化 Gate

在源码仓库运行并记录完整结果：

```bash
npm test
npm run lint
npm run build
git diff --check
```

额外静态检查：

- production 代码无 Recharts。
- 无 Binance 私有 API、API key、账户或下单代码。
- Binance 客户端只走浏览器直连 `https://data-api.binance.vision`，无 server proxy、自动重试、polling、WebSocket 或 Kline。
- 无 dataZoom、动画、未来 `Trade`、情景价格功能或持久化图表派生数据。
- 无交易价/成本/未来价/`0` 代替市场价格。
- ECharts 业务输入只来自纯 service。
- Decimal 只在渲染边界转换为有限 number。

### production 主链

使用 production build 在真实浏览器完成至少以下证据：

1. 解锁并看到页面减法后的真实 Dashboard。
2. BTC/ETH/ADA 默认映射可见；自动刷新成功或明确降级。
3. “自动行情 / 手动价格”切换，验证日期较新者、同日 Binance 胜出、手动缺失回退，且持仓表、饼图、曲线同步。
4. 添加买入、卖出和手动价格，三图即时更新。
5. 饼图正常、部分缺价、全缺价、单资产。
6. 曲线 1/7/30/365/all、1 日双边界水平显示、历史缺价断线、成本连续、清仓历史保留。
7. 热力 365 格、月份/星期标签、五档图例、单日、极端倾斜、点击过滤、再次点击取消、清除按钮。
8. Binance 超时或不可达时旧价/手动价仍可用，本地账本可继续编辑。
9. 导出、清空、无刷新导入、刷新解锁恢复完整闭环。
10. 控制台无未解释 error/warning，390px 和桌面宽度无页面级横向溢出。
11. 构造旧未来事实后进入纠正模式，只能清理/救援/替换/清空；修复后恢复正常写入。
12. 刷新请求中修改映射或整账替换，旧响应不写入；请求中新增普通事实，响应只合并行情而不覆盖新事实。

真实 Binance 因地域、网络、限流或服务不可用而失败时：

- 不把“联网成功”伪记为通过；
- 以 mock/contract 自动化证明客户端正确；
- 以 production 降级路径证明本地功能不受阻；
- 记录外部限制，但它不阻塞 Week 10 的可降级通过。

### 文档收口

最终代码通过后才更新：

- `01一些进度/日志/week10_260814/00-Week10每日执行清单.md`
- `01一些进度/日志/week10_260814/00-Week10-Checklist.md`
- `01一些进度/日志/week10_260814/02A_W10-三图与Binance行情执行验收记录.md`
- `01一些进度/日志/00-当前开发状态.md`
- `01一些进度/产出/LocalFirstTradingLedger/README.md`

回填规则：

- 只按实际证据勾选。
- Gate 0 只能纠正旧清单范围并保持未开始；所有完成勾选必须等 Gate 7 依据证据回填。
- 取消项写“已取消、未验证、不再阻塞”，不能写通过。
- 外部 Binance 未成功时写清 mock 合同证据与 production 降级证据。
- 写清源码提交、测试数、lint/build、production 主链、已知限制和下一步。
- 保存论文配图草稿时不得泄露私人账本或密码；使用非敏感测试数据，并附图表口径说明。
- Gate 7 回填验证完成后，在外层文档仓库创建独立中文 commit；不得夹带源码文件。

### Gate 7 通过线

- 全量测试、lint、production build、diff-check 通过。
- 三图合同、行情降级、安全与恢复主链有证据。
- 源码 README、当前状态、Week 10 Checklist 和验收记录与实际实现一致。
- 源码功能分支和外层文档仓库的本轮预期修改均已按关键节点本地提交，两个仓库分别检查 clean。
- 源码功能分支保持未合并状态；两个仓库均不得推送远端，等待用户审查和进一步指令。

## 十二、禁止范围

本轮明确不做：

- Binance 历史 Kline、OHLC、历史行情回填。
- 情景价格、假设 BTC/其他资产达到某价格、未来价格模拟；不得创建相关 type、state、UI 或测试。
- 定时轮询、WebSocket、后台刷新、分钟级日内曲线。
- Binance 账户、余额、订单、交易执行、API key。
- 第二行情 provider 和自动 provider 切换。
- 严格 USD/USDT 汇率、EUR/CNY 等多币种选择、历史 FX。
- `PendingOrder`、未来交易、预约写入。
- 现金、充值、提现、完整账户净值。
- K 线、技术指标、transaction-marker overlay、dataZoom。
- 图表动画、主题系统和大规模视觉美化。
- 100k 正式 benchmark、生成器或性能通过线；本轮只守住现有 resource policy，并用单次排序/单向重放避免明显退化。
- 把 Position、曲线点、饼图 slice、热力等级或估值价格模式写入 LedgerData。

## 十三、最终验收矩阵

| 需求 | 必须证据 |
| --- | --- |
| 页面减法 | 假侧栏、假导航、假筛选、占位图和开发英文标签不存在；安全状态仍存在 |
| ECharts | `echarts/core` 按需注册、Canvas、唯一 React 适配层、无动画、无 Recharts |
| Binance 映射 | 默认映射、在线验证、编辑/删除、加密保存、备份恢复 |
| 最新价格 | 自动一次、手动刷新、批量部分成功、同日 upsert、逐项错误 |
| 降级 | 断网/超时/限流不清空旧价、不写 0、不阻塞本地账本 |
| 估值价格模式 | 解锁默认自动；自动按最新日期且同日 Binance 胜出；手动无事实时回退；三处同源且不删除事实 |
| 日期 | 字段前缀分桶、offset 不移日、date-only 稳定顺序、响应日归属、clock 可注入 |
| 未来事实 | 新建和导入拒绝；旧数据进入纠正模式，只能清理/救援/替换/清空 |
| USD/USDT | 1:1 近似常驻披露；估值字段新其他币种拒绝；手续费币种保留；旧币种隔离 |
| 饼图 | 当前非零持仓、缺价不为 0、部分/全部缺价、单资产 100% |
| 曲线 | 1 日双边界水平显示、7/30/365/all、两条阶梯线、期初重放、缺价断点、清仓历史 |
| 热力图 | 365 天、月份/星期标签、0-4 图例、买卖计数、max-ratio 五档、阈值边界、极端倾斜 |
| 日期筛选 | 点击过滤、再点取消、清除入口、联动更新、replace 后重置、仅会话态 |
| 精度与性能 | Decimal 业务值、有限 number 渲染、一次排序和单向重放 |
| 安全恢复 | schema v1 兼容、完整事实备份、清空、无刷新导入、请求代次/映射隔离、最新账本合并 |
| Git 执行 | 源码专用功能分支；Gate 1-6 关键节点中文提交；Gate 0/7 文档独立提交；两仓 clean；未推送、未合并 |
| 最终质量 | 全量 test、lint、build、diff-check、production 主链和文档回填 |

只有矩阵全部取得真实证据，或明确标为用户接受的取消/外部降级项，Week 10 才能进入最终审查。
