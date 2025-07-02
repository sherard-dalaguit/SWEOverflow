"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {DefaultValues, FieldValues, Path, SubmitHandler, useForm} from "react-hook-form"
import {z, ZodType} from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import Image from "next/image"
import {AnswerSchema} from "@/lib/validations";
import {useRef, useState, useTransition} from "react";
import dynamic from "next/dynamic";
import {MDXEditorMethods} from "@mdxeditor/editor";
import {ReloadIcon} from "@radix-ui/react-icons";
import {createAnswer} from "@/lib/actions/answer.action";
import {toast} from "sonner";
import {useSession} from "next-auth/react";
import {api} from "@/lib/api";

import Editor from "@/components/editor";

interface Props {
	questionId: string;
	questionTitle: string;
	questionContent: string;
}

const AnswerForm = ({ questionId, questionTitle, questionContent }: Props) => {
	const [isAnswering, startAnsweringTransition] = useTransition();
	const [isAISubmitting, setIsAISubmitting] = useState(false);
	const session = useSession();

	const editorRef = useRef<MDXEditorMethods>(null);

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: { content: "" },
  });

  const handleSubmit = async (values: z.infer<typeof AnswerSchema>) => {
    startAnsweringTransition(async() => {
			const result = await createAnswer({
				questionId,
				content: values.content,
			});

			if (result.success) {
				form.reset();

				toast.success("Success", { description: "Answer posted successfully!" } );

				if (editorRef.current) {
					editorRef.current.setMarkdown("");
				}
			} else {
				toast.error("Error", { description: result.error?.message || "Failed to post answer." });
			}
		})
  };

	const generateAIAnswer = async () => {
		if (session.status !== "authenticated") {
			toast.error("Error", { description: "You must be logged in to use this AI feature." });
			return;
		}

		setIsAISubmitting(true);

		try {
			const { success, data, error } = await api.ai.getAnswer(questionTitle, questionContent)

			if (!success) {
				toast.error("Error", { description: error?.message });
				return;
			}

			const formattedAnswer = data.replace(/<br>/g, " ").toString().trim();

      const raw = data.toString();
      let clean = raw
				// convert HTML line breaks → newlines
				.replace(/<br\s*\/?>/gi, "\n")
				// strip all HTML tags
				.replace(/<\/?[^>]+>/g, "")
				// collapse any code-fence language hints into plain ```
				.replace(/```[^\n]*\n/g, "```\n")
				// nuke any JSON-looking object at the very top
				.replace(/^\s*\{[\s\S]*?\}\s*/, "")
				.trim();

			if (editorRef.current) {
				console.log("📋 clean MDX→", clean);
				editorRef.current.setMarkdown(clean);
				form.setValue("content", clean);
				form.trigger("content");
			}

			toast.success("Success", { description: "AI answer generated successfully!" });
			setIsAISubmitting(false);
		} catch (error) {
			toast.error(
				"Error",
				{ description: error instanceof Error
						? error.message
						: "Failed to generate AI answer."
				}
			);
		}
	}

	return (
		<div>
			<div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
				<h4 className="paragraph-semibold text-dark400_light800">Write your answer here</h4>
				<Button
					className="btn light-border-2 gap-1.5 rounded-md border px-4 py-2.5 primary-gradient shadow-none"
					disabled={isAISubmitting}
					onClick={generateAIAnswer}
				>
					{isAISubmitting ? (
						<>
							<ReloadIcon className="mr-2 size-4 animate-spin" />
							Generate...
						</>
					) : (
						<>
							<Image
								src="/icons/stars.svg"
								alt="Generate AI Answer"
								width={12}
								height={12}
								className="object-contain"
							/>
							Generate AI Answer
						</>
					)}
				</Button>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="mt-6 flex w-full flex-col gap-10">
					<FormField
						control={form.control}
						name="content"
						render={({ field }) => (
							<FormItem className="flex w-full flex-col gap-3 mt-3.5">
								<FormControl>
									<Editor
										value={field.value}
										ref={editorRef}
										fieldChange={field.onChange}
									/>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex justify-end">
						<Button type="submit" className="primary-gradient w-fit">
							{isAnswering ? (
								<>
									<ReloadIcon className="mr-2 size-4 animate-spin" />
									Posting...
								</>
							) : (
								"Post Answer"
							)}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	)
};

export default AnswerForm;