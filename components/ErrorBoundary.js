'use client';

import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 text-white p-8">
                    <h1 className="text-2xl mb-4">Something went wrong</h1>
                    <pre className="bg-gray-800 p-4 rounded overflow-auto">
                        {this.state.error?.toString()}
                    </pre>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 bg-purple-500 px-4 py-2 rounded"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 