# W9 IndexedDB 静态加密执行验收记录

状态：实现完成，待用户最终验收

## 实现结果

- 源码分支：`zhennn/week9-encryption-at-rest`
- 基线：`45e10dc`
- 源码提交：`aca6c53`（`功能：实现第九周账本静态加密`）
- 未推送、未合并
- IndexedDB 固定保持：
  - database：`local-first-trading-ledger`
  - version：`1`
  - store：`ledger`
  - key：`ledger:v1`
- 新存储格式：`StoredLedgerEnvelopeV2`
- 加密：PBKDF2-SHA-256 / 600,000 iterations / 16-byte salt / AES-256-GCM / 12-byte fresh IV / 128-bit tag
- 密钥：`extractable: false`，usage 仅 `encrypt/decrypt`
- 启动入口：`page.tsx -> LedgerAccessGate -> DashboardShell(required repository)`
- production 组装不再实例化 Noop EncryptionService
- 未实现旧明文迁移、手动锁定、找回密码、密码提示或加密备份

## 自动化证据

```text
npm test        -> 30 files / 286 tests passed
npm run lint    -> 0 warning / 0 error
npm run build   -> Compiled successfully
git diff --check -> passed
```

覆盖：

- V2 envelope 精确字段、常量、Base64URL 和二进制长度校验
- 固定 AAD 字节顺序
- 12–128 Unicode code point 密码规则
- Unicode、空明文、接近 8 MiB 明文 round-trip
- 非导出 CryptoKey、随机 IV、同会话不重复 PBKDF2
- 错密码、不同 salt、ciphertext / IV / salt / metadata 篡改拒绝
- Repository 保存无账本 JSON 明文、写失败保留旧密文、错误零写入
- 首次设置、再次解锁、旧/未知格式、损坏 V2、读取失败和忘记密码重置
- 未解锁不挂载 Dashboard
- Week 7/8 save queue、retry、clear、import、backup 和 Repository generation 回归

## production 证据

- 旧 `formatVersion: 1` record 被识别为 unsupported；未自动覆盖。
- 错误重置确认文本未删除 record；精确确认后进入首次设置。
- 首次设密后进入 Dashboard；刷新后必须重新输入密码。
- 错密码显示统一错误；随后正确密码仍可解锁，证明错误尝试未覆盖 record。
- 明文备份导入后显示：
  - BTC `0.001 @ 70000 USD`
  - ETH `0.005 @ 2000 USD`
  - BTC price `80000 USD`
  - BTC market value `80 USD`
  - BTC unrealized PnL `10 USD`
- 导入显示“已保存到本地”；刷新、正确解锁后两条交易与价格完整恢复。
- 导出显示“备份为明文，未加密”。
- 忘记密码重置成功回到首次设置；重新设密和再次导入成功。
- 参考耗时：首次设密约 `289 ms`；再次解锁约 `298–309 ms`。
- production console：`0 warning / 0 error`。

## 待用户最终确认

以下两项受当前内置浏览器能力限制，未伪造通过：

1. 在 DevTools Application / IndexedDB 中直接展开 `ledger:v1`，确认 `formatVersion = 2`，字段仅为版本、KDF、salt、IV、ciphertext 等；原始 record 搜索 `schemaVersion`、`trades`、`priceSnapshots`、BTC/ETH 备注均不命中。
2. 在不阻断 `localhost` 的前提下断开外部互联网，复验打开、解锁、查询和导出。

用户完成上述两项且无异常后，Week 9 可判定 Go；此前不合并分支。
