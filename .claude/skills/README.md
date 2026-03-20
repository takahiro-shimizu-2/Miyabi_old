# Miyabi Skills

Miyabiプロジェクト用のClaude Codeスキル集。

## スキル構成

```
.claude/skills/
├── README.md                     ← このファイル
│
├── [Agent Skills]                ← 7 Coding Agents のスキル
│   ├── coordinator-agent/        ← しきるん: タスク分解・DAG構築
│   ├── issue-agent/              ← みつけるん: Issue分析・53ラベル分類
│   ├── code-reviewer/            ← サクラ: コードレビュー・品質スコア
│   ├── pr-agent/                 ← ツバキ: PR作成・Conventional Commits
│   ├── deploy-agent/             ← ボタン: CI/CDデプロイ・ロールバック
│   ├── test-generator/           ← テスト生成
│   └── autonomous-coding-agent/  ← カエデ: 自律コーディング
│
├── [Platform Skills]             ← Miyabiプラットフォーム運用
│   ├── miyabi-pipeline/          ← パイプライン・コマンド合成
│   ├── miyabi-quality-gate/      ← 品質ゲート（80+スコア制御）
│   └── miyabi-github-os/         ← GitHub as OS（53ラベル・状態遷移）
│
├── [Development Skills]          ← 汎用開発スキル
│   ├── commit-helper/            ← Conventional Commits生成
│   ├── refactor-helper/          ← 安全なリファクタリング
│   ├── doc-generator/            ← ドキュメント生成
│   ├── skill-creator/            ← 新規スキル作成
│   └── agent-skill-use/          ← スキル管理・最適化
│
├── [External Skills]             ← 外部サービス連携
│   ├── ccg/                      ← AIコースコンテンツ生成
│   └── teachable-course-creator/ ← Teachableコース管理
│
└── guides/                       ← ナレッジガイド（参照用・非実行）
    ├── typescript-development.md
    ├── mcp-server-development.md
    ├── tdd-workflow.md
    ├── debugging.md
    ├── issue-driven-development.md
    ├── git-workflow.md
    ├── code-review.md
    ├── documentation.md
    ├── security-audit.md
    ├── performance.md
    ├── ci-cd.md
    ├── product-planning.md
    └── market-research.md
```

## Agent Skills (7 Coding Agents)

Miyabiの7つのCoding Agentに対応するスキル。

| Agent | Skill | Role | Authority |
|-------|-------|------|-----------|
| しきるん | [coordinator-agent](./coordinator-agent/) | タスク分解・DAG構築・エージェント連携 | 🔴 統括 |
| みつけるん | [issue-agent](./issue-agent/) | Issue分析・53ラベル自動分類 | 🟢 分析 |
| カエデ | [autonomous-coding-agent](./autonomous-coding-agent/) | コード生成・自律実装 | 🔵 実行 |
| サクラ | [code-reviewer](./code-reviewer/) | コードレビュー・品質スコアリング | 🔵 実行 |
| ツバキ | [pr-agent](./pr-agent/) | PR作成・マージ戦略 | 🔵 実行 |
| ボタン | [deploy-agent](./deploy-agent/) | CI/CDデプロイ・ロールバック | 🔵 実行 |
| テスト | [test-generator](./test-generator/) | テスト生成・カバレッジ | 🔵 実行 |

## Platform Skills

Miyabiプラットフォーム固有の運用スキル。

| Skill | Purpose | Triggers |
|-------|---------|----------|
| [miyabi-pipeline](./miyabi-pipeline/) | コマンド合成 (`\|`, `&&`, `\|\|`, `&`) | "pipeline", "パイプライン" |
| [miyabi-quality-gate](./miyabi-quality-gate/) | 100点スコア・80点ゲート・自動リトライ | "quality", "品質ゲート" |
| [miyabi-github-os](./miyabi-github-os/) | GitHub=OS（53ラベル・状態遷移・Actions） | "github os", "ラベル設定" |

## Development Skills

汎用的な開発ワークフロースキル。

| Skill | Purpose | Triggers |
|-------|---------|----------|
| [commit-helper](./commit-helper/) | Conventional Commits生成 | "commit", "コミット" |
| [refactor-helper](./refactor-helper/) | 安全なリファクタリング | "refactor", "リファクタ" |
| [doc-generator](./doc-generator/) | JSDoc/README/API docs生成 | "document", "ドキュメント" |
| [skill-creator](./skill-creator/) | 新規スキルの作成 | "create skill", "スキル作成" |
| [agent-skill-use](./agent-skill-use/) | スキル管理・最適化 | "manage skills" |

## External Skills

外部サービスとの連携スキル。

| Skill | Purpose | Triggers |
|-------|---------|----------|
| [ccg](./ccg/) | Gemini APIでAIコース生成 | "ccg", "create course" |
| [teachable-course-creator](./teachable-course-creator/) | Teachableコース管理 | "teachable", "コース作成" |

## Knowledge Guides

`guides/` ディレクトリに参照用のベストプラクティスガイドを配置。
実行可能なスキルではなく、知識参照用。

| Category | Guides |
|----------|--------|
| Development | typescript, mcp-server, tdd, debugging |
| Workflow | issue-driven, git, code-review, documentation |
| Quality | security-audit, performance, ci-cd |
| Business | product-planning, market-research |

## Pipeline Integration

```
Issue → [issue-agent] → [coordinator-agent] → [autonomous-coding-agent]
                                                        ↓
                                              [code-reviewer] (80+)
                                                        ↓
                                                  [pr-agent]
                                                        ↓
                                                [deploy-agent]
```

## 使い方

```bash
# スキルは自然言語トリガーで自動起動
claude "review this code"         # → code-reviewer
claude "decompose this issue"     # → coordinator-agent
claude "create PR"                # → pr-agent
claude "deploy to staging"        # → deploy-agent

# Miyabi CLI連携
miyabi agent run codegen --issue=123 --json
miyabi pipeline --preset full-cycle --issue 123 --json
```
