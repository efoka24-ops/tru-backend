import React from 'react';
import { useAppSettings } from '../context/SettingsContext';
import { Mail, Phone, MapPin, Smartphone } from 'lucide-react';

export function ContactInfo() {
  const { settings } = useAppSettings();

  if (!settings) return null;

  return (
    <div className="space-y-4">
      {settings?.email && (
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-600">Email</p>
            <a href={`mailto:${settings.email}`} className="font-semibold text-slate-900 hover:text-green-600 transition-colors">
              {settings.email}
            </a>
          </div>
        </div>
      )}

      {settings?.phone && (
        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-600">Téléphone</p>
            <a href={`tel:${settings.phone}`} className="font-semibold text-slate-900 hover:text-green-600 transition-colors">
              {settings.phone}
            </a>
          </div>
        </div>
      )}

      {settings?.address && (
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-600">Adresse</p>
            <p className="font-semibold text-slate-900">{settings.address}</p>
          </div>
        </div>
      )}

      {settings?.socialMedia?.whatsapp && (
        <div className="flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-slate-600">WhatsApp</p>
            <a href={`https://wa.me/${settings.socialMedia.whatsapp}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-900 hover:text-green-600 transition-colors">
              Contactez-nous
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
