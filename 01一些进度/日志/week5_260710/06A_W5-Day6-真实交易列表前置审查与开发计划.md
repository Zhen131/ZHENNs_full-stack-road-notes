# Week 5 Day 6：真实交易列表安全开发与严格验收计划

日期：2026-07-15

文档状态：已完成软件工程、架构安全、维护性与 AI 执行效能终审，待正式执行

执行授权：本文件本身不构成任何修改授权；授权按第 0.2 节逐级解释，低等级授权不得自动包含提交、文档同步、合并、推送或删分支

唯一目标：关闭 Gate 3，让 Dashboard 交易列表只读取当前 `LedgerData.trades`，删除写死交易数据并提供可靠空状态

---

## 0. GPT-5.6 执行卡（最高优先级）

本节是交给执行 AI 的最小入口。正文是审计依据和遇到对应阶段时才展开读取的操作手册；如果正文存在可被扩大解释的地方，以本节更严格的授权和停止边界为准。

### 0.1 默认第一阶段

用户只说“执行 Day 6”或同义表达时，默认只授权：

1. 在独立源码仓库核对基线并创建 `zhennn/week5-day6-real-trade-list` 分支。
2. 只修改 `DashboardShell.tsx` 与 `DashboardShell.test.ts`。
3. 完成 `TradeTable`、`ledgerData.trades` 显式接线、空状态和本计划规定的全部验证。
4. 展示完整 diff，逐段解释代码，区分自动化证据与人工审查证据。
5. 停止并等待用户复核。

默认第一阶段**不授权**暂存、提交、修改 README、修改根文档仓库、合并、推送、删除分支或进入 Gate 4。需要越出两个允许文件时必须先停止，不得用“完成 Day 6”推导额外权限。

### 0.2 授权等级

| 用户明确指令 | 允许动作 | 不自动包含 |
| --- | --- | --- |
| “审查计划” | 只读审查与报告 | 任何文件或 Git 修改 |
| “执行 Day 6” | 第 0.1 节第一阶段 | 暂存、提交、文档、合并、推送、删分支 |
| “提交 Day 6 源码” | 精确暂存并提交两个已验证源码文件 | README、根文档、合并、推送、删分支 |
| “同步 Day 6 文档” | 按第 6.2、6.3 节更新并分别提交文档 | 合并、推送、删分支 |
| “合并 / 推送 / 删除分支” | 只执行用户逐项明确点名的 Git 动作 | 未点名的其他 Git 动作 |

一句指令同时包含多个明确动作时可以组合执行；没有出现的动作一律不靠猜测补全。若用户要求先看 diff 或先解释，必须在任何提交前停止。

### 0.3 证据边界

- 自动化测试证明 `TradeTable` 的空状态、六列字段映射、类型映射、输入顺序、不可变性，以及 Reducer 输出能够交给纯视图渲染。
- Dashboard 初始静态渲染测试只证明初始空状态和页面稳定性。
- `<TradeTable trades={ledgerData.trades} />` 这一行的真实接线，由 TypeScript、精确 diff、静态边界扫描和逐行代码审查共同证明；当前 Gate 3 不伪造非空 Dashboard 交互测试。
- 因此 Gate 3 采用“自动化测试 + 显式接线审查”的组合证据，不得宣称自动化测试单独证明了非空 Dashboard 接线或真实 dispatch。
- Gate 4 接入真实表单 dispatch 后，再建立用户操作触发列表与持仓共同更新的交互回归测试。

---

## 1. 结论与执行条件

Day 6 没有已知 P0 代码阻塞，现有架构能够支持“交易列表从真实内存账本读取”这一单一目标。当前已有：

- `DashboardShell` 中唯一一份由 `useReducer` 管理的 `LedgerData`。
- `ledgerReducer` 的 `trade/add` 与 `trade/delete` 能力。
- 完整 `Trade` 类型。
- 已验证的 `tradeService` 与 `tradeValidator`。
- Node 环境下的 `renderToStaticMarkup` 测试入口。
- 8 个测试文件、85 项测试、lint 与生产 build 的最近成功基线。

但“代码改动很小”不等于“验证可以简化”。本日只有在以下条件全部满足时才允许勾选 Gate 3：

1. 交易表格明确接收并渲染 `ledgerData.trades`，且按第 0.3 节记录组合证据。
2. 交易表格测试与整页其他占位文字完全隔离，不存在字符串误命中。
3. 不把 reducer 与纯视图的组合测试误写成真实 UI dispatch 测试。
4. 不修改输入数组，不在展示层排序、校验或重新计算交易数据。
5. 不新增持久化、网络、依赖、测试专用生产入口或第二份交易 state。
6. 定向测试、全量测试、lint、生产 build、diff-check、边界扫描和浏览器空状态冒烟全部通过。
7. 源码仓库与文档仓库分别核对、分别暂存、分别提交，不得混用 Git 状态。
8. 所有文档只记录已经验证的事实，不把 Gate 4 或 Gate 5 写成已完成。

任一条件不满足，结论只能是“Day 6 未完成”或“部分完成”，不得通过修改措辞、删除断言、跳过验证或扩大实现范围制造绿灯。

---

## 2. Day 6 的精确定义

### 2.1 今天关闭的 Gate

Gate 3 的精确定义是：

```text
DashboardShell 中的同一份 ledgerData
→ ledgerData.trades
→ 纯 TradeTable 视图
→ 交易行或六列空状态
```

“真实交易列表”在本文中只表示：

- 数据源已经从文件级写死数组切换到当前 `LedgerData.trades`。
- 列表展示的是正式 `Trade` 字段，而不是专门为 UI 编造的另一种交易对象。
- 交易列表与资产汇总共享 Dashboard 中同一份 `ledgerData`。

### 2.2 今天不能宣称完成的能力

以下能力不属于 Gate 3，今天不得宣称已经实现或验证：

- 用户通过表单提交 `TradeDraft`。
- `createValidatedTrade(...) -> dispatch` 的真实页面交互。
- dispatch 后列表和持仓在浏览器中同时重新渲染。
- 交易删除、价格保存或价格 action。
- 交易按发生时间排序、筛选、分页、虚拟列表。
- 日期、时间、金额或币种格式化策略。
- IndexedDB、localStorage、hydrate、导入导出或加密。
- 大数据量交易列表的性能通过线。

真正的交互闭环仍属于后续 Gate 4：

```text
表单输入
→ TradeDraft
→ createValidatedTrade(...)
→ validateTradeDraft(...)
→ Trade
→ dispatch({ type: "trade/add" })
→ ledgerReducer
→ 列表与持仓重新渲染
```

---

## 3. 当前事实基线

### 3.1 编写本计划时的源码事实

- 源码仓库：`01一些进度/产出/LocalFirstTradingLedger/`。
- 当前源码基线提交：`7ed6ca5`。
- `DashboardShell.tsx` 已使用 `useReducer(ledgerReducer, initialLedgerData)`。
- 资产汇总已经通过 `getPositionsFromLedger(ledgerData)` 派生。
- Dashboard 仍存在文件级写死 `const trades`，并使用拼接字符串作为旧行 key。
- 新增交易表单和价格表单仍是无接线外壳。
- `DashboardShell.test.ts` 当前在整个 Dashboard 静态 HTML 上使用 `toContain(...)`。
- 页面其他区域已经出现 `买入 / 卖出`、`BTC`、示例日期、数量、价格和金额，因此整页字符串断言不能证明交易表格正确。
- 当前测试环境没有 jsdom 或浏览器交互测试依赖。

### 3.2 Git 事实必须在执行时重新确认

本节只是 2026-07-15 的快照，执行 AI 不得把它当成永久事实。开始修改前必须重新运行 Git 检查。

| 仓库 | 路径 | 编写时事实 | Day 6 允许的操作 |
| --- | --- | --- | --- |
| 文档与计划仓库 | 工作区根目录 | `main` 曾存在用户的 `.obsidian/graph.json` 修改；本计划最初未跟踪 | 仅在代码通过后更新指定日志；必须保留用户改动 |
| 独立源码仓库 | `01一些进度/产出/LocalFirstTradingLedger/` | `main` 与 `origin/main` 同指向 `7ed6ca5`，工作树干净 | 在独立功能分支修改允许清单内文件 |

禁止使用根仓库的 Git 状态证明源码仓库干净，也禁止使用源码仓库的提交证明日志已经同步。

---

## 4. 风险等级与停止规则

### 4.1 P0：发现后立即停止

出现以下任一情况，禁止继续写代码：

- 源码仓库目标文件已经有用户未提交改动。
- 源码 `main` 与 `origin/main` 出现未解释的 ahead/behind。
- 修改前定向测试或全量测试失败。
- 完成 Gate 3 必须修改模型、Reducer、Service、Validator 或 Calculator。
- 完成测试必须新增依赖、jsdom、临时按钮、测试路由或测试专用生产参数。
- 发现必须先解决 hydrate、导入、持久化或 schema 问题才能安全展示。
- 需要使用破坏性 Git 命令才能继续。

处理方式：

1. 停止修改。
2. 保留现状，不 reset、不 checkout 用户文件。
3. 报告具体文件、命令证据、风险和建议。
4. 等待用户决定是否扩展范围。

### 4.2 P1：不得用降级验收绕过

- 交易测试可能被整页已有字符串误命中。
- 测试只验证空状态或文案，没有验证正式字段映射。
- reducer 组合测试被错误描述为真实 dispatch 测试。
- 交易表格与资产汇总读取了不同状态来源。
- 源码和文档变更被混在同一个仓库结论或宽泛暂存命令中。

这些问题必须按本文方案修复，不能通过删除测试、改名 Gate 或降低完成标准绕过。

### 4.3 P2：今天记录边界，不扩大范围解决

- 回填交易的发生时间可能早于已有交易，但 reducer 会把新增交易追加到数组尾部。
- `occurredAt` 可能是日期，也可能是日期时间；今天原样显示。
- 当前列表会一次渲染全部交易，超大数组可能造成浏览器可用性问题。
- TypeScript 的 `DecimalString`、日期和币种本质仍是字符串，未来导入数据必须运行时校验。

这些是已知架构债务，不阻塞 Gate 3，但必须在收口文档中明确保留，不得暗示已经解决。

---

## 5. 强制架构边界

### 5.1 单一事实源

- Dashboard 只能保留一份 `ledgerData`。
- 资产汇总继续读取同一份 `ledgerData`。
- 交易列表只能接收 `ledgerData.trades`。
- 禁止新增 `displayTrades`、`tradeRows` 或其他长期保存的重复 state。
- 允许的临时变量只能是纯展示映射，不能成为新的事实源。
- `Position[]` 继续只派生、不保存。

### 5.2 强制抽取纯交易表格边界

为消除整页测试误判，今天必须在 `DashboardShell.tsx` 内抽取并导出一个纯交易表格组件，建议签名：

```ts
export function TradeTable({
  trades,
}: Readonly<{
  trades: readonly Trade[];
}>) {
  // 只负责展示
}
```

强制要求：

- 组件不使用 hook。
- 组件不创建 state。
- 组件不接收 dispatch。
- 组件不调用 Service、Validator、Calculator 或 Reducer。
- 组件不排序、不筛选、不修改 `trades`。
- 组件不接受 `TradeDraft` 或 `unknown`。
- 组件不接受专门为测试增加的开关。
- 组件默认保留在 `DashboardShell.tsx`，不得为了这一天建立新的组件目录或抽象层。
- Dashboard 必须以显式数据流调用：`<TradeTable trades={ledgerData.trades} />`。

如果无法在这些边界内实现，必须停止并说明原因，不能自行扩大架构。

### 5.3 展示字段契约

六列映射固定为：

| 表格列 | 正式 Trade 字段 | 规则 |
| --- | --- | --- |
| 日期 | `trade.occurredAt` | 原样展示，不格式化 |
| 类型 | `trade.type` | `buy -> 买入`，`sell -> 卖出` |
| 资产 | `trade.assetSymbol` | 原样展示 |
| 数量 | `trade.quantity` | 原样展示，不转 Number |
| 均价 | `trade.price` | 原样展示，不转 Number |
| 总金额 | `trade.totalValue` 与 `trade.currency` | 仅展示拼接，不计算 |

禁止：

- 使用 `Number`、`parseFloat` 或 JavaScript 浮点重新处理金额。
- 根据 `quantity * price` 重算 `totalValue`。
- 在表格内修正或重新验证 Trade。
- 展示测试 fixture 专用字段。
- 把 `fee`、`note` 或其他列偷偷加入本日范围。

### 5.4 不可变性与顺序

- 使用 `trade.id` 作为 React 行 key。
- 直接按传入数组顺序 `map`。
- 禁止调用原地 `sort`、`reverse`、`splice`。
- 今天的数组顺序定义为“账本当前保存顺序”，不定义为“交易发生时间顺序”。
- 回填旧交易可能显示在列表末尾；这是已知行为，不是今天需要修复的 bug。
- 后续若决定按时间展示，必须先定义同时间交易顺序，并使用复制后的派生数组。

### 5.5 安全信任边界

今天的展示层只消费正式 `Trade`，不承担输入校验。安全规则是：

- 所有单元格必须使用普通 React 文本插值。
- 禁止 `dangerouslySetInnerHTML`、`innerHTML`、`eval`、`new Function`。
- 禁止把 Trade 字段直接转成链接、HTML、CSS 类名或事件处理器。
- 禁止记录完整交易数据到 console、日志、遥测或网络。
- 禁止为了“更安全”在组件里复制 Validator；校验仍属于 Service/Validator 或未来 hydrate/import 边界。
- 未来 hydrate/import 必须先校验完整 `LedgerData`、`schemaVersion` 和 Trade ID 唯一性，成功后才能原子替换 state。
- 未来导入还必须限制异常大数据量或异常长字符串，避免本地资源耗尽；今天只记录，不实现。

### 5.6 明确禁止的架构扩张

- 不接 `createValidatedTrade(...)` 到表单。
- 不获取或使用真实 dispatch。
- 不新增删除按钮或价格 action。
- 不修改 `ledgerReducer`、`tradeService`、`tradeValidator`、`positionService`、Calculator 或模型。
- 不做 IndexedDB、localStorage、hydrate、导入导出、加密、网络请求或图表。
- 不新增 npm 依赖，不运行 `npm install`。
- 不新增环境变量、动态时间、随机 ID 或 API。
- 不做排序、筛选、分页、日期格式化或 UI 美化。
- 不引入 Context、状态库、Repository 或 Adapter。

---

## 6. 允许修改的文件

### 6.1 源码阶段允许清单

在功能验证通过前，只允许修改：

```text
src/components/dashboard/DashboardShell.tsx
src/components/dashboard/DashboardShell.test.ts
```

如果 `git diff --name-only` 出现其他源码文件，必须停止并解释。

### 6.2 Gate 通过后允许同步的源码文档

只有全部验证通过后，才允许修改：

```text
README.md
```

README 必须明确：

- Gate 3 已完成。
- 交易列表已经读取真实 `LedgerData.trades`。
- 表单、tradeService dispatch、删除和价格输入仍未完成。
- Week 6 唯一入口仍是 Gate 4 页面交互闭环。

### 6.3 Gate 通过后允许同步的根仓库文档

根仓库只允许按事实更新：

```text
01一些进度/日志/00-当前开发状态.md
01一些进度/日志/00-W2-W12总路线图与执行说明.md
01一些进度/日志/week5_260710/00-Week5每日执行清单.md
01一些进度/日志/week5_260710/00-Week5-Checklist.md
01一些进度/日志/week5_260710/99_Week5日志_260710.md
```

禁止顺手修改 Obsidian 工作区文件、Canvas、私人网络说明或其他周计划。

---

## 7. 严格测试方案

### 7.1 测试环境决定

今天继续使用现有 Node + `renderToStaticMarkup`。不引入 jsdom、React Testing Library 或浏览器交互依赖。

原因：

- Gate 3 的自动化部分只验证纯展示契约和初始空状态。
- 真实 UI dispatch 属于 Gate 4。
- 为一天的静态视图目标引入新的测试运行时会扩大依赖和维护面。

当前测试环境不能在不增加生产注入口或 mock React hook 的前提下，让 `DashboardShell` 以非空内部 reducer state 静态渲染。因此测试不承担它无法证明的事情：非空 Dashboard 接线必须按第 0.3 节由显式代码和审查证据补足。

### 7.2 防误判强制规则

禁止用以下方式证明交易字段已经进入表格：

```ts
expect(fullDashboardHtml).toContain("BTC");
expect(fullDashboardHtml).toContain("买入");
expect(fullDashboardHtml).toContain("2026-04-02");
expect(fullDashboardHtml).toContain("colSpan=\"6\"");
```

这些字符串已经可能出现在导航、表单占位或持仓空状态中，不能定位交易表格。

正确方式：

1. 单独渲染 `TradeTable`，不渲染整个 Dashboard。
2. 使用当前页面其他区域绝不会出现的唯一哨兵值。
3. 同时验证空状态出现和消失。
4. 同时验证 `buy`、`sell` 两种中文映射。
5. 同时验证传入顺序保持不变。
6. 使用冻结输入或等价方式证明渲染没有修改数组。

测试数据应满足 `Trade` 完整字段契约，但展示断言使用独特值，例如独特日期时间、资产代码、数量、价格、总额和币种。不得复用页面已有的 BTC、ETH、ADA 和旧写死交易数值。

### 7.3 必须覆盖的测试

#### 测试 A：交易表格空状态

- 单独渲染 `TradeTable`，传入空数组。
- 断言出现“暂无交易。添加交易后，这里会自动显示。”
- 断言交易表格空状态的 `colSpan` 为 6。
- 因为只渲染交易表格，此处不存在持仓表格误命中。

#### 测试 B：正式 Trade 六列字段映射

- 构造完整且具有唯一哨兵值的 buy Trade。
- 单独渲染 `TradeTable`。
- 逐项验证发生时间、买入中文、资产、数量、价格、总额、币种。
- 验证空状态消失。

#### 测试 C：sell 映射与数组顺序

- 再构造一笔具有不同唯一哨兵值的 sell Trade。
- 按明确顺序传入两笔交易。
- 断言“卖出”映射正确。
- 断言第一笔哨兵在 HTML 中的位置早于第二笔。
- 输入数组和 Trade 对象应被冻结，任何原地排序或修改都应让测试失败。

#### 测试 D：Reducer 与视图契约

- 通过既有 `ledgerReducer` 执行一次 `trade/add`。
- 将返回的 `nextLedger.trades` 交给 `TradeTable`。
- 验证新增 Trade 能被纯视图渲染。

此测试只能命名为“Reducer 与交易视图契约”或同义名称。禁止命名为“dispatch 后页面更新”“Dashboard 交互测试”或“端到端测试”。

#### 测试 E：Dashboard 初始接线

- 保留 Dashboard 静态渲染测试。
- 验证初始账本显示交易区专属空状态。
- 验证 `getPositionsFromLedger` 仍接收同一份初始 `LedgerData`。
- 不通过 mock React hook、测试专用 initialData prop 或隐藏按钮注入交易。
- 明确记录：本测试不证明非空交易经过 Dashboard 真实 dispatch 后重新渲染，也不能单独防止调用方把 `ledgerData.trades` 错接成其他空数组。

### 7.4 不允许的测试捷径

- 不得只写 snapshot。
- 不得只断言“交易列表”标题。
- 不得只断言 `ledgerData.trades` 字样存在于源码。
- 不得通过注释掉表单占位文字让测试变绿。
- 不得在生产组件增加 `testMode`、`initialTrades`、隐藏按钮或测试路由。
- 不得 mock `useReducer`。
- 不得重复测试 Validator、Calculator 或 Service 内部逻辑。
- 不得使用 `as unknown as` 绕过不完整 Trade。
- 不得删除或弱化已有持仓测试。
- 不得把“静态扫描看见显式接线”写成“自动化测试已经覆盖非空 Dashboard 接线”。

---

## 8. 执行顺序

### 阶段 0：确认授权和仓库

执行 AI 必须先按第 0.2 节识别用户授予的等级。本计划被读取、审查或提交，不等于允许修改源码；用户只说“执行 Day 6”时必须按第 0.1 节在展示 diff 后停止。

收到执行授权后：

1. 明确目标源码仓库是 `01一些进度/产出/LocalFirstTradingLedger/`。
2. 单独查看源码仓库分支、status、最近提交和跟踪差异。
3. 单独查看根文档仓库 status，记录并保护已有用户改动。
4. 不读取外部 Frappe 项目、NLP 模块或私人网络说明。

### 阶段 1：建立源码可回滚起点

只有源码仓库满足以下条件才继续：

- 位于 `main`。
- 工作树干净。
- 本地 `main` 与 `origin/main` 跟踪差异为 `0/0`。
- HEAD 与执行时确认的最新基线一致。
- 如果需要证明远端当前状态，必须先在用户授权下刷新远端引用；未刷新时只能表述为“与本地 tracking ref 一致”，不得声称已实时核对远端。

随后：

1. 创建 `zhennn/week5-day6-real-trade-list` 功能分支。
2. 运行 Dashboard 定向测试。
3. 运行完整测试，确认执行时基线仍全部通过。
4. 任何基线失败都先停止，不能把旧失败混入 Day 6。

### 阶段 2：先建立不会误判的测试

1. 在 `DashboardShell.tsx` 内抽取并导出纯 `TradeTable`。
2. 在 `DashboardShell.test.ts` 中先建立测试 A-E。
3. 在 Dashboard 接线前先运行隔离测试；不强制为了形式制造红灯，但必须确认删除任一字段映射、类型映射或空状态都会导致对应隔离测试失败。
4. 不为制造红灯而破坏现有代码。
5. 在实现前检查测试名称，确保没有把契约测试描述成真实 dispatch。

### 阶段 3：接通真实交易列表

只做以下修改：

1. 删除文件级写死 `const trades`。
2. Dashboard 调用 `<TradeTable trades={ledgerData.trades} />`。
3. 空数组时在六列表格 `tbody` 内显示专属空状态。
4. 正式 Trade 按第 5.3 节映射。
5. 行 key 使用 `trade.id`。
6. 将“未来才是真实来源”的旧文案改为不夸大的当前来源描述。

实现完成后立刻检查：

- 没有第二份交易 state。
- 没有排序或数组修改。
- 没有业务计算。
- 没有新增依赖。
- 没有测试专用生产入口。

### 阶段 4：自动化回归

按顺序运行：

```text
Dashboard 定向测试
全部 Vitest 测试
lint
生产 build
git diff --check
```

参考命令：

```bash
npm test -- src/components/dashboard/DashboardShell.test.ts
npm test -- --run
npm run lint
npm run build
git diff --check
```

不得因某一项耗时或已有其他绿灯而跳过后续项目。

### 阶段 5：静态边界扫描

必须检查并记录结果：

```text
Dashboard 不存在文件级写死 const trades
Dashboard 不存在旧的三笔 BTC / ETH / ADA 占位交易
Dashboard 明确将 ledgerData.trades 传给 TradeTable
交易行 key 明确使用 trade.id
TradeTable 不调用 hook / Service / Reducer / Validator / Calculator
生产代码不导入 src/test/fixtures.ts
没有 dangerouslySetInnerHTML / innerHTML / eval / new Function
没有 localStorage / IndexedDB / fetch / axios / 新依赖
package.json 与 package-lock.json 没有变化
源码阶段 diff 只包含 DashboardShell.tsx 与 DashboardShell.test.ts
```

扫描只是测试和代码审查的补充，不能替代测试；但对 `<TradeTable trades={ledgerData.trades} />` 这一行而言，它与精确 diff、TypeScript 和逐行审查共同构成正式验收证据，不能被省略。

### 阶段 6：浏览器空状态冒烟

启动本地页面后检查：

- 页面能够正常加载。
- 交易列表区域不再显示旧的三笔占位交易。
- 交易列表区域显示专属空状态。
- 六列表格结构和横向滚动没有明显破坏。
- 资产汇总仍正常显示自己的空状态。
- 浏览器控制台没有 hydration、React key 或运行时错误。

限制：

- 今天没有真实表单 dispatch，因此浏览器冒烟只验证初始空状态和页面稳定性。
- 禁止为了看到非空交易而加入临时按钮、测试数据、查询参数或生产注入入口。
- 非空交易字段由隔离的 `TradeTable` 测试负责。

### 阶段 7：源码变更复审

提交前逐行审查 diff：

- 每一行都能直接对应 Gate 3。
- 没有顺手重构导航、表单、样式或持仓表格。
- 没有删改已有业务边界。
- 隔离测试能在字段映射、类型映射、空状态、顺序或不可变性被破坏时失败。
- Dashboard 的 `ledgerData.trades` 显式接线已经通过精确 diff 和静态扫描核对；不得声称现有自动化能在这一行被替换成其他空数组时必然失败。
- 测试描述没有夸大为真实交互。
- 已知排序、日期格式化和大数组风险仍明确延期。

若复审发现需要扩大范围，停止并报告用户。

---

## 9. Git 管理与双仓库收口

### 9.1 总原则

- 根目录是文档仓库。
- `LocalFirstTradingLedger/` 是独立源码仓库。
- 两个仓库分别查看 status、diff、branch、log、ahead/behind。
- 禁止使用 `git add .`、`git add -A` 或 `git commit -a`。
- 只能使用精确路径暂存本任务文件。
- 禁止把 `.obsidian/graph.json` 或其他用户已有改动带入 Day 6 提交。
- 禁止 reset、checkout、restore、stash 用户改动来制造“干净”状态。

### 9.2 源码仓库提交

只有用户明确授权“提交 Day 6 源码”后，并且全部代码验证通过，才允许：

1. 同时用 `git status --short` 和 `git diff --name-only` 确认已跟踪及未跟踪变更都只涉及允许文件。
2. 用精确路径暂存 `DashboardShell.tsx` 与 `DashboardShell.test.ts`。
3. 检查 staged diff。
4. 运行 `git diff --cached --check`，确认暂存内容没有空白错误。
5. 使用中文提交备注，例如：

```text
功能：接入第五周第六天真实交易列表
```

6. 提交后重新运行 status 和最近提交检查。

如果用户只授权“实现并提交”，到此停止。没有明确授权时不得自动：

- 合并进源码 `main`。
- 推送到远端。
- 删除功能分支。
- 修改远端分支。

### 9.3 源码 README 提交

只有用户明确授权“同步 Day 6 文档”，并且代码提交和全部验证都成立，才允许更新 README。建议使用独立中文提交：

```text
文档：同步第五周第六天交易列表状态
```

README 提交仍属于源码仓库，不得混入根仓库日志。

### 9.4 根文档仓库提交

只有用户明确授权“同步 Day 6 文档”，并且源码结果已经被验证，才允许更新根仓库状态与 Week 5 文档。

执行要求：

1. 重新查看根仓库 status。
2. 记录所有修改来源。
3. 只更新第 6.3 节允许的文件。
4. 用精确路径逐个暂存。
5. 检查 staged diff 不包含 `.obsidian/graph.json` 或其他用户文件。
6. 运行 `git diff --cached --check`。
7. 使用独立中文提交，例如：

```text
日志：记录第五周第六天真实交易列表结果
```

文档提交不得声称源码已推送、合并或清理分支，除非对应 Git 证据真实存在。

---

## 10. 完成标准

以下项目必须全部满足才能勾选 Gate 3：

### 10.1 数据与架构

- [ ] Dashboard 中不存在写死交易数组。
- [ ] `TradeTable` 接收 `readonly Trade[]`。
- [ ] Dashboard 明确传入 `ledgerData.trades`。
- [ ] 交易列表和资产汇总读取同一份 `ledgerData`。
- [ ] 没有第二份交易 state。
- [ ] 没有修改 Reducer、模型、Service、Validator 或 Calculator。
- [ ] 没有排序、修改输入数组或重新计算金额。

### 10.2 展示与安全

- [ ] 初始空账本显示六列交易空状态。
- [ ] 正式 Trade 六列字段映射正确。
- [ ] `buy / sell` 中文映射均有隔离测试。
- [ ] 行 key 使用 `trade.id`。
- [ ] 所有 Trade 字段通过普通 React 文本展示。
- [ ] 没有危险 HTML、动态代码执行、日志泄漏或网络发送。

### 10.3 测试可信度

- [ ] TradeTable 测试与整页占位字符串隔离。
- [ ] 测试使用唯一哨兵值，不复用旧 BTC / ETH / ADA 数据。
- [ ] 空状态不会与持仓表格 `colSpan=6` 误命中。
- [ ] 输入顺序与不可变性得到验证。
- [ ] reducer 组合测试没有被描述成真实 UI dispatch。
- [ ] 自动化测试、初始静态渲染、显式接线审查三类证据已经分开记录。
- [ ] `ledgerData.trades` 调用行已经过 TypeScript、精确 diff、静态扫描和逐行审查；没有把它夸大成非空交互测试。
- [ ] 没有测试专用生产入口、React hook mock 或新测试依赖。

### 10.4 工程验证

- [ ] Dashboard 定向测试通过。
- [ ] 全量 Vitest 通过。
- [ ] lint 通过。
- [ ] 生产 build 通过。
- [ ] `git diff --check` 通过。
- [ ] 静态边界扫描通过。
- [ ] 浏览器初始空状态冒烟通过。

### 10.5 Git 与文档

- [ ] 两个仓库分别核对。
- [ ] 源码提交只包含允许文件。
- [ ] 用户已有改动未被暂存、修改或提交。
- [ ] Gate 通过后才同步 README 和根仓库日志。
- [ ] 文档明确 Gate 4、Gate 5 仍未完成。
- [ ] 未经用户授权没有合并、推送或删除分支。

---

## 11. 失败与回退策略

### 11.1 验证失败

- 定向测试失败：先判断是实现错误还是测试误判，不得删除关键断言。
- 全量测试失败：确认是否由 Day 6 diff 引入；不能以“定向测试已过”为理由继续。
- lint 或 build 失败：Gate 3 不通过。
- 浏览器 hydration 或 key 错误：Gate 3 不通过。
- 边界扫描发现越界：撤回越界改动或停止请求用户决定。

### 11.2 Git 失败

- 创建分支、暂存或提交失败时，保留现状并报告。
- 不使用破坏性命令修复。
- 网络推送失败不等于本地提交失败，必须分别报告。
- 文档仓库脏不等于源码仓库脏，反之亦然。

### 11.3 时间不足

- 不缩短测试。
- 不跳过浏览器冒烟。
- 不提前勾选 Gate。
- 未完成项顺延 Week 6。
- 不挪用 7 月 16 日休息日。

---

## 12. Gate 结论判定

| 结果 | 条件 | 允许表述 |
| --- | --- | --- |
| 通过 | 所有完成标准和 Git 边界满足 | “Gate 3 已完成；交易列表读取真实 LedgerData.trades；Gate 4 未完成” |
| 部分完成 | 代码已接线，但任一测试、build、扫描、浏览器或 Git 范围未通过 | “Day 6 部分完成，Gate 3 未通过” |
| 阻塞 | 基线失败、用户改动冲突或需要扩大架构 | “Day 6 未开始或已停止，等待用户决定” |

禁止使用以下表述：

- “页面交易闭环已完成。”
- “dispatch 已经验证。”
- “交易输入已经安全接入。”
- “真实交易按时间正确排序。”
- “大数据量列表性能已通过。”
- “内存态 Gate 2-5 已全部完成。”

---

## 13. Day 6 通过后的文档事实

只有 Gate 3 真正通过后，文档可以写：

- Dashboard 不再包含写死交易数组。
- 交易列表读取当前 `ledgerData.trades`。
- 正式 Trade 的六列展示契约与空状态已经通过隔离测试。
- 交易列表与资产汇总共享同一份 `ledgerData`。
- Gate 2 与 Gate 3 已完成。
- 生产资产来源和 `tradeService` 地基已完成。
- Gate 4 的表单、Service、dispatch 和真实浏览器更新仍未完成。
- 交易排序、日期格式化和大数据量性能仍是延后事项。
- IndexedDB 仍被 Gate 4-5 阻挡。

不得从“交易表格能渲染 reducer 产出的数组”推导出“用户已经可以录入交易”。

---

## 14. 执行 AI 的最终汇报模板

执行结束后必须按以下顺序汇报：

1. **结果**：Gate 3 通过、部分完成或阻塞。
2. **源码变更**：列出实际修改文件和每个文件的职责。
3. **架构边界**：确认单一 `ledgerData`、纯 TradeTable、无排序、无第二 state。
4. **安全边界**：确认普通文本渲染、无危险 HTML、无网络、无持久化、无数据日志。
5. **证据分层**：分别报告隔离测试、Dashboard 初始静态渲染、显式接线审查，不把三者混写。
6. **工程验证**：定向测试、全量测试、lint、build、diff-check 的实际结果和数量。
7. **浏览器证据**：空状态、旧占位数据消失、控制台与 hydration 状态。
8. **Git 证据**：分别报告源码仓库和文档仓库的分支、提交、工作树、ahead/behind。
9. **未完成能力**：明确 Gate 4-5、排序、格式化、分页和持久化仍未完成。
10. **下一步**：只报告当前授权允许的下一步；没有新授权时停止，不擅自提交、合并或推送。

汇报必须以实际命令、文件和验证结果为依据，不得用计划目标代替完成事实。

---

## 15. 本日 AI 行为红线

执行本计划的 AI 必须遵守：

- 不因任务简单而跳过基线和完成验证。
- 不读取整个工作区来“熟悉项目”。
- 不读取 `00frappe-books-typescript/`、`02_NLP/` 或私人网络说明。
- 不触碰用户已有 `.obsidian` 改动。
- 不使用宽泛 Git 暂存。
- 不为测试向生产组件加入隐藏入口。
- 不伪造浏览器 dispatch 结果。
- 不把静态契约测试写成端到端测试。
- 不把静态接线扫描写成自动化非空交互测试。
- 不为美观、抽象或未来需求扩大 Day 6。
- 不降低完成标准来赶进度。
- 不未经用户授权合并、推送或删除分支。

本计划的核心不是“尽可能多做”，而是在最小改动范围内，得到一个证据可信、架构边界清楚、可安全进入 Week 6 的 Gate 3 结果。
