// Figma Code Connect — maps the Figma `Nav item` set (node 169:38). Publish: npx figma connect publish
import figma from '@figma/code-connect';
import { NavItem } from './NavItem';

figma.connect(NavItem, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=169-38', {
  props: {
    label: figma.string('Label'),
    icon: figma.instance('icon'),
    count: figma.boolean('Count', { true: figma.string('Count value'), false: undefined }),
    active: figma.enum('State', { Active: true, Default: false, Hover: false }),
  },
  example: ({ label, icon, count, active }) => (
    <NavItem icon={icon} label={label} count={count} active={active} href="#" />
  ),
});
