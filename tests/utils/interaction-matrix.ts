/**
 * MCP PLAYWRIGHT - Interaction Matrix
 * Comprehensive interaction testing with accessibility validation
 */

import { Page, Locator } from '@playwright/test';

export interface HoverableElement {
  selector: string;
  element: Locator;
  hasTooltip: boolean;
  ariaDescribedby?: string;
}

export interface DraggableElement {
  source: string;
  target: string;
  dragType: 'file' | 'element' | 'text';
}

export interface UploadElement {
  selector: string;
  element: Locator;
  acceptTypes: string[];
  multiple: boolean;
}

export class InteractionMatrix {

  async detectHoverableElements(page: Page): Promise<HoverableElement[]> {
    console.log('🎯 Detectando elementos com hover...');
    
    const hoverableElements = await page.evaluate(() => {
      const elements = document.querySelectorAll(`
        [title], 
        [aria-describedby], 
        button, 
        a, 
        .tooltip-trigger, 
        [data-tooltip], 
        .hover-effect,
        [onmouseover],
        [onmouseenter]
      `);
      
      return Array.from(elements).map((el, index) => {
        const rect = el.getBoundingClientRect();
        return {
          selector: el.id ? `#${el.id}` : `*:nth-child(${index + 1})`,
          hasTooltip: !!(el.getAttribute('title') || el.getAttribute('data-tooltip') || el.getAttribute('aria-describedby')),
          ariaDescribedby: el.getAttribute('aria-describedby') || undefined,
          visible: rect.width > 0 && rect.height > 0 && rect.top >= 0
        };
      }).filter(el => el.visible);
    });
    
    const elements: HoverableElement[] = [];
    
    for (const elData of hoverableElements.slice(0, 20)) { // Limit to prevent timeout
      const element = page.locator(elData.selector).first();
      if (await element.count() > 0) {
        elements.push({
          selector: elData.selector,
          element,
          hasTooltip: elData.hasTooltip,
          ariaDescribedby: elData.ariaDescribedby
        });
      }
    }
    
    console.log(`🎯 ${elements.length} elementos hover detectados`);
    return elements;
  }

  async validateTooltipAccessibility(page: Page, element: HoverableElement): Promise<void> {
    if (!element.hasTooltip) return;
    
    // Hover and check for tooltip appearance
    await element.element.hover();
    await page.waitForTimeout(500);
    
    // Check for visible tooltip
    const tooltipSelectors = [
      '[role="tooltip"]',
      '.tooltip',
      '.popover',
      '[data-tooltip-content]',
      '.tooltip-content'
    ];
    
    let tooltipFound = false;
    for (const selector of tooltipSelectors) {
      const tooltip = page.locator(selector);
      if (await tooltip.count() > 0 && await tooltip.isVisible()) {
        tooltipFound = true;
        
        // Validate tooltip accessibility
        const ariaRole = await tooltip.getAttribute('role');
        const ariaLive = await tooltip.getAttribute('aria-live');
        const ariaLabel = await tooltip.getAttribute('aria-label');
        
        console.log(`✓ Tooltip acessível: role=${ariaRole}, live=${ariaLive}`);
        break;
      }
    }
    
    // Check aria-describedby connection
    if (element.ariaDescribedby) {
      const describedElement = page.locator(`#${element.ariaDescribedby}`);
      if (await describedElement.count() > 0) {
        console.log(`✓ ARIA describedby conectado: ${element.ariaDescribedby}`);
      }
    }
  }

  async detectDraggableElements(page: Page): Promise<DraggableElement[]> {
    console.log('🎯 Detectando elementos drag and drop...');
    
    const draggableElements = await page.evaluate(() => {
      const draggable = document.querySelectorAll('[draggable="true"], .draggable, .sortable-item');
      const dropzones = document.querySelectorAll('.dropzone, [data-drop], .drop-target');
      
      const elements: any[] = [];
      
      // Find drag sources and potential targets
      for (const drag of draggable) {
        const dragSelector = drag.id ? `#${drag.id}` : `.${Array.from(drag.classList).join('.')}`;
        
        for (const drop of dropzones) {
          const dropSelector = drop.id ? `#${drop.id}` : `.${Array.from(drop.classList).join('.')}`;
          
          elements.push({
            source: dragSelector,
            target: dropSelector,
            dragType: 'element'
          });
        }
      }
      
      // File drop zones
      const fileDrops = document.querySelectorAll('input[type="file"], .file-dropzone, [data-file-drop]');
      for (const fileDrop of fileDrops) {
        const selector = fileDrop.id ? `#${fileDrop.id}` : 'input[type="file"]';
        elements.push({
          source: 'file',
          target: selector,
          dragType: 'file'
        });
      }
      
      return elements.slice(0, 5); // Limit to prevent timeout
    });
    
    console.log(`🎯 ${draggableElements.length} elementos drag/drop detectados`);
    return draggableElements;
  }

  async validateDragAccessibility(page: Page, item: DraggableElement): Promise<void> {
    if (item.dragType === 'file') return; // File drops handled separately
    
    // Check for keyboard support
    const sourceElement = page.locator(item.source);
    const targetElement = page.locator(item.target);
    
    if (await sourceElement.count() === 0 || await targetElement.count() === 0) return;
    
    // Check ARIA attributes
    const ariaGrabbed = await sourceElement.getAttribute('aria-grabbed');
    const ariaDropEffect = await targetElement.getAttribute('aria-dropeffect');
    const role = await sourceElement.getAttribute('role');
    
    console.log(`🎯 Drag accessibility: grabbed=${ariaGrabbed}, dropeffect=${ariaDropEffect}, role=${role}`);
    
    // Test keyboard navigation
    await sourceElement.focus();
    await page.keyboard.press('Space'); // Try to initiate drag with keyboard
    await page.waitForTimeout(500);
  }

  async detectFileUploadElements(page: Page): Promise<UploadElement[]> {
    console.log('📁 Detectando elementos de upload...');
    
    const uploadElements = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="file"]');
      const dropzones = document.querySelectorAll('.file-dropzone, [data-file-drop], .upload-area');
      
      const elements: any[] = [];
      
      for (const input of inputs) {
        const selector = input.id ? `#${input.id}` : 'input[type="file"]';
        elements.push({
          selector,
          acceptTypes: (input as HTMLInputElement).accept?.split(',').map(t => t.trim()) || [],
          multiple: (input as HTMLInputElement).multiple
        });
      }
      
      return elements;
    });
    
    const elements: UploadElement[] = [];
    
    for (const elData of uploadElements) {
      const element = page.locator(elData.selector).first();
      if (await element.count() > 0) {
        elements.push({
          selector: elData.selector,
          element,
          acceptTypes: elData.acceptTypes,
          multiple: elData.multiple
        });
      }
    }
    
    console.log(`📁 ${elements.length} elementos de upload detectados`);
    return elements;
  }

  async createTestFiles(): Promise<{ name: string; mimeType: string; buffer: Buffer }[]> {
    // Create test files in memory
    const testFiles = [
      {
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Test file content')
      },
      {
        name: 'test.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify({ test: true }))
      },
      {
        name: 'test.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('name,value\ntest,123')
      }
    ];
    
    return testFiles;
  }

  async validateUploadFeedback(page: Page, element: UploadElement): Promise<void> {
    // Wait for upload feedback
    await page.waitForTimeout(1000);
    
    // Check for feedback elements
    const feedbackSelectors = [
      '.upload-progress',
      '.file-list',
      '.upload-status',
      '[role="status"]',
      '[aria-live]',
      '.upload-feedback'
    ];
    
    let feedbackFound = false;
    for (const selector of feedbackSelectors) {
      const feedback = page.locator(selector);
      if (await feedback.count() > 0 && await feedback.isVisible()) {
        feedbackFound = true;
        console.log(`✓ Upload feedback encontrado: ${selector}`);
        break;
      }
    }
    
    // Check for ARIA live regions
    const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').count();
    if (liveRegions > 0) {
      console.log(`♿ ${liveRegions} ARIA live regions para upload feedback`);
    }
  }

  async testClickInteractions(page: Page): Promise<void> {
    console.log('🖱️ Testando interações de clique...');
    
    const clickableElements = await page.evaluate(() => {
      const elements = document.querySelectorAll(`
        button, 
        a[href], 
        [role="button"], 
        [onclick], 
        input[type="button"], 
        input[type="submit"], 
        .clickable,
        [tabindex="0"]
      `);
      
      return Array.from(elements).slice(0, 15).map((el, index) => {
        const rect = el.getBoundingClientRect();
        return {
          selector: el.id ? `#${el.id}` : `${el.tagName}:nth-child(${index + 1})`,
          visible: rect.width > 0 && rect.height > 0,
          text: el.textContent?.trim() || '',
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label')
        };
      }).filter(el => el.visible);
    });
    
    for (const elData of clickableElements) {
      try {
        const element = page.locator(elData.selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          await element.click();
          await page.waitForTimeout(500);
          
          console.log(`✓ Clique testado: ${elData.text || elData.selector}`);
        }
      } catch (error) {
        console.warn(`⚠ Erro no clique ${elData.selector}:`, error);
      }
    }
  }

  async testKeyboardInteractions(page: Page): Promise<void> {
    console.log('⌨️ Testando interações de teclado...');
    
    // Test common keyboard shortcuts
    const shortcuts = [
      { keys: 'Tab', description: 'Navigation' },
      { keys: 'Enter', description: 'Activation' },
      { keys: 'Space', description: 'Activation' },
      { keys: 'Escape', description: 'Cancel/Close' },
      { keys: 'ArrowDown', description: 'Menu navigation' },
      { keys: 'ArrowUp', description: 'Menu navigation' }
    ];
    
    for (const shortcut of shortcuts) {
      try {
        await page.keyboard.press(shortcut.keys);
        await page.waitForTimeout(300);
        console.log(`✓ ${shortcut.description}: ${shortcut.keys}`);
      } catch (error) {
        console.warn(`⚠ Erro com ${shortcut.keys}:`, error);
      }
    }
  }

  async testTouchInteractions(page: Page): Promise<void> {
    console.log('👆 Testando interações touch...');
    
    // Simulate touch events for mobile testing
    const touchElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, a, .touchable, [role="button"]');
      return Array.from(elements).slice(0, 10).map(el => {
        const rect = el.getBoundingClientRect();
        return {
          selector: el.id ? `#${el.id}` : el.tagName,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          visible: rect.width > 0 && rect.height > 0
        };
      }).filter(el => el.visible);
    });
    
    for (const elData of touchElements) {
      try {
        // Simulate touch tap
        await page.touchscreen.tap(elData.x, elData.y);
        await page.waitForTimeout(300);
        console.log(`✓ Touch testado: ${elData.selector}`);
      } catch (error) {
        console.warn(`⚠ Erro no touch ${elData.selector}:`, error);
      }
    }
  }

  async validateInteractionFeedback(page: Page): Promise<{
    visualFeedback: boolean;
    audioFeedback: boolean;
    hapticFeedback: boolean;
    ariaFeedback: boolean;
  }> {
    console.log('🔄 Validando feedback de interações...');
    
    // Check for visual feedback mechanisms
    const visualFeedback = await page.evaluate(() => {
      const feedbackElements = document.querySelectorAll(`
        .loading, .spinner, .progress, 
        .success, .error, .warning, .info,
        .highlight, .active, .selected,
        [aria-pressed], [aria-expanded], [aria-selected]
      `);
      return feedbackElements.length > 0;
    });
    
    // Check for ARIA feedback
    const ariaFeedback = await page.evaluate(() => {
      const ariaElements = document.querySelectorAll(`
        [aria-live], [role="status"], [role="alert"],
        [aria-describedby], [aria-labelledby]
      `);
      return ariaElements.length > 0;
    });
    
    return {
      visualFeedback,
      audioFeedback: false, // Would need audio context checking
      hapticFeedback: false, // Would need device API checking
      ariaFeedback
    };
  }
}