// Figma Code Connect — maps the Figma `Button` component set (node 67:293) to this React component,
// so Dev Mode shows real code and prop/variant renames are caught. Publish with: npx figma connect publish
import figma from '@figma/code-connect';
import { Button } from './Button';

figma.connect(Button, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=67-293', {
  props: {
    label: figma.string('Label'),
    variant: figma.enum('Type', {
      Primary: 'primary',
      Brand: 'brand',
      Secondary: 'secondary',
      Tertiary: 'tertiary',
      Ghost: 'ghost',
      Destructive: 'destructive',
      AI: 'ai',
    }),
    // State=Disabled/Loading map onto behavioural props; hover/active/focus are runtime states.
    disabled: figma.enum('State', { Disabled: true }),
    loading: figma.enum('State', { Loading: true }),
    leadingIcon: figma.boolean('Leading icon', { true: figma.instance('Leading swap'), false: undefined }),
    trailingIcon: figma.boolean('Trailing icon', { true: figma.instance('Trailing swap'), false: undefined }),
  },
  example: ({ label, variant, disabled, loading, leadingIcon, trailingIcon }) => (
    <Button variant={variant} disabled={disabled} loading={loading} leadingIcon={leadingIcon} trailingIcon={trailingIcon}>
      {label}
    </Button>
  ),
});
