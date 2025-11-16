import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './checkbox';
import { Label } from './label';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'checkbox-default',
  },
};

export const Checked: Story = {
  args: {
    id: 'checkbox-checked',
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    id: 'checkbox-disabled',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    id: 'checkbox-disabled-checked',
    disabled: true,
    defaultChecked: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms" className="font-normal cursor-pointer">
        I agree to the terms and conditions
      </Label>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox id="option1" />
        <Label htmlFor="option1" className="font-normal cursor-pointer">
          Accept newsletters
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option2" defaultChecked />
        <Label htmlFor="option2" className="font-normal cursor-pointer">
          Receive notifications
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option3" />
        <Label htmlFor="option3" className="font-normal cursor-pointer">
          Share my profile publicly
        </Label>
      </div>
    </div>
  ),
};

export const Form: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-3">Listing Preferences</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="featured" />
            <Label htmlFor="featured" className="font-normal cursor-pointer">
              Feature this listing (€5)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="highlight" defaultChecked />
            <Label htmlFor="highlight" className="font-normal cursor-pointer">
              Highlight in search results
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="verify" />
            <Label htmlFor="verify" className="font-normal cursor-pointer">
              Verify product authenticity
            </Label>
          </div>
        </div>
      </div>
    </div>
  ),
};
