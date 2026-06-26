# Week 7 每日执行清单

时间：2026-07-24 至 2026-07-30  
主题：数据锁得住（AES-256-GCM 真加密）

> 把 Noop 换成真加密：AES-256-GCM + PBKDF2 口令派生，打开账本要输密码，本地存的是密文。验证"换加密只改组装点一行、上层零改动"。**这是核心里最难的一周**，前面留了余量、后面有 Week 12–12 缓冲带。
> 起点：Week1 加密路线（见 week1 文件夹《05C_W1-加密路线说明》）已把算法、密钥派生、错误处理、忘记密码兜底全部设计好，本周照着实现 WebCryptoEncryptionService。

---

## Day 1：7月24日，学 Web Crypto API

今天只做一件事：搞懂浏览器原生加密怎么用。

要做：

- 学 `crypto.subtle` 的 importKey / deriveKey(PBKDF2) / encrypt / decrypt(AES-GCM)
- 弄清 salt 与 iv 的作用

产出：

- Web Crypto 学习笔记

完成标准：

- 能说清密钥怎么从密码派生、为什么要 salt 和 iv

---

## Day 2：7月25日，实现密钥派生（PBKDF2）

今天只做一件事：把用户密码熬成一把密钥。

要做：

- 实现 PBKDF2：口令 + 随机 salt + 迭代次数 → 256 位密钥

产出：

- 密钥派生函数

完成标准：

- 同样密码 + 同样 salt 能稳定派生出同一把密钥

---

## Day 3：7月26日，实现加解密

今天只做一件事：写 encrypt / decrypt 并保证往返一致。

要做：

- encrypt：AES-256-GCM 加密，输出打包 `salt + iv + 密文`
- decrypt：拆包重派生密钥；密码错 / 数据被改 → 抛统一"解锁失败"

产出：

- WebCryptoEncryptionService

完成标准：

- encrypt 后再 decrypt 一字不差拿回原文

---

## Day 4：7月27日，解锁流程 + 切换真加密

今天只做一件事：接上输入密码解锁，并在组装点换掉 Noop。

要做：

- 加"输入密码解锁"流程
- 组装点把 Noop 换成 WebCryptoEncryptionService
- 确认页面 / service / repository / adapter 一行都不用改

产出：

- 解锁流程 + 接上真加密的应用

完成标准：

- 换加密只改了组装点一行，上层零改动

---

## Day 5：7月28日，验收加密与离线

今天只做一件事：确认数据真的被锁住、且离线可用。

要做：

- DevTools 里看到 IndexedDB 存的是密文不是明文
- 密码对能解、错会提示；改坏密文解密失败
- 导出仍是明文逃生口可用
- DevTools 切 offline，账本仍能用

产出：

- 加密 + 离线验收记录

完成标准：

- 本地为密文；正确密码可解、错误被拒；篡改失败；断网仍可用

---

## Day 6：7月29日，写日志、整理下周

今天只做一件事：沉淀安全设计素材。

要做：

- 写日志：加密分层（只有最底一道门碰加密）、GCM 防篡改、密钥不落盘、错误统一化
- 整理 Week 8 任务

产出：

- Week 7 日志（进论文 Implementation 安全部分 + Evaluation 的"security by default"理想）

完成标准：

- 能讲清加密放在哪一层、为什么忘记密码只能靠明文备份

---

## Day 7：7月30日，休息与轻复盘

今天不做重开发。

允许做：

- 看一遍加密代码
- 记录新问题

不做：

- 不开新功能
- 不临时改 Week 8 目标

---

## 本周产出物

- webCryptoEncryptionService、解锁流程、加密后的可用应用、离线可用记录

## 验收标准

- 本地存储为密文；正确密码可解锁、错误密码被拒
- 篡改数据解密失败；导出明文备份仍可恢复；断网仍可用

## 论文素材点

- 加密方案与密钥派生设计、往返完整性（byte-for-byte）、离线能力证据
- 对照 7 条 local-first 理想中的 security & privacy by default / the long now / optional network → 论文 Implementation / Evaluation

## 落后时可砍

- 若 Web Crypto 卡死，可先交"明文 IndexedDB + 完整加密设计文档"保住演示与论文骨架，实现挪到缓冲带前补
- 但加密是论文标题词，尽量不砍
