import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  useDisclosure,
  useColorMode,
  useColorModeValue,
  Stack,
  Heading,
  Container,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Divider,
} from '@chakra-ui/react';
import { 
  HamburgerIcon, 
  CloseIcon, 
  MoonIcon, 
  SunIcon, 
  ChevronDownIcon,
  EditIcon,
  ViewIcon,
  RepeatIcon
} from '@chakra-ui/icons';

const NavLink = ({ children, to, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  const activeColor = useColorModeValue('brand.600', 'brand.300');
  const inactiveColor = useColorModeValue('gray.600', 'gray.300');
  const activeBg = useColorModeValue('brand.50', 'gray.700');
  
  return (
    <Link
      as={RouterLink}
      px={3}
      py={2}
      rounded={'md'}
      display="flex"
      alignItems="center"
      fontWeight={isActive ? "semibold" : "medium"}
      color={isActive ? activeColor : inactiveColor}
      bg={isActive ? activeBg : 'transparent'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.100', 'gray.700'),
        color: useColorModeValue('brand.600', 'brand.300'),
      }}
      transition="all 0.2s"
      to={to}
    >
      {icon && <Box mr={2}>{icon}</Box>}
      {children}
    </Link>
  );
};

const NavBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box 
      bg={useColorModeValue('white', 'gray.900')} 
      boxShadow="sm"
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          
          <HStack spacing={8} alignItems={'center'}>
            <Heading
              size="md"
              bgGradient="linear(to-r, brand.500, accent.500)"
              bgClip="text"
              fontWeight="extrabold"
              letterSpacing="tight"
            >
              Text2Image AI
            </Heading>
            
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              <NavLink to="/" icon={<EditIcon />}>Create</NavLink>
              <NavLink to="/gallery" icon={<ViewIcon />}>Gallery</NavLink>
              <NavLink to="/retrain" icon={<RepeatIcon />}>Retrain Model</NavLink>
            </HStack>
          </HStack>
          
          <Flex alignItems={'center'}>
            <Button 
              onClick={toggleColorMode} 
              mr={4}
              size="sm"
              variant="ghost"
              colorScheme="brand"
              aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            </Button>
            
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                size="sm"
                rounded="full"
                cursor="pointer"
                minW={0}
              >
                <Avatar
                  size="sm"
                  bg="brand.500"
                  color="white"
                  name="AI User"
                />
              </MenuButton>
              <MenuList>
                <MenuItem>Profile</MenuItem>
                <MenuItem>Settings</MenuItem>
                <Divider />
                <MenuItem>Sign Out</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              <NavLink to="/" icon={<EditIcon />}>Create</NavLink>
              <NavLink to="/gallery" icon={<ViewIcon />}>Gallery</NavLink>
              <NavLink to="/retrain" icon={<RepeatIcon />}>Retrain Model</NavLink>
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
};

export default NavBar;