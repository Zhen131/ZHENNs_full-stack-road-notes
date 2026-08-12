# Week 13 main 源码目录重构独立审计问题与修复清单

日期：2026-08-12

状态：`独立审计 FAIL；待 R1 修复`

文档角色：独立审计问题报告 + R1 修复执行输入；不是修复完成报告

源码轨道：`01一些进度/产出/LocalFirstTradingLedger/`

审计分支：`zhennn/w13-main-source-layout`

冻结提交：`5d064eb66fb4c9e7c1f3d79c00e7854b088398df`

对应计划：`01A_W13-main-源码目录重构执行计划.md`

原开发报告：`01B_W13-main-源码目录重构执行报告.md`

## 结论

目录搬迁、业务行为、自动检查和真实 Chrome 核心流程均通过，但候选分支没有完全满足 01A 的引用合同：当前存在 15 处“目录内部反向引用自身稳定入口”、3 组静态依赖环，现有 ESLint 与结构测试又同时漏检这些问题。因此，01B 的功能和浏览器证据继续有效，但其“稳定入口与结构守卫全部通过”的结论被本次独立审计推翻；当前候选对合并的最终判定为 `FAIL / NO-GO`。

真实 Chrome 还复现了一个搬家前已经存在的 macOS 文件选择问题：正常 Open picker 中 `.lftl` 显示为灰色，只能借 Finder 搜索强制选中。它不是本次搬家造成的回归，也没有损坏文件，但会阻碍账本最核心的重新打开流程，应在进入 UI 美化前一并修复。

本文件只授权后续按清单修复上述问题。当前不授权修改源码、提交、合并或推送；执行仍需用户另行确认。

## 一、审计判定总表

| 范围 | 结果 | 证据与边界 |
| --- | --- | --- |
| 六区目录搬迁 | `PASS` | `src` 只保留 `app / core / features / platform / test-support / ui / README.md`；旧一级目录消失 |
| 原测试保留 | `PASS` | 原 58 个测试文件未丢失，新增结构测试后为 59 个测试文件 / 732 项测试 |
| 业务逻辑不变 | `PASS` | 72 个移动后的生产文件去除 import / export 后内容一致；`package.json`、lockfile、CSS 无变化 |
| 自动质量门 | `PASS` | `npm test`、lint、production build、typecheck、`git diff --check` 全部通过 |
| 真实 Chrome 核心流程 | `PASS` | 新建虚构 V2 `.lftl`，保存 BTC 买入与手动价格，锁定、重新选择、解锁后数据恢复；1280 / 390 无整页溢出，console error 为 0 |
| 同目录引用合同 | `FAIL` | 15 处同目录代码通过 `@/platform/files` 或 `@/platform/legacy` 反向进入自己的 `index.ts`，违反“同一目录使用 `./file`” |
| 无循环依赖 | `FAIL` | 静态 import / export 图中存在 3 个强连通分量，共涉及 14 个文件 |
| 结构守卫有效性 | `FAIL` | `sourceLayout.test.ts` 5 / 5 通过、lint 也通过，但没有发现上述 15 处引用和 3 组依赖环 |
| macOS `.lftl` Open picker | `FAIL（既有问题）` | 文件扩展名正确、MIME 为 `application/json`、加密认证通过，但普通打开面板中仍为灰色；搜索后可强制选择并正常解锁 |

## 二、未通过项与复现

### W13-SRC-001：15 处自身稳定入口引用

严重度：`P1 / 阻塞目录重构合并`

01A 和 `src/README.md` 都规定：同一目录内使用 `./file`，稳定入口只服务跨边界调用。当前 9 处 `platform/files` 和 6 处 `platform/legacy` 内部文件却引用自己的稳定入口，形成 `内部文件 → index.ts → 内部文件` 的反向路径。

复现命令：

```bash
rg -n 'from "@/platform/files"' src/platform/files
rg -n 'from "@/platform/legacy"' src/platform/legacy
```

当前预期输出：第一条 9 行，第二条 6 行，合计 15 行。

完整清单：

| 区域 | 文件与 import 起始行 | 自身入口 |
| --- | --- | --- |
| files | `ledgerFileConnectionAdapter.ts:2` | `@/platform/files` |
| files | `ledgerFileHandleAdapter.ts:1` | `@/platform/files` |
| files | `ledgerFileHandleAdapter.test.ts:3` | `@/platform/files` |
| files | `ledgerFileRepository.ts:1` | `@/platform/files` |
| files | `ledgerFileRepository.ts:7` | `@/platform/files` |
| files | `ledgerFileRepository.ts:17` | `@/platform/files` |
| files | `ledgerFileRepository.test.ts:3` | `@/platform/files` |
| files | `ledgerFileRepository.test.ts:19` | `@/platform/files` |
| files | `ledgerFileRepository.test.ts:25` | `@/platform/files` |
| legacy | `encryptedLedgerRepository.test.ts:3` | `@/platform/legacy` |
| legacy | `encryptedLedgerRepository.test.ts:8` | `@/platform/legacy` |
| legacy | `encryptedLedgerRepository.test.ts:9` | `@/platform/legacy` |
| legacy | `indexedDbStorageAdapter.ts:1` | `@/platform/legacy` |
| legacy | `indexedDbStorageAdapter.test.ts:4` | `@/platform/legacy` |
| legacy | `storageAdapter.ts:1` | `@/platform/legacy` |

影响：当前运行和测试可能仍正常，但入口文件参与内部初始化，容易放大初始化顺序、部分导出未就绪和未来循环依赖风险；更直接的问题是它不符合本批明确写入 01A 的完成合同。

### W13-SRC-002：3 组静态依赖环

严重度：`P1 / 阻塞目录重构合并`

使用项目现有 TypeScript 解析能力读取全部受管 `.ts / .tsx` 的静态 import 与 re-export，并对解析后的本地文件图运行强连通分量检查，得到以下三组：

| 组 | 涉及文件 | 最短可见闭环 |
| --- | --- | --- |
| A：legacy 自循环 | `platform/legacy/index.ts`、`indexedDbStorageAdapter.ts`、`storageAdapter.ts` | `index → indexedDbStorageAdapter → index`；`index → storageAdapter → index` |
| B：backup / persistence | `features/backup/index.ts`、`backupImportPreflight.ts`、`backupImportReport.ts`、`platform/persistence/index.ts`、`ledgerRepository.ts` | `backup/index → preflight → persistence/index → ledgerRepository → backup/index` |
| C：coordination / files | `platform/coordination/index.ts`、`ledgerFileSessionCoordinator.ts`、`platform/files/index.ts`、`ledgerFileConnectionAdapter.ts`、`ledgerFileHandleAdapter.ts`、`ledgerFileRepository.ts` | `coordination/index → coordinator → files/index → ledgerFileRepository → coordination/index` |

其中 A 主要由 W13-SRC-001 直接造成；C 同时包含自身入口反向引用和 `files ↔ coordination` 的类型边界互引；B 是两个稳定 barrel 同时汇总运行期成员后形成的跨区域环。

影响：当前没有观察到功能故障，但入口一旦增加初始化逻辑、常量或副作用，循环可能从“潜在结构风险”升级为运行期 `undefined`、初始化顺序差异或测试 mock 漂移。修复必须保持备份预检证据的 fail-closed 核验，不得为了消环删除安全检查。

### W13-GUARD-001：ESLint 与结构测试同时漏检

严重度：`P1 / 阻塞目录重构合并`

复现命令：

```bash
npx vitest run src/test-support/sourceLayout.test.ts
npm run lint
```

当前结果：结构测试 `1 file / 5 tests PASS`，lint exit 0；随后 W13-SRC-001 和 W13-SRC-002 仍可稳定复现。

直接原因：

1. `importViolation(...)` 只检查“别名形式是否合法”，没有接收当前文件路径，所以无法判断一个合法跨边界地址是否正在被同一区域内部滥用。
2. ESLint 的正则只阻止 `../`、深层 alias 和未登记入口，没有按文件所在区域禁止自身稳定入口。
3. `sourceLayout.test.ts` 只检查目录、入口存在性和单条 import 形式，没有建立文件依赖图，也没有循环检测。

影响：当前守卫会给出假绿灯，01B 因此把“形式合法”误判成“合同完整满足”。若只手工改完现有 15 处而不补守卫，问题以后还会复发。

### W13-PICKER-001：macOS Open picker 中 `.lftl` 变灰

严重度：`P1 可用性 / 非数据安全问题 / 非本次搬家回归`

现场复现：

1. 在真实 Google Chrome 和 production build 中新建 V2 `local-first-trading-ledger.lftl`。
2. 写入并认证保存 1 条 FeeRule、1 条 BTC 买入和 1 条手动价格。
3. 立即锁定，返回“选择或新建 C”，点击“选择 C（.lftl）”。
4. 在 macOS Open picker 中进入该临时目录；目标 `.lftl` 显示灰色，普通点击不能选中。
5. 使用 Finder 搜索强制选择同一文件后可以进入密码页；同密码解锁成功，交易、价格、手续费、持仓和盈亏全部恢复。

文件侧证据：

- 文件扩展名为小写 `.lftl`。
- 系统识别 MIME 为 `application/json`。
- 文件可通过 AES-GCM 认证解密，内容为 1 条 FeeRule、1 条价格、1 条交易。
- 选择器配置固定为 `"application/json": [".lftl"]` 且 `excludeAcceptAllOption: true`。
- `main@7481e78` 的旧路径 `src/adapters/ledgerFileHandleAdapter.ts` 已使用完全相同配置，因此不是 Week 13 搬家引入。

影响：没有数据丢失或格式损坏，但用户无法按正常路径重新打开软件自己创建的账本，必须知道搜索绕行方法；这应在 UI 美化前修复。

## 三、R1 修复执行清单

### R1-0：冻结现场

- [ ] 只进入 `LocalFirstTradingLedger/`，确认分支为 `zhennn/w13-main-source-layout`。
- [ ] 确认 HEAD 为 `5d064eb66fb4c9e7c1f3d79c00e7854b088398df`，工作树 clean，upstream 为 none。
- [ ] 确认 `main` 与 `origin/main` 仍为 `7481e781dffcd4f444e151d6baaf8778e5b9d170`。
- [ ] 依次重跑 `npm test → lint → build → typecheck → git diff --check`，保存 59 / 732 基线。
- [ ] 任一冻结条件不符即停止，不覆盖、不 reset、不吸收用户改动。

### R1-1：先补会失败的正式结构守卫

- [ ] 让 `sourceLayout.test.ts` 的 import 检查同时接收“当前文件路径 + specifier”。
- [ ] 新增“同一区域不得引用自身稳定入口”测试；首次运行必须准确报告当前 15 处，而不是只判断非零。
- [ ] 使用项目已有 TypeScript 解析能力解析静态 import / re-export，加入强连通分量检查；首次运行必须准确报告当前 3 组、14 个文件。
- [ ] 在 ESLint 中生成按区域的自身入口限制，覆盖 core、platform、features、app、ui、test-support；不得只为当前 files / legacy 两个目录硬编码一次性规则。
- [ ] 保留首次红灯输出作为修复前证据；不得提交一个正式测试仍红的 commit。

### R1-2：移除 15 处自身入口引用

- [ ] `platform/files` 的 9 处改为同目录 `./ledgerFileContract`、`./ledgerFileCrypto`、`./ledgerFileHandleAdapter` 等精确相对引用。
- [ ] `platform/legacy` 的 6 处改为 `./cryptoEnvelope`、`./storageAdapter`、`./webCryptoEncryptionService` 等精确相对引用。
- [ ] 测试与生产代码使用同一规则，不允许测试为了方便继续走自身 barrel。
- [ ] 只改 import / export 地址，不改函数体、类型语义、错误文案、数据格式或安全拒绝链。
- [ ] 复跑搜索，`@/platform/files` 在 `src/platform/files` 内为 0，`@/platform/legacy` 在 `src/platform/legacy` 内为 0。

### R1-3：拆掉剩余两组跨区域环

#### backup / persistence

- [ ] 为内容身份建立一个明确、窄且有名字的稳定子入口，例如 `@/platform/persistence/identity`；该入口只暴露内容身份函数，不加载整个 persistence barrel。
- [ ] `backupImportPreflight.ts` 只通过该窄入口读取 `createLedgerDataContentIdentity`。
- [ ] 在 ESLint、结构测试和 `src/README.md` 中精确登记这个公开子入口；仍禁止其他 persistence 深层地址。
- [ ] 不复制 SHA-256 实现，不移动或削弱 `inspectLedgerBackupImportEvidence(...)`，不删除 WeakMap receipt / attestation 核验。

#### coordination / files

- [ ] 将 `LedgerFileSessionLease` 这类共享端口提取为单向依赖可用的类型文件，并从稳定入口保留兼容 type export。
- [ ] 让依赖方向收敛为 `coordination → files` 或 `files → coordination` 的单向关系，禁止双方 barrel 互相加载。
- [ ] 保持 `isSameEntry()`、跨页面 lease、写锁、quiesce / release 和文件 Repository 行为不变。
- [ ] 强连通分量检查最终为 0；不得通过忽略 type-only import、排除 index.ts 或白名单现有环获得绿灯。

### R1-4：修复 macOS `.lftl` 打开面板兼容问题

- [ ] Save picker 保持严格的 `.lftl` 建议名和类型过滤。
- [ ] Open picker 保留 `.lftl` 类型提示，但允许系统提供“所有文件”回退，不再把 `excludeAcceptAllOption` 固定为 `true`。
- [ ] 选择完成后继续强制执行 `.lftl` 扩展名、大小、UTF-8、V2 文件合同、加密认证和 fileId / revision 检查；“所有文件”只解决系统过滤，不降低应用验证。
- [ ] 补正式测试：Open picker 参数包含回退；非 `.lftl` 仍在读取前被拒绝；取消仍为零写入；错误文件不会进入密码解锁或发布连接记录。
- [ ] 真实 macOS Open picker 必须无需 Finder 搜索即可选择同一 `.lftl`；若仍需搜索，只能记 `FAIL` 或 `BLOCKED`，不能写 PASS。

### R1-5：说明与最终收口

- [ ] 若增加窄稳定子入口，同步英文 `src/README.md` 的 import contract 和新增功能模板。
- [ ] 更新结构测试的错误信息，使其同时报告文件、行号、specifier 和环成员。
- [ ] 检查生产 diff：只允许引用结构、守卫、说明和 picker 兼容修复；禁止顺手做 UI 美化或业务重构。
- [ ] 每个源码 commit 后确认分支正确、工作树 clean、upstream none。
- [ ] 不 merge、不 push、不 rebase、不 amend、不 squash、不 cherry-pick、不 reset、不创建 PR、不删除分支。

## 四、建议的独立回退提交

| 顺序 | 英文 commit 标题 | 范围 |
| --- | --- | --- |
| 1 | `refactor: remove self-referential source imports` | 15 处自身入口改为同目录相对引用 |
| 2 | `refactor: break source dependency cycles` | backup / persistence 窄入口与 coordination / files 单向类型边界 |
| 3 | `test: enforce source dependency boundaries` | 自身入口和循环依赖永久守卫、ESLint 与源码说明 |
| 4 | `fix: allow macOS ledger file selection fallback` | Open picker 回退、负面测试与真实 macOS 验证 |

若实际 diff 证明第 2、3 项必须原子提交，可以合并为一个 commit，但不得把 picker 修复混入结构重构 commit。不得改写原五个搬家提交。

## 五、每阶段检查与最终通过线

每个阶段提交前依次运行，build 与 typecheck 不并行：

```text
npm test
npm run lint
npm run build
npm run typecheck
git diff --check
```

最终必须同时满足：

| 检查 | 通过线 |
| --- | --- |
| 自身稳定入口 | 全仓同一区域自身入口引用为 0 |
| 静态依赖环 | 全部受管 `.ts / .tsx` 强连通分量为 0，不忽略 type-only 或 barrel |
| 守卫可信性 | 修复前准确红出 15 处 / 3 组，修复后转绿；手工重新制造一处自身入口和一组小环时测试能失败，撤销夹具后恢复 |
| 原测试 | 原 59 个测试文件和 732 项测试不得减少；新增守卫和 picker 测试后总数必须增加 |
| 业务行为 | 既有测试、lint、build、typecheck、diff-check 全绿；生产函数体和账本合同无计划外变化 |
| Chrome 核心流 | 虚构 V2 `.lftl` 创建、FeeRule、BTC 买入、价格、锁定、正常 Open picker 重选、同密码解锁、持久化全部通过 |
| macOS picker | 不使用 Finder 搜索即可选中软件创建的 `.lftl`；非 `.lftl` 仍被应用拒绝 |
| 响应式与 console | 1280 / 390 无整页横向溢出，console error 为 0 |
| Git | 只在功能分支新增独立 R1 commits；源码 `main` / `origin/main` 不变，无 upstream、merge 或 push |

若 SRC / GUARD 任一项未清零，R1 判 `FAIL`；若真实 Chrome 或原生 picker 无法取得证据，判 `BLOCKED`。不得以 59 / 732 全绿替代结构与原生 picker 证据。

## 六、文档与判定关系

1. 01A 继续保存原始搬家合同，不回写结果。
2. 01B 继续保存开发执行和当时的 PASS 证据，不删除、不改写历史。
3. 本 01C 是后续独立审计事实和 R1 修复输入；在是否合并的判断上，01C 的 `FAIL / NO-GO` 优先于 01B 的开发侧 PASS。
4. 本轮只创建 01C，不修改源码、不更新 `00-当前开发状态.md`，也不生成修复完成报告。
5. 用户另行授权执行 R1 后，结果应单独生成 `01D_W13-main-源码目录重构R1修复报告.md`；只有 01D 对冻结后的完整候选判 `PASS`，才进入合并讨论。

## 七、本次 01C 写入边界

- 根文档仓库保持 `main`；只新增本文件，保留现有 `.obsidian/app.json` 用户改动。
- 源码仓库保持 `zhennn/w13-main-source-layout@5d064eb` 且 clean；本次未写源码。
- 未进入 `CS2026`、`02_NLP`、真实个人账本或外部参考项目。
- 本次未 stage、未 commit、未 merge、未 push。
