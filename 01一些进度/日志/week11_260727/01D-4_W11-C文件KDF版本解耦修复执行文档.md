# Week 11 C 文件 KDF 版本解耦修复执行文档

日期：2026-07-29
状态：已执行
文档身份：第二轮同批返工输入
来源：`01D-3_W11-C文件合同与安全保存缺陷修复独立复验报告.md` 的 F-04
范围：只关闭 C V1 与 IndexedDB V2 的 KDF 参数耦合

## 结论

本轮只修复一个强制合同失败：C V1 的密钥派生必须显式使用 `LEDGER_FILE_V1_CONSTANTS`，不能通过读取 `LEDGER_CRYPTO_CONSTANTS` 的 V2 包装函数取得参数。

修复后必须同时证明：

- C V1 与 IndexedDB V2 可以向底层 primitive 传入不同 KDF / cipher 参数；
- C V1 setup / unlock 实际使用自己的参数；
- IndexedDB V2 原包装接口和现有字节行为不变；
- 修复前生成的固定 C V1 密文仍可使用原密码解密；
- 01D-1 / 01D-2 的 salt、Hook、picker、双代和 reconcile 修复不回归。

本轮不实现 FILE-003、FILE-006 或后续目标，不回写 00B，不合入 `main`。

## 允许修改

- 新增一个不属于 C 或 IndexedDB 的底层密钥派生模块及正式测试。
- 修改 `ledgerFileCrypto.ts`，让 C V1 显式传自己的版本参数。
- 修改 `webCryptoEncryptionService.ts`，让 IndexedDB V2 通过原 `deriveLedgerKey(...)` 包装函数显式传自己的参数。
- 修改 `ledgerFileCrypto.test.ts`，增加参数断言与修复前固定密文兼容测试。

## 禁止事项

- 不改变 PBKDF2-SHA-256、600,000 次、16-byte salt、AES-256-GCM 或 128-bit tag 的现有生产数值。
- 不改变 `.lftl fileFormatVersion`、`cryptoVersion`、`ledgerSchemaVersion`。
- 不改变 IndexedDB V2 envelope、AAD、ciphertext 或 Repository 合同。
- 不修改依赖、lockfile、账本 schema 或后续 FILE 功能。
- 不用复制两份 KDF 实现代替参数化 primitive。

## 实现合同

```text
共享底层 primitive
  输入：passphrase、salt、显式 KDF/cipher 参数、CryptoProvider
  不读取任何 C 或 IndexedDB 格式常量

C V1
  从 LEDGER_FILE_V1_CONSTANTS 构造参数
  → 调用共享 primitive

IndexedDB V2
  从 LEDGER_CRYPTO_CONSTANTS 构造参数
  → 保留 deriveLedgerKey(...) 包装接口
  → 调用共享 primitive
```

## 正式测试

- [x] 两个调用者可向同一个 primitive 传入不同 iterations 与 keyLength，并得到对应派生调用。
- [x] C V1 的实际 `deriveKey` 调用参数逐项等于 `LEDGER_FILE_V1_CONSTANTS`。
- [x] 修复前按既有 C V1 合同生成的固定 salt / IV / ciphertext fixture 仍可解密。
- [x] IndexedDB V2 round-trip、非导出 AES-256 key 和连续保存派生一次的测试继续通过。
- [x] 第一批全部正式测试与全量质量门继续通过。

## 完成线

- [x] C 文件模块不再导入 V2 服务或读取 `LEDGER_CRYPTO_CONSTANTS`。
- [x] 底层 primitive 不读取任何格式默认常量。
- [x] 两套参数由各自版本常量显式构造。
- [x] 固定 C V1 fixture 兼容。
- [x] 开发侧定向测试、全量测试、typecheck、lint、build、diff-check 通过。
- [ ] 仍需另一独立 AI 执行复验并生成 01D-6；开发侧完成不等于第一批独立 PASS。
