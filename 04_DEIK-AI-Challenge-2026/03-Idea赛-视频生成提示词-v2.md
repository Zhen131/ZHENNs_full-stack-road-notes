# 03 — Idea 赛视频画面生成提示词 · v2（英文可用版）

日期：2026-09-02　｜　状态：**可直接使用**
对应脚本：`02-Idea赛-视频脚本-v6.md`
上一版：`03-Idea赛-视频生成提示词-v1.md`（中文审阅稿，内容与本版一致，仅语言不同，未改动）

> **口播已录制完成，实测 2 分 30 秒**（含真人出镜）。三分钟上限有 30 秒余量。
> 本文件里的时间区间沿用 `02` 脚本的估算（按 2 分 48 秒算），**实际剪辑点以你录好的音轨为准**，这些数字只用来分辨哪一拍是哪一拍。

> **语言说明**：所有要粘给模型的内容块（通用前缀、静态图提示词、视频提示词）**全部是英文**；章节标题和给你自己看的备注保留中文，方便你翻找。要是想连备注也换成英文，说一声。

---

## 一、怎么用

| 步 | 做什么 | 用哪家 |
| --- | --- | --- |
| 1 | 复制**通用前缀** + 该拍的 **STILL IMAGE PROMPT**，出一张扁平插画 | ChatGPT 出图 |
| 2 | 上传这张图，复制**通用前缀** + 该拍的 **VIDEO PROMPT**，做图生视频 | Gemini 里的 Veo |

**每次生成前，通用前缀都完整复制一遍。** 不管出图还是出视频，就复制这一段，不用分段挑。

**开工顺序**：先只跑拍 1 的静态图。画风满意之后，把那张图存下来当**画风样张**。从拍 2 开始，每次出静态图都把样张一起传进去，并在提示词最前面加上这一行：

```
Match the art style, palette, line weight and character design of the attached reference image exactly.
```

做图生视频时，在视频提示词最前面加上这一行：

```
Keep the exact art style, palette, line weight and character design of the attached image. Animate it without redrawing it.
```

**不要买 Seedance、海螺、Runway 的会员。** 这个风格越简单，模型之间差距越小，钱换不来东西。

**风险提前说清楚**：Veo 是奔着真实感训练的，喂给它扁平白底图，它的本能是加纹理、加阴影、让线条呼吸抖动、让人物五官慢慢漂移。通用前缀里 MOTION RULES 那一整段，作用就是把它按住。**如果某一拍生成三四次还在变形，放弃那一拍的 AI 视频，直接用静态图 + 剪辑软件里的位移淡入**，效果一样，不值得跟模型死磕。

---

## 二、通用前缀（每次生成前原样复制这一整段，一个字不要改）

```
[STYLE LOCK]
Style: flat 2D vector illustration, minimalist explainer-animation style.
Background: pure white, completely empty. No texture, no gradient, no shadow, no depth.
Viewpoint: straight-on front view. No perspective, no overhead view, no isometric angle, no tabletop angle.
Elements: all simple flat shapes with clean outlines of uniform weight.
Palette: warm colours only - warm off-white, soft terracotta orange, warm sand beige, muted warm brown, light warm grey. No cool blue, no green, no purple.
Composition: very few elements, with large amounts of empty space around them. Horizontally centred, sitting in the upper two thirds of the frame.
Reserved area: the bottom-right quarter of the frame must stay completely empty. No element may enter it.
Aspect ratio: 16:9.

[NEVER INCLUDE]
Any text, any letters, any words, any numbers, any digits, any readable handwriting, any user interface, any labels, any logo, any watermark.
Photorealism, 3D rendering, realistic lighting, cast shadows, paper texture, grain, depth of field, bokeh.
Any extra characters, props, furniture, plants, desks or background objects beyond what is described below.

[MOTION RULES]
The camera is completely locked. Zero camera movement: no pan, no zoom, no dolly, no tilt, no parallax, no handheld shake.
The background stays pure white and perfectly still for the entire clip.
Nothing morphs and nothing warps. No element changes its shape, its colour or its outline weight.
If a character is present, its face, proportions and colours stay exactly the same in every single frame, identical to the reference image.
Only the motion described below happens. Everything else in the frame is completely static.
Motion is slow, calm and smooth. No fast action, no bouncy animation, no transitions, no fades to black, no cuts.
Duration: 8 seconds.
```

---

# 三、八拍提示词

---

## 拍 1 — 我是谁

**口播**：`Hi, I'm Zhen. I am a long-term investor. I have kept a ledger since I was a teenager. And for the last two years I've written down every single trade by hand.`

**这一拍要砸出去的**：不是"记账"，是**"手写"和"两年"这个量**。

**STILL IMAGE PROMPT**
```
SCENE: One flat vector character, front view, drawn from the waist up, positioned slightly left of the frame centre. The body is built from simple rounded shapes: a soft terracotta orange top, dark warm-brown hair, and minimal facial features - two small dots for eyes and one short line for a mouth. One hand is raised, holding a slim plain pencil.
To the character's right, at the same height, an open notebook floats in the air. It is drawn as two rounded rectangles side by side, with warm off-white pages and a thin warm-brown outline. On the left page there are three short light-grey horizontal bars, evenly spaced, suggesting handwritten lines. These bars are plain solid grey rectangles and are not readable characters of any kind.
There is nothing else in the frame.
```

**VIDEO PROMPT**
```
MOTION: The pencil moves slowly left and right in a short horizontal sweep just above the notebook page. Each time it completes one pass, one new light-grey horizontal bar appears on the page, one line below the previous one, until six bars are on the page. Then two closed notebooks quietly fade in and stack one after the other beneath the open notebook. Apart from the hand holding the pencil, the character stays completely still.
```

**后期叠**：字幕。

---

## 拍 2 — 我的问题

**口播**：`My ledger can tell me exactly how much I lost. Down to the cent. It has never told me why I lost it. I cannot change what I lost. I can only change what I do next.`

**这一拍要砸出去的**：账本什么都知道，就是不知道**"为什么"**。

**STILL IMAGE PROMPT**
```
SCENE: One open notebook centred in the frame, drawn as two rounded rectangles side by side, with warm off-white pages and a thin warm-brown outline. Both pages are filled with short light-grey horizontal bars, evenly spaced, representing dense handwritten records. These bars are plain solid grey rectangles and are not readable characters.
Above and slightly behind the notebook floats one large flat question mark symbol in soft terracotta orange. This question mark is the only glyph allowed in this image; apart from it, no letters, words or digits may appear anywhere in the frame.
To the left of the notebook stands a flat vector character, drawn from the waist up, both palms turned upward in a small shrug, eyebrows slightly raised.
There is nothing else in the frame.
```

**VIDEO PROMPT**
```
MOTION: The grey bars on both notebook pages brighten one at a time, starting from the top line and moving down, at an even and slightly quick rhythm. Then the large terracotta question mark rises slowly from behind the notebook and settles above it, holding still. At the same moment the character's shoulders lift slightly into the shrug and stay there. Nothing else moves.
```

**后期叠**：字幕。

> 问号是个符号，跟"画面不许有字"这条有点冲突，提示词里单独开了口子放它进来。生成出来不好看就换成小人挠头。

---

## 拍 3 — 不只是我

**口播**：`Between 1991 and 1996, two researchers studied sixty-six thousand American households. The ones who traded the most earned eleven point four percent a year. The market earned seventeen point nine. That gap is not about picking bad stocks. It is about behaviour.`

**这一拍要砸出去的**：一群人 → 两根柱子 → **中间那道缺口**。数字全部后期叠，模型一个都不许写。

**STILL IMAGE PROMPT**
```
SCENE: The frame is divided into a left half and a right half by empty white space, with no divider line drawn.
Left half: a row of six identical small person icons, each one a rounded head above a rounded body, in warm sand beige, standing side by side in a straight line with even spacing.
Right half: two flat vertical bars standing on an invisible horizontal baseline. The left bar is short and soft terracotta orange. The right bar is clearly much taller and muted warm brown. A wide band of empty white space separates the top of the short bar from the height of the tall bar, and this empty band is the visual focus of the composition.
There are no axes, no gridlines, no labels, no tick marks and no numbers anywhere.
```

**VIDEO PROMPT**
```
MOTION: The six person icons fade in one by one from left to right. Once all six are visible, they slide together toward the right and smoothly compress into the short terracotta bar, which grows upward from the baseline to its final height and stops. Then the tall warm-brown bar grows upward from the same baseline and stops at a clearly greater height. Both bars then stay completely still, and for the last two seconds the empty white gap between the top of the short bar and the top of the tall bar must be fully visible.
```

**后期叠**：`11.4%` 压在矮柱顶上，`17.9%` 压在高柱顶上，`BEHAVIOUR` 打在缺口里。

---

## 拍 4 — 我找过工具，都不行

**口播**：`So I went looking for a tool. The open-source ones have no AI. The AI ones only follow the money. The ones that look at psychology sit in the cloud, expensive, and ask me to fill in a form. I don't want to fill in a form.`

**这一拍要砸出去的**：三个都不行，最后一个还要我填表。

**STILL IMAGE PROMPT**
```
SCENE: Three identical rounded-rectangle cards in a horizontal row, evenly spaced and centred in the frame, with warm off-white fill and thin warm-brown outlines.
In the middle of the first card: one simple branching fork symbol made of three dots joined by two short lines, in muted warm brown.
In the middle of the second card: one plain solid circle in soft terracotta orange, like a simplified coin.
In the middle of the third card: one simple flat cloud shape in light warm grey.
The cards carry no text, no labels and no numbers.
There is nothing else in the frame.
```

**VIDEO PROMPT**
```
MOTION: The three cards fade in one after another from left to right, about half a second apart. Once the third card has settled, a thick terracotta orange cross mark is drawn over the third card in two quick strokes and then holds still. Then a small upright sheet slides in from the right edge of the frame and stops next to the third card; on the sheet are four empty light-grey boxes stacked vertically. A simple flat hand shape then enters from the left, pushes the sheet gently, and the sheet slides out through the right edge of the frame. The three cards stay completely still throughout.
```

**后期叠**：三张竞品截图（或紧接其后单独一屏），价格页红叉。名字只上屏不念。

---

## 拍 5 — 我不找了，我自己做

**口播**：`So I stopped looking. I built my own. My ledger already knows when every trade happened, and what the price was doing then. Take one trade. I bought at the top of a day that went up fourteen percent. The trade itself is the data. I never had to tell anyone how I felt.`

**这一拍要砸出去的**：**买在最高点**，然后它掉了。画面上不出现任何形容词，也不出现数字。

**STILL IMAGE PROMPT**
```
SCENE: One polyline of uniform thickness in muted warm brown, centred in the frame. The line rises steeply from the lower left, forms one sharp peak slightly above and left of the frame centre, then turns and descends toward the lower right. One solid soft terracotta orange dot sits exactly on the peak.
At the far left of the frame stands a small flat vector character, drawn from the waist up, arms hanging naturally at the sides, head turned toward the line.
There are no axes, no gridlines, no candlesticks, no labels and no numbers.
```

**VIDEO PROMPT**
```
MOTION: The polyline draws itself progressively from the lower left upward to the peak, as if traced by an invisible pen. When it reaches the peak, the terracotta dot appears on the peak and settles with one small movement. The line then continues drawing from the peak down toward the lower right, descending until it leaves the edge of the frame. The character stays still throughout, except for a very slight downward tilt of the head at the very end. Nothing else moves.
```

**后期叠**：时间戳、`+14%`。**不要叠任何形容词。**

---

## 拍 6 — 爆点：我的话 vs 账本的话

**口播**：`But what if I do say something? ... So I wrote: the fundamentals changed, I am here for the long term. And my ledger says: you bought at the top of a fourteen percent day. One of those two sentences is a lie. And it is not the ledger.`

**这一拍要砸出去的**：**全片唯一必须被记住的画面。** 先出我的话（暖），停一拍让观众认同；再出账本的话（冷）；最后中间裂开。

> **这一拍破例使用冷色，是全片唯一一处。** 通用前缀里"只用暖色"那句在这一拍被下面的描述覆盖，覆盖的说法已经写进提示词里了。

**STILL IMAGE PROMPT**
```
SCENE: One thin light-warm-grey vertical line runs from the top edge to the bottom edge of the frame, dividing it into a left half and a right half.
Left half: one large empty rounded speech bubble filled with soft terracotta orange, its tail pointing down and to the left.
Right half: one large empty rounded speech bubble filled with muted cool blue-grey, its tail pointing down and to the right. This single cool blue-grey element is a deliberate exception to the warm-colours-only rule above, and is the only cool colour permitted in this image.
Both speech bubbles are completely empty inside: no lines, no dots, no text, no placeholder marks of any kind.
There is nothing else in the frame.
```

**VIDEO PROMPT**
```
MOTION: The clip opens on a pure white frame with the thin vertical centre line already in place. The warm terracotta speech bubble scales up gently on the left half and settles, then holds completely still for two full seconds. Then the cool blue-grey speech bubble scales up gently on the right half and settles. Once both bubbles are still, a thin jagged crack draws itself downward along the vertical centre line, from the top of the frame to the bottom. Both speech bubbles stay completely empty inside for the entire clip.
```

**后期叠**：左气泡内 `"The fundamentals changed. I am here for the long term."`；右气泡内 `You bought at the top of a fourteen percent day.`；裂缝画完后中间浮出 `A LIE`。**念到 `One of those two sentences is a lie.` 停一拍，让 `A LIE` 浮出来。**

**另需**：这一拍开头还有一屏代码高亮 `rawText` 字段，那是录屏，不用 AI 生成。

---

## 拍 7 — 为什么非要 AI

**口播**：`A fixed rule can only catch the excuses I already thought of. And I am creative. I always find a new one. No rule written in advance can keep up with me. But AI can.`

**这一拍要砸出去的**：清单是有限的，花样是无限的。**清单抓不到清单上没有的东西。**

**STILL IMAGE PROMPT**
```
SCENE: On the left half of the frame, a vertical column of five identical small rounded squares, stacked with even spacing, filled warm sand beige with thin warm-brown outlines. All five squares are exactly the same size and shape.
The right half of the frame is completely empty white space.
The squares contain no text, no check marks, no numbers and no symbols.
```

**VIDEO PROMPT**
```
MOTION: The five squares in the left column light up one at a time from top to bottom, each changing from warm sand beige to soft terracotta orange and then holding that colour. After the fifth square lights up, the whole column stays completely still. Then, in the empty right half of the frame, three new shapes fade in slowly one after another, all in muted warm brown: first a triangle, then a five-pointed star, then a small irregular blob. None of these three shapes resembles the squares on the left. The five squares never change again and never react.
```

**后期叠**：字幕。可选：左列旁边一行小字 `IF / ELSE`（要的话也是后期叠，不让模型写）。

---

## 拍 8 — 超越性价值 + 收尾

**口播**：`Wealth does not come from being right once. It comes from not making the same mistake twice. And you cannot stop a mistake if you do not remember it. Every tool today tells you what happened to your money. I am building the one that tells you what happened to you.`

**这一拍要砸出去的**：全部留白，让字自己说话。脚印是对"财富是一步一个脚印"的呼应。

**STILL IMAGE PROMPT**
```
SCENE: An almost entirely empty white frame. In the lower-left area there is a trail of four small flat footprint shapes in light warm grey, evenly spaced, running from the left edge toward the centre of the frame. The footprints are simple rounded oval shapes with no toe detail.
The upper two thirds of the frame and the whole right side are completely empty.
There is nothing else in the frame.
```

**VIDEO PROMPT**
```
MOTION: The footprints appear one at a time, from the left edge toward the centre of the frame, about one second apart, each fading in softly and then staying. After the fourth footprint appears, the frame holds completely still for the remaining seconds, with all four footprints visible and the rest of the frame empty white.
```

**后期叠**：四句排比逐句出现在上方留白里；最后一句停住，下方打 GitHub 链接，停留到片尾。

> **备选版本**：如果觉得只有脚印太空，把扁平小人放在最后一个脚印上，侧身朝右，静止不动。风险是小人五官在 8 秒里会漂，建议先试脚印版。

---

# 四、后期叠加清单（别漏）

| 拍 | 要叠什么 |
| --- | --- |
| 1 | 字幕 |
| 2 | 字幕 |
| 3 | `11.4%`、`17.9%`、`BEHAVIOUR` |
| 4 | 三张竞品截图 + 价格页红叉 |
| 5 | 时间戳、`+14%` |
| 6 | 两句引语 + `A LIE`；另接 `rawText` 代码录屏 |
| 7 | 字幕（可选 `IF / ELSE`） |
| 8 | 四句排比 + GitHub 链接 |

**全片右下角留空，叠真人头像圆圈。全片字幕必加。**

---

# 五、时长缺口怎么补（按实测 2 分 30 秒重算）

音轨 150 秒。八段 AI 片段每段 8 秒，合计 **64 秒**，**缺口约 86 秒**。缺口不用全靠 AI 补：

| 来源 | 大概能占 | 说明 |
| --- | --- | --- |
| 账本录屏（解锁 → 首页 → 交易页 → `rawText` 代码屏） | 30–40 秒 | 已在 `02` 的待办里 |
| 三张竞品截图（拍 4） | 10–15 秒 | 已在 `02` 的待办里 |
| 纯留白字幕页（拍 8 的四句排比） | 15–20 秒 | 剪辑里做，不用 AI |
| 每段 AI 片段末帧定格 + 缓慢推近 | 每段 3–5 秒 | 剪辑里两秒钟就能做 |

按上表，缺口基本能填满，**多半不需要第二轮 AI 片段**。万一还差，优先给拍 6 补一段（它最长）。

---

# 六、待办

- [x] 口播录制（实测 2 分 30 秒，含真人出镜）
- [ ] 先只跑**拍 1 的静态图**，确认画风。画风定了再往下生成，别一次跑八张
- [ ] 拍 1 满意的那张图存为"画风样张"，后面每拍出图都传它，并在提示词最前面加那行 `Match the art style...`
- [ ] 试一段图生视频，看扁平风会不会被加纹理、加阴影、五官漂移。**漂了就退回静态图 + 剪辑位移，不要死磕**
- [ ] 账本录屏素材：解锁 → 首页 → 交易页 → `rawText` 字段那屏代码
- [ ] 竞品截图三张
- [ ] GitHub 仓库链接（片尾画面 + 字幕）
- [ ] 全片字幕
- [ ] 成片掐表复核，确认不超 3 分钟
