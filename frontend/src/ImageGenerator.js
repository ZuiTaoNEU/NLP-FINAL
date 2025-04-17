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
} from '@chakra-ui/react';
import { DownloadIcon, StarIcon, InfoIcon, RepeatIcon } from '@chakra-ui/icons';
import { generateImage } from './api';

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

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt',
        status: 'error',
        duration: 3000,
        isClosable: true,
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
        title: 'Image Generated',
        description: 'Your image has been successfully generated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate image',
        status: 'error',
        duration: 5000,
        isClosable: true,
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
  };

  const handleViewDetails = () => {
    if (imageId) {
      navigate(`/image/${imageId}`);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Text to Image Generator
        </Heading>
        
        <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
          <Box flex="1">
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Text Prompt</FormLabel>
                <Textarea
                  placeholder="Enter a detailed description of the image you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  size="lg"
                  rows={5}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Negative Prompt</FormLabel>
                <Textarea
                  placeholder="Enter elements you want to exclude from the image..."
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  size="lg"
                  rows={3}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>
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
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </FormControl>
              
              <FormControl>
                <FormLabel>
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
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </FormControl>
              
              <FormControl>
                <FormLabel>Seed</FormLabel>
                <HStack>
                  <NumberInput
                    value={seed}
                    onChange={(valueString) => setSeed(valueString)}
                    min={0}
                    max={4294967295}
                    width="full"
                  >
                    <NumberInputField placeholder="Random seed" />
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
                    />
                  </Tooltip>
                </HStack>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Use the same seed to generate similar images
                </Text>
              </FormControl>
              
              <Button
                colorScheme="blue"
                size="lg"
                onClick={handleGenerateImage}
                isLoading={loading}
                loadingText="Generating..."
                mt={4}
              >
                Generate Image
              </Button>
            </VStack>
          </Box>
          
          <Box flex="1">
            <VStack spacing={4} align="stretch">
              <Box
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                bg="gray.700"
                height="512px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {generatedImage ? (
                  <Image
                    src={generatedImage}
                    alt="Generated image"
                    maxH="100%"
                    maxW="100%"
                    objectFit="contain"
                  />
                ) : (
                  <Text color="gray.400">
                    Your generated image will appear here
                  </Text>
                )}
              </Box>
              
              {generatedImage && (
                <HStack>
                  <Button
                    leftIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    colorScheme="green"
                  >
                    Download
                  </Button>
                  <Spacer />
                  <Button
                    leftIcon={<InfoIcon />}
                    onClick={handleViewDetails}
                    colorScheme="blue"
                  >
                    View Details
                  </Button>
                </HStack>
              )}
            </VStack>
          </Box>
        </Flex>
      </VStack>
    </Container>
  );
};

export default ImageGenerator;