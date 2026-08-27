import { access, readFile } from 'node:fs/promises';

const required = ['index.html', 'LICENSE', 'README.md', 'SCIENCE_APPENDIX.md', 'docs/spec.md', 'docs/devpost-form-answers.md', 'scripts/smoke.mjs', 'src/main.js', 'src/styles.css', 'src/webmcp.js', 'src/store.js', 'src/logic.js', 'src/data.js'];
for (const file of required) await access(file);
const html = await readFile('index.html', 'utf8');
const source = await readFile('src/webmcp.js', 'utf8');
const runtime = await readFile('src/main.js', 'utf8');
const submission = await readFile('docs/devpost-form-answers.md', 'utf8');
const vercel = await readFile('vercel.json', 'utf8');
if (!html.includes('src="/src/main.js"')) throw new Error('index.html does not point at the runtime entrypoint');
for (const affordance of ['lang="en"', 'name="viewport"']) if (!html.includes(affordance)) throw new Error(`missing document affordance: ${affordance}`);
for (const affordance of ['skip-link', 'aria-live', 'aria-busy', 'prefers-reduced-motion']) if (![html, await readFile('src/main.js', 'utf8'), await readFile('src/styles.css', 'utf8')].some((content) => content.includes(affordance))) throw new Error(`missing accessibility affordance: ${affordance}`);
if (!runtime.includes("if (store.getState().status === 'building') return;")) throw new Error('human build action is not guarded against duplicate work');
if (!runtime.includes("${state.status === 'building' ? 'disabled' : ''}")) throw new Error('loading action is not disabled in the UI');
for (const claim of ['https://sidequest-webmcp.vercel.app', 'https://github.com/DominiqueAndrew/sidequest-webmcp', 'npm run smoke', 'TBD', 'no Devpost submission has been made or claimed']) if (!submission.includes(claim)) throw new Error(`submission packet missing evidence boundary: ${claim}`);
for (const tool of ['sidequest.search_stops', 'sidequest.draft_plan', 'sidequest.swap_stop', 'sidequest.inspect_plan', 'sidequest.save_plan']) if (!source.includes(tool)) throw new Error(`missing WebMCP tool: ${tool}`);
if (!source.includes('document.modelContext.registerTool')) throw new Error('current WebMCP registration path missing');
for (const header of ['Content-Security-Policy', 'Referrer-Policy', 'X-Content-Type-Options', 'Permissions-Policy']) if (!vercel.includes(header)) throw new Error(`missing security header: ${header}`);
console.log(`build check passed: ${required.length} required files, 5 WebMCP tools, and accessibility/security guards`);
