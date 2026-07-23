# Week 9 Checklist

时间：2026-08-07 至 2026-08-13

主题：PBKDF2 + AES-256-GCM 本地加密

详细执行：[[00-Week9每日执行清单]]

> 入口状态（2026-07-23）：Week 8 P1-01 尚未关闭，production 证据链与 Chrome 回导待复核现象未完成。Week 9 禁止开始；本清单仅保留为后续入口。

---

## 总览

| 日期 | 唯一主任务 | 状态 |
| --- | --- | --- |
| 8月7日 | Day 1：锁定威胁模型与密文 envelope | 未开始 |
| 8月8日 | Day 2：实现 PBKDF2 | 未开始 |
| 8月9日 | Day 3：实现 AES-256-GCM | 未开始 |
| 8月10日 | Day 4：明文迁移与密文集成 | 未开始 |
| 8月11日 | Day 5：解锁与锁定流程 | 未开始 |
| 8月12日 | Day 6：安全与硬离线验收 | 未开始 |
| 8月13日 | Day 7：休息 | 未开始 |

---

## 前置 Gate

- [x] 完整导入导出、原子替换与 rollback 自动化通过
- [x] 明文备份逃生口已实现
- [x] test / lint / build 已通过
- [ ] Week 8 P1-01 production evidence Gate 关闭，且 Chrome 回导待复核现象已复现定位或排除

## Day 1：威胁模型

- [ ] encryption at rest 边界
- [ ] cryptoVersion / KDF 参数 / salt / IV / ciphertext
- [ ] key 只驻会话内存
- [ ] 明文迁移与 rollback 契约

## Day 2：PBKDF2

- [ ] Web Crypto deriveKey
- [ ] 随机 salt
- [ ] 参数记录
- [ ] KDF 测试

## Day 3：AES-GCM

- [ ] 每次随机 IV
- [ ] round-trip
- [ ] 错密钥失败
- [ ] 篡改失败

## Day 4：迁移集成

- [ ] 识别明文 / 密文 envelope
- [ ] 原子迁移
- [ ] 失败保留旧数据
- [ ] 导入后重新加密

## Day 5：解锁

- [ ] 首次设密
- [ ] 已有密文解锁
- [ ] locked / unlocked / error 状态
- [ ] 替换 Noop 组装

## Day 6：安全验收

- [ ] IndexedDB 无账本明文
- [ ] 正确密码成功
- [ ] 错密码拒绝
- [ ] 篡改拒绝
- [ ] 导入后重加密
- [ ] 硬离线通过
- [ ] test / lint / build 通过

## Day 7：休息

- [ ] 不开发
- [ ] 不挪用

---

## Week 9 通过线

- [ ] PBKDF2 / AES-GCM 测试通过
- [ ] 明文迁移与 rollback 通过
- [ ] 解锁/锁定通过
- [ ] IndexedDB 无账本明文
- [ ] 硬离线通过
- [ ] test / lint / build 通过

## Week 9 不做

- [ ] 不自创密码学
- [ ] 不做密码找回
- [ ] 不做云密钥
- [ ] 不持久化 key
- [ ] 不做 UI 美化

## Week 10 Go / No-Go

- [ ] 全部通过：Week 10 可以开始图表
- [ ] 任一失败：优先修加密 P0
