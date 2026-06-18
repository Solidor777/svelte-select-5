const fs = require('fs');
const path = require('path');

const TOKENS_FILE = path.join(__dirname, '..', 'src', 'lib', 'styles', 'tokens.css');
const DOC_FILE = path.join(__dirname, 'theming_variables.md');
const SECTION = /<!-- List start -->[\s\S]*<!-- List end -->/;

const css = fs.readFileSync(TOKENS_FILE, 'utf8');

// Declared --svelte-select-* custom properties (the public token API).
const tokens = [...new Set([...css.matchAll(/^\s*(--svelte-select-[a-z0-9-]+)\s*:/gim)].map((m) => m[1]))].sort();

// Legacy vars consumed as the first argument of var(--legacy, …); these are the
// deprecated flat variables still honored for back-compat.
const legacy = [
    ...new Set(
        [...css.matchAll(/var\(\s*(--[a-z0-9-]+)\s*,/gim)]
            .map((m) => m[1])
            .filter((v) => !v.startsWith('--svelte-select-'))
    ),
].sort();

const lines = [
    '## Tokens (`--svelte-select-*`)',
    '',
    'Override these to theme the component. Tier 1 primitives (colors, radius, sizes)',
    'retheme everything at once; the remaining tokens target individual parts.',
    '',
    ...tokens.map((t) => `- \`${t}\``),
    '',
    '## Dark theme',
    '',
    'Set `data-theme="dark"` on the `.svelte-select` element or any ancestor.',
    '',
    '## Deprecated legacy variables',
    '',
    'Still honored (mapped onto the tokens above) but deprecated — prefer the',
    '`--svelte-select-*` tokens. Slated for removal in a future major.',
    '',
    ...legacy.map((t) => `- \`${t}\``),
];

const oldContent = fs.readFileSync(DOC_FILE, 'utf8');
if (!SECTION.test(oldContent)) {
    console.error(`Could not find list markers in ${DOC_FILE}`);
    process.exit(1);
}

const replacement = ['<!-- List start -->', ...lines, '<!-- List end -->'].join('\n');
fs.writeFileSync(DOC_FILE, oldContent.replace(SECTION, replacement));
console.log(`Wrote ${tokens.length} tokens and ${legacy.length} deprecated vars to ${DOC_FILE}`);
