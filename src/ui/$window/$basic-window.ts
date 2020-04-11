import { TemplateHole } from '../helper/defs';
import {
	$windowBase,
	CallableWindowRoute,
	generateCallableWindowFromEv,
	WindowRendererProps,
} from './$window';

export const $basicWindow = (
	callable: CallableWindowRoute,
	{ at: { x, y }, onClose, scope }: WindowRendererProps
): TemplateHole => {
	const onNavigate = generateCallableWindowFromEv;
	return $windowBase({
		x,
		y,
		onClose,
		...callable,
		children: callable.render({ onNavigate, onClose, scope }),
	});
};
