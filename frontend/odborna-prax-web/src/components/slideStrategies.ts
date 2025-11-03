export type SlideStrategy = {
  next: (current: number, total: number) => number;
  prev: (current: number, total: number) => number;
};

export const manualStrategy: SlideStrategy = {
  next: (current, total) => (current + 1) % total,
  prev: (current, total) => (current - 1 + total) % total,
};

export const autoStrategy = (interval: number): SlideStrategy => ({
  next: (current, total) => (current + 1) % total,
  prev: (current, total) => (current - 1 + total) % total,
});
