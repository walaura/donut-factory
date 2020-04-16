import { XY } from '../helper/xy';
import { SerializableRoute } from './helper/route';

export const windowRequestEvent = 'requestWindow';

export const requestWindow = (xy: XY, route: SerializableRoute) => {
	self.dispatchEvent(
		new CustomEvent('requestWindow', { detail: { xy, route } })
	);
};
