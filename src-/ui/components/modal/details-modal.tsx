import { h } from 'preact';
import { useState } from 'preact/hooks';
import { css } from '../../helper/style';
import { inflateTaskbarItem, TaskbarProvider } from '../../hook/use-taskbar';
import {
	Item,
	TaskbarItemType,
	useTaskbarItem,
} from '../../hook/use-taskbar/item';
import { Padding } from '../primitives/padding';
import { Wash } from '../wash';
import { Modal } from './Modal';
import { Flex } from '../list/flex-list';
import { Emoji } from '../emoji';
import { Heading } from '../type';

const Deets = ({ children }) => {
	const {
		identifiers: { emoji, name },
	} = useTaskbarItem();
	return (
		<Wash>
			<Flex direction="column" dividers distribute={['squish', 'grow']}>
				<div
					class={css`
						height: var(--pressable);
						display: grid;
						grid-template-columns: var(--pressable) 1fr;
						grid-gap: var(--space-h);
						align-items: center;
					`}>
					<div
						class={css`
							justify-self: center;
						`}>
						{emoji && <Emoji emoji={emoji} />}
					</div>
					<Heading>{name}</Heading>
				</div>
				<Padding size="small">{children}</Padding>
			</Flex>
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
	const [item, setItem] = useState<TaskbarItemType | null>(null);
	return (
		<Modal {...props} width={2}>
			<div class={styles}>
				<div data-alt-colors>
					<TaskbarProvider
						pusher={(pushee, others) => {
							console.log(item);
							setItem(inflateTaskbarItem(pushee, others));
						}}>
						{children}
					</TaskbarProvider>
				</div>
				{item && (
					<Item key={item.id} item={{ ...item, container: Deets }}></Item>
				)}
			</div>
		</Modal>
	);
};
