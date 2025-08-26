/**
 * E2E Tests for RAG (Retrieval Augmented Generation) Functionality
 * Tests document ingestion, retrieval, and chat with RAG
 */

import { test, expect, Page } from '@playwright/test';

test.describe('RAG Functionality E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/retrieval');
    await page.waitForLoadState('networkidle');
  });

  test('should load RAG page and display information card', async () => {
    // Check that the page loads correctly
    await expect(page.getByText('This template showcases how to perform retrieval')).toBeVisible();
    await expect(page.getByText('The chain works in two steps')).toBeVisible();
    
    // Verify placeholder text
    await expect(page.getByPlaceholder(/I've got a nose for finding/)).toBeVisible();
  });

  test('should display upload documents form', async () => {
    // Check for the upload form
    const uploadSection = page.locator('form').filter({ hasText: 'Upload' });
    await expect(uploadSection).toBeVisible();
    
    // Check for textarea and upload button
    const textarea = page.getByPlaceholder(/upload some text/i);
    await expect(textarea).toBeVisible();
    
    const uploadButton = page.getByRole('button', { name: /upload/i });
    await expect(uploadButton).toBeVisible();
  });

  test('should handle document upload successfully', async () => {
    const testDocument = `
# LangChain Documentation

## What is a Document Loader?

A document loader is a component in LangChain that helps you load and parse documents from various sources.
Document loaders can handle different file formats including:

- PDF files
- Text files
- CSV files
- HTML pages
- And many more

## How Document Loaders Work

Document loaders parse the input data and convert it into a standardized Document format that can be used by other LangChain components like text splitters and vector stores.

## Example Usage

\`\`\`python
from langchain.document_loaders import TextLoader

loader = TextLoader("path/to/document.txt")
documents = loader.load()
\`\`\`

This creates a document that can be processed by the RAG system.
    `;

    // Upload the test document
    const textarea = page.getByPlaceholder(/upload some text/i);
    await textarea.fill(testDocument);
    
    const uploadButton = page.getByRole('button', { name: /upload/i });
    await uploadButton.click();
    
    // Wait for upload to complete (should show success or hide the upload form)
    await page.waitForTimeout(2000);
    
    // Verify upload succeeded (can be shown by success message or form clearing)
    const textareaValue = await textarea.inputValue();
    expect(textareaValue).toBe(''); // Form should be cleared after successful upload
  });

  test('should perform RAG chat after document upload', async () => {
    // First upload a document
    const testDocument = `
# Document Loader Guide

A document loader in LangChain is a utility that loads data from various sources.
Document loaders support many formats like PDF, CSV, HTML, and plain text.
They convert raw data into Document objects that can be processed by other components.
    `;

    const textarea = page.getByPlaceholder(/upload some text/i);
    await textarea.fill(testDocument);
    
    const uploadButton = page.getByRole('button', { name: /upload/i });
    await uploadButton.click();
    await page.waitForTimeout(2000);

    // Now test the chat functionality
    const chatInput = page.getByPlaceholder(/I've got a nose for finding/);
    await chatInput.fill('What is a document loader?');
    
    const sendButton = page.getByRole('button', { name: 'Send' });
    await sendButton.click();

    // Wait for the AI response
    await page.waitForTimeout(5000);

    // Check that a response was generated
    const messages = page.locator('[class*="message"], [class*="bubble"]').or(
      page.locator('div').filter({ hasText: /document loader/i })
    );
    
    // Should have at least the user message and AI response
    const messageCount = await messages.count();
    expect(messageCount).toBeGreaterThan(0);

    // The response should mention document loaders based on our uploaded content
    const responseText = await page.textContent('body');
    expect(responseText).toContain('document'); // Should contain relevant response
  });

  test('should handle retrieval with context from uploaded documents', async () => {
    // Upload specific content about LangChain features
    const specificDocument = `
# LangChain Vector Stores

Vector stores are databases that store and retrieve vectors efficiently.
They enable semantic search by storing document embeddings.
Popular vector stores include:
- Chroma
- Pinecone  
- Supabase
- FAISS

Vector stores work with embeddings to find semantically similar content.
    `;

    const textarea = page.getByPlaceholder(/upload some text/i);
    await textarea.fill(specificDocument);
    
    const uploadButton = page.getByRole('button', { name: /upload/i });
    await uploadButton.click();
    await page.waitForTimeout(2000);

    // Ask a specific question about the uploaded content
    const chatInput = page.getByPlaceholder(/I've got a nose for finding/);
    await chatInput.fill('What vector stores are mentioned?');
    
    const sendButton = page.getByRole('button', { name: 'Send' });
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(5000);

    // The response should include information from our uploaded document
    const pageContent = await page.textContent('body');
    
    // Check that the response contains vector store names from our document
    const hasRelevantResponse = 
      pageContent?.includes('Chroma') ||
      pageContent?.includes('Pinecone') ||
      pageContent?.includes('Supabase') ||
      pageContent?.includes('vector store');
    
    expect(hasRelevantResponse).toBeTruthy();
  });

  test('should handle empty queries gracefully', async () => {
    const chatInput = page.getByPlaceholder(/I've got a nose for finding/);
    
    // Try to send empty message
    const sendButton = page.getByRole('button', { name: 'Send' });
    
    // Send button should be disabled when input is empty
    await expect(sendButton).toBeDisabled();
    
    // Fill with just spaces
    await chatInput.fill('   ');
    await expect(sendButton).toBeDisabled();
  });

  test('should show loading state during chat', async () => {
    // Upload a document first
    const textarea = page.getByPlaceholder(/upload some text/i);
    await textarea.fill('Test document for loading state verification.');
    
    const uploadButton = page.getByRole('button', { name: /upload/i });
    await uploadButton.click();
    await page.waitForTimeout(1000);

    const chatInput = page.getByPlaceholder(/I've got a nose for finding/);
    await chatInput.fill('Tell me about this document');
    
    const sendButton = page.getByRole('button', { name: 'Send' });
    await sendButton.click();

    // Check for loading indicator
    await expect(page.getByText(/thinking/i).or(page.locator('[class*="loading"], [class*="spinner"]'))).toBeVisible({ timeout: 2000 });
  });

  test('should maintain conversation history', async () => {
    // Upload a document
    const textarea = page.getByPlaceholder(/upload some text/i);
    await textarea.fill('This is a test document about conversation history in RAG systems.');
    
    const uploadButton = page.getByRole('button', { name: /upload/i });
    await uploadButton.click();
    await page.waitForTimeout(2000);

    // Send first message
    const chatInput = page.getByPlaceholder(/I've got a nose for finding/);
    await chatInput.fill('What is this document about?');
    
    let sendButton = page.getByRole('button', { name: 'Send' });
    await sendButton.click();
    await page.waitForTimeout(3000);

    // Send follow-up message that references previous context
    await chatInput.fill('Can you tell me more about that?');
    sendButton = page.getByRole('button', { name: 'Send' });
    await sendButton.click();
    await page.waitForTimeout(3000);

    // Check that both messages are visible in the conversation
    const allMessages = page.locator('div').filter({ hasText: /What is this document|Can you tell me more/ });
    const messageCount = await allMessages.count();
    expect(messageCount).toBeGreaterThanOrEqual(2);
  });

  test('should handle large document uploads', async () => {
    // Create a larger test document
    const largeDocument = Array(50).fill(`
# Section about Document Processing

This section covers how LangChain processes documents efficiently.
Document processing involves several steps:
1. Loading the document
2. Splitting into chunks
3. Creating embeddings
4. Storing in vector database
5. Retrieving relevant chunks during queries

This process ensures that large documents can be searched effectively.
    `).join('\n');

    const textarea = page.getByPlaceholder(/upload some text/i);
    await textarea.fill(largeDocument);
    
    const uploadButton = page.getByRole('button', { name: /upload/i });
    await uploadButton.click();
    
    // Wait longer for large document processing
    await page.waitForTimeout(5000);
    
    // Verify upload completed
    const textareaValue = await textarea.inputValue();
    expect(textareaValue).toBe('');

    // Test retrieval from large document
    const chatInput = page.getByPlaceholder(/I've got a nose for finding/);
    await chatInput.fill('How does document processing work?');
    
    const sendButton = page.getByRole('button', { name: 'Send' });
    await sendButton.click();
    await page.waitForTimeout(5000);

    // Should be able to retrieve relevant information
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('document');
  });
});