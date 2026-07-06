import type {ReactNode} from 'react';
import {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

type Showcase = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  highlights: string[];
  image: string;
  alt: string;
};

const showcases: Showcase[] = [
  {
    eyebrow: '数据管理 · Data',
    title: '运行时动态建模，一键生成 API',
    description: (
      <>
        无需手写 SQL 与接口代码，在可视化界面定义模型即可自动生成 REST 与
        GraphQL API。深度适配 10+ 种主流及国产数据库，数据服务开发从未如此简单。
      </>
    ),
    highlights: [
      '运行时动态创建数据模型',
      '自动生成 REST / GraphQL API',
      '支持 MySQL、PostgreSQL、Oracle、达梦、人大金仓等',
      '字段级约束、索引、关联关系可视化管理',
    ],
    image: '/img/feature-data-modeling.svg',
    alt: 'Flexmodel 数据建模界面',
  },
  {
    eyebrow: '服务编排 · Flow',
    title: '可视化流程编排，低代码扩展业务逻辑',
    description: (
      <>
        基于 BPMN 风格的低代码流程设计器，通过拖拽节点即可构建后端业务逻辑。
        支持服务任务、排他网关、调用活动等节点类型，让复杂业务编排清晰可控。
      </>
    ),
    highlights: [
      'BPMN 风格的可视化流程设计器',
      '服务任务、网关、调用活动等节点',
      '与任务调度深度联动实现自动化',
      '流程可版本化、可追溯',
    ],
    image: '/img/feature-flow.svg',
    alt: 'Flexmodel 流程编排界面',
  },
  {
    eyebrow: 'AI 工具集成 · MCP',
    title: '基于 MCP 协议，让 AI 直接管理数据',
    description: (
      <>
        基于 MCP 协议开放 15 个核心工具，AI 客户端可直接管理项目、建模与数据。
        让 Claude、Cursor、Codex 等 Coding Agent 高效参与开发，赋能智能应用。
      </>
    ),
    highlights: [
      '基于 MCP 协议开放 15 个核心工具',
      '兼容主流 AI Coding Agent',
      '工具调用全程可审计、可追溯',
      '统一对接多种数据源与对象存储',
    ],
    image: '/img/feature-mcp.svg',
    alt: 'Flexmodel MCP 集成界面',
  },
  {
    eyebrow: '对象存储 · Storage',
    title: '统一抽象 S3、OSS 与本地存储',
    description: (
      <>
        统一的对象存储抽象层，屏蔽底层差异。轻松管理 Bucket 与文件对象，
        上传下载一键完成，支持多种存储后端自由切换。
      </>
    ),
    highlights: [
      '统一抽象 S3、阿里 OSS 与本地存储',
      'Bucket 与文件对象可视化管理',
      '断点续传、分片上传',
      '存储后端可按需切换',
    ],
    image: '/img/feature-storage.svg',
    alt: 'Flexmodel 对象存储界面',
  },
  {
    eyebrow: '身份认证 · Auth',
    title: '完整 RBAC 体系，项目级身份管理',
    description: (
      <>
        完整的 RBAC 权限体系，支持 OIDC、LDAP、社交账号及 JWT 安全验证。
        项目级身份提供商灵活配置，权限精确到字段级别。
      </>
    ),
    highlights: [
      '完整的 RBAC 权限体系',
      '支持 OIDC、LDAP、社交账号、JWT',
      '多租户与项目级身份提供商',
      '权限精确到字段级别',
    ],
    image: '/img/feature-auth.svg',
    alt: 'Flexmodel 身份认证界面',
  },
  {
    eyebrow: '云函数 · Functions',
    title: 'Serverless 运行时，安全隔离自定义逻辑',
    description: (
      <>
        基于 Deno + Hono.js 的云函数运行时，每个函数在独立 Worker 中安全执行。
        支持 TypeScript 原生开发，可与数据模型、流程编排深度联动，灵活扩展业务边界。
      </>
    ),
    highlights: [
      '基于 Deno + Hono.js 的现代运行时',
      'Worker 隔离执行，安全沙箱环境',
      '原生 TypeScript 支持，无需编译',
      '与数据模型、流程、存储深度联动',
    ],
    image: '/img/feature-functions.svg',
    alt: 'Flexmodel 云函数运行时界面',
  },
];

function ShowcaseItem({
  showcase,
  index,
}: {
  showcase: Showcase;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reversed = index % 2 === 1;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      {threshold: 0.15},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={clsx(
        styles.showcaseRow,
        reversed && styles.showcaseRowReversed,
        visible && styles.showcaseRowVisible,
      )}>
      <div className={styles.showcaseText}>
        <span className={styles.eyebrow}>{showcase.eyebrow}</span>
        <h3 className={styles.showcaseTitle}>{showcase.title}</h3>
        <p className={styles.showcaseDesc}>{showcase.description}</p>
        <ul className={styles.highlights}>
          {showcase.highlights.map((h) => (
            <li key={h}>
              <span className={styles.check} aria-hidden="true">
                ✓
              </span>
              {h}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.showcaseMedia}>
        <div className={styles.mediaFrame}>
          <div className={styles.mediaGlow} aria-hidden="true" />
          <img
            src={useBaseUrl(showcase.image)}
            alt={showcase.alt}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

export default function FeatureShowcase() {
  return (
    <section className={styles.showcaseSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>产品功能</span>
          <h2 className={styles.sectionTitle}>
              用统一规范，遏制系统熵增
          </h2>
          <p className={styles.sectionSubtitle}>
              Flexmodel 以统一规范为底座，将数据建模、流程编排、云函数、AI
              集成纳入标准化轨道——让每一行业务逻辑都<strong>可视、可控、可追溯</strong>。
          </p>
        </div>
        <div className={styles.showcaseList}>
          {showcases.map((s, i) => (
            <ShowcaseItem key={s.title} showcase={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
