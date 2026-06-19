// Figma Code Connect — maps the Figma `Checkbox` component set (node 100:17) to this React component.
// Publish with: npx figma connect publish
import figma from '@figma/code-connect';
import { Checkbox } from './Checkbox';

figma.connect(Checkbox, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=100-17', {
  props: {
    // Figma's single State axis maps onto the behavioural props.
    checked: figma.enum('State', { Checked: true }),
    indeterminate: figma.enum('State', { Indeterminate: true }),
    error: figma.enum('State', { Error: true }),
    disabled: figma.enum('State', { Disabled: true }),
    size: figma.enum('Size', { Md: 'md', Sm: 'sm' }),
  },
  example: ({ checked, indeterminate, error, disabled, size }) => (
    <Checkbox
      label="Email me"
      description="Product updates"
      checked={checked}
      indeterminate={indeterminate}
      error={error}
      disabled={disabled}
      size={size}
    />
  ),
});
