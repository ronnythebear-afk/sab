/*
  Everything the site says lives here and in faces.js and playlists.js.

  The rule: no lines written for you. Text is either a plain fact (a name, a client, a year),
  your own words with where they came from (wordsFrom), or a quote from coverage with who
  said it. If you want a line somewhere, add it as words.

  CHECK marks things I found on the web that you should confirm.
*/
window.SAB = {
  name: 'Summer Anne Burton',
  email: 'summer.burton@gmail.com',
  role: 'Creative director',
  city: 'Austin',

  // When you're ready to say you're looking, set this to true and write the line yourself.
  lookingForWork: false,
  lookingLine: '',

  links: [
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/summeranne"
  },
  {
    label: "Instagram",
    url: "https://instagram.com/summeranne"
  },
  {
    label: "Spotify",
    url: "https://open.spotify.com/user/summeranne"
  },
  {
    label: "Every Hall of Famer",
    url: "https://everyhalloffamer.tumblr.com"
  }
],
  // Put a PDF in site/media/ and its path here, and the CV page links to it.
  resume: '',

  /* ------------------------------------------------------------------ the work
     era is 'lately' or 'before'. words are yours (wordsFrom says where from).
     quotes are other people's, with who. */
  work: [
  {
    id: "paper-dress",
    era: "lately",
    title: "Busy Philipps’ parchment paper dress",
    client: "If You Care",
    year: "2026",
    images: [
      {
        src: "media/work/paper-dress.jpg",
        alt: "Busy Philipps on a New York sidewalk in a dress made of parchment paper"
      }
    ],
    quotes: [
      {
        text: "It’s such a fun, unexpected way to show what this everyday kitchen staple can actually do.",
        who: "Busy Philipps, in the announcement"
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
    client: "Clairol",
    year: "2026",
    images: [],
    quotes: [
      {
        text: "Clairol Marks 95 Years With She Does – a Documentary Film Celebrating the Women Who’ve Trusted the Brand All Along",
        who: "The announcement"
      }
    ],
    links: []
  },
  {
    id: "summer-villa",
    era: "lately",
    title: "La Marca Summer Villa",
    client: "La Marca Prosecco, with Paige DeSorbo",
    year: "2024",
    images: [
      {
        src: "media/work/summer-villa.jpg",
        alt: "Paige DeSorbo in a sundress with a suitcase and a bottle of La Marca"
      }
    ],
    quotes: [
      {
        text: "A charming Italian-inspired getaway that brings the allure of Venice, Italy, to Venice, California (no passport required).",
        who: "The announcement"
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
    title: "Dolce Delivery",
    client: "La Marca Prosecco, with Brynn Whitfield",
    year: "2023",
    images: [
      {
        src: "media/work/dolce-delivery.jpg",
        alt: "Brynn Whitfield raising a glass of La Marca Prosecco"
      }
    ],
    quotes: [
      {
        text: "Brynn will pop by the winner’s holiday gathering to lead a cheer break, bringing her signature onscreen sparkle offscreen and into your home.",
        who: "The announcement"
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
    images: [],
    quotes: [
      {
        text: "Plenty of real-life Daisys did rely on the brand for standout color, part of why Clairol and the cast just partnered on a campaign playing homage to their vintage ads.",
        who: "The Zoe Report"
      }
    ],
    links: [
      {
        label: "The Zoe Report",
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
    images: [
      {
        src: "media/work/streak-shop.jpg",
        alt: "Clairol’s Instagram story from Streak Shop, with stylists coloring hair inside the trailer"
      }
    ],
    words: [
      "Working with Clairol has been a joy, and we recently brought the colorful fun to Palm Springs’ Splash House with Streak Shop, an airstream trailer activation that allowed consumers to try Clairol color in their hair on a weekend made for the gram. What a blast!"
    ],
    links: []
  },
  {
    id: "ai-at-praytell",
    era: "lately",
    title: "Prompting Creativity",
    client: "AI workshops at Praytell",
    year: "2023",
    images: [],
    words: [
      "The rise of generative AI means content will be cheaper than ever—which makes real creativity even more valuable."
    ],
    links: [
      {
        label: "Read it here",
        url: "read.html?c=prompting-creativity"
      }
    ]
  },
  {
    id: "visit-tomorrow",
    era: "lately",
    title: "Visit Tomorrow",
    client: "Air New Zealand",
    year: "2022",
    images: [
      {
        src: "media/work/visit-tomorrow-edge.jpg",
        alt: "The Visit Tomorrow pavilion at Hudson Yards"
      },
      {
        src: "media/work/visit-tomorrow-dancers.jpg",
        alt: "Dancers in front of a giant screen of a New Zealand sunset"
      },
      {
        src: "media/work/visit-tomorrow-press.jpg",
        alt: "Time Out New York’s story on the pop-up",
        caption: "Time Out New York"
      }
    ],
    words: [
      "VISIT TOMORROW celebrated the launch of Air New Zealand’s direct flight landing in NYC with an immersive video experience, live dancers, and natural NZ soundscape."
    ],
    links: [
      {
        label: "amNY",
        url: "https://www.amny.com/lifestyle/travel/explore-new-zealand-pop-up-hudson-yards/"
      }
    ]
  },
  {
    id: "originals",
    era: "before",
    title: "BuzzFeed Originals",
    client: "BuzzFeed",
    year: "2012–2019",
    images: [
      {
        src: "media/work/buzzfeed-team.jpg",
        alt: "A BuzzFeed team cheering around a laptop"
      }
    ],
    words: [
      "I spent seven years at BuzzFeed (2012-2019) with twice as many titles, culminating as Head of BuzzFeed Originals, managing a department of nearly 200 creatives across both editorial and marketing."
    ],
    quotes: [
      {
        text: "Summer helped us crack our distributed model, which has had an incredible impact on our business and the industry.",
        who: "Frank Cooper, BuzzFeed CMO, in Adweek"
      }
    ],
    links: [
      {
        label: "Adweek",
        url: "https://www.adweek.com/brand-marketing/omg-buzzfeed-names-its-first-creative-executive-producer-169881/"
      }
    ]
  },
  {
    id: "quizzes",
    era: "before",
    title: "BuzzFeed quizzes",
    client: "BuzzFeed",
    year: "2013–2016",
    images: [],
    words: [
      "Editorially lead the BuzzFeed quiz team that changed the world of the internet for better or sillier."
    ],
    links: [
      {
        label: "What’s Your Animal Personality Type?",
        url: "https://www.buzzfeed.com/summeranne/whats-your-animal-personality-type"
      }
    ]
  },
  {
    id: "famous-animals",
    era: "before",
    title: "Lil Bub, Princess Monster Truck & Marnie",
    client: "BuzzFeed",
    year: "2012–2014",
    images: [],
    words: [
      "Assist in making Lil Bub and Princess Monstertruck and Marnie the Dog famous."
    ],
    links: [
      {
        label: "The Future Is Here And Her Name Is Princess Monster Truck",
        url: "read.html?c=princess-monster-truck"
      }
    ]
  },
  {
    id: "video",
    era: "before",
    title: "That One Coworker & Whine About It",
    client: "BuzzFeed Video",
    year: "2014–2016",
    images: [
      {
        src: "media/work/that-one-coworker.jpg",
        alt: "Summer in a cow print shirt next to a giant cardboard cat fort",
        caption: "We Built The World’s Greatest Cat Fort. Concept by Jack Shepherd, directed by Jesse McLaren."
      }
    ],
    words: [
      "Produced our first hit Facebook video series (That One Coworker; Whine About It); appeared as ‘da boss."
    ],
    links: []
  },
  {
    id: "tell-show",
    era: "before",
    title: "The Tell Show",
    client: "BuzzFeed",
    year: "2016",
    images: [
      {
        src: "media/work/tell-show.jpg",
        alt: "Summer at a podcast table with Lamorne Morris and Isaac Fitzgerald",
        caption: "Never Have I Ever with Lamorne Morris and Isaac Fitzgerald. Produced by Meg Cramer."
      }
    ],
    words: [
      "Co-host “The Tell Show,” a podcast which allowed me to play Never Have I Ever with Lena Waithe AND Michael Ian Black."
    ],
    links: [
      {
        label: "Apple Podcasts",
        url: "https://itunes.apple.com/us/podcast/the-tell-show/id1081162719?mt=2"
      }
    ]
  },
  {
    id: "sxsw",
    era: "before",
    title: "SXSW, Cannes, ISOJ",
    client: "BuzzFeed",
    year: "2013–2018",
    images: [],
    words: [
      "Give keynote speeches and spoke on panels all over the world including SXSW, Cannes, and the ISOJ conference.",
      "Plan a SXSW party that had slurpees, emoji fortune-telling, caricatures, screenprinting, and “the dress.”"
    ],
    links: []
  },
  {
    id: "tenderly",
    era: "before",
    title: "Tenderly",
    client: "Medium",
    year: "2019–2021",
    images: [],
    words: [
      "I commissioned and edited over 1000 pieces in less than two years, covering recipes, environmental reporting, personal essays, travelogues, photo essays, and more from a “friendly + radical” animal-centric perspective. We developed over 30,000 subscribers on Medium and more across social channels."
    ],
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
    client: "Drawings",
    year: "2011–",
    images: [
      {
        src: "media/hof/nolan-ryan.jpg",
        alt: "Summer’s drawing of Nolan Ryan"
      }
    ],
    links: [
      {
        label: "The drawings",
        url: "#drawings"
      },
      {
        label: "ESPN Page 2",
        url: "https://www.espn.com/espn/page2/story?page=lukas%2F110519_every_hall_of_famer&sportCat=mlb"
      }
    ]
  },
  {
    id: "comics",
    era: "before",
    title: "Hit Points",
    client: "The Classical, NotGraphs, ESPN.com",
    year: "2010–2012",
    images: [
      {
        src: "media/art/hit-points-best-dressed.jpg",
        alt: "Hit Points #6",
        caption: "Hit Points #6: The best dressed sporting men. For The Classical."
      },
      {
        src: "media/art/dee-gordon.jpg",
        alt: "A tweet by Dee Gordon, illustrated",
        caption: "A tweet by Dee Gordon, illustrated. For NotGraphs."
      },
      {
        src: "media/art/matt-kemp.jpg",
        alt: "Matt Kemp",
        caption: "Matt Kemp. For ESPN.com."
      }
    ],
    links: [
      {
        label: "NotGraphs",
        url: "https://not.fangraphs.com/author/summeranne/"
      }
    ]
  }
],
  clients: ["Air New Zealand","Amazon","Beats by Dre","Clairol","Etsy","Fender","Honda","If You Care","La Marca Prosecco","Mars Petcare","Modern Health","NBCUniversal (Syfy and Bravo)","Toyota"],

  /* ------------------------------------------------------------------ the CV page */
  card: {
  position: "Creative director",
  team: "Austin",
  vitals: [
    [
      "Home",
      "Austin, Tex."
    ],
    [
      "Plays",
      "Drums"
    ],
    [
      "Diet",
      "Vegan"
    ],
    [
      "Team",
      "Astros"
    ]
  ],
  rows: [
    [
      "1999",
      "Girl Games",
      "Web editor"
    ],
    [
      "2003–11",
      "BookPeople",
      "Barista to buyer"
    ],
    [
      "2010–12",
      "Freelance",
      "Illustrator, writer"
    ],
    [
      "2011–",
      "Every Hall of Famer",
      "Artist"
    ],
    [
      "2012–19",
      "BuzzFeed",
      "Weekend editor to Head of BuzzFeed Originals"
    ],
    [
      "2019–21",
      "Tenderly",
      "Founder, editor in chief"
    ],
    [
      "2022–",
      "Praytell",
      "Creative director"
    ]
  ],
  totals: [
    [
      "BuzzFeed posts",
      "1,249"
    ],
    [
      "Tenderly pieces edited",
      "1,000+"
    ],
    [
      "Creatives led",
      "~200"
    ]
  ],
  fact: "I have also been a waitress, toy store clerk, a hair salon receptionist, a writer at a now defunct website for tweens (when I was 16!), and a stablehand (my first job)."
},

  /* ------------------------------------------------------------------ drawings */
  hof: {
  url: "https://everyhalloffamer.tumblr.com",
  intro: "In 2011 I started drawing baseball players and for years I did not stop. Lately I’ve been much slower, but they also keep inducting new guys each year (who knew!), so the whole project is, by its very nature, sort of incompleteable. Which is perfect for me.",
  drawings: [
    [
      "honus-wagner",
      "Honus Wagner",
      1936
    ],
    [
      "lou-gehrig",
      "Lou Gehrig",
      1939
    ],
    [
      "dan-brouthers",
      "Dan Brouthers",
      1945
    ],
    [
      "clark-griffith",
      "Clark Griffith",
      1946
    ],
    [
      "lefty-grove",
      "Lefty Grove",
      1947
    ],
    [
      "rabbit-maranville",
      "Rabbit Maranville",
      1954
    ],
    [
      "joe-dimaggio",
      "Joe DiMaggio",
      1955
    ],
    [
      "ted-williams",
      "Ted Williams",
      1966
    ],
    [
      "stan-musial",
      "Stan Musial",
      1969
    ],
    [
      "satchel-paige",
      "Satchel Paige",
      1971
    ],
    [
      "josh-gibson",
      "Josh Gibson",
      1972
    ],
    [
      "roberto-clemente",
      "Roberto Clemente",
      1973
    ],
    [
      "sam-thompson",
      "Sam Thompson",
      1974
    ],
    [
      "ernie-banks",
      "Ernie Banks",
      1977
    ],
    [
      "willie-mays",
      "Willie Mays",
      1979
    ],
    [
      "rube-foster",
      "Rube Foster",
      1981
    ],
    [
      "hank-aaron",
      "Hank Aaron",
      1982
    ],
    [
      "brooks-robinson",
      "Brooks Robinson",
      1983
    ],
    [
      "willie-mccovey",
      "Willie McCovey",
      1986
    ],
    [
      "johnny-bench",
      "Johnny Bench",
      1989
    ],
    [
      "ferguson-jenkins",
      "Ferguson Jenkins",
      1991
    ],
    [
      "rollie-fingers",
      "Rollie Fingers",
      1992
    ],
    [
      "earl-weaver",
      "Earl Weaver",
      1996
    ],
    [
      "nolan-ryan",
      "Nolan Ryan",
      1999
    ],
    [
      "dave-winfield",
      "Dave Winfield",
      2001
    ],
    [
      "hilton-smith",
      "Hilton Smith",
      2001
    ],
    [
      "dennis-eckersley",
      "Dennis Eckersley",
      2004
    ],
    [
      "willard-brown",
      "Willard Brown",
      2006
    ],
    [
      "andre-dawson",
      "Andre Dawson",
      2010
    ]
  ],
  sketchbook: [
    [
      "media/art/snooki-seahorse-2010.jpg",
      "Snooki on a seahorse, 2010."
    ],
    [
      "media/art/dylans-2010.jpg",
      "Dylans, 2010."
    ],
    [
      "media/art/bill-murray-2011.jpg",
      "Bill Murray, 2011."
    ],
    [
      "media/art/tapes-2010.jpg",
      "Tapes, 2010."
    ],
    [
      "media/art/lebron-2009.jpg",
      "LeBron James, 2009."
    ],
    [
      "media/art/favorite-catchers-2010.jpg",
      "My favorite catchers, 2010."
    ],
    [
      "media/art/sadaharu-oh.jpg",
      "Sadaharu Oh, for NotGraphs."
    ],
    [
      "media/art/hit-points-nba.jpg",
      "Hit Points #1: The NBA season preview. For The Classical."
    ],
    [
      "media/art/people-in-my-life-2007.jpg",
      "The people in my life, 2007."
    ],
    [
      "media/art/stuff-i-talk-about-2008.jpg",
      "“Stuff I talk about,” 2008."
    ],
    [
      "media/art/mixed-media-2008.jpg",
      "Mixed media, 2008 (ish?)."
    ]
  ]
},

  /* ------------------------------------------------------------------ writing
     Anything with a slug that has a clean copy in content/clips/ opens in the reader.
     To add one, put it here and run  node tools/clip.mjs --all
     dek is optional. Leave it empty and the reader uses the article's own. */
  clippings: [
  {
    slug: "the-year-without-esme",
    title: "The Year Without Esme",
    outlet: "BuzzFeed",
    date: "2012-12-31",
    kind: "Essay",
    dek: "How the coolest girl in the world taught me, and an entire community, to cope with her death. And how to live.",
    url: "https://www.buzzfeed.com/summeranne/the-year-without-esme"
  },
  {
    slug: "crush-mixtapes",
    title: "The Fine Art Of Mixtape Seduction",
    outlet: "BuzzFeed",
    date: "2014-04-21",
    kind: "Essay",
    dek: "I have always given my crushes pet names.",
    url: "https://www.buzzfeed.com/summeranne/crush-mixtapes"
  },
  {
    slug: "social-networking-a-love-story",
    title: "How I Grew Up On The Internet",
    outlet: "BuzzFeed",
    date: "",
    kind: "Essay",
    dek: "",
    url: "https://www.buzzfeednews.com/article/summeranne/social-networking-a-love-story"
  },
  {
    slug: "what-vine-did-for-us",
    title: "What Vine Did For Us",
    outlet: "BuzzFeed",
    date: "2016-10-27",
    kind: "Essay",
    dek: "",
    url: "https://www.buzzfeed.com/summeranne/what-vine-did-for-us"
  },
  {
    slug: "its-easier-to-laugh-at-peta",
    title: "It’s Easier To Laugh At PETA Than It Is To Admit Your Meat Habit Is Messed Up",
    outlet: "BuzzFeed News",
    date: "2018-12-07",
    kind: "Opinion",
    dek: "Deep down, most people know the way animals are treated by factory farms is morally indefensible.",
    url: "https://www.buzzfeednews.com/article/summeranne/its-easier-to-laugh-at-peta-than-it-is-to-admit-your-meat"
  },
  {
    slug: "morality-didnt-turn-people-vegan",
    title: "Vegans Couldn’t Convince People To Give Up On Meat, But Maybe Capitalism Will",
    outlet: "BuzzFeed News",
    date: "2019-09-29",
    kind: "Opinion",
    dek: "Plant-based burgers are getting lots of love from Wall Street. It puts old-school vegans like me in a tough spot.",
    url: "https://www.buzzfeednews.com/article/summeranne/morality-didnt-turn-people-vegan-capitalism-might"
  },
  {
    slug: "the-33-best-forgotten-teen-shows-of-the-90s",
    title: "The 33 Best Forgotten Teen Shows Of The ’90s",
    outlet: "BuzzFeed",
    date: "2013-04-04",
    kind: "List",
    dek: "Saved by the Bell nostalgia is everywhere, but where’s the love for Parker Lewis?",
    url: "https://www.buzzfeed.com/summeranne/the-33-best-forgotten-teen-shows-of-the-90s"
  },
  {
    slug: "24-invaluable-skills",
    title: "24 Invaluable Skills To Learn For Free Online This Year",
    outlet: "BuzzFeed",
    date: "2014-01-03",
    kind: "List",
    dek: "",
    url: "https://www.buzzfeed.com/summeranne/24-invaluable-skills-to-learn-for-free-online-this-year"
  },
  {
    slug: "elder-scrolls-online",
    title: "How I Fell In Love With The Dorkiest Game Of The Year",
    outlet: "BuzzFeed",
    date: "2014-04-16",
    kind: "Essay",
    dek: "I’m not what most people would call a gamer.",
    url: "https://www.buzzfeed.com/summeranne/elder-scrolls-online"
  },
  {
    slug: "princess-monster-truck",
    title: "The Future Is Here And Her Name Is Princess Monster Truck",
    outlet: "BuzzFeed",
    date: "",
    kind: "Animals",
    dek: "",
    url: "https://www.buzzfeed.com/summeranne/the-future-is-here-and-her-name-is-princess-monster-truck"
  },
  {
    slug: "daniel-straily-a-portrait-of-love",
    title: "Daniel Straily: A Portrait Of Love",
    outlet: "NotGraphs",
    date: "",
    kind: "Baseball",
    dek: "",
    url: "https://not.fangraphs.com/daniel-straily-a-portrait-of-love/"
  },
  {
    slug: "endy-chavez",
    title: "Endy Chávez: It’s Never The Endy The Line",
    outlet: "NotGraphs",
    date: "",
    kind: "Baseball",
    dek: "",
    url: "https://not.fangraphs.com/endy-chavez-its-never-the-endy-the-line/"
  },
  {
    slug: "13-pitchers-astros",
    title: "13 Pitchers With More Wins Than The Astros On The Road",
    outlet: "NotGraphs",
    date: "",
    kind: "Baseball",
    dek: "",
    url: "https://not.fangraphs.com/13-pitchers-with-more-wins-than-the-astros-on-the-road/"
  },
  {
    slug: "your-new-favorite-old-songs",
    title: "Your New Favorite Old Songs",
    outlet: "The Hairpin",
    date: "2011-09",
    kind: "Music",
    dek: "",
    url: "http://thehairpin.com/2011/09/your-new-favorite-old-songs",
    archiveOnly: true
  },
  {
    slug: "laura-mary-and-me",
    title: "Laura, Mary, And Me",
    outlet: "Medium",
    date: "2017-01-27",
    kind: "Essay",
    dek: "Like many people in my generation who had cable growing up, Nickelodeon was my third parent.",
    url: "https://medium.com/@summeranne/laura-mary-and-me-3b4b26739092"
  },
  {
    slug: "go-outside-spring",
    title: "Go Outside, Spring Is for Feeling Alive",
    outlet: "Tenderly",
    date: "2021-03-05",
    kind: "Essay",
    dek: "On depression and sunshine.",
    url: "https://medium.com/tenderlymag/@summeranne"
  },
  {
    slug: "prompting-creativity",
    title: "Prompting Creativity: How Praytell Is Collaborating With AI",
    outlet: "Praytell",
    date: "2023-05-04",
    kind: "AI",
    dek: "",
    url: "https://www.praytellagency.com/blog/prompting-creativity-how-praytell-is-collaborating-with-ai"
  }
],
  press: [
  {
    outlet: "ESPN Page 2",
    year: "2011",
    title: "Illustrator Summer Anne Burton takes on big project",
    url: "https://www.espn.com/espn/page2/story?page=lukas%2F110519_every_hall_of_famer&sportCat=mlb"
  },
  {
    outlet: "Deadspin",
    year: "2011",
    title: "One artist’s effort to draw all 295 members of the Baseball Hall of Fame",
    url: "http://deadspin.com/5844927/a-sampling-from-one-artists-effort-to-draw-all-295-members-of-the-baseball-hall-of-fame/gallery/"
  },
  {
    outlet: "Texas Monthly",
    year: "2014",
    title: "101 Sure Signs That Summer Anne Burton Is From Texas",
    url: "https://www.texasmonthly.com/arts-entertainment/101-sure-signs-that-summer-anne-burton-is-from-texas/"
  },
  {
    outlet: "The Hairpin",
    year: "2014",
    title: "Internet Work and Invisible Labor: An Interview With Summer Anne Burton",
    url: "https://web.archive.org/web/2014/https://www.thehairpin.com/2014/01/internet-work-and-invisible-labor-an-interview-with-summer-anne-burton/"
  },
  {
    outlet: "Adweek",
    year: "2016",
    title: "BuzzFeed Names Its First Executive Creative Producer",
    url: "https://www.adweek.com/brand-marketing/omg-buzzfeed-names-its-first-creative-executive-producer-169881/"
  },
  {
    outlet: "Austin Chronicle",
    year: "2019",
    title: "Vegan Magazine Founder Summer Burton Talks Reason and Queso",
    url: "https://www.austinchronicle.com/food/vegan-magazine-founder-summer-burton-talks-reason-and-queso-11675325/"
  }
]
};
