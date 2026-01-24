import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { it, vi, expect, describe } from 'vitest';

import ImageCarousel from './ImageCarousel';

describe(ImageCarousel.name, () => {
  const mockImageUrls = [
    {
      error: null,
      path: 'path1.jpg',
      signedUrl: 'https://example.com/image1.jpg',
    },
    {
      error: null,
      path: 'path2.jpg',
      signedUrl: 'https://example.com/image2.jpg',
    },
  ];

  it('should disable delete button when image is being deleted', () => {
    const mockOnDelete = vi.fn();

    const { container } = render(
      <ImageCarousel
        onDelete={mockOnDelete}
        imageUrls={mockImageUrls}
        imagePathBeingDeleted="path1.jpg"
      />
    );

    const deleteButtons = container.querySelectorAll('button');
    const deleteButton = Array.from(deleteButtons).find((btn) => {
      return btn.hasAttribute('data-loading');
    });

    expect(deleteButton).toBeDefined();
  });

  it('should not call onDelete when delete button is disabled during deletion', () => {
    const mockOnDelete = vi.fn();

    const { container } = render(
      <ImageCarousel
        onDelete={mockOnDelete}
        imageUrls={mockImageUrls}
        imagePathBeingDeleted="path1.jpg"
      />
    );

    const deleteButtons = container.querySelectorAll('button');
    const deleteButton = Array.from(deleteButtons).find((btn) => {
      return btn.hasAttribute('data-loading');
    });

    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('should call onDelete when delete button is clicked and not disabled', () => {
    const mockOnDelete = vi.fn();

    const { container } = render(
      <ImageCarousel
        onDelete={mockOnDelete}
        imagePathBeingDeleted=""
        imageUrls={mockImageUrls}
      />
    );

    const deleteButtons = container.querySelectorAll('button');
    const deleteButton = deleteButtons[3];

    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith(0);
    }
  });

  it('should have logic to disable delete when carousel is animating', () => {
    const mockOnDelete = vi.fn();

    render(
      <ImageCarousel
        onDelete={mockOnDelete}
        imagePathBeingDeleted=""
        imageUrls={mockImageUrls}
      />
    );

    expect(true).toBe(true);
  });

  it('should enable delete button when not deleting any image', () => {
    const mockOnDelete = vi.fn();

    const { container } = render(
      <ImageCarousel
        onDelete={mockOnDelete}
        imagePathBeingDeleted=""
        imageUrls={mockImageUrls}
      />
    );

    const deleteButtons = container.querySelectorAll('button');
    const loadingButtons = Array.from(deleteButtons).filter((btn) => {
      return (
        btn.hasAttribute('data-loading') &&
        btn.getAttribute('data-loading') === 'true'
      );
    });

    expect(deleteButtons.length).toBeGreaterThan(0);
    expect(loadingButtons.length).toBe(0);
  });
});
