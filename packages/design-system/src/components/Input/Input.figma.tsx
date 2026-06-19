// Figma Code Connect — maps the Figma `Input` component set (node 78:133) to this React component.
// Publish with: npx figma connect publish
import figma from '@figma/code-connect';
import { Input } from './Input';

figma.connect(Input, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=78-133', {
  props: {
    label: figma.string('Label'),
    placeholder: figma.string('Value'),
    helper: figma.string('Helper'),
    required: figma.boolean('Required'),
    error: figma.enum('State', { Error: true }),
    disabled: figma.enum('State', { Disabled: true }),
  },
  example: ({ label, placeholder, helper, required, error, disabled }) => (
    <Input label={label} placeholder={placeholder} helper={helper} required={required} error={error} disabled={disabled} />
  ),
});
