import { ActionIcon, Button, Collapse, CopyButton, Group, Stack, Text } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { JSX, useState } from 'react';

interface EmailListProps {
  getEmails: () => string;
}

export const EmailList = ({ getEmails }: EmailListProps): JSX.Element => {
  const [showEmails, setShowEmails] = useState(false);

  return (
    <Stack mt='xl'>
      <Group align='center'>
        <Button onClick={() => setShowEmails((prev) => !prev)}>
          {showEmails ? 'Hide Emails' : 'Show Emails'}
        </Button>
      </Group>
      <Collapse in={showEmails}>
        <Group align='center'>
          <Text size='sm'>Emails:</Text>
          <CopyButton value={getEmails()}>
            {({ copied, copy }) => (
              <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </ActionIcon>
            )}
          </CopyButton>
        </Group>
        <Text size='xs' c='dimmed' style={{ whiteSpace: 'pre-line' }}>
          {getEmails()}
        </Text>
      </Collapse>
    </Stack>
  );
};
