import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ContactForm from './ContactForm.svelte';

// Mock $app/environment to ensure browser mode
vi.mock('$app/environment', () => ({
	browser: true
}));

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('ContactForm', () => {
	beforeEach(() => {
		fetchMock.mockClear();
		vi.clearAllTimers();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Form Rendering', () => {
		it('should render all form fields', async () => {
			const { container } = await render(ContactForm, {
				context: new Map()
			});

			expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument();
			expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
			expect(screen.getByLabelText('Número de teléfono')).toBeInTheDocument();
			expect(screen.getByLabelText('Tipo de consulta')).toBeInTheDocument();
			expect(screen.getByLabelText('Mensaje o consulta')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
		});

		it('should render honeypot field', () => {
			render(ContactForm);
			const honeypot = document.querySelector('input[name="website"]') as HTMLInputElement;
			expect(honeypot).toBeInTheDocument();
			expect(honeypot).toHaveAttribute('aria-hidden', 'true');
			expect(honeypot).toHaveAttribute('tabindex', '-1');
		});
	});

	describe('Form Submission - Success', () => {
		it('should submit form with valid data', async () => {
			const user = userEvent.setup({ delay: null });
			fetchMock.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					success: true,
					message: 'Formulario enviado correctamente. Nos pondremos en contacto contigo pronto.'
				})
			});

			render(ContactForm);

			// Fill form
			await user.type(screen.getByLabelText('Nombre completo'), 'Juan Pérez');
			await user.type(screen.getByLabelText('Correo electrónico'), 'juan@example.com');
			await user.selectOptions(screen.getByLabelText('Tipo de consulta'), 'Precio y Financiación');

			// Submit form
			const submitButton = screen.getByRole('button', { name: /enviar/i });
			await user.click(submitButton);

			// Check loading state
			expect(screen.getByText('Enviando...')).toBeInTheDocument();
			expect(submitButton).toBeDisabled();

			// Wait for API call
			await waitFor(() => {
				expect(fetchMock).toHaveBeenCalledWith('/api/contact', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: expect.stringContaining('"nombre":"Juan Pérez"')
				});
			});

			// Wait for success message
			await waitFor(() => {
				expect(screen.getByRole('alert')).toHaveTextContent(
					'Formulario enviado correctamente. Nos pondremos en contacto contigo pronto.'
				);
			});

			// Check form is reset
			expect(screen.getByLabelText('Nombre completo')).toHaveValue('');
			expect(screen.getByLabelText('Correo electrónico')).toHaveValue('');
		});

		it('should include honeypot field in submission', async () => {
			const user = userEvent.setup({ delay: null });
			fetchMock.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, message: 'Success' })
			});

			render(ContactForm);

			// Fill form
			await user.type(screen.getByLabelText('Nombre completo'), 'Test');
			await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
			await user.selectOptions(screen.getByLabelText('Tipo de consulta'), 'Precio y Financiación');

			// Submit
			await user.click(screen.getByRole('button', { name: /enviar/i }));

			await waitFor(() => {
				expect(fetchMock).toHaveBeenCalled();
				const callBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
				expect(callBody).toHaveProperty('website');
			});
		});
	});

	describe('Form Validation', () => {
		it('should show error for missing required fields', async () => {
			const user = userEvent.setup({ delay: null });
			render(ContactForm);

			// Try to submit empty form
			await user.click(screen.getByRole('button', { name: /enviar/i }));

			// HTML5 validation should prevent submission
			// But our custom validation should also catch it
			await waitFor(() => {
				const errorMessage = screen.queryByRole('alert');
				// Either HTML5 validation or our custom validation should trigger
				expect(errorMessage || document.querySelector(':invalid')).toBeTruthy();
			});
		});

		it('should show error for invalid email format', async () => {
			const user = userEvent.setup({ delay: null });
			render(ContactForm);

			// Fill form with invalid email
			await user.type(screen.getByLabelText('Nombre completo'), 'Test');
			await user.type(screen.getByLabelText('Correo electrónico'), 'invalid-email');
			await user.selectOptions(screen.getByLabelText('Tipo de consulta'), 'Precio y Financiación');

			// Submit
			await user.click(screen.getByRole('button', { name: /enviar/i }));

			await waitFor(() => {
				// Either HTML5 validation or our custom validation
				const errorMessage = screen.queryByRole('alert');
				const invalidField = document.querySelector(':invalid');
				expect(errorMessage || invalidField).toBeTruthy();
			});
		});

		it('should validate email format correctly', async () => {
			const user = userEvent.setup({ delay: null });
			render(ContactForm);

			// Fill form with valid email
			await user.type(screen.getByLabelText('Nombre completo'), 'Test');
			await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
			await user.selectOptions(screen.getByLabelText('Tipo de consulta'), 'Precio y Financiación');

			fetchMock.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, message: 'Success' })
			});

			// Submit
			await user.click(screen.getByRole('button', { name: /enviar/i }));

			await waitFor(() => {
				expect(fetchMock).toHaveBeenCalled();
				const callBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
				expect(callBody.correo).toBe('test@example.com');
			});
		});
	});

	describe('Loading State', () => {
		it('should show loading state during submission', async () => {
			const user = userEvent.setup({ delay: null });
			// Create a promise that we can control
			let resolvePromise: (value: any) => void;
			const pendingPromise = new Promise((resolve) => {
				resolvePromise = resolve;
			});

			fetchMock.mockReturnValueOnce(pendingPromise);

			render(ContactForm);

			// Fill form
			await user.type(screen.getByLabelText('Nombre completo'), 'Test');
			await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
			await user.selectOptions(screen.getByLabelText('Tipo de consulta'), 'Precio y Financiación');

			// Submit
			const submitButton = screen.getByRole('button', { name: /enviar/i });
			await user.click(submitButton);

			// Check loading state
			expect(screen.getByText('Enviando...')).toBeInTheDocument();
			expect(submitButton).toBeDisabled();

			// Resolve the promise
			resolvePromise!({
				ok: true,
				json: async () => ({ success: true, message: 'Success' })
			});

			await waitFor(() => {
				expect(screen.queryByText('Enviando...')).not.toBeInTheDocument();
			});
		});

		it('should disable form fields during submission', async () => {
			const user = userEvent.setup({ delay: null });
			let resolvePromise: (value: any) => void;
			const pendingPromise = new Promise((resolve) => {
				resolvePromise = resolve;
			});

			fetchMock.mockReturnValueOnce(pendingPromise);

			render(ContactForm);

			// Fill form
			await user.type(screen.getByLabelText('Nombre completo'), 'Test');
			await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
			await user.selectOptions(screen.getByLabelText('Tipo de consulta'), 'Precio y Financiación');

			// Submit
			await user.click(screen.getByRole('button', { name: /enviar/i }));

			// Check fields are disabled
			await waitFor(() => {
				const nombreInput = screen.getByLabelText('Nombre completo') as HTMLInputElement;
				const correoInput = screen.getByLabelText('Correo electrónico') as HTMLInputElement;
				expect(nombreInput.disabled).toBe(true);
				expect(correoInput.disabled).toBe(true);
			});

			// Resolve
			resolvePromise!({
				ok: true,
				json: async () => ({ success: true, message: 'Success' })
			});

			await waitFor(() => {
				const nombreInput = screen.getByLabelText('Nombre completo') as HTMLInputElement;
				expect(nombreInput.disabled).toBe(false);
			});
		});
	});

	describe('Error Handling', () => {
		it('should display error message on API error', async () => {
			const user = userEvent.setup({ delay: null });
			fetchMock.mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: async () => ({
					error: 'Por favor completa todos los campos requeridos.'
				})
			});

			render(ContactForm);

			// Fill form
			await user.type(screen.getByLabelText('Nombre completo'), 'Test');
			await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
			await user.selectOptions(screen.getByLabelText('Tipo de consulta'), 'Precio y Financiación');

			// Submit
			await user.click(screen.getByRole('button', { name: /enviar/i }));

			await waitFor(() => {
				expect(screen.getByRole('alert')).toHaveTextContent(
					'Por favor completa todos los campos requeridos.'
				);
			});
		});

		it('should display error message on network error', async () => {
			const user = userEvent.setup({ delay: null });
			fetchMock.mockRejectedValueOnce(new Error('Network error'));

			render(ContactForm);

			// Fill form
			await user.type(screen.getByLabelText('Nombre completo'), 'Test');
			await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
			await user.selectOptions(screen.getByLabelText('Tipo de consulta'), 'Precio y Financiación');

			// Submit
			await user.click(screen.getByRole('button', { name: /enviar/i }));

			await waitFor(() => {
				expect(screen.getByRole('alert')).toHaveTextContent(
					'Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.'
				);
			});
		});

		it('should display default error message when API error has no message', async () => {
			const user = userEvent.setup({ delay: null });
			fetchMock.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: async () => ({})
			});

			render(ContactForm);

			// Fill form
			await user.type(screen.getByLabelText('Nombre completo'), 'Test');
			await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
			await user.selectOptions(screen.getByLabelText('Tipo de consulta'), 'Precio y Financiación');

			// Submit
			await user.click(screen.getByRole('button', { name: /enviar/i }));

			await waitFor(() => {
				expect(screen.getByRole('alert')).toHaveTextContent(
					'Error al enviar el formulario. Por favor, intenta de nuevo.'
				);
			});
		});
	});

	describe('Success Message', () => {
		it('should clear success message after 5 seconds', async () => {
			const user = userEvent.setup({ delay: null });
			fetchMock.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					success: true,
					message: 'Success message'
				})
			});

			render(ContactForm);

			// Fill and submit form
			await user.type(screen.getByLabelText('Nombre completo'), 'Test');
			await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
			await user.selectOptions(screen.getByLabelText('Tipo de consulta'), 'Precio y Financiación');
			await user.click(screen.getByRole('button', { name: /enviar/i }));

			// Wait for success message
			await waitFor(() => {
				expect(screen.getByRole('alert')).toHaveTextContent('Success message');
			});

			// Fast-forward 5 seconds
			vi.advanceTimersByTime(5000);

			// Message should be cleared
			await waitFor(() => {
				expect(screen.queryByRole('alert')).not.toBeInTheDocument();
			});
		});
	});

	describe('Form Reset', () => {
		it('should reset form after successful submission', async () => {
			const user = userEvent.setup({ delay: null });
			fetchMock.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					success: true,
					message: 'Success'
				})
			});

			render(ContactForm);

			// Fill form
			const nombreInput = screen.getByLabelText('Nombre completo');
			const correoInput = screen.getByLabelText('Correo electrónico');
			const mensajeInput = screen.getByLabelText('Mensaje o consulta');

			await user.type(nombreInput, 'Juan Pérez');
			await user.type(correoInput, 'juan@example.com');
			await user.selectOptions(screen.getByLabelText('Tipo de consulta'), 'Precio y Financiación');
			await user.type(mensajeInput, 'Test message');

			// Submit
			await user.click(screen.getByRole('button', { name: /enviar/i }));

			// Wait for form reset
			await waitFor(() => {
				expect(nombreInput).toHaveValue('');
				expect(correoInput).toHaveValue('');
				expect(mensajeInput).toHaveValue('');
			});
		});
	});

	describe('Message Clearing', () => {
		it('should clear previous error message on new submission', async () => {
			const user = userEvent.setup({ delay: null });
			
			// First submission - error
			fetchMock.mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: async () => ({ error: 'First error' })
			});

			render(ContactForm);

			await user.type(screen.getByLabelText('Nombre completo'), 'Test');
			await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
			await user.selectOptions(screen.getByLabelText('Tipo de consulta'), 'Precio y Financiación');
			await user.click(screen.getByRole('button', { name: /enviar/i }));

			await waitFor(() => {
				expect(screen.getByRole('alert')).toHaveTextContent('First error');
			});

			// Second submission - success
			fetchMock.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, message: 'Success' })
			});

			await user.click(screen.getByRole('button', { name: /enviar/i }));

			await waitFor(() => {
				expect(screen.getByRole('alert')).toHaveTextContent('Success');
				expect(screen.queryByText('First error')).not.toBeInTheDocument();
			});
		});
	});
});

