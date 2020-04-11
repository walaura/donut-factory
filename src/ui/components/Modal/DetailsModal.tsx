import { h, JSX } from 'preact';
import { useState, useRef } from 'preact/hooks';
import { renderRoute, getRendererForRouter } from '../../helper/route';
import { OverlaysProvider, useOverlays } from '../../hook/use-overlays';
import { Flex } from '../List/FlexList';
import { Modal } from './Modal';
import { SerializableRoute } from '../../helper/route.defs.ts';
import { ModalHeader } from './ModalHeader';
import { Wash } from '../Wash';
import { css } from '../../helper/style';

const Deets = ({ route }: { route: SerializableRoute }) => {
	const deets = getRendererForRouter(route);

	return (
		<Wash>
			<div key={route}>{renderRoute(route)}</div>
		</Wash>
	);
};

const styles = css`
	display: grid;
	height: 100%;
	width: 100%;
	grid-template-columns: 40% 60%;
	grid-gap: 2px;
	grid-auto-rows: 100%;
	* > * {
		position: relative;
	}
`;

export const DetailsModal = ({
	children,
	...props
}: Parameters<typeof Modal>[0]) => {
	const [child, setChild] = useState<SerializableRoute | null>(null);
	const existingProvider = useOverlays();
	return (
		<Modal {...props} width={2}>
			<div class={styles}>
				<div data-alt-colors>
					<OverlaysProvider
						value={{
							...existingProvider,
							pushRoute: (ev, route) => {
								console.log(route);
								setChild(route);
							},
						}}>
						{children}
					</OverlaysProvider>
				</div>
				{child && <Deets route={child}></Deets>}
			</div>
		</Modal>
	);
};
