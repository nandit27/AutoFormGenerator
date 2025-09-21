# AutoFormGenerator

A powerful React-based form builder application that enables dynamic form generation with AI integration.

## Features

- **Dynamic Form Builder**: Create complex forms with drag-and-drop functionality
- **AI Integration**: Support for multiple AI providers (Groq, OpenAI, etc.)
- **Google Forms Integration**: Connect and sync with Google Forms
- **Real-time Preview**: See your forms as you build them
- **Schema Generation**: Automatically generate form schemas
- **Analytics Dashboard**: Track form performance and submissions
- **Responsive Design**: Built with Tailwind CSS for mobile-first design

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Query (TanStack Query)
- **Animations**: Framer Motion
- **Authentication**: Google OAuth integration
- **APIs**: Google Forms API, various LLM providers

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Console project (for Google Forms integration)
- AI provider API keys (Groq, OpenAI, etc.)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nandit27/AutoFormGenerator.git
cd AutoFormGenerator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your API keys and configuration.

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# AI Provider Configuration
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application Configuration
VITE_API_BASE_URL=http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Nandit Kalaria** - [@nandit27](https://github.com/nandit27)
