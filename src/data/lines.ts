// The site's network map: each topic is a line, each post a station.
// Colours live in main.css (--line-*); this file is the single place that
// names the lines and their order on the map (top to bottom).
export type LineId = 'ai' | 'agents' | 'dotnet' | 'hardware';

export interface LineInfo {
	id: LineId;
	name: string;
	blurb: string;
}

export const LINES: LineInfo[] = [
	{ id: 'ai', name: 'Azure AI', blurb: 'LLM integration, Azure AI, Semantic Kernel and Promptflow.' },
	{ id: 'agents', name: 'Agents', blurb: 'Agent frameworks and building products with AI.' },
	{ id: 'dotnet', name: '.NET & code', blurb: 'C#, .NET, tooling and developer platforms.' },
	{ id: 'hardware', name: 'Tinkering', blurb: 'Raspberry Pi, emulators and hardware hacks (2015).' },
];

export const lineById = (id: LineId | undefined): LineInfo =>
	LINES.find((l) => l.id === id) ?? LINES[2];
