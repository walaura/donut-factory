import { TemplateResult, Part } from 'lit-html';

type TemplateUnit =
	| string
	| number
	| TemplateResult
	| HTMLElement
	| Part
	| ((part: Part) => void);
export type TemplateHole = TemplateUnit | null | TemplateHole[];
