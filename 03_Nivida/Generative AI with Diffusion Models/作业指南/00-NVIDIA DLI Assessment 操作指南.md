# NVIDIA DLI Assessment 小白操作指南

日期：2026-08-27

状态：已完成课件、截图和前置章节的静态审查；尚未在 NVIDIA DLI 环境中实际训练和评分

目标：只修改 `06_Assessment.ipynb`，完成训练，通过 Notebook 自动评分，再回课程页生成并下载证书。

参考：[[06|06 Assessment 原始课件]]、[[03_Nivida/Generative AI with Diffusion Models/课件/02|02 Diffusion Models]]、[[04|04 Classifier-Free Diffusion Guidance]]

## 先看结论

- 现有方案中的 **22 个代码填空答案全部正确**，已与 `02`、`04` 课件和用户截图逐项交叉核对。
- 真正需要改代码的只有 **6.2、6.3、6.4、6.5**。6.1 只运行，6.6 只运行评分代码。
- 6.5 的公式是确定的，但最终 `w` 没有一个对所有随机训练都保证通过的固定答案，必须用当前训练出的模型实测。
- Notebook 自动评分要求生成图片被分类器正确识别至少 **95%**；`x_0.shape` 必须是 `[10, 1, 28, 28]`。
- Notebook 评分通过不等于证书已经拿到。通过后还要回课程页点击 `ASSESS TASK`，再打开并下载证书。
- 静态审查只能确认修改位置和答案；最终能否通过，必须以 NVIDIA DLI 环境里的实际输出为准。

## 一眼看懂：每节做什么

| 小节 | 你的动作 | 填空数 | 通过线 |
| --- | --- | ---: | --- |
| 6.1 Dataset | 只运行，不修改 | 0 | 没有红色报错 |
| 6.2 Diffusion | 填公式 | 10 | 图片从清晰逐渐变成噪声 |
| 6.3 U-Net | 改七个类名 | 7 | 七格和创建模型格都运行成功 |
| 6.4 Training | 填训练代码并训练一次 | 4 | 训练完整结束，持续输出 Loss |
| 6.5 Sampling | 填引导公式，测试 `w` | 1 | 0–9 稳定对应，形状正确 |
| 6.6 Assessment | 运行两格评分代码 | 0 | 明确显示通过 |

合计：`10 + 7 + 4 + 1 = 22` 个代码填空。

注意：Notebook 的说明文字里也会出现 `FIXME` 这个词。只检查灰色代码格里的 `FIXME`，不要删除说明文字。

## 开始前：先把环境打开

1. 回 NVIDIA 课程页。
2. 如果实验还没启动，点击 `LAUNCH` 或 `LAUNCH TASK`。
3. 等 JupyterLab 完全打开。
4. 在左侧文件列表双击 `06_Assessment.ipynb`。
5. 确认打开的是 `06_Assessment.ipynb`，不是 `01–05`。
6. 先点一次保存按钮。

运行代码格的方法：

- 点击灰色代码格，再按 `Shift+Enter`。
- 左边显示 `[*]`：正在运行，继续等，不要重复点。
- 左边显示 `[数字]`：这一格已经运行完。
- 出现红色文字：先停下来读报错，不要连续重跑。

重要：保存 Notebook 只会保存代码和页面内容，不会永久保存内存里的已训练模型。训练结束后如果重启 Kernel、关闭实验或点击 `STOP TASK`，通常要重新训练。最好在同一次实验会话里完成：

```text
训练 → 测试 w → Notebook 评分 → 课程页 ASSESS TASK → 下载证书
```

## 第一步：运行 6.1，不改任何内容

1. 找到标题 `6.1 The Dataset`。
2. 从导入库的第一格开始，按顺序运行到设置 `IMG_SIZE`、`BATCH_SIZE` 的代码格。
3. 不要修改这一节的代码。

看到下面这些内容，并且没有红色报错，就可以继续：

```python
IMG_SIZE = 28
IMG_CH = 1
BATCH_SIZE = 128
N_CLASSES = 10
```

## 第二步：修改并运行 6.2

### 2.1 补全扩散参数

1. 找到标题 `6.2 Setting Up Diffusion`。
2. 往下找到从 `a = 1.0 - B` 开始、含有五个 `FIXME` 的代码格。
3. 把这一整格改成下面这样：

```python
a = 1.0 - B
a_bar = torch.cumprod(a, dim=0)
sqrt_a_bar = torch.sqrt(a_bar)
sqrt_one_minus_a_bar = torch.sqrt(1 - a_bar)

# Reverse diffusion variables
sqrt_a_inv = torch.sqrt(1 / a)
pred_noise_coeff = (1 - a) / torch.sqrt(1 - a_bar)
```

4. 保存。
5. 运行这一格。

成功标志：这一格正常结束，没有红色报错。

### 2.2 补全 `q` 的加噪公式

1. 往下找到 `def q(x_0, t):`。
2. 找到这一行：

```python
x_t = FIXME * x_0 + FIXME * noise
```

3. 只把这一行替换为：

```python
x_t = sqrt_a_bar_t * x_0 + sqrt_one_minus_a_bar_t * noise
```

4. 保存并运行这个函数定义格。
5. 再运行它下面画 150 张小图的代码格。

成功标志：左上角的数字比较清楚，越往后越像噪声。图片没有变化或一开始就全是噪声，都说明前面的公式需要重查。

### 2.3 补全 `reverse_q` 的去噪公式

1. 往下找到 `def reverse_q(x_t, t, e_t):`。
2. 找到含有三个 `FIXME` 的两行。
3. 改成：

```python
u_t = sqrt_a_inv_t * (x_t - pred_noise_coeff_t * e_t)

if t[0] == 0:
```

三个填空按顺序就是 `x_t`、`e_t`、`t`。

4. 保存并运行这个函数定义格。

成功标志：运行完成，没有 `NameError` 或 `SyntaxError`。

## 第三步：修改并运行 6.3

1. 找到标题 `6.3 Setting up a U-Net`。
2. 先运行最上面的 `class UNet(nn.Module)` 代码格。
3. 往下会连续看到七个 `class FIXME(nn.Module):`。
4. 只改每一格第一行的类名，不改类里面的任何内容。

按出现顺序替换：

| 第几个 | 把 `FIXME` 改成 | 你在格子里会看到的线索 |
| ---: | --- | --- |
| 1 | `DownBlock` | 内部已经写着 `super(DownBlock, self)` |
| 2 | `EmbedBlock` | 内部已经写着 `super(EmbedBlock, self)` |
| 3 | `GELUConvBlock` | 有 `Conv2d`、`GroupNorm`、`GELU` |
| 4 | `RearrangePoolBlock` | 有 `Rearrange(...)` |
| 5 | `ResidualConvBlock` | 最后把 `x1 + x2` 加起来 |
| 6 | `SinusoidalPositionEmbedBlock` | 使用 `sin()` 和 `cos()` |
| 7 | `UpBlock` | 有 `ConvTranspose2d`，并接收 `x, skip` |

5. 每改完一格就保存，再按 `Shift+Enter` 运行这一格。
6. 七格全部运行后，运行下面创建模型的代码格：

```python
model = UNet(
    T, IMG_CH, IMG_SIZE, down_chs=(64, 64, 128), t_embed_dim=8, c_embed_dim=N_CLASSES
)
print("Num params: ", sum(p.numel() for p in model.parameters()))
model = torch.compile(model.to(device))
```

成功标志：

- 七个类定义格都没有红色报错。
- 创建模型的格显示 `Num params:`。
- `torch.compile(...)` 没有报错。第一次真正使用模型时可能还会继续编译，需要耐心等。

## 第四步：修改并运行 6.4

### 4.1 随机隐藏一部分数字标签

1. 找到标题 `6.4 Model Training`。
2. 找到 `def get_context_mask(c, drop_prob):`。
3. 把含有 `torch.FIXME` 的那一行改成：

```python
c_mask = torch.bernoulli(torch.ones_like(c_hot).float() - drop_prob).to(device)
```

4. 保存并运行这一格。

### 4.2 填入训练误差

1. 找到 `def get_loss(model, x_0, t, *model_args):`。
2. 把最后一行改成：

```python
return F.mse_loss(noise, noise_pred)
```

3. 保存并运行这一格。
4. 继续运行下面的 `sample_images(...)` 函数定义格；它不用修改。

### 4.3 填训练循环的两个空缺

1. 找到以 `optimizer = Adam(...)` 开头的大代码格。
2. 把：

```python
c_drop_prob = FIXME
```

改成：

```python
c_drop_prob = 0.1
```

3. 再把：

```python
c_hot, c_mask = get_context_mask(FIXME, c_drop_prob)
```

改成：

```python
c_hot, c_mask = get_context_mask(batch[1], c_drop_prob)
```

4. 不要改 `epochs = 5`、`lr=0.001`、`BATCH_SIZE = 128`。
5. 先保存，但先别急着运行训练。

### 4.4 训练前最后检查

从 6.2 开始向下检查所有灰色代码格：

- 6.2 没有代码填空。
- 6.3 七个 `class FIXME` 都已改名。
- 6.4 四个填空都已完成。
- 说明文字里的 `FIXME` 不用管。

确认后再回到训练格，按一次 `Shift+Enter`。

训练时：

- 出现 `[*]` 是正常的。
- 会持续看到 `Epoch ... | Step ... | Loss: ...`。
- 中间会生成数字预览。
- 不要因为暂时没输出就重复运行。
- 不要在训练中点击重启、停止实验或再次运行训练格。

成功标志：五轮训练完整结束，左边从 `[*]` 变成 `[数字]`，没有红色报错。Loss 不要求每一行都下降。

## 第五步：修改 6.5，并选择最稳的 `w`

### 5.1 补全唯一的公式

1. 找到标题 `6.5 Sampling`。
2. 找到 `def sample_w(model, c, w):`。
3. 找到：

```python
e_t = FIXME
```

4. 替换为：

```python
e_t = (1 + w) * e_t_keep_c - w * e_t_drop_c
```

5. 保存并运行这个函数定义格。

### 5.2 检查输出形状

1. 找到以 `model.eval()` 开头的测试格。
2. 先把 `w = 0.0` 改成 `w = 0.5`。
3. 运行整格，等待 0–9 十张图片出现。
4. 运行下一格 `x_0.shape`。

必须看到：

```python
torch.Size([10, 1, 28, 28])
```

如果形状不是这个值，不要进入 6.6。

### 5.3 不要凭一张图决定 `w`

生成过程有随机性。按下面顺序测试：

```text
0.5 → 1.0 → 2.0
```

每个值这样测试：

1. 只修改测试格里的 `w = ...`。
2. 连续运行整个测试格 3 次。
3. 每次都看从左到右是否对应 0、1、2、3、4、5、6、7、8、9。
4. 记下哪个值最稳定。

通过线：

- 最好连续三次都是 10 个位置全部对应。
- 只要某次明显认错一个数字，就说明这个 `w` 仍有风险，因为 10 张里错 1 张只有 90%。
- 如果 1.0 和 2.0 表现接近，可以再试 1.5。
- 如果所有 `w` 都很差，不要继续盲试；先回头检查训练是否完整、公式是否填错。

选好后，把测试格里的 `w` 保留为最佳值，再运行一次测试格和 `x_0.shape`。

## 第六步：运行 6.6 自动评分

### 6.1 评分前检查表

| 检查项 | 必须看到 |
| --- | --- |
| Notebook | 已保存 |
| Kernel | 正常连接，不是 `Connecting` |
| 代码填空 | 22 个代码 `FIXME` 全部消失 |
| 训练 | 五轮已经完整结束 |
| 模型状态 | `model.eval()` 已运行 |
| 名字 | 仍叫 `model`、`sample_w`、`w` |
| 形状 | `torch.Size([10, 1, 28, 28])` |
| 稳定性 | 最终 `w` 连续生成多次都稳定对应 0–9 |

### 6.2 正式运行评分

1. 找到标题 `6.6 Run the Assessment`。
2. 运行第一格：

```python
from run_assessment import run_assessment
```

3. 第一格无报错后，再运行第二格：

```python
run_assessment(model, sample_w, w)
```

4. 等待评分完成，不要重复点击。

结果处理：

- 明确显示通过：进入下一步。
- 接近 95% 但没通过：回 6.5 换下一个候选 `w`，先连续生成几次确认，再重新评分。
- 差距很大：先检查 22 个填空、训练是否完整和图片是否真的对应；不要连续提交碰运气。
- 出现报错：保存完整报错内容，先按“出错分流”处理。

## 第七步：回课程页生成证书

只有 Notebook 评分明确通过后才做：

1. 保存 Notebook。
2. 回 NVIDIA 课程页面。
3. 找到并点击 `ASSESS TASK`，不要点错 `STOP TASK`。
4. 等课程页刷新成绩。
5. 如果课程页还显示单独的总成绩通过线，以当前页面为准；不要把 Notebook 的 95% 和课程总成绩混成一个数字。
6. 打开出现的证书入口。
7. 下载证书。
8. 确认电脑上确实存在证书文件。
9. 最后再点击 `STOP TASK`。

只有证书已经打开并成功下载，本次目标才算真正完成。

## 出错分流

| 现象 | 先做什么 | 不要做什么 |
| --- | --- | --- |
| `NameError` | 检查上面的格是否漏跑；必要时从 6.1 顺序补跑 | 不要随便改变量名 |
| `SyntaxError` | 检查括号、冒号和缩进 | 不要整段乱删 |
| `CUDA out of memory` | 停止继续运行，保存完整报错 | 不要反复运行训练格 |
| `[*]` 很久 | 先判断是否在训练或首次编译 | 不要重复点运行 |
| Kernel 重启 | 从 6.1 顶部重新运行；模型要重新训练 | 不要相信页面上的旧输出 |
| 图片形状不对 | 重查 `sample_w` 和前面变量 | 不要运行 Assessment |
| 图片清楚但类别错 | 调整 `w`，每个值多试几次 | 不要只看一次 |
| 评分接近但未过 | 换候选 `w`，先预览再重试 | 不要先重训 |
| 评分差很多 | 重查填空和训练是否完整 | 不要连续评分碰运气 |

## 不要做的事

- 不修改或提交 `01–05`。
- 不修改 `T`、Beta 范围、图片大小、类别数、Batch Size、学习率和训练轮数。
- 不把 `model`、`sample_w`、`w` 改成其他名字。
- 不删除课件说明文字中的 `FIXME`。
- 不在训练过程中重复运行训练格。
- 不在 Notebook 评分通过前点击 `ASSESS TASK`。
- 不在证书生成前点击 `STOP TASK`。
- 不在没有实际评分证据时声称已经通过或已经取得证书。
