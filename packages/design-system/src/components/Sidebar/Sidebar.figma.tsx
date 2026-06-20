// Figma Code Connect — maps the Figma `Sidebar` organism (node 171:11). Publish: npx figma connect publish
import figma from '@figma/code-connect';
import { Sidebar, NavGroup } from './Sidebar';
import { NavItem } from '../NavItem/NavItem';
import { WorkspaceSwitcher } from '../WorkspaceSwitcher/WorkspaceSwitcher';
import { AIBriefing } from '../AIBriefing/AIBriefing';
import { Health } from '../Health/Health';

figma.connect(Sidebar, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=171-11', {
  example: () => (
    <Sidebar
      workspace={<WorkspaceSwitcher name="oliandhue" meta="12,480 people" />}
      briefing={<AIBriefing />}
      health={<Health value={82} trend={{ direction: 'up', value: '4' }} />}
    >
      <NavGroup>
        <NavItem icon={null} label="Home" active href="/product/home" />
      </NavGroup>
    </Sidebar>
  ),
});
