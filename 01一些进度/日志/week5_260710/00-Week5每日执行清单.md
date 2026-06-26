# Week 5 每日执行清单

时间：2026-07-10 至 2026-07-16  
主题：数据存得住（IndexedDB 持久化）

> 让数据刷新后还在。按 Week1 保存层设计实现 Repository → StorageAdapter，存储后端直接用 IndexedDB，加密层先用 Noop 占位。这是论文"typed repository layer over IndexedDB"的落地。
> 起点：Week1 已设计好接口与"组装点一行切换实现"的思路（见 week1 文件夹《05B_W1-保存层设计说明》）。

---

## Day 1：7月10日，学 IndexedDB、定方案

今天只做一件事：搞懂 IndexedDB 基本模型，定第一版读写策略。

要做：

- 学 IndexedDB：database / objectStore / 事务 / 异步
- 建议用轻量封装库 `idb` 降低异步复杂度
- 规划第一版"整坨 LedgerData 读写"（whole-blob）

产出：

- IndexedDB 学习笔记 + 方案决定

完成标准：

- 能说清为什么第一版先整坨读写、未来再分片

---

## Day 2：7月11日，写 IndexedDB 存取工

今天只做一件事：实现 storage adapter 的读和写。

要做：

- 实现 `adapters/indexedDbStorageAdapter.ts`
- read() 返回整个 LedgerData（空库返回默认空结构、不崩）
- write(data) 整坨写回

产出：

- indexedDbStorageAdapter

完成标准：

- 能把一个 LedgerData 写进去再读回来，内容一致

---

## Day 3：7月12日，写账本总管 + 组装点

今天只做一件事：实现 Repository，并在一个组装点拼好实现。

要做：

- 实现 `repositories/ledgerRepository.ts`：getLedgerData / listTrades / saveTrade / savePriceSnapshot / clearAll
- 内部全部翻译成 adapter 的 read / write
- 建组装点工厂：Noop 加密 + IndexedDB adapter + repository

产出：

- ledgerRepository
- noopEncryptionService
- 组装点工厂

完成标准：

- 上层只拿到 repository 接口，不知道底层是 IndexedDB

---

## Day 4：7月13日，把页面切换到走保存层

今天只做一件事：让页面启动读、变更写，全走 repository。

要做：

- 启动时从 repository 读，每次变更后写
- 页面 / service 仍然不直接碰 IndexedDB

产出：

- 接上持久化的应用

完成标准：

- 加交易后数据进了 IndexedDB

---

## Day 5：7月14日，验收持久化

今天只做一件事：确认刷新后数据还在。

要做：

- 加几笔交易 → 刷新 → 数据还在
- clearAll 后变空
- 用浏览器 DevTools 的 Application 面板看到 IndexedDB 里有数据
- 修 bug

产出：

- 持久化验收记录

完成标准：

- 刷新页面数据仍在；交易 / 统计结果与持久化前一致

---

## Day 6：7月15日，写日志、整理下周

今天只做一件事：沉淀存储架构素材。

要做：

- 写日志：保存层三件套如何分工、为什么页面碰不到存储、换存储为什么只改组装点一行
- 整理 Week 6 任务

产出：

- Week 5 日志（进论文 Implementation 存储架构）

完成标准：

- 能讲清"换存储只改一行"的依赖倒置思路

---

## Day 7：7月16日，休息与轻复盘

今天不做重开发。

允许做：

- 看一遍保存层代码
- 记录新问题

不做：

- 不开新功能
- 不临时改 Week 6 目标

---

## 本周产出物

- indexedDbStorageAdapter、ledgerRepository、noopEncryptionService、组装点工厂
- 接上持久化的可用应用

## 验收标准

- 刷新页面数据仍在
- 页面和 service 没有任何一行直接操作 IndexedDB
- 交易 / 统计结果与持久化前一致

## 论文素材点

- 可替换存储层的接口设计、whole-blob 第一版策略及未来分片优化路线 → 论文 Implementation

## 落后时可砍

- 本周是论文硬需求，不可砍
- 若 IndexedDB 卡壳，缩小 IndexedDB 实现范围，只保留 whole-blob 读写和最小 repository；必要时保留 W4 内存态演示，但不把 localStorage 纳入正式路线
