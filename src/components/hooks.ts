import { useCallback, useEffect, useState } from 'react';
import { getReminders, getSettings, subscribe, updateSettings } from '../shared/storage';
import type { Reminder, Settings } from '../shared/types';

export function useReminders(): { reminders: Reminder[]; loading: boolean } {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const all = await getReminders();
      if (active) {
        setReminders(all);
        setLoading(false);
      }
    };
    void load();
    const unsubscribe = subscribe(() => void load());
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { reminders, loading };
}

export function useSettings(): {
  settings: Settings | null;
  save: (patch: Partial<Settings>) => Promise<void>;
} {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    let active = true;
    void getSettings().then((s) => active && setSettings(s));
    const unsubscribe = subscribe(async () => {
      const next = await getSettings();
      if (active) setSettings(next);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const save = useCallback(async (patch: Partial<Settings>) => {
    const next = await updateSettings(patch);
    setSettings(next);
  }, []);

  return { settings, save };
}
