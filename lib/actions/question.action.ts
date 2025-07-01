"use server";

import {AskQuestionSchema, EditQuestionSchema, GetQuestionSchema, PaginatedSearchParamsSchema} from "@/lib/validations";
import action from "@/lib/handlers/action";
import {ActionResponse, ErrorResponse, PaginatedSearchParams} from "@/types/global";
import handleError from "@/lib/handlers/error";
import mongoose, {FilterQuery} from "mongoose";
import Question, {IQuestionDoc} from "@/database/question.model";
import Tag, {ITagDoc} from "@/database/tag.model";
import TagQuestion, {ITagQuestion} from "@/database/tag-question.model";

export async function createQuestion(params: CreateQuestionParams): Promise<ActionResponse<typeof Question>> {
	const validationResult = await action({
		params,
		schema: AskQuestionSchema,
		authorize: true
	});

	if (validationResult instanceof Error) {
		return handleError(validationResult) as ErrorResponse;
	}

	const { title, content, tags } = validationResult.params!;
	const userId = validationResult.session?.user?.id;

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const [question] = await Question.create([{ title, content, author: userId }], { session });

		if (!question) throw new Error("Failed to create question");

		const tagIds: mongoose.Types.ObjectId[] = [];
		const tagQuestionDocuments = [];

		for (const tag of tags) {
			const existingTag = await Tag.findOneAndUpdate(
				{ name: { $regex: new RegExp(`^${tag}$`, 'i') } },
				{ $setOnInsert: { name: tag }, $inc: { questions: 1 } },
				{ upsert: true, new: true, session }
			);

			tagIds.push(existingTag._id);
			tagQuestionDocuments.push({
				tag: existingTag._id,
				question: question._id
			})
		}

		await TagQuestion.insertMany(tagQuestionDocuments, { session });

		await Question.findByIdAndUpdate(
			question._id,
			{ $push: { tags: { $each: tagIds } } },
			{ session }
		);

		await session.commitTransaction();

		return { success: true, data: JSON.parse(JSON.stringify(question)) };
	} catch (error) {
		await session.abortTransaction();
		return handleError(error) as ErrorResponse;
	} finally {
		await session.endSession();
	}
}

export async function editQuestion(params: EditQuestionParams): Promise<ActionResponse<IQuestionDoc>> {
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags, questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId).populate("tags");
    if (!question) throw new Error("Question not found");

    if (question.author.toString() !== userId) {
      throw new Error("You are not authorized to edit this question");
    }

    if (question.title !== title || question.content !== content) {
      question.title = title;
      question.content = content;
      await question.save({ session });
    }

    // Determine tags to add and remove
    const tagsToAdd = tags.filter(
      (tag) =>
        !question.tags.some(
          (t: ITagDoc) => t.name.toLowerCase() === tag.toLowerCase()
        )
    );

    const tagsToRemove = question.tags.filter(
      (tag: ITagDoc) =>
        !tags.some((t) => t.toLowerCase() === tag.name.toLowerCase())
    );

    // Add new tags
    const newTagDocuments = [];
    if (tagsToAdd.length > 0) {
      for (const tag of tagsToAdd) {
        const newTag = await Tag.findOneAndUpdate(
          { name: { $regex: `^${tag}$`, $options: "i" } },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { upsert: true, new: true, session }
        );

        if (newTag) {
          newTagDocuments.push({ tag: newTag._id, question: questionId });
          question.tags.push(newTag._id);
        }
      }
    }

    // Remove tags
    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((tag: ITagDoc) => tag._id);

      await Tag.updateMany(
        { _id: { $in: tagIdsToRemove } },
        { $inc: { questions: -1 } },
        { session }
      );

      await TagQuestion.deleteMany(
        { tag: { $in: tagIdsToRemove }, question: questionId },
        { session }
      );

      question.tags = question.tags.filter(
        (tag: mongoose.Types.ObjectId) =>
          !tagIdsToRemove.some((id: mongoose.Types.ObjectId) =>
            id.equals(tag._id)
          )
      );
    }

    // Insert new TagQuestion documents
    if (newTagDocuments.length > 0) {
      await TagQuestion.insertMany(newTagDocuments, { session });
    }

    // Save the updated question
    await question.save({ session });
    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getQuestion(params: GetQuestionParams): Promise<ActionResponse<typeof Question>> {
	const validationResult = await action({
		params,
		schema: GetQuestionSchema,
		authorize: true
	});

	if (validationResult instanceof Error) {
		return handleError(validationResult) as ErrorResponse;
	}

	const { questionId } = validationResult.params!;

	try {
		const question = await Question.findById(questionId).populate("tags");

		if (!question) {
			throw new Error("Question not found");
		}

		return { success: true, data: JSON.parse(JSON.stringify(question)) };
	} catch (error) {
		return handleError(error) as ErrorResponse;
	}
}

// Server Actions are designed to be used in different contexts:

// 1. In Server Components: They act like regular async functions
// 2. In Client Components: When used in form actions or event handlers, they are invoked via a POST request

export async function getQuestions(params: PaginatedSearchParams): Promise<ActionResponse<{ questions: typeof Question[], isNext: boolean }>> {
	const validationResult = await action({
		params,
		schema: PaginatedSearchParamsSchema,
	});

	if (validationResult instanceof Error) {
		return handleError(validationResult) as ErrorResponse;
	}

	const { page = 1, pageSize = 10, query, filter } = params;
	const skip = (Number(page) - 1) * pageSize;
	const limit = Number(pageSize);

	const filterQuery: FilterQuery<typeof Question> = {};

	if (filter === 'recommended') return { success: true, data: { questions: [], isNext: false } };

	if (query) {
		filterQuery.$or = [
			{ title: { $regex: new RegExp(query, 'i') } },
			{ content: { $regex: new RegExp(query, 'i') } }
		]
	}

	let sortCriteria = {};

	switch (filter) {
		case 'newest':
			sortCriteria = { createdAt: -1 };
			break;
		case 'unanswered':
			filterQuery.answers = 0;
			sortCriteria = { createdAt: -1 };
			break;
		case 'popular':
			sortCriteria = { upvotes: -1 };
			break;
		default:
			sortCriteria = { createdAt: -1 };
			break;
	}

	try {
		const totalQuestions = await Question.countDocuments(filterQuery);

		const questions = await Question.find(filterQuery)
			.populate("tags", "name")
			.populate("author", "name image")
			.lean()
			.sort(sortCriteria)
			.skip(skip)
			.limit(limit);

		const isNext = totalQuestions > skip + questions.length;

		return {
			success: true,
			data: { questions: JSON.parse(JSON.stringify(questions)), isNext }
		}
	} catch (error) {
		return handleError(error) as ErrorResponse;
	}
}