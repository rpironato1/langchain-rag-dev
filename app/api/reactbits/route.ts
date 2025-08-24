import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export const runtime = "edge";

// Component templates and patterns
const COMPONENT_TEMPLATES = {
  "button": {
    description: "A customizable button component with variants",
    template: `import React from 'react';
import { cn } from '@/utils/cn';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
            'border border-input hover:bg-accent hover:text-accent-foreground': variant === 'outline',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
            'underline-offset-4 hover:underline text-primary': variant === 'link',
          },
          {
            'h-10 py-2 px-4': size === 'default',
            'h-9 px-3 rounded-md': size === 'sm',
            'h-11 px-8 rounded-md': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };`
  },
  "card": {
    description: "A flexible card component with header, content, and footer",
    template: `import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };`
  },
  "form": {
    description: "A form component with validation and field management",
    template: `import React from 'react';
import { cn } from '@/utils/cn';

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, error, required, children, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
);
FormField.displayName = 'FormField';

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { FormField, Input };`
  }
};

const REACTBITS_TEMPLATE = `You are an expert React component generator specializing in creating high-quality, reusable components using modern React patterns, TypeScript, Tailwind CSS, and Shadcn UI design principles.

When generating components:
- Use TypeScript with proper type definitions
- Follow React best practices (hooks, composition, accessibility)
- Apply Tailwind CSS for styling with responsive design
- Include proper prop interfaces and forwardRef when needed
- Add JSDoc comments for complex props
- Consider accessibility (ARIA attributes, semantic HTML)
- Implement proper error boundaries and loading states
- Use cn() utility for conditional class names
- Follow Shadcn UI patterns and design tokens

Available templates: {templates}

User request: {input}

Generate a complete, production-ready React component:`;

export async function GET() {
  return NextResponse.json({
    description: "ReactBits - AI-powered React component generation",
    templates: Object.keys(COMPONENT_TEMPLATES),
    templateDetails: Object.entries(COMPONENT_TEMPLATES).map(([name, template]) => ({
      name,
      description: template.description
    })),
    usage: "POST with { prompt: string, template?: string }"
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, template } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    
    // If a specific template is requested, provide it
    if (template && COMPONENT_TEMPLATES[template as keyof typeof COMPONENT_TEMPLATES]) {
      const templateData = COMPONENT_TEMPLATES[template as keyof typeof COMPONENT_TEMPLATES];
      return NextResponse.json({
        type: "template",
        name: template,
        description: templateData.description,
        code: templateData.template,
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate custom component using AI
    const promptTemplate = PromptTemplate.fromTemplate(REACTBITS_TEMPLATE);
    
    const model = new ChatOpenAI({
      temperature: 0.3,
      model: "gpt-4o-mini",
    });
    
    const chain = promptTemplate.pipe(model);
    
    const result = await chain.invoke({
      templates: Object.keys(COMPONENT_TEMPLATES).join(", "),
      input: prompt
    });
    
    return NextResponse.json({
      type: "generated",
      prompt,
      code: result.content,
      timestamp: new Date().toISOString(),
      suggestions: [
        "Add prop validation with PropTypes or Zod",
        "Consider adding unit tests with Jest and React Testing Library",
        "Add Storybook stories for component documentation",
        "Implement dark mode support with CSS variables"
      ]
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate component", details: error.message },
      { status: 500 }
    );
  }
}