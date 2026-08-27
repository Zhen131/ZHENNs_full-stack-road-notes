# NVIDIA DLI Assessment 操作指南

日期：2026-08-27

状态：已完成静态审查，尚未在 NVIDIA DLI 实验环境中实跑最终 Assessment

目标：只操作 `06_Assessment.ipynb`，按课程原始要求完成代码、训练模型、通过自动评分并领取证书。

相关材料：[[03_Nivida/课件/06|06 Assessment 原始课件]]、[[03_Nivida/课件/02|02 Diffusion Models]]、[[03_Nivida/课件/03|03 Optimizations]]、[[03_Nivida/课件/04|04 Classifier-Free Diffusion Guidance]]

## 结论

- 正式作业全部在 `06_Assessment.ipynb` 中完成。
- `01–05` 不需要提交；遇到不确定的填空时，只把它们作为参考答案来源。
- `06` 有 **22 个代码填空**，另有一个需要根据生成效果调整的 `w`。课件说明文字里仍会出现 `FIXME`，那些文字不用删除。
- 真正需要改代码的只有 **6.2、6.3、6.4、6.5**；6.1 只运行，6.6 只在准备好后运行评分代码。
- 先补全并保存，再从顶部逐格运行。不要运行仍含 `FIXME` 的代码格。
- Notebook 内的 `run_assessment(...)` 明确通过后，才能回课程页点击 `ASSESS TASK`。
- 自动分类器必须正确识别至少 95% 的生成图片；输出形状必须是 `[10, 1, 28, 28]`。
- 当前结论来自课件、截图和前面章节的静态交叉核对；最终能否通过仍必须以 NVIDIA DLI 环境中的实际训练和评分结果为准。

## 审查结论：每一节到底要不要改

| 小节 | 要做什么 | 审查结果 | 主要证据 |
| --- | --- | --- | --- |
| 6.1 Dataset | 只运行，不修改 | 正确 | 截图和 `06.md` 中没有代码填空 |
| 6.2 Diffusion | 填 10 处 | 正确 | `02` 课件给出了相同的累计乘积、平方根、加噪和去噪公式 |
| 6.3 U-Net | 填 7 个类名 | 正确 | 每个类内部的 `super(...)`、卷积、重排和跳连结构能唯一对应类名 |
| 6.4 Training | 填 4 处 | 正确 | `04` 课件给出了 `bernoulli`、`0.1` 和 `batch[1]`；噪声预测使用均方误差 |
| 6.5 Sampling | 填 1 个公式并试 `w` | 公式正确，`w` 不能预先保证 | `04` 课件明确给出 `(1 + w) * keep - w * drop`，并要求比较多个 `w` |
| 6.6 Assessment | 不改代码，只运行两格 | 正确 | 截图和 `06.md` 都是导入后调用 `run_assessment(model, sample_w, w)` |

## 1. JupyterLab 按钮与运行标志

| 标志 / 按钮 | 含义                       | 本次使用规则                      |
| ------- | ------------------------ | --------------------------- |
| 保存      | 保存 Notebook 并建立检查点       | 修改一组 `FIXME` 后保存一次          |
| `+`     | 在当前格下方添加新格               | 本作业不需要使用                    |
| 剪刀      | 剪切选中的整格                  | 避免使用，防止误删题目                 |
| 复制 / 粘贴 | 复制或粘贴整格                  | 通常不需要；不要复制出重复训练格            |
| ▶ 运行    | 运行当前格并移动到下一格             | 与 `Shift+Enter` 等效，是主要操作    |
| ■ 中断    | 强制停止正在运行的代码              | 只在明显卡死或需要停止训练时使用；它不是普通暂停    |
| ↻ 重启    | 重启 Python Kernel（内核）     | 会清空变量、模型和训练结果；非必要不要点        |
| 快进      | 重启 Kernel 后从头运行全部格       | 只有全部代码确认正确时才可使用；首次执行仍建议逐格运行 |
| `[ ]`   | 这一格尚未运行                  | 正常的初始状态                     |
| `[*]`   | 这一格正在运行                  | 等待完成；不要重复点击运行               |
| `[数字]`  | 已运行，数字代表本次 Kernel 中的执行顺序 | 不是分数，也不保证逻辑正确               |

补充规则：

- 代码报错时会显示红色信息。先完整读取报错，不要连续重跑。
- Kernel 重启后，旧输出可能仍显示在页面上，但内存里的变量已经消失，必须从顶部重新运行。
- 训练格耗时较长，出现 `[*]` 属于正常现象。

## 2. 正式执行顺序

1. 在 NVIDIA 课程页点击 `START` / `LAUNCH`，等待新实验环境启动。
2. 打开 `06_Assessment.ipynb`。
3. 按本指南补齐全部 `FIXME`，保存 Notebook。
4. 从最顶部开始，用 `Shift+Enter` 一格一格运行。
5. 每一节达到本指南的成功标志后，再进入下一节。
6. 完成训练后调整 `w`，生成 0–9，并确认形状为 `[10, 1, 28, 28]`。
7. 最终提交前先检查模型输出；确认形状正确，并用同一个候选 `w` 连续生成几次都较稳定后，再运行 `run_assessment(...)`。
8. Notebook 明确显示通过后，回课程页点击 `ASSESS TASK`。
9. 课程页显示通过且证书可领取后，下载证书。
10. 领取并下载证书后，确认 Notebook 保存完成，再点击 `STOP TASK`。

重要：保存 Notebook 只会保存代码和页面内容，不会把内存里的已训练模型永久保存下来。训练完成后如果重启 Kernel、关闭实验环境或点击 `STOP TASK`，通常需要重新训练。因此最好在同一次实验会话里完成“训练 → 调整 `w` → Notebook 评分 → 课程页 `ASSESS TASK`”。

## 3. 6.1 Dataset：只运行，不修改

定位：`## 6.1 The Dataset`。

操作：

- 按顺序运行导入库、设置 `device`、加载 MNIST 和设置图片参数的代码格。
- 不修改这部分代码。

成功标志：

- 没有红色报错。
- `IMG_SIZE = 28`、`IMG_CH = 1`、`N_CLASSES = 10` 已成功执行。

## 4. 6.2 Diffusion：补齐加噪和去噪

### 4.1 扩散参数

定位：本地课件 `06.md` 第 141–153 行附近，搜索 `a_bar = FIXME`。

替换为：

```python
a = 1.0 - B
a_bar = torch.cumprod(a, dim=0)
sqrt_a_bar = torch.sqrt(a_bar)
sqrt_one_minus_a_bar = torch.sqrt(1 - a_bar)

sqrt_a_inv = torch.sqrt(1 / a)
pred_noise_coeff = (1 - a) / torch.sqrt(1 - a_bar)
```

### 4.2 `q`：正向加噪

定位：搜索 `def q(x_0, t)`，找到 `x_t = FIXME`。

替换该行为：

```python
x_t = sqrt_a_bar_t * x_0 + sqrt_one_minus_a_bar_t * noise
```

成功标志：运行后显示的数字图片应从清晰逐步变成噪声，而不是一开始就报错或始终完全相同。

### 4.3 `reverse_q`：反向去噪一步

定位：搜索 `def reverse_q(x_t, t, e_t)`。

替换为：

```python
u_t = sqrt_a_inv_t * (x_t - pred_noise_coeff_t * e_t)

if t[0] == 0:
```

这里三个 `FIXME` 依次是：`x_t`、`e_t`、`t`。

成功标志：函数定义格运行完成，没有 `NameError` 或语法错误。

## 5. 6.3 U-Net：恢复七个模块名称

定位：`## 6.3 Setting up a U-Net`，搜索连续出现的 `class FIXME(nn.Module)`。

按出现顺序，将七个 `FIXME` 替换为：

| 顺序 | 正确类名 | 识别线索 |
| --- | --- | --- |
| 1 | `DownBlock` | 包含两个卷积块和 `RearrangePoolBlock`，负责缩小图片 |
| 2 | `EmbedBlock` | 包含 `Linear` 和 `Unflatten`，负责转换时间或类别信息 |
| 3 | `GELUConvBlock` | 包含 `Conv2d`、`GroupNorm`、`GELU` |
| 4 | `RearrangePoolBlock` | 包含 `Rearrange(...)` |
| 5 | `ResidualConvBlock` | 结尾是 `x1 + x2` |
| 6 | `SinusoidalPositionEmbedBlock` | 使用 `sin()`、`cos()` 表示时间 |
| 7 | `UpBlock` | 包含 `ConvTranspose2d`，并接收 `x, skip` |

只替换 `class FIXME` 中的名称，不改变这些类的内部代码。

成功标志：

- 七个类定义格全部运行成功。
- 创建 `model = UNet(...)` 的格能够显示参数数量。
- `torch.compile(model.to(device))` 没有报错。

## 6. 6.4 Model Training：补齐训练代码

### 6.1 随机隐藏类别标签

定位：搜索 `c_mask = torch.FIXME`。

替换为：

```python
c_mask = torch.bernoulli(torch.ones_like(c_hot).float() - drop_prob).to(device)
```

### 6.2 计算训练误差

定位：搜索 `return F.FIXME(noise, noise_pred)`。

替换为：

```python
return F.mse_loss(noise, noise_pred)
```

### 6.3 训练循环的两个空缺

定位：搜索 `c_drop_prob = FIXME` 和 `get_context_mask(FIXME, c_drop_prob)`。

替换为：

```python
c_drop_prob = 0.1
```

以及：

```python
c_hot, c_mask = get_context_mask(batch[1], c_drop_prob)
```

运行训练格前必须先保存。运行后不要重复点击。

成功标志：

- 输出持续出现 `Epoch ... | Step ... | Loss: ...`。
- 没有显存不足、变量不存在或形状不匹配错误。
- `Loss` 不需要每次都下降，但总体应处于可训练状态，并能看到数字预览逐渐成形。

## 7. 6.5 Sampling：补齐引导公式并调整 `w`

### 7.1 引导公式

定位：搜索 `e_t = FIXME`。

替换为：

```python
e_t = (1 + w) * e_t_keep_c - w * e_t_drop_c
```

### 7.2 调整 `w`

定位：搜索：

```python
w = 0.0  # Change me
```

`w` 没有保证一次成功的固定值。课程示例比较过正负多个值，并说明较大的正值通常更能保持类别一致，但过大也不一定更好。为了提高通过概率，建议依次测试：

```text
0.5 → 1.0 → 2.0
```

每个值至少生成 3 次。每次只修改 `w`，重新运行设置 `w`、生成图片和形状检查相关的格；不需要重新训练模型。选出“0–9 与位置对应、连续几次都最稳定”的值作为最终 `w`。`w = 0.0` 可以看基线效果，但不应因为某一次图片好看就直接认定能达到 95%。

成功标志：

- 一行显示 0–9 十张图片。
- 大多数数字肉眼清晰，并与位置对应的类别一致。
- 运行 `x_0.shape` 得到：

```python
torch.Size([10, 1, 28, 28])
```

## 8. 6.6 Assessment：最终提交门

定位：`## 6.6 Run the Assessment`。

提交前检查：

| 检查项 | 必须满足 |
| --- | --- |
| Notebook 保存 | 已保存，无未保存标志 |
| Kernel | 正常连接，不是 `Connecting` |
| 全部填空 | 所有代码格都没有 `FIXME`；说明文字中的 `FIXME` 可以保留 |
| 模型 | 已完成训练，`model.eval()` 已运行 |
| 变量名 | 仍为 `model`、`sample_w`、`w` |
| 输出形状 | `[10, 1, 28, 28]` |
| 图片 | 0–9 大多数肉眼可识别 |
| 稳定性 | 同一个候选 `w` 连续生成几次，0–9 都较稳定且位置对应 |

全部检查通过后运行：

```python
from run_assessment import run_assessment
```

然后运行：

```python
run_assessment(model, sample_w, w)
```

判断规则：

- 只有评分输出明确表示通过，才能进入课程页提交。
- 如果接近但没有达到 95%，优先只调整 `w`，重新生成几次确认稳定后再重试。
- 如果差距较大，检查训练是否完整、图片是否清楚、是否填错公式；不要盲目连续提交。

## 9. 课程页与证书

按钮名称是 `ASSESS TASK`，不是 `ACCESS TASK`。

流程：

1. Notebook 内部评分明确通过。
2. 回 NVIDIA 课程页点击 `ASSESS TASK`。
3. 确认课程成绩达到通过线。
4. 确认证书入口实际出现。
5. 下载证书并确认本地文件存在。

只有第 5 步完成，今天的证书目标才算完成。

## 10. 出错处理

- `[*]` 长时间不结束：先判断是否正在训练；训练过程中不要重复运行。
- `NameError`：通常是上面的格没有运行或 Kernel 已重启，从顶部补跑依赖格。
- `SyntaxError`：检查替换 `FIXME` 时是否删掉括号、逗号或缩进。
- `CUDA out of memory`：停止继续运行，记录完整报错，再决定是否重启 Kernel；重启会丢失已训练模型。
- Assessment 未通过：保存评分结果和生成图片，先判断是 `w`、训练不足还是代码错误。

## 11. 本次边界

- 不修改或提交 `01–05`。
- 不复制幻灯片或 PDF。
- 不在没有证据时声称通过。
- 不在 Notebook 内部评分通过前点击 `ASSESS TASK`。
- 不在未保存时停止实验任务。
