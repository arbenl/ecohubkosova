import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { AlertCircle, CheckCircle2, Info as InfoIcon, AlertTriangle } from 'lucide-react';

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>You can add components to your app using the code below.</AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-900">Success!</AlertTitle>
      <AlertDescription className="text-green-800">
        Your listing has been created successfully and is now live on the marketplace.
      </AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-900">Warning</AlertTitle>
      <AlertDescription className="text-yellow-800">
        This listing will expire in 7 days. Please update it to keep it active.
      </AlertDescription>
    </Alert>
  ),
};

export const Error: Story = {
  render: () => (
    <Alert className="border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-900">Error</AlertTitle>
      <AlertDescription className="text-red-800">
        Failed to save your listing. Please check all fields and try again.
      </AlertDescription>
    </Alert>
  ),
};

export const Information: Story = {
  render: () => (
    <Alert className="border-blue-200 bg-blue-50">
      <InfoIcon className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900">Information</AlertTitle>
      <AlertDescription className="text-blue-800">
        New marketplace features are now available. Check your account settings to enable them.
      </AlertDescription>
    </Alert>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Note</AlertTitle>
        <AlertDescription>This is a standard alert message.</AlertDescription>
      </Alert>
      
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900">Success</AlertTitle>
        <AlertDescription className="text-green-800">Operation completed successfully.</AlertDescription>
      </Alert>
      
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-900">Error</AlertTitle>
        <AlertDescription className="text-red-800">An error occurred during processing.</AlertDescription>
      </Alert>
    </div>
  ),
};
