# Week 7：持久化 Gate 验收记录

日期：2026-07-18

结论：**Week 7 Storage Gate: No-Go**。源码、自动化故障注入和固定 production
主链均通过；production DevTools IndexedDB envelope 与 clear 后 record 没有取得
直接读取证据。按 01A 规则，任何一项缺证即 No-Go，Week 8 不得开始。

## 1. 对应源码

| 项目 | 结果 |
| --- | --- |
| 原执行分支 | `zhennn/week7-storage-gate` |
| 行为提交 | `02e28f3 功能：完成第七周安全清空与存储互斥` |
| README 同步 | `8f96cc6 文档：记录第七周Storage Gate验收结果` |
| 当前源码基线 | `main` / `origin/main` 均包含合并提交 `529983e` |
| Adapter / Repository / schema | 未修改 |
| Week 8 代码 | 未开始 |

实际修改：

```text
src/hooks/usePersistentLedger.ts
src/hooks/usePersistentLedger.test.tsx
src/components/dashboard/DashboardShell.tsx
src/components/dashboard/DashboardShell.test.ts
src/components/dashboard/DashboardShell.interaction.test.tsx
README.md
```

2026-07-19 后续可靠性补漏又修改了：

```text
src/hooks/usePersistentLedger.ts
src/hooks/usePersistentLedger.test.tsx
src/components/dashboard/DashboardShell.tsx
src/components/dashboard/DashboardShell.golden.test.tsx
src/components/dashboard/DashboardShell.interaction.test.tsx
src/components/trades/TradeForm.tsx
src/components/prices/PriceForm.tsx
```

补漏内容为 S-01 保存状态语义、S-02 失败安全重试和 S-03 dirty 离开/
Repository 切换保护；不改变本记录 G-01 / G-02 未通过的结论。

## 2. 自动化与确定性故障注入

| 场景 | 实际结果 |
| --- | --- |
| load 失败 | 进入 `error`，表单与删除禁用，不自动保存 |
| error 恢复 clear | 成功后 `ready + createInitialLedgerData()`；失败继续 `error` |
| save 失败 | 页面 state 保留并显示错误；后续写可继续 |
| 排队 save | clear 等待 deferred save settled 后才调用 Repository clear |
| 前置 save 失败 | 失败证据保留到 clear 结果；队列继续，clear 可独立成功 |
| 重复 clear | 两次调用共享同一 Promise；Repository clear 一次 |
| clear 期间写保护 | dispatch、自动保存、表单、删除和再次 clear 均被锁定 |
| clear 失败 | 复用 `LEDGER_REPOSITORY_ERROR_CODES.CLEAR_FAILED`；旧 state 与旧存储不变 |
| Repository 切换 | 旧 clear 结果不替换新 Repository 页面、不清除新错误 |
| 组件卸载 | 存储 Promise 可结束，不执行卸载后应用 state 更新 |
| fake IndexedDB 重挂载 | 新增+价格恢复、删除恢复、clear、再挂载为空全部通过 |
| clear 后 record | 自动化中 `load() === null`，无额外 save；首次新写入才重新生成 |

新增重点测试位于 Hook、Dashboard 组件和 fake IndexedDB 真实组装链；全量范围仍是
仓库当前 19 个 Vitest 文件，不代表已覆盖 Week 8 导入导出、真加密或多标签页。

## 3. production build 浏览器人工验收

环境：`http://127.0.0.1:4317`，production build，隔离 origin，单一标签页；
未访问或删除默认 `http://localhost:3000` 数据。

| 步骤 | 实际值 |
| --- | --- |
| BTC 保存并刷新 | 交易数 1；数量 `0.001`；平均成本 `70000 USD`；剩余成本 `70 USD`；已实现盈亏 `0 USD` |
| BTC 价格保存并刷新 | 当前价格 `80000 USD`；市值 `80 USD`；未实现盈亏 `10 USD` |
| ETH 保存并刷新 | 总交易数 2；ETH 数量 `0.005`；平均成本 `2000 USD`；剩余成本 `10 USD` |
| 删除 ETH 并刷新 | 总交易数 1；ETH 持仓消失；BTC 仍为 `0.001 / 70000 / 70 / 0 / 80000 / 80 / 10 USD` |
| 固定文本 clear | 输入 `清空本地账本`；成功后空持仓、空交易、内置 BTC/ETH/ADA 保留 |
| clear 后刷新 | 仍为空，没有恢复旧交易或旧价格 |
| clear 后首次新写入 | 新 BTC 交易保存后刷新恢复，证明后续持久化仍可继续 |
| 控制台 | `warning / error = 0` |

## 4. IndexedDB envelope 与 record

源码与自动化锁定的契约：

```text
database = local-first-trading-ledger
store = ledger
key = ledger:v1
formatVersion = 1
Noop encryptedPayload = 可读 LedgerData JSON
Position[] = 不进入 payload
```

production 浏览器中的新增、价格、删除和 clear 均通过刷新行为证明实际持久化链可用；
fake IndexedDB 真实组装链也直接证明 clear 后 `load() === null` 且初始账本不会自动保存。

未通过项：本轮浏览器控制环境没有提供 Application/IndexedDB record 直读能力，
所以没有直接读取 production `ledger:v1` 的 `formatVersion`、`encryptedPayload`，也没有
直接观察 clear 后 key 不存在。该项不能用源码常量、README 或 fake IndexedDB 代替。

## 5. 验证命令

```text
npm test         -> Storage Gate 基线 19 files / 169 tests；补漏后 19 files / 188 tests
npm run lint     -> No ESLint warnings or errors
npm run build    -> Compiled successfully
git diff --check -> 通过
```

## 6. 限制与边界

- Noop EncryptionService 不提供保密性；当前 payload 按设计是明文 JSON。
- Week 7 只保证单标签页内顺序。其他标签页可能在 clear 后重新写入旧 state；
  本周未实现 BroadcastChannel、跨标签页锁或冲突版本。
- 未增加生产 debug 开关、故障按钮、验收依赖或第二套 clear 错误码。
- 未修改 Adapter、Repository、Validator、Calculator、schema、依赖或业务口径。

## 7. Go / No-Go

| Gate | 结果 |
| --- | --- |
| 第 7 节自动化测试 | 通过 |
| 固定新增 / 价格 / 删除 / 刷新 / clear | 通过 |
| load / save / clear 故障注入 | 通过 |
| test / lint / build / diff-check | 通过 |
| 多标签页与 Noop 限制记录 | 通过 |
| production DevTools envelope / clear record | **未通过** |

最终结论：**No-Go**。Week 8 进入条件不满足。
