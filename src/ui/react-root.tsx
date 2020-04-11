import { h } from 'preact';
import { Dock } from './Dock';
import { Taskbar, TaskbarProvider } from './hook/use-taskbar';

export const UI = () => {
	return (
		<TaskbarProvider>
			<Taskbar />
			<Dock />
		</TaskbarProvider>
	);
};
