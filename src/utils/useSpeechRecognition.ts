import { useState, useRef, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type DictationTarget = 'title' | 'description' | null;

interface UseSpeechRecognitionOptions {
  lang?: string;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [activeTarget, setActiveTarget] = useState<DictationTarget>(null);
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>(options.lang || 'ar-SA');

  const recognitionRef = useRef<any>(null);
  const onResultCallbackRef = useRef<((finalText: string, interimText: string) => void) | null>(null);

  // Check if speech recognition is available in browser
  const isNativeAndroid = Capacitor.getPlatform() === 'android';
  const isSupported = isNativeAndroid || (typeof window !== 'undefined' && Boolean(
    window.SpeechRecognition || window.webkitSpeechRecognition
  ));

  // Play subtle audio feedback tone on start/stop
  const playFeedbackTone = (type: 'start' | 'stop') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      if (type === 'start') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } else {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
        osc.start();
        osc.stop(ctx.currentTime + 0.14);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
    } catch {
      // Audio feedback is purely optional
    }
  };

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        if (recognitionRef.current.native) {
          void SpeechRecognition.stop();
        } else {
          recognitionRef.current.abort();
        }
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setActiveTarget(null);
    setInterimText('');
    playFeedbackTone('stop');
  }, []);

  // Explicitly prompt user for microphone permission via getUserMedia
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (isNativeAndroid) {
      try {
        const current = await SpeechRecognition.checkPermissions();
        const permission = current.speechRecognition === 'granted'
          ? current
          : await SpeechRecognition.requestPermissions();
        const granted = permission.speechRecognition === 'granted';
        setIsPermissionDenied(!granted);
        setErrorMessage(granted ? null : 'يرجى السماح لتطبيق إنجاز باستخدام الميكروفون للإملاء الصوتي.');
        return granted;
      } catch {
        setIsPermissionDenied(true);
        setErrorMessage('تعذر طلب إذن الميكروفون من Android. تحقق من إعدادات أذونات التطبيق.');
        return false;
      }
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return true;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop and release audio tracks immediately so SpeechRecognition can bind cleanly
      stream.getTracks().forEach((track) => track.stop());
      setIsPermissionDenied(false);
      setErrorMessage(null);
      return true;
    } catch (err: any) {
      const errorName = err?.name || '';
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        setIsPermissionDenied(true);
        setErrorMessage(
          'تم حظر إذن الميكروفون. يرجى الضغط على أيقونة القفل أو المايكروفون بجانب رابط المتصفح، واختيار "سماح" (Allow)، ثم إعادة المحاولة.'
        );
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setErrorMessage('لم يتم العثور على مايكروفون متصل بجهازك. يرجى توصيل مايكروفون والتأكد من إعداده.');
      } else {
        setErrorMessage('تعذر الوصول إلى الميكروفون. يرجى التحقق من أذونات المتصفح.');
      }
      return false;
    }
  }, [isNativeAndroid]);

  const startListening = useCallback(async (
    target: DictationTarget,
    onResult: (finalText: string, interimText: string) => void,
    overrideLang?: string
  ) => {
    setErrorMessage(null);

    if (isNativeAndroid) {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      try {
        const { available } = await SpeechRecognition.available();
        if (!available) {
          setErrorMessage('لا تتوفر خدمة التعرف على الكلام على هذا الجهاز.');
          return;
        }

        recognitionRef.current = { native: true };
        setIsListening(true);
        setActiveTarget(target);
        const result = await SpeechRecognition.start({
          language: overrideLang || selectedLang || 'ar-SA',
          maxResults: 1,
          partialResults: false,
          popup: true,
        });
        const finalText = result.matches?.[0]?.trim() || '';
        if (finalText) onResult(finalText, '');
      } catch {
        setErrorMessage('تعذر تشغيل التعرف على الكلام. تحقق من أذونات الميكروفون وخدمة التعرف الصوتي على الجهاز.');
      } finally {
        recognitionRef.current = null;
        setIsListening(false);
        setActiveTarget(null);
        setInterimText('');
      }
      return;
    }

    if (!isSupported) {
      setErrorMessage(
        'متصفحك الحالي لا يدعم تقنية التعرف على الصوت. يمكنك استخدام متصفح Google Chrome أو Safari أو Microsoft Edge.'
      );
      return;
    }

    // If already listening on this target, clicking stops it
    if (isListening && activeTarget === target) {
      stopListening();
      return;
    }

    // Stop any existing recognition instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }

    // Attempt permission request prior to starting recognition to ensure browser permission prompt triggers
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        setIsPermissionDenied(false);
      } catch (err: any) {
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setIsPermissionDenied(true);
          setErrorMessage(
            'تم حظر إذن الميكروفون. يرجى النقر على أيقونة القفل أو المايك في شريط عنوان المتصفح واختيار "سماح" (Allow).'
          );
          setIsListening(false);
          setActiveTarget(null);
          return;
        }
        // Other errors can proceed to SpeechRecognition fallback
      }
    }

    try {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = overrideLang || selectedLang || 'ar-SA';
      recognition.maxAlternatives = 1;

      onResultCallbackRef.current = onResult;

      recognition.onstart = () => {
        setIsListening(true);
        setActiveTarget(target);
        setInterimText('');
        setIsPermissionDenied(false);
        playFeedbackTone('start');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let finalSegment = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const transcript = item[0].transcript;
          if (item.isFinal) {
            finalSegment += transcript;
          } else {
            interim += transcript;
          }
        }

        setInterimText(interim);

        if (onResultCallbackRef.current) {
          onResultCallbackRef.current(finalSegment, interim);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Handle specific error codes gracefully without printing raw uncaught warnings
        if (event.error === 'not-allowed') {
          setIsPermissionDenied(true);
          setErrorMessage(
            'تم رفض إذن الميكروفون بواسطة المتصفح. اضغط على أيقونة القفل أو المايك بجوار رابط الموقع في شريط العنوان واختر "سماح" (Allow).'
          );
        } else if (event.error === 'network') {
          setErrorMessage('تعذر الاتصال بخدمة التعرف على الصوت. يرجى التحقق من اتصال الإنترنت.');
        } else if (event.error === 'no-speech') {
          // Normal silence, don't show error to user
          return;
        } else if (event.error === 'aborted') {
          // Normal abortion on stop/toggle
          return;
        } else {
          setErrorMessage(`حدث تنبيه أثناء الاستماع: ${event.error}`);
        }

        setIsListening(false);
        setActiveTarget(null);
        setInterimText('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setActiveTarget(null);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setErrorMessage('تعذر تشغيل الميكروفون. يرجى التحقق من أذونات المتصفح وتجربة المحاولة مرة أخرى.');
      setIsListening(false);
      setActiveTarget(null);
    }
  }, [isNativeAndroid, isSupported, isListening, activeTarget, selectedLang, stopListening, requestPermission]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    activeTarget,
    interimText,
    errorMessage,
    isPermissionDenied,
    selectedLang,
    setSelectedLang,
    startListening,
    stopListening,
    requestPermission,
    clearError: () => setErrorMessage(null),
  };
}
