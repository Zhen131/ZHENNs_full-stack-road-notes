# W9 IndexedDB 静态加密执行验收记录

状态：Week 9 收口完成；整机硬断网按用户决定取消，不记为通过、不再阻塞本轮

## 实现结果

- 源码分支：`zhennn/week9-encryption-at-rest`
- 基线：`45e10dc`
- 源码提交：`aca6c53`（主实现）、`b17b58e`（首次设密恢复修复）
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
npm test        -> 30 files / 290 tests passed
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
- 2026-07-24 由 Codex 操作真实 Chrome production origin 并通过 DevTools Console 直读 `ledger:v1`：
  - `formatVersion = 2`。
  - 顶层字段仅为 `formatVersion / cryptoVersion / ledgerSchemaVersion / kdf / cipher / ciphertextBase64Url`。
  - KDF 与 cipher 子字段符合 V2 契约。
  - 原始 record 搜索 `schemaVersion / trades / priceSnapshots / Bitcoin / Ethereum / Cardano`，命中数为 `0`。
- ciphertext 篡改验收通过：正确密码被统一拒绝；失败后 record 仍保持篡改值，其余字段不变，证明零写入。
- IV 篡改验收通过：正确密码被统一拒绝；失败后 record 仍保持篡改值，其余字段不变，证明零写入。
- 篡改验收结束后已恢复合法密文并删除临时备份 key；最终 store 仅含 `ledger:v1`，正确密码可重新解锁。
- 首次设密“写入成功、验证回读失败”已新增恢复状态：保留 V2 record、自动进入解锁页、清空密码输入，不挂载 Dashboard；故障注入与 UI 测试通过。
- Dashboard production 闭环已通过：写入 2 条交易和 1 条价格，导出明文备份，清空后不刷新直接导入；数据立即恢复，随后直读仍为 V2 且无测试账本明文特征，刷新后原密码可解锁并恢复全部样例。
- 整机硬断网验收未完成。用户明确取消该项并决定不作为本轮阻塞条件；不得把它描述为“已通过”。

## Gate 状态矩阵

| Gate | 状态 | 证据 / 阻塞 |
| --- | --- | --- |
| V2 envelope、KDF、AES-GCM 与 Repository 自动化 | 已关闭 | 30 files / 290 tests、lint、build、diff-check |
| 首次设密、再次解锁、备份导入主链 | 已关闭 | production 固定样例与刷新恢复通过 |
| IndexedDB V2 直读与明文搜索 | 已关闭 | DevTools 原始 record 直读，明文特征零命中 |
| ciphertext / IV 篡改、零写入、合法密文恢复 | 已关闭 | 两类 production 篡改均被拒，最终仅保留合法 `ledger:v1` |
| 保留 localhost 的硬离线主链 | 已取消，未验证 | 用户决定停止整机断网验收；不宣称通过，不作为本轮阻塞项 |
| 首次设密成功写入但验证回读失败后的页面恢复 | 已关闭 | `b17b58e`；Controller 故障注入与 Gate UI 恢复测试通过 |
| Dashboard clear -> import -> V2 -> refresh 闭环 | 已关闭 | production 2 trades + 1 price；无刷新导入、V2 直读、刷新解锁恢复通过 |
| Week 9 最终 Go | 已关闭 | 按用户调整后的通过线：实现、自动化、V2 现场证据与主生产闭环均通过；等待检阅，不推送、不合并 |

## 收口结论

- P1-01 与 P1-02 已关闭，P2 已关闭。
- P0 中 V2 直读、明文搜索、ciphertext / IV 篡改均通过；整机硬断网按用户决定取消。
- Week 9 按调整后的 Gate 判定为 Go；源码仍停留在功能分支，等待用户检阅后再决定是否推送或合并。
