// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Dataviz by Tago",
  
  pages: [
    {
      name: "Original Dashboards",
      pages: [
        { name: "Thoresen Vessels", path: "/thoresen-vessels" },
        { name: "Airbus vs Boeing", path: "/airbus-boeing" },
        { name: "Uniswap (AMM DEX) Simulator", path: "/uniswap" },
      ]
    },
/*     {
      name: "Templates",
      pages: [
        { name: "GA4 Dashboard", path: "/ga4-dashboard" },
        { name: "Rocket Launches Dashboard", path: "/example-dashboard" },
        { name: "Space Exploration Report", path: "/example-report" },
        { name: "Weather Report", path: "/weather-report" }
      ]
    }, */
       {
      name: "Handbooks",
      pages: [
        { name: "🔄 ETL Workflow", path: "/etl" }
      ]
    }
  ],
  
  preserveExtension: false,

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  // pages: [
  //   {
  //     pages: [
  //       {name: "Dashboard", path: "/example-dashboard"},
  //       {name: "Report", path: "/example-report"}
  //     ]
  //   }
  // ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32"><script defer src="https://cloud.umami.is/script.js" data-website-id="2883b477-8411-4df8-a110-8bb747397f03"></script>',

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  // theme: "light", // try "light", "dark", "slate", etc.
  // header: // what to show in the header (HTML)
  footer: "Built with <a href='https://observablehq.com/framework/'>Observable Framework</a> + <a href='https://vercel.com/'>Vercel</a> by <a href='https://hi.tago.so'>Tago</a>. <a href='https://github.com/tagoso/dataviz-tago-so'>Source code</a>", 
  // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
};
