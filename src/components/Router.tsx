import { styled } from '@mui/joy';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Calendar } from './calendar';
import AccountPage from './user/AccountPage';

const StyledAppContainerDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
});

const Router = () => {
  return (
    <StyledAppContainerDiv>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Calendar aria-label="Event date" />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </BrowserRouter>
    </StyledAppContainerDiv>
  );
};

export default Router;
