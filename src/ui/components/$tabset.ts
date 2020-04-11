import { GameState } from '../../helper/defs';
import { useGameState } from '../helper/useGameState';
import { TemplateHole } from '../helper/defs';
import { useState } from '../helper/useState';
import { html } from 'lit-html';
import { css } from '../helper/style';
import { $emoji } from './$emoji';
import { $wash } from './$wash';

import { $flex } from './$flex';
import { $scroll } from './$scroll';

interface TabsetTab {
	name: string;
	emoji: string;
	contents: TemplateHole;
	shows?: (state: GameState) => boolean;
}

export interface Tabset {
	tabs: TabsetTab[];
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
const $tabbar = (
	tabs: TabsetTab[],
	{
		onChange,
		activeTab,
		sideways = false,
	}: {
		sideways: boolean;
		activeTab: number;
		onChange: (number) => void;
	}
) => {
	return html` <nav data-sideways=${sideways} class=${tabbarStyles.main}>
		${tabs.map((t, i) => {
			const result = html`<button
				data-active=${i === activeTab}
				@click=${() => onChange(i)}
				title=${t.name}
			>
				${$wash(
					html`<span class=${tabbarStyles.center}>${$emoji(t.emoji)}</div>`,
					{
						counter: i !== activeTab,
						squareOff: sideways
							? ['topRight', 'bottomRight']
							: ['bottomLeft', 'bottomRight'],
					}
				)}
			</button>`;

			if (!t.shows) {
				return result;
			}
			return useGameState((state) => {
				if (!t.shows) {
					return result;
				}
				if (t.shows(state)) {
					return result;
				}
			});
		})}
	</nav>`;
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
export const $tabset = ({ tabs, sideways = false }: Tabset): TemplateHole => {
	const useTabState = useState(0);

	return useTabState((activeTab, setActiveTab) => {
		return html`<div data-sideways=${sideways} class=${styles}>
			${$flex(
				[
					$tabbar(tabs, { onChange: setActiveTab, activeTab, sideways }),
					$wash(
						tabs.map((tab, index) => {
							if (index === activeTab) {
								return $scroll(tab.contents);
							}
							return null;
						}),
						sideways ? { squareOff: ['topLeft'] } : {}
					),
				],
				{
					distribute: ['squish', 'grow'],
					direction: sideways ? 'row' : 'column',
					dividers: false,
				}
			)}
		</div> `;
	});
};
