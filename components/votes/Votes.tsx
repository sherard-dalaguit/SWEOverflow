"use client";

import Image from "next/image";
import {use, useState} from "react";
import {formatNumber} from "@/lib/utils";
import {useSession} from "next-auth/react";
import {toast} from "sonner";
import {HasVotedResponse} from "@/types/action";
import {ActionResponse} from "@/types/global";
import {createVote} from "@/lib/actions/vote.action";

interface Props {
	targetType: 'question' | 'answer';
	targetId: string;
	upvotes: number;
	downvotes: number;
	hasVotedPromise: Promise<ActionResponse<HasVotedResponse>>;
}

const Votes = ({ targetType, targetId, upvotes, downvotes, hasVotedPromise }: Props) => {
	const session = useSession();
	const userId = session.data?.user?.id;

	const { success, data } = use(hasVotedPromise);

	const [isLoading, setIsLoading] = useState(false);

	const { hasUpvoted, hasDownvoted } = data || {};

	const handleVote = async (voteType: 'upvote' | 'downvote') => {
		if (!userId) return toast.error('Error', { description: 'You must be logged in to vote.' });

		setIsLoading(true);

		try {
			const result = await createVote({
				targetId,
				targetType,
				voteType,
			});

			if (!result.success) {
				return toast.error(
					'Error',
					{ description: result.error?.message || 'An error occurred while processing your vote.' }
				);
			}

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
					src={success && hasUpvoted ? '/icons/upvoted.svg' : '/icons/upvote.svg'}
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
					src={success && hasDownvoted ? '/icons/downvoted.svg' : '/icons/downvote.svg'}
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