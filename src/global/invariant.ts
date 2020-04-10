export const wrongContext = (expected, got) =>
	Error(`Function call from wrong context (wanted:${expected}–got:${got})`);
