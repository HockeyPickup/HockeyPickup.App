import { Modal, Paper, Stack, Table, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useTitle } from '../layouts/TitleContext';

interface Newsletter {
  id: string;
  title: string;
  date: string;
  url: string;
}

export const NewslettersPage = () => {
  const { setPageInfo } = useTitle();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [selectedNewsletter, setSelectedNewsletter] = useState<string | null>(null);

  useEffect(() => {
    setPageInfo('Newsletters', 'Newsletter Archive');
  }, [setPageInfo]);

  useEffect(() => {
    fetch('/static/newsletters.json')
      .then((res) => res.json())
      .then((data) => {
        // Sort by id descending (assuming id is like "10", "9", etc.)
        const sortedNewsletters = data.newsletters.sort(
          (a: Newsletter, b: Newsletter) => parseInt(b.id) - parseInt(a.id),
        );
        setNewsletters(sortedNewsletters);
      });
  }, []);

  return (
    <Paper shadow='sm' p='md'>
      <Stack>
        <Title order={3}>Newsletter Archive</Title>
        <Table highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Title</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {newsletters.map((newsletter) => (
              <Table.Tr
                key={newsletter.id}
                onClick={() => setSelectedNewsletter(newsletter.url)}
                style={{ cursor: 'pointer' }}
              >
                <Table.Td>{newsletter.date}</Table.Td>
                <Table.Td>{newsletter.title}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>

      <Modal
        opened={!!selectedNewsletter}
        onClose={() => setSelectedNewsletter(null)}
        size='90%'
        padding={0}
        title={newsletters.find((n) => n.url === selectedNewsletter)?.title}
        styles={{
          body: {
            backgroundColor: 'var(--mantine-color-dark-7)', // Uses Mantine's dark theme color
          },
          content: {
            backgroundColor: 'var(--mantine-color-dark-7)',
          },
          header: {
            justifyContent: 'center',
          },
          title: {
            width: '100%',
            textAlign: 'center',
          },
        }}
      >
        {selectedNewsletter && (
          <iframe
            src={selectedNewsletter}
            style={{
              width: '100%',
              height: '90vh',
              border: 'none',
              backgroundColor: 'var(--mantine-color-dark-7)',
            }}
            title='Newsletter Content'
          />
        )}
      </Modal>
    </Paper>
  );
};
