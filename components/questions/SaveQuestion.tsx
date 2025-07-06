"use client";

import {useSession} from "next-auth/react";
import {useState} from "react";
import Image from "next/image";
import {toast} from "sonner";
import {toggleSaveQuestion} from "@/lib/actions/collection.action";

const SaveQuestion = ({ questionId } : { questionId: string }) => {
	const session = useSession();
	const userId = session?.data?.user?.id;

	const [isLoading, setIsLoading] = useState(false);

	const handleSave = async () => {
		if (isLoading) return;
		if (!userId) {
			return toast.error('Error', { description: 'You must be logged in to save a question.' });
		}

		setIsLoading(true);

		try {
			const { success, data, error } = await toggleSaveQuestion({ questionId });

			if (!success) throw new Error(error?.message || 'An error occurred while saving the question.');

			toast.success('Success', { description: data?.saved ? 'Question saved successfully.' : 'Question unsaved successfully.' });
		} catch (error) {
			toast.error(
				'Error',
				{ description:
						error instanceof Error
							? error.message
							: 'An error occurred while saving the question.'
				}
			);
		} finally {
			setIsLoading(false);
		}
	}

	const hasSaved = false;

	return (
		<Image
			src={hasSaved ? "/icons/star-filled.svg" : "/icons/star-red.svg"}
			width={18}
			height={18}
			alt="save"
			className={`cursor-pointer ${isLoading && 'opacity-50'}`}
			aria-label="save question"
			onClick={handleSave}
		/>
	)
};

export default SaveQuestion;