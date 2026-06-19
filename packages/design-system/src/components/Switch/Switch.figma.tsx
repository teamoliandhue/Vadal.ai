// Figma Code Connect — maps the Figma `Switch` component set (node 100:47) to this React component.
// Publish with: npx figma connect publish
import figma from '@figma/code-connect';
import { Switch } from './Switch';

figma.connect(Switch, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=100-47', {
  props: {
    checked: figma.enum('On', { On: true, Off: false }),
    disabled: figma.enum('State', { Disabled: true }),
    size: figma.enum('Size', { Md: 'md', Sm: 'sm' }),
  },
  example: ({ checked, disabled, size }) => (
    <Switch label="Accepting new clients" checked={checked} disabled={disabled} size={size} />
  ),
});
