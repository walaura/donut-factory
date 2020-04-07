import { html } from 'lit-html';

export const $emoji = (str) =>
	html`<x-emoji><xe-glyph>${str}</xe-glyph></x-emoji>`;
