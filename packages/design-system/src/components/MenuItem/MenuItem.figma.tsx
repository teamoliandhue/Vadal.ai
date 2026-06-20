// Figma Code Connect — maps the Figma `Menu item` set (node 188:133). Publish: npx figma connect publish
import figma from '@figma/code-connect';
import { MenuItem } from './MenuItem';

figma.connect(MenuItem, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=188-133', {
  props: {
    label: figma.string('Label'),
    icon: figma.instance('icon'),
  },
  example: ({ label, icon }) => <MenuItem icon={icon} label={label} />,
});
