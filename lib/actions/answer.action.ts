"use server";

import {ActionResponse, ErrorResponse} from "@/types/global";
import {IAnswerDoc} from "@/database/answer.model";
import {AnswerServerSchema} from "@/lib/validations";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import mongoose from "mongoose";
import {Answer, Question} from "@/database";
import {revalidatePath} from "next/cache";
import ROUTES from "@/constants/routes";

export async function createAnswer(
	params: CreateAnswerParams,
): Promise<ActionResponse<IAnswerDoc>> {
	const validationResult = await action({
		params, schema: AnswerServerSchema, authorize: true,
	});

	if (validationResult instanceof Error) {
		return handleError(validationResult) as ErrorResponse;
	}

	const { content, questionId } = validationResult.params!;
	const userId = validationResult?.session?.user?.id;

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const question = await Question.findById(questionId);
		if (!question) throw new Error("Question not found");

		const [newAnswer] = await Answer.create(
			[
				{
					author: userId,
					question: questionId,
					content,
				}
			], { session }
		)

		if (!newAnswer) throw new Error("Failed to create answer");

		question.answers += 1;
		await question.save({ session });

		await session.commitTransaction();

		revalidatePath(ROUTES.QUESTION(questionId));

		return { success: true, data: JSON.parse(JSON.stringify(newAnswer)) };
	} catch (error) {
		await session.abortTransaction();
		return handleError(error) as ErrorResponse;
	} finally {
		await session.endSession();
	}
}