import clsx from 'clsx';
import Heading from '@theme/Heading';
import { useEffect, useState } from 'react';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: '无代码数据建模',
    Svg: require('@site/static/img/undraw_developer_activity_re_39tg.svg').default,
    description: (
        <>
          运行时动态创建数据模型，自动生成 GraphQL 与 REST API，支持 10+ 数据库，让数据服务开发变得前所未有地简单。
        </>
    ),
  },
  {
    title: '可视化流程编排',
    Svg: require('@site/static/img/undraw_add_information_j2wg.svg').default,
    description: (
        <>
          基于 BPMN 风格的低代码流程设计器，通过拖拽节点构建后端业务逻辑，支持服务任务、排排网关、调用活动等节点类型。
        </>
    ),
  },
  {
    title: '分布式任务调度',
    Svg: require('@site/static/img/undraw_best_place_re_lne9.svg').default,
    description: (
        <>
          内置触发器与作业执行引擎，支持 Cron、延时及事件驱动调度，可与流程编排深度联动实现自动化。
        </>
    ),
  },
  {
    title: '对象存储管理',
    Svg: require('@site/static/img/undraw_add_information_j2wg.svg').default,
    description: (
        <>
          统一抽象 S3、OSS 与本地存储，轻松管理 Bucket 与文件对象，上传下载一键完成。
        </>
    ),
  },
  {
    title: '统一身份认证',
    Svg: require('@site/static/img/undraw_developer_activity_re_39tg.svg').default,
    description: (
        <>
          完整 RBAC 权限体系，支持 OIDC、LDAP、社交账号及 JWT 安全验证，项目级身份提供商灵活配置。
        </>
    ),
  },
  {
    title: 'AI 工具集成',
    Svg: require('@site/static/img/undraw_best_place_re_lne9.svg').default,
    description: (
        <>
          基于 MCP 协议开放 15 个核心工具，让 AI 客户端直接管理项目、建模与数据，赋能智能应用开发。
        </>
    ),
  },
];

function Feature({title, Svg, description, index}: FeatureItem & {index: number}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 150);
    return () => clearTimeout(timer);
  }, [index]);

  return (
      <div className={clsx('col col--4')}>
        <div className={clsx(styles.featureCard, isVisible && styles.featureCardVisible)}>
          <div className={styles.featureIcon}>
            <Svg className={styles.featureSvg} role="img"/>
            <div className={styles.iconGlow}></div>
          </div>
          <div className={styles.featureContent}>
            <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
            <p className={styles.featureDescription}>{description}</p>
          </div>
        </div>
      </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
      <section className={styles.features}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>核心特性</h2>
            <p className={styles.sectionSubtitle}>
              强大的功能，简单的操作，面向下一代应用的统一数据访问层
            </p>
          </div>
          <div className="row">
            {FeatureList.map((props, idx) => (
                <Feature key={idx} {...props} index={idx} />
            ))}
          </div>
        </div>
      </section>
  );
}
