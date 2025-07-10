"use client";

import {useState} from "react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {useSearchParams, useRouter} from "next/navigation";
import {formUrlQuery, removeKeysFromUrlQuery} from "@/lib/url";

const filters = [
	{ name: "Newest", value: "newest" },
	{ name: "Popular", value: "popular" },
	{ name: "Unanswered", value: "unanswered" },
	{ name: "Recommended", value: "recommended" },
]

const HomeFilter = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const filterParams = searchParams.get("filter");
	const [active, setActive] = useState(filterParams || "");

	const handleTypeClick = (filter: string) => {
		let newUrl = "";

		if (filter === active) {
			setActive("");

			newUrl = removeKeysFromUrlQuery({
				params: searchParams.toString(),
				keysToRemove: ["filter"],
			});
		} else {
			setActive(filter);

			newUrl = formUrlQuery({
				params: searchParams.toString(),
				key: "filter",
				value: filter.toLowerCase(),
			});
		}

		router.push(newUrl, { scroll: false });
	}

	return (
		<div className="mt-10 hidden flex-wrap gap-3 sm:flex">
			{filters.map((filter) => (
				<Button
					key={filter.name}
					className={cn(
						`body-medium rounded-lg px-6 py-3 capitalize shadow-none`,
						active === filter.value
							? 'primary-gradient text-primary-100 hover:bg-primary-100 dark:hover:bg-dark-400'
							: 'bg-light-800 text-light-500 hover:bg-light-800 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-300'
					)}
					onClick={() => handleTypeClick(filter.value)}
				>
					{filter.name}
				</Button>
			))}
		</div>
	)
};

export default HomeFilter;