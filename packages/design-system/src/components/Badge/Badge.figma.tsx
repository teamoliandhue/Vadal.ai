// Figma Code Connect — maps the Figma `Badge` component set (node 96:2) to this React component,
// so Dev Mode shows real code and variant renames are caught. Publish with: npx figma connect publish
import figma from '@figma/code-connect';
import { Badge } from './Badge';

figma.connect(Badge, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=96-2', {
  props: {
    label: figma.string('Label'),
    tone: figma.enum('Tone', {
      Neutral: 'neutral',
      Brand: 'brand',
      Success: 'success',
      Warning: 'warning',
      Danger: 'danger',
      Info: 'info',
    }),
    variant: figma.enum('Variant', { Soft: 'soft', Outline: 'outline' }),
    size: figma.enum('Size', { Md: 'md', Sm: 'sm' }),
  },
  example: ({ label, tone, variant, size }) => (
    <Badge tone={tone} variant={variant} size={size}>
      {label}
    </Badge>
  ),
});
