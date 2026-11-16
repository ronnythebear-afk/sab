/*
  Everything the site says lives in this file. Change a line here, save, reload.

  A few rules for whoever edits it (probably you, Summer):
  - Keep the punctuation plain. Commas, periods, parentheses. No em dashes.
  - Anything marked CHECK is something I found on the web and want you to confirm.
  - Images live in site/media/. A path here is relative to site/.
*/
window.SAB = {
  name: 'Summer Anne Burton',
  email: 'summer.burton@gmail.com',
  city: 'Austin, Texas',

  // Flip to true when you're ready to say it out loud. The bottom of the list says the longer line.
  lookingForWork: false,
  lookingLine: 'I’m looking for my next big job. Creative director, head of creative, or the person who figures out what AI is for at your company.',
  notLookingLine: 'I like hearing about big, strange projects, and I answer my email.',

  // The line under your name, above the list.
  intro: 'I’m a creative director in Austin, Texas. I like liking things. Here are some of them.',

  links: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/summeranne' },
    { label: 'Instagram', url: 'https://instagram.com/summeranne' },
    { label: 'Spotify', url: 'https://open.spotify.com/user/summeranne' },
    { label: 'Every Hall of Famer', url: 'https://everyhalloffamer.tumblr.com' }
  ],
  // Put a PDF in site/media/ and its path here, and a "Résumé" button shows up.
  resume: '',

  /* ------------------------------------------------------------------ the work
     Each piece opens as a sheet. era is 'lately' or 'before'. role is optional.
     CHECK the roles. Images live in site/media/work/. */
  work: [
    {
      id: "paper-dress",
      era: "lately",
      title: "Busy Philipps’ parchment paper dress",
      client: "If You Care",
      year: "2026",
      role: "Creative director, Praytell",
      blurb: "A dress made of baking paper, worn through New York Fashion Week.",
      notes: [
        "If You Care makes unbleached, compostable parchment baking paper. For New York Fashion Week we made a dress out of it, a ’60s shift by the designer Lucy Boogaerts, and Busy Philipps wore it through Manhattan.",
        "One fan could win a dress made to their measurements and a year of parchment. Once the dress has had its moment, it goes in the compost."
      ],
      images: [
        {
          src: "media/work/paper-dress.jpg",
          alt: "Busy Philipps on a New York sidewalk in a ’60s shift dress made of parchment paper",
          caption: "Photo from the If You Care announcement."
        }
      ],
      links: [
        {
          label: "The announcement",
          url: "https://www.prnewswire.com/news-releases/busy-philipps-debuts-first-ever-parchment-paper-dress-from-kitchen-brand-if-you-care-as-fashion-takes-over-nyc-302878009.html"
        }
      ]
    },
    {
      id: "she-does",
      era: "lately",
      title: "She Does!",
      client: "Clairol’s 95th anniversary",
      year: "2026",
      role: "Creative director, Praytell",
      blurb: "Clairol finally answered its own question.",
      notes: [
        "In 1956 Clairol asked “Does she... or doesn’t she?” and hair color became something you did in private. For the brand’s 95th birthday we answered it.",
        "She Does! is a short documentary about four women who have colored their hair with Clairol for decades, in their own words."
      ],
      images: [],
      links: []
    },
    {
      id: "summer-villa",
      era: "lately",
      title: "La Marca Summer Villa with Paige DeSorbo",
      client: "La Marca Prosecco",
      year: "2024",
      role: "Creative director, Praytell",
      blurb: "Venice, Italy, in Venice, California. No passport required.",
      notes: [
        "For National Prosecco Day, La Marca brought Venice, Italy to Venice, California. Paige DeSorbo invited fans to win three nights at the La Marca Summer Villa with three of their best friends.",
        "Winners got a personal chef cooking Italian favorites and a butler with an itinerary to match."
      ],
      images: [
        {
          src: "media/work/summer-villa.jpg",
          alt: "Paige DeSorbo in a sundress with a suitcase and a bottle of La Marca",
          caption: "Photo from the La Marca announcement."
        }
      ],
      links: [
        {
          label: "The announcement",
          url: "https://www.prnewswire.com/news-releases/la-marca-prosecco-and-bravo-star-paige-desorbo-are-bringing-a-taste-of-italy-to-one-lucky-group-of-besties-through-the-la-marca-summer-villa-302218213.html"
        }
      ]
    },
    {
      id: "dolce-delivery",
      era: "lately",
      title: "Brynn Whitfield’s Dolce Delivery",
      client: "La Marca Prosecco",
      year: "2023",
      role: "Creative director, Praytell",
      blurb: "The prize was a Real Housewife at your holiday party.",
      notes: [
        "Most people say the holidays stress them out. La Marca and Brynn Whitfield ran a contest where the winner got Brynn herself, showing up at their holiday party to lead a “cheer break.”",
        "She brought a kit with La Marca glasses, an ice bucket and a $1,000 gift card for the rest of the party."
      ],
      images: [
        {
          src: "media/work/dolce-delivery.jpg",
          alt: "Brynn Whitfield raising a glass of La Marca Prosecco on a couch",
          caption: "Photo from the La Marca announcement."
        }
      ],
      links: [
        {
          label: "The announcement",
          url: "https://www.prnewswire.com/news-releases/la-marca-prosecco-and-real-housewife-brynn-whitfield-are-spreading-cheer-with-a-dolce-delivery-to-one-lucky-winners-holiday-soiree-302005688.html"
        }
      ]
    },
    {
      id: "daisy-jones",
      era: "lately",
      title: "Daisy Jones & The Six × Clairol",
      client: "Clairol and Prime Video",
      year: "2023",
      role: "Creative director, Praytell",
      blurb: "Clairol’s ’70s ads, starring the band from the show.",
      notes: [
        "When Daisy Jones & The Six came to Prime Video, Clairol partnered with the show to bring its hair home. The posts and get-the-look tutorials borrowed the style of Clairol’s own ads from the ’70s and matched a shade to each character’s color.",
        "It was a partnership, not product placement, which meant the show and the brand could share the stage in paid and organic social."
      ],
      images: [],
      links: [
        {
          label: "The Zoe Report on the hair",
          url: "https://www.thezoereport.com/culture/daisy-jones-hair-color-style"
        }
      ]
    },
    {
      id: "streak-shop",
      era: "lately",
      title: "Streak Shop",
      client: "Clairol at Splash House",
      year: "2023",
      role: "Creative director",
      blurb: "An Airstream in Palm Springs where you could streak your hair.",
      notes: [
        "Clairol brought color to Splash House in Palm Springs with Streak Shop, an Airstream trailer where people could try Clairol in their hair on the spot, on a weekend made for the gram. What a blast."
      ],
      images: [
        {
          src: "media/work/streak-shop.jpg",
          alt: "Clairol’s Instagram story from Streak Shop, with stylists coloring hair inside the trailer"
        }
      ],
      links: []
    },
    {
      id: "ai-at-praytell",
      era: "lately",
      title: "AI at Praytell",
      client: "Praytell",
      year: "2023–now",
      role: "AI innovation and workshops",
      blurb: "Teaching a whole agency to use AI without losing what makes it good.",
      notes: [
        "I run AI innovation and workshops at Praytell. It started with an all-agency session where nearly everyone got their hands on the tools and learned to write prompts that actually work.",
        "We also had a couple of guests in to talk about what AI is doing to work and to life (thanks, Ryan Broderick and Gavin Purcell). Then I wrote up what we learned, including the part where good taste and soft skills get more valuable, not less."
      ],
      images: [],
      links: [
        {
          label: "Prompting Creativity, on the Praytell blog",
          url: "https://www.praytellagency.com/blog/prompting-creativity-how-praytell-is-collaborating-with-ai"
        }
      ]
    },
    {
      id: "visit-tomorrow",
      era: "lately",
      title: "Visit Tomorrow",
      client: "Air New Zealand",
      year: "2022",
      role: "Creative director",
      blurb: "New Zealand, on the 101st floor over Manhattan.",
      notes: [
        "Air New Zealand’s first nonstop flight between Auckland and New York took off on September 17, 2022. Two days before, we opened Visit Tomorrow, a pop-up at Edge, the observation deck at Hudson Yards.",
        "Inside was an immersive film of New Zealand on a 14-foot LED screen, live dancers, and a soundscape of New Zealand nature. Time Out called it a flash trip to New Zealand."
      ],
      images: [
        {
          src: "media/work/visit-tomorrow-edge.jpg",
          alt: "The Visit Tomorrow pavilion at Hudson Yards, with two Air New Zealand crew members out front"
        },
        {
          src: "media/work/visit-tomorrow-dancers.jpg",
          alt: "Dancers performing in front of a giant screen of a New Zealand sunset"
        },
        {
          src: "media/work/visit-tomorrow-press.jpg",
          alt: "Time Out New York’s story on the pop-up",
          caption: "Time Out New York"
        }
      ],
      links: [
        {
          label: "amNY on the pop-up",
          url: "https://www.amny.com/lifestyle/travel/explore-new-zealand-pop-up-hudson-yards/"
        }
      ]
    },
    {
      id: "originals",
      era: "before",
      title: "Head of BuzzFeed Originals",
      client: "BuzzFeed",
      year: "2012–2019",
      role: "Weekend editor, then thirteen more titles",
      blurb: "Seven years, twice as many titles, nearly 200 people.",
      notes: [
        "I started at BuzzFeed in the spring of 2012 as the weekend editor and stayed seven years, with twice as many titles. I founded our first social content team, came up with new kinds of native ads, pitched a Super Bowl spot, launched BuzzFeed Books, and pushed for identity-based social brands like Cocoa Butter and Pero Like.",
        "I became the company’s first executive creative producer, and finished as Head of BuzzFeed Originals, running nearly 200 creatives across editorial and marketing. Along the way I wrote more than a thousand posts."
      ],
      quote: {
        text: "Summer helped us crack our distributed model, which has had an incredible impact on our business and the industry.",
        who: "Frank Cooper, BuzzFeed’s CMO, in Adweek"
      },
      images: [
        {
          src: "media/work/buzzfeed-team.jpg",
          alt: "A BuzzFeed team cheering around a laptop on an orange set"
        }
      ],
      links: [
        {
          label: "Adweek on the new job",
          url: "https://www.adweek.com/brand-marketing/omg-buzzfeed-names-its-first-creative-executive-producer-169881/"
        }
      ]
    },
    {
      id: "quizzes",
      era: "before",
      title: "The BuzzFeed quiz team",
      client: "BuzzFeed",
      year: "2013–2016",
      role: "Editorial lead",
      blurb: "The quizzes that changed the internet, for better or sillier.",
      notes: [
        "I led editorial strategy when BuzzFeed launched quizzes and the other interactive formats that came after them, and I led the quiz team. I wrote plenty myself."
      ],
      images: [],
      links: [
        {
          label: "What’s Your Animal Personality Type?",
          url: "https://www.buzzfeed.com/summeranne/whats-your-animal-personality-type"
        },
        {
          label: "Which “Designing Women” character are you?",
          url: "https://www.buzzfeed.com/summeranne/designing-women-character-quiz"
        }
      ]
    },
    {
      id: "famous-animals",
      era: "before",
      title: "Lil Bub, Princess Monster Truck and Marnie",
      client: "BuzzFeed",
      year: "2012–2014",
      role: "Writer",
      blurb: "I helped make some animals very famous.",
      notes: [
        "I wrote about Lil Bub, Princess Monster Truck and Marnie the Dog early and often, and helped make them famous. I met Grumpy Cat. I went to a hedgehog convention at a Holiday Inn in Maryland. I visited Costa Rica and met baby sloths."
      ],
      images: [],
      links: [
        {
          label: "The Future Is Here And Her Name Is Princess Monster Truck",
          url: "https://www.buzzfeed.com/summeranne/the-future-is-here-and-her-name-is-princess-monster-truck"
        }
      ]
    },
    {
      id: "video",
      era: "before",
      title: "That One Coworker, Whine About It and a cat fort",
      client: "BuzzFeed Video",
      year: "2014–2016",
      role: "Producer, occasional boss",
      blurb: "BuzzFeed’s first hit Facebook video series. I played the boss.",
      notes: [
        "I produced our first hit Facebook video series, That One Coworker and Whine About It, and appeared as the boss.",
        "I also helped build the world’s greatest cat fort."
      ],
      images: [
        {
          src: "media/work/that-one-coworker.jpg",
          alt: "Summer in a cow print shirt, gesturing at a giant cardboard cat fort",
          caption: "We Built The World’s Greatest Cat Fort. Concept by Jack Shepherd, directed by Jesse McLaren."
        }
      ],
      links: []
    },
    {
      id: "tell-show",
      era: "before",
      title: "The Tell Show",
      client: "BuzzFeed podcast",
      year: "2016",
      role: "Co-host",
      blurb: "A confessional podcast. I played Never Have I Ever with Lena Waithe.",
      notes: [
        "I co-hosted The Tell Show, a confessional podcast from BuzzFeed. I got to play Never Have I Ever with Lena Waithe and with Michael Ian Black, and not at the same time."
      ],
      images: [
        {
          src: "media/work/tell-show.jpg",
          alt: "Summer at a podcast table with Lamorne Morris and Isaac Fitzgerald",
          caption: "Never Have I Ever with Lamorne Morris and Isaac Fitzgerald. Produced by Meg Cramer."
        }
      ],
      links: [
        {
          label: "The Tell Show on Apple Podcasts",
          url: "https://itunes.apple.com/us/podcast/the-tell-show/id1081162719?mt=2"
        }
      ]
    },
    {
      id: "sxsw",
      era: "before",
      title: "SXSW, Cannes and a party with Slurpees",
      client: "Talks and parties",
      year: "2013–2018",
      role: "Speaker, party planner",
      blurb: "Keynotes, panels, emoji semiotics, and “the dress.”",
      notes: [
        "I gave keynotes and sat on panels at SXSW, Cannes and ISOJ. Once I gave a whole presentation on emoji semiotics.",
        "I also planned a BuzzFeed party at SXSW with Slurpees, emoji fortune-telling, caricatures, screenprinting and “the dress.”"
      ],
      images: [],
      links: [
        {
          label: "A sneak peek at the emoji talk",
          url: "http://summeranne.tumblr.com/post/95258939783/sneak-preview-of-my-emoji-semiotics-presentation"
        }
      ]
    },
    {
      id: "tenderly",
      era: "before",
      title: "Tenderly",
      client: "A vegan magazine, funded by Medium",
      year: "2019–2021",
      role: "Founder, editor in chief",
      blurb: "More than 1,000 stories in under two years. Friendly and radical.",
      notes: [
        "After BuzzFeed I started Tenderly, a vegan magazine funded by Medium. In less than two years I commissioned and edited more than 1,000 pieces (recipes, environmental reporting, personal essays, travelogues, photo essays) from a friendly and radical, animal-centric point of view.",
        "We grew to more than 30,000 subscribers on Medium, and more on social. I also wrote a weekly advice column."
      ],
      images: [],
      links: [
        {
          label: "Tenderly on Medium",
          url: "https://tenderly.medium.com"
        }
      ]
    },
    {
      id: "every-hall-of-famer",
      era: "before",
      title: "Every Hall of Famer",
      client: "A drawing project",
      year: "2011–forever",
      role: "Artist",
      blurb: "Drawing every member of the Baseball Hall of Fame, in order.",
      notes: [
        "In 2011 I started drawing every member of the Baseball Hall of Fame, in the order they were inducted. They keep inducting new guys every year, so it can never really be finished, which suits me fine.",
        "ESPN The Magazine, ESPN.com, Deadspin and Uni Watch all wrote about it. Some of my favorites are on this site, under drawings."
      ],
      images: [
        {
          src: "media/hof/nolan-ryan.jpg",
          alt: "Summer’s drawing of Nolan Ryan in an Astros rainbow jersey"
        }
      ],
      links: [
        {
          label: "See them all",
          url: "https://everyhalloffamer.tumblr.com"
        },
        {
          label: "ESPN’s story",
          url: "https://www.espn.com/espn/page2/story?page=lukas%2F110519_every_hall_of_famer&sportCat=mlb"
        }
      ]
    },
    {
      id: "comics",
      era: "before",
      title: "Hit Points and other sports comics",
      client: "The Classical, NotGraphs, ESPN",
      year: "2010–2012",
      role: "Illustrator, writer",
      blurb: "A weekly sports comic, and baseball jokes for FanGraphs.",
      notes: [
        "Before BuzzFeed I drew and wrote for ESPN The Magazine, ESPN.com, The Hairpin, FanGraphs’ NotGraphs and The Classical, where I made a weekly sports comic called Hit Points.",
        "At NotGraphs I illustrated a tweet by Dee Gordon and wrote about Daniel Straily, Endy Chávez and Matt Cain’s baby girl."
      ],
      images: [
        {
          src: "media/art/hit-points-best-dressed.jpg",
          alt: "Hit Points #6, a comic about the best dressed sporting men",
          caption: "Hit Points #6: The best dressed sporting men. For The Classical."
        },
        {
          src: "media/art/dee-gordon.jpg",
          alt: "An illustrated tweet by Dee Gordon",
          caption: "A tweet by Dee Gordon, illustrated. For NotGraphs."
        },
        {
          src: "media/art/matt-kemp.jpg",
          alt: "A drawing of Matt Kemp for ESPN",
          caption: "Matt Kemp, for ESPN.com."
        }
      ],
      links: [
        {
          label: "My NotGraphs posts",
          url: "https://not.fangraphs.com/author/summeranne/"
        }
      ]
    }
  ],
  clients: [ "Air New Zealand", "Amazon", "Beats by Dre", "Clairol", "Etsy", "Fender", "Honda", "If You Care", "La Marca Prosecco", "Mars Petcare", "Modern Health", "NBCUniversal (Syfy and Bravo)", "Toyota" ],

  /* ---------------------------------------------------------- the baseball card */
  card: {
    position: 'Creative director',
    team: 'Austin',
    vitals: [['Home', 'Austin, Tex.'], ['Debut', '1997, my first website'], ['Plays', 'Drums'], ['Diet', 'Vegan'], ['Team', 'Astros']],
    // CHECK every year and title here.
    rows: [
      ['1999', 'Girl Games', 'Web editor', 'Wrote for a website for tweens. I was 16.'],
      ['2003–11', 'BookPeople', 'Barista, then buyer', 'Austin’s independent bookstore. Corporate and consignment buyer by the end.'],
      ['2010–12', 'Freelance', 'Illustrator, writer', 'ESPN The Magazine, The Hairpin, FanGraphs, The Classical.'],
      ['2011–', 'Every Hall of Famer', 'Artist', 'Drawing the whole Baseball Hall of Fame. Still going.'],
      ['2012–19', 'BuzzFeed', 'Weekend editor to Head of Originals', 'Fourteen titles. Nearly 200 creatives by the end.'],
      ['2019–21', 'Tenderly', 'Founder, editor in chief', 'A vegan magazine funded by Medium.'],
      ['2022–', 'Praytell', 'Creative director', 'Clairol, La Marca, Air New Zealand, If You Care. AI workshops.']
    ],
    totals: [['BuzzFeed posts', '1,249'], ['Tenderly stories edited', '1,000+'], ['Creatives managed', '~200'], ['Personal websites', 'since 1997']],
    cartoon: 'Summer was unschooled from fourth grade on and never went to college. She has also been a waitress, a toy store clerk and a hair salon receptionist. Her first job was at a stable.'
  },

  /* ------------------------------------------------------ Every Hall of Famer */
  hof: {
    intro: 'In 2011 I started drawing baseball players and for years I did not stop. Lately I’ve been much slower, but they also keep inducting new guys each year (who knew!), so the whole project is, by its very nature, sort of incompleteable. Which is perfect for me.',
    url: 'https://everyhalloffamer.tumblr.com',
    drawings: [
      ['honus-wagner', 'Honus Wagner', 1936], ['lou-gehrig', 'Lou Gehrig', 1939], ['dan-brouthers', 'Dan Brouthers', 1945],
      ['clark-griffith', 'Clark Griffith', 1946], ['lefty-grove', 'Lefty Grove', 1947], ['rabbit-maranville', 'Rabbit Maranville', 1954],
      ['joe-dimaggio', 'Joe DiMaggio', 1955], ['ted-williams', 'Ted Williams', 1966], ['stan-musial', 'Stan Musial', 1969],
      ['satchel-paige', 'Satchel Paige', 1971], ['josh-gibson', 'Josh Gibson', 1972], ['roberto-clemente', 'Roberto Clemente', 1973],
      ['sam-thompson', 'Sam Thompson', 1974], ['ernie-banks', 'Ernie Banks', 1977], ['willie-mays', 'Willie Mays', 1979],
      ['rube-foster', 'Rube Foster', 1981], ['hank-aaron', 'Hank Aaron', 1982], ['brooks-robinson', 'Brooks Robinson', 1983],
      ['willie-mccovey', 'Willie McCovey', 1986], ['johnny-bench', 'Johnny Bench', 1989], ['ferguson-jenkins', 'Ferguson Jenkins', 1991],
      ['rollie-fingers', 'Rollie Fingers', 1992], ['earl-weaver', 'Earl Weaver', 1996], ['nolan-ryan', 'Nolan Ryan', 1999],
      ['dave-winfield', 'Dave Winfield', 2001], ['hilton-smith', 'Hilton Smith', 2001], ['dennis-eckersley', 'Dennis Eckersley', 2004],
      ['willard-brown', 'Willard Brown', 2006], ['andre-dawson', 'Andre Dawson', 2010]
    ],
    // Other drawings, with the captions from the old site.
    sketchbook: [
      ['media/art/snooki-seahorse-2010.jpg', 'Snooki on a seahorse, 2010.'],
      ['media/art/dylans-2010.jpg', 'Dylans, 2010.'],
      ['media/art/bill-murray-2011.jpg', 'Bill Murray, 2011.'],
      ['media/art/tapes-2010.jpg', 'Tapes, 2010.'],
      ['media/art/lebron-2009.jpg', 'LeBron James, 2009.'],
      ['media/art/favorite-catchers-2010.jpg', 'My favorite catchers, 2010.'],
      ['media/art/sadaharu-oh.jpg', 'Sadaharu Oh, for NotGraphs.'],
      ['media/art/hit-points-nba.jpg', 'Hit Points #1: The NBA season preview. For The Classical.'],
      ['media/art/people-in-my-life-2007.jpg', 'The people in my life, 2007.'],
      ['media/art/stuff-i-talk-about-2008.jpg', '“Stuff I talk about,” 2008.'],
      ['media/art/mixed-media-2008.jpg', 'Mixed media, 2008 (ish?).']
    ]
  },

  /* --------------------------------------------------------------- clippings */
  // Anything with a slug that has a clean copy in content/clips/ opens here, in the reader.
  // The rest link out. To add one: put it in this list, then run  node tools/clip.mjs --all
  // archiveOnly: true is for sites whose old address belongs to someone else now. Those copy
  // from the Internet Archive and link there too.
  clippings: [
    { slug: 'the-year-without-esme', title: 'The Year Without Esme', outlet: 'BuzzFeed', date: '2012-12-31', kind: 'Essay', dek: 'How the coolest girl in the world taught me, and an entire community, to cope with her death. And how to live.', url: 'https://www.buzzfeed.com/summeranne/the-year-without-esme' },
    { slug: 'crush-mixtapes', title: 'The Fine Art Of Mixtape Seduction', outlet: 'BuzzFeed', date: '2014-04-21', kind: 'Essay', dek: 'I have always given my crushes pet names.', url: 'https://www.buzzfeed.com/summeranne/crush-mixtapes' },
    { slug: 'social-networking-a-love-story', title: 'How I Grew Up On The Internet', outlet: 'BuzzFeed', date: '', kind: 'Essay', dek: 'A love story, starting in 1997.', url: 'https://www.buzzfeednews.com/article/summeranne/social-networking-a-love-story' },
    { slug: 'what-vine-did-for-us', title: 'What Vine Did For Us', outlet: 'BuzzFeed', date: '2016-10-27', kind: 'Essay', dek: 'Six seconds at a time.', url: 'https://www.buzzfeed.com/summeranne/what-vine-did-for-us' },
    { slug: 'its-easier-to-laugh-at-peta', title: 'It’s Easier To Laugh At PETA Than It Is To Admit Your Meat Habit Is Messed Up', outlet: 'BuzzFeed News', date: '2018-12-07', kind: 'Opinion', dek: 'Deep down, most people know the way animals are treated by factory farms is morally indefensible.', url: 'https://www.buzzfeednews.com/article/summeranne/its-easier-to-laugh-at-peta-than-it-is-to-admit-your-meat' },
    { slug: 'morality-didnt-turn-people-vegan', title: 'Vegans Couldn’t Convince People To Give Up On Meat, But Maybe Capitalism Will', outlet: 'BuzzFeed News', date: '2019-09-29', kind: 'Opinion', dek: 'Plant-based burgers are getting lots of love from Wall Street. It puts old-school vegans like me in a tough spot.', url: 'https://www.buzzfeednews.com/article/summeranne/morality-didnt-turn-people-vegan-capitalism-might' },
    { slug: 'the-33-best-forgotten-teen-shows-of-the-90s', title: 'The 33 Best Forgotten Teen Shows Of The ’90s', outlet: 'BuzzFeed', date: '2013-04-04', kind: 'List', dek: 'Saved by the Bell nostalgia is everywhere, but where’s the love for Parker Lewis?', url: 'https://www.buzzfeed.com/summeranne/the-33-best-forgotten-teen-shows-of-the-90s' },
    { slug: '24-invaluable-skills', title: '24 Invaluable Skills To Learn For Free Online This Year', outlet: 'BuzzFeed', date: '2014-01-03', kind: 'List', dek: 'An easy resolution.', url: 'https://www.buzzfeed.com/summeranne/24-invaluable-skills-to-learn-for-free-online-this-year' },
    { slug: 'elder-scrolls-online', title: 'How I Fell In Love With The Dorkiest Game Of The Year', outlet: 'BuzzFeed', date: '2014-04-16', kind: 'Essay', dek: 'I’m not what most people would call a gamer.', url: 'https://www.buzzfeed.com/summeranne/elder-scrolls-online' },
    { slug: 'princess-monster-truck', title: 'The Future Is Here And Her Name Is Princess Monster Truck', outlet: 'BuzzFeed', date: '', kind: 'Animals', dek: 'Meet her.', url: 'https://www.buzzfeed.com/summeranne/the-future-is-here-and-her-name-is-princess-monster-truck' },
    { slug: 'daniel-straily-a-portrait-of-love', title: 'Daniel Straily: A Portrait Of Love', outlet: 'NotGraphs', date: '', kind: 'Baseball', dek: 'From my FanGraphs days.', url: 'https://not.fangraphs.com/daniel-straily-a-portrait-of-love/' },
    { slug: 'endy-chavez', title: 'Endy Chávez: It’s Never The Endy The Line', outlet: 'NotGraphs', date: '', kind: 'Baseball', dek: 'A pun I stand by.', url: 'https://not.fangraphs.com/endy-chavez-its-never-the-endy-the-line/' },
    { slug: '13-pitchers-astros', title: '13 Pitchers With More Wins Than The Astros On The Road', outlet: 'NotGraphs', date: '', kind: 'Baseball', dek: 'A dark time for the Astros.', url: 'https://not.fangraphs.com/13-pitchers-with-more-wins-than-the-astros-on-the-road/' },
    { slug: 'your-new-favorite-old-songs', title: 'Your New Favorite Old Songs', outlet: 'The Hairpin', date: '2011-09', kind: 'Music', dek: 'My heart belongs to weird old pop songs.', url: 'http://thehairpin.com/2011/09/your-new-favorite-old-songs', archiveOnly: true },
    { slug: 'laura-mary-and-me', title: 'Laura, Mary, And Me', outlet: 'Medium', date: '2017-01-27', kind: 'Essay', dek: 'Like many people in my generation who had cable growing up, Nickelodeon was my third parent.', url: 'https://medium.com/@summeranne/laura-mary-and-me-3b4b26739092' },
    { slug: 'go-outside-spring', title: 'Go Outside, Spring Is for Feeling Alive', outlet: 'Tenderly', date: '2021-03-05', kind: 'Essay', dek: 'On depression and sunshine.', url: 'https://medium.com/tenderlymag/@summeranne' },
    { slug: 'prompting-creativity', title: 'Prompting Creativity: How Praytell Is Collaborating With AI', outlet: 'Praytell', date: '2023-05-04', kind: 'AI', dek: 'What happened when a whole agency got its hands on the tools.', url: 'https://www.praytellagency.com/blog/prompting-creativity-how-praytell-is-collaborating-with-ai' }
  ],
  // Other people writing about me.
  press: [
    { outlet: 'ESPN Page 2', year: '2011', title: 'Illustrator Summer Anne Burton takes on big project', url: 'https://www.espn.com/espn/page2/story?page=lukas%2F110519_every_hall_of_famer&sportCat=mlb' },
    { outlet: 'Deadspin', year: '2011', title: 'One artist’s effort to draw all 295 members of the Baseball Hall of Fame', url: 'http://deadspin.com/5844927/a-sampling-from-one-artists-effort-to-draw-all-295-members-of-the-baseball-hall-of-fame/gallery/' },
    { outlet: 'Texas Monthly', year: '2014', title: '101 Sure Signs That Summer Anne Burton Is From Texas', url: 'https://www.texasmonthly.com/arts-entertainment/101-sure-signs-that-summer-anne-burton-is-from-texas/' },
    { outlet: 'The Hairpin', year: '2014', title: 'Internet Work and Invisible Labor: An Interview With Summer Anne Burton', url: 'https://web.archive.org/web/2014/https://www.thehairpin.com/2014/01/internet-work-and-invisible-labor-an-interview-with-summer-anne-burton/' },
    { outlet: 'Adweek', year: '2016', title: 'BuzzFeed Names Its First Executive Creative Producer', url: 'https://www.adweek.com/brand-marketing/omg-buzzfeed-names-its-first-creative-executive-producer-169881/' },
    { outlet: 'Austin Chronicle', year: '2019', title: 'Vegan Magazine Founder Summer Burton Talks Reason and Queso', url: 'https://www.austinchronicle.com/food/vegan-magazine-founder-summer-burton-talks-reason-and-queso-11675325/' }
  ],

  // Behind the line about 2014 on the list. It opens a few of these at random.
  // From "Some of the things I did in 2014," posted on Tumblr on Dec. 30, 2014.
  receipt: {
    machine: 'SAB-2014',
    title: 'Some of the things I did in 2014',
    footer: 'From a list I posted on Tumblr, Dec. 30, 2014',
    items: [
      'I got to visit a sloth sanctuary in Costa Rica and meet the cutest sloth in the world.',
      'I wrote about mixtapes and cute boys, the essay I’ve been destined to write for the last 15 years.',
      'I started a new Tumblr of some of my favorite vintage songs.',
      'I started playing Magic: The Gathering again.',
      'I went to my dear friend Patrick’s wedding and danced in a barn.',
      'I played Elder Scrolls Online, and created Cat Beyonce.',
      'I made a bot.',
      'I gave a presentation about the semiotics of emojis.',
      'I tried to bring back the classic internet “purity” test.',
      'I definitively ranked 99 of the best movie soundtracks from the ’90s.',
      'I got a lot better at vegan cooking.',
      'I found a use for my collection of strangers’ abandoned memories.',
      'I saw a LOT of movies.',
      'I got to see Patrick Stewart and Ian McKellen talk about their friendship from a few feet away.',
      'I wrote about my first kiss.',
      'I ranked every Baby-Sitters Club cover by outfit awesomeness.',
      'I spent a month in L.A. and saw dogs surfing and a bunny museum in one day.',
      'I drew Ozzie Smith and Dave Winfield and Carlton Fisk and more.',
      'I became very obsessed with the app Yo.',
      'I missed Texas.',
      'I was in “Boyhood,” also my favorite movie of the year, for approximately .0000005ths of a second.',
      'I got really excited about Tilde.Club.',
      'I saw a lot of baseball games in Coney Island.',
      'I watched “Purple Rain” in a cemetery.',
      'I got mad at the Hall of Fame voters (again).',
      'I helped make Marnie famous.',
      'I saw James Harden play basketball in person.',
      'I judged men.',
      'I got emotional over a brand tweeting at me.',
      'I wrote about 100 songs I loved this year.',
      'I cried a LOT.',
      'I wrote about my history of the internet and how much I love it.',
      'I started a new job doing a new thing at BuzzFeed, and got to give cool jobs to 9 awesome humans.'
    ]
  },

  footer: 'Made by hand in Austin. My first personal website was in 1997. This is the newest one.'
};
