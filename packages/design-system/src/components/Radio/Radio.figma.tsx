// Figma Code Connect — maps the Figma `Radio` component set (node 100:29) to this React component.
// Publish with: npx figma connect publish
import figma from '@figma/code-connect';
import { Radio } from './Radio';

figma.connect(Radio, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=100-29', {
  props: {
    checked: figma.enum('State', { Selected: true }),
    error: figma.enum('State', { Error: true }),
    disabled: figma.enum('State', { Disabled: true }),
    size: figma.enum('Size', { Md: 'md', Sm: 'sm' }),
  },
  example: ({ checked, error, disabled, size }) => (
    <Radio name="cadence" label="Weekly digest" checked={checked} error={error} disabled={disabled} size={size} />
  ),
});
