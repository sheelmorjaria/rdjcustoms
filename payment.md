Story 1.2: As a Customer, I want to pay for my order using PayPal so that I can use a familiar and secure payment method.
Status: Draft
Story

    As a Customer
    I want to pay for my order using PayPal
    so that I can use a familiar and secure payment method.

Acceptance Criteria (ACs)

    Customers must be able to select PayPal as a payment option during checkout.
    Upon selecting PayPal, customers should be redirected to the PayPal payment gateway for secure transaction completion.
    Upon successful payment, customers should be redirected back to the e-commerce store's order confirmation page.
    Unsuccessful or cancelled PayPal payments should redirect the customer back to the checkout page with an appropriate error message.
    The backend system must correctly process PayPal transaction callbacks (IPN/Webhooks) to update order status.

Tasks / Subtasks

    [ ] Task 1 (AC: 1): Implement frontend UI to display PayPal as a payment option on the checkout page.
        [ ] Subtask 1.1: Add a radio button or similar selection for PayPal.
        [ ] Subtask 1.2: Integrate the PayPal SDK into the frontend to handle button rendering and initial payment setup.
    [ ] Task 2 (AC: 2): Implement frontend logic to initiate PayPal redirection.
        [ ] Subtask 2.1: On PayPal selection and order submission, trigger the PayPal payment flow via SDK.
    [ ] Task 3 (AC: 5): Implement backend API endpoint for PayPal transaction processing and callbacks.
        [ ] Subtask 3.1: Create a secure webhook endpoint to receive PayPal IPN/webhook notifications.
        [ ] Subtask 3.2: Verify the authenticity of PayPal callbacks.
        [ ] Subtask 3.3: Parse PayPal transaction data to update relevant order details in MongoDB (e.g., payment status, transaction ID).
    [ ] Task 4 (AC: 3, 4): Implement frontend and backend logic for post-payment redirection.
        [ ] Subtask 4.1: Configure PayPal redirection URLs for success and cancellation.
        [ ] Subtask 4.2: Implement frontend logic on return from PayPal to display order confirmation or error messages based on URL parameters/backend status.
    [ ] Task 5 (AC: 5): Implement backend unit and integration tests for PayPal webhook processing.
        [ ] Subtask 5.1: Write Jest and Supertest for the PayPal webhook endpoint, covering successful payments and error cases.

Dev Technical Guidance

    Frontend: React.js with React Hooks. Utilize Redux/Redux Toolkit for managing checkout state and initiating payment. Tailwind CSS for styling. Ensure all interactions with the PayPal SDK are secure and handle user data appropriately.
    Backend: Node.js with Express.js. Use Mongoose for updating MongoDB. Implement robust error handling for PayPal callbacks. Ensure API endpoints are rate-limited and CORS is properly configured. No private keys should be stored in the application.
    Testing: Strict TDD methodology. Write comprehensive unit and integration tests for both frontend (Jest, React Testing Library) and backend (Jest, Supertest) components involved in PayPal integration.



    Story 1.3: As a Customer, I want to pay for my order using Bitcoin so that I can use a cryptocurrency for privacy-focused transactions.
Status: Draft
Story

    As a Customer
    I want to pay for my order using Bitcoin
    so that I can use a cryptocurrency for privacy-focused transactions.

Acceptance Criteria (ACs)

    Customers must be able to select Bitcoin as a payment option during checkout.
    Upon selecting Bitcoin, a unique Bitcoin address and the exact amount in BTC (converted from GBP using a fixed exchange rate) must be displayed to the customer.
    The fixed exchange rate used for Bitcoin conversion must adhere to the defined validity windows.

The system must track Bitcoin transaction confirmations (using Blockonomics) and update the order status accordingly.
Order status must change to "Paid" only after 2 Bitcoin confirmations (~30 minutes).

    If Bitcoin payment is not received within a specified time or is underpaid, the order status should reflect a failed or pending state, and the customer should be notified.

Tasks / Subtasks

    [ ] Task 1 (AC: 1): Implement frontend UI to display Bitcoin as a payment option on the checkout page.
        [ ] Subtask 1.1: Add a radio button or similar selection for Bitcoin.
    [ ] Task 2 (AC: 2, 3): Implement backend API endpoint to generate a unique Bitcoin address and calculate the BTC amount.
        [ ] Subtask 2.1: Integrate with Blockonomics API to generate a new unique Bitcoin address for each order.
        [ ] Subtask 2.2: Fetch current fixed exchange rate from a designated source (e.g., internal configuration, CoinGecko API) ensuring validity windows.

    [ ] Subtask 2.3: Convert the GBP order total to the equivalent BTC amount using the fetched rate.
    [ ] Subtask 2.4: Store the generated Bitcoin address, BTC amount, and exchange rate used with the order in MongoDB.

[ ] Task 3 (AC: 2): Implement frontend UI to display the generated Bitcoin address and BTC amount.

    [ ] Subtask 3.1: Display the unique Bitcoin address as a QR code and text.
    [ ] Subtask 3.2: Display the exact BTC amount required for payment.
    [ ] Subtask 3.3: Provide instructions for sending Bitcoin.

[ ] Task 4 (AC: 4, 5): Implement backend webhook endpoint for Blockonomics payment notifications.

    [ ] Subtask 4.1: Create a secure webhook endpoint to receive payment confirmation notifications from Blockonomics.
    [ ] Subtask 4.2: Verify the authenticity of Blockonomics callbacks.
    [ ] Subtask 4.3: Parse Blockonomics notification data (transaction hash, confirmations).
    [ ] Subtask 4.4: Update order status in MongoDB based on the number of confirmations received (e.g., "Pending Confirmation", "Paid after 2 confirmations" ).

    [ ] Task 5 (AC: 6): Implement backend logic for handling underpayments or expired Bitcoin payment windows.
        [ ] Subtask 5.1: Define and implement logic to detect underpayments.
        [ ] Subtask 5.2: Implement a mechanism to mark orders as expired if payment is not received within a set timeframe.
        [ ] Subtask 5.3: Send appropriate customer notifications for payment status changes.
    [ ] Task 6 (AC: 4, 5): Implement unit and integration tests for Bitcoin payment flow.
        [ ] Subtask 6.1: Write Jest and Supertest for Bitcoin address generation and BTC amount calculation.
        [ ] Subtask 6.2: Write Jest and Supertest for Blockonomics webhook processing, covering various confirmation states (0, 1, 2 confirmations) and underpayment/overpayment scenarios.

Dev Technical Guidance

    Frontend: React.js, Redux for state management. Display of QR codes for Bitcoin addresses. CoinGecko API should be used by the backend to fetch exchange rates, not directly by the frontend.

Backend: Node.js with Express.js. Integrate with Blockonomics API and CoinGecko API for exchange rates. Mongoose for MongoDB interactions to store and update order and payment details. Ensure secure handling of external API keys and rate limiting for all endpoints.

    Testing: Strict TDD methodology. Comprehensive unit and integration tests for both frontend and backend. Ensure test coverage for all confirmation states and edge cases like underpayment/expiration.


Story 1.4: As a Customer, I want to pay for my order using Monero so that I can use a private and untraceable cryptocurrency for my purchase.
Status: Draft
Story

    As a Customer
    I want to pay for my order using Monero
    so that I can use a private and untraceable cryptocurrency for my purchase.

Acceptance Criteria (ACs)

    Customers must be able to select Monero as a payment option during checkout.
    Upon selecting Monero, a unique Monero address and the exact amount in XMR (converted from GBP using a fixed exchange rate) must be displayed to the customer.
    The fixed exchange rate used for Monero conversion must adhere to the defined validity windows.
    The system must track Monero transaction confirmations (using GloBee) and update the order status accordingly.
    Order status must change to "Paid" only after 10 Monero confirmations (~20 minutes).
    If Monero payment is not received within a specified time or is underpaid, the order status should reflect a failed or pending state, and the customer should be notified.

Tasks / Subtasks

    [ ] Task 1 (AC: 1): Implement frontend UI to display Monero as a payment option on the checkout page.
        [ ] Subtask 1.1: Add a radio button or similar selection for Monero.
    [ ] Task 2 (AC: 2, 3): Implement backend API endpoint to generate a unique Monero address and calculate the XMR amount.
        [ ] Subtask 2.1: Integrate with GloBee API to generate a new unique Monero payment address for each order.
        [ ] Subtask 2.2: Fetch current fixed exchange rate from a designated source (e.g., internal configuration, CoinGecko API) ensuring validity windows.
        [ ] Subtask 2.3: Convert the GBP order total to the equivalent XMR amount using the fetched rate.
        [ ] Subtask 2.4: Store the generated Monero address, XMR amount, and exchange rate used with the order in MongoDB.
    [ ] Task 3 (AC: 2): Implement frontend UI to display the generated Monero address and XMR amount.
        [ ] Subtask 3.1: Display the unique Monero address as a QR code and text.
        [ ] Subtask 3.2: Display the exact XMR amount required for payment.
        [ ] Subtask 3.3: Provide instructions for sending Monero.
    [ ] Task 4 (AC: 4, 5): Implement backend webhook endpoint for GloBee payment notifications.
        [ ] Subtask 4.1: Create a secure webhook endpoint to receive payment confirmation notifications from GloBee.
        [ ] Subtask 4.2: Verify the authenticity of GloBee callbacks.
        [ ] Subtask 4.3: Parse GloBee notification data (transaction hash, confirmations).
        [ ] Subtask 4.4: Update order status in MongoDB based on the number of confirmations received (e.g., "Pending Confirmation", "Paid after 10 confirmations").
    [ ] Task 5 (AC: 6): Implement backend logic for handling underpayments or expired Monero payment windows.
        [ ] Subtask 5.1: Define and implement logic to detect underpayments.
        [ ] Subtask 5.2: Implement a mechanism to mark orders as expired if payment is not received within a set timeframe.
        [ ] Subtask 5.3: Send appropriate customer notifications for payment status changes.
    [ ] Task 6 (AC: 4, 5): Implement unit and integration tests for Monero payment flow.
        [ ] Subtask 6.1: Write Jest and Supertest for Monero address generation and XMR amount calculation.
        [ ] Subtask 6.2: Write Jest and Supertest for GloBee webhook processing, covering various confirmation states (0, 5, 10 confirmations) and underpayment/overpayment scenarios.

Dev Technical Guidance

    Frontend: React.js, Redux for state management. Display of QR codes for Monero addresses. CoinGecko API should be used by the backend to fetch exchange rates, not directly by the frontend.
    Backend: Node.js with Express.js. Integrate with GloBee API and CoinGecko API for exchange rates. Mongoose for MongoDB interactions to store and update order and payment details. Ensure secure handling of external API keys and rate limiting for all endpoints.
    Testing: Strict TDD methodology. Comprehensive unit and integration tests for both frontend and backend. Ensure test coverage for all confirmation states and edge cases like underpayment/expiration.



    For production deployment, make sure to:

  1. Replace all placeholder values with actual API credentials
  2. Change GLOBEE_ENVIRONMENT to production
  3. Update GLOBEE_BASE_URL to https://globee.com/payment-api/v1
  4. Use strong, unique secrets for JWT and webhooks
  5. Configure proper SMTP settings for email notifications


 create a test script to verify the Mailtrap integration