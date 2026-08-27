# 01B_W15-main｜账本 V4 数据校正与首页改造执行文档

- 日期：2026-08-27
- 轨道：长期账本产品 `main`
- 工作目录：`01一些进度/产出/LocalFirstTradingLedger/`
- 依据：`01A_W15-main-账本V4数据校正与首页改造产品定义.md`
- 执行者：外部 AI；产出 `01C` 执行报告，最终验收另行进行

## 结论

本文件是执行合同。三个阶段在同一个新分支上按顺序完成：V4 数据模型 → 显示格式化 → 首页改造与界面修整。三阶段全部完成才构成一次可交付成果，中间状态不可交付。

任何与 `01A` 产品决定冲突之处，必须停止并在 `01C` 中记录，不得自行取舍。

---

# 零、Git 与执行边界

## 0.1 分支要求

| 项目 | 要求 |
| --- | --- |
| 仓库 | `01一些进度/产出/LocalFirstTradingLedger/`。注意同级还有 `LocalFirstTradingLedger-CS2026/`，那是论文轨道，本批完全不碰 |
| 起点 | 从 `main` 最新提交切出 |
| 新分支名 | `zhennn/w15-main-v4-display-home` |
| 提交粒度 | 每个阶段至少一个提交；阶段内出现可独立验证的里程碑时再拆分提交 |
| 提交信息 | 英文，命令式语气，说明改了什么与为什么 |
| 禁止 | 不得合并回 `main`，不得 `push`，不得 rebase 已有历史，不得使用破坏性 git 命令，不得创建与 `CS2026` 之间的任何关联 |
| 收尾 | 分支停在最后一个提交上，工作树保持 clean，由用户后续决定去向 |

根文档仓库（工作区根目录）与源码仓库是两个独立仓库，改动必须分别检查、分别提交，不得混成一个提交。`01C` 属于根文档仓库。

## 0.2 禁止事项

| 编号 | 约束 |
| --- | --- |
| B-01 | 不得读取、引用、复制 `~/Downloads/history_OKX/` 下的任何内容 |
| B-02 | 不得把任何真实账户数字写入源码、测试夹具、注释或提交信息。测试一律使用虚构数据 |
| B-03 | 不得通过伪造买入或卖出交易来凑数量。数量差异只能由本批新增的转入转出事实表达 |
| B-04 | 不得降低底层算术精度。`decimal.js` 保持 40 位，持久化数值不得因显示格式化而改变 |
| B-05 | 不得改动加密、双代保存、文件锁、会话协调与导入准入的既有安全约束 |
| B-06 | 不新增联网行为。行情仍只在用户显式点击时请求 |
| B-07 | 不生成、不导入任何真实数据，不创建或覆盖真实 `.lftl` |

## 0.3 升级后果（实现时必须照顾到）

V4 拒绝 V3，用户当前的 `.lftl` 将无法打开。这是产品决定。实现上必须保证：

- 打开 V3 文件时给出明确的中文拒绝提示，说明版本不兼容且不提供迁移，**不得崩溃、不得静默失败、不得自动删除或覆盖该文件**
- 拒绝之后用户仍能正常新建账本并进入导入流程
- 该路径必须有测试覆盖

---

# 阶段一：V4 数据模型

## 1.1 新增类型

在 `src/core/models/types.ts` 中新增，并将 `LedgerData.schemaVersion` 由 `3` 改为 `4`：

```ts
export type AssetTransferCategory =
  | "internal"      // 内部转移：账本内两个位置之间
  | "external-in"   // 外部转入：从账本外收到，非白拿
  | "external-out"  // 外部转出：转到账本外
  | "gain";         // 白拿：空投、利息、平台赠送

export type AssetTransferReason =
  | "deposit"
  | "withdrawal"
  | "internal-move"
  | "airdrop"
  | "interest"
  | "platform-gift";

export type CustodyLocation =
  | "exchange"
  | "cold-wallet"
  | "cold-wallet-earn";

export type AssetTransfer = {
  id: string;
  occurredAt: ISODateString | ISODateTimeString;
  timePrecision: TimePrecision;
  assetSymbol: string;
  quantity: DecimalString;          // 恒为正，方向由 category 决定
  category: AssetTransferCategory;
  reason: AssetTransferReason;
  unitPrice?: DecimalString;        // 仅 external-in 与 gain 必填，USDT 计价
  networkFee?: DecimalString;       // 仅 internal 与 external-out 可选，以 assetSymbol 计价
  fromLocation?: CustodyLocation;   // internal 与 external-out 必填
  toLocation?: CustodyLocation;     // internal、external-in、gain 必填
  note?: string;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
};
```

`LedgerData` 新增集合 `assetTransfers: AssetTransfer[]`，位置排在 `cashEvents` 之后。

`Position` 新增两个字段：

```ts
// 三个 key 必须始终同时存在，无持仓时为 "0"，不得使用 Partial
locationQuantities: Readonly<Record<CustodyLocation, DecimalString>>;
giftIncome: DecimalString;   // 白拿累计计入的等值 USDT
```

同步更新 `src/core/state/initialLedgerData.ts`、`src/test-support/fixtures.ts`、`src/test-support/week14V3Scenario.ts` 及全部依赖 `LedgerData` 形状的夹具。

## 1.2 合并排序（先做这一步，否则结果不确定）

交易与转入转出必须合并成一条时间线单次重放。两个数组各自的下标不可比较，直接沿用既有 `compareLedgerFactOrder` 的下标 tiebreak 会产生不确定结果。

**必须复用 `src/core/calculations/cashReplay.ts` 中 `compareCashReplayCandidates` 的既有模式**，比较顺序为：

1. 日期键
2. 两侧都带时刻时比较时刻
3. `createdAt`
4. 种类：交易优先于转入转出
5. `id` 字符串序

必须有测试证明：把同一批事实打乱输入顺序，重放结果逐字段相同。

## 1.3 重放规则

`src/core/calculations/positionReplay.ts` 改为同时消费交易与转入转出。

| 事件 | 总数量 | 剩余成本 | 已实现盈亏 | 白拿收益 | 位置 |
| --- | --- | --- | --- | --- | --- |
| 买入 | 加净买入量 | 加买入现金流出 | 不变 | 不变 | `exchange` 加 |
| 卖出 | 减总消耗量 | 按比例减 | 加 净所得 − 对应成本 | 不变 | `exchange` 减 |
| `internal` | 减 `networkFee` | 减 手续费对应成本 | 减 手续费对应成本 | 不变 | `from` 减 `quantity + networkFee`；`to` 加 `quantity` |
| `external-in` | 加 `quantity` | 加 `quantity × unitPrice` | 不变 | 不变 | `to` 加 |
| `external-out` | 减 `quantity + networkFee` | 按比例减 | 减 对应成本 | 不变 | `from` 减 `quantity + networkFee` |
| `gain` | 加 `quantity` | 加 `quantity × unitPrice` | 不变 | 加 `quantity × unitPrice` | `to` 加 |

说明：

- `networkFee` 缺省时按零处理，此时 `internal` 的总数量与成本完全不变
- “按比例减”沿用既有卖出写法：全量出清时剩余成本归零，部分出清时按 `消耗量 × (剩余成本 ÷ 当前数量)`
- `external-out` 与手续费损耗把对应成本转为已实现亏损，而不是让成本凭空消失
- 卖出时若 `exchange` 位置数量不足，即使总持仓足够也必须抛错

**四类转入转出都不产生任何 USDT 现金变动。** `src/core/calculations/cashReplay.ts` 不消费 `assetTransfers`，仅新增测试固定这条边界。

## 1.4 校验

`src/core/validation/ledgerDataValidator.ts`：

- `ROOT_KEYS` 增加 `"assetTransfers"`，保持既有精确键集校验
- `schemaVersion` 只接受 `4`
- 新增 `AssetTransfer` 实体校验，键集精确匹配
- `assetSymbol` 必须在 `assets` 中存在
- `quantity`、`unitPrice`、`networkFee` 沿用既有规范十进制规则（最多 40 位有效、18 位小数）；`quantity` 与 `unitPrice` 必须为正，`networkFee` 必须为正或缺席
- 组合规则，缺一即拒：

| 类别 | `fromLocation` | `toLocation` | `unitPrice` | `networkFee` |
| --- | --- | --- | --- | --- |
| `internal` | 必填 | 必填且不等于 `from` | 必须缺席 | 可选 |
| `external-in` | 必须缺席 | 必填 | 必填 | 必须缺席 |
| `external-out` | 必填 | 必须缺席 | 必须缺席 | 可选 |
| `gain` | 必须缺席 | 必填 | 必填 | 必须缺席 |

- `reason` 与 `category` 必须匹配：`deposit`→`external-in`、`withdrawal`→`external-out`、`internal-move`→`internal`、`airdrop`/`interest`/`platform-gift`→`gain`

`src/core/policies/ledgerImportPolicy.ts` 与 `ledgerFactPolicy.ts`：未来日期的转入转出比照既有未来事实隔离与警告。

## 1.5 文件与备份

- `src/platform/files/ledgerFileContract.ts`：键列表新增 `assetTransfers`
- `src/features/backup/backupEnvelope.ts`：`BACKUP_FORMAT_VERSION` 改为 `4`；`ledgerSchemaVersion` 只接受 `4`；对 `backupFormatVersion` 为 `2` 与 `3` 分别给出明确的中文拒绝信息，说明不提供迁移
- 承载 V3 的 `.lftl` 只识别并明确拒绝，遵守 0.3 的要求
- 导入准入不变：仍只允许写入同一会话中新建且仍为空的 C

## 1.6 录入界面

在记账工作区新增“资产转入转出”表单，与既有交易表单、现金表单并列。验收点：

| 编号 | 要求 |
| --- | --- |
| F-01 | 先选类别，表单按类别显示对应必填项；不适用的字段隐藏而不是禁用后仍可提交 |
| F-02 | 字段级错误提示中文、定位到具体字段，沿用既有表单错误呈现方式 |
| F-03 | 保存走既有认证保存流程，成功与失败反馈与现金表单一致 |
| F-04 | 键盘可完整操作，焦点顺序合理，沿用既有无障碍处理 |
| F-05 | 持仓明细表新增存放位置列，展示三个位置的数量 |

## 1.7 阶段一测试合同

| 编号 | 断言 |
| --- | --- |
| T1-01 | `internal` 无手续费时，总数量与平均购价逐字符不变，两个位置数量此消彼长 |
| T1-02 | `internal` 带手续费时，总数量减少手续费额，来源位置减 `quantity + fee`，目的位置增 `quantity`，已实现亏损增加手续费对应成本 |
| T1-03 | 固定样例：持仓 100 枚、剩余成本 1000、均价 10；`external-in` 50 枚、单价 4 之后，总量 150、剩余成本 1200、均价 8。逐字段断言 |
| T1-04 | 固定样例：持仓 100 枚、剩余成本 1000；`external-out` 20 枚之后，总量 80、剩余成本 800、已实现盈亏减少 200 |
| T1-05 | 固定样例：持仓 100 枚、剩余成本 1000、均价 10；`gain` 50 枚、单价 4 之后，总量 150、剩余成本 1200、均价 8、`giftIncome` 为 200。**同一样例若按零成本计入均价会是 6.6667，测试必须断言结果是 8 而不是 6.6667** |
| T1-06 | 四类转入转出后，USDT 现金余额逐字符不变 |
| T1-07 | `internal` 与 `external-out` 的 `quantity + networkFee` 超过总量或超过来源位置数量时被拒绝 |
| T1-08 | 卖出时 `exchange` 位置不足但总持仓足够，被拒绝 |
| T1-09 | 1.4 组合规则表的每一格各有一条拒绝用例；`reason` 与 `category` 不匹配各有一条 |
| T1-10 | V3 与 V2 备份、V3 `.lftl` 被明确拒绝，不写回、不删除源文件，且拒绝后仍可新建账本 |
| T1-11 | 交易与转入转出打乱输入顺序，重放结果逐字段与按时间排序输入一致 |
| T1-12 | `locationQuantities` 三个 key 在任何情况下都存在，无持仓时为 `"0"` |

---

# 阶段二：显示格式化

## 2.1 新建显示层

新建 `src/ui/formatLedgerNumber.ts`。不得使用币种查表，不得使用按币种枚举的条件分支。

```ts
type LedgerNumberFormat = {
  significantDigits: number;
  fixedDecimalsWhenAtLeastOne: number | null;
  maxDecimals: number;   // 固定 12
};

export const MONEY_FORMAT    = { significantDigits: 6, fixedDecimalsWhenAtLeastOne: 2,    maxDecimals: 12 };
export const QUANTITY_FORMAT = { significantDigits: 8, fixedDecimalsWhenAtLeastOne: null, maxDecimals: 12 };

export function formatMoney(value: DecimalString): string;
export function formatQuantity(value: DecimalString): string;
export function formatPercent(ratio: DecimalString): string;  // 入参为比率，输出带符号百分号，固定 2 位
```

## 2.2 算法（必须按此实现）

```
1. d = toDecimal(value)
2. 若 d 为零：
       places = fixedDecimalsWhenAtLeastOne ?? 0
       输出补零结果，不做去尾零，直接进第 6 步
3. 若 |d| >= 1 且 fixedDecimalsWhenAtLeastOne 不为 null：
       places = fixedDecimalsWhenAtLeastOne
       trim   = false
   否则：
       exponent = d.abs().e        // decimal.js 的十进制指数，等价于 floor(log10)
       places   = significantDigits - 1 - exponent
       places   = min(places, maxDecimals)
       places   = max(places, fixedDecimalsWhenAtLeastOne ?? 0, 0)
       trim     = true
4. s = d.toDecimalPlaces(places, ROUND_HALF_UP).toFixed(places)
5. 若 trim：去掉末尾多余的零，但保留至少 (fixedDecimalsWhenAtLeastOne ?? 0) 位小数；
           若小数部分被清空则连小数点一起去掉
6. 整数部分插入千分位逗号，负号保留在最前
```

**不得使用 JavaScript 浮点 `Math.log10`。** 十进制指数必须取自 `decimal.js` 的 `.e` 属性，否则边界值会出错。

`formatPercent` 先把比率乘以 100，再按固定 2 位输出，正数补 `+` 号，零输出 `0.00%`。

复用既有 `src/core/shared/decimalMath.ts` 的 `toDecimal` 与 `formatDecimal`，不要另起一套算术。

## 2.3 效果通过线

每行一条单元测试，全部命中才算过：

| 输入 | 函数 | 期望输出 |
| --- | --- | --- |
| `594.862375883946480045` | money | `594.86` |
| `6492.3391` | money | `6,492.34` |
| `0.0003` | money | `0.0003` |
| `0.5` | money | `0.50` |
| `0` | money | `0.00` |
| `94288.5` | money | `94,288.50` |
| `0.6134` | money | `0.6134` |
| `0.000000134` | money | `0.000000134` |
| `-1234.5678` | money | `-1,234.57` |
| `0.03619818` | quantity | `0.03619818` |
| `0.6177` | quantity | `0.6177` |
| `4818.72` | quantity | `4,818.72` |
| `6638.73487823` | quantity | `6,638.7349` |
| `300` | quantity | `300` |
| `0` | quantity | `0` |
| `-0.1814` | percent | `-18.14%` |
| `0.0679` | percent | `+6.79%` |
| `0` | percent | `0.00%` |

## 2.4 渲染组件

新增 `<LedgerNumber value kind />`，`kind` 取 `money` / `quantity` / `percent`。要求：

- 输出格式化文本
- 未经格式化的原始 `DecimalString` 挂到 `title` 属性供鼠标悬停查看
- 同时通过 `aria-label` 暴露完整值，保证读屏软件可读
- 套用既有 `.ledger-numeric` 样式

## 2.5 接入范围

替换全部**只读**数字展示，涉及以下文件。数量以实际为准，必须逐个文件扫过，不得因为“大致改完”而遗漏：

`src/app/HomeWorkspace.tsx`、`src/app/DashboardShell.tsx`、`src/app/TransactionsWorkspace.tsx`、`src/features/portfolio/HoldingsOverview.tsx`、`src/features/portfolio/HoldingsDetails.tsx`、`src/features/trades/TradeTable.tsx`、`src/features/trades/TradeForm.tsx`、`src/features/activity/ActivityTable.tsx`、`src/features/cash/CashEventPanel.tsx`、`src/features/market-data/MarketDataControls.tsx`

`src/features/charts/chartOptionBuilders.ts` 的三个提示框同样接入。

**输入框、受控表单值与草稿一律不格式化。** 用户正在编辑的字符串原样保留。

## 2.6 阶段二测试合同

| 编号 | 断言 |
| --- | --- |
| T2-01 | 2.3 表格全部命中 |
| T2-02 | 保存、导出、重新导入后，底层 `DecimalString` 与原值逐字符相同，证明格式化只发生在渲染层 |
| T2-03 | 表单输入框的值不被格式化改写 |
| T2-04 | `LedgerNumber` 的 `title` 与 `aria-label` 等于原始值 |
| T2-05 | 全项目扫描：`src/app` 与 `src/features` 的 tsx 中不再存在把 `DecimalString` 直接插入 JSX 文本的只读展示 |

---

# 阶段三：首页持仓成本区与界面修整

## 3.1 首页布局

按 `01A` 第十六节调整 `src/app/HomeWorkspace.tsx` 的纵向结构：

| 行 | 内容 |
| --- | --- |
| 1 | 四个指标卡 |
| 2 | 资产趋势（左）＋ 记一笔交易与资产分配饼图（右） |
| 3 | 持仓成本区，独占整行 |
| 4 | 交易活动热力图，独占整行 |

允许首页出现纵向滚动。表格在窄屏下允许自身横向滚动，但页面 `body` 不得横向滚动。

## 3.2 持仓成本区

改造 `src/features/portfolio/HoldingsOverview.tsx`。

- 复用既有 `getTopMarketValuePositions(positions, limit)`，`limit` 由 `3` 改为 `5`，不另写排序
- 列：币种、当前价格、平均购价、涨跌幅、盈亏金额、持仓量、总花费、当前市值
- 现金 USDT 单独一行，只显示余额，不参与涨跌计算与着色
- 涨跌幅 = `(latestPrice − averageCost) ÷ averageCost`；`averageCost` 为零时显示为不可计算，不得除零
- 着色：涨为绿、跌为红
- 缺当前价格的币种沿用既有规则：不参与排名，单独提示

新增按资产分组的累计买入花费，加在 `src/features/portfolio/pnlSummaryService.ts`：既有 `buyOutflow` 只算全账本合计，新增 `buyOutflowByAsset`，口径与既有一致（含手续费的买入现金流出），保留既有的不可计算原因收集。

**总花费与剩余持仓成本是两个口径，不得互相替代。**

## 3.3 界面修整

| 编号 | 修法 |
| --- | --- |
| U-01 | 在 `buildAllocationChartOption` 的 `tooltip` 上启用挂载到 `body`，脱离容器裁剪。**不得使用 `confine`**。趋势图与热力图提示框一并检查并修复同类问题 |
| U-02 | 在 `chartDataService.ts` 的 `buildHoldingAllocation` 中，把占比低于 `2%` 的扇区合并为“其他”，最多显示 8 个扇区（含“其他”）；“其他”提示框列出被合并币种与各自金额；调色板扩至至少 10 个可区分颜色，“其他”用中性灰 |
| U-03 | `TradeHeatmapChart.tsx` 的 `variant="home"` 手写网格移除 `max-w-[636px]` 限制，配合 3.1 的整行布局填满卡片 |

U-02 的合并只影响图表绘制，`allocation.totalMarketValue` 与持仓明细不得改变。

## 3.4 阶段三测试合同

| 编号 | 断言 |
| --- | --- |
| T3-01 | 固定样例账本下，八列数值全部正确 |
| T3-02 | 涨跌幅公式正确；`averageCost` 为零时不抛错且显示为不可计算 |
| T3-03 | 总花费与剩余持仓成本在有卖出的样例中数值不同 |
| T3-04 | 前五按市值降序；缺价资产不参与排名 |
| T3-05 | 占比低于 2% 的资产被合并进“其他”，合并后总市值与合并前逐字符一致 |
| T3-06 | 扇区总数不超过 8 |

---

# 质量门（三阶段完成后统一执行）

- 全量自动测试通过，测试文件数与用例数需在 `01C` 中报告
- `typecheck` 通过
- `lint` 通过
- production build 通过
- 真实 Chrome 手工确认四项：
  1. 饼图提示框可完整显示在卡片之外
  2. 小额币已合并进“其他”且悬停可展开
  3. 首页热力图填满整行无大片留白
  4. 打开一个 V3 `.lftl` 时给出明确中文拒绝提示，不崩溃，随后仍可新建账本

任一质量门未通过即为失败，不得以“大部分通过”结案。

---

# `01C` 交付要求

执行报告 `01C_W15-main-账本V4数据校正与首页改造执行报告.md` 写入 `01一些进度/日志/week15_260826/`，中文，提交到根文档仓库 `main`。必须包含：

1. 分支名与每个阶段的实际改动文件清单、提交哈希
2. 三个阶段测试合同逐条的通过或失败结果；失败项写明原因，不得省略，不得用“大部分通过”结案
3. 全量测试、typecheck、lint、build 的实际数字与结论
4. 真实 Chrome 四项手工确认的结果
5. 与 `01A` 产品决定不一致之处（若有），以及当时如何处理
6. 明确声明：是否读取过 `~/Downloads/history_OKX/`（应为否）；是否有真实账户数字进入源码或测试夹具（应为否）；是否执行过 merge 或 push（应为否）

开发侧测试全绿只代表开发执行候选通过，不等于独立验收通过。
