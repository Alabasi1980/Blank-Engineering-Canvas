
import { BalanceType, EffectNature, CardDataType } from './types';
import { 
    Briefcase, Box, Tag, Users, MapPin, ListTree, List, Settings, 
    Server, LayoutGrid, Globe, Archive, Calendar, DollarSign, Database
} from 'lucide-react';

// Engine Constants (Required for logic to work)
export const BALANCE_TYPES: { value: BalanceType; label: string }[] = [
  { value: 'period_balance', label: 'الصافي خلال الفترة (Net Period)' },
  { value: 'opening_balance', label: 'رصيد ما قبل الفترة (Pre-period)' },
  { value: 'cumulative', label: 'تراكمي كلي (Lifetime Total)' },
];

export const EFFECT_NATURES: { value: EffectNature; label: string }[] = [
  { value: 'add', label: '+' },
  { value: 'subtract', label: '-' },
  { value: 'neutral', label: 'لا يؤثر' },
];

export const CARD_DATA_TYPES: { value: CardDataType; label: string }[] = [
  { value: 'decimal_value', label: 'قيمة رقمية (Decimal)' },
  { value: 'integer_count', label: 'عدد سجلات (Count)' },
];

// UI Constants (Generic)
export const CARD_COLORS = [
  { value: 'blue', label: 'أزرق', bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-100', ring: 'ring-blue-500', iconBg: 'bg-blue-100' },
  { value: 'emerald', label: 'أخضر', bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-100', ring: 'ring-emerald-500', iconBg: 'bg-emerald-100' },
  { value: 'violet', label: 'بنفسجي', bg: 'bg-violet-600', text: 'text-violet-600', light: 'bg-violet-50', border: 'border-violet-100', ring: 'ring-violet-500', iconBg: 'bg-violet-100' },
  { value: 'amber', label: 'برتقالي', bg: 'bg-amber-600', text: 'text-amber-600', light: 'bg-amber-50', border: 'border-amber-100', ring: 'ring-amber-500', iconBg: 'bg-amber-100' },
  { value: 'rose', label: 'أحمر', bg: 'bg-rose-600', text: 'text-rose-600', light: 'bg-rose-50', border: 'border-rose-100', ring: 'ring-rose-500', iconBg: 'bg-rose-100' },
  { value: 'slate', label: 'رمادي', bg: 'bg-slate-600', text: 'text-slate-600', light: 'bg-slate-50', border: 'border-slate-100', ring: 'ring-slate-500', iconBg: 'bg-slate-100' },
];

// Generic Icons Library
export const MASTER_ICONS: Record<string, any> = {
    Box, Tag, Users, MapPin, ListTree, List, Settings, Server, LayoutGrid,
    Briefcase, Globe, Archive, Calendar, DollarSign, Database
};
