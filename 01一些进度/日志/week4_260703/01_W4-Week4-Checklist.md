# Week 4 Checklist

时间：2026-07-03 至 2026-07-09

主题：数据存得住（IndexedDB 持久化）

---

## 总览

| 日期 | 任务 | 状态 |
| --- | --- | --- |
| 7月3日 | Day 1：学 IndexedDB、定方案 | 未开始 |
| 7月4日 | Day 2：写 IndexedDB 存取工 | 未开始 |
| 7月5日 | Day 3：写账本总管 + 组装点 | 未开始 |
| 7月6日 | Day 4：把页面切换到走保存层 | 未开始 |
| 7月7日 | Day 5：验收持久化 | 未开始 |
| 7月8日 | Day 6：写日志、整理下周 | 未开始 |
| 7月9日 | Day 7：休息与轻复盘 | 未开始 |

---

## Day 1：学 IndexedDB、定方案

- [ ] 学 IndexedDB（db/objectStore/事务/异步）
- [ ] 用 idb 库降低异步复杂度
- [ ] 定第一版 whole-blob 整坨读写

## Day 2：写 IndexedDB 存取工

- [ ] 实现 indexedDbStorageAdapter 的 read/write
- [ ] 空库返回默认空结构不崩

## Day 3：写账本总管 + 组装点

- [ ] 实现 ledgerRepository（保存/读取/清空）
- [ ] 建组装点工厂：Noop 加密 + IndexedDB adapter

## Day 4：把页面切换到走保存层

- [ ] 启动时从 repository 读、变更后写
- [ ] 页面/service 不直接碰 IndexedDB

## Day 5：验收持久化

- [ ] 加交易→刷新→数据还在
- [ ] clearAll 后变空
- [ ] DevTools Application 面板看到数据

## Day 6：写日志、整理下周

- [ ] 写存储架构日志（进论文 Implementation）
- [ ] 整理 Week 5 任务

## Day 7：休息与轻复盘

- [ ] 看一遍保存层代码
- [ ] 记录新问题
