import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Textarea,
  VStack,
  HStack,
  Image,
  useToast,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Flex,
  Spacer,
  IconButton,
  Tooltip,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { 
  DownloadIcon, 
  StarIcon, 
  InfoIcon, 
  RepeatIcon,
  CopyIcon,
  EditIcon,
  SettingsIcon,
  ChevronRightIcon,
  MoonIcon
} from '@chakra-ui/icons';
import { generateImage } from './api';

// Example prompts to inspire users
const EXAMPLE_PROMPTS = [
  "A serene mountain landscape at dawn with misty valleys and golden light",
  "A cyberpunk cityscape with neon lights and flying vehicles",
  "A magical forest with glowing mushrooms and fairy lights",
  "An underwater scene with coral reefs and tropical fish",
  "A futuristic laboratory with holographic displays and robots"
];

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [inferenceSteps, setInferenceSteps] = useState(50);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [seed, setSeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imageId, setImageId] = useState(null);
  
  const toast = useToast();
  const navigate = useNavigate();
  
  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('brand.500', 'brand.300');
  
  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Missing Input',
        description: 'Please enter a text prompt to generate an image',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setLoading(true);
    
    try {
      const seedValue = seed ? parseInt(seed) : undefined;
      
      const result = await generateImage({
        prompt,
        negative_prompt: negativePrompt,
        num_inference_steps: inferenceSteps,
        guidance_scale: guidanceScale,
        seed: seedValue,
      });
      
      setGeneratedImage(result.image);
      setImageId(result.id);
      setSeed(result.seed.toString());
      
      toast({
        title: 'Success!',
        description: 'Your image has been generated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate image. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 4294967295).toString());
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Image Downloaded',
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'bottom-right',
    });
  };

  const handleViewDetails = () => {
    if (imageId) {
      navigate(`/image/${imageId}`);
    }
  };
  
  const handleUseExamplePrompt = (examplePrompt) => {
    setPrompt(examplePrompt);
  };

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" pb={4}>
          <Heading 
            as="h1" 
            size="xl" 
            mb={3}
            bgGradient="linear(to-r, brand.500, accent.500)"
            bgClip="text"
          >
            Text to Image Generator
          </Heading>
          <Text color="gray.500" maxW="container.md" mx="auto">
            Describe your imagination in words, and our AI will bring it to life.
          </Text>
        </Box>
        
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          gap={8}
          align="stretch"
        >
          <Box flex="1">
            <Card 
              bg={cardBg} 
              borderColor={borderColor} 
              borderWidth="1px"
              boxShadow="sm"
              h="100%"
            >
              <CardHeader pb={0}>
                <Tabs colorScheme="brand" size="md" variant="line">
                  <TabList>
                    <Tab fontWeight="medium">
                      <EditIcon mr={2} />
                      Creation
                    </Tab>
                    <Tab fontWeight="medium">
                      <SettingsIcon mr={2} />
                      Advanced
                    </Tab>
                  </TabList>
                  
                  <TabPanels>
                    <TabPanel>
                      <VStack spacing={5} align="stretch">
                        <FormControl isRequired>
                          <FormLabel fontWeight="medium">
                            Text Prompt
                          </FormLabel>
                          <Textarea
                            placeholder="Describe the image you want to generate in detail..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            size="lg"
                            rows={6}
                            borderColor={borderColor}
                            focusBorderColor="brand.500"
                            resize="vertical"
                          />
                          
                          <Box mt={3}>
                            <Text fontSize="sm" fontWeight="medium" mb={2}>
                              <InfoIcon mr={1} color="accent.500" />
                              Need inspiration? Try one of these:
                            </Text>
                            <Flex wrap="wrap" gap={2}>
                              {EXAMPLE_PROMPTS.map((examplePrompt, index) => (
                                <Badge
                                  key={index}
                                  px={2}
                                  py={1}
                                  borderRadius="full"
                                  colorScheme="accent"
                                  cursor="pointer"
                                  _hover={{ opacity: 0.8 }}
                                  onClick={() => handleUseExamplePrompt(examplePrompt)}
                                >
                                  {examplePrompt.slice(0, 25)}...
                                </Badge>
                              ))}
                            </Flex>
                          </Box>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel fontWeight="medium">
                            Negative Prompt
                          </FormLabel>
                          <Textarea
                            placeholder="Specify elements you want to avoid in the generated image..."
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            size="lg"
                            rows={3}
                            borderColor={borderColor}
                            focusBorderColor="brand.500"
                          />
                        </FormControl>
                        
                        <Button
                          colorScheme="brand"
                          size="lg"
                          onClick={handleGenerateImage}
                          isLoading={loading}
                          loadingText="Generating..."
                          leftIcon={<StarIcon />}
                          mt={3}
                          boxShadow="md"
                          _hover={{
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg',
                          }}
                          transition="all 0.2s"
                        >
                          Generate Image
                        </Button>
                      </VStack>
                    </TabPanel>
                    
                    <TabPanel>
                      <VStack spacing={5} align="stretch">
                        <FormControl>
                          <FormLabel fontWeight="medium">
                            Inference Steps: {inferenceSteps}
                            <Tooltip label="Higher values generally produce better quality images but take longer to generate">
                              <IconButton
                                aria-label="Info"
                                icon={<InfoIcon />}
                                size="xs"
                                ml={2}
                                variant="ghost"
                              />
                            </Tooltip>
                          </FormLabel>
                          <Slider
                            min={20}
                            max={100}
                            step={1}
                            value={inferenceSteps}
                            onChange={setInferenceSteps}
                            colorScheme="brand"
                          >
                            <SliderTrack>
                              <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb boxSize={6} boxShadow="md" />
                          </Slider>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel fontWeight="medium">
                            Guidance Scale: {guidanceScale}
                            <Tooltip label="Controls how closely the image follows your prompt. Higher values = more faithful to prompt but potentially less creative">
                              <IconButton
                                aria-label="Info"
                                icon={<InfoIcon />}
                                size="xs"
                                ml={2}
                                variant="ghost"
                              />
                            </Tooltip>
                          </FormLabel>
                          <Slider
                            min={1}
                            max={20}
                            step={0.1}
                            value={guidanceScale}
                            onChange={setGuidanceScale}
                            colorScheme="brand"
                          >
                            <SliderTrack>
                              <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb boxSize={6} boxShadow="md" />
                          </Slider>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel fontWeight="medium">Seed</FormLabel>
                          <HStack>
                            <NumberInput
                              value={seed}
                              onChange={(valueString) => setSeed(valueString)}
                              min={0}
                              max={4294967295}
                              width="full"
                              focusBorderColor="brand.500"
                            >
                              <NumberInputField 
                                placeholder="Random seed"
                                borderColor={borderColor}
                              />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                            <Tooltip label="Generate random seed">
                              <IconButton
                                aria-label="Random seed"
                                icon={<RepeatIcon />}
                                onClick={handleRandomSeed}
                                colorScheme="brand"
                              />
                            </Tooltip>
                          </HStack>
                          <Text fontSize="sm" color="gray.500" mt={1}>
                            Use the same seed to generate similar images
                          </Text>
                        </FormControl>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardHeader>
            </Card>
          </Box>
          
          <Box flex="1">
            <Card 
              bg={cardBg} 
              borderColor={borderColor} 
              borderWidth="1px"
              boxShadow="sm"
              h="100%"
              display="flex"
              flexDirection="column"
            >
              <CardBody flex="1" display="flex" flexDirection="column">
                <Box
                  borderRadius="md"
                  overflow="hidden"
                  bg="gray.700"
                  h={{ base: "300px", md: "400px", lg: "512px" }}
                  flex="1"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  position="relative"
                >
                  {loading ? (
                    <Skeleton height="100%" width="100%" />
                  ) : generatedImage ? (
                    <Image
                      src={generatedImage}
                      alt="Generated image"
                      maxH="100%"
                      maxW="100%"
                      objectFit="contain"
                    />
                  ) : (
                    <VStack spacing={4} p={6} textAlign="center">
                      <MoonIcon boxSize={12} color="gray.500" />
                      <Text color="gray.400" fontWeight="medium">
                        Your generated image will appear here
                      </Text>
                      <Text color="gray.500" fontSize="sm">
                        Enter a text prompt and click "Generate Image" to create
                      </Text>
                    </VStack>
                  )}
                </Box>
              </CardBody>
              
              {generatedImage && (
                <CardFooter borderTop="1px" borderColor={borderColor} p={4}>
                  <HStack width="100%" spacing={4}>
                    <Button
                      leftIcon={<DownloadIcon />}
                      onClick={handleDownload}
                      colorScheme="green"
                      size="md"
                      variant="solid"
                    >
                      Download
                    </Button>
                    <Spacer />
                    <Button
                      rightIcon={<ChevronRightIcon />}
                      onClick={handleViewDetails}
                      colorScheme="brand"
                      size="md"
                      variant="outline"
                    >
                      View Details
                    </Button>
                  </HStack>
                </CardFooter>
              )}
            </Card>
          </Box>
        </Flex>
      </VStack>
    </Container>
  );
};

export default ImageGenerator;