"use client";

import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '../shared-theme/AppTheme';
import AppAppBar from './components/AppAppBar';
import Hero from './components/Hero';
import Highlights from './components/Highlights';
import Features from './components/Features';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import HowItWorks from './components/Working';

export default function WelcomePage() {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />

      <AppAppBar />
      <Hero />
      <Divider />
      <div>
        <Features />
        <Divider />
        <Highlights />
        <Divider />
        <HowItWorks />
        <Divider />
        <FAQ />
        <Divider />
        <Footer />
      </div>
    </AppTheme>
  );
}
