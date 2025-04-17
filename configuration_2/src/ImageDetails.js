import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Image,
  Text,
  VStack,
  HStack,
  Button,
  Spinner,
  Center,
  useToast,
  Divider,
  SimpleGrid,
  FormControl,
  FormLabel,
  Textarea,
  Flex,
  Spacer,
  IconButton,
  Badge,
  useColorModeValue,
  Code,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  DownloadIcon,
  StarIcon,
  RepeatIcon,
  CopyIcon,
} from '@chakra-ui/icons';
import {
  getImageDetails,
  generateVariations,
  saveFeedback,
} from '../utils/api';

const ImageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [loadingVariations, setLoadingVariations] = useState(false);
  const [variations, setVariations] = useState([]);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    const fetchImageDetails = async () => {
      setLoading(true);
      try {
        const data = await getImageDetails(id);
        setImage(data);
        setPrompt(data.prompt);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch image details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchImageDetails();
  }, [id, toast]);
  
  const handleDownload = () => {
    if (!image) return;
    
    const link = document.createElement('a');
    link.href = image.image_data;
    link.download = `image-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleCopyPrompt = () => {
    if (!image) return;
    
    navigator.clipboard.writeText(image.prompt);
    toast({
      title: 'Prompt Copied',
      description: 'The prompt has been copied to your clipboard',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleLike = async () => {
    if (!image) return;
    
    try {
      await saveFeedback(id, 1);
      setImage({ ...image, feedback: 1 });
      toast({
        title: 'Feedback Saved',
        description: 'Your feedback has been saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save feedback',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleGenerateVariations = async () => {
    if (!image) return;
    
    setLoadingVariations(true);
    try {
      const results = await generateVariations({
        image: image.image_data,
        prompt: prompt,
        num_variations: 4,
      });
      
      setVariations(results);
      toast({
        title: 'Variations Generated',
        description: 'Your image variations have been generated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate variations',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingVariations(false);
    }
  };
  
  // Function to format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  if (loading) {
    return (
      <Center py={12}>
        <Spinner size="xl" />
      </Center>
    );
  }
  
  if (!image) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4} align="stretch">
          <Button
            leftIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            alignSelf="flex-start"
          >
            Back
          </Button>
          <Center py={12}>
            <VStack spacing={4}>
              <Heading>Image Not Found</Heading>
              <Text>The requested image could not be found.</Text>
              <Button colorScheme="blue" onClick={() => navigate('/')}>
                Generate New Image
              </Button>
            </VStack>
          </Center>
        </VStack>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack>
          <Button
            leftIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Spacer />
          <Button
            colorScheme={image.feedback > 0 ? 'green' : 'gray'}
            leftIcon={<StarIcon />}
            onClick={handleLike}
            isDisabled={image.feedback > 0}
          >
            {image.feedback > 0 ? 'Liked' : 'Like This Image'}
          </Button>
        </HStack>
        
        <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
          <Box flex="1">
            <Box
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              bg="gray.700"
              borderColor={borderColor}
              position="relative"
            >
              <Image
                src={image.image_data}
                alt={image.prompt}
                width="100%"
                height="auto"
              />
              
              <HStack
                position="absolute"
                bottom="0"
                right="0"
                p={2}
                spacing={2}
              >
                <IconButton
                  icon={<DownloadIcon />}
                  aria-label="Download image"
                  onClick={handleDownload}
                  colorScheme="blue"
                  size="sm"
                />
              </HStack>
            </Box>
          </Box>
          
          <VStack flex="1" align="stretch" spacing={6}>
            <Box
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              bg={cardBg}
              borderColor={borderColor}
            >
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Image Details</Heading>
                
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">ID:</Text>
                  <Code>{image.id}</Code>
                
                  <Text fontWeight="bold">Prompt:</Text>
                  <Flex width="100%">
                    <Text flex="1" bg="gray.700" p={2} borderRadius="md">
                      {image.prompt}
                    </Text>
                    <IconButton
                      icon={<CopyIcon />}
                      aria-label="Copy prompt"
                      ml={2}
                      onClick={handleCopyPrompt}
                    />
                  </Flex>
                  
                  <Text fontWeight="bold">Created:</Text>
                  <Text>{formatDate(image.created_at)}</Text>
                  
                  <Text fontWeight="bold">Seed:</Text>
                  <Text>{image.seed}</Text>
                </VStack>
              </VStack>
            </Box>
            
            <Box
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              bg={cardBg}
              borderColor={borderColor}
            >
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Generate Variations</Heading>
                
                <FormControl>
                  <FormLabel>Prompt for Variations</FormLabel>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                  />
                </FormControl>
                
                <Button
                  leftIcon={<RepeatIcon />}
                  colorScheme="blue"
                  onClick={handleGenerateVariations}
                  isLoading={loadingVariations}
                  loadingText="Generating..."
                >
                  Generate Variations
                </Button>
              </VStack>
            </Box>
          </VStack>
        </Flex>
        
        {variations.length > 0 && (
          <VStack align="stretch" spacing={4}>
            <Divider />
            <Heading size="lg">Variations</Heading>
            
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6}>
              {variations.map((variation) => (
                <Box
                  key={variation.id}
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  bg={cardBg}
                  borderColor={borderColor}
                  cursor="pointer"
                  onClick={() => navigate(`/image/${variation.id}`)}
                  transition="transform 0.2s"
                  _hover={{ transform: 'scale(1.02)' }}
                >
                  <Box position="relative">
                    <Image
                      src={variation.image}
                      alt={variation.prompt}
                      width="100%"
                      height="auto"
                    />
                    <Badge
                      position="absolute"
                      bottom="2"
                      right="2"
                      colorScheme="blue"
                    >
                      #{variation.id}
                    </Badge>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default ImageDetails;