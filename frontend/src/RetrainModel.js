import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  HStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Card,
  CardBody,
  SimpleGrid,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { InfoIcon, RepeatIcon } from '@chakra-ui/icons';
import { retrain, getTrainingStatus } from './api';

const RetrainModel = () => {
  const [learningRate, setLearningRate] = useState(0.00001);
  const [numEpochs, setNumEpochs] = useState(5);
  const [batchSize, setBatchSize] = useState(1);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  
  const toast = useToast();
  
  useEffect(() => {
    // Polling for training status
    let interval;
    
    if (isTraining) {
      interval = setInterval(async () => {
        try {
          const status = await getTrainingStatus();
          setTrainingStatus(status);
          
          if (status && status.progress) {
            setProgress(status.progress);
          }
          
          if (status && status.completed) {
            setIsTraining(false);
            clearInterval(interval);
            
            toast({
              title: 'Training Complete',
              description: 'The model has been successfully retrained',
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
          }
        } catch (error) {
          console.error('Error fetching training status:', error);
        }
      }, 5000); // Poll every 5 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTraining, toast]);
  
  const handleStartTraining = async () => {
    setIsTraining(true);
    setProgress(0);
    
    try {
      const result = await retrain({
        learning_rate: learningRate,
        num_epochs: numEpochs,
        batch_size: batchSize,
      });
      
      setTrainingStatus(result);
      
      toast({
        title: 'Training Started',
        description: 'The model retraining process has begun. This may take a while.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      setIsTraining(false);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to start training',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const formatLearningRate = (val) => {
    return `${val.toExponential(5)}`;
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Retrain AI Model
        </Heading>
        
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>About Model Retraining</AlertTitle>
            <AlertDescription>
              This page allows you to retrain the Stable Diffusion model with the images stored in the database.
              The retraining process fine-tunes only the U-Net component, while keeping the text and image encoders frozen.
              This helps the model generate better images based on your previous prompts and feedback.
            </AlertDescription>
          </Box>
        </Alert>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>
                  Learning Rate
                  <Tooltip label="Controls how quickly the model adapts to new data. Lower values are generally more stable.">
                    <InfoIcon ml={1} boxSize={3} />
                  </Tooltip>
                </StatLabel>
                <StatNumber>{formatLearningRate(learningRate)}</StatNumber>
                <FormControl mt={4}>
                  <Slider
                    min={0.000001}
                    max={0.0001}
                    step={0.000001}
                    value={learningRate}
                    onChange={setLearningRate}
                    isDisabled={isTraining}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </FormControl>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>
                  Number of Epochs
                  <Tooltip label="How many times the model will process the entire dataset. More epochs can lead to better results but takes longer.">
                    <InfoIcon ml={1} boxSize={3} />
                  </Tooltip>
                </StatLabel>
                <StatNumber>{numEpochs}</StatNumber>
                <FormControl mt={4}>
                  <NumberInput
                    min={1}
                    max={20}
                    value={numEpochs}
                    onChange={(valueString) => setNumEpochs(parseInt(valueString))}
                    isDisabled={isTraining}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>
                  Batch Size
                  <Tooltip label="Number of images processed at once. Larger batches can improve training efficiency but require more memory.">
                    <InfoIcon ml={1} boxSize={3} />
                  </Tooltip>
                </StatLabel>
                <StatNumber>{batchSize}</StatNumber>
                <FormControl mt={4}>
                  <NumberInput
                    min={1}
                    max={8}
                    value={batchSize}
                    onChange={(valueString) => setBatchSize(parseInt(valueString))}
                    isDisabled={isTraining}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
        
        {isTraining && (
          <Box borderWidth="1px" borderRadius="lg" p={4}>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold">Training Progress</Text>
              <Progress value={progress} size="sm" colorScheme="blue" />
              <HStack>
                <Text>Epoch: {trainingStatus?.current_epoch || 0}/{numEpochs}</Text>
                <Text>Loss: {trainingStatus?.current_loss?.toFixed(4) || 'N/A'}</Text>
              </HStack>
            </VStack>
          </Box>
        )}
        
        <Button
          leftIcon={<RepeatIcon />}
          colorScheme="blue"
          size="lg"
          onClick={handleStartTraining}
          isLoading={isTraining}
          loadingText="Training..."
          isDisabled={isTraining}
        >
          Start Training
        </Button>
      </VStack>
    </Container>
  );
};

export default RetrainModel;