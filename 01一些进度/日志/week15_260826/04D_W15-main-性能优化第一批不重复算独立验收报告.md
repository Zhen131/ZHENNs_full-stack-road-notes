# 04D_W15-main｜性能优化第一批「不重复算」独立验收报告

- 日期：2026-08-29
- 轨道：长期账本产品 `main`
- 验收对象：`9be063c..c6241a8` 共 8 个提交，及执行报告 `04C`
- 验收依据：`04A`（含修订 C／D）、`04B`（含修订 A／B／C）、`04C-1`
- 验收方式：独立复核。**未采信 `04C` 的自报结论作为证据**，全部判定基于本次会话的真实命令输出

---

## 一、结论

**有条件通过。**

七项复核中 A、C、D、E、F、G 六项全部成立且与 `04C` 自报一致；**B 项发现一处授权范围外的既有测试断言删除（5 条 `expect`），`04C` 第 11 节对此作出了与事实相反的声明，且其中一条被删断言所覆盖的行为在全库已无任何替代覆盖。**

按本次任务给定的分级规则「出现授权范围外的断言改动即为 P0」，该项为 P0。它是**流程与覆盖缺陷，不是算错**：本批最关键的防线——等价性快照——经独立复核完好无损且实跑全绿，四个版本号未动，全量测试与自报数字逐位一致。

满足以下三项后即可转为通过，**不需要重跑任何性能量尺**：

1. 补回或迁移「`ledgerEpoch` 变化时草稿被丢弃」的测试覆盖（实现仍在，测试没了）。
2. 更正 `04C` 第 11 节的声明，并按 `04B` B-05 就 P-3 的测试改动补作申报，等待产品负责人追认。
3. 更正 `04C` 第 3.4 节 M-5 判定所引的 M-2 数值（应为阶段三 167.476 ms，非 P-1 中途诊断的 168.401 ms）。

**提请产品负责人裁量**：`04B` B-05 属「禁止事项」，其质量门写明「任一项未通过即为失败」。若按该条严格执行，本批应判**不通过**并回退到申报闸门。本报告给出「有条件通过」，理由是缺陷可在不重跑量尺的前提下就地补正，且不触及任何派生数值的正确性；最终取舍由产品负责人决定。

---

## 二、证据边界

### 2.1 本次实际执行的命令

全部在 `01一些进度/产出/LocalFirstTradingLedger/`（分支 `main`，工作树 clean，HEAD `c6241a8`）：

| 类别 | 命令 |
| --- | --- |
| Git 只读 | `git log --oneline --name-status`、`git diff`、`git show`、`git rev-list --count`、`git status --porcelain` |
| 文件完整性 | `shasum -a 256`（工作树文件与 `git show` 出的提交内 blob 各算一次） |
| 测试 | `npm test` |
| 类型 | `npm run typecheck` |
| 静态检查 | `npm run lint` |
| 等价性契约 | `npx vitest run --config vitest.benchmarks.config.ts benchmarks/measure/derivedSnapshot.contract.ts` |
| 算术复核 | `python3`，对 `04C` 6.5 全部 26 格倍数与 2.2 六项分项之和逐一复算 |

### 2.2 明确未做的事

- **本次未复现任何性能实测数字，因为重跑需数小时。** `bench:node`、`bench:browser`、`bench:m3-breakdown`、`bench:probe` 一条都没跑。`04C` 第 2、3、5、6、7 节的全部毫秒数，本报告只能核验其**内部一致性**（互相引用是否对得上、倍数是否算得对、口径是否标清楚），**不能核验其真实性**。凡涉及"某数字是否为真"的结论，本报告一律写明"未复核"。
- 未跑 `npm run build`（production build）。`04C` 第 9 节自报通过，本次未复核。
- 未跑 `benchmarks/` 下的生成器合同、Node 量尺合同、浏览器量尺合同（`04C` 自报 10/10、3/3、1/1，未复核）。仅跑了与 A 项直接相关的等价性快照契约。
- 未读取 `~/Downloads/history_OKX/`，未打开任何真实 `.lftl` 或 B 文件，未进入 `LocalFirstTradingLedger-CS2026/`。
- `04C-1` 的阶段一原始测量（E-1～E-4）未复核，仅引用其第 8 节记录的快照哈希作为 A 项比对基准。

### 2.3 这道边界对结论的影响

D-1「M-2 真实低于 200 ms」这类判定，**本报告无法独立证实**，只能确认 `04C` 内部无自相矛盾、无算术错误、无来源断裂。真正被独立证实的是另一件事，而它恰好是本批最要紧的一件：**优化后的代码重新计算出的派生结果，与优化前冻结的快照逐字节相同。**

---

## 三、A 到 G 逐项结论

### A. 等价性快照有没有被动过 —— 通过

**A-1 三个文件在提交范围内只在 `7514fb9` 出现过一次（状态 `A`＝新增），之后无任何改动：**

```
$ git log --oneline --name-status 9be063c..c6241a8 -- benchmarks/snapshots/
7514fb9 Record phase-one performance evidence
A	benchmarks/snapshots/derived-results/w15-main-perf-baseline-v1-S-100.derived.json
A	benchmarks/snapshots/derived-results/w15-main-perf-baseline-v1-S-10K.derived.json
A	benchmarks/snapshots/derived-results/w15-main-perf-baseline-v1-S-1K.derived.json

$ git diff --stat 7514fb9 c6241a8 -- benchmarks/snapshots/
[空]
```

**A-2 当前 SHA-256 与 `04C-1` 第 8 节记录值逐一相符：**

```
$ shasum -a 256 benchmarks/snapshots/derived-results/*.json
32b5f36f44fa9c36bc6eaad9e3e88d91ad76ef2130a45c563cd8ea5d0a801fc2  ...S-100.derived.json
dd6262fb26f796b62b2c3fd450d2782ed5499023b897a2ab4246016d951fa81b  ...S-10K.derived.json
e889d0c8b5a1a7f684e34a8f9f57cd3c50467d0200d25ae3cde88e5dc33ea155  ...S-1K.derived.json
```

| 文件 | `04C-1` 第 8 节记录 | 本次实测 | 判定 |
| --- | --- | --- | --- |
| S-100 | `32b5f36f…01fc2` | `32b5f36f…01fc2` | 相符 |
| S-1K | `e889d0c8…ea155` | `e889d0c8…ea155` | 相符 |
| S-10K | `dd6262fb…fa81b` | `dd6262fb…fa81b` | 相符 |

另从 git 对象直接解出 `c6241a8` 提交内的 blob 再算一次哈希，三者与工作树完全一致，排除"工作树与提交不同步"的可能：

```
$ git show "c6241a8:benchmarks/snapshots/derived-results/...-S-100.derived.json" | shasum -a 256
32b5f36f44fa9c36bc6eaad9e3e88d91ad76ef2130a45c563cd8ea5d0a801fc2  -
（S-1K、S-10K 同样相符）
```

**A-3 超出提问范围但直击本项目的追加复核：实跑等价性契约。**

该契约不在 `npm test` 的默认范围内（用的是 `vitest.benchmarks.config.ts`），因此 C 项的 1107 用例并不包含它。先确认契约文件本身无任何写操作（`grep` `writeFile|mkdir|unlink|createWriteStream` 无命中），再实跑：

```
$ npx vitest run --config vitest.benchmarks.config.ts benchmarks/measure/derivedSnapshot.contract.ts
 Test Files  1 passed (1)
      Tests  7 passed (7)
   Duration  1.60s
```

**这一步的意义**：它不是比对文件哈希，而是在当前 `c6241a8` 的优化代码上**重新算一遍派生结果**，再与冻结快照比。7/7 通过意味着"算快了但算错了"这一最危险的失败模式，在 10²／10³／10⁴ 三档上未发生。

跑完后复查工作树 `git status --porcelain` 仍为空、三个快照哈希不变、HEAD 仍为 `c6241a8`，确认本次复核未改动任何东西。

**A 项判定：通过。无 P0。**

---

### B. 既有测试的断言有没有被改过 —— 不通过（P0）

**B-1 范围内改动过的测试文件共 6 个：**

```
$ git log --oneline --name-status 9be063c..c6241a8 -- '*.test.ts' '*.test.tsx'
828b325 Cache dashboard derivations by fact generation
M	src/app/dashboardDerivations.test.ts
96ec640 Keep input drafts below the dashboard boundary
M	src/app/DashboardShell.interaction.test.tsx
M	src/app/RecordWorkspace.test.tsx
M	src/app/useLedgerWorkspaceSession.test.tsx
c6f7644 Update dashboard derivations incrementally after writes
A	src/app/dashboardDerivations.test.ts
b0c2d39 Close the phase-one resource limit gate
M	src/platform/files/ledgerFileContract.test.ts
M	src/platform/files/ledgerFileHandleAdapter.test.ts

$ git diff --stat 9be063c c6241a8 -- '*.test.ts' '*.test.tsx'
 src/app/DashboardShell.interaction.test.tsx        |  31 ++
 src/app/RecordWorkspace.test.tsx                   | 117 +++++---
 src/app/dashboardDerivations.test.ts               | 326 +++++++++++++++++++++
 src/app/useLedgerWorkspaceSession.test.tsx         |  33 +--
 src/platform/files/ledgerFileContract.test.ts      |   5 +-
 src/platform/files/ledgerFileHandleAdapter.test.ts |   4 +-
 6 files changed, 441 insertions(+), 75 deletions(-)
```

**B-2 逐文件判定：**

| 文件 | 改动性质 | 判定 |
| --- | --- | --- |
| `ledgerFileContract.test.ts` | 加 import、写死 8 MiB 换成常量、标题去写死数字 | **授权内**（修订 C C.2.2） |
| `ledgerFileHandleAdapter.test.ts` | 只改两处标题字符串 | **授权内**（修订 C C.2.1） |
| `dashboardDerivations.test.ts` | 新建文件，纯新增 326 行 | 新增测试，合规 |
| `DashboardShell.interaction.test.tsx` | 纯新增 31 行 1 条用例，0 删除 | 新增测试，合规 |
| `RecordWorkspace.test.tsx` | 夹具工厂由内联 JSX 改为 props 对象＋新增 2 条用例 | 见 B-4，判为合规 |
| `useLedgerWorkspaceSession.test.tsx` | **删除 5 条既有 `expect`＋改 1 个用例标题** | **授权外 → P0** |

**B-3 两处授权改动的实际 diff，与修订 C 授权文字逐字对得上：**

```
-  it("accepts exactly 8 MiB of generation plaintext and rejects one extra byte", () => {
-    const exact = "x".repeat(8 * 1024 * 1024);
+  it("accepts the configured generation plaintext limit and rejects one extra byte", () => {
+    const exact = "x".repeat(DEFAULT_LEDGER_RESOURCE_LIMITS.fileBytes);
+import { DEFAULT_LEDGER_RESOURCE_LIMITS } from "@/core/validation";

-  it("rejects the declared 32 MiB overflow before arrayBuffer", async () => {
+  it("rejects a declared overflow before arrayBuffer", async () => {
-    "accepts exactly 32 MiB for later parsing and rejects an actual byteLength one byte larger",
+    "accepts the configured outer limit and rejects an actual byteLength one byte larger",
```

断言主体（"恰好上限 `ok:true`、多一字节 `ok:false`"）一字未动；import 走的是稳定入口 `@/core/validation`，符合 C-05。**这两处完全合规。**

**B-4 `RecordWorkspace.test.tsx` 判为合规的理由**：117 行改动里，删除的全部是 `renderWorkspace()` 里内联的 props（`tradeDraft`／`priceDraft`／`onTradeDraftChange` 等），因为 P-3 把草稿搬进了组件内部，这些 props 在组件上已不存在——属夹具跟随 API 变化，不是断言改动。原有两条用例的 `expect` 一条未减，另新增 2 条用例（含 T2-03 的父组件不重渲染证据）。

**B-5（P0）`useLedgerWorkspaceSession.test.tsx` 在 `96ec640` 中删除了 5 条既有断言：**

```
$ git show 96ec640 -- src/app/useLedgerWorkspaceSession.test.tsx | grep "^-" | grep -v "^---"
-  it("keeps drafts and view choices while navigating the same ledger epoch", () => {
-    expect(result.current.tradeDraft.quantity).toBe("0.25");
-    expect(result.current.priceDraft.price).toBe("71000");
-    expect(result.current.hasDrafts).toBe(true);
-    expect(result.current.tradeDraft.note).toBe("");
-    expect(result.current.hasDrafts).toBe(false);
（另含 setTradeDraft／setPriceDraft／defaultAssetSymbol／todayKey 等驱动代码）

$ git show 96ec640 -- src/app/useLedgerWorkspaceSession.test.tsx | grep -c "^-.*expect("
5
```

改动前文件（`9be063c`）中这 5 条断言的精确行号：

```
$ git show 9be063c:src/app/useLedgerWorkspaceSession.test.tsx | grep -n "expect(result.current.tradeDraft\|priceDraft\|hasDrafts\|it(\"keeps drafts"
9:  it("keeps drafts and view choices while navigating the same ledger epoch", () => {
33:    expect(result.current.tradeDraft.quantity).toBe("0.25");
34:    expect(result.current.priceDraft.price).toBe("71000");
35:    expect(result.current.hasDrafts).toBe(true);
71:    expect(result.current.tradeDraft.note).toBe("");
72:    expect(result.current.hasDrafts).toBe(false);
```

这是 `04B` B-05 明令禁止的「修改既有测试的断言」。修订 C 只授权了两个文件的两类改动（写死 8 MiB 换常量、标题去写死数字），本文件不在其中。B-05 给出的正当出路是「停止并在 `04C` 中申报，等待裁决」——**没有走这条路**。

**B-6（P0 的实质部分）其中一条被删断言的覆盖已经彻底消失。**

原第 71～72 行断言的是「`ledgerEpoch` 变化时，草稿必须被丢弃」。P-3 之后该行为的实现搬到了 `RecordWorkspace.tsx:153-160`：

```
$ sed -n '153,160p' src/app/RecordWorkspace.tsx
  useEffect(() => {
    setRecordTarget({ kind: "cash", currency: "USDT" });
    setTradeDraft(createTradeWorkspaceDraft(defaultAssetSymbol, todayKey));
    setPriceDraft(createPriceWorkspaceDraft(defaultAssetSymbol, todayKey));
    onDraftStatusChange(false);
    // A ledger epoch is the only event that clears session-local drafts.
  }, [ledgerEpoch]);
```

实现在，测试没了。证据：

```
$ grep -rn "epoch" src/app/*.test.tsx src/app/*.test.ts | grep -i "draft|草稿"
(无：没有任何测试把 epoch 变化与草稿清空关联)

$ grep -n "render(|renderWorkspace(|\.rerender" src/app/RecordWorkspace.test.tsx
24:    renderWorkspace();
52:    renderWorkspace();
68:    renderWorkspace(onDraftStatusChange);
92:    render(<DashboardBoundary />);
```

`RecordWorkspace.test.tsx` 从不调用 `rerender`，其 `workspaceProps` 把 `ledgerEpoch` 恒定写死为 `1`，因此 `[ledgerEpoch]` 这个 effect 在整个测试套件中**从未被触发过第二次**。新增的 `keeps form drafts below the dashboard boundary while switching targets` 覆盖的是"切换记账对象时草稿保留"，方向相反，不是替代。

这条覆盖的份量：它守的是"上一个账本的草稿不会漏进下一个账本"。锁定后重开、换文件、导入换账本都走这条路径。它与 `04B` 2.1 对 P-4 缓存要求的「会话边界：账本锁定、切换文件、重新解锁时缓存必须整体丢弃」是同一类边界，只是对象是草稿而非缓存。**目前它没有任何自动化测试守着。**

**B-7 `04C` 对此作出了与事实相反的声明。** `04C` 全文（含第 10、11 节）从未出现 `useLedgerWorkspaceSession` 一词：

```
$ grep -n "useLedgerWorkspaceSession|既有测试" 04C_...执行报告.md
378:- 没有修改既有测试断言或阈值。阶段一获授权的同步仅为：`ledgerFileContract.test.ts` 将输入长度从写死
    `8 * 1024 * 1024` 改为 `DEFAULT_LEDGER_RESOURCE_LIMITS.fileBytes`，断言原样不动；`ledgerFileContract.test.ts`
    与 `ledgerFileHandleAdapter.test.ts` 各只把写死旧数值的标题改为不写死数字的表述。
```

第 378 行的「没有修改既有测试断言或阈值」与 `96ec640` 的实际 diff 直接冲突。第 10 节把 `96ec640` 的文件描述为「会话、工作区、表单与交互测试」，字面上没说谎，但读者无从得知里面删了 5 条断言。

**B 项判定：不通过。P0。**

---

### C. 全量测试真的通过吗 —— 通过，与自报数字逐位一致

```
$ npm test
 RUN  v4.1.9 .../LocalFirstTradingLedger

 Test Files  94 passed (94)
      Tests  1107 passed (1107)
   Start at  15:52:56
   Duration  12.45s (transform 4.06s, import 13.44s, tests 69.41s, environment 13.71s)
EXIT=0

$ npm run typecheck
> tsc --noEmit
EXIT=0

$ npm run lint
> eslint . --max-warnings=0
EXIT=0
```

| 项目 | `04C` 第 9 节自报 | 本次实测 | 判定 |
| --- | --- | --- | --- |
| 测试文件数 | 94 | 94 | 一致 |
| 用例数 | 1107 | 1107 | 一致 |
| 全部通过 | 是 | 是（0 失败、0 跳过报告） | 一致 |
| typecheck | 通过 | 通过（exit 0） | 一致 |
| lint | 通过，0 warning | 通过（`--max-warnings=0` 下 exit 0） | 一致 |

用例数相对 `04C-1` 1.1 的开工基线 93 文件／1092 用例为净增 1 文件／15 用例，满足 `04B` T2-04「不低于阶段一」。

关于 `ledgerFileHandleAdapter` 那条 384 MiB 分配用例：本次全量在 12.45 秒挂钟内完成，未出现内存告警或超时，与任务说明预期的"慢且吃内存"相符但未成为问题。

**C 项判定：通过。`04C` 第 9 节的三项自报数字经独立复跑全部属实。**

---

### D. 四个版本号 —— 通过，均未变化

**D-1 定义点与当前值：**

| 版本号 | 文件与行号 | 当前值 |
| --- | --- | --- |
| `fileFormatVersion` | `src/platform/files/ledgerFileContract.ts:15` | `fileFormatVersion: 2,` |
| `cryptoVersion` | `src/platform/files/ledgerFileContract.ts:16` | `cryptoVersion: 1,` |
| `ledgerSchemaVersion` | `src/platform/files/ledgerFileContract.ts:31` | `SUPPORTED_LEDGER_SCHEMA_VERSION = 4 as const;` |
| `backupFormatVersion` | `src/features/backup/backupEnvelope.ts:20` | `BACKUP_FORMAT_VERSION = 3 as const;` |

```
$ grep -n "fileFormatVersion: 2,|cryptoVersion: 1,|SUPPORTED_LEDGER_SCHEMA_VERSION = 4" src/platform/files/ledgerFileContract.ts
15:  fileFormatVersion: 2,
16:  cryptoVersion: 1,
31:export const SUPPORTED_LEDGER_SCHEMA_VERSION = 4 as const;

$ grep -n "BACKUP_FORMAT_VERSION = 3" src/features/backup/backupEnvelope.ts
20:export const BACKUP_FORMAT_VERSION = 3 as const;
```

**D-2 范围内该文件的全部改动只有一行，与版本号无关：**

```
$ git diff 9be063c c6241a8 -- src/platform/files/ledgerFileContract.ts
@@ -30,7 +30,7 @@ export const LEDGER_FILE_OUTER_V2_CONSTANTS = {
 export const SUPPORTED_LEDGER_SCHEMA_VERSION = 4 as const;

-export const MAX_LEDGER_FILE_V2_BYTES = 32 * 1024 * 1024;
+export const MAX_LEDGER_FILE_V2_BYTES = 384 * 1024 * 1024;
```

净变化 32 MiB → 384 MiB，与 `04A` 修订 C C.2.2 的裁定值一致（中途经 `7514fb9` 的 512 MiB，由 `b0c2d39` 修正）。`SUPPORTED_LEDGER_SCHEMA_VERSION = 4` 就在被改行的上方两行，作为 diff 上下文原样出现，可直接看出未被触碰。

**D-3 另两个定义文件根本不在改动清单内：**

```
$ git diff --stat 9be063c c6241a8 -- src/
（19 个文件，其中不含 src/features/backup/backupEnvelope.ts，
  也不含 src/platform/legacy/cryptoEnvelope.ts）
```

`backupEnvelope.ts`（`backupFormatVersion` 定义处）与 `cryptoEnvelope.ts` 在本批 8 个提交中一次都没有被改动过。

**D 项判定：通过。四个版本号 2／1／4／3 全部未变，与 `04C` T2-06 自报一致。**

---

### E. 复算 6.5 倍数表 —— 通过，26 格全部相符

用 `python3` 对 `04C` 6.5 表逐格重算「阶段一 ÷ 阶段三」：

```
M-1  S-100/1K/10K: 196.368/201.014=0.9769 报0.977 OK | 509.204/414.064=1.2298 报1.230 OK | 5485.633/1958.299=2.8012 报2.801 OK
M-4  S-100/1K/10K: 28.917/28.682=1.0082 报1.008 OK | 29.238/29.607=0.9875 报0.988 OK | 41.137/40.795=1.0084 报1.008 OK
M-3  S-100/1K/10K: 111.977/106.054=1.0558 报1.056 OK | 467.862/293.641=1.5933 报1.593 OK | 7439.782/2623.643=2.8357 报2.836 OK
M-6  S-100 入/删: 39.243/29.702=1.3212 报1.321 OK | 39.747/29.514=1.3467 报1.347 OK
M-6  S-1K  入/删: 86.881/26.915=3.2280 报3.228 OK | 86.208/27.07=3.1846 报3.185 OK
M-6  S-10K 入/删: 1482.604/74.683=19.8520 报19.852 OK | 1485.182/76.791=19.3406 报19.341 OK
M-5  S-100 四向: 83.027/72.436=1.1462 报1.146 OK | 56.771/61.658=0.9207 报0.921 OK | 82.513/71.054=1.1613 报1.161 OK | 59.159/63.608=0.9301 报0.930 OK
M-5  S-1K  四向: 125.352/79.081=1.5851 报1.585 OK | 135.358/78.044=1.7344 报1.734 OK | 164.719/139.942=1.1771 报1.177 OK | 126.218/86.78=1.4545 报1.454 OK
M-5  S-10K 四向: 1642.792/379.506=4.3288 报4.329 OK | 1625.927/369.724=4.3977 报4.398 OK | 2345.594/1142.587=2.0529 报2.053 OK | 1737.067/469.983=3.6960 报3.696 OK

不符格数 = 0
```

**特别关注的 M-5 S-10K 一行**：实算 4.3288／4.3977／2.0529／3.6960，四舍五入到三位小数为 **4.329／4.398／2.053／3.696**，与 `04C` 所写完全一致。

**追加：两列数字的出处也对得上。**

- 阶段一列（production）逐格取自 `04C-1` 4.2 的 E-2 表。抽查 S-10K production 行：M-1 5485.633、M-4 41.137、M-3 7439.782、M-6 1482.604／1485.182、M-5 1642.792／1625.927／2345.594／1737.067，与 6.5 表所填**逐个相同**。
- 阶段三列取自 `04C` 5.3。抽查 S-10K production 行：1958.299／40.795／379.506・369.724・1142.587・469.983／74.683・76.791／2623.643，与 6.5 表所填**逐个相同**。

即 6.5 不是另起炉灶写的数，是对 4.2 与 5.3 的如实搬运加除法。

顺带复算 6.1 Node M-2 的 S-10K：1504.608 ÷ 167.476 = 8.9840，报 8.984，相符。

**E 项判定：通过。倍数表无任何算术错误，也无与源表不符的数字。**（口径提醒见"观察 O-1"：这些毫秒数本身未复现。）

---

### F. 两处可疑之处的判断

#### F-1：168.401 ms 与 167.476 ms —— **是两次不同的测量，不是同一次**

**这两个数各自的出处，`04C` 里都有，只是没有一处把它们放在一起说明。**

第一个数，`04C` 第 4 节执行顺序表续号 62：

```
| 62 | 13:08:31 | P-1 后 S-10K Node M-2 诊断 | 中位数 168.401 ms。 |
```

它紧跟在续号 61「13:07:35 P-1 独立提交 `9e84dc7`」之后。**即 168.401 ms 是在 `9e84dc7` 这个代码状态上测的——只落了 P-1，P-2／P-3／P-4 都还没写。**

第二个数，`04C` 第 5 节续号 93：

```
| 93 | 14:50:45 | Node S-10K | 完整 10 样本。 |
```

其结果记在 5.2：`S-10K M-2 = 167.476 [165.686, 173.979]`，n=10，有完整区间。**它测的是交付态代码（P-1～P-4 全部落地后）。**

两次测量相隔 1 小时 42 分，代码状态不同，采样规模不同（前者未标 n 且无 `[min, max]`，后者 n=10 有区间）。**结论：两次，不是一次。**

**修订 D 的判定该用哪一个？应当用 167.476 ms。**理由三条：

1. D-1 的原文是「本批职责内的分项（M-2 ≤ 200 ms）必须**真实达标**」。本批交付的是 `c6241a8`，不是中途的 `9e84dc7`。用只落了 P-1 的中间态数字去判交付态，判的不是交付物。
2. `04B` 3.1／3.2 规定阶段三复测才是正式对照数据，n=10、丢弃预热、顺序与阶段一一致。168.401 ms 是一次定向诊断，不满足这些条件。
3. `04C` 自己在两处正式判定里用的就是 167.476：6.5 的 M-5 判定依据写「派生 M-2 167.476 ms」，8.2 第 1 问写「M-2 S-10K 为 167.476 ms≤200」。这两处**用对了**。

**那么 168.401 错在哪？**错在 `04C` 第 3.4 节——那是 M-5 全批达标与否的**决定性段落**——用的却是中间态数字：

> 「P-1 后实测 M-2 中位数 168.401 ms，低于 200 ms，故派生职责达标」

同一份报告的 3.4 与 6.5 对同一个判定给出了两个不同的依据值。另外 3.1 称 168.401 为「后续 M-2 诊断中位数」，既未标 n，也未说明它测于哪个提交，读者只看 3.1／3.4 无法分辨。

**为什么 `04A` 修订 D 引用 168.401 是合理的**：修订 D 写于 P-4 受阻当时（`04A` 文件修改时间 14:37），当时阶段三（14:50 起）还没跑，167.476 尚不存在。修订 D 只能引用当时手上唯一的数。问题不在修订 D，在于 `04C`（写于 15:33）已经拿到阶段三数据后，**没有把 3.4 的依据同步更新**。

**对结论的影响**：两个数都低于 200 ms（167.476 的最大值 173.979 也低于 200），**D-1 无论采信哪一个都成立，判定结论不变**。这是一处报告缺陷，不是判定错误。定级 P1。

#### F-2：5,017.499 ms 的出处 —— **确为第 2 节 M-3 分项实测，不是由总墙钟推算**

出处是 `04C` 2.2 表的「① 重算派生」行，口径写明为「5,017.499 ms CPU｜Chrome 100 μs 采样，按六类派生函数调用树归类」。

**决定性证据：它恰好等于同节列出的六个派生函数 CPU 耗时之和，误差 0。**逐项累加：

```
  +  3596.248  buildLedgerProjection      累计 3596.248
  +  1241.688  replayUsdtCash             累计 4837.936
  +   167.330  buildLedgerPnlSummary      累计 5005.266
  +     8.100  buildTradeHeatmap          累计 5013.366
  +     3.828  buildHoldingHistory        累计 5017.194
  +     0.305  buildHoldingAllocation     累计 5017.499

六项之和 = 5017.499   04C 2.2 报 5017.499   差 0.000000
```

一个由总墙钟推算或分摊出来的数，不会同时等于六个独立函数采样值之和。**它是自下而上加出来的，不是自上而下摊出来的。**

**反证：报告明确拒绝了向总墙钟凑数。**2.2 表末两行原样保留了对不上的账：

```
| ①＋②＋③ | 9,523.462 ms | 三段直接相加。 |
| 与 M-3 总墙钟的差额 | -1,832.616 ms | 原样保留；负值表明派生 CPU 与异步持久化墙钟区间重叠，不做分摊。 |
```

复算：5017.499 + 4501.100 + 4.863 = 9523.462，与所报一致；7690.846 − 9523.462 = −1832.616，与所报一致。三段之和**比 M-3 总墙钟还大 1,832.616 ms**。若 5,017.499 是从 7,690.846 ms 里推算切分出来的，三段之和不可能超过被切分的总数。这个负差额本身就是"没有推算"的硬证据，且 `04B` C-07 要求"差额必须如实写出，不得为了凑数而分摊"——执行方照做了。

**结论：F-2 不成立，该数字来源清楚、口径标注完整、可复算，报告处理方式符合 C-07。**

需要一并记住的口径限制（记为观察，非问题）：5,017.499 ms 是 **CPU 采样时间、n=1**，不能读作"7,690.846 ms 墙钟里的 5,017 ms"。8.2 第 3 问的「P-2 将写入重算职责从 5,017.499 ms 降至 156.689 ms（32.02×）」，复算 5017.499 ÷ 156.689 = 32.022，算术正确；两端同为 `bench:m3-breakdown` 的 n=1 CPU 口径，可比，但两端都是单次测量，倍数的统计强度弱。`04C` 未就此加注。

另外值得记一笔（这是执行方做对的地方）：`04A` 修订 C C.5.1 曾估计本批职责只有「约 1,504 ms」，其余约 5,936 ms 归属不明。分项实测出来是 5,017.499 ms，是原估计的 3.3 倍——**本批自己的责任远比产品定义当初以为的大**。`04C` 2.3 如实写出「P-2 在优化前不达标，M-3 的慢不能全部归因于 05／06 批」，没有借原估计脱身。

---

### G. 修订 D 三条自我约束 —— 两条成立，一条只能确认内部一致

#### D-1「本批分项 M-2 必须真实低于 200 ms」—— 内部一致，但**未复核实测真实性**

`04C` 5.2 记 S-10K Node M-2 = **167.476 ms [165.686, 173.979]**，n=10。中位数与最大值均低于 200 ms，即便取最差样本也达标。6.1 的倍数 1504.608 ÷ 167.476 = 8.984 经复算相符。

**但本次未跑 `bench:node`，无法证实 167.476 这个数本身为真。**能证实的只有：该数在 5.2、6.1、6.5、8.2 四处出现且完全一致，无自相矛盾，无算术错误。

判据本身有一处口径提醒：`04A` 2.2 把 M-2 列在"production 模式"表下，而 M-2 实际是 Node 层指标（5.2 属 Node 主数据）。这个错位是 `03B` 以来的既有口径，非本批引入；且比较两端（阶段一 1,504.608 与阶段三 167.476）同为 Node 层，前后可比，不影响达标判定。

**D-1 判定：在"未复现实测数字"的边界内成立。**参见 F-1：`04C` 3.4 引用的依据值应更正为 167.476。

#### D-2「归属须有实测证据，`04C` 须完整保留 D.2 三行诊断」—— 成立

三行数据在两份文档中逐格比对：

```
$ grep -n "只做合法的 P-4 派生缓存|额外缓存那 10,000 行|再加浏览器原生可见性布局复用" 04A_...产品定义.md
340:| 只做合法的 P-4 派生缓存 | 402.917 | 392.103 | 1,199.916 | 578.667 |
341:| 额外缓存那 10,000 行 React 结果 | 254.132 | 317.217 | 972.823 | 323.824 |
342:| 再加浏览器原生可见性布局复用 | 245.851 | 271.953 | 1,029.002 | 421.949 |

$ grep -n "（同样三个关键词）" 04C_...执行报告.md
126:| 只做合法的 P-4 派生缓存 | 402.917 | 392.103 | 1,199.916 | 578.667 |
127:| 额外缓存那 10,000 行 React 结果 | 254.132 | 317.217 | 972.823 | 323.824 |
128:| 再加浏览器原生可见性布局复用 | 245.851 | 271.953 | 1,029.002 | 421.949 |
```

**12 个数字逐格相同，一个未删、未改、未四舍五入。**`04C` 3.4 保留了这三行，符合 D-2 与 D.7 第 3 条。

一并复核 D.7 第 1 条「两轮诊断的试验性改动不得进入提交」：

```
$ git show --stat --oneline 828b325
828b325 Cache dashboard derivations by fact generation
 src/app/DashboardShell.tsx           |  99 ++++----------------------------
 src/app/dashboardDerivations.test.ts | 100 ++++++++++++++++++++++++++++++++
 src/app/dashboardDerivations.ts      | 108 +++++++++++++++++++++++++++++++++++
 3 files changed, 218 insertions(+), 89 deletions(-)
```

恰为 `04C` 3.4 声明的三个文件，**没有 React 结果缓存、没有可见性布局复用、没有量尺选择入口**。执行方撤销试验性改动的声明属实，可独立证实。

**D-2 判定：成立。**（三行数字本身的真实性同样未复现，只能确认转录无损。）

#### D-3「200 ms 绝对线必须在 `05A` 中作为必达项存在」—— 成立

`05A` 第 4.1 节标题为「必达（production 模式，中位数）」，表首行：

```
| 指标 | 10² | 10³ | 10⁴ | 10⁵ |
| M-5 页面切换（四方向） | ≤ 200 ms | ≤ 200 ms | ≤ 200 ms | **≤ 200 ms** |
```

四个档位全部为 `≤ 200 ms`，且 10⁵ 档也被纳入（比 `04A` 2.2 的三档更严）。该行在"必达"表中，不在 4.2 的"观察，不设通过线"表中。**没有被下调，没有被删除，覆盖范围反而扩大。**

**D-3 判定：成立。**修订 D 的"转移而非豁免"承诺在 `05A` 中确有落点。

**G 项整体判定：D-2、D-3 成立；D-1 在证据边界内成立，附一处引用更正要求（F-1）。**

---

## 四、发现的问题

### P0

**P0-1｜授权范围外删除既有测试断言，且 `04C` 声明与事实相反**

- 位置：`src/app/useLedgerWorkspaceSession.test.tsx`，提交 `96ec640`
- 事实：删除 5 条既有 `expect`（改动前文件第 33、34、35、71、72 行），并改写 1 个用例标题（第 9 行）
- 违反：`04B` B-05「不得修改既有测试的断言或阈值……若既有测试因本批而必须调整，停止并在 `04C` 中申报，等待裁决」；修订 C C-01 明确划定授权只限 `ledgerFileContract.test.ts` 与 `ledgerFileHandleAdapter.test.ts` 两处
- 加重情节：`04C` 第 11 节（第 378 行）声明「没有修改既有测试断言或阈值」，与 diff 直接冲突；`04C` 全文未出现 `useLedgerWorkspaceSession` 一词，读者无从发现
- 情有可原之处：删除由 P-3 的合理重构驱动（草稿状态从 hook 搬入 `RecordWorkspace`，被断言的 `tradeDraft`／`hasDrafts` 在该 hook 上已不存在），并非为了让测试变绿而删。若当时按 B-05 停下申报，很可能会获授权
- 建议处置：补作申报，由产品负责人追认或驳回；同时更正第 11 节声明

**P0-2｜一条既有行为的测试覆盖净丢失，无替代**

- 位置：实现在 `src/app/RecordWorkspace.tsx:153-160`，原测试在 `useLedgerWorkspaceSession.test.tsx` 改动前第 71～72 行
- 事实：「`ledgerEpoch` 变化时草稿被丢弃」的断言被删除后，全库无任何替代覆盖。`RecordWorkspace.test.tsx` 从不调用 `rerender`，其 `ledgerEpoch` 恒为 1，该 `useEffect` 在整个测试套件中从未触发第二次
- 风险：该路径覆盖"锁定后重开、切换文件、导入换账本"三种场景下上一个账本的草稿是否会漏进下一个账本。虽不涉及落盘数据，但属跨账本状态隔离
- 与 P0-1 的关系：P0-1 是流程问题，P0-2 是它造成的实质后果。修好 P0-2 需要新增一条测试，不需要重跑任何量尺

### P1

**P1-1｜`04C` 3.4 的 M-5 决定性判定引用了中间态数字**

- 事实：3.4 用「P-1 后实测 M-2 中位数 168.401 ms」作为修订 D 达标依据。该值测于 `9e84dc7`（仅落 P-1），见第 4 节续号 62；交付态的阶段三值为 167.476 ms [165.686, 173.979]，n=10，见 5.2
- 同一份报告的 6.5 与 8.2 第 1 问对同一判定用的是 167.476，前后不一致
- 影响：两值均 < 200 ms，**D-1 结论不变**。属报告缺陷
- 建议处置：3.4 改引 167.476，并在 3.1 为 168.401 补注「测于 `9e84dc7`，P-1 定向诊断，非阶段三数据」

### 观察

**O-1｜本报告未复现任何性能实测数字**

`04C` 第 2、3、5、6、7 节的全部毫秒数，本次只核验内部一致性与算术，未核验真实性。重跑需数小时。凡依赖这些数字的判定（D-1、可用性判定、四处定向改善倍数），其可信度上限即为对执行方测量诚信的信任度。本次未发现任何数字自相矛盾、算不通或来源断裂——包括最容易露馅的 26 格倍数表与六项分项求和，全部严丝合缝，这是正面旁证，但不等于复现。

**O-2｜n=1 的倍数被写成了三位有效数字**

8.2 第 3 问的「P-2 ……从 5,017.499 ms 降至 156.689 ms（32.02×）」两端均为 n=1 的 CPU 采样值（第 4 节续号 56 与 67）。算术正确、口径一致，但单次对单次得出的 32.02× 不宜作为统计结论使用。`04C` 未加注这一限制。论文引用时建议标注 n=1。

**O-3｜M-2 的层级口径与 `04A` 2.2 表头不符**

`04A` 2.2 把 M-2 ≤ 200 ms 列在「必达（production 模式，中位数）」表下，但 M-2 实际是 Node 层指标（`04C` 5.2 属 Node 主数据，浏览器主数据 5.3 里没有 M-2）。这是 `03B` 以来的既有错位，非本批引入，且比较两端同为 Node 层不影响达标判定。建议 05A／06A 起草时顺手改掉表头措辞，避免将来误读。

**O-4｜`RecordWorkspace.test.tsx` 的夹具重构虽合规，但体量偏大**

117 行改动中大部分是把内联 JSX props 改写为 props 对象工厂。判为合规（原有断言一条未减，删除的都是组件上已不存在的 props）。但这种"顺手重构"混在受 B-05 约束的批次里，会稀释 diff 的可审性——本次正是它把注意力引开，才让同一提交里 `useLedgerWorkspaceSession.test.tsx` 的断言删除更难被发现。建议后续批次把纯重构与功能改动分开提交。

### 正面记录

以下几点值得明确写下，它们是本批做对的地方：

1. **等价性防线真实有效。**三个快照自 `7514fb9` 冻结后再无一字改动，哈希三处相符，且在优化后的代码上实跑 7/7 通过。这是本批最重要的保险，它没有被绕过。
2. **P-4 的试验性改动确实没有进入提交。**`828b325` 三个文件，可独立证实，与声明完全一致。
3. **M-3 分项测量没有向总墙钟凑数。**三段之和比总墙钟大 1,832.616 ms 的负差额被原样保留，符合 C-07。这是一个很容易被"分摊平"的地方，执行方没有这么做。
4. **实测推翻了产品定义的乐观估计而未加掩饰。**`04A` 估计本批责任约 1,504 ms，实测 5,017.499 ms，`04C` 2.3 如实判定"P-2 在优化前不达标"。
5. **修订 D 的"转移不是豁免"在 `05A` 有真实落点**，且覆盖范围从三档扩到四档。

---

## 五、边界声明

| 项目 | 结果 |
| --- | --- |
| 是否修改过任何文件 | **否。**全程只读。所跑命令仅为 `git` 只读子命令、`shasum`、`npm test`、`npm run typecheck`、`npm run lint`、只读的等价性契约与 `python3` 算术复核。跑完后源码仓库 `git status --porcelain` 为空、三个快照 SHA-256 不变、HEAD 仍为 `c6241a8`；根文档仓库 `git status --porcelain` 亦为空 |
| 是否执行过 merge、rebase 或 push | **否。**一条都没有 |
| 是否提交过任何东西 | **否。**本文件写入后未 `git add`、未 `git commit`，留待产品负责人过目后决定 |
| 是否采信 `04C` 自报结论作为独立证据 | **否。**`04C` 只被当作待验对象。凡本报告写"通过"处，均附本次会话的真实命令输出；凡无法验证处，均写明"未复核"并说明原因 |
| 是否读取过 `~/Downloads/history_OKX/` | **否。**未读取该目录，未打开任何真实 `.lftl` 或 B 文件 |
| 是否进入过论文轨道 | **否。**未进入 `01一些进度/产出/LocalFirstTradingLedger-CS2026/` |
| 是否复现过性能实测数字 | **否。**未跑 `bench:node`／`bench:browser`／`bench:m3-breakdown`／`bench:probe`，重跑需数小时。此为本次验收的主要证据边界，见第二节 |
| 是否跑过 production build | **否。**`04C` 第 9 节自报通过，本次未复核 |

---

## 六、给产品负责人的一句话

**本批"算得对"这件事，我独立验证过了，它成立；"算得快"这件事，我没有重跑，只能确认账目自洽、无一处算错。真正的问题不在数字，在于一次没有申报的测试删除，以及它带走的一条没人再守的边界。**
