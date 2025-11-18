import { useState } from "react";

export const useSlidePanel = () => {
	const [open, setOpen] = useState(true);

	const toggle = () => setOpen((prev) => !prev);
	const close = () => setOpen(false);
	const openPanel = () => setOpen(true);

	return { open, toggle, close, openPanel, setOpen };
};
