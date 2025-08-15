'use client';
import React from 'react';
import Input from './Input';

const formatNumber = (value) => {
  if (!value) return '';
  const numberValue = parseInt(String(value).replace(/\./g, ''), 10);
  if (isNaN(numberValue)) return '';
  return numberValue.toLocaleString('vi-VN');
};

const NumberInput = ({ value, onChange, ...props }) => {
  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/\./g, '');
    if (/^\d*$/.test(rawValue)) {
      const numericValue = rawValue === '' ? '' : parseInt(rawValue, 10);
      onChange({
        ...e,
        target: {
          ...e.target,
          name: props.name,
          value: numericValue,
        },
      });
    }
  };

  return (
    <Input
      {...props}
      type="text"
      value={formatNumber(value)}
      onChange={handleChange}
    />
  );
};

export default NumberInput;
