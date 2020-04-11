import { h } from 'preact';
import { Dock } from './dock';
import { Taskbar, TaskbarProvider } from './hook/use-taskbar';
import { CompatError } from './compat-error';

export const UI = () => {
	return (
		<TaskbarProvider>
			<Taskbar />
			<Dock />
			<CompatError />
		</TaskbarProvider>
	);
};
