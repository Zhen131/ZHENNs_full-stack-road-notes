# Week 11 C 文件 KDF 版本解耦修复执行记录

日期：2026-07-29
最终结论：**PASS**
执行性质：开发修复与开发侧自验
执行输入：`01D-4_W11-C文件KDF版本解耦修复执行文档.md`
下一独立输出：`01D-6_W11-C文件合同与安全保存最终独立复验报告.md`

## 结论

01D-3 的 F-04 已在开发侧关闭：

- 新增格式无关的参数化密钥派生 primitive；
- C V1 setup / unlock 显式使用 `LEDGER_FILE_V1_CONSTANTS`；
- IndexedDB V2 保留原 `deriveLedgerKey(...)` 接口，并显式使用 `LEDGER_CRYPTO_CONSTANTS`；
- 新增两套参数独立调用测试；
- 新增修复前固定 C V1 密文兼容测试；
- 全量为 49 个测试文件、445 项测试，typecheck、lint、production build 和 diff-check 全部通过。

本文不冒充独立验收。00B 继续未勾选，源码不合入 `main`，FILE-006 / FILE-007 继续等待 01D-6。

## 1. 基线

| 项目 | 执行前事实 |
| --- | --- |
| 源码分支 | `zhennn/w11-c-file-core-save` |
| HEAD | `2e5c7e5ca26d149fb62beb932ffe2a043f0528d5` |
| 既有返工 | 8 个源码 / 测试修改，48 files / 443 tests |
| F-04 | `ledgerFileCrypto.ts` 调用读取 V2 常量的共享 `deriveLedgerKey(...)` |
| Git | 无 staged；未 commit、merge、push 或清理分支 |

## 2. 实际修改

| 文件 | 目的 |
| --- | --- |
| `src/encryption/ledgerKeyDerivation.ts` | 新增显式接收 KDF / cipher 参数的格式无关 primitive；不读取任何格式常量 |
| `src/encryption/ledgerKeyDerivation.test.ts` | 用不同 iterations / keyLength 证明两个调用合同可独立传入 |
| `src/encryption/ledgerFileCrypto.ts` | 从 `LEDGER_FILE_V1_CONSTANTS` 构造 C V1 参数并直接调用 primitive |
| `src/encryption/ledgerFileCrypto.test.ts` | 断言 C 实际派生参数；加入修复前固定密文兼容 fixture |
| `src/encryption/webCryptoEncryptionService.ts` | 保留 V2 `deriveLedgerKey(...)` 包装接口，改为显式传 V2 参数 |

没有修改依赖、lockfile、账本 schema、文件版本、IndexedDB V2 envelope、AAD 或后续 FILE 功能。

## 3. 版本解耦结果

```text
ledgerKeyDerivation.ts
  → 只接收调用者参数
  → 不导入 ledgerFileContract
  → 不导入 cryptoEnvelope

ledgerFileCrypto.ts
  → 只读取 LEDGER_FILE_V1_CONSTANTS
  → 不导入 webCryptoEncryptionService
  → 不读取 LEDGER_CRYPTO_CONSTANTS

webCryptoEncryptionService.ts
  → 继续服务 IndexedDB V2
  → 原 deriveLedgerKey(...) 对外形状不变
  → 显式传 LEDGER_CRYPTO_CONSTANTS
```

## 4. 兼容性证据

固定 fixture 在修复前按既有 C V1 合同生成：

- passphrase：测试固定密码；
- salt：16-byte `0x07`；
- IV：12-byte `0x09`；
- KDF：PBKDF2-SHA-256 / 600,000；
- cipher：AES-256-GCM / 128-bit tag；
- fileId：`fixture-file`；
- revision：`fixture-revision`。

修复后 `LedgerFileCrypto.createForUnlock(...)` 可解密该固定 ciphertext，并逐字得到原 payload，证明本轮只改变参数来源，不改变 C V1 字节合同。

## 5. 验证证据

| 命令 | exit code | 结果 |
| --- | ---: | --- |
| `npm test -- src/encryption/ledgerKeyDerivation.test.ts src/encryption/ledgerFileCrypto.test.ts src/encryption/webCryptoEncryptionService.test.ts` | 0 | 3 files / 11 tests |
| C 文件合同 / Crypto / Adapter / Repository 定向组 | 0 | 5 files / 44 tests |
| Controller / Access / Gate 定向组 | 0 | 4 files / 38 tests |
| Hook / Dashboard 定向组 | 0 | 3 files / 79 tests |
| IndexedDB V2 加密回归组 | 0 | 4 files / 34 tests |
| `npm test` | 0 | 49 files / 445 tests |
| `npm run typecheck` | 0 | TypeScript 0 error |
| `npm run lint` | 0 | ESLint 0 warning / 0 error |
| `npm run build` | 0 | Next.js 15.5.22 production build；静态页 5 / 5 |
| `git diff --check` | 0 | 无 whitespace error |

全仓 `src/` 扫描未发现 `.only`、`.skip`、`console.log`、`console.debug` 或 `debugger`。

## 6. 开发侧判定

| 完成线 | 结果 |
| --- | --- |
| primitive 显式参数化 | PASS |
| C V1 使用自己的版本常量 | PASS |
| IndexedDB V2 保持自己的版本常量与旧接口 | PASS |
| 两套参数可独立演进 | PASS |
| 修复前 C V1 fixture 可解密 | PASS |
| F-01～F-03 无回归 | PASS |
| 全量质量门 | PASS |
| 无范围扩大 | PASS |

## 7. 当前边界

- [x] 01D-4 / 01D-5 开发修复完成。
- [ ] 01D-6 独立最终复验尚未执行。
- [ ] 00B 的 FILE-001、FILE-002、FILE-004、FILE-005 仍不勾选。
- [ ] 候选不合入 `main`，不删除功能分支，不推送本轮未提交修改。
- [ ] 02A / 02C 的 FILE-006、FILE-007 仍未开始。

下一步由另一独立 AI 按 01C 与 01D-3 的通过线只读复验当前完整候选，重点确认：

1. C 模块与 V2 常量真实解耦；
2. 固定 C V1 fixture 兼容；
3. IndexedDB V2 行为无变化；
4. F-01～F-03 正式对抗场景和全部质量门继续通过；
5. 源码复验前后哈希一致。
