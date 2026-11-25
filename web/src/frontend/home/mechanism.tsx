"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  FileCheck2,
  MessageSquarePlus,
  RotateCcw,
  SearchCode,
  Sparkles,
} from "lucide-react";

type StepId = "01" | "02" | "03" | "04";

interface StepConfig {
  id: StepId;
  num: string;
  shortLabel: string;
  title: string;
  desc: string;
  userState: "asking" | "away" | "returned";
  agentState: "listening" | "searching" | "reading" | "writing";
  internetActive: boolean;
}

const STEPS: StepConfig[] = [
  {
    id: "01",
    num: "01",
    shortLabel: "Send Question",
    title: "User Sends a Question to the Agent",
    desc: "A question flies right from the user into the AI agent, then moves into search.",
    userState: "asking",
    agentState: "listening",
    internetActive: false,
  },
  {
    id: "02",
    num: "02",
    shortLabel: "Search & Results",
    title: "Agent Searches the Internet & Gets Results",
    desc: "The user can step away while search requests fly out to the internet and matching results fly back to the agent.",
    userState: "away",
    agentState: "searching",
    internetActive: true,
  },
  {
    id: "03",
    num: "03",
    shortLabel: "Read & Check",
    title: "Agent Reads Results & Checks Follow-Ups",
    desc: "The agent reads into results, sends follow-up checks as needed, and pulls back extra details to fill in gaps.",
    userState: "away",
    agentState: "reading",
    internetActive: true,
  },
  {
    id: "04",
    num: "04",
    shortLabel: "Final Answer",
    title: "Agent Sends Back the Answer",
    desc: "The agent combines what it found into a clear answer and sends it right back to the user.",
    userState: "returned",
    agentState: "writing",
    internetActive: false,
  },
];

// Timing constants (ms)
const QUESTION_FLY_DURATION_S = 1.8;
const POST_QUESTION_PAUSE_MS = 500;
const STEP_01_DURATION_MS =
  QUESTION_FLY_DURATION_S * 1000 + POST_QUESTION_PAUSE_MS; // 2300ms

const SEARCH_ROUND_DURATION_S = 2.2;
const SEARCH_ROUNDS_PER_AUTO_STEP = 2;
const SEARCH_STEP_DURATION_MS =
  SEARCH_ROUND_DURATION_S * 1000 * SEARCH_ROUNDS_PER_AUTO_STEP; // 4400ms

const STEP_04_DURATION_MS = 2400;

const MechanismSection: React.FC = function () {
  const [activeStepId, setActiveStepId] = useState<StepId>("01");
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  const activeStep = STEPS.find((step) => step.id === activeStepId) ?? STEPS[0];

  useEffect(() => {
    if (!isPlaying) return;

    const t2 = setTimeout(() => {
      setActiveStepId("02");
    }, STEP_01_DURATION_MS);

    const t3 = setTimeout(() => {
      setActiveStepId("03");
    }, STEP_01_DURATION_MS + SEARCH_STEP_DURATION_MS);

    const t4 = setTimeout(
      () => {
        setActiveStepId("04");
      },
      STEP_01_DURATION_MS + SEARCH_STEP_DURATION_MS * 2,
    );

    const tDone = setTimeout(
      () => {
        setIsPlaying(false);
        setHasPlayedOnce(true);
      },
      STEP_01_DURATION_MS + SEARCH_STEP_DURATION_MS * 2 + STEP_04_DURATION_MS,
    );

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tDone);
    };
  }, [isPlaying, replayKey]);

  const handleSelectStep = (id: StepId) => {
    setIsPlaying(false);
    setHasPlayedOnce(true);
    setActiveStepId(id);
  };

  const handleReplayOnce = () => {
    setActiveStepId("01");
    setReplayKey((prev) => prev + 1);
    setIsPlaying(true);
  };

  const isSearchStep = activeStep.id === "02" || activeStep.id === "03";
  const searchRepeatCount = isPlaying
    ? SEARCH_ROUNDS_PER_AUTO_STEP - 1
    : Infinity;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      onViewportEnter={() => {
        if (!hasPlayedOnce && !isPlaying) {
          setIsPlaying(true);
        }
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            01 / The Research Process
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            How an AI Agent Answers a Question
          </h2>
          <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
            Watch the flow once on the diagram, then click any step to revisit
            its explanation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReplayOnce}
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:border-emerald-500/40 hover:bg-slate-900 hover:text-emerald-300 sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Replay Once
        </button>
      </div>

      {/* Step Selector Pills */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {STEPS.map((step) => {
          const isSelected = activeStep.id === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => handleSelectStep(step.id)}
              className={`group relative flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left transition ${
                isSelected
                  ? "border-emerald-500/50 bg-emerald-500/10 text-white shadow-lg shadow-emerald-950/30"
                  : "border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold transition ${
                  isSelected
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                }`}
              >
                {step.num}
              </span>
              <span className="truncate text-xs font-semibold sm:text-sm">
                {step.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Single Shared Diagram Stage */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-br from-slate-900 via-slate-950 to-emerald-950/30 p-6 sm:p-8 shadow-2xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative grid grid-cols-1 items-center gap-4 lg:grid-cols-12">
          {/* Left: User */}
          <div className="relative z-10 flex flex-col items-center rounded-2xl border border-slate-800/90 bg-slate-900/85 p-4 text-center lg:col-span-2">
            <motion.div
              animate={{
                opacity: activeStep.userState === "away" ? 0.35 : 1,
                scale: activeStep.userState === "away" ? 0.92 : 1,
                x: activeStep.userState === "away" ? -6 : 0,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Image
                src="/user.svg"
                alt="User"
                width={76}
                height={76}
                unoptimized
                className="h-18 w-18 rounded-full"
              />
            </motion.div>

            <p className="mt-2.5 text-sm font-semibold text-white">User</p>

            <AnimatePresence mode="wait">
              <motion.span
                key={activeStep.userState}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35 }}
                className={`mt-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  activeStep.userState === "away"
                    ? "border border-slate-700 bg-slate-800/80 text-slate-400"
                    : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                }`}
              >
                {activeStep.userState === "asking" && "Sends question"}
                {activeStep.userState === "away" && "Stepped away"}
                {activeStep.userState === "returned" && "Gets answer"}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Overlapping Lane 1: Question (User -> Agent) & Answer (Agent -> User) */}
          <div className="relative z-20 flex min-h-16 w-full items-center justify-center lg:col-span-3 lg:h-32 lg:-mx-6 lg:w-[calc(100%+3rem)]">
            {activeStep.id === "01" && (
              <motion.div
                key={`q-once-${replayKey}`}
                initial={{ x: -96, opacity: 0, scale: 0.92 }}
                animate={{
                  x: [-96, 0, 96],
                  opacity: [0, 1, 1, 0.9],
                  scale: [0.92, 1.06, 1],
                }}
                transition={{
                  duration: QUESTION_FLY_DURATION_S,
                  times: [0, 0.35, 1],
                  repeat: 0,
                  ease: "easeInOut",
                }}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-400/70 bg-slate-950 px-3.5 py-2 text-xs font-bold text-emerald-200 shadow-lg shadow-emerald-950/90"
              >
                <MessageSquarePlus className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Question?</span>
              </motion.div>
            )}

            {activeStep.id === "04" && (
              <motion.div
                key={`ans-fly-${activeStep.id}-${replayKey}`}
                initial={{ x: 96, opacity: 0, scale: 0.92 }}
                animate={{
                  x: [96, 0, -96],
                  opacity: [0, 1, 1, 0.9],
                  scale: [0.92, 1.06, 1],
                }}
                transition={{
                  duration: 1.8,
                  times: [0, 0.35, 1],
                  repeat: 0,
                  ease: "easeInOut",
                }}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-400/70 bg-slate-950 px-3.5 py-2 text-xs font-bold text-emerald-100 shadow-lg shadow-emerald-950/90"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-emerald-300" />
                <span>Answer</span>
              </motion.div>
            )}
          </div>

          {/* Center: AI Agent */}
          <div className="relative z-10 flex flex-col items-center justify-center rounded-2xl border border-emerald-500/35 bg-slate-900/90 p-5 text-center shadow-lg shadow-emerald-950/30 lg:col-span-2">
            <motion.div
              animate={{
                scale: isSearchStep ? [1, 1.04, 1] : 1,
              }}
              transition={{
                duration: SEARCH_ROUND_DURATION_S,
                repeat: isSearchStep ? searchRepeatCount : 0,
                ease: "easeInOut",
              }}
              className="relative flex items-center justify-center"
            >
              <Image
                src="/agent.svg"
                alt="AI Research Agent"
                width={88}
                height={88}
                unoptimized
                className="h-20 w-20"
              />
            </motion.div>

            <p className="mt-2 text-sm font-bold text-white">AI Agent</p>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.agentState}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.35 }}
                className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300"
              >
                <Sparkles className="h-3 w-3 shrink-0 text-emerald-400" />
                <span className="truncate">
                  {activeStep.agentState === "listening" && "Got question"}
                  {activeStep.agentState === "searching" && "Searching"}
                  {activeStep.agentState === "reading" && "Checking"}
                  {activeStep.agentState === "writing" && "Replying"}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Open Lane 2: Search Out -> Results Back */}
          <div className="relative z-20 flex min-h-20 w-full flex-col justify-center gap-2.5 lg:col-span-3 lg:h-32">
            {isSearchStep && (
              <>
                <motion.div
                  key={`req-out-${activeStep.id}-${replayKey}-${isPlaying}`}
                  initial={{ x: -56, opacity: 0 }}
                  animate={{
                    x: [-56, 56],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: SEARCH_ROUND_DURATION_S * 0.55,
                    times: [0, 0.15, 0.85, 1],
                    repeat: searchRepeatCount,
                    repeatDelay: SEARCH_ROUND_DURATION_S * 0.45,
                    ease: "easeInOut",
                  }}
                  className="inline-flex items-center gap-1.5 self-center whitespace-nowrap rounded-full border border-sky-400/60 bg-slate-950 px-3 py-1 text-xs font-semibold text-sky-200 shadow-md"
                >
                  <SearchCode className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                  <span>{activeStep.id === "03" ? "Follow-up" : "Search"}</span>
                </motion.div>

                <motion.div
                  key={`res-in-${activeStep.id}-${replayKey}-${isPlaying}`}
                  initial={{ x: 56, opacity: 0 }}
                  animate={{
                    x: [56, -56],
                    opacity: [0, 0, 1, 1, 0],
                  }}
                  transition={{
                    duration: SEARCH_ROUND_DURATION_S,
                    times: [0, 0.4, 0.52, 0.9, 1],
                    repeat: searchRepeatCount,
                    repeatDelay: 0,
                    ease: "easeInOut",
                  }}
                  className="inline-flex items-center gap-1.5 self-center whitespace-nowrap rounded-full border border-emerald-400/70 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100 shadow-md"
                >
                  <FileCheck2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                  <span>Results</span>
                </motion.div>
              </>
            )}
          </div>

          {/* Right: Always-Visible Internet Box */}
          <div
            className={`relative z-10 flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition lg:col-span-2 ${
              activeStep.internetActive
                ? "border-emerald-500/45 bg-slate-900/85 opacity-100"
                : "border-slate-800/80 bg-slate-900/50 opacity-55"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <SearchCode className="h-6 w-6" />
            </div>
            <p className="mt-2.5 text-sm font-bold text-white">Internet</p>
            <p className="mt-0.5 text-[11px] text-slate-400">Web &amp; pages</p>
          </div>
        </div>

        {/* Selected Step Explanation Bar */}
        <div className="relative mt-6 border-t border-slate-800/90 pt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:flex-row sm:items-center sm:p-5"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    STEP {activeStep.num}
                  </span>
                  <h3 className="text-sm font-semibold text-white sm:text-base">
                    {activeStep.title}
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                  {activeStep.desc}
                </p>
              </div>

              <span className="shrink-0 text-[11px] text-slate-500">
                Select a step above to inspect
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
};

export default MechanismSection;
