import { useState, useEffect } from 'preact/hooks';
import { RouteRenderer } from './helper/route.defs.ts';
import { routeRenderers } from './helper/route';
import { Dock } from './Dock';
import { OverlayContext, OverlaysProvider, Taskbar } from './hook/use-overlays';
import { h } from 'preact';
const shortid = require('shortid');

export const UI = () => {
	const [windows, setWindows] = useState<OverlayContext['windows']>([]);

	const pushRenderer = (renderer: RouteRenderer<any, any>, props: any) => {
		setWindows((w) => [...w, { renderer, props, id: shortid() }]);
	};

	const value: OverlayContext = {
		windows,
		closeWindow: (id) => {
			setWindows((ws) => ws.filter((w) => w.id !== id));
		},
		pushRendererYOLO: (ev, renderer, props) => {
			pushRenderer(renderer, props);
		},
		pushRoute: (ev, [id, props]) => {
			const result = routeRenderers[id];
			pushRenderer(result, props);
		},
	};

	useEffect(() => {
		if (self.memory.id === 'MAIN') {
			if (self.memory.ui) {
				return;
			}
			self.memory.ui = {
				pushRoute: (_, [id, params]) => {
					const renderer = routeRenderers[id];
					pushRenderer(renderer, params);
				},
			};
		}
	}, []);

	return (
		<OverlaysProvider value={value}>
			<Taskbar />
			<Dock />
		</OverlaysProvider>
	);
};
