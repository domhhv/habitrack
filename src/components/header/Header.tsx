import { AccountCircleOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/joy';
import { styled } from '@mui/joy/styles';
import React from 'react';

import { AddHabitModal } from './AddHabitModal';

const StyledAppHeader = styled('header')(() => ({
  width: '100%',
  height: 50,
  backgroundColor: '#d6d3d1',
  borderBottom: '1px solid #78716c',
}));

const StyledAppHeaderContent = styled('div')(() => ({
  width: 1050,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '0 auto',
  height: '100%',
}));

export default function Header() {
  return (
    <StyledAppHeader>
      <StyledAppHeaderContent>
        <AddHabitModal />
        <IconButton>
          <AccountCircleOutlined />
        </IconButton>
      </StyledAppHeaderContent>
    </StyledAppHeader>
  );
}
