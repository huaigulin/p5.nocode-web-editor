import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  AppBar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar
} from '@mui/material';
import { Brush as BrushIcon } from '@mui/icons-material';

export default function Dock() {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <IconButton size="large" edge="start">
          <BrushIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
