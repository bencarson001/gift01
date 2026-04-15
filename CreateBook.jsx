import React, { useState, useCallback, useEffect } from "react";
import { usePageTracking } from "@/hooks/usePageTracking";
import { trackFeature } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ArrowRight, Wand2, AlertCircle } from "lucide-react";
import { logError } from "@/lib/errorLogger";
import { Button } from "@/components/ui/button";
import OccasionCard from "../components/OccasionCard";
import UpcomingOccasionBanner from "../components/UpcomingOccasionBanner";
import WizardQuestion from "../components/WizardQuestion";
import BookOpeningLoader from "../components/BookOpeningLoader";
import GenerationProgress, { addStoredTime } from "../components/GenerationProgress";
import { getQuestionsForOccasion } from "../components/wizard/WizardQuestions";

const OCCASIONS = [
"birthday", "anniversary", "baby", "wedding", "roast", "kids_adventure",
"couples_love_story", "corporate_thank_you", "valentines", "retirement",
"graduation", "new_home", "get_well", "christmas", "mothers_day",
"fathers_day", "friendship", "pet_tribute", "travel_memoir", "teacher_appreciation"];


export default function CreateBook() {
  const navigate = useNavigate();
  const surpriseOccasion = new URLSearchParams(window.location.search).get("occasion");
  const [step, setStep] = useState(surpriseOccasion ? "questions" : "occasion");
  const [selectedOccasion, setSelectedOccasion] = useState(surpriseOccasion || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [generationError, setGenerationError] = useState(null);
  const [genStep, setGenStep] = useState("story");
  const [genStartTime, setGenStartTime] = useState(null);
  const [showLoginNudge, setShowLoginNudge] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  usePageTracking("CreateBook");
  const questions = selectedOccasion ? getQuestionsForOccasion(selectedOccasion) : [];

  const handleOccasionSelect = (occasion) => {
    setSelectedOccasion(occasion);
    trackFeature("occasion_selected", "CreateBook", { occasion });
  };

  const startQuestions = () => {
    if (!selectedOccasion) return;
    setStep("questions");
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (value) => {
    setAnswers((prev) => ({ ...prev, [questions[currentQuestionIndex].id]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const generateBook = useCallback(async () => {
    setStep("generating");
    setGenerationError(null);
    const startTime = Date.now();
    setGenStartTime(startTime);
    setGenStep("story");
    trackFeature("book_generation_started", "CreateBook", { occasion: selectedOccasion });

    try {
      const recipientName = answers.recipient_name || "Someone Special";
      const senderName = answers.sender_name || "A friend";
      const artStyle = answers.art_style || "watercolour";
      const writingStyle = answers.writing_style || "heartfelt";

      const styleGuide = {
        heartfelt: "warm, emotional and touching",
        humorous: "funny, witty and full of British humour with jokes and puns",
        adventurous: "exciting, dramatic with adventure and action",
        educational: "informative, inspiring and subtly educational",
        poetic: "lyrical, poetic with beautiful descriptive language"
      }[writingStyle] || "warm and heartfelt";

      const storyPrompt = `You are a brilliantly creative British author creating a personalised gift book. Write in British English.

Occasion: ${selectedOccasion.replace(/_/g, " ")}
Recipient: ${recipientName}
From: ${senderName}
Relationship: ${answers.relationship || "friend"}
Personality: ${answers.personality || "wonderful person"}
Memories: ${answers.memories || "many great times together"}
Writing style: ${styleGuide}
${answers.age ? `Age: ${answers.age}` : ""}
${answers.plot_points ? `Specific plot points to include: ${answers.plot_points}` : ""}
${answers.characters ? `Extra characters/people to include: ${answers.characters}` : ""}
${answers.birthday_vibe ? `Vibe: ${answers.birthday_vibe}` : ""}
${answers.embarrassing_moments ? `Embarrassing moments: ${answers.embarrassing_moments}` : ""}
${answers.bad_habits ? `Bad habits: ${answers.bad_habits}` : ""}
${answers.how_met ? `How they met: ${answers.how_met}` : ""}
${answers.special_moments ? `Special moments: ${answers.special_moments}` : ""}
${answers.favourite_things ? `Favourite things: ${answers.favourite_things}` : ""}
${answers.child_age ? `Child age: ${answers.child_age}` : ""}

Create a ${styleGuide} 20-page personalised book. Each page: 2-4 sentences. Include specific references to the details provided.

Return JSON:
- title: creative book title
- pages: array of 20 objects with page_number, text, image_prompt (${artStyle} illustration, max 80 words)`;

      const storyResult = await base44.integrations.Core.InvokeLLM({
        prompt: storyPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            pages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  page_number: { type: "number" },
                  text: { type: "string" },
                  image_prompt: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGenStep("images");

      const coverPrompt = `Beautiful ${artStyle} style book cover for a personalised gift book titled "${storyResult.title}". For ${recipientName}, ${selectedOccasion.replace(/_/g, " ")}. Elegant, warm colours. No text.`;

      const [coverImage, ...illustrations] = await Promise.all([
      base44.integrations.Core.GenerateImage({ prompt: coverPrompt }),
      ...[0, 4, 9, 14].map((i) => {
        const page = storyResult.pages[i];
        if (!page) return Promise.resolve(null);
        return base44.integrations.Core.GenerateImage({
          prompt: `${artStyle} illustration: ${page.image_prompt}. Warm, magical, premium quality.`
        });
      })]
      );

      setGenStep("saving");

      const pagesContent = storyResult.pages.map((page, i) => {
        const illustrationIndex = [0, 4, 9, 14].indexOf(i);
        return {
          page_number: page.page_number,
          text: page.text,
          image_url: illustrationIndex !== -1 && illustrations[illustrationIndex] ? illustrations[illustrationIndex].url : "",
          is_chapter_start: i % 5 === 0
        };
      });

      const shareId = Math.random().toString(36).substring(2, 10);

      const book = await base44.entities.Book.create({
        title: storyResult.title,
        occasion: selectedOccasion,
        recipient_name: recipientName,
        sender_name: senderName,
        art_style: artStyle,
        personalisation_answers: answers,
        pages_content: pagesContent,
        cover_image_url: coverImage.url,
        dedication: answers.dedication || "",
        status: "preview",
        share_id: shareId,
        total_pages: pagesContent.length
      });

      addStoredTime(Date.now() - startTime);
      navigate(createPageUrl("BookPreview") + `?id=${book.id}`);
    } catch (err) {
      await logError({
        type: "bug",
        severity: "high",
        title: "Book Generation Failed",
        message: err.message || String(err),
        context: { occasion: selectedOccasion, recipient_name: answers.recipient_name, error: err.message }
      });
      setGenerationError(err.message || "Something went wrong generating your book. Please try again.");
      setStep("questions");
    }
  }, [answers, selectedOccasion, navigate]);

  const currentQ = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentAnswer = currentQ ? answers[currentQ.id] : "";

  return (
    <div className="min-h-screen gradient-soft">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(createPageUrl("Home"))} className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="font-serif text-xl font-bold text-gray-900">
            GiftMyBook<span className="text-amber-500">UK</span>
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="mt-6 mr-5 mb-4 ml-3 px-4 py-3 max-w-4xl">
        <AnimatePresence mode="wait">
          {/* Step 1: Choose Occasion */}
          {step === "occasion" &&
          <motion.div
            key="occasion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            
              <div className="text-center mb-10">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  What's the Occasion? ✨
                </h2>
                <p className="text-gray-500 text-lg">Choose the perfect occasion for your personalised book</p>
                <UpcomingOccasionBanner variant="light" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {OCCASIONS.map((occ) =>
              <OccasionCard
                key={occ}
                occasion={occ}
                isSelected={selectedOccasion === occ}
                onClick={handleOccasionSelect} />

              )}
              </div>

              {selectedOccasion &&
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }} className="mt-2 pt-2 text-center">

              
                  <Button
                onClick={startQuestions} className="bg-gradient-to-r text-white px-10 py-3 text-lg font-medium rounded-2xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-14 from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg">
                
                
                    Continue <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
            }
            </motion.div>
          }

          {/* Generation error banner */}
          {step === "questions" && generationError &&
          <motion.div
            key="gen-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Generation failed — please try again</p>
                <p className="text-xs text-red-600 mt-0.5">{generationError}</p>
              </div>
            </motion.div>
          }

          {/* Login nudge for non-logged-in users at last question */}
          {step === "questions" && isLastQuestion && !user &&
          <motion.div
            key="login-nudge"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto mb-4 bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
            
              <span className="text-xl">💡</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-800">Save your book to your library</p>
                <p className="text-xs text-purple-600 mt-0.5">Register or log in to keep all your books in one place and access them anytime.</p>
                <button
                onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="mt-2 text-xs font-bold text-purple-700 underline hover:text-purple-900">
                
                  Register / Log in →
                </button>
              </div>
            </motion.div>
          }

          {/* Step 2: Questions */}
          {step === "questions" && currentQ &&
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto">
            
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
                <AnimatePresence mode="wait">
                  <WizardQuestion
                  key={currentQuestionIndex}
                  question={currentQ}
                  value={currentAnswer}
                  onChange={handleAnswer}
                  index={currentQuestionIndex}
                  total={questions.length} />
                
                </AnimatePresence>

                <div className="flex justify-between mt-8">
                  <Button
                  variant="ghost"
                  onClick={currentQuestionIndex === 0 ? () => setStep("occasion") : prevQuestion}
                  className="text-gray-500">
                  
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>

                  {isLastQuestion ?
                <Button
                  onClick={generateBook}
                  disabled={!answers.recipient_name}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold rounded-xl px-6">
                  
                      <Wand2 className="w-4 h-4 mr-2" /> Generate Magic ✨
                    </Button> :

                <Button
                  onClick={nextQuestion}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6">
                  
                      Next <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                }
                </div>
              </div>
            </motion.div>
          }

          {/* Step 3: Generating */}
          {step === "generating" &&
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}>
            
              <GenerationProgress
              currentStep={genStep}
              recipientName={answers.recipient_name}
              startTime={genStartTime || Date.now()} />
            
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}