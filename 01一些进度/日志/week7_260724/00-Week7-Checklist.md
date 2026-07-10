# Week 7 Checklist

时间：2026-07-24 至 2026-07-30

主题：IndexedDB whole-blob 持久化

详细执行：[[00-Week7每日执行清单]]

---

## 总览

| 日期 | 唯一主任务 | 状态 |
| --- | --- | --- |
| 7月24日 | Day 1：锁定持久化与 hydration 契约 | 未开始 |
| 7月25日 | Day 2：实现 IndexedDB StorageAdapter | 未开始 |
| 7月26日 | Day 3：实现 ledgerRepository | 未开始 |
| 7月27日 | Day 4：实现 Noop 加密与组装点 | 未开始 |
| 7月28日 | Day 5：页面启动时安全 hydrate | 未开始 |
| 7月29日 | Day 6：guarded write 与持久化验收 | 未开始 |
| 7月30日 | Day 7：休息 | 未开始 |

---

## 前置 Gate

- [ ] Week 6 Gate 2-5 全绿
- [ ] golden / 价格 / 超卖通过
- [ ] test / lint / build 通过

## Day 1：契约

- [ ] StorageAdapter 接口
- [ ] EncryptionService 接口
- [ ] repository 接口
- [ ] hydration loading / ready / error
- [ ] ready 前禁止写
- [ ] 写入顺序与失败规则

## Day 2：StorageAdapter

- [ ] whole-blob read
- [ ] whole-blob write
- [ ] clear
- [ ] 空库与失败测试

## Day 3：Repository

- [ ] load / save / clear
- [ ] schemaVersion 检查
- [ ] 统一错误
- [ ] repository 测试

## Day 4：Noop 与组装点

- [ ] Noop EncryptionService
- [ ] 唯一组装点
- [ ] 上层不依赖具体 adapter

## Day 5：Hydration

- [ ] loading 状态
- [ ] 已有数据整账恢复
- [ ] 空库初始状态
- [ ] 读取失败不写入

## Day 6：Guarded write

- [ ] ready 后才保存
- [ ] 快速连续写顺序正确
- [ ] 写失败保留旧数据
- [ ] 新增 / 删除 / 价格 / clear 刷新通过
- [ ] test / lint / build 通过

## Day 7：休息

- [ ] 不开发
- [ ] 不挪用

---

## Week 7 通过线

- [ ] hydration 防覆盖通过
- [ ] whole-blob round-trip 通过
- [ ] 快速连续写通过
- [ ] 失败不破坏旧数据
- [ ] 上层无 IndexedDB API
- [ ] test / lint / build 通过

## Week 7 不做

- [ ] 不用 localStorage
- [ ] 不做导入导出
- [ ] 不做真加密
- [ ] 不做分片存储
- [ ] 不保存 `Position[]`

## Week 8 Go / No-Go

- [ ] 全部通过：Week 8 可以开始导入导出
- [ ] 任一失败：Week 8 Day 1 继续补持久化欠账
