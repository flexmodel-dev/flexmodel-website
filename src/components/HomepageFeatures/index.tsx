import clsx from 'clsx';
import Heading from '@theme/Heading';
import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
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
    title: '云函数运行时',
    Svg: require('@site/static/img/undraw_developer_activity_re_39tg.svg').default,
    description: (
        <>
          基于 Deno + Hono.js 的 Worker 隔离执行环境，安全运行自定义函数，灵活扩展业务边界。
        </>
    ),
  },
  {
    title: '多协议 API 开放',
    Svg: require('@site/static/img/undraw_add_information_j2wg.svg').default,
    description: (
        <>
          同一套数据模型同时开放 REST、GraphQL、MCP、WebSocket 与 SSE，满足多样化接入场景。
        </>
    ),
  },
  {
    title: '私有化部署',
    Svg: require('@site/static/img/undraw_developer_activity_re_39tg.svg').default,
    description: (
        <>
          开源、支持私有化部署，数据完全掌握在自己手中，不被平台锁定，自主可控、安全合规。
        </>
    ),
  },
  {
    title: '多数据库适配',
    Svg: require('@site/static/img/undraw_add_information_j2wg.svg').default,
    description: (
        <>
          深度适配 MySQL、PostgreSQL、Oracle、达梦、人大金仓等 10+ 主流及国产数据库，一次建模多处运行。
        </>
    ),
  },
  {
    title: '生产级可靠性',
    Svg: require('@site/static/img/undraw_best_place_re_lne9.svg').default,
    description: (
        <>
            Agroal 连接池、QuickJS 引擎与审计日志保驾护航，核心能力经生产环境严格验证，稳定可靠。
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

export default function HomepageFeatures() {
  return (
      <section className={styles.features}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>更多能力，开箱即用</h2>
            <p className={styles.sectionSubtitle}>
              除核心功能外，Flexmodel 还内置了一系列覆盖数据服务全场景的基础能力
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
