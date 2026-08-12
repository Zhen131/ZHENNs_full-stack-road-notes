# Week 13 main UI 重构执行与测试报告

日期：2026-08-13
源码轨道：`main` 产品账本
最终状态：**PASS**

## 结论

Week 13 `main` UI 重构已按 `02B` 的阶段顺序完成：五个工作区、同一解锁会话、首页一屏、受控记账草稿、交易筛选与 5 秒安全删除、明文备份预检与整本替换、设置危险操作、响应式和可访问性均已落地。最终源码为 9 个可独立回滚的本地 commit；72 个测试文件、785 项测试以及 typecheck、lint、production build、两类 diff check 全部通过；真实系统 Google Chrome、macOS 原生文件选择器和两份虚构 V2 `.lftl` 也完成了固定成功链。

本报告是开发执行与测试报告，不是独立第三方验收，不生成 `02D`，也不更新独立验收结论。

## Git 边界与最终状态

| 仓库 | 路径 | 分支 | 起始 HEAD | 交付 HEAD | upstream / ahead-behind | 最终工作树 |
| --- | --- | --- | --- | --- | --- | --- |
| 根文档仓库 | `/Users/zhuzhen0131/Library/Mobile Documents/iCloud~md~obsidian/Documents/全栈之路` | `main` | `ed1f5b792387d1c616e7b70d112b1060cf3ef281` | 本报告与截图的中文文档 commit；完整哈希在提交完成后的交付回复记录，因为 commit 不能在自身内容中自引用其哈希 | `origin/main`；提交前 `behind 0 / ahead 2`，交付后应为 `behind 0 / ahead 3` | 本报告与截图已提交；保留用户原有 `.obsidian/app.json` 修改和未跟踪 `02B_W13-main-UI重构执行计划.md` |
| 源码仓库 | `/Users/zhuzhen0131/Library/Mobile Documents/iCloud~md~obsidian/Documents/全栈之路/01一些进度/产出/LocalFirstTradingLedger` | `zhennn/w13-main-ui-refactor` | `1a7ecb81012594bb36b5fd22693f6fe45df844c7` | `0ad68e1d62c6ff0e84105b9afa8f48537711962e` | 无 upstream；相对本地 `main` 为 `behind 0 / ahead 9` | clean |

源码 `main` 在起点和最终复核时均为 `1a7ecb81012594bb36b5fd22693f6fe45df844c7`，并与 `origin/main` 为 `0 / 0`。没有进入或修改 `CS2026` worktree。

## 源码提交与回滚点

| 阶段 | 完整 commit | 标题 | 主要变更 | 对应验证 |
| --- | --- | --- | --- | --- |
| 1 | `3220293b02cd2eb8b5d87d6626b3f294ed8e2854` | `feat: establish ledger UI foundations` | 中文入口、8—128 Unicode 密码策略、视觉 token、图标、卡片、文件状态和反馈原语 | 阶段 1 定向 5 files / 82 tests；静态与构建门禁通过 |
| 2 | `deb5bf36e35b61fab79ea711393de870a7e3a20c` | `feat: add persistent ledger workspace navigation` | 单一 `usePersistentLedger` 根、五页导航、会话草稿、导航 intent、锁定前草稿提示 | 阶段 2 定向 5 / 109；切页与会话状态测试通过 |
| 3 | `30b18cfb6bcc979350ad5c53c43e5d6eb202f8ef` | `feat: build the ledger overview workspace` | 四摘要、趋势、分配、前三持仓、热力、最近交易与持仓详情 | 阶段 3 定向 10 / 52；golden 与空/缺价状态通过 |
| 4 | `a7ad2abea961b49b1c70b5e446f5029dc2955516` | `feat: streamline trade and price entry` | 交易/价格双栏、受控草稿、金额自动/手动、FeeRule 候选、认证保存反馈 | 阶段 4 定向 11 / 137；重复提交与保存失败语义通过 |
| 5 | `44ef28991edf1bf797a6332c22bc7c94bda444f5` | `feat: add transaction browsing and safe delayed deletion` | 横表、组合筛选、详情、两击确认、双预检、5 秒倒计时与撤回 | 阶段 5 定向 6 / 57；4999ms 零写入、5000ms 复核通过 |
| 6 | `5054b26cad40f53b79940664eb2b2caff7b59452` | `feat: reorganize import export and ledger settings` | 明文导入导出、三类设置、FeeRule、mapping、两层清空确认 | 阶段 6 定向 15 / 208；导入、文件能力与 repository 对抗测试通过 |
| 7 | `fd25c30421bc437d9d23c7aa9dcc9ff31c74323d` | `fix: complete responsive and accessible UI states` | 1280/1100/390 重排、局部横滚、焦点、键盘、非颜色反馈和 reduced-motion | 阶段 7 定向 26 / 301；全量与构建门禁通过 |
| 8A | `3be40cd7401e46998434b19c36ca0d210a66f12a` | `style: tune the ledger workspace from browser review` | 修正真实 Chrome 中 `null` 被误判为持久化错误、补 golden 回归 | 1 / 5；typecheck、lint、真实 Chrome 状态复核通过 |
| 8B | `0ad68e1d62c6ff0e84105b9afa8f48537711962e` | `fix: fit the desktop overview within one screen` | 成功提示 4 秒移除、桌面卡片密度和热力高度微调，消除 1280×800 内部滚动 | 4 / 51；typecheck、lint、diff check、production build 与像素复测通过 |

## 实际实施范围

- 入口：`LedgerAccessGate` 保留 picker、重连、恢复、generation 与密码清除链，只更新用户语言和密码长度策略。
- 外壳：新增 `LedgerWorkspaceFrame` 与 `useLedgerWorkspaceSession`；首页、记账、交易、导入与导出、设置共用一个账本实例，切页不重新 hydrate。
- 首页：新增 `HomeWorkspace`，拆分趋势、分配、热力和持仓组件；所有金额继续来自既有 portfolio、P&L、price selector 与 chart service。
- 记账：完成 `RecordWorkspace`，交易与价格草稿切页保留；认证保存后才清理字段和显示短暂成功反馈。
- 交易：完成 `TransactionsWorkspace`、`TradeTable`、`TradeDeleteControl`；筛选、详情、依赖拒绝、撤回和最终删除都有永久测试。
- 导入与设置：完成 `TransferWorkspace`、`SettingsWorkspace`；明文警告、零写预检、整本替换、mapping 在线验证、FeeRule 版本和清空授权均保留。
- 样式与反馈：统一暖白/金橙视觉、系统字体、数字排版、焦点环、禁用原因、持久错误和短暂成功状态；窄屏仅让宽表在自身容器横滚。
- 变更规模：63 个文件，6314 行新增、798 行删除；`package.json`、lockfile、`LedgerData`、V2 文件合同、加密合同、BackupEnvelope 与导入预检合同的指定 diff 均为空。

## 与 02B 的偏差

1. 阶段 8 最终形成两个小 commit，而不是单一可选视觉 commit。原因是第一次真实 Chrome 复核同时发现一个“无错误却显示需要处理”的 UI 条件错误；修复并补测试后，第二次 1280×800 像素测量又发现保存成功横幅会让首页短暂超高，因此把单屏修正独立提交，未改业务或安全合同。
2. `3be40cd...` 沿用了计划建议的 `style` 标题，但内容包含一个仅影响状态呈现的条件修正；由于任务禁止 amend/rebase，保留真实历史并在此说明。
3. 一次曾把 typecheck 与 build 并行运行，build 重建 `.next/types` 时令 typecheck 非零；按 `02B` 的顺序要求改为串行后，两者均 exit 0，未为此修改生产代码。

## 自动验证记录

### 基线

基线固定为 `1a7ecb81012594bb36b5fd22693f6fe45df844c7`。分支创建前基线通过；交付前又从该精确 commit 导出只读副本复核，排除环境漂移。

| 命令 | 目录 | 结果 |
| --- | --- | --- |
| `npm test` | 源码基线副本 | exit 0；59 files / 737 tests；0 failed、0 skipped |
| `npm run typecheck` | 同上 | exit 0 |
| `npm run lint` | 同上 | exit 0；0 warnings |
| `npm run build` | 同上 | exit 0；Next.js 15.5.22，5 个静态页面 |

### 阶段与最终门禁

各阶段提交前均运行对应定向测试，并在阶段收束时运行全量测试、typecheck、lint、build 与 `git diff --check`。交付前重新执行的最终证据如下：

| 命令 | 结果 |
| --- | --- |
| 阶段 1—7 定向组 | 依次为 5/82、5/109、10/52、11/137、6/57、15/208、26/301，全部 exit 0 |
| 两个浏览器修复定向组 | 1/5 与 4/51，全部 exit 0 |
| `npm test` | exit 0；72 files / 785 tests；0 failed、0 skipped |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0；`eslint . --max-warnings=0` |
| `npm run build` | exit 0；5 个静态页面；`/` 为 317 kB，First Load JS 420 kB |
| `git diff --check` | exit 0 |
| `git diff --check 1a7ecb81012594bb36b5fd22693f6fe45df844c7..HEAD` | exit 0 |
| `.only/.skip/debugger/console.log/debug/冲突标记` 扫描 | 无命中 |
| 用户可见旧 `C` 文案扫描 | 生产 UI 无命中；仅保留 repository 内部固定授权常量 `清空当前C账本`，不回显 |

Vitest 输出一次 `Not implemented: navigation to another Document`，来自 jsdom 下载导航能力，不是失败或跳过；真实 Chrome 的下载链另行完成。

## 真实 Chrome 与原生文件验证

| 项目 | 实际证据 |
| --- | --- |
| 浏览器 / 地址 | 系统 `/Applications/Google Chrome.app`；production `http://127.0.0.1:3101` |
| 隔离 | 独立临时 Chrome profile；唯一测试目录 `/private/tmp/lftl-w13-final.rUqblO` |
| 文件 | 原生 Save picker 创建 `w13-final-ledger.lftl` 与第二个空账本 `w13-empty-import-ledger.lftl.lftl`；原生 Open picker选择明文备份 |
| 数据 | 仅虚构 BTC/ETH/ADA：4 笔最终交易、3 笔手动价格、1 个 active FeeRule；另加 1 笔安全删除样例后删除 |
| 清理 | 两个账本最终均锁定；第二个账本清空并重开确认仍为空；Chrome、服务器与防休眠进程已停止，测试目录、独立 profile 和明文备份已删除 |

固定路径的结果：

1. 入口、新建、解锁和重连使用 8 字符以上虚构密码；两个 `.lftl` 均由 macOS 原生 Save picker 创建。第一份锁定后以同一密码重开，事实与加密保存状态持续存在。
2. 五页导航共用同一会话；记账页输入数量 `0.1` 后切到首页再返回，草稿仍在。
3. 依次保存 BTC/ETH/ADA 买入、BTC 部分卖出、实际手续费和三项价格；每次等待“交易/价格已认证保存”及“已保存到加密文件”。
4. 首页显示四摘要、趋势、分配、三项持仓、365 日热力和四笔最近交易；所有数据来自虚构事实。自动 Binance 刷新会改变截图中的当前估值，但不会改变交易事实。
5. 交易页准确日期筛选只留下 2026-08-04 一笔；详情可用 Escape 收起。删除支撑后续卖出的 BTC 买入被拒绝；安全 ADA 样例在 5 秒内撤回后仍为 5 笔，再次操作等待结束后才删除为 4 笔并认证保存。
6. 导出明文 JSON 后逐字段核对：Backup V2、app `0.1.0`、Ledger schema 2、3 assets、4 trades、3 price snapshots、1 fee rule。第二个全新空账本预检得到 0 hard errors、0 suspicious groups，SHA-256 为 `ddae1c699b65b0df931e60789e4b81bc873e48a54743b34b2a4a08676e253cbe`；确认后完整替换，锁定重开仍有 4 笔事实。
7. 设置页真实显示 BTCUSDT、ETHUSDT、ADAUSDT 三个已配置映射；BTC 同 symbol 在线复验返回“交易对未发生变化”。创建 `DemoX BTC 0.1%` active FeeRule 并保存。
8. 第二账本的空清空确认被拒绝并提示完整输入；输入“清空账本”后才执行。文件没有被删除，锁定并再次重开显示 0 交易、四摘要均为 0。

### 响应式、键盘和控制台

- `1280×800`：document 为 `1280/1280 × 800/800`；成功提示淡出后右侧内容 `clientHeight = scrollHeight = 695`，首页底部 `744.5px`，正常有数据状态一屏完成。
- `1100×800`：document `scrollWidth = clientWidth = 1100`、`scrollHeight = clientHeight = 800`，可见元素无横向溢出。
- `390×844`：五页均 `scrollWidth = clientWidth = 390`；交易表仅自身容器 `344/820` 横滚，整页不横溢，导航和操作按钮可读。
- 键盘：当前“交易”后按 Tab 焦点进入“导入与导出”，`focus-visible` 为 `3px solid`、offset `2px`；Enter 完成切页且焦点未丢到 body。
- reduced-motion：真实 Chrome `matchMedia` 命中；关键元素 transition/animation 均降为 `1e-05s`，文字、倒计时与操作语义仍在。
- production reload 捕获 0 个 application error、0 个 exception。Chrome 仅给出 password form 可选 username field 的 verbose 建议，单独记录，不冒充应用错误。

最终截图：

![[02C_W13-main-UI重构首页1280x800.png]]

## 业务与安全不变量

| 不变量 | 证据 | 结果 |
| --- | --- | --- |
| 持仓、剩余含费成本、realized / unrealized P&L 不由页面重算 | calculators / portfolio / golden 全测；浏览器固定事实 | PASS |
| `Trade.totalValue` 仍不含手续费，买卖现金影响沿用原服务 | Validator、trade service、表单与详情测试 | PASS |
| `LedgerData`、`.lftl V2`、BackupEnvelopeV2 不变 | 指定合同 diff 为空；crypto / backup / file 全测 | PASS |
| 保存成功必须经过 current/previous、write、readback 与认证 | repository 对抗测试；真实状态等待“已保存到加密文件” | PASS |
| 明文预检零写、导入只整本替换，失败不替换页面状态 | backup、file import、capability 测试；第二空账本真实导入 | PASS |
| 交易删除两次预检、5 秒前零写、撤回零变化 | fake timer 测试；真实依赖拒绝、撤回与最终删除 | PASS |
| 清空用户词与内部授权词分层，不增加删除文件能力 | Settings 测试、repository 测试、真实错误词/正确词/重开 | PASS |
| 草稿不进入 LedgerData、备份或连接记录 | session 与 export 测试；切页/锁定浏览器检查 | PASS |
| 未读取或污染个人账本 | picker 仅进入已记录 `/private/tmp`；所有事实与密码均为虚构 | PASS |

## 未完成项、风险与证据边界

- 未完成项：无 `02B` 必需项遗留。
- 没有配置 axe，因此不声称自动无障碍全覆盖；本轮证据是 Testing Library 的 role/name/focus/keyboard 断言加真实键盘检查。
- 没有新增 Playwright/Cypress 套件；真实 Chrome 结果证明本机本轮成功链，不证明进程被强杀时的所有原子恢复分支。后者继续由 repository 对抗测试覆盖。
- 截图中的 Binance 当前价格会随公开行情变化；截图只证明布局、层级和一屏结构，不作为固定金融数值或独立验收证据。
- 临时原始截图、虚构 `.lftl`、独立 profile 和明文备份在安全锁定后已删除且不可恢复；永久证据只保留本报告与最终 1280×800 虚构数据截图。

## Git 禁止项与最终判定

没有 merge、push、pull、PR、tag、upstream 设置、rebase、cherry-pick、squash、amend、reset 或分支删除；源码 `main` 未移动。根文档提交只包含本报告和实际截图，未暂存 `.obsidian/app.json` 或未跟踪的 `02B`。

判定为 **PASS**，因为阶段 0—8 的必需实现和回滚点齐全，最终自动门禁全绿，真实 Chrome、原生 picker、虚构文件、持久化、危险操作、1280/1100/390、键盘、reduced-motion 与 console 证据均已取得，且数据格式、安全模型和 Git 边界未被削弱。
