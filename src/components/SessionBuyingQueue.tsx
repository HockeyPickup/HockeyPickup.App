import styles from '@/App.module.css';
import { SessionDetailedResponse } from '@/HockeyPickup.Api';
import { Paper, Table, Text, Title } from '@mantine/core';
import { JSX } from 'react';

interface SessionBuyingQueueProps {
  session: SessionDetailedResponse;
}

export const SessionBuyingQueue = ({ session }: SessionBuyingQueueProps): JSX.Element => {
  return (
    <Paper shadow='sm' p='md'>
      <Title order={3} mb='md'>
        Buying Queue
      </Title>
      <Table striped highlightOnHover className={styles.table}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Seller</Table.Th>
            <Table.Th>Buyer</Table.Th>
            <Table.Th>Team</Table.Th>
            <Table.Th>Queue Position</Table.Th>
            <Table.Th>Payment</Table.Th>
            <Table.Th>Notes</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {session.BuyingQueues?.map((queue) => (
            <Table.Tr key={queue.BuySellId}>
              <Table.Td>{queue.SellerName ?? '-'}</Table.Td>
              <Table.Td>{queue.BuyerName ?? '-'}</Table.Td>
              <Table.Td>
                {queue.TeamAssignment === 1 ? 'Light' : queue.TeamAssignment === 2 ? 'Dark' : '-'}
              </Table.Td>
              <Table.Td>{queue.QueueStatus}</Table.Td>
              <Table.Td>
                {queue.TransactionStatus === 'Looking to Buy'
                  ? '-'
                  : `${queue.PaymentSent ? 'Sent' : 'Pending'} / ${
                      queue.PaymentReceived ? 'Received' : 'Pending'
                    }`}
              </Table.Td>
              <Table.Td>
                {queue.SellerNote && <Text size='xs'>Seller: {queue.SellerNote}</Text>}
                {queue.BuyerNote && <Text size='xs'>Buyer: {queue.BuyerNote}</Text>}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
};
