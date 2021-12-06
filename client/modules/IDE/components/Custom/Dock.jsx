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
    <Box sx={{ position: 'absolute', right: 0 }}>
      <AppBar
        position="sticky"
        color="transparent"
        sx={{ borderRadius: '16px 0 0 16px' }}
      >
        <Toolbar style={{ padding: 16 }}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <IconButton size="large">
                <BrushIcon fontSize="large" />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton size="large">
                <CropSquareIcon fontSize="large" />
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
