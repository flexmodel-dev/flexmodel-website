import {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type Highlight = {
  icon: string;
  title: string;
  description: string;
};

const highlights: Highlight[] = [
  {
    icon: '☕',
    title: 'Java 25 + Quarkus 3',
    description: '基于最新的 Java 25 与 Quarkus 3 框架，云原生、启动快、内存占用低。',
  },
  {
    icon: '🧩',
    title: '模型驱动架构',
    description: '通过 DSL 引擎屏蔽底层基础设施复杂性，屏蔽多数据库差异，专注业务。',
  },
  {
    icon: '🔌',
    title: '多协议开放',
    description: '同时提供 REST、GraphQL、MCP、WebSocket、SSE 多种协议接入能力。',
  },
  {
    icon: '🔒',
    title: '自主可控',
    description: '开源、支持私有化部署，数据完全掌握在自己手中，不被平台锁定。',
  },
  {
    icon: '⚡',
    title: '高性能',
    description: 'Agroal 连接池 + QuickJS 引擎，保障高并发下的稳定性能。',
  },
  {
    icon: '🛡️',
    title: '生产验证',
    description: '核心能力经过严格测试与大量生产环境验证，稳定可靠、可持续迭代。',
  },
];

function HighlightCard({item, index}: {item: Highlight; index: number}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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
      {threshold: 0.1},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={clsx(styles.card, visible && styles.cardVisible)}
      style={{transitionDelay: `${index * 80}ms`}}>
      <div className={styles.cardIcon}>{item.icon}</div>
      <h4 className={styles.cardTitle}>{item.title}</h4>
      <p className={styles.cardDesc}>{item.description}</p>
    </div>
  );
}

export default function ArchitectureHighlights() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.kicker}>技术架构</span>
          <h2 className={styles.title}>为下一代应用而生</h2>
          <p className={styles.subtitle}>
            现代化的技术栈与模型驱动架构，兼顾开发效率与运行性能。
          </p>
        </div>
        <div className={styles.grid}>
          {highlights.map((h, i) => (
            <HighlightCard key={h.title} item={h} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
