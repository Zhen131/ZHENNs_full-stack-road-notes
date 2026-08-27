# 01B_W15-main｜账本 V4 数据校正与首页改造执行文档

- 日期：2026-08-27
- 轨道：长期账本产品 `main`
- 工作目录：`01一些进度/产出/LocalFirstTradingLedger/`
- 依据：`01A_W15-main-账本V4数据校正与首页改造产品定义.md`
- 执行者：外部 AI（Codex）；产出 `01C` 执行报告，最终验收另行进行

## 结论

本文件是执行合同。三个阶段按顺序完成：V4 数据模型 → 显示格式化 → 首页改造与界面修整。任何与 `01A` 产品决定冲突之处，必须停止并退回产品层确认，不得自行取舍。

---

# 零、执行边界与禁止事项

| 编号 | 约束 |
| --- | --- |
| B-01 | 只在源码仓库 `main` worktree 工作。不得进入 `CS2026`，不得创建两分支之间的合并 |
| B-02 | 源码仓库的提交信息、模块说明与代码注释使用英文；本执行文档与 `01C` 使用中文 |
| B-03 | 不得读取、引用、复制 `Downloads/history_OKX/` 下的任何内容；不得将任何真实账户数字写入源码、测试夹具、注释或提交信息 |
| B-04 | 不得通过伪造买入或卖出交易来凑数量。数量差异只能通过本批新增的转入转出事实表达 |
| B-05 | 不得降低底层算术精度。`decimal.js` 保持 40 位，持久化数值不得因显示格式化而改变 |
| B-06 | 不得改动加密、双代保存、文件锁、会话协调与导入准入的既有安全约束 |
| B-07 | 未获明确授权不得 `push`、不得 `merge`、不得使用破坏性 Git 命令 |
| B-08 | 不新增联网行为。行情仍只在用户显式点击时请求 |

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
  fromLocation?: CustodyLocation;   // internal 与 external-out 必填
  toLocation?: CustodyLocation;     // internal 与 external-in 与 gain 必填
  note?: string;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
};
```

`LedgerData` 新增集合 `assetTransfers: AssetTransfer[]`。

`Position` 新增两个字段：

```ts
locationQuantities: Readonly<Record<CustodyLocation, DecimalString>>;
giftIncome: DecimalString;   // 白拿累计计入的等值 USDT
```

## 1.2 重放算法

`src/core/calculations/positionReplay.ts` 改为同时消费交易与转入转出，按既有 `compareLedgerFactOrder` 统一排序后单次重放。

| 事件 | 总数量 | 剩余成本 | 已实现盈亏 | 白拿收益 | 位置 |
| --- | --- | --- | --- | --- | --- |
| 买入 | 加净买入量 | 加买入现金流出 | 不变 | 不变 | `exchange` 加 |
| 卖出 | 减总消耗量 | 按比例减 | 加净所得减对应成本 | 不变 | `exchange` 减 |
| `internal` | **不变** | 不变 | 不变 | 不变 | `from` 减、`to` 加 |
| `external-in` | 加 | 加 `quantity × unitPrice` | 不变 | 不变 | `to` 加 |
| `external-out` | 减 | 按比例减，**不产生盈亏** | 不变 | 不变 | `from` 减 |
| `gain` | 加 | 加 `quantity × unitPrice` | 不变 | 加 `quantity × unitPrice` | `to` 加 |

按比例减成本沿用既有卖出写法：全量出清时剩余成本归零，部分出清时按 `消耗量 × (剩余成本 ÷ 当前数量)`。

**四类转入转出都不产生任何 USDT 现金变动。** `src/core/calculations/cashReplay.ts` 不消费 `assetTransfers`，只需新增一条测试固定这条边界。

超量拒绝：`internal` 与 `external-out` 的数量大于该币种当前总数量、或大于 `fromLocation` 当前数量时抛错，比照既有卖出超量写法。

## 1.3 校验

`src/core/validation/ledgerDataValidator.ts`：

- `ROOT_KEYS` 增加 `"assetTransfers"`，保持既有精确键集校验
- `schemaVersion` 只接受 `4`，其余一律 `LEDGER_DATA_UNSUPPORTED_SCHEMA_VERSION`
- 新增 `AssetTransfer` 实体校验，键集精确匹配，字段规则见 1.1
- `assetSymbol` 必须在 `assets` 中存在，比照既有引用校验
- 组合规则（缺一即拒）：
  - `internal`：`fromLocation` 与 `toLocation` 都存在且不相等；`unitPrice` 必须缺席
  - `external-in`：`toLocation` 存在；`unitPrice` 存在且为正
  - `external-out`：`fromLocation` 存在；`unitPrice` 必须缺席
  - `gain`：`toLocation` 存在；`unitPrice` 存在且为正
  - `reason` 与 `category` 必须匹配：`deposit`→`external-in`、`withdrawal`→`external-out`、`internal-move`→`internal`、`airdrop`/`interest`/`platform-gift`→`gain`
- `quantity` 与 `unitPrice` 沿用既有规范十进制规则（最多 40 位有效、18 位小数）

`src/core/policies/ledgerImportPolicy.ts` 与 `ledgerFactPolicy.ts`：未来日期的转入转出比照既有未来事实隔离与警告。

## 1.4 文件与备份

- `src/platform/files/ledgerFileContract.ts`：键列表新增 `assetTransfers`
- `src/features/backup/backupEnvelope.ts`：`BACKUP_FORMAT_VERSION` 改为 `4`；`ledgerSchemaVersion` 只接受 `4`；对 `backupFormatVersion === 2` 与 `=== 3` 分别给出明确的中文拒绝信息，说明不提供迁移
- 承载 V3 的 `.lftl` 只识别并明确拒绝，零迁移、零写回、零自动删除
- 导入准入不变：仍只允许写入同一会话中新建且仍为空的 C

## 1.5 录入界面

在记账工作区新增“资产转入转出”表单，与既有交易表单、现金表单并列。表单按 `category` 动态显示必填项，遵守 1.3 的组合规则，保存前走同一套校验与认证保存流程。持仓明细表新增存放位置列。

## 1.6 阶段一测试合同

必须覆盖且全部通过：

| 编号 | 断言 |
| --- | --- |
| T1-01 | `internal` 转移后总数量与平均购价逐字符不变，两个位置数量此消彼长 |
| T1-02 | `external-in` 后总数量增加，剩余成本增加 `quantity × unitPrice`，平均购价按加权结果变化 |
| T1-03 | `external-out` 后总数量减少，剩余成本按比例减少，已实现盈亏保持不变 |
| T1-04 | `gain` 后总数量增加，剩余成本按当日单价增加，`giftIncome` 增加同额 |
| T1-05 | `gain` 若按零成本计入，平均购价会被压低——用固定样例证明当前实现不是零成本 |
| T1-06 | 四类转入转出后，USDT 现金余额逐字符不变 |
| T1-07 | `internal` 与 `external-out` 超量被拒绝 |
| T1-08 | 组合规则六条各有一条拒绝用例 |
| T1-09 | V3 备份与 V3 `.lftl` 被明确拒绝且不写回 |
| T1-10 | 交易与转入转出混合、乱序输入时，重放结果与按时间排序输入一致 |

---

# 阶段二：显示格式化

## 2.1 新建显示层

新建 `src/ui/formatLedgerNumber.ts`。不得使用币种查表，不得使用按币种分支的条件语句。

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
2. 若 d 为零：places = fixedDecimalsWhenAtLeastOne ?? 0，直接输出补零结果，不做去尾零
3. 若 |d| >= 1 且 fixedDecimalsWhenAtLeastOne 不为 null：
       places = fixedDecimalsWhenAtLeastOne
       trim   = false
   否则：
       exponent = d.abs().e          // decimal.js 的十进制指数，等价于 floor(log10)，不要用浮点 log
       places   = significantDigits - 1 - exponent
       places   = min(places, maxDecimals)
       places   = max(places, fixedDecimalsWhenAtLeastOne ?? 0)
       trim     = true
4. s = d.toDecimalPlaces(places, ROUND_HALF_UP).toFixed(places)
5. 若 trim：去掉末尾多余的零，但保留至少 (fixedDecimalsWhenAtLeastOne ?? 0) 位小数；若小数部分被清空则连小数点一起去掉
6. 整数部分插入千分位逗号，负号保留在最前
```

复用既有 `src/core/shared/decimalMath.ts` 的 `toDecimal` 与 `formatDecimal`，不要另起一套算术。

## 2.3 效果通过线

下表每行一条单元测试，全部命中才算过：

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

新增 `<LedgerNumber value kind title? />`，`kind` 取 `money` / `quantity` / `percent`。组件输出格式化文本，并把未经格式化的原始 `DecimalString` 挂到 `title` 属性上供悬停查看，套用既有 `.ledger-numeric` 样式。

## 2.5 接入范围

替换全部只读数字展示，约 113 处，分布在：

`src/app/HomeWorkspace.tsx`、`src/app/DashboardShell.tsx`、`src/app/TransactionsWorkspace.tsx`、`src/features/portfolio/HoldingsOverview.tsx`、`src/features/portfolio/HoldingsDetails.tsx`、`src/features/trades/TradeTable.tsx`、`src/features/trades/TradeForm.tsx`、`src/features/activity/ActivityTable.tsx`、`src/features/cash/CashEventPanel.tsx`、`src/features/market-data/MarketDataControls.tsx`

`src/features/charts/chartOptionBuilders.ts` 的三个提示框同样接入。

**输入框、受控表单值与草稿一律不格式化。** 用户正在编辑的字符串原样保留。

## 2.6 阶段二测试合同

| 编号 | 断言 |
| --- | --- |
| T2-01 | 2.3 表格全部命中 |
| T2-02 | 保存、导出、重新导入后，底层 `DecimalString` 与原值逐字符相同，证明格式化只发生在渲染层 |
| T2-03 | 表单输入框的值不被格式化改写 |
| T2-04 | `LedgerNumber` 的 `title` 属性等于原始值 |

---

# 阶段三：首页持仓成本区与界面修整

## 3.1 持仓成本区

改造 `src/features/portfolio/HoldingsOverview.tsx`，替换首页现有卡片内容。

- 复用既有 `getTopMarketValuePositions(positions, limit)`，`limit` 由 `3` 改为 `5`，不另写排序
- 列：币种、当前价格、平均购价、涨跌幅、盈亏金额、持仓量、总花费、当前市值
- 现金 USDT 单独一行，只显示余额，不参与涨跌计算与着色
- 涨跌幅 = `(latestPrice − averageCost) ÷ averageCost`；`averageCost` 为零时显示为不可计算，不得除零
- 着色：涨为绿、跌为红
- 缺当前价格的币种沿用既有规则：不参与排名，单独提示

新增按资产分组的累计买入花费，加在 `src/features/portfolio/pnlSummaryService.ts`：既有 `buyOutflow` 只算全账本合计，新增 `buyOutflowByAsset`，口径与既有一致（含手续费的买入现金流出），保留既有的不可计算原因收集。

**总花费与剩余持仓成本是两个口径，不得互相替代。**

## 3.2 界面修整

| 编号 | 缺陷 | 修法 |
| --- | --- | --- |
| U-01 | 饼图悬停提示框被 `HoldingAllocationChart.tsx` 外层 `overflow-hidden` 裁切 | 在 `buildAllocationChartOption` 的 `tooltip` 上启用挂载到 `body`。不得使用 `confine`。趋势图与热力图提示框一并检查 |
| U-02 | 饼图扇区过多且配色重复（调色板仅 5 色，资产十余个） | 在 `chartDataService.ts` 的 `buildHoldingAllocation` 中，将占比低于 `2%` 的扇区合并为“其他”，最多显示 8 个扇区（含“其他”）；“其他”提示框列出被合并币种与各自金额；调色板扩至至少 10 个可区分颜色，“其他”用中性灰 |
| U-03 | 首页热力图大片留白 | `TradeHeatmapChart.tsx` 的 `variant="home"` 手写网格被 `max-w-[636px]` 限制宽度，放开该限制让网格填满卡片 |

U-02 的合并只影响图表绘制，`allocation.totalMarketValue` 与持仓明细不得改变。

## 3.3 阶段三测试合同

| 编号 | 断言 |
| --- | --- |
| T3-01 | 固定样例账本下，八列数值全部正确 |
| T3-02 | 涨跌幅公式正确，`averageCost` 为零时不抛错且显示为不可计算 |
| T3-03 | 总花费与剩余持仓成本在有卖出的样例中数值不同 |
| T3-04 | 前五按市值降序，缺价资产不参与排名 |
| T3-05 | 占比低于 2% 的资产被合并进“其他”，且合并后总市值与合并前一致 |
| T3-06 | 扇区总数不超过 8 |

---

# 质量门（三阶段完成后统一执行）

- 全量自动测试通过，测试文件数与用例数需在 `01C` 中报告
- `typecheck` 通过
- `lint` 通过
- production build 通过
- 真实 Chrome 手工确认三项：饼图提示框可完整显示在卡片之外；小额币已合并进“其他”且悬停可展开；首页热力图填满卡片无大片留白

任一质量门未通过即为失败，不得以“大部分通过”结案。

---

# `01C` 交付要求

执行报告 `01C_W15-main-...执行报告.md` 必须包含：

1. 每个阶段的实际改动文件清单与提交哈希
2. 三个阶段测试合同逐条的通过或失败结果，失败项必须写明原因，不得省略
3. 全量测试、typecheck、lint、build 的实际数字与结论
4. 真实 Chrome 三项手工确认的结果
5. 与 `01A` 产品决定不一致之处（若有），以及当时如何处理
6. 明确声明是否读取过 `Downloads/history_OKX/`（应为否），以及是否有真实账户数字进入源码或测试夹具（应为否）

开发侧测试全绿只代表开发执行候选通过，不等于独立验收通过。
