// Figma Code Connect — maps the Figma `Avatar` component set (node 126:2) to this React component.
// Type (Photo/Initials/Icon) maps onto the content props (src / name / icon). Publish: npx figma connect publish
import figma from '@figma/code-connect';
import { Avatar } from './Avatar';

figma.connect(Avatar, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=126-2', {
  props: {
    size: figma.enum('Size', { Sm: 'sm', Md: 'md', Lg: 'lg', Xl: 'xl' }),
    name: figma.string('Initials'),
    ring: figma.boolean('Ring'),
    notification: figma.boolean('Notification'),
    status: figma.boolean('Status', { true: 'online', false: undefined }),
  },
  example: ({ size, name, ring, notification, status }) => (
    <Avatar size={size} name={name} ring={ring} notification={notification} status={status} />
  ),
});
