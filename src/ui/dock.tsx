import { Fragment, h } from 'preact';
import { dispatchToCanvas } from '../global/dispatch';
import { DietButton } from './component/button';
import { Emoji } from './component/emoji';
import { numberWithCommas, numberAsCurrency } from './helper/format';
import { css } from './helper/style';
import { useLastKnownGameState } from './hook/use-game-state';
import { UIStatePriority } from './hook/use-global-state';
import { useTaskbar } from './hook/use-taskbar';
import { DetailsModal } from './component/modal/details-modal';
import { useLastKnownCanvasState } from './hook/use-canvas-state';
import { Pre } from './component/primitives/pre';

const emojiStyles = {
	root: css`
		min-width: calc(var(--pressable) - (var(--space-h) * 2));
		box-sizing: content-box;
		overflow: hidden;
	`,
	host: css`
		display: grid;
		align-items: center;
		justify-content: center;
		height: 100%;
		margin: 0 -2em;
		padding: 0 2em;
	`,
};
const DockEmoji = ({
	emoji,
	title,
	onClick,
}: {
	onClick?: (ev: MouseEvent) => void;
	emoji: string;
	title: string;
}) => (
	<div class={emojiStyles.root} title={title}>
		{onClick ? (
			<div class={emojiStyles.host}>
				<DietButton onClick={onClick}>
					<Emoji emoji={emoji} />
				</DietButton>
			</div>
		) : (
			<div class={emojiStyles.host}>
				<Emoji emoji={emoji} />
			</div>
		)}
	</div>
);

const DockText = ({ children }: { children: preact.ComponentChildren }) => (
	<div
		class={css`
			display: grid;
			align-items: center;
			justify-content: center;
		`}>
		{children}
	</div>
);

const panelStyles = css`
	background: var(--bg-light);
	font-weight: var(--font-bold);
	display: grid;
	border-radius: 1000em;
	height: var(--pressable);
	grid-auto-flow: column;
	grid-template-rows: 1fr;
	align-items: stretch;
	box-shadow: var(--shadow-1);
	overflow: hidden;
	& > * {
		padding-left: var(--space-h);
		padding-right: var(--space-h);
	}
	& > * + * {
		border-left: 1px solid var(--bg-wash);
	}
	& > *:first-child {
		padding-left: calc(var(--space-h) * 1.5);
	}
	& > *:last-child {
		padding-right: calc(var(--space-h) * 1.5);
	}
`;

const DockPanel = ({
	onClick,
	children,
}: {
	children: preact.ComponentChildren;
	onClick?: (ev: MouseEvent) => void;
}) => {
	if (onClick)
		return (
			<DietButton onClick={onClick}>
				<DockPanel>{children}</DockPanel>
			</DietButton>
		);
	return <div className={panelStyles}>{children}</div>;
};

const styles = css`
	position: fixed;
	contain: content;
	padding: calc(var(--space-h) * 2);
	display: grid;
	top: 0;
	right: 0;
	grid-auto-flow: column;
	grid-gap: calc(var(--space-h) * 2);
	transition: 0.1s ease-in-out;
	& button:active [data-cssid='emoji'] {
		transform: scale(1.5);
	}
`;

const ClockPanel = () => {
	let time = useLastKnownGameState((s) => s.date, UIStatePriority.UI);
	let date = new Date(time);
	const dtf = new Intl.DateTimeFormat('en', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
	});
	const clock = new Intl.DateTimeFormat('en', {
		hour: 'numeric',
		minute: 'numeric',
	});

	return (
		<div
			className={css`
				position: relative;
			`}>
			<DockPanel>
				<DockEmoji emoji={'📆'} title={'Calendar'} />
				<DockText>{dtf.format(date)}</DockText>
				<DockText>
					<div
						className={css`
							width: 7ch;
							overflow: hidden;
							text-align: center;
						`}>
						{clock.format(date)}
					</div>
				</DockText>
			</DockPanel>
		</div>
	);
};

const MoneyPanel = () => {
	let ledger = useLastKnownGameState((s) => s.ledger, UIStatePriority.Cat);
	let { push } = useTaskbar();

	return (
		<Fragment>
			<DockPanel
				onClick={(ev) => {
					push({ route: ['ledger', undefined] }, { ev });
				}}>
				<DockEmoji emoji="💰" title="Money" />
				<DockText>
					{numberAsCurrency(
						ledger.map(({ tx }) => tx).reduce((a, b) => a + b, 0)
					)}
				</DockText>
			</DockPanel>
		</Fragment>
	);
};

const ToolsPanel = () => {
	let { push } = useTaskbar();
	return (
		<Fragment>
			<DockPanel>
				<DockEmoji
					emoji={'👩‍🔧'}
					title="Staffing"
					onClick={(ev) => {
						push(
							{ route: ['allEntities', undefined] },
							{
								ev,
								prefersContainer: DetailsModal,
								size: { width: 600, height: 450 },
							}
						);
					}}
				/>
				<DockEmoji
					emoji={'✏️'}
					title="Edit mode"
					onClick={(ev) => {
						dispatchToCanvas({
							type: 'toggle-edit-mode',
						});
					}}
				/>
				<DockEmoji
					emoji={'🍔'}
					title="System"
					onClick={(ev) => {
						push({ route: ['system', undefined] }, { ev });
					}}
				/>
			</DockPanel>
		</Fragment>
	);
};

const Dock = (): h.JSX.Element => {
	const isEditMode = useLastKnownCanvasState(
		(s) => s.editMode,
		UIStatePriority.UI
	);

	if (isEditMode) {
		return (
			<div class={styles}>
				<DockPanel
					onClick={(ev) => {
						dispatchToCanvas({
							type: 'set-edit-mode',
							to: false,
						});
					}}>
					<DockText>Stop Editing</DockText>
					<DockEmoji emoji={'🚫'} title="Quit editing" />
				</DockPanel>
			</div>
		);
	}

	return (
		<div class={styles}>
			<MoneyPanel />
			<ClockPanel />
			<ToolsPanel />
		</div>
	);
};

export { Dock };
