import { TemplateResult, Part } from 'lit-html';

type TemplateUnit =
	| string
	| number
	| TemplateResult
	| Part
	| ((part: Part) => void);
export type TemplateHole = TemplateUnit | (TemplateUnit | null)[] | null;
