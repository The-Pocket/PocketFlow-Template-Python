# AI Novel Writer Frontend

A modern, responsive web application built with Next.js 14+ and Vercel AI SDK 5 that provides an intuitive interface for the AI-powered novel writing system.

## Features

- **Real-time AI Assistance**: Streaming AI suggestions using Vercel AI SDK 5
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Built with Tailwind CSS and Radix UI components
- **TypeScript**: Full type safety and excellent developer experience
- **Code Quality**: ESLint, Prettier, and Husky for consistent code formatting

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **AI Integration**: Vercel AI SDK 5 with OpenAI GPT-4
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-novel-writer-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
BACKEND_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Dashboard page
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   ├── layout/        # Layout components
│   ├── editor/        # Text editor components
│   └── ai/            # AI-related components
├── lib/               # Utility functions
├── types/             # TypeScript type definitions
└── hooks/             # Custom React hooks
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Key Components

### AI Integration

The application uses Vercel AI SDK 5 for real-time AI interactions:

- **Chat Interface**: Real-time conversation with AI writing assistant
- **Text Completion**: AI-powered text continuation and suggestions
- **Streaming Responses**: Live updates as AI generates content

### UI Components

Built with Radix UI primitives for accessibility:

- **Button**: Customizable button component with variants
- **Input**: Form input with validation support
- **Card**: Container component for content sections
- **Dialog**: Modal dialogs for forms and confirmations

### Layout System

- **Header**: Navigation and user controls
- **Sidebar**: Main navigation menu
- **Responsive**: Mobile-first responsive design

## Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Implement proper error boundaries

### Component Structure

- Keep components small and focused
- Use composition over inheritance
- Implement proper TypeScript interfaces
- Add proper accessibility attributes

### State Management

- Use Zustand for global state
- Use TanStack Query for server state
- Keep local state minimal
- Implement proper loading states

## Deployment

The application is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is part of the AI Novel Writer system built with the Pocket Flow framework.
