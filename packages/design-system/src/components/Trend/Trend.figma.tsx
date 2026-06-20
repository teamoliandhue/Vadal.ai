// Figma Code Connect — maps the Figma `Trend` set (node 196:182). Publish: npx figma connect publish
import figma from '@figma/code-connect';
import { Trend } from './Trend';

figma.connect(Trend, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=196-182', {
  props: {
    value: figma.string('Value'),
    direction: figma.enum('Direction', { Up: 'up', Down: 'down', Flat: 'flat' }),
  },
  example: ({ value, direction }) => <Trend direction={direction} value={value} />,
});
