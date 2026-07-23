# Week 9 每日执行清单

时间：2026-08-07 至 2026-08-13

主题：数据锁得住（PBKDF2 + AES-256-GCM）

> Week 9 保护的是 IndexedDB 静态数据。它不声称解决 XSS、恶意浏览器扩展或运行时内存泄露。先安全迁移旧明文，再启用真加密。

> 入口状态（2026-07-23）：Week 8 production evidence Gate 已关闭，空页面观察已由用户操作事实与受控刷新复验排除。Week 8 功能分支已推送，待 Draft PR Review；Week 9 可以从包含 Week 8 成果的源码基线开始。

本周结论：

```text
威胁模型与 envelope
-> PBKDF2
-> AES-GCM
-> 明文迁移
-> 解锁并切换
-> 密文 / 篡改 / 离线 Gate
```

---

## 进入 Week 9 前必须通过

- Week 8 完整 backup envelope 通过。
- 导出、原子导入、round-trip 和 rollback 通过。
- 用户拥有可用的明文 JSON 逃生备份。
- test / lint / build 通过。

任一失败：Day 1 自动改为补 Week 8 欠账，不启用真加密。

---

## Day 1：8月7日，锁定威胁模型与密文 envelope

今天只做一件事：明确保护什么、保存什么，以及旧明文怎样迁移。

要做：

- 威胁模型限定为浏览器本地静态存储加密。
- 定义 crypto envelope：
  - cryptoVersion。
  - KDF 名称与参数。
  - salt。
  - IV。
  - ciphertext。
  - 必要的非敏感元数据。
- 决定 salt 生命周期和每次加密使用新的随机 IV。
- 明确 passphrase 和派生密钥只驻留当前会话内存。
- 明确旧明文识别方式。
- 明确迁移顺序：确认备份 -> 读取明文 -> 加密写入新 envelope -> 验证可解密 -> 才删除/替换旧明文。
- 明确迁移失败时保留旧明文与可恢复状态。
- 明确已有密文与首次设置密码是两条不同启动路径。

产出：

- 威胁模型。
- crypto envelope 和迁移契约。

完成标准：

- 不把密码、原始密钥或明文账本写入持久化元数据。
- 迁移任一步失败都可回退。
- 论文表述限定为 encryption at rest。

---

## Day 2：8月8日，实现 PBKDF2 密钥派生

今天只做一件事：从 passphrase 和 salt 派生 AES-256 密钥。

要做：

- 使用 Web Crypto API。
- passphrase 经 TextEncoder 进入 PBKDF2。
- 使用随机 salt。
- 选择并记录 hash、iteration count 和 key length。
- iteration count 兼顾安全与本地解锁时间，并纳入 benchmark 环境记录。
- 同参数派生同一密钥，不同 salt 派生不同密钥。
- 新建成功、不同 salt、空密码策略和失败测试。

产出：

- KDF service 与测试。

完成标准：

- 不手写密码学算法。
- 不持久化派生密钥。
- 参数明确进入 crypto envelope。

---

## Day 3：8月9日，实现 AES-256-GCM 加解密

今天只做一件事：实现完整账本字节的认证加密和解密。

要做：

- 将规范化账本 JSON 编码为字节。
- 每次 encrypt 生成新的随机 IV。
- AES-GCM 输出 ciphertext。
- decrypt 后恢复原始字节并解析账本。
- 错密钥、篡改 ciphertext、篡改 IV 均返回统一解锁失败。
- 新建 round-trip、随机 IV、错密钥和篡改测试。

产出：

- WebCrypto EncryptionService。

完成标准：

- encrypt -> decrypt 逐字节一致。
- 相同明文连续加密得到不同 ciphertext/IV。
- 认证失败不返回部分明文。

---

## Day 4：8月10日，实现明文迁移与密文存储集成

今天只做一件事：让 repository 能安全识别、迁移和保存密文 envelope，但暂不默认切换。

要做：

- repository 识别“旧明文 envelope”和“新密文 envelope”。
- 首次设置密码时执行 Day 1 原子迁移。
- 迁移后立即使用同一会话密钥回读验证。
- 验证成功后才替换旧记录。
- 迁移失败保留旧记录和明文备份提示。
- 普通 save 只写密文 envelope。
- 导入明文备份后立即经当前会话密钥重新加密。
- 新建迁移成功、迁移失败和导入后重加密测试。

产出：

- 明文到密文迁移闭环。

完成标准：

- 不出现明文与密文各写一半。
- 失败不破坏旧数据。
- 新写入和导入恢复后 IndexedDB 不含账本明文。

---

## Day 5：8月11日，接通解锁与锁定流程

今天只做一件事：建立首次设密、已有密文解锁和当前会话锁定 UI。

要做：

- 未设置密码时显示首次设密流程。
- 已有密文时先解锁，成功后才 hydrate。
- 错密码不 hydrate、不写入。
- loading / locked / unlocked / error 状态清晰。
- 锁定后清除内存中的 key 和已解密页面数据。
- 组装点用 WebCrypto 实现替换 Noop。
- 确认页面、service、calculator 不需要修改。

产出：

- 解锁与锁定 UI。
- 真加密组装点。

完成标准：

- 未解锁时无法读取或修改账本。
- 错密码和篡改表现一致，不泄露细节。
- passphrase 不进入日志、URL 或持久化存储。

---

## Day 6：8月12日，安全与硬离线验收

今天只做一件事：证明本地数据是密文、可恢复、可拒绝篡改且断网可用。

要做：

- 用 DevTools 检查 IndexedDB，不出现资产、交易、备注等账本明文。
- 正确密码：解锁、hydrate、新增、刷新、再次解锁成功。
- 错密码：拒绝，不写入。
- 篡改 ciphertext / IV：拒绝，不写入。
- 明文导出 -> 清空 -> 导入 -> 自动密文写回 -> 重启解锁成功。
- 断网后重新打开应用，完成解锁、新增、查询、导出。
- 运行 test / lint / build。
- 记录安全 Gate、限制和 Week 10 Go / No-Go。

产出：

- 加密与硬离线证据。
- Week 9 Gate 记录。

完成标准：

- IndexedDB 静态数据为密文。
- 错密码/篡改失败且不破坏原数据。
- 明文备份恢复后重新加密。
- 断网核心功能可用。
- 红灯时不进入图表主线。

---

## Day 7：8月13日，休息

今天不做开发、不补欠账。

不做：

- 不做图表。
- 不挪用休息日。

---

## 本周产出物

- 威胁模型和 crypto envelope。
- PBKDF2 KDF service。
- AES-256-GCM EncryptionService。
- 明文迁移。
- 真加密 repository 集成。
- 解锁/锁定 UI。
- 加密与硬离线 Gate 记录。

## 本周验收标准

- 正确密码可解锁。
- 错密码和篡改被拒。
- IndexedDB 不含账本明文。
- 明文迁移与导入后重加密原子化。
- 会话 key 不持久化。
- 硬离线核心流程通过。
- test / lint / build 通过。

## Week 10 进入条件

- [ ] KDF 测试通过
- [ ] AES-GCM round-trip / tamper 测试通过
- [ ] 明文迁移与 rollback 通过
- [ ] 解锁/锁定通过
- [ ] 导入后重新加密通过
- [ ] 硬离线通过
- [ ] test / lint / build 通过

任一未通过：优先修加密 P0，不用图表掩盖安全红灯。

## 本周不可做

- 不自创密码学算法。
- 不做密码找回。
- 不做服务器密钥或云同步。
- 不把 key 写入 IndexedDB / localStorage。
- 不声称防御 XSS 或内存攻击。
- 不做解锁页面美化。

## 论文素材点

- encryption at rest 威胁模型。
- PBKDF2 与 AES-256-GCM 参数。
- 明文迁移和失败回滚。
- 用户所有权与明文备份逃生口。
- 硬离线验证。

## 落后时处理

- 死守密文、迁移、解锁、篡改和离线。
- 压缩 UI 样式。
- Week 10 整体顺延。
- Day 7 保持休息。
