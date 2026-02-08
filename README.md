# REMLViewer

**RDB Schema Visualizer** - A design document viewer that renders relational database schemas beautifully.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

[English](#english) | [日本語](#日本語)

---

## English

### What is REML?

**REML** = **Relational Entity Modeling Language**

REML is a YAML-based schema definition format for relational databases. REMLViewer transforms YAML schema definitions into clear, visual documentation for RDB structures.

### Features

- **Visual Schema Rendering** - Transform YAML definitions into readable design documents
- **File Upload & Paste** - Import schemas via file upload or direct paste
- **Multi-Database Support** - PostgreSQL, MySQL, MariaDB, SQLite, SQL Server, Oracle
- **Bilingual UI** - English and Japanese support

### Quick Start

```bash
# Clone the repository
git clone https://github.com/remlviewer-developer/reml-viewer.git
cd reml-viewer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### REML Schema Example

```yaml
reml: "1.0"
database: postgresql
metadata:
  name: My App
  description: Sample application schema

enums:
  user_role:
    values: [user, admin, moderator]

tables:
  users:
    description: User accounts
    columns:
      id:
        type: uuid
        primaryKey: true
        default: gen_random_uuid()
      email:
        type: varchar
        length: 255
        nullable: false
        unique: true
      role:
        type: varchar
        enumRef: user_role
        default: "user"
      created_at:
        type: timestamptz
        nullable: false
        default: now()

  posts:
    description: Blog posts
    columns:
      id:
        type: uuid
        primaryKey: true
      title:
        type: varchar
        length: 200
        nullable: false
      author_id:
        type: uuid
        nullable: false
    foreignKeys:
      - columns: author_id
        references:
          table: users
          columns: id
        onDelete: CASCADE
```

### Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

### Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### License

Apache License 2.0 - see [LICENSE](LICENSE) for details.

---

## 日本語

### REMLとは？

**REML** = **Relational Entity Modeling Language**

REMLはリレーショナルデータベース向けのYAMLベースのスキーマ定義フォーマットです。REMLViewerはYAMLスキーマ定義を、わかりやすいビジュアルドキュメントに変換します。

### 機能

- **ビジュアルスキーマレンダリング** - YAML定義を読みやすいドキュメントに変換
- **ファイルアップロード＆ペースト** - ファイルアップロードまたは直接ペーストでスキーマをインポート
- **マルチデータベースサポート** - PostgreSQL、MySQL、MariaDB、SQLite、SQL Server、Oracle
- **バイリンガルUI** - 英語・日本語対応

### クイックスタート

```bash
# リポジトリをクローン
git clone https://github.com/remlviewer-developer/reml-viewer.git
cd reml-viewer

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### REMLスキーマの例

```yaml
reml: "1.0"
database: postgresql
metadata:
  name: マイアプリ
  description: サンプルアプリケーションスキーマ

enums:
  user_role:
    values: [user, admin, moderator]

tables:
  users:
    description: ユーザーアカウント
    columns:
      id:
        type: uuid
        primaryKey: true
        default: gen_random_uuid()
      email:
        type: varchar
        length: 255
        nullable: false
        unique: true
      role:
        type: varchar
        enumRef: user_role
        default: "user"
      created_at:
        type: timestamptz
        nullable: false
        default: now()

  posts:
    description: ブログ投稿
    columns:
      id:
        type: uuid
        primaryKey: true
      title:
        type: varchar
        length: 200
        nullable: false
      author_id:
        type: uuid
        nullable: false
    foreignKeys:
      - columns: author_id
        references:
          table: users
          columns: id
        onDelete: CASCADE
```

### 技術スタック

- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **デプロイ**: Vercel

### 開発

```bash
npm run dev          # 開発サーバー起動
npm run build        # 本番用ビルド
npm run lint         # ESLint実行
npm run format       # Prettierでフォーマット
```

### コントリビューション

コントリビューションを歓迎します！お気軽にPull Requestを送ってください。

### ライセンス

Apache License 2.0 - 詳細は[LICENSE](LICENSE)をご覧ください。

---

Made with passion for better RDB documentation.
