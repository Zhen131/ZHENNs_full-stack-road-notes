# Week 5：前五周开发复盘与 Week 6-7 风险补漏清单

日期：2026-07-16

状态：Week 6-7 开工前风险登记与关闭标准

目标：把前五周复盘发现的 P0、P1 问题固定成可执行、可验证、可关闭的任务，防止风险只停留在聊天或复盘文字里。

---

## 结论

前五周已经建立了可靠的模型、Decimal 计算、交易校验、内存状态、持仓派生、生产资产、交易创建 Service 和真实列表读取能力；当前问题不是“已有代码推倒重来”，而是生产写入链、删除安全和持久化信任边界尚未闭合。

推进规则：

```text
Week 6 关闭页面真实写入和安全修改
-> Gate 2-5 全绿
  -> Week 7 关闭完整账本校验和安全持久化
    -> 才允许 Week 8 导入导出
```

本文件登记：

- 6 项 P0：不关闭就可能造成错误状态、页面崩溃或旧数据被覆盖。
- 3 项 P1：不一定立即破坏数据，但会显著增加 Week 6-7 返工、误判和延期风险。

P2 的交易显示顺序与长列表性能继续由 `06B_W5-Day6-代码风险审查与后续补漏.md` 跟踪，不在本文件重复升级。

---

## 风险等级

| 等级 | 工程定义 | 老板能听懂的解释 | 推进规则 |
| --- | --- | --- | --- |
| P0 | 数据正确性、安全边界或核心 Gate 阻断 | 不解决可能记错账、丢旧账或让页面直接坏掉 | 对应 Gate 未关闭时禁止进入下一阶段 |
| P1 | 重要契约、测试能力、认知或文档治理缺口 | 现在不一定出事故，但越拖越贵，后面容易返工 | 必须安排关闭日期，不允许无限顺延 |

---

## 总览

| 编号 | 等级 | 问题 | 关闭阶段 | 当前状态 |
| --- | --- | --- | --- | --- |
| P0-01 | P0 | 缺少真实表单交互测试能力 | Week 6 Day 1 / Gate 4 | 未关闭 |
| P0-02 | P0 | 表单到 `TradeDraft` 的字段契约未锁定 | Week 6 Day 1 / Gate 4 | 未关闭 |
| P0-03 | P0 | 直接删除交易可能破坏后续持仓时间线 | Week 6 Day 2 / Gate 5 | 未关闭 |
| P0-04 | P0 | hydrate 前缺少完整 `LedgerData` 运行时校验 | Week 7 Day 1-2 | 未关闭 |
| P0-05 | P0 | Repository、Adapter、Encryption 的最终契约存在漂移 | Week 7 Day 1 | 未关闭 |
| P0-06 | P0 | hydration、自动保存、clear/reset 和连续写顺序未形成状态机 | Week 7 Day 1、Day 5-6 | 未关闭 |
| P1-01 | P1 | `PriceSnapshot` 创建 Service 契约不完整 | Week 6 Day 3 | 未关闭 |
| P1-02 | P1 | Week 7 异步持久化认知与测试矩阵不足 | Week 7 Day 1 | 未关闭 |
| P1-03 | P1 | 历史 Checklist、状态和实际 Git 事实存在轻微漂移 | Week 6-7 文档收口 | 未关闭 |

---

# P0 问题

## P0-01：缺少真实表单交互测试能力

### 当前事实

- 当前 `DashboardShell.test.ts` 使用 Node 环境和 `renderToStaticMarkup(...)`。
- 现有测试能证明纯视图映射、空状态和 Reducer 输出契约。
- 当前测试不能真实执行“填写输入框、点击按钮、Service 返回、dispatch、页面重新渲染”。
- 源码当前没有 jsdom、React Testing Library、user-event 或等价浏览器交互测试能力。

### 工程术语

Gate 4 要验证的是 React 状态交互闭环，不是静态渲染结果。缺少 DOM 交互环境时，无法自动化证明：

```text
user input
-> form state
-> createValidatedTrade(...)
-> dispatch({ type: "trade/add" })
-> LedgerData 更新
-> TradeTable 与资产汇总视图同步重渲染
```

如果只继续增加静态字符串断言，可能出现“测试全绿，但保存按钮没有真正工作”的假通过。

### 老板大白话

现在像是检查了汽车的仪表盘、车灯和座椅都装好了，但还没有真的坐进去踩油门。Week 6 不能只看按钮长得像按钮，必须证明用户按下去以后，交易真的进入账本，列表和持仓真的一起变化。

### 解决要求

1. Week 6 Day 1 先选定最小交互测试方案。
2. 测试必须通过真实表单元素输入和提交，不允许隐藏按钮、`testMode`、测试专用路由或 mock `useReducer`。
3. 至少覆盖：
   - 合法买入成功。
   - 合法卖出成功。
   - 非法字段失败。
   - 超卖失败。
   - Service 依赖失败。
4. 成功路径必须同时断言交易列表和持仓汇总变化。
5. 失败路径必须断言交易列表、持仓和 `LedgerData` 均不变化。

### 关闭标准

- 测试名称明确写“页面交互”或“用户提交”，不再用纯组件契约替代。
- 删除 Dashboard 中真实 Service 调用或 dispatch 后，测试必然失败。
- 将列表错误接到 `[]`、引入第二份交易 state 或只更新列表不更新持仓时，测试必然失败。
- 定向交互测试、全量测试、lint、build 全部通过。

---

## P0-02：表单到 `TradeDraft` 的字段契约未锁定

### 当前事实

当前表单只有视觉输入框，尚未明确如何稳定产生完整 `TradeDraft`。页面可见字段与领域类型之间还缺少以下映射规则：

- `timePrecision` 从哪里来。
- `currency` 是用户填写还是从 Asset 派生。
- `feeCurrency` 如何默认。
- 买入 / 卖出怎样映射为 `buy / sell`。
- 日期输入怎样形成 `occurredAt`。
- 空手续费、空备注怎样标准化。
- `totalValue` 是人工填写还是自动计算。

### 工程术语

UI 表单是非可信输入边界。字段标准化规则未锁定时，组件可能自行生成不一致的 `TradeDraft`，或者在 UI 内复制 Validator、Decimal 计算和 Asset 规则，破坏分层。

### 老板大白话

现在前台拿到了一张订单表，但还没有统一规定“买入”在系统里写什么代码、美元从哪里带出来、空手续费算不算零。不同人按自己的理解填，后台就可能收到格式不一样的订单。

### 第一版推荐规则

| 页面字段 | `TradeDraft` 字段 | 第一版规则 |
| --- | --- | --- |
| 类型 | `type` | 使用选择框，明确映射为 `buy / sell` |
| 资产 | `assetSymbol` | 从 `ledgerData.assets` 选择，不使用任意自由文本 |
| 数量 | `quantity` | 原始字符串交给 Validator，不转 JavaScript Number |
| 成交均价 | `price` | 原始字符串交给 Validator |
| 总金额 | `totalValue` | 保留人工输入，由 Validator 做容差校验；UI 不复制 Decimal 公式 |
| 日期 | `occurredAt` | 第一版使用日期输入 |
| 时间精度 | `timePrecision` | 日期输入固定映射为 `"day"` |
| 币种 | `currency` | 从所选 Asset 的 `quoteCurrency` 派生 |
| 手续费 | `fee` | 空值交由 Service / Validator 标准化为 `"0"` |
| 手续费币种 | `feeCurrency` | 默认跟随 `currency` |
| 备注 | `note` | 空字符串标准化为未提供 |

### 解决要求

- 页面只负责收集和最小标准化，不直接调用 `validateTradeDraft(...)`。
- 正式 `Trade` 的 ID、`createdAt`、`updatedAt` 仍只能由 `tradeService` 生成。
- 页面不得通过对象断言或手写默认字段绕过 Service。
- 字段错误和 Service 全局错误分开显示。
- 提交成功后清理表单；失败时保留用户输入，方便修改。

### 关闭标准

- 每个 `TradeDraft` 字段都有唯一、明确的来源。
- 页面没有 Decimal 乘法、持仓计算或正式 Trade 构造。
- 合法输入能进入 Service；非法输入只能得到结构化错误。
- 字段映射测试和真实交互测试通过。

---

## P0-03：直接删除交易可能破坏后续持仓时间线

### 当前事实

当前 `trade/delete` reducer action 会按 ID 直接过滤交易。Reducer 按设计不做业务校验，这个边界本身没有错；风险在于 Week 6 如果 UI 直接 dispatch 删除，就可能留下不再合法的历史交易序列。

Golden ADA 示例：

```text
买入 41.58
买入 126.6825
卖出 82.9381
```

如果删除第二笔买入，账本会变成：

```text
买入 41.58
卖出 82.9381
```

后续卖出超过当时持仓。`positionCalculator` 会抛出超卖错误，Dashboard 在重新派生持仓时可能直接崩溃。

### 工程术语

删除不是单纯的 CRUD 操作，而是对事件溯源时间线的重写。删除前必须验证删除后的完整交易时间线仍满足不变量；不能把 Calculator 的异常当成正常业务控制流。

### 老板大白话

账本里的交易像一串因果关系。后面的卖出可能依赖前面的买入。直接删除中间那笔买入，就像把仓库入库单撕掉，却还保留后面的出库单，最后系统会显示“卖出了根本不存在的货”。

### 推荐解决方案

在 UI 和 reducer 之间增加安全删除业务入口，例如：

```text
tradeId + current LedgerData
-> deleteTradeSafely(...) / validateTradeRemoval(...)
-> 构造候选 nextTrades
-> 校验完整时间线
-> ok: 返回允许删除
-> error: 返回结构化阻止原因
```

规则：

- Reducer 继续保持纯状态更新，不在 reducer 内加业务校验。
- UI 只有在安全删除 Service 成功后才 dispatch `trade/delete`。
- 会导致任一时点负持仓的删除必须被阻止。
- 第一版不做级联删除，不自动删除后续卖出。
- 错误文案应说明“后续交易依赖该记录”，不能只显示“删除失败”。

### 必测场景

- 删除不影响后续时间线的交易：成功。
- 删除最后一笔交易：成功并恢复空状态。
- 删除被后续卖出依赖的买入：失败，账本不变。
- 删除不存在的 ID：返回明确结果，不制造新 state。
- 删除其他资产的交易：只影响对应资产。
- 成功与失败路径都不修改输入 `LedgerData`。

### 关闭标准

- UI 不再直接无条件 dispatch 删除。
- 删除失败时列表和持仓保持原样，页面不崩溃。
- Golden ADA 依赖买入删除场景有自动化回归。
- 删除后重新计算持仓不抛错。

---

## P0-04：hydrate 前缺少完整 `LedgerData` 运行时校验

### 当前事实

当前内存数据主要由生产 Asset、Validator、Service 和 reducer 产生，可以视为受控数据。Week 7 开始从 IndexedDB 读取后，数据来源会变成运行时不可信：

- 旧版本数据。
- 被手工修改或损坏的数据。
- 重复 ID。
- 非法 DecimalString。
- 不存在的资产引用。
- 不合法的交易时间线。

TypeScript 类型只能约束编译期，`as LedgerData` 不能证明浏览器存储里的对象合法。

### 工程术语

hydration 是外部数据进入领域状态的 trust boundary。只检查 `schemaVersion` 不够；必须对完整聚合根执行 runtime schema validation、cross-reference validation、domain invariant validation 和资源上限检查，成功后才能原子替换 reducer state。

### 老板大白话

从 IndexedDB 读数据，像从仓库里拿回一箱封存货。箱子标签写着“账本 v1”，不代表里面每件东西都是真的、完整的。必须开箱逐项验货，全部合格后才能放回营业系统。

### 最低校验范围

1. 顶层：
   - 对象结构正确。
   - `schemaVersion` 已知。
   - `assets / trades / priceSnapshots / feeRules` 均为数组。
2. Asset：
   - ID、symbol 唯一。
   - 必填字符串、quoteCurrency、时间字段合法。
3. Trade：
   - ID 唯一。
   - `type / timePrecision` 枚举合法。
   - Decimal 字段合法。
   - 资产引用存在。
   - 币种一致。
   - 完整时间线不存在任一时点超卖。
4. PriceSnapshot：
   - ID 唯一。
   - 资产引用存在。
   - 价格为正 DecimalString。
   - 币种、来源和时间字段合法。
5. FeeRule：
   - ID 唯一。
   - 类型、rate、currency 和时间字段合法。
6. 资源限制：
   - 字符串长度上限。
   - 数组规模上限。
   - 未来导入文件大小上限。

### 解决要求

- Week 7 必须给完整账本 Validator 安排明确实施日，不能推到 Week 8。
- Adapter 读出的原始载荷必须在 Repository 中先 decrypt、parse 和 validate。
- 任一错误都不得 dispatch `ledger/load` / `ledger/replace`。
- 失败时保留当前页面状态和原有存储数据。
- 合法完整账本恢复后，重新计算出的持仓必须与保存前一致。

### 关闭标准

- 合法账本 round-trip 后结构一致、持仓一致。
- 未知 schema、重复 ID、坏 Decimal、坏引用、非法类型和超卖时间线均被拒绝。
- 失败时旧账本结构级保持不变。
- hydration 前没有任何自动写入。

---

## P0-05：Repository、Adapter、Encryption 的最终契约存在漂移

### 当前事实

Week 1 旧设计与 Week 7 新计划存在两处差异：

1. 旧设计：`StorageAdapter.read()` 直接返回 `LedgerData`，空库返回默认账本。
2. 新计划：空库必须返回明确“无数据”，不能伪装成已保存空账本。
3. 旧设计：Adapter 内调用 EncryptionService。
4. 新计划：Repository 同时依赖 StorageAdapter 和 EncryptionService，但加密调用位置尚未最终锁定。

如果不在 Week 7 Day 1 统一，Adapter、Repository 和 Noop 可能按两套理解分别实现，造成重复序列化、重复校验或加密层位置混乱。

### 工程术语

这是 persistence boundary contract drift。必须锁定存储载荷类型、空值语义、序列化所有权、加密所有权、运行时校验位置和错误抽象，否则依赖倒置只存在于图上，代码仍会耦合。

### 老板大白话

现在像是仓库、保险柜和财务三方都知道要保管账本，但还没说清楚谁负责装箱、谁负责上锁、谁负责验货。如果三方都做一遍，会重复；如果都以为别人会做，就会漏掉。

### 推荐契约

```text
StorageAdapter
  read(): Promise<string | null>
  write(payload: string): Promise<void>
  clear(): Promise<void>

EncryptionService
  encrypt(plainText: string): Promise<string>
  decrypt(cipherText: string): Promise<string>

LedgerRepository
  load():
    adapter.read
    -> null 表示无保存数据
    -> decrypt
    -> JSON.parse
    -> validate LedgerData
    -> 返回合法 LedgerData

  save(ledgerData):
    validate / assert supported schema
    -> JSON.stringify
    -> encrypt
    -> adapter.write
```

边界：

- Adapter 只懂 IndexedDB 和字符串载荷，不懂 Trade、Position 或业务校验。
- EncryptionService 只懂字符串加解密，不懂 IndexedDB。
- Repository 负责把存储、加密、序列化和完整账本校验编排起来。
- UI、reducer、tradeService、positionService 不知道 IndexedDB API。

### 关闭标准

- Week 7 Day 1 形成唯一接口定义和依赖方向。
- 空库使用 `null / no data` 等明确语义，不返回伪保存账本。
- 全项目只有组装点知道具体 Adapter 与 Encryption 实现。
- Week 9 替换 Noop 时不修改 UI、Calculator、Validator 和 reducer。

---

## P0-06：hydration、自动保存、clear/reset 和连续写顺序未形成状态机

### 当前事实

Week 7 已提出“ready 前禁止写、连续写不乱序、失败不覆盖旧数据”，但还没有形成一套可以直接实现和测试的状态机。以下问题仍需拍板：

- 页面初次渲染的 `initialLedgerData` 会不会抢先写入。
- load 失败后是否仍可能触发自动保存。
- 连续新增、删除、价格更新的 Promise 如何排队。
- `ledger/reset` 与 `repository.clear()` 的产品语义是否相同。
- clear 后自动保存会不会立即把当前 state 再写回去。
- 写失败后页面如何提示，下一次写怎样恢复。

### 工程术语

这是 hydration race condition、write ordering、failure atomicity 和 command semantics 问题。仅使用一个 `useEffect(() => save(state), [state])` 会有覆盖旧数据和异步乱序风险。

### 老板大白话

打开应用时，系统要先把旧账本搬回来。如果搬运工还没回来，前台就把一份空账本送进仓库，旧账本可能被盖掉。连续点几次保存又像多辆货车同时出发，后出发的新账本反而可能先到，最后被早出发的旧账本覆盖。

### 推荐状态机

| 状态 | 允许编辑 | 允许自动写 | 行为 |
| --- | --- | --- | --- |
| `loading` | 否 | 否 | 只读取 repository |
| `ready-clean` | 是 | 否 | hydrate 或空库初始化刚完成，等待用户真实修改 |
| `ready-dirty` | 是 | 是 | 将当前 revision 加入串行保存队列 |
| `save-error` | 可按产品决定 | 否或受控重试 | 显示错误，保留上一次成功数据 |
| `load-error` | 否 | 否 | 显示读取失败，绝不回写 |

语义建议：

- `ledger/reset`：用户级动作，恢复生产初始账本，并把该干净账本作为新状态保存。
- `repository.clear()`：存储层删除记录能力，主要供明确清除、测试或迁移流程使用。
- empty database：表示“没有保存过”，不是“保存过一个空账本”。
- 自动保存：只在 hydration 完成且用户产生新 revision 后启动。
- 连续写：使用 Promise queue、串行队列或等价 last-write-order 机制。
- 写失败：不得先删除旧记录；旧成功版本继续可读。

### 必测场景

- 已有数据启动：初始空 state 不写入，旧数据成功恢复。
- 空库启动：使用生产初始账本，但不伪造已保存记录。
- 读取失败：不触发 write。
- 快速连续新增两笔：刷新后两笔都在。
- 新增后立刻删除：刷新后以最终删除状态为准。
- 写失败：刷新仍能读到上一次成功版本。
- reset：刷新后得到生产初始账本。
- clear：刷新后按明确空库语义启动。

### 关闭标准

- hydration 前写入次数为零。
- 连续写测试稳定通过，不依赖偶然 Promise 完成顺序。
- 写失败不破坏上一版持久化数据。
- reset、clear、空库三种语义有独立测试。
- UI、Service 和 reducer 中不存在 IndexedDB 调用。

---

# P1 问题

## P1-01：`PriceSnapshot` 创建 Service 契约不完整

### 当前事实

Week 6 已计划校验资产、价格和币种，并生成完整 `PriceSnapshot`；但还未明确：

- ID 冲突重试规则。
- 时钟或 ID 依赖失败怎样返回。
- `recordedAt` 使用用户输入还是提交时间。
- `source` 是否固定为 `manual`。
- `currency` 是否允许用户任意输入。
- 同一 `recordedAt` 更正的展示和测试规则。

### 工程术语

价格录入也属于不可信输入到正式领域对象的转换，应该与 `tradeService` 使用一致的 Result、依赖注入、有限 ID 重试和不可变性边界。

### 老板大白话

价格记录和交易记录一样，不能因为字段少就随便写。否则两条价格可能撞上同一个编号，或者用户给 BTC 填了一个不匹配的计价币种，最后市值看起来有数字但口径是错的。

### 推荐规则

- `assetSymbol` 从生产资产中选择。
- `currency` 默认从 Asset `quoteCurrency` 派生。
- `price` 必须是正 DecimalString。
- `recordedAt` 由用户输入；第一版明确时间精度。
- `source` 固定为 `"manual"`。
- ID 与已有 PriceSnapshot ID 比较并有限重试。
- `createdAt / updatedAt` 使用同一次时钟读取。
- 校验失败和依赖失败使用不同结果分支。
- Service 不 dispatch、不计算市值、不修改 `LedgerData`。

### 关闭标准

- 合法、非法、未知资产、币种不匹配、ID 冲突和依赖失败测试通过。
- 同一 recordedAt 后录入更正值能被 Calculator 选中。
- 页面只在 Service 成功后 dispatch `priceSnapshot/add`。

---

## P1-02：Week 7 异步持久化认知与测试矩阵不足

### 当前事实

Week 3 只完成第一轮认知债偿还。Week 7 会同时引入：

- React `useEffect` 生命周期。
- hydration。
- Promise 顺序。
- IndexedDB transaction。
- 自动保存。
- 失败恢复。
- 开发模式下 effect 重复执行风险。

这些概念如果只靠 AI 直接生成代码，容易再次形成“测试暂时通过，但本人无法解释数据为什么不会被覆盖”的新认知债。

### 工程术语

持久化正确性依赖时序模型。开发者至少要能解释 state machine、effect trigger、serialization queue、transaction failure 和 stale write，才能审查实现是否真正满足数据安全要求。

### 老板大白话

Week 7 不只是“学会把数据存进浏览器”，而是要弄懂搬运旧账、保存新账和处理失败的先后顺序。否则代码看起来会存，但出了问题没人说得清为什么丢数据。

### 解决要求

Week 7 Day 1 在写实现前，必须能用自己的话说明：

```text
为什么初始空账本不会覆盖旧数据
为什么读取失败后绝不能写入
为什么连续写不会出现旧状态覆盖新状态
为什么 reset、clear 和空库不是同一件事
```

测试矩阵必须至少覆盖：

- 读取：已有、空库、损坏、未知 schema。
- 写入：单次、连续、失败、失败后恢复。
- 页面：loading、ready、load error、save error。
- 数据：合法账本、重复 ID、坏 Decimal、超卖时间线。

### 关闭标准

- 有一份简短的持久化状态机或时序说明。
- 每条关键解释都能对应一个自动化测试。
- 不以“手动刷新看起来还在”代替失败和竞态测试。

---

## P1-03：历史 Checklist、状态和实际 Git 事实存在轻微漂移

### 当前事实

- Week 6 Checklist 的四项前置 Gate 实际已经满足，但仍未勾选。
- 当前状态文件写着 Day 6 功能分支保留，但源码仓库当前只有 `main`。
- Week 3 Checklist 仍有大量理解项未关闭，而当前状态只概括为“完成第一轮认知债务偿还”。

这些差异目前没有改变源码，但会误导后续 AI、周计划判断和风险关闭状态。

### 工程术语

这是 documentation drift 和 traceability 缺口。状态文件、Checklist、风险登记册与 Git/source 事实没有保持同一时间点，可能导致重复补课、错误 Go/No-Go 或把未关闭风险写成已完成。

### 老板大白话

实际工程已经走到五楼，但施工看板上有的地方还写着三楼，有的地方又把没验收的房间写成“基本完成”。工人换班以后就可能走错楼层或漏掉问题。

### 解决要求

- 每个风险必须有：编号、等级、关闭阶段、状态、验证证据。
- 只有测试、源码或 Git 事实发生后才能勾选完成。
- Week 6 开工前回填已满足的前置 Gate。
- Week 6 或 Week 7 收口时修正功能分支事实。
- Week 3 继续使用“第一轮完成、认知债未清零”的准确表述。

### 关闭标准

- 当前状态、当前周 Checklist、风险文档和 Git 分支事实互相一致。
- 后续 AI 能从固定入口判断“已实现、计划中、风险未关闭”。
- 不通过聊天结论代替文件中的关闭记录。

---

## Week 6 建议落地顺序

| 日期 | 原主任务 | 本文件必须顺手关闭的风险 |
| --- | --- | --- |
| Day 1 | 接通新增交易表单 | P0-01 真实交互测试；P0-02 `TradeDraft` 字段契约 |
| Day 2 | 接通删除交易 | P0-03 安全删除时间线 |
| Day 3 | 建立价格录入 Service | P1-01 PriceSnapshot 完整契约 |
| Day 4 | 接通价格输入与 reducer | 验证价格成功/失败 dispatch 边界 |
| Day 5 | Golden 场景验收 | 加入“删除依赖买入必须失败”场景 |
| Day 6 | React Gate 收口 | P0-01 至 P0-03、P1-01 全部有验证证据 |

Week 6 Go / No-Go：

```text
P0-01、P0-02、P0-03 任一未关闭
-> Gate 4-5 不得写成全绿
-> Week 7 禁止开始 IndexedDB
```

---

## Week 7 建议落地顺序

当前 Week 7 计划缺少“完整 LedgerData Validator”的独立实施空间，建议调整为：

| 日期 | 建议唯一主任务 | 必须关闭的风险 |
| --- | --- | --- |
| Day 1 | 锁定持久化契约、状态机与信任边界 | P0-05、P0-06、P1-02 |
| Day 2 | 实现完整 `LedgerData` 运行时 Validator | P0-04 |
| Day 3 | 实现 IndexedDB StorageAdapter | 依赖 P0-05 的最终接口 |
| Day 4 | 实现 Repository、Noop 与唯一组装点 | 完成 round-trip 和错误抽象 |
| Day 5 | 安全 hydrate | P0-04、P0-06 |
| Day 6 | guarded write 与刷新验收 | P0-06 |

如果 Day 4 无法在一个主任务内安全完成：

```text
顺延 Week 8
不删除完整账本校验
不把 Noop / 组装点塞进页面
不降低 hydration 和写失败通过线
```

---

## 开发前后使用方法

每次开始 Week 6-7 的任务前：

1. 查本文件总览，确认当天对应风险。
2. 阅读该风险的“解决要求”和“关闭标准”。
3. 实现和测试只围绕当天唯一主任务。
4. 完成后记录真实测试、lint、build 或手动验收证据。
5. 没有证据时状态保持“未关闭”。

风险关闭记录格式：

```text
状态：已关闭
关闭日期：
源码提交：
自动化验证：
手动验收：
剩余限制：
```

---

## 边界

本文件做：

- 固定 P0/P1 风险。
- 指定关闭阶段。
- 给出推荐解决方向和可测试通过线。
- 约束 Week 6-7 不得绕过的数据安全边界。

本文件不做：

- 不把建议写成已经实现的源码事实。
- 不直接修改 Week 6、Week 7 每日清单。
- 不提前实现 IndexedDB、导入导出或加密。
- 不升级 `06B` 中的 P2 排序和长列表风险。
- 不以文档完成代替问题关闭。

---

## 最终自检表

| 问题 | 通过标准 |
| --- | --- |
| 是否区分已实现和未实现 | 所有风险均写明当前未关闭 |
| 老板是否能看懂 | 每项都有“大白话”解释业务影响 |
| 工程师是否能执行 | 每项都有工程定义、解决要求和测试通过线 |
| P0 是否真正阻断后续 | Gate 未通过时明确禁止进入下一阶段 |
| 是否保护 reducer 边界 | 校验放在 Service / Validator，不塞进 reducer |
| 是否保护持久化信任边界 | hydrate 前完整校验，失败不替换、不回写 |
| 是否防止文档风险无限拖延 | 每项指定 Week 6 或 Week 7 关闭阶段 |
| 是否与 `06B` 重复 | P2 仍由 `06B` 管理，本文件聚焦 P0/P1 |
