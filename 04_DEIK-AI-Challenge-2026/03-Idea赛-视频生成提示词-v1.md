# 03 — Idea 赛视频画面生成提示词 · v1（初稿）

日期：2026-09-02　｜　状态：**v1 初稿，待逐拍修改**
对应脚本：`02-Idea赛-视频脚本-v6.md`（八拍，2 分 48 秒）
用途：把八拍的画面变成可以直接粘进 Gemini / ChatGPT 的提示词，生成的片段由产品负责人自己拼接剪辑。

> **版本管理**：本文件每改一版另起 `-v2`、`-v3`，旧版不动，与 `02` 系列同惯例。

---

## 一、生成路线（两步法）

**不要直接文生视频。** 文生视频八次生成八个画风，压不住。走这两步：

| 步 | 做什么 | 用哪家 |
| --- | --- | --- |
| 1 | 用「静态图提示词」出一张扁平插画，锁死构图和画风 | ChatGPT 出图 或 Gemini 出图（两个会员都有） |
| 2 | 把这张图 + 「视频提示词」一起喂进去，做**图生视频** | Gemini 里的 Veo，或 ChatGPT 里的 Sora |

**第一拍先只做第 1 步。** 拍 1 的静态图满意之后，把那张图当作全片的**画风样张**，后面每一拍出静态图时都把样张一起传进去说「保持这个画风」。这一步能把返工次数从二三十次压到五六次。

**不要为这个视频购买 Seedance、海螺、Runway 等额外会员。** 这个风格越简单，模型之间的差距越小，花的钱换不来东西。

**风险提前说清楚**：Veo 和 Sora 是奔着真实感训练的，你给它扁平白底图，它的本能是加纹理、加阴影、让线条呼吸抖动、让人物五官慢慢漂移。所以下面每条视频提示词里都带一整段「动作约束」，作用就是把它按住。如果某一拍生成三四次还是在变形，**放弃那一拍的 AI 视频，直接用静态图 + 剪辑软件里的位移淡入**，效果一样，不值得跟模型死磕。

---

## 二、全局风格锁（每条提示词开头原样粘贴，一个字不改）

```
STYLE LOCK - do not change any part of this block.
Flat 2D vector illustration, minimalist explainer-video style.
Pure white background, completely empty, no texture, no gradient, no shadow, no depth.
Straight-on front view. No perspective, no isometric angle, no tabletop or overhead view.
All elements are simple flat shapes with clean, even outlines of uniform weight.
Warm limited palette only: warm off-white, soft terracotta orange, warm sand beige, muted warm brown, light warm grey.
Very few elements. Large amounts of empty white space around them. The composition is horizontally centered and sits in the upper two thirds of the frame.
The entire bottom-right quadrant of the frame is left completely empty. No element may enter it.
16:9 aspect ratio.
```

## 三、全局禁止项（跟在风格锁后面，原样粘贴）

```
DO NOT INCLUDE: any text, any letters, any words, any numbers, any digits, any readable handwriting, any user interface, any labels, any logos, any watermark.
DO NOT INCLUDE: photorealism, 3D rendering, realistic lighting, cast shadows, paper texture, grain, depth of field, bokeh.
DO NOT INCLUDE: any additional characters, props, furniture, plants, desks or background objects beyond what is described.
```

## 四、全局动作约束（只用于视频提示词，跟在画面描述后面）

```
MOTION RULES - do not change any part of this block.
The camera is completely locked. Zero camera movement: no pan, no zoom, no dolly, no tilt, no parallax, no handheld shake.
The background stays pure white and perfectly still for the entire clip.
Nothing morphs and nothing warps. No element changes its shape, its colour, or its outline weight.
Any character keeps exactly the same face, proportions and colours as in the source image, in every single frame.
Only the movements described above happen. Everything else in the frame is completely static.
Slow, calm, smooth motion. No fast action, no bounce-heavy animation, no transitions, no fades to black, no cuts.
Duration: 8 seconds.
```

---

# 五、八拍提示词

> 每条提示词的完整用法：**风格锁 + 禁止项 + 本拍画面描述**（出静态图）；**风格锁 + 本拍动作描述 + 动作约束**（图生视频）。

---

## 拍 1 — 我是谁（0:00–0:15）

口播：`Hi, I'm Zhen. I am a long-term investor. I have kept a ledger since I was a teenager. And for the last two years I've written down every single trade by hand.`

**画面要传达的**：不是「记账」，是**「手写」和「两年」这个量**。

**静态图提示词**
```
SCENE: One flat vector character, front view, visible from the waist up, positioned just left of the frame centre. Simple rounded body shapes, soft terracotta orange top, dark warm-brown hair, minimal facial features: two small dots for eyes and one short line for a mouth. The character holds a plain slim pencil in one raised hand.
To the character's right, at the same height, floats an open notebook drawn as two rounded rectangles side by side, warm off-white pages with a thin warm-brown outline. On the left page there are three short horizontal light-grey bars, evenly spaced, suggesting handwritten lines. These bars are plain solid grey rectangles and are not readable characters of any kind.
Nothing else is in the frame.
```

**视频提示词**
```
ANIMATION: The pencil moves slowly left and right in a short horizontal sweep just above the notebook page. Each time it finishes one pass, one more short grey horizontal bar appears on the page, one line below the previous one, until the page holds six bars. Then two closed notebooks quietly fade in and stack beneath the open notebook, one after the other. The character stays completely still apart from the pencil hand.
```

**后期叠**：字幕。可选：左上角一行小字标题。

---

## 拍 2 — 我的问题（0:15–0:30）

口播：`My ledger can tell me exactly how much I lost. Down to the cent. It has never told me why I lost it. I cannot change what I lost. I can only change what I do next.`

**画面要传达的**：账本什么都知道，就是不知道「为什么」。

**静态图提示词**
```
SCENE: One open notebook drawn as two rounded rectangles side by side, centred in the frame, warm off-white pages with a thin warm-brown outline. Both pages are filled with short horizontal light-grey bars, evenly spaced, suggesting dense handwritten records. These bars are plain solid grey rectangles and are not readable characters.
Floating above and slightly behind the notebook is one large flat question mark symbol in soft terracotta orange. The question mark symbol is the only glyph allowed in this image; no other letters, words or digits appear anywhere.
To the left of the notebook stands the same flat vector character from the previous shot, visible from the waist up, both palms turned upward in a small shrug, eyebrows raised slightly.
Nothing else is in the frame.
```

**视频提示词**
```
ANIMATION: The grey bars on both notebook pages brighten one by one, from the top line down to the bottom line, in a quick even rhythm. Then the large terracotta question mark rises slowly from behind the notebook and settles into place above it, holding still. At the same moment the character's shoulders lift slightly into a shrug and stay there. Nothing else moves.
```

**后期叠**：字幕。

---

## 拍 3 — 不只是我（0:30–0:53）

口播：`Between 1991 and 1996, two researchers studied sixty-six thousand American households. The ones who traded the most earned eleven point four percent a year. The market earned seventeen point nine. That gap is not about picking bad stocks. It is about behaviour.`

**画面要传达的**：一群人 → 两根柱子 → **中间那道缺口**。数字全部后期叠。

**静态图提示词**
```
SCENE: The frame is divided into two halves by empty white space, with no divider line.
On the left half: a row of six identical tiny flat person icons, each a simple rounded head above a simple rounded body, warm sand beige, standing side by side in a straight line, evenly spaced.
On the right half: two flat vertical bars standing on an invisible horizontal baseline. The left bar is short and soft terracotta orange. The right bar is clearly much taller and muted warm brown. A wide band of empty white space separates the top of the short bar from the height of the tall bar, and this empty band is the visual focus of the composition.
There are no axes, no gridlines, no labels, no tick marks, no numbers anywhere.
```

**视频提示词**
```
ANIMATION: The six person icons fade in one by one from left to right. Once all six are visible, they slide together toward the right and compress smoothly into the short terracotta bar, which grows upward from the baseline to its final height and stops. Then the tall warm-brown bar grows upward from the same baseline and stops clearly higher than the first bar. Both bars then hold completely still, with the empty white gap between their tops fully visible for the last two seconds.
```

**后期叠**：`11.4%` 压在矮柱顶上，`17.9%` 压在高柱顶上，`BEHAVIOUR` 打在缺口里。**这三处字后期叠，模型一个都不许写。**

---

## 拍 4 — 我找过工具，都不行（0:53–1:15）

口播：`So I went looking for a tool. The open-source ones have no AI. The AI ones only follow the money. The ones that look at psychology sit in the cloud, expensive, and ask me to fill in a form. I don't want to fill in a form.`

**画面要传达的**：三个都不行，最后一个还要我填表。

**静态图提示词**
```
SCENE: Three identical rounded-rectangle cards in a horizontal row, evenly spaced and centred in the frame, flat warm off-white fill with thin warm-brown outlines.
Inside the first card, one simple branching fork symbol made of three dots joined by two short lines, muted warm brown.
Inside the second card, one plain solid circle in soft terracotta orange, like a simple coin.
Inside the third card, one simple flat cloud shape in light warm grey.
The cards contain no text, no labels and no numbers of any kind.
Nothing else is in the frame.
```

**视频提示词**
```
ANIMATION: The three cards fade in one after another from left to right, half a second apart. After the third card settles, a thick flat cross mark in soft terracotta orange draws itself over the third card in two quick strokes and stays. Then a small upright sheet with four empty light-grey boxes stacked on it slides in from the right edge and stops next to the third card; a simple flat hand shape enters from the left, pushes the sheet gently, and the sheet slides back out of the right edge of the frame. The three cards stay completely still throughout.
```

**后期叠**：三张竞品截图分别压在三张卡片位置上（或紧接其后单独一屏），价格页红叉。名字只上屏不念。

---

## 拍 5 — 我不找了，我自己做（1:15–1:38）

口播：`So I stopped looking. I built my own. My ledger already knows when every trade happened, and what the price was doing then. Take one trade. I bought at the top of a day that went up fourteen percent. The trade itself is the data. I never had to tell anyone how I felt.`

**画面要传达的**：**买在最高点**，然后它掉了。画面上不出现任何形容词，也不出现数字。

**静态图提示词**
```
SCENE: One bold polyline drawn in muted warm brown with a uniform thick stroke, centred in the frame. The line rises steeply from the lower-left, reaches a single sharp peak slightly above and left of the frame centre, then turns and descends to the lower-right. One solid soft terracotta orange circle dot sits exactly on the peak.
On the far left of the frame stands the same flat vector character from the earlier shots, small, visible from the waist up, arms at the sides, head turned toward the line.
There are no axes, no gridlines, no candlesticks, no labels, no numbers.
```

**视频提示词**
```
ANIMATION: The polyline draws itself progressively from the lower-left up to the peak, as if being traced by an invisible pen. When it reaches the peak, the terracotta dot appears on the peak with one small settle. The line then continues drawing from the peak downward to the lower-right and keeps descending until it leaves the frame edge. The character stays still except for a very slight downward tilt of the head at the end. Nothing else moves.
```

**后期叠**：时间戳、`+14%`。**不要叠任何形容词。**

---

## 拍 6 — 爆点：我的话 vs 账本的话（1:38–2:14）

口播：`But what if I do say something? ... So I wrote: the fundamentals changed, I am here for the long term. And my ledger says: you bought at the top of a fourteen percent day. One of those two sentences is a lie. And it is not the ledger.`

**画面要传达的**：**全片唯一必须被记住的画面。** 先出我的话（暖），停一拍让观众认同；再出账本的话（冷）；最后中间裂开。

> **这一拍破例使用冷色**，是全片唯一一处。风格锁里「只用暖色」这一句在本拍需要替换，替换句已写在下面提示词里。

**静态图提示词**
```
SCENE: The frame is split into two halves by one thin vertical light-warm-grey line running from top to bottom through the exact centre.
On the left half: one large empty rounded speech bubble filled with soft terracotta orange, with a short tail pointing down-left.
On the right half: one large empty rounded speech bubble filled with muted cool blue-grey, with a short tail pointing down-right. This single cool blue-grey element is a deliberate exception to the warm palette rule and is the only cool colour permitted in this image.
Both speech bubbles are completely empty inside: no lines, no dots, no text, no placeholder marks of any kind.
Nothing else is in the frame.
```

**视频提示词**
```
ANIMATION: The clip begins with an empty white frame and the thin vertical centre line already in place. The warm terracotta speech bubble scales up gently on the left half and settles, then holds completely still for two full seconds. Then the cool blue-grey speech bubble scales up gently on the right half and settles. Both bubbles then hold still, and a thin jagged crack draws itself downward along the vertical centre line between them, from top to bottom. Both bubbles remain completely empty for the entire clip.
```

**后期叠**：左气泡内 `"The fundamentals changed. I am here for the long term."`；右气泡内 `You bought at the top of a fourteen percent day.`；裂缝画完后中间浮出 `A LIE`。**念到 `One of those two sentences is a lie.` 停一拍，让 `A LIE` 浮出来。**

**另需一小段**：这一拍开头还有一屏代码高亮 `rawText` 字段，那是录屏，不用 AI 生成。

---

## 拍 7 — 为什么非要 AI（2:14–2:25）

口播：`A fixed rule can only catch the excuses I already thought of. And I am creative. I always find a new one. No rule written in advance can keep up with me. But AI can.`

**画面要传达的**：清单是有限的，花样是无限的。**清单抓不到清单上没有的东西。**

**静态图提示词**
```
SCENE: On the left half of the frame, a vertical column of five identical small rounded squares, stacked with even spacing, flat warm sand beige fill with thin warm-brown outlines. All five squares are identical in size and shape.
The right half of the frame is completely empty white space.
There are no text, no checkmarks, no numbers and no symbols inside the squares.
```

**视频提示词**
```
ANIMATION: The five squares in the left column light up one by one from top to bottom, each changing from warm sand beige to soft terracotta orange and then holding that colour. After the fifth square lights up, the column holds completely still. Then, in the empty right half of the frame, three new shapes fade in slowly one after another in muted warm brown: first a triangle, then a five-pointed star, then a small irregular blob. None of these three shapes resembles the squares on the left. The five squares never change again and never react.
```

**后期叠**：字幕。可选：左列旁边一行小字 `IF / ELSE`（如果要，也是后期叠，不让模型写）。

---

## 拍 8 — 超越性价值 + 收尾（2:25–2:46）

口播：`Wealth does not come from being right once. It comes from not making the same mistake twice. And you cannot stop a mistake if you do not remember it. Every tool today tells you what happened to your money. I am building the one that tells you what happened to you.`

**画面要传达的**：全部留白，让字自己说话。脚步是「一步一个脚印」的呼应。

**静态图提示词**
```
SCENE: A nearly empty white frame. Along the lower-left area, a trail of four small flat footprint shapes in light warm grey, evenly spaced, progressing from the left edge toward the centre of the frame. The footprints are simple rounded oval shapes with no toe detail.
The upper two thirds of the frame and the entire right side are completely empty white space.
Nothing else is in the frame.
```

**视频提示词**
```
ANIMATION: The footprints appear one at a time, from the left edge toward the centre, spaced about one second apart, each fading in softly and then staying. After the fourth footprint appears, the frame holds completely still for the remaining seconds with all four footprints visible and the rest of the frame empty white.
```

**后期叠**：四句排比逐句出现在上方留白里；最后一句停住，下方打 GitHub 链接，停留到片尾。

> **备选版本**（如果觉得只有脚印太空）：把之前那个扁平小人放在最后一个脚印上，侧身朝右，静止不动。风险是小人五官在 8 秒里会漂，建议先试脚印版。

---

# 六、后期叠加清单（别漏）

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

# 七、时长缺口怎么补

八段 AI 片段每段 8 秒，合计约 64 秒，全片 168 秒，**缺口约 104 秒**。缺口不需要全靠 AI 补，建议这样填：

| 来源 | 大概能占 | 说明 |
| --- | --- | --- |
| 账本录屏（解锁 → 首页 → 交易页 → `rawText` 代码屏） | 30–40 秒 | 已在 `02` 的待办里 |
| 三张竞品截图（拍 4） | 10–15 秒 | 已在 `02` 的待办里 |
| 纯留白字幕页（拍 8 的四句排比） | 15–20 秒 | 剪辑里做，不用 AI |
| 每段 AI 片段末帧定格 + 缓慢推近 | 每段 3–5 秒 | 剪辑里两秒钟就能做 |

**如果这样还不够，需要第二段 AI 片段的拍次，按这个优先级：拍 6（36 秒，最长）→ 拍 3（23 秒）→ 拍 5（23 秒）。** 这三拍的第二段拍什么，等 v1 定型后在 v2 里展开写。

---

# 八、待办

- [ ] 先只跑**拍 1 的静态图**，确认画风。画风定了再往下生成，别一次跑八张
- [ ] 拍 1 满意的那张图存为「画风样张」，后面每拍出图都传它
- [ ] 确认 Veo / Sora 单次生成的时长上限（本文件按 8 秒写）
- [ ] 试一段图生视频，看扁平风会不会被加纹理、加阴影、五官漂移。**漂了就退回静态图 + 剪辑位移，不要死磕**
- [ ] 拍 6 的冷色气泡出来后，跟前后拍放一起看，确认破例没有割裂感
