# Week 12 Checklist

时间：2026-08-28 至 2026-09-03
主题：论文证据整理 + P0 发布门

> 结论：原 NLP 周取消。Week 12 是 final benchmark 前的证据周与发布门；只要 P0 仍为红灯，就不得进入 Week 13 final run。

---

## 本周 Gate

```text
真实实现证据
  -> 评价方法冻结
  -> P0 全量回归
  -> 关闭 P0 阻塞项
  -> 干净环境可复现
  -> Week 13 候选版本
```

---

## 总览

| 日期 | 唯一主任务 | 状态 |
| --- | --- | --- |
| 8月28日 | Day 1：整理 System Design 证据 | 未开始 |
| 8月29日 | Day 2：整理 Implementation 证据 | 未开始 |
| 8月30日 | Day 3：整理 Evaluation 方法证据 | 未开始 |
| 8月31日 | Day 4：执行 P0 全量回归 | 未开始 |
| 9月1日 | Day 5：关闭 P0 发布阻塞项 | 未开始 |
| 9月2日 | Day 6：完成候选版本可复现审计 | 未开始 |
| 9月3日 | Day 7：休息与轻复盘 | 未开始 |

---

## Day 1：System Design

- [ ] 实际架构与数据流可回到源码/测试
- [ ] 已实现与未实现明确分开
- [ ] 未把 placeholder 写成成果

## Day 2：Implementation

- [ ] 核心 P0 形成实现—测试—验收映射
- [ ] 所有“已实现”表述都有证据
- [ ] NLP / Agent / 第三张图 / 100k 未进入核心成果

## Day 3：Evaluation Method

- [ ] 固定 100 / 1k / 10k、四类指标、10 次 final、median + IQR
- [ ] 数据预置与正式测量分离
- [ ] pilot、final、威胁模型与 local-first 边界写清

## Day 4：P0 全量回归

- [ ] 全部测试通过
- [ ] lint 通过
- [ ] production build 通过
- [ ] 持久化、备份恢复、加密、hard-offline、图表手动验收完成
- [ ] 问题按 P0 / P1 / P2 分级

## Day 5：P0 发布阻塞项

- [ ] 只处理 P0，不扩张范围
- [ ] 每个修复有相称复验
- [ ] P0 全部关闭，自动检查重新全绿

## Day 6：可复现审计

- [ ] 干净环境可按 README 启动、测试、build
- [ ] benchmark 最小 dry-run 可按文档完成
- [ ] Week 13 候选版本范围和限制已记录
- [ ] 未提前运行 final benchmark

## Day 7：休息

- [ ] 只轻复盘，不开发

---

## Week 12 通过线

- [ ] 论文表述与源码事实逐项可追溯
- [ ] benchmark 方法和工具可复现
- [ ] 自动检查全绿
- [ ] 核心手动验收全绿
- [ ] P0 阻塞项为零
- [ ] 候选版本可交给 Week 13 锁定

任一项未通过：Week 13 先补 Gate，不得跑 final benchmark。

---

## 本周不可做

- NLP / Agent。
- 第三张图或 100k 硬要求。
- UI 美化和非必要重构。
- 把旧方案、placeholder、pilot 写成当前实现或 final 结果。
