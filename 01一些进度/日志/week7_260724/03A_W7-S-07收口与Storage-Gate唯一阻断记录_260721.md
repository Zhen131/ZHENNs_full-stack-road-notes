# 03A——W7 S-07 收口与 Storage Gate 唯一阻断记录

日期：2026-07-21

状态：S-07 已完成；Week 7 Storage Gate 仍为 **No-Go**。
关联：[[01B_W7-持久化Gate验收记录]]、[[90A_W7-查缺补漏开发记录_260718]]、[[02B_W7-Week 1–7 查缺补漏解决方案]]

## 结论

第七周剩余的实现性工作已经收口：S-01、S-02、S-03 已在源码 `main`，S-07
ResourcePolicy 已在候选分支完成。当前没有已知的功能缺陷、测试失败或构建失败。

Week 7 唯一阻断是 **production origin 中 IndexedDB `ledger:v1` record 的直接取证能力**。
它对应两个必须分别留下证据的 Gate 检查：G-01 读取写入后的 envelope；G-02 读取
clear 后 key 已不存在。刷新后的 UI、fake IndexedDB 测试、源码常量和 README 都只能
证明行为或实现契约，不能替代这两项 production record 直接证据。

## 今日完成

### 1. S-07 ResourcePolicy 已实现并验证

实现位于源码候选分支 `zhennn/week7-s07-resource-policy`：

| 范围 | 已完成规则 |
| --- | --- |
| 文件入口 | `evaluateLedgerJsonResourcePolicy(...)` 在 JSON parse 前按 UTF-8 字节数执行 8 MiB 上限检查 |
| 集合上限 | assets 500、trades 25,000、priceSnapshots 5,000、feeRules 500 |
| 字符串上限 | ID 128；symbol/currency 32；name/platform 128；note 4,096；rawText 16,384 |
| 职责隔离 | `validateLedgerData(...)` 继续只负责结构与业务合法性，不被资源策略替代 |
| 旧数据保护 | 结构合法但超限的已保存账本以只读方式 hydrate；禁止 mutation、自动保存和 clear |
| 新写入保护 | prospective state 超限时，在 reducer 前拒绝；超限内容不会进入页面 state 或 IndexedDB |
| UI | 只读状态显示原因，编辑表单与危险 clear 操作禁用 |

源码提交链：

```text
c2b8c06 功能：新增账本资源策略边界
7b1597d 功能：接入资源策略只读保护
dc89f35 修复：兼容资源策略的项目编译目标
6ea5c75 文档：记录第七周资源策略收口
```

其中 `dc89f35` 只把不兼容当前 TypeScript 编译目标的 `Array.entries()` 循环改为索引循环；
ResourcePolicy 的规则、阈值和业务口径没有变化。

### 2. S-07 验证结果

| 验证项 | 结果 |
| --- | --- |
| 全量自动化 | 20 个 Vitest 文件、195 项测试通过 |
| lint | 通过 |
| production build | 通过 |
| `git diff --check` | 通过 |
| 阈值边界 | 等于上限允许；集合、文件或字符串超一单位被拒绝 |
| 旧超限账本 | 只读 hydrate，不能覆盖、销毁或清空旧 record |
| 新超限 mutation | reducer 前拒绝，页面和持久化均不写入 |

### 3. production UI 行为复验

在隔离 production origin `http://localhost:3001` 中完成以下动作，浏览器控制台
`warning / error = 0`：

| 动作 | 实际结果 |
| --- | --- |
| 新增 BTC | 2026-07-14，`0.001 × 70000 USD`；持仓成本 `70 USD` |
| 新增 BTC 价格 | 2026-07-16，`80000 USD`；市值 `80 USD`，未实现盈亏 `10 USD` |
| 新增 ETH | 2026-07-15，`0.005 × 2000 USD`；总交易数变为 2 |
| 刷新 | BTC 与 ETH 均恢复，证明写入与 hydration 主链工作 |
| 删除 ETH 后刷新 | ETH 消失，BTC 仍保留 |
| 输入 `清空本地账本` 后 clear | 页面为空账本，内置 BTC / ETH / ADA 保留 |
| clear 后刷新 | 仍为空账本，没有恢复旧交易或旧价格 |

这轮复验确认 S-07 没有破坏已有 storage 主链；它不是 G-01 / G-02 的替代证据。

## 唯一阻断：G-01 / G-02 的 production record 直接证据

### 阻断本体

当前可用的浏览器控制环境提供页面交互、可见 UI 和日志读取，但没有 DevTools
Application / Console 的 IndexedDB 直接读取能力；页面执行上下文也不暴露
`indexedDB`。因此无法在该环境内观察 production origin 真实数据库中的 record。

这不是“还要补一段业务代码”的阻断，而是“验收证据通道缺失”的阻断。不得为了绕过
它而添加 production debug 开关、测试后门、额外 API，或把 fake IndexedDB 结果写成
production DevTools 证据。

### 固定 storage 契约

```text
database = local-first-trading-ledger
store = ledger
key = ledger:v1
envelope.formatVersion = 1
envelope.encryptedPayload = Noop EncryptionService 的可读 LedgerData JSON
Position[] 不进入 payload
```

### G-01：写入后的 envelope 直接读取

**通过线：** 在 production origin 新增至少一笔交易并等待“已保存到本地”后，用
DevTools 直接打开 `local-first-trading-ledger / ledger / ledger:v1`，保存 record
截图或等价原始输出，并确认：

| 字段 | 必须确认的事实 |
| --- | --- |
| record key | 为 `ledger:v1` |
| `formatVersion` | 为数值 `1` |
| `encryptedPayload` | 存在且为字符串 |
| payload 语义 | Noop 解包后为完整 `LedgerData`；包含刚写入的交易，不含派生 `Position[]` |

**当前状态：未通过。** UI 刷新恢复只能间接证明“有可恢复的数据”，不能直接证明
record key、envelope 字段或 payload 形状。

### G-02：clear 后 record 不存在的直接读取

**通过线：** 在同一个 production origin 完成固定文本 clear，确认页面空账本后，
重新打开同一 IndexedDB store；保存截图或等价原始输出，证明 `ledger:v1` key
不存在。随后刷新页面，确认旧交易不会恢复。

**当前状态：未通过。** 已完成 clear 后刷新为空的行为验收；但没有直接观察 key 被删除，
所以不能断言 production record 已被直接验证为不存在。

### 关闭阻断的最小操作

1. 用具备真实 DevTools Application 或 Console IndexedDB 读取能力的浏览器，打开隔离的 production origin；不要复用有历史数据的开发 origin。
2. 先执行 G-01：新增固定 BTC 交易，待保存完成后读取并留存 `ledger:v1` record 原始证据。
3. 在同一 origin 执行固定文本 `清空本地账本`。
4. 再执行 G-02：直接确认 `ledger:v1` 不存在，并刷新页面确认空账本。
5. 将两份 record 证据的截图/原始输出、浏览器版本、origin 和时间补入 [[01B_W7-持久化Gate验收记录]]；仅当两项都可复核时，把 Storage Gate 改为 Go，并解除 Week 8 禁止开始。

## 明确不做

- 不在 Week 7 继续扩展 S-04 多标签页 revision、S-05 真加密或 S-08 benchmark。
- 不提前实现 Week 8 import/export。
- 不将 S-07 候选分支直接描述为已合入源码 `main`；它当前尚未推送或合并。
- 不把 UI 刷新、自动化 fake IndexedDB、源码阅读或静态契约代替 G-01 / G-02。

## 当前仓库状态与下一入口

| 仓库 | 当前事实 |
| --- | --- |
| 根目录文档仓库 | 本文件完成后提交；不涉及源码改动 |
| 源码仓库 | `zhennn/week7-s07-resource-policy` 比 `origin/main` 多 5 个本地提交，包含 S-07；尚未推送 |
| 源码 `main` / `origin/main` | 已包含 S-01 / S-02 / S-03 的 `529983e`；不包含 S-07 候选提交 |

下一步不是开始 Week 8，而是在可直接读取 production IndexedDB record 的环境关闭 G-01 和
G-02。两项证据齐备后，先更新 Gate 记录，再决定 S-07 合并、推送与 Week 8 开工。

## 自检表

| 检查 | 结果 |
| --- | --- |
| 已区分已完成实现与未关闭 Gate | 通过 |
| 已写明唯一阻断为何不能由测试/UI 替代 | 通过 |
| G-01 / G-02 各自的 record 通过线明确 | 通过 |
| 未虚构 production DevTools 证据 | 通过 |
| 未扩展到 Week 8 或其他补漏项 | 通过 |
