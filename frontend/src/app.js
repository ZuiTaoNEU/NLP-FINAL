import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme, Box } from '@chakra-ui/react';

// Import components
import NavBar from './NavBar';
import ImageGenerator from './ImageGenerator';
import Gallery from './Gallery';
import ImageDetails from './ImageDetails';
import RetrainModel from './RetrainModel';

// Define custom colors
const colors = {
  brand: {
    50: '#e6f7ff',
    100: '#b8e8ff',
    200: '#8ad9ff',
    300: '#5ccaff',
    400: '#2ebcff',
    500: '#00aaff',
    600: '#0088cc',
    700: '#006699',
    800: '#004466',
    900: '#002233',
  },
  accent: {
    50: '#fff5e6',
    100: '#ffe0b3',
    200: '#ffcc80',
    300: '#ffb84d',
    400: '#ffa31a',
    500: '#ff9900',
    600: '#cc7a00',
    700: '#995c00',
    800: '#663d00',
    900: '#331f00',
  },
};

// Define fonts
const fonts = {
  heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif',
};

// Define component styles
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
    },
    variants: {
      solid: (props) => ({
        bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
          transform: 'translateY(-1px)',
          boxShadow: 'md',
        },
        transition: 'all 0.2s ease-in-out',
      }),
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        _hover: {
          boxShadow: 'lg',
        },
      },
    },
  },
};

// Define global styles
const styles = {
  global: (props) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
    },
  }),
};

// Combine theme
const theme = extendTheme({
  colors,
  fonts,
  components,
  styles,
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box minH="100vh" display="flex" flexDirection="column">
          <NavBar />
          <Box as="main" flex="1" py={6}>
            <Routes>
              <Route path="/" element={<ImageGenerator />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/image/:id" element={<ImageDetails />} />
              <Route path="/retrain" element={<RetrainModel />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;