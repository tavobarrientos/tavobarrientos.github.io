// The site's network map: each topic is a line, each post a station.
// Colours live in main.css (--line-*); this file is the single place that
// names the lines and their order on the map (top to bottom).
export type LineId = 'ai' | 'agents' | 'dotnet' | 'typescript' | 'hardware';

// A post's `line` frontmatter: one topic, or a list when it sits on several.
// The first one is its main line (the colour its card and row take).
export type LineField = LineId | readonly LineId[] | undefined;

export interface LineInfo {
	id: LineId;
	name: string;
	blurb: string;
}

export const LINES: LineInfo[] = [
	{ id: 'ai', name: 'Azure AI', blurb: 'LLM integration, Azure AI, Semantic Kernel and Promptflow.' },
	{ id: 'agents', name: 'Agents', blurb: 'Agent frameworks and building products with AI.' },
	{ id: 'dotnet', name: '.NET & code', blurb: 'C#, .NET, tooling and developer platforms.' },
	{ id: 'typescript', name: 'TypeScript', blurb: 'TypeScript, Node.js and the JavaScript ecosystem.' },
	{ id: 'hardware', name: 'Tinkering', blurb: 'Raspberry Pi, emulators and hardware hacks (2015).' },
];

const FALLBACK = LINES.find((l) => l.id === 'dotnet')!;

export const lineById = (id: LineId | undefined): LineInfo =>
	LINES.find((l) => l.id === id) ?? FALLBACK;

// Every line a post sits on, main line first. Never empty.
export const linesOf = (field: LineField): LineInfo[] => {
	const ids = field === undefined ? [] : typeof field === 'string' ? [field] : field;
	const found = ids.map((id) => LINES.find((l) => l.id === id)).filter((l): l is LineInfo => !!l);
	return found.length ? found : [FALLBACK];
};

export const hasLine = (field: LineField, id: LineId): boolean => linesOf(field).some((l) => l.id === id);
