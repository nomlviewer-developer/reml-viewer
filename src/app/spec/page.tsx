'use client';

import { Header } from '@/components/ui/Header';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-zinc-800 dark:bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm leading-relaxed">
      {children}
    </pre>
  );
}

function PropTable({
  rows,
}: {
  rows: { name: string; type: string; required: boolean; desc: string }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-100 dark:bg-zinc-800">
            <th className="text-left px-4 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
              Property
            </th>
            <th className="text-left px-4 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
              Type
            </th>
            <th className="text-left px-4 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
              Required
            </th>
            <th className="text-left px-4 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {rows.map((row) => (
            <tr key={row.name}>
              <td className="px-4 py-2 font-mono text-emerald-600 dark:text-emerald-400">
                {row.name}
              </td>
              <td className="px-4 py-2 font-mono text-amber-600 dark:text-amber-400 text-xs">
                {row.type}
              </td>
              <td className="px-4 py-2">
                {row.required ? (
                  <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-xs font-medium">
                    Yes
                  </span>
                ) : (
                  <span className="text-zinc-400 text-xs">No</span>
                )}
              </td>
              <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300">
                {row.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SpecPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">
            REML {t('Specification', '仕様書')}
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-300">
            Relational Entity Modeling Language v1.0
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            {t(
              'A YAML-based specification for describing relational database schemas.',
              'リレーショナルデータベーススキーマを記述するためのYAMLベースの仕様です。'
            )}
          </p>
        </section>

        {/* Table of Contents */}
        <section className="mb-12 p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-3">
            {t('Table of Contents', '目次')}
          </h2>
          <nav className="space-y-1 text-sm">
            {[
              { href: '#root', label: t('Root Schema', 'ルートスキーマ') },
              { href: '#metadata', label: t('Metadata', 'メタデータ') },
              { href: '#tables', label: t('Tables', 'テーブル') },
              { href: '#columns', label: t('Columns', 'カラム') },
              { href: '#foreign-keys', label: t('Foreign Keys', '外部キー') },
              { href: '#indexes', label: t('Indexes', 'インデックス') },
              { href: '#constraints', label: t('Constraints', '制約') },
              { href: '#enums', label: t('Enums', '列挙型') },
              { href: '#views', label: t('Views', 'ビュー') },
              { href: '#data-types', label: t('Data Types', 'データ型') },
              { href: '#validation', label: t('Validation', 'バリデーション') },
              { href: '#full-example', label: t('Full Example', '完全なサンプル') },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </section>

        {/* Root Schema */}
        <section id="root" className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('Root Schema', 'ルートスキーマ')}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 mb-4">
            {t(
              'The top-level structure of a REML document.',
              'REMLドキュメントのトップレベル構造です。'
            )}
          </p>
          <PropTable
            rows={[
              {
                name: 'reml',
                type: 'string',
                required: true,
                desc: t('REML specification version (e.g. "1.0")', 'REML仕様バージョン（例: "1.0"）'),
              },
              {
                name: 'database',
                type: 'string',
                required: true,
                desc: t(
                  'Target database: postgresql, mysql, mariadb, sqlite, sqlserver, oracle',
                  '対象DB: postgresql, mysql, mariadb, sqlite, sqlserver, oracle'
                ),
              },
              {
                name: 'description',
                type: 'string',
                required: false,
                desc: t('Schema description', 'スキーマの説明'),
              },
              {
                name: 'updatedAt',
                type: 'string',
                required: false,
                desc: t('Last updated date', '最終更新日'),
              },
              {
                name: 'metadata',
                type: 'Metadata',
                required: false,
                desc: t('Schema metadata (name, author, etc.)', 'スキーマのメタデータ（名前、著者など）'),
              },
              {
                name: 'enums',
                type: 'Record<string, Enum>',
                required: false,
                desc: t('Enum type definitions', '列挙型の定義'),
              },
              {
                name: 'tables',
                type: 'Record<string, Table>',
                required: true,
                desc: t('Table definitions (at least one required)', 'テーブル定義（1つ以上必須）'),
              },
              {
                name: 'views',
                type: 'Record<string, View>',
                required: false,
                desc: t('View definitions', 'ビュー定義'),
              },
            ]}
          />
          <div className="mt-4">
            <CodeBlock>
              {`reml: "1.0"
database: postgresql
description: My application database
updatedAt: "2025-01-01"
metadata:
  name: My App
  author: Team
tables:
  # ...`}
            </CodeBlock>
          </div>
        </section>

        {/* Metadata */}
        <section id="metadata" className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('Metadata', 'メタデータ')}
          </h2>
          <PropTable
            rows={[
              {
                name: 'name',
                type: 'string',
                required: true,
                desc: t('Schema/project name', 'スキーマ・プロジェクト名'),
              },
              {
                name: 'description',
                type: 'string',
                required: false,
                desc: t('Detailed description', '詳細な説明'),
              },
              {
                name: 'author',
                type: 'string',
                required: false,
                desc: t('Author name', '著者名'),
              },
              {
                name: 'version',
                type: 'string',
                required: false,
                desc: t('Schema version', 'スキーマバージョン'),
              },
            ]}
          />
          <div className="mt-4">
            <CodeBlock>
              {`metadata:
  name: Blog Application
  description: A comprehensive blog platform schema
  author: Development Team
  version: "2.0"`}
            </CodeBlock>
          </div>
        </section>

        {/* Tables */}
        <section id="tables" className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('Tables', 'テーブル')}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 mb-4">
            {t(
              'Each key under tables becomes the table name.',
              'tables配下の各キーがテーブル名になります。'
            )}
          </p>
          <PropTable
            rows={[
              {
                name: 'label',
                type: 'string',
                required: false,
                desc: t('Logical name (e.g. Japanese name)', '論理名（例：日本語名）'),
              },
              {
                name: 'description',
                type: 'string',
                required: false,
                desc: t('Table description', 'テーブルの説明'),
              },
              {
                name: 'schema',
                type: 'string',
                required: false,
                desc: t('DB schema name (e.g. "public")', 'DBスキーマ名（例: "public"）'),
              },
              {
                name: 'columns',
                type: 'Record<string, Column>',
                required: true,
                desc: t('Column definitions (at least one required)', 'カラム定義（1つ以上必須）'),
              },
              {
                name: 'primaryKey',
                type: 'string | string[]',
                required: false,
                desc: t('Composite primary key columns', '複合主キーのカラム名'),
              },
              {
                name: 'foreignKeys',
                type: 'ForeignKey[]',
                required: false,
                desc: t('Foreign key definitions', '外部キー定義'),
              },
              {
                name: 'uniqueConstraints',
                type: 'UniqueConstraint[]',
                required: false,
                desc: t('Unique constraint definitions', 'ユニーク制約定義'),
              },
              {
                name: 'checkConstraints',
                type: 'CheckConstraint[]',
                required: false,
                desc: t('Check constraint definitions', 'チェック制約定義'),
              },
              {
                name: 'indexes',
                type: 'Index[]',
                required: false,
                desc: t('Index definitions', 'インデックス定義'),
              },
            ]}
          />
          <div className="mt-4">
            <CodeBlock>
              {`tables:
  users:
    label: ユーザー
    description: User accounts
    columns:
      id:
        type: uuid
        primaryKey: true
      email:
        type: varchar
        length: 255
    indexes:
      - name: idx_users_email
        columns: [email]
        unique: true

  # Composite primary key example
  post_tags:
    label: 投稿タグ
    primaryKey: [post_id, tag_id]
    columns:
      post_id:
        type: uuid
      tag_id:
        type: integer`}
            </CodeBlock>
          </div>
        </section>

        {/* Columns */}
        <section id="columns" className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('Columns', 'カラム')}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 mb-4">
            {t(
              'Each key under columns becomes the column name.',
              'columns配下の各キーがカラム名になります。'
            )}
          </p>
          <PropTable
            rows={[
              {
                name: 'type',
                type: 'string',
                required: true,
                desc: t('SQL data type (see Data Types section)', 'SQLデータ型（データ型セクション参照）'),
              },
              {
                name: 'label',
                type: 'string',
                required: false,
                desc: t('Logical name', '論理名'),
              },
              {
                name: 'description',
                type: 'string',
                required: false,
                desc: t('Column description', 'カラムの説明'),
              },
              {
                name: 'nullable',
                type: 'boolean',
                required: false,
                desc: t('Allow NULL (default: true)', 'NULL許可（デフォルト: true）'),
              },
              {
                name: 'default',
                type: 'any',
                required: false,
                desc: t('Default value or function (e.g. now())', 'デフォルト値または関数（例: now()）'),
              },
              {
                name: 'example',
                type: 'any',
                required: false,
                desc: t('Example value for documentation', 'ドキュメント用のサンプル値'),
              },
              {
                name: 'primaryKey',
                type: 'boolean',
                required: false,
                desc: t('Mark as primary key', '主キーとして指定'),
              },
              {
                name: 'autoIncrement',
                type: 'boolean',
                required: false,
                desc: t('Auto-increment (SERIAL, AUTO_INCREMENT)', '自動採番（SERIAL, AUTO_INCREMENT）'),
              },
              {
                name: 'unique',
                type: 'boolean',
                required: false,
                desc: t('Unique constraint', 'ユニーク制約'),
              },
              {
                name: 'length',
                type: 'number',
                required: false,
                desc: t('Character length for varchar/char', 'varchar/charの文字長'),
              },
              {
                name: 'precision',
                type: 'number',
                required: false,
                desc: t('Precision for decimal/numeric', 'decimal/numericの精度'),
              },
              {
                name: 'scale',
                type: 'number',
                required: false,
                desc: t('Scale for decimal/numeric', 'decimal/numericのスケール'),
              },
              {
                name: 'enumRef',
                type: 'string',
                required: false,
                desc: t('Reference to an enum definition', '列挙型定義への参照'),
              },
              {
                name: 'arrayOf',
                type: 'string',
                required: false,
                desc: t('Array element type (PostgreSQL)', '配列の要素型（PostgreSQL）'),
              },
              {
                name: 'validation',
                type: 'Validation',
                required: false,
                desc: t('Validation rules', 'バリデーションルール'),
              },
            ]}
          />
          <div className="mt-4">
            <CodeBlock>
              {`columns:
  id:
    type: uuid
    label: ユーザーID
    primaryKey: true
    default: gen_random_uuid()
    description: Unique user identifier
  email:
    type: varchar
    label: メールアドレス
    length: 255
    nullable: false
    unique: true
    example: "user@example.com"
  price:
    type: decimal
    precision: 10
    scale: 2
  role:
    type: integer
    enumRef: user_role
    default: 1
  tags:
    type: array
    arrayOf: varchar`}
            </CodeBlock>
          </div>
        </section>

        {/* Foreign Keys */}
        <section id="foreign-keys" className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('Foreign Keys', '外部キー')}
          </h2>
          <PropTable
            rows={[
              {
                name: 'columns',
                type: 'string | string[]',
                required: true,
                desc: t('Source column(s)', '参照元カラム'),
              },
              {
                name: 'references.table',
                type: 'string',
                required: true,
                desc: t('Referenced table name', '参照先テーブル名'),
              },
              {
                name: 'references.columns',
                type: 'string | string[]',
                required: true,
                desc: t('Referenced column(s)', '参照先カラム'),
              },
              {
                name: 'onDelete',
                type: 'string',
                required: false,
                desc: 'CASCADE | SET NULL | SET DEFAULT | RESTRICT | NO ACTION',
              },
              {
                name: 'onUpdate',
                type: 'string',
                required: false,
                desc: 'CASCADE | SET NULL | SET DEFAULT | RESTRICT | NO ACTION',
              },
              {
                name: 'description',
                type: 'string',
                required: false,
                desc: t('FK description', '外部キーの説明'),
              },
            ]}
          />
          <div className="mt-4">
            <CodeBlock>
              {`foreignKeys:
  # Single column FK
  - columns: author_id
    references:
      table: users
      columns: id
    onDelete: CASCADE

  # Composite FK
  - columns: [tenant_id, user_id]
    references:
      table: tenant_users
      columns: [tenant_id, user_id]

  # Self-referencing FK
  - columns: parent_id
    references:
      table: categories
      columns: id
    onDelete: SET NULL`}
            </CodeBlock>
          </div>
        </section>

        {/* Indexes */}
        <section id="indexes" className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('Indexes', 'インデックス')}
          </h2>
          <PropTable
            rows={[
              {
                name: 'name',
                type: 'string',
                required: false,
                desc: t('Index name', 'インデックス名'),
              },
              {
                name: 'columns',
                type: '(string | IndexColumn)[]',
                required: true,
                desc: t('Index columns', 'インデックスカラム'),
              },
              {
                name: 'unique',
                type: 'boolean',
                required: false,
                desc: t('Unique index', 'ユニークインデックス'),
              },
              {
                name: 'type',
                type: 'string',
                required: false,
                desc: 'BTREE | HASH | GIN | GIST | BRIN',
              },
              {
                name: 'where',
                type: 'string',
                required: false,
                desc: t('Partial index condition (WHERE clause)', '部分インデックス条件（WHERE句）'),
              },
              {
                name: 'description',
                type: 'string',
                required: false,
                desc: t('Index description', 'インデックスの説明'),
              },
            ]}
          />
          <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mt-6 mb-2">
            IndexColumn
          </h3>
          <PropTable
            rows={[
              {
                name: 'column',
                type: 'string',
                required: true,
                desc: t('Column name', 'カラム名'),
              },
              {
                name: 'order',
                type: 'string',
                required: false,
                desc: 'ASC | DESC',
              },
              {
                name: 'nulls',
                type: 'string',
                required: false,
                desc: 'FIRST | LAST',
              },
            ]}
          />
          <div className="mt-4">
            <CodeBlock>
              {`indexes:
  # Simple index
  - name: idx_users_email
    columns: [email]
    unique: true

  # Composite index with ordering
  - name: idx_posts_status_date
    columns:
      - column: status
      - column: published_at
        order: DESC

  # Partial index
  - name: idx_notifications_unread
    columns: [user_id, is_read]
    where: is_read = false

  # GIN index for full-text search
  - name: idx_posts_content_search
    columns: [content]
    type: GIN`}
            </CodeBlock>
          </div>
        </section>

        {/* Constraints */}
        <section id="constraints" className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('Constraints', '制約')}
          </h2>

          <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mt-6 mb-2">
            UniqueConstraint
          </h3>
          <PropTable
            rows={[
              {
                name: 'columns',
                type: 'string[]',
                required: true,
                desc: t('Columns forming the unique constraint', 'ユニーク制約を構成するカラム'),
              },
              {
                name: 'name',
                type: 'string',
                required: false,
                desc: t('Constraint name', '制約名'),
              },
              {
                name: 'description',
                type: 'string',
                required: false,
                desc: t('Constraint description', '制約の説明'),
              },
            ]}
          />

          <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mt-6 mb-2">
            CheckConstraint
          </h3>
          <PropTable
            rows={[
              {
                name: 'expression',
                type: 'string',
                required: true,
                desc: t('SQL check expression', 'SQLチェック式'),
              },
              {
                name: 'name',
                type: 'string',
                required: false,
                desc: t('Constraint name', '制約名'),
              },
              {
                name: 'description',
                type: 'string',
                required: false,
                desc: t('Constraint description', '制約の説明'),
              },
            ]}
          />
          <div className="mt-4">
            <CodeBlock>
              {`uniqueConstraints:
  - columns: [tenant_id, email]
    name: uq_tenant_email
    description: Email must be unique within tenant

checkConstraints:
  - name: no_self_follow
    expression: follower_id != following_id
    description: Users cannot follow themselves
  - name: positive_price
    expression: price > 0`}
            </CodeBlock>
          </div>
        </section>

        {/* Enums */}
        <section id="enums" className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('Enums', '列挙型')}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 mb-4">
            {t(
              'Enums can be defined at the root level and referenced by columns via enumRef.',
              '列挙型はルートレベルで定義し、カラムからenumRefで参照します。'
            )}
          </p>
          <PropTable
            rows={[
              {
                name: 'label',
                type: 'string',
                required: false,
                desc: t('Logical name', '論理名'),
              },
              {
                name: 'type',
                type: 'string',
                required: false,
                desc: t('"string" or "integer"', '"string" または "integer"'),
              },
              {
                name: 'description',
                type: 'string',
                required: false,
                desc: t('Enum description', '列挙型の説明'),
              },
              {
                name: 'values',
                type: '(string | number | EnumValue)[]',
                required: true,
                desc: t('Enum values', '列挙値'),
              },
            ]}
          />
          <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mt-6 mb-2">
            EnumValue ({t('detailed format', '詳細フォーマット')})
          </h3>
          <PropTable
            rows={[
              {
                name: 'value',
                type: 'string | number',
                required: true,
                desc: t('Actual value', '実際の値'),
              },
              {
                name: 'label',
                type: 'string',
                required: false,
                desc: t('Display label', '表示ラベル'),
              },
              {
                name: 'description',
                type: 'string',
                required: false,
                desc: t('Value description', '値の説明'),
              },
            ]}
          />
          <div className="mt-4">
            <CodeBlock>
              {`enums:
  # Simple string enum (shorthand)
  comment_status:
    label: コメントステータス
    type: string
    values: [pending, approved, rejected, spam]

  # Detailed integer enum
  user_role:
    label: ユーザー権限
    type: integer
    description: User permission levels
    values:
      - value: 1
        label: user
        description: Standard user account
      - value: 2
        label: admin
        description: Administrator with full access
      - value: 3
        label: moderator
        description: Content moderator`}
            </CodeBlock>
          </div>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t(
                'Tip: Reference enums from columns using the enumRef property.',
                'ヒント: カラムからenumRefプロパティで列挙型を参照できます。'
              )}
            </p>
            <pre className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-mono">
              {`role:
  type: integer
  enumRef: user_role`}
            </pre>
          </div>
        </section>

        {/* Views */}
        <section id="views" className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('Views', 'ビュー')}
          </h2>
          <PropTable
            rows={[
              {
                name: 'query',
                type: 'string',
                required: true,
                desc: t('SQL SELECT statement', 'SQL SELECT文'),
              },
              {
                name: 'description',
                type: 'string',
                required: false,
                desc: t('View description', 'ビューの説明'),
              },
              {
                name: 'schema',
                type: 'string',
                required: false,
                desc: t('DB schema name', 'DBスキーマ名'),
              },
              {
                name: 'materialized',
                type: 'boolean',
                required: false,
                desc: t('Materialized view flag', 'マテリアライズドビューフラグ'),
              },
              {
                name: 'columns',
                type: 'Record<string, ViewColumn>',
                required: false,
                desc: t('Output column definitions', '出力カラム定義'),
              },
            ]}
          />
          <div className="mt-4">
            <CodeBlock>
              {`views:
  active_users:
    description: Users who logged in within 30 days
    query: |
      SELECT id, email, display_name, last_login_at
      FROM users
      WHERE is_active = true
        AND last_login_at > NOW() - INTERVAL '30 days'
    columns:
      id:
        type: uuid
      email:
        type: varchar

  post_stats:
    description: Post statistics summary
    materialized: true
    query: |
      SELECT post_id, COUNT(*) as comment_count
      FROM comments
      GROUP BY post_id`}
            </CodeBlock>
          </div>
        </section>

        {/* Data Types */}
        <section id="data-types" className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('Data Types', 'データ型')}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 mb-4">
            {t(
              'REML supports standard SQL data types. Types are automatically mapped to database-specific types during SQL DDL generation.',
              'REMLは標準的なSQLデータ型をサポートします。SQL DDL生成時にデータベース固有の型に自動マッピングされます。'
            )}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800">
                  <th className="text-left px-4 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                    {t('Category', 'カテゴリ')}
                  </th>
                  <th className="text-left px-4 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                    {t('Types', '型')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                <tr>
                  <td className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                    {t('Numeric', '数値型')}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {['integer', 'bigint', 'smallint', 'tinyint', 'decimal', 'numeric', 'float', 'double', 'real'].map((t) => (
                        <code key={t} className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs">
                          {t}
                        </code>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                    {t('String', '文字列型')}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {['char', 'varchar', 'text', 'nchar', 'nvarchar', 'ntext'].map((t) => (
                        <code key={t} className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs">
                          {t}
                        </code>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                    {t('Date/Time', '日時型')}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {['date', 'time', 'datetime', 'timestamp', 'timestamptz'].map((t) => (
                        <code key={t} className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs">
                          {t}
                        </code>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                    {t('Binary', 'バイナリ型')}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {['binary', 'varbinary', 'blob'].map((t) => (
                        <code key={t} className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs">
                          {t}
                        </code>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                    {t('Other', 'その他')}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {['boolean', 'bit', 'uuid', 'json', 'jsonb', 'array'].map((t) => (
                        <code key={t} className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs">
                          {t}
                        </code>
                      ))}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t(
                'Tip: Any string value is accepted as a type. Unknown types are passed through as-is in SQL generation, enabling database-specific types.',
                'ヒント: 任意の文字列を型として指定できます。未知の型はSQL生成時にそのまま出力されるため、データベース固有の型も使用可能です。'
              )}
            </p>
          </div>
        </section>

        {/* Validation */}
        <section id="validation" className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('Validation', 'バリデーション')}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 mb-4">
            {t(
              'Column-level validation rules for documentation purposes.',
              'ドキュメント用のカラムレベルバリデーションルールです。'
            )}
          </p>
          <PropTable
            rows={[
              {
                name: 'min',
                type: 'number',
                required: false,
                desc: t('Minimum numeric value', '最小数値'),
              },
              {
                name: 'max',
                type: 'number',
                required: false,
                desc: t('Maximum numeric value', '最大数値'),
              },
              {
                name: 'minLength',
                type: 'number',
                required: false,
                desc: t('Minimum string length', '最小文字長'),
              },
              {
                name: 'maxLength',
                type: 'number',
                required: false,
                desc: t('Maximum string length', '最大文字長'),
              },
              {
                name: 'pattern',
                type: 'string',
                required: false,
                desc: t('Regex pattern', '正規表現パターン'),
              },
              {
                name: 'format',
                type: 'string',
                required: false,
                desc: t('Format hint: email, url, uuid, phone, ...', 'フォーマットヒント: email, url, uuid, phone, ...'),
              },
              {
                name: 'check',
                type: 'string',
                required: false,
                desc: t('SQL check expression', 'SQLチェック式'),
              },
            ]}
          />
          <div className="mt-4">
            <CodeBlock>
              {`columns:
  age:
    type: integer
    validation:
      min: 0
      max: 150
  email:
    type: varchar
    length: 255
    validation:
      format: email
      maxLength: 255
  phone:
    type: varchar
    validation:
      pattern: "^\\\\+?[0-9\\\\-]+$"
      format: phone`}
            </CodeBlock>
          </div>
        </section>

        {/* Full Example */}
        <section id="full-example" className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('Full Example', '完全なサンプル')}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 mb-4">
            {t(
              'A complete REML document demonstrating all features.',
              'すべての機能を網羅した完全なREMLドキュメントです。'
            )}
          </p>
          <CodeBlock>
            {`reml: "1.0"
database: postgresql
metadata:
  name: Blog Application
  description: A blog platform with users, posts, and comments
  author: Development Team
  version: "1.0"

enums:
  user_role:
    label: ユーザー権限
    type: integer
    values:
      - value: 1
        label: user
      - value: 2
        label: admin
  post_status:
    label: 投稿ステータス
    type: string
    values: [draft, published, archived]

tables:
  users:
    label: ユーザー
    description: User accounts
    columns:
      id:
        type: uuid
        label: ユーザーID
        primaryKey: true
        default: gen_random_uuid()
      email:
        type: varchar
        label: メールアドレス
        length: 255
        nullable: false
        unique: true
        example: "user@example.com"
      role:
        type: integer
        label: 権限
        enumRef: user_role
        default: 1
      created_at:
        type: timestamptz
        label: 作成日時
        nullable: false
        default: now()
    indexes:
      - name: idx_users_email
        columns: [email]
        unique: true

  posts:
    label: 投稿
    description: Blog posts
    columns:
      id:
        type: uuid
        primaryKey: true
        default: gen_random_uuid()
      author_id:
        type: uuid
        nullable: false
      title:
        type: varchar
        length: 200
        nullable: false
      status:
        type: varchar
        enumRef: post_status
        default: draft
      created_at:
        type: timestamptz
        default: now()
    foreignKeys:
      - columns: author_id
        references:
          table: users
          columns: id
        onDelete: CASCADE
    indexes:
      - name: idx_posts_author
        columns: [author_id]

  post_tags:
    label: 投稿タグ
    primaryKey: [post_id, tag_id]
    columns:
      post_id:
        type: uuid
      tag_id:
        type: integer
    foreignKeys:
      - columns: post_id
        references:
          table: posts
          columns: id
        onDelete: CASCADE

views:
  active_posts:
    description: Published posts
    query: |
      SELECT id, title, author_id, created_at
      FROM posts
      WHERE status = 'published'`}
          </CodeBlock>
        </section>

        {/* Design Principles */}
        <section className="mb-12 p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-3">
            {t('Design Principles', '設計方針')}
          </h2>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold mt-0.5">1.</span>
              <span>
                <strong>{t('Lenient Parsing', '寛容なパース')}</strong> —{' '}
                {t(
                  'Unknown properties are silently ignored. This enables forward compatibility and custom extensions.',
                  '未知のプロパティは無視されます。前方互換性とカスタム拡張を可能にします。'
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold mt-0.5">2.</span>
              <span>
                <strong>{t('Minimal Required Fields', '最小限の必須フィールド')}</strong> —{' '}
                {t(
                  'Only reml, database, tables, and columns.type are required. Everything else is optional.',
                  'reml、database、tables、columns.typeのみが必須です。それ以外はすべてオプションです。'
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold mt-0.5">3.</span>
              <span>
                <strong>{t('Bilingual Support', 'バイリンガル対応')}</strong> —{' '}
                {t(
                  'The label property provides logical names alongside physical names, supporting Japanese DB design conventions.',
                  'labelプロパティにより物理名と論理名を併記でき、日本のDB設計慣行に対応しています。'
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold mt-0.5">4.</span>
              <span>
                <strong>{t('Database Agnostic', 'データベース非依存')}</strong> —{' '}
                {t(
                  'Define once, generate DDL for PostgreSQL, MySQL, MariaDB, SQLite, SQL Server, or Oracle.',
                  '一度定義すれば、PostgreSQL、MySQL、MariaDB、SQLite、SQL Server、OracleのDDLを生成できます。'
                )}
              </span>
            </li>
          </ul>
        </section>

        {/* Back to viewer CTA */}
        <section className="text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
          >
            {t('Try in Viewer', 'ビューアーで試す')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            REMLViewer - Open Source RDB Schema Documentation Tool
          </p>
        </div>
      </footer>
    </div>
  );
}
