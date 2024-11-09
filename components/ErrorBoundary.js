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
                    <div className="max-w-2xl mx-auto text-center">
                        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                        <pre className="bg-gray-800 p-4 rounded-lg overflow-auto text-left mb-4">
                            {this.state.error?.toString()}
                        </pre>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="bg-purple-500 px-4 py-2 rounded hover:bg-purple-600"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 