'use client';
import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { FormLabel, FormMessage } from '@/components/ui/form';

interface RichTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

const RichTextField: React.FC<RichTextFieldProps> = ({ value, onChange, label, placeholder, error }) => (
  <div className="space-y-2">
    {label && <FormLabel>{label}</FormLabel>}
    <div data-color-mode="light">
      <MDEditor
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        height={150}
      />
    </div>
    {error && <FormMessage>{error}</FormMessage>}
  </div>
);

export default RichTextField; 