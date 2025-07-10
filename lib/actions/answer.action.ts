"use server";

import {ActionResponse, ErrorResponse} from "@/types/global";
import {IAnswerDoc} from "@/database/answer.model";
import {AnswerServerSchema, DeleteAnswerSchema, GetAnswersSchema} from "@/lib/validations";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import mongoose from "mongoose";
import {Answer, Collection, Question, Vote} from "@/database";
import {revalidatePath} from "next/cache";
import ROUTES from "@/constants/routes";
import {CreateAnswerParams, DeleteAnswerParams, GetAnswersParams} from "@/types/action";
import {Answer as AnswerType} from "@/types/global";
import TagQuestion from "../../database/tag-question.model";
import Tag from "../../database/tag.model";
import {after} from "next/server";
import {createInteraction} from "@/lib/actions/interaction.action";

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

		after(async () => {
			await createInteraction({
				action: 'post',
				actionTarget: 'answer',
				actionId: newAnswer._id.toString(),
				authorId: userId as string,
			})
		})

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

export async function getAnswers(params: GetAnswersParams): Promise<ActionResponse<{
	answers: AnswerType[],
	isNext: boolean,
	totalAnswers: number,
}>> {
	const validationResult = await action({
		params,
		schema: GetAnswersSchema,
	});

	if (validationResult instanceof Error) {
		return handleError(validationResult) as ErrorResponse;
	}

	const { questionId, page = 1, pageSize = 10, filter } = params;

	const skip = (Number(page) - 1) * Number(pageSize);
	const limit = pageSize;

	let sortCriteria = {};

	switch (filter) {
		case "latest":
			sortCriteria = { createdAt: -1 };
			break;
		case 'oldest':
			sortCriteria = { createdAt: 1 };
			break;
		case 'popular':
			sortCriteria = { upvotes: -1 };
			break;
		default:
			sortCriteria = { createdAt: -1 };
			break;
	}

	try {
		const totalAnswers = await Answer.countDocuments({ question: questionId });

		const answers = await Answer.find({ question: questionId })
			.populate("author", "_id name image")
			.sort(sortCriteria)
			.skip(skip)
			.limit(limit)

		const isNext = totalAnswers > (skip + answers.length);

		return {
			success: true,
			data: {
				answers: JSON.parse(JSON.stringify(answers)),
				isNext,
				totalAnswers,
			}
		}
	} catch (error) {
		return handleError(error) as ErrorResponse;
	}
}

export async function deleteAnswer(params: DeleteAnswerParams): Promise<ActionResponse> {
	const validationResult = await action({
		params,
		schema: DeleteAnswerSchema,
		authorize: true
	});

	if (validationResult instanceof Error) {
		return handleError(validationResult) as ErrorResponse;
	}

	const { answerId } = validationResult.params!;
	const userId = validationResult.session?.user?.id;

	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		const answer = await Answer.findById(answerId);

		if (!answer) {
			throw new Error("Answer not found");
		}

		if (answer.author.toString() !== userId) {
      throw new Error("You are not authorized to edit this answer");
    }

		await Question.findByIdAndUpdate(
			answer.question,
			{ $inc: { answers: -1 } },
			{ session, new: true }
		)

		await Vote.deleteMany({
			actionId: answerId,
			actionType: 'answer'
		});

		await Answer.findByIdAndDelete(answerId);

		await session.commitTransaction();
		revalidatePath(`/profile/${userId}`)

		return { success: true };
	} catch (error) {
		await session.abortTransaction();
		return handleError(error) as ErrorResponse;
	} finally {
		await session.endSession();
	}
}