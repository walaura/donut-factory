import { html } from 'lit-html';
import { JSX, h } from 'preact';
import { useState } from 'preact/hooks';
import { css } from '../helper/style';
import { $emoji } from './$emoji';
import { $wash } from './$wash';
import { Flex } from './List/FlexList';
import { Wash } from './Wash';
import { Scroll } from './Scroll';
import { DietButton } from './Button';
import { Emoji } from './Emoji';

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
			box-shadow: none !important;
			display: flex;
			align-items: center;
			justify-content: center;
			background: none;
			padding: 0;
			border-radius: 0;
			overflow: hidden;
		}
		transition: 0.1s ease-in-out;
		& button:focus {
			outline: none;
		}
		& button > * {
			transition: 0.25s ease-in-out;
		}
		& button:active > * {
			transform: scale(1.25);
		}
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
					<DietButton
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
					</DietButton>
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
