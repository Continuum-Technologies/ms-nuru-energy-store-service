
# Product Design Requirements Document

## Single-Store Solar, Power and Machinery E-Commerce Platform

**Document status:** Initial product definition
**Version:** 1.0
**Prepared for:** Lisper Wairimu Mathenge
**Business type:** Single-store retailer
**Primary market:** Kenya
**Platform type:** Responsive e-commerce storefront and administration system
**Proposed architecture:** Next.js modular monolith
**Business name:** To be confirmed separately

---

## 1. Document Purpose

This Product Design Requirements document defines the business, functional, technical, design, security, SEO and operational requirements for creating a modern e-commerce platform for a single retail business selling:

* Solar panels
* Solar batteries
* Inverters
* Solar lighting products
* Solar accessories
* Generators
* Water pumps
* Power equipment
* Machinery
* Spare parts
* Related installation and support services

The platform must be easy for a non-technical business owner to manage while providing customers with a fast, trustworthy and mobile-friendly shopping experience.

The platform is not a marketplace and will not support multiple independent sellers.

All products, inventory, payments, orders and customer relationships will belong to one business.

---

# 2. Product Vision

The platform will become a trusted online destination for solar, backup power, generators, machinery and related equipment in Kenya.

It should allow customers to:

* Discover suitable products
* Understand technical specifications
* Compare available options
* Ask questions
* Request quotations
* Purchase selected products
* Arrange delivery
* Request installation assistance
* Contact the business through WhatsApp or telephone

It should allow the business owner and authorized employees to:

* Add and manage products
* Upload product images
* Update prices
* Track inventory
* Process orders
* Prepare quotations
* Manage customers
* Publish website content
* Review sales performance
* Manage search-engine content
* Operate the website primarily from a mobile phone

The platform should compete effectively with established Kenyan solar and equipment e-commerce websites through better usability, stronger content, faster performance, more useful product information and superior search-engine optimization.

---

# 3. Product Principles

## 3.1 Single-store simplicity

The platform will represent one business.

It will not include:

* Seller registration
* Vendor accounts
* Vendor commissions
* Seller payouts
* Marketplace disputes
* Seller-specific dashboards
* Seller-specific inventory
* Product ownership by third-party vendors
* Marketplace moderation
* Multi-tenant architecture

The system may support multiple employees, but all employees will operate under the same business.

---

## 3.2 Easy for a non-technical owner

The owner should not need technical knowledge to manage the website.

The administration experience must avoid exposing unnecessary technical concepts such as:

* Database identifiers
* JSON configuration
* Schema markup
* Cache settings
* Internal API details
* Deployment controls
* Server configuration
* Raw HTML
* Unformatted metadata
* Infrastructure status

Common tasks should require as few steps as reasonably possible.

---

## 3.3 Mobile-first operation

The customer storefront and administration dashboard must work properly on:

* Smartphones
* Tablets
* Laptops
* Desktop computers

Mobile responsiveness is a core requirement and not an optional enhancement.

The owner should be able to perform the majority of daily administrative tasks from a smartphone.

---

## 3.4 SEO-first design

Search-engine optimization must be built into the architecture from the beginning.

SEO should not be treated as a plugin or activity added after the platform has been completed.

The platform must support search visibility for:

* Product names
* Product categories
* Product brands
* Product model numbers
* Product power ratings
* Product prices
* Solar solutions
* Generator solutions
* Home backup systems
* Commercial power systems
* Water pumping solutions
* Agriculture and farm power solutions
* Location-based searches
* Informational buying guides

---

## 3.5 Secure by default

The system must protect:

* Customer information
* Administrator accounts
* Order information
* Payment references
* Product pricing
* Inventory records
* Uploaded files
* Business settings

Security controls must be enforced on the server and not only through the visible user interface.

---

## 3.6 Modular without unnecessary complexity

The system will be developed as one Next.js application in one repository.

It will follow a modular monolith architecture.

This provides:

* Easier deployment
* Lower hosting costs
* Easier maintenance
* Shared validation
* Shared database models
* Shared authentication
* Faster development
* Fewer operational dependencies

The internal codebase must still maintain clear module boundaries so that the application does not become one large, tightly coupled codebase.

---

# 4. Business Objectives

The platform should help the business achieve the following objectives:

1. Establish a professional online presence.
2. Increase product discovery through search engines.
3. Allow customers to browse available products at any time.
4. Generate direct sales.
5. Generate quotation requests for high-value products and installations.
6. Reduce dependence on manual WhatsApp product listing.
7. Improve trust through clear specifications, warranties and business information.
8. Improve inventory visibility.
9. Organize customer inquiries and orders.
10. Simplify quotation preparation.
11. Support expansion into additional power and machinery categories.
12. Build long-term authority around solar, energy and equipment solutions.

---

# 5. Target Customers

## 5.1 Residential customers

Customers looking for:

* Home solar systems
* Backup power
* Inverters
* Batteries
* Solar lights
* Small generators
* Water heating solutions
* Household water pumps

---

## 5.2 Small businesses

Businesses looking for:

* Shop backup systems
* Office power backup
* Small commercial generators
* Inverters and batteries
* Security lighting
* Point-of-sale backup power
* Small machinery

---

## 5.3 Farmers

Farm customers looking for:

* Solar water pumps
* Borehole pumping systems
* Irrigation equipment
* Farm generators
* Poultry backup power
* Lighting systems
* Feed-processing machinery
* Agricultural equipment

---

## 5.4 Property owners and contractors

Customers looking for:

* Building power solutions
* Water pumps
* Backup systems
* Solar installation equipment
* Electrical accessories
* Construction machinery
* Generator systems

---

## 5.5 Institutions

Potential institutional customers include:

* Schools
* Churches
* Clinics
* Hotels
* Restaurants
* Offices
* Non-governmental organizations
* Community organizations
* Small factories

These customers may prefer quotation-based purchases rather than direct checkout.

---

# 6. Primary User Roles

## 6.1 Customer

A customer can:

* Browse products
* Search products
* Filter products
* View product details
* Add products to a cart
* Request a quotation
* Place an order
* Choose a payment option
* Provide delivery details
* Contact the business
* Track or inquire about an order
* Read product guides
* Submit product questions
* Submit reviews where enabled

A customer account should not be mandatory for basic checkout unless required for a specific business or security reason.

Guest checkout should be supported.

---

## 6.2 Store owner

The owner has full access to:

* Dashboard
* Products
* Categories
* Brands
* Inventory
* Orders
* Quotations
* Customers
* Payments
* Website content
* Reports
* Staff accounts
* Store settings
* Security settings
* Audit history

---

## 6.3 Administrator

An administrator can perform most operational activities but may be restricted from:

* Deleting the owner account
* Changing ownership
* Changing critical payment credentials
* Accessing certain security settings
* Performing irreversible system actions

---

## 6.4 Sales employee

A sales employee may:

* View customers
* Process orders
* Prepare quotations
* Contact customers
* Update order status
* Record manual payments
* Convert quotations into orders

A sales employee should not automatically have access to:

* User administration
* Sensitive payment settings
* Security configuration
* Permanent product deletion

---

## 6.5 Inventory employee

An inventory employee may:

* Receive stock
* Adjust stock
* Record damaged stock
* View low-stock products
* Update availability
* View inventory movements

An inventory employee may be prevented from:

* Changing product prices
* Changing payment settings
* Managing users
* Viewing sensitive financial reports

---

## 6.6 Content employee

A content employee may:

* Add products
* Edit product descriptions
* Upload images
* Manage categories
* Manage brands
* Publish articles
* Update banners
* Edit SEO content

A content employee should not automatically have permission to:

* Adjust inventory
* Process refunds
* Change payment settings
* Manage staff accounts

---

# 7. Platform Scope

The platform will contain two primary interfaces:

## 7.1 Public storefront

The public storefront will be used by customers to discover products, request quotations and place orders.

## 7.2 Administration dashboard

The administration dashboard will be used by the owner and authorized employees to manage the business.

Both interfaces will exist inside the same Next.js application.

---

# 8. Public Storefront Requirements

## 8.1 Homepage

The homepage must clearly communicate:

* What the business sells
* The main product categories
* The business’s value proposition
* How customers can buy or request assistance
* Whether installation and delivery are available
* How customers can contact the business

The homepage should support controlled sections including:

* Main hero banner
* Featured categories
* Featured products
* Shop-by-solution section
* Popular brands
* Current promotions
* New arrivals
* Best-selling products
* Why customers should choose the store
* Delivery information
* Warranty information
* Installation services
* Customer testimonials
* Educational articles
* Frequently asked questions
* WhatsApp call-to-action
* Newsletter or inquiry capture

The owner must be able to update the homepage without editing code.

However, the owner should not be given a completely unrestricted page builder that could easily break the website layout.

---

## 8.2 Shop-by-category navigation

Initial categories may include:

* Solar panels
* Solar batteries
* Inverters
* Charge controllers
* Solar lights
* Solar accessories
* Generators
* Water pumps
* Borehole pumps
* Machinery
* Electrical accessories
* Cables
* Mounting equipment
* Spare parts

Categories must be manageable from the administration dashboard.

Categories must support:

* Name
* Description
* Image
* Parent category
* Display order
* Active or hidden status
* SEO title
* SEO description
* Search keywords
* Canonical URL
* Featured status

---

## 8.3 Shop-by-solution navigation

Customers should be able to browse products according to the problem they are trying to solve.

Initial solution pages may include:

* Home solar
* Business solar
* Home backup power
* Office backup power
* Farm solar
* Borehole pumping
* Irrigation systems
* Poultry-farm power
* School power systems
* Commercial generators
* Security lighting
* Water pumping
* Off-grid systems

A solution page may contain:

* Introductory content
* Recommended products
* Recommended product bundles
* Buying guidance
* Frequently asked questions
* Installation information
* Related guides
* Quotation request form

---

## 8.4 Product listing pages

Product listing pages must support:

* Product image
* Product name
* Current price
* Previous price where applicable
* Discount indication
* Brand
* Availability
* Product rating where enabled
* Quick quotation action
* Add-to-cart action where applicable
* Compare action where supported
* Short product highlights

Customers must be able to filter products by relevant criteria.

Possible filters include:

* Category
* Brand
* Price range
* Availability
* Power rating
* Wattage
* Kilovolt-ampere rating
* Voltage
* Battery type
* Fuel type
* Phase
* Application
* Warranty period

Filters must adapt according to the product category.

A generator listing should not show irrelevant solar-panel filters.

---

## 8.5 Product search

The website must provide fast and forgiving search.

Search should consider:

* Product name
* Product model
* SKU
* Brand
* Category
* Description
* Technical specifications
* Alternative spelling
* Common abbreviations
* Product keywords

The search should understand common variations such as:

* 5kVA
* 5 kVA
* 5000VA
* 5-kVA
* Solar battery
* Solar batteries
* Water pump
* Borehole pump

Initial implementation may use PostgreSQL full-text and indexed search.

A specialized search engine may be introduced later if catalogue size or search complexity requires it.

---

## 8.6 Product details page

Every product page must support:

* Product name
* Product gallery
* Main product image
* Selling price
* Previous price
* Discount
* Stock availability
* Brand
* Model number
* SKU
* Short description
* Full description
* Technical specifications
* Main benefits
* Suitable applications
* Warranty details
* Delivery information
* Installation availability
* Product documents
* Product manual
* Product brochure
* Frequently asked questions
* Related products
* Alternative products
* Frequently bought-together products
* Customer reviews where enabled
* Product questions
* WhatsApp inquiry
* Telephone action
* Add-to-cart action
* Request-quotation action

The page must provide a sticky purchase or inquiry action on mobile devices.

---

## 8.7 Product images

Each product may have multiple images.

The platform must support:

* Image upload
* Image preview
* Drag-and-drop ordering
* Primary-image selection
* Automatic resizing
* Automatic compression
* Thumbnail generation
* WebP or AVIF delivery
* Alternative text
* Safe filenames
* File-size restrictions
* File-type restrictions
* Image deletion
* Image replacement

Images should be stored in object storage or an image-management service rather than directly inside PostgreSQL.

The database will store image metadata and file references.

---

## 8.8 Technical specifications

Technical specifications are essential for this product category.

Specifications must be structured rather than stored only as unformatted description text.

Specification fields should be based on the selected category.

### Solar panel specification examples

* Rated power
* Maximum power voltage
* Maximum power current
* Open-circuit voltage
* Short-circuit current
* Cell type
* Number of cells
* Panel efficiency
* Dimensions
* Weight
* Connector type
* Product warranty
* Performance warranty

### Battery specification examples

* Battery capacity
* Nominal voltage
* Battery chemistry
* Usable capacity
* Recommended depth of discharge
* Cycle life
* Communication interface
* Maximum charge current
* Maximum discharge current
* Dimensions
* Weight
* Warranty

### Inverter specification examples

* Rated output
* Surge power
* Input voltage
* Output voltage
* Output frequency
* Phase
* MPPT voltage range
* Number of MPPT trackers
* Maximum solar input
* Battery compatibility
* Communication options
* Dimensions
* Weight
* Warranty

### Generator specification examples

* Rated output
* Maximum output
* Fuel type
* Engine type
* Starting system
* Phase
* Voltage
* Frequency
* Fuel-tank capacity
* Runtime
* Noise level
* Dimensions
* Weight
* Warranty

### Water-pump specification examples

* Pump type
* Rated power
* Maximum head
* Maximum flow rate
* Outlet size
* Input voltage
* Solar compatibility
* Borehole diameter
* Materials
* Cable length
* Warranty

Category administrators must be able to define reusable specification templates.

---

## 8.9 Product comparison

The platform should support comparing products within compatible categories.

Customers may compare:

* Solar panels
* Batteries
* Inverters
* Generators
* Pumps

The comparison view should emphasize differences in:

* Price
* Power rating
* Capacity
* Voltage
* Warranty
* Technical features
* Suitable applications
* Availability

Products from unrelated categories should not be compared.

This feature may be introduced after the first production release if necessary.

---

## 8.10 Product availability

Supported availability states should include:

* In stock
* Low stock
* Out of stock
* Available on order
* Pre-order
* Contact for availability
* Discontinued

The customer-facing label must be clear and non-technical.

The system should not expose exact stock quantities publicly unless enabled by the owner.

---

# 9. Cart and Checkout

## 9.1 Cart

The cart must allow customers to:

* Add products
* Remove products
* Change quantities
* Save items where supported
* View estimated totals
* Continue shopping
* Proceed to checkout
* Request a quotation for the complete cart

The cart must work properly on mobile devices.

Cart contents should be retained for a reasonable period.

---

## 9.2 Guest checkout

Customers should be allowed to place an order without creating an account.

Required checkout details may include:

* Full name
* Telephone number
* Email address
* County
* Town
* Delivery location
* Delivery instructions
* Preferred payment method
* Preferred contact method
* Customer notes

The platform should request only information necessary to process the order.

---

## 9.3 Customer accounts

Customer accounts may be offered as an optional feature.

An authenticated customer may be able to:

* View previous orders
* View order status
* Download quotations
* Manage addresses
* Save products
* Repeat an order
* View invoices or receipts
* Submit support requests

Customer accounts should not delay the initial launch if guest checkout satisfies the business need.

---

## 9.4 Checkout methods

The platform should support:

* Direct online order
* Request quotation
* Order through WhatsApp
* Telephone inquiry
* Payment on collection
* Bank transfer
* M-Pesa payment
* Cash on delivery where permitted

The available methods must be configurable.

---

## 9.5 Delivery calculation

Delivery options may initially include:

* Collection from the shop
* Delivery within selected local areas
* Delivery within Nairobi
* Delivery to other counties
* Delivery arranged after confirmation
* Customer-provided transport
* Installation-site delivery

Delivery costs may be:

* Fixed
* Based on county
* Based on town
* Based on order value
* Based on product weight
* Confirmed manually
* Included for selected products
* Free above a configured threshold

For heavy machinery or large generators, the system should allow delivery charges to be confirmed manually.

---

# 10. Quotation Management

Quotation functionality is a major platform requirement.

Many products may require:

* Site assessment
* Installation
* Custom accessories
* Delivery calculations
* Technical configuration
* Product bundling
* Negotiated pricing

## 10.1 Quotation request

A customer should be able to request a quotation from:

* A product page
* A solution page
* The cart
* A general quotation form

The request may capture:

* Customer name
* Telephone number
* Email
* Location
* Product interest
* Required quantity
* Intended use
* Property or business type
* Current power source
* Installation requirement
* Budget range
* Preferred completion date
* Additional notes
* Uploaded reference images or documents where enabled

---

## 10.2 Quotation workflow

Suggested quotation statuses:

* New request
* Under review
* More information required
* Site assessment required
* Preparing quotation
* Quotation sent
* Customer reviewing
* Accepted
* Rejected
* Expired
* Converted to order
* Cancelled

Technical database values may differ, but the administrator must see friendly labels.

---

## 10.3 Quotation preparation

Administrators should be able to:

* Add products
* Add custom line items
* Adjust quantities
* Apply discounts
* Add installation charges
* Add transport charges
* Add taxes where applicable
* Add terms
* Set an expiry date
* Add payment instructions
* Add warranty notes
* Add customer notes
* Preview the quotation
* Generate a PDF
* Email the quotation
* Share the quotation through WhatsApp
* Mark the quotation as accepted
* Convert the quotation into an order

---

## 10.4 Quotation PDF

The quotation PDF should contain:

* Business logo
* Business name
* Contact details
* Customer information
* Quotation number
* Issue date
* Expiry date
* Product details
* Quantities
* Unit prices
* Discounts
* Taxes
* Installation charges
* Delivery charges
* Total amount
* Payment terms
* Warranty information
* Terms and conditions
* Authorized contact

PDF generation may be processed as a background job.

---

# 11. Order Management

## 11.1 Order lifecycle

Suggested order statuses:

* New
* Awaiting confirmation
* Awaiting payment
* Payment verification required
* Paid
* Confirmed
* Processing
* Ready for collection
* Ready for dispatch
* Dispatched
* Delivered
* Completed
* Cancelled
* Refunded
* Partially refunded

The owner should be able to configure which statuses are available.

---

## 11.2 Order details

An order should contain:

* Order number
* Customer information
* Billing information
* Delivery information
* Ordered products
* Product snapshot
* Quantity
* Unit price
* Discount
* Delivery charge
* Installation charge
* Tax
* Total
* Payment status
* Payment method
* Fulfilment status
* Customer notes
* Internal notes
* Order history
* Assigned employee
* Related quotation
* Related inventory movements

Product names and prices must be saved as order-item snapshots so that previous orders remain accurate even after product details change.

---

## 11.3 Order actions

Authorized employees should be able to:

* Confirm an order
* Request payment
* Record payment
* Change order status
* Contact the customer
* Assign an order
* Add internal notes
* Print an order
* Generate an invoice
* Generate a receipt
* Cancel an order
* Release reserved stock
* Process a return
* Process a refund
* Mark an order as delivered

---

# 12. Payment Requirements

## 12.1 Supported payment methods

Initial methods may include:

* M-Pesa STK Push
* M-Pesa Till
* M-Pesa Paybill
* Bank transfer
* Cash on delivery
* Payment on collection
* Manual payment confirmation

Payment methods must be configurable through store settings.

---

## 12.2 Payment records

Payment records should capture:

* Payment reference
* Order reference
* Customer
* Payment method
* Amount
* Currency
* Status
* Provider
* Provider reference
* Payment time
* Verification time
* Recorded by
* Notes

---

## 12.3 Payment statuses

Suggested payment statuses:

* Pending
* Initiated
* Processing
* Successful
* Failed
* Cancelled
* Expired
* Verification required
* Partially paid
* Refunded
* Partially refunded

---

## 12.4 Payment integration design

Payment integrations should be implemented behind an internal abstraction.

The checkout and order modules should not depend directly on one provider’s implementation.

This allows payment providers to be changed without rebuilding the complete checkout process.

Payment callbacks must be:

* Authenticated where supported
* Validated
* Idempotent
* Logged
* Safe against duplicate processing

A repeated payment callback must not create duplicate payments or duplicate orders.

---

# 13. Inventory Management

## 13.1 Inventory model

Because this is a single store, the initial implementation may use one primary stock location.

The inventory model should support:

* Quantity on hand
* Reserved quantity
* Available quantity
* Reorder level
* Low-stock threshold
* Stock status
* Last stock update
* Last stock count

Future support for multiple locations may be added without introducing marketplace functionality.

---

## 13.2 Inventory movements

Stock changes must be recorded as inventory movements.

Suggested movement types:

* Opening stock
* Stock received
* Sale
* Order reservation
* Reservation released
* Customer return
* Supplier return
* Damaged stock
* Lost stock
* Manual adjustment
* Stock count correction
* Order cancellation
* Transfer, if multiple locations are introduced later

Each movement should record:

* Product
* Quantity
* Movement type
* Previous quantity
* New quantity
* Reason
* Reference
* Order where applicable
* Employee
* Date and time

The platform should be able to explain why the current quantity has changed.

---

## 13.3 Stock reservations

When an order is confirmed or reaches a configured stage, stock may be reserved.

Reserved stock should not be treated as available for another customer.

Reservations must be released when:

* An order is cancelled
* Payment expires
* The reservation period expires
* An administrator manually releases it

---

## 13.4 Low-stock notifications

The system should notify administrators when:

* A product reaches its reorder level
* A product becomes out of stock
* A manual adjustment significantly changes stock
* A reserved quantity exceeds available quantity
* A stock inconsistency is detected

---

# 14. Product Administration

## 14.1 Product statuses

Products should support:

* Draft
* Active
* Hidden
* Out of stock
* Available on order
* Discontinued
* Archived

A product should not become publicly visible until it has been intentionally published.

---

## 14.2 Product creation workflow

The product form should be divided into manageable sections.

### Basic information

* Product name
* Brand
* Category
* Model
* SKU
* Short description
* Full description

### Pricing

* Selling price
* Previous price
* Cost price, restricted where necessary
* Discount
* Tax configuration
* Request-quotation-only option
* Hide-price option

### Inventory

* Quantity
* Reorder level
* Availability status
* Allow backorder
* Stock notes

### Images and documents

* Main image
* Gallery images
* Manual
* Brochure
* Warranty document
* Data sheet

### Specifications

Fields based on the selected category.

### Delivery and installation

* Weight
* Dimensions
* Delivery restrictions
* Installation available
* Installation required
* Delivery-cost handling

### SEO

* Slug
* SEO title
* Meta description
* Search keywords
* Canonical URL
* Social-sharing image
* Indexing status

### Publishing

* Draft
* Preview
* Publish
* Schedule publication
* Hide
* Archive

---

## 14.3 Product duplication

Administrators should be able to duplicate an existing product to create a similar product.

The duplicated product must receive:

* A new internal identifier
* A new SKU where required
* A draft status
* A unique slug before publication

---

## 14.4 Bulk actions

The system may support:

* Bulk price updates
* Bulk stock updates
* Bulk status changes
* Bulk category assignment
* Bulk export
* Bulk import
* Bulk image assignment where appropriate

Bulk actions must require validation and clear confirmation.

---

# 15. Brand Management

Each brand page should support:

* Brand name
* Logo
* Description
* Country of origin where relevant
* Warranty information
* Official website where appropriate
* Brand status
* Featured status
* SEO title
* Meta description
* Brand products
* Related articles

Brand pages should help attract searches for specific manufacturers and product lines.

---

# 16. Content Management

The administration dashboard must allow the owner to manage:

* Homepage banners
* Promotional sections
* Featured products
* Featured categories
* Featured brands
* About page
* Contact page
* Delivery policy
* Return policy
* Warranty policy
* Privacy policy
* Terms and conditions
* Frequently asked questions
* Installation information
* Customer testimonials
* Buying guides
* Blog or knowledge-centre articles

The platform should use controlled content components rather than unrestricted layout editing.

---

# 17. Knowledge Centre

The platform should support educational content intended to improve SEO and assist customers.

Possible content topics include:

* How to choose a solar panel
* How to calculate home backup requirements
* How to choose an inverter
* How to choose a battery
* Difference between lithium and lead-acid batteries
* How to size a generator
* Generator maintenance
* Solar water-pump selection
* Borehole-pump sizing
* Solar-system cost considerations
* Solar installation requirements
* Solar products for farms
* Solar systems for schools
* Backup power for businesses
* Common solar-system mistakes

Articles should support:

* Title
* Slug
* Featured image
* Summary
* Main content
* Author
* Publication date
* Categories
* Tags
* Related products
* Related solutions
* SEO metadata
* Draft and publish workflow

---

# 18. Search-Engine Optimization Requirements

## 18.1 SEO-friendly URL structure

Recommended URL patterns include:

```text
/
/shop
/products/[product-slug]
/categories/[category-slug]
/brands/[brand-slug]
/solutions/[solution-slug]
/guides/[article-slug]
/search
/cart
/checkout
/request-quotation
/contact
/about
```

URLs should be:

* Human-readable
* Stable
* Lowercase
* Hyphenated
* Free of unnecessary query parameters
* Unique

---

## 18.2 Automated SEO metadata

The system should automatically generate an initial SEO title and meta description when a product, category, brand or article is created.

For example, a product named:

```text
Felicity Solar 5kVA Hybrid Inverter
```

may generate:

```text
Felicity Solar 5kVA Hybrid Inverter Price in Kenya
```

The owner should be allowed to override automatically generated values.

SEO fields should not be mandatory for basic product creation.

---

## 18.3 Structured data

The website should generate valid structured data where applicable.

Supported schema types may include:

* Organization
* LocalBusiness
* Product
* Offer
* BreadcrumbList
* WebSite
* SearchAction
* Article
* FAQPage
* Review
* AggregateRating
* ItemList

Structured data must reflect visible page content.

The platform must not generate fake ratings, fake reviews or unavailable pricing.

---

## 18.4 XML sitemaps

The system should generate sitemaps for:

* Main pages
* Products
* Categories
* Brands
* Solutions
* Articles
* Images where appropriate

Sitemaps must update when public content is created, changed or removed.

---

## 18.5 Canonical URLs

The platform must generate canonical URLs to prevent duplicate-content problems.

Canonical handling is especially important for:

* Filtered category pages
* Search pages
* Products accessible through multiple categories
* Tracking parameters
* Paginated content

---

## 18.6 Redirect management

When a public slug changes, the system should create a permanent redirect from the previous URL to the new URL.

Administrators should be able to manage redirects through a simplified interface.

Redirect loops must be prevented.

---

## 18.7 Robots controls

The platform should prevent indexing of:

* Administration pages
* Checkout pages
* Cart pages
* Internal search results where appropriate
* Customer account pages
* Preview pages
* Draft content
* Internal API routes
* Duplicate filter combinations

---

## 18.8 Internal linking

The system should automatically create relevant internal links between:

* Products and categories
* Products and brands
* Products and solutions
* Articles and products
* Articles and categories
* Related products
* Related articles
* Frequently bought-together items

---

## 18.9 Location-based SEO

The platform should support content relevant to the business’s actual service area.

Potential pages may target legitimate searches such as:

* Solar products in Kenya
* Solar panels in Nairobi
* Generator suppliers in Nairobi
* Solar batteries in Kenya
* Inverter prices in Kenya
* Solar water pumps in Kenya
* Borehole pumps in Kenya

Location pages should contain useful, original content and should not be generated as thin or misleading pages.

---

## 18.10 Product feeds

The architecture should allow future support for:

* Google Merchant Center
* Meta product catalogue
* WhatsApp catalogue
* Price-comparison feeds
* Social commerce integrations

---

# 19. Mobile Responsiveness

## 19.1 Customer mobile experience

The mobile storefront must prioritize:

* Fast loading
* Clear product images
* Readable pricing
* Simple navigation
* Large touch targets
* Easy search
* Easy filtering
* Sticky add-to-cart action
* Sticky request-quotation action
* WhatsApp contact
* Telephone contact
* Clear delivery information
* Simple checkout

Important actions should not depend on hover interactions.

---

## 19.2 Mobile administration

The owner should be able to perform the following from a phone:

* View new orders
* View quotation requests
* Confirm an order
* Update an order status
* Call a customer
* Open a WhatsApp conversation
* Update product price
* Update stock
* Mark a product unavailable
* Upload a product image
* Create a product draft
* Edit a description
* Prepare a quotation
* Share a quotation
* View low-stock alerts
* Update a homepage banner

---

## 19.3 Responsive administration lists

Wide desktop tables should transform into readable mobile cards.

A mobile order card should display:

* Order number
* Customer name
* Amount
* Payment status
* Order status
* Date
* Primary actions

Important actions should not require horizontal scrolling.

---

## 19.4 Responsive breakpoints

The interface must be tested at common widths including:

* Small smartphones
* Large smartphones
* Tablets
* Small laptops
* Standard desktops
* Large desktops

Responsive behaviour should be based on content requirements rather than device brand.

---

# 20. Administration Dashboard

## 20.1 Dashboard overview

The dashboard should provide an immediate operational summary.

Suggested dashboard indicators include:

* Orders today
* Sales today
* Pending orders
* Awaiting payment
* New quotation requests
* Quotations awaiting response
* Low-stock products
* Out-of-stock products
* Products in draft
* Recent customers
* Recent payments
* Orders awaiting dispatch

The interface should focus on actionable information.

---

## 20.2 Administration navigation

Recommended primary navigation:

* Dashboard
* Products
* Categories
* Brands
* Inventory
* Orders
* Quotations
* Customers
* Website
* Reports
* Staff
* Settings

The exact navigation may adapt based on user permissions.

---

## 20.3 Global administration search

Administrators should be able to search for:

* Order number
* Quotation number
* Customer name
* Customer telephone
* Customer email
* Product name
* SKU
* Payment reference

---

# 21. Customer Management

Customer records should include:

* Name
* Telephone number
* Email
* Delivery addresses
* County
* Town
* Customer type
* Order history
* Quotation history
* Total spend
* Last order
* Notes
* Communication preference
* Marketing consent
* Account status

Suggested customer types may include:

* Individual
* Business
* Farmer
* Contractor
* Institution
* Reseller

Customer classification should remain simple and optional.

---

# 22. Notifications

The system should support notifications for:

* New order
* New quotation request
* Successful payment
* Failed payment
* Payment requiring verification
* Low stock
* Out of stock
* New customer inquiry
* Order cancellation
* Quotation acceptance
* Quotation expiry
* Delivery status update

Initial channels may include:

* Email
* In-application notifications
* WhatsApp link-based communication

Direct WhatsApp API integration may be introduced later.

---

# 23. Security Requirements

## 23.1 Administrator authentication

Administrator authentication must support:

* Secure password hashing
* HTTP-only cookies
* Secure cookies in production
* SameSite protection
* Session expiration
* Session revocation
* Password-reset tokens
* Expiring reset links
* Login rate limiting
* Failed-login tracking
* Optional or mandatory two-factor authentication
* Login alerts for suspicious activity

---

## 23.2 Authorization

The platform must implement role-based access control.

Permissions must be checked on the server for every protected operation.

Hiding a button in the interface is not sufficient authorization.

Examples of protected actions include:

* Product creation
* Price changes
* Stock adjustments
* Order cancellation
* Refund processing
* Payment-settings changes
* Staff creation
* Staff deletion
* Content publication
* Report access

---

## 23.3 Input validation

All data must be validated on the server.

Client-side validation should improve usability but must not be relied upon for security.

Validation is required for:

* Product forms
* Customer details
* Checkout
* Payments
* File uploads
* Stock movements
* Quotations
* Order updates
* Search parameters
* Website content

---

## 23.4 File-upload security

Uploaded files must be controlled through:

* Permitted file types
* File-size limits
* Safe generated filenames
* Malware or suspicious-file rejection where supported
* Storage outside the application’s executable directory
* Restricted document access where necessary
* Image processing
* Metadata removal where appropriate

---

## 23.5 Audit logs

The system must record important administrator actions.

Audit events should include:

* User
* Action
* Entity
* Entity identifier
* Previous value where appropriate
* New value where appropriate
* Date and time
* IP address where appropriate
* Device or user-agent information where appropriate

Important audited actions include:

* Price changes
* Stock changes
* Order cancellation
* Refunds
* Payment-setting changes
* User creation
* Permission changes
* Product publication
* Content deletion

Audit records should not be editable through the standard administration interface.

---

## 23.6 Payment security

The platform must not store unnecessary sensitive payment credentials.

Secrets must be stored using secure environment or secret-management mechanisms.

Payment callbacks must be validated and protected against:

* Duplicate callbacks
* Replay
* Unauthorized requests
* Amount mismatch
* Order-reference mismatch

---

## 23.7 Data protection

The platform should follow applicable Kenyan data-protection requirements.

Customer information should be:

* Collected for a clear purpose
* Limited to necessary information
* Protected from unauthorized access
* Retained only as needed
* Exportable or removable where legally appropriate

The website should provide:

* Privacy policy
* Terms and conditions
* Cookie information where required
* Marketing consent controls

---

# 24. Technical Architecture

## 24.1 Application approach

The application will be developed as a modular Next.js monolith.

It will contain:

* Public storefront
* Administration interface
* Server-side business logic
* API routes
* Authentication
* Product management
* Inventory management
* Order management
* Quotation management
* Payment integration
* SEO generation
* Content management

All application code will exist within one repository.

---

## 24.2 Recommended technology stack

Recommended initial stack:

* Next.js
* React
* TypeScript
* PostgreSQL
* Prisma ORM
* Zod or equivalent schema validation
* Tailwind CSS or equivalent design system
* Object storage for media
* Redis only where justified
* Background-job mechanism for asynchronous work
* Cloudflare for DNS, CDN and security controls
* Containerized deployment where appropriate

Specific library versions should be selected and verified during implementation.

---

## 24.3 Suggested code organization

```text
src/
├── app/
│   ├── (storefront)/
│   ├── admin/
│   ├── api/
│   └── auth/
├── modules/
│   ├── catalog/
│   ├── categories/
│   ├── brands/
│   ├── inventory/
│   ├── orders/
│   ├── quotations/
│   ├── customers/
│   ├── payments/
│   ├── content/
│   ├── seo/
│   ├── notifications/
│   ├── reports/
│   └── users/
├── components/
├── infrastructure/
│   ├── database/
│   ├── storage/
│   ├── email/
│   ├── payments/
│   ├── jobs/
│   └── monitoring/
├── lib/
├── styles/
└── types/
```

Each module should own its business rules.

---

## 24.4 Module boundaries

Examples of expected boundaries:

* The order module should not directly overwrite stock quantities.
* The order module should request inventory reservation through the inventory module.
* The payment module should record payments and notify the order module.
* The quotation module should convert accepted quotations through the order module.
* The content module should not directly manipulate order records.
* The storefront should access business logic through controlled server interfaces.

---

## 24.5 Database

PostgreSQL will be used as the primary relational database.

Initial entities may include:

* AdminUser
* Role
* Permission
* UserRole
* Product
* ProductImage
* ProductDocument
* Category
* Brand
* SpecificationTemplate
* SpecificationField
* ProductSpecification
* InventoryItem
* InventoryMovement
* Customer
* CustomerAddress
* Cart
* CartItem
* Order
* OrderItem
* OrderStatusHistory
* Payment
* Shipment
* Quotation
* QuotationItem
* Article
* ArticleCategory
* Banner
* Page
* SeoMetadata
* Redirect
* Notification
* AuditLog
* StoreSetting

No seller, tenant, vendor, commission or marketplace entities should be introduced without a confirmed business requirement.

---

## 24.6 Background processing

Some tasks should be processed outside the customer request-response cycle.

Examples include:

* Email delivery
* Quotation PDF generation
* Invoice generation
* Image resizing
* Sitemap updates
* Search-index updates
* Low-stock notifications
* Payment reconciliation retries
* Expired-cart cleanup
* Expired quotation updates

Background processing may run as a worker from the same repository.

This remains part of the same application and does not require microservices.

---

# 25. Performance Requirements

The website should aim for:

* Fast initial loading
* Responsive interaction
* Efficient product-image loading
* Minimal JavaScript on public pages
* Server-rendered or statically generated SEO pages
* Optimized database queries
* Pagination for large lists
* CDN delivery
* Compressed assets
* Lazy-loaded non-critical images
* Modern image formats
* Effective caching

The public storefront should target strong Core Web Vitals.

Performance must be tested on mobile networks commonly used in Kenya.

---

# 26. Accessibility Requirements

The website should support:

* Keyboard navigation
* Visible focus states
* Sufficient text contrast
* Form labels
* Descriptive error messages
* Alternative text for meaningful images
* Accessible buttons
* Proper heading structure
* Screen-reader-friendly forms
* Touch targets of appropriate size

Accessibility should be considered during component design rather than added after development.

---

# 27. Reliability and Operations

## 27.1 Environments

The project should maintain separate environments for:

* Development
* Staging
* Production

Production customer and order data must not be used casually in development.

---

## 27.2 Backups

The platform must include:

* Automated database backups
* Off-server backup storage
* Defined retention periods
* Object-storage protection or versioning
* Documented restoration procedures
* Periodic restoration tests

---

## 27.3 Monitoring

The production system should monitor:

* Application availability
* Server errors
* Payment errors
* Background-job failures
* Database connectivity
* Slow requests
* Storage failures
* Failed emails
* Security events

---

## 27.4 Logging

Logs should provide enough information to investigate failures without exposing sensitive information.

Passwords, full payment credentials and authentication tokens must never be written to logs.

---

# 28. Reports

Initial reports may include:

* Sales by period
* Orders by status
* Payments by method
* Product sales
* Category sales
* Top-selling products
* Low-stock products
* Out-of-stock products
* Inventory movement
* Quotation conversion
* Customer activity
* Delivery performance

Reports should support:

* Date filtering
* Export where appropriate
* Mobile viewing
* Clear totals
* Permission restrictions

Advanced accounting reporting is outside the initial scope unless separately approved.

---

# 29. Store Settings

The owner should be able to manage global settings including:

* Business name
* Logo
* Contact telephone
* WhatsApp number
* Email address
* Physical address
* County
* Business hours
* Social-media links
* Currency
* Tax configuration
* M-Pesa details
* Bank details
* Delivery settings
* Collection settings
* Warranty policy
* Return policy
* Quotation terms
* Order-notification recipients
* Low-stock threshold defaults
* Default SEO settings

Critical settings should be protected by additional confirmation and restricted permissions.

---

# 30. Initial Release Scope

The first production release should include:

1. Responsive public storefront.
2. Responsive administration dashboard.
3. Product management.
4. Category management.
5. Brand management.
6. Product-image management.
7. Technical specification templates.
8. Product search.
9. Product filtering.
10. Product detail pages.
11. Shopping cart.
12. Guest checkout.
13. Quotation requests.
14. Quotation management.
15. Quotation PDF generation.
16. Order management.
17. Basic payment methods.
18. Inventory movements.
19. Stock reservations.
20. Customer records.
21. Homepage content management.
22. Policies and general pages.
23. Knowledge-centre articles.
24. Automated SEO metadata.
25. Structured data.
26. XML sitemaps.
27. Redirect handling.
28. Administrator authentication.
29. Role-based access.
30. Audit logs.
31. Email notifications.
32. Database backups.
33. Error monitoring.
34. Mobile usability testing.
35. Performance optimization.

---

# 31. Deferred Features

The following features should not block the first production release:

* Native mobile applications
* Marketplace sellers
* Vendor onboarding
* Vendor payouts
* Multi-tenant support
* Multi-store management
* Equipment financing
* Product rentals
* Installer marketplace
* Advanced artificial-intelligence assistant
* Advanced product-comparison engine
* Customer loyalty programme
* Multiple warehouses
* Full accounting
* Supplier procurement
* Automated courier integrations
* International commerce
* Multiple currencies
* Multilingual content
* Customer-subscription plans

These may be considered later only when supported by a clear business need.

---

# 32. Explicitly Out of Scope

The platform is not intended to be:

* A multi-vendor marketplace
* A SaaS product for other merchants
* A complete ERP
* A supplier-management platform
* A general accounting system
* A social-commerce network
* A seller-subscription platform
* A complex warehouse-management system

The architecture should not be burdened with speculative features that are unrelated to the current business.

---

# 33. Key User Journeys

## 33.1 Customer buys an accessory

1. Customer opens the website.
2. Customer searches for a product.
3. Customer reviews product details.
4. Customer adds the product to the cart.
5. Customer enters delivery information.
6. Customer selects a payment method.
7. Customer submits the order.
8. The system creates the order.
9. The business receives a notification.
10. The business confirms and fulfils the order.

---

## 33.2 Customer requests a solar-system quotation

1. Customer opens a solution page.
2. Customer selects the quotation option.
3. Customer provides power requirements and location.
4. Customer submits the request.
5. The business receives a notification.
6. A sales employee reviews the request.
7. The employee creates a quotation.
8. The quotation is shared with the customer.
9. The customer accepts the quotation.
10. The quotation is converted into an order.

---

## 33.3 Owner adds a product from a phone

1. Owner signs into the administration dashboard.
2. Owner selects Products.
3. Owner selects Add Product.
4. Owner enters basic information.
5. Owner selects a category.
6. Relevant specification fields appear.
7. Owner uploads product images.
8. Owner enters price and stock.
9. The system generates a slug and SEO metadata.
10. Owner saves the product as a draft.
11. Owner previews the product.
12. Owner publishes the product.

---

## 33.4 Employee processes a new order

1. Employee receives an order notification.
2. Employee opens the order.
3. Employee reviews payment and delivery information.
4. Employee contacts the customer where necessary.
5. Employee confirms the order.
6. Stock is reserved.
7. Employee prepares the order.
8. Employee marks it ready for dispatch.
9. Employee records dispatch.
10. Employee marks it delivered.

---

# 34. Acceptance Criteria

The first production release will be considered ready when:

* Customers can browse products on mobile and desktop.
* Customers can search and filter products.
* Product pages display structured specifications.
* Customers can place direct orders.
* Customers can request quotations.
* Administrators can add and update products without code changes.
* Administrators can manage products from a smartphone.
* Administrators can process orders.
* Administrators can create and send quotations.
* Inventory movements are recorded.
* Stock reservations work correctly.
* Payment records cannot be duplicated by repeated callbacks.
* Role-based permissions are enforced on the server.
* Critical administrator actions are audited.
* Product, category, brand and article pages have SEO metadata.
* Product structured data is generated correctly.
* XML sitemaps are available.
* Public pages are responsive.
* Administration pages are responsive.
* Automated database backups are configured.
* Error monitoring is enabled.
* Critical checkout and order journeys have been tested.
* Production secrets are not committed to source control.
* Draft products are not publicly accessible.
* Administration pages are excluded from search-engine indexing.
* The owner can complete common daily tasks without technical assistance.

---

# 35. Success Metrics

After launch, product success may be evaluated using:

* Organic search impressions
* Organic search clicks
* Product-page visits
* Search-to-product conversion
* Add-to-cart rate
* Checkout completion rate
* Quotation-request rate
* Quotation-acceptance rate
* WhatsApp inquiry rate
* Order volume
* Revenue
* Average order value
* Repeat customers
* Mobile conversion rate
* Page-loading performance
* Number of products managed without developer support
* Time required to process an order
* Time required to prepare a quotation
* Number of products with complete specifications
* Number of products ranking for relevant search terms

---

# 36. Final Product Direction

The platform should be built as:

> A focused, modern and SEO-driven digital shop for one solar, power and machinery business.

It should not be designed as a marketplace, SaaS platform or speculative multi-vendor system.

The correct implementation approach is:

> One business, one storefront, one administration system, one catalogue, one inventory operation and one modular Next.js codebase.

The platform should remain simple enough for a non-technical owner to manage while being professionally engineered, secure, responsive and capable of supporting long-term business growth.
