import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

type SurveyData = {
  learning: string;
  investmentGoals: string[];
  investmentGoalsOther: string;
  interestingTopics: string[];
  interestingTopicsOther: string;
  securityLevel: string;
  hurdles: string[];
  hurdlesOther: string;
  feelMoreSecure: string;
};

const initialData: SurveyData = {
  learning: '',
  investmentGoals: [],
  investmentGoalsOther: '',
  interestingTopics: [],
  interestingTopicsOther: '',
  securityLevel: '',
  hurdles: [],
  hurdlesOther: '',
  feelMoreSecure: '',
};

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SurveyData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/submit-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        setStep(7); // Success screen
      } else {
        setError(result.error || 'Ein Fehler ist aufgetreten.');
      }
    } catch (err) {
      setError('Verbindungsfehler. Bitte versuche es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateData = (fields: Partial<SurveyData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const toggleArrayItem = (field: 'investmentGoals' | 'interestingTopics' | 'hurdles', item: string) => {
    setData((prev) => {
      const current = prev[field];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter((i) => i !== item) };
      }
      return { ...prev, [field]: [...current, item] };
    });
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6"
          >
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-swiss-red rounded-full flex items-center justify-center text-white">
                <ShieldCheck size={40} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-swiss-dark">Willkommen zur Workshop-Umfrage</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Vielen Dank für deine Teilnahme! Wir möchten uns stetig verbessern und freuen uns über dein ehrliches Feedback.
            </p>
            <button
              onClick={handleNext}
              className="mt-8 bg-swiss-red hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-full transition-colors inline-flex items-center gap-2"
            >
              Umfrage starten <ChevronRight size={20} />
            </button>
          </motion.div>
        );
      case 1:
        return (
          <QuestionWrapper title="1. Was war dein größtes Learning aus dem Workshop und was können wir in Zukunft noch verbessern?">
            <textarea
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-swiss-red focus:border-transparent outline-none resize-none h-40"
              placeholder="Deine Antwort..."
              value={data.learning}
              onChange={(e) => updateData({ learning: e.target.value })}
            />
          </QuestionWrapper>
        );
      case 2:
        return (
          <QuestionWrapper title="2. Mir ist es persönlich wichtig, ein Investment aufzubauen, um…">
            <p className="text-sm text-gray-500 mb-4">(Mehrfachauswahl möglich)</p>
            <div className="space-y-3">
              {[
                'ich langfristig Vermögen aufbauen möchte',
                'mir größere Ziele zu erfüllen (z. B. Immobilie, Reisen, Selbstständigkeit)',
                'finanziell unabhängiger zu werden',
                'für meine Familie / Kinder vorzusorgen',
                'ich mich vor Inflation schützen möchte',
                'mein Geld sinnvoll und strukturiert anzulegen',
              ].map((option) => (
                <Checkbox
                  key={option}
                  label={option}
                  checked={data.investmentGoals.includes(option)}
                  onChange={() => toggleArrayItem('investmentGoals', option)}
                />
              ))}
              <div className="flex items-center gap-3 mt-4">
                <Checkbox
                  label="Sonstiges:"
                  checked={data.investmentGoals.includes('Sonstiges')}
                  onChange={() => toggleArrayItem('investmentGoals', 'Sonstiges')}
                />
                {data.investmentGoals.includes('Sonstiges') && (
                  <input
                    type="text"
                    className="flex-1 border-b border-gray-300 focus:border-swiss-red outline-none px-2 py-1 bg-transparent"
                    value={data.investmentGoalsOther}
                    onChange={(e) => updateData({ investmentGoalsOther: e.target.value })}
                    placeholder="Bitte angeben..."
                  />
                )}
              </div>
            </div>
          </QuestionWrapper>
        );
      case 3:
        return (
          <QuestionWrapper title="3. Mich interessiert das Thema Investment besonders, weil ich mehr über … lernen möchte">
            <p className="text-sm text-gray-500 mb-4">(Mehrfachauswahl möglich)</p>
            <div className="space-y-3">
              {[
                'Aktien, Anleihen, Fonds und ETFs',
                'Immobilien als Investment',
                'Nachhaltige Geldanlagen',
                'Strategien zum langfristigen Vermögensaufbau',
                'Risikomanagement und Sicherheit',
              ].map((option) => (
                <Checkbox
                  key={option}
                  label={option}
                  checked={data.interestingTopics.includes(option)}
                  onChange={() => toggleArrayItem('interestingTopics', option)}
                />
              ))}
              <div className="flex items-center gap-3 mt-4">
                <Checkbox
                  label="Sonstiges:"
                  checked={data.interestingTopics.includes('Sonstiges')}
                  onChange={() => toggleArrayItem('interestingTopics', 'Sonstiges')}
                />
                {data.interestingTopics.includes('Sonstiges') && (
                  <input
                    type="text"
                    className="flex-1 border-b border-gray-300 focus:border-swiss-red outline-none px-2 py-1 bg-transparent"
                    value={data.interestingTopicsOther}
                    onChange={(e) => updateData({ interestingTopicsOther: e.target.value })}
                    placeholder="Bitte angeben..."
                  />
                )}
              </div>
            </div>
          </QuestionWrapper>
        );
      case 4:
        return (
          <QuestionWrapper title="4. Wie sicher fühlst du dich aktuell im Umgang mit dem Thema Investment?">
            <div className="space-y-3">
              {[
                'Sehr unsicher – ich habe kaum Berührungspunkte',
                'Eher unsicher – ich kenne Grundlagen, aber fühle mich noch nicht bereit',
                'Teils/teils – ich habe schon erste Erfahrungen gesammelt',
                'Eher sicher – ich investiere bereits regelmäßig',
                'Sehr sicher – ich habe eine klare Strategie und viel Erfahrung',
              ].map((option) => (
                <Radio
                  key={option}
                  label={option}
                  checked={data.securityLevel === option}
                  onChange={() => updateData({ securityLevel: option })}
                />
              ))}
            </div>
          </QuestionWrapper>
        );
      case 5:
        return (
          <QuestionWrapper title="5. Was hält dich aktuell am meisten davon ab, mit dem Investieren zu starten?">
            <p className="text-sm text-gray-500 mb-4">(Mehrfachauswahl möglich)</p>
            <div className="space-y-3">
              {[
                'Fehlendes Wissen',
                'Angst vor Verlusten',
                'Zu wenig Startkapital',
                'Keine klare Strategie',
                'Zu wenig Zeit, mich damit zu beschäftigen',
                'Komplexität des Themas',
              ].map((option) => (
                <Checkbox
                  key={option}
                  label={option}
                  checked={data.hurdles.includes(option)}
                  onChange={() => toggleArrayItem('hurdles', option)}
                />
              ))}
              <div className="flex items-center gap-3 mt-4">
                <Checkbox
                  label="Sonstiges:"
                  checked={data.hurdles.includes('Sonstiges')}
                  onChange={() => toggleArrayItem('hurdles', 'Sonstiges')}
                />
                {data.hurdles.includes('Sonstiges') && (
                  <input
                    type="text"
                    className="flex-1 border-b border-gray-300 focus:border-swiss-red outline-none px-2 py-1 bg-transparent"
                    value={data.hurdlesOther}
                    onChange={(e) => updateData({ hurdlesOther: e.target.value })}
                    placeholder="Bitte angeben..."
                  />
                )}
              </div>
            </div>
          </QuestionWrapper>
        );
      case 6:
        return (
          <QuestionWrapper title="6. Fühlst du dich nach diesem Workshop sicherer in deinen Investmententscheidungen?">
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => updateData({ feelMoreSecure: 'JA' })}
                className={`flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all ${
                  data.feelMoreSecure === 'JA'
                    ? 'border-swiss-red bg-red-50 text-swiss-red'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                JA
              </button>
              <button
                onClick={() => updateData({ feelMoreSecure: 'NEIN' })}
                className={`flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all ${
                  data.feelMoreSecure === 'NEIN'
                    ? 'border-swiss-red bg-red-50 text-swiss-red'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                NEIN
              </button>
            </div>
          </QuestionWrapper>
        );
      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-12"
          >
            <div className="flex justify-center mb-6">
              <CheckCircle2 size={80} className="text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-swiss-dark">Vielen Dank!</h2>
            <p className="text-gray-600">Deine Antworten wurden erfolgreich übermittelt.</p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Header / Logo */}
      <div className="w-full max-w-2xl flex justify-center mb-8">
        <div className="flex flex-col items-center">
          {/* Logo Placeholder mimicking Swiss Life Select */}
          <div className="relative w-16 h-16 mb-2">
            <svg viewBox="0 0 100 100" className="w-full h-full text-swiss-red fill-current">
              <path d="M50 0 C20 0 0 20 0 50 C0 80 20 100 50 100 C80 100 100 80 100 50 C100 20 80 0 50 0 Z" opacity="0.1" />
              <path d="M30 50 C30 35 45 20 60 20 C75 20 80 30 80 30 C80 30 65 40 50 50 C35 60 20 70 20 70 C20 70 30 65 30 50 Z" />
              <path d="M70 50 C70 65 55 80 40 80 C25 80 20 70 20 70 C20 70 35 60 50 50 C65 40 80 30 80 30 C80 30 70 35 70 50 Z" />
              <rect x="65" y="45" width="10" height="10" fill="white" />
              <rect x="60" y="50" width="20" height="20" fill="white" transform="translate(-10, -10)" opacity="0" />
              {/* White Cross */}
              <path d="M68 42 L72 42 L72 48 L78 48 L78 52 L72 52 L72 58 L68 58 L68 52 L62 52 L62 48 L68 48 Z" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif text-black tracking-tight">SwissLife</h1>
          <span className="text-gray-400 text-xl font-serif tracking-wide">Select</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden relative">
        {/* Progress Bar */}
        {step > 0 && step < 7 && (
          <div className="h-1.5 w-full bg-gray-100 absolute top-0 left-0">
            <div
              className="h-full bg-swiss-red transition-all duration-500 ease-out"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        )}

        <div className="p-8 sm:p-12 min-h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        {step > 0 && step < 7 && (
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-gray-500 hover:text-swiss-dark font-medium flex items-center gap-1 transition-colors"
            >
              <ChevronLeft size={20} /> Zurück
            </button>

            {error && <span className="text-red-500 text-sm font-medium">{error}</span>}

            {step < 6 ? (
              <button
                onClick={handleNext}
                className="bg-swiss-red hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-full transition-colors flex items-center gap-2"
              >
                Weiter <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-swiss-red hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2.5 px-6 rounded-full transition-colors flex items-center gap-2"
              >
                {isSubmitting ? 'Wird gesendet...' : 'Absenden'} <CheckCircle2 size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-swiss-dark leading-snug">{title}</h2>
      <div>{children}</div>
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex items-center justify-center mt-1">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-swiss-red peer-checked:border-swiss-red transition-colors" />
        <CheckCircle2
          size={14}
          className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity"
          strokeWidth={3}
        />
      </div>
      <span className="text-gray-700 group-hover:text-swiss-dark transition-colors">{label}</span>
    </label>
  );
}

function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex items-center justify-center mt-1">
        <input
          type="radio"
          className="peer sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-swiss-red transition-colors" />
        <div className="absolute w-2.5 h-2.5 bg-swiss-red rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
      </div>
      <span className="text-gray-700 group-hover:text-swiss-dark transition-colors">{label}</span>
    </label>
  );
}

