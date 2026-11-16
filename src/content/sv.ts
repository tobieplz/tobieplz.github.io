import type { Content } from './schema'
import { hidden, text } from './text'

export const content: Content = {
  locale: 'sv',
  title: 'Senior Product Engineer',
  tagline: 'Frontend, design & AI',

  meta: {
    index: {
      title: 'Tobias Sjösten · Senior Product Engineer',
      description:
        'Senior product engineer med över 13 års erfarenhet av frontend, design och AI. Utvalda uppdrag, kunder och erfarenhet.',
    },
    notFound: {
      title: 'Sidan finns inte · Tobias Sjösten',
      description: 'Det finns ingen sida på den här adressen.',
    },
  },

  nav: {
    skip: 'Hoppa till innehållet',
    language: 'Språk',
    invert: 'Invertera färgerna',
  },

  vault: {
    client: 'Kund',
    employer: 'Arbetsgivare',
    hiddenName: (label) => `${label}, namnet är dolt. Tryck för att ange lösenfrasen.`,
    passphrase: 'Lösenfras',
    withheld: (count) => `${count} namn dolda`,
    hint: 'Har du lösenfrasen? Tryck på en svart ruta.',
    entering: 'Skriv lösenfrasen. Enter för att testa, Esc för att avbryta.',
    checking: 'Härleder nyckel',
    denied: 'Nekad. Det där är inte lösenfrasen.',
    unavailable: 'Upplåsning kräver en säker anslutning (https).',
    declassified: (count) => `Avhemligat. ${count} namn synliga.`,
    lock: 'Lås',
  },

  index: {
    lead: text`Jag bygger saker för webben, och oftast designar jag dem också. Efter drygt tretton år har jag hunnit vara utvecklaren, designern och under en period utvecklingsansvarig, åt startups, byråer och några riktigt stora organisationer.`,

    about: {
      heading: 'Om mig',
      portraitAlt: 'Porträtt av Tobias Sjösten',
      facts: [
        { label: 'Roll', value: 'Senior Product Engineer' },
        { label: 'Sedan', value: '2013' },
        { label: 'Fokus', value: 'Frontend, design, AI' },
        { label: 'Kunder', value: 'Över 20, från startups till stora organisationer' },
        { label: 'Språk', value: 'Svenska, engelska' },
      ],
      bio: [
        text`Hej, jag heter Tobias. Jag började 2013 med iOS-appar och webbplatser, gled över i design engineering, ledde utvecklingen av en fintechprodukt och har de senaste åren varit senior frontendkonsult. På vägen har jag jobbat i Vue och React, i CMS:er och e-handelsplattformar, och ungefär lika mycket i Figma som i editorn.`,
        text`Jag gillar att vara tidigt ute med nya verktyg. På sistone betyder det AI, som numera är en del av allt jag gör: att lista ut vad som ska byggas, skissa och designa det, och skriva koden.`,
        text`Jag trivs i ett litet team där det går undan, och lika bra i det långa loppet i ett stort projekt. Ge mig ett problem och lite förtroende så tar jag det från idé till lansering, eller leder teamet som gör det.`,
        text`Uppdragen finns här nedanför. Namnen är överstrukna eftersom kunder uppskattar diskretion. Har du fått en lösenfras av mig, tryck på en svart ruta och skriv in den.`,
      ],
    },

    columns: {
      number: 'Nr',
      years: 'År',
      client: 'Kund',
      role: 'Roll',
      stack: 'Teknik',
    },

    work: {
      heading: 'Utvalda uppdrag',
      details: (label) => `Detaljer om ${label}`,
      projects: [
        {
          client: 'c01',
          years: '2025–nu',
          sector: 'Hälsa & friskvård',
          role: 'Designer & fullstackutvecklare',
          stack: ['Expo', 'React Native', 'Headless API'],
          story: [
            text`Ett enmansprojekt åt ${hidden('c01')} som började i mars 2025 och fortfarande pågår. Jag gör allt: arkitektur, design, utveckling, test och driftsättning.`,
            text`Jag bygger en app för iOS och Android i Expo, och har skrivit det headless-API som servar alla plattformar. Jag bygger också om deras webbplats med min egen design, som ersätter en WordPress-sajt med äldre formspråk.`,
          ],
        },
        {
          client: 'c02',
          years: '2026',
          sector: 'E-handel',
          role: 'AI-engineer & frontendutvecklare',
          stack: ['Vue 3', 'TypeScript', 'Pinia', 'Shopify'],
          story: [
            text`Designade och byggde hela webbplattformen åt ${hidden('c02')}, från den första visuella riktningen till färdig lösning för desktop och mobil.`,
            text`Frontenden är Vue 3 och TypeScript: responsiva vyer, animationer, flera språk och ordentlig SEO med metadata och strukturerad data. Bakom den ligger en headless Shopify-lösning med produktlistor, produktsidor, variantval, kundvagn och kassa, plus ett bokningsflöde via en extern formulärtjänst.`,
          ],
        },
        {
          client: 'c03',
          years: '2024–2025',
          sector: 'Mat & dryck',
          role: 'AI-engineer & frontendutvecklare',
          stack: ['React', 'TypeScript', 'Next.js'],
          story: [
            text`Frontend i nästa version av det interna systemet hos ${hidden('c03')}, det som personalen använder för att hålla koll på maskinerna ute hos kund. Mest handlade det om att göra det responsivt och trevligt att använda, med en hel del datahantering och grafer. De mindre designbesluten tog jag längs vägen.`,
            text`Det var också här jag på allvar började använda AI, för att bygga och förbättra grafer och visualiseringar.`,
          ],
        },
        {
          client: 'c04',
          years: '2024–2026',
          sector: 'Vård',
          role: 'AI-engineer & frontendutvecklare',
          stack: ['WordPress', 'React'],
          story: [
            text`Löpande frontendarbete på webbplatserna och de digitala tjänsterna hos ${hidden('c04')}: WordPress med React-komponenter ovanpå, trimmat för snabbhet, små skärmar och en bra upplevelse.`,
            text`Temaanpassningar, plus integrationer mot WordPress REST API så att innehållet hålls dynamiskt och redaktörernas vardag enkel.`,
          ],
        },
        {
          client: 'c05',
          years: '2023–2025',
          sector: 'Offentlig sektor',
          role: 'Frontendutvecklare',
          stack: ['WordPress', 'WooCommerce', 'Python'],
          story: [
            text`Förvaltade och vidareutvecklade webbkatalogen hos ${hidden('c05')}, en e-handel som skolor och kommuner beställer från. Frontend i WordPress och WooCommerce, med temaanpassningar, REST API-integrationer och mycket produktdata. Jag gick också in i den äldre koden för att få upp farten.`,
            text`Vid sidan av byggde jag vidare på Python-skripten som importerar Excel- och CSV-filer till WooCommerce, och skrev nya för att hämta, konvertera och kvalitetssäkra produktdata.`,
          ],
        },
        {
          client: 'c06',
          years: '2023–2024',
          sector: 'Branschorganisation',
          role: 'Frontendutvecklare',
          stack: ['Optimizely'],
          story: [
            text`Frontendutvecklare i bygget av nya ${hidden('c06', 'site')}, i Optimizely CMS, med stort fokus på tillgänglighet (WCAG) och användarvänlighet.`,
          ],
        },
        {
          client: 'c07',
          years: '2021–2023',
          sector: 'Logistik',
          role: 'Frontendutvecklare & designer',
          stack: ['Vue', 'Figma'],
          story: [
            text`Designer och frontendutvecklare för alla företagstjänster hos ${hidden('c07', 'short')}. Vue i frontenden, responsiv design och flöden anpassade för både desktop och mobil.`,
          ],
        },
        {
          client: 'c08',
          years: '2019–2021',
          sector: 'Insurtech',
          role: 'Utvecklingsansvarig & frontendutvecklare',
          stack: ['Vue', 'Figma'],
          story: [
            text`Utvecklingsansvarig och frontendutvecklare på ${hidden('c08', 'short')}, en digital kreditförsäkring för små och medelstora företag. Jag drev produkten framåt tillsammans med produkt och design.`,
            text`Jag byggde webbappen, med inloggning och signering via BankID, och ett API som levererar kreditförsäkring per faktura, där försäkrings-PDF:erna signeras via Scrive. Jag skrev också API- och utvecklardokumentationen i ReadMe, med en livedemo.`,
            text`Runt det: utvärdering och förvaltning av tredjepartsintegrationer (valutadata, regionala betalmetoder, KYC, bolagsdata, e-signering), rådgivning i innovationsprojekt i koncernen, och samarbete med juridik och compliance kring EU-anpassade avtal och försäkringsvillkor.`,
          ],
        },
      ],
    },

    clients: {
      heading: 'Fler kunder',
      engagements: [
        { client: 'c09', work: 'Digitalt system' },
        { client: 'c10', sector: 'Handel', work: 'Webbplats' },
        { client: 'c11', sector: 'Spel', work: 'Webbplats' },
        { client: 'c12', sector: 'Konsult', work: 'Webbplats' },
        { client: 'c13', sector: 'Försäkring', work: 'Chattbot' },
        { client: 'c14', sector: 'Byrå', work: 'Webbplats' },
        { client: 'c15', sector: 'Industri', work: 'iOS-app' },
        { client: 'c16', sector: 'Försäkring', work: 'Säljverktyg online' },
        { client: 'c17', sector: 'Bygg', work: 'Digitala tjänster' },
        { client: 'c18', sector: 'Ideell sektor', work: 'Webbplats' },
        { client: 'c19', sector: 'Handel', work: 'iOS-app' },
        { client: 'c20', sector: 'Media', work: 'Digitalt system' },
        { client: 'c21', sector: 'Industri', work: 'iOS-app' },
      ],
    },

    experience: {
      heading: 'Erfarenhet',
      jobs: [
        { employer: 'e01', years: '2023–nu', title: 'Senior frontendutvecklare' },
        {
          employer: 'e02',
          years: '2021–2023',
          title: 'Senior frontendutvecklare & design engineer',
        },
        { employer: 'e03', years: '2019–2021', title: 'Senior frontendutvecklare' },
        { employer: 'e04', years: '2018–2019', title: 'Design engineer' },
        { employer: 'e05', years: '2015–2018', title: 'iOS- & webbutvecklare' },
        { employer: 'e06', years: '2013–2015', title: 'iOS- & webbutvecklare' },
      ],
    },

    education: {
      heading: 'Utbildning',
      courses: [
        {
          years: '2012–2014',
          school: 'YHC3L',
          programme: 'Yrkeshögskoleutbildning i iOS- och webbutveckling',
        },
      ],
    },

    approach: {
      heading: 'Så jobbar jag',
      principles: [
        {
          title: 'Design och kod i samma huvud',
          body: 'Jag både designar och bygger: webbplatser, appar och backenden bakom dem. Inget tappas bort på vägen däremellan.',
        },
        {
          title: 'AI med i loopen',
          body: 'Jag använder AI som en accelerator genom hela cykeln: krav, koncept, design och kod.',
        },
        {
          title: 'Litet team eller stort skepp',
          body: 'Snabbt och nära samarbete i ett litet team, eller långsiktigt arbete i ett stort. Jag har gjort mycket av båda.',
        },
      ],
    },

    contact: {
      heading: 'Kontakt',
      lead: 'Har du ett projekt, en roll eller en fråga? Hör av dig.',
      channels: { email: 'E-post', linkedin: 'LinkedIn', github: 'GitHub' },
    },
  },

  notFound: {
    heading: 'Inget arkiverat här',
    body: 'Det finns ingen sida på den här adressen.',
    back: 'Tillbaka till index',
  },

  footer: {
    source: 'Källkod',
    print: 'Skriv ut eller spara som PDF',
  },
}
