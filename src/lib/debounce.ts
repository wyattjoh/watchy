export function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait = 500,
  maxWait = 1000
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  let lastInvokeTime = Date.now();

  return (...args: Parameters<T>): void => {
    const now = Date.now();
    const elapsed = now - lastInvokeTime;

    const invoke = () => {
      lastInvokeTime = now;
      func(...args);
    };

    clearTimeout(timeout);

    if (elapsed > maxWait) {
      invoke();
    } else {
      timeout = setTimeout(invoke, wait);
    }
  };
}
