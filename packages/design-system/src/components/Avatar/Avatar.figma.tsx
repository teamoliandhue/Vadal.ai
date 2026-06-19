// Figma Code Connect — maps the Figma `Avatar` component set (node 99:74) to this React component.
// Publish with: npx figma connect publish
import figma from '@figma/code-connect';
import { Avatar } from './Avatar';

figma.connect(Avatar, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=99-74', {
  props: {
    size: figma.enum('Size', { Xs: 'xs', Sm: 'sm', Md: 'md', Lg: 'lg', Xl: 'xl' }),
    status: figma.enum('Status', {
      Online: 'online',
      Busy: 'busy',
      Away: 'away',
      Offline: 'offline',
      None: undefined,
    }),
  },
  example: ({ size, status }) => <Avatar name="Jane Smith" size={size} status={status} />,
});
