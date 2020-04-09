import { TemplateHole } from '../helper/defs';
import { useState } from '../helper/useState';
import { html } from 'lit-html';
import { css } from '../helper/style';
import { $emoji } from './emoji';
import { $rows } from './rows/row';
import { $windowWash } from '../$window';

interface TabsetTab {
	name: string;
	emoji: string;
	contents: TemplateHole;
	shows?: boolean | any;
}

export interface Tabset {
	tabs: TabsetTab[];
}

const styles = css`
	display: flex;
	justify-content: stretch;
	flex-direction: column;
	width: 100%;
`;
const body = css`
	max-width: 100%;
	justify-content: stretch;
	display: flex;
	overflow: scroll;
	flex: 1 1 0;
`;
export const $tabset = ({ tabs }: Tabset): TemplateHole => {
	const useTabState = useState(0);

	return useTabState((activeTab, setActiveTab) => {
		return html`<div class=${styles}>
			<x-tabbar>
				${tabs.map((t, i) => {
					if (!t.shows) {
						t.shows = true;
					}
					return html` <button
						class=${css`
							&[data-show='false'] {
								display: none;
							}
						`}
						data-show=${t.shows}
						data-active=${i === activeTab}
						@click=${() => setActiveTab(i)}
						title=${t.name}
					>
						${$emoji(t.emoji)}
					</button>`;
				})}
			</x-tabbar>
			<div class=${body}>
				${$windowWash(
					tabs.map((tab, index) => {
						if (index === activeTab) {
							return $rows(tab.contents as any, { breakout: false });
						}
						return null;
					})
				)}
			</div>
		</div> `;
	});
};
