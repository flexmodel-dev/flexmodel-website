import Link from '@docusaurus/Link';
import {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

export default function CTASection() {
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
      {threshold: 0.2},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section}>
      <div className="container">
        <div
          ref={ref}
          className={clsx(styles.card, visible && styles.cardVisible)}>
          <div className={styles.glow} aria-hidden="true" />
          <div className={styles.glow2} aria-hidden="true" />
          <div className={styles.content}>
            <h2 className={styles.title}>准备好使用 Flexmodel 了吗？</h2>
            <p className={styles.subtitle}>
              1 分钟部署专属实例，立即体验下一代统一数据访问层。
              <br />
              开源、自主可控，数据始终掌握在你自己手中。
            </p>
            <div className={styles.buttons}>
              <Link
                className={styles.primaryButton}
                to="/docs/tutorial/intro">
                <span>🚀 开始使用</span>
              </Link>
              <Link
                className={styles.secondaryButton}
                to="https://preview.flexmodel.dev/">
                <span>✨ 在线体验</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
