import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Card, Row, Badge } from '@edx/paragon';

import { importTaskShape } from './data';
import messages from './messages';

const CourseImportTaskListItem = ({ intl, task }) => {
  let badgeVariant = '';

  switch (task.state.toLowerCase()) {
    case 'successful':
      badgeVariant = 'success';
      break;

    case 'created':
    case 'pending':
    case 'running':
      badgeVariant = 'info';
      break;

    case 'failed':
      badgeVariant = 'danger';
      break;

    default:
      break;
  }

  return (
    <Card className="mt-1 mb-3">
      <Card.Header
        className="library-authoring-course-import-block-card-header"
        title={`Import of ${task.course_id}`}
        subtitle={
          <>
            <Badge variant={badgeVariant}>{task.state}</Badge>
            <span> • </span>
            <span>{task.org}</span>
            <span> • </span>
            <span>{new Date(task.created_at).toLocaleString()}</span>
          </>
        }
      />
    </Card>
  );
};

CourseImportTaskListItem.propTypes = {
  intl: intlShape.isRequired,
  task: importTaskShape.isRequired,
};

export default injectIntl(CourseImportTaskListItem);
