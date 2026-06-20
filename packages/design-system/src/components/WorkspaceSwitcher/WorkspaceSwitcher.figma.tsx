// Figma Code Connect — maps the Figma `Workspace switcher` set (node 180:351). Publish: npx figma connect publish
import figma from '@figma/code-connect';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

figma.connect(WorkspaceSwitcher, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=180-351', {
  props: {
    open: figma.enum('State', { Open: true }),
  },
  example: ({ open }) => <WorkspaceSwitcher name="oliandhue" meta="12,480 people" open={open} />,
});
