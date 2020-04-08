import { html, render } from 'lit-html';
import sum from 'hash-sum';

import * as postcss from 'postcss';

const makeWrapper = (className) => {
	let selector = ['styles', className].join('-');
	if (!document.querySelector(`#${selector}`)) {
		let $styles = document.createElement('x-styles');
		$styles.id = selector;
		document.head.append($styles);
		return $styles;
	}
};

const parseNSaveRawCss = (
	classParser: (tokens: any) => string,
	parser: (className: string, tokens: any) => string | string[]
) => (...raw) => {
	const className = classParser(raw);
	let $styles = makeWrapper(className);
	if (!$styles) {
		return className;
	}
	render(
		html`<style>
			${parser(className, raw)}
		</style>`,
		$styles
	);
	return className;
};

export const keyframes = parseNSaveRawCss(
	(r) => sum(r),
	(className, raw) => {
		//@ts-ignore
		let cssRaw = String.raw(...raw);
		let ast = postcss.parse(cssRaw);
		return postcss
			.atRule({
				name: 'keyframes',
				params: className,
				nodes: ast.nodes,
			})
			.toString();
	}
);

export const css = parseNSaveRawCss(
	(r) => '💅' + sum(r),
	(className, raw) => {
		//@ts-ignore
		let cssRaw = String.raw(...raw);
		let rules: (postcss.Rule | postcss.AtRule)[] = [];
		let ast = postcss.parse(`!root! {${cssRaw}}`);
		ast.walkAtRules((r) => {
			rules.push(r);
			r.remove();
		});
		ast.walkRules((r) => {
			if (r.selector === '!root!') {
				r.selector = '.' + className;
			}
			r.selector = r.selector.replace(/&/gi, '.' + className);
			rules.push(r);
			r.remove();
		});

		return rules.map((r) => r.toString());
	}
);
