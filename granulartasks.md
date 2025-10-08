Epic: Product Browse & Search
Story 1.1: View Product List (Customer)
Story: As a customer, I want to view a list of available products so that I can browse offerings.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Products" or "Shop" page is available to all users without authentication. 
    2. The page displays a paginated list of all active products. 
    3. For each product, the following information is displayed: Product Name, Main Image, Price, Short Description, and a "View Details" button/link. 
    4. Products are sorted by creation date (newest first) by default, with options to sort by price (low to high, high to low) and name (A-Z, Z-A). 
    5. The page provides categories or filters (e.g., by category, price range) to narrow down the product list. 
    6. The product list is responsive and displays correctly on various devices. 

Granular Tasks & Subtasks for Story 1.1:
Here's the detailed breakdown of tasks, ready for development:
    • Frontend Tasks:
        ◦ Task 1.1.1: Develop Product List Page UI (Base Layout) 
            ▪ Subtask 1.1.1.1: Create ProductListPage component/route. 
            ▪ Subtask 1.1.1.2: Implement responsive grid/flex layout for product cards. 
            ▪ Subtask 1.1.1.3: Design ProductCard component to display Name, Image, Price, Short Description. 
            ▪ Subtask 1.1.1.4: Add "View Details" button/link to each product card. 
        ◦ Task 1.1.2: Implement Pagination UI 
            ▪ Subtask 1.1.2.1: Create Pagination component. 
            ▪ Subtask 1.1.2.2: Integrate pagination controls (next/prev, page numbers) with product list. 
        ◦ Task 1.1.3: Implement Sorting Controls UI 
            ▪ Subtask 1.1.3.1: Create SortOptions dropdown/buttons. 
            ▪ Subtask 1.1.3.2: Add options for "Newest First", "Price: Low to High", "Price: High to Low", "Name: A-Z", "Name: Z-A". 
        ◦ Task 1.1.4: Implement Filtering UI 
            ▪ Subtask 1.1.4.1: Create FilterSidebar or FilterPanel component. 
            ▪ Subtask 1.1.4.2: Implement category filter (checkboxes/links). 
            ▪ Subtask 1.1.4.3: Implement price range filter (sliders/input fields). 
        ◦ Task 1.1.5: Frontend API Integration for Product List 
            ▪ Subtask 1.1.5.1: Create service/hook to fetch products from GET /api/products. 
            ▪ Subtask 1.1.5.2: Pass pagination parameters (page, limit). 
            ▪ Subtask 1.1.5.3: Pass sorting parameters (sortBy, sortOrder). 
            ▪ Subtask 1.1.5.4: Pass filtering parameters (category, minPrice, maxPrice). 
            ▪ Subtask 1.1.5.5: Handle loading states and display errors gracefully. 
        ◦ Task 1.1.6: Dynamic Content Rendering 
            ▪ Subtask 1.1.6.1: Map fetched product data to ProductCard components. 
            ▪ Subtask 1.1.6.2: Update product list dynamically when sorting/filtering/pagination changes. 
    • Backend Tasks:
        ◦ Task 1.1.7: Create Product Listing API Endpoint 
            ▪ Subtask 1.1.7.1: Design and implement GET /api/products endpoint. 
            ▪ Subtask 1.1.7.2: Implement logic to query Product collection in MongoDB. 
            ▪ Subtask 1.1.7.3: Implement pagination logic (skip/limit) on MongoDB query. 
            ▪ Subtask 1.1.7.4: Implement sorting logic based on query parameters (createdAt, price, name). 
            ▪ Subtask 1.1.7.5: Implement filtering logic for category, minPrice, maxPrice. 
            ▪ Subtask 1.1.7.6: Ensure only "active" (or published) products are returned. 
            ▪ Subtask 1.1.7.7: Return necessary product fields (name, image, price, short description, ID) and pagination metadata (total count, current page, total pages). 
        ◦ Task 1.1.8: Implement Product Catalog Data Model 
            ▪ Subtask 1.1.8.1: Define MongoDB schema for Product collection (Name, Description, Price, Image URLs, Category ID, isActive, createdAt, etc.). 
            ▪ Subtask 1.1.8.2: Define MongoDB schema for Category collection (Name, Slug, etc.). 
            ▪ Subtask 1.1.8.3: Seed initial 30 product data records and basic categories. 
        ◦ Task 1.1.9: Error Handling & Validation (Backend) 
            ▪ Subtask 1.1.9.1: Implement input validation for all query parameters (pagination, sorting, filtering). 
            ▪ Subtask 1.1.9.2: Implement robust error handling for database queries and API responses. 
    • Testing Tasks:
        ◦ Task 1.1.10: Write Unit Tests 
            ▪ Subtask 1.1.10.1: Unit tests for frontend components (ProductCard, Pagination, etc.). 
            ▪ Subtask 1.1.10.2: Unit tests for backend utility functions (e.g., query builders). 
        ◦ Task 1.1.11: Write Integration Tests 
            ▪ Subtask 1.1.11.1: Test GET /api/products endpoint with various parameters (pagination, sort, filter, invalid inputs). 
            ▪ Subtask 1.1.11.2: Test data retrieval from MongoDB. 
        ◦ Task 1.1.12: Manual End-to-End Testing 
            ▪ Subtask 1.1.12.1: Verify product list displays correctly. 
            ▪ Subtask 1.1.12.2: Test pagination functionality. 
            ▪ Subtask 1.1.12.3: Test sorting options. 
            ▪ Subtask 1.1.12.4: Test category and price range filters. 
            ▪ Subtask 1.1.12.5: Verify responsiveness on different devices. 

Epic: Product Browse & Search
Story 1.2: View Product Details (Customer)
Story: As a customer, I want to view detailed information about a specific product so that I can make an informed purchasing decision.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. Clicking on a product from the list (Story 1.1) navigates the customer to a dedicated "Product Details" page for that product. 
    2. The URL for the product details page is SEO-friendly (e.g., /products/product-name-slug). 
    3. The page displays comprehensive information for the product, including: 
        ◦ Full Product Name 
        ◦ Multiple Product Images (gallery/carousel) 
        ◦ Detailed Description 
        ◦ Price 
        ◦ Availability/Stock Status (e.g., "In Stock", "Low Stock", "Out of Stock") 
        ◦ "Add to Cart" button. 
        ◦ Any relevant product attributes/specifications (e.g., color, size, material, technical specs). 
    4. If the product is out of stock, the "Add to Cart" button is disabled or replaced with an appropriate message. 
    5. The page is responsive and displays correctly on various devices. 
    6. (Implicit from later Epics): Includes a section for customer reviews and ratings (addressed in Epic 15). 

Granular Tasks & Subtasks for Story 1.2:
    • Frontend Tasks:
        ◦ Task 1.2.1: Develop Product Details Page UI Layout 
            ▪ Subtask 1.2.1.1: Create ProductDetailsPage component/route. 
            ▪ Subtask 1.2.1.2: Implement main layout for product information sections. 
            ▪ Subtask 1.2.1.3: Design ImageGallery component for multiple product images (carousel functionality). 
            ▪ Subtask 1.2.1.4: Create AddToCartButton component. 
        ◦ Task 1.2.2: Implement Dynamic Content Display 
            ▪ Subtask 1.2.2.1: Display Full Product Name, Price, Detailed Description. 
            ▪ Subtask 1.2.2.2: Display Availability/Stock Status (e.g., "In Stock", "Out of Stock"). 
            ▪ Subtask 1.2.2.3: Conditionally enable/disable "Add to Cart" button based on stock status. 
            ▪ Subtask 1.2.2.4: Render additional product attributes/specifications dynamically. 
        ◦ Task 1.2.3: Implement SEO-Friendly URL Routing 
            ▪ Subtask 1.2.3.1: Configure client-side router to handle /products/:slug routes. 
            ▪ Subtask 1.2.3.2: Implement logic to extract product slug from URL. 
        ◦ Task 1.2.4: Frontend API Integration for Product Details 
            ▪ Subtask 1.2.4.1: Create service/hook to fetch single product by slug from GET /api/products/:slug. 
            ▪ Subtask 1.2.4.2: Handle loading states and display errors gracefully (e.g., "Product Not Found"). 
        ◦ Task 1.2.5: Ensure Responsiveness 
            ▪ Subtask 1.2.5.1: Apply responsive CSS to ensure optimal display on various devices. 
    • Backend Tasks:
        ◦ Task 1.2.6: Create Product Details API Endpoint 
            ▪ Subtask 1.2.6.1: Design and implement GET /api/products/:slug endpoint. 
            ▪ Subtask 1.2.6.2: Implement logic to query Product collection by slug. 
            ▪ Subtask 1.2.6.3: Ensure only active products are returned. 
            ▪ Subtask 1.2.6.4: Return all necessary product fields (full name, multiple image URLs, detailed description, price, stock quantity, attributes). 
        ◦ Task 1.2.7: Update Product Data Model for Details 
            ▪ Subtask 1.2.7.1: Add fields to Product schema for: images (array of URLs), longDescription, stockQuantity, attributes (e.g., array of objects {name: "Color", value: "Red"}). 
            ▪ Subtask 1.2.7.2: Ensure existing slug field is correctly populated. 
            ▪ Subtask 1.2.7.3: Update seed data for initial 30 products to include these new detailed fields. 
        ◦ Task 1.2.8: Error Handling & Validation (Backend) 
            ▪ Subtask 1.2.8.1: Implement validation for slug parameter. 
            ▪ Subtask 1.2.8.2: Handle "product not found" scenarios gracefully (e.g., HTTP 404). 
    • Testing Tasks:
        ◦ Task 1.2.9: Write Unit Tests 
            ▪ Subtask 1.2.9.1: Unit tests for frontend components (ImageGallery, AddToCartButton). 
            ▪ Subtask 1.2.9.2: Unit tests for backend data retrieval by slug. 
        ◦ Task 1.2.10: Write Integration Tests 
            ▪ Subtask 1.2.10.1: Test GET /api/products/:slug endpoint with valid and invalid slugs. 
            ▪ Subtask 1.2.10.2: Verify correct product data is returned. 
        ◦ Task 1.2.11: Manual End-to-End Testing 
            ▪ Subtask 1.2.11.1: Verify navigation from product list to details page. 
            ▪ Subtask 1.2.11.2: Check all product details (images, description, price, stock) are correctly displayed. 
            ▪ Subtask 1.2.11.3: Test "Add to Cart" button behavior for in-stock and out-of-stock items. 
            ▪ Subtask 1.2.11.4: Verify URL slug correctness. 
            ▪ Subtask 1.2.11.5: Verify responsiveness on different devices.

Epic: Product Browse & Search
Story 1.3: Search Products (Customer)
Story: As a customer, I want to search for products using keywords so that I can quickly find specific items.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A prominent search bar is available on the header of all customer-facing pages. 
    2. Customers can type keywords into the search bar. 
    3. Pressing Enter or clicking a "Search" button initiates a search. 
    4. Search results are displayed on a dedicated "Search Results" page, similar in layout to the "Product List" page (Story 1.1), showing relevant products that match the keywords. 
    5. Search results are paginated, sortable, and filterable (by category, price range) just like the main product list. 
    6. Search should be case-insensitive. 
    7. Partial keyword matches should return results. 
    8. The search results page displays the search query (e.g., "Showing results for 'shoes'"). 
    9. The search functionality is responsive. 

Granular Tasks & Subtasks for Story 1.3:
    • Frontend Tasks:
        ◦ Task 1.3.1: Implement Global Search Bar UI 
            ▪ Subtask 1.3.1.1: Design and implement search input field and search button in the global header component. 
            ▪ Subtask 1.3.1.2: Ensure search bar is present on all customer-facing pages. 
        ◦ Task 1.3.2: Develop Search Results Page UI 
            ▪ Subtask 1.3.2.1: Create SearchResultsPage component/route. 
            ▪ Subtask 1.3.2.2: Reuse ProductCard, Pagination, SortOptions, and FilterSidebar components from Story 1.1. 
            ▪ Subtask 1.3.2.3: Display the active search query (e.g., "Showing results for 'XYZ'"). 
        ◦ Task 1.3.3: Implement Frontend Search Logic 
            ▪ Subtask 1.3.3.1: Capture input from search bar on submit. 
            ▪ Subtask 1.3.3.2: Redirect to SearchResultsPage with search query as a URL parameter (e.g., /search?q=keyword). 
            ▪ Subtask 1.3.3.3: Extract search query from URL on SearchResultsPage load. 
        ◦ Task 1.3.4: Frontend API Integration for Search Results 
            ▪ Subtask 1.3.4.1: Create service/hook to fetch products from GET /api/products/search. 
            ▪ Subtask 1.3.4.2: Pass search query (q), pagination, sorting, and filtering parameters. 
            ▪ Subtask 1.3.4.3: Handle loading states and display "No results found" message. 
        ◦ Task 1.3.5: Ensure Responsiveness of Search UI and Results 
            ▪ Subtask 1.3.5.1: Apply responsive CSS to search bar and results layout. 
    • Backend Tasks:
        ◦ Task 1.3.6: Create Product Search API Endpoint 
            ▪ Subtask 1.3.6.1: Design and implement GET /api/products/search endpoint. 
            ▪ Subtask 1.3.6.2: Implement logic to query Product collection based on search keywords. 
            ▪ Subtask 1.3.6.3: Implement case-insensitive partial keyword matching on relevant fields (e.g., product name, description, category name). Consider using MongoDB text search or regular expressions for this. 
            ▪ Subtask 1.3.6.4: Integrate pagination, sorting, and filtering logic (reusing or adapting from Task 1.1.7). 
            ▪ Subtask 1.3.6.5: Ensure only "active" products are returned. 
        ◦ Task 1.3.7: Optimize Database for Search 
            ▪ Subtask 1.3.7.1: Add necessary indexes (e.g., text index) to Product collection for efficient keyword search. 
        ◦ Task 1.3.8: Error Handling & Validation (Backend) 
            ▪ Subtask 1.3.8.1: Validate search query parameter (q). 
            ▪ Subtask 1.3.8.2: Handle scenarios where no products match the search query. 
    • Testing Tasks:
        ◦ Task 1.3.9: Write Unit Tests 
            ▪ Subtask 1.3.9.1: Unit tests for frontend search bar component. 
            ▪ Subtask 1.3.9.2: Unit tests for backend search logic (case-insensitivity, partial matches). 
        ◦ Task 1.3.10: Write Integration Tests 
            ▪ Subtask 1.3.10.1: Test GET /api/products/search endpoint with various valid/invalid keywords. 
            ▪ Subtask 1.3.10.2: Test combination of search with pagination, sorting, and filtering. 
        ◦ Task 1.3.11: Manual End-to-End Testing 
            ▪ Subtask 1.3.11.1: Verify search bar presence and functionality. 
            ▪ Subtask 1.3.11.2: Test various search terms (exact, partial, case-insensitive). 
            ▪ Subtask 1.3.11.3: Verify search results display correctly with pagination, sorting, and filtering. 
            ▪ Subtask 1.3.11.4: Test "no results" scenario. 
            ▪ Subtask 1.3.11.5: Verify responsiveness of search UI and results.
Epic: Customer Account Management
Story 2.1: Register New Account (Customer)
Story: As a new customer, I want to create an account so that I can manage my orders, save my details, and have a personalized experience.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Register" or "Create Account" link/button is prominently available on the website (e.g., in the header, login page). 
    2. Clicking the link navigates the customer to a registration form. 
    3. The registration form requires the following information: 
        ◦ Email Address (Required, unique, valid format) 
        ◦ Password (Required, strong password policy enforced: min 8 characters, mix of uppercase, lowercase, numbers, symbols) 
        ◦ Confirm Password (Required, must match password) 
        ◦ First Name (Required) 
        ◦ Last Name (Required) 
        ◦ (Optional fields like Phone Number, Marketing Opt-in checkbox) 
    4. Client-side validation provides immediate feedback for invalid input. 
    5. Upon successful submission: 
        ◦ The user's account is created in the backend. 
        ◦ The user is automatically logged in. 
        ◦ A success message is displayed. 
        ◦ A welcome email is sent to the registered email address. 
    6. If registration fails (e.g., email already exists), a clear and specific error message is displayed. 
    7. All registration processes are performed securely via authenticated API endpoints. 

Granular Tasks & Subtasks for Story 2.1:
    • Frontend Tasks:
        ◦ Task 2.1.1: Develop Registration Page UI 
            ▪ Subtask 2.1.1.1: Create RegisterPage component/route. 
            ▪ Subtask 2.1.1.2: Design and implement input fields for Email, Password, Confirm Password, First Name, Last Name, (Optional: Phone, Marketing Opt-in). 
            ▪ Subtask 2.1.1.3: Add "Register" button. 
            ▪ Subtask 2.1.1.4: Add link to "Login" page for existing users. 
        ◦ Task 2.1.2: Implement Client-Side Validation for Registration Form 
            ▪ Subtask 2.1.2.1: Implement validation for Email format (regex). 
            ▪ Subtask 2.1.2.2: Implement password strength validation (min length, character types). 
            ▪ Subtask 2.1.2.3: Implement "Confirm Password" match validation. 
            ▪ Subtask 2.1.2.4: Display real-time feedback for invalid fields. 
        ◦ Task 2.1.3: Frontend API Integration for Account Registration 
            ▪ Subtask 2.1.3.1: Create service/hook to send registration data to POST /api/auth/register. 
            ▪ Subtask 2.1.3.2: Handle success response (automatic login, display success message, redirect to dashboard/homepage). 
            ▪ Subtask 2.1.3.3: Handle error responses (display specific error messages, e.g., "Email already exists"). 
        ◦ Task 2.1.4: Update Global Header UI 
            ▪ Subtask 2.1.4.1: Ensure "Register" link is present in the header/login area. 
    • Backend Tasks:
        ◦ Task 2.1.5: Create Account Registration API Endpoint 
            ▪ Subtask 2.1.5.1: Design and implement POST /api/auth/register endpoint. 
            ▪ Subtask 2.1.5.2: Implement server-side validation for all incoming registration data (email format, password strength, required fields). 
            ▪ Subtask 2.1.5.3: Hash the user's password using a strong, one-way algorithm (e.g., bcrypt) before storing. 
            ▪ Subtask 2.1.5.4: Check for unique email address (if email already exists, return appropriate error). 
            ▪ Subtask 2.1.5.5: Create new User document in MongoDB. 
            ▪ Subtask 2.1.5.6: Implement logic for automatic login upon successful registration (e.g., generate JWT token and send in response). 
            ▪ Subtask 2.1.5.7: Trigger sending of welcome email (integrate with Email Service Provider). 
        ◦ Task 2.1.6: Implement User Data Model 
            ▪ Subtask 2.1.6.1: Define MongoDB schema for User collection (email, hashedPassword, firstName, lastName, phone, marketingOptIn, createdAt, updatedAt, roles, etc.). 
        ◦ Task 2.1.7: Email Service Integration (Welcome Email) 
            ▪ Subtask 2.1.7.1: Configure integration with chosen Email Service Provider (e.g., SendGrid API key setup). 
            ▪ Subtask 2.1.7.2: Create welcome email template. 
            ▪ Subtask 2.1.7.3: Implement function to send welcome email upon successful registration. 
    • Security Tasks (Specific to this Story):
        ◦ Task 2.1.8: Secure Password Handling 
            ▪ Subtask 2.1.8.1: Ensure bcrypt/Argon2 is correctly configured for password hashing. 
            ▪ Subtask 2.1.8.2: Implement best practices for salt generation. 
        ◦ Task 2.1.9: Implement Rate Limiting for Registration Attempts 
            ▪ Subtask 2.1.9.1: Prevent brute-force registration attempts from a single IP address. 
    • Testing Tasks:
        ◦ Task 2.1.10: Write Unit Tests 
            ▪ Subtask 2.1.10.1: Unit tests for frontend validation logic. 
            ▪ Subtask 2.1.10.2: Unit tests for backend password hashing. 
        ◦ Task 2.1.11: Write Integration Tests 
            ▪ Subtask 2.1.11.1: Test POST /api/auth/register with valid data (expect success). 
            ▪ Subtask 2.1.11.2: Test with invalid data (invalid email, weak password, mismatched passwords). 
            ▪ Subtask 2.1.11.3: Test with existing email (expect specific error). 
            ▪ Subtask 2.1.11.4: Verify user creation in DB and correct password hashing. 
            ▪ Subtask 2.1.11.5: Verify welcome email is triggered (mock email service for testing). 
        ◦ Task 2.1.12: Manual End-to-End Testing 
            ▪ Subtask 2.1.12.1: Test full registration flow from UI. 
            ▪ Subtask 2.1.12.2: Verify successful account creation and automatic login. 
            ▪ Subtask 2.1.12.3: Test all validation messages on the UI. 
            ▪ Subtask 2.1.12.4: Attempt to register with an already existing email.
Epic: Customer Account Management
Story 2.2: Log In to Account (Customer)
Story: As a returning customer, I want to log in to my account so that I can access my saved information, order history, and personalized features.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Login" link/button is prominently available on the website (e.g., in the header). 
    2. Clicking the link navigates the customer to a login form. 
    3. The login form requires: 
        ◦ Email Address (Required, valid format) 
        ◦ Password (Required) 
    4. Client-side validation provides immediate feedback for invalid input. 
    5. Upon successful submission: 
        ◦ The user is authenticated in the backend. 
        ◦ A session is established. 
        ◦ The user is redirected to their account dashboard or the previous page. 
        ◦ A success message is displayed. 
    6. If login fails (e.g., invalid credentials), a clear and specific error message is displayed. 
    7. All login processes are performed securely via authenticated API endpoints. 

Granular Tasks & Subtasks for Story 2.2:
    • Frontend Tasks:
        ◦ Task 2.2.1: Develop Login Page UI
            ▪ Subtask 2.2.1.1: Create LoginPage component/route. 
            ▪ Subtask 2.2.1.2: Design and implement input fields for Email and Password. 
            ▪ Subtask 2.2.1.3: Add "Login" button. 
            ▪ Subtask 2.2.1.4: Add link to "Register" page for new users. 
            ▪ Subtask 2.2.1.5: Add "Forgot Password" link. 
        ◦ Task 2.2.2: Implement Client-Side Validation for Login Form
            ▪ Subtask 2.2.2.1: Implement validation for Email format. 
            ▪ Subtask 2.2.2.2: Ensure both fields are required. 
            ▪ Subtask 2.2.2.3: Display real-time feedback for invalid fields. 
        ◦ Task 2.2.3: Frontend API Integration for Account Login
            ▪ Subtask 2.2.3.1: Create service/hook to send login data to POST /api/auth/login. 
            ▪ Subtask 2.2.3.2: Handle success response (store JWT token, redirect to dashboard/previous page, display success message). 
            ▪ Subtask 2.2.3.3: Handle error responses (display specific error messages, e.g., "Invalid email or password"). 
        ◦ Task 2.2.4: Update Global Header UI
            ▪ Subtask 2.2.4.1: Ensure "Login" link is present in the header/login area. 
            ▪ Subtask 2.2.4.2: After successful login, replace "Login" link with user account link/dropdown. 
    • Backend Tasks:
        ◦ Task 2.2.5: Create Account Login API Endpoint
            ▪ Subtask 2.2.5.1: Design and implement POST /api/auth/login endpoint. 
            ▪ Subtask 2.2.5.2: Implement server-side validation for email and password. 
            ▪ Subtask 2.2.5.3: Retrieve user from MongoDB by email. 
            ▪ Subtask 2.2.5.4: Compare provided password with stored hashed password using bcrypt's compare function (or equivalent). 
            ▪ Subtask 2.2.5.5: If credentials are valid, generate a JWT (JSON Web Token) and send it in the response. 
            ▪ Subtask 2.2.5.6: Implement session management (e.g., store JWT in an HTTP-only, secure cookie). 
            ▪ Subtask 2.2.5.7: Return user data (excluding sensitive information) in the response. 
        ◦ Task 2.2.6: JWT Authentication Middleware
            ▪ Subtask 2.2.6.1: Implement middleware to verify JWT token on protected API routes. 
            ▪ Subtask 2.2.6.2: Extract user ID from JWT and make it available to route handlers. 
        ◦ Task 2.2.7: Error Handling & Security (Backend)
            ▪ Subtask 2.2.7.1: Implement rate limiting for login attempts. 
            ▪ Subtask 2.2.7.2: Log failed login attempts. 
    • Testing Tasks:
        ◦ Task 2.2.8: Write Unit Tests
            ▪ Subtask 2.2.8.1: Unit tests for frontend validation logic. 
            ▪ Subtask 2.2.8.2: Unit tests for backend password comparison. 
            ▪ Subtask 2.2.8.3: Unit tests for JWT generation and verification. 
        ◦ Task 2.2.9: Write Integration Tests
            ▪ Subtask 2.2.9.1: Test POST /api/auth/login with valid credentials (expect success). 
            ▪ Subtask 2.2.9.2: Test with invalid credentials (invalid email, incorrect password). 
            ▪ Subtask 2.2.9.3: Verify JWT token is returned and stored correctly. 
            ▪ Subtask 2.2.9.4: Test access to protected routes with and without valid JWT. 
        ◦ Task 2.2.10: Manual End-to-End Testing
            ▪ Subtask 2.2.10.1: Test full login flow from UI. 
            ▪ Subtask 2.2.10.2: Verify successful login and redirection. 
            ▪ Subtask 2.2.10.3: Test all validation messages on the UI. 
            ▪ Subtask 2.2.10.4: Test login with incorrect credentials. 
            ▪ Subtask 2.2.10.5: Verify user session is established.
Epic: Customer Account Management
Story 2.3: Log Out of Account (Customer)
Story: As a logged-in customer, I want to be able to log out of my account securely so that I can end my session and protect my personal information.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Logout" link/button is prominently available in the customer's account/header section when logged in. 
    2. Clicking the "Logout" link/button securely ends the customer's session on the server-side. 
    3. The customer is redirected to the homepage or login page after successful logout. 
    4. A confirmation message (e.g., "You have been logged out.") may be displayed. 
    5. After logging out, the customer can no longer access authenticated sections of the website without logging in again. 

Granular Tasks & Subtasks for Story 2.3:
    • Frontend Tasks:
        ◦ Task 2.3.1: Implement Logout UI Element 
            ▪ Subtask 2.3.1.1: Add "Logout" button/link to the customer account dropdown or header when a user is logged in. 
            ▪ Subtask 2.3.1.2: Ensure "Login" and "Register" links reappear after logout. 
        ◦ Task 2.3.2: Frontend API Integration for Logout 
            ▪ Subtask 2.3.2.1: Create service/hook to send a logout request to POST /api/auth/logout. 
            ▪ Subtask 2.3.2.2: On successful response, clear client-side session data (e.g., remove JWT from local storage/cookies). 
            ▪ Subtask 2.3.2.3: Redirect customer to the homepage or login page. 
            ▪ Subtask 2.3.2.4: Display a temporary success message (e.g., using a toast notification). 
    • Backend Tasks:
        ◦ Task 2.3.3: Create Logout API Endpoint 
            ▪ Subtask 2.3.3.1: Design and implement POST /api/auth/logout endpoint. 
            ▪ Subtask 2.3.3.2: Invalidate the user's session token on the server-side (e.g., add JWT to a blacklist, remove from active sessions store if using stateful sessions). 
            ▪ Subtask 2.3.3.3: Return a success response. 
            ▪ Subtask 2.3.3.4: Log the logout event. 
        ◦ Task 2.3.4: Session Invalidation Logic 
            ▪ Subtask 2.3.4.1: Implement mechanism for JWT blacklisting or revoking refresh tokens to ensure true server-side logout. 
    • Security Tasks (Specific to this Story):
        ◦ Task 2.3.5: Ensure Secure Token Invalidation 
            ▪ Subtask 2.3.5.1: Verify that after logout, the token cannot be reused to access protected resources. 
    • Testing Tasks:
        ◦ Task 2.3.6: Write Unit Tests 
            ▪ Subtask 2.3.6.1: Unit tests for client-side session clearing logic. 
            ▪ Subtask 2.3.6.2: Unit tests for backend token invalidation. 
        ◦ Task 2.3.7: Write Integration Tests 
            ▪ Subtask 2.3.7.1: Test POST /api/auth/logout after a successful login. 
            ▪ Subtask 2.3.7.2: Attempt to access a protected resource with the invalidated token (should fail). 
        ◦ Task 2.3.8: Manual End-to-End Testing 
            ▪ Subtask 2.3.8.1: Log in as a customer. 
            ▪ Subtask 2.3.8.2: Verify "Logout" link is visible. 
            ▪ Subtask 2.3.8.3: Click "Logout" and verify redirection and success message. 
            ▪ Subtask 2.3.8.4: Attempt to navigate back to a protected page (e.g., "My Account") without re-logging in (should be redirected to login).
Epic: Customer Account Management
Story 2.4: Manage Account Profile (Customer)
Story: As a logged-in customer, I want to view and update my personal profile information (e.g., name, email, phone number) so that my account details are accurate and up-to-date.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "My Profile" or "Account Details" section is accessible from the customer's account dashboard/menu. 
    2. Upon accessing this section, the customer's current profile information (First Name, Last Name, Email, Phone Number) is pre-filled in an editable form. 
    3. Customers can modify any of these fields. 
    4. Client-side validation is performed on updated fields (e.g., email format, phone number format). 
    5. Upon successful submission, the updated profile information is saved to the backend. 
    6. If the email address is changed, a re-verification process may be initiated (e.g., sending a confirmation email to the new address). 
    7. The customer receives a success confirmation message upon successful update. 
    8. If the update fails (e.g., email already exists), a clear and specific error message is displayed. 
    9. All profile updates are performed securely via authenticated API endpoints. 

Granular Tasks & Subtasks for Story 2.4:
    • Frontend Tasks:
        ◦ Task 2.4.1: Implement "My Profile" Page UI 
            ▪ Subtask 2.4.1.1: Create MyProfilePage component/route accessible via authenticated routes. 
            ▪ Subtask 2.4.1.2: Design and implement an editable form with fields for First Name, Last Name, Email, and Phone Number. 
            ▪ Subtask 2.4.1.3: Add "Save Changes" button. 
            ▪ Subtask 2.4.1.4: Add navigation link to "My Profile" in the customer dashboard/menu. 
        ◦ Task 2.4.2: Implement Frontend Data Fetching 
            ▪ Subtask 2.4.2.1: Create service/hook to fetch current user profile data from GET /api/user/profile. 
            ▪ Subtask 2.4.2.2: Pre-fill the form fields with fetched data. 
            ▪ Subtask 2.4.2.3: Handle loading states. 
        ◦ Task 2.4.3: Implement Client-Side Validation for Profile Form 
            ▪ Subtask 2.4.3.1: Implement validation for Email format (regex). 
            ▪ Subtask 2.4.3.2: Implement basic validation for name and phone number formats. 
            ▪ Subtask 2.4.3.3: Display real-time feedback for invalid fields. 
        ◦ Task 2.4.4: Frontend API Integration for Profile Update 
            ▪ Subtask 2.4.4.1: Create service/hook to send updated profile data to PUT /api/user/profile. 
            ▪ Subtask 2.4.4.2: Handle success response (display success message). 
            ▪ Subtask 2.4.4.3: Handle error responses (display specific error messages, e.g., "Email already in use"). 
    • Backend Tasks:
        ◦ Task 2.4.5: Create Fetch User Profile API Endpoint 
            ▪ Subtask 2.4.5.1: Design and implement GET /api/user/profile endpoint. 
            ▪ Subtask 2.4.5.2: Authenticate the user (using JWT middleware from 2.2). 
            ▪ Subtask 2.4.5.3: Retrieve user profile data from MongoDB based on authenticated user ID. 
            ▪ Subtask 2.4.5.4: Return non-sensitive profile information (First Name, Last Name, Email, Phone Number, etc.). 
        ◦ Task 2.4.6: Create Update User Profile API Endpoint 
            ▪ Subtask 2.4.6.1: Design and implement PUT /api/user/profile endpoint. 
            ▪ Subtask 2.4.6.2: Authenticate the user. 
            ▪ Subtask 2.4.6.3: Implement server-side validation for all incoming profile data (email format, uniqueness for new email, required fields). 
            ▪ Subtask 2.4.6.4: Update the User document in MongoDB with the new profile information. 
            ▪ Subtask 2.4.6.5: If email address is changed, trigger re-verification process (e.g., send verification email to new address with a token, require confirmation before updating email in DB). This is a more complex flow, consider it a stretch goal or separate story if time-consuming. 
            ▪ Subtask 2.4.6.6: Return success response. 
    • Testing Tasks:
        ◦ Task 2.4.7: Write Unit Tests 
            ▪ Subtask 2.4.7.1: Unit tests for frontend validation logic. 
            ▪ Subtask 2.4.7.2: Unit tests for backend profile update logic (data validation). 
        ◦ Task 2.4.8: Write Integration Tests 
            ▪ Subtask 2.4.8.1: Test GET /api/user/profile for authenticated user. 
            ▪ Subtask 2.4.8.2: Test PUT /api/user/profile with valid updates. 
            ▪ Subtask 2.4.8.3: Test PUT /api/user/profile with invalid data (e.g., invalid email format, email already exists). 
            ▪ Subtask 2.4.8.4: Test unauthorized access to profile endpoints. 
        ◦ Task 2.4.9: Manual End-to-End Testing 
            ▪ Subtask 2.4.9.1: Log in as a customer and navigate to "My Profile". 
            ▪ Subtask 2.4.9.2: Verify current profile information is pre-filled. 
            ▪ Subtask 2.4.9.3: Update various fields (name, phone) and save. Verify changes. 
            ▪ Subtask 2.4.9.4: Attempt to change email to an already existing one. Verify error message. 
            ▪ Subtask 2.4.9.5: Test client-side validation messages.
Epic: Customer Account Management
Story 2.5: Change Password (Customer)
Story: As a logged-in customer, I want to be able to change my account password so that I can maintain my account security.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Change Password" section or link is accessible from the customer's account dashboard/menu. 
    2. Upon accessing this section, the customer is presented with a form requiring: 
        ◦ Current Password (Required, for verification) 
        ◦ New Password (Required, strong password policy enforced: min 8 characters, mix of uppercase, lowercase, numbers, symbols) 
        ◦ Confirm New Password (Required, must match new password) 
    3. Client-side validation provides immediate feedback for invalid input. 
    4. Upon successful submission: 
        ◦ The new password is securely updated in the backend. 
        ◦ The customer receives a success confirmation message. 
        ◦ An email notification is sent to the customer's registered email address confirming the password change. 
    5. If the password change fails (e.g., incorrect current password, new password doesn't meet policy, new password matches old password, confirmation mismatch), a clear and specific error message is displayed. 
    6. All password changes are performed securely via authenticated API endpoints. 

Granular Tasks & Subtasks for Story 2.5:
    • Frontend Tasks:
        ◦ Task 2.5.1: Implement "Change Password" Page UI 
            ▪ Subtask 2.5.1.1: Create ChangePasswordPage component/route accessible via authenticated routes. 
            ▪ Subtask 2.5.1.2: Design and implement input fields for Current Password, New Password, and Confirm New Password. 
            ▪ Subtask 2.5.1.3: Add "Update Password" button. 
            ▪ Subtask 2.5.1.4: Add navigation link to "Change Password" in the customer dashboard/menu. 
        ◦ Task 2.5.2: Implement Client-Side Validation for Password Form 
            ▪ Subtask 2.5.2.1: Implement password strength validation for the new password. 
            ▪ Subtask 2.5.2.2: Implement "Confirm New Password" match validation. 
            ▪ Subtask 2.5.2.3: Ensure all fields are required. 
            ▪ Subtask 2.5.2.4: Display real-time feedback for invalid fields. 
        ◦ Task 2.5.3: Frontend API Integration for Password Change 
            ▪ Subtask 2.5.3.1: Create service/hook to send password change data to PUT /api/user/change-password. 
            ▪ Subtask 2.5.3.2: Handle success response (display success message). 
            ▪ Subtask 2.5.3.3: Handle error responses (display specific error messages, e.g., "Incorrect current password", "New password cannot be the same as old"). 
    • Backend Tasks:
        ◦ Task 2.5.4: Create Change Password API Endpoint
            ▪ Subtask 2.5.4.1: Design and implement PUT /api/user/change-password endpoint. 
            ▪ Subtask 2.5.4.2: Authenticate the user (using JWT middleware). 
            ▪ Subtask 2.5.4.3: Implement server-side validation for all incoming password data (new password strength, new password matches confirmation). 
            ▪ Subtask 2.5.4.4: Retrieve the user from MongoDB using the authenticated user ID. 
            ▪ Subtask 2.5.4.5: Verify the currentPassword by comparing it with the stored hashed password using bcrypt's compare function. If it doesn't match, return an error. 
            ▪ Subtask 2.5.4.6: Check if the newPassword is different from the currentPassword. If not, return an error. 
            ▪ Subtask 2.5.4.7: Hash the newPassword using the strong hashing algorithm. 
            ▪ Subtask 2.5.4.8: Update the hashedPassword in the User document in MongoDB. 
            ▪ Subtask 2.5.4.9: Invalidate the user's current session/JWT token(s) to force re-authentication with the new password for all active sessions. 
            ▪ Subtask 2.5.4.10: Return success response. 
            ▪ Subtask 2.5.4.11: Trigger sending of "Password Changed" notification email (integrate with Email Service Provider). 
        ◦ Task 2.5.5: Email Service Integration (Password Changed Notification)
            ▪ Subtask 2.5.5.1: Create "Password Changed" email template. 
            ▪ Subtask 2.5.5.2: Implement function to send this notification email upon successful password change. 
    • Security Tasks (Specific to this Story):
        ◦ Task 2.5.6: Enforce Robust Password Policy on Backend 
            ▪ Subtask 2.5.6.1: Ensure the backend rigorously checks new passwords against the defined strength policy. 
        ◦ Task 2.5.7: Secure Password Comparison 
            ▪ Subtask 2.5.7.1: Double-check that password comparison is done safely (e.g., using bcrypt.compare for constant-time comparison). 
        ◦ Task 2.5.8: Session Invalidation on Password Change 
            ▪ Subtask 2.5.8.1: Implement logic to invalidate all active sessions for the user after a password change to enhance security (prevents old tokens from being used). 
    • Testing Tasks:
        ◦ Task 2.5.9: Write Unit Tests 
            ▪ Subtask 2.5.9.1: Unit tests for frontend password validation. 
            ▪ Subtask 2.5.9.2: Unit tests for backend password comparison and hashing. 
        ◦ Task 2.5.10: Write Integration Tests 
            ▪ Subtask 2.5.10.1: Test PUT /api/user/change-password with correct current password and valid new password. 
            ▪ Subtask 2.5.10.2: Test with incorrect current password. 
            ▪ Subtask 2.5.10.3: Test with new password not meeting policy. 
            ▪ Subtask 2.5.10.4: Test with new password matching old password. 
            ▪ Subtask 2.5.10.5: Test with mismatched new password and confirmation. 
            ▪ Subtask 2.5.10.6: Verify session invalidation after password change. 
        ◦ Task 2.5.11: Manual End-to-End Testing 
            ▪ Subtask 2.5.11.1: Log in and navigate to "Change Password". 
            ▪ Subtask 2.5.11.2: Test successful password change, verify success message and notification email (if configured). 
            ▪ Subtask 2.5.11.3: Test all error scenarios on the UI (incorrect current, weak new, mismatch, same as old). 
            ▪ Subtask 2.5.11.4: After successful change, verify old password no longer works and new password does. 

Epic: Customer Account Management
Story 2.6: Reset Forgotten Password (Customer)
Story: As a customer who has forgotten my password, I want to be able to reset it securely so that I can regain access to my account.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Forgot Password?" link is available on the login page. 
    2. Clicking the link navigates the customer to a "Forgot Password" form. 
    3. The form requires the customer to enter their registered email address. 
    4. Upon submission, if the email is registered, a password reset link with a unique, time-limited token is sent to that email address. A confirmation message is displayed to the user (e.g., "If an account exists for that email, a password reset link has been sent."). 
    5. The reset link directs the customer to a "Reset Password" page. 
    6. On the "Reset Password" page, the customer can enter a new password and confirm it. 
    7. Client-side validation is performed on the new password (strong password policy, confirmation match). 
    8. Upon successful submission, the new password is securely updated in the backend, and the token is invalidated. 
    9. The customer is redirected to the login page and receives a success message (e.g., "Your password has been reset successfully. Please log in with your new password."). 
    10. If the reset link is invalid, expired, or already used, an appropriate error message is displayed. 
    11. All processes are performed securely. 

Granular Tasks & Subtasks for Story 2.6:
    • Frontend Tasks (Request Password Reset):
        ◦ Task 2.6.1: Implement "Forgot Password" Link & Request Form UI 
            ▪ Subtask 2.6.1.1: Add "Forgot Password?" link to the LoginPage. 
            ▪ Subtask 2.6.1.2: Create ForgotPasswordRequestPage component/route. 
            ▪ Subtask 2.6.1.3: Design and implement input field for Email Address and "Send Reset Link" button. 
        ◦ Task 2.6.2: Implement Client-Side Validation for Request Form 
            ▪ Subtask 2.6.2.1: Validate email format. 
            ▪ Subtask 2.6.2.2: Ensure email field is required. 
        ◦ Task 2.6.3: Frontend API Integration for Requesting Reset 
            ▪ Subtask 2.6.3.1: Create service/hook to send email to POST /api/auth/forgot-password. 
            ▪ Subtask 2.6.3.2: Handle success response (display generic confirmation message to prevent email enumeration). 
            ▪ Subtask 2.6.3.3: Handle error responses (e.g., server errors, but avoid specific messages for invalid emails). 
    • Frontend Tasks (Reset Password):
        ◦ Task 2.6.4: Implement "Reset Password" Page UI 
            ▪ Subtask 2.6.4.1: Create ResetPasswordPage component/route (e.g., /reset-password?token=XYZ). 
            ▪ Subtask 2.6.4.2: Design and implement input fields for New Password and Confirm New Password, and "Reset Password" button. 
        ◦ Task 2.6.5: Implement Client-Side Validation for Reset Form 
            ▪ Subtask 2.6.5.1: Implement new password strength validation. 
            ▪ Subtask 2.6.5.2: Implement "Confirm New Password" match validation. 
        ◦ Task 2.6.6: Frontend API Integration for Resetting Password 
            ▪ Subtask 2.6.6.1: Create service/hook to send new password and token to POST /api/auth/reset-password. 
            ▪ Subtask 2.6.6.2: Handle success response (redirect to login, display success message). 
            ▪ Subtask 2.6.6.3: Handle error responses (display specific messages for invalid/expired token, weak password). 
    • Backend Tasks (Request Password Reset):
        ◦ Task 2.6.7: Create Forgot Password Request API Endpoint 
            ▪ Subtask 2.6.7.1: Design and implement POST /api/auth/forgot-password. 
            ▪ Subtask 2.6.7.2: Server-side validation for email format. 
            ▪ Subtask 2.6.7.3: Look up user by email. 
            ▪ Subtask 2.6.7.4: If user found, generate a unique, cryptographically secure, time-limited reset token. 
            ▪ Subtask 2.6.7.5: Store the hashed token (and its expiry) in the User document or a dedicated PasswordResetToken collection. 
            ▪ Subtask 2.6.7.6: Construct the reset link (e.g., frontend_url/reset-password?token=XYZ). 
            ▪ Subtask 2.6.7.7: Send the reset link to the user's email address via Email Service Provider. 
            ▪ Subtask 2.6.7.8: Always return a generic success message, regardless of whether the email exists, to prevent user enumeration. 
    • Backend Tasks (Reset Password):
        ◦ Task 2.6.8: Create Reset Password API Endpoint 
            ▪ Subtask 2.6.8.1: Design and implement POST /api/auth/reset-password. 
            ▪ Subtask 2.6.8.2: Server-side validation for new password strength and confirmation match. 
            ▪ Subtask 2.6.8.3: Extract and validate the reset token from the request. 
            ▪ Subtask 2.6.8.4: Look up the user by the token (or hashed token). 
            ▪ Subtask 2.6.8.5: Verify token validity (not expired, not used). 
            ▪ Subtask 2.6.8.6: Hash the newPassword. 
            ▪ Subtask 2.6.8.7: Update the user's hashedPassword in MongoDB. 
            ▪ Subtask 2.6.8.8: Invalidate the used reset token (mark as used or delete). 
            ▪ Subtask 2.6.8.9: Invalidate any existing active user sessions (JWTs) for security. 
            ▪ Subtask 2.6.8.10: Return success response. 
    • Email Service Integration:
        ◦ Task 2.6.9: Design Password Reset Email Template 
            ▪ Subtask 2.6.9.1: Create a clear and secure email template for the password reset link. 
    • Security Tasks (Specific to this Story):
        ◦ Task 2.6.10: Secure Token Generation & Storage 
            ▪ Subtask 2.6.10.1: Ensure reset tokens are long, random, and cryptographically secure. 
            ▪ Subtask 2.6.10.2: Store hashed tokens in DB, not plain text. 
            ▪ Subtask 2.6.10.3: Implement strict expiry for tokens (e.g., 1 hour). 
            ▪ Subtask 2.6.10.4: Ensure token is single-use. 
        ◦ Task 2.6.11: Rate Limiting for Reset Requests 
            ▪ Subtask 2.6.11.1: Implement rate limiting on POST /api/auth/forgot-password to prevent abuse. 
        ◦ Task 2.6.12: Prevent User Enumeration 
            ▪ Subtask 2.6.12.1: Ensure the "Forgot Password" endpoint always returns a generic success message to prevent attackers from determining valid email addresses. 
    • Testing Tasks:
        ◦ Task 2.6.13: Write Unit Tests 
            ▪ Subtask 2.6.13.1: Unit tests for frontend validation. 
            ▪ Subtask 2.6.13.2: Unit tests for backend token generation/validation. 
        ◦ Task 2.6.14: Write Integration Tests 
            ▪ Subtask 2.6.14.1: Test POST /api/auth/forgot-password with valid/invalid emails (verify generic success and email trigger for valid). 
            ▪ Subtask 2.6.14.2: Simulate receiving email, extract token, test POST /api/auth/reset-password with valid token and new password. 
            ▪ Subtask 2.6.14.3: Test with expired token, invalid token, already used token. 
            ▪ Subtask 2.6.14.4: Verify new password works and old password does not. 
            ▪ Subtask 2.6.14.5: Verify session invalidation after reset. 
        ◦ Task 2.6.15: Manual End-to-End Testing 
            ▪ Subtask 2.6.15.1: Test full "Forgot Password" flow from UI, including email receipt. 
            ▪ Subtask 2.6.15.2: Test invalid/expired link scenarios. 
            ▪ Subtask 2.6.15.3: Verify security measures (e.g., generic message for unknown email).
Epic: Customer Account Management
Story 2.7: Manage Shipping Addresses (Customer)
Story: As a logged-in customer, I want to add, edit, and delete my shipping addresses so that I can conveniently select them during checkout.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "My Addresses" or "Shipping Addresses" section is accessible from the customer's account dashboard/menu. 
    2. This section displays a list of the customer's saved shipping addresses. 
    3. For each address, an "Edit" and "Delete" option is available. 
    4. There is an option to "Add New Address". 
    5. Adding a New Address: 
        ◦ A form is presented with fields for: Full Name, Address Line 1, Address Line 2 (Optional), City, State/Province, Postal Code, Country, Phone Number. 
        ◦ Client-side validation is performed on required fields and format. 
        ◦ Upon submission, the new address is saved to the backend and added to the customer's list. 
    6. Editing an Existing Address: 
        ◦ Clicking "Edit" pre-fills the address form with the selected address's details. 
        ◦ Customers can modify any field. 
        ◦ Client-side validation is performed. 
        ◦ Upon submission, the updated address is saved to the backend. 
    7. Deleting an Address: 
        ◦ Clicking "Delete" prompts a confirmation (e.g., "Are you sure you want to delete this address?"). 
        ◦ Upon confirmation, the address is removed from the customer's saved list. 
        ◦ If an address is currently associated with a pending order, deletion should be prevented or require a warning. (Though for simplicity, initially we can assume addresses are only for future use). 
    8. A confirmation message is displayed for successful add, edit, or delete operations. 
    9. All operations are performed securely via authenticated API endpoints. 

Granular Tasks & Subtasks for Story 2.7:
    • Frontend Tasks:
        ◦ Task 2.7.1: Implement "My Addresses" Page UI 
            ▪ Subtask 2.7.1.1: Create MyAddressesPage component/route accessible via authenticated routes. 
            ▪ Subtask 2.7.1.2: Design and implement a layout to display a list of addresses. 
            ▪ Subtask 2.7.1.3: Add "Add New Address" button. 
            ▪ Subtask 2.7.1.4: For each address, display details clearly and include "Edit" and "Delete" buttons. 
            ▪ Subtask 2.7.1.5: Add navigation link to "My Addresses" in the customer dashboard/menu. 
        ◦ Task 2.7.2: Develop Address Form UI (Reusable for Add/Edit) 
            ▪ Subtask 2.7.2.1: Create AddressForm component with fields: Full Name, Address Line 1, Address Line 2 (Optional), City, State/Province, Postal Code, Country, Phone Number. 
            ▪ Subtask 2.7.2.2: Implement form submission button. 
        ◦ Task 2.7.3: Implement Client-Side Validation for Address Form 
            ▪ Subtask 2.7.3.1: Implement validation for all required fields (non-empty). 
            ▪ Subtask 2.7.3.2: Implement basic format validation (e.g., postal code regex). 
            ▪ Subtask 2.7.3.3: Display real-time feedback for invalid fields. 
        ◦ Task 2.7.4: Frontend API Integration: Fetch Addresses 
            ▪ Subtask 2.7.4.1: Create service/hook to fetch user's addresses from GET /api/user/addresses. 
            ▪ Subtask 2.7.4.2: Display fetched addresses in the list. 
            ▪ Subtask 2.7.4.3: Handle loading states. 
        ◦ Task 2.7.5: Frontend API Integration: Add New Address 
            ▪ Subtask 2.7.5.1: Integrate AddressForm with POST /api/user/addresses. 
            ▪ Subtask 2.7.5.2: Redirect/update list on success, display confirmation. 
        ◦ Task 2.7.6: Frontend API Integration: Edit Address 
            ▪ Subtask 2.7.6.1: On "Edit" click, pre-fill AddressForm with existing address data. 
            ▪ Subtask 2.7.6.2: Integrate AddressForm with PUT /api/user/addresses/:addressId. 
            ▪ Subtask 2.7.6.3: Update list on success, display confirmation. 
        ◦ Task 2.7.7: Frontend API Integration: Delete Address 
            ▪ Subtask 2.7.7.1: Implement "Delete" confirmation dialog. 
            ▪ Subtask 2.7.7.2: Integrate with DELETE /api/user/addresses/:addressId. 
            ▪ Subtask 2.7.7.3: Remove address from list on success, display confirmation. 
    • Backend Tasks:
        ◦ Task 2.7.8: Update User Data Model for Addresses 
            ▪ Subtask 2.7.8.1: Add an array field (e.g., shippingAddresses) to the User schema in MongoDB, containing address objects. Each address object should have a unique ID. 
        ◦ Task 2.7.9: Create Fetch Addresses API Endpoint 
            ▪ Subtask 2.7.9.1: Design and implement GET /api/user/addresses. 
            ▪ Subtask 2.7.9.2: Authenticate the user. 
            ▪ Subtask 2.7.9.3: Retrieve the shippingAddresses array for the authenticated user. 
        ◦ Task 2.7.10: Create Add New Address API Endpoint 
            ▪ Subtask 2.7.10.1: Design and implement POST /api/user/addresses. 
            ▪ Subtask 2.7.10.2: Authenticate the user. 
            ▪ Subtask 2.7.10.3: Implement server-side validation for all address fields. 
            ▪ Subtask 2.7.10.4: Generate a unique ID for the new address. 
            ▪ Subtask 2.7.10.5: Add the new address object to the shippingAddresses array in the user's document. 
        ◦ Task 2.7.11: Create Edit Address API Endpoint 
            ▪ Subtask 2.7.11.1: Design and implement PUT /api/user/addresses/:addressId. 
            ▪ Subtask 2.7.11.2: Authenticate the user and verify addressId belongs to the user. 
            ▪ Subtask 2.7.11.3: Implement server-side validation for updated address fields. 
            ▪ Subtask 2.7.11.4: Find and update the specific address object within the shippingAddresses array in the user's document. 
        ◦ Task 2.7.12: Create Delete Address API Endpoint 
            ▪ Subtask 2.7.12.1: Design and implement DELETE /api/user/addresses/:addressId. 
            ▪ Subtask 2.7.12.2: Authenticate the user and verify addressId belongs to the user. 
            ▪ Subtask 2.7.12.3: Implement logic to prevent deletion if the address is linked to a pending order (this would involve querying the Order collection, which is a stretch goal/future enhancement). For now, simply remove. 
            ▪ Subtask 2.7.12.4: Remove the address object from the shippingAddresses array in the user's document. 
        ◦ Task 2.7.13: Error Handling & Security (Backend) 
            ▪ Subtask 2.7.13.1: Implement robust error handling for invalid data, non-existent addresses, or unauthorized access. 
            ▪ Subtask 2.7.13.2: Ensure all address operations correctly verify the user's ownership of the address. 
    • Testing Tasks:
        ◦ Task 2.7.14: Write Unit Tests 
            ▪ Subtask 2.7.14.1: Unit tests for frontend form validation. 
            ▪ Subtask 2.7.14.2: Unit tests for backend address manipulation logic. 
        ◦ Task 2.7.15: Write Integration Tests 
            ▪ Subtask 2.7.15.1: Test GET /api/user/addresses for authenticated users. 
            ▪ Subtask 2.7.15.2: Test POST /api/user/addresses with valid and invalid data. 
            ▪ Subtask 2.7.15.3: Test PUT /api/user/addresses/:addressId with valid updates, invalid data, and incorrect address ID. 
            ▪ Subtask 2.7.15.4: Test DELETE /api/user/addresses/:addressId for own addresses and attempts to delete others' addresses. 
            ▪ Subtask 2.7.15.5: Test unauthorized access to all address endpoints. 
        ◦ Task 2.7.16: Manual End-to-End Testing 
            ▪ Subtask 2.7.16.1: Log in and navigate to "My Addresses". 
            ▪ Subtask 2.7.16.2: Add a new address, verify it appears in the list. 
            ▪ Subtask 2.7.16.3: Edit an existing address, verify changes. 
            ▪ Subtask 2.7.16.4: Delete an address, verify removal from list. 
            ▪ Subtask 2.7.16.5: Test all client-side validation messages. 
            ▪ Subtask 2.7.16.6: Test error messages for failed operations.
Epic: Customer Account Management
Story 2.8: View Order History (Customer)
Story: As a logged-in customer, I want to view a list of all my past orders so that I can keep track of my purchases.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "My Orders" or "Order History" section is accessible from the customer's account dashboard/menu. 
    2. This section displays a paginated list of all orders placed by the logged-in customer. 
    3. For each order in the list, the following high-level details are displayed: 
        ◦ Order Number/ID 
        ◦ Order Date 
        ◦ Total Amount 
        ◦ Order Status (e.g., "Pending", "Processing", "Shipped", "Delivered", "Cancelled") 
        ◦ A "View Details" button/link to see the full order details. 
    4. Orders are displayed in reverse chronological order (newest first) by default. 
    5. All order history retrieval is performed securely via authenticated API endpoints. 

Granular Tasks & Subtasks for Story 2.8:
    • Frontend Tasks:
        ◦ Task 2.8.1: Implement "My Orders" Page UI 
            ▪ Subtask 2.8.1.1: Create MyOrdersPage component/route accessible via authenticated routes. 
            ▪ Subtask 2.8.1.2: Design and implement a table or list layout to display order summaries. 
            ▪ Subtask 2.8.1.3: Add "View Details" link/button for each order row. 
            ▪ Subtask 2.8.1.4: Add navigation link to "My Orders" in the customer dashboard/menu. 
        ◦ Task 2.8.2: Implement Pagination UI for Orders 
            ▪ Subtask 2.8.2.1: Reuse/adapt Pagination component from Story 1.1. 
            ▪ Subtask 2.8.2.2: Integrate pagination controls with the order list. 
        ◦ Task 2.8.3: Frontend API Integration: Fetch Order History 
            ▪ Subtask 2.8.3.1: Create service/hook to fetch user's orders from GET /api/user/orders. 
            ▪ Subtask 2.8.3.2: Pass pagination parameters (page, limit) and sorting parameters (sortBy, sortOrder). 
            ▪ Subtask 2.8.3.3: Map fetched order data to the UI. 
            ▪ Subtask 2.8.3.4: Handle loading states and display "No orders found" message. 
        ◦ Task 2.8.4: Display Order Summary Details 
            ▪ Subtask 2.8.4.1: Ensure Order Number, Order Date, Total Amount, and Order Status are displayed for each order. 
    • Backend Tasks:
        ◦ Task 2.8.5: Create Fetch Order History API Endpoint 
            ▪ Subtask 2.8.5.1: Design and implement GET /api/user/orders. 
            ▪ Subtask 2.8.5.2: Authenticate the user. 
            ▪ Subtask 2.8.5.3: Query the Order collection in MongoDB, filtering by the authenticated userId. 
            ▪ Subtask 2.8.5.4: Implement pagination logic (skip/limit) on the query. 
            ▪ Subtask 2.8.5.5: Implement default sorting by orderDate (descending/newest first). 
            ▪ Subtask 2.8.5.6: Selectively return only the summary fields required by the frontend (Order ID, Date, Total, Status). 
            ▪ Subtask 2.8.5.7: Return total order count for pagination. 
        ◦ Task 2.8.6: Ensure Order Data Model Supports Querying 
            ▪ Subtask 2.8.6.1: Verify Order collection schema includes userId, orderDate, totalAmount, status, orderNumber/ID. (This assumes Order model is already defined from Epic 3: Checkout Process). 
            ▪ Subtask 2.8.6.2: Ensure appropriate indexes are on userId and orderDate for efficient querying. 
        ◦ Task 2.8.7: Error Handling & Security (Backend) 
            ▪ Subtask 2.8.7.1: Implement robust error handling for database queries. 
            ▪ Subtask 2.8.7.2: Crucially, ensure a user can only fetch their own orders, never another user's. 
    • Testing Tasks:
        ◦ Task 2.8.8: Write Unit Tests 
            ▪ Subtask 2.8.8.1: Unit tests for frontend order display logic. 
            ▪ Subtask 2.8.8.2: Unit tests for backend order filtering by userId and sorting. 
        ◦ Task 2.8.9: Write Integration Tests 
            ▪ Subtask 2.8.9.1: Test GET /api/user/orders for an authenticated user with existing orders. 
            ▪ Subtask 2.8.9.2: Test for a user with no orders (expect empty list). 
            ▪ Subtask 2.8.9.3: Test with pagination parameters. 
            ▪ Subtask 2.8.9.4: Test unauthorized access (should return 401/403). 
            ▪ Subtask 2.8.9.5: Attempt to fetch orders for a different user ID (should fail). 
        ◦ Task 2.8.10: Manual End-to-End Testing 
            ▪ Subtask 2.8.10.1: Log in as a customer and navigate to "My Orders". 
            ▪ Subtask 2.8.10.2: Verify the list of past orders is displayed correctly. 
            ▪ Subtask 2.8.10.3: Check pagination if multiple pages of orders exist. 
            ▪ Subtask 2.8.10.4: Verify correct summary details are shown for each order. 
            ▪ Subtask 2.8.10.5: Test viewing as a user with no orders.
Story 2.9: View Order Details (Customer)
Story: As a logged-in customer, I want to view the full details of a specific past order so that I can see what I purchased, where it was shipped, and its current status.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. Clicking "View Details" from an order in the "Order History" list (Story 2.8) navigates the customer to a dedicated "Order Details" page for that order. 
    2. The URL for the order details page is unique (e.g., /my-account/orders/:orderId). 
    3. The page displays comprehensive information for the specific order, including: 
        ◦ Order Number/ID 
        ◦ Order Date 
        ◦ Total Amount 
        ◦ Order Status 
        ◦ Shipping Address (full details) 
        ◦ Billing Address (full details) 
        ◦ Payment Method Used (e.g., "PayPal", "Card ending in ****1234") - Note: Never full card details. 
        ◦ A list of all purchased items (Product Name, Image, Quantity, Unit Price, Line Total). 
        ◦ Subtotal, Shipping Cost, Tax, Discounts applied. 
    4. If available, a tracking number and link are displayed for shipped orders. 
    5. All order details retrieval is performed securely via authenticated API endpoints. 

Granular Tasks & Subtasks for Story 2.9:
    • Frontend Tasks:
        ◦ Task 2.9.1: Develop Order Details Page UI Layout 
            ▪ Subtask 2.9.1.1: Create OrderDetailsPage component/route accessible via authenticated routes. 
            ▪ Subtask 2.9.1.2: Design and implement sections for Order Summary, Shipping/Billing Addresses, Payment Info, and Ordered Items list. 
            ▪ Subtask 2.9.1.3: Implement UI for displaying tracking number and link. 
        ◦ Task 2.9.2: Implement Frontend API Integration for Order Details 
            ▪ Subtask 2.9.2.1: Create service/hook to fetch single order by ID from GET /api/user/orders/:orderId. 
            ▪ Subtask 2.9.2.2: Pass orderId extracted from the URL. 
            ▪ Subtask 2.9.2.3: Handle loading states and display "Order Not Found" or "Unauthorized" errors gracefully. 
        ◦ Task 2.9.3: Dynamic Content Rendering for Order Details 
            ▪ Subtask 2.9.3.1: Display all top-level order details (Order Number, Date, Total, Status, Shipping/Billing, Payment Method). 
            ▪ Subtask 2.9.3.2: Iterate through ordered items and display product details (Name, Image, Quantity, Unit Price, Line Total). 
            ▪ Subtask 2.9.3.3: Conditionally display tracking information if present. 
            ▪ Subtask 2.9.3.4: Display breakdown of Subtotal, Shipping, Tax, Discounts. 
        ◦ Task 2.9.4: Link from Order History to Order Details 
            ▪ Subtask 2.9.4.1: Ensure "View Details" button/link in MyOrdersPage (Story 2.8) correctly navigates to the OrderDetailsPage with the correct orderId. 
    • Backend Tasks:
        ◦ Task 2.9.5: Create Fetch Single Order Details API Endpoint 
            ▪ Subtask 2.9.5.1: Design and implement GET /api/user/orders/:orderId. 
            ▪ Subtask 2.9.5.2: Authenticate the user. 
            ▪ Subtask 2.9.5.3: Query the Order collection by _id (or orderNumber if preferred) for the authenticated userId. This is critical for security. 
            ▪ Subtask 2.9.5.4: Populate necessary nested data (e.g., product details for ordered items, so product names and images are available without extra lookups). 
            ▪ Subtask 2.9.5.5: Return all comprehensive order details as specified in ACs, ensuring no sensitive payment details are exposed. 
        ◦ Task 2.9.6: Verify Order Data Model for Comprehensive Details 
            ▪ Subtask 2.9.6.1: Confirm Order collection schema includes: shippingAddress, billingAddress, paymentMethod (type, last 4 digits), items array (with productId, productName, quantity, unitPrice, productImage), subtotal, shippingCost, taxAmount, discountAmount, trackingNumber, trackingLink. (This confirms the model defined in Epic 3 will support these details). 
        ◦ Task 2.9.7: Error Handling & Security (Backend) 
            ▪ Subtask 2.9.7.1: Implement robust error handling (e.g., HTTP 404 for non-existent order, HTTP 403 for order not belonging to user). 
            ▪ Subtask 2.9.7.2: Ensure stringent authorization: a user can only retrieve details for their own orders. 
    • Testing Tasks:
        ◦ Task 2.9.8: Write Unit Tests 
            ▪ Subtask 2.9.8.1: Unit tests for frontend data parsing and display logic. 
            ▪ Subtask 2.9.8.2: Unit tests for backend order retrieval logic with userId and orderId filtering. 
        ◦ Task 2.9.9: Write Integration Tests 
            ▪ Subtask 2.9.9.1: Test GET /api/user/orders/:orderId for an authenticated user with a valid order ID. 
            ▪ Subtask 2.9.9.2: Test with an invalid orderId (expect 404). 
            ▪ Subtask 2.9.9.3: Test with a valid orderId but belonging to another user (expect 403 Forbidden). 
            ▪ Subtask 2.9.9.4: Verify all specified fields are returned correctly. 
        ◦ Task 2.9.10: Manual End-to-End Testing 
            ▪ Subtask 2.9.10.1: Log in and navigate to "My Orders". 
            ▪ Subtask 2.9.10.2: Click "View Details" on a past order. 
            ▪ Subtask 2.9.10.3: Verify all order details (summary, addresses, payment, items, totals, tracking) are displayed accurately. 
            ▪ Subtask 2.9.10.4: Test cases with different order statuses and content (e.g., order with discount, order with multiple items). 
            ▪ Subtask 2.9.10.5: Attempt to directly access an order URL with an invalid ID or an ID belonging to another user.
Epic: Checkout Process
Story 3.1: Add Product to Cart (Customer)
Story: As a customer, I want to add products from the product list or details page to my shopping cart so that I can proceed to checkout.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. An "Add to Cart" button is prominently displayed on both the Product List page (for each product card) and the Product Details page. 
    2. Clicking "Add to Cart" adds the selected product to the customer's shopping cart. 
    3. If a product is out of stock, the "Add to Cart" button is disabled (as per Story 1.2). 
    4. If the product is successfully added, a visual confirmation is provided (e.g., a mini-cart update, a small toast notification, or a brief animation). 
    5. The quantity of items in the cart (e.g., an icon in the header) is updated in real-time. 
    6. Customers can add multiple units of the same product to the cart (if stock allows). 
    7. The cart content is persistent, ideally across sessions (for logged-in users) or based on browser storage (for guests). 
    8. Adding an already-in-cart item should increment its quantity, not add a duplicate entry. 

Granular Tasks & Subtasks for Story 3.1:
    • Frontend Tasks:
        ◦ Task 3.1.1: Implement "Add to Cart" Button UI 
            ▪ Subtask 3.1.1.1: Ensure "Add to Cart" button is present on ProductCard (from Story 1.1) and ProductDetailsPage (from Story 1.2). 
            ▪ Subtask 3.1.1.2: Implement logic to disable button if product stockQuantity is 0. 
            ▪ Subtask 3.1.1.3: For Product Details page, implement a quantity selector (input field/+/- buttons) alongside the "Add to Cart" button. 
        ◦ Task 3.1.2: Implement Mini-Cart / Cart Icon in Header 
            ▪ Subtask 3.1.2.1: Design and implement a shopping cart icon (e.g., a basket) in the global header. 
            ▪ Subtask 3.1.2.2: Implement a badge/number overlay on the icon to display the current total quantity of items in the cart. 
            ▪ Subtask 3.1.2.3: Ensure the icon links to the main cart page (Story 3.2). 
        ◦ Task 3.1.3: Frontend API Integration for Adding to Cart 
            ▪ Subtask 3.1.3.1: Create service/hook to send productId and quantity to POST /api/cart/add. 
            ▪ Subtask 3.1.3.2: Handle success response by updating the mini-cart count. 
            ▪ Subtask 3.1.3.3: Implement visual confirmation (toast notification or subtle animation). 
            ▪ Subtask 3.1.3.4: Handle error responses (e.g., "Not enough stock," "Product not found"). 
        ◦ Task 3.1.4: Client-Side Cart State Management 
            ▪ Subtask 3.1.4.1: Implement a global state management solution (e.g., Redux, Zustand, React Context) to store the current cart state (item count, potentially item details). 
            ▪ Subtask 3.1.4.2: Update the cart state after POST /api/cart/add success. 
            ▪ Subtask 3.1.4.3: On initial page load, fetch current cart state to populate mini-cart. 
    • Backend Tasks:
        ◦ Task 3.1.5: Design Cart Data Model 
            ▪ Subtask 3.1.5.1: Define MongoDB schema for Cart collection. 
            ▪ Subtask 3.1.5.2: Cart should include userId (optional for guests), sessionId (for guests), items array. 
            ▪ Subtask 3.1.5.3: Each item in the array should contain productId, name, image, price, quantity, subtotal. 
            ▪ Subtask 3.1.5.4: Include createdAt, updatedAt for cart lifetime management. 
        ◦ Task 3.1.6: Create Add to Cart API Endpoint 
            ▪ Subtask 3.1.6.1: Design and implement POST /api/cart/add. 
            ▪ Subtask 3.1.6.2: Authenticate user (if logged in) or identify by session ID (for guests). 
            ▪ Subtask 3.1.6.3: Server-side validation for productId and quantity. 
            ▪ Subtask 3.1.6.4: Fetch product details (price, stock, image, name) from Product collection. 
            ▪ Subtask 3.1.6.5: Check product availability/stock: If quantity requested exceeds stockQuantity, return an error. 
            ▪ Subtask 3.1.6.6: If product already exists in cart, increment quantity of existing item. 
            ▪ Subtask 3.1.6.7: If product is new to cart, add a new item entry. 
            ▪ Subtask 3.1.6.8: Save/update the Cart document in MongoDB. 
            ▪ Subtask 3.1.6.9: Return updated cart summary (e.g., total item count, total price). 
        ◦ Task 3.1.7: Implement Guest Cart Management 
            ▪ Subtask 3.1.7.1: Implement logic to generate and manage a sessionId for guest users. 
            ▪ Subtask 3.1.7.2: Store sessionId in a secure, HTTP-only cookie or similar mechanism. 
            ▪ Subtask 3.1.7.3: When a guest logs in, merge their guest cart with their existing user cart (or transfer items if user has no active cart). 
        ◦ Task 3.1.8: Create Get Cart Details API Endpoint (for initial load) 
            ▪ Subtask 3.1.8.1: Design and implement GET /api/cart. 
            ▪ Subtask 3.1.8.2: Authenticate user or identify by session ID. 
            ▪ Subtask 3.1.8.3: Return the current cart contents (items and summary). 
    • Testing Tasks:
        ◦ Task 3.1.9: Write Unit Tests 
            ▪ Subtask 3.1.9.1: Unit tests for frontend cart state update logic. 
            ▪ Subtask 3.1.9.2: Unit tests for backend cart logic (add new item, increment existing, stock check). 
        ◦ Task 3.1.10: Write Integration Tests 
            ▪ Subtask 3.1.10.1: Test POST /api/cart/add with valid product and quantity. 
            ▪ Subtask 3.1.10.2: Test adding same product multiple times. 
            ▪ Subtask 3.1.10.3: Test adding product when out of stock. 
            ▪ Subtask 3.1.10.4: Test GET /api/cart for empty and populated carts. 
            ▪ Subtask 3.1.10.5: Test guest cart persistence across requests (using session ID). 
            ▪ Subtask 3.1.10.6: Test merging guest cart upon login. 
        ◦ Task 3.1.11: Manual End-to-End Testing 
            ▪ Subtask 3.1.11.1: Test adding products from list page and details page. 
            ▪ Subtask 3.1.11.2: Verify mini-cart updates in header. 
            ▪ Subtask 3.1.11.3: Test adding multiple quantities of the same item. 
            ▪ Subtask 3.1.11.4: Test "Add to Cart" for out-of-stock items (button disabled/error). 
            ▪ Subtask 3.1.11.5: Test adding items as a guest, then logging in to verify cart merge.
Epic: Checkout Process
Story 3.2: View & Manage Cart (Customer)
Story: As a customer, I want to view the items in my shopping cart, update quantities, and remove items so that I can review and adjust my order before proceeding to checkout.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "View Cart" link/button is prominently available (e.g., from the mini-cart in the header). 
    2. The cart page displays all items in the cart with the following details: 
        ◦ Product Name 
        ◦ Product Image 
        ◦ Quantity 
        ◦ Unit Price 
        ◦ Subtotal (for each item) 
        ◦ Total Price (for all items in the cart) 
    3. Customers can update the quantity of each item. 
        ◦ Quantity input fields or +/- buttons are provided. 
        ◦ Updates are reflected in the subtotal and total price. 
    4. Customers can remove items from the cart. 
        ◦ A "Remove" button or icon is provided for each item. 
        ◦ Removal updates the subtotal and total price. 
    5. If the cart is empty, a clear message (e.g., "Your cart is empty") is displayed. 
    6. A "Proceed to Checkout" button is available when the cart is not empty. 
    7. The cart page should be accessible for both logged-in users and guest users (using session-based persistence). 
    8. The cart page is responsive and usable on various devices. 

Granular Tasks & Subtasks for Story 3.2:
    • Frontend Tasks:
        ◦ Task 3.2.1: Implement Cart Page UI Layout 
            ▪ Subtask 3.2.1.1: Create CartPage component/route. 
            ▪ Subtask 3.2.1.2: Display items in a table or list format. 
            ▪ Subtask 3.2.1.3: Include columns/sections for Product Image, Name, Quantity, Unit Price, Subtotal, Remove. 
            ▪ Subtask 3.2.1.4: Display total price below the item list. 
            ▪ Subtask 3.2.1.5: Add "Proceed to Checkout" button. 
            ▪ Subtask 3.2.1.6: Display "Empty Cart" message when applicable. 
        ◦ Task 3.2.2: Implement Quantity Update Functionality 
            ▪ Subtask 3.2.2.1: Use input fields or +/- buttons for quantity selection. 
            ▪ Subtask 3.2.2.2: Implement real-time subtotal and total price updates as quantity changes. 
            ▪ Subtask 3.2.2.3: Implement client-side validation (e.g., prevent negative quantities). 
        ◦ Task 3.2.3: Implement Item Removal Functionality 
            ▪ Subtask 3.2.3.1: Add "Remove" button/icon for each item. 
            ▪ Subtask 3.2.3.2: Implement confirmation dialog before removal (optional, but recommended). 
            ▪ Subtask 3.2.3.3: Update total price after item removal. 
        ◦ Task 3.2.4: Frontend API Integration: Fetch Cart Details 
            ▪ Subtask 3.2.4.1: Reuse GET /api/cart service/hook from Story 3.1 to fetch cart data. 
            ▪ Subtask 3.2.4.2: Display cart items and total price. 
            ▪ Subtask 3.2.4.3: Handle loading states and empty cart scenario. 
        ◦ Task 3.2.5: Frontend API Integration: Update Cart Item Quantity 
            ▪ Subtask 3.2.5.1: Create service/hook to send productId and quantity to PUT /api/cart/update. 
            ▪ Subtask 3.2.5.2: Update cart display on success. 
        ◦ Task 3.2.6: Frontend API Integration: Remove Cart Item 
            ▪ Subtask 3.2.6.1: Create service/hook to send productId to DELETE /api/cart/remove. 
            ▪ Subtask 3.2.6.2: Update cart display on success. 
    • Backend Tasks:
        ◦ Task 3.2.7: Create Update Cart Item Quantity API Endpoint 
            ▪ Subtask 3.2.7.1: Design and implement PUT /api/cart/update. 
            ▪ Subtask 3.2.7.2: Authenticate user or identify by session ID. 
            ▪ Subtask 3.2.7.3: Server-side validation for productId and quantity. 
            ▪ Subtask 3.2.7.4: Update the quantity of the specified productId in the Cart document. 
            ▪ Subtask 3.2.7.5: Recalculate and update the item's subtotal and the cart's totalPrice. 
            ▪ Subtask 3.2.7.6: Return updated cart summary. 
        ◦ Task 3.2.8: Create Remove Cart Item API Endpoint 
            ▪ Subtask 3.2.8.1: Design and implement DELETE /api/cart/remove. 
            ▪ Subtask 3.2.8.2: Authenticate user or identify by session ID. 
            ▪ Subtask 3.2.8.3: Remove the specified productId from the items array in the Cart document. 
            ▪ Subtask 3.2.8.4: Recalculate and update the cart's totalPrice. 
            ▪ Subtask 3.2.8.5: Return updated cart summary. 
    • Testing Tasks:
        ◦ Task 3.2.9: Write Unit Tests 
            ▪ Subtask 3.2.9.1: Unit tests for frontend quantity update and removal logic. 
            ▪ Subtask 3.2.9.2: Unit tests for backend cart update and removal logic. 
        ◦ Task 3.2.10: Write Integration Tests 
            ▪ Subtask 3.2.10.1: Test GET /api/cart to verify cart details are displayed correctly. 
            ▪ Subtask 3.2.10.2: Test PUT /api/cart/update with valid and invalid quantities. 
            ▪ Subtask 3.2.10.3: Test DELETE /api/cart/remove for removing single and multiple items. 
            ▪ Subtask 3.2.10.4: Verify total price updates correctly after quantity changes and removals. 
            ▪ Subtask 3.2.10.5: Test empty cart display. 
        ◦ Task 3.2.11: Manual End-to-End Testing 
            ▪ Subtask 3.2.11.1: Add multiple products to the cart (from Story 3.1). 
            ▪ Subtask 3.2.11.2: Navigate to the cart page. 
            ▪ Subtask 3.2.11.3: Verify all items are displayed with correct details. 
            ▪ Subtask 3.2.11.4: Test updating quantities, verify subtotal and total price updates. 
            ▪ Subtask 3.2.11.5: Test removing items, verify total price updates. 
            ▪ Subtask 3.2.11.6: Test proceeding to checkout (button should be enabled if cart is not empty). 
            ▪ Subtask 3.2.11.7: Test the empty cart message.
Epic: Checkout Process
Story 3.3: Shipping Address Selection (Customer)
Story: As a customer, I want to select a shipping address from my saved addresses or add a new one during the checkout process so that my order is delivered to the correct location.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. During the checkout process, the customer is presented with a list of their saved shipping addresses (from Story 2.7). 
    2. The customer can select one of these addresses as the shipping address for the order. 
    3. An option to "Add New Address" is available, which presents the same address form as in Story 2.7. 
    4. If the customer adds a new address, it's saved to their account and selected for the current order. 
    5. The selected shipping address is clearly displayed to the customer. 
    6. The customer can edit the selected address (which updates their saved address). 
    7. The customer can select a different address from the list or add a new one at any point during checkout. 
    8. All address operations are performed securely. 

Granular Tasks & Subtasks for Story 3.3:
    • Frontend Tasks:
        ◦ Task 3.3.1: Integrate Shipping Address Selection into Checkout UI 
            ▪ Subtask 3.3.1.1: Add a "Shipping Address" section to the checkout page (we'll assume a multi-step checkout flow). 
            ▪ Subtask 3.3.1.2: Display a list of the customer's saved addresses (reuse the UI elements from Story 2.7). 
            ▪ Subtask 3.3.1.3: Allow the customer to select an address (e.g., using radio buttons). 
            ▪ Subtask 3.3.1.4: Display the selected address prominently. 
        ◦ Task 3.3.2: Implement "Add New Address" Functionality in Checkout 
            ▪ Subtask 3.3.2.1: Reuse the AddressForm component from Story 2.7. 
            ▪ Subtask 3.3.2.2: Integrate the form into the checkout flow (e.g., in a modal or expandable section). 
            ▪ Subtask 3.3.2.3: After successful submission, save the new address (using the existing API endpoint from Story 2.7) and select it for the order. 
        ◦ Task 3.3.3: Implement "Edit Address" Functionality in Checkout 
            ▪ Subtask 3.3.3.1: Provide an "Edit" button/link for each address in the list. 
            ▪ Subtask 3.3.3.2: Reuse the AddressForm component (pre-filled with the selected address). 
            ▪ Subtask 3.3.3.3: After successful submission, update the saved address (using the existing API endpoint from Story 2.7) and update the displayed address. 
        ◦ Task 3.3.4: Frontend API Integration: Fetch Addresses 
            ▪ Subtask 3.3.4.1: Reuse the GET /api/user/addresses service/hook from Story 2.7 to fetch the customer's saved addresses. 
            ▪ Subtask 3.3.4.2: Display the fetched addresses in the list. 
        ◦ Task 3.3.5: Frontend State Management for Selected Address 
            ▪ Subtask 3.3.5.1: Use a global state management solution (e.g., Redux, Zustand, React Context) to store the currently selected shipping address during the checkout process. 
            ▪ Subtask 3.3.5.2: Update this state when the customer selects an address or adds/edits one. 
    • Backend Tasks:
        ◦ Task 3.3.6: No new backend tasks are strictly required. We will reuse the existing API endpoints from Story 2.7 (GET /api/user/addresses, POST /api/user/addresses, PUT /api/user/addresses/:addressId). 
        ◦ Task 3.3.7: However, we need to ensure that the Order model (from Epic 3 introduction) includes a shippingAddress field. This field should store a snapshot of the shipping address details (Full Name, Address Line 1, Address Line 2, City, State/Province, Postal Code, Country, Phone Number) at the time the order was placed. This ensures order history is accurate even if the user later edits or deletes their saved address. 
    • Testing Tasks:
        ◦ Task 3.3.8: Write Unit Tests 
            ▪ Subtask 3.3.8.1: Unit tests for frontend logic related to address selection and display. 
        ◦ Task 3.3.9: Write Integration Tests 
            ▪ Subtask 3.3.9.1: Test the integration of the address selection UI with the existing address management API endpoints. 
            ▪ Subtask 3.3.9.2: Test adding a new address during checkout and selecting it. 
            ▪ Subtask 3.3.9.3: Test editing an address during checkout and verifying the changes. 
        ◦ Task 3.3.10: Manual End-to-End Testing 
            ▪ Subtask 3.3.10.1: Add several shipping addresses to a user account (using the "My Addresses" page from Story 2.7). 
            ▪ Subtask 3.3.10.2: Add a product to the cart and proceed to checkout. 
            ▪ Subtask 3.3.10.3: Verify the list of saved addresses is displayed. 
            ▪ Subtask 3.3.10.4: Select an existing address. 
            ▪ Subtask 3.3.10.5: Add a new address during checkout and select it. 
            ▪ Subtask 3.3.10.6: Edit an existing address during checkout. 
            ▪ Subtask 3.3.10.7: Ensure the selected address is correctly displayed throughout the checkout process.
Epic: Checkout Process
Story 3.4: Billing Address Selection (Customer)
Story: As a customer, I want to select a billing address from my saved addresses, or add a new one, or use my shipping address during checkout, so that the correct address is associated with my payment.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. During the checkout process, after shipping address selection, the customer is presented with options for their billing address. 
    2. An option to "Use Shipping Address as Billing Address" is prominently displayed and selected by default. 
    3. If this option is deselected, a list of the customer's saved addresses is displayed (from Story 2.7). 
    4. The customer can select one of these addresses as the billing address for the order. 
    5. An option to "Add New Address" is available, which presents the same address form as in Story 2.7. 
    6. If the customer adds a new address, it's saved to their account and selected for the current order. 
    7. The selected billing address is clearly displayed to the customer. 
    8. The customer can edit the selected address (which updates their saved address). 
    9. All address operations are performed securely. 

Granular Tasks & Subtasks for Story 3.4:
    • Frontend Tasks:
        ◦ Task 3.4.1: Integrate Billing Address Selection into Checkout UI 
            ▪ Subtask 3.4.1.1: Add a "Billing Address" section to the checkout page (after shipping address). 
            ▪ Subtask 3.4.1.2: Implement a checkbox/toggle for "Use Shipping Address as Billing Address". 
            ▪ Subtask 3.4.1.3: Conditionally display the list of saved addresses (reusing UI from Story 3.3/2.7) if the "Use Shipping Address" option is deselected. 
            ▪ Subtask 3.4.1.4: Allow selection of an address from the list. 
            ▪ Subtask 3.4.1.5: Display the selected billing address prominently. 
        ◦ Task 3.4.2: Implement "Add New Address" Functionality in Checkout for Billing 
            ▪ Subtask 3.4.2.1: Reuse the AddressForm component from Story 2.7/3.3. 
            ▪ Subtask 3.4.2.2: Integrate the form into the checkout flow for billing addresses. 
            ▪ Subtask 3.4.2.3: After successful submission, save the new address (using existing API) and select it as the billing address for the current order. 
        ◦ Task 3.4.3: Implement "Edit Address" Functionality in Checkout for Billing 
            ▪ Subtask 3.4.3.1: Provide an "Edit" button/link for each billing address. 
            ▪ Subtask 3.4.3.2: Reuse the AddressForm component (pre-filled with the selected address). 
            ▪ Subtask 3.4.3.3: After successful submission, update the saved address (using existing API) and update the displayed address. 
        ◦ Task 3.4.4: Frontend API Integration: Fetch Addresses (Reuse) 
            ▪ Subtask 3.4.4.1: Reuse GET /api/user/addresses service/hook from Story 2.7/3.3 to fetch the customer's saved addresses for billing options. 
        ◦ Task 3.4.5: Frontend State Management for Selected Billing Address 
            ▪ Subtask 3.4.5.1: Use global state to store the currently selected billing address during checkout. 
            ▪ Subtask 3.4.5.2: Update this state based on checkbox/selection changes. 
            ▪ Subtask 3.4.5.3: Implement logic to automatically set billing address to shipping address if the checkbox is checked. 
    • Backend Tasks:
        ◦ Task 3.4.6: No new backend API endpoints are strictly required. We will reuse existing address management APIs from Story 2.7. 
        ◦ Task 3.4.7: Ensure Order Model Includes billingAddress Field. 
            ▪ Subtask 3.4.7.1: Verify that the Order model (to be created in Epic 3: Checkout Process) includes a billingAddress field. This field should store a snapshot of the billing address details (Full Name, Address Line 1, Address Line 2, City, State/Province, Postal Code, Country, Phone Number) at the time the order was placed. 
    • Testing Tasks:
        ◦ Task 3.4.8: Write Unit Tests 
            ▪ Subtask 3.4.8.1: Unit tests for frontend logic controlling the "Use Shipping Address" checkbox and conditional display of address list. 
            ▪ Subtask 3.4.8.2: Unit tests for updating the billing address in the frontend state. 
        ◦ Task 3.4.9: Write Integration Tests 
            ▪ Subtask 3.4.9.1: Test the integration of the billing address selection UI with the existing address management API endpoints. 
            ▪ Subtask 3.4.9.2: Test adding a new billing address during checkout. 
            ▪ Subtask 3.4.9.3: Test editing an existing billing address during checkout. 
        ◦ Task 3.4.10: Manual End-to-End Testing 
            ▪ Subtask 3.4.10.1: Add products to cart and proceed to checkout. 
            ▪ Subtask 3.4.10.2: Select a shipping address. 
            ▪ Subtask 3.4.10.3: Verify "Use Shipping Address as Billing Address" checkbox is present. 
            ▪ Subtask 3.4.10.4: Test with the checkbox checked (verify shipping address is used as billing). 
            ▪ Subtask 3.4.10.5: Deselect the checkbox. Verify saved addresses are displayed. Select a different saved address. 
            ▪ Subtask 3.4.10.6: Add a brand new address as billing address. 
            ▪ Subtask 3.4.10.7: Edit a billing address during checkout. 
            ▪ Subtask 3.4.10.8: Ensure the final selected billing address is correctly reflected.
Epic: Checkout Process
Story 3.5: Shipping Method Selection (Customer)
Story: As a customer, I want to select a shipping method for my order and see its cost so that I can choose the delivery option that best suits my needs.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. During the checkout process, after the shipping address has been selected, the customer is presented with a list of available shipping methods. 
    2. Each shipping method displays its name (e.g., "Standard Shipping," "Express Shipping"), estimated delivery time, and cost. 
    3. The shipping options and their costs are dynamically calculated based on the selected shipping address and the contents of the cart (e.g., total weight, dimensions, value). 
    4. The customer can select one shipping method. 
    5. The total order cost (subtotal + shipping cost + tax + discounts) is updated in real-time to reflect the chosen shipping method. 
    6. The selected shipping method is clearly displayed. 
    7. All shipping method calculations are performed securely. 

Granular Tasks & Subtasks for Story 3.5:
    • Frontend Tasks:
        ◦ Task 3.5.1: Implement Shipping Method Selection UI 
            ▪ Subtask 3.5.1.1: Add a "Shipping Method" section to the checkout page. 
            ▪ Subtask 3.5.1.2: Design and implement a list/radio button group to display shipping options (Name, Estimated Delivery, Cost). 
            ▪ Subtask 3.5.1.3: Clearly display the currently selected shipping method. 
        ◦ Task 3.5.2: Frontend API Integration: Fetch Shipping Rates 
            ▪ Subtask 3.5.2.1: Create service/hook to call POST /api/shipping/calculate-rates (or similar) with the selected shipping address details and current cart contents. 
            ▪ Subtask 3.5.2.2: Make this API call whenever the shipping address changes or cart contents change (if applicable). 
            ▪ Subtask 3.5.2.3: Handle loading states while fetching rates. 
            ▪ Subtask 3.5.2.4: Display the returned shipping options. 
        ◦ Task 3.5.3: Update Order Summary with Selected Shipping Cost 
            ▪ Subtask 3.5.3.1: Implement logic to update the shippingCost in the frontend's global order summary state when a shipping method is selected. 
            ▪ Subtask 3.5.3.2: Ensure the total order cost (subtotal + shipping + tax + discounts) is recalculated and displayed dynamically. 
        ◦ Task 3.5.4: Frontend State Management for Selected Shipping Method 
            ▪ Subtask 3.5.4.1: Store the selected shipping method (ID, name, cost) in the frontend's checkout process state. 
    • Backend Tasks:
        ◦ Task 3.5.5: Design Shipping Method Data Model (Static/Configurable) 
            ▪ Subtask 3.5.5.1: Define how static shipping methods and their base rates will be stored (e.g., in a configuration file, or a ShippingMethod collection in MongoDB for admin configurability later). 
            ▪ Subtask 3.5.5.2: Model includes: id, name, estimatedDelivery, baseCost, criteria (e.g., min/max weight, min/max order value, restricted regions). 
        ◦ Task 3.5.6: Create Calculate Shipping Rates API Endpoint 
            ▪ Subtask 3.5.6.1: Design and implement POST /api/shipping/calculate-rates. 
            ▪ Subtask 3.5.6.2: This endpoint expects: cartContents (items with quantity, weight, dimensions, price), and shippingAddress (country, postal code). 
            ▪ Subtask 3.5.6.3: Implement logic to iterate through available shipping methods. 
            ▪ Subtask 3.5.6.4: For each method, apply rules/criteria based on cart content (total weight, value) and destination address (country, region). 
            ▪ Subtask 3.5.6.5: Calculate the final cost for eligible methods (e.g., baseCost + weight/dimension surcharges). 
            ▪ Subtask 3.5.6.6: Return a list of eligible shipping methods with their calculated costs. 
        ◦ Task 3.5.7: Integrate with Order Model 
            ▪ Subtask 3.5.7.1: Ensure the Order model includes fields for shippingMethod (name, cost, estimatedDelivery) to capture the chosen option at the time of order placement. 
    • Testing Tasks:
        ◦ Task 3.5.8: Write Unit Tests 
            ▪ Subtask 3.5.8.1: Unit tests for frontend UI updates when a shipping method is selected. 
            ▪ Subtask 3.5.8.2: Unit tests for backend shipping rate calculation logic (various cart contents, addresses, and method rules). 
        ◦ Task 3.5.9: Write Integration Tests 
            ▪ Subtask 3.5.9.1: Test POST /api/shipping/calculate-rates with diverse cart and address data (e.g., heavy items, light items, different countries). 
            ▪ Subtask 3.5.9.2: Verify correct shipping options and costs are returned. 
            ▪ Subtask 3.5.9.3: Test cases where no shipping methods are eligible (e.g., too heavy, unsupported region). 
        ◦ Task 3.5.10: Manual End-to-End Testing 
            ▪ Subtask 3.5.10.1: Add products to cart and proceed through shipping address selection. 
            ▪ Subtask 3.5.10.2: Verify shipping methods are displayed with costs. 
            ▪ Subtask 3.5.10.3: Select different shipping methods and verify the total order cost updates correctly. 
            ▪ Subtask 3.5.10.4: Change shipping address (if functionality is available earlier in flow) and verify shipping methods/costs dynamically update. 
            ▪ Subtask 3.5.10.5: Test edge cases (e.g., very heavy cart, international shipping if applicable).
Epic: Checkout Process
Story 3.6: Payment Method Selection (Customer)
Story: As a customer, I want to select a payment method (e.g., credit card, PayPal) and securely enter my payment details so that I can finalize my order.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. During the checkout process, after shipping method selection, the customer is presented with available payment options (e.g., "Credit Card," "PayPal," "Google Pay"). 
    2. Upon selecting a payment method: 
        ◦ Credit Card: Secure form fields for Card Number, Expiry Date, CVC/CVV, and Cardholder Name are displayed. These fields should be tokenized or handled directly by the payment gateway's client-side SDK. 
        ◦ Other Methods (e.g., PayPal): A button to redirect to the external payment provider's site is displayed. 
    3. Client-side validation is performed on credit card fields (e.g., valid number format, expiry date not in past). 
    4. No sensitive card data ever touches our backend server directly. 
    5. The payment method selection and input forms are responsive. 
    6. The customer's chosen payment method type is clearly displayed. 
    7. All payment operations are performed securely and in compliance with PCI DSS standards. 

Granular Tasks & Subtasks for Story 3.6:
    • Frontend Tasks:
        ◦ Task 3.6.1: Implement Payment Method Selection UI 
            ▪ Subtask 3.6.1.1: Add a "Payment Method" section to the checkout page. 
            ▪ Subtask 3.6.1.2: Design and implement radio buttons or clickable cards for various payment options (Credit Card, PayPal, Google Pay, etc.). 
            ▪ Subtask 3.6.1.3: Clearly indicate the selected payment method. 
        ◦ Task 3.6.2: Implement Credit Card Input UI (Stripe Elements) 
            ▪ Subtask 3.6.2.1: Integrate Stripe Elements (e.g., Card Element) into the credit card payment section. 
            ▪ Subtask 3.6.2.2: Implement client-side validation using Stripe's built-in validation features. 
            ▪ Subtask 3.6.2.3: Ensure no sensitive card data is handled by our frontend directly; let Stripe Elements handle tokenization. 
        ◦ Task 3.6.3: Implement Other Payment Method Buttons 
            ▪ Subtask 3.6.3.1: For methods like PayPal/Google Pay, implement buttons that initiate the redirect to the respective payment gateway. 
        ◦ Task 3.6.4: Frontend API Integration: Create Payment Intent (for Credit Card) 
            ▪ Subtask 3.6.4.1: Create a service/hook to call POST /api/payment/create-intent on the backend when the customer proceeds to payment. This call will initiate a Stripe Payment Intent. 
            ▪ Subtask 3.6.4.2: Pass order total, currency, and other relevant details. 
            ▪ Subtask 3.6.4.3: Handle the client_secret returned by the backend to confirm payment with Stripe. 
        ◦ Task 3.6.5: Frontend API Integration: Confirm Payment (for Credit Card) 
            ▪ Subtask 3.6.5.1: Use Stripe.js confirmCardPayment with the client_secret and Stripe Elements to finalize the credit card payment on the client side. 
            ▪ Subtask 3.6.5.2: Handle success (redirect to order confirmation) or failure (display error). 
        ◦ Task 3.6.6: Frontend State Management for Payment Details 
            ▪ Subtask 3.6.6.1: Store the selected payment method type in the checkout process state. 
            ▪ Subtask 3.6.6.2: Store any non-sensitive payment-related information needed (e.g., last 4 digits of card, card brand) for display. 
    • Backend Tasks:
        ◦ Task 3.6.7: Integrate Stripe SDK (Server-Side) 
            ▪ Subtask 3.6.7.1: Install and configure Stripe Node.js SDK (or equivalent for chosen backend language). 
            ▪ Subtask 3.6.7.2: Store Stripe API keys securely (environment variables). 
        ◦ Task 3.6.8: Create Payment Intent API Endpoint 
            ▪ Subtask 3.6.8.1: Design and implement POST /api/payment/create-intent. 
            ▪ Subtask 3.6.8.2: Authenticate the user. 
            ▪ Subtask 3.6.8.3: Retrieve the total order amount from the current cart/checkout session (do NOT trust frontend total). 
            ▪ Subtask 3.6.8.4: Call Stripe API to create a PaymentIntent. 
            ▪ Subtask 3.6.8.5: Return the client_secret from the Payment Intent to the frontend. 
        ◦ Task 3.6.9: Webhook Endpoint for Payment Status Updates 
            ▪ Subtask 3.6.9.1: Design and implement POST /api/stripe-webhook. 
            ▪ Subtask 3.6.9.2: Implement logic to verify Stripe webhook signatures for security. 
            ▪ Subtask 3.6.9.3: Handle payment_intent.succeeded, payment_intent.payment_failed, and other relevant Stripe events. 
            ▪ Subtask 3.6.9.4: Update order status in MongoDB based on webhook events (e.g., from "Pending Payment" to "Processing" or "Payment Failed"). This is crucial for reliable order processing. 
        ◦ Task 3.6.10: Update Order Model for Payment Details 
            ▪ Subtask 3.6.10.1: Ensure the Order model includes fields for paymentMethod (e.g., type, last4, brand, transactionId, paymentIntentId, paymentStatus). 
        ◦ Task 3.6.11: Error Handling & Security (Backend) 
            ▪ Subtask 3.6.11.1: Implement robust error handling for Stripe API calls. 
            ▪ Subtask 3.6.11.2: Ensure all payment-related operations are securely authenticated and authorized. 
    • Security & Compliance Tasks:
        ◦ Task 3.6.12: PCI DSS Compliance Considerations 
            ▪ Subtask 3.6.12.1: Review and ensure adherence to PCI DSS requirements for handling card data (by using Stripe Elements, sensitive data never hits our server). 
        ◦ Task 3.6.13: Environment Variables for API Keys 
            ▪ Subtask 3.6.13.1: Strictly use environment variables for all payment gateway API keys. 
    • Testing Tasks:
        ◦ Task 3.6.14: Write Unit Tests 
            ▪ Subtask 3.6.14.1: Unit tests for frontend payment method selection logic. 
            ▪ Subtask 3.6.14.2: Unit tests for backend payment intent creation logic (mocking Stripe API calls). 
            ▪ Subtask 3.6.14.3: Unit tests for webhook signature verification. 
        ◦ Task 3.6.15: Write Integration Tests 
            ▪ Subtask 3.6.15.1: Test POST /api/payment/create-intent for various order totals. 
            ▪ Subtask 3.6.15.2: Simulate Stripe webhook events (succeeded, failed) and verify order status updates in DB. 
            ▪ Subtask 3.6.15.3: Use Stripe's test card numbers to test payment confirmation flow end-to-end. 
        ◦ Task 3.6.16: Manual End-to-End Testing 
            ▪ Subtask 3.6.16.1: Add products to cart, proceed through address and shipping selection. 
            ▪ Subtask 3.6.16.2: Select "Credit Card," enter Stripe test card details, and submit. 
            ▪ Subtask 3.6.16.3: Verify successful payment and redirection to order confirmation. 
            ▪ Subtask 3.6.16.4: Test with failing credit card details (e.g., expired card). 
            ▪ Subtask 3.6.16.5: Test "Other" payment methods (e.g., PayPal redirect - though actual PayPal payment is a separate story). 
            ▪ Subtask 3.6.16.6: Verify error messages for invalid inputs or payment failures.
Epic: Checkout Process
Story 3.7: Place Order (Customer)
Story: As a customer, I want to review my complete order details and place my order so that my purchase is finalized and processed.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. After selecting a payment method, the customer is presented with a final "Order Review" screen. 
    2. This screen displays a comprehensive summary of the entire order: 
        ◦ All items in the cart (Product Name, Image, Quantity, Unit Price, Line Total). 
        ◦ Subtotal, Shipping Cost, Tax, Discounts applied, and Grand Total. 
        ◦ Selected Shipping Address. 
        ◦ Selected Billing Address. 
        ◦ Chosen Shipping Method. 
        ◦ Chosen Payment Method (type and last 4 digits for cards, or "PayPal" etc. - no sensitive details). 
    3. A prominent "Place Order" or "Confirm Order" button is available. 
    4. Clicking "Place Order" finalizes the order in the system, provided the payment was successful (or will be processed, e.g., for "Cash on Delivery" or redirecting to payment gateway). 
    5. Upon successful order placement, the customer is redirected to an "Order Confirmation" page. 
    6. A unique Order Number is generated and displayed to the customer on the confirmation page. 
    7. An order confirmation email is sent to the customer's registered email address. 
    8. The cart is cleared after successful order placement. 
    9. Stock levels of purchased products are updated in the inventory. 
    10. All order placement operations are performed securely and transactionally. 

Granular Tasks & Subtasks for Story 3.7:
    • Frontend Tasks:
        ◦ Task 3.7.1: Implement "Order Review" Page UI 
            ▪ Subtask 3.7.1.1: Create OrderReviewPage component/route. 
            ▪ Subtask 3.7.1.2: Design layout to display all final order details (cart items, addresses, shipping, payment, totals). 
            ▪ Subtask 3.7.1.3: Add "Place Order" or "Confirm Order" button. 
        ◦ Task 3.7.2: Aggregate & Display Final Order Data 
            ▪ Subtask 3.7.2.1: Retrieve all accumulated checkout state (cart items, selected shipping address, selected billing address, chosen shipping method, chosen payment method, calculated totals). 
            ▪ Subtask 3.7.2.2: Present this data clearly and readably. 
        ◦ Task 3.7.3: Implement "Order Confirmation" Page UI 
            ▪ Subtask 3.7.3.1: Create OrderConfirmationPage component/route (e.g., /order-confirmation/:orderId). 
            ▪ Subtask 3.7.3.2: Display a success message and the unique Order Number. 
            ▪ Subtask 3.7.3.3: Provide links to "View Order Details" (from Story 2.9) and "Continue Shopping". 
        ◦ Task 3.7.4: Frontend API Integration: Place Order 
            ▪ Subtask 3.7.4.1: Create service/hook to send final order data to POST /api/orders/place-order. 
            ▪ Subtask 3.7.4.2: This endpoint will typically be called after a successful payment intent confirmation (for credit card) or immediately for other methods. 
            ▪ Subtask 3.7.4.3: Handle success response (redirect to OrderConfirmationPage). 
            ▪ Subtask 3.7.4.4: Handle error responses (display generic error, suggest contacting support). 
        ◦ Task 3.7.5: Clear Cart on Frontend 
            ▪ Subtask 3.7.5.1: After successful order placement, update frontend cart state to be empty. 
    • Backend Tasks:
        ◦ Task 3.7.6: Design Order Data Model (Comprehensive) 
            ▪ Subtask 3.7.6.1: Define or finalize the MongoDB schema for Order collection. 
            ▪ It must include: _id (auto-generated), userId, orderNumber (unique, human-readable), orderDate, status (e.g., 'Pending', 'Processing', 'Payment Failed'), items (array of objects: productId, name, image, quantity, unitPrice), shippingAddress (snapshot), billingAddress (snapshot), shippingMethod (name, cost), paymentMethod (type, last4, brand, paymentIntentId), subtotal, shippingCost, taxAmount, discountAmount, grandTotal. 
        ◦ Task 3.7.7: Create Place Order API Endpoint 
            ▪ Subtask 3.7.7.1: Design and implement POST /api/orders/place-order. 
            ▪ Subtask 3.7.7.2: Authenticate the user. 
            ▪ Subtask 3.7.7.3: Receive all finalized order details (cart items, addresses, shipping method, payment intent ID if applicable, etc.) from the frontend. 
            ▪ Subtask 3.7.7.4: Perform crucial server-side validation and recalculation: 
                • Re-verify product prices and availability against current inventory to prevent tampering/stale data. 
                • Re-calculate total costs (subtotal, shipping, tax, grand total) on the backend. 
                • Verify paymentIntentId status with Stripe (if applicable) to ensure it's succeeded. 
            ▪ Subtask 3.7.7.5: Implement Transactional Logic: 
                • Start a database transaction (if supported/necessary for atomicity). 
                • Generate a unique orderNumber. 
                • Create the new Order document in the Order collection. 
                • Decrement stock quantities for all purchased products in the Product collection. 
                • Clear the customer's cart in the Cart collection. 
                • Commit the transaction. 
            ▪ Subtask 3.7.7.6: Trigger sending of order confirmation email. 
            ▪ Subtask 3.7.7.7: Return the new orderId and orderNumber in the response. 
        ◦ Task 3.7.8: Email Service Integration (Order Confirmation) 
            ▪ Subtask 3.7.8.1: Create a comprehensive order confirmation email template. 
            ▪ Subtask 3.7.8.2: Implement function to send this email with full order details upon successful order placement. 
    • Security & Data Integrity Tasks:
        ◦ Task 3.7.9: Prevent Double Submission / Idempotency 
            ▪ Subtask 3.7.9.1: Implement measures to prevent multiple order creations from a single user clicking "Place Order" multiple times (e.g., disable button after first click, use idempotency keys on backend). 
        ◦ Task 3.7.10: Data Validation & Recalculation on Backend 
            ▪ Subtask 3.7.10.1: Ensure all critical order details (prices, totals) are validated and recalculated on the backend using the authoritative data from the database, not just trusting frontend data. 
    • Testing Tasks:
        ◦ Task 3.7.11: Write Unit Tests 
            ▪ Subtask 3.7.11.1: Unit tests for frontend order summary display. 
            ▪ Subtask 3.7.11.2: Unit tests for backend order creation logic, stock decrement, and cart clearing. 
        ◦ Task 3.7.12: Write Integration Tests 
            ▪ Subtask 3.7.12.1: Test POST /api/orders/place-order with a fully prepared checkout session (including mock payment intent). 
            ▪ Subtask 3.7.12.2: Verify new order is created in DB with correct details. 
            ▪ Subtask 3.7.12.3: Verify product stock is decremented. 
            ▪ Subtask 3.7.12.4: Verify user's cart is cleared. 
            ▪ Subtask 3.7.12.5: Test with insufficient stock (expect failure). 
            ▪ Subtask 3.7.12.6: Test with an invalid payment intent (expect failure). 
        ◦ Task 3.7.13: Manual End-to-End Testing 
            ▪ Subtask 3.7.13.1: Go through the entire checkout flow (Add to Cart -> View Cart -> Addresses -> Shipping -> Payment -> Order Review). 
            ▪ Subtask 3.7.13.2: Carefully review all details on the Order Review page. 
            ▪ Subtask 3.7.13.3: Click "Place Order" and verify redirection to Order Confirmation page with correct order number. 
            ▪ Subtask 3.7.13.4: Verify order confirmation email is received. 
            ▪ Subtask 3.7.13.5: Verify cart is empty after order. 
            ▪ Subtask 3.7.13.6: Check product stock in admin/DB to confirm decrement. 
            ▪ Subtask 3.7.13.7: Test placing an order for an item that just went out of stock to ensure proper error handling.
Epic: Post-Purchase Operations & Support
Story 4.1: Track Order Status (Customer)
Story: As a customer, I want to track the current status of my order and see shipping updates so that I know when to expect my delivery.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. From the "Order History" page (Story 2.8) or "Order Details" page (Story 2.9), a link or section provides visibility into the order's current status and tracking information. 
    2. The order status is clearly displayed (e.g., "Processing," "Shipped," "Out for Delivery," "Delivered," "Cancelled"). 
    3. If the order has been shipped, a tracking number and a clickable link to the shipping carrier's tracking page are displayed. 
    4. Optionally, a timeline or step-by-step progress indicator for the order's journey is shown. 
    5. All order tracking information is kept up-to-date. 
    6. Only the authenticated customer can view their own order tracking. 

Granular Tasks & Subtasks for Story 4.1:
    • Frontend Tasks:
        ◦ Task 4.1.1: Integrate Tracking Info into Order Details Page UI 
            ▪ Subtask 4.1.1.1: Enhance the OrderDetailsPage (from Story 2.9) to prominently display the status of the order. 
            ▪ Subtask 4.1.1.2: Conditionally render a section for "Tracking Information" if trackingNumber and trackingLink exist in the order data. 
            ▪ Subtask 4.1.1.3: Display the trackingNumber and a clickable link for trackingLink. 
        ◦ Task 4.1.2: (Optional) Implement Order Status Timeline/Progress Indicator 
            ▪ Subtask 4.1.2.1: Design a visual timeline component (e.g., a series of steps) to represent order progression (e.g., "Order Placed", "Processing", "Shipped", "Delivered"). 
            ▪ Subtask 4.1.2.2: Dynamically highlight the current status in the timeline based on the order's status field. 
        ◦ Task 4.1.3: Frontend API Integration: Fetch Latest Order Status 
            ▪ Subtask 4.1.3.1: Reuse GET /api/user/orders/:orderId from Story 2.9. 
            ▪ Subtask 4.1.3.2: Ensure this endpoint returns the most up-to-date status, trackingNumber, and trackingLink. 
            ▪ Subtask 4.1.3.3: (Consideration) Implement a polling mechanism or consider WebSockets for real-time updates if a highly dynamic tracking experience is desired (Stretch Goal/Future Enhancement). 
    • Backend Tasks:
        ◦ Task 4.1.4: Update Order Data Model for Tracking 
            ▪ Subtask 4.1.4.1: Ensure the Order collection schema includes fields for: 
                • status (Enum: pending, processing, shipped, out_for_delivery, delivered, cancelled, returned, etc.) 
                • trackingNumber (String, optional) 
                • trackingLink (String, optional) 
                • statusHistory (Array of objects: status, timestamp, note - for detailed timeline) 
        ◦ Task 4.1.5: Develop Internal Endpoint for Status Updates (Admin/System Only) 
            ▪ Subtask 4.1.5.1: Create an internal API endpoint (e.g., PUT /api/internal/orders/:orderId/status) that can be called by an admin panel or fulfillment system to update an order's status and tracking details. 
            ▪ Subtask 4.1.5.2: This endpoint must be highly secured (e.g., API key, IP whitelisting, specific authentication). 
            ▪ Subtask 4.1.5.3: Update status, trackingNumber, trackingLink, and append to statusHistory. 
        ◦ Task 4.1.6: (Optional) Integrate with Shipping Carrier APIs for Auto-Tracking 
            ▪ Subtask 4.1.6.1: Research and select relevant shipping carrier APIs (e.g., UPS, FedEx, Royal Mail). 
            ▪ Subtask 4.1.6.2: Implement background jobs/cron jobs to periodically call carrier APIs using trackingNumber to fetch latest status updates. 
            ▪ Subtask 4.1.6.3: Update Order document's status and statusHistory based on carrier updates. (This is a significant stretch goal, might be manual for MVP). 
        ◦ Task 4.1.7: Ensure Secure Access to Order Tracking Data 
            ▪ Subtask 4.1.7.1: Double-check that GET /api/user/orders/:orderId rigorously enforces that only the userId associated with the order can access its details. 
    • Testing Tasks:
        ◦ Task 4.1.8: Write Unit Tests 
            ▪ Subtask 4.1.8.1: Unit tests for frontend conditional rendering of tracking info. 
            ▪ Subtask 4.1.8.2: Unit tests for backend status update logic (for internal endpoint). 
        ◦ Task 4.1.9: Write Integration Tests 
            ▪ Subtask 4.1.9.1: Test fetching an order with "Processing" status, verify no tracking info is shown. 
            ▪ Subtask 4.1.9.2: Test fetching an order with "Shipped" status, verify tracking number and link are displayed. 
            ▪ Subtask 4.1.9.3: Simulate an internal status update (e.g., via mock admin call) and then fetch the order to verify the status change. 
            ▪ Subtask 4.1.9.4: Test unauthorized attempts to access order tracking details. 
        ◦ Task 4.1.10: Manual End-to-End Testing 
            ▪ Subtask 4.1.10.1: Place a test order. 
            ▪ Subtask 4.1.10.2: Access its details page. Verify initial status. 
            ▪ Subtask 4.1.10.3: Manually update the order status in the backend (e.g., directly in MongoDB or via a mock admin tool). 
            ▪ Subtask 4.1.10.4: Refresh the order details page and verify the status update and tracking info (if added) are displayed. 
            ▪ Subtask 4.1.10.5: Test clickable tracking links.
Epic: Post-Purchase Operations & Support
Story 4.2: Cancel Order (Customer)
Story: As a customer, I want to be able to cancel my order (if it hasn't shipped yet) so that I can prevent unwanted purchases and receive a refund.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Cancel Order" button/link is available on the "Order Details" page (Story 2.9) for eligible orders. 
    2. An order is eligible for cancellation only if its status is "Pending," "Processing," or "Awaiting Shipment" (or equivalent early statuses). Once an order is "Shipped," "Out for Delivery," or "Delivered," it cannot be cancelled by the customer via this functionality. 
    3. Clicking "Cancel Order" prompts the customer with a confirmation dialog (e.g., "Are you sure you want to cancel this order? This action cannot be undone."). 
    4. Upon confirmation, the order's status is updated to "Cancelled" in the backend. 
    5. The stock levels of all products in the cancelled order are returned to inventory. 
    6. If the order was paid for, a refund process is initiated (e.g., via the payment gateway). 
    7. The customer receives a confirmation email for the cancellation and initiated refund. 
    8. The "Cancel Order" button is removed or disabled for cancelled/ineligible orders. 
    9. All cancellation operations are performed securely. 

Granular Tasks & Subtasks for Story 4.2:
    • Frontend Tasks:
        ◦ Task 4.2.1: Conditionally Display "Cancel Order" Button 
            ▪ Subtask 4.2.1.1: On the OrderDetailsPage (from Story 2.9), add a "Cancel Order" button. 
            ▪ Subtask 4.2.1.2: Implement logic to enable/disable or hide this button based on the order's status (only visible for "Pending," "Processing," "Awaiting Shipment"). 
        ◦ Task 4.2.2: Implement Cancellation Confirmation Dialog 
            ▪ Subtask 4.2.2.1: When "Cancel Order" is clicked, display a modal or confirmation prompt. 
            ▪ Subtask 4.2.2.2: Include a clear message about irreversibility and refund implications. 
        ◦ Task 4.2.3: Frontend API Integration: Request Cancellation 
            ▪ Subtask 4.2.3.1: Create service/hook to send a cancellation request to POST /api/user/orders/:orderId/cancel. 
            ▪ Subtask 4.2.3.2: On successful response, update the local order status in the UI to "Cancelled" and disable the "Cancel Order" button. 
            ▪ Subtask 4.2.3.3: Display a success message (e.g., "Order cancelled. Refund initiated."). 
            ▪ Subtask 4.2.3.4: Handle error responses (e.g., "Order cannot be cancelled at this stage," "Something went wrong"). 
    • Backend Tasks:
        ◦ Task 4.2.4: Create Cancel Order API Endpoint 
            ▪ Subtask 4.2.4.1: Design and implement POST /api/user/orders/:orderId/cancel. 
            ▪ Subtask 4.2.4.2: Authenticate the user and verify orderId belongs to them. 
            ▪ Subtask 4.2.4.3: Crucial: Check order status: 
                • Retrieve the order from MongoDB. 
                • If the order status is not "Pending," "Processing," or "Awaiting Shipment," return a 403 Forbidden or specific error message ("Order cannot be cancelled at this stage"). 
            ▪ Subtask 4.2.4.4: Implement Transactional Logic: 
                • Start a database transaction. 
                • Update the Order document's status to "Cancelled". 
                • For each item in the order, increment the stockQuantity of the corresponding product in the Product collection. 
                • Initiate Refund Process: Call the Payment Gateway (Stripe) API to issue a refund for the grandTotal of the order. Handle synchronous responses or rely on webhooks for asynchronous confirmation. (This will be a more complex subtask, potentially needing a separate internal service). 
                • Commit the transaction. 
            ▪ Subtask 4.2.4.5: Trigger sending of cancellation confirmation email. 
            ▪ Subtask 4.2.4.6: Return a success response. 
        ◦ Task 4.2.5: Implement Refund Integration with Payment Gateway 
            ▪ Subtask 4.2.5.1: Use Stripe SDK (or equivalent) to initiate refunds based on the paymentIntentId stored in the Order document (from Story 3.6). 
            ▪ Subtask 4.2.5.2: Handle refund success/failure/pending states. 
            ▪ Subtask 4.2.5.3: Update order status or add refundStatus to the order document based on refund outcome. 
        ◦ Task 4.2.6: Email Service Integration (Cancellation & Refund Confirmation) 
            ▪ Subtask 4.2.6.1: Create a clear email template for order cancellation confirmation. 
            ▪ Subtask 4.2.6.2: Include details about the refund status (initiated, expected timeframe). 
            ▪ Subtask 4.2.6.3: Implement function to send this email. 
    • Security & Data Integrity Tasks:
        ◦ Task 4.2.7: Ensure Atomic Operations 
            ▪ Subtask 4.2.7.1: Verify that status update, stockQuantity increment, and refund initiation happen as an atomic transaction. If one fails, all should roll back. 
        ◦ Task 4.2.8: Robust Authorization 
            ▪ Subtask 4.2.8.1: Re-confirm that only the owner of the order can request its cancellation. 
    • Testing Tasks:
        ◦ Task 4.2.9: Write Unit Tests 
            ▪ Subtask 4.2.9.1: Unit tests for frontend button visibility logic based on status. 
            ▪ Subtask 4.2.9.2: Unit tests for backend order status check before cancellation. 
            ▪ Subtask 4.2.9.3: Unit tests for stock increment logic. 
            ▪ Subtask 4.2.9.4: Unit tests for refund initiation (mocking payment gateway API). 
        ◦ Task 4.2.10: Write Integration Tests 
            ▪ Subtask 4.2.10.1: Place an order (Status: "Pending") and test successful cancellation. Verify order status, stock, and mock refund. 
            ▪ Subtask 4.2.10.2: Place an order, then manually change its status to "Shipped" and attempt cancellation (expect failure). 
            ▪ Subtask 4.2.10.3: Test attempting to cancel an order not belonging to the authenticated user. 
        ◦ Task 4.2.11: Manual End-to-End Testing 
            ▪ Subtask 4.2.11.1: Place a test order (e.g., 2 units of Product A). Note Product A's initial stock. 
            ▪ Subtask 4.2.11.2: Go to Order Details page. Verify "Cancel Order" button is visible. 
            ▪ Subtask 4.2.11.3: Click "Cancel Order", confirm dialog. 
            ▪ Subtask 4.2.11.4: Verify order status on UI changes to "Cancelled". 
            ▪ Subtask 4.2.11.5: Check Product A's stock in admin/DB; it should be back to initial + 2. 
            ▪ Subtask 4.2.11.6: Verify cancellation confirmation email is received. 
            ▪ Subtask 4.2.11.7: Test placing an order, then manually setting its status to "Shipped" in the DB. Try to cancel it from UI; button should be hidden/disabled or return error.
Epic: Post-Purchase Operations & Support
Story 4.3: Request Return (Customer)
Story: As a customer, I want to be able to request a return for one or more items from my delivered order so that I can send back unwanted or faulty products and receive a refund.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Request Return" button/link is available on the "Order Details" page (Story 2.9) for eligible items within a delivered order. 
    2. An order/item is eligible for return if its status is "Delivered" and it's within a defined return window (e.g., 30 days from delivery date). 
    3. Clicking "Request Return" navigates the customer to a return request form. 
    4. The return form displays the items from the eligible order, allowing the customer to select which items they wish to return and specify a quantity for each. 
    5. For each selected item, the customer must provide a reason for return (e.g., "Wrong size," "Damaged," "Changed mind"). 
    6. A customer can optionally upload images to support their return request (e.g., for damaged items). 
    7. Upon submission, a return request is created in the system with a unique ID, and its status is set to "Pending Review." 
    8. The customer receives a confirmation email for the return request, including instructions for shipping the item back (e.g., return address, potentially a pre-paid shipping label if applicable). 
    9. The order's overall status on the "Order Details" page may be updated (e.g., "Return Requested"). 
    10. All return request operations are performed securely. 

Granular Tasks & Subtasks for Story 4.3:
    • Frontend Tasks:
        ◦ Task 4.3.1: Conditionally Display "Request Return" Button 
            ▪ Subtask 4.3.1.1: On the OrderDetailsPage (from Story 2.9), add a "Request Return" button. 
            ▪ Subtask 4.3.1.2: Implement logic to enable/disable or hide this button based on: 
                • Order status being "Delivered". 
                • Delivery date being within the defined return window (e.g., deliveryDate + 30 days > current_date). 
                • No active return request already exists for the order (optional, depending on if multiple requests are allowed). 
        ◦ Task 4.3.2: Implement Return Request Form UI 
            ▪ Subtask 4.3.2.1: Create ReturnRequestPage component/route (e.g., /my-account/orders/:orderId/return). 
            ▪ Subtask 4.3.2.2: Display eligible items from the order with checkboxes for selection, quantity input (up to purchased quantity), and dropdown for "Reason for Return". 
            ▪ Subtask 4.3.2.3: Add an optional file upload input for images (e.g., for damage proof). 
            ▪ Subtask 4.3.2.4: Add a "Submit Return Request" button. 
        ◦ Task 4.3.3: Frontend API Integration: Fetch Eligible Items for Return 
            ▪ Subtask 4.3.3.1: Create service/hook to call GET /api/user/orders/:orderId/eligible-returns. 
            ▪ Subtask 4.3.3.2: Populate the return form with items returned from this endpoint. 
        ◦ Task 4.3.4: Frontend API Integration: Submit Return Request 
            ▪ Subtask 4.3.4.1: Create service/hook to send selected items, quantities, reasons, and optional images to POST /api/user/returns/request. 
            ▪ Subtask 4.3.4.2: On successful response, display a confirmation message and redirect to the OrderDetailsPage (or a dedicated "Return Request Submitted" page). 
            ▪ Subtask 4.3.4.3: Handle error responses (e.g., invalid quantity, item not eligible, API errors). 
    • Backend Tasks:
        ◦ Task 4.3.5: Design Return Request Data Model 
            ▪ Subtask 4.3.5.1: Define MongoDB schema for ReturnRequest collection. 
            ▪ It must include: _id, orderId, userId, requestDate, status (e.g., 'Pending Review', 'Approved', 'Rejected', 'Received', 'Refunded', 'Closed'), items (array of objects: productId, quantity, reason, unitPrice at purchase), images (array of URLs), returnShippingAddress (static/default return address), notes (for admin). 
        ◦ Task 4.3.6: Create API Endpoint to Get Eligible Return Items 
            ▪ Subtask 4.3.6.1: Design and implement GET /api/user/orders/:orderId/eligible-returns. 
            ▪ Subtask 4.3.6.2: Authenticate user and verify orderId belongs to them. 
            ▪ Subtask 4.3.6.3: Fetch the order. 
            ▪ Subtask 4.3.6.4: Check order status ("Delivered") and deliveryDate against return window. 
            ▪ Subtask 4.3.6.5: Return the list of items from the order that are eligible for return (e.g., not already fully returned from a previous request). 
        ◦ Task 4.3.7: Create Submit Return Request API Endpoint 
            ▪ Subtask 4.3.7.1: Design and implement POST /api/user/returns/request. 
            ▪ Subtask 4.3.7.2: Authenticate user. 
            ▪ Subtask 4.3.7.3: Validate incoming data (selected items, quantities, reasons). 
            ▪ Subtask 4.3.7.4: Re-verify eligibility (status, return window, quantities) on the backend for security. 
            ▪ Subtask 4.3.7.5: Store uploaded images (e.g., to S3 or similar object storage) and save their URLs. 
            ▪ Subtask 4.3.7.6: Create a new ReturnRequest document in MongoDB. 
            ▪ Subtask 4.3.7.7: Update the original Order document's status (e.g., add a hasReturnRequest: true flag or change status to "Return Requested"). 
            ▪ Subtask 4.3.7.8: Trigger sending of return request confirmation email. 
            ▪ Subtask 4.3.7.9: Return the created returnRequestId. 
        ◦ Task 4.3.8: Email Service Integration (Return Request Confirmation) 
            ▪ Subtask 4.3.8.1: Create a detailed email template for return request confirmation. 
            ▪ Subtask 4.3.8.2: Include the return request ID, list of items to be returned, return reason, and crucial instructions (return shipping address, how to package, what to include). 
            ▪ Subtask 4.3.8.3: Implement function to send this email. 
        ◦ Task 4.3.9: File Upload & Storage Integration 
            ▪ Subtask 4.3.9.1: Set up secure cloud storage (e.g., AWS S3, Google Cloud Storage) for uploaded return images. 
            ▪ Subtask 4.3.9.2: Implement backend logic to handle image uploads, secure storage, and retrieve public URLs. 
    • Security & Data Integrity Tasks:
        ◦ Task 4.3.10: Strict Return Eligibility Enforcement 
            ▪ Subtask 4.3.10.1: Ensure backend checks for order status and return window are robust and cannot be bypassed. 
        ◦ Task 4.3.11: File Upload Security 
            ▪ Subtask 4.3.11.1: Implement file type validation, size limits, and virus scanning for uploaded images. 
        ◦ Task 4.3.12: Authorization for Return Requests 
            ▪ Subtask 4.3.12.1: Ensure only the userId associated with the order can submit a return request for it. 
    • Testing Tasks:
        ◦ Task 4.3.13: Write Unit Tests 
            ▪ Subtask 4.3.13.1: Unit tests for frontend eligibility logic for "Request Return" button. 
            ▪ Subtask 4.3.13.2: Unit tests for backend return eligibility checks (status, date). 
            ▪ Subtask 4.3.13.3: Unit tests for return request creation. 
        ◦ Task 4.3.14: Write Integration Tests 
            ▪ Subtask 4.3.14.1: Place an order, simulate "Delivered" status (e.g., manually update DB), then request a return for some items. Verify ReturnRequest created and email sent. 
            ▪ Subtask 4.3.14.2: Test requesting return for an order that is "Shipped" or "Pending" (expect failure). 
            ▪ Subtask 4.3.14.3: Test requesting return for an order outside the return window. 
            ▪ Subtask 4.3.14.4: Test with partial return quantities. 
            ▪ Subtask 4.3.14.5: Test image upload functionality. 
            ▪ Subtask 4.3.14.6: Test unauthorized return requests. 
        ◦ Task 4.3.15: Manual End-to-End Testing 
            ▪ Subtask 4.3.15.1: Place an order and manually set its status to "Delivered" with a recent delivery date. 
            ▪ Subtask 4.3.15.2: Go to Order Details, verify "Request Return" button is visible. 
            ▪ Subtask 4.3.15.3: Click "Request Return", select some items, provide reasons, optionally upload an image. Submit. 
            ▪ Subtask 4.3.15.4: Verify confirmation message on UI. 
            ▪ Subtask 4.3.15.5: Check DB for new ReturnRequest document. 
            ▪ Subtask 4.3.15.6: Verify return confirmation email is received. 
            ▪ Subtask 4.3.15.7: Test ineligible orders (not delivered, too old) - button should be hidden/disabled.
Epic: Post-Purchase Operations & Support
Story 4.4: Contact Customer Support (Customer)
Story: As a customer, I want to easily contact customer support with a query or issue so that I can get help with my orders or general inquiries.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Contact Us" or "Support" link is readily available in the website's footer or header, and potentially within the customer account area. 
    2. Clicking the link navigates to a "Contact Us" form. 
    3. The form requests the following information: 
        ◦ Full Name (pre-filled if logged in) 
        ◦ Email Address (pre-filled if logged in) 
        ◦ Subject (dropdown for common topics like "Order Inquiry," "Product Question," "Technical Issue," "Other") 
        ◦ Order Number (Optional field, for specific order inquiries) 
        ◦ Message/Description (Required, multi-line text area) 
    4. Client-side validation ensures required fields are filled and email format is correct. 
    5. Upon successful submission, a confirmation message is displayed to the customer. 
    6. The support request is securely sent to the customer support team (e.g., via email, or into an internal ticketing system). 
    7. An automatic acknowledgment email is sent to the customer. 
    8. All contact operations are performed securely. 

Granular Tasks & Subtasks for Story 4.4:
    • Frontend Tasks:
        ◦ Task 4.4.1: Implement "Contact Us" Page UI 
            ▪ Subtask 4.4.1.1: Create ContactUsPage component/route (e.g., /contact-us). 
            ▪ Subtask 4.4.1.2: Design and implement the contact form with fields for Full Name, Email Address, Subject (dropdown), Order Number (optional), and Message. 
            ▪ Subtask 4.4.1.3: Add a "Submit" button. 
            ▪ Subtask 4.4.1.4: Place "Contact Us" link in the website footer/header and customer account dashboard. 
        ◦ Task 4.4.2: Pre-fill Form for Logged-in Users 
            ▪ Subtask 4.4.2.1: If the user is logged in, automatically pre-fill Full Name and Email Address fields with their account details. 
        ◦ Task 4.4.3: Implement Client-Side Validation for Contact Form 
            ▪ Subtask 4.4.3.1: Ensure Full Name, Email Address, Subject, and Message are required (except Order Number). 
            ▪ Subtask 4.4.3.2: Validate email format. 
            ▪ Subtask 4.4.3.3: Display real-time feedback for invalid input. 
        ◦ Task 4.4.4: Frontend API Integration: Submit Contact Form 
            ▪ Subtask 4.4.4.1: Create service/hook to send form data to POST /api/support/contact. 
            ▪ Subtask 4.4.4.2: On successful submission, display a confirmation message (e.g., "Your message has been sent! We'll get back to you shortly.") and clear the form. 
            ▪ Subtask 4.4.4.3: Handle error responses gracefully. 
    • Backend Tasks:
        ◦ Task 4.4.5: Create Submit Contact Form API Endpoint 
            ▪ Subtask 4.4.5.1: Design and implement POST /api/support/contact. 
            ▪ Subtask 4.4.5.2: Server-side validation for all incoming form data (required fields, email format, valid subject options). 
            ▪ Subtask 4.4.5.3: Sanitize input to prevent XSS. 
            ▪ Subtask 4.4.5.4: If an Order Number is provided, perform a basic validation (e.g., does it match an existing order, and optionally, does it belong to the logged-in user if they are logged in?). 
            ▪ Subtask 4.4.5.5: Route the support request: 
                • Option A (MVP): Send an email to a predefined customer support email address with all form details. 
                • Option B (Future/Integrate): Integrate with an external ticketing system (e.g., Zendesk, Freshdesk) to create a new ticket. 
            ▪ Subtask 4.4.5.6: Trigger sending of automatic acknowledgment email to the customer. 
            ▪ Subtask 4.4.5.7: Return a success response. 
        ◦ Task 4.4.6: Email Service Integration (Acknowledgment) 
            ▪ Subtask 4.4.6.1: Create a simple acknowledgment email template. 
            ▪ Subtask 4.4.6.2: Implement function to send this acknowledgment email to the customer's provided email address upon successful request submission. 
        ◦ Task 4.4.7: (Optional) Implement Rate Limiting 
            ▪ Subtask 4.4.7.1: Add rate limiting to POST /api/support/contact to prevent spam or abuse. 
    • Testing Tasks:
        ◦ Task 4.4.8: Write Unit Tests 
            ▪ Subtask 4.4.8.1: Unit tests for frontend form validation logic. 
            ▪ Subtask 4.4.8.2: Unit tests for backend input validation and sanitization. 
        ◦ Task 4.4.9: Write Integration Tests 
            ▪ Subtask 4.4.9.1: Test POST /api/support/contact with valid data (verify email sent/ticket created). 
            ▪ Subtask 4.4.9.2: Test with missing required fields (expect error). 
            ▪ Subtask 4.4.9.3: Test with invalid email format. 
            ▪ Subtask 4.4.9.4: Test with a valid Order Number (if validation logic is implemented). 
        ◦ Task 4.4.10: Manual End-to-End Testing 
            ▪ Subtask 4.4.10.1: Navigate to the "Contact Us" page (logged in and logged out). 
            ▪ Subtask 4.4.10.2: Verify pre-filled fields for logged-in users. 
            ▪ Subtask 4.4.10.3: Fill out the form with valid data and submit. 
            ▪ Subtask 4.4.10.4: Verify success message on UI. 
            ▪ Subtask 4.4.10.5: Check the customer support email inbox/ticketing system to ensure the request was received. 
            ▪ Subtask 4.4.10.6: Verify the automatic acknowledgment email is received by the customer. 
            ▪ Subtask 4.4.10.7: Test all client-side validation messages (empty fields, invalid email).
Epic: Post-Purchase Operations & Support
Story 4.5: View Return Request Status (Customer)
Story: As a customer, I want to be able to check the status of my return request(s) so that I can stay informed about the progress of my return and expected refund.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. From the "Order Details" page (Story 2.9), if a return request exists for the order, a section or link allows the customer to view its status. 
    2. Alternatively, or in addition to, a "Return History" page within the customer account area lists all return requests made by the customer. 
    3. For each return request, the following information is displayed: 
        ◦ Return Request ID 
        ◦ Request Date 
        ◦ Status (e.g., "Pending Review," "Approved," "Rejected," "Received," "Refunded," "Closed") 
        ◦ List of returned items with quantities and reasons 
        ◦ (Optional) Tracking information for the return shipment (if applicable) 
        ◦ (Optional) Communication log (e.g., messages exchanged between customer and support) 
    4. The status of each return request is kept up-to-date. 
    5. All return request information is presented securely. 

Granular Tasks & Subtasks for Story 4.5:
    • Frontend Tasks:
        ◦ Task 4.5.1: Integrate Return Status into Order Details Page 
            ▪ Subtask 4.5.1.1: On the OrderDetailsPage (from Story 2.9), if a return request exists for the order (e.g., hasReturnRequest: true or by querying for a ReturnRequest with the orderId), add a section to display basic return status. 
            ▪ Subtask 4.5.1.2: This section should include the returnRequestId and the current status. 
            ▪ Subtask 4.5.1.3: Provide a link (e.g., "View Return Details") to a dedicated page for more information. 
        ◦ Task 4.5.2: Implement "Return History" Page UI 
            ▪ Subtask 4.5.2.1: Create ReturnHistoryPage component/route (e.g., /my-account/returns). 
            ▪ Subtask 4.5.2.2: Display a list of all return requests for the logged-in user. 
            ▪ Subtask 4.5.2.3: For each return, show the returnRequestId, requestDate, status, and a brief summary of returned items (e.g., "3 items"). 
            ▪ Subtask 4.5.2.4: Provide a link to a detailed view of each return request. 
        ◦ Task 4.5.3: Implement "Return Details" Page UI 
            ▪ Subtask 4.5.3.1: Create ReturnDetailsPage component/route (e.g., /my-account/returns/:returnRequestId). 
            ▪ Subtask 4.5.3.2: Display all details of the return request: returnRequestId, requestDate, status, list of returned items with quantities and reasons, any uploaded images, and (optionally) tracking information and communication log. 
            ▪ Subtask 4.5.3.3: Use a clear and organized layout. 
        ◦ Task 4.5.4: Frontend API Integration: Fetch Return Requests 
            ▪ Subtask 4.5.4.1: Create service/hook to call GET /api/user/returns (for Return History Page) - should return a list of return requests for the logged-in user. 
            ▪ Subtask 4.5.4.2: Create service/hook to call GET /api/user/returns/:returnRequestId (for Return Details Page) - should return the full details of a specific return request. 
            ▪ Subtask 4.5.4.3: Ensure these endpoints return up-to-date status information. 
    • Backend Tasks:
        ◦ Task 4.5.5: Create API Endpoint to Get Return Requests (List) 
            ▪ Subtask 4.5.5.1: Design and implement GET /api/user/returns. 
            ▪ Subtask 4.5.5.2: Authenticate user. 
            ▪ Subtask 4.5.5.3: Fetch all ReturnRequest documents for the logged-in userId. 
            ▪ Subtask 4.5.5.4: Return a list of return requests with necessary details (e.g., returnRequestId, requestDate, status, list of returned items). 
        ◦ Task 4.5.6: Create API Endpoint to Get Return Request Details 
            ▪ Subtask 4.5.6.1: Design and implement GET /api/user/returns/:returnRequestId. 
            ▪ Subtask 4.5.6.2: Authenticate user. 
            ▪ Subtask 4.5.6.3: Verify that the returnRequestId belongs to the logged-in user. 
            ▪ Subtask 4.5.6.4: Fetch the full ReturnRequest document from MongoDB. 
            ▪ Subtask 4.5.6.5: Return all details of the return request. 
        ◦ Task 4.5.7: (Optional) Implement Tracking Information Integration 
            ▪ Subtask 4.5.7.1: If the return shipment has tracking information (e.g., from an admin panel update), include it in the ReturnDetailsPage. 
        ◦ Task 4.5.8: (Optional) Implement Communication Log 
            ▪ Subtask 4.5.8.1: If a communication log is desired, add a field to the ReturnRequest schema (e.g., communicationLog: array of objects with timestamp, sender (customer/admin), message). 
            ▪ Subtask 4.5.8.2: Implement UI and backend logic to display and potentially add to this log. 
    • Security & Data Integrity Tasks:
        ◦ Task 4.5.9: Secure Access to Return Information 
            ▪ Subtask 4.5.9.1: Double-check that all endpoints only allow access to return requests belonging to the authenticated user. 
    • Testing Tasks:
        ◦ Task 4.5.10: Write Unit Tests 
            ▪ Subtask 4.5.10.1: Unit tests for frontend logic to display return request information. 
            ▪ Subtask 4.5.10.2: Unit tests for backend logic to retrieve return requests and details. 
        ◦ Task 4.5.11: Write Integration Tests 
            ▪ Subtask 4.5.11.1: Create a return request (e.g., manually in DB or using the "Request Return" flow from Story 4.3). 
            ▪ Subtask 4.5.11.2: Test fetching the list of return requests (verify the created request is present). 
            ▪ Subtask 4.5.11.3: Test fetching the details of the created return request. 
            ▪ Subtask 4.5.11.4: Test attempting to access return requests belonging to another user. 
        ◦ Task 4.5.12: Manual End-to-End Testing 
            ▪ Subtask 4.5.12.1: Create a return request. 
            ▪ Subtask 4.5.12.2: Navigate to the "Return History" page and verify the request is displayed. 
            ▪ Subtask 4.5.12.3: Click on the request to view details. Verify all details are displayed correctly. 
            ▪ Subtask 4.5.12.4: Test the "View Return Details" link from the "Order Details" page.
Epic: Admin Order Management
Story 5.1: Admin Login & Dashboard
Story: As an administrator, I want to securely log in to the admin panel and see a dashboard with key order metrics so that I can monitor the business operations at a glance.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A dedicated admin login page is accessible via a specific URL (e.g., /admin/login). 
    2. Admins can log in using their email/username and password. 
    3. Authentication is secure (e.g., hashed passwords, JWTs). 
    4. Upon successful login, the admin is redirected to the Admin Dashboard. 
    5. The Admin Dashboard displays key operational metrics, such as: 
        ◦ Total Orders (Today/Week/Month) 
        ◦ Total Revenue (Today/Week/Month) 
        ◦ Number of Pending Orders 
        ◦ Number of Orders Awaiting Shipment 
        ◦ New Customers (Today/Week/Month) 
        ◦ (Optional) Quick links to "Manage Orders," "Manage Products," "Manage Users." 
    6. Unauthorized users attempting to access admin routes are redirected to the login page or receive an access denied error. 
    7. A "Logout" option is available in the admin panel. 

Granular Tasks & Subtasks for Story 5.1:
    • Frontend Tasks (Admin Panel):
        ◦ Task 5.1.1: Implement Admin Login Page UI 
            ▪ Subtask 5.1.1.1: Create AdminLoginPage component/route (e.g., /admin/login). 
            ▪ Subtask 5.1.1.2: Design and implement a simple login form with "Username/Email" and "Password" fields. 
            ▪ Subtask 5.1.1.3: Add a "Login" button. 
            ▪ Subtask 5.1.1.4: Implement client-side validation (e.g., required fields). 
        ◦ Task 5.1.2: Implement Admin Dashboard UI 
            ▪ Subtask 5.1.2.1: Create AdminDashboardPage component/route (e.g., /admin/dashboard). 
            ▪ Subtask 5.1.2.2: Design a layout for displaying key metrics using cards or summary boxes. 
            ▪ Subtask 5.1.2.3: Implement placeholder components for metrics like "Total Orders," "Revenue," "Pending Orders," "New Customers." 
            ▪ Subtask 5.1.2.4: Add navigation sidebar/header for quick links (e.g., to future "Manage Orders," "Manage Products"). 
        ◦ Task 5.1.3: Implement Admin Authentication Flow (Frontend) 
            ▪ Subtask 5.1.3.1: Create a dedicated admin authentication service/hook to handle login requests. 
            ▪ Subtask 5.1.3.2: On successful login, store JWT token (or similar) securely (e.g., in localStorage or sessionStorage). 
            ▪ Subtask 5.1.3.3: Redirect to /admin/dashboard upon successful authentication. 
            ▪ Subtask 5.1.3.4: Implement global route protection for all /admin routes, redirecting unauthenticated users to /admin/login. 
            ▪ Subtask 5.1.3.5: Implement "Logout" functionality (clear token, redirect to login). 
        ◦ Task 5.1.4: Frontend API Integration: Fetch Dashboard Metrics 
            ▪ Subtask 5.1.4.1: Create service/hook to call GET /api/admin/dashboard-metrics. 
            ▪ Subtask 5.1.4.2: Display fetched data on the dashboard. 
            ▪ Subtask 5.1.4.3: Handle loading states and errors. 
    • Backend Tasks (Admin API):
        ◦ Task 5.1.5: Create Admin User Schema & Management 
            ▪ Subtask 5.1.5.1: Define MongoDB schema for AdminUser (or add role: 'admin' to existing User schema). Include fields for email, passwordHash, firstName, lastName, permissions (future use). 
            ▪ Subtask 5.1.5.2: (Manual/Initial Setup) Create at least one admin user directly in the database for initial testing. 
        ◦ Task 5.1.6: Implement Admin Login API Endpoint 
            ▪ Subtask 5.1.6.1: Design and implement POST /api/admin/login. 
            ▪ Subtask 5.1.6.2: Validate incoming email/username and password. 
            ▪ Subtask 5.1.6.3: Hash incoming password and compare to stored hash. 
            ▪ Subtask 5.1.6.4: If valid, generate a JWT token (with admin role/permissions) and return it to the frontend. 
            ▪ Subtask 5.1.6.5: Handle invalid credentials (e.g., 401 Unauthorized). 
        ◦ Task 5.1.7: Implement Admin Authentication Middleware 
            ▪ Subtask 5.1.7.1: Create middleware to verify JWT tokens for all /api/admin routes. 
            ▪ Subtask 5.1.7.2: Ensure middleware checks for admin role/permission. 
            ▪ Subtask 5.1.7.3: Return 401/403 for invalid/missing tokens or insufficient permissions. 
        ◦ Task 5.1.8: Create Admin Dashboard Metrics API Endpoint 
            ▪ Subtask 5.1.8.1: Design and implement GET /api/admin/dashboard-metrics. 
            ▪ Subtask 5.1.8.2: Apply admin authentication middleware. 
            ▪ Subtask 5.1.8.3: Query Order collection for: 
                • Total orders (all time) 
                • Orders by status (Pending, Awaiting Shipment). 
                • Aggregate total revenue (sum of grandTotal) for specified periods (Today, Week, Month). 
            ▪ Subtask 5.1.8.4: Query User collection for new customers (based on createdAt) for specified periods. 
            ▪ Subtask 5.1.8.5: Return the calculated metrics. 
    • Security Tasks:
        ◦ Task 5.1.9: Secure JWT Handling 
            ▪ Subtask 5.1.9.1: Ensure JWTs are generated securely (strong secret) and handled properly (e.g., short expiry, refresh tokens - optional for MVP). 
            ▪ Subtask 5.1.9.2: Store JWTs in HttpOnly cookies if possible, or localStorage with XSS protection. 
        ◦ Task 5.1.10: Password Hashing 
            ▪ Subtask 5.1.10.1: Use a strong, salt-based hashing algorithm (e.g., bcrypt) for admin passwords. 
    • Testing Tasks:
        ◦ Task 5.1.11: Write Unit Tests 
            ▪ Subtask 5.1.11.1: Unit tests for frontend login form validation. 
            ▪ Subtask 5.1.11.2: Unit tests for backend password comparison and JWT generation. 
            ▪ Subtask 5.1.11.3: Unit tests for dashboard metric calculation logic (mocking DB data). 
        ◦ Task 5.1.12: Write Integration Tests 
            ▪ Subtask 5.1.12.1: Test successful admin login (verify token generation). 
            ▪ Subtask 5.1.12.2: Test login with incorrect credentials. 
            ▪ Subtask 5.1.12.3: Test accessing /api/admin/dashboard-metrics with/without valid admin token. 
            ▪ Subtask 5.1.12.4: Verify dashboard metrics API returns correct aggregated data based on mock order/user data. 
        ◦ Task 5.1.13: Manual End-to-End Testing 
            ▪ Subtask 5.1.13.1: Navigate to /admin/login. 
            ▪ Subtask 5.1.13.2: Attempt login with invalid credentials. Verify error message. 
            ▪ Subtask 5.1.13.3: Log in with valid admin credentials. Verify redirection to dashboard. 
            ▪ Subtask 5.1.13.4: Verify dashboard metrics are displayed (initially 0 or based on test data). 
            ▪ Subtask 5.1.13.5: Navigate directly to /admin/dashboard without logging in. Verify redirection to login page. 
            ▪ Subtask 5.1.13.6: Test "Logout" functionality.
Epic: Admin Order Management
Story 5.2: View All Orders (Admin)
Story: As an administrator, I want to view a paginated list of all customer orders, with options to filter and sort them, so that I can efficiently review and locate specific orders.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Manage Orders" link is available in the Admin Dashboard navigation. 
    2. Clicking "Manage Orders" navigates the admin to a comprehensive order list page. 
    3. The page displays a paginated list of all orders in the system. 
    4. For each order, the following key details are displayed: 
        ◦ Order Number 
        ◦ Customer Name 
        ◦ Order Date 
        ◦ Grand Total 
        ◦ Current Status (e.g., "Pending," "Shipped," "Delivered," "Cancelled") 
    5. Admins can filter orders by: 
        ◦ Order Status 
        ◦ Customer Name/Email 
        ◦ Date Range 
    6. Admins can sort orders by: 
        ◦ Order Date (default: newest first) 
        ◦ Grand Total 
    7. A "View Details" button/link is available for each order to navigate to its full details (this will be addressed in Story 5.3). 
    8. All data retrieval is performed securely with admin-level authentication. 

Granular Tasks & Subtasks for Story 5.2:
    • Frontend Tasks (Admin Panel):
        ◦ Task 5.2.1: Implement "Manage Orders" Page UI 
            ▪ Subtask 5.2.1.1: Create AdminOrdersListPage component/route (e.g., /admin/orders). 
            ▪ Subtask 5.2.1.2: Add a navigation link for "Manage Orders" in the Admin Dashboard sidebar/menu. 
            ▪ Subtask 5.2.1.3: Design and implement a responsive table or list layout to display order summaries. 
            ▪ Subtask 5.2.1.4: Include columns for Order Number, Customer Name, Order Date, Grand Total, Status. 
            ▪ Subtask 5.2.1.5: Add a "View Details" button/link for each order row. 
        ◦ Task 5.2.2: Implement Pagination UI for Orders 
            ▪ Subtask 5.2.2.1: Reuse/adapt Pagination component from earlier stories (e.g., Story 1.1, 2.8). 
            ▪ Subtask 5.2.2.2: Integrate pagination controls with the order list. 
        ◦ Task 5.2.3: Implement Filtering UI 
            ▪ Subtask 5.2.3.1: Add dropdowns/selects for filtering by Order Status. 
            ▪ Subtask 5.2.3.2: Implement input fields for Customer Name/Email search. 
            ▪ Subtask 5.2.3.3: Add date picker components for "from" and "to" date range filtering. 
            ▪ Subtask 5.2.3.4: Include a "Apply Filters" and "Clear Filters" button. 
        ◦ Task 5.2.4: Implement Sorting UI 
            ▪ Subtask 5.2.4.1: Make table headers clickable for sorting (Order Date, Grand Total). 
            ▪ Subtask 5.2.4.2: Indicate current sort direction (ascending/descending) on the UI. 
        ◦ Task 5.2.5: Frontend API Integration: Fetch All Orders (with Filters/Sorting) 
            ▪ Subtask 5.2.5.1: Create service/hook to call GET /api/admin/orders. 
            ▪ Subtask 5.2.5.2: Pass pagination parameters (page, limit), filtering parameters (status, customerQuery, startDate, endDate), and sorting parameters (sortBy, sortOrder). 
            ▪ Subtask 5.2.5.3: Display fetched order data in the table. 
            ▪ Subtask 5.2.5.4: Handle loading states and display "No orders found" message. 
        ◦ Task 5.2.6: Display Customer Name (Cross-reference) 
            ▪ Subtask 5.2.6.1: Ensure the frontend can display the customer's full name or email, which might require including customer details in the order data returned by the backend or making an additional lookup (prefer latter for efficiency). 
    • Backend Tasks (Admin API):
        ◦ Task 5.2.7: Create Get All Orders API Endpoint (for Admin) 
            ▪ Subtask 5.2.7.1: Design and implement GET /api/admin/orders. 
            ▪ Subtask 5.2.7.2: Apply admin authentication middleware (from Story 5.1). 
            ▪ Subtask 5.2.7.3: Implement logic to query the Order collection for all orders. 
            ▪ Subtask 5.2.7.4: Implement pagination (skip/limit) on the query. 
            ▪ Subtask 5.2.7.5: Implement filtering logic based on: 
                • status (e.g., $match { status: '...' }) 
                • customerQuery (e.g., populate userId and then search User collection for name/email, then filter orders. Or, if customer name is denormalized on order, search directly). 
                • startDate, endDate (e.g., $match { orderDate: { $gte: ..., $lte: ... } }) 
            ▪ Subtask 5.2.7.6: Implement sorting logic based on orderDate (default: desc) and grandTotal. 
            ▪ Subtask 5.2.7.7: Populate userId to include customer's name/email for display on the order list. 
            ▪ Subtask 5.2.7.8: Return the paginated list of orders and total count for pagination. 
        ◦ Task 5.2.8: Optimize Database Indexes 
            ▪ Subtask 5.2.8.1: Ensure appropriate indexes exist on Order fields for filtering and sorting (e.g., status, orderDate, grandTotal, userId). 
            ▪ Subtask 5.2.8.2: If searching by customer name/email, ensure User collection has indexes on email, firstName, lastName. 
    • Testing Tasks:
        ◦ Task 5.2.9: Write Unit Tests 
            ▪ Subtask 5.2.9.1: Unit tests for frontend filter/sort state management. 
            ▪ Subtask 5.2.9.2: Unit tests for backend order querying logic (pagination, filtering, sorting with mock DB). 
        ◦ Task 5.2.10: Write Integration Tests 
            ▪ Subtask 5.2.10.1: Log in as admin, then call GET /api/admin/orders. Verify list of orders is returned. 
            ▪ Subtask 5.2.10.2: Test with page and limit parameters to verify pagination. 
            ▪ Subtask 5.2.10.3: Test filtering by various status values. 
            ▪ Subtask 5.2.10.4: Test filtering by customerQuery (name/email). 
            ▪ Subtask 5.2.10.5: Test filtering by startDate and endDate. 
            ▪ Subtask 5.2.10.6: Test sorting by orderDate and grandTotal (ASC/DESC). 
            ▪ Subtask 5.2.10.7: Test unauthorized access to this endpoint. 
        ◦ Task 5.2.11: Manual End-to-End Testing 
            ▪ Subtask 5.2.11.1: Log in to the admin panel. 
            ▪ Subtask 5.2.11.2: Navigate to "Manage Orders." 
            ▪ Subtask 5.2.11.3: Verify all orders are listed with correct summary details. 
            ▪ Subtask 5.2.11.4: Test pagination controls. 
            ▪ Subtask 5.2.11.5: Apply various filters (by status, by customer, by date range) and verify results. 
            ▪ Subtask 5.2.11.6: Test sorting by clicking on column headers. 
            ▪ Subtask 5.2.11.7: Ensure "View Details" links are present (though actual details will be in Story 5.3).
Epic: Admin Order Management
Story 5.3: View Order Details (Admin)
Story: As an administrator, I want to view the comprehensive details of a specific order so that I can understand its complete history, customer information, and items purchased, to facilitate management and support.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. Clicking "View Details" from an order in the "Manage Orders" list (Story 5.2) navigates the admin to a dedicated "Order Details" page for that order. 
    2. The page displays all comprehensive information for the specific order, including: 
        ◦ Order Number/ID 
        ◦ Order Date, Last Updated Date 
        ◦ Current Order Status 
        ◦ Grand Total, Subtotal, Shipping Cost, Tax, Discounts. 
        ◦ Full Customer Information (Name, Email, Phone, potentially link to customer profile). 
        ◦ Selected Shipping Address (full details). 
        ◦ Selected Billing Address (full details). 
        ◦ Chosen Shipping Method. 
        ◦ Chosen Payment Method (type, last 4 digits, payment Intent ID/transaction ID, payment status). 
        ◦ A detailed list of all purchased items (Product Name, Image, Quantity, Unit Price, Line Total). 
        ◦ (Optional) Order History/Status Log (e.g., "Order Placed," "Status Changed to Shipped," "Refund Issued"). 
    3. The admin can identify if there's an active return request associated with this order and potentially link to its details (building on Story 4.5 backend data). 
    4. All data retrieval is performed securely with admin-level authentication. 

Granular Tasks & Subtasks for Story 5.3:
    • Frontend Tasks (Admin Panel):
        ◦ Task 5.3.1: Implement "Order Details" Page UI for Admin 
            ▪ Subtask 5.3.1.1: Create AdminOrderDetailsPage component/route (e.g., /admin/orders/:orderId). 
            ▪ Subtask 5.3.1.2: Design a comprehensive layout for displaying all order information, organized into logical sections (e.g., Summary, Customer Info, Shipping, Billing, Payment, Items, History). 
            ▪ Subtask 5.3.1.3: Ensure the "View Details" button/link on AdminOrdersListPage (Story 5.2) correctly navigates to this new page with the orderId. 
        ◦ Task 5.3.2: Display Order Summary Details 
            ▪ Subtask 5.3.2.1: Render Order Number, Dates, Status, and financial totals (Grand Total, Subtotal, Shipping, Tax, Discounts). 
        ◦ Task 5.3.3: Display Customer, Shipping, and Billing Information 
            ▪ Subtask 5.3.3.1: Display customer's full name, email, phone, and potentially a link to their admin user profile (if Story 5.x "Manage Users" is implemented later). 
            ▪ Subtask 5.3.3.2: Render full details of the Shipping Address. 
            ▪ Subtask 5.3.3.3: Render full details of the Billing Address. 
        ◦ Task 5.3.4: Display Shipping and Payment Method Details 
            ▪ Subtask 5.3.4.1: Show the chosen Shipping Method (name, cost). 
            ▪ Subtask 5.3.4.2: Display Payment Method details (type, last 4 digits, transaction ID/Payment Intent ID, payment status). 
        ◦ Task 5.3.5: Display Ordered Items List 
            ▪ Subtask 5.3.5.1: Iterate through items array and display product details (Image, Name, Quantity, Unit Price, Line Total) in a clear table format. 
        ◦ Task 5.3.6: (Optional) Display Order History/Status Log 
            ▪ Subtask 5.3.6.1: If the backend provides an statusHistory array (from Story 4.1), render it as a chronological log. 
        ◦ Task 5.3.7: Frontend API Integration: Fetch Single Order Details 
            ▪ Subtask 5.3.7.1: Create service/hook to call GET /api/admin/orders/:orderId. 
            ▪ Subtask 5.3.7.2: Pass orderId extracted from the URL. 
            ▪ Subtask 5.3.7.3: Handle loading states and display "Order Not Found" or "Access Denied" errors. 
    • Backend Tasks (Admin API):
        ◦ Task 5.3.8: Create Get Single Order Details API Endpoint (for Admin) 
            ▪ Subtask 5.3.8.1: Design and implement GET /api/admin/orders/:orderId. 
            ▪ Subtask 5.3.8.2: Apply admin authentication middleware (from Story 5.1). 
            ▪ Subtask 5.3.8.3: Query the Order collection by _id. 
            ▪ Subtask 5.3.8.4: Populate all necessary nested data: 
                • userId to get full customer details (name, email, phone). 
                • items.productId to get full product details (image, current name, etc. - though the order items should already store a snapshot). 
            ▪ Subtask 5.3.8.5: Ensure all comprehensive order details (as per ACs) are returned, including shippingAddress, billingAddress, paymentMethod, shippingMethod, items, statusHistory. 
            ▪ Subtask 5.3.8.6: Return 404 if order not found. 
    • Testing Tasks:
        ◦ Task 5.3.9: Write Unit Tests 
            ▪ Subtask 5.3.9.1: Unit tests for frontend rendering of complex order data structures. 
            ▪ Subtask 5.3.9.2: Unit tests for backend order retrieval logic, ensuring correct data population. 
        ◦ Task 5.3.10: Write Integration Tests 
            ▪ Subtask 5.3.10.1: Log in as admin, then call GET /api/admin/orders/:orderId for a valid order ID. Verify all specified fields are returned correctly. 
            ▪ Subtask 5.3.10.2: Test with an invalid orderId (expect 404). 
            ▪ Subtask 5.3.10.3: Test attempting to access the endpoint without admin authentication (expect 401/403). 
            ▪ Subtask 5.3.10.4: Verify all nested customer and item data is included in the response. 
        ◦ Task 5.3.11: Manual End-to-End Testing 
            ▪ Subtask 5.3.11.1: Log in to the admin panel. 
            ▪ Subtask 5.3.11.2: Go to "Manage Orders" (Story 5.2). 
            ▪ Subtask 5.3.11.3: Click "View Details" for a few different orders (e.g., one with multiple items, one with a discount, one that was cancelled). 
            ▪ Subtask 5.3.11.4: Verify that all expected information (summary, customer, addresses, payment, shipping, items, status) is accurately displayed. 
            ▪ Subtask 5.3.11.5: Verify the link to customer profile if implemented.
Epic: Admin Order Management
Story 5.4: Update Order Status (Admin)
Story: As an administrator, I want to be able to manually update an order's status (e.g., to "Shipped," "Delivered," "Cancelled") and add tracking information so that I can reflect the actual state of the order and inform the customer.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. On the "Order Details" page (Story 5.3), there is an interface for changing the order's status. 
    2. The admin can select from a predefined list of valid next statuses (e.g., from "Processing" to "Shipped," but not directly to "Delivered"). 
    3. If the status is changed to "Shipped," fields for entering a tracking number and shipping carrier link become available and are required. 
    4. A confirmation dialog appears before applying the status change. 
    5. Upon successful update, the order's status is immediately reflected on the Admin Order Details page and the customer's Order Tracking page (Story 4.1). 
    6. An email notification is automatically sent to the customer if the status changes to "Shipped" or "Delivered" (or other significant states). 
    7. If an order is manually "Cancelled" by admin, stock levels of items are returned to inventory (similar to customer cancellation in 4.2). 
    8. All status updates are securely logged with an audit trail (who changed, when, to what). 

Granular Tasks & Subtasks for Story 5.4:
    • Frontend Tasks (Admin Panel):
        ◦ Task 5.4.1: Implement Order Status Update UI on Order Details Page 
            ▪ Subtask 5.4.1.1: On AdminOrderDetailsPage (Story 5.3), add a "Status Update" section. 
            ▪ Subtask 5.4.1.2: Implement a dropdown/select element populated with valid next statuses based on the current order status. 
            ▪ Subtask 5.4.1.3: Add an "Update Status" button. 
            ▪ Subtask 5.4.1.4: Implement input fields for trackingNumber and trackingLink that become visible and required only when "Shipped" status is selected. 
        ◦ Task 5.4.2: Implement Status Change Confirmation Dialog 
            ▪ Subtask 5.4.2.1: On clicking "Update Status," display a modal for confirmation (e.g., "Confirm status change to [New Status]?"). 
            ▪ Subtask 5.4.2.2: Include warning if cancelling order (e.g., "This will also initiate a refund and restock items."). 
        ◦ Task 5.4.3: Frontend API Integration: Update Order Status 
            ▪ Subtask 5.4.3.1: Create service/hook to call PUT /api/admin/orders/:orderId/status. 
            ▪ Subtask 5.4.3.2: Send the newStatus, trackingNumber, and trackingLink (if applicable) in the request body. 
            ▪ Subtask 5.4.3.3: On successful response, refresh the order details on the current page to reflect the new status. 
            ▪ Subtask 5.4.3.4: Display success/error notifications. 
    • Backend Tasks (Admin API):
        ◦ Task 5.4.4: Define Order Status Transition Logic 
            ▪ Subtask 5.4.4.1: Create a predefined list or state machine for valid order status transitions (e.g., Pending -> Processing, Processing -> Shipped, Shipped -> Delivered, Any -> Cancelled, Delivered -> Returned). 
        ◦ Task 5.4.5: Create Update Order Status API Endpoint 
            ▪ Subtask 5.4.5.1: Design and implement PUT /api/admin/orders/:orderId/status. 
            ▪ Subtask 5.4.5.2: Apply admin authentication middleware (from Story 5.1). 
            ▪ Subtask 5.4.5.3: Validate orderId and ensure it exists. 
            ▪ Subtask 5.4.5.4: Validate newStatus against the current order status using the defined transition logic. Return error if invalid. 
            ▪ Subtask 5.4.5.5: If newStatus is "Shipped": 
                • Validate trackingNumber and trackingLink are present and valid. 
                • Store them in the Order document. 
            ▪ Subtask 5.4.5.6: If newStatus is "Cancelled": 
                • Implement Transactional Logic: 
                    ◦ Start database transaction. 
                    ◦ For each item in the order, increment the stockQuantity in the Product collection. 
                    ◦ Initiate Refund Process: If the order was paid, trigger a refund via the payment gateway (similar to Story 4.2 cancellation logic, but initiated by admin). 
                    ◦ Commit transaction. 
            ▪ Subtask 5.4.5.7: Update Order document's status. 
            ▪ Subtask 5.4.5.8: Log the status change: Append entry to statusHistory (from Story 4.1's order model enhancement) including timestamp, oldStatus, newStatus, adminUserId (who made the change). 
            ▪ Subtask 5.4.5.9: Trigger relevant email notifications (e.g., "Order Shipped," "Order Delivered"). 
            ▪ Subtask 5.4.5.10: Return updated order data or success message. 
        ◦ Task 5.4.6: Email Service Integration (Status Notifications) 
            ▪ Subtask 5.4.6.1: Create email templates for "Order Shipped" (include tracking info) and "Order Delivered" notifications. 
            ▪ Subtask 5.4.6.2: Implement functions to send these emails triggered by the status update API. 
    • Security & Data Integrity Tasks:
        ◦ Task 5.4.7: Robust Authorization & Input Validation 
            ▪ Subtask 5.4.7.1: Ensure only authenticated admins can use this endpoint. 
            ▪ Subtask 5.4.7.2: Server-side validation for all input fields is critical. 
        ◦ Task 5.4.8: Atomic Operations for Cancellation 
            ▪ Subtask 5.4.8.1: Reconfirm that stock updates and refund initiations for admin-initiated cancellations are atomic transactions. 
    • Testing Tasks:
        ◦ Task 5.4.9: Write Unit Tests 
            ▪ Subtask 5.4.9.1: Unit tests for frontend status dropdown logic (valid next states). 
            ▪ Subtask 5.4.9.2: Unit tests for backend status transition logic. 
            ▪ Subtask 5.4.9.3: Unit tests for stock increment logic on cancellation. 
        ◦ Task 5.4.10: Write Integration Tests 
            ▪ Subtask 5.4.10.1: Create an order (Status: "Pending"). As admin, change to "Processing". Verify. 
            ▪ Subtask 5.4.10.2: Change from "Processing" to "Shipped" with valid tracking info. Verify status, tracking fields, and mock email trigger. 
            ▪ Subtask 5.4.10.3: Change from "Shipped" to "Delivered". Verify. 
            ▪ Subtask 5.4.10.4: Change an order from "Processing" to "Cancelled". Verify status, stock return, and mock refund/email trigger. 
            ▪ Subtask 5.4.10.5: Attempt invalid status transitions (e.g., "Pending" directly to "Delivered"). Expect error. 
            ▪ Subtask 5.4.10.6: Attempt "Shipped" status update without tracking info (expect error). 
            ▪ Subtask 5.4.10.7: Test unauthorized access. 
        ◦ Task 5.4.11: Manual End-to-End Testing 
            ▪ Subtask 5.4.11.1: Log in to admin. Go to Order Details for a test order. 
            ▪ Subtask 5.4.11.2: Select "Processing" from dropdown, confirm. Verify UI updates. 
            ▪ Subtask 5.4.11.3: Select "Shipped", enter dummy tracking number/link, confirm. Verify UI updates and check customer's order tracking page. Verify email received. 
            ▪ Subtask 5.4.11.4: Select "Delivered", confirm. Verify UI updates and check customer's order tracking page. Verify email received. 
            ▪ Subtask 5.4.11.5: Take another test order. Select "Cancelled", confirm. Verify stock increases, and check for refund initiation (e.g., in Stripe dashboard test mode).
Epic: Admin Order Management
Story 5.5: Issue Refund (Admin)
Story: As an administrator, I want to be able to issue full or partial refunds for orders so that I can process returns, cancellations, or resolve customer issues efficiently.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. On the "Order Details" page (Story 5.3), a "Issue Refund" button or section is available for eligible orders (e.g., paid orders that are not fully refunded). 
    2. Clicking "Issue Refund" presents a modal or form allowing the admin to: 
        ◦ Select individual items to refund (quantity for each). 
        ◦ Specify a custom refund amount. 
        ◦ Provide a reason for the refund (required). 
    3. The system calculates the maximum refundable amount for selected items/quantities. 
    4. Confirmation dialog appears before initiating the refund. 
    5. Upon successful refund, the refund is processed via the payment gateway (e.g., Stripe). 
    6. The order's refundStatus and refundHistory are updated in the database. 
    7. If a full refund is issued, the order's status may change to "Refunded" or "Closed". 
    8. An email notification is automatically sent to the customer confirming the refund. 
    9. Stock levels are returned to inventory for refunded items, similar to cancellation. 
    10. All refund operations are securely logged and authorized. 

Granular Tasks & Subtasks for Story 5.5:
    • Frontend Tasks (Admin Panel):
        ◦ Task 5.5.1: Implement "Issue Refund" UI on Order Details Page 
            ▪ Subtask 5.5.1.1: On AdminOrderDetailsPage (Story 5.3), add an "Issue Refund" button/section. 
            ▪ Subtask 5.5.1.2: Implement logic to enable/disable this button based on order paymentStatus (must be paid) and refundStatus (not fully refunded). 
        ◦ Task 5.5.2: Implement Refund Form Modal 
            ▪ Subtask 5.5.2.1: On clicking "Issue Refund," display a modal with the refund form. 
            ▪ Subtask 5.5.2.2: Option 1 (Item-based refund): List purchased items with checkboxes, quantity inputs, and calculated max refundable amount per item. 
            ▪ Option 2 (Amount-based refund, simpler for MVP): Allow direct input of a numeric refund amount, with a clear display of the maximum refundable amount for the entire order. 
            ▪ Subtask 5.5.2.3: Add a "Refund Reason" dropdown/textarea (required). 
            ▪ Subtask 5.5.2.4: Display the calculated total refund amount based on selections/input. 
            ▪ Subtask 5.5.2.5: Add "Confirm Refund" button. 
        ◦ Task 5.5.3: Implement Client-Side Validation for Refund Form 
            ▪ Subtask 5.5.3.1: Validate refund amount is numeric and within refundable limits. 
            ▪ Subtask 5.5.3.2: Ensure refund reason is provided. 
        ◦ Task 5.5.4: Implement Refund Confirmation Dialog 
            ▪ Subtask 5.5.4.1: Display a confirmation modal with summary of refund amount and items before final submission. 
        ◦ Task 5.5.5: Frontend API Integration: Initiate Refund 
            ▪ Subtask 5.5.5.1: Create service/hook to call POST /api/admin/orders/:orderId/refund. 
            ▪ Subtask 5.5.5.2: Send refundAmount (or refundItems with quantities), refundReason, and orderId in the request body. 
            ▪ Subtask 5.5.5.3: On successful response, update the order details on the current page to reflect the refund status. 
            ▪ Subtask 5.5.5.4: Display success/error notifications (e.g., "Refund initiated successfully," "Refund failed: [error]"). 
    • Backend Tasks (Admin API):
        ◦ Task 5.5.6: Update Order Model for Refund Tracking 
            ▪ Subtask 5.5.6.1: Ensure the Order schema includes fields for: 
                • refundStatus (Enum: none, partial_refunded, fully_refunded, pending_refund) 
                • totalRefundedAmount (Number) 
                • refundHistory (Array of objects: refundId, amount, date, reason, adminUserId, status (e.g., 'succeeded', 'failed', 'pending')) 
        ◦ Task 5.5.7: Create Issue Refund API Endpoint 
            ▪ Subtask 5.5.7.1: Design and implement POST /api/admin/orders/:orderId/refund. 
            ▪ Subtask 5.5.7.2: Apply admin authentication middleware. 
            ▪ Subtask 5.5.7.3: Validate orderId and ensure it's a valid, paid order. 
            ▪ Subtask 5.5.7.4: Validate refund amount/items: 
                • Calculate maximum refundable amount for the order (e.g., grandTotal - totalRefundedAmount). 
                • If item-based refund, verify quantities and calculate corresponding amount. 
                • Ensure requested refundAmount does not exceed the maximum. 
                • Ensure refundReason is provided. 
            ▪ Subtask 5.5.7.5: Initiate Refund via Payment Gateway (Stripe): 
                • Use Stripe SDK to call stripe.refunds.create with the paymentIntentId (from order) and the amount to refund. 
                • Handle Stripe's response (success, pending, failure). 
            ▪ Subtask 5.5.7.6: Implement Transactional Logic: 
                • Start database transaction. 
                • Update totalRefundedAmount and refundStatus in the Order document. 
                • Add entry to refundHistory. 
                • If the refund is due to item returns, increment stockQuantity for the corresponding products in the Product collection. 
                • If fully refunded, update orderStatus to "Refunded" or "Closed". 
                • Commit transaction. 
            ▪ Subtask 5.5.7.7: Trigger sending of refund confirmation email. 
            ▪ Subtask 5.5.7.8: Return success response with updated order data. 
        ◦ Task 5.5.8: Email Service Integration (Refund Confirmation) 
            ▪ Subtask 5.5.8.1: Create an email template for refund confirmation. 
            ▪ Subtask 5.5.8.2: Include details: order number, refund amount, items refunded, refund reason, and expected processing time. 
            ▪ Subtask 5.5.8.3: Implement function to send this email. 
        ◦ Task 5.5.9: (Optional) Handle Payment Gateway Webhooks for Async Refunds 
            ▪ Subtask 5.5.9.1: If refunds are asynchronous, set up Stripe webhooks (e.g., charge.refunded) to update refundStatus and refundHistory when payment gateway confirms the refund. (Crucial for robust systems). 
    • Security & Data Integrity Tasks:
        ◦ Task 5.5.10: Strict Authorization & Amount Validation 
            ▪ Subtask 5.5.10.1: Only authorized admins can initiate refunds. 
            ▪ Subtask 5.5.10.2: Server-side validation of refund amount against available balance is paramount. 
        ◦ Task 5.5.11: Atomic Refund Operations 
            ▪ Subtask 5.5.11.1: Ensure that the refund status update, totalRefundedAmount update, refundHistory entry, and stock adjustment are all part of a single, atomic database transaction. 
    • Testing Tasks:
        ◦ Task 5.5.12: Write Unit Tests 
            ▪ Subtask 5.5.12.1: Unit tests for frontend refund amount calculation and validation. 
            ▪ Subtask 5.5.12.2: Unit tests for backend max refundable amount calculation. 
            ▪ Subtask 5.5.12.3: Unit tests for refund initiation (mocking Stripe API). 
            ▪ Subtask 5.5.12.4: Unit tests for stock increment on refund. 
        ◦ Task 5.5.13: Write Integration Tests 
            ▪ Subtask 5.5.13.1: Place a full order. Log in as admin. Issue a full refund. Verify order refundStatus, totalRefundedAmount, refundHistory and stockQuantity in DB. Mock Stripe refund success. 
            ▪ Subtask 5.5.13.2: Place another order. Issue a partial refund (e.g., refund 1 out of 2 items). Verify refundStatus (partial), totalRefundedAmount and stockQuantity for only the refunded item. 
            ▪ Subtask 5.5.13.3: Attempt to refund more than available (expect error). 
            ▪ Subtask 5.5.13.4: Test refunding an order that wasn't paid or already fully refunded (expect error). 
            ▪ Subtask 5.5.13.5: Test unauthorized access. 
        ◦ Task 5.5.14: Manual End-to-End Testing 
            ▪ Subtask 5.5.14.1: Place a test order (e.g., 3 units of Product A, 2 units of Product B). Note initial stock. 
            ▪ Subtask 5.5.14.2: Log in as admin, navigate to the order details. 
            ▪ Subtask 5.5.14.3: Click "Issue Refund." Select to refund 1 unit of Product A. Provide reason. Confirm. 
            ▪ Subtask 5.5.14.4: Verify UI updates (refunded amount, refund history). 
            ▪ Subtask 5.5.14.5: Check Product A's stock; it should be initial + 1. 
            ▪ Subtask 5.5.14.6: Verify refund confirmation email is received. 
            ▪ Subtask 5.5.14.7: Attempt to issue another refund to reach full amount for remaining items. Verify refundStatus becomes "fully_refunded". 
            ▪ Subtask 5.5.14.8: Try to refund a non-refundable amount (e.g., already fully refunded order) to confirm validation.
Epic: Admin Order Management
Story 5.6: Manage Return Requests (Admin)
Story: As an administrator, I want to be able to view, approve, reject, and track customer return requests so that I can efficiently process returns and issue refunds.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Manage Returns" section/link is available in the Admin Dashboard navigation. 
    2. The "Manage Returns" page displays a list of all return requests. 
    3. For each return request, the following information is displayed: 
        ◦ Return Request ID 
        ◦ Customer Name 
        ◦ Request Date 
        ◦ Order Number 
        ◦ Status (e.g., "Pending Review," "Approved," "Rejected," "Received," "Refunded," "Closed") 
    4. Admins can filter return requests by status, customer, and date range. 
    5. Admins can sort return requests by date. 
    6. Clicking a return request allows the admin to view its full details (similar to customer Return Details in Story 4.5), including: 
        ◦ Return Request ID 
        ◦ Request Date 
        ◦ Status 
        ◦ List of returned items with quantities and reasons 
        ◦ Customer comments 
        ◦ (Optional) Uploaded images from the customer 
    7. The admin can change the status of a return request (e.g., "Approve," "Reject," "Received"). 
    8. If a return is "Approved," the admin can optionally initiate a refund (linking to Story 5.5). 
    9. If a return is "Rejected," the admin must provide a reason for the rejection, which is communicated to the customer. 
    10. The system tracks the history of each return request (status changes, admin actions). 
    11. Email notifications are sent to the customer for significant status changes (e.g., "Approved," "Rejected"). 

Granular Tasks & Subtasks for Story 5.6:
    • Frontend Tasks (Admin Panel):
        ◦ Task 5.6.1: Implement "Manage Returns" Page UI 
            ▪ Subtask 5.6.1.1: Create AdminReturnsListPage component/route (e.g., /admin/returns). 
            ▪ Subtask 5.6.1.2: Add a navigation link for "Manage Returns" in the Admin Dashboard sidebar/menu. 
            ▪ Subtask 5.6.1.3: Design and implement a paginated list of return requests with summary information (ID, Customer, Date, Order Number, Status). 
            ▪ Subtask 5.6.1.4: Implement filtering and sorting UI (similar to AdminOrdersListPage). 
            ▪ Subtask 5.6.1.5: Add links to view details of each return request. 
        ◦ Task 5.6.2: Implement "Return Request Details" Page UI (Admin) 
            ▪ Subtask 5.6.2.1: Create AdminReturnDetailsPage component/route (e.g., /admin/returns/:returnRequestId). 
            ▪ Subtask 5.6.2.2: Display all details of the return request (from backend). 
            ▪ Subtask 5.6.2.3: Include a section for changing the return status. 
            ▪ Subtask 5.6.2.4: If "Approved," provide a link/button to "Issue Refund" (using the UI from Story 5.5). 
            ▪ Subtask 5.6.2.5: If "Rejected," require a reason input. 
            ▪ Subtask 5.6.2.6: Display a history log of status changes and admin actions. 
        ◦ Task 5.6.3: Frontend API Integration: Fetch Return Requests (List) 
            ▪ Subtask 5.6.3.1: Create service/hook to call GET /api/admin/returns. 
            ▪ Subtask 5.6.3.2: Handle pagination, filtering, and sorting parameters. 
        ◦ Task 5.6.4: Frontend API Integration: Fetch Return Request Details 
            ▪ Subtask 5.6.4.1: Create service/hook to call GET /api/admin/returns/:returnRequestId. 
        ◦ Task 5.6.5: Frontend API Integration: Update Return Status 
            ▪ Subtask 5.6.5.1: Create service/hook to call PUT /api/admin/returns/:returnRequestId/status. 
            ▪ Subtask 5.6.5.2: Send the newStatus (and rejectionReason if applicable) in the body. 
    • Backend Tasks (Admin API):
        ◦ Task 5.6.6: Create Get Return Requests API Endpoint (List) 
            ▪ Subtask 5.6.6.1: Design and implement GET /api/admin/returns. 
            ▪ Subtask 5.6.6.2: Apply admin authentication. 
            ▪ Subtask 5.6.6.3: Implement pagination, filtering (by status, customer, date), and sorting. 
            ▪ Subtask 5.6.6.4: Return a list of return requests with summary details. 
        ◦ Task 5.6.7: Create Get Return Request Details API Endpoint 
            ▪ Subtask 5.6.7.1: Design and implement GET /api/admin/returns/:returnRequestId. 
            ▪ Subtask 5.6.7.2: Apply admin authentication. 
            ▪ Subtask 5.6.7.3: Fetch the full ReturnRequest document. 
            ▪ Subtask 5.6.7.4: Populate nested data: orderId, customerId (to get customer name). 
            ▪ Subtask 5.6.7.5: Return all details. 
        ◦ Task 5.6.8: Create Update Return Status API Endpoint 
            ▪ Subtask 5.6.8.1: Design and implement PUT /api/admin/returns/:returnRequestId/status. 
            ▪ Subtask 5.6.8.2: Apply admin authentication. 
            ▪ Subtask 5.6.8.3: Validate returnRequestId and newStatus. 
            ▪ Subtask 5.6.8.4: If newStatus is "Rejected," ensure rejectionReason is provided. 
            ▪ Subtask 5.6.8.5: Update the ReturnRequest document's status. 
            ▪ Subtask 5.6.8.6: If newStatus is "Approved," optionally link to the "Issue Refund" logic from Story 5.5 (or trigger refund automatically if configured). 
            ▪ Subtask 5.6.8.7: Add an entry to a returnHistory array in the ReturnRequest document, logging the status change and admin user. 
            ▪ Subtask 5.6.8.8: Trigger email notifications for "Approved" or "Rejected" status changes. 
        ◦ Task 5.6.9: Email Service Integration (Return Status Notifications) 
            ▪ Subtask 5.6.9.1: Create email templates for "Return Approved" and "Return Rejected". 
            ▪ Subtask 5.6.9.2: Include relevant details in the email (return ID, items, reason for rejection if applicable). 
            ▪ Subtask 5.6.9.3: Implement functions to send these emails. 
    • Security & Data Integrity Tasks:
        ◦ Task 5.6.10: Secure Access and Input Validation 
            ▪ Subtask 5.6.10.1: Ensure only authenticated admins can access and modify return requests. 
            ▪ Subtask 5.6.10.2: Validate all input data (status, rejection reason) on the server side. 
    • Testing Tasks:
        ◦ Task 5.6.11: Write Unit Tests 
            ▪ Subtask 5.6.11.1: Unit tests for frontend logic related to return status updates. 
            ▪ Subtask 5.6.11.2: Unit tests for backend return request retrieval and status update logic. 
        ◦ Task 5.6.12: Write Integration Tests 
            ▪ Subtask 5.6.12.1: Create a return request (manually or via the customer flow). 
            ▪ Subtask 5.6.12.2: As admin, view the list of returns and verify the created request is present. 
            ▪ Subtask 5.6.12.3: View the details of the return request. 
            ▪ Subtask 5.6.12.4: Change the status to "Approved". Verify the status change and the link to initiate a refund. 
            ▪ Subtask 5.6.12.5: Change the status to "Rejected" with a reason. Verify the status change and the rejection reason. Mock email sending. 
            ▪ Subtask 5.6.12.6: Test unauthorized access. 
        ◦ Task 5.6.13: Manual End-to-End Testing 
            ▪ Subtask 5.6.13.1: Create a return request. 
            ▪ Subtask 5.6.13.2: Log in as admin, navigate to "Manage Returns". 
            ▪ Subtask 5.6.13.3: Verify the return request is listed. 
            ▪ Subtask 5.6.13.4: View the details. 
            ▪ Subtask 5.6.13.5: Change the status to "Approved". Verify UI updates and the "Issue Refund" link. 
            ▪ Subtask 5.6.13.6: Change the status to "Rejected" and provide a reason. Verify the UI updates and the rejection reason is displayed. Verify email received by customer.
Epic: Admin Order Management
Story 5.7: Manage Products (List, Search, Filter)
Story: As an administrator, I want to view a paginated list of all products, with options to search and filter them, so that I can efficiently locate specific products for review or modification.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Manage Products" link is available in the Admin Dashboard navigation. 
    2. Clicking "Manage Products" navigates the admin to a product list page. 
    3. The page displays a paginated list of all products in the system. 
    4. For each product, the following key details are displayed: 
        ◦ Product Name 
        ◦ SKU (Stock Keeping Unit) 
        ◦ Price 
        ◦ Current Stock Quantity 
        ◦ Status (e.g., "Active," "Draft," "Archived," "Out of Stock") 
        ◦ Main Image Thumbnail 
    5. Admins can search for products by: 
        ◦ Product Name 
        ◦ SKU 
    6. Admins can filter products by: 
        ◦ Category 
        ◦ Status (e.g., "Active," "Draft," "Out of Stock") 
        ◦ Price Range 
        ◦ Stock Level (e.g., "In Stock," "Low Stock," "Out of Stock") 
    7. Admins can sort products by: 
        ◦ Product Name (A-Z) 
        ◦ Price 
        ◦ Stock Quantity 
    8. A "View Details" or "Edit" button/link is available for each product to navigate to its full details (this will be addressed in Story 5.8). 
    9. All data retrieval is performed securely with admin-level authentication. 

Granular Tasks & Subtasks for Story 5.7:
    • Frontend Tasks (Admin Panel):
        ◦ Task 5.7.1: Implement "Manage Products" Page UI 
            ▪ Subtask 5.7.1.1: Create AdminProductsListPage component/route (e.g., /admin/products). 
            ▪ Subtask 5.7.1.2: Add a navigation link for "Manage Products" in the Admin Dashboard sidebar/menu. 
            ▪ Subtask 5.7.1.3: Design and implement a responsive table or grid layout to display product summaries. 
            ▪ Subtask 5.7.1.4: Include columns/fields for Product Name, SKU, Price, Stock Quantity, Status, Main Image Thumbnail. 
            ▪ Subtask 5.7.1.5: Add an "Edit" or "View Details" button/link for each product row. 
        ◦ Task 5.7.2: Implement Pagination UI for Products 
            ▪ Subtask 5.7.2.1: Reuse/adapt existing Pagination component. 
            ▪ Subtask 5.7.2.2: Integrate pagination controls with the product list. 
        ◦ Task 5.7.3: Implement Search UI 
            ▪ Subtask 5.7.3.1: Add a search bar for Product Name and SKU. 
        ◦ Task 5.7.4: Implement Filtering UI 
            ▪ Subtask 5.7.4.1: Add dropdowns/selects for filtering by Category and Status. 
            ▪ Subtask 5.7.4.2: Implement input fields or sliders for Price Range filtering. 
            ▪ Subtask 5.7.4.3: Add dropdowns/checkboxes for Stock Level filtering (e.g., "In Stock," "Out of Stock," "Low Stock" with a configurable threshold). 
            ▪ Subtask 5.7.4.4: Include "Apply Filters" and "Clear Filters" buttons. 
        ◦ Task 5.7.5: Implement Sorting UI 
            ▪ Subtask 5.7.5.1: Make table headers clickable for sorting (Product Name, Price, Stock Quantity). 
            ▪ Subtask 5.7.5.2: Indicate current sort direction (ascending/descending). 
        ◦ Task 5.7.6: Frontend API Integration: Fetch All Products (with Filters/Search/Sorting) 
            ▪ Subtask 5.7.6.1: Create service/hook to call GET /api/admin/products. 
            ▪ Subtask 5.7.6.2: Pass pagination parameters (page, limit), search query (searchQuery), filtering parameters (category, status, minPrice, maxPrice, stockStatus), and sorting parameters (sortBy, sortOrder). 
            ▪ Subtask 5.7.6.3: Display fetched product data in the table/grid. 
            ▪ Subtask 5.7.6.4: Handle loading states and display "No products found" message. 
    • Backend Tasks (Admin API):
        ◦ Task 5.7.7: Create Get All Products API Endpoint (for Admin) 
            ▪ Subtask 5.7.7.1: Design and implement GET /api/admin/products. 
            ▪ Subtask 5.7.7.2: Apply admin authentication middleware (from Story 5.1). 
            ▪ Subtask 5.7.7.3: Implement logic to query the Product collection for all products. 
            ▪ Subtask 5.7.7.4: Implement pagination (skip/limit) on the query. 
            ▪ Subtask 5.7.7.5: Implement search logic (e.g., $regex for name and sku). 
            ▪ Subtask 5.7.7.6: Implement filtering logic based on: 
                • category (e.g., $match { category: '...' }) 
                • status (e.g., $match { status: '...' }) 
                • minPrice, maxPrice (e.g., $match { price: { $gte: ..., $lte: ... } }) 
                • stockStatus (e.g., $match { stockQuantity: { $gt: 0 } } for "In Stock", $match { stockQuantity: 0 } for "Out of Stock", custom logic for "Low Stock" threshold). 
            ▪ Subtask 5.7.7.7: Implement sorting logic based on name, price, stockQuantity. 
            ▪ Subtask 5.7.7.8: Return the paginated list of products and total count. 
        ◦ Task 5.7.8: Optimize Database Indexes 
            ▪ Subtask 5.7.8.1: Ensure appropriate indexes exist on Product fields for filtering, searching, and sorting (e.g., name, sku, category, status, price, stockQuantity). 
    • Security Tasks:
        ◦ Task 5.7.9: Secure Data Retrieval 
            ▪ Subtask 5.7.9.1: Ensure only authenticated admins can access this product list endpoint. 
    • Testing Tasks:
        ◦ Task 5.7.10: Write Unit Tests 
            ▪ Subtask 5.7.10.1: Unit tests for frontend filter/sort state management. 
            ▪ Subtask 5.7.10.2: Unit tests for backend product querying logic (pagination, filtering, searching, sorting with mock DB). 
        ◦ Task 5.7.11: Write Integration Tests 
            ▪ Subtask 5.7.11.1: Log in as admin, then call GET /api/admin/products. Verify list of products is returned. 
            ▪ Subtask 5.7.11.2: Test with page and limit parameters to verify pagination. 
            ▪ Subtask 5.7.11.3: Test searching by name and sku. 
            ▪ Subtask 5.7.11.4: Test filtering by category, status, price range, and stockStatus. 
            ▪ Subtask 5.7.11.5: Test sorting by name, price, and stockQuantity (ASC/DESC). 
            ▪ Subtask 5.7.11.6: Test unauthorized access to this endpoint. 
        ◦ Task 5.7.12: Manual End-to-End Testing 
            ▪ Subtask 5.7.12.1: Log in to the admin panel. 
            ▪ Subtask 5.7.12.2: Navigate to "Manage Products." 
            ▪ Subtask 5.7.12.3: Verify all products are listed with correct summary details. 
            ▪ Subtask 5.7.12.4: Test pagination controls. 
            ▪ Subtask 5.7.12.5: Use the search bar for product names and SKUs. 
            ▪ Subtask 5.7.12.6: Apply various filters (by category, status, price range, stock level) and verify results. 
            ▪ Subtask 5.7.12.7: Test sorting by clicking on column headers. 
            ▪ Subtask 5.7.12.8: Ensure "Edit" or "View Details" links are present (though actual editing will be in Story 5.8).
Epic: Admin Order Management
Story 5.8: Add/Edit Product (Admin)
Story: As an administrator, I want to be able to add new products and edit existing product details, including images, descriptions, pricing, inventory, and categories, so that I can maintain an accurate and up-to-date product catalog.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. From the "Manage Products" list (Story 5.7), an "Add New Product" button is available. 
    2. Clicking "Edit" on an existing product (from Story 5.7) navigates to an edit form pre-populated with its details. 
    3. The "Add/Edit Product" form allows the admin to input/modify the following product attributes: 
        ◦ Basic Info: Product Name (required), SKU (required, unique), Short Description, Long Description. 
        ◦ Pricing: Price (required, numeric), Sale Price (optional), Tax Class (dropdown). 
        ◦ Inventory: Stock Quantity (required, numeric), Low Stock Threshold (optional), Availability Status (In Stock, Out of Stock, Pre-Order). 
        ◦ Categorization: Category (dropdown, multi-select allowed), Tags (multi-select/text input). 
        ◦ Media: Main Product Image (upload), Additional Images (upload, multiple allowed). 
        ◦ Visibility: Product Status (e.g., "Active," "Draft," "Archived"). 
        ◦ (Optional, advanced for later) Product Variants (e.g., Size, Color with unique SKU/Stock/Price). 
    4. All required fields are validated client-side and server-side. 
    5. Image uploads are handled securely (resizing, storage). 
    6. Upon successful save (add or edit), the admin is redirected back to the "Manage Products" list, and the changes are immediately reflected. 
    7. Appropriate success/error messages are displayed. 
    8. All product creation/modification operations are securely logged with an audit trail (who changed, when). 

Granular Tasks & Subtasks for Story 5.8:
    • Frontend Tasks (Admin Panel):
        ◦ Task 5.8.1: Implement "Add New Product" Button & Routing 
            ▪ Subtask 5.8.1.1: Add an "Add New Product" button on the AdminProductsListPage (Story 5.7). 
            ▪ Subtask 5.8.1.2: Configure routing for /admin/products/new (for new product) and /admin/products/edit/:productId (for editing). 
        ◦ Task 5.8.2: Design & Implement "Product Form" UI 
            ▪ Subtask 5.8.2.1: Create AdminProductFormPage component. 
            ▪ Subtask 5.8.2.2: Structure the form into logical sections (e.g., Basic Info, Pricing, Inventory, Media, Categories & Tags). 
            ▪ Subtask 5.8.2.3: Implement input fields for: 
                • Product Name (text) 
                • SKU (text) 
                • Short Description (textarea) 
                • Long Description (rich text editor, or another textarea for MVP) 
                • Price (number input) 
                • Sale Price (number input) 
                • Tax Class (dropdown/select, potentially fetching from backend if defined) 
                • Stock Quantity (number input) 
                • Low Stock Threshold (number input) 
                • Availability Status (radio buttons/dropdown: In Stock, Out of Stock, Pre-Order) 
                • Category (multi-select/checkboxes, populated from backend categories) 
                • Tags (multi-select or text input with comma separation) 
                • Product Status (radio buttons/dropdown: Active, Draft, Archived) 
            ▪ Subtask 5.8.2.4: Implement file upload components for Main Product Image and Additional Images (with preview). 
            ▪ Subtask 5.8.2.5: Add "Save" and "Cancel" buttons. 
        ◦ Task 5.8.3: Implement Form Data Pre-population (for Edit Mode) 
            ▪ Subtask 5.8.3.1: If productId exists in the route params, fetch existing product data using GET /api/admin/products/:productId. 
            ▪ Subtask 5.8.3.2: Populate all form fields with fetched data. 
        ◦ Task 5.8.4: Implement Client-Side Form Validation 
            ▪ Subtask 5.8.4.1: Validate required fields (Name, SKU, Price, Stock Quantity). 
            ▪ Subtask 5.8.4.2: Validate numeric inputs (Price, Stock) and ensure positive values where appropriate. 
            ▪ Subtask 5.8.4.3: Validate SKU uniqueness (could be a debounced API call or on submission). 
            ▪ Subtask 5.8.4.4: Provide real-time error messages. 
        ◦ Task 5.8.5: Frontend API Integration: Submit Product Data 
            ▪ Subtask 5.8.5.1: Create service/hook to call POST /api/admin/products for new products. 
            ▪ Subtask 5.8.5.2: Create service/hook to call PUT /api/admin/products/:productId for editing. 
            ▪ Subtask 5.8.5.3: Use FormData for requests involving file uploads. 
            ▪ Subtask 5.8.5.4: On successful submission, redirect to AdminProductsListPage (Story 5.7) and display a success notification. 
            ▪ Subtask 5.8.5.5: Handle error responses (e.g., validation errors, unique SKU violation, server errors). 
    • Backend Tasks (Admin API):
        ◦ Task 5.8.6: Create Add Product API Endpoint 
            ▪ Subtask 5.8.6.1: Design and implement POST /api/admin/products. 
            ▪ Subtask 5.8.6.2: Apply admin authentication middleware. 
            ▪ Subtask 5.8.6.3: Implement server-side validation for all product fields (required, data types, ranges). 
            ▪ Subtask 5.8.6.4: Validate SKU uniqueness before creating a new product. 
            ▪ Subtask 5.8.6.5: Handle image uploads: 
                • Receive image files. 
                • Process images (resize, optimize). 
                • Store images securely (e.g., to AWS S3, Google Cloud Storage, or local file system if suitable for MVP). 
                • Save image URLs to the Product document. 
            ▪ Subtask 5.8.6.6: Create new Product document in MongoDB. 
            ▪ Subtask 5.8.6.7: Return the newly created product details. 
        ◦ Task 5.8.7: Create Edit Product API Endpoint 
            ▪ Subtask 5.8.7.1: Design and implement PUT /api/admin/products/:productId. 
            ▪ Subtask 5.8.7.2: Apply admin authentication middleware. 
            ▪ Subtask 5.8.7.3: Validate productId and ensure the product exists. 
            ▪ Subtask 5.8.7.4: Implement server-side validation for all fields. 
            ▪ Subtask 5.8.7.5: Handle image updates (new uploads, deletion of old images). 
            ▪ Subtask 5.8.7.6: Update existing Product document in MongoDB. 
            ▪ Subtask 5.8.7.7: Audit Logging: Record which admin user made the changes, what changes were made, and when. 
            ▪ Subtask 5.8.7.8: Return the updated product details. 
        ◦ Task 5.8.8: Create Get Single Product Details API Endpoint (for Admin Edit) 
            ▪ Subtask 5.8.8.1: Design and implement GET /api/admin/products/:productId. 
            ▪ Subtask 5.8.8.2: Apply admin authentication middleware. 
            ▪ Subtask 5.8.8.3: Fetch Product document by _id. 
            ▪ Subtask 5.8.8.4: Return full product details. 
        ◦ Task 5.8.9: Image Upload & Storage Integration (Backend) 
            ▪ Subtask 5.8.9.1: Set up image processing library (e.g., Sharp for Node.js) for resizing/optimization. 
            ▪ Subtask 5.8.9.2: Integrate with cloud storage service (S3/GCS) or configure local storage for images. 
            ▪ Subtask 5.8.9.3: Implement logic for deleting old images when new ones are uploaded/removed. 
    • Security & Data Integrity Tasks:
        ◦ Task 5.8.10: Input Sanitization & Validation 
            ▪ Subtask 5.8.10.1: Sanitize all text inputs to prevent XSS. 
            ▪ Subtask 5.8.10.2: Enforce data types and constraints on all fields. 
        ◦ Task 5.8.11: File Upload Security 
            ▪ Subtask 5.8.11.1: Validate file types (only images), file sizes, and potentially scan for malicious content. 
    • Testing Tasks:
        ◦ Task 5.8.12: Write Unit Tests 
            ▪ Subtask 5.8.12.1: Unit tests for frontend form validation. 
            ▪ Subtask 5.8.12.2: Unit tests for backend product creation/update logic, including SKU uniqueness and data validation. 
            ▪ Subtask 5.8.12.3: Unit tests for image processing and storage integration (mocking external services). 
        ◦ Task 5.8.13: Write Integration Tests 
            ▪ Subtask 5.8.13.1: Log in as admin. Test POST /api/admin/products with valid data (including image upload). Verify product creation. 
            ▪ Subtask 5.8.13.2: Test POST /api/admin/products with invalid data (missing required fields, invalid price, non-unique SKU). Expect errors. 
            ▪ Subtask 5.8.13.3: Fetch an existing product via GET /api/admin/products/:productId. 
            ▪ Subtask 5.8.13.4: Test PUT /api/admin/products/:productId with valid updates (text fields, image replacement, image deletion). Verify changes reflected. 
            ▪ Subtask 5.8.13.5: Test PUT /api/admin/products/:productId with invalid updates. Expect errors. 
            ▪ Subtask 5.8.13.6: Test unauthorized access to these endpoints. 
        ◦ Task 5.8.14: Manual End-to-End Testing 
            ▪ Subtask 5.8.14.1: Log in to admin. Navigate to "Manage Products." 
            ▪ Subtask 5.8.14.2: Click "Add New Product." Fill out form with various data types, upload images. Test client-side validation. Submit. Verify product appears in the list. 
            ▪ Subtask 5.8.14.3: Edit the newly created product. Change details, replace/add/remove images. Submit. Verify changes. 
            ▪ Subtask 5.8.14.4: Edit an existing product. 
            ▪ Subtask 5.8.14.5: Try to create a product with an existing SKU. 
            ▪ Subtask 5.8.14.6: Verify product images are correctly displayed on the storefront (once integrated).
Epic: Admin Order Management
Story 5.9: Manage Product Categories (Admin)
Story: As an administrator, I want to be able to add, edit, and delete product categories, and manage their hierarchy, so that I can effectively organize the product catalog for customers.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Manage Categories" link is available in the Admin Dashboard navigation (possibly under "Manage Products" submenu). 
    2. The "Manage Categories" page displays a list of all existing product categories, potentially with their hierarchy (parent/child relationships). 
    3. For each category, the following details are displayed: 
        ◦ Category Name 
        ◦ Slug (URL friendly identifier) 
        ◦ Parent Category (if applicable) 
        ◦ Number of Products in Category (optional, for insights) 
    4. Admins can add a new category by providing a name, slug, and optionally assigning a parent category. 
    5. Admins can edit an existing category's name, slug, and parent category. 
    6. Admins can delete a category. If a category has associated products or child categories, a warning is displayed, and deletion might be prevented or require reassigning products/children. 
    7. All category names and slugs must be unique (slug unique across entire system). 
    8. Changes are immediately reflected in the product creation/editing forms and on the storefront. 
    9. All category management operations are performed securely with admin-level authentication. 

Granular Tasks & Subtasks for Story 5.9:
    • Frontend Tasks (Admin Panel):
        ◦ Task 5.9.1: Implement "Manage Categories" Page UI 
            ▪ Subtask 5.9.1.1: Create AdminCategoriesListPage component/route (e.g., /admin/categories). 
            ▪ Subtask 5.9.1.2: Add a navigation link for "Manage Categories" in the Admin Dashboard sidebar/menu (potentially nested under "Products"). 
            ▪ Subtask 5.9.1.3: Design and implement a table or tree-like structure to display categories. 
            ▪ Subtask 5.9.1.4: Include columns for Category Name, Slug, Parent Category, and "Edit" / "Delete" buttons. 
            ▪ Subtask 5.9.1.5: Add an "Add New Category" button. 
        ◦ Task 5.9.2: Implement "Add/Edit Category" Form Modal/Page 
            ▪ Subtask 5.9.2.1: Create a reusable form component (e.g., CategoryForm) that can be used in a modal or dedicated page. 
            ▪ Subtask 5.9.2.2: Include input fields for: 
                • Category Name (text, required) 
                • Category Slug (text, automatically generated from name but editable, required) 
                • Parent Category (dropdown/select, populated with existing categories, allowing "None" for top-level). 
            ▪ Subtask 5.9.2.3: Implement client-side validation for required fields, format (slug), and uniqueness (debounced API call for slug validation). 
            ▪ Subtask 5.9.2.4: For "Edit" mode, pre-populate form fields with existing category data. 
            ▪ Subtask 5.9.2.5: Add "Save" and "Cancel" buttons. 
        ◦ Task 5.9.3: Implement Category Deletion Confirmation 
            ▪ Subtask 5.9.3.1: On clicking "Delete," display a confirmation modal with a warning about associated products/child categories. 
            ▪ Subtask 5.9.3.2: If deletion is prevented, provide a clear message. 
        ◦ Task 5.9.4: Frontend API Integration: Fetch Categories 
            ▪ Subtask 5.9.4.1: Create service/hook to call GET /api/admin/categories to fetch all categories for listing and parent dropdowns. 
        ◦ Task 5.9.5: Frontend API Integration: Add/Edit Category 
            ▪ Subtask 5.9.5.1: Create service/hook to call POST /api/admin/categories for new categories. 
            ▪ Subtask 5.9.5.2: Create service/hook to call PUT /api/admin/categories/:categoryId for editing. 
            ▪ Subtask 5.9.5.3: On successful submission, refresh the category list and display a success notification. 
            ▪ Subtask 5.9.5.4: Handle error responses (e.g., validation errors, unique slug violation). 
        ◦ Task 5.9.6: Frontend API Integration: Delete Category 
            ▪ Subtask 5.9.6.1: Create service/hook to call DELETE /api/admin/categories/:categoryId. 
            ▪ Subtask 5.9.6.2: On successful deletion, remove from list and display success. Handle errors if deletion is prevented. 
    • Backend Tasks (Admin API):
        ◦ Task 5.9.7: Design Category Data Model 
            ▪ Subtask 5.9.7.1: Define MongoDB schema for Category collection. Include _id, name, slug (unique index), parentId (references Category _id, optional), description (optional). 
        ◦ Task 5.9.8: Create Get All Categories API Endpoint 
            ▪ Subtask 5.9.8.1: Design and implement GET /api/admin/categories. 
            ▪ Subtask 5.9.8.2: Apply admin authentication middleware. 
            ▪ Subtask 5.9.8.3: Fetch all categories. Potentially return them in a hierarchical structure or flat list with parentId. 
        ◦ Task 5.9.9: Create Add Category API Endpoint 
            ▪ Subtask 5.9.9.1: Design and implement POST /api/admin/categories. 
            ▪ Subtask 5.9.9.2: Apply admin authentication. 
            ▪ Subtask 5.9.9.3: Implement server-side validation for name, slug (required, uniqueness), parentId (must refer to existing category, prevent self-referencing loops if implementing complex hierarchies). 
            ▪ Subtask 5.9.9.4: Generate slug from name if not provided, ensure uniqueness. 
            ▪ Subtask 5.9.9.5: Create new Category document. 
        ◦ Task 5.9.10: Create Edit Category API Endpoint 
            ▪ Subtask 5.9.10.1: Design and implement PUT /api/admin/categories/:categoryId. 
            ▪ Subtask 5.9.10.2: Apply admin authentication. 
            ▪ Subtask 5.9.10.3: Validate categoryId and ensure category exists. 
            ▪ Subtask 5.9.10.4: Implement server-side validation for updated name, slug, parentId. Ensure unique slug. 
            ▪ Subtask 5.9.10.5: Prevent a category from becoming its own descendant (parent/child loop detection). 
            ▪ Subtask 5.9.10.6: Update existing Category document. 
            ▪ Subtask 5.9.10.7: Audit Logging: Record changes. 
        ◦ Task 5.9.11: Create Delete Category API Endpoint 
            ▪ Subtask 5.9.11.1: Design and implement DELETE /api/admin/categories/:categoryId. 
            ▪ Subtask 5.9.11.2: Apply admin authentication. 
            ▪ Subtask 5.9.11.3: Implement pre-deletion checks: 
                • Check if any products are assigned to this category. If so, prevent deletion or require reassigning products to a default/other category. 
                • Check if any other categories use this as their parentId. If so, prevent deletion or require re-parenting child categories. 
            ▪ Subtask 5.9.11.4: If checks pass, delete the Category document. 
    • Security & Data Integrity Tasks:
        ◦ Task 5.9.12: Strict Validation & Authorization 
            ▪ Subtask 5.9.12.1: Ensure all category management operations are restricted to authenticated admins. 
            ▪ Subtask 5.9.12.2: Robust server-side validation to prevent data corruption (e.g., duplicate slugs, invalid parent IDs, circular dependencies). 
    • Testing Tasks:
        ◦ Task 5.9.13: Write Unit Tests 
            ▪ Subtask 5.9.13.1: Unit tests for frontend form validation and slug generation. 
            ▪ Subtask 5.9.13.2: Unit tests for backend category creation/update logic, including uniqueness and hierarchical validation. 
            ▪ Subtask 5.9.13.3: Unit tests for pre-deletion checks. 
        ◦ Task 5.9.14: Write Integration Tests 
            ▪ Subtask 5.9.14.1: Log in as admin. Test POST /api/admin/categories with valid data. Verify category creation. 
            ▪ Subtask 5.9.14.2: Test POST /api/admin/categories with duplicate name/slug, or invalid parentId. Expect errors. 
            ▪ Subtask 5.9.14.3: Test PUT /api/admin/categories/:categoryId with valid updates. Verify changes. 
            ▪ Subtask 5.9.14.4: Test PUT to create circular dependency (e.g., A -> B, then B -> A). Expect error. 
            ▪ Subtask 5.9.14.5: Test DELETE /api/admin/categories/:categoryId for a category with no dependencies. Verify deletion. 
            ▪ Subtask 5.9.14.6: Test DELETE for a category with associated products/children. Expect error or specific behavior (e.g., reassign). 
            ▪ Subtask 5.9.14.7: Test unauthorized access. 
        ◦ Task 5.9.15: Manual End-to-End Testing 
            ▪ Subtask 5.9.15.1: Log in to admin. Navigate to "Manage Categories." 
            ▪ Subtask 5.9.15.2: Add a new top-level category. Verify it appears. 
            ▪ Subtask 5.9.15.3: Add a child category, assigning the first as its parent. Verify hierarchy. 
            ▪ Subtask 5.9.15.4: Edit a category's name and slug. Verify updates. 
            ▪ Subtask 5.9.15.5: Try to delete a category that has products assigned to it (create a dummy product for this). Verify warning/prevention. 
            ▪ Subtask 5.9.15.6: Delete a category with no dependencies. Verify removal. 
            ▪ Subtask 5.9.15.7: Verify the new/updated categories are available in the product AdminProductFormPage dropdown.
Epic: Admin Order Management
Story 5.10: Delete Product (Admin)
Story: As an administrator, I want to be able to delete products from the catalog so that I can remove discontinued or erroneous product listings.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. On the "Manage Products" list (Story 5.7) and the "Edit Product" page (Story 5.8), a "Delete Product" button is available. 
    2. Clicking "Delete Product" prompts the admin with a confirmation dialog. 
    3. The confirmation dialog explains the implications of deletion (e.g., soft vs. hard delete, impact on past orders). 
    4. Soft Delete (Recommended for MVP): 
        ◦ The product is marked as "Archived" or "Inactive" in the database. 
        ◦ It no longer appears on the storefront or in standard admin product lists. 
        ◦ It remains linked to past orders for historical accuracy. 
        ◦ Option to permanently delete (hard delete) could be a separate, highly restricted function for later. 
    5. Upon successful deletion (soft delete), the product is removed from the active product list. 
    6. Associated product images are retained (for soft delete) or removed from storage (for hard delete). 
    7. Appropriate success/error messages are displayed. 
    8. All product deletion operations are securely logged with an audit trail (who deleted, when). 

Granular Tasks & Subtasks for Story 5.10:
    • Frontend Tasks (Admin Panel):
        ◦ Task 5.10.1: Implement "Delete Product" Button UI 
            ▪ Subtask 5.10.1.1: Add a "Delete Product" button to each row in the AdminProductsListPage (Story 5.7). 
            ▪ Subtask 5.10.1.2: Add a "Delete Product" button on the AdminProductFormPage (Story 5.8) when in edit mode. 
        ◦ Task 5.10.2: Implement Delete Confirmation Modal 
            ▪ Subtask 5.10.2.1: On clicking "Delete Product," display a confirmation modal. 
            ▪ Subtask 5.10.2.2: Include warning text explaining "soft delete" behavior (e.g., "This will archive the product, removing it from the storefront but keeping it for historical order data."). 
            ▪ Subtask 5.10.2.3: Add "Confirm Delete" and "Cancel" buttons. 
        ◦ Task 5.10.3: Frontend API Integration: Delete Product 
            ▪ Subtask 5.10.3.1: Create service/hook to call PUT /api/admin/products/:productId/status (to change status to "Archived") or DELETE /api/admin/products/:productId (if a specific "delete" endpoint is preferred for soft delete). 
            ▪ Subtask 5.10.3.2: On successful response, remove the product from the current list/redirect to the product list and display a success notification. 
            ▪ Subtask 5.10.3.3: Handle error responses gracefully. 
    • Backend Tasks (Admin API):
        ◦ Task 5.10.4: Update Product Model for Soft Delete 
            ▪ Subtask 5.10.4.1: Ensure the Product schema has a status field (from Story 5.8) that can be set to "Archived" or "Inactive." If not, add it. 
            ▪ Subtask 5.10.4.2: Modify GET /api/admin/products (Story 5.7) to exclude "Archived" products by default, but allow filtering to show archived products. 
        ◦ Task 5.10.5: Create Delete Product API Endpoint (Soft Delete) 
            ▪ Subtask 5.10.5.1: Design and implement PUT /api/admin/products/:productId/status (or DELETE /api/admin/products/:productId if preferred, but internally it would update the status). 
            ▪ Subtask 5.10.5.2: Apply admin authentication middleware. 
            ▪ Subtask 5.10.5.3: Validate productId and ensure the product exists. 
            ▪ Subtask 5.10.5.4: Update the status field of the Product document to "Archived" (or "Inactive"). 
            ▪ Subtask 5.10.5.5: Audit Logging: Record which admin user deleted the product and when. 
            ▪ Subtask 5.10.5.6: Return success response. 
        ◦ Task 5.10.6: (Optional) Hard Delete Endpoint (for future, very restricted) 
            ▪ Subtask 5.10.6.1: If hard delete is planned, design a separate, highly permission-restricted endpoint. 
            ▪ Subtask 5.10.6.2: Implement logic to truly remove the product document and associated images from storage. 
            ▪ Subtask 5.10.6.3: Consider implications for historical order data before implementing. 
    • Security & Data Integrity Tasks:
        ◦ Task 5.10.7: Authorization and Validation 
            ▪ Subtask 5.10.7.1: Ensure only authorized admins can perform product deletion. 
            ▪ Subtask 5.10.7.2: Server-side validation of productId. 
    • Testing Tasks:
        ◦ Task 5.10.8: Write Unit Tests 
            ▪ Subtask 5.10.8.1: Unit tests for frontend confirmation logic. 
            ▪ Subtask 5.10.8.2: Unit tests for backend product status update logic. 
        ◦ Task 5.10.9: Write Integration Tests 
            ▪ Subtask 5.10.9.1: Create a new product. Log in as admin. 
            ▪ Subtask 5.10.9.2: Call PUT /api/admin/products/:productId/status to set status to "Archived". Verify status change in DB and product is no longer returned by default GET /api/admin/products. 
            ▪ Subtask 5.10.9.3: Test attempting to delete a non-existent product. 
            ▪ Subtask 5.10.9.4: Test unauthorized access. 
        ◦ Task 5.10.10: Manual End-to-End Testing 
            ▪ Subtask 5.10.10.1: Log in to admin. Navigate to "Manage Products." 
            ▪ Subtask 5.10.10.2: Create a test product. 
            ▪ Subtask 5.10.10.3: Go back to the product list, find the test product, and click "Delete." 
            ▪ Subtask 5.10.10.4: Confirm the deletion in the modal. 
            ▪ Subtask 5.10.10.5: Verify the product is no longer in the default "Manage Products" list. 
            ▪ Subtask 5.10.10.6: Try to access the product on the storefront URL (it should result in 404 or product not found). 
            ▪ Subtask 5.10.10.7: (If implemented) Verify the product is still linked to any past orders it was part of.
Epic: Admin Order Management
Story 5.11: Manage Users (Admin)
Story: As an administrator, I want to be able to view, search, and manage customer accounts, including the ability to disable or enable user access, so that I can provide customer support and maintain user security.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Manage Users" link is available in the Admin Dashboard navigation. 
    2. The "Manage Users" page displays a paginated list of all customer accounts. 
    3. For each user, the following key details are displayed: 
        ◦ User ID 
        ◦ Name (First, Last) 
        ◦ Email Address 
        ◦ Registration Date 
        ◦ Last Login Date 
        ◦ Account Status (e.g., "Active," "Disabled") 
        ◦ Number of Orders (optional, for quick insight) 
    4. Admins can search for users by: 
        ◦ Name (First, Last) 
        ◦ Email Address 
    5. Admins can filter users by: 
        ◦ Account Status (Active, Disabled) 
        ◦ Registration Date Range 
    6. Admins can sort users by: 
        ◦ Registration Date (default: newest first) 
        ◦ Last Login Date 
        ◦ Name 
    7. A "View Details" or "Edit" button/link is available for each user to view their full profile and manage their account status. 
    8. The admin can change a user's account status (e.g., from "Active" to "Disabled" and vice versa). 
    9. A confirmation dialog appears before changing account status. 
    10. Email notification is sent to the user when their account status is changed (e.g., "Account Disabled," "Account Re-enabled"). 
    11. All user management operations are securely logged with an audit trail. 

Granular Tasks & Subtasks for Story 5.11:
    • Frontend Tasks (Admin Panel):
        ◦ Task 5.11.1: Implement "Manage Users" Page UI 
            ▪ Subtask 5.11.1.1: Create AdminUsersListPage component/route (e.g., /admin/users). 
            ▪ Subtask 5.11.1.2: Add a navigation link for "Manage Users" in the Admin Dashboard sidebar/menu. 
            ▪ Subtask 5.11.1.3: Design and implement a responsive table to display user summaries. 
            ▪ Subtask 5.11.1.4: Include columns for User ID, Name, Email, Registration Date, Last Login Date, Account Status. 
            ▪ Subtask 5.11.1.5: Add "View/Edit" button/link for each user row. 
        ◦ Task 5.11.2: Implement Pagination UI for Users 
            ▪ Subtask 5.11.2.1: Reuse/adapt existing Pagination component. 
            ▪ Subtask 5.11.2.2: Integrate pagination controls with the user list. 
        ◦ Task 5.11.3: Implement Search UI for Users 
            ▪ Subtask 5.11.3.1: Add a search bar for Name and Email. 
        ◦ Task 5.11.4: Implement Filtering UI for Users 
            ▪ Subtask 5.11.4.1: Add dropdowns/selects for filtering by Account Status. 
            ▪ Subtask 5.11.4.2: Add date picker components for Registration Date Range filtering. 
            ▪ Subtask 5.11.4.3: Include "Apply Filters" and "Clear Filters" buttons. 
        ◦ Task 5.11.5: Implement Sorting UI for Users 
            ▪ Subtask 5.11.5.1: Make table headers clickable for sorting (Registration Date, Last Login Date, Name). 
            ▪ Subtask 5.11.5.2: Indicate current sort direction. 
        ◦ Task 5.11.6: Frontend API Integration: Fetch All Users (with Filters/Search/Sorting) 
            ▪ Subtask 5.11.6.1: Create service/hook to call GET /api/admin/users. 
            ▪ Subtask 5.11.6.2: Pass pagination, search, filtering, and sorting parameters. 
            ▪ Subtask 5.11.6.3: Display fetched user data. 
        ◦ Task 5.11.7: Implement "Edit User" Details Page UI (Admin) 
            ▪ Subtask 5.11.7.1: Create AdminUserDetailsPage component/route (e.g., /admin/users/:userId). 
            ▪ Subtask 5.11.7.2: Display user's full profile details (Name, Email, Addresses, Orders history summary, etc.). 
            ▪ Subtask 5.11.7.3: Implement a toggle or button for changing accountStatus (Active/Disabled). 
            ▪ Subtask 5.11.7.4: Implement a confirmation dialog before changing account status. 
        ◦ Task 5.11.8: Frontend API Integration: Update User Status 
            ▪ Subtask 5.11.8.1: Create service/hook to call PUT /api/admin/users/:userId/status. 
            ▪ Subtask 5.11.8.2: Send newStatus (e.g., "active" or "disabled") in the request body. 
            ▪ Subtask 5.11.8.3: On successful response, update UI and display success/error notifications. 
    • Backend Tasks (Admin API):
        ◦ Task 5.11.9: Update User Model for Account Status 
            ▪ Subtask 5.11.9.1: Ensure the User schema includes an accountStatus field (e.g., default "active") and lastLoginDate. 
        ◦ Task 5.11.10: Create Get All Users API Endpoint (for Admin) 
            ▪ Subtask 5.11.10.1: Design and implement GET /api/admin/users. 
            ▪ Subtask 5.11.10.2: Apply admin authentication middleware. 
            ▪ Subtask 5.11.10.3: Implement logic to query the User collection. 
            ▪ Subtask 5.11.10.4: Implement pagination, search (by name, email), filtering (by status, registration date), and sorting (by reg date, last login, name). 
            ▪ Subtask 5.11.10.5: Return the paginated list of users. 
        ◦ Task 5.11.11: Create Get Single User Details API Endpoint (for Admin) 
            ▪ Subtask 5.11.11.1: Design and implement GET /api/admin/users/:userId. 
            ▪ Subtask 5.11.11.2: Apply admin authentication middleware. 
            ▪ Subtask 5.11.11.3: Fetch User document by _id. 
            ▪ Subtask 5.11.11.4: Return full user details (excluding sensitive data like password hash). 
        ◦ Task 5.11.12: Create Update User Status API Endpoint 
            ▪ Subtask 5.11.12.1: Design and implement PUT /api/admin/users/:userId/status. 
            ▪ Subtask 5.11.12.2: Apply admin authentication middleware. 
            ▪ Subtask 5.11.12.3: Validate userId and newStatus (e.g., "active" or "disabled"). 
            ▪ Subtask 5.11.12.4: Update the User document's accountStatus. 
            ▪ Subtask 5.11.12.5: If account is disabled, consider invalidating any active sessions/tokens for that user. 
            ▪ Subtask 5.11.12.6: Audit Logging: Record which admin user changed the status and when. 
            ▪ Subtask 5.11.12.7: Trigger account status change email notification. 
            ▪ Subtask 5.11.12.8: Return updated user data or success message. 
        ◦ Task 5.11.13: Email Service Integration (Account Status Notifications) 
            ▪ Subtask 5.11.13.1: Create email templates for "Account Disabled" and "Account Re-enabled." 
            ▪ Subtask 5.11.13.2: Implement functions to send these emails triggered by the status update API. 
    • Security & Data Integrity Tasks:
        ◦ Task 5.11.14: Secure Access to User Data 
            ▪ Subtask 5.11.14.1: Ensure sensitive user data (e.g., password hashes, full credit card details) are never exposed. 
            ▪ Subtask 5.11.14.2: Only authenticated admins can access and modify user accounts. 
        ◦ Task 5.11.15: Impose Client-Side Login Restrictions 
            ▪ Subtask 5.11.15.1: When a user's accountStatus is "disabled," the frontend login flow should prevent them from logging in. 
    • Testing Tasks:
        ◦ Task 5.11.16: Write Unit Tests 
            ▪ Subtask 5.11.16.1: Unit tests for frontend user list filtering/sorting logic. 
            ▪ Subtask 5.11.16.2: Unit tests for backend user querying and status update logic. 
        ◦ Task 5.11.17: Write Integration Tests 
            ▪ Subtask 5.11.17.1: Create several test user accounts. 
            ▪ Subtask 5.11.17.2: Log in as admin, call GET /api/admin/users. Verify list and pagination. 
            ▪ Subtask 5.11.17.3: Test searching and filtering users. 
            ▪ Subtask 5.11.17.4: Call GET /api/admin/users/:userId for a test user. Verify details. 
            ▪ Subtask 5.11.17.5: Call PUT /api/admin/users/:userId/status to disable a user. Verify status change in DB and mock email trigger. 
            ▪ Subtask 5.11.17.6: Attempt to log in as the disabled user (should fail). 
            ▪ Subtask 5.11.17.7: Re-enable the user. Verify status change and mock email trigger. 
            ▪ Subtask 5.11.17.8: Test unauthorized access. 
        ◦ Task 5.11.18: Manual End-to-End Testing 
            ▪ Subtask 5.11.18.1: Log in to admin. Navigate to "Manage Users." 
            ▪ Subtask 5.11.18.2: Verify list of users, pagination, search, filter, and sort. 
            ▪ Subtask 5.11.18.3: Click "View/Edit" on a test user. 
            ▪ Subtask 5.11.18.4: Change user status to "Disabled." Confirm. Verify UI updates. Try to log in as that user from a separate browser/incognito window (should fail). 
            ▪ Subtask 5.11.18.5: Re-enable the user. Confirm. Verify UI updates. Try to log in as that user (should succeed). 
            ▪ Subtask 5.11.18.6: Verify email notifications for status changes.
Epic: Admin Order Management
Story 5.12: View Reports/Analytics (Admin)
Story: As an administrator, I want to view key business reports and analytics (e.g., sales, revenue, product performance, inventory) so that I can monitor the store's health and make data-driven decisions.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Reports" or "Analytics" link is available in the Admin Dashboard navigation. 
    2. The "Reports" page presents a dashboard with various types of reports. 
    3. Initial Reports to include: 
        ◦ Sales Summary Report: 
            ▪ Total Revenue (configurable period: Daily, Weekly, Monthly, Custom Range) 
            ▪ Number of Orders (configurable period) 
            ▪ Average Order Value (configurable period) 
            ▪ (Optional) Sales Trend Chart over time. 
        ◦ Product Performance Report: 
            ▪ Top N Best-Selling Products (by quantity and/or revenue) 
            ▪ Top N Most-Viewed Products (if tracking implemented in storefront) 
            ▪ (Optional) Products with Lowest Stock. 
        ◦ Customer Report: 
            ▪ New Customer Acquisition over time (configurable period) 
            ▪ (Optional) Top N Customers by Spending. 
        ◦ Inventory Summary: 
            ▪ Total number of products "In Stock," "Out of Stock," "Low Stock." 
            ▪ List of "Low Stock" products (below threshold). 
    4. Each report allows for a configurable date range. 
    5. Data is presented clearly, using tables, summary cards, and potentially simple charts. 
    6. Reports are dynamic and update based on selected filters/date ranges. 
    7. All report data is retrieved securely with admin-level authentication. 

Granular Tasks & Subtasks for Story 5.12:
    • Frontend Tasks (Admin Panel):
        ◦ Task 5.12.1: Implement "Reports" Page UI 
            ▪ Subtask 5.12.1.1: Create AdminReportsPage component/route (e.g., /admin/reports). 
            ▪ Subtask 5.12.1.2: Add a navigation link for "Reports" or "Analytics" in the Admin Dashboard sidebar/menu. 
            ▪ Subtask 5.12.1.3: Design a layout for various report widgets/sections. 
            ▪ Subtask 5.12.1.4: Implement a global date range picker component that applies to most reports. 
            ▪ Subtask 5.12.1.5: Implement period selectors (Daily, Weekly, Monthly, Custom) for the date range picker. 
        ◦ Task 5.12.2: Implement Sales Summary Report Widget 
            ▪ Subtask 5.12.2.1: Create a dedicated component for Sales Summary. 
            ▪ Subtask 5.12.2.2: Display Total Revenue, Number of Orders, Average Order Value in summary cards. 
            ▪ Subtask 5.12.2.3: Integrate with charting library (e.g., Chart.js, Recharts) for Sales Trend Chart (optional for MVP, can be line chart). 
        ◦ Task 5.12.3: Implement Product Pdocerformance Report Widget 
            ▪ Subtask 5.12.3.1: Create a dedicated component for Product Performance. 
            ▪ Subtask 5.12.3.2: Display Top N Best-Selling Products (table format: Product Name, Quantity Sold, Revenue). 
            ▪ Subtask 5.12.3.3: Display Products with Lowest Stock (table format: Product Name, SKU, Current Stock). 
        ◦ Task 5.12.4: Implement Customer Report Widget 
            ▪ Subtask 5.12.4.1: Create a dedicated component for Customer Report. 
            ▪ Subtask 5.12.4.2: Display New Customer Acquisition over time (summary number and optional trend chart). 
        ◦ Task 5.12.5: Implement Inventory Summary Widget 
            ▪ Subtask 5.12.5.1: Create a dedicated component for Inventory Summary. 
            ▪ Subtask 5.12.5.2: Display counts for "In Stock," "Out of Stock," "Low Stock." 
            ▪ Subtask 5.12.5.3: List actual "Low Stock" products. 
        ◦ Task 5.12.6: Frontend API Integration: Fetch Report Data 
            ▪ Subtask 5.12.6.1: Create services/hooks for each report type to call respective backend endpoints. 
            ▪ Subtask 5.12.6.2: Pass date range and other relevant filters to backend. 
            ▪ Subtask 5.12.6.3: Handle loading states and display "No data available." 
    • Backend Tasks (Admin API):
        ◦ Task 5.12.7: Create Sales Report API Endpoint 
            ▪ Subtask 5.12.7.1: Design and implement GET /api/admin/reports/sales-summary. 
            ▪ Subtask 5.12.7.2: Apply admin authentication middleware. 
            ▪ Subtask 5.12.7.3: Receive startDate and endDate parameters. 
            ▪ Subtask 5.12.7.4: Query Order collection: 
                • Aggregate total revenue (sum of grandTotal) within the date range. 
                • Count total number of orders. 
                • Calculate Average Order Value. 
                • (Optional) Group orders by day/week/month for trend data. 
            ▪ Subtask 5.12.7.5: Return aggregated data. 
        ◦ Task 5.12.8: Create Product Performance Report API Endpoint 
            ▪ Subtask 5.12.8.1: Design and implement GET /api/admin/reports/product-performance. 
            ▪ Subtask 5.12.8.2: Apply admin authentication. 
            ▪ Subtask 5.12.8.3: Query Order collection (and Product collection for low stock): 
                • Aggregate order items to find top selling products by quantity and revenue (using $unwind and $group). 
                • Query Product collection for products with stockQuantity below a threshold. 
            ▪ Subtask 5.12.8.4: Return top products and low stock products. 
        ◦ Task 5.12.9: Create Customer Report API Endpoint 
            ▪ Subtask 5.12.9.1: Design and implement GET /api/admin/reports/customer-acquisition. 
            ▪ Subtask 5.12.9.2: Apply admin authentication. 
            ▪ Subtask 5.12.9.3: Query User collection: 
                • Count new users registered within the date range. 
                • (Optional) Aggregate users by createdAt date for trend data. 
            ▪ Subtask 5.12.9.4: Return counts. 
        ◦ Task 5.12.10: Create Inventory Summary Report API Endpoint 
            ▪ Subtask 5.12.10.1: Design and implement GET /api/admin/reports/inventory-summary. 
            ▪ Subtask 5.12.10.2: Apply admin authentication. 
            ▪ Subtask 5.12.10.3: Query Product collection: 
                • Count products where stockQuantity > 0. 
                • Count products where stockQuantity == 0. 
                • Count products where stockQuantity <= lowStockThreshold (and > 0). 
                • List all products that are "Low Stock." 
            ▪ Subtask 5.12.10.4: Return counts and list of low stock products. 
        ◦ Task 5.12.11: Optimize Database Aggregations 
            ▪ Subtask 5.12.11.1: Ensure efficient use of MongoDB aggregation pipelines for report generation. 
            ▪ Subtask 5.12.11.2: Add necessary indexes to Order and Product collections to speed up aggregations. 
    • Security & Data Integrity Tasks:
        ◦ Task 5.12.12: Data Access Control 
            ▪ Subtask 5.12.12.1: Ensure only authenticated and authorized admins can access report data. No sensitive customer details should be directly exposed without explicit need. 
        ◦ Task 5.12.13: Parameter Validation 
            ▪ Subtask 5.12.13.1: Validate startDate and endDate parameters to prevent malformed queries. 
    • Testing Tasks:
        ◦ Task 5.12.14: Write Unit Tests 
            ▪ Subtask 5.12.14.1: Unit tests for frontend report data display and filtering logic. 
            ▪ Subtask 5.12.14.2: Unit tests for backend aggregation queries with mock data (e.g., test sales calculation, top products logic). 
        ◦ Task 5.12.15: Write Integration Tests 
            ▪ Subtask 5.12.15.1: Create mock orders, products, and users spanning different dates. 
            ▪ Subtask 5.12.15.2: Log in as admin, then call each report endpoint with various date ranges. 
            ▪ Subtask 5.12.15.3: Verify that the returned aggregated data matches expected calculations based on mock data. 
            ▪ Subtask 5.12.15.4: Test unauthorized access to report endpoints. 
        ◦ Task 5.12.16: Manual End-to-End Testing 
            ▪ Subtask 5.12.16.1: Log in to the admin panel. Navigate to "Reports." 
            ▪ Subtask 5.12.16.2: Verify all report widgets are displayed. 
            ▪ Subtask 5.12.16.3: Change the global date range (Daily, Weekly, Monthly, Custom) and verify that all reports update accordingly. 
            ▪ Subtask 5.12.16.4: Confirm that sales numbers, top products, customer counts, and inventory statuses are accurate based on the test data in the database. 
            ▪ Subtask 5.12.16.5: Verify "Low Stock" products list is correct.
Epic: Admin Order Management
Story 5.13: Manage Promotions/Discounts (Admin)
Story: As an administrator, I want to be able to create, edit, activate, deactivate, and delete various types of promotions and discount codes so that I can implement marketing campaigns and offer incentives to customers.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Manage Promotions" or "Discounts" link is available in the Admin Dashboard navigation. 
    2. The "Manage Promotions" page displays a paginated list of all active and inactive promotions/discount codes. 
    3. For each promotion/discount, the following key details are displayed: 
        ◦ Promotion Name/Code 
        ◦ Type (e.g., Percentage Off, Fixed Amount Off, Free Shipping) 
        ◦ Discount Value 
        ◦ Usage Limit (total and per user) 
        ◦ Start Date, End Date 
        ◦ Status (Active, Inactive, Expired, Draft) 
        ◦ Times Used 
    4. Admins can search for promotions by name or code. 
    5. Admins can filter promotions by type and status. 
    6. Admins can add a new promotion/discount with the following configurable attributes: 
        ◦ General: Name (e.g., "Summer Sale"), Code (e.g., "SUMMER20", auto-generated or custom, unique), Description. 
        ◦ Type & Value: Percentage Off (e.g., 10%), Fixed Amount Off (e.g., $10), Free Shipping. 
        ◦ Conditions: Minimum Order Subtotal, Applicable Products/Categories (optional, multiple allowed). 
        ◦ Usage: Total Usage Limit (e.g., 100 uses), Per User Usage Limit (e.g., 1 use per customer). 
        ◦ Dates: Start Date, End Date. 
        ◦ Visibility: Internal Status (Active, Inactive, Draft). 
    7. Admins can edit existing promotions (with restrictions on changing past usage/history). 
    8. Admins can activate/deactivate promotions. 
    9. Admins can delete promotions (soft delete recommended). 
    10. All form fields are validated client-side and server-side. 
    11. Appropriate success/error messages are displayed. 
    12. All promotion management operations are securely logged with an audit trail. 

Granular Tasks & Subtasks for Story 5.13:
    • Frontend Tasks (Admin Panel):
        ◦ Task 5.13.1: Implement "Manage Promotions" Page UI 
            ▪ Subtask 5.13.1.1: Create AdminPromotionsListPage component/route (e.g., /admin/promotions). 
            ▪ Subtask 5.13.1.2: Add a navigation link for "Manage Promotions" in the Admin Dashboard sidebar/menu. 
            ▪ Subtask 5.13.1.3: Design and implement a paginated table to display promotion summaries. 
            ▪ Subtask 5.13.1.4: Include columns for Name/Code, Type, Value, Dates, Status, Times Used, and "Edit" / "Activate/Deactivate" / "Delete" buttons. 
            ▪ Subtask 5.13.1.5: Add an "Add New Promotion" button. 
        ◦ Task 5.13.2: Implement Search, Filter & Pagination UI 
            ▪ Subtask 5.13.2.1: Add a search bar for Name/Code. 
            ▪ Subtask 5.13.2.2: Add dropdowns/selects for filtering by Type and Status. 
            ▪ Subtask 5.13.2.3: Reuse/adapt existing Pagination component. 
        ◦ Task 5.13.3: Implement "Add/Edit Promotion" Form UI 
            ▪ Subtask 5.13.3.1: Create AdminPromotionFormPage component (or a modal for form). 
            ▪ Subtask 5.13.3.2: Implement input fields for: 
                • Promotion Name (text, required) 
                • Code (text, auto-generate option, required, unique) 
                • Description (textarea) 
                • Discount Type (radio buttons/dropdown: Percentage, Fixed Amount, Free Shipping) 
                • Discount Value (number input, conditionally shown based on type) 
                • Minimum Order Subtotal (number input, optional) 
                • Applicable Products (multi-select, searchable, fetching from product list in 5.7) 
                • Applicable Categories (multi-select, fetching from categories in 5.9) 
                • Total Usage Limit (number input, optional) 
                • Per User Usage Limit (number input, optional) 
                • Start Date (date picker, required) 
                • End Date (date picker, required) 
                • Status (radio buttons/dropdown: Draft, Active, Inactive) 
            ▪ Subtask 5.13.3.3: For "Edit" mode, pre-populate form fields. 
            ▪ Subtask 5.13.3.4: Add "Save" and "Cancel" buttons. 
        ◦ Task 5.13.4: Implement Client-Side Form Validation 
            ▪ Subtask 5.13.4.1: Validate required fields, numeric values, date ranges (start before end). 
            ▪ Subtask 5.13.4.2: Validate code uniqueness (debounced API call). 
        ◦ Task 5.13.5: Frontend API Integration: Submit Promotion Data 
            ▪ Subtask 5.13.5.1: Create service/hook for POST /api/admin/promotions (add). 
            ▪ Subtask 5.13.5.2: Create service/hook for PUT /api/admin/promotions/:promoId (edit). 
            ▪ Subtask 5.13.5.3: On success, redirect to list and show notification. Handle errors. 
        ◦ Task 5.13.6: Frontend API Integration: Activate/Deactivate/Delete Promotion 
            ▪ Subtask 5.13.6.1: Create service/hook for PUT /api/admin/promotions/:promoId/status. 
            ▪ Subtask 5.13.6.2: Create service/hook for DELETE /api/admin/promotions/:promoId (soft delete). 
            ▪ Subtask 5.13.6.3: Implement confirmation modals for status change and deletion. 
    • Backend Tasks (Admin API):
        ◦ Task 5.13.7: Design Promotion/Discount Data Model 
            ▪ Subtask 5.13.7.1: Define MongoDB schema for Promotion or Discount collection. Include fields for all attributes mentioned in ACs (name, code, type, value, limits, dates, status, etc.). Add timesUsed and usersUsed (array of user IDs) fields. 
            ▪ Subtask 5.13.7.2: Ensure code has a unique index. 
        ◦ Task 5.13.8: Create Get All Promotions API Endpoint 
            ▪ Subtask 5.13.8.1: Design and implement GET /api/admin/promotions. 
            ▪ Subtask 5.13.8.2: Apply admin authentication. 
            ▪ Subtask 5.13.8.3: Implement pagination, search, filtering, and sorting. 
            ▪ Subtask 5.13.8.4: Include logic to determine if a promotion is Expired based on endDate. 
        ◦ Task 5.13.9: Create Add Promotion API Endpoint 
            ▪ Subtask 5.13.9.1: Design and implement POST /api/admin/promotions. 
            ▪ Subtask 5.13.9.2: Apply admin authentication. 
            ▪ Subtask 5.13.9.3: Implement server-side validation for all fields. 
            ▪ Subtask 5.13.9.4: Validate uniqueness of the discount code. 
            ▪ Subtask 5.13.9.5: Create new Promotion document. 
        ◦ Task 5.13.10: Create Edit Promotion API Endpoint 
            ▪ Subtask 5.13.10.1: Design and implement PUT /api/admin/promotions/:promoId. 
            ▪ Subtask 5.13.10.2: Apply admin authentication. 
            ▪ Subtask 5.13.10.3: Validate promoId and existence. 
            ▪ Subtask 5.13.10.4: Implement server-side validation for updated fields. 
            ▪ Subtask 5.13.10.5: Restrict changes to fields that would break existing usage data (e.g., prevent changing type or value if timesUsed > 0). 
            ▪ Subtask 5.13.10.6: Update Promotion document. 
            ▪ Subtask 5.13.10.7: Audit Logging: Record changes. 
        ◦ Task 5.13.11: Create Update Promotion Status API Endpoint 
            ▪ Subtask 5.13.11.1: Design and implement PUT /api/admin/promotions/:promoId/status. 
            ▪ Subtask 5.13.11.2: Apply admin authentication. 
            ▪ Subtask 5.13.11.3: Validate promoId and newStatus. 
            ▪ Subtask 5.13.11.4: Update Promotion document's status. 
            ▪ Subtask 5.13.11.5: Audit Logging: Record status change. 
        ◦ Task 5.13.12: Create Delete Promotion API Endpoint (Soft Delete) 
            ▪ Subtask 5.13.12.1: Design and implement DELETE /api/admin/promotions/:promoId. 
            ▪ Subtask 5.13.12.2: Apply admin authentication. 
            ▪ Subtask 5.13.12.3: Set status to "Archived" or introduce an isDeleted flag. 
            ▪ Subtask 5.13.12.4: Audit Logging: Record deletion. 
    • Logic for Discount Application (Backend - for future order processing):
        ◦ Task 5.13.13: Integrate Discount Logic into Checkout Process 
            ▪ Subtask 5.13.13.1: Modify POST /api/checkout/apply-coupon (or similar endpoint) to validate discount code against Promotion collection. 
            ▪ Subtask 5.13.13.2: Check startDate, endDate, status ("Active"). 
            ▪ Subtask 5.13.13.3: Check totalUsageLimit and perUserUsageLimit (by checking usersUsed array). 
            ▪ Subtask 5.13.13.4: Check minimumOrderSubtotal. 
            ▪ Subtask 5.13.13.5: Check applicableProducts and applicableCategories if specified. 
            ▪ Subtask 5.13.13.6: Calculate discount amount based on type and value. 
            ▪ Subtask 5.13.13.7: Update timesUsed and usersUsed array for the promotion when an order successfully uses it. 
    • Security & Data Integrity Tasks:
        ◦ Task 5.13.14: Robust Authorization & Validation 
            ▪ Subtask 5.13.14.1: Ensure only authenticated admins can manage promotions. 
            ▪ Subtask 5.13.14.2: Comprehensive server-side validation for all promotion attributes. 
    • Testing Tasks:
        ◦ Task 5.13.15: Write Unit Tests 
            ▪ Subtask 5.13.15.1: Unit tests for frontend form validation. 
            ▪ Subtask 5.13.15.2: Unit tests for backend promotion creation/update logic, including uniqueness and date validations. 
            ▪ Subtask 5.13.15.3: Unit tests for discount application logic (mocking promotion, cart, user data). 
        ◦ Task 5.13.16: Write Integration Tests 
            ▪ Subtask 5.13.16.1: Log in as admin. Test POST /api/admin/promotions with valid data (various types: percentage, fixed, free shipping). Verify creation. 
            ▪ Subtask 5.13.16.2: Test POST with invalid data (duplicate code, invalid dates, negative values). 
            ▪ Subtask 5.13.16.3: Test PUT /api/admin/promotions/:promoId to edit various fields. 
            ▪ Subtask 5.13.16.4: Test PUT /api/admin/promotions/:promoId/status to activate/deactivate. 
            ▪ Subtask 5.13.16.5: Test DELETE /api/admin/promotions/:promoId (soft delete). 
            ▪ Subtask 5.13.16.6: Test unauthorized access. 
        ◦ Task 5.13.17: Manual End-to-End Testing 
            ▪ Subtask 5.13.17.1: Log in to admin. Navigate to "Manage Promotions." 
            ▪ Subtask 5.13.17.2: Create a new percentage discount with a limit and specific dates. Verify it appears. 
            ▪ Subtask 5.13.17.3: Try to create a discount with an overlapping code. 
            ▪ Subtask 5.13.17.4: Edit the discount, change its value, dates, and status. 
            ▪ Subtask 5.13.17.5: Deactivate a discount, then activate it. 
            ▪ Subtask 5.13.17.6: Delete a test discount. 
            ▪ Subtask 5.13.17.7: Crucially, test the discount application from the customer side: Add items to cart, try to apply the created discount code (valid, expired, over limit, etc.). Verify discount is applied/rejected correctly. Place an order with the discount and verify timesUsed updates.
Epic: Admin Order Management
Story 5.14: Admin Settings Management
Story: As an administrator, I want to be able to manage various store settings (e.g., general information, shipping methods, tax rates, payment gateways) so that I can configure the store's core functionality and operations.
(Recall the Acceptance Criteria from earlier refinement for context):
    1. A "Settings" or "Configuration" link is available in the Admin Dashboard navigation. 
    2. The "Settings" page is organized into sections (e.g., "General," "Shipping," "Tax," "Payments"). 
    3. General Settings: 
        ◦ Store Name 
        ◦ Store Email Address (for contact forms, order notifications) 
        ◦ Store Phone Number 
        ◦ Store Address (for display on "Contact Us," invoices) 
        ◦ Default Currency 
        ◦ Default Language 
    4. Shipping Settings: 
        ◦ List of supported shipping methods (e.g., "Flat Rate," "Free Shipping," "UPS," "FedEx"). 
        ◦ Configuration for each method (e.g., flat rate cost, API keys for carriers). 
        ◦ Ability to add, edit, and delete shipping methods. 
        ◦ Shipping zones (e.g., domestic, international) with different methods and costs. 
    5. Tax Settings: 
        ◦ Tax calculation method (e.g., tax inclusive, tax exclusive). 
        ◦ Tax rates for different regions/states/countries. 
        ◦ Ability to add, edit, and delete tax rates. 
    6. Payment Gateway Settings: 
        ◦ Integration with supported payment gateways (e.g., Stripe, PayPal, Authorize.net). 
        ◦ API keys and other credentials for each gateway. 
        ◦ Ability to enable/disable payment methods. 
    7. All settings are validated client-side and server-side. 
    8. Appropriate success/error messages are displayed. 
    9. All settings changes are securely logged with an audit trail. 

Granular Tasks & Subtasks for Story 5.14:
    • Frontend Tasks (Admin Panel):
        ◦ Task 5.14.1: Implement "Settings" Page UI 
            ▪ Subtask 5.14.1.1: Create AdminSettingsPage component/route (e.g., /admin/settings). 
            ▪ Subtask 5.14.1.2: Add a navigation link for "Settings" in the Admin Dashboard sidebar/menu. 
            ▪ Subtask 5.14.1.3: Design a tabbed or accordion-style layout to organize settings into sections (General, Shipping, Tax, Payments). 
        ◦ Task 5.14.2: Implement "General Settings" Form 
            ▪ Subtask 5.14.2.1: Implement input fields for Store Name, Email, Phone, Address. 
            ▪ Subtask 5.14.2.2: Implement a dropdown/select for Default Currency. 
            ▪ Subtask 5.14.2.3: Implement a dropdown/select for Default Language. 
        ◦ Task 5.14.3: Implement "Shipping Settings" Management UI 
            ▪ Subtask 5.14.3.1: Display a list of existing shipping methods (table format: Name, Type, Cost). 
            ▪ Subtask 5.14.3.2: Add "Add Shipping Method" button. 
            ▪ Subtask 5.14.3.3: Implement a form (potentially a modal) for adding/editing shipping methods: 
                • Name (text) 
                • Type (dropdown: Flat Rate, Free Shipping, UPS, FedEx, etc.) 
                • Configuration fields (conditionally shown based on type; e.g., flat rate cost, API keys). 
                • Shipping Zones (multi-select, with costs per zone). 
        ◦ Task 5.14.4: Implement "Tax Settings" Management UI 
            ▪ Subtask 5.14.4.1: Display a list of existing tax rates (table format: Region, Rate). 
            ▪ Subtask 5.14.4.2: Add "Add Tax Rate" button. 
            ▪ Subtask 5.14.4.3: Implement a form (potentially a modal) for adding/editing tax rates: 
                • Region/State/Country (text, dropdown, or a more complex geographical selector). 
                • Tax Rate (number input). 
                • Tax Calculation Method (radio buttons: Tax Inclusive, Tax Exclusive). 
        ◦ Task 5.14.5: Implement "Payment Gateway Settings" Management UI 
            ▪ Subtask 5.14.5.1: Display a list of integrated payment gateways (e.g., Stripe, PayPal, Authorize.net). 
            ▪ Subtask 5.14.5.2: For each gateway, display configuration fields (API keys, etc.). 
            ▪ Subtask 5.14.5.3: Implement toggle/checkbox to enable/disable each payment method. 
        ◦ Task 5.14.6: Implement Client-Side Form Validation 
            ▪ Subtask 5.14.6.1: Validate required fields, email format, URL format (for API endpoints), numeric values. 
        ◦ Task 5.14.7: Frontend API Integration: Save Settings Data 
            ▪ Subtask 5.14.7.1: Create services/hooks for each settings section to call respective backend endpoints (e.g., PUT /api/admin/settings/general, PUT /api/admin/settings/shipping, etc.). 
            ▪ Subtask 5.14.7.2: On success, show notification. Handle errors. 
    • Backend Tasks (Admin API):
        ◦ Task 5.14.8: Design Settings Data Model(s) 
            ▪ Subtask 5.14.8.1: Decide whether to use a single Settings collection with nested documents or separate collections for each section (e.g., GeneralSettings, ShippingMethods, TaxRates, PaymentGateways). 
            ▪ Subtask 5.14.8.2: Define MongoDB schemas for each setting type. 
        ◦ Task 5.14.9: Create Get Settings API Endpoints 
            ▪ Subtask 5.14.9.1: Design and implement GET endpoints for each settings section (e.g., GET /api/admin/settings/general, GET /api/admin/settings/shipping, GET /api/admin/settings/taxes, GET /api/admin/settings/payments). 
            ▪ Subtask 5.14.9.2: Apply admin authentication. 
            ▪ Subtask 5.14.9.3: Fetch settings data from the appropriate collection(s). 
        ◦ Task 5.14.10: Create Update Settings API Endpoints 
            ▪ Subtask 5.14.10.1: Design and implement PUT endpoints for each settings section (e.g., PUT /api/admin/settings/general, PUT /api/admin/settings/shipping, PUT /api/admin/settings/taxes, PUT /api/admin/settings/payments). 
            ▪ Subtask 5.14.10.2: Apply admin authentication. 
            ▪ Subtask 5.14.10.3: Implement server-side validation for all fields received for the respective setting. 
            ▪ Subtask 5.14.10.4: Update settings data in the appropriate collection(s). For lists (shipping, tax), implement CRUD logic (add new, update existing, delete by ID). 
            ▪ Subtask 5.14.10.5: Audit Logging: Record changes to settings (who changed what, when). 
    • Core Application Integration Tasks: (These tasks involve using the saved settings in the application logic)
        ◦ Task 5.14.11: Integrate General Settings into Storefront/Emails 
            ▪ Subtask 5.14.11.1: Ensure storefront components dynamically load store name, email, address. 
            ▪ Subtask 5.14.11.2: Update email templates to use configured store email and name. 
        ◦ Task 5.14.12: Integrate Shipping Settings into Checkout 
            ▪ Subtask 5.14.12.1: Modify checkout flow to display available shipping methods based on configured methods and shipping zones. 
            ▪ Subtask 5.14.12.2: Implement shipping cost calculation based on selected method and destination. 
        ◦ Task 5.14.13: Integrate Tax Settings into Checkout 
            ▪ Subtask 5.14.13.1: Modify checkout flow to calculate and apply taxes based on configured tax rates and calculation method. 
        ◦ Task 5.14.14: Integrate Payment Gateway Settings into Checkout 
            ▪ Subtask 5.14.14.1: Modify checkout flow to display only enabled payment methods. 
            ▪ Subtask 5.14.14.2: Load API keys and other credentials for enabled gateways for backend payment processing. 
    • Security & Data Integrity Tasks:
        ◦ Task 5.14.15: Secure Settings Access 
            ▪ Subtask 5.14.15.1: Ensure only authenticated admins can access and modify store settings. 
            ▪ Subtask 5.14.15.2: Crucially, sensitive credentials (API keys) must be encrypted at rest and never exposed to the frontend. They should be stored in environment variables or a secure configuration vault. The admin UI only provides input fields, and the backend handles secure storage and retrieval for its internal use. 
        ◦ Task 5.14.16: Data Validation 
            ▪ Subtask 5.14.16.1: Comprehensive server-side validation for all settings attributes (e.g., email format, URL format, currency codes, language codes, valid numeric rates). 
    • Testing Tasks:
        ◦ Task 5.14.17: Write Unit Tests 
            ▪ Subtask 5.14.17.1: Unit tests for frontend form validation. 
            ▪ Subtask 5.14.17.2: Unit tests for backend settings update logic (each section). 
            ▪ Subtask 5.14.17.3: Unit tests for shipping/tax calculation logic using configured settings. 
        ◦ Task 5.14.18: Write Integration Tests 
            ▪ Subtask 5.14.18.1: Log in as admin. Test GET endpoints for each settings section. Verify data is returned. 
            ▪ Subtask 5.14.18.2: Test PUT endpoints for each settings section with valid data. Verify updates. 
            ▪ Subtask 5.14.18.3: Test PUT endpoints with invalid data. Verify error handling. 
            ▪ Subtask 5.14.18.4: Test unauthorized access to all settings endpoints. 
            ▪ Subtask 5.14.18.5: End-to-end integration tests for checkout flow: Change shipping rates/tax rates in admin, then verify these changes accurately affect the shipping and tax calculations in the customer checkout process. 
        ◦ Task 5.14.19: Manual End-to-End Testing 
            ▪ Subtask 5.14.19.1: Log in to the admin panel. Navigate to "Settings." 
            ▪ Subtask 5.14.19.2: Verify all settings sections are displayed. 
            ▪ Subtask 5.14.19.3: Modify general settings (store name, email, etc.). Verify changes are saved and reflected in the UI. Then, check the storefront "Contact Us" page and order confirmation emails for these updates. 
            ▪ Subtask 5.14.19.4: Add, edit, and delete shipping methods. Verify changes in the admin UI, then go to the customer checkout page and confirm available shipping options and calculated costs. 
            ▪ Subtask 5.14.19.5: Add, edit, and delete tax rates. Verify changes in the admin UI, then proceed through customer checkout and confirm tax calculations are accurate. 
            ▪ Subtask 5.14.19.6: Enable/disable payment gateways. Verify changes in the admin UI, then confirm payment options are correctly displayed/hidden in the customer checkout.
Epic 6: Customer Account Management Enhancements
This epic focuses on features that empower registered customers to manage their personal information, orders, and preferences within their dedicated account area on the storefront.

Epic 6: Customer Account Management Enhancements
Story 6.2: Manage Customer Address Book
Story: As a registered customer, I want to be able to add, edit, and delete shipping and billing addresses in my address book so that I can quickly select preferred addresses during checkout and keep my delivery information organized.
Acceptance Criteria:
    1. A "Address Book" link is available in the "My Account" navigation. 
    2. Clicking the "Address Book" link takes the customer to a page listing all their saved addresses. 
    3. Each address in the list displays key details (e.g., recipient name, first line of address, city, postcode). 
    4. There is an option to mark one address as the "Default Shipping Address" and another as the "Default Billing Address". 
    5. The customer can add a new address by filling out a form with standard address fields: 
        ◦ Full Name (Recipient) 
        ◦ Company Name (optional) 
        ◦ Address Line 1 (required) 
        ◦ Address Line 2 (optional) 
        ◦ City (required) 
        ◦ State/Province (required, may be a dropdown depending on country) 
        ◦ Postcode/Zip Code (required) 
        ◦ Country (required, dropdown) 
        ◦ Phone Number (optional, for delivery contact) 
        ◦ Checkbox options for "Set as Default Shipping Address" and "Set as Default Billing Address". 
    6. The customer can edit an existing address, pre-populating the form with current details. 
    7. The customer can delete an address after a confirmation prompt. 
    8. Addresses used in past orders cannot be deleted or modified in a way that breaks historical order data (they can only be deactivated or removed from active selection). 
    9. All address fields are validated client-side and server-side. 
    10. Upon successful add/edit/delete, a success message is displayed. 
    11. The address book updates are immediately reflected in the checkout process. 

Granular Tasks & Subtasks for Story 6.2:
    • Frontend Tasks (Customer Account Panel):
        ◦ Task 6.2.1: Implement "Address Book" Navigation & List Page 
            ▪ Subtask 6.2.1.1: Add an "Address Book" link to the CustomerAccountDashboardPage sidebar/tabs (from Story 6.1). 
            ▪ Subtask 6.2.1.2: Create CustomerAddressBookPage component/route (e.g., /account/addresses). 
            ▪ Subtask 6.2.1.3: Design and implement a layout to display a list of addresses (e.g., cards or table). 
            ▪ Subtask 6.2.1.4: For each address, display key information and "Edit," "Delete," and "Set as Default Shipping/Billing" (buttons/checkboxes). 
            ▪ Subtask 6.2.1.5: Clearly indicate the current default shipping and billing addresses. 
            ▪ Subtask 6.2.1.6: Add an "Add New Address" button. 
        ◦ Task 6.2.2: Implement "Add/Edit Address" Form UI 
            ▪ Subtask 6.2.2.1: Create a reusable AddressForm component (can be a modal or dedicated page, e.g., /account/addresses/new or /account/addresses/edit/:addressId). 
            ▪ Subtask 6.2.2.2: Implement input fields for all address attributes: Full Name, Company, Address Line 1 & 2, City, State/Province (dynamic based on country), Postcode/Zip, Country (dropdown), Phone Number. 
            ▪ Subtask 6.2.2.3: Include checkboxes for "Set as Default Shipping Address" and "Set as Default Billing Address." 
            ▪ Subtask 6.2.2.4: For "Edit" mode, pre-populate the form with fetched address data. 
            ▪ Subtask 6.2.2.5: Add "Save Address" and "Cancel" buttons. 
        ◦ Task 6.2.3: Implement Client-Side Form Validation 
            ▪ Subtask 6.2.3.1: Validate all required fields (Name, Address1, City, Postcode, Country, State/Province if applicable). 
            ▪ Subtask 6.2.3.2: Validate format (e.g., postcode patterns). 
        ◦ Task 6.2.4: Implement Address Deletion Confirmation 
            ▪ Subtask 6.2.4.1: On clicking "Delete," display a confirmation modal. 
            ▪ Subtask 6.2.4.2: Add "Confirm Delete" and "Cancel" buttons. 
        ◦ Task 6.2.5: Frontend API Integration: Fetch Address Book 
            ▪ Subtask 6.2.5.1: Create service/hook to call GET /api/customer/addresses. 
            ▪ Subtask 6.2.5.2: Display fetched addresses in the list. 
        ◦ Task 6.2.6: Frontend API Integration: Add Address 
            ▪ Subtask 6.2.6.1: Create service/hook to call POST /api/customer/addresses. 
            ▪ Subtask 6.2.6.2: On success, refresh the address list and display notification. 
        ◦ Task 6.2.7: Frontend API Integration: Edit Address 
            ▪ Subtask 6.2.7.1: Create service/hook to call PUT /api/customer/addresses/:addressId. 
            ▪ Subtask 6.2.7.2: On success, refresh the address list and display notification. 
        ◦ Task 6.2.8: Frontend API Integration: Delete Address 
            ▪ Subtask 6.2.8.1: Create service/hook to call DELETE /api/customer/addresses/:addressId. 
            ▪ Subtask 6.2.8.2: On success, remove from list and display notification. 
        ◦ Task 6.2.9: Frontend API Integration: Set Default Addresses 
            ▪ Subtask 6.2.9.1: Create service/hook to call PUT /api/customer/addresses/:addressId/default with type (shipping/billing). 
            ▪ Subtask 6.2.9.2: Update UI to reflect new defaults. 
    • Backend Tasks (Customer API):
        ◦ Task 6.2.10: Update User Model for Address Book 
            ▪ Subtask 6.2.10.1: Modify User schema to include an array of addresses (sub-documents or references to a separate Address collection if complex). Each address should have a unique ID. 
            ▪ Subtask 6.2.10.2: Add fields to User schema for defaultShippingAddressId and defaultBillingAddressId. 
        ◦ Task 6.2.11: Create Get Customer Address Book API Endpoint 
            ▪ Subtask 6.2.11.1: Design and implement GET /api/customer/addresses. 
            ▪ Subtask 6.2.11.2: Apply customer authentication middleware. 
            ▪ Subtask 6.2.11.3: Fetch the authenticated user's address array. 
            ▪ Subtask 6.2.11.4: Return the list of addresses along with default IDs. 
        ◦ Task 6.2.12: Create Add Address API Endpoint 
            ▪ Subtask 6.2.12.1: Design and implement POST /api/customer/addresses. 
            ▪ Subtask 6.2.12.2: Apply customer authentication. 
            ▪ Subtask 6.2.12.3: Implement server-side validation for all address fields. 
            ▪ Subtask 6.2.12.4: Add the new address to the user's addresses array. 
            ▪ Subtask 6.2.12.5: If default flags are set, update defaultShippingAddressId/defaultBillingAddressId. 
            ▪ Subtask 6.2.12.6: Audit Logging: Log new address added. 
        ◦ Task 6.2.13: Create Edit Address API Endpoint 
            ▪ Subtask 6.2.13.1: Design and implement PUT /api/customer/addresses/:addressId. 
            ▪ Subtask 6.2.13.2: Apply customer authentication. 
            ▪ Subtask 6.2.13.3: Validate addressId belongs to the authenticated user. 
            ▪ Subtask 6.2.13.4: Implement server-side validation for updated address fields. 
            ▪ Subtask 6.2.13.5: Update the specific address in the user's addresses array. 
            ▪ Subtask 6.2.13.6: If default flags are set, update defaultShippingAddressId/defaultBillingAddressId. 
            ▪ Subtask 6.2.13.7: Audit Logging: Log address updated. 
        ◦ Task 6.2.14: Create Delete Address API Endpoint 
            ▪ Subtask 6.2.14.1: Design and implement DELETE /api/customer/addresses/:addressId. 
            ▪ Subtask 6.2.14.2: Apply customer authentication. 
            ▪ Subtask 6.2.14.3: Validate addressId belongs to the authenticated user. 
            ▪ Subtask 6.2.14.4: Implement checks: Prevent deletion if the address is currently set as a default. If an address has been used in a past order, consider a soft delete (e.g., isDeleted flag on the address sub-document, or simply remove from active list but keep in DB for historical reference). For MVP, a strict delete might be acceptable, but later, historical data integrity is key. 
            ▪ Subtask 6.2.14.5: Remove the address from the user's addresses array (or set isDeleted flag). 
            ▪ Subtask 6.2.14.6: If the deleted address was a default, clear the default ID. 
            ▪ Subtask 6.2.14.7: Audit Logging: Log address deleted. 
        ◦ Task 6.2.15: Create Set Default Address API Endpoint 
            ▪ Subtask 6.2.15.1: Design and implement PUT /api/customer/addresses/:addressId/default. 
            ▪ Subtask 6.2.15.2: Apply customer authentication. 
            ▪ Subtask 6.2.15.3: Validate addressId belongs to the user and type (shipping/billing) is valid. 
            ▪ Subtask 6.2.15.4: Update defaultShippingAddressId or defaultBillingAddressId in the User document. 
    • Core Application Integration Tasks:
        ◦ Task 6.2.16: Integrate Address Book into Checkout Flow 
            ▪ Subtask 6.2.16.1: During checkout, allow logged-in users to select from their saved addresses. 
            ▪ Subtask 6.2.16.2: Auto-select default shipping/billing addresses if set. 
            ▪ Subtask 6.2.16.3: Provide an option to "Add New Address" directly from checkout. 
    • Security & Data Integrity Tasks:
        ◦ Task 6.2.17: Secure User Address Data 
            ▪ Subtask 6.2.17.1: Ensure only the authenticated user can access, add, edit, or delete their own addresses. 
            ▪ Subtask 6.2.17.2: Robust server-side validation for all address inputs. 
    • Testing Tasks:
        ◦ Task 6.2.18: Write Unit Tests 
            ▪ Subtask 6.2.18.1: Unit tests for frontend address form validation. 
            ▪ Subtask 6.2.18.2: Unit tests for backend address book CRUD logic, default setting, and user ownership checks. 
        ◦ Task 6.2.19: Write Integration Tests 
            ▪ Subtask 6.2.19.1: Register a test user and log in. 
            ▪ Subtask 6.2.19.2: Call POST /api/customer/addresses to add new addresses. Verify addresses are saved. 
            ▪ Subtask 6.2.19.3: Call GET /api/customer/addresses. Verify all added addresses are returned. 
            ▪ Subtask 6.2.19.4: Call PUT /api/customer/addresses/:addressId to edit an address. Verify changes. 
            ▪ Subtask 6.2.19.5: Call PUT /api/customer/addresses/:addressId/default to set defaults. Verify defaults are updated. 
            ▪ Subtask 6.2.19.6: Call DELETE /api/customer/addresses/:addressId. Verify deletion (and protection for defaults). 
            ▪ Subtask 6.2.19.7: Test unauthorized access to all address book endpoints. 
        ◦ Task 6.2.20: Manual End-to-End Testing 
            ▪ Subtask 6.2.20.1: Log in as a customer. Navigate to "My Account" -> "Address Book." 
            ▪ Subtask 6.2.20.2: Add 2-3 new addresses, one shipping default, one billing default. Verify they appear correctly. 
            ▪ Subtask 6.2.20.3: Edit an existing address. Verify changes. 
            ▪ Subtask 6.2.20.4: Change default shipping/billing addresses. Verify indicators update. 
            ▪ Subtask 6.2.20.5: Try to delete a default address (should be prevented or require re-setting default). 
            ▪ Subtask 6.2.20.6: Delete a non-default address. Verify it's removed. 
            ▪ Subtask 6.2.20.7: Go to the checkout page. Verify saved addresses are available for selection, and default addresses are pre-selected.
Epic 6: Customer Account Management Enhancements

Epic 6: Customer Account Management Enhancements
Story 6.4: Manage Wishlist
Story: As a registered customer, I want to be able to add products to a personal wishlist, view my wishlist, and remove items from it so that I can save products I'm interested in for later consideration or purchase.
Acceptance Criteria:
    1. A "Add to Wishlist" button/link is available on all product detail pages for logged-in users. 
    2. A "Wishlist" link is available in the user's logged-in navigation (e.g., "My Account" area or header). 
    3. Clicking "Add to Wishlist" on a product page adds the product to the user's wishlist and provides immediate visual feedback (e.g., button changes, notification). 
    4. If the product is already in the wishlist, the button indicates this (e.g., "In Wishlist" or "Remove from Wishlist"). 
    5. Clicking the "Wishlist" link in the navigation takes the customer to their dedicated wishlist page. 
    6. The wishlist page displays a list of all products added by the customer, including: 
        ◦ Product Image 
        ◦ Product Name 
        ◦ Current Price 
        ◦ Stock Availability 
        ◦ (Optional) "Add to Cart" button for each item. 
        ◦ "Remove" button for each item. 
    7. The customer can remove individual items from their wishlist. 
    8. The customer can move items from the wishlist directly to their shopping cart. 
    9. All wishlist actions are securely performed by the authenticated user. 

Granular Tasks & Subtasks for Story 6.4:
    • Frontend Tasks (Storefront & Customer Account Panel):
        ◦ Task 6.4.1: Implement "Add to Wishlist" Button on Product Page 
            ▪ Subtask 6.4.1.1: Modify ProductDetailPage (and potentially product listing cards) to include an "Add to Wishlist" button/icon. 
            ▪ Subtask 6.4.1.2: Ensure the button is only visible if the user is logged in. 
            ▪ Subtask 6.4.1.3: Implement logic to dynamically show "Add to Wishlist" or "In Wishlist / Remove from Wishlist" based on the product's presence in the user's wishlist. 
            ▪ Subtask 6.4.1.4: Implement immediate visual feedback (e.g., toast notification, button state change) on successful addition/removal. 
        ◦ Task 6.4.2: Implement "Wishlist" Navigation Link 
            ▪ Subtask 6.4.2.1: Add a "Wishlist" link to the global header navigation (next to Cart, My Account, etc.) and/or within the CustomerAccountDashboardPage sidebar/tabs. 
            ▪ Subtask 6.4.2.2: (Optional) Display a count of items in the wishlist next to the link. 
        ◦ Task 6.4.3: Implement "Wishlist" Page UI 
            ▪ Subtask 6.4.3.1: Create CustomerWishlistPage component/route (e.g., /account/wishlist). 
            ▪ Subtask 6.4.3.2: Design and implement a grid or list layout to display wishlist products. 
            ▪ Subtask 6.4.3.3: For each product, display Image, Name, Price, Stock Status. 
            ▪ Subtask 6.4.3.4: Add "Add to Cart" and "Remove" buttons for each item. 
            ▪ Subtask 6.4.3.5: Handle empty wishlist state (display "Your wishlist is empty"). 
        ◦ Task 6.4.4: Frontend API Integration: Add/Remove from Wishlist 
            ▪ Subtask 6.4.4.1: Create service/hook to call POST /api/customer/wishlist (to add a product ID). 
            ▪ Subtask 6.4.4.2: Create service/hook to call DELETE /api/customer/wishlist/:productId (to remove). 
        ◦ Task 6.4.5: Frontend API Integration: Fetch Wishlist Content 
            ▪ Subtask 6.4.5.1: Create service/hook to call GET /api/customer/wishlist. 
            ▪ Subtask 6.4.5.2: Display fetched product data, joining with product details (image, price, stock). 
        ◦ Task 6.4.6: Frontend API Integration: Move from Wishlist to Cart 
            ▪ Subtask 6.4.6.1: Create service/hook to call POST /api/customer/cart/add-from-wishlist (or similar, takes product ID). 
            ▪ Subtask 6.4.6.2: On success, remove item from wishlist and update cart count. 
    • Backend Tasks (Customer API):
        ◦ Task 6.4.7: Update User Model for Wishlist 
            ▪ Subtask 6.4.7.1: Modify User schema to include a wishlist array, storing product IDs (e.g., productId: { type: Schema.Types.ObjectId, ref: 'Product' }). 
        ◦ Task 6.4.8: Create Add to Wishlist API Endpoint 
            ▪ Subtask 6.4.8.1: Design and implement POST /api/customer/wishlist. 
            ▪ Subtask 6.4.8.2: Apply customer authentication middleware. 
            ▪ Subtask 6.4.8.3: Receive productId. 
            ▪ Subtask 6.4.8.4: Validate productId exists and is not already in the user's wishlist. 
            ▪ Subtask 6.4.8.5: Add productId to the authenticated user's wishlist array. 
        ◦ Task 6.4.9: Create Remove from Wishlist API Endpoint 
            ▪ Subtask 6.4.9.1: Design and implement DELETE /api/customer/wishlist/:productId. 
            ▪ Subtask 6.4.9.2: Apply customer authentication. 
            ▪ Subtask 6.4.9.3: Validate productId exists and is in the user's wishlist. 
            ▪ Subtask 6.4.9.4: Remove productId from the authenticated user's wishlist array. 
        ◦ Task 6.4.10: Create Get Wishlist Content API Endpoint 
            ▪ Subtask 6.4.10.1: Design and implement GET /api/customer/wishlist. 
            ▪ Subtask 6.4.10.2: Apply customer authentication. 
            ▪ Subtask 6.4.10.3: Fetch the authenticated user's wishlist array. 
            ▪ Subtask 6.4.10.4: Populate (join) product details for each productId in the wishlist (Name, Price, Image, Stock). 
            ▪ Subtask 6.4.10.5: Return the list of populated wishlist items. 
        ◦ Task 6.4.11: Create Add to Cart from Wishlist API Endpoint 
            ▪ Subtask 6.4.11.1: Design and implement POST /api/customer/cart/add-from-wishlist. 
            ▪ Subtask 6.4.11.2: Apply customer authentication. 
            ▪ Subtask 6.4.11.3: Receive productId. 
            ▪ Subtask 6.4.11.4: Validate product existence and availability (stock). 
            ▪ Subtask 6.4.11.5: Add the product (default quantity 1) to the user's active shopping cart. 
            ▪ Subtask 6.4.11.6: Optionally, remove the item from the wishlist after adding to cart (configurable behavior). 
    • Security & Data Integrity Tasks:
        ◦ Task 6.4.12: Secure Wishlist Data 
            ▪ Subtask 6.4.12.1: Ensure a customer can only manage their own wishlist. Prevent access/modification of other users' wishlists. 
            ▪ Subtask 6.4.12.2: Robust server-side validation for product IDs. 
    • Testing Tasks:
        ◦ Task 6.4.13: Write Unit Tests 
            ▪ Subtask 6.4.13.1: Unit tests for backend add/remove wishlist logic (duplicate checks, removal). 
            ▪ Subtask 6.4.13.2: Unit tests for adding to cart from wishlist (stock checks). 
        ◦ Task 6.4.14: Write Integration Tests 
            ▪ Subtask 6.4.14.1: Register a test user. Create several test products. 
            ▪ Subtask 6.4.14.2: Log in as the user. Call POST /api/customer/wishlist to add products. Verify they are added. 
            ▪ Subtask 6.4.14.3: Call GET /api/customer/wishlist. Verify the list of products is returned with details. 
            ▪ Subtask 6.4.14.4: Call DELETE /api/customer/wishlist/:productId. Verify product is removed. 
            ▪ Subtask 6.4.14.5: Test adding a product already in wishlist, or a non-existent product. 
            ▪ Subtask 6.4.14.6: Test unauthenticated access. 
            ▪ Subtask 6.4.14.7: Test POST /api/customer/cart/add-from-wishlist with available and out-of-stock products. Verify cart updates and wishlist behavior. 
        ◦ Task 6.4.15: Manual End-to-End Testing 
            ▪ Subtask 6.4.15.1: Log in as a customer. Browse products. 
            ▪ Subtask 6.4.15.2: On several product detail pages, click "Add to Wishlist." Verify visual feedback. 
            ▪ Subtask 6.4.15.3: Navigate to "My Account" -> "Wishlist." Verify all added products are displayed with their correct details (price, stock). 
            ▪ Subtask 6.4.15.4: Test "Remove" button for an item. Verify it disappears. 
            ▪ Subtask 6.4.15.5: Test "Add to Cart" for an item. Verify it's added to cart and potentially removed from wishlist. 
            ▪ Subtask 6.4.15.6: Test adding an out-of-stock product to wishlist and then trying to "Add to Cart" from wishlist (should provide feedback).



            




Epic 6: Customer Account Management Enhancements
Story 6.9: Security Features (2FA, Login Activity)
Story: As a registered customer, I want to be able to enable/disable Two-Factor Authentication (2FA) for my account and view a log of my recent login activity so that I can add an extra layer of security and monitor for suspicious access.
Acceptance Criteria:
    1. A "Security" link is available in the "My Account" navigation. 
    2. Clicking the "Security" link takes the customer to a page dedicated to account security settings. 
    3. The "Security" page prominently displays the current 2FA status (Enabled/Disabled). 
    4. Two-Factor Authentication (2FA) Setup/Management: 
        ◦ Enable 2FA: The customer can initiate a process to enable 2FA, which involves: 
            ▪ Choosing an authentication method (e.g., authenticator app - TOTP, SMS verification - if supported). 
            ▪ For authenticator app: Displaying a QR code and a secret key for manual entry. 
            ▪ Prompting the user to enter a verification code from their authenticator app to confirm setup. 
            ▪ Generating and displaying a set of recovery codes to the user, with instructions to save them securely. 
        ◦ Disable 2FA: The customer can disable 2FA after providing their password and/or a current 2FA code for verification. 
        ◦ Manage 2FA: Options to generate new recovery codes (invalidating old ones) or reset 2FA (if device lost, typically involving a support process or email verification). 
    5. Login Activity Log: 
        ◦ The "Security" page displays a chronological list of recent login attempts/sessions. 
        ◦ For each entry, the following details are shown: 
            ▪ Date and Time of login. 
            ▪ IP Address. 
            ▪ Estimated Location (city/country based on IP, if lookup is implemented). 
            ▪ Device/Browser (User Agent string). 
            ▪ Status (e.g., "Successful," "Failed"). 
        ◦ The login activity log is paginated. 
    6. Upon successful 2FA setup or change, a confirmation message is displayed. 
    7. If 2FA is enabled, login attempts require both password and a 2FA code. 
    8. Relevant security events (e.g., failed 2FA attempts, 2FA status changes) are logged securely in the backend. 

Granular Tasks & Subtasks for Story 6.9:
    • Frontend Tasks (Customer Account Panel):
        ◦ Task 6.9.1: Implement "Security" Navigation Link & Page 
            ▪ Subtask 6.9.1.1: Add a "Security" link to the CustomerAccountDashboardPage sidebar/tabs. 
            ▪ Subtask 6.9.1.2: Create CustomerSecurityPage component/route (e.g., /account/security). 
            ▪ Subtask 6.9.1.3: Design a layout for 2FA management section and Login Activity Log section. 
        ◦ Task 6.9.2: Implement 2FA Setup UI (Authenticator App - TOTP) 
            ▪ Subtask 6.9.2.1: Display current 2FA status (Enabled/Disabled). 
            ▪ Subtask 6.9.2.2: Implement an "Enable 2FA" button. 
            ▪ Subtask 6.9.2.3: Implement a step-by-step wizard/modal for 2FA setup: 
                • Step 1: Display instructions, QR code (generated from secret), and secret key. 
                • Step 2: Input field for verification code from authenticator app. 
                • Step 3: Display recovery codes with strong warning and instructions to save. 
                • Subtask 6.9.2.4: Implement "Disable 2FA" button, requiring password and 2FA code. 
        ◦ Task 6.9.3: Implement Login Activity Log UI 
            ▪ Subtask 6.9.3.1: Design and implement a table to display recent login entries. 
            ▪ Subtask 6.9.3.2: Display Date/Time, IP Address, Location (if available), Device/Browser, Status. 
            ▪ Subtask 6.9.3.3: Implement pagination for the log. 
        ◦ Task 6.9.4: Frontend API Integration: 2FA Management 
            ▪ Subtask 6.9.4.1: Create service/hook for POST /api/customer/security/2fa/generate-secret (to get QR code data). 
            ▪ Subtask 6.9.4.2: Create service/hook for POST /api/customer/security/2fa/verify-enable (to confirm setup with user's code). 
            ▪ Subtask 6.9.4.3: Create service/hook for POST /api/customer/security/2fa/disable (requires password/code). 
            ▪ Subtask 6.9.4.4: Create service/hook for GET /api/customer/security/2fa/recovery-codes (to view/generate new codes - careful security, only if strict verification is done). 
        ◦ Task 6.9.5: Frontend API Integration: Fetch Login Activity 
            ▪ Subtask 6.9.5.1: Create service/hook to call GET /api/customer/security/login-activity. 
            ▪ Subtask 6.9.5.2: Display fetched login entries. 
    • Backend Tasks (Customer API & Security Service):
        ◦ Task 6.9.6: Update User Model for 2FA & Login Activity 
            ▪ Subtask 6.9.6.1: Add has2FAEnabled: { type: Boolean, default: false } to User schema. 
            ▪ Subtask 6.9.6.2: Add twoFactorSecret: { type: String, select: false } to User schema (should be encrypted at rest). 
            ▪ Subtask 6.9.6.3: Add twoFactorRecoveryCodes: [{ type: String, select: false }] to User schema (hashed and encrypted at rest). 
            ▪ Subtask 6.9.6.4: Add loginActivity: [{ ipAddress: String, location: String, userAgent: String, timestamp: Date, status: String }] to User schema. 
        ◦ Task 6.9.7: Implement 2FA Secret Generation Endpoint 
            ▪ Subtask 6.9.7.1: Design and implement POST /api/customer/security/2fa/generate-secret. 
            ▪ Subtask 6.9.7.2: Apply customer authentication. 
            ▪ Subtask 6.9.7.3: Generate a new TOTP secret (e.g., using speakeasy or otplib library). 
            ▪ Subtask 6.9.7.4: Store the encrypted secret temporarily on the user session or in a pending state. 
            ▪ Subtask 6.9.7.5: Return the secret and QR code URL to the frontend. 
        ◦ Task 6.9.8: Implement 2FA Verification and Enable Endpoint 
            ▪ Subtask 6.9.8.1: Design and implement POST /api/customer/security/2fa/verify-enable. 
            ▪ Subtask 6.9.8.2: Apply customer authentication. 
            ▪ Subtask 6.9.8.3: Receive the code from the user. 
            ▪ Subtask 6.9.8.4: Verify the code against the user's pending 2FA secret. 
            ▪ Subtask 6.9.8.5: If successful, generate unique recoveryCodes (hash and encrypt them). 
            ▪ Subtask 6.9.8.6: Update User document: set has2FAEnabled: true, save encrypted twoFactorSecret and twoFactorRecoveryCodes. 
            ▪ Subtask 6.9.8.7: Return the raw (unhashed) recovery codes to the user once. 
            ▪ Subtask 6.9.8.8: Audit Logging: Log 2FA enabled. 
        ◦ Task 6.9.9: Implement 2FA Disable Endpoint 
            ▪ Subtask 6.9.9.1: Design and implement POST /api/customer/security/2fa/disable. 
            ▪ Subtask 6.9.9.2: Apply customer authentication. 
            ▪ Subtask 6.9.9.3: Receive password and 2FACode. 
            ▪ Subtask 6.9.9.4: Verify password and 2FACode. 
            ▪ Subtask 6.9.9.5: Update User document: set has2FAEnabled: false, clear twoFactorSecret and twoFactorRecoveryCodes. 
            ▪ Subtask 6.9.9.6: Audit Logging: Log 2FA disabled. 
        ◦ Task 6.9.10: Implement Login Activity Logging Middleware/Service 
            ▪ Subtask 6.9.10.1: Create a middleware or service that logs every successful and failed login attempt. 
            ▪ Subtask 6.9.10.2: Capture IP address, user agent, timestamp, and success/failure status. 
            ▪ Subtask 6.9.10.3: Store this activity in the User document's loginActivity array (consider capping history length). 
            ▪ Subtask 6.9.10.4: Integrate with a geo-IP lookup service (e.g., MaxMind GeoLite2) to get estimated location from IP. 
        ◦ Task 6.9.11: Create Get Login Activity API Endpoint 
            ▪ Subtask 6.9.11.1: Design and implement GET /api/customer/security/login-activity. 
            ▪ Subtask 6.9.11.2: Apply customer authentication. 
            ▪ Subtask 6.9.11.3: Fetch the authenticated user's loginActivity array. 
            ▪ Subtask 6.9.11.4: Implement pagination. 
            ▪ Subtask 6.9.11.5: Return the log entries. 
        ◦ Task 6.9.12: Modify Login Endpoint for 2FA 
            ▪ Subtask 6.9.12.1: Update the existing POST /api/auth/login endpoint. 
            ▪ Subtask 6.9.12.2: After successful password verification: 
                • If has2FAEnabled is true, return a "2FA_REQUIRED" status/flag in the response. Do not issue a full JWT yet. 
                • If 2FA is not enabled, proceed with standard login (issue JWT). 
            ▪ Subtask 6.9.12.3: Create a new endpoint POST /api/auth/2fa-verify that receives the 2FA code and issues the full JWT if valid. 
    • Security & Data Integrity Tasks (Highly Critical!):
        ◦ Task 6.9.13: Secure 2FA Secrets & Recovery Codes 
            ▪ Subtask 6.9.13.1: Encrypt twoFactorSecret and twoFactorRecoveryCodes at rest in the database. 
            ▪ Subtask 6.9.13.2: Ensure recovery codes are only displayed once to the user during setup. Never retrieve them again via API. 
            ▪ Subtask 6.9.13.3: Implement brute-force protection for 2FA code verification. 
        ◦ Task 6.9.14: Strong Authentication & Authorization 
            ▪ Subtask 6.9.14.1: Ensure all security-related endpoints are protected by robust customer authentication. 
            ▪ Subtask 6.9.14.2: Prevent a user from accessing or modifying another user's security settings or login activity. 
        ◦ Task 6.9.15: Server-Side Time Sync 
            ▪ Subtask 6.9.15.1: Ensure the server's time is synchronized with NTP for accurate TOTP verification. 
    • Testing Tasks:
        ◦ Task 6.9.16: Write Unit Tests 
            ▪ Subtask 6.9.16.1: Unit tests for TOTP secret generation, verification, and recovery code hashing. 
            ▪ Subtask 6.9.16.2: Unit tests for login activity logging (capturing IP, UA). 
        ◦ Task 6.9.17: Write Integration Tests 
            ▪ Subtask 6.9.17.1: Register a test user. 
            ▪ Subtask 6.9.17.2: Log in. Call POST /api/customer/security/2fa/generate-secret. Verify secret and QR data. 
            ▪ Subtask 6.9.17.3: Simulate 2FA setup: Call POST /api/customer/security/2fa/verify-enable with valid/invalid codes. Verify 2FA status update and recovery codes returned. 
            ▪ Subtask 6.9.17.4: Test login flow with 2FA enabled (initial password, then separate 2FA code verification). 
            ▪ Subtask 6.9.17.5: Test POST /api/customer/security/2fa/disable with valid/invalid password/code. 
            ▪ Subtask 6.9.17.6: Perform several successful and failed logins. Call GET /api/customer/security/login-activity. Verify log entries and pagination. 
            ▪ Subtask 6.9.17.7: Test unauthorized access to all security endpoints. 
        ◦ Task 6.9.18: Manual End-to-End Testing 
            ▪ Subtask 6.9.18.1: Log in as a customer. Navigate to "My Account" -> "Security." 
            ▪ Subtask 6.9.18.2: Enable 2FA: Follow the steps, use an authenticator app (e.g., Google Authenticator) to scan the QR code, enter the verification code. Verify setup is successful and recovery codes are displayed. Crucially, save recovery codes in a real test scenario. 
            ▪ Subtask 6.9.18.3: Log out. Attempt to log in. Verify 2FA prompt appears after password. Enter 2FA code. Verify successful login. 
            ▪ Subtask 6.9.18.4: Attempt to log in with incorrect 2FA code. 
            ▪ Subtask 6.9.18.5: Disable 2FA: Provide password and 2FA code. Verify 2FA is disabled. 
            ▪ Subtask 6.9.18.6: View Login Activity: Verify recent logins (successful/failed) are displayed with correct details. Test IP location lookup accuracy. 
            ▪ Subtask 6.9.18.7: (If implemented) Use a recovery code to log in if 2FA device is "lost".


Story 6.12: Customer Data Export/Deletion (GDPR Compliance)
Story: As a registered customer, I want to be able to request an export of my personal data and initiate a request for my account to be deleted so that I can exercise my data rights in accordance with privacy regulations (e.g., GDPR, CCPA).
Acceptance Criteria:
    1. A "Data & Privacy" or "Manage My Data" link is available in the "My Account" navigation. 
    2. Clicking the "Data & Privacy" link takes the customer to a page with options for data export and deletion. 
    3. Data Export: 
        ◦ An "Export My Data" button/link is available. 
        ◦ Clicking this button initiates a process to compile the customer's personal data. 
        ◦ The customer is notified (e.g., by email) when their data export is ready for download. 
        ◦ The exported data is provided in a common, machine-readable format (e.g., JSON, CSV). 
        ◦ The export includes: profile information, order history, addresses, payment method tokens (non-sensitive details), wishlist, saved lists, loyalty data, alert subscriptions, and support ticket history. 
    4. Account Deletion: 
        ◦ An "Request Account Deletion" button/link is available. 
        ◦ Clicking this button initiates a deletion request process. 
        ◦ The customer is required to re-authenticate (e.g., enter password) to confirm the deletion request. 
        ◦ A clear warning is displayed about the irreversible nature of deletion (e.g., loss of order history, points, etc.). 
        ◦ The customer is informed about the typical timeframe for deletion and any data retention policies (e.g., data may be retained for legal/tax purposes for X years). 
        ◦ Upon successful request, a confirmation message is displayed, and the customer receives an email notification. 
        ◦ Actual deletion involves a backend process, potentially requiring manual approval or a timed delay, and careful handling of dependent data (e.g., anonymizing order data, deactivating associated records). 
    5. All data export and deletion requests are securely handled and validated against the authenticated user. 

Granular Tasks & Subtasks for Story 6.12:
    • Frontend Tasks (Customer Account Panel):
        ◦ Task 6.12.1: Implement "Data & Privacy" Navigation Link & Page 
            ▪ Subtask 6.12.1.1: Add a "Data & Privacy" link to the CustomerAccountDashboardPage sidebar/tabs. 
            ▪ Subtask 6.12.1.2: Create CustomerPrivacyPage component/route (e.g., /account/privacy). 
            ▪ Subtask 6.12.1.3: Design a layout for the page with clear sections for "Data Export" and "Account Deletion." 
        ◦ Task 6.12.2: Implement "Export My Data" UI 
            ▪ Subtask 6.12.2.1: Add an "Export My Data" button. 
            ▪ Subtask 6.12.2.2: Display an informational message about the process (e.g., "An email will be sent with a download link when your data is ready."). 
            ▪ Subtask 6.12.2.3: Implement client-side call to the export API. 
            ▪ Subtask 6.12.2.4: Show success/error messages. 
        ◦ Task 6.12.3: Implement "Request Account Deletion" UI 
            ▪ Subtask 6.12.3.1: Add a "Request Account Deletion" button. 
            ▪ Subtask 6.12.3.2: Implement a confirmation modal/dialog that: 
                • Clearly warns about data loss and irreversibility. 
                • Requires the customer to re-enter their password for verification. 
                • Informs about the typical deletion timeframe and data retention. 
                • Includes "Confirm Deletion" and "Cancel" buttons. 
            ▪ Subtask 6.12.3.3: Implement client-side call to the deletion request API. 
            ▪ Subtask 6.12.3.4: Show success/error messages, potentially redirecting to a confirmation page or logout. 
    • Backend Tasks (Customer API & Data Processing):
        ◦ Task 6.12.4: Create Data Export Request API Endpoint 
            ▪ Subtask 6.12.4.1: Design and implement POST /api/customer/data/export. 
            ▪ Subtask 6.12.4.2: Apply customer authentication. 
            ▪ Subtask 6.12.4.3: Create a background job/queue entry for data export (to avoid long synchronous requests). 
            ▪ Subtask 6.12.4.4: Return a success message indicating the request is being processed. 
            ▪ Subtask 6.12.4.5: Audit Logging: Log data export request. 
        ◦ Task 6.12.5: Implement Background Data Export Worker 
            ▪ Subtask 6.12.5.1: A dedicated worker process/function that listens for export requests. 
            ▪ Subtask 6.12.5.2: For the given customerId, query all relevant data: User profile, Order history, Address book, PaymentMethod details (non-sensitive), Wishlist, SavedLists, Loyalty data, Alert subscriptions, Ticket history, Reviews (if implemented). 
            ▪ Subtask 6.12.5.3: Format the data into a machine-readable format (e.g., a JSON file for each data type, or a single large JSON/CSV). 
            ▪ Subtask 6.12.5.4: Store the generated export file securely (e.g., temporary storage, S3 bucket with limited access). 
            ▪ Subtask 6.12.5.5: Generate a secure, time-limited download link for the file. 
            ▪ Subtask 6.12.5.6: Send an email to the customer with the download link and instructions. 
            ▪ Subtask 6.12.5.7: Ensure download links expire after a reasonable period (e.g., 24-48 hours). 
        ◦ Task 6.12.6: Create Account Deletion Request API Endpoint 
            ▪ Subtask 6.12.6.1: Design and implement POST /api/customer/data/delete-request. 
            ▪ Subtask 6.12.6.2: Apply customer authentication. 
            ▪ Subtask 6.12.6.3: Receive the customer's password for re-authentication. 
            ▪ Subtask 6.12.6.4: Verify the password. 
            ▪ Subtask 6.12.6.5: Create a record of the deletion request (e.g., in a DeletionRequests collection) with customerId, requestedAt, status (e.g., 'pending', 'processing', 'completed'). 
            ▪ Subtask 6.12.6.6: Send an email confirmation to the customer acknowledging the request and reiterating next steps/timeframes. 
            ▪ Subtask 6.12.6.7: Return a success message to the frontend, indicating the request is processed. 
            ▪ Subtask 6.12.6.8: Invalidate current user session and log out the user. 
            ▪ Subtask 6.12.6.9: Audit Logging: Log account deletion request. 
        ◦ Task 6.12.7: Implement Background Account Deletion Worker/Process 
            ▪ Subtask 6.12.7.1: A dedicated worker/admin process that handles pending deletion requests. 
            ▪ Subtask 6.12.7.2: Implement logic for soft deletion or anonymization for data that needs to be retained for legal/tax purposes (e.g., orders). This means not outright deleting all data. 
            ▪ Subtask 6.12.7.3: For personal data not tied to legal retention (e.g., profile, addresses, wishlist, saved lists, alert subscriptions, support tickets), delete or anonymize it. 
            ▪ Subtask 6.12.7.4: Deactivate the User account (e.g., set isActive: false, isDeleted: true) and clear sensitive User data. 
            ▪ Subtask 6.12.7.5: Update the DeletionRequests record status to 'completed'. 
            ▪ Subtask 6.12.7.6: Send a final email notification to the customer upon completion of deletion. 
        ◦ Task 6.12.8: Data Anonymization/Retention Policy Implementation 
            ▪ Subtask 6.12.8.1: Define what data needs to be retained for legal/tax purposes and for how long. 
            ▪ Subtask 6.12.8.2: Implement strategies for anonymizing retained data (e.g., replacing names/emails with placeholders, zeroing out sensitive fields). 
            ▪ Subtask 6.12.8.3: Ensure no personally identifiable information (PII) remains in retained data beyond the legal necessity. 
    • Security & Compliance Tasks (Highly Critical!):
        ◦ Task 6.12.9: Data Minimization Review 
            ▪ Subtask 6.12.9.1: Review all data collected and stored to ensure only necessary data is kept. 
        ◦ Task 6.12.10: Secure Data Handling for Export 
            ▪ Subtask 6.12.10.1: Ensure export files are generated and stored securely. 
            ▪ Subtask 6.12.10.2: Use secure, one-time or time-limited download links, possibly requiring re-authentication for download. 
        ◦ Task 6.12.11: Comprehensive Audit Logging 
            ▪ Subtask 6.12.11.1: Log all data export and deletion request attempts and their outcomes for compliance. 
        ◦ Task 6.12.12: Legal/Compliance Consultation 
            ▪ Subtask 6.12.12.1: (External Task) Consult with legal experts to ensure the implementation fully complies with GDPR, CCPA, and other relevant privacy regulations. 
    • Testing Tasks:
        ◦ Task 6.12.13: Write Unit Tests 
            ▪ Subtask 6.12.13.1: Unit tests for backend logic for initiating export/deletion requests. 
            ▪ Subtask 6.12.13.2: Unit tests for password re-authentication logic. 
            ▪ Subtask 6.12.13.3: Unit tests for data anonymization routines. 
        ◦ Task 6.12.14: Write Integration Tests 
            ▪ Subtask 6.12.14.1: Register a test user and generate some data (orders, addresses, wishlist items etc.). 
            ▪ Subtask 6.12.14.2: Log in. Call POST /api/customer/data/export. Verify a request is created and a download link email is triggered (mock email sending). 
            ▪ Subtask 6.12.14.3: Simulate the background export worker. Verify the export file is generated correctly and contains expected data. 
            ▪ Subtask 6.12.14.4: Call POST /api/customer/data/delete-request with correct/incorrect password. Verify request creation on success and error on failure. 
            ▪ Subtask 6.12.14.5: Simulate the background deletion worker. Verify user account is deactivated/anonymized, related personal data is removed, and order history is anonymized but retained. 
            ▪ Subtask 6.12.14.6: After deletion, attempt to log in with the deleted account (should fail). 
            ▪ Subtask 6.12.14.7: Test unauthorized access to these endpoints. 
        ◦ Task 6.12.15: Manual End-to-End Testing 
            ▪ Subtask 6.12.15.1: Log in as a customer with existing data. Navigate to "My Account" -> "Data & Privacy." 
            ▪ Subtask 6.12.15.2: Click "Export My Data." Verify the confirmation message. Check email for download link. Download the file and verify its contents. 
            ▪ Subtask 6.12.15.3: Click "Request Account Deletion." Read the warning. Re-enter password. Confirm deletion. Verify success message and customer is logged out. 
            ▪ Subtask 6.12.15.4: Attempt to log in with the deleted account credentials (should fail). 
            ▪ Subtask 6.12.15.5: (Requires Admin access or backend log access) Verify the account and associated personal data has been properly handled (deleted/anonymized) in the database, while non-personal/legal data is retained.

Epic 6: Customer Account Management Enhancements

Story 6.13: Refer a Friend Program Management

Story: As a registered customer, I want to be able to access a unique referral link, share it with friends, track the status of my referrals, and view any rewards I've earned so that I can participate in the store's "Refer a Friend" program and benefit from my referrals.

Acceptance Criteria:

    A "Refer a Friend" or "Referral Program" link is available in the "My Account" navigation (only if the program is active).

    Clicking the "Refer a Friend" link takes the customer to their dedicated referral dashboard.

    The referral dashboard prominently displays:

        The customer's unique referral link/code.

        Easy options to share the link (e.g., direct copy, share via email, social media buttons).

        Clear explanation of the program's benefits for both the referrer and the referred friend (e.g., "Give 10%, Get $10").

    The dashboard includes a section for "Referral Activity" showing:

        List of referred friends (e.g., their email/name, or just "Friend 1", "Friend 2" for privacy).

        Status of each referral (e.g., "Link Shared," "Friend Registered," "Friend Made First Purchase," "Reward Earned").

        Date of activity.

    The dashboard includes a "My Rewards" section showing:

        List of earned rewards (e.g., "$10 Credit," "Free Shipping Coupon").

        Reward code/link (if applicable).

        Expiry date of the reward.

        Status of reward (e.g., "Active," "Redeemed," "Expired").

    The customer receives notifications (e.g., email) when a referred friend makes a qualifying purchase and a reward is earned.

    All referral program data is securely managed and displayed only to the authenticated customer.

Granular Tasks & Subtasks for Story 6.13:

    Frontend Tasks (Customer Account Panel):

        Task 6.13.1: Implement "Refer a Friend" Navigation Link & Page

            Subtask 6.13.1.1: Add a "Refer a Friend" link to the CustomerAccountDashboardPage sidebar/tabs.

            Subtask 6.13.1.2: Conditionally render this link based on whether the referral program is enabled globally.

            Subtask 6.13.1.3: Create CustomerReferralDashboardPage component/route (e.g., /account/referrals).

            Subtask 6.13.1.4: Design a user-friendly layout for the dashboard.

        Task 6.13.2: Implement Referral Link & Sharing UI

            Subtask 6.13.2.1: Display the unique referral link/code clearly.

            Subtask 6.13.2.2: Implement a "Copy Link" button (to clipboard).

            Subtask 6.13.2.3: Implement "Share via Email" button (opens mail client with pre-filled subject/body).

            Subtask 6.13.2.4: Implement social media share buttons (e.g., Facebook, X/Twitter, WhatsApp) that use share URLs.

            Subtask 6.13.2.5: Display program rules and benefits for both referrer and referred.

        Task 6.13.3: Implement Referral Activity Table UI

            Subtask 6.13.3.1: Design and implement a table/list to show "Referral Activity."

            Subtask 6.13.3.2: Display columns for Friend (masked), Status, and Date.

            Subtask 6.13.3.3: Handle empty state for no referrals.

        Task 6.13.4: Implement "My Rewards" Table UI

            Subtask 6.13.4.1: Design and implement a table/list to show "My Rewards."

            Subtask 6.13.4.2: Display columns for Reward Description, Code/Link, Expiry, and Status.

            Subtask 6.13.4.3: Add "Redeem" button if reward is a coupon/link.

            Subtask 6.13.4.4: Handle empty state for no rewards.

        Task 6.13.5: Frontend API Integration: Fetch Referral Data

            Subtask 6.13.5.1: Create service/hook to call GET /api/customer/referrals.

            Subtask 6.13.5.2: This endpoint should return the unique link, activity log, and rewards list.

            Subtask 6.13.5.3: Handle loading states and errors.

    Backend Tasks (Customer API & Referral Program Service):

        Task 6.13.6: Design Referral Data Models

            Subtask 6.13.6.1: Referral Program Settings (Admin): Define global settings (e.g., reward type, amount, conditions).

            Subtask 6.13.6.2: Referrer (User Schema Augmentation): Add referralCode: String (unique, indexed) to User schema.

            Subtask 6.13.6.3: Referral Tracking (Referral Collection):

                referrerId: ObjectId (ref to User).

                referredEmail (if email shared) / referredIP (for tracking).

                referredUserId: ObjectId (ref to User, once registered).

                status: String (e.g., 'pending_registration', 'registered', 'pending_purchase', 'purchase_completed', 'reward_issued').

                referredPurchaseId: ObjectId (ref to Order, if purchase made).

                createdAt, updatedAt.

            Subtask 6.13.6.4: Referral Rewards (Reward Collection or User sub-document):

                customerId: ObjectId (ref to User, for the referrer).

                type: String (e.g., 'discount_coupon', 'store_credit', 'free_shipping').

                value: Number (e.g., 10 for $10, 0.10 for 10%).

                code: String (for coupon codes).

                status: String ('active', 'redeemed', 'expired').

                expiryDate: Date.

                earnedFromReferralId: ObjectId (ref to Referral document).

        Task 6.13.7: Implement Referral Code Generation

            Subtask 6.13.7.1: Logic to generate a unique referral code for each new registered user (or on first access to referral program).

            Subtask 6.13.7.2: Store this referralCode on the User document.

        Task 6.13.8: Create Get Customer Referral Data API Endpoint

            Subtask 6.13.8.1: Design and implement GET /api/customer/referrals.

            Subtask 6.13.8.2: Apply customer authentication.

            Subtask 6.13.8.3: Retrieve the authenticated user's referralCode.

            Subtask 6.13.8.4: Query Referral collection for referrerId matching the authenticated user.

            Subtask 6.13.8.5: Query Reward collection for customerId matching the authenticated user where status is 'active'.

            Subtask 6.13.8.6: Return all referral link, activity, and reward data.

        Task 6.13.9: Implement Referral Tracking Logic (Middleware/Service)

            Subtask 6.13.9.1: Middleware to detect referral codes in URLs (e.g., ?ref=CODE).

            Subtask 6.13.9.2: Store the referrer's referralCode in a cookie/session for a period (e.g., 30-60 days).

            Subtask 6.13.9.3: When a new user registers, check if a referral code is present in cookie/session.

            Subtask 6.13.9.4: If a code is found, validate it against User referralCodes.

            Subtask 6.13.9.5: If valid, create a new Referral document linking the referrer and referred user. Set initial status (e.g., 'registered').

        Task 6.13.10: Implement Reward Earning Logic (Order Processing Integration)

            Subtask 6.13.10.1: Integrate into Order fulfillment/completion process.

            Subtask 6.13.10.2: After a referred friend's first qualifying purchase is completed:

                Update the Referral document status (e.g., to 'purchase_completed').

                Generate a Reward (e.g., discount coupon code) for the referrer based on program rules.

                Store the Reward in the Reward collection (or on the User document).

                Update the Referral document with rewardIssued: true and rewardId.

                Send email notification to the referrer about the earned reward.

        Task 6.13.11: Implement Reward Redemption Logic

            Subtask 6.13.11.1: Integrate reward codes (e.g., coupon codes) into the checkout process (from Epic 3).

            Subtask 6.13.11.2: When a reward is redeemed, update its status to 'redeemed' in the Reward collection.

    Email Notification System Integration:

        Task 6.13.12: Implement Referrer Reward Notification Email

            Subtask 6.13.12.1: Create an email template for notifying referrers about earned rewards.

            Subtask 6.13.12.2: Send this email when a reward is issued (from 6.13.10.2).

        Task 6.13.13: Implement Referred Friend Welcome Email (Optional)

            Subtask 6.13.13.1: When a friend registers via a referral link, send them a welcome email explaining their benefit (e.g., "Here's your X% off coupon for your first purchase!").

    Security & Data Integrity Tasks:

        Task 6.13.14: Secure Referral Data

            Subtask 6.13.14.1: Ensure only the authenticated user can access their own referral data.

            Subtask 6.13.14.2: Implement robust validation for referral codes.

            Subtask 6.13.14.3: Prevent self-referrals (a user cannot refer themselves).

            Subtask 6.13.14.4: Implement fraud detection for referral program abuse (e.g., multiple accounts from same IP, suspicious registration patterns).

    Testing Tasks:

        Task 6.13.15: Write Unit Tests

            Subtask 6.13.15.1: Unit tests for referral code generation.

            Subtask 6.13.15.2: Unit tests for reward generation logic.

            Subtask 6.13.15.3: Unit tests for referral tracking.

        Task 6.13.16: Write Integration Tests

            Subtask 6.13.16.1: Create Referrer_User_A. Get their referral link.

            Subtask 6.13.16.2: Simulate Referrer_User_A sharing link.

            Subtask 6.13.16.3: Simulate Referred_Friend_B registering using Referrer_User_A's link. Verify Referral document created with 'registered' status.

            Subtask 6.13.16.4: Log in as Referrer_User_A. Call GET /api/customer/referrals. Verify referral activity is listed.

            Subtask 6.13.16.5: Simulate Referred_Friend_B making a qualifying first purchase. Verify Referral status updates to 'purchase_completed' and a Reward is issued to Referrer_User_A.

            Subtask 6.13.16.6: Log in as Referrer_User_A again. Call GET /api/customer/referrals. Verify the reward is listed.

            Subtask 6.13.16.7: Test reward redemption by Referred_Friend_B at checkout (if that's part of the program).

            Subtask 6.13.16.8: Test unauthenticated access.

            Subtask 6.13.16.9: Test self-referral attempts (should be blocked).

        Task 6.13.17: Manual End-to-End Testing

            Subtask 6.13.17.1: Create a new customer account (Customer A).

            Subtask 6.13.17.2: Log in as Customer A. Navigate to "My Account" -> "Refer a Friend."

            Subtask 6.13.17.3: Copy the referral link.

            Subtask 6.13.17.4: Log out. Open an incognito browser window. Navigate to the copied referral link.

            Subtask 6.13.17.5: Register a new customer account (Customer B) through this link.

            Subtask 6.13.17.6: As Customer B, make a qualifying first purchase.

            Subtask 6.13.17.7: Log in as Customer A. Go to "Refer a Friend." Verify Customer B's activity is logged and the reward is shown.

            Subtask 6.13.17.8: (If applicable) Use the earned reward (e.g., coupon code) for a test purchase by Customer A.

            Subtask 6.13.17.9: Test social media sharing buttons.
            

Epic 6: Customer Account Management Enhancements
Story 6.14: Customer Reviews Dashboard
Story: As a registered customer, I want to be able to view all the product reviews I have submitted and have the option to edit or delete them so that I can manage my contributions and correct any information.
Acceptance Criteria:
    1. A "My Reviews" link is available in the "My Account" navigation. 
    2. Clicking the "My Reviews" link takes the customer to a page listing all their submitted product reviews. 
    3. For each review, the following details are displayed: 
        ◦ Product Image and Name. 
        ◦ My Rating (e.g., stars). 
        ◦ My Review Title and Content. 
        ◦ Date Submitted. 
        ◦ Current Status (e.g., "Approved," "Pending Approval," "Rejected" - if moderation exists). 
        ◦ Options to: 
            ▪ View the full review on the product page. 
            ▪ Edit the review. 
            ▪ Delete the review. 
    4. When editing a review, the customer is presented with a form pre-filled with their original review details (rating, title, content). 
    5. Edited reviews, if moderation is enabled, should go through the same moderation process as new reviews. 
    6. Deleting a review requires a confirmation prompt. 
    7. All review management actions are securely performed by the authenticated user and only for their own reviews. 

Granular Tasks & Subtasks for Story 6.14:
    • Frontend Tasks (Customer Account Panel & Product Page):
        ◦ Task 6.14.1: Implement "My Reviews" Navigation Link & List Page 
            ▪ Subtask 6.14.1.1: Add a "My Reviews" link to the CustomerAccountDashboardPage sidebar/tabs. 
            ▪ Subtask 6.14.1.2: Create CustomerReviewsPage component/route (e.g., /account/reviews). 
            ▪ Subtask 6.14.1.3: Design and implement a layout (e.g., cards or list items) to display review summaries. 
            ▪ Subtask 6.14.1.4: For each review, display Product Image, Name, Rating, Title, partial Content, Date, Status. 
            ▪ Subtask 6.14.1.5: Add "Edit," "Delete," and "View on Product Page" buttons/links for each review. 
            ▪ Subtask 6.14.1.6: Handle empty state for no reviews. 
        ◦ Task 6.14.2: Implement "Edit Review" Form UI 
            ▪ Subtask 6.14.2.1: Create EditReviewForm component (can be a modal or dedicated page, e.g., /account/reviews/:reviewId/edit). 
            ▪ Subtask 6.14.2.2: Pre-fill the form with the existing review's rating, title, and content. 
            ▪ Subtask 6.14.2.3: Implement input fields for rating (e.g., star selector), title, and review content (textarea). 
            ▪ Subtask 6.14.2.4: Add "Save Changes" and "Cancel" buttons. 
        ◦ Task 6.14.3: Implement "Delete Review" Confirmation 
            ▪ Subtask 6.14.3.1: On clicking "Delete," display a confirmation modal/dialog. 
            ▪ Subtask 6.14.3.2: Add "Confirm Delete" and "Cancel" buttons. 
        ◦ Task 6.14.4: Frontend API Integration: Fetch My Reviews 
            ▪ Subtask 6.14.4.1: Create service/hook to call GET /api/customer/reviews. 
            ▪ Subtask 6.14.4.2: Display fetched review data, including associated product details. 
        ◦ Task 6.14.5: Frontend API Integration: Edit Review 
            ▪ Subtask 6.14.5.1: Create service/hook to call PUT /api/customer/reviews/:reviewId. 
            ▪ Subtask 6.14.5.2: Send the updated rating, title, and content. 
            ▪ Subtask 6.14.5.3: Display success/error messages. 
        ◦ Task 6.14.6: Frontend API Integration: Delete Review 
            ▪ Subtask 6.14.6.1: Create service/hook to call DELETE /api/customer/reviews/:reviewId. 
            ▪ Subtask 6.14.6.2: On success, remove the review from the list and display notification. 
    • Backend Tasks (Customer API & Review Service):
        ◦ Task 6.14.7: Update Review Data Model (if necessary) 
            ▪ Subtask 6.14.7.1: Ensure the existing Review schema includes customerId: ObjectId (ref to User), status: String (e.g., 'pending', 'approved', 'rejected'). 
        ◦ Task 6.14.8: Create Get Customer Reviews API Endpoint 
            ▪ Subtask 6.14.8.1: Design and implement GET /api/customer/reviews. 
            ▪ Subtask 6.14.8.2: Apply customer authentication middleware. 
            ▪ Subtask 6.14.8.3: Query Review collection, filtering by authenticated user's ID. 
            ▪ Subtask 6.14.8.4: Populate (join) associated Product details (name, image). 
            ▪ Subtask 6.14.8.5: Return the list of reviews. 
        ◦ Task 6.14.9: Create Edit Review API Endpoint 
            ▪ Subtask 6.14.9.1: Design and implement PUT /api/customer/reviews/:reviewId. 
            ▪ Subtask 6.14.9.2: Apply customer authentication. 
            ▪ Subtask 6.14.9.3: Validate reviewId belongs to the authenticated user. 
            ▪ Subtask 6.14.9.4: Receive updated rating, title, content. 
            ▪ Subtask 6.14.9.5: Implement server-side validation and sanitization for updated content. 
            ▪ Subtask 6.14.9.6: Update the Review document. 
            ▪ Subtask 6.14.9.7: If moderation is enabled, set the status to 'pending' after edit, requiring re-approval. 
            ▪ Subtask 6.14.9.8: Audit Logging: Log review edit. 
        ◦ Task 6.14.10: Create Delete Review API Endpoint 
            ▪ Subtask 6.14.10.1: Design and implement DELETE /api/customer/reviews/:reviewId. 
            ▪ Subtask 6.14.10.2: Apply customer authentication. 
            ▪ Subtask 6.14.10.3: Validate reviewId belongs to the authenticated user. 
            ▪ Subtask 6.14.10.4: Delete the Review document (or soft-delete by setting status to 'deleted'). 
            ▪ Subtask 6.14.10.5: Update product's average rating/review count (if cached). 
            ▪ Subtask 6.14.10.6: Audit Logging: Log review deletion. 
    • Security & Data Integrity Tasks:
        ◦ Task 6.14.11: Strict Authorization for Reviews 
            ▪ Subtask 6.14.11.1: Ensure a customer can only manage their own reviews. Prevent access/modification of other users' reviews. 
            ▪ Subtask 6.14.11.2: Robust server-side input sanitization to prevent XSS in review content. 
    • Testing Tasks:
        ◦ Task 6.14.12: Write Unit Tests 
            ▪ Subtask 6.14.12.1: Unit tests for backend logic of retrieving, editing, and deleting reviews based on customerId. 
            ▪ Subtask 6.14.12.2: Unit tests for input validation and sanitization. 
        ◦ Task 6.14.13: Write Integration Tests 
            ▪ Subtask 6.14.13.1: Register a test user. Submit several reviews for different products (via existing review submission endpoint, if any). 
            ▪ Subtask 6.14.13.2: Log in as the user. Call GET /api/customer/reviews. Verify the submitted reviews are returned. 
            ▪ Subtask 6.14.13.3: Call PUT /api/customer/reviews/:reviewId to edit a review. Verify the review content/rating updates in the database. 
            ▪ Subtask 6.14.13.4: Call DELETE /api/customer/reviews/:reviewId. Verify the review is removed. 
            ▪ Subtask 6.14.13.5: Test attempts to edit/delete another user's review (should fail). 
            ▪ Subtask 6.14.13.6: Test unauthenticated access. 
        ◦ Task 6.14.14: Manual End-to-End Testing 
            ▪ Subtask 6.14.14.1: Log in as a customer. Submit a new review for a product (if possible, through the regular product page review form). 
            ▪ Subtask 6.14.14.2: Navigate to "My Account" -> "My Reviews." Verify the newly submitted review appears. 
            ▪ Subtask 6.14.14.3: Click "Edit" on a review. Change the rating, title, and/or content. Save changes. Verify success message and updated review in the list. 
            ▪ Subtask 6.14.14.4: Click "Delete" on a review. Confirm deletion. Verify the review disappears from the list. 
            ▪ Subtask 6.14.14.5: Navigate to the product page of a deleted review and verify it's no longer visible there. 
            ▪ Subtask 6.14.14.6: (If moderation is enabled) Edit a review and ve
Epic 6: Customer Account Management Enhancements
Story 6.15: Multi-Factor Authentication (Advanced - WebAuthn/FIDO2)
Story: As a registered customer, I want to be able to register and manage multiple WebAuthn (FIDO2) authenticators (e.g., Touch ID, Windows Hello, YubiKey) for my account so that I can use modern, phishing-resistant multi-factor authentication methods for enhanced security and convenience.
Acceptance Criteria:
    1. A "Security" link (from 6.9) is enhanced to include "Advanced MFA" options. 
    2. The "Advanced MFA" section displays a list of currently registered WebAuthn authenticators (e.g., "Face ID on MacBook Pro," "My YubiKey"). 
    3. Registering a New Authenticator: 
        ◦ The customer can initiate the registration of a new WebAuthn authenticator. 
        ◦ The process guides the user through browser/OS prompts (e.g., "Touch your security key," "Scan your fingerprint"). 
        ◦ Upon successful registration, the authenticator is added to their list with a user-friendly name (e.g., auto-generated or user-provided). 
        ◦ Recovery codes (from 6.9) are still critical backup and their importance is reiterated. 
    4. Managing Registered Authenticators: 
        ◦ For each registered authenticator, the customer can: 
            ▪ Rename it (e.g., "My Home YubiKey"). 
            ▪ Remove/Deregister it (requires re-authentication using another MFA method or password). 
    5. Login Flow with WebAuthn: 
        ◦ If WebAuthn authenticators are registered, during login (after password or as a passwordless option): 
            ▪ The customer is prompted to use one of their registered authenticators. 
            ▪ The browser/OS handles the WebAuthn challenge. 
            ▪ If successful, the login completes. 
    6. All WebAuthn registration, management, and authentication processes adhere to FIDO2/WebAuthn specifications and best security practices. 
    7. Relevant security events (e.g., authenticator registration/deregistration, failed WebAuthn attempts) are logged securely. 

Granular Tasks & Subtasks for Story 6.15:
    • Frontend Tasks (Customer Account Panel & Login Page):
        ◦ Task 6.15.1: Enhance "Security" Page for WebAuthn Management 
            ▪ Subtask 6.15.1.1: On the CustomerSecurityPage (from 6.9), add a dedicated section for "WebAuthn / Security Keys." 
            ▪ Subtask 6.15.1.2: Display a list of registered authenticators, showing a friendly name and a "Remove" button. 
            ▪ Subtask 6.15.1.3: Add a "Register New Security Key / Biometric Device" button. 
        ◦ Task 6.15.2: Implement WebAuthn Registration Flow UI 
            ▪ Subtask 6.15.2.1: Implement logic to initiate WebAuthn navigator.credentials.create() API call when "Register New..." button is clicked. 
            ▪ Subtask 6.15.2.2: Handle browser/OS prompts for authenticator interaction. 
            ▪ Subtask 6.15.2.3: Prompt user to provide a friendly name for the new authenticator upon successful registration. 
            ▪ Subtask 6.15.2.4: Display success/error messages for registration attempts. 
        ◦ Task 6.15.3: Implement WebAuthn Authenticator Management UI 
            ▪ Subtask 6.15.3.1: For each listed authenticator, add an "Edit" button to rename it. 
            ▪ Subtask 6.15.3.2: For each listed authenticator, add a "Remove" button with a confirmation modal/dialog, requiring re-authentication. 
        ◦ Task 6.15.4: Implement WebAuthn Login Flow UI (Enhance Login) 
            ▪ Subtask 6.15.4.1: Modify LoginPage (from 6.0) to detect if the user has WebAuthn enabled. 
            ▪ Subtask 6.15.4.2: If has2FAEnabled (from 6.9) includes WebAuthn, offer WebAuthn as a 2FA option after password. 
            ▪ Subtask 6.15.4.3: (Optional, for advanced) Offer "Login with Security Key" as a passwordless primary login option. 
            ▪ Subtask 6.15.4.4: Implement logic to initiate WebAuthn navigator.credentials.get() API call during login. 
            ▪ Subtask 6.15.4.5: Handle browser/OS prompts and display success/error messages during login. 
        ◦ Task 6.15.5: Frontend API Integration: WebAuthn Management 
            ▪ Subtask 6.15.5.1: Create service/hook for POST /api/customer/security/webauthn/registration-options (to get server challenge). 
            ▪ Subtask 6.15.5.2: Create service/hook for POST /api/customer/security/webauthn/register-authenticator (to send client response and store). 
            ▪ Subtask 6.15.5.3: Create service/hook for GET /api/customer/security/webauthn/authenticators (to get list). 
            ▪ Subtask 6.15.5.4: Create service/hook for PUT /api/customer/security/webauthn/authenticators/:id (to rename). 
            ▪ Subtask 6.15.5.5: Create service/hook for DELETE /api/customer/security/webauthn/authenticators/:id (to remove). 
    • Backend Tasks (Customer API & WebAuthn Service):
        ◦ Task 6.15.6: Update User Model for WebAuthn Authenticators 
            ▪ Subtask 6.15.6.1: Add webAuthnCredentials: [{ credentialId: Buffer, publicKey: Buffer, transports: [String], counter: Number, friendlyName: String, createdAt: Date }] to User schema. (Buffer for binary data). 
        ◦ Task 6.15.7: Implement WebAuthn Relying Party (RP) Server Logic 
            ▪ Subtask 6.15.7.1: Choose and integrate a robust WebAuthn server library (e.g., @simplewebauthn/server for Node.js). 
            ▪ Subtask 6.15.7.2: Configure Relying Party ID, Origin, etc. 
        ◦ Task 6.15.8: Create WebAuthn Registration Options Endpoint 
            ▪ Subtask 6.15.8.1: Design and implement POST /api/customer/security/webauthn/registration-options. 
            ▪ Subtask 6.15.8.2: Apply customer authentication. 
            ▪ Subtask 6.15.8.3: Generate a WebAuthn registration challenge (using the WebAuthn library). 
            ▪ Subtask 6.15.8.4: Store the challenge securely in session or a temporary store for verification. 
            ▪ Subtask 6.15.8.5: Return the challenge to the frontend. 
        ◦ Task 6.15.9: Create WebAuthn Register Authenticator Endpoint 
            ▪ Subtask 6.15.9.1: Design and implement POST /api/customer/security/webauthn/register-authenticator. 
            ▪ Subtask 6.15.9.2: Apply customer authentication. 
            ▪ Subtask 6.15.9.3: Receive the clientAttestationResponse from the frontend. 
            ▪ Subtask 6.15.9.4: Verify the response against the stored challenge (using the WebAuthn library). 
            ▪ Subtask 6.15.9.5: If valid, extract credentialId, publicKey, counter, transports, and store them on the User document's webAuthnCredentials array. 
            ▪ Subtask 6.15.9.6: Update has2FAEnabled flag (if this is the first MFA method). 
            ▪ Subtask 6.15.9.7: Audit Logging: Log new WebAuthn authenticator registration. 
        ◦ Task 6.15.10: Create Get WebAuthn Authenticators Endpoint 
            ▪ Subtask 6.15.10.1: Design and implement GET /api/customer/security/webauthn/authenticators. 
            ▪ Subtask 6.15.10.2: Apply customer authentication. 
            ▪ Subtask 6.15.10.3: Return the list of registered authenticators (friendly name, id, creation date). 
        ◦ Task 6.15.11: Create Rename WebAuthn Authenticator Endpoint 
            ▪ Subtask 6.15.11.1: Design and implement PUT /api/customer/security/webauthn/authenticators/:id. 
            ▪ Subtask 6.15.11.2: Apply customer authentication. 
            ▪ Subtask 6.15.11.3: Validate authenticator id belongs to the authenticated user. 
            ▪ Subtask 6.15.11.4: Update the friendlyName. 
        ◦ Task 6.15.12: Create Remove WebAuthn Authenticator Endpoint 
            ▪ Subtask 6.15.12.1: Design and implement DELETE /api/customer/security/webauthn/authenticators/:id. 
            ▪ Subtask 6.15.12.2: Apply customer authentication, and potentially require re-authentication (password or another MFA). 
            ▪ Subtask 6.15.12.3: Validate authenticator id belongs to the authenticated user. 
            ▪ Subtask 6.15.12.4: Remove the authenticator from the webAuthnCredentials array. 
            ▪ Subtask 6.15.12.5: If it was the last/only MFA method, update has2FAEnabled accordingly. 
            ▪ Subtask 6.15.12.6: Audit Logging: Log WebAuthn authenticator removal. 
        ◦ Task 6.15.13: Modify Login Endpoint for WebAuthn MFA 
            ▪ Subtask 6.15.13.1: Enhance POST /api/auth/login (from 6.9) to handle WebAuthn challenges. 
            ▪ Subtask 6.15.13.2: If user has WebAuthn credentials, after password verification, return a WebAuthn authenticationOptions challenge. 
            ▪ Subtask 6.15.13.3: Create new endpoint POST /api/auth/webauthn-verify to receive the clientAssertionResponse and verify it against the challenge and stored credentials. 
            ▪ Subtask 6.15.13.4: If valid, issue the full JWT. 
            ▪ Subtask 6.15.13.5: Update the counter for the used authenticator. 
        ◦ Task 6.15.14: (Optional) Implement WebAuthn Passwordless Login 
            ▪ Subtask 6.15.14.1: Create POST /api/auth/webauthn-login-options to initiate login challenge based on username/email. 
            ▪ Subtask 6.15.14.2: Create POST /api/auth/webauthn-login-verify to verify assertion response and issue JWT. 
    • Security & Data Integrity Tasks (Extremely Critical!):
        ◦ Task 6.15.15: WebAuthn Protocol Adherence 
            ▪ Subtask 6.15.15.1: Rigorously follow FIDO2/WebAuthn specifications for challenge generation, response verification, and counter management. 
            ▪ Subtask 6.15.15.2: Ensure server-side verification of all WebAuthn parameters (flags, signatures, rpIdHash, origin, challenge, credentialId, counter). 
        ◦ Task 6.15.16: Secure Storage of Credentials 
            ▪ Subtask 6.15.16.1: Store publicKey and credentialId as binary data (Buffer) and encrypt at rest. 
        ◦ Task 6.15.17: Recovery Mechanism 
            ▪ Subtask 6.15.17.1: Ensure recovery codes (from 6.9) are still the primary backup. Emphasize their importance. 
            ▪ Subtask 6.15.17.2: Implement a secure account recovery process in case all MFA methods are lost/inaccessible (e.g., email verification, support ticket with ID verification). 
    • Testing Tasks:
        ◦ Task 6.15.18: Write Unit Tests 
            ▪ Subtask 6.15.18.1: Unit tests for WebAuthn server-side challenge generation and response verification (mocking client responses). 
            ▪ Subtask 6.15.18.2: Unit tests for authenticator management (add, remove, rename). 
        ◦ Task 6.15.19: Write Integration Tests 
            ▪ Subtask 6.15.19.1: Register a test user. Log in. 
            ▪ Subtask 6.15.19.2: Call POST /api/customer/security/webauthn/registration-options. Simulate client response and call POST /api/customer/security/webauthn/register-authenticator. Verify authenticator is added. 
            ▪ Subtask 6.15.19.3: Call GET /api/customer/security/webauthn/authenticators. Verify the new authenticator is listed. 
            ▪ Subtask 6.15.19.4: Test login flow: Password then WebAuthn authentication. 
            ▪ Subtask 6.15.19.5: Test renaming an authenticator. 
            ▪ Subtask 6.15.19.6: Test removing an authenticator (requires re-auth). 
            ▪ Subtask 6.15.19.7: Test unauthorized access. 
        ◦ Task 6.15.20: Manual End-to-End Testing (Requires physical device/browser support) 
            ▪ Subtask 6.15.20.1: Log in as a customer. Navigate to "My Account" -> "Security." 
            ▪ Subtask 6.15.20.2: Initiate "Register New Security Key / Biometric Device." Follow browser/OS prompts to register Touch ID/Face ID/Windows Hello or a physical FIDO key. Verify success and authenticator appears in the list. 
            ▪ Subtask 6.15.20.3: Log out. Attempt to log in. After password, verify WebAuthn MFA prompt appears. Use the registered authenticator to complete login. 
            ▪ Subtask 6.15.20.4: Test renaming an authenticator. 
            ▪ Subtask 6.15.20.5: Test removing an authenticator. 
            ▪ Subtask 6.15.20.6: (If passwordless is implemented) Test logging in without a password using only a WebAuthn authenticator.



Epic 6: Customer Account Management Enhancements
Story 6.19: Order Tracking Enhancements
Story: As a registered customer, I want to be able to view a detailed, visual, and up-to-date tracking status for my orders, including carrier information and estimated delivery dates, so that I can easily monitor my package's journey without needing to leave the store's website.
Acceptance Criteria:
    1. On the "My Orders" page (from previous stories, e.g., 6.6), each order with a "Shipped" or similar status has a clear "Track Order" button or link. 
    2. Clicking "Track Order" takes the customer to a dedicated "Order Tracking Detail" page for that specific order. 
    3. The "Order Tracking Detail" page displays: 
        ◦ Order Summary: Order Number, Date Placed, Total. 
        ◦ Shipping Information: Shipping Address, Carrier Name, Tracking Number (clickable link to carrier's tracking page as a fallback). 
        ◦ Visual Progress Bar/Timeline: A clear, graphical representation of the package's journey (e.g., "Order Placed" -> "Processing" -> "Shipped" -> "In Transit" -> "Out for Delivery" -> "Delivered"). 
        ◦ Latest Tracking Event: The most recent status update (e.g., "Package arrived at sorting facility," "Out for delivery"). 
        ◦ Detailed Tracking History: A chronological list of all tracking events (date, time, location, status description). 
        ◦ Estimated Delivery Date: If available from the carrier. 
        ◦ Contact Information: Link to customer support regarding the order. 
    4. Tracking information is updated dynamically (e.g., via webhooks from carrier APIs or frequent polling). 
    5. All order tracking details are securely displayed only to the authenticated customer for their own orders. 

Granular Tasks & Subtasks for Story 6.19:
    • Frontend Tasks (Customer Account Panel):
        ◦ Task 6.19.1: Enhance "My Orders" List with "Track Order" Button 
            ▪ Subtask 6.19.1.1: Modify CustomerOrdersPage (from 6.6) to add a "Track Order" button or link next to each relevant order (status like 'Shipped', 'Partial Shipped', etc.). 
            ▪ Subtask 6.19.1.2: Ensure the link points to the new OrderTrackingDetailPage with the orderId. 
        ◦ Task 6.19.2: Implement Order Tracking Detail Page UI 
            ▪ Subtask 6.19.2.1: Create OrderTrackingDetailPage component/route (e.g., /account/orders/:orderId/track). 
            ▪ Subtask 6.19.2.2: Design sections for order summary, shipping details (carrier, tracking number). 
            ▪ Subtask 6.19.2.3: Implement a visual timeline/progress bar component (e.g., using SVG or CSS steps). 
            ▪ Subtask 6.19.2.4: Implement a table or list to display detailed tracking events. 
            ▪ Subtask 6.19.2.5: Display estimated delivery date and latest status prominently. 
            ▪ Subtask 6.19.2.6: Add fallback link to external carrier tracking page. 
            ▪ Subtask 6.19.2.7: Handle loading states and errors (e.g., "Tracking info not available yet"). 
        ◦ Task 6.19.3: Frontend API Integration: Fetch Order Tracking Details 
            ▪ Subtask 6.19.3.1: Create service/hook to call GET /api/customer/orders/:orderId/tracking. 
            ▪ Subtask 6.19.3.2: Map the received tracking data to the UI components (timeline, events). 
    • Backend Tasks (Order Service & Tracking Integration):
        ◦ Task 6.19.4: Update Order Data Model for Tracking Information 
            ▪ Subtask 6.19.4.1: Augment Order schema to include: 
                • trackingNumber: String (nullable). 
                • carrier: String (e.g., 'UPS', 'FedEx', 'DHL'). 
                • trackingURL: String (dynamically generated or provided by carrier). 
                • trackingHistory: [{ status: String, description: String, location: String, timestamp: Date }] (array of tracking events). 
                • estimatedDeliveryDate: Date (optional). 
        ◦ Task 6.19.5: Implement Carrier Tracking API Integration 
            ▪ Subtask 6.19.5.1: Research and select a tracking API aggregator (e.g., AfterShip, EasyPost, ShipStation) or integrate directly with major carriers (UPS, FedEx, DHL, USPS). 
            ▪ Subtask 6.19.5.2: Obtain API keys and credentials for chosen tracking provider(s). 
            ▪ Subtask 6.19.5.3: Implement a service to make API calls to fetch tracking details using carrier and trackingNumber. 
            ▪ Subtask 6.19.5.4: Handle different carrier responses and error codes. 
        ◦ Task 6.19.6: Create Get Order Tracking API Endpoint 
            ▪ Subtask 6.19.6.1: Design and implement GET /api/customer/orders/:orderId/tracking. 
            ▪ Subtask 6.19.6.2: Apply customer authentication. 
            ▪ Subtask 6.19.6.3: Validate orderId belongs to the authenticated user. 
            ▪ Subtask 6.19.6.4: Retrieve the order document. 
            ▪ Subtask 6.19.6.5: If trackingNumber and carrier exist, call the internal Carrier Tracking Service (from 6.19.5.3) to fetch the latest tracking data. 
            ▪ Subtask 6.19.6.6: Store (cache) the fetched tracking history on the Order document or a separate OrderTracking document to reduce external API calls. Define caching strategy (e.g., refresh every 15-30 mins or on webhook). 
            ▪ Subtask 6.19.6.7: Return formatted tracking details. 
        ◦ Task 6.19.7: Integrate Tracking Number Assignment into Order Fulfillment 
            ▪ Subtask 6.19.7.1: Modify the order fulfillment process (e.g., when an admin marks an order as 'Shipped'). 
            ▪ Subtask 6.19.7.2: When the tracking number and carrier are provided, save them to the Order document. 
            ▪ Subtask 6.19.7.3: (Optional, but recommended) Implement webhook listeners from carrier APIs to automatically update trackingHistory when a package status changes. 
            ▪ Subtask 6.19.7.4: Trigger initial tracking status retrieval on shipment. 
    • Data Storage & Performance Tasks:
        ◦ Task 6.19.8: Data Synchronization & Caching Strategy 
            ▪ Subtask 6.19.8.1: Determine how frequently trackingHistory should be updated from carrier APIs (e.g., on page load if old, via background job/webhook). 
            ▪ Subtask 6.19.8.2: Implement caching for tracking data to avoid hitting external APIs too often. 
    • Security & Data Integrity Tasks:
        ◦ Task 6.19.9: Access Control for Order Tracking 
            ▪ Subtask 6.19.9.1: Ensure customers can only track their own orders. 
            ▪ Subtask 6.19.9.2: Validate all inputs (order ID, tracking number). 
        ◦ Task 6.19.10: Handle Carrier API Errors Gracefully 
            ▪ Subtask 6.19.10.1: Implement robust error handling for external carrier API calls (timeouts, rate limits, invalid tracking numbers). 
            ▪ Subtask 6.19.10.2: Provide informative error messages to the customer if tracking is unavailable. 
    • Testing Tasks:
        ◦ Task 6.19.11: Write Unit Tests 
            ▪ Subtask 6.19.11.1: Unit tests for the internal Carrier Tracking Service (mocking external API responses). 
            ▪ Subtask 6.19.11.2: Unit tests for parsing and storing tracking history. 
        ◦ Task 6.19.12: Write Integration Tests 
            ▪ Subtask 6.19.12.1: Place an order. Simulate fulfillment and assignment of a dummy tracking number/carrier. 
            ▪ Subtask 6.19.12.2: Log in as the ordering customer. Call GET /api/customer/orders/:orderId/tracking. Verify initial tracking data is returned. 
            ▪ Subtask 6.19.12.3: Simulate updates from the carrier (e.g., by directly manipulating the trackingHistory in the mock external service or database). Call the API again and verify updated data. 
            ▪ Subtask 6.19.12.4: Test with an invalid orderId or orderId belonging to another user. 
        ◦ Task 6.19.13: Manual End-to-End Testing 
            ▪ Subtask 6.19.13.1: Place a test order (or use an existing one that has been "shipped" with a real/mock tracking number). 
            ▪ Subtask 6.19.13.2: Log in as the customer. Navigate to "My Orders." Click "Track Order" for the relevant order. 
            ▪ Subtask 6.19.13.3: Verify the "Order Tracking Detail" page loads, showing the order summary, carrier, tracking number, and a visual timeline. 
            ▪ Subtask 6.19.13.4: Check if the latest status and detailed history are present. 
            ▪ Subtask 6.19.13.5: Click the tracking number to verify it links to the external carrier's site. 
            ▪ Subtask 6.19.13.6: (If possible) Simulate a real tracking update from a carrier and observe if the page updates. 
            ▪ Subtask 6.19.13.7: Test an order that hasn't shipped yet (should show appropriate message).






Epic 6: Customer Account Management Enhancements
Story 6.34: Order Cancellation Request
Story: As a registered customer, I want to be able to request the cancellation of an eligible order directly from my account's order history, so that I can quickly cancel an order before it's shipped, without needing to contact customer support.
Acceptance Criteria:
    1. On the "Order History" page, for each eligible order, a "Request Cancellation" button/link is visible. 
    2. An order is considered "eligible for cancellation" if it has not yet been processed for shipping (e.g., status is "Pending," "Processing," or "Awaiting Fulfillment" but not "Shipped" or "Completed"). 
    3. Clicking "Request Cancellation" prompts a confirmation dialog outlining the implications and confirming eligibility. 
    4. Upon confirmation, the cancellation request is submitted, and the order status is updated (e.g., "Cancellation Requested"). 
    5. The customer receives an email confirmation that their cancellation request has been received. 
    6. If the cancellation is successful (approved by the system/admin), the order status changes to "Cancelled," and a refund process is initiated (if payment was taken). 
    7. If the cancellation is not possible (e.g., order already shipped), the customer is informed immediately, and the "Request Cancellation" button is hidden or disabled for that order. 
    8. The customer can view the status of their cancellation request on the order details page. 
    9. All cancellation operations are securely performed by the authenticated user and only for their own orders. 

Granular Tasks & Subtasks for Story 6.34:
    • Frontend Tasks (Order History & Order Details Pages):
        ◦ Task 6.34.1: Implement "Request Cancellation" Button on Order History/Details 
            ▪ Subtask 6.34.1.1: Modify CustomerOrderHistoryPage and CustomerOrderDetailsPage components. 
            ▪ Subtask 6.34.1.2: Add a "Request Cancellation" button/link conditionally, based on order eligibility status (e.g., check order.cancellable flag from backend). 
            ▪ Subtask 6.34.1.3: On click, display a confirmation modal with clear text about irreversible action and potential refund process. 
            ▪ Subtask 6.34.1.4: Add "Confirm Cancellation" and "Cancel" buttons to the modal. 
        ◦ Task 6.34.2: Display Cancellation Request Status 
            ▪ Subtask 6.34.2.1: Update CustomerOrderDetailsPage to show the cancellation status (e.g., "Cancellation Requested," "Cancelled," "Cancellation Rejected"). 
            ▪ Subtask 6.34.2.2: Adjust UI based on status (e.g., remove "Request Cancellation" button once requested). 
        ◦ Task 6.34.3: Frontend API Integration: Order Cancellation 
            ▪ Subtask 6.34.3.1: Create service/hook for POST /api/customer/orders/:orderId/cancel-request (to submit cancellation request). 
            ▪ Subtask 6.34.3.2: Ensure GET /api/customer/orders/:orderId returns the cancellable status and current cancellation status. 
    • Backend Tasks (Order Service, Payment Service, Notification Service):
        ◦ Task 6.34.4: Update Order Model for Cancellation Status 
            ▪ Subtask 6.34.4.1: Add fields to the Order schema: 
                • cancellationStatus: String (e.g., 'none', 'requested', 'approved', 'rejected', 'cancelled'). 
                • cancellationRequestedAt: Date (nullable). 
                • cancellationProcessedAt: Date (nullable). 
                • cancellationReason: String (optional, for admin/internal use). 
        ◦ Task 6.34.5: Implement Order Eligibility Logic 
            ▪ Subtask 6.34.5.1: Create a function isOrderCancellable(order) that checks the order's current status (e.g., status !== 'shipped' && status !== 'completed' && cancellationStatus === 'none'). 
            ▪ Subtask 6.34.5.2: This logic should be used by the GET /api/customer/orders/:orderId endpoint to populate the cancellable flag. 
        ◦ Task 6.34.6: Create Order Cancellation Request API Endpoint 
            ▪ Subtask 6.34.6.1: Design and implement POST /api/customer/orders/:orderId/cancel-request. 
            ▪ Subtask 6.34.6.2: Apply customer authentication. 
            ▪ Subtask 6.34.6.3: Verify orderId belongs to the authenticated user. 
            ▪ Subtask 6.34.6.4: Call isOrderCancellable(order). If not cancellable, return an error. 
            ▪ Subtask 6.34.6.5: Update order.cancellationStatus to 'requested' and set cancellationRequestedAt. 
            ▪ Subtask 6.34.6.6: Send a confirmation email to the customer ("Your cancellation request for Order #XYZ has been received."). 
            ▪ Subtask 6.34.6.7: (Optional) Send an internal notification to customer support/fulfillment team. 
        ◦ Task 6.34.7: Implement Order Cancellation Processing Logic 
            ▪ Subtask 6.34.7.1: Automated Cancellation (if applicable): For simple orders that meet specific criteria (e.g., no items packed yet), implement immediate automated cancellation: 
                • Update order.cancellationStatus to 'cancelled'. 
                • Set cancellationProcessedAt. 
                • Call Payment Service to initiate a full refund. 
                • Update inventory levels for cancelled items. 
                • Send "Order Cancelled" confirmation email. 
            ▪ Subtask 6.34.7.2: Manual Review/Admin Approval: For complex orders or if automation is not feasible, the 'requested' status will require an admin to review and manually approve/reject. 
                • Develop a corresponding admin endpoint/UI for this (e.g., PUT /api/admin/orders/:orderId/process-cancellation). 
                • This admin action would then trigger the refund, inventory update, and email as above. 
        ◦ Task 6.34.8: Integrate with Payment Gateway for Refunds 
            ▪ Subtask 6.34.8.1: Implement a refund function in the Payment Service (if not already done). 
            ▪ Subtask 6.34.8.2: Call this function when a cancellation is approved/processed. 
        ◦ Task 6.34.9: Integrate with Inventory Management 
            ▪ Subtask 6.34.9.1: Ensure that when an order is cancelled, the stock of the items in that order is correctly returned to inventory. 
    • Security & Data Integrity Tasks:
        ◦ Task 6.34.10: Access Control 
            ▪ Subtask 6.34.10.1: Ensure customers can only request cancellation for their own orders. 
        ◦ Task 6.34.11: Prevent Race Conditions 
            ▪ Subtask 6.34.11.1: Ensure that an order cannot be processed for shipping and cancelled simultaneously. Use locking mechanisms or careful transaction management. 
    • Testing Tasks:
        ◦ Task 6.34.12: Write Unit Tests 
            ▪ Subtask 6.34.12.1: Unit tests for isOrderCancellable logic. 
            ▪ Subtask 6.34.12.2: Unit tests for cancellation request and status updates. 
            ▪ Subtask 6.34.12.3: Unit tests for refund initiation and inventory return (mocking external services). 
        ◦ Task 6.34.13: Write Integration Tests 
            ▪ Subtask 6.34.13.1: Register a test user. Place a new order (status 'Pending'). 
            ▪ Subtask 6.34.13.2: Call GET /api/customer/orders/:orderId. Verify cancellable is true. 
            ▪ Subtask 6.34.13.3: Call POST /api/customer/orders/:orderId/cancel-request. Verify order status changes to 'Cancellation Requested' and email is sent. 
            ▪ Subtask 6.34.13.4: Simulate the automated cancellation (or admin approval). Verify status changes to 'Cancelled', refund is initiated, and inventory is updated. 
            ▪ Subtask 6.34.13.5: Place another order. Update its status to 'Shipped' manually. 
            ▪ Subtask 6.34.13.6: Attempt to call POST /api/customer/orders/:orderId/cancel-request on the 'Shipped' order. Verify it's rejected as not cancellable. 
            ▪ Subtask 6.34.13.7: Test unauthorized access. 
        ◦ Task 6.34.14: Manual End-to-End Testing 
            ▪ Subtask 6.34.14.1: Log in as a customer. Place a new order. 
            ▪ Subtask 6.34.14.2: Go to "My Account" -> "Order History." Click on the new order. 
            ▪ Subtask 6.34.14.3: Verify "Request Cancellation" button is visible. Click it. Confirm. 
            ▪ Subtask 6.34.14.4: Verify order status updates to "Cancellation Requested." Check email for confirmation. 
            ▪ Subtask 6.34.14.5: (If automated) Verify status changes to "Cancelled" shortly after. Check email for cancellation confirmation. 
            ▪ Subtask 6.34.14.6: Place another order, wait for it to be marked as "Shipped" by an admin or fulfillment system. 
            ▪ Subtask 6.34.14.7: Go to its order details page. Verify "Request Cancellation" is either hidden or disabled. 
            ▪ Subtask 6.34.14.8: If you try to cancel a non-cancellable order, verify an appropriate error message is shown.


Epic 13: Returns Management & RMA
Epic Goal: To streamline the process of managing customer returns, exchanges, and refunds, providing a clear and efficient experience for both customers and operations staff, thereby improving customer satisfaction, reducing operational overhead, and ensuring accurate inventory and financial reconciliation.
Let's begin with the starting point of most returns: Customer Initiated Return Request.
Story 13.101: Customer Initiated Return Request
Story: As a customer, I want to easily initiate a return request for eligible items from my order directly through my account, so that I can provide the necessary details and receive instructions for sending back the merchandise.
Acceptance Criteria:
    1. Online Return Request Form: 
        ◦ Customers can access a "Request a Return" option from their "Order Details" page within their account. 
        ◦ The form allows selecting eligible items from a specific order. 
        ◦ For each selected item, the customer can specify: 
            ▪ Quantity to return. 
            ▪ Return reason (e.g., "Too big," "Defective," "Changed mind," "Wrong item received") from a predefined list. 
            ▪ Return action requested (e.g., "Refund," "Exchange," "Store Credit"). 
            ▪ (Optional) Comments/details regarding the return reason. 
            ▪ (Optional) Upload photos for damaged/defective items. 
    2. Return Eligibility Logic: 
        ◦ Only items from orders that are within a configurable return window (e.g., 30 days from delivery) are eligible for return. 
        ◦ Only items that have not already been returned/refunded are eligible. 
        ◦ Configurable rules can mark certain products/categories as non-returnable (e.g., digital goods, final sale items). 
    3. Return Request Submission & Confirmation: 
        ◦ Upon submission, the return request is formally logged in the system with a unique RMA (Return Merchandise Authorization) number. 
        ◦ The customer receives an immediate on-screen confirmation of their request. 
        ◦ An automated email confirmation is sent to the customer, including the RMA number and next steps. 
    4. Admin Notification: 
        ◦ Operations staff are notified of new return requests (e.g., via email, a notification in the admin panel). 
    5. Return Status Tracking (Basic): 
        ◦ The customer can view the status of their return request in their account (e.g., "Pending Approval," "Approved," "Received," "Refunded"). 
    6. Order-Item Level Return Tracking: 
        ◦ The system associates the return request directly with the specific order and order items being returned. 
    7. International Returns (Basic Consideration): 
        ◦ Initial consideration for international returns (e.g., providing a note about customs documents needed for return, but not necessarily generating return labels yet). 

Granular Tasks & Subtasks for Story 13.101:
    • Discovery & Design Tasks:
        ◦ Task 13.101.1: Define Return Policy Parameters 
            ▪ Subtask 13.101.1.1: Establish the default return window (e.g., X days from delivery date). 
            ▪ Subtask 13.101.1.2: Identify product types/categories that are non-returnable. 
            ▪ Subtask 13.101.1.3: Define standard return reasons and requested actions. 
        ◦ Task 13.101.2: Design Customer Return Request UI 
            ▪ Subtask 13.101.2.1: Sketch the "Request a Return" page layout within the customer account. 
            ▪ Subtask 13.101.2.2: Design the form elements for selecting items, quantities, reasons, and actions. 
            ▪ Subtask 13.101.2.3: Design the confirmation message and email template. 
    • Backend Tasks (Order Service, Customer Service, Returns Service, Admin Service, Notification Service):
        ◦ Task 13.101.3: Implement Return Models 
            ▪ Subtask 13.101.3.1: Create ReturnRequest schema: id (RMA number), customerId, orderId, status (e.g., PENDING, APPROVED, REJECTED, RECEIVED, COMPLETED), requestDate, approvalDate, resolutionDate, notes (admin only). 
            ▪ Subtask 13.101.3.2: Create ReturnItem schema: returnRequestId, orderItemId, productId, sku, quantity, returnReason, requestedAction, photoUrls (array, optional). 
        ◦ Task 13.101.4: Develop Return Eligibility Logic 
            ▪ Subtask 13.101.4.1: Extend Order Service or create a ReturnsEligibilityService to determine if an orderItem is eligible for return: 
                • Check deliveryDate (or orderDate) against configured returnWindowDays. 
                • Check if orderItem is already part of a return. 
                • Check product.isReturnable flag (new field on Product schema). 
                • Check if product.category is excluded from returns. 
        ◦ Task 13.101.5: Implement Return Request Submission API 
            ▪ Subtask 13.101.5.1: POST /api/customer/returns/request: 
                • Accepts orderId and an array of items with orderItemId, quantity, reason, action. 
                • Validates eligibility for each item. 
                • Generates a unique RMA number. 
                • Saves ReturnRequest and ReturnItem records. 
                • Sets initial status to PENDING. 
                • Returns the RMA number and confirmation. 
        ◦ Task 13.101.6: Develop Return Request Status Management 
            ▪ Subtask 13.101.6.1: GET /api/customer/returns/:rmaId: Returns details and status of a specific ReturnRequest. 
            ▪ Subtask 13.101.6.2: GET /api/customer/returns: Returns a list of all ReturnRequest for the logged-in customer. 
        ◦ Task 13.101.7: Integrate with Notification Service 
            ▪ Subtask 13.101.7.1: Trigger SEND_RETURN_REQUEST_CONFIRMATION_EMAIL to customer upon successful submission. 
            ▪ Subtask 13.101.7.2: Trigger SEND_ADMIN_RETURN_REQUEST_NOTIFICATION to operations staff. 
        ◦ Task 13.101.8: Extend Product Schema for Returnability 
            ▪ Subtask 13.101.8.1: Add a boolean field isReturnable to Product schema, defaulting to true. 
            ▪ Subtask 13.101.8.2: (Optional) Add returnPolicy (text field) to Product for specific return instructions. 
    • Frontend Tasks (Customer Account, Admin Panel):
        ◦ Task 13.101.9: Update Customer Order Details Page 
            ▪ Subtask 13.101.9.1: On the "Order Details" page (from Epic 8), add a "Request a Return" button next to eligible orders. 
            ▪ Subtask 13.101.9.2: Implement conditional display based on returnWindowDays and product.isReturnable. 
        ◦ Task 13.101.10: Create Customer Return Request Form UI 
            ▪ Subtask 13.101.10.1: Build the form for selecting items, quantities, reasons (dropdown from predefined list), and requested actions (radio buttons/dropdown). 
            ▪ Subtask 13.101.10.2: Implement logic to dynamically show/hide items based on eligibility. 
            ▪ Subtask 13.101.10.3: Implement photo upload functionality (integrating with image storage service). 
            ▪ Subtask 13.101.10.4: Handle form submission and display immediate confirmation. 
        ◦ Task 13.101.11: Create Customer "My Returns" Page 
            ▪ Subtask 13.101.11.1: Create a new page "My Returns" under the customer's account dashboard. 
            ▪ Subtask 13.101.11.2: Display a list of all ReturnRequest (from GET /api/customer/returns), showing RMA number, order ID, request date, and current status. 
            ▪ Subtask 13.101.11.3: Allow clicking on an RMA number to view detailed status and ReturnItem breakdown (from GET /api/customer/returns/:rmaId). 
        ◦ Task 13.101.12: Update Product Admin for Returnability 
            ▪ Subtask 13.101.12.1: In the "Add/Edit Product" form, add a checkbox for Is Returnable. 
            ▪ Subtask 13.101.12.2: (Optional) Add a text area for Return Policy specific to the product. 
        ◦ Task 13.101.13: Basic Admin View for New Return Requests 
            ▪ Subtask 13.101.13.1: Create a basic list view in the admin panel (e.g., under "Orders" or a new "Returns" section) showing PENDING return requests. 
    • Testing Tasks:
        ◦ Task 13.101.14: Write Unit Tests (Backend) 
            ▪ Subtask 13.101.14.1: Unit tests for ReturnsEligibilityService (e.g., within/outside window, non-returnable product). 
            ▪ Subtask 13.101.14.2: Unit tests for RMA number generation. 
            ▪ Subtask 13.101.14.3: Unit tests for POST /api/customer/returns/request with valid/invalid data. 
        ◦ Task 13.101.15: Write Integration Tests 
            ▪ Subtask 13.101.15.1: Create a test order with multiple items. 
            ▪ Subtask 13.101.15.2: Simulate a customer initiating a return for some items. Verify ReturnRequest and ReturnItem records are created correctly. 
            ▪ Subtask 13.101.15.3: Verify email notifications are triggered. 
            ▪ Subtask 13.101.15.4: Attempt to return an item outside the return window. Verify it's blocked. 
            ▪ Subtask 13.101.15.5: Mark a product as non-returnable. Attempt to return it. Verify it's blocked. 
        ◦ Task 13.101.16: Manual End-to-End Testing: 
            ▪ Subtask 13.101.16.1: Customer: Log in. Place an order. Mark it as "delivered" (or simulate delivery date). 
            ▪ Subtask 13.101.16.2: Go to "My Orders". Select the recent order. Click "Request a Return". 
            ▪ Subtask 13.101.16.3: Select 1 item, reason "Damaged", action "Refund". Submit. Verify on-screen confirmation with RMA. 
            ▪ Subtask 13.101.16.4: Check email for confirmation. 
            ▪ Subtask 13.101.16.5: Go to "My Returns" page. Verify the request is listed with "Pending Approval" status. 
            ▪ Subtask 13.101.16.6: Admin: Log in. Check for new return request notifications. Go to the admin "Returns" list. Verify the new request is there. 
            ▪ Subtask 13.101.16.7: Try to initiate a return for an order that's too old or for a non-returnable product. Verify appropriate error messages. 
            ▪ Subtask 13.101.16.8: (If photo upload) Upload a test photo during request and verify it's associated.
Epic 13: Returns Management & RMA
Story 13.102: Admin Return Request Approval & Processing
Story: As an operations staff member, I want to review, approve, or reject customer return requests, provide specific return instructions, and manage their status, so that I can efficiently process returns and ensure customers receive clear guidance.
Acceptance Criteria:
    1. Admin Return Request List: 
        ◦ A dedicated section in the admin panel lists all return requests, with filtering capabilities by status (e.g., "Pending Approval," "Approved," "Rejected"), customer, and RMA number. 
        ◦ Key information visible at a glance: RMA number, customer, order ID, request date, current status. 
    2. Admin Return Request Detail View: 
        ◦ Clicking on a return request in the list opens a detailed view showing: 
            ▪ All ReturnRequest and ReturnItem details (from 13.101). 
            ▪ Customer information and linked order details. 
            ▪ (If photos uploaded) Ability to view uploaded photos. 
            ▪ An audit log of status changes and actions taken on the return request. 
    3. Approve/Reject Workflow: 
        ◦ Approve: 
            ▪ Option to "Approve" the entire return request or individual ReturnItems within the request. 
            ▪ When approving, ability to: 
                • Add internal notes (not visible to customer). 
                • Add customer-facing instructions (e.g., "Package securely," "Ship to address X," "Include original packaging"). 
                • Select return shipping method (e.g., customer responsible for shipping, pre-paid label - actual label generation is 13.104). 
            ▪ Changes ReturnRequest status to "Approved". 
        ◦ Reject: 
            ▪ Option to "Reject" the entire return request or individual ReturnItems. 
            ▪ When rejecting, ability to: 
                • Provide a mandatory reason for rejection (visible to customer). 
                • Add internal notes. 
            ▪ Changes ReturnRequest status to "Rejected". 
    4. Automated Status Updates: 
        ◦ The system automatically updates the ReturnRequest status based on admin actions. 
    5. Customer Communication: 
        ◦ Automated email notifications are sent to the customer upon: 
            ▪ Approval: Including RMA number, approved items, return instructions, and a link to their "My Returns" page. 
            ▪ Rejection: Including RMA number, rejected items, and the reason for rejection. 
    6. Search & Filtering: 
        ◦ Admin can search for returns by RMA number, order ID, or customer name/email. 
    7. Bulk Actions (Optional): 
        ◦ Ability to approve/reject multiple pending requests (e.g., all valid, low-risk requests). 

Granular Tasks & Subtasks for Story 13.102:
    • Backend Tasks (Returns Service, Admin Service, Notification Service):
        ◦ Task 13.102.1: Enhance Return Request Status Management API 
            ▪ Subtask 13.102.1.1: PUT /api/admin/returns/:rmaId/status: 
                • Accepts newStatus (e.g., APPROVED, REJECTED). 
                • Accepts internalNotes, customerInstructions (for APPROVED), rejectionReason (for REJECTED). 
                • Validates status transitions (e.g., can't go from REJECTED to APPROVED directly). 
                • Updates ReturnRequest record. 
                • (Optional) Accepts specific returnItemIds for partial approval/rejection. 
                • Returns updated ReturnRequest details. 
            ▪ Subtask 13.102.1.2: Implement GET /api/admin/returns (list all returns) and GET /api/admin/returns/:rmaId (single return detail) APIs with necessary filters and sorting. 
        ◦ Task 13.102.2: Implement Audit Logging for Returns 
            ▪ Subtask 13.102.2.1: Enhance ReturnRequest schema or create a ReturnAuditLog schema to record: rmaId, action (e.g., STATUS_CHANGE), oldStatus, newStatus, actorId (admin user), timestamp, notes (internal). 
            ▪ Subtask 13.102.2.2: Ensure PUT /api/admin/returns/:rmaId/status creates audit log entries. 
        ◦ Task 13.102.3: Integrate with Notification Service for Admin Actions 
            ▪ Subtask 13.102.3.1: Trigger SEND_RETURN_APPROVAL_EMAIL or SEND_RETURN_REJECTION_EMAIL based on status update, passing relevant ReturnRequest data (RMA, items, instructions/rejection reason). 
        ◦ Task 13.102.4: Define Admin Return Instructions/Rejection Reasons 
            ▪ Subtask 13.102.4.1: Create a simple schema for ReturnReason and ReturnInstructionTemplate (e.g., IDs, localized text). 
            ▪ Subtask 13.102.4.2: APIs to manage these templates in admin. 
    • Frontend Tasks (Admin Panel):
        ◦ Task 13.102.5: Develop Admin "Returns" List View 
            ▪ Subtask 13.102.5.1: Create a new top-level menu item "Returns" in the admin dashboard. 
            ▪ Subtask 13.102.5.2: Display a table of ReturnRequest (from GET /api/admin/returns). 
            ▪ Subtask 13.102.5.3: Implement filtering by status, customer, order ID, and RMA number. 
            ▪ Subtask 13.102.5.4: Add sorting capabilities. 
            ▪ Subtask 13.102.5.5: Link each RMA number to the detailed view. 
        ◦ Task 13.102.6: Develop Admin Return Request Detail View UI 
            ▪ Subtask 13.102.6.1: Build the UI for GET /api/admin/returns/:rmaId. 
            ▪ Subtask 13.102.6.2: Display ReturnRequest header information (RMA, status, dates). 
            ▪ Subtask 13.102.6.3: Display ReturnItem details in a table, including quantity, reason, requested action, and links to product/order item. 
            ▪ Subtask 13.102.6.4: Integrate photo display component for uploaded images. 
            ▪ Subtask 13.102.6.5: Display customer and order summary. 
            ▪ Subtask 13.102.6.6: Display the audit log of status changes. 
        ◦ Task 13.102.7: Implement Approve/Reject Action Forms 
            ▪ Subtask 13.102.7.1: Add "Approve" and "Reject" buttons to the detailed view. 
            ▪ Subtask 13.102.7.2: For "Approve": 
                • A modal/form for internalNotes and customerInstructions (with template selection). 
                • Confirmation of selected items/quantities. 
                • Button to call PUT /api/admin/returns/:rmaId/status with newStatus: 'APPROVED'. 
            ▪ Subtask 13.102.7.3: For "Reject": 
                • A modal/form for rejectionReason (mandatory, with predefined options) and internalNotes. 
                • Confirmation. 
                • Button to call PUT /api/admin/returns/:rmaId/status with newStatus: 'REJECTED'. 
        ◦ Task 13.102.8: Update Customer "My Returns" Page (from 13.101) 
            ▪ Subtask 13.102.8.1: Ensure the customer's return list and detail view correctly reflect the APPROVED or REJECTED status. 
            ▪ Subtask 13.102.8.2: Display customerInstructions if approved, or rejectionReason if rejected. 
    • Testing Tasks:
        ◦ Task 13.102.9: Write Unit Tests (Backend) 
            ▪ Subtask 13.102.9.1: Unit tests for PUT /api/admin/returns/:rmaId/status for valid and invalid status transitions. 
            ▪ Subtask 13.102.9.2: Unit tests for audit log creation. 
        ◦ Task 13.102.10: Write Integration Tests 
            ▪ Subtask 13.102.10.1: Customer initiates a return (from 13.101). 
            ▪ Subtask 13.102.10.2: Admin user approves the request. Verify status change, audit log, and email sent to customer. 
            ▪ Subtask 13.102.10.3: Admin user rejects a different request. Verify status change, audit log, and email sent with rejection reason. 
            ▪ Subtask 13.102.10.4: Verify admin can view all return requests with correct filters. 
            ▪ Subtask 13.102.10.5: Verify customer can see the updated status and instructions/reason on their "My Returns" page. 
        ◦ Task 13.102.11: Manual End-to-End Testing: 
            ▪ Subtask 13.102.11.1: Customer A: Initiate a return for Order 1, Item X, reason "Damaged", action "Refund". 
            ▪ Subtask 13.102.11.2: Customer B: Initiate a return for Order 2, Item Y, reason "Changed mind", action "Store Credit". 
            ▪ Subtask 13.102.11.3: Admin: Go to "Returns" list. Verify both requests are PENDING. Filter by status, customer, order ID. 
            ▪ Subtask 13.102.11.4: Admin: Open Customer A's request. Review details. Click "Approve". Add internal note "Customer reported damage", customer instruction "Please send back in original packaging". Confirm. 
            ▪ Subtask 13.102.11.5: Customer A: Check email for approval notification. Go to "My Returns" page. Verify status is APPROVED and instructions are visible. 
            ▪ Subtask 13.102.11.6: Admin: Open Customer B's request. Click "Reject". Select reason "Outside return window". Add internal note. Confirm. 
            ▪ Subtask 13.102.11.7: Customer B: Check email for rejection notification. Go to "My Returns" page. Verify status is REJECTED and rejection reason is visible. 
            ▪ Subtask 13.102.11.8: Admin: Check the audit log for both requests.
Epic 13: Returns Management & RMA
Story 13.103: Inventory & Financial Reconciliation for Returns
Story: As an operations staff member, I want to confirm the receipt and condition of returned items, then process refunds or issue store credit accordingly, and ensure inventory levels are accurately adjusted, so that financial records are correct and stock is updated for resale.
Acceptance Criteria:
    1. Return Item Receipt & Inspection (Admin): 
        ◦ In the admin panel, for an APPROVED return request, operations staff can mark individual ReturnItems as "Received". 
        ◦ When marking as "Received", ability to specify the condition of the returned item (e.g., "Resalable," "Damaged," "Defective"). 
        ◦ (Optional) Ability to upload photos of the received condition. 
    2. Inventory Adjustment: 
        ◦ When a ReturnItem is marked as "Received" and its condition is "Resalable", the system automatically adds the item back to available inventory. 
        ◦ If the condition is "Damaged" or "Defective", the item is returned to a separate "Quarantine" or "Non-Resalable" inventory location, or marked for scrap/disposal, without increasing available stock. 
        ◦ Inventory adjustments are logged with the RMA number. 
    3. Financial Reconciliation Options: 
        ◦ Based on the customer's requestedAction (Refund, Exchange, Store Credit) and the item's condition, the system facilitates the appropriate financial action: 
            ▪ Refund: Process a partial or full refund to the original payment method (minus shipping/restocking fees if applicable). 
            ▪ Store Credit: Issue store credit to the customer's account (from Epic 6, if implemented). 
            ▪ Exchange: Marks for exchange processing (handled further in 13.106). 
    4. Integration with Payment Gateway/Accounting: 
        ◦ Refunds: The system integrates with the payment gateway (from Epic 5) to initiate the refund transaction. 
        ◦ Store Credit: The system integrates with the customer account/wallet (from Epic 6) to add store credit. 
        ◦ All financial transactions (refunds, store credit) are logged and available for export to accounting systems. 
    5. Shipping & Restocking Fee Handling: 
        ◦ Admin can optionally deduct return shipping costs or restocking fees from the refund/store credit amount based on configurable rules (e.g., only if "Changed mind"). 
    6. Return Status Progression: 
        ◦ ReturnRequest status changes to "Received" when any item from the request is marked as received. 
        ◦ ReturnRequest status changes to "Completed" when all items are received and financial/inventory actions are finalized for the entire request. 
        ◦ Individual ReturnItem status can also track progress (e.g., "Received - Resalable", "Refunded"). 
    7. Customer Notification (upon completion): 
        ◦ Automated email notification to the customer when their refund or store credit is processed. 
    8. Audit Trail: 
        ◦ Comprehensive logging of all receipt, inspection, inventory, and financial actions taken on a return request. 

Granular Tasks & Subtasks for Story 13.103:
    • Discovery & Design Tasks:
        ◦ Task 13.103.1: Define Return Disposition & Inventory Locations 
            ▪ Subtask 13.103.1.1: Determine possible conditions for returned items (e.g., New, Used-Good, Damaged, Defective). 
            ▪ Subtask 13.103.1.2: Map conditions to inventory actions (e.g., "New" -> available_stock, "Damaged" -> quarantine_stock). 
        ◦ Task 13.103.2: Clarify Refund/Credit Rules 
            ▪ Subtask 13.103.2.1: Define if return shipping costs or restocking fees will be deducted. 
            ▪ Subtask 13.103.2.2: Specify how these deductions are calculated. 
        ◦ Task 13.103.3: Plan Admin UI for Return Processing 
            ▪ Subtask 13.103.3.1: Sketch the interface for marking items as received, selecting condition, and initiating financial actions within the ReturnRequest detail view. 
    • Backend Tasks (Returns Service, Inventory Service, Payment Gateway Service, Customer Service, Accounting Service):
        ◦ Task 13.103.4: Enhance ReturnItem Schema & Statuses 
            ▪ Subtask 13.103.4.1: Add receivedCondition (e.g., RESALABLE, DAMAGED, DEFECTIVE) to ReturnItem. 
            ▪ Subtask 13.103.4.2: Add isReceived (boolean) and isProcessed (boolean) to ReturnItem. 
            ▪ Subtask 13.103.4.3: Add refundAmount or storeCreditAmount to ReturnItem and ReturnRequest. 
        ◦ Task 13.103.5: Implement Item Receipt & Condition Recording API 
            ▪ Subtask 13.103.5.1: PUT /api/admin/returns/:rmaId/receive-item: 
                • Accepts returnItemId, receivedCondition. 
                • Updates ReturnItem status to isReceived: true. 
                • Triggers Inventory Service call (see next task). 
                • Updates ReturnRequest status if all items are received. 
                • Adds audit log entry. 
        ◦ Task 13.103.6: Integrate with Inventory Service for Returns 
            ▪ Subtask 13.103.6.1: Modify Inventory Service (from Epic 2) to expose an addReturnedStock(productId, quantity, locationType) method. 
            ▪ Subtask 13.103.6.2: From PUT /api/admin/returns/:rmaId/receive-item, call addReturnedStock: 
                • If receivedCondition is RESALABLE, add to available_stock. 
                • If receivedCondition is DAMAGED or DEFECTIVE, add to quarantine_stock. 
            ▪ Subtask 13.103.6.3: Log inventory adjustment with rmaId reference. 
        ◦ Task 13.103.7: Implement Financial Reconciliation API 
            ▪ Subtask 13.103.7.1: POST /api/admin/returns/:rmaId/process-financial: 
                • Validates all items are received. 
                • Calculates total refund/store credit amount, applying any deductions (shipping, restocking fees). 
                • Based on requestedAction for each item: 
                    ◦ If REFUND: Calls Payment Gateway Service.processRefund(originalTransactionId, amount). 
                    ◦ If STORE_CREDIT: Calls Customer Service.addStoreCredit(customerId, amount) (from Epic 6). 
                    ◦ If EXCHANGE: Marks ReturnRequest as PENDING_EXCHANGE (details in 13.106). 
                • Updates ReturnRequest status to COMPLETED (or PENDING_EXCHANGE). 
                • Creates financial log entries. 
                • Adds audit log entry. 
        ◦ Task 13.103.8: Develop Accounting Integration Hooks 
            ▪ Subtask 13.103.8.1: Create event listeners or data exports for successful refunds and store credit issuances, to be consumed by an external accounting system (from Epic 10, if applicable). 
        ◦ Task 13.103.9: Integrate with Notification Service for Completion 
            ▪ Subtask 13.103.9.1: Trigger SEND_RETURN_COMPLETED_EMAIL to customer upon successful financial processing, including details of refund/credit amount. 
    • Frontend Tasks (Admin Panel):
        ◦ Task 13.103.10: Enhance Admin Return Request Detail View UI (from 13.102) 
            ▪ Subtask 13.103.10.1: For each ReturnItem in the detail view: 
                • Add a checkbox/button "Mark as Received". 
                • Add a dropdown for "Condition" (Resalable, Damaged, Defective) that appears upon marking as received. 
                • (Optional) File upload for condition photos. 
                • Display isReceived status and receivedCondition. 
            ▪ Subtask 13.103.10.2: Add a section for "Financial Processing": 
                • Display calculated refundAmount or storeCreditAmount based on received items and rules. 
                • Input fields for optional deductions (e.g., restocking fee). 
                • A button "Process Refund / Issue Store Credit" (calls POST /api/admin/returns/:rmaId/process-financial). 
            ▪ Subtask 13.103.10.3: Update overall ReturnRequest status display. 
            ▪ Subtask 13.103.10.4: Ensure audit log updates are visible. 
    • Testing Tasks:
        ◦ Task 13.103.11: Write Unit Tests (Backend) 
            ▪ Subtask 13.103.11.1: Unit tests for addReturnedStock with different conditions. 
            ▪ Subtask 13.103.11.2: Unit tests for refund/store credit calculation, including deductions. 
            ▪ Subtask 13.103.11.3: Unit tests for calling payment gateway refund API (mocking external call). 
        ◦ Task 13.103.12: Write Integration Tests 
            ▪ Subtask 13.103.12.1: Customer initiates a return (13.101). Admin approves (13.102). 
            ▪ Subtask 13.103.12.2: Admin marks items as received: 
                • One item as "Resalable". Verify inventory increases for that SKU. 
                • Another item as "Damaged". Verify inventory does not increase for available stock, but is logged as quarantine. 
            ▪ Subtask 13.103.12.3: Admin processes refund. Verify ReturnRequest status changes to COMPLETED. Verify refund transaction is logged. 
            ▪ Subtask 13.103.12.4: Admin processes store credit. Verify customer's store credit balance increases. 
            ▪ Subtask 13.103.12.5: Verify customer receives notification of completion. 
            ▪ Subtask 13.103.12.6: Test partial returns where only some items are processed. 
        ◦ Task 13.103.13: Manual End-to-End Testing: 
            ▪ Subtask 13.103.13.1: Create an order for a customer. Make sure it's paid. 
            ▪ Subtask 13.103.13.2: Customer initiates a return for 2 items from that order, requesting "Refund". 
            ▪ Subtask 13.103.13.3: Admin: Approve the return request. 
            ▪ Subtask 13.103.13.4: Admin: In the ReturnRequest detail view, mark Item 1 as "Received", condition "Resalable". Verify inventory for Item 1 increases. 
            ▪ Subtask 13.103.13.5: Admin: Mark Item 2 as "Received", condition "Damaged". Verify inventory for Item 2 does not increase in available stock. 
            ▪ Subtask 13.103.13.6: Admin: Click "Process Refund". Verify the calculated refund amount. Add a restocking fee. Process. 
            ▪ Subtask 13.103.13.7: Verify the ReturnRequest status is COMPLETED. 
            ▪ Subtask 13.103.13.8: Customer: Verify they received a "Return Completed" email with refund details. Check bank statement (if possible with mock payment gateway). 
            ▪ Subtask 13.103.13.9: Repeat for a "Store Credit" request, verifying customer's store credit balance. 
            ▪ Subtask 13.103.13.10: Admin: Check audit logs for all steps.


 Future Test Improvements:
  1. Simplified Integration Tests: Focus on API boundaries rather than deep mocking
  2. E2E Testing: Use Playwright/Cypress for full user journey testing
  3. Load Testing: Verify GloBee API limits and caching behavior
  4. Security Testing: Penetration testing for webhook endpoints

