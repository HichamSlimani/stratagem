'use client';

import { Component, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message: string;
}

// A hard boundary so a malformed read or render never takes the whole arena
// down with a white screen. It offers a local reset instead.
export class DataErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: String((error as { message?: string })?.message ?? error) };
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto my-12 flex max-w-lg flex-col items-center rounded-2xl border border-p2/40 bg-arena-panel/70 p-8 text-center">
          <h3 className="mb-2 font-display text-2xl tracking-wide text-arena-chalk">
            A panel buckled mid-bout
          </h3>
          <p className="mb-5 text-sm leading-relaxed text-arena-fog">
            Something in the arena view tripped. Resetting will rebuild it from the live chain.
          </p>
          <button
            onClick={this.reset}
            className="inline-flex items-center gap-2 rounded-lg bg-p1 px-4 py-2 text-sm font-bold text-black transition hover:bg-p1/90"
          >
            <RefreshCw size={15} /> Rebuild the view
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
