# Installed Skills Summary

当前工作区已安装 **44 个 skills**。

- Matt Pocock skills: **34 个**
- GitNexus skills: **10 个**

安装位置：

```text
/Users/zhuzhen0131/Documents/Codex/2026-06-18/npx-skills-latest-add-mattpocock-skills/.agents/skills
```

> 这些是 **skills**，不是左下角插件列表里的 plugins。重启 Codex 后，可以在提示词里直接点名调用，例如：`用 tdd skill ...`、`用 gitnexus-pr-review skill ...`。

## 快速分类

### 入口与配置

| Skill | 用途 |
| --- | --- |
| `ask-matt` | 帮你判断该用哪个 Matt Pocock skill 或流程。 |
| `setup-matt-pocock-skills` | 为 repo 配置 issue tracker、triage labels、domain docs。 |
| `gitnexus-guide` | 解释 GitNexus 怎么用、有哪些工具和查询方式。 |
| `gitnexus-cli` | 运行 GitNexus CLI，例如索引 repo、生成 wiki、清理索引。 |

### 需求、计划、Issue 流程

| Skill | 用途 |
| --- | --- |
| `to-prd` | 把当前对话整理成 PRD，并发布到 issue tracker。 |
| `to-issues` | 把计划、spec、PRD 拆成可独立领取的 issues。 |
| `triage` | 对 issues 和外部 PR 做分流、补充信息、打标签。 |
| `qa` | 以对话形式做 QA，并把问题整理成 GitHub issues。 |
| `request-refactor-plan` | 通过访谈产出小步提交的重构计划。 |
| `decision-mapping` | 把模糊想法整理成一串调查票据并逐个推进。 |

### 编码、测试、调试、评审

| Skill | 用途 |
| --- | --- |
| `implement` | 根据 PRD 或 issues 实现具体工作。 |
| `tdd` | 用测试驱动方式实现功能或修 bug。 |
| `diagnosing-bugs` | 系统性诊断 bug、报错、性能回退。 |
| `review` | 按标准和需求两条线 review 分支、PR 或 WIP 改动。 |
| `resolving-merge-conflicts` | 处理 git merge/rebase 冲突。 |
| `setup-pre-commit` | 配置 Husky、lint-staged、格式化、类型检查、测试。 |
| `git-guardrails-claude-code` | 给 Claude Code 加危险 git 命令保护钩子。 |
| `migrate-to-shoehorn` | 把测试里的 `as` 类型断言迁移到 `@total-typescript/shoehorn`。 |

### 架构、领域建模、接口设计

| Skill | 用途 |
| --- | --- |
| `codebase-design` | 设计或改进模块接口、寻找更深模块边界。 |
| `domain-modeling` | 梳理领域模型、术语、架构决策。 |
| `ubiquitous-language` | 从对话中提炼 DDD 风格的统一语言词汇表。 |
| `improve-codebase-architecture` | 扫描代码库架构机会并生成可视化报告。 |
| `design-an-interface` | 并行生成多个模块/API 接口设计方案。 |
| `prototype` | 快速做可运行原型或多个 UI 变体。 |

### GitNexus 代码图谱能力

| Skill | 用途 |
| --- | --- |
| `gitnexus-exploring` | 探索代码结构、调用链、执行流程。 |
| `gitnexus-debugging` | 用 GitNexus 辅助追踪 bug 来源。 |
| `gitnexus-impact-analysis` | 分析改动影响面和依赖关系。 |
| `gitnexus-pdg-query` | 查询 PDG、控制依赖、数据依赖。 |
| `gitnexus-pr-review` | 用 GitNexus review PR、风险和测试覆盖。 |
| `gitnexus-pr-swarm-review` | 用多 reviewer swarm 做生产就绪 PR review。 |
| `gitnexus-refactoring` | 辅助安全重命名、抽取、移动、拆分代码。 |
| `gitnexus-taint-analysis` | 分析或扩展 GitNexus 的 taint/CFG/PDG 子系统。 |

### 写作、文档、教学、知识库

| Skill | 用途 |
| --- | --- |
| `teach` | 在当前工作区里教一个新技能或概念。 |
| `handoff` | 把当前对话压缩成给另一个 agent 接手的交接文档。 |
| `edit-article` | 修改文章结构、清晰度和表达。 |
| `writing-fragments` | 通过追问收集写作碎片和原始材料。 |
| `writing-beats` | 把文章组织成逐段推进的 beats。 |
| `writing-shape` | 把 notes、碎片或草稿打磨成文章。 |
| `writing-great-skills` | 编写和改进 skills 的参考原则。 |
| `grilling` | 对计划或设计进行高强度追问。 |
| `grill-me` | 通过访谈打磨计划或设计。 |
| `grill-with-docs` | 边追问边生成 ADR 和 glossary。 |
| `obsidian-vault` | 搜索、创建、整理 Obsidian notes。 |

### 课程与练习

| Skill | 用途 |
| --- | --- |
| `scaffold-exercises` | 创建课程练习目录、题目、答案和解释文件。 |

## 全量清单

```text
ask-matt
codebase-design
decision-mapping
design-an-interface
diagnosing-bugs
domain-modeling
edit-article
git-guardrails-claude-code
gitnexus-cli
gitnexus-debugging
gitnexus-exploring
gitnexus-guide
gitnexus-impact-analysis
gitnexus-pdg-query
gitnexus-pr-review
gitnexus-pr-swarm-review
gitnexus-refactoring
gitnexus-taint-analysis
grill-me
grill-with-docs
grilling
handoff
implement
improve-codebase-architecture
migrate-to-shoehorn
obsidian-vault
prototype
qa
request-refactor-plan
resolving-merge-conflicts
review
scaffold-exercises
setup-matt-pocock-skills
setup-pre-commit
tdd
teach
to-issues
to-prd
triage
ubiquitous-language
writing-beats
writing-fragments
writing-great-skills
writing-shape
```
