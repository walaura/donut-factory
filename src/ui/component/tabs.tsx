import { h, JSX } from 'preact';
import { useState } from 'preact/hooks';
import { css } from '../helper/style';
import { DietButton, RevealButton } from './button';
import { Flex } from './list/flex-list';
import { Wash } from './wash';
import { Emoji } from './emoji';
import { Scroll } from './primitives/scroll';

interface Tab {
	name: string;
	emoji: string;
	contents: JSX.Element;
	shows?: boolean;
}

export interface TabsProps {
	children: Tab[];
	sideways?: boolean;
}

const tabbarStyles = {
	main: css`
		display: grid;
		grid-auto-columns: minmax(1fr, calc(var(--pressable) * 2));
		grid-auto-flow: column;
		justify-content: center;
		grid-gap: calc(var(--space-h) / 4);
		&[data-sideways='true'] {
			grid-auto-flow: row;
			grid-template-columns: 1fr;
			grid-auto-rows: min-content;
		}
		& button {
			contain: strict;
			min-width: var(--pressable);
			height: var(--pressable);
			min-height: var(--pressable);
			box-shadow: none !important;
			display: grid;
			align-items: stretch;
			justify-content: stretch;
			background: none;
			padding: 0;
			border-radius: 0;
			overflow: hidden;
		}
		transition: 0.1s ease-in-out;
		& button[data-active='true'] > * > * {
			background-image: linear-gradient(
				to bottom,
				var(--text-title) 0%,
				var(--text-title) 3px,
				transparent 2px
			);
		}
		&[data-sideways='true'] button[data-active='true'] > * > * {
			background-image: linear-gradient(
				to right,
				var(--text-title) 0%,
				var(--text-title) 3px,
				transparent 2px
			);
		}
	`,
	center: css`
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 0;
	`,
};
const Tabbar = ({
	tabs,
	onChange,
	activeTab,
	sideways = false,
}: {
	tabs: Tab[];
	sideways: boolean;
	activeTab: number;
	onChange: (number) => void;
}) => {
	return (
		<nav data-sideways={sideways} class={tabbarStyles.main}>
			{tabs.map((t, i) => {
				if (t.shows === false) {
					return null;
				}
				return (
					<RevealButton
						data-active={i === activeTab}
						onClick={() => onChange(i)}
						title={t.name}>
						<Wash
							squareOff={
								sideways
									? ['topRight', 'bottomRight']
									: ['bottomLeft', 'bottomRight']
							}
							counter={i !== activeTab}>
							<span class={tabbarStyles.center}>
								<Emoji emoji={t.emoji} />
							</span>
						</Wash>
					</RevealButton>
				);
			})}
		</nav>
	);
};

const styles = css`
	display: grid;
	grid-template-rows: min-content 1fr;
	justify-content: stretch;
	flex-direction: column;
	height: 100%;
	width: 100%;
	&[data-sideways='true'] {
		flex-direction: row;
	}
`;
export const Tabs = ({ children, sideways = false }: TabsProps) => {
	const [activeTab, setActiveTab] = useState(0);
	return (
		<div data-sideways={sideways} class={styles}>
			<Flex
				distribute={['squish', 'grow']}
				direction={sideways ? 'row' : 'column'}
				dividers={false}>
				<Tabbar
					tabs={children}
					onChange={setActiveTab}
					activeTab={activeTab}
					sideways={sideways}
				/>
				<Wash key={activeTab} squareOff={sideways ? ['topLeft'] : []}>
					<Scroll>{children[activeTab].contents}</Scroll>
				</Wash>
			</Flex>
		</div>
	);
};
