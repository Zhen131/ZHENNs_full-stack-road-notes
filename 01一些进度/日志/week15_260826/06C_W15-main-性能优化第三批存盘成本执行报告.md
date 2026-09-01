# 06C_W15-main｜性能优化第三批「存盘成本」执行报告

- 日期：2026-08-31
- 源码分支：`zhennn/w15-main-chunked-storage`
- 起点：`main@8df62d8`
- 状态：**S-1 实现与独立 M-3 已完成；S-2 开工前发现其恢复合同依赖尚未实施的 S-3 分块，已停止并等待裁决**；本批不实现迁移器
- 合同：`06A_W15-main-性能优化第三批存盘成本产品定义.md`、`06B_W15-main-性能优化第三批存盘成本执行文档.md`

## 结论

阶段〇已先于任何格式代码改动完成并独立提交。版本 3 的最终目标仍是**双固定头槽 + 固定体槽 + 原始 AES-GCM 字节**：头槽只重写固定小区域，事实块独立加密并按需换槽；`previous` 只保存本次变化块的旧引用，未变化块由两代共享。块之间没有哈希链，改历史事实不要求重写其他事实块。

H-1 的最终裁决是：产品继续处于 Alpha，只在解密前识别 V2 的明文版本并明确拒绝，不验证 V2 密文外壳、不派生密钥、不解密、不写回；本批不实现迁移器。S-1 已于源码提交 `2b87216` 完成，加密输出到落盘之间始终保持 `Uint8Array`，不再经过密文 base64 编码→解码往返。

本报告随执行继续补齐。尚未取得的实测值不会提前推断。

### 历史暂停申报：B-05 与现有测试发生不可回避的冲突

阶段一完成后、首次格式代码改动前审查测试，确认现有测试把“当前产品写出的 C 文件”直接当作 V2 纯 JSON：

- `ledgerFileRepository.test.ts` 多处执行 `JSON.parse(handle.text()) as LedgerFileV2`，并按 `current`／`previous`、`ciphertextBase64Url`、V2 IV 检查写入与恢复；
- `usePersistentLedger.fileCapabilities.test.tsx` 与 `ledgerFileAccessController.test.ts` 同样解析或构造 `LedgerFileV2`；
- 新格式的原始密文字节不可能同时是可由 `JSON.parse` 读取的 V2 纯 JSON。

因此实施 S-1 必然需要把上述**当前格式专属断言**迁移为 V3 等价断言，同时保留 V2 合同和阶段〇黄金样例测试。`06B` B-05 明确规定：“若既有测试因本批而必须调整，停止并在 `06C` 中申报，等待裁决。”执行者当时未修改任何既有测试断言、阈值或格式代码，并等待产品负责人明确决定是否允许：

1. 保留所有行为／安全语义断言与阈值；
2. 只把直接绑定 V2 字节形状的既有断言迁移为 V3 字节形状；
3. V2 合同测试继续原样保留，用于旧样例、拒绝边界与后续迁移器。

---

## R-1｜阶段〇黄金样例

源码提交：`4a66905 test: freeze V2 ledger and rich V4 backup fixtures`。

| 产物 | 实际内容 |
| --- | --- |
| G-1 | `golden-ledger-file-format-v2-crypto-v1-ledger-schema-v4.lftl`。先走正式创建路径生成空账本，再走 `LedgerFileRepository.save` 保存完整虚构场景；含相邻的 `current`／`previous` 两代，固定密码为 `W15-Golden-V2-Fictional-Ledger` |
| G-2 | `golden-backup-format-v3-ledger-schema-v4-rich.json`。含两笔不同成本的买入、一笔跨两批成本的卖出、同一资产在交易所与冷钱包的分布、一笔含链上手续费的内部转移、一条现金事件和一条价格快照 |
| G-3 | `test-fixtures/golden/README.md`。逐份登记版本组合、加入日期、覆盖情形与密码，并登记 backup format 1／2 样例缺失 |

配套读取测试：`goldenStorageFixtures.test.ts` 联同既有黄金样例测试、结构守卫共 **3 files／11 tests PASS**；`npm run typecheck` 与 `git diff --check` PASS。阶段〇提交时四版本仍为 file 2／crypto 1／ledger schema 4／backup 3，格式实现文件零改动。

---

## R-2｜版本 3 目标格式规格（F-1～F-7）

### F-1 字节布局

所有整数采用无符号 32 位 little-endian。文件布局固定为：

```text
[8 B magic = "LFTL3\r\n\0"]
[4 B headerSlotBytes]
[4 B bodySlotBytes]
[header slot A: 固定 headerSlotBytes]
[header slot B: 固定 headerSlotBytes]
[body slot 0: 固定 bodySlotBytes]
[body slot 1: 固定 bodySlotBytes]
...
```

每个头槽内部为：

```text
[4 B JSON byte length]
[UTF-8 canonical JSON]
[零填充]
[16 B raw AES-GCM manifest authentication tag]
```

两个头槽轮换写入。打开文件时先解析两槽，按 `sequence` 选择最新候选；取得密钥后验证 manifest tag。最新槽损坏而旧槽有效时进入显式恢复，不静默降级。体区按固定槽定位，块可占一个或多个槽；`ciphertextByteLength` 指定最后一槽的有效字节，尾部必须为零填充。普通保存只写新密文所在体槽及一个固定头槽，不复制未变化块。

初值：`LEDGER_FILE_HEADER_SLOT_BYTES = 256 KiB`、`LEDGER_FILE_BODY_SLOT_BYTES = 1 MiB`。按当前资源上限最多约 801,000 条事实、每块 2,000 条约 401 个事实块；256 KiB 可容纳两代增量元数据并留有余量。若实现前的结构上界证明不足，停止申报，不临时压缩字段或放宽资源线。

### F-2 明文 JSON 头字段

头的规范字段与顺序固定：

| 字段 | 含义 |
| --- | --- |
| `fileFormatVersion` | **3** |
| `cryptoVersion` | **1** |
| `ledgerSchemaVersion` | **4** |
| `backupFormatVersion` | **3** |
| `fileId` | C 文件身份 |
| `sequence` | 双头槽单调递增序号 |
| `revisionId`／`parentRevisionId` | 当前账本修订关系 |
| `crypto` | PBKDF2／SHA-256／600,000、salt、AES-GCM／256／128；参数不变 |
| `recordsPerBlock` | 具名分块常量的落盘值 |
| `bodySlotBytes`／`bodySlotCount` | 固定体槽大小与文件已分配槽数 |
| `manifestAuthIvBase64Url` | 本次头清单认证专用 12 B IV；每次换头必须换新 |
| `current` | 控制块引用、事实块有序引用、当前开放块 ID |
| `previous` | 上一修订的增量恢复信息或 `null` |

四个版本号均为顶层明文字段，可在索取密码和解密前判版。`backupFormatVersion` 只是声明当前 C 内账本对应的 B 信封版本，不改变 B 格式。

### F-3 块元数据、IV 与认证

每个块引用固定包含：

```text
blockId, role(control|facts), order, sealed, recordCount,
ledgerSchemaVersion, ivBase64Url, plaintextByteLength,
ciphertextByteLength, bodySlots[]
```

- `control` 块保存当前 `savedAt`；事实块保存事实数组。两类明文都继续使用原 `DecryptedLedgerPayloadV4`：JSON、UTF-8、`ledgerData` 七个字段与每条事实字段均不变。
- 每个事实块的 `ledgerData` 只填入归属该块的事实，其余集合为空；读取时按块 `order` 合并六类事实数组，以控制块的 `savedAt` 组成完整原 payload，再走既有全量验证。
- 每块独立使用 AES-GCM，IV 仍为 12 B，认证标签仍为 128 bit。AAD 只包含文件身份、四版本、该块自身元数据及修订身份，不包含任何其他块的哈希或密文。
- manifest tag 使用相同 AES-GCM 参数、独立新 IV、空明文和规范 JSON 头作为 AAD；16 B tag 以原始字节放在头槽尾部。
- 任意新块、重写块、控制块与 manifest 每次写入都生成新 IV；全文件当前块、上一代变化块和双头槽可达的 manifest IV 必须互不相同。

块之间**没有哈希链，也不在彼此 AAD 中互相引用**。修改两年前的交易只重写其事实块、控制块和一个头槽，不重加密其他事实块。

### F-4 截断、缺块与篡改检测

验证顺序固定：

1. 校验 magic、固定槽大小、头 JSON 长度、严格字段、四版本和文件总长度。
2. 校验 manifest tag，防止攻击者通过改头删除块引用或替换偏移。
3. 校验 `bodySlotCount` 与实际文件长度完全相符；全部块槽号须在界内、同一代不得重叠，`ciphertextByteLength` 必须落在已声明槽容量内。
4. 对每个可达块按自身 AAD 做 AES-GCM 认证；缺块、截断、换块或单字节变化均失败。
5. 合并后重新执行 `DecryptedLedgerPayloadV4`、`LedgerData`、资源策略和 schema 一致性验证。

不得用非密钥校验和替代 manifest tag。某一块失败不得用另一块内容猜测补齐。

### F-5 `previous` 的增量表示

`previous` 只包含：

```text
revisionId, parentRevisionId,
controlBlock（上一代控制块引用）,
changedFactBlocks[]（本次变化块的旧引用）,
currentOnlyBlockIds[]（本次新建、上一代不存在的块）
```

恢复上一代时，以 `current.factBlocks` 为基底：用 `changedFactBlocks` 按 `blockId` 替换，删除 `currentOnlyBlockIds`，并换回上一代控制块。未变化块由两代共享同一原始密文引用。旧头槽仍保留为写头中断时的恢复入口，但不复制任何事实密文。

写新版前只可使用**两个头槽均不引用**的体槽；新头槽和新块全部复读、认证成功后才更新内存中的已验证基线。写坏当前块时，`previous` 必须仍能完整重建上一代。

### F-6 开放块与封块

- 事实块按**事实数量**分，不按时间、不按集合；一个块可同时含多类事实。
- 新事实一律进入 `current.openBlockId`；块内保持写入顺序，不按日期重排。
- `recordCount < RECORDS_PER_LEDGER_BLOCK` 时该块为开放块；达到常量时立即标为 sealed，`openBlockId = null`。
- 当没有开放块且出现下一条新事实时才新建块，因此不产生空事实块。空账本只有控制块，没有事实块。
- 修改或删除旧事实只重写其原块。已封块删除后即使变稀疏也保持 sealed，不回填、不合并；这是已接受的稀疏块边界。
- 发现整本替换或既有事实跨块重排时允许 O(总量) 重建；普通新增、编辑、删除必须只触及开放块或事实所在块。

### F-7 每块数量常量

初值为：

```ts
export const RECORDS_PER_LEDGER_BLOCK = 2_000;
```

依据：落在 `06A` 指定的 1,000～5,000 区间；10⁵ 约 50 块、10⁶ 约 500 块，单次普通修改约重写总事实的 0.2%，而元数据规模仍能稳定落入固定头槽。该值是实施初值，不冒充实测结论；阶段四须用 M-3 与冷启动实测决定最终值，R-5 再记录最终取值。

---

## R-3～R-12｜执行中状态

修订 A 已在根文档提交 `ab1491d` 生效，原 B-05 暂停获得确认并解除。恢复后先冻结迁移前证据，尚未改动测试或格式代码：

| 文件 | 迁移前 `expect(` 数量 |
| --- | ---: |
| `src/platform/files/ledgerFileRepository.test.ts` | 276 |
| `src/app/usePersistentLedger.fileCapabilities.test.tsx` | 169 |
| `src/app/ledgerFileAccessController.test.ts` | 203 |

V2 正式四档 M-3 基线已取得。逐档记录开始时刻与执行序号，每档结束后均静置至少五分钟；全部使用 production 模式和虚构数据：

| 序号 | 档位 | 开始时刻 | M-3 中位数 | 样本数 |
| ---: | --- | --- | ---: | ---: |
| 1 | S-100 | 2026-08-31 21:20:08 +0200 | 107.354 ms | 10 |
| 2 | S-1K | 2026-08-31 21:25:34 +0200 | 241.611 ms | 10 |
| 3 | S-10K | 2026-08-31 21:43:24 +0200 | 1,755.710 ms | 10 |
| 4 | S-100K | 2026-08-31 21:49:49 +0200 | 18,630.442 ms | 3 |

四档均为 Chrome `151.0.7922.171`，`consoleErrors = []` 且 `temporaryArtifactsCleaned = true`。21:38 左右曾有一次 S-10K 探测因没有先记录开始时刻而被排除，未作为序号、未写入上表、未冒充中位数；此后重新静置五分钟再执行正式序号 3。

原始 JSON、执行序号／开始时刻清单及 V2 实际文件字节数已从忽略目录机械复制到可跟踪路径 `benchmarks/evidence/w15-storage/v2-baseline/`，源码提交为 `755a050 Record the V2 storage benchmark baseline`。该目录只含确定性虚构数据；`run-metadata.json` 明确标记文件字节量尺不是浏览器 M-3 的替代数据。

### 修订 A 数量核对差异（再次暂停）

修订 A 写明三个文件共有 33 处 `JSON.parse(...) as LedgerFileV2`，分布为 25／4／4；但在源码起点 `8df62d8` 与当前 `4a66905` 上逐文件复核，三文件之间没有 diff，实际结果为：

| 文件 | 带 `as LedgerFileV2` 的外壳解析 | 其他 V2 外壳解析 | 全部 `JSON.parse` |
| --- | ---: | ---: | ---: |
| `ledgerFileRepository.test.ts` | 17 | 1（`readVerifiedFile`） | 19（另 1 处是内层 payload） |
| `usePersistentLedger.fileCapabilities.test.tsx` | 3 | 0 | 3 |
| `ledgerFileAccessController.test.ts` | 1 | 0 | 1 |
| **合计** | **21** | **1** | **23** |

因此当前可定位的是 22 个 V2 外壳读取点，而不是 33 个；其中只有 21 个符合修订 A 所写的强转文本。若把 33 理解为受这些读取点保护的断言数量，又缺少 25／4／4 的权威逐条位置，执行者无法在不猜测的前提下交出 A.3 的 33 行一一对照表，也不能声称完成“33 行解析替换”。据总合同“凡遇‘这样应该也行吧’一律停下来申报”，A.1 测试迁移与 S-1 再次暂停，等待产品负责人澄清 33 的统计对象或给出准确位置。

截至第二次暂停，S-1／S-2／S-3 分段后测、最终文件体积对照、块常量实测、冷启动、Q-1～Q-5、四档最终判定、10⁶ 探测与最终版本证明均**未取得**。当时 H-1～H-5 均未触发；该次暂停不是 H-1～H-5，而是修订 A 的可审计数量与源码事实不一致。当时否定性事实：未改派生数值、未改既有测试断言、未改加密参数、未读私有数据区、未 merge／push／rebase、未改任何格式代码。


### 修订 B 解除与 B-11～B-13 自证

根文档提交 `a07b882` 的修订 B 已确认前两次停止均正确，并废止修订 A 的“33 处”与三文件限定。本次采用“测试为谁而写”的语义判据。检索以匹配行为线索为入口，分类单位是一个逻辑测试或共享测试辅助函数；同一测试中的多行命中不重复计数。

正式检索命令：

```sh
rg -n --glob '*.{test,spec}.{ts,tsx}' 'LedgerFileV2|validateLedgerFileV2|LEDGER_FILE_OUTER_V2_CONSTANTS|MAX_LEDGER_FILE_V2_BYTES|createLedgerFileGenerationAadV2|fileFormatVersion[^[:alnum:]]*2|file format V2|file-format-v2|GOLDEN_LEDGER_FILE_V2|ciphertextBase64Url|ivBase64Url' src
```

原始输出（未裁剪）：

```text
src/app/usePersistentLedger.test.tsx:1548:      ciphertextBase64Url: "not valid!",
src/app/usePersistentLedger.fileCapabilities.test.tsx:13:import type { LedgerFileV2 } from "@/platform/files";
src/app/usePersistentLedger.fileCapabilities.test.tsx:188:  const file = JSON.parse(serialized) as LedgerFileV2;
src/app/usePersistentLedger.fileCapabilities.test.tsx:310:    ) as LedgerFileV2;
src/app/usePersistentLedger.fileCapabilities.test.tsx:397:    ) as LedgerFileV2;
src/app/LedgerAccessGate.test.tsx:295:    fileFormatVersion: 2,
src/app/LedgerAccessGate.test.tsx:315:      ivBase64Url: "CAgICAgICAgICAgI",
src/app/LedgerAccessGate.test.tsx:316:      ciphertextBase64Url: "CQkJCQkJCQkJCQkJCQkJCQ",
src/platform/files/ledgerFileContract.test.ts:6:  LEDGER_FILE_OUTER_V2_CONSTANTS,
src/platform/files/ledgerFileContract.test.ts:10:  createLedgerFileGenerationAadV2,
src/platform/files/ledgerFileContract.test.ts:13:  type LedgerFileV2,
src/platform/files/ledgerFileContract.test.ts:15:  validateLedgerFileV2,
src/platform/files/ledgerFileContract.test.ts:28:    ivBase64Url: bytesToBase64Url(new Uint8Array(12).fill(ivByte)),
src/platform/files/ledgerFileContract.test.ts:29:    ciphertextBase64Url: bytesToBase64Url(new Uint8Array(16).fill(9)),
src/platform/files/ledgerFileContract.test.ts:33:function createFile(previous = false): LedgerFileV2 {
src/platform/files/ledgerFileContract.test.ts:36:    fileFormatVersion: 2,
src/platform/files/ledgerFileContract.test.ts:48:describe("LedgerFileV2 contract", () => {
src/platform/files/ledgerFileContract.test.ts:50:    expect(validateLedgerFileV2(createFile()).ok).toBe(true);
src/platform/files/ledgerFileContract.test.ts:51:    expect(validateLedgerFileV2(createFile(true)).ok).toBe(true);
src/platform/files/ledgerFileContract.test.ts:77:    expect(validateLedgerFileV2(changed).ok).toBe(false);
src/platform/files/ledgerFileContract.test.ts:84:      const result = validateLedgerFileV2({
src/platform/files/ledgerFileContract.test.ts:104:    const missing: Partial<LedgerFileV2> = { ...file };
src/platform/files/ledgerFileContract.test.ts:107:    expect(validateLedgerFileV2(missing).ok).toBe(false);
src/platform/files/ledgerFileContract.test.ts:109:      validateLedgerFileV2({ ...file, businessName: "BTC ledger" }),
src/platform/files/ledgerFileContract.test.ts:112:      validateLedgerFileV2({
src/platform/files/ledgerFileContract.test.ts:121:      validateLedgerFileV2({
src/platform/files/ledgerFileContract.test.ts:130:      validateLedgerFileV2({
src/platform/files/ledgerFileContract.test.ts:134:          ivBase64Url: file.previous?.ivBase64Url,
src/platform/files/ledgerFileContract.test.ts:146:      ivBase64Url: file.current.ivBase64Url,
src/platform/files/ledgerFileContract.test.ts:149:      createLedgerFileGenerationAadV2(file, generation),
src/platform/files/ledgerFileContract.test.ts:153:      fileFormatVersion: 2,
src/platform/files/ledgerFileContract.test.ts:173:        ivBase64Url: file.current.ivBase64Url,
src/platform/files/ledgerFileContract.test.ts:177:    expect(aad).not.toContain("ciphertextBase64Url");
src/platform/files/ledgerFileContract.test.ts:228:    expect(LEDGER_FILE_OUTER_V2_CONSTANTS.fileFormatVersion).toBe(2);
src/platform/files/ledgerFileContract.test.ts:232:    expect(validateLedgerFileV2(createFile()).ok).toBe(true);
src/platform/files/goldenStorageFixtures.test.ts:9:  GOLDEN_LEDGER_FILE_V2_PASSPHRASE,
src/platform/files/goldenStorageFixtures.test.ts:23:  "../../../test-fixtures/golden/golden-ledger-file-format-v2-crypto-v1-ledger-schema-v4.lftl",
src/platform/files/goldenStorageFixtures.test.ts:38:  readonly name = "golden-ledger-file-format-v2-crypto-v1-ledger-schema-v4.lftl";
src/platform/files/goldenStorageFixtures.test.ts:76:  it("freezes and opens the product-path file format V2 fixture", async () => {
src/platform/files/goldenStorageFixtures.test.ts:93:      GOLDEN_LEDGER_FILE_V2_PASSPHRASE,
src/app/ledgerFileAccessController.test.ts:21:import type { LedgerFileV2 } from "@/platform/files";
src/app/ledgerFileAccessController.test.ts:201:  fileFormatVersion = 2,
src/app/ledgerFileAccessController.test.ts:224:      ivBase64Url: bytesToBase64Url(new Uint8Array(12).fill(8)),
src/app/ledgerFileAccessController.test.ts:225:      ciphertextBase64Url: bytesToBase64Url(new Uint8Array(16).fill(9)),
src/app/ledgerFileAccessController.test.ts:284:  ) as LedgerFileV2;
src/app/ledgerFileAccessController.test.ts:290:        ciphertextBase64Url: bytesToBase64Url(
src/platform/legacy/indexedDbStorageAdapter.test.ts:153:      ciphertextBase64Url: () => "not cloneable",
src/platform/legacy/cryptoEnvelope.test.ts:17:    ciphertextBase64Url: ciphertext,
src/platform/legacy/cryptoEnvelope.test.ts:46:      cipher: { ...createValidEnvelope().cipher, ivBase64Url: "AQ" },
src/platform/legacy/cryptoEnvelope.test.ts:48:    { ...createValidEnvelope(), ciphertextBase64Url: "not valid!" },
src/platform/legacy/cryptoEnvelope.test.ts:51:      ciphertextBase64Url: bytesToBase64Url(new Uint8Array(15)),
src/platform/legacy/cryptoEnvelope.test.ts:62:      `{"formatVersion":2,"cryptoVersion":1,"ledgerSchemaVersion":1,"kdf":{"name":"PBKDF2","hash":"SHA-256","iterations":600000,"saltBase64Url":"${salt}"},"cipher":{"name":"AES-GCM","keyLength":256,"ivBase64Url":"${iv}","tagLength":128}}`,
src/platform/legacy/cryptoEnvelope.test.ts:64:    expect(decoded).not.toContain("ciphertextBase64Url");
src/platform/legacy/encryptedLedgerRepository.test.ts:104:    expect(second.cipher.ivBase64Url).not.toBe(
src/platform/legacy/encryptedLedgerRepository.test.ts:105:      first.cipher.ivBase64Url,
src/platform/legacy/encryptedLedgerRepository.test.ts:107:    expect(second.ciphertextBase64Url).not.toBe(
src/platform/legacy/encryptedLedgerRepository.test.ts:108:      first.ciphertextBase64Url,
src/platform/legacy/encryptedLedgerRepository.test.ts:136:    const bytes = base64UrlToBytes(original.ciphertextBase64Url);
src/platform/legacy/encryptedLedgerRepository.test.ts:140:      ciphertextBase64Url: bytesToBase64Url(bytes),
src/platform/files/ledgerFileCrypto.test.ts:5:  LEDGER_FILE_OUTER_V2_CONSTANTS,
src/platform/files/ledgerFileCrypto.test.ts:46:    expect(first.ivBase64Url).not.toBe(second.ivBase64Url);
src/platform/files/ledgerFileCrypto.test.ts:47:    expect(first.ciphertextBase64Url).not.toBe(
src/platform/files/ledgerFileCrypto.test.ts:48:      second.ciphertextBase64Url,
src/platform/files/ledgerFileCrypto.test.ts:146:        name: LEDGER_FILE_OUTER_V2_CONSTANTS.kdfName,
src/platform/files/ledgerFileCrypto.test.ts:147:        hash: LEDGER_FILE_OUTER_V2_CONSTANTS.kdfHash,
src/platform/files/ledgerFileCrypto.test.ts:148:        iterations: LEDGER_FILE_OUTER_V2_CONSTANTS.kdfIterations,
src/platform/files/ledgerFileCrypto.test.ts:152:        name: LEDGER_FILE_OUTER_V2_CONSTANTS.cipherName,
src/platform/files/ledgerFileCrypto.test.ts:153:        length: LEDGER_FILE_OUTER_V2_CONSTANTS.keyLength,
src/platform/files/ledgerFileCrypto.test.ts:179:      ivBase64Url: "CQkJCQkJCQkJCQkJ",
src/platform/files/ledgerFileCrypto.test.ts:180:      ciphertextBase64Url:
src/platform/files/ledgerFileCrypto.test.ts:198:    generation.ciphertextBase64Url,
src/platform/files/ledgerFileCrypto.test.ts:201:  const changedIv = base64UrlToBytes(generation.ivBase64Url);
src/platform/files/ledgerFileCrypto.test.ts:231:        ivBase64Url: bytesToBase64Url(changedIv),
src/platform/files/ledgerFileCrypto.test.ts:238:        ciphertextBase64Url: bytesToBase64Url(changedCiphertext),
src/platform/legacy/webCryptoEncryptionService.test.ts:52:    expect(first.cipher.ivBase64Url).not.toBe(
src/platform/legacy/webCryptoEncryptionService.test.ts:53:      second.cipher.ivBase64Url,
src/platform/legacy/webCryptoEncryptionService.test.ts:55:    expect(first.ciphertextBase64Url).not.toBe(
src/platform/legacy/webCryptoEncryptionService.test.ts:56:      second.ciphertextBase64Url,
src/platform/legacy/webCryptoEncryptionService.test.ts:131:    envelope.ciphertextBase64Url,
src/platform/legacy/webCryptoEncryptionService.test.ts:134:  const changedIv = base64UrlToBytes(envelope.cipher.ivBase64Url);
src/platform/legacy/webCryptoEncryptionService.test.ts:142:      ciphertextBase64Url: bytesToBase64Url(changedCiphertext),
src/platform/legacy/webCryptoEncryptionService.test.ts:148:        ivBase64Url: bytesToBase64Url(changedIv),
src/platform/legacy/webCryptoEncryptionService.test.ts:162:        envelope.cipher.ivBase64Url,
src/platform/files/ledgerFileHandleAdapter.test.ts:3:import { MAX_LEDGER_FILE_V2_BYTES } from "./ledgerFileContract";
src/platform/files/ledgerFileHandleAdapter.test.ts:255:    handle.declaredSize = MAX_LEDGER_FILE_V2_BYTES + 1;
src/platform/files/ledgerFileHandleAdapter.test.ts:268:      exact.bytes = new Uint8Array(MAX_LEDGER_FILE_V2_BYTES);
src/platform/files/ledgerFileHandleAdapter.test.ts:270:        byteLength: MAX_LEDGER_FILE_V2_BYTES,
src/platform/files/ledgerFileHandleAdapter.test.ts:274:      overflow.declaredSize = MAX_LEDGER_FILE_V2_BYTES;
src/platform/files/ledgerFileHandleAdapter.test.ts:275:      overflow.bytes = new Uint8Array(MAX_LEDGER_FILE_V2_BYTES + 1);
src/platform/files/ledgerFileRepository.test.ts:21:  type LedgerFileV2,
src/platform/files/ledgerFileRepository.test.ts:23:  validateLedgerFileV2,
src/platform/files/ledgerFileRepository.test.ts:311:  const file = JSON.parse(serialized) as LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:412:  const file = JSON.parse(serialized) as LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:417:      ciphertextBase64Url: bytesToBase64Url(
src/platform/files/ledgerFileRepository.test.ts:425:  const file = JSON.parse(serialized) as LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:431:          ciphertextBase64Url: bytesToBase64Url(
src/platform/files/ledgerFileRepository.test.ts:443:  const file = JSON.parse(serialized) as LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:464:  const file = JSON.parse(serialized) as LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:487:  const file = JSON.parse(serialized) as LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:511:  file: LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:516:  const validated = validateLedgerFileV2(parsed);
src/platform/files/ledgerFileRepository.test.ts:710:      expect(second.file.current.ivBase64Url).not.toBe(
src/platform/files/ledgerFileRepository.test.ts:711:        second.file.previous?.ivBase64Url,
src/platform/files/ledgerFileRepository.test.ts:729:        first.file.current.ivBase64Url,
src/platform/files/ledgerFileRepository.test.ts:730:        second.file.current.ivBase64Url,
src/platform/files/ledgerFileRepository.test.ts:731:        third.file.current.ivBase64Url,
src/platform/files/ledgerFileRepository.test.ts:1258:    const diskFile = JSON.parse(handle.text()) as LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:1305:      (JSON.parse(handle.text()) as LedgerFileV2).current.revisionId,
src/platform/files/ledgerFileRepository.test.ts:1369:        const file = JSON.parse(serialized) as LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:1376:        const file = JSON.parse(serialized) as LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:1389:        const file = JSON.parse(serialized) as LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:1394:            ciphertextBase64Url: bytesToBase64Url(
src/platform/files/ledgerFileRepository.test.ts:1404:        const file = JSON.parse(serialized) as LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:1410:                ciphertextBase64Url: bytesToBase64Url(
src/platform/files/ledgerFileRepository.test.ts:1503:      const publishedFile = JSON.parse(published302) as LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:1689:      const publishedFile = JSON.parse(published302) as LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:2041:    const before = JSON.parse(handle.text()) as LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:2089:    const after = JSON.parse(handle.text()) as LedgerFileV2;
src/platform/files/ledgerFileRepository.test.ts:2149:    expect(after.file.current.ivBase64Url).not.toBe(
src/platform/files/ledgerFileRepository.test.ts:2150:      before.file.current.ivBase64Url,
src/platform/files/ledgerFileRepository.test.ts:2390:    const file = JSON.parse(handle.text()) as LedgerFileV2;
```

本命令得到 **121 个匹配行、13 个测试文件**。逐项回到所属测试与调用方核对后，得到 **22 个甲类当前输出读取／篡改点、25 个乙类冻结合同或 legacy 测试点、0 个丙类**。数字是本次实测结果，不沿用修订 A 的任何靶子。

#### 甲类：迁移为 V3

| 编号 | 文件与迁移前行号 | 逻辑点 | 判定依据 |
| --- | --- | --- | --- |
| A-01 | `ledgerFileRepository.test.ts:311` | `replaceLedgerFileSalt` 读取刚由当前仓库写出的 C | 构造当前产品 salt 漂移，随当前输出迁移 |
| A-02 | `ledgerFileRepository.test.ts:412` | `corruptCurrentCiphertext` | 篡改当前产品刚写出的 current |
| A-03 | `ledgerFileRepository.test.ts:425` | `corruptPreviousCiphertext` | 篡改当前产品刚写出的 previous |
| A-04 | `ledgerFileRepository.test.ts:443` | `replaceCurrentPlaintext` | 重加密当前产品 current 以验证拒绝路径 |
| A-05 | `ledgerFileRepository.test.ts:464` | `replacePreviousPlaintext` | 重加密当前产品 previous 以验证恢复资格 |
| A-06 | `ledgerFileRepository.test.ts:487` | `reencryptCurrentWithSamePlaintext` | 当前产品精确写入意图校验 |
| A-07 | `ledgerFileRepository.test.ts:515` | `readVerifiedFile` | 读取并验证当前仓库刚写出的 C |
| A-08 | `ledgerFileRepository.test.ts:1258` | salt 漂移后的盘上 revision | 断言当前产品写盘结果 |
| A-09 | `ledgerFileRepository.test.ts:1305` | pending-intent 后的盘上 revision | 断言当前产品写盘结果 |
| A-10 | `ledgerFileRepository.test.ts:1369` | close-readback 的 fileId 篡改 | 构造当前产品输出的损坏版本 |
| A-11 | `ledgerFileRepository.test.ts:1376` | close-readback 的 revision-chain 篡改 | 构造当前产品输出的损坏版本 |
| A-12 | `ledgerFileRepository.test.ts:1389` | close-readback 的 current 认证篡改 | 构造当前产品输出的损坏版本 |
| A-13 | `ledgerFileRepository.test.ts:1404` | close-readback 的 previous 认证篡改 | 构造当前产品输出的损坏版本 |
| A-14 | `ledgerFileRepository.test.ts:1503` | 显式恢复成功前的 published current／previous | 读取当前产品两代输出 |
| A-15 | `ledgerFileRepository.test.ts:1689` | 恢复不合资格矩阵的 published file | 以当前产品输出构造损坏矩阵 |
| A-16 | `ledgerFileRepository.test.ts:2041` | ready-clear 前的盘上文件 | 当前产品输出基线 |
| A-17 | `ledgerFileRepository.test.ts:2089` | ready-clear 后的盘上文件 | 当前产品输出结果 |
| A-18 | `ledgerFileRepository.test.ts:2390` | clear intent reconcile 后的文件 | 当前产品输出结果 |
| A-19 | `usePersistentLedger.fileCapabilities.test.tsx:188` | Hook salt 漂移辅助函数 | 篡改当前产品刚写出的 C |
| A-20 | `usePersistentLedger.fileCapabilities.test.tsx:308` | ready clear 后的 current／previous | 当前产品输出结果 |
| A-21 | `usePersistentLedger.fileCapabilities.test.tsx:395` | 排队 clear 后的 current／previous | 当前产品输出结果 |
| A-22 | `ledgerFileAccessController.test.ts:282` | `createRecoverableLedgerHandle` 篡改 current | 以当前产品输出构造恢复候选 |

A-01～A-22 的处理统一为：先通过 `src/test-support/readLedgerFileForTest` 读取；既有行为／安全断言文本原样保留。乙类构造与断言不借此辅助函数改写。

#### 乙类：原样保留

| 编号 | 文件与测试起始行 | 守卫对象 |
| --- | --- | --- |
| B-01 | `LedgerAccessGate.test.tsx:1049` | 旧或未知 C 容器版本在 Alpha 下的明确拒绝 |
| B-02 | `LedgerAccessGate.test.tsx:1075` | V2 C 内旧 ledger schema 3 的只读拒绝与后续新建流程 |
| B-03 | `ledgerFileAccessController.test.ts:986` | retired file format V1 的只读拒绝 |
| B-04 | `ledgerFileAccessController.test.ts:1016` | V2 C 内 ledger schema 2／3 的只读拒绝 |
| B-05 | `usePersistentLedger.test.tsx:1545` | legacy IndexedDB envelope 损坏后的保留语义，不是 C 文件输出 |
| B-06 | `ledgerFileContract.test.ts:49` | 精确 V2 一代／两代外壳 |
| B-07 | `ledgerFileContract.test.ts:54` | V2 对未知 file／crypto／schema 版本的拒绝 |
| B-08 | `ledgerFileContract.test.ts:80` | V2 在处理密文前拒绝旧 ledger schema |
| B-09 | `ledgerFileContract.test.ts:102` | V2 严格字段、Base64URL 与 revision 关系 |
| B-10 | `ledgerFileContract.test.ts:140` | V2 AAD 的固定字段与顺序 |
| B-11 | `ledgerFileContract.test.ts:225` | V2 C、legacy IndexedDB 与 ledger schema 版本彼此独立 |
| B-12 | `ledgerFileCrypto.test.ts:15` | V2 full-generation 加解密与不同 IV |
| B-13 | `ledgerFileCrypto.test.ts:52` | V2 密码、salt、密文与 AAD 篡改拒绝 |
| B-14 | `ledgerFileCrypto.test.ts:98` | V2 会话 KDF 与不可提取密钥参数 |
| B-15 | `ledgerFileCrypto.test.ts:160` | retired V1 密文不得通过 V2 AAD |
| B-16 | `ledgerFileHandleAdapter.test.ts:252`、`:263` | V2 文本读取路径的外壳字节上限；V3 另增二进制路径，不删除此覆盖 |
| B-17 | `goldenStorageFixtures.test.ts:76` | 阶段〇冻结的 V2 黄金样例及固定哈希 |
| B-18 | `cryptoEnvelope.test.ts:22` | legacy `StoredLedgerEnvelopeV2` 精确格式 |
| B-19 | `cryptoEnvelope.test.ts:29` | legacy envelope 损坏／未知字段拒绝 |
| B-20 | `cryptoEnvelope.test.ts:57` | legacy envelope AAD 固定顺序 |
| B-21 | `encryptedLedgerRepository.test.ts:90` | legacy IndexedDB 每次保存换 IV |
| B-22 | `encryptedLedgerRepository.test.ts:112` | legacy IndexedDB 错误密钥与篡改拒绝 |
| B-23 | `indexedDbStorageAdapter.test.ts:146` | legacy envelope 不可克隆时保留旧记录 |
| B-24 | `webCryptoEncryptionService.test.ts:45` | legacy encryption service 每次加密换 IV |
| B-25 | `webCryptoEncryptionService.test.ts:60` | legacy encryption service 的错误密码／salt／AAD 篡改拒绝 |

`ledgerFileContract.test.ts:180`／`:201` 的内层 payload V4 测试没有被列为格式迁移点：它们保护 B-04 要求跨 V2／V3 原样不变的 JSON／UTF-8 payload，断言保持不动。`ledgerFileHandleAdapter.test.ts` 既有文本 `read`／`writeAndReadBack` 覆盖保留给 V2 迁移读取；S-1 为 V3 新增二进制路径与新测试，不把旧测试改写成 V3。

没有发现丙类：每个命中点都能由调用对象、测试标题和数据来源明确判定为“当前产品刚写出的 C”或“冻结 V2／legacy 合同”。若后续实现暴露新的判不清点，B-13 仍即时生效。

#### A.1 独立提交与 A.3 一一对照

源码提交 `1998a62`（`test: centralize current ledger file inspection`）只新增 `src/test-support/readLedgerFileForTest.ts`、导出它，并把 A-01～A-22 的外层解析调用换成该入口；没有格式实现改动。下表的行号分别对应迁移前提交 `755a050` 与迁移后提交 `1998a62`。表中“关联断言”按代码表达式记录；箭头两侧文本相同，表示只换解析调用，没有改断言含义或文本。

| 编号 | 文件，前行→后行 | 解析调用：迁移前 → 迁移后 | 关联断言：迁移前 → 迁移后 | 这条断言保护什么 |
| --- | --- | --- | --- | --- |
| A-01 | `ledgerFileRepository.test.ts:311→310` | `JSON.parse(serialized) as LedgerFileV2` → `readLedgerFileForTest(serialized)` | `await expect(repository.save(candidate)).rejects.toMatchObject({ code: LEDGER_FILE_REPOSITORY_ERROR_CODES.AUTHENTICATION_FAILED });` → 原文不变 | salt 漂移不得被当成成功保存 |
| A-02 | 同文件 `412→413` | `JSON.parse(serialized) as LedgerFileV2` → `readLedgerFileForTest(serialized)` | `expect(opened.status).toBe("recovery-required");` → 原文不变 | current 认证失败只能进入显式恢复 |
| A-03 | 同文件 `425→426` | `JSON.parse(serialized) as LedgerFileV2` → `readLedgerFileForTest(serialized)` | `expect(handle.writeCount, recoveryCase.name).toBe(writesBeforeOpen);` → 原文不变 | previous 也损坏时拒绝且零写入 |
| A-04 | 同文件 `443→442` | `JSON.parse(serialized) as LedgerFileV2` → `readLedgerFileForTest(serialized)` | `expect(opened.status).toBe("recovery-required");` → 原文不变 | current 明文 JSON／Validator／资源失败进入恢复 |
| A-05 | 同文件 `464→463` | `JSON.parse(serialized) as LedgerFileV2` → `readLedgerFileForTest(serialized)` | `expect(handle.writeCount, recoveryCase.name).toBe(writesBeforeOpen);` → 原文不变 | previous 明文不合资格时 fail closed 且零写入 |
| A-06 | 同文件 `487→487` | `JSON.parse(serialized) as LedgerFileV2` → `readLedgerFileForTest(serialized)` | `await expect(repository.save(candidate)).rejects.toMatchObject({ code: LEDGER_FILE_REPOSITORY_ERROR_CODES.READBACK_FAILED });` → 原文不变 | 同明文但不同加密代不得冒充精确写入意图 |
| A-07 | 同文件 `515→513` | `const parsed: unknown = JSON.parse(handle.text());` → `const parsed: unknown = readLedgerFileForTest(handle.text());` | `expect(validated.ok).toBe(true);` → 原文不变 | 当前产品写出的外壳必须通过当前格式验证 |
| A-08 | 同文件 `1258→1259` | `JSON.parse(handle.text()) as LedgerFileV2` → `readLedgerFileForTest(handle.text())` | `expect(diskFile.current.revisionId).toBe("revision-b");` → 原文不变 | salt 漂移后盘上仍是实际写出的 revision-b |
| A-09 | 同文件 `1305→1306` | `(JSON.parse(handle.text()) as LedgerFileV2).current.revisionId` → `readLedgerFileForTest(handle.text()).current.revisionId` | `expect((JSON.parse(handle.text()) as LedgerFileV2).current.revisionId).toBe("revision-b");` → `expect(readLedgerFileForTest(handle.text()).current.revisionId).toBe("revision-b");` | 只换取值的解析调用；predicate、matcher 与 revision-b 期望不变，pending intent 不产生额外 generation |
| A-10 | 同文件 `1369→1370` | `JSON.parse(serialized) as LedgerFileV2` → `readLedgerFileForTest(serialized)` | `await expect(repository.load()).resolves.toEqual(ledger);` → 原文不变 | close-readback 的 fileId 漂移不能推进内存已验证账本 |
| A-11 | 同文件 `1376→1377` | `JSON.parse(serialized) as LedgerFileV2` → `readLedgerFileForTest(serialized)` | `await expect(repository.load()).resolves.toEqual(ledger);` → 原文不变 | close-readback 的 revision 链漂移不能推进状态 |
| A-12 | 同文件 `1389→1390` | `JSON.parse(serialized) as LedgerFileV2` → `readLedgerFileForTest(serialized)` | `await expect(repository.load()).resolves.toEqual(ledger);` → 原文不变 | close-readback 的 current 认证漂移不能推进状态 |
| A-13 | 同文件 `1404→1405` | `JSON.parse(serialized) as LedgerFileV2` → `readLedgerFileForTest(serialized)` | `await expect(repository.load()).resolves.toEqual(ledger);` → 原文不变 | close-readback 的 previous 认证漂移不能推进状态 |
| A-14 | 同文件 `1503→1504` | `JSON.parse(published302) as LedgerFileV2` → `readLedgerFileForTest(published302)` | `expect(verified.file.previous).toEqual(publishedFile.previous);` → 原文不变 | 显式恢复只发布已独立验证的上一代 |
| A-15 | 同文件 `1689→1690` | `JSON.parse(published302) as LedgerFileV2` → `readLedgerFileForTest(published302)` | `expect(handle.writeCount, recoveryCase.name).toBe(writesBeforeOpen);` → 原文不变 | 不合资格恢复矩阵全部零写入 |
| A-16 | 同文件 `2041→2042` | `JSON.parse(handle.text()) as LedgerFileV2` → `readLedgerFileForTest(handle.text())` | `expect(after.fileId).toBe(before.fileId);` → 原文不变 | ready-clear 保持同一 C 的文件身份 |
| A-17 | 同文件 `2089→2090` | `JSON.parse(handle.text()) as LedgerFileV2` → `readLedgerFileForTest(handle.text())` | `expect(after.previous).toEqual(before.current);` → 原文不变 | ready-clear 后上一可恢复状态与清空前 current 相符 |
| A-18 | 同文件 `2390→2391` | `JSON.parse(handle.text()) as LedgerFileV2` → `readLedgerFileForTest(handle.text())` | `expect(file.current.revisionId).toBe("revision-clear-intent");` → 原文不变 | 不确定 readback 重试确认同一 clear intent |
| A-19 | `usePersistentLedger.fileCapabilities.test.tsx:188→190` | `JSON.parse(serialized) as LedgerFileV2` → `readLedgerFileForTest(serialized)` | `expect(result.current.persistenceStatus).toBe("error");` → 原文不变 | Hook 在 salt 漂移后保持 dirty 并报告错误 |
| A-20 | 同文件 `308→310` | `JSON.parse(new TextDecoder().decode(handle.bytes)) as LedgerFileV2` → `readLedgerFileForTest(handle.bytes)` | `expect(file.current.revisionId).toBe("revision-after-clear");` → 原文不变 | 授权清空写出新 current 并保留旧 revision |
| A-21 | 同文件 `395→395` | `JSON.parse(new TextDecoder().decode(handle.bytes)) as LedgerFileV2` → `readLedgerFileForTest(handle.bytes)` | `expect(file.previous?.revisionId).toBe("revision-saved");` → 原文不变 | 排队清空把已保存 current 保留为 previous |
| A-22 | `ledgerFileAccessController.test.ts:282→284` | `JSON.parse(new TextDecoder().decode(handle.bytes)) as LedgerFileV2` → `readLedgerFileForTest(handle.bytes)` | `await expect(result.session.repository.load()).resolves.toEqual(previousLedger);` → 原文不变 | Controller 确认恢复后只发布已验证的 previous |

无 V3 等价物的甲类断言：**0 条**。A-01～A-22 都保护当前产品输出的行为或安全语义，V3 仍有等价对象；格式差异全部收口在测试读取辅助函数，不删除断言。

A-07 逐文件 `expect(` 实测命令为 `git grep -o 'expect(' 755a050 -- <file> | wc -l` 与 `rg -o 'expect\\(' <file> | wc -l`。结果：

| 文件 | 迁移前 `755a050` | 迁移后 `1998a62` | 变化 |
| --- | ---: | ---: | ---: |
| `src/platform/files/ledgerFileRepository.test.ts` | 276 | 276 | 0 |
| `src/app/usePersistentLedger.fileCapabilities.test.tsx` | 169 | 169 | 0 |
| `src/app/ledgerFileAccessController.test.ts` | 203 | 203 | 0 |

补充机械核对：`git diff -U0 755a050..1998a62 -- <上述三文件> | rg '^[+-].*expect\\('` 无输出（`rg` 退出码 1，意为没有匹配）；乙类文件与 legacy 目录在 A.1 提交中 diff 为零。A.1 后定向测试 5 文件 131 项全通过，`npm run typecheck`、`npm run lint` 通过。在 A.1 节点，A.4 的三条通电检查尚未取得，未用 A.1 的解析替换冒充产品通电证据。

### S-1 实施中触发 H-1：V2 黄金样例的产品路径与迁移时点冲突

S-1 实现前扩大检索范围时，发现第一次 B-11 枚举只覆盖了带 V2／base64 线索的解析点，遗漏一个不含这些字样、但同样直接绑定当前输出字节形状的甲类点：

```text
src/platform/files/ledgerFileRepository.test.ts:3166:    handle.mutateAfterClose = (serialized) => `${serialized}\n`;
src/platform/files/ledgerFileRepository.test.ts:3180:    expect(handle.text().endsWith("\n")).toBe(true);
```

该测试保护“语义有效但字节不完全一致的 candidate readback 不得被当成精确写入，也不得在恢复不确定时补偿覆盖”。V2 用整份 JSON 尾随空白构造；V3 的等价物是只给 JSON 头增加尾随空白并同步头长度，原始密文体不变、文件总长度仍与头声明精确一致。它明确属于甲类，补记为 **A-23**，不是丙类。未提交的 S-1 工作现场只把读取对象从整份 V2 JSON 换为 V3 JSON 头，matcher `endsWith("\n")` 与期望 `true` 不变；`expect(` 数量不变。后续最终 A.3 表须补入 A-23 及本次扩大检索发现的二进制测试替身读取点，不能再把 A-01～A-22 误写成全量。

随后 S-1 二进制容器原型已做到当前产品路径的定向测试 **6 files／186 tests PASS**，且 `npm run typecheck` PASS；这些只是未提交工作现场，尚未形成 S-1 提交，也未执行 S-1 M-3。按 A-08 立即复测冻结 V2 合同与黄金样例，结果为：

```text
Test Files  1 failed | 2 passed (3)
Tests       1 failed | 18 passed (19)

FAIL goldenStorageFixtures.test.ts
"freezes and opens the product-path file format V2 fixture"
LedgerFileRepositoryError:
Ledger file format V2 is retired and is not opened before migration is enabled
```

失败点不是黄金样例字节、哈希或断言被改动；`goldenStorageFixtures.test.ts`、`ledgerFileContract.test.ts`、`ledgerFileCrypto.test.ts` 均保持原样。冲突来自乙类黄金测试原样要求：

1. `inspectLedgerFile(adapter, handle)` 成功识别并返回 V2；
2. `LedgerFileRepository.open(...)` 走产品路径成功打开 V2；
3. `repository.load()` 返回冻结的完整虚构账本。

S-1 后当前产品只写 V3。若继续满足上述产品路径，必须在以下路径中选择一条：

- 继续把打开的 V2 写回 V2：违反“产品不再写 V2”与单向升级规则；
- 打开 V2 后只写 V3：这就是“读旧、写新”的迁移，等于把阶段五的迁移切换提前到 S-1；
- 只为黄金样例保留特殊打开旁路或把测试改成 parser-only：会弱化 A-08 的产品路径守卫，禁止采用。

因此 **H-1 已真实触发**：Alpha“遇低版本拒绝、不迁移”与原样保留的 V2 产品路径黄金测试不能同时成立。由拒绝切换为迁移的时点只能由用户宣布，执行者不得自行选择。当时已停止：没有提交 S-1，没有测 S-1 M-3，没有改动任何乙类测试或黄金样例，没有 merge／push／rebase，也没有读取私有数据。源码工作树当时保留未提交 S-1 现场供裁决后继续；根文档单独记录本次申报。

### 修订 C／D 裁决与 C-01～C-04 落实

根文档提交 `2198821` 与 `b965bbd` 已解除 H-1，裁决为“本批不做迁移，V2 一律拒绝”。修订 C 曾增加的 C-05／C-06 又由修订 D 撤销，因此本批未新增或修改用户可见文案。

| 编号 | 落实情况 |
| --- | --- |
| C-01 | G-1 字节未改；S-1 提交前 `shasum -a 256` 仍为 `d143d621cb2dbb4404d254114294132a54213c70fbd445c6bc0fb49b42447427` |
| C-02 | `inspectLedgerFile` 与 `LedgerFileRepository.open` 均在密码／解密前拒绝 G-1；错误为 `LEDGER_FILE_INVALID_FILE`，cause 指向 `fileFormatVersion` 且明确记录 V2；测试证明写入尝试为 0、前后字节和 SHA-256 均不变 |
| C-03 | 本批未新增 V2 解码测试；产品 repository／app 路径不调用 V2 validator、encrypt 或 decrypt |
| C-04 | `test-fixtures/golden/README.md` 已说明 G-1 为未来迁移项目保留，当前只被拒绝测试引用，解码覆盖待迁移立项时补齐 |

C-02 授权的断言重组对照：

| 文件与迁移前行号 | 迁移前原文 | 迁移后原文 | 它保护什么 |
| --- | --- | --- | --- |
| `goldenStorageFixtures.test.ts:76` | `it("freezes and opens the product-path file format V2 fixture", async () => {` | `it("freezes and rejects the product-path file format V2 fixture without mutation", async () => {` | Alpha 正路必须在解密前明确拒绝 V2，且不写入、删除或改变用户文件 |
| 同用例 | `expect(envelope.fileFormatVersion).toBe(2);` 等四条解析断言，以及 `await expect(repository.load()).resolves.toEqual(createGoldenStorageScenario());` | `await expectV2Rejection(() => inspectLedgerFile(adapter, handle));`；`await expectV2Rejection(() => LedgerFileRepository.open(...));`；`expect(handle.writeAttempts).toBe(0);`；前后长度、SHA-256 与字节相等 | 用裁决后的正确产品行为取代已移出本批的迁移式打开；断言总数保持 12→12，无静默覆盖真空 |

### S-1 实现与 A.4 通电检查

S-1 源码提交：`2b87216 Adopt raw binary V3 ledger container`。落盘布局为 `LFTL3\r\n\0` magic＋4 B little-endian JSON 头长＋UTF-8 JSON 头＋current／previous 原始 AES-GCM 字节。四个版本号均在明文头顶层；密文从 Web Crypto 输出到写盘不经 base64。内层 payload 仍是原 JSON／UTF-8。

A-23 补入 A.3 一一对照：

| 编号 | 文件，前行→后行 | 迁移前断言 | 迁移后断言 | 它保护什么 |
| --- | --- | --- | --- | --- |
| A-23 | `ledgerFileRepository.test.ts:3180→3199` | `expect(handle.text().endsWith("\n")).toBe(true);` | `expect(readLedgerFileJsonHeaderForTest(handle.bytes).endsWith("\n")).toBe(true);` | 语义有效但字节不精确一致的 readback 不得被当成精确写入，也不得在不确定恢复时补偿覆盖 |

最终 S-1 现场的逐文件 `expect(` 计数（迁移前为 `1998a62`）：

| 文件 | 前 | 后 |
| --- | ---: | ---: |
| `ledgerFileRepository.test.ts` | 276 | 276 |
| `usePersistentLedger.fileCapabilities.test.tsx` | 169 | 169 |
| `ledgerFileAccessController.test.ts` | 203 | 203 |
| `LedgerAccessGate.test.tsx` | 161 | 161 |
| `usePersistentLedger.fileImport.test.tsx` | 101 | 101 |
| `ledgerFileHandleAdapter.test.ts` | 50 | 53 |
| `goldenStorageFixtures.test.ts` | 12 | 12 |

A.4 在最终 S-1 实现上重新通电，三条均为临时破坏产品实现后红、精确恢复后绿：

| 类别 | 临时破坏 | 定向用例 | 红灯 | 恢复后 |
| --- | --- | --- | --- | --- |
| 写入正确性 | 普通保存的 `previous: baseFile.current` 改为 `null` | `creates 300 then saves 301 and 302 as two adjacent independently decryptable full generations` | 1 failed，V3 修订链合同拒绝 | 1 passed／59 skipped |
| 恢复正确性 | 恢复写入的 `previous: this.damagedFile.previous` 改为 `null` | `offers an explicit recovery candidate and restores exactly the independently verified previous generation` | 1 failed，恢复修订链合同拒绝 | 1 passed／59 skipped |
| 拒绝被篡改文件 | 临时关闭 `verifyLedgerFile` 中盘上 crypto 元数据与会话绑定检查 | `rejects save salt drift without advancing the last verified ledger` | 1 failed，承诺错误地 resolve | 1 passed／59 skipped |

三次有效通电检查后再跑默认全量：**101 files／1140 tests PASS**；typecheck、lint、`git diff --check` PASS。临时破坏均已恢复，S-1 提交后源码工作树 clean。

### S-1 独立 M-3 与文件字节数

S-1 实现提交 `2b87216` 后才开始量尺；原始结果与执行元数据由源码提交 `97a93eb`（`Record the S1 storage benchmark evidence`）加入 `benchmarks/evidence/w15-storage/s1-raw-container/`。数据全部由确定性虚构账本生成，不含真实数据。

正式浏览器量尺按 S-100 → S-1K → S-10K → S-100K 顺序执行。每档开始前记录时刻与序号，上一档完成到下一档开始分别静置 338、319、316 秒；末档后静置至少 397 秒才运行独立文件体积探针。

| 序号 | 档位 | 开始 | 完成记录 | 样本数 | S-1 M-3 中位数 | 范围 | V2 基线 | 变化 |
| ---: | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | S-100 | 2026-09-01 07:33:17 +02:00 | 07:33:33 | 10 | 90.530 ms | 89.267～102.107 ms | 107.354 ms | −15.67% |
| 2 | S-1K | 2026-09-01 07:39:11 +02:00 | 07:39:28 | 10 | 175.043 ms | 174.560～175.564 ms | 241.611 ms | −27.55% |
| 3 | S-10K | 2026-09-01 07:44:47 +02:00 | 07:45:27 | 10 | 1,014.023 ms | 1,005.813～1,040.608 ms | 1,755.710 ms | −42.24% |
| 4 | S-100K | 2026-09-01 07:50:43 +02:00 | 07:52:11 | 3 | 9,630.737 ms | 9,432.841～9,783.074 ms | 18,630.442 ms | −48.31% |

四档 `consoleErrors` 均为空，`temporaryArtifactsCleaned` 均为 `true`，错误密码均被拒绝。S-1 使用实际 Chrome `152.0.7977.65`，V2 基线使用 `151.0.7922.171`；因此上表是同一生产量尺与机器上的阶段对照，但浏览器版本并非完全相同，不能冒充严格同版本 A/B。正式数据排除了两次基础设施探测：一次沙箱内绑定 `127.0.0.1` 返回 `EPERM`，没有产生浏览器指标；一次升级权限后的单样本探针因未预先记录开始时刻而排除。

独立文件字节探针均走 `LedgerFileRepository`：创建空的虚构 C，保存合成账本，再保存一笔新增虚构买入。`afterM3Bytes` 对照如下；探针中记录的 repository 耗时只是诊断数据，不是浏览器 M-3，也不用于替代上表。

| 档位 | V2 `afterM3Bytes` | S-1 `afterM3Bytes` | 实际减少 |
| --- | ---: | ---: | ---: |
| S-100 | 135,419 B | 101,770 B | 24.85% |
| S-1K | 1,290,863 B | 968,354 B | 24.98% |
| S-10K | 12,845,941 B | 9,634,666 B | 25.00% |
| S-100K | 128,440,036 B | 96,330,240 B | 25.00% |

`06A`／`06B` 把预期写成“文件体积 −33%”，实测没有套用该数字。base64 相对原始字节是约 **+33.33%**；从已经膨胀到 4/3 的 base64 文件回到原始 1，按旧文件作分母的减少量应为 **25%**。四档实际值与正确换算一致；小档略低于 25% 是明文头等固定开销所致。

### S-2 开工前停止申报：恢复合同依赖 S-3 分块

S-1 量尺完成并提交后，执行者在改动 S-2 代码前重新核对 `06A` 1.2、2.1～2.4 与 `06B` 3.2～3.3，确认当前顺序存在无法自行消解的依赖：

1. S-2 要求 `previous` “只保留发生变化的块的旧版本”，同时 S2-1／S2-2 要求新版写坏后仍能完整恢复上一版。
2. S-1 现场的 current／previous 各是一段整本 AES-GCM 密文。current 的认证标签一旦失败，fail closed 语义禁止把它当作 delta 基底；仅保存旧差异无法重建未变化部分。
3. 要在 current 某部分损坏时继续复用其他未变化内容，必须先把 current 划成可独立认证、独立解密的恢复单元。这正是 S-3 的“每块独立加密、独立认证”。
4. 按集合切分被 `06A` 2.1 否决；按字节切片或按记录切片仍然是在 S-2 提前实施分块；以整本作为唯一块则 `previous` 仍是整本，未完成 S-2。reverse JSON patch／ciphertext delta 都依赖可认证的 current，不能满足“写坏新版仍恢复”。

因此当前没有一种实现能同时满足“顺序必须 S-1 → S-2 → S-3”“三件事独立提交并分别归因”“S-2 后 previous 不存整本”“S-2 后写坏新版仍恢复”，又不把 S-3 偷跑进 S-2。依据总合同“凡遇‘这样应该也行吧’一律停下来申报”，源码在 `97a93eb` 停止，**尚未改动任何 S-2 产品代码或测试**。

需要产品负责人裁决 S-2／S-3 的依赖关系，例如明确改为“先分块、后增量 previous”，或允许二者作为一个不可分割的格式步骤并相应修订独立归因要求；执行者不自行选择。

### R-14｜迁移器与 V2 产品路径

Q-3 已依修订 C 作废；本批未实现迁移器。产品的 repository／app 路径没有接受、解密或写出 V2 的调用；只在解密前解析非 V3 JSON 的 `fileFormatVersion` 与 `ledgerSchemaVersion` 明文字段，用于保留既有的版本／schema 拒绝分类。冻结的 `validateLedgerFileV2`、V2 crypto primitive 及其既有合同测试依 A-08 保留，但产品运行时无调用点。
