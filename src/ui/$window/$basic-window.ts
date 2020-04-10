import { XY } from '../../helper/xy';
import { TemplateHole } from '../helper/defs';
import {
	$windowBase,
	CallableWindowRoute,
	generateCallableWindowFromEv,
} from './$window';
import { $wash } from '../components/$wash';

export const $basicWindow = (
	callable: CallableWindowRoute,
	{ x, y, onClose }: Partial<XY> & { onClose: () => void }
): TemplateHole => {
	const onNavigate = generateCallableWindowFromEv;
	return $windowBase({
		x,
		y,
		onClose,
		...callable,
		children: callable.render({ onNavigate, onClose }),
	});
};
