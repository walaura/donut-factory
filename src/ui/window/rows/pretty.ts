import { html } from 'lit-html';

export const $pretty = (str) =>
	html`<pre>${JSON.stringify(str, null, 2)}</pre>`;
