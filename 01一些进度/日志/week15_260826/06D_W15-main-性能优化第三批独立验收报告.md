# 06D_W15-main｜性能优化第三批「存盘成本」独立验收报告

验收日期：2026-09-01（CEST）
验收对象：`06C_W15-main-性能优化第三批存盘成本执行报告.md`
待验分支：`zhennn/w15-main-chunked-storage`，HEAD `fd32c2e`（核对相符）
对照基线：源码仓库 `main` `8df62d8`（核对相符）
验收依据：`06A` 第二／三节、`06B` 正文 B-01～B-10／H-1～H-6／Q-1～Q-5／R-1～R-12 与修订 A／B／C／D／E、`000_W15-账本版本分层与迁移策略决策记录.md`、根 `AGENTS.md`「版本分层与迁移」「Git 边界」

---

## 结论

**有条件通过。**

本批是至今风险最高的一批，唯一可能的坏结局是**账本数据静默损坏且无任何测试变红**。我按这个假设去找，重点查了三处：断言有没有被悄悄改软、版本号与加密参数有没有被顺手动过、原子写与复读合同有没有为性能让路。

**这三处都没有问题，而且不是勉强通过，是干净通过。**

- 整个分支相对 `main` **只有 6 条既有断言表达式被改动**，与 `06C` 自己点名的 6 条**一条不多、一条不少**。我逐文件机械统计 `expect(` 数量，**没有任何一个既有测试文件的断言数减少**，我数出来的 8 个文件的前后计数与 `06C` 的表**逐格相同**。
- 那 6 条改动我逐条读了实现，**没有一条是放宽**。其中 5 条换用的读取辅助函数对 V3 文件做的是**全文件逐字节 1:1 映射**，比原来的 `TextDecoder` 解码更严格而非更松。
- `ledgerFileContract.ts`、`ledgerFileContract.test.ts`、`ledgerFileCrypto.test.ts` 与全部 legacy 测试**一个字节都没变**（修订 C 的 A-08 修正版要求）。
- 四个版本号只有 `fileFormatVersion` 从 2 变 3，其余三个我在代码里逐个确认未动。加密参数所在的常量文件**整份未改动**，`ledgerFileCrypto.ts` 的 diff **零删除行**，纯新增。
- 保存安全合同三句话，我不是复述 `06C` 的论证，是自己顺着代码走了一遍写入与恢复路径，**三句一条不弱**。

三道正确性闸门我全部自己实跑，**全绿**；默认全量 104 files／1174 tests、typecheck、lint、whitespace 我也自己跑了，**全绿**。所有性能数字与仓库内已提交的量尺 JSON **逐格相符**，所有百分比与倍数我重算过，**算得对**。10⁶ 的 M-3「未取得」是如实记录，没有拿别的数字顶替。

不给无条件 PASS，只因两点，**两点都是报告表述问题，不是产品缺陷**：

1. **`06C` 关于 S2-F 通电检查的记述，在 HEAD 上无法复现。** 我按 `06C` 点名的那条分支原样破坏（`verifyLedgerFileForOpen` 中「current 失败而 previous 验证成功则返回 recovery-required」），**测试没有变红，照常通过**。追查后确认原因是产品有**两条互相独立的恢复路径**：新头槽验证失败时会回落到旧头槽，`olderHeaderRecovery = index > 0` 同样产出 `recovery-required`。我把两条路一起关掉，测试才变红。这说明**测试不是空的、产品的恢复能力是真实的（而且比合同要求更厚）**，但 `06C` 写的那条通电结论在最终代码上不成立。该结论是在 S-2 阶段（`2723b46`）取得的，我**没有回到那个提交复跑，因此不能判断它当时是否属实——记为未核验**。
2. **性能数字我一个都没有重跑，未核验其真实性。** 依任务约定不重跑浏览器量尺。我只核验了内部一致性、与仓库内证据的一致性、以及算术。

另有一处**次要表述不准**（不影响任何被保护的性质，见五·2）：`06C` 把 V3 尾随空白构造描述为「只给 JSON 头增加尾随空白并同步头长度」，实际实现把**整个 256 KiB 头槽清零后重写**，其中包含末尾 16 字节的 manifest 认证标签。

解除条件：更正上述 1 与次要表述；性能结论由产品负责人明确接受「未经第二方复现的浏览器数据」这一证据等级。**本报告不授权合入 `main`，不授权推送。**

---

## 一、我实际跑过的命令与实际结果

全部在 `fd32c2e`、工作树 clean 的状态下运行。

| 项目 | 命令 | 我实跑的结果 | `06C` 自述 | 相符 |
| --- | --- | --- | --- | --- |
| **Q-1** 冻结派生等价性 | `npx vitest run --config vitest.benchmarks.config.ts benchmarks/measure/derivedSnapshot.contract.ts` | **1 file／7 tests PASS** | 7/7 | ✅ |
| **Q-2** 往返五情形 | `npx vitest run …ledgerFileRepository.test.ts -t "round-trips every field for the Q-2"` | **5 passed／70 skipped** | 5/5 | ✅ |
| **Q-4** IV 不重用 | `npx vitest run …ledgerFileRepository.test.ts -t "uses a fresh IV for every rewritten block and every reachable manifest"` | **1 passed／74 skipped** | PASS | ✅ |
| 默认全量 | `npm test` | **104 files／1174 tests PASS** | 104／1174 | ✅ |
| typecheck | `npm run typecheck` | PASS | PASS | ✅ |
| lint | `npm run lint`（`--max-warnings=0`） | PASS | PASS | ✅ |
| whitespace | `git diff --check`；`git diff main...HEAD --check` | PASS | PASS | ✅ |
| S2-F／S2-G | `-t "whole-ledger"` | **2 passed／73 skipped** | PASS | ✅ |

**我没有跑的**：production build、结构守卫 7/7、任何浏览器量尺、任何 Node 极限探针。这四项在本报告中一律记为**未核验**。

### 1.1 Q-1 的裁判本身没有被动过

Q-1 只有在「快照文件本身没被改」的前提下才有意义。我核对：

```
git diff --stat main...HEAD -- benchmarks/measure/   → 空
benchmarks/ 目录下 evidence/ 之外的改动           → 无
```

`benchmarks/measure/derivedSnapshot.contract.ts` 与 `derivedSnapshot.ts` **相对 `main` 零改动**。7/7 是在未被改动的裁判上取得的。

### 1.2 Q-2 五种情形确实都存在，不是只写在报告里

`ledgerFileRepository.test.ts:793` 起是一个真实的 `it.each` 矩阵，五格与合同逐字对应：

| 合同要求 | 实际用例 | 断言 |
| --- | --- | --- |
| 空账本 | `{ name: "empty", count: 0, blockCounts: [] }` | 块数 `[]` |
| 单条 | `count: 1, blockCounts: [1]` | 块数 `[1]` |
| 不足一块 | `count: 1_999, blockCounts: [1_999]` | 块数 `[1999]` |
| 恰好一整块 | `count: 2_000, blockCounts: [2_000]` | 块数 `[2000]` |
| 跨多块 | `count: 2_001, blockCounts: [2_000, 1]` | 块数 `[2000, 1]` |

每格都在保存后**重新 `open` 再 `load`**，再对整个 `LedgerData` 做 `toEqual(ledger)`——是真正的「存进去再读出来逐字段相同」，不是只比对块数。

### 1.3 Q-4 覆盖了合同要求的两个维度

`ledgerFileRepository.test.ts:1061` 的用例把同一账本编辑后再保存一次，然后收集**全部可达 IV**：当前控制块 + 当前全部事实块 + 上一代发生变化的块 + 两个头槽候选的 manifest IV，最后断言 `new Set(reachableIvs).size === reachableIvs.length`。

- 「任意两块之间」→ 由当前全部事实块同时进集合覆盖；
- 「同一块的两代之间」→ 由 `previousChanged` 进集合覆盖，并另有两条点名断言（控制块与 `factBlocks[0]` 的前后代 IV `not.toBe`）。

未变化的 `factBlocks[1]` 断言与上一代 `toEqual`（即未被重写、无需换 IV），符合 K-2 的语义（只有**重写**才必须换新 IV）。

---

## 二、逐行读 diff 的结果（B 项）

`git diff main...HEAD` 共 14 笔提交、81 个文件、+12,764／−525。我全部读过。

### 2.1 既有断言：只动了 6 条，与报告点名的完全一致

我用机械方式找出全分支所有被**删除**的 `expect(` 行：

```sh
for f in <8 个被修改的既有测试文件>; do
  git diff -U0 main...HEAD -- "$f" | grep -E '^-.*expect\('
done
```

原始输出只有 6 行：

```
--- src/app/usePersistentLedger.fileCapabilities.test.tsx
-    expect(new TextDecoder().decode(handle.bytes)).toBe(serializedA);
-    expect(new TextDecoder().decode(handle.bytes)).toBe(disk302);   × 4
--- src/platform/files/ledgerFileRepository.test.ts
-    expect(handle.text().endsWith("\n")).toBe(true);
```

**与 `06C`「最终分支实际变更的既有断言逐条对照」表的 6 行逐条相同。表外无改动。**

### 2.2 断言总数：自己数的，没有抄报告（A-07）

| 文件 | 我数的 `main` | 我数的 HEAD | `06C` 的表 | 相符 |
| --- | ---: | ---: | --- | --- |
| `LedgerAccessGate.test.tsx` | 161 | 161 | 161→161 | ✅ |
| `dashboardDerivations.test.ts` | 35 | 36 | 35→36 | ✅ |
| `ledgerFileAccessController.test.ts` | 203 | 203 | 203→203 | ✅ |
| `usePersistentLedger.fileCapabilities.test.tsx` | 169 | 169 | 169→169 | ✅ |
| `usePersistentLedger.fileImport.test.tsx` | 101 | 101 | 101→101 | ✅ |
| `resourcePolicy.test.ts` | 13 | 14 | 13→14 | ✅ |
| `ledgerFileHandleAdapter.test.ts` | 50 | 58 | 50→58 | ✅ |
| `ledgerFileRepository.test.ts` | 276 | 328 | 276→328 | ✅ |

**没有任何一个既有文件减少。** 逐格与 `06C` 相同。

### 2.3 那 6 条是不是「迁移成了放宽」——逐条读实现后的判定

**第 1～5 条（`fileCapabilities`）：不是放宽，反而更严。**

原文断言的是「盘上整个文件的字节等于某个基准」。迁移后调用 `ledgerFileBytesToTestString(bytes)`。我读了这个函数（`src/test-support/readLedgerFileForTest.ts:728`）：对 V3 文件，它用 `String.fromCharCode` 把**每一个字节**按 latin1 逐字符映射成字符串，分块拼接，**不丢任何字节**。因此 `toBe(disk302)` 仍是**整文件逐字节比较**。

原来的 `new TextDecoder().decode(bytes)`（非 fatal）遇到非法 UTF-8 序列会替换成 U+FFFD，**反而可能把不同的字节判成相同的字符串**。换成 1:1 字节映射后这个漏洞消失了。**这是加强，不是放宽。**

**第 6 条（`ledgerFileRepository.test.ts` 尾随空白）：被保护的性质不变。**

该用例守的是「语义有效但字节不完全一致的 readback 不得被当成精确写入，也不得在不确定时补偿覆盖」。迁移前后**四条实质断言原文未动**：

```
rejects.toMatchObject({ code: … IMPORT_RECOVERY_BLOCKED })   （未动）
expect(handle.text()).not.toBe(baseline);                     （未动）
expect(handle.writeCount).toBe(writesBeforeImport + 1);       （未动）
await expect(repository.load()).rejects.toMatchObject({ … })  （未动）
```

只有那条「确认破坏确实生效」的见证断言从「整份文件以 `\n` 结尾」改为「V3 JSON 头以 `\n` 结尾」。

我进一步验证了它守的性质仍然成立：`ledgerFileRepository.ts:1119` 起的 `restoreImportBaseline` 判定分支**完全由 `sameBytes` 字节比较决定，发生在任何密码学验证之前**——

```
盘上字节 == 精确 base      → 验证后接受
盘上字节 != 精确 candidate → IMPORT_RECOVERY_BLOCKED   ← 本用例落此
否则（== 精确 candidate）  → 才允许补偿重写 base
```

新旧两种破坏都因「既不是精确 base 也不是精确 candidate」进入同一分支、同一理由。**性质未被削弱。**

### 2.4 V2 合同测试原样保留（修订 C 的 A-08 修正版）

| 文件 | 相对 `main` |
| --- | --- |
| `src/platform/files/ledgerFileContract.ts` | **UNCHANGED** |
| `src/platform/files/ledgerFileContract.test.ts` | **UNCHANGED** |
| `src/platform/files/ledgerFileCrypto.test.ts` | **UNCHANGED** |
| `src/platform/legacy/*.test.ts`（4 个） | **UNCHANGED**（不在改动清单内） |

全分支被修改的测试文件只有 13 个（6 改 + 7 新增），legacy 与 V2 合同测试一个都不在其中。**A-08 修正版要求的「一个字不许动」为真。**

### 2.5 阶段〇（`4a66905`）：src/ 并非零改动，但改的全是新增测试

实际改动 6 个文件：

```
src/platform/files/goldenStorageFixtures.test.ts   (新增，100 行)
src/test-support/goldenStorageScenario.ts          (新增，110 行)
src/test-support/index.ts                          (+1 行：export 新增模块)
test-fixtures/golden/README.md                     (新增)
test-fixtures/golden/…-v4-rich.json                (新增)
test-fixtures/golden/…-format-v2-…lftl             (新增)
```

**与验收任务书「只动了 benchmarks/ 与 test-fixtures/，src/ 零改动」的字面表述不符**：实际动了 3 个 src/ 文件，且**完全没有动 benchmarks/**。

但我判定**这不构成违约**：`06B` 第一节明文要求「阶段〇必须有配套测试证明两份新样例能被当前代码正确读取」，该测试只能落在 `src/` 下。实质约束是「不得改动任何与文件格式相关的代码」与「不得改动任何版本号」，我逐项核对：

- 三个 src/ 文件全部是**新增的测试与测试夹具**，`index.ts` 只多一行 `export *`；
- **零个格式实现文件**被触及；
- 该提交内出现的版本号全部在新增测试的断言与新夹具内容里（断言 `toBe(2)`／`toBe(1)`／`toBe(4)`／`toBe(3)`），**没有改动任何版本号定义**。

结论：**符合 `06B` 的实质要求**，与任务书措辞的差异如实记录于此。

### 2.6 四个版本号：只有 `fileFormatVersion` 变了

我在代码里逐个确认，不采信报告：

| 版本号 | 定义位置 | 值 | 该文件相对 `main` |
| --- | --- | ---: | --- |
| `fileFormatVersion` | `ledgerFileChunkedContainerV3.ts:24` | **3** | 新增文件（V2 的 2 仍在未改动的 `ledgerFileContract.ts:15`） |
| `cryptoVersion` | `ledgerFileContract.ts:16` / `…V3.ts:25` | **1** | `ledgerFileContract.ts` **UNCHANGED** |
| `ledgerSchemaVersion` | `SUPPORTED_LEDGER_SCHEMA_VERSION`，`ledgerFileContract.ts:31` | **4** | 同上，**UNCHANGED** |
| `backupFormatVersion` | `BACKUP_FORMAT_VERSION`，`backupEnvelope.ts:20` | **3** | `backupEnvelope.ts` **不在改动清单内** |

`backupEnvelope.ts` 与 `ledgerFileContract.ts` 全程未被本批触碰，因此 `backupFormatVersion` 与 `ledgerSchemaVersion` 的不变性是结构性的，不依赖任何声明。

### 2.7 加密参数：一个都没动

`LEDGER_FILE_OUTER_V2_CONSTANTS` 所在的 `ledgerFileContract.ts` **整份文件未改动**，其内容为：

```
kdfName "PBKDF2" / kdfHash "SHA-256" / kdfIterations 600_000 / saltBytes 16
cipherName "AES-GCM" / keyLength 256 / ivBytes 12 / tagLength 128
```

V3 实现**复用同一组常量**（`ledgerFileCrypto.ts` 中 `LEDGER_FILE_OUTER_V2_CONSTANTS.ivBytes` 等引用可见）。另外：

```
git diff main...HEAD -- src/platform/files/ledgerFileCrypto.ts | grep '^-[^-]'  → 无输出
```

**`ledgerFileCrypto.ts` 零删除行，纯新增。** 加密参数不可能被改动。

---

## 三、四次裁决是否被真正执行（C 项）

### 3.1 修订 A／B——断言迁移四条约束

| 约束 | 我的核验 | 判定 |
| --- | --- | --- |
| A-05 先造读取辅助函数 | `src/test-support/readLedgerFileForTest.ts` 存在；`1998a62` 新增 | ✅ |
| A-06 不弱化 | 见二·3，逐条读实现，无一放宽 | ✅ |
| A-07 总数不减 | 见二·2，自己数的，8 个文件无一减少 | ✅ |
| A-08（C 修正版）V2 覆盖保留 | 见二·4，三个文件字节级未改 | ✅ |
| A.5 独立成一笔提交 | 见下 | ✅ |
| 甲乙丙判据 | 见下 | ✅ |

**A.5 我做了硬核对**，`1998a62`：

```
改动 5 文件：3 个 .test.ts/tsx + test-support/index.ts + readLedgerFileForTest.ts
git show -U0 1998a62 | grep -E '^[+-].*expect\('   → 无输出（断言一行未动）
非测试／非 test-support 文件                        → 0 个
```

**这笔提交没有改动任何 `expect(`，也没有碰任何产品文件，且排在 S-1 格式提交 `2b87216` 之前。** A.5 完全落实。

甲乙丙判据：`06C` 的检索命令我复算过口径（121 匹配行／13 文件），其甲类 22（后补 A-23）／乙类 25／丙类 0 的分类与实际改动面一致——**实际被改的既有断言只有 6 条，全部落在甲类内**，乙类文件确实一字未动。丙类为 0 与我的独立观察相符（未发现判不清的点）。

### 3.2 修订 C——本批不实现迁移器

| 编号 | 我的核验 | 判定 |
| --- | --- | --- |
| 无迁移器 | 全仓库无迁移器实现 | ✅ |
| **产品无任何 V2 读写路径** | `grep '\.encryptGeneration(\|\.decryptGeneration('` → 命中 15 处，**全部在 `.test.ts` 与 `test-support/` 内，非测试调用点 0 个**；`validateLedgerFileV2` 除定义外无产品调用点 | ✅ |
| C-01 G-1 字节与哈希未改 | `shasum -a 256` = `d143d621cb2dbb4404d254114294132a54213c70fbd445c6bc0fb49b42447427`，**与 `06C` 相同**；`git log main..HEAD -- <G-1>` 只有 `4a66905` 一笔（首次加入），此后再未被任何提交触碰 | ✅ |
| C-02 用例已改为断言拒绝且断言前后字节一致 | 见下 | ✅ |
| C-04 README 写明 | 已写明「retained for a future migration project…currently referenced only by the product-path rejection test…will regain decoding coverage when migration is implemented」 | ✅ |

**C-02 我读了实际用例**（`goldenStorageFixtures.test.ts:110`），它比合同要求的更严：

```ts
expect(sha256(bytes)).toBe(GOLDEN_LEDGER_FILE_SHA256);      // 测试前哈希
await expectV2Rejection(() => inspectLedgerFile(adapter, handle));
await expectV2Rejection(() => LedgerFileRepository.open(…)); // 两条产品正路都拒绝
expect(handle.writeAttempts).toBe(0);                        // 零写入
expect(after.byteLength).toBe(before.byteLength);            // 长度不变
expect(sha256(after)).toBe(GOLDEN_LEDGER_FILE_SHA256);       // 测试后哈希
expect(after).toEqual(before);                               // 逐字节相同
```

拒绝断言要求 `code: INVALID_FILE`、`message` 含 "V2"、`cause` 含 `{ code: "LEDGER_FILE_UNSUPPORTED_VERSION", path: "fileFormatVersion" }`——**错误确实指向 `fileFormatVersion`，且发生在派生密钥与解密之前**（虽然传入了口令）。

### 3.3 修订 D——不得新增或修改用户可见文案

我对全部非测试 src/ 改动文件逐个检索新增的中文字符行：

```sh
for f in <18 个非测试 src 改动文件>; do
  git diff main...HEAD -- "$f" | grep '^+' | grep -P '[\x{4e00}-\x{9fff}]'
done
→ 无输出
```

且**没有任何 UI 组件文件（`.tsx`，测试除外）被改动**。C-05／C-06 确已撤销、未实施。**修订 D 落实。**

### 3.4 修订 E——S-2 的槽机制

**S2-G**（`ledgerFileRepository.test.ts:1212`）我读了断言，三重证明：

```ts
expect(parsedAfter.value.previous?.bodySlot).toBe(sourceSlot);          // previous 仍指向原槽
expect(readLedgerFileBodySlotForTest(handle.bytes, sourceSlot))
  .toEqual(sourceSlotBefore);                                          // 该槽整段字节前后相同
expect(saveOperations).toHaveLength(2);                                 // 普通保存只有两次写
expect(saveOperations.some(区间与该槽相交)).toBe(false);                 // 两次写都不触及该槽
```

**「字节与保存前完全一致」不是靠推断，是靠整段 `toEqual` 加写区间不相交双重证明的。**

**S2-F**（`ledgerFileRepository.test.ts:1272`）：翻转 current 体槽的一个字节 → `openForAccess` 必须返回 `recovery-required` → `confirm()` 后 `recovered.load()` **逐字段 `toEqual(ledgerBefore)`**，并再读一次盘验证 current 与 previous 都等于损坏前的上一代。合同要求的「完整恢复」得到满足。

**H-6 未触发**属实：`keepExistingData: true` 确实与既有合同共存（见四）。

---

## 四、原子写与复读合同有没有被削弱（D 项）

这是我最担心的地方，因此我没有复述 `06C` 的 R-16，而是自己顺着代码走了写入与恢复两条路。

**`keepExistingData: true` 全仓库只出现一次**：`ledgerFileHandleAdapter.ts:531`，位于 `writeBinaryPatchesAndReadBack`。另两处（`:346`、`:442`）仍是 `false`。

逐句核对既有合同：

**第一句「正常成功必须完整复读」——不弱。**

- 适配器层：全部补丁写完 → `writable.close()` → **`this.readBinary(handle)` 读回整个文件** → 校验 `readback.byteLength !== expectedFileByteLength` 即抛 `readback` 阶段错误。局部写没有把「写进 writable」当成成功。
- 仓库层：`verifySerializedLedgerFile` 计算 `exactExpectedBytes = sameBytes(serialized, expected.serializedFile)`。若不精确相等，走 `parseAndValidateLedgerFile(serialized)` 完整重解析，并在 `ledgerFileRepository.ts:2332` 抛 `READBACK_FAILED`。**非精确字节的 readback 无论如何都无法被接受。**
- 认证不因局部写而跳过：`crypto.verifyManifestV3S3(file)` **无条件执行**；current 代 `verifyGeneration(...)` **无条件执行**（真实 AES-GCM 解密与认证）。`exactExpectedBytes` 唯一放宽的是 `ledgerFileRepository.ts:2332` 那条 `sameBytes(serializedFile, expected.serializedFile)` ——**而这正是使 `exactExpectedBytes` 为真的那个条件本身，是同义反复，不构成放宽**。
- previous 代在元数据 `sameGeneration` 相符时复用上次已验证结果、不重复解密。这在「整文件字节已被证明与预期精确相等」的前提下是充分的（那些密文字节写入时已认证过，且 S2-G 证明该槽未被重写）。

**第二句「仅在能证明安全时补偿」——不弱。** `restoreImportBaseline` 先完整读盘；只有 `sameBytes(currentText, pending.serializedFile)`（盘上恰为本次 candidate）才允许补偿，且补偿用的是既有的 `keepExistingData: false` 整文件原子写，写后再 `sameBytes` 校验并完整 `verifySerializedLedgerFile`。

**第三句「无法证明时停止、不显示成功、不盲写」——不弱。** 盘上既非精确 base 也非精确 candidate → 直接 `importRecoveryBlockedError`，**不写任何字节**。普通保存路径对应 `EXTERNAL_CHANGE`。

**判定：S2-E 成立。`06C` 的论证我验证过，不是复述。**

---

## 五、通电检查抽查（G 项）

按任务要求优先抽 Q-4 与 S2-F，自己动手破坏后还原。

### 5.1 Q-4（IV 不重用）——通电有效 ✅

破坏：在 `ledgerFileCrypto.ts` 的 `createIvBase64UrlV3S3` 开头插入 `for (const reused of forbidden) return reused;`，令其在 forbidden 非空时直接复用。

结果：**1 failed／74 skipped**，错误为

```
LedgerFileRepositoryError: Generated ledger file failed its own V3 S-3 contract
  ❯ assertValidLedgerFile src/platform/files/ledgerFileRepository.ts:2620
```

**变红。** 且这里有一个额外的好消息：拦截来自**产品自身的 V3 S-3 合同校验器**（`validateLedgerFileV3S3` 内含 IV 唯一性不变式），也就是说产品**在写盘之前就拒绝生成 IV 重用的文件**，不是只靠测试兜底。

还原：`shasum -a 256 src/platform/files/ledgerFileCrypto.ts` = `89b1960018a1d159825c0526fe39c863a4ee282a3434cce7f5c813c12335073c`，**与破坏前相同**；`git status --porcelain` 空。

### 5.2 S2-F（写坏后能恢复）——`06C` 的记述在 HEAD 上无法复现 ⚠️

**这是本次验收的主要发现。**

`06C` 的 R-17 表写：

> S2-F current 损坏恢复｜临时关闭 `verifyLedgerFileForOpen` 中「current 失败而 previous 验证成功则返回 recovery-required」分支｜**1 failed／62 skipped，返回 `AUTHENTICATION_FAILED`**｜1 passed／62 skipped

我按这个描述原样破坏 `ledgerFileRepository.ts:2405`：

```ts
if (!current) {
-   if (file.previous && previous) {
+   if (false && file.previous && previous) {
      return { status: "recovery-required", previous };
    }
```

**结果：1 passed／74 skipped——测试没有变红。**

追查原因：`LedgerFileRepository.openForAccess`（`ledgerFileRepository.ts:404` 起）对**两个头槽候选逐个尝试**。最新头槽的 `verifyLedgerFileForOpen` 抛错时执行 `firstError ??= error; continue;`，回落到较旧的头槽；旧头槽指向未被破坏的上一代体槽，验证成功，随后

```ts
const olderHeaderRecovery = index > 0;
if (verified.status === "recovery-required" || olderHeaderRecovery) { … }
```

**同样产出 `recovery-required`**，恢复源为旧头槽的 current，即上一代账本。因此 `recovered.load()` 仍然 `toEqual(ledgerBefore)`，全部断言照常通过。

为确认该用例并非空测试，我把**两条路一起关掉**（追加 `olderHeaderRecovery = false`）：

```
AssertionError: expected 'opened' to be 'recovery-required'
Expected: "recovery-required"   Received: "opened"
  ❯ ledgerFileRepository.test.ts:1317
1 failed／74 skipped
```

**变红。**

还原：`shasum -a 256 src/platform/files/ledgerFileRepository.ts` = `a760c39f81dde64bb7a0dbd4f7b7a49d655206a4a79ea917e3b7010ed5fb80fc`，**与破坏前相同**；`grep -rn "TEMPORARY SABOTAGE" src` 无残留；`git status --porcelain` 空；重跑 S2-F／S2-G **2 passed**。

**如何解读：**

1. **不是产品缺陷，反而是产品的优点。** 存在两条互相独立的恢复路径（同代 previous、旧头槽），任一条都能正确恢复到上一代且逐字段相同。这比 `06A` 0.4／`06B` S2-1／S2-2 要求的更厚。
2. **不是空测试。** 两条路全关即变红，说明用例确实绑定了「current 被写坏后必须能恢复」这个性质。
3. **但 `06C` 那一行结论在最终代码上不成立。** 它是在 S-2 阶段提交 `2723b46` 上取得的（当时 S-3 尚未引入）。**我没有回到 `2723b46` 复跑（会改动工作树与 HEAD，违反收尾约束），因此无法判断它当时是否属实——记为未核验。** 需要更正的是：该结论未在最终实现上重新取得，`06C` 也未声明这一点。

### 5.3 一处次要表述不准

`06C`「S-1 实现与 A.4 通电检查」小节把 A-23 的 V3 等价构造描述为：

> V3 的等价物是**只给 JSON 头增加尾随空白并同步头长度**，原始密文体不变、文件总长度仍与头声明精确一致。

实际实现（`readLedgerFileForTest.ts:778` `appendLedgerFileJsonWhitespaceForTest`）是：

```ts
changed.fill(0, headerStart, headerStart + LEDGER_FILE_HEADER_SLOT_BYTES);  // 整个 256 KiB 头槽清零
view.setUint32(headerStart, headerBytes.byteLength, true);
changed.set(headerBytes, headerStart + 4);                                   // 只写回长度与 JSON
```

**整个头槽被清零后重写，其中包含槽尾 16 字节的 manifest 认证标签**（`LEDGER_FILE_V3_S3_MANIFEST_TAG_BYTES = 16`，位于槽末），该标签被留成全零。「原始密文体不变、文件总长度一致」两句为真，但「只增加尾随空白」不准确。

**影响评估：不影响被保护的性质。** 如二·3 所述，该分支完全由 `sameBytes` 在任何密码学验证之前决定，认证标签是否有效不参与选路。唯一的细微差别是：原 V2 构造产出的是「语义完全有效但字节不一致」的文件，V3 构造产出的是「字节不一致且认证也不再有效」的文件，因此对「假想中存在语义等价接受路径」的甄别力略有下降——但我确认**代码中不存在任何语义等价接受路径**，接受与否只看 `sameBytes`。建议更正表述，不必更改实现。

---

## 六、黄金样例（E 项）

| 项目 | 我的核验 | 判定 |
| --- | --- | --- |
| G-1（V2 C 文件） | `golden-ledger-file-format-v2-crypto-v1-ledger-schema-v4.lftl`，5,946 B，SHA-256 `d143d621…7427`（与 `06C` 一致）；`4a66905` 加入后再未被任何提交触碰 | ✅ 存在且冻结 |
| G-2（有内容的 V4 B 文件） | `golden-backup-format-v3-ledger-schema-v4-rich.json`，4,578 B。用例断言其解析后 `ledgerData` `toEqual(createGoldenStorageScenario())`，且 `backupFormatVersion` 3／`ledgerSchemaVersion` 4，并做 round-trip 序列化比对 | ✅ |
| G-3（索引 README） | 5 份样例逐行列出文件名／版本组合／加入日期／覆盖情形／密码；另有「Known gaps」登记 backup 1／2 缺失 | ✅ |
| **版本 3 黄金样例**（`06B` 4.2） | `golden-ledger-file-format-v3-crypto-v1-ledger-schema-v4.lftl`，**4,718,608 B**，SHA-256 `116bbeab…0668`——**与 `06C` 声明的字节数与哈希逐位相同**。配套用例「freezes and opens the product-path file format V3 fixture without mutation」存在 | ✅ 已加入夹具 |
| 既有黄金样例未被改动 | `golden-backup-format-v3-ledger-schema-v3.json` 与 `…-v4.json` **不在本批任何提交的文件清单内** | ✅ |

**一处程序性观察（不构成违约）**：根 `AGENTS.md` 第 63 行要求「任何一个版本号升级时，必须在**同一次改动中**把该版本的黄金样例文件加入……夹具」。V3 样例落在 `a32549b`，晚于格式提交 `2b87216`／`0080724`。但 `06B` 4.2 与修订 C.1 的操作性措辞是「格式定型后**立即**产出……**必须在本批合入 `main` 之前完成**」，样例确在合入前就位。按执行合同判定为**已满足**；若按 `AGENTS.md` 逐字理解为「同一提交」则未满足。建议产品负责人明确二者口径，本报告不据此扣分。

---

## 七、性能数字：只核内部一致性（F 项）

**我没有重跑任何浏览器量尺，未核验其真实性。** 以下只核验内部一致性、与仓库内已提交证据的一致性、以及算术。

本批把量尺 JSON 提交进 `benchmarks/evidence/w15-storage/`（`05D` 指出的「除重跑外没有第二条佐证路径」问题已被修复），因此我能做机械比对。

### 7.1 M-3 与量尺证据逐格比对：16/16 相符

我从各阶段的 `0*.json` 中机械提取 `metrics[].metric == "M-3"` 的 `statistics.medianMs`：

| 阶段 | S-100 | S-1K | S-10K | S-100K |
| --- | ---: | ---: | ---: | ---: |
| V2 基线 | 107.354 | 241.611 | 1755.710 | 18630.442 |
| S-1 | 90.530 | 175.043 | 1014.023 | 9630.737 |
| S-2 | 106.736 | 207.850 | 1188.917 | 11449.299 |
| S-3 最终 | 126.936 | 132.813 | 257.767 | 1556.137 |

**16 个数字与 `06C` 正文逐格相同，无一例外。** M-1 冷启动 8 个数字（R-6 表）同样逐格相符。

### 7.2 百分比与倍数：全部重算，算得对

| 档 | S-1 我算 / `06C` | S-2 我算 / `06C` | S-3 我算 / `06C` | 合计我算 / `06C` |
| --- | --- | --- | --- | --- |
| S-100 | −15.67 / −15.67 | +17.90 / +17.90 | +18.93 / +18.93 | +18.24 / +18.24 |
| S-1K | −27.55 / −27.55 | +18.74 / +18.74 | −36.10 / −36.10 | −45.03 / −45.03 |
| S-10K | −42.24 / −42.24 | +17.25 / +17.25 | −78.32 / −78.32 | −85.32 / −85.32 |
| S-100K | −48.31 / −48.31 | +18.88 / +18.88 | −86.41 / −86.41 | −91.65 / −91.65 |

绝对差值（`+16.206`／`+32.807`／`+174.894`／`+1818.562`；`+20.200`／`−75.037`／`−931.150`／`−9893.162`）也逐个重算相符。

### 7.3 分段归因各自有据 ✅

三段各有独立提交与独立量尺目录：`2b87216`→`97a93eb`（s1-raw-container）、`2723b46`→`90d143f`（s2-whole-ledger-slots）、`c6d57c4`→`9bb51dc`（s3-chunked-blocks-final）。S-1／S-2／S-3 **各自独立提交**，符合 `06B` 0.1 与三·开头的分别归因要求。

**S-2 是负结果，报告如实记录为四档全部变慢、未取得时延收益，没有用体写字节数顶替 M-3。** 这一点值得肯定——它与 `06A` 0.2 层 C 的预期相反，却没有被粉饰。

### 7.4 文件体积：−33% 未兑现，报告的更正是对的

实测减少 24.85%／24.98%／25.00%／25.00%，我重算与 `06C` 相符。`06A`／`06B` 写的「−33%」确实没兑现；`06C` 指出 base64 相对原始字节是 **+33.33% 膨胀**，反向以旧文件作分母应为 **25% 减少**——**这个换算在数学上是对的**（4/3 → 1 即减少 1/4）。报告没有回避合同数字未兑现，而是给出了正确换算，属实。

### 7.5 四档判定表与正文一致 ✅

我从 `s3-chunked-blocks-final` 与 `final-m9-retention` 证据中机械提取，与 R-8 判定表逐格比对：

| 档 | M-3 | M-4 最大 | M-5 最大 | M-6 最大 | M-9 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 10² | 126.936 ✅ | 29.171 ✅ | 73.864 ✅ | 30.234 ✅ | 3002 ✅ |
| 10³ | 132.813 ✅ | 29.911 ✅ | 72.163 ✅ | 30.180 ✅ | 3032 ✅ |
| 10⁴ | 257.767 ✅ | 29.620 ✅ | 70.969 ✅ | 30.484 ✅ | 2996 ✅ |
| 10⁵ | 1556.137 ✅ | 46.575 ✅ | 93.293 ✅ | 30.827 ✅ | 3000 ✅ |

M-5 与 M-6 确实是「取各方向中位数的最大值」，不是把方向合成新中位数——我按该口径复算得到同一组数字。四档均在 `06A` 3.1 的线内，**05 批成果（M-4／M-5／M-6／M-9）未劣化**。

### 7.6 浏览器版本不一致——报告已主动披露 ✅

证据中 V2 基线为 Chrome `151.0.7922.171`，S-1／S-2／S-3 为 `152.0.7977.65`。**`06C` 主动写明「不能冒充严格同版本 A/B」**，与证据相符。这是诚实的自我限定，不是被我查出来的。

### 7.7 10⁶：M-3「未取得」如实记录 ✅

这是任务书点名要查的一条。证据文件内容：

```json
{ "backup": { "status": "failed", "serializationMs": 507.716,
              "reason": "RangeError: Invalid string length" },
  "rssBytesAfterProbe": 2813165568 }
{ "status": "setup-failed", "stage": "backup-serialization",
  "reason": "The synthetic backup for S-1M exceeded the runtime string limit" }
```

**与 `06C` R-9 的每一个数字逐位相符**（2,093.237／9,990.588／4,074.468／1,587.106／507.716／2,813,165,568）。M-3 确为「未取得」，**没有用 Node 派生耗时或探针耗时顶替**。失败点在 B 文件 JSON 序列化处，属 `06A` N-5 明文划出本批范围之外的路径，报告也明说「失败原因没有从字符串上限转移」——**这是如实记录，不是拿别的数字顶替。**

---

## 八、额外核查：本批新增的增量派生路径（B-03）

`c6d57c4` 为达标而新增了若干增量快路径（`dashboardDerivations.ts`、`pnlSummaryService.ts`、`chartDataService.ts`、`ledgerProjection.ts`、`positionReplay.ts`、`resourcePolicy.ts`）。这类改动天然有「算出来的钱不一样但没人发现」的风险，因此我额外查了。

**结论：没有改动任何既有派生计算的定义，且增量结果有等价性测试守着。**

- 六个文件的删除行合计只有 4 行（两行 `import`、两处被 `??` 包装的原调用），**没有任何既有计算公式、精度或校验被修改**。
- `dashboardDerivations.ts` 中 `pnlSummary` 与 `history` 都是 `增量 ?? 全量重算` 的回退结构；`heatmap` 是无回退的直接替换——**但它被等价性测试覆盖**：
  - **既有**（来自 `main`、本批未改）的 `it.each` 四种追加类型用例，每条都断言 `expect(update.values).toEqual(buildDashboardDerivations(nextLedger, OPTIONS))`；
  - **本批新增**的 5 档 chartRange 用例，同样断言与全量重算 `toEqual`。
- 仓库层快路径 `createCanonicalPayloadAfterBuyTrade` 的结果由 `ledgerFileRepository.test.ts:836` 断言 `repository.load()` `toEqual(ledgerReducer(ledger, action))`——**与 reducer 全量结果比对**，若快路径产出不同的 `ledgerData` 会立刻变红。
- 新增的 `evaluateLedgerResourcePolicyAfterTradeAppend` 比全量策略窄（只逐字段校验新追加的那一笔 + 全部集合计数）。我核了调用点：失败时 `return null` → 调用方回落到 `createCanonicalLedgerPayloadV4(ledgerReducer(...))` **全量路径**，属 fail-safe；且其前提「base 已完整验证」由 `this.verified` 保证。另有新增用例断言它与全量策略 `toEqual`。
- Q-1 冻结快照 7/7 仍然通过（我实跑）。

---

## 九、`06C` 自述与我核验结果的对照总表

| `06C` 的声明 | 我的核验方式 | 结论 |
| --- | --- | --- |
| Q-1 7/7 | 自己实跑 | ✅ 属实 |
| Q-2 五情形 5/5 | 自己实跑 + 读用例 | ✅ 属实 |
| Q-4 PASS | 自己实跑 + 读用例 + 自己通电 | ✅ 属实 |
| Q-3 已作废、无迁移器 | 全仓库检索产品调用点 | ✅ 属实 |
| Q-5 全量 104/1174、typecheck、lint、whitespace | 自己实跑 | ✅ 属实 |
| Q-5 production build、结构守卫 7/7 | — | **未核验** |
| 只有 6 条既有断言被改 | 机械提取全部被删 `expect(` 行 | ✅ 属实 |
| 断言总数无减少 | 自己逐文件计数 | ✅ 属实，逐格相同 |
| V2 合同测试原样保留 | 文件级 diff 比对 | ✅ 属实 |
| 只升 `fileFormatVersion` | 代码内逐个确认 | ✅ 属实 |
| 未改加密参数 | 常量文件整份未改 + 零删除行 | ✅ 属实 |
| C-01 G-1 哈希 `d143d6…` | 自己 `shasum` | ✅ 逐位相同 |
| V3 黄金样例 4,718,608 B／`116bbeab…` | 自己 `shasum` + `ls` | ✅ 逐位相同 |
| 未新增用户可见文案 | 检索新增中文行 | ✅ 属实 |
| S2-E 保存合同一条不弱 | 自己顺代码走两条路径 | ✅ 论证成立 |
| S2-G 证明 previous 槽未重写 | 读断言 | ✅ 属实（双重证明） |
| **S2-F 通电：关掉该分支即变红** | **自己复现** | ⚠️ **在 HEAD 上不成立**（见五·2） |
| A-23 的 V3 构造「只加尾随空白」 | 读实现 | ⚠️ **表述不准**（见五·3） |
| 全部 M-3／M-1 数字 | 与已提交证据 JSON 机械比对 | ✅ 16/16 + 8/8 相符 |
| 全部百分比与差值 | 自己重算 | ✅ 全部算得对 |
| 四档判定表 | 与证据比对 | ✅ 逐格相符 |
| 10⁶ M-3「未取得」 | 读证据 JSON | ✅ 如实，无顶替 |
| **性能数字的真实性** | — | **未核验（未重跑）** |
| H-1 触发、H-2～H-6 未触发 | 与裁决记录及代码交叉核对 | ✅ 与事实一致 |

---

## 十、收尾状态

| 项目 | 状态 |
| --- | --- |
| 源码仓库工作树 | **clean**（`git status --porcelain` 空） |
| 源码仓库分支 | `zhennn/w15-main-chunked-storage`，HEAD **`fd32c2e`**（停在原位） |
| 通电检查残留 | 无。两个被临时改动的文件 SHA-256 均与破坏前逐位相同；`grep -rn "TEMPORARY SABOTAGE" src` 无输出 |
| merge／push／rebase／破坏性 git | **未执行** |
| `~/Downloads/history_OKX/`、真实 `.lftl`、真实 B | **未读取、未打开** |
| 根文档仓库 | **clean**。`06C` 提到的 `.obsidian/app.json` 与 `03_Nivida/` 用户改动已由用户自己在 `382d0e0`（NVIDIA 课程笔记）提交，**不属于本批产出，本次验收未触碰** |
| 本报告 | 单独提交至根文档仓库，不与源码仓库混提 |

---

## 十一、解除条件

1. **更正 `06C` R-17 中 S2-F 的通电检查记述**：说明该结论取得于 S-2 阶段提交 `2723b46`，在最终 S-3 实现上因存在旧头槽回落这条独立恢复路径而不再复现；或在 HEAD 上重新取得一次有效通电（需同时关闭两条恢复路径）。
2. **更正 `06C` 中 A-23 的 V3 构造表述**（五·3）：补上「整个头槽被清零重写、manifest 标签被置零」这一事实。
3. **性能结论的证据等级**由产品负责人明确接受：四档判定基于未经第二方复现的浏览器数据，且 V2 基线与 S-1／S-2／S-3 的 Chrome 主版本不同（151 vs 152）。
4. （建议，非阻塞）明确 `AGENTS.md` 第 63 行「同一次改动」与 `06B` 4.2「本批合入前」的口径关系（见六）。

以上 1～3 解除后即为 PASS。

**本报告不授权合入 `main`，不授权推送。**

---

## 附：给非专业读者的一句话总结

这一批把「每存一次账本就重抄一整本」改成了「只重抄改动的那一小块」，10 万笔规模下存一笔从 18.6 秒降到 1.6 秒。我最担心的是「账算错了但没人发现」——**我自己跑了那三道把关测试，都过；自己逐行数了所有测试断言，一条都没被偷偷改软；自己动手破坏代码验证测试真的会报警，也真的报了。** 唯一的问题是执行者报告里有一处「我破坏了 X，测试变红了」的记录，我照着做发现测试没变红——**不是产品有毛病，恰恰相反，是产品准备了两条后路，关掉一条还有另一条顶着**，只是报告没写清楚这件事。
