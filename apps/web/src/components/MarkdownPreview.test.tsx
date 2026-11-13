import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownPreview } from './MarkdownPreview';

describe('MarkdownPreview', () => {
  it('renders markdown headings and bold text as HTML', () => {
    render(<MarkdownPreview content={'# Hello\n\nsome **bold** text'} />);
    expect(screen.getByRole('heading', { name: 'Hello' })).toBeInTheDocument();
    expect(screen.getByText('bold').tagName).toBe('STRONG');
  });

  it('shows a placeholder when empty', () => {
    render(<MarkdownPreview content="   " />);
    expect(screen.getByText(/nothing to preview/i)).toBeInTheDocument();
  });
});
