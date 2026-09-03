# 04 — Idea 赛 · 英文稿 v7（PDF 正文 + Comments 分区）

日期：2026-09-02　｜　状态：v7，PDF 正文已收口，待实测页数
排版：12 号字、单倍行距、Times New Roman、页边距 2cm、段间不空行（首行缩进分段）

> **v7 相对 v6 的修正（两处，都是把 v5 砍坏的东西补回来）**
> 1. **恢复两句引语。** v5 把 `"the fundamentals changed…" and "you bought in the 97th percentile"` 改成了 `the two sentences above`，理由是「重复」。**这个判断是错的**——在一页密排的纸上，回指会逼读者往回找，而读者不会往回找。引语是回声，不是冗余。
> 2. **把「为什么非要 AI」的三条论证拆回独立段落**，各带一个斜体小标题（*Contradiction is semantic* / *Meaning depends on history* / *A fixed rule only catches…*）。v5 为省字把三条揉进一个 145 词的段落，结果是一堵字墙——**省下的字，代价是评委扫一眼看不见骨架。**
>
> **v6 的结构变化（保留）：交付物拆成两份。**
> - **区域 A = PDF 正文**：从开头讲到「为什么非要 AI」为止，收在 `finding the ones I did not.`
> - **区域 B = Comments**：仓库链接、项目现状、评估方法、财富那句、感谢学院、神笔马良——全部移到提交表单的备注栏。
>
> 这么拆的好处：**PDF 只留论证，一页装得下；而那些「关于我这个人」的东西放在 comments 里反而更合适**——PDF 是给人看论点的，comments 是给人看人的。

---

# 区域 A ── PDF 正文（交付内容，一页 A4）

**Zhenn's Ledger — a local AI that connects what you said to what you actually did**

Zhu Zhen · Faculty of Informatics, University of Debrecen · AI Idea Competition

Every tool today tells you what happened to your money. None tell you why you did it, or whether you will do it again. That answer was never in the data — you cannot recover "I panicked" from a CSV file. Barber and Odean showed in 2000 that the most active fifth of 66,465 households earned 11.4% a year against a market return of 17.9%: a gap made by behaviour, not by stock picking. Twenty-six years on, no consumer tool has solved it, because the data it needs is data nobody hands over.

Existing tools either protect your privacy and have no AI, or use AI only to follow the money. The few that study psychology sit in the cloud and ask you to tag your own emotions by hand. Even when someone does, the form records what they *think* they were thinking — people are not lying on purpose; they simply believe their own account of themselves.

**The idea has three layers.** *One: infer from behaviour, ask nothing.* The ledger already knows the second each trade happened and what the price was doing then. If I bought into a price that was already spiking, the trade itself says so. Nobody had to ask me how I felt. Trades do not lie.

*Two: put the record beside the account.* Every trade can carry the sentence I wrote at that moment. The ledger says: you bought at the top of a fourteen-percent day. My own words say: the fundamentals changed, I am here for the long term. The distance between those two sentences is how much I lie to myself. It runs both ways — disagreement is a blind spot; agreement, again and again, is discipline, and for the first time it is measurable. Money compounds. When your judgement is repeatedly shown to be reliable, your thinking starts to compound too.

*Three: silence is data.* People do not skip the note at random. They skip it when they are impulsive, when they feel caught out, when they are in a hurry. Absence correlates with impulse, so absence is a signal, not a hole. Layers one and three ask nothing of the user, so the system still works for someone who never writes a word.

**This is reconciliation, not lie detection.** AI that claims to read lying from voice or micro-expressions does not survive scrutiny. This does something older and duller: it checks a stated account against a verifiable record, the way an audit does. It never says "you are lying" — it says "what you claimed and what the record shows do not agree."

**It must be local.** It needs a person's whole trade history plus the notes they wrote for nobody else, and trading records are among the most private data anyone holds. The harder reason: people only tell themselves the truth when they are certain no one else is reading. Privacy here is not a feature — it is the precondition for the data to exist.

**It must also be AI.** Two of the three layers do not need it — percentile statistics are arithmetic, and I will not call them AI. Knowing where not to use AI is how I know where to use it. The second layer is different, and it is not sentence parsing.

*Contradiction is semantic, not lexical.* "The fundamentals changed, I am here for the long term" and "you bought at the top of a fourteen-percent day" do not clash on the surface. They clash because a genuinely long-term investor does not care where the short-term price sits — and the same intent has unlimited phrasings, so enumeration always misses, and it misses the most original people first.

*Meaning depends on the person's own history*, which is why *why AI* and *why local* are two conclusions drawn from one constraint.

*A fixed rule only catches the excuses I already thought of.* Self-deception is not finite; it evolves alongside self-knowledge — each time I am caught, I invent a better reason. No rule written in advance can keep up. The value of a model is not recognising the patterns I listed, but finding the ones I did not.

*The ledger exists. The AI layer described here does not yet — that is what I am asking to build. Status, repository and closing notes are in the submission comments.*

---

> **最后那一行斜体是我加的，20 个词，建议保留，理由在文末「一处建议」。删掉也完全能读通。**

---

# 区域 B ── Comments（提交表单备注栏）

**Repository**
github.com/Zhen131/ZHENNs_Ledger

**Where this stands.** The repository is still only the foundation: a local-first encrypted ledger that runs offline, with no server and no account. No AI model has been connected to it yet — no NLP, no agent, none of the algorithms in the attached page. I am still laying the groundwork, and I intend to keep going. The field that stores the original sentence for each trade was built months before I knew what it was for.

**On evaluation.** There is no ground truth for "was that impulsive," so this cannot be judged by label accuracy. It will be judged by the realised outcome of each class of behaviour — an objective number already sitting in the ledger.

Wealth does not come from being right once. It comes from not making the same mistake twice — and you cannot stop a mistake you do not remember making.

I am grateful to the Faculty for making a place where an unfinished idea can be shown at all. But I would keep building this either way. I believe that one day someone other than me will need it.

I grew up in China with the story of Ma Liang, a boy whose brush could paint whatever was missing: the village had no waterwheel, so he painted one. I needed a tool to see who I really am with money. I looked for it, and it was not there. I am a programmer now. When the tool is missing, I paint it.

---

## 中文对照（不进交付）

**PDF 正文结尾新增的那一行**：账本是存在的，但这里描述的 AI 那一层还不存在——那正是我申请要做的东西。现状、仓库与结尾的话写在提交备注里。

**Comments 部分**：
*仓库*：github.com/Zhen131/ZHENNs_Ledger
*现状*：仓库目前只是地基——一个离线运行、无服务端、无账号的本地优先加密账本。**目前没有接入任何 AI 模型：没有 NLP、没有 agent、附件里说的算法一个都还没有。我还在打地基，而我打算一直做下去。** 那个保存每笔交易原话的字段，是在我还不知道它有什么用之前几个月就建好的。
*评估*：「这笔算不算冲动」没有标准答案，所以它不能用标签准确率来评判，而要用每一类行为后来的实际盈亏来评判——那是账本里现成的客观数字。
*财富*：财富不是靠对一次得来的，是靠不第二次犯同一个错——而你没法阻止一个你不记得自己犯过的错。
*感谢*：感谢学院提供了这样一个地方，让一个还没做完的想法也能被看见。但即使没有这场比赛，我也会继续做下去。我相信总有一天，除了我之外也会有人真正需要它。
*神笔马良*：我在中国长大，听着神笔马良的故事——一个少年有一支笔，能把缺的东西画出来：村里没有水车，他就画一架水车。我需要一个工具去看清自己在钱这件事上到底是什么样的人。我找过，它不存在。而我现在是个程序员。缺什么工具，我就自己画一个。

---

## 一处建议

PDF 正文现在从头到尾没有一句话说明「这东西还没做出来」——状态全在 comments 里。**万一评委只读了 PDF、没点开备注栏，他会默认这套系统已经存在。**

所以我在正文最后加了一行斜体（20 词）：**账本是存在的，但这里描述的 AI 那一层还不存在——那正是我申请要做的东西。** 它花二十个词买两样东西：一是诚实不会因为分区而漏掉；二是把评委引到 comments 去看剩下的部分。

这一行删掉正文也完全通顺，收在 `finding the ones I did not.` 上其实是个很漂亮的结尾。**你自己定。**
