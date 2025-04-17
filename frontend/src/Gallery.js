import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Image,
  Text,
  VStack,
  Button,
  Link,
  Spinner,
  Center,
  useColorModeValue,
  Flex,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { getImages } from './api';

const GalleryItem = ({ image }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Convert timestamp to readable date format
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <Link
      as={RouterLink}
      to={`/image/${image.id}`}
      _hover={{ textDecoration: 'none' }}
    >
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg={bgColor}
        borderColor={borderColor}
        transition="transform 0.2s"
        _hover={{ transform: 'scale(1.02)' }}
        h="100%"
        display="flex"
        flexDirection="column"
      >
        <Box position="relative" paddingTop="100%" overflow="hidden">
          <Image
            position="absolute"
            top="0"
            left="0"
            w="100%"
            h="100%"
            src={image.image_data}
            alt={image.prompt}
            objectFit="cover"
          />
        </Box>
        <VStack p={4} align="start" spacing={1} flex="1">
          <Text fontWeight="bold" noOfLines={2}>
            {image.prompt}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {formatDate(image.created_at)}
          </Text>
          
          <Flex mt={2} alignItems="center" width="100%">
            <Tooltip label={`Seed: ${image.seed}`}>
              <Badge colorScheme="blue" variant="subtle">
                #{image.id}
              </Badge>
            </Tooltip>
            
            {image.feedback > 0 && (
              <Badge colorScheme="green" ml="auto">
                Liked
              </Badge>
            )}
          </Flex>
        </VStack>
      </Box>
    </Link>
  );
};

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12;
  
  const fetchImages = async (pageNum) => {
    setLoading(true);
    try {
      const data = await getImages(pageSize, pageNum * pageSize);
      
      if (data.length < pageSize) {
        setHasMore(false);
      }
      
      // If it's the first page, replace images, otherwise append
      if (pageNum === 0) {
        setImages(data);
      } else {
        setImages((prevImages) => [...prevImages, ...data]);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchImages(page);
  }, [page]);
  
  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };
  
  const handlePrevPage = () => {
    if (page > 0) {
      setPage((prevPage) => prevPage - 1);
    }
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Image Gallery
        </Heading>
        
        {loading && page === 0 ? (
          <Center py={12}>
            <Spinner size="xl" />
          </Center>
        ) : images.length === 0 ? (
          <Center py={12}>
            <VStack spacing={4}>
              <Text fontSize="xl">No images found</Text>
              <Button as={RouterLink} to="/" colorScheme="blue">
                Create your first image
              </Button>
            </VStack>
          </Center>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {images.map((image) => (
                <GalleryItem key={image.id} image={image} />
              ))}
            </SimpleGrid>
            
            {(loading && page > 0) && (
              <Center py={4}>
                <Spinner />
              </Center>
            )}
            
            <Flex justifyContent="center" mt={6}>
              <Button
                leftIcon={<ChevronLeftIcon />}
                onClick={handlePrevPage}
                isDisabled={page === 0}
                mr={4}
              >
                Previous
              </Button>
              <Button
                rightIcon={<ChevronRightIcon />}
                onClick={handleNextPage}
                isDisabled={!hasMore}
                isLoading={loading && page > 0}
              >
                Next
              </Button>
            </Flex>
          </>
        )}
      </VStack>
    </Container>
  );
};

export default Gallery;