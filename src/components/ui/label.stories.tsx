import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    htmlFor: 'input-1',
    children: 'Form Label',
  },
};

export const Required: Story = {
  args: {
    htmlFor: 'input-required',
    children: 'Email Address *',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <input
        id="email"
        type="email"
        placeholder="name@example.com"
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <input
        id="terms"
        type="checkbox"
        className="rounded border-gray-300"
      />
      <Label htmlFor="terms" className="cursor-pointer">
        I agree to the terms and conditions
      </Label>
    </div>
  ),
};

export const WithRadio: Story = {
  render: () => (
    <div className="space-y-2">
      <Label className="text-base font-semibold">Select Option</Label>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input id="option1" type="radio" name="options" />
          <Label htmlFor="option1" className="cursor-pointer font-normal">
            Option 1
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <input id="option2" type="radio" name="options" />
          <Label htmlFor="option2" className="cursor-pointer font-normal">
            Option 2
          </Label>
        </div>
      </div>
    </div>
  ),
};
