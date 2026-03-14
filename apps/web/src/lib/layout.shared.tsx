import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

const logo = (
	<Image
		alt="MangoWC"
		src="/logo-32x32.webp"
		width={32}
		height={32}
		className="size-5"
	/>
);

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: (
				<>
					{logo}
					<span className="font-medium max-md:hidden">MangoWC</span>
				</>
			),
		},
	};
}
