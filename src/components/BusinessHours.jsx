import React from 'react';
import { useAppSettings } from '../context/SettingsContext';
import { Clock } from 'lucide-react';

export function BusinessHours() {
  const { settings } = useAppSettings();

  if (!settings?.businessHours) return null;

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = {
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mer',
    thursday: 'Jeu',
    friday: 'Ven',
    saturday: 'Sam',
    sunday: 'Dim'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-green-600" />
        <h3 className="font-bold text-slate-900">Horaires</h3>
      </div>
      
      <div className="space-y-2 text-sm">
        {days.map((day) => (
          <div key={day} className="flex justify-between text-slate-700">
            <span className="font-medium">{dayLabels[day]}</span>
            <span className={settings.businessHours[day] === 'Fermé' ? 'text-red-600' : 'text-slate-600'}>
              {settings.businessHours[day] || 'Non défini'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
