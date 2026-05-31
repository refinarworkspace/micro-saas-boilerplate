/**
 * Color Converter unit test — verifies that editing one field keeps HEX / RGB /
 * HSL in sync, and that invalid input surfaces an error.
 */
import * as React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
import { ColorConverterClient } from '@/app/[locale]/tools/color-converter/ColorConverterClient';

describe('ColorConverterClient', () => {
  it('syncs RGB and HSL when the HEX field changes', () => {
    renderWithProviders(<ColorConverterClient />);

    const hex = screen.getByLabelText('HEX') as HTMLInputElement;
    const rgb = screen.getByLabelText('RGB') as HTMLInputElement;
    const hsl = screen.getByLabelText('HSL') as HTMLInputElement;

    fireEvent.change(hex, { target: { value: '#FF0000' } });

    expect(rgb.value).toBe('255, 0, 0');
    // Pure red -> hsl(0, 100%, 50%)
    expect(hsl.value).toBe('0, 100%, 50%');
  });

  it('syncs HEX when the RGB field changes', () => {
    renderWithProviders(<ColorConverterClient />);

    const hex = screen.getByLabelText('HEX') as HTMLInputElement;
    const rgb = screen.getByLabelText('RGB') as HTMLInputElement;

    fireEvent.change(rgb, { target: { value: '0, 128, 0' } });
    expect(hex.value).toBe('#008000');
  });

  it('flags an invalid HEX value', () => {
    renderWithProviders(<ColorConverterClient />);
    const hex = screen.getByLabelText('HEX') as HTMLInputElement;
    fireEvent.change(hex, { target: { value: 'nope' } });
    expect(screen.getByText('Invalid color value')).toBeInTheDocument();
  });
});
