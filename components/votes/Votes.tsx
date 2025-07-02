"use client";

import Image from "next/image";
import {useState} from "react";
import {formatNumber} from "@/lib/utils";
import {useSession} from "next-auth/react";
import {toast} from "sonner";

interface Props {
	upvotes: number;
	downvotes: number;
	hasUpvoted: boolean;
	hasDownvoted: boolean;
}

const Votes = ({ upvotes, downvotes, hasUpvoted, hasDownvoted }: Props) => {
	const session = useSession();
	const userId = session.data?.user?.id;

	const [isLoading, setIsLoading] = useState(false);

	const handleVote = async (voteType: 'upvote' | 'downvote') => {
		if (!userId) return toast.error('Error', { description: 'You must be logged in to vote.' });

		setIsLoading(true);

		try {
			const successMessage =
				voteType === "upvote"
					? `Upvote ${!hasUpvoted ? "added" : "removed"} successfully`
					: `Downvote ${!hasDownvoted ? "added" : "removed"} successfully`;

			toast.success('Success', { description: successMessage });
		} catch (error) {
			toast.error('Error', { description: 'An error occurred while processing your vote.' });
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex-center gap-2.5">
			<div className="flex-center gap-1.5">
				<Image
					src={hasUpvoted ? '/icons/upvoted.svg' : '/icons/upvote.svg'}
					alt="upvote icon"
					width={18}
					height={18}
					className={`cursor-pointer ${isLoading && 'opacity-50'}`}
					aria-label="upvote"
					onClick={() => !isLoading && handleVote('upvote')}
				/>

				<div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
					<p className="subtle-medium text-dark400_light900">
						{formatNumber(upvotes)}
					</p>
				</div>
			</div>

			<div className="flex-center gap-1.5">
				<Image
					src={hasDownvoted ? '/icons/downvoted.svg' : '/icons/downvote.svg'}
					alt="downvote icon"
					width={18}
					height={18}
					className={`cursor-pointer ${isLoading && 'opacity-50'}`}
					aria-label="downvote"
					onClick={() => !isLoading && handleVote('downvote')}
				/>

				<div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
					<p className="subtle-medium text-dark400_light900">
						{formatNumber(downvotes)}
					</p>
				</div>
			</div>
		</div>
	)
};

export default Votes;