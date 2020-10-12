import { defineMessages } from '@edx/frontend-platform/i18n';
import { messageGuard } from '../common/data';

const messages = defineMessages({
  'library.header.settings.menu': {
    id: 'library.header.settings.menu',
    defaultMessage: 'Settings',
    description: 'Title text for the settings menu.',
  },
  'library.header.settings.details': {
    id: 'library.header.settings.details',
    defaultMessage: 'Details',
    description: 'Text for the details item in the settings menu.',
  },
  'library.header.settings.access': {
    id: 'library.header.settings.access',
    defaultMessage: 'User Access',
    description: 'Text for the user access permissions item in the settings menu.',
  },
});

export default messageGuard(messages);
