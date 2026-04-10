import * as React from 'react';
import { Select } from './select';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function getDaysInMonth(month: number, year: number): number {
  if (!month || !year) return 31;
  return new Date(year, month, 0).getDate();
}

interface DateOfBirthPickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  id?: string;
}

export function DateOfBirthPicker({ value, onChange, id }: DateOfBirthPickerProps) {
  const [year, month, day] = React.useMemo(() => {
    if (!value) return ['', '', ''];
    const parts = value.split('-');
    return [parts[0] || '', parts[1] || '', parts[2] || ''];
  }, [value]);

  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => {
    const arr: number[] = [];
    for (let y = currentYear - 10; y >= currentYear - 80; y--) {
      arr.push(y);
    }
    return arr;
  }, [currentYear]);

  const daysInMonth = getDaysInMonth(Number(month), Number(year));

  const handleChange = (part: 'year' | 'month' | 'day', val: string) => {
    let newYear = year;
    let newMonth = month;
    let newDay = day;

    if (part === 'year') newYear = val;
    if (part === 'month') newMonth = val;
    if (part === 'day') newDay = val;

    // Adjust day if it exceeds the new month's max days
    if (newYear && newMonth && newDay) {
      const maxDays = getDaysInMonth(Number(newMonth), Number(newYear));
      if (Number(newDay) > maxDays) {
        newDay = String(maxDays).padStart(2, '0');
      }
    }

    if (newYear && newMonth && newDay) {
      onChange(`${newYear}-${newMonth}-${newDay}`);
    } else if (!newYear && !newMonth && !newDay) {
      onChange('');
    } else {
      // Partial selection — store what we have so far
      const y = newYear || '0000';
      const m = newMonth || '00';
      const d = newDay || '00';
      onChange(`${y}-${m}-${d}`);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2" id={id}>
      <Select
        value={day}
        onChange={(e) => handleChange('day', e.target.value)}
        aria-label="Día"
      >
        <option value="">Día</option>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = String(i + 1).padStart(2, '0');
          return (
            <option key={d} value={d}>
              {i + 1}
            </option>
          );
        })}
      </Select>
      <Select
        value={month}
        onChange={(e) => handleChange('month', e.target.value)}
        aria-label="Mes"
      >
        <option value="">Mes</option>
        {MONTHS.map((name, i) => {
          const m = String(i + 1).padStart(2, '0');
          return (
            <option key={m} value={m}>
              {name}
            </option>
          );
        })}
      </Select>
      <Select
        value={year}
        onChange={(e) => handleChange('year', e.target.value)}
        aria-label="Año"
      >
        <option value="">Año</option>
        {years.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </Select>
    </div>
  );
}
