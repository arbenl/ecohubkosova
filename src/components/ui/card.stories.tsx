import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content area</p>
      </CardContent>
      <CardFooter>
        <Button>Click me</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card with just header and content</p>
      </CardContent>
    </Card>
  ),
};

export const Product: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Recycled Plastic Material</CardTitle>
        <CardDescription>Premium Quality - 5kg Packs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            High-quality recycled plastic suitable for 3D printing and manufacturing.
          </p>
          <p className="text-2xl font-bold text-eco-green">$25.50 / kg</p>
          <p className="text-sm text-gray-500">Location: Prishtinë, Kosovo</p>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" className="flex-1">
          View Details
        </Button>
        <Button className="flex-1 eco-gradient text-white">
          Contact Seller
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const WithLongContent: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Comprehensive Card</CardTitle>
        <CardDescription>This card demonstrates longer content handling</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Features:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>High quality materials</li>
            <li>Eco-friendly production</li>
            <li>Fast delivery available</li>
            <li>Bulk discount options</li>
          </ul>
        </div>
        <p className="text-sm text-gray-600">
          This is a longer description that shows how the card handles more content while maintaining its structure and appearance.
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1">
          Save
        </Button>
        <Button className="flex-1 eco-gradient text-white">
          Contact
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Minimal: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardContent className="pt-6">
        <p>Minimal card with just content</p>
      </CardContent>
    </Card>
  ),
};
