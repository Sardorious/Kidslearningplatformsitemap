import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, BookOpen, Globe, Calculator, FlaskConical, Music, Palette, Sparkles, ChevronDown } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { aiService } from "../api/services";
import { useAuth } from "../contexts/AuthContext";

const SUBJECTS = [
  { id: "general", label: "General", emoji: "🤖", color: "from-purple-500 to-indigo-500" },
  { id: "English", label: "English", emoji: "📖", color: "from-blue-500 to-cyan-500" },
  { id: "Arabic", label: "Arabic", emoji: "🌙", color: "from-emerald-500 to-teal-500" },
  { id: "Spanish", label: "Spanish", emoji: "🌊", color: "from-orange-500 to-amber-500" },
  { id: "Turkish", label: "Turkish", emoji: "🏖️", color: "from-red-500 to-rose-600" },
  { id: "Russian", label: "Russian", emoji: "🏰", color: "from-blue-600 to-indigo-700" },
  { id: "Math", label: "Math", emoji: "🔢", color: "from-pink-500 to-rose-500" },
  { id: "Science", label: "Science", emoji: "🔬", color: "from-violet-500 to-purple-500" },
  { id: "History", label: "History", emoji: "🏛️", color: "from-yellow-500 to-orange-500" },
  { id: "Art", label: "Art", emoji: "🎨", color: "from-fuchsia-500 to-pink-500" },
];

const QUICK_PROMPTS: Record<string, string[]> = {
  general: ["What is the capital of France?", "Explain photosynthesis simply", "Help me study for a test"],
  English: ["What is a metaphor?", "Help me practice past tense", "Give me an example sentence"],
  Arabic: ["How do I say 'Hello' in Arabic?", "Teach me Arabic numbers", "What is the Arabic alphabet?"],
  Spanish: ["How do I say 'Thank you'?", "Teach me Spanish greetings", "Practice simple sentences"],
  Turkish: ["How do I say 'Good morning' in Turkish?", "Teach me colors in Turkish", "What are some Turkish greetings?"],
  Russian: ["How do I say 'Hello' in Russian?", "Teach me the Cyrillic alphabet", "How to say 'Thank you' in Russian?"],
  Math: ["Help me with fractions", "What is multiplication?", "Explain geometry shapes"],
  Science: ["What is gravity?", "How do plants make food?", "Tell me about the planets"],
  History: ["Who were the ancient Egyptians?", "What caused WW1?", "Tell me about dinosaurs"],
  Art: ["What are the primary colors?", "How do I draw a face?", "What is abstract art?"],
};

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

export function AiTutor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: `Hey there! I'm Zappy 🤖, your friendly AI tutor! I'm here to help you learn anything — from math and science to languages and history. What would you like to learn today? 🌟`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("general");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSubjects, setShowSubjects] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const grade = user ? "Grade 5" : "Grade 3";
  const activeSubject = SUBJECTS.find((s) => s.id === selectedSubject) || SUBJECTS[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || loading) return;
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: msgText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    const initialBotMsg: Message = { id: botMsgId, role: "bot", text: "", timestamp: new Date() };
    setMessages((prev) => [...prev, initialBotMsg]);

    try {
      await aiService.tutorChatStream(msgText, activeSubject.label, grade, (text: string) => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === botMsgId ? { ...msg, text } : msg))
        );
      });
    } catch {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === botMsgId ? { ...msg, text: "Oops! I had a hiccup 🔧. Please try again!" } : msg))
      );
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice input is not supported in your browser.");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-h-[900px] space-y-0">
      {/* Header */}
      <div className={`p-4 bg-gradient-to-r ${activeSubject.color} text-white rounded-t-2xl flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl border-2 border-white/30 shadow-lg">
            🤖
          </div>
          <div>
            <h1 className="text-xl font-black">Zappy AI Tutor</h1>
            <p className="text-sm text-white/80">
              Helping with <span className="font-bold">{activeSubject.emoji} {activeSubject.label}</span>
            </p>
          </div>
        </div>
        {/* Subject Picker */}
        <div className="relative">
          <Button
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl text-sm font-bold backdrop-blur-sm"
            onClick={() => setShowSubjects(!showSubjects)}
          >
            {activeSubject.emoji} {activeSubject.label} <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          {showSubjects && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 grid grid-cols-2 gap-1 z-50 w-64">
              {SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-left transition-all ${selectedSubject === s.id ? "bg-purple-100 text-purple-700" : "hover:bg-gray-50 text-gray-700"}`}
                  onClick={() => { setSelectedSubject(s.id); setShowSubjects(false); }}
                >
                  <span>{s.emoji}</span> {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
            {msg.role === "bot" && (
              <div className={`w-9 h-9 bg-gradient-to-br ${activeSubject.color} rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-md`}>
                🤖
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? `bg-gradient-to-br ${activeSubject.color} text-white rounded-br-sm font-medium`
                  : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {msg.text}
              <div className={`text-[10px] mt-1 ${msg.role === "user" ? "text-white/60" : "text-gray-400"}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            {msg.role === "user" && (
              <div className="w-9 h-9 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center text-lg shrink-0">
                {user?.name?.[0]?.toUpperCase() || "👤"}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start gap-2">
            <div className={`w-9 h-9 bg-gradient-to-br ${activeSubject.color} rounded-2xl flex items-center justify-center text-lg shrink-0`}>🤖</div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto">
        {(QUICK_PROMPTS[selectedSubject] || QUICK_PROMPTS.general).map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            disabled={loading}
            className="shrink-0 text-xs bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-600 hover:text-purple-700 px-3 py-1.5 rounded-full transition-all font-medium"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 p-3 rounded-b-2xl">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={`Ask me anything about ${activeSubject.label}...`}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            disabled={loading}
          />
          <button
            onClick={isListening ? stopVoice : startVoice}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isListening ? "bg-red-100 text-red-600 animate-pulse" : "text-gray-400 hover:text-purple-600 hover:bg-purple-50"}`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all ${
              input.trim() && !loading ? `bg-gradient-to-br ${activeSubject.color} hover:opacity-90 shadow-md` : "bg-gray-200"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-1.5">Zappy gives helpful hints — always check with your teacher 😊</p>
      </div>
    </div>
  );
}
