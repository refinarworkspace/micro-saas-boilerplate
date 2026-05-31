/**
 * Image Compressor unit test — verifies the empty state and that selecting a
 * file advances the UI to the configuration step (quality slider).
 *
 * Canvas is not implemented in jsdom, so compression itself is not exercised;
 * we assert the upload -> configure transition driven by FileReader.
 */
import * as React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
import { ImageCompressorClient } from '@/app/[locale]/tools/image-compressor/ImageCompressorClient';

describe('ImageCompressorClient', () => {
  it('shows the empty state before any upload', () => {
    const { container } = renderWithProviders(<ImageCompressorClient />);
    expect(
      screen.getByText('Upload an image to get started')
    ).toBeInTheDocument();
    // The hidden file input from FileUploader is present.
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  it('advances to the quality controls after selecting a file', async () => {
    const { container } = renderWithProviders(<ImageCompressorClient />);
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(['(binary)'], 'photo.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    // FileReader.onload (async) sets the original preview and reveals controls.
    await waitFor(() => {
      expect(screen.getByText('Quality')).toBeInTheDocument();
    });
  });
});
