import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import Skeleton from '../components/Skeleton';
import StepIndicator from '../components/StepIndicator';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { attachSwipeHandlers } from '../utils/gesture';

interface OnboardingStep {
  id: string;
  title: string;
  body: string[];
  cta?: string;
}

const keyTemplate = `-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA1ZbqXx...\n-----END PUBLIC KEY-----`;

const App = () => {
  const { t, i18n } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const steps: OnboardingStep[] = useMemo(
    () => [
      {
        id: 'tutorial',
        title: t('app.tutorialTitle'),
        body: [t('app.tutorialStep1'), t('app.tutorialStep2'), t('app.tutorialStep3')]
      },
      {
        id: 'key-setup',
        title: t('app.keySetupTitle'),
        body: [t('app.keySetupDescription')],
        cta: t('app.keyGenerate')
      },
      {
        id: 'samples',
        title: t('app.sampleProjects'),
        body: [
          t('app.projectIndustrial'),
          t('app.projectResidential'),
          t('app.projectInterior')
        ]
      }
    ],
    [t]
  );

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 1600);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const detach = attachSwipeHandlers(containerRef.current, {
      onSwipeLeft: () => setStepIndex((index) => Math.min(index + 1, steps.length - 1)),
      onSwipeRight: () => setStepIndex((index) => Math.max(index - 1, 0))
    });

    return detach;
  }, [steps.length]);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleGenerateKey = () => {
    const generatedKey = `${keyTemplate}`;
    setPublicKey(generatedKey);
  };

  const handleCopyKey = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
    } catch (error) {
      console.error('Clipboard copy failed', error);
    }
  };

  const handleLanguageChange = (lng: string) => {
    void i18n.changeLanguage(lng);
  };

  return (
    <div
      ref={containerRef}
      className="safe-area min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100"
    >
      <header className="px-6 pt-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t('app.title')}</h1>
          <p className="text-sm text-slate-300">{t('app.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="language-switcher">
            {t('app.a11y.languageSwitcher')}
          </label>
          <select
            id="language-switcher"
            className="rounded-lg bg-slate-800 px-3 py-2 text-sm"
            value={i18n.language}
            onChange={(event) => handleLanguageChange(event.target.value)}
          >
            <option value="en">English</option>
            <option value="ru">Русский</option>
          </select>
        </div>
      </header>

      <main className="px-6 pb-24 pt-10" aria-live="polite">
        <VisuallyHidden>
          <p>{t('app.voiceOverHint')}</p>
          <p>{t('app.gestureHint')}</p>
        </VisuallyHidden>
        <section className="space-y-6">
          <StepIndicator total={steps.length} current={stepIndex} />
          <AnimatePresence mode="wait" initial={false}>
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
                className="grid gap-4"
              >
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-14 w-40" />
              </motion.div>
            ) : (
              <motion.article
                key={steps[stepIndex].id}
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -40 }}
                transition={{ type: prefersReducedMotion ? 'tween' : 'spring', duration: 0.45 }}
                className="rounded-3xl border border-slate-800/40 bg-slate-900/60 p-6 shadow-2xl backdrop-blur"
                aria-label={t('app.a11y.step', { current: stepIndex + 1, total: steps.length })}
              >
                <h2 className="text-2xl font-semibold mb-4">{steps[stepIndex].title}</h2>
                <ul className="space-y-3 text-sm text-slate-200">
                  {steps[stepIndex].body.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {steps[stepIndex].id === 'key-setup' && (
                  <div className="mt-6 space-y-4">
                    <button
                      type="button"
                      className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/40 transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      onClick={handleGenerateKey}
                    >
                      {steps[stepIndex].cta}
                    </button>
                    {publicKey && (
                      <div className="rounded-2xl bg-slate-950/70 p-4 text-xs text-slate-100">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-mono break-words">{publicKey}</p>
                          <button
                            type="button"
                            className="rounded-full bg-slate-800 px-3 py-2 text-xs"
                            onClick={handleCopyKey}
                          >
                            {t('app.keyCopy')}
                          </button>
                        </div>
                        {copied && <p className="mt-2 text-emerald-400">Copied!</p>}
                      </div>
                    )}
                  </div>
                )}

                {steps[stepIndex].id === 'samples' && (
                  <div className="mt-6 grid gap-3 text-sm" role="list">
                    {steps[stepIndex].body.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="rounded-2xl border border-slate-800/50 bg-slate-950/40 px-4 py-3 text-left transition hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        aria-label={t('app.a11y.sampleProject', { name: item })}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}

                <footer className="mt-8 flex items-center justify-between">
                  <button
                    type="button"
                    className="text-xs text-slate-400 underline underline-offset-4"
                    onClick={() => setStepIndex(steps.length - 1)}
                  >
                    {t('app.skip')}
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-full border border-slate-700 px-4 py-2 text-xs font-medium"
                      onClick={() => setStepIndex((index) => Math.max(index - 1, 0))}
                      disabled={stepIndex === 0}
                    >
                      {t('app.continue')}
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900"
                      onClick={() =>
                        setStepIndex((index) => Math.min(index + 1, steps.length - 1))
                      }
                    >
                      {stepIndex === steps.length - 1 ? t('app.done') : t('app.continue')}
                    </button>
                  </div>
                </footer>
              </motion.article>
            )}
          </AnimatePresence>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 safe-area bg-slate-950/80 backdrop-blur-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">{t('app.cta')}</p>
            <p className="text-xs text-slate-400">{t('app.loading')}</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t('app.start')}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
