import { h } from 'preact';

export const Pre = ({ children }: { children: {} }) => (
	<pre>{JSON.stringify(children, null, 2)}</pre>
);
