# nogl-landing

A full-stack SaaS landing page and application built with Next.js, featuring modern UI components, authentication, and comprehensive integrations.

## 🚀 Features

- Modern Next.js 14 application
- Authentication with NextAuth.js
- Database integration with Prisma
- Payment processing with Stripe, LemonSqueezy, and Paddle
- Responsive design with Tailwind CSS
- Admin dashboard
- User management system
- Blog functionality
- SEO optimization

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe, LemonSqueezy, Paddle
- **CMS**: Ghost
- **Deployment**: Vercel

## 📚 Documentation

**📖 [Complete Documentation Hub](./docs/README.md)**

This project includes comprehensive documentation organized for optimal developer and AI assistant navigation:

- **🏗️ Architecture**: Component structure, design patterns, and system architecture
- **📖 Guides**: Setup guides, implementation guides, and best practices
- **💻 Examples**: Code examples and usage patterns

### Quick Links

- [Component Architecture](./docs/architecture/README.md) - Component structure overview
- [Quick Start Guide](./docs/guides/QUICK_START.md) - Get started quickly
- [Environment Setup](./docs/guides/ENV_SETUP_GUIDE.md) - Environment configuration
- [Code Examples](./docs/examples/IMPORT_EXAMPLES.tsx) - Import/export patterns

## 📦 Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see [Environment Setup Guide](./docs/guides/ENV_SETUP_GUIDE.md))
4. Run database migrations: `npx prisma migrate dev`
5. Start the development server: `npm run dev`

## 🌐 Live Demo

Visit the live application at [your-domain.com]

## 📄 License

This project is licensed under the MIT License.

## Update Logs

📆 13 June 2024

- Added Paddle Integration
- Added Cancel Subscription API on LemonSqueezy integration
- Separted Stripe, LemonSqueezy and Paddle Billing pages
- Added/Updated files and folders
  **Update Guide**

1. api -> lemon-squeezy (all the apis updated)
2. libs -> auth.ts
3. Stripe -> StripeBilling, Paddle -> PaddleBilling, LemonSqueezy -> LsBilling

📆 26 May 2024

- Added User Impersonation
- Added Invitation from admin dashboard
- Added/Updated files and folders
  **Update Guide**

1. prisma → schema.prisma

2. src → app → user → invite

3. components → Auth → InvitedSignin

4. components → Admin → Users → UsersActions.tsx and UserTopbar.tsx

5. libs → auth.ts

📆 15 May 2024

- Added LemonSqueezy Integration

📆 07 April 2024

- Fixed mobile nav toggle issue
- Removed breadcrumb from single blog page
- Updated Layout (to prevent client rendering):
  - moved pre-loader logic to PreLoader File
  - moved header & footer to HeaderWrapper & FooterWrapper
