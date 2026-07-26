# 02A_W10：三图与 Binance 行情执行验收记录

更新时间：2026-07-25
状态：历史开发侧验收记录；Gate 0-7 已通过，后续修复与最终处置见 03A–03D 和 99 日志
正式计划：[[01C_W10-三图与Binance行情执行计划]]

> 本文中的“未合并、未推送”描述的是 2026-07-25 本轮开发验收结束时的现场，不再代表当前发布状态。

## 结论

Week 10 已按 Gate 0 至 Gate 7 顺序完成。日期与兼容、Binance 最新行情、统一价格选择、
共享持仓重放、三张 ECharts 图、V2 加密保存/备份/clear/import 恢复和 production 主链均已取得证据。
源码保留在 `zhennn/week10-charts-binance`，未 push、未 merge、未 rebase。

## Gate 0：基线与范围纠偏

### 仓库基线

| 仓库 | 执行前分支与状态 | 最近提交 | 处理 |
| --- | --- | --- | --- |
| 外层文档仓库 | `main`，工作树干净，本地领先 `origin/main` 4 个既有提交 | `30541e5 计划：修正第十周Git与Gate依赖` | 只修改并提交 Week 10 文档 |
| 独立源码仓库 | `main`，工作树干净，与 `origin/main` 同步 | `7f974e0 文档：更新第九周源码收口状态` | 创建 `zhennn/week10-charts-binance` |

未发现需要保留的未提交用户修改。

### 基线命令

| 命令 | 结果 |
| --- | --- |
| `npm test` | 30 个测试文件、290 项测试通过 |
| `npm run lint` | 无 ESLint warning / error |
| `npm run build` | production build compiled successfully，静态页面生成成功 |
| `git diff --check` | 通过 |

测试输出中的三条 `Not implemented: navigation to another Document` 是既有 jsdom 下载导航提示；测试进程退出码为 0，本轮基线没有新增失败。

### 范围纠偏

- 旧“两图”改为：当前持仓市值饼图、持仓总市值 / 持仓成本阶梯曲线、最近 365 天交易活跃热力图。
- 旧“不接行情”改为：接入 Binance Spot 最新公开价格；历史 Kline 继续禁止。
- 热力等级固定为 `当日笔数 / 最近 365 天最大日笔数` 的 level 0-4。
- 固定 Day 1-7 日期改为 Gate 0-7 依赖顺序。
- Week 9 整机硬离线固定为：**已取消、未验证、不再阻塞**。
- 情景价格、轮询、WebSocket、动画、主题、K 线、dataZoom 和正式 benchmark 均不进入 Week 10。

### Gate 0 判定

- 基线证据：通过。
- 专用源码分支：通过。
- 旧清单范围纠偏：通过。
- 源码业务逻辑修改：无。
- 外层文档提交：以 Gate 0 独立中文本地提交为准。

## Gate 1：日期、兼容与模型

- 建立日期 key、稳定排序和可注入本地 clock。
- 新交易、新价格与 strict import 拒绝未来事实；既有未来事实进入受限纠正模式，可救援、删除或纠正，不能继续普通写入或自动行情。
- 自动估值域固定为 USD/USDT；保留旧其他币种事实但隔离自动估值。
- Binance 映射与价格 provenance 以可选字段加入 `LedgerData`，旧账本可读，`schemaVersion` 保持 `1`。
- `ledgerEpoch` 在整账 replace/clear 后递增，为后续 stale response 保护提供代次。
- 定向与全量结果：33 个测试文件、306 项测试；lint、build、diff-check 通过。
- 源码提交：`bdc7a84 功能：完成第十周日期与兼容边界`。

判定：通过。

## Gate 2：Binance 与统一价格选择

- 客户端固定 `https://data-api.binance.vision`，只发公开 GET 请求读取 `exchangeInfo` 与 `ticker/price`；8 秒超时，无重试、轮询、WebSocket、API key 或私有接口。
- BTC/ETH/ADA 内置映射可编辑、删除与在线验证；刷新逐资产结算，部分成功可保存，同日 API 快照执行 upsert。
- batch 只提交一次账本 mutation；mapping signature、`ledgerEpoch`、Repository generation 和 unmount 使旧响应失效。
- `priceSelectionService.selectPriceAsOf(...)` 成为唯一 selector：自动模式同日 Binance 优先，手动模式手动价格优先，失败时保留旧价且不写 `0`。
- 定向与全量结果：37 个测试文件、330 项测试；lint、build、diff-check 通过。
- 源码提交：`375a96f 功能：接入Binance行情与统一价格选择`。

判定：通过。

## Gate 3：共享重放与纯派生

- 当前持仓与历史曲线统一复用 `positionReplay` 的 DCA、卖出、剩余成本和已实现盈亏规则。
- 持仓表、饼图和曲线全部复用 Gate 2 selector；未建立第二套价格选择算法。
- `chartDataService` 输出当前分配、1/7/30/365/全部阶梯曲线和最近 365 天热力数据。
- 历史点只读取该点当时已发生的交易与价格；缺价断开，成本连续，不泄漏未来事实。
- 热力等级按最大日笔数比率生成 level 0-4；全部结果只在内存派生。
- 定向与全量结果：38 个测试文件、343 项测试；lint、build、diff-check 通过。
- 源码提交：`dfa75a0 功能：建立三图共享重放与派生服务`。

判定：通过。

## Gate 4：ECharts 与页面骨架

- 引入 Apache ECharts Canvas；`EChart` 是唯一 React 生命周期适配层，使用完整 option 替换、事件解绑/重绑、`ResizeObserver` 和 dispose。
- 删除空侧栏、假导航、假筛选、占位图与开发阶段英文标签；保留访问门禁、保存错误/retry、导入导出和 clear 主链。
- 页面顺序固定为状态、总览、三图、持仓、交易与数据管理。
- 数据到空数据、365 点到 1 点、事件与卸载生命周期均有自动化。
- 定向与全量结果：39 个测试文件、348 项测试；lint、build、diff-check 通过。
- 源码提交：`247eb8e 界面：建立ECharts适配与单页总览骨架`。

判定：通过。

## Gate 5：三图与交互

- 完成当前 USD 等值持仓市值饼图、总市值/持仓成本阶梯曲线和 365 天交易热力图。
- 区间支持 1 日、7 日、30 日、365 日、全部；1 日使用双边界并明确“无可靠日内变化”。
- 全缺价不画误导性饼图；部分缺价列出未估值资产；曲线输出真实缺口。
- 热力日期点击过滤交易列表，再次点击取消，另有清除筛选；import/clear 通过 `ledgerEpoch` 重置。
- 价格来源、as-of、USD/USDT 近似与降级状态在页面可见。
- 定向与全量结果：41 个测试文件、355 项测试；lint、build、diff-check 通过。
- 源码提交：`28eb0fe 功能：完成三张账本图表与日期筛选交互`。

判定：通过。

## Gate 6：持久化、安全与恢复

- 映射、API/manual provenance 和价格快照进入既有 V2 AES-GCM 整账保存链；V2 原始 envelope 不出现账本、映射或价格明文。
- `BackupEnvelopeV1` 保留资产、交易、价格、费用、映射和 provenance；明确排除 Position、分配切片、曲线点、热力等级、估值模式与选中日期。
- 损坏、未来和非 USD/USDT strict import 拒绝时，页面账本和 IndexedDB 密文均保持不变。
- 自动化覆盖请求中普通事实合并，以及 mapping、replace、clear、unmount、Repository 变化后的 stale response 丢弃。
- 自动化覆盖 legacy future 救援导出与纠正模式；这是旧数据兼容测试，不伪造为 production UI 已有 legacy 数据。
- 定向与全量结果：41 个测试文件、362 项测试；lint、build、diff-check 通过。
- 源码提交：`45f2359 测试：完成行情持久化与恢复安全回归`。

判定：通过。

## Gate 7：production 与最终质量 Gate

### 最终命令

| 命令 | 结果 |
| --- | --- |
| `npm test` | 41 个测试文件、362 项测试通过；3 条既有 jsdom 下载导航提示，退出码 0 |
| `npm run lint` | 无 ESLint warning / error |
| `npm run build` | Next.js 14.2.35 production build compiled successfully，5 个静态页面生成成功 |
| `git diff --check` | 源码与外层仓库均通过 |
| 禁止范围扫描 | 未发现 Kline/OHLC、WebSocket、轮询、私有 API、API key、订单、dataZoom、动画或派生字段持久化 |

### production 主链

production build 使用一份新建加密账本完成以下真实操作：

1. 新建 BTC 买入 1 @ 60000、ETH 买入 2 @ 2000、ADA 买入 1000 @ 0.5、ADA 卖出 100 @ 0.55，共 4 笔事实。
2. 刷新前全缺价状态明确列出 `ADA、BTC、ETH`；饼图不伪造，曲线输出缺口，热力图显示 365 天与 4 笔交易。
3. 真实 Binance 刷新成功 3 项、失败 0 项：BTC `64048.66000000`、ETH `1858.83000000`、ADA `0.16310000`，as-of `2026-07-25T06:09:02.779Z`。
4. 同日新增手动 BTC `70000`：自动模式仍选择 Binance `64048.66`；手动模式选择 `70000`，ETH/ADA 继续回退到 Binance；持仓和饼图同步。
5. 区间切换实测：1 日 2 点并显示日内免责声明；7 日 7 点/3 个估值点；30 日 30 点/26 个估值点；365 日 365 点/361 个估值点；全部 5 点/1 个估值点，其余均保留真实缺口。
6. 热力图点击 `2026-01-16` 后交易列表按日期筛选；再次点击恢复 4 笔交易。
7. 导出文件为 `local-first-trading-ledger-backup-v1-20260725-061148Z.json`，UI 明确提示明文；检查结果为 3 资产、4 交易、4 价格、3 个映射、3 条 API 与 1 条 manual provenance，且不含任何派生/会话字段。
8. clear 后交易、持仓、三图与日期筛选清空；不刷新导入后恢复 4 笔交易、3 项持仓、映射、provenance 和三图。
9. 刷新并重新解锁后事实完整，解锁自动刷新再次成功；新 as-of 为 `2026-07-25T06:14:27.548Z`。
10. `2099-01-01` 新交易在 UI 被拒绝，页面仍为 4 笔交易。
11. 额外真实文件分别验证单资产和部分缺价；部分缺价明确显示“未估值资产：ETH”，本地账本保持可操作。
12. 受控极端热力/清仓文件包含 11 笔交易，其中 `2026-07-10` 为 8 笔，其他活跃日为 1 笔；production 图显示完整月份、星期和“无交易/低/较低/较高/最高”五档图例。BTC 在 `2026-07-12` 全量清仓后当前数量为 0、已实现盈亏为 80，全部区间的阶梯线仍保留清仓前历史并在清仓日从成本 1000 降至 200。
13. 删除 ADA 映射后刷新，BTC/ETH 更新为新 as-of，ADA 继续使用删除前旧 API 价且页面明确提示“历史 API 价格仍保留”；交易与图表仍可操作。随后导回原始备份，恢复 4 笔交易、3 项持仓和三项默认映射。

### 响应式与控制台

- 首次 390×844 验收发现 ECharts canvas 把页面撑到 1199px；修复容器 `min-width/max-width/overflow` 后重建复验，页面 `scrollWidth = 390`，图表 274px，宽表只在各自容器内滚动。
- 1280px 复验页面 `scrollWidth = 1280`，图表 1124px，无页面溢出。
- production 控制台最终为 0 warning、0 error。
- 响应式修复提交：`06cef3b 修复：避免移动端图表撑宽页面`。
- 源码说明提交：`fd5391e 文档：更新第十周三图与行情说明`。

### 外部限制与证据边界

- 本次真实 Binance 成功，不伪造为“外部永远可用”；没有通过关闭整机网络或改写固定 endpoint 人为制造超时。超时、429/418、500、network error 与逐资产失败由 mock/contract 测试锁定；production 以全缺价/部分缺价文件及删除 ADA 映射后的旧 API 价保留证明降级表达与本地可用性。
- legacy future 事实不能通过当前合法 UI 构造；其受限纠正模式由 policy、hook 和 Dashboard 自动化证明。
- stale response 与并发本地写入属于竞态合同，由确定性测试覆盖，不用不可控真实网络伪造。
- 安装 ECharts 后 npm 摘要报告 7 个 high 漏洞；在线 advisory 查询未获授权，未绕过权限、未执行 `npm audit fix`，留给用户单独审查。

判定：通过。

## Git 证据

源码功能分支提交：

```text
bdc7a84 功能：完成第十周日期与兼容边界
375a96f 功能：接入Binance行情与统一价格选择
dfa75a0 功能：建立三图共享重放与派生服务
247eb8e 界面：建立ECharts适配与单页总览骨架
28eb0fe 功能：完成三张账本图表与日期筛选交互
45f2359 测试：完成行情持久化与恢复安全回归
06cef3b 修复：避免移动端图表撑宽页面
fd5391e 文档：更新第十周三图与行情说明
```

- Gate 0 外层文档提交：`f52c628 文档：完成第十周Gate 0范围纠偏`。
- Gate 7 外层文档提交：`6b2fc84 文档：完成第十周Gate 7验收收口`，不与源码仓库混用。
- 收口时源码仓库位于未合并的 `zhennn/week10-charts-binance`；两个仓库工作树干净。
- 全程未 push、未 merge、未 rebase。

## 固定安全边界

- 保持 `LedgerData.schemaVersion === 1`。
- 不用成交价、成本、未来价格或 `0` 伪造市场价格。
- 未来事实按纠正模式隔离。
- Binance 失败安全降级。
- 图表派生数据不进入 reducer、IndexedDB 或备份。
- 不 push、不 merge、不 rebase。
