# Week 7 Checklist

时间：2026-07-24 至 2026-07-30

主题：IndexedDB whole-blob 持久化

详细执行：[[00-Week7每日执行清单]]

> 提前实施说明（2026-07-16）：为关闭 07A 风险，Day 1-5 和 Day 6 的自动化
> 地基已在功能分支提前完成；浏览器人工刷新/clear 验收仍未完成。

> 前置 Gate 更新（2026-07-17）：Week 6 React Gate 已 Go。Week 7 只补真实
> 浏览器刷新、clear、envelope 与失败场景，不重写持久化地基。

> 执行结果（2026-07-18）：安全 clear、故障注入、固定数据刷新与 clear 主链、
> test / lint / build 已通过；production DevTools envelope 与 clear 后 record
> 未取得直接读取证据。Storage Gate 严格判定 No-Go，Week 8 不得开始。

> 补漏更新（2026-07-21）：S-01 / S-02 / S-03 与 S-07 已完成，20 个测试文件、195 项测试通过，
> 并通过 `529983e` 进入、推送源码 `main`。D-08 / D-09 文档契约已同步；
> production G-01 / G-02 仍未关闭。

---

## 总览

| 日期 | 唯一主任务 | 状态 |
| --- | --- | --- |
| 7月24日 | Day 1：锁定持久化与 hydration 契约 | 已提前完成 |
| 7月25日 | Day 2：实现 IndexedDB StorageAdapter | 已提前完成 |
| 7月26日 | Day 3：实现 ledgerRepository | 已提前完成 |
| 7月27日 | Day 4：实现 Noop 加密与组装点 | 已提前完成 |
| 7月28日 | Day 5：页面启动时安全 hydrate | 已提前完成 |
| 7月29日 | Day 6：guarded write 与持久化验收 | 主链通过；envelope 证据未通过 |
| 7月30日 | Day 7：休息 | 未开始 |

---

## 前置 Gate

- [x] Week 6 Gate 2-5 全绿
- [x] golden / 价格 / 超卖通过
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
- [x] 新增 / 删除 / 价格 / clear 刷新通过
- [x] test / lint / build 通过
- [x] load / save / clear 确定性故障注入通过
- [x] clear 后不自动保存初始账本；首次新写入可恢复
- [ ] production DevTools envelope 与 clear 后 record 直接读取通过

## Day 7：休息

- [ ] 不开发
- [ ] 不挪用

## Gap 补漏与 Week 8 衔接

- [x] S-01 保存文案与真实持久化状态一致
- [x] S-02 save 失败可安全重试最新账本
- [x] S-03 dirty 账本离开与 Repository 切换受保护
- [x] D-08 Week 8 入口已写入 G-01 / G-02 阻断条件
- [x] D-09 导出数据真相源已锁定为点击瞬间页面快照
- [x] S-07 资源阈值确认与 ResourcePolicy 实现

---

## Week 7 通过线

- [x] hydration 防覆盖通过
- [x] whole-blob round-trip 通过
- [x] 快速连续写通过
- [x] 失败不破坏旧数据
- [x] 上层无 IndexedDB API
- [x] test / lint / build 通过
- [x] 单标签页与 Noop 明文限制已记录
- [ ] production envelope / clear record 人工证据通过

## Week 7 不做

- [x] 不用 localStorage
- [x] 不做导入导出
- [x] 不做真加密
- [x] 不做分片存储
- [x] 不保存 `Position[]`

## Week 8 Go / No-Go

- [ ] 全部通过：Week 8 可以开始导入导出
- [x] 任一失败：Week 8 Day 1 继续补持久化欠账

结论：**Week 7 Storage Gate: No-Go**。正式 Gate 的未通过项是 production DevTools
IndexedDB envelope 与 clear 后 record 直接证据；自动化 fake IndexedDB 不能替代。
当前唯一未关闭项是 production G-01 / G-02 直接 record 证据。
