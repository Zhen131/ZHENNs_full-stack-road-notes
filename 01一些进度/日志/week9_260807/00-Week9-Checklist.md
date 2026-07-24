# Week 9 Checklist

时间：2026-08-07 至 2026-08-13

主题：PBKDF2 + AES-256-GCM 本地加密

详细执行：[[00-Week9每日执行清单]]

状态：**Go（2026-07-24 提前收口）**。源码 `main@4fadfb6` 已推送；最终自动化为 30 个测试文件、290 项测试，lint、production build、`git diff --check` 通过。硬离线已取消、未验证，不作为本轮阻塞项；完整证据见 [[01B_W9-IndexedDB静态加密执行验收记录]]。

---

## 总览

| 原计划日 | 唯一主任务 | 最终状态 |
| --- | --- | --- |
| Day 1 | 威胁模型与 V2 envelope | 已完成 |
| Day 2 | PBKDF2 | 已完成 |
| Day 3 | AES-256-GCM | 已完成 |
| Day 4 | 密文 Repository 与导入后重加密 | 已完成；旧明文不自动迁移 |
| Day 5 | 首次设密与再次解锁 | 已完成；不实现手动锁定按钮 |
| Day 6 | 安全与 production Gate | 已完成；硬离线取消、未验证 |
| Day 7 | 休息 | 未占用开发；Week 9 已提前收口 |

---

## 前置 Gate

- [x] 完整导入导出、原子替换与 rollback 自动化通过
- [x] 明文备份逃生口已实现
- [x] test / lint / build 已通过
- [x] Week 8 P1-01 production evidence Gate 关闭，空页面观察已排除

## Day 1：威胁模型与 V2 envelope

- [x] encryption at rest 边界
- [x] cryptoVersion / KDF 参数 / salt / IV / ciphertext
- [x] key 只驻会话内存
- [x] 旧明文 / 未知格式拒绝、明确重置与零覆盖契约（不做自动迁移）

## Day 2：PBKDF2

- [x] Web Crypto deriveKey
- [x] 随机 salt
- [x] 参数记录
- [x] KDF 测试

## Day 3：AES-GCM

- [x] 每次随机 IV
- [x] round-trip
- [x] 错密钥失败
- [x] 篡改失败

## Day 4：密文存储与导入后重加密

- [x] 识别旧明文 / 密文 envelope
- [x] 不自动迁移旧明文；旧格式只允许明确重置
- [x] 写入失败保留旧密文，错误零写入
- [x] 导入后重新加密

## Day 5：解锁

- [x] 首次设密
- [x] 已有密文解锁
- [x] locked / unlocked / error 状态
- [x] production 组装替换 Noop

## Day 6：安全验收

- [x] IndexedDB 无账本明文
- [x] 正确密码成功
- [x] 错密码拒绝
- [x] ciphertext / IV 篡改拒绝
- [x] 导入后重新加密
- [x] 硬离线 Gate 已取消（未验证，不作为本轮阻塞项）
- [x] test / lint / build / diff-check 通过

## Day 7：休息

- [x] 未占用 Day 7 开发；Week 9 已提前收口

---

## Week 9 通过线

- [x] PBKDF2 / AES-GCM 测试通过
- [x] 旧明文 / 未知格式拒绝、不自动覆盖；写入失败安全保留旧记录
- [x] 首次设密、解锁与刷新后重新解锁通过
- [x] IndexedDB 无账本明文
- [x] 硬离线 Gate 已取消、未验证，按用户决定不阻塞本轮
- [x] test / lint / build / diff-check 通过

## Week 9 不做

- [x] 不自创密码学
- [x] 不做密码找回
- [x] 不做云密钥
- [x] 不持久化 key
- [x] 不做 UI 美化

## Week 10 Go / No-Go

- [x] Go：按用户调整后的 Week 9 Gate 已关闭，可以开始图表
- [x] No-Go 未触发；无遗留加密 P0
