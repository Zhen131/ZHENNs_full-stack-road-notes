# 06C_W15-main｜性能优化第三批「存盘成本」执行报告

- 日期：2026-08-31
- 源码分支：`zhennn/w15-main-chunked-storage`
- 起点：`main@8df62d8`
- 状态：执行中；阶段〇、阶段一已完成
- 合同：`06A_W15-main-性能优化第三批存盘成本产品定义.md`、`06B_W15-main-性能优化第三批存盘成本执行文档.md`

## 结论

阶段〇已先于任何格式代码改动完成并独立提交。版本 3 采用**双固定头槽 + 固定体槽 + 原始 AES-GCM 字节**：头槽只重写固定小区域，事实块独立加密并按需换槽；`previous` 只保存本次变化块的旧引用，未变化块由两代共享。块之间没有哈希链，改历史事实不要求重写其他事实块。

本报告随执行继续补齐。尚未取得的实测值不会提前推断。

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

## R-3～R-12｜待执行

S-1／S-2／S-3 分段量尺、文件体积、块常量实测、冷启动、Q-1～Q-5、四档判定、10⁶ 探测、最终版本证明、H-1～H-5 与否定性声明均**未取得**；原因是当前刚完成阶段一，尚未进入格式代码实现与量尺阶段。
