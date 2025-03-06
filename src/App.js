import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  BarChart2,
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

  const intervalRef = useRef(null);
  const metronomeRef = useRef(null);
  const stepIntervalRef = useRef(null);

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

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(stepIntervalRef.current);
    };
  }, []);

  // Save drill history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("stenoDrillHistory", JSON.stringify(drillHistory));
  }, [drillHistory]);

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
    if (isRunning && activeDrill) {
      const stepsLength = drills[activeTab].find((d) => d.id === activeDrill)
        .steps.length;
      const intervalTime = (60 / tempo) * 1000;

      stepIntervalRef.current = setInterval(() => {
        metronomeRef.current.play();
        setCurrentStep((prevStep) => (prevStep + 1) % stepsLength);
      }, intervalTime);
    } else {
      clearInterval(stepIntervalRef.current);
    }
    return () => clearInterval(stepIntervalRef.current);
  }, [isRunning, activeDrill, activeTab, tempo]);

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
  };

  const stopDrill = () => {
    if (activeDrill && timer > 0) {
      const drillName = drills[activeTab].find(
        (d) => d.id === activeDrill
      ).name;
      setDrillHistory([
        ...drillHistory,
        {
          id: Date.now(),
          drill: drillName,
          category: activeTab,
          time: timer,
          date: new Date().toISOString(),
        },
      ]);
    }
    setIsRunning(false);
    setTimer(0);
    setCurrentStep(0);
  };

  const pauseDrill = () => {
    setIsRunning(false);
  };

  const resumeDrill = () => {
    setIsRunning(true);
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
              <div className="text-lg text-slate-600">
                {getCurrentStep()?.finger || ""}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-medium mb-2 text-slate-700">
                  Current Step
                </h3>
                <div className="flex items-center">
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                    {getCurrentStep()?.keys || ""}
                  </div>
                  <span className="mx-2 text-slate-400">•</span>
                  <span className="text-slate-600">
                    {currentStep + 1} of {getCurrentDrillSteps().length}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-medium mb-2 text-slate-700">
                  Instructions
                </h3>
                <p className="text-slate-600 text-sm">
                  {
                    drills[activeTab].find((d) => d.id === activeDrill)
                      ?.description
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Drill selection screen
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {drills[activeTab].map((drill) => (
              <div
                key={drill.id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{drill.name}</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    {drill.description}
                  </p>
                  <div className="text-xs text-slate-500 mb-4">
                    {drill.steps.length} steps
                  </div>
                  <button
                    onClick={() => startDrill(drill.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center"
                  >
                    <Play size={16} className="mr-2" />
                    Start Practice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Practice History/Stats */}
      <div className="border-t border-slate-200 bg-white">
        <button
          onClick={() => setShowStats(!showStats)}
          className="w-full flex items-center justify-center py-2 text-slate-600 hover:bg-slate-50"
        >
          <BarChart2 size={16} className="mr-2" />
          {showStats ? "Hide Practice History" : "Show Practice History"}
          {showStats ? (
            <ChevronDown size={16} className="ml-2" />
          ) : (
            <ChevronUp size={16} className="ml-2" />
          )}
        </button>

        {showStats && (
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Practice History</h2>
            {drillHistory.length === 0 ? (
              <p className="text-slate-500 text-center py-4">
                No practice sessions recorded yet.
              </p>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">
                        Drill
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">
                        Category
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...drillHistory]
                      .reverse()
                      .slice(0, 10)
                      .map((session) => (
                        <tr
                          key={session.id}
                          className="border-b border-slate-100"
                        >
                          <td className="px-4 py-2 text-sm text-slate-600">
                            {new Date(session.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium">
                            {session.drill}
                          </td>
                          <td className="px-4 py-2 text-sm text-slate-600 capitalize">
                            {session.category}
                          </td>
                          <td className="px-4 py-2 text-sm text-slate-600">
                            {formatTime(session.time)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="bg-slate-800 text-white p-4 text-center text-sm">
        <p>© 2025 Steno Finger Drill Practice App</p>
        <p className="text-slate-400 text-xs mt-1">
          Built for court reporters and stenography students
        </p>
      </footer>
    </div>
  );
};

export default StenoDrillApp;
