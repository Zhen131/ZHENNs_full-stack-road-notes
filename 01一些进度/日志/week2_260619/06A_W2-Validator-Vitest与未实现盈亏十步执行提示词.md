# 06A_W2 Validator、Vitest 与未实现盈亏十步执行提示词

日期：2026-06-24

状态：待执行

目标：把 Week 2 剩余开发拆成 10 个可独立执行、可独立验收的小步骤。

---

## 执行结论

今天按顺序执行，不并行、不跳步：

```text
统一标准
→ 设计 Validator
→ 实现基础校验
→ 实现金额校验
→ 实现超卖校验
→ 补齐 Validator 测试
→ 迁移 Vitest
→ 统一核心测试
→ 实现未实现盈亏
→ 完整验收与记录
```

优先级：

- 第 1–8 步是 Week 2 不可推迟项。
- 第 9–10 步是今日加速目标。
- 如果当天时间不足，至少完成第 8 步；未实现盈亏可以顺延。

执行规则：

- 每次只复制一条提示词给 Codex。
- 当前步骤验收通过后，再执行下一步。
- Codex 不得提前实现后续步骤。
- 每一步结束时都要说明修改文件、验证结果和遗留问题。
- 源代码工作目录固定为 `01一些进度/产出/LocalFirstTradingLedger`。
- 当前开发分支固定为 `zhennn/w2-validator-vitest`。

---

## Step 1：统一 5 条交易与验收标准

预计时间：20–30 分钟

目标：消除旧版“5 条全部买入”和当前“4 买 1 卖”之间的数据冲突。

提示词：

```text
请执行 Week 2 今日计划 Step 1：统一 5 条交易与验收标准。

先检查当前 Git 分支和工作区，只允许在 zhennn/w2-validator-vitest 分支工作。阅读：
- 01一些进度/日志/week2_260619/01C_W2-Week2验收标准.md
- 01一些进度/日志/week2_260619/03A_W2-5条样例Trade数据.md
- 01一些进度/日志/week2_260619/03B_W2-positionCalculator-v1设计说明.md
- 源代码中的 positionCalculator.test.ts

以当前 5 条交易“4 条买入 + 第 5 条 ADA 卖出”为唯一有效标准。确认并统一以下结果：
- ADA 卖出前数量 168.2625，成本 42
- ADA 卖出后数量 85.3244
- 剩余成本 21.297822152886115445
- 平均成本 0.24960998439937597504
- realizedPnl 为 -0.702177847113884555

修正 Week 2 当前验收文档中仍使用 251.2006 / 62 或错误超卖基准的内容。不要批量修改 Week 1 历史记录；历史文件如有旧数据，只记录它属于旧版标准，不篡改历史。

完成后运行现有 position 测试。只做标准统一，不设计或实现 Validator，不安装 Vitest。最后报告修改文件、有效验收数字和测试结果。
```

完成标准：

- Week 2 当前文档只使用“4 买 1 卖”标准。
- 超卖测试基准不再错误使用 `251.2006`。
- 现有 position 测试通过。

---

## Step 2：设计 tradeValidator 接口与错误模型

预计时间：30–45 分钟

目标：先确定 Validator 的输入、输出、上下文和容差规则，再写实现。

提示词：

```text
请执行 Week 2 今日计划 Step 2：设计 tradeValidator 接口与错误模型。

阅读当前 models、decimalMath、positionCalculator、Week 2 验收标准和 5 条 Trade 样例。设计 src/validators/tradeValidator.ts 的最小公开接口，但本步骤不要实现完整校验逻辑。

设计必须明确：
- 校验 TradeDraft 还是 Trade，为什么
- 如何传入合法 Asset[]
- 如何传入该交易之前的历史 Trade[]，用于判断卖出是否超持仓
- 校验成功和失败如何表达
- 如何返回稳定、可测试的错误 code，而不是只依赖错误文案
- fee 缺省时如何处理
- quantity * price 与 totalValue 的“明显冲突”采用什么容差规则
- 非法小数字符串如何归类
- Validator 与 calculator 的职责边界

优先采用适合表单和未来 JSON 导入复用的结构化 ValidationResult，不要把所有失败都设计成直接 throw。可以创建类型、函数签名、错误 code 和简短注释，并写一份精简设计说明；暂时不要实现各条规则，不要写测试，不要安装 Vitest。

完成后运行 npm run lint 和 npm run build，报告最终 API、设计取舍、修改文件和验证结果。
```

完成标准：

- Validator API 能支持表单和未来导入流程。
- 错误具有稳定 code。
- 超卖校验所需上下文明确。
- lint、build 通过。

---

## Step 3：实现基础字段校验

预计时间：35–50 分钟

目标：拦截与持仓无关的基本非法交易。

提示词：

```text
请执行 Week 2 今日计划 Step 3：实现 tradeValidator 基础字段校验。

基于 Step 2 已确定的 API，只实现以下规则：
- type 只能是 buy 或 sell
- assetSymbol 必须存在于传入的 Asset[]
- quantity 必须是合法 Decimal 且大于 0
- price 必须是合法 Decimal 且大于 0
- totalValue 必须是合法 Decimal 且大于 0
- fee 缺省按 0 处理；存在时必须是合法 Decimal 且不能小于 0

复用 decimalMath，不要使用 Number、parseFloat 或裸 JavaScript 浮点运算。错误返回必须使用 Step 2 定义的稳定 code。一次输入如果有多个错误，遵循 Step 2 已决定的返回策略。

本步骤补最小测试即可，测试方式暂时沿用当前项目现状；不要安装 Vitest，不要实现成交金额冲突，不要实现卖出超持仓，不要修改 positionCalculator。

完成后运行相关测试、npm run lint 和 npm run build，并报告覆盖了哪些规则。
```

完成标准：

- 六类基础非法输入均能被拦截。
- 5 条固定样例通过基础校验。
- 没有使用原生浮点运算。

---

## Step 4：实现成交金额冲突校验

预计时间：30–45 分钟

目标：校验 `quantity × price` 与 `totalValue` 是否明显冲突。

提示词：

```text
请执行 Week 2 今日计划 Step 4：实现成交金额冲突校验。

在 tradeValidator 中新增 quantity * price 与 totalValue 的容差校验。严格复用 DecimalMath，并遵循 Step 2 确定的容差规则。

要求：
- 当前 5 条固定样例必须全部合法，因为真实成交金额允许四舍五入
- 明显不一致的数据必须返回稳定的错误 code
- 容差边界必须有测试：容差内通过、恰好在边界的行为明确、超过容差失败
- 不得用 Math.abs、Number、parseFloat 或原生 quantity * price
- 错误信息应包含足够的诊断信息，但测试主要断言 code

只实现和测试成交金额冲突规则。不要实现超卖，不要安装 Vitest，不要改未实现盈亏。

完成后运行 Validator 当前测试、现有 Decimal 和 position 测试、lint、build，报告容差公式及验证结果。
```

完成标准：

- 5 条样例通过。
- 明显冲突的总金额被拦截。
- 容差边界有自动化测试。

---

## Step 5：实现卖出超过持仓校验

预计时间：45–60 分钟

目标：在交易进入 calculator 前拦截超卖。

提示词：

```text
请执行 Week 2 今日计划 Step 5：实现 Validator 的卖出超持仓规则。

基于 tradeValidator 已确定的上下文接口，使用“当前待校验交易之前的历史交易”计算可卖持仓。必须按 occurredAt 排序，并保持同一时间或同一天交易的稳定输入顺序，规则应与 positionCalculator 一致。

要求覆盖：
- buy 不触发超卖错误
- 没有持仓时 sell 被拒绝
- sell quantity 大于当前持仓时被拒绝
- sell quantity 等于当前持仓时允许
- 多次买入后部分卖出允许
- 前一次卖出后，再次卖出时使用剩余持仓判断
- 不同资产分别计算，BTC 持仓不能支持 ADA 卖出

Validator 必须在调用 calculator 之前给出结构化失败结果。calculator 中现有超卖 throw 继续保留，作为防御性保护，不要删除。

不要安装 Vitest，不要实现未实现盈亏。完成后运行全部现有测试、lint、build，并报告超卖计算如何保证与 calculator 口径一致。
```

完成标准：

- 超卖在进入 calculator 前被 Validator 拦截。
- 等量清仓合法。
- calculator 的防御性检查仍保留。

---

## Step 6：补齐 Validator 全规则测试

预计时间：40–60 分钟

目标：用测试完整证明 Validator 的所有规则。

提示词：

```text
请执行 Week 2 今日计划 Step 6：补齐 tradeValidator 全规则测试。

整理 Validator 测试数据，避免每个测试复制完整 Trade 对象；可以使用清晰的 fixture 或 builder，但不要引入额外测试库。

测试至少覆盖：
- 合法的 5 条固定交易按顺序全部通过
- 非法交易类型
- 资产不存在
- quantity 为 0、负数、非法字符串
- price 为 0、负数、非法字符串
- totalValue 为 0、负数、非法字符串
- fee 为负数和非法字符串
- fee 缺省合法
- 成交金额在容差内
- 成交金额明显冲突
- 无持仓卖出
- 卖出超过持仓
- 等量清仓
- ADA 多次买入和部分卖出
- Validator 失败后不调用 calculator，证明非法交易不会污染后续计算

当前仍沿用已有测试运行方式，不安装 Vitest。不要实现新业务功能。完成后运行 Validator、Decimal、position 测试以及 lint、build，报告测试数量和规则覆盖情况。
```

完成标准：

- Validator 验收规则全部有自动化测试。
- 存在明确测试证明失败后不进入 calculator。
- 全部现有检查通过。

---

## Step 7：安装并配置 Vitest

预计时间：30–45 分钟

目标：建立符合 Week 2 原计划的测试基础设施。

提示词：

```text
请执行 Week 2 今日计划 Step 7：安装并配置 Vitest。

先检查 package.json、tsconfig 和当前测试文件。安装与当前 Node、TypeScript、Next.js 14 项目兼容的 Vitest 开发依赖，并完成最小配置。

要求：
- package.json 建立统一的 npm test 命令
- npm test 使用 Vitest 单次运行模式，不能默认进入 watch
- 如需要可增加 test:watch
- 测试环境使用 node，不引入 jsdom
- 支持当前 src 下的 *.test.ts
- 暂时不要迁移测试断言内容
- 不删除旧 test:decimal、test:positions 和 .tmp-tests 方案，下一步确认迁移成功后再删
- 不改业务实现

安装依赖涉及网络时，按工具权限正常申请。完成后用一个最小 smoke test 验证 Vitest 能启动，再运行 lint 和 build。报告依赖和脚本变化。
```

完成标准：

- `npm test` 能启动并退出。
- Vitest 使用 Node 环境。
- 旧测试方案暂时保留，便于回退。

---

## Step 8：迁移全部核心测试并删除临时方案

预计时间：45–75 分钟

目标：一次 `npm test` 证明 Week 2 核心账本正确。

提示词：

```text
请执行 Week 2 今日计划 Step 8：把全部核心测试迁移到 Vitest。

迁移现有 DecimalMath、positionCalculator 和 tradeValidator 测试：
- 使用 Vitest 的 describe、it/test、expect
- 保留现有业务断言精度，不得为了测试通过降低要求
- 5 条交易 golden test 必须验证 BTC、ETH、ADA
- 明确验证 ADA 多次买入、部分卖出、剩余成本、平均成本和 realizedPnl
- 明确验证超卖
- Validator 全部规则必须保留

迁移成功后：
- 删除 package.json 中不再需要的 test:decimal、test:positions 临时编译命令
- 删除 .tmp-tests 方案产生的残留目录
- 确保 .tmp-tests 不再是测试流程依赖
- npm test 成为统一证明入口

不要实现未实现盈亏。完成后执行 npm test、npm run lint、npm run build，并报告测试文件数、测试数和三条命令结果。
```

完成标准：

- `npm test` 一次跑完全部核心测试。
- 不再依赖 `node:assert`、临时 `tsc` 编译或 `.tmp-tests`。
- test、lint、build 全部通过。

---

## Step 9：实现最新价格与未实现盈亏

预计时间：60–90 分钟

目标：完成 `latestPrice`、`marketValue` 和 `unrealizedPnl`。

提示词：

```text
请执行 Week 2 今日计划 Step 9：实现最新价格与未实现盈亏。

阅读 PriceSnapshot、Position 和 positionCalculator 当前设计。以最小 API 扩展现有计算能力，使仓位可以根据 PriceSnapshot[] 得到：
- latestPrice
- marketValue = quantity * latestPrice
- unrealizedPnl = marketValue - costBasis

规则：
- 同一资产有多条快照时使用 recordedAt 最新的一条
- recordedAt 相同则保持稳定输入顺序，并明确选择规则
- 只使用与仓位 currency 一致的价格快照；币种不一致不得静默混算
- 没有可用快照时三个可选字段保持 undefined
- Decimal 计算必须复用 decimalMath
- 不改变 realizedPnl
- 不保存 Position，Position 仍然是派生结果

补 Vitest：
- 无价格快照时三个字段为空
- 多条快照使用最新价格
- 市值计算正确
- 未实现盈亏计算正确
- 不同资产各用自己的快照
- 快照币种不匹配的行为明确且有测试

不要接页面，不改存储层。完成后运行 npm test、lint、build，并报告 API 变化和计算结果。
```

完成标准：

- 最新快照选择确定且可测试。
- 三个字段计算正确。
- 无快照时不制造零值或假数据。

---

## Step 10：执行完整验收并更新 Week 2 日志

预计时间：30–45 分钟

目标：确认 Week 2 核心计算具备可重复证明。

提示词：

```text
请执行 Week 2 今日计划 Step 10：完整验收与日志收口。

先审查本分支相对起点的全部 diff，重点检查：
- Validator 是否覆盖全部验收规则
- 非法交易是否能在 calculator 前被拦截
- 是否仍有裸 JavaScript 金额运算
- 5 条交易标准是否统一为 4 买 1 卖
- Vitest 是否是唯一正式测试入口
- .tmp-tests 和临时脚本是否已移除
- latestPrice、marketValue、unrealizedPnl 是否有完整测试
- 是否意外修改了 UI、存储或无关文件

然后执行：
- npm test
- npm run lint
- npm run build
- git status --short
- git diff --check

如发现问题，只修复本次范围内的问题并重新验证。最后按照 01一些进度/日志/00-文档产出规范.md 更新 99_Week2日志_260619.md，记录今日完成、关键决策、验证结果和下一步入口。

不要提交、推送或创建 PR，除非我另行明确要求。最终报告：
- 完成项
- 测试数量与结果
- lint/build 结果
- 修改文件
- 未完成或风险
- 当前 Git 状态
```

完成标准：

- `npm test`、`npm run lint`、`npm run build` 全部通过。
- `git diff --check` 无格式错误。
- Week 2 日志能够说明本次决策和验收结果。
- 没有未经允许提交或推送。

---

## 今日停止线

| 到达步骤 | 状态判断 |
| --- | --- |
| Step 6 | Validator 功能完成，但测试基础设施仍是临时方案 |
| Step 8 | Week 2 不可推迟项完成，可以安全停止 |
| Step 9 | 原始 Week 2 计算能力完整 |
| Step 10 | 今日计划完整验收并形成日志 |

最低合格结果：

```text
完成 Step 1–8。
```

完整目标：

```text
完成 Step 1–10，且 npm test、npm run lint、npm run build 全绿。
```
