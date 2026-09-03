# 04 — Idea 赛一页 A4 · 英文稿 v5

日期：2026-09-02　｜　状态：英文稿，**待排进 PDF 实测页数**
排版：12 号字、单倍行距、Times New Roman、页边距 2cm、**段间不空行（首行缩进分段）**

> **v5 相对 v4 的删减**
> 产品负责人本轮指定的三处：
> 1. **删掉 GitHub 仓库链接**（已写在提交的 comment 里，PDF 不必重复）。
> 2. 第二段「现有工具」压成三句，**保留「人们并非故意撒谎，他们只是相信自己那套说法」**。
> 3. 「现状说明」大幅压缩——本场是 Idea Competition 比的是想法，实物留给 9 月 25 日的 Demo Competition。
>
> 本次复审另外找出的三处：
> 4. **「It must also be AI」段里重复引用了同一组句子。** 「the fundamentals changed / you bought in the 97th percentile」在上文第二层已经完整引过一次，此处再引一遍是纯冗余，改为回指。
> 5. 「What I already know is hard」只留评估方法一条。**「用户从不写字怎么办」已经由第三层的「系统对一言不发的人照样工作」回答过了**，重复。
> 6. 「It must be local」三条理由压成两条。

---

## 正文（英文，交付内容）

**Zhenn's Ledger — a local AI that connects what you said to what you actually did**

Zhu Zhen · Faculty of Informatics, University of Debrecen · AI Idea Competition

Every tool today tells you what happened to your money. None tell you why you did it, or whether you will do it again. That answer was never in the data — you cannot recover "I panicked" from a CSV file. Barber and Odean showed in 2000 that the most active fifth of 66,465 households earned 11.4% a year against a market return of 17.9%: a gap made by behaviour, not by stock picking. Twenty-six years on, no consumer tool has solved it, because the data it needs is data nobody hands over.

Existing tools either protect your privacy and have no AI, or use AI only to follow the money. The few that study psychology sit in the cloud and ask you to tag your own emotions by hand. Even when someone does, the form records what they *think* they were thinking — people are not lying on purpose; they simply believe their own account of themselves.

**The idea has three layers.** *One: infer from behaviour, ask nothing.* The ledger already knows the second each trade happened and what the price was doing then. A buy landing in the 97th percentile of an asset's 24-hour move is not a reported feeling. It is a fact. Trades do not lie.

*Two: put the record beside the account.* Every trade can carry the sentence I wrote at that moment. The ledger says: you bought at the top of a fourteen-percent day. My own words say: the fundamentals changed, I am here for the long term. The distance between those two sentences is how much I lie to myself. It runs both ways — disagreement is a blind spot; agreement, again and again, is discipline, and for the first time it is measurable. Money compounds. When your judgement is repeatedly shown to be reliable, your thinking starts to compound too.

*Three: silence is data.* People do not skip the note at random. They skip it when they are impulsive, when they feel caught out, when they are in a hurry. Absence correlates with impulse, so absence is a signal, not a hole. Layers one and three ask nothing of the user, so the system still works for someone who never writes a word.

**This is reconciliation, not lie detection.** AI that claims to read lying from voice or micro-expressions does not survive scrutiny. This does something older and duller: it checks a stated account against a verifiable record, the way an audit does. It never says "you are lying" — it says "what you claimed and what the record shows do not agree."

**It must be local.** It needs a person's whole trade history plus the notes they wrote for nobody else, and trading records are among the most private data anyone holds. The harder reason: people only tell themselves the truth when they are certain no one else is reading. Privacy here is not a feature — it is the precondition for the data to exist.

**It must also be AI**, though two of the three layers do not need it: percentile statistics are arithmetic, and I will not call them AI. Knowing where not to use AI is how I know where to use it. The second layer is different. Contradiction there is semantic, not lexical — the two sentences above do not clash on the surface. They clash because a long-term investor does not care where the short-term price sits, and the same intent has unlimited phrasings, so enumeration always misses, and misses the most original people first. Meaning also depends on a person's whole history, which is why *why AI* and *why local* are two conclusions from one constraint. Above all, a fixed rule only catches the excuses I already thought of. Self-deception is not finite; it evolves alongside self-knowledge — each time I am caught, I invent a better reason. No rule written in advance can keep up. The value of a model is not recognising the patterns I listed, but finding the ones I did not.

**Where this stands.** The repository is still only the foundation: a local-first encrypted ledger that runs offline, with no server and no account. No AI model has been connected to it yet — no NLP, no agent, none of the algorithms above. I am still laying the groundwork, and I intend to keep going. The field that stores the original sentence for each trade was built months before I knew what it was for.

There is no ground truth for "was that impulsive," so evaluation will not measure label accuracy. It will measure the realised outcome of each class of behaviour — an objective number already in the ledger.

Wealth does not come from being right once. It comes from not making the same mistake twice — and you cannot stop a mistake you do not remember making.

I am grateful to the Faculty for making a place where an unfinished idea can be shown at all. But I would keep building this either way. I believe that one day someone other than me will need it.

I grew up in China with the story of Ma Liang, a boy whose brush could paint whatever was missing: the village had no waterwheel, so he painted one. I needed a tool to see who I really am with money. I looked for it, and it was not there. **I am a programmer now. When the tool is missing, I paint it.**

---

## 中文对照（不进 PDF）

只列本版改动的三段，其余与 v3 中文对照一致。

**第二段（现有工具）**：现有工具要么保护隐私但没有 AI，要么用 AI 只盯着钱去哪了。少数几个真的在研究心理的都在云端，而且要你手动给自己的情绪打标签。**就算真有人填了，那张表记下的也只是他以为自己当时在想什么——人们并不是故意撒谎，他们只是相信自己那套说法。**

**现状说明**：仓库目前只是地基：一个离线运行、无服务端、无账号的本地优先加密账本。**目前没有接入任何 AI 模型——没有 NLP、没有 agent、上面说的算法一个都还没有。我还在打地基，而我打算一直做下去。** 那个保存每笔交易原话的字段，是在我还不知道它有什么用之前几个月就建好的。

**评估方法**：「这笔算不算冲动」没有标准答案，所以评估不测标签准确率，而是测每一类行为后来的实际盈亏——那是账本里现成的客观数字。

---

## 若仍超页，继续砍的顺序

| 序 | 砍什么 | 约省 | 损失 |
| ---: | --- | ---: | --- |
| 1 | 评估方法整段 | 40 | 少了「我想过怎么验证」，答辩口头补 |
| 2 | 第二段压成一句，只留「人们并非故意撒谎」 | 40 | 少了竞品调研的信号 |
| 3 | 「It must be local」的第一条理由（数据私密） | 30 | 只留「只有没人看时人才说真话」，其实那条更强 |
| 4 | 「Where this stands」的最后一句（字段早于想法） | 18 | **不建议**——这是唯一证明「不是临时编的」的句子 |

**一个字都不能砍**：三层想法、「It must also be AI」整段、「No AI model has been connected to it yet」、以及结尾三段（复利收尾、坚持、神笔马良）。
