import ROUTES from "@/constants/routes";
import Link from "next/link";
import Image from "next/image";
import TagCard from "@/components/cards/TagCard";

const hotQuestions = [
	{ _id: "1", title: "How to create a custom hook in React?" },
	{ _id: "2", title: "What is the difference between useState and useReducer?" },
	{ _id: "3", title: "How to optimize performance in React applications?" },
	{ _id: "4", title: "What are React hooks and how do they work?" },
	{ _id: "5", title: "How to handle forms in React?" },
];

const popularTags = [
	{ _id: "1", name: "React", questions: 100 },
	{ _id: "2", name: "TypeScript", questions: 80 },
	{ _id: "3", name: "Next.js", questions: 60 },
	{ _id: "4", name: "HTML", questions: 50 },
	{ _id: "5", name: "Node.js", questions: 40 },
]

const RightSidebar = () => {
	return (
		<section className="custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 h-screen w-[350px] flex flex-col gap-6 overflow-y-auto border-l p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden">
			<div>
				<h3 className="h3-bold text-dark200_light900">Top Questions</h3>

				<div className="mt-7 flex w-full flex-col gap-[30px]">
					{hotQuestions.map(({ _id, title }) => (
						<Link key={_id} href={ROUTES.PROFILE(_id)} className="flex cursor-pointer items-center justify-between gap-7">
							<p className="body-medium text-dark500_light700">{title}</p>
							<Image src="/icons/chevron-right.svg" alt="Chevron" width={20} height={20} className="invert-colors" />
						</Link>
					))}
				</div>
			</div>

			<div className="mt-16">
				<h3 className="h3-bold text-dark200_light900">Popular Tags</h3>

				<div className="mt-7 flex flex-col gap-4">
					{popularTags.map(({ _id, name, questions }) => (
						<TagCard
							key={_id}
							_id={_id}
							name={name}
							questions={questions}
							showCount
							compact
						/>
					))}
				</div>
			</div>
		</section>
	)
}

export default RightSidebar;