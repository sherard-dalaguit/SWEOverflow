import { model, models, Schema, Types, Document } from "mongoose";

export interface IQuestion {
	title: string;
	content: string;
	tags: Types.ObjectId[];
	author: Types.ObjectId;
	views: number;
	answers: number;
	upvotes: number;
	downvotes: number;
}

export interface IQuestionDocument extends IQuestion, Document {}
const QuestionSchema = new Schema<IQuestion>(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
		author: { type: Schema.Types.ObjectId, ref: "User", required: true },
		views: { type: Number, default: 0 },
		answers: { type: Number, default: 0 },
		upvotes: { type: Number, default: 0 },
		downvotes: { type: Number, default: 0 },
	},
	{ timestamps: true }
);

const Question = models?.Question || model<IQuestion>("Question", QuestionSchema);

export default Question;