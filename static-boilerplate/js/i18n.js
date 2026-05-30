/* =============================================================================
 * i18n.js — tiny dictionary-based translation engine for the static template.
 *
 * Usage in HTML:
 *   <span data-i18n="home.headline"></span>           -> sets textContent
 *   <input data-i18n-placeholder="auth.emailPlaceholder">
 *   <button data-i18n-aria="theme.label">
 *   <button data-set-lang="zh">中文</button>          -> switches language
 *
 * Keys support dot paths and numeric array indices, e.g. "home.faq.items.0.question".
 * The chosen language is persisted to localStorage and <html lang> is updated.
 * ========================================================================== */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'msb-lang';
  var SUPPORTED = ['en', 'zh', 'es'];
  var LANG_NAMES = { en: 'English', zh: '中文', es: 'Español' };

  var DICT = {
    en: {
      common: {
        appName: 'MicroSaaS',
        copy: 'Copy',
        copied: 'Copied!',
        copyHtml: 'Copy HTML',
        download: 'Download',
        clear: 'Clear',
        reset: 'Choose another image',
      },
      nav: {
        home: 'Home',
        tools: 'Tools',
        pricing: 'Pricing',
        login: 'Login',
        signup: 'Get started',
      },
      theme: { label: 'Toggle theme' },
      language: { label: 'Change language' },
      footer: {
        description:
          'The fastest way to build and ship profitable micro SaaS tools.',
        product: 'Product',
        company: 'Company',
        resources: 'Resources',
        legal: 'Legal',
        links: {
          features: 'Features',
          pricing: 'Pricing',
          tools: 'Tools',
          about: 'About',
          blog: 'Blog',
          contact: 'Contact',
          docs: 'Documentation',
          support: 'Support',
          privacy: 'Privacy Policy',
          terms: 'Terms of Service',
        },
        rights: 'All rights reserved.',
        builtWith: 'Built with vanilla HTML, CSS & JavaScript.',
      },
      home: {
        badge: 'New tools every week',
        headline: 'Build & Launch Micro Tools in Hours',
        subtext:
          'A clean, framework-free starter with everything you need — dark mode, i18n and a growing library of client-side tools. Just open the files and start shipping.',
        ctaPrimary: 'Get started free',
        ctaSecondary: 'Explore tools',
        trustedBy: 'Trusted by indie hackers shipping fast',
        features: {
          title: 'Everything you need to ship',
          subtitle: 'Skip the setup. Focus on the product that makes you money.',
          items: [
            {
              title: 'Zero build step',
              description:
                'Pure HTML, CSS and JavaScript. Open the files in any browser — no Node.js, bundler or install required.',
            },
            {
              title: 'Global by default',
              description:
                'A simple dictionary-based i18n engine with English, Chinese and Spanish, plus a language switcher.',
            },
            {
              title: 'Beautiful dark mode',
              description:
                'Theme switching via CSS custom properties, with the preference saved to localStorage.',
            },
          ],
        },
        pricing: {
          title: 'Simple, transparent pricing',
          subtitle: 'Start free. Upgrade when you grow. Cancel anytime.',
          viewAll: 'View full pricing',
        },
        faq: {
          title: 'Frequently asked questions',
          subtitle: 'Everything you need to know before getting started.',
          items: [
            {
              question: 'Do I need to install anything?',
              answer:
                'No. This template is pure HTML, CSS and JavaScript. Just open index.html in your browser, or serve the folder with any static host.',
            },
            {
              question: 'How does the styling work?',
              answer:
                'It uses Tailwind CSS via the official CDN for utility classes, plus a small style.css for theme variables and custom components.',
            },
            {
              question: 'Are the tools really client-side?',
              answer:
                'Yes. The image compressor uses the Canvas API, the markdown preview uses marked.js, and the color converter is plain JavaScript. Nothing is uploaded.',
            },
            {
              question: 'Can I use this commercially?',
              answer:
                'Absolutely. Use it as the foundation for your own product — build, rebrand and sell whatever you create.',
            },
          ],
        },
        cta: {
          title: 'Ready to launch your next micro SaaS?',
          subtitle:
            'Join builders shipping profitable tools without reinventing the wheel.',
          button: 'Get started for free',
        },
      },
      tools: {
        title: 'Tools',
        subtitle:
          'A growing collection of fast, free, privacy-friendly tools that run entirely in your browser.',
        tryIt: 'Try it',
        items: {
          imageCompressor: {
            name: 'Image Compressor',
            short: 'Shrink JPG & PNG images right in your browser.',
          },
          markdownPreview: {
            name: 'Markdown Preview',
            short: 'Write Markdown and see the rendered HTML instantly.',
          },
          colorConverter: {
            name: 'Color Converter',
            short: 'Convert colors between HEX, RGB and HSL in real time.',
          },
        },
        imageCompressor: {
          title: 'Image Compressor',
          description:
            'Compress JPG and PNG images locally using the Canvas API. Your files never leave your device.',
          dropHint: 'Drop an image here or click to upload',
          quality: 'Quality',
          original: 'Original',
          compressed: 'Compressed',
          saved: 'Saved',
          noFile: 'Upload an image to get started',
          downloadCompressed: 'Download compressed image',
          reset: 'Choose another image',
        },
        markdownPreview: {
          title: 'Markdown Preview',
          description:
            'Type Markdown on the left and see the rendered output on the right. Copy the generated HTML with one click.',
          inputLabel: 'Markdown',
          previewLabel: 'Preview',
          copyHtml: 'Copy HTML',
          clear: 'Clear',
        },
        colorConverter: {
          title: 'Color Converter',
          description:
            'Convert any color between HEX, RGB and HSL. Edit one field and the others update instantly.',
          hex: 'HEX',
          rgb: 'RGB',
          hsl: 'HSL',
          preview: 'Preview',
          invalid: 'Invalid color value',
          pick: 'Pick a color',
        },
      },
      pricing: {
        title: 'Pricing that scales with you',
        subtitle:
          'Choose the plan that fits. Upgrade, downgrade or cancel at any time.',
        monthly: '/month',
        mostPopular: 'Most popular',
        faqNote:
          'Prices in USD. Taxes may apply. All plans include a 14-day money-back guarantee.',
        tiers: {
          starter: {
            name: 'Starter',
            price: '$0',
            description: 'For tinkerers exploring their first idea.',
            cta: 'Start for free',
            features: [
              'Access to all free tools',
              '1 active project',
              'Community support',
              'MicroSaaS branding',
            ],
          },
          pro: {
            name: 'Pro',
            price: '$19',
            description: 'For indie hackers shipping real products.',
            cta: 'Subscribe to Pro',
            features: [
              'Everything in Starter',
              'Unlimited projects',
              'Remove branding',
              'Priority email support',
              'Custom domains',
            ],
          },
          business: {
            name: 'Business',
            price: '$49',
            description: 'For teams and growing SaaS companies.',
            cta: 'Subscribe to Business',
            features: [
              'Everything in Pro',
              'Team seats (up to 10)',
              'Advanced analytics',
              'SSO & audit logs',
              'Dedicated support',
            ],
          },
        },
      },
      auth: {
        orContinueWith: 'Or continue with',
        google: 'Continue with Google',
        emailLabel: 'Email',
        emailPlaceholder: 'you@example.com',
        passwordLabel: 'Password',
        passwordPlaceholder: '••••••••',
        login: {
          title: 'Welcome back',
          subtitle: 'Log in to your account to continue.',
          submit: 'Log in',
          forgotPassword: 'Forgot password?',
          noAccount: "Don't have an account?",
          signupLink: 'Sign up',
          demoNote: 'This is a UI-only demo — no data is sent anywhere.',
        },
      },
    },

    zh: {
      common: {
        appName: 'MicroSaaS',
        copy: '复制',
        copied: '已复制！',
        copyHtml: '复制 HTML',
        download: '下载',
        clear: '清空',
        reset: '选择另一张图片',
      },
      nav: {
        home: '首页',
        tools: '工具',
        pricing: '定价',
        login: '登录',
        signup: '免费开始',
      },
      theme: { label: '切换主题' },
      language: { label: '切换语言' },
      footer: {
        description: '构建并发布盈利型微型 SaaS 工具的最快方式。',
        product: '产品',
        company: '公司',
        resources: '资源',
        legal: '法律',
        links: {
          features: '功能',
          pricing: '定价',
          tools: '工具',
          about: '关于我们',
          blog: '博客',
          contact: '联系我们',
          docs: '文档',
          support: '支持',
          privacy: '隐私政策',
          terms: '服务条款',
        },
        rights: '保留所有权利。',
        builtWith: '由原生 HTML、CSS 与 JavaScript 构建。',
      },
      home: {
        badge: '每周上新工具',
        headline: '数小时内构建并发布微型工具',
        subtext:
          '一个简洁、无需框架的起步模板，包含你所需的一切——深色模式、国际化以及不断增长的客户端工具库。直接打开文件即可开始发布。',
        ctaPrimary: '免费开始',
        ctaSecondary: '探索工具',
        trustedBy: '众多独立开发者正用它快速发布产品',
        features: {
          title: '发布所需的一切',
          subtitle: '跳过繁琐配置，专注于真正能赚钱的产品。',
          items: [
            {
              title: '零构建步骤',
              description:
                '纯 HTML、CSS 与 JavaScript。在任意浏览器中打开文件即可——无需 Node.js、打包器或安装。',
            },
            {
              title: '天生面向全球',
              description:
                '一个基于字典的简单国际化引擎，支持英文、中文与西班牙文，并附带语言切换器。',
            },
            {
              title: '精美的深色模式',
              description:
                '通过 CSS 自定义属性切换主题，并将偏好保存到 localStorage。',
            },
          ],
        },
        pricing: {
          title: '简单透明的定价',
          subtitle: '免费起步，成长后再升级，随时可取消。',
          viewAll: '查看完整定价',
        },
        faq: {
          title: '常见问题',
          subtitle: '开始之前你需要了解的一切。',
          items: [
            {
              question: '我需要安装任何东西吗？',
              answer:
                '不需要。该模板是纯 HTML、CSS 与 JavaScript。只需在浏览器中打开 index.html，或用任意静态托管服务提供该文件夹即可。',
            },
            {
              question: '样式是如何实现的？',
              answer:
                '它通过官方 CDN 使用 Tailwind CSS 的工具类，并配合一个小的 style.css 来定义主题变量与自定义组件。',
            },
            {
              question: '这些工具真的完全在客户端运行吗？',
              answer:
                '是的。图片压缩器使用 Canvas API，Markdown 预览使用 marked.js，颜色转换器是纯 JavaScript。任何内容都不会被上传。',
            },
            {
              question: '我可以将它用于商业用途吗？',
              answer:
                '当然可以。把它作为你自己产品的基础——构建、换标并销售你所创造的一切。',
            },
          ],
        },
        cta: {
          title: '准备好发布你的下一个微型 SaaS 了吗？',
          subtitle: '加入那些无需重复造轮子即可发布盈利工具的开发者。',
          button: '免费开始',
        },
      },
      tools: {
        title: '工具',
        subtitle:
          '一个不断增长的工具集合，快速、免费、注重隐私，完全在你的浏览器中运行。',
        tryIt: '试试看',
        items: {
          imageCompressor: {
            name: '图片压缩器',
            short: '在浏览器中直接压缩 JPG 与 PNG 图片。',
          },
          markdownPreview: {
            name: 'Markdown 预览',
            short: '编写 Markdown，即时查看渲染后的 HTML。',
          },
          colorConverter: {
            name: '颜色转换器',
            short: '在 HEX、RGB 与 HSL 之间实时转换颜色。',
          },
        },
        imageCompressor: {
          title: '图片压缩器',
          description:
            '使用 Canvas API 在本地压缩 JPG 与 PNG 图片。你的文件永远不会离开你的设备。',
          dropHint: '将图片拖到此处，或点击上传',
          quality: '质量',
          original: '原始',
          compressed: '压缩后',
          saved: '节省',
          noFile: '上传一张图片以开始',
          downloadCompressed: '下载压缩后的图片',
          reset: '选择另一张图片',
        },
        markdownPreview: {
          title: 'Markdown 预览',
          description:
            '在左侧输入 Markdown，在右侧查看渲染输出。一键复制生成的 HTML。',
          inputLabel: 'Markdown',
          previewLabel: '预览',
          copyHtml: '复制 HTML',
          clear: '清空',
        },
        colorConverter: {
          title: '颜色转换器',
          description:
            '在 HEX、RGB 与 HSL 之间转换任意颜色。编辑其中一个字段，其它字段会即时更新。',
          hex: 'HEX',
          rgb: 'RGB',
          hsl: 'HSL',
          preview: '预览',
          invalid: '无效的颜色值',
          pick: '选择颜色',
        },
      },
      pricing: {
        title: '随你成长的定价',
        subtitle: '选择适合你的方案。随时升级、降级或取消。',
        monthly: '/月',
        mostPopular: '最受欢迎',
        faqNote: '价格以美元计。可能需要缴税。所有方案均提供 14 天退款保证。',
        tiers: {
          starter: {
            name: '入门版',
            price: '¥0',
            description: '面向探索第一个想法的折腾者。',
            cta: '免费开始',
            features: [
              '使用所有免费工具',
              '1 个进行中的项目',
              '社区支持',
              'MicroSaaS 品牌标识',
            ],
          },
          pro: {
            name: '专业版',
            price: '¥138',
            description: '面向发布真实产品的独立开发者。',
            cta: '订阅专业版',
            features: [
              '包含入门版的全部功能',
              '无限项目',
              '去除品牌标识',
              '优先邮件支持',
              '自定义域名',
            ],
          },
          business: {
            name: '企业版',
            price: '¥348',
            description: '面向团队与成长中的 SaaS 公司。',
            cta: '订阅企业版',
            features: [
              '包含专业版的全部功能',
              '团队席位（最多 10 个）',
              '高级分析',
              '单点登录与审计日志',
              '专属支持',
            ],
          },
        },
      },
      auth: {
        orContinueWith: '或使用以下方式继续',
        google: '使用 Google 继续',
        emailLabel: '邮箱',
        emailPlaceholder: 'you@example.com',
        passwordLabel: '密码',
        passwordPlaceholder: '••••••••',
        login: {
          title: '欢迎回来',
          subtitle: '登录你的账户以继续。',
          submit: '登录',
          forgotPassword: '忘记密码？',
          noAccount: '还没有账户？',
          signupLink: '注册',
          demoNote: '这是一个仅供演示的界面——不会向任何地方发送数据。',
        },
      },
    },

    es: {
      common: {
        appName: 'MicroSaaS',
        copy: 'Copiar',
        copied: '¡Copiado!',
        copyHtml: 'Copiar HTML',
        download: 'Descargar',
        clear: 'Borrar',
        reset: 'Elegir otra imagen',
      },
      nav: {
        home: 'Inicio',
        tools: 'Herramientas',
        pricing: 'Precios',
        login: 'Iniciar sesión',
        signup: 'Comenzar',
      },
      theme: { label: 'Cambiar tema' },
      language: { label: 'Cambiar idioma' },
      footer: {
        description:
          'La forma más rápida de crear y lanzar micro herramientas SaaS rentables.',
        product: 'Producto',
        company: 'Empresa',
        resources: 'Recursos',
        legal: 'Legal',
        links: {
          features: 'Funciones',
          pricing: 'Precios',
          tools: 'Herramientas',
          about: 'Acerca de',
          blog: 'Blog',
          contact: 'Contacto',
          docs: 'Documentación',
          support: 'Soporte',
          privacy: 'Política de privacidad',
          terms: 'Términos del servicio',
        },
        rights: 'Todos los derechos reservados.',
        builtWith: 'Creado con HTML, CSS y JavaScript puros.',
      },
      home: {
        badge: 'Nuevas herramientas cada semana',
        headline: 'Crea y lanza micro herramientas en horas',
        subtext:
          'Una plantilla limpia y sin framework con todo lo que necesitas: modo oscuro, i18n y una creciente biblioteca de herramientas del lado del cliente. Solo abre los archivos y empieza a publicar.',
        ctaPrimary: 'Empieza gratis',
        ctaSecondary: 'Explorar herramientas',
        trustedBy: 'La eligen creadores independientes que lanzan rápido',
        features: {
          title: 'Todo lo que necesitas para lanzar',
          subtitle:
            'Olvídate de la configuración. Concéntrate en el producto que te hace ganar dinero.',
          items: [
            {
              title: 'Sin paso de compilación',
              description:
                'HTML, CSS y JavaScript puros. Abre los archivos en cualquier navegador: no se requiere Node.js, empaquetador ni instalación.',
            },
            {
              title: 'Global desde el primer día',
              description:
                'Un sencillo motor de i18n basado en diccionario con inglés, chino y español, además de un selector de idioma.',
            },
            {
              title: 'Modo oscuro precioso',
              description:
                'Cambio de tema mediante variables CSS, con la preferencia guardada en localStorage.',
            },
          ],
        },
        pricing: {
          title: 'Precios simples y transparentes',
          subtitle: 'Empieza gratis. Mejora cuando crezcas. Cancela cuando quieras.',
          viewAll: 'Ver todos los precios',
        },
        faq: {
          title: 'Preguntas frecuentes',
          subtitle: 'Todo lo que necesitas saber antes de empezar.',
          items: [
            {
              question: '¿Necesito instalar algo?',
              answer:
                'No. Esta plantilla es HTML, CSS y JavaScript puros. Solo abre index.html en tu navegador o sirve la carpeta con cualquier host estático.',
            },
            {
              question: '¿Cómo funciona el estilo?',
              answer:
                'Usa Tailwind CSS a través del CDN oficial para las clases de utilidad, más un pequeño style.css para las variables de tema y los componentes personalizados.',
            },
            {
              question: '¿Las herramientas son realmente del lado del cliente?',
              answer:
                'Sí. El compresor de imágenes usa la API Canvas, la vista previa de Markdown usa marked.js y el conversor de color es JavaScript puro. No se sube nada.',
            },
            {
              question: '¿Puedo usarlo comercialmente?',
              answer:
                'Por supuesto. Úsalo como base de tu propio producto: crea, personaliza la marca y vende lo que construyas.',
            },
          ],
        },
        cta: {
          title: '¿Listo para lanzar tu próximo micro SaaS?',
          subtitle:
            'Únete a los creadores que lanzan herramientas rentables sin reinventar la rueda.',
          button: 'Empieza gratis',
        },
      },
      tools: {
        title: 'Herramientas',
        subtitle:
          'Una colección creciente de herramientas rápidas, gratuitas y respetuosas con la privacidad que funcionan totalmente en tu navegador.',
        tryIt: 'Probar',
        items: {
          imageCompressor: {
            name: 'Compresor de imágenes',
            short: 'Reduce imágenes JPG y PNG directamente en tu navegador.',
          },
          markdownPreview: {
            name: 'Vista previa de Markdown',
            short: 'Escribe Markdown y ve el HTML renderizado al instante.',
          },
          colorConverter: {
            name: 'Conversor de color',
            short: 'Convierte colores entre HEX, RGB y HSL en tiempo real.',
          },
        },
        imageCompressor: {
          title: 'Compresor de imágenes',
          description:
            'Comprime imágenes JPG y PNG localmente con la API Canvas. Tus archivos nunca salen de tu dispositivo.',
          dropHint: 'Arrastra una imagen aquí o haz clic para subir',
          quality: 'Calidad',
          original: 'Original',
          compressed: 'Comprimida',
          saved: 'Ahorrado',
          noFile: 'Sube una imagen para empezar',
          downloadCompressed: 'Descargar imagen comprimida',
          reset: 'Elegir otra imagen',
        },
        markdownPreview: {
          title: 'Vista previa de Markdown',
          description:
            'Escribe Markdown a la izquierda y mira el resultado renderizado a la derecha. Copia el HTML generado con un clic.',
          inputLabel: 'Markdown',
          previewLabel: 'Vista previa',
          copyHtml: 'Copiar HTML',
          clear: 'Borrar',
        },
        colorConverter: {
          title: 'Conversor de color',
          description:
            'Convierte cualquier color entre HEX, RGB y HSL. Edita un campo y los demás se actualizan al instante.',
          hex: 'HEX',
          rgb: 'RGB',
          hsl: 'HSL',
          preview: 'Vista previa',
          invalid: 'Valor de color no válido',
          pick: 'Elegir un color',
        },
      },
      pricing: {
        title: 'Precios que crecen contigo',
        subtitle:
          'Elige el plan que encaje. Mejora, reduce o cancela cuando quieras.',
        monthly: '/mes',
        mostPopular: 'Más popular',
        faqNote:
          'Precios en USD. Pueden aplicarse impuestos. Todos los planes incluyen garantía de devolución de 14 días.',
        tiers: {
          starter: {
            name: 'Inicial',
            price: '$0',
            description: 'Para curiosos que exploran su primera idea.',
            cta: 'Empezar gratis',
            features: [
              'Acceso a todas las herramientas gratuitas',
              '1 proyecto activo',
              'Soporte de la comunidad',
              'Marca MicroSaaS',
            ],
          },
          pro: {
            name: 'Pro',
            price: '$19',
            description: 'Para creadores independientes que lanzan productos reales.',
            cta: 'Suscribirse a Pro',
            features: [
              'Todo lo del plan Inicial',
              'Proyectos ilimitados',
              'Eliminar la marca',
              'Soporte prioritario por correo',
              'Dominios personalizados',
            ],
          },
          business: {
            name: 'Business',
            price: '$49',
            description: 'Para equipos y empresas SaaS en crecimiento.',
            cta: 'Suscribirse a Business',
            features: [
              'Todo lo del plan Pro',
              'Asientos de equipo (hasta 10)',
              'Analíticas avanzadas',
              'SSO y registros de auditoría',
              'Soporte dedicado',
            ],
          },
        },
      },
      auth: {
        orContinueWith: 'O continúa con',
        google: 'Continuar con Google',
        emailLabel: 'Correo electrónico',
        emailPlaceholder: 'tu@ejemplo.com',
        passwordLabel: 'Contraseña',
        passwordPlaceholder: '••••••••',
        login: {
          title: 'Bienvenido de nuevo',
          subtitle: 'Inicia sesión en tu cuenta para continuar.',
          submit: 'Iniciar sesión',
          forgotPassword: '¿Olvidaste tu contraseña?',
          noAccount: '¿No tienes una cuenta?',
          signupLink: 'Regístrate',
          demoNote: 'Esto es una demo solo de interfaz: no se envían datos a ningún sitio.',
        },
      },
    },
  };

  function getStoredLang() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function detectLang() {
    var stored = getStoredLang();
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    var nav = (navigator.language || 'en').toLowerCase();
    if (nav.indexOf('zh') === 0) return 'zh';
    if (nav.indexOf('es') === 0) return 'es';
    return 'en';
  }

  var currentLang = detectLang();

  /** Resolve a dot-path key (with numeric indices) against a dictionary. */
  function resolve(dict, key) {
    var parts = key.split('.');
    var node = dict;
    for (var i = 0; i < parts.length; i++) {
      if (node == null) return undefined;
      node = node[parts[i]];
    }
    return node;
  }

  /** Translate a key for the current language (falls back to English). */
  function t(key) {
    var val = resolve(DICT[currentLang], key);
    if (val == null) val = resolve(DICT.en, key);
    return val == null ? key : val;
  }

  /** Apply translations to the whole document. */
  function apply() {
    document.documentElement.setAttribute('lang', currentLang);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var val = t(el.getAttribute('data-i18n'));
      if (typeof val === 'string') el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var val = t(el.getAttribute('data-i18n-placeholder'));
      if (typeof val === 'string') el.setAttribute('placeholder', val);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var val = t(el.getAttribute('data-i18n-aria'));
      if (typeof val === 'string') el.setAttribute('aria-label', val);
    });

    // Reflect the active language in any switcher UI.
    document.querySelectorAll('[data-set-lang]').forEach(function (el) {
      el.classList.toggle(
        'is-active',
        el.getAttribute('data-set-lang') === currentLang
      );
    });
    var label = document.querySelector('[data-lang-current]');
    if (label) label.textContent = LANG_NAMES[currentLang];

    // Let pages re-render dynamic content (e.g. tool defaults) on lang change.
    document.dispatchEvent(
      new CustomEvent('i18n:applied', { detail: { lang: currentLang } })
    );
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* ignore */
    }
    apply();
  }

  function init() {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-set-lang]');
      if (trigger) {
        e.preventDefault();
        setLang(trigger.getAttribute('data-set-lang'));
      }
    });
    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.I18n = {
    t: t,
    apply: apply,
    setLang: setLang,
    getLang: function () {
      return currentLang;
    },
    languages: SUPPORTED,
    names: LANG_NAMES,
  };
})(window);
