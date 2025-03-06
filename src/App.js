import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Check,
  X,
  Keyboard,
} from "lucide-react";

const StenoDrillApp = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [activeDrill, setActiveDrill] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(0);
  const [tempo, setTempo] = useState(60);
  const [currentStep, setCurrentStep] = useState(0);
  const [drillHistory, setDrillHistory] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [inputResult, setInputResult] = useState(null); // null, "correct", or "incorrect"
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [accuracy, setAccuracy] = useState({ correct: 0, incorrect: 0 });
  const [stepStats, setStepStats] = useState({});

  const intervalRef = useRef(null);
  const metronomeRef = useRef(null);
  const stepIntervalRef = useRef(null);
  const inputRef = useRef(null);

  // Steno drill categories and their drills
  const drills = {
    basic: [
      {
        id: "home-position",
        name: "Home Position Drill",
        description:
          "Practice each key individually, returning to home position between strokes.",
        steps: [
          { text: "S-S-S", keys: "S", finger: "Left pinky" },
          { text: "T-T-T", keys: "T", finger: "Left ring finger (top)" },
          { text: "K-K-K", keys: "K", finger: "Left ring finger (bottom)" },
          { text: "P-P-P", keys: "P", finger: "Left middle finger (top)" },
          { text: "W-W-W", keys: "W", finger: "Left middle finger (bottom)" },
          { text: "H-H-H", keys: "H", finger: "Left index finger (top)" },
          { text: "R-R-R", keys: "R", finger: "Left index finger (bottom)" },
          { text: "A-A-A", keys: "A", finger: "Left thumb" },
          { text: "O-O-O", keys: "O", finger: "Left thumb" },
          { text: "E-E-E", keys: "E", finger: "Right thumb" },
          { text: "U-U-U", keys: "U", finger: "Right thumb" },
          { text: "F-F-F", keys: "F", finger: "Right index finger (top)" },
          { text: "R-R-R", keys: "R", finger: "Right index finger (bottom)" },
          { text: "P-P-P", keys: "P", finger: "Right middle finger (top)" },
          { text: "B-B-B", keys: "B", finger: "Right middle finger (bottom)" },
          { text: "L-L-L", keys: "L", finger: "Right ring finger (top)" },
          { text: "G-G-G", keys: "G", finger: "Right ring finger (bottom)" },
          { text: "T-T-T", keys: "T", finger: "Right pinky (top)" },
          { text: "S-S-S", keys: "S", finger: "Right pinky (bottom)" },
          { text: "D-D-D", keys: "D", finger: "Right pinky (top reach)" },
          { text: "Z-Z-Z", keys: "Z", finger: "Right pinky (bottom reach)" },
        ],
      },
      {
        id: "letter-sequence",
        name: "Letter Sequence Drill",
        description:
          "Practice stroking consonants and vowels in sequence to build fundamental skills.",
        steps: [
          {
            text: "Initial Consonants: S, T, K, P, W, H, R",
            keys: "STKPWHR",
            finger: "Left hand",
          },
          {
            text: "Final Consonants: F, R, P, B, L, G, T, S, D, Z",
            keys: "FRPBLGTSDZ",
            finger: "Right hand",
          },
          { text: "Vowels: A, O, E, U", keys: "AOEU", finger: "Both thumbs" },
        ],
      },
      {
        id: "vowel-combinations",
        name: "Vowel Combination Drills",
        description:
          "Practice all possible vowel combinations to improve thumb coordination.",
        steps: [
          { text: "A", keys: "A", finger: "Left thumb" },
          { text: "O", keys: "O", finger: "Left thumb" },
          { text: "E", keys: "E", finger: "Right thumb" },
          { text: "U", keys: "U", finger: "Right thumb" },
          { text: "AO", keys: "AO", finger: "Left thumb" },
          { text: "AE", keys: "AE", finger: "Both thumbs" },
          { text: "AU", keys: "AU", finger: "Both thumbs" },
          { text: "OE", keys: "OE", finger: "Both thumbs" },
          { text: "OU", keys: "OU", finger: "Both thumbs" },
          { text: "EU", keys: "EU", finger: "Right thumb" },
          { text: "AOE", keys: "AOE", finger: "Both thumbs" },
          { text: "AOU", keys: "AOU", finger: "Both thumbs" },
          { text: "AEU", keys: "AEU", finger: "Both thumbs" },
          { text: "OEU", keys: "OEU", finger: "Both thumbs" },
          { text: "AOEU", keys: "AOEU", finger: "Both thumbs" },
        ],
      },
    ],
    intermediate: [
      {
        id: "consonant-combinations",
        name: "Consonant Combination Drill",
        description:
          "Practice common chord combinations to build speed with multi-key strokes.",
        steps: [
          { text: "ST-", keys: "ST", finger: "Left pinky and ring" },
          { text: "STK-", keys: "STK", finger: "Left ring finger" },
          { text: "STW-", keys: "STW", finger: "Left ring and middle" },
          { text: "STKP-", keys: "STKP", finger: "Left pinky, ring, middle" },
          { text: "SKWR-", keys: "SKWR", finger: "Left hand complex" },
          { text: "-FP", keys: "FP", finger: "Right index and middle" },
          { text: "-RPB", keys: "RPB", finger: "Right index and middle" },
          { text: "-RPBL", keys: "RPBL", finger: "Right index, middle, ring" },
          { text: "-RPBLG", keys: "RPBLG", finger: "Right hand complex" },
          { text: "-BGS", keys: "BGS", finger: "Right middle, ring, pinky" },
        ],
      },
      {
        id: "finger-independence",
        name: "Finger Independence Drill",
        description:
          "Alternate between different fingers to improve individual finger control.",
        steps: [
          { text: "S-T-S-T-S-T", keys: "ST", finger: "Left pinky and ring" },
          { text: "K-P-K-P-K-P", keys: "KP", finger: "Left ring and middle" },
          { text: "H-R-H-R-H-R", keys: "HR", finger: "Left index finger" },
          { text: "F-P-F-P-F-P", keys: "FP", finger: "Right index and middle" },
          { text: "L-G-L-G-L-G", keys: "LG", finger: "Right ring finger" },
          { text: "T-S-T-S-T-S", keys: "TS", finger: "Right pinky" },
          { text: "A-O-A-O-A-O", keys: "AO", finger: "Left thumb" },
          { text: "E-U-E-U-E-U", keys: "EU", finger: "Right thumb" },
        ],
      },
      {
        id: "opposite-hand",
        name: "Opposite Hand Drill",
        description:
          "Stroke patterns with one hand while keeping the other still to improve coordination.",
        steps: [
          {
            text: "Left hand pattern: STKPWHR",
            keys: "STKPWHR",
            finger: "Left hand only",
          },
          {
            text: "Right hand pattern: FRPBLGTSDZ",
            keys: "FRPBLGTSDZ",
            finger: "Right hand only",
          },
          {
            text: "Alternate: STKPWHR (pause) FRPBLGTSDZ",
            keys: "STKPWHR-FRPBLGTSDZ",
            finger: "Alternate hands",
          },
        ],
      },
    ],
    advanced: [
      {
        id: "fingertipping",
        name: "Fingertipping Drill",
        description:
          "Practice proper curved finger position with precise fingertip strokes.",
        steps: [
          { text: "S → T → K → P → W", keys: "STKPW", finger: "Left hand" },
          {
            text: "F → R → P → B → L → G",
            keys: "FRPBLG",
            finger: "Right hand",
          },
          { text: "T → S → D → Z", keys: "TSDZ", finger: "Right pinky" },
          { text: "S+T+K+P+W", keys: "STKPW", finger: "Left hand chord" },
          { text: "F+R+P+B+L+G", keys: "FRPBLG", finger: "Right hand chord" },
        ],
      },
      {
        id: "rhythm-drill",
        name: "Rhythm Drill",
        description:
          "Practice with a metronome to develop consistent timing and rhythm.",
        steps: [
          {
            text: "STKPW-FRPBLG (with metronome)",
            keys: "STKPW-FRPBLG",
            finger: "Full keyboard",
          },
          {
            text: "AO-EU (with metronome)",
            keys: "AO-EU",
            finger: "Thumbs only",
          },
          {
            text: "ST-PB (with metronome)",
            keys: "ST-PB",
            finger: "Pinky/ring to middle/index",
          },
        ],
      },
      {
        id: "transition-drill",
        name: "Transition Drill",
        description:
          "Practice quick movements between different combinations across the keyboard.",
        steps: [
          {
            text: "STKP → PWHR → FRBL → GTSD",
            keys: "STKP-PWHR-FRBL-GTSD",
            finger: "Full hand transitions",
          },
          {
            text: "Short A → Long A → Short E → Long E",
            keys: "A-AEU-E-AOE",
            finger: "Vowel transitions",
          },
          {
            text: "T-K → P-W → F-R → P-B → L-G",
            keys: "TK-PW-FR-PB-LG",
            finger: "Two-finger transitions",
          },
        ],
      },
    ],
  };

  // Steno keyboard layout for visual reference
  const stenoKeyboardLayout = [
    { key: "S", position: "left", finger: "pinky" },
    { key: "T", position: "left", finger: "ring" },
    { key: "K", position: "left", finger: "ring" },
    { key: "P", position: "left", finger: "middle" },
    { key: "W", position: "left", finger: "middle" },
    { key: "H", position: "left", finger: "index" },
    { key: "R", position: "left", finger: "index" },
    { key: "A", position: "left", finger: "thumb" },
    { key: "O", position: "left", finger: "thumb" },
    { key: "E", position: "right", finger: "thumb" },
    { key: "U", position: "right", finger: "thumb" },
    { key: "F", position: "right", finger: "index" },
    { key: "R", position: "right", finger: "index" },
    { key: "P", position: "right", finger: "middle" },
    { key: "B", position: "right", finger: "middle" },
    { key: "L", position: "right", finger: "ring" },
    { key: "G", position: "right", finger: "ring" },
    { key: "T", position: "right", finger: "pinky" },
    { key: "S", position: "right", finger: "pinky" },
    { key: "D", position: "right", finger: "pinky" },
    { key: "Z", position: "right", finger: "pinky" },
  ];

  useEffect(() => {
    // Create metronome sound
    metronomeRef.current = new Audio(
      "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU5vT18AAAAA"
    );
    metronomeRef.current.volume = 0.5;

    // Load drill history from localStorage
    const savedHistory = localStorage.getItem("stenoDrillHistory");
    if (savedHistory) {
      setDrillHistory(JSON.parse(savedHistory));
    }

    // Load accuracy stats from localStorage
    const savedAccuracy = localStorage.getItem("stenoAccuracy");
    if (savedAccuracy) {
      setAccuracy(JSON.parse(savedAccuracy));
    }

    // Load step stats from localStorage
    const savedStepStats = localStorage.getItem("stenoStepStats");
    if (savedStepStats) {
      setStepStats(JSON.parse(savedStepStats));
    }

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(stepIntervalRef.current);
    };
  }, []);

  // Save drill history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("stenoDrillHistory", JSON.stringify(drillHistory));
  }, [drillHistory]);

  // Save accuracy stats to localStorage when they change
  useEffect(() => {
    localStorage.setItem("stenoAccuracy", JSON.stringify(accuracy));
  }, [accuracy]);

  // Save step stats to localStorage when they change
  useEffect(() => {
    localStorage.setItem("stenoStepStats", JSON.stringify(stepStats));
  }, [stepStats]);

  // Timer management
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Step management with metronome
  useEffect(() => {
    if (isRunning && activeDrill && autoAdvance) {
      const stepsLength = drills[activeTab].find((d) => d.id === activeDrill)
        .steps.length;
      const intervalTime = (60 / tempo) * 1000;

      stepIntervalRef.current = setInterval(() => {
        metronomeRef.current.play();
        setCurrentStep((prevStep) => (prevStep + 1) % stepsLength);
        // Reset the input field and result when advancing to next step
        setUserInput("");
        setInputResult(null);
        // Focus the input field
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, intervalTime);
    } else {
      clearInterval(stepIntervalRef.current);
    }
    return () => clearInterval(stepIntervalRef.current);
  }, [isRunning, activeDrill, activeTab, tempo, autoAdvance]);

  // Focus the input field when drill starts
  useEffect(() => {
    if (isRunning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRunning, currentStep]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const startDrill = (drillId) => {
    setActiveDrill(drillId);
    setIsRunning(true);
    setTimer(0);
    setCurrentStep(0);
    setUserInput("");
    setInputResult(null);
    // Reset step-specific stats for this drill
    const currentDrillSteps = drills[activeTab].find(
      (d) => d.id === drillId
    ).steps;
    const newStepStats = { ...stepStats };

    if (!newStepStats[drillId]) {
      newStepStats[drillId] = {};
      currentDrillSteps.forEach((step, index) => {
        newStepStats[drillId][index] = {
          attempts: 0,
          correct: 0,
          avgTime: 0
        };
      });
      setStepStats(newStepStats);
    }
  };

  const stopDrill = () => {
    if (activeDrill && timer > 0) {
      const drillName = drills[activeTab].find(
        (d) => d.id === activeDrill
      ).name;

      // Calculate accuracy for this session
      const totalAttempts = accuracy.correct + accuracy.incorrect;
      const accuracyPercentage = totalAttempts > 0
        ? Math.round((accuracy.correct / totalAttempts) * 100)
        : 0;

      setDrillHistory([
        ...drillHistory,
        {
          id: Date.now(),
          drill: drillName,
          category: activeTab,
          time: timer,
          date: new Date().toISOString(),
          correct: accuracy.correct,
          incorrect: accuracy.incorrect,
          accuracy: accuracyPercentage
        },
      ]);

      // Reset session accuracy
      setAccuracy({ correct: 0, incorrect: 0 });
    }
    setIsRunning(false);
    setTimer(0);
    setCurrentStep(0);
    setUserInput("");
    setInputResult(null);
    setActiveDrill(null);
  };

  const pauseDrill = () => {
    setIsRunning(false);
  };

  const resumeDrill = () => {
    setIsRunning(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const resetDrill = () => {
    stopDrill();
    setActiveDrill(null);
  };

  const getCurrentDrillSteps = () => {
    if (!activeDrill) return [];
    const currentDrill = drills[activeTab].find((d) => d.id === activeDrill);
    return currentDrill ? currentDrill.steps : [];
  };

  const getCurrentStep = () => {
    const steps = getCurrentDrillSteps();
    return steps[currentStep] || null;
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value.toUpperCase());
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();

    const currentStepObj = getCurrentStep();
    if (!currentStepObj) return;

    // Clean up input and expected keys for comparison
    const cleanExpectedKeys = currentStepObj.keys.replace(/[^A-Z]/g, "");
    const cleanUserInput = userInput.replace(/[^A-Z]/g, "");

    // Check if input matches expected keys
    const isCorrect = cleanUserInput === cleanExpectedKeys;
    setInputResult(isCorrect ? "correct" : "incorrect");

    // Update accuracy stats
    setAccuracy(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));

    // Update step-specific stats
    if (stepStats[activeDrill]) {
      const stepStat = stepStats[activeDrill][currentStep] || {
        attempts: 0,
        correct: 0,
        avgTime: 0
      };

      const newStepStats = { ...stepStats };
      newStepStats[activeDrill][currentStep] = {
        attempts: stepStat.attempts + 1,
        correct: stepStat.correct + (isCorrect ? 1 : 0),
        avgTime: stepStat.avgTime // We would need to track time per step to calculate this properly
      };

      setStepStats(newStepStats);
    }

    // If correct and not in auto-advance mode, manually move to next step
    if (isCorrect && !autoAdvance) {
      setTimeout(() => {
        const stepsLength = getCurrentDrillSteps().length;
        setCurrentStep((prevStep) => (prevStep + 1) % stepsLength);
        setUserInput("");
        setInputResult(null);
      }, 500);
    }
  };

  const getAccuracyPercentage = () => {
    const totalAttempts = accuracy.correct + accuracy.incorrect;
    return totalAttempts > 0
      ? Math.round((accuracy.correct / totalAttempts) * 100)
      : 0;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-slate-800 text-white p-4">
        <h1 className="text-2xl font-bold">Steno Finger Drill Practice</h1>
        <p className="text-sm text-slate-300">
          Build your stenography skills with targeted exercises
        </p>
      </header>

      <main className="flex-grow p-4">
        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 mb-4">
          {["basic", "intermediate", "advanced"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 font-medium ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-slate-600"
              }`}
              onClick={() => {
                if (isRunning) {
                  stopDrill();
                }
                setActiveTab(tab);
                setActiveDrill(null);
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeDrill ? (
          // Drill practice screen
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {drills[activeTab].find((d) => d.id === activeDrill)?.name}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1">
                  <Clock size={18} className="text-slate-500 mr-2" />
                  <span className="font-mono text-lg">{formatTime(timer)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowKeyboard(!showKeyboard)}
                    className="p-2 rounded-full hover:bg-slate-100"
                    title="Toggle keyboard"
                  >
                    <Keyboard size={20} className="text-slate-600" />
                  </button>
                  <button
                    onClick={resetDrill}
                    className="p-2 rounded-full hover:bg-slate-100"
                    title="Reset drill"
                  >
                    <RotateCcw size={20} className="text-slate-600" />
                  </button>
                  {isRunning ? (
                    <button
                      onClick={pauseDrill}
                      className="bg-amber-100 p-2 rounded-full hover:bg-amber-200"
                      title="Pause"
                    >
                      <Pause size={24} className="text-amber-600" />
                    </button>
                  ) : (
                    <button
                      onClick={resumeDrill}
                      className="bg-green-100 p-2 rounded-full hover:bg-green-200"
                      title="Start"
                    >
                      <Play size={24} className="text-green-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="tempo" className="font-medium text-slate-700">
                  Tempo: {tempo} BPM
                </label>
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    <input
                      type="checkbox"
                      id="autoAdvance"
                      checked={autoAdvance}
                      onChange={(e) => setAutoAdvance(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="autoAdvance" className="text-sm text-slate-600">
                      Auto-advance
                    </label>
                  </div>
                  <button
                    onClick={() => setTempo(Math.max(30, tempo - 5))}
                    className="p-1 rounded hover:bg-slate-100"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => setTempo(Math.min(200, tempo + 5))}
                    className="p-1 rounded hover:bg-slate-100"
                  >
                    <ChevronUp size={16} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                id="tempo"
                min="30"
                max="200"
                step="5"
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="bg-slate-100 rounded-lg p-8 mb-6 text-center">
              <div className="text-4xl font-bold text-slate-800 mb-2">
                {getCurrentStep()?.text || ""}
              </div>
              <div className="text-lg text-slate-600 mb-4">
                {getCurrentStep()?.finger || ""}
              </div>

              {/* Input verification section */}
              <form onSubmit={handleInputSubmit} className="max-w-md mx-auto">
                <div className="flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    className={`flex-grow px-4 py-2 border ${
                      inputResult === null
                        ? "border-slate-300"
                        : inputResult === "correct"
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Type your steno chord here..."
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <button
                    type="submit"
                    className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-lg"
                  >
                    {inputResult === "correct" ? (
                      <Check size={20} />
                    ) : inputResult === "incorrect" ? (
                      <X size={20} />
                    ) : (
                      "Check"
                    )}
                  </button>
                </div>
                <div className="mt-2 text-sm">
                  {inputResult === "correct" && (
                    <span className="text-green-600">Correct! Well done.</span>
                  )}
                  {inputResult === "incorrect" && (
                    <span className="text-red-600">
                      Try again. Expected: {getCurrentStep()?.keys}
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Keyboard visualization (toggled) */}
            {showKeyboard && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-medium mb-2 text-slate-700">Steno Keyboard Layout</h3>
                <div className="flex justify-center">
                  <div className="relative w-full max-w-lg h-32 bg-white rounded border border-slate-200">
                    {/* Left bank */}
                    <div className="absolute left-4 top-2 flex flex-col">
                      {stenoKeyboardLayout
                        .filter(k => k.position === "left" && k.finger !== "thumb")
                        .map((key, i) => {
                          const isHighlighted = getCurrentStep()?.keys.includes(key.key);
                          return (
                            <div
                              key={`left-${i}`}
                              className={`w-8 h-8 m-1 rounded-full flex items-center justify-center ${
                                isHighlighted
                                  ? "bg-blue-500 text-white"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {key.key}
                            </div>
                          );
                        })}
                    </div>

                    {/* Vowel keys (thumbs) */}
                    <div className="absolute left-1/2 bottom-2 transform -translate-x-1/2 flex">
                      {stenoKeyboardLayout
                        .filter(k => k.finger === "thumb")
                        .map((key, i) => {
                          const isHighlighted = getCurrentStep()?.keys.includes(key.key);
                          return (
                            <div
                              key={`thumb-${i}`}
                              className={`w-8 h-8 m-1 rounded-full flex items-center justify-center ${
                                isHighlighted
                                  ? "bg-blue-500 text-white"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {key.key}
                            </div>
                          );
                        })}
                    </div>

                    {/* Right bank */}
                    <div className="absolute right-4 top-2 flex flex-col">
                      {stenoKeyboardLayout
                        .filter(k => k.position === "right" && k.finger !== "thumb")
                        .map((key, i) => {
                          const isHighlighted = getCurrentStep()?.keys.includes(key.key);
                          return (
                            <div
                              key={`right-${i}`}
                              className={`w-8 h-8 m-1 rounded-full flex items-center justify-center ${
                                isHighlighted
                                  ? "bg-blue-500 text-white"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {key.key}
                            </div>
                          );
                        })}
                    </div>