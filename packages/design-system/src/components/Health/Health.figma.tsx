// Figma Code Connect — maps the Figma `Health` set (node 198:216). Publish: npx figma connect publish
import figma from '@figma/code-connect';
import { Health } from './Health';

figma.connect(Health, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=198-216', {
  props: {
    value: figma.string('Value'),
    label: figma.string('Label'),
  },
  example: ({ value, label }) => <Health value={value} label={label} trend={{ direction: 'up', value: '4' }} />,
});
