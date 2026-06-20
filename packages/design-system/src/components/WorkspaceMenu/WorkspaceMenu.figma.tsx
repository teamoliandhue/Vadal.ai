// Figma Code Connect — maps the Figma `Workspace menu` component (node 189:136). Publish: npx figma connect publish
import figma from '@figma/code-connect';
import { WorkspaceMenu, WorkspaceMenuDivider } from './WorkspaceMenu';
import { MenuItem } from '../MenuItem/MenuItem';

figma.connect(WorkspaceMenu, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=189-136', {
  example: () => (
    <WorkspaceMenu name="oliandhue" meta="Enterprise · 12,480 people">
      <MenuItem label="Settings" />
      <MenuItem label="People & teams" />
      <WorkspaceMenuDivider />
      <MenuItem label="Create or join workspace" />
    </WorkspaceMenu>
  ),
});
