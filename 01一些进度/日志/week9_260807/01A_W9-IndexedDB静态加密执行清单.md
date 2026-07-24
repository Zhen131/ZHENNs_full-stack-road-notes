# 01A_W9：IndexedDB 静态加密执行清单

时间：2026-08-07 至 2026-08-13
状态：实现已形成源码提交 `aca6c53`，收口进行中
源码基线：`LocalFirstTradingLedger/main@45e10dc`
目标：使用 Web Crypto API、PBKDF2-HMAC-SHA-256 与 AES-256-GCM，使 IndexedDB 中的完整 `LedgerData` 只以认证密文保存。
追踪规则：本文件的复选框保留为原始执行合同，不作为当前完成状态；实际证据与未关闭项统一以 `01B_W9-IndexedDB静态加密执行验收记录.md` 的 Gate 状态矩阵为准。

---

## 结论

Week 9 只实现 IndexedDB encryption at rest：

```text
首次打开 -> 设置密码 -> 生成 salt -> 派生会话 CryptoKey -> 写入密文账本
再次打开 -> 读取非敏感加密元数据 -> 输入密码 -> 派生 CryptoKey -> 解密并 hydrate
账本变更 -> 既有保存队列 -> 新随机 IV -> AES-GCM 密文 -> IndexedDB
关闭或刷新 -> CryptoKey 随页面会话消失 -> 再次输入密码
```

不迁移 Week 7/8 的本地明文测试数据；执行前人工清空开发 origin 的旧 `ledger:v1` 测试记录。不得把测试 fixture、golden 五笔交易或验收期间生成的数据视为用户数据。

本文件记录 2026-07-24 已确认的新边界；与 `00-Week9每日执行清单.md`、`00-Week9-Checklist.md` 中的“旧明文迁移”或“手动锁定”要求冲突时，以本文件为准。

---

## 执行入口与仓库边界

执行 AI 先读取：

1. 本文件。
2. `01一些进度/日志/00-当前开发状态.md`。
3. 源码 `README.md`。
4. 源码 `src/app/page.tsx`、`src/components/dashboard/DashboardShell.tsx`、`src/hooks/usePersistentLedger.ts`。
5. 源码 `src/encryption/`、`src/repositories/`、`src/adapters/`、`src/composition/` 及对应测试。

仓库固定：

- 文档仓库：`/Users/zhuzhen0131/Documents/NOTe/全栈之路`。
- 源码仓库：`/Users/zhuzhen0131/Documents/NOTe/全栈之路/01一些进度/产出/LocalFirstTradingLedger`。
- Week 9 代码、测试和源码 README 只属于源码仓库；本文件与验收日志只属于文档仓库。
- 两个仓库分别检查 `status / branch / diff`，不得混合提交。
- 源码开始点预期为 `main@45e10dc`。若实际 HEAD 已前进，先核对新增提交，不得 reset、checkout 覆盖或强行回退。

---

## 已锁定产品边界

| 项目 | 决策 |
| --- | --- |
| 保护对象 | IndexedDB 中静态保存的完整 `LedgerData` |
| 不保护 | 已解锁页面、运行时内存、XSS、恶意扩展、系统级恶意软件、屏幕内容 |
| 启动状态 | 仅 `setup-required`、`unlock-required`、`unlocked`；允许内部 `checking/error` 过渡态 |
| 旧明文数据 | 不迁移；Week 9 开始前清空本地开发测试记录 |
| 手动锁定 | 不实现锁定按钮；关闭或刷新页面即结束本次解锁会话 |
| 自动保存 | 保留既有串行保存、失败重试、dirty、clear、import 互斥规则 |
| 导出文件 | `BackupEnvelopeV1` 继续是明文 JSON，继续显示明文风险提示 |
| 导入文件 | 解锁后导入；校验通过后由当前会话密钥加密写入 IndexedDB |
| 密码找回 | 不实现；忘记密码时只能清空本地密文或使用用户自行保存的明文备份 |
| 忘记密码后的重置 | 解锁页提供“清空本地加密账本并重新开始”；必须二次确认，成功后进入 `setup-required` |
| 密码变更 | Week 9 不实现 |
| 加密依赖 | 使用浏览器原生 Web Crypto；不新增第三方密码学库 |

---

## 密码学契约

### 固定参数

| 参数 | 固定值 |
| --- | --- |
| KDF | PBKDF2 |
| PBKDF2 hash | SHA-256 |
| iterations | `600_000` |
| salt | 首次设密生成 16 随机字节；同一账本后续保存复用 |
| 密钥 | AES-GCM 256 bit，`extractable: false`，usage 仅 `encrypt/decrypt` |
| IV | 每次 `encrypt` 生成新的 12 随机字节；同一密钥下不得复用 |
| authentication tag | 128 bit |
| 字符编码 | `TextEncoder` / `TextDecoder`，UTF-8 |
| 二进制字段编码 | 无填充 Base64URL；解码时执行长度与规范格式校验 |
| 随机源 | `globalThis.crypto.getRandomValues` |

salt、IV、KDF 参数不是秘密，可以进入 IndexedDB；passphrase、派生 `CryptoKey` 和账本明文不得进入持久化存储、URL、日志或错误文本。

### 密文 envelope

目标存储结构：

```ts
type StoredLedgerEnvelopeV2 = {
  formatVersion: 2;
  cryptoVersion: 1;
  ledgerSchemaVersion: 1;
  kdf: {
    name: "PBKDF2";
    hash: "SHA-256";
    iterations: 600000;
    saltBase64Url: string;
  };
  cipher: {
    name: "AES-GCM";
    keyLength: 256;
    ivBase64Url: string;
    tagLength: 128;
  };
  ciphertextBase64Url: string;
};
```

规则：

- 类型名使用 `V2`，因为 storage `formatVersion` 是 `2`；`cryptoVersion: 1` 只表示第一版密码学参数，不得把两者混写。
- IndexedDB 的 `databaseName = "local-first-trading-ledger"`、`databaseVersion = 1`、`storeName = "ledger"`、`recordKey = "ledger:v1"` 全部保持不变；`recordKey` 是稳定逻辑槽位，不代表 envelope 格式版本。
- `formatVersion: 2` 与 Week 7/8 明文 envelope 明确分离。运行时发现 `formatVersion: 1` 时返回 `LEDGER_ACCESS_UNSUPPORTED_FORMAT`，不得当成空库、不得自动覆盖、不得自动迁移。
- runtime validator 必须要求每层对象只有规定字段，并拒绝缺字段、多余字段、错误常量、非法 Base64URL、错误 salt/IV 长度、未知版本和非对象输入。
- Base64URL 必须无 `=` padding；解码后再编码必须与输入完全相同。salt 固定 16 bytes、IV 固定 12 bytes、ciphertext 至少 16 bytes。
- 大 payload 编码不得使用 `String.fromCharCode(...bytes)` 或其他无界参数展开；使用分块转换，并以接近 8 MiB 的合法账本覆盖堆栈安全。
- salt 在首次设密时生成；普通保存不得更换 salt。
- unlock 必须使用 envelope 中已校验的 salt 与固定 KDF 参数派生 key；不得在解锁时生成新 salt。
- PBKDF2 每个 setup/unlock 会话只执行一次；普通自动保存复用当前非导出 `CryptoKey`，不得每次 save 重新跑 600,000 iterations。
- IV 在每次保存时重新生成；不得固定、递增或从时间戳生成。
- Web Crypto 返回的 ciphertext 已包含 authentication tag，不再手工拼接 tag。
- 已通过 envelope validator 后的错密码与认证解密失败统一映射为 `LEDGER_UNLOCK_FAILED`；结构非法的 V2 record 使用 `LEDGER_ACCESS_INVALID_ENVELOPE`。

### AAD 字节契约

encrypt 必须先生成 IV，再按下列顺序创建新对象，最后执行 `TextEncoder().encode(JSON.stringify(aadObject))`：

```ts
type CryptoAadV1 = {
  formatVersion: 2;
  cryptoVersion: 1;
  ledgerSchemaVersion: 1;
  kdf: {
    name: "PBKDF2";
    hash: "SHA-256";
    iterations: 600000;
    saltBase64Url: string;
  };
  cipher: {
    name: "AES-GCM";
    keyLength: 256;
    ivBase64Url: string;
    tagLength: 128;
  };
};
```

- AAD 不包含 `ciphertextBase64Url`。
- 不对任意输入对象直接 `JSON.stringify`；必须由 `createCryptoAadV1(...)` 按上述字段顺序重建对象。
- decrypt 从已通过 runtime validator 的 envelope 重建同一 AAD。
- 测试必须固定一组 metadata，断言 AAD UTF-8 字节稳定；修改任一 metadata 字段必须导致 validator 拒绝或认证解密失败。

### Passphrase

- 首次设置必须输入两次且完全一致。
- 接受 12 至 128 个 Unicode code point；长度使用 `[...passphrase].length`，不得使用 UTF-16 `string.length`。
- 不执行 `trim()`、大小写转换或 Unicode 自动规范化。
- 派生完成后清空 React 输入 state；不得声称 JavaScript 可以可靠擦除历史字符串内存。
- 不保存 passphrase，不保存可导出的原始密钥，不提供提示问题或恢复码。

### 访问层错误语义

| 错误码 | 触发条件 | UI 与写入规则 |
| --- | --- | --- |
| `LEDGER_ACCESS_READ_FAILED` | IndexedDB 打开或读取失败 | 显示读取失败与重试；不得显示 setup，不得写入 |
| `LEDGER_ACCESS_UNSUPPORTED_FORMAT` | 存在旧 `formatVersion: 1` 或未知版本 | 显示不支持的本地格式；只允许明确清空，不得自动覆盖 |
| `LEDGER_ACCESS_INVALID_ENVELOPE` | record 声称 `formatVersion: 2`，但字段、常量或编码校验失败 | 显示本地加密数据损坏；只允许明确清空，不得要求输入密码后继续 |
| `LEDGER_SETUP_FAILED` | 首次加密初始账本写入或回读失败 | 留在 setup；不得挂载 Dashboard |
| `LEDGER_UNLOCK_FAILED` | 密码错误、metadata/ciphertext 篡改或认证解密失败 | 使用同一提示；不得挂载 Dashboard、不得写入 |
| `LEDGER_ACCESS_RESET_FAILED` | 未解锁重置时 adapter clear 失败 | 保留原 record 与当前页面状态 |

Repository 既有 `READ_FAILED / WRITE_FAILED / CLEAR_FAILED / INVALID_*` 保留；访问层只做稳定映射，不向 UI 暴露 `DOMException`、堆栈或密码学细节。

---

## 目标模块边界

### `src/encryption/`

新增或重构：

- 密文 envelope 类型、runtime validator、AAD 规范化函数。
- Base64URL 与 `Uint8Array` 严格转换工具。
- PBKDF2 `deriveKey`。
- AES-GCM `encrypt/decrypt`。
- 结构化错误码；底层 `DOMException` 不直接进入 UI。

禁止：

- 访问 React、IndexedDB、Repository、业务 Validator。
- 使用 `Math.random()`、固定 salt、固定 IV。
- 自行实现 AES、PBKDF2、padding 或 authentication tag。

### `src/adapters/`

- `StorageAdapter.read(): Promise<unknown | null>`，因为 IndexedDB 是不可信输入；`write(...)` 只接受 `StoredLedgerEnvelopeV2`。
- `IndexedDbStorageAdapter` 继续只负责单记录事务，不派生密钥、不解析 `LedgerData`。
- Adapter 不在读取时强制 cast 成 V2；AccessController 与 Repository 必须分别运行同一个 envelope runtime validator。
- 保留写事务失败时旧成功记录不变的契约。
- 不为旧明文 envelope 增加迁移逻辑。

### `src/repositories/`

- `save` 顺序固定为：`validateLedgerData -> JSON.stringify -> encrypt -> envelope validate -> adapter.write`。
- `load` 顺序固定为：`adapter.read -> envelope validate -> decrypt -> JSON.parse -> validateLedgerData`。
- 解密、JSON parse 或账本校验失败时不得 dispatch、不得自动保存、不得覆盖原 record。
- `EncryptionService` 最小契约固定为 `encrypt(plaintext): Promise<StoredLedgerEnvelopeV2>` 与 `decrypt(envelope: StoredLedgerEnvelopeV2): Promise<string>`；不得继续把整份密文 envelope 塞回名为 `encryptedPayload` 的字符串。
- Repository 只接收已经绑定非导出 `CryptoKey` 与固定 salt 的会话级 `EncryptionService`；不得持有 passphrase。

### `src/composition/`

建立唯一加密会话组装入口：

```text
inspect storage
-> no record: setup-required
-> encrypted record: unlock-required
-> derive non-extractable CryptoKey
-> construct WebCrypto EncryptionService
-> construct LedgerRepository
-> mount DashboardShell
```

- 新增访问控制器，最小契约为 `inspect()`、`setup(passphrase)`、`unlock(passphrase)`、`resetEncryptedLedger()`；UI 不直接调用 Adapter。
- `inspect()` 必须严格区分 `null`、合法 V2 密文、旧/未知格式、损坏的 V2 envelope、读取失败；除 `null` 外均不得返回 `setup-required`。
- `setup()` 立即 `repository.save(createInitialLedgerData())`，随后 `repository.load()` 回读校验；两步成功后才返回 Repository。
- `unlock()` 只派生一次 PBKDF2 key，构造 Repository 后调用一次 `repository.load()` 验证，再返回同一 Repository。
- Dashboard 挂载后 `usePersistentLedger` 允许使用同一 Repository 再 load 一次；这是 Week 9 接受的重复解密，不重复 PBKDF2。不得为消除这一次 load 重写 Hook hydration API。
- setup/unlock 成功后只让返回的 Repository/EncryptionService 持有 `CryptoKey` 与非敏感 salt；Access UI 立即清空 passphrase state，不把 passphrase 传给 Dashboard 或 Hook。
- `resetEncryptedLedger()` 只删除当前固定 record；失败不得把 UI 切到 setup。
- Noop EncryptionService 不得进入 production 组装点；仅允许保留给 Repository/Hook 隔离测试。

### UI / hooks

- `src/app/page.tsx` 改为渲染最小访问 Gate，由 Gate 在成功后渲染 `DashboardShell repository={repository}`。
- `DashboardShell.repository` 改为必传；删除 `getDefaultLedgerRepository()` 默认值与 production Noop singleton，防止任何无密码入口绕过 Gate。
- 无 repository 时 TypeScript 必须报错；既有静态渲染测试显式注入 memory repository，不得通过保留 Noop 默认入口维持测试。
- 在 `DashboardShell` 外增加最小访问 Gate；未解锁时不得挂载 `usePersistentLedger`。
- 首次设置页只包含密码、确认密码、提交状态和错误。
- 解锁页包含密码、提交状态、统一失败提示和“清空本地加密账本并重新开始”入口。
- 未解锁重置必须输入固定确认文本 `清空本地加密账本`；成功后进入 `setup-required`，失败保留原密文。
- 防止重复提交；派生或解锁期间按钮与输入禁用。
- 不实现手动锁定按钮、找回密码、密码提示、强度动画或设置页美化。
- 既有 `usePersistentLedger` 的 mutation version、write queue、retry、dirty、clear、import 与 Repository generation 保护必须保留。

### Backup

- 不修改 `BackupEnvelopeV1` 格式与规范化序列化。
- 导出继续读取已解锁的内存账本并生成明文文件。
- 保留“备份为明文”的提示。
- 未解锁时不显示 Dashboard，也不能导出或导入。
- 导入成功必须经过当前加密 Repository；IndexedDB 中只出现密文 envelope。

---

## 执行顺序

## Day 1：冻结类型、状态机与测试基线

唯一主任务：建立不可变加密契约，不接 UI。

执行：

- 分别检查文档仓库与源码仓库状态；确认源码基线，不得因 HEAD 漂移而强制回退。
- 需要分支时只在源码仓库使用 `zhennn/week9-encryption-at-rest`。
- 在用户已确认无真实数据的本地开发 origin 中，只删除 database `local-first-trading-ledger` / store `ledger` / key `ledger:v1`；不得删除整个浏览器 profile、其他 origin、整个 IndexedDB store 或其他数据库。
- 清理前读取一次目标 record，确认它是 Week 7/8 测试数据；不编写自动迁移或自动清理 production 数据的代码。
- 建立 envelope 类型、严格 validator、错误码、Base64URL 工具。
- 建立访问状态机类型：`checking/setup-required/unlock-required/unlocked/error`。
- 先写 envelope 与编码测试，再写实现。
- 记录基线 `23 files / 239 tests`；不得删除、跳过或弱化既有测试。

Day 1 Gate：

- [ ] `formatVersion: 2` 与全部密码学常量已写死
- [ ] database/store/record key 明确保持现值，旧明文目标 record 已精确清理
- [ ] 非法 envelope 与非法二进制长度全部拒绝
- [ ] 未修改业务模型、Calculator、Service、Reducer
- [ ] 定向测试与全量测试通过

## Day 2：实现 PBKDF2 与 AES-256-GCM

唯一主任务：完成无存储、无 React 的纯密码学层。

执行：

- 实现 passphrase -> PBKDF2 base key -> AES-GCM `CryptoKey`。
- 保证 `extractable: false`。
- 实现每次随机 IV 的 encrypt 与认证 decrypt。
- 实现固定 AAD 生成器。
- 统一封装 Web Crypto 错误，禁止向上泄露底层细节。
- production 使用真实 `globalThis.crypto.subtle/getRandomValues`；测试可注入随机字节源以固定 salt/IV，但不得用假算法替代 Web Crypto。

必须测试：

- [ ] 同 passphrase + 同 salt 派生的 key 可互相解密
- [ ] 不同 salt 或错误 passphrase 解密失败
- [ ] 同一明文连续加密的 IV 与 ciphertext 不同
- [ ] ciphertext、IV、salt、iterations、AAD 任一篡改均失败
- [ ] 固定 metadata 的 AAD UTF-8 字节输出稳定
- [ ] Unicode 账本逐字节 round-trip
- [ ] 空明文与接近 8 MiB 明文边界不截断
- [ ] `CryptoKey.extractable === false`
- [ ] 同一解锁会话连续 encrypt 不重复调用 PBKDF2

## Day 3：接入 Adapter 与 Repository

唯一主任务：让整账 load/save 只接受密文 envelope。

执行：

- 更新 `StorageAdapter` 与 IndexedDB 类型边界。
- 更新 `EncryptionService` 契约与 `DefaultLedgerRepository`。
- 保持 IndexedDB database version、store 与 record key 不变；不得新建 `ledger:v2` 后遗留 `ledger:v1` 明文。
- 保存前继续运行完整 `LedgerData` Validator。
- 解密后继续执行 JSON parse 与完整 `LedgerData` Validator；ResourcePolicy 保持在现有 Hook 边界。
- 保留 write transaction、空库 `null`、读取失败、写入失败和 clear 错误语义。

必须测试：

- [ ] 合法 `LedgerData` 保存后 adapter 中不存在账本 JSON 明文
- [ ] save -> load 完整相等
- [ ] 写失败保留上一份成功密文
- [ ] 错 key、篡改或未知版本 load 失败且零写入
- [ ] 无效 `LedgerData` 在加密前拒绝
- [ ] 空库不调用 decrypt
- [ ] Repository 不接触 passphrase
- [ ] `formatVersion: 1` 不得伪装成空库或触发新账本覆盖

## Day 4：首次设密与再次解锁

唯一主任务：实现两条启动路径并替换 production Noop 组装。

首次设密：

```text
read === null
-> setup-required
-> 校验两次 passphrase
-> 生成 salt
-> deriveKey
-> 保存加密初始账本
-> 回读、解密、完整校验成功
-> mount DashboardShell
```

再次解锁：

```text
read encrypted envelope
-> unlock-required
-> 输入 passphrase
-> deriveKey
-> decrypt + validate
-> 成功后 mount DashboardShell
```

忘记密码后重置：

```text
unlock-required / unsupported-format
-> 点击清空重来
-> 输入 清空本地加密账本
-> accessController.resetEncryptedLedger()
-> clear 成功
-> setup-required
```

必须测试：

- [ ] 空库只进入首次设密
- [ ] 首次设密写失败时不进入 Dashboard
- [ ] 已有密文只进入解锁
- [ ] 正确密码进入 Dashboard 并 hydrate
- [ ] 错密码和篡改显示同一错误，且不挂载持久化 Hook
- [ ] 旧/未知格式与损坏 V2 envelope 不进入 setup、不自动覆盖，只允许明确重置
- [ ] 未解锁重置确认错误时零删除；clear 失败保留原 record；成功后进入 setup
- [ ] 重复提交只执行一次派生/解锁
- [ ] passphrase 不进入 URL、storage、error、console
- [ ] refresh 后必须重新输入密码
- [ ] `page.tsx -> AccessGate -> DashboardShell(required repository)` 是唯一 production 入口
- [ ] production composition、Dashboard 默认参数和 singleton 均不能实例化 Noop

## Day 5：保存队列、clear 与明文备份回归

唯一主任务：证明 Week 7/8 可靠性契约在加密后仍成立。

执行：

- 解锁后新增交易、价格、删除、retry 继续走原写队列。
- 快速连续 mutation 仍按版本串行保存，每次使用新 IV。
- clear 删除密文 record；当前页面保持既有初始账本语义。
- Dashboard 内既有 clear 与解锁页“忘记密码后重置”是两个入口：前者走 `usePersistentLedger` 写队列，后者只在 Dashboard 未挂载时走 AccessController；不得共用错误状态或并发执行。
- clear 后若无新 mutation 就关闭页面，下次启动进入 `setup-required`。
- clear 后发生新 mutation，使用当前会话 key/salt 重新建立密文 record。
- 明文备份导入成功后通过当前 Repository 写为密文。
- 导入失败、save 失败、卸载、Repository 切换和旧异步结果不得改变当前账本。

必须测试：

- [ ] 快速连续保存无回退、无 IV 复用
- [ ] 快速连续保存复用会话 CryptoKey，不重复执行 PBKDF2
- [ ] 最新保存失败可重试
- [ ] clear 与 pending save 顺序正确
- [ ] clear 后不会自动重建 record
- [ ] 未解锁重置不依赖 `usePersistentLedger`，且只删除固定 record
- [ ] 明文导出内容与 Week 8 契约一致
- [ ] 明文导入后 IndexedDB 为密文
- [ ] 坏备份、错密码、篡改均零覆盖
- [ ] 既有 Dashboard golden 与 interaction 测试全部通过

## Day 6：安全、production 与硬离线 Gate

唯一主任务：生成可复验的 Week 9 Go / No-Go 证据。

自动化：

```bash
npm test
npm run lint
npm run build
git diff --check
```

production 固定流程：

1. 精确读取并删除 database `local-first-trading-ledger` / store `ledger` / key `ledger:v1` 的旧测试 record；不得清空其他存储。
2. 首次设置测试密码，确认数据库立即出现密文初始账本。
3. 新增 BTC、ETH 交易与 BTC 价格，等待“已保存到本地”。
4. DevTools 直读 record，确认只有版本、KDF、salt、IV、ciphertext 等非敏感字段。
5. 在原始 record 文本中搜索资产名、交易、备注、`schemaVersion`、`trades`、`priceSnapshots`，不得命中账本明文。
6. 刷新页面，确认必须重新输入密码；正确密码恢复完整账本。
7. 输入错误密码，确认拒绝、零写入、原密文未变化。
8. 分别篡改 ciphertext 与 IV，确认拒绝、零写入。
9. 恢复合法密文，导出明文备份；clear；导入；确认新 record 为密文；刷新并正确解锁。
10. 在解锁页执行一次错误确认文本，验证 record 不变；再执行一次成功重置，验证进入 `setup-required`。clear 故障注入只在自动化测试完成，不在 production 临时改代码或注入假 Adapter。
11. 重新设置密码并导入第 9 步的明文备份，确认恢复后 record 仍为密文。
12. 保持本地 production server 可访问，断开外部互联网，在本地 production origin 完成打开、解锁、新增、查询和导出；不得请求外部 API。不要使用会同时阻断 localhost 的测试方式冒充产品失败。
13. 记录参考设备上的首次设密与再次解锁耗时；这只是 Week 11 benchmark 环境素材。若明显不可用，报告数据，不得擅自降低 600,000 iterations。
14. 检查控制台无 warning/error，页面无未处理 Promise rejection。

Day 6 Gate：

- [ ] IndexedDB 无完整账本明文
- [ ] 正确密码可恢复，错误密码与篡改被拒
- [ ] 旧/未知格式不覆盖；忘记密码后的明确重置可成功且失败安全
- [ ] 会话 key 与 passphrase 未持久化
- [ ] 自动保存、retry、clear、import 未回归
- [ ] 明文备份风险提示仍存在
- [ ] 硬离线主链通过
- [ ] test、lint、build、diff-check 全绿

任一项失败：Week 9 为 No-Go，不进入 Week 10 图表。

## Day 7：休息

- [ ] 不开发
- [ ] 不补测试
- [ ] 不挪用

---

## 禁止修改范围

- 不修改 `LedgerData`、Trade、Asset、PriceSnapshot、Position 业务 schema。
- 不修改 DCA、持仓、盈亏、Validator 或交易时间线口径。
- 不把 `Position[]` 写入密文账本。
- 不迁移旧明文测试数据。
- 不增加手动锁定、密码修改、密码找回、云密钥、服务器认证或多设备同步。
- 允许“忘记密码后明确清空本地密文并重新开始”；它是破坏性重置，不是密码找回。
- 不加密 `BackupEnvelopeV1`。
- 不使用 localStorage/sessionStorage 保存 passphrase、key 或账本明文。
- 不增加第三方密码学依赖。
- 不执行 `npm audit fix --force` 或无关依赖升级。
- 不做 Week 10 图表、Week 11 benchmark、UI 美化或分页。

---

## 最终交付物

- 密文 envelope 与 runtime validator。
- Base64URL、PBKDF2、AES-256-GCM 实现及测试。
- 仅在解锁后可用的加密 Repository。
- 首次设密、再次解锁与忘记密码后明确重置 Gate。
- 加密后的自动保存、clear、明文 backup/import 回归证据。
- production IndexedDB 密文直读、错密码、篡改与硬离线证据。
- Week 9 Go / No-Go 记录。

---

## Agent 收尾规则

- 源码事实优先于计划文本；发现现有实现与本清单冲突时先报告，不得静默扩 scope。
- 若 envelope、record key、AAD、AccessController、required repository 或错误语义仍存在两种合理解释，Day 1 不得写后续实现；先按本文件收敛成单一契约。
- 每个 Day 只关闭自己的 Gate；未通过不得提前进入下一 Day。
- 不用 README、类型声明、fixture 或测试名称代替 production 证据。
- 不得为了保留旧测试调用方式而保留 production Noop 默认入口；应修改测试工厂显式注入 memory/noop repository。
- 测试辅助代码可使用 Noop；production import graph 中出现 Noop 即为 P0。
- 未经用户授权，不提交、不推送、不合并、不删除分支。
- 只有 test、lint、build、diff-check 与 production Gate 全部通过，才可声明 Week 9 完成。

参数依据：OWASP Password Storage Cheat Sheet 的 PBKDF2-HMAC-SHA-256 基线；W3C Web Cryptography API；NIST SP 800-38D 的 AES-GCM 96-bit IV 建议。
