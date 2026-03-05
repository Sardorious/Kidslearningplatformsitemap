import { Link } from "react-router";
import { Home } from "lucide-react";
import { Button } from "../components/ui/button";
import { useLanguage } from "../contexts/LanguageContext";

export function NotFound() {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-8xl mb-6">🤔</div>
      <h1 className="text-4xl font-black text-gray-900 mb-2">{t.pageNotFound}</h1>
      <p className="text-lg text-gray-600 mb-8">
        {t.couldntFind}
      </p>
      <Link to="/">
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl px-8">
          <Home className="w-4 h-4 mr-2" />
          {t.goBackHome}
        </Button>
      </Link>
    </div>
  );
}