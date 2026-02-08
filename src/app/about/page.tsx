'use client';

import { Header } from '@/components/ui/Header';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">
            REML<span className="text-emerald-500">Viewer</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-300">
            {t('RDB Schema Documentation', 'RDBスキーマドキュメンテーション')}
          </p>
        </section>

        {/* What is REMLViewer */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('What is REMLViewer?', 'REMLViewerとは？')}
          </h2>
          <div className="space-y-4 text-zinc-600 dark:text-zinc-300">
            <p>
              {t(
                'REMLViewer is a design document viewer for relational database structures. It transforms YAML-based schema definitions into beautiful, readable documentation.',
                'REMLViewerはリレーショナルデータベースの構造を可視化するドキュメントビューアーです。YAMLベースのスキーマ定義を見やすいドキュメントに変換します。'
              )}
            </p>
          </div>
        </section>

        {/* What is REML */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('What is REML?', 'REMLとは？')}
          </h2>
          <div className="space-y-4 text-zinc-600 dark:text-zinc-300">
            <p>
              {t(
                'REML stands for Relational Entity Modeling Language - a specification for describing relational database schemas. It provides a standardized way to document RDB structures using familiar YAML syntax.',
                'REMLはRelational Entity Modeling Languageの略です。YAMLの親しみやすい構文を使って、リレーショナルデータベース構造を標準化された方法でドキュメント化するための仕様です。'
              )}
            </p>
          </div>
        </section>

        {/* Supported Databases */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('Supported Databases', '対応データベース')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['PostgreSQL', 'MySQL', 'MariaDB', 'SQLite', 'SQL Server', 'Oracle'].map((db) => (
              <div
                key={db}
                className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-center"
              >
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{db}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How to Use */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('How to Use', '使い方')}
          </h2>

          {/* Step 1 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 bg-emerald-500 text-white text-sm font-bold rounded-full">
                1
              </span>
              {t('Create a REML file', 'REMLファイルを作成')}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300 mb-3">
              {t(
                'Create a YAML file with the following basic structure:',
                '以下の基本構造でYAMLファイルを作成します：'
              )}
            </p>
            <pre className="bg-zinc-800 dark:bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`reml: "1.0"
database: postgresql
metadata:
  name: My App
  description: Description of your database schema

tables:
  # Define your tables here`}
            </pre>
          </div>

          {/* Step 2 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 bg-emerald-500 text-white text-sm font-bold rounded-full">
                2
              </span>
              {t('Define Tables', 'テーブルを定義')}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300 mb-3">
              {t('Add your tables with their columns:', 'テーブルとカラムを追加します：')}
            </p>
            <pre className="bg-zinc-800 dark:bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`tables:
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
        description: User email address
      created_at:
        type: timestamptz
        nullable: false
        default: now()`}
            </pre>
          </div>

          {/* Step 3 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 bg-emerald-500 text-white text-sm font-bold rounded-full">
                3
              </span>
              {t('Add Foreign Keys', '外部キーを追加')}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300 mb-3">
              {t(
                'Define relationships between tables using foreign keys:',
                '外部キーを使ってテーブル間のリレーションを定義します：'
              )}
            </p>
            <pre className="bg-zinc-800 dark:bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`tables:
  posts:
    description: Blog posts
    columns:
      id:
        type: uuid
        primaryKey: true
      author_id:
        type: uuid
        nullable: false
    foreignKeys:
      - columns: author_id
        references:
          table: users
          columns: id
        onDelete: CASCADE`}
            </pre>
          </div>

          {/* Step 4 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 bg-emerald-500 text-white text-sm font-bold rounded-full">
                4
              </span>
              {t('Add Indexes', 'インデックスを追加')}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300 mb-3">
              {t('Define indexes for better query performance:', 'クエリパフォーマンス向上のためにインデックスを定義します：')}
            </p>
            <pre className="bg-zinc-800 dark:bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`tables:
  users:
    columns:
      # ...
    indexes:
      - name: idx_users_email
        columns: [email]
        unique: true
      - name: idx_users_created
        columns:
          - column: created_at
            order: DESC`}
            </pre>
          </div>

          {/* Step 5 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 bg-emerald-500 text-white text-sm font-bold rounded-full">
                5
              </span>
              {t('Visualize', '可視化する')}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300">
              {t(
                'Paste your REML schema into the viewer or drag & drop your YAML file to see the visualization.',
                '作成したREMLスキーマをビューアーにペーストするか、YAMLファイルをドラッグ&ドロップして可視化します。'
              )}
            </p>
          </div>
        </section>

        {/* Data Types */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
            {t('Common Data Types', '一般的なデータ型')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800">
                  <th className="text-left px-4 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                    {t('Type', 'タイプ')}
                  </th>
                  <th className="text-left px-4 py-2 font-semibold text-zinc-700 dark:text-zinc-200">
                    {t('Description', '説明')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                <tr>
                  <td className="px-4 py-2 font-mono text-emerald-600 dark:text-emerald-400">integer / bigint</td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300">
                    {t('Integer numbers', '整数')}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-emerald-600 dark:text-emerald-400">varchar / text</td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300">
                    {t('Text data', 'テキストデータ')}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-emerald-600 dark:text-emerald-400">boolean</td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300">
                    {t('True or false', '真偽値')}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-emerald-600 dark:text-emerald-400">timestamp / timestamptz</td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300">
                    {t('Date and time', '日時')}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-emerald-600 dark:text-emerald-400">uuid</td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300">
                    {t('Universally unique identifier', 'UUID')}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-emerald-600 dark:text-emerald-400">decimal / numeric</td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300">
                    {t('Exact numeric with precision', '精度付き数値')}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-emerald-600 dark:text-emerald-400">json / jsonb</td>
                  <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300">
                    {t('JSON data', 'JSONデータ')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Try Now CTA */}
        <section className="text-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">
            {t('Ready to start?', '始めましょう')}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 mb-6">
            {t(
              'Go to the viewer and try with the sample schema or your own REML file.',
              'ビューアーでサンプルスキーマまたは独自のREMLファイルを試してみてください。'
            )}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
          >
            {t('Open Viewer', 'ビューアーを開く')}
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
