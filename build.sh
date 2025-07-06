#!/bin/bash

# Build script for Vercel deployment

echo "Building for Vercel deployment..."

# Install dependencies
npm install

# Build the client
echo "Building client..."
npm run build

# Push database schema if needed
echo "Pushing database schema..."
npm run db:push

echo "Build completed successfully!"