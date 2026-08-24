import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, TextField } from '@mui/material';
import useDebouncedValue from '../hooks/useDebouncedValue';

export default function TaskSearchBar({onSearch, isLoading = false }) {
  const [value, setValue] = useState('');
  const debounced = useDebouncedValue(value, 300);

  useEffect(() => {
    if (typeof onSearch === 'function') onSearch(debounced);
  }, [debounced, onSearch]);

  return (
    <Box display="flex" gap={2} mb={2} alignItems="center">
      <TextField
        fullWidth
        size="small"
        label="Search tasks..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        InputProps={{
          endAdornment: isLoading ? <CircularProgress size={20} /> : null,
        }}
      />
      <Button variant="outlined" disabled={!value} onClick={() => setValue('')}>
        Clear
      </Button>
    </Box>
  );
}
