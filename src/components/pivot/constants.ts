import React from 'react';
import { AggregationType } from '../../types';

export const AGGREGATION_OPTS: { value: AggregationType; label: string }[] = [
  { value: 'sum', label: 'مجموع' },
  { value: 'count', label: 'عدد' },
  { value: 'avg', label: 'متوسط' },
  { value: 'max', label: 'أعلى قيمة' },
  { value: 'min', label: 'أقل قيمة' },
];
