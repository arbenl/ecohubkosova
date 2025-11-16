import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Destructive',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Multiple: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge>Material</Badge>
      <Badge variant="secondary">In Stock</Badge>
      <Badge variant="outline">Available</Badge>
      <Badge variant="destructive">Sold Out</Badge>
      <Badge>Eco-Friendly</Badge>
      <Badge variant="secondary">Premium</Badge>
    </div>
  ),
};

export const WithStatus: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span>Status:</span>
        <Badge>Active</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Category:</span>
        <Badge variant="outline">Materiale</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Availability:</span>
        <Badge variant="secondary">50 units</Badge>
      </div>
    </div>
  ),
};
