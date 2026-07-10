# Week 13 Checklist

时间：2026-09-04 至 2026-09-10
主题：final benchmark + 暑期版本冻结

> 结论：原 Agent 周取消。Week 13 只对 Week 12 全绿的单一候选版本运行 final benchmark，并用可复现证据完成暑期冻结。

---

## 本周 Gate

```text
Week 12 P0 全绿
  -> 锁定 candidate hash
  -> final 原始数据
  -> 质检与 median/IQR
  -> Evaluation Results
  -> 干净环境验收
  -> 暑期版本冻结
```

---

## 总览

| 日期 | 唯一主任务 | 状态 |
| --- | --- | --- |
| 9月4日 | Day 1：锁定 release candidate | 未开始 |
| 9月5日 | Day 2：运行 final benchmark | 未开始 |
| 9月6日 | Day 3：完成 final 数据质检与统计 | 未开始 |
| 9月7日 | Day 4：写 Evaluation Results | 未开始 |
| 9月8日 | Day 5：完成最终可复现验收 | 未开始 |
| 9月9日 | Day 6：冻结暑期版本 | 未开始 |
| 9月10日 | Day 7：休息 | 未开始 |

---

## Day 1：Release Candidate

- [ ] 测试、lint、build 与 Week 12 Gate 全绿
- [ ] 候选 hash、锁文件和完整环境已记录
- [ ] 协议、命令、种子和结果目录固定
- [ ] 检查失败时未锁定、未运行 final

## Day 2：Final Benchmark

- [ ] 100 / 1k / 10k 三个硬量级完成
- [ ] 四类指标全部完成
- [ ] 每个组合独立重复 10 次
- [ ] 原始数据、失败记录和环境元数据完整保留
- [ ] 未把预置时间混入指标，未挑选样本

## Day 3：数据质检与统计

- [ ] 只按预先规则判定无效运行
- [ ] 每组 median + IQR 已计算
- [ ] 汇总值可追溯到 10 次原始记录
- [ ] 补跑有技术理由且留有记录

## Day 4：Evaluation Results

- [ ] 结果、趋势、local-first 对照与限制写清
- [ ] 所有结论只来自 final 数据
- [ ] 100k、用户研究、同步、NLP、Agent 未伪装成已覆盖

## Day 5：可复现验收

- [ ] 干净环境可安装、运行、测试和 build
- [ ] README 可驱动最小 benchmark dry-run
- [ ] 固定五分钟路径只展示已实现功能
- [ ] 发现 P0 时已停止冻结流程

## Day 6：暑期版本冻结

- [ ] 所有证据指向同一候选 hash
- [ ] 已实现 / 未实现 / 延伸项清单完成
- [ ] P0 全绿后才创建冻结标记或 tag
- [ ] release note 完成

## Day 7：休息

- [ ] 不开发
- [ ] 不复盘、不补欠账、不挪用

---

## Week 13 通过线

- [ ] 单一候选版本通过全部 P0 Gate
- [ ] final 原始数据与统计完整、可追溯
- [ ] Evaluation 结论遵守实验边界
- [ ] 干净环境与演示路径可复现
- [ ] 暑期版本、范围清单和 release note 已冻结

任一项未通过：不得用旧数据补位，也不得创建冻结 tag。

---

## 本周不可做

- Agent / NLP。
- 第三张图、100k 硬要求、UI 美化冲刺。
- 候选 hash 改变后沿用旧 final 数据。
- 挑样本、隐藏失败或把计划功能写成成果。
