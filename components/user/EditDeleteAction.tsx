"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Image from "next/image";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {deleteQuestion} from "@/lib/actions/question.action";

interface Props {
	type: string;
	itemId: string;
}

const EditDeleteAction = ({ type, itemId }: Props) => {
	const router = useRouter();

	const handleEdit = async () => {
		router.push(`/questions/${itemId}/edit`);
	};

	const handleDelete = async () => {
		if (type === "Question") {
			await deleteQuestion({ questionId: itemId });
			toast.success("Success", { description: "Question deleted successfully" });
		} else if (type === "Answer") {
			// call api to delete answer
			toast.success("Success", { description: "Answer deleted successfully" });
		}
	};

	return (
		<div className={`flex items-center justify-end gap-3 max-sm:w-full ${type === "answer" && "gap-0 justify-center"}`}>
			{type === "Question" && (
				<Image
					src="/icons/edit.svg"
					alt="edit"
					width={14}
					height={14}
					className="cursor-pointer object-contain"
					onClick={handleEdit}
				/>
			)}

			<AlertDialog>
				<AlertDialogTrigger className="cursor-pointer">
					<Image
						src="/icons/trash.svg"
						alt="trash"
						width={14}
						height={14}
					/>
				</AlertDialogTrigger>
				<AlertDialogContent className="background-light800_dark300">
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete your{" "}
							{type === "Question" ? "question" : "answer"} and
							remove it from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="btn">Cancel</AlertDialogCancel>
						<AlertDialogAction className="!border-primary-100 !primary-gradient !text-light-800" onClick={handleDelete}>Continue</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
};

export default EditDeleteAction;