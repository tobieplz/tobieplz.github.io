import type { Content } from './schema'
import { hidden, text } from './text'

export const content: Content = {
  locale: 'en',
  title: 'Senior Product Engineer',
  tagline: 'Frontend, design & AI',

  meta: {
    index: {
      title: 'Tobias Sjösten · Senior Product Engineer',
      description:
        'Senior product engineer with 13+ years across frontend, design and AI. Selected work, clients and experience.',
    },
    notFound: {
      title: 'Not found · Tobias Sjösten',
      description: 'There is no page at this address.',
    },
  },

  nav: {
    skip: 'Skip to content',
    language: 'Language',
    invert: 'Invert colours',
  },

  vault: {
    client: 'Client',
    employer: 'Employer',
    hiddenName: (label) => `${label}, name hidden. Press to enter the passphrase.`,
    passphrase: 'Passphrase',
    withheld: (count) => `${count} names withheld`,
    hint: 'Got the passphrase? Tap any black cell.',
    entering: 'Type the passphrase. Enter to try, Esc to cancel.',
    checking: 'Deriving key',
    denied: 'Denied. That is not the passphrase.',
    unavailable: 'Unlocking needs a secure (https) connection.',
    declassified: (count) => `Declassified. ${count} names revealed.`,
    lock: 'Lock',
  },

  index: {
    lead: text`I build things for the web, and I usually design them too. Thirteen-plus years in, I have been the developer, the designer and, for a while, the head of development, for startups, agencies and some very large organisations.`,

    about: {
      heading: 'About',
      portraitAlt: 'Portrait of Tobias Sjösten',
      facts: [
        { label: 'Role', value: 'Senior Product Engineer' },
        { label: 'Since', value: '2013' },
        { label: 'Focus', value: 'Frontend, design, AI' },
        { label: 'Clients', value: '20+, from startups to large organisations' },
        { label: 'Languages', value: 'Swedish, English' },
      ],
      bio: [
        text`Hi, I’m Tobias. I started out in 2013 making iOS apps and websites, moved into design engineering, ran development for a fintech product, and have spent the last few years as a senior frontend consultant. Along the way I have worked in Vue and React, in CMSs and e-commerce platforms, and in Figma about as much as in the editor.`,
        text`I like being early on new tools. Lately that means AI, which is now part of everything I do: working out what to build, sketching and designing it, and writing the code.`,
        text`I’m happy in a small team where things move quickly, and just as happy on the long haul in a big project. Give me a problem and some trust and I’ll take it from idea to shipped, or lead the team that does.`,
        text`The work is listed below. The names are blacked out because clients like their privacy. If I gave you a passphrase, tap any black cell and type it in.`,
      ],
    },

    columns: {
      number: 'No.',
      years: 'Years',
      client: 'Client',
      role: 'Role',
      stack: 'Stack',
    },

    work: {
      heading: 'Selected work',
      details: (label) => `Details for ${label}`,
      projects: [
        {
          client: 'c01',
          years: '2026',
          sector: 'E-commerce',
          role: 'AI engineer & frontend developer',
          stack: ['Vue 3', 'TypeScript', 'Pinia', 'Shopify'],
          story: [
            text`Designed and built the whole web platform for ${hidden('c01')}, from the first visual direction to the finished thing on desktop and mobile.`,
            text`The frontend is Vue 3 and TypeScript: responsive views, animations, several languages, and proper SEO with metadata and structured data. Behind it sits a headless Shopify setup with product listings, product pages, variants, cart and checkout, plus a booking flow that runs through an external form service.`,
          ],
        },
        {
          client: 'c02',
          years: '2024–2025',
          sector: 'Food & beverage',
          role: 'AI engineer & frontend developer',
          stack: ['React', 'TypeScript', 'Next.js'],
          story: [
            text`Frontend on the next version of the internal system at ${hidden('c02')}, the one their staff use to keep track of machines out at customers. Mostly it was about making it responsive and pleasant to use, with a fair amount of data handling and charts. I made the smaller design calls as we went.`,
            text`This is also where I started using AI in earnest, to build and improve the charts and visualisations.`,
          ],
        },
        {
          client: 'c03',
          years: '2024–2026',
          sector: 'Healthcare',
          role: 'AI engineer & frontend developer',
          stack: ['WordPress', 'React'],
          story: [
            text`Ongoing frontend work on the websites and digital services of ${hidden('c03')}: WordPress with React components on top, tuned for speed, small screens and a good experience.`,
            text`Theme work, plus integrations with the WordPress REST API so the content stays dynamic and the editors’ day stays easy.`,
          ],
        },
        {
          client: 'c04',
          years: '2023–2025',
          sector: 'Public sector',
          role: 'Frontend developer',
          stack: ['WordPress', 'WooCommerce', 'Python'],
          story: [
            text`Kept the online catalogue of ${hidden('c04')} running and improving. It is an e-commerce site that schools and municipalities order from. Frontend in WordPress and WooCommerce, with theme work, REST API integrations and a lot of product data. I also went into the legacy code to make things faster.`,
            text`On the side I extended the Python scripts that import Excel and CSV files into WooCommerce, and wrote new ones to fetch, convert and sanity-check product data.`,
          ],
        },
        {
          client: 'c05',
          years: '2023–2024',
          sector: 'Industry organisation',
          role: 'Frontend developer',
          stack: ['Optimizely'],
          story: [
            text`Frontend developer on the build of the new ${hidden('c05', 'site')}, in Optimizely CMS, with a heavy focus on accessibility (WCAG) and on being easy to use.`,
          ],
        },
        {
          client: 'c06',
          years: '2021–2023',
          sector: 'Logistics',
          role: 'Frontend developer & designer',
          stack: ['Vue', 'Figma'],
          story: [
            text`Designer and frontend developer for all the business services of ${hidden('c06', 'short')}. Vue on the frontend, responsive design, and flows tuned for both desktop and mobile.`,
          ],
        },
        {
          client: 'c07',
          years: '2019–2021',
          sector: 'Insurtech',
          role: 'Head of development & frontend developer',
          stack: ['Vue', 'Figma'],
          story: [
            text`Head of development and frontend developer at ${hidden('c07', 'short')}, a digital credit insurance for small and medium-sized businesses. I drove the product forward together with product and design.`,
            text`I built the web app, with BankID login and signing, and an API that issues credit insurance per invoice, with the insurance PDFs signed through Scrive. I also wrote the API and developer docs in ReadMe, complete with a live demo.`,
            text`Around that: evaluating and looking after third-party integrations (currency data, regional payment methods, KYC, company data, e-signing), advising on innovation projects across the group, and working with legal and compliance on EU-ready agreements and insurance terms.`,
          ],
        },
      ],
    },

    clients: {
      heading: 'More clients',
      engagements: [
        { client: 'c08', work: 'Digital system' },
        { client: 'c09', sector: 'Retail', work: 'Website' },
        { client: 'c10', sector: 'Gaming', work: 'Website' },
        { client: 'c11', sector: 'Consulting', work: 'Website' },
        { client: 'c12', sector: 'Insurance', work: 'Chatbot' },
        { client: 'c13', sector: 'Agency', work: 'Website' },
        { client: 'c14', sector: 'Industry', work: 'iOS app' },
        { client: 'c15', sector: 'Insurance', work: 'Online sales tool' },
        { client: 'c16', sector: 'Construction', work: 'Digital services' },
        { client: 'c17', sector: 'Non-profit', work: 'Website' },
        { client: 'c18', sector: 'Retail', work: 'iOS app' },
        { client: 'c19', sector: 'Media', work: 'Digital system' },
        { client: 'c20', sector: 'Industry', work: 'iOS app' },
      ],
    },

    experience: {
      heading: 'Experience',
      jobs: [
        { employer: 'e01', years: '2023–now', title: 'Senior frontend developer' },
        {
          employer: 'e02',
          years: '2021–2023',
          title: 'Senior frontend developer & design engineer',
        },
        { employer: 'e03', years: '2019–2021', title: 'Senior frontend developer' },
        { employer: 'e04', years: '2018–2019', title: 'Design engineer' },
        { employer: 'e05', years: '2015–2018', title: 'iOS & web developer' },
        { employer: 'e06', years: '2013–2015', title: 'iOS & web developer' },
      ],
    },

    toolbox: {
      heading: 'Toolbox',
      groups: [
        {
          label: 'Frontend',
          skills: ['Vue', 'React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS & SCSS'],
        },
        {
          label: 'CMS & commerce',
          skills: ['WordPress', 'WooCommerce', 'Shopify', 'Optimizely (Episerver)', 'OutSystems'],
        },
        { label: 'Design', skills: ['Figma', 'Visual design', 'UX design'] },
        {
          label: 'AI in the workflow',
          skills: ['Requirements & concepts', 'Design', 'Code', 'Data visualisation'],
        },
        { label: 'Mobile', skills: ['iOS (Swift, Objective-C)', 'Corona SDK (Lua)'] },
        { label: 'Also', skills: ['PHP', 'Python'] },
        { label: 'Languages', skills: ['Swedish', 'English'] },
      ],
    },

    approach: {
      heading: 'How I work',
      principles: [
        {
          title: 'Design and code in one head',
          body: 'I design in Figma and build in the browser, so nothing gets lost on the way from one to the other.',
        },
        {
          title: 'AI in the loop',
          body: 'I use AI as an accelerator through the whole cycle: requirements, concepts, design and code.',
        },
        {
          title: 'Small team or big ship',
          body: 'Quick, close collaboration in a small team, or steady long-term work in a large one. I have done plenty of both.',
        },
      ],
    },

    education: {
      heading: 'Education',
      courses: [
        {
          years: '2012–2014',
          school: 'YHC3L',
          programme: 'Vocational degree in iOS and web development',
        },
      ],
    },

    contact: {
      heading: 'Contact',
      lead: 'Got a project, a role or a question? Say hi.',
      channels: { email: 'Email', linkedin: 'LinkedIn', github: 'GitHub' },
    },
  },

  notFound: {
    heading: 'Nothing filed here',
    body: 'There is no page at this address.',
    back: 'Back to the index',
  },

  footer: {
    source: 'Source',
    print: 'Print or save as PDF',
  },
}
