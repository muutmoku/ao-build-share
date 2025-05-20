import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';

interface ItemEntry {
  uniqueName: string;
  localizedNames?: Record<string, string>;
}

interface Props {
  slot: string;
  label: string;
  value: string; // uniqueName (例: T4_MAIN_SWORD@2)
  onChange: (value: string) => void;
  lang?: string; // 例: 'EN-US'
}

function getSortKey(uniqueName: string): { key: string; tier: number } {
  // 例: T4_MAIN_CURSEDSTAFF@3 → key: MAIN_CURSEDSTAFF@3, tier: 4
  const parts = uniqueName.split('_');
  let tier = 0;
  let keyParts = parts;
  if (/^T\d+$/.test(parts[0])) {
    tier = parseInt(parts[0].slice(1), 10);
    keyParts = parts.slice(1);
  }
  return {
    key: keyParts.join('_'),
    tier,
  };
}

const ItemAutocomplete: React.FC<Props> = ({ slot, label, value, onChange, lang = 'EN-US' }) => {
  const [options, setOptions] = useState<ItemEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = `https://muutmoku.github.io/ao-item-snapshot/data/latest/${slot}.json`;
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data: ItemEntry[]) => {
        data.sort((a, b) => {
          const ka = getSortKey(a.uniqueName);
          const kb = getSortKey(b.uniqueName);
          if (ka.key !== kb.key) return ka.key.localeCompare(kb.key);
          return ka.tier - kb.tier;
        });
        setOptions(data.filter(item => item.localizedNames?.[lang]));
        setLoading(false);
      });
  }, [slot, lang]);

  return (
    <Autocomplete
      fullWidth
      options={options}
      getOptionLabel={option =>
        option.localizedNames?.[lang] || option.uniqueName
      }
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      value={options.find(opt => opt.uniqueName === value) || null}
      onChange={(_, newValue) => {
        if (newValue) onChange(newValue.uniqueName);
        else onChange('');
      }}
      isOptionEqualToValue={(a, b) => a.uniqueName === b.uniqueName}
    />
  );
};

export default ItemAutocomplete;
