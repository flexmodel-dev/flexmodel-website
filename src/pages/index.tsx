import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import FeatureShowcase from '@site/src/components/FeatureShowcase';
import ArchitectureHighlights from '@site/src/components/ArchitectureHighlights';
import CTASection from '@site/src/components/CTASection';
import Heading from '@theme/Heading';
import {useEffect, useState} from 'react';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <header className={clsx(styles.heroBanner)}>
      {/* Animated background */}
      <div className={styles.heroBackground}>
        <div className={styles.gradientOrb}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gradientOrb3}></div>
      </div>
      
      <div className="container">
        <div className={clsx(styles.heroContent, isVisible && styles.fadeIn)}>
          <div className={styles.badgeContainer}>
            <span className={styles.badge}>🚀 事件驱动</span>
            <span className={styles.badge}>⚡ 高性能</span>
            <span className={styles.badge}>🔒 自主可控</span>
          </div>
          
          <Heading as="h1" className={styles.heroTitle}>
            <span className={styles.gradientText}>{siteConfig.title}</span>
          </Heading>
          
          <p className={styles.heroSubtitle}>
            {siteConfig.tagline}
          </p>
          
          <div className={styles.heroDescription}>
            开源、自主可控的API设计平台，让数据接口开发更简单、更高效
          </div>
          
          <div className={styles.buttons}>
            <Link 
              className={styles.primaryButton}
              to="/docs/tutorial/intro"
            >
              <span>🚀 开始使用</span>
              <div className={styles.buttonGlow}></div>
            </Link>
            
            <Link
              className={styles.secondaryButton}
              to="https://preview.flexmodel.dev/"
            >
              <span>✨ 在线体验</span>
            </Link>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>100%</div>
              <div className={styles.statLabel}>开源</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>10+</div>
              <div className={styles.statLabel}>数据库支持</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>∞</div>
              <div className={styles.statLabel}>扩展性</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - 开源、自主可控的API设计平台`}
      description="开源、自主可控的API设计平台，让数据接口开发更简单、更高效">
      <HomepageHeader />
      <main className={styles.main}>
        <FeatureShowcase />
        <ArchitectureHighlights />
        <CTASection />
      </main>
    </Layout>
  );
}
