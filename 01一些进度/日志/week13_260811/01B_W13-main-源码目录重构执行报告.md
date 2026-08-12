# Week 13 main 源码目录重构执行报告

日期：2026-08-12

执行轨道：长期产品账本 `main`

最终判定：`BLOCKED`

## 结论

五阶段源码目录搬迁已在本地功能分支形成五个独立 commit，基线、每阶段和五阶段后的最终自动检查均通过；但真实 Google Chrome 无法完成系统文件选择器中的新建文件，本轮没有产生 `.lftl`，因而没有交易、认证保存、锁定释放、重选解锁、持久化和双视口证据。按 01A 第 8.3 和第 10 节，整批必须判为 `BLOCKED`，不得宣称源码搬家验收成功。

## Git 边界与最终状态

| 维护面 | 绝对路径 | 分支 / upstream | HEAD | 相对 `origin/main` | 状态 |
| --- | --- | --- | --- | --- | --- |
| 根文档仓库 | `/Users/zhuzhen0131/Library/Mobile Documents/iCloud~md~obsidian/Documents/全栈之路` | `main` / `origin/main` | 01B 提交前为 `0dc1272128c83139f92a6147040a1e0558228e50`；最终为本文件的 `docs: 记录 Week 13 源码目录重构执行结果` 提交 | 提交前 behind 0 / ahead 1；提交后 behind 0 / ahead 2 | 除本 01B 外无改动，未 push，未 merge |
| 产品源码仓库 | `/Users/zhuzhen0131/Library/Mobile Documents/iCloud~md~obsidian/Documents/全栈之路/01一些进度/产出/LocalFirstTradingLedger` | `zhennn/w13-main-source-layout` / none | `5d064eb66fb4c9e7c1f3d79c00e7854b088398df` | behind 0 / ahead 5 | clean，未 push，未 merge |
| 源码 `main` | 同上，独立 worktree 分支指针 | `main` | `7481e781dffcd4f444e151d6baaf8778e5b9d170` | 本地与 `origin/main` 均为同一 hash | 本任务未修改 |

根文档最终 commit hash 无法在该 commit 的内容中自我引用；应以提交后 `git rev-parse HEAD` 为准。本任务没有执行 fetch、pull、push、upstream 设置、tag、amend、rebase、cherry-pick、reset、PR、分支删除或任何 merge。

## 基线与五阶段提交

源码 base commit：`7481e781dffcd4f444e151d6baaf8778e5b9d170`

源码 final commit：`5d064eb66fb4c9e7c1f3d79c00e7854b088398df`

| 顺序 | 完整 hash | 标题 | 结果 |
| --- | --- | --- | --- |
| 1 | `92d65fd3580fb2f08605e0e958e707fc1e18cfa5` | `refactor: establish core source boundaries` | core 与 test-support 完成，通过本阶段 Gate |
| 2 | `2c6d6b917139339f3de40178501b1f1a5fd9e206` | `refactor: group storage and integrations under platform` | platform 完成，legacy 拒绝链保留，通过本阶段 Gate |
| 3 | `ad790b2e3d5b3a0c19a67b0971fc2f6822083fd7` | `refactor: organize product features` | 七个扁平 feature 完成，通过本阶段 Gate |
| 4 | `c8a171e8093a1ee160c3cf592cfb5893e388bfdf` | `refactor: align application shell and shared UI` | app / ui 与最终 Tailwind 扫描范围完成，通过本阶段 Gate |
| 5 | `5d064eb66fb4c9e7c1f3d79c00e7854b088398df` | `chore: enforce and document source layout` | ESLint、结构测试和英文说明完成，通过本阶段 Gate |

每次提交后均复核 `branch = zhennn/w13-main-source-layout`、worktree clean、upstream none。

## 自动检查证据

所有正式 Gate 都按 `npm test → npm run lint → npm run build → npm run typecheck → git diff --check` 顺序执行，build 与 typecheck 没有并行。

| 检查点 | `npm test` | lint | production build | typecheck | diff-check |
| --- | --- | --- | --- | --- | --- |
| `main@7481e78` 基线 | 58 文件 / 727 项，exit 0 | exit 0 | exit 0，`/` 303 kB，First Load 405 kB | exit 0 | exit 0 |
| 阶段 1 | 58 / 727，exit 0 | exit 0 | exit 0 | exit 0 | exit 0 |
| 阶段 2 | 58 / 727，exit 0 | exit 0 | exit 0 | exit 0 | exit 0 |
| 阶段 3 正式结果 | 58 / 727，exit 0 | exit 0 | exit 0 | exit 0 | exit 0 |
| 阶段 4 | 58 / 727，exit 0 | exit 0 | exit 0 | exit 0 | exit 0 |
| 阶段 5 | 59 / 732，exit 0 | exit 0 | exit 0 | exit 0 | exit 0 |
| 五提交后最终复跑 | 59 / 732，exit 0 | exit 0 | exit 0，`/` 303 kB，First Load 405 kB | exit 0 | exit 0 |

阶段 3 曾出现三次临时失败，已在提交前全部修复并从头复跑：

1. 首次为 5 个文件失败，59 项失败 / 668 项通过，原因是搬迁后的 fixture 地址和 mock 目标失效。
2. 第二次为 1 个文件失败，3 项失败 / 724 项通过，原因是 chart 测试仍按旧 mock 的 button role 查找。
3. 修正时一次过宽替换造成 4 项失败 / 723 项通过；立即收窄为 ECharts 边界 mock 和实际 `img` role，最终恢复 58 / 727。

没有删除测试、跳过检查或放宽业务断言。第五阶段新增 `sourceLayout.test.ts` 后测试上升到 59 / 732。

## diff 审计

- rename-aware diff 显示生产文件只发生目录移动、import / export 地址替换、稳定入口新增和计划内配置 / README 收口。
- 唯一生产改名为 `src/backup/backupContentIdentity.ts → src/platform/persistence/ledgerContentIdentity.ts`，`createLedgerDataContentIdentity` 导出保持不变。
- 生产函数体、类型合同、用户文案、CSS 内容和 Tailwind class 未改；`tailwind.config.ts` 仅将最终扫描范围收紧为 app / features / ui。
- `package.json` 与 `package-lock.json` 在 `7481e78..HEAD` 无 diff，没有安装依赖。
- 最终搜索未发现受 Git 管理的旧一级目录、旧 import、跨父目录 `../`、深层 alias 或旧 `backupContentIdentity` 路径。
- 未进入或修改 `LocalFirstTradingLedger-CS2026/` 与 `02_NLP/`。

## 最终源码目录与稳定入口

```text
src/
  README.md
  app/
  core/
    calculations/ catalog/ models/ policies/ shared/ state/ validation/
  features/
    backup/ charts/ fees/ market-data/ portfolio/ prices/ trades/
  platform/
    coordination/ encryption/ files/ integrations/ legacy/ persistence/
  test-support/
  ui/
```

七个 feature 均为扁平目录，同时具有 `index.ts` 和 `ui.ts`。跨边界只允许：

```text
@/core/<area>
@/platform/<area>
@/features/<feature>
@/features/<feature>/ui
@/app
@/ui
@/test-support
@root/package.json
```

ESLint `no-restricted-imports` 与 `sourceLayout.test.ts` 共同拒绝 `../`、深层 alias、未登记的旧 `@/` 地址和非法 `@root` 目标。

## 真实 Google Chrome 现场

### 环境与安全边界

- 使用最终 production build，Next.js 15.5.22，成功绑定 `http://127.0.0.1:3101`。受限环境中首次启动遇到 `listen EPERM`，在获得本地端口授权后成功启动，最后已停止。
- 系统 Google Chrome 在精确 `127.0.0.1:3101` origin 检测到一条未知历史连接记录。本轮没有点击重连、没有重选未知文件、没有清除该记录；为保证个人账本零接触，同一台绑定在 `127.0.0.1:3101` 的 server 改用独立 `http://localhost:3101` origin 进入空白的“选择或新建 C”入口。
- 本轮唯一临时目录为 `/private/tmp/lftl-w13-source-layout-smoke.jPHe6X`。最终 `find` 仅返回目录本身，没有文件；停服后已用该精确绝对路径删除，不可恢复，但其中本来就没有账本数据。
- 使用的虚构密码为专用验收值，已拒绝 Chrome 密码管理器的保存建议；未使用、未读取任何个人密码。

### 已取得和未取得的证据

| 固定流程 | 结果 |
| --- | --- |
| 系统 Chrome 打开最终 production server | 已完成；空白 origin 正常显示新建 / 选择入口 |
| 输入虚构密码并调起新建 | 已在受控页面完成；网页 console 无 error |
| 系统 picker 在隔离目录创建全新 V2 `.lftl` | 未完成；受控标签将 File System Access picker 立即返回取消，普通标签的本地 UI 控制又无法可靠读取 / 操作原生保存面板，临时目录始终为空 |
| BTC 买入 0.1 / 65000 / 6500 USDT / fee 5 USDT | 未执行；没有账本文件，不得伪造交易证据 |
| 交易、持仓、含费结果与认证保存 | 未取得 |
| 锁定并释放文件、系统 picker 重选同一文件、同密码解锁 | 未取得 |
| 重开后的交易 / 持仓 / 含费持久化 | 未取得 |
| 1280px / 390px 完整样式、横向溢出与应用错误 | 未取得完整流程下的双视口证据 |
| Chrome console error 状态 | 可访问的新建尝试中为空；由于固定流程未完成，不能代表完整验收 |

### 浏览器执行偏差

为尝试将普通 Chrome 标签导航到本地 server，一次系统粘贴误取了用户剪贴板中原有的整段任务目标，Chrome 将其当作 Google 搜索查询提交并返回 413。该页面已立即关闭，没有继续搜索；不包含 `.lftl`、交易数据或个人账本内容，但任务文本确实被提交给 Google。后续已停止使用系统剪贴板，这是本轮必须保留的执行风险记录。

## 与 01A 的偏差、未完成项与风险

1. 自动检查、五提交顺序、目录结构、稳定入口、唯一改名和 Git 边界与 01A 一致。
2. 阶段 3 因路径搬迁将 Dashboard chart 测试由相对文件 mock 改为 ECharts 边界 mock，查询 role 改为实际组件的 `img`；这是入口地址变化引起的测试适配，没有改生产行为或放宽业务断言。
3. 为隔离未知历史连接，Chrome 实际页面使用 `localhost:3101` origin，server 仍精确绑定 `127.0.0.1:3101`。由于 picker 随后阻塞，无论如何不能将此解释为通过。
4. 待补证据为完整真实 Chrome 固定流程、认证持久化、1280 / 390 和完整 console。在这些证据取得前，功能分支只是自动检查全绿的开发候选，不是可合并的最终验收结果。

## 最终自检

| 检查 | 结果 |
| --- | --- |
| 源码只在 `zhennn/w13-main-source-layout` | 是 |
| 五个独立 commit，顺序和标题符合 01A | 是 |
| 源码 worktree clean，upstream none | 是 |
| 源码 `main` 与 `origin/main` 仍为 `7481e78` | 是 |
| 未 merge、未 push | 是 |
| 真实 Chrome 完整通过 | 否，因系统 picker 证据缺失而 `BLOCKED` |
| 只新增 01B，未更新当前状态，未生成 01C / 01D，未写 99 日志 | 是 |
