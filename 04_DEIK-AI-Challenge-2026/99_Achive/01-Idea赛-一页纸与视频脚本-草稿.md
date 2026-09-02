# DEIK.AI Challenge 2026 — AI Idea Competition
提交截止：2026-09-04 ｜ 交付物：一页 A4（12号字、单倍行距）+ 3 分钟视频

---

## 一、英文一页纸（草稿 v1）

**Ledger Agent — A Fully Local AI Assistant for Personal Financial Records**

Zhu Zhen · Faculty of Informatics, University of Debrecen
Relevant themes: data protection and locally deployable AI systems; natural-language applications

**The problem.** Personal financial records are among the most sensitive data an individual holds, yet every mainstream AI-assisted bookkeeping or portfolio-review tool requires uploading them to a vendor's cloud. Users are pushed into a choice they should not have to make: give up the convenience of AI, or hand over their most sensitive data to a third party. At the same time, manual bookkeeping has a high abandonment rate — a single trade takes eight structured fields — and the records that do survive are rarely reviewed, because answering a question as ordinary as *"how many times did I buy into a rally this year?"* means reading the ledger by hand.

**The idea.** Ledger Agent is an AI assistant that runs entirely on the user's own machine, on top of an encrypted ledger file that never leaves their disk. It does three things:

1. **Natural-language bookkeeping.** *"Bought 0.5 ETH on Binance yesterday at 2,400, fee 0.001 ETH"* becomes a structured draft transaction, which the user confirms field by field before anything is written.
2. **Natural-language review.** Questions about the portfolio are answered from the ledger's own recorded facts, with the derivation shown — never from the model's memory.
3. **Behavioural review.** By combining trades with the reasons and emotions the user recorded at the time, the agent surfaces recurring patterns — chasing rallies, panic selling, over-trading — that a static chart cannot express.

**What makes it different: the model is never allowed to write.** The design constraint that defines this project is that the language model has **no write access**. It reaches the ledger only through a narrow set of read-only tools and a single *propose-a-draft* tool. Three rules are absolute: the model never sees the encryption key or the ciphertext; nothing is persisted without an explicit human confirmation; and when a request is ambiguous or parsing fails, the entire batch is rejected with zero writes rather than guessed. In financial records the cost of a hallucination is not an awkward sentence — it is a corrupted history that the user may not notice for months. Treating the model as an untrusted proposer behind a human gate, instead of as an agent holding database credentials, is the contribution this project is built to demonstrate.

**Why this can actually be built.** The ledger the agent sits on is not a sketch. It is an existing alpha application in continuous development since June 2026:

- TypeScript and Next.js 15, running fully offline, with no server component of any kind;
- all data held in a single encrypted file on the user's own disk (AES-256-GCM; PBKDF2-SHA256 with 600,000 iterations, above the current OWASP recommendation), with the key existing only in session memory;
- 106 test files and 1,185 automated tests, with typecheck, lint and a production build as release gates;
- in real daily use by the author, and benchmarked on synthetic ledgers from 10² to 10⁵ transactions.

The AI layer is deliberately the part that has not been built yet. That is what this proposal is for.

**Wider relevance.** The pattern — a local model, an encrypted local store of facts, and a mandatory human confirmation gate between them — generalises directly to medical notes, legal case files and student records: any domain where the data must not go to the cloud, but the user still wants an assistant.

**If selected.** The first milestone is a locally hosted quantised model served through Ollama, the tool-call boundary that isolates it from storage, and the confirmation interface. The evaluation measures parsing accuracy, and — more importantly — the share of incorrect proposals that are actually caught at the gate.

---

## 二、3 分钟视频脚本（草稿 v1）

**0:00–0:20 ｜ 开场：问题**
画面：一个云图标 + 一份交易记录被上传的示意，或直接对着摄像头说。
旁白：Every AI bookkeeping tool today asks you to upload your financial records to someone else's server. I didn't want to make that trade. So I built the ledger first — and now I want to put the AI inside it, not outside it.

**0:20–0:45 ｜ 已经存在的东西（建立可信度）**
画面：录屏 —— 打开 .lftl 文件、输密码解锁、首页四项摘要 + 持仓表 + 热力图。
旁白：This is a working local-first trading ledger I've been building since June. No server, no account. Everything lives in one encrypted file on my own disk.

**0:45–1:45 ｜ 核心构想（三件事）**
画面：三段动画或手绘示意，逐条出现。
旁白：
- Ledger Agent adds a local AI layer on top. First, I type a sentence — "bought half an ETH yesterday at 2400" — and it becomes a draft transaction.
- Second, I can ask the ledger questions in plain language, and get answers derived from my own recorded facts.
- Third, it reviews my behaviour — where I chased a rally, where I sold in panic — using the reasons I wrote down at the time.

**1:45–2:30 ｜ 最关键的设计（差异化）**
画面：一张图 —— LLM 在左，账本在右，中间一道闸门写着 "human confirmation"。
旁白：Here is the part that matters. The model can never write. It only reads, and it only proposes. Nothing is saved until I confirm it field by field. If the request is ambiguous, it writes nothing at all. In financial records, a hallucination isn't a bad sentence — it's a corrupted history. So the model is treated as an untrusted proposer, not as an agent with database credentials.

**2:30–2:50 ｜ 为什么做得出来**
画面：终端跑测试的录屏（1,185 tests passing）+ 加密参数一行字。
旁白：The foundation is already real: eleven hundred automated tests, AES-256-GCM at rest, benchmarked up to a hundred thousand transactions. The AI layer is the next step — and it's the step I'm proposing here.

**2:50–3:00 ｜ 收尾**
旁白：Private data deserves an assistant too. Thank you.

---

## 三、待办

- [ ] 发邮件到 challenge@inf.unideb.hu 问作品提交入口在哪（公告只给了可选的意向登记表）
- [ ] 一页纸定稿 → 导出 PDF（12号字、单倍行距、确认真的只有一页）
- [ ] 录屏素材：解锁 → 首页 → 交易页 → 跑测试
- [ ] 视频剪辑并压到 3 分钟以内
