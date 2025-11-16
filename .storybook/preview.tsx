import type { Preview, StoryFn } from '@storybook/react';
import '../src/app/globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    docs: {
      canvas: { sourceState: 'shown' },
    },
  },
  decorators: [
    (Story: StoryFn) => (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;

