import { h } from 'preact';
import { Dock } from './dock';
import { Taskbar, TaskbarProvider } from './hook/use-taskbar';
import { CompatError } from './compat-error';
import { Canvas } from './canvas';

const UI = () => {
	return (
		<TaskbarProvider>
			<Taskbar />
			<Dock />
			<CompatError />
		</TaskbarProvider>
	);
};

const aa = 12;
export { UI, aa };
