import {RouteParams} from "@/types/global";
import {getUsers} from "@/lib/actions/user.action";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import DataRenderer from "@/components/DataRenderer";
import {EMPTY_USERS} from "@/constants/states";
import UserCard from "@/components/cards/UserCard";
import {UserFilters} from "@/constants/filters";
import CommonFilter from "@/components/filters/CommonFilter";
import Pagination from "@/components/Pagination";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: 'Community | SWEOverflow',
  description: 'Explore the SWEOverflow community, connect with users, and discover insights from fellow software engineers.',
}

const Community = async ({ searchParams }: RouteParams) => {
	const { page, pageSize, query, filter } = await searchParams;

	const { success, data, error } = await getUsers({
		page: Number(page) || 1,
		pageSize: Number(pageSize) || 10,
		query,
		filter,
	});

	const { users, isNext } = data || {};

	return (
		<div>
			<h1 className="h1-bold text-dark100_light900">All Users</h1>

			<div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
				<LocalSearch
					route={ROUTES.COMMUNITY}
					iconPosition="left"
					imgSrc="/icons/search.svg"
					placeholder="Search users..."
					otherClasses="flex-1"
				/>

				<CommonFilter
          filters={UserFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
			</div>

			<DataRenderer
				empty={EMPTY_USERS}
				data={users}
				success={success}
				error={error}
				render={(users) => (
					<div className="mt-12 flex flex-wrap gap-5">
						{users.map((user) => (
							<UserCard key={user._id} {...user} />
						))}
					</div>
				)}
			/>

			<Pagination page={page} isNext={isNext || false} />
		</div>
	)
}

export default Community;