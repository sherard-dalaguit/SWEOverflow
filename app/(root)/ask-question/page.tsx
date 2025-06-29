import QuestionForm from '@/components/forms/QuestionForm';
import {auth} from "@/auth";
import {redirect} from "next/navigation";

const AskAQuestion = async () => {
	const session = await auth();
	if (!session) return redirect("/sign-in");

	return (
		<div>
			<h1 className="h1-bold text-dark100_light900">Ask a question</h1>

			<div className="mt-9">
				<QuestionForm />
			</div>
		</div>
	)
}

export default AskAQuestion;