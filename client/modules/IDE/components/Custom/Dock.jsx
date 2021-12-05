import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  AppBar,
  Box,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Toolbar
} from '@mui/material';
import BrushIcon from '@mui/icons-material/Brush';
import CropSquareIcon from '@mui/icons-material/CropSquare';

export default function Dock() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="sticky" color="transparent">
        <Toolbar>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <IconButton size="large" edge="start" color="secondary">
                <BrushIcon fontSize="large" />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton size="large" edge="start">
                <CropSquareIcon fontSize="large" />
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
