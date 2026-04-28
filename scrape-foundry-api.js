#!/usr/bin/env node

/**
 * FoundryVTT API Documentation Scraper v2
 * 
 * Recursively downloads the FoundryVTT API documentation from https://foundryvtt.com/api/
 * and saves each page as a Markdown file in the foundry_14_api_docs folder.
 * 
 * The FoundryVTT API docs use TypeDoc and the HTML is server-rendered (not SPA).
 * This scraper extracts the `col-content` div which contains all the actual documentation.
 * 
 * Usage: node scrape-foundry-api.js
 */

import { JSDOM } from 'jsdom';
import { mkdir, writeFile, readFile, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'https://foundryvtt.com/api/';
const OUTPUT_DIR = join(__dirname, 'foundry_14_api_docs');
const DELAY_MS = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const visited = new Set();
const failed = new Set();
const queue = [];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convert a FoundryVTT API URL to a file path
 */
function urlToFilePath(url) {
  const urlObj = new URL(url);
  let path = urlObj.pathname;
  
  if (path.startsWith('/api/')) {
    path = path.slice('/api/'.length);
  }
  if (path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  if (path.endsWith('.html')) {
    path = path.slice(0, -5);
  }
  if (path === '' || path === 'index') {
    return join(OUTPUT_DIR, 'index.md');
  }
  
  return join(OUTPUT_DIR, ...path.split('/'), 'README.md');
}

/**
 * Fetch a page with retries
 */
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`  [404] Not found: ${url}`);
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      if (attempt === retries) {
        console.error(`  [FAIL] Failed after ${retries} attempts: ${url} - ${error.message}`);
        return null;
      }
      console.log(`  [RETRY] Attempt ${attempt}/${retries} failed for ${url}`);
      await sleep(RETRY_DELAY_MS);
    }
  }
  return null;
}

/**
 * Extract all internal API links from HTML
 */
function extractLinks(html, baseUrl) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const links = new Set();
  
  const anchors = document.querySelectorAll('a[href]');
  for (const anchor of anchors) {
    let href = anchor.getAttribute('href');
    if (!href) continue;
    if (href.startsWith('#')) continue;
    
    try {
      href = new URL(href, baseUrl).href;
    } catch {
      continue;
    }
    
    if (href.startsWith('https://foundryvtt.com/api/')) {
      const urlWithoutHash = href.split('#')[0];
      if (urlWithoutHash !== 'https://foundryvtt.com/api/' && urlWithoutHash.length > 'https://foundryvtt.com/api/'.length) {
        links.add(urlWithoutHash);
      }
    }
  }
  
  dom.window.close();
  return [...links];
}

/**
 * Convert HTML content to Markdown
 */
function htmlToMarkdown(html, url) {
  const dom = new JSDOM(html, { url });
  const document = dom.window.document;
  
  // Get the main content area - col-content contains all the actual documentation
  let mainContent = document.querySelector('.col-content');
  if (!mainContent) {
    mainContent = document.querySelector('.tsd-content') 
      || document.querySelector('main')
      || document.querySelector('#main')
      || document.querySelector('.content')
      || document.body;
  }
  
  if (!mainContent) {
    dom.window.close();
    return '';
  }

  let md = convertNodeToMarkdown(mainContent, 0);
  
  // Clean up
  md = md.replace(/\n{4,}/g, '\n\n\n');
  md = md.replace(/[ \t]+$/gm, '');
  md = md.replace(/\[([^\]]*)\]\(\s*\)/g, '$1');
  
  dom.window.close();
  return md.trim();
}

/**
 * Recursively convert a DOM node to Markdown
 */
function convertNodeToMarkdown(node, depth) {
  if (!node) return '';
  if (depth > 80) return '';
  
  if (node.nodeType === 3) {
    return node.textContent || '';
  }
  
  if (node.nodeType !== 1) return '';
  
  const tag = node.tagName?.toLowerCase();
  
  // Skip elements we don't want
  if (['nav', 'footer', 'script', 'style', 'noscript', 'svg'].includes(tag)) {
    return '';
  }
  
  // Skip hidden elements
  if (node.getAttribute('aria-hidden') === 'true') return '';
  
  // Skip elements with certain classes
  const className = node.className?.toString?.() || '';
  const skipClasses = [
    'tsd-navigation', 'tsd-sidebar', 'tsd-footer', 'tsd-header',
    'tsd-theme-toggle', 'col-sidebar', 'tsd-page-toolbar',
    'tsd-breadcrumb',
  ];
  for (const cls of skipClasses) {
    if (className.includes(cls)) return '';
  }
  
  // Skip anchor icons (permalink SVGs)
  if (className.includes('tsd-anchor-icon')) return '';
  
  const children = () => {
    let result = '';
    for (const child of node.childNodes) {
      result += convertNodeToMarkdown(child, depth + 1);
    }
    return result;
  };
  
  switch (tag) {
    case 'h1':
      return `\n# ${children().trim()}\n\n`;
    case 'h2':
      return `\n## ${children().trim()}\n\n`;
    case 'h3':
      return `\n### ${children().trim()}\n\n`;
    case 'h4':
      return `\n#### ${children().trim()}\n\n`;
    case 'h5':
      return `\n##### ${children().trim()}\n\n`;
    case 'h6':
      return `\n###### ${children().trim()}\n\n`;
    
    case 'p':
      return `\n\n${children().trim()}\n\n`;
    
    case 'a': {
      const href = node.getAttribute('href') || '';
      const text = children().trim();
      if (!text) return '';
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        let fullHref = href;
        if (href.startsWith('/')) {
          fullHref = `https://foundryvtt.com${href}`;
        } else if (!href.startsWith('http')) {
          fullHref = `https://foundryvtt.com/api/${href}`;
        }
        return `[${text}](${fullHref})`;
      }
      return text;
    }
    
    case 'strong':
    case 'b':
      return `**${children().trim()}**`;
    
    case 'em':
    case 'i':
      return `*${children().trim()}*`;
    
    case 'code': {
      const text = node.textContent || '';
      if (node.parentElement?.tagName?.toLowerCase() === 'pre') {
        return text;
      }
      return `\`${text}\``;
    }
    
    case 'pre': {
      const codeEl = node.querySelector('code');
      const text = (codeEl ? codeEl.textContent : node.textContent) || '';
      let lang = 'typescript';
      if (codeEl?.className) {
        const match = codeEl.className.match(/language-(\w+)/);
        if (match) lang = match[1];
      }
      return `\n\n\`\`\`${lang}\n${text.trim()}\n\`\`\`\n\n`;
    }
    
    case 'ul': {
      let result = '\n';
      const items = node.querySelectorAll(':scope > li');
      for (const li of items) {
        const liText = convertNodeToMarkdown(li, depth + 1).trim();
        result += `- ${liText}\n`;
      }
      return result + '\n';
    }
    
    case 'ol': {
      let result = '\n';
      let i = 1;
      const items = node.querySelectorAll(':scope > li');
      for (const li of items) {
        const liText = convertNodeToMarkdown(li, depth + 1).trim();
        result += `${i}. ${liText}\n`;
        i++;
      }
      return result + '\n';
    }
    
    case 'li':
      return children();
    
    case 'table':
      return convertTableToMarkdown(node, depth);
    
    case 'br':
      return '\n';
    
    case 'hr':
      return '\n---\n\n';
    
    case 'blockquote':
      return `\n> ${children().trim().replace(/\n/g, '\n> ')}\n\n`;
    
    case 'details': {
      const summary = node.querySelector(':scope > summary');
      const summaryText = summary ? convertNodeToMarkdown(summary, depth + 1).trim() : '';
      let result = '';
      if (summaryText) {
        result += `\n<details>\n<summary>${summaryText}</summary>\n\n`;
      }
      for (const child of node.childNodes) {
        if (child !== summary) {
          result += convertNodeToMarkdown(child, depth + 1);
        }
      }
      if (summaryText) {
        result += `\n</details>\n`;
      }
      return result;
    }
    
    case 'summary':
      return children();
    
    case 'img': {
      const alt = node.getAttribute('alt') || '';
      const src = node.getAttribute('src') || '';
      if (!src) return alt;
      return `![${alt}](${src})`;
    }
    
    case 'span': {
      const cls = className;
      if (cls.includes('tsd-signature-symbol')) {
        return node.textContent || '';
      }
      if (cls.includes('tsd-tag')) {
        return ` *${node.textContent?.trim() || ''}*`;
      }
      return children();
    }
    
    default:
      return children();
  }
}

/**
 * Convert an HTML table to Markdown
 */
function convertTableToMarkdown(tableNode, depth) {
  const rows = tableNode.querySelectorAll('tr');
  if (rows.length === 0) return '';
  
  let md = '\n';
  let isFirst = true;
  
  for (const row of rows) {
    const cells = row.querySelectorAll('td, th');
    const cellTexts = [...cells].map(cell => 
      convertNodeToMarkdown(cell, depth + 1).trim().replace(/\n/g, ' ').replace(/\|/g, '\\|')
    );
    md += `| ${cellTexts.join(' | ')} |\n`;
    
    if (isFirst) {
      md += `| ${cellTexts.map(() => '---').join(' | ')} |\n`;
      isFirst = false;
    }
  }
  
  return md + '\n';
}

/**
 * Process a single URL: fetch, convert to markdown, save, and extract links
 */
async function processUrl(url) {
  if (visited.has(url) || failed.has(url)) return;
  
  visited.add(url);
  console.log(`[FETCH] ${url}`);
  
  const html = await fetchWithRetry(url);
  if (!html) {
    failed.add(url);
    return;
  }
  
  const markdown = htmlToMarkdown(html, url);
  
  if (!markdown || markdown.trim().length < 30) {
    console.log(`  [SKIP] Content too short, skipping: ${url}`);
    return;
  }
  
  const filePath = urlToFilePath(url);
  const dir = dirname(filePath);
  
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  
  const content = `<!-- Source: ${url} -->\n\n${markdown}`;
  
  await writeFile(filePath, content, 'utf-8');
  console.log(`  [SAVE] ${filePath}`);
  
  const links = extractLinks(html, url);
  let newLinks = 0;
  for (const link of links) {
    if (!visited.has(link) && !failed.has(link) && !queue.includes(link)) {
      queue.push(link);
      newLinks++;
    }
  }
  if (newLinks > 0) {
    console.log(`  [LINKS] Found ${newLinks} new links`);
  }
  
  await sleep(DELAY_MS);
}

/**
 * Discover all API documentation pages
 */
async function discoverAllPages() {
  console.log('Discovering all API documentation pages...');
  
  const urls = new Set();
  
  // Start with the main index
  urls.add('https://foundryvtt.com/api/');
  
  // Fetch the index page
  console.log('Fetching index page...');
  const indexHtml = await fetchWithRetry(BASE_URL);
  if (indexHtml) {
    const indexLinks = extractLinks(indexHtml, BASE_URL);
    for (const link of indexLinks) urls.add(link);
  }
  
  // Fetch the modules page
  console.log('Fetching modules page...');
  const modulesUrl = 'https://foundryvtt.com/api/modules.html';
  urls.add(modulesUrl);
  const modulesHtml = await fetchWithRetry(modulesUrl);
  if (modulesHtml) {
    const moduleLinks = extractLinks(modulesHtml, modulesUrl);
    for (const link of moduleLinks) urls.add(link);
  }
  
  // Fetch the main foundry module page
  console.log('Fetching foundry module page...');
  const foundryUrl = 'https://foundryvtt.com/api/modules/foundry.html';
  const foundryHtml = await fetchWithRetry(foundryUrl);
  if (foundryHtml) {
    const foundryLinks = extractLinks(foundryHtml, foundryUrl);
    for (const link of foundryLinks) urls.add(link);
  }
  
  // Fetch the hierarchy page
  urls.add('https://foundryvtt.com/api/hierarchy.html');
  
  console.log(`Discovered ${urls.size} initial URLs`);
  return [...urls];
}

async function main() {
  console.log('=== FoundryVTT API Documentation Scraper v2 ===');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');
  
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }
  
  // Check for resume state
  const stateFile = join(OUTPUT_DIR, '.scrape-state.json');
  
  if (existsSync(stateFile)) {
    try {
      const stateData = JSON.parse(await readFile(stateFile, 'utf-8'));
      if (stateData.visited) {
        for (const url of stateData.visited) visited.add(url);
        console.log(`Resuming from previous run. ${visited.size} pages already processed.`);
      }
      if (stateData.failed) {
        for (const url of stateData.failed) failed.add(url);
      }
      if (stateData.queue) {
        for (const url of stateData.queue) {
          if (!visited.has(url) && !failed.has(url)) queue.push(url);
        }
      }
      console.log(`Queue has ${queue.length} URLs to process.`);
    } catch (e) {
      console.log('Could not parse state file, starting fresh.');
    }
  }
  
  if (queue.length === 0) {
    const initialUrls = await discoverAllPages();
    for (const url of initialUrls) {
      if (!visited.has(url) && !failed.has(url)) {
        queue.push(url);
      }
    }
  }
  
  console.log(`\nStarting scrape with ${queue.length} URLs in queue...\n`);
  
  let processed = 0;
  let lastSave = 0;
  
  while (queue.length > 0) {
    const url = queue.shift();
    await processUrl(url);
    processed++;
    
    // Save state every 50 pages
    if (processed - lastSave >= 50) {
      const stateData = {
        visited: [...visited],
        failed: [...failed],
        queue: [...queue],
        lastUpdated: new Date().toISOString(),
      };
      await writeFile(stateFile, JSON.stringify(stateData, null, 2), 'utf-8');
      lastSave = processed;
      console.log(`\n--- Progress: ${processed} pages processed, ${queue.length} in queue, ${failed.size} failed ---\n`);
    }
  }
  
  // Final state save
  const stateData = {
    visited: [...visited],
    failed: [...failed],
    queue: [],
    lastUpdated: new Date().toISOString(),
  };
  await writeFile(stateFile, JSON.stringify(stateData, null, 2), 'utf-8');
  
  console.log(`\n=== Scrape Complete ===`);
  console.log(`Pages processed: ${visited.size}`);
  console.log(`Pages failed: ${failed.size}`);
  if (failed.size > 0) {
    console.log('Failed URLs:');
    for (const url of failed) {
      console.log(`  - ${url}`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});