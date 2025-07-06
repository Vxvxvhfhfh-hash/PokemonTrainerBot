# Pokémon WhatsApp Bot

## Overview

This is a full-stack web application for managing a Pokémon-themed WhatsApp bot. The application provides a modern dashboard interface for administering the bot, managing Pokémon cards, monitoring user interactions, and testing bot functionality. The system allows trainers to interact with the bot through WhatsApp to collect cards, participate in duels, and engage with the Pokémon universe.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for client-side builds
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom Pokémon and WhatsApp color schemes
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket integration for live updates

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **WhatsApp Integration**: whatsapp-web.js library with puppeteer
- **Real-time Communication**: WebSocket server for client-server communication
- **Session Management**: PostgreSQL-backed session storage

### Database Schema
The system uses a relational database with the following core entities:
- **Users**: Administrative users for the dashboard
- **Trainers**: WhatsApp users who interact with the bot
- **Pokemon Cards**: Card definitions with metadata (name, type, level, rarity)
- **Card Distributions**: Tracks which cards have been given to which trainers
- **Duels**: Manages trainer battles and game sessions
- **Bot Sessions**: Stores WhatsApp connection state and QR codes

## Key Components

### Dashboard Interface
- **Multi-section Dashboard**: Statistics overview, connection management, card administration, command testing, and live chat simulation
- **Real-time Statistics**: Live tracking of active trainers, distributed cards, and ongoing duels
- **Responsive Design**: Mobile-friendly interface with adaptive layouts

### WhatsApp Bot Management
- **Connection Management**: QR code generation and display for WhatsApp Web authentication
- **Message Processing**: Handles incoming WhatsApp messages and processes bot commands
- **Real-time Status**: Live connection status monitoring with WebSocket updates

### Card Management System
- **CRUD Operations**: Full create, read, update, delete functionality for Pokémon cards
- **Card Distribution**: Automated card distribution to trainers
- **Rarity System**: Support for different card rarity levels
- **Image Support**: Card image URL storage and display

### Command Testing
- **Simulator Interface**: Test bot commands without sending actual WhatsApp messages
- **Test Scenarios**: Predefined test cases for new trainer registration and card distribution
- **Debug Output**: Detailed logging and response visualization

## Data Flow

### Bot Message Processing
1. WhatsApp message received via whatsapp-web.js
2. Message parsed and validated
3. Command logic executed (trainer registration, card distribution, duel management)
4. Database operations performed via Drizzle ORM
5. Response sent back to WhatsApp user
6. Real-time updates broadcasted to dashboard via WebSocket

### Dashboard Operations
1. User interacts with dashboard interface
2. API requests sent to Express backend
3. Database queries executed via Drizzle ORM
4. Results returned to frontend via React Query
5. UI updates reflect changes in real-time
6. WebSocket connection maintains live status updates

## External Dependencies

### Core Libraries
- **whatsapp-web.js**: WhatsApp Web API integration
- **@neondatabase/serverless**: Neon Database driver
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI components
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Fast JavaScript bundler for production
- **Replit Integration**: Development environment plugins

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon Database for both development and production
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend**: Vite builds optimized React application to `dist/public`
- **Backend**: ESBuild bundles Node.js server to `dist/index.js`
- **Static Assets**: Served directly by Express in production
- **Process Management**: Single Node.js process serving both API and static files

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Connection**: Serverless PostgreSQL via Neon Database
- **Session Storage**: PostgreSQL-backed session management

## Changelog

```
Changelog:
- July 06, 2025. Initial setup with in-memory storage
- July 06, 2025. Added PostgreSQL database integration
  - Migrated from MemStorage to DatabaseStorage
  - Added database relations for all entities
  - Successfully pushed schema to PostgreSQL
  - Maintained all existing functionality with persistent storage
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```