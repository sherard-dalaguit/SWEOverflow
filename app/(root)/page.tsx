import {Button} from "@/components/ui/button";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import LocalSearch from "@/components/search/LocalSearch";
import HomeFilter from "@/components/filters/HomeFilter";
import QuestionCard from "@/components/cards/QuestionCard";

const questions = [
  {
    _id: 1,
    title: "How to implement a search feature in JavaScript?",
    description: "I am trying to implement a search feature in my Next.js application. Any suggestions on how to do this effectively?",
    tags: [
      { _id: "1", name: "React" },
      { _id: "2", name: "JavaScript" },
    ],
    author: { _id: "1", name: "John Doe", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTx0C3PxoGAznAfruqe_A2iUk1PyJbjqWK2cQ&s" },
    upvotes: 10,
    answers: 5,
    views: 100,
    createdAt: new Date("2021-09-01")
  },
  {
    _id: 2,
    title: "What is the best way to handle state management in React?",
    description: "I am looking for the best practices for state management in React applications. Should I use Redux, Context API, or something else?",
    tags: [
      { _id: "1", name: "React" },
      { _id: "2", name: "JavaScript" },
    ],
    author: { _id: "1", name: "John Doe", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTx0C3PxoGAznAfruqe_A2iUk1PyJbjqWK2cQ&s" },
    upvotes: 10,
    answers: 5,
    views: 100,
    createdAt: new Date("2021-09-01")
  },
  {
    _id: 3,
    title: "How to optimize performance in a JavaScript application?",
    description: "I want to improve the performance of my Next.js app. What are some tips and tricks to achieve this?",
    tags: [
      { _id: "1", name: "React" },
      { _id: "2", name: "JavaScript" },
    ],
    author: { _id: "1", name: "John Doe", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTx0C3PxoGAznAfruqe_A2iUk1PyJbjqWK2cQ&s" },
    upvotes: 10,
    answers: 5,
    views: 100,
    createdAt: new Date("2021-09-01")
  },
]

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const Home = async ({ searchParams }: SearchParams) => {
  const { query = "", filter = "" } = await searchParams;

  const filteredQuestions = questions.filter((question) => {
    const matchesQuery = question.title.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter ? question.title.toLowerCase().includes(filter.toLowerCase()) : true;
    return matchesQuery && matchesFilter;
  })

  return (
    <>
      <section className="w-full flex flex-col-reverse sm:flex-row justify-between gap-4 sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Button className="primary-gradient min-h-[46px] px-4 py-3 text-light-900" asChild>
          <Link href={ROUTES.ASK_QUESTION}>
            Ask a Question
          </Link>
        </Button>
      </section>

      <section className="mt-11">
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />
      </section>

      <HomeFilter />

      <div className="mt-10 flex w-full flex-col gap-6">
        {filteredQuestions.map((question) => (
          <QuestionCard key={question._id} question={question} />
        ))}
      </div>
    </>
  );
}

export default Home;
