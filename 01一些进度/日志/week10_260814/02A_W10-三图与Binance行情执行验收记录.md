# 02A_W10：三图与 Binance 行情执行验收记录

更新时间：2026-07-25
状态：Gate 0 已取得证据；Gate 1-7 待执行
正式计划：[[01C_W10-三图与Binance行情执行计划]]

## 结论

Week 10 从真实干净基线进入专用功能分支。后续只按 Gate 顺序记录实际实现、测试、production 证据与提交；未取得证据的事项不得写成通过。

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

## Gate 1-7 记录

后续每个 Gate 在通过后追加：

- 实现范围与关键合同；
- 定向测试命令和数量；
- `git diff --check`；
- 两个仓库状态；
- 对应中文本地提交；
- 未通过项、外部限制或降级证据。

当前 Gate 1-7 均未开始，不提前勾选。

## 固定安全边界

- 保持 `LedgerData.schemaVersion === 1`。
- 不用成交价、成本、未来价格或 `0` 伪造市场价格。
- 未来事实按纠正模式隔离。
- Binance 失败安全降级。
- 图表派生数据不进入 reducer、IndexedDB 或备份。
- 不 push、不 merge、不 rebase。
