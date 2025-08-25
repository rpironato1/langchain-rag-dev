/**
 * MCP PLAYWRIGHT - Form Tester
 * Autonomous form testing with comprehensive validation
 */

import { Page, Locator } from '@playwright/test';

export interface FormInfo {
  selector: string;
  fields: FieldInfo[];
  submitButton?: string;
  resetButton?: string;
  validation: boolean;
}

export interface FieldInfo {
  selector: string;
  type: string;
  name: string;
  required: boolean;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'email' | 'minLength' | 'maxLength' | 'pattern' | 'required';
  value?: string | number;
  message?: string;
}

export class FormTester {

  async detectForms(page: Page): Promise<FormInfo[]> {
    console.log('📝 Detectando formulários na página...');
    
    const forms = await page.evaluate(() => {
      const formElements = Array.from(document.querySelectorAll('form'));
      
      return formElements.map((form, index) => {
        const formSelector = form.id ? `#${form.id}` : `form:nth-child(${index + 1})`;
        
        // Detect fields within form
        const fieldElements = Array.from(form.querySelectorAll('input, textarea, select'));
        const fields = fieldElements.map(field => {
          const input = field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
          return {
            selector: input.id ? `#${input.id}` : `${formSelector} ${input.tagName.toLowerCase()}:nth-child(${Array.from(form.children).indexOf(input) + 1})`,
            type: input.type || input.tagName.toLowerCase(),
            name: input.name || input.id || '',
            required: input.hasAttribute('required'),
            validation: this.extractValidationRules(input)
          };
        });
        
        // Detect submit button
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], button:not([type])');
        const submitSelector = submitBtn ? 
          (submitBtn.id ? `#${submitBtn.id}` : `${formSelector} button[type="submit"], ${formSelector} input[type="submit"]`) : 
          undefined;
        
        // Detect reset button
        const resetBtn = form.querySelector('button[type="reset"], input[type="reset"]');
        const resetSelector = resetBtn ? 
          (resetBtn.id ? `#${resetBtn.id}` : `${formSelector} button[type="reset"], ${formSelector} input[type="reset"]`) : 
          undefined;
        
        return {
          selector: formSelector,
          fields,
          submitButton: submitSelector,
          resetButton: resetSelector,
          validation: form.hasAttribute('novalidate') ? false : true
        };
      });
    });
    
    console.log(`📝 ${forms.length} formulários detectados`);
    return forms;
  }

  private extractValidationRules(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): ValidationRule[] {
    const rules: ValidationRule[] = [];
    
    if (input.hasAttribute('required')) {
      rules.push({ type: 'required' });
    }
    
    if (input.type === 'email') {
      rules.push({ type: 'email' });
    }
    
    const minLength = input.getAttribute('minlength');
    if (minLength) {
      rules.push({ type: 'minLength', value: parseInt(minLength) });
    }
    
    const maxLength = input.getAttribute('maxlength');
    if (maxLength) {
      rules.push({ type: 'maxLength', value: parseInt(maxLength) });
    }
    
    const pattern = input.getAttribute('pattern');
    if (pattern) {
      rules.push({ type: 'pattern', value: pattern });
    }
    
    return rules;
  }

  async testEmptySubmission(page: Page, form: FormInfo): Promise<void> {
    console.log(`📝 Testando submissão vazia para: ${form.selector}`);
    
    // Clear all fields
    for (const field of form.fields) {
      const fieldElement = page.locator(field.selector);
      if (await fieldElement.count() > 0) {
        await fieldElement.clear();
      }
    }
    
    // Attempt to submit
    if (form.submitButton) {
      await page.locator(form.submitButton).click();
      
      // Wait for validation messages
      await page.waitForTimeout(1000);
      
      // Check for validation errors
      const hasErrors = await this.checkValidationErrors(page, form);
      
      if (form.fields.some(f => f.required) && !hasErrors) {
        console.warn('⚠ Formulário deveria ter validação para campos obrigatórios');
      }
    }
  }

  async testValidSubmission(page: Page, form: FormInfo): Promise<void> {
    console.log(`📝 Testando submissão válida para: ${form.selector}`);
    
    // Fill all fields with valid data
    for (const field of form.fields) {
      const fieldElement = page.locator(field.selector);
      if (await fieldElement.count() > 0) {
        const validValue = this.generateValidValue(field);
        
        if (field.type === 'select') {
          // Select first available option
          const options = await fieldElement.locator('option').count();
          if (options > 1) {
            await fieldElement.selectOption({ index: 1 });
          }
        } else if (field.type === 'checkbox' || field.type === 'radio') {
          await fieldElement.check();
        } else {
          await fieldElement.fill(validValue);
        }
      }
    }
    
    // Submit form
    if (form.submitButton) {
      await page.locator(form.submitButton).click();
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Check for success indicators
      await this.checkSubmissionSuccess(page);
    }
  }

  async testInvalidDataHandling(page: Page, form: FormInfo): Promise<void> {
    console.log(`📝 Testando dados inválidos para: ${form.selector}`);
    
    for (const field of form.fields) {
      const fieldElement = page.locator(field.selector);
      if (await fieldElement.count() > 0) {
        // Test with invalid data
        const invalidValue = this.generateInvalidValue(field);
        
        if (invalidValue && field.type !== 'select' && field.type !== 'checkbox' && field.type !== 'radio') {
          await fieldElement.fill(invalidValue);
          
          // Trigger validation (blur event)
          await fieldElement.blur();
          await page.waitForTimeout(500);
          
          // Check for field-specific validation
          await this.checkFieldValidation(page, field);
        }
      }
    }
  }

  async validateAriaLiveRegions(page: Page, form: FormInfo): Promise<void> {
    console.log(`♿ Validando ARIA live regions para: ${form.selector}`);
    
    const liveRegions = await page.evaluate((formSelector) => {
      const form = document.querySelector(formSelector);
      if (!form) return [];
      
      const regions = form.querySelectorAll('[aria-live], [role="alert"], [role="status"]');
      return Array.from(regions).map(region => ({
        tagName: region.tagName,
        ariaLive: region.getAttribute('aria-live'),
        role: region.getAttribute('role'),
        text: region.textContent?.trim() || ''
      }));
    }, form.selector);
    
    console.log(`♿ ${liveRegions.length} ARIA live regions encontradas`);
  }

  private async checkValidationErrors(page: Page, form: FormInfo): Promise<boolean> {
    const errorSelectors = [
      '.error',
      '.invalid',
      '[aria-invalid="true"]',
      '[role="alert"]',
      '.field-error',
      '.validation-error'
    ];
    
    for (const selector of errorSelectors) {
      const errorElements = await page.locator(`${form.selector} ${selector}`).count();
      if (errorElements > 0) {
        return true;
      }
    }
    
    // Check for HTML5 validation
    const hasHTML5Validation = await page.evaluate((formSelector) => {
      const form = document.querySelector(formSelector) as HTMLFormElement;
      return form ? !form.checkValidity() : false;
    }, form.selector);
    
    return hasHTML5Validation;
  }

  private async checkSubmissionSuccess(page: Page): Promise<boolean> {
    const successIndicators = [
      '.success',
      '.submitted',
      '[role="alert"]',
      '.toast',
      '.notification'
    ];
    
    for (const selector of successIndicators) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        return true;
      }
    }
    
    // Check URL change (redirect after submission)
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    return currentUrl.includes('success') || currentUrl.includes('thank-you') || currentUrl.includes('submitted');
  }

  private async checkFieldValidation(page: Page, field: FieldInfo): Promise<void> {
    const fieldElement = page.locator(field.selector);
    
    // Check aria-invalid
    const ariaInvalid = await fieldElement.getAttribute('aria-invalid');
    
    // Check for error classes
    const hasErrorClass = await fieldElement.evaluate(el => {
      return el.classList.contains('error') || 
             el.classList.contains('invalid') || 
             el.classList.contains('is-invalid');
    });
    
    // Check for nearby error messages
    const errorMessage = await page.locator(`${field.selector} + .error, ${field.selector} + .invalid`).count();
    
    if (ariaInvalid === 'true' || hasErrorClass || errorMessage > 0) {
      console.log(`✓ Validação detectada para campo: ${field.name}`);
    }
  }

  private generateValidValue(field: FieldInfo): string {
    switch (field.type) {
      case 'email':
        return 'test@example.com';
      case 'password':
        return 'SecurePassword123!';
      case 'tel':
        return '+1234567890';
      case 'url':
        return 'https://example.com';
      case 'number':
        return '42';
      case 'date':
        return '2024-01-15';
      case 'time':
        return '10:30';
      case 'text':
      case 'textarea':
        const minLength = field.validation?.find(r => r.type === 'minLength')?.value as number || 0;
        const baseText = 'Test input value';
        return minLength > baseText.length ? baseText.padEnd(minLength, ' text') : baseText;
      default:
        return 'Test Value';
    }
  }

  private generateInvalidValue(field: FieldInfo): string | null {
    switch (field.type) {
      case 'email':
        return 'invalid-email';
      case 'url':
        return 'not-a-url';
      case 'number':
        return 'not-a-number';
      case 'tel':
        return 'invalid-phone';
      case 'text':
      case 'textarea':
        const maxLength = field.validation?.find(r => r.type === 'maxLength')?.value as number;
        if (maxLength) {
          return 'x'.repeat(maxLength + 10);
        }
        const minLength = field.validation?.find(r => r.type === 'minLength')?.value as number;
        if (minLength && minLength > 1) {
          return 'x';
        }
        return null;
      default:
        return null;
    }
  }

  async testFormAccessibility(page: Page, form: FormInfo): Promise<{
    hasLabels: boolean;
    hasFieldsets: boolean;
    hasErrorMessages: boolean;
    keyboardNavigable: boolean;
  }> {
    console.log(`♿ Testando acessibilidade do formulário: ${form.selector}`);
    
    // Check labels
    const hasLabels = await page.evaluate((formSelector) => {
      const form = document.querySelector(formSelector);
      if (!form) return false;
      
      const inputs = form.querySelectorAll('input, textarea, select');
      let labeledInputs = 0;
      
      for (const input of inputs) {
        const id = input.id;
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledby = input.getAttribute('aria-labelledby');
        const label = id ? form.querySelector(`label[for="${id}"]`) : null;
        const wrappingLabel = input.closest('label');
        
        if (label || wrappingLabel || ariaLabel || ariaLabelledby) {
          labeledInputs++;
        }
      }
      
      return labeledInputs === inputs.length;
    }, form.selector);
    
    // Check fieldsets for grouped fields
    const hasFieldsets = await page.locator(`${form.selector} fieldset`).count() > 0;
    
    // Check error message accessibility
    const hasErrorMessages = await page.evaluate((formSelector) => {
      const form = document.querySelector(formSelector);
      if (!form) return false;
      
      const errorElements = form.querySelectorAll('[aria-live], [role="alert"], .error[id]');
      return errorElements.length > 0;
    }, form.selector);
    
    // Test keyboard navigation
    const keyboardNavigable = await this.testKeyboardNavigation(page, form);
    
    return {
      hasLabels,
      hasFieldsets,
      hasErrorMessages,
      keyboardNavigable
    };
  }

  private async testKeyboardNavigation(page: Page, form: FormInfo): Promise<boolean> {
    // Focus first field and tab through
    if (form.fields.length === 0) return true;
    
    const firstField = page.locator(form.fields[0].selector);
    await firstField.focus();
    
    let tabbedFields = 1;
    const maxTabs = Math.min(form.fields.length + 2, 10); // Include submit button
    
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      const focusedElement = await page.evaluate(() => {
        const active = document.activeElement;
        return active ? {
          tagName: active.tagName,
          type: (active as HTMLInputElement).type || '',
          id: active.id
        } : null;
      });
      
      if (focusedElement && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(focusedElement.tagName)) {
        tabbedFields++;
      }
    }
    
    return tabbedFields >= form.fields.length;
  }
}