import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type * as Redocusaurus from 'redocusaurus';

const config: Config = {
  title: 'Flexmodel',
  tagline: '面向下一代应用程序的统一数据访问层，开源、免费、支持私有化部署',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://flexmode.wetech.tech',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'metacode-org', // Usually your GitHub org/user name.
  projectName: 'flexmodel', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
              'https://github.com/flexmodel-dev/flexmodel-website/edit/main',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
    [
      'redocusaurus',
      {
        // Plugin Options for loading OpenAPI files
        specs: [
          // You can also pass it a OpenAPI spec URL
          {
            spec: 'https://preview.flexmodel.dev/api/v1/openapi',
            // spec: 'http://localhost:8080/q/openapi',
            // spec: 'https://petstore.swagger.io/v2/swagger.json',
            route: '/openapi/',
          },
        ],
        // Theme Options for modifying how redoc renders them
        theme: {
          // Change with your site colors
          primaryColor: '#1890ff',
          options: {
            disableSearch: true
          }
        },
      },
    ] satisfies Redocusaurus.PresetEntry,
  ],

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            from: '/docs',
            to: '/docs/tutorial/intro',
          },
        ],
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',

    // Color mode configuration
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },

    navbar: {
      title: 'Flexmodel',
      logo: {
        alt: 'Flexmodel Logo',
        src: 'img/logo.png',
      },
      items: [
        /*{
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '使用手册',
        },*/
        {to: '/docs/tutorial/intro', sidebarId: 'tutorialSidebar', label: '文档', position: 'left'},
        {to: '/docs/api', label: 'API', sidebarId: 'apiSidebar', position: 'left'},
        /*   {to: '/blog', label: 'Blog', position: 'left'},*/
        {
          href: 'https://preview.flexmodel.dev',
          label: '在线预览',
          position: 'right',
        },
        {
          href: 'https://github.com/flexmodel-dev',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `© 2024 Flexmodel All rights reserved. Inc. <a href="https://beian.miit.gov.cn" target="_blank">苏ICP备2024089717号</a>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
