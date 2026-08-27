import { access, readFile } from 'node:fs/promises';

const required = ['index.html', 'LICENSE', 'README.md', 'docs/spec.md', 'src/main.js', 'src/styles.css', 'src/webmcp.js', 'src/store.js', 'src/logic.js', 'src/data.js'];
for (const file of required) await access(file);
const html = await readFile('index.html', 'utf8');
const source = await readFile('src/webmcp.js', 'utf8');
if (!html.includes('src="/src/main.js"')) throw new Error('index.html does not point at the runtime entrypoint');
for (const tool of ['sidequest.search_stops', 'sidequest.draft_plan', 'sidequest.swap_stop', 'sidequest.inspect_plan', 'sidequest.save_plan']) if (!source.includes(tool)) throw new Error(`missing WebMCP tool: ${tool}`);
if (!source.includes('document.modelContext.registerTool')) throw new Error('current WebMCP registration path missing');
console.log(`build check passed: ${required.length} required files and 5 WebMCP tools`);
