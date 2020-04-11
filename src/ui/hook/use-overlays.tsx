import { createContext, h } from 'preact';
import { useContext } from 'preact/hooks';
import { ID } from '../../helper/defs';
import { Draggable, DragHandle } from '../components/Draggable';
import { SerializableRoute, RouteRenderer } from '../helper/route.defs.ts';

export type TaggedWindow = {
	renderer: RouteRenderer<any, any>;
	props: any;
	id: ID;
};

export type OverlayContext = {
	windows: TaggedWindow[];
	pushRoute: (ev: MouseEvent, rt: SerializableRoute) => void;
	pushRendererYOLO: (
		ev: MouseEvent,
		rt: RouteRenderer<any, any>,
		props: any
	) => void;
	closeWindow: (id: ID) => void;
};

export interface OverlayInnerContext {
	dragHandle: DragHandle;
	closeHandle: () => void;
}
const Windows = createContext<OverlayContext>((null as any) as OverlayContext);
const OverlayInnerContext = createContext<OverlayInnerContext>(
	(null as any) as OverlayInnerContext
);
export const useOverlays = () => useContext(Windows);
export const useOverlayHandles = (): OverlayInnerContext =>
	useContext(OverlayInnerContext);
/*
const adjustxy = (x, y) => {
	x = x + Math.min(0, document.body.clientWidth - x - width - 40);
	if (x > document.body.clientWidth / 2) {
		y = Math.max(y, 100);
	}
};
*/

export const OverlaysProvider = Windows.Provider;

export const Taskbar = () => {
	let { windows, closeWindow } = useContext(Windows);

	console.log(windows);
	return (
		<div data-key="windows">
			{windows.map(({ renderer, props, id }) => (
				<Draggable startAt={{ x: 20, y: 20 }}>
					{(dragHandle) => {
						const {
							container: Container,
							root: Root,
							...containerProps
						} = renderer;
						return (
							<OverlayInnerContext.Provider
								value={{
									dragHandle,
									closeHandle: () => closeWindow(id),
								}}>
								<Container {...containerProps}>
									<Root {...props} />
								</Container>
							</OverlayInnerContext.Provider>
						);
					}}
				</Draggable>
			))}
		</div>
	);
};
