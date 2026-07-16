# Week 7 Checklist

时间：2026-07-24 至 2026-07-30

主题：IndexedDB whole-blob 持久化

详细执行：[[00-Week7每日执行清单]]

> 提前实施说明（2026-07-16）：为关闭 07A 风险，Day 1-5 和 Day 6 的自动化
> 地基已在功能分支提前完成；浏览器人工刷新/clear 验收仍未完成。

---

## 总览

| 日期 | 唯一主任务 | 状态 |
| --- | --- | --- |
| 7月24日 | Day 1：锁定持久化与 hydration 契约 | 已提前完成 |
| 7月25日 | Day 2：实现 IndexedDB StorageAdapter | 已提前完成 |
| 7月26日 | Day 3：实现 ledgerRepository | 已提前完成 |
| 7月27日 | Day 4：实现 Noop 加密与组装点 | 已提前完成 |
| 7月28日 | Day 5：页面启动时安全 hydrate | 已提前完成 |
| 7月29日 | Day 6：guarded write 与持久化验收 | 自动化完成，人工验收待定 |
| 7月30日 | Day 7：休息 | 未开始 |

---

## 前置 Gate

- [ ] Week 6 Gate 2-5 全绿
- [ ] golden / 价格 / 超卖通过
- [x] test / lint / build 通过

## Day 1：契约

- [x] StorageAdapter 接口
- [x] EncryptionService 接口
- [x] repository 接口
- [x] hydration loading / ready / error
- [x] ready 前禁止写
- [x] 写入顺序与失败规则

## Day 2：StorageAdapter

- [x] whole-blob read
- [x] whole-blob write
- [x] clear
- [x] 空库与失败测试

## Day 3：Repository

- [x] load / save / clear
- [x] 完整 `LedgerData` 运行时校验
- [x] 统一错误
- [x] repository 测试

## Day 4：Noop 与组装点

- [x] Noop EncryptionService
- [x] 唯一组装点
- [x] 上层不依赖具体 adapter

## Day 5：Hydration

- [x] loading 状态
- [x] 已有数据整账恢复
- [x] 空库初始状态
- [x] 读取失败不写入

## Day 6：Guarded write

- [x] ready 后才保存
- [x] 快速连续写顺序正确
- [x] 写失败保留旧数据
- [ ] 新增 / 删除 / 价格 / clear 刷新通过
- [x] test / lint / build 通过

## Day 7：休息

- [ ] 不开发
- [ ] 不挪用

---

## Week 7 通过线

- [x] hydration 防覆盖通过
- [x] whole-blob round-trip 通过
- [x] 快速连续写通过
- [x] 失败不破坏旧数据
- [x] 上层无 IndexedDB API
- [x] test / lint / build 通过

## Week 7 不做

- [x] 不用 localStorage
- [x] 不做导入导出
- [x] 不做真加密
- [x] 不做分片存储
- [x] 不保存 `Position[]`

## Week 8 Go / No-Go

- [ ] 全部通过：Week 8 可以开始导入导出
- [ ] 任一失败：Week 8 Day 1 继续补持久化欠账
