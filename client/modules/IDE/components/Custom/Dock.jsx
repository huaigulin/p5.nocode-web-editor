import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  AppBar,
  Box,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  SvgIcon,
  Toolbar,
  Tooltip
} from '@mui/material';
import { tooltipClasses } from '@mui/material/Tooltip';
import BrushIcon from '@mui/icons-material/Brush';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import MouseIcon from '@mui/icons-material/Mouse';
import KeyboardIcon from '@mui/icons-material/Keyboard';

const LargeTextTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    fontSize: 16
  }
}));

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
              <LargeTextTooltip title="Brushes" placement="left">
                <IconButton size="large">
                  <BrushIcon fontSize="large" />
                </IconButton>
              </LargeTextTooltip>
            </Grid>
            <Grid item>
              <LargeTextTooltip title="Shapes" placement="left">
                <IconButton size="large">
                  <CropSquareIcon fontSize="large" />
                </IconButton>
              </LargeTextTooltip>
            </Grid>
            <Grid item>
              <LargeTextTooltip title="Text" placement="left">
                <IconButton size="large">
                  <TextFieldsIcon fontSize="large" />
                </IconButton>
              </LargeTextTooltip>
            </Grid>
            <Grid item>
              <Divider />
            </Grid>
            <Grid item>
              <LargeTextTooltip title="Mouse Pressed" placement="left">
                <IconButton size="large">
                  <MouseIcon fontSize="large" />
                </IconButton>
              </LargeTextTooltip>
            </Grid>
            <Grid item>
              <LargeTextTooltip title="Key Down" placement="left">
                <IconButton size="large">
                  <KeyboardIcon fontSize="large" />
                </IconButton>
              </LargeTextTooltip>
            </Grid>
            <Grid item>
              <Divider />
            </Grid>
            <Grid item>
              <LargeTextTooltip title="Animate" placement="left">
                <IconButton size="large">
                  <SvgIcon fontSize="large">
                    <path
                      d="M21.3,8.2c-0.6-0.9-1.6-2.1-2.7-2c-0.2-0.3-0.8-1.3-1.4-2.3c-0.6-1.1-1.8-2.1-2.2-1.4c-0.1,0.1-0.1,0.6,0.5,1.8
				C15,3.7,14.6,3,14,2.8c-0.7-0.3-1.2,0.1-0.5,1.6c1.2,2.9,1.4,3.7,1.3,4.1c0,0.2-0.2,0.4-0.5,0.2c-1.1-0.5-3.6-1-4.5-1
				c-4.3,0-5.5,2.8-6.2,4.3c0,0-0.6,1.5-0.6,4.2C2.5,15.7,2,15,1.6,15C1.2,15,1,15.3,1,16c0,0.7,0.8,2.1,1.9,2.8
				c0.2,0.2,0.5,0.2,0.8,0c0.1-0.1,0.2-0.1,0.2-0.1c0.5,0.5,0.9,0.8,1.3,1.1c1,1.4,0.8,1.2,5.7,1.9c0,0,0.7,0.1,1-0.5
				c0.2-0.6-0.1-1-0.6-1.4c-0.1-0.1-0.5-0.3-0.7-0.4c2.6,0.3,4.5,0.6,4.8,0.8c0.3,0.8,1,1.2,2.1,1.4c0.5,0,0.8-0.2,1-0.6
				c0.3-0.7-0.6-1.3-1.1-1.6c-0.5-0.3-0.7-0.9-0.7-1c0,0,0,0,0,0c0.7-0.4,1.4-1,2-1.9c0.5-0.8,0.8-1.6,0.9-2.3c0.7,0,1.6-0.6,2.3-1
				c0.8-0.5,1.2-1.2,1.2-1.9C23,10.3,22.2,9.5,21.3,8.2z M19,9.3c-0.3,0-0.6-0.3-0.6-0.6c0-0.3,0.3-0.6,0.6-0.6
				c0.3,0,0.6,0.3,0.6,0.6C19.5,9.1,19.3,9.3,19,9.3z"
                    />
                  </SvgIcon>
                </IconButton>
              </LargeTextTooltip>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
