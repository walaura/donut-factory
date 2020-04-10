import { html } from 'lit-html';
import { $padding } from '../$padding';

export const $pretty = (str) =>
	$padding(html`<pre>${JSON.stringify(str, null, 2)}</pre>`);
