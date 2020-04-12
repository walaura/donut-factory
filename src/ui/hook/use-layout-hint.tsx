import { createContext, h } from 'preact';
import { useContext } from 'preact/hooks';

type LayoutHint = {
	horizontal: 'wider' | 'normal' | 'narrower';
	vertical: 'wider' | 'normal' | 'narrower';
};

const LayoutHintContext = createContext<LayoutHint>({
	horizontal: 'normal',
	vertical: 'normal',
});

export const useLayoutHints = () => useContext(LayoutHintContext);
export const WithLayoutHints = ({
	children,
	...values
}: { children } & LayoutHint) => (
	<LayoutHintContext.Provider value={values}>
		{children}
	</LayoutHintContext.Provider>
);
