'use client';

import { useState } from 'react';
import { RemlInput } from '@/components/ui/RemlInput';
import { SchemaViewer } from '@/components/viewer/SchemaViewer';
import { Header } from '@/components/ui/Header';
import { parseAndValidateReml } from '@/lib/parser';
import type { RemlSchema, ValidationResult } from '@/lib/schema/types';

// Sample REML for demo
const SAMPLE_REML = `reml: "1.0"
database: postgresql
metadata:
  name: Sample Blog App
  description: A comprehensive blog application schema with users, posts, comments, tags, and categories

enums:
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
        description: Content moderator
  post_status:
    label: 投稿ステータス
    type: integer
    description: Publication status of posts
    values:
      - value: 0
        label: draft
      - value: 1
        label: published
      - value: 2
        label: archived
  comment_status:
    label: コメントステータス
    type: string
    description: Comment moderation status
    values: [pending, approved, rejected, spam]
  notification_type:
    label: 通知タイプ
    type: string
    description: Type of notification
    values: [comment, like, follow, mention, system]

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
        description: Unique user identifier
      email:
        type: varchar
        label: メールアドレス
        length: 255
        nullable: false
        unique: true
        description: User email address
        example: "user@example.com"
      password_hash:
        type: varchar
        label: パスワードハッシュ
        length: 255
        nullable: false
        description: Bcrypt hashed password
      display_name:
        type: varchar
        label: 表示名
        length: 100
        description: Display name
        example: "John Doe"
      role:
        type: integer
        label: 権限
        enumRef: user_role
        default: 1
        description: User permission level
      is_active:
        type: boolean
        label: 有効フラグ
        default: true
        description: Account active status
      created_at:
        type: timestamptz
        label: 作成日時
        nullable: false
        default: now()
        description: Account creation date
      updated_at:
        type: timestamptz
        label: 更新日時
        nullable: false
        default: now()
        description: Last update date
    indexes:
      - name: idx_users_email
        columns: [email]
        unique: true
      - name: idx_users_role
        columns: [role]

  user_profiles:
    label: ユーザープロフィール
    description: Extended user profile information
    columns:
      user_id:
        type: uuid
        label: ユーザーID
        primaryKey: true
        description: Reference to users table
      avatar_url:
        type: varchar
        label: アバターURL
        length: 500
        description: Profile picture URL
      bio:
        type: text
        label: 自己紹介
        description: User biography
      website:
        type: varchar
        label: Webサイト
        length: 255
        description: Personal website URL
      location:
        label: 所在地
        type: varchar
        length: 100
        description: User location
      birth_date:
        type: date
        label: 生年月日
        description: Date of birth
      updated_at:
        type: timestamptz
        label: 更新日時
        default: now()
    foreignKeys:
      - columns: user_id
        references:
          table: users
          columns: id
        onDelete: CASCADE

  categories:
    label: カテゴリ
    description: Post categories
    columns:
      id:
        type: integer
        label: カテゴリID
        primaryKey: true
        autoIncrement: true
      name:
        type: varchar
        label: カテゴリ名
        length: 100
        nullable: false
        unique: true
        description: Category name
      slug:
        type: varchar
        label: スラッグ
        length: 100
        nullable: false
        unique: true
        description: URL-friendly identifier
      description:
        type: text
        label: 説明
        description: Category description
      parent_id:
        type: integer
        label: 親カテゴリID
        description: Parent category for hierarchical structure
      created_at:
        type: timestamptz
        label: 作成日時
        default: now()
    foreignKeys:
      - columns: parent_id
        references:
          table: categories
          columns: id
        onDelete: SET NULL
    indexes:
      - name: idx_categories_slug
        columns: [slug]

  posts:
    label: 投稿
    description: Blog posts
    columns:
      id:
        type: uuid
        label: 投稿ID
        primaryKey: true
        default: gen_random_uuid()
      title:
        type: varchar
        label: タイトル
        length: 200
        nullable: false
        description: Post title
        example: "Getting Started with PostgreSQL"
      slug:
        type: varchar
        label: スラッグ
        length: 250
        nullable: false
        unique: true
        description: URL-friendly identifier
      content:
        type: text
        label: 本文
        nullable: false
        description: Post body content
      excerpt:
        type: varchar
        label: 抜粋
        length: 500
        description: Short summary for previews
      author_id:
        type: uuid
        label: 著者ID
        nullable: false
        description: Reference to the post author
      category_id:
        type: integer
        label: カテゴリID
        description: Primary category
      status:
        type: integer
        label: ステータス
        enumRef: post_status
        default: 0
        description: Publication status
      view_count:
        type: integer
        label: 閲覧数
        default: 0
        description: Number of views
      published_at:
        type: timestamptz
        label: 公開日時
        description: Publication date
      created_at:
        type: timestamptz
        label: 作成日時
        nullable: false
        default: now()
      updated_at:
        type: timestamptz
        label: 更新日時
        nullable: false
        default: now()
    foreignKeys:
      - columns: author_id
        references:
          table: users
          columns: id
        onDelete: CASCADE
      - columns: category_id
        references:
          table: categories
          columns: id
        onDelete: SET NULL
    indexes:
      - name: idx_posts_author
        columns: [author_id]
      - name: idx_posts_slug
        columns: [slug]
        unique: true
      - name: idx_posts_status_published
        columns:
          - column: status
          - column: published_at
            order: DESC

  tags:
    label: タグ
    description: Tags for organizing posts
    columns:
      id:
        type: integer
        label: タグID
        primaryKey: true
        autoIncrement: true
      name:
        type: varchar
        label: タグ名
        length: 50
        nullable: false
        unique: true
        description: Tag name
      slug:
        type: varchar
        label: スラッグ
        length: 50
        nullable: false
        unique: true
        description: URL-friendly identifier
      created_at:
        type: timestamptz
        label: 作成日時
        default: now()
    indexes:
      - name: idx_tags_slug
        columns: [slug]

  post_tags:
    label: 投稿タグ
    description: Many-to-many relationship between posts and tags
    columns:
      post_id:
        type: uuid
        label: 投稿ID
        nullable: false
      tag_id:
        type: integer
        label: タグID
        nullable: false
      created_at:
        type: timestamptz
        label: 作成日時
        default: now()
    primaryKey: [post_id, tag_id]
    foreignKeys:
      - columns: post_id
        references:
          table: posts
          columns: id
        onDelete: CASCADE
      - columns: tag_id
        references:
          table: tags
          columns: id
        onDelete: CASCADE

  comments:
    label: コメント
    description: User comments on posts
    columns:
      id:
        type: uuid
        label: コメントID
        primaryKey: true
        default: gen_random_uuid()
      post_id:
        type: uuid
        label: 投稿ID
        nullable: false
        description: Reference to the post
      user_id:
        type: uuid
        label: ユーザーID
        nullable: false
        description: Reference to the comment author
      parent_id:
        type: uuid
        label: 親コメントID
        description: Parent comment for nested replies
      content:
        type: text
        label: 内容
        nullable: false
        description: Comment content
      status:
        type: varchar
        label: ステータス
        enumRef: comment_status
        default: pending
        description: Moderation status
      created_at:
        type: timestamptz
        label: 作成日時
        nullable: false
        default: now()
      updated_at:
        type: timestamptz
        label: 更新日時
        nullable: false
        default: now()
    foreignKeys:
      - columns: post_id
        references:
          table: posts
          columns: id
        onDelete: CASCADE
      - columns: user_id
        references:
          table: users
          columns: id
        onDelete: CASCADE
      - columns: parent_id
        references:
          table: comments
          columns: id
        onDelete: CASCADE
    indexes:
      - name: idx_comments_post
        columns: [post_id]
      - name: idx_comments_user
        columns: [user_id]

  likes:
    label: いいね
    description: User likes on posts
    columns:
      user_id:
        type: uuid
        label: ユーザーID
        nullable: false
      post_id:
        type: uuid
        label: 投稿ID
        nullable: false
      created_at:
        type: timestamptz
        label: 作成日時
        default: now()
    primaryKey: [user_id, post_id]
    foreignKeys:
      - columns: user_id
        references:
          table: users
          columns: id
        onDelete: CASCADE
      - columns: post_id
        references:
          table: posts
          columns: id
        onDelete: CASCADE

  follows:
    label: フォロー
    description: User follow relationships
    columns:
      follower_id:
        type: uuid
        label: フォロワーID
        nullable: false
        description: User who is following
      following_id:
        type: uuid
        label: フォロー先ID
        nullable: false
        description: User being followed
      created_at:
        type: timestamptz
        label: 作成日時
        default: now()
    primaryKey: [follower_id, following_id]
    foreignKeys:
      - columns: follower_id
        references:
          table: users
          columns: id
        onDelete: CASCADE
      - columns: following_id
        references:
          table: users
          columns: id
        onDelete: CASCADE
    checkConstraints:
      - name: no_self_follow
        expression: follower_id != following_id
        description: Users cannot follow themselves

  notifications:
    label: 通知
    description: User notifications
    columns:
      id:
        type: uuid
        label: 通知ID
        primaryKey: true
        default: gen_random_uuid()
      user_id:
        type: uuid
        label: ユーザーID
        nullable: false
        description: Notification recipient
      type:
        type: varchar
        label: 通知タイプ
        enumRef: notification_type
        nullable: false
        description: Type of notification
      title:
        type: varchar
        label: タイトル
        length: 200
        nullable: false
      message:
        type: text
        label: メッセージ
        description: Notification message
      reference_id:
        type: uuid
        label: 参照ID
        description: Related entity ID
      is_read:
        type: boolean
        label: 既読フラグ
        default: false
      created_at:
        type: timestamptz
        label: 作成日時
        default: now()
    foreignKeys:
      - columns: user_id
        references:
          table: users
          columns: id
        onDelete: CASCADE
    indexes:
      - name: idx_notifications_user_unread
        columns: [user_id, is_read]
        where: is_read = false
`;

export default function Home() {
  const [schema, setSchema] = useState<RemlSchema | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isInputOpen, setIsInputOpen] = useState(true);
  const [yamlText, setYamlText] = useState('');

  const handleYamlChange = (yaml: string) => {
    setYamlText(yaml);

    if (!yaml.trim()) {
      setSchema(null);
      setValidation(null);
      setParseError(null);
      return;
    }

    const result = parseAndValidateReml(yaml);
    setSchema(result.schema);
    setValidation(result.validation);
    setParseError(result.parseError);
  };

  const loadSample = () => {
    setYamlText(SAMPLE_REML);
    handleYamlChange(SAMPLE_REML);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Input Panel - Collapsible */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isInputOpen ? 'lg:w-1/2' : 'lg:w-0'
            }`}
          >
            <div className={`${isInputOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                  Input REML Schema
                </h2>
                <button onClick={loadSample} className="text-sm text-emerald-500 hover:text-emerald-600">
                  Load Sample
                </button>
              </div>
              <RemlInput value={yamlText} onYamlChange={handleYamlChange} />

              {/* Error Display */}
              {parseError && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Parse Error
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 font-mono">
                    {parseError}
                  </p>
                </div>
              )}

              {/* Validation Errors */}
              {validation && !validation.valid && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Validation Errors
                  </h3>
                  <ul className="text-sm text-amber-600 dark:text-amber-400 mt-1 space-y-1">
                    {validation.errors.map((error, i) => (
                      <li key={i}>
                        <span className="font-mono">{error.path}</span>: {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success */}
              {validation?.valid && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">Schema is valid</p>
                </div>
              )}
            </div>
          </div>

          {/* Viewer Panel */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              isInputOpen ? 'lg:w-1/2' : 'lg:w-full'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                Schema Visualization
              </h2>
              {/* Toggle Button */}
              <button
                onClick={() => setIsInputOpen(!isInputOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                {isInputOpen ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                      />
                    </svg>
                    Hide Editor
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 5l7 7-7 7M5 5l7 7-7 7"
                      />
                    </svg>
                    Show Editor
                  </>
                )}
              </button>
            </div>
            {schema && validation?.valid ? (
              <SchemaViewer schema={schema} />
            ) : (
              <div className="flex items-center justify-center h-64 bg-white dark:bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                <p className="text-zinc-400 dark:text-zinc-500">
                  Enter or upload a REML schema to visualize
                </p>
              </div>
            )}
          </div>
        </div>
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
