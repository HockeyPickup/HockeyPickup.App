import { BuySell, Session } from '@/HockeyPickup.Api';
import { Collapse, Group, Paper, Table, Title, UnstyledButton } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import moment from 'moment';
import { useState } from 'react';

interface SessionBuySellsProps {
  session: Session;
}

export const SessionBuySells = ({ session }: SessionBuySellsProps): JSX.Element => {
  const [showLegacyBuySells, setShowLegacyBuySells] = useState(false);

  return (
    <Paper shadow='sm' p='md' mb='xl'>
      <UnstyledButton onClick={() => setShowLegacyBuySells(!showLegacyBuySells)}>
        <Group justify='space-between'>
          <Title order={3}>Legacy Buy/Sells Records</Title>
          <IconChevronRight
            style={{
              transform: showLegacyBuySells ? 'rotate(90deg)' : 'none',
              transition: 'transform 200ms ease',
            }}
          />
        </Group>
      </UnstyledButton>
      <Collapse in={showLegacyBuySells}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Seller</Table.Th>
              <Table.Th>Buyer</Table.Th>
              <Table.Th>Team</Table.Th>
              <Table.Th>Payment Status</Table.Th>
              <Table.Th>Created</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {session.BuySells?.map((buySell: BuySell) => (
              <Table.Tr key={buySell.BuySellId}>
                <Table.Td>
                  {buySell.SellerUserId !== null
                    ? buySell.Seller?.FirstName + ' ' + buySell.Seller?.LastName
                    : '-'}
                </Table.Td>
                <Table.Td>
                  {buySell.BuyerUserId !== null
                    ? buySell.Buyer?.FirstName + ' ' + buySell.Buyer?.LastName
                    : '-'}
                </Table.Td>
                <Table.Td>
                  {buySell.TeamAssignment === 1
                    ? 'Light'
                    : buySell.TeamAssignment === 2
                      ? 'Dark'
                      : '-'}
                </Table.Td>
                <Table.Td>
                  {buySell.PaymentSent ? 'Sent' : 'Pending'} /{' '}
                  {buySell.PaymentReceived ? 'Received' : 'Pending'}
                </Table.Td>
                <Table.Td>
                  {moment.utc(buySell.CreateDateTime).local().format('MM/DD/yyyy, HH:mm')}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Collapse>
    </Paper>
  );
};
