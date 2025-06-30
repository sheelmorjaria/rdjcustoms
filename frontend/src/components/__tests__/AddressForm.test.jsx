import React from 'react';
import { render, screen, waitFor, userEvent } from '../../test/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddressForm from '../AddressForm';

describe('AddressForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isLoading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render form with all required fields', () => {
      render(<AddressForm {...defaultProps} />);

      expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Company')).toBeInTheDocument();
      expect(screen.getByLabelText('Address Line 1 *')).toBeInTheDocument();
      expect(screen.getByLabelText('Address Line 2')).toBeInTheDocument();
      expect(screen.getByLabelText('City *')).toBeInTheDocument();
      expect(screen.getByLabelText('State/Province *')).toBeInTheDocument();
      expect(screen.getByLabelText('Postal Code *')).toBeInTheDocument();
      expect(screen.getByLabelText('Country *')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(screen.getByLabelText(/Set as Default Shipping Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Set as Default Billing Address/i)).toBeInTheDocument();
      
      expect(screen.getByRole('button', { name: /save address/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should populate form with initial data when provided', () => {
      const initialData = {
        fullName: 'John Doe',
        company: 'Acme Corp',
        addressLine1: '123 Main St',
        addressLine2: 'Apt 4B',
        city: 'New York',
        stateProvince: 'NY',
        postalCode: '10001',
        country: 'United States',
        phoneNumber: '+1 (555) 123-4567',
        setAsDefaultShipping: true,
        setAsDefaultBilling: false
      };

      render(<AddressForm {...defaultProps} initialData={initialData} />);

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Apt 4B')).toBeInTheDocument();
      expect(screen.getByDisplayValue('New York')).toBeInTheDocument();
      expect(screen.getByDisplayValue('NY')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('United States')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1 (555) 123-4567')).toBeInTheDocument();
      expect(screen.getByLabelText(/Set as Default Shipping Address/i)).toBeChecked();
      expect(screen.getByLabelText(/Set as Default Billing Address/i)).not.toBeChecked();
    });

    it('should show edit mode button text when editing', () => {
      render(<AddressForm {...defaultProps} isEdit={true} />);

      expect(screen.getByRole('button', { name: /update address/i })).toBeInTheDocument();
    });

    it('should disable form when loading', () => {
      render(<AddressForm {...defaultProps} isLoading={true} />);

      expect(screen.getByLabelText('Full Name *')).toBeDisabled();
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });
  });

  describe('Country Dropdown', () => {
    it('should render country as dropdown with supported countries', () => {
      render(<AddressForm {...defaultProps} />);
      
      const countrySelect = screen.getByLabelText('Country *');
      expect(countrySelect.tagName).toBe('SELECT');
      
      // Check default option
      expect(screen.getByText('Select a country')).toBeInTheDocument();
      
      // Check some supported countries
      expect(screen.getByText('United Kingdom')).toBeInTheDocument();
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
      expect(screen.getByText('Germany')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields on submit', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /save address/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
        expect(screen.getByText('Address line 1 is required')).toBeInTheDocument();
        expect(screen.getByText('City is required')).toBeInTheDocument();
        expect(screen.getByText('State/Province is required')).toBeInTheDocument();
        expect(screen.getByText('Postal code is required')).toBeInTheDocument();
        expect(screen.getByText('Country is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate phone number format on blur', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      await user.type(phoneInput, 'invalid-phone');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
      });
    });

    it('should accept valid phone number formats', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const phoneInput = screen.getByLabelText('Phone Number');
      
      // Test various valid formats
      const validNumbers = [
        '+1 (555) 123-4567',
        '+44 20 7946 0958',
        '555-123-4567',
        '5551234567'
      ];

      for (const number of validNumbers) {
        await user.clear(phoneInput);
        await user.type(phoneInput, number);
        await user.tab();
        
        // Should not show error
        expect(screen.queryByText('Please enter a valid phone number')).not.toBeInTheDocument();
      }
    });

    it('should validate postal code format based on country', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const countrySelect = screen.getByLabelText('Country *');
      const postalCodeInput = screen.getByLabelText('Postal Code *');

      // Test UK postal code
      await user.selectOptions(countrySelect, 'United Kingdom');
      await user.type(postalCodeInput, '12345'); // Invalid UK format
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Invalid postal code format for United Kingdom')).toBeInTheDocument();
      });

      // Clear and test valid UK postal code
      await user.clear(postalCodeInput);
      await user.type(postalCodeInput, 'SW1A 1AA');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText('Invalid postal code format for United Kingdom')).not.toBeInTheDocument();
      });

      // Test US postal code
      await user.selectOptions(countrySelect, 'United States');
      await user.clear(postalCodeInput);
      await user.type(postalCodeInput, 'ABC123'); // Invalid US format
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Invalid postal code format for United States')).toBeInTheDocument();
      });

      // Clear and test valid US postal code
      await user.clear(postalCodeInput);
      await user.type(postalCodeInput, '10001');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText('Invalid postal code format for United States')).not.toBeInTheDocument();
      });
    });

    it('should revalidate postal code when country changes', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const countrySelect = screen.getByLabelText('Country *');
      const postalCodeInput = screen.getByLabelText('Postal Code *');

      // Enter a US postal code
      await user.selectOptions(countrySelect, 'United States');
      await user.type(postalCodeInput, '10001');
      await user.tab();

      // No error should show
      expect(screen.queryByText(/Invalid postal code format/)).not.toBeInTheDocument();

      // Change to UK - should show error as US format is invalid for UK
      await user.selectOptions(countrySelect, 'United Kingdom');

      await waitFor(() => {
        expect(screen.getByText('Invalid postal code format for United Kingdom')).toBeInTheDocument();
      });
    });

    it('should clear field errors when user starts typing', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      // Trigger validation errors
      const submitButton = screen.getByRole('button', { name: /save address/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
      });

      // Start typing in the field
      const fullNameInput = screen.getByLabelText('Full Name *');
      await user.type(fullNameInput, 'John');

      await waitFor(() => {
        expect(screen.queryByText('Full name is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      // Fill out all required fields
      await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
      await user.type(screen.getByLabelText('Company'), 'Acme Corp');
      await user.type(screen.getByLabelText('Address Line 1 *'), '123 Main St');
      await user.type(screen.getByLabelText('Address Line 2'), 'Apt 4B');
      await user.type(screen.getByLabelText('City *'), 'New York');
      await user.type(screen.getByLabelText('State/Province *'), 'NY');
      await user.type(screen.getByLabelText('Postal Code *'), '10001');
      await user.selectOptions(screen.getByLabelText('Country *'), 'United States');
      await user.type(screen.getByLabelText('Phone Number'), '+1 (555) 123-4567');
      await user.click(screen.getByLabelText(/Set as Default Shipping Address/i));

      const submitButton = screen.getByRole('button', { name: /save address/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          fullName: 'John Doe',
          company: 'Acme Corp',
          addressLine1: '123 Main St',
          addressLine2: 'Apt 4B',
          city: 'New York',
          stateProvince: 'NY',
          postalCode: '10001',
          country: 'United States',
          phoneNumber: '+1 (555) 123-4567',
          setAsDefaultShipping: true,
          setAsDefaultBilling: false
        });
      });
    });

    it('should submit form without optional fields', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      // Fill out only required fields
      await user.type(screen.getByLabelText('Full Name *'), 'Jane Smith');
      await user.type(screen.getByLabelText('Address Line 1 *'), '456 Oak Ave');
      await user.type(screen.getByLabelText('City *'), 'Los Angeles');
      await user.type(screen.getByLabelText('State/Province *'), 'CA');
      await user.type(screen.getByLabelText('Postal Code *'), '90210');
      await user.selectOptions(screen.getByLabelText('Country *'), 'United States');

      const submitButton = screen.getByRole('button', { name: /save address/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          fullName: 'Jane Smith',
          company: '',
          addressLine1: '456 Oak Ave',
          addressLine2: '',
          city: 'Los Angeles',
          stateProvince: 'CA',
          postalCode: '90210',
          country: 'United States',
          phoneNumber: '',
          setAsDefaultShipping: false,
          setAsDefaultBilling: false
        });
      });
    });

    it('should handle cancel button click', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should prevent submission when loading', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /saving/i });
      expect(submitButton).toBeDisabled();

      // Try to click anyway (should not trigger onSubmit)
      await user.click(submitButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Postal Code Validation Coverage', () => {
    it('should validate various country postal code formats', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const countrySelect = screen.getByLabelText('Country *');
      const postalCodeInput = screen.getByLabelText('Postal Code *');

      const testCases = [
        { country: 'Canada', valid: 'K1A 0B1', invalid: '12345' },
        { country: 'Germany', valid: '10115', invalid: 'ABC123' },
        { country: 'Netherlands', valid: '1234 AB', invalid: '12345' },
        { country: 'Australia', valid: '2000', invalid: '12345' },
      ];

      for (const testCase of testCases) {
        // Test invalid format
        await user.selectOptions(countrySelect, testCase.country);
        await user.clear(postalCodeInput);
        await user.type(postalCodeInput, testCase.invalid);
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(`Invalid postal code format for ${testCase.country}`)).toBeInTheDocument();
        });

        // Test valid format
        await user.clear(postalCodeInput);
        await user.type(postalCodeInput, testCase.valid);
        await user.tab();

        await waitFor(() => {
          expect(screen.queryByText(`Invalid postal code format for ${testCase.country}`)).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure and labels', () => {
      render(<AddressForm {...defaultProps} />);

      expect(screen.getByRole('form')).toBeInTheDocument();
      
      // Check that all inputs have proper labels
      const requiredFields = [
        'Full Name *',
        'Address Line 1 *', 
        'City *',
        'State/Province *',
        'Postal Code *',
        'Country *'
      ];

      requiredFields.forEach(label => {
        const input = screen.getByLabelText(label);
        expect(input).toHaveAttribute('required');
      });

      // Optional fields should not have required attribute
      expect(screen.getByLabelText('Address Line 2')).not.toHaveAttribute('required');
      expect(screen.getByLabelText('Phone Number')).not.toHaveAttribute('required');
    });

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup();
      render(<AddressForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /save address/i });
      await user.click(submitButton);

      await waitFor(() => {
        const fullNameInput = screen.getByLabelText('Full Name *');
        const errorElement = screen.getByText('Full name is required');
        
        expect(errorElement).toBeInTheDocument();
        expect(fullNameInput).toHaveAttribute('aria-describedby');
      });
    });
  });
});