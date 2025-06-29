---
title: ETL Handbook
description: Practical workflows, ETL strategies, and visualization tips using Observable Plot, JavaScript, and APIs
toc: true
---

# 🔄 ETL Workflow (Extract, Transform, Load)

A robust ETL (Extract, Transform, Load) process is key to effective data visualization. Here's how I approach it in practice mainly focusing on Observable Plot:

## 1. Extract

Data visualization begins with discovering and capturing data. Depending on the scale of the project, we devise ways to efficiently obtain the necessary data with as little budget as possible (preferably free!). It is important to identify what the next "Transform" process can do and accurately narrow down the data that will be core to next data processing.

- **Remote Fetching (API, Webhook, WebSocket)**: Use fetch() to pull JSON from public or private APIs — for example, forex rates, crypto prices, location of vessels or any kind of live data available on the internet. Also utilize real-time data pipelines using Webhooks or WebSocket connections. (You need to implement WebSocket management and reconnection processing yourself.)

- **Query-Based Access (Databases & Cloud Services)**: Retrieve data by executing SQL queries on structured data sources such as local SQLite, cloud-hosted PostgreSQL like Supabase, or Google BigQuery. Ideal for filtering, aggregating, or joining data before loading it into a visualization pipeline. Useful when dealing with large or normalized datasets.

- **Web Scraping**: When an official API is not available, structured scraping using **Python (BeautifulSoup)** or **JavaScript (Puppeteer)** can be a practical alternative. In addition to raw HTML pages, consider using **RSS feeds** or other semi-structured formats when available — they often reduce development time and place less load on the target server.

  Web scraping is convenient, but it may violate the terms of use of the target site, so it is important to check robots.txt and read the terms of use carefully in advance.

- **Copy and Paste!** Recent browsers are so smart that you can sometimes create data tables simply by pasting tables copied to the clipboard into Spreadsheet.

## 2. Transform

The basic format is flat, but a slight nesting structure can also be used when performing faceted or group-based visualization.

- **Scale matters**:

  | Case                 | Transform Method                                         | Why                    |
  | -------------------- | -------------------------------------------------------- | ---------------------- |
  | Small, static data   | CSV, JSON → JS Array                                     | Quick and portable     |
  | Medium, filter-heavy | SQLite, DuckDB → query in JS → JS Array                  | Flexible extraction    |
  | Large, aggregated    | BigQuery/PostgreSQL → aggregated JSON via API → JS Array | Minimal, focused loads |

> When using BigQuery, estimate the query cost before executing it. Avoid using `SELECT \*` and specify only the necessary columns to reduce costs.

- **DuckDB vs SQLite**:

  For medium-sized datasets (10K–1M rows), both DuckDB and SQLite work well, but their design philosophies differ:

  | Feature     | DuckDB (Columnar)                        | SQLite (Row-based)                |
  | ----------- | ---------------------------------------- | --------------------------------- |
  | Orientation | Column-oriented                          | Row-oriented                      |
  | Strength    | Analytical queries & aggregations        | Lightweight transactions & lookup |
  | Format      | Arrow / Parquet / CSV supported natively | Built-in file-based `.sqlite`     |
  | Best for    | OLAP: Aggregations, time-series, joins   | OLTP: Record insert/update        |

  DuckDB is optimized for analytical workflows (OLAP), making it a strong alternative to SQLite when working with tabular datasets for dashboards, statistics, or time-based summaries—especially within browser or notebook contexts. [This article is useful](https://www.fivetran.com/learn/columnar-database-vs-row-database).

- **Manual Transforming in Google Sheets**: If the data is **static** and clearly under tens of thousands of rows in tidy format for basic visualization, then Google Sheets can be used to clean up headers, standardize date formats to ISO 8601 and export as CSV.

  Google Sheets is effective for cleaning small amounts of simple data, but a database approach (such as SQLite or Pandas) is more suitable for combining multiple tables and restructuring data.

- **File Formats**: Prefer **ISO 8601** for dates and UTF-8 for strings.

- **Core JS Tools**: `.map()`, `.filter()`, `.reduce()` for transforming arrays.

- **Group / Summarize**: Use `d3.rollups()` to replicate `GROUP BY` logic.

- **Parse**:

  - Use `+d.value` or `parseFloat()` for numbers.
  - Use `d3.timeParse()` for dates.

- **Sort & Slice**: Use `.sort()` and `.slice()` for ordering and sampling.

- **Use d3-modules effectively**:

  | Module         | Use Case                | Priority |
  | -------------- | ----------------------- | -------- |
  | d3-array       | Aggregations, groups    | ⭐⭐⭐⭐ |
  | d3-time-format | Date parsing            | ⭐⭐⭐⭐ |
  | d3-format      | Number formatting       | ⭐⭐⭐   |
  | d3-time        | Binning, time utilities | ⭐⭐     |
  | d3-scale       | Custom axes             | ⭐⭐     |

- **Performance Tips**:

  - Convert SQLite → JSON when data is under ~100KB.
  - Query SQLite directly for 100K+ rows or high interactivity needs.
  - Avoid loading huge JSONs statically—slice or filter on load.

> Tip: Distinguish between `""` (no data) and `"-"`/`"N/A"`/`"None"` (explicit "none" choice). This can influence parsing and filtering logic.

> ETL is iterative — expect to refactor often. Use Observable’s REPL nature to quickly prototype, visualize, and refine 🚀

## 3. Load

As a general rule, preffered data format is **unpivoted tidy format (long format)**. In the case of Observable, this means a **flat (non-nested) JavaScript array**.

Observable Plot recommends the long format, but the "wide format" with multiple series is also supported for some marks (such as lineY and areaY). Choose the appropriate format.

- **Chart Rendering**:

  - Tidy + flat structure is essential for `Plot.plot()`.
  - Ensure correct mappings: `x`, `y`, `fill`, `stroke`, `color`.
  - Watch for `null` axis values or incorrectly parsed types.

- **Output options**:
  - `Plot.plot(...)` for visualization
  - `console.table(...)` for debugging
  - `JSON.stringify()` for downloads or exports
