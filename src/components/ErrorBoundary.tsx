import { Component, type ComponentChildren } from "preact";

export class ErrorBoundary extends Component<
  { children: ComponentChildren },
  { hasError: boolean }
> {
  constructor(p: any) {
    super(p);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(e: any, i: any) {
    console.error("ErrorBoundary", e, i);
  }

  render() {
    return this.state.hasError ? (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-white-70 mt-2">Please refresh the page.</p>
      </div>
    ) : (
      this.props.children
    );
  }
}
