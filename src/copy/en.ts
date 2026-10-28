import faqs from '@data/faqs.json';
import features from '@data/features.json';
import pricing from '@data/pricing.json';

/**
 * English copy table. This file defines the shape every other locale must
 * satisfy (see `Copy` in `./index.ts`), so a missing translation fails
 * `astro check` instead of leaking English onto a localised page.
 *
 * Paths are unlocalised (`/learn/`, not `/zh-cn/learn/`); callers
 * run them through `localePath()` from `@utils/locale`.
 */
export const en = {
  site: {
    /** Default `<meta name="description">` when a page sets none. */
    description:
      'Learn photography fundamentals through clear bilingual guides, visual explanations, and interactive experiments for sensor formats, focal length, and exposure.',
    /** schema.org `WebSite.description` in every page's `isPartOf`. */
    descriptionShort:
      'A bilingual field guide for learning photography through clear explanations and visual experiments.',
    ogTitle: 'Photography Field Guide: Understand Your Camera',
    ogDescription:
      'Build a solid photography foundation with practical guides to sensor sizes, equivalent focal length, aperture, shutter speed, and ISO.',
  },

  layout: {
    skipToContent: 'Skip to content',
    changeLanguage: 'Change language',
    toggleNavigation: 'Toggle navigation',
    darkTheme: 'Dark Theme Toggle',
    lightTheme: 'Light Theme Toggle',
    toggleTheme: 'Toggle theme',
  },

  nav: {
    /** Labels for `navLinks` in `@data/navigation`, keyed by id. */
    labels: {
      home: 'Home',
      learn: 'Learn',
    },
    footer: {
      /** Section titles and link labels for `footerSections` in `@data/navigation`, keyed by id. */
      sectionTitles: {
        learn: 'Explore',
        project: 'Resources',
      },
      links: {
        orientation: 'Start here',
        sensorFormats: 'Sensor formats',
        equivalentFocalLength: 'Equivalent focal length',
        exposureTriangle: 'Exposure triangle',
        repository: 'GitHub repository',
      },
      hiringBadge: "We're hiring!",
      stayUpToDate: 'Photography Field Guide',
      stayUpToDateContent:
        'Clear, practical photography fundamentals in English and Chinese, with visual explanations designed for curious beginners.',
      craftedBy: 'An open learning project.',
      newsletterDemoMessage:
        'Thanks! (Demo only — wire an email service to collect real subscribers.)',
    },
    /** Text for the optional mega menu (`@data/mega_link`). */
    megaMenu: {
      services: {
        guides: {
          title: 'Explore Advice and Explanations',
          description:
            "Dive deep into helpful guides and explanations for all of ScrewFast's features",
        },
        integrations: {
          title: 'Discover Integrations',
          description:
            'Supercharge Your Workflow. Seamless integrations with all your favorite tools',
        },
        experts: {
          title: 'Expert Services',
          description: "Go beyond tools with ScrewFast's expert services",
        },
        tools: {
          title: 'Cutting-Edge Tools',
          description:
            "Build Smarter, Faster. Experience next-level efficiency with ScrewFast's cutting-edge construction tools",
        },
        plans: {
          title: 'Simple Plans',
          description:
            "Boost your efficiency with ScrewFast's straightforward, value-driven plans",
        },
        community: {
          title: 'Community Forum',
          description: 'Learn, share, and connect with other ScrewFast users',
        },
      },
      successStories: 'Success Stories',
      successStory: {
        description:
          'See how ScrewFast has empowered businesses of all sizes to achieve outstanding results.',
        imageAlt: 'Portrait of a smiling person',
      },
      learnMore: 'Learn more',
    },
  },

  forms: {
    email: 'Email',
    emailAddress: 'Email address',
    emailPlaceholder: 'Enter your email',
    emailInvalid:
      'Please include a valid email address so we can get back to you',
    subscribe: 'Subscribe',
    phone: 'Phone Number',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot password?',
    passwordHint: '8+ characters required',
    passwordMismatch: 'Password does not match the password',
    rememberMe: 'Remember me',
    acceptTerms: 'I accept the ',
    termsAndConditions: 'Terms and Conditions',
    or: 'Or',
    demoFallbackMessage: 'Demo only — this form is not connected to a backend.',
  },

  auth: {
    logIn: 'Log in',
    signIn: 'Sign in',
    signUp: 'Sign up',
    signInWithGoogle: 'Sign in with Google',
    signUpWithGoogle: 'Sign up with Google',
    noAccountYet: "Don't have an account yet?",
    signUpHere: 'Sign up here',
    alreadyHaveAccount: 'Already have an account?',
    signInHere: 'Sign in here',
    forgotPasswordTitle: 'Forgot password?',
    rememberYourPassword: 'Remember your password?',
    resetPassword: 'Reset password',
    credentialsDemoNotice:
      'Demo only – connect a real auth provider before collecting credentials.',
    recoveryDemoNotice:
      'Demo only – password recovery is not connected to a backend.',
    signInDemoMessage: 'Demo only – sign-in is not connected to a backend.',
    registerDemoMessage:
      'Demo only – registration is not connected to a backend.',
    recoverDemoMessage:
      'Demo only – password recovery is not connected to a backend.',
  },

  share: {
    share: 'Share',
    shareOn: (platform: string) => `Share on ${platform}`,
    copied: 'Copied',
    copyLink: 'Copy link',
  },

  banner: {
    dismiss: 'Dismiss',
    region: 'Informational banner',
  },

  blog: {
    readMore: 'Read More',
    minRead: (minutes: number) => `${minutes} min read`,
    relatedArticles: 'Related articles',
    wasHelpful: 'Was this post helpful?',
    yes: 'Yes',
    no: 'No',
    ogSection: 'Blog',
  },

  insights: {
    readMore: 'Read more',
    tableOfContents: 'Table of Contents:',
    ogSection: 'Insights',
  },

  products: {
    ogSection: 'Hardware Tools',
    tabs: 'Tabs',
  },

  notFound: {
    title: 'Page Not Found',
    subTitle: 'This frame is empty.',
    content:
      'The page may have moved, but your photography learning path is still right here.',
    goHome: 'Go Home',
    goBack: 'Go Back',
  },

  home: {
    heroAlt: {
      title: 'Photography, explained visually.',
      subTitle: 'Learn the camera fundamentals that shape every photograph.',
      btn: 'Start learning',
    },
    eyebrow: 'A practical bilingual guide for new photographers',
    hero: {
      title:
        'Understand your camera.<br /><span class="text-amber-500 dark:text-amber-400">See the light.</span>',
      subTitle:
        'Clear explanations and visual experiments help you connect sensor size, focal length, aperture, shutter speed, and ISO—without the jargon wall.',
      primaryBtn: 'Start learning',
      secondaryBtn: 'Compare sensor sizes',
    },
    sensor: {
      title: 'One lens. Different fields of view.',
      caption:
        'A dimensionally proportional crop with the same lens and camera position',
      fullFrame: 'Full frame',
      apsc: 'APS-C',
      fullFrameSize: '36 × 24 mm',
      apscSize: '23.5 × 15.7 mm (Fujifilm X-T5)',
      note: 'Drawn to scale: 10 SVG units represent 1 mm. The APS-C rectangle is an X-T5 example, not a universal APS-C size. The diagram compares sensor areas; it does not change the lens focal length.',
    },
    pathways: {
      title: 'Start with the fundamentals',
      subTitle:
        'Follow a short path from sensor size to exposure. Each guide builds on the previous one and gives you concepts you can test with your own camera.',
      items: [
        {
          id: 'sensors',
          title: 'Sensor formats',
          description:
            'See what full frame and APS-C actually change—and what they do not.',
          linkText: 'Explore sensor sizes',
        },
        {
          id: 'focal',
          title: 'Equivalent focal length',
          description:
            'Learn why the same lens can produce a tighter field of view on a smaller sensor.',
          linkText: 'Understand crop factor',
        },
        {
          id: 'exposure',
          title: 'The exposure triangle',
          description:
            'Separate image brightness from depth of field, motion blur, and the light reaching the sensor.',
          linkText: 'Learn aperture, shutter & ISO',
        },
      ],
    },
    cta: {
      title: 'Build understanding before buying more gear.',
      subTitle:
        'Start with a short orientation, then explore the basics at your own pace in English or Chinese.',
      button: 'Read the orientation',
    },
  },

  services: {
    title: 'Services',
    metaDescription:
      'Uniting expertise with your vision, ScrewFast provides exceptional service and comprehensive solutions in the hardware and construction industry, from consultation to project completion.',
    ogTitle: 'Expert Consultation Services | ScrewFast',
    intro: {
      title: 'Uniting Expertise with Your Vision',
      subTitle:
        'At ScrewFast, we take pride in providing comprehensive solutions and exceptional service in the hardware and construction industry. Our experienced team is dedicated to supporting your project from inception to completion with a range of specialized services.',
      cta: 'Schedule a Consultation',
    },
    articles: {
      guidance: {
        title: 'Delivering Expert Guidance',
        subTitle:
          'Embarking on a construction project can be overwhelming. With our professional consultation services, we guide you through every stage, ensuring you make informed decisions. Whether you are a DIY enthusiast or a skilled contractor, our experts are on hand to offer tailored advice on product selection, project scope, and compliance with local regulations.',
        imageAlts: [
          'Blueprints and digital tablet with construction plans.',
          'Person working in the office',
        ],
      },
      craftsmanship: {
        title: 'Transforming Designs into Reality',
        subTitle:
          'Our skilled craftsmen bring precision and excellence to every construction project. From minor installations to substantial structural work, ScrewFast offers reliable construction services to turn your plans into tangible outcomes. We ensure the highest standards of safety and workmanship, utilizing top-quality tools and materials from our extensive inventory.',
        imageAlts: ['Construction site before and after'],
        cta: 'Learn More',
      },
      oversight: {
        title: 'Navigating Projects with Professional Oversight',
        subTitle:
          'Effective project management is at the heart of any successful build. ScrewFast provides thorough planning and robust management services that keep your project on time and within budget. Let us handle the complexities of workflow coordination, resource allocation, and stakeholder communication while you focus on your vision.',
        imageAlts: [
          'Construction workers orchestrating a project',
          'Aerial view of managed construction',
        ],
      },
      maintenance: {
        title: 'Ensuring Long-lasting Performance',
        subTitle:
          "Our commitment to your project doesn't end at completion. ScrewFast offers ongoing maintenance and support services to ensure your construction's longevity and performance. From regular check-ups to emergency assistance, our responsive team is there to provide seamless support.",
        imageAlts: [
          'Man in orange and black vest wearing white helmet holding yellow and black power tool',
        ],
      },
      bespoke: {
        title: 'Crafting Bespoke Strategies for Unique Challenges',
        subTitle:
          'For our larger enterprise clients, ScrewFast offers custom solutions designed to meet specific industry challenges. By understanding your unique needs, we engineer tailored strategies aimed at optimizing your operations, enhancing efficiency, and driving your business forward.',
        imageAlts: [
          'In progress building structure',
          'Brown and gray building under construction',
        ],
        cta: 'Read more',
      },
    },
    stats: {
      title: 'By the Numbers',
      subTitle:
        'Our commitment to quality and reliability is evident in every project we undertake. At ScrewFast, we are dedicated to delivering industry-leading services that ensure your construction projects are built to last.',
      mainStatTitle: '96%',
      mainStatSubTitle:
        'of our clients rate their experience with ScrewFast as exceptional',
      stats: [
        { stat: '99.8%', description: 'project completion rate' },
        { stat: '5,000+', description: 'successful installations' },
        { stat: '85%', description: 'client growth year-over-year' },
      ],
    },
  },

  contact: {
    title: 'Contact',
    metaDescription:
      "Have questions or want to discuss a project? Reach out, and let's craft the perfect solution with our tools and services.",
    ogTitle: 'Contact Us | ScrewFast',
    heading: 'Contact us',
    subTitle:
      "Have questions or want to discuss a project? Reach out, and let's craft the perfect solution with our tools and services.",
    formTitle: 'Fill in the form below',
    formSubTitle: "We'll get back to you in 1-2 business days.",
    firstName: 'First Name',
    lastName: 'Last Name',
    details: 'Details',
    send: 'Send Message',
    demoMessage:
      'Thanks! (Demo only — wire a form endpoint to receive real messages.)',
    knowledgeHeading: 'Knowledgebase',
    knowledgeContent: 'Browse through all of our knowledgebase articles.',
    knowledgeLink: 'Visit guides & tutorials',
    faqHeading: 'FAQ',
    faqContent: 'Explore our FAQ for quick, clear answers to common queries.',
    faqLink: 'Visit FAQ',
    officeHeading: 'Visit our office',
    officeContent: 'UK ScrewFast',
    emailHeading: 'Contact us by email',
    emailContent: 'Prefer the written word? Drop us an email at',
  },

  blogIndex: {
    title: 'Blog',
    metaDescription:
      "Stay up-to-date with the latest trends and developments in the construction industry with insights from ScrewFast's team of industry experts.",
    ogTitle: 'Construction Industry Blog | ScrewFast',
    heading: 'Your Gateway to Construction Excellence',
    subTitle:
      'Explore the latest news, tips, and insights from ScrewFast to enhance your construction projects. From product spotlights to project management strategies, our blog is your go-to resource for all things hardware and construction.',
    insightsHeading: 'Insights',
    insightsSubTitle:
      "Stay up-to-date with the latest trends and developments in the construction industry with insights from ScrewFast's team of industry experts. ",
    noPosts: 'No blog posts yet. Check back soon.',
    noInsights: 'No insights yet. Check back soon.',
  },

  productsIndex: {
    title: 'Products',
    metaDescription:
      'Explore the durability and precision of ScrewFast tools, designed for both professionals and enthusiasts.',
    ogTitle: 'Hardware Tools | ScrewFast',
    heading: 'Products',
    subTitle:
      'Explore the durability and precision of ScrewFast tools, designed for both professionals and enthusiasts. Each of our products is crafted with precision and built to last, ensuring you have the right tool for every job.',
    customerStories: 'Customer Stories',
    testimonials: {
      title: 'What Our Customers Say',
      quotes: [
        {
          content:
            ' "Since switching to ScrewFast\'s hardware tools, the efficiency on our construction sites has skyrocketed. The durability of the hex bolts and precision of the machine screws are simply unmatched. It\'s refreshing to work with a company that truly understands the daily demands of the industry." ',
          author: 'Jason Clark',
          role: 'Site Foreman | TopBuild',
          avatarAlt: 'Image Description',
        },
        {
          content:
            ' "As an interior designer, I\'m always looking for high-quality materials and tools that help bring my visions to life. ScrewFast\'s mixed screws assortment has been a game-changer for my projects, providing the perfect blend of quality and variety. The outstanding customer support was just the cherry on top!" ',
          author: 'Maria Gonzalez',
          role: 'Interior Designer | Creative Spaces',
          avatarAlt: 'Image Description',
        },
        {
          content:
            " \"I've been a professional carpenter for over 15 years, and I can sincerely say that ScrewFast's tap bolts and nuts are some of the best I've used. They grip like no other, and I have full confidence in every joint and fixture. Plus, the service is impeccable – they truly care about my project's success.\" ",
          author: 'Richard Kim',
          role: 'Master Carpenter | WoodWright',
          avatarAlt: 'Image Description',
        },
      ],
    },
    stats: {
      title: 'Why Choose ScrewFast?',
      subTitle:
        "Transform your ideas into tangible results with ScrewFast tools. Whether you're starting with a sketch on a napkin or diving into a comprehensive construction project, our tools are engineered to help you build with confidence.",
      benefits: [
        'Robust and reliable tools for long-lasting performance.',
        'Innovative solutions tailored to modern construction needs.',
        "Customer support dedicated to your project's success.",
      ],
    },
  },

  /** Locale-specific JSON data (already the good pattern; kept as-is). */
  data: { faqs, features, pricing },
};
