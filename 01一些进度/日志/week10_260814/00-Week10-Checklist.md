# Week 10 Checklist

状态：Gate 0 范围纠偏完成；Gate 1-7 未开始
主题：页面减法 + Binance 最新行情 + 统一估值 + 三张 ECharts 图
详细执行：[[00-Week10每日执行清单]]
正式计划：[[01C_W10-三图与Binance行情执行计划]]

## Gate 总览

| Gate | 唯一里程碑 | 状态 |
| --- | --- | --- |
| Gate 0 | 基线、专用分支、旧清单纠偏和验收记录 | 已完成 |
| Gate 1 | 日期、未来事实、币种与 schema v1 兼容 | 未开始 |
| Gate 2 | Binance 最新行情、批量保存和统一 selector | 未开始 |
| Gate 3 | 共享持仓重放与三图纯派生数据 | 未开始 |
| Gate 4 | ECharts 适配层、页面减法和总览骨架 | 未开始 |
| Gate 5 | 饼图、阶梯曲线、365 天热力图与筛选 | 未开始 |
| Gate 6 | 加密持久化、备份、清空和恢复安全回归 | 未开始 |
| Gate 7 | 全量质量 Gate、production 主链和文档收口 | 未开始 |

## Gate 0 证据

- [x] 源码基线：30 个测试文件、290 项测试通过。
- [x] lint：无 warning / error。
- [x] production build：Compiled successfully。
- [x] `git diff --check`：通过。
- [x] 源码分支：`zhennn/week10-charts-binance`。
- [x] 外层与源码仓库在执行前均无未提交修改。
- [x] Week 9 整机硬离线：**已取消、未验证、不再阻塞**。

## 必须通过

- [ ] 新事实和新导入不能包含未来交易或未来价格。
- [ ] 旧未来事实可救援并进入受限纠正模式。
- [ ] USD/USDT 按 `1 USDT ≈ 1 USD` 估值并常驻披露。
- [ ] Binance 不可用时不清旧价、不写 0、不阻塞本地账本。
- [ ] `priceSelectionService` 同时服务持仓表、饼图和曲线。
- [ ] 当前持仓与历史曲线复用同一重放规则。
- [ ] 饼图缺价不伪造；部分缺价和全缺价表达正确。
- [ ] 曲线为阶梯线，缺价断开，成本连续，历史无未来价格泄漏。
- [ ] 热力图固定 365 天，等级使用 max-ratio level 0-4。
- [ ] 图表派生数据和估值模式不进入账本、IndexedDB 或备份。
- [ ] 既有加密、保存、retry、导入、清空和恢复主链无回归。
- [ ] production 主链和真实降级证据完成。
- [ ] 全量 test、lint、build、diff-check 通过。

## 禁止范围

- [ ] 未引入 Binance 历史 Kline / OHLC / 历史回填。
- [ ] 未引入情景价格或未来价格模拟。
- [ ] 未引入轮询、WebSocket、自动重试或服务端代理。
- [ ] 未引入私有 API、API key、账户、订单或下单。
- [ ] 未引入 K 线、指标、dataZoom、动画、主题或复杂美化。
- [ ] 未引入 Position / 图表点 / 热力等级持久化。
- [ ] 未执行 push、merge 或 rebase。

## 最终 Git 通过线

- [ ] Gate 1-6 分别至少有一个范围单一的中文源码提交。
- [ ] Gate 0 和 Gate 7 分别有独立外层文档提交。
- [ ] 两个仓库最终 clean。
- [ ] 源码停留在未合并的 `zhennn/week10-charts-binance`。
