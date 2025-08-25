import React, { lazy } from 'react';

import '@/App.css'

const Hero = lazy(() => import('@/pages/Hero.jsx'));
const Info = lazy(() => import('@/pages/Info.jsx'));

function App() {
  return (
    <div className='p-0 m-0 flex flex-col min-h-screen items-center overflow-x-hidden'>
      <Hero />
      <Info />
    </div>
  )
}

export default App
