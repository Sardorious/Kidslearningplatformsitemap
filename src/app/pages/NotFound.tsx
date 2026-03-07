import { Link } from "react-router";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { useLanguage } from "../contexts/LanguageContext";

export function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* Floating emoji */}
      <div
        className="text-8xl mb-6 animate-bounce"
        style={{ animationDuration: "2.5s" }}
      >
        🌌
      </div>

      {/* Error code */}
      <div className="text-8xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2 leading-none">
        404
      </div>

      <h1 className="text-2xl md:text-3xl font-black text-gray-900 mt-2 mb-3">
        {t.pageNotFound}
      </h1>
      <p className="text-gray-500 max-w-sm mx-auto mb-8 text-base">
        {t.couldntFind}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl px-8 py-2.5 text-white font-bold shadow-md hover:shadow-lg transition-all hover:scale-105">
            <Home className="w-4 h-4 mr-2" />
            {t.goBackHome}
          </Button>
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border-2 border-purple-200 text-purple-700 font-semibold hover:bg-purple-50 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}