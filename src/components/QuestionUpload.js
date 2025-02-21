/* global pdfjsLib */
import React, { useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { ThemeProvider } from '@emotion/react';
import { theme, mixins } from '../theme';
import LoadingSpinner from './LoadingSpinner';
import { createWorker } from 'tesseract.js';

const OPENROUTER_API_KEY = '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';

const UploadContainer = styled.div`
  ${mixins.card};
  padding: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[6]};
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.label`
  ${mixins.button};
  background-color: ${theme.colors.primary};
  color: white;
  padding: ${theme.spacing[3]} ${theme.spacing[6]};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[4]};
  transition: ${theme.transitions.default};

  &:hover {
    background-color: ${theme.colors.primaryHover};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.danger};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing[4]};
  padding: ${theme.spacing[3]};
  background: ${theme.colors.danger}10;
  border-radius: ${theme.borderRadius.md};
  border-left: 4px solid ${theme.colors.danger};
`;

const PreviewContainer = styled.div`
  margin-top: ${theme.spacing[4]};
  text-align: left;
  padding: ${theme.spacing[4]};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
  max-height: 400px;
  overflow-y: auto;
`;

const PreviewQuestion = styled.div`
  margin-bottom: ${theme.spacing[4]};
  padding: ${theme.spacing[4]};
  background: white;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};

  &:last-child {
    margin-bottom: 0;
  }
`;

const QuestionText = styled.div`
  font-weight: 500;
  margin-bottom: ${theme.spacing[3]};
`;

const ChoicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const Choice = styled.div`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  background: ${props => props.isCorrect ? `${theme.colors.success}20` : theme.colors.background};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${props => props.isCorrect ? theme.colors.success : theme.colors.border};
`;

const StatusMessage = styled.div`
  margin-top: ${theme.spacing[4]};
  padding: ${theme.spacing[3]};
  background: ${theme.colors.info}10;
  border-radius: ${theme.borderRadius.md};
  border-left: 4px solid ${theme.colors.info};
  color: ${theme.colors.info};
`;

const cleanText = (text) => {
  return text
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .replace(/\( ([A-D]) \)/g, '($1)')  // Fix spacing in option markers
    .replace(/\s+,/g, ',')  // Remove spaces before commas
    .replace(/\s+\./g, '.')  // Remove spaces before periods
    // Handle superscript numbers and special characters
    .replace(/(\d)\s*\^\s*(\d)/g, '$1²')  // Convert ^2 to proper superscript
    .replace(/(\d)\s*\^\s*3/g, '$1³')     // Convert ^3 to proper superscript
    .replace(/\bm\s*2\b/g, 'm²')          // Convert m2 to m²
    .replace(/\bm\s*3\b/g, 'm³')          // Convert m3 to m³
    .replace(/\bcm\s*2\b/g, 'cm²')        // Convert cm2 to cm²
    .replace(/\bcm\s*3\b/g, 'cm³')        // Convert cm3 to cm³
    .replace(/\bft\s*2\b/g, 'ft²')        // Convert ft2 to ft²
    .replace(/\bft\s*3\b/g, 'ft³')        // Convert ft3 to ft³
    .replace(/sq\.\s*m/g, 'm²')           // Convert sq. m to m²
    .replace(/cu\.\s*m/g, 'm³')           // Convert cu. m to m³
    .replace(/sq\.\s*ft/g, 'ft²')         // Convert sq. ft to ft²
    .replace(/cu\.\s*ft/g, 'ft³')         // Convert cu. ft to ft³
    .replace(/(\d+)\s*°/g, '$1°')         // Fix degree symbol spacing
    .replace(/π/g, 'π')                   // Normalize pi symbol
    .replace(/['']/g, "'")                // Normalize apostrophes
    .replace(/[""]/g, '"')                // Normalize quotes
    .replace(/\s*-\s*/g, '-')             // Fix hyphen spacing
    .replace(/\s*×\s*/g, '×')             // Fix multiplication symbol spacing
    .replace(/\s*÷\s*/g, '÷')             // Fix division symbol spacing
    .replace(/\s*±\s*/g, '±')             // Fix plus-minus symbol spacing
    .replace(/\s*=\s*/g, ' = ')           // Fix equals symbol spacing
    .replace(/\s*≈\s*/g, ' ≈ ')           // Fix approximately equals spacing
    .replace(/\s*≠\s*/g, ' ≠ ')           // Fix not equals spacing
    .replace(/\s*≤\s*/g, ' ≤ ')           // Fix less than or equals spacing
    .replace(/\s*≥\s*/g, ' ≥ ')           // Fix greater than or equals spacing
    .replace(/\s*<\s*/g, ' < ')           // Fix less than spacing
    .replace(/\s*>\s*/g, ' > ')           // Fix greater than spacing
    .replace(/\(\s+/g, '(')               // Fix opening parenthesis spacing
    .replace(/\s+\)/g, ')')               // Fix closing parenthesis spacing
    .replace(/\[\s+/g, '[')               // Fix opening bracket spacing
    .replace(/\s+\]/g, ']')               // Fix closing bracket spacing
    .replace(/\{\s+/g, '{')               // Fix opening brace spacing
    .replace(/\s+\}/g, '}')               // Fix closing brace spacing
    .trim();
};

const normalizeUnitText = (text) => {
  return text
    // First standardize the format of measurements
    .replace(/(\d*)\s*m\s*2\b/g, '$1m²')  // Convert m2 to m²
    .replace(/(\d*)\s*m\s*3\b/g, '$1m³')  // Convert m3 to m³
    .replace(/(\d*)\s*m\s*\^\s*2\b/g, '$1m²')  // Convert m^2 to m²
    .replace(/(\d*)\s*m\s*\^\s*3\b/g, '$1m³')  // Convert m^3 to m³
    .replace(/\b2\s*m\b/g, 'm²')  // Convert standalone 2m to m²
    .replace(/\b3\s*m\b/g, 'm³')  // Convert standalone 3m to m³
    .replace(/\bm2\b/g, 'm²')  // Convert m2 to m²
    .replace(/\bm3\b/g, 'm³')  // Convert m3 to m³
    .replace(/\b(\d*)\s*sq\.\s*m\b/g, '$1m²')  // Convert sq. m to m²
    .replace(/\b(\d*)\s*cu\.\s*m\b/g, '$1m³')  // Convert cu. m to m³
    // Then normalize spacing and casing
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
};

const normalizeQuestions = (questions) => {
  return questions.map(q => ({
    ...q,
    question: cleanText(q.question),
    choices: q.choices.map(cleanText),
    correctAnswer: cleanText(q.correctAnswer)
  }));
};

const convertPdfPageToImage = async (pdfDoc, pageNum) => {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;
  
  return canvas.toDataURL('image/png');
};

const extractTextFromImage = async (imageData) => {
  try {
    const worker = await createWorker();
    
    // Initialize worker with English language
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // Recognize text from image
    const { data: { text } } = await worker.recognize(imageData);
    
    // Terminate worker to free up resources
    await worker.terminate();
    
    return text;
  } catch (error) {
    console.error('Error in Tesseract OCR:', error);
    throw new Error('Failed to extract text from image: ' + error.message);
  }
};

const extractTextFromPdf = async (file) => {
  try {
    if (typeof window.pdfjsLib === 'undefined') {
      throw new Error('PDF.js library not loaded. Please refresh the page and try again.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    
    if (pdf.numPages === 0) {
      throw new Error('The PDF file appears to be empty');
    }

    let fullText = '';
    let emptyPages = 0;
    
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        // Convert PDF page to image
        const imageData = await convertPdfPageToImage(pdf, i);
        
        // Extract text from image using Tesseract OCR
        const pageText = await extractTextFromImage(imageData);
        
        if (!pageText.trim()) {
          console.warn(`Page ${i} appears to be empty or contains no readable text`);
          emptyPages++;
          continue;
        }

        fullText += pageText + '\n\n';
      } catch (error) {
        console.error(`Error processing page ${i}:`, error);
        continue;
      }
    }

    // Clean up the text
    fullText = fullText
      .replace(/\n{3,}/g, '\n\n') // Replace multiple line breaks with double line break
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n +/g, '\n') // Remove leading spaces after line breaks
      .replace(/['']/g, "'") // Normalize apostrophes
      .replace(/[""]/g, '"') // Normalize quotes
      .trim();

    if (!fullText.trim()) {
      throw new Error('No readable text found in the PDF');
    }

    if (emptyPages === pdf.numPages) {
      throw new Error('No readable text found in any page of the PDF');
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

const parseQuestions = (text) => {
  const questions = [];
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  let currentQuestion = null;
  let questionBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for question start (number followed by dot or parenthesis)
    const questionStart = line.match(/^(?:\d{1,3}[\.\)]|\([0-9]+\))\s*(.+)/);
    if (questionStart) {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.choices.length > 0) {
        questions.push(currentQuestion);
      }

      // Start new question
      currentQuestion = {
        question: questionStart[1].trim(),
        choices: [],
        correctAnswer: '',
        rawText: line
      };
      questionBuffer = [];
      continue;
    }

    if (!currentQuestion) continue;

    // Check for choices (A, B, C, D) or (a, b, c, d)
    const choiceMatch = line.match(/^(?:[A-Da-d][\.\)]|\([A-Da-d]\))\s*(.+)/);
    if (choiceMatch) {
      const choiceText = choiceMatch[1].trim();
      currentQuestion.choices.push(choiceText);
      currentQuestion.rawText += '\n' + line;
      continue;
    }

    // Check for answer indicators
    const answerMatch = line.match(/^(?:Answer|Ans|Correct|Key):\s*([A-Da-d])/i);
    if (answerMatch) {
      currentQuestion.correctAnswer = answerMatch[1].toUpperCase();
      continue;
    }

    // If line contains a single letter A-D, it might be the answer
    const singleLetterAnswer = line.match(/^[A-Da-d]$/);
    if (singleLetterAnswer) {
      currentQuestion.correctAnswer = line.toUpperCase();
      continue;
    }

    // Buffer other lines that might be part of the question
    questionBuffer.push(line);

    // If we've accumulated some lines and haven't found choices yet,
    // check if they form a multi-line question
    if (questionBuffer.length > 0 && currentQuestion.choices.length === 0) {
      currentQuestion.question += ' ' + questionBuffer.join(' ');
      questionBuffer = [];
    }
  }

  // Add the last question if it exists
  if (currentQuestion && currentQuestion.choices.length > 0) {
    questions.push(currentQuestion);
  }

  // Filter valid questions and normalize them
  return questions
    .filter(q => 
      q.question && 
      q.choices.length === 4 && 
      q.correctAnswer
    )
    .map(q => ({
      ...q,
      question: cleanText(q.question),
      choices: q.choices.map(cleanText),
      correctAnswer: q.correctAnswer.toUpperCase()
    }));
};

const convertPdfToQuestions = async (pdfText) => {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'MCQ Quiz App'
        },
        body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: `You are a precise MCQ question extractor. Your task is to extract questions exactly as they appear in the text, preserving all formatting and identifying the correct answer. Pay special attention to:
1. Each question must be clearly separated and self-contained
2. Each question must have exactly 4 distinct choices (A, B, C, D)
3. Do not mix content from different questions
4. Ensure the correct answer matches one of the choices exactly
5. Remove any page headers, footers, or navigation elements
6. Clean up any line breaks or formatting issues that merge different questions`
          },
          {
            role: 'user',
            content: `Extract multiple choice questions from the following text. Each question must be properly separated and formatted.

Rules:
1. Each question must have:
   - Question text (exactly as written)
   - Exactly 4 distinct choices labeled (A), (B), (C), (D)
   - One correct answer that EXACTLY matches one of the choices
   - No mixed content from other questions

2. Clean and format:
   - Remove page headers, footers, and navigation text
   - Separate merged questions
   - Fix any line breaks that combine different questions
   - Ensure each choice is complete and distinct

3. DO NOT:
   - Mix content from different questions
   - Include incomplete choices
   - Add explanations
   - Modify the actual content

4. Format as JSON array:
[
  {
    "question": "Complete question text",
                         "choices": [
      "Complete choice A",
      "Complete choice B",
      "Complete choice C",
      "Complete choice D"
    ],
    "correctAnswer": "Exact matching choice text",
    "rawText": "Original complete question text with all choices"
  }
]

Here's the text to process:

${pdfText}`
          }
        ],
        temperature: 0.1,
        max_tokens: 8192,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || 'Failed to convert PDF to questions'}`);
      }

      const data = await response.json();
    const questionsText = data.choices[0].message.content;
    
    try {
      const jsonMatch = questionsText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (!jsonMatch) {
        console.error('Raw response:', questionsText);
        throw new Error('No valid JSON found in response');
      }

      const jsonText = jsonMatch[0];
      console.log('Extracted JSON:', jsonText);
      
      let questions = JSON.parse(jsonText);

      // Validate the questions
      if (!Array.isArray(questions) || !questions.length) {
        throw new Error('No valid questions found in the response');
      }

      questions = questions.filter(q => {
        const isValid = (
          q.question &&
          Array.isArray(q.choices) &&
          q.choices.length === 4 &&
          q.correctAnswer &&
          q.rawText
        );
        if (!isValid) {
          console.warn('Invalid question:', q);
        }
        return isValid;
      });

      if (!questions.length) {
        throw new Error('No valid questions found after filtering');
      }

      return questions;
    } catch (e) {
      console.error('Parse error:', e);
      console.error('Raw response:', questionsText);
      throw new Error('Failed to parse questions: ' + e.message);
      }
    } catch (error) {
      console.error('Error in convertPdfToQuestions:', error);
      throw error;
    }
  };

const QuestionUpload = ({ onQuestionsUpload }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState([]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setPreview([]);
    
    try {
      const text = await extractTextFromPdf(file);
      const questions = parseQuestions(text);
      
      if (questions.length === 0) {
        throw new Error('No valid questions found in the PDF');
      }
      
      setPreview(questions);
      onQuestionsUpload(questions);
    } catch (err) {
      setError(err.message);
      console.error('Error processing PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <UploadContainer>
        <UploadButton>
          <FileInput
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
          />
          {loading ? 'Processing...' : 'Upload PDF'}
        </UploadButton>
        
        {loading && <LoadingSpinner />}
        
        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}
        
        {preview.length > 0 && (
          <>
            <StatusMessage>
              Successfully extracted {preview.length} questions
            </StatusMessage>
            <PreviewContainer>
              {preview.map((q, index) => (
                <PreviewQuestion key={index}>
                  <QuestionText>{index + 1}. {q.question}</QuestionText>
                  <ChoicesList>
                    {q.choices.map((choice, choiceIndex) => (
                      <Choice
                        key={choiceIndex}
                        isCorrect={String.fromCharCode(65 + choiceIndex) === q.correctAnswer}
                      >
                        {String.fromCharCode(65 + choiceIndex)}) {choice}
                      </Choice>
                    ))}
                  </ChoicesList>
                </PreviewQuestion>
              ))}
            </PreviewContainer>
          </>
        )}
      </UploadContainer>
    </ThemeProvider>
  );
};

export default QuestionUpload; 