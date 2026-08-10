# Week 12 main 版本 2 与手续费规则开发执行报告

## 一、当前唯一结论

**PASS。**

版本 2、手续费规则、交易预览与认证保存已经形成开发候选；永久正式测试、最终 typecheck / lint / production build 和真实 Chrome 强制矩阵全部通过，没有已知强制反证。V1 文件与备份零写拒绝、真实权限撤销 / 重选、物理副本不误锁、外部 revision 拒写、旧 IndexedDB 整账退役、390 / 1280 视口、current 损坏时的确认恢复与取消零写、同一实际 C 双标签争用、错误密码零写、删除后 fail closed 以及显式选择重建文件均已取得证据。本轮开发侧结论为 PASS，已形成等待全新独立 02C 审查的本地候选；本结论不是最终验收。

普通用户当前候选流程为：

```text
在真实 Google Chrome 用系统 picker 新建或选择版本 2 .lftl
→ 用户本人解锁
→ 新增 / 查看 / 创建新版本 / 停用手续费规则
→ 交易可选填写平台并精确匹配“平台 + 资产”
→ 保存前核对成交金额、候选或实际手续费、现金影响和来源
→ 用户可采用规则候选或改成实际手续费
→ reducer 只显示待保存
→ 本次 mutation 完成 write / close / readback / 解密 / Validator 后才显示认证保存
→ 锁定重开后只读取 Trade 中的历史实际 fee，不按当前规则重算
```

本文件是唯一 02B，结论只代表本次开发执行，不是独立审查结果。未执行 02C，未生成 02D，未回写 00B、00D 或当前开发状态，未进入 03，未进入或修改 CS2026。

## 二、执行时间、双仓库与候选身份

- 执行输入创建：2026-08-10T12:51:56+0800。
- 第一项源码候选提交：2026-08-10T13:18:49+0800。
- 执行结束与最终证据冻结：2026-08-11T00:18:15+0800。
- 源码仓库：`01一些进度/产出/LocalFirstTradingLedger/`。
- 源码建立基线：`44d1e566e08b5e187e23dd2ef51308ebbb6c60b0`（`origin/main`）。
- 源码当前分支：`zhennn/w12-v2-fee-rules`。
- 源码当前 HEAD：`083b9f7cc3244f8bb96ba81635f4d619ed0a4008`。
- 源码当前 tree：`504063e8b5af56dcc08f6a3cf544a8b64328999b`。
- 相对本地 `origin/main`：behind 0 / ahead 9。
- upstream：无。
- tag：HEAD 上无 tag；本轮没有创建任何 lightweight 或 annotated tag。
- 候选 diff：55 files changed，2340 insertions，3425 deletions。
- `origin/main...HEAD` binary diff SHA-256：`eb64ccc74c22472fbd8f4e456015ae97a2df2159f2848a1402125144295b9788`。
- 源码 staged / unstaged / untracked：均为 0，工作树干净。
- 分支创建过程：开始时从已验证、干净且位于 `main` 的 `44d1e566e08b5e187e23dd2ef51308ebbb6c60b0` 创建全新 `zhennn/w12-v2-fee-rules`；没有复用、删除、重建或 reset 既有候选分支，结束时仍停留在该功能分支。

根文档仓库：

- 路径：工作区根目录。
- branch：`main`。
- HEAD：`e444c7b2de0a608fd4d56e9a7054d599b94e00e7`。
- tree：`53f4fdbde209fc4d3fbd89e76494ddae9c21355b`。
- 相对 `origin/main`：behind 0 / ahead 0。
- staged / unstaged：0。
- untracked：执行前已有的 02A、02C，以及本任务唯一允许新增的本 02B。
- tracked diff：0；02B 是本轮唯一新增文件，保持 untracked、未暂存、未提交。
- 02A SHA-256：`c8bb079ea084c9309e5a763aace357a7e2e83bb18aad6aa180ed5c8de930c597`；02C SHA-256：`ad74ee72bab5fd003133870d046937a77836a01460a09e61e1ed159d217087cd`。两者保持原样；根仓库未提交、未推送。

实际授权来自用户持续目标：允许在建议候选分支实现、运行测试、创建分阶段本地提交和生成唯一未提交 02B。没有授权，也没有执行 push、merge、rebase、cherry-pick、squash、amend、tag、PR、设置 upstream 或删除分支。

## 三、本地提交链

| 阶段 | 完整 hash / 短 hash / 标题 | 实际文件范围 | 对应验证 |
| --- | --- | --- | --- |
| V2 合同 | `61586658eeeddbdfb704e167bed3e4a8417463e2` / `6158665` / `feat: define V2 ledger and fee rule contracts` | `models`、`initialLedgerData`、`ledgerReducer.test`、三个 Validator 与 ResourcePolicy 及其测试 | 合同 / 领域定向组 10 files / 144 tests PASS；最终 58 / 727 PASS |
| V2 文件与备份 | `c7a1b89fdbd622c082ce6f8686308349853a51ed` / `c7a1b89` / `feat: migrate file and backup flows to V2` | file handle / connection adapter、backup、access gate / composition、crypto / repository、persistence hooks、W11 fixtures | 文件 / 备份定向组 12 files / 282 tests PASS；最终 58 / 727 PASS |
| 手续费领域层 | `f845b07882cad896d2f4c83d613f1eca96a90ff1` / `f845b07` / `feat: add deterministic fee rule semantics` | `feeRuleService` 与测试、`ledgerReducer` 与测试 | 合同 / 领域定向组 144 / 144 PASS；最终全量 PASS |
| 页面闭环 | `753d0ee1a6f193fadea766b7f86bf288bd750eb8` / `753d0ee` / `feat: add fee rule management and trade preview` | README、Dashboard golden / interaction、`DashboardShell`、`FeeRuleManager`、`TradeForm`、ResourcePolicy | Dashboard interaction / golden 纳入定向组 PASS；最终全量、typecheck、lint、build PASS |
| 旧整账退出 | `ab9d0c62a59452b4d50868adbf8a5aed90f8a7ee` / `ab9d0c6` / `refactor: retire legacy ledger migration paths` | access gate / composition / controllers、ledger policies / repository 及其测试 | access / composition 纳入 282 / 282 定向组；真实旧 IndexedDB fixture 零写 PASS |
| 备份来源修复 | `dcd2a030bde2dcce3b536e1b310610e449e72504` / `dcd2a03` / `fix: preserve structured trade backup provenance` | `backupImportPreflight.test`、`tradeService` 与测试 | backup preflight 纳入 282 / 282；真实 V2 导出 / 预检 PASS |
| V1 拒绝文案修复 | `7e67a239887c77c761907454dce9789691538707` / `7e67a23` / `fix: explain unsupported ledger file versions` | access gate、file access controller 及其测试 | access 定向测试 PASS；真实 V1 文件密码前拒绝与零写 PASS |
| V2 边界说明 | `20ecf80c22f6c8658bea7acc2097cbc84262a9a0` / `20ecf80` / `docs: clarify V2 storage and fee rule boundaries` | `README.md`、`src/adapters/README.md` | 文档-only；最终 typecheck / lint / build / diff-check PASS |
| adapter 退役说明 | `083b9f7cc3244f8bb96ba81635f4d619ed0a4008` / `083b9f7` / `docs: mark legacy IndexedDB adapter as retired` | adapter README、`indexedDbStorageAdapter.ts` 注释 | 注释 / 文档-only；最终全部质量门 PASS |

以上九个完整 commit hash 都是独立本地回滚节点；没有用 Git tag 代替回滚点，也没有 amend 或 squash 改写历史。

第 6 项来自真实 V2 备份预检发现的 `rawText` 缺口：结构化页面交易现在生成确定性非空来源文本，外部已有非空 `rawText` 仍逐字保留。第 7 项来自真实 V1 文件验收发现的文案缺口：V1 / 未知版本现在返回稳定 unsupported-version 错误，页面明确提示版本 2 不支持解锁或迁移，且不进入密码页。第 8、9 项消除 README 对手续费规则和旧 IndexedDB adapter 的过期陈述。

## 四、FEE-001～003

| 目标 | 当前证据 | 当前结果 |
| --- | --- | --- |
| FEE-001 | LedgerData、.lftl 外层、generation 和 BackupEnvelope 全部切到字面量 2；V1 文件与备份拒绝；production 旧整账仅做存在性只读；connection record 仍只有三字段 | 候选实现、自动化、真实 V1 文件 / 备份拒绝、raw connection record 和旧整账注入退役均通过 |
| FEE-002 | fixed / percentage 判别联合；可选 Trade.platform；平台 + 资产精确匹配；无匹配 / 多匹配不猜；更新创建新 ID 并原子停用旧规则；历史 Trade 只读实际 fee | 候选实现、正式测试和真实主流程通过 |
| FEE-003 | FeeRuleManager 支持新增、版本更新、停用和冲突显示；TradeForm 显示候选、实际 fee、现金影响和来源；认证保存绑定 mutationVersion / persistedVersion | 候选实现、正式测试和真实主流程全部通过；外部 revision、权限失败、真实确认 / 取消恢复、同一实际文件双标签拒绝、删除后 fail closed 与显式新选择均通过 |

## 五、F02-M01～M30 当前证据矩阵

| ID | 当前证据 | 当前状态 |
| --- | --- | --- |
| M01 | Validator 只接受 schema 2；根字段严格；派生对象不序列化 | 自动化 PASS |
| M02 | fileFormatVersion 2、ledgerSchemaVersion 2；V1 / 未知稳定拒绝 | 自动化 + 真实 V1 PASS |
| M03 | fileId 稳定；current / previous 相邻 revision、parent 正确、IV 独立 | 自动化 + 宿主文件 PASS |
| M04 | PBKDF2-SHA-256 600000、16-byte salt、AES-256-GCM、12-byte IV、non-extractable key | 自动化 + 外层检查 PASS |
| M05 | 系统 Save / Open picker、新建、打开、锁定重开、最小连接记录 | 主流程、permission prompt / revoke / reload / 正确重选、移动后同句柄读取、删除后重载 fail closed、显式选择重建文件为新 C 均 PASS |
| M06 | 保存前复读，write-close-readback-解密-Validator 后才认证成功 | 自动化 + 真实交易保存 PASS |
| M07 | current 损坏且 previous 有效才恢复；取消零写；确认后新 current | 自动化 + 真实 Chrome PASS；单字节损坏 current 已由 previous 确认恢复，新 current 写回、相邻 revision 链与 Dashboard 均通过；独立 fixture 取消前后 hash / size / mtime 完全不变 |
| M08 | ready V2 + 固定文本 clear；旧 current 成 previous | 自动化 + 真实 clear PASS |
| M09 | BackupEnvelopeV2 明文导出、风险披露、事实完整 | 自动化 + 真实导出 PASS |
| M10 | V2 预检零写；空 C 整本恢复；candidate / identity / generation 一次性绑定 | 自动化 + 真实恢复 PASS |
| M11 | V1 .lftl 在密码前明确拒绝，文件 / C / connection 零写 | 自动化 + 真实 picker / hash PASS |
| M12 | BackupEnvelopeV1 无 candidate / evidence，当前 C 零写 | 自动化 + 真实 picker / 三项硬错误 / hash 零写 PASS |
| M13 | production 不解锁、不迁移、不删除旧 IndexedDB 整账 | 自动化 + 真实受控旧 record 注入；只显示退役，reload 前后 raw log hash 不变 PASS |
| M14 | origin raw LevelDB 的正式 connection record 只含 connectionFormatVersion、handle、expectedFileId，无账本 / fee / crypto / password 字段 | raw 证据 PASS；受控旧 record 另库注入、原样拒绝后由开发执行者显式清理 |
| M15 | JSON、额外字段、未知版本、metadata、Base64URL、lineage、schema、payload、资源与错误文件 fail closed | 自动化 + 真实 V1 / 错误文件 PASS |
| M16 | platform 可选、原样持久化；空白 / 超限拒绝；不默认 Binance / OKX | 自动化 + 真实无平台 PASS |
| M17 | fixed / percentage 联合含 asset、platform、USDT、status 和版本引用 | 自动化 + 真实规则 PASS |
| M18 | 只做平台 + 资产精确匹配，不折叠大小写、不做别名 / 包含 / 最近规则 | 自动化 PASS |
| M19 | fixed 候选精确等于 amount | 自动化 + 真实 fixed 5 / 6 PASS |
| M20 | percentage 候选 = totalValue × rate，Decimal 40 位，无隐式舍入 | 自动化 + 真实 6500 × 0.001 = 6.5 PASS |
| M21 | 无匹配不猜；两个 active 冲突不自动选第一个 | 自动化 + 真实冲突 PASS |
| M22 | 更新新 ID + 原子停用旧规则；经济字段不原地改；不物理删除 | 自动化 + 真实 5 → 6 PASS |
| M23 | 候选必须显式采用，可覆盖；最终 Trade 保存用户值并披露已修改 | 自动化 + 真实 6.5 → 7 PASS |
| M24 | 规则变化不扫描、不修改、不重算旧 Trade；inactive 引用有效 | 自动化 + 锁定重开 PASS |
| M25 | 规则新增、查看、版本、停用、冲突和禁用状态 | 自动化 + 真实页面 PASS |
| M26 | 成交金额、fee、总支出 / 净到账、规则来源和用户覆盖同屏 | 自动化 + 真实页面 PASS |
| M27 | reducer 只显示待保存；当前 mutation persistedVersion 达标后才认证成功 | 自动化 + 真实主流程 PASS |
| M28 | 权限、旧异步、identity / revision、双标签和各保存阶段失败 fail closed | 自动化 + 真实权限撤销 / 错误副本重选拒绝 / 外部 revision 拒写 / 物理副本不误锁 / 同一实际文件第二标签占用拒绝 / 错误密码零写 / 删除后旧句柄不可用且不静默跟随 / 显式新选择 PASS |
| M29 | 6505 / 2602 / 2797 / 195 / 3903，零费、多买、部分 / 全部卖、缺价、异币 fee | 自动化 + 真实固定样例 PASS |
| M30 | absent / null / explicit mapping 不物化；P&L、图表、候选 fee 不进账 | 自动化 PASS；V2 真实导出结构未见派生 |

## 六、实现与永久正式测试

主要实现边界：

- `models/types.ts`、`initialLedgerData.ts`、`ledgerDataValidator.ts`：严格 V2 与 FeeRule 联合。
- `ledgerFileContract.ts`、`ledgerFileCrypto.ts`、`ledgerFileRepository.ts`：.lftl V2、双代、加密、保存、恢复与 clear。
- `backupEnvelope.ts`、`backupImportPreflight.ts`：BackupEnvelopeV2、V1 拒绝、零写预检和整本恢复。
- `ledgerAccessComposition.ts`、`ledgerAccessController.ts`、`LedgerAccessGate.tsx`：旧 IndexedDB 整账只做存在性拒绝，迁移 / 解锁 / 删除 UI 不再可达。
- `ledgerFileConnectionAdapter.ts`：exact 三字段 connection record，账本 schema 升级不扩张记录。
- `feeRuleService.ts`、`ledgerReducer.ts`、`FeeRuleManager.tsx`、`TradeForm.tsx`：确定性候选、版本 / 停用、冲突、用户覆盖和页面闭环。
- `usePersistentLedger.ts`、`DashboardShell.tsx`：mutationVersion / persistedVersion、dirty / retry / quiesce 与认证成功时点。

正式测试覆盖 58 个文件。

阶段收口后重新运行的两组定向正式测试：

```text
npx vitest run src/validators/ledgerDataValidator.test.ts src/validators/resourcePolicy.test.ts src/validators/tradeValidator.test.ts src/services/feeRuleService.test.ts src/state/ledgerReducer.test.ts src/components/dashboard/DashboardShell.interaction.test.tsx src/components/dashboard/DashboardShell.golden.test.tsx src/services/positionService.test.ts src/services/pnlSummaryService.test.ts src/services/chartDataService.test.ts
exit 0
Test Files 10 passed (10)
Tests 144 passed (144)
Duration 5.42s
warning / error: 0

npx vitest run src/encryption/ledgerFileContract.test.ts src/encryption/ledgerFileCrypto.test.ts src/repositories/ledgerFileRepository.test.ts src/backup/backupEnvelope.test.ts src/backup/backupImportPreflight.test.ts src/adapters/ledgerFileConnectionAdapter.test.ts src/adapters/ledgerFileHandleAdapter.test.ts src/composition/ledgerFileAccessController.test.ts src/composition/ledgerAccessComposition.test.ts src/hooks/usePersistentLedger.test.tsx src/hooks/usePersistentLedger.fileCapabilities.test.tsx src/components/security/LedgerAccessGate.test.tsx
exit 0
Test Files 12 passed (12)
Tests 282 passed (282)
Duration 7.09s
warning / error: 0
```

最终全量运行：

```text
npm test
exit 0
Test Files 58 passed (58)
Tests 727 passed (727)
Duration 9.52s
warning: Not implemented: navigation to another Document
```

该 warning 是 jsdom 已知导航提示，不是失败、skip 或真实 Chrome 替代。

```text
npm run typecheck
exit 0
warning / error: 0

npm run lint
exit 0
warning / error: 0

npm run build
exit 0
Next 15.5.22
route /: 303 kB
first load: 405 kB
warning / error: 0
```

最终 Chrome 取证结束后已停止 production server，并重新执行全部门：`npm run typecheck`、`npm run lint`、`npm run build` 均 exit 0。production build 使用 Next 15.5.22，route `/` 为 303 kB，first load 405 kB。

最终残留扫描的确切命令与退出码如下；`rg` 的 exit 1 表示没有匹配，不是执行错误：

| 命令 | exit | 结果 |
| --- | ---: | --- |
| `rg -n '\.(only\|skip)\s*\(' src --glob '*.{ts,tsx,js,jsx}'` | 1 | `.only` / `.skip` 0 |
| `rg -n '\bdebugger\b' src --glob '*.{ts,tsx,js,jsx}'` | 1 | `debugger` 0 |
| `rg -n 'console\.(log\|debug)\s*\(' src --glob '*.{ts,tsx,js,jsx}'` | 1 | production `console.log` / `console.debug` 0 |
| `rg -n '^(<<<<<<<\|=======\|>>>>>>>)' README.md src test-fixtures` | 1 | merge conflict 标记 0 |
| `rg -n '\b(TODO\|FIXME\|XXX\|HACK)\b' README.md src test-fixtures` | 1 | 残留标记 0 |
| `rg -n '\b(Number\|parseFloat)\s*\(' src/services/feeRuleService.ts src/state/ledgerReducer.ts src/components/trades/TradeForm.tsx src/components/fees/FeeRuleManager.tsx` | 1 | 手续费业务层降精度调用 0 |
| `rg -n 'Math\.(round\|floor\|ceil)\s*\(' src/services/feeRuleService.ts src/state/ledgerReducer.ts src/components/trades/TradeForm.tsx src/components/fees/FeeRuleManager.tsx` | 1 | 原生舍入公式 0 |
| `rg -n 'schemaVersion\s*:\s*1\|fileFormatVersion\s*:\s*1\|BackupEnvelopeV1' src --glob '!**/*.test.*'` | 1 | 非测试 production V1 残留 0 |
| `git diff --check` | 0 | 源码 whitespace / conflict 错误 0 |

## 七、真实 Chrome 阶段证据

环境：

- production build + `next start`，真实 Google Chrome，loopback `http://127.0.0.1:3100`。
- 使用真实 macOS Save / Open 系统 picker；不是 jsdom、内置浏览器或静态截图。
- 只使用专用虚构文件和受控旧格式 fixture；没有打开个人账本。
- 密码只由用户本人输入；本报告不记录、回显或持久化密码。

已经完成：

1. 新建 V2 C，外层 format 2 / schema 2、fileId、600k KDF、AES-GCM、current / previous null 结构正确。
2. 创建 fixed 5，创建新版本 fixed 6 并停用旧版；percentage 0.001；制造两个 active 冲突并证明不自动选择。
3. 无平台手填 fee；唯一规则候选；percentage 6.5；用户覆盖为 7；Trade 保存 platform / fee / feeRuleId。
4. 固定买卖样例得到 6505 / 2602 / 2797 / 195 / 3903；数量 0.06，市值 4800；三图渲染。
5. 锁定重开后规则历史、Trade 实际 fee 和 P&L 不变。
6. clear 生成新 current、旧 current 成 previous。
7. 修复结构化 Trade rawText 后重建样例，导出 V2 备份；严格预检 0 hard errors / 0 suspicious groups。
8. 在专用空 V2 C 整本恢复成功，页面、规则、交易、价格与 P&L 全量一致；revision 链和独立 IV 正确。
9. V1 .lftl 通过真实 picker 在密码前明确拒绝；V1、自身 C 和 connection record 的 hash / mtime 均未变化。
10. 非法错误文件通过真实 picker 明确拒绝；错误文件、当前 C 和 connection record 均未写。
11. raw IndexedDB LevelDB 中正式 connection record 只含 `connectionFormatVersion`、`handle`、`expectedFileId`，没有 ledger / trade / asset / fee / password / crypto 字段。
12. BackupEnvelopeV1 通过真实 picker 预检，稳定得到 format、envelope schema、LedgerData schema 三项硬错误；V1 备份、当前 C 和 raw IndexedDB log 的 hash / size / mtime 均不变。
13. 撤销 Chrome 的文件访问权限后重载，页面只显示“需要明确重新授权”；同名 / 同 fileId 的物理副本被明确拒绝为不是同一实际 C，重选原文件后再出现独立 “Save changes” 权限确认并恢复到解锁页。
14. 真实第二标签通过系统 picker 选择同 fileId 的 `/private/tmp/W12-V2-COPY.lftl`，正常进入密码页，没有产生 `FILE_IN_USE` 误判；主文件和副本 hash 均未写。
15. 外部程序把当前路径短暂替换为另一条有效 revision 后，页面 mutation 只停留内存并明确提示“C 已在本页面之外发生变化，当前修改尚未保存”；磁盘没有被覆盖，随后逐字节恢复的主 C 与救援副本 SHA-256 一致。
16. 在专用 Chrome 窗口向旧 IndexedDB 整账 store 注入带 `W12_CONTROLLED_LEGACY_V1` 标记的虚构记录；production reload 只显示“旧版账本已退役”，明确不解锁、不迁移、不删除、不读取业务数据。reload 前后 raw log SHA-256 均为 `4f9851d559e2070a97764cd2091886de2f393d1140223811065e789422a0c1ce`；证据冻结后仅由开发执行者显式删除该受控 fixture。
17. 390×844 真实 Chrome：`innerWidth = outerWidth = clientWidth = scrollWidth = 390`；两张宽表各为 960px，只在 308px 父容器内部横向滚动，页面本身不溢出。
18. 1280 CSS 视口：在真实 Chrome 1152px 窗口配合浏览器 90% 页面缩放形成 `innerWidth = clientWidth = scrollWidth = 1280`；页面无横向溢出，第一张宽表局部滚动、第二张表在 1159px 容器内完整显示。验收后缩放恢复 100%，窗口恢复原尺寸。
19. 主候选标签的最终阶段 console warning / error 列表为空。
20. 文件移动后真实 `FileSystemFileHandle` 仍跟随同一物理 inode，可读取并进入认证失败而不是误报缺失；受控删除 fixture 已从救援副本重建。
21. 用户在真实 Chrome 对单字节损坏 current、有效 previous 的 `/private/tmp/W12-RECOVERY-CANCEL.lftl` 输入正确密码并确认恢复；页面回到 Dashboard 且显示“已保存到本地”，文件 SHA-256 从 `f9bca8f682701943401c21071880db98ec59a8a5a4aa7110e829613332f2f975` 变为 `f75bc865a8efa9693888694d851951080c6e0268fbfc4859507a04fbd28e452c`。最终 current revision `3ddddf22-c8bb-47ff-845e-607923a5982a` 的 parent 为 previous revision `54aab8f4-e6f4-4135-88eb-af4dd6ccdbc1`；两代 schema 均为 2，页面交易、规则和 P&L 可读，console warning / error 为空。
22. 保持恢复确认会话占用该实际 C，再开第二个真实 Chrome 标签；用户输入正确密码后页面稳定提示“这个实际 C 已被另一个页面或尚未完成释放的会话占用。请先安全退出或完成释放，再主动重试。”，没有挂载第二份 Dashboard。其后文件 SHA-256 仍为 `f75bc865a8efa9693888694d851951080c6e0268fbfc4859507a04fbd28e452c`。
23. 用户在同一第二标签额外输入一个错误密码，页面稳定提示“密码错误或文件认证失败；未写入所选 C。”；开发执行者复核提示存在，恢复 C、未使用的损坏 fixture、主 C 和救援副本 hash 均未变化。
24. 用户对独立损坏 fixture `/private/tmp/W12-RECOVERY-CONFIRM.lftl` 输入正确密码后，页面只在 current 认证失败、previous 独立有效时显示“确认恢复上一版”；开发执行者点击“取消恢复”，页面退回“选择或新建 C”。取消前后 SHA-256 均为 `f9bca8f682701943401c21071880db98ec59a8a5a4aa7110e829613332f2f975`，size 均为 8546 bytes，mtime 均为 `1786375270`，证明取消零写。
25. 对已确认恢复的 `/private/tmp/W12-RECOVERY-CANCEL.lftl` 先生成逐字节救援副本并验证两者 SHA-256 均为 `f75bc865a8efa9693888694d851951080c6e0268fbfc4859507a04fbd28e452c`；锁定会话后只删除该 `/private/tmp` 受控副本，重载稳定显示“上次的 C 暂时不可用”，并明确“可能已移动、删除或不可读取”“没有创建空账本，也没有静默切换到浏览器账本”。随后从救援副本逐字节恢复原路径；恢复文件 hash 不变，但 inode 与救援副本不同。
26. 旧句柄标签在文件重建后继续停留于“上次的 C 暂时不可用”，没有静默跟随或写入新物理 entry。用户在另一真实 Chrome 标签通过系统 picker 把重建文件明确选择为新的 C，正确认证后进入 Dashboard 并显示“已保存到本地”；此后正常会话与行情刷新生成一条合法新 revision，文件 SHA-256 从 `f75bc865a8efa9693888694d851951080c6e0268fbfc4859507a04fbd28e452c` 变为 `bb2610fee0f5533e8c417a5ce1e1b079eded9cf50e0f4e1f00b35cd1950ff298`。旧不可用标签和新显式选择标签的 console warning / error 均为空。这证明旧句柄 fail closed，只有显式新选择和正确认证才能重新建立可写会话。

## 八、虚构证据文件

| 文件 | 用途 | SHA-256 |
| --- | --- | --- |
| `/Users/zhuzhen0131/Downloads/213312123.lftl` | 当前专用虚构 V2 恢复 C；用户成功解锁后行情事实触发了新 revision | `b13cf83604938aba5624de8a520116da06cbcb41e0de62fc21105c8b0323fbb4` |
| `/private/tmp/W12-PRIMARY-RESCUE-B13.lftl` | 外部 revision 测试前逐字节救援副本 | 与当前 C 同为 `b13cf83604938aba5624de8a520116da06cbcb41e0de62fc21105c8b0323fbb4` |
| `/private/tmp/W12-V2-COPY.lftl` | 物理副本不误锁；保留较早一条有效 revision | `d951a591683f2241ab3333f44637105041bd3c4dfde9c93da83f3c5ebd725e0e` |
| `/private/tmp/W12-RECOVERY-CANCEL.lftl` | 原单字节损坏 fixture；确认恢复后经历删除 / 重建，并被用户显式选择为新的 C；正常会话生成新 revision | `bb2610fee0f5533e8c417a5ce1e1b079eded9cf50e0f4e1f00b35cd1950ff298` |
| `/private/tmp/W12-RECOVERY-CONFIRM.lftl` | 独立单字节损坏 fixture；确认恢复披露后执行取消，hash / size / mtime 零变化 | `f9bca8f682701943401c21071880db98ec59a8a5a4aa7110e829613332f2f975` |
| `/private/tmp/W12-RECOVERY-CANCEL-BEFORE-DELETE.lftl` | 删除测试前逐字节救援副本；用于恢复受控文件，不是同一物理 entry | `f75bc865a8efa9693888694d851951080c6e0268fbfc4859507a04fbd28e452c` |
| `/private/tmp/local-first-trading-ledger-backup-v1-20260810-103437Z.json` | 修复后的 V2 明文备份 | `1e41163bde1d73fc80721b7e39438a179f164deb5be591d513aba5bb8dc0f642` |
| `/private/tmp/W12-V1-REJECT.lftl` | V1 文件拒绝 fixture | `bbd530c433ac0937ed5cf0a4c5163fa4950d7761cee08992182122c4ea90371d` |
| `/private/tmp/W12-V1-BACKUP-REJECT.json` | V1 备份拒绝 fixture | `eb65b649248d39a04cb5e63b9265c8bfb199bd78079238e0e575981317254900` |
| `/private/tmp/W12-WRONG-FILE.lftl` | 非法文件拒绝 fixture | `6b1df5d884455ba9c45b14c215047bac84387cf412887c8c1f873c64f3ddac1e` |

确认恢复检查点：fileId `e461f45e-5473-490e-9510-98cdae32c189`；current revision `3ddddf22-c8bb-47ff-845e-607923a5982a`，parent 为 `54aab8f4-e6f4-4135-88eb-af4dd6ccdbc1`；previous revision 即 `54aab8f4-e6f4-4135-88eb-af4dd6ccdbc1`，parent 为 `cecec9bb-05b2-40d2-a03c-e2862a33fa90`。删除 / 重建并作为新 C 显式选择后的最终检查点：current revision `7b894a41-1c27-46fb-bec1-1ad2f9598cc5`，parent 为 `3ddddf22-c8bb-47ff-845e-607923a5982a`；previous revision 即 `3ddddf22-c8bb-47ff-845e-607923a5982a`，parent 为 `54aab8f4-e6f4-4135-88eb-af4dd6ccdbc1`。两代 schema 均为 2；Dashboard 与交易、规则、P&L 可读，console warning / error 为空。

## 九、边界、偏离与停止线

以下为 02B 冻结时的开发边界；合并与延期决定见第十节后续协调记录。

- 开发侧候选、02B、自动化绿灯和本轮 Chrome 证据都不能写成 FEE-001～003 最终完成；只有全新任务执行 02C 并生成 02D = PASS，后续协调任务才可回写状态。
- 当前没有自动化或真实 Chrome 强制反证；02A 要求的强制矩阵已经全部完成。删除后旧句柄稳定 fail closed，重建文件只有在另一标签被显式选择为新 C 并正确认证后才建立可写会话，不存在静默替换。
- 报告冻结时，本轮开发侧已经 PASS 并形成待独立审查候选；开发执行者不得自审或提前生成 02D。
- 根文档收口检查：对唯一 02B 执行尾随空白扫描为 exit 1 / 0 matches，末字节为 `0a`；敏感密码字面量专项扫描为 exit 1 / 0 matches。根仓库最终 `git status --porcelain=v2 --branch` 只有执行前已有 02A、02C 与新增 02B 三个 untracked 条目，没有 staged 或 tracked diff。
- 已接受的纯浏览器上限保持不变：只能在能证明磁盘仍是本事务精确 candidate 时补偿；无法确认时 fail closed，不能承诺进程死亡、永久权限丢失或外部原生程序获胜后仍完成回滚。
- 没有修改 00A～00D、当前状态、01 系列、02A、02C、CS2026 或 03～07。
- 没有 push、upstream、merge、rebase、cherry-pick、squash、amend、tag、PR、reset、stash、分支删除或分支重命名，也未处理真实个人账本或真实个人交易。

## 十、后续协调记录

本节记录开发报告冻结后的产品负责人决定，不改写前九节在开发任务结束时的 Git 与证据事实。

- 2026-08-10，用户明确授权把候选 fast-forward 合入源码 `main`；九个阶段提交已原样进入 `main`，实现 tip 为 `083b9f7`。
- 源码 README 以 `7481e78` 同步 V2、FeeRule、58 / 727 开发门与真实 Chrome 开发侧矩阵。
- 02A 的状态头随后从“待执行”更新为“已执行”；执行合同正文未改写。前文记录的原始 02A hash 仍是开发冻结时证据。
- 用户决定不立即执行 02C，也不生成 02D；独立审查改为若干功能完成后的集中复验。
- 本批最终状态是“开发 PASS、已合入、待集中独立复验”，不是“02D PASS”。
