# Course Structure Templates

## Template 1: 基礎講座（4セクション構成）

```yaml
course_title: "[トピック]基礎講座"
curriculum:
  - section: "SECTION 1：【導入】[トピック]とは"
    lessons:
      - title: "はじめに：このコースで学ぶこと"
        type: "Video"
      - title: "[トピック]の基本概念"
        type: "Video"

  - section: "SECTION 2：【基礎】基本スキルの習得"
    lessons:
      - title: "スキル1：[基本スキル名]"
        type: "Video"
      - title: "スキル2：[基本スキル名]"
        type: "Video"
      - title: "スキル3：[基本スキル名]"
        type: "Video"

  - section: "SECTION 3：【実践】ハンズオン演習"
    lessons:
      - title: "実演：[具体的な課題]の解決"
        type: "Video"
      - title: "演習：自分で試してみよう"
        type: "Video"

  - section: "SECTION 4：【応用】次のステップ"
    lessons:
      - title: "応用テクニック"
        type: "Video"
      - title: "まとめと今後の学習"
        type: "Video"
```

---

## Template 2: プロンプトエンジニアリング講座

```yaml
course_title: "AIプロンプトエンジニアリング完全講座"
curriculum:
  - section: "SECTION 1：【思考の転換】プロンプトを「書く」から「作らせる」へ"
    lessons:
      - title: "なぜAIにプロンプトを作らせるのか？：発想の転換"
        type: "Video"
      - title: "ゴールシーク・テンプレートの全体像と仕組み"
        type: "Video"

  - section: "SECTION 2：【設計技術】ゴールから逆算する3つのコマンド設計"
    lessons:
      - title: "Command 1: ゴールから「手順(P#)」を自動分解させる方法"
        type: "Video"
      - title: "Command 2: 必要な「変数(Added Variables)」の特定と最適化"
        type: "Video"
      - title: "Command 3: 変数を用いたゴールの再定義（汎用性の向上）"
        type: "Video"

  - section: "SECTION 3：【実践応用】実戦でのプロンプト生成とブラッシュアップ"
    lessons:
      - title: "実演：YouTube台本作成プロンプトの自動生成"
        type: "Video"
      - title: "AIによるプロンプトの微調整と日本語化のコツ"
        type: "Video"

  - section: "SECTION 4：【展開・未来】業務自動化への拡張と次世代ワークフロー"
    lessons:
      - title: "あらゆる業務に応用する：汎用プロンプトへの拡張"
        type: "Video"
      - title: "まとめ：AIゴールシークが変える未来のワークフロー"
        type: "Video"
```

---

## Template 3: ツール習得講座（ステップバイステップ）

```yaml
course_title: "[ツール名]マスター講座"
curriculum:
  - section: "SECTION 1：【準備】環境構築とセットアップ"
    lessons:
      - title: "コース概要と学習ロードマップ"
        type: "Video"
      - title: "[ツール名]のインストールと初期設定"
        type: "Video"
      - title: "基本画面の説明"
        type: "Video"

  - section: "SECTION 2：【基本操作】必須機能の使い方"
    lessons:
      - title: "機能1：[基本機能名]"
        type: "Video"
      - title: "機能2：[基本機能名]"
        type: "Video"
      - title: "機能3：[基本機能名]"
        type: "Video"
      - title: "理解度チェック"
        type: "Quiz"

  - section: "SECTION 3：【中級】効率的なワークフロー"
    lessons:
      - title: "ショートカットとテンプレート活用"
        type: "Video"
      - title: "自動化設定"
        type: "Video"
      - title: "他ツールとの連携"
        type: "Video"

  - section: "SECTION 4：【実践プロジェクト】総合演習"
    lessons:
      - title: "プロジェクト概要と要件"
        type: "Video"
      - title: "ステップ1：[作業名]"
        type: "Video"
      - title: "ステップ2：[作業名]"
        type: "Video"
      - title: "完成と振り返り"
        type: "Video"
```

---

## Template 4: ビジネス戦略講座

```yaml
course_title: "[業界/分野]ビジネス戦略講座"
curriculum:
  - section: "SECTION 1：【市場分析】現状把握と機会発見"
    lessons:
      - title: "[業界]の現状と将来展望"
        type: "Video"
      - title: "競合分析の方法"
        type: "Video"
      - title: "ターゲット顧客の特定"
        type: "Video"

  - section: "SECTION 2：【戦略立案】勝てるポジショニング"
    lessons:
      - title: "差別化戦略の考え方"
        type: "Video"
      - title: "価格戦略とビジネスモデル"
        type: "Video"
      - title: "マーケティング戦略"
        type: "Video"

  - section: "SECTION 3：【実行】具体的なアクションプラン"
    lessons:
      - title: "90日実行計画の作り方"
        type: "Video"
      - title: "KPI設定と進捗管理"
        type: "Video"
      - title: "リソース配分と優先順位"
        type: "Video"

  - section: "SECTION 4：【改善】PDCAサイクルの回し方"
    lessons:
      - title: "データ分析と意思決定"
        type: "Video"
      - title: "失敗からの学びと軌道修正"
        type: "Video"
      - title: "スケール戦略"
        type: "Video"
```

---

## Section Naming Convention

```
SECTION N：【カテゴリ】タイトル

カテゴリ例：
- 【導入】【基礎】【実践】【応用】【発展】
- 【準備】【設計】【実装】【テスト】【運用】
- 【理論】【演習】【プロジェクト】【まとめ】
- 【思考】【技術】【応用】【展開】
```

---

## Lesson Title Patterns

```
導入系:
- はじめに：[トピック]
- [トピック]とは何か
- このセクションで学ぶこと

解説系:
- [概念名]の基本
- [機能名]の使い方
- [手法名]の実践

実演系:
- 実演：[具体的な作業]
- ハンズオン：[課題名]
- デモ：[成果物名]の作成

まとめ系:
- まとめ：[セクション名]の振り返り
- 次のステップ
- コース全体のまとめ
```
