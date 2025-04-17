import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Import components
import NavBar from './NavBar';
import ImageGenerator from './ImageGenerator';
import Gallery from './Gallery';
import ImageDetails from './ImageDetails';
import RetrainModel from './RetrainModel';

// Define theme
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e0f7ff',
      100: '#b8e8ff',
      200: '#8dd9ff',
      300: '#61caff',
      400: '#36bbff',
      500: '#00aaff',
      600: '#0088cc',
      700: '#006699',
      800: '#004466',
      900: '#002233',
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<ImageGenerator />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/image/:id" element={<ImageDetails />} />
          <Route path="/retrain" element={<RetrainModel />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;