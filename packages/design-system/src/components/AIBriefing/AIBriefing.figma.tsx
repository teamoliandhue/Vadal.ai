// Figma Code Connect — maps the Figma `AI briefing` set (node 197:208). Publish: npx figma connect publish
import figma from '@figma/code-connect';
import { AIBriefing } from './AIBriefing';

figma.connect(AIBriefing, 'https://www.figma.com/design/b6Jb1ttGwnOOD3LYZ9kWJk/Vadal.ai?node-id=197-208', {
  props: {
    title: figma.string('Title'),
    subtitle: figma.string('Subtitle'),
    isNew: figma.boolean('New'),
  },
  example: ({ title, subtitle, isNew }) => <AIBriefing title={title} subtitle={subtitle} isNew={isNew} />,
});
