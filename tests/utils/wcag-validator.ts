/**
 * MCP PLAYWRIGHT - WCAG 2.1 AA Validator
 * Autonomous WCAG compliance validation with comprehensive testing
 */

import { Page } from '@playwright/test';

export interface WCAGResult {
  criterion: string;
  passed: boolean;
  score: number;
  details: string;
  recommendations?: string[];
}

export interface ColorContrastResult {
  contrastRatio: number;
  passed: boolean;
  details: string;
}

export class WCAGValidator {

  async executeWCAGCompliance(page: Page): Promise<{
    overallScore: number;
    results: WCAGResult[];
  }> {
    console.log('♿ Iniciando validação WCAG 2.1 AA...');
    
    const results: WCAGResult[] = [];
    
    // WCAG 2.1 AA Criteria Tests
    results.push(await this.validateImageAltText(page));
    results.push(await this.validateColorContrast(page));
    results.push(await this.validateKeyboardAccessible(page));
    results.push(await this.validateFocusOrder(page));
    results.push(await this.validatePageLanguage(page));
    results.push(await this.validateARIAImplementation(page));
    results.push(await this.validateHeadingStructure(page));
    results.push(await this.validateFormLabels(page));
    results.push(await this.validateLinkPurpose(page));
    results.push(await this.validateErrorIdentification(page));
    
    const passedTests = results.filter(r => r.passed).length;
    const overallScore = (passedTests / results.length) * 100;
    
    console.log(`♿ WCAG Score: ${overallScore.toFixed(1)}% (${passedTests}/${results.length})`);
    
    return { overallScore, results };
  }

  async validateImageAltText(page: Page): Promise<WCAGResult> {
    const images = await page.$$('img');
    let totalImages = images.length;
    let imagesWithAlt = 0;
    let decorativeImages = 0;
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      const ariaHidden = await img.getAttribute('aria-hidden');
      
      if (role === 'presentation' || ariaHidden === 'true' || alt === '') {
        decorativeImages++;
      } else if (alt && alt.trim().length > 0) {
        imagesWithAlt++;
      }
    }
    
    const meaningfulImages = totalImages - decorativeImages;
    const passed = meaningfulImages === 0 || imagesWithAlt === meaningfulImages;
    const score = meaningfulImages === 0 ? 100 : (imagesWithAlt / meaningfulImages) * 100;
    
    return {
      criterion: '1.1.1 - Non-text Content',
      passed,
      score,
      details: `${imagesWithAlt}/${meaningfulImages} meaningful images have alt text`,
      recommendations: !passed ? [
        'Add descriptive alt text to all meaningful images',
        'Use alt="" or role="presentation" for decorative images'
      ] : undefined
    };
  }

  async validateColorContrast(page: Page): Promise<ColorContrastResult> {
    // Inject contrast calculation script
    const contrastResults = await page.evaluate(() => {
      function getContrast(rgb1: number[], rgb2: number[]): number {
        const getLuminance = (rgb: number[]) => {
          const [r, g, b] = rgb.map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        
        const lum1 = getLuminance(rgb1);
        const lum2 = getLuminance(rgb2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
      }
      
      function parseRGB(color: string): number[] {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
      }
      
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label');
      let minContrast = Infinity;
      let totalElements = 0;
      let passedElements = 0;
      
      for (const element of textElements) {
        const styles = window.getComputedStyle(element);
        const textColor = styles.color;
        const bgColor = styles.backgroundColor;
        
        if (textColor && bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          const textRGB = parseRGB(textColor);
          const bgRGB = parseRGB(bgColor);
          const contrast = getContrast(textRGB, bgRGB);
          
          totalElements++;
          if (contrast >= 4.5) passedElements++;
          minContrast = Math.min(minContrast, contrast);
        }
      }
      
      return {
        minContrast: minContrast === Infinity ? 4.5 : minContrast,
        totalElements,
        passedElements
      };
    });
    
    const passed = contrastResults.minContrast >= 4.5;
    
    return {
      contrastRatio: contrastResults.minContrast,
      passed,
      details: `Min contrast: ${contrastResults.minContrast.toFixed(2)}:1 (${contrastResults.passedElements}/${contrastResults.totalElements} elements pass)`
    };
  }

  async validateKeyboardAccessible(page: Page): Promise<WCAGResult> {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    const focusableElements = await page.evaluate(() => {
      const focusable = document.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(focusable).length;
    });
    
    let tabbedElements = 0;
    let currentElement = await page.evaluate(() => document.activeElement?.tagName);
    
    // Tab through elements
    for (let i = 0; i < Math.min(focusableElements, 20); i++) {
      await page.keyboard.press('Tab');
      const newElement = await page.evaluate(() => document.activeElement?.tagName);
      if (newElement && newElement !== currentElement) {
        tabbedElements++;
        currentElement = newElement;
      }
    }
    
    const passed = tabbedElements >= Math.min(focusableElements - 1, 5);
    const score = focusableElements === 0 ? 100 : (tabbedElements / Math.min(focusableElements, 20)) * 100;
    
    return {
      criterion: '2.1.1 - Keyboard Navigation',
      passed,
      score,
      details: `${tabbedElements} elements accessible via keyboard of ${focusableElements} total`
    };
  }

  async validateFocusOrder(page: Page): Promise<WCAGResult> {
    const focusOrder = await page.evaluate(() => {
      const focusable = Array.from(document.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      ));
      
      return focusable.map((el, index) => {
        const rect = el.getBoundingClientRect();
        return {
          index,
          tagName: el.tagName,
          top: rect.top,
          left: rect.left,
          tabIndex: (el as HTMLElement).tabIndex
        };
      });
    });
    
    // Check logical focus order (top to bottom, left to right generally)
    let logicalOrder = true;
    for (let i = 1; i < focusOrder.length; i++) {
      const prev = focusOrder[i - 1];
      const curr = focusOrder[i];
      
      // Allow some tolerance for same-line elements
      if (curr.top < prev.top - 10) {
        logicalOrder = false;
        break;
      }
    }
    
    return {
      criterion: '2.4.3 - Focus Order',
      passed: logicalOrder,
      score: logicalOrder ? 100 : 70,
      details: `Focus order ${logicalOrder ? 'follows' : 'does not follow'} logical sequence`
    };
  }

  async validatePageLanguage(page: Page): Promise<WCAGResult> {
    const langAttr = await page.getAttribute('html', 'lang');
    const passed = !!langAttr && langAttr.length >= 2;
    
    return {
      criterion: '3.1.1 - Language of Page',
      passed,
      score: passed ? 100 : 0,
      details: `HTML lang attribute: ${langAttr || 'missing'}`
    };
  }

  async validateARIAImplementation(page: Page): Promise<WCAGResult> {
    const ariaElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
      let validAria = 0;
      let totalAria = elements.length;
      
      for (const el of elements) {
        const role = el.getAttribute('role');
        const label = el.getAttribute('aria-label');
        const labelledby = el.getAttribute('aria-labelledby');
        const describedby = el.getAttribute('aria-describedby');
        
        // Basic validation - has meaningful attributes
        if ((role && role.length > 0) || 
            (label && label.trim().length > 0) ||
            (labelledby && document.getElementById(labelledby)) ||
            (describedby && document.getElementById(describedby))) {
          validAria++;
        }
      }
      
      return { validAria, totalAria };
    });
    
    const passed = ariaElements.totalAria === 0 || 
                   (ariaElements.validAria / ariaElements.totalAria) >= 0.8;
    const score = ariaElements.totalAria === 0 ? 100 : 
                  (ariaElements.validAria / ariaElements.totalAria) * 100;
    
    return {
      criterion: '4.1.2 - Name, Role, Value',
      passed,
      score,
      details: `${ariaElements.validAria}/${ariaElements.totalAria} ARIA elements properly implemented`
    };
  }

  async validateHeadingStructure(page: Page): Promise<WCAGResult> {
    const headings = await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return h.map(el => ({
        level: parseInt(el.tagName.substring(1)),
        text: el.textContent?.trim() || ''
      }));
    });
    
    let structureValid = true;
    let hasH1 = headings.some(h => h.level === 1);
    
    // Check for logical heading progression
    for (let i = 1; i < headings.length; i++) {
      const diff = headings[i].level - headings[i - 1].level;
      if (diff > 1) {
        structureValid = false;
        break;
      }
    }
    
    const passed = hasH1 && structureValid;
    const score = (hasH1 ? 50 : 0) + (structureValid ? 50 : 0);
    
    return {
      criterion: '1.3.1 - Heading Structure',
      passed,
      score,
      details: `${headings.length} headings found, H1: ${hasH1}, Structure: ${structureValid}`
    };
  }

  async validateFormLabels(page: Page): Promise<WCAGResult> {
    const formElements = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, textarea, select');
      let totalInputs = inputs.length;
      let labeledInputs = 0;
      
      for (const input of inputs) {
        const id = input.id;
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledby = input.getAttribute('aria-labelledby');
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const wrappingLabel = input.closest('label');
        
        if (label || wrappingLabel || ariaLabel || ariaLabelledby) {
          labeledInputs++;
        }
      }
      
      return { totalInputs, labeledInputs };
    });
    
    const passed = formElements.totalInputs === 0 || 
                   formElements.labeledInputs === formElements.totalInputs;
    const score = formElements.totalInputs === 0 ? 100 : 
                  (formElements.labeledInputs / formElements.totalInputs) * 100;
    
    return {
      criterion: '3.3.2 - Labels or Instructions',
      passed,
      score,
      details: `${formElements.labeledInputs}/${formElements.totalInputs} form elements have labels`
    };
  }

  async validateLinkPurpose(page: Page): Promise<WCAGResult> {
    const links = await page.evaluate(() => {
      const linkElements = document.querySelectorAll('a[href]');
      let totalLinks = linkElements.length;
      let descriptiveLinks = 0;
      
      for (const link of linkElements) {
        const text = link.textContent?.trim() || '';
        const ariaLabel = link.getAttribute('aria-label');
        const title = link.getAttribute('title');
        
        // Check if link has meaningful text (not just "click here", "read more", etc.)
        const meaningfulText = text.length > 2 && 
                              !['click here', 'read more', 'more', 'link'].includes(text.toLowerCase());
        
        if (meaningfulText || ariaLabel || title) {
          descriptiveLinks++;
        }
      }
      
      return { totalLinks, descriptiveLinks };
    });
    
    const passed = links.totalLinks === 0 || 
                   (links.descriptiveLinks / links.totalLinks) >= 0.8;
    const score = links.totalLinks === 0 ? 100 : 
                  (links.descriptiveLinks / links.totalLinks) * 100;
    
    return {
      criterion: '2.4.4 - Link Purpose',
      passed,
      score,
      details: `${links.descriptiveLinks}/${links.totalLinks} links have descriptive text`
    };
  }

  async validateErrorIdentification(page: Page): Promise<WCAGResult> {
    // This is a basic check - in real scenarios, would need form interaction
    const errorElements = await page.evaluate(() => {
      const errors = document.querySelectorAll('[aria-invalid="true"], .error, .invalid, [role="alert"]');
      const errorMessages = document.querySelectorAll('.error-message, .field-error, [aria-live="polite"]');
      
      return {
        errorFields: errors.length,
        errorMessages: errorMessages.length
      };
    });
    
    // If no error fields, assume passing; if error fields exist, check for error messages
    const passed = errorElements.errorFields === 0 || 
                   errorElements.errorMessages >= errorElements.errorFields;
    const score = passed ? 100 : 70;
    
    return {
      criterion: '3.3.1 - Error Identification',
      passed,
      score,
      details: `${errorElements.errorFields} error fields, ${errorElements.errorMessages} error messages`
    };
  }

  async validateBasicWCAG(page: Page): Promise<{ score: number; passed: boolean }> {
    const quickTests = await Promise.all([
      this.validateImageAltText(page),
      this.validatePageLanguage(page),
      this.validateFormLabels(page)
    ]);
    
    const avgScore = quickTests.reduce((sum, test) => sum + test.score, 0) / quickTests.length;
    
    return {
      score: avgScore,
      passed: avgScore >= 80
    };
  }
}