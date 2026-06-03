"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./DoshaQuiz.module.css";

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    type: "oil" | "cleanser" | "facewash" | "soaps";
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "What is your primary hair or skin concern?",
    options: [
      { text: "Hair fall, weak roots, and dry frizzy strands", type: "oil" },
      { text: "Dandruff, itchy scalp, and product build-up", type: "cleanser" },
      { text: "Dull skin, tan, and clogged facial pores", type: "facewash" },
      { text: "Sensitive, dry, or toxin-heavy body skin", type: "soaps" },
    ],
  },
  {
    id: 2,
    text: "How would you describe your hair or skin type?",
    options: [
      { text: "Dry, rough, or damaged texture", type: "oil" },
      { text: "Normal, but prone to irritation or dandruff", type: "cleanser" },
      { text: "Oily, combination, or tan-prone", type: "facewash" },
      { text: "Allergenic skin needing chemical-free soaps", type: "soaps" },
    ],
  },
  {
    id: 3,
    text: "What is your primary daily self-care goal?",
    options: [
      { text: "Deep nourishment, volume, and long hair growth", type: "oil" },
      { text: "Scalp cleansing, dandruff relief, and root strength", type: "cleanser" },
      { text: "Bright, clean face and natural skin glow", type: "facewash" },
      { text: "Pure, organic, SLS-free handcrafted bathing bars", type: "soaps" },
    ],
  },
];

const recommendationMap = {
  oil: {
    id: "keshamrit-hair-oil",
    name: "Keshamrit Hair Oil",
    description: "Your answers suggest a need for deep hydration and follicular strength. Keshamrit, loaded with 17 active herbs, is the perfect match.",
    price: 300,
    image: "/images/products/keshamrit-hair-oil.jpg",
  },
  cleanser: {
    id: "keshpallav-hair-cleanser",
    name: "Keshpallav Hair Cleanser",
    description: "Your concerns point to scalp-hygiene and strength. This gentle Reetha and Shikakai formula cleanses without drying out hair.",
    price: 200,
    image: "/images/products/keshpallav-hair-cleanser.jpg",
  },
  facewash: {
    id: "ubtan-face-wash",
    name: "Ubtan Face Wash",
    description: "Reveal your skin's natural glow. The traditional blend of Ubtan, Turmeric, and Palash cleanses pores and reduces tanning.",
    price: 200,
    image: "/images/products/ubtan-face-wash.jpg",
  },
  soaps: {
    id: "palash-kesuda-soap",
    name: "Ayurvedic Soap Bars",
    description: "Pamper your body with our SLS/Paraben-free handcrafted Ayurvedic soap bars. Excellent for daily skin barrier hydration.",
    price: 75,
    image: "/images/products/palash-soap.jpg",
  },
};

export default function DoshaQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<keyof typeof recommendationMap | null>(null);

  const handleOptionSelect = (type: "oil" | "cleanser" | "facewash" | "soaps") => {
    const updatedAnswers = [...answers, type];
    setAnswers(updatedAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate most selected type
      const counts = updatedAnswers.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      let maxType: keyof typeof recommendationMap = "oil";
      let maxCount = 0;
      Object.entries(counts).forEach(([key, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxType = key as keyof typeof recommendationMap;
        }
      });

      setResult(maxType);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResult(null);
  };

  return (
    <div className={styles.quizCard}>
      <h2 className={styles.title}>🌿 Ayurvedic Consultation Quiz</h2>
      <p className={styles.subtitle}>Answer 3 simple questions to discover your personalized Ayurvedic routine.</p>

      {result === null ? (
        <div className={styles.quizContent}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
          <p className={styles.stepIndicator}>Question {currentStep + 1} of {questions.length}</p>
          <h3 className={styles.questionText}>{questions[currentStep].text}</h3>
          <div className={styles.optionsGrid}>
            {questions[currentStep].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleOptionSelect(opt.type)}
                className={styles.optionBtn}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.resultContainer}>
          <div className={styles.resultBadge}>Your Perfect Match</div>
          <div className={styles.resultBody}>
            <div className={styles.resultImageWrapper}>
              <Image
                src={recommendationMap[result].image}
                alt={recommendationMap[result].name}
                width={200}
                height={200}
                className={styles.resultImage}
              />
            </div>
            <div className={styles.resultInfo}>
              <h3 className={styles.resultName}>{recommendationMap[result].name}</h3>
              <p className={styles.resultDesc}>{recommendationMap[result].description}</p>
              <div className={styles.resultActionRow}>
                <span className={styles.resultPrice}>Starts at ₹{recommendationMap[result].price}</span>
                <div className={styles.resultBtns}>
                  <Link href={`/shop/${recommendationMap[result].id}`} className={styles.shopBtn}>
                    View Product
                  </Link>
                  <button onClick={handleReset} className={styles.resetBtn}>
                    Retake Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
