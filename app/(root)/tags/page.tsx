import {getTags} from "@/lib/actions/tag.action";
import {RouteParams} from "@/types/global";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import DataRenderer from "@/components/DataRenderer";
import {EMPTY_TAGS} from "@/constants/states";
import TagCard from "@/components/cards/TagCard";
import {TagFilters} from "@/constants/filters";
import CommonFilter from "@/components/filters/CommonFilter";
import Pagination from "@/components/Pagination";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: 'Tags | SWEOverflow',
  description: 'Explore a variety of tags on SWEOverflow, the platform for software engineering discussions.',
}

const Tags = async ({ searchParams }: RouteParams) => {
	const { page, pageSize, query, filter } = await searchParams;

	const { success, data, error } = await getTags({
		page: Number(page) || 1,
		pageSize: Number(pageSize) || 6,
		query,
		filter,
	})

	const { tags, isNext } = data || {};

	return (
		<>
			<h1 className="h1-bold text-dark100_light900 text-3xl">Tags</h1>

			<section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
				<LocalSearch
					route={ROUTES.TAGS}
					imgSrc="/icons/search.svg"
					placeholder="Search tags..."
					otherClasses="flex-1"
				/>

				<CommonFilter
          filters={TagFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
			</section>

			<DataRenderer
				success={success}
				error={error}
				data={tags}
				empty={EMPTY_TAGS}
				render={(tags) => (
					<div className="mt-10 flex w-full flex-wrap gap-4">
						{tags.map((tag) => <TagCard key={tag._id} {...tag} />)}
					</div>
				)}
			/>

			<Pagination page={page} isNext={isNext || false} />
		</>
	)
}

export default Tags;