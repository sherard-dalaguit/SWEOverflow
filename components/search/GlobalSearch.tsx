"use client";

import {Input} from "@/components/ui/input";
import Image from "next/image";
import {useSearchParams, useRouter, usePathname} from "next/navigation";
import {useEffect, useState} from "react";
import {formUrlQuery, removeKeysFromUrlQuery} from "@/lib/url";
import GlobalResult from "@/components/GlobalResult";

interface Props {
	route: string;
	imgSrc: string;
	placeholder: string;
}

const GlobalSearch = ({ route, imgSrc, placeholder }: Props) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const query = searchParams.get("global") || "";

	const [searchQuery, setSearchQuery] = useState(query);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (searchQuery) {
				const newUrl = formUrlQuery({
					params: searchParams.toString(),
					key: "global",
					value: searchQuery,
				});

				router.push(newUrl, { scroll: false });
			} else {
				if (pathname === route) {
					const newUrl = removeKeysFromUrlQuery({
						params: searchParams.toString(),
						keysToRemove: ["global", "type"],
					});

					router.push(newUrl, { scroll: false });
				}
			}
		}, 300)

		return () => clearTimeout(delayDebounceFn);
	}, [searchQuery, router, route, searchParams]);

	return (
		<div className="relative w-full max-w-[600px] max-lg:hidden">
			<div className="background-light800_darkgradient flex min-h-[56px] grow items-center gap-1 rounded-xl px-4">
				<Image
					src={imgSrc}
					width={22}
					height={22}
					alt="Search"
					className="cursor-pointer"
				/>
				<Input
					type="text"
					placeholder={placeholder}
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value)
						if (!isOpen) setIsOpen(true);
						if (e.target.value === '' && isOpen) setIsOpen(false);
					}}
					className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
				/>
			</div>
			{isOpen && <GlobalResult />}
		</div>
	)
};

export default GlobalSearch;