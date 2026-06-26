# Week 7 Checklist

时间：2026-07-24 至 2026-07-30

主题：数据锁得住（AES-256-GCM 真加密）

---

## 总览

| 日期 | 任务 | 状态 |
| --- | --- | --- |
| 7月24日 | Day 1：学 Web Crypto API | 未开始 |
| 7月25日 | Day 2：实现密钥派生（PBKDF2） | 未开始 |
| 7月26日 | Day 3：实现加解密 | 未开始 |
| 7月27日 | Day 4：解锁流程 + 切换真加密 | 未开始 |
| 7月28日 | Day 5：验收加密与离线 | 未开始 |
| 7月29日 | Day 6：写日志、整理下周 | 未开始 |
| 7月30日 | Day 7：休息与轻复盘 | 未开始 |

---

## Day 1：学 Web Crypto API

- [ ] 学 subtle 的 deriveKey/encrypt/decrypt
- [ ] 弄清 salt 与 iv 的作用

## Day 2：实现密钥派生（PBKDF2）

- [ ] 口令 + 随机 salt + 迭代次数 → 256 位密钥

## Day 3：实现加解密

- [ ] AES-GCM 加密，输出打包 salt+iv+密文
- [ ] decrypt 失败抛统一“解锁失败”
- [ ] encrypt→decrypt 一字不差

## Day 4：解锁流程 + 切换真加密

- [ ] 加输入密码解锁流程
- [ ] 组装点把 Noop 换成 WebCrypto
- [ ] 确认上层一行都不用改

## Day 5：验收加密与离线

- [ ] DevTools 看到密文不是明文
- [ ] 密码对能解/错被拒/篡改失败
- [ ] 导出仍是明文逃生口
- [ ] 断网仍可用

## Day 6：写日志、整理下周

- [ ] 写加密分层日志（进论文 Implementation/Evaluation）
- [ ] 整理 Week 8 任务

## Day 7：休息与轻复盘

- [ ] 看一遍加密代码
- [ ] 记录新问题
