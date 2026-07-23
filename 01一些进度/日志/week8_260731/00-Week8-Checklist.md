# Week 8 Checklist

时间：2026-07-31 至 2026-08-06

主题：完整账本导入导出

详细执行：[[00-Week8每日执行清单]]

> 入口更新（2026-07-23）：Week 7 Storage Gate、S-07、production G-01 / G-02 已关闭。
> Week 8 无 P0；P1-02 精确 8 MiB 自动化 Gate 已关闭。P1-01 仍未关闭：受控 production 实际文件主链虽已取得通过记录，但 Chrome 最终回导出现“成功提示但页面为空”的待复核现象，且 direct record / recovery / rejection 证据不完整。源码仍在本地分支，Week 8 为 No-Go，Week 9 不开始。

---

## 总览

| 日期 | 唯一主任务 | 状态 |
| --- | --- | --- |
| 单日压缩 | Day 1：定义 backup envelope 与校验规则 | 已完成 |
| 单日压缩 | Day 2：完成导出垂直切片 | 已完成 |
| 单日压缩 | Day 3：实现纯解析与完整校验 | 已完成 |
| 单日压缩 | Day 4：实现原子替换 | 已完成 |
| 单日压缩 | Day 5：接通导入 UI | 已完成 |
| 单日压缩 | Day 6：round-trip 与 rollback 验收 | 已完成 |
| 不适用 | Day 7：休息 | 不适用 |

---

## 前置 Gate

- [x] Week 7 hydration 防覆盖通过
- [x] whole-blob round-trip 通过
- [x] 写失败保留旧数据，并可安全重试
- [x] dirty 账本离开与 Repository 切换保护通过
- [x] test / lint / build / diff-check 通过
- [x] S-07 资源阈值与 ResourcePolicy 通过
- [x] G-01 production `ledger:v1` envelope 直接读取通过
- [x] G-02 production clear 后 record 不存在直接读取通过

## Day 1：Envelope

- [x] 版本化 envelope
- [x] 完整 `LedgerData` 校验规则
- [x] ID / 引用 / DecimalString 规则
- [x] 未知版本拒绝

## Day 2：导出

- [x] 验证并冻结点击瞬间页面完整账本快照
- [x] 不从 Repository 二次读取覆盖快照
- [x] ready / pending / error / clearing 导出边界正确
- [x] 规范化序列化
- [x] Blob 下载
- [x] 明文警告

## Day 3：解析校验

- [x] 合法文件通过
- [x] 坏 JSON 拒绝
- [x] 缺字段 / 重复 ID / 未知资产拒绝
- [x] 不写 repository

## Day 4：原子替换

- [x] 既有 repository 整账 save 作为原子 replace
- [x] 成功后才替换 React state
- [x] 失败保留旧数据和旧 state
- [x] replace 期间避免自动保存竞态

## Day 5：导入 UI

- [x] 文件选择
- [x] 覆盖确认
- [x] 结构化错误展示
- [x] 成功后真实页面更新

## Day 6：往返验收

- [x] 导出 -> 清空 -> 导入 -> 刷新
- [x] 逐字段一致
- [x] 规范化后二次导出字节一致
- [x] 坏文件零写入
- [x] 写失败 rollback
- [x] test / lint / build 通过
- [ ] production 真实导出文件、record、recovery 与拒绝场景证据
- [x] 合法备份实际内容精确 8 MiB / `+1 byte` 自动化 Gate
- [x] 23 个测试文件、239 项测试通过
- [x] 受控 production 实际文件：导出 -> clear -> 回导 -> 二次导出主链通过
- [ ] production 完整 fixture / hydration recovery / 五类拒绝的 record 前后证据；Chrome 回导待复核现象已定位并复验

## Day 7：休息

- [ ] 不开发
- [ ] 不挪用

---

## Week 8 通过线

- [x] 完整账本校验
- [x] 原子替换
- [x] round-trip
- [x] rollback
- [x] 刷新仍在
- [x] test / lint / build 通过
- [ ] `02A` 剩余 production P1 关闭

## Week 8 不做

- [ ] 不做 CSV
- [ ] 不做合并导入
- [ ] 不做加密备份
- [ ] 不做云备份
- [ ] 不做 UI 美化

## Week 9 Go / No-Go

- [ ] 独立终审通过并合并后：Week 9 可以开始加密
- [x] 当前状态：P1-01 未关闭，Week 8 No-Go，Week 9 暂不开始
