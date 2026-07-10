# Week 8 Checklist

时间：2026-07-31 至 2026-08-06

主题：完整账本导入导出

详细执行：[[00-Week8每日执行清单]]

---

## 总览

| 日期 | 唯一主任务 | 状态 |
| --- | --- | --- |
| 7月31日 | Day 1：定义 backup envelope 与校验规则 | 未开始 |
| 8月1日 | Day 2：完成导出垂直切片 | 未开始 |
| 8月2日 | Day 3：实现纯解析与完整校验 | 未开始 |
| 8月3日 | Day 4：实现原子替换 | 未开始 |
| 8月4日 | Day 5：接通导入 UI | 未开始 |
| 8月5日 | Day 6：round-trip 与 rollback 验收 | 未开始 |
| 8月6日 | Day 7：休息 | 未开始 |

---

## 前置 Gate

- [ ] Week 7 hydration 防覆盖通过
- [ ] whole-blob round-trip 通过
- [ ] 写失败保留旧数据
- [ ] test / lint / build 通过

## Day 1：Envelope

- [ ] 版本化 envelope
- [ ] 完整 `LedgerData` 校验规则
- [ ] ID / 引用 / DecimalString 规则
- [ ] 未知版本拒绝

## Day 2：导出

- [ ] 读取完整账本
- [ ] 规范化序列化
- [ ] Blob 下载
- [ ] 明文警告

## Day 3：解析校验

- [ ] 合法文件通过
- [ ] 坏 JSON 拒绝
- [ ] 缺字段 / 重复 ID / 未知资产拒绝
- [ ] 不写 repository

## Day 4：原子替换

- [ ] repository 整账 replace
- [ ] 成功后才替换 React state
- [ ] 失败保留旧数据和旧 state
- [ ] replace 期间避免自动保存竞态

## Day 5：导入 UI

- [ ] 文件选择
- [ ] 覆盖确认
- [ ] 结构化错误展示
- [ ] 成功后真实页面更新

## Day 6：往返验收

- [ ] 导出 -> 清空 -> 导入 -> 刷新
- [ ] 逐字段一致
- [ ] 规范化后二次导出字节一致
- [ ] 坏文件零写入
- [ ] 写失败 rollback
- [ ] test / lint / build 通过

## Day 7：休息

- [ ] 不开发
- [ ] 不挪用

---

## Week 8 通过线

- [ ] 完整账本校验
- [ ] 原子替换
- [ ] round-trip
- [ ] rollback
- [ ] 刷新仍在
- [ ] test / lint / build 通过

## Week 8 不做

- [ ] 不做 CSV
- [ ] 不做合并导入
- [ ] 不做加密备份
- [ ] 不做云备份
- [ ] 不做 UI 美化

## Week 9 Go / No-Go

- [ ] 全部通过：Week 9 可以开始加密
- [ ] 任一失败：Week 9 Day 1 继续补备份欠账
