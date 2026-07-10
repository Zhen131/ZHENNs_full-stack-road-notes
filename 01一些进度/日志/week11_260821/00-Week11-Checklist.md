# Week 11 Checklist

时间：2026-08-21 至 2026-08-27

主题：benchmark 协议、harness 与 pilot

详细执行：[[00-Week11每日执行清单]]

---

## 总览

| 日期 | 唯一主任务 | 状态 |
| --- | --- | --- |
| 8月21日 | Day 1：冻结 benchmark 协议 | 未开始 |
| 8月22日 | Day 2：固定种子生成器 | 未开始 |
| 8月23日 | Day 3：Playwright harness | 未开始 |
| 8月24日 | Day 4：写入与查询指标 | 未开始 |
| 8月25日 | Day 5：P&L 与冷启动指标 | 未开始 |
| 8月26日 | Day 6：三量级 pilot | 未开始 |
| 8月27日 | Day 7：休息 | 未开始 |

---

## 前置 Gate

- [ ] 两张图表通过
- [ ] 核心功能全绿
- [ ] 硬离线通过
- [ ] test / lint / build 通过

## Day 1：协议

- [ ] 100 / 1k / 10k 基础量级
- [ ] write / query / P&L / cold-start
- [ ] 数据预置与计时边界
- [ ] warm-up / run / median / IQR
- [ ] pilot 3 次、final 10 次

## Day 2：生成器

- [ ] 固定 seed
- [ ] 合法 buy / sell
- [ ] 不超卖
- [ ] 确定时间、手续费和价格
- [ ] 可复现测试

## Day 3：Harness

- [ ] production build
- [ ] 干净浏览器环境
- [ ] 一条命令
- [ ] 原始 JSON/CSV
- [ ] 失败与环境记录

## Day 4：写入/查询

- [ ] 真实加密 whole-blob 写
- [ ] 固定查询语义
- [ ] 正确性断言
- [ ] 一致起点

## Day 5：P&L/冷启动

- [ ] 复用 Calculator
- [ ] P&L 正确性
- [ ] KDF / 解密 / hydrate / ready
- [ ] 明确起止事件

## Day 6：Pilot

- [ ] 三量级
- [ ] 四指标
- [ ] 每配置 3 次
- [ ] 原始数据和环境
- [ ] 协议稳定性检查
- [ ] test / lint / build 通过

## Day 7：休息

- [ ] 不开发
- [ ] 不挪用

---

## Week 11 通过线

- [ ] protocol 冻结
- [ ] generator 可复现
- [ ] harness 自动化
- [ ] 四类指标正确
- [ ] pilot 完成
- [ ] 原始数据可追溯
- [ ] test / lint / build 通过

## Week 11 不做

- [ ] 不强制 100k
- [ ] 不跑 final
- [ ] 不改协议迎合结果
- [ ] 不先优化
- [ ] 不开发 UI

## Week 12 Go / No-Go

- [ ] 全部通过：Week 12 可以进入论文证据与 release gate
- [ ] 任一失败：Week 12 Day 1 先修 benchmark 欠账
