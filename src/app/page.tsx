import { getStudyProgress, updateCardProgress } from "@/app/actions";
import cards from "@/data/cards.json";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

interface Card {
  id: string;
  topic: string;
  front: string;
  correct_answer: string;
  wrong_answers: string[];
}

function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export default async function Home() {
  const studyProgress = await getStudyProgress();

  const dueCards = cards.filter((card) => {
    const progress = studyProgress[card.id];
    if (!progress) return true; // New card
    return new Date(progress.next_review) <= new Date();
  });

  const currentCard = dueCards[0];

  if (!currentCard) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="text-4xl font-bold text-center">
          You are all caught up for today!
        </div>
      </main>
    );
  }

  const allAnswers = shuffleArray([
    currentCard.correct_answer,
    ...currentCard.wrong_answers.slice(0, 3),
  ]);

  const handleAnswer = async (selectedAnswer: string) => {
    "use server";
    await updateCardProgress(currentCard.id, selectedAnswer === currentCard.correct_answer);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-100">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Calculus Flashcards
        </p>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <h1 className="text-6xl font-bold text-gray-800">
          <InlineMath math={currentCard.front} />
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left gap-4">
        {allAnswers.map((answer, index) => (
          <form action={handleAnswer.bind(null, answer)} key={index}>
            <button
              type="submit"
              className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 w-full"
            >
              <h2 className={`mb-3 text-2xl font-semibold`}>
                <InlineMath math={answer} />{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  -
                </span>
              </h2>
            </button>
          </form>
        ))}
      </div>
    </main>
  );
}
