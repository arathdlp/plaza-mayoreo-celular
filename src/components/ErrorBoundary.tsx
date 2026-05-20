"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[APP ERROR]", error.message, errorInfo.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-gray-50 px-6 text-center text-[#111827]">
        <h1 className="text-2xl font-semibold">Algo salió mal</h1>
        <p className="mt-3 max-w-md text-sm text-gray-600">
          No pudimos cargar esta pantalla correctamente. Reintenta o vuelve al inicio.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#0066FF] px-6 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-800"
          >
            Volver al inicio
          </a>
        </div>
        <p className="mt-5 max-w-md break-words text-xs text-gray-400">
          {this.state.error.message}
        </p>
      </main>
    );
  }
}
