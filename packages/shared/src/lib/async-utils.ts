/**
 * Wait for the browser to repaint before continuing.
 * Useful when you need to show a loading state before a heavy operation.
 */
export const waitForRepaint = (): Promise<void> => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      // Double RAF ensures the browser has actually painted
      requestAnimationFrame(() => resolve());
    });
  });
};
